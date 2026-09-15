import './vscode-shim-register';
import test, { mock } from 'node:test';
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

// `typeof null === 'object'`, so a naive `typeof envelope.entries === 'object'` check accepts
// `entries: null` and then crashes in Object.entries(null) on every poll. The validation must
// reject null entries and treat the snapshot as malformed.
test('readSharedSnapshot returns undefined when entries is null (typeof null === "object")', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	fs.mkdirSync(path.dirname(m.getSharedSnapshotPath()), { recursive: true });
	fs.writeFileSync(m.getSharedSnapshotPath(), JSON.stringify({
		schemaVersion: 1, cacheVersion: 1, cacheId: 'prod', generatedAt: Date.now(), publishSeq: 1, entryCount: 0, entries: null,
	}));
	const entries = await m.readSharedSnapshot();
	assert.equal(entries, undefined, 'an envelope with entries: null must be rejected as malformed, not crash in Object.entries');
});

// A transiently unreadable sidecar (EACCES/corrupt, NOT missing) must not make the next writer
// restart the generation at 1 after peers already loaded a higher seq — on a same-mtime/same-size
// replacement they'd see seq <= their bookmark and skip the update forever. The writer recovers
// the generation from the existing snapshot body instead.
test('writeSharedSnapshot() recovers the publish generation from the snapshot body when the sidecar is unreadable', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot(); // generation 1
	const seqPath = (writer as any).getSnapshotSeqPath();

	// Corrupt the sidecar with a numeric prefix — parseInt('4garbage') === 4, which would bypass
	// the recovery path and publish a wrong sequence. Strict validation must treat it as unknown.
	await fs.promises.writeFile(seqPath, 'not-a-number');

	// The next write must continue from the body's generation (1 -> 2), not restart at 1.
	writer.setCachedSessionData('/b.json', entry(2000), 10);
	await writer.writeSharedSnapshot();
	const seq = await fs.promises.readFile(seqPath, 'utf-8');
	assert.equal(seq.trim(), '2', 'an unreadable sidecar must recover the generation from the body, not restart at 1');
});

// A sidecar whose contents have a numeric prefix (e.g. '4garbage') must be treated as corrupt
// (undefined -> recover from the body), not parsed as generation 4 via parseInt's prefix matching.
test('writeSharedSnapshot() treats a numeric-prefix sidecar as corrupt and recovers from the body', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot(); // generation 1
	const seqPath = (writer as any).getSnapshotSeqPath();

	// '4garbage' would parseInt to 4 — strictly validating the whole value must reject it.
	await fs.promises.writeFile(seqPath, '4garbage');

	writer.setCachedSessionData('/b.json', entry(2000), 10);
	await writer.writeSharedSnapshot();
	const seq = await fs.promises.readFile(seqPath, 'utf-8');
	assert.equal(seq.trim(), '2', 'a numeric-prefix sidecar must be treated as corrupt and recovered from the body (1 -> 2), not parsed as 4');
});

