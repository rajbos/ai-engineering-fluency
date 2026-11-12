import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { WalSqlJsDbCacheBase, readSessionMetadataRow } from '../openCodeFamilyDb';
import type { SqlDatabase } from '../utils/sqlJsDbCache';
import type { WalReadResult } from '../utils/sqliteWal';

const SESSION_DDL = 'CREATE TABLE session (id TEXT PRIMARY KEY, slug TEXT, title TEXT, time_created INTEGER, time_updated INTEGER, project_id TEXT, directory TEXT);';

/** Exposes the protected helpers so they can be tested directly. */
class TestCache extends WalSqlJsDbCacheBase {
	stat(dbPath: string) { return this.statDbFile(dbPath); }
	current(dbPath: string, stats: fs.Stats) { return this.isCachedDbCurrent(dbPath, stats); }
	key(dbPath: string, stats: fs.Stats) { return this.getDbCacheKey(dbPath, stats); }
	same(a: fs.Stats, b: fs.Stats) { return this.sameDbStats(a, b); }
	currentForFingerprint(dbPath: string, r: WalReadResult) { return this.isCachedDbCurrentForFingerprint(dbPath, r); }
	refresh(dbPath: string, stats: fs.Stats) { return this.refreshDb(dbPath, stats); }
	get cache() { return this._dbCache; }
	setCache(db: SqlDatabase, dbPath: string, mtimeMs: number, size: number, walMtimeMs: number, walSize: number) {
		this._dbCache = { db, path: dbPath, mtimeMs, size, walMtimeMs, walSize };
	}
}

/** Temp SQLite file with a fixture `session` table (rollback journal, no WAL). */
function createFixture() {
	const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-family-db-'));
	const dbPath = path.join(tmpDir, 'store.db');
	const writer = new DatabaseSync(dbPath);
	writer.exec(SESSION_DDL);
	writer.exec("INSERT INTO session VALUES ('ses_1', 'slug-1', 'Fixture title', 100, 200, 'proj_1', '/work/dir')");
	writer.close();
	return { tmpDir, dbPath, cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }) };
}

async function inMemoryDb(cache: TestCache, rows: string[] = []): Promise<SqlDatabase> {
	const SQL = await cache.initSqlJs();
	const db = new SQL.Database();
	db.run(SESSION_DDL);
	for (const row of rows) { db.run(row); }
	return db;
}

test('readSessionMetadataRow maps the session row to the session metadata shape', async () => {
	const cache = new TestCache();
	const db = await inMemoryDb(cache, ["INSERT INTO session VALUES ('ses_a', 'a-slug', 'A title', 10, 20, 'proj_a', '/a')"]);
	try {
		assert.deepEqual(readSessionMetadataRow(db, 'ses_a'), {
			id: 'ses_a',
			slug: 'a-slug',
			title: 'A title',
			projectID: 'proj_a',
			directory: '/a',
			time: { created: 10, updated: 20 },
		});
	} finally {
		db.close();
		cache.dispose();
	}
});

test('readSessionMetadataRow returns null for no database, an unknown id, or a failing query', async () => {
	const cache = new TestCache();
	const db = await inMemoryDb(cache);
	const SQL = await cache.initSqlJs();
	const noTable = new SQL.Database();
	try {
		assert.equal(readSessionMetadataRow(null, 'ses_a'), null);
		assert.equal(readSessionMetadataRow(db, 'missing'), null);
		assert.equal(readSessionMetadataRow(noTable, 'ses_a'), null, 'a missing session table is swallowed, not thrown');
	} finally {
		db.close();
		noTable.close();
		cache.dispose();
	}
});

test('sameDbStats compares only mtime and size', () => {
	const cache = new TestCache();
	const a = { mtimeMs: 1, size: 2, ino: 1 } as fs.Stats;
	assert.equal(cache.same(a, { mtimeMs: 1, size: 2, ino: 99 } as fs.Stats), true);
	assert.equal(cache.same(a, { mtimeMs: 2, size: 2 } as fs.Stats), false);
	assert.equal(cache.same(a, { mtimeMs: 1, size: 3 } as fs.Stats), false);
});

