import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

import {
	chainBuild,
	isComputedStatsCurrent,
	makeLivePanelSink,
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
// makeLivePanelSink — Efficiency builds are serialized, so the single build in
// flight is always what the live panel is waiting on. Its progress follows that
// panel across a close/reopen instead of dying with the panel that started it.
// ---------------------------------------------------------------------------

function fakePanel(name: string): PostablePanel & { posted: object[]; name: string } {
	const posted: object[] = [];
	return { name, posted, webview: { postMessage: (msg: object) => { posted.push(msg); return true; } } };
}

test('makeLivePanelSink: delivers to the live panel', () => {
	const panel = fakePanel('a');
	const sink = makeLivePanelSink(() => panel);

	sink({ command: 'loadingProgress', completed: 3 });
	sink({ command: 'loadingStep', step: 'computing' });

	assert.deepEqual(panel.posted, [
		{ command: 'loadingProgress', completed: 3 },
		{ command: 'loadingStep', step: 'computing' },
	]);
});

test('makeLivePanelSink: a build outliving its panel keeps the replacement informed', () => {
	// The regression this rule exists for: close the view mid-walk and reopen it, and the new
	// panel's own build is queued behind the one still running. If progress died with the closed
	// panel, the replacement would sit on a frozen loading screen for the rest of that walk.
	const closed = fakePanel('closed');
	const reopened = fakePanel('reopened');
	let live: PostablePanel | undefined = closed;

	const sink = makeLivePanelSink(() => live);
	sink({ tick: 1 });

	live = reopened;
	sink({ tick: 2 });

	assert.deepEqual(closed.posted, [{ tick: 1 }], 'the closed panel stops receiving');
	assert.deepEqual(reopened.posted, [{ tick: 2 }], 'and the replacement picks the walk up mid-flight');
});

test('makeLivePanelSink: drops messages when no panel is live at all', () => {
	let live: PostablePanel | undefined = fakePanel('a');
	const sink = makeLivePanelSink(() => live);

	live = undefined;
	assert.doesNotThrow(() => sink({ tick: 1 }), 'a closed view with no replacement is not an error');
});

test('makeLivePanelSink: the live panel is read per message, not captured', () => {
	// Captured once, this sink would keep posting to a panel the user has closed.
	const first = fakePanel('a');
	const second = fakePanel('b');
	let live: PostablePanel | undefined = first;
	const sink = makeLivePanelSink(() => live);

	sink({ tick: 1 });
	live = second;
	sink({ tick: 2 });
	live = first;
	sink({ tick: 3 });

	assert.deepEqual(first.posted, [{ tick: 1 }, { tick: 3 }]);
	assert.deepEqual(second.posted, [{ tick: 2 }]);
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
		'this._statsGeneration.daily = startedAtGeneration;',
		'this._statsGeneration.fullDaily = startedAtGeneration;',
		'this._statsGeneration.usage = startedAtGeneration;',
		'this._statsGeneration.sessionInputs = startedAtGeneration;',
	]) {
		assert.ok(EXTENSION_SRC.includes(marker), `missing generation stamp: ${marker}`);
	}
	assert.equal(
		EXTENSION_SRC.split('const startedAtGeneration = ').length - 1,
		6,
		'every producer of a stamped cache must capture the generation before its first await',
	);
	// A refresh's results belong to the generation its *inputs* were gathered in, not the one in
	// effect when a particular calculation happens to start. calculateUsageAnalysisStats() can be
	// handed preloaded entries that predate a clear, so it prefers the caller's origin generation.
	assert.ok(
		EXTENSION_SRC.includes('const startedAtGeneration = originGeneration ?? this._cacheGeneration;'),
		'calculateUsageAnalysisStats() must stamp with the caller-supplied origin generation when it has one',
	);
	assert.ok(
		EXTENSION_SRC.includes('await this.updateAnalysisPanelIfOpen(silent, preloaded, startedAtGeneration);')
		&& EXTENSION_SRC.includes('await this.computeAndUploadFluencyScore(silent, preloaded, startedAtGeneration);'),
		'_runRefreshCore() must pass its pre-preload generation down both paths that consume preloaded',
	);
	// A *producer* must never stamp its result with the generation read at write time — that is
	// the bug this whole scheme exists for. refreshAnalysisPanel() is the one legitimate use of
	// that shape and is excluded: it is not recording a computed result, it is carrying an
	// already-current stamp across its own deliberate bump (see the scoped-invalidation test).
	const refreshAt = EXTENSION_SRC.indexOf('private async refreshAnalysisPanel()');
	const withoutScopedBump = EXTENSION_SRC.slice(0, refreshAt)
		+ EXTENSION_SRC.slice(EXTENSION_SRC.indexOf('\n\tprivate ', refreshAt + 1));
	assert.ok(
		!/_statsGeneration\.\w+ = this\._cacheGeneration/.test(withoutScopedBump),
		'a cache must never be stamped with the generation read at write time — that is the bug',
	);
});

