import { after, afterEach, before, beforeEach, describe, mock, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { Hono } from 'hono';
import { closeDb, getDb, upsertUpload, upsertUser, upsertUserFluencyScore, type UploadEntry } from '../db.js';
import { getTeamInsights, parseTeamDays, type TeamInsights } from '../teamInsights.js';
import { api } from '../routes/api.js';

const NOW = Date.parse('2026-03-01T00:30:00Z');
const TODAY = '2026-03-01';
const SENTINEL = 'FORBIDDEN-PEER-IDENTITY';
const originalEnv = {
	LOCAL_DATA_DIR: process.env.LOCAL_DATA_DIR,
	ALLOWED_GITHUB_ORG: process.env.ALLOWED_GITHUB_ORG,
	ADMIN_GITHUB_LOGINS: process.env.ADMIN_GITHUB_LOGINS,
};
const realFetch = globalThis.fetch;
let dataDir: string;
let nextGithubId = 800000;

before(() => {
	// Keep the real SQLite fixture inside the workspace, never in a user/server database.
	dataDir = mkdtempSync(join(process.cwd(), '.team-insights-test-'));
	process.env.LOCAL_DATA_DIR = dataDir;
	delete process.env.ALLOWED_GITHUB_ORG;
	delete process.env.ADMIN_GITHUB_LOGINS;
});

beforeEach(() => {
	mock.timers.enable({ apis: ['Date'], now: NOW });
	globalThis.fetch = async () => { throw new Error('Unexpected network request'); };
	getDb().exec('DELETE FROM usage_uploads; DELETE FROM users;');
});

afterEach(() => mock.timers.reset());

after(() => {
	globalThis.fetch = realFetch;
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

function upload(userId: number, inputTokens: number, outputTokens = 0, overrides: Partial<UploadEntry> = {}): void {
	upsertUpload(userId, {
		day: TODAY, model: `${SENTINEL}-model`, datasetId: `${SENTINEL}-dataset`,
		workspaceId: `${SENTINEL}-workspace-id`, workspaceName: `${SENTINEL}-workspace-name`,
		machineId: `${SENTINEL}-machine-id`, machineName: `${SENTINEL}-machine-name`,
		editor: `${SENTINEL}-editor`, fluencyMetrics: { privateValue: SENTINEL },
		inputTokens, outputTokens, interactions: 1, ...overrides,
	});
}

function keys(value: object, allowed: string[]): void {
	assert.deepEqual(Object.keys(value).sort(), [...allowed].sort());
}

function assertPrivateProjection(result: TeamInsights): void {
	keys(result, ['days', 'startDay', 'endDay', 'summary', 'members', 'self', 'cohorts', 'daily', 'quartiles']);
	keys(result.summary, ['activeUsers', 'inputTokens', 'outputTokens', 'totalTokens', 'interactions', 'averageTokens', 'medianTokens']);
	keys(result.quartiles, ['q1', 'q2', 'q3']);
	for (const member of [...result.members, result.self]) {
		keys(member, ['isSelf', 'inputTokens', 'outputTokens', 'totalTokens', 'interactions',
			'daysActive', 'tokensPerActiveDay', 'sharePercent', 'rank', 'percentile', 'cohort']);
	}
	for (const cohort of result.cohorts) keys(cohort, ['label', 'members']);
	for (const day of result.daily) {
		keys(day, ['day', 'inputTokens', 'outputTokens', 'totalTokens', 'interactions', 'ownTokens', 'activeUsers']);
		assert.match(day.day, /^\d{4}-\d{2}-\d{2}$/);
	}
	assert.ok(!JSON.stringify(result).includes(SENTINEL));
}

describe('Team Insights projection', () => {
	test('strictly parses supported periods and normalizes direct calls', () => {
		for (const [raw, expected] of [['7', 7], ['30', 30], ['90', 90]] as const) {
			assert.equal(parseTeamDays(raw), expected);
		}
		for (const raw of [undefined, '', '0', '1', '31', '91', '-7', '7junk', '7.0', '07', ' 7', 'Infinity']) {
			assert.equal(parseTeamDays(raw), 30);
		}
		for (const days of [0, 1, 31, -7, 7.5, NaN, Infinity]) {
			assert.equal(getTeamInsights(-1, days).days, 30);
		}
	});

	test('no data returns an inactive self and zero-filled period, without counting registered users', () => {
		const viewer = user();
		const peer = user();
		upload(peer.id, 0, 0, { interactions: 0 });
		const result = getTeamInsights(viewer.id, 7);
		assert.deepEqual(result.summary, {
			activeUsers: 0, inputTokens: 0, outputTokens: 0, totalTokens: 0,
			interactions: 0, averageTokens: 0, medianTokens: 0,
		});
		assert.deepEqual(result.self, {
			isSelf: true, inputTokens: 0, outputTokens: 0, totalTokens: 0, interactions: 0,
			daysActive: 0, tokensPerActiveDay: 0, sharePercent: 0,
			rank: null, percentile: null, cohort: null,
		});
		assert.deepEqual(result.members, []);
		assert.deepEqual(result.quartiles, { q1: 0, q2: 0, q3: 0 });
		assert.deepEqual(result.cohorts, ['Light', 'Medium', 'Heavy', 'Very heavy'].map(label => ({ label, members: 0 })));
		assert.equal(result.daily.length, 7);
		for (const day of result.daily) {
			assert.deepEqual(day, { day: day.day, inputTokens: 0, outputTokens: 0, totalTokens: 0, interactions: 0, ownTokens: 0, activeUsers: 0 });
		}
		assertPrivateProjection(result);
	});

	test('one active uploader has rank one, null percentile, and Light cohort', () => {
		const viewer = user();
		upload(viewer.id, 75, 25);
		const result = getTeamInsights(viewer.id, 30);
		assert.deepEqual(result.quartiles, { q1: 100, q2: 100, q3: 100 });
		assert.equal(result.summary.averageTokens, 100);
		assert.equal(result.summary.medianTokens, 100);
		assert.equal(result.self.rank, 1);
		assert.equal(result.self.percentile, null);
		assert.equal(result.self.cohort, 'Light');
		assert.equal(result.self.sharePercent, 100);
		assert.deepEqual(result.members, [result.self]);
		assertPrivateProjection(result);
	});

	test('interpolates quartiles and assigns all four cohorts in descending order', () => {
		const viewers = [user(), user(), user(), user()];
		viewers.forEach((viewer, index) => upload(viewer.id, (index + 1) * 10));
		const result = getTeamInsights(viewers[1].id, 7);
		assert.deepEqual(result.quartiles, { q1: 17.5, q2: 25, q3: 32.5 });
		assert.equal(result.summary.averageTokens, 25);
		assert.equal(result.summary.medianTokens, 25);
		assert.deepEqual(result.members.map(member => member.totalTokens), [40, 30, 20, 10]);
		assert.deepEqual(result.members.map(member => member.cohort), ['Very heavy', 'Heavy', 'Medium', 'Light']);
		assert.deepEqual(result.members.map(member => member.rank), [1, 2, 3, 4]);
		assert.deepEqual(result.members.map(member => member.percentile), [100, 2 / 3 * 100, 1 / 3 * 100, 0]);
		assert.deepEqual(result.members.map(member => member.isSelf), [false, false, true, false]);
		assert.ok(result.cohorts.every(cohort => cohort.members === 1));
		assertPrivateProjection(result);
	});

	test('ties share inclusive cohort thresholds, competition rank and strictly-lower peer percentile', () => {
		const viewers = [user(), user(), user(), user(), user()];
		[10, 10, 20, 30, 30].forEach((tokens, index) => upload(viewers[index].id, tokens));
		const result = getTeamInsights(viewers[0].id, 7);
		assert.deepEqual(result.quartiles, { q1: 10, q2: 20, q3: 30 });
		assert.deepEqual(result.members.map(member => member.rank), [1, 1, 3, 4, 4]);
		assert.deepEqual(result.members.map(member => member.percentile), [75, 75, 50, 0, 0]);
		assert.deepEqual(result.members.map(member => member.cohort), ['Heavy', 'Heavy', 'Medium', 'Light', 'Light']);
		assert.deepEqual(result.cohorts.map(cohort => cohort.members), [2, 1, 2, 0]);
	});

	test('all equal totals stay Light with rank one and zero percentile', () => {
		const viewers = [user(), user(), user()];
		for (const viewer of viewers) upload(viewer.id, 12);
		const result = getTeamInsights(viewers[0].id, 7);
		assert.deepEqual(result.quartiles, { q1: 12, q2: 12, q3: 12 });
		assert.ok(result.members.every(member => member.cohort === 'Light' && member.rank === 1 && member.percentile === 0));
	});

	test('zero-token interactions are active, zero-only uploads are not', () => {
		const viewer = user();
		const zeroOnly = user();
		upload(viewer.id, 0, 0, { interactions: 3 });
		upload(viewer.id, 0, 0, { day: '2026-02-28', interactions: 0 });
		upload(zeroOnly.id, 0, 0, { interactions: 0 });
		const result = getTeamInsights(viewer.id, 7);
		assert.equal(result.summary.activeUsers, 1);
		assert.equal(result.summary.totalTokens, 0);
		assert.equal(result.summary.interactions, 3);
		assert.equal(result.self.daysActive, 1);
		assert.equal(result.self.tokensPerActiveDay, 0);
		assert.equal(result.self.sharePercent, 0);
		assert.equal(result.self.rank, 1);
		assert.equal(result.self.cohort, 'Light');
		assert.equal(result.daily.at(-1)!.activeUsers, 1);
		assert.equal(result.daily.at(-1)!.interactions, 3);
		assert.equal(result.daily.at(-2)!.activeUsers, 0);
		assertPrivateProjection(result);
	});

	test('counts exactly N UTC dates including today and excludes old and future uploads', () => {
		const viewer = user();
		for (const [days, startDay] of [[7, '2026-02-23'], [30, '2026-01-31'], [90, '2025-12-02']] as const) {
			getDb().exec('DELETE FROM usage_uploads');
			const beforeStart = new Date(`${startDay}T00:00:00Z`);
			beforeStart.setUTCDate(beforeStart.getUTCDate() - 1);
			upload(viewer.id, 10, 0, { day: startDay });
			upload(viewer.id, 20);
			upload(viewer.id, 10000, 0, { day: beforeStart.toISOString().slice(0, 10) });
			upload(viewer.id, 20000, 0, { day: '2026-03-02' });
			const result = getTeamInsights(viewer.id, days);
			assert.equal(result.days, days);
			assert.equal(result.startDay, startDay);
			assert.equal(result.endDay, TODAY);
			assert.equal(result.daily.length, days);
			assert.equal(new Set(result.daily.map(day => day.day)).size, days);
			assert.equal(result.daily[0].day, startDay);
			assert.equal(result.daily.at(-1)!.day, TODAY);
			assert.equal(result.self.daysActive, 2);
			assert.equal(result.summary.totalTokens, 30);
			for (let index = 1; index < result.daily.length; index++) {
				assert.equal(Date.parse(result.daily[index].day) - Date.parse(result.daily[index - 1].day), 86400000);
			}
		}
	});

	test('aggregates datasets and editors without duplicating active days or re-uploaded rows', () => {
		const viewer = user();
		const peer = user();
		upload(viewer.id, 100, 20);
		upload(viewer.id, 100, 20);
		upload(viewer.id, 10, 20, { datasetId: 'second-dataset', interactions: 2 });
		upload(viewer.id, 15, 5, { editor: 'second-editor', interactions: 3 });
		upload(viewer.id, 10, 20, { day: '2026-02-28', interactions: 4 });
		upload(peer.id, 300, 100, { interactions: 5 });
		upsertUserFluencyScore(peer.id, JSON.stringify({ privateData: SENTINEL }));
		const result = getTeamInsights(viewer.id, 7);
		assert.deepEqual(result.summary, {
			activeUsers: 2, inputTokens: 435, outputTokens: 165, totalTokens: 600,
			interactions: 15, averageTokens: 300, medianTokens: 300,
		});
		assert.deepEqual(result.self, {
			isSelf: true, inputTokens: 135, outputTokens: 65, totalTokens: 200, interactions: 10,
			daysActive: 2, tokensPerActiveDay: 100, sharePercent: 200 / 600 * 100,
			rank: 2, percentile: 0, cohort: 'Light',
		});
		assert.deepEqual(result.daily.at(-1), {
			day: TODAY, inputTokens: 425, outputTokens: 145, totalTokens: 570,
			interactions: 11, ownTokens: 170, activeUsers: 2,
		});
		assert.deepEqual(result.daily.at(-2), {
			day: '2026-02-28', inputTokens: 10, outputTokens: 20, totalTokens: 30,
			interactions: 4, ownTokens: 30, activeUsers: 1,
		});
		assert.equal(result.daily.reduce((sum, day) => sum + day.totalTokens, 0), result.summary.totalTokens);
		assert.equal(result.daily.reduce((sum, day) => sum + day.ownTokens, 0), result.self.totalTokens);
		assertPrivateProjection(result);
	});

	test('an inactive viewer is not a member and does not change peer quartiles', () => {
		const viewer = user();
		const peer = user();
		upload(peer.id, 100);
		upload(viewer.id, 500, 0, { day: '2026-03-02' });
		const result = getTeamInsights(viewer.id, 7);
		assert.equal(result.members.length, 1);
		assert.equal(result.members[0].isSelf, false);
		assert.equal(result.self.totalTokens, 0);
		assert.equal(result.self.rank, null);
		assert.equal(result.self.percentile, null);
		assert.equal(result.self.cohort, null);
		assert.deepEqual(result.quartiles, { q1: 100, q2: 100, q3: 100 });
		assert.ok(result.daily.every(day => day.ownTokens === 0));
		assertPrivateProjection(result);
	});
});

describe('GET /api/team-insights', () => {
	const app = new Hono().route('/api', api);

	test('rejects missing, malformed and invalid bearer authentication', async () => {
		for (const authorization of [undefined, 'Basic invalid', 'Bearer ', 'Bearer invalid-team-token']) {
			globalThis.fetch = async () => new Response('{}', { status: 401 });
			const response = await app.request('/api/team-insights', {
				headers: authorization ? { Authorization: authorization } : {},
			});
			assert.equal(response.status, 401);
			assert.deepEqual(await response.json(), { error: 'Unauthorized' });
		}
	});

	test('derives self only from auth, ignores identity selectors, and returns private no-store JSON', async () => {
		const viewer = user();
		const peer = user();
		upload(viewer.id, 100);
		upload(peer.id, 900);
		upsertUserFluencyScore(peer.id, JSON.stringify({ privateData: SENTINEL }));
		globalThis.fetch = async () => Response.json({
			id: viewer.github_id, login: viewer.github_login,
			name: viewer.github_name, avatar_url: viewer.avatar_url,
		});
		const selectors = `userId=${peer.id}&viewerId=${peer.id}&user_id=${peer.id}&login=${peer.github_login}`;
		const response = await app.request(`/api/team-insights?days=7&${selectors}`, {
			headers: { Authorization: `Bearer team-viewer-${viewer.github_id}`, 'X-User-Id': String(peer.id) },
		});
		assert.equal(response.status, 200);
		assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
		assert.match(response.headers.get('Content-Type')!, /application\/json/);
		const result = await response.json() as TeamInsights;
		assert.deepEqual(result, getTeamInsights(viewer.id, 7));
		assert.equal(result.self.totalTokens, 100);
		assert.deepEqual(result.members.map(member => member.isSelf), [false, true]);
		assertPrivateProjection(result);

		const fallback = await app.request('/api/team-insights?days=7junk', {
			headers: { Authorization: `Bearer team-viewer-${viewer.github_id}` },
		});
		assert.equal((await fallback.json() as TeamInsights).days, 30);
	});

	test('personal API responses are private no-store and cannot select another owner', async () => {
		const viewer = user();
		const peer = user();
		// /data uses SQLite's current UTC date rather than the mocked JavaScript clock.
		const { day } = getDb().prepare("SELECT date('now') AS day").get() as { day: string };
		upload(viewer.id, 100, 0, { day });
		upload(peer.id, 900, 0, { day });
		globalThis.fetch = async () => Response.json({
			id: viewer.github_id, login: viewer.github_login,
			name: viewer.github_name, avatar_url: viewer.avatar_url,
		});
		const headers = { Authorization: `Bearer personal-viewer-${viewer.github_id}` };
		const response = await app.request(`/api/data?userId=${peer.id}&user_id=${peer.id}`, { headers });
		assert.equal(response.status, 200);
		assert.equal(response.headers.get('Cache-Control'), 'private, no-store');
		const rows = await response.json() as Array<{ user_id: number; input_tokens: number }>;
		assert.equal(rows.length, 1);
		assert.equal(rows[0].user_id, viewer.id);
		assert.equal(rows[0].input_tokens, 100);

		const profile = await app.request(`/api/me?userId=${peer.id}`, { headers });
		assert.equal(profile.status, 200);
		assert.equal(profile.headers.get('Cache-Control'), 'private, no-store');
		assert.equal((await profile.json() as { githubId: number }).githubId, viewer.github_id);
	});
});
