/**
 * Day key helpers.
 *
 * A "day key" is an ISO-8601 date string: YYYY-MM-DD.
 *
 * Use `toLocalDayKey` for file-based session attribution and period comparisons
 * so that "today" reflects the user's local calendar day, not UTC.
 *
 * Use `toUtcDayKey` only for the Azure backend path where keys are stored in UTC.
 */

/** Returns the local-calendar YYYY-MM-DD key for a Date. */
export function toLocalDayKey(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}

/** Returns the UTC YYYY-MM-DD key for a Date. Only use for the Azure backend path. */
export function toUtcDayKey(date: Date): string {
	return date.toISOString().slice(0, 10);
}

export function addDaysUtc(dayKey: string, daysToAdd: number): string {
	const date = new Date(`${dayKey}T00:00:00.000Z`);
	date.setUTCDate(date.getUTCDate() + daysToAdd);
	return toUtcDayKey(date);
}

export function getDayKeysInclusive(startDayKey: string, endDayKey: string): string[] {
	const result: string[] = [];
	let current = startDayKey;
	while (current <= endDayKey) {
		result.push(current);
		if (current === endDayKey) {
			break;
		}
		current = addDaysUtc(current, 1);
	}
	return result;
}
