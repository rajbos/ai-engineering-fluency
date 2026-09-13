import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

import {
	chainBuild,
	isComputedStatsCurrent,
	makePanelBoundSink,
	type PostablePanel,
} from '../../src/extension';

// ---------------------------------------------------------------------------
// isComputedStatsCurrent — the guard that keeps a pre-clear build's result from
// being read back as current after clearCache() has bumped the generation.
// ---------------------------------------------------------------------------

test('isComputedStatsCurrent: an unstamped cache is never current', () => {
	assert.equal(isComputedStatsCurrent(undefined, 0), false);
	assert.equal(isComputedStatsCurrent(undefined, 7), false);
});

test('isComputedStatsCurrent: a cache stamped at the live generation is current', () => {
	assert.equal(isComputedStatsCurrent(0, 0), true);
	assert.equal(isComputedStatsCurrent(7, 7), true);
});

test('isComputedStatsCurrent: any generation move invalidates the stamp', () => {
	assert.equal(isComputedStatsCurrent(0, 1), false, 'a clear after the stamp');
	// Defensive: the caches are stamped, not compared by ordering, so a stamp that somehow
	// runs ahead of the live generation is rejected too rather than treated as "new enough".
	assert.equal(isComputedStatsCurrent(2, 1), false);
});

test('isComputedStatsCurrent: the in-flight-build race is rejected end to end', () => {
	// The sequence the guard exists for, played out in the order the real code runs it.
	let cacheGeneration = 0;

	// 1. A build starts and captures the generation before its first await.
	const startedAtGeneration = cacheGeneration;

	// 2. clearCache() runs while that build is awaiting: caches emptied, generation bumped.
	cacheGeneration++;
	let fullDaily: string | undefined = undefined;
	let fullDailyStamp: number | undefined = undefined;

	// 3. The in-flight build finishes *after* the clear and assigns its result, which was
	//    derived from the pre-clear session cache. The value is present again...
	fullDaily = 'pre-clear data';
	fullDailyStamp = startedAtGeneration;
	assert.ok(fullDaily, 'the cache is non-empty, so presence alone cannot be the test');

	// 4. ...but the next non-forced read must still recompute rather than reuse it.
	assert.equal(
		isComputedStatsCurrent(fullDailyStamp, cacheGeneration),
		false,
		'a result computed before the clear must not be readable as current after it',
	);

	// 5. A build that starts after the clear stamps the live generation and is reusable.
	const rebuildStamp = cacheGeneration;
	assert.equal(isComputedStatsCurrent(rebuildStamp, cacheGeneration), true);
});

// ---------------------------------------------------------------------------
// makePanelBoundSink — a build outliving its panel must not paint onto the
// replacement panel a reopen created.
// ---------------------------------------------------------------------------

function fakePanel(name: string): PostablePanel & { posted: object[]; name: string } {
	const posted: object[] = [];
	return { name, posted, webview: { postMessage: (msg: object) => { posted.push(msg); return true; } } };
}

test('makePanelBoundSink: delivers while its panel is the live one', () => {
	const panel = fakePanel('a');
	const sink = makePanelBoundSink(panel, () => panel);

	sink({ command: 'loadingProgress', completed: 3 });
	sink({ command: 'loadingStep', step: 'computing' });

	assert.deepEqual(panel.posted, [
		{ command: 'loadingProgress', completed: 3 },
		{ command: 'loadingStep', step: 'computing' },
	]);
});

test('makePanelBoundSink: a build outliving its panel cannot post to the replacement', () => {
	const closed = fakePanel('closed');
	const reopened = fakePanel('reopened');
	let live: PostablePanel | undefined = closed;

	// The slow build's sink, created while its panel was live.
	const staleSink = makePanelBoundSink(closed, () => live);
	staleSink({ tick: 1 });

	// The user closes that panel and reopens the view; the new panel has its own build.
	live = reopened;
	const freshSink = makePanelBoundSink(reopened, () => live);

	staleSink({ tick: 2 });
	freshSink({ tick: 3 });

	assert.deepEqual(closed.posted, [{ tick: 1 }], 'the stale build stops posting once its panel is gone');
	assert.deepEqual(reopened.posted, [{ tick: 3 }], 'and nothing of its lands on the replacement');
});

