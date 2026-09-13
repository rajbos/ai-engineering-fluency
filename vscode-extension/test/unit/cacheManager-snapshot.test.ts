import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import { CacheManager } from '../../src/cacheManager';
import type { SessionFileCache } from '../../../src/types';
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
	return fs.mkdtempSync(path.join(process.cwd(), 'ctt-snapshot-test-'));
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

test('writeSharedSnapshot caps the shared snapshot at 20000 newest entries', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	for (let i = 0; i < 20_050; i++) {
		writer.setCachedSessionData(`/file${i}.json`, entry(i), 10);
	}
	await writer.writeSharedSnapshot();

	const entries = await writer.readSharedSnapshot();
	assert.ok(entries);
	assert.equal(Object.keys(entries!).length, 20_000, 'snapshot should keep only the newest 20000 entries');
	assert.equal(entries!['/file0.json'], undefined, 'oldest snapshot entry should be pruned');
	assert.equal(entries!['/file49.json'], undefined, 'entries outside the newest 20000 should be pruned');
	assert.equal(entries!['/file50.json']?.mtime, 50, 'newest retained window should start at entry 50');
	assert.equal(entries!['/file20049.json']?.mtime, 20049, 'newest entry should be retained');
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

// Windows reuses PIDs aggressively: after a reboot a leftover lock file can point
// at a PID now owned by an unrelated process. The stale-lock check must not trust
// a live PID whose image is not a VS Code/Electron host.
test('refresh lock: breaks stale lock owned by a recycled non-host PID (win32)', { skip: process.platform !== 'win32' }, async () => {
	const dir = tmpDir();
	const holder = makeManager(dir);
	assert.equal(await holder.acquireRefreshLock(), true);

	// Simulate a reboot: overwrite the lock with a fresh timestamp but point the
	// PID at cmd.exe, which is alive and guaranteed not to be an editor host.
	const lockPath = holder.getRefreshLockPath();
	const cmdPid: number = (require('node:child_process') as typeof import('node:child_process'))
		.spawn('cmd.exe', ['/c', 'ping -n 30 127.0.0.1 >nul'], { windowsHide: true }).pid!;
	try {
		fs.writeFileSync(lockPath, JSON.stringify({ sessionId: 'old-session', pid: cmdPid, timestamp: Date.now() }));
		const fresh = makeManager(dir);
		assert.equal(await fresh.acquireRefreshLock(), true, 'recycled non-host PID must be treated as stale');
		await fresh.releaseRefreshLock();
	} finally {
		try { process.kill(cmdPid); } catch { /* already exited */ }
	}
});

// A writer killed between the atomic create and the content write leaves a
// 0-byte (or otherwise unparseable) lock behind. JSON.parse throwing used to be
// swallowed by the same catch that handles "owner deleted the file", so the
// corrupt lock blocked every acquire attempt forever and forced all windows
// into follower mode.
test('refresh lock: breaks corrupt (empty) lock file left by a crashed writer', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	fs.writeFileSync(m.getRefreshLockPath(), '');
	assert.equal(await m.acquireRefreshLock(), true, 'empty lock must be treated as stale');
	const content = JSON.parse(fs.readFileSync(m.getRefreshLockPath(), 'utf-8'));
	assert.equal(typeof content.timestamp, 'number', 'lock must be rewritten with valid content');
	await m.releaseRefreshLock();
});

test('refresh lock: breaks lock file with invalid JSON or missing fields', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);

	fs.writeFileSync(m.getRefreshLockPath(), '{not json');
	assert.equal(await m.acquireRefreshLock(), true, 'invalid JSON lock must be treated as stale');
	await m.releaseRefreshLock();

	fs.writeFileSync(m.getRefreshLockPath(), JSON.stringify({ sessionId: 'old-session' }));
	assert.equal(await m.acquireRefreshLock(), true, 'lock without timestamp must be treated as stale');
	await m.releaseRefreshLock();
});

