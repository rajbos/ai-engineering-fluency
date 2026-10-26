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
	const l = lookup('win32', ['E:\\'], 'e\r\n');
	assert.equal(await findBadgeDrive(l), 'E:\\');
	assert.equal(l.calls[0].command, 'powershell.exe');
	assert.match(l.calls[0].args.join(' '), /-FileSystemLabel 'BADGER'/);
});

test('findBadgeDrive: Windows ignores output that is not a single drive letter', async () => {
	const l = lookup('win32', ['C:\\', 'rm:\\'], 'rm\n\nC:\\Windows\n');
	assert.equal(await findBadgeDrive(l), undefined);
});

test('findBadgeDrive: macOS uses /Volumes/BADGER without running anything', async () => {
	const l = lookup('darwin', ['/Volumes/BADGER']);
	assert.equal(await findBadgeDrive(l), '/Volumes/BADGER');
	assert.equal(l.calls.length, 0);
});

test('findBadgeDrive: Linux checks the per-user and system mount points', async () => {
	assert.equal(await findBadgeDrive(lookup('linux', ['/run/media/rob/BADGER'])), '/run/media/rob/BADGER');
	assert.equal(await findBadgeDrive(lookup('linux', ['/mnt/BADGER'])), '/mnt/BADGER');
	assert.equal(await findBadgeDrive(lookup('linux', [])), undefined);
});

function makeApp(): { source: string; drive: string } {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'badge-install-test-'));
	const source = path.join(root, 'fluency');
	fs.mkdirSync(path.join(source, 'assets'), { recursive: true });
	fs.writeFileSync(path.join(source, '__init__.py'), 'print("app")');
	fs.writeFileSync(path.join(source, 'assets', 'qr.png'), 'png');
	const drive = path.join(root, 'BADGER');
	fs.mkdirSync(drive);
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

test('installBadgeApp: a copy that cannot be written is a failure, not a throw', async () => {
	const { source, drive } = makeApp();
	const blocker = path.join(drive, 'file-not-folder');
	fs.writeFileSync(blocker, 'x');
	const outcome = await installBadgeApp({ ...lookup('linux', [source]), sourceDir: source, findDrive: async () => blocker });
	assert.equal(outcome.status, 'failed');
});
