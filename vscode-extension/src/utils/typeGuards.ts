/**
 * A plain JSON object with string keys and unknown values.
 */
export type JsonObject = Record<string, unknown>;

/**
 * Returns true when `value` is a non-null object (i.e. a plain object or array).
 * Use this as a type guard before accessing dynamic keys on `unknown` values.
 */
export function isObject(value: unknown): value is JsonObject {
	return typeof value === 'object' && value !== null;
}

/**
 * Returns true when `seg` is safe to use as a property key.
 * Guards against prototype pollution by rejecting well-known dangerous names
 * (`__proto__`, `prototype`, `constructor`, `hasOwnProperty`) and any segment
 * that starts with `__`.
 */
export function isSafePathSegment(seg: string): boolean {
	if (typeof seg !== 'string') {
		return false;
	}
	const forbidden = ['__proto__', 'prototype', 'constructor', 'hasOwnProperty'];
	return !forbidden.includes(seg) && !seg.startsWith('__');
}

/**
 * Returns true when `seg` is a non-negative integer string (e.g. `"0"`, `"42"`).
 * Used to decide whether a path segment should address an array index.
 */
export function isArrayIndexSegment(seg: string): boolean {
	return /^\d+$/.test(seg);
}

/**
 * Normalise a raw model identifier to a canonical string.
 *
 * - Non-string values fall back to `defaultModel`.
 * - Empty / whitespace-only strings fall back to `defaultModel`.
 * - Strings prefixed with `"copilot/"` have that prefix stripped.
 */
export function normalizeModelId(model: unknown, defaultModel: string): string {
	if (typeof model !== 'string') {
		return defaultModel;
	}
	const trimmed = model.trim();
	if (!trimmed) {
		return defaultModel;
	}
	return trimmed.startsWith('copilot/') ? trimmed.substring('copilot/'.length) : trimmed;
}
