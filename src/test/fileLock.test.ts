import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
	acquireFileLock,
	DEFAULT_LOCK_STALE_MS,
	evaluateLock,
	type LockOwner,
	type LockRecord,
	readFileLock,
	releaseFileLock,
	renewFileLock,
	tryAcquireFileLock,
} from '../fileLock';
import {
	beginMachineParse,
	getMachineLockDir,
	getMachineParseLockPath,
	listPeerSnapshots,
	PARSE_LOCK_STALL_MS,
	publishPeerSnapshot,
	waitForFileLock,
} from '../machineParseLock';

function tmpDir(): string {
	return fs.mkdtempSync(path.join(os.tmpdir(), 'fluency-lock-'));
}

function cleanup(dir: string): void {
	fs.rmSync(dir, { recursive: true, force: true });
}

const alive = () => true;
const vscodeStable: LockOwner = { id: 'stable-window', pid: 1001, host: 'vscode-stable' };
const vscodeInsiders: LockOwner = { id: 'insiders-window', pid: 1002, host: 'vscode-insiders' };
const desktop: LockOwner = { id: 'desktop-run', pid: 1003, host: 'desktop' };

/**
 * Read the lock as a test oracle. Renew replaces the file by rename, which on Windows can briefly
 * refuse a concurrent open (EPERM/EBUSY) while a heartbeat timer is running, so retry those.
 */
function readRecord(lockPath: string): LockRecord {
	for (let attempt = 1; ; attempt++) {
		try {
			return JSON.parse(fs.readFileSync(lockPath, 'utf-8'));
		} catch (err: unknown) {
			const code = (err as NodeJS.ErrnoException)?.code;
			if ((code !== 'EPERM' && code !== 'EBUSY') || attempt >= 20) { throw err; }
		}
	}
}

test('acquire: creates the lock with the owner identity, legacy field names and progress fields', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'nested', 'a.lock');
		assert.equal(await acquireFileLock(lockPath, vscodeStable, { now: () => 5000, stallMs: 60_000, maxHoldMs: 600_000 }), true);
		const record = readRecord(lockPath);
		assert.equal(record.sessionId, 'stable-window');
		assert.equal(record.pid, 1001);
		assert.equal(record.host, 'vscode-stable');
		assert.equal(record.timestamp, 5000);
		assert.equal(record.acquiredAt, 5000);
		assert.equal(record.progressAt, 5000);
		assert.equal(record.stallMs, 60_000);
		assert.equal(record.maxHoldMs, 600_000);
	} finally { cleanup(dir); }
});

test('acquire: a live, fresh holder keeps the lock', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		assert.equal(await acquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive }), true);
		assert.equal(await acquireFileLock(lockPath, vscodeInsiders, { isOwnerAlive: alive }), false);
		assert.equal(readRecord(lockPath).sessionId, 'stable-window');
	} finally { cleanup(dir); }
});

test('acquire: breaks a lock whose heartbeat is older than staleMs', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		let now = 0;
		assert.equal(await acquireFileLock(lockPath, vscodeStable, { now: () => now, isOwnerAlive: alive }), true);
		now = 5 * 60 * 1000; // exactly at the threshold: still live
		assert.equal(await acquireFileLock(lockPath, vscodeInsiders, { now: () => now, isOwnerAlive: alive }), false);
		now += 1;
		const logs: string[] = [];
		assert.equal(await acquireFileLock(lockPath, vscodeInsiders, { now: () => now, isOwnerAlive: alive, log: m => logs.push(m) }), true);
		assert.equal(readRecord(lockPath).sessionId, 'insiders-window');
		assert.match(logs.join('\n'), /heartbeat stale.*vscode-stable/);
	} finally { cleanup(dir); }
});

test('acquire: breaks a fresh lock whose owner pid is dead', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		fs.writeFileSync(lockPath, JSON.stringify({ sessionId: 'crashed', pid: 4242, timestamp: Date.now() }));
		const isOwnerAlive = (pid: unknown) => pid !== 4242;
		assert.equal(await acquireFileLock(lockPath, desktop, { isOwnerAlive }), true);
		assert.equal(readRecord(lockPath).sessionId, 'desktop-run');
	} finally { cleanup(dir); }
});