test('cache lock: breaks corrupt (empty) lock file', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	fs.writeFileSync(m.getCacheLockPath(), '');
	assert.equal(await m.acquireCacheLock(), true, 'empty cache lock must be treated as stale');
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

	const logs: string[] = [];
	const context: any = {
		extensionMode: 1,
		globalStorageUri: { fsPath: dir },
		globalState: createMockMemento(),
	};
	const reader = new CacheManager(context, { log: (m: string) => logs.push(m), warn: () => {}, error: () => {} }, 1);
	await reader.loadCacheFromStorage();
	assert.equal(reader.cache.size, 2, 'should load both entries');
	assert.equal(reader.cache.get('/a.json')?.mtime, 1000);
	assert.equal(reader.cache.get('/b.json')?.mtime, 2000);
	assert.ok(logs.some(l => /Loaded 2 cached session files from disk snapshot \(prod\) in \d+ms/.test(l)),
		'should log load duration');
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

// ---------------------------------------------------------------------------
// deleteCachedSessionData: deletion must survive a save (issue found in PR #2080
// review — writeSharedSnapshot()'s merge starts from whatever is already on disk, so a
// plain cache.delete() is silently resurrected by the very next save)
// ---------------------------------------------------------------------------

test('deleteCachedSessionData() tombstones the path so a later writeSharedSnapshot() cannot resurrect it from disk', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	m.setCachedSessionData('/b.json', entry(2000), 10);
	await m.writeSharedSnapshot();

	m.deleteCachedSessionData('/a.json');
	await m.writeSharedSnapshot();

	const entries = await m.readSharedSnapshot();
	assert.ok(entries, 'snapshot should still be readable');
	assert.equal(Object.keys(entries!).length, 1, 'the deleted entry must not survive a later save');
	assert.ok(!('/a.json' in entries!), '/a.json must be gone from the persisted snapshot, not resurrected from the disk copy written before the delete');
	assert.equal(entries!['/b.json'].mtime, 2000, 'an unrelated entry must be untouched');
});

// A second, independent deletion of an already-tombstoned path is plausible in practice:
// clearExpiredCache()'s fire-and-forget sweep can race with reconcilePreloadedAgainstDiscovery()'s
// synchronous one, both independently deciding to delete the same path. The second call finds no
// `existing` in-memory entry (the first deletion already removed it), so without preserving the
// prior baseline, the tombstone would be silently weakened to mtime 0 — letting any stale disk
// entry with a positive mtime pass the newer-than-tombstone check and be resurrected.
test('deleteCachedSessionData() does not weaken an existing tombstone baseline on a second, independent deletion of the same path', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(5000), 10);
	await writer.writeSharedSnapshot(); // disk: /a.json @ mtime 5000

	const deleter = makeManager(dir);
	deleter.setCachedSessionData('/a.json', entry(5000), 10);
	deleter.deleteCachedSessionData('/a.json'); // first deletion: tombstone baseline = mtime 5000
	deleter.deleteCachedSessionData('/a.json'); // second, independent deletion of the same path

	// The same-age disk entry (mtime 5000, written before either deletion) is exactly what a
	// wrongly weakened tombstone (mtime 0) would let back in via the `diskEntry.mtime > tombstoneMtime`
	// check in buildMergedSnapshotEntries().
	await deleter.writeSharedSnapshot();
	const entries = await deleter.readSharedSnapshot();
	assert.ok(!entries || !('/a.json' in entries!),
		'the same-age disk entry must still be stripped — a wrongly-weakened tombstone (mtime 0) would have let it survive');
});

// This documents *why* deleteCachedSessionData() (not a plain `cache.delete()`) is required: it
// proves writeSharedSnapshot()'s merge really does resurrect an in-memory-only delete from the
// on-disk copy written before it. If this test ever starts failing because the merge stopped
// reading from disk first, deleteCachedSessionData()'s tombstone becomes unnecessary — that's a
// signal to revisit it, not a reason to delete this test.
test('a plain cache.delete() (no tombstone) is resurrected by the next writeSharedSnapshot() — the exact bug deleteCachedSessionData() exists to avoid', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();

	m.cache.delete('/a.json');
	await m.writeSharedSnapshot();

	const entries = await m.readSharedSnapshot();
	assert.ok(entries && '/a.json' in entries!,
		'a plain cache.delete() is expected to be resurrected by the merge — this is exactly the bug deleteCachedSessionData() exists to avoid');
});