// A legacy/pre-sidecar writer can leave the body's embedded publishSeq AHEAD of the sidecar. If
// the next new writer continued from the sidecar alone, it would publish a sequence a peer
// already bookmarked, and a same-mtime/same-size replacement would be skipped. The writer must
// continue from the MAX of the readable sidecar and the body's generation.
test('writeSharedSnapshot() continues from the max of sidecar and body generations (legacy body ahead of sidecar)', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot(); // generation 1

	// A legacy writer bumps the body's publishSeq to 5 but leaves the sidecar at 1.
	const snapshotPath = writer.getSharedSnapshotPath();
	const seqPath = (writer as any).getSnapshotSeqPath();
	const body = JSON.parse(await fs.promises.readFile(snapshotPath, 'utf-8'));
	body.publishSeq = 5;
	await fs.promises.writeFile(snapshotPath, JSON.stringify(body));
	assert.equal((await fs.promises.readFile(seqPath, 'utf-8')).trim(), '1', 'test setup: sidecar still at 1');

	// The next new write must publish 6 (max(1, 5) + 1), not 2 — so a peer bookmarked at 5 is
	// still superseded.
	writer.setCachedSessionData('/b.json', entry(2000), 10);
	await writer.writeSharedSnapshot();
	const seq = await fs.promises.readFile(seqPath, 'utf-8');
	assert.equal(seq.trim(), '6', 'the writer must continue from max(sidecar=1, body=5) = 5, publishing 6');
	const published = JSON.parse(await fs.promises.readFile(snapshotPath, 'utf-8'));
	assert.equal(published.publishSeq, 6, 'the published body carries generation 6');
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

// Regression test for the startup TOCTOU the reviewer flagged: loadCacheFromStorage() used to
// readFile() the snapshot and only then stat() it, so a same-tick republish landing between the
// two got bookmarked with the NEWER file's identity while sessionFileCache still held the OLDER
// bytes — and the next loadSharedSnapshotIfChanged() would see the matching bookmark and skip the
// update permanently. This test drives a REAL interleave: it wraps fs.promises.readFile so a
// republish fires after the pre-read stat but before the content is read, then asserts the next
// guarded load still picks the republished entry up. With the old post-read ordering the bookmark
// would already match the republished file and the reload would be skipped.
test('loadCacheFromStorage() bookmarks the pre-read identity, so a mid-read republish is still picked up', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	const snapshotPath = writer.getSharedSnapshotPath();
	const reader = makeManager(dir);

	// Interleave a republish between the pre-read stat and the readFile inside
	// loadCacheFromStorage(): the first readFile of the snapshot triggers a republish with a
	// NEWER entry that keeps the JSON length identical (mtime 1000 -> 5000, same digit count),
	// then pins the republished file's mtime back to the reader's pre-read value — the
	// coarse-mtime tie. With the stat fields identical, ONLY the publish generation can reveal
	// the republish; a post-read-stat implementation would have bookmarked the new identity and
	// the next load would wrongly skip it.
	const republisher = makeManager(dir);
	republisher.setCachedSessionData('/a.json', entry(5000), 10);
	const realReadFile = fs.promises.readFile;
	const realStat = fs.promises.stat;
	// The snapshot's true pre-read mtime — captured when the reader stats it inside
	// loadCacheFromStorage(), before the republish fires.
	let preReadMtime = 0;
	const statMock = mock.method(fs.promises, 'stat', async (p: any, opts?: any) => {
		const s = await realStat.call(fs.promises, p, opts);
		// Capture only the reader's pre-republish stat (before the interleave fires); the
		// republisher's own write is also mocked here and must not overwrite it.
		if (s && typeof p === 'string' && p === snapshotPath && preReadMtime === 0 && !interleaved) {
			preReadMtime = Number(s.mtimeMs);
		}
		return s;
	});
	let interleaved = false;
	const readFileMock = mock.method(fs.promises, 'readFile', async (p: any, opts?: any) => {
		const content = await realReadFile.call(fs.promises, p, opts);
		if (!interleaved && typeof p === 'string' && p === snapshotPath) {
			interleaved = true;
			// The reader has already stat()'d (pre-read). Republish now, before returning the
			// OLD bytes the reader is about to parse — the mid-read window — and pin the
			// republish's mtime to the pre-read value so the stat tie is exercised.
			await republisher.writeSharedSnapshot();
			const cur = await realStat.call(fs.promises, snapshotPath);
			await fs.promises.utimes(snapshotPath, Number(cur?.atimeMs ?? Date.now()) / 1000, preReadMtime / 1000);
		}
		return content;
	});

	try {
		await reader.loadCacheFromStorage();
	} finally {
		readFileMock.mock.restore();
		statMock.mock.restore();
	}

	assert.ok(interleaved, 'test setup: the republish must be interleaved into the startup read');
	assert.ok(preReadMtime > 0, 'test setup: the pre-read mtime must be captured');
	// The reader loaded the OLD bytes (mtime 1000); the on-disk file is now the republish. Pin
	// the republish's mtime to the pre-read value (utimes quantizes ~0.5 µs), then re-stat and
	// align the reader's mtime bookmark to the produced value so the stat tie is EXACT — only
	// the publish generation can now reveal the republish.
	assert.equal(reader.cache.get('/a.json')?.mtime, 1000, 'startup loaded the pre-republish bytes');
	const afterPin = await fs.promises.stat(snapshotPath);
	(reader as any).lastLoadedSnapshotMtime = afterPin.mtimeMs; // exact mtime tie
	const onDisk = await fs.promises.stat(snapshotPath);
	assert.equal(onDisk.size, (reader as any).lastLoadedSnapshotSize, 'test setup: the republish must keep the same size (stat tie)');
	const merged = await reader.loadSharedSnapshotIfChanged();
	assert.equal(merged, 1, 'a mid-read republish must be picked up — a post-read bookmark would have suppressed it');
	assert.equal(reader.cache.get('/a.json')?.mtime, 5000);
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

// Writers hold the cache lock around writeSharedSnapshot(); the delete takes the same lock so a
// writer that already read the old snapshot cannot rename its body after the unlink and resurrect
// pre-clear entries that clearCache() would then reload/persist. This verifies the observable
// contract: the delete completes correctly while another window holds the lock (the lock is a
// best-effort coordination hint — a clearCache must not deadlock — so this asserts correct
// behavior under contention, not a hard guarantee).
test('deleteSharedSnapshot: deletes correctly while a writer holds the cache lock', async () => {
	const dir = tmpDir();
	const clearer = makeManager(dir);
	clearer.setCachedSessionData('/a.json', entry(1000), 10);
	await clearer.writeSharedSnapshot();
	assert.ok(fs.existsSync(clearer.getSharedSnapshotPath()), 'snapshot should exist before delete');

	// A writer window holds the cache lock during the delete.
	const writer = makeManager(dir);
	assert.equal(await writer.acquireCacheLock(), true, 'writer holds the cache lock');
	try {
		await clearer.deleteSharedSnapshot();
		assert.equal(fs.existsSync(clearer.getSharedSnapshotPath()), false,
			'the delete must complete (not deadlock) while a writer holds the lock');
		// The clearer's own bookmark is reset so it won't serve the deleted data.
		assert.equal((clearer as any).lastLoadedSnapshotPublishSeq, 0, 'clearer bookmark reset after delete');
	} finally {
		await writer.releaseCacheLock();
	}
});

// The publish generation lives in a sidecar that deleteSharedSnapshot() deliberately keeps, so a
// recreated snapshot continues the sequence instead of restarting at 1. Otherwise a window that
// already loaded generation N would see the recreated file's generation restart below N and skip
// it (publishSeq <= N) on a same-mtime/same-size recreate. This covers clear-in-one-window while
// another polls.
test('deleteSharedSnapshot: a recreated snapshot continues the publish generation, so a polling window still picks it up', async () => {
	const dir = tmpDir();
	const clearer = makeManager(dir);
	clearer.setCachedSessionData('/a.json', entry(1000), 10);
	await clearer.writeSharedSnapshot(); // generation 1

	// A polling window loads generation 1.
	const poller = makeManager(dir);
	await poller.loadCacheFromStorage();
	assert.equal((poller as any).lastLoadedSnapshotPublishSeq, 1, 'poller loaded generation 1');

	// The clearer deletes the snapshot (clearCache) and a window recreates it with new content.
	await clearer.deleteSharedSnapshot();
	const recreator = makeManager(dir);
	recreator.setCachedSessionData('/a.json', entry(5000), 10);
	await recreator.writeSharedSnapshot(); // must be generation 2, not a restart at 1

	assert.equal((recreator as any).lastLoadedSnapshotPublishSeq, 2,
		'the recreated snapshot must continue the generation, not restart at 1 (the sidecar survives delete)');

	// The polling window detects and merges the recreated snapshot despite the delete/recreate.
	const merged = await poller.loadSharedSnapshotIfChanged();
	assert.equal(merged, 1, 'a recreated snapshot must be picked up by a window that loaded the pre-delete generation');
	assert.equal(poller.cache.get('/a.json')?.mtime, 5000);
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
	// Window A recorded its own snapshot's mtime when it wrote above, and
	// loadSharedSnapshotIfChanged() short-circuits on `mtimeMs <= lastLoadedSnapshotMtime`. These
	// two writes can land in the same millisecond, which reads as "nothing changed" and makes the
	// merge below return 0 — the test then fails on "the newer /a.json entry must be merged in".
	// Express "window B published something newer" explicitly rather than relying on the clock
	// advancing between two back-to-back writes. The production `mtimeMs <=` rule is right as it
	// stands: real windows do not publish twice within a millisecond.
	//
	// Use a far-future wall-clock mtime, not `Date.now() + 1000`: on Windows the wall clock can
	// jump BACKWARD by seconds (NTP slew, VM time sync, WSL2) and the wall clock can tick coarser
	// than NTFS file mtimes. Either turns a "+1s" timestamp into a past one at the instant the
	// file gets it, so windowA's recorded `lastLoadedSnapshotMtime` can end up >= the utimes'd
	// value and the load short-circuits — the observed flake. A fixed far-future mtime can never
	// be overtaken, and re-statting verifies the utimes actually took effect on this filesystem.
	const snapshotMtime = new Date('2100-01-01T00:00:00Z');
	const snapshotPath = windowB.getSharedSnapshotPath();
	let snapshotMtimeMs = 0;
	for (let attempt = 0; attempt < 3 && snapshotMtimeMs < snapshotMtime.getTime(); attempt++) {
		await fs.promises.utimes(snapshotPath, snapshotMtime, snapshotMtime);
		snapshotMtimeMs = (await fs.promises.stat(snapshotPath)).mtimeMs;
	}
	assert.equal(snapshotMtimeMs, snapshotMtime.getTime(),
		'setting the snapshot mtime must take effect (a filesystem that silently drops it makes this test meaningless)');

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

// Regression test for the Windows CI flake: when window B republishes the snapshot within the
// same filesystem timestamp tick as window A's last write (coarse mtime granularity — NTFS can
// report identical mtimes for writes milliseconds apart), the file mtime does not advance past
// the exact value window A bookmarked for its own write. An mtime-only
// `mtimeMs <= lastLoadedSnapshotMtime` guard would then suppress B's publish. The guard
// therefore pairs the mtime with the file SIZE: an unchanged snapshot (same mtime AND size) is
// skipped, but a same-tick republish with different content — hence a different size — is
// reloaded. Here we FORCE the identical mtime with fs.utimes instead of hoping the runner's
// clock resolution cooperates.
test('loadSharedSnapshotIfChanged() picks up a same-tick republish from another window (identical file mtime, different size)', async () => {
	const dir = tmpDir();
	const windowA = makeManager(dir);
	windowA.setCachedSessionData('/a.json', entry(1000), 10);
	await windowA.writeSharedSnapshot();
	// Window A's exact write mtime — what its (exact-mtime) bookmark holds.
	const snapshotPath = windowA.getSharedSnapshotPath();
	const exactWriteMtimeMs = (await fs.promises.stat(snapshotPath)).mtimeMs;
	const sizeA = (await fs.promises.stat(snapshotPath)).size;
	windowA.deleteCachedSessionData('/a.json');

	// Window B republishes with different content (an extra entry), so the snapshot bytes — and
	// size — differ even if the mtime does not.
	const windowB = makeManager(dir);
	windowB.setCachedSessionData('/a.json', entry(5000), 10);
	windowB.setCachedSessionData('/b.json', entry(5000), 10); // extra entry -> different size
	await windowB.writeSharedSnapshot();
	const sizeB = (await fs.promises.stat(snapshotPath)).size;
	assert.notEqual(sizeB, sizeA, 'test setup: a same-tick republish with different content must differ in size');

	// Force the coarse-timestamp tie: pin B's snapshot to A's exact write mtime, then align A's
	// bookmark to the value utimes actually produced (NTFS quantizes to ~0.5 µs, so the written
	// mtime can land a hair off the target). This yields a guaranteed tie — statAfter.mtimeMs
	// === A's bookmark. An mtime-only `mtimeMs <= bookmark` guard sees equality and skips the
	// reload; the mtime+size guard reloads because the size differs.
	const statBefore = await fs.promises.stat(snapshotPath);
	await fs.promises.utimes(snapshotPath, statBefore.atimeMs / 1000, exactWriteMtimeMs / 1000);
	const statAfter = await fs.promises.stat(snapshotPath);
	(windowA as any).lastLoadedSnapshotMtime = statAfter.mtimeMs; // the tie: bookmark == file mtime
	assert.notEqual(statAfter.size, (windowA as any).lastLoadedSnapshotSize,
		'test setup: the republished snapshot must differ in size from the one window A bookmarked');

	const merged = await windowA.loadSharedSnapshotIfChanged();
	assert.equal(merged, 2, 'a same-tick republish with different size must still be merged — an mtime-only guard would suppress it');
	assert.equal(windowA.cache.get('/a.json')?.mtime, 5000);
	assert.equal(windowA.cache.get('/b.json')?.mtime, 5000);
});

// The size-aware guard must not regress into re-parsing an unchanged snapshot on every refresh:
// when neither the mtime nor the size moved, loadSharedSnapshotIfChanged() returns 0 without
// touching the cache. (A rounded-down bookmark would always re-read; exact mtime + size does not.)
test('loadSharedSnapshotIfChanged() skips an unchanged snapshot (same mtime and size) without re-merging', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	const reader = makeManager(dir);
	const first = await reader.loadSharedSnapshotIfChanged();
	assert.equal(first, 1, 'the first load merges the published entry');

	// Locally overwrite with a NEWER in-memory entry, then call again on an unchanged snapshot:
	// the guard must skip the reload entirely, leaving the newer local data untouched.
	reader.setCachedSessionData('/a.json', entry(9000), 10);
	const second = await reader.loadSharedSnapshotIfChanged();
	assert.equal(second, 0, 'an unchanged snapshot must be skipped, not re-merged');
	assert.equal(reader.cache.get('/a.json')?.mtime, 9000, 'a skipped reload must not clobber newer in-memory data');
});

// The exact loophole the reviewer flagged: a same-tick republish can change content WITHOUT
// changing the JSON length (here /a.json's mtime goes 1000 -> 5000, both four digits, so the
// serialized envelope is the same size). An mtime+size guard alone would see both stat fields
// tie and skip the reload, silently losing the newer entry. The publish generation (the .seq
// sidecar) distinguishes this from an unchanged snapshot.
test('loadSharedSnapshotIfChanged() picks up a same-tick, same-size republish via the publish generation', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot();

	const reader = makeManager(dir);
	const first = await reader.loadSharedSnapshotIfChanged();
	assert.equal(first, 1, 'the first load merges the published entry');
	reader.cache.delete('/a.json'); // simulate the entry being dropped locally

	// Republish the SAME path with a value that keeps the JSON length identical (1000 -> 5000:
	// same digit count), so mtime+size alone cannot tell the republish apart.
	const republisher = makeManager(dir);
	republisher.setCachedSessionData('/a.json', entry(5000), 10);
	await republisher.writeSharedSnapshot();
	const snapshotPath = reader.getSharedSnapshotPath();
	const sizeBefore = (await fs.promises.stat(snapshotPath)).size;

	// Force the full stat tie: pin the republish's mtime to the reader's bookmarked value. Size
	// already matches. Only the publish generation can now detect the change.
	const bookmarkMtime = (reader as any).lastLoadedSnapshotMtime;
	const statPre = await fs.promises.stat(snapshotPath);
	await fs.promises.utimes(snapshotPath, statPre.atimeMs / 1000, bookmarkMtime / 1000);
	const statAfter = await fs.promises.stat(snapshotPath);
	(reader as any).lastLoadedSnapshotMtime = statAfter.mtimeMs; // exact mtime tie
	assert.equal(statAfter.size, sizeBefore, 'test setup: the republish must keep the same size');
	assert.equal(statAfter.size, (reader as any).lastLoadedSnapshotSize, 'test setup: full stat tie (mtime and size)');

	const merged = await reader.loadSharedSnapshotIfChanged();
	assert.equal(merged, 1, 'a same-size, same-tick republish must be detected via the publish generation — mtime+size alone would skip it');
	assert.equal(reader.cache.get('/a.json')?.mtime, 5000);
});

// The sidecar is written BEFORE the snapshot body, so a reader on a stat tie can observe the new
// generation in the sidecar while readSharedSnapshot() still returns the previous body. If the
// reader then bookmarked that new seq against the old bytes, the next poll (seq <= bookmark)
// would skip the real publish forever. The tie path therefore validates the body's embedded
// publishSeq against the sidecar and, on disagreement, leaves the bookmark untouched to retry.
test('loadSharedSnapshotIfChanged() retries instead of bookmarking when the sidecar seq is ahead of the body (mid-write)', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot(); // body + sidecar at generation 1

	const reader = makeManager(dir);
	await reader.loadSharedSnapshotIfChanged();
	assert.equal((reader as any).lastLoadedSnapshotPublishSeq, 1, 'reader is at generation 1');
	reader.cache.delete('/a.json');

	// Simulate a publish caught mid-write: bump the sidecar to generation 2 while the body on
	// disk still carries generation 1 (and pin the body to the reader's mtime+size so we hit the
	// tie branch). The reader must NOT advance its bookmark to 2 against the stale body.
	const snapshotPath = reader.getSharedSnapshotPath();
	const seqPath = (reader as any).getSnapshotSeqPath();
	const bookmarkMtime = (reader as any).lastLoadedSnapshotMtime;
	const statPre = await fs.promises.stat(snapshotPath);
	await fs.promises.utimes(snapshotPath, statPre.atimeMs / 1000, bookmarkMtime / 1000);
	const statAfter = await fs.promises.stat(snapshotPath);
	(reader as any).lastLoadedSnapshotMtime = statAfter.mtimeMs; // exact mtime tie
	assert.equal(statAfter.size, (reader as any).lastLoadedSnapshotSize, 'test setup: body unchanged, full stat tie');
	await fs.promises.writeFile(seqPath, '2'); // sidecar ahead of the body's embedded publishSeq 1

	const firstTry = await reader.loadSharedSnapshotIfChanged();
	assert.equal(firstTry, 0, 'a sidecar ahead of the body must not be merged against stale bytes');
	assert.equal((reader as any).lastLoadedSnapshotPublishSeq, 1,
		'the bookmark must NOT advance to the sidecar generation while the body is still the old one');

	// Once the body catches up (a real publish completes), the next poll merges it.
	const finisher = makeManager(dir);
	finisher.setCachedSessionData('/a.json', entry(5000), 10);
	await finisher.writeSharedSnapshot(); // body + sidecar now agree at generation 3
	const cur = await fs.promises.stat(snapshotPath);
	await fs.promises.utimes(snapshotPath, cur.atimeMs / 1000, bookmarkMtime / 1000);
	const reStat = await fs.promises.stat(snapshotPath);
	(reader as any).lastLoadedSnapshotMtime = reStat.mtimeMs; // keep the stat tie
	const secondTry = await reader.loadSharedSnapshotIfChanged();
	assert.equal(secondTry, 1, 'once the body catches up to the sidecar, the publish is merged');
	assert.equal(reader.cache.get('/a.json')?.mtime, 5000);
});

// Migration hazard the reviewer flagged: a pre-sidecar window (old extension version) can
// republish the schema-1 body WITHOUT touching the sidecar. The body still carries a publishSeq
// (the field predates the sidecar), so on a same-mtime/same-size tie a reader that trusts only
// the sidecar would see a stale seq and skip the legacy update forever. When the body's embedded
// publishSeq is HIGHER than the sidecar's, the body is newer than the sidecar knows — trust it.
test('loadSharedSnapshotIfChanged() trusts a body whose embedded publishSeq is ahead of the sidecar (legacy pre-sidecar writer)', async () => {
	const dir = tmpDir();
	const writer = makeManager(dir);
	writer.setCachedSessionData('/a.json', entry(1000), 10);
	await writer.writeSharedSnapshot(); // body + sidecar at generation 1

	const reader = makeManager(dir);
	await reader.loadSharedSnapshotIfChanged();
	assert.equal((reader as any).lastLoadedSnapshotPublishSeq, 1, 'reader is at generation 1');
	reader.cache.delete('/a.json');

	// A legacy (pre-sidecar) writer predates the sidecar entirely, so remove it, then republish
	// the body with a HIGHER publishSeq. Keep the JSON length identical (entry mtime 1000 ->
	// 5000, same digit count) and pin the mtime to the reader's bookmark, so the stat ties and
	// only the body reveals the update.
	const snapshotPath = reader.getSharedSnapshotPath();
	const seqPath = (reader as any).getSnapshotSeqPath();
	await fs.promises.unlink(seqPath); // legacy deployment: no sidecar exists
	const body = JSON.parse(await fs.promises.readFile(snapshotPath, 'utf-8'));
	body.publishSeq = 5; // legacy writer bumps the body generation only
	body.entries['/a.json'] = entry(5000); // 1000 -> 5000: same digit count, same size
	await fs.promises.writeFile(snapshotPath, JSON.stringify(body));
	// Pin the body to the reader's mtime so the stat ties.
	const bookmarkMtime = (reader as any).lastLoadedSnapshotMtime;
	const statPre = await fs.promises.stat(snapshotPath);
	await fs.promises.utimes(snapshotPath, statPre.atimeMs / 1000, bookmarkMtime / 1000);
	const statAfter = await fs.promises.stat(snapshotPath);
	(reader as any).lastLoadedSnapshotMtime = statAfter.mtimeMs; // exact mtime tie
	assert.equal(statAfter.size, (reader as any).lastLoadedSnapshotSize, 'test setup: full stat tie (mtime and size)');
	assert.ok(!fs.existsSync(seqPath), 'test setup: no sidecar exists in the legacy deployment');

	const merged = await reader.loadSharedSnapshotIfChanged();
	assert.equal(merged, 1, 'a body whose embedded publishSeq is ahead of the sidecar must be merged — a legacy pre-sidecar writer');
	assert.equal(reader.cache.get('/a.json')?.mtime, 5000);
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

// Checkpoint dirty-tracking: maybeCheckpointCache() must skip a save when nothing changed
// (previously it could fire on the time interval alone, even with zero dirty entries — the
// "Checkpointing cache: 0 new entries..." log line this behavior exists to eliminate), but must
// still recognize every real change — a changed existing entry, not just a brand-new path, and a
// genuine tombstone, not a repeated no-op of the same deletion race.
test('maybeCheckpointCache() returns false when nothing is dirty, even though a fresh manager has always had its time threshold elapsed', () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	// lastCheckpointTime starts at 0, so "time since last checkpoint" is enormous from the very
	// first check — the dirty-count guard must still block a checkpoint with nothing to save.
	assert.equal(m.maybeCheckpointCache(), false);
});

test('a dirty write on a fresh manager is eligible to checkpoint via the always-elapsed time threshold', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	assert.equal(m.maybeCheckpointCache(), false, 'nothing dirty yet');

	m.setCachedSessionData('/a.json', entry(1000), 10);
	assert.equal(m.maybeCheckpointCache(), true, 'one dirty write plus the always-elapsed time threshold must trigger a checkpoint');

	// Let the fire-and-forget save settle before the test (and its tmp dir) goes away.
	await m.awaitInFlightCheckpoint();
});

test('maybeCheckpointCache() counts a changed existing entry as dirty, not just brand-new paths', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	m.resetCheckpointCounters(); // start counting fresh, as _runRefreshCore() does per leader refresh
	assert.equal(m.maybeCheckpointCache(), false, 'nothing dirty right after reset');

	// Reach the entries threshold (100) via repeated *changes to the same already-cached path*,
	// not new paths — this is exactly what an earlier version of setCachedSessionData()
	// undercounted (only brand-new paths nudged the checkpoint threshold), so a long scan that
	// only re-parses already-known, changed files never checkpointed at all.
	for (let i = 0; i < 100; i++) {
		m.setCachedSessionData('/a.json', entry(2000 + i), 10);
	}
	assert.equal(m.maybeCheckpointCache(), true, 'reaching the entries threshold via changed-entry writes alone must trigger a checkpoint');

	await m.awaitInFlightCheckpoint();
});

