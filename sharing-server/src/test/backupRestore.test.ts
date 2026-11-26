/**
 * Backup/restore fail-safe: a backup that exists but cannot be restored must never be
 * overwritten by the (empty) database the server then starts with.
 *
 * Uses temporary directories via LOCAL_DATA_DIR (live database) and DATA_DIR (backup);
 * never the user's or production data.
 */
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync, readFileSync, existsSync, statSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let root: string;
let liveDir: string;
let backupDir: string;
const saved = { LOCAL_DATA_DIR: process.env.LOCAL_DATA_DIR, DATA_DIR: process.env.DATA_DIR };

before(() => {
	root = mkdtempSync(join(tmpdir(), 'backup-restore-test-'));
});

after(async () => {
	const { closeDb } = await import('../db.js');
	closeDb();
	for (const [k, v] of Object.entries(saved)) {
		if (v === undefined) { delete process.env[k]; } else { process.env[k] = v; }
	}
	rmSync(root, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
});

let caseNo = 0;
beforeEach(async () => {
	const { closeDb } = await import('../db.js');
	closeDb();
	caseNo++;
	liveDir = join(root, `live-${caseNo}`);
	backupDir = join(root, `backup-${caseNo}`);
	mkdirSync(backupDir, { recursive: true });
	process.env.LOCAL_DATA_DIR = liveDir;
	process.env.DATA_DIR = backupDir;
});

describe('restoreFromBackup / backupToAzureFiles', () => {
	test('a backup that cannot be restored blocks every later backup, so it is not overwritten', async () => {
		const { restoreFromBackup, backupToAzureFiles, isBackupOverwriteBlocked, getDb } = await import('../db.js');
		// The backup "file" is a directory: it exists, but copying it fails (EISDIR/EPERM),
		// standing in for a locked or unreadable Azure Files backup.
		const backupPath = join(backupDir, 'sharing.db');
		mkdirSync(backupPath);
		writeFileSync(join(backupPath, 'marker'), 'good backup');

		assert.equal(restoreFromBackup(), false);
		assert.equal(isBackupOverwriteBlocked(), true);

		getDb(); // the server starts on an empty local database
		assert.ok(existsSync(join(liveDir, 'sharing.db')));

		// The failure was transient (e.g. the previous replica held the file): the backup is a
		// good, writable file again by the time the periodic or shutdown backup runs.
		rmSync(backupPath, { recursive: true, force: true });
		writeFileSync(backupPath, 'good backup');
		backupToAzureFiles();

		assert.equal(readFileSync(backupPath, 'utf8'), 'good backup', 'the good backup was overwritten by the empty database');
	});

	test('a successful restore allows backups again', async () => {
		const { restoreFromBackup, backupToAzureFiles, isBackupOverwriteBlocked, getDb, closeDb } = await import('../db.js');
		// Produce a real database file to act as the backup.
		getDb();
		closeDb();
		const backupPath = join(backupDir, 'sharing.db');
		writeFileSync(backupPath, readFileSync(join(liveDir, 'sharing.db')));
		rmSync(liveDir, { recursive: true, force: true });

		assert.equal(restoreFromBackup(), true);
		assert.equal(isBackupOverwriteBlocked(), false);
		assert.ok(existsSync(join(liveDir, 'sharing.db')));

		getDb().exec("INSERT INTO users (github_id, github_login) VALUES (424242, 'backup-probe')");
		backupToAzureFiles();
		assert.ok(statSync(backupPath).size > 0);
	});

	test('no backup at all (first deploy) is not a failure and does not block backups', async () => {
		const { restoreFromBackup, backupToAzureFiles, isBackupOverwriteBlocked, getDb } = await import('../db.js');
		assert.equal(restoreFromBackup(), true);
		assert.equal(isBackupOverwriteBlocked(), false);
		getDb();
		backupToAzureFiles();
		assert.ok(existsSync(join(backupDir, 'sharing.db')));
	});

	test('restoreFromBackupWithRetry retries, then gives up with backups blocked', async () => {
		const { restoreFromBackupWithRetry } = await import('../lifecycle.js');
		const { isBackupOverwriteBlocked } = await import('../db.js');
		mkdirSync(join(backupDir, 'sharing.db'));
		assert.equal(await restoreFromBackupWithRetry(3, 1), false);
		assert.equal(isBackupOverwriteBlocked(), true);
	});
});