test('setCachedSessionData() clears a stale tombstone, so a rediscovered path can be persisted again', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();

	m.deleteCachedSessionData('/a.json');
	m.setCachedSessionData('/a.json', entry(3000), 10); // rediscovered with a newer mtime
	await m.writeSharedSnapshot();

	const entries = await m.readSharedSnapshot();
	assert.ok(entries && '/a.json' in entries!, 'a path re-added after deletion must not be permanently blocked by its old tombstone');
	assert.equal(entries!['/a.json'].mtime, 3000);
});

// Cross-window scenario: window A tombstones a path, then a NEWER entry for that same path
// arrives from another window via loadSharedSnapshotIfChanged() (mergeSnapshotEntries()) — not
// via setCachedSessionData(), the only place that previously cleared a tombstone. Without also
// clearing it there, window A's own next save would silently discard the other window's valid,
// newer publish — not merely resurrect an old deletion, but destroy new data.
test('loadSharedSnapshotIfChanged() clears a stale tombstone when accepting a newer entry from another window', async () => {
	const dir = tmpDir();
	const windowA = makeManager(dir);
	windowA.setCachedSessionData('/a.json', entry(1000), 10);
	await windowA.writeSharedSnapshot();

	windowA.deleteCachedSessionData('/a.json');

	// Another window republishes '/a.json' with a newer entry.
	const windowB = makeManager(dir);
	windowB.setCachedSessionData('/a.json', entry(5000), 10);
	await windowB.writeSharedSnapshot();

	// Window A picks up window B's newer snapshot via the merge path, not setCachedSessionData().
	const merged = await windowA.loadSharedSnapshotIfChanged();
	assert.equal(merged, 1, 'the newer /a.json entry must be merged in');
	assert.equal(windowA.cache.get('/a.json')?.mtime, 5000);

	// Window A's own next save must not delete the entry it just accepted from window B.
	await windowA.writeSharedSnapshot();
	const entries = await windowA.readSharedSnapshot();
	assert.ok(entries && '/a.json' in entries!,
		'a stale tombstone must not survive accepting a newer merged-in entry — otherwise this window\'s own next save silently destroys another window\'s valid publish');
	assert.equal(entries!['/a.json'].mtime, 5000);
});

// Distinct from the "clears a stale tombstone when accepting a NEWER entry" test above: this
// covers mergeSnapshotEntries()'s own comparison, not just the end-to-end save-after-merge
// behavior. A tombstoned path has no `existing` in-memory entry to compare against (it was
// removed), so before the fix `!existing` was always true and ANY disk entry — even one no newer
// than what was deleted — got merged back in unconditionally, silently resurrecting the deletion.
test('loadSharedSnapshotIfChanged() does not resurrect a tombstoned path from a disk entry that is no newer than the deletion', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	const reader = makeManager(dir);
	reader.setCachedSessionData('/a.json', entry(1000), 10);
	reader.deleteCachedSessionData('/a.json'); // tombstone baseline = mtime 1000

	// The on-disk snapshot still has the same-age entry the tombstone was recorded against.
	const merged = await reader.loadSharedSnapshotIfChanged();

	assert.equal(merged, 0, 'a disk entry no newer than the tombstone baseline must not be merged in');
	assert.ok(!reader.cache.has('/a.json'), 'the path must stay deleted in memory, not resurrected from the stale disk copy');
});

