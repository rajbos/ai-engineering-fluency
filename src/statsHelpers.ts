/**
 * Pure helper functions for token stats aggregation.
 *
 * These functions have no VS Code or filesystem dependencies and can be
 * imported by extension.ts and exercised in isolation by unit tests.
 */

import type { ModelUsage, EditorUsage, DailyTokenStats, SessionFileCache, LanguageUsage, DailyRollupEntry } from './types';
import { toLocalDayKey } from './utils/dayKeys';

/**
 * Editor display names that bill through GitHub Copilot's AI-Credit system.
 * Sessions from these editors should use `copilotPricing` when computing costs.
 * All other editors are billed directly by their own provider (use `provider` pricing).
 */
export const COPILOT_EDITOR_NAMES = new Set([
	'VS Code', 'VS Code Insiders', 'VS Code Exploration',
	'VS Code Server', 'VS Code Server (Insiders)', 'VSCodium',
	'Visual Studio', 'JetBrains', 'Copilot CLI', 'Copilot CLI (App)', 'MS Scout (Copilot CLI)',
]);

/**
 * Computes a session's total token count from input, output, and thinking tokens.
 *
 * Cached (cache-read) tokens are deliberately excluded: they are already a
 * subset of `inputTokens` (see `ModelUsage.inputTokens`), not an additive
 * amount, so adding them again here would double-count and inflate the total.
 */
export function computeSessionTotalTokens(inputTokens: number, outputTokens: number, thinkingTokens: number): number {
	return inputTokens + outputTokens + thinkingTokens;
}

/**
 * Computes a session's duration in milliseconds from its first and last
 * interaction timestamps (ISO strings). Returns undefined when either
 * timestamp is missing/invalid or the range is negative.
 */
export function computeSessionDurationMs(firstInteraction: string | null | undefined, lastInteraction: string | null | undefined): number | undefined {
	if (!firstInteraction || !lastInteraction) { return undefined; }
	const start = new Date(firstInteraction).getTime();
	const end = new Date(lastInteraction).getTime();
	if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) { return undefined; }
	return end - start;
}

/**
 * Merges `source` model usage into `target` (in-place).
 * All four token fields are summed: inputTokens, outputTokens,
 * cachedReadTokens (optional), and cacheCreationTokens (optional).
 */
export function addModelUsage(target: ModelUsage, source: ModelUsage): void {
for (const [model, usage] of Object.entries(source)) {
if (!target[model]) { target[model] = { inputTokens: 0, outputTokens: 0, sessions: 0 }; }
target[model].inputTokens += usage.inputTokens;
target[model].outputTokens += usage.outputTokens;
if (usage.cachedReadTokens !== undefined) {
target[model].cachedReadTokens = (target[model].cachedReadTokens ?? 0) + usage.cachedReadTokens;
}
if (usage.cacheCreationTokens !== undefined) {
target[model].cacheCreationTokens = (target[model].cacheCreationTokens ?? 0) + usage.cacheCreationTokens;
}
if (usage.thinkingTokens !== undefined) {
target[model].thinkingTokens = (target[model].thinkingTokens ?? 0) + usage.thinkingTokens;
}
if (usage.sessions !== undefined) {
target[model].sessions = (target[model].sessions ?? 0) + usage.sessions;
}
}
}

/**
 * Rescales a per-model usage breakdown so its input/output totals match an
 * authoritative target (e.g. a debug log or OTel export), while preserving each
 * model's relative share of the original breakdown.
 *
 * Needed because "Total tokens" and the per-model `modelUsage` map used for the
 * "Input tokens" / "Output tokens" rows and cost estimates are sometimes derived
 * from different sources that don't always agree — e.g. a debug log's per-request
 * `model` attribute can be missing on some requests, so the per-model breakdown
 * undercounts relative to the debug log's own total. Left unreconciled, Input +
 * Output can end up higher or lower than Total in the UI, and cost estimates
 * (computed from `modelUsage`) inherit the same drift.
 *
 * Any target total not covered by the known models — because `modelUsage` has no
 * usable per-model split at all, or due to rounding — is attributed to a
 * synthetic `unknown` bucket (consistent with how `calculateEstimatedCost`
 * already treats unpriced/unrecognized models: it appears in totals but
 * contributes $0 to cost) so Input + Output always equals the target total.
 */
