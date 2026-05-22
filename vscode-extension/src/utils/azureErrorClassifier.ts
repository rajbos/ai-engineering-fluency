/**
 * Azure-specific error classification predicates.
 * Centralises pattern-matching for Azure SDK errors (RestError, TableServiceError, etc.).
 * Backward-compatible re-exports are provided in `errors.ts`.
 */

/** Standard HTTP status codes used for Azure error classification. */
export const HTTP_STATUS = {
	/** Forbidden – caller lacks permission to perform the operation. */
	FORBIDDEN: 403,
	/** Not Found – the requested resource does not exist. */
	NOT_FOUND: 404,
	/** Conflict – the resource already exists or state conflicts with the request. */
	CONFLICT: 409,
	/** Too Many Requests – the caller has been rate-limited. */
	TOO_MANY_REQUESTS: 429,
	/** Service Unavailable – the service is temporarily unavailable; safe to retry. */
	SERVICE_UNAVAILABLE: 503,
} as const;

/** Azure SDK and Node.js error code strings used for error classification. */
export const AZURE_ERROR_CODES = {
	/** Azure RBAC / storage authorisation mismatch (HTTP 403). */
	AUTHORIZATION_PERMISSION_MISMATCH: 'AuthorizationPermissionMismatch',
	/** Azure Table Storage conflict: table with this name already exists (HTTP 409). */
	TABLE_ALREADY_EXISTS: 'TableAlreadyExists',
	/** Node.js network error: DNS resolution failed. */
	ENOTFOUND: 'ENOTFOUND',
	/** Node.js network error: connection or operation timed out. */
	ETIMEDOUT: 'ETIMEDOUT',
	/** Node.js network error: connection refused by the remote host. */
	ECONNREFUSED: 'ECONNREFUSED',
} as const;

function _sc(e: unknown): number | undefined {
if (!e || typeof e !== 'object') { return undefined; }
const v = (e as any)['statusCode'];
return typeof v === 'number' ? v : undefined;
}
function _code(e: unknown): string | number | undefined {
if (!e || typeof e !== 'object') { return undefined; }
const v = (e as any)['code'];
return typeof v === 'string' || typeof v === 'number' ? v : undefined;
}

export function isAzurePolicyDisallowedError(error: unknown): boolean {
if (!error || typeof error !== 'object') { return false; }
const e = error as any;
if (e.code === 'RequestDisallowedByPolicy') { return true; }
const m = e.message || '';
return m.includes('RequestDisallowedByPolicy') || m.includes('policy assignment');
}
export function isStorageLocalAuthDisallowedByPolicyError(error: unknown): boolean {
if (!error || typeof error !== 'object') { return false; }
const m = ((error as any).message || '').toLowerCase();
return m.includes('allowsharedkeyaccess') || m.includes('local authentication') ||
(m.includes('shared key') && m.includes('policy'));
}
export function isAuthError(error: unknown): boolean {
if (_sc(error) === HTTP_STATUS.FORBIDDEN) { return true; }
if (_code(error) === AZURE_ERROR_CODES.AUTHORIZATION_PERMISSION_MISMATCH) { return true; }
const m = (error as any)?.message ?? '';
return m.includes('403') || m.includes('Forbidden');
}
export function isNotFoundError(error: unknown): boolean {
if (_sc(error) === HTTP_STATUS.NOT_FOUND) { return true; }
const m = (error as any)?.message ?? '';
return m.includes('404') || m.includes('NotFound');
}
export function isConflictError(error: unknown): boolean {
if (_sc(error) === HTTP_STATUS.CONFLICT) { return true; }
const c = _code(error);
return c === AZURE_ERROR_CODES.TABLE_ALREADY_EXISTS || c === HTTP_STATUS.CONFLICT;
}
export function isRetryableError(error: unknown): boolean {
const s = _sc(error) ?? _code(error);
return s === HTTP_STATUS.TOO_MANY_REQUESTS || s === HTTP_STATUS.SERVICE_UNAVAILABLE || s === AZURE_ERROR_CODES.ETIMEDOUT;
}
export function isNetworkError(error: unknown): boolean {
const c = _code(error);
if (c === AZURE_ERROR_CODES.ENOTFOUND || c === AZURE_ERROR_CODES.ETIMEDOUT || c === AZURE_ERROR_CODES.ECONNREFUSED) { return true; }
const m = (error as any)?.message ?? '';
return m.includes('ENOTFOUND') || m.includes('ETIMEDOUT') || m.includes('ECONNREFUSED');
}