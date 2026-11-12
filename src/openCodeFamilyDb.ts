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
import { getWalStat, readDbBufferWithWalFingerprint, type WalReadResult } from './utils/sqliteWal';
import { SqlJsDbCacheBase, type SqlDatabase } from './utils/sqlJsDbCache';

/**
 * {@link SqlJsDbCacheBase} plus the stat and fingerprint checks used to decide
 * whether the cached database still matches the file (and its WAL) on disk.
 */
export abstract class WalSqlJsDbCacheBase extends SqlJsDbCacheBase {
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
			result = await readDbBufferWithWalFingerprint(dbPath);
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
			return db;
		}

		this.closeDbCache();
		this.releasePendingTransientDb();
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
