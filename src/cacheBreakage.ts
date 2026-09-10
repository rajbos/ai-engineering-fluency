/**
 * Prompt-cache breakage detection (research feature).
 *
 * Providers that support prompt caching (Anthropic's Claude Code / Claude
 * Desktop today) bill a conversation's re-sent prefix at three different rates:
 * uncached input, cache *creation* (a premium over input), and cache *read*
 * (a large discount). In a healthy long session almost every token is a cache
 * read, so the interesting question is not "how much did caching save" — that
 * is decided by the provider — but **when did the cached prefix die, and why**.
 * That part is driven by user behaviour and is therefore actionable.
 *
 * When a prefix is invalidated the next request has to pay cache-creation
 * prices to re-write context it had already written once. This module finds
 * those moments and attributes each to a cause:
 *
 * - `model-switch`        — the model changed between turns. Each model keeps
 *                           its own cache, so switching mid-session re-warms
 *                           from scratch.
 * - `compaction`          — the client rewrote the history (Claude Code sets
 *                           `message.context_management`), which necessarily
 *                           invalidates every prefix built on it.
 * - `ttl-expiry`          — the gap since the previous turn exceeded the cache
 *                           TTL. The TTL is read per-turn from the entry type
 *                           actually used (`ephemeral_1h_input_tokens` > 0 means
 *                           1 hour, otherwise the 5-minute default) rather than
 *                           assumed, because Claude Code mixes both.
 * - `prefix-invalidated`  — none of the above: the cacheable prefix itself
 *                           changed. In practice this is the tool list or
 *                           system prompt moving underneath the conversation
 *                           (an MCP server or skill starting/stopping mid-session).
 *
 * ## Why the obvious detector does not work
 *
 * The tempting rule is "a break happened when `cacheRead(N)` is less than
 * `cacheRead(N-1) + cacheWrite(N-1)`". Measured against real logs that rule is
 * dominated by false positives, from two sources:
 *
 * 1. **Duplicate records.** Claude Code can log one API response twice under
 *    the same `message.id`, so an unfiltered scan sees a full prefix vanish and
 *    reappear. Callers MUST pass turns already de-duplicated by `message.id`
 *    (`ClaudeCodeDataAccess.deduplicateAssistantEvents` does this) — the same
 *    input the token/cost pipeline already uses.
 * 2. **Breakpoint shuffle.** A provider may hold only a handful of cache
 *    breakpoints, so tokens migrate between "read" and "written" from turn to
 *    turn with nothing actually invalidated. Observed drops of ~35% at
 *    sub-second gaps are routine and mean nothing.
 *
 * Both are excluded by requiring a *large* loss (`MIN_RETAINED_PREFIX_RATIO`)
 * against a prefix that was already *substantial* (`MIN_PREFIX_TOKENS`). Those
 * two constants are the whole difference between signal and noise here; see
 * their doc comments before touching them.
 *
 * The headline per-session number is `rewriteFactor` — cache-creation tokens
 * divided by the largest context the session ever held. 1.0 means every token
 * was written exactly once (ideal). 6.0 means the session paid to write its
 * context six times over.
 *
 * This module is intentionally pure (no VS Code API, no filesystem access) so
 * it can be unit-tested with mocked data and reused by the CLI and the webview.
 */

// ---------------------------------------------------------------------------
// Input shape
// ---------------------------------------------------------------------------

/**
 * Minimal structural view of one assistant turn's billing record.
 *
 * Deliberately provider-neutral: adapters map their own session format onto
 * this rather than this module learning about session formats. A turn without
 * usable cache numbers should simply be omitted by the adapter.
 */
export interface CacheTurn {
	/** Milliseconds since epoch for this turn. Used only for TTL gap checks. */
	timestamp: number;
	/** Normalized model id. A change between turns is treated as a cache reset. */
	model: string;
	/** Tokens billed as fresh (uncached, non-creation) input. */
	inputTokens: number;
	/** Tokens billed at the cache-read (discounted) rate. */
	cacheReadTokens: number;
	/** Tokens billed at the cache-creation (premium) rate. */
	cacheCreationTokens: number;
	/**
	 * Portion of `cacheCreationTokens` written under the 1-hour TTL. Presence of
	 * a non-zero value selects the 1-hour TTL for this turn's gap check.
	 */
	cacheCreation1hTokens?: number;
	/** True when the client rewrote/compacted history at this turn. */
	compacted?: boolean;
}

// ---------------------------------------------------------------------------
// Tuning constants
// ---------------------------------------------------------------------------

