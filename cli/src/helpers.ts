/**
 * Shared helper functions for CLI commands.
 * Handles session file discovery, parsing, and stats aggregation.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import chalk from 'chalk';
import { SessionDiscovery } from '../../vscode-extension/src/sessionDiscovery';
import { buildAdapterRegistry, createDataAccessInstances } from '../../vscode-extension/src/adapters';
import type { IEcosystemAdapter } from '../../vscode-extension/src/ecosystemAdapter';
import { isMcpTool, extractMcpServerName } from '../../vscode-extension/src/workspaceHelpers';
import { resolveFileUri } from '../../vscode-extension/src/workspacePathResolver';
import { parseSessionFileContent } from '../../vscode-extension/src/sessionParser';
import { estimateTokensFromText, getModelFromRequest, isJsonlContent, estimateTokensFromJsonlSession, calculateEstimatedCost, extractAllTokensFromDebugLog } from '../../vscode-extension/src/tokenEstimation';
import { extractDailyFractions } from '../../vscode-extension/src/dailyAttribution';
import { toLocalDayKey } from '../../vscode-extension/src/utils/dayKeys';
import { isJetBrainsSessionPath } from '../../vscode-extension/src/adapters/adapterPredicates';
import { parseJetBrainsPartition } from '../../vscode-extension/src/jetbrains';
import type { DetailedStats, ModelUsage, UsageAnalysisStats, WorkspaceCustomizationMatrix } from '../../vscode-extension/src/types';
import { analyzeSessionUsage, mergeUsageAnalysis, getModelUsageFromSession } from '../../vscode-extension/src/usageAnalysis';
import { withErrorRecovery } from '../../vscode-extension/src/utils/errors';
import * as vscodeStub from './vscode-stub';
import { loadCache, saveCache, disableCache, getCached, setCached, getCacheStats } from './cliCache';
import { ENVIRONMENTAL } from './constants';

// Import JSON data files
import tokenEstimatorsData from '../../vscode-extension/src/tokenEstimators.json';
import modelPricingData from '../../vscode-extension/src/modelPricing.json';
import toolNamesData from '../../vscode-extension/src/toolNames.json';

// Pure analysis helpers from analysis.ts
import {
	type SessionData,
	type DailyEntry,
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
export type { SessionData, DailyEntry } from './analysis';
export { effectiveTokens, buildChartPayload, fmt, formatTokens } from './analysis';

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
 *   then checks for .github/copilot-instructions.md, agents.md, or CLAUDE.md.
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
				const [hasInstructions, hasAgentsMd, hasClaudeMd] = await Promise.all([
					fs.promises.access(path.join(wsPath, '.github', 'copilot-instructions.md')).then(() => true).catch(() => false),
					fs.promises.access(path.join(wsPath, 'agents.md')).then(() => true).catch(() => false),
					fs.promises.access(path.join(wsPath, 'CLAUDE.md')).then(() => true).catch(() => false),
				]);
				return !hasInstructions && !hasAgentsMd && !hasClaudeMd;
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
async function readDebugLogTokensForSession(sessionFilePath: string, verbose = false): Promise<{
	inputTokens: number; outputTokens: number; cachedTokens: number;
	modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }>;
} | null> {
	const sessionId = path.basename(sessionFilePath, path.extname(sessionFilePath));
	if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(sessionId)) { return null; }
	
	// Normalize to forward slashes for consistent regex matching
	const norm = sessionFilePath.replace(/\\/g, '/');
	const wsHashMatch = norm.match(/^(.*\/workspaceStorage\/[^/]+)\//);
	if (!wsHashMatch) { return null; }
	
	// Use the normalized match length to extract from the normalized path, then convert back
	const normalizedHashDir = wsHashMatch[1];
	const workspaceHashDir = normalizedHashDir.replace(/\//g, '\\');
	
	const extensionFolders = ['GitHub.copilot-chat', 'github.copilot-chat', 'GitHub.copilot', 'github.copilot'];
	for (const extFolder of extensionFolders) {
		const debugLogPath = path.join(workspaceHashDir, extFolder, 'debug-logs', sessionId, 'main.jsonl');
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
			const result = estimateTokensFromJsonlSession(content);
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
					fileModelUsage = { [modelKey]: { inputTokens: jbResult.tokens, outputTokens: 0 } };
				}
			}

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
			fileModelUsage = result.modelUsage as ModelUsage;
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
				fileModelUsage = {};
				for (const [model, bd] of Object.entries(debugLogTokens.modelBreakdown)) {
					fileModelUsage[model] = { inputTokens: bd.inputTokens, outputTokens: bd.outputTokens, ...(bd.cachedTokens > 0 ? { cachedReadTokens: bd.cachedTokens } : {}) };
				}
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
		period.co2 = (period.tokens / 1000) * ENVIRONMENTAL.CO2_PER_1K_TOKENS;
		period.treesEquivalent = period.co2 / ENVIRONMENTAL.CO2_ABSORPTION_PER_TREE_PER_YEAR;
		period.waterUsage = (period.tokens / 1000) * ENVIRONMENTAL.WATER_USAGE_PER_1K_TOKENS;
		period.estimatedCost = calculateEstimatedCost(period.modelUsage, modelPricing);
		period.estimatedCostCopilot = calculateEstimatedCost(period.modelUsage, modelPricing, 'copilot');
	}

	return {
		...periods,
		lastUpdated: now,
	};
}

/**
 * Calculate usage analysis stats for fluency scoring.
 * This is a simplified version that uses the shared usageAnalysis module.
 */
