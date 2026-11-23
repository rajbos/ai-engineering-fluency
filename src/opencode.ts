/**
 * OpenCode data access layer.
 * Handles reading session data from OpenCode's JSON files and SQLite database.
 */
/// <reference types="sql.js" />
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ModelUsage, ModelId } from './types';
import { normalizePathForComparison } from './workspaceHelpers';
import { isUnsafeObjectKey } from './utils/protoGuard';
import { readTextFileWithSizeGuardSync } from './utils/safeFileRead';

import { WalSqlJsDbCacheBase } from './openCodeFamilyDb';

/** Minimal URI interface required by OpenCodeDataAccess (subset of vscode.Uri). */
export interface UriLike {
	readonly fsPath: string;
	readonly path: string;
	readonly scheme: string;
}

type OpenCodeModelUsageWithInteractions = {
	[modelName: ModelId]: ModelUsage[ModelId] & { interactions?: number };
};

export class OpenCodeDataAccess extends WalSqlJsDbCacheBase {
	private readonly extensionUri: UriLike;

	constructor(extensionUri: UriLike) {
		super();
		this.extensionUri = extensionUri;
	}

	/**
	 * Get the OpenCode data directory path.
	 * OpenCode follows XDG Base Directory Specification:
	 * - Windows: %USERPROFILE%\.local\share\opencode\
	 * - Linux/macOS: ~/.local/share/opencode/
	 */
	getOpenCodeDataDir(): string {
		const platform = os.platform();
		const homedir = os.homedir();
		if (platform === 'win32') {
			return path.join(homedir, '.local', 'share', 'opencode');
		}
		const xdgDataHome = process.env.XDG_DATA_HOME || path.join(homedir, '.local', 'share');
		return path.join(xdgDataHome, 'opencode');
	}

	/** Absolute path of the opencode.db SQLite database file. */
	getOpenCodeDbPath(): string {
		return path.join(this.getOpenCodeDataDir(), 'opencode.db');
	}

