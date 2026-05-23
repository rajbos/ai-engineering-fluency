/**
 * Antigravity data access layer.
 *
 * Antigravity is Google's closed-source successor to Gemini CLI (released May 2026).
 * It is an Electron-based desktop IDE that uses Google Gemini models via cloudcode-pa.googleapis.com.
 *
 * Session transcripts are stored as JSONL files at:
 *   %USERPROFILE%\.gemini\antigravity\brain\{session-uuid}\.system_generated\logs\transcript.jsonl
 *
 * There are no token counts in the transcript files.
 * The model name is not included in the transcript.
 * Session title is derived from the first USER_INPUT entry (stripping XML wrapper tags).
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import type { ChatTurn, ModelUsage } from './types';
import { createEmptyContextRefs } from './tokenEstimation';
import { normalizePathForComparison } from './workspaceHelpers';

// ---------------------------------------------------------------------------
// Transcript entry interfaces
// ---------------------------------------------------------------------------

export interface AntigravityEntry {
step_index: number;
source: 'USER_EXPLICIT' | 'MODEL' | 'SYSTEM' | string;
type: 'USER_INPUT' | 'CONVERSATION_HISTORY' | 'PLANNER_RESPONSE' | 'SEARCH_WEB' | string;
status?: string;
created_at: string;
content?: string;
thinking?: string;
tool_calls?: AntigravityToolCall[];
}

export interface AntigravityToolCall {
name: string;
args?: Record<string, unknown>;
}

export interface AntigravityParsedSession {
sessionId: string;
userEntries: AntigravityEntry[];
modelEntries: AntigravityEntry[];
allEntries: AntigravityEntry[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract clean user text from a USER_INPUT content string.
 * Strips the XML wrapper: <USER_REQUEST>...</USER_REQUEST>
 * Falls back to the full content string when the wrapper is absent.
 */
export function extractUserRequestText(content: string): string {
const match = content.match(/<USER_REQUEST>([\s\S]*?)<\/USER_REQUEST>/);
if (match) {
return match[1].trim();
}
// No XML wrapper — return everything up to any <ADDITIONAL_METADATA> block.
const metaIdx = content.indexOf('<ADDITIONAL_METADATA>');
if (metaIdx !== -1) {
return content.substring(0, metaIdx).trim();
}
return content.trim();
}

// ---------------------------------------------------------------------------
// buildAntigravityTurns helpers
// ---------------------------------------------------------------------------

type BatTurnData = { assistantResponse: string; toolCalls: NonNullable<ChatTurn['toolCalls']>; thinkingContent: string };

function _batProcessPlannerResponse(next: AntigravityEntry, data: BatTurnData): void {
	if (next.content?.trim()) { data.assistantResponse += (data.assistantResponse ? '\n\n' : '') + next.content.trim(); }
	if (next.thinking?.trim()) { data.thinkingContent += (data.thinkingContent ? '\n\n' : '') + next.thinking.trim(); }
	if (!Array.isArray(next.tool_calls)) { return; }
	for (const tc of next.tool_calls) {
		if (tc.name) { data.toolCalls.push({ toolName: tc.name, arguments: tc.args ? JSON.stringify(tc.args) : undefined }); }
	}
}

function _batProcessSearchWeb(next: AntigravityEntry, data: BatTurnData): void {
	if (!next.content || data.toolCalls.length === 0) { return; }
	const last = data.toolCalls[data.toolCalls.length - 1];
	if (!last.result) { last.result = next.content.trim(); }
}

function _batCollectTurnData(allEntries: AntigravityEntry[], startIdx: number): BatTurnData {
	const data: BatTurnData = { assistantResponse: '', toolCalls: [], thinkingContent: '' };
	for (let j = startIdx + 1; j < allEntries.length; j++) {
		const next = allEntries[j];
		if (next.type === 'USER_INPUT' && next.source === 'USER_EXPLICIT') { break; }
		if (next.source !== 'MODEL') { continue; }
		if (next.type === 'PLANNER_RESPONSE') { _batProcessPlannerResponse(next, data); }
		else if (next.type === 'SEARCH_WEB') { _batProcessSearchWeb(next, data); }
	}
	return data;
}

