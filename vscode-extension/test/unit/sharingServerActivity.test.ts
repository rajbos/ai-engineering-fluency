/**
 * Unit tests for the Team Server extras: the validated `activity` projection, the
 * per-row cost estimate, and how buildSharingServerEntries attaches them.
 */

import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	ACTIVITY_MAX_NAMED_KEYS,
	buildSharingServerActivity,
	capNamedCounts,
	estimateEntryCostUsd,
} from '../../src/backend/services/sharingServerActivity';
import { SyncService, type SyncServiceDeps } from '../../src/backend/services/syncService';
import { BackendUtility } from '../../src/backend/services/utilityService';
import type { DailyRollupKey } from '../../src/backend/rollups';
import type { DailyRollupValue } from '../../src/backend/types';

// ── buildSharingServerActivity ──────────────────────────────────────────────

test('buildSharingServerActivity projects mode counts, tool and MCP JSON into the validated shape', () => {
	const activity = buildSharingServerActivity({
		sessionCount: 3,
		askModeCount: 2, editModeCount: 0, agentModeCount: 5, planModeCount: 1, customAgentModeCount: 0, cliModeCount: 4,
		toolCallsJson: JSON.stringify({ total: 12, byTool: { read_file: 7, run_in_terminal: 5 }, outputTokensByTool: { read_file: 999 } }),
		mcpToolsJson: JSON.stringify({ total: 2, byServer: { github: 2 }, byTool: { 'github/list_prs': 2 } }),
		contextRefsJson: JSON.stringify({ secret: 'never copied' }),
	});
	assert.deepEqual(activity, {
		sessions: 3,
		modes: { ask: 2, agent: 5, plan: 1, cli: 4 },
		toolCalls: 12,
		toolsByName: { read_file: 7, run_in_terminal: 5 },
		mcpCalls: 2,
		mcpByServer: { github: 2 },
	});
	// Only the closed set of keys the server accepts.
	assert.deepEqual(Object.keys(activity!).sort(), ['mcpByServer', 'mcpCalls', 'modes', 'sessions', 'toolCalls', 'toolsByName']);
});

test('buildSharingServerActivity returns undefined when there is nothing to report', () => {
	assert.equal(buildSharingServerActivity(undefined), undefined);
	assert.equal(buildSharingServerActivity({}), undefined);
	assert.equal(buildSharingServerActivity({ askModeCount: 0, sessionCount: 0 }), undefined);
	assert.equal(buildSharingServerActivity({ toolCallsJson: '{not json', mcpToolsJson: '[]' }), undefined);
});

test('buildSharingServerActivity rounds fractional per-day shares and drops negatives', () => {
	const activity = buildSharingServerActivity({ sessionCount: 1, agentModeCount: 2.6, askModeCount: -1, toolCallsJson: JSON.stringify({ total: 0.4 }) });
	assert.deepEqual(activity, { sessions: 1, modes: { agent: 3 } });
});

test('capNamedCounts keeps the top names by count, trims, and bounds name length', () => {
	const many: Record<string, number> = {};
	for (let i = 0; i < ACTIVITY_MAX_NAMED_KEYS + 10; i++) { many[`tool-${String(i).padStart(3, '0')}`] = i + 1; }
	const capped = capNamedCounts(many)!;
	assert.equal(Object.keys(capped).length, ACTIVITY_MAX_NAMED_KEYS);
	assert.ok(!('tool-000' in capped), 'lowest counts are the ones dropped');
	assert.equal(capped['tool-059'], 60);

	const cleaned = capNamedCounts({ '  spaced  ': 2, '': 5, ['x'.repeat(200)]: 1, nope: 0, bad: 'many' })!;
	assert.deepEqual(Object.keys(cleaned).map(k => k.length), [6, 128]);
	assert.equal(cleaned.spaced, 2);
	assert.equal(capNamedCounts(['read_file']), undefined);
	assert.equal(capNamedCounts({}), undefined);
});

// ── estimateEntryCostUsd ────────────────────────────────────────────────────

test('estimateEntryCostUsd prices tokens from the given table and omits unpriced models', () => {
	const pricing = { 'model-x': { inputCostPerMillion: 2, outputCostPerMillion: 10 } };
	assert.equal(estimateEntryCostUsd('model-x', 1_000_000, 100_000, pricing), 3);
	assert.equal(estimateEntryCostUsd('model-x', 1, 1, pricing), 0.000012);
	assert.equal(estimateEntryCostUsd('unknown-model', 1_000_000, 0, pricing), undefined);
	assert.equal(estimateEntryCostUsd('model-x', 0, 0, pricing), undefined);
	assert.equal(estimateEntryCostUsd('model-x', 10, 10, undefined), undefined);
});