	/**
	 * Check if a session file is an OpenCode session file.
	 * OpenCode sessions are stored in ~/.local/share/opencode/storage/session/ (JSON)
	 * or referenced via virtual paths like opencode.db#ses_<id> (SQLite).
	 */
	isOpenCodeSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		return normalized.includes('/opencode/storage/session/') || normalized.includes('/opencode/opencode.db#ses_');
	}

	/**
	 * Check if a session is stored in the OpenCode SQLite database.
	 * Virtual path format: <opencode_dir>/opencode.db#ses_<id>
	 */
	isOpenCodeDbSession(filePath: string): boolean {
		return filePath.includes('opencode.db#ses_');
	}

	/**
	 * Read session metadata from the OpenCode SQLite database.
	 */
	async readOpenCodeDbSession(sessionId: string): Promise<any | null> {
		return this.readSessionMetadata(this.getOpenCodeDbPath(), sessionId);
	}

	/**
	 * When a session in the SQLite database was last written: the newest `time_updated` of its
	 * session row, its messages and its parts, in ms. The session row alone lags behind: OpenCode
	 * does not touch it on every message or part write (in one real store 81 of 82 sessions had
	 * a message updated after the row), so it cannot date or version the session's token data
	 * (#2710). Null when the session is unknown. A missing `message` or `part` table (or column,
	 * in an older schema) is skipped rather than failing the whole lookup.
	 */
	async readOpenCodeDbSessionLastActivity(sessionId: string): Promise<Date | null> {
		const dbPath = this.getOpenCodeDbPath();
		const sessionRows = await this.queryRows(dbPath, 'SELECT COALESCE(time_updated, time_created) AS t FROM session WHERE id = ?', [sessionId]);
		const session = sessionRows?.[0]?.t;
		if (typeof session !== 'number') { return null; }
		// Only query tables that have the columns: on the read-only node:sqlite path a failing
		// query moves the whole database to the sql.js fallback for a while, so an older schema
		// must be detected up front rather than by catching an error.
		const columns = await this.queryRows(dbPath,
			"SELECT m.name AS tbl, COUNT(*) AS n FROM sqlite_master m JOIN pragma_table_info(m.name) c "
			+ "WHERE m.type = 'table' AND m.name IN ('message', 'part') AND c.name IN ('session_id', 'time_updated') GROUP BY m.name");
		let latest = session;
		for (const table of ['message', 'part'] as const) {
			if (!columns?.some(row => row.tbl === table && row.n === 2)) { continue; }
			const rows = await this.queryRows(dbPath, `SELECT MAX(time_updated) AS t FROM ${table} WHERE session_id = ?`, [sessionId]);
			const value = rows?.[0]?.t;
			if (typeof value === 'number' && value > latest) { latest = value; }
		}
		return new Date(latest);
	}

	/**
	 * Read all OpenCode messages from the SQLite database for a given session.
	 */
	async readOpenCodeDbMessages(sessionId: string): Promise<any[]> {
		return this.readSessionMessages(this.getOpenCodeDbPath(), sessionId);
	}

	/**
	 * Read all OpenCode parts from the SQLite database for a given message.
	 */
	async readOpenCodeDbParts(messageId: string): Promise<any[]> {
		return this.readMessageParts(this.getOpenCodeDbPath(), messageId);
	}

	/**
	 * Discover all session IDs from the OpenCode SQLite database.
	 */
	async discoverOpenCodeDbSessions(): Promise<string[]> {
		return this.readSessionIds(this.getOpenCodeDbPath());
	}

	/**
	 * Get file stats for a session, handling OpenCode DB virtual paths.
	 * For DB sessions, returns the stat of the opencode.db file itself.
	 */
	async statSessionFile(sessionFile: string): Promise<fs.Stats> {
		if (this.isOpenCodeDbSession(sessionFile)) {
			const dbPath = path.join(this.getOpenCodeDataDir(), 'opencode.db');
			return fs.promises.stat(dbPath);
		}
		return fs.promises.stat(sessionFile);
	}

	/**
	 * Read all OpenCode message files for a given session.
	 * Messages are stored in ~/.local/share/opencode/storage/message/ses_<id>/
	 * Returns an array of parsed message objects sorted by creation time.
	 */
	readOpenCodeMessages(sessionId: string): any[] {
		const dataDir = this.getOpenCodeDataDir();
		const messageDir = path.join(dataDir, 'storage', 'message', sessionId);
		const messages: any[] = [];
		try {
			if (!fs.existsSync(messageDir)) { return messages; }
			const entries = fs.readdirSync(messageDir, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith('.json')) { continue; }
				try {
					const content = readTextFileWithSizeGuardSync(path.join(messageDir, entry.name), 'opencode');
					if (content === undefined) { continue; }
					const msg = JSON.parse(content);
					messages.push(msg);
				} catch {
					// Skip unreadable message files
				}
			}
		} catch {
			// Directory not accessible
		}
		// Sort by creation time
		messages.sort((a, b) => ((a.time?.created || 0) - (b.time?.created || 0)));
		return messages;
	}

	/**
	 * Read all OpenCode part files for a given message.
	 * Parts are stored in ~/.local/share/opencode/storage/part/msg_<id>/
	 * Returns an array of parsed part objects sorted by creation/start time.
	 */
	readOpenCodeParts(messageId: string): any[] {
		const dataDir = this.getOpenCodeDataDir();
		const partDir = path.join(dataDir, 'storage', 'part', messageId);
		const parts: any[] = [];
		try {
			if (!fs.existsSync(partDir)) { return parts; }
			const entries = fs.readdirSync(partDir, { withFileTypes: true });
			for (const entry of entries) {
				if (!entry.isFile() || !entry.name.endsWith('.json')) { continue; }
				try {
					const content = readTextFileWithSizeGuardSync(path.join(partDir, entry.name), 'opencode');
					if (content === undefined) { continue; }
					const part = JSON.parse(content);
					parts.push(part);
				} catch {
					// Skip unreadable part files
				}
			}
		} catch {
			// Directory not accessible
		}
		// Sort by start time if available, otherwise by ID
		parts.sort((a, b) => ((a.time?.start || 0) - (b.time?.start || 0)));
		return parts;
	}

	/**
	 * Extract the session ID from an OpenCode session file path.
	 * Handles both JSON file paths and DB virtual paths:
	 * - ".../storage/session/global/ses_abc123.json" -> "ses_abc123"
	 * - ".../opencode.db#ses_abc123" -> "ses_abc123"
	 */
	getOpenCodeSessionId(sessionFilePath: string): string | null {
		// Handle DB virtual path: opencode.db#ses_<id>
		const hashIdx = sessionFilePath.indexOf('opencode.db#');
		if (hashIdx !== -1) {
			return sessionFilePath.substring(hashIdx + 'opencode.db#'.length);
		}
		const basename = path.basename(sessionFilePath, '.json');
		return basename.startsWith('ses_') ? basename : null;
	}

	/**
	 * Get OpenCode messages for a session, trying DB first then JSON files.
	 */
	async getOpenCodeMessagesForSession(sessionFilePath: string): Promise<any[]> {
		const sessionId = this.getOpenCodeSessionId(sessionFilePath);
		if (!sessionId) { return []; }
		if (this.isOpenCodeDbSession(sessionFilePath)) {
			return this.readOpenCodeDbMessages(sessionId);
		}
		// Try DB first (may have newer data), fall back to JSON files
		const dbMessages = await this.readOpenCodeDbMessages(sessionId);
		if (dbMessages.length > 0) { return dbMessages; }
		return this.readOpenCodeMessages(sessionId);
	}

	/**
	 * Get OpenCode parts for a message, trying DB first then JSON files.
	 */
	async getOpenCodePartsForMessage(messageId: string): Promise<any[]> {
		const dbParts = await this.readOpenCodeDbParts(messageId);
		if (dbParts.length > 0) { return dbParts; }
		return this.readOpenCodeParts(messageId);
	}

	/**
	 * Extract actual token counts from an OpenCode session.
	 * OpenCode stores actual token counts in message files (tokens.input, tokens.output, tokens.reasoning).
	 */
	async getTokensFromOpenCodeSession(sessionFilePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const messages = await this.getOpenCodeMessagesForSession(sessionFilePath);
		return this.getTokensFromOpenCodeMessages(messages);
	}

	private getTokensFromOpenCodeMessages(messages: any[]): { tokens: number; thinkingTokens: number } {
		let thinkingTokens = 0;

		// OpenCode messages have a cumulative `total` field that grows with each API call.
		// The last assistant message's `total` is the session total.
		// Summing input+output across messages would over-count because each API call
		// re-sends the full conversation context as input.
		let sessionTotal = 0;
		for (const msg of messages) {
			if (msg.role === 'assistant' && msg.tokens) {
				if (typeof msg.tokens.total === 'number') {
					sessionTotal = msg.tokens.total; // cumulative — last one wins
				}
				thinkingTokens += msg.tokens.reasoning || 0;
			}
		}

		return { tokens: sessionTotal, thinkingTokens };
	}

	/**
	 * Count interactions in an OpenCode session (number of user messages).
	 */
	async countOpenCodeInteractions(sessionFilePath: string): Promise<number> {
		const messages = await this.getOpenCodeMessagesForSession(sessionFilePath);
		return this.countOpenCodeInteractionsFromMessages(messages);
	}

	private countOpenCodeInteractionsFromMessages(messages: any[]): number {
		return messages.filter(m => m.role === 'user').length;
	}

	private getAssistantMessagesByParent(messages: any[]): Map<string, any[]> {
		const assistantMessagesByParent = new Map<string, any[]>();
		for (const msg of messages) {
			if (msg.role !== 'assistant' || !msg.parentID) { continue; }
			const existing = assistantMessagesByParent.get(msg.parentID) ?? [];
			existing.push(msg);
			assistantMessagesByParent.set(msg.parentID, existing);
		}
		return assistantMessagesByParent;
	}

	/**
	 * Get model usage from an OpenCode session.
	 * Extracts model info from assistant message files.
	 */
	async getOpenCodeModelUsage(sessionFilePath: string): Promise<ModelUsage> {
		const messages = await this.getOpenCodeMessagesForSession(sessionFilePath);
		return this.getOpenCodeModelUsageFromMessages(messages);
	}

	private computeTurnCumTotal(turnAssistantMsgs: any[], prevTotal: number): number {
		let cumTotal = prevTotal;
		for (const am of turnAssistantMsgs) {
			if (typeof am.tokens?.total === 'number') { cumTotal = Math.max(cumTotal, am.tokens.total); }
		}
		return cumTotal;
	}

	private getOpenCodeModelUsageFromMessages(messages: any[]): ModelUsage {
		const modelUsage: ModelUsage = {};
		const assistantMessagesByParent = this.getAssistantMessagesByParent(messages);
		let prevTotal = 0;
		for (let i = 0; i < messages.length; i++) {
			const msg = messages[i];
			if (msg.role !== 'user') { continue; }
			const turnAssistantMsgs = assistantMessagesByParent.get(msg.id) ?? [];
			if (turnAssistantMsgs.length === 0) { continue; }
			const turnCumTotal = this.computeTurnCumTotal(turnAssistantMsgs, prevTotal);
			const turnTokens = turnCumTotal - prevTotal;
			if (turnTokens <= 0) { prevTotal = turnCumTotal; continue; }
			const model = turnAssistantMsgs[0].modelID || turnAssistantMsgs[0].model?.modelID || 'unknown';
			// Untrusted `model` string from parsed session JSON — see protoGuard.ts.
			if (isUnsafeObjectKey(model)) { prevTotal = turnCumTotal; continue; }
			if (!modelUsage[model]) { modelUsage[model] = { inputTokens: 0, outputTokens: 0, sessions: 0 }; }
			const turnOutput = turnAssistantMsgs.reduce((sum, m) => sum + (m.tokens?.output || 0) + (m.tokens?.reasoning || 0), 0);
			modelUsage[model].inputTokens += Math.max(0, turnTokens - turnOutput);
			modelUsage[model].outputTokens += turnOutput;
			const turnCachedRead = turnAssistantMsgs.reduce((sum, m) => sum + (m.tokens?.cache?.read || 0), 0);
			const turnCacheCreation = turnAssistantMsgs.reduce((sum, m) => sum + (m.tokens?.cache?.write || 0), 0);
			if (turnCachedRead > 0) { modelUsage[model].cachedReadTokens = (modelUsage[model].cachedReadTokens ?? 0) + turnCachedRead; }
			if (turnCacheCreation > 0) { modelUsage[model].cacheCreationTokens = (modelUsage[model].cacheCreationTokens ?? 0) + turnCacheCreation; }
			prevTotal = turnCumTotal;
		}
		return modelUsage;
	}

	/**
	 * Get all session data from an OpenCode session in one call (for backend sync).
	 * Returns tokens, interactions, model usage, and timestamp.
	 * Includes per-model interaction counts in modelUsage.
	 */
	async getOpenCodeSessionData(sessionFilePath: string): Promise<{ tokens: number; interactions: number; modelUsage: OpenCodeModelUsageWithInteractions; timestamp: number }> {
		const messages = await this.getOpenCodeMessagesForSession(sessionFilePath);

		// Use the first message's creation time as the session timestamp.
		// Messages store their timestamp in the nested `time.created` field.
		let timestamp = Date.now();
		if (messages.length > 0 && messages[0].time?.created) {
			timestamp = messages[0].time.created;
		}

		const { tokens } = this.getTokensFromOpenCodeMessages(messages);
		const interactions = this.countOpenCodeInteractionsFromMessages(messages);
		const baseModelUsage = this.getOpenCodeModelUsageFromMessages(messages);
		const assistantMessagesByParent = this.getAssistantMessagesByParent(messages);

		// Count interactions per model (each user turn -> 1 interaction for the model that responded)
		const modelInteractions: { [model: string]: number } = {};
		for (let i = 0; i < messages.length; i++) {
			const msg = messages[i];
			if (msg.role !== 'user') { continue; }
			const turnAssistantMsgs = assistantMessagesByParent.get(msg.id) ?? [];
			if (turnAssistantMsgs.length === 0) { continue; }

			const model = turnAssistantMsgs[0].modelID || turnAssistantMsgs[0].model?.modelID || 'unknown';
			// Untrusted `model` string from parsed session JSON — see protoGuard.ts.
			if (isUnsafeObjectKey(model)) { continue; }
			modelInteractions[model] = (modelInteractions[model] || 0) + 1;
		}

		// Merge interaction counts into model usage. baseModelUsage's own keys are already
		// guarded (see getOpenCodeModelUsageFromMessages), so Object.entries only yields safe keys.
		const modelUsage: OpenCodeModelUsageWithInteractions = {};
		for (const [model, usage] of Object.entries(baseModelUsage)) {
			modelUsage[model] = {
				...usage,
				interactions: modelInteractions[model] || 0
			};
		}

		return { tokens, interactions, modelUsage, timestamp };
	}
}