export async function calculateUsageAnalysisStats(sessionFiles: string[]): Promise<UsageAnalysisStats> {
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

	for (const file of sessionFiles) {
		try {
			const stats = await statSessionFile(file);
			const modified = stats.mtime;

			if (modified < cutoffStart) {
				continue;
			}

			const analysis = await analyzeSessionUsage(deps, file);

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
	};
}

/**
 * Process session files and return per-day stats for the last 30 days.
 * Returns `{ labels, days }` where labels are sorted YYYY-MM-DD strings (UTC) and
 * days are the corresponding aggregated stats.
 */
export async function calculateDailyStats(sessionFiles: string[], verbose = false): Promise<{
	labels: string[];
	days: DailyEntry[];
	allDaysMap: Map<string, DailyEntry>;
}> {
	const now = new Date();
	const last30DaysDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
	const last30DaysStartKey = toLocalDayKey(last30DaysDate);
	const todayKey = toLocalDayKey(now);

	// Fill in all 31 days (today inclusive) with zeroes so the chart has continuous labels
	const dailyMap = new Map<string, DailyEntry>();
	const cursor = new Date(last30DaysDate);
	while (toLocalDayKey(cursor) <= todayKey) {
		const key = toLocalDayKey(cursor);
		dailyMap.set(key, { tokens: 0, sessions: 0, modelUsage: {}, editorUsage: {} });
		cursor.setDate(cursor.getDate() + 1);
	}

	// Full historical map (all time, no age filter) for weekly/monthly chart periods
	const allDaysMap = new Map<string, DailyEntry>();

	const sessionResults = await runWithConcurrency(sessionFiles, async (file) => processSessionFile(file, verbose));

	for (const data of sessionResults) {
		if (!data || data.tokens === 0 || data.interactions === 0) { continue; }

		const displayTok = effectiveTokens(data);

		for (const [dateKey, fraction] of Object.entries(data.dailyFractions)) {
			const tokForDay = Math.round(displayTok * fraction);

			// 30-day map: only add days within the window
			const dailyEntry = dailyMap.get(dateKey);
			if (dailyEntry) {
				dailyEntry.tokens += tokForDay;
				dailyEntry.sessions++;
				for (const [model, usage] of Object.entries(data.modelUsage)) {
					if (!dailyEntry.modelUsage[model]) {
						dailyEntry.modelUsage[model] = { inputTokens: 0, outputTokens: 0 };
					}
					dailyEntry.modelUsage[model].inputTokens += Math.round(usage.inputTokens * fraction);
					dailyEntry.modelUsage[model].outputTokens += Math.round(usage.outputTokens * fraction);
					if (usage.cachedReadTokens !== undefined) {
						dailyEntry.modelUsage[model].cachedReadTokens = (dailyEntry.modelUsage[model].cachedReadTokens ?? 0) + Math.round(usage.cachedReadTokens * fraction);
					}
					if (usage.cacheCreationTokens !== undefined) {
						dailyEntry.modelUsage[model].cacheCreationTokens = (dailyEntry.modelUsage[model].cacheCreationTokens ?? 0) + Math.round(usage.cacheCreationTokens * fraction);
					}
				}
				const editor = data.editorSource;
				if (!dailyEntry.editorUsage[editor]) {
					dailyEntry.editorUsage[editor] = { tokens: 0, sessions: 0 };
				}
				dailyEntry.editorUsage[editor].tokens += tokForDay;
				dailyEntry.editorUsage[editor].sessions++;
			}

			// Full history map: always add regardless of age (used for weekly/monthly charts)
			if (!allDaysMap.has(dateKey)) {
				allDaysMap.set(dateKey, { tokens: 0, sessions: 0, modelUsage: {}, editorUsage: {} });
			}
			const allEntry = allDaysMap.get(dateKey)!;
			allEntry.tokens += tokForDay;
			allEntry.sessions++;
			for (const [model, usage] of Object.entries(data.modelUsage)) {
				if (!allEntry.modelUsage[model]) {
					allEntry.modelUsage[model] = { inputTokens: 0, outputTokens: 0 };
				}
				allEntry.modelUsage[model].inputTokens += Math.round(usage.inputTokens * fraction);
				allEntry.modelUsage[model].outputTokens += Math.round(usage.outputTokens * fraction);
				if (usage.cachedReadTokens !== undefined) {
					allEntry.modelUsage[model].cachedReadTokens = (allEntry.modelUsage[model].cachedReadTokens ?? 0) + Math.round(usage.cachedReadTokens * fraction);
				}
				if (usage.cacheCreationTokens !== undefined) {
					allEntry.modelUsage[model].cacheCreationTokens = (allEntry.modelUsage[model].cacheCreationTokens ?? 0) + Math.round(usage.cacheCreationTokens * fraction);
				}
			}
			const editor = data.editorSource;
			if (!allEntry.editorUsage[editor]) {
				allEntry.editorUsage[editor] = { tokens: 0, sessions: 0 };
			}
			allEntry.editorUsage[editor].tokens += tokForDay;
			allEntry.editorUsage[editor].sessions++;
		}
	}

	const labels = Array.from(dailyMap.keys()).sort();
	const days = labels.map(l => dailyMap.get(l)!);
	return { labels, days, allDaysMap };
}

/** Environmental impact constants export for use in commands */
export { ENVIRONMENTAL } from './constants';

/** Model pricing data export */
export { modelPricing, tokenEstimators, toolNameMap };

/** Cache lifecycle — re-export for use in commands */
export { loadCache, saveCache, disableCache, getCacheStats } from './cliCache';
