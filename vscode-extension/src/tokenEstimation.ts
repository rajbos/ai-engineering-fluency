/**
 * Token estimation and model-related utility functions.
 * Pure or near-pure functions extracted from CopilotTokenTracker for reusability.
 */
import type { ModelUsage, ModelPricing, ContextReferenceUsage, TokenEstimator } from './types';

/** Minimum request shape needed by getModelFromRequest. */
interface ModelRequestSource {
	modelId?: string;
	result?: {
		metadata?: { modelId?: string };
		details?: string;
	};
}

/** Shape of a single delta event line in a JSONL session file. */
interface DeltaEvent {
	kind?: number;
	/** Key path (array of path segments). */
	k?: unknown;
	/** Value to set or append. */
	v?: unknown;
}

/** Per-model metrics from a session.shutdown event. */
interface ShutdownModelMetrics {
	usage?: {
		inputTokens?: number;
		outputTokens?: number;
		cacheReadTokens?: number;
		cacheWriteTokens?: number;
	};
}

/** Shape of a `toolInvocationSerialized` response item. */
interface ToolInvocationSerializedItem {
	kind: 'toolInvocationSerialized';
	toolSpecificData?: unknown;
}

/** Shape of the `toolSpecificData` object for sub-agent invocations. */
interface SubAgentToolSpecificData {
	kind: 'subagent';
	prompt?: unknown;
	result?: unknown;
	modelName?: unknown;
}

/** Shape of the `result.metadata` block containing per-request token counts (Insiders format). */
interface RequestResultMetadata {
	promptTokens?: number;
	outputTokens?: number;
}

/** Shape of the `result.usage` block from the usage-based token format. */
interface RequestResultUsage {
	promptTokens?: number;
	completionTokens?: number;
}

/** Shape of the `result` field on a reconstructed delta session request. */
export interface RequestResult {
	promptTokens?: number;
	outputTokens?: number;
	metadata?: RequestResultMetadata;
	usage?: RequestResultUsage;
}

/**
 * Type-safe accessor: extracts the `result` object from an unknown request value.
 * Returns the typed `RequestResult` if the value is an object with an object `result`,
 * or `undefined` if the shape does not match.
 */
export function getRequestResult(req: unknown): RequestResult | undefined {
	if (typeof req !== 'object' || req === null) { return undefined; }
	const obj = req as Record<string, unknown>;
	const result = obj['result'];
	if (typeof result !== 'object' || result === null) { return undefined; }
	return result as RequestResult;
}

/**
 * Type-safe accessor: extracts the `response` array from an unknown request value.
 * Returns the array if the value is an object with an array `response`,
 * or `undefined` if the shape does not match.
 */
export function getResponseArray(req: unknown): unknown[] | undefined {
	if (typeof req !== 'object' || req === null) { return undefined; }
	const obj = req as Record<string, unknown>;
	const response = obj['response'];
	if (!Array.isArray(response)) { return undefined; }
	return response;
}

/** Type guard: narrows an unknown value to a ToolInvocationSerializedItem. */
function isToolInvocationSerialized(obj: unknown): obj is ToolInvocationSerializedItem {
	if (typeof obj !== 'object' || obj === null) { return false; }
	return (obj as ToolInvocationSerializedItem).kind === 'toolInvocationSerialized';
}

/** Type guard: narrows an unknown value to a SubAgentToolSpecificData. */
function isSubAgentToolSpecificData(obj: unknown): obj is SubAgentToolSpecificData {
	if (typeof obj !== 'object' || obj === null) { return false; }
	return (obj as SubAgentToolSpecificData).kind === 'subagent';
}

// --- Token estimation ratio constants ---

/**
 * Minimum tool-call count to classify a session as "high" agent activity.
 * Sessions with 20+ tool calls are treated as heavy agent workflows that accumulate
 * large context windows across many turns.
 */
const TOOL_CALLS_HIGH_THRESHOLD = 20;

/**
 * Minimum tool-call count to classify a session as "medium" agent activity.
 * Sessions with 5–19 tool calls fall between a simple chat and a full agent run.
 */
const TOOL_CALLS_MED_THRESHOLD = 5;

/**
 * Estimated input:output token ratio for high-activity sessions (≥ 20 tool calls).
 * Derived from empirical analysis of completed Copilot CLI agent sessions: heavy runs
 * accumulate large context windows across many turns, yielding ~130 input tokens per
 * 1 output token.
 */
const TOKEN_RATIO_HIGH_TOOLS = 130;

/**
 * Estimated input:output token ratio for medium-activity sessions (5–19 tool calls).
 * From empirical analysis of mid-complexity agent sessions: approximately 50 input
 * tokens are consumed per 1 output token.
 */
const TOKEN_RATIO_MED_TOOLS = 50;

/**
 * Estimated input:output token ratio for low-activity (chat-style) sessions (< 5 tool calls).
 * Simple chat interactions without many tool uses show an approximately 10:1 ratio.
 */
const TOKEN_RATIO_LOW_TOOLS = 10;

/**
 * Default token-to-character ratio used when no model-specific estimator is registered.
 * Based on the GPT-4 average of roughly 4 characters per token (i.e. 0.25 tokens/char).
 */
const DEFAULT_TOKENS_PER_CHAR = 0.25;

/**
 * Number of non-empty lines inspected at the start of a JSONL file to detect its format.
 * Checking the first 10 lines is sufficient to identify a VS Code delta-based file
 * (which always starts with a `kind:0` event) without scanning the entire file.
 */
const FORMAT_DETECTION_LINE_LIMIT = 10;

export function estimateTokensFromText(text: string, model: string = 'gpt-4', tokenEstimators: Record<string, TokenEstimator> = {}): number {
	// Token estimation based on character count and model
	let tokensPerChar = DEFAULT_TOKENS_PER_CHAR;

	// Find matching model
	for (const [modelKey, ratio] of Object.entries(tokenEstimators)) {
		if (model.includes(modelKey) || model.includes(modelKey.replace('-', ''))) {
			tokensPerChar = ratio;
			break;
		}
	}

	return Math.ceil(text.length * tokensPerChar);
}

