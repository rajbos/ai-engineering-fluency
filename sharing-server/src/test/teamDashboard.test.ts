import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../app.js';
import { closeDb, getDb, upsertUpload, upsertUser, type UserRow } from '../db.js';
import { COOKIE_NAME, encodeSession, makeClaims } from '../session.js';
import { getTeamInsights } from '../teamInsights.js';

const app = createApp();
const sentinels = [
	'PEER_LOGIN_SENTINEL', 'PEER_NAME_SENTINEL', 'PEER_AVATAR_SENTINEL',
	'PEER_WORKSPACE_ID_SENTINEL', 'PEER_WORKSPACE_NAME_SENTINEL',
	'PEER_MACHINE_ID_SENTINEL', 'PEER_MACHINE_NAME_SENTINEL', 'PEER_DATASET_SENTINEL',
	'PEER_MODEL_SENTINEL', 'PEER_EDITOR_SENTINEL', 'PEER_FLUENCY_SENTINEL',
];
let dataDir: string;
let viewer: UserRow;
let peer: UserRow;
let admin: UserRow;
let inactive: UserRow;
const previousDataDir = process.env.LOCAL_DATA_DIR;
const previousAdmins = process.env.ADMIN_GITHUB_LOGINS;

function cookie(user: UserRow): string {
	return `${COOKIE_NAME}=${encodeSession(makeClaims(user.id))}`;
}

async function request(path: string, user: UserRow = viewer): Promise<Response> {
	return app.request(path, { headers: { Cookie: cookie(user) } });
}

function assertNoPeerMetadata(text: string): void {
	for (const sentinel of sentinels) assert.ok(!text.includes(sentinel), `leaked ${sentinel}`);
}

before(() => {
	dataDir = mkdtempSync(join(tmpdir(), 'sharing-team-dashboard-'));
	process.env.LOCAL_DATA_DIR = dataDir;
	delete process.env.ADMIN_GITHUB_LOGINS;
	viewer = upsertUser(910001, 'viewer', 'Viewer Name', null);
	peer = upsertUser(910002, sentinels[0], sentinels[1], `https://example.invalid/${sentinels[2]}`);
	admin = upsertUser(910003, 'admin', 'Admin Name', null);
	inactive = upsertUser(910004, 'inactive', 'Inactive Name', null);
	getDb().prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(admin.id);
	const day = new Date().toISOString().slice(0, 10);
	upsertUpload(viewer.id, {
		day, model: 'own-model', workspaceId: 'own-workspace', machineId: 'own-machine',
		inputTokens: 12345, outputTokens: 6789, interactions: 12,
	});
	upsertUpload(peer.id, {
		day, model: sentinels[8], workspaceId: sentinels[3], workspaceName: sentinels[4],
		machineId: sentinels[5], machineName: sentinels[6], datasetId: sentinels[7],
		editor: sentinels[9], fluencyMetrics: { sentinel: sentinels[10] },
		inputTokens: 43210, outputTokens: 9876, interactions: 34,
	});
});

after(() => {
	closeDb();
	if (previousDataDir === undefined) delete process.env.LOCAL_DATA_DIR;
	else process.env.LOCAL_DATA_DIR = previousDataDir;
	if (previousAdmins === undefined) delete process.env.ADMIN_GITHUB_LOGINS;
	else process.env.ADMIN_GITHUB_LOGINS = previousAdmins;
	rmSync(dataDir, { recursive: true, force: true });
});

