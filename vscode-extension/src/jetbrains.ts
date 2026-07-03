/**
 * JetBrains IDE Copilot Chat session parser.
 *
 * Parses the JSONL partition files that the GitHub Copilot plugin for
 * JetBrains IDEs writes under `~/.copilot/jb/{conversationId}/partition-{n}.jsonl`.
 *
 * Schema reference: docs/logFilesSchema/jetbrains-session-schema.json
 *
 * The JetBrains JSONL does NOT carry actual API token counts or a model
 * identifier. This parser produces best-effort estimates compatible with the
 * "common output" used by the rest of the extension:
 *
 *   { tokens, thinkingTokens, actualTokens, interactions, modelUsage,
 *     mode, modelHint, firstInteraction, lastInteraction, source, conversationId }
 *
 * Mode detection (ask vs. agent):
 *   - If the partition contains any `tool.execution_start` event, the user
 *     was in agent mode (ask mode cannot invoke tools).
 *   - Otherwise the partition is classified as ask mode.
 *
 * Model attribution:
 *   - Preferred: `assistant.turn_start.data.model` if present (not observed
 *     in current Rider builds, but harmless to support).
 *   - Heuristic from `tool.execution_start.data.toolCallId` prefix:
 *       "toolu_*" → Anthropic Claude (often "toolu_bdrk_*" for Bedrock),
 *       "call_*"  → OpenAI.
 *   - Otherwise "unknown".
 */
import type { ModelUsage } from './types';
import { estimateTokensFromText } from './tokenEstimation';

export type JetBrainsMode = 'ask' | 'agent';

export interface JetBrainsTurn {
	/** Unique identifier for this turn. */
	turnId: string;
	/** ISO-8601 timestamp when this turn started. */
	startTimestamp: string | null;
	/** ISO-8601 timestamp when this turn ended. */
	endTimestamp: string | null;
	/** Turn completion status (e.g., 'success', 'cancelled'). */
	status: string | null;
	/** Additional turn status information. */
	turnStatus: string | null;
	/** Assistant message ID for this turn, if available. */
	messageId: string | null;
	/** Iteration number of the assistant message in this turn. */
	iterationNumber: number | null;
	/** Whether this turn contained thinking content. */
	hasThinking: boolean;
	/** Number of tool calls in this turn. */
	toolCallCount: number;
}

export interface JetBrainsParsedSession {
	/** Sum of estimated input + output tokens (excludes thinking). */
	tokens: number;
	/** Estimated thinking-only tokens (Claude-style chain-of-thought). */
	thinkingTokens: number;
	/** JetBrains files don't expose API-side token counts. Always 0. */
	actualTokens: number;
	/** Count of `user.message` events (one per user turn). */
	interactions: number;
	/** Best-effort model usage. Empty object when no model could be derived. */
	modelUsage: ModelUsage;
	/** Conversation-level mode. */
	mode: JetBrainsMode;
	/** Best-effort model name; `'unknown'` when not derivable. */
	modelHint: string;
	/** ISO-8601 timestamp of the first user message, or null. */
	firstInteraction: string | null;
	/** ISO-8601 timestamp of the last assistant turn end / message, or null. */
	lastInteraction: string | null;
	/** Conversation source from `partition.created.data.source` (e.g. "panel"). */
	source: string | null;
	/** Conversation UUID from `partition.created.data.conversationId`. */
	conversationId: string | null;
	/**
	 * Per-tool-call entries in execution order. Mirrors the per-turn
	 * `ChatTurn.toolCalls` shape used by the rest of the extension so callers
	 * can render them uniformly.
	 */
	toolCalls: JetBrainsToolCall[];
	/**
	 * Aggregate count per tool name across the whole partition (e.g.
	 * `{ run_in_terminal: 27, read_file: 2 }`). Empty when no tools ran.
	 */
	toolCounts: Record<string, number>;
	/**
	 * Per-turn information for turns that have assistant messages.
	 * Enables richer conversation analysis and turn-level statistics.
	 */
	turns: JetBrainsTurn[];
	/**
	 * All unique message IDs from assistant messages, in order.
	 * Useful for tracking message references and conversation flow.
	 */
	messageIds: string[];
	/**
	 * Count of successful vs failed/cancelled turns.
	 */
	turnStatusCounts: { success: number; cancelled: number; failed: number; unknown: number };
	/**
	 * Whether any turns contained thinking content (Claude-style reasoning).
	 */
	hasThinking: boolean;
}

