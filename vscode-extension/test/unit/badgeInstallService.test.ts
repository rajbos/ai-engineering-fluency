import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { findBadgeDrive, installBadgeApp } from '../../src/badge/badgeInstallService';
import type { CommandResult, CommandRunner } from '../../src/badge/badgeSyncService';

const ok = (stdout: string): CommandResult => ({ code: 0, stdout, stderr: '' });

function lookup(platform: NodeJS.Platform, existing: string[], stdout = '') {
	const calls: Array<{ command: string; args: string[] }> = [];
	const run: CommandRunner = async (command, args) => { calls.push({ command, args }); return ok(stdout); };
	return { calls, platform, run, userName: 'rob', exists: (candidate: string) => existing.includes(candidate) };
}

test('findBadgeDrive: Windows asks for the drive letter of the BADGER volume and checks it exists', async () => {
	const l = lookup('win32', ['E:\\', 'E:\\apps'], 'e\r\n');
	assert.equal(await findBadgeDrive(l), 'E:\\');
	assert.equal(l.calls[0].command, 'pwsh', 'PowerShell 7 is tried first');
	assert.equal(l.calls.length, 1);
	assert.match(l.calls[0].args.join(' '), /-FileSystemLabel 'BADGER'/);
});

test('findBadgeDrive: Windows ignores output that is not a single drive letter', async () => {
	const l = lookup('win32', ['C:\\', 'rm:\\'], 'rm\n\nC:\\Windows\n');
	assert.equal(await findBadgeDrive(l), undefined);
});

test('findBadgeDrive: macOS uses /Volumes/BADGER without running anything', async () => {
	const l = lookup('darwin', ['/Volumes/BADGER', '/Volumes/BADGER/apps']);
	assert.equal(await findBadgeDrive(l), '/Volumes/BADGER');
	assert.equal(l.calls.length, 0);
});

test('findBadgeDrive: Linux checks the per-user and system mount points', async () => {
	assert.equal(await findBadgeDrive(lookup('linux', ['/run/media/rob/BADGER', '/run/media/rob/BADGER/apps'])), '/run/media/rob/BADGER');
	assert.equal(await findBadgeDrive(lookup('linux', ['/mnt/BADGER', '/mnt/BADGER/apps'])), '/mnt/BADGER');
	assert.equal(await findBadgeDrive(lookup('linux', [])), undefined);
});

test('findBadgeDrive: a BADGER-labelled volume without an apps folder is not a badge', async () => {
	assert.equal(await findBadgeDrive(lookup('darwin', ['/Volumes/BADGER'])), undefined);
	assert.equal(await findBadgeDrive(lookup('win32', ['E:\\'], 'e')), undefined);
	// The first match without the marker is skipped in favour of a later one that has it.
	assert.equal(await findBadgeDrive(lookup('linux', ['/media/rob/BADGER', '/mnt/BADGER', '/mnt/BADGER/apps'])), '/mnt/BADGER');
});

test('findBadgeDrive: Windows falls back from pwsh to powershell.exe to bash when a shell is not installed', async () => {
	const tried: string[] = [];
	const onlyBash: CommandRunner = async (command) => {
		tried.push(command);
		return command === 'bash' ? { code: 0, stdout: 'e\n', stderr: '' } : { code: -1, stdout: '', stderr: '', spawnError: 'ENOENT' };
	};
	const drive = await findBadgeDrive({ platform: 'win32', run: onlyBash, userName: 'rob', exists: (c) => c === 'E:\\' || c === 'E:\\apps' });
	assert.equal(drive, 'E:\\');
	assert.deepEqual(tried, ['pwsh', 'powershell.exe', 'bash']);
});

test('findBadgeDrive: Windows stops at the first shell that ran, even when it found no BADGER volume', async () => {
	const tried: string[] = [];
	const run: CommandRunner = async (command) => { tried.push(command); return { code: 0, stdout: '', stderr: '' }; };
	assert.equal(await findBadgeDrive({ platform: 'win32', run, userName: 'rob', exists: () => true }), undefined);
	assert.deepEqual(tried, ['pwsh']);
});

test('findBadgeDrive: Windows tries the next shell when one fails, and the bash lookup only uses the fixed label', async () => {
	const calls: Array<{ command: string; args: string[] }> = [];
	const run: CommandRunner = async (command, args) => {
		calls.push({ command, args });
		return command === 'powershell.exe' ? { code: 0, stdout: 'F', stderr: '' } : { code: 1, stdout: '', stderr: 'nope' };
	};
	assert.equal(await findBadgeDrive({ platform: 'win32', run, userName: 'rob', exists: () => true }), 'F:\\');
	const bashRun: CommandRunner = async (command, args) => { calls.push({ command, args }); return { code: command === 'bash' ? 0 : -1, stdout: '', stderr: '', spawnError: command === 'bash' ? undefined : 'ENOENT' }; };
	await findBadgeDrive({ platform: 'win32', run: bashRun, userName: 'rob', exists: () => true });
	const bash = calls.find((c) => c.command === 'bash');
	assert.equal(bash?.args[0], '-c');
	assert.match(bash?.args[1] ?? '', /vol \$l:.*is BADGER\$/);
});

