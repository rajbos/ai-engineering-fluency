import { MIN_LOOKBACK_DAYS, MAX_LOOKBACK_DAYS } from './constants';
import type { BackendSettings, BackendAuthMode, BackendType } from './settings';
import type { BackendSharingProfile } from './sharingProfile';
import type { BackendUserIdentityMode } from './identity';
import { validateTeamAlias } from './identity';
import { ValidationMessages } from './ui/messages';

export interface AzureResourcesConfig {
subscriptionId: string;
resourceGroup: string;
storageAccount: string;
aggTable: string;
eventsTable: string;
}

export interface IdentityConfig {
userIdentityMode: BackendUserIdentityMode;
userId: string;
}

export interface BlobUploadConfig {
blobUploadEnabled: boolean;
blobContainerName: string;
blobUploadFrequencyHours: number;
blobCompressFiles: boolean;
}

export interface SharingConfig {
sharingProfile: BackendSharingProfile;
shareWorkspaceMachineNames: boolean;
sharingServerEnabled: boolean;
sharingServerEndpointUrl: string;
}

export interface BackendConfigDraft {
enabled: boolean;
backend: BackendType;
authMode: BackendAuthMode;
datasetId: string;
lookbackDays: number;
includeMachineBreakdown: boolean;
azureResources: AzureResourcesConfig;
identity: IdentityConfig;
blobUpload: BlobUploadConfig;
sharing: SharingConfig;
}

export interface DraftValidationResult {
valid: boolean;
errors: Record<string, string>;
}

export const ALIAS_REGEX = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;

export function toDraft(settings: BackendSettings): BackendConfigDraft {
return {
enabled: settings.enabled,
backend: settings.backend,
authMode: settings.authMode,
datasetId: settings.datasetId,
lookbackDays: clampLookback(settings.lookbackDays),
includeMachineBreakdown: settings.includeMachineBreakdown,
azureResources: {
subscriptionId: settings.subscriptionId,
resourceGroup: settings.resourceGroup,
storageAccount: settings.storageAccount,
aggTable: settings.aggTable,
eventsTable: settings.eventsTable,
},
identity: {
userIdentityMode: settings.userIdentityMode,
userId: settings.userId,
},
blobUpload: {
blobUploadEnabled: settings.blobUploadEnabled,
blobContainerName: settings.blobContainerName,
blobUploadFrequencyHours: settings.blobUploadFrequencyHours,
blobCompressFiles: settings.blobCompressFiles,
},
sharing: {
sharingProfile: settings.sharingProfile,
shareWorkspaceMachineNames: settings.shareWorkspaceMachineNames,
sharingServerEnabled: settings.sharingServerEnabled,
sharingServerEndpointUrl: settings.sharingServerEndpointUrl,
},
};
}

export function clampLookback(value: number): number {
const numeric = Number.isFinite(value) ? Number(value) : MIN_LOOKBACK_DAYS;
return Math.max(MIN_LOOKBACK_DAYS, Math.min(MAX_LOOKBACK_DAYS, Math.round(numeric)));
}

export function deriveShareWithTeam(profile: BackendSharingProfile): boolean {
return profile === 'teamPseudonymous' || profile === 'teamIdentified';
}

/** Ordering of sharing profiles from least to most permissive. Higher value = more data leaves the machine. */
export enum SharingLevel {
Off = 0,
TeamAnonymized = 10,
TeamPseudonymous = 20,
SoloFull = 25, // personal but includes readable names; sits between TeamPseudonymous and TeamIdentified
TeamIdentified = 30
}

const SHARING_LEVEL_MAP: Record<BackendSharingProfile, SharingLevel> = {
	off: SharingLevel.Off,
	teamAnonymized: SharingLevel.TeamAnonymized,
	teamPseudonymous: SharingLevel.TeamPseudonymous,
	soloFull: SharingLevel.SoloFull,
	teamIdentified: SharingLevel.TeamIdentified,
};

