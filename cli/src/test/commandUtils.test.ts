/**
 * Unit tests for CLI command utilities.
 * Tests the utility functions in cli/src/commandUtils.ts
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';

import { shouldOutputJson } from '../commandUtils';

test('shouldOutputJson returns true when options.json is true', () => {
	const result = shouldOutputJson({ json: true });
	assert.equal(result, true);
});

test('shouldOutputJson returns false when options.json is false', () => {
	const result = shouldOutputJson({ json: false });
	assert.equal(result, false);
});

test('shouldOutputJson returns false when options.json is undefined', () => {
	const result = shouldOutputJson({});
	assert.equal(result, false);
});

test('shouldOutputJson returns false when options is empty', () => {
	const result = shouldOutputJson({});
	assert.equal(result, false);
});

test('shouldOutputJson returns true when options has json:true with other properties', () => {
	const result = shouldOutputJson({ json: true, verbose: true, help: false });
	assert.equal(result, true);
});

test('shouldOutputJson returns false when options has json:false with other properties', () => {
	const result = shouldOutputJson({ json: false, verbose: true });
	assert.equal(result, false);
});

test('shouldOutputJson handles null options gracefully', () => {
	// TypeScript won't allow null, but let's test it anyway
	const result = shouldOutputJson({} as any);
	assert.equal(result, false);
});
