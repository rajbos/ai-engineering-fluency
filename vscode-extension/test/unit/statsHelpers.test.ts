import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
addModelUsage,
addEditorUsage,
computeUtcDateRanges,
aggregatePeriodStats,
type SessionAggregateInput,
type UtcDateRanges,
} from '../../src/statsHelpers';
import type { ModelUsage, EditorUsage, SessionFileCache } from '../../src/types';

// ── Helper factory ───────────────────────────────────────────────────────────

function makeSession(overrides: Partial<SessionFileCache> = {}): SessionFileCache {
return {
tokens: 100,
interactions: 1,
modelUsage: {},
mtime: 0,
actualTokens: 0,
thinkingTokens: 0,
...overrides,
};
}

/** Build a UtcDateRanges object from a "today" UTC day key (YYYY-MM-DD). */
function makeRanges(todayUtcKey: string): UtcDateRanges {
const [year, month, day] = todayUtcKey.split('-').map(Number);
// month is 1-based here; Date.UTC uses 0-based months
const monthUtcStartKey = new Date(Date.UTC(year, month - 1, 1)).toISOString().slice(0, 10);
const lastMonthLastDay = new Date(Date.UTC(year, month - 1, 0));
const lastMonthUtcEndKey = lastMonthLastDay.toISOString().slice(0, 10);
const lastMonthUtcStartKey = new Date(
Date.UTC(lastMonthLastDay.getUTCFullYear(), lastMonthLastDay.getUTCMonth(), 1),
).toISOString().slice(0, 10);
const last30DaysUtcStart = new Date(Date.UTC(year, month - 1, day - 30));
const last30DaysUtcStartKey = last30DaysUtcStart.toISOString().slice(0, 10);
const last30DaysStartMs = last30DaysUtcStart.getTime();
const lastMonthStartMs = new Date(Date.UTC(lastMonthLastDay.getUTCFullYear(), lastMonthLastDay.getUTCMonth(), 1)).getTime();
return { todayUtcKey, monthUtcStartKey, lastMonthUtcStartKey, lastMonthUtcEndKey, last30DaysUtcStartKey, last30DaysStartMs, lastMonthStartMs };
}

// ── addModelUsage ────────────────────────────────────────────────────────────

test('addModelUsage: adds a new model to an empty target', () => {
const target: ModelUsage = {};
const source: ModelUsage = { 'gpt-4': { inputTokens: 100, outputTokens: 50 } };
addModelUsage(target, source);
assert.deepEqual(target['gpt-4'], { inputTokens: 100, outputTokens: 50 });
});

test('addModelUsage: accumulates tokens for an existing model', () => {
const target: ModelUsage = { 'gpt-4': { inputTokens: 200, outputTokens: 100 } };
const source: ModelUsage = { 'gpt-4': { inputTokens: 50, outputTokens: 25 } };
addModelUsage(target, source);
assert.deepEqual(target['gpt-4'], { inputTokens: 250, outputTokens: 125 });
});

test('addModelUsage: merges multiple models at once', () => {
const target: ModelUsage = { 'gpt-4': { inputTokens: 100, outputTokens: 50 } };
const source: ModelUsage = {
'gpt-4': { inputTokens: 10, outputTokens: 5 },
'claude-3-5-sonnet': { inputTokens: 200, outputTokens: 100 },
};
addModelUsage(target, source);
assert.deepEqual(target['gpt-4'], { inputTokens: 110, outputTokens: 55 });
assert.deepEqual(target['claude-3-5-sonnet'], { inputTokens: 200, outputTokens: 100 });
});

test('addModelUsage: merges cachedReadTokens from source to empty target', () => {
const target: ModelUsage = {};
const source: ModelUsage = { 'claude-3-5-sonnet': { inputTokens: 300, outputTokens: 150, cachedReadTokens: 80 } };
addModelUsage(target, source);
assert.equal(target['claude-3-5-sonnet'].cachedReadTokens, 80);
});

test('addModelUsage: accumulates cachedReadTokens when both have the field', () => {
const target: ModelUsage = { 'claude-3-5-sonnet': { inputTokens: 300, outputTokens: 150, cachedReadTokens: 40 } };
const source: ModelUsage = { 'claude-3-5-sonnet': { inputTokens: 100, outputTokens: 50, cachedReadTokens: 20 } };
addModelUsage(target, source);
assert.equal(target['claude-3-5-sonnet'].cachedReadTokens, 60);
});

