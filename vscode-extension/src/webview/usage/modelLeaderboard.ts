const MIN_BUBBLE_RADIUS = 5;
const MAX_BUBBLE_RADIUS = 16;

/** Scales radius by the square root so bubble area, rather than diameter, represents the metric. */
export function scaleBubbleRadius(value: number, maxValue: number): number {
	if (!Number.isFinite(value) || value <= 0 || !Number.isFinite(maxValue) || maxValue <= 0) {
		return MIN_BUBBLE_RADIUS;
	}
	const normalized = Math.min(value / maxValue, 1);
	return MIN_BUBBLE_RADIUS + Math.sqrt(normalized) * (MAX_BUBBLE_RADIUS - MIN_BUBBLE_RADIUS);
}