export function reconcileModelUsageToTotal(modelUsage: ModelUsage, targetInputTokens: number, targetOutputTokens: number): ModelUsage {
	if (targetInputTokens + targetOutputTokens <= 0) { return modelUsage; }
	const currentInput = Object.values(modelUsage).reduce((s, u) => s + u.inputTokens, 0);
	const currentOutput = Object.values(modelUsage).reduce((s, u) => s + u.outputTokens, 0);
	const inputScale = currentInput > 0 ? targetInputTokens / currentInput : 0;
	const outputScale = currentOutput > 0 ? targetOutputTokens / currentOutput : 0;
	const result: ModelUsage = {};
	let scaledInputTotal = 0;
	let scaledOutputTotal = 0;
	for (const [model, usage] of Object.entries(modelUsage)) {
		const inputTokens = Math.round(usage.inputTokens * inputScale);
		const outputTokens = Math.round(usage.outputTokens * outputScale);
		scaledInputTotal += inputTokens;
		scaledOutputTotal += outputTokens;
		result[model] = {
			inputTokens, outputTokens,
			...(usage.cachedReadTokens !== undefined ? { cachedReadTokens: Math.round(usage.cachedReadTokens * inputScale) } : {}),
			...(usage.cacheCreationTokens !== undefined ? { cacheCreationTokens: Math.round(usage.cacheCreationTokens * inputScale) } : {}),
			...(usage.sessions !== undefined ? { sessions: usage.sessions } : { sessions: 0 }),
		};
	}
	const residualInput = targetInputTokens - scaledInputTotal;
	const residualOutput = targetOutputTokens - scaledOutputTotal;
	if (residualInput !== 0 || residualOutput !== 0) {
		const unknown = result.unknown ?? { inputTokens: 0, outputTokens: 0, sessions: 0 };
		result.unknown = { ...unknown, inputTokens: unknown.inputTokens + residualInput, outputTokens: unknown.outputTokens + residualOutput };
	}
	return result;
}

/**
 * Reconciles a per-model usage breakdown so its input+output total matches an
 * authoritative session total (e.g. `actualTokens` from a debug log, OTel export,
 * or ecosystem adapter).
 *
 * This is needed when the breakdown source and the total source use different
 * estimation methods — for example, event-based CLI sessions estimate the session
 * total from real output via an input:output ratio, while the per-model breakdown
 * estimates input from accumulated message content scaled by a context-growth factor.
 * In sessions with large user content but small model output, the breakdown input
 * can exceed the session total, causing the details view to show "Input tokens" >
 * "Total tokens".
 *
 * Output counts are treated as authoritative when they do not already exceed the
 * total (the output value usually comes from real API counts); otherwise both input
 * and output are scaled proportionally. Any residual from rounding is swept into the
 * existing `unknown` bucket by `reconcileModelUsageToTotal`.
 */
export function reconcileModelUsageToActualTokens(modelUsage: ModelUsage, actualTokens: number): ModelUsage {
	if (actualTokens <= 0) { return modelUsage; }
	const currentInput = Object.values(modelUsage).reduce((s, u) => s + u.inputTokens, 0);
	const currentOutput = Object.values(modelUsage).reduce((s, u) => s + u.outputTokens, 0);
	const currentTotal = currentInput + currentOutput;
	if (currentTotal === 0) {
		return Object.keys(modelUsage).length === 0
			? { unknown: { inputTokens: actualTokens, outputTokens: 0, sessions: 0 } }
			: modelUsage;
	}
	if (currentTotal === actualTokens) { return modelUsage; }

	if (currentOutput > 0 && currentOutput <= actualTokens) {
		// Preserve the (presumably real) output counts and scale input to fit.
		return reconcileModelUsageToTotal(modelUsage, actualTokens - currentOutput, currentOutput);
	}

	// Proportional scaling of both input and output to the actual total.
	const inputTarget = Math.round(actualTokens * (currentInput / currentTotal));
	const outputTarget = actualTokens - inputTarget;
	return reconcileModelUsageToTotal(modelUsage, inputTarget, outputTarget);
}

/**
 * Merges `source` language usage into `target` (in-place).
 */
export function addLanguageUsage(target: LanguageUsage, source: LanguageUsage): void {
	for (const [ext, usage] of Object.entries(source)) {
		if (!target[ext]) { target[ext] = { linesAdded: 0, linesRemoved: 0 }; }
		target[ext].linesAdded += usage.linesAdded;
		target[ext].linesRemoved += usage.linesRemoved;
	}
}

