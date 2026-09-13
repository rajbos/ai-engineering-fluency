import test from 'node:test';
import * as assert from 'node:assert/strict';
import { CONTEXT_NEAR_LIMIT_RATIO } from '../../../src/types';
import {
	countSessionsNearContextLimit,
	getSessionContextFillPercent,
	isSessionNearContextLimit,
	type SessionContextFill,
} from '../../../src/utils/contextFill';
import { mergeDbContextPressure } from '../../src/contextPressure';
import type { UsageAnalysisPeriod } from '../../../src/types';
import type { SessionContextWindow } from '../../src/copilotAppData';

function session(overrides: Partial<SessionContextFill> = {}): SessionContextFill {
	return { ...overrides };
}

// ---------------------------------------------------------------------------
// Fill percentage
// ---------------------------------------------------------------------------

test('getSessionContextFillPercent: returns the rounded fill percentage', () => {
	assert.equal(getSessionContextFillPercent(session({ contextWindowLimit: 200_000, contextReachedTokens: 150_000 })), 75);
	assert.equal(getSessionContextFillPercent(session({ contextWindowLimit: 128_000, contextReachedTokens: 64_500 })), 50);
});

test('getSessionContextFillPercent: clamps overshoot at 100%', () => {
	assert.equal(getSessionContextFillPercent(session({ contextWindowLimit: 100_000, contextReachedTokens: 130_000 })), 100);
});

test('getSessionContextFillPercent: undefined without a usable fill/limit pair', () => {
	assert.equal(getSessionContextFillPercent(session()), undefined);
	assert.equal(getSessionContextFillPercent(session({ contextWindowLimit: 200_000 })), undefined);
	assert.equal(getSessionContextFillPercent(session({ contextReachedTokens: 150_000 })), undefined);
	assert.equal(getSessionContextFillPercent(session({ contextWindowLimit: 200_000, contextReachedTokens: 0 })), undefined);
});

// ---------------------------------------------------------------------------
// Near-limit rule
// ---------------------------------------------------------------------------

test('isSessionNearContextLimit: true exactly at the threshold, false just below', () => {
	const limit = 200_000;
	const atThreshold = limit * CONTEXT_NEAR_LIMIT_RATIO;
	assert.equal(isSessionNearContextLimit(session({ contextWindowLimit: limit, contextReachedTokens: atThreshold })), true);
	assert.equal(isSessionNearContextLimit(session({ contextWindowLimit: limit, contextReachedTokens: atThreshold - 1 })), false);
});

test('isSessionNearContextLimit: compacted sessions are excluded', () => {
	const near = { contextWindowLimit: 200_000, contextReachedTokens: 190_000 };
	assert.equal(isSessionNearContextLimit(session(near)), true);
	assert.equal(isSessionNearContextLimit(session({ ...near, truncationCount: 1 })), false);
});

test('isSessionNearContextLimit: false without measured fill data', () => {
	assert.equal(isSessionNearContextLimit(session()), false);
	assert.equal(isSessionNearContextLimit(session({ contextWindowLimit: 200_000 })), false);
	assert.equal(isSessionNearContextLimit(session({ contextReachedTokens: 190_000 })), false);
});

test('countSessionsNearContextLimit: counts only the near-limit sessions', () => {
	const sessions: SessionContextFill[] = [
		{ contextWindowLimit: 200_000, contextReachedTokens: 190_000 },              // near
		{ contextWindowLimit: 200_000, contextReachedTokens: 100_000 },              // comfortable
		{ contextWindowLimit: 200_000, contextReachedTokens: 195_000, truncationCount: 2 }, // compacted
		{},                                                                          // no fill data
		{ contextWindowLimit: 128_000, contextReachedTokens: 128_000 },              // near
	];
	assert.equal(countSessionsNearContextLimit(sessions), 2);
});

// ---------------------------------------------------------------------------
// Agreement with the aggregate counter
// ---------------------------------------------------------------------------

/**
 * The insight quotes `sessionsNearLimit`, while the Recent Sessions filter it
 * links to uses `isSessionNearContextLimit`. If the two rules drift, the
 * insight's "N sessions" and the filtered list stop matching.
 */
test('isSessionNearContextLimit agrees with the sessionsNearLimit aggregate', () => {
	const rows: { reached: number; limit: number; compacted: boolean }[] = [
		{ reached: 190_000, limit: 200_000, compacted: false },
		{ reached: 160_000, limit: 200_000, compacted: false },
		{ reached: 159_999, limit: 200_000, compacted: false },
		{ reached: 199_000, limit: 200_000, compacted: true },
		{ reached: 10_000, limit: 200_000, compacted: false },
	];
	const period = {} as UsageAnalysisPeriod;
	for (const row of rows) {
		const info: SessionContextWindow = {
			uuid: 'u', contextTier: null, contextReachedTokens: row.reached, contextWindowLimit: row.limit,
		};
		mergeDbContextPressure(period, info, false, row.compacted);
	}
	const perSessionCount = countSessionsNearContextLimit(rows.map(r => ({
		contextWindowLimit: r.limit,
		contextReachedTokens: r.reached,
		...(r.compacted ? { truncationCount: 1 } : {}),
	})));
	assert.equal(perSessionCount, period.contextPressure!.sessionsNearLimit);
});
