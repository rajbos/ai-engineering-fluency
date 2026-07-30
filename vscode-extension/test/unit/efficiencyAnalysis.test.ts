import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	buildEfficiencyTrends,
	buildSkillUsageTrends,
	computeCostAttribution,
	computeSkillImpact,
	computeEfficiencyDeltas,
	computeValueSignals,
	splitTrailingWindows,
	type EfficiencyDeps,
	type EfficiencySessionInput,
} from '../../../src/efficiencyAnalysis';
import type { DailyTokenStats, ModelUsage, UsageAnalysisPeriod } from '../../../src/types';

// ── Fixtures ─────────────────────────────────────────────────────────────────

// Fixed "now": Wednesday 2026-07-15 → current week Monday is 2026-07-13.
const NOW = new Date(2026, 6, 15, 12, 0, 0);

/** Prices every model at $10 per million tokens regardless of mix. */
const flatDeps: EfficiencyDeps = {
	calculateEstimatedCost: (mu: ModelUsage) => {
		let tokens = 0;
		for (const u of Object.values(mu)) { tokens += u.inputTokens + u.outputTokens; }
		return (tokens / 1_000_000) * 10;
	},
	now: NOW,
};

function day(date: string, overrides: Partial<DailyTokenStats> = {}): DailyTokenStats {
	return {
		date,
		tokens: 0,
		sessions: 0,
		interactions: 0,
		modelUsage: {},
		editorUsage: {},
		repositoryUsage: {},
		...overrides,
	};
}

function usage(model: string, inputTokens: number, outputTokens: number, sessions = 1): ModelUsage {
	return { [model]: { inputTokens, outputTokens, sessions } };
}

function emptyPeriod(overrides: Partial<UsageAnalysisPeriod> = {}): UsageAnalysisPeriod {
	return {
		sessions: 0,
		toolCalls: { total: 0, byTool: {} },
		modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
		contextReferences: {
			file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0,
			workspace: 0, terminal: 0, vscode: 0, terminalLastCommand: 0, terminalSelection: 0,
			clipboard: 0, changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0,
			byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {},
		},
		mcpTools: { total: 0, byServer: {}, byTool: {} },
		modelSwitching: {
			modelsPerSession: [], totalSessions: 0, averageModelsPerSession: 0, maxModelsPerSession: 0,
			minModelsPerSession: 0, switchingFrequency: 0, autoSessions: 0, foundryWindowsSessions: 0,
			unknownProviderSessions: 0, standardModels: [], premiumModels: [], unknownModels: [],
			mixedTierSessions: 0, standardRequests: 0, premiumRequests: 0, unknownRequests: 0,
			totalRequests: 0, lowCostModels: [], mediumCostModels: [], highCostModels: [],
			mixedCostSessions: 0, lowCostRequests: 0, mediumCostRequests: 0, highCostRequests: 0,
			selectedModelExtensions: [], unknownProviderModels: [],
		},
		repositories: [],
		repositoriesWithCustomization: [],
		editScope: { singleFileEdits: 0, multiFileEdits: 0, totalEditedFiles: 0, avgFilesPerSession: 0 },
		applyUsage: { totalApplies: 0, totalCodeBlocks: 0, applyRate: 0 },
		sessionDuration: { totalDurationMs: 0, avgDurationMs: 0, avgFirstProgressMs: 0, avgTotalElapsedMs: 0, avgWaitTimeMs: 0, activeDurationMs: 0 },
		conversationPatterns: { multiTurnSessions: 0, singleTurnSessions: 0, avgTurnsPerSession: 0, maxTurnsInSession: 0 },
		agentTypes: { editsAgent: 0, defaultAgent: 0, workspaceAgent: 0, other: 0 },
		...overrides,
	};
}

// ── buildEfficiencyTrends ────────────────────────────────────────────────────

