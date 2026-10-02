import test from 'node:test';
import * as assert from 'node:assert/strict';
import { isFullCacheHit, isDetailsOnlyPlaceholder } from '../../src/detailsOnlyCache';
import type { SessionFileCache } from '../../../src/types';

const entry = (over: Partial<SessionFileCache> = {}): SessionFileCache => ({
	tokens: 0, interactions: 1, modelUsage: {}, mtime: 100, size: 50, ...over,
});

test('details-only entry for an uncached session never satisfies the full cache lookup', () => {
	// Mirrors updateCacheWithSessionDetails() for a session with no existing entry and no tokenResult.
	const placeholder = entry({ ...(isDetailsOnlyPlaceholder(undefined, false) ? { detailsOnly: true as const } : {}) });
	assert.equal(placeholder.detailsOnly, true);
	assert.equal(isFullCacheHit(placeholder, 100, 50), false);
});

test('full entry with matching mtime/size is a hit; mismatch is a miss', () => {
	assert.equal(isFullCacheHit(entry({ tokens: 500 }), 100, 50), true);
	assert.equal(isFullCacheHit(entry({ tokens: 500 }), 101, 50), false);
	assert.equal(isFullCacheHit(entry({ tokens: 500 }), 100, 51), false);
	assert.equal(isFullCacheHit(undefined, 100, 50), false);
});

test('placeholder rules: real token result or existing full entry means not a placeholder', () => {
	assert.equal(isDetailsOnlyPlaceholder(undefined, false), true);
	assert.equal(isDetailsOnlyPlaceholder(undefined, true), false);
	assert.equal(isDetailsOnlyPlaceholder(entry({ tokens: 500 }), false), false);
	assert.equal(isDetailsOnlyPlaceholder(entry({ detailsOnly: true }), false), true);
	assert.equal(isDetailsOnlyPlaceholder(entry({ detailsOnly: true }), true), false);
});
