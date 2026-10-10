/**
 * Programmatic entry point: `@rajbos/ai-engineering-fluency/session`.
 *
 * Per-session token usage and cost for a single session file, without shelling out to the
 * CLI. Parsing is the CLI's own processSessionFile (sessionProcessing.ts) and pricing is the
 * shared calculateEstimatedCost — nothing is reimplemented here (AGENTS.md, "CLI Must Reuse
 * Shared Functions").
 *
 * Library rules: no console output, no chalk/commander, never exits the process, and never
 * throws for a bad file (unknown or unparsable files resolve to null).
 *
 * Every exported type is declared in this file, so the emitted session.d.ts is
 * self-contained and does not leak internal module paths.
 */
import { processSessionFile, statSessionFile, getAuxiliarySourcesFingerprint, modelPricing } from '../sessionProcessing';
import { effectiveTokens, runWithConcurrency, type SessionData } from '../analysis';
import { calculateEstimatedCost } from '../../../src/tokenEstimation';
import { CliCachePolicy } from '../../../src/cachePolicy';

/** Token counts for one model within one session. */
export interface SessionModelTokens {
	/** Total input tokens, including cache reads and cache creation. */
	readonly inputTokens: number;
	readonly outputTokens: number;
	/** Portion of inputTokens served from the prompt cache. */
	readonly cachedReadTokens?: number;
	/** Portion of inputTokens written to the prompt cache. */
	readonly cacheCreationTokens?: number;
	/** Portion of cacheCreationTokens written with a 1-hour TTL (Anthropic). */
	readonly cacheCreation1hTokens?: number;
	readonly thinkingTokens?: number;
	/** Subset of the counts above from Copilot Auto-routed requests (not additional usage). */
	readonly autoRouting?: Omit<SessionModelTokens, 'autoRouting' | 'sessions'>;
	/** Always 0 for a single session; kept for shape compatibility with aggregated reports. */
	readonly sessions: number;
}

/** Per-model token counts, keyed by model id. */
export interface SessionModelUsage {
	readonly [model: string]: SessionModelTokens;
}

/** Token usage and cost for one session file. Returned objects are deeply frozen, hence readonly. */
export interface SessionUsage {
	/** The path that was analyzed, exactly as passed in. */
	readonly filePath: string;
	/** Friendly editor/tool name, e.g. 'Claude Code', 'Copilot CLI', 'VS Code'. */
	readonly editorSource: string;
	/** Number of user turns. */
	readonly interactions: number;
	/** Model ids that appear in modelUsage, sorted. */
	readonly models: readonly string[];
	readonly modelUsage: SessionModelUsage;
	/** Session token total: exact counts when the log has them, otherwise an estimate. */
	readonly totalTokens: number;
	/** Exact GitHub Copilot billed amount in nano-AI-units; 0 when unavailable. */
	readonly copilotNanoAiu: number;
	/** copilotNanoAiu / 1e9 (1 AI credit = $0.01); null when no exact amount is available. */
	readonly copilotCredits: number | null;
	/** Estimated USD cost from per-model token counts, at provider API rates and at Copilot rates. */
	readonly estimatedCostUsd: { readonly provider: number; readonly copilot: number };
	/** Session file modification time, ISO 8601. */
	readonly lastModified: string;
}

export interface AnalyzeSessionOptions {
	/**
	 * Use the in-memory cache (default true). Results are cached per path and reused while
	 * the file's mtime and size, and those of the side files it draws on (Copilot CLI billing
	 * store and OTel export, Copilot Chat debug logs), are unchanged, so polling an unchanged
	 * session costs a few stats.
	 * The library never reads or writes the CLI's on-disk cache.
	 */
	cache?: boolean;
}

/** nano-AI-units per GitHub Copilot AI credit (1 credit = $0.01 = 1e9 nanoAiu). */
const NANO_AIU_PER_CREDIT = 1e9;

/** Same bound the CLI's disk cache uses; eviction keeps the most recently modified files. */
const MAX_CACHE_ENTRIES = 2000;

interface CacheEntry {
	mtime: number;
	size: number;
	/** Fingerprint of the debug logs / billing store / OTel export the parse also read. */
	auxiliary: string;
	/** null records "not a session we can parse", so unknown files stay cheap too. */
	usage: SessionUsage | null;
}

const cache = new Map<string, CacheEntry>();
const cachePolicy = new CliCachePolicy<CacheEntry>(MAX_CACHE_ENTRIES);
/** Parses in flight, keyed by path + mtime + size, so concurrent polls share one parse. */
const inFlight = new Map<string, Promise<SessionUsage | null>>();