/**
 * Normalize a display model name (e.g. "Claude Haiku 4.5") to a model ID slug
 * (e.g. "claude-haiku-4.5") so it can be matched against tokenEstimators keys.
 */
export function normalizeDisplayModelName(displayName: string): string {
	return displayName.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Extract sub-agent prompt (input) and result (output) text from a
 * `toolInvocationSerialized` response item where `toolSpecificData.kind === 'subagent'`.
 *
 * Returns null if the item is not a completed sub-agent invocation.
 *
 * The `result` field may be stored as:
 *   - a plain string, or
 *   - a streaming-char object: { "0": "H", "1": "i", ... }
 */
export function extractSubAgentData(item: unknown): { prompt: string; result: string; modelName: string } | null {
	if (!isToolInvocationSerialized(item)) { return null; }
	const tsd = item.toolSpecificData;
	if (!isSubAgentToolSpecificData(tsd)) { return null; }

	const prompt = typeof tsd.prompt === 'string' ? tsd.prompt : '';

	let result = '';
	if (typeof tsd.result === 'string') {
		result = tsd.result;
	} else if (tsd.result !== null && typeof tsd.result === 'object') {
		// Streaming char format: {"0":"H","1":"i",...} — sort by numeric key then join
		const entries = Object.entries(tsd.result as Record<string, unknown>);
		entries.sort(([a], [b]) => Number(a) - Number(b));
		result = entries.map(([, v]) => (typeof v === 'string' ? v : '')).join('');
	}

	const rawModel = typeof tsd.modelName === 'string' ? tsd.modelName : '';
	const modelName = rawModel ? normalizeDisplayModelName(rawModel) : '';

	return (prompt || result) ? { prompt, result, modelName } : null;
}

/**
 * Extract text content from a single response item, separating thinking from regular response text.
 * Prefers content.value over value to avoid double-counting when both are present.
 *
 * @returns text - the extracted text, or empty string if none
 * @returns isThinking - true if this is a thinking (extended reasoning) item
 */
export function extractResponseItemText(item: unknown): { text: string; isThinking: boolean } {
	if (typeof item !== 'object' || item === null) {
		return { text: '', isThinking: false };
	}
	const obj = item as Record<string, unknown>;
	if (obj['kind'] === 'thinking') {
		const value = obj['value'];
		return { text: typeof value === 'string' ? value : '', isThinking: true };
	}
	// Prefer content.value when present to avoid double-counting wrapper text.
	const content = obj['content'];
	if (typeof content === 'object' && content !== null) {
		const contentValue = (content as Record<string, unknown>)['value'];
		if (typeof contentValue === 'string' && contentValue) {
			return { text: contentValue, isThinking: false };
		}
	}
	const value = obj['value'];
	if (typeof value === 'string' && value) {
		return { text: value, isThinking: false };
	}
	return { text: '', isThinking: false };
}

/** Return type for all token estimation strategies. */
export type TokenEstimationResult = {
	tokens: number;
	thinkingTokens: number;
	actualTokens: number;
	cacheReadTokens: number;
	modelUsage: ModelUsage;
	dailyActualTokens: Record<string, number>;
};

/**
 * Strategy interface for estimating tokens from a JSONL session file.
 * Each implementation handles a distinct session file format.
 */
export interface TokenEstimationStrategy {
	estimate(lines: string[]): TokenEstimationResult;
}

// --- DeltaTokenStrategy helpers ---

/** Accumulator for the incremental-token counting loop in DeltaTokenStrategy. */
interface DtsAccumulator {
	totalTokens: number;
	totalThinkingTokens: number;
	parseFailedLines: number;
}

/** Extract token count from one request's result object (all known delta formats). */
function _dtsExtractFromResult(result: RequestResult): number {
	if (typeof result.promptTokens === 'number' && typeof result.outputTokens === 'number') {
		return result.promptTokens + result.outputTokens;
	}
	// INSIDERS FORMAT (Feb 2026+): Tokens nested under result.metadata
	if (result.metadata && typeof result.metadata.promptTokens === 'number' && typeof result.metadata.outputTokens === 'number') {
		return result.metadata.promptTokens + result.metadata.outputTokens;
	}
	if (result.usage) {
		const prompt = typeof result.usage.promptTokens === 'number' ? result.usage.promptTokens : 0;
		const completion = typeof result.usage.completionTokens === 'number' ? result.usage.completionTokens : 0;
		return prompt + completion;
	}
	return 0;
}

/**
 * Extract total actual tokens from reconstructed request list.
 * Falls back to regex-parsed usage when a request result failed JSON.parse.
 */
function _dtsExtractActualTokens(
	requests: unknown[],
	rawUsageFallback: Map<number, { promptTokens: number; outputTokens: number }>
): number {
	let maxIndex = requests.length;
	for (const idx of rawUsageFallback.keys()) {
		if (idx + 1 > maxIndex) { maxIndex = idx + 1; }
	}
	let totalActualTokens = 0;
	for (let i = 0; i < maxIndex; i++) {
		const result = getRequestResult(requests[i]);
		const fromResult = result ? _dtsExtractFromResult(result) : 0;
		if (fromResult > 0) {
			totalActualTokens += fromResult;
		} else {
			const extracted = rawUsageFallback.get(i);
			if (extracted) { totalActualTokens += extracted.promptTokens + extracted.outputTokens; }
		}
	}
	return totalActualTokens;
}

/** Count estimated tokens for a single response item if it is a completed sub-agent invocation. */
function _dtsCountSubAgentItem(responseItem: unknown): number {
	const subAgent = extractSubAgentData(responseItem);
	if (!subAgent) { return 0; }
	let total = 0;
	if (subAgent.prompt) { total += estimateTokensFromText(subAgent.prompt); }
	if (subAgent.result) { total += estimateTokensFromText(subAgent.result); }
	return total;
}

/**
 * Count sub-agent tokens from the fully-reconstructed request list.
 * Sub-agent results accumulate char-by-char; only the final state is complete.
 */
function _dtsExtractSubAgentTokens(requests: unknown[]): number {
	let total = 0;
	for (const request of requests) {
		const responseItems = getResponseArray(request);
		if (!responseItems) { continue; }
		for (const responseItem of responseItems) {
			total += _dtsCountSubAgentItem(responseItem);
		}
	}
	return total;
}

/** Estimate tokens from incremental kind:2 request appends. Returns 0 for non-matching events. */
function _dtsProcessIncrementalRequests(event: Record<string, unknown>): number {
	const k = event.k as unknown[] | undefined;
	if (event.kind !== 2 || k?.[0] !== 'requests' || !Array.isArray(event.v)) { return 0; }
	let tokens = 0;
	for (const request of event.v as unknown[]) {
		const req = request as Record<string, unknown>;
		const msg = req['message'] as Record<string, unknown> | undefined;
		if (msg?.['text']) { tokens += estimateTokensFromText(String(msg['text'])); }
	}
	return tokens;
}

/** Add estimated tokens for one response item to the accumulator. Skips sub-agent items. */
function _dtsAddResponseItemTokens(responseItem: unknown, acc: DtsAccumulator): void {
	if (extractSubAgentData(responseItem)) { return; }
	const { text, isThinking } = extractResponseItemText(responseItem);
	if (!text) { return; }
	if (isThinking) { acc.totalThinkingTokens += estimateTokensFromText(text); }
	else { acc.totalTokens += estimateTokensFromText(text); }
}

/** Process incremental kind:2 response appends, updating the accumulator in place. */
function _dtsProcessIncrementalResponse(event: Record<string, unknown>, acc: DtsAccumulator): void {
	const k = event.k as unknown[] | undefined;
	if (event.kind !== 2 || !k?.includes('response') || !Array.isArray(event.v)) { return; }
	for (const responseItem of event.v as unknown[]) {
		_dtsAddResponseItemTokens(responseItem, acc);
	}
}

/**
 * Handles VS Code delta-based JSONL format (kind:0/1/2 events).
 *
 * Reconstructs the full session state by applying deltas, then extracts:
 * - Estimated tokens from request message text and response items (kind:2 appends)
 * - Actual token counts from the reconstructed result objects
 * - Sub-agent tokens from the fully assembled response items
 * - Regex fallback for requests whose JSON.parse failed
 */
export class DeltaTokenStrategy implements TokenEstimationStrategy {
	estimate(lines: string[]): TokenEstimationResult {
		const acc: DtsAccumulator = { totalTokens: 0, totalThinkingTokens: 0, parseFailedLines: 0 };
		let sessionState: Record<string, unknown> = {};

		for (const line of lines) {
			if (!line.trim()) { continue; }
			try {
				const event = JSON.parse(line) as Record<string, unknown>;
				sessionState = applyDelta(sessionState, event) as Record<string, unknown>;
				acc.totalTokens += _dtsProcessIncrementalRequests(event);
				_dtsProcessIncrementalResponse(event, acc);
			} catch {
				acc.parseFailedLines++;
			}
		}

		// Extract actual tokens from the reconstructed state (handles all delta path patterns).
		// Use per-request regex fallback so that requests whose result lines failed JSON.parse
		// still contribute actual tokens instead of being silently lost.
		const rawUsageFallback = acc.parseFailedLines > 0
			? extractPerRequestUsageFromRawLines(lines)
			: new Map<number, { promptTokens: number; outputTokens: number }>();
		const rawRequests = sessionState['requests'];
		const requests = (Array.isArray(rawRequests) ? rawRequests : []) as unknown[];
		const totalActualTokens = _dtsExtractActualTokens(requests, rawUsageFallback);

		// Sub-agent results are built up char-by-char via delta events and are only
		// complete in the fully reconstructed state — count them here.
		acc.totalTokens += _dtsExtractSubAgentTokens(requests);

		return {
			tokens: acc.totalTokens + acc.totalThinkingTokens,
			thinkingTokens: acc.totalThinkingTokens,
			actualTokens: totalActualTokens,
			cacheReadTokens: 0,
			modelUsage: {},
			dailyActualTokens: {},
		};
	}
}

// --- EventJsonlTokenStrategy helpers ---

/** Mutable state accumulated while processing an event-based JSONL session. */
interface EjtsState {
	totalTokens: number;
	totalThinkingTokens: number;
	cliActualTokens: number;
	cliCacheReadTokens: number;
	cliShutdownModelUsage: ModelUsage | null;
	cliRealOutputByModel: { [model: string]: number } | null;
	totalEstToolCalls: number;
	dailyActualTokens: Record<string, number>;
}

/** Accumulate one model's metrics from a session.shutdown event into state. Returns the total tokens added. */
function _ejtsAccumulateModelMetrics(modelName: string, metrics: ShutdownModelMetrics, state: EjtsState): number {
	const usage = metrics?.usage;
	if (!usage) { return 0; }
	const input = typeof usage.inputTokens === 'number' ? usage.inputTokens : 0;
	const output = typeof usage.outputTokens === 'number' ? usage.outputTokens : 0;
	const cacheRead = typeof usage.cacheReadTokens === 'number' ? usage.cacheReadTokens : 0;
	const cacheWrite = typeof usage.cacheWriteTokens === 'number' ? usage.cacheWriteTokens : 0;
	state.cliActualTokens += input + output;
	state.cliCacheReadTokens += cacheRead;
	if (!state.cliShutdownModelUsage![modelName]) {
		state.cliShutdownModelUsage![modelName] = { inputTokens: 0, outputTokens: 0 };
	}
	state.cliShutdownModelUsage![modelName].inputTokens += input;
	state.cliShutdownModelUsage![modelName].outputTokens += output;
	if (cacheRead > 0) {
		state.cliShutdownModelUsage![modelName].cachedReadTokens = (state.cliShutdownModelUsage![modelName].cachedReadTokens ?? 0) + cacheRead;
	}
	if (cacheWrite > 0) {
		state.cliShutdownModelUsage![modelName].cacheCreationTokens = (state.cliShutdownModelUsage![modelName].cacheCreationTokens ?? 0) + cacheWrite;
	}
	return input + output;
}

/** Handle a session.shutdown event — extract per-model token totals and daily attribution. */
function _ejtsHandleShutdown(event: Record<string, unknown>, state: EjtsState): void {
	const data = event.data as Record<string, unknown> | undefined;
	if (!data?.modelMetrics) { return; }
	if (!state.cliShutdownModelUsage) { state.cliShutdownModelUsage = {}; }
	let shutdownTotal = 0;
	for (const [modelName, metrics] of Object.entries(data.modelMetrics) as [string, ShutdownModelMetrics][]) {
		shutdownTotal += _ejtsAccumulateModelMetrics(modelName, metrics, state);
	}
	if (shutdownTotal > 0 && event.timestamp) {
		const dayKey = new Date(String(event.timestamp)).toISOString().slice(0, 10);
		if (dayKey && dayKey !== 'Inval') {
			state.dailyActualTokens[dayKey] = (state.dailyActualTokens[dayKey] || 0) + shutdownTotal;
		}
	}
}

function _ejtsAccumulateThinkingTokens(data: Record<string, unknown> | undefined, state: EjtsState): void {
	const reasoningText = data?.reasoningText;
	if (typeof reasoningText === 'string' && reasoningText) { state.totalThinkingTokens += estimateTokensFromText(reasoningText); }
	const thinkingText = (data?.thinking as Record<string, unknown> | undefined)?.text;
	if (typeof thinkingText === 'string' && thinkingText) { state.totalThinkingTokens += estimateTokensFromText(thinkingText); }
}

function _ejtsAccumulateRealOutput(data: Record<string, unknown>, realOut: number, state: EjtsState): void {
	if (!state.cliRealOutputByModel) { state.cliRealOutputByModel = {}; }
	const m = String(data?.model ?? 'unknown');
	state.cliRealOutputByModel[m] = (state.cliRealOutputByModel[m] ?? 0) + realOut;
}

/** Handle assistant.message event — accumulate real or estimated output tokens and thinking tokens. */
function _ejtsHandleAssistantMessage(event: Record<string, unknown>, state: EjtsState): void {
	const data = event.data as Record<string, unknown> | undefined;
	const realOut = typeof data?.outputTokens === 'number' ? data.outputTokens as number : 0;
	if (realOut > 0) { _ejtsAccumulateRealOutput(data!, realOut, state); }
	else if (data?.content) { state.totalTokens += estimateTokensFromText(String(data.content)); }
	_ejtsAccumulateThinkingTokens(data, state);
}

function _ejtsHandleToolComplete(data: Record<string, unknown> | undefined, state: EjtsState): void {
	if (!data?.result) { return; }
	const result = data.result as Record<string, unknown>;
	const text = typeof result.detailedContent === 'string' ? result.detailedContent
		: typeof result.content === 'string' ? result.content : '';
	if (text) { state.totalTokens += estimateTokensFromText(text); }
}

/** Dispatch an event to the appropriate handler based on its type field. */
function _ejtsHandleEventType(event: Record<string, unknown>, state: EjtsState): void {
	const data = event.data as Record<string, unknown> | undefined;
	if (event.type === 'user.message' && data?.content) {
		state.totalTokens += estimateTokensFromText(String(data.content));
	} else if (event.type === 'user.message_rendered' && data?.renderedMessage) {
		state.totalTokens += estimateTokensFromText(String(data.renderedMessage));
	} else if (event.type === 'assistant.message') {
		_ejtsHandleAssistantMessage(event, state);
	} else if (event.type === 'tool.execution_start') {
		state.totalEstToolCalls++;
	} else if (event.type === 'tool.execution_complete') {
		_ejtsHandleToolComplete(data, state);
	} else if (event.content) {
		state.totalTokens += estimateTokensFromText(String(event.content));
	}
}

/**
 * Apply ratio-based total estimation when no session.shutdown token data is available.
 * Heavy agent sessions show ~130x ratio; cache reads ≈ input (50% of total from completed sessions).
 */
function _ejtsEstimateFromRealOutput(state: EjtsState): void {
	if (!state.cliRealOutputByModel) { return; }
	const inputOutputRatio = state.totalEstToolCalls > TOOL_CALLS_HIGH_THRESHOLD ? TOKEN_RATIO_HIGH_TOOLS
		: state.totalEstToolCalls > TOOL_CALLS_MED_THRESHOLD ? TOKEN_RATIO_MED_TOOLS
		: TOKEN_RATIO_LOW_TOOLS;
	for (const realOutput of Object.values(state.cliRealOutputByModel)) {
		const estimatedInput = Math.round(realOutput * inputOutputRatio);
		state.cliActualTokens += estimatedInput + realOutput;  // input + output (cache is a subset of input)
		state.cliCacheReadTokens += estimatedInput;            // cache ≈ input from empirical data
	}
}

/**
 * Handles event-based JSONL format (Copilot CLI, JetBrains, and similar tools).
 *
 * Events are identified by a `type` string field. Supports:
 * - `session.shutdown`: exact token totals per model, daily attribution
 * - `user.message` / `user.message_rendered`: user input estimation
 * - `assistant.message`: output estimation or real token counts
 * - `tool.execution_start` / `tool.execution_complete`: tool call counting and result estimation
 * - Ratio-based total estimation when no session.shutdown is present
 */
export class EventJsonlTokenStrategy implements TokenEstimationStrategy {
	estimate(lines: string[]): TokenEstimationResult {
		const state: EjtsState = {
			totalTokens: 0,
			totalThinkingTokens: 0,
			cliActualTokens: 0,
			cliCacheReadTokens: 0,
			cliShutdownModelUsage: null,
			cliRealOutputByModel: null,
			totalEstToolCalls: 0,
			dailyActualTokens: {},
		};

		for (const line of lines) {
			if (!line.trim()) { continue; }
			try {
				const event = JSON.parse(line) as Record<string, unknown>;
				if (event.type === 'session.shutdown') { _ejtsHandleShutdown(event, state); }
				_ejtsHandleEventType(event, state);
			} catch { /* skip invalid lines */ }
		}

		// No session.shutdown: use real outputTokens from assistant.message + observed input:output ratios.
		if (!state.cliActualTokens) { _ejtsEstimateFromRealOutput(state); }

		return {
			tokens: state.totalTokens + state.totalThinkingTokens,
			thinkingTokens: state.totalThinkingTokens,
			actualTokens: state.cliActualTokens,
			cacheReadTokens: state.cliCacheReadTokens,
			modelUsage: state.cliShutdownModelUsage ?? {},
			dailyActualTokens: state.dailyActualTokens,
		};
	}
}

/**
 * Select the appropriate token estimation strategy for the given JSONL lines.
 *
 * VS Code delta-based files always begin with a `kind:0` event. Checking the first
 * few non-empty lines is sufficient and avoids double-parsing the whole file.
 * All other formats (Copilot CLI, JetBrains, …) use the event-based strategy.
 */
export function selectTokenEstimationStrategy(lines: string[]): TokenEstimationStrategy {
	let checked = 0;
	for (const line of lines) {
		if (!line.trim()) { continue; }
		if (++checked > FORMAT_DETECTION_LINE_LIMIT) { break; }
		try {
			const event = JSON.parse(line);
			if (typeof event.kind === 'number') { return new DeltaTokenStrategy(); }
		} catch { /* continue scanning */ }
	}
	return new EventJsonlTokenStrategy();
}

/**
 * Estimate tokens from a JSONL session file (used by Copilot CLI/Agent mode and VS Code incremental format)
 * Each line is a separate JSON object representing an event in the session
 */
export function estimateTokensFromJsonlSession(fileContent: string): TokenEstimationResult {
	const lines = fileContent.trim().split('\n');
	const strategy = selectTokenEstimationStrategy(lines);
	return strategy.estimate(lines);
}

/**
 * Asynchronously reconstruct the full session state from delta-based JSONL lines.
 * Yields to the event loop every `yieldInterval` lines to prevent starving the
 * extension host's single-threaded event loop on large files.
 */
export async function reconstructJsonlStateAsync(lines: string[], yieldInterval = 500): Promise<{ sessionState: any; isDeltaBased: boolean }> {
	let sessionState: Record<string, unknown> = {};
	let isDeltaBased = false;
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		if (!line.trim()) { continue; }
		try {
			const delta = JSON.parse(line);
			if (typeof delta.kind === 'number') {
				isDeltaBased = true;
				sessionState = applyDelta(sessionState, delta) as Record<string, unknown>;
			}
		} catch {
			// Skip invalid lines
		}
		if (isDeltaBased && i > 0 && i % yieldInterval === 0) {
			await new Promise<void>(resolve => setTimeout(resolve, 0));
		}
	}
	return { sessionState, isDeltaBased };
}

