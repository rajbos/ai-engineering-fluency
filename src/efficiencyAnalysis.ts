import type { ApplyButtonUsage, DailyTokenStats, ModelUsage, UsageAnalysisPeriod } from './types';
import { getModelDisplayName } from './webview/shared/modelUtils';

/**
 * Efficiency analysis — pure computations behind the "Efficiency" view.
 *
 * Answers the question "am I working more efficiently over time, and why?"
 * by deriving ratio series (cost per line of code, tokens per session, …),
 * a month-over-month cost decomposition (volume vs. efficiency vs. model mix),
 * period delta cards, and outcome-shaped value signals.
 *
 * This module is intentionally pure (no VS Code API dependencies) so it can be
 * unit-tested with mocked data, following the chartDataBuilder.ts pattern.
 */

// ---------------------------------------------------------------------------
// Shared deps
// ---------------------------------------------------------------------------

export interface EfficiencyDeps {
	/** Estimate USD cost for the given model usage. */
	calculateEstimatedCost: (modelUsage: ModelUsage, pricingSource: 'provider' | 'copilot') => number;
	/** Current date/time. Defaults to `new Date()` when omitted; injectable for testing. */
	now?: Date;
}

function fmtKey(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMondayOfWeek(d: Date): Date {
	const copy = new Date(d);
	copy.setHours(0, 0, 0, 0);
	const day = copy.getDay();
	copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
	return copy;
}

function fmtWeekLabel(monday: Date): string {
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	if (monday.getMonth() === sunday.getMonth()) {
		return `${monday.toLocaleDateString('en-US', { month: 'short' })} ${monday.getDate()}–${sunday.getDate()}`;
	}
	return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

// ---------------------------------------------------------------------------
// Weekly efficiency trends
// ---------------------------------------------------------------------------

/**
 * Per-session inputs for the session-derived weekly series (duration, retries,
 * apply rate). Each session is attributed entirely to the week of its last
 * activity day — sessions rarely span week boundaries, and the trend view
 * cares about direction, not day-perfect attribution.
 */
export interface EfficiencySessionInput {
	/** Local day key (YYYY-MM-DD) of the session's last activity. */
	dayKey: string;
	/** Net active duration in ms (excluding idle gaps); absent when not derivable. */
	activeDurationMs?: number;
	/** Edit turns across all models in this session (from modelEfficiency counters). */
	editTurns?: number;
	/** Edit retries across all models in this session. */
	retries?: number;
	/** Apply-button uses in this session. */
	applies?: number;
	/** Code blocks shown in this session. */
	codeBlocks?: number;
	/** User-request turns in this session (interactions). */
	interactions?: number;
	/** Estimated total tokens for this session. */
	totalTokens?: number;
	/** Agent-skill invocation counts by skill name (e.g. { graphify: 2 }); absent when none detected. */
	skillCalls?: { [skillName: string]: number };
}

/** One week of derived efficiency ratios. Ratio fields are null when the denominator is 0. */
export interface EfficiencyWeekPoint {
	/** Monday of the week, YYYY-MM-DD. */
	weekKey: string;
	/** Human label, e.g. "Jun 2–8". */
	label: string;
	sessions: number;
	tokens: number;
	/** Estimated cost in USD (Copilot AI-Credit pricing, matching the Chart view's cost series). */
	cost: number;
	/** Lines added + removed. */
	loc: number;
	interactions: number;
	tokensPerSession: number | null;
	/** Interactions (turns) per session. */
	turnsPerSession: number | null;
	/** Estimated cost per 1000 lines of code changed. */
	costPerKloc: number | null;
	locPerDollar: number | null;
	/** Average net active minutes per session (only sessions carrying duration data). */
	activeMinutesPerSession: number | null;
	/** Edit retries / edit turns across the week's sessions. */
	retryRate: number | null;
	/** Applied code blocks / shown code blocks across the week's sessions. */
	applyRate: number | null;
	/** Number of sessions that carried duration data (denominator of activeMinutesPerSession). */
	durationSessions: number;
	/** Total edit turns backing retryRate. */
	editTurns: number;
}

const DEFAULT_TREND_WEEKS = 12;
/** Minimum edit turns in a week before its retry rate is considered meaningful. */
const MIN_EDIT_TURNS_PER_WEEK = 5;

type WeekAccum = {
	monday: Date;
	sessions: number;
	tokens: number;
	cost: number;
	loc: number;
	interactions: number;
	activeDurationMs: number;
	durationSessions: number;
	editTurns: number;
	retries: number;
	applies: number;
	codeBlocks: number;
};

function emptyWeekAccum(monday: Date): WeekAccum {
	return { monday, sessions: 0, tokens: 0, cost: 0, loc: 0, interactions: 0, activeDurationMs: 0, durationSessions: 0, editTurns: 0, retries: 0, applies: 0, codeBlocks: 0 };
}

function ratio(numerator: number, denominator: number): number | null {
	return denominator > 0 ? numerator / denominator : null;
}

function foldDayIntoWeek(week: WeekAccum, day: DailyTokenStats, deps: EfficiencyDeps): void {
	week.tokens += day.tokens;
	week.sessions += day.sessions;
	week.interactions += day.interactions;
	week.loc += (day.linesAdded ?? 0) + (day.linesRemoved ?? 0);
	week.cost += deps.calculateEstimatedCost(day.modelUsage, 'copilot');
}

function foldSessionIntoWeek(week: WeekAccum, s: EfficiencySessionInput): void {
	if (s.activeDurationMs !== undefined && s.activeDurationMs > 0) {
		week.activeDurationMs += s.activeDurationMs;
		week.durationSessions += 1;
	}
	week.editTurns += s.editTurns ?? 0;
	week.retries += s.retries ?? 0;
	week.applies += s.applies ?? 0;
	week.codeBlocks += s.codeBlocks ?? 0;
}

/**
 * Builds the weekly efficiency-ratio series for the trailing `weeksBack` weeks
 * (including the current, partial week).
 *
 * Volume ratios (tokens/session, turns/session, cost/KLOC) come from the daily
 * stats; behavioural ratios (active minutes, retry rate, apply rate) come from
 * the per-session inputs.
 */
export function buildEfficiencyTrends(
	dailyStats: DailyTokenStats[],
	sessions: EfficiencySessionInput[],
	deps: EfficiencyDeps,
	weeksBack: number = DEFAULT_TREND_WEEKS,
): EfficiencyWeekPoint[] {
	const now = deps.now ?? new Date();
	const thisMonday = getMondayOfWeek(now);
	const weeks = new Map<string, WeekAccum>();
	for (let w = weeksBack - 1; w >= 0; w--) {
		const monday = new Date(thisMonday);
		monday.setDate(thisMonday.getDate() - w * 7);
		weeks.set(fmtKey(monday), emptyWeekAccum(monday));
	}

	for (const day of dailyStats) {
		const week = weeks.get(fmtKey(getMondayOfWeek(new Date(day.date + 'T00:00:00'))));
		if (week) { foldDayIntoWeek(week, day, deps); }
	}

	for (const s of sessions) {
		const week = weeks.get(fmtKey(getMondayOfWeek(new Date(s.dayKey + 'T00:00:00'))));
		if (week) { foldSessionIntoWeek(week, s); }
	}

	return Array.from(weeks.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([weekKey, w]) => ({
			weekKey,
			label: fmtWeekLabel(w.monday),
			sessions: w.sessions,
			tokens: w.tokens,
			cost: w.cost,
			loc: w.loc,
			interactions: w.interactions,
			tokensPerSession: ratio(w.tokens, w.sessions),
			turnsPerSession: ratio(w.interactions, w.sessions),
			costPerKloc: w.loc > 0 ? w.cost / (w.loc / 1000) : null,
			locPerDollar: w.cost > 0 ? w.loc / w.cost : null,
			activeMinutesPerSession: w.durationSessions > 0 ? (w.activeDurationMs / w.durationSessions) / 60_000 : null,
			retryRate: w.editTurns >= MIN_EDIT_TURNS_PER_WEEK ? w.retries / w.editTurns : null,
			applyRate: ratio(w.applies, w.codeBlocks),
			durationSessions: w.durationSessions,
			editTurns: w.editTurns,
		}));
}

// ---------------------------------------------------------------------------
// Cost attribution (volume vs. efficiency vs. model mix)
// ---------------------------------------------------------------------------

/** Aggregate figures for one side (period) of the cost decomposition. */
export interface CostAttributionSide {
	cost: number;
	sessions: number;
	tokens: number;
	tokensPerSession: number;
	/** Blended price: USD per million tokens across the period's model mix. */
	dollarsPerMTokens: number;
}

/** One model's share of tokens in the two compared periods. */
export interface ModelMixShift {
	model: string;
	displayName: string;
	/** Share of period tokens, 0..1. */
	prevShare: number;
	curShare: number;
	deltaShare: number;
	prevTokens: number;
	curTokens: number;
}

/**
 * Decomposition of the cost change between two periods, using
 * cost = sessions × tokens/session × $/token and sequential (prior-base)
 * substitution so the three effects sum exactly to deltaCost:
 *
 * - volumeEffect:     you used AI more or less (session count changed)
 * - efficiencyEffect: each session consumed more or fewer tokens
 * - mixEffect:        the blended $/token changed (cheaper/pricier model mix)
 */
export interface CostAttribution {
	prev: CostAttributionSide;
	cur: CostAttributionSide;
	deltaCost: number;
	volumeEffect: number;
	efficiencyEffect: number;
	mixEffect: number;
	/** Largest model-mix movements (by |deltaShare|), largest first. */
	modelShifts: ModelMixShift[];
}

function sideFromDays(days: DailyTokenStats[], deps: EfficiencyDeps): { side: CostAttributionSide; tokensByModel: Map<string, number> } | null {
	let sessions = 0;
	let tokens = 0;
	let cost = 0;
	const tokensByModel = new Map<string, number>();
	for (const day of days) {
		sessions += day.sessions;
		tokens += day.tokens;
		cost += deps.calculateEstimatedCost(day.modelUsage, 'copilot');
		for (const [model, usage] of Object.entries(day.modelUsage)) {
			tokensByModel.set(model, (tokensByModel.get(model) ?? 0) + usage.inputTokens + usage.outputTokens);
		}
	}
	if (sessions === 0 || tokens === 0) { return null; }
	return {
		side: {
			cost,
			sessions,
			tokens,
			tokensPerSession: tokens / sessions,
			dollarsPerMTokens: (cost / tokens) * 1_000_000,
		},
		tokensByModel,
	};
}

function buildModelShifts(prev: Map<string, number>, cur: Map<string, number>, prevTotal: number, curTotal: number): ModelMixShift[] {
	const models = new Set<string>([...prev.keys(), ...cur.keys()]);
	const shifts: ModelMixShift[] = [];
	for (const model of models) {
		const prevTokens = prev.get(model) ?? 0;
		const curTokens = cur.get(model) ?? 0;
		const prevShare = prevTotal > 0 ? prevTokens / prevTotal : 0;
		const curShare = curTotal > 0 ? curTokens / curTotal : 0;
		const deltaShare = curShare - prevShare;
		// Ignore sub-half-point movements — they are noise in the mix story.
		if (Math.abs(deltaShare) < 0.005) { continue; }
		shifts.push({ model, displayName: getModelDisplayName(model), prevShare, curShare, deltaShare, prevTokens, curTokens });
	}
	return shifts.sort((a, b) => Math.abs(b.deltaShare) - Math.abs(a.deltaShare)).slice(0, 6);
}

/**
 * Decomposes the cost change from `prevDays` to `curDays` (each an array of
 * daily stats for one period) into volume, efficiency, and model-mix effects.
 * Returns null when either period has no sessions or no tokens — a
 * decomposition against an empty baseline has no meaning.
 */
export function computeCostAttribution(
	prevDays: DailyTokenStats[],
	curDays: DailyTokenStats[],
	deps: EfficiencyDeps,
): CostAttribution | null {
	const prev = sideFromDays(prevDays, deps);
	const cur = sideFromDays(curDays, deps);
	if (!prev || !cur) { return null; }

	const s0 = prev.side.sessions, s1 = cur.side.sessions;
	const t0 = prev.side.tokensPerSession, t1 = cur.side.tokensPerSession;
	// $/token (not per million) so the products below are dollars.
	const p0 = prev.side.cost / prev.side.tokens;
	const p1 = cur.side.cost / cur.side.tokens;

	const volumeEffect = (s1 - s0) * t0 * p0;
	const efficiencyEffect = s1 * (t1 - t0) * p0;
	const mixEffect = s1 * t1 * (p1 - p0);

	return {
		prev: prev.side,
		cur: cur.side,
		deltaCost: cur.side.cost - prev.side.cost,
		volumeEffect,
		efficiencyEffect,
		mixEffect,
		modelShifts: buildModelShifts(prev.tokensByModel, cur.tokensByModel, prev.side.tokens, cur.side.tokens),
	};
}

/** Splits daily stats into [previous 30 days, trailing 30 days] windows relative to `now`. */
export function splitTrailingWindows(dailyStats: DailyTokenStats[], now: Date): { prevDays: DailyTokenStats[]; curDays: DailyTokenStats[] } {
	const curStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
	const prevStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 59);
	const curStartKey = fmtKey(curStart);
	const prevStartKey = fmtKey(prevStart);
	const nowKey = fmtKey(now);
	const prevDays: DailyTokenStats[] = [];
	const curDays: DailyTokenStats[] = [];
	for (const day of dailyStats) {
		if (day.date >= curStartKey && day.date <= nowKey) { curDays.push(day); }
		else if (day.date >= prevStartKey && day.date < curStartKey) { prevDays.push(day); }
	}
	return { prevDays, curDays };
}

// ---------------------------------------------------------------------------
// Period delta cards
// ---------------------------------------------------------------------------

export type DeltaUnit = 'ratio' | 'percent' | 'minutes' | 'tokens' | 'currency';

/** One month-over-month delta card. `prev`/`cur` are null when the metric is unavailable in that period. */
export interface EfficiencyDelta {
	id: string;
	label: string;
	/** What the metric means and why its direction matters. */
	description: string;
	prev: number | null;
	cur: number | null;
	unit: DeltaUnit;
	/** Which direction of change counts as an improvement. */
	goodDirection: 'up' | 'down';
	/** Percent change (cur vs prev); null when either side is unavailable or prev is 0. */
	deltaPct: number | null;
	/** True when the change moved in `goodDirection`; null when not computable. */
	improved: boolean | null;
}

/** Minimum sessions in a period before its ratios are trusted for a delta card. */
const MIN_SESSIONS_FOR_DELTAS = 5;
/** Minimum edit turns before a period's retry rate is meaningful. */
const MIN_EDIT_TURNS_FOR_DELTAS = 10;
/** Minimum tier-classified requests before the low-cost share is meaningful. */
const MIN_COST_BUCKET_REQUESTS = 10;

function periodRetryRate(p: UsageAnalysisPeriod): number | null {
	let retries = 0;
	let editTurns = 0;
	for (const c of Object.values(p.modelEfficiency ?? {})) {
		retries += c.retries;
		editTurns += c.editTurns;
	}
	return editTurns >= MIN_EDIT_TURNS_FOR_DELTAS ? retries / editTurns : null;
}

function periodLowCostShare(p: UsageAnalysisPeriod): number | null {
	const ms = p.modelSwitching;
	const total = ms.lowCostRequests + ms.mediumCostRequests + ms.highCostRequests;
	return total >= MIN_COST_BUCKET_REQUESTS ? ms.lowCostRequests / total : null;
}

function periodActiveMinutesPerSession(p: UsageAnalysisPeriod): number | null {
	const d = p.sessionDuration;
	if (!d || p.sessions === 0 || d.activeDurationMs <= 0) { return null; }
	return (d.activeDurationMs / p.sessions) / 60_000;
}

function periodApplyRate(p: UsageAnalysisPeriod): number | null {
	const a = p.applyUsage;
	return a && a.totalCodeBlocks > 0 ? a.totalApplies / a.totalCodeBlocks : null;
}

function periodTurnsPerSession(p: UsageAnalysisPeriod): number | null {
	const c = p.conversationPatterns;
	return c && p.sessions > 0 ? c.avgTurnsPerSession : null;
}

function makeDelta(
	id: string,
	label: string,
	description: string,
	prev: number | null,
	cur: number | null,
	unit: DeltaUnit,
	goodDirection: 'up' | 'down',
): EfficiencyDelta {
	let deltaPct: number | null = null;
	let improved: boolean | null = null;
	if (prev !== null && cur !== null && prev !== 0) {
		deltaPct = ((cur - prev) / Math.abs(prev)) * 100;
		if (Math.abs(deltaPct) >= 0.05) {
			improved = goodDirection === 'down' ? cur < prev : cur > prev;
		}
	}
	return { id, label, description, prev, cur, unit, goodDirection, deltaPct, improved };
}

/** Aggregate token/cost totals for one period, used by the volume delta cards. */
export interface PeriodVolumeTotals {
	tokens: number;
	sessions: number;
	estimatedCost: number;
}

/**
 * Builds the month-over-month delta cards from two usage-analysis periods
 * (typically current month-to-date vs. the previous full month). All cards are
 * per-session ratios or shares, so a partial current month compares fairly
 * against a full previous month. Periods with fewer than
 * {@link MIN_SESSIONS_FOR_DELTAS} sessions contribute null (card shows as
 * "not enough data").
 */
export function computeEfficiencyDeltas(
	cur: UsageAnalysisPeriod,
	prev: UsageAnalysisPeriod,
	curTotals?: PeriodVolumeTotals,
	prevTotals?: PeriodVolumeTotals,
): EfficiencyDelta[] {
	const curOk = cur.sessions >= MIN_SESSIONS_FOR_DELTAS;
	const prevOk = prev.sessions >= MIN_SESSIONS_FOR_DELTAS;
	const gate = <T>(ok: boolean, v: T | null): T | null => (ok ? v : null);

	const deltas: EfficiencyDelta[] = [
		makeDelta(
			'turns-per-session', 'Turns per session',
			'Average user requests per session. Fewer turns for the same work means less back-and-forth to get a usable result.',
			gate(prevOk, periodTurnsPerSession(prev)), gate(curOk, periodTurnsPerSession(cur)), 'ratio', 'down',
		),
		makeDelta(
			'active-minutes-per-session', 'Active minutes per session',
			'Net working time per session, excluding idle gaps. Shorter sessions at the same output means tasks complete faster.',
			gate(prevOk, periodActiveMinutesPerSession(prev)), gate(curOk, periodActiveMinutesPerSession(cur)), 'minutes', 'down',
		),
		makeDelta(
			'retry-rate', 'Edit retry rate',
			'Share of edit turns where the model had to retry a failed edit. Lower means edits land on the first attempt more often.',
			gate(prevOk, periodRetryRate(prev)), gate(curOk, periodRetryRate(cur)), 'percent', 'down',
		),
		makeDelta(
			'low-cost-share', 'Low-cost model share',
			'Share of requests served by low-cost models. A rising share with steady output means the same work at lower rates.',
			gate(prevOk, periodLowCostShare(prev)), gate(curOk, periodLowCostShare(cur)), 'percent', 'up',
		),
		makeDelta(
			'apply-rate', 'Apply rate',
			'Share of suggested code blocks you actually applied. Higher means more of what the AI produces is directly usable.',
			gate(prevOk, periodApplyRate(prev)), gate(curOk, periodApplyRate(cur)), 'percent', 'up',
		),
	];

	if (curTotals && prevTotals) {
		deltas.push(
			makeDelta(
				'tokens-per-session', 'Tokens per session',
				'Average tokens consumed per session. Falling token use at the same output means leaner prompts and less rework.',
				prevTotals.sessions >= MIN_SESSIONS_FOR_DELTAS ? prevTotals.tokens / prevTotals.sessions : null,
				curTotals.sessions >= MIN_SESSIONS_FOR_DELTAS ? curTotals.tokens / curTotals.sessions : null,
				'tokens', 'down',
			),
			makeDelta(
				'cost-per-session', 'Cost per session',
				'Estimated cost per session. The bottom line of model choice and session efficiency combined.',
				prevTotals.sessions >= MIN_SESSIONS_FOR_DELTAS ? prevTotals.estimatedCost / prevTotals.sessions : null,
				curTotals.sessions >= MIN_SESSIONS_FOR_DELTAS ? curTotals.estimatedCost / curTotals.sessions : null,
				'currency', 'down',
			),
		);
	}

	return deltas;
}

// ---------------------------------------------------------------------------
// Value signals
// ---------------------------------------------------------------------------

/** Inputs for {@link computeValueSignals}. PR counts are null when PR stats were never loaded. */
export interface ValueSignalsInput {
	/**
	 * PRs authored by the signed-in user in the PR window. This is the shipped-work
	 * signal for the common workflow where AI is driven locally and the human opens
	 * the PR — unlike {@link aiPrs}, which only counts bot-opened PRs.
	 */
	userPrs: number | null;
	/** Subset of `userPrs` that has been merged. */
	mergedPrs: number | null;
	/** PRs opened by AI bot accounts (cloud agents such as the Copilot coding agent). */
	aiPrs: number | null;
	/** ISO start of the PR window. */
	prsSince: string | null;
	/** Estimated cost of the analysis period in USD. */
	periodCost: number;
	applyUsage?: ApplyButtonUsage;
	/** Lines added + removed over the analysis period. */
	linesChanged: number;
	now?: Date;
}

/**
 * Outcome-shaped value metrics: what did the AI usage produce, not just what
 * it consumed. LOC is a weak proxy; merged pull requests and applied code
 * blocks are closer to shipped value.
 */
export interface ValueSignals {
	/** PRs you authored in the window; null when PR stats were never loaded. */
	userPrs: number | null;
	/** PRs you authored that were merged. */
	mergedPrs: number | null;
	/** PRs opened by AI bot accounts (cloud agent delegation); 0 is normal when AI is driven locally. */
	aiPrs: number | null;
	/** ISO start of the PR window (when PR stats are available). */
	prsSince: string | null;
	/** Merged PRs per week over the PR window, falling back to authored PRs when merge data is absent. */
	prsPerWeek: number | null;
	/** Estimated period cost divided by merged PRs; null when either side is unavailable/zero. */
	costPerMergedPr: number | null;
	/** Applied / shown code blocks over the analysis period. */
	applyRate: number | null;
	appliedBlocks: number;
	totalBlocks: number;
	/** Lines of code changed per dollar over the analysis period. */
	locPerDollar: number | null;
	linesChanged: number;
	periodCost: number;
}

/**
 * Assembles the value signals for a period. PR counts come from the GitHub PR
 * stats when the user has loaded them (Usage Analysis → Repository PRs); pass
 * null when unavailable so the view can hint at how to enable them.
 */
/** PRs per week over the window starting at `since`, or null when either input is missing. */
function prsPerWeekRate(prs: number | null, since: string | null, now: Date): number | null {
	if (prs === null || !since) { return null; }
	const weeks = Math.max(1 / 7, (now.getTime() - new Date(since).getTime()) / (7 * 24 * 3600 * 1000));
	return prs / weeks;
}

export function computeValueSignals(input: ValueSignalsInput): ValueSignals {
	const { userPrs, mergedPrs, aiPrs, prsSince, periodCost, applyUsage, linesChanged } = input;
	const current = input.now ?? new Date();
	// Merged PRs are the truer "shipped" count; fall back to authored when a
	// provider or fixture carries no merge state.
	const prsPerWeek = prsPerWeekRate(mergedPrs ?? userPrs, prsSince, current);
	return {
		userPrs,
		mergedPrs,
		aiPrs,
		prsSince,
		prsPerWeek,
		costPerMergedPr: mergedPrs !== null && mergedPrs > 0 && periodCost > 0 ? periodCost / mergedPrs : null,
		applyRate: applyUsage && applyUsage.totalCodeBlocks > 0 ? applyUsage.totalApplies / applyUsage.totalCodeBlocks : null,
		appliedBlocks: applyUsage?.totalApplies ?? 0,
		totalBlocks: applyUsage?.totalCodeBlocks ?? 0,
		locPerDollar: periodCost > 0 && linesChanged > 0 ? linesChanged / periodCost : null,
		linesChanged,
		periodCost,
	};
}

// ---------------------------------------------------------------------------
// Skill / tool usage trends
// ---------------------------------------------------------------------------

/** One week of agent-skill usage. */
export interface SkillUsageWeekPoint {
	/** Monday of the week, YYYY-MM-DD. */
	weekKey: string;
	/** Human label, e.g. "Jun 2–8". */
	label: string;
	/** Total skill invocations across the week's sessions. */
	totalCalls: number;
	/** Sessions that invoked at least one skill. */
	skillSessions: number;
	/** All sessions observed that week (denominator of `skillShare`). */
	trackedSessions: number;
	/** Share of sessions using any skill, 0..1; null when no sessions tracked. */
	skillShare: number | null;
	/** Invocation counts by skill name for this week. */
	byName: { [skillName: string]: number };
}

/** Weekly skill-usage series plus the overall top skills across the window. */
export interface SkillUsageTrends {
	weeks: SkillUsageWeekPoint[];
	/** Skill names ordered by total invocations across the window, largest first. */
	topSkills: string[];
	/** Total invocations across the whole window. */
	totalCalls: number;
}

/**
 * Builds the weekly agent-skill usage series (graphify, custom slash-command
 * skills, …) for the trailing `weeksBack` weeks. Sessions are attributed to
 * the week of their last activity, matching {@link buildEfficiencyTrends}.
 */
export function buildSkillUsageTrends(
	sessions: EfficiencySessionInput[],
	deps: EfficiencyDeps,
	weeksBack: number = DEFAULT_TREND_WEEKS,
): SkillUsageTrends {
	const now = deps.now ?? new Date();
	const thisMonday = getMondayOfWeek(now);
	type SkillWeekAccum = { monday: Date; totalCalls: number; skillSessions: number; trackedSessions: number; byName: { [name: string]: number } };
	const weeks = new Map<string, SkillWeekAccum>();
	for (let w = weeksBack - 1; w >= 0; w--) {
		const monday = new Date(thisMonday);
		monday.setDate(thisMonday.getDate() - w * 7);
		weeks.set(fmtKey(monday), { monday, totalCalls: 0, skillSessions: 0, trackedSessions: 0, byName: {} });
	}

	const totalsByName = new Map<string, number>();
	for (const s of sessions) {
		const week = weeks.get(fmtKey(getMondayOfWeek(new Date(s.dayKey + 'T00:00:00'))));
		if (!week) { continue; }
		week.trackedSessions += 1;
		const entries = Object.entries(s.skillCalls ?? {}).filter(([, count]) => count > 0);
		if (entries.length === 0) { continue; }
		week.skillSessions += 1;
		for (const [name, count] of entries) {
			week.totalCalls += count;
			week.byName[name] = (week.byName[name] ?? 0) + count;
			totalsByName.set(name, (totalsByName.get(name) ?? 0) + count);
		}
	}

	const weekPoints = Array.from(weeks.entries())
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([weekKey, w]) => ({
			weekKey,
			label: fmtWeekLabel(w.monday),
			totalCalls: w.totalCalls,
			skillSessions: w.skillSessions,
			trackedSessions: w.trackedSessions,
			skillShare: w.trackedSessions > 0 ? w.skillSessions / w.trackedSessions : null,
			byName: w.byName,
		}));

	return {
		weeks: weekPoints,
		topSkills: Array.from(totalsByName.entries()).sort((a, b) => b[1] - a[1]).map(([name]) => name),
		totalCalls: Array.from(totalsByName.values()).reduce((a, b) => a + b, 0),
	};
}