test('buildEfficiencyTrends: returns requested number of weeks in order, current week last', () => {
	const weekly = buildEfficiencyTrends([], [], flatDeps, 12);
	assert.equal(weekly.length, 12);
	assert.equal(weekly[11].weekKey, '2026-07-13');
	assert.equal(weekly[0].weekKey, '2026-04-27');
	for (let i = 1; i < weekly.length; i++) {
		assert.ok(weekly[i].weekKey > weekly[i - 1].weekKey);
	}
});

test('buildEfficiencyTrends: computes volume ratios from daily stats', () => {
	// Two days inside the current week (Mon 2026-07-13, Tue 2026-07-14).
	const days = [
		day('2026-07-13', { tokens: 100_000, sessions: 2, interactions: 10, linesAdded: 300, linesRemoved: 200, modelUsage: usage('gpt-5', 60_000, 40_000, 2) }),
		day('2026-07-14', { tokens: 50_000, sessions: 1, interactions: 5, linesAdded: 400, linesRemoved: 100, modelUsage: usage('gpt-5', 30_000, 20_000, 1) }),
	];
	const weekly = buildEfficiencyTrends(days, [], flatDeps, 2);
	const cur = weekly[1];
	assert.equal(cur.sessions, 3);
	assert.equal(cur.tokens, 150_000);
	assert.equal(cur.loc, 1000);
	assert.equal(cur.tokensPerSession, 50_000);
	assert.equal(cur.turnsPerSession, 5);
	// Cost: 150K tokens at $10/M = $1.50 → per 1K LOC = $1.50.
	assert.ok(Math.abs((cur.cost ?? 0) - 1.5) < 1e-9);
	assert.ok(Math.abs((cur.costPerKloc ?? 0) - 1.5) < 1e-9);
	assert.ok(Math.abs((cur.locPerDollar ?? 0) - 1000 / 1.5) < 1e-6);
});

test('buildEfficiencyTrends: ratio fields are null for empty weeks', () => {
	const weekly = buildEfficiencyTrends([], [], flatDeps, 3);
	for (const w of weekly) {
		assert.equal(w.tokensPerSession, null);
		assert.equal(w.turnsPerSession, null);
		assert.equal(w.costPerKloc, null);
		assert.equal(w.activeMinutesPerSession, null);
		assert.equal(w.retryRate, null);
		assert.equal(w.applyRate, null);
	}
});

test('buildEfficiencyTrends: session inputs feed duration, retry, and apply ratios', () => {
	const sessions: EfficiencySessionInput[] = [
		{ dayKey: '2026-07-13', activeDurationMs: 30 * 60_000, editTurns: 4, retries: 2, applies: 3, codeBlocks: 4 },
		{ dayKey: '2026-07-14', activeDurationMs: 10 * 60_000, editTurns: 6, retries: 1, applies: 1, codeBlocks: 4 },
	];
	const weekly = buildEfficiencyTrends([], sessions, flatDeps, 1);
	const cur = weekly[0];
	assert.equal(cur.durationSessions, 2);
	assert.ok(Math.abs((cur.activeMinutesPerSession ?? 0) - 20) < 1e-9);
	assert.equal(cur.editTurns, 10);
	assert.ok(Math.abs((cur.retryRate ?? 0) - 0.3) < 1e-9);
	assert.ok(Math.abs((cur.applyRate ?? 0) - 0.5) < 1e-9);
});

test('buildEfficiencyTrends: retry rate needs a minimum number of edit turns', () => {
	const sessions: EfficiencySessionInput[] = [
		{ dayKey: '2026-07-13', editTurns: 2, retries: 2 },
	];
	const weekly = buildEfficiencyTrends([], sessions, flatDeps, 1);
	assert.equal(weekly[0].retryRate, null);
});