test('findBadgeDrive: Windows without any shell, a failed lookup or a throwing runner reports no drive', async () => {
	const missing: CommandRunner = async () => ({ code: -1, stdout: '', stderr: '', spawnError: 'ENOENT' });
	const failed: CommandRunner = async () => ({ code: 1, stdout: 'e', stderr: 'boom' });
	const throwing: CommandRunner = async () => { throw new Error('spawn blew up'); };
	for (const run of [missing, failed, throwing]) {
		assert.equal(await findBadgeDrive({ platform: 'win32', run, userName: 'rob', exists: () => true }), undefined);
	}
});

function makeApp(): { source: string; drive: string } {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'badge-install-test-'));
	const source = path.join(root, 'fluency');
	fs.mkdirSync(path.join(source, 'assets'), { recursive: true });
	fs.writeFileSync(path.join(source, '__init__.py'), 'print("app")');
	fs.writeFileSync(path.join(source, 'assets', 'qr.png'), 'png');
	const drive = path.join(root, 'BADGER');
	fs.mkdirSync(path.join(drive, 'apps'), { recursive: true });
	return { source, drive };
}

test('installBadgeApp: copies the app to <drive>/apps/fluency and replaces a stale copy', async () => {
	const { source, drive } = makeApp();
	fs.mkdirSync(path.join(drive, 'apps', 'fluency'), { recursive: true });
	fs.writeFileSync(path.join(drive, 'apps', 'fluency', 'old.py'), 'stale');

	const outcome = await installBadgeApp({ ...lookup('linux', [source]), sourceDir: source, findDrive: async () => drive });

	const target = path.join(drive, 'apps', 'fluency');
	assert.deepEqual(outcome, { status: 'copied', target });
	assert.equal(fs.readFileSync(path.join(target, '__init__.py'), 'utf8'), 'print("app")');
	assert.equal(fs.readFileSync(path.join(target, 'assets', 'qr.png'), 'utf8'), 'png');
	assert.equal(fs.existsSync(path.join(target, 'old.py')), false, 'files from the previous copy are removed');
	assert.ok(fs.existsSync(source), 'the bundled source is left alone');
});

test('installBadgeApp: leaves other apps on the badge alone', async () => {
	const { source, drive } = makeApp();
	fs.mkdirSync(path.join(drive, 'apps', 'other'), { recursive: true });
	fs.writeFileSync(path.join(drive, 'apps', 'other', 'main.py'), 'x');
	await installBadgeApp({ ...lookup('linux', [source]), sourceDir: source, findDrive: async () => drive });
	assert.equal(fs.readFileSync(path.join(drive, 'apps', 'other', 'main.py'), 'utf8'), 'x');
});

test('installBadgeApp: reports no drive when none is mounted, and a missing bundled app first', async () => {
	const { source } = makeApp();
	assert.deepEqual(await installBadgeApp({ ...lookup('linux', [source]), sourceDir: source }), { status: 'noDrive' });
	assert.deepEqual(await installBadgeApp({ ...lookup('linux', []), sourceDir: source, findDrive: async () => '/never' }), { status: 'sourceMissing' });
});

test('installBadgeApp: refuses to delete anything on a volume without an apps folder', async () => {
	const { source, drive } = makeApp();
	fs.rmSync(path.join(drive, 'apps'), { recursive: true });
	const other = path.join(drive, 'unrelated');
	fs.mkdirSync(path.join(other, 'fluency'), { recursive: true });
	fs.writeFileSync(path.join(other, 'fluency', 'keep.txt'), 'x');
	// An `apps` *file* is not the badge's folder either.
	const fileMarker = path.join(path.dirname(drive), 'NOTBADGER');
	fs.mkdirSync(fileMarker);
	fs.writeFileSync(path.join(fileMarker, 'apps'), 'x');

	for (const root of [drive, fileMarker, path.join(drive, 'missing')]) {
		const outcome = await installBadgeApp({ ...lookup('linux', [source]), sourceDir: source, findDrive: async () => root });
		assert.deepEqual(outcome, { status: 'noDrive' });
	}
	assert.equal(fs.readFileSync(path.join(other, 'fluency', 'keep.txt'), 'utf8'), 'x');
	assert.equal(fs.existsSync(path.join(drive, 'apps')), false, 'no apps folder is created on a non-badge volume');
});

test('installBadgeApp: a copy that cannot be made is a failure, not a throw', async () => {
	const { drive } = makeApp();
	const missingSource = path.join(drive, 'no-such-source');
	const outcome = await installBadgeApp({ ...lookup('linux', [missingSource]), sourceDir: missingSource, findDrive: async () => drive });
	assert.equal(outcome.status, 'failed');
});
