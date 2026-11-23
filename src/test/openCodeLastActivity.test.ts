/**
 * An OpenCode database session's last activity includes its message and part writes, not just
 * the session row, which OpenCode does not touch on every write (#2710). The CLI caches parsed
 * DB-backed sessions under this time, so a lagging value would serve stale token data.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { OpenCodeDataAccess } from '../opencode';
import { OpenCodeAdapter } from '../adapters/openCodeAdapter';

/** A temp OpenCode data dir holding an `opencode.db` with the given extra statements applied. */
function createStore(statements: string[], options: { withMessageTables?: boolean } = {}) {
	const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'opencode-activity-'));
	const db = new DatabaseSync(path.join(dir, 'opencode.db'));
	db.exec('CREATE TABLE session (id TEXT PRIMARY KEY, slug TEXT, title TEXT, project_id TEXT, directory TEXT, time_created INTEGER NOT NULL, time_updated INTEGER NOT NULL)');
	if (options.withMessageTables !== false) {
		db.exec('CREATE TABLE message (id TEXT PRIMARY KEY, session_id TEXT NOT NULL, time_created INTEGER NOT NULL, time_updated INTEGER NOT NULL, data TEXT NOT NULL)');
		db.exec('CREATE TABLE part (id TEXT PRIMARY KEY, message_id TEXT NOT NULL, session_id TEXT NOT NULL, time_created INTEGER NOT NULL, time_updated INTEGER NOT NULL, data TEXT NOT NULL)');
	}
	for (const sql of statements) { db.exec(sql); }
	db.close();
	class Store extends OpenCodeDataAccess {
		override getOpenCodeDataDir(): string { return dir; }
	}
	const openCode = new Store(null as any);
	return { openCode, dir, cleanup: () => { openCode.dispose(); fs.rmSync(dir, { recursive: true, force: true }); } };
}

const SESSION = "INSERT INTO session VALUES ('ses_1', 's', 't', 'p', '/w', 1000, 2000)";

test('a message written after the session row moves the session\'s last activity', async () => {
	const store = createStore([SESSION, "INSERT INTO message VALUES ('m1', 'ses_1', 1500, 9000, '{}')"]);
	try {
		assert.equal((await store.openCode.readOpenCodeDbSessionLastActivity('ses_1'))?.getTime(), 9000);
	} finally {
		store.cleanup();
	}
});

test('the newest of session, message and part wins', async () => {
	const store = createStore([
		SESSION,
		"INSERT INTO message VALUES ('m1', 'ses_1', 1500, 3000, '{}')",
		"INSERT INTO part VALUES ('p1', 'm1', 'ses_1', 1500, 7000, '{}')",
		// Another session's later writes must not count.
		"INSERT INTO session VALUES ('ses_2', 's', 't', 'p', '/w', 1000, 99000)",
		"INSERT INTO message VALUES ('m2', 'ses_2', 1500, 98000, '{}')",
	]);
	try {
		assert.equal((await store.openCode.readOpenCodeDbSessionLastActivity('ses_1'))?.getTime(), 7000);
	} finally {
		store.cleanup();
	}
});

test('the session row is used when it is newest, when the session has no messages, or the tables are missing', async () => {
	const store = createStore([SESSION, "INSERT INTO message VALUES ('m1', 'ses_1', 1500, 1800, '{}')"]);
	const bare = createStore([SESSION], { withMessageTables: false });
	try {
		assert.equal((await store.openCode.readOpenCodeDbSessionLastActivity('ses_1'))?.getTime(), 2000);
		assert.equal((await bare.openCode.readOpenCodeDbSessionLastActivity('ses_1'))?.getTime(), 2000);
		assert.equal(await store.openCode.readOpenCodeDbSessionLastActivity('ses_missing'), null);
	} finally {
		store.cleanup();
		bare.cleanup();
	}
});

test('OpenCodeAdapter.getLastActivity uses it for a database session', async () => {
	const store = createStore([SESSION, "INSERT INTO part VALUES ('p1', 'm1', 'ses_1', 1500, 12000, '{}')"]);
	try {
		const adapter = new OpenCodeAdapter(store.openCode);
		const at = await adapter.getLastActivity(path.join(store.dir, 'opencode.db#ses_1'));
		assert.equal(at?.getTime(), 12000);
	} finally {
		store.cleanup();
	}
});