test('buildEfficiencyTrends: sessions without duration data do not dilute the duration average', () => {
	const sessions: EfficiencySessionInput[] = [
		{ dayKey: '2026-07-13', activeDurationMs: 30 * 60_000 },
		{ dayKey: '2026-07-13' }, // no duration recorded
	];
	const weekly = buildEfficiencyTrends([], sessions, flatDeps, 1);
	assert.equal(weekly[0].durationSessions, 1);
	assert.ok(Math.abs((weekly[0].activeMinutesPerSession ?? 0) - 30) < 1e-9);
});

test('buildEfficiencyTrends: days and sessions outside the window are ignored', () => {
	const days = [day('2026-01-01', { tokens: 999, sessions: 9 })];
	const sessions: EfficiencySessionInput[] = [{ dayKey: '2026-01-01', activeDurationMs: 1000 }];
	const weekly = buildEfficiencyTrends(days, sessions, flatDeps, 2);
	assert.equal(weekly.reduce((s, w) => s + w.tokens, 0), 0);
	assert.equal(weekly.reduce((s, w) => s + w.durationSessions, 0), 0);
});

// ── computeCostAttribution ───────────────────────────────────────────────────

/** Deps where cost is driven by a per-model price table (per million tokens). */
function pricedDeps(prices: Record<string, number>): EfficiencyDeps {
	return {
		calculateEstimatedCost: (mu: ModelUsage) => {
			let cost = 0;
			for (const [model, u] of Object.entries(mu)) {
				cost += ((u.inputTokens + u.outputTokens) / 1_000_000) * (prices[model] ?? 0);
			}
			return cost;
		},
		now: NOW,
	};
}

test('computeCostAttribution: effects sum exactly to the cost delta', () => {
	const deps = pricedDeps({ 'expensive': 30, 'cheap': 3 });
	const prevDays = [
		day('2026-06-01', { tokens: 1_000_000, sessions: 10, modelUsage: usage('expensive', 600_000, 400_000, 10) }),
	];
	const curDays = [
		day('2026-07-01', { tokens: 800_000, sessions: 8, modelUsage: usage('cheap', 500_000, 300_000, 8) }),
	];
	const attr = computeCostAttribution(prevDays, curDays, deps);
	assert.ok(attr);
	const sum = attr.volumeEffect + attr.efficiencyEffect + attr.mixEffect;
	assert.ok(Math.abs(sum - attr.deltaCost) < 1e-9, `effects (${sum}) must sum to delta (${attr.deltaCost})`);
	// Prev: $30, cur: $2.40 → cost fell, dominated by the mix effect (30 → 3 $/M).
	assert.ok(Math.abs(attr.prev.cost - 30) < 1e-9);
	assert.ok(Math.abs(attr.cur.cost - 2.4) < 1e-9);
	assert.ok(attr.mixEffect < 0);
});

test('computeCostAttribution: pure volume change lands in volumeEffect only', () => {
	const deps = pricedDeps({ m: 10 });
	// Same tokens/session and same model — only session count doubles.
	const prevDays = [day('2026-06-01', { tokens: 500_000, sessions: 5, modelUsage: usage('m', 300_000, 200_000, 5) })];
	const curDays = [day('2026-07-01', { tokens: 1_000_000, sessions: 10, modelUsage: usage('m', 600_000, 400_000, 10) })];
	const attr = computeCostAttribution(prevDays, curDays, deps);
	assert.ok(attr);
	assert.ok(Math.abs(attr.efficiencyEffect) < 1e-9);
	assert.ok(Math.abs(attr.mixEffect) < 1e-9);
	assert.ok(Math.abs(attr.volumeEffect - attr.deltaCost) < 1e-9);
});

test('computeCostAttribution: null when either window is empty', () => {
	const deps = pricedDeps({ m: 10 });
	const days = [day('2026-07-01', { tokens: 1000, sessions: 1, modelUsage: usage('m', 600, 400) })];
	assert.equal(computeCostAttribution([], days, deps), null);
	assert.equal(computeCostAttribution(days, [], deps), null);
});