test('acquire: the default liveness probe treats a pid that does not exist as dead', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		// pids are far below 2^31-1 on every supported OS; process.kill(…, 0) reports ESRCH.
		fs.writeFileSync(lockPath, JSON.stringify({ sessionId: 'ghost', pid: 2147483646, timestamp: Date.now() }));
		assert.equal(await acquireFileLock(lockPath, desktop), true);
	} finally { cleanup(dir); }
});

test('acquire: the default liveness probe keeps a lock held by this very process', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		fs.writeFileSync(lockPath, JSON.stringify({ sessionId: 'sibling', pid: process.pid, timestamp: Date.now() }));
		assert.equal(await acquireFileLock(lockPath, desktop), false);
	} finally { cleanup(dir); }
});

for (const [label, content] of [['empty', ''], ['truncated JSON', '{"sessionId":"x","pi'], ['no timestamp', '{"sessionId":"x","pid":1}'], ['JSON null', 'null']] as const) {
	test(`acquire: breaks a corrupt lock (${label})`, async () => {
		const dir = tmpDir();
		try {
			const lockPath = path.join(dir, 'a.lock');
			fs.writeFileSync(lockPath, content);
			assert.equal(await readFileLock(lockPath), null, 'corrupt content reads as null, not missing');
			assert.equal(await acquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive }), true);
			assert.equal(readRecord(lockPath).sessionId, 'stable-window');
		} finally { cleanup(dir); }
	});
}

test('hung leader: alive and heartbeating but no progress past stallMs is taken over', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		let now = 0;
		const opts = { now: () => now, isOwnerAlive: alive, stallMs: 3 * 60 * 1000 };
		assert.equal(await acquireFileLock(lockPath, vscodeStable, opts), true);

		// The leader keeps heartbeating every 30s while making progress: never taken over.
		for (let i = 0; i < 10; i++) {
			now += 30_000;
			assert.equal(await renewFileLock(lockPath, vscodeStable, { progress: true }, { now: () => now }), true);
			assert.equal(await acquireFileLock(lockPath, vscodeInsiders, opts), false, 'progressing leader must keep the lock');
		}
		// Then the parse wedges: the heartbeat timer still fires, but reports no progress.
		const wedgedAt = now;
		while (now - wedgedAt <= 3 * 60 * 1000) {
			assert.equal(await acquireFileLock(lockPath, vscodeInsiders, opts), false, 'not yet past the stall deadline');
			now += 30_000;
			assert.equal(await renewFileLock(lockPath, vscodeStable, {}, { now: () => now }), true);
		}
		assert.equal(evaluateLock(await readFileLock(lockPath) as LockRecord, { now: () => now, isOwnerAlive: alive }), 'stalled');
		assert.equal(await acquireFileLock(lockPath, vscodeInsiders, opts), true, 'stuck leader is taken over');

		// The old leader notices on its next beat and can never touch the new holder's lock.
		assert.equal(await renewFileLock(lockPath, vscodeStable, { progress: true }, { now: () => now }), false);
		await releaseFileLock(lockPath, vscodeStable);
		assert.equal(readRecord(lockPath).sessionId, 'insiders-window');
	} finally { cleanup(dir); }
});

test('hung leader: the holder-declared stallMs applies even when the contender passes none', async () => {
	const record: LockRecord = { sessionId: 'x', pid: 1, timestamp: 1_000_000, acquiredAt: 0, progressAt: 0, stallMs: 1000 };
	assert.equal(evaluateLock(record, { now: () => 1_000_001, isOwnerAlive: alive }), 'stalled');
	// A legacy record (no stallMs) is only judged by liveness and heartbeat age.
	assert.equal(evaluateLock({ sessionId: 'x', pid: 1, timestamp: 1_000_000 }, { now: () => 1_000_001, isOwnerAlive: alive }), undefined);
});

