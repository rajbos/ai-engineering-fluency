/**
 * Shared SQLite helpers for the OpenCode-family stores (OpenCode and Kilo Code).
 *
 * Both editors keep sessions in a single WAL-mode SQLite database with the same
 * `session`/`message`/`part` table layout. Queries go through a copy-free read-only
 * `node:sqlite` connection first, which sees uncheckpointed WAL rows with no size cap (#2710);
 * when that backend is unavailable (e.g. an Electron host without `node:sqlite`) or fails for
 * the file, they fall back to one parsed sql.js instance keyed on the main file plus WAL
 * fingerprint. The queries, the cache refresh and the freshness checks are identical for
 * both editors, so they live here once.
 */
import * as fs from 'fs';
import { getWalStat, readDbBufferWithWalFingerprint, WAL_MERGE_MIN_INTERVAL_MS, type WalReadResult } from './utils/sqliteWal';
import type initSqlJs from 'sql.js';
import { SqlJsDbCacheBase, type SqlDatabase } from './utils/sqlJsDbCache';
import { ReadOnlySqliteReader, type SqliteQueryParam } from './utils/readOnlySqlite';

/**
 * {@link SqlJsDbCacheBase} plus the stat and fingerprint checks used to decide
 * whether the cached database still matches the file (and its WAL) on disk.
 */
export abstract class WalSqlJsDbCacheBase extends SqlJsDbCacheBase {
	/**
	 * How long a WAL-blind (`walIncluded: false`) parse may be reused while the db and WAL
	 * fingerprint stay exactly the same. Matches the merge throttle in sqliteWal.ts, which already
	 * serves a merged buffer this stale, so reuse adds no staleness the WAL-complete path lacks.
	 */
	static readonly TRANSIENT_DB_REUSE_MS = WAL_MERGE_MIN_INTERVAL_MS;

	/**
	 * The fingerprint `_pendingTransientDb` was parsed from, and when. Kept beside it (not in
	 * `_dbCache`) so a WAL-blind read is never treated as settled, yet an unchanged one is not
	 * re-read and re-parsed on every query. Without this, a db+WAL over the merge cap was read in
	 * full for every single session query (#2710).
	 */
	private _transientFingerprint: { db: SqlDatabase; path: string; mtimeMs: number; size: number; walMtimeMs: number; walSize: number; parsedAt: number } | null = null;

	/** The preferred, copy-free read-only `node:sqlite` backend; see {@link queryRows}. */
	protected readonly readOnlySqlite = new ReadOnlySqliteReader();

	override dispose(): void {
		super.dispose();
		this.readOnlySqlite.clear();
	}

	/** Injectable clock, for tests of the transient reuse window. */
	protected now(): number { return Date.now(); }

	/** Reads the db bytes plus the fingerprint they came from; overridable so tests can simulate a WAL-blind read. */
	protected readDbBuffer(dbPath: string): Promise<WalReadResult> {
		return readDbBufferWithWalFingerprint(dbPath);
	}

	/**
	 * The parsed database to serve without re-reading `dbPath`, or `null` when it must be read:
	 * the settled `_dbCache` while it matches the db and WAL on disk, otherwise the last
	 * WAL-blind parse while its exact fingerprint still matches and it is younger than
	 * {@link TRANSIENT_DB_REUSE_MS}. Re-reading an unchanged fingerprint would give the same bytes.
	 * The window only bounds how long a failed merge (rather than the size cap) stays unretried.
	 */
	protected getCurrentDb(dbPath: string, stats: fs.Stats): SqlDatabase | null {
		if (this.isCachedDbCurrent(dbPath, stats)) {
			return this._dbCache?.db ?? null;
		}
		const transient = this._transientFingerprint;
		if (!transient || transient.db !== this._pendingTransientDb || transient.path !== dbPath) { return null; }
		if (this.now() - transient.parsedAt >= WalSqlJsDbCacheBase.TRANSIENT_DB_REUSE_MS) { return null; }
		const wal = getWalStat(dbPath);
		const unchanged = transient.mtimeMs === stats.mtimeMs
			&& transient.size === stats.size
			&& transient.walMtimeMs === wal.mtimeMs
			&& transient.walSize === wal.size;
		return unchanged ? transient.db : null;
	}

	/** Stat the database file; drops the cache when the cached file has disappeared. */
	protected statDbFile(dbPath: string): fs.Stats | null {
		try {
			return fs.statSync(dbPath);
		} catch (error) {
			if (this.isMissingFileError(error) && this._dbCache?.path === dbPath) {
				this.closeDbCache();
			}
			return null;
		}
	}