test('deleteCachedSessionData() marks the cache dirty for a real removal, but a repeated no-op tombstone of the same path does not', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	for (let i = 0; i < 100; i++) {
		m.setCachedSessionData(`/file${i}.json`, entry(1000 + i), 10);
	}
	m.resetCheckpointCounters(); // start counting fresh, as _runRefreshCore() does per leader refresh
	assert.equal(m.maybeCheckpointCache(), false, 'nothing dirty right after reset');

	// 100 real, distinct deletions reach the entries threshold on their own (independent of the
	// time threshold, which a fresh reset leaves unmet) — proving a tombstone counts as dirty
	// just like a new/changed entry.
	for (let i = 0; i < 100; i++) {
		m.deleteCachedSessionData(`/file${i}.json`);
	}
	assert.equal(m.maybeCheckpointCache(), true, 'reaching the entries threshold via real deletions alone must trigger a checkpoint');
	await m.awaitInFlightCheckpoint(); // let the fire-and-forget save settle

	m.resetCheckpointCounters();
	assert.equal(m.maybeCheckpointCache(), false, 'nothing dirty right after reset');

	// Repeating the same 100 deletions again — the documented clearExpiredCache()/
	// reconcilePreloadedAgainstDiscovery() race, an already-gone, already-tombstoned path deleted
	// a second time — must not re-mark the cache dirty, since none of these tombstone baselines
	// actually change.
	for (let i = 0; i < 100; i++) {
		m.deleteCachedSessionData(`/file${i}.json`);
	}
	assert.equal(m.maybeCheckpointCache(), false,
		'100 repeated no-op tombstones of already-removed, already-tombstoned paths must not trigger a checkpoint');
});