export interface JetBrainsToolCall {
	toolName: string;
	/** Stringified `data.arguments` from `tool.execution_start`, when present. */
	arguments?: string;
	/** Concatenated text blocks from `tool.execution_complete.data.result.result[]`. */
	result?: string;
	/** Mirrors `tool.execution_complete.data.success`. */
	success?: boolean;
	/** The turn ID this tool call belongs to, if available. */
	turnId?: string;
	/** Progress message from tool execution, if available. */
	progressMessage?: string;
	/** Tool call ID from `tool.execution_start.data.toolCallId`. */
	toolCallId?: string;
}

/**
 * Heuristic mapping from `toolCallId` prefix to a model family.
 * Returns `null` when the prefix is unfamiliar.
 */
export function modelHintFromToolCallId(toolCallId: string | undefined): string | null {
	if (!toolCallId || typeof toolCallId !== 'string') { return null; }
	if (toolCallId.startsWith('toolu_')) {
		// Anthropic uses `toolu_*`. The Bedrock variant is `toolu_bdrk_*`.
		return 'claude';
	}
	if (toolCallId.startsWith('call_')) {
		// OpenAI uses `call_*`.
		return 'gpt';
	}
	return null;
}

 
type JbpState = { 
	inputTokens: number; 
	outputTokens: number; 
	firstUserTs: string | null; 
	lastTurnTs: string | null; 
	modelFromTurnStart: string | null; 
	modelFromToolCallId: string | null; 
	sawToolCall: boolean; 
	toolCallById: Map<string, JetBrainsToolCall>; 
	renderedTurnIds: Set<string>; 
	result: JetBrainsParsedSession;
	// Turn tracking
	currentTurnId: string | null;
	currentMessageId: string | null;
	currentIterationNumber: number | null;
	turnById: Map<string, JetBrainsTurn>;
	// Message tracking
	messageIds: string[];
	// Turn status tracking
	turnStatusCounts: { success: number; cancelled: number; failed: number; unknown: number };
	// Thinking tracking
	hasThinking: boolean;
	// Tool call to turn mapping
	toolCallByTurnId: Map<string, string[]>; // turnId -> toolCallIds
};

 
function _jbpPreParseLines(lines: string[]): { parsed: any[]; renderedTurnIds: Set<string> } {
	 
	const parsed: any[] = [];
	const renderedTurnIds = new Set<string>();
	for (const line of lines) {
		if (!line) { continue; }
		try {
			const event = JSON.parse(line);
			if (!event || typeof event !== 'object') { continue; }
			parsed.push(event);
			if (event.type === 'user.message_rendered' && typeof event.data?.turnId === 'string') {
				renderedTurnIds.add(event.data.turnId);
			}
		} catch { /* skip malformed lines */ }
	}
	return { parsed, renderedTurnIds };
}

 
function _jbpHandlePartitionCreated(event: any, result: JetBrainsParsedSession): void {
	if (event.data?.conversationId) { result.conversationId = String(event.data.conversationId); }
	if (event.data?.source) { result.source = String(event.data.source); }
	// Initialize turn tracking arrays
	result.turns = [];
	result.messageIds = [];
	result.turnStatusCounts = { success: 0, cancelled: 0, failed: 0, unknown: 0 };
	result.hasThinking = false;
}

 
function _jbpHandleUserMessage(event: any, state: JbpState): void {
	state.result.interactions++;
	if (typeof event.timestamp === 'string' && state.firstUserTs === null) { state.firstUserTs = event.timestamp; }
	const turnId = event.data?.turnId;
	
	// Track turn changes
	const newTurnId = typeof turnId === 'string' ? turnId : null;
	if (newTurnId && newTurnId !== state.currentTurnId) {
		state.currentTurnId = newTurnId;
		state.currentMessageId = null;
		state.currentIterationNumber = null;
	}
	
	if (typeof event.data?.content === 'string' && (typeof turnId !== 'string' || !state.renderedTurnIds.has(turnId))) {
		state.inputTokens += estimateTokensFromText(event.data.content);
	}
}

