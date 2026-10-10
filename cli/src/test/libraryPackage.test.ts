/**
 * Smoke test for the published shape of `@rajbos/ai-engineering-fluency/session`: loads the
 * built dist/ through the package's own `exports` map (Node resolves a package's own name
 * from inside it), exactly as a consumer's `require()` / `import` would. `npm test` builds
 * dist/ first; esbuild.tests.js keeps the specifier external so it is not bundled here.
 */
import test, { after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PKG = '@rajbos/ai-engineering-fluency/session';
const CLI_ROOT = path.resolve(__dirname, '..', '..');

// Not under os.tmpdir(): the shared safe file reader refuses to read session files there.
const fakeHome = fs.mkdtempSync(path.join(CLI_ROOT, 'out', 'pkg-home-'));
process.env.HOME = fakeHome;
process.env.USERPROFILE = fakeHome;
after(() => fs.rmSync(fakeHome, { recursive: true, force: true }));
const FIXTURES = path.join(CLI_ROOT, 'src', 'test', 'fixtures');

function placeCopilotCliFixture(): string {
	const target = path.join(fakeHome, '.copilot', 'session-state', '44444444-4444-4444-8444-444444444444', 'events.jsonl');
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.copyFileSync(path.join(FIXTURES, 'copilot-cli-events.jsonl'), target);
	return target;
}

test('require() of the package subpath loads the built CommonJS library', async () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const lib = require(PKG);
	assert.equal(require.resolve(PKG), path.join(CLI_ROOT, 'dist', 'lib', 'session.js'));
	assert.equal(typeof lib.analyzeSessionFile, 'function');
	assert.equal(typeof lib.analyzeSessionFiles, 'function');

	const usage = await lib.analyzeSessionFile(placeCopilotCliFixture());
	assert.equal(usage.copilotNanoAiu, 3_750_000_000);
	assert.equal(usage.copilotCredits, 3.75);
	assert.equal(await lib.analyzeSessionFile(path.join(fakeHome, 'missing.jsonl')), null);
});

test('import() of the package subpath shares the CommonJS module instance', async () => {
	const esm = await import(PKG);
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const cjs = require(PKG);
	assert.equal(esm.analyzeSessionFile, cjs.analyzeSessionFile);
});

test('exports map points at files that exist, with self-contained types', () => {
	const pkg = JSON.parse(fs.readFileSync(path.join(CLI_ROOT, 'package.json'), 'utf-8'));
	assert.equal(pkg.bin['ai-engineering-fluency'], 'dist/cli.js');
	const entry = pkg.exports['./session'];
	for (const target of [entry.import.types, entry.import.default, entry.require.types, entry.require.default]) {
		assert.ok(fs.existsSync(path.join(CLI_ROOT, target)), `${target} is missing from dist/`);
	}
	assert.ok(fs.existsSync(path.join(CLI_ROOT, 'dist', 'lib', 'sql-wasm.wasm')), 'library needs its own sql-wasm.wasm');

	const dts = fs.readFileSync(path.join(CLI_ROOT, entry.require.types), 'utf-8');
	assert.doesNotMatch(dts, /\bfrom\s+['"]|\bimport\s*\(/, 'session.d.ts must not import other modules');
	for (const name of ['SessionUsage', 'AnalyzeSessionOptions', 'analyzeSessionFile', 'analyzeSessionFiles']) {
		assert.match(dts, new RegExp(`\\b${name}\\b`));
	}
});

test('the library bundle carries no CLI code or console output', () => {
	const bundle = fs.readFileSync(path.join(CLI_ROOT, 'dist', 'lib', 'session.js'), 'utf-8');
	assert.doesNotMatch(bundle, /^#!/, 'no CLI shebang');
	assert.doesNotMatch(bundle, /node_modules\/(chalk|commander)\//, 'no chalk/commander');
	// Shared code's console calls are rerouted to a no-op object at bundle time. Comment lines
	// are skipped: a doc comment may mention console.error() without calling it.
	const code = bundle.split('\n').filter(line => !/^\s*(\/\/|\/?\*)/.test(line)).join('\n');
	assert.doesNotMatch(code, /\bconsole\.(log|info|warn|error|debug)\(/);
	assert.doesNotMatch(code, /process\.exit\(/);
});

test('the library writes nothing to the console, even for files it cannot read', async () => {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const lib = require(PKG);
	const methods = ['log', 'info', 'warn', 'error', 'debug'] as const;
	const calls: string[] = [];
	const originals = methods.map(m => console[m]);
	methods.forEach(m => { console[m] = (...args: unknown[]) => { calls.push(`${m}: ${args.join(' ')}`); }; });
	try {
		const garbage = path.join(fakeHome, '.claude', 'projects', '-x', 'not-a-session.jsonl');
		fs.mkdirSync(path.dirname(garbage), { recursive: true });
		fs.writeFileSync(garbage, '{not json\n\u0000\u0001');
		await lib.analyzeSessionFile(garbage);
		await lib.analyzeSessionFile(path.join(fakeHome, 'missing.jsonl'));
		await lib.analyzeSessionFiles([fakeHome, garbage]);
	} finally {
		methods.forEach((m, i) => { console[m] = originals[i]; });
	}
	assert.deepEqual(calls, []);
});
