import type { AutomaticCompactionStats, ContextPressureStats, ContextWindowStats } from '../../../../src/types';

/**
 * Sanitizers for the Usage view's "Context Window" section.
 *
 * These aggregates arrive twice: once in the `__INITIAL_USAGE__` payload and
 * again on every `updateStats` refresh. The refresh path rebuilds each period
 * field by field, so anything not copied here is silently dropped and the
 * section empties out after the first refresh. Everything is rebuilt into a
 * fresh object rather than spread, so an untrusted payload cannot smuggle extra
 * fields into the render path.
 */

function finiteNumber(value: unknown): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function optionalFiniteNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/** Validated pass-through for a period's context-window aggregate. */
export function sanitizeContextWindow(raw: unknown): ContextWindowStats | undefined {
	if (!raw || typeof raw !== 'object') { return undefined; }
	const source = raw as Record<string, unknown>;

	const tierCounts: { [tier: string]: number } = {};
	if (source.tierCounts && typeof source.tierCounts === 'object') {
		for (const [tier, count] of Object.entries(source.tierCounts as Record<string, unknown>)) {
			tierCounts[tier] = finiteNumber(count);
		}
	}

	const maxReachedTokens = optionalFiniteNumber(source.maxReachedTokens);
	const maxReachedWindowLimit = optionalFiniteNumber(source.maxReachedWindowLimit);
	return {
		maxRequestInputTokens: finiteNumber(source.maxRequestInputTokens),
		maxRequestModels: Array.isArray(source.maxRequestModels)
			? source.maxRequestModels.filter((model): model is string => typeof model === 'string')
			: [],
		tierCounts,
		...(maxReachedTokens !== undefined ? { maxReachedTokens } : {}),
		...(maxReachedWindowLimit !== undefined ? { maxReachedWindowLimit } : {}),
	};
}

/** Validated pass-through for a period's per-session context-exhaustion counters. */
export function sanitizeContextPressure(raw: unknown): ContextPressureStats | undefined {
	if (!raw || typeof raw !== 'object') { return undefined; }
	const source = raw as Record<string, unknown>;
	const worstFillPercent = optionalFiniteNumber(source.worstFillPercent);
	return {
		sessionsConsidered: finiteNumber(source.sessionsConsidered),
		sessionsCompacted: finiteNumber(source.sessionsCompacted),
		sessionsNearLimit: finiteNumber(source.sessionsNearLimit),
		sessionsWithFillData: finiteNumber(source.sessionsWithFillData),
		...(worstFillPercent !== undefined ? { worstFillPercent } : {}),
	};
}

/** Validated pass-through for the trailing-week automatic-compaction totals. */
export function sanitizeAutomaticCompactions(raw: unknown): AutomaticCompactionStats | undefined {
	if (!raw || typeof raw !== 'object') { return undefined; }
	const source = raw as Record<string, unknown>;
	const bySource = (source.bySource && typeof source.bySource === 'object')
		? source.bySource as Record<string, unknown>
		: {};
	return {
		total: finiteNumber(source.total),
		bySource: {
			copilotCli: finiteNumber(bySource.copilotCli),
			claude: finiteNumber(bySource.claude),
		},
	};
}

/**
 * True when a period's context-window aggregate carries anything renderable.
 * The per-session pressure counters are judged separately, because a session
 * format can report compaction without ever reporting a window size.
 */
export function hasContextWindowData(cw: ContextWindowStats | undefined): boolean {
	return !!cw && (
		cw.maxRequestInputTokens > 0
		|| (cw.maxReachedTokens ?? 0) > 0
		|| Object.keys(cw.tierCounts).length > 0
	);
}
