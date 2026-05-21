export interface ModelUsage {
    [model: string]: { inputTokens: number; outputTokens: number };
}

import { extractSubAgentData, extractResponseItemText } from './tokenEstimation';

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
return typeof value === 'object' && value !== null;
}

function isSafePathSegment(seg: string): boolean {
// Prevent prototype pollution and other surprising behavior.
if (typeof seg !== 'string') {
return false;
}
const forbidden = ['__proto__', 'prototype', 'constructor', 'hasOwnProperty'];
return !forbidden.includes(seg) && !seg.startsWith('__');
}

function isArrayIndexSegment(seg: string): boolean {
return /^\d+$/.test(seg);
}

function normalizeModelId(model: unknown, defaultModel: string): string {
if (typeof model !== 'string') {
return defaultModel;
}
const trimmed = model.trim();
if (!trimmed) {
return defaultModel;
}
return trimmed.startsWith('copilot/') ? trimmed.substring('copilot/'.length) : trimmed;
}

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
if (!isObject(delta)) {
return state;
}

const kind = delta['kind'];
const k = delta['k'];
const v = delta['v'];

if (kind === 0) {
// Initial state - full replacement
return v;
}

if (!Array.isArray(k) || k.length === 0) {
return state;
}

const path = k.map(String);
for (const seg of path) {
if (!isSafePathSegment(seg)) {
return state;
}
}

let root: JsonObject | unknown[] = isObject(state) ? state : Object.create(null);
let current: JsonObject | unknown[] = root;

const ensureChildContainer = (parent: JsonObject, key: string, nextSeg: string): JsonObject | unknown[] => {
const wantsArray = isArrayIndexSegment(nextSeg);
const existing = parent[key];
if (!isObject(existing)) {
const newNode: JsonObject | unknown[] = wantsArray ? [] : Object.create(null);
parent[key] = newNode;
return newNode;
}
return existing;
};

// Traverse to the parent of the target location
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

if (!isObject(current)) {
return root;
}
current = ensureChildContainer(current, seg, nextSeg);
}

const lastSeg = path[path.length - 1];
if (kind === 1) {
// Set value at key path
if (Array.isArray(current) && isArrayIndexSegment(lastSeg)) {
current[Number(lastSeg)] = v;
return root;
}
if (isObject(current)) {
// Use Object.defineProperty for safe assignment, preventing prototype pollution
Object.defineProperty(current, lastSeg, {
value: v,
writable: true,
enumerable: true,
configurable: true
});
}
return root;
}

if (kind === 2) {
// Append value(s) to array at key path
let target: unknown[] | undefined;
if (Array.isArray(current) && isArrayIndexSegment(lastSeg)) {
const idx = Number(lastSeg);
if (!Array.isArray(current[idx])) {
current[idx] = [];
}
target = current[idx] as unknown[];
} else if (isObject(current)) {
if (!Array.isArray(current[lastSeg])) {
// Use Object.defineProperty for safe assignment
Object.defineProperty(current, lastSeg, {
value: [],
writable: true,
enumerable: true,
configurable: true
});
}
target = current[lastSeg] as unknown[];
}

if (Array.isArray(target)) {
if (Array.isArray(v)) {
target.push(...v);
} else {
target.push(v);
}
}
return root;
}

return root;
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

export function parseSessionFileContent(
sessionFilePath: string,
fileContent: string,
estimateTokensFromText: (text: string, model?: string) => number,
getModelFromRequest?: (req: ProcessableRequest) => string
) {
// Aggregates and helpers are declared up front; the heavy lifting is delegated
const modelUsage: ModelUsage = {};
let interactions = 0;
let totalInputTokens = 0;
let totalOutputTokens = 0;
let totalThinkingTokens = 0;
let totalActualTokens = 0;

let sessionJson: unknown;
let defaultModel = 'unknown';

const ensureModel = (m?: string) => (typeof m === 'string' && m ? m : defaultModel);
const addInput = (model: string, text: string) => {
const m = ensureModel(model);
if (!modelUsage[m]) { modelUsage[m] = { inputTokens: 0, outputTokens: 0 }; }
const t = estimateTokensFromText(text, m);
modelUsage[m].inputTokens += t;
totalInputTokens += t;
};
const addOutput = (model: string, text: string) => {
const m = ensureModel(model);
if (!modelUsage[m]) { modelUsage[m] = { inputTokens: 0, outputTokens: 0 }; }
const t = estimateTokensFromText(text, m);
modelUsage[m].outputTokens += t;
totalOutputTokens += t;
};

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
try { const first = JSON.parse(lines[0]); if (first && typeof first.kind === 'number') { isDeltaBased = true; } } catch (err) { console.error('[sessionParser] Failed to parse first JSONL line to detect format:', err); }
}

if (isDeltaBased) {
let sessionState: unknown = Object.create(null);
for (const line of lines) {
try { const delta = JSON.parse(line); sessionState = applyDelta(sessionState, delta); } catch (err) { console.error('[sessionParser] Failed to parse or apply JSONL delta line:', err); }
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
tokens: totalInputTokens + totalOutputTokens + totalThinkingTokens,
interactions,
modelUsage,
thinkingTokens: totalThinkingTokens,
actualTokens: 0,
};
}

// Fallback: sometimes .jsonl contains a single JSON object
try { sessionJson = JSON.parse(fileContent.trim()); } catch (err) { console.error('[sessionParser] Failed to parse JSONL file as single JSON object:', err); return { tokens: 0, interactions: 0, modelUsage: {}, thinkingTokens: 0, actualTokens: 0 }; }
}

// Non-jsonl (JSON file) - try to parse full JSON
if (!sessionJson) {
try { sessionJson = JSON.parse(fileContent); } catch (err) { console.error('[sessionParser] Failed to parse session JSON file:', err); return { tokens: 0, interactions: 0, modelUsage: {}, thinkingTokens: 0, actualTokens: 0 }; }
}

if (!isObject(sessionJson) || Array.isArray(sessionJson)) {
return { tokens: 0, interactions: 0, modelUsage: {}, thinkingTokens: 0, actualTokens: 0 };
}

const requests: unknown[] = Array.isArray(sessionJson['requests']) ? (sessionJson['requests'] as unknown[]) : (Array.isArray(sessionJson['history']) ? (sessionJson['history'] as unknown[]) : []);
interactions = requests.length;
for (const request of requests) { processRequest(request); }

return {
tokens: totalInputTokens + totalOutputTokens + totalThinkingTokens,
interactions,
modelUsage,
thinkingTokens: totalThinkingTokens,
actualTokens: totalActualTokens,
};
}

export default { parseSessionFileContent };
