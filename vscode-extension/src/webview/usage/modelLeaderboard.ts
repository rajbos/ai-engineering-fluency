const MIN_BUBBLE_RADIUS = 5;
const MAX_BUBBLE_RADIUS = 16;
const LABEL_HEIGHT = 12;
const LABEL_CHARACTER_WIDTH = 6;
const LABEL_GAP = 4;

export type BubbleLabelInput = {
	x: number;
	y: number;
	radius: number;
	label: string;
};

export type BubbleLabelBounds = {
	left: number;
	right: number;
	top: number;
	bottom: number;
};

export type BubbleLabelPlacement = {
	x: number;
	y: number;
	textAnchor: 'start' | 'middle' | 'end';
	bounds: { left: number; right: number; top: number; bottom: number };
};

/** Scales radius by the square root so bubble area, rather than diameter, represents the metric. */
export function scaleBubbleRadius(value: number, maxValue: number): number {
	if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(maxValue) || maxValue <= 0) {
		return MIN_BUBBLE_RADIUS;
	}
	const normalized = Math.min(value / maxValue, 1);
	return MIN_BUBBLE_RADIUS + Math.sqrt(normalized) * (MAX_BUBBLE_RADIUS - MIN_BUBBLE_RADIUS);
}

function createLabelPlacement(
	input: BubbleLabelInput,
	x: number,
	y: number,
	textAnchor: BubbleLabelPlacement['textAnchor'],
): BubbleLabelPlacement {
	const width = Math.max(18, Array.from(input.label).length * LABEL_CHARACTER_WIDTH);
	const left = textAnchor === 'start' ? x : textAnchor === 'end' ? x - width : x - width / 2;
	return {
		x,
		y,
		textAnchor,
		bounds: { left, right: left + width, top: y - 10, bottom: y - 10 + LABEL_HEIGHT },
	};
}

function getLabelCandidates(input: BubbleLabelInput, bounds: BubbleLabelBounds): BubbleLabelPlacement[] {
	const right = input.x + input.radius + LABEL_GAP;
	const left = input.x - input.radius - LABEL_GAP;
	const above = input.y - input.radius - 6;
	const below = input.y + input.radius + LABEL_HEIGHT;
	const sideY = input.y < bounds.top + 22 ? [input.y + 18, input.y - 10] : [input.y - 10, input.y + 18];
	return [
		createLabelPlacement(input, right, sideY[0], 'start'),
		createLabelPlacement(input, right, sideY[1], 'start'),
		createLabelPlacement(input, left, sideY[0], 'end'),
		createLabelPlacement(input, left, sideY[1], 'end'),
		createLabelPlacement(input, input.x, above, 'middle'),
		createLabelPlacement(input, input.x, below, 'middle'),
	];
}

function rectanglesOverlap(a: BubbleLabelPlacement['bounds'], b: BubbleLabelPlacement['bounds']): boolean {
	return a.left < b.right + 2 && a.right + 2 > b.left && a.top < b.bottom + 2 && a.bottom + 2 > b.top;
}

function intersectsBubble(rect: BubbleLabelPlacement['bounds'], bubble: BubbleLabelInput): boolean {
	const nearestX = Math.max(rect.left, Math.min(bubble.x, rect.right));
	const nearestY = Math.max(rect.top, Math.min(bubble.y, rect.bottom));
	const dx = bubble.x - nearestX;
	const dy = bubble.y - nearestY;
	return (dx * dx) + (dy * dy) < (bubble.radius + 2) ** 2;
}

function getPlacementPenalty(
	placement: BubbleLabelPlacement,
	placed: BubbleLabelPlacement[],
	bubbles: BubbleLabelInput[],
	bounds: BubbleLabelBounds,
): number {
	const rect = placement.bounds;
	const overflow = Math.max(0, bounds.left - rect.left) + Math.max(0, rect.right - bounds.right)
		+ Math.max(0, bounds.top - rect.top) + Math.max(0, rect.bottom - bounds.bottom);
	const labelCollisions = placed.filter(other => rectanglesOverlap(rect, other.bounds)).length;
	const bubbleCollisions = bubbles.filter(bubble => intersectsBubble(rect, bubble)).length;
	return overflow * 10_000 + bubbleCollisions * 1_000 + labelCollisions * 100;
}

/**
 * Places labels in priority order, preferring the existing upper-right position
 * while avoiding chart edges, bubbles, and labels that were already placed.
 */
export function placeBubbleLabels(inputs: BubbleLabelInput[], bounds: BubbleLabelBounds): BubbleLabelPlacement[] {
	const placed: BubbleLabelPlacement[] = [];
	for (const input of inputs) {
		const candidates = getLabelCandidates(input, bounds);
		const best = candidates.reduce((current, candidate) =>
			getPlacementPenalty(candidate, placed, inputs, bounds) < getPlacementPenalty(current, placed, inputs, bounds)
				? candidate
				: current
		);
		placed.push(best);
	}
	return placed;
}
