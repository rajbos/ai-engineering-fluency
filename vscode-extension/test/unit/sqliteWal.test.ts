import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
	MAX_WAL_MERGE_DB_SIZE_BYTES,
	isWalWriterActive,
	tryReadDbWithWal,
	sweepStaleWalTempFiles,
	walMergeCacheSizeForTests,
} from '../../../src/utils/sqliteWal';

/**
 * Creates a real WAL-mode sqlite fixture using node:sqlite directly (Node 22+, same runtime the
 * extension ships on). Returns the still-open writer connection so callers can insert rows that
 * stay pending in the `-wal` file.
 */
function createWalFixture() {
	const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-fixture-'));
	const dbPath = path.join(tmpDir, 'test.db');
	const writer = new DatabaseSync(dbPath);
	writer.exec('PRAGMA journal_mode=WAL;');
	writer.exec('CREATE TABLE t (v TEXT);');
	writer.exec("INSERT INTO t VALUES ('seed')");
	return {
		tmpDir,
		dbPath,
		writer,
		cleanup: () => {
			try { writer.close(); } catch { /* ignore */ }
			fs.rmSync(tmpDir, { recursive: true, force: true });
		},
	};
}

test('tryReadDbWithWal refuses to copy a database above the size cap, returning null', async () => {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-oversized-'));
	const dbPath = path.join(tmpDir, 'huge.db');
	const walPath = dbPath + '-wal';
	try {
		// A sparse file reports the requested size via fs.stat without writing real bytes to disk.
		const fd = fs.openSync(dbPath, 'w');
		fs.ftruncateSync(fd, MAX_WAL_MERGE_DB_SIZE_BYTES + 1024);
		fs.closeSync(fd);
		fs.writeFileSync(walPath, 'not empty so the WAL-present check passes');

		const result = await tryReadDbWithWal(dbPath);

		assert.equal(result, null, 'a db above MAX_WAL_MERGE_DB_SIZE_BYTES must never be copied');
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('tryReadDbWithWal throttles repeated merge attempts for the same db path', async () => {
	const fixture = createWalFixture();
	try {
		const first = await tryReadDbWithWal(fixture.dbPath);
		assert.ok(first, 'first call should merge and return a buffer');

		// Keep changing the WAL so a naive implementation would see "new work" every time.
		fixture.writer.exec("INSERT INTO t VALUES ('more-1')");
		const second = await tryReadDbWithWal(fixture.dbPath);
		fixture.writer.exec("INSERT INTO t VALUES ('more-2')");
		const third = await tryReadDbWithWal(fixture.dbPath);

		// Within the throttle window, the cached buffer is served — no new merge is attempted,
		// so all three calls return the exact same Buffer instance.
		assert.equal(second, first, 'second call within the throttle window must reuse the cached result');
		assert.equal(third, first, 'third call within the throttle window must reuse the cached result');
	} finally {
		fixture.cleanup();
	}
});

test('isWalWriterActive: shm present and wal touched recently => active', () => {
	const fixture = createWalFixture();
	try {
		fixture.writer.exec("INSERT INTO t VALUES ('touch')");
		assert.ok(fs.existsSync(fixture.dbPath + '-shm'), 'fixture setup: -shm should exist while the writer is open');

		assert.equal(isWalWriterActive(fixture.dbPath), true);
	} finally {
		fixture.cleanup();
	}
});

test('isWalWriterActive: no shm file => not active', () => {
	const fixture = createWalFixture();
	try {
		fs.unlinkSync(fixture.dbPath + '-shm');

		assert.equal(isWalWriterActive(fixture.dbPath), false);
	} finally {
		fixture.cleanup();
	}
});

test('isWalWriterActive: shm present but wal mtime is old => not active', () => {
	const fixture = createWalFixture();
	try {
		const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
		fs.utimesSync(fixture.dbPath + '-wal', oldDate, oldDate);

		assert.equal(isWalWriterActive(fixture.dbPath), false);
	} finally {
		fixture.cleanup();
	}
});

test('isWalWriterActive: no -wal file at all => not active', () => {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-nowal-'));
	try {
		const dbPath = path.join(tmpDir, 'plain.db');
		fs.writeFileSync(dbPath, 'not wal mode');
		assert.equal(isWalWriterActive(dbPath), false);
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('sweepStaleWalTempFiles removes old matching files and leaves recent or non-matching files alone', async () => {
	const dirA = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-sweep-a-'));
	const dirB = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-sweep-b-'));
	try {
		const oldDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago

		const oldCursorFile = path.join(dirA, 'cursor-wal-12345-old.db');
		fs.writeFileSync(oldCursorFile, 'old');
		fs.utimesSync(oldCursorFile, oldDate, oldDate);

		const oldSqliteFile = path.join(dirB, 'sqlite-wal-state.vscdb-99-old.db-wal');
		fs.writeFileSync(oldSqliteFile, 'old');
		fs.utimesSync(oldSqliteFile, oldDate, oldDate);

		const recentMatchingFile = path.join(dirA, 'cursor-wal-99999-recent.db');
		fs.writeFileSync(recentMatchingFile, 'recent');

		const nonMatchingOldFile = path.join(dirA, 'some-other-file.db');
		fs.writeFileSync(nonMatchingOldFile, 'unrelated');
		fs.utimesSync(nonMatchingOldFile, oldDate, oldDate);

		const removed = await sweepStaleWalTempFiles(60 * 60 * 1000, [dirA, dirB]);

		assert.equal(removed, 2, 'exactly the two old, prefix-matching files should be removed');
		assert.equal(fs.existsSync(oldCursorFile), false, 'old cursor-wal- file should be gone');
		assert.equal(fs.existsSync(oldSqliteFile), false, 'old sqlite-wal- file should be gone');
		assert.equal(fs.existsSync(recentMatchingFile), true, 'recent matching file should be left alone');
		assert.equal(fs.existsSync(nonMatchingOldFile), true, 'old but non-matching file should be left alone');
	} finally {
		fs.rmSync(dirA, { recursive: true, force: true });
		fs.rmSync(dirB, { recursive: true, force: true });
	}
});

test('sweepStaleWalTempFiles tolerates a missing directory', async () => {
	const missingDir = path.join(os.tmpdir(), `sqlitewal-missing-${Date.now()}-${Math.random().toString(16).slice(2)}`);
	const removed = await sweepStaleWalTempFiles(60 * 60 * 1000, [missingDir]);
	assert.equal(removed, 0);
});


test('tryReadDbWithWal evicts merged buffers once they are past the retention window', async () => {
	const fixture = createWalFixture();
	const realNow = Date.now;
	try {
		const first = await tryReadDbWithWal(fixture.dbPath);
		assert.ok(first, 'first call should merge and return a buffer');
		assert.ok(walMergeCacheSizeForTests() > 0, 'the merged buffer should be cached initially');

		// Jump past the retention window (the longest throttle interval) so the cached buffer
		// can never be served again — it must be dropped rather than retained for the life of
		// the process, since each one can be up to MAX_WAL_MERGE_DB_SIZE_BYTES.
		const shifted = realNow() + 6 * 60_000;
		Date.now = () => shifted;

		const second = await tryReadDbWithWal(fixture.dbPath);
		assert.notEqual(second, first, 'past the retention window a fresh merge must run, not the cached buffer');
	} finally {
		Date.now = realNow;
		fixture.cleanup();
	}
});
