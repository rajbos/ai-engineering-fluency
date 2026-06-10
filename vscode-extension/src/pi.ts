/**
 * Pi CLI data access layer.
 * Handles reading session data from Pi's JSONL session files.
 *
 * Pi (https://pi.dev) is a terminal-based coding agent.
 * Sessions are stored as individual JSONL files under ~/.pi/agent/sessions/
 *
 * Directory structure:
 *   ~/.pi/agent/sessions/
 *     <encoded-cwd>/           <- One folder per working directory
 *       <ISO-timestamp>_<uuid>.jsonl   <- One file per session
 *
 * The <encoded-cwd> encodes the working directory:
 *   backslashes and colons are replaced with hyphens, wrapped in `--`:
 *   e.g. C:\Users\RobBos -> --C--Users-RobBos--
 *
 * JSONL format: one event per line. Event types: session, model_change,
 * thinking_level_change, message.
 *
 * Token usage is on assistant message events in:
 *   message.usage.{ input, output, cacheRead, cacheWrite, totalTokens }
 *
 * Storage location:
 *   Windows / macOS / Linux: ~/.pi/agent/sessions/
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { ModelUsage } from './types';
import { normalizePath } from './utils/pathUtils';

export class PiDataAccess {

/**
 * Get the Pi sessions directory.
 * Same path on all platforms: ~/.pi/agent/sessions/
 */
getConfigDir(): string {
return path.join(os.homedir(), '.pi', 'agent', 'sessions');
}

/**
 * Check if a file path belongs to a Pi session.
 * Pi sessions are .jsonl files under ~/.pi/agent/sessions/
 */
isPiSessionFile(filePath: string): boolean {
const normalized = normalizePath(filePath);
return normalized.includes('/.pi/agent/sessions/') && normalized.endsWith('.jsonl');
}

/**
 * Discover all Pi sessions by recursively scanning the sessions directory.
 * Returns absolute paths to all .jsonl files found.
 */
async discoverSessions(): Promise<string[]> {
const sessionsDir = this.getConfigDir();
const results: string[] = [];
try {
const cwdDirs = await fs.promises.readdir(sessionsDir, { withFileTypes: true });
for (const cwdDir of cwdDirs) {
if (!cwdDir.isDirectory()) { continue; }
await this.collectSessionFilesInDir(path.join(sessionsDir, cwdDir.name), results, 4);
}
} catch {
// Directory does not exist or is inaccessible
}
return results;
}

private async collectSessionFilesInDir(dirPath: string, results: string[], maxDepth: number): Promise<void> {
if (maxDepth <= 0) { return; }
try {
const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
for (const file of files) {
if (file.isFile() && file.name.endsWith('.jsonl')) {
results.push(path.join(dirPath, file.name));
} else if (file.isDirectory()) {
await this.collectSessionFilesInDir(path.join(dirPath, file.name), results, maxDepth - 1);
}
}
} catch {
// Skip inaccessible directories
}
}

/**
 * Read all lines from a JSONL file and return them as parsed objects.
 * Malformed lines are silently skipped.
 */
private async readLines(filePath: string): Promise<any[]> {
try {
const content = await fs.promises.readFile(filePath, 'utf8');
return this.parseJsonlContent(content);
} catch {
return [];
}
}

private parseJsonlContent(content: string): any[] {
const parsed: any[] = [];
for (const line of content.split('\n')) {
const trimmed = line.trim();
if (!trimmed) { continue; }
try {
parsed.push(JSON.parse(trimmed));
} catch {
// Skip malformed lines
}
}
return parsed;
}

/**
 * Read session metadata from the first line (session event).
 * Returns null if file is unreadable or no session event is found.
 */
async readSession(filePath: string): Promise<any | null> {
const lines = await this.readLines(filePath);
return lines.find(l => l.type === 'session') ?? null;
}

/**
 * Returns the file path of the parent session if this session was spawned
 * by a parent pi session (i.e. it has a `parentSession` field in its header).
 * Returns null for root sessions.
 */
async getParentSessionPath(filePath: string): Promise<string | null> {
const header = await this.readSession(filePath);
const parent = header?.parentSession;
return typeof parent === 'string' && parent.length > 0 ? parent : null;
}

/**
 * Derives the parent session file path from the child session's file path.
 *
 * Pi child sessions follow this directory layout:
 *   {sessionsDir}/{cwdDir}/{timestamp_parentId}/{childHash}/run-{N}/session.jsonl
 *
 * The parent's JSONL file is:
 *   {sessionsDir}/{cwdDir}/{timestamp_parentId}.jsonl
 *
 * Returns null if the file does not match the child-session naming pattern.
 */
getParentSessionPathFromFilePath(filePath: string): string | null {
// Child sessions are always named 'session.jsonl'; top-level sessions use timestamp names.
if (path.basename(filePath) !== 'session.jsonl') { return null; }
// Go up: run-N → childHash → timestamp_parentId → add .jsonl
const derivedParent = path.dirname(path.dirname(path.dirname(filePath))) + '.jsonl';
return this.isPiSessionFile(derivedParent) ? derivedParent : null;
}

/**
 * Read all message events from a Pi session file.
 * Returns the array of events with type === 'message'.
 */
async getMessages(filePath: string): Promise<any[]> {
const lines = await this.readLines(filePath);
return lines.filter(l => l.type === 'message');
}

