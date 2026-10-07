/**
 * Keeps the per-tool outcome maps (completed / failed counts, latency histograms,
 * output tokens) when the usage webview re-sanitizes a stats payload on a live
 * `updateStats` refresh. `sanitizePeriod` in main.ts rebuilds `toolCalls` and
 * `mcpTools` from scratch, so without this the Tool execution sections would
 * render their empty state after the first refresh even though the host sent
 * the data (docs/adr/TOOL-EXECUTION-STATS.md).
 *
 * Only well-formed entries survive: finite numbers for counts, and histograms
 * with a finite `count`/`sumMs` and an all-numeric `buckets` array.
 */
import type { LatencyHistogram, McpToolUsage, ToolCallUsage } from '../shared/types';

function sanitizeCountMap(value: unknown): { [key: string]: number } | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) { return undefined; }
	const out: { [key: string]: number } = {};
	for (const [key, count] of Object.entries(value as Record<string, unknown>)) {
		if (typeof count === 'number' && Number.isFinite(count)) { out[key] = count; }
	}
	return out;
}

function sanitizeHistogram(value: unknown): LatencyHistogram | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) { return undefined; }
	const h = value as Record<string, unknown>;
	if (typeof h.count !== 'number' || !Number.isFinite(h.count) || !Array.isArray(h.buckets)) { return undefined; }
	if (!h.buckets.every(b => typeof b === 'number' && Number.isFinite(b))) { return undefined; }
	const sumMs = typeof h.sumMs === 'number' && Number.isFinite(h.sumMs) ? h.sumMs : 0;
	return { count: h.count, sumMs, buckets: [...(h.buckets as number[])] };
}

function sanitizeHistogramMap(value: unknown): { [key: string]: LatencyHistogram } | undefined {
	if (!value || typeof value !== 'object' || Array.isArray(value)) { return undefined; }
	const out: { [key: string]: LatencyHistogram } = {};
	for (const [key, histogram] of Object.entries(value as Record<string, unknown>)) {
		const clean = sanitizeHistogram(histogram);
		if (clean) { out[key] = clean; }
	}
	return out;
}

/** Drop `undefined` members so the spread leaves absent maps absent rather than present-but-undefined. */
function compact<T extends object>(obj: T): Partial<T> {
	return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

export function sanitizeToolOutcomeMaps(raw: Record<string, unknown>): Partial<ToolCallUsage> {
	return compact({
		outputTokensByTool: sanitizeCountMap(raw.outputTokensByTool),
		completedByTool: sanitizeCountMap(raw.completedByTool),
		failuresByTool: sanitizeCountMap(raw.failuresByTool),
		latencyByTool: sanitizeHistogramMap(raw.latencyByTool),
	});
}

export function sanitizeMcpOutcomeMaps(raw: Record<string, unknown>): Partial<McpToolUsage> {
	return compact({
		completedByServer: sanitizeCountMap(raw.completedByServer),
		failuresByServer: sanitizeCountMap(raw.failuresByServer),
		latencyByServer: sanitizeHistogramMap(raw.latencyByServer),
	});
}