// ---------------------------------------------------------------------------
// Data access class
// ---------------------------------------------------------------------------

export class AntigravityDataAccess {
/**
 * Root directory of Antigravity data.
 * %USERPROFILE%\.gemini\antigravity
 */
getAntigravityDataDir(): string {
return path.join(os.homedir(), '.gemini', 'antigravity');
}

/**
 * The brain directory that contains per-session subdirectories.
 * %USERPROFILE%\.gemini\antigravity\brain
 */
getAntigravityBrainDir(): string {
return path.join(this.getAntigravityDataDir(), 'brain');
}

/**
 * Returns true when the file path is an Antigravity transcript.
 * Path pattern: .../.gemini/antigravity/brain/{uuid}/.system_generated/logs/transcript.jsonl
 */
isAntigravitySessionFile(filePath: string): boolean {
const normalized = normalizePathForComparison(filePath);
return (
normalized.includes('/.gemini/antigravity/brain/') &&
normalized.endsWith('/transcript.jsonl')
);
}

/**
 * Extract the session UUID from an Antigravity transcript path.
 * The UUID is the directory immediately under `.../brain/`.
 */
getSessionIdFromPath(filePath: string): string {
const normalized = filePath.replace(/\\/g, '/');
const brainIdx = normalized.toLowerCase().indexOf('/.gemini/antigravity/brain/');
if (brainIdx === -1) { return path.basename(path.dirname(path.dirname(path.dirname(filePath)))); }
const afterBrain = normalized.substring(brainIdx + '/.gemini/antigravity/brain/'.length);
const slashIdx = afterBrain.indexOf('/');
return slashIdx !== -1 ? afterBrain.substring(0, slashIdx) : afterBrain;
}

/**
 * Discover all Antigravity transcript files under the brain directory.
 */
getAntigravitySessionFiles(): string[] {
const brainDir = this.getAntigravityBrainDir();
if (!fs.existsSync(brainDir)) {
return [];
}
const sessionFiles: string[] = [];
try {
const sessionDirs = fs.readdirSync(brainDir, { withFileTypes: true });
for (const sessionDir of sessionDirs) {
if (!sessionDir.isDirectory()) { continue; }
const transcriptPath = path.join(
brainDir,
sessionDir.name,
'.system_generated',
'logs',
'transcript.jsonl',
);
try {
const stat = fs.statSync(transcriptPath);
if (stat.size > 0) {
sessionFiles.push(transcriptPath);
}
} catch {
// transcript.jsonl does not exist for this session — skip.
}
}
} catch {
return [];
}
return sessionFiles;
}

/**
 * Read and parse an Antigravity transcript.jsonl file.
 * Returns a parsed session with user and model entries separated.
 */
readAntigravitySession(filePath: string): AntigravityParsedSession {
const sessionId = this.getSessionIdFromPath(filePath);
const userEntries: AntigravityEntry[] = [];
const modelEntries: AntigravityEntry[] = [];
const allEntries: AntigravityEntry[] = [];

let rawContent: string;
try {
rawContent = fs.readFileSync(filePath, 'utf8');
} catch {
return { sessionId, userEntries, modelEntries, allEntries };
}

const lines = rawContent.split('\n').filter(l => l.trim().length > 0);
for (const line of lines) {
let entry: AntigravityEntry;
try {
entry = JSON.parse(line) as AntigravityEntry;
} catch {
continue;
}
if (!entry || typeof entry.type !== 'string') { continue; }

allEntries.push(entry);

if (entry.type === 'USER_INPUT' && entry.source === 'USER_EXPLICIT') {
userEntries.push(entry);
} else if (entry.source === 'MODEL') {
modelEntries.push(entry);
}
}

// Sort all arrays by step_index to ensure chronological order.
const byStepIndex = (a: AntigravityEntry, b: AntigravityEntry) => a.step_index - b.step_index;
allEntries.sort(byStepIndex);
userEntries.sort(byStepIndex);
modelEntries.sort(byStepIndex);

return { sessionId, userEntries, modelEntries, allEntries };
}

/**
 * Estimate token counts from transcript content.
 * Uses user message text for input and model response text for output.
 * Since Antigravity doesn't persist token counts, this is a best-effort estimate.
 */
estimateTokensFromAntigravitySession(
filePath: string,
estimateTokens: (text: string, model?: string) => number
): { tokens: number; thinkingTokens: number } {
const session = this.readAntigravitySession(filePath);
let inputTokens = 0;
let outputTokens = 0;
let thinkingTokens = 0;

for (const entry of session.userEntries) {
inputTokens += estimateTokens(extractUserRequestText(entry.content ?? ''));
}
for (const entry of session.modelEntries) {
if (entry.type === 'PLANNER_RESPONSE') {
if (entry.content) { outputTokens += estimateTokens(entry.content); }
if (entry.thinking) { thinkingTokens += estimateTokens(entry.thinking); }
}
}

return { tokens: inputTokens + outputTokens + thinkingTokens, thinkingTokens };
}

/**
 * Count the number of user interactions (USER_INPUT entries) in a session.
 */
countAntigravityInteractions(filePath: string): number {
const session = this.readAntigravitySession(filePath);
return session.userEntries.length;
}

/**
 * Return per-model token usage.
 * Antigravity transcripts have no model name or token data — returns empty.
 */
getAntigravityModelUsage(_filePath: string): ModelUsage {
return {};
}

/**
 * Extract session metadata: title, first/last interaction timestamps.
 *
 * Title: derived from the first USER_INPUT content (XML wrapper stripped).
 * First interaction: created_at of first entry.
 * Last interaction: created_at of last entry.
 */
getAntigravitySessionMeta(filePath: string): {
title: string | undefined;
firstInteraction: string | null;
lastInteraction: string | null;
} {
const session = this.readAntigravitySession(filePath);
const all = session.allEntries;

let title: string | undefined;
if (session.userEntries.length > 0) {
const firstUser = session.userEntries[0];
const content = firstUser.content ?? '';
const extracted = extractUserRequestText(content);
// Truncate to 120 chars for display.
title = extracted.length > 120 ? extracted.substring(0, 117) + '...' : extracted || undefined;
}

const firstInteraction = all.length > 0 ? (all[0].created_at ?? null) : null;
const lastInteraction = all.length > 0 ? (all[all.length - 1].created_at ?? null) : null;

return { title, firstInteraction, lastInteraction };
}

/**
 * Build chat turns for the log viewer.
 *
 * Each USER_INPUT becomes a turn. The subsequent MODEL entries (PLANNER_RESPONSE
 * with content, SEARCH_WEB tool results) are collected as the assistant response
 * for that turn.
 *
 * Because there are no token counts, inputTokensEstimate and outputTokensEstimate
 * are always 0.
 */
buildAntigravityTurns(filePath: string): { turns: ChatTurn[]; actualTokens?: number } {
const session = this.readAntigravitySession(filePath);
const allEntries = session.allEntries;
const turns: ChatTurn[] = [];
let turnNumber = 0;

for (let i = 0; i < allEntries.length; i++) {
const entry = allEntries[i];
if (entry.type !== 'USER_INPUT' || entry.source !== 'USER_EXPLICIT') { continue; }
turnNumber++;
const userMessage = extractUserRequestText(entry.content ?? '');
const { assistantResponse, toolCalls } = _batCollectTurnData(allEntries, i);
turns.push({
turnNumber,
timestamp: entry.created_at ?? null,
mode: 'cli',
userMessage,
assistantResponse,
model: null,
toolCalls,
contextReferences: createEmptyContextRefs(),
mcpTools: [],
inputTokensEstimate: 0,
outputTokensEstimate: 0,
thinkingTokensEstimate: 0,
});
}

return { turns };
}

/**
 * Count the total number of tool calls across all entries in a session.
 */
countToolCalls(filePath: string): number {
const session = this.readAntigravitySession(filePath);
let total = 0;
for (const entry of session.allEntries) {
if (Array.isArray(entry.tool_calls)) {
total += entry.tool_calls.length;
}
}
return total;
}
}
