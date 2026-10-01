import test from 'node:test';
import * as assert from 'node:assert/strict';
import { EventEmitter } from 'node:events';

import {
	AnalysisWorkerPool,
	AnalysisWorkerError,
	type WorkerLike,
	type AnalysisWorkerPoolOptions,
} from '../../src/analysis/analysisWorkerPool';
import type { AnalysisRequest, AnalysisWorkerMessage } from '../../src/analysis/analysisProtocol';
import type { SessionFileCache } from '../../../src/types';

/** A worker whose behaviour the test drives by hand: no threads, no timing. */
class FakeWorker extends EventEmitter implements WorkerLike {
	readonly received: AnalysisRequest[] = [];
	terminated = false;
	postMessage(message: AnalysisRequest): void { this.received.push(message); }
	terminate(): Promise<number> {
		this.terminated = true;
		// Like a real worker, termination is observable as an exit event.
		queueMicrotask(() => this.emit('exit', 1));
		return Promise.resolve(1);
	}
	private readySent = false;
	/** A real worker announces `ready` once its bundle has initialised; tests that care about startup control it. */
	announceReady(): void {
		if (this.readySent) { return; }
		this.readySent = true;
		this.emit('message', { type: 'ready' });
	}
	reply(message: AnalysisWorkerMessage): void { this.announceReady(); this.emit('message', message); }
	crash(message = 'boom'): void { this.announceReady(); this.emit('error', new Error(message)); this.emit('exit', 1); }
	/** The bundle failed while loading: the worker dies without ever saying `ready`. */
	crashBeforeReady(message = 'failed to load'): void { this.readySent = true; this.emit('error', new Error(message)); this.emit('exit', 1); }
	// `on` is inherited from EventEmitter; the overloads in WorkerLike are structurally satisfied.
}

const entry = (tokens: number): SessionFileCache => ({ tokens, interactions: 1, modelUsage: {}, mtime: 1, size: 1 });
const tick = (): Promise<void> => new Promise((resolve) => setImmediate(resolve));

function makePool(overrides: Partial<AnalysisWorkerPoolOptions> = {}) {
	const workers: FakeWorker[] = [];
	const warnings: string[] = [];
	const pool = new AnalysisWorkerPool({
		workerPath: 'unused',
		extensionPath: 'unused',
		size: 2,
		log: () => undefined,
		warn: (m) => warnings.push(m),
		createWorker: () => { const w = new FakeWorker(); workers.push(w); return w; },
		...overrides,
	});
	return { pool, workers, warnings };
}

test('resolves an analyze request with the worker result', async () => {
	const { pool, workers } = makePool();
	const promise = pool.analyze('a.json', 10, 20, 'owner/repo');
	assert.equal(workers.length, 1);
	assert.deepEqual(workers[0].received[0], { id: 1, op: 'analyze', path: 'a.json', mtime: 10, size: 20, existingRepository: 'owner/repo' });
	workers[0].reply({ type: 'result', id: 1, ok: true, result: entry(42) });
	assert.equal((await promise).tokens, 42);
	await pool.dispose();
});