// ---------------------------------------------------------------------------
// Skill impact (with vs. without cohort comparison)
// ---------------------------------------------------------------------------

/** Aggregate efficiency metrics for one cohort of sessions. Null when the metric had no data. */
export interface SkillCohortMetrics {
	sessions: number;
	avgTurns: number | null;
	avgTokens: number | null;
	avgActiveMinutes: number | null;
	/** Aggregate retries / edit turns; null below {@link MIN_EDIT_TURNS_FOR_DELTAS} edit turns. */
	retryRate: number | null;
}

/** One metric compared across the with/without cohorts. */
export interface SkillImpactMetric {
	id: 'turns' | 'tokens' | 'active-minutes' | 'retry-rate';
	label: string;
	withSkill: number | null;
	withoutSkill: number | null;
	/** Percent difference of the with-cohort vs. the without-cohort; null when either side is missing. */
	deltaPct: number | null;
	/** Which direction of difference reads as favourable for the skill. */
	goodDirection: 'up' | 'down';
	/** True when the with-cohort is favourable; null when not computable or within noise (<5%). */
	favorable: boolean | null;
}

/** Impact summary for one skill: sessions using it vs. sessions not using it. */
export interface SkillImpact {
	skill: string;
	totalCalls: number;
	withSkill: SkillCohortMetrics;
	withoutSkill: SkillCohortMetrics;
	metrics: SkillImpactMetric[];
}

