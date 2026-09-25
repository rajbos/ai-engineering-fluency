/**
 * Per-repository agent activity with honest denominators.
 *
 * GitHub's Agentic Engineering System asks whether agent adoption is growing
 * faster than the foundations under it, and treats rework (retries,
 * corrections, tool-call churn) as a signal of missing shared knowledge. Both
 * questions need the same thing: session signals grouped by repository, with
 * a real "per session" denominator. The Corrections report cannot provide
 * that — it only lists sessions that *had* corrections.
 *
 * Everything here is already in the per-session cache; this module only
 * regroups it. Pure — no VS Code API, no filesystem, no network. Local only:
 * nothing built here is uploaded or shared.
 */
import type {
	ActivityTrendWindows,
	AgentActivityTotals,
	CorrectionCounts,
	RepoAgentActivity,
	RepoAgentActivityReport,
	SessionUsageAnalysis,
} from './types';
import { repoDisplayFromRemote } from './repoKey';
import { addModeCounts, countParticipationModes, createEmptyModeCounts } from './participationModes';
import { classifySessionScoping, CORRECTED_SESSION_MIN_USER_CORRECTIONS } from './promptScoping';

/** One cached session, reduced to what the aggregation reads. */
export interface ActivitySessionInput {
	/** Git remote URL of the session's workspace, when resolved. */
	repository?: string;
	/** Last interaction (epoch ms); falls back to the file mtime at the call site. */
	lastInteractionMs: number;
	interactions: number;
	tokens: number;
	subAgentCalls?: number;
	usageAnalysis?: SessionUsageAnalysis;
}

export const ACTIVITY_WINDOW_DAYS = 30;

export function createEmptyActivityTotals(): AgentActivityTotals {
	return {
		sessions: 0,
		interactions: 0,
		tokens: 0,
		agenticSessions: 0,
		delegationSessions: 0,
		sessionsWithTurnDetail: 0,
		editTurns: 0,
		oneShotEditTurns: 0,
		retries: 0,
		selfCorrections: 0,
		toolCalls: 0,
		sessionsWithCorrections: 0,
		userCorrections: 0,
		toolErrors: 0,
		correctionMoments: 0,
		scoping: { underScoped: 0, underScopedCorrected: 0, scoped: 0, scopedCorrected: 0 },
		modes: createEmptyModeCounts(),
	};
}

/** Every correction moment kind, matching the Corrections tab's own total. */
export function totalCorrectionMoments(counts: CorrectionCounts | undefined): number {
	if (!counts) { return 0; }
	return counts.userCorrections + counts.editRetries + counts.editSelfCorrections
		+ counts.toolErrors + counts.agentSelfCorrections;
}

/** True when the session ran an agent: agent mode, a custom agent, or a CLI agent. */
export function isAgenticSession(analysis: SessionUsageAnalysis | undefined): boolean {
	const modes = analysis?.modeUsage;
	return !!modes && (modes.agent + modes.customAgent + modes.cli) > 0;
}

/** True when the session handed work to another agent. */
export function isDelegationSession(input: ActivitySessionInput): boolean {
	return (input.subAgentCalls ?? 0) > 0
		|| input.usageAnalysis?.taskClassification?.primaryCategory === 'Delegation';
}

/** Add one session to a running total. */
export function addSessionToTotals(totals: AgentActivityTotals, input: ActivitySessionInput): void {
	const analysis = input.usageAnalysis;
	totals.sessions++;
	totals.interactions += input.interactions || 0;
	totals.tokens += input.tokens || 0;
	const agentic = isAgenticSession(analysis);
	if (agentic) { totals.agenticSessions++; }
	if (isDelegationSession(input)) { totals.delegationSessions++; }
	addModeCounts(totals.modes, countParticipationModes(analysis?.taskClassification?.turnCategories));

	// Rework counters are only meaningful where the format records per-turn tool calls.
	// A session without that detail has unknown rework, so it stays out of the denominator.
	if (!analysis?.modelEfficiency) { return; }
	totals.sessionsWithTurnDetail++;
	for (const counters of Object.values(analysis.modelEfficiency)) {
		totals.editTurns += counters.editTurns || 0;
		totals.oneShotEditTurns += counters.oneShotEditTurns || 0;
		totals.retries += counters.retries || 0;
		totals.selfCorrections += counters.selfCorrections || 0;
		totals.toolCalls += counters.toolCalls || 0;
	}
	const counts = analysis.correctionCounts;
	const moments = totalCorrectionMoments(counts);
	if (moments > 0) { totals.sessionsWithCorrections++; }
	totals.correctionMoments += moments;
	totals.userCorrections += counts?.userCorrections ?? 0;
	totals.toolErrors += counts?.toolErrors ?? 0;

	if (!agentic) { return; }
	const scoping = classifySessionScoping(analysis.firstUserPrompt, analysis.taskClassification?.turnCategories);
	if (!scoping) { return; }
	const corrected = (counts?.userCorrections ?? 0) >= CORRECTED_SESSION_MIN_USER_CORRECTIONS;
	if (scoping === 'under-scoped') {
		totals.scoping.underScoped++;
		if (corrected) { totals.scoping.underScopedCorrected++; }
	} else {
		totals.scoping.scoped++;
		if (corrected) { totals.scoping.scopedCorrected++; }
	}
}

