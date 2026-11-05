/**
 * Mistral Vibe data access layer.
 * Handles reading session data from Mistral Vibe's JSON/JSONL session directories.
 *
 * Mistral Vibe (https://github.com/mistralai/mistral-vibe) is a terminal-based coding agent.
 * Sessions are stored as individual directories under ~/.vibe/logs/session/
 *
 * Two on-disk layouts are supported:
 *
 * 1. Legacy layout — one directory per session directly under logs/session/:
 *      session_<YYYYMMDD>_<HHMMSS>_<session_id[:8]>/
 *    containing:
 *      - meta.json: session metadata including stats (token counts, of which session_cached_tokens is
 *        the cache-read portion already counted inside session_prompt_tokens), config (active_model),
 *        timestamps
 *      - messages.jsonl: one JSON object per line (LLMMessage objects)
 *
 * 2. Unified session store (store_format "mistral.vibe.unified-session-store/v1") — one directory
 *    per session under logs/session/unified/<session_uuid>/ containing:
 *      - meta.json: same identity fields (start_time/end_time/title/config.active_model) but NO
 *        stats block and NO messages.jsonl
 *      - CURRENT: pointer to the active generation
 *      - journal/<sequence>.jsonl: append-only event journal; token usage lives in the
 *        `set_envelope` ops of projection_delta records (state.session.contextUsage, cumulative),
 *        and the conversation lives in `append_entry` ops of projection_delta records
 *      - chunks/*.json: checkpointed projection entries (arrays of the same entry objects)
 *      - generations/<n>/: manifests/checkpoints referencing the chunks
 *    A logs/session/unified/.session-index.json catalog also carries per-session
 *    session.contextUsage and metadata.active_model.
 *
 * Session path format: <log dir>/<session dir>/meta.json — the meta.json path is used as the
 * session file path throughout the pipeline for both layouts.
 *
 * Storage location:
 *   - Windows: %USERPROFILE%\.vibe\
 *   - Linux/macOS: ~/.vibe/
 *   Overridable via VIBE_HOME environment variable.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ModelUsage } from './types';
import { isUnsafeObjectKey } from './utils/protoGuard';
import { normalizePathForComparison } from './utils/pathUtils';

/**
 * Numeric session statistics from meta.json `stats`, beyond the token totals.
 * Every field is `undefined` when the key is absent or not a finite non-negative number
 * (an absent stat is never reported as 0). Numeric only: nothing from system_prompt,
 * title or messages.jsonl.
 */
export interface VibeSessionStats {
	/** Vendor-reported generation speed (`stats.tokens_per_second`). */
	tokensPerSecond?: number;
	/** Duration of the last turn in ms (`stats.last_turn_duration` is in seconds). */
	lastTurnDurationMs?: number;
	/** Vendor-reported session cost in dollars (`stats.session_cost`). Cross-check only; cost stays on calculateEstimatedCost. */
	sessionCostReported?: number;
	steps?: number;
	toolCallsSucceeded?: number;
	toolCallsFailed?: number;
	toolCallsRejected?: number;
	toolCallsAgreed?: number;
	toolCallsHookDenied?: number;
}

/** A finite, non-negative number, otherwise undefined. */
function nonNegativeNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) && value >= 0 ? value : undefined;
}

/** Cumulative token usage as recorded in a unified store's `contextUsage`. */
interface VibeUnifiedContextUsage {
	inputTokens?: number;
	outputTokens?: number;
	cachedInputTokens?: number;
	totalTokens?: number;
}

/** One projection entry (message / reasoning / effect) in a unified-store session. */
interface VibeUnifiedEntry {
	id: string;
	type: string;
	role?: string;
	source?: string;
	createdAt?: unknown;
	content?: unknown;
	detail?: { kind?: unknown; toolName?: unknown; input?: unknown; display?: { settledMessage?: unknown } };
	state?: { outputText?: unknown };
}

/** One op in a projection_delta journal record of a unified-store session. */
interface VibeUnifiedDeltaOp {
	op?: string;
	entry?: VibeUnifiedEntry;
	state?: { session?: { contextUsage?: unknown } };
}