/** Accumulator used by extractAllTokensFromDebugLog. */
interface EatdlAcc {
	inputTokens: number;
	outputTokens: number;
	cachedTokens: number;
	modelTurns: number;
	modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }>;
}

/** Process one llm_request event into the accumulator. */
function _eatdlProcessLlmRequest(event: Record<string, unknown>, acc: EatdlAcc): void {
	acc.modelTurns++;
	const attrs = event.attrs as Record<string, unknown> | undefined;
	const inp = typeof attrs?.inputTokens === 'number' ? attrs.inputTokens : 0;
	const out = typeof attrs?.outputTokens === 'number' ? attrs.outputTokens : 0;
	const cached = typeof attrs?.cachedTokens === 'number' ? attrs.cachedTokens : 0;
	acc.inputTokens += inp;
	acc.outputTokens += out;
	acc.cachedTokens += cached;
	const model = typeof attrs?.model === 'string' && attrs.model ? attrs.model : '';
	if (!model) { return; }
	const entry = acc.modelBreakdown[model] ?? { inputTokens: 0, outputTokens: 0, cachedTokens: 0 };
	entry.inputTokens += inp;
	entry.outputTokens += out;
	entry.cachedTokens += cached;
	acc.modelBreakdown[model] = entry;
}

/**
 * Extract token totals from all `llm_request` events in a Copilot Chat debug log.
 *
 * Agent-mode sessions make multiple LLM API calls per user turn. Only the last
 * call's tokens are stored in the chat session file; the debug log records every
 * call. Summing across all `llm_request` events gives the true session total.
 *
 * Returns null when no `llm_request` events are found (debug logging disabled,
 * or file is empty / does not exist).
 */
