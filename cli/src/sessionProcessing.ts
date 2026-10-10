/**
 * Single-session parsing shared by the CLI commands and the library entry point
 * (`@rajbos/ai-engineering-fluency/session`).
 *
 * Kept free of console output, chalk and commander so the library bundle stays small and
 * side-effect free: everything here is a thin consumer of the shared modules in ../../src
 * (see AGENTS.md, "CLI Must Reuse Shared Functions").
 */
import * as fs from 'fs';
import * as path from 'path';
import { buildAdapterRegistry, createDataAccessInstances } from '../../src/adapters';
import type { IEcosystemAdapter } from '../../src/ecosystemAdapter';
import { isMcpTool, extractMcpServerName, resolveDebugLogCandidatePaths } from '../../src/workspaceHelpers';
import { parseSessionFileContent } from '../../src/sessionParser';
import { estimateTokensFromText, getModelFromRequest, isJsonlContent, estimateTokensFromJsonlSession, extractAllTokensFromDebugLog } from '../../src/tokenEstimation';
import { extractCopilotCliSessionId, getCopilotCliExactUsage } from '../../src/copilotCliOtel';
import { extractDailyFractions } from '../../src/dailyAttribution';
import { toLocalDayKey } from '../../src/utils/dayKeys';
import { isJetBrainsSessionPath } from '../../src/adapters/adapterPredicates';
import { parseJetBrainsPartition } from '../../src/jetbrains';
import type { ModelUsage } from '../../src/types';
import { getModelUsageFromSession } from '../../src/usageAnalysis';
import { preserveAutoRouting, reconcileModelUsageToActualTokens } from '../../src/statsHelpers';
import * as vscodeStub from './vscode-stub';
import { type SessionData, getEditorSourceFromPath } from './analysis';

import tokenEstimatorsData from '../../src/tokenEstimators.json';
import modelPricingData from '../../src/modelPricing.json';

export const tokenEstimators: { [key: string]: number } = tokenEstimatorsData.estimators;
export const modelPricing = modelPricingData.pricing as { [key: string]: any };

/** Quiet by default: parsing problems surface as a null result, not console output. */
const warn = (_msg: string) => { /* quiet by default */ };

/** Where processSessionFile looks up and stores parsed results, keyed by path + mtime + size. */
export interface SessionDataCache {
	get(filePath: string, mtime: number, size: number): SessionData | null;
	set(filePath: string, mtime: number, size: number, data: SessionData): void;
}

const noCache: SessionDataCache = { get: () => null, set: () => { /* no-op */ } };

export interface ProcessSessionFileOptions {
	/** Print debug-log lookups to stderr (CLI --verbose only). */
	verbose?: boolean;
	/** Parsed-result cache; defaults to none. */
	cache?: SessionDataCache;
}

/** Synchronous lazy-initialized ecosystem registry — created once on first use. */
let _ecosystems: IEcosystemAdapter[] | null = null;

/** Returns the shared ecosystem adapter registry, creating it on first call. */
export function getEcosystems(): IEcosystemAdapter[] {
	if (_ecosystems) { return _ecosystems; }
	const fakeUri = vscodeStub.Uri.file(__dirname);
	_ecosystems = buildAdapterRegistry({
		...createDataAccessInstances(fakeUri as any),
		estimateTokens: (t, m) => estimateTokensFromText(t, m ?? 'gpt-4', tokenEstimators),
		isMcpTool,
		extractMcpServerName,
	});
	return _ecosystems;
}
/**
 * Token estimation wrapper that uses the shared tokenEstimators data.
 */
function estimateTokens(text: string, model?: string): number {
	return estimateTokensFromText(text, model || 'gpt-4', tokenEstimators);
}

/**
 * Model resolver wrapper.
 */
function resolveModel(request: any): string {
	return getModelFromRequest(request, modelPricing);
}

/**
 * Stat a session file, handling DB virtual paths (OpenCode and Crush).
 * Virtual DB paths are resolved to the actual DB file.
 */
export async function statSessionFile(filePath: string): Promise<fs.Stats> {
	const eco = getEcosystems().find(e => e.handles(filePath));
	if (eco) { return eco.stat(filePath); }
	return fs.promises.stat(filePath);
}

/**
 * Read token counts from a Copilot Chat debug log file for a given session file.
 *
 * Agent-mode sessions make multiple LLM API calls per user turn. Only the last
 * call's tokens are stored in the chat session file; the debug log records every
 * call. Using debug log data gives the true session total, matching VS Code's behavior.
 *
 * Returns null if no debug log exists or if no llm_request events are found.
 */
