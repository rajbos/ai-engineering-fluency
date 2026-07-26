/**
 * Kiro IDE data access layer.
 * Handles reading session data from the Kiro editor's (AWS's VS Code fork) agent
 * chat storage. Kiro's chat UI is a Continue fork, so session files use the same
 * schema as Continue (history[].message / contextItems / promptLogs), but the
 * storage layout differs:
 *
 *   Windows: %APPDATA%\Kiro\User\globalStorage\kiro.kiroagent\workspace-sessions\<encoded>\
 *   macOS:   ~/Library/Application Support/Kiro/User/globalStorage/kiro.kiroagent/workspace-sessions/<encoded>/
 *   Linux:   ~/.config/Kiro/User/globalStorage/kiro.kiroagent/workspace-sessions/<encoded>/
 *
 * where <encoded> is the workspace path base64-encoded with '=' padding replaced
 * by '_'. Each workspace folder holds a sessions.json index (sessionId, title,
 * dateCreated as an epoch-ms string, workspaceDirectory) plus one <uuid>.json per
 * session.
 *
 * Assistant messages in session files are short placeholders ("On it."); the
 * full agent output lives in separate execution records stored under
 *   kiro.kiroagent/<first 32 hex chars of sha256(workspacePath)>/...
 * as JSON files named <first 32 hex chars of sha256(executionId)>. Each record
 * carries chatSessionId, startTime/endTime (epoch ms), the full LLM request
 * context (context.messages), the response text, tool actions, and metered
 * credits (usageSummary). Session history items reference these records via
 * their executionId field, which is how turns are enriched here.
 *
 * Data caveats:
 *   - No API token counts or real model IDs are persisted (model is "agent"),
 *     so tokens are estimated from the execution-record text (~4 chars/token).
 *   - When no execution records exist for a session, estimates fall back to
 *     the (placeholder-only) session file text and are much lower.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import type { ModelUsage } from './types';
import { normalizePathForComparison } from './workspaceHelpers';
import { toLocalDayKey } from './utils/dayKeys';

export interface KiroSessionIndexEntry {
	dateCreated?: number;
	title?: string;
	workspaceDirectory?: string;
}

export type KiroTurn = {
	userText: string;
	assistantText: string;
	model: string | null;
	toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>;
	inputTokens: number;
	outputTokens: number;
	/** Epoch ms of the turn's first execution record, when available. */
	timestampMs: number | null;
	/** Execution record ids referenced by this turn's assistant messages. */
	executionIds: string[];
};

/** Parsed agent execution record (the full request/response data for one agent run). */
export interface KiroExecutionRecord {
	executionId: string;
	startTimeMs: number | null;
	/** The assistant's final response text for this execution. */
	responseText: string;
	toolCalls: Array<{ toolName: string; arguments?: string }>;
	/** Estimated tokens for the full request context (everything sent to the model). */
	inputTokens: number;
	/** Estimated tokens for the response. */
	outputTokens: number;
	/** Metered cost in credits, summed over the record's usageSummary. */
	credits: number;
}

/** Action types that represent workflow bookkeeping rather than tool invocations. */
const NON_TOOL_ACTION_TYPES = new Set(['intentClassification', 'model', 'say']);

export class KiroDataAccess {

	/**
	 * Get the Kiro editor application data root (OS-aware).
	 *   Windows: %APPDATA%\Kiro
	 *   macOS:   ~/Library/Application Support/Kiro
	 *   Linux:   ~/.config/Kiro
	 */
	getKiroAppDataDir(): string {
		const platform = os.platform();
		if (platform === 'win32') {
			const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
			return path.join(appData, 'Kiro');
		}
		if (platform === 'darwin') {
			return path.join(os.homedir(), 'Library', 'Application Support', 'Kiro');
		}
		return path.join(os.homedir(), '.config', 'Kiro');
	}

	/**
	 * Get the kiro.kiroagent global storage directory.
	 */
	getKiroAgentDir(): string {
		return path.join(this.getKiroAppDataDir(), 'User', 'globalStorage', 'kiro.kiroagent');
	}

