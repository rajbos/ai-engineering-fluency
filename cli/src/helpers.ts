/**
 * Shared helper functions for CLI commands.
 * Handles session file discovery, parsing, and stats aggregation.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import { SessionDiscovery } from '../../src/sessionDiscovery';
import { buildAdapterRegistry, createDataAccessInstances } from '../../src/adapters';
import type { IEcosystemAdapter } from '../../src/ecosystemAdapter';
import { isMcpTool, extractMcpServerName, resolveDebugLogCandidatePaths, resolveExactWorkspacePath } from '../../src/workspaceHelpers';
import { resolveFileUri } from '../../src/workspacePathResolver';
import { parseSessionFileContent } from '../../src/sessionParser';
import { estimateTokensFromText, getModelFromRequest, isJsonlContent, estimateTokensFromJsonlSession, calculateEstimatedCost, extractAllTokensFromDebugLog } from '../../src/tokenEstimation';
import { extractCopilotCliSessionId, getCopilotCliExactUsage } from '../../src/copilotCliOtel';
import { extractDailyFractions } from '../../src/dailyAttribution';
import { toLocalDayKey } from '../../src/utils/dayKeys';
import { isJetBrainsSessionPath } from '../../src/adapters/adapterPredicates';
import { parseJetBrainsPartition } from '../../src/jetbrains';
import type { DailyTokenStats, DetailedStats, ModelUsage, UsageAnalysisStats, WorkspaceCustomizationMatrix, TodaySessionSummary } from '../../src/types';
import { analyzeSessionUsage, mergeUsageAnalysis, getModelUsageFromSession } from '../../src/usageAnalysis';
import { preserveAutoRouting, reconcileModelUsageToActualTokens, addSessionToDailyStats, sortedDailyStats, sessionLocFromUsageAnalysis } from '../../src/statsHelpers';
import { resolveSessionTaskAttribution } from '../../src/taskClassification';
import { addSessionEfficiencyToDailyStats } from '../../src/modelEfficiency';
import { EFFICIENCY_BEHAVIOR_WEEKS, toEfficiencySessionInput } from '../../src/efficiencyViewBuilder';
import type { EfficiencySessionInput } from '../../src/efficiencyAnalysis';
import { calculateEnvironmentalImpact } from '../../src/environmentalImpact';
import { withErrorRecovery } from '../../src/utils/errors';
import { buildRecentSessionBuckets, type RecentSessionBucketItem } from '../../src/recentSessions';
import { buildRepeatedTaskReport, type RepeatedTaskSessionSource } from '../../src/repeatedTasks';
import * as vscodeStub from './vscode-stub';
import { loadCache, saveCache, disableCache, getCached, setCached, getCacheStats } from './cliCache';

// Import JSON data files
import tokenEstimatorsData from '../../src/tokenEstimators.json';
import modelPricingData from '../../src/modelPricing.json';
import toolNamesData from '../../src/toolNames.json';

// Pure analysis helpers from analysis.ts
import {
	type SessionData,
	type PeriodStats,
	effectiveTokens,
	getEditorSourceFromPath,
	runWithConcurrency,
	createEmptyPeriodStats,
	aggregateIntoPeriod,
	createEmptyUsageAnalysisPeriod,
	buildChartPayload,
	fmt,
	formatTokens,
} from './analysis';
export type { SessionData } from './analysis';
export { effectiveTokens, buildChartPayload, buildEfficiencyPayload, fmt, formatTokens } from './analysis';

const tokenEstimators: { [key: string]: number } = tokenEstimatorsData.estimators;
const modelPricing = modelPricingData.pricing as { [key: string]: any };
const toolNameMap = toolNamesData as { [key: string]: string };

/** Logging functions for the CLI context */
const log = (msg: string) => { /* quiet by default */ };
const warn = (msg: string) => { /* quiet by default */ };
const error = (msg: string, err?: unknown) => {
	const errMsg = err instanceof Error ? err.message : (err !== undefined ? String(err) : '');
	console.error(chalk.red(msg), errMsg);
};

/**
 * Safely reads and parses a JSON file.
 * Returns null if the file does not exist (silently) or on any other error (with a structured log message).
 */