/** One parsed line of a unified-store journal segment. */
interface VibeUnifiedJournalRecord {
	type?: string;
	payload?: { delta?: VibeUnifiedDeltaOp[] };
}

/** A synthesized message in the legacy messages.jsonl shape the adapter consumes. */
interface VibeUnifiedMessage {
	role: string;
	content?: string;
	injected?: boolean;
	tool_calls?: { id?: string; function: { name: string; arguments?: string } }[];
}

export class MistralVibeDataAccess {

/**
 * Get the Mistral Vibe home directory.
 * Respects the VIBE_HOME environment variable; defaults to ~/.vibe/
 */
getVibeHomeDir(): string {
const vibeHome = process.env.VIBE_HOME;
if (vibeHome) {
return path.resolve(vibeHome.replace(/^~/, os.homedir()));
}
return path.join(os.homedir(), '.vibe');
}

/**
 * Get the session log directory where sessions are stored.
 * Path: <VIBE_HOME>/logs/session/
 */
getSessionLogDir(): string {
return path.join(this.getVibeHomeDir(), 'logs', 'session');
}

/**
 * Get the unified session store directory (newer Vibe layout).
 * Path: <VIBE_HOME>/logs/session/unified/
 */
getUnifiedSessionLogDir(): string {
return path.join(this.getSessionLogDir(), 'unified');
}

/**
 * Check if a file path belongs to a Mistral Vibe session.
 * Session files are meta.json files under <VIBE_HOME>/logs/session/ — the default
 * ~/.vibe/ or a $VIBE_HOME whose folder name differs.
 */
isVibeSessionFile(filePath: string): boolean {
const normalized = normalizePathForComparison(filePath);
if (!normalized.endsWith('/meta.json')) { return false; }
if (normalized.includes('/.vibe/logs/session/')) { return true; }
return normalized.startsWith(normalizePathForComparison(this.getSessionLogDir()) + '/');
}

/**
 * Get the session directory from a meta.json session file path.
 */
getSessionDir(metaJsonPath: string): string {
return path.dirname(metaJsonPath);
}

/**
 * Discover all Mistral Vibe sessions by scanning the session log directory.
 * Covers both layouts: legacy session_* directories directly under logs/session/ and
 * unified-store <uuid> directories under logs/session/unified/.
 * Returns an array of meta.json paths, one per session.
 */
async discoverSessions(): Promise<string[]> {
const sessions: string[] = [];
const collect = async (dir: string): Promise<void> => {
try {
const entries = await fs.promises.readdir(dir, { withFileTypes: true });
for (const entry of entries) {
if (!entry.isDirectory()) { continue; }
const metaPath = path.join(dir, entry.name, 'meta.json');
try {
await fs.promises.access(metaPath);
sessions.push(metaPath);
} catch {
// meta.json missing — skip
}
}
} catch {
// directory missing — nothing to collect
}
};
await collect(this.getSessionLogDir());
await collect(this.getUnifiedSessionLogDir());
return sessions;
}

/**
 * Whether a session directory uses the unified session store layout (a journal/ subdirectory
 * next to meta.json), as opposed to the legacy messages.jsonl layout.
 */
private async isUnifiedSession(sessionDir: string): Promise<boolean> {
try {
return (await fs.promises.stat(path.join(sessionDir, 'journal'))).isDirectory();
} catch {
return false;
}
}

/** Normalized cumulative token usage from a unified store contextUsage object. */
private normalizeContextUsage(c: unknown): VibeUnifiedContextUsage | undefined {
if (!c || typeof c !== 'object') { return undefined; }
const rec = c as Record<string, unknown>;
const out: VibeUnifiedContextUsage = {
inputTokens: nonNegativeNumber(rec.inputTokens),
outputTokens: nonNegativeNumber(rec.outputTokens),
cachedInputTokens: nonNegativeNumber(rec.cachedInputTokens),
totalTokens: nonNegativeNumber(rec.totalTokens),
};
return Object.values(out).some(v => v !== undefined) ? out : undefined;
}

/** Latest non-null set_envelope contextUsage in one parsed journal record, if any. */
private contextUsageFromRecord(line: string): VibeUnifiedContextUsage | undefined {
let rec: VibeUnifiedJournalRecord;
try { rec = JSON.parse(line); } catch { return undefined; }
if (rec?.type !== 'projection_delta' || !Array.isArray(rec.payload?.delta)) { return undefined; }
const ops = rec.payload.delta;
for (let j = ops.length - 1; j >= 0; j--) {
const op = ops[j];
if (op?.op === 'set_envelope') {
const usage = this.normalizeContextUsage(op?.state?.session?.contextUsage);
if (usage) { return usage; }
}
}
return undefined;
}

/** Sorted journal segment file names of a unified-store session (empty when absent). */
private async journalFiles(journalDir: string): Promise<string[]> {
try {
	return (await fs.promises.readdir(journalDir)).filter(f => f.endsWith('.jsonl')).sort();
} catch {
return [];
}
}

/**
 * Read the cumulative session token usage of a unified-store session. Scans the journal
 * segments newest-first for the latest non-null `set_envelope` contextUsage (so a running
 * session reports its live totals), falling back to the unified .session-index.json catalog.
 */
private async readUnifiedContextUsage(sessionDir: string): Promise<VibeUnifiedContextUsage | undefined> {
const files = (await this.journalFiles(path.join(sessionDir, 'journal'))).reverse();
for (const file of files) {
let content: string;
try { content = await fs.promises.readFile(path.join(sessionDir, 'journal', file), 'utf8'); } catch { continue; }
const lines = content.split('\n');
for (let i = lines.length - 1; i >= 0; i--) {
const usage = this.contextUsageFromRecord(lines[i].trim());
if (usage) { return usage; }
}
}
return this.readIndexContextUsage(sessionDir);
}

/** contextUsage from the unified .session-index.json catalog entry for this session. */
private async readIndexContextUsage(sessionDir: string): Promise<VibeUnifiedContextUsage | undefined> {
try {
const indexPath = path.join(this.getUnifiedSessionLogDir(), '.session-index.json');
const index = JSON.parse(await fs.promises.readFile(indexPath, 'utf8'));
const sessionId = path.basename(sessionDir);
for (const entry of Array.isArray(index?.entries) ? index.entries : []) {
if (entry?.identity?.session_id === sessionId) {
const usage = this.normalizeContextUsage(entry?.session?.contextUsage);
if (usage) { return usage; }
}
}
} catch {
// no readable index — no usage
}
return undefined;
}

/**
 * Read all projection entries of a unified-store session: checkpointed entries from
 * chunks/*.json merged with journal append_entry ops, deduplicated by entry id and ordered
 * by createdAt. Entry types: message (user/assistant), reasoning, effect (tool calls).
 */
private async readUnifiedEntries(sessionDir: string): Promise<VibeUnifiedEntry[]> {
const entries: VibeUnifiedEntry[] = [];
const seen = new Set<string>();
const addEntry = (e: unknown): void => {
const candidate = e as VibeUnifiedEntry;
if (candidate && typeof candidate === 'object' && typeof candidate.type === 'string' && typeof candidate.id === 'string' && !seen.has(candidate.id)) {
seen.add(candidate.id);
entries.push(candidate);
}
};
await this.collectChunkEntries(sessionDir, addEntry);
await this.collectJournalEntries(sessionDir, addEntry);
entries.sort((a, b) => (nonNegativeNumber(a.createdAt) ?? 0) - (nonNegativeNumber(b.createdAt) ?? 0));
return entries;
}

/** Checkpointed projection entries from chunks/*.json (each chunk is an array of entries). */
private async collectChunkEntries(sessionDir: string, addEntry: (e: unknown) => void): Promise<void> {
try {
for (const file of await fs.promises.readdir(path.join(sessionDir, 'chunks'))) {
if (!file.endsWith('.json')) { continue; }
try {
const chunk = JSON.parse(await fs.promises.readFile(path.join(sessionDir, 'chunks', file), 'utf8'));
if (Array.isArray(chunk)) { chunk.forEach(addEntry); } else { addEntry(chunk); }
} catch { /* skip malformed chunk */ }
}
} catch { /* no chunks directory */ }
}

/** append_entry projection entries in one parsed journal line, if it is a projection_delta. */
private journalEntriesFromLine(line: string, addEntry: (e: unknown) => void): void {
let rec: VibeUnifiedJournalRecord;
try { rec = JSON.parse(line); } catch { return; }
if (rec?.type !== 'projection_delta' || !Array.isArray(rec.payload?.delta)) { return; }
for (const op of rec.payload.delta) {
if (op?.op === 'append_entry' && op.entry) { addEntry(op.entry); }
}
}

/** Live projection entries from journal append_entry ops across all segments. */
private async collectJournalEntries(sessionDir: string, addEntry: (e: unknown) => void): Promise<void> {
const journalDir = path.join(sessionDir, 'journal');
for (const file of await this.journalFiles(journalDir)) {
let content: string;
try { content = await fs.promises.readFile(path.join(journalDir, file), 'utf8'); } catch { continue; }
for (const line of content.split('\n')) {
const trimmed = line.trim();
if (trimmed) { this.journalEntriesFromLine(trimmed, addEntry); }
}
}
}

/** Text content of a unified-store message entry: its content[] parts' text joined. */
private entryText(content: unknown): string {
if (!Array.isArray(content)) { return typeof content === 'string' ? content : ''; }
return content
.filter((p): p is { text: string } => !!p && typeof p === 'object' && typeof (p as { text?: unknown }).text === 'string')
.map(p => p.text)
.join('\n');
}

/** Append a tool-effect entry to the synthesized message list (tool call + tool result). */
private appendToolEffect(messages: VibeUnifiedMessage[], e: VibeUnifiedEntry): void {
let last = messages[messages.length - 1];
if (!last || last.role !== 'assistant') {
last = { role: 'assistant', content: '', tool_calls: [] };
messages.push(last);
}
const toolName = typeof e.detail?.toolName === 'string' ? e.detail.toolName : 'tool';
last.tool_calls!.push({
id: e.id,
function: {
name: toolName,
arguments: e.detail?.input !== undefined ? JSON.stringify(e.detail.input) : undefined,
},
});
const out = e.state?.outputText ?? e.detail?.display?.settledMessage;
messages.push({ role: 'tool', content: typeof out === 'string' ? out : undefined });
}

/**
 * Convert unified-store projection entries into the legacy messages.jsonl shape the adapter
 * consumes: user/assistant messages with string content, tool calls on the assistant message
 * (tool_calls[]), and a following { role: 'tool' } message carrying the output text.
 */
private synthesizeMessagesFromEntries(entries: VibeUnifiedEntry[]): VibeUnifiedMessage[] {
const messages: VibeUnifiedMessage[] = [];
for (const e of entries) {
if (e.type === 'message' && (e.role === 'user' || e.role === 'assistant')) {
const text = this.entryText(e.content);
if (e.role === 'user') {
// Only genuine turn-start prompts count as interactions; steered/queued inputs are injected.
messages.push({ role: 'user', content: text, ...(e.source && e.source !== 'turn_start' ? { injected: true } : {}) });
} else {
messages.push({ role: 'assistant', content: text, tool_calls: [] });
}
} else if (e.type === 'effect' && e.detail?.kind === 'tool') {
this.appendToolEffect(messages, e);
}
}
return messages;
}

/**
 * Read session metadata from meta.json.
 * Returns the parsed object or null on failure.
 */
async readSessionMeta(metaJsonPath: string): Promise<any | null> {
try {
const content = await fs.promises.readFile(metaJsonPath, 'utf8');
return JSON.parse(content);
} catch {
return null;
}
}

/**
 * Read all messages for a session: messages.jsonl for legacy sessions, or the journal/chunk
 * projection entries (synthesized into the same shape) for unified-store sessions.
 * Returns an array of parsed message objects.
 */
async readSessionMessages(metaJsonPath: string): Promise<any[]> {
const sessionDir = this.getSessionDir(metaJsonPath);
if (await this.isUnifiedSession(sessionDir)) {
return this.synthesizeMessagesFromEntries(await this.readUnifiedEntries(sessionDir));
}
const messagesPath = path.join(sessionDir, 'messages.jsonl');
try {
const content = await fs.promises.readFile(messagesPath, 'utf8');
const lines = content.trim().split('\n');
const messages: any[] = [];
for (const line of lines) {
if (!line.trim()) { continue; }
try {
messages.push(JSON.parse(line));
} catch {
// Skip malformed lines
}
}
return messages;
} catch {
return [];
}
}

/**
 * Get actual token counts from a session's meta.json stats field (legacy layout) or, for
 * unified-store sessions whose meta.json has no stats, from the cumulative contextUsage in
 * the journal / session index.
 * Mistral Vibe stores session_prompt_tokens and session_completion_tokens in stats.
 */
async getTokensFromSession(metaJsonPath: string): Promise<{ tokens: number; thinkingTokens: number }> {
const meta = await this.readSessionMeta(metaJsonPath);
const { promptTokens, completionTokens } = await this.sessionTokenTotals(meta, metaJsonPath);
return { tokens: promptTokens + completionTokens, thinkingTokens: 0 };
}

/**
 * Count user interactions (number of non-injected user-role messages) in a session.
 */
async countInteractions(metaJsonPath: string): Promise<number> {
const messages = await this.readSessionMessages(metaJsonPath);
return messages.filter(m => m.role === 'user' && m.injected !== true).length;
}

/**
 * Get per-model token usage for a session.
 * Mistral Vibe stores only session-level totals in meta.json.
 * The model is from config.active_model (single model per session).
 * We attribute all tokens to that model.
 */
/** Token totals of a session, from meta.json stats (legacy) or the unified journal/index. */
private async sessionTokenTotals(meta: { stats?: unknown } | null, metaJsonPath: string): Promise<{ promptTokens: number; completionTokens: number; cachedTokens: number }> {
if (meta?.stats && typeof meta.stats === 'object') {
	const stats = meta.stats as Record<string, unknown>;
	return {
		promptTokens: typeof stats.session_prompt_tokens === 'number' ? stats.session_prompt_tokens : 0,
		completionTokens: typeof stats.session_completion_tokens === 'number' ? stats.session_completion_tokens : 0,
		cachedTokens: typeof stats.session_cached_tokens === 'number' ? stats.session_cached_tokens : 0,
	};
}
// Unified-store meta.json carries no stats block; token usage comes from the journal/index.
const usage = await this.readUnifiedContextUsage(this.getSessionDir(metaJsonPath));
return {
	promptTokens: usage?.inputTokens ?? 0,
	completionTokens: usage?.outputTokens ?? 0,
	cachedTokens: usage?.cachedInputTokens ?? 0,
};
}

async getModelUsage(metaJsonPath: string): Promise<ModelUsage> {
const meta = await this.readSessionMeta(metaJsonPath);
if (!meta) {
return {};
}
const { promptTokens, completionTokens, cachedTokens } = await this.sessionTokenTotals(meta, metaJsonPath);
if (promptTokens + completionTokens === 0) {
return {};
}
// `session_cached_tokens` (legacy) / `cachedInputTokens` (unified) is the cache-read portion
// *already included* in session_prompt_tokens / inputTokens, so it maps to cachedReadTokens
// (which calculateEstimatedCost subtracts from inputTokens) rather than being added on top.
// Reporting it matters: Vibe discounts these heavily (0.15 vs 1.5 per million on Mistral
// Medium 3.5), so omitting it overstated cost by up to ~5x on cache-heavy sessions. Verified
// against Vibe's own `session_cost` — `(prompt - cached) * input + cached * cachedInput +
// completion * output` reproduces it exactly, and matches calculateEstimatedCost's formula.
// Models whose rates report no cached price (devstral-2, glm-5-2) have no
// cachedInputCostPerMillion entry, so the calculation falls back to the full input rate —
// which is what Vibe bills them at.
// Untrusted `active_model` string from parsed meta.json — treat unsafe object keys
// like a missing model (see protoGuard.ts).
const rawModel = meta.config?.active_model;
const model: string = rawModel && !isUnsafeObjectKey(rawModel) ? rawModel : 'devstral';
return {
[model]: {
inputTokens: promptTokens,
outputTokens: completionTokens,
// Clamp: a malformed meta.json reporting more cached than prompt tokens would otherwise
// drive uncachedInput negative (Math.max(0, …) in calculateEstimatedCost already floors
// it, but clamping here keeps the reported breakdown internally consistent too).
...(cachedTokens > 0 ? { cachedReadTokens: Math.max(0, Math.min(cachedTokens, promptTokens)) } : {}),
sessions: 0,
}
};
}

/**
 * Read the extra numeric stats (speed, cost, steps, tool-call outcomes) from meta.json.
 * Absent or malformed values are `undefined`, never 0. `last_turn_duration` is seconds in Vibe's
 * meta.json and is converted to milliseconds here.
 */
async getSessionStats(metaJsonPath: string): Promise<VibeSessionStats> {
const stats = (await this.readSessionMeta(metaJsonPath))?.stats;
if (!stats || typeof stats !== 'object') { return {}; }
const lastTurnSeconds = nonNegativeNumber(stats.last_turn_duration);
return {
tokensPerSecond: nonNegativeNumber(stats.tokens_per_second),
lastTurnDurationMs: lastTurnSeconds === undefined ? undefined : Math.round(lastTurnSeconds * 1000),
sessionCostReported: nonNegativeNumber(stats.session_cost),
steps: nonNegativeNumber(stats.steps),
toolCallsSucceeded: nonNegativeNumber(stats.tool_calls_succeeded),
toolCallsFailed: nonNegativeNumber(stats.tool_calls_failed),
toolCallsRejected: nonNegativeNumber(stats.tool_calls_rejected),
toolCallsAgreed: nonNegativeNumber(stats.tool_calls_agreed),
toolCallsHookDenied: nonNegativeNumber(stats.tool_calls_hook_denied),
};
}

/**
 * Get session metadata: title, timestamps, model.
 * Timestamps are ISO 8601 strings in meta.json (no epoch conversion needed).
 */
async getSessionMeta(metaJsonPath: string): Promise<{
title: string | undefined;
firstInteraction: string | null;
lastInteraction: string | null;
model: string | undefined;
}> {
const meta = await this.readSessionMeta(metaJsonPath);
if (!meta) {
return { title: undefined, firstInteraction: null, lastInteraction: null, model: undefined };
}
return {
title: meta.title || undefined,
firstInteraction: meta.start_time || null,
lastInteraction: meta.end_time || null,
model: meta.config?.active_model || undefined,
};
}

/**
 * Returns a unified session data object for backend sync.
 * Timestamp: derived from start_time (ISO 8601 string).
 * Token counts: actual values from stats in meta.json.
 * Model usage: attributed to config.active_model.
 * Interactions: count of non-injected user-role messages.
 */
async getSessionData(metaJsonPath: string): Promise<{
tokens: number;
interactions: number;
modelUsage: ModelUsage & { [key: string]: { inputTokens: number; outputTokens: number; interactions?: number } };
timestamp: number;
}> {
const meta = await this.readSessionMeta(metaJsonPath);
if (!meta) {
return { tokens: 0, interactions: 0, modelUsage: {}, timestamp: 0 };
}
const { tokens } = await this.getTokensFromSession(metaJsonPath);
const interactions = await this.countInteractions(metaJsonPath);
const baseModelUsage = await this.getModelUsage(metaJsonPath);
const modelUsage: any = {};
for (const [model, usage] of Object.entries(baseModelUsage)) {
modelUsage[model] = { ...usage, interactions };
}
const timestamp = meta.start_time ? new Date(meta.start_time).getTime() : 0;
return { tokens, interactions, modelUsage, timestamp };
}
}