export async function readDebugLogTokensForSession(sessionFilePath: string, verbose = false): Promise<{
	inputTokens: number; outputTokens: number; cachedTokens: number;
	modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }>;
	copilotNanoAiu: number;
} | null> {
	// Shared with the VS Code extension: returns undefined unless the file is UUID-named
	// inside workspaceStorage/<hash>, and keeps the platform's native separators.
	const candidatePaths = resolveDebugLogCandidatePaths(sessionFilePath);
	if (!candidatePaths) { return null; }
	const sessionId = path.basename(sessionFilePath, path.extname(sessionFilePath));

	for (const debugLogPath of candidatePaths) {
		try {
			const content = await fs.promises.readFile(debugLogPath, 'utf8');
			const result = extractAllTokensFromDebugLog(content);
			if (result) {
				if (verbose) {
					console.error(`  ✓ Found debug log: ${sessionId} (tokens: ${result.inputTokens + result.outputTokens})`);
				}
				return result;
			}
		} catch { /* file doesn't exist — try next variant */ }
	}
	if (verbose) {
		console.error(`  ✗ No debug log found: ${sessionId}`);
	}
	return null;
}

/**
 * Process a single session file and extract its data.
 *
 * Returns null for files nothing can parse; never throws for a bad file. `cache` decides
 * where parsed results are kept: the CLI passes its disk-backed cache, the library entry
 * point keeps its own in-memory cache and passes none here.
 */
