export interface ModelUsage {
    [model: string]: { inputTokens: number; outputTokens: number };
}

import { extractSubAgentData, extractResponseItemText } from './tokenEstimation';
import { safeJsonParse } from './utils/jsonParse';
import { type JsonObject, isObject, isSafePathSegment, isArrayIndexSegment, normalizeModelId } from './utils/typeGuards';

interface MessagePart {
  text?: string;
}

interface RequestMessage {
  parts?: MessagePart[];
  text?: string;
}

interface ResponseItem {
  kind?: string;
  value?: string;
  content?: { value?: string };
  message?: { parts?: MessagePart[] };
}

interface RequestResult {
  usage?: { promptTokens?: number; completionTokens?: number };
  promptTokens?: number;
  outputTokens?: number;
  metadata?: { promptTokens?: number; outputTokens?: number; modelId?: string };
  details?: string;
}

interface ProcessableRequest {
  modelId?: string;
  selectedModel?: { identifier?: string };
  model?: string;
  message?: RequestMessage;
  response?: ResponseItem[];
  responses?: ResponseItem[];
  result?: RequestResult;
}

function traverseDeltaPath(
  root: JsonObject | unknown[],
  path: string[],
  ensureChild: (parent: JsonObject, key: string, nextSeg: string) => JsonObject | unknown[]
): { root: JsonObject | unknown[]; current: JsonObject | unknown[] } | null {
  let current: JsonObject | unknown[] = root;
  for (let i = 0; i < path.length - 1; i++) {
    const seg = path[i];
    const nextSeg = path[i + 1];
    if (Array.isArray(current) && isArrayIndexSegment(seg)) {
      const idx = Number(seg);
      const rawExisting = current[idx];
      let nextNode: JsonObject | unknown[];
      if (!isObject(rawExisting)) {
        nextNode = isArrayIndexSegment(nextSeg) ? [] : Object.create(null);
        current[idx] = nextNode;
      } else {
        nextNode = rawExisting;
      }
      current = nextNode;
      continue;
    }
    if (!isObject(current)) { return null; }
    current = ensureChild(current, seg, nextSeg);
  }
  return { root, current };
}

function applyDeltaKind1(root: JsonObject | unknown[], current: JsonObject | unknown[], lastSeg: string, v: unknown): unknown {
  if (Array.isArray(current) && isArrayIndexSegment(lastSeg)) {
    current[Number(lastSeg)] = v;
    return root;
  }
  if (isObject(current)) {
    Object.defineProperty(current, lastSeg, { value: v, writable: true, enumerable: true, configurable: true });
  }
  return root;
}

function applyDeltaKind2(root: JsonObject | unknown[], current: JsonObject | unknown[], lastSeg: string, v: unknown): unknown {
  let target: unknown[] | undefined;
  if (Array.isArray(current) && isArrayIndexSegment(lastSeg)) {
    const idx = Number(lastSeg);
    if (!Array.isArray(current[idx])) { current[idx] = []; }
    target = current[idx] as unknown[];
  } else if (isObject(current)) {
    if (!Array.isArray(current[lastSeg])) {
      Object.defineProperty(current, lastSeg, { value: [], writable: true, enumerable: true, configurable: true });
    }
    target = current[lastSeg] as unknown[];
  }
  if (Array.isArray(target)) {
    if (Array.isArray(v)) { target.push(...v); }
    else { target.push(v); }
  }
  return root;
}

/**
 * Apply a delta to reconstruct session state from delta-based JSONL
 * VS Code Insiders uses this format where:
 * - kind: 0 = initial state (full replacement)
 * - kind: 1 = update at key path
 * - kind: 2 = append to array at key path
 * - k = key path (array of strings)
 * - v = value
 */
function applyDelta(state: unknown, delta: unknown): unknown {
  if (!isObject(delta)) { return state; }

  const kind = delta['kind'];
  const k = delta['k'];
  const v = delta['v'];

  if (kind === 0) { return v; }
  if (!Array.isArray(k) || k.length === 0) { return state; }

  const path = k.map(String);
  for (const seg of path) {
    if (!isSafePathSegment(seg)) { return state; }
  }

  const root: JsonObject | unknown[] = isObject(state) ? state : Object.create(null);
  const ensureChildContainer = (parent: JsonObject, key: string, nextSeg: string): JsonObject | unknown[] => {
    const existing = parent[key];
    if (!isObject(existing)) {
      const newNode: JsonObject | unknown[] = isArrayIndexSegment(nextSeg) ? [] : Object.create(null);
      parent[key] = newNode;
      return newNode;
    }
    return existing;
  };

  const traverseResult = traverseDeltaPath(root, path, ensureChildContainer);
  if (!traverseResult) { return root; }
  const { root: r, current } = traverseResult;

  const lastSeg = path[path.length - 1];
  if (kind === 1) { return applyDeltaKind1(r, current, lastSeg, v); }
  if (kind === 2) { return applyDeltaKind2(r, current, lastSeg, v); }
  return r;
}

