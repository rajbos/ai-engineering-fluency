/**
 * Sync service for backend facade.
 * Handles background sync, timer management, and daily rollup computation.
 */

import * as vscode from 'vscode';
import { createHash } from 'crypto';
import { DefaultAzureCredential } from '@azure/identity';
import { safeStringifyError } from '../../../../src/utils/errors';
import type { DailyRollupKey } from '../rollups';
import { resolveSyncTargets, type BackendSettings } from '../settings';
import { BACKEND_SYNC_MIN_INTERVAL_MS } from '../constants';
import type { DailyRollupValue, SyncResult, SyncTargetOutcome } from '../types';
import { resolveUserIdentityForSync, type BackendUserIdentityMode } from '../identity';
import { computeBackendSharingPolicy } from '../sharingProfile';
import { createDailyAggEntity, type BackendAggDailyEntityLike } from '../storageTables';
import { CredentialService } from './credentialService';
import { DataPlaneService } from './dataPlaneService';
import { BackendUtility } from './utilityService';
import { SharingServerUploadService, type SharingServerEntry } from './sharingServerUploadService';
import modelPricingData from '../../../../src/modelPricing.json';
import type { ModelPricing } from '../../../../src/types';
import { SyncLock } from './syncLock';
import { type IBlobUploadService } from './blobUploadService';
import { DailyRollupBuilder, type DailyRollupBuilderDeps } from '../../../../src/teamServer/dailyRollupBuilder';
import { applyIdStrategies, buildTeamServerEntries, canonicalTeamServerUrl } from '../../../../src/teamServer/teamServerEntries';

export type { SyncServiceLogger, SyncServiceSessionHandlers, SyncServiceEditorHandlers } from '../../../../src/teamServer/dailyRollupBuilder';
export { stripLatencyHistograms } from '../../../../src/teamServer/dailyRollupBuilder';
export { applyIdStrategies, canonicalTeamServerUrl } from '../../../../src/teamServer/teamServerEntries';

/** Canonical lock identity for each sync target; also what the lock file records as its server URL. */
export function syncTargetLockToken(kind: 'azure' | 'sharingserver', endpoint: string): string {
	return kind === 'azure' ? `azure:${endpoint.trim().toLowerCase()}` : `share:${canonicalTeamServerUrl(endpoint)}`;
}

/**
 * Lock files written by extension versions before per-endpoint locks. Their recorded server URL
 * is a `|`-joined list of the targets that window was syncing (`azure:<account>|share:<url>`).
 * While an older window may still be running, a live lock there that covers a target blocks it.
 */
const LEGACY_SYNC_LOCK_NAMES: ReadonlyArray<string | undefined> = [undefined, 'sharingserver'];

/** Whether a legacy lock's recorded server URL covers `token`. Unknown formats are treated as covering. */
export function legacyLockCoversTarget(lockServerUrl: string | undefined, token: string): boolean {
	if (!lockServerUrl) { return true; }
	return lockServerUrl.split('|').some(part => {
		if (part.startsWith('azure:')) { return syncTargetLockToken('azure', part.slice('azure:'.length)) === token; }
		if (part.startsWith('share:')) { return syncTargetLockToken('sharingserver', part.slice('share:'.length)) === token; }
		return true;
	});
}

/**
 * Lock name for one sync target endpoint: its kind plus a stable hash of the endpoint. One lock
 * file per endpoint means a window syncing to server A can never make two windows syncing to
 * server B skip serialization (which a single per-kind file, overwritten by A, would allow).
 */
export function targetSyncLockName(kind: 'azure' | 'sharingserver', endpoint: string): string {
	return `${kind}_${createHash('sha256').update(endpoint).digest('hex').slice(0, 16)}`;
}

/** Logged when neither Azure Storage nor the Team Server is switched on and configured. */
const NO_SYNC_TARGET_REASON = 'no sync target enabled: Azure Storage needs backend.enabled plus Azure settings; Team Server needs backend.sharingServer.enabled plus an endpoint URL';

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

export interface SyncServiceDeps extends DailyRollupBuilderDeps {
	context: vscode.ExtensionContext | undefined;
	/** UI refresh callback after successful sync. */
	updateTokenStats?: () => Promise<void>;
	/** Returns the current GitHub OAuth access token, or undefined if not authenticated. */
	getGithubToken?: () => string | undefined;
	/** Price list used for the Team Server per-row cost estimate. Defaults to the bundled modelPricing.json. */
	getModelPricing?: () => Record<string, ModelPricing>;
	/** Version reported to the Team Server as `clientVersion`. Defaults to this extension's package.json version. */
	getClientVersion?: () => string | undefined;
}