	/**
	 * Get the workspace-sessions directory that holds one folder per workspace.
	 */
	getKiroWorkspaceSessionsDir(): string {
		return path.join(this.getKiroAgentDir(), 'workspace-sessions');
	}

	/**
	 * Check if a file path is a Kiro editor session file.
	 */
	isKiroSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		return normalized.includes('/kiro.kiroagent/workspace-sessions/')
			&& normalized.endsWith('.json')
			&& !normalized.endsWith('/sessions.json');
	}

	/**
	 * Get all Kiro session file paths across all workspace folders.
	 * Excludes the per-workspace sessions.json index files.
	 */
	async getKiroSessionFiles(): Promise<string[]> {
		const sessionsRoot = this.getKiroWorkspaceSessionsDir();
		let workspaceDirs: fs.Dirent[];
		try {
			workspaceDirs = await fs.promises.readdir(sessionsRoot, { withFileTypes: true });
		} catch {
			return [];
		}
		const files: string[] = [];
		for (const dir of workspaceDirs) {
			if (!dir.isDirectory()) { continue; }
			const workspaceDir = path.join(sessionsRoot, dir.name);
			try {
				const entries = await fs.promises.readdir(workspaceDir);
				for (const entry of entries) {
					if (entry.endsWith('.json') && entry !== 'sessions.json') {
						files.push(path.join(workspaceDir, entry));
					}
				}
			} catch { /* ignore unreadable workspace folders */ }
		}
		return files;
	}

	private async readSessionFile(sessionFilePath: string): Promise<any | null> {
		try {
			const content = await fs.promises.readFile(sessionFilePath, 'utf8');
			return JSON.parse(content);
		} catch {
			return null;
		}
	}

	// ── Execution records ─────────────────────────────────────────────────────

	/** Per-file cache of parsed execution records (records are write-once). */
	private _executionRecordCache = new Map<string, { mtimeMs: number; parsed: any | null }>();

	/**
	 * Get the execution-store directory for a workspace:
	 * kiro.kiroagent/<first 32 hex chars of sha256(workspacePath)>.
	 */
	getWorkspaceExecutionDir(workspacePath: string): string {
		const hash = crypto.createHash('sha256').update(workspacePath).digest('hex').slice(0, 32);
		return path.join(this.getKiroAgentDir(), hash);
	}

	/**
	 * Read all execution records belonging to a session, sorted by start time.
	 * The workspace path is recovered from the session's folder name (the same
	 * string Kiro hashed to name the execution-store directory).
	 */
	async readExecutionRecordsForSession(sessionFilePath: string): Promise<KiroExecutionRecord[]> {
		const sessionId = path.basename(sessionFilePath, '.json');
		const workspacePath = this.decodeWorkspaceDirName(path.basename(path.dirname(sessionFilePath)));
		if (!workspacePath) { return []; }
		const executionDir = this.getWorkspaceExecutionDir(workspacePath);
		const files = await this.collectExecutionFiles(executionDir, 0);
		const records: KiroExecutionRecord[] = [];
		for (const file of files) {
			const parsed = await this.readExecutionFile(file);
			if (parsed?.executionId && parsed?.chatSessionId === sessionId) {
				records.push(this.toExecutionRecord(parsed));
			}
		}
		records.sort((a, b) => (a.startTimeMs ?? 0) - (b.startTimeMs ?? 0));
		return records;
	}

	/** Recursively collect candidate execution files (32-hex names) up to 3 levels deep. */
	private async collectExecutionFiles(dir: string, depth: number): Promise<string[]> {
		if (depth > 3) { return []; }
		let entries: fs.Dirent[];
		try {
			entries = await fs.promises.readdir(dir, { withFileTypes: true });
		} catch {
			return [];
		}
		const files: string[] = [];
		for (const entry of entries) {
			if (!/^[0-9a-f]{32}$/.test(entry.name)) { continue; }
			const fullPath = path.join(dir, entry.name);
			if (entry.isDirectory()) {
				files.push(...await this.collectExecutionFiles(fullPath, depth + 1));
			} else {
				files.push(fullPath);
			}
		}
		return files;
	}

	private async readExecutionFile(filePath: string): Promise<any | null> {
		let stat: fs.Stats;
		try {
			stat = await fs.promises.stat(filePath);
		} catch {
			return null;
		}
		const cached = this._executionRecordCache.get(filePath);
		if (cached && cached.mtimeMs === stat.mtimeMs) { return cached.parsed; }
		let parsed: any | null = null;
		try {
			parsed = JSON.parse(await fs.promises.readFile(filePath, 'utf8'));
		} catch {
			parsed = null;
		}
		this._executionRecordCache.set(filePath, { mtimeMs: stat.mtimeMs, parsed });
		return parsed;
	}

	/** Convert a raw execution JSON into a KiroExecutionRecord with token estimates. */
	private toExecutionRecord(parsed: any): KiroExecutionRecord {
		const messages: any[] = Array.isArray(parsed?.context?.messages) ? parsed.context.messages : [];
		const last = messages[messages.length - 1];
		const isResponse = last?.role === 'bot';
		let inputTokens = 0;
		for (const msg of isResponse ? messages.slice(0, -1) : messages) {
			inputTokens += this.estimateTokens(this.extractContextMessageText(msg));
		}
		const responseText = isResponse ? this.extractContextMessageText(last, true) : '';
		const outputTokens = this.estimateTokens(isResponse ? this.extractContextMessageText(last) : '');
		return {
			executionId: String(parsed.executionId),
			startTimeMs: typeof parsed.startTime === 'number' ? parsed.startTime : null,
			responseText,
			toolCalls: this.extractActionToolCalls(parsed),
			inputTokens,
			outputTokens,
			credits: this.sumUsageCredits(parsed),
		};
	}

	/**
	 * Extract the text content of one context message.
	 * When textOnly is true, only plain text entries are included (used for the
	 * display response); otherwise tool-use args and document payloads count too,
	 * since they occupy real context tokens.
	 */
	private extractContextMessageText(msg: any, textOnly = false): string {
		const parts: string[] = [];
		for (const entry of Array.isArray(msg?.entries) ? msg.entries : []) {
			if (typeof entry?.text === 'string') {
				parts.push(entry.text);
				continue;
			}
			if (textOnly) { continue; }
			if (entry?.args !== undefined) {
				parts.push(this.safeStringify(entry.args));
			} else if (entry?.document !== undefined) {
				parts.push(this.safeStringify(entry.document));
			}
		}
		return parts.join('\n');
	}

	/** Extract tool invocations from an execution record's actions array. */
	private extractActionToolCalls(parsed: any): Array<{ toolName: string; arguments?: string }> {
		const toolCalls: Array<{ toolName: string; arguments?: string }> = [];
		for (const action of Array.isArray(parsed?.actions) ? parsed.actions : []) {
			const actionType = typeof action?.actionType === 'string' ? action.actionType : '';
			if (!actionType || NON_TOOL_ACTION_TYPES.has(actionType)) { continue; }
			toolCalls.push({
				toolName: actionType,
				arguments: action.input !== undefined ? this.safeStringify(action.input) : undefined,
			});
		}
		return toolCalls;
	}

	private sumUsageCredits(parsed: any): number {
		let credits = 0;
		for (const usage of Array.isArray(parsed?.usageSummary) ? parsed.usageSummary : []) {
			if (typeof usage?.usage === 'number' && Number.isFinite(usage.usage)) {
				credits += usage.usage;
			}
		}
		return credits;
	}

	private safeStringify(value: unknown): string {
		if (typeof value === 'string') { return value; }
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}

	/**
	 * Estimate token count from a text string (~4 characters per token).
	 */
	private estimateTokens(text: string): number {
		if (!text) { return 0; }
		return Math.ceil(text.length / 4);
	}

	/**
	 * Get estimated token counts from a Kiro session.
	 * Prefers the agent execution records (full request context + response text);
	 * falls back to the session file's promptLogs/placeholder text when no
	 * execution records exist for the session.
	 */
	async getTokensFromKiroSession(sessionFilePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const records = await this.readExecutionRecordsForSession(sessionFilePath);
		if (records.length > 0) {
			let total = 0;
			for (const record of records) {
				total += record.inputTokens + record.outputTokens;
			}
			return { tokens: total, thinkingTokens: 0 };
		}
		return this.getTokensFromSessionFileText(sessionFilePath);
	}

	/** Fallback token estimate from the session file's own (placeholder-heavy) text. */
	private async getTokensFromSessionFileText(sessionFilePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) {
			return { tokens: 0, thinkingTokens: 0 };
		}
		let total = 0;
		for (const item of session.history) {
			if (Array.isArray(item.promptLogs)) {
				for (const log of item.promptLogs) {
					total += this.estimateTokens((log.prompt as string) || '');
					total += this.estimateTokens((log.completion as string) || '');
				}
			}
			// Assistant placeholders carry no promptLogs; count their text so
			// agent responses contribute at least the persisted content.
			if (item.message?.role === 'assistant' && typeof item.message.content === 'string') {
				total += this.estimateTokens(item.message.content);
			}
		}
		return { tokens: total, thinkingTokens: 0 };
	}

	/**
	 * Count user interactions (user messages) in a Kiro session.
	 */
	async countKiroInteractions(sessionFilePath: string): Promise<number> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) { return 0; }
		return session.history.filter((item: any) => item.message?.role === 'user').length;
	}

	/**
	 * Get per-model token usage from a Kiro session.
	 * Kiro records the model title in promptLogs ("Agent"); real model IDs are
	 * not persisted locally, so all execution-record usage lands on that title.
	 */
	async getKiroModelUsage(sessionFilePath: string): Promise<ModelUsage> {
		const records = await this.readExecutionRecordsForSession(sessionFilePath);
		if (records.length > 0) {
			const model = await this.getSessionModelTitle(sessionFilePath);
			const usage: ModelUsage = { [model]: { inputTokens: 0, outputTokens: 0, sessions: 0 } };
			for (const record of records) {
				usage[model].inputTokens += record.inputTokens;
				usage[model].outputTokens += record.outputTokens;
			}
			return usage;
		}
		return this.getModelUsageFromSessionFileText(sessionFilePath);
	}

	/** The model title recorded in the session's promptLogs (falls back to 'agent'). */
	private async getSessionModelTitle(sessionFilePath: string): Promise<string> {
		const session = await this.readSessionFile(sessionFilePath);
		for (const item of Array.isArray(session?.history) ? session.history : []) {
			if (!Array.isArray(item.promptLogs)) { continue; }
			for (const log of item.promptLogs) {
				const title = (log.modelTitle as string) || (log.completionOptions?.model as string);
				if (title) { return title; }
			}
		}
		return 'agent';
	}

	/** Fallback per-model usage from the session file's promptLogs. */
	private async getModelUsageFromSessionFileText(sessionFilePath: string): Promise<ModelUsage> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) { return {}; }
		const modelUsage: ModelUsage = {};
		for (const item of session.history) {
			if (!Array.isArray(item.promptLogs)) { continue; }
			for (const log of item.promptLogs) {
				const model: string = (log.modelTitle as string) || (log.completionOptions?.model as string) || 'unknown';
				if (!modelUsage[model]) {
					modelUsage[model] = { inputTokens: 0, outputTokens: 0, sessions: 0 };
				}
				modelUsage[model].inputTokens += this.estimateTokens((log.prompt as string) || '');
				modelUsage[model].outputTokens += this.estimateTokens((log.completion as string) || '');
			}
		}
		return modelUsage;
	}

	/**
	 * Read the per-workspace sessions.json index for a given session file and
	 * return the entry for that session, if present.
	 */
	async readSessionIndexEntry(sessionFilePath: string): Promise<KiroSessionIndexEntry | undefined> {
		const indexPath = path.join(path.dirname(sessionFilePath), 'sessions.json');
		const sessionId = path.basename(sessionFilePath, '.json');
		try {
			const entries: any[] = JSON.parse(await fs.promises.readFile(indexPath, 'utf8'));
			if (!Array.isArray(entries)) { return undefined; }
			const entry = entries.find(e => e?.sessionId === sessionId);
			if (!entry) { return undefined; }
			return {
				dateCreated: entry.dateCreated ? Number(entry.dateCreated) : undefined,
				title: entry.title as string | undefined,
				workspaceDirectory: entry.workspaceDirectory as string | undefined,
			};
		} catch {
			return undefined;
		}
	}

	/**
	 * Decode a workspace-sessions folder name back to the workspace path.
	 * The folder name is the workspace path base64-encoded with '=' padding
	 * replaced by '_'.
	 */
	decodeWorkspaceDirName(dirName: string): string | undefined {
		try {
			const decoded = Buffer.from(dirName.replace(/_/g, '='), 'base64').toString('utf8');
			// Sanity check: a workspace path is expected to look like a path.
			if (/^([a-zA-Z]:[\\/]|\/)/.test(decoded)) { return decoded; }
			return undefined;
		} catch {
			return undefined;
		}
	}

	/**
	 * Get session metadata (title, timestamps, workspace) for a Kiro session.
	 */
	async getKiroSessionMeta(sessionFilePath: string): Promise<{
		title: string | undefined;
		firstInteraction: string | null;
		lastInteraction: string | null;
		workspacePath?: string;
	}> {
		const session = await this.readSessionFile(sessionFilePath);
		const indexEntry = await this.readSessionIndexEntry(sessionFilePath);
		let firstInteraction: string | null = null;
		let lastInteraction: string | null = null;
		if (indexEntry?.dateCreated && Number.isFinite(indexEntry.dateCreated)) {
			firstInteraction = new Date(indexEntry.dateCreated).toISOString();
		}
		try {
			const fileStat = await fs.promises.stat(sessionFilePath);
			lastInteraction = fileStat.mtime.toISOString();
			if (!firstInteraction) { firstInteraction = fileStat.birthtime.toISOString(); }
		} catch { /* ignore */ }
		const workspacePath = indexEntry?.workspaceDirectory
			?? this.decodeWorkspaceDirName(path.basename(path.dirname(sessionFilePath)));
		return {
			title: indexEntry?.title ?? (session?.title as string | undefined),
			firstInteraction,
			lastInteraction,
			workspacePath,
		};
	}

	/**
	 * Return per-local-day token fractions based on execution record start times.
	 */
	async getKiroDailyFractions(sessionFilePath: string): Promise<Record<string, number>> {
		const records = await this.readExecutionRecordsForSession(sessionFilePath);
		const totalTokens = records.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0);
		if (records.length === 0 || totalTokens === 0) {
			const meta = await this.getKiroSessionMeta(sessionFilePath);
			const fallbackMs = meta.firstInteraction ? Date.parse(meta.firstInteraction) : NaN;
			const fallback = Number.isFinite(fallbackMs) ? toLocalDayKey(new Date(fallbackMs)) : toLocalDayKey(new Date());
			return { [fallback]: 1.0 };
		}
		const tokensPerDay = new Map<string, number>();
		for (const record of records) {
			const dayKey = record.startTimeMs !== null ? toLocalDayKey(new Date(record.startTimeMs)) : toLocalDayKey(new Date());
			tokensPerDay.set(dayKey, (tokensPerDay.get(dayKey) ?? 0) + record.inputTokens + record.outputTokens);
		}
		const fractions: Record<string, number> = {};
		for (const [dayKey, tokens] of tokensPerDay.entries()) {
			fractions[dayKey] = tokens / totalTokens;
		}
		return fractions;
	}

	/**
	 * Extract user text from a history item's message content.
	 * Content can be an array of {type, text} objects or a plain string.
	 */
	extractUserText(messageContent: unknown): string {
		if (typeof messageContent === 'string') { return messageContent; }
		if (Array.isArray(messageContent)) {
			return messageContent
				.filter((c: any) => c.type === 'text' && typeof c.text === 'string')
				.map((c: any) => c.text as string)
				.join('\n');
		}
		return '';
	}

	/**
	 * Build chat turns from a Kiro session's history array, enriched with the
	 * matching agent execution records (real response text, tool calls, token
	 * estimates, and timestamps) joined via each history item's executionId.
	 */
	async buildKiroTurns(sessionFilePath: string): Promise<KiroTurn[]> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) { return []; }
		const history: any[] = session.history;
		const turns: KiroTurn[] = [];
		let i = 0;
		while (i < history.length) {
			if (history[i].message?.role !== 'user') { i++; continue; }
			const { turn, nextIndex } = this.buildTurnFromHistory(history, i);
			turns.push(turn);
			i = nextIndex;
		}
		const records = await this.readExecutionRecordsForSession(sessionFilePath);
		if (records.length > 0) {
			const recordsById = new Map(records.map(r => [r.executionId, r]));
			for (const turn of turns) {
				this.enrichTurnWithExecutionRecords(turn, recordsById);
			}
		}
		return turns;
	}

	/** Replace a turn's placeholder data with its execution records' real data. */
	private enrichTurnWithExecutionRecords(turn: KiroTurn, recordsById: Map<string, KiroExecutionRecord>): void {
		const turnRecords = turn.executionIds
			.map(id => recordsById.get(id))
			.filter((r): r is KiroExecutionRecord => r !== undefined);
		if (turnRecords.length === 0) { return; }
		const responseTexts = turnRecords.map(r => r.responseText).filter(t => t.length > 0);
		if (responseTexts.length > 0) { turn.assistantText = responseTexts.join('\n\n'); }
		turn.toolCalls = turnRecords.flatMap(r => r.toolCalls);
		turn.inputTokens = turnRecords.reduce((sum, r) => sum + r.inputTokens, 0);
		turn.outputTokens = turnRecords.reduce((sum, r) => sum + r.outputTokens, 0);
		turn.timestampMs = turnRecords[0].startTimeMs;
	}

	private buildTurnFromHistory(history: any[], start: number): { turn: KiroTurn; nextIndex: number } {
		const turn: KiroTurn = {
			userText: this.extractUserText(history[start].message.content),
			assistantText: '',
			model: null,
			toolCalls: [],
			inputTokens: 0,
			outputTokens: 0,
			timestampMs: null,
			executionIds: [],
		};
		this.applyPromptLogs(history[start], turn);
		let j = start + 1;
		while (j < history.length && history[j].message?.role !== 'user') {
			const sub = history[j];
			if (sub.message?.role === 'assistant') {
				if (typeof sub.executionId === 'string') { turn.executionIds.push(sub.executionId); }
				if (typeof sub.message.content === 'string' && sub.message.content) {
					turn.assistantText += (turn.assistantText ? '\n\n' : '') + sub.message.content;
				}
				this.applyPromptLogs(sub, turn);
				this.collectToolCalls(sub, turn);
			}
			j++;
		}
		return { turn, nextIndex: j };
	}

	private applyPromptLogs(item: any, turn: KiroTurn): void {
		if (!Array.isArray(item.promptLogs)) { return; }
		for (const log of item.promptLogs) {
			if (log.modelTitle && !turn.model) { turn.model = log.modelTitle as string; }
			turn.inputTokens += this.estimateTokens((log.prompt as string) || '');
			turn.outputTokens += this.estimateTokens((log.completion as string) || '');
		}
	}

	private collectToolCalls(sub: any, turn: KiroTurn): void {
		if (!Array.isArray(sub.message?.toolCalls)) { return; }
		for (const toolCall of sub.message.toolCalls) {
			turn.toolCalls.push({
				toolName: toolCall.function?.name || toolCall.name || 'unknown',
				arguments: toolCall.function?.arguments,
			});
		}
	}
}
