/**
 * Regression guard for the boot-time changes made for issue #2018 fix #2
 * (persist the discovery list, render from it immediately):
 *
 *   1. `renderInstantStatsFromCache()` paints the status bar from the on-disk
 *      cache alone (no discovery, no fs.stat, no parsing) the moment
 *      `scheduleInitialUpdate()` runs, so a cold boot shows real numbers
 *      before the full discover→parse pass even starts.
 *   2. `seedPreloadQueueFromCache()` seeds the preload worker queue with the
 *      cache's known file paths before adapter discovery starts, so the
 *      worker pool begins stat+cache-validating files from tick zero instead
 *      of waiting on the slowest adapter's directory walk.
 *
 * Also covers the fixes made in response to PR #2080's Copilot review:
 *   3. The instant paint must not block on the OpenCode DB probe chained onto
 *      the cache-file load (queueMissingOpenCodeDbSessionsFromCache() does its
 *      own SQLite I/O), and must not run at all in sample-data mode (it would
 *      otherwise mix real user sessions into a screenshot/regression fixture).
 *   4. Cache-to-discovery deduplication must use the same path normalization
 *      SessionDiscovery uses across adapters, or a differently-cased/separated
 *      cached key can coexist with a freshly discovered one and double-count
 *      the same file.
 *   5. `_preloadSessionFiles()` must not discard already-seeded `preloaded`
 *      results just because this run's adapter discovery came back empty.
 *   6. The cache snapshot itself (not just cache-vs-discovery) can contain
 *      multiple raw-path spellings of the same physical file, which both the
 *      instant paint and the cache-seeded queue must deduplicate against.
 *   7. `_runRefreshCore()`'s one-time full-year chart backfill must not run
 *      against an empty `sessionFiles` when real cache-seeded `preloaded`
 *      data exists — calculateDailyStats(365, []) sets `lastFullDailyStats`
 *      to `[]`, and since an empty array is truthy, showChart() would treat
 *      that as complete data and get stuck showing an empty chart.
 *
 * This isn't a runtime test (instantiating `CopilotTokenTracker` requires a
 * full VS Code host and file-system session discovery — see
 * analysisUpdateStatsPayload.test.ts for the same constraint), so instead it
 * asserts structural invariants directly on the source.
 */
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { normalizePathForDedup } from '../../../src/utils/pathUtils';

// Compiled test output lives under out/vscode-extension/test/unit (tsconfig.tests.json's
// rootDir is the repo root), so __dirname does not sit next to the real source tree —
// walk back up to the vscode-extension package root, then down into src/.
const EXTENSION_SRC_PATH = path.join(__dirname, '../../../../src/extension.ts');
const EXTENSION_SRC = fs.readFileSync(EXTENSION_SRC_PATH, 'utf8');

/** Extract the full `{ ... }` block starting at the first `{` found after `marker` (brace-balanced). */
function extractBracesBlock(source: string, marker: string): string {
	const markerIndex = source.indexOf(marker);
	assert.notEqual(markerIndex, -1, `marker not found in extension.ts: ${marker}`);
	const braceStart = source.indexOf('{', markerIndex);
	let depth = 0;
	for (let i = braceStart; i < source.length; i++) {
		if (source[i] === '{') { depth++; }
		else if (source[i] === '}') {
			depth--;
			if (depth === 0) { return source.slice(markerIndex, i + 1); }
		}
	}
	throw new Error(`unbalanced braces while scanning for marker: ${marker}`);
}

/** Slice the source between two unique markers (inclusive of both), for spans that aren't a single balanced-brace block (e.g. a few statements inside a larger function). */
function sliceBetween(source: string, startMarker: string, endMarker: string): string {
	const startIndex = source.indexOf(startMarker);
	assert.notEqual(startIndex, -1, `start marker not found in extension.ts: ${startMarker}`);
	const endMarkerIndex = source.indexOf(endMarker, startIndex);
	assert.notEqual(endMarkerIndex, -1, `end marker not found after start marker in extension.ts: ${endMarker}`);
	return source.slice(startIndex, endMarkerIndex + endMarker.length);
}

test('scheduleInitialUpdate() kicks off renderInstantStatsFromCache() before the real refresh', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private scheduleInitialUpdate(): void {');
	assert.ok(
		body.includes('this.renderInstantStatsFromCache()'),
		'scheduleInitialUpdate() no longer calls renderInstantStatsFromCache() — cold boot will go back to showing nothing until the full scan finishes'
	);
	// It must run before the real pass (inside the 3s setTimeout), not after,
	// otherwise there is nothing "instant" about it.
	const instantCallIndex = body.indexOf('this.renderInstantStatsFromCache()');
	const realRefreshIndex = body.indexOf('await this.updateTokenStats()');
	assert.ok(instantCallIndex !== -1 && realRefreshIndex !== -1 && instantCallIndex < realRefreshIndex,
		'renderInstantStatsFromCache() must be kicked off before the real updateTokenStats() pass');
});

