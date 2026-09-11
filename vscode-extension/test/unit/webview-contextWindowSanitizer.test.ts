import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
	hasContextWindowData,
	sanitizeAutomaticCompactions,
	sanitizeContextPressure,
	sanitizeContextWindow,
} from '../../src/webview/usage/contextWindowSanitizer';

// ---------------------------------------------------------------------------
// sanitizeContextWindow
// ---------------------------------------------------------------------------

test('sanitizeContextWindow: rebuilds the aggregate and drops unknown fields', () => {
	const result = sanitizeContextWindow({
		maxRequestInputTokens: 142000,
		maxRequestModels: ['claude-sonnet-4.5', 42, null],
		tierCounts: { default: 48, long: '6' },
		maxReachedTokens: 126500,
		maxReachedWindowLimit: 128000,
		__proto__polluted: 'nope',
		extra: '<script>',
	});
	assert.deepEqual(result, {
		maxRequestInputTokens: 142000,
		maxRequestModels: ['claude-sonnet-4.5'],
		tierCounts: { default: 48, long: 0 },
		maxReachedTokens: 126500,
		maxReachedWindowLimit: 128000,
	});
});

test('sanitizeContextWindow: returns undefined for non-objects and coerces junk numbers', () => {
	assert.equal(sanitizeContextWindow(undefined), undefined);
	assert.equal(sanitizeContextWindow(null), undefined);
	assert.equal(sanitizeContextWindow('nope'), undefined);
	assert.deepEqual(sanitizeContextWindow({ maxRequestInputTokens: NaN }), {
		maxRequestInputTokens: 0,
		maxRequestModels: [],
		tierCounts: {},
	});
});

// ---------------------------------------------------------------------------
// sanitizeContextPressure
// ---------------------------------------------------------------------------

test('sanitizeContextPressure: survives a refresh round-trip with all counters intact', () => {
	// Regression: sanitizePeriod rebuilt each period field by field, so an
	// aggregate it did not copy was silently dropped on the first updateStats
	// refresh and the rows rendered from it disappeared.
	const result = sanitizeContextPressure({
		sessionsConsidered: 61,
		sessionsCompacted: 7,
		sessionsNearLimit: 9,
		sessionsWithFillData: 42,
		worstFillPercent: 99,
	});
	assert.deepEqual(result, {
		sessionsConsidered: 61,
		sessionsCompacted: 7,
		sessionsNearLimit: 9,
		sessionsWithFillData: 42,
		worstFillPercent: 99,
	});
});

test('sanitizeContextPressure: omits worstFillPercent when it is absent or not finite', () => {
	const noFill = sanitizeContextPressure({ sessionsConsidered: 3, sessionsCompacted: 1, sessionsNearLimit: 0, sessionsWithFillData: 0 });
	assert.equal('worstFillPercent' in noFill!, false);
	const badFill = sanitizeContextPressure({ worstFillPercent: Infinity });
	assert.equal('worstFillPercent' in badFill!, false);
	assert.deepEqual(badFill, {
		sessionsConsidered: 0, sessionsCompacted: 0, sessionsNearLimit: 0, sessionsWithFillData: 0,
	});
});

test('sanitizeContextPressure: returns undefined for non-objects', () => {
	assert.equal(sanitizeContextPressure(undefined), undefined);
	assert.equal(sanitizeContextPressure(7), undefined);
});

// ---------------------------------------------------------------------------
// sanitizeAutomaticCompactions
// ---------------------------------------------------------------------------

test('sanitizeAutomaticCompactions: rebuilds both sources and defaults missing ones to zero', () => {
	assert.deepEqual(sanitizeAutomaticCompactions({ total: 6, bySource: { copilotCli: 4, claude: 2 } }), {
		total: 6, bySource: { copilotCli: 4, claude: 2 },
	});
	assert.deepEqual(sanitizeAutomaticCompactions({ total: 3 }), {
		total: 3, bySource: { copilotCli: 0, claude: 0 },
	});
	assert.equal(sanitizeAutomaticCompactions(null), undefined);
});

// ---------------------------------------------------------------------------
// hasContextWindowData
// ---------------------------------------------------------------------------

test('hasContextWindowData: false only when every window signal is empty', () => {
	assert.equal(hasContextWindowData(undefined), false);
	assert.equal(hasContextWindowData({ maxRequestInputTokens: 0, maxRequestModels: [], tierCounts: {} }), false);
	assert.equal(hasContextWindowData({ maxRequestInputTokens: 1, maxRequestModels: [], tierCounts: {} }), true);
	assert.equal(hasContextWindowData({ maxRequestInputTokens: 0, maxRequestModels: [], tierCounts: {}, maxReachedTokens: 5 }), true);
	assert.equal(hasContextWindowData({ maxRequestInputTokens: 0, maxRequestModels: [], tierCounts: { default: 1 } }), true);
});

test('hasContextWindowData: is independent of the per-session pressure counters', () => {
	// A session format can report compaction without ever reporting a window
	// size, so the pressure rows must not be gated on this predicate.
	assert.equal(hasContextWindowData({ maxRequestInputTokens: 0, maxRequestModels: [], tierCounts: {} }), false);
	const pressureOnly = sanitizeContextPressure({ sessionsConsidered: 4, sessionsCompacted: 2, sessionsNearLimit: 0, sessionsWithFillData: 0 });
	assert.equal(pressureOnly!.sessionsCompacted, 2);
});
