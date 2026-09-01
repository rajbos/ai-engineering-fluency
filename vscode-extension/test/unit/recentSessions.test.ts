import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';
import { buildRecentSessionBuckets } from '../../../src/recentSessions';
import { sanitizeRecentSessionBuckets } from '../../src/webview/usage/recentSessionsSanitizer';

describe('buildRecentSessionBuckets', () => {
	test('buckets recent sessions and sorts each period by interactions', () => {
		const result = buildRecentSessionBuckets([
			{ activityKey: '2026-08-31', interactions: 2, value: 'recent-low' },
			{ activityKey: '2026-08-30', interactions: 8, value: 'recent-high' },
			{ activityKey: '2026-08-15', interactions: 5, value: 'month-only' },
			{ activityKey: '2026-07-20', interactions: 20, value: 'too-old' },
		], new Date(2026, 8, 1, 12));

		assert.deepEqual(result.last7, ['recent-high', 'recent-low']);
		assert.deepEqual(result.last30, ['recent-high', 'month-only', 'recent-low']);
		assert.deepEqual(result.currentMonth, []);
	});
});

describe('sanitizeRecentSessionBuckets', () => {
	test('filters malformed summaries while preserving every supported period', () => {
		const result = sanitizeRecentSessionBuckets({
			last7: [{ interactions: 3, filePath: 'session.jsonl' }, null, { interactions: '3' }],
			last30: [],
			currentMonth: [{ interactions: 1 }],
		});

		assert.deepEqual(result, {
			last7: [{ interactions: 3, filePath: 'session.jsonl' }],
			last30: [],
			currentMonth: [{ interactions: 1 }],
		});
	});

	test('rejects partial payloads so callers can use their lazy-loading fallback', () => {
		assert.equal(sanitizeRecentSessionBuckets({ last7: [] }), undefined);
	});
});
