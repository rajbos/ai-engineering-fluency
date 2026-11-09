import { after, afterEach, before, beforeEach, describe, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { closeDb, getDb, upsertUpload, upsertUser, type UploadEntry } from '../db.js';
import { getTeamInsights } from '../teamInsights.js';
import { computeTeamBreakdownsFromRows } from '../teamBreakdowns.js';

/**
 * Work-context breakdowns on Team Insights: team aggregates by model, editor and
 * repository, team activity counters, cost, and the viewer's own share of each. These
 * tests seed peer identity sentinels and check that only the agreed labels (model ids,
 * editor names, workspace names, tool and MCP server names) reach the projection.
 */

const NOW = Date.parse('2026-03-01T00:30:00Z');
const TODAY = '2026-03-01';
const YESTERDAY = '2026-02-28';
const SENTINEL = 'FORBIDDEN-PEER-IDENTITY';
const originalEnv = { LOCAL_DATA_DIR: process.env.LOCAL_DATA_DIR, ADMIN_GITHUB_LOGINS: process.env.ADMIN_GITHUB_LOGINS };
let dataDir: string;
let nextGithubId = 870000;

before(() => {
	dataDir = mkdtempSync(join(process.cwd(), '.team-breakdowns-test-'));
	process.env.LOCAL_DATA_DIR = dataDir;
	delete process.env.ADMIN_GITHUB_LOGINS;
});

beforeEach(() => {
	mock.timers.enable({ apis: ['Date'], now: NOW });
	getDb().exec('DELETE FROM usage_uploads; DELETE FROM users;');
});

afterEach(() => mock.timers.reset());

after(() => {
	closeDb();
	for (const [key, value] of Object.entries(originalEnv)) {
		if (value === undefined) delete process.env[key];
		else process.env[key] = value;
	}
	rmSync(dataDir, { recursive: true, force: true });
});

function user() {
	const id = ++nextGithubId;
	return upsertUser(id, `${SENTINEL}-login-${id}`, `${SENTINEL}-name`, `https://example.test/${SENTINEL}`);
}

function upload(userId: number, overrides: Partial<UploadEntry> & { inputTokens: number }): void {
	upsertUpload(userId, {
		day: TODAY, model: 'model-a', editor: 'VS Code', outputTokens: 0, interactions: 1,
		workspaceId: `${SENTINEL}-workspace-id`, machineId: `${SENTINEL}-machine-id`,
		machineName: `${SENTINEL}-machine-name`, datasetId: `${SENTINEL}-dataset`,
		...overrides,
	});
}

describe('team breakdowns', () => {
	test('aggregates models and editors with team share, uploader counts and the viewer’s own share', () => {
		const viewer = user();
		const peer = user();
		upload(viewer.id, { inputTokens: 60, model: 'model-a', editor: 'VS Code' });
		upload(viewer.id, { inputTokens: 40, model: 'model-b', editor: 'Copilot CLI', workspaceId: 'ws-2' });
		upload(peer.id, { inputTokens: 300, model: 'model-a', editor: 'Claude Code' });
		const result = getTeamInsights(viewer.id, 7);

		assert.deepEqual(result.dimensions.models.map(slice => [slice.label, slice.totalTokens, slice.activeUsers, slice.ownTokens]), [
			['model-a', 360, 2, 60],
			['model-b', 40, 1, 40],
		]);
		const modelA = result.dimensions.models[0];
		assert.equal(modelA.sharePercent, 360 / 400 * 100);
		assert.equal(modelA.ownSharePercent, 60);
		assert.equal(result.dimensions.models[1].ownSharePercent, 40);
		assert.deepEqual(result.dimensions.editors.map(slice => [slice.label, slice.totalTokens, slice.ownTokens]), [
			['Claude Code', 300, 0],
			['VS Code', 60, 60],
			['Copilot CLI', 40, 40],
		]);
		assert.ok(!JSON.stringify(result).includes(SENTINEL));
	});

	test('a label used only by peers is listed with zero own usage and never says who', () => {
		const viewer = user();
		const peer = user();
		upload(viewer.id, { inputTokens: 10 });
		upload(peer.id, { inputTokens: 90, model: 'peer-only-model' });
		const result = getTeamInsights(viewer.id, 7);
		const slice = result.dimensions.models.find(item => item.label === 'peer-only-model');
		assert.ok(slice);
		assert.equal(slice.ownTokens, 0);
		assert.equal(slice.ownSharePercent, 0);
		assert.equal(slice.activeUsers, 1);
		assert.deepEqual(Object.keys(slice).filter(key => /login|github|avatar|user_?id|machine|workspace/i.test(key)), []);
	});

	test('repositories use readable workspace names only and account for unnamed tokens', () => {
		const viewer = user();
		const peer = user();
		upload(viewer.id, { inputTokens: 100, workspaceName: 'shared-repo' });
		upload(peer.id, { inputTokens: 50, workspaceName: 'shared-repo', workspaceId: 'other-hash' });
		upload(peer.id, { inputTokens: 25, workspaceName: 'peer-repo', workspaceId: 'third-hash' });
		upload(peer.id, { inputTokens: 7, workspaceId: 'unnamed-hash' });
		upload(viewer.id, { inputTokens: 3, workspaceId: 'own-unnamed-hash' });
		const result = getTeamInsights(viewer.id, 7);
		assert.deepEqual(result.dimensions.repositories.map(slice => [slice.label, slice.totalTokens, slice.activeUsers, slice.ownTokens]), [
			['shared-repo', 150, 2, 100],
			['peer-repo', 25, 1, 0],
		]);
		assert.deepEqual(result.unnamedRepositories, { totalTokens: 10, ownTokens: 3 });
	});

	test('daily trends cover every day of the period and fold labels beyond the top eight into Other', () => {
		const viewer = user();
		for (let index = 0; index < 10; index++) {
			upload(viewer.id, { inputTokens: 100 - index, model: `model-${index}`, workspaceId: `ws-${index}` });
		}
		upload(viewer.id, { inputTokens: 5, model: 'model-0', day: YESTERDAY });
		const result = getTeamInsights(viewer.id, 7);
		const trend = result.trends.models;
		assert.equal(trend.labels.length, 9);
		assert.equal(trend.labels.at(-1), 'Other');
		assert.equal(trend.labels[0], 'model-0');
		assert.equal(trend.daily.length, 7);
		const today = trend.daily.at(-1)!;
		assert.equal(today.day, TODAY);
		assert.equal(today.team[0], 100);
		assert.equal(today.team.at(-1), 92 + 91);
		assert.deepEqual(today.team, today.own);
		assert.equal(trend.daily.at(-2)!.team[0], 5);
		assert.ok(trend.daily.slice(0, 5).every(day => day.team.every(value => value === 0)));
	});

	test('sums activity counters for the team and the viewer, with top MCP servers and tools', () => {
		const viewer = user();
		const peer = user();
		const silent = user();
		upload(viewer.id, {
			inputTokens: 10,
			activity: { sessions: 2, modes: { ask: 1, agent: 3 }, toolCalls: 7, toolsByName: { read_file: 5, run_in_terminal: 2 }, mcpCalls: 4, mcpByServer: { github: 4 } },
		});
		upload(peer.id, {
			inputTokens: 20,
			activity: { sessions: 5, modes: { edit: 2, agent: 2, cli: 6 }, toolCalls: 9, toolsByName: { read_file: 9 }, mcpCalls: 3, mcpByServer: { github: 1, playwright: 2 } },
		});
		upload(silent.id, { inputTokens: 30 });
		const result = getTeamInsights(viewer.id, 7);
		assert.deepEqual(result.activity.team, {
			sessions: 7, toolCalls: 16, mcpCalls: 7, uploadersWithActivity: 2,
			modes: { ask: 1, edit: 2, agent: 5, plan: 0, customAgent: 0, cli: 6 },
		});
		assert.deepEqual(result.activity.self, {
			sessions: 2, toolCalls: 7, mcpCalls: 4, uploadersWithActivity: 1,
			modes: { ask: 1, edit: 0, agent: 3, plan: 0, customAgent: 0, cli: 0 },
		});
		assert.deepEqual(result.activity.mcpServers, [
			{ name: 'github', calls: 5, activeUsers: 2, ownCalls: 4 },
			{ name: 'playwright', calls: 2, activeUsers: 1, ownCalls: 0 },
		]);
		assert.deepEqual(result.activity.tools, [
			{ name: 'read_file', calls: 14, activeUsers: 2, ownCalls: 5 },
			{ name: 'run_in_terminal', calls: 2, activeUsers: 1, ownCalls: 2 },
		]);
		assert.ok(!JSON.stringify(result.activity).includes(SENTINEL));
	});

	test('cost sums uploaded estimates per model and for the viewer, counting only uploaders with a cost', () => {
		const viewer = user();
		const peer = user();
		upload(viewer.id, { inputTokens: 10, estimatedCostUsd: 0.25 });
		upload(viewer.id, { inputTokens: 10, model: 'model-b', estimatedCostUsd: 1.5, workspaceId: 'ws-b' });
		upload(peer.id, { inputTokens: 10, estimatedCostUsd: 2 });
		upload(user().id, { inputTokens: 10 });
		const result = getTeamInsights(viewer.id, 7);
		assert.deepEqual(result.cost, { totalCostUsd: 3.75, ownCostUsd: 1.75, activeUsersWithCost: 2 });
		const modelA = result.dimensions.models.find(slice => slice.label === 'model-a')!;
		assert.equal(modelA.estimatedCostUsd, 2.25);
		assert.equal(modelA.ownCostUsd, 0.25);
	});

	test('ignores rows outside the period, including future dates', () => {
		const viewer = user();
		upload(viewer.id, { inputTokens: 10, model: 'in-period' });
		upload(viewer.id, { inputTokens: 999, model: 'future', day: '2026-03-02' });
		upload(viewer.id, { inputTokens: 999, model: 'too-old', day: '2026-01-01' });
		const result = getTeamInsights(viewer.id, 7);
		assert.deepEqual(result.dimensions.models.map(slice => slice.label), ['in-period']);
	});

	test('pure computation tolerates malformed stored activity and empty inputs', () => {
		const empty = computeTeamBreakdownsFromRows([], 1, [TODAY]);
		assert.deepEqual(empty.dimensions, { models: [], editors: [], repositories: [] });
		assert.deepEqual(empty.trends.models, { labels: [], daily: [{ day: TODAY, team: [], own: [] }] });
		assert.equal(empty.activity.team.uploadersWithActivity, 0);
		const result = computeTeamBreakdownsFromRows([{
			user_id: 1, day: TODAY, model: 'm', editor: '', workspace_name: null,
			input_tokens: 1, output_tokens: 1, interactions: 1, estimated_cost_usd: null, activity_json: '{not json',
		}], 1, [TODAY]);
		assert.equal(result.dimensions.editors[0].label, 'VS Code');
		assert.equal(result.activity.team.uploadersWithActivity, 0);
		assert.equal(result.cost.totalCostUsd, 0);
	});
});
