/**
 * Pure helper functions for token stats aggregation.
 *
 * These functions have no VS Code or filesystem dependencies and can be
 * imported by extension.ts and exercised in isolation by unit tests.
 */

import type { ModelUsage, EditorUsage, DailyTokenStats, SessionFileCache, LanguageUsage, DailyRollupEntry } from './types';
import { toLocalDayKey } from './utils/dayKeys';

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
	const lastActivityUtcKey = toLocalDayKey(lastActivity);
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
}

function accumulatePeriod(acc: PeriodAccumulator, tokens: number, estimated: number, actual: number, thinking: number, cached: number, interactions: number, countSession: boolean, editorType: string, modelUsage: ModelUsage): void {
	acc.tokens += tokens; acc.estimatedTokens += estimated; acc.actualTokens += actual;
	acc.thinkingTokens += thinking; acc.cachedTokens += cached; acc.interactions += interactions;
	if (countSession) { acc.sessions += 1; }
	addEditorUsage(acc.editorUsage, editorType, tokens);
	addModelUsage(acc.modelUsage, modelUsage);
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
		accumulatePeriod(acc.last30DaysStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToLast30Days, editorType, dayRollup.modelUsage);
		flags.addedToLast30Days = true;
	}
	if (dayKey >= dates.monthUtcStartKey) {
		accumulatePeriod(acc.monthStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToMonth, editorType, dayRollup.modelUsage);
		flags.addedToMonth = true;
		if (dayKey === dates.todayUtcKey) {
			accumulatePeriod(acc.todayStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToToday, editorType, dayRollup.modelUsage);
			flags.addedToToday = true;
		}
	} else if (inLastMonth) {
		accumulatePeriod(acc.lastMonthStats, dayTokens, dayRollup.tokens, dayRollup.actualTokens, dayRollup.thinkingTokens, cached, dayInteractions, !flags.addedToLastMonth, editorType, dayRollup.modelUsage);
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
		accumulatePeriod(acc.last30DaysStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage);
	}
	if (lastActivityUtcKey >= dates.monthUtcStartKey) {
		accumulatePeriod(acc.monthStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage);
		if (lastActivityUtcKey === dates.todayUtcKey) {
			accumulatePeriod(acc.todayStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage);
		}
	} else if (inLastMonth) {
		accumulatePeriod(acc.lastMonthStats, tokens, estimatedTokens, actualTokens, thinking, cached, sessionData.interactions, true, editorType, sessionData.modelUsage);
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