function updateLocUsage(usage: { linesAdded?: number; linesRemoved?: number }, linesAdded: number, linesRemoved: number): void {
	usage.linesAdded = (usage.linesAdded ?? 0) + linesAdded;
	usage.linesRemoved = (usage.linesRemoved ?? 0) + linesRemoved;
}

/**
 * Attributes session-level LOC data to the given daily stats entry.
 * Updates totals, editorUsage LOC fields, repositoryUsage LOC fields, and languageUsage.
 */
function attributeLocToDay(dailyEntry: DailyTokenStats, sessionData: SessionFileCache, editorType: string, repository: string): void {
	const linesAdded = sessionData.linesAdded ?? 0;
	const linesRemoved = sessionData.linesRemoved ?? 0;
	if (linesAdded === 0 && linesRemoved === 0) { return; }
	updateLocUsage(dailyEntry, linesAdded, linesRemoved);
	if (!dailyEntry.editorUsage[editorType]) { dailyEntry.editorUsage[editorType] = { tokens: 0, sessions: 0 }; }
	updateLocUsage(dailyEntry.editorUsage[editorType], linesAdded, linesRemoved);
	if (!dailyEntry.repositoryUsage[repository]) { dailyEntry.repositoryUsage[repository] = { tokens: 0, sessions: 0 }; }
	updateLocUsage(dailyEntry.repositoryUsage[repository], linesAdded, linesRemoved);
	if (sessionData.languageUsage) {
		if (!dailyEntry.languageUsage) { dailyEntry.languageUsage = {}; }
		addLanguageUsage(dailyEntry.languageUsage, sessionData.languageUsage);
	}
}

/**
 * Each call increments `sessions` by 1 regardless of token count.
 */
export function addEditorUsage(target: EditorUsage, editorType: string, tokens: number): void {
if (!target[editorType]) { target[editorType] = { tokens: 0, sessions: 0 }; }
target[editorType].tokens += tokens;
target[editorType].sessions += 1;
}

/** UTC date-range keys derived from a single reference instant (`now`). */
export interface UtcDateRanges {
/** YYYY-MM-DD key for "today" in UTC. */
todayUtcKey: string;
/** YYYY-MM-DD key for the first day of the current calendar month in UTC. */
monthUtcStartKey: string;
/** YYYY-MM-DD key for the first day of the previous calendar month in UTC. */
lastMonthUtcStartKey: string;
/** YYYY-MM-DD key for the last day of the previous calendar month in UTC. */
lastMonthUtcEndKey: string;
/** YYYY-MM-DD key for the start of the rolling 30-day window in UTC. */
last30DaysUtcStartKey: string;
/** Unix timestamp (ms) for the start of the rolling 30-day window.
 *  Session files with mtime < this value are outside the 30-day window. */
last30DaysStartMs: number;
/** Unix timestamp (ms) for the first day of the previous calendar month (UTC midnight).
 *  Used as the file-load cutoff for "Previous Month" stats so April 1–12 sessions
 *  are not excluded when today falls in the first half of the following month. */
lastMonthStartMs: number;
}

/**
 * Computes the local-calendar date-range boundaries used for period attribution.
 *
 * All calculations use the local timezone so that "today", "this month", and
 * "last 30 days" reflect the user's local clock rather than UTC. This prevents
 * counters from resetting at UTC midnight for users in non-UTC timezones.
 */
export function computeUtcDateRanges(now: Date): UtcDateRanges {
const todayUtcKey = toLocalDayKey(now);

const monthUtcStartKey = toLocalDayKey(new Date(now.getFullYear(), now.getMonth(), 1));

const lastMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0); // day 0 = last day of previous month
const lastMonthUtcEndKey = toLocalDayKey(lastMonthLastDay);
const lastMonthUtcStartKey = toLocalDayKey(new Date(lastMonthLastDay.getFullYear(), lastMonthLastDay.getMonth(), 1));

const last30DaysStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
const last30DaysUtcStartKey = toLocalDayKey(last30DaysStart);
const last30DaysStartMs = last30DaysStart.getTime();

const lastMonthStart = new Date(lastMonthLastDay.getFullYear(), lastMonthLastDay.getMonth(), 1);
const lastMonthStartMs = lastMonthStart.getTime();

