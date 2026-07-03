import test from 'node:test';
import * as assert from 'node:assert/strict';

import { createWakeupGate, withTimeout } from '../../src/utils/promises';

test('createWakeupGate: signal resolves all currently parked waiters', async () => {
	const gate = createWakeupGate();
	const order: number[] = [];
	const a = gate.wait().then(() => order.push(1));
	const b = gate.wait().then(() => order.push(2));
	gate.signal();
	await Promise.all([a, b]);
	assert.deepEqual(order.sort(), [1, 2]);
});

test('createWakeupGate: signal with no waiters is a no-op and does not affect later waits', async () => {
	const gate = createWakeupGate();
	gate.signal(); // nobody waiting yet
	let resolved = false;
	const p = gate.wait().then(() => { resolved = true; });
	// The earlier signal must NOT satisfy this later wait.
	await new Promise(r => setTimeout(r, 5));
	assert.equal(resolved, false);
	gate.signal();
	await p;
	assert.equal(resolved, true);
});

test('createWakeupGate: a fresh wait after signal stays parked until the next signal', async () => {
	const gate = createWakeupGate();
	const first = gate.wait();
	gate.signal();
	await first;

	let secondResolved = false;
	const second = gate.wait().then(() => { secondResolved = true; });
	await new Promise(r => setTimeout(r, 5));
	assert.equal(secondResolved, false);
	gate.signal();
	await second;
	assert.equal(secondResolved, true);
});

test('createWakeupGate: producer/consumer drains all items without polling', async () => {
	const gate = createWakeupGate();
	const queue: number[] = [];
	let readIndex = 0;
	let done = false;
	const consumed: number[] = [];

	const consumer = (async () => {
		while (true) {
			if (readIndex >= queue.length) {
				if (done) { break; }
				await gate.wait();
				continue;
			}
			consumed.push(queue[readIndex++]);
		}
	})();

	const producer = (async () => {
		for (let i = 0; i < 5; i++) {
			await new Promise(r => setTimeout(r, 1));
			queue.push(i);
			gate.signal();
		}
		done = true;
		gate.signal();
	})();

	await Promise.all([consumer, producer]);
	assert.deepEqual(consumed, [0, 1, 2, 3, 4]);
});

test('withTimeout: resolves when the promise settles in time', async () => {
	const result = await withTimeout(Promise.resolve('ok'), 1000, 'op');
	assert.equal(result, 'ok');
});

test('withTimeout: rejects with a descriptive error when it times out', async () => {
	await assert.rejects(
		withTimeout(new Promise(() => { /* never settles */ }), 10, 'slow op'),
		/slow op timed out after 10ms/,
	);
});