/**
 * A prefix smaller than this is not worth reporting on, and small prefixes are
 * where breakpoint-shuffle noise is proportionally worst. Chosen well above the
 * typical system-prompt-only prefix so session warm-up is not flagged.
 */
export const MIN_PREFIX_TOKENS = 20_000;

/**
 * Fraction of the previous turn's context that must survive as a cache read for
 * the prefix to count as intact. Below this we call it a break.
 *
 * Set at 0.5 because measured breakpoint shuffle tops out around a third of the
 * prefix while genuine invalidations drop to (near) zero. Raising this toward
 * 1.0 re-admits exactly the false positives documented above.
 */
export const MIN_RETAINED_PREFIX_RATIO = 0.5;

/** Anthropic's default ephemeral cache TTL, in milliseconds. */
export const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;

/** Anthropic's extended ephemeral cache TTL, in milliseconds. */
export const EXTENDED_CACHE_TTL_MS = 60 * 60 * 1000;

/** Cap on retained per-session break detail, mirroring MAX_MOMENTS_PER_SESSION. */
export const MAX_BREAKS_PER_SESSION = 50;

// ---------------------------------------------------------------------------
// Output shape
// ---------------------------------------------------------------------------

export type CacheBreakCause =
	| 'model-switch'
	| 'compaction'
	| 'ttl-expiry'
	| 'prefix-invalidated';

export interface CacheBreak {
	/** Index into the input array of the turn that paid for the re-write. */
	turnIndex: number;
	cause: CacheBreakCause;
	/** Model in effect at the turn that paid. */
	model: string;
	/** Tokens that were cached before the break and had to be written again. */
	tokensRewritten: number;
	/** Milliseconds since the previous turn. Meaningful mainly for `ttl-expiry`. */
	gapMs: number;
	/** TTL that applied at this turn, in ms — which one is chosen per-turn. */
	ttlMs: number;
	/** Previous model, present only when `cause` is `model-switch`. */
	previousModel?: string;
}

export type CacheBreakCounts = {
	[cause in CacheBreakCause]: { breaks: number; tokensRewritten: number };
};

export interface CacheBreakageResult {
	breaks: CacheBreak[];
	counts: CacheBreakCounts;
	/** Sum of `cacheCreationTokens` across the session. */
	tokensWritten: number;
	/** Largest single-turn context (input + read + creation) the session held. */
	peakContextTokens: number;
	/**
	 * `tokensWritten / peakContextTokens`. 1.0 is ideal — every token written
	 * once. 0 when the session never wrote a cache entry.
	 */
	rewriteFactor: number;
}

// ---------------------------------------------------------------------------
// Detection
// ---------------------------------------------------------------------------

export function createEmptyCacheBreakCounts(): CacheBreakCounts {
	return {
		'model-switch': { breaks: 0, tokensRewritten: 0 },
		'compaction': { breaks: 0, tokensRewritten: 0 },
		'ttl-expiry': { breaks: 0, tokensRewritten: 0 },
		'prefix-invalidated': { breaks: 0, tokensRewritten: 0 },
	};
}

/** Total context carried by a turn: everything the provider saw as prompt. */
function contextTokens(turn: CacheTurn): number {
	return turn.inputTokens + turn.cacheReadTokens + turn.cacheCreationTokens;
}

/**
 * TTL in force at `turn`. Anthropic bills 1-hour cache entries separately, so a
 * non-zero 1h creation count is a reliable marker that the longer TTL applies.
 */
function ttlForTurn(turn: CacheTurn): number {
	return (turn.cacheCreation1hTokens ?? 0) > 0 ? EXTENDED_CACHE_TTL_MS : DEFAULT_CACHE_TTL_MS;
}

/**
 * Classify a confirmed break. Order matters: a model switch or a compaction
 * fully explains the loss on its own, so neither should be misreported as a TTL
 * expiry just because the user also happened to be idle.
 */
function classifyBreak(current: CacheTurn, previous: CacheTurn, gapMs: number, ttlMs: number): CacheBreakCause {
	if (current.model !== previous.model) { return 'model-switch'; }
	if (current.compacted || previous.compacted) { return 'compaction'; }
	if (gapMs > ttlMs) { return 'ttl-expiry'; }
	return 'prefix-invalidated';
}

/**
 * Find prompt-cache invalidations across one session's assistant turns.
 *
 * `turns` must be in chronological order and already de-duplicated by the
 * provider's message id — see the module comment for why that is not optional.
 */
