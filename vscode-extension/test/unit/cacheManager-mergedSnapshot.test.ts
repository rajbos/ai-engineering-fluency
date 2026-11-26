import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import { makeTmpFixtureDir } from './tmpFixtureDirs';

import { CacheManager } from '../../src/cacheManager';
import type { SessionFileCache } from '../../../src/types';
import { createMockMemento } from './vscode-test-helpers';

// Pins the merge rules of buildMergedSnapshotEntries() (the disk-snapshot + in-memory merge that
// writeSharedSnapshot() publishes): tombstone stripping, newer-by-mtime wins, the details-only
// placeholder guards, and the newest-N cap.

function makeManager(dir: string): CacheManager {
	const context: any = {
		extensionMode: 1,
		globalStorageUri: { fsPath: dir },
		globalState: createMockMemento(),
	};
	return new CacheManager(context, { log: () => {}, warn: () => {}, error: () => {} }, 1);
}

function entry(mtime: number, tokens = 100, extra: Partial<SessionFileCache> = {}): SessionFileCache {
	return { tokens, interactions: 1, modelUsage: {}, mtime, size: 10, ...extra } as SessionFileCache;
}

function buildMerged(m: CacheManager): Promise<Record<string, SessionFileCache>> {
	return (m as any).buildMergedSnapshotEntries();
}

/** Publish `entries` to the shared snapshot on disk from a separate manager (another window). */
async function seedDisk(dir: string, entries: Record<string, SessionFileCache>): Promise<void> {
	const writer = makeManager(dir);
	for (const [p, e] of Object.entries(entries)) { writer.setCachedSessionData(p, e, e.size); }
	await writer.writeSharedSnapshot();
}

test('buildMergedSnapshotEntries: empty disk and empty memory yields an empty result', async () => {
	const m = makeManager(makeTmpFixtureDir('ctt-merged-snapshot-'));
	assert.deepEqual(await buildMerged(m), {});
});

test('buildMergedSnapshotEntries: no disk snapshot returns the in-memory entries', async () => {
	const m = makeManager(makeTmpFixtureDir('ctt-merged-snapshot-'));
	m.setCachedSessionData('/a.json', entry(1000), 10);
	const merged = await buildMerged(m);
	assert.deepEqual(Object.keys(merged), ['/a.json']);
	assert.equal(merged['/a.json'].mtime, 1000);
});

test('buildMergedSnapshotEntries: overlapping keys keep the union, newer entry wins per key', async () => {
	const dir = makeTmpFixtureDir('ctt-merged-snapshot-');
	await seedDisk(dir, { '/a.json': entry(1000, 1), '/b.json': entry(2000, 2) });
	const m = makeManager(dir);
	m.setCachedSessionData('/b.json', entry(3000, 22), 10); // newer than disk
	m.setCachedSessionData('/c.json', entry(500, 3), 10);   // memory only
	const merged = await buildMerged(m);
	assert.deepEqual(Object.keys(merged).sort(), ['/a.json', '/b.json', '/c.json']);
	assert.equal(merged['/a.json'].tokens, 1);
	assert.equal(merged['/b.json'].tokens, 22);
	assert.equal(merged['/c.json'].tokens, 3);
});

test('buildMergedSnapshotEntries: a stale in-memory entry does not overwrite a newer disk entry', async () => {
	const dir = makeTmpFixtureDir('ctt-merged-snapshot-');
	await seedDisk(dir, { '/a.json': entry(5000, 1) });
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000, 2), 10);
	const merged = await buildMerged(m);
	assert.equal(merged['/a.json'].mtime, 5000);
	assert.equal(merged['/a.json'].tokens, 1);
});

test('buildMergedSnapshotEntries: an in-memory entry at the same mtime replaces the disk entry', async () => {
	const dir = makeTmpFixtureDir('ctt-merged-snapshot-');
	await seedDisk(dir, { '/a.json': entry(1000, 1) });
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000, 2), 10);
	assert.equal((await buildMerged(m))['/a.json'].tokens, 2);
});

test('buildMergedSnapshotEntries: a details-only placeholder does not overwrite a full disk entry of the same version', async () => {
	const dir = makeTmpFixtureDir('ctt-merged-snapshot-');
	await seedDisk(dir, { '/a.json': entry(1000, 1) });
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000, 0, { detailsOnly: true }), 10);
	const merged = await buildMerged(m);
	assert.equal(merged['/a.json'].tokens, 1);
	assert.ok(!merged['/a.json'].detailsOnly);
});

test('buildMergedSnapshotEntries: a full entry replacing a same-version placeholder keeps its detail metadata', async () => {
	const dir = makeTmpFixtureDir('ctt-merged-snapshot-');
	await seedDisk(dir, { '/a.json': entry(1000, 0, { detailsOnly: true, title: 'From placeholder' }) });
	const m = makeManager(dir);
	m.setCachedSessionData('/a.json', entry(1000, 7), 10);
	const merged = await buildMerged(m);
	assert.equal(merged['/a.json'].tokens, 7);
	assert.ok(!merged['/a.json'].detailsOnly);
	assert.equal(merged['/a.json'].title, 'From placeholder');
});

test('buildMergedSnapshotEntries: tombstones strip same-age disk entries but keep strictly newer ones', async () => {
	const dir = makeTmpFixtureDir('ctt-merged-snapshot-');
	await seedDisk(dir, { '/old.json': entry(1000), '/new.json': entry(9000) });
	const m = makeManager(dir);
	m.setCachedSessionData('/old.json', entry(1000), 10);
	m.setCachedSessionData('/new.json', entry(2000), 10);
	m.deleteCachedSessionData('/old.json'); // tombstone baseline 1000 == disk → stripped
	m.deleteCachedSessionData('/new.json'); // tombstone baseline 2000 < disk 9000 → kept
	const merged = await buildMerged(m);
	assert.ok(!('/old.json' in merged));
	assert.equal(merged['/new.json'].mtime, 9000);
});

test('buildMergedSnapshotEntries: caps the result to the newest SNAPSHOT_MAX_ENTRIES by mtime', async () => {
	const cls = CacheManager as any;
	const original = cls.SNAPSHOT_MAX_ENTRIES;
	cls.SNAPSHOT_MAX_ENTRIES = 2;
	try {
		const m = makeManager(makeTmpFixtureDir('ctt-merged-snapshot-'));
		m.setCachedSessionData('/a.json', entry(1000), 10);
		m.setCachedSessionData('/b.json', entry(3000), 10);
		m.setCachedSessionData('/c.json', entry(2000), 10);
		assert.deepEqual(Object.keys(await buildMerged(m)).sort(), ['/b.json', '/c.json']);
	} finally {
		cls.SNAPSHOT_MAX_ENTRIES = original;
	}
});
