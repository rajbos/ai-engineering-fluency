/**
 * Cursor data access layer.
 * Handles reading session data from Cursor's global SQLite database.
 *
 * Cursor stores all composer (chat) sessions in a single global SQLite database:
 *   Windows: %APPDATA%\Cursor\User\globalStorage\state.vscdb
 *   macOS:   ~/Library/Application Support/Cursor/User/globalStorage/state.vscdb
 *   Linux:   ~/.config/Cursor/User/globalStorage/state.vscdb
 *
 * Sessions are stored as JSON blobs in the `cursorDiskKV` table, keyed by
 * `composerData:<composerId>`. Each session blob contains metadata, model config,
 * context token usage, and a header list of conversation turns.
 *
 * Virtual path scheme: `<dbPath>#<composerId>`
 * Example: `C:\Users\...\globalStorage\state.vscdb#f1ff4e72-3ad1-449c-8027-6750ac80dbca`
 *
 * Token data available: `contextTokensUsed` (current prompt context size, input only).
 * Per-turn output tokens are not stored by Cursor in the SQLite DB.
 */
/// <reference types="sql.js" />
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import initSqlJs from 'sql.js';
import type { ModelUsage } from './types';
import type { UriLike } from './opencode';
import { normalizePathForComparison } from './utils/pathUtils';
import { readDbBufferWithWalFingerprint } from './utils/sqliteWal';

type SqlJsStatic = initSqlJs.SqlJsStatic;

/** Rows in sql.js's `db.exec()` shape, which every query backend below normalizes to. */
interface QueryResult { columns: string[]; values: unknown[][] }

/** Bound query parameter types accepted by both the node:sqlite and sql.js backends. */
type QueryParam = string | number | null;

const EMPTY_RESULT: QueryResult = { columns: [], values: [] };

interface CursorComposerCacheEntry {
	data: CursorComposerData | null;
	mtimeMs: number;
	size: number;
	walMtimeMs: number;
	walSize: number;
}

/** The db+wal file identity a query result actually reflects — see `queryAll`'s doc comment. */
interface WalFingerprint {
	mtimeMs: number;
	size: number;
	walMtimeMs: number;
	walSize: number;
}

/** A parsed sql.js `Database` cached for one db path, plus the file identity it was built from. */
interface CursorSqlJsDbCacheEntry {
	db: initSqlJs.Database;
	mtimeMs: number;
	size: number;
	walMtimeMs: number;
	walSize: number;
}

interface CursorComposerData {
	composerId: string;
	name?: string;
	modelConfig?: { modelName?: string };
	contextTokensUsed?: number;
	createdAt?: number;
	lastUpdatedAt?: number;
	status?: string;
	trackedGitRepos?: Array<{ repoPath?: string }>;
	originalFileStates?: { [uri: string]: unknown };
	fullConversationHeadersOnly?: Array<{ type?: number; bubbleId?: string }>;
}

export interface CursorBubble {
	bubbleId: string;
	type: number; // 1 = user, 2 = assistant
	text?: string;
	createdAt?: string;
	capabilityType?: number;
}

export class CursorDataAccess {
	private static readonly COMPOSER_CACHE_MAX_ENTRIES = 2000;
	// How long a db path stays demoted to the sql.js fallback after a failed read-only attempt.
	private static readonly READ_ONLY_RETRY_COOLDOWN_MS = 5 * 60_000;

	private _sqlJsModule: SqlJsStatic | null = null;
	private _sqlJsInitPromise: Promise<SqlJsStatic> | null = null;

	// Read-only node:sqlite backend. `undefined` = not yet probed, `null` = require('node:sqlite')
	// failed (older Electron without native SQLite support) so every db path uses the sql.js
	// fallback instead.
	private _nodeSqliteModule: typeof import('node:sqlite') | null | undefined;
	// Per-db-path memo of a failed read-only open/query (e.g. SQLITE_READONLY_CANTINIT when the
	// -shm sidecar can't be initialised read-only), so a db that can't use the read-only backend
	// doesn't retry that probe on every call — it falls straight to sql.js instead.
	// Stores when the failure happened rather than a bare flag: the demotion expires after
	// READ_ONLY_RETRY_COOLDOWN_MS so a *transient* failure (e.g. SQLITE_BUSY while the writer
	// holds an exclusive lock during its own checkpoint) doesn't strand this db on the expensive
	// copy-based fallback for the rest of the process's life — which would reintroduce exactly
	// the multi-GB copies this class exists to avoid.
	private readonly _readOnlyUnsupportedDbs: Map<string, number> = new Map();

