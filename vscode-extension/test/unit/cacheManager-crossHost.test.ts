import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { makeTmpFixtureDir } from './tmpFixtureDirs';

import { CacheManager } from '../../src/cacheManager';
import { createMockMemento } from './vscode-test-helpers';
import { getMachineParseLockPath } from '../../../src/machineParseLock';
import type { SessionFileCache } from '../../../src/types';

// Cross-host parse coordination (src/machineParseLock.ts) as seen from the VS Code CacheManager:
// two "editions" are two managers with separate globalStorage dirs sharing one machine lock dir.

function makeEdition(storageDir: string, machineLockDir: string | undefined, hostId: string, cacheVersion = 1): CacheManager {
	const context: any = { extensionMode: 1, globalStorageUri: { fsPath: storageDir }, globalState: createMockMemento() };
	const manager = new CacheManager(context, { log: () => {}, warn: () => {}, error: () => {}, machineLockDir }, cacheVersion);
	// The shim's vscode.env.appName is the same for every manager; give each edition its own id.
	(manager as any).getPeerHostId = () => hostId;
	return manager;
}

function entry(mtime: number): SessionFileCache {
	return { tokens: 100, interactions: 1, modelUsage: {}, mtime, size: 10 } as SessionFileCache;
}

function setup(insidersCacheVersion = 1) {
	const root = makeTmpFixtureDir('ctt-crosshost-');
	const lockDir = path.join(root, 'locks');
	const stable = makeEdition(path.join(root, 'stable'), lockDir, 'vscode-stable-prod');
	const insiders = makeEdition(path.join(root, 'insiders'), lockDir, 'vscode-insiders-prod', insidersCacheVersion);
	return { root, lockDir, stable, insiders };
}

async function stableParsesAndPublishes(stable: CacheManager): Promise<void> {
	await stable.coordinateCrossHostParse();
	stable.setCachedSessionData('/sessions/a.jsonl', entry(1000), 10);
	stable.setCachedSessionData('/sessions/b.jsonl', entry(2000), 10);
	await stable.writeSharedSnapshot();
	await stable.finishCrossHostParse();
}

test('cross-host: disabled without a machine lock dir (the default for tests and callers that opt out)', async () => {
	const root = makeTmpFixtureDir('ctt-crosshost-');
	const manager = makeEdition(path.join(root, 'stable'), undefined, 'vscode-stable-prod');
	assert.equal(await manager.acquireMachineParseLock({ maxWaitMs: 10, pollMs: 5 }), false);
	await manager.coordinateCrossHostParse();
	await manager.finishCrossHostParse();
	assert.equal(await manager.loadPeerSnapshotsIfChanged(), 0);
});

test('cross-host: an edition reuses the entries another edition just parsed', async () => {
	const { stable, insiders } = setup();
	await stableParsesAndPublishes(stable);

	await insiders.coordinateCrossHostParse();
	assert.equal(insiders.cache.get('/sessions/a.jsonl')?.mtime, 1000, 'peer entry merged: a cache hit, no reparse');
	assert.equal(insiders.cache.get('/sessions/b.jsonl')?.mtime, 2000);
	assert.equal(await insiders.loadPeerSnapshotsIfChanged(), 0, 'an unchanged peer snapshot is not re-read');
	await insiders.finishCrossHostParse();
});

test('cross-host: never merges a peer snapshot written by a different cache version', async () => {
	const { stable, insiders } = setup(2);
	await stableParsesAndPublishes(stable);
	await insiders.coordinateCrossHostParse();
	assert.equal(insiders.cache.size, 0);
});

test('cross-host: a newer local entry is not replaced by an older peer entry', async () => {
	const { stable, insiders } = setup();
	await stableParsesAndPublishes(stable);
	insiders.setCachedSessionData('/sessions/a.jsonl', entry(5000), 10);
	await insiders.loadPeerSnapshotsIfChanged();
	assert.equal(insiders.cache.get('/sessions/a.jsonl')?.mtime, 5000);
});

test('cross-host: a peer snapshot older than this edition\'s last Clear Cache is not merged back', async () => {
	const { stable, insiders } = setup();
	await stableParsesAndPublishes(stable);
	await new Promise(r => setTimeout(r, 20)); // clear epoch strictly after the peer's snapshot mtime
	insiders.clearAllCachedData();
	await insiders.deleteSharedSnapshot();
	assert.equal(await insiders.loadPeerSnapshotsIfChanged(), 0);
	assert.equal(insiders.cache.size, 0);
});

