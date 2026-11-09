'use strict';

/**
 * Renders the member Team Insights page, the admin dashboard and the personal dashboard
 * against an isolated fixture server seeded with deterministic sample data, and saves
 * full-page PNGs into sharing-server/images/ for the docs.
 *
 * Same harness as check-team-interaction.cjs: a temporary SQLite database, a loopback
 * server, headless Chromium from the repo's visual-view-diff tooling, no real users, no
 * GitHub calls, never an IDE. Run from sharing-server/: `node scripts/capture-screenshots.cjs`.
 */
const { mkdtempSync, rmSync, mkdirSync } = require('node:fs');
const { tmpdir } = require('node:os');
const path = require('node:path');
const { buildSync } = require('esbuild');
const { loadChromium } = require('../../.github/skills/visual-view-diff/lib/browser.js');

/** Small deterministic PRNG so the screenshots are reproducible. */
function rng(seed) {
	let state = seed >>> 0;
	return () => {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 2 ** 32;
	};
}

const PEOPLE = [
	{ id: 91001, login: 'alice-dev', name: 'Alice Martin', weight: 1.6, favouriteModel: 'claude-sonnet-5', editors: ['VS Code', 'Claude Code'], repos: ['payments-api', 'web-frontend'], version: '0.52.0' },
	{ id: 91002, login: 'bob-builds', name: 'Bob Jansen', weight: 1.0, favouriteModel: 'gpt-5.4', editors: ['VS Code', 'Copilot CLI'], repos: ['infra-terraform', 'payments-api'], version: '0.52.0' },
	{ id: 91003, login: 'carol-codes', name: 'Carol Nguyen', weight: 2.3, favouriteModel: 'claude-opus-5', editors: ['Claude Code', 'Copilot CLI'], repos: ['data-pipeline', 'web-frontend'], version: '0.51.0' },
	{ id: 91004, login: 'dave-data', name: 'Dave Okafor', weight: 0.6, favouriteModel: 'gemini-3-pro', editors: ['JetBrains'], repos: ['data-pipeline'], version: '0.49.2' },
	{ id: 91005, login: 'erin-eng', name: 'Erin Kowalski', weight: 1.2, favouriteModel: 'claude-sonnet-5', editors: ['VS Code', 'Copilot CLI'], repos: ['web-frontend', 'infra-terraform'], version: '0.52.0' },
];
const MODELS = ['claude-sonnet-5', 'gpt-5.4', 'claude-opus-5', 'gemini-3-pro'];
const PRICE = { 'claude-sonnet-5': [3, 15], 'gpt-5.4': [2, 8], 'claude-opus-5': [15, 75], 'gemini-3-pro': [1.25, 10] };
const TOOLS = ['read_file', 'edit_file', 'run_in_terminal', 'grep_search', 'Bash'];
const MCP = ['github', 'playwright', 'azure-devops'];