	// Cache of already-parsed composer data blobs. A single session read makes ~4 calls into
	// readComposerData (getTokens/countInteractions/getModelUsage/getSessionMeta, see
	// getSessionData), and discovery walks hundreds of sessions, so without this every one of
	// those re-queries the db. Invalidated per composer by the underlying db file's mtime/size
	// and its -wal sidecar's mtime *and* size (see statWal for why size is part of the key) —
	// cheap to recompute now that a "refresh" is a single-row read-only
	// query rather than a multi-GB copy, so a busy WAL no longer triggers repeated full-database
	// work, only a cache miss on the next read.
	private readonly _composerCache: Map<string, CursorComposerCacheEntry> = new Map();
	// Dedupes concurrent readComposerData() calls for the same virtual path — getSessionData()
	// fires 4 of them via Promise.all before any of them can populate _composerCache above.
	private readonly _composerInflight: Map<string, Promise<CursorComposerData | null>> = new Map();

	// Per-db-path cache of a parsed sql.js Database for the fallback backend (used when
	// node:sqlite is unavailable, or a db is temporarily demoted after a read-only failure).
	// Without this, every distinct composer query on the fallback path reads and reparses the
	// entire db from scratch — and processEcosystemSessionDetails runs several adapter methods
	// concurrently across up to 10 sessions, so one Cursor db could be fully reloaded many times
	// per refresh. Restores the equivalent of the pre-#2033 cached parsed Database, but keyed and
	// invalidated the same way the rest of this file already does (mtime/size + wal mtime/size).
	// Only ever holds a "settled" entry, i.e. one built from a read that positively included
	// whatever was pending in the WAL (`WalReadResult.walIncluded`) — see `getSqlJsDb`.
	private readonly _sqlJsDbCache: Map<string, CursorSqlJsDbCacheEntry> = new Map();
	// Dedupes concurrent fallback queries against the same db path while a (re)load is in flight.
	private readonly _sqlJsDbInflight: Map<string, Promise<CursorSqlJsDbCacheEntry | null>> = new Map();
	// A single trailing slot for the most recent WAL-blind (`walIncluded: false`) parsed Database
	// per db path — still usable for the call that just produced it, but deliberately NOT part of
	// `_sqlJsDbCache` (see `getSqlJsDb`'s doc comment on why a WAL-blind read must not be treated as
	// settled). Held here — rather than closed immediately — only so its underlying WASM memory is
	// still reclaimed (on the next read for the same path, or on `dispose()`) instead of leaking.
	private readonly _pendingTransientSqlJsDb: Map<string, CursorSqlJsDbCacheEntry> = new Map();

	private readonly extensionUri: UriLike;

	constructor(extensionUri: UriLike) {
		this.extensionUri = extensionUri;
	}

	dispose(): void {
		this._composerCache.clear();
		this._composerInflight.clear();
		this._readOnlyUnsupportedDbs.clear();
		this._sqlJsInitPromise = null;
		for (const entry of this._sqlJsDbCache.values()) {
			try { entry.db.close(); } catch { /* ignore */ }
		}
		this._sqlJsDbCache.clear();
		this._sqlJsDbInflight.clear();
		for (const entry of this._pendingTransientSqlJsDb.values()) {
			try { entry.db.close(); } catch { /* ignore */ }
		}
		this._pendingTransientSqlJsDb.clear();
	}

	// ── Path helpers ──────────────────────────────────────────────────────────

	/**
	 * Get the Cursor global storage directory (OS-aware).
	 *   Windows: %APPDATA%\Cursor\User\globalStorage
	 *   macOS:   ~/Library/Application Support/Cursor/User/globalStorage
	 *   Linux:   ~/.config/Cursor/User/globalStorage
	 */
	getCursorGlobalStorageDir(): string {
		const platform = os.platform();
		if (platform === 'win32') {
			const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
			return path.join(appData, 'Cursor', 'User', 'globalStorage');
		}
		if (platform === 'darwin') {
			return path.join(os.homedir(), 'Library', 'Application Support', 'Cursor', 'User', 'globalStorage');
		}
		const xdgConfig = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
		return path.join(xdgConfig, 'Cursor', 'User', 'globalStorage');
	}

