import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
	MAX_WAL_MERGE_DB_SIZE_BYTES,
	isWalWriterActive,
	tryReadDbWithWal,
	tryReadDbWithWalFingerprint,
	sweepStaleWalTempFiles,
	walMergeCacheSizeForTests,
	walMergeCacheHasEntryForTests,
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
	// Built from plain files rather than by deleting a live connection's -shm: SQLite holds that
	// file open, and while POSIX happily unlinks an open file, Windows either refuses the delete
	// or leaves it pending until the handle closes — so existsSync still sees it and the check
	// reports "active". That made this test pass on Linux/macOS and fail intermittently on
	// Windows. No live handle, no race, and the scenario under test is unchanged.
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-noshm-'));
	try {
		const dbPath = path.join(tmpDir, 'test.db');
		fs.writeFileSync(dbPath, 'db');
		fs.writeFileSync(dbPath + '-wal', 'recent wal frames'); // recent mtime, so only the missing -shm decides
		assert.equal(fs.existsSync(dbPath + '-shm'), false, 'fixture setup: no -shm should exist');

		assert.equal(isWalWriterActive(dbPath), false);
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('isWalWriterActive: shm present but wal mtime is old => not active', () => {
	// Plain files for the same reason as the test above: back-dating the -wal of a live writer
	// races SQLite, which can touch the file again at any point.
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-oldwal-'));
	try {
		const dbPath = path.join(tmpDir, 'test.db');
		fs.writeFileSync(dbPath, 'db');
		fs.writeFileSync(dbPath + '-wal', 'stale wal frames');
		fs.writeFileSync(dbPath + '-shm', 'shm'); // present, so only the stale -wal mtime decides
		const oldDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
		fs.utimesSync(dbPath + '-wal', oldDate, oldDate);

		assert.equal(isWalWriterActive(dbPath), false);
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
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

test('tryReadDbWithWalFingerprint reports the ORIGINAL fingerprint for a throttled buffer, not the current (changed) WAL state', async () => {
	// This is the root-cause regression test for the "throttle can hide data forever" bug: a
	// caller that stamps its own cache with a freshly-read WAL mtime after being served a stale,
	// throttled buffer ends up with a cache entry that claims to be newer than the data actually
	// is. If the writer then stops, that wrong fingerprint never gets invalidated again.
	const fixture = createWalFixture();
	try {
		const first = await tryReadDbWithWalFingerprint(fixture.dbPath);
		assert.ok(first, 'first call should merge and return a result');

		fixture.writer.exec("INSERT INTO t VALUES ('more')"); // live WAL state moves on
		const liveWal = fs.statSync(fixture.dbPath + '-wal');
		assert.ok(
			liveWal.mtimeMs !== first.walMtimeMs || liveWal.size !== first.walSize,
			'fixture setup: the live WAL must have changed since the first merge'
		);

		const second = await tryReadDbWithWalFingerprint(fixture.dbPath); // inside the throttle window
		assert.equal(second?.buffer, first.buffer, 'sanity: served from the throttle cache');
		assert.equal(
			second?.walMtimeMs, first.walMtimeMs,
			'a throttled (stale) buffer must report the fingerprint it was actually produced from — not a fresh stat of the live WAL, which would claim newer data than the served bytes actually contain'
		);
		assert.equal(second?.walSize, first.walSize);
		assert.equal(second?.dbMtimeMs, first.dbMtimeMs);
		assert.equal(second?.dbSize, first.dbSize);
	} finally {
		fixture.cleanup();
	}
});

/**
 * Spies on `fs.copyFileSync` for the duration of a test, returning a restore function.
 *
 * TS compiles `import * as fs from 'fs'` to a live-binding getter (via tslib's `__importStar`),
 * so this module's own `fs.copyFileSync` can't be assigned directly ("Cannot set property
 * copyFileSync of #<Object> which has only a getter"). `require('fs')` returns the real,
 * plain-writable module object underneath that every `import * as fs` — including in
 * src/utils/sqliteWal.ts — transparently forwards reads to, so mutating it here is visible there.
 */
function spyOnCopyFileSync(
	impl: (original: typeof fs.copyFileSync, ...args: Parameters<typeof fs.copyFileSync>) => ReturnType<typeof fs.copyFileSync>
): () => void {
	const rawFs = require('fs') as typeof fs;
	const original = rawFs.copyFileSync;
	rawFs.copyFileSync = ((...args: Parameters<typeof fs.copyFileSync>) => impl(original, ...args)) as typeof fs.copyFileSync;
	return () => { rawFs.copyFileSync = original; };
}

test('tryReadDbWithWalFingerprint does not serve a throttled buffer once the main db file itself has changed', async () => {
	const fixture = createWalFixture();
	let copyCalls = 0;
	const restoreCopyFileSync = spyOnCopyFileSync((original, ...args) => {
		copyCalls++;
		return original(...args);
	});
	try {
		const first = await tryReadDbWithWal(fixture.dbPath);
		assert.ok(first, 'first call should merge and return a buffer');
		const copyCallsAfterFirstMerge = copyCalls;
		assert.ok(copyCallsAfterFirstMerge > 0, 'sanity: the first call actually copied files');

		// A checkpoint (RESTART) folds all pending frames into the main .db file, changing its
		// mtime/size, while leaving journal_mode=WAL active for further writes — this is the
		// "checkpoint changed the main file while a WAL remains" scenario item 2 guards against.
		// It must NOT be confused with "the writer stopped" (nothing here reduces WAL activity).
		fixture.writer.exec('PRAGMA wal_checkpoint(RESTART);');
		fixture.writer.exec("INSERT INTO t VALUES ('after-checkpoint')"); // leave a fresh, non-empty WAL

		// Still well inside the throttle window — a naive throttle would just re-serve `first`.
		const second = await tryReadDbWithWal(fixture.dbPath);

		assert.ok(
			copyCalls > copyCallsAfterFirstMerge,
			'a main-db-file change during the throttle window must force a fresh merge attempt, not silently reuse a buffer that predates the change'
		);
		assert.notEqual(second, first, 'the served buffer must reflect the post-checkpoint db, not the stale pre-checkpoint one');
	} finally {
		restoreCopyFileSync();
		fixture.cleanup();
	}
});

test('tryReadDbWithWal evicts a now-ineligible path\'s cached buffer immediately, not after the retention window', async () => {
	const fixture = createWalFixture();
	try {
		const first = await tryReadDbWithWal(fixture.dbPath);
		assert.ok(first, 'first call should merge and return a buffer');
		assert.equal(walMergeCacheHasEntryForTests(fixture.dbPath), true, 'the merged buffer should be cached initially');

		// Checkpoint+truncate collapses the WAL to empty — the path is now ineligible for merging.
		fixture.writer.exec('PRAGMA wal_checkpoint(TRUNCATE);');
		const result = await tryReadDbWithWal(fixture.dbPath);

		assert.equal(result, null, 'no WAL left to merge, so tryReadDbWithWal must return null');
		assert.equal(
			walMergeCacheHasEntryForTests(fixture.dbPath), false,
			'an ineligible path\'s retained buffer must be dropped immediately, not held for the rest of the retention window'
		);
	} finally {
		fixture.cleanup();
	}
});

test('tryReadDbWithWal refuses to attempt a merge when db+wal COMBINED exceed the cap, even though the db alone is small', async () => {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sqlitewal-hugewal-'));
	const dbPath = path.join(tmpDir, 'small.db');
	const walPath = dbPath + '-wal';
	let copyCalls = 0;
	const restoreCopyFileSync = spyOnCopyFileSync((original, ...args) => {
		copyCalls++;
		return original(...args);
	});
	try {
		fs.writeFileSync(dbPath, 'tiny db content, nowhere near the cap alone');
		// A sparse file reports the requested size via fs.stat without writing real bytes to disk.
		const fd = fs.openSync(walPath, 'w');
		fs.ftruncateSync(fd, MAX_WAL_MERGE_DB_SIZE_BYTES);
		fs.closeSync(fd);

		const result = await tryReadDbWithWal(dbPath);

		assert.equal(result, null, 'a small db with a huge WAL must still be refused');
		assert.equal(
			copyCalls, 0,
			'the combined db+wal size must be checked BEFORE any copy is attempted — a small db must not let an oversized WAL through the cap'
		);
	} finally {
		restoreCopyFileSync();
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
});

test('tryReadDbWithWal throttles a persistently failing merge instead of retrying the expensive copy on every call', async () => {
	const fixture = createWalFixture();
	let copyAttempts = 0;
	const restoreCopyFileSync = spyOnCopyFileSync(() => {
		copyAttempts++;
		throw new Error('simulated persistent copy failure');
	});
	try {
		const first = await tryReadDbWithWal(fixture.dbPath);
		assert.equal(first, null, 'a failing merge with nothing cached yet must return null');
		assert.equal(copyAttempts, 1, 'sanity: the merge was attempted once');

		const second = await tryReadDbWithWal(fixture.dbPath);
		assert.equal(second, null);
		assert.equal(
			copyAttempts, 1,
			'a persistently failing merge must be throttled like a successful one — retrying the full copy on every single call defeats the throttle exactly where it matters most'
		);
	} finally {
		restoreCopyFileSync();
		fixture.cleanup();
	}
});
