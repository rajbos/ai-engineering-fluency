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
import { normalizePathForDedup, dedupeByNormalizedKeyKeepGreatest } from '../../../src/utils/pathUtils';

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

	// Sample mode is re-checked after the await too — the first check only reflects the state at
	// the very start of this call, and runLocalViewRegression() could switch sample mode on while
	// this was suspended waiting on _cacheFileLoadPromise, before the cache is actually read.
	const cacheSizeCheckIndex = body.indexOf('if (this.cacheManager.cache.size === 0) { return; }');
	const secondSampleGuardIndex = body.indexOf('if (this.isSampleDataModeActive()) { return; }', cacheFileWaitIndex);
	assert.ok(secondSampleGuardIndex !== -1 && cacheFileWaitIndex < secondSampleGuardIndex && secondSampleGuardIndex < cacheSizeCheckIndex,
		'must re-check isSampleDataModeActive() again after awaiting _cacheFileLoadPromise, before reading the cache — a single check at the top of the function can go stale across that await');

	assert.ok(!body.includes('getCopilotSessionFilesStreaming') && !body.includes('getCopilotSessionFiles('),
		'renderInstantStatsFromCache() must not run adapter discovery — that defeats the point of an instant render');
	assert.ok(!body.includes('statSessionFile('), 'renderInstantStatsFromCache() must not fs.stat — it should only read the already-loaded in-memory cache');

	// Bails out cleanly when there is nothing cached yet (first-ever run).
	assert.ok(cacheSizeCheckIndex !== -1,
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

test('isSampleDataModeActive() picks the override only when it was actually set (not merely falsy), and gates on being a real directory', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private isSampleDataModeActive(): boolean {');
	assert.ok(body.includes('this.localRegressionSampleDataDir'),
		'must check localRegressionSampleDataDir — set by runLocalViewRegression()/the visual-view-diff harness');
	assert.ok(body.includes("getConfiguration('aiEngineeringFluency').get<string>('sampleDataDirectory')"),
		'must check the aiEngineeringFluency.sampleDataDirectory setting — this must mirror SessionDiscovery.tryGetSampleDataFiles()\'s own check exactly, or the two can disagree about whether sample mode is active');

	// SessionDiscovery's real precedence is `sampleDataDirectoryOverride?.() ?? configured` — the
	// override function is always defined once constructed, so `??` only falls through to config
	// when the override's *return value* is nullish. runLocalViewRegression() sets
	// localRegressionSampleDataDir to '' (not undefined) while deliberately trying real discovery
	// first; a plain truthy check treats '' the same as "no override" and wrongly falls back to
	// config, disagreeing with SessionDiscovery whenever a sampleDataDirectory setting also
	// happens to be configured.
	assert.ok(/overrideValue !== undefined \? overrideValue :/.test(body),
		'must select the override with an explicit !== undefined check, not a truthy check — otherwise runLocalViewRegression()\'s deliberate \'\' override is wrongly treated as absent');

	// tryGetSampleDataFiles() returns undefined (falls back to real discovery) for a
	// configured-but-missing directory, or one whose readdir() fails (e.g. it names a file, not a
	// directory) — a configured stale/deleted/non-directory sampleDataDirectory must not silently
	// disable the cache-only paint on a normal warm boot.
	assert.ok(/fs\.statSync\(sampleDir\.trim\(\)\)\.isDirectory\(\)/.test(body),
		'must gate on the path actually being a directory (fs.statSync(...).isDirectory()), not merely existing — existsSync alone would also true for a misconfigured path pointing at a file');
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

	assert.ok(/_normalizePathForDedup\(f\)/.test(body) && /const key = _normalizePathForDedup\(p\.sessionFile\);/.test(body) && /confirmedKeys\.has\(key\)/.test(body),
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
// called, and a prior version of this test reimplemented the algorithm locally instead of
// exercising the real one, so a regression in production (e.g. keeping the older entry, or
// dropping normalization) would still have passed. getDeduplicatedCacheEntries() is a private
// method on CopilotTokenTracker, which can't be instantiated outside a full VS Code host (see the
// file header), but the dedup algorithm itself now lives in the shared, side-effect-free
// dedupeByNormalizedKeyKeepGreatest() (src/utils/pathUtils.ts) that getDeduplicatedCacheEntries()
// delegates to — so this calls that exact production function directly.
test('dedupeByNormalizedKeyKeepGreatest() — the production algorithm getDeduplicatedCacheEntries() delegates to — keeps exactly one winner per physical file', () => {
	type MinimalCacheEntry = { mtime: number };
	const cache = new Map<string, MinimalCacheEntry>([
		['C:\\Users\\dev\\.copilot\\session.json', { mtime: 1000 }],
		['c:/Users/dev/.copilot/session.json', { mtime: 2000 }],
		['C:\\Users\\dev\\.claude\\other.json', { mtime: 500 }],
	]);

	const deduped = dedupeByNormalizedKeyKeepGreatest(cache, data => data.mtime, 'win32');
	assert.equal(deduped.length, 2, 'two spelling variants of the same physical file must collapse to one entry');
	const sessionEntry = deduped.find(([, data]) => data.mtime === 2000 || data.mtime === 1000);
	assert.ok(sessionEntry, 'the session.json entry must survive under one of its two spellings');
	assert.equal(sessionEntry![1].mtime, 2000, 'must keep the newer-mtime variant, not an arbitrary/first one');
});

test('getDeduplicatedCacheEntries() delegates to the shared dedupeByNormalizedKeyKeepGreatest() helper', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private getDeduplicatedCacheEntries(): [string, SessionFileCache][] {');
	assert.ok(body.includes('_dedupeByNormalizedKeyKeepGreatest(this.cacheManager.cache, data => data.mtime)'),
		'must delegate to the shared, independently-tested dedupeByNormalizedKeyKeepGreatest() helper rather than reimplementing the dedup loop inline');
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

test('renderInstantStatsFromCache() never overwrites a real refresh that already completed while it was still computing', () => {
	const instantBody = extractBracesBlock(EXTENSION_SRC, 'private async renderInstantStatsFromCache(): Promise<void> {');
	const calcIndex = instantBody.indexOf('await this.calculateDetailedStats(undefined, preloaded)');
	const guardIndex = instantBody.indexOf('if (this._hasCompletedRealRefresh) { return; }');
	const commitIndex = instantBody.indexOf('this.lastDetailedStats = stats;');
	assert.ok(calcIndex !== -1 && guardIndex !== -1 && commitIndex !== -1 && calcIndex < guardIndex && guardIndex < commitIndex,
		'renderInstantStatsFromCache() must check _hasCompletedRealRefresh after awaiting calculateDetailedStats but before committing its own results — otherwise a real refresh that finishes first can be silently overwritten by this slower, stale cache-only computation');

	// The flag must be set as soon as _runRefreshCore()'s own verified result exists — right after
	// its own calculateDetailedStats() resolves — and specifically BEFORE updateStatusBarAndTooltip()
	// publishes it to the UI. Setting it any later (e.g. after the slower, some-awaited/some-network
	// steps like computeAndUploadFluencyScore that follow) would leave a wide window where the real
	// refresh has already redrawn the status bar, but renderInstantStatsFromCache() still sees the
	// flag as false and can overwrite that already-correct UI with its own, older cache-only result.
	const refreshBody = extractBracesBlock(EXTENSION_SRC, 'private async _runRefreshCore(silent: boolean, isLeader: boolean): Promise<DetailedStats | undefined> {');
	const refreshCalcIndex = refreshBody.indexOf('await this.calculateDetailedStats(undefined, preloaded)');
	const flagSetIndex = refreshBody.indexOf('this._hasCompletedRealRefresh = true;');
	const statusBarIndex = refreshBody.indexOf('this.updateStatusBarAndTooltip(detailedStats);');
	assert.ok(refreshCalcIndex !== -1 && flagSetIndex !== -1 && statusBarIndex !== -1 && refreshCalcIndex < flagSetIndex && flagSetIndex < statusBarIndex,
		'_runRefreshCore() must set _hasCompletedRealRefresh immediately after its own calculateDetailedStats() resolves, before updateStatusBarAndTooltip() (and every slower step after it) — not after the UI is already published');
});

test('reconcilePreloadedAgainstDiscovery() evicts every raw cache key for an unconfirmed path, via the tombstone-aware deleteCachedSessionData()', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private reconcilePreloadedAgainstDiscovery(preloaded: SessionFilePreload[], sessionFiles: string[]): SessionFilePreload[] {');
	assert.ok(body.includes('this.cacheManager.deleteCachedSessionData(rawPath)'),
		'must evict via cacheManager.deleteCachedSessionData() (which tombstones the path), not a plain cache.delete() — a plain delete is silently resurrected by the very next saveCacheToStorage(), whose merge starts from whatever is already on disk (see cacheManager-snapshot.test.ts)');
	assert.ok(!/this\.cacheManager\.cache\.delete\(/.test(body),
		'must not touch cacheManager.cache directly — deletions here must always go through the tombstone-aware deleteCachedSessionData()');

	// Must sweep every raw key in the cache that normalizes to an unconfirmed path, not only the
	// one `preloaded` happened to carry (the dedup winner) — a same-file spelling variant that lost
	// getDeduplicatedCacheEntries()'s dedup never appears in `preloaded`, but would still be sitting
	// in the cache ready to become the new "winner" once the current one is evicted.
	assert.ok(/for \(const rawPath of Array\.from\(this\.cacheManager\.cache\.keys\(\)\)\)/.test(body),
		'must scan all raw cache keys (not just the preloaded winners) when evicting unconfirmed entries');
	assert.ok(/unconfirmedNormalizedKeys\.has\(_normalizePathForDedup\(rawPath\)\)/.test(body),
		'must match raw cache keys against the unconfirmed set via _normalizePathForDedup(), so a differently-cased/separated duplicate of an unconfirmed path is evicted too');
});

test('_preloadSessionFiles() always schedules clearExpiredCache(), even when this run\'s discovery came back empty', () => {
	const preloadBody = extractBracesBlock(EXTENSION_SRC, 'preloaded: SessionFilePreload[] }> {');
	const cleanupIndex = preloadBody.indexOf('this.cacheManager.clearExpiredCache()');
	const emptyBranchIndex = preloadBody.indexOf('if (sessionFiles.length === 0) {');
	assert.ok(cleanupIndex !== -1 && emptyBranchIndex !== -1 && cleanupIndex < emptyBranchIndex,
		'clearExpiredCache() must be scheduled before the empty-sessionFiles early return, not only on the non-empty path — otherwise a cached entry for a genuinely deleted file never gets pruned on a run where every adapter returned nothing, and can keep being resurrected by a future cache-only instant paint');
});

test('sample-data mode never writes to the shared on-disk cache snapshot: neither the end-of-refresh save nor mid-parse checkpointing', () => {
	const persistBody = extractBracesBlock(EXTENSION_SRC, 'private persistRefreshResult(isLeader: boolean): void {');
	const sampleGuardIndex = persistBody.indexOf('if (this.isSampleDataModeActive()) { return; }');
	const saveIndex = persistBody.indexOf('await this.saveCacheToStorage()');
	assert.ok(sampleGuardIndex !== -1 && saveIndex !== -1 && sampleGuardIndex < saveIndex,
		'persistRefreshResult() must skip saveCacheToStorage() in sample-data mode, before attempting the save — a regression/screenshot fixture refresh must never let its fixture data survive on disk past the run, where a later normal boot\'s cache-only instant paint would show it as real stats');

	const preloadBody = extractBracesBlock(EXTENSION_SRC, 'preloaded: SessionFilePreload[] }> {');
	assert.ok(/processed % 25 === 0 && !this\.isSampleDataModeActive\(\)/.test(preloadBody),
		'the mid-parse checkpoint (maybeCheckpointCache(), which also writes the shared snapshot directly) must skip sample-data mode too, or it can persist fixture data even when persistRefreshResult() itself is correctly guarded');
});

test('runLocalViewRegression() evicts its own session files from the in-memory cache when it finishes', () => {
	// Skipping the on-disk save (see the sample-data-mode test above) does not stop a regression
	// pass from writing fixture entries into the IN-MEMORY cache — computeRegressionStats() runs
	// the normal preload pipeline, whose getSessionFileDataCached() unconditionally calls
	// setCachedSessionData() regardless of sample mode. Without eviction here, the very next
	// normal refresh in this same session (no restart needed) would seed/paint from those fixture
	// entries via getDeduplicatedCacheEntries(), which reads the cache directly.
	const body = extractBracesBlock(EXTENSION_SRC, 'public async runLocalViewRegression(): Promise<void> {');

	assert.ok(body.includes('regressionSessionFiles = setup.sessionFiles;'),
		'must capture the exact session files (real or bundled-fixture) the regression pass used');

	const finallyIndex = body.indexOf('} finally {');
	const evictionIndex = body.indexOf('this.cacheManager.deleteCachedSessionData(sessionFile);');
	assert.ok(finallyIndex !== -1 && evictionIndex !== -1 && evictionIndex > finallyIndex,
		'must evict the regression run\'s own session files from the cache (via the tombstone-aware deleteCachedSessionData(), for consistency/defense-in-depth even though nothing should have reached disk during sample mode) in the finally block, so it always runs — even if the regression pass itself throws');

	assert.ok(/for \(const sessionFile of regressionSessionFiles\)/.test(body),
		'must loop over every captured regression session file, not just one');
});