return {
todayUtcKey,
monthUtcStartKey,
lastMonthUtcStartKey,
lastMonthUtcEndKey,
last30DaysUtcStartKey,
last30DaysStartMs,
lastMonthStartMs,
};
}

// ── aggregatePeriodStats helpers ─────────────────────────────────────────────

type ApsRollupAccs = {
	todayStats: PeriodAccumulator; monthStats: PeriodAccumulator;
	lastMonthStats: PeriodAccumulator; last30DaysStats: PeriodAccumulator;
	dailyStatsMap: Map<string, DailyTokenStats>;
};

type ApsDayFields = {
	tokens: number; estimatedTokens: number; actualTokens: number;
	thinkingTokens: number; cachedTokens: number; interactions: number;
	editorType: string; modelUsage: ModelUsage;
};

type ApsSessionFlags = { last30Days: boolean; month: boolean; lastMonth: boolean; today: boolean };

function _apsGetOrCreateDailyEntry(dailyStatsMap: Map<string, DailyTokenStats>, dayKey: string): DailyTokenStats {
	if (!dailyStatsMap.has(dayKey)) {
		dailyStatsMap.set(dayKey, { date: dayKey, tokens: 0, sessions: 0, interactions: 0, modelUsage: {}, editorUsage: {}, repositoryUsage: {} });
	}
	return dailyStatsMap.get(dayKey)!;
}

function _apsBumpDailyEntry(entry: DailyTokenStats, tokens: number, interactions: number, editorType: string, repository: string, modelUsage: ModelUsage): void {
	entry.tokens += tokens;
	entry.sessions += 1;
	entry.interactions += interactions;
	if (!entry.editorUsage[editorType]) { entry.editorUsage[editorType] = { tokens: 0, sessions: 0 }; }
	entry.editorUsage[editorType].tokens += tokens;
	entry.editorUsage[editorType].sessions += 1;
	if (!entry.repositoryUsage[repository]) { entry.repositoryUsage[repository] = { tokens: 0, sessions: 0 }; }
	entry.repositoryUsage[repository].tokens += tokens;
	entry.repositoryUsage[repository].sessions += 1;
	addModelUsage(entry.modelUsage, modelUsage);
	for (const model of Object.keys(modelUsage)) {
		if (!entry.modelUsage[model].sessions) { entry.modelUsage[model].sessions = 0; }
		entry.modelUsage[model].sessions += 1;
	}
	if (!entry.editorModelUsage) { entry.editorModelUsage = {}; }
	if (!entry.editorModelUsage[editorType]) { entry.editorModelUsage[editorType] = {}; }
	addModelUsage(entry.editorModelUsage[editorType], modelUsage);
	for (const model of Object.keys(modelUsage)) {
		if (!entry.editorModelUsage[editorType][model].sessions) { entry.editorModelUsage[editorType][model].sessions = 0; }
		entry.editorModelUsage[editorType][model].sessions += 1;
	}
}

function _apsBumpPeriod(acc: PeriodAccumulator, f: ApsDayFields, freshSession: boolean): void {
	acc.tokens += f.tokens;
	acc.estimatedTokens += f.estimatedTokens;
	acc.actualTokens += f.actualTokens;
	acc.thinkingTokens += f.thinkingTokens;
	acc.cachedTokens += f.cachedTokens;
	acc.interactions += f.interactions;
	if (freshSession) { acc.sessions += 1; }
	addEditorUsage(acc.editorUsage, f.editorType, f.tokens);
	addModelUsage(acc.modelUsage, f.modelUsage);
}

function _apsProcessRollupDay(dayKey: string, dr: DailyRollupEntry, ranges: UtcDateRanges, accs: ApsRollupAccs, editorType: string, repository: string, flags: ApsSessionFlags): void {
	const inLast30Days = dayKey >= ranges.last30DaysUtcStartKey;
	const inLastMonth = dayKey >= ranges.lastMonthUtcStartKey && dayKey <= ranges.lastMonthUtcEndKey;
	if (!inLast30Days && !inLastMonth) { return; }
	const dayTokens = dr.actualTokens > 0 ? dr.actualTokens : dr.tokens;
	const f: ApsDayFields = { tokens: dayTokens, estimatedTokens: dr.tokens, actualTokens: dr.actualTokens, thinkingTokens: dr.thinkingTokens, cachedTokens: dr.cachedReadTokens ?? 0, interactions: dr.interactions, editorType, modelUsage: dr.modelUsage };
	if (inLast30Days) {
		const entry = _apsGetOrCreateDailyEntry(accs.dailyStatsMap, dayKey);
		_apsBumpDailyEntry(entry, dayTokens, dr.interactions, editorType, repository, dr.modelUsage);
		_apsBumpPeriod(accs.last30DaysStats, f, !flags.last30Days);
		flags.last30Days = true;
	}
	if (dayKey >= ranges.monthUtcStartKey) {
		_apsBumpPeriod(accs.monthStats, f, !flags.month);
		flags.month = true;
		if (dayKey === ranges.todayUtcKey) { _apsBumpPeriod(accs.todayStats, f, !flags.today); flags.today = true; }
	} else if (inLastMonth) {
		_apsBumpPeriod(accs.lastMonthStats, f, !flags.lastMonth);
		flags.lastMonth = true;
	}
}

