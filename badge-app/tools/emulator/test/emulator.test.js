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
const { appFiles, crashIn, program } = require('../emulator');
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
