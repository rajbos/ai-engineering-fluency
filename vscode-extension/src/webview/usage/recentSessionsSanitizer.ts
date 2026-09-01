import type { TodaySessionSummary } from '../../../../src/types';

export const RECENT_SESSION_PERIODS = ['last7', 'last30', 'currentMonth'] as const;

export type RecentSessionPeriod = typeof RECENT_SESSION_PERIODS[number];
export type SanitizedRecentSessionBuckets = Record<RecentSessionPeriod, TodaySessionSummary[]>;

const REQUIRED_NUMBER_FIELDS = [
	'interactions',
	'toolCalls',
	'inputTokens',
	'outputTokens',
	'thinkingTokens',
	'cachedTokens',
	'totalTokens',
	'estimatedCost',
] as const;

const OPTIONAL_NUMBER_FIELDS = [
	'truncationCount',
	'maxRequestInputTokens',
	'contextWindowLimit',
	'contextReachedTokens',
	'durationMs',
	'activeDurationMs',
	'subAgentCalls',
] as const;

const OPTIONAL_STRING_FIELDS = ['contextTier', 'workspace'] as const;

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value);
}

function isTodaySessionSummary(value: unknown): value is TodaySessionSummary {
	if (!value || typeof value !== 'object') { return false; }

	const session = value as Record<string, unknown>;
	if (session.title !== null && typeof session.title !== 'string') { return false; }
	if (typeof session.filePath !== 'string' || typeof session.editor !== 'string' || typeof session.lastActivity !== 'string') {
		return false;
	}
	if (!Array.isArray(session.models) || !session.models.every(model => typeof model === 'string')) { return false; }
	if (!REQUIRED_NUMBER_FIELDS.every(field => isFiniteNumber(session[field]))) { return false; }
	if (!OPTIONAL_NUMBER_FIELDS.every(field => session[field] === undefined || isFiniteNumber(session[field]))) { return false; }
	return OPTIONAL_STRING_FIELDS.every(field => session[field] === undefined || typeof session[field] === 'string');
}

export function sanitizeRecentSessionBuckets(raw: unknown): SanitizedRecentSessionBuckets | undefined {
	if (!raw || typeof raw !== 'object') { return undefined; }

	const source = raw as Record<string, unknown>;
	const result = {} as SanitizedRecentSessionBuckets;
	for (const period of RECENT_SESSION_PERIODS) {
		const sessions = source[period];
		if (!Array.isArray(sessions)) { return undefined; }
		result[period] = sessions.filter(isTodaySessionSummary);
	}
	return result;
}
