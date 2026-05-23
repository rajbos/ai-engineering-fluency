import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ChatTurn, ModelUsage, PromptTokenDetail } from './types';
import { createEmptyContextRefs } from './tokenEstimation';
import { normalizePathForComparison, normalizePath } from './workspaceHelpers';

interface GeminiCliSessionHeader {
	sessionId: string;
	projectHash?: string;
	startTime?: string;
	lastUpdated?: string;
	kind?: string;
}

interface GeminiCliAssistantTokens {
	input?: number;
	output?: number;
	cached?: number;
	thoughts?: number;
	tool?: number;
	total?: number;
}

export interface GeminiCliToolCallRecord {
	id?: string;
	name?: string;
	displayName?: string;
	args?: unknown;
	result?: unknown;
	resultDisplay?: string;
	status?: string;
	timestamp?: string;
	description?: string;
	renderOutputAsMarkdown?: boolean;
}

export interface GeminiCliUserRecord {
	id?: string;
	timestamp?: string;
	type: 'user';
	content?: unknown;
	lineNumber: number;
}

export interface GeminiCliAssistantRecord {
	id?: string;
	timestamp?: string;
	type: 'gemini';
	content?: unknown;
	thoughts?: Array<{ subject?: string; description?: string; timestamp?: string }>;
	tokens?: GeminiCliAssistantTokens;
	model?: string;
	toolCalls?: GeminiCliToolCallRecord[];
	lineNumber: number;
}

export interface GeminiCliParsedSession {
	header: GeminiCliSessionHeader | null;
	projectBucket?: string;
	workspacePath?: string;
	userRecords: GeminiCliUserRecord[];
	assistantRecords: GeminiCliAssistantRecord[];
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function toFiniteNumber(value: unknown): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function parseTimestampMs(value: string | undefined): number | null {
	if (!isNonEmptyString(value)) {
		return null;
	}

	const timeMs = Date.parse(value);
	return Number.isFinite(timeMs) ? timeMs : null;
}

function compareByTimestampThenLine(
	a: { timestamp?: string; lineNumber: number },
	b: { timestamp?: string; lineNumber: number },
): number {
	const aTime = parseTimestampMs(a.timestamp);
	const bTime = parseTimestampMs(b.timestamp);

	if (aTime !== null && bTime !== null && aTime !== bTime) {
		return aTime - bTime;
	}
	if (aTime !== null && bTime === null) {
		return -1;
	}
	if (aTime === null && bTime !== null) {
		return 1;
	}

	return a.lineNumber - b.lineNumber;
}

export function normalizeGeminiModelId(model: string): string {
	if (!model) {
		return model;
	}

	const trimmed = model.trim();

	// Match the observed preview ID to the existing pricing/model-display entry.
	if (trimmed === 'gemini-3-flash-preview') {
		return 'gemini-3-flash';
	}

	return trimmed;
}

// ── getGeminiCliSessionFiles helpers ────────────────────────────────────────

function _ggcsfCollectChatFiles(chatsDir: string): string[] {
	const files: string[] = [];
	try {
		const entries = fs.readdirSync(chatsDir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.isDirectory()) { continue; }
			if (!entry.name.startsWith('session-') || !entry.name.endsWith('.jsonl')) { continue; }
			const fullPath = path.join(chatsDir, entry.name);
			try {
				if (fs.statSync(fullPath).size > 0) { files.push(fullPath); }
			} catch { /* ignore individual stat failures */ }
		}
	} catch { /* ignore unreadable chats dirs */ }
	return files;
}

function _ggcsfCollectProjectFiles(tmpDir: string, projectDir: fs.Dirent): string[] {
	if (!projectDir.isDirectory()) { return []; }
	const chatsDir = path.join(tmpDir, projectDir.name, 'chats');
	if (!fs.existsSync(chatsDir)) { return []; }
	return _ggcsfCollectChatFiles(chatsDir);
}

// ── readGeminiCliSession helpers ─────────────────────────────────────────────

