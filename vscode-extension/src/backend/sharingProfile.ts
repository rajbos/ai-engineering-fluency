import { createHmac } from 'crypto';

export type BackendSharingProfile = 'off' | 'soloFull' | 'teamAnonymized' | 'teamPseudonymous' | 'teamIdentified';

export interface BackendSharingPolicy {
	profile: BackendSharingProfile;
	allowCloudSync: boolean;
	includeUserDimension: boolean;
	includeNames: boolean;
	workspaceIdStrategy: 'raw' | 'hashed';
	machineIdStrategy: 'raw' | 'hashed';
}

export function parseBackendSharingProfile(value: unknown): BackendSharingProfile | undefined {
	if (value === 'off' || value === 'soloFull' || value === 'teamAnonymized' || value === 'teamPseudonymous' || value === 'teamIdentified') {
		return value;
	}
	return undefined;
}

/**
 * Per-profile defaults. `includeNames: null` means the value is taken from
 * `shareWorkspaceMachineNames` at call-time; a boolean means it is fixed.
 */
type PolicyTemplate = Omit<BackendSharingPolicy, 'allowCloudSync' | 'includeNames'> & {
	includeNames: boolean | null;
};

export const SHARING_POLICY_MAP: Record<BackendSharingProfile, PolicyTemplate> = {
	off:                { profile: 'off',                includeUserDimension: false, includeNames: false, workspaceIdStrategy: 'raw',    machineIdStrategy: 'raw'    },
	soloFull:           { profile: 'soloFull',           includeUserDimension: false, includeNames: true,  workspaceIdStrategy: 'raw',    machineIdStrategy: 'raw'    },
	teamAnonymized:     { profile: 'teamAnonymized',     includeUserDimension: false, includeNames: false, workspaceIdStrategy: 'hashed', machineIdStrategy: 'hashed' },
	teamPseudonymous:   { profile: 'teamPseudonymous',   includeUserDimension: true,  includeNames: null,  workspaceIdStrategy: 'hashed', machineIdStrategy: 'hashed' },
	teamIdentified:     { profile: 'teamIdentified',     includeUserDimension: true,  includeNames: null,  workspaceIdStrategy: 'hashed', machineIdStrategy: 'hashed' },
};

/**
 * Computes the effective sharing policy based on settings and sharing profile.
 * Implements five privacy profiles: off, soloFull, teamAnonymized, teamPseudonymous, teamIdentified.
 * Privacy by default: team modes use hashed IDs, names only included when explicitly enabled.
 *
 * @param args - Configuration including enabled flag, profile, and name sharing preference
 * @returns Concrete policy object that controls sync behavior
 */
export function computeBackendSharingPolicy(args: {
	enabled: boolean;
	profile: BackendSharingProfile | undefined;
	shareWorkspaceMachineNames: boolean;
}): BackendSharingPolicy {
	// Fall back to teamAnonymized (hashed IDs, no names) for unknown/undefined profiles
	const resolvedProfile = (args.profile && args.profile in SHARING_POLICY_MAP) ? args.profile : 'teamAnonymized';
	const template = SHARING_POLICY_MAP[resolvedProfile];
	return {
		...template,
		allowCloudSync: args.enabled && resolvedProfile !== 'off',
		includeNames: template.includeNames ?? args.shareWorkspaceMachineNames,
	};
}

function hmacHexTruncated(args: { key: string; input: string; hexChars: number }): string {
	return createHmac('sha256', args.key).update(args.input).digest('hex').slice(0, args.hexChars);
}

export function hashWorkspaceIdForTeam(args: { datasetId: string; workspaceId: string }): string {
	const datasetKey = (args.datasetId ?? '').trim() || 'default';
	return hmacHexTruncated({ key: datasetKey, input: `workspace:${args.workspaceId}`, hexChars: 16 });
}

export function hashMachineIdForTeam(args: { datasetId: string; machineId: string }): string {
	const datasetKey = (args.datasetId ?? '').trim() || 'default';
	return hmacHexTruncated({ key: datasetKey, input: `machine:${args.machineId}`, hexChars: 16 });
}