/** Minimum sessions in the with-cohort before an impact comparison is shown. */
const MIN_SKILL_COHORT_SESSIONS = 5;
/** Differences below this share are treated as noise, not signal. */
const IMPACT_NOISE_THRESHOLD = 0.05;

function cohortMetrics(sessions: EfficiencySessionInput[]): SkillCohortMetrics {
	let turnSessions = 0, turns = 0;
	let tokenSessions = 0, tokens = 0;
	let durationSessions = 0, durationMs = 0;
	let editTurns = 0, retries = 0;
	for (const s of sessions) {
		if (s.interactions !== undefined && s.interactions > 0) { turnSessions += 1; turns += s.interactions; }
		if (s.totalTokens !== undefined && s.totalTokens > 0) { tokenSessions += 1; tokens += s.totalTokens; }
		if (s.activeDurationMs !== undefined && s.activeDurationMs > 0) { durationSessions += 1; durationMs += s.activeDurationMs; }
		editTurns += s.editTurns ?? 0;
		retries += s.retries ?? 0;
	}
	return {
		sessions: sessions.length,
		avgTurns: turnSessions > 0 ? turns / turnSessions : null,
		avgTokens: tokenSessions > 0 ? tokens / tokenSessions : null,
		avgActiveMinutes: durationSessions > 0 ? (durationMs / durationSessions) / 60_000 : null,
		retryRate: editTurns >= MIN_EDIT_TURNS_FOR_DELTAS ? retries / editTurns : null,
	};
}