interface RgsState {
	header: GeminiCliSessionHeader | null;
	latestHeaderUpdate: string | undefined;
	anonymousAssistantCounter: number;
	seenUserIds: Set<string>;
	userRecords: GeminiCliUserRecord[];
	assistantRecords: Map<string, GeminiCliAssistantRecord>;
}

function _rgsBuildHeader(parsed: any): GeminiCliSessionHeader {
	return {
		sessionId: parsed.sessionId,
		projectHash: isNonEmptyString(parsed.projectHash) ? parsed.projectHash : undefined,
		startTime: isNonEmptyString(parsed.startTime) ? parsed.startTime : undefined,
		lastUpdated: isNonEmptyString(parsed.lastUpdated) ? parsed.lastUpdated : undefined,
		kind: isNonEmptyString(parsed.kind) ? parsed.kind : undefined,
	};
}

export class GeminiCliDataAccess {
	getGeminiDataDir(): string {
		return path.join(os.homedir(), '.gemini');
	}

	getGeminiTmpDir(): string {
		return path.join(this.getGeminiDataDir(), 'tmp');
	}

	getGeminiProjectsPath(): string {
		return path.join(this.getGeminiDataDir(), 'projects.json');
	}

	getGeminiLogsPath(): string {
		return path.join(this.getGeminiDataDir(), 'logs.json');
	}

	isGeminiCliSessionFile(filePath: string): boolean {
		const normalized = normalizePathForComparison(filePath);
		const tmpDir = normalizePathForComparison(this.getGeminiTmpDir());
		return normalized.startsWith(tmpDir)
			&& normalized.includes('/chats/session-')
			&& normalized.endsWith('.jsonl');
	}

	private collectSessionFilesFromChatDir(chatsDir: string): string[] {
		const files: string[] = [];
		try {
			const chatEntries = fs.readdirSync(chatsDir, { withFileTypes: true });
			for (const entry of chatEntries) {
				if (entry.isDirectory() || !entry.name.startsWith('session-') || !entry.name.endsWith('.jsonl')) { continue; }
				const fullPath = path.join(chatsDir, entry.name);
				try { if (fs.statSync(fullPath).size > 0) { files.push(fullPath); } } catch { /* skip */ }
			}
		} catch { /* ignore unreadable chat directories */ }
		return files;
	}

	getGeminiCliSessionFiles(): string[] {
		const tmpDir = this.getGeminiTmpDir();
		if (!fs.existsSync(tmpDir)) { return []; }
		try {
			const projectDirs = fs.readdirSync(tmpDir, { withFileTypes: true });
			return projectDirs.flatMap(dir => _ggcsfCollectProjectFiles(tmpDir, dir));
		} catch {
			return [];
		}
	}

	private parseGeminiSessionHeader(parsed: any): GeminiCliSessionHeader {
		return {
			sessionId: parsed.sessionId,
			projectHash: isNonEmptyString(parsed.projectHash) ? parsed.projectHash : undefined,
			startTime: isNonEmptyString(parsed.startTime) ? parsed.startTime : undefined,
			lastUpdated: isNonEmptyString(parsed.lastUpdated) ? parsed.lastUpdated : undefined,
			kind: isNonEmptyString(parsed.kind) ? parsed.kind : undefined,
		};
	}

	private parseGeminiUserRecord(parsed: any, lineNumber: number, seenUserIds: Set<string>): GeminiCliUserRecord | null {
		const userId = isNonEmptyString(parsed.id) ? parsed.id : `__user_${lineNumber}`;
		if (seenUserIds.has(userId)) { return null; }
		seenUserIds.add(userId);
		return {
			id: isNonEmptyString(parsed.id) ? parsed.id : undefined,
			timestamp: isNonEmptyString(parsed.timestamp) ? parsed.timestamp : undefined,
			type: 'user', content: parsed.content, lineNumber,
		};
	}