// ---------------------------------------------------------------------------
// Round-8 review finding #1: a leader refresh cycle that parses files but throws before ever
// reaching persistRefreshResult() (and before a periodic mid-parse checkpoint fires) leaves
// genuinely dirty, unpersisted entries in the cache. The old _runRefreshCore() called
// resetCheckpointCounters() unconditionally at the top of the *next* leader cycle, zeroing that
// dirty count while the underlying data was still only in memory — a cache-hit-only next cycle
// would then never checkpoint it again. The fix (flushPendingCheckpointBeforeReset() in
// extension.ts) must flush first, and only reset once nothing is left dirty.
// ---------------------------------------------------------------------------

test('forceCheckpointCache() flushes pending dirty entries from a previous, uncheckpointed cycle before counters are reset', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);

	// Simulate a leader cycle that parsed files (dirty entries) but crashed/threw before
	// persistRefreshResult() or a periodic checkpoint ever ran — the data exists only in memory.
	m.setCachedSessionData('/a.json', entry(1000), 10);
	m.setCachedSessionData('/b.json', entry(2000), 10);
	assert.equal(m.hasUnflushedCheckpointWork(), true, 'the failed cycle left dirty, unpersisted entries behind');

	// This is the fix's own sequence, as _runRefreshCore() now runs it via
	// flushPendingCheckpointBeforeReset() before ever calling resetCheckpointCounters().
	await m.awaitInFlightCheckpoint(); // nothing in flight yet on a fresh manager — a no-op
	if (m.hasUnflushedCheckpointWork()) {
		await m.forceCheckpointCache();
	}
	assert.equal(m.hasUnflushedCheckpointWork(), false, 'forceCheckpointCache() must fully flush the pending work');

	const entries = await m.readSharedSnapshot();
	assert.ok(entries, 'the previous cycle\'s parsed data must have reached disk before the counters are reset');
	assert.equal(Object.keys(entries!).length, 2);

	// Only safe to reset once nothing dirty remains — and here it genuinely doesn't, because it
	// was flushed first rather than silently discarded.
	m.resetCheckpointCounters();
	assert.equal(m.maybeCheckpointCache(), false, 'nothing dirty right after reset, because it was actually flushed rather than dropped');
});