function _apsProcessRollupSession(sessionInput: SessionAggregateInput, ranges: UtcDateRanges, accs: ApsRollupAccs): { addedToLast30Days: boolean; addedToLastMonth: boolean } {
	const { editorType, sessionData } = sessionInput;
	const repository = sessionData.repository || 'Unknown';
	const flags: ApsSessionFlags = { last30Days: false, month: false, lastMonth: false, today: false };
	for (const [dayKey, dr] of Object.entries(sessionData.dailyRollups!)) {
		_apsProcessRollupDay(dayKey, dr, ranges, accs, editorType, repository, flags);
	}
	if (flags.last30Days && sessionData.linesAdded !== undefined) {
		const locDay = Object.keys(sessionData.dailyRollups!).sort().filter(k => k >= ranges.last30DaysUtcStartKey).pop();
		if (locDay) {
			const locEntry = accs.dailyStatsMap.get(locDay);
			if (locEntry) { attributeLocToDay(locEntry, sessionData, editorType, repository); }
		}
	}
	return { addedToLast30Days: flags.last30Days, addedToLastMonth: flags.lastMonth };
}

/**
 * Build ApsDayFields object from session data.
 */
function _apsBuildDayFields(sessionData: SessionFileCache, editorType: string): ApsDayFields {
	const actualTokens = sessionData.actualTokens || 0;
	const estimatedTokens = sessionData.tokens;
	const tokens = actualTokens > 0 ? actualTokens : estimatedTokens;
	return {
		tokens,
		estimatedTokens,
		actualTokens,
		thinkingTokens: sessionData.thinkingTokens || 0,
		cachedTokens: sessionData.cacheReadTokens || 0,
		interactions: sessionData.interactions,
		editorType,
		modelUsage: sessionData.modelUsage
	};
}

/**
 * Process fallback session for last 30 days period.
 */
function _apsProcessFallback30Days(entry: DailyTokenStats, f: ApsDayFields, sessionInput: SessionAggregateInput, repository: string, accs: ApsRollupAccs): void {
	_apsBumpDailyEntry(entry, f.tokens, sessionInput.sessionData.interactions, sessionInput.editorType, repository, sessionInput.sessionData.modelUsage);
	attributeLocToDay(entry, sessionInput.sessionData, sessionInput.editorType, repository);
	_apsBumpPeriod(accs.last30DaysStats, f, true);
}

/**
 * Process fallback session for month/today/last-month periods.
 */
function _apsProcessFallbackPeriods(lastActivityUtcKey: string, ranges: UtcDateRanges, accs: ApsRollupAccs, f: ApsDayFields): void {
	if (lastActivityUtcKey >= ranges.monthUtcStartKey) {
		_apsBumpPeriod(accs.monthStats, f, true);
		if (lastActivityUtcKey === ranges.todayUtcKey) { _apsBumpPeriod(accs.todayStats, f, true); }
	} else {
		_apsBumpPeriod(accs.lastMonthStats, f, true);
	}
}

function _apsProcessFallbackSession(sessionInput: SessionAggregateInput, ranges: UtcDateRanges, accs: ApsRollupAccs): boolean {
	const { editorType, sessionData, mtime, lastInteraction } = sessionInput;
	const repository = sessionData.repository || 'Unknown';
	const lastActivity = lastInteraction ? new Date(lastInteraction) : new Date(mtime);
	const lastActivityUtcKey = toLocalDayKey(lastActivity);
	const inLast30Days = lastActivityUtcKey >= ranges.last30DaysUtcStartKey;
	const inLastMonth = lastActivityUtcKey >= ranges.lastMonthUtcStartKey && lastActivityUtcKey <= ranges.lastMonthUtcEndKey;
	
	if (!inLast30Days && !inLastMonth) { return true; }
	
	const f = _apsBuildDayFields(sessionData, editorType);
	
	if (inLast30Days) {
		const entry = _apsGetOrCreateDailyEntry(accs.dailyStatsMap, lastActivityUtcKey);
		_apsProcessFallback30Days(entry, f, sessionInput, repository, accs);
	}
	
	_apsProcessFallbackPeriods(lastActivityUtcKey, ranges, accs, f);
	
	return false;
}