type EatdlState = { inputTokens: number; outputTokens: number; cachedTokens: number; modelTurns: number; modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }> };

function _eatdlProcessEvent(event: unknown, state: EatdlState): void {
	const ev = event as Record<string, unknown>;
	if (ev['type'] !== 'llm_request') { return; }
	state.modelTurns++;
	const attrs = ev['attrs'] as Record<string, unknown> | undefined;
	const inp = typeof attrs?.['inputTokens'] === 'number' ? attrs['inputTokens'] as number : 0;
	const out = typeof attrs?.['outputTokens'] === 'number' ? attrs['outputTokens'] as number : 0;
	const cached = typeof attrs?.['cachedTokens'] === 'number' ? attrs['cachedTokens'] as number : 0;
	state.inputTokens += inp;
	state.outputTokens += out;
	state.cachedTokens += cached;
	const model = typeof attrs?.['model'] === 'string' && attrs['model'] ? attrs['model'] as string : '';
	if (model) {
		const entry = state.modelBreakdown[model] ?? { inputTokens: 0, outputTokens: 0, cachedTokens: 0 };
		entry.inputTokens += inp;
		entry.outputTokens += out;
		entry.cachedTokens += cached;
		state.modelBreakdown[model] = entry;
	}
}

export function extractAllTokensFromDebugLog(content: string): {
	inputTokens: number;
	outputTokens: number;
	cachedTokens: number;
	modelTurns: number;
	modelBreakdown: Record<string, { inputTokens: number; outputTokens: number; cachedTokens: number }>;
} | null {
	const acc: EatdlAcc = { inputTokens: 0, outputTokens: 0, cachedTokens: 0, modelTurns: 0, modelBreakdown: {} };
	for (const line of content.split(/\r?\n/)) {
		if (!line.trim()) { continue; }
		try {
			const event = JSON.parse(line);
			if (event.type === 'llm_request') { _eatdlProcessLlmRequest(event as Record<string, unknown>, acc); }
		} catch { /* skip invalid lines */ }
	}
	return acc.modelTurns > 0 ? acc : null;
}

