import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';
import { createApp } from '../app.js';
import { closeDb, getDb, upsertUpload, upsertUser, type UserRow } from '../db.js';
import { COOKIE_NAME, encodeSession, makeClaims } from '../session.js';
import { getTeamInsights } from '../teamInsights.js';

const { version: packageVersion } = require('../../package.json') as { version: string };
const app = createApp();
// Identity, device and dataset detail: never on member surfaces, in any form.
const sentinels = [
	'PEER_LOGIN_SENTINEL', 'PEER_NAME_SENTINEL', 'PEER_AVATAR_SENTINEL',
	'PEER_WORKSPACE_ID_SENTINEL',
	'PEER_MACHINE_ID_SENTINEL', 'PEER_MACHINE_NAME_SENTINEL', 'PEER_DATASET_SENTINEL',
	'PEER_FLUENCY_SENTINEL',
];
// Work-context labels: allowed as team aggregates (see sharing-server/AGENTS.md), never
// attached to a peer row.
const aggregateLabels = {
	workspaceName: 'PEER_WORKSPACE_NAME_SENTINEL',
	model: 'PEER_MODEL_SENTINEL',
	editor: 'PEER_EDITOR_SENTINEL',
	mcpServer: 'PEER_MCP_SENTINEL',
	tool: 'PEER_TOOL_SENTINEL',
};
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