	private parseGeminiAssistantRecord(parsed: any, lineNumber: number, counter: { value: number }): { id: string; record: GeminiCliAssistantRecord } {
		const id = isNonEmptyString(parsed.id) ? parsed.id : `__assistant_${counter.value++}_${lineNumber}`;
		return {
			id,
			record: {
				id: isNonEmptyString(parsed.id) ? parsed.id : undefined,
				timestamp: isNonEmptyString(parsed.timestamp) ? parsed.timestamp : undefined,
				type: 'gemini', content: parsed.content,
				thoughts: Array.isArray(parsed.thoughts) ? parsed.thoughts : [],
				tokens: parsed.tokens,
				model: isNonEmptyString(parsed.model) ? parsed.model : undefined,
				toolCalls: Array.isArray(parsed.toolCalls) ? parsed.toolCalls : [],
				lineNumber,
			},
		};
	}

	private processOneParsedLine(line: string, lineNumber: number, state: {
		header: GeminiCliSessionHeader | null; latestHeaderUpdate: string | undefined;
		userRecords: GeminiCliUserRecord[]; assistantRecords: Map<string, GeminiCliAssistantRecord>;
		seenUserIds: Set<string>; counter: { value: number };
	}): void {
		let parsed: any;
		try { parsed = JSON.parse(line); } catch { return; }
		if (!state.header && isNonEmptyString(parsed?.sessionId)) { state.header = this.parseGeminiSessionHeader(parsed); return; }
		if (isNonEmptyString(parsed?.$set?.lastUpdated)) { state.latestHeaderUpdate = parsed.$set.lastUpdated; return; }
		if (parsed?.type === 'user') {
			const record = this.parseGeminiUserRecord(parsed, lineNumber, state.seenUserIds);
			if (record) { state.userRecords.push(record); }
			return;
		}
		if (parsed?.type === 'gemini') {
			const { id, record } = this.parseGeminiAssistantRecord(parsed, lineNumber, state.counter);
			state.assistantRecords.set(id, record);
		}
	}

	readGeminiCliSession(sessionFilePath: string): GeminiCliParsedSession {
		const state: RgsState = {
			header: null,
			latestHeaderUpdate: undefined,
			anonymousAssistantCounter: 0,
			seenUserIds: new Set<string>(),
			userRecords: [],
			assistantRecords: new Map<string, GeminiCliAssistantRecord>(),
		};

		for (const [i, line] of this.readJsonlLines(sessionFilePath).entries()) {
			let parsed: any;
			try { parsed = JSON.parse(line); } catch { continue; }
			this._rgsDispatchLine(parsed, i, state);
		}

		if (state.header && state.latestHeaderUpdate) {
			state.header.lastUpdated = state.latestHeaderUpdate;
		}

		state.userRecords.sort(compareByTimestampThenLine);
		const dedupedAssistants = Array.from(state.assistantRecords.values()).sort(compareByTimestampThenLine);
		const projectBucket = this.getProjectBucketFromPath(sessionFilePath) || state.header?.projectHash;
		const workspacePath = this.resolveWorkspacePath(projectBucket, state.header?.projectHash);

		return {
			header: state.header,
			projectBucket,
			workspacePath: workspacePath ?? projectBucket,
			userRecords: state.userRecords,
			assistantRecords: dedupedAssistants,
		};
	}

	private _rgsDispatchLine(parsed: any, lineNumber: number, state: RgsState): void {
		if (!state.header && isNonEmptyString(parsed?.sessionId)) {
			state.header = _rgsBuildHeader(parsed);
			return;
		}
		if (isNonEmptyString(parsed?.$set?.lastUpdated)) {
			state.latestHeaderUpdate = parsed.$set.lastUpdated;
			return;
		}
		if (parsed?.type === 'user') {
			this._rgsHandleUserRecord(parsed, lineNumber, state.seenUserIds, state.userRecords);
			return;
		}
		if (parsed?.type === 'gemini') {
			state.anonymousAssistantCounter = this._rgsHandleGeminiRecord(parsed, lineNumber, state.anonymousAssistantCounter, state.assistantRecords);
		}
	}