test('makePanelBoundSink: drops messages when no panel is live at all', () => {
	const panel = fakePanel('a');
	let live: PostablePanel | undefined = panel;
	const sink = makePanelBoundSink(panel, () => live);

	live = undefined;
	sink({ tick: 1 });

	assert.deepEqual(panel.posted, [], 'a closed view with no replacement receives nothing');
});

test('makePanelBoundSink: the live panel is read at send time, not captured', () => {
	// If getLive() were resolved when the sink was built, this sink would be permanently
	// dead after the first handover and would never resume.
	const panel = fakePanel('a');
	const other = fakePanel('b');
	let live: PostablePanel | undefined = panel;
	const sink = makePanelBoundSink(panel, () => live);

	live = other;
	sink({ tick: 1 });
	live = panel;
	sink({ tick: 2 });

	assert.deepEqual(panel.posted, [{ tick: 2 }]);
	assert.deepEqual(other.posted, [], 'a sink never posts to a panel it is not bound to');
});

// ---------------------------------------------------------------------------
// chainBuild — Efficiency builds are serialized so an older build finishing
// second cannot leave stale data in the shared stat caches.
// ---------------------------------------------------------------------------

function deferred<T>(): { promise: Promise<T>; resolve: (v: T) => void; reject: (e: unknown) => void } {
	let resolve!: (v: T) => void;
	let reject!: (e: unknown) => void;
	const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
	return { promise, resolve, reject };
}

test('chainBuild: a queued build does not start until the one ahead of it finishes', async () => {
	const events: string[] = [];
	const first = deferred<string>();

	let chain: Promise<unknown> = Promise.resolve();

	const a = chainBuild(chain, () => { events.push('a:start'); return first.promise; });
	chain = a.chain;
	const b = chainBuild(chain, async () => { events.push('b:start'); return 'b'; });
	chain = b.chain;

	// Let every already-resolvable microtask run. `b` must still be waiting on `a`.
	await Promise.resolve();
	await Promise.resolve();
	assert.deepEqual(events, ['a:start'], 'the second build must not start alongside the first');

	first.resolve('a');
	assert.equal(await a.result, 'a');
	assert.equal(await b.result, 'b');
	assert.deepEqual(events, ['a:start', 'b:start']);
});

test('chainBuild: results come back to their own callers, in queue order', async () => {
	let chain: Promise<unknown> = Promise.resolve();
	const results: string[] = [];

	const queued = ['one', 'two', 'three'].map(label => {
		const { result, chain: next } = chainBuild(chain, async () => { results.push(label); return label; });
		chain = next;
		return result;
	});

	assert.deepEqual(await Promise.all(queued), ['one', 'two', 'three']);
	assert.deepEqual(results, ['one', 'two', 'three'], 'builds ran in the order they were queued');
});

test('chainBuild: the caller sees its own build reject', async () => {
	const boom = new Error('build failed');
	const { result } = chainBuild(Promise.resolve(), async () => { throw boom; });

	await assert.rejects(() => result, (e: unknown) => e === boom);
});

test('chainBuild: a failed build does not wedge the builds queued behind it', async () => {
	// The chain and the caller's result differ in failure handling on purpose: without that,
	// one failed Efficiency build would leave the view unable to ever rebuild.
	let chain: Promise<unknown> = Promise.resolve();

	const failing = chainBuild(chain, async () => { throw new Error('build failed'); });
	chain = failing.chain;
	const after = chainBuild(chain, async () => 'recovered');
	chain = after.chain;

	await assert.rejects(() => failing.result);
	assert.equal(await after.result, 'recovered', 'the next build still runs');

	// And the chain itself stays usable for everything queued later.
	const later = chainBuild(chain, async () => 'later');
	assert.equal(await later.result, 'later');
});

