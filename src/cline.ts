/**
 * Cline VS Code extension data access layer.
 * Handles reading task/session data from the Cline extension (saoudrizwan.claude-dev).
 *
 * Storage layout (one folder per task under the host editor's globalStorage):
 *
 *   Windows: %APPDATA%\<Variant>\User\globalStorage\saoudrizwan.claude-dev\tasks\<taskId>\
 *   macOS:   ~/Library/Application Support/<Variant>/User/globalStorage/saoudrizwan.claude-dev/tasks/<taskId>/
 *   Linux:   ~/.config/<Variant>/User/globalStorage/saoudrizwan.claude-dev/tasks/<taskId>/
 *
 * where <Variant> is any VS Code family host (Code, Code - Insiders, VSCodium,
 * Cursor, ...). <taskId> is the task's start time in epoch milliseconds.
 * Each task folder contains:
 *   - ui_messages.json              — ordered say/ask UI messages (ts in epoch ms).
 *     "api_req_started" messages carry real per-request API token counts in their
 *     JSON text field: { tokensIn, tokensOut, cacheWrites, cacheReads, cost }.
 *   - api_conversation_history.json — raw Anthropic-style message array with
 *     per-assistant-message metrics { tokens: { prompt, completion, cached }, cost }.
 *   - task_metadata.json            — model_usage[] (model_id, provider, mode) and
 *     environment_history[] (host editor name/version, cline version).
 *
 * A sibling index at <globalStorage>/saoudrizwan.claude-dev/state/taskHistory.json
 * holds per-task summaries: id, ts, task (title), tokensIn/tokensOut,
 * cacheWrites/cacheReads, totalCost, cwdOnTaskInitialization, modelId.
 *
 * The canonical session file path used throughout the pipeline is the task's
 * ui_messages.json file. Token counts are REAL API counts (not estimates).
 *
 * Note: the standalone Cline app data dir (~/.cline/data) only stores settings
 * (globalState.json, per-workspace rules toggles) — no session data lives there.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { ModelUsage } from './types';
import { isUnsafeObjectKey } from './utils/protoGuard';
import { normalizePathForComparison } from './workspaceHelpers';
import { toLocalDayKey } from './utils/dayKeys';
import { getVSCodeUserPaths } from './adapters/copilotChatAdapter';

/** Marker folder name owned by the Cline extension inside globalStorage. */
const CLINE_STORAGE_FOLDER = 'saoudrizwan.claude-dev';

/** One raw UI message from ui_messages.json. */
export interface ClineUiMessage {
	ts?: number;
	type?: 'say' | 'ask';
	say?: string;
	ask?: string;
	text?: string;
	modelInfo?: { providerId?: string; modelId?: string; mode?: string };
}

/** One completed API request parsed from an "api_req_started" UI message. */
export interface ClineApiRequest {
	/** Epoch ms of the request. */
	ts: number | null;
	tokensIn: number;
	tokensOut: number;
	cacheWrites: number;
	cacheReads: number;
	cost: number;
	model: string | null;
	/** 'act' or 'plan'. */
	mode: string | null;
}

/** Entry from state/taskHistory.json (per-task authoritative totals). */
export interface ClineTaskHistoryEntry {
	id?: string;
	ts?: number;
	task?: string;
	tokensIn?: number;
	tokensOut?: number;
	cacheWrites?: number;
	cacheReads?: number;
	totalCost?: number;
	cwdOnTaskInitialization?: string;
	modelId?: string;
}

/** One reconstructed chat turn (user prompt + everything until the next prompt). */
export type ClineTurn = {
	userText: string;
	assistantText: string;
	model: string | null;
	/** 'act' → agent, 'plan' → plan. */
	mode: string | null;
	toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>;
	mcpTools: Array<{ server: string; tool: string }>;
	/** Real API input tokens (incl. cache reads/writes) summed over the turn's requests. */
	inputTokens: number;
	/** Real API output tokens summed over the turn's requests. */
	outputTokens: number;
	/** Epoch ms of the turn's user message, when available. */
	timestampMs: number | null;
};

/** Say/ask subtypes that start a new turn (user-authored messages). */
const USER_MESSAGE_SUBTYPES = new Set(['task', 'user_feedback']);

export class ClineDataAccess {

	/** Per-file cache of parsed ui_messages.json keyed by mtime. */
	private _uiMessagesCache = new Map<string, { mtimeMs: number; parsed: ClineUiMessage[] }>();

