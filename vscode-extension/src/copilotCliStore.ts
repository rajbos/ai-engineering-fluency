/**
 * CopilotCliStoreAccess — reads session metadata from ~/.copilot/session-store.db.
 *
 * The Copilot CLI persists all sessions (both worktree-backed and chat-only) in a
 * central SQLite database at ~/.copilot/session-store.db. Worktree sessions also
 * produce an events.jsonl file under ~/.copilot/session-state/<uuid>/; chat-only
 * sessions (started without any project open, repository IS NULL) exist only in
 * the database.
 *
 * Virtual path scheme: <absolute-path-to-db>#<session-uuid>
 * Example (Windows): C:\Users\alice\.copilot\session-store.db#3ee22c56-...
 * Example (Unix):    /home/alice/.copilot/session-store.db#3ee22c56-...
 *
 * The '#' character acts as a separator identical to the pattern used by Crush
 * (crush.db#<uuid>) and OpenCode (opencode.db#ses_<id>).
 */
/// <reference types="sql.js" />
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import initSqlJs from 'sql.js';
import { toLocalDayKey } from './utils/dayKeys';

// Access SqlJsStatic and Database via the globally declared initSqlJs namespace
// (made available by the /// <reference types="sql.js" /> directive above).
type SqlJsStatic = initSqlJs.SqlJsStatic;
type SqlDatabase = initSqlJs.Database;

export interface CliStoreSession {
	id: string;
	repository: string | null;
	branch: string | null;
	summary: string | null;
	created_at: string | null;
	updated_at: string | null;
}

export interface CliStoreTurn {
	session_id: string;
	turn_index: number;
	user_message: string | null;
	assistant_response: string | null;
	timestamp: string | null;
}

export function isCliStoreSession(obj: unknown): obj is CliStoreSession {
	if (typeof obj !== 'object' || obj === null) { return false; }
	const r = obj as Record<string, unknown>;
	return typeof r['id'] === 'string'
		&& (r['repository'] === null || typeof r['repository'] === 'string')
		&& (r['branch'] === null || typeof r['branch'] === 'string')
		&& (r['summary'] === null || typeof r['summary'] === 'string')
		&& (r['created_at'] === null || typeof r['created_at'] === 'string')
		&& (r['updated_at'] === null || typeof r['updated_at'] === 'string');
}

export function isCliStoreTurn(obj: unknown): obj is CliStoreTurn {
	if (typeof obj !== 'object' || obj === null) { return false; }
	const r = obj as Record<string, unknown>;
	return typeof r['session_id'] === 'string'
		&& typeof r['turn_index'] === 'number'
		&& (r['user_message'] === null || typeof r['user_message'] === 'string')
		&& (r['assistant_response'] === null || typeof r['assistant_response'] === 'string')
		&& (r['timestamp'] === null || typeof r['timestamp'] === 'string');
}

type CliStoreDbCacheEntry = { db: SqlDatabase; mtimeMs: number; size: number };

export class CopilotCliStoreAccess {
	private _sqlJsModule: SqlJsStatic | null = null;
	private _sqlJsInitPromise: Promise<SqlJsStatic> | null = null;
	private _dbCache: Map<string, CliStoreDbCacheEntry> = new Map();
	private _dbCacheInflight: Map<string, Promise<SqlDatabase | null>> = new Map();

	dispose(): void {
		for (const entry of this._dbCache.values()) {
			try { entry.db.close(); } catch { /* ignore */ }
		}
		this._dbCache.clear();
		this._dbCacheInflight.clear();
		this._sqlJsInitPromise = null;
	}

	private closeDb(db: SqlDatabase): void {
		try { db.close(); } catch { /* ignore */ }
	}

	private isMissingFileError(error: unknown): boolean {
		const code = (error as NodeJS.ErrnoException)?.code;
		return code === 'ENOENT' || code === 'ENOTDIR';
	}

	private async statDb(dbPath: string): Promise<fs.Stats | null> {
		try {
			return await fs.promises.stat(dbPath);
		} catch (error) {
			if (this.isMissingFileError(error) && this._dbCache.has(dbPath)) {
				this.closeDb(this._dbCache.get(dbPath)!.db);
				this._dbCache.delete(dbPath);
			}
			return null;
		}
	}

