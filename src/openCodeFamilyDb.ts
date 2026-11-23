/**
 * Shared SQLite helpers for the OpenCode-family stores (OpenCode and Kilo Code).
 *
 * Both editors keep sessions in a single WAL-mode SQLite database with the same
 * `session` table layout, and cache one parsed sql.js instance keyed on the
 * main file plus WAL fingerprint. The cache refresh and freshness checks and the session
 * metadata query are identical for both, so they live here once.
 */
/// <reference types="sql.js" />
import * as fs from 'fs';
import { getWalStat, readDbBufferWithWalFingerprint, WAL_MERGE_MIN_INTERVAL_MS, type WalReadResult } from './utils/sqliteWal';
import { SqlJsDbCacheBase, type SqlDatabase } from './utils/sqlJsDbCache';

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

/**
 * Read one session's metadata row from an OpenCode-family `session` table.
 * Returns null when there is no database, no such session, or the query fails.
 */
export function readSessionMetadataRow(db: SqlDatabase | null, sessionId: string): SessionMetadataRow | null {
	if (!db) { return null; }
	try {
		const result = db.exec('SELECT id, slug, title, time_created, time_updated, project_id, directory FROM session WHERE id = ?', [sessionId]);
		if (result.length === 0 || result[0].values.length === 0) { return null; }
		const row = result[0].values[0];
		const cols = result[0].columns;
		const obj: Record<string, unknown> = {};
		for (let i = 0; i < cols.length; i++) { obj[cols[i]] = row[i]; }
		return {
			id: obj.id,
			slug: obj.slug,
			title: obj.title,
			projectID: obj.project_id,
			directory: obj.directory,
			time: { created: obj.time_created, updated: obj.time_updated }
		};
	} catch {
		return null;
	}
}
