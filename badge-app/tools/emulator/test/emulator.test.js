'use strict';

// Run: node --test badge-app/tools/emulator/test/*.test.js
// Pure-function tests; nothing here downloads the runtime or starts a browser.

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');

const runtime = require('../lib/runtime');
const { SCENARIOS, validateScenarios } = require('../lib/scenarios');
const { CLOCK_PRELUDE, CLOCK_SETTLE_MS, CLOCK_STEP_MS, appFiles, crashIn, program } = require('../emulator');
const { mergeReports } = require('../badge-diff');

test('readPin accepts the committed pin and rejects a branch name', () => {
	const pin = runtime.readPin();
	assert.match(pin.revision, /^[0-9a-f]{40}$/);
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'pin-'));
	const file = path.join(dir, 'runtime.json');
	fs.writeFileSync(file, JSON.stringify({ repository: 'badger/badger.github.io', revision: 'main' }));
	assert.throws(() => runtime.readPin(file), /40-character/);
	fs.rmSync(dir, { recursive: true, force: true });
});

test('safeRuntimePath only allows plain relative segments', () => {
	assert.equal(runtime.safeRuntimePath('asyncify/micropython.wasm'), 'asyncify/micropython.wasm');
	assert.equal(runtime.safeRuntimePath('filesystem/badgeware/__init__.py'), 'filesystem/badgeware/__init__.py');
	for (const bad of ['../secrets', 'a/../../b', '/etc/passwd', 'a//b', '.git/config', 'a\\b', '']) {
		assert.equal(runtime.safeRuntimePath(bad), null, bad);
	}
});

test('fetchRuntimeFile refuses an unsafe path without fetching', async () => {
	let called = false;
	const result = await runtime.fetchRuntimeFile({ repository: 'a/b', revision: 'f'.repeat(40) }, '../x', os.tmpdir(), () => { called = true; });
	assert.equal(result, null);
	assert.equal(called, false);
});

test('cachePath keeps every cached file inside the cache root', () => {
	const root = path.join(os.tmpdir(), 'emu-root');
	assert.equal(runtime.cachePath(root, 'public/simulator/util.js'), path.join(root, 'public', 'simulator', 'util.js'));
	assert.throws(() => runtime.cachePath(root, '../outside.js'), /outside/);
	assert.throws(() => runtime.cachePath(root, 'a/../../outside.js'), /outside/);
});

test('fetchCached leaves no partial file behind and the cached copy is only visible once complete', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'emu-partial-'));
	const pin = { repository: 'badger/badger.github.io', revision: 'b'.repeat(40) };
	const fake = async () => ({ status: 200, ok: true, arrayBuffer: async () => new TextEncoder().encode('data').buffer });
	assert.equal(String(await runtime.fetchRuntimeFile(pin, 'x.js', root, fake)), 'data');
	assert.deepEqual(fs.readdirSync(path.join(root, 'simulator', 'public', 'simulator')), ['x.js']);
	fs.rmSync(root, { recursive: true, force: true });
});

test('fetchRuntimeFile caches the first download and maps 404 to null', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'emu-cache-'));
	const pin = { repository: 'badger/badger.github.io', revision: 'a'.repeat(40) };
	const urls = [];
	const fake = async (url) => {
		urls.push(url);
		if (url.endsWith('missing.js')) { return { status: 404, ok: false }; }
		return { status: 200, ok: true, arrayBuffer: async () => new TextEncoder().encode('worker').buffer };
	};
	assert.equal(String(await runtime.fetchRuntimeFile(pin, 'util.js', root, fake)), 'worker');
	assert.equal(String(await runtime.fetchRuntimeFile(pin, 'util.js', root, fake)), 'worker');
	assert.equal(await runtime.fetchRuntimeFile(pin, 'missing.js', root, fake), null);
	assert.deepEqual(urls, [
		`https://raw.githubusercontent.com/badger/badger.github.io/${'a'.repeat(40)}/public/simulator/util.js`,
		`https://raw.githubusercontent.com/badger/badger.github.io/${'a'.repeat(40)}/public/simulator/missing.js`,
	]);
	fs.rmSync(root, { recursive: true, force: true });
});