test('max hold: a progressing holder is still taken over after its declared maxHoldMs', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		let now = 0;
		const opts = { now: () => now, isOwnerAlive: alive, maxHoldMs: 10 * 60 * 1000 };
		assert.equal(await acquireFileLock(lockPath, desktop, opts), true);
		for (; now < 10 * 60 * 1000; now += 30_000) {
			assert.equal(await renewFileLock(lockPath, desktop, { progress: true }, { now: () => now }), true);
		}
		assert.equal(await acquireFileLock(lockPath, vscodeStable, opts), false, 'at the cap: still held');
		now += 30_000;
		await renewFileLock(lockPath, desktop, { progress: true }, { now: () => now });
		assert.equal(await acquireFileLock(lockPath, vscodeStable, opts), true, 'past the cap: taken over');
	} finally { cleanup(dir); }
});

test('renew: preserves acquiredAt and metadata, and only stamps progressAt when asked', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		await acquireFileLock(lockPath, vscodeStable, { now: () => 100, meta: { snapshot: 'x' }, stallMs: 50 });
		await renewFileLock(lockPath, vscodeStable, {}, { now: () => 200 });
		let record = readRecord(lockPath);
		assert.deepEqual([record.acquiredAt, record.progressAt, record.timestamp], [100, 100, 200]);
		assert.deepEqual(record.meta, { snapshot: 'x' });
		assert.equal(record.stallMs, 50);
		await renewFileLock(lockPath, vscodeStable, { progress: true }, { now: () => 300 });
		record = readRecord(lockPath);
		assert.deepEqual([record.acquiredAt, record.progressAt, record.timestamp], [100, 300, 300]);
	} finally { cleanup(dir); }
});

test('renew: a concurrent reader never sees a partial or empty lock', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		// Large metadata widens the window an in-place truncate-then-write would expose.
		const meta = { padding: 'x'.repeat(16 * 1024) };
		assert.equal(await acquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive, meta }), true);

		let renewing = true;
		let renews = 0;
		const writer = (async () => {
			for (let i = 0; i < 50; i++) {
				assert.equal(await renewFileLock(lockPath, vscodeStable, { progress: i % 2 === 0 }), true, `renew ${i} keeps the lock`);
				renews++;
			}
			renewing = false;
		})();

		let reads = 0;
		const corrupt: string[] = [];
		const reader = async () => {
			while (renewing) {
				const record = await readFileLock(lockPath);
				// `undefined` (open refused mid-rename on Windows) reads as "released", which the
				// acquire path answers with a `wx` create that fails EEXIST: harmless. `null` is the
				// "corrupt" verdict that lets a peer break a live lock, and must never happen.
				if (record === null) { corrupt.push('readFileLock returned null'); }
				else if (record && record.sessionId !== 'stable-window') { corrupt.push(`unexpected owner ${String(record.sessionId)}`); }
				reads++;
			}
		};
		await Promise.all([writer, reader(), reader()]);

		assert.equal(renews, 50);
		assert.ok(reads > 0, 'the readers actually ran');
		assert.deepEqual(corrupt, []);
		assert.equal(readRecord(lockPath).sessionId, 'stable-window');
		assert.deepEqual(fs.readdirSync(dir), ['a.lock'], 'no temp files left behind');
	} finally { cleanup(dir); }
});

test('renew/release: owner-only, and harmless on a missing lock', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		assert.equal(await renewFileLock(lockPath, vscodeStable), false, 'nothing to renew');
		await releaseFileLock(lockPath, vscodeStable); // no throw
		await acquireFileLock(lockPath, vscodeStable);
		const before = fs.readFileSync(lockPath, 'utf-8');
		assert.equal(await renewFileLock(lockPath, desktop), false);
		await releaseFileLock(lockPath, desktop);
		assert.equal(fs.readFileSync(lockPath, 'utf-8'), before, 'a non-owner must neither rewrite nor delete the lock');
		await releaseFileLock(lockPath, vscodeStable);
		assert.equal(fs.existsSync(lockPath), false);
	} finally { cleanup(dir); }
});