/**
 * Extract text content from response items, separating thinking text.
 */
function extractResponseAndThinkingText(response: unknown): { responseText: string; thinkingText: string } {
if (!Array.isArray(response)) {
return { responseText: '', thinkingText: '' };
}
let responseText = '';
let thinkingText = '';
for (const item of response) {
const { text, isThinking } = extractResponseItemText(item);
if (text) {
if (isThinking) { thinkingText += text; }
else { responseText += text; }
}
}
return { responseText, thinkingText };
}

/** Accumulates per-model and aggregate token counts during session parsing. */
export class TokenAccumulator {
    readonly modelUsage: ModelUsage = {};
    totalInputTokens = 0;
    totalOutputTokens = 0;

    constructor(
        private readonly defaultModel: string,
        private readonly estimateTokens: (text: string, model?: string) => number
    ) {}

    ensureModel(m?: string): string {
        return typeof m === 'string' && m ? m : this.defaultModel;
    }

    addInput(model: string, text: string): void {
        const m = this.ensureModel(model);
        if (!this.modelUsage[m]) { this.modelUsage[m] = { inputTokens: 0, outputTokens: 0 }; }
        const t = this.estimateTokens(text, m);
        this.modelUsage[m].inputTokens += t;
        this.totalInputTokens += t;
    }

    addOutput(model: string, text: string): void {
        const m = this.ensureModel(model);
        if (!this.modelUsage[m]) { this.modelUsage[m] = { inputTokens: 0, outputTokens: 0 }; }
        const t = this.estimateTokens(text, m);
        this.modelUsage[m].outputTokens += t;
        this.totalOutputTokens += t;
    }
}