test('extractFirmwareCompat unescapes the template literal without evaluating it', () => {
	const source = 'import x\nexport const firmwareCompat = `\nmac = b"\\\\x00"\nlines = "a\\\\r\\\\nb"\ncode = \\`x\\`\n`\nexport const other = 1\n';
	assert.equal(runtime.extractFirmwareCompat(source), '\nmac = b"\\x00"\nlines = "a\\r\\nb"\ncode = `x`\n');
	assert.throws(() => runtime.extractFirmwareCompat('export const firmwareCompat = `${evil}`'), /interpolation/);
	assert.throws(() => runtime.extractFirmwareCompat('export const firmwareCompat = `\\u0041`'), /unsupported escape/);
	assert.throws(() => runtime.extractFirmwareCompat('export const firmwareCompat = `open'), /not terminated/);
	assert.throws(() => runtime.extractFirmwareCompat('const nothing = 1'), /not found/);
});

test('simulationSource swaps native/viper decorators but not inside strings', () => {
	const source = '@micropython.native\ndef f():\n    s = """\n@micropython.viper\n"""\n    pass';
	assert.equal(runtime.simulationSource(source), '@editor_support.native\ndef f():\n    s = """\n@micropython.viper\n"""\n    pass');
});

test('the committed scenarios are valid and bad ones are rejected', () => {
	validateScenarios(SCENARIOS);
	assert.throws(() => validateScenarios({ a: [{ id: 'x', steps: [{ press: 'jump' }] }] }), /unknown button/);
	assert.throws(() => validateScenarios({ a: [{ id: 'x', steps: [{ shot: 'Bad Name' }] }] }), /bad shot name/);
	assert.throws(() => validateScenarios({ a: [{ id: 'x', steps: [{ shot: 'one' }] }, { id: 'y', steps: [{ shot: 'one' }] }] }), /used twice/);
	validateScenarios({ a: [{ id: 'x', steps: [{ wait: 800 }, { shot: 'one' }] }] });
	assert.throws(() => validateScenarios({ a: [{ id: 'x', steps: [{ wait: 0 }] }] }), /wait must be/);
	assert.throws(() => validateScenarios({ a: [{ id: 'x', steps: [{ wait: 60001 }] }] }), /wait must be/);
	assert.throws(() => validateScenarios({ a: [{ id: 'x', steps: [{ wait: 2.5 }] }] }), /wait must be/);
	assert.throws(() => validateScenarios({ a: [{ id: 'x', steps: [{}] }] }), /needs shot/);
});

test('crashIn spots tracebacks and badgeware error screens only', () => {
	assert.equal(crashIn(['ok', '- ERROR:   File "x", line 1']), '- ERROR:   File "x", line 1');
	assert.equal(crashIn(['AttributeError: nope']), 'AttributeError: nope');
	assert.equal(crashIn(['Traceback (most recent call last):']), 'Traceback (most recent call last):');
	assert.equal(crashIn(['fluency: could not read fluency.json - ENOENT', '[emulator] app returned']), undefined);
});

test('appFiles maps the app under /system/apps and skips dotfiles and caches', () => {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'app-'));
	fs.mkdirSync(path.join(dir, 'assets'));
	fs.mkdirSync(path.join(dir, '__pycache__'));
	fs.writeFileSync(path.join(dir, '__init__.py'), '@micropython.viper\ndef f(): pass\n');
	fs.writeFileSync(path.join(dir, 'assets', 'a.json'), '{}');
	fs.writeFileSync(path.join(dir, '.DS_Store'), 'x');
	fs.writeFileSync(path.join(dir, '__pycache__', 'x.pyc'), 'x');
	const files = appFiles(dir, 'demo');
	assert.deepEqual(files.map((f) => f.name), ['/system/apps/demo/__init__.py', '/system/apps/demo/assets/a.json']);
	assert.match(Buffer.from(files[0].data, 'base64').toString(), /^@editor_support\.viper/);
	fs.rmSync(dir, { recursive: true, force: true });
});

test('program launches the app by its installed path after the compat prelude', () => {
	const text = program('# compat', 'fluency');
	assert.ok(text.indexOf('# compat') < text.indexOf('launch("/system/apps/fluency")'));
});