/** Add one total into another. */
export function mergeActivityTotals(target: AgentActivityTotals, source: AgentActivityTotals): void {
	const numericKeys = [
		'sessions', 'interactions', 'tokens', 'agenticSessions', 'delegationSessions', 'sessionsWithTurnDetail',
		'editTurns', 'oneShotEditTurns', 'retries', 'selfCorrections', 'toolCalls', 'sessionsWithCorrections',
		'userCorrections', 'toolErrors', 'correctionMoments',
	] as const;
	for (const key of numericKeys) { target[key] += source[key]; }
	target.scoping.underScoped += source.scoping.underScoped;
	target.scoping.underScopedCorrected += source.scoping.underScopedCorrected;
	target.scoping.scoped += source.scoping.scoped;
	target.scoping.scopedCorrected += source.scoping.scopedCorrected;
	addModeCounts(target.modes, source.modes);
}

/** Sum a set of sessions. */
export function summarizeActivity(inputs: readonly ActivitySessionInput[]): AgentActivityTotals {
	const totals = createEmptyActivityTotals();
	for (const input of inputs) { addSessionToTotals(totals, input); }
	return totals;
}

/**
 * Group sessions whose last interaction falls in `[startMs, endMs]` by
 * repository. Sessions with no resolvable repository are kept in
 * `unattributed` so their share stays visible.
 */
export function buildRepoAgentActivity(
	inputs: readonly ActivitySessionInput[],
	window: { startMs: number; endMs: number; windowDays?: number },
): RepoAgentActivityReport {
	const byKey = new Map<string, RepoAgentActivity>();
	const unattributed = createEmptyActivityTotals();
	const totals = createEmptyActivityTotals();
	for (const input of inputs) {
		if (!(input.lastInteractionMs >= window.startMs && input.lastInteractionMs <= window.endMs)) { continue; }
		addSessionToTotals(totals, input);
		const display = repoDisplayFromRemote(input.repository);
		if (!display) {
			addSessionToTotals(unattributed, input);
			continue;
		}
		const key = display.toLowerCase();
		let row = byKey.get(key);
		if (!row) {
			row = { key, repository: display, ...createEmptyActivityTotals() };
			byKey.set(key, row);
		}
		addSessionToTotals(row, input);
	}
	const repos = [...byKey.values()].sort((a, b) => b.sessions - a.sessions || a.key.localeCompare(b.key));
	return { windowDays: window.windowDays ?? ACTIVITY_WINDOW_DAYS, repos, unattributed, totals };
}

/**
 * Month-to-date against the whole previous calendar month (UTC), with the
 * number of days in each so consumers can normalize counts per day. Sessions
 * are placed by their last interaction.
 */
export function buildActivityTrend(inputs: readonly ActivitySessionInput[], now: Date): ActivityTrendWindows {
	const monthStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1);
	const previousStart = Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1);
	const dayMs = 24 * 60 * 60 * 1000;
	const current = createEmptyActivityTotals();
	const previous = createEmptyActivityTotals();
	for (const input of inputs) {
		const t = input.lastInteractionMs;
		if (t >= monthStart && t <= now.getTime()) {
			addSessionToTotals(current, input);
		} else if (t >= previousStart && t < monthStart) {
			addSessionToTotals(previous, input);
		}
	}
	return {
		current,
		currentDays: now.getUTCDate(),
		previous,
		previousDays: Math.round((monthStart - previousStart) / dayMs),
	};
}
