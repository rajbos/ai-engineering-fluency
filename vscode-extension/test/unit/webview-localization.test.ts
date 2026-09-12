import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
	initializeWebviewLocalization,
	localize,
	localizeFormat,
} from '../../src/webview/shared/localization';

// The webview gets its strings as a flat payload from the extension host, so
// these helpers are the last hop before a label reaches the DOM. Everything
// below resets the payload it depends on, because the module holds the current
// bundle in module state shared across tests.

test('localizeFormat: substitutes {0}/{1} placeholders in order', () => {
	initializeWebviewLocalization({});
	assert.equal(localizeFormat('usage.contextPressure.ofCount', 3, 12), '3 of 12');
	assert.equal(
		localizeFormat('usage.contextPressure.worstFill', 94),
		'Fullest session reached 94% of its window',
	);
});

test('localizeFormat: honours a translated template, including reordered placeholders', () => {
	// zh-cn phrases the count the other way round, so a naive concatenation
	// would render "3 个中的 12 个" — the numbers swapped.
	initializeWebviewLocalization({ 'usage.contextPressure.ofCount': '{1} 个中的 {0} 个' });
	assert.equal(localizeFormat('usage.contextPressure.ofCount', 3, 12), '12 个中的 3 个');
	initializeWebviewLocalization({});
});

test('localizeFormat: leaves placeholders intact when an argument is missing', () => {
	// Degrading to a visible "{1}" beats rendering the string "undefined".
	initializeWebviewLocalization({});
	assert.equal(localizeFormat('usage.contextPressure.ofCount', 3), '3 of {1}');
});

test('localizeFormat: falls back to the key itself for an unknown string', () => {
	initializeWebviewLocalization({});
	assert.equal(localizeFormat('usage.contextPressure.nope', 1), 'usage.contextPressure.nope');
});

test('localize: the context-pressure defaults are present without any payload', () => {
	// The extension host passes these through getWebviewLocalization(), but the
	// view must not show raw keys if that payload is ever missing.
	initializeWebviewLocalization({});
	for (const key of [
		'usage.contextPressure.compactedLabel',
		'usage.contextPressure.noneCompacted',
		'usage.contextPressure.compactedTooltip',
		'usage.contextPressure.nearLimitLabel',
		'usage.contextPressure.nearLimitTooltip',
	]) {
		assert.notEqual(localize(key), key, `${key} should have a built-in English default`);
	}
});

test('localize: a raw unresolved key in the payload falls back to the English default', () => {
	// initializeWebviewLocalization drops entries whose value equals their key,
	// which is what the extension sends when its bundle failed to load.
	initializeWebviewLocalization({
		'usage.contextPressure.compactedLabel': 'usage.contextPressure.compactedLabel',
	});
	assert.equal(localize('usage.contextPressure.compactedLabel'), '🗜️ Sessions compacted');
	initializeWebviewLocalization({});
});