test('program installs the virtual clock after badgeware and before the app starts', () => {
	const text = program('# compat', 'fluency');
	const at = text.indexOf(CLOCK_PRELUDE);
	assert.ok(at > text.indexOf('import badgeware'), 'the clock needs badge and editor_support loaded');
	assert.ok(at < text.indexOf('launch("/system/apps/fluency")'), 'the app must only ever see the virtual clock');
	// Both clock reads go through it, and the poll that runs once per frame moves it.
	assert.match(CLOCK_PRELUDE, /^type\(badge\)\.ticks = property\(/m);
	assert.match(CLOCK_PRELUDE, /^type\(badge\)\.ticks_delta = property\(/m);
	assert.match(CLOCK_PRELUDE, /^badge\.poll = _emu_poll$/m);
	assert.match(CLOCK_PRELUDE, /js\.emuClockTarget/);
	assert.ok(CLOCK_PRELUDE.includes(`min(${CLOCK_STEP_MS}, `), 'one fixed step per frame');
});

test('shots settle after the intro animations and before the score bars reload', () => {
	const source = fs.readFileSync(path.join(__dirname, '..', '..', '..', 'fluency', '__init__.py'), 'utf8');
	const constant = (name) => {
		const match = new RegExp(`^${name} = (\\d+)`, 'm').exec(source);
		assert.ok(match, `${name} not found in fluency/__init__.py`);
		return Number(match[1]);
	};
	const spiderIntro = constant('SPIDER_SWEEP_START_MS') + constant('SPIDER_SWEEP_MS') + constant('SPIDER_POP_MS');
	assert.ok(CLOCK_SETTLE_MS >= spiderIntro, `a shot would catch the spider chart's intro (${spiderIntro} ms) unfinished`);
	assert.ok(CLOCK_SETTLE_MS >= constant('TRANSITION_MS') + constant('TOAST_MS'), 'a shot would catch a slide or the look toast');
	assert.ok(CLOCK_SETTLE_MS < constant('BARS_RELOAD_MS'), 'a shot would catch the score bars emptying for a reload');
});

test('clock.worker.js takes clock messages for itself and passes everything else on', async () => {
	const source = fs.readFileSync(path.join(__dirname, '..', 'clock.worker.js'), 'utf8');
	const order = [];
	const listeners = [];
	const self = { addEventListener: (type, fn) => { order.push(`listen:${type}`); listeners.push(fn); } };
	const run = new Function('self', 'importModule', `return (async () => { ${source.replace(/await import\(/, 'await importModule(')} })();`);
	await run(self, async (url) => { order.push(`import:${url}`); });
	assert.deepEqual(order, ['listen:message', 'import:/simulator/micropython.worker.js']);
	assert.equal(self.emuClockTarget, 0);
	const deliver = (data) => {
		let stopped = false;
		listeners[0]({ data, stopImmediatePropagation: () => { stopped = true; } });
		return stopped;
	};
	assert.equal(deliver({ clockTarget: 3500 }), true);
	assert.equal(self.emuClockTarget, 3500);
	assert.equal(deliver({ buttons: 8 }), false, 'button messages must still reach the simulator');
	assert.equal(deliver({ clockTarget: '9' }), false);
	assert.equal(self.emuClockTarget, 3500);
});

test('mergeReports replaces earlier badge entries and keeps the webview ones', () => {
	const existing = {
		threshold: 0.02,
		summary: {},
		comparisons: [
			{ view: 'usage', theme: 'dark', status: 'changed' },
			{ view: 'badge-fluency', state: 'old', theme: 'dark', status: 'changed' },
		],
	};
	const badge = { generatedAt: 'now', threshold: 0.02, comparisons: [{ view: 'badge-fluency', state: '1-score', theme: 'dark', status: 'added' }] };
	const merged = mergeReports(existing, badge);
	assert.deepEqual(merged.comparisons.map((c) => `${c.view}/${c.state || ''}`), ['usage/', 'badge-fluency/1-score']);
	assert.deepEqual(merged.summary, { changed: 1, unchanged: 0, added: 1, removed: 0 });
	assert.equal(mergeReports(null, badge).comparisons.length, 1);
});
