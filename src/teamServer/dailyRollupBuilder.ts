/**
 * Daily rollup builder for team-server and Azure Storage sync.
 *
 * Turns local session files into per-(day, model, workspace, machine, editor) token and
 * interaction rollups. Editor-neutral: the VS Code extension's SyncService extends it, and the
 * desktop app uses it directly to upload to a team server. Host services (session discovery,
 * the parsed-session cache, token estimation, the machine id) are injected through
 * {@link DailyRollupBuilderDeps}.
 */

import { createHash } from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import type { DailyRollupKey } from './rollups';
import { upsertDailyRollup } from './rollups';
import type { DailyRollupValue, ChatRequest } from './types';
import type { SessionFileCache, ModelUsage, DailyRollupEntry, SessionUsageAnalysis } from '../types';
import { BackendUtility } from './utility';
import { isCopilotFusionAutoSession, resolveCopilotRouterModel } from '../hydrafusion';
import { isJsonlContent } from '../tokenEstimation';
import { getEditorTypeFromPath, refineEditorLabelForInteractionModeSplit } from '../workspaceHelpers';

/** Ecosystem session per-model usage entry (input, output, optional interactions). */
export type ModelUsageEntry = { inputTokens: number; outputTokens: number; interactions?: number };

/**
 * True when a parsed JSON value is a plain object usable as a session record.
 * Arrays are rejected: `typeof [] === 'object'`, so a bare `[]` line would
 * otherwise read as a valid record with no usage on it and a file of such
 * lines would look like a genuinely empty scan rather than a failed one.
 */
function isEventRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

/** Model reference carried by a VS Code delta event (`selectedModel` and kind:0 state). */
type DeltaModelRef = { identifier?: string; metadata?: { id?: string } };

/** The `v` payload of a VS Code delta event, as read when looking for the selected model. */
type DeltaModelPayload = DeltaModelRef & {
	selectedModel?: DeltaModelRef;
	inputState?: { selectedModel?: DeltaModelRef };
};

/** A Copilot CLI JSONL event, as read by the fallback parser. Fields are checked before use. */
type CliEvent = {
	type?: unknown;
	model?: unknown;
	timestamp?: unknown;
	data?: { selectedModel?: unknown; newModel?: unknown; model?: unknown; content?: string; output?: string };
};

/** The `result` of a chat request, in each of the shapes that carry API-reported token counts. */
type ChatRequestResult = {
	usage?: { promptTokens?: unknown; completionTokens?: unknown };
	promptTokens?: unknown;
	outputTokens?: unknown;
	metadata?: { promptTokens?: unknown; outputTokens?: unknown; modelId?: unknown };
};

/** Fluency metrics stored on a daily rollup. */
type FluencyMetrics = NonNullable<DailyRollupValue['fluencyMetrics']>;

/** Usage analysis as read back from the cache: any field may be missing, and repository lists may be attached. */
type CachedUsageAnalysis = Partial<SessionUsageAnalysis> & { repositories?: string[]; repositoriesWithCustomization?: string[] };

/** Model id of a delta-format chat request, from the request itself or its result metadata. */
function getRequestModelId(req: ChatRequest): unknown {
	return req.modelId || (req.result as ChatRequestResult | undefined)?.metadata?.modelId;
}

/** Logger callbacks for the rollup builder. */
export interface SyncServiceLogger {
	log: (message: string) => void;
	warn: (message: string) => void;
}

/** Session file access, stat, caching, and token estimation callbacks. */
export interface SyncServiceSessionHandlers {
	getCopilotSessionFiles: () => Promise<string[]>;
	estimateTokensFromText: (text: string, model: string) => number;
	getModelFromRequest: (request: ChatRequest) => string;
	/** Cache integration for performance. */
	getSessionFileDataCached?: (sessionFilePath: string, mtime: number, fileSize: number) => Promise<SessionFileCache>;
	/** Stat helper for OpenCode DB virtual paths. */
	statSessionFile: (sessionFile: string) => Promise<fs.Stats>;
}

/** Per-editor session detection and data extraction callbacks. */
export interface SyncServiceEditorHandlers {
	/** OpenCode session handling. */
	isOpenCodeSession?: (sessionFile: string) => boolean;
	getOpenCodeSessionData?: (sessionFile: string) => Promise<{ tokens: number; interactions: number; modelUsage: Record<string, ModelUsageEntry>; timestamp: number }>;
	/** Crush session handling (per-project crush.db virtual paths). */
	isCrushSession?: (sessionFile: string) => boolean;
	getCrushSessionData?: (sessionFile: string) => Promise<{ tokens: number; interactions: number; modelUsage: Record<string, ModelUsageEntry>; timestamp: number }>;
	/** Visual Studio session detection (binary MessagePack — cannot be parsed as JSON). */
	isVSSessionFile?: (sessionFile: string) => boolean;
}

/** Host services the rollup builder needs. */
export interface DailyRollupBuilderDeps {
	logger: SyncServiceLogger;
	sessionHandlers: SyncServiceSessionHandlers;
	editorHandlers?: SyncServiceEditorHandlers;
	/** Resolves the session-specific editor label supplied by an ecosystem adapter. */
	getEditorLabel?: (sessionFile: string) => string;
	/**
	 * Stable id for this machine, used as the rollup machine dimension (hashed per dataset for
	 * team profiles before upload). Hosts without their own id may omit it; see getMachineId().
	 */
	getMachineId?: () => string;
}

/** Rollup map keyed by dailyRollupMapKey(). */
export type DailyRollupMap = Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;

/** Result of {@link DailyRollupBuilder.computeDailyRollupsFromLocalSessions}. */
export interface ComputedDailyRollups {
	rollups: DailyRollupMap;
	workspaceNamesById: Record<string, string>;
	machineNamesById: Record<string, string>;
	editorTypeByFile: Map<string, string>;
	/**
	 * Number of discovered session files that could not be read, parsed or
	 * stat'ed. These failures are logged and skipped, so an empty `rollups`
	 * map on its own cannot tell "the user genuinely has no data" apart from
	 * "the data is there but none of it could be read".
	 */
	filesFailed: number;
}

/** Arguments shared across per-session rollup helper methods. */
type SessionRollupArgs = { machineId: string; userId: string | undefined; editorForFile: string | undefined; workspaceNamesById: Record<string, string>; rollups: DailyRollupMap; startMs: number };

export class DailyRollupBuilder {
	constructor(
		protected readonly deps: DailyRollupBuilderDeps,
		protected readonly utility: typeof BackendUtility = BackendUtility,
	) {}

	/**
	 * The machine dimension for rollups. Defaults to a hash of the OS hostname so a host
	 * without its own machine id still produces one stable value per machine.
	 */
	protected getMachineId(): string {
		const provided = this.deps.getMachineId?.();
		if (provided) { return provided; }
		return createHash('sha256').update(os.hostname()).digest('hex');
	}