test('addModelUsage: merges cacheCreationTokens', () => {
const target: ModelUsage = { 'claude-3-5-sonnet': { inputTokens: 300, outputTokens: 150 } };
const source: ModelUsage = { 'claude-3-5-sonnet': { inputTokens: 100, outputTokens: 50, cacheCreationTokens: 30 } };
addModelUsage(target, source);
assert.equal(target['claude-3-5-sonnet'].cacheCreationTokens, 30);
});

test('addModelUsage: accumulates both cache fields together', () => {
const target: ModelUsage = {
'claude-3-5-sonnet': { inputTokens: 300, outputTokens: 150, cachedReadTokens: 20, cacheCreationTokens: 10 }
};
const source: ModelUsage = {
'claude-3-5-sonnet': { inputTokens: 100, outputTokens: 50, cachedReadTokens: 5, cacheCreationTokens: 3 }
};
addModelUsage(target, source);
assert.deepEqual(target['claude-3-5-sonnet'], {
inputTokens: 400,
outputTokens: 200,
cachedReadTokens: 25,
cacheCreationTokens: 13,
});
});

test('addModelUsage: does not add undefined cache fields to target', () => {
const target: ModelUsage = {};
const source: ModelUsage = { 'gpt-4': { inputTokens: 100, outputTokens: 50 } };
addModelUsage(target, source);
assert.equal(target['gpt-4'].cachedReadTokens, undefined);
assert.equal(target['gpt-4'].cacheCreationTokens, undefined);
});

test('addModelUsage: source with empty object is a no-op', () => {
const target: ModelUsage = { 'gpt-4': { inputTokens: 100, outputTokens: 50 } };
addModelUsage(target, {});
assert.deepEqual(target, { 'gpt-4': { inputTokens: 100, outputTokens: 50 } });
});

// ── addEditorUsage ────────────────────────────────────────────────────────────

test('addEditorUsage: creates a new entry for an unknown editor type', () => {
const target: EditorUsage = {};
addEditorUsage(target, 'vscode', 1000);
assert.deepEqual(target['vscode'], { tokens: 1000, sessions: 1 });
});

test('addEditorUsage: accumulates tokens and increments sessions for existing editor', () => {
const target: EditorUsage = { 'vscode': { tokens: 500, sessions: 1 } };
addEditorUsage(target, 'vscode', 300);
assert.deepEqual(target['vscode'], { tokens: 800, sessions: 2 });
});

test('addEditorUsage: tracks multiple editor types independently', () => {
const target: EditorUsage = {};
addEditorUsage(target, 'vscode', 1000);
addEditorUsage(target, 'cursor', 500);
addEditorUsage(target, 'vscode', 200);
assert.deepEqual(target['vscode'], { tokens: 1200, sessions: 2 });
assert.deepEqual(target['cursor'], { tokens: 500, sessions: 1 });
});

test('addEditorUsage: increments sessions even when tokens are 0', () => {
const target: EditorUsage = {};
addEditorUsage(target, 'vscode', 0);
assert.equal(target['vscode'].sessions, 1);
assert.equal(target['vscode'].tokens, 0);
});

// ── computeUtcDateRanges ─────────────────────────────────────────────────────
// Note: computeUtcDateRanges now uses LOCAL calendar dates so that "today"
// reflects the user's local clock. Tests use local date constructors
// (new Date(year, month, day, ...)) to be timezone-agnostic.
// To verify timezone behaviour: TZ=Europe/Amsterdam node --test out/test/unit/statsHelpers.test.js

test('computeUtcDateRanges: todayUtcKey is the local calendar date of the input', () => {
const now = new Date(2024, 4, 15, 14, 30, 0); // local May 15, 2024 at 14:30
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.todayUtcKey, '2024-05-15');
});

// Local midnight boundary: just before local midnight — still the previous day
test('computeUtcDateRanges: just before local midnight resolves to the preceding day', () => {
const now = new Date(2024, 4, 14, 23, 59, 59, 999); // local May 14 at 23:59:59.999
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.todayUtcKey, '2024-05-14');
});