/**
 * Extract total cached (prompt-cache-hit) tokens from a Copilot Chat debug log
 * file (typically at `debug-logs/{sessionId}/main.jsonl`).
 *
 * Each `llm_request` telemetry event records the number of input tokens served
 * from the provider's prompt cache in `attrs.cachedTokens`. Summing these across
 * all LLM calls in the log gives the session-level cached-token count.
 *
 * Returns 0 when no cached-token data is found (e.g. debug logging disabled,
 * non-Claude model, or file does not exist).
 */
export function extractCachedTokensFromDebugLog(content: string): number {
	return extractAllTokensFromDebugLog(content)?.cachedTokens ?? 0;
}

/**
 * Extract the reasoning effort level from a model object's metadata.
 * Navigates: model → metadata → configurationSchema → properties → reasoningEffort → default.
 */
function _bretExtractEffortFromModel(model: unknown): string | null {
	if (!model || typeof model !== 'object') { return null; }
	const m = model as Record<string, unknown>;
	const metadata = m['metadata'];
	if (!metadata || typeof metadata !== 'object') { return null; }
	const meta = metadata as Record<string, unknown>;
	const schema = meta['configurationSchema'];
	if (!schema || typeof schema !== 'object') { return null; }
	const s = schema as Record<string, unknown>;
	const props = s['properties'];
	if (!props || typeof props !== 'object') { return null; }
	const p = props as Record<string, unknown>;
	const re = p['reasoningEffort'];
	if (!re || typeof re !== 'object') { return null; }
	const r = re as Record<string, unknown>;
	return typeof r['default'] === 'string' ? r['default'] : null;
}