test('computeCostAttribution: reports the largest model mix shifts', () => {
	const deps = pricedDeps({ a: 10, b: 10 });
	const prevDays = [day('2026-06-01', { tokens: 1_000_000, sessions: 10, modelUsage: { ...usage('a', 500_000, 300_000, 8), ...usage('b', 150_000, 50_000, 2) } })];
	const curDays = [day('2026-07-01', { tokens: 1_000_000, sessions: 10, modelUsage: { ...usage('a', 150_000, 50_000, 2), ...usage('b', 500_000, 300_000, 8) } })];
	const attr = computeCostAttribution(prevDays, curDays, deps);
	assert.ok(attr);
	assert.equal(attr.modelShifts.length, 2);
	const shiftA = attr.modelShifts.find(s => s.model === 'a');
	assert.ok(shiftA);
	assert.ok(shiftA.deltaShare < 0);
});

// ── splitTrailingWindows ─────────────────────────────────────────────────────

test('splitTrailingWindows: partitions days into trailing and previous 30-day windows', () => {
	const days = [
		day('2026-07-15'), // today → current
		day('2026-06-16'), // 29 days back → current
		day('2026-06-15'), // 30 days back → previous
		day('2026-05-17'), // 59 days back → previous
		day('2026-05-16'), // 60 days back → outside
		day('2026-07-16'), // future → outside
	];
	const { prevDays, curDays } = splitTrailingWindows(days, NOW);
	assert.deepEqual(curDays.map(d => d.date).sort(), ['2026-06-16', '2026-07-15']);
	assert.deepEqual(prevDays.map(d => d.date).sort(), ['2026-05-17', '2026-06-15']);
});

// ── computeEfficiencyDeltas ──────────────────────────────────────────────────

function periodWithMetrics(sessions: number, turns: number, activeMs: number, retries: number, editTurns: number, lowReq: number, midReq: number, highReq: number, applies: number, blocks: number): UsageAnalysisPeriod {
	const p = emptyPeriod({ sessions });
	p.conversationPatterns = { multiTurnSessions: sessions, singleTurnSessions: 0, avgTurnsPerSession: turns, maxTurnsInSession: turns };
	p.sessionDuration = { totalDurationMs: activeMs, avgDurationMs: activeMs / Math.max(1, sessions), avgFirstProgressMs: 0, avgTotalElapsedMs: 0, avgWaitTimeMs: 0, activeDurationMs: activeMs };
	p.modelEfficiency = { m: { calls: editTurns, editTurns, oneShotEditTurns: editTurns - retries, retries, selfCorrections: 0, editToolCalls: editTurns, inputTokens: 0, outputTokens: 0, cachedReadTokens: 0, cost: 0 } };
	p.modelSwitching.lowCostRequests = lowReq;
	p.modelSwitching.mediumCostRequests = midReq;
	p.modelSwitching.highCostRequests = highReq;
	p.applyUsage = { totalApplies: applies, totalCodeBlocks: blocks, applyRate: blocks > 0 ? (applies / blocks) * 100 : 0 };
	return p;
}

test('computeEfficiencyDeltas: improvement flags follow the good direction', () => {
	const prev = periodWithMetrics(20, 10, 20 * 40 * 60_000, 10, 20, 10, 30, 60, 10, 40);
	const cur = periodWithMetrics(20, 6, 20 * 25 * 60_000, 4, 20, 60, 30, 10, 30, 40);
	const deltas = computeEfficiencyDeltas(cur, prev);
	const byId = new Map(deltas.map(d => [d.id, d]));

	const turns = byId.get('turns-per-session')!;
	assert.equal(turns.improved, true); // 10 → 6, down is good
	const minutes = byId.get('active-minutes-per-session')!;
	assert.equal(minutes.improved, true); // 40 → 25 min
	const retry = byId.get('retry-rate')!;
	assert.equal(retry.improved, true); // 0.5 → 0.2
	const lowCost = byId.get('low-cost-share')!;
	assert.equal(lowCost.improved, true); // 10% → 60%, up is good
	const apply = byId.get('apply-rate')!;
	assert.equal(apply.improved, true); // 25% → 75%
});

