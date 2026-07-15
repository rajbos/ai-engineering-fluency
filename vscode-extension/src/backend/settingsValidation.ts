import { MIN_LOOKBACK_DAYS, MAX_LOOKBACK_DAYS } from './constants';
import type { BackendUserIdentityMode } from './identity';
import type { BackendSharingProfile } from './sharingProfile';
import { type ValidationResult, validResult, invalidResult } from './validation';

/**
 * Infers the effective sharing profile from legacy settings when no explicit
 * profile value has been persisted.
 *
 * Priority: explicit `parsedSharingProfile` wins; otherwise derive from
 * `backendEnabled`, `shareWithTeam`, and `userIdentityMode`.
 */
export function inferSharingProfile(
	parsedSharingProfile: BackendSharingProfile | undefined,
	backendEnabled: boolean,
	shareWithTeam: boolean,
	userIdentityMode: BackendUserIdentityMode
): BackendSharingProfile {
	if (parsedSharingProfile !== undefined) {
		return parsedSharingProfile;
	}
	if (!backendEnabled) {
		return 'off';
	}
	if (shareWithTeam && userIdentityMode !== 'pseudonymous') {
		return 'teamIdentified';
	}
	if (shareWithTeam) {
		return 'teamPseudonymous';
	}
	return 'teamAnonymized';
}

/**
 * Validates that `days` is a finite number within the allowed lookback range.
 *
 * Returns `valid: true` with the original value when valid, or `valid: false`
 * with a human-readable error message when out of range or non-finite.
 */
export function validateLookbackDays(days: number): ValidationResult<number> {
	if (!Number.isFinite(days)) {
		return invalidResult('Lookback days must be a finite number.');
	}
	if (days < MIN_LOOKBACK_DAYS || days > MAX_LOOKBACK_DAYS) {
		return invalidResult(`Lookback days must be between ${MIN_LOOKBACK_DAYS} and ${MAX_LOOKBACK_DAYS}.`);
	}
	return validResult(days);
}