	private _rgsHandleUserRecord(
		parsed: any, lineNumber: number,
		seenUserIds: Set<string>, userRecords: GeminiCliUserRecord[]
	): void {
		const userId = isNonEmptyString(parsed.id) ? parsed.id : `__user_${lineNumber}`;
		if (seenUserIds.has(userId)) { return; }
		seenUserIds.add(userId);
		userRecords.push({
			id: isNonEmptyString(parsed.id) ? parsed.id : undefined,
			timestamp: isNonEmptyString(parsed.timestamp) ? parsed.timestamp : undefined,
			type: 'user',
			content: parsed.content,
			lineNumber,
		});
	}

	private _rgsHandleGeminiRecord(
		parsed: any, lineNumber: number,
		counter: number, assistantRecords: Map<string, GeminiCliAssistantRecord>
	): number {
		const assistantId = isNonEmptyString(parsed.id)
			? parsed.id
			: `__assistant_${counter}_${lineNumber}`;
		assistantRecords.set(assistantId, {
			id: isNonEmptyString(parsed.id) ? parsed.id : undefined,
			timestamp: isNonEmptyString(parsed.timestamp) ? parsed.timestamp : undefined,
			type: 'gemini',
			content: parsed.content,
			thoughts: Array.isArray(parsed.thoughts) ? parsed.thoughts : [],
			tokens: parsed.tokens,
			model: isNonEmptyString(parsed.model) ? parsed.model : undefined,
			toolCalls: Array.isArray(parsed.toolCalls) ? parsed.toolCalls : [],
			lineNumber,
		});
		return isNonEmptyString(parsed.id) ? counter : counter + 1;
	}

	getTokensFromGeminiCliSession(sessionFilePath: string): { tokens: number; thinkingTokens: number } {
		const session = this.readGeminiCliSession(sessionFilePath);
		let totalTokens = 0;
		let thinkingTokens = 0;

		for (const assistant of session.assistantRecords) {
			const tokenData = this.getTokenBreakdown(assistant.tokens);
			totalTokens += tokenData.total;
			thinkingTokens += tokenData.thinking;
		}

		return { tokens: totalTokens, thinkingTokens };
	}

	countGeminiCliInteractions(sessionFilePath: string): number {
		return this.readGeminiCliSession(sessionFilePath).userRecords.length;
	}

	getGeminiCliModelUsage(sessionFilePath: string): ModelUsage {
		const session = this.readGeminiCliSession(sessionFilePath);
		const modelUsage: ModelUsage = {};

		for (const assistant of session.assistantRecords) {
			const model = normalizeGeminiModelId(assistant.model || 'unknown');
			const tokenData = this.getTokenBreakdown(assistant.tokens);

			if (!modelUsage[model]) {
				modelUsage[model] = { inputTokens: 0, outputTokens: 0 };
			}

			modelUsage[model].inputTokens += tokenData.input;
			modelUsage[model].outputTokens += tokenData.output + tokenData.thinking + tokenData.tool;
			if (tokenData.cached > 0) {
				modelUsage[model].cachedReadTokens = (modelUsage[model].cachedReadTokens ?? 0) + tokenData.cached;
			}
		}

		return modelUsage;
	}

	getGeminiCliSessionMeta(sessionFilePath: string): {
		title: string | undefined;
		firstInteraction: string | null;
		lastInteraction: string | null;
		workspacePath?: string;
	} {
		const session = this.readGeminiCliSession(sessionFilePath);
		const timestamps: number[] = [];

		const pushTimestamp = (value: string | undefined): void => {
			const timeMs = parseTimestampMs(value);
			if (timeMs !== null) {
				timestamps.push(timeMs);
			}
		};

		pushTimestamp(session.header?.startTime);
		pushTimestamp(session.header?.lastUpdated);
		for (const user of session.userRecords) {
			pushTimestamp(user.timestamp);
		}
		for (const assistant of session.assistantRecords) {
			pushTimestamp(assistant.timestamp);
		}

		timestamps.sort((a, b) => a - b);

		return {
			title: this.deriveSessionTitle(session),
			firstInteraction: timestamps.length > 0 ? new Date(timestamps[0]).toISOString() : null,
			lastInteraction: timestamps.length > 0 ? new Date(timestamps[timestamps.length - 1]).toISOString() : null,
			workspacePath: session.workspacePath,
		};
	}

