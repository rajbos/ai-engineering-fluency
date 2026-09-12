import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';

import {
	buildTurnChildRows,
	buildTurnLegRows,
	buildTurnOverviewRows,
	getTurnCachedTokens,
	hashModelToHue,
	type TurnOverviewSourceTurn,
} from '../../src/webview/logviewer/turnsOverview';
import type { HydraFusionSummary, HydraFusionTurn } from '../../../src/hydrafusion';

function turn(overrides: Partial<TurnOverviewSourceTurn> = {}): TurnOverviewSourceTurn {
	return {
		turnNumber: 1,
		model: 'claude-sonnet-4-6',
		mode: 'agent',
		inputTokensEstimate: 100,
		outputTokensEstimate: 50,
		thinkingTokensEstimate: 0,
		...overrides,
	};
}

/** A minimal one-leg HydraFusion turn for testing the legs correlation, independent of the parser. */
function hydraTurn(overrides: Partial<HydraFusionTurn> = {}): HydraFusionTurn {
	return {
		fusionId: 'f', pattern: 'single', outcome: 'completed', degradedReason: null, policy: null,
		routeSource: null, routingLatencyMs: null, plannedPhases: [], primaryModel: null,
		secondaryModel: null, fallbackModel: null, finalSourceModel: 'gpt-4o',
		phases: [{
			phaseId: 'f:phase:0', kind: 'primary', role: 'solver', model: 'gpt-4o', status: 'succeeded',
			verdict: null, durationMs: 1000, conversationScope: 'root',
			usage: { requestCount: 1, inputTokens: 100, outputTokens: 20, cachedTokens: 0, cacheWriteTokens: 0, aiu: 5 },
			isFinalSource: true, completedAt: null,
		}],
		handoffs: [], requestCount: 1, inputTokens: 100, outputTokens: 20, cachedTokens: 0, cacheWriteTokens: 0,
		aiu: 5, reviewAiu: 0, durationMs: 1000, startedAt: null, completedAt: null, isCompound: false,
		...overrides,
	};
}

function hydraSummary(turns: HydraFusionTurn[]): HydraFusionSummary {
	return {
		turns, totalTurns: turns.length, patternCounts: [], compoundTurns: 0, compoundRatePercent: 0,
		judgeAccepts: 0, judgeRejects: 0, judgeRejectionRatePercent: null, totalAiu: 0, reviewAiu: 0,
		reviewSharePercent: 0, totalInputTokens: 0, totalOutputTokens: 0, totalCachedTokens: 0,
		totalRequestCount: 0, totalLegs: 0, byModel: [], byPhaseKind: [], models: [], avgRoutingLatencyMs: null,
		degradedTurns: 0, syntheticModel: null,
	};
}

describe('getTurnCachedTokens', () => {
	test('returns null when the turn has no actual usage', () => {
		assert.equal(getTurnCachedTokens(turn()), null);
	});

	test('returns null when promptTokenDetails carries no cache-related entry', () => {
		const t = turn({
			actualUsage: {
				promptTokens: 1000,
				completionTokens: 200,
				promptTokenDetails: [{ category: 'System', label: 'Instructions', percentageOfPrompt: 60 }],
			},
		});
		assert.equal(getTurnCachedTokens(t), null);
	});

	test('deduces cached tokens from a category matching "cache" (case-insensitive)', () => {
		const t = turn({
			actualUsage: {
				promptTokens: 1000,
				completionTokens: 200,
				promptTokenDetails: [{ category: 'cached', label: 'Cache reads', percentageOfPrompt: 40 }],
			},
		});
		assert.equal(getTurnCachedTokens(t), 400);
	});

	test('deduces cached tokens from a label matching "cache" even when the category does not', () => {
		const t = turn({
			actualUsage: {
				promptTokens: 2000,
				completionTokens: 0,
				promptTokenDetails: [{ category: 'prompt', label: 'Cache Read', percentageOfPrompt: 25 }],
			},
		});
		assert.equal(getTurnCachedTokens(t), 500);
	});

	test('sums percentages across multiple cache-related entries', () => {
		const t = turn({
			actualUsage: {
				promptTokens: 1000,
				completionTokens: 0,
				promptTokenDetails: [
					{ category: 'cached', label: 'Cache reads (short TTL)', percentageOfPrompt: 10 },
					{ category: 'cached', label: 'Cache reads (long TTL)', percentageOfPrompt: 15 },
				],
			},
		});
		assert.equal(getTurnCachedTokens(t), 250);
	});
});