test('two hosts racing: exactly one wins a free lock', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'race.lock');
		for (let round = 0; round < 20; round++) {
			const results = await Promise.all([vscodeStable, vscodeInsiders, desktop].map(o => acquireFileLock(lockPath, o, { isOwnerAlive: alive })));
			assert.equal(results.filter(Boolean).length, 1, `round ${round}: one winner`);
			const winner = [vscodeStable, vscodeInsiders, desktop][results.indexOf(true)];
			assert.equal(readRecord(lockPath).sessionId, winner.id);
			await releaseFileLock(lockPath, winner);
		}
	} finally { cleanup(dir); }
});

test('two hosts racing: exactly one wins when both break the same stale lock', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'race.lock');
		for (let round = 0; round < 20; round++) {
			fs.writeFileSync(lockPath, JSON.stringify({ sessionId: 'dead', pid: 9, timestamp: 0 }));
			const isOwnerAlive = (pid: unknown) => pid !== 9;
			const results = await Promise.all([vscodeStable, vscodeInsiders].map(o => acquireFileLock(lockPath, o, { isOwnerAlive })));
			assert.equal(results.filter(Boolean).length, 1, `round ${round}: exactly one winner`);
			assert.equal(fs.existsSync(lockPath + '.break'), false, 'break mutex cleaned up');
			const holder = readRecord(lockPath).sessionId;
			if (results[0]) { assert.equal(holder, vscodeStable.id); }
			if (results[1]) { assert.equal(holder, vscodeInsiders.id); }
			await releaseFileLock(lockPath, vscodeStable);
			await releaseFileLock(lockPath, vscodeInsiders);
		}
	} finally { cleanup(dir); }
});

test('waitForFileLock: waits for the holder to release, then acquires', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		await acquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive });
		let now = 0;
		let polls = 0;
		const result = await waitForFileLock(lockPath, desktop, {
			maxWaitMs: 60_000,
			pollMs: 2000,
			isOwnerAlive: alive,
			now: () => now,
			sleep: async (ms) => { now += ms; if (++polls === 3) { await releaseFileLock(lockPath, vscodeStable); } },
			onWait: (holder) => assert.equal(holder?.host, 'vscode-stable'),
		});
		assert.equal(result.acquired, true);
		assert.equal(result.waitedMs, 6000);
		assert.equal(readRecord(lockPath).sessionId, 'desktop-run');
	} finally { cleanup(dir); }
});

test('waitForFileLock: gives up at maxWaitMs while a live holder progresses', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		let now = 0;
		await acquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive, now: () => now, stallMs: PARSE_LOCK_STALL_MS });
		const result = await waitForFileLock(lockPath, desktop, {
			maxWaitMs: 10_000,
			pollMs: 3000,
			isOwnerAlive: alive,
			now: () => now,
			sleep: async (ms) => { now += ms; await renewFileLock(lockPath, vscodeStable, { progress: true }, { now: () => now }); },
		});
		assert.equal(result.acquired, false);
		assert.equal(result.waitedMs, 10_000);
		assert.equal(readRecord(lockPath).sessionId, 'stable-window');
	} finally { cleanup(dir); }
});

test('waitForFileLock: takes over a hung holder mid-wait instead of waiting out the deadline', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		let now = 0;
		await acquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive, now: () => now, stallMs: 60_000 });
		const result = await waitForFileLock(lockPath, vscodeInsiders, {
			maxWaitMs: 10 * 60_000,
			pollMs: 5000,
			isOwnerAlive: alive,
			now: () => now,
			// Holder heartbeats without progress: alive but stuck.
			sleep: async (ms) => { now += ms; await renewFileLock(lockPath, vscodeStable, {}, { now: () => now }); },
		});
		assert.equal(result.acquired, true);
		assert.ok(result.waitedMs > 60_000 && result.waitedMs <= 70_000, `took over just past the stall deadline (waited ${result.waitedMs}ms)`);
	} finally { cleanup(dir); }
});