	private processAssistantGroup(group: { assistants: GeminiCliAssistantRecord[] }): {
		assistantContents: string[];
		toolCalls: ChatTurn['toolCalls'];
		model: string | null;
		inputTokens: number; outputTokens: number; thinkingTokens: number; toolTokens: number; cachedTokens: number; totalTokens: number;
	} {
		const assistantContents: string[] = [];
		const toolCalls: ChatTurn['toolCalls'] = [];
		let model: string | null = null;
		let inputTokens = 0; let outputTokens = 0; let thinkingTokens = 0; let toolTokens = 0; let cachedTokens = 0; let totalTokens = 0;
		for (const assistant of group.assistants) {
			const tok = this.getTokenBreakdown(assistant.tokens);
			totalTokens += tok.total; inputTokens += tok.input; outputTokens += tok.output;
			thinkingTokens += tok.thinking; toolTokens += tok.tool; cachedTokens += tok.cached;
			const text = isNonEmptyString(assistant.content) ? assistant.content.trim() : '';
			if (text.length > 0) { assistantContents.push(text); }
			for (const tc of this.toDisplayToolCalls(assistant.toolCalls)) { toolCalls.push(tc); }
			if (isNonEmptyString(assistant.model)) { model = normalizeGeminiModelId(assistant.model); }
		}
		return { assistantContents, toolCalls, model, inputTokens, outputTokens, thinkingTokens, toolTokens, cachedTokens, totalTokens };
	}

	buildGeminiCliTurns(sessionFilePath: string): { turns: ChatTurn[]; actualTokens: number } {
		const session = this.readGeminiCliSession(sessionFilePath);
		const groups = this.groupConversationTurns(session);
		const turns: ChatTurn[] = [];
		let sessionActualTokens = 0;

		for (const group of groups) {
			const acc = { assistantContents: [] as string[], toolCalls: [] as ChatTurn['toolCalls'], model: null as string | null, inputTokens: 0, outputTokens: 0, thinkingTokens: 0, toolTokens: 0, cachedTokens: 0 };
			for (const assistant of group.assistants) {
				sessionActualTokens += this._bgtAggregateAssistant(assistant, acc);
			}

			const { assistantContents, toolCalls, model, inputTokens, outputTokens, thinkingTokens, toolTokens, cachedTokens } = acc;
			const actualUsage = inputTokens > 0 || outputTokens > 0 || thinkingTokens > 0 || toolTokens > 0
				? { promptTokens: inputTokens, completionTokens: outputTokens + thinkingTokens + toolTokens, promptTokenDetails: this.buildPromptTokenDetails(inputTokens, cachedTokens) }
				: undefined;

			turns.push({
				turnNumber: turns.length + 1,
				timestamp: this.pickTurnTimestamp(group.user?.timestamp, group.assistants),
				mode: 'cli',
				userMessage: this.extractUserText(group.user?.content),
				assistantResponse: assistantContents.join('\n\n'),
				model, toolCalls,
				contextReferences: createEmptyContextRefs(),
				mcpTools: [],
				inputTokensEstimate: inputTokens,
				outputTokensEstimate: outputTokens + toolTokens,
				thinkingTokensEstimate: thinkingTokens,
				actualUsage,
			});
		}

		return { turns, actualTokens: sessionActualTokens };
	}