export function detectCacheBreakage(turns: CacheTurn[]): CacheBreakageResult {
	const counts = createEmptyCacheBreakCounts();
	const breaks: CacheBreak[] = [];
	let tokensWritten = 0;
	let peakContextTokens = 0;

	for (let i = 0; i < turns.length; i++) {
		const current = turns[i];
		tokensWritten += current.cacheCreationTokens;
		peakContextTokens = Math.max(peakContextTokens, contextTokens(current));

		if (i === 0) { continue; }
		const previous = turns[i - 1];
		const previousContext = contextTokens(previous);

		// Warm-up and tiny prefixes are excluded: proportional noise is highest
		// there and the absolute cost is negligible either way.
		if (previousContext < MIN_PREFIX_TOKENS) { continue; }
		if (current.cacheReadTokens >= MIN_RETAINED_PREFIX_RATIO * previousContext) { continue; }

		const gapMs = Math.max(0, current.timestamp - previous.timestamp);
		const ttlMs = ttlForTurn(current);
		const cause = classifyBreak(current, previous, gapMs, ttlMs);
		const tokensRewritten = previousContext - current.cacheReadTokens;

		counts[cause].breaks += 1;
		counts[cause].tokensRewritten += tokensRewritten;
		if (breaks.length < MAX_BREAKS_PER_SESSION) {
			breaks.push({
				turnIndex: i,
				cause,
				model: current.model,
				tokensRewritten,
				gapMs,
				ttlMs,
				...(cause === 'model-switch' ? { previousModel: previous.model } : {}),
			});
		}
	}

	return {
		breaks,
		counts,
		tokensWritten,
		peakContextTokens,
		rewriteFactor: peakContextTokens > 0 ? tokensWritten / peakContextTokens : 0,
	};
}

/** Accumulate one session's counts into a period total. */
export function mergeCacheBreakCounts(target: CacheBreakCounts, source: CacheBreakCounts | undefined): void {
	if (!source) { return; }
	for (const cause of Object.keys(target) as CacheBreakCause[]) {
		target[cause].breaks += source[cause].breaks;
		target[cause].tokensRewritten += source[cause].tokensRewritten;
	}
}

// ---------------------------------------------------------------------------
// Period aggregation
// ---------------------------------------------------------------------------

/** Cache-breakage totals across every session in a usage-analysis period. */
export interface CacheBreakagePeriodStats {
	counts: CacheBreakCounts;
	/** Sessions that reported cache data at all — the denominator for the rest. */
	sessionsAnalyzed: number;
	/** Sessions with at least one break. The complement is the healthy majority. */
	sessionsWithBreaks: number;
	/** Cache-creation tokens summed over the period. */
	tokensWritten: number;
	/**
	 * Sum of each session's peak context. Paired with `tokensWritten` this gives
	 * a period-level re-write factor; summing peaks (rather than averaging
	 * per-session factors) keeps large sessions weighted by their real size.
	 */
	peakContextTokens: number;
	/** Highest single-session `rewriteFactor` in the period. */
	worstRewriteFactor: number;
}

export function createEmptyCacheBreakagePeriodStats(): CacheBreakagePeriodStats {
	return {
		counts: createEmptyCacheBreakCounts(),
		sessionsAnalyzed: 0,
		sessionsWithBreaks: 0,
		tokensWritten: 0,
		peakContextTokens: 0,
		worstRewriteFactor: 0,
	};
}

/** Fold one session's detection result into a period total. */
export function mergeCacheBreakageIntoPeriod(target: CacheBreakagePeriodStats, session: CacheBreakageResult): void {
	mergeCacheBreakCounts(target.counts, session.counts);
	target.sessionsAnalyzed++;
	if (session.breaks.length > 0) { target.sessionsWithBreaks++; }
	target.tokensWritten += session.tokensWritten;
	target.peakContextTokens += session.peakContextTokens;
	target.worstRewriteFactor = Math.max(target.worstRewriteFactor, session.rewriteFactor);
}

/** Period-level re-write factor. 0 when nothing was written. */
export function periodRewriteFactor(stats: CacheBreakagePeriodStats): number {
	return stats.peakContextTokens > 0 ? stats.tokensWritten / stats.peakContextTokens : 0;
}

/** Total breaks across all causes. */
export function totalCacheBreaks(counts: CacheBreakCounts): number {
	return (Object.keys(counts) as CacheBreakCause[]).reduce((sum, c) => sum + counts[c].breaks, 0);
}

/** Total tokens re-written across all causes. */
export function totalTokensRewritten(counts: CacheBreakCounts): number {
	return (Object.keys(counts) as CacheBreakCause[]).reduce((sum, c) => sum + counts[c].tokensRewritten, 0);
}