	private isCachedDbCurrent(dbPath: string, stats: fs.Stats): boolean {
		const entry = this._dbCache.get(dbPath);
		return !!entry && entry.mtimeMs === stats.mtimeMs && entry.size === stats.size;
	}

	private getDbCacheKey(dbPath: string, stats: fs.Stats): string {
		return `${dbPath}:${stats.mtimeMs}:${stats.size}`;
	}

	private sameDbStats(left: fs.Stats, right: fs.Stats): boolean {
		return left.mtimeMs === right.mtimeMs && left.size === right.size;
	}

	private async refreshDb(dbPath: string, stats: fs.Stats): Promise<SqlDatabase | null> {
		let db: SqlDatabase;
		try {
			const SQL = await this.initSqlJs();
			const buffer = await fs.promises.readFile(dbPath);
			db = new SQL.Database(buffer);
		} catch {
			return this._dbCache.get(dbPath)?.db ?? null;
		}

		const currentStats = await this.statDb(dbPath);
		if (!currentStats || !this.sameDbStats(stats, currentStats)) {
			this.closeDb(db);
			return this._dbCache.get(dbPath)?.db ?? null;
		}

		const existing = this._dbCache.get(dbPath);
		if (existing) { this.closeDb(existing.db); }
		this._dbCache.set(dbPath, { db, mtimeMs: stats.mtimeMs, size: stats.size });
		return db;
	}