	private _bgtAggregateAssistant(
		assistant: GeminiCliAssistantRecord,
		acc: { assistantContents: string[]; toolCalls: ChatTurn['toolCalls']; model: string | null; inputTokens: number; outputTokens: number; thinkingTokens: number; toolTokens: number; cachedTokens: number }
	): number {
		const tokenData = this.getTokenBreakdown(assistant.tokens);
		acc.inputTokens += tokenData.input;
		acc.outputTokens += tokenData.output;
		acc.thinkingTokens += tokenData.thinking;
		acc.toolTokens += tokenData.tool;
		acc.cachedTokens += tokenData.cached;
		const text = isNonEmptyString(assistant.content) ? assistant.content.trim() : '';
		if (text.length > 0) { acc.assistantContents.push(text); }
		for (const tc of this.toDisplayToolCalls(assistant.toolCalls)) { acc.toolCalls.push(tc); }
		if (isNonEmptyString(assistant.model)) { acc.model = normalizeGeminiModelId(assistant.model); }
		return tokenData.total;
	}

	getGeminiCliDailyFractions(sessionFilePath: string): Record<string, number> {
		const session = this.readGeminiCliSession(sessionFilePath);
		const dateKeys = session.userRecords
			.map(record => this.toUtcDayKey(record.timestamp))
			.filter((value): value is string => !!value);

		if (dateKeys.length === 0) {
			for (const assistant of session.assistantRecords) {
				const dayKey = this.toUtcDayKey(assistant.timestamp);
				if (dayKey) {
					dateKeys.push(dayKey);
				}
			}
		}

		if (dateKeys.length === 0) {
			const fallback = this.toUtcDayKey(session.header?.startTime)
				?? this.toUtcDayKey(session.header?.lastUpdated)
				?? new Date().toISOString().slice(0, 10);
			return { [fallback]: 1.0 };
		}

		const counts = new Map<string, number>();
		for (const dayKey of dateKeys) {
			counts.set(dayKey, (counts.get(dayKey) ?? 0) + 1);
		}

		const total = dateKeys.length;
		const fractions: Record<string, number> = {};
		for (const [dayKey, count] of counts.entries()) {
			fractions[dayKey] = count / total;
		}
		return fractions;
	}

	private readJsonlLines(sessionFilePath: string): string[] {
		try {
			return fs.readFileSync(sessionFilePath, 'utf8')
				.split(/\r?\n/)
				.map(line => line.trim())
				.filter(line => line.length > 0);
		} catch {
			return [];
		}
	}

	private getProjectBucketFromPath(sessionFilePath: string): string | undefined {
		const normalized = normalizePath(sessionFilePath);
		const parts = normalized.split('/').filter(part => part.length > 0);
		const chatsIndex = parts.lastIndexOf('chats');
		if (chatsIndex > 0) {
			return parts[chatsIndex - 1];
		}

		const tmpIndex = parts.lastIndexOf('tmp');
		if (tmpIndex >= 0 && tmpIndex + 1 < parts.length) {
			return parts[tmpIndex + 1];
		}

		return undefined;
	}

	private resolveWorkspacePath(projectBucket?: string, projectHash?: string): string | undefined {
		const projectsIndex = this.readGeminiProjectsIndex();
		if (projectBucket && projectsIndex.has(projectBucket)) {
			return projectsIndex.get(projectBucket);
		}
		if (projectHash && projectsIndex.has(projectHash)) {
			return projectsIndex.get(projectHash);
		}
		return undefined;
	}

	private readGeminiProjectsIndex(): Map<string, string> {
		const mappings = new Map<string, string>();
		const projectsPath = this.getGeminiProjectsPath();
		if (!fs.existsSync(projectsPath)) {
			return mappings;
		}

		try {
			const raw = JSON.parse(fs.readFileSync(projectsPath, 'utf8'));
			if (Array.isArray(raw)) {
				for (const entry of raw) {
					this.addProjectMapping(mappings, undefined, entry);
				}
				return mappings;
			}

			if (raw && typeof raw === 'object') {
				for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
					this.addProjectMapping(mappings, key, value);
				}
			}
		} catch {
			// Ignore malformed projects.json files.
		}

