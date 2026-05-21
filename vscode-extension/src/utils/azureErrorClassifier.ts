/**
 * Azure-specific error classification predicates.
 * Centralises pattern-matching for Azure SDK errors (RestError, TableServiceError, etc.).
 * Backward-compatible re-exports are provided in `errors.ts`.
 */

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
if (_sc(error) === 403) { return true; }
if (_code(error) === 'AuthorizationPermissionMismatch') { return true; }
const m = (error as any)?.message ?? '';
return m.includes('403') || m.includes('Forbidden');
}
export function isNotFoundError(error: unknown): boolean {
if (_sc(error) === 404) { return true; }
const m = (error as any)?.message ?? '';
return m.includes('404') || m.includes('NotFound');
}
export function isConflictError(error: unknown): boolean {
if (_sc(error) === 409) { return true; }
const c = _code(error);
return c === 'TableAlreadyExists' || c === 409;
}
export function isRetryableError(error: unknown): boolean {
const s = _sc(error) ?? _code(error);
return s === 429 || s === 503 || s === 'ETIMEDOUT';
}
export function isNetworkError(error: unknown): boolean {
const c = _code(error);
if (c === 'ENOTFOUND' || c === 'ETIMEDOUT' || c === 'ECONNREFUSED') { return true; }
const m = (error as any)?.message ?? '';
return m.includes('ENOTFOUND') || m.includes('ETIMEDOUT') || m.includes('ECONNREFUSED');
}