	/**
	 * Returns a cached SQL.Database instance for the session-store.db path,
	 * re-opening only when the file's mtime or size changes.
	 *
	 * Uses single-flight deduplication to prevent concurrent callers from each
	 * re-reading the DB file and leaving instances unclosed.
	 */
	private async getDb(dbPath: string): Promise<SqlDatabase | null> {
		const stats = await this.statDb(dbPath);
		if (!stats) { return this._dbCache.get(dbPath)?.db ?? null; }

		if (this.isCachedDbCurrent(dbPath, stats)) {
			return this._dbCache.get(dbPath)!.db;
		}

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

	/** Absolute path to ~/.copilot/session-store.db. */
	getDbPath(): string {
		return path.join(os.homedir(), '.copilot', 'session-store.db');
	}

	/** Build a virtual session path for the given session UUID. */
	virtualPath(sessionId: string): string {
		return `${this.getDbPath()}#${sessionId}`;
	}

	/** Returns true if the path is a session-store virtual path. */
	isCliStoreSession(filePath: string): boolean {
		return filePath.includes('session-store.db#');
	}

	/** Extract the real DB file path from a virtual session path. */
	getDbPathFromVirtual(virtualPath: string): string {
		const idx = virtualPath.indexOf('session-store.db#');
		if (idx === -1) { return virtualPath; }
		return virtualPath.substring(0, idx + 'session-store.db'.length);
	}

	/** Extract the session UUID from a virtual session path. */
	getSessionId(virtualPath: string): string | null {
		const idx = virtualPath.indexOf('session-store.db#');
		if (idx === -1) { return null; }
		const id = virtualPath.substring(idx + 'session-store.db#'.length);
		return id || null;
	}

	/** Stat the underlying session-store.db file. */
	async stat(virtualPath: string): Promise<fs.Stats> {
		return fs.promises.stat(this.getDbPathFromVirtual(virtualPath));
	}

	/** Lazily initialise and cache the sql.js WASM module. */
	async initSqlJs(): Promise<SqlJsStatic> {
		if (this._sqlJsModule) { return this._sqlJsModule; }
		if (!this._sqlJsInitPromise) {
			this._sqlJsInitPromise = (async () => {
				const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
				let wasmBinary: Uint8Array | undefined;
				try {
					wasmBinary = await fs.promises.readFile(wasmPath);
				} catch { /* WASM file not present — proceed without pre-loaded binary */ }
				const module = await initSqlJs(wasmBinary ? { wasmBinary } : undefined);
				this._sqlJsModule = module;
				return module;
			})().catch(err => {
				this._sqlJsInitPromise = null;
				throw err;
			});
		}
		return this._sqlJsInitPromise;
	}

	/**
	 * Discover all session IDs in the DB whose UUIDs are NOT in `knownUuids`.
	 * These are sessions that exist only in the DB (no events.jsonl on disk).
	 * Returned in descending updated_at order (most recent first).
	 */
	async discoverNewSessions(knownUuids: Set<string>): Promise<string[]> {
		const dbPath = this.getDbPath();
		const db = await this.getDb(dbPath);
		if (!db) { return []; }
		try {
			const result = db.exec('SELECT id FROM sessions ORDER BY updated_at DESC');
			if (result.length === 0) { return []; }
			return result[0].values
				.map(row => row[0] as string)
				.filter(id => !knownUuids.has(id));
		} catch {
			return [];
		}
	}

	/** Read session metadata for a virtual session path. */
	async readSession(virtualPath: string): Promise<CliStoreSession | null> {
		const dbPath = this.getDbPathFromVirtual(virtualPath);
		const sessionId = this.getSessionId(virtualPath);
		if (!sessionId) { return null; }
		const db = await this.getDb(dbPath);
		if (!db) { return null; }
		try {
			const result = db.exec(
				'SELECT id, repository, branch, summary, created_at, updated_at FROM sessions WHERE id = ?',
				[sessionId],
			);
			if (result.length === 0 || result[0].values.length === 0) { return null; }
			const cols = result[0].columns;
			const row = result[0].values[0];
			const obj: Record<string, unknown> = {};
			cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
			if (!isCliStoreSession(obj)) { return null; }
			return obj;
		} catch {
			return null;
		}
	}

	/** Read all turns for a session, ordered by turn_index. */
	async getTurns(virtualPath: string): Promise<CliStoreTurn[]> {
		const dbPath = this.getDbPathFromVirtual(virtualPath);
		const sessionId = this.getSessionId(virtualPath);
		if (!sessionId) { return []; }
		const db = await this.getDb(dbPath);
		if (!db) { return []; }
		try {
			const result = db.exec(
				'SELECT session_id, turn_index, user_message, assistant_response, timestamp FROM turns WHERE session_id = ? ORDER BY turn_index ASC',
				[sessionId],
			);
			if (result.length === 0) { return []; }
			const cols = result[0].columns;
			const turns: CliStoreTurn[] = [];
			for (const row of result[0].values) {
				const obj: Record<string, unknown> = {};
				cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
				if (isCliStoreTurn(obj)) {
					turns.push(obj);
				}
			}
			return turns;
		} catch {
			return [];
		}
	}

	/** Count turns (user interactions) for a session. */
	async countTurns(virtualPath: string): Promise<number> {
		const dbPath = this.getDbPathFromVirtual(virtualPath);
		const sessionId = this.getSessionId(virtualPath);
		if (!sessionId) { return 0; }
		const db = await this.getDb(dbPath);
		if (!db) { return 0; }
		try {
			const result = db.exec(
				'SELECT COUNT(*) FROM turns WHERE session_id = ?',
				[sessionId],
			);
			if (result.length === 0 || result[0].values.length === 0) { return 0; }
			return (result[0].values[0][0] as number) || 0;
		} catch {
			return 0;
		}
	}

	/**
	 * Returns per-local-day fractions for accurate session attribution.
	 * Uses turn timestamps when available; falls back to a single entry at
	 * the session's updated_at date.
	 */
	async getDailyFractions(virtualPath: string): Promise<Record<string, number>> {
		const turns = await this.getTurns(virtualPath);
		const counts: Record<string, number> = {};
		let total = 0;
		for (const turn of turns) {
			if (!turn.timestamp) { continue; }
			try {
				const dateKey = toLocalDayKey(new Date(turn.timestamp));
				counts[dateKey] = (counts[dateKey] || 0) + 1;
				total++;
			} catch { /* skip malformed timestamp */ }
		}
		if (total === 0) {
			// Fallback: use session updated_at
			const session = await this.readSession(virtualPath);
			const fallbackDate = session?.updated_at
				? toLocalDayKey(new Date(session.updated_at))
				: toLocalDayKey(new Date());
			return { [fallbackDate]: 1.0 };
		}
		const fractions: Record<string, number> = {};
		for (const [day, count] of Object.entries(counts)) {
			fractions[day] = count / total;
		}
		return fractions;
	}
}