	/** Public entry point for hosts that use the builder directly (the desktop app). */
	async computeRollups(args: Parameters<DailyRollupBuilder['computeDailyRollupsFromLocalSessions']>[0]): Promise<ComputedDailyRollups> {
		return this.computeDailyRollupsFromLocalSessions(args);
	}

/** Arguments shared across per-session rollup helper methods. */
protected makeSessionRollupArgs(
machineId: string,
userId: string | undefined,
editorForFile: string | undefined,
workspaceNamesById: Record<string, string>,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
startMs: number
): { machineId: string; userId: string | undefined; editorForFile: string | undefined; workspaceNamesById: Record<string, string>; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>; startMs: number } {
return { machineId, userId, editorForFile, workspaceNamesById, rollups, startMs };
}

/**
 * Build day→model interaction counts from Copilot CLI non-delta JSONL format.
 * Each JSONL line is a single event; counts all events per day per model.
 */
protected buildDayModelInteractionsFromCliJsonl(
content: string,
sessionFile: string,
fileMtimeMs: number,
startMs: number,
now: Date
): Map<string, Map<string, number>> | null {
const dayModelInteractions = new Map<string, Map<string, number>>();
const lines = content.trim().split('\n');
const todayKey = this.utility.toUtcDayKey(now);
let lineCount = 0;
let processedLines = 0;
const failures = { count: 0 };
for (const line of lines) {
lineCount++;
if (!line.trim()) { continue; }
processedLines = this.processCliJsonlLine(line, fileMtimeMs, startMs, todayKey, sessionFile, lineCount, processedLines, dayModelInteractions, failures);
}
// Any unreadable line means this file's usage is not fully represented here.
// Returning null makes the caller fall through to the raw-content parser, which
// counts the file towards filesFailed; swallowing it would let a malformed
// session look like a clean, empty scan on the cached path.
if (failures.count > 0) {
this.deps.logger.warn(`Backend sync: ${failures.count} unreadable line(s) in ${sessionFile} — re-reading without the cache`);
return null;
}
return dayModelInteractions;
}

protected processCliJsonlLine(
line: string,
fileMtimeMs: number,
startMs: number,
todayKey: string,
sessionFile: string,
lineCount: number,
processedLines: number,
dayModelInteractions: Map<string, Map<string, number>>,
failures: { count: number }
): number {
try {
const event = JSON.parse(line);
if (!isEventRecord(event)) { failures.count++; return processedLines; }
const normalizedTs = this.utility.normalizeTimestampToMs(event.timestamp);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { return processedLines; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const model = (event.model || 'gpt-4o').toString();
if (dayKey === todayKey && processedLines < 3) {
this.deps.logger.log(`Backend sync: file ${sessionFile.split(/[/\\]/).pop()} line ${lineCount}: eventMs=${new Date(eventMs).toISOString()}, dayKey=${dayKey}, type=${event.type}`);
processedLines++;
}
if (!dayModelInteractions.has(dayKey)) { dayModelInteractions.set(dayKey, new Map()); }
const dayMap = dayModelInteractions.get(dayKey)!;
dayMap.set(model, (dayMap.get(model) || 0) + 1);
} catch {
failures.count++;
}
return processedLines;
}

/**
 * Build day→model interaction counts from VS Code delta-based JSONL format.
 * Handles kind:0/1/2 events with per-request deduplication.
 */
protected buildDayModelInteractionsFromDeltaJsonl(
content: string,
fileMtimeMs: number,
startMs: number
): Map<string, Map<string, number>> | null {
const dayModelInteractions = new Map<string, Map<string, number>>();
let defaultModel = 'unknown';
const seenRequestIds = new Set<string>();
const lines = content.trim().split('\n');
let failures = 0;
for (const line of lines) {
if (!line.trim()) { continue; }
try {
const event = JSON.parse(line);
if (!isEventRecord(event)) { failures++; continue; }
defaultModel = this.updateDeltaDefaultModel(event, defaultModel);
const payload = this.readDeltaRequestsPayload(event);
if (payload === 'malformed') {
failures++;
} else if (payload !== 'not-requests') {
failures += this.processDeltaRequests(payload, defaultModel, seenRequestIds, fileMtimeMs, startMs, dayModelInteractions);
}
} catch {
failures++;
}
}
// Same contract as the other cached parsers: an unreadable line means this file
// cannot be reported as cleanly empty, so defer to the failure-aware parser.
if (failures > 0) { return null; }
return dayModelInteractions;
}

/**
 * Classify a delta event's `requests` payload so the cached and raw parsers
 * cannot disagree about the same event.
 *
 * Returns the entries when the event replaces the whole `requests` array,
 * 'not-requests' when it targets something else, and 'malformed' when it
 * targets the whole array but carries a value that cannot be read. That last
 * case used to be silently ignored, so a file of nothing but
 * `{"kind":2,"k":["requests"],"v":null}` produced an empty map on both paths,
 * left filesFailed at zero, and let the no-data branch advance the marker.
 *
 * Nested updates (`k.length > 1`, e.g. `['requests', 0, 'response']`) legitimately
 * carry non-array values, so only the top-level path can be malformed.
 */
protected readDeltaRequestsPayload(event: Record<string, unknown>): unknown[] | 'not-requests' | 'malformed' {
if (event.kind !== 2 || !Array.isArray(event.k) || event.k[0] !== 'requests') { return 'not-requests'; }
if (Array.isArray(event.v)) { return event.v; }
return event.k.length === 1 ? 'malformed' : 'not-requests';
}

protected updateDeltaDefaultModel(event: Record<string, unknown>, defaultModel: string): string {if (event.kind === 0) {
const modelId = this.extractModelIdFromKind0Event(event);
if (modelId) { return modelId.replace(/^copilot\//, ''); }
}
if (event.kind === 2 && Array.isArray(event.k) && event.k[0] === 'selectedModel') {
const modelId = this.extractModelIdFromSelectedModelEvent(event);
if (modelId) { return modelId.replace(/^copilot\//, ''); }
}
return defaultModel;
}

protected extractModelIdFromKind0Event(event: Record<string, unknown>): string | undefined {
const v = event.v as DeltaModelPayload | undefined;
return v?.selectedModel?.identifier ||
v?.selectedModel?.metadata?.id ||
v?.inputState?.selectedModel?.metadata?.id;
}

protected extractModelIdFromSelectedModelEvent(event: Record<string, unknown>): string | undefined {
const v = event.v as DeltaModelPayload | undefined;
return v?.identifier || v?.metadata?.id;
}

protected processDeltaRequests(
requests: unknown[],
defaultModel: string,
seenRequestIds: Set<string>,
fileMtimeMs: number,
startMs: number,
dayModelInteractions: Map<string, Map<string, number>>
): number {
let failed = 0;
for (const request of requests) {
// A delta payload entry that is not an object carries no usage and cannot be
// read; counting it keeps this in step with the raw-content delta parser.
if (!isEventRecord(request)) { failed++; continue; }
this.upsertDeltaRequest(request as ChatRequest, defaultModel, seenRequestIds, fileMtimeMs, startMs, dayModelInteractions);
}
return failed;
}

protected upsertDeltaRequest(
req: ChatRequest,
defaultModel: string,
seenRequestIds: Set<string>,
fileMtimeMs: number,
startMs: number,
dayModelInteractions: Map<string, Map<string, number>>
): void {
const reqId = req.requestId as string | undefined;
if (reqId && seenRequestIds.has(reqId)) { return; }
if (reqId) { seenRequestIds.add(reqId); }
const normalizedTs = this.utility.normalizeTimestampToMs(req.timestamp);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { return; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const rawModel = getRequestModelId(req);
const model = rawModel ? (rawModel as string).replace(/^copilot\//, '') : defaultModel;
if (!dayModelInteractions.has(dayKey)) { dayModelInteractions.set(dayKey, new Map()); }
const dayMap = dayModelInteractions.get(dayKey)!;
dayMap.set(model, (dayMap.get(model) ?? 0) + 1);
}

/**
 * Build day→model interaction counts from regular JSON session format.
 * Returns null if the document cannot be read as a session: unparseable JSON, a
 * missing `requests` array, or any malformed record inside it. The caller treats
 * null as a cache miss and falls through to the failure-aware parser.
 */
protected buildDayModelInteractionsFromJson(
content: string,
fileMtimeMs: number,
startMs: number,
sessionFile: string
): Map<string, Map<string, number>> | null {
try {
const sessionJson = JSON.parse(content);
if (!isEventRecord(sessionJson)) {
return null;
}
const sessionObj = sessionJson as Record<string, unknown>;
// Mirrors processJsonSessionFallback: a document with no `requests` array is one
// we cannot extract usage from, so it must not be reported as cleanly empty.
if (!Array.isArray(sessionObj.requests)) {
this.deps.logger.warn(`Backend sync: cached session file has no "requests" array: ${sessionFile}`);
return null;
}
const requests = sessionObj.requests as unknown[];
const dayModelInteractions = new Map<string, Map<string, number>>();
for (const request of requests) {
// processJsonSessionFallback rejects malformed request records, so this path has
// to as well: casting `[]` or `"bad"` to a ChatRequest yields no usable fields and
// silently produced an empty, successful-looking map.
if (!isEventRecord(request)) {
this.deps.logger.warn(`Backend sync: malformed request record in cached session ${sessionFile}`);
return null;
}
const req = request as ChatRequest;
const normalizedTs = this.utility.normalizeTimestampToMs(
typeof req.timestamp !== 'undefined' ? req.timestamp : (sessionObj.lastMessageDate as unknown)
);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { continue; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const model = this.deps.sessionHandlers.getModelFromRequest(req);
if (!dayModelInteractions.has(dayKey)) {
dayModelInteractions.set(dayKey, new Map());
}
const dayMap = dayModelInteractions.get(dayKey)!;
dayMap.set(model, (dayMap.get(model) || 0) + 1);
}
return dayModelInteractions;
} catch (e) {
this.deps.logger.warn(`Backend sync: failed to parse JSON for ${sessionFile}: ${e}`);
return null;
}
}

protected redistributeToMappedModels(
modelMap: Map<string, number>,
unmappedModels: Set<string>,
cachedModelNames: string[],
cachedModelUsage: ModelUsage,
totalCachedTokens: number
): void {
let unmappedCount = 0;
for (const um of unmappedModels) { unmappedCount += modelMap.get(um) ?? 0; modelMap.delete(um); }
if (unmappedCount === 0) { return; }
for (const cm of cachedModelNames) {
const ct = cachedModelUsage[cm].inputTokens + cachedModelUsage[cm].outputTokens;
const share = totalCachedTokens > 0 ? ct / totalCachedTokens : 1 / cachedModelNames.length;
const redistributed = Math.round(unmappedCount * share);
if (redistributed > 0) { modelMap.set(cm, (modelMap.get(cm) ?? 0) + redistributed); }
}
}

/**
 * Remap event model names to cached model names when there is a mismatch.
 * CLI sessions often omit the model in individual events while session.shutdown
 * provides the actual model. Without remapping, token lookups silently fail.
 */
protected remapUnmappedModels(
dayModelInteractions: Map<string, Map<string, number>>,
cachedModelUsage: ModelUsage
): void {
const cachedModelNames = Object.keys(cachedModelUsage);
if (cachedModelNames.length === 0) { return; }
const allEventModels = new Set<string>();
for (const modelMap of dayModelInteractions.values()) {
for (const m of modelMap.keys()) { allEventModels.add(m); }
}
const unmappedModels = new Set<string>();
for (const m of allEventModels) { if (!cachedModelUsage[m]) { unmappedModels.add(m); } }
if (unmappedModels.size === 0) { return; }
const totalCachedTokens = cachedModelNames.reduce((sum, m) =>
sum + cachedModelUsage[m].inputTokens + cachedModelUsage[m].outputTokens, 0);
for (const [, modelMap] of dayModelInteractions) {
this.redistributeToMappedModels(modelMap, unmappedModels, cachedModelNames, cachedModelUsage, totalCachedTokens);
}
}

/**
 * Build daily rollup entries from day→model interaction counts and cached token data.
 * Applies proportional fractions for multi-day sessions.
 */
protected buildRollupsFromDayModelInteractions(
dayModelInteractions: Map<string, Map<string, number>>,
cachedData: SessionFileCache,
sessionFile: string,
workspaceId: string,
machineId: string,
userId: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
editor?: string
): void {
const totalInteractionsPerModel = new Map<string, number>();
for (const modelMap of dayModelInteractions.values()) {
for (const [m, c] of modelMap) {
totalInteractionsPerModel.set(m, (totalInteractionsPerModel.get(m) || 0) + c);
}
}
for (const [dayKey, modelMap] of dayModelInteractions) {
this.processModelInteractionsForDay(dayKey, modelMap, totalInteractionsPerModel, cachedData, sessionFile, workspaceId, machineId, userId, rollups, editor);
}
if (dayModelInteractions.size > 1) {
const days = Array.from(dayModelInteractions.keys()).sort();
this.deps.logger.log(`Backend sync: file ${sessionFile.split(/[/\\]/).pop()} spans ${days.length} days: ${days.join(', ')}`);
}
}

protected processModelInteractionsForDay(
dayKey: string,
modelMap: Map<string, number>,
totalInteractionsPerModel: Map<string, number>,
cachedData: SessionFileCache,
sessionFile: string,
workspaceId: string,
machineId: string,
userId: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
editor?: string
): void {
for (const [model, interactions] of modelMap) {
const cachedUsage = cachedData.modelUsage[model];
if (!cachedUsage) { continue; }
const cachedInput = typeof cachedUsage.inputTokens === 'number' ? cachedUsage.inputTokens : NaN;
const cachedOutput = typeof cachedUsage.outputTokens === 'number' ? cachedUsage.outputTokens : NaN;
if (!Number.isFinite(cachedInput) || cachedInput < 0 ||
!Number.isFinite(cachedOutput) || cachedOutput < 0) {
this.deps.logger.warn(`Backend sync: invalid inputTokens or outputTokens in model usage for ${sessionFile}`);
continue;
}
const key: DailyRollupKey = { day: dayKey, model, workspaceId, machineId, userId, editor };
const totalModelInteractions = totalInteractionsPerModel.get(model) || 1;
const dayFraction = totalModelInteractions > 0 ? interactions / totalModelInteractions : 1;
const inputTokens = Math.round(cachedInput * dayFraction);
const outputTokens = Math.round(cachedOutput * dayFraction);
const fluencyMetrics = this.extractFluencyMetricsFromCache(cachedData, dayFraction);
upsertDailyRollup(rollups, key, { inputTokens, outputTokens, interactions, fluencyMetrics });
}
}

/**
 * Process an OpenCode session file and add its data to the rollups map.
 * Returns false if outside the lookback window or no handler is registered.
 * Throws on data retrieval errors (caller should catch and log).
 */
protected async processOpenCodeSession(
sessionFile: string,
fileMtimeMs: number,
args: { machineId: string; userId: string | undefined; editorForFile: string | undefined; workspaceNamesById: Record<string, string>; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>; startMs: number }
): Promise<boolean> {
if (!this.deps.editorHandlers?.getOpenCodeSessionData) { return false; }
const getOpenCodeSessionData = this.deps.editorHandlers.getOpenCodeSessionData;
return this.addModelUsageSessionToRollups(sessionFile, fileMtimeMs, args, await getOpenCodeSessionData(sessionFile));
}

/**
 * Process a Crush session file and add its data to the rollups map.
 * Returns false if outside the lookback window or no handler is registered.
 * Throws on data retrieval errors (caller should catch and log).
 */
protected async processCrushSession(
sessionFile: string,
fileMtimeMs: number,
args: { machineId: string; userId: string | undefined; editorForFile: string | undefined; workspaceNamesById: Record<string, string>; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>; startMs: number }
): Promise<boolean> {
if (!this.deps.editorHandlers?.getCrushSessionData) { return false; }
const getCrushSessionData = this.deps.editorHandlers.getCrushSessionData;
// Crush paths: <project>/.crush/crush.db#<id>  — no workspaceStorage segment
return this.addModelUsageSessionToRollups(sessionFile, fileMtimeMs, args, await getCrushSessionData(sessionFile));
}

/**
 * Adds a session whose handler reports per-model usage (OpenCode, Crush) to the rollups map, on the day of its
 * timestamp (or the file's mtime). Returns false if that falls outside the lookback window.
 */
protected async addModelUsageSessionToRollups(
sessionFile: string,
fileMtimeMs: number,
args: { machineId: string; userId: string | undefined; editorForFile: string | undefined; workspaceNamesById: Record<string, string>; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>; startMs: number },
data: { modelUsage: Record<string, ModelUsageEntry>; timestamp: number }
): Promise<boolean> {
const eventMs = data.timestamp || fileMtimeMs;
if (!eventMs || eventMs < args.startMs) { return false; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const workspaceId = this.utility.extractWorkspaceIdFromSessionPath(sessionFile);
await this.ensureWorkspaceNameResolved(workspaceId, sessionFile, args.workspaceNamesById);
for (const [model, usage] of Object.entries(data.modelUsage)) {
const key: DailyRollupKey = { day: dayKey, model, workspaceId, machineId: args.machineId, userId: args.userId, editor: args.editorForFile };
upsertDailyRollup(args.rollups, key, {
inputTokens: usage.inputTokens || 0,
outputTokens: usage.outputTokens || 0,
interactions: usage.interactions || 0,
});
}
return true;
}
/**
 * Process a session file using cached data for token counts but extracting accurate timestamps.
 * Returns true if successful, false if cache miss (caller should parse file).
 * Validates all cached data at runtime to prevent injection/corruption.
 *
 * CRITICAL: We parse the file to extract actual interaction timestamps and create per-day
 * rollups, but use cached token counts for performance. This ensures accurate day assignment
 * while still benefiting from cached calculations.
 */
protected async processCachedSessionFile(
sessionFile: string,
fileMtimeMs: number,
fileSize: number,
workspaceId: string,
machineId: string,
userId: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
startMs: number,
now: Date,
editor?: string
): Promise<boolean> {
try {
const cachedData = await this.deps.sessionHandlers.getSessionFileDataCached!(sessionFile, fileMtimeMs, fileSize);
if (!this.validateCachedData(cachedData, sessionFile)) { return false; }
if (cachedData.dailyRollups && Object.keys(cachedData.dailyRollups).length > 0) {
return this.processDailyRollupsFastPath(cachedData, workspaceId, machineId, userId, rollups, editor, startMs);
}
const content = await fs.promises.readFile(sessionFile, 'utf8');
const dayModelInteractions = this.buildDayModelInteractionMap(content, sessionFile, fileMtimeMs, startMs, now);
if (dayModelInteractions === null) { return false; }
this.remapUnmappedModels(dayModelInteractions, cachedData.modelUsage);
this.buildRollupsFromDayModelInteractions(dayModelInteractions, cachedData, sessionFile, workspaceId, machineId, userId, rollups, editor);
return true;
} catch (e) {
const errorMessage = e instanceof Error ? e.message : String(e);
if (errorMessage.includes('ENOENT') || errorMessage.includes('not found')) { return false; }
this.deps.logger.warn(`Backend sync: cache error for ${sessionFile}: ${errorMessage}`);
return false;
}
}

protected validateCachedData(cachedData: unknown, sessionFile: string): cachedData is SessionFileCache {
if (!cachedData || typeof cachedData !== 'object') {
this.deps.logger.warn(`Backend sync: invalid cached data structure for ${sessionFile}`);
return false;
}
const candidate = cachedData as Record<string, unknown>;
if (typeof candidate.modelUsage !== 'object' || candidate.modelUsage === null) {
this.deps.logger.warn(`Backend sync: invalid modelUsage in cached data for ${sessionFile}`);
return false;
}
if (typeof candidate.interactions !== 'number' || !Number.isFinite(candidate.interactions) || candidate.interactions < 0) {
this.deps.logger.warn(`Backend sync: invalid interactions count in cached data for ${sessionFile}`);
return false;
}
return true;
}

protected processDailyRollupsFastPath(
cachedData: SessionFileCache,
workspaceId: string,
machineId: string,
userId: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
editor: string | undefined,
startMs: number
): boolean {
const totalSessionInteractions = cachedData.interactions || 1;
const dailyRollups = cachedData.dailyRollups ?? {};
const dayKeys = Object.keys(dailyRollups).sort();
for (const dayKey of dayKeys) {
const dayEntry = dailyRollups[dayKey];
const dayStartMs = new Date(dayKey + 'T00:00:00Z').getTime();
if (dayStartMs < startMs) { continue; }
this.processDailyRollupsDayEntry(dayKey, dayEntry, totalSessionInteractions, cachedData, workspaceId, machineId, userId, rollups, editor);
}
if (dayKeys.length > 1) {
this.deps.logger.log(`Backend sync: file spans ${dayKeys.length} days (dailyRollups fast path): ${dayKeys.join(', ')}`);
}
return true;
}

protected processDailyRollupsDayEntry(
dayKey: string,
dayEntry: DailyRollupEntry,
totalSessionInteractions: number,
cachedData: SessionFileCache,
workspaceId: string,
machineId: string,
userId: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
editor: string | undefined
): void {
const modelEntries = Object.entries(dayEntry.modelUsage).filter(([, mu]) =>
mu && ((mu.inputTokens || 0) > 0 || (mu.outputTokens || 0) > 0)
);
if (modelEntries.length === 0) { return; }
const totalDayOutput = modelEntries.reduce((s, [, mu]) => s + (mu.outputTokens || 0), 0);
const dayFraction = totalSessionInteractions > 0 ? dayEntry.interactions / totalSessionInteractions : 1;
const fluencyMetrics = this.extractFluencyMetricsFromCache(cachedData, dayFraction);
let remainingInteractions = dayEntry.interactions;
for (let i = 0; i < modelEntries.length; i++) {
const [model, mu] = modelEntries[i];
const isLast = i === modelEntries.length - 1;
const share = (!isLast && totalDayOutput > 0) ? (mu.outputTokens || 0) / totalDayOutput : 1;
const modelInteractions = isLast
? remainingInteractions
: Math.min(Math.round(dayEntry.interactions * share), remainingInteractions);
remainingInteractions -= modelInteractions;
const key: DailyRollupKey = { day: dayKey, model, workspaceId, machineId, userId, editor };
upsertDailyRollup(rollups, key, {
inputTokens: mu.inputTokens || 0,
outputTokens: mu.outputTokens || 0,
interactions: Math.max(0, modelInteractions),
fluencyMetrics,
});
}
}

protected buildDayModelInteractionMap(
content: string,
sessionFile: string,
fileMtimeMs: number,
startMs: number,
now: Date
): Map<string, Map<string, number>> | null {
let isDeltaBasedJsonl = false;
if (isJsonlContent(content)) {
const firstLine = content.trim().split('\n')[0]?.trim();
if (firstLine) {
try {
const firstEvent = JSON.parse(firstLine);
isDeltaBasedJsonl = typeof firstEvent.kind === 'number';
} catch { /* not valid JSON, leave as false */ }
}
}
if (sessionFile.endsWith('.jsonl') && !isDeltaBasedJsonl) {
return this.buildDayModelInteractionsFromCliJsonl(content, sessionFile, fileMtimeMs, startMs, now);
} else if (isDeltaBasedJsonl) {
return this.buildDayModelInteractionsFromDeltaJsonl(content, fileMtimeMs, startMs);
} else {
return this.buildDayModelInteractionsFromJson(content, fileMtimeMs, startMs, sessionFile);
}
}
	/**
	 * Extract fluency metrics from cached session data and serialize for storage.
	 * @param cachedData - The cached session file data
	 * @param ratio - Optional ratio to proportionally distribute metrics (for multi-day sessions)
	 * @returns Fluency metrics object ready for storage
	 */
	protected extractFluencyMetricsFromCache(cachedData: { usageAnalysis?: CachedUsageAnalysis }, ratio: number = 1): FluencyMetrics | undefined {
		if (!cachedData.usageAnalysis) { return undefined; }
		const analysis = cachedData.usageAnalysis;
		const fluencyMetrics: FluencyMetrics = {
			...this.extractModeUsageFluency(analysis, ratio),
			...this.extractJsonFieldsFluency(analysis),
			...this.extractEditScopeFluency(analysis),
			...this.extractRepositoriesFluency(analysis),
			...this.extractActivityFluency(analysis),
			sessionCount: 1
		};
		return Object.keys(fluencyMetrics).length > 0 ? fluencyMetrics : undefined;
	}

	protected extractModeUsageFluency(analysis: CachedUsageAnalysis, ratio: number): FluencyMetrics {
		if (!analysis.modeUsage) { return {}; }
		return {
			askModeCount: Math.round((analysis.modeUsage.ask || 0) * ratio),
			editModeCount: Math.round((analysis.modeUsage.edit || 0) * ratio),
			agentModeCount: Math.round((analysis.modeUsage.agent || 0) * ratio),
			planModeCount: Math.round((analysis.modeUsage.plan || 0) * ratio),
			customAgentModeCount: Math.round((analysis.modeUsage.customAgent || 0) * ratio),
			cliModeCount: Math.round(((analysis.modeUsage.cli || 0) + (analysis.modeUsage.cliApp || 0) + (analysis.modeUsage.claudeDesktop || 0) + (analysis.modeUsage.claudeVsCode || 0)) * ratio)
		};
	}

	protected extractJsonFieldsFluency(analysis: CachedUsageAnalysis): FluencyMetrics {
		const result: FluencyMetrics = {};
		if (analysis.toolCalls) { result.toolCallsJson = JSON.stringify(stripLatencyHistograms(analysis.toolCalls)); }
		if (analysis.contextReferences) { result.contextRefsJson = JSON.stringify(analysis.contextReferences); }
		if (analysis.mcpTools) { result.mcpToolsJson = JSON.stringify(stripLatencyHistograms(analysis.mcpTools)); }
		if (analysis.modelSwitching) { result.modelSwitchingJson = JSON.stringify(analysis.modelSwitching); }
		if (analysis.agentTypes) { result.agentTypesJson = JSON.stringify(analysis.agentTypes); }
		if (analysis.sessionDuration) { result.sessionDurationJson = JSON.stringify(analysis.sessionDuration); }
		return result;
	}

	protected extractEditScopeFluency(analysis: CachedUsageAnalysis): FluencyMetrics {
		if (!analysis.editScope) { return {}; }
		return {
			editScopeJson: JSON.stringify(analysis.editScope),
			multiFileEdits: analysis.editScope.multiFileEdits || 0,
			avgFilesPerEdit: analysis.editScope.avgFilesPerSession || 0
		};
	}

	protected extractRepositoriesFluency(analysis: CachedUsageAnalysis): FluencyMetrics {
		if (!analysis.repositories && !analysis.repositoriesWithCustomization) { return {}; }
		const repoData = {
			repositories: analysis.repositories || [],
			repositoriesWithCustomization: analysis.repositoriesWithCustomization || []
		};
		const result: FluencyMetrics = { repositoriesJson: JSON.stringify(repoData) };
		const totalRepos = (analysis.repositories || []).length;
		const customizedRepos = (analysis.repositoriesWithCustomization || []).length;
		if (totalRepos > 0) { result.repoCustomizationRate = customizedRepos / totalRepos; }
		return result;
	}

	protected extractActivityFluency(analysis: CachedUsageAnalysis): FluencyMetrics {
		const result: FluencyMetrics = {};
		if (analysis.applyUsage) {
			result.applyUsageJson = JSON.stringify(analysis.applyUsage);
			result.codeBlockApplyRate = analysis.applyUsage.applyRate || 0;
		}
		if (analysis.conversationPatterns) {
			result.multiTurnSessions = analysis.conversationPatterns.multiTurnSessions || 0;
			result.avgTurnsPerSession = analysis.conversationPatterns.avgTurnsPerSession || 0;
		}
		return result;
	}

	/**
	 * Resolve workspace name from session path if not already resolved.
	 */
	protected async ensureWorkspaceNameResolved(
		workspaceId: string,
		sessionFile: string,
		workspaceNamesById: Record<string, string>
	): Promise<void> {
		if (!workspaceNamesById[workspaceId]) {
			const resolved = await this.utility.tryResolveWorkspaceNameFromSessionPath(sessionFile);
			if (resolved) {
				workspaceNamesById[workspaceId] = resolved;
			}
		}
	}

	/**
	 * Log cache performance statistics.
	 */
	protected logCachePerformance(cacheHits: number, cacheMisses: number): void {
		const totalFiles = cacheHits + cacheMisses;
		if (totalFiles === 0) {return;}
		
		const hitRate = ((cacheHits / totalFiles) * 100).toFixed(1);
		this.deps.logger.log(`Backend sync: Cache performance - Hits: ${cacheHits}, Misses: ${cacheMisses}, Hit Rate: ${hitRate}%`);
	}

/**
 * Extract token counts from a chat request, preferring actual API-reported counts
 * and falling back to text-based estimation.
 * Handles multiple request formats (pre-Feb 2026, Feb 2026+, VS Code Insiders).
 */
protected extractTokenCountsFromRequest(
req: ChatRequest,
model: string
): { inputTokens: number; outputTokens: number } {
const apiTokens = this.extractApiReportedTokens(req.result);
if (apiTokens) { return apiTokens; }
return this.estimateTokenCountsFromMessage(req, model);
}

protected extractApiReportedTokens(rawResult: unknown): { inputTokens: number; outputTokens: number } | null {
const result = rawResult as ChatRequestResult | null | undefined;
if (result?.usage) {
return {
inputTokens: typeof result.usage.promptTokens === 'number' ? result.usage.promptTokens : 0,
outputTokens: typeof result.usage.completionTokens === 'number' ? result.usage.completionTokens : 0
};
}
if (typeof result?.promptTokens === 'number' && typeof result?.outputTokens === 'number') {
return { inputTokens: result.promptTokens, outputTokens: result.outputTokens };
}
if (result?.metadata && typeof result.metadata.promptTokens === 'number' && typeof result.metadata.outputTokens === 'number') {
return { inputTokens: result.metadata.promptTokens, outputTokens: result.metadata.outputTokens };
}
return null;
}

protected estimateTokenCountsFromMessage(req: ChatRequest, model: string): { inputTokens: number; outputTokens: number } {
let inputTokens = 0;
let outputTokens = 0;
const msgText = (req.message as { text?: string } | undefined)?.text;
if (msgText) {
inputTokens = this.deps.sessionHandlers.estimateTokensFromText(msgText, model);
} else if (req.message?.parts) {
for (const part of req.message.parts) {
if (part?.text) { inputTokens += this.deps.sessionHandlers.estimateTokensFromText(part.text, model); }
}
}
const response = req.response;
if (Array.isArray(response)) {
for (const r of response) {
if (typeof r?.value === 'string') { outputTokens += this.deps.sessionHandlers.estimateTokensFromText(r.value, model); }
}
}
return { inputTokens, outputTokens };
}

/**
 * Process the fallback JSONL content when cached data is unavailable.
 * Handles both VS Code delta-based and Copilot CLI JSONL formats, computing tokens directly.
 */
/**
 * Roll up a JSONL session file.
 *
 * Returns the number of lines that could not be parsed or processed. Zero means
 * the file was read cleanly — which is different from it producing no rollups,
 * since a valid session file can legitimately contain no billable activity.
 */
protected processJsonlSessionFallback(
content: string,
sessionFile: string,
fileMtimeMs: number,
startMs: number,
workspaceId: string,
machineId: string,
userId: string | undefined,
editorForFile: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>
): number {
const isVsCodeFormat = this.detectFallbackFormat(content);
const lines = content.trim().split('\n');
const ctx = { workspaceId, machineId, userId, editorForFile, rollups };
const failedLines = isVsCodeFormat
? this.runVsCodeDeltaFallback(lines, fileMtimeMs, startMs, ctx)
: this.runCliJsonlFallback(lines, fileMtimeMs, startMs, ctx);
if (failedLines > 0) {
this.deps.logger.warn(`Backend sync: ${failedLines} unparseable line(s) in ${sessionFile}`);
}
return failedLines;
}

protected detectFallbackFormat(content: string): boolean {
const firstLine = content.trim().split('\n')[0]?.trim();
if (!firstLine) { return false; }
try {
const firstEv = JSON.parse(firstLine);
return typeof firstEv.kind === 'number';
} catch { return false; }
}

/** Returns the number of lines that could not be parsed or processed. */
protected runVsCodeDeltaFallback(
lines: string[],
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): number {
let defaultModel = 'unknown';
let failedLines = 0;
const seenReqIds = new Set<string>();
for (const line of lines) {
if (!line.trim()) { continue; }
try {
const event = JSON.parse(line);
if (!isEventRecord(event)) { failedLines++; continue; }
defaultModel = this.updateFallbackVsCodeModel(event, defaultModel);
failedLines += this.upsertVsCodeFallbackRequests(event, defaultModel, seenReqIds, fileMtimeMs, startMs, ctx);
} catch { failedLines++; }
}
return failedLines;
}

protected updateFallbackVsCodeModel(event: Record<string, unknown>, defaultModel: string): string {
if (event.kind === 0) {
const mId = this.getFallbackKind0ModelId(event);
if (mId) { return mId.replace(/^copilot\//, ''); }
}
if (event.kind === 2 && Array.isArray(event.k) && event.k[0] === 'selectedModel') {
const v = event.v as DeltaModelPayload | undefined;
const mId = v?.identifier || v?.metadata?.id;
if (mId) { return mId.replace(/^copilot\//, ''); }
}
return defaultModel;
}

protected getFallbackKind0ModelId(event: Record<string, unknown>): string | undefined {
const v = event.v as DeltaModelPayload | undefined;
return v?.selectedModel?.identifier ||
v?.selectedModel?.metadata?.id ||
v?.inputState?.selectedModel?.metadata?.id;
}

protected upsertVsCodeFallbackRequests(
event: Record<string, unknown>,
defaultModel: string,
seenReqIds: Set<string>,
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): number {
const payload = this.readDeltaRequestsPayload(event);
if (payload === 'malformed') { return 1; }
if (payload === 'not-requests') { return 0; }
let failed = 0;
for (const request of payload) {
// Same contract as the cached delta parser: a non-object entry is a record we
// could not read, not an absent one.
if (!isEventRecord(request)) { failed++; continue; }
this.upsertVsCodeFallbackSingleRequest(request, defaultModel, seenReqIds, fileMtimeMs, startMs, ctx);
}
return failed;
}

protected upsertVsCodeFallbackSingleRequest(
request: Record<string, unknown>,
defaultModel: string,
seenReqIds: Set<string>,
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): void {
const req = request as ChatRequest;
const reqId = req.requestId as string | undefined;
if (reqId && seenReqIds.has(reqId)) { return; }
if (reqId) { seenReqIds.add(reqId); }
const normalizedTs = this.utility.normalizeTimestampToMs(typeof req.timestamp !== 'undefined' ? req.timestamp : undefined);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { return; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const rawModel = getRequestModelId(req);
const model = rawModel ? (rawModel as string).replace(/^copilot\//, '') : defaultModel;
const { inputTokens, outputTokens } = this.extractTokenCountsFromRequest(req, model);
if (inputTokens === 0 && outputTokens === 0) { return; }
const key: DailyRollupKey = { day: dayKey, model, workspaceId: ctx.workspaceId, machineId: ctx.machineId, userId: ctx.userId, editor: ctx.editorForFile };
upsertDailyRollup(ctx.rollups, key, { inputTokens, outputTokens, interactions: 1 });
}

/** Returns the number of lines that could not be parsed or processed. */
protected runCliJsonlFallback(
lines: string[],
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): number {
let defaultModel = 'unknown';
let failedLines = 0;
const fusionAuto = isCopilotFusionAutoSession(lines);
for (const line of lines) {
if (!line.trim()) { continue; }
try {
const event = JSON.parse(line);
if (!isEventRecord(event)) { failedLines++; continue; }
defaultModel = resolveCopilotRouterModel(this.updateCliDefaultModel(event, defaultModel), fusionAuto);
const normalizedTs = this.utility.normalizeTimestampToMs(event.timestamp);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { continue; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const model = this.getCliEventModel(event, defaultModel);
const { inputTokens, outputTokens, interactions } = this.getCliEventTokenCounts(event, model);
if (inputTokens === 0 && outputTokens === 0 && interactions === 0) { continue; }
const key: DailyRollupKey = { day: dayKey, model, workspaceId: ctx.workspaceId, machineId: ctx.machineId, userId: ctx.userId, editor: ctx.editorForFile };
upsertDailyRollup(ctx.rollups, key, { inputTokens, outputTokens, interactions });
} catch { failedLines++; }
}
return failedLines;
}

protected updateCliDefaultModel(record: Record<string, unknown>, defaultModel: string): string {
const event = record as CliEvent;
if (event.type === 'session.start' && typeof event.data?.selectedModel === 'string') { return event.data.selectedModel; }
if (event.type === 'session.model_change' && typeof event.data?.newModel === 'string') { return event.data.newModel; }
return defaultModel;
}

protected getCliEventModel(record: Record<string, unknown>, defaultModel: string): string {
const event = record as CliEvent;
return String(event.data?.model || event.model || defaultModel);
}

protected getCliEventTokenCounts(record: Record<string, unknown>, model: string): { inputTokens: number; outputTokens: number; interactions: number } {
const event = record as CliEvent;
if (event.type === 'user.message' && event.data?.content) {
return { inputTokens: this.deps.sessionHandlers.estimateTokensFromText(event.data.content, model), outputTokens: 0, interactions: 1 };
}
if (event.type === 'assistant.message' && event.data?.content) {
return { inputTokens: 0, outputTokens: this.deps.sessionHandlers.estimateTokensFromText(event.data.content, model), interactions: 0 };
}
if (event.type === 'tool.result' && event.data?.output) {
return { inputTokens: this.deps.sessionHandlers.estimateTokensFromText(event.data.output, model), outputTokens: 0, interactions: 0 };
}
return { inputTokens: 0, outputTokens: 0, interactions: 0 };
}

/**
 * Process the fallback JSON content when cached data is unavailable.
 * Handles the VS Code Copilot Chat legacy JSON format.
 *
 * Returns the number of records that could not be parsed or processed: 1 when
 * the file itself is unparseable or is not a JSON object, otherwise one per
 * request that threw while being rolled up. A non-zero result means the file's
 * usage is not fully represented in `rollups`, so an empty scan that includes
 * it must not be reported as a successful no-op.
 */
protected processJsonSessionFallback(
content: string,
sessionFile: string,
fileMtimeMs: number,
startMs: number,
workspaceId: string,
machineId: string,
userId: string | undefined,
editorForFile: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>
): number {
let sessionJson: unknown;
try {
sessionJson = JSON.parse(content);
if (!isEventRecord(sessionJson)) {
this.deps.logger.warn(`Backend sync: session file has invalid JSON structure: ${sessionFile}`);
return 1;
}
} catch (e) {
this.deps.logger.warn(`Backend sync: failed to parse JSON session file ${sessionFile}: ${e}`);
return 1;
}
const sessionObj = sessionJson as Record<string, unknown>;
// This is the catch-all branch for every non-JSONL session file, so a document
// without a `requests` array is one we cannot extract usage from at all. Falling
// back to `[]` reported it as a clean, empty file, which is exactly the "user with
// no data" signal a file we failed to understand must not produce. An empty
// `requests` array is still a genuine empty session and stays successful.
if (!Array.isArray(sessionObj.requests)) {
this.deps.logger.warn(`Backend sync: session file has no "requests" array: ${sessionFile}`);
return 1;
}
const requests = sessionObj.requests as unknown[];
let failedRequests = 0;
for (const request of requests) {
if (!isEventRecord(request)) {
this.deps.logger.warn(`Backend sync: skipping malformed request record in ${sessionFile}`);
failedRequests++;
continue;
}
try {
this.rollUpJsonRequest(request as ChatRequest, sessionObj, { fileMtimeMs, startMs, workspaceId, machineId, userId, editorForFile, rollups });
} catch (e) {
this.deps.logger.warn(`Backend sync: failed to process request in ${sessionFile}: ${e}`);
failedRequests++;
}
}
return failedRequests;
}

/** Fold a single legacy JSON request into `rollups`, skipping it when it falls outside the window or carries no tokens. */
protected rollUpJsonRequest(
req: ChatRequest,
sessionObj: Record<string, unknown>,
ctx: { fileMtimeMs: number; startMs: number; workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): void {
const normalizedTs = this.utility.normalizeTimestampToMs(
typeof req.timestamp !== 'undefined' ? req.timestamp : (sessionObj.lastMessageDate as unknown)
);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : ctx.fileMtimeMs;
if (!eventMs || eventMs < ctx.startMs) { return; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const model = this.deps.sessionHandlers.getModelFromRequest(req);
const { inputTokens, outputTokens } = this.extractTokenCountsFromRequest(req, model);
if (inputTokens === 0 && outputTokens === 0) { return; }
const key: DailyRollupKey = { day: dayKey, model, workspaceId: ctx.workspaceId, machineId: ctx.machineId, userId: ctx.userId, editor: ctx.editorForFile };
upsertDailyRollup(ctx.rollups, key, { inputTokens, outputTokens, interactions: 1 });
}
	/**
	 * Compute daily rollups from local session files.
	 * Uses cached session data when available to avoid re-parsing files.
	 */
	protected async computeDailyRollupsFromLocalSessions(args: { lookbackDays: number; userId?: string; sessionFiles?: string[]; skipMtimeFilter?: boolean; includeEditorDimension?: boolean; collectEditorType?: boolean; onProgress?: (processed: number, total: number, daysFound: number) => void }): Promise<{
		rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;
		workspaceNamesById: Record<string, string>;
		machineNamesById: Record<string, string>;
		editorTypeByFile: Map<string, string>;
		/**
		 * Number of discovered session files that could not be read, parsed or
		 * stat'ed. These failures are logged and skipped, so an empty `rollups`
		 * map on its own cannot tell "the user genuinely has no data" apart from
		 * "the data is there but none of it could be read".
		 */
		filesFailed: number;
	}> {
		const lookbackDays = args.lookbackDays;
		const skipMtimeFilter = args.skipMtimeFilter === true;
		const includeEditorDimension = args.includeEditorDimension === true;
		const collectEditorType = args.collectEditorType === true;
		const onProgress = args.onProgress;
		const userId = (args.userId ?? '').trim() || undefined;
		const now = new Date();
		const start = new Date(now.getTime());
		start.setUTCHours(0, 0, 0, 0);
		start.setUTCDate(start.getUTCDate() - (lookbackDays - 1));
		const startMs = start.getTime();
		const todayKey = this.utility.toUtcDayKey(now);
		const startKey = this.utility.toUtcDayKey(start);
		this.deps.logger.log(`Backend sync: processing sessions from ${startKey} to ${todayKey} (lookback ${lookbackDays} days)`);

		const machineId = this.getMachineId();
		const rollups = new Map<string, { key: DailyRollupKey; value: DailyRollupValue }>();
		const workspaceNamesById: Record<string, string> = {};
		const machineNamesById: Record<string, string> = {};
		const editorTypeByFile = new Map<string, string>();
		const machineName = this.utility.normalizeNameForStorage(this.utility.stripHostnameDomain(os.hostname()));
		if (machineName) { machineNamesById[machineId] = machineName; }

		const sessionFiles = args.sessionFiles ?? await this.deps.sessionHandlers.getCopilotSessionFiles();
		const useCachedData = !!this.deps.sessionHandlers.getSessionFileDataCached;
		const progress = { filesSkipped: 0, filesProcessed: 0, cacheHits: 0, cacheMisses: 0, filesFailed: 0 };
		const totalFiles = sessionFiles.length;
		this.deps.logger.log(`Backend sync: analyzing ${totalFiles} session files`);

		for (const sessionFile of sessionFiles) {
			await this.processOneSessionForRollup(sessionFile, {
				skipMtimeFilter, startMs, now, machineId, userId,
				includeEditorDimension, useCachedData, rollups,
				workspaceNamesById, totalFiles, onProgress, progress,
				editorTypeByFile, collectEditorType
			});
		}

		if (useCachedData) { this.logCachePerformance(progress.cacheHits, progress.cacheMisses); }
		this.deps.logger.log(`Backend sync: processed ${progress.filesProcessed} files, skipped ${progress.filesSkipped} files outside lookback period`);
		if (progress.filesFailed > 0) {
			this.deps.logger.warn(`Backend sync: ${progress.filesFailed} session file(s) could not be read or parsed and were left out of the rollups`);
		}
		return { rollups, workspaceNamesById, machineNamesById, editorTypeByFile, filesFailed: progress.filesFailed };
	}

	protected async tryProcessSpecialSession(
		sessionFile: string, fileMtimeMs: number,
		sessionArgs: SessionRollupArgs,
		isType: (f: string) => boolean,
		process: (f: string, mtime: number, args: SessionRollupArgs) => Promise<boolean>,
		filesSkipped: { count: number },
		filesFailed: { count: number }
	): Promise<boolean> {
		if (!isType(sessionFile)) { return false; }
		try {
			const processed = await process(sessionFile, fileMtimeMs, sessionArgs);
			if (!processed) { filesSkipped.count++; }
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to process session ${sessionFile}: ${e}`);
			filesFailed.count++;
		}
		return true;
	}

	protected async processOneSessionForRollup(
		sessionFile: string,
		ctx: {
			skipMtimeFilter: boolean; startMs: number; now: Date; machineId: string;
			userId: string | undefined; includeEditorDimension: boolean; useCachedData: boolean;
			rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;
			workspaceNamesById: Record<string, string>; totalFiles: number;
			onProgress: ((processed: number, total: number, daysFound: number) => void) | undefined;
			progress: { filesSkipped: number; filesProcessed: number; cacheHits: number; cacheMisses: number; filesFailed: number };
			editorTypeByFile: Map<string, string>;
			collectEditorType: boolean;
		}
	): Promise<void> {
		// Classify the editor type before the lookback filter so that every
		// discovered file — including ones older than the lookback window —
		// gets an entry in the blob-upload map when the editor type can be
		// determined.  The upload list is the full discovery list, not just
		// files within the lookback.
		// When includeEditorDimension is true the rollup itself needs the
		// label, so classify unconditionally.  When it is false, only
		// classify when the blob upload needs the map, to avoid blocking
		// I/O on every table-only sync.
		const needsClassification = ctx.includeEditorDimension || ctx.collectEditorType;
		const editorForFile = needsClassification ? this.getEditorForFile(sessionFile, true) : undefined;
		if (editorForFile) { ctx.editorTypeByFile.set(sessionFile, editorForFile); }

		const fileMtimeMs = await this.statSessionFileForRollup(sessionFile, ctx);
		if (fileMtimeMs === undefined) { return; }
		const editorForRollup = ctx.includeEditorDimension ? editorForFile : undefined;
		if (this.isVSSessionFileType(sessionFile)) { ctx.progress.filesSkipped++; return; }
		const sessionArgs = this.makeSessionRollupArgs(ctx.machineId, ctx.userId, editorForRollup, ctx.workspaceNamesById, ctx.rollups, ctx.startMs);
		const skipped = { count: 0 };
		const failed = { count: 0 };
		if (await this.tryProcessSpecialSession(sessionFile, fileMtimeMs, sessionArgs, this.isOpenCodeSessionType.bind(this), this.processOpenCodeSession.bind(this), skipped, failed)) { ctx.progress.filesSkipped += skipped.count; ctx.progress.filesFailed += failed.count; return; }
		if (await this.tryProcessSpecialSession(sessionFile, fileMtimeMs, sessionArgs, this.isCrushSessionType.bind(this), this.processCrushSession.bind(this), skipped, failed)) { ctx.progress.filesSkipped += skipped.count; ctx.progress.filesFailed += failed.count; return; }
		const workspaceId = this.utility.extractWorkspaceIdFromSessionPath(sessionFile);
		await this.ensureWorkspaceNameResolved(workspaceId, sessionFile, ctx.workspaceNamesById);
		if (ctx.useCachedData) {
			const fileStat = await this.deps.sessionHandlers.statSessionFile(sessionFile);
			const cacheSuccess = await this.processCachedSessionFile(sessionFile, fileMtimeMs, fileStat.size, workspaceId, ctx.machineId, ctx.userId, ctx.rollups, ctx.startMs, ctx.now, editorForRollup);
			if (cacheSuccess) { ctx.progress.cacheHits++; return; }
			ctx.progress.cacheMisses++;
		}
		let content: string;
		try {
			content = await fs.promises.readFile(sessionFile, 'utf8');
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to read session file ${sessionFile}: ${e}`);
			ctx.progress.filesFailed++;
			return;
		}
		this.runContentFallback(content, sessionFile, fileMtimeMs, workspaceId, editorForRollup, ctx);
	}

	/**
	 * Roll a session file up from its raw contents, counting a file whose contents
	 * could not be parsed towards `filesFailed` so that an empty scan can be told
	 * apart from a failed one.
	 */
	protected runContentFallback(
		content: string,
		sessionFile: string,
		fileMtimeMs: number,
		workspaceId: string,
		editorForRollup: string | undefined,
		ctx: {
			startMs: number; machineId: string; userId: string | undefined;
			rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;
			progress: { filesFailed: number };
		}
	): void {
		if (sessionFile.endsWith('.jsonl') || isJsonlContent(content)) {
			if (this.processJsonlSessionFallback(content, sessionFile, fileMtimeMs, ctx.startMs, workspaceId, ctx.machineId, ctx.userId, editorForRollup, ctx.rollups) > 0) {
				ctx.progress.filesFailed++;
			}
			return;
		}
		if (this.processJsonSessionFallback(content, sessionFile, fileMtimeMs, ctx.startMs, workspaceId, ctx.machineId, ctx.userId, editorForRollup, ctx.rollups) > 0) {
			ctx.progress.filesFailed++;
		}
	}

	protected async statSessionFileForRollup(
		sessionFile: string,
		ctx: {
			skipMtimeFilter: boolean; startMs: number; totalFiles: number;
			onProgress: ((processed: number, total: number, daysFound: number) => void) | undefined;
			rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;
			progress: { filesSkipped: number; filesProcessed: number; cacheHits: number; cacheMisses: number; filesFailed: number };
		}
	): Promise<number | undefined> {
		try {
			const fileStat = await this.deps.sessionHandlers.statSessionFile(sessionFile);
			const fileMtimeMs = fileStat.mtimeMs;
			if (!ctx.skipMtimeFilter && fileMtimeMs < ctx.startMs) { ctx.progress.filesSkipped++; return undefined; }
			ctx.progress.filesProcessed++;
			if (ctx.onProgress && ctx.progress.filesProcessed % 10 === 0) {
				const daysFound = new Set(Array.from(ctx.rollups.values()).map(r => r.key.day)).size;
				ctx.onProgress(ctx.progress.filesProcessed, ctx.totalFiles, daysFound);
			}
			return fileMtimeMs;
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to stat session file ${sessionFile}: ${e}`);
			ctx.progress.filesFailed++;
			return undefined;
		}
	}

	protected getEditorForFile(sessionFile: string, includeEditorDimension: boolean): string | undefined {
		if (!includeEditorDimension) { return undefined; }
		const label = this.deps.getEditorLabel?.(sessionFile) ??
			getEditorTypeFromPath(sessionFile, this.deps.editorHandlers?.isOpenCodeSession);
		// Break out "Copilot App" and "Claude (VS Code)" from the coarser path-based label so
		// the sharing-server "Editors Used" breakdown matches the local Interaction Modes view.
		return refineEditorLabelForInteractionModeSplit(sessionFile, label);
	}

	protected isVSSessionFileType(sessionFile: string): boolean {
		return !!(this.deps.editorHandlers?.isVSSessionFile?.(sessionFile));
	}

	protected isOpenCodeSessionType(sessionFile: string): boolean {
		return !!(this.deps.editorHandlers?.isOpenCodeSession?.(sessionFile));
	}

	protected isCrushSessionType(sessionFile: string): boolean {
		return !!(this.deps.editorHandlers?.isCrushSession?.(sessionFile));
	}
}

/**
 * The per-tool / per-server latency histograms (`latencyByTool`, `latencyByServer`,
 * ~25 integers per key — docs/adr/TOOL-EXECUTION-STATS.md) are a local-dashboard
 * feature and nothing server-side reads them, while an Azure Table string
 * property is capped at 64 KiB and a day's rollup keeps the union of every tool
 * seen. Drop them from the uploaded JSON so the payload stays bounded by the
 * number of distinct tools times a few counters; the count maps are kept.
 */
export function stripLatencyHistograms<T extends object>(usage: T): Omit<T, 'latencyByTool' | 'latencyByServer'> {
	const { latencyByTool: _lt, latencyByServer: _ls, ...rest } = usage as T & { latencyByTool?: unknown; latencyByServer?: unknown };
	return rest;
}
