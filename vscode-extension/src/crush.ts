/**
 * Crush data access layer.
 * Handles reading session data from Crush's per-project SQLite database.
 *
 * Crush (https://charm.sh/crush) is a terminal-based coding agent and successor to OpenCode.
 * Unlike OpenCode (single global DB), Crush creates one `crush.db` per project under `<project>/.crush/`.
 * A global `projects.json` at `%LOCALAPPDATA%/crush/projects.json` (Windows) lists all known projects.
 *
 * Virtual path scheme: `<data_dir>/crush.db#<session_uuid>`
 * Example: `C:\...\repo\.crush\crush.db#c2582fbf-eed8-4fe2-8b30-80129e7373bc`
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as vscode from 'vscode';
import initSqlJs from 'sql.js';
import type { ModelUsage } from './types';

type CrushDbCacheEntry = { db: any; mtimeMs: number; size: number };

export interface CrushProject {
	path: string;
	data_dir: string;
	last_accessed: string;
}

export class CrushDataAccess {
	private _sqlJsModule: any = null;
	private _sqlJsInitPromise: Promise<any> | null = null;
	private _dbCache: Map<string, CrushDbCacheEntry> = new Map();
	private _dbCacheInflight: Map<string, Promise<any | null>> = new Map();
	private readonly extensionUri: vscode.Uri;

	constructor(extensionUri: vscode.Uri) {
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

	private closeDb(db: any): void {
		try { db.close(); } catch { /* ignore */ }
	}

	private isMissingFileError(error: unknown): boolean {
		const code = (error as NodeJS.ErrnoException)?.code;
		return code === 'ENOENT' || code === 'ENOTDIR';
	}

	private statCrushDb(dbPath: string): fs.Stats | null {
		try {
			return fs.statSync(dbPath);
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

	private async refreshCrushDb(dbPath: string, stats: fs.Stats): Promise<any | null> {
		let db: any;
		try {
			const SQL = await this.initSqlJs();
			const buffer = fs.readFileSync(dbPath);
			db = new SQL.Database(buffer);
		} catch {
			return this._dbCache.get(dbPath)?.db ?? null;
		}

		const currentStats = this.statCrushDb(dbPath);
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
	 * Returns a cached SQL.Database instance for the given crush.db path, re-opening
	 * only when the file's mtime or size changes. This avoids reading and parsing the
	 * entire DB file on every query (the primary cause of ~700ms-per-call latency).
	 *
	 * Uses single-flight deduplication to prevent concurrent callers from each
	 * re-reading the DB file and leaving instances unclosed.
	 */
	private async getCrushDb(dbPath: string): Promise<any | null> {
		const stats = this.statCrushDb(dbPath);
		if (!stats) { return this._dbCache.get(dbPath)?.db ?? null; }

		if (this.isCachedDbCurrent(dbPath, stats)) {
			return this._dbCache.get(dbPath)!.db;
		}

		const cacheKey = this.getDbCacheKey(dbPath, stats);
		const inflight = this._dbCacheInflight.get(cacheKey);
		if (inflight) { return inflight; }

		const createDbPromise = this.refreshCrushDb(dbPath, stats);
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
	 * Get the global Crush config directory.
	 * - Windows: %LOCALAPPDATA%/crush
	 * - Linux/macOS: ~/.config/crush (tentative; XDG_CONFIG_HOME)
	 */
	getCrushConfigDir(): string {
		const platform = os.platform();
		if (platform === 'win32') {
			const localAppData = process.env.LOCALAPPDATA || path.join(os.homedir(), 'AppData', 'Local');
			return path.join(localAppData, 'crush');
		}
		const xdgConfigHome = process.env.XDG_CONFIG_HOME || path.join(os.homedir(), '.config');
		return path.join(xdgConfigHome, 'crush');
	}

	/**
	 * Read all known Crush projects from the global projects.json.
	 */
	readCrushProjects(): CrushProject[] {
		const projectsPath = path.join(this.getCrushConfigDir(), 'projects.json');
		if (!fs.existsSync(projectsPath)) { return []; }
		try {
			const content = fs.readFileSync(projectsPath, 'utf8');
			const json = JSON.parse(content);
			return Array.isArray(json.projects) ? json.projects : [];
		} catch {
			return [];
		}
	}

	/**
	 * Check whether a path is a Crush virtual session path.
	 * Virtual paths contain the substring `/.crush/crush.db#` (with OS path separators normalised).
	 */
	isCrushSessionFile(filePath: string): boolean {
		const normalized = filePath.replace(/\\/g, '/');
		return normalized.includes('/.crush/crush.db#');
	}

	/**
	 * Extract the absolute path to `crush.db` from a virtual session path.
	 * e.g. `C:\repo\.crush\crush.db#<uuid>` → `C:\repo\.crush\crush.db`
	 */
	getCrushDbPath(virtualPath: string): string {
		const idx = virtualPath.indexOf('crush.db#');
		if (idx === -1) { return virtualPath; }
		return virtualPath.substring(0, idx + 'crush.db'.length);
	}

	/**
	 * Extract the session UUID from a Crush virtual path.
	 */
	getCrushSessionId(virtualPath: string): string | null {
		const idx = virtualPath.indexOf('crush.db#');
		if (idx === -1) { return null; }
		return virtualPath.substring(idx + 'crush.db#'.length);
	}

	/**
	 * Lazily initialise and cache the sql.js module.
	 *
	 * Promise-caches the in-flight load so concurrent callers share a single
	 * WASM initialization rather than each starting an independent load.
	 * The cache is reset on failure so a transient error is retryable.
	 */
	async initSqlJs(): Promise<any> {
		if (this._sqlJsModule) { return this._sqlJsModule; }
		if (!this._sqlJsInitPromise) {
			this._sqlJsInitPromise = (async () => {
				const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
				let wasmBinary: Uint8Array | undefined;
				if (fs.existsSync(wasmPath)) {
					wasmBinary = fs.readFileSync(wasmPath);
				}
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
	 * Get file stats for a Crush virtual session path.
	 * Resolves to the underlying `crush.db` file.
	 */
	async statSessionFile(virtualPath: string): Promise<fs.Stats> {
		const dbPath = this.getCrushDbPath(virtualPath);
		return fs.promises.stat(dbPath);
	}

	/**
	 * Discover all session IDs in a specific `crush.db` file.
	 */
	async discoverSessionsInDb(dbPath: string): Promise<string[]> {
		const db = await this.getCrushDb(dbPath);
		if (!db) { return []; }
		try {
			const result = db.exec('SELECT id FROM sessions');
			if (result.length === 0) { return []; }
			return result[0].values.map((row: unknown[]) => row[0] as string);
		} catch {
			return [];
		}
	}

	/**
	 * Read session metadata from the `sessions` table.
	 */
	async readCrushSession(virtualPath: string): Promise<any | null> {
		const dbPath = this.getCrushDbPath(virtualPath);
		const sessionId = this.getCrushSessionId(virtualPath);
		if (!sessionId) { return null; }
		const db = await this.getCrushDb(dbPath);
		if (!db) { return null; }
		try {
			const result = db.exec(
				'SELECT id, title, message_count, prompt_tokens, completion_tokens, created_at, updated_at FROM sessions WHERE id = ?',
				[sessionId]
			);
			if (result.length === 0 || result[0].values.length === 0) { return null; }
			const cols = result[0].columns;
			const row = result[0].values[0];
			const obj: any = {};
			cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
			return obj;
		} catch {
			return null;
		}
	}

	/**
	 * Read all messages for a session from the `messages` table.
	 * Returns rows with `parts` already JSON-parsed.
	 */
	async getCrushMessages(virtualPath: string): Promise<any[]> {
		const dbPath = this.getCrushDbPath(virtualPath);
		const sessionId = this.getCrushSessionId(virtualPath);
		if (!sessionId) { return []; }
		const db = await this.getCrushDb(dbPath);
		if (!db) { return []; }
		try {
			const result = db.exec(
				'SELECT id, session_id, role, parts, model, provider, created_at, updated_at, finished_at FROM messages WHERE session_id = ? AND is_summary_message = 0 ORDER BY created_at ASC',
				[sessionId]
			);
			if (result.length === 0) { return []; }
			const cols = result[0].columns;
			return result[0].values.map((row: unknown[]) => {
				const obj: any = {};
				cols.forEach((c: string, i: number) => { obj[c] = row[i]; });
				if (typeof obj.parts === 'string') {
					try { obj.parts = JSON.parse(obj.parts); } catch { obj.parts = []; }
				}
				return obj;
			});
		} catch {
			return [];
		}
	}

	/**
	 * Get the actual token counts for a session.
	 * Crush stores `prompt_tokens` (input) and `completion_tokens` (output) directly in the sessions table.
	 * There is no separate field for thinking/reasoning tokens.
	 */
	async getTokensFromCrushSession(virtualPath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const session = await this.readCrushSession(virtualPath);
		if (!session) { return { tokens: 0, thinkingTokens: 0 }; }
		const prompt = typeof session.prompt_tokens === 'number' ? session.prompt_tokens : 0;
		const completion = typeof session.completion_tokens === 'number' ? session.completion_tokens : 0;
		return { tokens: prompt + completion, thinkingTokens: 0 };
	}

	/**
	 * Count user interactions (number of user-role messages) in a session.
	 */
	async countCrushInteractions(virtualPath: string): Promise<number> {
		const messages = await this.getCrushMessages(virtualPath);
		return messages.filter(m => m.role === 'user').length;
	}

	/**
	 * Build per-model token usage for a session.
	 * Crush only exposes session-level token totals, not per-message ones.
	 * We distribute proportionally by assistant message count per model.
	 */
	async getCrushModelUsage(virtualPath: string): Promise<ModelUsage> {
		const modelUsage: ModelUsage = {};
		const session = await this.readCrushSession(virtualPath);
		if (!session) { return modelUsage; }

		const totalPrompt = typeof session.prompt_tokens === 'number' ? session.prompt_tokens : 0;
		const totalCompletion = typeof session.completion_tokens === 'number' ? session.completion_tokens : 0;
		if (totalPrompt + totalCompletion === 0) { return modelUsage; }

		const messages = await this.getCrushMessages(virtualPath);
		const assistantMsgs = messages.filter(m => m.role === 'assistant' && m.model);
		if (assistantMsgs.length === 0) {
			// No model info; attribute all to 'unknown'
			modelUsage['unknown'] = { inputTokens: totalPrompt, outputTokens: totalCompletion };
			return modelUsage;
		}

		// Count turns per model, then distribute proportionally
		const modelCounts: { [model: string]: number } = {};
		for (const msg of assistantMsgs) {
			const m = msg.model || 'unknown';
			modelCounts[m] = (modelCounts[m] || 0) + 1;
		}
		const totalMsgs = assistantMsgs.length;
		for (const [model, count] of Object.entries(modelCounts)) {
			const fraction = count / totalMsgs;
			modelUsage[model] = {
				inputTokens: Math.round(totalPrompt * fraction),
				outputTokens: Math.round(totalCompletion * fraction)
			};
		}
		return modelUsage;
	}

	/**
	 * Returns a unified session data object for backend sync — mirrors the shape
	 * that OpenCodeDataAccess.getOpenCodeSessionData() produces.
	 *
	 * Timestamp: the session's `created_at` Unix-seconds converted to milliseconds.
	 * Token counts: actual prompt_tokens + completion_tokens from the sessions table.
	 * Model usage: proportionally distributed across assistant-message models.
	 * Interactions: number of user-role messages.
	 */
	async getCrushSessionData(virtualPath: string): Promise<{
		tokens: number;
		interactions: number;
		modelUsage: ModelUsage & { [key: string]: { inputTokens: number; outputTokens: number; interactions?: number } };
		timestamp: number;
	}> {
		const session = await this.readCrushSession(virtualPath);
		if (!session) {
			return { tokens: 0, interactions: 0, modelUsage: {}, timestamp: 0 };
		}
		const prompt = typeof session.prompt_tokens === 'number' ? session.prompt_tokens : 0;
		const completion = typeof session.completion_tokens === 'number' ? session.completion_tokens : 0;
		const tokens = prompt + completion;
		// created_at is a Unix timestamp in seconds
		const timestamp = typeof session.created_at === 'number' ? session.created_at * 1000 : Date.now();
		const modelUsage = await this.getCrushModelUsage(virtualPath);
		const messages = await this.getCrushMessages(virtualPath);
		const interactions = messages.filter(m => m.role === 'user').length;
		// Annotate each model entry with an interaction count proportional to its token share
		const totalTokens = prompt + completion;
		const modelUsageWithInteractions: { [key: string]: { inputTokens: number; outputTokens: number; interactions?: number } } = {};
		for (const [model, usage] of Object.entries(modelUsage)) {
			const modelTotal = usage.inputTokens + usage.outputTokens;
			const fraction = totalTokens > 0 ? modelTotal / totalTokens : 0;
			modelUsageWithInteractions[model] = {
				inputTokens: usage.inputTokens,
				outputTokens: usage.outputTokens,
				interactions: Math.round(interactions * fraction),
			};
		}
		return { tokens, interactions, modelUsage: modelUsageWithInteractions, timestamp };
	}

	/**
	 * Collect tool-call names from all assistant messages in a session.
	 * Parses the JSON `parts` array for `{type:"tool_call",data:{name:...}}` entries.
	 */
	getToolCallsFromMessages(messages: any[]): string[] {
		const toolNames: string[] = [];
		for (const msg of messages) {
			if (msg.role !== 'assistant' || !Array.isArray(msg.parts)) { continue; }
			for (const part of msg.parts) {
				if (part?.type === 'tool_call' && part?.data?.name) {
					toolNames.push(part.data.name);
				}
			}
		}
		return toolNames;
	}
}