/** Mutable state for buildReasoningEffortTimeline. */
interface BretState {
	effortByRequestId: Map<string, string>;
	currentEffort: string | null;
	defaultEffort: string | null;
	switchCount: number;
}

/** Handle kind:0 (initial state) delta for reasoning effort timeline. */
function _bretHandleKind0(delta: DeltaEvent, state: BretState): void {
	const v = delta.v as Record<string, unknown> | undefined;
	const inputState = v?.['inputState'] as Record<string, unknown> | undefined;
	const effort = _bretExtractEffortFromModel(inputState?.['selectedModel']);
	if (effort !== null) { state.currentEffort = effort; state.defaultEffort = effort; }
}

/** Handle kind:1 (update) delta for reasoning effort timeline. */
function _bretHandleKind1(delta: DeltaEvent, state: BretState): void {
	const k = delta.k;
	if (!Array.isArray(k) || k[0] !== 'inputState' || k[1] !== 'selectedModel') { return; }
	const effort = _bretExtractEffortFromModel(delta.v);
	if (effort !== null && effort !== state.currentEffort) {
		if (state.currentEffort !== null) { state.switchCount++; }
		state.currentEffort = effort;
	}
}

/** Handle kind:2 (append) delta for reasoning effort timeline. */
function _bretHandleKind2(delta: DeltaEvent, state: BretState): void {
	const k = delta.k;
	if (!Array.isArray(k) || k[0] !== 'requests' || typeof k[1] !== 'number' || state.currentEffort === null) { return; }
	const req = delta.v;
	if (!req || typeof req !== 'object') { return; }
	const requestId = typeof (req as Record<string, unknown>)['requestId'] === 'string'
		? (req as Record<string, unknown>)['requestId'] as string : null;
	if (requestId) { state.effortByRequestId.set(requestId, state.currentEffort); }
}


export function buildReasoningEffortTimeline(lines: string[]): {
  effortByRequestId: Map<string, string>;
  defaultEffort: string | null;
  switchCount: number;
} {
	const state: BretState = { effortByRequestId: new Map(), currentEffort: null, defaultEffort: null, switchCount: 0 };

	for (const line of lines) {
		if (!line.trim()) { continue; }
		let delta: DeltaEvent;
		try { delta = JSON.parse(line) as DeltaEvent; } catch { continue; }
		if (typeof delta.kind !== 'number') { continue; }
		if (delta.kind === 0) { _bretHandleKind0(delta, state); }
		else if (delta.kind === 1) { _bretHandleKind1(delta, state); }
		else if (delta.kind === 2) { _bretHandleKind2(delta, state); }
	}

	return { effortByRequestId: state.effortByRequestId, defaultEffort: state.defaultEffort, switchCount: state.switchCount };
}

/**
 * Extract per-request actual token usage from raw JSONL lines using regex.
 * Handles cases where lines with result data fail JSON.parse due to bad escape characters.
 * Supports both old format (usage.promptTokens/completionTokens) and new format (promptTokens/outputTokens).
 */