test('wiring: every computed-stat cache is reachable only through a generation-guarded accessor', () => {
	for (const [accessor, key, field] of [
		['currentDailyStats', 'daily', 'lastDailyStats'],
		['currentFullDailyStats', 'fullDaily', 'lastFullDailyStats'],
		['currentUsageAnalysisStats', 'usage', 'lastUsageAnalysisStats'],
		['currentEfficiencySessionInputs', 'sessionInputs', 'lastEfficiencySessionInputs'],
	]) {
		assert.ok(
			EXTENSION_SRC.includes(`private get ${accessor}()`),
			`missing generation-aware accessor: ${accessor}`,
		);
		assert.ok(
			EXTENSION_SRC.includes(
				`return isComputedStatsCurrent(this._statsGeneration.${key}, this._cacheGeneration) ? this.${field} : undefined;`,
			),
			`${accessor} must return undefined once its stamp is no longer current`,
		);
	}
});

test('wiring: the Efficiency sink and build queue use the tested helpers', () => {
	assert.ok(
		EXTENSION_SRC.includes('return makeLivePanelSink(() => this.efficiencyPanel);'),
		'efficiencyLoadingSink() must delegate to the tested live-panel helper',
	);
	// The sink following the live panel is only sound because renders do *not*: a build that
	// outlived its panel must still be barred from drawing its result over the replacement.
	assert.equal(
		EXTENSION_SRC.split('this.efficiencyPanel !== panel').length - 1,
		5,
		'each Efficiency render path must keep its own panel-identity check',
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

test('wiring: the raw computed-stat fields are never read outside their accessors', () => {
	// The accessors are only a guarantee if nothing bypasses them. Every surviving mention of a
	// raw field must be an assignment to it or the single read inside its own accessor — anything
	// else is a consumer silently opted out of the generation check, which is how this guard was
	// half-applied the first time.
	for (const field of ['lastDailyStats', 'lastFullDailyStats', 'lastUsageAnalysisStats', 'lastEfficiencySessionInputs']) {
		const offenders = EXTENSION_SRC.split('\n')
			.map((line, i) => ({ line: line.trim(), no: i + 1 }))
			.filter(({ line }) => line.includes(`this.${field}`))
			.filter(({ line }) => !new RegExp(`this\\.${field}\\s*=`).test(line))
			.filter(({ line }) => !line.startsWith('*') && !line.startsWith('//'))
			.filter(({ line }) => !line.includes('isComputedStatsCurrent('));
		assert.deepEqual(
			offenders, [],
			`${field} is read directly instead of through its generation-aware accessor`,
		);
	}
});

test('wiring: the Efficiency cold path announces the daily phase after its walk, never before', () => {
	const body = EXTENSION_SRC.slice(EXTENSION_SRC.indexOf('private async collectEfficiencyInputs('));
	const inputs = body.slice(0, body.indexOf('\n\tprivate async buildEfficiencyViewData('));

	const walkAt = inputs.indexOf('dailyStats = await this.calculateDailyStats(365,');
	assert.ok(walkAt !== -1, 'the cold path must still perform the full-year walk');

	const dailySteps = [...inputs.matchAll(/postEfficiencyStep\(send, stepPct\.daily/g)].map(m => m.index!);
	assert.equal(dailySteps.length, 2, 'both the cached path and the cold path must announce the daily phase');

	// Posting it before the walk pins the bar above parsing's band and freezes it for the whole
	// parse — the failure this view had at 96%, and the reason the cold path posts it afterwards.
	const coldStep = dailySteps.find(i => i > walkAt);
	assert.ok(coldStep !== undefined, 'the cold path must announce the daily phase after its walk completes');

	const usageAt = inputs.indexOf('postEfficiencyStep(send, stepPct.usage');
	assert.ok(coldStep! < usageAt, 'and before the usage step, so the bar steps 85 -> 88 -> 92');
});

test('wiring: clearing the cache rebuilds an open Efficiency panel', () => {
	// _runRefreshCore() publishes to the details/chart/analysis/environmental panels but not this
	// one, and showEfficiency() returns early for an already-open panel — so without this the view
	// keeps showing pre-clear numbers until the user clicks Refresh.
	const body = EXTENSION_SRC.slice(EXTENSION_SRC.indexOf('public async clearCache()'));
	const clear = body.slice(0, body.indexOf('\n\tpublic async resetInsightsState('));
	assert.ok(
		/if \(this\.efficiencyPanel\) \{[\s\S]*?this\.requestEfficiencyRebuild\(\);/.test(clear),
		'clearCache() must rebuild an open Efficiency panel',
	);
	assert.ok(
		clear.indexOf('this.requestEfficiencyRebuild()') > clear.indexOf('await this.updateTokenStats()'),
		'the rebuild must come after the clear has completed and the token stats refreshed',
	);
});

test('wiring: a cache invalidation queues at most one automatic Efficiency rebuild', () => {
	// clearCache() and the build-side payload retry both notice an invalidation and both want the
	// panel rebuilt. Neither can be dropped — clearCache() is not the only writer that bumps the
	// generation — so they are collapsed by generation instead, or one clear costs two full walks.
	assert.ok(
		EXTENSION_SRC.includes('private requestEfficiencyRebuild(): void {'),
		'the automatic rebuild must go through a single coalescing entry point',
	);
	assert.ok(
		EXTENSION_SRC.includes('if (this._efficiencyRebuildRequestedFor === this._cacheGeneration) { return; }')
		&& EXTENSION_SRC.includes('this._efficiencyRebuildRequestedFor = this._cacheGeneration;'),
		'it must record the generation it requested for, so a second caller at the same generation no-ops',
	);
	// Exactly one caller may start a rebuild directly: refreshEfficiencyPanel() is also the panel's
	// own Refresh button, which must never be coalesced away.
	assert.equal(
		EXTENSION_SRC.split('void this.refreshEfficiencyPanel()').length - 1,
		1,
		'both automatic triggers must route through requestEfficiencyRebuild(), not call the refresh directly',
	);
});

test('wiring: a Usage Analysis refresh does not invalidate the daily or full-year caches', () => {
	// The generation counter is global but refreshAnalysisPanel()'s invalidation is not: it
	// discards usage-analysis state only. A bare bump silently truncated an open Chart —
	// _runRefreshCore()'s backfill skips whenever a chart panel is open, so nothing rebuilt the
	// full year, and the chart re-rendered from the 30-day fallback after nothing more than a
	// Usage Analysis refresh.
	const body = EXTENSION_SRC.slice(EXTENSION_SRC.indexOf('private async refreshAnalysisPanel()'));
	const refresh = body.slice(0, body.indexOf('\n\tprivate ', 1));

	assert.ok(refresh.includes('this._cacheGeneration++;'), 'the bump itself must stay — recordEfficiencyPayload() keys on it');

	for (const key of ['daily', 'fullDaily']) {
		assert.ok(
			refresh.includes(`isComputedStatsCurrent(this._statsGeneration.${key}, this._cacheGeneration)`),
			`refreshAnalysisPanel() must record whether ${key} was current before the bump`,
		);
		assert.ok(
			refresh.includes(`this._statsGeneration.${key} = this._cacheGeneration;`),
			`refreshAnalysisPanel() must carry a current ${key} stamp across the bump`,
		);
	}

	// Order matters: both reads must precede the bump, or they compare against the new value
	// and every cache looks stale regardless.
	const bumpAt = refresh.indexOf('this._cacheGeneration++;');
	const lastRead = Math.max(
		refresh.indexOf('const dailyWasCurrent'),
		refresh.indexOf('const fullDailyWasCurrent'),
	);
	assert.ok(lastRead !== -1 && lastRead < bumpAt, 'the was-current reads must be taken before the bump');
});