// Local midnight boundary: at local midnight — flips to the new day
test('computeUtcDateRanges: at local midnight resolves to the new day', () => {
const now = new Date(2024, 4, 15, 0, 0, 0, 0); // local May 15 at 00:00:00.000
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.todayUtcKey, '2024-05-15');
});

// DST transition: local date arithmetic via new Date(y, m, d) handles DST automatically
test('computeUtcDateRanges: DST spring-forward day is the correct local date', () => {
// Local March 10, 2024 at 10:00 AM — well after any spring-forward gap
const now = new Date(2024, 2, 10, 10, 0, 0); // local March 10, 2024
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.todayUtcKey, '2024-03-10');
});

test('computeUtcDateRanges: DST fall-back day is the correct local date', () => {
// Local November 3, 2024 at 00:30 AM
const now = new Date(2024, 10, 3, 0, 30, 0); // local November 3, 2024
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.todayUtcKey, '2024-11-03');
});

// Month rollover: last day of a month
test('computeUtcDateRanges: last day of January produces correct month boundaries', () => {
const now = new Date(2024, 0, 31, 12, 0, 0); // local January 31, 2024
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.todayUtcKey, '2024-01-31');
assert.equal(ranges.monthUtcStartKey, '2024-01-01');
assert.equal(ranges.lastMonthUtcStartKey, '2023-12-01');
assert.equal(ranges.lastMonthUtcEndKey, '2023-12-31');
});

// Month rollover: first day of the next month
test('computeUtcDateRanges: first day of February produces correct month boundaries', () => {
const now = new Date(2024, 1, 1, 0, 0, 0); // local February 1, 2024 at midnight
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.todayUtcKey, '2024-02-01');
assert.equal(ranges.monthUtcStartKey, '2024-02-01');
assert.equal(ranges.lastMonthUtcStartKey, '2024-01-01');
assert.equal(ranges.lastMonthUtcEndKey, '2024-01-31');
});

// Month rollover over a year boundary
test('computeUtcDateRanges: January 1st has December as previous month', () => {
const now = new Date(2025, 0, 1, 0, 0, 0); // local January 1, 2025
const ranges = computeUtcDateRanges(now);
assert.equal(ranges.monthUtcStartKey, '2025-01-01');
assert.equal(ranges.lastMonthUtcStartKey, '2024-12-01');
assert.equal(ranges.lastMonthUtcEndKey, '2024-12-31');
});

// 30-day window boundary: a file older than 30 days must fall before last30DaysStartMs
test('computeUtcDateRanges: file mtime 31 days ago is outside the 30-day window', () => {
const now = new Date(2024, 4, 15, 12, 0, 0); // local May 15 at noon
const ranges = computeUtcDateRanges(now);
// 31 local days before May 15 = April 14; any time on April 14 is before the window start
const fileOlderThan30Days = new Date(2024, 3, 14, 11, 59, 59, 999).getTime();
assert.ok(fileOlderThan30Days < ranges.last30DaysStartMs,
'mtime 31 days ago should be less than last30DaysStartMs (i.e. excluded)');
});

test('computeUtcDateRanges: file mtime exactly at window start is inside the 30-day window', () => {
const now = new Date(2024, 4, 15, 12, 0, 0); // local May 15 at noon
const ranges = computeUtcDateRanges(now);
const fileAtWindowStart = ranges.last30DaysStartMs;
assert.ok(fileAtWindowStart >= ranges.last30DaysStartMs,
'mtime at window start boundary should not be excluded');
});

test('computeUtcDateRanges: last30DaysUtcStartKey is 30 local days before todayUtcKey', () => {
const now = new Date(2024, 4, 15, 12, 0, 0); // local May 15
const ranges = computeUtcDateRanges(now);
// April 15 is 30 days before May 15
assert.equal(ranges.last30DaysUtcStartKey, '2024-04-15');
});

test('computeUtcDateRanges: 30-day window crosses a month boundary correctly', () => {
const now = new Date(2024, 2, 10, 12, 0, 0); // local March 10
const ranges = computeUtcDateRanges(now);
// Feb 9 is 30 days before Mar 10
assert.equal(ranges.last30DaysUtcStartKey, '2024-02-09');
});

