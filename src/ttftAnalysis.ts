/**
 * Buckets raw time-to-first-token samples (see extractTtftSamplesFromDebugLog in
 * tokenEstimation.ts) into day/week/month averages, overall and per model, for the
 * Diagnostics Report's Research > TTFT tab. Pure aggregation — no file I/O; the extension
 * host collects TtftSample[] across many sessions' debug logs and passes them in here.
 */
import type { TtftSample } from './tokenEstimation';

export type TtftGranularity = 'day' | 'week' | 'month';

/** Average TTFT and sample count for one model within one bucket. */
export interface TtftModelBucketStat {
	avgSeconds: number;
	count: number;
}

/** One point on the TTFT trendline — a day, ISO week, or calendar month. */
export interface TtftBucket {
	/** Sort key (e.g. "2026-09-05", "2026-09-01" for the week's Monday, "2026-09" for the month). */
	key: string;
	/** Display label. */
	label: string;
	avgSeconds: number;
	count: number;
	byModel: Record<string, TtftModelBucketStat>;
}

/** One model's TTFT series, aligned index-for-index with the TtftBucket[] it was built from. */
export interface TtftModelSeries {
	model: string;
	/** null where this model had no samples in that bucket — render as a gap, not zero. */
	data: (number | null)[];
}

function fmtDayKey(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getMondayOfWeek(d: Date): Date {
	const copy = new Date(d);
	copy.setHours(0, 0, 0, 0);
	const day = copy.getDay();
	copy.setDate(copy.getDate() - (day === 0 ? 6 : day - 1));
	return copy;
}

function fmtWeekLabel(monday: Date): string {
	const sunday = new Date(monday);
	sunday.setDate(monday.getDate() + 6);
	if (monday.getMonth() === sunday.getMonth()) {
		return `${monday.toLocaleDateString('en-US', { month: 'short' })} ${monday.getDate()}–${sunday.getDate()}`;
	}
	return `${monday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}–${sunday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
}

/** Returns the bucket key + display label the given local day falls into for a granularity. */
function bucketKeyAndLabel(dayDate: Date, granularity: TtftGranularity): { key: string; label: string } {
	if (granularity === 'week') {
		const monday = getMondayOfWeek(dayDate);
		return { key: fmtDayKey(monday), label: fmtWeekLabel(monday) };
	}
	if (granularity === 'month') {
		const key = `${dayDate.getFullYear()}-${String(dayDate.getMonth() + 1).padStart(2, '0')}`;
		return { key, label: dayDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) };
	}
	const key = fmtDayKey(dayDate);
	return { key, label: key };
}

interface Accumulator {
	sum: number;
	count: number;
	byModel: Map<string, { sum: number; count: number }>;
}

/**
 * Buckets raw TTFT samples into day/week/month averages, overall and per model.
 *
 * Unlike chartDataBuilder.ts's token charts, there is no fixed trailing window (30 days /
 * 6 weeks / 12 months) — the bucket range simply spans from the earliest sample to the
 * latest, because how far back TTFT history exists depends entirely on how long VS Code
 * happens to have kept the user's debug logs, not on anything this extension controls.
 */
export function buildTtftBuckets(samples: TtftSample[], granularity: TtftGranularity): TtftBucket[] {
	if (samples.length === 0) { return []; }
	const buckets = new Map<string, { label: string; acc: Accumulator }>();
	for (const s of samples) {
		const { key, label } = bucketKeyAndLabel(new Date(s.tsMs), granularity);
		let entry = buckets.get(key);
		if (!entry) {
			entry = { label, acc: { sum: 0, count: 0, byModel: new Map() } };
			buckets.set(key, entry);
		}
		entry.acc.sum += s.ttftSeconds;
		entry.acc.count++;
		const modelEntry = entry.acc.byModel.get(s.model) ?? { sum: 0, count: 0 };
		modelEntry.sum += s.ttftSeconds;
		modelEntry.count++;
		entry.acc.byModel.set(s.model, modelEntry);
	}
	return Array.from(buckets.entries())
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([key, { label, acc }]) => {
			const byModel: Record<string, TtftModelBucketStat> = {};
			for (const [model, m] of acc.byModel) { byModel[model] = { avgSeconds: m.sum / m.count, count: m.count }; }
			return { key, label, avgSeconds: acc.sum / acc.count, count: acc.count, byModel };
		});
}

/**
 * Builds one trendline series per model, aligned to `buckets`' order. Caps at `maxModels`
 * (ranked by total sample count) so a long tail of rarely-used models doesn't turn the chart
 * into unreadable noise — the dropped tail is not folded into an "Other" average, since
 * averaging TTFT across dissimilar models would be misleading.
 */
export function buildTtftModelSeries(buckets: TtftBucket[], maxModels: number = 6): TtftModelSeries[] {
	const totals = new Map<string, number>();
	for (const b of buckets) {
		for (const [model, stat] of Object.entries(b.byModel)) {
			totals.set(model, (totals.get(model) ?? 0) + stat.count);
		}
	}
	const topModels = Array.from(totals.entries())
		.sort((a, b) => b[1] - a[1])
		.slice(0, maxModels)
		.map(([model]) => model);
	return topModels.map(model => ({
		model,
		data: buckets.map(b => b.byModel[model] ? b.byModel[model].avgSeconds : null),
	}));
}