async function readJsonFile<T>(filePath: string): Promise<T | null> {
	try {
		const raw = await fs.promises.readFile(filePath, 'utf-8');
		return JSON.parse(raw) as T;
	} catch (err: any) {
		if (err?.code !== 'ENOENT') {
			error(`[readJsonFile] Failed to read or parse JSON at ${filePath}:`, err);
		}
		return null;
	}
}

/** Synchronous lazy-initialized ecosystem registry — created once on first use. */
let _ecosystems: IEcosystemAdapter[] | null = null;

/** Returns the shared ecosystem adapter registry, creating it on first call. */
function getEcosystems(): IEcosystemAdapter[] {
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
/** Create session discovery instance for CLI */
function createSessionDiscovery(): SessionDiscovery {
	return new SessionDiscovery({ log, warn, error, ecosystems: getEcosystems() });
}

/** Discover all session files on this machine */
export async function discoverSessionFiles(): Promise<string[]> {
	const discovery = createSessionDiscovery();
	return discovery.getCopilotSessionFiles();
}

/**
 * Builds a WorkspaceCustomizationMatrix from session file paths.
 *
 * - For VS Code sessions: derives workspace folder from workspaceStorage/<hash>/workspace.json,
 *   then checks for AGENTS.md, CLAUDE.md, or .github/copilot-instructions.md.
 * - For Claude Code sessions (~/.claude/projects/<hash>/): reads the JSONL to extract the
 *   `cwd` workspace path, then checks for CLAUDE.md there.
 */
export async function buildCustomizationMatrix(sessionFiles: string[]): Promise<WorkspaceCustomizationMatrix | undefined> {
	const workspacePaths = new Set<string>();
	const claudeBasePath = path.join(os.homedir(), '.claude', 'projects');

	for (const sessionFile of sessionFiles) {
		// Claude Code session: ~/.claude/projects/<hash>/<uuid>.jsonl
		if (sessionFile.startsWith(claudeBasePath + path.sep) || sessionFile.startsWith(claudeBasePath + '/')) {
			const content = await withErrorRecovery(
				() => fs.promises.readFile(sessionFile, 'utf-8'),
				null,
				`buildCustomizationMatrix readFile(${sessionFile})`
			);
			if (content !== null) {
				const lines = content.split('\n').slice(0, 30);
				for (const line of lines) {
					if (!line.trim()) { continue; }
					try {
						const event = JSON.parse(line);
						if (event.cwd && typeof event.cwd === 'string') {
							workspacePaths.add(event.cwd);
							break;
						}
					} catch { /* skip malformed lines */ }
				}
			}
			continue;
		}

		// VS Code session: .../workspaceStorage/<hash>/chatSessions/<file>
		const chatSessionsDir = path.dirname(sessionFile);
		if (path.basename(chatSessionsDir) !== 'chatSessions') { continue; }
		const hashDir = path.dirname(chatSessionsDir);
		const workspaceJsonPath = path.join(hashDir, 'workspace.json');

		const workspaceJson = await readJsonFile<{ folder?: string }>(workspaceJsonPath);
		if (!workspaceJson) { continue; }
		const folderUri: string | undefined = workspaceJson.folder;
		if (!folderUri || !folderUri.startsWith('file://')) { continue; }

		const folderPath = resolveFileUri(folderUri);
		if (folderPath) { workspacePaths.add(folderPath); }
	}

	if (workspacePaths.size === 0) { return undefined; }

	let workspacesWithIssues = 0;
	for (const wsPath of workspacePaths) {
		const hasIssues = await withErrorRecovery(
			async () => {
				// Same case-insensitive resolution as the shared customization scanner, so the CLI
				// accepts every spelling the extension does (including on case-sensitive filesystems).
				const instructionPaths = [
					'.github/copilot-instructions.md',
					'AGENTS.md',
					'CLAUDE.md',
					'.claude/CLAUDE.md',
				];
				return !instructionPaths.some(p => resolveExactWorkspacePath(wsPath, p, true) !== undefined);
			},
			true,
			`buildCustomizationMatrix workspace check(${wsPath})`
		);
		if (hasIssues) { workspacesWithIssues++; }
	}

	return {
		customizationTypes: [],
		workspaces: [],
		totalWorkspaces: workspacePaths.size,
		workspacesWithIssues,
	};
}

/** Get diagnostic candidate paths info */
export function getDiagnosticPaths(): { path: string; exists: boolean; source: string }[] {
	const discovery = createSessionDiscovery();
	return discovery.getDiagnosticCandidatePaths();
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
 * The real file behind a discovered session path. DB-backed editors (OpenCode,
 * Crush, ...) report virtual paths like `opencode.db#<id>`, which do not exist
 * on disk; ordinary session files are returned unchanged.
 */
export function getSessionBackingPath(filePath: string): string {
	const eco = getEcosystems().find(e => e.handles(filePath));
	return eco ? eco.getBackingPath(filePath) : filePath;
}

/** What an adapter knows about one session beyond its token counts. */
export type SessionMeta = Awaited<ReturnType<IEcosystemAdapter['getMeta']>>;

/**
 * Per-session title and first/last interaction times from the owning adapter,
 * or null for sessions no adapter handles. For DB-backed editors this is the
 * only per-session timestamp: the backing database's mtime moves whenever any
 * session in it changes.
 */
export async function getSessionMeta(filePath: string): Promise<SessionMeta | null> {
	const eco = getEcosystems().find(e => e.handles(filePath));
	if (!eco) { return null; }
	try {
		return await eco.getMeta(filePath);
	} catch {
		return null;
	}
}

/**
 * Cheap per-session last-activity time from the owning adapter, or null when the
 * adapter has no such lookup (then the file's own mtime is the right signal).
 */
export async function getSessionLastActivity(filePath: string): Promise<Date | null> {
	const eco = getEcosystems().find(e => e.handles(filePath));
	if (!eco?.getLastActivity) { return null; }
	try {
		return await eco.getLastActivity(filePath);
	} catch {
		return null;
	}
}

/**
 * Stat a session file, handling DB virtual paths (OpenCode and Crush).
 * Virtual DB paths are resolved to the actual DB file.
 */
async function statSessionFile(filePath: string): Promise<fs.Stats> {
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
 * Extract per-UTC-day fractions from session content using interaction timestamps.
 * Fractions sum to 1.0. Falls back to { [fallbackDateKey]: 1.0 } when no timestamps found.
 *
 * Single canonical implementation for all text-based session formats:
 *  - Copilot CLI JSONL: timestamps on `user.message` events
 *  - VS Code delta JSONL: timestamps in kind:0 initial state, kind:2 appends, kind:1 updates
 *  - VS Code JSON: timestamps on request objects
 *
 * When adding support for a new session format, extend this function rather than creating
 * a separate attribution implementation — this keeps all formats consistent.
 */

/**
 * The per-session fields the Chart and Efficiency views split by (task category, lines of code,
 * efficiency signals), derived through the same shared helpers the extension's session analyzer uses.
 *
 * Returns `null` when the analysis failed. analyzeSessionUsage() swallows read, parser and
 * adapter errors and returns an empty analysis, signalling them through `deps.onAnalysisError`.
 * An empty result from a failed read must not be marked resolved and cached, or the session
 * would show no task/LOC/efficiency data until it changes. Plain `deps.warn` notices (a
 * sub-step that failed, an unexpected format) leave a valid analysis and are not failures.
 */
async function sessionViewAttributes(filePath: string): Promise<Pick<SessionData, 'taskCategory' | 'taskCategoryShares' | 'linesAdded' | 'linesRemoved' | 'languageUsage' | 'usageAnalysis'> | null> {
	let failed = false;
	try {
		const analysis = await analyzeSessionUsage(
			{ warn, onAnalysisError: () => { failed = true; }, tokenEstimators, modelPricing, toolNameMap, ecosystems: getEcosystems() },
			filePath,
		);
		if (failed) { return null; }
		return {
			...resolveSessionTaskAttribution(analysis),
			...sessionLocFromUsageAnalysis(analysis),
			usageAnalysis: {
				...(analysis.modelEfficiency ? { modelEfficiency: analysis.modelEfficiency } : {}),
				...(analysis.sessionDuration ? { sessionDuration: analysis.sessionDuration } : {}),
				...(analysis.applyUsage ? { applyUsage: analysis.applyUsage } : {}),
				...(analysis.skillCalls ? { skillCalls: analysis.skillCalls } : {}),
			},
		};
	} catch {
		return null;
	}
}

/**
 * {@link processSessionFile} plus the view attributes (task category, lines of code, efficiency
 * signals) the Chart and Efficiency payloads need.
 *
 * The attributes cost a full usage-analysis pass, so they are added lazily here rather than in
 * processSessionFile(): token-only commands (`usage`, `environmental`, the prompt segment) keep
 * the lean parse. The enriched entry is written back to the session cache, so each session is
 * analyzed at most once per file version.
 *
 * Like every other cache write here, the entry is keyed by the stat taken *before* reading the
 * file. The base parse and the analysis are two reads, so the file is stat'ed again afterwards
 * and the entry is only cached when nothing changed in between — otherwise an actively-written
 * session would store data parsed from an older version under the newer mtime. A failed
 * analysis is neither marked resolved nor cached, so the next run retries it.
 */
export async function processSessionFileForViews(filePath: string, verbose = false): Promise<SessionData | null> {
	let before: fs.Stats | undefined;
	try { before = await statSessionFile(filePath); } catch { /* processSessionFile reports the failure */ }
	const data = await processSessionFile(filePath, verbose);
	if (!data || data.viewAttributesResolved) { return data; }
	const attributes = await sessionViewAttributes(filePath);
	if (!attributes) { return data; }
	const enriched: SessionData = { ...data, ...attributes, viewAttributesResolved: true };
	try {
		const after = await statSessionFile(filePath);
		if (before && after.mtimeMs === before.mtimeMs && after.size === before.size) {
			setCached(filePath, before.mtimeMs, before.size, enriched);
		}
	} catch {
		// Not cacheable (file vanished): still return the enriched data for this run.
	}
	return enriched;
}

/**
 * Process a single session file and extract its data.
 */
export async function processSessionFile(filePath: string, verbose = false): Promise<SessionData | null> {
	try {
		const stats = await statSessionFile(filePath);

		// Check the cache before doing any parsing
		const cached = getCached(filePath, stats.mtimeMs, stats.size);
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
				lastModified: stats.mtime,
				editorSource: getEditorSourceFromPath(filePath),
				dailyFractions: (await eco.getDailyFractions?.(filePath)) ?? { [mtimeDateKey]: 1.0 },
			};
			setCached(filePath, stats.mtimeMs, stats.size, ecoResult);
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
		let fileModelUsage: ModelUsage = {};

		if (isJsonl) {
			const exactUsage = extractCopilotCliSessionId(filePath) ? await getCopilotCliExactUsage(filePath) : null;
			const result = estimateTokensFromJsonlSession(content, exactUsage);
			// Prefer actualTokens (from session.shutdown modelMetrics) over estimated tokens,
			// matching VS Code's logic: actualTokens > 0 ? actualTokens : estimatedTokens
			tokens = result.actualTokens > 0 ? result.actualTokens : result.tokens;
			thinkingTokens = result.thinkingTokens;
			actualTokens = result.actualTokens;

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
			lastModified: stats.mtime,
			editorSource: getEditorSourceFromPath(filePath),
			dailyFractions,
		};
		setCached(filePath, stats.mtimeMs, stats.size, sessionData);
		return sessionData;
	} catch {
		return null;
	}
}

/**
 * Calculate detailed statistics across all time periods.
 */
export async function calculateDetailedStats(
	sessionFiles: string[],
	progressCallback?: (completed: number, total: number) => void
): Promise<DetailedStats> {
	const now = new Date();

	// All period boundaries use local calendar dates so that "today" reflects
	// the user's local clock rather than resetting at UTC midnight.
	const todayKey = toLocalDayKey(now);

	const y = now.getFullYear();
	const m = now.getMonth(); // 0-indexed
	const monthStartKey = toLocalDayKey(new Date(y, m, 1));

	// Last month: the month before the current local month
	const lastMonthLastDay = new Date(y, m, 0); // day 0 = last day of previous month
	const lastMonthStartKey = toLocalDayKey(new Date(lastMonthLastDay.getFullYear(), lastMonthLastDay.getMonth(), 1));
	// lastMonthEndKey is the day before monthStartKey — string comparison handles this naturally
	// (any date >= lastMonthStartKey && < monthStartKey is in last month)

	const last30DaysDate = new Date(y, m, now.getDate() - 30);
	const last30DaysStartKey = toLocalDayKey(last30DaysDate);

	const periods: {
		today: PeriodStats;
		month: PeriodStats;
		lastMonth: PeriodStats;
		last30Days: PeriodStats;
	} = {
		today: createEmptyPeriodStats(),
		month: createEmptyPeriodStats(),
		lastMonth: createEmptyPeriodStats(),
		last30Days: createEmptyPeriodStats(),
	};

	let processed = 0;
	const sessionResults = await runWithConcurrency(sessionFiles, async (file) => {
		const data = await processSessionFile(file);
		if (progressCallback) { progressCallback(++processed, sessionFiles.length); }
		return data;
	});

	for (const data of sessionResults) {
		if (!data || data.tokens === 0) {
			continue;
		}

		// Skip sessions that have no relevant days (all older than last month)
		const hasRelevantDay = Object.keys(data.dailyFractions).some(k => k >= lastMonthStartKey);
		if (!hasRelevantDay) { continue; }

		// Accumulate per-period fractions from the session's daily breakdown
		let todayFrac = 0;
		let monthFrac = 0;
		let lastMonthFrac = 0;
		let last30DaysFrac = 0;

		for (const [dateKey, fraction] of Object.entries(data.dailyFractions)) {
			if (dateKey === todayKey) { todayFrac += fraction; }
			if (dateKey >= monthStartKey) { monthFrac += fraction; }
			if (dateKey >= lastMonthStartKey && dateKey < monthStartKey) { lastMonthFrac += fraction; }
			if (dateKey >= last30DaysStartKey) { last30DaysFrac += fraction; }
		}

		if (todayFrac > 0) { aggregateIntoPeriod(periods.today, data, todayFrac); }
		if (monthFrac > 0) { aggregateIntoPeriod(periods.month, data, monthFrac); }
		if (lastMonthFrac > 0) { aggregateIntoPeriod(periods.lastMonth, data, lastMonthFrac); }
		if (last30DaysFrac > 0) { aggregateIntoPeriod(periods.last30Days, data, last30DaysFrac); }
	}

	// Compute derived stats
	for (const period of Object.values(periods)) {
		if (period.sessions > 0) {
			period.avgTokensPerSession = Math.round(period.tokens / period.sessions);
		}
		const environmentalImpact = calculateEnvironmentalImpact(period.modelUsage, period.tokens);
		period.co2 = environmentalImpact.co2;
		period.treesEquivalent = environmentalImpact.treesEquivalent;
		period.waterUsage = environmentalImpact.waterUsage;
		period.estimatedCost = calculateEstimatedCost(period.modelUsage, modelPricing);
		period.estimatedCostCopilot = calculateEstimatedCost(period.modelUsage, modelPricing, 'copilot');
	}

	return {
		...periods,
		lastUpdated: now,
	};
}

/** Options for calculateUsageAnalysisStats. */
export interface UsageAnalysisOptions {
	/**
	 * Also cluster the analysed sessions' first prompts into a repeated-task
	 * (Skill Suggestions) report. Off by default: the report carries prompt text.
	 */
	includeRepeatedTasks?: boolean;
}

/**
 * Calculate usage analysis stats for fluency scoring.
 * This is a simplified version that uses the shared usageAnalysis module.
 */
export async function calculateUsageAnalysisStats(sessionFiles: string[], options: UsageAnalysisOptions = {}): Promise<UsageAnalysisStats> {
	const deps = {
		warn,
		tokenEstimators,
		modelPricing,
		toolNameMap,
		ecosystems: getEcosystems(),
	};

	const now = new Date();
	const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
	const last30DaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
	const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
	// Cutoff includes last month — which may start before the 30-day window
	const cutoffStart = lastMonthStart < last30DaysStart ? lastMonthStart : last30DaysStart;

	const todayPeriod = createEmptyUsageAnalysisPeriod();
	const last30DaysPeriod = createEmptyUsageAnalysisPeriod();
	const monthPeriod = createEmptyUsageAnalysisPeriod();
	const lastMonthPeriod = createEmptyUsageAnalysisPeriod();
	const todaySessions: TodaySessionSummary[] = [];
	const recentSessionItems: RecentSessionBucketItem<TodaySessionSummary>[] = [];
	const repeatedTaskSources: RepeatedTaskSessionSource[] = [];

	for (const file of sessionFiles) {
		try {
			const stats = await statSessionFile(file);
			const modified = stats.mtime;

			const inPeriodWindow = modified >= cutoffStart;
			// A DB-backed session's file mtime can lag its real activity (writes still in
			// the SQLite WAL), so the repeated-task report asks the adapter before skipping.
			// The lookup reads the adapter at most once per session and is reused below.
			const activity = createSessionActivityLookup(file);
			if (!inPeriodWindow) {
				if (!options.includeRepeatedTasks) { continue; }
				if (!isActiveSince(modified, await activity.lastActivity(), cutoffStart)) { continue; }
			}

			const analysis = await analyzeSessionUsage(deps, file);
			if (options.includeRepeatedTasks) {
				await addRepeatedTaskSource(repeatedTaskSources, activity, analysis.firstUserPrompt, stats.mtimeMs, cutoffStart);
			}
			// Period stats keep using the file mtime, as before.
			if (!inPeriodWindow) { continue; }
			let sessionSummary: TodaySessionSummary | undefined;
			const data = modified >= last30DaysStart ? await processSessionFile(file) : undefined;
			if (data && data.interactions > 0) {
				let inputTokens = 0, outputTokens = 0, cachedTokens = 0;
				for (const usage of Object.values(data.modelUsage)) {
					inputTokens += usage.inputTokens;
					outputTokens += usage.outputTokens;
					cachedTokens += usage.cachedReadTokens ?? 0;
				}
				sessionSummary = {
					title: null,
					filePath: file,
					interactions: data.interactions,
					toolCalls: analysis.toolCalls.total,
					inputTokens,
					outputTokens,
					thinkingTokens: data.thinkingTokens ?? 0,
					cachedTokens,
					totalTokens: data.tokens,
					estimatedCost: calculateEstimatedCost(data.modelUsage, modelPricing),
					editor: data.editorSource,
					models: Object.keys(data.modelUsage),
					lastActivity: data.lastModified.toISOString(),
					...(analysis.sessionDuration?.totalDurationMs !== undefined ? { durationMs: analysis.sessionDuration.totalDurationMs } : {}),
					...(analysis.sessionDuration?.activeDurationMs !== undefined ? { activeDurationMs: analysis.sessionDuration.activeDurationMs } : {}),
				};
				recentSessionItems.push({
					activityKey: toLocalDayKey(data.lastModified),
					interactions: data.interactions,
					value: sessionSummary,
				});
			}

			if (modified >= last30DaysStart) {
				mergeUsageAnalysis(last30DaysPeriod, analysis);
				last30DaysPeriod.sessions++;
			}
			if (modified >= monthStart) {
				mergeUsageAnalysis(monthPeriod, analysis);
				monthPeriod.sessions++;
			}
			if (modified >= todayStart) {
				mergeUsageAnalysis(todayPeriod, analysis);
				todayPeriod.sessions++;
				if (sessionSummary) { todaySessions.push(sessionSummary); }
			}
			if (modified >= lastMonthStart && modified < monthStart) {
				mergeUsageAnalysis(lastMonthPeriod, analysis);
				lastMonthPeriod.sessions++;
			}
		} catch {
			// Skip files that can't be processed
		}
	}

	return {
		today: todayPeriod,
		last30Days: last30DaysPeriod,
		month: monthPeriod,
		lastMonth: lastMonthPeriod,
		lastUpdated: now,
		todaySessions: todaySessions.sort((a, b) => b.interactions - a.interactions),
		recentSessions: buildRecentSessionBuckets(recentSessionItems, now),
		...(options.includeRepeatedTasks ? { repeatedTasks: buildRepeatedTaskReport(repeatedTaskSources) } : {}),
	};
}

/** Adapter lookups a SessionActivityLookup uses; injectable for tests. */
export interface SessionActivitySources {
	getLastActivity(file: string): Promise<Date | null>;
	getMeta(file: string): Promise<SessionMeta | null>;
	getBackingPath(file: string): string;
}

const defaultActivitySources: SessionActivitySources = {
	getLastActivity: getSessionLastActivity,
	getMeta: getSessionMeta,
	getBackingPath: getSessionBackingPath,
};

/** Memoized per-session adapter reads: each underlying lookup runs at most once. */
export interface SessionActivityLookup {
	readonly file: string;
	meta(): Promise<SessionMeta | null>;
	/**
	 * The session's own last activity, for DB-backed (virtual) sessions only: the
	 * adapter's cheap `getLastActivity()`, else the metadata's `lastInteraction`.
	 * Null for regular files and when unknown; the file mtime is then the signal.
	 */
	lastActivity(): Promise<Date | null>;
}

export function createSessionActivityLookup(file: string, sources: SessionActivitySources = defaultActivitySources): SessionActivityLookup {
	let meta: Promise<SessionMeta | null> | undefined;
	let lastActivity: Promise<Date | null> | undefined;
	const lookup: SessionActivityLookup = {
		file,
		meta: () => (meta ??= sources.getMeta(file)),
		lastActivity: () => (lastActivity ??= (async () => {
			// Regular files: the file mtime is the session's own; no adapter lookup needed.
			if (sources.getBackingPath(file) === file) { return null; }
			const cheap = await sources.getLastActivity(file);
			if (cheap) { return cheap; }
			const fromMeta = (await lookup.meta())?.lastInteraction;
			const parsed = fromMeta ? new Date(fromMeta) : null;
			return parsed && !Number.isNaN(parsed.getTime()) ? parsed : null;
		})()),
	};
	return lookup;
}

/**
 * Session context for the repeated-task report, from the owning adapter when it has one.
 * DB-backed sessions share their database's mtime, so the adapter's per-session
 * last interaction (or last activity) is what places a session in the window.
 */
async function toRepeatedTaskSource(activity: SessionActivityLookup, firstUserPrompt: string, mtimeMs: number): Promise<RepeatedTaskSessionSource> {
	const meta = await activity.meta();
	const lastInteraction = meta?.lastInteraction ?? (await activity.lastActivity())?.toISOString() ?? null;
	return {
		file: activity.file,
		firstUserPrompt,
		title: meta?.title ?? null,
		lastInteraction,
		mtime: mtimeMs,
		repository: meta?.repository ?? null,
	};
}

/** Add a session with a first prompt to the repeated-task sources when its own activity is in the window. */
async function addRepeatedTaskSource(
	sources: RepeatedTaskSessionSource[], activity: SessionActivityLookup,
	firstUserPrompt: string | undefined, mtimeMs: number, cutoff: Date,
): Promise<void> {
	if (!firstUserPrompt) { return; }
	const source = await toRepeatedTaskSource(activity, firstUserPrompt, mtimeMs);
	if (repeatedTaskActivityMs(source) >= cutoff.getTime()) { sources.push(source); }
}

/**
 * Whether a session was active on or after `cutoff`: by its file mtime, or by the
 * adapter's per-session last activity when the file mtime is stale.
 */
export function isActiveSince(fileMtime: Date, sessionLastActivity: Date | null, cutoff: Date): boolean {
	return fileMtime >= cutoff || (sessionLastActivity !== null && sessionLastActivity >= cutoff);
}

/**
 * A repeated-task source's own activity time in epoch ms: its last interaction
 * when known and parseable, otherwise the file mtime.
 */
export function repeatedTaskActivityMs(source: Pick<RepeatedTaskSessionSource, 'lastInteraction' | 'mtime'>): number {
	const parsed = source.lastInteraction ? Date.parse(source.lastInteraction) : NaN;
	return Number.isNaN(parsed) ? source.mtime : parsed;
}

/**
 * The Chart and Efficiency views' session-derived inputs, from **one** walk over the files.
 *
 * Both need every session's enriched parse (processSessionFileForViews). Walking twice would
 * parse and analyze each cold session twice — the session cache cannot be relied on to absorb
 * that, since it holds a bounded number of entries and has no in-flight de-duplication.
 */
export async function calculateViewStats(sessionFiles: string[], verbose = false, weeksBack = EFFICIENCY_BEHAVIOR_WEEKS): Promise<{
	dailyStats: DailyTokenStats[];
	efficiencySessionInputs: EfficiencySessionInput[];
}> {
	const sessions = await runWithConcurrency(sessionFiles, async (file) => processSessionFileForViews(file, verbose));
	return {
		dailyStats: dailyStatsFromSessions(sessions),
		efficiencySessionInputs: efficiencyInputsFromSessions(sessions, weeksBack),
	};
}

/**
 * Process session files into per-day stats over the whole history, in the
 * `DailyTokenStats[]` shape the shared `buildChartData()` takes. Aggregation goes through
 * the shared `addSessionToDailyStats()` — see AGENTS.md, "CLI Must Reuse Shared Functions".
 * Use {@link calculateViewStats} when the Efficiency inputs are needed too.
 */
export async function calculateDailyStats(sessionFiles: string[], verbose = false): Promise<DailyTokenStats[]> {
	return dailyStatsFromSessions(await runWithConcurrency(sessionFiles, async (file) => processSessionFileForViews(file, verbose)));
}

function dailyStatsFromSessions(sessions: Array<SessionData | null | undefined>): DailyTokenStats[] {
	const dailyStatsMap = new Map<string, DailyTokenStats>();
	for (const data of sessions) {
		if (!data || data.tokens === 0 || data.interactions === 0) { continue; }
		addSessionToDailyStats(dailyStatsMap, {
			editorType: data.editorSource,
			tokens: effectiveTokens(data),
			interactions: data.interactions,
			modelUsage: data.modelUsage,
			dailyFractions: data.dailyFractions,
			taskCategory: data.taskCategory,
			taskCategoryShares: data.taskCategoryShares,
			linesAdded: data.linesAdded,
			linesRemoved: data.linesRemoved,
			languageUsage: data.languageUsage,
		});
		addSessionEfficiencyToDailyStats(dailyStatsMap, {
			editorType: data.editorSource,
			modelUsage: data.modelUsage,
			dailyFractions: data.dailyFractions,
			linesAdded: data.linesAdded,
			linesRemoved: data.linesRemoved,
			usageAnalysis: data.usageAnalysis,
		}, modelPricing);
	}
	return sortedDailyStats(dailyStatsMap);
}

/**
 * Per-session inputs for the Efficiency view's behaviour trends over the trailing
 * `weeksBack` weeks — the Node-side counterpart of the extension's
 * collectEfficiencySessionInputs(). Use {@link calculateViewStats} when the daily stats are
 * needed too, so the files are walked once.
 */
export async function calculateEfficiencySessionInputs(sessionFiles: string[], weeksBack = EFFICIENCY_BEHAVIOR_WEEKS): Promise<EfficiencySessionInput[]> {
	return efficiencyInputsFromSessions(await runWithConcurrency(sessionFiles, async (file) => processSessionFileForViews(file)), weeksBack);
}

function efficiencyInputsFromSessions(sessions: Array<SessionData | null | undefined>, weeksBack: number): EfficiencySessionInput[] {
	const now = new Date();
	const cutoffKey = toLocalDayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - weeksBack * 7));
	const inputs: EfficiencySessionInput[] = [];
	for (const data of sessions) {
		if (!data || data.interactions === 0) { continue; }
		// The session's last active day, as the extension derives it from its daily rollups.
		const dayKey = Object.keys(data.dailyFractions).sort().pop() ?? toLocalDayKey(data.lastModified);
		if (dayKey < cutoffKey) { continue; }
		inputs.push(toEfficiencySessionInput(data, dayKey, data.editorSource));
	}
	return inputs;
}

/** Environmental impact constants export for use in commands */
export { ENVIRONMENTAL } from './constants';

/** Model pricing data export */
export { modelPricing, tokenEstimators, toolNameMap };

/** Cache lifecycle — re-export for use in commands */
export { loadCache, saveCache, disableCache, getCacheStats } from './cliCache';