export function extractPerRequestUsageFromRawLines(lines: string[]): Map<number, { promptTokens: number; outputTokens: number }> {
	const usage = new Map<number, { promptTokens: number; outputTokens: number }>();
	for (const line of lines) {
		if (!line.includes('"result"')) { continue; }
		const resultMatch = line.match(/"k":\s*\["requests",\s*(\d+),\s*"result"\]/);
		if (!resultMatch) { continue; }
		const requestIndex = parseInt(resultMatch[1], 10);
		const promptMatch = line.match(/"promptTokens":(\d+)/);
		const outputMatch = line.match(/"outputTokens":(\d+)/);
		const completionMatch = line.match(/"completionTokens":(\d+)/);
		if (promptMatch && (outputMatch || completionMatch)) {
			usage.set(requestIndex, {
				promptTokens: parseInt(promptMatch[1], 10),
				outputTokens: parseInt(outputMatch?.[1] || completionMatch![1], 10)
			});
		}
	}
	return usage;
}

/** Build a reverse lookup map from display name → model ID using modelPricing entries. */
function _gmfrBuildReverseMap(modelPricing: { [key: string]: ModelPricing }): { [displayName: string]: string } {
	const reverseMap: { [displayName: string]: string } = {};
	for (const [modelId, pricing] of Object.entries(modelPricing)) {
		if (pricing.displayNames) {
			for (const displayName of pricing.displayNames) {
				reverseMap[displayName] = modelId;
			}
		}
	}
	return reverseMap;
}

/** Find the model ID for a request by matching display names against its details string. Returns null if not found. */
function _gmfrFindByDisplayName(details: string, modelPricing: { [key: string]: ModelPricing }): string | null {
	const reverseMap = _gmfrBuildReverseMap(modelPricing);
	// Sort by length descending to match longer names first (e.g., "Gemini 3 Pro (Preview)" before "Gemini 3 Pro")
	const sortedNames = Object.keys(reverseMap).sort((a, b) => b.length - a.length);
	for (const displayName of sortedNames) {
		if (details.includes(displayName)) { return reverseMap[displayName]; }
	}
	return null;
}

function _gmrBuildDisplayNameLookup(modelPricing: { [key: string]: ModelPricing }): { [displayName: string]: string } {
const map: { [displayName: string]: string } = {};
for (const [modelId, pricing] of Object.entries(modelPricing)) {
if (pricing.displayNames) {
for (const displayName of pricing.displayNames) { map[displayName] = modelId; }
}
}
return map;
}

function _gmrMatchDisplayName(details: string, displayNameMap: { [dn: string]: string }): string | null {
const sorted = Object.keys(displayNameMap).sort((a, b) => b.length - a.length);
for (const displayName of sorted) {
if (details.includes(displayName)) { return displayNameMap[displayName]; }
}
return null;
}

