import type { ChartTimeWindow } from './types';

const ROLLING_WINDOW_DAYS: Partial<Record<ChartTimeWindow, number>> = {
	today: 1,
	last7: 7,
	last30: 30,
	last90: 90,
};

/** Returns the local-calendar start date for a chart time window, or null for all time. */
export function getTimeWindowStartDate(timeWindow: ChartTimeWindow, now: Date): Date | null {
	if (timeWindow === 'allTime') {
		return null;
	}
	if (timeWindow === 'currentMonth') {
		return new Date(now.getFullYear(), now.getMonth(), 1);
	}
	const days = ROLLING_WINDOW_DAYS[timeWindow];
	if (days === undefined) {
		return null;
	}
	return new Date(now.getFullYear(), now.getMonth(), now.getDate() - days + 1);
}

/** Formats a chart window's local start date as YYYY-MM-DD. */
export function getTimeWindowStartDayKey(timeWindow: ChartTimeWindow, now: Date): string {
	const start = getTimeWindowStartDate(timeWindow, now);
	if (!start) {
		return '0000-00-00';
	}
	return [
		start.getFullYear(),
		String(start.getMonth() + 1).padStart(2, '0'),
		String(start.getDate()).padStart(2, '0'),
	].join('-');
}

/** Formats the month containing a chart window's local start date as YYYY-MM. */
export function getTimeWindowStartMonthKey(timeWindow: ChartTimeWindow, now: Date): string {
	return timeWindow === 'allTime'
		? '0000-00'
		: getTimeWindowStartDayKey(timeWindow, now).slice(0, 7);
}
