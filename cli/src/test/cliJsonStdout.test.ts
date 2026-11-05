/**
 * `--json` stdout is parsed as one document by the Visual Studio and JetBrains CLI bridges (and
 * promised in docs/cli/README.md), so diagnostics must not land on it. In Node console.debug and
 * console.info write to stdout, and the shared src/ modules log through console.debug when they
 * skip an oversized file. These tests run the built dist/cli.js (`npm test` builds it first)
 * against a fake home holding only a sparse, over-the-cap session file.
 */
import test, { after } from 'node:test';
import * as assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { promisify } from 'node:util';
import { MAX_SESSION_FILE_BYTES } from '../../../src/utils/safeFileRead';

const execFileAsync = promisify(execFile);
const CLI_ROOT = path.resolve(__dirname, '..', '..');
const CLI_PATH = path.join(CLI_ROOT, 'dist', 'cli.js');
const SKIP_MESSAGE = '[processSessionFile] Skipping oversized file';

// Not under os.tmpdir(): the shared safe file reader refuses to read session files there.
const fakeHome = fs.mkdtempSync(path.join(CLI_ROOT, 'out', 'json-stdout-home-'));
after(() => fs.rmSync(fakeHome, { recursive: true, force: true }));

// .vscode-server is discovered on every platform. truncate keeps the file sparse.
const oversizedFile = path.join(fakeHome, '.vscode-server', 'data', 'User', 'workspaceStorage', 'hash', 'chatSessions', 'oversized.jsonl');
fs.mkdirSync(path.dirname(oversizedFile), { recursive: true });
fs.closeSync(fs.openSync(oversizedFile, 'w'));
fs.truncateSync(oversizedFile, MAX_SESSION_FILE_BYTES + 1);

/** Only what Node needs, plus the fake home, so a run can never see the machine's real sessions. */
const childEnv: NodeJS.ProcessEnv = {
	HOME: fakeHome,
	USERPROFILE: fakeHome,
	APPDATA: path.join(fakeHome, 'AppData', 'Roaming'),
	LOCALAPPDATA: path.join(fakeHome, 'AppData', 'Local'),
	XDG_CONFIG_HOME: path.join(fakeHome, '.config'),
	XDG_DATA_HOME: path.join(fakeHome, '.local', 'share'),
	...(process.env.SystemRoot ? { SystemRoot: process.env.SystemRoot } : {}),
	...(process.env.PATH ? { PATH: process.env.PATH } : {}),
};

function runCli(args: string[]): Promise<{ stdout: string; stderr: string }> {
	return execFileAsync(process.execPath, [CLI_PATH, ...args], { cwd: fakeHome, env: childEnv, maxBuffer: 64 * 1024 * 1024 });
}

// Every command that takes --json and parses session files.
for (const command of ['all', 'chart', 'curation', 'diagnostics', 'fluency', 'segment', 'skill-suggestions', 'stats', 'usage', 'usage-analysis']) {
	test(`${command} --json leaves stdout parseable when an oversized session file is skipped`, async () => {
		const { stdout, stderr } = await runCli([command, '--json']);
		assert.doesNotThrow(() => JSON.parse(stdout), `stdout is not JSON: ${stdout.slice(0, 200)}`);
		assert.ok(stderr.includes(SKIP_MESSAGE), `the skip should still be reported on stderr, got: ${stderr.slice(0, 200)}`);
	});
}

test('the skip message stays off stdout in human-readable output too', async () => {
	const { stdout, stderr } = await runCli(['usage']);
	assert.ok(!stdout.includes(SKIP_MESSAGE));
	assert.ok(stderr.includes(SKIP_MESSAGE));
});