test('renderInstantStatsFromCache() renders from the cache alone, with no discovery/fs I/O, and skips sample-data mode', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private async renderInstantStatsFromCache(): Promise<void> {');

	// Skips entirely in sample-data mode (screenshot/regression fixtures), and does so before
	// touching the cache, or a warm real-user cache would still contaminate a fixture run.
	const sampleGuardIndex = body.indexOf('if (this.isSampleDataModeActive()) { return; }');
	assert.ok(sampleGuardIndex !== -1, 'must skip entirely in sample-data mode — otherwise a warm real cache paints real user data over a screenshot/regression fixture run');

	// Waits for the raw cache-FILE load only — not the OpenCode DB probe chained onto
	// _cacheLoadPromise, which does its own SQLite I/O and would defeat the "no filesystem/DB
	// I/O" guarantee of an instant first paint.
	assert.ok(body.includes('this._cacheFileLoadPromise'), 'must await _cacheFileLoadPromise (the raw cache-file load), not _cacheLoadPromise (which also chains the OpenCode DB probe)');
	assert.ok(!/this\._cacheLoadPromise\b/.test(body), 'must not await _cacheLoadPromise — that also waits on queueMissingOpenCodeDbSessionsFromCache()\'s SQLite I/O, defeating the instant paint');
	const cacheFileWaitIndex = body.indexOf('this._cacheFileLoadPromise');
	assert.ok(sampleGuardIndex < cacheFileWaitIndex, 'the sample-data guard must run before waiting on/reading the cache');

	assert.ok(!body.includes('getCopilotSessionFilesStreaming') && !body.includes('getCopilotSessionFiles('),
		'renderInstantStatsFromCache() must not run adapter discovery — that defeats the point of an instant render');
	assert.ok(!body.includes('statSessionFile('), 'renderInstantStatsFromCache() must not fs.stat — it should only read the already-loaded in-memory cache');

	// Bails out cleanly when there is nothing cached yet (first-ever run).
	assert.ok(/if \(this\.cacheManager\.cache\.size === 0\) \{ ?return; ?\}/.test(body),
		'must return early when the cache is empty instead of rendering an empty/misleading first paint');

	// Iterates the deduplicated view of the cache, not the raw Map directly — the snapshot is
	// keyed by whatever raw path string was recorded at write time, so two separator/case
	// variants of the same physical file (e.g. on Windows) can coexist as separate entries and
	// would otherwise get summed as if they were two different sessions.
	assert.ok(body.includes('this.getDeduplicatedCacheEntries()'),
		'must iterate getDeduplicatedCacheEntries(), not this.cacheManager.cache directly — a raw iteration can double-count a file that has two path-spelling variants in the cache');
	assert.ok(!/for \(const \[sessionFile, sessionData\] of this\.cacheManager\.cache\)/.test(body),
		'must not iterate this.cacheManager.cache directly — see getDeduplicatedCacheEntries()');

	// Builds preload entries straight from cache and renders the same way a real refresh does.
	assert.ok(body.includes('this.buildMinimalPreloadDetails('), 'must reuse buildMinimalPreloadDetails() to build SessionFileDetails without a fresh parse');
	assert.ok(body.includes('this.calculateDetailedStats(undefined, preloaded)'), 'must aggregate stats via calculateDetailedStats() like the real refresh does');
	for (const renderCall of ['this.updateStatusBarAndTooltip(stats)', 'this.updateDetailsPanelIfOpen(stats, true)', 'this.updateChartPanelIfOpen(true)']) {
		assert.ok(body.includes(renderCall), `renderInstantStatsFromCache() must call ${renderCall} so an already-open panel also gets the instant first paint`);
	}
});

