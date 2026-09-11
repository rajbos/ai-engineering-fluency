import test from 'node:test';
import * as assert from 'node:assert/strict';
import type { SessionFileCache, UsageAnalysisPeriod } from '../../../src/types';
import type { SessionContextWindow } from '../../src/copilotAppData';
import {
	ensureContextPressure,
	hasContextSignal,
	mergeDbContextPressure,
	mergeSessionContextPressure,
	sessionCompactionEvents,
} from '../../src/contextPressure';

// A period only needs its contextPressure slot for these helpers; the rest of
// the aggregate is irrelevant to the arithmetic under test.
function period(): UsageAnalysisPeriod {
	return {} as UsageAnalysisPeriod;
}

function session(overrides: Partial<SessionFileCache> = {}): SessionFileCache {
	return overrides as SessionFileCache;
}

function compactingSession(events: number): SessionFileCache {
	return session({
		usageAnalysis: { toolCalls: { byTool: { __auto_compact__: events } } },
	} as unknown as Partial<SessionFileCache>);
}

function dbRow(overrides: Partial<SessionContextWindow> = {}): SessionContextWindow {
	return {
		uuid: 'u1',
		contextTier: null,
		contextReachedTokens: null,
		contextWindowLimit: null,
		...overrides,
	};
}

// ---------------------------------------------------------------------------
// Signal detection
// ---------------------------------------------------------------------------

test('hasContextSignal: a session with no context fields at all is not counted', () => {
	assert.equal(hasContextSignal(session()), false);
	assert.equal(hasContextSignal(session({ truncationCount: 0 })), false);
});

test('hasContextSignal: any one of request size, tier or compaction is enough', () => {
	assert.equal(hasContextSignal(session({ maxRequestInputTokens: 1000 })), true);
	assert.equal(hasContextSignal(session({ contextTier: 'default' })), true);
	assert.equal(hasContextSignal(session({ truncationCount: 1 })), true);
	assert.equal(hasContextSignal(compactingSession(1)), true);
});

test('sessionCompactionEvents: sums truncations and auto-compact tool calls', () => {
	assert.equal(sessionCompactionEvents(session()), 0);
	assert.equal(sessionCompactionEvents(session({ truncationCount: 2 })), 2);
	assert.equal(sessionCompactionEvents(compactingSession(3)), 3);
});

// ---------------------------------------------------------------------------
// Session-cache merge
// ---------------------------------------------------------------------------

test('mergeSessionContextPressure: counts a session once regardless of how often it compacted', () => {
	// sessionsCompacted is a session count, not an event count — five
	// compactions in one session is still one session.
	const p = period();
	mergeSessionContextPressure(p, compactingSession(5));
	assert.deepEqual(p.contextPressure, {
		sessionsConsidered: 1, sessionsCompacted: 1, sessionsNearLimit: 0, sessionsWithFillData: 0,
	});
});

test('mergeSessionContextPressure: a signal-free session creates no aggregate at all', () => {
	const p = period();
	mergeSessionContextPressure(p, session());
	assert.equal(p.contextPressure, undefined);
});

// ---------------------------------------------------------------------------
// data.db merge — the de-duplication contract
// ---------------------------------------------------------------------------

test('mergeDbContextPressure: alreadyCounted stops a session being counted twice', () => {
	// The same session reaches both paths: once from its session-cache entry
	// and once from its data.db row. sessionsConsidered must stay at one.
	const p = period();
	const cache = session({ maxRequestInputTokens: 90_000 });
	mergeSessionContextPressure(p, cache);
	mergeDbContextPressure(p, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 95_000 }), hasContextSignal(cache), false);

	const cp = p.contextPressure!;
	assert.equal(cp.sessionsConsidered, 1, 'the session must not be counted twice');
	assert.equal(cp.sessionsWithFillData, 1);
	assert.equal(cp.sessionsNearLimit, 1);
	assert.ok(cp.sessionsNearLimit <= cp.sessionsConsidered, 'near-limit can never exceed the denominator');
});

test('mergeDbContextPressure: a DB-only session is added to the denominator', () => {
	const p = period();
	mergeDbContextPressure(p, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 50_000 }), false, false);
	assert.equal(p.contextPressure!.sessionsConsidered, 1);
	assert.equal(p.contextPressure!.sessionsWithFillData, 1);
	assert.equal(p.contextPressure!.sessionsNearLimit, 0);
});

test('mergeDbContextPressure: a tier-only row counts towards the denominator but not the fill set', () => {
	// Regression: this returned early, so a session known only by its tier was
	// missing from sessionsConsidered while still appearing in tierCounts —
	// which inflated the reported compaction share.
	const p = period();
	mergeDbContextPressure(p, dbRow({ contextTier: 'default' }), false, false);
	assert.deepEqual(p.contextPressure, {
		sessionsConsidered: 1, sessionsCompacted: 0, sessionsNearLimit: 0, sessionsWithFillData: 0,
	});
});

test('mergeDbContextPressure: a row with neither fill nor tier creates no aggregate', () => {
	const p = period();
	mergeDbContextPressure(p, dbRow(), false, false);
	assert.equal(p.contextPressure, undefined);
	mergeDbContextPressure(p, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 0 }), false, false);
	assert.equal(p.contextPressure, undefined);
});

// ---------------------------------------------------------------------------
// Near-limit threshold and fill maths
// ---------------------------------------------------------------------------

test('mergeDbContextPressure: the near-limit band starts exactly at 80% of the window', () => {
	const at = period();
	mergeDbContextPressure(at, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 80_000 }), false, false);
	assert.equal(at.contextPressure!.sessionsNearLimit, 1, '80% is inside the band');

	const below = period();
	mergeDbContextPressure(below, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 79_999 }), false, false);
	assert.equal(below.contextPressure!.sessionsNearLimit, 0, 'just under 80% is outside the band');
});

test('mergeDbContextPressure: a compacted session is never also counted as near-limit', () => {
	// Compaction resets the fill the session would be judged on, and the
	// session is already represented by sessionsCompacted — counting it in
	// both would double-report the same problem.
	const p = period();
	mergeDbContextPressure(p, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 99_000 }), true, true);
	assert.equal(p.contextPressure!.sessionsNearLimit, 0);
	assert.equal(p.contextPressure!.sessionsWithFillData, 1);
	assert.equal(p.contextPressure!.worstFillPercent, 99, 'the fill is still worth reporting');
});

test('mergeDbContextPressure: worstFillPercent keeps the highest value and is capped at 100', () => {
	const p = period();
	mergeDbContextPressure(p, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 40_000 }), false, false);
	mergeDbContextPressure(p, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 90_000 }), false, false);
	mergeDbContextPressure(p, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 50_000 }), false, false);
	assert.equal(p.contextPressure!.worstFillPercent, 90, 'a later smaller fill must not lower the worst');

	// A session can report more tokens than its recorded limit; a percentage
	// over 100 would read as a bug to the user.
	const over = period();
	mergeDbContextPressure(over, dbRow({ contextWindowLimit: 100_000, contextReachedTokens: 140_000 }), false, false);
	assert.equal(over.contextPressure!.worstFillPercent, 100);
});

test('ensureContextPressure: reuses the existing aggregate rather than resetting it', () => {
	const p = period();
	const first = ensureContextPressure(p);
	first.sessionsConsidered = 7;
	assert.equal(ensureContextPressure(p).sessionsConsidered, 7);
});