test('when the flush itself fails (e.g. another window holds the cache lock), the dirty entries stay tracked instead of being silently dropped', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);

	// Simulate another window holding the cache save lock: same PID (so checkOwnerAlive treats it
	// as alive) but a different sessionId (so this manager does not recognize it as its own), with
	// a fresh timestamp so it isn't treated as stale either.
	fs.writeFileSync(m.getCacheLockPath(), JSON.stringify({ sessionId: 'other-window', pid: process.pid, timestamp: Date.now() }));

	await m.forceCheckpointCache();
	assert.equal(m.hasUnflushedCheckpointWork(), true,
		'a flush that could not acquire the lock must leave the dirty entries tracked, not silently dropped — the caller must not reset the counters in this case');
});

// ---------------------------------------------------------------------------
// Round-8 review finding #2: clearCache() deletes the shared on-disk snapshot after clearing the
// in-memory cache. If a checkpoint's writeSharedSnapshot() is already mid-flight at that moment —
// built from on-disk/in-memory state read *before* the clear — its write could complete after the
// delete and resurrect the data the clear just removed. writeSharedSnapshot() now aborts once it
// notices clearAllCachedData() bumped the clear generation since it started reading, and
// clearCache() now awaits any in-flight checkpoint before deleting so its own delete always lands
// last regardless of exactly when the abort check fires.
// ---------------------------------------------------------------------------

