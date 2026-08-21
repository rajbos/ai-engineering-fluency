import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
	shouldRunDailyWorktreeScan,
	shouldNotifyWorktreeFindings,
	formatBytesForNotification,
	sumWorktreeBytes,
	WORKTREE_BACKGROUND_SCAN_INTERVAL_MS,
	WORKTREE_SCAN_NOTIFY_MIN_BYTES,
} from '../../src/worktreeBackgroundScan';

// ---------------------------------------------------------------------------
// shouldRunDailyWorktreeScan
// ---------------------------------------------------------------------------

test('shouldRunDailyWorktreeScan: never run before -> true', () => {
	assert.equal(shouldRunDailyWorktreeScan(undefined, Date.now()), true);
});

test('shouldRunDailyWorktreeScan: unparseable timestamp -> true (treat as never run)', () => {
	assert.equal(shouldRunDailyWorktreeScan('not-a-date', Date.now()), true);
});

test('shouldRunDailyWorktreeScan: less than a day since last run -> false', () => {
	const now = Date.parse('2026-08-21T12:00:00Z');
	const startedAt = new Date(now - 2 * 60 * 60 * 1000).toISOString(); // 2h ago
	assert.equal(shouldRunDailyWorktreeScan(startedAt, now), false);
});

test('shouldRunDailyWorktreeScan: exactly one interval since last run -> true', () => {
	const now = Date.parse('2026-08-21T12:00:00Z');
	const startedAt = new Date(now - WORKTREE_BACKGROUND_SCAN_INTERVAL_MS).toISOString();
	assert.equal(shouldRunDailyWorktreeScan(startedAt, now), true);
});

test('shouldRunDailyWorktreeScan: more than a day since last run -> true', () => {
	const now = Date.parse('2026-08-21T12:00:00Z');
	const startedAt = new Date(now - 25 * 60 * 60 * 1000).toISOString();
	assert.equal(shouldRunDailyWorktreeScan(startedAt, now), true);
});

test('shouldRunDailyWorktreeScan: respects a custom interval', () => {
	const now = Date.parse('2026-08-21T12:00:00Z');
	const startedAt = new Date(now - 30 * 60 * 1000).toISOString(); // 30 min ago
	assert.equal(shouldRunDailyWorktreeScan(startedAt, now, 60 * 60 * 1000), false); // 1h interval
	assert.equal(shouldRunDailyWorktreeScan(startedAt, now, 15 * 60 * 1000), true); // 15min interval
});

// ---------------------------------------------------------------------------
// shouldNotifyWorktreeFindings
// ---------------------------------------------------------------------------

test('shouldNotifyWorktreeFindings: below the minimum footprint -> never notifies', () => {
	assert.equal(shouldNotifyWorktreeFindings(WORKTREE_SCAN_NOTIFY_MIN_BYTES - 1, undefined), false);
	assert.equal(shouldNotifyWorktreeFindings(1024, 500), false);
});

test('shouldNotifyWorktreeFindings: first time above the minimum -> notifies', () => {
	assert.equal(shouldNotifyWorktreeFindings(WORKTREE_SCAN_NOTIFY_MIN_BYTES, undefined), true);
});

test('shouldNotifyWorktreeFindings: small delta from last-notified baseline -> does not renotify', () => {
	const baseline = 1_000_000_000; // 1 GB
	const smallGrowth = baseline * 1.05; // 5%
	assert.equal(shouldNotifyWorktreeFindings(smallGrowth, baseline), false);
});

test('shouldNotifyWorktreeFindings: >= 10% growth from last-notified baseline -> renotifies', () => {
	const baseline = 1_000_000_000; // 1 GB
	const bigGrowth = baseline * 1.1; // exactly 10%
	assert.equal(shouldNotifyWorktreeFindings(bigGrowth, baseline), true);
});

test('shouldNotifyWorktreeFindings: >= 10% shrink from last-notified baseline also renotifies', () => {
	const baseline = 1_000_000_000;
	const shrunk = baseline * 0.85; // -15%
	assert.equal(shouldNotifyWorktreeFindings(shrunk, baseline), true);
});

test('shouldNotifyWorktreeFindings: a zero/negative baseline is treated like "never notified"', () => {
	assert.equal(shouldNotifyWorktreeFindings(WORKTREE_SCAN_NOTIFY_MIN_BYTES, 0), true);
});

// ---------------------------------------------------------------------------
// formatBytesForNotification
// ---------------------------------------------------------------------------

test('formatBytesForNotification: bytes below 1024 stay in B', () => {
	assert.equal(formatBytesForNotification(512), '512 B');
});

test('formatBytesForNotification: scales through KB/MB/GB', () => {
	assert.equal(formatBytesForNotification(1024), '1.0 KB');
	assert.equal(formatBytesForNotification(450 * 1024 * 1024), '450 MB');
	assert.equal(formatBytesForNotification(1.3 * 1024 * 1024 * 1024), '1.3 GB');
});

test('formatBytesForNotification: negative/NaN inputs fall back to "0 B"', () => {
	assert.equal(formatBytesForNotification(-5), '0 B');
	assert.equal(formatBytesForNotification(NaN), '0 B');
});

// ---------------------------------------------------------------------------
// sumWorktreeBytes
// ---------------------------------------------------------------------------

test('sumWorktreeBytes: sums only known (non-negative) byte counts', () => {
	const total = sumWorktreeBytes([{ bytes: 100 }, { bytes: -1 }, { bytes: 250 }]);
	assert.equal(total, 350);
});

test('sumWorktreeBytes: empty list -> 0', () => {
	assert.equal(sumWorktreeBytes([]), 0);
});
