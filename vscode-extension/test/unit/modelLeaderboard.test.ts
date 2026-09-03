import test from 'node:test';
import * as assert from 'node:assert/strict';

import { placeBubbleLabels, scaleBubbleRadius, type BubbleLabelInput } from '../../src/webview/usage/modelLeaderboard';

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

function labelsOverlap(
	a: ReturnType<typeof placeBubbleLabels>[number],
	b: ReturnType<typeof placeBubbleLabels>[number],
): boolean {
	return a.bounds.left < b.bounds.right && a.bounds.right > b.bounds.left
		&& a.bounds.top < b.bounds.bottom && a.bounds.bottom > b.bounds.top;
}

function labelIntersectsBubble(
	label: ReturnType<typeof placeBubbleLabels>[number],
	bubble: BubbleLabelInput,
): boolean {
	const x = Math.max(label.bounds.left, Math.min(bubble.x, label.bounds.right));
	const y = Math.max(label.bounds.top, Math.min(bubble.y, label.bounds.bottom));
	return ((bubble.x - x) ** 2) + ((bubble.y - y) ** 2) < bubble.radius ** 2;
}

test('placeBubbleLabels: separates labels for neighboring bubbles', () => {
	const bubbles = [
		{ x: 400, y: 160, radius: 16, label: 'Kimi K3' },
		{ x: 438, y: 154, radius: 12, label: 'Claude Sonnet 5' },
		{ x: 470, y: 158, radius: 8, label: 'GPT-5.6 Sol' },
	];
	const placements = placeBubbleLabels(bubbles, { left: 76, right: 836, top: 24, bottom: 286 });

	for (let i = 0; i < placements.length; i++) {
		for (let j = i + 1; j < placements.length; j++) {
			assert.equal(labelsOverlap(placements[i], placements[j]), false);
		}
		for (const bubble of bubbles) {
			assert.equal(labelIntersectsBubble(placements[i], bubble), false);
		}
	}
});

test('placeBubbleLabels: separates labels for near-overlapping bubbles clustered in a corner', () => {
	// Regression test: bubbles this close together (nearly touching, all near the
	// top-left corner) used to run out of usable label slots and overlap.
	const bubbles = [
		{ x: 245, y: 40, radius: 8, label: 'GPT-5.6 Terra' },
		{ x: 248, y: 40, radius: 12, label: 'GPT-5.6 Sol' },
		{ x: 300, y: 40, radius: 6, label: 'Claude Fable 5' },
	];
	const placements = placeBubbleLabels(bubbles, { left: 76, right: 836, top: 24, bottom: 286 });

	for (let i = 0; i < placements.length; i++) {
		for (let j = i + 1; j < placements.length; j++) {
			assert.equal(labelsOverlap(placements[i], placements[j]), false);
		}
	}
});

test('placeBubbleLabels: keeps long labels inside the chart bounds', () => {
	const bounds = { left: 76, right: 836, top: 24, bottom: 286 };
	const [placement] = placeBubbleLabels([
		{ x: 820, y: 40, radius: 8, label: 'A long model display name' },
	], bounds);

	assert.ok(placement.bounds.left >= bounds.left);
	assert.ok(placement.bounds.right <= bounds.right);
	assert.ok(placement.bounds.top >= bounds.top);
	assert.ok(placement.bounds.bottom <= bounds.bottom);
});