function _jbpUpdateCurrentTurn(state: JbpState, updater: (turn: JetBrainsTurn) => void): void {
	if (!state.currentTurnId) { return; }
	const turn = state.turnById.get(state.currentTurnId);
	if (turn) { updater(turn); }
}


function _jbpGetMessageText(data: any): string | null {
	if (typeof data?.text === 'string' && data.text) { return data.text; }
	if (typeof data?.content === 'string' && data.content) { return data.content; }
	return null;
}

function _jbpHandleAssistantMessage(event: any, state: JbpState): void {
	const messageText = _jbpGetMessageText(event.data);
	if (messageText) { state.outputTokens += estimateTokensFromText(messageText); }

	// Extract thinking content
	const thinking = event.data?.thinking?.text;
	if (typeof thinking === 'string' && thinking) {
		state.result.thinkingTokens += estimateTokensFromText(thinking);
		state.hasThinking = true;
		_jbpUpdateCurrentTurn(state, t => { t.hasThinking = true; });
	}

	// Track message metadata
	if (typeof event.data?.messageId === 'string') {
		state.currentMessageId = event.data.messageId;
		state.messageIds.push(event.data.messageId);
		_jbpUpdateCurrentTurn(state, t => { t.messageId = event.data.messageId; });
	}

	if (typeof event.data?.iterationNumber === 'number') {
		state.currentIterationNumber = event.data.iterationNumber;
		_jbpUpdateCurrentTurn(state, t => { t.iterationNumber = event.data.iterationNumber; });
	}

	if (typeof event.timestamp === 'string') {
		state.lastTurnTs = event.timestamp;
		_jbpUpdateCurrentTurn(state, t => { if (!t.endTimestamp) { t.endTimestamp = event.timestamp; } });
	}
}


function _jbpRegisterToolCallForTurn(callId: string | undefined, state: JbpState, tc: JetBrainsToolCall): void {
	if (!state.currentTurnId) { return; }
	tc.turnId = state.currentTurnId;
	if (!state.toolCallByTurnId.has(state.currentTurnId)) {
		state.toolCallByTurnId.set(state.currentTurnId, []);
	}
	state.toolCallByTurnId.get(state.currentTurnId)!.push(callId || '');
	_jbpUpdateCurrentTurn(state, t => { t.toolCallCount++; });
}

function _jbpHandleToolExecutionStart(event: any, state: JbpState): void {
	state.sawToolCall = true;
	const d = event.data;
	const callId: string | undefined = d?.toolCallId;
	if (!state.modelFromToolCallId) {
		const hint = modelHintFromToolCallId(callId);
		if (hint) { state.modelFromToolCallId = hint; }
	}
	const toolName = typeof d?.toolName === 'string' ? d.toolName : 'unknown';
	const tc: JetBrainsToolCall = { toolName };
	_jbpRegisterToolCallForTurn(callId, state, tc);
	if (callId) { tc.toolCallId = callId; }
	if (d?.arguments !== undefined) {
		try { tc.arguments = JSON.stringify(d.arguments); } catch { /* ignore */ }
	}
	state.result.toolCalls.push(tc);
	state.result.toolCounts[toolName] = (state.result.toolCounts[toolName] || 0) + 1;
	if (typeof callId === 'string') { state.toolCallById.set(callId, tc); }
}


function _jbpExtractBlockText(blocks: unknown[], state: JbpState): string {
	let text = '';
	for (const block of blocks) {
		const b = block as { value?: unknown } | null;
		if (b && typeof b.value === 'string') {
			state.outputTokens += estimateTokensFromText(b.value);
			text += (text ? '\n' : '') + b.value;
		}
	}
	return text;
}