export function parseSessionFileContent(
sessionFilePath: string,
fileContent: string,
estimateTokensFromText: (text: string, model?: string) => number,
getModelFromRequest?: (req: ProcessableRequest) => string
) {
// Aggregates and helpers are declared up front; the heavy lifting is delegated
let interactions = 0;
let totalThinkingTokens = 0;
let totalActualTokens = 0;

let sessionJson: unknown;
const defaultModel = 'unknown';

const accumulator = new TokenAccumulator(defaultModel, estimateTokensFromText);
const { modelUsage } = accumulator;
const addInput = accumulator.addInput.bind(accumulator);
const addOutput = accumulator.addOutput.bind(accumulator);

// Process a single request (used by both JSON and reconstructed delta flows)
const processRequest = (request: unknown) => {
if (request == null || typeof request !== 'object') { return; }
const req = request as ProcessableRequest;

const rawRequestModel = req.modelId ?? req.selectedModel?.identifier ?? req.model;
const requestModel = normalizeModelId(rawRequestModel, defaultModel);

let model: string;
if (typeof rawRequestModel === 'string' && rawRequestModel.trim()) {
model = requestModel;
} else {
const callbackModelRaw = getModelFromRequest ? getModelFromRequest(req) : undefined;
const callbackModel = normalizeModelId(callbackModelRaw, '');
model = callbackModel || requestModel;
}

// Input parts
if (req.message?.parts) {
for (const part of req.message.parts) {
if (typeof part?.text === 'string' && part.text) { addInput(model, part.text); }
}
} else if (typeof req.message?.text === 'string') {
addInput(model, req.message.text);
}

// Extract output and thinking text via extractResponseAndThinkingText, which handles
// both plain .value and delta-format content.value shapes.
const { responseText, thinkingText } = extractResponseAndThinkingText(req.response);
if (responseText) { addOutput(model, responseText); }
if (thinkingText) { totalThinkingTokens += estimateTokensFromText(thinkingText, model); }

// Loop only for sub-agents and message.parts — skip .value and thinking items
// because extractResponseAndThinkingText already counted them above.
const responseItems: ResponseItem[] = Array.isArray(req.response) ? req.response : (Array.isArray(req.responses) ? req.responses : []);
for (const responseItem of responseItems) {
const subAgent = extractSubAgentData(responseItem);
if (subAgent) {
const saModel = subAgent.modelName || model;
if (subAgent.prompt) { addInput(saModel, subAgent.prompt); }
if (subAgent.result) { addOutput(saModel, subAgent.result); }
continue;
}
// .value (including thinking) already handled — skip to avoid double-counting
if (responseItem?.kind === 'thinking') { continue; }
if (typeof responseItem?.value === 'string') { continue; }

// message.parts is not covered by extractResponseAndThinkingText
if (responseItem?.message?.parts) {
for (const p of responseItem.message.parts) {
if (typeof p?.text === 'string' && p.text) { addOutput(model, p.text); }
}
}
}

// Actual token counts if present
if (req.result?.usage) {
const u = req.result.usage;
const prompt = typeof u.promptTokens === 'number' ? u.promptTokens : 0;
const completion = typeof u.completionTokens === 'number' ? u.completionTokens : 0;
totalActualTokens += prompt + completion;
} else if (typeof req.result?.promptTokens === 'number' && typeof req.result?.outputTokens === 'number') {
totalActualTokens += req.result.promptTokens + req.result.outputTokens;
} else if (req.result?.metadata && typeof req.result.metadata.promptTokens === 'number' && typeof req.result.metadata.outputTokens === 'number') {
totalActualTokens += req.result.metadata.promptTokens + req.result.metadata.outputTokens;
}
};

// Handle delta-based JSONL format (VS Code Insiders)
if (sessionFilePath.endsWith('.jsonl')) {
const lines = fileContent.split(/\r?\n/).filter(l => l.trim());
let isDeltaBased = false;
if (lines.length > 0) {
const first = safeJsonParse<{ kind?: number }>(lines[0], 'sessionParser');
if (first && typeof first.kind === 'number') { isDeltaBased = true; }
}

if (isDeltaBased) {
let sessionState: unknown = Object.create(null);
for (const line of lines) {
const delta = safeJsonParse<unknown>(line, 'sessionParser');
if (delta !== undefined) { sessionState = applyDelta(sessionState, delta); }
}

const sessionStateObj = isObject(sessionState) ? sessionState : null;
const requests: unknown[] = sessionStateObj && Array.isArray(sessionStateObj['requests']) ? (sessionStateObj['requests'] as unknown[]) : [];
// Count only requests that look like user interactions
interactions = requests.filter((r) => {
if (!isObject(r)) { return false; }
const msg = r['message'];
return isObject(msg) && typeof msg['text'] === 'string' && (msg['text'] as string).trim();
}).length;
for (const r of requests) { processRequest(r); }
return {
tokens: accumulator.totalInputTokens + accumulator.totalOutputTokens + totalThinkingTokens,
interactions,
modelUsage,
thinkingTokens: totalThinkingTokens,
actualTokens: 0,
};
}

// Fallback: sometimes .jsonl contains a single JSON object
sessionJson = safeJsonParse<unknown>(fileContent.trim(), 'sessionParser');
if (sessionJson === undefined) { return { tokens: 0, interactions: 0, modelUsage: {}, thinkingTokens: 0, actualTokens: 0 }; }
}

// Non-jsonl (JSON file) - try to parse full JSON
if (!sessionJson) {
sessionJson = safeJsonParse<unknown>(fileContent, 'sessionParser');
if (sessionJson === undefined) { return { tokens: 0, interactions: 0, modelUsage: {}, thinkingTokens: 0, actualTokens: 0 }; }
}

if (!isObject(sessionJson) || Array.isArray(sessionJson)) {
return { tokens: 0, interactions: 0, modelUsage: {}, thinkingTokens: 0, actualTokens: 0 };
}

const requests: unknown[] = Array.isArray(sessionJson['requests']) ? (sessionJson['requests'] as unknown[]) : (Array.isArray(sessionJson['history']) ? (sessionJson['history'] as unknown[]) : []);
interactions = requests.length;
for (const request of requests) { processRequest(request); }

return {
tokens: accumulator.totalInputTokens + accumulator.totalOutputTokens + totalThinkingTokens,
interactions,
modelUsage,
thinkingTokens: totalThinkingTokens,
actualTokens: totalActualTokens,
};
}

export default { parseSessionFileContent };