test('computeEfficiencyDeltas: too few sessions yields null values', () => {
	const prev = periodWithMetrics(2, 10, 100, 1, 20, 20, 0, 0, 5, 10);
	const cur = periodWithMetrics(20, 6, 100, 1, 20, 20, 0, 0, 5, 10);
	const deltas = computeEfficiencyDeltas(cur, prev);
	for (const d of deltas) {
		assert.equal(d.prev, null, `${d.id} prev should be gated`);
		assert.equal(d.deltaPct, null);
		assert.equal(d.improved, null);
	}
});

test('computeEfficiencyDeltas: volume totals add tokens- and cost-per-session cards', () => {
	const prev = periodWithMetrics(20, 10, 100, 1, 20, 20, 0, 0, 5, 10);
	const cur = periodWithMetrics(20, 6, 100, 1, 20, 20, 0, 0, 5, 10);
	const deltas = computeEfficiencyDeltas(cur, prev,
		{ tokens: 1_000_000, sessions: 20, estimatedCost: 10 },
		{ tokens: 3_000_000, sessions: 20, estimatedCost: 30 });
	const tokens = deltas.find(d => d.id === 'tokens-per-session')!;
	assert.equal(tokens.prev, 150_000);
	assert.equal(tokens.cur, 50_000);
	assert.equal(tokens.improved, true);
	const cost = deltas.find(d => d.id === 'cost-per-session')!;
	assert.ok(Math.abs((cost.cur ?? 0) - 0.5) < 1e-9);
	assert.equal(cost.improved, true);
});

test('computeEfficiencyDeltas: regressions are flagged as not improved', () => {
	const prev = periodWithMetrics(20, 6, 20 * 25 * 60_000, 4, 20, 60, 30, 10, 30, 40);
	const cur = periodWithMetrics(20, 10, 20 * 40 * 60_000, 10, 20, 10, 30, 60, 10, 40);
	const deltas = computeEfficiencyDeltas(cur, prev);
	const turns = deltas.find(d => d.id === 'turns-per-session')!;
	assert.equal(turns.improved, false);
});

// ── computeValueSignals ──────────────────────────────────────────────────────

test('computeValueSignals: merged PRs drive the rate and cost-per-PR metrics', () => {
	const since = new Date(NOW.getTime() - 30 * 24 * 3600 * 1000).toISOString();
	const v = computeValueSignals({
		userPrs: 10, mergedPrs: 6, aiPrs: 0, prsSince: since, periodCost: 12,
		applyUsage: { totalApplies: 30, totalCodeBlocks: 40, applyRate: 75 },
		linesChanged: 3000, now: NOW,
	});
	assert.equal(v.userPrs, 10);
	assert.equal(v.mergedPrs, 6);
	assert.ok(Math.abs((v.prsPerWeek ?? 0) - 6 / (30 / 7)) < 1e-9, 'rate uses merged, not authored');
	assert.ok(Math.abs((v.costPerMergedPr ?? 0) - 2) < 1e-9);
	assert.ok(Math.abs((v.applyRate ?? 0) - 0.75) < 1e-9);
	assert.ok(Math.abs((v.locPerDollar ?? 0) - 250) < 1e-9);
});

test('computeValueSignals: zero AI-authored PRs still yields real user PR value', () => {
	// The common local-AI workflow: no bot-opened PRs, but plenty of shipped work.
	const since = new Date(NOW.getTime() - 30 * 24 * 3600 * 1000).toISOString();
	const v = computeValueSignals({
		userPrs: 12, mergedPrs: 9, aiPrs: 0, prsSince: since, periodCost: 90,
		linesChanged: 5000, now: NOW,
	});
	assert.equal(v.aiPrs, 0);
	assert.equal(v.mergedPrs, 9);
	assert.ok(Math.abs((v.costPerMergedPr ?? 0) - 10) < 1e-9);
	assert.ok((v.prsPerWeek ?? 0) > 0);
});