	/** Full path to Cursor's global state.vscdb SQLite file. */
	getCursorDbPath(): string {
		return path.join(this.getCursorGlobalStorageDir(), 'state.vscdb');
	}

	/**
	 * Returns true when the given path is a Cursor virtual session path.
	 * Virtual paths contain `state.vscdb#` with a UUID composer ID.
	 */
	isCursorSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		return normalized.includes('/cursor/user/globalstorage/state.vscdb#');
	}

	/**
	 * Extract the absolute path to `state.vscdb` from a virtual session path.
	 * e.g. `C:\...\globalStorage\state.vscdb#<uuid>` → `C:\...\globalStorage\state.vscdb`
	 */
	getDbPathFromVirtual(virtualPath: string): string {
		const idx = virtualPath.indexOf('state.vscdb#');
		if (idx === -1) { return virtualPath; }
		return virtualPath.substring(0, idx + 'state.vscdb'.length);
	}

	/**
	 * Extract the composer UUID from a virtual session path.
	 */
	getComposerIdFromVirtual(virtualPath: string): string | null {
		const idx = virtualPath.indexOf('state.vscdb#');
		if (idx === -1) { return null; }
		return virtualPath.substring(idx + 'state.vscdb#'.length);
	}

	// ── sql.js init ───────────────────────────────────────────────────────────

	async initSqlJs(): Promise<SqlJsStatic> {
		if (this._sqlJsModule) { return this._sqlJsModule; }
		if (!this._sqlJsInitPromise) {
			this._sqlJsInitPromise = (async () => {
				const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
				let wasmBinary: Uint8Array | undefined;
				if (fs.existsSync(wasmPath)) {
					wasmBinary = fs.readFileSync(wasmPath);
				}
				const module = await initSqlJs(wasmBinary ? { wasmBinary: wasmBinary.buffer as ArrayBuffer } : undefined);
				this._sqlJsModule = module;
				return module;
			})().catch(err => {
				this._sqlJsInitPromise = null;
				throw err;
			});
		}
		return this._sqlJsInitPromise;
	}

	// ── Query backends ────────────────────────────────────────────────────────

	/**
	 * The `-wal` sidecar's mtime and size, or zeroes when there is no `-wal` file.
	 *
	 * Size matters as well as mtime: mtime granularity is coarse on some filesystems (whole
	 * seconds on ext3/HFS+/FAT), so two WAL appends inside one tick can leave the mtime — and the
	 * untouched main db's mtime/size — identical, and a cache keyed on those alone would serve a
	 * stale composer blob. WAL frames are appended, so the file grows on every write and the size
	 * moves even when the mtime cannot. One stat, both fields.
	 */
	private statWal(dbPath: string): { mtimeMs: number; size: number } {
		try {
			const stats = fs.statSync(dbPath + '-wal');
			return { mtimeMs: stats.mtimeMs, size: stats.size };
		} catch {
			return { mtimeMs: 0, size: 0 };
		}
	}

	private statDb(dbPath: string): fs.Stats | null {
		try { return fs.statSync(dbPath); } catch { return null; }
	}

	private getNodeSqliteModule(): typeof import('node:sqlite') | null {
		if (this._nodeSqliteModule === undefined) {
			try {
				this._nodeSqliteModule = require('node:sqlite') as typeof import('node:sqlite');
			} catch {
				this._nodeSqliteModule = null;
			}
		}
		return this._nodeSqliteModule;
	}

	/**
	 * True while `dbPath` is still demoted to the sql.js fallback after a recent read-only
	 * failure. The demotion expires so a transient failure doesn't become permanent.
	 */
	private isReadOnlyDemoted(dbPath: string): boolean {
		const failedAt = this._readOnlyUnsupportedDbs.get(dbPath);
		if (failedAt === undefined) { return false; }
		if (Date.now() - failedAt < CursorDataAccess.READ_ONLY_RETRY_COOLDOWN_MS) { return true; }
		this._readOnlyUnsupportedDbs.delete(dbPath);
		return false;
	}

	/**
	 * Preferred backend: a read-only `node:sqlite` connection against the live db file. This
	 * sees another process's pending WAL frames directly, cross-process, with zero copies, and
	 * mutates neither the main db nor the WAL. Opens, queries and closes immediately for every
	 * call — never caches the handle, since a long-lived reader can block the writer's own WAL
	 * checkpointing and make its WAL grow. Returns `null` when this backend can't be used for
	 * `dbPath` (node:sqlite unavailable, or the open/query failed — e.g. `SQLITE_READONLY_CANTINIT`
	 * when the `-shm` sidecar can't be initialised read-only), so the caller can fall back to sql.js.
	 */
	private queryReadOnly(dbPath: string, sql: string, params: QueryParam[]): QueryResult | null {
		const mod = this.getNodeSqliteModule();
		if (!mod || this.isReadOnlyDemoted(dbPath)) { return null; }
		let db: import('node:sqlite').DatabaseSync | undefined;
		try {
			db = new mod.DatabaseSync(dbPath, { readOnly: true });
			const rows = db.prepare(sql).all(...(params as import('node:sqlite').SQLInputValue[])) as Array<Record<string, unknown>>;
			if (rows.length === 0) { return EMPTY_RESULT; }
			const columns = Object.keys(rows[0]);
			const values = rows.map(row => columns.map(col => row[col]));
			return { columns, values };
		} catch {
			this._readOnlyUnsupportedDbs.set(dbPath, Date.now());
			return null;
		} finally {
			if (db) { try { db.close(); } catch { /* ignore */ } }
		}
	}

	/** Closes and drops the cached sql.js Database for `dbPath`, if any. */
	private evictSqlJsDb(dbPath: string): void {
		const existing = this._sqlJsDbCache.get(dbPath);
		if (!existing) { return; }
		try { existing.db.close(); } catch { /* ignore */ }
		this._sqlJsDbCache.delete(dbPath);
	}

	/** Closes and drops the single trailing WAL-blind (transient) Database for `dbPath`, if any. */
	private releasePendingTransientSqlJsDb(dbPath: string): void {
		const pending = this._pendingTransientSqlJsDb.get(dbPath);
		if (!pending) { return; }
		try { pending.db.close(); } catch { /* ignore */ }
		this._pendingTransientSqlJsDb.delete(dbPath);
	}

	/** True when `entry`'s file-identity fields match the fingerprint a read actually reported. */
	private sqlJsEntryMatchesFingerprint(entry: CursorSqlJsDbCacheEntry | undefined, fp: WalFingerprint): boolean {
		return !!entry && entry.mtimeMs === fp.mtimeMs && entry.size === fp.size
			&& entry.walMtimeMs === fp.walMtimeMs && entry.walSize === fp.walSize;
	}

	/**
	 * Returns a cached, already-parsed sql.js `Database` for `dbPath` (with any pending WAL frames
	 * merged in via the shared, hardened helper — see src/utils/sqliteWal.ts), reloading only when
	 * the underlying file identity (mtime/size + wal mtime/size, same basis `_composerCache` uses)
	 * has changed. Without this, every distinct composer on the fallback path would re-read and
	 * re-parse the whole db (see class-level `_sqlJsDbCache` doc comment). Single-flight per db
	 * path so concurrent fallback queries share one (re)load instead of racing.
	 *
	 * The fresh-stat check below is only a CHEAP pre-check for "should we even attempt a read" — it
	 * decides whether to call `readDbBufferWithWalFingerprint` at all, not whether to reparse. A
	 * throttled read inside sqliteWal.ts can honestly report the SAME original fingerprint as what
	 * is already cached here (nothing actually changed, it was just served from that module's own
	 * throttle), and reparsing on every such call would defeat this very cache in exactly the
	 * busy-WAL scenario it exists for — see #2036 review notes (Fix 1). So after the read, the
	 * decision to reparse is made again from the read's OWN reported fingerprint, not another fresh
	 * stat.
	 */
	private async getSqlJsDb(dbPath: string): Promise<CursorSqlJsDbCacheEntry | null> {
		const stats = this.statDb(dbPath);
		if (!stats) {
			this.evictSqlJsDb(dbPath);
			return null;
		}
		const wal = this.statWal(dbPath);
		const cached = this._sqlJsDbCache.get(dbPath);
		if (this.sqlJsEntryMatchesFingerprint(cached, { mtimeMs: stats.mtimeMs, size: stats.size, walMtimeMs: wal.mtimeMs, walSize: wal.size })) {
			return cached as CursorSqlJsDbCacheEntry;
		}

		const inflight = this._sqlJsDbInflight.get(dbPath);
		if (inflight) { return inflight; }

		const promise = (async (): Promise<CursorSqlJsDbCacheEntry | null> => {
			try {
				const SQL = await this.initSqlJs();
				const result = await readDbBufferWithWalFingerprint(dbPath);
				const resultFp: WalFingerprint = { mtimeMs: result.dbMtimeMs, size: result.dbSize, walMtimeMs: result.walMtimeMs, walSize: result.walSize };

				// The cheap pre-check above used a fresh WAL stat and found a possible change, but
				// the read itself may have been served from sqliteWal's own throttle under the
				// buffer's ORIGINAL fingerprint — i.e. nothing actually changed since the db already
				// persisted here was built. Reuse it rather than reparsing bytes we already have
				// parsed. Deliberately checked against ONLY the persisted (settled, walIncluded:true)
				// cache here, never the transient slot: a WAL-blind read's fingerprint can be
				// byte-for-byte identical to a LATER, genuinely walIncluded:true merge of that same
				// (unchanged-on-disk) WAL — the fingerprint tuple alone can't tell "still blind"
				// apart from "now included" in that case, so matching against a stale transient
				// entry here could wrongly serve pre-merge content as if it were the fresh merge.
				const persisted = this._sqlJsDbCache.get(dbPath);
				if (this.sqlJsEntryMatchesFingerprint(persisted, resultFp)) {
					return persisted as CursorSqlJsDbCacheEntry;
				}
				// A still-blind read reporting the exact same fingerprint as the last still-blind
				// read is unambiguous, though (neither included the WAL, and nothing about the files
				// changed) — safe to reuse rather than reparsing the identical bytes again.
				if (!result.walIncluded) {
					const pendingTransient = this._pendingTransientSqlJsDb.get(dbPath);
					if (this.sqlJsEntryMatchesFingerprint(pendingTransient, resultFp)) {
						return pendingTransient as CursorSqlJsDbCacheEntry;
					}
				}

				const db = new SQL.Database(result.buffer);
				const entry: CursorSqlJsDbCacheEntry = { db, ...resultFp };

				if (!result.walIncluded) {
					// A WAL-blind plain read (see sqliteWal.ts) — usable for this one call, but not
					// safe to treat as "caught up": persisting it into the long-lived cache would let
					// a later WAL-quiet moment look identical to a genuinely caught-up read, hiding
					// committed rows never checkpointed into the main file — see #2036 review notes
					// (Fix 3). Keep it only in the single trailing transient slot instead.
					this.releasePendingTransientSqlJsDb(dbPath);
					this._pendingTransientSqlJsDb.set(dbPath, entry);
					return entry;
				}

				this.evictSqlJsDb(dbPath); // close whatever was cached before replacing it
				this.releasePendingTransientSqlJsDb(dbPath);
				this._sqlJsDbCache.set(dbPath, entry);
				return entry;
			} catch {
				return null;
			}
		})();
		this._sqlJsDbInflight.set(dbPath, promise);
		try {
			return await promise;
		} finally {
			if (this._sqlJsDbInflight.get(dbPath) === promise) {
				this._sqlJsDbInflight.delete(dbPath);
			}
		}
	}

	/**
	 * Fallback backend for when the read-only connection can't be used: queries a per-db-path
	 * cached sql.js `Database` (see `getSqlJsDb`) and reports the db+wal fingerprint those bytes
	 * were actually built from, so callers can key their own caches on it instead of re-statting
	 * the live files afterwards (a served buffer can be older than "now" — see sqliteWal.ts).
	 */
	private async queryViaSqlJs(dbPath: string, sql: string, params: QueryParam[]): Promise<{ result: QueryResult; fingerprint: WalFingerprint } | null> {
		const entry = await this.getSqlJsDb(dbPath);
		if (!entry) { return null; }
		try {
			const result = entry.db.exec(sql, params);
			return {
				result: result.length === 0 ? EMPTY_RESULT : result[0],
				fingerprint: { mtimeMs: entry.mtimeMs, size: entry.size, walMtimeMs: entry.walMtimeMs, walSize: entry.walSize },
			};
		} catch {
			// A query failing against an otherwise-successfully-opened db is unusual (e.g. a
			// concurrent write corrupted the cached parse) — evict it so a broken instance isn't
			// reused, rather than silently caching a source of repeated failures.
			this.evictSqlJsDb(dbPath);
			return null;
		}
	}

	/**
	 * Runs `sql` against `dbPath` and returns rows in sql.js's `{ columns, values }` shape,
	 * preferring the copy-free read-only backend and falling back to sql.js when that isn't
	 * available for this db.
	 *
	 * Returns `null` when both backends failed to read `dbPath` at all — a transient failure,
	 * distinct from a successful read that legitimately found zero rows (`{ result: EMPTY_RESULT,
	 * ... }`, e.g. when the db file doesn't exist). Callers that cache "not found" must not do so
	 * for a `null` return, only for a real (possibly empty) `QueryResult` — see `queryComposerData`,
	 * which is why this distinction exists.
	 *
	 * `fingerprint` is non-null only when the sql.js fallback served the rows — the read-only
	 * backend reads the live file directly, so there is no separate "as of" state to report; a
	 * caller that needs a stat for that path should take a fresh one, since that read has no
	 * staleness window.
	 */
	private async queryAll(dbPath: string, sql: string, params: QueryParam[] = []): Promise<{ result: QueryResult; fingerprint: WalFingerprint | null } | null> {
		if (!this.statDb(dbPath)) { return { result: EMPTY_RESULT, fingerprint: null }; } // no db file — genuinely nothing there, not a failure
		const readOnlyResult = this.queryReadOnly(dbPath, sql, params);
		if (readOnlyResult) { return { result: readOnlyResult, fingerprint: null }; }
		return this.queryViaSqlJs(dbPath, sql, params); // null on failure propagates as-is
	}

	private evictComposerCacheIfOverCapacity(): void {
		while (this._composerCache.size > CursorDataAccess.COMPOSER_CACHE_MAX_ENTRIES) {
			const oldestKey = this._composerCache.keys().next().value;
			if (oldestKey === undefined) { break; }
			this._composerCache.delete(oldestKey);
		}
	}

	// ── Data access ───────────────────────────────────────────────────────────

	/**
	 * Read and parse the composer data blob for a session.
	 */
	async readComposerData(virtualPath: string): Promise<CursorComposerData | null> {
		const dbPath = this.getDbPathFromVirtual(virtualPath);
		const composerId = this.getComposerIdFromVirtual(virtualPath);
		if (!composerId) { return null; }

		const stats = this.statDb(dbPath);
		const wal = this.statWal(dbPath);
		if (stats) {
			const cached = this._composerCache.get(virtualPath);
			if (cached && cached.mtimeMs === stats.mtimeMs && cached.size === stats.size
				&& cached.walMtimeMs === wal.mtimeMs && cached.walSize === wal.size) {
				return cached.data;
			}
		}

		const inflight = this._composerInflight.get(virtualPath);
		if (inflight) { return inflight; }

		const promise = (async () => {
			const outcome = await this.queryComposerData(dbPath, composerId);
			// A `null` outcome means the read itself failed (both backends), not that the composer
			// genuinely doesn't exist — don't cache that, or a transient failure becomes sticky
			// until the file's identity happens to change. Only cache a real result (row present
			// or genuinely absent).
			if (outcome && stats) {
				// The bytes queryComposerData actually read can be older than the `stats`/`wal`
				// captured above (the sql.js fallback may have served a throttled, stale buffer) —
				// key the cache entry on the fingerprint those bytes were actually produced from,
				// falling back to the pre-query stat only when the query didn't go through that
				// path (outcome.fingerprint is null for the live read-only backend).
				const fp = outcome.fingerprint ?? { mtimeMs: stats.mtimeMs, size: stats.size, walMtimeMs: wal.mtimeMs, walSize: wal.size };
				this._composerCache.set(virtualPath, {
					data: outcome.data, mtimeMs: fp.mtimeMs, size: fp.size, walMtimeMs: fp.walMtimeMs, walSize: fp.walSize,
				});
				this.evictComposerCacheIfOverCapacity();
			}
			return outcome ? outcome.data : null;
		})();
		this._composerInflight.set(virtualPath, promise);
		try {
			return await promise;
		} finally {
			if (this._composerInflight.get(virtualPath) === promise) {
				this._composerInflight.delete(virtualPath);
			}
		}
	}

	/**
	 * Returns `null` when the underlying read failed (both backends) — distinct from
	 * `{ data: null, ... }`, which means the read succeeded and the composer genuinely doesn't
	 * exist. `readComposerData` relies on this distinction to avoid caching a transient failure as
	 * "not found" (see its doc comment).
	 */
	private async queryComposerData(dbPath: string, composerId: string): Promise<{ data: CursorComposerData | null; fingerprint: WalFingerprint | null } | null> {
		const outcome = await this.queryAll(
			dbPath,
			"SELECT value FROM cursorDiskKV WHERE key = ?",
			[`composerData:${composerId}`]
		);
		if (!outcome) { return null; } // both backends failed — a transient failure, not "not found"
		if (outcome.result.values.length === 0) { return { data: null, fingerprint: outcome.fingerprint }; }
		try {
			const raw = outcome.result.values[0][0] as string;
			return { data: JSON.parse(raw) as CursorComposerData, fingerprint: outcome.fingerprint };
		} catch {
			return null; // malformed JSON — treat as a read failure, not "not found"; retry next call
		}
	}

	/**
	 * Read bubble data for a set of bubble IDs within a session.
	 * Each bubble holds the actual message text (user or assistant).
	 */
	async readBubbles(virtualPath: string, bubbleIds: string[]): Promise<Map<string, CursorBubble>> {
		if (bubbleIds.length === 0) { return new Map(); }
		const dbPath = this.getDbPathFromVirtual(virtualPath);
		const composerId = this.getComposerIdFromVirtual(virtualPath);
		if (!composerId) { return new Map(); }
		const map = new Map<string, CursorBubble>();
		try {
			const placeholders = bubbleIds.map(() => '?').join(',');
			const keys = bubbleIds.map(id => `bubbleId:${composerId}:${id}`);
			const outcome = await this.queryAll(
				dbPath,
				`SELECT key, value FROM cursorDiskKV WHERE key IN (${placeholders})`,
				keys
			);
			if (!outcome) { return map; } // both backends failed — treat like "no bubbles found this time"
			for (const row of outcome.result.values) {
				const key = row[0] as string;
				const raw = row[1] as string;
				const bubbleId = key.replace(`bubbleId:${composerId}:`, '');
				try {
					const bubble = JSON.parse(raw) as CursorBubble;
					map.set(bubbleId, bubble);
				} catch { /* ignore malformed entries */ }
			}
		} catch { /* ignore DB errors */ }
		return map;
	}

	/**
	 * Discover all composer session IDs in the global state.vscdb.
	 * Returns virtual paths in the form `<dbPath>#<composerId>`.
	 */
	async discoverSessions(): Promise<string[]> {
		const dbPath = this.getCursorDbPath();
		try {
			// Keys are `composerData:<uuid>` — exclude sub-keys like `composerData:<uuid>:<other>`
			const outcome = await this.queryAll(
				dbPath,
				"SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%' AND (length(key) - length(replace(key, ':', ''))) = 1"
			);
			if (!outcome) { return []; } // both backends failed this call — not "no sessions"
			return outcome.result.values.map((row: unknown[]) => {
				const composerId = (row[0] as string).replace('composerData:', '');
				return `${dbPath}#${composerId}`;
			});
		} catch {
			return [];
		}
	}

	/**
	 * Stat the underlying `state.vscdb` file for a virtual session path.
	 */
	async statSessionFile(virtualPath: string): Promise<fs.Stats> {
		const dbPath = this.getDbPathFromVirtual(virtualPath);
		return fs.promises.stat(dbPath);
	}

	/**
	 * Get token counts for a session.
	 * Cursor only stores `contextTokensUsed` (current prompt context size, input tokens).
	 * Output tokens are not tracked in the SQLite DB.
	 */
	async getTokens(virtualPath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const data = await this.readComposerData(virtualPath);
		if (!data) { return { tokens: 0, thinkingTokens: 0 }; }
		const contextTokens = typeof data.contextTokensUsed === 'number' ? data.contextTokensUsed : 0;
		return { tokens: contextTokens, thinkingTokens: 0 };
	}

	/**
	 * Count user interactions (type === 1 entries in fullConversationHeadersOnly).
	 */
	async countInteractions(virtualPath: string): Promise<number> {
		const data = await this.readComposerData(virtualPath);
		if (!data?.fullConversationHeadersOnly) { return 0; }
		return data.fullConversationHeadersOnly.filter(h => h.type === 1).length;
	}

	/**
	 * Build per-model token usage for a session.
	 * Cursor only has context window (input) tokens; output tokens are unavailable.
	 * All tokens are attributed to the session's configured model.
	 */
	async getModelUsage(virtualPath: string): Promise<ModelUsage> {
		const data = await this.readComposerData(virtualPath);
		if (!data) { return {}; }
		const contextTokens = typeof data.contextTokensUsed === 'number' ? data.contextTokensUsed : 0;
		if (contextTokens === 0) { return {}; }
		const model = data.modelConfig?.modelName || 'unknown';
		return {
			[model]: { inputTokens: contextTokens, outputTokens: 0, sessions: 0 }
		};
	}

	/**
	 * Extract session metadata: title, timestamps, workspace path.
	 * Timestamps are already in milliseconds in Cursor's storage.
	 */
	async getSessionMeta(virtualPath: string): Promise<{
		title: string | undefined;
		firstInteraction: string | null;
		lastInteraction: string | null;
		workspacePath: string | undefined;
	}> {
		const data = await this.readComposerData(virtualPath);
		if (!data) {
			return { title: undefined, firstInteraction: null, lastInteraction: null, workspacePath: undefined };
		}
		const title = data.name && data.name.trim() ? data.name.trim() : undefined;
		const createdAt = typeof data.createdAt === 'number' ? data.createdAt : null;
		const lastUpdatedAt = typeof data.lastUpdatedAt === 'number' ? data.lastUpdatedAt : null;
		const firstInteraction = createdAt ? new Date(createdAt).toISOString() : null;
		const lastInteraction = lastUpdatedAt ? new Date(lastUpdatedAt) : createdAt ? new Date(createdAt) : null;
		const workspacePath = this.extractWorkspacePath(data);
		return {
			title,
			firstInteraction,
			lastInteraction: lastInteraction ? lastInteraction.toISOString() : null,
			workspacePath,
		};
	}

	private extractWorkspacePath(data: CursorComposerData): string | undefined {
		if (data.trackedGitRepos && data.trackedGitRepos.length > 0) {
			return data.trackedGitRepos[0].repoPath;
		}
		return this.extractWorkspaceFromFileStates(data.originalFileStates);
	}

	private extractWorkspaceFromFileStates(fileStates: { [uri: string]: unknown } | undefined): string | undefined {
		if (!fileStates) { return undefined; }
		const uris = Object.keys(fileStates);
		if (uris.length === 0) { return undefined; }
		// URI format: file:///c%3A/Users/.../repo/file.ts → c:\Users\...\repo
		try {
			return decodeURIComponent(uris[0].replace('file:///', '').replace('file://', ''))
				.replace(/^\/([A-Za-z]):/, '$1:')  // Windows: /c:/... → c:/...
				.split(/[/\\]/).slice(0, -1).join(path.sep);
		} catch {
			return undefined;
		}
	}

	/**
	 * Returns a unified session data object for backend sync.
	 */
	async getSessionData(virtualPath: string): Promise<{
		tokens: number;
		interactions: number;
		modelUsage: ModelUsage;
		timestamp: number;
	}> {
		const [{ tokens }, interactions, modelUsage, meta] = await Promise.all([
			this.getTokens(virtualPath),
			this.countInteractions(virtualPath),
			this.getModelUsage(virtualPath),
			this.getSessionMeta(virtualPath),
		]);
		const timestamp = meta.firstInteraction ? new Date(meta.firstInteraction).getTime() : Date.now();
		return { tokens, interactions, modelUsage, timestamp };
	}
}