test('cross-host: the second edition waits while the first holds the parse lock, then gets it', async () => {
	const { lockDir, stable, insiders } = setup();
	assert.equal(await stable.acquireMachineParseLock({ maxWaitMs: 0, pollMs: 1 }), true);
	const lock = JSON.parse(fs.readFileSync(getMachineParseLockPath(lockDir), 'utf-8'));
	assert.equal(lock.host, 'vscode-stable-prod');
	assert.equal(typeof lock.stallMs, 'number', 'parse lock declares a progress deadline');

	let waits = 0;
	assert.equal(await insiders.acquireMachineParseLock({ maxWaitMs: 40, pollMs: 5, onWait: () => { waits++; } }), false, 'live holder keeps it');
	assert.ok(waits > 0, 'onWait runs while waiting');

	await stable.releaseMachineParseLock();
	assert.equal(await insiders.acquireMachineParseLock({ maxWaitMs: 40, pollMs: 5 }), true);
	await stable.releaseMachineParseLock(); // not the holder any more: must not delete insiders' lock
	assert.equal(fs.existsSync(getMachineParseLockPath(lockDir)), true);
	await insiders.releaseMachineParseLock();
	assert.equal(fs.existsSync(getMachineParseLockPath(lockDir)), false);
});

test('refresh lock: declares stall and max-hold limits, and the heartbeat records progress only when the parse reported some', async () => {
	const { stable } = setup();
	assert.equal(await stable.acquireRefreshLock(), true);
	const lockPath = stable.getRefreshLockPath();
	const first = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
	assert.equal(first.stallMs, CacheManager.REFRESH_LOCK_STALL_MS);
	assert.equal(first.maxHoldMs, CacheManager.REFRESH_LOCK_MAX_HOLD_MS);

	await new Promise(r => setTimeout(r, 5));
	assert.equal(await stable.renewRefreshLock(), true);
	const idle = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
	assert.ok(idle.timestamp > first.timestamp, 'heartbeat renewed');
	assert.equal(idle.progressAt, first.progressAt, 'no parse progress, so progressAt is unchanged');

	stable.noteRefreshProgress();
	await new Promise(r => setTimeout(r, 5));
	assert.equal(await stable.renewRefreshLock(), true);
	const progressed = JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
	assert.ok(progressed.progressAt > first.progressAt, 'reported progress reaches the lock');
	await stable.releaseRefreshLock();
});

test('refresh lock: the heartbeat also renews a held machine parse lock, and notices a takeover', async () => {
	const { lockDir, stable } = setup();
	assert.equal(await stable.acquireRefreshLock(), true);
	assert.equal(await stable.acquireMachineParseLock({ maxWaitMs: 0, pollMs: 1 }), true);
	const machinePath = getMachineParseLockPath(lockDir);
	const before = JSON.parse(fs.readFileSync(machinePath, 'utf-8'));
	stable.noteRefreshProgress();
	await new Promise(r => setTimeout(r, 5));
	await stable.renewRefreshLock();
	const after = JSON.parse(fs.readFileSync(machinePath, 'utf-8'));
	assert.ok(after.progressAt > before.progressAt);

	// Another host judged us stuck and took over: our heartbeat must stop treating it as ours.
	fs.writeFileSync(machinePath, JSON.stringify({ ...after, sessionId: 'desktop-run', host: 'desktop' }));
	await stable.renewRefreshLock();
	await stable.releaseMachineParseLock();
	assert.equal(JSON.parse(fs.readFileSync(machinePath, 'utf-8')).sessionId, 'desktop-run', 'never release the new holder\'s lock');
	await stable.releaseRefreshLock();
});

test('cross-host: an unusable machine lock dir is given up at once with a single warning', async () => {
	const root = makeTmpFixtureDir('ctt-crosshost-');
	const blocker = path.join(root, 'not-a-dir');
	fs.writeFileSync(blocker, 'x');
	const warnings: string[] = [];
	const context: any = { extensionMode: 1, globalStorageUri: { fsPath: path.join(root, 'stable') }, globalState: createMockMemento() };
	const manager = new CacheManager(context, {
		log: () => {}, warn: (m: string) => warnings.push(m), error: () => {}, machineLockDir: path.join(blocker, 'locks'),
	}, 1);
	const started = Date.now();
	await manager.coordinateCrossHostParse(); // real 2-minute wait setting
	assert.ok(Date.now() - started < 5000, `returned in ${Date.now() - started}ms instead of waiting out the 2-minute budget`);
	assert.equal(warnings.filter(w => /Unexpected error acquiring lock/.test(w)).length, 1, 'warned once, not per poll');
	await manager.releaseRefreshLock(); // ends the (non-existent) turn without throwing
});

// --- Two windows of the SAME edition (same globalStorage dir) racing for the refresh lock -------

const MIN = 60 * 1000;

