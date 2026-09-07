import test from 'node:test';
import * as assert from 'node:assert/strict';

import { TtftScanResultCache, type CachedTtftScanResult } from '../../src/ttftAnalysisCache';

test('TtftScanResultCache: reuses the cached result for the same scan range', async () => {
	const cache = new TtftScanResultCache();
	let loaderCalls = 0;

	const loader = async (): Promise<CachedTtftScanResult> => {
		loaderCalls++;
		return { samples: [], fileCount: loaderCalls };
	};

	const [first, second] = await Promise.all([
		cache.getOrLoad('14d', loader),
		cache.getOrLoad('14d', loader),
	]);

	assert.equal(loaderCalls, 1);
	assert.strictEqual(first, second);
	assert.equal(second.fileCount, 1);
});

test('TtftScanResultCache: keeps separate entries per range and clears them together', async () => {
	const cache = new TtftScanResultCache();
	let loaderCalls = 0;

	const loader = async (): Promise<CachedTtftScanResult> => {
		loaderCalls++;
		return { samples: [], fileCount: loaderCalls };
	};

	await cache.getOrLoad('14d', loader);
	await cache.getOrLoad('30d', loader);
	cache.clear();
	await cache.getOrLoad('14d', loader);

	assert.equal(loaderCalls, 3);
});