test('writeSharedSnapshot() aborts instead of persisting when clearAllCachedData() runs mid-write', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();

	m.setCachedSessionData('/b.json', entry(2000), 10);

	const originalReadFile = fs.promises.readFile;
	let intercepted = false;
	(fs.promises as any).readFile = async (...args: unknown[]) => {
		const result = await (originalReadFile as (...a: unknown[]) => Promise<unknown>).apply(fs.promises, args);
		// Simulate clearCache() landing exactly while this checkpoint is reading the on-disk
		// snapshot it's about to merge with — a real interleaving, not just a contrived ordering.
		if (!intercepted && String(args[0]).endsWith('.snapshot.json')) {
			intercepted = true;
			m.clearAllCachedData();
		}
		return result;
	};
	let persisted: boolean;
	try {
		persisted = await m.writeSharedSnapshot();
	} finally {
		(fs.promises as any).readFile = originalReadFile;
	}
	assert.equal(persisted, false, 'a write racing a concurrent clear must abort rather than persist stale, pre-clear data');
	assert.ok(intercepted, 'the read interception must actually have fired for this assertion to be meaningful');

	const entries = await m.readSharedSnapshot();
	assert.ok(!entries || !('/b.json' in entries), 'the cleared cache must not be resurrected with data captured before the clear');
});