function impactMetric(
	id: SkillImpactMetric['id'],
	label: string,
	withSkill: number | null,
	withoutSkill: number | null,
	goodDirection: 'up' | 'down',
): SkillImpactMetric {
	let deltaPct: number | null = null;
	let favorable: boolean | null = null;
	if (withSkill !== null && withoutSkill !== null && withoutSkill !== 0) {
		deltaPct = ((withSkill - withoutSkill) / Math.abs(withoutSkill)) * 100;
		if (Math.abs(deltaPct) >= IMPACT_NOISE_THRESHOLD * 100) {
			favorable = goodDirection === 'down' ? withSkill < withoutSkill : withSkill > withoutSkill;
		}
	}
	return { id, label, withSkill, withoutSkill, deltaPct, goodDirection, favorable };
}

/**
 * For every skill with at least {@link MIN_SKILL_COHORT_SESSIONS} sessions,
 * compares the sessions that used it against the sessions that did not, on
 * turns, tokens, active minutes, and retry rate.
 *
 * This is a correlation, not causation: sessions where a skill is invoked may
 * simply be different kinds of work. The view must present it as such.
 */
export function computeSkillImpact(sessions: EfficiencySessionInput[]): SkillImpact[] {
	const bySkill = new Map<string, { withSkill: EfficiencySessionInput[]; totalCalls: number }>();
	for (const s of sessions) {
		for (const [name, count] of Object.entries(s.skillCalls ?? {})) {
			if (count <= 0) { continue; }
			const entry = bySkill.get(name) ?? { withSkill: [], totalCalls: 0 };
			entry.withSkill.push(s);
			entry.totalCalls += count;
			bySkill.set(name, entry);
		}
	}

	const impacts: SkillImpact[] = [];
	for (const [skill, entry] of bySkill) {
		if (entry.withSkill.length < MIN_SKILL_COHORT_SESSIONS) { continue; }
		const withSet = new Set(entry.withSkill);
		const withoutSessions = sessions.filter(s => !withSet.has(s));
		if (withoutSessions.length < MIN_SKILL_COHORT_SESSIONS) { continue; }
		const withM = cohortMetrics(entry.withSkill);
		const withoutM = cohortMetrics(withoutSessions);
		impacts.push({
			skill,
			totalCalls: entry.totalCalls,
			withSkill: withM,
			withoutSkill: withoutM,
			metrics: [
				impactMetric('turns', 'Turns per session', withM.avgTurns, withoutM.avgTurns, 'down'),
				impactMetric('tokens', 'Tokens per session', withM.avgTokens, withoutM.avgTokens, 'down'),
				impactMetric('active-minutes', 'Active minutes per session', withM.avgActiveMinutes, withoutM.avgActiveMinutes, 'down'),
				impactMetric('retry-rate', 'Edit retry rate', withM.retryRate, withoutM.retryRate, 'down'),
			],
		});
	}
	return impacts.sort((a, b) => b.withSkill.sessions - a.withSkill.sessions);
}