/**
 * Get token counts for a Pi session.
 * Sums usage.totalTokens across all assistant messages.
 * thinkingTokens: 0 (thinking content exists but is not separately counted).
 */
async getTokens(filePath: string): Promise<{ tokens: number; thinkingTokens: number }> {
const messages = await this.getMessages(filePath);
let total = 0;
for (const event of messages) {
if (event.message?.role !== 'assistant') { continue; }
const usage = event.message?.usage;
if (usage && typeof usage.totalTokens === 'number') {
total += usage.totalTokens;
}
}
return { tokens: total, thinkingTokens: 0 };
}

/**
 * Count user interactions (number of user-role messages) in a session.
 */
async countInteractions(filePath: string): Promise<number> {
const messages = await this.getMessages(filePath);
return messages.filter(e => e.message?.role === 'user').length;
}

/**
 * Get per-model token usage for a Pi session.
 * For each assistant message with usage, accumulates input/output tokens keyed by model.
 */
async getModelUsage(filePath: string): Promise<ModelUsage> {
const messages = await this.getMessages(filePath);
const modelUsage: ModelUsage = {};
for (const event of messages) {
this.accumulateModelUsage(event, modelUsage);
}
return modelUsage;
}

private accumulateModelUsage(event: any, modelUsage: ModelUsage): void {
const msg = event.message;
if (!msg || msg.role !== 'assistant') { return; }
const usage = msg.usage;
if (!usage) { return; }
const inputTokens = typeof usage.input === 'number' ? usage.input : 0;
const outputTokens = typeof usage.output === 'number' ? usage.output : 0;
if (inputTokens + outputTokens === 0) { return; }
const model: string = msg.model || 'unknown';
if (!modelUsage[model]) { modelUsage[model] = { inputTokens: 0, outputTokens: 0 }; }
modelUsage[model].inputTokens += inputTokens;
modelUsage[model].outputTokens += outputTokens;
this.accumulateCacheTokens(usage, modelUsage[model]);
}

private accumulateCacheTokens(usage: any, entry: ModelUsage[string]): void {
const cacheRead = typeof usage.cacheRead === 'number' ? usage.cacheRead : 0;
const cacheWrite = typeof usage.cacheWrite === 'number' ? usage.cacheWrite : 0;
if (cacheRead > 0) { entry.cachedReadTokens = (entry.cachedReadTokens ?? 0) + cacheRead; }
if (cacheWrite > 0) { entry.cacheCreationTokens = (entry.cacheCreationTokens ?? 0) + cacheWrite; }
}

/**
 * Get session metadata: title, timestamps, cwd.
 * Title is derived from the basename of cwd or the session timestamp.
 * firstInteraction: ISO string from the session event's timestamp.
 * lastInteraction: ISO string from the last event's timestamp.
 */
async getSessionMeta(filePath: string): Promise<{
title: string | undefined;
firstInteraction: string | null;
lastInteraction: string | null;
workspacePath?: string;
}> {
const lines = await this.readLines(filePath);
if (lines.length === 0) {
return { title: undefined, firstInteraction: null, lastInteraction: null };
}

const sessionEvent = lines.find(l => l.type === 'session');
const cwd: string | undefined = sessionEvent?.cwd;
const title = cwd ? path.basename(cwd) : undefined;
const firstInteraction: string | null = sessionEvent?.timestamp ?? null;
const lastInteraction = this.findLastTimestamp(lines);

return { title, firstInteraction, lastInteraction, workspacePath: cwd };
}

private findLastTimestamp(lines: any[]): string | null {
for (let i = lines.length - 1; i >= 0; i--) {
if (lines[i].timestamp) { return lines[i].timestamp as string; }
}
return null;
}

/**
 * Returns a unified session data object for backend sync.
 */
async getSessionData(filePath: string): Promise<{
tokens: number;
interactions: number;
modelUsage: ModelUsage & { [key: string]: { inputTokens: number; outputTokens: number; interactions?: number } };
timestamp: number;
}> {
const [{ tokens }, interactions, modelUsage, meta] = await Promise.all([
this.getTokens(filePath),
this.countInteractions(filePath),
this.getModelUsage(filePath),
this.getSessionMeta(filePath),
]);

const timestamp = meta.firstInteraction ? new Date(meta.firstInteraction).getTime() : 0;
const modelUsageWithInteractions = this.buildModelUsageWithInteractions(modelUsage, interactions);

return { tokens, interactions, modelUsage: modelUsageWithInteractions, timestamp };
}

private buildModelUsageWithInteractions(
modelUsage: ModelUsage,
interactions: number
): { [key: string]: { inputTokens: number; outputTokens: number; interactions?: number } } {
const totalUsageTokens = Object.values(modelUsage).reduce((sum, u) => sum + u.inputTokens + u.outputTokens, 0);
const result: { [key: string]: { inputTokens: number; outputTokens: number; interactions?: number } } = {};
for (const [model, usage] of Object.entries(modelUsage)) {
const modelTotal = usage.inputTokens + usage.outputTokens;
const fraction = totalUsageTokens > 0 ? modelTotal / totalUsageTokens : 0;
result[model] = {
inputTokens: usage.inputTokens,
outputTokens: usage.outputTokens,
interactions: Math.round(interactions * fraction),
};
}
return result;
}
}
