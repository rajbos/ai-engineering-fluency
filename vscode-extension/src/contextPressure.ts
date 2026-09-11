/**
 * Per-session context-exhaustion counters for a usage period.
 *
 * These counters carry two different denominators on purpose, and mixing them
 * up produces a plausible-looking but wrong number:
 *
 * - `sessionsConsidered` / `sessionsCompacted` cover every editor and session
 *   format, because a compaction or truncation signal is available everywhere.
 * - `sessionsNearLimit` / `sessionsWithFillData` are narrower: only Copilot
 *   CLI's `data.db` records the fill/limit pair a near-limit judgement needs,
 *   so they are counted against their own denominator rather than reusing
 *   `sessionsConsidered`.
 *
 * A session can be reported twice — once from its session-cache entry and once
 * from its `data.db` row — so the merge helpers take an `alreadyCounted` flag
 * to keep `sessionsConsidered` a true session count. Without it,
 * `sessionsNearLimit` could exceed `sessionsConsidered`.
 */
import { CONTEXT_NEAR_LIMIT_RATIO } from '../../src/types';
import type { UsageAnalysisPeriod } from '../../src/types';
import type { SessionFileCache } from '../../src/types';
import type { SessionContextWindow } from './copilotAppData';

export type ContextPressure = NonNullable<UsageAnalysisPeriod['contextPressure']>;

/** Get-or-create the contextPressure aggregate on a usage period. */
export function ensureContextPressure(period: UsageAnalysisPeriod): ContextPressure {
	if (!period.contextPressure) {
		period.contextPressure = { sessionsConsidered: 0, sessionsCompacted: 0, sessionsNearLimit: 0, sessionsWithFillData: 0 };
	}
	return period.contextPressure;
}

/** Automatic compaction/truncation events recorded for one session, across all formats. */
export function sessionCompactionEvents(sessionData: SessionFileCache): number {
	return (sessionData.truncationCount ?? 0)
		+ (sessionData.usageAnalysis?.toolCalls.byTool['__auto_compact__'] ?? 0);
}

/**
 * True when a session carries any usable context-window or compaction signal.
 * `truncationCount` is only written when it is non-zero, so it cannot stand in
 * for "this session has context data" on its own.
 */
export function hasContextSignal(sessionData: SessionFileCache): boolean {
	return !!sessionData.maxRequestInputTokens
		|| !!sessionData.contextTier
		|| sessionCompactionEvents(sessionData) > 0;
}

/** Count one session from its cache entry towards a period's pressure counters. */
export function mergeSessionContextPressure(period: UsageAnalysisPeriod, sessionData: SessionFileCache): void {
	if (!hasContextSignal(sessionData)) { return; }
	const cp = ensureContextPressure(period);
	cp.sessionsConsidered++;
	if (sessionCompactionEvents(sessionData) > 0) { cp.sessionsCompacted++; }
}

/**
 * Fold one data.db context row into a period's pressure counters.
 *
 * `alreadyCounted` is true when `mergeSessionContextPressure` already counted
 * this session from its session-cache signals; `compacted` sessions are
 * excluded from `sessionsNearLimit` because compaction resets the fill they
 * would be judged on, and they are already represented by `sessionsCompacted`.
 */
export function mergeDbContextPressure(
	period: UsageAnalysisPeriod, info: SessionContextWindow, alreadyCounted: boolean, compacted: boolean,
): void {
	const limit = info.contextWindowLimit;
	const reached = info.contextReachedTokens;
	const hasFill = !!limit && !!reached && reached > 0;
	// A tier-only row is still a context-bearing session, so it belongs in the
	// denominator even though there is no fill to measure it against.
	if (!hasFill && !info.contextTier) { return; }
	const cp = ensureContextPressure(period);
	if (!alreadyCounted) { cp.sessionsConsidered++; }
	if (!hasFill) { return; }
	cp.sessionsWithFillData++;
	const fillPercent = Math.min(100, Math.round((reached! / limit!) * 100));
	if (fillPercent > (cp.worstFillPercent ?? 0)) { cp.worstFillPercent = fillPercent; }
	if (!compacted && reached! >= limit! * CONTEXT_NEAR_LIMIT_RATIO) { cp.sessionsNearLimit++; }
}
