#!/usr/bin/env node
'use strict';

/**
 * Renders every configured webview panel headlessly and writes a PNG per view.
 *
 * Usage:
 *   node render-views.js --out <dir> [--view <id>] [--theme dark|light|both]
 *                        [--dist <dir>] [--repo-root <dir>]
 *
 * `--dist` and `--repo-root` point the render at a different checkout's build,
 * which is how `visual-diff.js` renders the baseline commit: the fixtures and
 * this harness stay fixed while the webview bundles being rendered change, so
 * a diff isolates the change in rendering code.
 *
 * The screenshots are the deliverable — this script never posts anything
 * anywhere. Comparing two runs is `diff-screenshots.js`; getting the images in
 * front of a human (a PR comment, an artifact upload) is deliberately out of
 * scope for this skill.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const {
	REPO_ROOT,
	buildPageHtml,
	loadFixture,
} = require('./lib/harness');
const { loadChromium } = require('./lib/browser');
const { parseArgs, readConfig, selectViews } = require('./lib/config');

async function renderView({ browser, view, theme, outDir, tmpDir, defaults, distDir, repoRoot }) {
	const bundlePath = path.join(distDir, `${view.bundle}.js`);
	if (!fs.existsSync(bundlePath)) {
		return {
			view: view.id,
			theme,
			status: 'error',
			error: `Missing bundle ${bundlePath} — run \`npm run compile\` in vscode-extension/ first.`,
		};
	}

	const fixturePath = path.join(__dirname, 'fixtures', view.fixture);
	if (!fs.existsSync(fixturePath)) {
		return { view: view.id, theme, status: 'error', error: `Missing fixture ${view.fixture}` };
	}

	const html = buildPageHtml({
		globalName: view.global,
		fixture: loadFixture(fixturePath, repoRoot),
		theme,
		bundlePath,
		repoRoot,
	});

	const pageFile = path.join(tmpDir, `${view.id}-${theme}.html`);
	fs.writeFileSync(pageFile, html);

	const viewport = view.viewport || defaults.viewport;
	const page = await browser.newPage({
		viewport,
		deviceScaleFactor: 1,
		// Pinned so a date/number rendered by the view is stable between runs.
		locale: 'en-US',
		timezoneId: 'UTC',
		colorScheme: theme,
		reducedMotion: 'reduce',
	});

	const consoleErrors = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') { consoleErrors.push(msg.text()); }
	});
	page.on('pageerror', (err) => { consoleErrors.push(String(err && err.stack || err)); });

	try {
		await page.goto(`file://${pageFile}`, { waitUntil: 'networkidle', timeout: 30_000 });
		await page.waitForTimeout(view.settleMs ?? defaults.settleMs);
		// Web fonts and codicons load asynchronously; screenshotting before they
		// settle produces spurious diffs on every second run.
		await page.evaluate(() => document.fonts && document.fonts.ready);

		const probe = await page.evaluate(() => {
			const root = document.getElementById('root');
			return {
				rootChildren: root ? root.children.length : 0,
				bodyTextLength: (document.body.innerText || '').length,
				harnessErrors: window.__HARNESS_ERRORS__ || [],
			};
		});

		const file = path.join(outDir, `${view.id}.${theme}.png`);
		await page.screenshot({ path: file, fullPage: view.fullPage ?? defaults.fullPage });

		// A page that throws during render can still screenshot as a blank panel,
		// which would silently pass as "no visual change". Treat it as a failure.
		const rendered = probe.rootChildren > 0 && probe.bodyTextLength > 0;
		const errors = [...probe.harnessErrors, ...consoleErrors];
		return {
			view: view.id,
			title: view.title,
			theme,
			status: rendered && errors.length === 0 ? 'ok' : rendered ? 'warn' : 'error',
			file: path.relative(outDir, file),
			rootChildren: probe.rootChildren,
			bodyTextLength: probe.bodyTextLength,
			errors: errors.slice(0, 5),
			...(rendered ? {} : { error: 'View produced an empty #root — the fixture is probably missing required fields.' }),
		};
	} catch (error) {
		return { view: view.id, theme, status: 'error', error: String(error && error.message || error) };
	} finally {
		await page.close();
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const outDir = path.resolve(args.out || path.join(REPO_ROOT, 'visual-output', 'current'));
	const repoRoot = path.resolve(args['repo-root'] || REPO_ROOT);
	const distDir = path.resolve(args.dist || path.join(repoRoot, 'vscode-extension', 'dist', 'webview'));
	const config = readConfig(__dirname);
	const views = selectViews(config, args.view);
	const themes = args.theme === 'both' ? ['dark', 'light'] : [args.theme || 'dark'];

	if (views.length === 0) {
		console.error(`No enabled views matched${args.view ? ` "${args.view}"` : ''}.`);
		process.exit(1);
	}

	fs.mkdirSync(outDir, { recursive: true });
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'visual-view-diff-'));

	const chromium = loadChromium();
	const browser = await chromium.launch();
	const results = [];
	try {
		for (const view of views) {
			for (const theme of themes) {
				const result = await renderView({ browser, view, theme, outDir, tmpDir, defaults: config.defaults, distDir, repoRoot });
				results.push(result);
				const icon = result.status === 'ok' ? '✅' : result.status === 'warn' ? '⚠️ ' : '❌';
				const detail = result.status === 'ok'
					? `${result.bodyTextLength} chars of text`
					: (result.error || (result.errors || []).join(' | '));
				console.log(`${icon} ${view.id} (${theme}) — ${detail}`);
			}
		}
	} finally {
		await browser.close();
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}

	fs.writeFileSync(
		path.join(outDir, 'render-report.json'),
		JSON.stringify({ generatedAt: new Date().toISOString(), themes, distDir, repoRoot, results }, null, 2) + '\n',
	);

	const failed = results.filter((r) => r.status === 'error');
	console.log(`\n${results.length - failed.length}/${results.length} renders succeeded → ${path.relative(process.cwd(), outDir) || outDir}`);
	if (failed.length > 0) {
		process.exitCode = 1;
	}
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error);
		process.exit(1);
	});
}

module.exports = { renderView };