describe('member dashboard privacy boundary', () => {
	test('rejects missing, forged, expired and deleted-user sessions on pages and exports', async () => {
		const expired = encodeSession({ ...makeClaims(viewer.id), exp: 1 });
		const unknown = encodeSession(makeClaims(999999));
		for (const path of ['/team', '/team/export?format=json', '/team/export?format=csv']) {
			for (const value of ['', 'forged', expired, unknown]) {
				const response = await app.request(path, { headers: { Cookie: `${COOKIE_NAME}=${value}` } });
				assert.equal(response.status, 302);
				assert.equal(response.headers.get('location'), '/dashboard');
				assert.equal(response.headers.get('cache-control'), 'private, no-store');
				assertNoPeerMetadata(await response.text());
			}
		}
	});

	test('renders exact anonymous numbers and marks only the authenticated viewer, for every period', async () => {
		for (const days of [7, 30, 90]) {
			const response = await request(`/team?days=${days}&userId=${peer.id}&github_login=${peer.github_login}`);
			assert.equal(response.status, 200);
			assert.equal(response.headers.get('cache-control'), 'private, no-store');
			const html = await response.text();
			assertNoPeerMetadata(html);
			assert.ok(html.includes('Viewer Name'));
			assert.ok(html.includes(`href="/team?days=${days}" aria-current="page"`));
			assert.ok(html.includes('Names are hidden, not guaranteed anonymous.'));
			assert.ok(html.includes('43,210'));
			assert.ok(html.includes('9,876'));
			const ownRow = html.match(/<tr class="team-self" data-self="true">[\s\S]*?<\/tr>/g);
			assert.equal(ownRow?.length, 1);
			assert.ok(ownRow![0].includes('12,345'));
			assert.ok(!ownRow![0].includes('43,210'));
			assert.ok(html.includes(`<a class="btn btn-secondary" href="/team/export?days=${days}&amp;format=csv">`));
			assert.ok(html.includes(`<a class="btn btn-secondary" href="/team/export?days=${days}&amp;format=json">`));
			assert.ok(!html.includes('ADMIN_CHART_DATA'));
			assert.ok(!html.includes('href="/admin"'));
		}
	});

	test('full JSON exports equal the shared allowlisted projection and ignore identity selectors', async () => {
		for (const user of [viewer, peer, admin]) {
			const response = await request(`/team/export?format=json&days=7&user_id=${peer.id}`, user);
			assert.equal(response.status, 200);
			assert.equal(response.headers.get('content-disposition'), 'attachment; filename="team-insights-7days.json"');
			assert.equal(response.headers.get('cache-control'), 'private, no-store');
			const body = await response.text();
			// Even when the peer signs in, exports contain no profiles at all.
			assertNoPeerMetadata(body);
			assert.deepEqual(JSON.parse(body), getTeamInsights(user.id, 7));
		}
	});

	test('CSV is exact, numeric and anonymous, with self labeling and no private fields', async () => {
		const response = await request('/team/export?format=csv&days=30');
		assert.equal(response.status, 200);
		assert.equal(response.headers.get('content-type'), 'text/csv; charset=utf-8');
		assert.equal(response.headers.get('cache-control'), 'private, no-store');
		assert.equal(response.headers.get('content-disposition'), 'attachment; filename="team-insights-30days.csv"');
		const csv = await response.text();
		assertNoPeerMetadata(csv);
		const lines = csv.trim().split('\r\n');
		assert.equal(lines.length, 3);
		assert.ok(lines[1].includes('"Peer 1","1","43210","9876","53086","34","1"'));
		assert.ok(lines[2].includes('"You","2","12345","6789","19134","12","1"'));
		assert.ok(!csv.includes('viewer'));
	});

	test('exports reject unsupported formats and normalize unsupported periods', async () => {
		assert.equal((await request('/team/export?format=html')).status, 400);
		const response = await request('/team/export?format=json&days=9999');
		assert.equal((await response.json()).days, 30);
	});

	test('admin membership never expands the member projection or its HTML', async () => {
		const response = await request('/team', admin);
		assert.equal(response.status, 200);
		const html = await response.text();
		assertNoPeerMetadata(html);
		assert.ok(html.includes('href="/admin"'));
		assert.ok(html.includes('You have no active uploads in this period.'));
		assert.ok(!html.includes('ADMIN_CHART_DATA'));
	});

	test('admin details remain server-authorized and owner pages stay owner-only', async () => {
		const denied = await request(`/admin?is_admin=1&user_id=${admin.id}`);
		assert.equal(denied.status, 302);
		assert.equal(denied.headers.get('location'), '/dashboard');
		const allowed = await request('/admin', admin);
		assert.equal(allowed.status, 200);
		assert.equal(allowed.headers.get('cache-control'), 'private, no-store');
		assert.ok((await allowed.text()).includes(peer.github_login));
		const own = await request(`/dashboard?user_id=${peer.id}`);
		assert.equal(own.status, 200);
		assert.equal(own.headers.get('cache-control'), 'private, no-store');
		assertNoPeerMetadata(await own.text());
		getDb().prepare('UPDATE users SET is_admin = 0 WHERE id = ?').run(admin.id);
		assert.equal((await request('/admin', admin)).status, 302, 'role changes take effect on the next request');
	});

	test('inactive members are not ranked, and zero-activity windows explain the empty state', async () => {
		const html = await (await request('/team', inactive)).text();
		assert.ok(html.includes('You have no active uploads in this period.'));
		assert.ok(!html.includes('data-self="true"'));
		// Temporarily move fixture data outside all supported periods; restore it even on failure.
		getDb().prepare("UPDATE usage_uploads SET day = date(day, '-100 days')").run();
		try {
			const empty = await (await request('/team')).text();
			assert.ok(empty.includes('No active uploaders in this period.'));
			assert.ok(empty.includes('No active uploads in this period yet.'));
			assertNoPeerMetadata(empty);
		} finally {
			getDb().prepare("UPDATE usage_uploads SET day = date(day, '+100 days')").run();
		}
	});
});