test('computeUtcDateRanges: last30DaysStartMs equals the local midnight of last30DaysUtcStartKey', () => {
const now = new Date(2024, 4, 15, 12, 0, 0); // local May 15 at noon
const ranges = computeUtcDateRanges(now);
// last30DaysStartKey is April 15; local midnight of April 15
const [year, month, day] = ranges.last30DaysUtcStartKey.split('-').map(Number);
const expectedMs = new Date(year, month - 1, day).getTime();
assert.equal(ranges.last30DaysStartMs, expectedMs);
});

test('computeUtcDateRanges: lastMonthStartMs equals local midnight of lastMonthUtcStartKey', () => {
const now = new Date(2026, 4, 13, 10, 0, 0); // local May 13, 2026
const ranges = computeUtcDateRanges(now);
// For May 13, previous month = April, so lastMonthUtcStartKey = 2026-04-01
const expectedMs = new Date(2026, 3, 1).getTime(); // local April 1, 2026 midnight
assert.equal(ranges.lastMonthStartMs, expectedMs);
assert.equal(ranges.lastMonthUtcStartKey, '2026-04-01');
});

test('computeUtcDateRanges: lastMonthStartMs is earlier than last30DaysStartMs when today is May 13', () => {
// On May 13, last30Days starts Apr 13 but previous month starts Apr 1.
// The file-load cutoff should be Apr 1 (lastMonthStartMs < last30DaysStartMs).
const now = new Date(2026, 4, 13, 0, 0, 0); // local May 13, 2026
const ranges = computeUtcDateRanges(now);
assert.ok(ranges.lastMonthStartMs < ranges.last30DaysStartMs,
'lastMonthStartMs should be before last30DaysStartMs when today is in the first half of the month');
});

// ── aggregatePeriodStats – rollup path ───────────────────────────────────────

test('aggregatePeriodStats: rollup path – today attribution', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-15': { tokens: 100, actualTokens: 120, thinkingTokens: 0, interactions: 2, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 120, 'uses actualTokens when > 0');
assert.equal(result.todayStats.sessions, 1);
assert.equal(result.todayStats.interactions, 2);
assert.equal(result.monthStats.tokens, 120);
assert.equal(result.last30DaysStats.tokens, 120);
assert.equal(result.skippedCount, 0);
});

test('aggregatePeriodStats: rollup path – falls back to tokens when actualTokens is 0', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-15': { tokens: 100, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 100, 'falls back to estimated tokens');
});

test('aggregatePeriodStats: rollup path – last-month attribution', () => {
const ranges = makeRanges('2025-04-01');
// March entry → previous calendar month
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-31T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-31': { tokens: 200, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.lastMonthStats.tokens, 200);
assert.equal(result.monthStats.tokens, 0, 'should not bleed into this month');
assert.equal(result.todayStats.tokens, 0);
});

test('aggregatePeriodStats: rollup path – month boundary (first day of month goes to this month)', () => {
const ranges = makeRanges('2025-04-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-04-01T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-04-01': { tokens: 300, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.monthStats.tokens, 300, 'first day of month belongs to this month');
assert.equal(result.lastMonthStats.tokens, 0);
});

test('aggregatePeriodStats: rollup path – days before 30-day window but in previous month are included in lastMonthStats', () => {
const ranges = makeRanges('2025-03-15'); // last30DaysStart = 2025-02-13, lastMonth = Feb 2025
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-02-10T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-02-10': { tokens: 500, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.last30DaysStats.tokens, 0, 'not in last 30 days');
assert.equal(result.lastMonthStats.tokens, 500, 'Feb 10 is in previous month (Feb)');
assert.equal(result.skippedCount, 0, 'session counts because it contributed to lastMonth');
assert.ok(!result.dailyStatsMap.has('2025-02-10'), 'not in daily chart (outside 30-day window)');
});

test('aggregatePeriodStats: rollup path – partial session straddles 30-day boundary', () => {
const ranges = makeRanges('2025-03-15'); // last30DaysStart = 2025-02-13
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-01T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-02-12': { tokens: 100, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} }, // excluded
'2025-02-14': { tokens: 200, actualTokens: 0, thinkingTokens: 0, interactions: 2, modelUsage: {} }, // included
'2025-03-01': { tokens: 300, actualTokens: 0, thinkingTokens: 0, interactions: 3, modelUsage: {} }, // included
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.last30DaysStats.tokens, 500, '200 + 300 — only in-window days');
assert.equal(result.last30DaysStats.interactions, 5);
assert.equal(result.skippedCount, 0);
});

