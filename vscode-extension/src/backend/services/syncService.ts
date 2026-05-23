/**
 * Sync service for backend facade.
 * Handles background sync, timer management, and daily rollup computation.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { DefaultAzureCredential } from '@azure/identity';
import { safeStringifyError } from '../../utils/errors';
import type { DailyRollupKey } from '../rollups';
import { upsertDailyRollup } from '../rollups';
import type { BackendSettings } from '../settings';
import { BACKEND_SYNC_MIN_INTERVAL_MS } from '../constants';
import type { DailyRollupValue, ChatRequest, SessionFileCache, ModelUsage } from '../types';
import { resolveUserIdentityForSync, type BackendUserIdentityMode } from '../identity';
import { computeBackendSharingPolicy, hashMachineIdForTeam, hashWorkspaceIdForTeam } from '../sharingProfile';
import { createDailyAggEntity, type BackendAggDailyEntityLike } from '../storageTables';
import { CredentialService } from './credentialService';
import { DataPlaneService } from './dataPlaneService';
import { BackendUtility } from './utilityService';
import { SharingServerUploadService, type SharingServerEntry } from './sharingServerUploadService';
import { SyncLock } from './syncLock';
import { type IBlobUploadService } from './blobUploadService';
import { isJsonlContent } from '../../tokenEstimation';
import { getEditorTypeFromPath } from '../../workspaceHelpers';

/** Ecosystem session per-model usage entry (input, output, optional interactions). */
type ModelUsageEntry = { inputTokens: number; outputTokens: number; interactions?: number };

/**
 * Pure consent-timestamp parser — no side effects.
 * Returns a `Date` when `raw` represents a valid, non-future timestamp,
 * or an `Error` describing why the value is invalid.
 * The caller is responsible for any logging based on the result.
 */
export function parseConsentTimestamp(raw: unknown): Date | Error {
	const ts = (raw === null || raw === undefined) ? '' : String(raw);
	if (!ts) {
		return new Error('no consent timestamp provided');
	}
	try {
		const parsed = new Date(ts);
		if (isNaN(parsed.getTime())) {
			return new Error(`Invalid consent timestamp (not a valid date): "${ts}"`);
		}
		if (parsed.getTime() > Date.now()) {
			return new Error(`Invalid consent timestamp (future date): "${ts}" (parsed: ${parsed.toISOString()})`);
		}
		return parsed;
	} catch (e) {
		return new Error(`Failed to parse consent timestamp: "${ts}", error: ${e}`);
	}
}

/**
 * Validate and normalize consent timestamp.
 * Returns ISO string if valid, undefined if invalid or in the future.
 * Delegates parsing to {@link parseConsentTimestamp} and logs any error via the optional logger.
 */
function validateConsentTimestamp(ts: string | undefined, logger?: (msg: string) => void): string | undefined {
	if (!ts) {
		return undefined;
	}
	const result = parseConsentTimestamp(ts);
	if (result instanceof Error) {
		logger?.(result.message);
		return undefined;
	}
	return result.toISOString();
}

/** Logger callbacks for the sync service. */
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

export interface SyncServiceDeps {
	context: vscode.ExtensionContext | undefined;
	logger: SyncServiceLogger;
	sessionHandlers: SyncServiceSessionHandlers;
	editorHandlers?: SyncServiceEditorHandlers;
	/** UI refresh callback after successful sync. */
	updateTokenStats?: () => Promise<void>;
	/** Returns the current GitHub OAuth access token, or undefined if not authenticated. */
	getGithubToken?: () => string | undefined;
}

/**
 * SyncService manages background synchronization of local session data to the backend.
 */
export class SyncService {
	private backendSyncInProgress = false;
	private syncQueue = Promise.resolve();
	private backendSyncInterval: NodeJS.Timeout | undefined;
	private consecutiveFailures = 0;
	private readonly MAX_CONSECUTIVE_FAILURES = 5;
	private readonly syncLock: SyncLock;

	constructor(
		private readonly deps: SyncServiceDeps,
		private readonly credentialService: CredentialService,
		private readonly dataPlaneService: DataPlaneService,
		private readonly blobUploadService: IBlobUploadService | undefined,
		private readonly utility: typeof BackendUtility,
		private readonly sharingServerUploadService: SharingServerUploadService | undefined,
	) {
		this.syncLock = new SyncLock(
			deps.context,
			deps.logger.log.bind(deps.logger),
			deps.logger.warn.bind(deps.logger),
		);
	}

	// ── Cross-instance file lock ────────────────────────────────────────

	/**
	 * Try to acquire an exclusive file lock so only one VS Code window
	 * can run a backend sync at a time.
	 *
	 * If the existing lock was written by an instance configured against a
	 * *different* server URL, the lock does not apply — both instances are
	 * syncing to independent endpoints and should not block each other.
	 */
	private async acquireSyncLock(backend?: string, serverUrl?: string): Promise<boolean> {
		return this.syncLock.acquire(backend, serverUrl);
	}

	/**
	 * Release the sync lock, but only if we own it.
	 */
	private async releaseSyncLock(backend?: string): Promise<void> {
		return this.syncLock.release(backend);
	}

	/**
	 * Start the background sync timer if backend is enabled.
	 * @param settings - Backend settings to check if sync should be enabled
	 * @param isConfigured - Whether the backend is fully configured
	 */
	startTimerIfEnabled(settings: BackendSettings, isConfigured: boolean): void {
		try {
			this.stopTimer();
			const sharingPolicy = computeBackendSharingPolicy({
				enabled: settings.enabled,
				profile: settings.sharingProfile,
				shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames
			});
			if (!sharingPolicy.allowCloudSync || !isConfigured) {
				if (!sharingPolicy.allowCloudSync) {
					this.deps.logger.log(`Backend sync: not starting timer (cloud sync disabled, profile: ${settings.sharingProfile})`);
				} else if (!isConfigured) {
					this.deps.logger.log('Backend sync: not starting timer (backend not configured)');
				}
				return;
			}
			const intervalMs = BACKEND_SYNC_MIN_INTERVAL_MS;
			this.deps.logger.log(`Backend sync: starting timer with interval ${intervalMs}ms (${intervalMs / 60000} minutes)`);
			this.backendSyncInterval = setInterval(() => {
				this.syncToBackendStore(false, settings, isConfigured).catch((e) => {
					this.deps.logger.warn(`Backend sync timer failed: ${e?.message ?? e}`);
					this.consecutiveFailures++;
					
					// Show user-facing warning after first few failures
					if (this.consecutiveFailures === 3) {
						vscode.window.showWarningMessage(
							'Backend sync is experiencing issues. Check the output panel for details.',
							'Show Output'
						).then(choice => {
							if (choice === 'Show Output') {
								// User can manually open output panel via command palette
							}
						});
					}
					
					if (this.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
						this.deps.logger.warn(`Backend sync: stopping timer after ${this.MAX_CONSECUTIVE_FAILURES} consecutive failures`);
						vscode.window.showErrorMessage(
							'Backend sync stopped after repeated failures. Check your Azure configuration.',
							'Configure Backend'
						).then(choice => {
							if (choice === 'Configure Backend') {
								vscode.commands.executeCommand('aiEngineeringFluency.configureBackend');
							}
						});
						this.stopTimer();
					}
				});
			}, intervalMs);
			// Immediate initial sync (forced to ensure settings changes take effect)
			this.syncToBackendStore(true, settings, isConfigured).catch((e) => {
				this.deps.logger.warn(`Backend sync initial sync failed: ${e?.message ?? e}`);
			});
		} catch (e) {
			this.deps.logger.warn(`Backend sync timer setup failed: ${e}`);
		}
	}

