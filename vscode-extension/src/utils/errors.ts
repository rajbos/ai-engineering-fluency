/**
 * Error utilities for the Copilot Token Tracker extension.
 * Provides custom error types, error handling, and secret redaction.
 */

// Custom error types for backend operations
export class BackendError extends Error {
	constructor(message: string, public readonly cause?: unknown) {
		super(message);
		this.name = 'BackendError';
	}
}

export class BackendConfigError extends BackendError {
	constructor(message: string, cause?: unknown) {
		super(message, cause);
		this.name = 'BackendConfigError';
	}
}

export class BackendAuthError extends BackendError {
	constructor(message: string, cause?: unknown) {
		super(message, cause);
		this.name = 'BackendAuthError';
	}
}

export class BackendSyncError extends BackendError {
	constructor(message: string, cause?: unknown) {
		super(message, cause);
		this.name = 'BackendSyncError';
	}
}

/**
 * Redacts secrets from text to prevent exposure in logs or error messages.
 * @param text - The text to redact
 * @param secretsToRedact - Array of secret strings to redact
 * @returns Text with secrets replaced by [REDACTED]
 */
export function redactSecretsInText(text: string, secretsToRedact: string[]): string {
	if (!text || !secretsToRedact || secretsToRedact.length === 0) {
		return text;
	}
	let result = text;
	for (const secret of secretsToRedact) {
		if (!secret || !secret.trim()) {
			continue;
		}
		// Escape special regex characters
		const escaped = secret.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		result = result.replace(new RegExp(escaped, 'g'), '[REDACTED]');
	}
	return result;
}

function _sseFromErrorInstance(error: Error, secretsToRedact?: string[]): string {
	if (!error.stack) { return error.message || error.toString(); }
	return secretsToRedact?.length ? redactSecretsInText(error.stack, secretsToRedact) : error.stack;
}

function _sseFromObject(error: object): string {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const errorObj = error as any;
	try {
		return errorObj.message || errorObj.error || JSON.stringify(error);
	} catch {
		return errorObj.message || errorObj.error || '[object Object]';
	}
}

/**
 * Safely converts an error to a string, with optional secret redaction.
 * @param error - The error to stringify
 * @param secretsToRedact - Optional array of secrets to redact from the error message
 * @returns A safe string representation of the error
 */
export function safeStringifyError(error: unknown, secretsToRedact?: string[]): string {
	let message: string;
	if (error instanceof Error) { message = _sseFromErrorInstance(error, secretsToRedact); }
	else if (typeof error === 'string') { message = error; }
	else if (error && typeof error === 'object') { message = _sseFromObject(error); }
	else { message = String(error); }
	if (secretsToRedact && secretsToRedact.length > 0) { message = redactSecretsInText(message, secretsToRedact); }
	return message;
}

/**
 * Extracts the HTTP status code from an unknown error (e.g. Azure SDK RestError has a `statusCode` property).
 * @param error - The error to inspect
 * @returns The numeric status code, or undefined if not present
 */
export function getErrorStatusCode(error: unknown): number | undefined {
	if (!error || typeof error !== 'object') { return undefined; }
	const sc = (error as Record<string, unknown>)['statusCode'];
	return typeof sc === 'number' ? sc : undefined;
}

/**
 * Extracts the error code from an unknown error (e.g. Azure SDK errors expose a `code` string).
 * @param error - The error to inspect
 * @returns The code as a string or number, or undefined if not present
 */
export function getErrorCode(error: unknown): string | number | undefined {
	if (!error || typeof error !== 'object') { return undefined; }
	const code = (error as Record<string, unknown>)['code'];
	return typeof code === 'string' || typeof code === 'number' ? code : undefined;
}

// Re-exported from azureErrorClassifier.ts for backward compatibility.
export { isAzurePolicyDisallowedError, isStorageLocalAuthDisallowedByPolicyError, isAuthError, isNotFoundError, isConflictError, isRetryableError, isNetworkError } from './azureErrorClassifier';

/**
 * Wraps an async function with error handling and optional retry logic.
 * @param fn - The async function to wrap
 * @param errorPrefix - Prefix for error messages
 * @param secretsToRedact - Optional secrets to redact from error messages
 * @returns The result of the function or throws a BackendError
 */
export async function withErrorHandling<T>(
	fn: () => Promise<T>,
	errorPrefix: string,
	secretsToRedact?: string[]
): Promise<T> {
	try {
		return await fn();
	} catch (error) {
		const message = `${errorPrefix}: ${safeStringifyError(error, secretsToRedact)}`;
		throw new BackendError(message, error);
	}
}

/**
 * Calls fn and returns its result. On error, logs with context and returns fallback.
 * Use this instead of silent `catch { }` blocks so errors remain visible for debugging.
 */
export function withErrorRecoverySync<T>(fn: () => T, fallback: T, context?: string): T {
	try {
		return fn();
	} catch (err) {
		console.error(`[recovery] ${context ?? 'unknown'}:`, err);
		return fallback;
	}
}

/**
 * Calls fn (sync or async) and returns its result. On error, logs with context and returns fallback.
 * Use this instead of silent `catch { }` blocks so errors remain visible for debugging.
 */
export async function withErrorRecovery<T>(fn: () => T | Promise<T>, fallback: T, context?: string): Promise<T> {
	try {
		return await fn();
	} catch (err) {
		console.error(`[recovery] ${context ?? 'unknown'}:`, err);
		return fallback;
	}
}

/**
 * Discriminated union returned by the Result variants of the recovery helpers.
 * Callers can branch on `ok` to handle errors explicitly without needing a fallback value.
 */
export type Result<T> = { ok: true; value: T } | { ok: false; error: unknown };

/**
 * Like withErrorRecoverySync but returns a Result instead of requiring a fallback.
 * Logs the error (same as the fallback variant) so failures remain visible.
 */
export function withErrorRecoverySyncResult<T>(fn: () => T, context?: string): Result<T> {
	try {
		return { ok: true, value: fn() };
	} catch (err) {
		console.error(`[recovery] ${context ?? 'unknown'}:`, err);
		return { ok: false, error: err };
	}
}

/**
 * Like withErrorRecovery but returns a Result instead of requiring a fallback.
 * Logs the error (same as the fallback variant) so failures remain visible.
 */
export async function withErrorRecoveryResult<T>(fn: () => T | Promise<T>, context?: string): Promise<Result<T>> {
	try {
		return { ok: true, value: await fn() };
	} catch (err) {
		console.error(`[recovery] ${context ?? 'unknown'}:`, err);
		return { ok: false, error: err };
	}
}