function _jbpHandleToolExecutionComplete(event: any, state: JbpState): void {
	const blocks = event.data?.result?.result;
	const resultText = Array.isArray(blocks) ? _jbpExtractBlockText(blocks, state) : '';
	const callId = event.data?.toolCallId;
	if (typeof callId !== 'string') { return; }
	const tc = state.toolCallById.get(callId);
	if (!tc) { return; }
	if (typeof event.data?.success === 'boolean') { tc.success = event.data.success; }
	if (resultText) { tc.result = resultText; }
	if (typeof event.data?.progressMessage === 'string') { tc.progressMessage = event.data.progressMessage; }
}


function _jbpHandleTurnStart(event: any, state: JbpState): void {
	if (typeof event.data?.model === 'string' && !state.modelFromTurnStart) { state.modelFromTurnStart = event.data.model; }
	if (typeof event.data?.turnId !== 'string') { return; }
	state.currentTurnId = event.data.turnId;
	state.currentMessageId = null;
	state.currentIterationNumber = null;
	if (!state.turnById.has(event.data.turnId)) {
		state.turnById.set(event.data.turnId, {
			turnId: event.data.turnId,
			startTimestamp: typeof event.timestamp === 'string' ? event.timestamp : null,
			endTimestamp: null, status: null, turnStatus: null,
			messageId: null, iterationNumber: null, hasThinking: false, toolCallCount: 0,
		});
	}
}

function _jbpHandleTurnEnd(event: any, state: JbpState): void {
	if (typeof event.timestamp === 'string') { state.lastTurnTs = event.timestamp; }
	if (typeof event.data?.turnId !== 'string') { return; }
	const turn = state.turnById.get(event.data.turnId);
	if (!turn) { return; }
	if (typeof event.timestamp === 'string') { turn.endTimestamp = event.timestamp; }
	const status = typeof event.data?.status === 'string' ? event.data.status : null;
	turn.turnStatus = typeof event.data?.turnStatus === 'string' ? event.data.turnStatus : null;
	if (!status) { return; }
	turn.status = status;
	switch (status.toLowerCase()) {
		case 'success': state.turnStatusCounts.success++; break;
		case 'cancelled': state.turnStatusCounts.cancelled++; break;
		case 'failed': state.turnStatusCounts.failed++; break;
		default: state.turnStatusCounts.unknown++; break;
	}
}

function _jbpDispatchEvent(event: any, state: JbpState): void {
	switch (event.type) {
		case 'partition.created': _jbpHandlePartitionCreated(event, state.result); break;
		case 'user.message': _jbpHandleUserMessage(event, state); break;
		case 'user.message_rendered':
			if (typeof event.data?.renderedMessage === 'string') { state.inputTokens += estimateTokensFromText(event.data.renderedMessage); }
			break;
		case 'assistant.turn_start': _jbpHandleTurnStart(event, state); break;
		case 'assistant.message': _jbpHandleAssistantMessage(event, state); break;
		case 'tool.execution_start': _jbpHandleToolExecutionStart(event, state); break;
		case 'tool.execution_complete': _jbpHandleToolExecutionComplete(event, state); break;
		case 'assistant.turn_end': _jbpHandleTurnEnd(event, state); break;
	}
}

/**
 * Initialize a JetBrainsParsedSession with default values.
 */
function _jbpCreateDefaultSession(): JetBrainsParsedSession {
	return {
		tokens: 0, thinkingTokens: 0, actualTokens: 0, interactions: 0, modelUsage: {},
		mode: 'ask', modelHint: 'unknown', firstInteraction: null, lastInteraction: null,
		source: null, conversationId: null, toolCalls: [], toolCounts: {},
		turns: [], messageIds: [], turnStatusCounts: { success: 0, cancelled: 0, failed: 0, unknown: 0 }, hasThinking: false
	};
}

/**
 * Initialize JbpState with default values.
 */