describe('buildTurnOverviewRows', () => {
	test('falls back to text-based estimates, including thinking tokens, when there is no actual usage', () => {
		const rows = buildTurnOverviewRows([turn({ inputTokensEstimate: 120, outputTokensEstimate: 40, thinkingTokensEstimate: 30 })]);
		assert.equal(rows.length, 1);
		assert.equal(rows[0].isActual, false);
		assert.equal(rows[0].input, 120);
		assert.equal(rows[0].output, 40);
		assert.equal(rows[0].total, 190);
		assert.equal(rows[0].cached, null);
	});

	test('prefers actual API usage over the estimate, and excludes it from the total via completionTokens alone', () => {
		const rows = buildTurnOverviewRows([
			turn({
				inputTokensEstimate: 999,
				outputTokensEstimate: 999,
				actualUsage: { promptTokens: 300, completionTokens: 60 },
			}),
		]);
		assert.equal(rows[0].isActual, true);
		assert.equal(rows[0].input, 300);
		assert.equal(rows[0].output, 60);
		assert.equal(rows[0].total, 360);
	});

	test('carries through turn number, model and mode unchanged', () => {
		const rows = buildTurnOverviewRows([turn({ turnNumber: 3, model: 'gpt-4o', mode: 'ask' })]);
		assert.equal(rows[0].turnNumber, 3);
		assert.equal(rows[0].model, 'gpt-4o');
		assert.equal(rows[0].mode, 'ask');
	});

	test('reports the deduced cached tokens per row when present', () => {
		const rows = buildTurnOverviewRows([
			turn({ actualUsage: { promptTokens: 800, completionTokens: 100, promptTokenDetails: [{ category: 'cached', label: 'Cache reads', percentageOfPrompt: 50 }] } }),
		]);
		assert.equal(rows[0].cached, 400);
	});

	test('produces one row per turn, in order', () => {
		const rows = buildTurnOverviewRows([turn({ turnNumber: 1 }), turn({ turnNumber: 2 }), turn({ turnNumber: 3 })]);
		assert.deepEqual(rows.map(r => r.turnNumber), [1, 2, 3]);
	});

	test('carries through the host-computed estimatedCost as cost, or null when absent', () => {
		const rows = buildTurnOverviewRows([turn({ estimatedCost: 0.0123 }), turn({ turnNumber: 2 })]);
		assert.equal(rows[0].cost, 0.0123);
		assert.equal(rows[1].cost, null);
	});

	test('has no children when the turn has no sub-agent tool calls', () => {
		const rows = buildTurnOverviewRows([turn({ toolCalls: [{ toolName: 'view' }, { toolName: 'edit' }] })]);
		assert.deepEqual(rows[0].children, []);
	});

	test('builds one child row per sub-agent tool call, ignoring regular tool calls', () => {
		const rows = buildTurnOverviewRows([
			turn({
				toolCalls: [
					{ toolName: 'view' },
					{ toolName: 'task', isSubAgent: true, subAgentModel: 'claude-sonnet-4-6', subAgentTokens: { input: 500, output: 200 }, subAgentCost: 0.05 },
					{ toolName: 'task', isSubAgent: true, subAgentModel: 'gpt-4o', subAgentTokens: { input: 100, output: 40 } },
				],
			}),
		]);
		assert.equal(rows[0].children.length, 2);
		assert.deepEqual(rows[0].children[0], { toolName: 'task', model: 'claude-sonnet-4-6', input: 500, output: 200, total: 700, cost: 0.05 });
		assert.deepEqual(rows[0].children[1], { toolName: 'task', model: 'gpt-4o', input: 100, output: 40, total: 140, cost: null });
	});

	test('every row has an empty legs array for a plain session that never used HydraFusion', () => {
		const rows = buildTurnOverviewRows([turn({ turnNumber: 1 }), turn({ turnNumber: 2 })]);
		assert.deepEqual(rows[0].legs, []);
		assert.deepEqual(rows[1].legs, []);
	});

	test('attaches legs only to the chat turn hydraTurnMatches places, leaving the rest empty', () => {
		const summary = hydraSummary([hydraTurn()]);
		const matches = new Map([[0, 2]]); // fusion turn 0 matches chat turn #2
		const rows = buildTurnOverviewRows(
			[turn({ turnNumber: 1, timestamp: '2026-01-01T00:00:00.000Z' }), turn({ turnNumber: 2, timestamp: '2026-01-01T00:00:05.000Z' })],
			summary,
			matches,
		);
		assert.deepEqual(rows[0].legs, []);
		assert.equal(rows[1].legs.length, 1);
		assert.equal(rows[1].legs[0].model, 'gpt-4o');
	});

	test('leaves every row without legs when hydraTurnMatches is omitted, even with a HydraFusion summary present', () => {
		const summary = hydraSummary([hydraTurn()]);
		const rows = buildTurnOverviewRows([turn({ turnNumber: 1 })], summary);
		assert.deepEqual(rows[0].legs, []);
	});
});