		return mappings;
	}

	private applyStringValueMapping(mappings: Map<string, string>, keyHint: string | undefined, value: string): void {
		if (keyHint && this.looksLikePath(keyHint) && !this.looksLikePath(value)) {
			mappings.set(value, this.normalizeWorkspacePath(keyHint));
		} else if (keyHint && !this.looksLikePath(keyHint) && this.looksLikePath(value)) {
			mappings.set(keyHint, this.normalizeWorkspacePath(value));
		}
	}

	private applyObjectValueMapping(mappings: Map<string, string>, keyHint: string | undefined, entry: Record<string, unknown>): void {
		const projectBucket = this.pickString(entry, ['projectHash', 'projectBucket', 'bucket', 'slug', 'name', 'id']);
		const workspacePath = this.pickString(entry, ['workspacePath', 'path', 'directory', 'cwd', 'rootPath', 'repoPath', 'workspace', 'root']);
		if (projectBucket && workspacePath && this.looksLikePath(workspacePath)) {
			mappings.set(projectBucket, this.normalizeWorkspacePath(workspacePath));
		}
		if (keyHint && this.looksLikePath(keyHint) && projectBucket) {
			mappings.set(projectBucket, this.normalizeWorkspacePath(keyHint));
		}
		if (keyHint && !this.looksLikePath(keyHint) && workspacePath && this.looksLikePath(workspacePath)) {
			mappings.set(keyHint, this.normalizeWorkspacePath(workspacePath));
		}
	}

	private addProjectMapping(mappings: Map<string, string>, keyHint: string | undefined, value: unknown): void {
		if (typeof value === 'string') { this.applyStringValueMapping(mappings, keyHint, value); return; }
		if (!value || typeof value !== 'object' || Array.isArray(value)) { return; }
		this.applyObjectValueMapping(mappings, keyHint, value as Record<string, unknown>);
	}

	private pickString(entry: Record<string, unknown>, keys: string[]): string | undefined {
		for (const key of keys) {
			if (isNonEmptyString(entry[key])) {
				return entry[key].trim();
			}
		}
		return undefined;
	}

	private looksLikePath(value: string): boolean {
		const normalized = normalizePath(value);
		return /^[a-zA-Z]:/.test(value) || normalized.startsWith('/') || normalized.startsWith('~') || normalized.startsWith('file://');
	}

	private normalizeWorkspacePath(workspacePath: string): string {
		let normalized = workspacePath.trim().replace(/^~(?=[/\\]|$)/, os.homedir());
		if (/^file:\/\//i.test(normalized)) {
			try {
				normalized = decodeURIComponent(normalized.replace(/^file:\/\/\/?/, ''));
				if (process.platform === 'win32' && /^\/[a-zA-Z]:/.test(normalized)) {
					normalized = normalized.slice(1);
				}
			} catch {
				// Keep the original path if URI decoding fails.
			}
		}
		return path.normalize(normalized);
	}

	private getTokenBreakdown(tokens: GeminiCliAssistantTokens | undefined): {
		input: number;
		output: number;
		cached: number;
		thinking: number;
		tool: number;
		total: number;
	} {
		const input = toFiniteNumber(tokens?.input);
		const output = toFiniteNumber(tokens?.output);
		const cached = toFiniteNumber(tokens?.cached);
		const thinking = toFiniteNumber(tokens?.thoughts);
		const tool = toFiniteNumber(tokens?.tool);
		const total = toFiniteNumber(tokens?.total) || input + output + thinking + tool;
		return { input, output, cached, thinking, tool, total };
	}

	private deriveSessionTitle(session: GeminiCliParsedSession): string | undefined {
		for (const user of session.userRecords) {
			const firstLine = this.extractUserText(user.content)
				.split(/\r?\n/)
				.map(line => line.trim())
				.find(line => line.length > 0);
			if (firstLine) {
				return firstLine.length > 80 ? `${firstLine.slice(0, 77)}...` : firstLine;
			}
		}

		return session.projectBucket;
	}

	private extractUserText(content: unknown): string {
		if (isNonEmptyString(content)) {
			return content.trim();
		}

		if (!Array.isArray(content)) {
			return '';
		}

		const parts: string[] = [];
		for (const part of content) {
			if (part && typeof part === 'object' && isNonEmptyString((part as any).text)) {
				parts.push((part as any).text.trim());
			}
		}
		return parts.join('\n\n').trim();
	}

	private toDisplayToolCalls(toolCalls: GeminiCliToolCallRecord[] | undefined): ChatTurn['toolCalls'] {
		if (!Array.isArray(toolCalls)) {
			return [];
		}

		const turns: ChatTurn['toolCalls'] = [];
		for (const toolCall of toolCalls) {
			const rawName = isNonEmptyString(toolCall?.name) ? toolCall.name.trim() : '';
			const displayName = isNonEmptyString(toolCall?.displayName) ? toolCall.displayName.trim() : '';
			const toolName = displayName || rawName;
			if (!toolName) {
				continue;
			}

			turns.push({
				toolName,
				arguments: toolCall.args !== undefined ? this.safeStringify(toolCall.args) : undefined,
				result: isNonEmptyString(toolCall.resultDisplay)
					? toolCall.resultDisplay
					: toolCall.result !== undefined ? this.safeStringify(toolCall.result) : undefined,
			});
		}

		return turns;
	}

	private safeStringify(value: unknown): string {
		if (typeof value === 'string') {
			return value;
		}

		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}

	private buildPromptTokenDetails(inputTokens: number, cachedTokens: number): PromptTokenDetail[] | undefined {
		if (inputTokens <= 0) {
			return undefined;
		}

		const details: PromptTokenDetail[] = [];
		const safeCachedTokens = Math.min(cachedTokens, inputTokens);
		if (safeCachedTokens > 0) {
			details.push({
				category: 'cached',
				label: 'Cache reads',
				percentageOfPrompt: (safeCachedTokens / inputTokens) * 100,
			});
		}

		const uncachedPromptTokens = inputTokens - safeCachedTokens;
		if (uncachedPromptTokens > 0) {
			details.push({
				category: 'prompt',
				label: 'Prompt tokens',
				percentageOfPrompt: (uncachedPromptTokens / inputTokens) * 100,
			});
		}

		return details.length > 0 ? details : undefined;
	}

	private groupConversationTurns(session: GeminiCliParsedSession): Array<{ user: GeminiCliUserRecord | null; assistants: GeminiCliAssistantRecord[] }> {
		const timeline = [
			...session.userRecords.map(record => ({ kind: 'user' as const, record })),
			...session.assistantRecords.map(record => ({ kind: 'assistant' as const, record })),
		].sort((a, b) => compareByTimestampThenLine(a.record, b.record));

		const groups: Array<{ user: GeminiCliUserRecord | null; assistants: GeminiCliAssistantRecord[] }> = [];
		let currentUser: GeminiCliUserRecord | null = null;
		let currentAssistants: GeminiCliAssistantRecord[] = [];

		for (const item of timeline) {
			if (item.kind === 'user') {
				if (currentUser || currentAssistants.length > 0) {
					groups.push({ user: currentUser, assistants: currentAssistants });
					currentAssistants = [];
				}
				currentUser = item.record;
			} else {
				currentAssistants.push(item.record);
			}
		}

		if (currentUser || currentAssistants.length > 0) {
			groups.push({ user: currentUser, assistants: currentAssistants });
		}

		return groups;
	}

	private pickTurnTimestamp(userTimestamp: string | undefined, assistants: GeminiCliAssistantRecord[]): string | null {
		const direct = parseTimestampMs(userTimestamp);
		if (direct !== null) {
			return new Date(direct).toISOString();
		}

		for (const assistant of assistants) {
			const timeMs = parseTimestampMs(assistant.timestamp);
			if (timeMs !== null) {
				return new Date(timeMs).toISOString();
			}
		}

		return null;
	}

	private toUtcDayKey(timestamp: string | undefined): string | null {
		const timeMs = parseTimestampMs(timestamp);
		return timeMs !== null ? new Date(timeMs).toISOString().slice(0, 10) : null;
	}
}