	protected isCachedDbCurrent(dbPath: string, stats: fs.Stats): boolean {
		const wal = getWalStat(dbPath);
		return this._dbCache?.path === dbPath
			&& this._dbCache.mtimeMs === stats.mtimeMs
			&& this._dbCache.size === stats.size
			&& this._dbCache.walMtimeMs === wal.mtimeMs
			&& this._dbCache.walSize === wal.size;
	}

	protected getDbCacheKey(dbPath: string, stats: fs.Stats): string {
		const wal = getWalStat(dbPath);
		return `${dbPath}:${stats.mtimeMs}:${stats.size}:wal${wal.mtimeMs}:${wal.size}`;
	}

	protected sameDbStats(left: fs.Stats, right: fs.Stats): boolean {
		return left.mtimeMs === right.mtimeMs && left.size === right.size;
	}

	/** True when `_dbCache` was built from a read that reported this exact fingerprint. */
	protected isCachedDbCurrentForFingerprint(dbPath: string, result: WalReadResult): boolean {
		return this._dbCache?.path === dbPath
			&& this._dbCache.mtimeMs === result.dbMtimeMs
			&& this._dbCache.size === result.dbSize
			&& this._dbCache.walMtimeMs === result.walMtimeMs
			&& this._dbCache.walSize === result.walSize;
	}

	/**
	 * Re-read and parse the database after a cheap stat check found a possible change,
	 * reusing the cached instance whenever the read turns out not to be newer.
	 */
	protected async refreshDb(dbPath: string, stats: fs.Stats): Promise<SqlDatabase | null> {
		let result: WalReadResult;
		try {
			// Use the fingerprint the read itself reports rather than a fresh getWalStat(dbPath)
			// call afterwards: a throttled sqliteWal read can serve a buffer older than "now", and
			// stamping it with the current WAL state would make a stale cache entry look current —
			// permanently hiding any WAL writes that land after this read but before the throttle
			// window lapses (see #2036 review notes on src/utils/sqliteWal.ts).
			result = await this.readDbBuffer(dbPath);
		} catch {
			return this.getCachedDbForPath(dbPath);
		}

		// The cheap pre-check in the caller that led here used a fresh WAL stat and found a
		// possible change, but the read above may have been served from sqliteWal's own throttle
		// under the buffer's ORIGINAL fingerprint — i.e. nothing actually changed since the db
		// already cached here was built. Reuse it rather than paying to reparse bytes we already
		// have parsed — see #2036 review notes (Fix 1).
		if (this.isCachedDbCurrentForFingerprint(dbPath, result)) {
			return this._dbCache?.db ?? null;
		}

		let db: SqlDatabase;
		try {
			const SQL = await this.initSqlJs();
			db = new SQL.Database(result.buffer);
		} catch {
			return this.getCachedDbForPath(dbPath);
		}

		const currentStats = this.statDbFile(dbPath);
		if (!currentStats || !this.sameDbStats(stats, currentStats)) {
			this.closeDb(db);
			if (this.isCachedDbCurrent(dbPath, currentStats ?? stats)) {
				return this._dbCache?.db ?? null;
			}
			return this.getCachedDbForPath(dbPath);
		}

		if (!result.walIncluded) {
			// A WAL-blind plain read (see sqliteWal.ts) — usable for this one call, but not safe to
			// treat as "caught up": persisting it into `_dbCache` would let a later WAL-quiet moment
			// look identical to a genuinely caught-up read, hiding committed rows never checkpointed
			// into the main file — see #2036 review notes (Fix 3). Keep it only in the single
			// trailing transient slot instead.
			this.releasePendingTransientDb();
			this._pendingTransientDb = db;
			this._transientFingerprint = { db, path: dbPath, mtimeMs: result.dbMtimeMs, size: result.dbSize, walMtimeMs: result.walMtimeMs, walSize: result.walSize, parsedAt: this.now() };
			return db;
		}

		this.closeDbCache();
		this.releasePendingTransientDb();
		this._transientFingerprint = null;
		this._dbCache = { db, path: dbPath, mtimeMs: result.dbMtimeMs, size: result.dbSize, walMtimeMs: result.walMtimeMs, walSize: result.walSize };
		return db;
	}

	/**
	 * The parsed sql.js database for `dbPath` (the fallback backend), re-reading it only when
	 * the file or its WAL changed. Single-flight, so concurrent callers share one read.
	 */
	protected async getSqlJsDb(dbPath: string): Promise<SqlDatabase | null> {
		const stats = this.statDbFile(dbPath);
		if (!stats) { return this.getCachedDbForPath(dbPath); }

		const current = this.getCurrentDb(dbPath, stats);
		if (current) { return current; }

		const cacheKey = this.getDbCacheKey(dbPath, stats);
		const inflight = this._dbCacheInflight.get(cacheKey);
		if (inflight) { return inflight; }

		const createDbPromise = this.refreshDb(dbPath, stats);
		this._dbCacheInflight.set(cacheKey, createDbPromise);
		try {
			return await createDbPromise;
		} finally {
			if (this._dbCacheInflight.get(cacheKey) === createDbPromise) {
				this._dbCacheInflight.delete(cacheKey);
			}
		}
	}