test('a worker-reported error rejects as failed and keeps the Node error code', async () => {
	const { pool, workers } = makePool();
	const promise = pool.analyze('gone.json', 1, 1);
	workers[0].reply({ type: 'result', id: 1, ok: false, error: 'Error: ENOENT', code: 'ENOENT' });
	await assert.rejects(promise, (e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'failed' && e.code === 'ENOENT');
	assert.equal(pool.isAvailable(), true, 'an analysis error says nothing about worker health');
	await pool.dispose();
});

test('supplement resolves null when the session has no usable debug log', async () => {
	const { pool, workers } = makePool();
	const promise = pool.supplement(entry(1), 'a.json');
	workers[0].reply({ type: 'result', id: 1, ok: true, result: null });
	assert.equal(await promise, null);
	await pool.dispose();
});

test('spreads concurrent requests across workers up to the pool size, then reuses the least loaded', async () => {
	const { pool, workers } = makePool({ size: 2 });
	const a = pool.analyze('a', 1, 1);
	const b = pool.analyze('b', 1, 1);
	const c = pool.analyze('c', 1, 1);
	assert.equal(workers.length, 2, 'a second worker is started when the first is busy');
	assert.equal(workers[0].received.length + workers[1].received.length, 3);
	for (const w of workers) { for (const r of w.received) { w.reply({ type: 'result', id: r.id, ok: true, result: entry(r.id) }); } }
	await Promise.all([a, b, c]);
	assert.equal(workers.length, 2, 'never grows past size');
	await pool.dispose();
});

test('when a worker dies mid-request the request is retried once on a fresh worker', async () => {
	const { pool, workers } = makePool({ size: 1 });
	const promise = pool.analyze('a.json', 1, 1);
	workers[0].crash();
	await tick();
	assert.equal(workers.length, 2, 'replacement worker spawned');
	assert.equal(workers[1].received.length, 1);
	workers[1].reply({ type: 'result', id: workers[1].received[0].id, ok: true, result: entry(7) });
	assert.equal((await promise).tokens, 7);
	await pool.dispose();
});

test('a request that kills two workers is rejected as failed, not unavailable, so it is never retried on the host', async () => {
	const { pool, workers } = makePool({ size: 1, maxRestarts: 50 });
	const promise = pool.analyze('a.json', 1, 1);
	workers[0].crash();
	await tick();
	workers[1].crash();
	await assert.rejects(promise, (e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'failed');
	await pool.dispose();
});

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

test('a hung analysis times out, its worker is killed, and innocent neighbours are retried', async () => {
	const { pool, workers } = makePool({ size: 1, requestTimeoutMs: 400 });
	const hung = pool.analyze('hung.json', 1, 1);
	workers[0].announceReady(); // a genuinely hung worker got past startup
	const hungOutcome = hung.then(() => 'resolved', (e: unknown) => (e instanceof AnalysisWorkerError ? e.kind : 'other'));
	// A second request joins the same worker later, so its own clock has not run out when the
	// first one's does — it must survive the kill of its neighbour.
	await sleep(200);
	const neighbour = pool.analyze('ok.json', 1, 1);
	assert.equal(await hungOutcome, 'timeout');
	assert.equal(workers[0].terminated, true);
	await tick();
	const retried = workers[workers.length - 1];
	const retriedRequest = retried.received.find((r) => 'path' in r && r.path === 'ok.json');
	assert.ok(retriedRequest, 'the neighbouring request is re-sent to a fresh worker');
	retried.reply({ type: 'result', id: retriedRequest.id, ok: true, result: entry(5) });
	assert.equal((await neighbour).tokens, 5);
	await pool.dispose();
});

test('a request queued behind a slow neighbour gets its hang clock when the neighbour finishes', async () => {
	// B is posted while A is still being parsed. A finishes at ~180ms, which is when B actually starts. B's
	// original deadline (100 + 200 = 300ms) passes while it is mid-parse; it must not be killed for that.
	const { pool, workers } = makePool({ size: 1, requestTimeoutMs: 200 });
	const a = pool.analyze('a', 1, 1);
	await sleep(100);
	const b = pool.analyze('b', 1, 1);
	await sleep(80);
	workers[0].reply({ type: 'result', id: workers[0].received[0].id, ok: true, result: entry(1) });
	await a;
	await sleep(150); // t≈330: past B's original deadline, inside the fresh window that started at A's completion
	assert.equal(workers[0].terminated, false, 'B had only been running for ~150ms; it must not be killed');
	workers[0].reply({ type: 'result', id: workers[0].received[1].id, ok: true, result: entry(2) });
	assert.equal((await b).tokens, 2);
	await pool.dispose();
});

test('a neighbour that already survived one worker death is not blamed when another request is what hangs the replacement', async () => {
	// A crash re-sends both A and B (retries = 1 each). A then hangs the replacement worker and times out.
	// B is innocent: it must be re-sent again rather than dropped as a repeat offender.
	const { pool, workers } = makePool({ size: 1, requestTimeoutMs: 250, maxRestarts: 50 });
	const a = pool.analyze('a', 1, 1);
	const aOutcome = a.then(() => 'resolved', (e: unknown) => (e instanceof AnalysisWorkerError ? e.kind : 'other'));
	const b = pool.analyze('b', 1, 1);
	workers[0].crash();
	await tick();
	assert.equal(workers.length, 2, 'both requests were re-sent to a replacement worker');
	workers[1].announceReady(); // started fine, then A hangs it
	assert.equal(await aOutcome, 'timeout');
	await tick();
	assert.equal(workers.length, 3, 'B is re-sent to a third worker instead of being failed');
	const reSent = workers[2].received.find((r) => 'path' in r && r.path === 'b');
	assert.ok(reSent, 'B reached the third worker');
	workers[2].reply({ type: 'result', id: reSent.id, ok: true, result: entry(9) });
	assert.equal((await b).tokens, 9);
	await pool.dispose();
});

test('a worker that dies before it is ready (broken bundle) sends the request to the in-process path, not to a retry', async () => {
	const { pool, workers } = makePool({ size: 1 });
	const promise = pool.analyze('a.json', 1, 1);
	workers[0].crashBeforeReady();
	await assert.rejects(promise, (e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'unavailable');
	assert.equal(workers.length, 1, 'a worker that cannot load is not respawned for the same request');
	await pool.dispose();
});

test('when only the pool-wide restart budget runs out, the request that happened to be there is unavailable, not failed', async () => {
	const { pool, workers } = makePool({ size: 1, maxRestarts: 0 });
	const promise = pool.analyze('a.json', 1, 1);
	workers[0].crash();
	await assert.rejects(promise, (e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'unavailable');
	assert.equal(pool.isAvailable(), false);
	await pool.dispose();
});

test('a younger request finishing first does not restart the hang clock of the oldest', async () => {
	// Inside a worker requests overlap, so B can finish while A is still running. A's clock must keep
	// counting from when it started, or a hung A would be kept alive by a stream of fast neighbours.
	const { pool, workers } = makePool({ size: 1, requestTimeoutMs: 300 });
	const a = pool.analyze('a', 1, 1);
	const aOutcome = a.then(() => 'resolved', (e: unknown) => (e instanceof AnalysisWorkerError ? e.kind : 'other'));
	const b = pool.analyze('b', 1, 1);
	await sleep(200);
	workers[0].reply({ type: 'result', id: workers[0].received[1].id, ok: true, result: entry(2) });
	await b;
	await sleep(250); // t≈450: past A's original deadline (300) but before a restarted one (500)
	assert.equal(workers[0].terminated, true, 'A was never answered; its original deadline must still kill the worker');
	assert.equal(await aOutcome, 'timeout');
	await pool.dispose();
});

test('only a small window of requests is in flight per worker; the rest wait in the pool', async () => {
	const { pool, workers } = makePool({ size: 1 });
	const results = [1, 2, 3, 4, 5].map((n) => pool.analyze(`f${n}`, 1, 1));
	assert.equal(workers.length, 1);
	assert.equal(workers[0].received.length, 2, 'a thread that can only parse serially is not handed the whole backlog');
	workers[0].reply({ type: 'result', id: workers[0].received[0].id, ok: true, result: entry(1) });
	assert.equal(workers[0].received.length, 3, 'a completion immediately admits the next request');
	for (let i = 1; i < 5; i++) {
		workers[0].reply({ type: 'result', id: workers[0].received[i].id, ok: true, result: entry(i + 1) });
	}
	assert.deepEqual((await Promise.all(results)).map((r) => r.tokens), [1, 2, 3, 4, 5]);
	await pool.dispose();
});

test('a request that waits in the queue is not timed out for waiting', async () => {
	// Timeout is 600ms and the queued request is answered ~750ms after submission — but it only reached
	// the worker at ~300ms, so it has been "in flight" for ~450ms and must still succeed.
	const { pool, workers } = makePool({ size: 1, requestTimeoutMs: 600 });
	const a = pool.analyze('a', 1, 1);
	const b = pool.analyze('b', 1, 1);
	const queued = pool.analyze('c', 1, 1);
	await sleep(300);
	workers[0].reply({ type: 'result', id: workers[0].received[0].id, ok: true, result: entry(1) });
	workers[0].reply({ type: 'result', id: workers[0].received[1].id, ok: true, result: entry(2) });
	assert.equal(workers[0].received.length, 3, 'the queued request is dispatched once capacity frees');
	await sleep(450);
	workers[0].reply({ type: 'result', id: workers[0].received[2].id, ok: true, result: entry(3) });
	assert.equal((await queued).tokens, 3);
	await Promise.all([a, b]);
	assert.equal(workers[0].terminated, false, 'a healthy, merely busy worker is never killed');
	await pool.dispose();
});

test('gives up for the session once workers keep dying, and says so', async () => {
	const { pool, workers, warnings } = makePool({ size: 1, maxRestarts: 2 });
	const outcomes: string[] = [];
	for (let i = 0; i < 4 && pool.isAvailable(); i++) {
		const p = pool.analyze(`f${i}`, 1, 1).catch((e: unknown) => { outcomes.push(e instanceof AnalysisWorkerError ? e.kind : 'other'); });
		workers[workers.length - 1].crash();
		await tick();
		if (workers.length > 0 && pool.isAvailable()) { workers[workers.length - 1].crash(); }
		await p;
	}
	assert.equal(pool.isAvailable(), false);
	assert.ok(warnings.some((w) => /falling back to in-process/i.test(w)));
	await assert.rejects(pool.analyze('late', 1, 1), (e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'unavailable');
	await pool.dispose();
});

test('a worker that cannot be started surfaces as unavailable, not as a thrown host error', async () => {
	const { pool } = makePool({ createWorker: () => { throw new Error('spawn failed'); } });
	await assert.rejects(pool.analyze('a', 1, 1), (e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'unavailable' && /spawn failed/.test(e.message));
	await pool.dispose();
});

test('dispose rejects in-flight work, terminates workers, and refuses new requests', async () => {
	const { pool, workers } = makePool();
	const inFlight = pool.analyze('a', 1, 1);
	const outcome = inFlight.then(() => 'resolved', (e: unknown) => (e instanceof AnalysisWorkerError ? e.kind : 'other'));
	await pool.dispose();
	assert.equal(await outcome, 'unavailable');
	assert.ok(workers.every((w) => w.terminated));
	assert.equal(pool.isAvailable(), false);
	await assert.rejects(pool.analyze('b', 1, 1), (e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'unavailable');
	await pool.dispose(); // idempotent
});

test('worker warnings are forwarded to the host log', async () => {
	const { pool, workers, warnings } = makePool();
	const p = pool.analyze('a', 1, 1);
	workers[0].reply({ type: 'warn', message: 'adapter hiccup' });
	workers[0].reply({ type: 'result', id: 1, ok: true, result: entry(1) });
	await p;
	assert.ok(warnings.includes('adapter hiccup'));
	await pool.dispose();
});
