/**
 * Unit tests for the `segment --json` payload builder.
 * Tests cli/src/commands/segment.ts
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';

import { buildJsonPayload } from '../commands/segment';

const sampleEntry = {
	updatedAt: '2026-08-25T12:20:51.085Z',
	formatted: '7.7M today · 12.3M month · 1.5B 30d',
	todayTokens: 7_700_000,
	thisMonthTokens: 12_300_000,
	last30DaysTokens: 1_500_000_000,
};

test('buildJsonPayload includes raw and formatted token counts', () => {
	const payload = JSON.parse(buildJsonPayload(sampleEntry, true));

	assert.equal(payload.today, sampleEntry.todayTokens);
	assert.equal(payload.month, sampleEntry.thisMonthTokens);
	assert.equal(payload.last30Days, sampleEntry.last30DaysTokens);
	assert.equal(payload.todayFormatted, '7.7M');
	assert.equal(payload.monthFormatted, '12.3M');
	assert.equal(payload.last30DaysFormatted, '1.5B');
	assert.equal(payload.formatted, sampleEntry.formatted);
	assert.equal(payload.updatedAt, sampleEntry.updatedAt);
});

test('buildJsonPayload reflects the cached flag passed in', () => {
	const cachedPayload = JSON.parse(buildJsonPayload(sampleEntry, true));
	const freshPayload = JSON.parse(buildJsonPayload(sampleEntry, false));

	assert.equal(cachedPayload.cached, true);
	assert.equal(freshPayload.cached, false);
});

test('buildJsonPayload handles zero token counts', () => {
	const payload = JSON.parse(buildJsonPayload({
		updatedAt: '2026-08-25T12:20:51.085Z',
		formatted: '',
		todayTokens: 0,
		thisMonthTokens: 0,
		last30DaysTokens: 0,
	}, false));

	assert.equal(payload.today, 0);
	assert.equal(payload.todayFormatted, '0');
});