// ---------------------------------------------------------------------------
// View payload
// ---------------------------------------------------------------------------

/** Full payload for the Efficiency webview. */
export interface EfficiencyViewData {
	weekly: EfficiencyWeekPoint[];
	/** True when any week has LOC data (enables the cost-per-KLOC series). */
	hasLoc: boolean;
	/** True when any week has session-duration data. */
	hasDuration: boolean;
	/** True when any week has a meaningful retry rate. */
	hasRetry: boolean;
	/** True when any week has apply-rate data. */
	hasApply: boolean;
	attribution: CostAttribution | null;
	/** Human labels for the compared attribution windows. */
	attributionWindows: { prev: string; cur: string };
	deltas: EfficiencyDelta[];
	/** Human labels for the delta card periods. */
	deltaWindows: { prev: string; cur: string };
	value: ValueSignals;
	/** Weekly agent-skill usage (graphify, custom skills, …); empty weeks when no skills detected. */
	skillTrends: SkillUsageTrends;
	/** With/without cohort comparison per skill; empty when no skill reaches the sample floor. */
	skillImpact: SkillImpact[];
	/** True when any skill invocation was detected in the trend window. */
	hasSkills: boolean;
	lastUpdated: string;
	backendConfigured: boolean;
	compactNumbers?: boolean;
	isDebugMode?: boolean;
}