// ── buildSharingServerEntries ───────────────────────────────────────────────

function makeDeps(overrides: Partial<SyncServiceDeps> = {}): SyncServiceDeps {
	return {
		context: undefined,
		logger: { log: () => {}, warn: () => {} },
		sessionHandlers: {
			getCopilotSessionFiles: async () => [],
			estimateTokensFromText: () => 0,
			getModelFromRequest: () => 'gpt-4o',
			statSessionFile: async () => ({ mtimeMs: Date.now(), size: 1 } as any),
		},
		...overrides,
	};
}

function rollup(key: Partial<DailyRollupKey>, value: Partial<DailyRollupValue>): Map<string, { key: DailyRollupKey; value: DailyRollupValue }> {
	const fullKey: DailyRollupKey = { day: '2026-03-01', model: 'model-x', workspaceId: 'ws-raw', machineId: 'machine-raw', editor: 'VS Code', ...key };
	const fullValue: DailyRollupValue = { inputTokens: 1_000_000, outputTokens: 100_000, interactions: 4, ...value };
	return new Map([[JSON.stringify(fullKey), { key: fullKey, value: fullValue }]]);
}

const settings = { datasetId: 'default' } as any;
const policy = { includeNames: false, workspaceIdStrategy: 'hashed', machineIdStrategy: 'hashed' } as any;

test('buildSharingServerEntries attaches cost, activity and client version to every entry', () => {
	const svc = new SyncService(makeDeps({
		getModelPricing: () => ({ 'model-x': { inputCostPerMillion: 2, outputCostPerMillion: 10 } }),
		getClientVersion: () => ' 1.2.3 ',
	}), {} as any, {} as any, undefined, BackendUtility, undefined);
	const rollups = rollup({}, {
		fluencyMetrics: { sessionCount: 2, agentModeCount: 3, toolCallsJson: JSON.stringify({ total: 5, byTool: { read_file: 5 } }) },
	});
	const [entry] = (svc as any).buildSharingServerEntries(rollups, settings, policy, {}, {});
	assert.equal(entry.estimatedCostUsd, 3);
	assert.equal(entry.clientVersion, '1.2.3');
	assert.deepEqual(entry.activity, { sessions: 2, modes: { agent: 3 }, toolCalls: 5, toolsByName: { read_file: 5 } });
	// The existing payload is untouched: hashed IDs, no names, fluency blob still present.
	assert.notEqual(entry.workspaceId, 'ws-raw');
	assert.equal(entry.workspaceName, undefined);
	assert.ok(entry.fluencyMetrics);
});

test('buildSharingServerEntries omits the extras rather than sending placeholders', () => {
	const svc = new SyncService(makeDeps({
		getModelPricing: () => ({}),
		getClientVersion: () => undefined,
	}), {} as any, {} as any, undefined, BackendUtility, undefined);
	const [entry] = (svc as any).buildSharingServerEntries(rollup({}, {}), settings, policy, {}, {});
	assert.ok(!('estimatedCostUsd' in entry), 'no cost without a price');
	assert.ok(!('clientVersion' in entry), 'no version placeholder');
	assert.ok(!('activity' in entry), 'no empty activity object');
});

test('buildSharingServerEntries prices Copilot editors with the Copilot price source by default', () => {
	const svc = new SyncService(makeDeps(), {} as any, {} as any, undefined, BackendUtility, undefined);
	const [copilot] = (svc as any).buildSharingServerEntries(rollup({ model: 'gpt-4o', editor: 'Copilot CLI' }, {}), settings, policy, {}, {});
	const [provider] = (svc as any).buildSharingServerEntries(rollup({ model: 'gpt-4o', editor: 'Codex CLI' }, {}), settings, policy, {}, {});
	assert.equal(typeof copilot.estimatedCostUsd, 'number', 'bundled price list prices gpt-4o');
	assert.equal(typeof provider.estimatedCostUsd, 'number');
	assert.ok(copilot.estimatedCostUsd !== provider.estimatedCostUsd || copilot.estimatedCostUsd > 0, 'both are priced');
});