test('clearCache()-style sequence (clearAllCachedData + awaitInFlightCheckpoint + deleteSharedSnapshot) is not resurrected by a slow in-flight checkpoint', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);

	const originalWriteFile = fs.promises.writeFile;
	(fs.promises as any).writeFile = async (...args: unknown[]) => {
		// Simulate a slow disk write so the checkpoint is still mid-flight when the clear below runs.
		await new Promise(r => setTimeout(r, 30));
		return (originalWriteFile as (...a: unknown[]) => Promise<unknown>).apply(fs.promises, args);
	};

	try {
		assert.equal(m.maybeCheckpointCache(), true, 'a dirty write plus the always-elapsed time threshold must start a checkpoint');

		// Mirrors clearCache(): clear in-memory state, wait for the in-flight checkpoint to settle,
		// then delete the on-disk snapshot — in that order.
		m.clearAllCachedData();
		await m.awaitInFlightCheckpoint();
		await m.deleteSharedSnapshot();
	} finally {
		(fs.promises as any).writeFile = originalWriteFile;
	}

	const entries = await m.readSharedSnapshot();
	assert.ok(!entries, 'the cleared snapshot must not be resurrected by a checkpoint that was in flight when the clear ran');
	assert.equal(fs.existsSync(m.getSharedSnapshotPath()), false, 'the snapshot file must stay deleted');
});

// ---------------------------------------------------------------------------
// Follow-up review finding: persistRefreshResult() used to call trySaveCacheToStorage() directly,
// bypassing checkpoint accounting entirely — a fully successful end-of-refresh save left
// entriesSinceLastCheckpoint exactly as dirty as before it, so the *next* leader cycle's
// flushPendingCheckpointBeforeReset() saw stale dirty state and performed a redundant extra
// checkpoint read/merge/write before doing anything of its own. saveAndAccountForRefresh() (what
// persistRefreshResult() now calls) must leave nothing dirty behind a successful save.
// ---------------------------------------------------------------------------