export interface SessionAggregateInput {
editorType: string;
sessionData: SessionFileCache;
mtime: number; // ms since epoch (from fs.stat().mtime.getTime())
/**
 * Pre-merged last-interaction ISO timestamp.
 * Callers should pass `sessionData.lastInteraction || details.lastInteraction`.
 * When absent or null the file `mtime` is used as the attribution timestamp.
 */
lastInteraction?: string | null;
}

/** Running totals for a single time window (today / month / last-month / last-30-days). */
export interface PeriodAccumulator {
tokens: number;
thinkingTokens: number;
cachedTokens: number;
estimatedTokens: number;
actualTokens: number;
sessions: number;
interactions: number;
modelUsage: ModelUsage;
editorUsage: EditorUsage;
/** Per-editor model usage breakdown — mirrors DailyTokenStats.editorModelUsage. Used to compute accurate cost-by-billing-group totals for the period. */
editorModelUsage: { [editor: string]: ModelUsage };
/** Sum of exact Copilot billing costs (in USD) for sessions that have nanoAiu data. */
exactCopilotCostDollars: number;
/** Model usage for Copilot-surface sessions that do NOT have exact nanoAiu billing data (used as fallback for Copilot cost estimate). Non-Copilot surfaces (Claude Code, Gemini CLI, …) are excluded — they bill their own provider. */
modelUsageNoExact: ModelUsage;
}

/** Result returned by `aggregatePeriodStats`. */
export interface AggregateResult {
todayStats: PeriodAccumulator;
monthStats: PeriodAccumulator;
lastMonthStats: PeriodAccumulator;
last30DaysStats: PeriodAccumulator;
dailyStatsMap: Map<string, DailyTokenStats>;
/** Number of sessions that contributed nothing to the last-30-days window. */
skippedCount: number;
}

export function makePeriodAccumulator(): PeriodAccumulator {
return {
tokens: 0,
thinkingTokens: 0,
cachedTokens: 0,
estimatedTokens: 0,
actualTokens: 0,
sessions: 0,
interactions: 0,
modelUsage: {},
editorUsage: {},
editorModelUsage: {},
exactCopilotCostDollars: 0,
modelUsageNoExact: {},
};
}

interface PeriodAccumulators {
	todayStats: PeriodAccumulator;
	monthStats: PeriodAccumulator;
	lastMonthStats: PeriodAccumulator;
	last30DaysStats: PeriodAccumulator;
}

function getOrCreateDailyEntry(dailyStatsMap: Map<string, DailyTokenStats>, dayKey: string): DailyTokenStats {
	if (!dailyStatsMap.has(dayKey)) {
		dailyStatsMap.set(dayKey, { date: dayKey, tokens: 0, sessions: 0, interactions: 0, modelUsage: {}, editorUsage: {}, repositoryUsage: {} });
	}
	return dailyStatsMap.get(dayKey)!;
}

function addToDailyEntry(entry: DailyTokenStats, tokens: number, interactions: number, editorType: string, repository: string, modelUsage: ModelUsage): void {
	entry.tokens += tokens; entry.sessions += 1; entry.interactions += interactions;
	if (!entry.editorUsage[editorType]) { entry.editorUsage[editorType] = { tokens: 0, sessions: 0 }; }
	entry.editorUsage[editorType].tokens += tokens; entry.editorUsage[editorType].sessions += 1;
	if (!entry.repositoryUsage[repository]) { entry.repositoryUsage[repository] = { tokens: 0, sessions: 0 }; }
	entry.repositoryUsage[repository].tokens += tokens; entry.repositoryUsage[repository].sessions += 1;
	addModelUsage(entry.modelUsage, modelUsage);
	for (const model of Object.keys(modelUsage)) {
		if (!entry.modelUsage[model].sessions) { entry.modelUsage[model].sessions = 0; }
		entry.modelUsage[model].sessions += 1;
	}
	if (!entry.editorModelUsage) { entry.editorModelUsage = {}; }
	if (!entry.editorModelUsage[editorType]) { entry.editorModelUsage[editorType] = {}; }
	addModelUsage(entry.editorModelUsage[editorType], modelUsage);
	for (const model of Object.keys(modelUsage)) {
		if (!entry.editorModelUsage[editorType][model].sessions) { entry.editorModelUsage[editorType][model].sessions = 0; }
		entry.editorModelUsage[editorType][model].sessions += 1;
	}
}

