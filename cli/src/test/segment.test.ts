/**
 * Unit tests for the `segment --json` payload builder.
 * Tests cli/src/commands/segment.ts
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { buildJsonPayload, readSegmentCache, tryAcquireRefreshLock, releaseRefreshLock, REFRESH_LOCK_MAX_AGE_MS } from '../commands/segment';

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

function tempDir(): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'segment-test-'));
}

test('readSegmentCache returns an expired entry marked as not fresh', () => {
	const dir = tempDir();
	try {
		const cachePath = path.join(dir, 'cache.json');
		fs.writeFileSync(cachePath, JSON.stringify(sampleEntry));
		const updatedMs = Date.parse(sampleEntry.updatedAt);

		const fresh = readSegmentCache(5, cachePath, updatedMs + 60_000);
		assert.equal(fresh?.fresh, true);

		const expired = readSegmentCache(5, cachePath, updatedMs + 6 * 60_000);
		assert.equal(expired?.fresh, false);
		assert.equal(expired?.entry.formatted, sampleEntry.formatted);

		assert.equal(readSegmentCache(5, cachePath, updatedMs - 1000)?.fresh, false);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('tryAcquireRefreshLock allows a single holder until released', () => {
	const dir = tempDir();
	try {
		const lockPath = path.join(dir, 'refresh.lock');
		assert.equal(tryAcquireRefreshLock(lockPath), true);
		assert.equal(fs.readFileSync(lockPath, 'utf-8'), String(process.pid));
		assert.equal(tryAcquireRefreshLock(lockPath), false);
		releaseRefreshLock(lockPath);
		assert.equal(tryAcquireRefreshLock(lockPath), true);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('tryAcquireRefreshLock keeps a lock whose owner is running, however long it takes', () => {
	const dir = tempDir();
	try {
		const lockPath = path.join(dir, 'refresh.lock');
		fs.writeFileSync(lockPath, '12345');
		const mtime = fs.statSync(lockPath).mtimeMs;

		const acquired = tryAcquireRefreshLock(lockPath, { now: mtime + 30 * 60_000, isAlive: () => true });
		assert.equal(acquired, false);
		assert.equal(fs.readFileSync(lockPath, 'utf-8'), '12345');
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('tryAcquireRefreshLock takes over a lock whose owner has exited', () => {
	const dir = tempDir();
	try {
		const lockPath = path.join(dir, 'refresh.lock');
		fs.writeFileSync(lockPath, '12345');

		assert.equal(tryAcquireRefreshLock(lockPath, { isAlive: () => false }), true);
		assert.equal(fs.readFileSync(lockPath, 'utf-8'), String(process.pid));
		assert.deepEqual(fs.readdirSync(dir), ['refresh.lock'], 'no renamed lock files are left behind');
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('tryAcquireRefreshLock takes over a lock older than the maximum age even if its PID is in use', () => {
	const dir = tempDir();
	try {
		const lockPath = path.join(dir, 'refresh.lock');
		fs.writeFileSync(lockPath, '12345');
		const mtime = fs.statSync(lockPath).mtimeMs;

		assert.equal(tryAcquireRefreshLock(lockPath, { now: mtime + REFRESH_LOCK_MAX_AGE_MS + 1000, isAlive: () => true }), true);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('only one of several callers takes over the same abandoned lock', () => {
	const dir = tempDir();
	try {
		const lockPath = path.join(dir, 'refresh.lock');
		fs.writeFileSync(lockPath, '12345');
		const deadOnly = (pid: number) => pid !== 12345;

		const results = [101, 102, 103].map(ownerPid => tryAcquireRefreshLock(lockPath, { isAlive: deadOnly, ownerPid }));
		assert.deepEqual(results, [true, false, false]);
		assert.equal(fs.readFileSync(lockPath, 'utf-8'), '101');
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});

test('releaseRefreshLock leaves a lock owned by another process', () => {
	const dir = tempDir();
	try {
		const lockPath = path.join(dir, 'refresh.lock');
		fs.writeFileSync(lockPath, '12345');
		releaseRefreshLock(lockPath);
		assert.equal(fs.existsSync(lockPath), true);
		releaseRefreshLock(lockPath, 12345);
		assert.equal(fs.existsSync(lockPath), false);
	} finally {
		fs.rmSync(dir, { recursive: true, force: true });
	}
});