test('isSampleDataModeActive() checks both sample-dir sources with the local-regression override taking precedence, and gates on existence', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private isSampleDataModeActive(): boolean {');
	assert.ok(body.includes('this.localRegressionSampleDataDir'),
		'must check localRegressionSampleDataDir — set by runLocalViewRegression()/the visual-view-diff harness');
	assert.ok(body.includes("getConfiguration('aiEngineeringFluency').get<string>('sampleDataDirectory')"),
		'must check the aiEngineeringFluency.sampleDataDirectory setting — this must mirror SessionDiscovery.tryGetSampleDataFiles()\'s own check exactly, or the two can disagree about whether sample mode is active');
	// tryGetSampleDataFiles() returns undefined (falls back to real discovery) for a
	// configured-but-missing directory, not just an empty one — a configured stale/deleted
	// sampleDataDirectory must not silently disable the cache-only paint on a normal warm boot.
	assert.ok(/fs\.existsSync\(sampleDir\.trim\(\)\)/.test(body),
		'must gate on the directory actually existing on disk, matching tryGetSampleDataFiles()\'s own existence check — a non-empty-string-only check disagrees with it for a stale/deleted configured directory');
});

test('_preloadSessionFiles() seeds the queue from the cache before discovery starts, dedupes with path normalization, and never discards seeded results on empty discovery', () => {
	// _preloadSessionFiles()'s own return type is an inline object literal
	// (`Promise<{ sessionFiles: ...; preloaded: ... }>`), so a marker at the
	// start of the signature would make extractBracesBlock's brace-balancing
	// latch onto that type's braces instead of the function body. Anchor the
	// marker on the tail of the signature instead, right before the real `{`.
	const preloadBody = extractBracesBlock(EXTENSION_SRC, 'preloaded: SessionFilePreload[] }> {');
	assert.ok(preloadBody.includes('this.seedPreloadQueueFromCache(queue, seen, editorSet)'),
		'_preloadSessionFiles() must seed the queue from the cache before kicking off adapter discovery');

	const seedIndex = preloadBody.indexOf('this.seedPreloadQueueFromCache(');
	const discoveryIndex = preloadBody.indexOf('getCopilotSessionFilesStreaming');
	assert.ok(seedIndex !== -1 && discoveryIndex !== -1 && seedIndex < discoveryIndex,
		'the cache seed must happen before discovery starts, otherwise workers gain nothing from it');

	// Discovery must dedupe against the cache-seeded `seen` set using the same path
	// normalization SessionDiscovery.addDedupedBatch() uses across adapters — a raw-string
	// comparison lets a differently-cased/separated cached key coexist with a freshly
	// discovered one for the same physical file, double-queuing (and double-counting) it.
	assert.ok(/seen\.has\(_normalizePathForDedup\(f\)\)/.test(preloadBody),
		'discovery batches must be filtered using _normalizePathForDedup(), not a raw-string seen.has() check');
	assert.ok(/seen\.add\(_normalizePathForDedup\(f\)\)/.test(preloadBody),
		'newly discovered files must be added to `seen` via _normalizePathForDedup() too, matching how they were checked');

	// A run whose fresh adapter discovery comes back empty (sessionFiles.length === 0) must not
	// clobber already-seeded, already-processed `preloaded` results with a hardcoded [] — that
	// would regress the instant cache-only paint straight back to zero stats whenever adapters
	// transiently return nothing.
	assert.ok(/if \(sessionFiles\.length === 0\) \{[\s\S]*?return \{ sessionFiles, preloaded \};[\s\S]*?\}/.test(preloadBody),
		'the empty-discovery early return must return the real `preloaded` array, not a hardcoded empty one');
	assert.ok(!/return \{ sessionFiles, preloaded: \[\] \};/.test(preloadBody),
		'must not hardcode preloaded: [] on empty discovery — that discards cache-seeded results');

	// A cache-seeded file that still exists but a clean discovery pass no longer recognizes must
	// be reconciled out of `preloaded` (see reconcilePreloadedAgainstDiscovery()) — otherwise it
	// keeps contributing stale stats to every refresh forever, since clearExpiredCache() only
	// detects outright-deleted files, not "un-discovered while still readable" ones.
	const reconcileIndex = preloadBody.indexOf('this.reconcilePreloadedAgainstDiscovery(preloaded, sessionFiles)');
	assert.ok(reconcileIndex !== -1,
		'_preloadSessionFiles() must reconcile `preloaded` against this run\'s discovery result via reconcilePreloadedAgainstDiscovery() after the Promise.all resolves');
	const promiseAllIndex = preloadBody.indexOf('await Promise.all([');
	assert.ok(promiseAllIndex !== -1 && promiseAllIndex < reconcileIndex,
		'reconciliation must happen after discovery+workers finish (sessionFiles must be the real, final discovery result)');
});

