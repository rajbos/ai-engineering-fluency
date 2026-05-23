/**
 * Pure helper functions for token stats aggregation.
 *
 * These functions have no VS Code or filesystem dependencies and can be
 * imported by extension.ts and exercised in isolation by unit tests.
 */

import type { ModelUsage, EditorUsage, DailyTokenStats, SessionFileCache, LanguageUsage, DailyRollupEntry } from './types';

/**
 * Merges `source` model usage into `target` (in-place).
 * All four token fields are summed: inputTokens, outputTokens,
 * cachedReadTokens (optional), and cacheCreationTokens (optional).
 */
export function addModelUsage(target: ModelUsage, source: ModelUsage): void {
for (const [model, usage] of Object.entries(source)) {
if (!target[model]) { target[model] = { inputTokens: 0, outputTokens: 0 }; }
target[model].inputTokens += usage.inputTokens;
target[model].outputTokens += usage.outputTokens;
if (usage.cachedReadTokens !== undefined) {
target[model].cachedReadTokens = (target[model].cachedReadTokens ?? 0) + usage.cachedReadTokens;
}
if (usage.cacheCreationTokens !== undefined) {
target[model].cacheCreationTokens = (target[model].cacheCreationTokens ?? 0) + usage.cacheCreationTokens;
}
}
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

/**
 * Attributes session-level LOC data to the given daily stats entry.
 * Updates totals, editorUsage LOC fields, repositoryUsage LOC fields, and languageUsage.
 */
function attributeLocToDay(
	dailyEntry: DailyTokenStats,
	sessionData: SessionFileCache,
	editorType: string,
	repository: string,
): void {
	const linesAdded = sessionData.linesAdded ?? 0;
	const linesRemoved = sessionData.linesRemoved ?? 0;
	if (linesAdded === 0 && linesRemoved === 0) { return; }

	dailyEntry.linesAdded = (dailyEntry.linesAdded ?? 0) + linesAdded;
	dailyEntry.linesRemoved = (dailyEntry.linesRemoved ?? 0) + linesRemoved;

	if (!dailyEntry.editorUsage[editorType]) { dailyEntry.editorUsage[editorType] = { tokens: 0, sessions: 0 }; }
	dailyEntry.editorUsage[editorType].linesAdded = (dailyEntry.editorUsage[editorType].linesAdded ?? 0) + linesAdded;
	dailyEntry.editorUsage[editorType].linesRemoved = (dailyEntry.editorUsage[editorType].linesRemoved ?? 0) + linesRemoved;

	if (!dailyEntry.repositoryUsage[repository]) { dailyEntry.repositoryUsage[repository] = { tokens: 0, sessions: 0 }; }
	dailyEntry.repositoryUsage[repository].linesAdded = (dailyEntry.repositoryUsage[repository].linesAdded ?? 0) + linesAdded;
	dailyEntry.repositoryUsage[repository].linesRemoved = (dailyEntry.repositoryUsage[repository].linesRemoved ?? 0) + linesRemoved;

	if (sessionData.languageUsage && !dailyEntry.languageUsage) { dailyEntry.languageUsage = {}; }
	if (sessionData.languageUsage && dailyEntry.languageUsage) {
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
 * Computes the UTC date-range boundaries used for period attribution.
 *
 * All calculations are UTC-based so they are unaffected by local timezone
 * offsets and DST transitions.
 */
export function computeUtcDateRanges(now: Date): UtcDateRanges {
const todayUtcKey = now.toISOString().slice(0, 10);

const monthUtcStartKey = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString().slice(0, 10);

const lastMonthLastDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0));
const lastMonthUtcEndKey = lastMonthLastDay.toISOString().slice(0, 10);
const lastMonthUtcStartKey = new Date(Date.UTC(lastMonthLastDay.getUTCFullYear(), lastMonthLastDay.getUTCMonth(), 1)).toISOString().slice(0, 10);

const last30DaysUtcStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 30));
const last30DaysUtcStartKey = last30DaysUtcStart.toISOString().slice(0, 10);
const last30DaysStartMs = last30DaysUtcStart.getTime();

const lastMonthStartMs = new Date(Date.UTC(lastMonthLastDay.getUTCFullYear(), lastMonthLastDay.getUTCMonth(), 1)).getTime();

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

function _apsProcessFallbackSession(sessionInput: SessionAggregateInput, ranges: UtcDateRanges, accs: ApsRollupAccs): boolean {
	const { editorType, sessionData, mtime, lastInteraction } = sessionInput;
	const repository = sessionData.repository || 'Unknown';
	const lastActivity = lastInteraction ? new Date(lastInteraction) : new Date(mtime);
	const lastActivityUtcKey = lastActivity.toISOString().slice(0, 10);
	const inLast30Days = lastActivityUtcKey >= ranges.last30DaysUtcStartKey;
	const inLastMonth = lastActivityUtcKey >= ranges.lastMonthUtcStartKey && lastActivityUtcKey <= ranges.lastMonthUtcEndKey;
	if (!inLast30Days && !inLastMonth) { return true; }
	const actualTokens = sessionData.actualTokens || 0;
	const estimatedTokens = sessionData.tokens;
	const tokens = actualTokens > 0 ? actualTokens : estimatedTokens;
	const f: ApsDayFields = { tokens, estimatedTokens, actualTokens, thinkingTokens: sessionData.thinkingTokens || 0, cachedTokens: sessionData.cacheReadTokens || 0, interactions: sessionData.interactions, editorType, modelUsage: sessionData.modelUsage };
	if (inLast30Days) {
		const entry = _apsGetOrCreateDailyEntry(accs.dailyStatsMap, lastActivityUtcKey);
		_apsBumpDailyEntry(entry, tokens, sessionData.interactions, editorType, repository, sessionData.modelUsage);
		attributeLocToDay(entry, sessionData, editorType, repository);
		_apsBumpPeriod(accs.last30DaysStats, f, true);
	}
	if (lastActivityUtcKey >= ranges.monthUtcStartKey) {
		_apsBumpPeriod(accs.monthStats, f, true);
		if (lastActivityUtcKey === ranges.todayUtcKey) { _apsBumpPeriod(accs.todayStats, f, true); }
	} else if (inLastMonth) {
		_apsBumpPeriod(accs.lastMonthStats, f, true);
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
	const accs: ApsRollupAccs = { todayStats, monthStats, lastMonthStats, last30DaysStats, dailyStatsMap };
	let skippedCount = 0;

	for (const session of sessionResults) {
		if (session.sessionData.dailyRollups && Object.keys(session.sessionData.dailyRollups).length > 0) {
			const { addedToLast30Days, addedToLastMonth } = _apsProcessRollupSession(session, utcDateRanges, accs);
			if (!addedToLast30Days && !addedToLastMonth) { skippedCount++; }
		} else {
			if (_apsProcessFallbackSession(session, utcDateRanges, accs)) { skippedCount++; }
		}
	}

	return { todayStats, monthStats, lastMonthStats, last30DaysStats, dailyStatsMap, skippedCount };
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
};
}



