/**
 * Mistral Vibe data access layer.
 * Handles reading session data from Mistral Vibe's JSON/JSONL session directories.
 *
 * Mistral Vibe (https://github.com/mistralai/mistral-vibe) is a terminal-based coding agent;
 * the same agent also runs as the local Vibe Desktop app, which writes unified-store sessions
 * with `runtime_path: "session_api"` in meta.json (labelled "Mistral Vibe Desktop" in the UI).
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
	state?: { outputText?: unknown; output?: unknown; error?: unknown };
}

/** One op in a projection_delta journal record of a unified-store session. */
interface VibeUnifiedDeltaOp {
	op?: string;
	entry?: VibeUnifiedEntry;
	state?: { session?: { contextUsage?: unknown } };
}

/** A `core_input` record's command (user_message carries the turn text in content[] parts). */
interface VibeUnifiedCoreCommand {
	type?: string;
	content?: unknown;
	mode?: string;
	turn_id?: string;
}

/** One parsed line of a unified-store journal segment. */
interface VibeUnifiedJournalRecord {
	type?: string;
	payload?: {
		delta?: VibeUnifiedDeltaOp[];
		client_command_id?: unknown;
		params?: { injected?: unknown };
		input?: {
			input_id?: unknown;
			command?: VibeUnifiedCoreCommand;
			determinism?: { time_unix_ms?: unknown };
		};
	};
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
 * chunks/*.json merged with journal projection_delta ops (append_entry / replace_entry)
 * and core_input user-message records, deduplicated by entry id and ordered by createdAt.
 * Entry types: message (user/assistant), reasoning, effect (tool calls).
 *
 * User turns deserve a note: in a live session they are journaled as `core_input`
 * `user_message` records and only become projection entries at checkpoint time (chunks),
 * so they are synthesized from `core_input` here. The checkpointed entry carries the same
 * id (`_meta.vibe_client_message_id`), which is what deduplicates the two.
 */
private async readUnifiedEntries(sessionDir: string): Promise<VibeUnifiedEntry[]> {
const byId = new Map<string, VibeUnifiedEntry>();
await this.collectChunkEntries(sessionDir, byId);
await this.collectJournalEntries(sessionDir, byId);
const entries = [...byId.values()];
entries.sort((a, b) => (nonNegativeNumber(a.createdAt) ?? 0) - (nonNegativeNumber(b.createdAt) ?? 0));
return entries;
}

/** A plausible projection entry: object with a string type and a string id. */
private isEntry(e: unknown): e is VibeUnifiedEntry {
return !!e && typeof e === 'object' && typeof (e as VibeUnifiedEntry).type === 'string' && typeof (e as VibeUnifiedEntry).id === 'string';
}

/** Checkpointed projection entries from chunks/*.json (each chunk is an array of entries). */
private async collectChunkEntries(sessionDir: string, byId: Map<string, VibeUnifiedEntry>): Promise<void> {
try {
for (const file of await fs.promises.readdir(path.join(sessionDir, 'chunks'))) {
if (!file.endsWith('.json')) { continue; }
try {
const chunk = JSON.parse(await fs.promises.readFile(path.join(sessionDir, 'chunks', file), 'utf8'));
const list = Array.isArray(chunk) ? chunk : [chunk];
for (const e of list) {
if (this.isEntry(e) && !byId.has(e.id)) { byId.set(e.id, e); }
}
} catch { /* skip malformed chunk */ }
}
} catch { /* no chunks directory */ }
}

/** The client message id a user_message command's content parts carry in `_meta`. */
private clientMessageId(content: unknown): string | undefined {
if (!Array.isArray(content)) { return undefined; }
for (const part of content) {
const id = (part as { _meta?: { vibe_client_message_id?: unknown } } | null)?._meta?.vibe_client_message_id;
if (typeof id === 'string' && id && !isUnsafeObjectKey(id)) { return id; }
}
return undefined;
}

/**
 * Synthesize the projection entry a `core_input` user_message record represents: a user
 * message whose id is the client message id, so a later checkpointed chunk entry with the
 * same id deduplicates it. Injected (steered/queued) turns are flagged by a matching
 * `command_reserved` record and get a non-turn_start source, which marks them injected
 * downstream.
 */
/** Fallback entry id for a core_input record whose content parts carry no client message id. */
private inputFallbackId(inputId: unknown): string | undefined {
return typeof inputId === 'number' || typeof inputId === 'string' ? `input-${String(inputId)}` : undefined;
}

private coreInputUserEntry(rec: VibeUnifiedJournalRecord, injectedByClientId: Map<string, boolean>): VibeUnifiedEntry | undefined {
const input = rec.payload?.input;
const command = input?.command;
if (command?.type !== 'user_message') { return undefined; }
const clientId = this.clientMessageId(command.content);
const id = clientId ?? this.inputFallbackId(input?.input_id);
if (!id) { return undefined; }
const injected = clientId !== undefined && injectedByClientId.get(clientId) === true;
return {
id,
type: 'message',
role: 'user',
source: injected ? 'steer' : 'turn_start',
createdAt: nonNegativeNumber(input?.determinism?.time_unix_ms),
content: command.content,
};
}

/** Apply one projection_delta op: append_entry adds when absent, replace_entry overwrites. */
private applyDeltaOp(op: VibeUnifiedDeltaOp, byId: Map<string, VibeUnifiedEntry>): void {
if (!this.isEntry(op?.entry)) { return; }
if (op.op === 'replace_entry' || (op.op === 'append_entry' && !byId.has(op.entry.id))) {
byId.set(op.entry.id, op.entry);
}
}

/** Remember which client commands a command_reserved record marked as injected. */
private noteReservedInjection(rec: VibeUnifiedJournalRecord, injectedByClientId: Map<string, boolean>): void {
const clientId = rec.payload?.client_command_id;
if (typeof clientId === 'string' && clientId && !isUnsafeObjectKey(clientId) && rec.payload?.params?.injected === true) {
injectedByClientId.set(clientId, true);
}
}

/** Apply one journal record to the entry map. */
private applyJournalRecord(rec: VibeUnifiedJournalRecord, byId: Map<string, VibeUnifiedEntry>, injectedByClientId: Map<string, boolean>): void {
if (rec?.type === 'projection_delta' && Array.isArray(rec.payload?.delta)) {
for (const op of rec.payload.delta) { this.applyDeltaOp(op, byId); }
} else if (rec?.type === 'command_reserved') {
this.noteReservedInjection(rec, injectedByClientId);
} else if (rec?.type === 'core_input') {
const entry = this.coreInputUserEntry(rec, injectedByClientId);
if (entry && !byId.has(entry.id)) { byId.set(entry.id, entry); }
}
}

/**
 * Apply journal records across all segments in sequence: projection_delta ops
 * (append_entry adds when absent, replace_entry overwrites — effects settle through
 * replace), command_reserved records (remember which client commands were injected),
 * and core_input user_message records (live user turns).
 */
private async collectJournalEntries(sessionDir: string, byId: Map<string, VibeUnifiedEntry>): Promise<void> {
const journalDir = path.join(sessionDir, 'journal');
const injectedByClientId = new Map<string, boolean>();
for (const file of await this.journalFiles(journalDir)) {
let content: string;
try { content = await fs.promises.readFile(path.join(journalDir, file), 'utf8'); } catch { continue; }
for (const line of content.split('\n')) {
const trimmed = line.trim();
if (!trimmed) { continue; }
let rec: VibeUnifiedJournalRecord;
try { rec = JSON.parse(trimmed); } catch { continue; }
this.applyJournalRecord(rec, byId, injectedByClientId);
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
messages.push({ role: 'tool', content: this.effectOutputText(e) });
}

/**
 * The settled text of a tool-effect entry. The unified store writes it as
 * `state.outputText`, but desktop (session_api) sessions carry the real result in
 * `state.output` (an MCP-style `{content: [{text}], structured_content, error}` object)
 * once the effect settles via replace_entry — read content-part text first, then
 * structured_content (stdout/stderr, else JSON), then error, then the display fallback.
 */
/** Render an effect's `state.output.structured_content`: stdout/stderr, else JSON. */
private structuredOutputText(structured: unknown): string | undefined {
if (typeof structured === 'string' && structured) { return structured; }
if (!structured || typeof structured !== 'object') { return undefined; }
const scr = structured as Record<string, unknown>;
const stdout = typeof scr.stdout === 'string' ? scr.stdout : '';
const stderr = typeof scr.stderr === 'string' ? scr.stderr : '';
const joined = [stdout, stderr].filter(s => s).join('\n');
if (joined) { return joined; }
try { return JSON.stringify(structured); } catch { return undefined; }
}

/** Text of an effect's `state.output` object: content-part text, then structured_content, then error. */
private outputObjectText(output: unknown): string | undefined {
if (!output || typeof output !== 'object') { return undefined; }
const rec = output as Record<string, unknown>;
const text = this.entryText(rec.content) || this.structuredOutputText(rec.structured_content);
if (text) { return text; }
return typeof rec.error === 'string' && rec.error ? rec.error : undefined;
}

private effectOutputText(e: VibeUnifiedEntry): string | undefined {
const state = e.state;
if (typeof state?.outputText === 'string' && state.outputText) { return state.outputText; }
const fromOutput = this.outputObjectText(state?.output);
if (fromOutput) { return fromOutput; }
if (typeof state?.error === 'string' && state.error) { return state.error; }
const display = e.detail?.display?.settledMessage;
return typeof display === 'string' && display ? display : undefined;
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
 * The writer of a session, from meta.json `runtime_path`: "session_api" for sessions
 * written by the Vibe desktop app's session API, absent for the CLI. Undefined when the
 * field is missing or unreadable.
 */
async getRuntimePath(metaJsonPath: string): Promise<string | undefined> {
const meta = await this.readSessionMeta(metaJsonPath);
const runtimePath = meta?.runtime_path;
return typeof runtimePath === 'string' && runtimePath && !isUnsafeObjectKey(runtimePath) ? runtimePath : undefined;
}

/** Whether the session was written by the Vibe desktop app (runtime_path "session_api"). */
async isDesktopSession(metaJsonPath: string): Promise<boolean> {
return (await this.getRuntimePath(metaJsonPath)) === 'session_api';
}

/**
 * Get session metadata: title, timestamps, model, workspace directory.
 * Timestamps are ISO 8601 strings in meta.json (no epoch conversion needed).
 * `workspacePath` is `environment.working_directory`, present in both layouts.
 */
async getSessionMeta(metaJsonPath: string): Promise<{
title: string | undefined;
firstInteraction: string | null;
lastInteraction: string | null;
model: string | undefined;
workspacePath: string | undefined;
}> {
const meta = await this.readSessionMeta(metaJsonPath);
if (!meta) {
return { title: undefined, firstInteraction: null, lastInteraction: null, model: undefined, workspacePath: undefined };
}
const workingDirectory = meta.environment?.working_directory;
return {
title: meta.title || undefined,
firstInteraction: meta.start_time || null,
lastInteraction: meta.end_time || null,
model: meta.config?.active_model || undefined,
workspacePath: typeof workingDirectory === 'string' && workingDirectory ? workingDirectory : undefined,
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