export function getModelFromRequest(request: ModelRequestSource, modelPricing: { [key: string]: ModelPricing } = {}): string {
	if (request.modelId) { return request.modelId.replace(/^copilot\//, ''); }
	if (request.result?.metadata?.modelId) { return request.result.metadata.modelId.replace(/^copilot\//, ''); }
	if (request.result?.details) {
		const matched = _gmrMatchDisplayName(request.result.details, _gmrBuildDisplayNameLookup(modelPricing));
		if (matched) { return matched; }
	}

	if (request.result?.metadata?.modelId) {
		return request.result.metadata.modelId.replace(/^copilot\//, '');
	}

	if (request.result?.details) {
		const found = _gmfrFindByDisplayName(request.result.details, modelPricing);
		if (found) { return found; }
	}

	return 'gpt-4'; // default
}

/**
 * Detect if file content is JSONL format (multiple JSON objects, one per line)
 * This handles cases where .json files actually contain JSONL content
 */
export function isJsonlContent(content: string): boolean {
	const trimmed = content.trim();
	// JSONL typically has multiple lines, each starting with { and ending with }
	if (!trimmed.includes('\n')) {
		return false; // Single line - not JSONL
	}
	const lines = trimmed.split('\n').filter(l => l.trim());
	if (lines.length < 2) {
		return false; // Need multiple lines for JSONL
	}
	// Check if first two non-empty lines look like separate JSON objects
	const firstLine = lines[0].trim();
	const secondLine = lines[1].trim();
	return firstLine.startsWith('{') && firstLine.endsWith('}') &&
		secondLine.startsWith('{') && secondLine.endsWith('}');
}

/**
 * Check if file content is a UUID-only pointer file (new Copilot CLI format).
 * These files contain only a session ID instead of actual session data.
 * @param content The file content to check
 * @returns true if the content is a UUID-only pointer file
 */
export function isUuidPointerFile(content: string): boolean {
	const trimmedContent = content.trim();
	return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(trimmedContent);
}

// --- applyDelta helpers ---

/** During path traversal, get-or-create the child node at `seg` inside `container`. */
function _adGetOrCreate(
	container: Record<string, unknown> | unknown[],
	seg: string,
	wantsArray: boolean
): Record<string, unknown> | unknown[] {
	if (Array.isArray(container)) {
		const idx = Number(seg);
		if (!container[idx] || typeof container[idx] !== 'object') {
			container[idx] = wantsArray ? [] : {};
		}
		return container[idx] as Record<string, unknown> | unknown[];
	} else {
		if (!container[seg] || typeof container[seg] !== 'object') {
			container[seg] = wantsArray ? [] : {};
		}
		return container[seg] as Record<string, unknown> | unknown[];
	}
}

/** Set value at the last path segment (kind:1). */
function _adApplyKind1(current: Record<string, unknown> | unknown[], lastSeg: string, v: unknown): void {
	if (Array.isArray(current)) { current[Number(lastSeg)] = v; }
	else { current[lastSeg] = v; }
}

/** Push value(s) onto an array target. */
function _adApplyKind2Target(target: unknown[], v: unknown): void {
	if (Array.isArray(v)) { target.push(...(v as unknown[])); }
	else { target.push(v); }
}

/** Get-or-create the target array at the last path segment and append value(s) (kind:2). */
function _adApplyKind2(current: Record<string, unknown> | unknown[], lastSeg: string, v: unknown): void {
	let target: unknown[];
	if (Array.isArray(current)) {
		const idx = Number(lastSeg);
		if (!Array.isArray(current[idx])) { current[idx] = []; }
		target = current[idx] as unknown[];
	} else {
		if (!Array.isArray(current[lastSeg])) { current[lastSeg] = []; }
		target = current[lastSeg] as unknown[];
	}
	_adApplyKind2Target(target, v);
}


export function applyDelta(state: unknown, delta: unknown): unknown {
	if (typeof delta !== 'object' || delta === null) { return state; }
	const d = delta as Record<string, unknown>;
	const { kind, k, v } = d;

	if (kind === 0) { return v; }

	if (!Array.isArray(k) || k.length === 0) { return state; }

	const pathArr = k.map(String);
	let root: Record<string, unknown> | unknown[] = typeof state === 'object' && state !== null
		? state as Record<string, unknown> | unknown[] : {};
	let current: Record<string, unknown> | unknown[] = root;

	// Traverse to the parent of the target location
	for (let i = 0; i < pathArr.length - 1; i++) {
		current = _adGetOrCreate(current, pathArr[i], /^\d+$/.test(pathArr[i + 1]));
	}

	const lastSeg = pathArr[pathArr.length - 1];
	if (kind === 1) { _adApplyKind1(current, lastSeg, v); return root; }
	if (kind === 2) { _adApplyKind2(current, lastSeg, v); return root; }

	return root;
}

export function getModelTier(modelId: string, modelPricing: { [key: string]: ModelPricing } = {}): 'standard' | 'premium' | 'unknown' {
	// Determine tier based on multiplier: 0 = standard, >0 = premium
	// Look up from modelPricing.json
	const pricingInfo = modelPricing[modelId];
	if (pricingInfo && typeof pricingInfo.multiplier === 'number') {
		return pricingInfo.multiplier === 0 ? 'standard' : 'premium';
	}

	// Fallback: try to match partial model names
	for (const [key, value] of Object.entries(modelPricing)) {
		if (modelId.includes(key) || key.includes(modelId)) {
			if (typeof value.multiplier === 'number') {
				return value.multiplier === 0 ? 'standard' : 'premium';
			}
		}
	}

	return 'unknown';
}

/**
 * Calculate estimated cost in USD based on model usage.
 * Applies cache-aware pricing when cachedReadTokens / cacheCreationTokens breakdowns
 * are available (e.g. Claude Desktop / Claude Code / OpenCode sessions).
 *
 * Cost formula:
 *   uncachedInput = inputTokens - (cachedReadTokens ?? 0) - (cacheCreationTokens ?? 0)
 *   cost = uncachedInput × inputCostPerMillion
 *        + cachedReadTokens × cachedInputCostPerMillion (fallback: inputCostPerMillion)
 *        + cacheCreationTokens × cacheCreationCostPerMillion (fallback: inputCostPerMillion)
 *        + outputTokens × outputCostPerMillion
 *
 * @param modelUsage Object with model names as keys and token counts as values
 * @param modelPricing Pricing table keyed by model id
 * @param pricingSource 'provider' (default) uses the top-level provider/API rates;
 *                      'copilot' uses each model's `copilotPricing` block when present,
 *                      and falls back to provider rates for models without one.
 * @returns Estimated cost in USD
 */
export function calculateEstimatedCost(
	modelUsage: ModelUsage,
	modelPricing: { [key: string]: ModelPricing } = {},
	pricingSource: 'provider' | 'copilot' = 'provider'
): number {
	let totalCost = 0;

	for (const [model, usage] of Object.entries(modelUsage)) {
		const baseEntry = modelPricing[model] ?? modelPricing['gpt-4o-mini'];
		if (!baseEntry) {
			continue;
		}

		// Pick which rate set to use. For 'copilot', prefer the model's copilotPricing
		// block; if absent, fall back to the provider/API rates as a proxy.
		const pricing = pricingSource === 'copilot' && baseEntry.copilotPricing
			? baseEntry.copilotPricing
			: baseEntry;

		const cachedRead = usage.cachedReadTokens ?? 0;
		const cacheCreation = usage.cacheCreationTokens ?? 0;
		const uncachedInput = Math.max(0, usage.inputTokens - cachedRead - cacheCreation);

		const uncachedInputCost = (uncachedInput / 1_000_000) * pricing.inputCostPerMillion;
		const cachedReadCost = (cachedRead / 1_000_000) * (pricing.cachedInputCostPerMillion ?? pricing.inputCostPerMillion);
		const cacheCreationCost = (cacheCreation / 1_000_000) * (pricing.cacheCreationCostPerMillion ?? pricing.inputCostPerMillion);
		const outputCost = (usage.outputTokens / 1_000_000) * pricing.outputCostPerMillion;

		totalCost += uncachedInputCost + cachedReadCost + cacheCreationCost + outputCost;
	}

	return totalCost;
}

/**
 * Create empty context references object.
 */
export function createEmptyContextRefs(): ContextReferenceUsage {
	return {
		file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0,
		workspace: 0, terminal: 0, vscode: 0,
		terminalLastCommand: 0, terminalSelection: 0, clipboard: 0, changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0,
		byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {}
	};
}

// Helper method to get total tokens from ModelUsage
export function getTotalTokensFromModelUsage(modelUsage: ModelUsage): number {
	return Object.values(modelUsage).reduce((sum, usage) => sum + usage.inputTokens + usage.outputTokens, 0);
}