/**
 * SyncService manages background synchronization of local session data to the backend.
 */
export class SyncService extends DailyRollupBuilder {
	protected declare readonly deps: SyncServiceDeps;
	private backendSyncInProgress = false;
	private syncQueue: Promise<unknown> = Promise.resolve();
	private backendSyncInterval: NodeJS.Timeout | undefined;
	private consecutiveFailures = 0;
	private readonly MAX_CONSECUTIVE_FAILURES = 5;
	private readonly syncLock: SyncLock;

	constructor(
		deps: SyncServiceDeps,
		private readonly credentialService: CredentialService,
		private readonly dataPlaneService: DataPlaneService,
		private readonly blobUploadService: IBlobUploadService | undefined,
		utility: typeof BackendUtility,
		private readonly sharingServerUploadService: SharingServerUploadService | undefined,
	) {
		super(deps, utility);
		this.syncLock = new SyncLock(
			deps.context,
			deps.logger.log.bind(deps.logger),
			deps.logger.warn.bind(deps.logger),
		);
	}

	/** The extension's rollup machine dimension is VS Code's own machine id. */
	protected override getMachineId(): string {
		return this.deps.getMachineId?.() || vscode.env.machineId;
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
	private async acquireSyncLock(lockName?: string, serverUrl?: string): Promise<boolean> {
		return this.syncLock.acquire(lockName, serverUrl);
	}

	/**
	 * Release the sync lock, but only if we own it.
	 */
	private async releaseSyncLock(lockName?: string): Promise<void> {
		return this.syncLock.release(lockName);
	}

	/**
	 * Determine whether the sync timer is allowed to start, logging the reason when it isn't.
	 */
	private _canStartSyncTimer(settings: BackendSettings, isConfigured: boolean): boolean {
		if (settings.sharingProfile === 'off') {
			this.deps.logger.log(`Backend sync: not starting timer (cloud sync disabled, profile: ${settings.sharingProfile})`);
			return false;
		}
		if (!isConfigured) {
			this.deps.logger.log('Backend sync: not starting timer (backend not configured)');
			return false;
		}
		const targets = resolveSyncTargets(settings);
		if (!targets.azure && !targets.sharingServer) {
			this.deps.logger.log(`Backend sync: not starting timer (${NO_SYNC_TARGET_REASON})`);
			return false;
		}
		return true;
	}

	/**
	 * Handle a failed periodic (timer-driven) sync: track consecutive failures,
	 * surface a user-facing warning/error at the relevant thresholds, and stop
	 * the timer once failures exceed {@link MAX_CONSECUTIVE_FAILURES}.
	 */
	private _handleTimerSyncFailure(e: unknown): void {
		const err = e as { message?: string } | undefined;
		this.deps.logger.warn(`Backend sync timer failed: ${err?.message ?? e}`);
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
	}

	/**
	 * Start the background sync timer if backend is enabled.
	 * @param settings - Backend settings to check if sync should be enabled
	 * @param isConfigured - Whether the backend is fully configured
	 */
	startTimerIfEnabled(settings: BackendSettings, isConfigured: boolean): void {
		try {
			this.stopTimer();
			if (!this._canStartSyncTimer(settings, isConfigured)) {
				return;
			}
			const intervalMs = BACKEND_SYNC_MIN_INTERVAL_MS;
			this.deps.logger.log(`Backend sync: starting timer with interval ${intervalMs}ms (${intervalMs / 60000} minutes)`);
			this.backendSyncInterval = setInterval(() => {
				this.syncToBackendStore(false, settings, isConfigured).catch((e) => this._handleTimerSyncFailure(e));
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
	getSyncQueue(): Promise<unknown> {
		return this.syncQueue;
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
	 * Sync local session data to the backend store.
	 * @param force - If true, forces sync even if recently synced
	 * @param settings - Backend settings for sync configuration
	 * @param isConfigured - Whether the backend is fully configured
	 * @throws Error if sync fails due to network or auth issues
	 */
	async syncToBackendStore(force: boolean, settings: BackendSettings, isConfigured: boolean): Promise<SyncResult> {
		const run = this.syncQueue.then(() => this.doSyncToBackendStore(force, settings, isConfigured));
		this.syncQueue = run;
		return run;
	}

	private logSyncSkipReason(isConfigured: boolean, settings: BackendSettings): void {
		if (settings.sharingProfile === 'off') {
			this.deps.logger.log(`Backend sync: skipping (sharing policy does not allow cloud sync, profile: ${settings.sharingProfile})`);
		} else if (!isConfigured) {
			this.deps.logger.log('Backend sync: skipping (neither Azure Storage nor Team Server is configured)');
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

	/** Updates the shared "last sync attempt" marker used only for the throttle check above. */
	private async tryUpdateLastSyncAt(): Promise<void> {
		try {
			await this.deps.context?.globalState.update('backend.lastSyncAt', Date.now());
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to update lastSyncAt: ${e}`);
		}
	}

	/** Updates the Azure-Storage-specific "last successful sync" marker shown in its own status panel. */
	private async tryUpdateAzureLastSyncAt(): Promise<void> {
		try {
			await this.deps.context?.globalState.update('backend.azureLastSyncAt', Date.now());
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to update azure lastSyncAt: ${e}`);
		}
	}

	/**
	 * Updates the Team Server "last successful sync" marker shown in its status panel.
	 *
	 * This tracks the usage-rollup upload only. The fluency-score upload has its
	 * own marker: the two run on different schedules and can fail independently,
	 * and while they shared this key a small score POST succeeding every couple of
	 * minutes kept the indicator green while rollup uploads failed for hours.
	 *
	 * The key is deliberately new rather than the legacy `backend.sharingServerLastSyncAt`.
	 * That value is still on disk from versions where both uploads wrote it, so it
	 * cannot be read as evidence of a rollup upload — reusing it would display a
	 * score-only timestamp as a confirmed usage sync and keep a failing rollup
	 * upload hidden behind it after upgrade. Starting empty costs one sync cycle
	 * of "never" and is self-healing.
	 */
	private async tryUpdateSharingServerLastSyncAt(): Promise<void> {
		try {
			await this.deps.context?.globalState.update('backend.sharingServerRollupLastSyncAt', Date.now());
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to update sharing server lastSyncAt: ${e}`);
		}
	}

	/** Updates the Team Server "last successful fluency-score upload" marker, tracked separately from the rollup sync above. */
	private async tryUpdateSharingServerFluencyLastSyncAt(): Promise<void> {
		try {
			await this.deps.context?.globalState.update('backend.sharingServerFluencyLastSyncAt', Date.now());
		} catch (e) {
			this.deps.logger.warn(`Backend sync: failed to update sharing server fluency lastSyncAt: ${e}`);
		}
	}

	/** Runs the Azure Table Storage sync in isolation, logging (but not throwing) on failure. */
	private async runAzureSyncIndependently(settings: BackendSettings, sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>): Promise<SyncTargetOutcome> {
		try {
			return await this.performAzureTableSync(settings, sharingPolicy);
		} catch (e: unknown) {
			const secretsToRedact = await this.credentialService.getBackendSecretsToRedactForError(settings);
			this.deps.logger.warn(`Backend sync: ${safeStringifyError(e, secretsToRedact)}`);
			return 'failed';
		}
	}

	/** Runs the Team Server (sharing server) sync in isolation, logging (but not throwing) on failure. */
	private async runSharingServerSyncIndependently(settings: BackendSettings, sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>): Promise<SyncTargetOutcome> {
		try {
			// Only advance the marker when data actually reached the server. The
			// upload service swallows HTTP and network errors and returns normally,
			// so updating this unconditionally made "Last Sync" report a healthy
			// recent sync while nothing had been uploaded for hours. A delivery
			// failure throws and is caught below; `false` means the pass could not
			// run at all, which is a skip rather than a success.
			if (!await this.syncToSharingServer(settings, sharingPolicy)) { return 'skipped'; }
			await this.tryUpdateSharingServerLastSyncAt();
			return 'synced';
		} catch (ssErr: unknown) {
			this.deps.logger.warn(`Sharing server sync: failed - ${safeStringifyError(ssErr)}`);
			return 'failed';
		}
	}

	/**
	 * Runs one target's sync under that target endpoint's own cross-window lock, so two windows
	 * uploading to the same endpoint serialize regardless of their other targets, other windows'
	 * endpoints, or their `backend.backend` selector.
	 */
	private async runUnderTargetLock(kind: 'azure' | 'sharingserver', endpoint: string, label: string, run: () => Promise<SyncTargetOutcome>): Promise<SyncTargetOutcome> {
		const token = syncTargetLockToken(kind, endpoint);
		const lockName = targetSyncLockName(kind, token);
		const skipReason = `Backend sync: skipping ${label} (another VS Code window is currently syncing to the same endpoint)`;
		if (await this.isLegacyLockHeldFor(token)) {
			this.deps.logger.log(skipReason);
			return 'skipped';
		}
		if (!await this.acquireSyncLock(lockName, token)) {
			this.deps.logger.log(skipReason);
			return 'skipped';
		}
		try {
			return await run();
		} finally {
			await this.releaseSyncLock(lockName);
		}
	}

	/** Whether a window still running an older extension version holds a legacy lock covering `token`. */
	private async isLegacyLockHeldFor(token: string): Promise<boolean> {
		for (const legacyName of LEGACY_SYNC_LOCK_NAMES) {
			if (await this.syncLock.isHeldByAnotherWindow(legacyName, (url) => legacyLockCoversTarget(url, token))) {
				return true;
			}
		}
		return false;
	}

	private async doSyncToBackendStore(force: boolean, settings: BackendSettings, isConfigured: boolean): Promise<SyncResult> {
		if (this.backendSyncInProgress) { return {}; }
		if (settings.sharingProfile === 'off' || !isConfigured) {
			this.logSyncSkipReason(isConfigured, settings);
			return {};
		}

		// Azure Storage and the Team Server are independent sync targets: either, both, or
		// neither may be enabled at any time, and each must run — and report its own
		// success/failure and "last sync" timestamp — without the other affecting it.
		// Azure is gated on `backend.enabled`; the Team Server has its own toggle and must
		// not depend on the Azure one.
		const { azure: azureConfigured, sharingServer: sharingConfigured } = resolveSyncTargets(settings);
		if (!azureConfigured && !sharingConfigured) {
			this.deps.logger.log(`Backend sync: skipping (${NO_SYNC_TARGET_REASON})`);
			return {};
		}
		if (await this.checkSyncThrottle(force)) { return {}; }
		// Target gating is done above; the policy here only shapes the uploaded payload.
		const sharingPolicy = computeBackendSharingPolicy({
			enabled: true,
			profile: settings.sharingProfile,
			shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames
		});

		const result: SyncResult = {};
		this.backendSyncInProgress = true;
		try {
			await this.tryUpdateLastSyncAt();
			if (azureConfigured) {
				result.azure = await this.runUnderTargetLock('azure', settings.storageAccount, 'Azure Storage',
					() => this.runAzureSyncIndependently(settings, sharingPolicy));
			}
			if (sharingConfigured) {
				result.sharingServer = await this.runUnderTargetLock('sharingserver', settings.sharingServerEndpointUrl, 'Team Server',
					() => this.runSharingServerSyncIndependently(settings, sharingPolicy));
			}
			this.consecutiveFailures = 0;
		} finally {
			this.backendSyncInProgress = false;
		}
		return result;
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
			const { workspaceId: workspaceIdToStore, machineId: machineIdToStore } = applyIdStrategies(key, settings.datasetId, sharingPolicy);
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

	private async performBlobUploadIfNeeded(settings: BackendSettings, creds: any, sessionFiles: string[], editorTypeByFile: Map<string, string>): Promise<void> {
		try {
			const machineId = vscode.env.machineId;
			const uploadSettings = { enabled: settings.blobUploadEnabled, containerName: settings.blobContainerName, uploadFrequencyHours: settings.blobUploadFrequencyHours, compressFiles: settings.blobCompressFiles };

			this.deps.logger.log('Blob upload: starting');
			const uploadResult = await this.blobUploadService!.uploadSessionFiles(settings.storageAccount, uploadSettings, creds.blobCredential, sessionFiles, machineId, settings.datasetId, editorTypeByFile);
			if (uploadResult.success) { this.deps.logger.log(`Blob upload: ${uploadResult.message}`); }
			else { this.deps.logger.warn(`Blob upload: ${uploadResult.message}`); }
		} catch (blobError: any) {
			this.deps.logger.warn(`Blob upload: failed - ${blobError?.message ?? blobError}`);
		}
	}

	/**
	 * Upserts local rollups into Azure Table Storage. Resolves `failed` — without touching the
	 * Azure "last sync" marker — when credentials are unavailable or any entity failed to upsert,
	 * so neither case can be reported as a successful sync.
	 */
	private async performAzureTableSync(settings: BackendSettings, sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>): Promise<SyncTargetOutcome> {
		this.deps.logger.log('Backend sync: starting rollup sync');
		const creds = await this.credentialService.getBackendDataPlaneCredentials(settings);
		if (!creds) {
			this.deps.logger.warn('Backend sync: skipping (credentials not available - check authentication mode and secrets)');
			return 'failed';
		}
		await this.dataPlaneService.ensureTableExists(settings, creds.tableCredential);
		await this.dataPlaneService.validateAccess(settings, creds.tableCredential);

		const blobUploadNeeded = this.checkBlobUploadNeeded(settings);
		const sessionFiles = await this.deps.sessionHandlers.getCopilotSessionFiles();
		const resolvedIdentity = await this.resolveEffectiveUserIdentityForSync(settings, sharingPolicy.includeUserDimension);
		const { rollups, workspaceNamesById, machineNamesById, editorTypeByFile, filesFailed } = await this.computeDailyRollupsFromLocalSessions({
			lookbackDays: settings.lookbackDays, userId: resolvedIdentity.userId, sessionFiles,
			collectEditorType: blobUploadNeeded
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

		// Same invariant as the Team Server marker: `upsertEntitiesBatch` catches
		// per entity and returns normally, so every entity can fail without this
		// method throwing. Advancing unconditionally made the Azure status panel
		// report a healthy recent sync while nothing had been stored.
		const outcome: SyncTargetOutcome = this.isAzureSyncSuccessful(successCount, errors.length, entities.length, filesFailed) ? 'synced' : 'failed';
		if (outcome === 'synced') {
			await this.tryUpdateAzureLastSyncAt();
			this.deps.logger.log('Backend sync: completed');
		} else {
			this.deps.logger.warn('Backend sync: completed with failures - not updating the last sync marker');
		}

		if (blobUploadNeeded && this.blobUploadService) { await this.performBlobUploadIfNeeded(settings, creds, sessionFiles, editorTypeByFile); }
		return outcome;
	}

	/**
	 * Whether an Azure Table sync pass delivered everything it found, and so may
	 * advance the "last successful sync" marker.
	 *
	 * Having nothing to store is a successful no-op, but only when the scan that
	 * produced it was clean: unreadable session files are logged and skipped, so
	 * local data can exist and still yield zero entities.
	 */
	private isAzureSyncSuccessful(successCount: number, errorCount: number, entityCount: number, filesFailed: number): boolean {
		if (errorCount > 0 || successCount !== entityCount) { return false; }
		return entityCount > 0 || filesFailed === 0;
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
	 * Sync daily rollups to the self-hosted sharing server using a GitHub Bearer token. Resolves
	 * `true` when the pass completed (including "nothing to upload") and `false` when it could not
	 * run at all (no upload service or no GitHub token). Throws when data existed but did not
	 * reach the server, so the caller records the target as failed rather than skipped.
	 */
	private async syncToSharingServer(
		settings: BackendSettings,
		sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>,
	): Promise<boolean> {
		if (!this.sharingServerUploadService) {
			this.deps.logger.warn('Sharing server upload: service not available');
			return false;
		}

		const githubToken = this.deps.getGithubToken?.();
		if (!githubToken) {
			this.deps.logger.log('Sharing server upload: skipping (no GitHub token — authenticate with GitHub in VS Code first)');
			return false;
		}

		const resolvedIdentity = await this.resolveEffectiveUserIdentityForSync(
			settings,
			sharingPolicy.includeUserDimension,
		);
		const { rollups, workspaceNamesById, machineNamesById, filesFailed } =
			await this.computeDailyRollupsFromLocalSessions({
				lookbackDays: settings.lookbackDays,
				userId: resolvedIdentity.userId,
				includeEditorDimension: true,
			});

		if (rollups.size === 0) {
			// An empty scan is only a successful no-op when it is a *genuine* empty
			// scan. Unreadable or unparseable session files are logged and skipped,
			// so local data can exist and still produce no rollups — reporting that
			// as a successful sync is the same false "all good" signal this guards
			// against, just one layer earlier. Throwing rather than returning false
			// records the target as failed; false here means "could not run at all".
			if (filesFailed > 0) {
				throw new Error(`nothing to upload, but ${filesFailed} session file(s) could not be read`);
			}
			this.deps.logger.log('Sharing server upload: no data to upload');
			// Nothing to send and nothing failed: the sync ran and the server is
			// already up to date, so the marker should still advance. The failure
			// this guards against is data that exists and does not arrive, which is
			// handled by the upload result below.
			return true;
		}

		const entries = this.buildSharingServerEntries(rollups, settings, sharingPolicy, workspaceNamesById, machineNamesById);

		const totalInputTokens = entries.reduce((s, e) => s + e.inputTokens, 0);
		const totalOutputTokens = entries.reduce((s, e) => s + e.outputTokens, 0);
		this.deps.logger.log(`Sharing server upload: uploading ${entries.length} rollup entries (${(totalInputTokens + totalOutputTokens).toLocaleString()} tokens total)`);
		// uploadRollups reports HTTP/network failures and server-side rejections in its result
		// rather than throwing; turn both into errors so the caller records the target as failed.
		const upload = await this.sharingServerUploadService.uploadRollups(
			settings.sharingServerEndpointUrl,
			githubToken,
			entries,
			this.deps.logger.log,
			this.deps.logger.warn,
		);
		// `success` is already false unless the server reported every entry stored:
		// a 2xx alone is not enough, since the endpoint returns 200 with
		// `uploaded: 0` for validation or database failures. The count comparison
		// is kept as a second, local guard on the same invariant.
		if (!upload.success) {
			throw new Error(upload.message);
		}
		if (upload.entriesUploaded < entries.length) {
			throw new Error(`server accepted ${upload.entriesUploaded} of ${entries.length} entries`);
		}
		return true;
	}

	/**
	 * Build the Team Server upload payload for a set of daily rollups.
	 *
	 * Split out of syncToSharingServer purely to keep that method readable; it must
	 * stay in lockstep with buildEntitiesForSync so no sharing profile leaks raw
	 * workspace/machine IDs to one target while hashing them for the other.
	 */
	private buildSharingServerEntries(
		rollups: Map<string, { key: DailyRollupKey; value: DailyRollupValue }>,
		settings: BackendSettings,
		sharingPolicy: ReturnType<typeof computeBackendSharingPolicy>,
		workspaceNamesById: Record<string, string>,
		machineNamesById: Record<string, string>
	): SharingServerEntry[] {
		return buildTeamServerEntries(rollups, {
			datasetId: settings.datasetId,
			sharingPolicy,
			workspaceNamesById,
			machineNamesById,
			pricing: this.deps.getModelPricing?.() ?? (modelPricingData.pricing as Record<string, ModelPricing>),
			clientVersion: this.resolveClientVersion(),
			getDefaultEditor: () => this.normalizeEditorName(vscode.env.appName),
		});
	}

	/** The extension version reported as `clientVersion`; undefined when it cannot be resolved (never a placeholder). */
	private resolveClientVersion(): string | undefined {
		if (this.deps.getClientVersion) {
			const provided = this.deps.getClientVersion();
			return provided?.trim() || undefined;
		}
		try {
			const extension = vscode.extensions.getExtension('RobBos.ai-engineering-fluency') ?? vscode.extensions.getExtension('RobBos.copilot-token-tracker');
			const version = (extension?.packageJSON as { version?: unknown } | undefined)?.version;
			return typeof version === 'string' && version.trim() ? version.trim().slice(0, 64) : undefined;
		} catch {
			return undefined;
		}
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
		// Same gate as rollup sync: toggle + endpoint, and a sharing profile other than 'off'.
		if (!resolveSyncTargets(settings).sharingServer) { return; }

		const githubToken = this.deps.getGithubToken?.();
		if (!githubToken) { return; }

		const uploaded = await this.sharingServerUploadService.uploadFluencyScore(
			settings.sharingServerEndpointUrl,
			githubToken,
			score,
			this.deps.logger.log,
			this.deps.logger.warn,
		);
		// The fluency score has its own marker: it is a separate, much smaller POST,
		// and letting it advance the rollup marker is exactly how a failing rollup
		// upload stayed invisible behind a succeeding score upload.
		if (uploaded) { await this.tryUpdateSharingServerFluencyLastSyncAt(); }
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
	async backfillSync(settings: BackendSettings, maxLookbackDays = 365, onProgress?: (processed: number, total: number, daysFound: number) => void): Promise<void> {
		const sharingPolicy = computeBackendSharingPolicy({
			enabled: settings.enabled,
			profile: settings.sharingProfile,
			shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames
		});
		// Backfill writes to Azure Table Storage only, so it is gated solely on the Azure target
		// (backend.enabled + Azure fields + non-off profile), not on the backend.backend selector.
		if (!resolveSyncTargets(settings).azure) {
			this.deps.logger.warn('Backfill: skipping (Azure Storage sync disabled or not configured)');
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
		const entities = this.buildEntitiesForSync(rollups, settings, sharingPolicy, resolvedIdentity, workspaceNamesById, machineNamesById);

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
