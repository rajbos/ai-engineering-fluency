import * as vscode from 'vscode';
import { MIN_LOOKBACK_DAYS, MAX_LOOKBACK_DAYS, DEFAULT_LOOKBACK_DAYS } from './constants';
import type { BackendUserIdentityMode } from './identity';
import { parseBackendSharingProfile, type BackendSharingProfile } from './sharingProfile';
import { inferSharingProfile } from './settingsValidation';

export type BackendType = 'storageTables' | 'sharingServer';

export type BackendAuthMode = 'entraId' | 'sharedKey';

export type BackendShareConsentAt = string;

export function shouldPromptToSetSharedKey(authMode: BackendAuthMode, storageAccount: string, sharedKey: string | undefined): boolean {
	if (authMode !== 'sharedKey') {
		return false;
	}
	if (!storageAccount || !storageAccount.trim()) {
		return false;
	}
	return !(sharedKey && sharedKey.trim());
}

export interface BackendSettings {
	enabled: boolean;
	backend: BackendType;
	authMode: BackendAuthMode;
	datasetId: string;
	sharingProfile: BackendSharingProfile;
	shareWithTeam: boolean;
	shareWorkspaceMachineNames: boolean;
	shareConsentAt: BackendShareConsentAt;
	userIdentityMode: BackendUserIdentityMode;
	userId: string;
	userIdMode: 'alias' | 'custom';
	subscriptionId: string;
	resourceGroup: string;
	storageAccount: string;
	aggTable: string;
	eventsTable: string;
	lookbackDays: number;
	includeMachineBreakdown: boolean;
	// Blob upload settings
	blobUploadEnabled: boolean;
	blobContainerName: string;
	blobUploadFrequencyHours: number;
	blobCompressFiles: boolean;
	// Sharing server settings
	sharingServerEnabled: boolean;
	sharingServerEndpointUrl: string;
}

export interface BackendQueryFilters {
	lookbackDays: number;
	model?: string;
	workspaceId?: string;
	machineId?: string;
	userId?: string;
}

export function getBackendSettings(): BackendSettings {
	const config = vscode.workspace.getConfiguration('aiEngineeringFluency');
	const sharingProfileInspect = typeof (config as any).inspect === 'function'
		? config.inspect<string>('backend.sharingProfile')
		: undefined;
	const sharingProfileRaw = sharingProfileInspect?.globalValue ?? sharingProfileInspect?.workspaceValue ?? sharingProfileInspect?.workspaceFolderValue;

	const userId = config.get<string>('backend.userId', '').trim();
	const userIdMode = config.get<'alias' | 'custom'>('backend.userIdMode', 'alias');
	const userIdentityMode = config.get<BackendUserIdentityMode>('backend.userIdentityMode', 'pseudonymous');
	const shareWithTeam = config.get<boolean>('backend.shareWithTeam', false);

	const parsedSharingProfile = parseBackendSharingProfile(sharingProfileRaw);
	// Default posture is minimizing: when backend is enabled without explicit profile,
	// always default to teamAnonymized (hashed IDs, no user dimension, names off).
	// Legacy shareWithTeam only affects the profile when an explicit userIdentityMode is set.
	const backendEnabled = config.get<boolean>('backend.enabled', false);
	const inferredSharingProfile: BackendSharingProfile = inferSharingProfile(parsedSharingProfile, backendEnabled, shareWithTeam, userIdentityMode);

	return {
		enabled: config.get<boolean>('backend.enabled', false),
		backend: config.get<BackendType>('backend.backend', 'storageTables'),
		authMode: config.get<BackendAuthMode>('backend.authMode', 'entraId'),
		datasetId: config.get<string>('backend.datasetId', 'default').trim() || 'default',
		sharingProfile: inferredSharingProfile,
		shareWithTeam,
		shareWorkspaceMachineNames: config.get<boolean>('backend.shareWorkspaceMachineNames', false),
		shareConsentAt: config.get<string>('backend.shareConsentAt', ''),
		userIdentityMode,
		userId,
		userIdMode,
		subscriptionId: config.get<string>('backend.subscriptionId', ''),
		resourceGroup: config.get<string>('backend.resourceGroup', ''),
		storageAccount: config.get<string>('backend.storageAccount', ''),
		aggTable: config.get<string>('backend.aggTable', 'usageAggDaily'),
		eventsTable: config.get<string>('backend.eventsTable', 'usageEvents'),
		lookbackDays: Math.max(MIN_LOOKBACK_DAYS, Math.min(MAX_LOOKBACK_DAYS, config.get<number>('backend.lookbackDays', DEFAULT_LOOKBACK_DAYS))),
		includeMachineBreakdown: config.get<boolean>('backend.includeMachineBreakdown', false),
		// Blob upload settings
		blobUploadEnabled: config.get<boolean>('backend.blobUploadEnabled', false),
		blobContainerName: config.get<string>('backend.blobContainerName', 'copilot-session-logs').trim() || 'copilot-session-logs',
		blobUploadFrequencyHours: Math.max(1, config.get<number>('backend.blobUploadFrequencyHours', 24)),
		blobCompressFiles: config.get<boolean>('backend.blobCompressFiles', true),
		// Sharing server settings
		sharingServerEnabled: config.get<boolean>('backend.sharingServer.enabled', false),
		sharingServerEndpointUrl: config.get<string>('backend.sharingServer.endpointUrl', '').trim(),
	};
}

/** Whether the Azure Table Storage backend has all required fields filled in. */
export function isAzureBackendConfigured(settings: BackendSettings): boolean {
	return !!(settings.subscriptionId && settings.resourceGroup && settings.storageAccount && settings.aggTable);
}

/** Whether the self-hosted Team Server (sharing server) backend is enabled and has an endpoint URL. */
export function isSharingServerConfigured(settings: BackendSettings): boolean {
	return !!(settings.sharingServerEnabled && settings.sharingServerEndpointUrl);
}

/**
 * Legacy single-backend check, keyed off the `backend.backend` selector. Used only for
 * Azure Table Storage read paths (dashboard/status-bar stats queries) that inherently
 * require Azure credentials and cannot fall back to the sharing server for reads.
 */
export function isBackendConfigured(settings: BackendSettings): boolean {
	if (settings.backend === 'sharingServer') {
		return isSharingServerConfigured(settings);
	}
	return isAzureBackendConfigured(settings);
}

/**
 * Whether *either* backend is configured. Azure Storage and the Team Server are independent
 * sync targets — a user may enable one, the other, or both at the same time — so sync
 * scheduling (starting the timer, running a sync pass, backfilling) must not require both,
 * nor gate on which one happens to be selected as the "primary" `backend.backend` value.
 */
export function isAnyBackendConfigured(settings: BackendSettings): boolean {
	return isAzureBackendConfigured(settings) || isSharingServerConfigured(settings);
}