test('computeValueSignals: falls back to authored PRs when merge state is unavailable', () => {
	const since = new Date(NOW.getTime() - 7 * 24 * 3600 * 1000).toISOString();
	const v = computeValueSignals({
		userPrs: 7, mergedPrs: null, aiPrs: null, prsSince: since, periodCost: 10,
		linesChanged: 0, now: NOW,
	});
	assert.ok(Math.abs((v.prsPerWeek ?? 0) - 7) < 1e-9);
	assert.equal(v.costPerMergedPr, null, 'no merge data means no cost-per-merged-PR');
});

test('computeValueSignals: PR metrics are null when PR stats were never loaded', () => {
	const v = computeValueSignals({
		userPrs: null, mergedPrs: null, aiPrs: null, prsSince: null,
		periodCost: 12, linesChanged: 0, now: NOW,
	});
	assert.equal(v.userPrs, null);
	assert.equal(v.prsPerWeek, null);
	assert.equal(v.costPerMergedPr, null);
	assert.equal(v.applyRate, null);
	assert.equal(v.locPerDollar, null);
});

test('computeValueSignals: zero merged PRs yields null cost per PR (no divide by zero)', () => {
	const since = new Date(NOW.getTime() - 7 * 24 * 3600 * 1000).toISOString();
	const v = computeValueSignals({
		userPrs: 2, mergedPrs: 0, aiPrs: 0, prsSince: since, periodCost: 12,
		linesChanged: 0, now: NOW,
	});
	assert.equal(v.mergedPrs, 0);
	assert.equal(v.costPerMergedPr, null);
	assert.equal(v.prsPerWeek, 0);
});

// ── buildSkillUsageTrends ────────────────────────────────────────────────────

test('buildSkillUsageTrends: buckets skill calls by week and computes session share', () => {
	const sessions: EfficiencySessionInput[] = [
		{ dayKey: '2026-07-13', skillCalls: { graphify: 2 } },
		{ dayKey: '2026-07-14', skillCalls: { impeccable: 1 } },
		{ dayKey: '2026-07-14' }, // session without skills
		{ dayKey: '2026-07-06', skillCalls: { graphify: 1 } }, // previous week
	];
	const trends = buildSkillUsageTrends(sessions, flatDeps, 2);
	assert.equal(trends.totalCalls, 4);
	assert.deepEqual(trends.topSkills, ['graphify', 'impeccable']);

	const prevWeek = trends.weeks[0];
	assert.equal(prevWeek.weekKey, '2026-07-06');
	assert.equal(prevWeek.totalCalls, 1);
	assert.equal(prevWeek.skillSessions, 1);
	assert.equal(prevWeek.trackedSessions, 1);
	assert.equal(prevWeek.skillShare, 1);

	const curWeek = trends.weeks[1];
	assert.equal(curWeek.totalCalls, 3);
	assert.equal(curWeek.skillSessions, 2);
	assert.equal(curWeek.trackedSessions, 3);
	assert.ok(Math.abs((curWeek.skillShare ?? 0) - 2 / 3) < 1e-9);
	assert.deepEqual(curWeek.byName, { graphify: 2, impeccable: 1 });
});

test('buildSkillUsageTrends: empty input yields zeroed weeks and no top skills', () => {
	const trends = buildSkillUsageTrends([], flatDeps, 3);
	assert.equal(trends.weeks.length, 3);
	assert.equal(trends.totalCalls, 0);
	assert.deepEqual(trends.topSkills, []);
	for (const w of trends.weeks) {
		assert.equal(w.skillShare, null);
	}
});