export async function processSessionFile(filePath: string, options: ProcessSessionFileOptions = {}): Promise<SessionData | null> {
	const { verbose = false, cache = noCache } = options;
	try {
		const stats = await statSessionFile(filePath);

		// Check the cache before doing any parsing
		const cached = cache.get(filePath, stats.mtimeMs, stats.size);
		if (cached) {
			return cached;
		}

		// Dispatch to ecosystem adapters (OpenCode, Crush, VS, Continue, ClaudeDesktop, ClaudeCode, MistralVibe)
		const eco = getEcosystems().find(e => e.handles(filePath));
		if (eco) {
			const [tokenResult, interactions, modelUsage] = await Promise.all([
				eco.getTokens(filePath),
				eco.countInteractions(filePath),
				eco.getModelUsage(filePath),
			]);
			const mtimeDateKey = toLocalDayKey(stats.mtime);
			const ecoResult: SessionData = {
				file: filePath,
				tokens: tokenResult.actualTokens > 0 ? tokenResult.actualTokens : tokenResult.tokens,
				thinkingTokens: tokenResult.thinkingTokens,
				actualTokens: tokenResult.actualTokens,
				interactions,
				modelUsage,
				// Adapter getTokens() results don't carry exact billing today.
				copilotNanoAiu: 0,
				lastModified: stats.mtime,
				editorSource: getEditorSourceFromPath(filePath),
				dailyFractions: (await eco.getDailyFractions?.(filePath)) ?? { [mtimeDateKey]: 1.0 },
			};
			cache.set(filePath, stats.mtimeMs, stats.size, ecoResult);
			return ecoResult;
		}

		const content = await fs.promises.readFile(filePath, 'utf-8');

		if (!content.trim()) {
			return null;
		}

		const isJsonl = filePath.endsWith('.jsonl') || isJsonlContent(content);

		let tokens = 0;
		let thinkingTokens = 0;
		let actualTokens = 0;
		let interactions = 0;
		let copilotNanoAiu = 0;
		let fileModelUsage: ModelUsage = {};

		if (isJsonl) {
			const exactUsage = extractCopilotCliSessionId(filePath) ? await getCopilotCliExactUsage(filePath) : null;
			const result = estimateTokensFromJsonlSession(content, exactUsage);
			// Prefer actualTokens (from session.shutdown modelMetrics) over estimated tokens,
			// matching VS Code's logic: actualTokens > 0 ? actualTokens : estimatedTokens
			tokens = result.actualTokens > 0 ? result.actualTokens : result.tokens;
			thinkingTokens = result.thinkingTokens;
			actualTokens = result.actualTokens;
			copilotNanoAiu = result.copilotNanoAiu;

			// Always derive model attribution via getModelUsageFromSession — the single shared
			// entry point that handles all JSONL formats (event-format CLI sessions, delta-format
			// VS Code Chat sessions). This mirrors VS Code's getSessionFileDataCached, which calls
			// getModelUsageFromSession in parallel with estimateTokensFromSession rather than
			// relying on estimateTokensFromJsonlSession.modelUsage (which is empty for delta-format).
			fileModelUsage = await getModelUsageFromSession(
				{ warn, tokenEstimators, modelPricing, ecosystems: getEcosystems() },
				filePath,
				content
			);

			// JetBrains partition files use a proprietary format not handled by getModelUsageFromSession.
			// Fall back to the JetBrains-specific parser which reads model names from
			// assistant.turn_start events. When no model hint is detectable (ask-mode without
			// tool calls), attribute to 'unknown' — calculateEstimatedCost falls back to
			// gpt-4o-mini pricing for unrecognised model names.
			if (Object.keys(fileModelUsage).length === 0 && isJetBrainsSessionPath(filePath)) {
				const jbResult = parseJetBrainsPartition(content);
				if (Object.keys(jbResult.modelUsage).length > 0) {
					fileModelUsage = jbResult.modelUsage;
				} else if (jbResult.tokens > 0) {
					const modelKey = jbResult.modelHint && jbResult.modelHint !== 'unknown' ? jbResult.modelHint : 'unknown';
					fileModelUsage = { [modelKey]: { inputTokens: jbResult.tokens, outputTokens: 0, sessions: 0 } };
				}
			}

			// Reconcile the per-model breakdown to the session total so Input+Output never
			// exceeds Total in CLI reports. Event-based sessions (Copilot CLI without exact
			// usage, JetBrains, …) derive actualTokens from real output while modelUsage
			// derives input from accumulated message content; those heuristics can diverge.
			fileModelUsage = reconcileModelUsageToActualTokens(fileModelUsage, actualTokens || tokens);

			// Count interactions from JSONL
			const lines = content.trim().split('\n');
			for (const line of lines) {
				try {
					const event = JSON.parse(line);
					if (event.type === 'user.message' || (event.kind === 2 && event.k?.[0] === 'requests')) {
						interactions++;
					}
				} catch {
					// skip
				}
			}
		} else {
			const result = parseSessionFileContent(
				filePath,
				content,
				estimateTokens,
				resolveModel
			);
			tokens = result.tokens;
			thinkingTokens = result.thinkingTokens;
			actualTokens = result.actualTokens;
			interactions = result.interactions;
			fileModelUsage = await getModelUsageFromSession(
				{ warn, tokenEstimators, modelPricing, ecosystems: getEcosystems() },
				filePath,
				content
			);
		}

		const dailyFractions = extractDailyFractions(content, isJsonl, stats.mtime);

		// Supplement with debug log tokens when available.
		// Agent-mode sessions make multiple LLM API calls per turn; only the last
		// call's tokens are stored in the session file. Debug logs record every call,
		// so they give the true session total — matching VS Code's behavior.
		const debugLogTokens = await readDebugLogTokensForSession(filePath, verbose);
		if (debugLogTokens && (debugLogTokens.inputTokens + debugLogTokens.outputTokens) > 0) {
			tokens = debugLogTokens.inputTokens + debugLogTokens.outputTokens;
			actualTokens = tokens;
			// Same precedence as the extension's sessionFileAnalyzer: debug-log billing wins.
			if (debugLogTokens.copilotNanoAiu > 0) { copilotNanoAiu = debugLogTokens.copilotNanoAiu; }
			if (Object.keys(debugLogTokens.modelBreakdown).length > 0) {
				const replacement: ModelUsage = {};
				for (const [model, bd] of Object.entries(debugLogTokens.modelBreakdown)) {
					replacement[model] = { inputTokens: bd.inputTokens, outputTokens: bd.outputTokens, sessions: 0, ...(bd.cachedTokens > 0 ? { cachedReadTokens: bd.cachedTokens } : {}) };
				}
				preserveAutoRouting(fileModelUsage, replacement);
				fileModelUsage = replacement;
			}
		}

		const sessionData: SessionData = {
			file: filePath,
			tokens,
			thinkingTokens,
			actualTokens,
			interactions,
			modelUsage: fileModelUsage,
			copilotNanoAiu,
			lastModified: stats.mtime,
			editorSource: getEditorSourceFromPath(filePath),
			dailyFractions,
		};
		cache.set(filePath, stats.mtimeMs, stats.size, sessionData);
		return sessionData;
	} catch {
		return null;
	}
}
