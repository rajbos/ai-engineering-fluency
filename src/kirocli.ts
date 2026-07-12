/**
 * Kiro CLI data access layer.
 * Handles reading session data from the Kiro CLI's per-session files.
 *
 * Sessions are stored at: ~/.kiro/sessions/cli/<uuid>.json
 *   <uuid>.json    — session metadata: session_id, cwd, title, ISO created_at/updated_at,
 *                    per-turn user_turn_metadatas (credits, durations, tool-use counts)
 *   <uuid>.jsonl   — message log: {kind: Prompt|AssistantMessage|ToolResults, data: {...}}
 *   <uuid>.history — one user prompt per line
 *
 * The canonical session file path is the .json metadata file; the .jsonl message
 * log is resolved as a sibling with the same basename.
 *
 * Data caveats:
 *   - input_token_count/output_token_count in the metadata are always 0, so token
 *     counts are estimated from message text (~4 chars/token).
 *   - model_id is "auto" — the actual model is not recorded locally.
 *   - .jsonl meta.timestamp is epoch SECONDS (multiply by 1000 for JS Date);
 *     the .json metadata uses ISO 8601 strings.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ModelUsage } from './types';
import { normalizePathForComparison } from './workspaceHelpers';
import { toLocalDayKey } from './utils/dayKeys';

export interface KiroCliToolUse {
	toolName: string;
	arguments?: string;
}

export interface KiroCliMessageRecord {
	kind: 'Prompt' | 'AssistantMessage' | 'ToolResults';
	/** Concatenated text content of the message. */
	text: string;
	/** Tool invocations (AssistantMessage records only). */
	toolUses: KiroCliToolUse[];
	/** Tool result text keyed by toolUseId (ToolResults records only). */
	toolResults: Array<{ toolUseId: string; text: string }>;
	/** Epoch milliseconds, or null when the record has no timestamp. */
	timestampMs: number | null;
	lineNumber: number;
}

export interface KiroCliSessionMetadata {
	sessionId?: string;
	cwd?: string;
	title?: string;
	createdAt?: string;
	updatedAt?: string;
	modelId?: string;
	turnCount: number;
	/** Total metered cost in credits, summed across all turns/requests. */
	totalCredits: number;
}

export class KiroCliDataAccess {

	/**
	 * Get the Kiro data directory path (~/.kiro).
	 */
	getKiroCliDataDir(): string {
		return path.join(os.homedir(), '.kiro');
	}

	/**
	 * Get the Kiro CLI sessions directory path (~/.kiro/sessions/cli).
	 */
	getKiroCliSessionsDir(): string {
		return path.join(this.getKiroCliDataDir(), 'sessions', 'cli');
	}