test('getDbCacheKey includes path, file stats and the (absent) WAL fingerprint', () => {
	const fixture = createFixture();
	try {
		const cache = new TestCache();
		const stats = fs.statSync(fixture.dbPath);
		const key = cache.key(fixture.dbPath, stats);
		assert.ok(key.startsWith(`${fixture.dbPath}:${stats.mtimeMs}:${stats.size}:wal`), key);
		assert.equal(cache.key(fixture.dbPath, stats), key, 'same inputs give the same key');
		assert.notEqual(cache.key(fixture.dbPath, { mtimeMs: stats.mtimeMs + 1, size: stats.size } as fs.Stats), key);
	} finally {
		fixture.cleanup();
	}
});

test('isCachedDbCurrent and isCachedDbCurrentForFingerprint match only the exact cached fingerprint', async () => {
	const fixture = createFixture();
	const cache = new TestCache();
	try {
		const stats = fs.statSync(fixture.dbPath);
		assert.equal(cache.current(fixture.dbPath, stats), false, 'no cache yet');

		const db = await inMemoryDb(cache);
		// No -wal file exists, so its fingerprint reads as mtime 0 / size 0.
		cache.setCache(db, fixture.dbPath, stats.mtimeMs, stats.size, 0, 0);
		assert.equal(cache.current(fixture.dbPath, stats), true);
		assert.equal(cache.current(path.join(fixture.tmpDir, 'other.db'), stats), false, 'different path');
		assert.equal(cache.current(fixture.dbPath, { mtimeMs: stats.mtimeMs, size: stats.size + 1 } as fs.Stats), false, 'different size');

		const fingerprint = { buffer: Buffer.alloc(0), dbMtimeMs: stats.mtimeMs, dbSize: stats.size, walMtimeMs: 0, walSize: 0, walIncluded: true } as unknown as WalReadResult;
		assert.equal(cache.currentForFingerprint(fixture.dbPath, fingerprint), true);
		assert.equal(cache.currentForFingerprint(fixture.dbPath, { ...fingerprint, walSize: 5 }), false, 'different WAL size');
		assert.equal(cache.currentForFingerprint(fixture.dbPath, { ...fingerprint, dbMtimeMs: stats.mtimeMs + 1 }), false, 'different db mtime');
	} finally {
		cache.dispose();
		fixture.cleanup();
	}
});

test('statDbFile returns stats for an existing file and drops the cache once that file is gone', async () => {
	const fixture = createFixture();
	const cache = new TestCache();
	try {
		const stats = cache.stat(fixture.dbPath);
		assert.ok(stats && stats.size > 0);

		cache.setCache(await inMemoryDb(cache), fixture.dbPath, stats.mtimeMs, stats.size, 0, 0);
		const otherPath = path.join(fixture.tmpDir, 'missing-other.db');
		assert.equal(cache.stat(otherPath), null);
		assert.ok(cache.cache, 'a missing unrelated file keeps the cache');

		fs.rmSync(fixture.dbPath);
		assert.equal(cache.stat(fixture.dbPath), null);
		assert.equal(cache.cache, null, 'the cache for the deleted file is closed');
	} finally {
		cache.dispose();
		fixture.cleanup();
	}
});

test('refreshDb parses the file, caches it, and the parsed database answers session queries', async () => {
	const fixture = createFixture();
	const cache = new TestCache();
	try {
		const stats = fs.statSync(fixture.dbPath);
		const db = await cache.refresh(fixture.dbPath, stats);
		assert.ok(db, 'refresh returns a database');
		assert.equal(readSessionMetadataRow(db, 'ses_1')?.title, 'Fixture title');
		assert.equal(cache.cache?.db, db, 'a WAL-complete read is installed as the cache');
		assert.equal(cache.current(fixture.dbPath, stats), true);

		const again = await cache.refresh(fixture.dbPath, stats);
		assert.equal(again, db, 'an unchanged fingerprint reuses the cached instance instead of reparsing');
	} finally {
		cache.dispose();
		fixture.cleanup();
	}
});

test('refreshDb falls back to the cached database (none here) when the file cannot be read', async () => {
	const cache = new TestCache();
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-family-db-missing-'));
	try {
		const missing = path.join(tmpDir, 'missing.db');
		assert.equal(await cache.refresh(missing, { mtimeMs: 1, size: 1 } as fs.Stats), null);
	} finally {
		cache.dispose();
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
});
