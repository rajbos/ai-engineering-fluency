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

type SqlJsStatic = initSqlJs.SqlJsStatic;
type SqlDatabase = initSqlJs.Database;

type CursorDbCacheEntry = { db: SqlDatabase; mtimeMs: number; size: number; walMtimeMs: number };

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
	private _sqlJsModule: SqlJsStatic | null = null;
	private _sqlJsInitPromise: Promise<SqlJsStatic> | null = null;
	private _dbCache: Map<string, CursorDbCacheEntry> = new Map();
	private _dbCacheInflight: Map<string, Promise<SqlDatabase | null>> = new Map();
	private readonly extensionUri: UriLike;

	constructor(extensionUri: UriLike) {
		this.extensionUri = extensionUri;
	}

	dispose(): void {
		for (const entry of this._dbCache.values()) {
			try { entry.db.close(); } catch { /* ignore */ }
		}
		this._dbCache.clear();
		this._dbCacheInflight.clear();
		this._sqlJsInitPromise = null;
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

	// ── DB caching ────────────────────────────────────────────────────────────

	private getWalMtimeMs(dbPath: string): number {
		try { return fs.statSync(dbPath + '-wal').mtimeMs; } catch { return 0; }
	}

	private statDb(dbPath: string): fs.Stats | null {
		try {
			return fs.statSync(dbPath);
		} catch (error) {
			const code = (error as NodeJS.ErrnoException)?.code;
			if ((code === 'ENOENT' || code === 'ENOTDIR') && this._dbCache.has(dbPath)) {
				try { this._dbCache.get(dbPath)!.db.close(); } catch { /* ignore */ }
				this._dbCache.delete(dbPath);
			}
			return null;
		}
	}

	private isCachedDbCurrent(dbPath: string, stats: fs.Stats): boolean {
		const entry = this._dbCache.get(dbPath);
		return !!entry && entry.mtimeMs === stats.mtimeMs && entry.size === stats.size
			&& entry.walMtimeMs === this.getWalMtimeMs(dbPath);
	}

	/**
	 * When an active WAL file is present, sql.js cannot see uncommitted WAL frames.
	 * Copies the DB + WAL to a temp location, uses node:sqlite to checkpoint the WAL,
	 * and returns the merged buffer for sql.js. Falls back to null if unavailable.
	 */
	private async tryReadDbWithWal(dbPath: string): Promise<Buffer | null> {
		const walPath = dbPath + '-wal';
		let walSize: number;
		try { walSize = fs.statSync(walPath).size; } catch { return null; }
		if (walSize === 0) { return null; }
		try {
			const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
			const tmpDir = os.tmpdir();
			const tmpDb = path.join(tmpDir, `cursor-wal-${Date.now()}.db`);
			const tmpWal = tmpDb + '-wal';
			const tmpShm = tmpDb + '-shm';
			const shmPath = dbPath + '-shm';
			fs.copyFileSync(dbPath, tmpDb);
			fs.copyFileSync(walPath, tmpWal);
			if (fs.existsSync(shmPath)) { fs.copyFileSync(shmPath, tmpShm); }
			const nativeDb = new DatabaseSync(tmpDb);
			nativeDb.exec('PRAGMA wal_checkpoint(TRUNCATE);');
			nativeDb.close();
			const buffer = fs.readFileSync(tmpDb);
			for (const f of [tmpDb, tmpWal, tmpShm]) { try { fs.unlinkSync(f); } catch { /* ignore */ } }
			return buffer;
		} catch {
			return null;
		}
	}

	private async refreshDb(dbPath: string, stats: fs.Stats): Promise<SqlDatabase | null> {
		const walMtimeMs = this.getWalMtimeMs(dbPath);
		let db: SqlDatabase;
		try {
			const SQL = await this.initSqlJs();
			const walBuffer = await this.tryReadDbWithWal(dbPath);
			const buffer = walBuffer ?? fs.readFileSync(dbPath);
			db = new SQL.Database(buffer);
		} catch {
			return this._dbCache.get(dbPath)?.db ?? null;
		}

		const currentStats = this.statDb(dbPath);
		if (!currentStats || currentStats.mtimeMs !== stats.mtimeMs || currentStats.size !== stats.size) {
			try { db.close(); } catch { /* ignore */ }
			return this._dbCache.get(dbPath)?.db ?? null;
		}

		const existing = this._dbCache.get(dbPath);
		if (existing) { try { existing.db.close(); } catch { /* ignore */ } }
		this._dbCache.set(dbPath, { db, mtimeMs: stats.mtimeMs, size: stats.size, walMtimeMs });
		return db;
	}

	private async getDb(dbPath: string): Promise<SqlDatabase | null> {
		const stats = this.statDb(dbPath);
		if (!stats) { return this._dbCache.get(dbPath)?.db ?? null; }
		if (this.isCachedDbCurrent(dbPath, stats)) {
			return this._dbCache.get(dbPath)!.db;
		}
		const cacheKey = `${dbPath}:${stats.mtimeMs}:${stats.size}:wal${this.getWalMtimeMs(dbPath)}`;
		const inflight = this._dbCacheInflight.get(cacheKey);
		if (inflight) { return inflight; }
		const promise = this.refreshDb(dbPath, stats);
		this._dbCacheInflight.set(cacheKey, promise);
		try {
			return await promise;
		} finally {
			if (this._dbCacheInflight.get(cacheKey) === promise) {
				this._dbCacheInflight.delete(cacheKey);
			}
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
		const db = await this.getDb(dbPath);
		if (!db) { return null; }
		try {
			const result = db.exec(
				"SELECT value FROM cursorDiskKV WHERE key = ?",
				[`composerData:${composerId}`]
			);
			if (result.length === 0 || result[0].values.length === 0) { return null; }
			const raw = result[0].values[0][0] as string;
			return JSON.parse(raw) as CursorComposerData;
		} catch {
			return null;
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
		const db = await this.getDb(dbPath);
		if (!db) { return new Map(); }
		const map = new Map<string, CursorBubble>();
		try {
			const placeholders = bubbleIds.map(() => '?').join(',');
			const keys = bubbleIds.map(id => `bubbleId:${composerId}:${id}`);
			const result = db.exec(
				`SELECT key, value FROM cursorDiskKV WHERE key IN (${placeholders})`,
				keys
			);
			if (result.length === 0) { return map; }
			for (const row of result[0].values) {
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
		const db = await this.getDb(dbPath);
		if (!db) { return []; }
		try {
			// Keys are `composerData:<uuid>` — exclude sub-keys like `composerData:<uuid>:<other>`
			const result = db.exec(
				"SELECT key FROM cursorDiskKV WHERE key LIKE 'composerData:%' AND (length(key) - length(replace(key, ':', ''))) = 1"
			);
			if (result.length === 0) { return []; }
			return result[0].values.map((row: unknown[]) => {
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
			[model]: { inputTokens: contextTokens, outputTokens: 0 }
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