export function sharingLevel(profile: BackendSharingProfile): SharingLevel {
	return SHARING_LEVEL_MAP[profile] ?? SharingLevel.Off;
}

export function needsConsent(previous: BackendConfigDraft, next: BackendConfigDraft): { required: boolean; reasons: string[] } {
const reasons: string[] = [];
if (sharingLevel(next.sharing.sharingProfile) > sharingLevel(previous.sharing.sharingProfile)) {
reasons.push('Sharing profile becomes more permissive');
}
if (!previous.sharing.shareWorkspaceMachineNames && next.sharing.shareWorkspaceMachineNames) {
reasons.push('Readable workspace/machine names will be uploaded');
}
return { required: reasons.length > 0, reasons };
}

function validateDatasetId(draft: BackendConfigDraft, errors: Record<string, string>): void {
	if (!draft.datasetId || !draft.datasetId.trim()) {
		errors.datasetId = ValidationMessages.required('Dataset ID', '"my-team-copilot"');
	} else if (!ALIAS_REGEX.test(draft.datasetId.trim())) {
		errors.datasetId = ValidationMessages.alphanumeric('Dataset ID', 'my-team-copilot');
	}
}

function validateAzureResources(draft: BackendConfigDraft, errors: Record<string, string>): void {
	if (!draft.enabled) {
		return;
	}
	const requireString = (value: string, field: string, fieldLabel: string, example?: string) => {
		if (!value || !value.trim()) {
			errors[field] = ValidationMessages.required(fieldLabel, example);
		}
	};
	requireString(draft.azureResources.subscriptionId, 'subscriptionId', 'Subscription ID');
	requireString(draft.azureResources.resourceGroup, 'resourceGroup', 'Resource Group', 'copilot-tokens-rg');
	requireString(draft.azureResources.storageAccount, 'storageAccount', 'Storage Account', 'copilottokensrg');
	requireString(draft.azureResources.aggTable, 'aggTable', 'Aggregate Table', 'usageAggDaily');
}

function validateTableNames(draft: BackendConfigDraft, errors: Record<string, string>): void {
	const tableFields: Array<['aggTable' | 'eventsTable', string, string]> = [
		['aggTable', draft.azureResources.aggTable, 'Aggregate Table'],
		['eventsTable', draft.azureResources.eventsTable, 'Events Table']
	];
	for (const [key, value, label] of tableFields) {
		if (value && !ALIAS_REGEX.test(value.trim())) {
			errors[key] = ValidationMessages.alphanumeric(label, 'usageAggDaily');
		}
	}
}

function validateLookbackDays(draft: BackendConfigDraft, errors: Record<string, string>): void {
	const lookback = Number(draft.lookbackDays);
	if (!Number.isFinite(lookback)) {
		errors.lookbackDays = 'Lookback days must be a number. Enter a value between 1 and 90.';
	} else if (lookback < MIN_LOOKBACK_DAYS || lookback > MAX_LOOKBACK_DAYS) {
		errors.lookbackDays = ValidationMessages.range('Lookback days', MIN_LOOKBACK_DAYS, MAX_LOOKBACK_DAYS);
	}
}

function validateUserIdentity(draft: BackendConfigDraft, errors: Record<string, string>): void {
	if (draft.sharing.sharingProfile !== 'teamIdentified') {
		return;
	}
	if (draft.identity.userIdentityMode === 'teamAlias') {
		const res = validateTeamAlias(draft.identity.userId);
		if (!res.valid) {
			errors.userId = res.error;
		}
	} else if (draft.identity.userIdentityMode === 'entraObjectId') {
		const trimmed = (draft.identity.userId ?? '').trim();
		if (!trimmed) {
			errors.userId = ValidationMessages.required('Entra object ID');
		} else if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(trimmed)) {
			errors.userId = ValidationMessages.guidFormat('Entra object ID');
		}
	}
}