test('reconcilePreloadedAgainstDiscovery() only trusts a clean, non-empty discovery result, and compares with path normalization', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private reconcilePreloadedAgainstDiscovery(preloaded: SessionFilePreload[], sessionFiles: string[]): SessionFilePreload[] {');

	// Must bail out (keep every cached entry, no pruning) on a flaky/partial scan — gated on
	// BOTH lastDiscoveryHadError and an empty sessionFiles list, so a single erroring adapter (or
	// a run where discovery genuinely found nothing) never zeroes out real cached sessions.
	assert.ok(/if \(this\.sessionDiscovery\.lastDiscoveryHadError \|\| sessionFiles\.length === 0\) \{ ?return preloaded; ?\}/.test(body),
		'must return `preloaded` unfiltered whenever this run\'s discovery errored or found nothing — pruning must only ever run on a run we can actually trust');

	assert.ok(/_normalizePathForDedup\(f\)/.test(body) && /confirmedKeys\.has\(_normalizePathForDedup\(p\.sessionFile\)\)/.test(body),
		'the confirmed-by-discovery comparison must use _normalizePathForDedup() on both sides, matching the dedup key used everywhere else in this method');
});

test('seedPreloadQueueFromCache() skips sample-data mode, seeds from the deduplicated cache view, normalizes seen keys, and populates editorSet', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private seedPreloadQueueFromCache(queue: string[], seen: Set<string>, editorSet?: Set<string>): number {');
	const sampleGuardIndex = body.indexOf('if (this.isSampleDataModeActive()) { return 0; }');
	assert.ok(sampleGuardIndex !== -1, 'must skip seeding entirely in sample-data mode — otherwise real cached sessions get mixed into a screenshot/regression fixture run');

	// Must source cachedPaths from the deduplicated view, not the raw cache Map — otherwise two
	// path-spelling variants of the same file in the cache both get queued and double-counted.
	assert.ok(body.includes('this.getDeduplicatedCacheEntries().map(([filePath]) => filePath)'),
		'cachedPaths must come from getDeduplicatedCacheEntries(), not Array.from(this.cacheManager.cache.keys()) — the raw keys can contain multiple spellings of the same physical file');

	assert.ok(/seen\.add\(_normalizePathForDedup\(p\)\)/.test(body),
		'must normalize cached paths with _normalizePathForDedup() before adding to `seen`, matching the discovery-side check');

	assert.ok(body.includes('this.detectEditorSource(file)'),
		'must call detectEditorSource() for cache-seeded paths, or the loading UI editor pills will silently miss editors only known from the cache');
	assert.ok(body.includes('queue.push(...cachedPaths)'), 'must push the cached (un-normalized) paths onto the shared queue — downstream stat/parse code needs the real path, not the dedup key');
	assert.ok(body.includes('return cachedPaths.length'), 'must return the seeded count so the caller can fold it into totalDiscovered');
});

// A structural "does the source call getDeduplicatedCacheEntries()" assertion (see the tests
// above) can't tell you the dedup itself is correct — only that something with that name got
// called. This proves the actual behavior both consumers depend on: given a cache with two
// path-spelling variants of the same physical file, exactly one entry (the newer by mtime)
// survives. getDeduplicatedCacheEntries() is a private method on CopilotTokenTracker, which
// can't be instantiated outside a full VS Code host (see the file header), so this reimplements
// its exact, small algorithm against a plain Map fixture — a stand-in for `cacheManager.cache`
// — to verify the algorithm itself, mirroring how normalizePathForDedup()'s own behavior is
// proven directly in utils-pathUtils.test.ts rather than only asserted-as-called here.
test('the dedup-by-normalized-key-keep-newer-mtime algorithm getDeduplicatedCacheEntries() implements keeps exactly one winner per physical file', () => {
	type MinimalCacheEntry = { mtime: number };
	function dedupeByNormalizedKeyKeepNewer(cache: Map<string, MinimalCacheEntry>): [string, MinimalCacheEntry][] {
		const winners = new Map<string, [string, MinimalCacheEntry]>();
		for (const [filePath, data] of cache) {
			const key = normalizePathForDedup(filePath, 'win32');
			const existing = winners.get(key);
			if (!existing || data.mtime > existing[1].mtime) {
				winners.set(key, [filePath, data]);
			}
		}
		return Array.from(winners.values());
	}

	const cache = new Map<string, MinimalCacheEntry>([
		['C:\\Users\\dev\\.copilot\\session.json', { mtime: 1000 }],
		['c:/Users/dev/.copilot/session.json', { mtime: 2000 }],
		['C:\\Users\\dev\\.claude\\other.json', { mtime: 500 }],
	]);

	const deduped = dedupeByNormalizedKeyKeepNewer(cache);
	assert.equal(deduped.length, 2, 'two spelling variants of the same physical file must collapse to one entry');
	const sessionEntry = deduped.find(([, data]) => data.mtime === 2000 || data.mtime === 1000);
	assert.ok(sessionEntry, 'the session.json entry must survive under one of its two spellings');
	assert.equal(sessionEntry![1].mtime, 2000, 'must keep the newer-mtime variant, not an arbitrary/first one');
});

