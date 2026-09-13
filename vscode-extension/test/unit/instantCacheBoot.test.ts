/**
 * Regression guard for the two boot-time changes made for issue #2018 fix #2
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
 * This isn't a runtime test (instantiating `CopilotTokenTracker` requires a
 * full VS Code host and file-system session discovery — see
 * analysisUpdateStatsPayload.test.ts for the same constraint), so instead it
 * asserts structural invariants directly on the source: the methods exist,
 * are wired into the boot path, and the discovery-batch handler still dedupes
 * against the cache-seeded paths (so a file is never double-processed).
 */
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

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

test('renderInstantStatsFromCache() renders from the cache alone, with no discovery/fs I/O', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private async renderInstantStatsFromCache(): Promise<void> {');

	// Waits for the initial disk load, but never calls discovery or fs.stat.
	assert.ok(body.includes('this._cacheLoadPromise'), 'must wait for the initial cache load before reading cacheManager.cache');
	assert.ok(!body.includes('getCopilotSessionFilesStreaming') && !body.includes('getCopilotSessionFiles('),
		'renderInstantStatsFromCache() must not run adapter discovery — that defeats the point of an instant render');
	assert.ok(!body.includes('statSessionFile('), 'renderInstantStatsFromCache() must not fs.stat — it should only read the already-loaded in-memory cache');

	// Bails out cleanly when there is nothing cached yet (first-ever run).
	assert.ok(/if \(this\.cacheManager\.cache\.size === 0\) \{ ?return; ?\}/.test(body),
		'must return early when the cache is empty instead of rendering an empty/misleading first paint');

	// Builds preload entries straight from cache and renders the same way a real refresh does.
	assert.ok(body.includes('this.buildMinimalPreloadDetails('), 'must reuse buildMinimalPreloadDetails() to build SessionFileDetails without a fresh parse');
	assert.ok(body.includes('this.calculateDetailedStats(undefined, preloaded)'), 'must aggregate stats via calculateDetailedStats() like the real refresh does');
	for (const renderCall of ['this.updateStatusBarAndTooltip(stats)', 'this.updateDetailsPanelIfOpen(stats, true)', 'this.updateChartPanelIfOpen(true)']) {
		assert.ok(body.includes(renderCall), `renderInstantStatsFromCache() must call ${renderCall} so an already-open panel also gets the instant first paint`);
	}
});

test('_preloadSessionFiles() seeds the queue from the cache before discovery starts, and dedupes against it', () => {
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

	// Discovery must dedupe against the cache-seeded `seen` set so a file already
	// queued from the cache is never enqueued (and processed) a second time.
	assert.ok(/batch\.filter\(f => !seen\.has\(f\)\)/.test(preloadBody),
		'discovery batches must be filtered against the cache-seeded `seen` set to avoid double-processing a file');
});

test('seedPreloadQueueFromCache() populates editorSet for cache-seeded paths too', () => {
	const body = extractBracesBlock(EXTENSION_SRC, 'private seedPreloadQueueFromCache(queue: string[], seen: Set<string>, editorSet?: Set<string>): number {');
	assert.ok(body.includes('this.detectEditorSource(file)'),
		'must call detectEditorSource() for cache-seeded paths, or the loading UI editor pills will silently miss editors only known from the cache');
	assert.ok(body.includes('queue.push(...cachedPaths)'), 'must push the cached paths onto the shared queue');
	assert.ok(body.includes('return cachedPaths.length'), 'must return the seeded count so the caller can fold it into totalDiscovered');
});
