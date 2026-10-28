/**
 * A video is rarely made for every bump, so `--since` widens it to everything
 * shipped after the previous video. These pin which releases that includes.
 */

import assert from 'node:assert/strict';
import { test } from 'node:test';

import { compareVersions, pickRelease, type ResolvedFeature, type ResolvedRelease } from '../catalog';
import { coldOpenNarration, outroNarration } from '../narration';

function release(version: string, ...ids: string[]): ResolvedRelease {
	return {
		version,
		date: null,
		headline: `Headline for ${version}.`,
		features: ids.map((id) => ({
			id, titleKey: 'k', descriptionKey: 'k', title: id, description: id,
			kind: 'view', surface: { view: id },
		}) as ResolvedFeature),
	};
}

// Newest first, like the real catalog.
const CATALOG = [
	release('0.19.1', 'heatmap', 'badge'),
	release('0.19.0', 'groups'),
	release('0.18.3'),
	release('0.18.0', 'ttft'),
	release('0.17.2', 'old'),
	release('0.17.0', 'older'),
];

test('without --since only the target release is covered', () => {
	const picked = pickRelease(CATALOG);
	assert.equal(picked.version, '0.19.1');
	assert.deepEqual(picked.features.map((f) => f.id), ['heatmap', 'badge']);
	assert.equal(picked.since, undefined);
});

test('--since is exclusive and runs up to the target, newest release first', () => {
	const picked = pickRelease(CATALOG, undefined, '0.17.2');
	assert.deepEqual(picked.covers, ['0.19.1', '0.19.0', '0.18.3', '0.18.0']);
	assert.deepEqual(picked.features.map((f) => f.id), ['heatmap', 'badge', 'groups', 'ttft']);
	assert.equal(picked.version, '0.19.1');
});

test('a short --since counts the missing parts as zero', () => {
	const picked = pickRelease(CATALOG, '0.19.0', '0.17');
	assert.deepEqual(picked.covers, ['0.19.0', '0.18.3', '0.18.0', '0.17.2']);
});

test('--since must be older than the target', () => {
	assert.throws(() => pickRelease(CATALOG, '0.18.0', '0.19.0'), /not older/);
	assert.throws(() => pickRelease(CATALOG, undefined, 'latest'), /must look like/);
});

test('versions compare numerically, not as text', () => {
	assert.equal(compareVersions('0.10.0', '0.9.9'), 1);
	assert.equal(compareVersions('0.17', '0.17.0'), 0);
});

test('the bookends name the span instead of one release', () => {
	const picked = pickRelease(CATALOG, undefined, '0.17.2');
	assert.match(coldOpenNarration(picked, 'Product'), /since version 0\.17\.2|since version zero/i);
	assert.doesNotMatch(coldOpenNarration(picked, 'Product'), /Headline for/);
	assert.match(outroNarration(4, 'Product', '0.17.2'), /changes since version/);
	assert.match(outroNarration(4, 'Product'), /changes in this release/);
});