// A structural "does the source call _normalizePathForDedup()" assertion (see the tests above)
// can't tell you the function actually collapses equivalent paths to the same key — only that
// something with that name got called. This proves the actual invariant the dedup fix depends
// on: on a non-Linux platform, a cache-recorded key and a freshly discovered key for the same
// physical file that differ only in drive-letter case or separator style normalize identically,
// so they can never coexist in the `seen` set as two "different" files. normalizePathForDedup()
// itself already has full behavioral coverage in utils-pathUtils.test.ts; this test exists to
// make the tie to *this* PR's dedup contract explicit rather than assumed.
test('normalizePathForDedup() collapses the exact kind of equivalent-path pair the cache/discovery dedup relies on', () => {
	const cacheRecordedKey = normalizePathForDedup('C:\\Users\\dev\\.copilot\\session.json', 'win32');
	const freshlyDiscoveredKey = normalizePathForDedup('c:/Users/dev/.copilot/session.json', 'win32');
	assert.equal(cacheRecordedKey, freshlyDiscoveredKey,
		'a cached path and a freshly discovered path for the same file that differ only in drive-letter case/separator must normalize to the same seen-set key, or the file gets queued and counted twice');
});

test('the constructor chains the OpenCode DB probe onto _cacheLoadPromise only, never onto _cacheFileLoadPromise', () => {
	// _cacheFileLoadPromise must resolve as soon as the on-disk snapshot itself is read, with
	// nothing else chained onto it — renderInstantStatsFromCache() awaits exactly this promise,
	// so if the OpenCode probe (or any other filesystem/DB I/O) were ever chained onto it too,
	// the "instant, no I/O" guarantee of the cache-only first paint would silently regress.
	const fileLoadBlock = sliceBetween(
		EXTENSION_SRC,
		'this._cacheFileLoadPromise = cacheFileLoad.finally(() => {',
		'this._cacheFileLoadPromise = undefined;\n\t\t});'
	);
	assert.ok(!fileLoadBlock.includes('queueMissingOpenCodeDbSessionsFromCache'),
		'_cacheFileLoadPromise must not chain queueMissingOpenCodeDbSessionsFromCache() (or any other I/O) — renderInstantStatsFromCache() depends on this promise resolving with no filesystem/DB work beyond the raw snapshot read');

	// _cacheLoadPromise keeps its original, fuller meaning (used by the real refresh path, which
	// legitimately needs the OpenCode reconciliation done before it starts discovery/preload).
	const fullLoadBlock = sliceBetween(
		EXTENSION_SRC,
		'this._cacheLoadPromise = cacheFileLoad.then(async () => {',
		'this._cacheLoadPromise = undefined;\n\t\t});'
	);
	assert.ok(fullLoadBlock.includes('queueMissingOpenCodeDbSessionsFromCache'),
		'_cacheLoadPromise must still chain queueMissingOpenCodeDbSessionsFromCache() — the real refresh path (which awaits _cacheLoadPromise) needs the OpenCode DB reconciled before discovery/preload starts');
});

test('_runRefreshCore() skips the one-time full-year chart backfill when discovery is empty but cache-seeded preloaded data exists', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private async _runRefreshCore(silent: boolean, isLeader: boolean): Promise<DetailedStats | undefined> {');

	const guardIndex = body.indexOf('const discoveryUntrustworthyForBackfill = sessionFiles.length === 0 && preloaded.length > 0;');
	assert.ok(guardIndex !== -1,
		'_runRefreshCore() must detect the "sessionFiles empty but preloaded non-empty" case — calculateDailyStats(365, []) would otherwise set lastFullDailyStats to an empty (but truthy) array');

	const backfillCallIndex = body.indexOf('void this.calculateDailyStats(365, sessionFiles);');
	assert.ok(backfillCallIndex !== -1 && guardIndex < backfillCallIndex,
		'the untrustworthy-discovery guard must be computed before the backfill call it protects');

	// The guard must actually gate the call — not just exist unused nearby.
	const guardToCallSpan = body.slice(guardIndex, backfillCallIndex);
	assert.ok(/if \(!this\.lastFullDailyStats && !this\.chartPanel && !discoveryUntrustworthyForBackfill\) \{/.test(guardToCallSpan),
		'the backfill call must be gated on !discoveryUntrustworthyForBackfill, or an unreliable empty-discovery run can still overwrite lastFullDailyStats with []');
});