function _jbpCreateInitialState(result: JetBrainsParsedSession, renderedTurnIds: Set<string>): JbpState {
	return {
		inputTokens: 0, outputTokens: 0, firstUserTs: null, lastTurnTs: null,
		modelFromTurnStart: null, modelFromToolCallId: null, sawToolCall: false,
		toolCallById: new Map(), renderedTurnIds, result,
		currentTurnId: null, currentMessageId: null, currentIterationNumber: null,
		turnById: new Map(), messageIds: [], turnStatusCounts: { success: 0, cancelled: 0, failed: 0, unknown: 0 },
		hasThinking: false, toolCallByTurnId: new Map()
	};
}

/**
 * Finalize the parsed session by setting derived properties.
 */
function _jbpFinalizeSession(result: JetBrainsParsedSession, state: JbpState): void {
	result.mode = state.sawToolCall ? 'agent' : 'ask';
	result.modelHint = state.modelFromTurnStart || state.modelFromToolCallId || 'unknown';
	result.tokens = state.inputTokens + state.outputTokens;
	result.firstInteraction = state.firstUserTs;
	result.lastInteraction = state.lastTurnTs;
	result.hasThinking = state.hasThinking;
	result.turnStatusCounts = { ...state.turnStatusCounts };
	
	// Convert turn map to array
	result.turns = Array.from(state.turnById.values());
	result.messageIds = [...state.messageIds];
	
	if (result.tokens > 0 && result.modelHint !== 'unknown') {
		result.modelUsage[result.modelHint] = { inputTokens: state.inputTokens, outputTokens: state.outputTokens };
	}
}

/**
 * Parse a JetBrains partition file's raw JSONL content into the canonical
 * "common output" shape used by the rest of the extension.
 *
 * Malformed lines are skipped silently — partition files are append-only and
 * may legitimately have a half-written final line if read mid-write.
 */
export function parseJetBrainsPartition(content: string): JetBrainsParsedSession {
	const result = _jbpCreateDefaultSession();
	const { parsed, renderedTurnIds } = _jbpPreParseLines(content.split(/\r?\n/));
	const state = _jbpCreateInitialState(result, renderedTurnIds);
	
	for (const event of parsed) { _jbpDispatchEvent(event, state); }
	
	_jbpFinalizeSession(result, state);
	
	return result;
}

/**
 * Lightweight model-hint detector. Scans for the first `tool.execution_start`
 * with a `toolCallId` whose prefix maps to a known model family. Returns
 * `'unknown'` when no usable hint is present (e.g. ask-mode sessions with no
 * tool calls).
 *
 * This is separate from {@link parseJetBrainsPartition} so callers that only
 * need the model hint (e.g. for per-turn `ChatTurn.model`) can avoid the cost
 * of building the full common-output object.
 */
export function detectJetBrainsModelHintFromContent(content: string): string {
	const lines = content.split(/\r?\n/);
	for (const line of lines) {
		if (!line || line.indexOf('tool.execution_start') === -1) { continue; }
		try {
			const event = JSON.parse(line);
			if (event && event.type === 'tool.execution_start') {
				const hint = modelHintFromToolCallId(event.data?.toolCallId);
				if (hint) { return hint; }
			}
		} catch { /* skip malformed */ }
	}
	return 'unknown';
}

/**
 * Lightweight mode-only detector. Reads the JSONL only far enough to find a
 * `tool.execution_start` event; falls back to ask mode if none is present.
 *
 * Used by `usageAnalysis.ts` to bucket JetBrains turns into ask vs. agent
 * instead of the catch-all `cli` bucket.
 */
export function detectJetBrainsModeFromContent(content: string): JetBrainsMode {
	const lines = content.split(/\r?\n/);
	for (const line of lines) {
		if (!line) { continue; }
		// Cheap substring check first; only parse JSON when the keyword is present.
		if (line.indexOf('tool.execution_start') === -1) { continue; }
		try {
			const event = JSON.parse(line);
			if (event && event.type === 'tool.execution_start') { return 'agent'; }
		} catch {
			// Ignore malformed lines.
		}
	}
	return 'ask';
}
