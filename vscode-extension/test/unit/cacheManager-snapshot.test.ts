import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { CacheManager } from '../../src/cacheManager';
import type { SessionFileCache } from '../../src/types';
import { createMockMemento } from './vscode-test-helpers';

function makeManager(dir: string, cacheVersion = 1): CacheManager {
	const context: any = {
		extensionMode: 1, // Production -> cache id 'prod'
		globalStorageUri: { fsPath: dir },
		globalState: createMockMemento(),
	};
	const deps = { log: () => {}, warn: () => {}, error: () => {} };
	return new CacheManager(context, deps, cacheVersion);
}

function tmpDir(): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-snapshot-test-'));
}

function entry(mtime: number, tokens = 100): SessionFileCache {
	return { tokens, interactions: 1, modelUsage: {}, mtime, size: 10 } as SessionFileCache;
}

test('writeSharedSnapshot + readSharedSnapshot round-trip entries', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	m.setCachedSessionData('/b.json', entry(2000), 10);
	await m.writeSharedSnapshot();

	const entries = await m.readSharedSnapshot();
	assert.ok(entries, 'snapshot should be readable');
	assert.equal(Object.keys(entries!).length, 2);
	assert.equal(entries!['/a.json'].mtime, 1000);
	assert.equal(entries!['/b.json'].mtime, 2000);
});

test('writeSharedSnapshot writes atomically (no leftover .tmp files)', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();

	const storageDir = path.dirname(m.getSharedSnapshotPath());
	const leftovers = fs.readdirSync(storageDir).filter(f => f.endsWith('.tmp'));
	assert.deepEqual(leftovers, [], 'no temp files should remain');
});

test('readSharedSnapshot returns undefined on cache-version mismatch', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir, 1);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	// A reader on a different cache version must ignore the snapshot.
	const reader = makeManager(dir, 2);
	const entries = await reader.readSharedSnapshot();
	assert.equal(entries, undefined);
});

test('readSharedSnapshot returns undefined on corrupt snapshot', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	fs.mkdirSync(path.dirname(m.getSharedSnapshotPath()), { recursive: true });
	fs.writeFileSync(m.getSharedSnapshotPath(), '{ this is not valid json');
	const entries = await m.readSharedSnapshot();
	assert.equal(entries, undefined);
});

test('loadSharedSnapshotIfChanged merges fresher entries and is idempotent', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	writer.setCachedSessionData('/b.json', entry(2000), 10);
	await writer.writeSharedSnapshot();

	const reader = makeManager(dir);
	const merged = await reader.loadSharedSnapshotIfChanged();
	assert.equal(merged, 2, 'both entries merged on first load');
	assert.equal(reader.cache.get('/a.json')?.mtime, 1000);

	// Second call without a newer snapshot should merge nothing.
	const mergedAgain = await reader.loadSharedSnapshotIfChanged();
	assert.equal(mergedAgain, 0);
});

test('loadSharedSnapshotIfChanged does not overwrite a newer local entry', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	const reader = makeManager(dir);
	// Reader already parsed a NEWER version of /a.json locally.
	reader.setCachedSessionData('/a.json', entry(5000), 10);
	const merged = await reader.loadSharedSnapshotIfChanged();
	assert.equal(merged, 0, 'older snapshot entry must not replace newer local entry');
	assert.equal(reader.cache.get('/a.json')?.mtime, 5000);
});

test('loadSharedSnapshotIfChanged returns 0 when no snapshot exists', async () => {
	const dir = tmpDir();
	const reader = makeManager(dir);
	const merged = await reader.loadSharedSnapshotIfChanged();
	assert.equal(merged, 0);
});

test('writeSharedSnapshot merges with existing snapshot without regressing newer entries', async () => {
	const dir = tmpDir();
	// Leader publishes a fresh entry for /a.json.
	const leader = makeManager(dir);
	leader.setCachedSessionData('/a.json', entry(2000), 10);
	await leader.writeSharedSnapshot();

	// Follower holds an OLDER /a.json plus an extra /b.json, then writes.
	const follower = makeManager(dir);
	follower.setCachedSessionData('/a.json', entry(1000), 10);
	follower.setCachedSessionData('/b.json', entry(3000), 10);
	await follower.writeSharedSnapshot();

	const entries = await leader.readSharedSnapshot();
	assert.ok(entries);
	assert.equal(entries!['/a.json'].mtime, 2000, 'leader\'s newer /a.json must survive');
	assert.equal(entries!['/b.json'].mtime, 3000, 'follower\'s extra /b.json must be added');
});

test('refresh lock: acquire then release; renew only when owned', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	assert.equal(await m.acquireRefreshLock(), true, 'first acquire succeeds');
	assert.equal(await m.renewRefreshLock(), true, 'owner can renew');
	await m.releaseRefreshLock();
	assert.equal(fs.existsSync(m.getRefreshLockPath()), false, 'lock file removed after release');
});

test('refresh lock and cache lock are independent files', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	assert.notEqual(m.getRefreshLockPath(), m.getCacheLockPath());
	assert.equal(await m.acquireRefreshLock(), true);
	// The cache (save) lock must still be acquirable while the refresh lock is held.
	assert.equal(await m.acquireCacheLock(), true);
	await m.releaseRefreshLock();
	await m.releaseCacheLock();
});

