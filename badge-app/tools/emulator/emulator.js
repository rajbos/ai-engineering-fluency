#!/usr/bin/env node
'use strict';

/**
 * Runs a badge app in the badger.github.io MicroPython simulator, headlessly,
 * walks it through its scripted screens and saves a PNG of each.
 *
 * Usage (from the repo root):
 *   node badge-app/tools/emulator/emulator.js [--app badge-app/fluency] [--out badge-app/preview/emulator]
 *                                             [--scale 2] [--name <app name>]
 *
 * Unlike tools/preview.py, which stubs the badge API with Pillow, this runs the
 * real badge firmware Python and graphics library compiled to WebAssembly, so a
 * missing or renamed badge API, a font or an image the runtime cannot load
 * shows up here. It still approximates the hardware (no IMU, no sockets, other
 * timing), so finish on a real badge.
 *
 * Screenshots are named `badge-<app>--<shot>.dark.png` so the visual-view-diff
 * skill's diff-screenshots.js and the CI screenshot comment can use them as is.
 * The run fails when the app prints a traceback or stops drawing.
 *
 * Needs Playwright with Chromium (the same install the visual-view-diff skill
 * finds) and, on first use, network access to raw.githubusercontent.com to
 * download the pinned runtime into the cache (see lib/runtime.js).
 */

const fs = require('fs');
const http = require('http');
const path = require('path');

const runtime = require('./lib/runtime');
const { BUTTONS, SCENARIOS, validateScenarios } = require('./lib/scenarios');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const { loadChromium } = require(path.join(REPO_ROOT, '.github', 'skills', 'visual-view-diff', 'lib', 'browser.js'));

const PAGE = fs.readFileSync(path.join(__dirname, 'page.html'));
const CONTENT_TYPES = {
	'.js': 'text/javascript', '.mjs': 'text/javascript', '.wasm': 'application/wasm',
	'.json': 'application/json', '.py': 'text/plain; charset=utf-8',
};
const FRAME_TIMEOUT_MS = 30000;
const SETTLE_FRAMES = 6;

/** Serves the page and the runtime, downloading runtime files on first request. */
function startServer(pin, root) {
	const server = http.createServer(async (req, res) => {
		try {
			const url = new URL(req.url, 'http://127.0.0.1');
			if (req.method !== 'GET') { res.writeHead(405).end(); return; }
			if (url.pathname === '/') {
				res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(PAGE);
				return;
			}
			if (url.pathname.startsWith('/simulator/')) {
				const rel = decodeURIComponent(url.pathname.slice('/simulator/'.length));
				const data = await runtime.fetchRuntimeFile(pin, rel, root);
				if (!data) { res.writeHead(404).end(); return; }
				const type = CONTENT_TYPES[path.extname(rel)] || 'application/octet-stream';
				res.writeHead(200, { 'Content-Type': type }).end(data);
				return;
			}
			res.writeHead(404).end();
		} catch (error) {
			// The request path is attacker-shaped input; log it encoded so it cannot forge log lines.
			console.error(`[emulator] ${JSON.stringify(req.url)}: ${error.message}`);
			if (!res.headersSent) { res.writeHead(502); }
			res.end();
		}
	});
	return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

/** Every file of the app, as the worker's filesystem entries under /system/apps/<name>. */
function appFiles(appDir, appName) {
	const files = [];
	const visit = (dir, prefix) => {
		for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
			if (entry.name.startsWith('.') || entry.name === '__pycache__') { continue; }
			const full = path.join(dir, entry.name);
			const rel = prefix + entry.name;
			if (entry.isDirectory()) { visit(full, `${rel}/`); continue; }
			if (!entry.isFile()) { continue; }
			let data = fs.readFileSync(full);
			if (rel.endsWith('.py')) { data = Buffer.from(runtime.simulationSource(data.toString('utf8')), 'utf8'); }
			files.push({ name: `/system/apps/${appName}/${rel}`, data: data.toString('base64') });
		}
	};
	visit(appDir, '');
	return files;
}

/** Mirrors badger/home's simulator launcher for a single app, without its HOME/restart loop. */
function program(compat, appName) {
	const target = `/system/apps/${appName}`;
	return [
		'import editor_support',
		'import sys',
		'sys.path[:0] = ["/system/lib", "/lib", "/system"]',
		compat,
		'import badgeware',
		'badge.mode(LORES | VSYNC)',
		'badgeware.set_backlight(1.0)',
		`launch(${JSON.stringify(target)})`,
		'print("[emulator] app returned")',
	].join('\n');
}

function crashIn(lines) {
	// badgeware's launch() catches the exception and prints "- ERROR: <traceback>".
	return lines.find((line) => /^(Traceback|- ERROR:|[A-Za-z]*Error: )/.test(line));
}

class Session {
	constructor(page, label) {
		this.page = page;
		this.label = label;
		this.logIndex = 0;
		this.log = [];
	}

	async status() {
		const status = await this.page.evaluate(() => window.emu.status());
		const fresh = await this.page.evaluate((i) => window.emu.logSince(i), this.logIndex);
		this.logIndex += fresh.length;
		this.log.push(...fresh);
		const crash = status.bootError || (status.failed && 'the app stopped with an error') || crashIn(fresh);
		if (crash) {
			throw new Error(`${this.label}: ${crash}\n--- simulator output ---\n${this.log.slice(-40).join('\n')}`);
		}
		return status;
	}

