import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	isObject,
	isSafePathSegment,
	isArrayIndexSegment,
	normalizeModelId,
	type JsonObject
} from '../../src/utils/typeGuards';

// ── isObject ────────────────────────────────────────────────────────────────

test('isObject: returns true for plain objects', () => {
	assert.ok(isObject({}));
	assert.ok(isObject({ a: 1 }));
});

test('isObject: returns true for arrays (they are objects)', () => {
	assert.ok(isObject([]));
	assert.ok(isObject([1, 2, 3]));
});

test('isObject: returns false for null', () => {
	assert.equal(isObject(null), false);
});

test('isObject: returns false for primitives', () => {
	assert.equal(isObject(undefined), false);
	assert.equal(isObject(42), false);
	assert.equal(isObject('string'), false);
	assert.equal(isObject(true), false);
});

test('isObject: narrows to JsonObject so key access compiles', () => {
	const value: unknown = { key: 'value' };
	if (isObject(value)) {
		const typed: JsonObject = value;
		assert.equal(typed['key'], 'value');
	} else {
		assert.fail('Expected isObject to return true');
	}
});

// ── isSafePathSegment ────────────────────────────────────────────────────────

test('isSafePathSegment: accepts normal string keys', () => {
	assert.ok(isSafePathSegment('foo'));
	assert.ok(isSafePathSegment('bar123'));
	assert.ok(isSafePathSegment('0'));
	assert.ok(isSafePathSegment('hello-world'));
});

test('isSafePathSegment: rejects forbidden prototype pollution keys', () => {
	assert.equal(isSafePathSegment('__proto__'), false);
	assert.equal(isSafePathSegment('prototype'), false);
	assert.equal(isSafePathSegment('constructor'), false);
	assert.equal(isSafePathSegment('hasOwnProperty'), false);
});

test('isSafePathSegment: rejects any key starting with double underscore', () => {
	assert.equal(isSafePathSegment('__anything'), false);
	assert.equal(isSafePathSegment('__defineGetter__'), false);
});

test('isSafePathSegment: returns false for non-string values', () => {
	// The function signature is `seg: string` but it guards at runtime too.
	assert.equal(isSafePathSegment(null as unknown as string), false);
	assert.equal(isSafePathSegment(undefined as unknown as string), false);
	assert.equal(isSafePathSegment(42 as unknown as string), false);
});

// ── isArrayIndexSegment ──────────────────────────────────────────────────────

test('isArrayIndexSegment: returns true for digit-only strings', () => {
	assert.ok(isArrayIndexSegment('0'));
	assert.ok(isArrayIndexSegment('1'));
	assert.ok(isArrayIndexSegment('42'));
	assert.ok(isArrayIndexSegment('100'));
});

test('isArrayIndexSegment: returns false for non-digit strings', () => {
	assert.equal(isArrayIndexSegment(''), false);
	assert.equal(isArrayIndexSegment('abc'), false);
	assert.equal(isArrayIndexSegment('1a'), false);
	assert.equal(isArrayIndexSegment('-1'), false);
	assert.equal(isArrayIndexSegment('1.5'), false);
});

// ── normalizeModelId ─────────────────────────────────────────────────────────

test('normalizeModelId: returns defaultModel for non-string values', () => {
	assert.equal(normalizeModelId(null, 'default'), 'default');
	assert.equal(normalizeModelId(undefined, 'default'), 'default');
	assert.equal(normalizeModelId(42, 'default'), 'default');
	assert.equal(normalizeModelId({}, 'default'), 'default');
});

test('normalizeModelId: returns defaultModel for empty or whitespace strings', () => {
	assert.equal(normalizeModelId('', 'default'), 'default');
	assert.equal(normalizeModelId('   ', 'default'), 'default');
});

test('normalizeModelId: strips copilot/ prefix', () => {
	assert.equal(normalizeModelId('copilot/gpt-4o', 'default'), 'gpt-4o');
	assert.equal(normalizeModelId('copilot/claude-3.5-sonnet', 'default'), 'claude-3.5-sonnet');
});

test('normalizeModelId: trims whitespace before stripping prefix', () => {
	assert.equal(normalizeModelId('  copilot/gpt-4o  ', 'default'), 'gpt-4o');
});

test('normalizeModelId: returns trimmed value for non-prefixed models', () => {
	assert.equal(normalizeModelId('gpt-4o', 'default'), 'gpt-4o');
	assert.equal(normalizeModelId('  gpt-4o  ', 'default'), 'gpt-4o');
});

test('normalizeModelId: does not strip copilot/ that appears mid-string', () => {
	assert.equal(normalizeModelId('my-copilot/model', 'default'), 'my-copilot/model');
});