// ---------------------------------------------------------------------------
// loadCacheFromStorage (disk-based)
// ---------------------------------------------------------------------------

test('loadCacheFromStorage: loads entries from existing snapshot', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	writer.setCachedSessionData('/b.json', entry(2000), 20);
	await writer.writeSharedSnapshot();

	const reader = makeManager(dir);
	await reader.loadCacheFromStorage();
	assert.equal(reader.cache.size, 2, 'should load both entries');
	assert.equal(reader.cache.get('/a.json')?.mtime, 1000);
	assert.equal(reader.cache.get('/b.json')?.mtime, 2000);
});

test('loadCacheFromStorage: starts with empty cache when no snapshot exists', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	await m.loadCacheFromStorage();
	assert.equal(m.cache.size, 0, 'cache should be empty when no snapshot exists');
});

test('loadCacheFromStorage: clears cache and resets lastCleanSyncVersion on version mismatch', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir, 1);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	// Reader uses a different cache version
	const logs: string[] = [];
	const context: any = {
		extensionMode: 1,
		globalStorageUri: { fsPath: dir },
		globalState: createMockMemento(),
	};
	// Pre-set a lastCleanSyncVersion to verify it gets cleared
	context.globalState.update('backend.lastCleanSyncVersion', 5);
	const reader = new CacheManager(context, { log: (m: string) => logs.push(m), warn: () => {}, error: () => {} }, 2);
	await reader.loadCacheFromStorage();
	assert.equal(reader.cache.size, 0, 'cache should be empty on version mismatch');
	assert.ok(logs.some(l => l.includes('version mismatch')), 'should log version mismatch');
	assert.equal(context.globalState.get('backend.lastCleanSyncVersion'), undefined,
		'lastCleanSyncVersion should be cleared on version mismatch');
});

test('loadCacheFromStorage: removes large globalState cache entries (migration)', async () => {
	const dir = tmpDir();
	const context: any = {
		extensionMode: 1,
		globalStorageUri: { fsPath: dir },
		globalState: createMockMemento(),
	};
	// Simulate old large entries in globalState
	await context.globalState.update('sessionFileCache_prod', { '/a.json': entry(1000) });
	await context.globalState.update('sessionFileCacheVersion_prod', 1);
	await context.globalState.update('sessionFileCache', { '/b.json': entry(2000) });

	const m = new CacheManager(context, { log: () => {}, warn: () => {}, error: () => {} }, 1);
	await m.loadCacheFromStorage();

	assert.equal(context.globalState.get('sessionFileCache_prod'), undefined,
		'current scoped key should be removed from globalState');
	assert.equal(context.globalState.get('sessionFileCacheVersion_prod'), undefined,
		'version key should be removed from globalState');
	assert.equal(context.globalState.get('sessionFileCache'), undefined,
		'legacy unscoped key should be removed from globalState');
});

// ---------------------------------------------------------------------------
// deleteSharedSnapshot
// ---------------------------------------------------------------------------

test('deleteSharedSnapshot: removes the snapshot file', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();
	assert.ok(fs.existsSync(m.getSharedSnapshotPath()), 'snapshot should exist before delete');

	await m.deleteSharedSnapshot();
	assert.equal(fs.existsSync(m.getSharedSnapshotPath()), false, 'snapshot should be removed');
});

test('deleteSharedSnapshot: is a no-op when snapshot does not exist', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	// Should not throw
	await assert.doesNotReject(() => m.deleteSharedSnapshot());
});

test('deleteSharedSnapshot: prevents reloading cleared cache after restart', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();
	await m.deleteSharedSnapshot();

	const reader = makeManager(dir);
	await reader.loadCacheFromStorage();
	assert.equal(reader.cache.size, 0, 'cleared cache should not be reloaded from disk');
});

// ---------------------------------------------------------------------------
// migrateOldCacheKeys: now removes all cache keys (including current scoped)
// ---------------------------------------------------------------------------

test('migrateOldCacheKeys: removes all sessionFileCache* keys from globalState', () => {
	const dir = tmpDir();
	const context: any = {
		extensionMode: 1,
		globalStorageUri: { fsPath: dir },
		globalState: createMockMemento(),
	};
	context.globalState.update('sessionFileCache_prod', { data: 'big' });
	context.globalState.update('sessionFileCacheVersion_prod', 1);
	context.globalState.update('sessionFileCache_dev-abc123', { data: 'big' });
	context.globalState.update('sessionFileCacheTimestamp_prod', 12345);
	context.globalState.update('sessionFileCache', { data: 'legacy' });
	context.globalState.update('github.authenticated', true); // should NOT be removed

	const m = new CacheManager(context, { log: () => {}, warn: () => {}, error: () => {} }, 1);
	m.migrateOldCacheKeys('prod');

	assert.equal(context.globalState.get('sessionFileCache_prod'), undefined);
	assert.equal(context.globalState.get('sessionFileCacheVersion_prod'), undefined);
	assert.equal(context.globalState.get('sessionFileCache_dev-abc123'), undefined);
	assert.equal(context.globalState.get('sessionFileCacheTimestamp_prod'), undefined);
	assert.equal(context.globalState.get('sessionFileCache'), undefined);
	// Unrelated keys must be preserved
	assert.equal(context.globalState.get('github.authenticated'), true);
});