test('beginMachineParse: heartbeat records progress only when reported, end() releases', async () => {
	const dir = tmpDir();
	try {
		let now = 1000;
		const turn = await beginMachineParse(desktop, { lockDir: dir, heartbeatMs: 10, now: () => now, isOwnerAlive: alive });
		assert.equal(turn.acquired, true);
		const lockPath = getMachineParseLockPath(dir);
		assert.equal(readRecord(lockPath).stallMs, PARSE_LOCK_STALL_MS);

		now = 2000;
		await new Promise(r => setTimeout(r, 40));
		let record = readRecord(lockPath);
		assert.equal(record.timestamp, 2000, 'heartbeat renews the timestamp');
		assert.equal(record.progressAt, 1000, 'no progress reported, so progressAt is unchanged');

		turn.noteProgress();
		now = 3000;
		await new Promise(r => setTimeout(r, 40));
		record = readRecord(lockPath);
		assert.equal(record.progressAt, 3000, 'reported progress reaches the lock on the next beat');

		await turn.end();
		await turn.end(); // idempotent
		assert.equal(fs.existsSync(lockPath), false);
	} finally { cleanup(dir); }
});

test('beginMachineParse: a second host waits for the first host\'s turn', async () => {
	const dir = tmpDir();
	try {
		const first = await beginMachineParse(vscodeStable, { lockDir: dir, isOwnerAlive: alive });
		let released = false;
		const second = beginMachineParse(desktop, {
			lockDir: dir, isOwnerAlive: alive, pollMs: 5, maxWaitMs: 5000,
			sleep: async (ms) => { await new Promise(r => setTimeout(r, ms)); if (!released) { released = true; await first.end(); } },
		});
		const turn = await second;
		assert.equal(turn.acquired, true);
		assert.ok(turn.waitedMs >= 0);
		assert.equal(readRecord(getMachineParseLockPath(dir)).sessionId, 'desktop-run');
		await turn.end();
	} finally { cleanup(dir); }
});

test('beginMachineParse: gives up without the lock, and end() then leaves the holder alone', async () => {
	const dir = tmpDir();
	try {
		const lockPath = getMachineParseLockPath(dir);
		await acquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive });
		const turn = await beginMachineParse(desktop, { lockDir: dir, isOwnerAlive: alive, maxWaitMs: 20, pollMs: 5 });
		assert.equal(turn.acquired, false);
		turn.noteProgress();
		await turn.end();
		assert.equal(readRecord(lockPath).sessionId, 'stable-window');
	} finally { cleanup(dir); }
});

test('getMachineLockDir: lives under ~/.copilot-token-tracker/locks', () => {
	assert.equal(getMachineLockDir(path.join('h', 'user')), path.join('h', 'user', '.copilot-token-tracker', 'locks'));
});

test('peer snapshots: only exact-format peers with an existing snapshot are listed, never self', async () => {
	const dir = tmpDir();
	try {
		const snapA = path.join(dir, 'a.snapshot.json');
		const snapB = path.join(dir, 'b.snapshot.json');
		fs.writeFileSync(snapA, '{}');
		fs.writeFileSync(snapB, '{}');
		const fmt = 'vscode-session-cache/schema1/cache9/prod';
		await publishPeerSnapshot(dir, { hostId: 'vscode-Visual Studio Code-prod', snapshotPath: snapA, format: fmt, updatedAt: 1 });
		await publishPeerSnapshot(dir, { hostId: 'vscode-Visual Studio Code - Insiders-prod', snapshotPath: snapB, format: fmt, updatedAt: 2 });
		await publishPeerSnapshot(dir, { hostId: 'vscode-old-build-prod', snapshotPath: snapB, format: 'vscode-session-cache/schema1/cache8/prod', updatedAt: 3 });
		await publishPeerSnapshot(dir, { hostId: 'vscode-gone-prod', snapshotPath: path.join(dir, 'missing.json'), format: fmt, updatedAt: 4 });
		fs.writeFileSync(path.join(dir, 'peer-garbage.json'), 'not json');

		const fromStable = await listPeerSnapshots(dir, fmt, 'vscode-Visual Studio Code-prod');
		assert.deepEqual(fromStable.map(p => p.snapshotPath), [snapB]);
		const fromInsiders = await listPeerSnapshots(dir, fmt, 'vscode-Visual Studio Code - Insiders-prod');
		assert.deepEqual(fromInsiders.map(p => p.snapshotPath), [snapA]);
		assert.deepEqual(await listPeerSnapshots(path.join(dir, 'nope'), fmt, 'x'), [], 'missing lock dir is empty, not an error');
		assert.equal(fs.readdirSync(dir).some(n => n.endsWith('.tmp')), false, 'atomic publish leaves no temp files');
	} finally { cleanup(dir); }
});

