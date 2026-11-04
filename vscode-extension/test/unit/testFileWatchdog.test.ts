import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import * as cp from 'node:child_process';

// Runs a fixture the way every real test run does: through the `node --test`
// runner, with the shim `--require`d and a per-file child process under the
// watchdog. The result is the runner's verdict on that file.
const SHIM_PATH = path.join(__dirname, 'vscode-shim-register.js');

function runFixture(source: string, limitMs: number): { status: number | null; output: string } {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'watchdog-'));
	try {
		const fixturePath = path.join(dir, 'fixture.test.js');
		fs.writeFileSync(fixturePath, source);
		const env: NodeJS.ProcessEnv = { ...process.env, TEST_FILE_WATCHDOG_MS: String(limitMs) };
		// This test is itself a runner child; the fixture's runner must not think so.
		delete env.NODE_TEST_CONTEXT;
		const result = cp.spawnSync(
			process.execPath,
			['--require', SHIM_PATH, '--test', '--test-reporter=spec', fixturePath],
			{ encoding: 'utf8', env, timeout: 60_000 },
		);
		return { status: result.status, output: `${result.stdout}\n${result.stderr}` };
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
}

const LEAKED_HANDLE = 'setInterval(() => {}, 1000);';

test('a file still running its tests at the limit fails and names the watchdog', () => {
	const { status, output } = runFixture(`
		const test = require('node:test');
		test('started', async () => { await new Promise((resolve) => setTimeout(resolve, 30000)); });
		test('never reached', () => {});
	`, 2_000);

	assert.notEqual(status, 0, output);
	assert.match(output, /did not finish its tests within 2000 ms/);
	assert.doesNotMatch(output, /never reached/);
});

test('a file that finished its tests but leaked a handle is stopped at the limit and passes', () => {
	const { status, output } = runFixture(`
		const test = require('node:test');
		test('finishes', () => {});
		${LEAKED_HANDLE}
	`, 5_000);

	assert.equal(status, 0, output);
	assert.doesNotMatch(output, /did not finish its tests/);
});

test('a finished file with a failing test still fails when a leaked handle holds it open', () => {
	const { status, output } = runFixture(`
		const test = require('node:test');
		test('fails', () => { throw new Error('expected failure'); });
		${LEAKED_HANDLE}
	`, 5_000);

	assert.notEqual(status, 0, output);
	assert.match(output, /expected failure/);
	assert.doesNotMatch(output, /did not finish its tests/);
});