describe('buildTurnLegRows', () => {
	test('maps each phase to a leg row, converting its AIU cost to USD', () => {
		const rows = buildTurnLegRows(hydraTurn());
		assert.deepEqual(rows, [{
			kind: 'primary', model: 'gpt-4o', verdict: null, isFinalSource: true,
			durationMs: 1000, requestCount: 1, input: 100, output: 20, costUsd: 0.05,
		}]);
	});

	test('produces one row per leg, in the order the router ran them', () => {
		const t = hydraTurn({
			phases: [
				{ phaseId: 'f:phase:0', kind: 'primary', role: 'solver', model: 'a', status: 'succeeded', verdict: null, durationMs: 1, conversationScope: 'root', usage: { requestCount: 1, inputTokens: 1, outputTokens: 1, cachedTokens: 0, cacheWriteTokens: 0, aiu: 1 }, isFinalSource: false, completedAt: null },
				{ phaseId: 'f:judge', kind: 'judge', role: 'judge', model: 'b', status: 'succeeded', verdict: 'reject', durationMs: 2, conversationScope: 'review', usage: { requestCount: 1, inputTokens: 2, outputTokens: 2, cachedTokens: 0, cacheWriteTokens: 0, aiu: 2 }, isFinalSource: false, completedAt: null },
			],
		});
		const rows = buildTurnLegRows(t);
		assert.deepEqual(rows.map(r => r.kind), ['primary', 'judge']);
		assert.equal(rows[1].verdict, 'reject');
	});
});

describe('buildTurnChildRows', () => {
	test('returns an empty array when the turn has no tool calls', () => {
		assert.deepEqual(buildTurnChildRows(turn()), []);
	});

	test('defaults model to null and tokens to 0 when a sub-agent call has no usage data yet', () => {
		const rows = buildTurnChildRows(turn({ toolCalls: [{ toolName: 'task', isSubAgent: true }] }));
		assert.deepEqual(rows, [{ toolName: 'task', model: null, input: 0, output: 0, total: 0, cost: null }]);
	});
});

describe('hashModelToHue', () => {
	test('is deterministic for the same input', () => {
		assert.equal(hashModelToHue('claude-sonnet-4-6'), hashModelToHue('claude-sonnet-4-6'));
	});

	test('stays within the valid hue range [0, 360)', () => {
		for (const model of ['gpt-4o', 'hydrafusion', 'claude-sonnet-4-6', '', 'a very long model identifier string']) {
			const hue = hashModelToHue(model);
			assert.ok(hue >= 0 && hue < 360, `hue ${hue} for "${model}" out of range`);
		}
	});

	test('different model names usually hash to different hues', () => {
		assert.notEqual(hashModelToHue('gpt-4o'), hashModelToHue('claude-sonnet-4-6'));
	});
});