function sameEditionPair() {
	const root = makeTmpFixtureDir('ctt-sameedition-');
	const clock = { now: 1_000_000 };
	const make = (id: string) => new CacheManager(
		{ extensionMode: 1, globalStorageUri: { fsPath: root }, globalState: createMockMemento() } as any,
		{ log: () => {}, warn: () => {}, error: () => {}, lockOwnerId: id, now: () => clock.now },
		1,
	);
	return { clock, window1: make('window-1'), window2: make('window-2') };
}

test('refresh lock: two windows of one edition racing get exactly one leader', async () => {
	for (let round = 0; round < 10; round++) {
		const { window1, window2 } = sameEditionPair();
		const results = await Promise.all([window1.acquireRefreshLock(), window2.acquireRefreshLock()]);
		assert.equal(results.filter(Boolean).length, 1, `round ${round}: one leader`);
		await window1.releaseRefreshLock();
		await window2.releaseRefreshLock();
	}
});

test('refresh lock: a follower does not take over while the leader is in its post-parse save phase', async () => {
	const { clock, window1: leader, window2: follower } = sameEditionPair();
	assert.equal(await leader.acquireRefreshLock(), true);
	leader.noteRefreshProgress(); // last parsed file
	await leader.renewRefreshLock();

	// Stats + publish + snapshot save + checkpoint wait: no per-file progress, 12 minutes in total.
	let finishSave!: () => void;
	const save = leader.whileRefreshBusy(() => new Promise<void>(resolve => { finishSave = resolve; }));
	for (let elapsed = 0; elapsed < 12 * MIN; elapsed += 30 * 1000) {
		clock.now += 30 * 1000;
		assert.equal(await leader.renewRefreshLock(), true, 'leader heartbeat');
		assert.equal(await follower.acquireRefreshLock(), false, `follower must not take over ${elapsed / 1000}s into the save`);
	}
	finishSave();
	await save;
	await leader.releaseRefreshLock();
	assert.equal(await follower.acquireRefreshLock(), true, 'free once the leader released');
	await follower.releaseRefreshLock();
});

test('refresh lock: a leader stuck outside any busy phase is taken over after the stall limit', async () => {
	const { clock, window1: leader, window2: follower } = sameEditionPair();
	assert.equal(await leader.acquireRefreshLock(), true);
	const stuckAt = clock.now;
	// The parse wedges: the heartbeat timer keeps firing, nothing reports progress.
	while (clock.now - stuckAt <= CacheManager.REFRESH_LOCK_STALL_MS) {
		assert.equal(await follower.acquireRefreshLock(), false, 'not before the stall limit');
		clock.now += 30 * 1000;
		await leader.renewRefreshLock();
	}
	assert.equal(await follower.acquireRefreshLock(), true, 'stuck leader taken over');
	assert.equal(await leader.renewRefreshLock(), false, 'old leader learns it lost the lock');
	await leader.releaseRefreshLock(); // owner-only: must not remove the follower's lock
	assert.equal(await leader.acquireRefreshLock(), false);
	await follower.releaseRefreshLock();
});

test('refresh lock: a save that never settles stops counting as progress after the busy budget', async () => {
	const { clock, window1: leader, window2: follower } = sameEditionPair();
	assert.equal(await leader.acquireRefreshLock(), true);
	void leader.whileRefreshBusy(() => new Promise<void>(() => { /* hangs forever */ }));
	const limit = CacheManager.REFRESH_BUSY_PROGRESS_BUDGET_MS + CacheManager.REFRESH_LOCK_STALL_MS;
	const start = clock.now;
	let takenOverAfter: number | undefined;
	while (clock.now - start <= limit + 2 * MIN) {
		clock.now += 30 * 1000;
		await leader.renewRefreshLock();
		if (await follower.acquireRefreshLock()) { takenOverAfter = clock.now - start; break; }
	}
	assert.ok(takenOverAfter !== undefined, 'hung save must not hold the lock forever');
	assert.ok(takenOverAfter > CacheManager.REFRESH_BUSY_PROGRESS_BUDGET_MS, 'not during the budget');
	assert.ok(takenOverAfter <= limit + MIN, `taken over by budget + stall (after ${takenOverAfter / MIN} min)`);
	await follower.releaseRefreshLock();
});

test('refresh lock: a busy phase left open by a throw is closed by the next acquire/release', async () => {
	const { clock, window1: leader, window2: follower } = sameEditionPair();
	assert.equal(await leader.acquireRefreshLock(), true);
	leader.beginRefreshBusy(); // never ended (the stats computation threw)
	await leader.releaseRefreshLock();
	assert.equal(await leader.acquireRefreshLock(), true);
	const start = clock.now;
	while (clock.now - start <= CacheManager.REFRESH_LOCK_STALL_MS) { clock.now += 30 * 1000; await leader.renewRefreshLock(); }
	assert.equal(await follower.acquireRefreshLock(), true, 'the leaked phase no longer keeps a stuck leader alive');
	await follower.releaseRefreshLock();
});