function validateAuthMode(draft: BackendConfigDraft, errors: Record<string, string>): void {
	if (draft.authMode !== 'entraId' && draft.authMode !== 'sharedKey') {
		errors.authMode = ValidationMessages.required('Auth mode');
	}
}

function validateBlobUpload(draft: BackendConfigDraft, errors: Record<string, string>): void {
	if (!draft.blobUpload.blobUploadEnabled) {
		return;
	}
	const freq = Number(draft.blobUpload.blobUploadFrequencyHours);
	if (!Number.isFinite(freq) || freq < 1 || freq > 168) {
		errors.blobUploadFrequencyHours = 'Upload frequency must be between 1 and 168 hours.';
	}
	if (!draft.blobUpload.blobContainerName || !draft.blobUpload.blobContainerName.trim()) {
		errors.blobContainerName = 'Container name is required when blob upload is enabled.';
	}
}

export function validateDraft(draft: BackendConfigDraft): DraftValidationResult {
	const errors: Record<string, string> = {};

	validateDatasetId(draft, errors);
	validateAzureResources(draft, errors);
	validateTableNames(draft, errors);
	validateLookbackDays(draft, errors);
	validateUserIdentity(draft, errors);
	validateAuthMode(draft, errors);
	validateBlobUpload(draft, errors);

return { valid: Object.keys(errors).length === 0, errors };
}

export function applyDraftToSettings(
previous: BackendSettings,
draft: BackendConfigDraft,
consentAt: string | undefined
): BackendSettings {
const shareWithTeam = deriveShareWithTeam(draft.sharing.sharingProfile);
const sanitizedDataset = draft.datasetId.trim() || 'default';
const sanitizedUserId = draft.identity.userId.trim();

return {
...previous,
enabled: draft.enabled,
authMode: draft.authMode,
datasetId: sanitizedDataset,
sharingProfile: draft.sharing.sharingProfile,
shareWithTeam,
shareWorkspaceMachineNames: draft.sharing.shareWorkspaceMachineNames,
shareConsentAt: shareWithTeam ? (consentAt ?? previous.shareConsentAt) : '',
userIdentityMode: draft.identity.userIdentityMode,
userId: sanitizedUserId,
userIdMode: draft.identity.userIdentityMode === 'entraObjectId' ? 'custom' : 'alias',
subscriptionId: draft.azureResources.subscriptionId.trim(),
resourceGroup: draft.azureResources.resourceGroup.trim(),
storageAccount: draft.azureResources.storageAccount.trim(),
aggTable: draft.azureResources.aggTable.trim(),
eventsTable: draft.azureResources.eventsTable.trim(),
lookbackDays: clampLookback(draft.lookbackDays),
backend: draft.backend ?? 'storageTables',
sharingServerEnabled: !!draft.sharing.sharingServerEnabled,
sharingServerEndpointUrl: (draft.sharing.sharingServerEndpointUrl || '').trim(),
includeMachineBreakdown: !!draft.includeMachineBreakdown,
blobUploadEnabled: !!draft.blobUpload.blobUploadEnabled,
blobContainerName: (draft.blobUpload.blobContainerName || '').trim() || 'copilot-session-logs',
blobUploadFrequencyHours: Math.max(1, Math.min(168, Number(draft.blobUpload.blobUploadFrequencyHours) || 24)),
blobCompressFiles: draft.blobUpload.blobCompressFiles !== false
};
}

export function getPrivacyBadge(profile: BackendSharingProfile, includeNames: boolean): string {
if (profile === 'off') {
return 'Local-only';
}
if (profile === 'soloFull') {
return 'Solo';
}
if (profile === 'teamAnonymized') {
return includeNames ? 'Team (Names)' : 'Team Anonymized';
}
if (profile === 'teamPseudonymous') {
return includeNames ? 'Team Pseudonymous (Names)' : 'Team Pseudonymous';
}
return includeNames ? 'Team Identified (Names)' : 'Team Identified';
}