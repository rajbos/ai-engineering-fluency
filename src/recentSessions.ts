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
