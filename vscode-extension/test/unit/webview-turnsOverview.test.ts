import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';

import {
	buildTurnChildRows,
	buildTurnOverviewRows,
	getTurnCachedTokens,
	hashModelToHue,
	type TurnOverviewSourceTurn,
} from '../../src/webview/logviewer/turnsOverview';

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
