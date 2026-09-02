/**
 * Unit tests for the schema-extension hook that lets a downstream server add its own
 * tables without forking this package:
 *  - extensions run during getDb() and receive a usable handle
 *  - an extension (or a helper it calls) may call getDb() re-entrantly and gets the
 *    same handle back, rather than recursively opening new ones
 *  - registering the same name twice is a no-op
 *  - registering after the database is open applies immediately
 *  - a failing extension does not leave a half-initialised database behind
 *
 * Uses a real node:sqlite database in a temp directory via LOCAL_DATA_DIR.
 */
import { test, describe, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

let tempDir: string;

before(() => {
	tempDir = mkdtempSync(join(tmpdir(), 'schema-ext-test-'));
	process.env.LOCAL_DATA_DIR = tempDir;
});

after(async () => {
	// Close the handle first: on Windows the open SQLite file blocks rmSync with EPERM.
	const { closeDb } = await import('../db.js');
	closeDb();
	rmSync(tempDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 50 });
});

describe('registerSchemaExtension', () => {
	beforeEach(async () => {
		const { closeDb } = await import('../db.js');
		closeDb();
	});

	test('runs the extension during getDb() with a usable handle', async () => {
		const { getDb, registerSchemaExtension, closeDb } = await import('../db.js');
		closeDb();

		let received: unknown;
		registerSchemaExtension('ext-basic', (db) => {
			received = db;
			db.exec('CREATE TABLE IF NOT EXISTS ext_basic (id INTEGER PRIMARY KEY)');
		});

		const db = getDb();
		assert.equal(received, db, 'extension should receive the live handle');
		// The table must really exist, not just have been "executed".
		db.exec('INSERT INTO ext_basic (id) VALUES (1)');
		assert.equal(db.prepare('SELECT COUNT(*) AS n FROM ext_basic').get()!.n, 1);
	});

	test('tolerates an extension that calls getDb() re-entrantly', async () => {
		// A downstream extension is handed `db`, but may call a query helper that
		// reaches for getDb() itself. If getDb() had not published the handle before
		// running extensions, this recursed and opened a new SQLite handle each time.
		const { getDb, registerSchemaExtension, closeDb } = await import('../db.js');
		closeDb();

		let depth = 0;
		let maxDepth = 0;
		let invocations = 0;
		let innerHandle: unknown;
		registerSchemaExtension('ext-reentrant', () => {
			// Track nesting depth rather than a raw count: this extension stays
			// registered for the rest of the suite and runs on every later getDb(),
			// but it must never be *nested* inside itself.
			depth++;
			maxDepth = Math.max(maxDepth, depth);
			invocations++;
			try {
				innerHandle = getDb();
			} finally {
				depth--;
			}
		});

		invocations = 0;
		maxDepth = 0;
		const outer = getDb();
		assert.equal(maxDepth, 1, 'extension re-entered itself — getDb() is recursing');
		assert.equal(invocations, 1, 'extension should run exactly once');
		assert.equal(innerHandle, outer, 're-entrant getDb() must return the same handle');
	});

	test('ignores a duplicate registration of the same name', async () => {
		const { getDb, registerSchemaExtension, closeDb } = await import('../db.js');
		closeDb();

		let count = 0;
		registerSchemaExtension('ext-dupe', () => { count++; });
		registerSchemaExtension('ext-dupe', () => { count += 100; });

		count = 0;
		getDb();
		assert.equal(count, 1, 'only the first registration should apply');
	});

	test('applies immediately when registered after the database is open', async () => {
		const { getDb, registerSchemaExtension, closeDb } = await import('../db.js');
		closeDb();

		getDb();
		let applied = false;
		registerSchemaExtension('ext-late', (db) => {
			applied = true;
			db.exec('CREATE TABLE IF NOT EXISTS ext_late (id INTEGER PRIMARY KEY)');
		});
		assert.ok(applied, 'late registration should apply against the open database');
	});

	test('does not leave a half-initialised database when an extension throws', async () => {
		const { getDb, registerSchemaExtension, closeDb } = await import('../db.js');
		closeDb();

		let attempts = 0;
		let shouldThrow = true;
		registerSchemaExtension('ext-throws', () => {
			attempts++;
			if (shouldThrow) {
				shouldThrow = false;
				throw new Error('boom');
			}
		});

		attempts = 0;
		assert.throws(() => getDb(), /boom/);
		// The failed handle must have been rolled back, so the next call retries
		// initialisation rather than handing out a partially-built database.
		const db = getDb();
		assert.equal(attempts, 2, 'second getDb() should re-run initialisation');
		assert.ok(db, 'retry should succeed once the extension stops throwing');
	});
});