	/**
	 * Stop the background sync timer.
	 */
	stopTimer(): void {
		if (this.backendSyncInterval) {
			clearInterval(this.backendSyncInterval);
			this.backendSyncInterval = undefined;
			this.consecutiveFailures = 0;
		}
	}

	/**
	 * Dispose the sync service.
	 */
	dispose(): void {
		this.stopTimer();
	}

	/**
	 * Get the current sync queue promise (for testing).
	 */
	getSyncQueue(): Promise<void> {
		return this.syncQueue;
	}


/** Arguments shared across per-session rollup helper methods. */
private makeSessionRollupArgs(
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
private buildDayModelInteractionsFromCliJsonl(
content: string,
sessionFile: string,
fileMtimeMs: number,
startMs: number,
now: Date
): Map<string, Map<string, number>> {
const dayModelInteractions = new Map<string, Map<string, number>>();
const lines = content.trim().split('\n');
const todayKey = this.utility.toUtcDayKey(now);
let lineCount = 0;
let processedLines = 0;
for (const line of lines) {
lineCount++;
if (!line.trim()) { continue; }
processedLines = this.processCliJsonlLine(line, fileMtimeMs, startMs, todayKey, sessionFile, lineCount, processedLines, dayModelInteractions);
}
return dayModelInteractions;
}

private processCliJsonlLine(
line: string,
fileMtimeMs: number,
startMs: number,
todayKey: string,
sessionFile: string,
lineCount: number,
processedLines: number,
dayModelInteractions: Map<string, Map<string, number>>
): number {
try {
const event = JSON.parse(line);
if (!event || typeof event !== 'object') { return processedLines; }
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
// skip malformed line
}
return processedLines;
}

/**
 * Build day→model interaction counts from VS Code delta-based JSONL format.
 * Handles kind:0/1/2 events with per-request deduplication.
 */
private buildDayModelInteractionsFromDeltaJsonl(
content: string,
fileMtimeMs: number,
startMs: number
): Map<string, Map<string, number>> {
const dayModelInteractions = new Map<string, Map<string, number>>();
let defaultModel = 'unknown';
const seenRequestIds = new Set<string>();
const lines = content.trim().split('\n');
for (const line of lines) {
if (!line.trim()) { continue; }
try {
const event = JSON.parse(line);
if (!event || typeof event !== 'object') { continue; }
defaultModel = this.updateDeltaDefaultModel(event, defaultModel);
if (event.kind === 2 && Array.isArray(event.k) && event.k[0] === 'requests' && Array.isArray(event.v)) {
this.processDeltaRequests(event.v, defaultModel, seenRequestIds, fileMtimeMs, startMs, dayModelInteractions);
}
} catch {
// skip malformed lines
}
}
return dayModelInteractions;
}

private updateDeltaDefaultModel(event: any, defaultModel: string): string {
if (event.kind === 0) {
const modelId = this.extractModelIdFromKind0Event(event);
if (modelId) { return (modelId as string).replace(/^copilot\//, ''); }
}
if (event.kind === 2 && Array.isArray(event.k) && event.k[0] === 'selectedModel') {
const modelId = this.extractModelIdFromSelectedModelEvent(event);
if (modelId) { return (modelId as string).replace(/^copilot\//, ''); }
}
return defaultModel;
}

private extractModelIdFromKind0Event(event: any): string | undefined {
return event.v?.selectedModel?.identifier ||
event.v?.selectedModel?.metadata?.id ||
event.v?.inputState?.selectedModel?.metadata?.id;
}

private extractModelIdFromSelectedModelEvent(event: any): string | undefined {
return event.v?.identifier || event.v?.metadata?.id;
}

private processDeltaRequests(
requests: any[],
defaultModel: string,
seenRequestIds: Set<string>,
fileMtimeMs: number,
startMs: number,
dayModelInteractions: Map<string, Map<string, number>>
): void {
for (const request of requests) {
const req = request as ChatRequest;
const reqId = (req as any).requestId as string | undefined;
if (reqId && seenRequestIds.has(reqId)) { continue; }
if (reqId) { seenRequestIds.add(reqId); }
const normalizedTs = this.utility.normalizeTimestampToMs(req.timestamp);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { continue; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const rawModel = (req as any).modelId || (req as any).result?.metadata?.modelId;
const model = rawModel ? (rawModel as string).replace(/^copilot\//, '') : defaultModel;
if (!dayModelInteractions.has(dayKey)) { dayModelInteractions.set(dayKey, new Map()); }
const dayMap = dayModelInteractions.get(dayKey)!;
dayMap.set(model, (dayMap.get(model) ?? 0) + 1);
}
}

/**
 * Build day→model interaction counts from regular JSON session format.
 * Returns null if JSON parsing fails (logs a warning internally).
 */
private buildDayModelInteractionsFromJson(
content: string,
fileMtimeMs: number,
startMs: number,
sessionFile: string
): Map<string, Map<string, number>> | null {
try {
const sessionJson = JSON.parse(content);
if (!sessionJson || typeof sessionJson !== 'object') {
return null;
}
const sessionObj = sessionJson as Record<string, unknown>;
const requests = Array.isArray(sessionObj.requests) ? (sessionObj.requests as unknown[]) : [];
const dayModelInteractions = new Map<string, Map<string, number>>();
for (const request of requests) {
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

private redistributeToMappedModels(
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
private remapUnmappedModels(
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
private buildRollupsFromDayModelInteractions(
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

private processModelInteractionsForDay(
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
private async processOpenCodeSession(
sessionFile: string,
fileMtimeMs: number,
args: { machineId: string; userId: string | undefined; editorForFile: string | undefined; workspaceNamesById: Record<string, string>; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>; startMs: number }
): Promise<boolean> {
if (!this.deps.editorHandlers?.getOpenCodeSessionData) { return false; }
const getOpenCodeSessionData = this.deps.editorHandlers.getOpenCodeSessionData;
const data = await getOpenCodeSessionData(sessionFile);
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
 * Process a Crush session file and add its data to the rollups map.
 * Returns false if outside the lookback window or no handler is registered.
 * Throws on data retrieval errors (caller should catch and log).
 */
private async processCrushSession(
sessionFile: string,
fileMtimeMs: number,
args: { machineId: string; userId: string | undefined; editorForFile: string | undefined; workspaceNamesById: Record<string, string>; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>; startMs: number }
): Promise<boolean> {
if (!this.deps.editorHandlers?.getCrushSessionData) { return false; }
const getCrushSessionData = this.deps.editorHandlers.getCrushSessionData;
const data = await getCrushSessionData(sessionFile);
const eventMs = data.timestamp || fileMtimeMs;
if (!eventMs || eventMs < args.startMs) { return false; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
// Crush paths: <project>/.crush/crush.db#<id>  — no workspaceStorage segment
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
private async processCachedSessionFile(
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

private validateCachedData(cachedData: any, sessionFile: string): boolean {
if (!cachedData || typeof cachedData !== 'object') {
this.deps.logger.warn(`Backend sync: invalid cached data structure for ${sessionFile}`);
return false;
}
if (typeof cachedData.modelUsage !== 'object' || cachedData.modelUsage === null) {
this.deps.logger.warn(`Backend sync: invalid modelUsage in cached data for ${sessionFile}`);
return false;
}
if (!Number.isFinite(cachedData.interactions) || cachedData.interactions < 0) {
this.deps.logger.warn(`Backend sync: invalid interactions count in cached data for ${sessionFile}`);
return false;
}
return true;
}

private processDailyRollupsFastPath(
cachedData: any,
workspaceId: string,
machineId: string,
userId: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
editor: string | undefined,
startMs: number
): boolean {
const totalSessionInteractions = cachedData.interactions || 1;
const dayKeys = Object.keys(cachedData.dailyRollups).sort();
for (const dayKey of dayKeys) {
const dayEntry = cachedData.dailyRollups[dayKey];
const dayStartMs = new Date(dayKey + 'T00:00:00Z').getTime();
if (dayStartMs < startMs) { continue; }
this.processDailyRollupsDayEntry(dayKey, dayEntry, totalSessionInteractions, cachedData, workspaceId, machineId, userId, rollups, editor);
}
if (dayKeys.length > 1) {
this.deps.logger.log(`Backend sync: file spans ${dayKeys.length} days (dailyRollups fast path): ${dayKeys.join(', ')}`);
}
return true;
}

private processDailyRollupsDayEntry(
dayKey: string,
dayEntry: any,
totalSessionInteractions: number,
cachedData: any,
workspaceId: string,
machineId: string,
userId: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
editor: string | undefined
): void {
const modelEntries = Object.entries<any>(dayEntry.modelUsage).filter(([, mu]) =>
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

private buildDayModelInteractionMap(
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
	private extractFluencyMetricsFromCache(cachedData: any, ratio: number = 1): any {
		if (!cachedData.usageAnalysis) { return undefined; }
		const analysis = cachedData.usageAnalysis;
		const fluencyMetrics: any = {
			...this.extractModeUsageFluency(analysis, ratio),
			...this.extractJsonFieldsFluency(analysis),
			...this.extractEditScopeFluency(analysis),
			...this.extractRepositoriesFluency(analysis),
			...this.extractActivityFluency(analysis),
			sessionCount: 1
		};
		return Object.keys(fluencyMetrics).length > 0 ? fluencyMetrics : undefined;
	}

	private extractModeUsageFluency(analysis: any, ratio: number): any {
		if (!analysis.modeUsage) { return {}; }
		return {
			askModeCount: Math.round((analysis.modeUsage.ask || 0) * ratio),
			editModeCount: Math.round((analysis.modeUsage.edit || 0) * ratio),
			agentModeCount: Math.round((analysis.modeUsage.agent || 0) * ratio),
			planModeCount: Math.round((analysis.modeUsage.plan || 0) * ratio),
			customAgentModeCount: Math.round((analysis.modeUsage.customAgent || 0) * ratio),
			cliModeCount: Math.round((analysis.modeUsage.cli || 0) * ratio)
		};
	}

	private extractJsonFieldsFluency(analysis: any): any {
		const result: any = {};
		if (analysis.toolCalls) { result.toolCallsJson = JSON.stringify(analysis.toolCalls); }
		if (analysis.contextReferences) { result.contextRefsJson = JSON.stringify(analysis.contextReferences); }
		if (analysis.mcpTools) { result.mcpToolsJson = JSON.stringify(analysis.mcpTools); }
		if (analysis.modelSwitching) { result.modelSwitchingJson = JSON.stringify(analysis.modelSwitching); }
		if (analysis.agentTypes) { result.agentTypesJson = JSON.stringify(analysis.agentTypes); }
		if (analysis.sessionDuration) { result.sessionDurationJson = JSON.stringify(analysis.sessionDuration); }
		return result;
	}

	private extractEditScopeFluency(analysis: any): any {
		if (!analysis.editScope) { return {}; }
		return {
			editScopeJson: JSON.stringify(analysis.editScope),
			multiFileEdits: analysis.editScope.multiFileEdits || 0,
			avgFilesPerEdit: analysis.editScope.avgFilesPerSession || 0
		};
	}

	private extractRepositoriesFluency(analysis: any): any {
		if (!analysis.repositories && !analysis.repositoriesWithCustomization) { return {}; }
		const repoData = {
			repositories: analysis.repositories || [],
			repositoriesWithCustomization: analysis.repositoriesWithCustomization || []
		};
		const result: any = { repositoriesJson: JSON.stringify(repoData) };
		const totalRepos = (analysis.repositories || []).length;
		const customizedRepos = (analysis.repositoriesWithCustomization || []).length;
		if (totalRepos > 0) { result.repoCustomizationRate = customizedRepos / totalRepos; }
		return result;
	}

	private extractActivityFluency(analysis: any): any {
		const result: any = {};
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
	private async ensureWorkspaceNameResolved(
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
	private logCachePerformance(cacheHits: number, cacheMisses: number): void {
		const totalFiles = cacheHits + cacheMisses;
		if (totalFiles === 0) {return;}
		
		const hitRate = ((cacheHits / totalFiles) * 100).toFixed(1);
		this.deps.logger.log(`Backend sync: Cache performance - Hits: ${cacheHits}, Misses: ${cacheMisses}, Hit Rate: ${hitRate}%`);
	}

	/**
	 * Resolve the effective user identity for sync.
	 */
	private async resolveEffectiveUserIdentityForSync(settings: BackendSettings, includeUserDimension: boolean): Promise<{ userId?: string; userKeyType?: BackendUserIdentityMode }> {
		let accessTokenForClaims: string | undefined;
		if (includeUserDimension && settings.userIdentityMode === 'pseudonymous' && settings.authMode === 'entraId') {
			try {
				const token = await new DefaultAzureCredential().getToken('https://storage.azure.com/.default');
				accessTokenForClaims = token?.token;
			} catch {
				// Best-effort only: fall back to omitting user dimension.
			}
		}

		const resolved = resolveUserIdentityForSync({
			shareWithTeam: includeUserDimension,
			userIdentityMode: settings.userIdentityMode,
			configuredUserId: settings.userId,
			datasetId: settings.datasetId,
			accessTokenForClaims
		});
		
		// Warn if user dimension was requested but identity resolution failed
		if (includeUserDimension && !resolved.userId) {
			if (settings.userIdentityMode === 'teamAlias') {
				const { validateTeamAlias } = await import('../identity.js');
				const validation = validateTeamAlias(settings.userId);
				if (!validation.valid) {
					this.deps.logger.warn(`⚠ Backend sync: User identity validation failed. Data will be synced WITHOUT user dimension.`);
					this.deps.logger.warn(`   Reason: ${validation.error}`);
					this.deps.logger.warn(`   Fix: Update "AI Engineering Fluency: Backend User Id" in settings to a valid team alias.`);
				}
			} else {
				this.deps.logger.warn(`⚠ Backend sync: Could not resolve user identity for mode ${settings.userIdentityMode}. Data will be synced WITHOUT user dimension.`);
			}
		}
		
		return resolved;
	}


/**
 * Extract token counts from a chat request, preferring actual API-reported counts
 * and falling back to text-based estimation.
 * Handles multiple request formats (pre-Feb 2026, Feb 2026+, VS Code Insiders).
 */
private extractTokenCountsFromRequest(
req: ChatRequest,
model: string
): { inputTokens: number; outputTokens: number } {
const apiTokens = this.extractApiReportedTokens((req as any).result);
if (apiTokens) { return apiTokens; }
return this.estimateTokenCountsFromMessage(req, model);
}

private extractApiReportedTokens(result: any): { inputTokens: number; outputTokens: number } | null {
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

private estimateTokenCountsFromMessage(req: ChatRequest, model: string): { inputTokens: number; outputTokens: number } {
let inputTokens = 0;
let outputTokens = 0;
const msgText = (req as any).message?.text;
if (msgText) {
inputTokens = this.deps.sessionHandlers.estimateTokensFromText(msgText, model);
} else if (req.message?.parts) {
for (const part of req.message.parts) {
if (part?.text) { inputTokens += this.deps.sessionHandlers.estimateTokensFromText(part.text, model); }
}
}
const response = (req as any).response ?? req.response;
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
private processJsonlSessionFallback(
content: string,
sessionFile: string,
fileMtimeMs: number,
startMs: number,
workspaceId: string,
machineId: string,
userId: string | undefined,
editorForFile: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>
): void {
const isVsCodeFormat = this.detectFallbackFormat(content);
const lines = content.trim().split('\n');
const ctx = { workspaceId, machineId, userId, editorForFile, rollups };
if (isVsCodeFormat) {
this.runVsCodeDeltaFallback(lines, fileMtimeMs, startMs, ctx);
} else {
this.runCliJsonlFallback(lines, fileMtimeMs, startMs, ctx);
}
}

private detectFallbackFormat(content: string): boolean {
const firstLine = content.trim().split('\n')[0]?.trim();
if (!firstLine) { return false; }
try {
const firstEv = JSON.parse(firstLine);
return typeof firstEv.kind === 'number';
} catch { return false; }
}

private runVsCodeDeltaFallback(
lines: string[],
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): void {
let defaultModel = 'unknown';
const seenReqIds = new Set<string>();
for (const line of lines) {
if (!line.trim()) { continue; }
try {
const event = JSON.parse(line);
if (!event || typeof event !== 'object') { continue; }
defaultModel = this.updateFallbackVsCodeModel(event, defaultModel);
this.upsertVsCodeFallbackRequests(event, defaultModel, seenReqIds, fileMtimeMs, startMs, ctx);
} catch { /* skip */ }
}
}

private updateFallbackVsCodeModel(event: any, defaultModel: string): string {
if (event.kind === 0) {
const mId = this.getFallbackKind0ModelId(event);
if (mId) { return mId.replace(/^copilot\//, ''); }
}
if (event.kind === 2 && Array.isArray(event.k) && event.k[0] === 'selectedModel') {
const mId = event.v?.identifier || event.v?.metadata?.id;
if (mId) { return mId.replace(/^copilot\//, ''); }
}
return defaultModel;
}

private getFallbackKind0ModelId(event: any): string | undefined {
return event.v?.selectedModel?.identifier ||
event.v?.selectedModel?.metadata?.id ||
event.v?.inputState?.selectedModel?.metadata?.id;
}

private upsertVsCodeFallbackRequests(
event: any,
defaultModel: string,
seenReqIds: Set<string>,
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): void {
if (event.kind !== 2 || !Array.isArray(event.k) || event.k[0] !== 'requests' || !Array.isArray(event.v)) { return; }
for (const request of event.v) {
this.upsertVsCodeFallbackSingleRequest(request, defaultModel, seenReqIds, fileMtimeMs, startMs, ctx);
}
}

private upsertVsCodeFallbackSingleRequest(
request: any,
defaultModel: string,
seenReqIds: Set<string>,
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): void {
const req = request as ChatRequest;
const reqId = (req as any).requestId as string | undefined;
if (reqId && seenReqIds.has(reqId)) { return; }
if (reqId) { seenReqIds.add(reqId); }
const normalizedTs = this.utility.normalizeTimestampToMs(typeof req.timestamp !== 'undefined' ? req.timestamp : undefined);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { return; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const rawModel = (req as any).modelId || (req as any).result?.metadata?.modelId;
const model = rawModel ? (rawModel as string).replace(/^copilot\//, '') : defaultModel;
const { inputTokens, outputTokens } = this.extractTokenCountsFromRequest(req, model);
if (inputTokens === 0 && outputTokens === 0) { return; }
const key: DailyRollupKey = { day: dayKey, model, workspaceId: ctx.workspaceId, machineId: ctx.machineId, userId: ctx.userId, editor: ctx.editorForFile };
upsertDailyRollup(ctx.rollups, key, { inputTokens, outputTokens, interactions: 1 });
}

private runCliJsonlFallback(
lines: string[],
fileMtimeMs: number,
startMs: number,
ctx: { workspaceId: string; machineId: string; userId: string | undefined; editorForFile: string | undefined; rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }> }
): void {
let defaultModel = 'unknown';
for (const line of lines) {
if (!line.trim()) { continue; }
try {
const event = JSON.parse(line);
if (!event || typeof event !== 'object') { continue; }
defaultModel = this.updateCliDefaultModel(event, defaultModel);
const normalizedTs = this.utility.normalizeTimestampToMs(event.timestamp);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { continue; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const model = this.getCliEventModel(event, defaultModel);
const { inputTokens, outputTokens, interactions } = this.getCliEventTokenCounts(event, model);
if (inputTokens === 0 && outputTokens === 0 && interactions === 0) { continue; }
const key: DailyRollupKey = { day: dayKey, model, workspaceId: ctx.workspaceId, machineId: ctx.machineId, userId: ctx.userId, editor: ctx.editorForFile };
upsertDailyRollup(ctx.rollups, key, { inputTokens, outputTokens, interactions });
} catch { /* skip */ }
}
}

private updateCliDefaultModel(event: any, defaultModel: string): string {
if (event.type === 'session.start' && typeof event.data?.selectedModel === 'string') { return event.data.selectedModel; }
if (event.type === 'session.model_change' && typeof event.data?.newModel === 'string') { return event.data.newModel; }
return defaultModel;
}

private getCliEventModel(event: any, defaultModel: string): string {
return (event.data?.model || event.model || defaultModel).toString();
}

private getCliEventTokenCounts(event: any, model: string): { inputTokens: number; outputTokens: number; interactions: number } {
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
 * Returns false if the JSON cannot be parsed (a warning is logged internally).
 */
private processJsonSessionFallback(
content: string,
sessionFile: string,
fileMtimeMs: number,
startMs: number,
workspaceId: string,
machineId: string,
userId: string | undefined,
editorForFile: string | undefined,
rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>
): boolean {
let sessionJson: unknown;
try {
sessionJson = JSON.parse(content);
if (!sessionJson || typeof sessionJson !== 'object') {
this.deps.logger.warn(`Backend sync: session file has invalid JSON structure: ${sessionFile}`);
return false;
}
} catch (e) {
this.deps.logger.warn(`Backend sync: failed to parse JSON session file ${sessionFile}: ${e}`);
return false;
}
const sessionObj = sessionJson as Record<string, unknown>;
const requests = Array.isArray(sessionObj.requests) ? (sessionObj.requests as unknown[]) : [];
for (const request of requests) {
try {
const req = request as ChatRequest;
const normalizedTs = this.utility.normalizeTimestampToMs(
typeof req.timestamp !== 'undefined' ? req.timestamp : (sessionObj.lastMessageDate as unknown)
);
const eventMs = Number.isFinite(normalizedTs) ? normalizedTs : fileMtimeMs;
if (!eventMs || eventMs < startMs) { continue; }
const dayKey = this.utility.toUtcDayKey(new Date(eventMs));
const model = this.deps.sessionHandlers.getModelFromRequest(req);
const { inputTokens, outputTokens } = this.extractTokenCountsFromRequest(req, model);
if (inputTokens === 0 && outputTokens === 0) { continue; }
const key: DailyRollupKey = { day: dayKey, model, workspaceId, machineId, userId, editor: editorForFile };
upsertDailyRollup(rollups, key, { inputTokens, outputTokens, interactions: 1 });
} catch (e) {
this.deps.logger.warn(`Backend sync: failed to process request in ${sessionFile}: ${e}`);
}
}
return true;
}
	/**
	 * Compute daily rollups from local session files.
	 * Uses cached session data when available to avoid re-parsing files.
	 */
	private async computeDailyRollupsFromLocalSessions(args: { lookbackDays: number; userId?: string; sessionFiles?: string[]; skipMtimeFilter?: boolean; includeEditorDimension?: boolean; onProgress?: (processed: number, total: number, daysFound: number) => void }): Promise<{
		rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;
		workspaceNamesById: Record<string, string>;
		machineNamesById: Record<string, string>;
	}> {
		const lookbackDays = args.lookbackDays;
		const skipMtimeFilter = args.skipMtimeFilter === true;
		const includeEditorDimension = args.includeEditorDimension === true;
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

		const machineId = vscode.env.machineId;
		const rollups = new Map<string, { key: DailyRollupKey; value: DailyRollupValue }>();
		const workspaceNamesById: Record<string, string> = {};
		const machineNamesById: Record<string, string> = {};
		const machineName = this.utility.normalizeNameForStorage(this.utility.stripHostnameDomain(os.hostname()));
		if (machineName) { machineNamesById[machineId] = machineName; }

		const sessionFiles = args.sessionFiles ?? await this.deps.sessionHandlers.getCopilotSessionFiles();
		const useCachedData = !!this.deps.sessionHandlers.getSessionFileDataCached;
		const progress = { filesSkipped: 0, filesProcessed: 0, cacheHits: 0, cacheMisses: 0 };
		const totalFiles = sessionFiles.length;
		this.deps.logger.log(`Backend sync: analyzing ${totalFiles} session files`);

		for (const sessionFile of sessionFiles) {
			await this.processOneSessionForRollup(sessionFile, {
				skipMtimeFilter, startMs, now, machineId, userId,
				includeEditorDimension, useCachedData, rollups,
				workspaceNamesById, totalFiles, onProgress, progress
			});
		}

		if (useCachedData) { this.logCachePerformance(progress.cacheHits, progress.cacheMisses); }
		this.deps.logger.log(`Backend sync: processed ${progress.filesProcessed} files, skipped ${progress.filesSkipped} files outside lookback period`);
		return { rollups, workspaceNamesById, machineNamesById };
	}

	private async tryProcessSpecialSession(
		sessionFile: string, fileMtimeMs: number,
		sessionArgs: ReturnType<typeof this.makeSessionRollupArgs>,
		isType: (f: string) => boolean,
		process: (f: string, mtime: number, args: ReturnType<typeof this.makeSessionRollupArgs>) => Promise<boolean>,
		filesSkipped: { count: number }
	): Promise<boolean> {
		if (!isType(sessionFile)) { return false; }
		try {
			const processed = await process(sessionFile, fileMtimeMs, sessionArgs);
			if (!processed) { filesSkipped.count++; }
		} catch (e) { this.deps.logger.warn(`Backend sync: failed to process session ${sessionFile}: ${e}`); }
		return true;
	}

	private async processOneSessionForRollup(
		sessionFile: string,
		ctx: {
			skipMtimeFilter: boolean; startMs: number; now: Date; machineId: string;
			userId: string | undefined; includeEditorDimension: boolean; useCachedData: boolean;
			rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;
			workspaceNamesById: Record<string, string>; totalFiles: number;
			onProgress: ((processed: number, total: number, daysFound: number) => void) | undefined;
			progress: { filesSkipped: number; filesProcessed: number; cacheHits: number; cacheMisses: number };
		}
	): Promise<void> {
		const fileMtimeMs = await this.statSessionFileForRollup(sessionFile, ctx);
		if (fileMtimeMs === undefined) { return; }
		const editorForFile = this.getEditorForFile(sessionFile, ctx.includeEditorDimension);
		if (this.isVSSessionFileType(sessionFile)) { ctx.progress.filesSkipped++; return; }
		const sessionArgs = this.makeSessionRollupArgs(ctx.machineId, ctx.userId, editorForFile, ctx.workspaceNamesById, ctx.rollups, ctx.startMs);
		const skipped = { count: 0 };
		if (await this.tryProcessSpecialSession(sessionFile, fileMtimeMs, sessionArgs, this.isOpenCodeSessionType.bind(this), this.processOpenCodeSession.bind(this), skipped)) { ctx.progress.filesSkipped += skipped.count; return; }
		if (await this.tryProcessSpecialSession(sessionFile, fileMtimeMs, sessionArgs, this.isCrushSessionType.bind(this), this.processCrushSession.bind(this), skipped)) { ctx.progress.filesSkipped += skipped.count; return; }
		const workspaceId = this.utility.extractWorkspaceIdFromSessionPath(sessionFile);
		await this.ensureWorkspaceNameResolved(workspaceId, sessionFile, ctx.workspaceNamesById);
		if (ctx.useCachedData) {
			const fileStat = await this.deps.sessionHandlers.statSessionFile(sessionFile);
			const cacheSuccess = await this.processCachedSessionFile(sessionFile, fileMtimeMs, fileStat.size, workspaceId, ctx.machineId, ctx.userId, ctx.rollups, ctx.startMs, ctx.now, editorForFile);
			if (cacheSuccess) { ctx.progress.cacheHits++; return; }
			ctx.progress.cacheMisses++;
		}
		let content: string;
		try {
			content = await fs.promises.readFile(sessionFile, 'utf8');
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to read session file ${sessionFile}: ${e}`);
			return;
		}
		if (sessionFile.endsWith('.jsonl') || isJsonlContent(content)) {
			this.processJsonlSessionFallback(content, sessionFile, fileMtimeMs, ctx.startMs, workspaceId, ctx.machineId, ctx.userId, editorForFile, ctx.rollups);
			return;
		}
		this.processJsonSessionFallback(content, sessionFile, fileMtimeMs, ctx.startMs, workspaceId, ctx.machineId, ctx.userId, editorForFile, ctx.rollups);
	}

	private async statSessionFileForRollup(
		sessionFile: string,
		ctx: {
			skipMtimeFilter: boolean; startMs: number; totalFiles: number;
			onProgress: ((processed: number, total: number, daysFound: number) => void) | undefined;
			rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>;
			progress: { filesSkipped: number; filesProcessed: number; cacheHits: number; cacheMisses: number };
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
			return undefined;
		}
	}

	private getEditorForFile(sessionFile: string, includeEditorDimension: boolean): string | undefined {
		if (!includeEditorDimension) { return undefined; }
		return getEditorTypeFromPath(sessionFile, this.deps.editorHandlers?.isOpenCodeSession);
	}

	private isVSSessionFileType(sessionFile: string): boolean {
		return !!(this.deps.editorHandlers?.isVSSessionFile?.(sessionFile));
	}

	private isOpenCodeSessionType(sessionFile: string): boolean {
		return !!(this.deps.editorHandlers?.isOpenCodeSession?.(sessionFile));
	}

	private isCrushSessionType(sessionFile: string): boolean {
		return !!(this.deps.editorHandlers?.isCrushSession?.(sessionFile));
	}

	/**
	 * Sync local session data to the backend store.
	 * @param force - If true, forces sync even if recently synced
	 * @param settings - Backend settings for sync configuration
	 * @param isConfigured - Whether the backend is fully configured
	 * @throws Error if sync fails due to network or auth issues
	 */
	async syncToBackendStore(force: boolean, settings: BackendSettings, isConfigured: boolean): Promise<void> {
		this.syncQueue = this.syncQueue.then(() => this.doSyncToBackendStore(force, settings, isConfigured));
		return this.syncQueue;
	}

	private logSyncSkipReason(sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>, isConfigured: boolean, settings: BackendSettings): void {
		if (!sharingPolicy.allowCloudSync) {
			this.deps.logger.log(`Backend sync: skipping (sharing policy does not allow cloud sync, profile: ${settings.sharingProfile})`);
		} else if (!isConfigured) {
			this.deps.logger.log('Backend sync: skipping (backend not configured - missing storage account, subscription, or resource group)');
		}
	}

	private async checkSyncThrottle(force: boolean): Promise<boolean> {
		const lastSyncAt = this.deps.context?.globalState.get<number>('backend.lastSyncAt');
		if (!force && lastSyncAt && Date.now() - lastSyncAt < BACKEND_SYNC_MIN_INTERVAL_MS) {
			const secondsSinceLastSync = Math.round((Date.now() - lastSyncAt) / 1000);
			this.deps.logger.log(`Backend sync: skipping (last sync was ${secondsSinceLastSync}s ago, minimum interval is ${BACKEND_SYNC_MIN_INTERVAL_MS / 1000}s)`);
			return true;
		}
		return false;
	}

	private async tryUpdateLastSyncAt(): Promise<void> {
		try {
			await this.deps.context?.globalState.update('backend.lastSyncAt', Date.now());
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to update lastSyncAt: ${e}`);
		}
	}

	private async handleAzureSyncError(e: unknown, settings: BackendSettings, sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>): Promise<void> {
		const secretsToRedact = await this.credentialService.getBackendSecretsToRedactForError(settings);
		this.deps.logger.warn(`Backend sync: ${safeStringifyError(e, secretsToRedact)}`);
		if (settings.sharingServerEnabled && settings.sharingServerEndpointUrl) {
			try { await this.syncToSharingServer(settings, sharingPolicy); }
			catch (ssErr: unknown) { this.deps.logger.warn(`Sharing server sync: failed - ${safeStringifyError(ssErr)}`); }
		}
	}

	private async doSyncToBackendStore(force: boolean, settings: BackendSettings, isConfigured: boolean): Promise<void> {
		if (this.backendSyncInProgress) { return; }
		const sharingPolicy = computeBackendSharingPolicy({
			enabled: settings.enabled,
			profile: settings.sharingProfile,
			shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames
		});
		if (!sharingPolicy.allowCloudSync || !isConfigured) {
			this.logSyncSkipReason(sharingPolicy, isConfigured, settings);
			return;
		}
		if (await this.checkSyncThrottle(force)) { return; }
		const serverUrl = settings.backend === 'sharingServer' ? settings.sharingServerEndpointUrl : settings.storageAccount;
		if (!await this.acquireSyncLock(settings.backend, serverUrl)) {
			this.deps.logger.log('Backend sync: skipping (another VS Code window is currently syncing to the same server)');
			return;
		}
		this.backendSyncInProgress = true;
		try {
			if (settings.backend === 'sharingServer') {
				await this.syncToSharingServer(settings, sharingPolicy);
				await this.tryUpdateLastSyncAt();
				this.consecutiveFailures = 0;
				return;
			}
			await this.performAzureTableSync(settings, sharingPolicy);
		} catch (e: unknown) {
			await this.handleAzureSyncError(e, settings, sharingPolicy);
		} finally {
			this.backendSyncInProgress = false;
			await this.releaseSyncLock(settings.backend);
		}
	}

	private checkBlobUploadNeeded(settings: BackendSettings): boolean {
		if (!settings.blobUploadEnabled || !this.blobUploadService) { return false; }
		const machineId = vscode.env.machineId;
		const uploadSettings = { enabled: settings.blobUploadEnabled, containerName: settings.blobContainerName, uploadFrequencyHours: settings.blobUploadFrequencyHours, compressFiles: settings.blobCompressFiles };
		const needed = this.blobUploadService.shouldUpload(machineId, uploadSettings);
		if (needed) {
			this.deps.logger.log('Blob upload: will upload session files after table sync');
		} else {
			const status = this.blobUploadService.getUploadStatus(machineId);
			const hoursSince = status ? Math.round((Date.now() - status.lastUploadTime) / (1000 * 60 * 60)) : 0;
			this.deps.logger.log(`Blob upload: not needed (last upload ${hoursSince}h ago, frequency: ${settings.blobUploadFrequencyHours}h)`);
		}
		return needed;
	}

	private getSortedDayKeys(rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>): string[] {
		const dayKeys = new Set<string>();
		for (const { key } of rollups.values()) { dayKeys.add(key.day); }
		return Array.from(dayKeys).sort();
	}

	private async maybeCleanStaleEntities(
		settings: BackendSettings,
		resolvedIdentity: { userId?: string; userKeyType?: BackendUserIdentityMode },
		sortedDays: string[],
		tableClient: any
	): Promise<void> {
		const CLEAN_SYNC_VERSION = 2;
		const lastCleanVersion = this.deps.context?.globalState.get<number>('backend.lastCleanSyncVersion') ?? 0;
		if (lastCleanVersion >= CLEAN_SYNC_VERSION || !resolvedIdentity.userId || sortedDays.length === 0) { return; }
		const startDayKey = sortedDays[0];
		const endDayKey = sortedDays[sortedDays.length - 1];
		this.deps.logger.log(`Backend sync: cleaning stale entities for user "${resolvedIdentity.userId}" (${startDayKey} to ${endDayKey})`);
		try {
			const deleteResult = await this.dataPlaneService.deleteEntitiesForUserDataset({ tableClient, userId: resolvedIdentity.userId, datasetId: settings.datasetId, startDayKey, endDayKey });
			this.deps.logger.log(`Backend sync: deleted ${deleteResult.deletedCount} stale entities (${deleteResult.errors.length} errors)`);
			await this.deps.context?.globalState.update('backend.lastCleanSyncVersion', CLEAN_SYNC_VERSION);
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to clean stale entities: ${e}`);
		}
	}

	private buildEntitiesForSync(
		rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
		settings: BackendSettings,
		sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>,
		resolvedIdentity: { userId?: string; userKeyType?: BackendUserIdentityMode },
		workspaceNamesById: Record<string, string>,
		machineNamesById: Record<string, string>
	): BackendAggDailyEntityLike[] {
		const entities: BackendAggDailyEntityLike[] = [];
		for (const { key, value } of rollups.values()) {
			const effectiveUserId = (key.userId ?? '').trim() || undefined;
			const includeConsent = sharingPolicy.includeUserDimension && !!effectiveUserId;
			const includeNames = sharingPolicy.includeNames;
			const workspaceIdToStore = sharingPolicy.workspaceIdStrategy === 'hashed'
				? hashWorkspaceIdForTeam({ datasetId: settings.datasetId, workspaceId: key.workspaceId })
				: key.workspaceId;
			const machineIdToStore = sharingPolicy.machineIdStrategy === 'hashed'
				? hashMachineIdForTeam({ datasetId: settings.datasetId, machineId: key.machineId })
				: key.machineId;
			entities.push(createDailyAggEntity({
				datasetId: settings.datasetId, day: key.day, model: key.model,
				workspaceId: workspaceIdToStore, workspaceName: includeNames ? workspaceNamesById[key.workspaceId] : undefined,
				machineId: machineIdToStore, machineName: includeNames ? machineNamesById[key.machineId] : undefined,
				userId: effectiveUserId, userKeyType: resolvedIdentity.userKeyType,
				shareWithTeam: includeConsent ? true : undefined,
				consentAt: validateConsentTimestamp(settings.shareConsentAt, this.deps.logger.log),
				inputTokens: value.inputTokens, outputTokens: value.outputTokens,
				interactions: value.interactions, fluencyMetrics: value.fluencyMetrics
			}));
		}
		return entities;
	}

	private async performBlobUploadIfNeeded(settings: BackendSettings, creds: any, sessionFiles: string[]): Promise<void> {
		try {
			const machineId = vscode.env.machineId;
			const uploadSettings = { enabled: settings.blobUploadEnabled, containerName: settings.blobContainerName, uploadFrequencyHours: settings.blobUploadFrequencyHours, compressFiles: settings.blobCompressFiles };
			this.deps.logger.log('Blob upload: starting');
			const uploadResult = await this.blobUploadService!.uploadSessionFiles(settings.storageAccount, uploadSettings, creds.blobCredential, sessionFiles, machineId, settings.datasetId);
			if (uploadResult.success) { this.deps.logger.log(`Blob upload: ${uploadResult.message}`); }
			else { this.deps.logger.warn(`Blob upload: ${uploadResult.message}`); }
		} catch (blobError: any) {
			this.deps.logger.warn(`Blob upload: failed - ${blobError?.message ?? blobError}`);
		}
	}

	private async performAzureTableSync(settings: BackendSettings, sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>): Promise<void> {
		this.deps.logger.log('Backend sync: starting rollup sync');
		const creds = await this.credentialService.getBackendDataPlaneCredentials(settings);
		if (!creds) {
			this.deps.logger.warn('Backend sync: skipping (credentials not available - check authentication mode and secrets)');
			await this.tryUpdateLastSyncAt();
			return;
		}
		await this.dataPlaneService.ensureTableExists(settings, creds.tableCredential);
		await this.dataPlaneService.validateAccess(settings, creds.tableCredential);

		const blobUploadNeeded = this.checkBlobUploadNeeded(settings);
		const sessionFiles = await this.deps.sessionHandlers.getCopilotSessionFiles();
		const resolvedIdentity = await this.resolveEffectiveUserIdentityForSync(settings, sharingPolicy.includeUserDimension);
		const { rollups, workspaceNamesById, machineNamesById } = await this.computeDailyRollupsFromLocalSessions({
			lookbackDays: settings.lookbackDays, userId: resolvedIdentity.userId, sessionFiles
		});

		const sortedDays = this.getSortedDayKeys(rollups);
		if (sortedDays.length > 0) { this.deps.logger.log(`Backend sync: processing data for ${sortedDays.length} days: ${sortedDays.join(', ')}`); }
		this.deps.logger.log(`Backend sync: upserting ${rollups.size} rollup entities (lookback ${settings.lookbackDays} days)`);

		const tableClient = this.dataPlaneService.createTableClient(settings, creds.tableCredential);
		await this.maybeCleanStaleEntities(settings, resolvedIdentity, sortedDays, tableClient);

		const entities = this.buildEntitiesForSync(rollups, settings, sharingPolicy, resolvedIdentity, workspaceNamesById, machineNamesById);
		const { successCount, errors } = await this.dataPlaneService.upsertEntitiesBatch(tableClient, entities);
		if (errors.length > 0) {
			this.deps.logger.warn(`Backend sync: ${successCount}/${entities.length} entities synced successfully, ${errors.length} failed`);
		} else {
			this.deps.logger.log(`Backend sync: ${successCount} entities synced successfully`);
		}

		this.consecutiveFailures = 0;
		await this.tryUpdateLastSyncAt();
		this.deps.logger.log('Backend sync: completed');

		if (blobUploadNeeded && this.blobUploadService) { await this.performBlobUploadIfNeeded(settings, creds, sessionFiles); }
		if (settings.sharingServerEnabled && settings.sharingServerEndpointUrl) {
			try { await this.syncToSharingServer(settings, sharingPolicy); }
			catch (ssErr: unknown) { this.deps.logger.warn(`Sharing server sync: failed - ${safeStringifyError(ssErr)}`); }
		}
	}

	/**
	 * Normalize vscode.env.appName to the friendly editor names used throughout the extension.
	 * "Visual Studio Code" → "VS Code", "Visual Studio Code - Insiders" → "VS Code Insiders", etc.
	 */
	private normalizeEditorName(appName: string): string {
		const name = appName.trim();
		if (name === 'Visual Studio Code') { return 'VS Code'; }
		if (name === 'Visual Studio Code - Insiders') { return 'VS Code Insiders'; }
		if (name === 'Visual Studio Code - Exploration') { return 'VS Code Exploration'; }
		// Other editors (Cursor, VSCodium, Windsurf, etc.) already use clean names
		return name || 'VS Code';
	}

	/**
	 * Sync daily rollups to the self-hosted sharing server using a GitHub Bearer token.
	 */
	private async syncToSharingServer(
		settings: BackendSettings,
		sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>,
	): Promise<void> {
		if (!this.sharingServerUploadService) {
			this.deps.logger.warn('Sharing server upload: service not available');
			return;
		}

		const githubToken = this.deps.getGithubToken?.();
		if (!githubToken) {
			this.deps.logger.log('Sharing server upload: skipping (no GitHub token — authenticate with GitHub in VS Code first)');
			return;
		}

		const resolvedIdentity = await this.resolveEffectiveUserIdentityForSync(
			settings,
			sharingPolicy.includeUserDimension,
		);
		const { rollups, workspaceNamesById, machineNamesById } =
			await this.computeDailyRollupsFromLocalSessions({
				lookbackDays: settings.lookbackDays,
				userId: resolvedIdentity.userId,
				includeEditorDimension: true,
			});

		if (rollups.size === 0) {
			this.deps.logger.log('Sharing server upload: no data to upload');
			return;
		}

		const includeNames = sharingPolicy.includeNames;
		const entries: SharingServerEntry[] = [];
		for (const { key, value } of rollups.values()) {
			entries.push({
				day: key.day,
				model: key.model,
				workspaceId: key.workspaceId,
				workspaceName: includeNames ? workspaceNamesById[key.workspaceId] : undefined,
				machineId: key.machineId,
				machineName: includeNames ? machineNamesById[key.machineId] : undefined,
				inputTokens: value.inputTokens,
				outputTokens: value.outputTokens,
				interactions: value.interactions,
				datasetId: settings.datasetId,
				editor: key.editor ?? this.normalizeEditorName(vscode.env.appName),
				fluencyMetrics: value.fluencyMetrics as Record<string, unknown> | undefined,
			});
		}

		const totalInputTokens = entries.reduce((s, e) => s + e.inputTokens, 0);
		const totalOutputTokens = entries.reduce((s, e) => s + e.outputTokens, 0);
		this.deps.logger.log(`Sharing server upload: uploading ${entries.length} rollup entries (${(totalInputTokens + totalOutputTokens).toLocaleString()} tokens total)`);
		await this.sharingServerUploadService.uploadRollups(
			settings.sharingServerEndpointUrl,
			githubToken,
			entries,
			this.deps.logger.log,
			this.deps.logger.warn,
		);
	}

	/**
	 * Upload the extension's locally-computed fluency score to the sharing server.
	 * Call this after calculateMaturityScores() to keep the server dashboard in sync
	 * with the extension's AI Fluency Score panel.
	 */
	async uploadFluencyScoreToSharingServer(
		settings: BackendSettings,
		score: Record<string, unknown>,
	): Promise<void> {
		if (!this.sharingServerUploadService) { return; }
		if (!settings.sharingServerEnabled || !settings.sharingServerEndpointUrl) { return; }

		const githubToken = this.deps.getGithubToken?.();
		if (!githubToken) { return; }

		await this.sharingServerUploadService.uploadFluencyScore(
			settings.sharingServerEndpointUrl,
			githubToken,
			score,
			this.deps.logger.log,
			this.deps.logger.warn,
		);
	}

	/**
	 * Backfill historical data to Azure Table Storage.
	 * Scans ALL local session files (ignoring file mtime) and upserts daily rollups for every
	 * day that has local data within the given lookback window. This is safe to run at any time
	 * because the underlying upsert operation is idempotent.
	 *
	 * Use this to recover from situations where the normal sync missed data due to the
	 * mtime-based file-age filter (e.g. the backend was configured after a large volume of
	 * activity had already accumulated locally).
	 */
	async backfillSync(settings: BackendSettings, isConfigured: boolean, maxLookbackDays = 365, onProgress?: (processed: number, total: number, daysFound: number) => void): Promise<void> {
		const sharingPolicy = computeBackendSharingPolicy({
			enabled: settings.enabled,
			profile: settings.sharingProfile,
			shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames
		});
		if (!sharingPolicy.allowCloudSync || !isConfigured) {
			this.deps.logger.warn('Backfill: skipping (cloud sync disabled or backend not configured)');
			return;
		}

		this.deps.logger.log(`Backfill: starting deep scan (up to ${maxLookbackDays} days, mtime filter disabled)`);

		const creds = await this.credentialService.getBackendDataPlaneCredentials(settings);
		if (!creds) {
			this.deps.logger.warn('Backfill: skipping (credentials not available)');
			return;
		}

		await this.dataPlaneService.ensureTableExists(settings, creds.tableCredential);
		await this.dataPlaneService.validateAccess(settings, creds.tableCredential);

		const resolvedIdentity = await this.resolveEffectiveUserIdentityForSync(settings, sharingPolicy.includeUserDimension);
		const { rollups, workspaceNamesById, machineNamesById } = await this.computeDailyRollupsFromLocalSessions({
			lookbackDays: maxLookbackDays,
			userId: resolvedIdentity.userId,
			skipMtimeFilter: true, // backfill: open every file regardless of age
			onProgress
		});

		const sortedDays = this.getBackfillSortedDays(rollups);
		this.deps.logger.log(`Backfill: found data for ${sortedDays.length} days: ${sortedDays.slice(0, 10).join(', ')}${sortedDays.length > 10 ? '…' : ''}`);

		const tableClient = this.dataPlaneService.createTableClient(settings, creds.tableCredential);
		const entities = this.buildBackfillEntities(rollups, settings, sharingPolicy, resolvedIdentity, workspaceNamesById, machineNamesById);

		// Signal upload phase to caller before the (potentially slow) upsert
		onProgress?.(-1, entities.length, sortedDays.length);

		await this.cleanBackfillStaleEntities(tableClient, resolvedIdentity, settings, sortedDays);

		const { successCount, errors } = await this.dataPlaneService.upsertEntitiesBatch(tableClient, entities);
		if (errors.length > 0) {
			this.deps.logger.warn(`Backfill: ${successCount}/${entities.length} entities synced, ${errors.length} failed`);
		} else {
			this.deps.logger.log(`Backfill: ${successCount} entities synced successfully across ${sortedDays.length} days`);
		}
	}

	private getBackfillSortedDays(rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>): string[] {
		const dayKeys = new Set<string>();
		for (const { key } of rollups.values()) { dayKeys.add(key.day); }
		return Array.from(dayKeys).sort();
	}

	private buildBackfillEntities(
		rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
		settings: BackendSettings,
		sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>,
		resolvedIdentity: { userId?: string; userKeyType?: BackendUserIdentityMode },
		workspaceNamesById: Record<string, string>,
		machineNamesById: Record<string, string>
	): BackendAggDailyEntityLike[] {
		const entities: BackendAggDailyEntityLike[] = [];
		for (const { key, value } of rollups.values()) {
			const effectiveUserId = (key.userId ?? '').trim() || undefined;
			const includeConsent = sharingPolicy.includeUserDimension && !!effectiveUserId;
			const includeNames = sharingPolicy.includeNames;
			const workspaceIdToStore = sharingPolicy.workspaceIdStrategy === 'hashed'
				? hashWorkspaceIdForTeam({ datasetId: settings.datasetId, workspaceId: key.workspaceId })
				: key.workspaceId;
			const machineIdToStore = sharingPolicy.machineIdStrategy === 'hashed'
				? hashMachineIdForTeam({ datasetId: settings.datasetId, machineId: key.machineId })
				: key.machineId;
			entities.push(createDailyAggEntity({
				datasetId: settings.datasetId, day: key.day, model: key.model,
				workspaceId: workspaceIdToStore, workspaceName: includeNames ? workspaceNamesById[key.workspaceId] : undefined,
				machineId: machineIdToStore, machineName: includeNames ? machineNamesById[key.machineId] : undefined,
				userId: effectiveUserId, userKeyType: resolvedIdentity.userKeyType,
				shareWithTeam: includeConsent ? true : undefined,
				consentAt: validateConsentTimestamp(settings.shareConsentAt, this.deps.logger.log),
				inputTokens: value.inputTokens, outputTokens: value.outputTokens,
				interactions: value.interactions, fluencyMetrics: value.fluencyMetrics
			}));
		}
		return entities;
	}

	private async cleanBackfillStaleEntities(
		tableClient: any,
		resolvedIdentity: { userId?: string; userKeyType?: BackendUserIdentityMode },
		settings: BackendSettings,
		sortedDays: string[]
	): Promise<void> {
		if (!resolvedIdentity.userId || sortedDays.length === 0) { return; }
		const startDayKey = sortedDays[0];
		const endDayKey = sortedDays[sortedDays.length - 1];
		this.deps.logger.log(`Backfill: cleaning stale entities for user "${resolvedIdentity.userId}" in date range ${startDayKey} to ${endDayKey}`);
		try {
			const deleteResult = await this.dataPlaneService.deleteEntitiesForUserDataset({
				tableClient,
				userId: resolvedIdentity.userId,
				datasetId: settings.datasetId,
				startDayKey,
				endDayKey,
			});
			this.deps.logger.log(`Backfill: deleted ${deleteResult.deletedCount} stale entities (${deleteResult.errors.length} errors)`);
		} catch (e) {
			this.deps.logger.warn(`Backfill: failed to clean stale entities (continuing with upsert): ${e}`);
		}
	}
}