test('chainBuild: a rejected predecessor chain still runs the next build', async () => {
	// chainBuild passes `build` as both handlers, so it runs whether the chain it was queued
	// behind settled or failed. A chain that somehow arrives rejected must not skip the build.
	const rejected = Promise.reject(new Error('previous'));
	rejected.catch(() => { /* keep node from flagging an unhandled rejection */ });

	const { result } = chainBuild(rejected, async () => 'ran anyway');
	assert.equal(await result, 'ran anyway');
});

// ---------------------------------------------------------------------------
// Wiring. The pure guards above prove the rules; these prove the rules are
// actually applied at every site that reads or writes a computed-stat cache.
// CopilotTokenTracker cannot be instantiated outside a VS Code host, so this
// follows the structural-assertion pattern instantCacheBoot.test.ts uses.
// ---------------------------------------------------------------------------

// Compiled test output lives under out/vscode-extension/test/unit (tsconfig.tests.json's
// rootDir is the repo root), so walk back up to the package root, then down into src/.
const EXTENSION_SRC = fs.readFileSync(path.join(__dirname, '../../../../src/extension.ts'), 'utf8');

test('wiring: every computed-stat cache is stamped with the generation its build started at', () => {
	// Captured before the first await, never re-read at the write — re-reading would stamp a
	// pre-clear result with the *post*-clear generation and make it look current.
	for (const marker of [
		'this._statsGeneration.fullDaily = startedAtGeneration;',
		'this._statsGeneration.usage = startedAtGeneration;',
		'this._statsGeneration.sessionInputs = startedAtGeneration;',
	]) {
		assert.ok(EXTENSION_SRC.includes(marker), `missing generation stamp: ${marker}`);
	}
	assert.equal(
		EXTENSION_SRC.split('const startedAtGeneration = this._cacheGeneration;').length - 1,
		3,
		'each of the three aggregation passes must capture the generation before its first await',
	);
	assert.ok(
		!/_statsGeneration\.\w+ = this\._cacheGeneration/.test(EXTENSION_SRC),
		'a cache must never be stamped with the generation read at write time — that is the bug',
	);
});

test('wiring: every reuse of a computed-stat cache is guarded by isComputedStatsCurrent', () => {
	for (const [cache, key] of [
		['this.lastFullDailyStats', 'fullDaily'],
		['this.lastUsageAnalysisStats', 'usage'],
		['this.lastEfficiencySessionInputs', 'sessionInputs'],
	]) {
		const guard = `${cache} && isComputedStatsCurrent(this._statsGeneration.${key}, this._cacheGeneration)`;
		assert.ok(
			EXTENSION_SRC.includes(guard),
			`reusing ${cache} must be gated on its stamp still being current — expected: ${guard}`,
		);
	}
});

test('wiring: the Efficiency sink and build queue use the tested helpers', () => {
	assert.ok(
		EXTENSION_SRC.includes('return makePanelBoundSink(panel, () => this.efficiencyPanel);'),
		'efficiencyLoadingSink() must delegate to the tested panel-identity helper',
	);
	assert.ok(
		EXTENSION_SRC.includes('const { result, chain } = chainBuild(this._efficiencyBuildChain, build);'),
		'runEfficiencyBuild() must delegate to the tested serialization helper',
	);
	// The caller's promise and the queue's chain must not be the same object: the chain has to
	// absorb failures so one failed build cannot wedge every build queued after it.
	assert.ok(
		EXTENSION_SRC.includes('this._efficiencyBuildChain = chain;\n\t\treturn result;'),
		'the queue must advance on the failure-absorbing chain, not on the caller-facing result',
	);
});