	/**
	 * Runs `sql` against `dbPath` and returns its rows as objects: through read-only
	 * `node:sqlite` when it can be used, otherwise through the cached sql.js parse. Returns
	 * `null` when there is no database or the query failed on both backends.
	 */
	protected async queryRows(dbPath: string, sql: string, params: SqliteQueryParam[] = []): Promise<Array<Record<string, unknown>> | null> {
		if (this.statDbFile(dbPath)) {
			const rows = this.readOnlySqlite.query(dbPath, sql, params);
			if (rows) { return rows; }
		}
		const db = await this.getSqlJsDb(dbPath);
		if (!db) { return null; }
		try {
			const result = db.exec(sql, params as initSqlJs.SqlValue[]);
			if (result.length === 0) { return []; }
			const { columns, values } = result[0];
			return values.map(row => {
				const obj: Record<string, unknown> = {};
				columns.forEach((col, i) => { obj[col] = row[i]; });
				return obj;
			});
		} catch {
			return null;
		}
	}

	/** One session's metadata row, or null when there is no database or no such session. */
	protected async readSessionMetadata(dbPath: string, sessionId: string): Promise<SessionMetadataRow | null> {
		const rows = await this.queryRows(dbPath, SESSION_METADATA_SQL, [sessionId]);
		return rows && rows.length > 0 ? toSessionMetadataRow(rows[0]) : null;
	}

	/** Every message of a session, oldest first, with `id` and `time.created` filled from the row. */
	protected async readSessionMessages(dbPath: string, sessionId: string): Promise<Array<Record<string, unknown>>> {
		return this.readDataRows(dbPath, 'SELECT id, data, time_created FROM message WHERE session_id = ? ORDER BY time_created ASC', sessionId);
	}

	/** Every part of a message, oldest first, with `id` and `time.created` filled from the row. */
	protected async readMessageParts(dbPath: string, messageId: string): Promise<Array<Record<string, unknown>>> {
		return this.readDataRows(dbPath, 'SELECT id, data, time_created FROM part WHERE message_id = ? ORDER BY time_created ASC', messageId);
	}

	/** Every session id in the database. */
	protected async readSessionIds(dbPath: string): Promise<string[]> {
		const rows = await this.queryRows(dbPath, 'SELECT id FROM session');
		return rows ? rows.map(row => row.id as string) : [];
	}

	private async readDataRows(dbPath: string, sql: string, id: string): Promise<Array<Record<string, unknown>>> {
		const rows = await this.queryRows(dbPath, sql, [id]);
		if (!rows) { return []; }
		try {
			return rows.map(row => {
				const data = JSON.parse(row.data as string);
				data.id = row.id;
				data.time = data.time || {};
				data.time.created = data.time.created || row.time_created;
				return data;
			});
		} catch {
			return [];
		}
	}
}

/** Session metadata as stored in an OpenCode-family `session` table row. */
export interface SessionMetadataRow {
	id: unknown;
	slug: unknown;
	title: unknown;
	projectID: unknown;
	directory: unknown;
	time: { created: unknown; updated: unknown };
}

const SESSION_METADATA_SQL = 'SELECT id, slug, title, time_created, time_updated, project_id, directory FROM session WHERE id = ?';

function toSessionMetadataRow(obj: Record<string, unknown>): SessionMetadataRow {
	return {
		id: obj.id,
		slug: obj.slug,
		title: obj.title,
		projectID: obj.project_id,
		directory: obj.directory,
		time: { created: obj.time_created, updated: obj.time_updated }
	};
}

/**
 * Read one session's metadata row from an OpenCode-family `session` table in a parsed
 * sql.js database. Returns null when there is no database, no such session, or the query fails.
 */
export function readSessionMetadataRow(db: SqlDatabase | null, sessionId: string): SessionMetadataRow | null {
	if (!db) { return null; }
	try {
		const result = db.exec(SESSION_METADATA_SQL, [sessionId]);
		if (result.length === 0 || result[0].values.length === 0) { return null; }
		const row = result[0].values[0];
		const cols = result[0].columns;
		const obj: Record<string, unknown> = {};
		for (let i = 0; i < cols.length; i++) { obj[cols[i]] = row[i]; }
		return toSessionMetadataRow(obj);
	} catch {
		return null;
	}
}
