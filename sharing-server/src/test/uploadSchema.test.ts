import { after, afterEach, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Hono } from 'hono';
import { validateActivity, validateEntry } from '../validation/uploadSchema.js';
import { closeDb, getDb, getUploadsForUser, upsertUser } from '../db.js';
import { api } from '../routes/api.js';

/** The new optional upload fields: cost estimate, client version and activity counters. */

const base = {
	day: '2026-03-01', model: 'model-a', workspaceId: 'ws', machineId: 'm',
	inputTokens: 10, outputTokens: 5, interactions: 1,
};

describe('validateEntry: team-safe extras', () => {
	test('accepts an entry with cost, version and a full activity object', () => {
		assert.equal(validateEntry({
			...base, estimatedCostUsd: 0.125, clientVersion: '0.42.0',
			activity: {
				sessions: 3, modes: { ask: 1, edit: 0, agent: 4, plan: 1, customAgent: 0, cli: 2 },
				toolCalls: 12, toolsByName: { read_file: 7, run_in_terminal: 5 },
				mcpCalls: 2, mcpByServer: { github: 2 },
			},
		}), null);
		assert.equal(validateEntry({ ...base, estimatedCostUsd: 0, activity: {} }), null);
		assert.equal(validateEntry({ ...base, estimatedCostUsd: null, clientVersion: null, activity: null }), null);
	});

	test('rejects malformed cost and version values', () => {
		assert.match(validateEntry({ ...base, estimatedCostUsd: -1 })!, /estimatedCostUsd/);
		assert.match(validateEntry({ ...base, estimatedCostUsd: Number.NaN })!, /estimatedCostUsd/);
		assert.match(validateEntry({ ...base, estimatedCostUsd: '1.5' })!, /estimatedCostUsd/);
		assert.match(validateEntry({ ...base, estimatedCostUsd: 1e9 })!, /estimatedCostUsd/);
		assert.match(validateEntry({ ...base, clientVersion: 42 })!, /clientVersion/);
		assert.match(validateEntry({ ...base, clientVersion: 'v'.repeat(65) })!, /clientVersion/);
	});

	test('rejects activity that is not a closed set of bounded integer counters', () => {
		assert.match(validateActivity([])!, /must be an object/);
		assert.match(validateActivity({ prompt: 'secret' })!, /not an accepted field/);
		assert.match(validateActivity({ sessions: -1 })!, /sessions/);
		assert.match(validateActivity({ sessions: 1.5 })!, /sessions/);
		assert.match(validateActivity({ toolCalls: 10_000_001 })!, /toolCalls/);
		assert.match(validateActivity({ modes: [] })!, /modes/);
		assert.match(validateActivity({ modes: { yolo: 1 } })!, /not an accepted mode/);
		assert.match(validateActivity({ modes: { ask: 'many' } })!, /modes\.ask/);
		assert.match(validateActivity({ toolsByName: ['read_file'] })!, /toolsByName/);
		assert.match(validateActivity({ toolsByName: { read_file: -1 } })!, /toolsByName/);
		assert.match(validateActivity({ mcpByServer: { ['x'.repeat(129)]: 1 } })!, /longer than/);
		const tooMany = Object.fromEntries(Array.from({ length: 51 }, (_, index) => [`tool-${index}`, 1]));
		assert.match(validateActivity({ toolsByName: tooMany })!, /too many names/);
		assert.match(validateEntry({ ...base, activity: 'busy' })!, /activity/);
	});
});

describe('POST /api/upload stores the extras', () => {
	const app = new Hono().route('/api', api);
	const realFetch = globalThis.fetch;
	const originalEnv = { LOCAL_DATA_DIR: process.env.LOCAL_DATA_DIR, ADMIN_GITHUB_LOGINS: process.env.ADMIN_GITHUB_LOGINS, ALLOWED_GITHUB_ORG: process.env.ALLOWED_GITHUB_ORG };
	let dataDir: string;

	before(() => {
		dataDir = mkdtempSync(join(process.cwd(), '.upload-schema-test-'));
		process.env.LOCAL_DATA_DIR = dataDir;
		delete process.env.ADMIN_GITHUB_LOGINS;
		delete process.env.ALLOWED_GITHUB_ORG;
	});

	beforeEach(() => {
		getDb().exec('DELETE FROM usage_uploads; DELETE FROM users;');
	});

	afterEach(() => { globalThis.fetch = realFetch; });

	after(() => {
		closeDb();
		for (const [key, value] of Object.entries(originalEnv)) {
			if (value === undefined) delete process.env[key];
			else process.env[key] = value;
		}
		rmSync(dataDir, { recursive: true, force: true });
	});

	test('persists cost, version and activity, replaces them on re-upload, and rejects bad extras per entry', async () => {
		const owner = upsertUser(880001, 'uploader', 'Uploader', null);
		globalThis.fetch = async () => Response.json({ id: owner.github_id, login: owner.github_login, name: owner.github_name, avatar_url: 'https://example.test/avatar' });
		const { day } = getDb().prepare("SELECT date('now') AS day").get() as { day: string };
		const headers = { Authorization: 'Bearer upload-extras-token', 'Content-Type': 'application/json' };
		const activity = { sessions: 2, modes: { agent: 3 }, toolCalls: 4, toolsByName: { read_file: 4 }, mcpCalls: 1, mcpByServer: { github: 1 } };

		const first = await app.request('/api/upload', {
			method: 'POST', headers,
			body: JSON.stringify([
				{ ...base, day, estimatedCostUsd: 0.5, clientVersion: '0.50.0', activity },
				{ ...base, day, model: 'model-b', activity: { prompt: 'leak' } },
			]),
		});
		assert.equal(first.status, 200);
		const body = await first.json() as { uploaded: number; errors?: string[] };
		assert.equal(body.uploaded, 1);
		assert.equal(body.errors?.length, 1);
		assert.match(body.errors![0], /Entry 1: "activity\.prompt" is not an accepted field/);

		let rows = getUploadsForUser(owner.id, 7);
		assert.equal(rows.length, 1);
		assert.equal(rows[0].estimated_cost_usd, 0.5);
		assert.equal(rows[0].client_version, '0.50.0');
		assert.deepEqual(JSON.parse(rows[0].activity_json!), activity);

		const second = await app.request('/api/upload', {
			method: 'POST', headers,
			body: JSON.stringify([{ ...base, day, clientVersion: '0.51.0' }]),
		});
		assert.equal((await second.json() as { uploaded: number }).uploaded, 1);
		rows = getUploadsForUser(owner.id, 7);
		assert.equal(rows.length, 1);
		assert.equal(rows[0].estimated_cost_usd, null);
		assert.equal(rows[0].client_version, '0.51.0');
		assert.equal(rows[0].activity_json, null);
	});
});
