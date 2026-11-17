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