function accumulatePeriod(acc: PeriodAccumulator, tokens: number, estimated: number, actual: number, thinking: number, cached: number, interactions: number, countSession: boolean, editorType: string, modelUsage: ModelUsage, copilotExactCostDollars?: number): void {
	acc.tokens += tokens; acc.estimatedTokens += estimated; acc.actualTokens += actual;
	acc.thinkingTokens += thinking; acc.cachedTokens += cached; acc.interactions += interactions;
	if (countSession) { acc.sessions += 1; }
	addEditorUsage(acc.editorUsage, editorType, tokens);
	addModelUsage(acc.modelUsage, modelUsage);
	if (!acc.editorModelUsage[editorType]) { acc.editorModelUsage[editorType] = {}; }
	addModelUsage(acc.editorModelUsage[editorType], modelUsage);
	if (copilotExactCostDollars !== undefined) {
		acc.exactCopilotCostDollars += copilotExactCostDollars;
	} else if (COPILOT_EDITOR_NAMES.has(editorType)) {
		// Only Copilot surfaces feed the Copilot cost-estimate fallback; sessions from
		// other tools (Claude Code, Gemini CLI, …) bill their own provider and would
		// otherwise inflate the estimated GitHub Copilot spend.
		addModelUsage(acc.modelUsageNoExact, modelUsage);
	}
}

function processOneRollupDay(dayKey: string, dayRollup: any, flags: { addedToLast30Days: boolean; addedToMonth: boolean; addedToLastMonth: boolean; addedToToday: boolean }, acc: PeriodAccumulators, dates: UtcDateRanges, editorType: string, dailyStatsMap: Map<string, DailyTokenStats>, repository: string): void {
	const inLast30Days = dayKey >= dates.last30DaysUtcStartKey;
	const inLastMonth = dayKey >= dates.lastMonthUtcStartKey && dayKey <= dates.lastMonthUtcEndKey;
	if (!inLast30Days && !inLastMonth) { return; }
	const dayTokens = dayRollup.actualTokens > 0 ? dayRollup.actualTokens : dayRollup.tokens;
	const dayInteractions = dayRollup.interactions;
	const cached = dayRollup.cachedReadTokens ?? 0;
	if (inLast30Days) {
		const entry = getOrCreateDailyEntry(dailyStatsMap, dayKey);
		addToDailyEntry(entry, dayTokens, dayInteractions, editorType, repository, dayRollup.modelUsage);
		accumulatePeriod(acc.last30DaysStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToLast30Days, editorType, dayRollup.modelUsage, dayRollup.copilotExactCostDollars);
		flags.addedToLast30Days = true;
	}
	if (dayKey >= dates.monthUtcStartKey) {
		accumulatePeriod(acc.monthStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToMonth, editorType, dayRollup.modelUsage, dayRollup.copilotExactCostDollars);
		flags.addedToMonth = true;
		if (dayKey === dates.todayUtcKey) {
			accumulatePeriod(acc.todayStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToToday, editorType, dayRollup.modelUsage, dayRollup.copilotExactCostDollars);
			flags.addedToToday = true;
		}
	} else if (inLastMonth) {
		accumulatePeriod(acc.lastMonthStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToLastMonth, editorType, dayRollup.modelUsage, dayRollup.copilotExactCostDollars);
		flags.addedToLastMonth = true;
	}
}