// Keep the exported default in sync with the documented 5-minute contract.
test('default stale threshold is 5 minutes', () => {
	assert.equal(DEFAULT_LOCK_STALE_MS, 5 * 60 * 1000);
});

// --- Unusable lock directory: give up at once, warn once -------------------------------------

/** A lock dir that can never be created: a path under a regular file (ENOTDIR on every OS). */
function unusableLockDir(root: string): string {
	const file = path.join(root, 'not-a-dir');
	fs.writeFileSync(file, 'x');
	return path.join(file, 'locks');
}

test('tryAcquireFileLock: reports unavailable (not held) when the lock dir cannot be created', async () => {
	const dir = tmpDir();
	try {
		const warnings: string[] = [];
		const lockPath = path.join(unusableLockDir(dir), 'a.lock');
		assert.equal(await tryAcquireFileLock(lockPath, desktop, { warn: m => warnings.push(m) }), 'unavailable');
		assert.equal(warnings.length, 1);
		assert.match(warnings[0], /Unexpected error acquiring lock a\.lock/);
		assert.equal(await acquireFileLock(lockPath, desktop, { warn: () => {} }), false);
	} finally { cleanup(dir); }
});

test('tryAcquireFileLock: reports held (retryable) for a live holder', async () => {
	const dir = tmpDir();
	try {
		const lockPath = path.join(dir, 'a.lock');
		assert.equal(await tryAcquireFileLock(lockPath, vscodeStable, { isOwnerAlive: alive }), 'acquired');
		assert.equal(await tryAcquireFileLock(lockPath, desktop, { isOwnerAlive: alive }), 'held');
	} finally { cleanup(dir); }
});

test('waitForFileLock: an unusable lock dir returns at once, without polling, after one warning', async () => {
	const dir = tmpDir();
	try {
		const warnings: string[] = [];
		let slept = 0;
		const started = Date.now();
		const result = await waitForFileLock(path.join(unusableLockDir(dir), 'a.lock'), desktop, {
			maxWaitMs: 120_000,
			pollMs: 200,
			warn: m => warnings.push(m),
			sleep: async () => { slept++; },
			onWait: () => assert.fail('must not wait on an unusable lock'),
		});
		assert.equal(result.acquired, false);
		assert.equal(result.unavailable, true);
		assert.equal(slept, 0, 'no poll');
		assert.ok(Date.now() - started < 2000, 'returns immediately');
		assert.equal(warnings.length, 1, 'warned once, not per poll');
	} finally { cleanup(dir); }
});

test('beginMachineParse: an unusable lock dir returns at once and logs one warning', async () => {
	const dir = tmpDir();
	try {
		const logs: string[] = [];
		const started = Date.now();
		const turn = await beginMachineParse(desktop, { lockDir: unusableLockDir(dir), maxWaitMs: 120_000, pollMs: 200, log: m => logs.push(m) });
		assert.equal(turn.acquired, false);
		assert.equal(turn.unavailable, true);
		assert.ok(Date.now() - started < 2000, 'returns immediately');
		assert.equal(logs.filter(l => /Unexpected error acquiring lock/.test(l)).length, 1, 'one warning');
		turn.noteProgress();
		await turn.end();
	} finally { cleanup(dir); }
});
