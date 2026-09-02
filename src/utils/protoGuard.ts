/**
 * Guards against prototype-pollution when a string pulled from untrusted, parsed
 * JSON (e.g. a "model" field from a session-log file) is used as a bracket-notation
 * key into a plain JS object (`obj[key] = ...`).
 *
 * Why this matters: `obj['__proto__']` does not create/read an own property named
 * "__proto__" — it resolves through the inherited accessor on Object.prototype and
 * returns the object's actual [[Prototype]] (Object.prototype for plain object
 * literals). A common accumulator pattern like:
 *
 *   if (!map[key]) { map[key] = { inputTokens: 0, ... }; }
 *   map[key].inputTokens += n;
 *
 * is safe for ordinary keys, but when key === '__proto__', `map[key]` reads the
 * *real*, shared Object.prototype (which is truthy), so the initializer is skipped
 * and `map[key].inputTokens += n` mutates Object.prototype directly — corrupting
 * every plain object in the process, not just this map. "constructor" / "prototype"
 * keys enable related gadgets (e.g. reaching a shared class prototype).
 *
 * Session-log parsers should check untrusted keys with {@link isUnsafeObjectKey}
 * before using them as an index into a plain accumulator object, and skip the
 * entry (same as any other malformed/unrecognised data) when it's unsafe.
 */
const UNSAFE_OBJECT_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function isUnsafeObjectKey(key: string): boolean {
	return UNSAFE_OBJECT_KEYS.has(key);
}
