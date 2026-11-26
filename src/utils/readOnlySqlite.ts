/**
 * Copy-free, read-only SQLite access through Node's built-in `node:sqlite`.
 *
 * Opening a live database with `{ readOnly: true }` sees another process's pending WAL frames
 * directly, with no temp copy, no size cap and no large WASM allocation, and mutates neither the
 * main file nor the WAL. That makes it the preferred backend for stores another tool writes to
 * in WAL mode (Cursor, OpenCode, Kilo Code). Every query opens, reads and closes its own
 * connection: a long-lived reader can block the writer's checkpoints and make its WAL grow.
 *
 * `node:sqlite` is not available in every host (an older Electron runtime may lack it), and a
 * read-only open can fail for a particular file (e.g. `SQLITE_READONLY_CANTINIT` when the `-shm`
 * sidecar can't be initialised read-only, or a transient `SQLITE_BUSY`). In both cases
 * {@link ReadOnlySqliteReader.query} returns `null` so the caller can fall back to sql.js; a
 * failing path is demoted for a cooldown so the probe isn't retried on every call, but not for
 * the process lifetime, so a transient failure doesn't strand it on the expensive fallback.
 */

export type NodeSqliteModule = typeof import('node:sqlite');

/** Bound query parameter types accepted by both the node:sqlite and sql.js backends. */
export type SqliteQueryParam = string | number | bigint | null | Uint8Array;

/** How long a db path stays demoted to the sql.js fallback after a failed read-only attempt. */
export const READ_ONLY_RETRY_COOLDOWN_MS = 5 * 60_000;

/** How long a read-only query waits on a writer's lock before giving up. */
export const READ_ONLY_BUSY_TIMEOUT_MS = 5000;

export class ReadOnlySqliteReader {
	// `undefined` = not yet probed, `null` = require('node:sqlite') failed, so every path falls back.
	private _module: NodeSqliteModule | null | undefined;
	// Per-db-path time of the last failed read-only open/query; see isDemoted().
	private readonly _demotedAt: Map<string, number> = new Map();

	/** Loads `node:sqlite`, or `null` when this runtime lacks it. Overridable for tests. */
	getNodeSqliteModule(): NodeSqliteModule | null {
		if (this._module === undefined) {
			try {
				this._module = require('node:sqlite') as NodeSqliteModule;
			} catch {
				this._module = null;
			}
		}
		return this._module;
	}

	/** True while `dbPath` is still demoted to the fallback after a recent read-only failure. */
	isDemoted(dbPath: string, nowMs: number = Date.now()): boolean {
		const failedAt = this._demotedAt.get(dbPath);
		if (failedAt === undefined) { return false; }
		if (nowMs - failedAt < READ_ONLY_RETRY_COOLDOWN_MS) { return true; }
		this._demotedAt.delete(dbPath);
		return false;
	}

	/** Demotes `dbPath` to the fallback as of `nowMs`. */
	demote(dbPath: string, nowMs: number = Date.now()): void {
		this._demotedAt.set(dbPath, nowMs);
	}

	/** Whether a demotion entry (expired or not) is recorded for `dbPath`. */
	hasDemotionEntry(dbPath: string): boolean {
		return this._demotedAt.has(dbPath);
	}

	/**
	 * Runs `sql` against the live `dbPath` over a fresh read-only connection and returns its rows,
	 * or `null` when this backend can't be used for `dbPath` (node:sqlite unavailable, the path is
	 * demoted, or the open/query failed, which demotes it). A `null` means "use the fallback",
	 * never "no rows".
	 */
	query(dbPath: string, sql: string, params: SqliteQueryParam[] = []): Array<Record<string, unknown>> | null {
		const mod = this.getNodeSqliteModule();
		if (!mod || this.isDemoted(dbPath)) { return null; }
		let db: import('node:sqlite').DatabaseSync | undefined;
		try {
			db = new mod.DatabaseSync(dbPath, { readOnly: true });
			db.exec(`PRAGMA busy_timeout = ${READ_ONLY_BUSY_TIMEOUT_MS}`);
			return db.prepare(sql).all(...(params as import('node:sqlite').SQLInputValue[])) as Array<Record<string, unknown>>;
		} catch {
			this.demote(dbPath);
			return null;
		} finally {
			if (db) { try { db.close(); } catch { /* ignore */ } }
		}
	}

	/** Forgets every demotion. */
	clear(): void {
		this._demotedAt.clear();
	}
}
