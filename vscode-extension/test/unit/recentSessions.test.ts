import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';
import { buildRecentSessionBuckets } from '../../../src/recentSessions';
import { sanitizeRecentSessionBuckets } from '../../src/webview/usage/recentSessionsSanitizer';

const validSessionSummary = {
	title: 'Recent session',
	filePath: 'session.jsonl',
	interactions: 3,
	toolCalls: 2,
	inputTokens: 100,
	outputTokens: 50,
	thinkingTokens: 10,
	cachedTokens: 20,
	totalTokens: 180,
	estimatedCost: 0.01,
	editor: 'VS Code',
	models: ['gpt-5'],
	lastActivity: '2026-08-31T12:00:00.000Z',
};

describe('buildRecentSessionBuckets', () => {
	test('buckets recent sessions and sorts each period by interactions', () => {
		const result = buildRecentSessionBuckets([
			{ activityKey: '2026-08-31', interactions: 2, value: 'recent-low' },
			{ activityKey: '2026-08-30', interactions: 8, value: 'recent-high' },
			{ activityKey: '2026-08-15', interactions: 5, value: 'month-only' },
			{ activityKey: '2026-08-25', interactions: 6, value: 'outside-last7' },
			{ activityKey: '2026-07-20', interactions: 20, value: 'too-old' },
		], new Date(2026, 8, 1, 12));

		assert.deepEqual(result.last7, ['recent-high', 'recent-low']);
		assert.deepEqual(result.last30, ['recent-high', 'outside-last7', 'month-only', 'recent-low']);
		assert.deepEqual(result.currentMonth, []);
	});
});

describe('sanitizeRecentSessionBuckets', () => {
	test('filters incomplete or malformed summaries while preserving every supported period', () => {
		const result = sanitizeRecentSessionBuckets({
			last7: [
				validSessionSummary,
				null,
				{ interactions: 1 },
				{ ...validSessionSummary, estimatedCost: undefined },
				{ ...validSessionSummary, models: ['gpt-5', 5] },
			],
			last30: [],
			currentMonth: [{ ...validSessionSummary, title: null, workspace: 'token-tracker' }],
		});

		assert.deepEqual(result, {
			last7: [validSessionSummary],
			last30: [],
			currentMonth: [{ ...validSessionSummary, title: null, workspace: 'token-tracker' }],
		});
	});

	test('rejects partial payloads so callers can use their lazy-loading fallback', () => {
		assert.equal(sanitizeRecentSessionBuckets({ last7: [] }), undefined);
	});
});
