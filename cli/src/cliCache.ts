/**
 * File-based session cache for the CLI.
 * Stores parsed SessionData on disk so subsequent runs skip unchanged files.
 *
 * Cache file: ~/.copilot-token-tracker/cli-cache.json
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SessionData } from './helpers';
import { CliCachePolicy } from '../../src/cachePolicy';

/** Bump this when the SessionData shape changes to force a full re-parse. */
// 8 (main): SessionData gains copilotNanoAiu (exact Copilot billing).
// 9 (main): Copilot CLI shutdown modelMetrics are cumulative: stop summing them across resume.
// 10-11 (#2316): view attributes — repository, task fallback for empty classifications, editScope.
// 12 (#2316): all of the above in one version.
// 13 (#2316): deletion-only sessions keep their lines of code.
// 14 (#2483): Mistral Vibe sessions gain vendorStats and a wall-clock sessionDuration in their usage analysis.
// 15: Copilot app sessions that selected `auto` and were routed by Copilot Fusion count as `hydrafusion`.
const CACHE_VERSION = 15;

/**
 * Maximum number of entries to keep in the cache file. Real histories reach several thousand
 * session files (one Codex store alone had ~7,800), and a cap below that evicts and re-parses
 * the oldest sessions on every run (#2710). At roughly 1 KB per entry this bounds the file near 20 MB.
 */
export const MAX_CACHE_ENTRIES = 20_000;

/**
 * How often a run that is still parsing flushes the cache to disk. Without it, a run killed
 * before it finishes (a caller's timeout, Ctrl+C) discards everything it parsed, so the next
 * run starts from the same point and never converges (#2710).
 */
export const CACHE_SAVE_INTERVAL_MS = 30_000;

interface CacheEntry {
	/** File modification time (ms since epoch) */
	mtime: number;
	/** File size in bytes */
	size: number;
	/** Parsed session data (lastModified stored as ISO string) */
	data: Omit<SessionData, 'lastModified'> & { lastModified: string };
}

interface CacheFile {
	version: number;
	entries: Record<string, CacheEntry>;
}

/** Resolved on use (not at load) so tests can point the home directory at a temp folder. */
function cacheDir(): string { return path.join(os.homedir(), '.copilot-token-tracker'); }
export function getCachePath(): string { return path.join(cacheDir(), 'cli-cache.json'); }

let cache: Map<string, CacheEntry> = new Map();
let cacheEnabled = true;
let dirty = false;
let lastSaveAt = Date.now();

const cachePolicy = new CliCachePolicy<CacheEntry>(MAX_CACHE_ENTRIES);

/**
 * Write a file so readers never see a partial file: write a temporary file next to it, then
 * rename it over the target. Throws on failure; the temporary file is removed.
 */
export function writeFileAtomic(filePath: string, content: string): void {
	const tempPath = `${filePath}.${process.pid}.tmp`;
	try {
		fs.writeFileSync(tempPath, content, 'utf-8');
		fs.renameSync(tempPath, filePath);
	} catch (error) {
		fs.rmSync(tempPath, { force: true });
		throw error;
	}
}

/** Disable caching (e.g. when --no-cache is passed). */
export function disableCache(): void {
	cacheEnabled = false;
	cache.clear();
}

/** Load cache from disk. Safe to call multiple times — only loads once. */
export function loadCache(): void {
	if (!cacheEnabled) { return; }
	lastSaveAt = Date.now();
	try {
		const cachePath = getCachePath();
		if (!fs.existsSync(cachePath)) { return; }
		const raw = fs.readFileSync(cachePath, 'utf-8');
		const parsed: CacheFile = JSON.parse(raw);
		if (parsed.version !== CACHE_VERSION) {
			// Version mismatch — discard stale cache
			cache.clear();
			return;
		}
		cache = new Map(Object.entries(parsed.entries));
	} catch {
		// Corrupt / unreadable — start fresh
		cache.clear();
	}
}

/**
 * Save cache to disk (only if entries were added/updated since the last save).
 *
 * Written to a temp file and renamed over the cache, so a process killed mid-write (which an
 * incremental save makes likelier) leaves the previous cache intact rather than a truncated one.
 */
export function saveCache(): void {
	lastSaveAt = Date.now();
	if (!cacheEnabled || !dirty) { return; }
	const cachePath = getCachePath();
	const tmpPath = `${cachePath}.${process.pid}.tmp`;
	try {
		cachePolicy.evict(cache);

		fs.mkdirSync(cacheDir(), { recursive: true });
		const payload: CacheFile = {
			version: CACHE_VERSION,
			entries: Object.fromEntries(cache),
		};
		fs.writeFileSync(tmpPath, JSON.stringify(payload), 'utf-8');
		fs.renameSync(tmpPath, cachePath);
		dirty = false;
	} catch {
		// Best-effort — don't crash the CLI if cache write fails
		try { fs.unlinkSync(tmpPath); } catch { /* not created */ }
	}
}

/** Flushes the cache when the last save is {@link CACHE_SAVE_INTERVAL_MS} old, so long runs persist progress. */
function saveCacheIfDue(): void {
	if (Date.now() - lastSaveAt >= CACHE_SAVE_INTERVAL_MS) { saveCache(); }
}

/**
 * Save the cache before the process is stopped by SIGINT (Ctrl+C) or SIGTERM (a caller's
 * timeout on Linux/macOS), then exit with the conventional 128 + signal code. On Windows an
 * external kill cannot be intercepted, which is what the periodic save in {@link setCached}
 * covers. Call once from the CLI entry point; never from library code.
 */
export function saveCacheOnSignals(): void {
	for (const [signal, code] of [['SIGINT', 130], ['SIGTERM', 143]] as const) {
		process.once(signal, () => {
			saveCache();
			process.exit(code);
		});
	}
}

/**
 * Look up a cached result for a session file.
 * Returns the SessionData if the cache entry matches the file's current mtime and size,
 * or null if the file needs to be re-parsed.
 */
export function getCached(filePath: string, mtime: number, size: number): SessionData | null {
	if (!cacheEnabled) { return null; }
	const entry = cache.get(filePath);
	if (!entry) { return null; }
	if (!cachePolicy.isValid(entry, mtime, size)) { return null; }
	// Rehydrate the Date
	return {
		...entry.data,
		lastModified: new Date(entry.data.lastModified),
	};
}

/** Store a parsed result in the cache. */
export function setCached(filePath: string, mtime: number, size: number, data: SessionData): void {
	if (!cacheEnabled) { return; }
	dirty = true;
	cache.set(filePath, {
		mtime,
		size,
		data: {
			...data,
			lastModified: data.lastModified.toISOString(),
		},
	});
	saveCacheIfDue();
}

/** Return cache hit/miss stats for display. */
export function getCacheStats(): { entries: number; enabled: boolean } {
	return { entries: cache.size, enabled: cacheEnabled };
}