function deepFreeze<T>(value: T): T {
	if (value && typeof value === 'object' && !Object.isFrozen(value)) {
		Object.freeze(value);
		for (const child of Object.values(value)) { deepFreeze(child); }
	}
	return value;
}

function toSessionUsage(filePath: string, data: SessionData): SessionUsage {
	const nanoAiu = data.copilotNanoAiu ?? 0;
	return deepFreeze({
		filePath,
		editorSource: data.editorSource,
		interactions: data.interactions,
		models: Object.keys(data.modelUsage).sort(),
		modelUsage: data.modelUsage,
		totalTokens: effectiveTokens(data),
		copilotNanoAiu: nanoAiu,
		copilotCredits: nanoAiu > 0 ? nanoAiu / NANO_AIU_PER_CREDIT : null,
		estimatedCostUsd: {
			provider: calculateEstimatedCost(data.modelUsage, modelPricing, 'provider'),
			copilot: calculateEstimatedCost(data.modelUsage, modelPricing, 'copilot'),
		},
		lastModified: data.lastModified.toISOString(),
	});
}

/**
 * Whether a parse found any session activity. The parsers map malformed, non-session and
 * not-yet-started files to an all-zero SessionData rather than null (the CLI just counts
 * them as empty), so a result with no turns, tokens, models or billing is reported as null.
 */
function hasSessionActivity(data: SessionData): boolean {
	return data.interactions > 0
		|| effectiveTokens(data) > 0
		// Parsers may add a zero-token placeholder model (e.g. 'unknown'), so only count models with tokens.
		|| Object.values(data.modelUsage).some(m => m.inputTokens + m.outputTokens > 0)
		|| (data.copilotNanoAiu ?? 0) > 0;
}

async function parse(filePath: string): Promise<SessionUsage | null> {
	const data = await processSessionFile(filePath);
	return data && hasSessionActivity(data) ? toSessionUsage(filePath, data) : null;
}

/**
 * Analyze one session file (Claude Code `~/.claude/projects/<cwd>/<id>.jsonl`, Copilot CLI
 * `~/.copilot/session-state/<id>/events.jsonl`, VS Code chat sessions, and the other formats
 * the CLI supports). Resolves to null for missing, unknown, unparsable or oversized files, files
 * in the OS temp directory, and sessions with no recorded activity yet (no turns, tokens,
 * models or billing); never throws. A null for a growing file is re-checked once it changes.
 *
 * Returned objects are frozen and may be shared between calls.
 */
export async function analyzeSessionFile(filePath: string, options: AnalyzeSessionOptions = {}): Promise<SessionUsage | null> {
	try {
		if (options.cache === false) { return await parse(filePath); }

		const [stats, auxiliary] = await Promise.all([statSessionFile(filePath), getAuxiliarySourcesFingerprint(filePath)]);
		const mtime = stats.mtimeMs;
		const size = stats.size;
		const cached = cache.get(filePath);
		// The session file alone is not enough: Copilot CLI billing (session-store.db, OTel)
		// and Copilot Chat debug logs change without touching it.
		if (cached && cachePolicy.isValid(cached, mtime, size) && cached.auxiliary === auxiliary) { return cached.usage; }

		const key = `${filePath}\0${mtime}\0${size}\0${auxiliary}`;
		let pending = inFlight.get(key);
		if (!pending) {
			pending = parse(filePath).finally(() => inFlight.delete(key));
			inFlight.set(key, pending);
		}
		const usage = await pending;
		// Keyed by the pre-parse stats: if a source changed mid-parse, the next call sees a new
		// mtime/size or fingerprint and re-parses, so a stale entry never outlives the change.
		cache.set(filePath, { mtime, size, auxiliary, usage });
		cachePolicy.evict(cache);
		return usage;
	} catch {
		return null;
	}
}

/**
 * Analyze several session files concurrently. The result holds only the files that parsed;
 * missing, unknown or unparsable files are left out.
 */
export async function analyzeSessionFiles(filePaths: string[], options: AnalyzeSessionOptions = {}): Promise<Map<string, SessionUsage>> {
	const unique = [...new Set(filePaths)];
	const results = await runWithConcurrency(unique, file => analyzeSessionFile(file, options));
	const byPath = new Map<string, SessionUsage>();
	unique.forEach((file, i) => {
		const usage = results[i];
		if (usage) { byPath.set(file, usage); }
	});
	return byPath;
}