test('buildSkillUsageTrends: zero-count skill entries are ignored', () => {
	const sessions: EfficiencySessionInput[] = [
		{ dayKey: '2026-07-13', skillCalls: { graphify: 0 } },
	];
	const trends = buildSkillUsageTrends(sessions, flatDeps, 1);
	assert.equal(trends.totalCalls, 0);
	assert.equal(trends.weeks[0].skillSessions, 0);
	assert.equal(trends.weeks[0].trackedSessions, 1);
});

// ── computeSkillImpact ───────────────────────────────────────────────────────

function skillSession(skill: string | null, interactions: number, tokens: number, activeMin: number, editTurns: number, retries: number): EfficiencySessionInput {
	return {
		dayKey: '2026-07-13',
		interactions,
		totalTokens: tokens,
		activeDurationMs: activeMin * 60_000,
		editTurns,
		retries,
		...(skill ? { skillCalls: { [skill]: 1 } } : {}),
	};
}

test('computeSkillImpact: compares with/without cohorts and flags favourable differences', () => {
	// 5 sessions with graphify: leaner (4 turns, 50K tokens, 15 min, no retries).
	// 5 sessions without: heavier (10 turns, 200K tokens, 45 min, 50% retry rate).
	const sessions: EfficiencySessionInput[] = [
		...Array.from({ length: 5 }, () => skillSession('graphify', 4, 50_000, 15, 4, 0)),
		...Array.from({ length: 5 }, () => skillSession(null, 10, 200_000, 45, 4, 2)),
	];
	const impacts = computeSkillImpact(sessions);
	assert.equal(impacts.length, 1);
	const g = impacts[0];
	assert.equal(g.skill, 'graphify');
	assert.equal(g.withSkill.sessions, 5);
	assert.equal(g.withoutSkill.sessions, 5);
	assert.equal(g.withSkill.avgTurns, 4);
	assert.equal(g.withoutSkill.avgTurns, 10);
	assert.equal(g.withSkill.retryRate, 0);
	assert.equal(g.withoutSkill.retryRate, 0.5);
	const turns = g.metrics.find(m => m.id === 'turns')!;
	assert.equal(turns.favorable, true);
	assert.ok(Math.abs((turns.deltaPct ?? 0) + 60) < 1e-9); // 4 vs 10 → −60%
	const retry = g.metrics.find(m => m.id === 'retry-rate')!;
	assert.equal(retry.favorable, true);
});

test('computeSkillImpact: skills below the session floor are omitted', () => {
	const sessions: EfficiencySessionInput[] = [
		...Array.from({ length: 4 }, () => skillSession('graphify', 4, 50_000, 15, 0, 0)),
		...Array.from({ length: 10 }, () => skillSession(null, 10, 200_000, 45, 0, 0)),
	];
	assert.deepEqual(computeSkillImpact(sessions), []);
});

test('computeSkillImpact: requires enough sessions on the without side too', () => {
	const sessions: EfficiencySessionInput[] = [
		...Array.from({ length: 6 }, () => skillSession('graphify', 4, 50_000, 15, 0, 0)),
		...Array.from({ length: 2 }, () => skillSession(null, 10, 200_000, 45, 0, 0)),
	];
	assert.deepEqual(computeSkillImpact(sessions), []);
});

test('computeSkillImpact: unfavourable differences are flagged red', () => {
	// Skill sessions are heavier than the rest.
	const sessions: EfficiencySessionInput[] = [
		...Array.from({ length: 5 }, () => skillSession('impeccable', 12, 300_000, 50, 0, 0)),
		...Array.from({ length: 5 }, () => skillSession(null, 5, 60_000, 20, 0, 0)),
	];
	const impacts = computeSkillImpact(sessions);
	assert.equal(impacts.length, 1);
	const turns = impacts[0].metrics.find(m => m.id === 'turns')!;
	assert.equal(turns.favorable, false);
});