function seed(fixture) {
	const random = rng(20261108);
	const users = PEOPLE.map(person => ({ person, row: fixture.upsertUser(person.id, person.login, person.name, null) }));
	fixture.getDb().prepare('UPDATE users SET is_admin = 1 WHERE github_login = ?').run('erin-eng');
	const today = new Date();
	today.setUTCHours(0, 0, 0, 0);
	for (let offset = 29; offset >= 0; offset--) {
		const date = new Date(today);
		date.setUTCDate(date.getUTCDate() - offset);
		const day = date.toISOString().slice(0, 10);
		const weekend = [0, 6].includes(date.getUTCDay());
		// Over the month, usage moves from VS Code chat towards CLI agents and from GPT to Claude.
		const progress = (29 - offset) / 29;
		for (const { person, row } of users) {
			if (weekend && random() < 0.8) continue;
			if (random() < 0.15) continue;
			const editors = person.editors.filter((editor, index) => index === 0 || random() < 0.35 + progress * 0.4);
			for (const editor of editors) {
				const modelPool = [person.favouriteModel, MODELS[Math.floor(random() * MODELS.length)]];
				for (const model of new Set(modelPool)) {
					const shift = model.startsWith('gpt') ? 1.3 - progress * 0.8 : 0.7 + progress * 0.6;
					const scale = person.weight * shift * (editor === 'VS Code' ? 1 : 1.8) * (0.5 + random());
					const inputTokens = Math.round(scale * 180_000);
					const outputTokens = Math.round(scale * 14_000);
					const interactions = Math.max(1, Math.round(scale * 9));
					const repo = person.repos[Math.floor(random() * person.repos.length)];
					const agentish = editor === 'VS Code' ? 0.4 + progress * 0.3 : 0.95;
					const agent = Math.round(interactions * agentish);
					const toolCalls = Math.round(agent * (3 + random() * 4));
					const [inPrice, outPrice] = PRICE[model];
					const activity = {
						sessions: Math.max(1, Math.round(interactions / 4)),
						modes: editor === 'VS Code'
							? { ask: interactions - agent, agent, edit: Math.round(random() * 2) }
							: { cli: agent, agent: interactions - agent },
						toolCalls,
						toolsByName: Object.fromEntries(TOOLS.filter(() => random() < 0.7).map(tool => [tool, Math.max(1, Math.round(toolCalls * random() * 0.5))])),
						mcpCalls: 0,
						mcpByServer: {},
					};
					if (random() < 0.5) {
						const server = MCP[Math.floor(random() * MCP.length)];
						activity.mcpByServer[server] = Math.max(1, Math.round(random() * 6));
						activity.mcpCalls = activity.mcpByServer[server];
					}
					fixture.upsertUpload(row.id, {
						day, model, editor,
						workspaceId: `hash-${repo}`, workspaceName: repo,
						machineId: `hash-${person.login}-laptop`,
						inputTokens, outputTokens, interactions,
						estimatedCostUsd: Math.round((inputTokens * inPrice + outputTokens * outPrice) / 1_000_000 * 100) / 100,
						clientVersion: person.version,
						activity,
					});
				}
			}
		}
	}
	fixture.upsertUserFluencyScore(users[0].row.id, JSON.stringify({
		overallStage: 3, overallLabel: 'Practitioner', computedAt: new Date().toISOString(),
		categories: [
			{ category: 'Agent mode adoption', icon: '🤖', stage: 3, tips: ['Try plan mode for larger changes'] },
			{ category: 'Tool & MCP usage', icon: '🔧', stage: 3, tips: [] },
			{ category: 'Repository customization', icon: '📝', stage: 2, tips: ['Add AGENTS.md to payments-api'] },
		],
	}));
	return users;
}

async function main() {
	const chromium = loadChromium();
	const root = path.resolve(__dirname, '..');
	const outDir = path.join(root, 'images');
	mkdirSync(outDir, { recursive: true });
	const scratch = mkdtempSync(path.join(tmpdir(), 'team-screenshots-'));
	let browser;
	let server;
	let closeDb;
	try {
		process.env.LOCAL_DATA_DIR = scratch;
		process.env.NODE_ENV = 'test';
		process.env.SESSION_SECRET = 'headless-fixture-session-key-not-a-real-secret';
		process.env.CHART_JS_PATH = path.join(path.dirname(require.resolve('chart.js')), 'chart.umd.min.js');
		delete process.env.ADMIN_GITHUB_LOGINS;
		const bundle = path.join(scratch, 'fixture.cjs');
		buildSync({
			stdin: {
				contents: `
					export { createApp } from './src/app.ts';
					export { getDb, upsertUser, upsertUpload, upsertUserFluencyScore, closeDb } from './src/db.ts';
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
		const users = seed(fixture);
		const member = users[0].row;
		const admin = users[4].row;

		browser = await chromium.launch({ headless: true });
		const shoot = async (user, route, file, prepare) => {
			const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
			await context.addCookies([{
				name: fixture.COOKIE_NAME, value: fixture.encodeSession(fixture.makeClaims(user.id)),
				url: baseUrl, httpOnly: true, sameSite: 'Lax',
			}]);
			const page = await context.newPage();
			await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
			if (prepare) await prepare(page);
			// A fullPage capture resizes the viewport while Chart.js is still drawing, which
			// leaves the first chart half-rendered. Size the viewport to the document first,
			// let the charts finish their entry animation (1s default), then capture as-is.
			const height = await page.evaluate(() => document.documentElement.scrollHeight);
			await page.setViewportSize({ width: 1440, height: Math.min(height, 16_000) });
			await page.waitForTimeout(2000);
			await page.screenshot({ path: path.join(outDir, file), fullPage: false });
			await context.close();
			console.log(`saved images/${file}`);
		};
		await shoot(member, '/team', 'team-insights.png');
		await shoot(member, '/team', 'team-insights-own-mix.png', async page => {
			await page.locator('[data-team-dimension="models"][data-team-scope="own"]').click();
			await page.locator('[data-team-dimension="editors"][data-team-scope="own"]').click();
		});
		await shoot(admin, '/admin', 'admin-dashboard.png');
		await shoot(member, '/dashboard', 'personal-dashboard.png');
	} finally {
		if (browser) await browser.close();
		if (server) await new Promise(resolve => server.close(resolve));
		if (closeDb) closeDb();
		rmSync(scratch, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
	}
}

main().catch(error => {
	console.error(error);
	process.exit(1);
});
