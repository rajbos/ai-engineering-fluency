export const RECENT_SESSION_PERIODS = ['last7', 'last30', 'currentMonth'] as const;

export type RecentSessionPeriod = typeof RECENT_SESSION_PERIODS[number];
export type SanitizedSessionSummary = Record<string, unknown> & { interactions: number };
export type SanitizedRecentSessionBuckets = Record<RecentSessionPeriod, SanitizedSessionSummary[]>;

export function sanitizeRecentSessionBuckets(raw: unknown): SanitizedRecentSessionBuckets | undefined {
	if (!raw || typeof raw !== 'object') { return undefined; }

	const source = raw as Record<string, unknown>;
	const result = {} as SanitizedRecentSessionBuckets;
	for (const period of RECENT_SESSION_PERIODS) {
		const sessions = source[period];
		if (!Array.isArray(sessions)) { return undefined; }
		result[period] = sessions.filter(
			(session): session is SanitizedSessionSummary =>
				!!session && typeof session === 'object' && typeof (session as Record<string, unknown>).interactions === 'number'
		);
	}
	return result;
}
