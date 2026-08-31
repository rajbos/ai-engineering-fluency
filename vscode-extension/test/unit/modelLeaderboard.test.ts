import test from 'node:test';
import * as assert from 'node:assert/strict';

import { scaleBubbleRadius } from '../../src/webview/usage/modelLeaderboard';

test('scaleBubbleRadius: uses area-proportional scaling between its visual bounds', () => {
	assert.equal(scaleBubbleRadius(0, 100), 5);
	assert.equal(scaleBubbleRadius(25, 100), 10.5);
	assert.equal(scaleBubbleRadius(100, 100), 16);
});

test('scaleBubbleRadius: clamps oversized and invalid values', () => {
	assert.equal(scaleBubbleRadius(200, 100), 16);
	assert.equal(scaleBubbleRadius(Number.NaN, 100), 5);
	assert.equal(scaleBubbleRadius(10, 0), 5);
});