	/**
	 * All candidate saoudrizwan.claude-dev globalStorage roots across VS Code
	 * family variants (Code, Insiders, VSCodium, Cursor, server installs, ...).
	 */
	getClineStorageDirs(): string[] {
		return getVSCodeUserPaths().map(userPath => path.join(userPath, 'globalStorage', CLINE_STORAGE_FOLDER));
	}

	/** All candidate tasks directories (one per VS Code variant). */
	getClineTasksDirs(): string[] {
		return this.getClineStorageDirs().map(dir => path.join(dir, 'tasks'));
	}

	/**
	 * Check if a file path is a Cline session file
	 * (<...>/saoudrizwan.claude-dev/tasks/<taskId>/ui_messages.json).
	 */
	isClineSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		return normalized.includes(`/${CLINE_STORAGE_FOLDER}/tasks/`)
			&& normalized.endsWith('/ui_messages.json');
	}

	/**
	 * The saoudrizwan.claude-dev storage root that contains this session file.
	 * Falls back to the first (stable VS Code) candidate root when the marker
	 * folder is not present in the path.
	 */
	getClineRootFromSessionFile(sessionFilePath: string): string {
		const normalized = sessionFilePath.replace(/\\/g, '/');
		const idx = normalized.toLowerCase().indexOf(`/${CLINE_STORAGE_FOLDER}/`.toLowerCase());
		if (idx !== -1) {
			return sessionFilePath.slice(0, idx + 1 + CLINE_STORAGE_FOLDER.length);
		}
		return this.getClineStorageDirs()[0];
	}

	/**
	 * Discover all Cline session files (ui_messages.json per task folder)
	 * across all VS Code variant storage roots.
	 */
	async getClineSessionFiles(): Promise<string[]> {
		const files: string[] = [];
		for (const tasksDir of this.getClineTasksDirs()) {
			let taskFolders: fs.Dirent[];
			try {
				taskFolders = await fs.promises.readdir(tasksDir, { withFileTypes: true });
			} catch {
				continue; // variant not installed / no Cline data
			}
			for (const folder of taskFolders) {
				if (!folder.isDirectory()) { continue; }
				const uiMessagesPath = path.join(tasksDir, folder.name, 'ui_messages.json');
				try {
					await fs.promises.access(uiMessagesPath);
					files.push(uiMessagesPath);
				} catch { /* task folder without ui_messages.json — skip */ }
			}
		}
		return files;
	}

	/** Read and parse the session's ui_messages.json (mtime-cached). */
	async readUiMessages(sessionFilePath: string): Promise<ClineUiMessage[]> {
		let stat: fs.Stats;
		try {
			stat = await fs.promises.stat(sessionFilePath);
		} catch {
			return [];
		}
		const cached = this._uiMessagesCache.get(sessionFilePath);
		if (cached && cached.mtimeMs === stat.mtimeMs) { return cached.parsed; }
		let parsed: ClineUiMessage[] = [];
		try {
			const raw = JSON.parse(await fs.promises.readFile(sessionFilePath, 'utf8'));
			if (Array.isArray(raw)) { parsed = raw; }
		} catch { /* unreadable/corrupt file — treat as empty */ }
		this._uiMessagesCache.set(sessionFilePath, { mtimeMs: stat.mtimeMs, parsed });
		return parsed;
	}

	/**
	 * Extract the completed API requests (with real token counts) from the
	 * session's "api_req_started" UI messages. Requests whose token fields were
	 * never filled in (e.g. the request is still streaming) are skipped.
	 */
	async getApiRequests(sessionFilePath: string): Promise<ClineApiRequest[]> {
		const messages = await this.readUiMessages(sessionFilePath);
		const requests: ClineApiRequest[] = [];
		for (const msg of messages) {
			if (msg.say !== 'api_req_started' || typeof msg.text !== 'string') { continue; }
			let info: any;
			try { info = JSON.parse(msg.text); } catch { continue; }
			if (typeof info?.tokensIn !== 'number' && typeof info?.tokensOut !== 'number') { continue; }
			requests.push({
				ts: typeof msg.ts === 'number' ? msg.ts : null,
				tokensIn: this.asNumber(info.tokensIn),
				tokensOut: this.asNumber(info.tokensOut),
				cacheWrites: this.asNumber(info.cacheWrites),
				cacheReads: this.asNumber(info.cacheReads),
				cost: this.asNumber(info.cost),
				model: msg.modelInfo?.modelId ?? null,
				mode: msg.modelInfo?.mode ?? null,
			});
		}
		return requests;
	}

	/**
	 * Read this task's entry from the sibling state/taskHistory.json index
	 * (authoritative per-task totals written by Cline itself).
	 */
	async readTaskHistoryEntry(sessionFilePath: string): Promise<ClineTaskHistoryEntry | undefined> {
		const taskId = path.basename(path.dirname(sessionFilePath));
		const historyPath = path.join(this.getClineRootFromSessionFile(sessionFilePath), 'state', 'taskHistory.json');
		try {
			const entries = JSON.parse(await fs.promises.readFile(historyPath, 'utf8'));
			if (!Array.isArray(entries)) { return undefined; }
			return entries.find((e: any) => e?.id === taskId);
		} catch {
			return undefined;
		}
	}

	/** Total input tokens (incl. cache writes + reads) for one API request. */
	private requestInputTokens(req: ClineApiRequest): number {
		return req.tokensIn + req.cacheWrites + req.cacheReads;
	}

	/**
	 * Get REAL API token counts for a Cline session. Prefers the per-request
	 * counts recorded on api_req_started messages; falls back to the task's
	 * taskHistory.json totals when no per-request data is available.
	 * Input tokens include cache creation and cache reads (same formula as the
	 * Claude Code adapter). Thinking tokens are not tracked separately by Cline
	 * (reasoning output is included in tokensOut).
	 */
	async getTokensFromClineSession(sessionFilePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const requests = await this.getApiRequests(sessionFilePath);
		if (requests.length > 0) {
			let total = 0;
			for (const req of requests) {
				total += this.requestInputTokens(req) + req.tokensOut;
			}
			return { tokens: total, thinkingTokens: 0 };
		}
		const entry = await this.readTaskHistoryEntry(sessionFilePath);
		if (entry) {
			const total = this.asNumber(entry.tokensIn) + this.asNumber(entry.tokensOut)
				+ this.asNumber(entry.cacheWrites) + this.asNumber(entry.cacheReads);
			return { tokens: total, thinkingTokens: 0 };
		}
		return { tokens: 0, thinkingTokens: 0 };
	}

	/**
	 * Count user interactions: the initial task prompt plus any follow-up
	 * user_feedback messages.
	 */
	async countClineInteractions(sessionFilePath: string): Promise<number> {
		const messages = await this.readUiMessages(sessionFilePath);
		return messages.filter(m => m.type === 'say' && USER_MESSAGE_SUBTYPES.has(m.say ?? '')).length;
	}

	/**
	 * Get per-model REAL token usage from a Cline session, with cache-read and
	 * cache-creation breakdowns. Falls back to taskHistory.json totals (which
	 * carry only the last-used modelId) when per-request data is unavailable.
	 */
	async getClineModelUsage(sessionFilePath: string): Promise<ModelUsage> {
		const requests = await this.getApiRequests(sessionFilePath);
		const usage: ModelUsage = {};
		if (requests.length > 0) {
			for (const req of requests) {
				this.addRequestToModelUsage(usage, req.model ?? 'unknown', this.requestInputTokens(req), req.tokensOut, req.cacheReads, req.cacheWrites);
			}
			return usage;
		}
		const entry = await this.readTaskHistoryEntry(sessionFilePath);
		if (entry) {
			const cacheReads = this.asNumber(entry.cacheReads);
			const cacheWrites = this.asNumber(entry.cacheWrites);
			const inputTokens = this.asNumber(entry.tokensIn) + cacheReads + cacheWrites;
			this.addRequestToModelUsage(usage, entry.modelId ?? 'unknown', inputTokens, this.asNumber(entry.tokensOut), cacheReads, cacheWrites);
		}
		return usage;
	}

	private addRequestToModelUsage(usage: ModelUsage, model: string, inputTokens: number, outputTokens: number, cacheReads: number, cacheWrites: number): void {
		// Untrusted `model` string from parsed session JSON — see protoGuard.ts.
		if (isUnsafeObjectKey(model)) { return; }
		if (!usage[model]) {
			usage[model] = { inputTokens: 0, outputTokens: 0, sessions: 0 };
		}
		usage[model].inputTokens += inputTokens;
		usage[model].outputTokens += outputTokens;
		if (cacheReads > 0) {
			usage[model].cachedReadTokens = (usage[model].cachedReadTokens ?? 0) + cacheReads;
		}
		if (cacheWrites > 0) {
			usage[model].cacheCreationTokens = (usage[model].cacheCreationTokens ?? 0) + cacheWrites;
		}
	}

	/**
	 * Get session metadata (title, timestamps, workspace) for a Cline session.
	 * The task folder name is the task's start time in epoch ms, used as a
	 * fallback when no messages/history are available.
	 */
	async getClineSessionMeta(sessionFilePath: string): Promise<{
		title: string | undefined;
		firstInteraction: string | null;
		lastInteraction: string | null;
		workspacePath?: string;
	}> {
		const messages = await this.readUiMessages(sessionFilePath);
		const entry = await this.readTaskHistoryEntry(sessionFilePath);
		const firstTs = messages.find(m => typeof m.ts === 'number')?.ts
			?? this.taskIdToEpochMs(sessionFilePath);
		let lastTs: number | undefined;
		for (const msg of messages) {
			if (typeof msg.ts === 'number') { lastTs = msg.ts; }
		}
		const taskMessage = messages.find(m => m.say === 'task');
		return {
			title: entry?.task ?? taskMessage?.text ?? undefined,
			firstInteraction: firstTs !== undefined ? new Date(firstTs).toISOString() : null,
			lastInteraction: lastTs !== undefined ? new Date(lastTs).toISOString() : (firstTs !== undefined ? new Date(firstTs).toISOString() : null),
			workspacePath: entry?.cwdOnTaskInitialization,
		};
	}

	/** The task folder name is the task's start time in epoch ms. */
	private taskIdToEpochMs(sessionFilePath: string): number | undefined {
		const taskId = path.basename(path.dirname(sessionFilePath));
		const parsed = Number(taskId);
		// Sanity range: 2000-01-01 .. 2100-01-01 in epoch ms.
		if (Number.isFinite(parsed) && parsed > 946684800000 && parsed < 4102444800000) { return parsed; }
		return undefined;
	}

	/**
	 * Return per-local-day token fractions based on per-request timestamps,
	 * so multi-day tasks attribute tokens to the correct days.
	 */
	async getClineDailyFractions(sessionFilePath: string): Promise<Record<string, number>> {
		const requests = await this.getApiRequests(sessionFilePath);
		const totalTokens = requests.reduce((sum, r) => sum + this.requestInputTokens(r) + r.tokensOut, 0);
		if (requests.length === 0 || totalTokens === 0) {
			const meta = await this.getClineSessionMeta(sessionFilePath);
			const fallbackMs = meta.firstInteraction ? Date.parse(meta.firstInteraction) : NaN;
			const fallback = Number.isFinite(fallbackMs) ? toLocalDayKey(new Date(fallbackMs)) : toLocalDayKey(new Date());
			return { [fallback]: 1.0 };
		}
		const tokensPerDay = new Map<string, number>();
		for (const req of requests) {
			const dayKey = req.ts !== null ? toLocalDayKey(new Date(req.ts)) : toLocalDayKey(new Date());
			tokensPerDay.set(dayKey, (tokensPerDay.get(dayKey) ?? 0) + this.requestInputTokens(req) + req.tokensOut);
		}
		const fractions: Record<string, number> = {};
		for (const [dayKey, tokens] of tokensPerDay.entries()) {
			fractions[dayKey] = tokens / totalTokens;
		}
		return fractions;
	}

	/**
	 * Build chat turns from the session's UI messages. A turn starts at each
	 * user-authored message (initial "task" or later "user_feedback") and
	 * collects assistant text, tool invocations, MCP calls, and real per-request
	 * token counts until the next user message.
	 */
	async buildClineTurns(sessionFilePath: string): Promise<ClineTurn[]> {
		const messages = await this.readUiMessages(sessionFilePath);
		const turns: ClineTurn[] = [];
		let current: ClineTurn | null = null;
		for (const msg of messages) {
			const subtype = msg.say ?? msg.ask ?? '';
			if (msg.type === 'say' && USER_MESSAGE_SUBTYPES.has(subtype)) {
				current = this.newTurn(msg);
				turns.push(current);
				continue;
			}
			if (!current) {
				// Defensive: session file without a leading task message.
				current = this.newTurn(undefined);
				turns.push(current);
			}
			this.applyMessageToTurn(current, msg, subtype);
		}
		return turns;
	}

	private newTurn(userMsg: ClineUiMessage | undefined): ClineTurn {
		return {
			userText: userMsg?.text ?? '',
			assistantText: '',
			model: userMsg?.modelInfo?.modelId ?? null,
			mode: userMsg?.modelInfo?.mode ?? null,
			toolCalls: [],
			mcpTools: [],
			inputTokens: 0,
			outputTokens: 0,
			timestampMs: typeof userMsg?.ts === 'number' ? userMsg.ts : null,
		};
	}

	/** Route one non-user UI message into the current turn. */
	private applyMessageToTurn(turn: ClineTurn, msg: ClineUiMessage, subtype: string): void {
		switch (subtype) {
			case 'api_req_started':
				this.applyApiRequestToTurn(turn, msg);
				break;
			case 'text':
			case 'completion_result':
				this.appendAssistantText(turn, msg.text);
				break;
			case 'tool':
				this.applyToolMessageToTurn(turn, msg);
				break;
			case 'command':
				turn.toolCalls.push({ toolName: 'executeCommand', arguments: msg.text });
				break;
			case 'command_output': {
				const last = turn.toolCalls[turn.toolCalls.length - 1];
				if (last && last.toolName === 'executeCommand') { last.result = msg.text; }
				break;
			}
			case 'use_mcp_server':
				this.applyMcpMessageToTurn(turn, msg);
				break;
			case 'browser_action_launch':
			case 'browser_action':
				turn.toolCalls.push({ toolName: 'browserAction', arguments: msg.text });
				break;
			default:
				// reasoning, task_progress, checkpoint_created, followup asks, etc. —
				// no turn-level data to record.
				break;
		}
	}

	private applyApiRequestToTurn(turn: ClineTurn, msg: ClineUiMessage): void {
		if (msg.modelInfo?.modelId) { turn.model = msg.modelInfo.modelId; }
		if (msg.modelInfo?.mode) { turn.mode = msg.modelInfo.mode; }
		if (typeof msg.text !== 'string') { return; }
		try {
			const info = JSON.parse(msg.text);
			turn.inputTokens += this.asNumber(info?.tokensIn) + this.asNumber(info?.cacheWrites) + this.asNumber(info?.cacheReads);
			turn.outputTokens += this.asNumber(info?.tokensOut);
		} catch { /* request payload not parseable — skip token accounting */ }
	}

	/**
	 * Append assistant text, stripping any trailing raw tool-call XML that Cline
	 * embeds in the message text (everything from '<tool_call>' onward — the
	 * structured equivalent arrives as a separate 'tool' message).
	 */
	private appendAssistantText(turn: ClineTurn, text: string | undefined): void {
		if (!text) { return; }
		const toolCallIdx = text.indexOf('<tool_call>');
		const cleaned = (toolCallIdx !== -1 ? text.slice(0, toolCallIdx) : text).trim();
		if (!cleaned) { return; }
		turn.assistantText += (turn.assistantText ? '\n\n' : '') + cleaned;
	}

	/** 'tool' messages carry JSON like {"tool":"searchFiles","path":...,"content":...}. */
	private applyToolMessageToTurn(turn: ClineTurn, msg: ClineUiMessage): void {
		if (typeof msg.text !== 'string') { return; }
		try {
			const info = JSON.parse(msg.text);
			turn.toolCalls.push({
				toolName: typeof info?.tool === 'string' ? info.tool : 'tool',
				arguments: typeof info?.path === 'string' ? info.path : undefined,
				result: typeof info?.content === 'string' ? info.content : undefined,
			});
		} catch {
			turn.toolCalls.push({ toolName: 'tool', arguments: msg.text });
		}
	}

	/** 'use_mcp_server' messages carry JSON like {"serverName":...,"toolName":...}. */
	private applyMcpMessageToTurn(turn: ClineTurn, msg: ClineUiMessage): void {
		let server = 'unknown';
		let tool = 'unknown';
		if (typeof msg.text === 'string') {
			try {
				const info = JSON.parse(msg.text);
				if (typeof info?.serverName === 'string') { server = info.serverName; }
				if (typeof info?.toolName === 'string') { tool = info.toolName; }
			} catch { /* keep defaults */ }
		}
		turn.mcpTools.push({ server, tool });
		turn.toolCalls.push({ toolName: `${server}.${tool}` });
	}

	private asNumber(value: unknown): number {
		return typeof value === 'number' && Number.isFinite(value) ? value : 0;
	}
}
