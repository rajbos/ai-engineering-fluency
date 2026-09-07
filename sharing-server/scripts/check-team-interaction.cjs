'use strict';

// Uses the existing headless harness with a temporary loopback server and isolated data.
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync, readFileSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { buildSync } = require('esbuild');
const { loadChromium } = require('../../.github/skills/visual-view-diff/lib/browser.js');

async function main() {
	const chromium = loadChromium();
	const root = path.resolve(__dirname, '..');
	const scratch = mkdtempSync(path.join(tmpdir(), 'team-interactions-'));
	let browser;
	let server;
	let closeDb;
	try {
		process.env.LOCAL_DATA_DIR = scratch;
		process.env.SESSION_SECRET = 'headless-fixture-session-key-not-a-real-secret';
		process.env.CHART_JS_PATH = path.join(path.dirname(require.resolve('chart.js')), 'chart.umd.min.js');
		delete process.env.ADMIN_GITHUB_LOGINS;
		const bundle = path.join(scratch, 'fixture.cjs');
		buildSync({
			stdin: {
				contents: `
					export { createApp } from './src/app.ts';
					export { upsertUser, upsertUpload, closeDb } from './src/db.ts';
					export { encodeSession, makeClaims, COOKIE_NAME } from './src/session.ts';
					export { serve } from '@hono/node-server';
				`,
				resolveDir: root, loader: 'ts',
			},
			bundle: true, platform: 'node', format: 'cjs', target: 'node22',
			external: ['node:sqlite'], outfile: bundle, logLevel: 'silent',
		});
		const fixture = require(bundle);
		closeDb = fixture.closeDb;
		const app = fixture.createApp({ imagesDir: path.join(root, 'images') });
		const address = await new Promise(resolve => {
			server = fixture.serve({ fetch: app.fetch, hostname: '127.0.0.1', port: 0 }, resolve);
		});
		const baseUrl = `http://127.0.0.1:${address.port}`;
		assert.equal((await fetch(`${baseUrl}/health`)).status, 200);
		const today = new Date().toISOString().slice(0, 10);
		const old = new Date();
		old.setUTCDate(old.getUTCDate() - 40);
		const viewer = fixture.upsertUser(78001, 'self-login', 'Your profile', null);
		const forbidden = ['PRIVATE_PEER_LOGIN', 'PRIVATE_PEER_NAME', 'PRIVATE_WORKSPACE', 'PRIVATE_MACHINE', 'PRIVATE_MODEL'];
		for (let i = 0; i < 4; i++) {
			const user = i === 0 ? viewer : fixture.upsertUser(78001 + i, forbidden[0] + i, forbidden[1] + i, null);
			fixture.upsertUpload(user.id, {
				day: today, workspaceId: forbidden[2], machineId: forbidden[3], model: forbidden[4],
				inputTokens: (i + 1) * 100, outputTokens: 0, interactions: i + 1,
			});
			if (i === 0) fixture.upsertUpload(user.id, {
				day: old.toISOString().slice(0, 10), workspaceId: 'own-old', machineId: 'own-old', model: 'own-old',
				inputTokens: 1000, outputTokens: 0, interactions: 10,
			});
		}
		const assertPrivate = text => {
			for (const value of forbidden) assert.ok(!text.includes(value), `leaked ${value}`);
		};
		browser = await chromium.launch({ headless: true });
		const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, acceptDownloads: true });
		await context.addCookies([{
			name: fixture.COOKIE_NAME, value: fixture.encodeSession(fixture.makeClaims(viewer.id)),
			url: baseUrl, httpOnly: true, sameSite: 'Lax',
		}]);
		await context.route('**/*', async route => {
			assert.equal(new URL(route.request().url()).origin, baseUrl, 'no external network requests allowed');
			await route.continue();
		});
		const page = await context.newPage();
		const errors = [];
		page.on('pageerror', error => errors.push(error.message));
		await page.goto(`${baseUrl}/team`);
		assert.equal(await page.locator('#team-member-table tbody tr').count(), 4);
		assertPrivate(await page.content());
		assert.equal(await page.locator('.team-self td').first().textContent(), '4');

		for (const days of [7, 90, 30]) {
			await page.getByRole('link', { name: `Last ${days} days`, exact: true }).click();
			await page.waitForURL(`**/team?days=${days}`);
			assert.equal(await page.locator('#team-daily-numbers tbody tr').count(), days);
			assert.equal(await page.locator('.team-self td').first().textContent(), days === 90 ? '1' : '4');
			assertPrivate(await page.content());
		}
		await page.getByRole('button', { name: 'Per-user average', exact: true }).click();
		assert.equal(await page.getByRole('button', { name: 'Per-user average', exact: true }).getAttribute('aria-pressed'), 'true');
		let chart = await page.evaluate(() => {
			const chart = Chart.getChart(document.getElementById('team-trend-chart'));
			return { label: chart.data.datasets[0].label, last: chart.data.datasets[0].data.at(-1), own: chart.data.datasets[1].data.at(-1) };
		});
		assert.deepEqual(chart, { label: 'Mean per daily active uploader', last: 250, own: 100 });
		await page.getByRole('button', { name: 'Team total', exact: true }).click();
		assert.equal(await page.evaluate(() => Chart.getChart(document.getElementById('team-trend-chart')).data.datasets[0].data.at(-1)), 1000);
		await page.locator('#team-daily-numbers summary').click();
		assert.equal(await page.locator('#team-daily-numbers').getAttribute('open'), '');
		for (const format of ['CSV', 'JSON']) {
			const downloadPromise = page.waitForEvent('download');
			await page.getByRole('link', { name: `Download ${format}`, exact: true }).click();
			const download = await downloadPromise;
			assert.equal(download.suggestedFilename(), `team-insights-30days.${format.toLowerCase()}`);
			const contents = readFileSync(await download.path(), 'utf8');
			assertPrivate(contents);
			if (format === 'JSON') {
				const data = JSON.parse(contents);
				assert.equal(data.self.totalTokens, 100);
				assert.equal(data.summary.totalTokens, 1000);
			} else {
				assert.ok(contents.includes('"You","4","100","0","100"'));
			}
		}
		await page.setViewportSize({ width: 390, height: 844 });
		await page.waitForFunction(() => document.documentElement.scrollWidth <= window.innerWidth);
		await page.getByRole('link', { name: 'Your detailed dashboard', exact: true }).click();
		await page.waitForURL('**/dashboard');
		await page.getByRole('link', { name: 'Team Insights', exact: true }).click();
		await page.waitForURL('**/team');
		await page.getByRole('link', { name: 'Sign out', exact: true }).click();
		await page.waitForURL('**/dashboard');
		await page.goto(`${baseUrl}/team`);
		assert.equal(new URL(page.url()).pathname, '/dashboard');
		assertPrivate(await page.content());
		assert.deepEqual(errors, [], 'browser runtime errors');
		const noScript = await browser.newContext({ javaScriptEnabled: false });
		await noScript.addCookies([{
			name: fixture.COOKIE_NAME, value: fixture.encodeSession(fixture.makeClaims(viewer.id)),
			url: baseUrl, httpOnly: true, sameSite: 'Lax',
		}]);
		const plainPage = await noScript.newPage();
		await plainPage.goto(`${baseUrl}/team`);
		for (const days of [7, 90, 30]) {
			await plainPage.getByRole('link', { name: `Last ${days} days`, exact: true }).click();
			await plainPage.waitForURL(`**/team?days=${days}`);
			assert.equal(await plainPage.locator('#team-daily-numbers tbody tr').count(), days);
			assertPrivate(await plainPage.content());
		}
		console.log('Team interactions passed: period navigation (with/without JS), chart modes, daily table, exports, mobile layout, own dashboard, sign-out, privacy.');
	} finally {
		if (browser) await browser.close();
		if (server) await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
		if (closeDb) closeDb();
		rmSync(scratch, { recursive: true, force: true });
	}
}

main().catch(error => { console.error(error); process.exitCode = 1; });