test('clearExpiredCache() does not tombstone virtual session paths (.db#/.vscdb#/.sqlite#session-id, editor:// schemes) via a raw fs.access() check', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	const virtualDbPath = path.join(dir, 'opencode.db#ses_doesNotMatterIfMissing');
	const virtualVscdbPath = path.join(dir, 'state.vscdb#composerIdDoesNotMatterIfMissing'); // Cursor
	const virtualSqlitePath = path.join(dir, 'state_1.sqlite#threadIdDoesNotMatterIfMissing'); // Codex
	const virtualUriPath = 'windsurf://trajectory/some-id';
	const realMissingPath = path.join(dir, 'definitely-does-not-exist.json');
	m.setCachedSessionData(virtualDbPath, entry(1000), 10);
	m.setCachedSessionData(virtualVscdbPath, entry(1000), 10);
	m.setCachedSessionData(virtualSqlitePath, entry(1000), 10);
	m.setCachedSessionData(virtualUriPath, entry(1000), 10);
	m.setCachedSessionData(realMissingPath, entry(1000), 10);

	await m.clearExpiredCache();

	assert.ok(m.cache.has(virtualDbPath),
		'a .db#-style virtual path must survive clearExpiredCache() — fs.access() cannot validate it, and wrongly evicting it now tombstones a still-valid session out of every future snapshot, not just this process\'s memory');
	assert.ok(m.cache.has(virtualVscdbPath),
		'a .vscdb#-style virtual path (Cursor) must likewise survive — the exemption must recognize the general "<ext>#<id>" shape, not just the literal ".db#" substring');
	assert.ok(m.cache.has(virtualSqlitePath),
		'a .sqlite#-style virtual path (Codex) must likewise survive');
	assert.ok(m.cache.has(virtualUriPath),
		'a scheme:// virtual path (Windsurf/Devin) must likewise survive clearExpiredCache()');
	assert.ok(!m.cache.has(realMissingPath),
		'a genuinely missing real filesystem path must still be expired — this exemption must not blanket-disable expiry');
});

test('clearExpiredCache() only tombstones on a confirmed-missing error (ENOENT/ENOTDIR), not any fs.access() failure', { skip: process.platform === 'win32' }, async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	// A path with an over-length filename component reliably fails fs.access() with ENAMETOOLONG on
	// Linux/macOS — a real fs.access() failure that is NOT "this file is gone" (unlike ENOENT).
	const tooLongPath = path.join(dir, 'a'.repeat(300) + '.json');
	m.setCachedSessionData(tooLongPath, entry(1000), 10);

	await m.clearExpiredCache();

	assert.ok(m.cache.has(tooLongPath),
		'an fs.access() failure that is not ENOENT/ENOTDIR (ENAMETOOLONG here) must not be treated as a confirmed deletion — a permissions hiccup or transient I/O error would otherwise permanently tombstone a still-valid, expensive-to-rebuild session out of every future snapshot');
});

// Distinct from the loadSharedSnapshotIfChanged() cross-window test above: here window A never
// merges window B's newer publish into its own in-memory cache before saving again — it just goes
// straight to writeSharedSnapshot(), which reads the CURRENT on-disk snapshot (already containing
// B's newer entry) and merges A's own map on top. Without a timestamp on the tombstone, A's
// deletion decision (made before B ever republished) would still strip B's newer entry from the
// merged result it writes back to disk.
test('writeSharedSnapshot() does not let a stale tombstone strip a newer entry another window published to disk in the meantime', async () => {
	const dir = tmpDir();
	const windowA = makeManager(dir);
	windowA.setCachedSessionData('/a.json', entry(1000), 10);
	await windowA.writeSharedSnapshot();

	windowA.deleteCachedSessionData('/a.json'); // tombstone baseline = mtime 1000

	// Another window republishes '/a.json' with a newer entry, directly to disk — window A never
	// sees this in memory.
	const windowB = makeManager(dir);
	windowB.setCachedSessionData('/a.json', entry(9000), 10);
	await windowB.writeSharedSnapshot();

	// Window A saves again without ever merging window B's update into its own cache.
	await windowA.writeSharedSnapshot();

	const entries = await windowA.readSharedSnapshot();
	assert.ok(entries && '/a.json' in entries!,
		'a tombstone recorded against an older mtime (1000) must not strip a disk entry that is now newer (9000) — that newer entry was published after this deletion decision was made');
	assert.equal(entries!['/a.json'].mtime, 9000);
});

test('writeSharedSnapshot() still strips a disk entry that is the same age as or older than the tombstoned deletion', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	writer.deleteCachedSessionData('/a.json'); // tombstone baseline = mtime 1000
	await writer.writeSharedSnapshot();

	const entries = await writer.readSharedSnapshot();
	assert.ok(!entries || !('/a.json' in entries!),
		'a disk entry no newer than the tombstone\'s baseline mtime is exactly what the deletion targeted, and must still be stripped');
});