	/**
	 * Check if a file path is a Kiro CLI session metadata file (<uuid>.json).
	 */
	isKiroCliSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		return normalized.includes('/.kiro/sessions/cli/') && normalized.endsWith('.json');
	}

	/**
	 * Get all Kiro CLI session file paths (the .json metadata files).
	 */
	async getKiroCliSessionFiles(): Promise<string[]> {
		const sessionsDir = this.getKiroCliSessionsDir();
		try {
			await fs.promises.access(sessionsDir);
		} catch {
			return [];
		}
		try {
			const entries = await fs.promises.readdir(sessionsDir);
			return entries
				.filter(f => f.endsWith('.json'))
				.map(f => path.join(sessionsDir, f));
		} catch {
			return [];
		}
	}

	/**
	 * Resolve the sibling .jsonl message log path for a session .json file.
	 */
	getMessageLogPath(sessionFilePath: string): string {
		return sessionFilePath.replace(/\.json$/, '.jsonl');
	}

	/**
	 * Read session metadata from the .json file.
	 */
	async readSessionMetadata(sessionFilePath: string): Promise<KiroCliSessionMetadata | null> {
		let parsed: any;
		try {
			parsed = JSON.parse(await fs.promises.readFile(sessionFilePath, 'utf8'));
		} catch {
			return null;
		}
		const turnMetadatas: any[] = Array.isArray(parsed?.session_state?.conversation_metadata?.user_turn_metadatas)
			? parsed.session_state.conversation_metadata.user_turn_metadatas
			: [];
		return {
			sessionId: this.asString(parsed?.session_id),
			cwd: this.asString(parsed?.cwd),
			title: this.asString(parsed?.title),
			createdAt: this.asString(parsed?.created_at),
			updatedAt: this.asString(parsed?.updated_at),
			modelId: this.asString(parsed?.session_state?.rts_model_state?.model_info?.model_id),
			turnCount: turnMetadatas.length,
			totalCredits: this.sumMeteredCredits(turnMetadatas),
		};
	}

	private asString(value: unknown): string | undefined {
		return typeof value === 'string' ? value : undefined;
	}

	private sumMeteredCredits(turnMetadatas: any[]): number {
		let totalCredits = 0;
		for (const turn of turnMetadatas) {
			if (!Array.isArray(turn?.metering_usage)) { continue; }
			for (const usage of turn.metering_usage) {
				if (typeof usage?.value === 'number' && Number.isFinite(usage.value)) {
					totalCredits += usage.value;
				}
			}
		}
		return totalCredits;
	}

	/**
	 * Read and parse the .jsonl message log for a session.
	 */
	async readSessionMessages(sessionFilePath: string): Promise<KiroCliMessageRecord[]> {
		const logPath = this.getMessageLogPath(sessionFilePath);
		let raw: string;
		try {
			raw = await fs.promises.readFile(logPath, 'utf8');
		} catch {
			return [];
		}
		const records: KiroCliMessageRecord[] = [];
		const lines = raw.split(/\r?\n/);
		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			if (!line) { continue; }
			let parsed: any;
			try {
				parsed = JSON.parse(line);
			} catch {
				continue;
			}
			const record = this.parseMessageRecord(parsed, i + 1);
			if (record) { records.push(record); }
		}
		return records;
	}

	private parseMessageRecord(parsed: any, lineNumber: number): KiroCliMessageRecord | null {
		const kind = parsed?.kind;
		if (kind !== 'Prompt' && kind !== 'AssistantMessage' && kind !== 'ToolResults') { return null; }
		const data = parsed.data ?? {};
		const record: KiroCliMessageRecord = {
			kind,
			text: '',
			toolUses: [],
			toolResults: [],
			timestampMs: this.toEpochMs(data?.meta?.timestamp),
			lineNumber,
		};
		for (const part of Array.isArray(data.content) ? data.content : []) {
			this.applyContentPart(part, record);
		}
		return record;
	}

	private applyContentPart(part: any, record: KiroCliMessageRecord): void {
		if (part?.kind === 'text' && typeof part.data === 'string') {
			record.text += (record.text ? '\n' : '') + part.data;
			return;
		}
		if (part?.kind === 'toolUse' && part.data) {
			record.toolUses.push({
				toolName: typeof part.data.name === 'string' ? part.data.name : 'unknown',
				arguments: part.data.input !== undefined ? this.safeStringify(part.data.input) : undefined,
			});
			return;
		}
		if (part?.kind === 'toolResult' && part.data) {
			record.toolResults.push({
				toolUseId: typeof part.data.toolUseId === 'string' ? part.data.toolUseId : '',
				text: this.extractToolResultText(part.data),
			});
		}
	}

	private extractToolResultText(data: any): string {
		const parts: string[] = [];
		for (const item of Array.isArray(data.content) ? data.content : []) {
			if (item?.kind === 'text' && typeof item.data === 'string') {
				parts.push(item.data);
			}
		}
		return parts.join('\n');
	}

	/** Convert a .jsonl meta.timestamp (epoch seconds) to epoch milliseconds. */
	private toEpochMs(value: unknown): number | null {
		if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) { return null; }
		return value * 1000;
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
	 * Get estimated token counts for a Kiro CLI session.
	 * The metadata's token counters are always 0, so tokens are estimated from
	 * the message log: prompts + tool results count as input, assistant text +
	 * tool-use arguments count as output.
	 */
	async getTokensFromKiroCliSession(sessionFilePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
		const { inputTokens, outputTokens } = await this.estimateSessionTokens(sessionFilePath);
		return { tokens: inputTokens + outputTokens, thinkingTokens: 0 };
	}

	private async estimateSessionTokens(sessionFilePath: string): Promise<{ inputTokens: number; outputTokens: number }> {
		const records = await this.readSessionMessages(sessionFilePath);
		let inputTokens = 0;
		let outputTokens = 0;
		for (const record of records) {
			if (record.kind === 'AssistantMessage') {
				outputTokens += this.estimateTokens(record.text);
				for (const toolUse of record.toolUses) {
					outputTokens += this.estimateTokens(toolUse.arguments ?? '');
				}
			} else {
				inputTokens += this.estimateTokens(record.text);
				for (const result of record.toolResults) {
					inputTokens += this.estimateTokens(result.text);
				}
			}
		}
		return { inputTokens, outputTokens };
	}

	/**
	 * Count user interactions (Prompt records) in a Kiro CLI session.
	 * Falls back to the metadata turn count when the message log is missing.
	 */
	async countKiroCliInteractions(sessionFilePath: string): Promise<number> {
		const records = await this.readSessionMessages(sessionFilePath);
		const promptCount = records.filter(r => r.kind === 'Prompt').length;
		if (promptCount > 0) { return promptCount; }
		const meta = await this.readSessionMetadata(sessionFilePath);
		return meta?.turnCount ?? 0;
	}

	/**
	 * Get per-model token usage for a Kiro CLI session.
	 * The CLI only records model_id "auto" (server-side routing), so all usage
	 * lands on a single model key.
	 */
	async getKiroCliModelUsage(sessionFilePath: string): Promise<ModelUsage> {
		const meta = await this.readSessionMetadata(sessionFilePath);
		const { inputTokens, outputTokens } = await this.estimateSessionTokens(sessionFilePath);
		if (inputTokens === 0 && outputTokens === 0) { return {}; }
		const model = meta?.modelId || 'unknown';
		return { [model]: { inputTokens, outputTokens } };
	}

	/**
	 * Get session metadata (title, timestamps, workspace) for a Kiro CLI session.
	 */
	async getKiroCliSessionMeta(sessionFilePath: string): Promise<{
		title: string | undefined;
		firstInteraction: string | null;
		lastInteraction: string | null;
		workspacePath?: string;
	}> {
		const meta = await this.readSessionMetadata(sessionFilePath);
		return {
			title: meta?.title,
			firstInteraction: this.toIsoString(meta?.createdAt),
			lastInteraction: this.toIsoString(meta?.updatedAt),
			workspacePath: meta?.cwd,
		};
	}

	private toIsoString(value: string | undefined): string | null {
		if (!value) { return null; }
		const timeMs = Date.parse(value);
		return Number.isFinite(timeMs) ? new Date(timeMs).toISOString() : null;
	}

	/**
	 * Return per-local-day token fractions based on Prompt record timestamps.
	 */
	async getKiroCliDailyFractions(sessionFilePath: string): Promise<Record<string, number>> {
		const records = await this.readSessionMessages(sessionFilePath);
		const dayKeys = records
			.filter(r => r.kind === 'Prompt' && r.timestampMs !== null)
			.map(r => toLocalDayKey(new Date(r.timestampMs as number)));
		if (dayKeys.length === 0) {
			const meta = await this.readSessionMetadata(sessionFilePath);
			const fallbackMs = meta?.createdAt ? Date.parse(meta.createdAt) : NaN;
			const fallback = Number.isFinite(fallbackMs) ? toLocalDayKey(new Date(fallbackMs)) : toLocalDayKey(new Date());
			return { [fallback]: 1.0 };
		}
		const counts = new Map<string, number>();
		for (const dayKey of dayKeys) {
			counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
		}
		const fractions: Record<string, number> = {};
		for (const [dayKey, count] of counts.entries()) {
			fractions[dayKey] = count / dayKeys.length;
		}
		return fractions;
	}

	/**
	 * Group the message log into conversation turns (one per Prompt record).
	 */
	async buildKiroCliTurns(sessionFilePath: string): Promise<Array<{
		userText: string;
		assistantText: string;
		toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>;
		timestampMs: number | null;
		inputTokens: number;
		outputTokens: number;
	}>> {
		const records = await this.readSessionMessages(sessionFilePath);
		const turns: Array<{
			userText: string;
			assistantText: string;
			toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>;
			timestampMs: number | null;
			inputTokens: number;
			outputTokens: number;
		}> = [];
		let current: (typeof turns)[number] | null = null;
		for (const record of records) {
			if (record.kind === 'Prompt') {
				current = {
					userText: record.text,
					assistantText: '',
					toolCalls: [],
					timestampMs: record.timestampMs,
					inputTokens: this.estimateTokens(record.text),
					outputTokens: 0,
				};
				turns.push(current);
				continue;
			}
			if (!current) { continue; }
			if (record.kind === 'AssistantMessage') {
				this.applyAssistantRecordToTurn(record, current);
			} else {
				this.applyToolResultsToTurn(record, current);
			}
		}
		return turns;
	}

	private applyAssistantRecordToTurn(
		record: KiroCliMessageRecord,
		turn: { assistantText: string; toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>; outputTokens: number }
	): void {
		if (record.text) {
			turn.assistantText += (turn.assistantText ? '\n\n' : '') + record.text;
			turn.outputTokens += this.estimateTokens(record.text);
		}
		for (const toolUse of record.toolUses) {
			turn.toolCalls.push({ toolName: toolUse.toolName, arguments: toolUse.arguments });
			turn.outputTokens += this.estimateTokens(toolUse.arguments ?? '');
		}
	}

	private applyToolResultsToTurn(
		record: KiroCliMessageRecord,
		turn: { toolCalls: Array<{ toolName: string; arguments?: string; result?: string }>; inputTokens: number }
	): void {
		for (const result of record.toolResults) {
			turn.inputTokens += this.estimateTokens(result.text);
			// Attach the result to the most recent tool call that has none yet.
			const pending = [...turn.toolCalls].reverse().find(tc => tc.result === undefined);
			if (pending) { pending.result = result.text; }
		}
	}
}