/** Peer rows in the member table carry numbers only; work-context labels stay in aggregate sections. */
function assertPeerRowsCarryNoLabels(html: string): void {
	const table = html.split('id="team-member-table"')[1]?.split('</table>')[0] ?? '';
	for (const label of Object.values(aggregateLabels)) {
		assert.ok(!table.includes(label), `peer row carries ${label}`);
	}
	const dailyNumbers = html.split('id="team-daily-numbers"')[1]?.split('</details>')[0] ?? '';
	for (const label of Object.values(aggregateLabels)) {
		assert.ok(!dailyNumbers.includes(label), `daily numbers carry ${label}`);
	}
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
		day, model: aggregateLabels.model, workspaceId: sentinels[3], workspaceName: aggregateLabels.workspaceName,
		machineId: sentinels[4], machineName: sentinels[5], datasetId: sentinels[6],
		editor: aggregateLabels.editor, fluencyMetrics: { sentinel: sentinels[7] },
		inputTokens: 43210, outputTokens: 9876, interactions: 34,
		estimatedCostUsd: 1.25, clientVersion: '0.99.0-peer',
		activity: {
			sessions: 4, modes: { agent: 3, ask: 1 }, toolCalls: 6, toolsByName: { [aggregateLabels.tool]: 6 },
			mcpCalls: 2, mcpByServer: { [aggregateLabels.mcpServer]: 2 },
		},
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
			assertPeerRowsCarryNoLabels(html);
			// The peer's model, editor, repository, MCP server and tool are team context and show as
			// team totals with the viewer's own numbers, never as "Peer 1 used ...".
			const modelTable = html.split('id="team-models-table"')[1]?.split('</table>')[0] ?? '';
			assert.ok(modelTable.includes(`<th scope="row">${aggregateLabels.model}</th>`));
			const peerModelRow = modelTable.split('<tr').find(row => row.includes(aggregateLabels.model)) ?? '';
			assert.ok(peerModelRow.includes('<td>53,086</td><td>73.5%</td><td>1</td>'), 'team total, team share and uploader count');
			assert.ok(peerModelRow.includes('<td>0</td><td>0.0%</td>'), 'viewer has no own usage of the peer model');
			assert.ok((html.split('id="team-editors-table"')[1] ?? '').includes(aggregateLabels.editor));
			assert.ok((html.split('id="team-repository-table"')[1] ?? '').includes(aggregateLabels.workspaceName));
			assert.ok((html.split('id="team-mcp-table"')[1] ?? '').includes(aggregateLabels.mcpServer));
			assert.ok((html.split('id="team-tool-table"')[1] ?? '').includes(aggregateLabels.tool));
			assert.ok(html.includes('<div class="label">Estimated cost</div><div class="value team-value">$1.25</div>'));
			assert.ok(html.includes('<div class="label">Your estimated cost</div><div class="value team-value">$0.00</div>'));
			assert.ok(!html.includes('0.99.0-peer'), 'client versions are admin-only');
		}
	});

	test('CSV export keeps the numeric member table and carries no work-context labels', async () => {
		const csv = await (await request('/team/export?format=csv&days=30')).text();
		assertNoPeerMetadata(csv);
		for (const label of Object.values(aggregateLabels)) assert.ok(!csv.includes(label), `CSV carries ${label}`);
	});

	test('admin page shows the same breakdowns per named user, members never see that table', async () => {
		const adminHtml = await (await request('/admin', admin)).text();
		const table = adminHtml.split('id="admin-user-breakdown"')[1]?.split('</table>')[0];
		assert.ok(table, 'admin per-user breakdown is rendered');
		const peerRow = table.split('<tr>').find(row => row.includes(`>${peer.github_login}</a>`));
		assert.ok(peerRow, 'peer has a named row');
		for (const label of [aggregateLabels.model, aggregateLabels.editor, aggregateLabels.workspaceName, aggregateLabels.mcpServer, '0.99.0-peer', '$1.25']) {
			assert.ok(peerRow.includes(label), `admin row is missing ${label}`);
		}
		assert.ok(adminHtml.includes('id="admin-dimension-chart"'));
		assert.ok(adminHtml.includes('Models &amp; editors — team, last 30 days'));
		const memberHtml = await (await request('/team', viewer)).text();
		assert.ok(!memberHtml.includes('admin-user-breakdown'));
		assert.ok(!memberHtml.includes('admin-dimension-chart'));
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

	test('shows the running server package version with deployment details on member and admin pages', async () => {
		for (const [path, user] of [['/dashboard', viewer], ['/team', viewer], ['/admin', admin]] as const) {
			const html = await (await request(path, user)).text();
			const footer = html.split('<footer class="deploy-footer">')[1]?.split('</footer>')[0];
			assert.ok(footer?.includes(`sharing-server <code>v${packageVersion}</code> &middot; deployed from <code>`));
		}
	});

	test('admin overview and both charts abbreviate billion-scale token counts', async () => {
		const db = getDb();
		db.exec('SAVEPOINT billion_format');
		try {
			db.prepare('UPDATE usage_uploads SET input_tokens = ?, output_tokens = 0 WHERE user_id = ?')
				.run(4_555_100_000, viewer.id);
			db.prepare('UPDATE usage_uploads SET input_tokens = 0, output_tokens = 0, interactions = 0 WHERE user_id = ?')
				.run(peer.id);
			const adminHtml = await (await request('/admin', admin)).text();
			const panel = adminHtml.split('<div id="admin-stats-30"')[1]?.split('<div id="admin-stats-90"')[0];
			assert.ok(panel, '30-day overview panel is rendered');
			assert.match(panel, /<div class="label">Active Users<\/div><div class="value">1<\/div>/);
			assert.match(panel, /<div class="label">Total Tokens<\/div><div class="value">4\.6B<\/div>/);
			assert.match(panel, /<div class="label">Avg Tokens \/ User<\/div><div class="value">4\.6B<\/div>/);

			const personalHtml = await (await request('/dashboard', viewer)).text();
			for (const html of [adminHtml, personalHtml]) {
				const formatter = html.match(/function formatChartTokens\(n\) \{[\s\S]*?\n  \}/)?.[0];
				assert.ok(formatter, 'chart formatter is included in the rendered page');
				const format = runInNewContext(`${formatter}; formatChartTokens`, {}) as (n: number) => string;
				assert.equal(format(999), '999');
				assert.equal(format(1000), '1.0K');
				assert.equal(format(999_949), '999.9K');
				assert.equal(format(999_950), '1.0M');
				assert.equal(format(999_949_999), '999.9M');
				assert.equal(format(999_949_999.49), '999.9M');
				assert.equal(format(999_949_999.5), '1.0B');
				assert.equal(format(999_950_000), '1.0B');
				assert.equal(format(4_555_100_000), '4.6B');
				assert.match(html, /callback: function\(v\)[\s\S]*?return formatChartTokens\(v\)/);
				assert.match(html, /ctx\.dataset\.label \+ ': ' \+ formatChartTokens\(v\)/);
				assert.match(html, /'Total: ' \+ formatChartTokens\(total\)/);
			}
			const localFormatter = personalHtml.match(/function fmtLocal\(n\) \{[\s\S]*?\n  \}/)?.[0];
			assert.ok(localFormatter, 'local-time statistics formatter is included');
			const formatLocal = runInNewContext(`${localFormatter}; fmtLocal`, {}) as (n: number) => string;
			assert.equal(formatLocal(999_949), '999.9K');
			assert.equal(formatLocal(999_950), '1.0M');
			assert.equal(formatLocal(999_949_999), '999.9M');
			assert.equal(formatLocal(999_950_000), '1.0B');

			db.prepare('UPDATE usage_uploads SET input_tokens = ? WHERE user_id = ?')
				.run(999_950_000, viewer.id);
			const roundedUp = await (await request('/admin', admin)).text();
			assert.match(roundedUp, /<div class="label">Total Tokens<\/div><div class="value">1\.0B<\/div>/);
			db.prepare('UPDATE usage_uploads SET input_tokens = ? WHERE user_id = ?')
				.run(999_949_999, viewer.id);
			const belowBoundary = await (await request('/admin', admin)).text();
			assert.match(belowBoundary, /<div class="label">Total Tokens<\/div><div class="value">999\.9M<\/div>/);
		} finally {
			db.exec('ROLLBACK TO billion_format; RELEASE billion_format');
		}
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

	test('personal dashboard empty state gives setup guidance that actually enables uploads', async () => {
		const html = await (await request('/dashboard', inactive)).text();
		assert.ok(html.includes('No data yet.'));
		// Must match the contributed Command Palette title (vscode-extension/package.nls.json).
		assert.ok(html.includes('AI Engineering Fluency: Configure Team Server Backend'));
		// Every gate on the extension's Team Server upload path must be named: the endpoint URL
		// alone leaves uploads disabled, and a sharing profile of 'off' blocks them too.
		for (const setting of [
			'aiEngineeringFluency.backend.sharingServer.enabled',
			'aiEngineeringFluency.backend.sharingServer.endpointUrl',
			'aiEngineeringFluency.backend.sharingProfile',
		]) {
			assert.ok(html.includes(`<code>${setting}</code>`), `missing ${setting}`);
		}
		assert.ok(html.includes('any value other than <code>off</code>'));
		// The Azure Storage toggle does not gate Team Server uploads, so telling users to set
		// it would be a stale workaround.
		assert.ok(!html.includes('aiEngineeringFluency.backend.enabled'));
		// The extension has no status-bar sync; saving the settings is the trigger.
		assert.ok(!html.includes('status bar'));
		assertNoPeerMetadata(html);
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