test('aggregatePeriodStats: rollup path – session is counted once in sessions even with many days', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-10': { tokens: 100, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
'2025-03-11': { tokens: 100, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
'2025-03-12': { tokens: 100, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.last30DaysStats.sessions, 1, 'one session regardless of days with rollups');
assert.equal(result.monthStats.sessions, 1);
assert.equal(result.last30DaysStats.tokens, 300);
});

// ── aggregatePeriodStats – fallback path ─────────────────────────────────────

test('aggregatePeriodStats: fallback – uses lastInteraction for UTC day key', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-14T22:00:00.000Z').getTime(), // local-time "yesterday" in UTC-5, but UTC "yesterday"
lastInteraction: '2025-03-15T00:30:00.000Z', // UTC today
sessionData: makeSession({ tokens: 150, interactions: 3 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 150, 'attributed to UTC today via lastInteraction');
assert.equal(result.todayStats.sessions, 1);
});

test('aggregatePeriodStats: fallback – falls back to mtime when lastInteraction absent', () => {
const ranges = makeRanges('2025-03-15');
const mtime = new Date('2025-03-15T10:00:00.000Z').getTime();
const input: SessionAggregateInput = {
editorType: 'cursor',
mtime,
sessionData: makeSession({ tokens: 80, interactions: 2 }),
// lastInteraction deliberately omitted
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 80, 'mtime used as fallback when no lastInteraction');
assert.equal(result.dailyStatsMap.get('2025-03-15')?.tokens, 80);
});

test('aggregatePeriodStats: fallback – uses actualTokens when > 0', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
lastInteraction: '2025-03-15T10:00:00.000Z',
sessionData: makeSession({ tokens: 100, actualTokens: 180, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 180, 'actualTokens preferred over estimated');
});

