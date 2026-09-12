import { getTimeWindowStartDayKey } from './timeWindows';

export type RecentSessionBuckets<T> = {
	last7: T[];
	last30: T[];
	currentMonth: T[];
};

export type RecentSessionBucketItem<T> = {
	activityKey: string;
	interactions: number;
	value: T;
};

export function buildRecentSessionBuckets<T>(
	items: RecentSessionBucketItem<T>[],
	now: Date,
): RecentSessionBuckets<T> {
	const last7Key = getTimeWindowStartDayKey('last7', now);
	const last30Key = getTimeWindowStartDayKey('last30', now);
	const monthKey = getTimeWindowStartDayKey('currentMonth', now);
	const buckets: RecentSessionBuckets<T> = { last7: [], last30: [], currentMonth: [] };

	for (const item of [...items].sort((a, b) => b.interactions - a.interactions)) {
		if (item.activityKey >= last7Key) { buckets.last7.push(item.value); }
		if (item.activityKey >= last30Key) { buckets.last30.push(item.value); }
		if (item.activityKey >= monthKey) { buckets.currentMonth.push(item.value); }
	}

	return buckets;
}

/** Placeholder key the per-turn efficiency counters use when a turn carries no model id. */
const UNKNOWN_MODEL_KEY = 'unknown';

/**
 * Returns every model a session actually used, token-attributed models first.
 *
 * `modelUsage` only lists models that produced an attributable usage record, so a model
 * that served turns without one is missing there while still being counted per turn in
 * `modelEfficiency`. The Recent Sessions Models column, its pill filters and the
 * HydraFusion badge all read this list, so both sources are unioned — otherwise a model
 * can rank in "Most used models locally" while no session row ever mentions it. The
 * `unknown` placeholder is dropped from the efficiency side: it is not a model anyone can
 * look up or filter on.
 */
export function collectSessionModelIds(
	modelUsage: { [model: string]: unknown } | undefined,
	modelEfficiency: { [model: string]: unknown } | undefined,
): string[] {
	const models = Object.keys(modelUsage ?? {});
	for (const model of Object.keys(modelEfficiency ?? {})) {
		if (model === UNKNOWN_MODEL_KEY || models.includes(model)) { continue; }
		models.push(model);
	}
	return models;
}