function processRollupPath(input: SessionAggregateInput, acc: PeriodAccumulators, dates: UtcDateRanges, dailyStatsMap: Map<string, DailyTokenStats>): boolean {
	const { editorType, sessionData } = input;
	const repository = sessionData.repository || 'Unknown';
	const flags = { addedToLast30Days: false, addedToMonth: false, addedToLastMonth: false, addedToToday: false };
	for (const [dayKey, dayRollup] of Object.entries(sessionData.dailyRollups!)) {
		processOneRollupDay(dayKey, dayRollup, flags, acc, dates, editorType, dailyStatsMap, repository);
	}
	if (flags.addedToLast30Days && sessionData.linesAdded !== undefined) {
		const dayKeys = Object.keys(sessionData.dailyRollups!).sort();
		const locDay = dayKeys.filter(k => k >= dates.last30DaysUtcStartKey).pop();
		if (locDay) { const locEntry = dailyStatsMap.get(locDay); if (locEntry) { attributeLocToDay(locEntry, sessionData, editorType, repository); } }
	}
	return !flags.addedToLast30Days && !flags.addedToLastMonth;
}

function processFallbackPath(input: SessionAggregateInput, acc: PeriodAccumulators, dates: UtcDateRanges, dailyStatsMap: Map<string, DailyTokenStats>): boolean {
	const { editorType, sessionData, mtime, lastInteraction } = input;
	const repository = sessionData.repository || 'Unknown';
	const estimatedTokens = sessionData.tokens;
	const actualTokens = sessionData.actualTokens || 0;
	const tokens = actualTokens > 0 ? actualTokens : estimatedTokens;
	const thinking = sessionData.thinkingTokens || 0;
	const cached = sessionData.cacheReadTokens || 0;
	const lastActivity = lastInteraction ? new Date(lastInteraction) : new Date(mtime);
	const lastActivityUtcKey = toLocalDayKey(lastActivity);
	const inLast30Days = lastActivityUtcKey >= dates.last30DaysUtcStartKey;
	const inLastMonth = lastActivityUtcKey >= dates.lastMonthUtcStartKey && lastActivityUtcKey <= dates.lastMonthUtcEndKey;
	if (!inLast30Days && !inLastMonth) { return true; }
	if (inLast30Days) {
		const dailyEntry = getOrCreateDailyEntry(dailyStatsMap, lastActivityUtcKey);
		addToDailyEntry(dailyEntry, tokens, sessionData.interactions, editorType, repository, sessionData.modelUsage);
		if (sessionData.linesAdded !== undefined) { attributeLocToDay(dailyEntry, sessionData, editorType, repository); }
		accumulatePeriod(acc.last30DaysStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage, sessionData.copilotExactCostDollars);
	}
	if (lastActivityUtcKey >= dates.monthUtcStartKey) {
		accumulatePeriod(acc.monthStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage, sessionData.copilotExactCostDollars);
		if (lastActivityUtcKey === dates.todayUtcKey) {
			accumulatePeriod(acc.todayStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage, sessionData.copilotExactCostDollars);
		}
	} else if (inLastMonth) {
		accumulatePeriod(acc.lastMonthStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage, sessionData.copilotExactCostDollars);
	}
	return false;
}

/**
 * Accumulates per-session token data into period buckets and a per-day map.
 *
 * Both the daily-rollup path (sessions with `dailyRollups`) and the
 * session-level fallback path (no rollups) are handled here.  All date
 * comparisons use UTC day keys (YYYY-MM-DD) so the results are identical
 * regardless of the host timezone.
 *
 * @param sessionResults  Non-null session inputs pre-filtered so that each
 *                        session's mtime is within the last-30-days window.
 *                        Null/skipped entries should be excluded before calling.
 * @param utcDateRanges   UTC day-key boundaries for the period windows.
 */
export function aggregatePeriodStats(
sessionResults: SessionAggregateInput[],
utcDateRanges: UtcDateRanges,
): AggregateResult {
const todayStats = makePeriodAccumulator();
const monthStats = makePeriodAccumulator();
const lastMonthStats = makePeriodAccumulator();
const last30DaysStats = makePeriodAccumulator();
const dailyStatsMap = new Map<string, DailyTokenStats>();
let skippedCount = 0;
const acc = { todayStats, monthStats, lastMonthStats, last30DaysStats };
for (const input of sessionResults) {
const hasRollups = input.sessionData.dailyRollups && Object.keys(input.sessionData.dailyRollups).length > 0;
const skipped = hasRollups
? processRollupPath(input, acc, utcDateRanges, dailyStatsMap)
: processFallbackPath(input, acc, utcDateRanges, dailyStatsMap);
if (skipped) { skippedCount++; }
}
return { todayStats, monthStats, lastMonthStats, last30DaysStats, dailyStatsMap, skippedCount };
}