test('aggregatePeriodStats: fallback – session older than 30 days but in previous month is included in lastMonthStats', () => {
const ranges = makeRanges('2025-03-15'); // last30DaysStart = 2025-02-13, lastMonth = Feb 2025
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-02-01T10:00:00.000Z').getTime(),
lastInteraction: '2025-02-01T10:00:00.000Z',
sessionData: makeSession({ tokens: 999, interactions: 10 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.last30DaysStats.tokens, 0, 'not in last 30 days');
assert.equal(result.lastMonthStats.tokens, 999, 'Feb 1 is in previous month (Feb)');
assert.equal(result.skippedCount, 0, 'session counts because it contributed to lastMonth');
assert.ok(!result.dailyStatsMap.has('2025-02-01'), 'not in daily chart (outside 30-day window)');
});

test('aggregatePeriodStats: fallback – session from two months ago is skipped entirely', () => {
const ranges = makeRanges('2025-03-15'); // lastMonth = Feb 2025
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-01-15T10:00:00.000Z').getTime(),
lastInteraction: '2025-01-15T10:00:00.000Z',
sessionData: makeSession({ tokens: 999, interactions: 10 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.last30DaysStats.tokens, 0);
assert.equal(result.lastMonthStats.tokens, 0);
assert.equal(result.skippedCount, 1, 'Jan session is outside both windows');
});

// ── Local midnight boundary ──────────────────────────────────────────────────
// These tests use local date constructors (new Date(y, m, d, h, ...)) to verify
// that midnight attribution uses the local clock, not UTC.

test('local midnight boundary: event just before local midnight attributed to that local day', () => {
const ranges = makeRanges('2025-06-20');
// Local June 19 at 23:59:59.999 — should NOT be "today" (June 20)
const ts = new Date(2025, 5, 19, 23, 59, 59, 999); // local June 19
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: ts.getTime(),
lastInteraction: ts.toISOString(), // UTC equivalent of local June 19 23:59:59.999
sessionData: makeSession({ tokens: 50, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.ok(!result.dailyStatsMap.has('2025-06-20'), 'not attributed to today (June 20)');
assert.equal(result.todayStats.tokens, 0, 'not today');
assert.equal(result.monthStats.tokens, 50);
});

test('local midnight boundary: event just after local midnight attributed to the new local day', () => {
const ranges = makeRanges('2025-06-20');
// Local June 20 at 00:00:01 — should be "today"
const ts = new Date(2025, 5, 20, 0, 0, 1); // local June 20
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: ts.getTime(),
lastInteraction: ts.toISOString(),
sessionData: makeSession({ tokens: 60, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.ok(result.dailyStatsMap.has('2025-06-20'), 'attributed to today (June 20)');
assert.equal(result.todayStats.tokens, 60, 'today');
});

// ── DST transition ───────────────────────────────────────────────────────────

test('DST spring-forward: UTC key is correct regardless of local clock shift', () => {
// US spring forward 2025-03-09: clocks skip from 02:00 EST to 03:00 EDT.
// UTC is unaffected — 07:00 UTC is always on 2025-03-09.
const ranges = makeRanges('2025-03-09');
const input: SessionAggregateInput = {
editorType: 'vscode',
// 07:00 UTC on 2025-03-09 → "2:00 AM EST" / "3:00 AM EDT" in US/Eastern, still 2025-03-09 UTC
mtime: new Date('2025-03-09T07:00:00.000Z').getTime(),
lastInteraction: '2025-03-09T07:00:00.000Z',
sessionData: makeSession({ tokens: 75, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 75, 'correctly attributed to DST transition day');
assert.ok(result.dailyStatsMap.has('2025-03-09'));
});

test('DST fall-back: UTC key is correct when local clock falls back', () => {
// US fall back 2025-11-02: clocks repeat 01:00 EDT → 01:00 EST.
// UTC 06:30 is unambiguously on 2025-11-02.
const ranges = makeRanges('2025-11-02');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-11-02T06:30:00.000Z').getTime(),
lastInteraction: '2025-11-02T06:30:00.000Z',
sessionData: makeSession({ tokens: 90, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 90);
assert.ok(result.dailyStatsMap.has('2025-11-02'));
});

// ── Month rollover ───────────────────────────────────────────────────────────

test('month rollover: last day of month goes to last-month', () => {
// "today" is 2025-04-01; 2025-03-31 is the last day of last month
const ranges = makeRanges('2025-04-01');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-31T12:00:00.000Z').getTime(),
lastInteraction: '2025-03-31T12:00:00.000Z',
sessionData: makeSession({ tokens: 400, interactions: 4 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.lastMonthStats.tokens, 400, 'last day of month → last month');
assert.equal(result.monthStats.tokens, 0, 'no bleed into current month');
assert.equal(result.todayStats.tokens, 0);
});

test('month rollover: first day of month goes to this month', () => {
const ranges = makeRanges('2025-04-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-04-01T00:00:00.000Z').getTime(),
lastInteraction: '2025-04-01T00:00:00.000Z',
sessionData: makeSession({ tokens: 250, interactions: 2 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.monthStats.tokens, 250, 'first day of month → this month');
assert.equal(result.lastMonthStats.tokens, 0);
});

test('month rollover: Jan 31 → last month when today is Feb 01', () => {
const ranges = makeRanges('2026-02-01');
// Local Jan 31 at 23:59 — should go to last month (January)
const ts = new Date(2026, 0, 31, 23, 59, 0); // local Jan 31
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: ts.getTime(),
lastInteraction: ts.toISOString(),
sessionData: makeSession({ tokens: 111, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.lastMonthStats.tokens, 111, 'Jan 31 goes to last month when today is Feb 01');
assert.equal(result.monthStats.tokens, 0);
});

// ── dailyStatsMap accumulation ───────────────────────────────────────────────

test('dailyStatsMap: multiple sessions on same day are summed', () => {
const ranges = makeRanges('2025-03-15');
const inputs: SessionAggregateInput[] = [
{
editorType: 'vscode',
mtime: new Date('2025-03-15T08:00:00.000Z').getTime(),
lastInteraction: '2025-03-15T08:00:00.000Z',
sessionData: makeSession({ tokens: 100, interactions: 1 }),
},
{
editorType: 'cursor',
mtime: new Date('2025-03-15T14:00:00.000Z').getTime(),
lastInteraction: '2025-03-15T14:00:00.000Z',
sessionData: makeSession({ tokens: 200, interactions: 2 }),
},
];
const result = aggregatePeriodStats(inputs, ranges);
const day = result.dailyStatsMap.get('2025-03-15')!;
assert.ok(day, 'daily entry for today');
assert.equal(day.tokens, 300, '100 + 200');
assert.equal(day.sessions, 2);
assert.equal(day.interactions, 3);
assert.equal(day.editorUsage['vscode']?.tokens, 100);
assert.equal(day.editorUsage['cursor']?.tokens, 200);
});

test('dailyStatsMap: rollup entries create one entry per day key', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-14': { tokens: 50, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
'2025-03-15': { tokens: 75, actualTokens: 0, thinkingTokens: 0, interactions: 2, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.ok(result.dailyStatsMap.has('2025-03-14'));
assert.ok(result.dailyStatsMap.has('2025-03-15'));
assert.equal(result.dailyStatsMap.get('2025-03-14')?.tokens, 50);
assert.equal(result.dailyStatsMap.get('2025-03-15')?.tokens, 75);
});

// ── Empty / edge cases ────────────────────────────────────────────────────────

test('aggregatePeriodStats: empty input returns zero-valued accumulators', () => {
const ranges = makeRanges('2025-03-15');
const result = aggregatePeriodStats([], ranges);
assert.equal(result.todayStats.tokens, 0);
assert.equal(result.monthStats.tokens, 0);
assert.equal(result.last30DaysStats.tokens, 0);
assert.equal(result.lastMonthStats.tokens, 0);
assert.equal(result.dailyStatsMap.size, 0);
assert.equal(result.skippedCount, 0);
});

test('aggregatePeriodStats: session with empty dailyRollups uses fallback path', () => {
const ranges = makeRanges('2025-03-15');
// dailyRollups is an empty object → should fall through to the session-level fallback
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
lastInteraction: '2025-03-15T10:00:00.000Z',
sessionData: makeSession({ tokens: 77, dailyRollups: {} }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 77, 'fallback used when dailyRollups is empty');
});

// ── April 1-12 regression (May-13 scenario) ───────────────────────────────────

test('aggregatePeriodStats: rollup – April 1 day is in lastMonthStats when today is May 13', () => {
// Regression: previously the early `dayKey < last30DaysUtcStartKey` guard skipped April 1-12.
const ranges = makeRanges('2026-05-13'); // last30DaysStart = 2026-04-13, lastMonth = April 2026
const input: SessionAggregateInput = {
editorType: 'copilot-cli',
mtime: new Date('2026-04-01T12:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2026-04-01': { tokens: 1000, actualTokens: 1200, thinkingTokens: 0, interactions: 5, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.lastMonthStats.tokens, 1200, 'April 1 is in previous month (April)');
assert.equal(result.last30DaysStats.tokens, 0, 'April 1 is before the 30-day window (Apr 13)');
assert.ok(!result.dailyStatsMap.has('2026-04-01'), 'not in daily chart');
assert.equal(result.lastMonthStats.sessions, 1);
assert.equal(result.skippedCount, 0);
});

test('aggregatePeriodStats: rollup – mixed rollup spanning April 1-12 and April 13-30', () => {
// Session with activity both in "lastMonth only" and "both windows" ranges.
const ranges = makeRanges('2026-05-13'); // last30DaysStart = 2026-04-13, lastMonth = April 2026
const input: SessionAggregateInput = {
editorType: 'copilot-cli',
mtime: new Date('2026-04-25T12:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2026-04-05': { tokens: 300, actualTokens: 0, thinkingTokens: 0, interactions: 3, modelUsage: {} }, // lastMonth only
'2026-04-20': { tokens: 500, actualTokens: 0, thinkingTokens: 0, interactions: 5, modelUsage: {} }, // both windows
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.lastMonthStats.tokens, 800, 'both April 5 and April 20 count toward last month');
assert.equal(result.last30DaysStats.tokens, 500, 'only April 20 is within last 30 days');
assert.ok(result.dailyStatsMap.has('2026-04-20'), 'April 20 in daily chart');
assert.ok(!result.dailyStatsMap.has('2026-04-05'), 'April 5 not in daily chart');
assert.equal(result.lastMonthStats.sessions, 1, 'counted once in lastMonth');
assert.equal(result.last30DaysStats.sessions, 1, 'counted once in last30Days');
assert.equal(result.skippedCount, 0);
});

test('aggregatePeriodStats: rollup – session with only two-months-ago data is fully skipped', () => {
const ranges = makeRanges('2026-05-13'); // lastMonth = April 2026
const input: SessionAggregateInput = {
editorType: 'copilot-cli',
mtime: new Date('2026-03-15T12:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2026-03-15': { tokens: 999, actualTokens: 0, thinkingTokens: 0, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.lastMonthStats.tokens, 0, 'March data not in April lastMonth');
assert.equal(result.last30DaysStats.tokens, 0);
assert.equal(result.skippedCount, 1);
});

test('aggregatePeriodStats: fallback – April 5 session is in lastMonthStats when today is May 13', () => {
// Regression for fallback path: previously skipped when lastActivityUtcKey < last30DaysUtcStartKey.
const ranges = makeRanges('2026-05-13'); // last30DaysStart = 2026-04-13, lastMonth = April 2026
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2026-04-05T10:00:00.000Z').getTime(),
lastInteraction: '2026-04-05T10:00:00.000Z',
sessionData: makeSession({ tokens: 750, actualTokens: 800, interactions: 8 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.lastMonthStats.tokens, 800, 'April 5 is in previous month (April)');
assert.equal(result.last30DaysStats.tokens, 0, 'April 5 is before the 30-day window');
assert.ok(!result.dailyStatsMap.has('2026-04-05'), 'not in daily chart');
assert.equal(result.skippedCount, 0);
});

// ── Cached tokens NOT included in Tokens (input+output) ──────────────────────

test('aggregatePeriodStats: rollup – tokens total is input+output only, not including cached', () => {
// tokens = actualTokens only; cachedReadTokens tracked separately in cachedTokens
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-15': { tokens: 100, actualTokens: 200, thinkingTokens: 0, cachedReadTokens: 300, interactions: 2, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 200, 'tokens = actualTokens(200) only, cachedReadTokens(300) excluded');
assert.equal(result.todayStats.cachedTokens, 300, 'cachedTokens accumulates separately');
assert.equal(result.monthStats.tokens, 200);
assert.equal(result.last30DaysStats.tokens, 200);
});

test('aggregatePeriodStats: rollup – missing cachedReadTokens does not affect total', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-15': { tokens: 100, actualTokens: 150, thinkingTokens: 0, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 150, 'no cachedReadTokens → actualTokens only');
});

test('aggregatePeriodStats: rollup – estimated tokens fallback used when actualTokens=0, cached excluded', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
sessionData: makeSession({
dailyRollups: {
'2025-03-15': { tokens: 100, actualTokens: 0, thinkingTokens: 0, cachedReadTokens: 50, interactions: 1, modelUsage: {} },
},
}),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 100, 'estimatedTokens(100) only; cachedReadTokens(50) excluded from total');
});

test('aggregatePeriodStats: fallback – tokens total is input+output only, cacheReadTokens excluded', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
lastInteraction: '2025-03-15T10:00:00.000Z',
sessionData: makeSession({ tokens: 100, actualTokens: 200, cacheReadTokens: 400, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 200, 'tokens = actualTokens(200) only; cacheReadTokens(400) excluded');
assert.equal(result.todayStats.cachedTokens, 400, 'cachedTokens accumulates separately');
});

test('aggregatePeriodStats: fallback – no cacheReadTokens leaves total unchanged', () => {
const ranges = makeRanges('2025-03-15');
const input: SessionAggregateInput = {
editorType: 'vscode',
mtime: new Date('2025-03-15T10:00:00.000Z').getTime(),
lastInteraction: '2025-03-15T10:00:00.000Z',
sessionData: makeSession({ tokens: 100, actualTokens: 180, interactions: 1 }),
};
const result = aggregatePeriodStats([input], ranges);
assert.equal(result.todayStats.tokens, 180, 'no cacheReadTokens → actualTokens only');
});
