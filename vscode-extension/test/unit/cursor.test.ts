import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { UriLike } from '../../../src/opencode';
import { CursorDataAccess } from '../../../src/cursor';

const FAKE_URI: UriLike = { fsPath: '', path: '', scheme: 'file' };

/** Counts entries in `dir` whose name starts with one of `prefixes`. Missing dir counts as 0. */
function countMatchingFiles(dir: string, prefixes: string[]): number {
	let entries: string[];
	try {
		entries = fs.readdirSync(dir);
	} catch {
		return 0;
	}
	return entries.filter(name => prefixes.some(prefix => name.startsWith(prefix))).length;
}

const WAL_TEMP_PREFIXES = ['cursor-wal-', 'sqlite-wal-'];
const copilotTmpDir = path.join(os.homedir(), '.copilot', 'tmp');

/**
 * Creates a real WAL-mode `state.vscdb`-shaped fixture with `cursorDiskKV(key, value)`, using
 * node:sqlite directly (Node 22+, same runtime the extension ships on). Returns the still-open
 * writer connection so callers can insert rows that stay pending in the `-wal` file.
 */
function createCursorDbFixture() {
	const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-fixture-'));
	const dbPath = path.join(tmpDir, 'state.vscdb');
	const writer = new DatabaseSync(dbPath);
	writer.exec('PRAGMA journal_mode=WAL;');
	writer.exec('CREATE TABLE cursorDiskKV (key TEXT PRIMARY KEY, value TEXT);');
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

test('readComposerData sees a live writer\'s pending WAL frames via the read-only backend, without copying or checkpointing the db', async () => {
	const fixture = createCursorDbFixture();
	try {
		const composerId = 'composer-pending';
		const payload = JSON.stringify({ composerId, name: 'Pending session', contextTokensUsed: 42 });
		// Insert without closing the writer connection — this row is committed to SQLite's WAL
		// semantics but lives only in the `-wal` file; sql.js reading raw `.db` bytes would miss it.
		fixture.writer.exec(`INSERT INTO cursorDiskKV VALUES ('composerData:${composerId}', '${payload.replace(/'/g, "''")}')`);

		const beforeMain = fs.statSync(fixture.dbPath);
		const beforeWal = fs.statSync(fixture.dbPath + '-wal');
		const beforeTmpCount = countMatchingFiles(os.tmpdir(), WAL_TEMP_PREFIXES);
		const beforeCopilotTmpCount = countMatchingFiles(copilotTmpDir, WAL_TEMP_PREFIXES);

		const access = new CursorDataAccess(FAKE_URI);
		const virtualPath = `${fixture.dbPath}#${composerId}`;
		const data = await access.readComposerData(virtualPath);

		assert.equal(data?.name, 'Pending session');
		assert.equal(data?.contextTokensUsed, 42);

		const afterMain = fs.statSync(fixture.dbPath);
		const afterWal = fs.statSync(fixture.dbPath + '-wal');
		assert.equal(afterMain.size, beforeMain.size, 'main db file size must be unchanged (no checkpoint)');
		assert.equal(afterMain.mtimeMs, beforeMain.mtimeMs, 'main db file mtime must be unchanged (no write)');
		assert.equal(afterWal.size, beforeWal.size, '-wal file size must be unchanged (no truncating checkpoint)');

		assert.equal(countMatchingFiles(os.tmpdir(), WAL_TEMP_PREFIXES), beforeTmpCount, 'no temp file in os.tmpdir()');
		assert.equal(countMatchingFiles(copilotTmpDir, WAL_TEMP_PREFIXES), beforeCopilotTmpCount, 'no temp file in ~/.copilot/tmp');
	} finally {
		fixture.cleanup();
	}
});

test('discoverSessions and readBubbles also read the live WAL without copying the db', async () => {
	const fixture = createCursorDbFixture();
	try {
		const composerId = 'composer-2';
		fixture.writer.exec(
			`INSERT INTO cursorDiskKV VALUES ('composerData:${composerId}', '${JSON.stringify({ composerId }).replace(/'/g, "''")}')`
		);
		fixture.writer.exec(
			`INSERT INTO cursorDiskKV VALUES ('bubbleId:${composerId}:b1', '${JSON.stringify({ bubbleId: 'b1', type: 1, text: 'hello' }).replace(/'/g, "''")}')`
		);

		const access = new CursorDataAccess(FAKE_URI);
		// discoverSessions() reads the well-known cursor db path — point it at the fixture.
		access.getCursorDbPath = () => fixture.dbPath;

		const sessions = await access.discoverSessions();
		assert.deepEqual(sessions, [`${fixture.dbPath}#${composerId}`]);

		const bubbles = await access.readBubbles(sessions[0], ['b1']);
		assert.equal(bubbles.get('b1')?.text, 'hello');
	} finally {
		fixture.cleanup();
	}
});

test('readComposerData caches parsed composer data instead of re-querying for each call in one session read', async () => {
	const fixture = createCursorDbFixture();
	try {
		const composerId = 'composer-cache';
		fixture.writer.exec(
			`INSERT INTO cursorDiskKV VALUES ('composerData:${composerId}', '${JSON.stringify({
				composerId,
				contextTokensUsed: 10,
				fullConversationHeadersOnly: [{ type: 1, bubbleId: 'b1' }],
			}).replace(/'/g, "''")}')`
		);

		const access = new CursorDataAccess(FAKE_URI);
		let queryCount = 0;
		const originalQueryAll = (access as unknown as { queryAll: (...args: unknown[]) => unknown }).queryAll.bind(access);
		(access as unknown as { queryAll: (...args: unknown[]) => unknown }).queryAll = (...args: unknown[]) => {
			queryCount++;
			return originalQueryAll(...args);
		};

		const virtualPath = `${fixture.dbPath}#${composerId}`;
		// Mirrors getSessionData(): 4 concurrent readComposerData()-backed calls for one session read.
		await Promise.all([
			access.getTokens(virtualPath),
			access.countInteractions(virtualPath),
			access.getModelUsage(virtualPath),
			access.getSessionMeta(virtualPath),
		]);

		assert.equal(queryCount, 1, 'only one underlying query should run for 4 concurrent reads of the same composer');

		// A second, later read (cache still valid — db file unchanged) should also be served from cache.
		await access.readComposerData(virtualPath);
		assert.equal(queryCount, 1, 'a cache-valid follow-up read should not re-query');
	} finally {
		fixture.cleanup();
	}
});

test('falls back to sql.js when node:sqlite is unavailable, and still returns composer data', async () => {
	const fixture = createCursorDbFixture();
	try {
		const composerId = 'composer-fallback';
		const payload = { composerId, name: 'Fallback session', contextTokensUsed: 7 };
		fixture.writer.exec(
			`INSERT INTO cursorDiskKV VALUES ('composerData:${composerId}', '${JSON.stringify(payload).replace(/'/g, "''")}')`
		);
		fixture.writer.close(); // checkpoint on close so the plain sql.js buffer read sees the row too

		const access = new CursorDataAccess(FAKE_URI);
		// Simulate an environment without node:sqlite (older Electron).
		(access as unknown as { getNodeSqliteModule: () => null }).getNodeSqliteModule = () => null;

		const virtualPath = `${fixture.dbPath}#${composerId}`;
		const data = await access.readComposerData(virtualPath);

		assert.equal(data?.name, 'Fallback session');
		assert.equal(data?.contextTokensUsed, 7);
	} finally {
		fixture.cleanup();
	}
});

test('a db path that fails to open read-only is only probed once, not retried on every call', async () => {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cursor-badfile-'));
	const dbPath = path.join(tmpDir, 'state.vscdb');
	try {
		fs.writeFileSync(dbPath, 'not a real sqlite file');

		const access = new CursorDataAccess(FAKE_URI);
		let openAttempts = 0;
		class FailingDatabaseSync {
			constructor() {
				openAttempts++;
				throw new Error('simulated read-only open failure');
			}
		}
		(access as unknown as { getNodeSqliteModule: () => { DatabaseSync: unknown } }).getNodeSqliteModule = () => (
			{ DatabaseSync: FailingDatabaseSync }
		);
		access.getCursorDbPath = () => dbPath;

		await access.discoverSessions();
		await access.discoverSessions();
		await access.discoverSessions();

		assert.equal(openAttempts, 1, 'the read-only backend should only be probed once for a db path that fails to open');
	} finally {
		fs.rmSync(tmpDir, { recursive: true, force: true });
	}
});