test('saveAndAccountForRefresh() persists and fully clears the dirty counter, so the next cycle has nothing left to flush', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	m.setCachedSessionData('/b.json', entry(2000), 10);
	assert.equal(m.hasUnflushedCheckpointWork(), true, 'dirty before the refresh-end save');

	const saved = await m.saveAndAccountForRefresh();
	assert.equal(saved, true, 'an uncontended save must succeed');
	assert.equal(m.hasUnflushedCheckpointWork(), false,
		'a fully successful end-of-refresh save must leave nothing dirty — otherwise the next leader cycle redundantly re-checkpoints before it has parsed anything of its own');

	const entries = await m.readSharedSnapshot();
	assert.ok(entries && Object.keys(entries).length === 2, 'the data must actually have reached disk');
});

test('saveAndAccountForRefresh() leaves the dirty count intact when the save is skipped (lock contention)', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);

	fs.writeFileSync(m.getCacheLockPath(), JSON.stringify({ sessionId: 'other-window', pid: process.pid, timestamp: Date.now() }));

	const saved = await m.saveAndAccountForRefresh();
	assert.equal(saved, false, 'lock contention must be reported as not-saved');
	assert.equal(m.hasUnflushedCheckpointWork(), true, 'a skipped save must not be mistaken for a persisted one');
});

// ---------------------------------------------------------------------------
// Follow-up review findings: clearCache()'s previous protection (awaiting only this window's own
// in-flight *checkpoint* promise) missed two real writers — this window's own persistRefreshResult()
// save (which never went through that promise) and any other VS Code window's save entirely, since
// cacheClearGeneration lives only in this process's memory. deleteSharedSnapshot() now serializes
// on the shared cache lock file itself (with a bounded retry) before deleting, which every writer —
// in-process or cross-window — already holds for the small window between its read and its rename.
// ---------------------------------------------------------------------------

test('deleteSharedSnapshot() waits for a held cache lock (e.g. another window mid-write) before deleting, rather than racing it', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();

	// Simulate another window holding the cache lock while it's mid-write: same PID (so
	// checkOwnerAlive treats it as alive) but a different sessionId, with a fresh timestamp.
	fs.writeFileSync(m.getCacheLockPath(), JSON.stringify({ sessionId: 'other-window', pid: process.pid, timestamp: Date.now() }));

	const deletePromise = m.deleteSharedSnapshot();

	// Release the simulated peer's lock shortly after — well within deleteSharedSnapshot()'s
	// retry budget (10 x 50ms = 500ms) — to prove it actually waited rather than deleting
	// immediately alongside the "held" lock.
	await new Promise(r => setTimeout(r, 100));
	fs.unlinkSync(m.getCacheLockPath());

	await deletePromise;

	assert.equal(fs.existsSync(m.getSharedSnapshotPath()), false, 'the snapshot must be deleted once the lock was actually available');
	assert.equal(fs.existsSync(m.getCacheLockPath()), false, 'deleteSharedSnapshot() must release the lock it acquired');
});

test('deleteSharedSnapshot() proceeds anyway once its retry budget is spent against a permanently stuck lock', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();

	// A lock that is never released (simulating a genuinely stuck peer) must not hang "Clear
	// Cache" forever. A small retry budget here exercises the same give-up path as production's
	// 10s/100ms default without a real test waiting out the full 10 seconds.
	fs.writeFileSync(m.getCacheLockPath(), JSON.stringify({ sessionId: 'other-window', pid: process.pid, timestamp: Date.now() }));

	await m.deleteSharedSnapshot({ attempts: 3, delayMs: 5 });

	assert.equal(fs.existsSync(m.getSharedSnapshotPath()), false, 'the snapshot must still be deleted even without the lock, rather than leaving Clear Cache stuck');
});

// ---------------------------------------------------------------------------
// Follow-up review finding: clearAllCachedData() cleared sessionFileCache but left deletedFilePaths
// (tombstones from deletions decided *before* the clear) intact. A "Clear Cache" is meant to reset
// all cache state, deletion decisions included — a stale, pre-clear tombstone surviving the clear
// would otherwise keep stripping a path that some window legitimately republishes afterward at or
// below that old baseline mtime, exactly the "clear doesn't actually reset everything" bug.
// ---------------------------------------------------------------------------

test('clearAllCachedData() clears tombstones too, so a pre-clear deletion cannot keep stripping a path republished after the clear', async () => {
	const dir = tmpDir();
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();
	m.deleteCachedSessionData('/a.json'); // tombstone baseline = mtime 1000, pre-clear

	m.clearAllCachedData();

	// Some window (this one or another) republishes '/a.json' at or below the old tombstone's
	// baseline mtime — plausible after a clear, since the file on disk hasn't necessarily changed.
	m.setCachedSessionData('/a.json', entry(1000), 10);
	await m.writeSharedSnapshot();

	const entries = await m.readSharedSnapshot();
	assert.ok(entries && '/a.json' in entries,
		'a tombstone recorded before clearAllCachedData() must not survive it and strip a path republished afterward');
});

test('clearAllCachedData() resets the checkpoint dirty count too, so the next cycle does not redundantly checkpoint an empty cache', () => {
	const m = makeManager(tmpDir());
	m.setCachedSessionData('/a.json', entry(1000), 10);
	assert.equal(m.hasUnflushedCheckpointWork(), true, 'dirty before the clear');

	m.clearAllCachedData();

	assert.equal(m.hasUnflushedCheckpointWork(), false,
		'a clear must reset the dirty count along with the entries it was tracking — otherwise the next leader cycle sees stale dirty state and performs a full checkpoint save of the now-empty cache before parsing anything of its own');
});