	async waitFrames(count) {
		const start = (await this.status()).frames;
		const deadline = Date.now() + FRAME_TIMEOUT_MS;
		for (;;) {
			const { frames } = await this.status();
			if (frames >= start + count) { return; }
			if (Date.now() > deadline) {
				throw new Error(`${this.label}: no new frame in ${FRAME_TIMEOUT_MS / 1000}s\n--- simulator output ---\n${this.log.slice(-40).join('\n')}`);
			}
			await this.page.waitForTimeout(20);
		}
	}

	async setButtons(mask) {
		await this.page.evaluate((m) => window.emu.setButtons(m), mask);
		// Two polls per change: badge.pressed() is edge-triggered on the next poll.
		await this.waitFrames(2);
	}

	async step(step) {
		if (step.wait) {
			await this.waitFrames(step.wait);
			return;
		}
		const held = step.hold ? BUTTONS[step.hold] : 0;
		if (held) { await this.setButtons(held); }
		for (let i = 0; i < (step.times || 1); i++) {
			if (step.press) {
				await this.setButtons(held | BUTTONS[step.press]);
				await this.setButtons(held);
			}
		}
		if (held) { await this.setButtons(0); }
	}
}

/**
 * Runs every scenario of one app and writes its screenshots to outDir.
 * Returns the paths written. Each scenario gets a fresh browser context, so
 * nothing the worker persists (it keeps a user filesystem in IndexedDB) leaks
 * from one run into the next.
 */
async function renderApp({ browser, origin, compat, appDir, appName, outDir, scale = 2, scenarios = SCENARIOS }) {
	const runs = scenarios[appName];
	if (!runs) { throw new Error(`No emulator scenario for app "${appName}" (see lib/scenarios.js)`); }
	fs.mkdirSync(outDir, { recursive: true });
	const view = `badge-${appName}`;
	const written = [];
	for (const run of runs) {
		const context = await browser.newContext({ viewport: { width: 400, height: 300 } });
		// Only the local server: the app under test gets no other network.
		await context.route('**/*', (route) => (route.request().url().startsWith(`${origin}/`) ? route.continue() : route.abort('blockedbyclient')));
		try {
			const page = await context.newPage();
			await page.goto(`${origin}/`);
			const files = appFiles(appDir, appName);
			if (run.data) {
				const dataPath = path.join(appDir, ...run.data.split('/'));
				if (!fs.existsSync(dataPath)) { throw new Error(`${view}/${run.id}: ${run.data} not found in ${appDir}`); }
				files.push({ name: '/state/fluency.json', data: fs.readFileSync(dataPath).toString('base64') });
			}
			await page.evaluate((request) => window.emu.start(request), { program: program(compat, appName), files });
			const session = new Session(page, `${view}/${run.id}`);
			await session.waitFrames(SETTLE_FRAMES);
			for (const step of run.steps) {
				if (step.shot) {
					await session.waitFrames(SETTLE_FRAMES);
					const dataUrl = await page.evaluate((s) => window.emu.capture(s), scale);
					const file = path.join(outDir, `${view}--${step.shot}.dark.png`);
					fs.writeFileSync(file, Buffer.from(dataUrl.split(',')[1], 'base64'));
					written.push(file);
				} else {
					await session.step(step);
				}
			}
			await session.status();
		} finally {
			await context.close();
		}
	}
	return written;
}

/** Starts the runtime server and a browser; `use` gets everything renderApp needs but the app. */
async function withEmulator(use) {
	const pin = runtime.readPin();
	const root = runtime.cacheRoot(pin);
	const compat = await runtime.loadFirmwareCompat(pin, root);
	const server = await startServer(pin, root);
	const origin = `http://127.0.0.1:${server.address().port}`;
	const browser = await loadChromium().launch();
	try {
		return await use({ browser, origin, compat });
	} finally {
		await browser.close();
		server.close();
	}
}

function parseArgs(argv) {
	const args = {};
	for (let i = 0; i < argv.length; i++) {
		const match = /^--([a-z-]+)$/.exec(argv[i]);
		if (!match) { throw new Error(`Unexpected argument: ${argv[i]}`); }
		args[match[1]] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
	}
	return args;
}

async function main() {
	validateScenarios();
	const args = parseArgs(process.argv.slice(2));
	const appDir = path.resolve(args.app || path.join(REPO_ROOT, 'badge-app', 'fluency'));
	const appName = args.name || path.basename(appDir);
	const outDir = path.resolve(args.out || path.join(REPO_ROOT, 'badge-app', 'preview', 'emulator'));
	const scale = Number(args.scale || 2);
	if (!Number.isInteger(scale) || scale < 1 || scale > 4) { throw new Error('--scale must be 1, 2, 3 or 4'); }
	const written = await withEmulator((env) => renderApp({ ...env, appDir, appName, outDir, scale }));
	for (const file of written) { console.log('saved', path.relative(REPO_ROOT, file)); }
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.message || error);
		process.exit(1);
	});
}

module.exports = { appFiles, crashIn, parseArgs, program, renderApp, withEmulator };
