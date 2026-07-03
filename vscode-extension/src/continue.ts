/**
 * Continue extension data access layer.
 * Handles reading session data from the Continue VS Code extension's JSON session files.
 * Sessions are stored at: ~/.continue/sessions/<uuid>.json
 * Token data is estimated from the full prompt/completion text stored in history[].promptLogs[].
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ModelUsage } from './types';
import { normalizePathForComparison } from './workspaceHelpers';


type ContinueTurn = {
	userText: string;
	assistantText: string;
	model: string | null;
	toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>;
	inputTokens: number;
	outputTokens: number;
};

type TurnState = {
	assistantText: string;
	model: string | null;
	inputTokens: number;
	outputTokens: number;
	toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>;
	pendingToolCalls: Map<string, { toolName: string; arguments?: string }>;
};

export class ContinueDataAccess {

	/**
	 * Get the Continue data directory path (~/.continue).
	 */
	getContinueDataDir(): string {
		return path.join(os.homedir(), '.continue');
	}

	/**
	 * Get the Continue sessions directory path (~/.continue/sessions).
	 */
	getContinueSessionsDir(): string {
		return path.join(this.getContinueDataDir(), 'sessions');
	}

	/**
	 * Check if a file path is a Continue session file.
	 */
	isContinueSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		return normalized.includes('/.continue/sessions/') && normalized.endsWith('.json');
	}

	/**
	 * Get all Continue session file paths.
	 * Excludes the index file (sessions.json).
	 */
	async getContinueSessionFiles(): Promise<string[]> {
		const sessionsDir = this.getContinueSessionsDir();
		try {
			await fs.promises.access(sessionsDir);
		} catch {
			return [];
		}
		try {
			const entries = await fs.promises.readdir(sessionsDir);
			return entries
				.filter(f => f.endsWith('.json') && f !== 'sessions.json')
				.map(f => path.join(sessionsDir, f));
		} catch {
			return [];
		}
	}

	private async readSessionFile(sessionFilePath: string): Promise<any | null> {
		try {
			const content = await fs.promises.readFile(sessionFilePath, 'utf8');
			return JSON.parse(content);
		} catch {
			return null;
		}
	}

	/**
	 * Estimate token count from a text string.
	 * Uses ~4 characters per token (the standard rough estimate for English text).
	 */
	private estimateTokens(text: string): number {
		if (!text) { return 0; }
		return Math.ceil(text.length / 4);
	}

	/**
	 * Get token counts from a Continue session.
	 * Continue stores full prompt and completion text in history[].promptLogs[]:
	 *   log.prompt     = full prompt text sent to the model (cumulative context)
	 *   log.completion = full completion text returned by the model
	 * Token counts are estimated from text length (~4 chars/token).
	 */
	async getTokensFromContinueSession(sessionFilePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) {
			return { tokens: 0, thinkingTokens: 0 };
		}
		let totalPrompt = 0;
		let totalCompletion = 0;
		for (const item of session.history) {
			if (!Array.isArray(item.promptLogs)) { continue; }
			for (const log of item.promptLogs) {
				totalPrompt += this.estimateTokens((log.prompt as string) || '');
				totalCompletion += this.estimateTokens((log.completion as string) || '');
			}
		}
		return { tokens: totalPrompt + totalCompletion, thinkingTokens: 0 };
	}

	/**
	 * Count user interactions (user messages) in a Continue session.
	 */
	async countContinueInteractions(sessionFilePath: string): Promise<number> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) { return 0; }
		return session.history.filter((item: any) => item.message?.role === 'user').length;
	}

	/**
	 * Get per-model token usage from a Continue session.
	 * Reads modelTitle from each promptLog entry, falls back to session.chatModelTitle.
	 */
	async getContinueModelUsage(sessionFilePath: string): Promise<ModelUsage> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) { return {}; }
		const modelUsage: ModelUsage = {};
		for (const item of session.history) {
			if (!Array.isArray(item.promptLogs)) { continue; }
			for (const log of item.promptLogs) {
				const model: string = (log.modelTitle as string) || (session.chatModelTitle as string) || 'unknown';
				if (!modelUsage[model]) {
					modelUsage[model] = { inputTokens: 0, outputTokens: 0 };
				}
				modelUsage[model].inputTokens += this.estimateTokens((log.prompt as string) || '');
				modelUsage[model].outputTokens += this.estimateTokens((log.completion as string) || '');
			}
		}
		return modelUsage;
	}

	/**
	 * Read session metadata (title, model, workspace) from a Continue session file.
	 */
	async getContinueSessionMeta(sessionFilePath: string): Promise<{ title?: string; model?: string; workspaceDirectory?: string; mode?: string } | null> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session) { return null; }
		return {
			title: session.title as string | undefined,
			model: session.chatModelTitle as string | undefined,
			workspaceDirectory: session.workspaceDirectory as string | undefined,
			mode: session.mode as string | undefined
		};
	}

	/**
	 * Read the sessions.json index and return a map of sessionId -> {dateCreated, title, workspaceDirectory}.
	 * dateCreated is stored as a string of Unix ms in the index.
	 */
	async readSessionsIndex(): Promise<Map<string, { dateCreated?: number; title?: string; workspaceDirectory?: string }>> {
		const indexPath = path.join(this.getContinueSessionsDir(), 'sessions.json');
		const result = new Map<string, { dateCreated?: number; title?: string; workspaceDirectory?: string }>();
		try {
			const content = await fs.promises.readFile(indexPath, 'utf8');
			const entries: any[] = JSON.parse(content);
			if (!Array.isArray(entries)) { return result; }
			for (const entry of entries) {
				if (!entry.sessionId) { continue; }
				result.set(entry.sessionId as string, {
					dateCreated: entry.dateCreated ? Number(entry.dateCreated) : undefined,
					title: entry.title as string | undefined,
					workspaceDirectory: entry.workspaceDirectory as string | undefined
				});
			}
		} catch {
			// Index may not exist or be unreadable
		}
		return result;
	}

	/**
	 * Get the session ID (UUID) from a Continue session file path.
	 */
	getContinueSessionId(sessionFilePath: string): string {
		return path.basename(sessionFilePath, '.json');
	}

	/**
	 * Extract user text from a Continue history item's message content.
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
	 * Build chat turns from a Continue session's history array.
	 * Returns an array of turn objects for the log viewer.
	 */
	async buildContinueTurns(sessionFilePath: string): Promise<ContinueTurn[]> {
		const session = await this.readSessionFile(sessionFilePath);
		if (!session || !Array.isArray(session.history)) { return []; }

		const history: any[] = session.history;
		const turns: ContinueTurn[] = [];
		let i = 0;
		while (i < history.length) {
			const item = history[i];
			if (item.message?.role !== 'user') { i++; continue; }
			const { turn, nextIndex } = this.buildTurnFromHistory(history, i, session.chatModelTitle || null);
			turns.push(turn);
			i = nextIndex;
		}
		return turns;
	}

	private buildTurnFromHistory(history: any[], i: number, defaultModel: string | null): { turn: ContinueTurn; nextIndex: number } {
		const userText = this.extractUserText(history[i].message.content);
		const state: TurnState = {
			assistantText: '',
			model: defaultModel,
			inputTokens: 0,
			outputTokens: 0,
			toolCalls: [],
			pendingToolCalls: new Map(),
		};
		let j = i + 1;
		while (j < history.length && history[j].message?.role !== 'user') {
			const sub = history[j];
			const role = sub.message?.role;
			if (role === 'assistant') { this.processAssistantSubItem(sub, state); }
			else if (role === 'tool') { this.processToolSubItem(sub, state); }
			j++;
		}
		for (const [, pending] of state.pendingToolCalls) { state.toolCalls.push(pending); }
		return {
			turn: { userText, assistantText: state.assistantText, model: state.model, toolCalls: state.toolCalls, inputTokens: state.inputTokens, outputTokens: state.outputTokens },
			nextIndex: j
		};
	}

	private processAssistantSubItem(sub: any, state: TurnState): void {
		if (typeof sub.message.content === 'string' && sub.message.content) {
			state.assistantText += sub.message.content;
		}
		if (Array.isArray(sub.promptLogs) && sub.promptLogs.length > 0) {
			const log = sub.promptLogs[0];
			if (log.modelTitle) { state.model = log.modelTitle as string; }
			for (const plog of sub.promptLogs) {
				state.inputTokens += this.estimateTokens((plog.prompt as string) || '');
				state.outputTokens += this.estimateTokens((plog.completion as string) || '');
			}
		}
		this.collectToolCallsFromAssistant(sub, state);
	}

	private collectToolCallsFromAssistant(sub: any, state: TurnState): void {
		if (!Array.isArray(sub.message.toolCalls)) { return; }
		for (const tc of sub.message.toolCalls) {
			const toolName: string = tc.function?.name || tc.name || 'unknown';
			const args: string | undefined = tc.function?.arguments;
			const callId: string = tc.id || toolName;
			state.pendingToolCalls.set(callId, { toolName, arguments: args });
		}
	}

	private processToolSubItem(sub: any, state: TurnState): void {
		const callId: string = sub.message.toolCallId || '';
		const resultText = this.extractUserText(sub.message.content);
		const pending = state.pendingToolCalls.get(callId);
		if (pending) {
			state.toolCalls.push({ ...pending, result: resultText });
			state.pendingToolCalls.delete(callId);
		} else {
			state.toolCalls.push({ toolName: 'unknown', result: resultText });
		}
	}
}
