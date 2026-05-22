import { createHash } from 'crypto';
import { ValidationMessages } from './ui/messages';
import { type ValidationResult, validResult, invalidResult } from './validation';

export type BackendUserIdentityMode = 'pseudonymous' | 'teamAlias' | 'entraObjectId';

export type TeamAliasValidationResult = ValidationResult<{ alias: string }>;

/**
 * Validation rules for user identity inputs.
 * Centralises all constraints so they are easy to audit and adjust together.
 */
const IDENTITY_VALIDATION = {
	/** Allows only alphanumeric characters and dashes — no spaces, underscores, or special chars. */
	TEAM_ALIAS_REGEX: /^[a-zA-Z0-9-]+$/,

	/** Maximum number of characters permitted in a team alias to keep storage keys compact. */
	MAX_TEAM_ALIAS_LENGTH: 32,

	/** Word-boundary pattern that rejects aliases containing common first/last names or role words that could identify a real person. */
	COMMON_NAME_PATTERNS: /\b(john|jane|smith|doe|admin|user|dev|test|demo)\b/i,

	/** Standard RFC 4122 UUID / GUID format required for Entra Object ID values. */
	ENTRA_OBJECT_ID_REGEX: /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/,
};

type AliasValidator = (alias: string) => string | null;

function runValidators(value: string, validators: readonly AliasValidator[]): string | null {
	for (const validator of validators) {
		const error = validator(value);
		if (error !== null) {
			return error;
		}
	}
	return null;
}

const TEAM_ALIAS_VALIDATORS: readonly AliasValidator[] = [
	(alias) => !alias
		? ValidationMessages.required('Team alias', 'Alex-Dev') + ' ' + ValidationMessages.piiWarning('Do not use email addresses or real names.')
		: null,
	(alias) => alias.length > IDENTITY_VALIDATION.MAX_TEAM_ALIAS_LENGTH
		? `Team alias is too long (maximum ${IDENTITY_VALIDATION.MAX_TEAM_ALIAS_LENGTH} characters). Use a shorter handle like "Alex-Dev".`
		: null,
	(alias) => alias.includes('@')
		? `Team alias cannot contain @ symbol (looks like an email). Use a handle like "Alex-Dev" instead. ${ValidationMessages.piiWarning('Do not use email addresses.')}`
		: null,
	(alias) => alias.includes(' ')
		? `Team alias cannot contain spaces (looks like a display name). Use dashes instead. Example: "Alex-Dev". ${ValidationMessages.piiWarning('Do not use real names.')}`
		: null,
	(alias) => !IDENTITY_VALIDATION.TEAM_ALIAS_REGEX.test(alias)
		? ValidationMessages.format('Team alias', 'use only letters, numbers, and dashes', 'Alex-Dev') + ' ' + ValidationMessages.piiWarning('Do not use email addresses or real names.')
		: null,
	(alias) => IDENTITY_VALIDATION.COMMON_NAME_PATTERNS.test(alias)
		? `Team alias "${alias}" looks like a real name or common identifier. Use a non-identifying handle like "Team-Frontend" or "QA-Lead".`
		: null,
];

export function validateTeamAlias(input: string): TeamAliasValidationResult {
	const alias = (input ?? '').trim().toLowerCase();
	const error = runValidators(alias, TEAM_ALIAS_VALIDATORS);
	return error !== null ? invalidResult(error) : validResult({ alias });
}

export interface JwtClaims {
	tenantId?: string;
	objectId?: string;
}

function base64UrlDecodeToString(value: string): string {
	const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
	return Buffer.from(padded, 'base64').toString('utf8');
}

export function tryParseJwtClaims(accessToken: string): JwtClaims {
	const token = (accessToken ?? '').trim();
	const parts = token.split('.');
	if (parts.length < 2) {
		return {};
	}
	try {
		const payloadJson = base64UrlDecodeToString(parts[1]);
		const payload = JSON.parse(payloadJson) as Record<string, unknown>;
		const tenantId = typeof payload.tid === 'string' ? payload.tid : undefined;
		const objectId = typeof payload.oid === 'string' ? payload.oid : undefined;
		return { tenantId, objectId };
	} catch {
		return {};
	}
}

/**
 * Derives a pseudonymous user key from Entra ID claims and dataset ID.
 * Creates a stable, privacy-preserving identifier using SHA-256 hashing.
 * Dataset scoping enables key rotation by changing the dataset ID.
 * 
 * @param args - Object containing tenantId, objectId (from Entra ID JWT), and datasetId
 * @returns 16-character hex string (64-bit hash)
 */
export function derivePseudonymousUserKey(args: { tenantId: string; objectId: string; datasetId: string }): string {
	const input = `tenant:${args.tenantId}|object:${args.objectId}|dataset:${args.datasetId}`;
	return createHash('sha256').update(input).digest('hex').slice(0, 16);
}

export type ResolvedUserIdentity =
	| { userId?: undefined; userKeyType?: undefined }
	| { userId: string; userKeyType: BackendUserIdentityMode };

/**
 * Resolves the effective user identity for backend sync operations.
 * Implements privacy model with multiple sharing modes: personal, team alias,
 * Entra object ID, and pseudonymous. All identifiers are validated before use.
 * 
 * @param args - Configuration for identity resolution
 * @returns Resolved identity with userId and keyType, or empty object if no user dimension
 */
export function resolveUserIdentityForSync(args: {
	shareWithTeam: boolean;
	userIdentityMode: BackendUserIdentityMode;
	configuredUserId: string;
	datasetId: string;
	accessTokenForClaims?: string;
}): ResolvedUserIdentity {
	if (!args.shareWithTeam) {
		return {};
	}

	if (args.userIdentityMode === 'teamAlias') {
		const res = validateTeamAlias(args.configuredUserId);
		if (!res.valid) {
			return {};
		}
		return { userId: res.data.alias, userKeyType: 'teamAlias' };
	}

	if (args.userIdentityMode === 'entraObjectId') {
		const id = (args.configuredUserId ?? '').trim();
		// Keep it strict: objectId should be a GUID.
		if (!IDENTITY_VALIDATION.ENTRA_OBJECT_ID_REGEX.test(id)) {
			return {};
		}
		return { userId: id, userKeyType: 'entraObjectId' };
	}

	const claims = tryParseJwtClaims(args.accessTokenForClaims ?? '');
	if (!claims.tenantId || !claims.objectId) {
		return {};
	}
	const userId = derivePseudonymousUserKey({ tenantId: claims.tenantId, objectId: claims.objectId, datasetId: args.datasetId });
	return { userId, userKeyType: 'pseudonymous' };
}
