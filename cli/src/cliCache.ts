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
const CACHE_VERSION = 14;

/**
 * Maximum number of entries to keep in the cache file. Must comfortably exceed the number of
 * sessions active in the stats window (current + previous month); heavy agent users easily
 * have a few thousand, and entries evicted here are re-parsed on every run.
 */
const MAX_CACHE_ENTRIES = 6000;

/**
 * While a long scan runs, save progress after this many newly parsed files or this much time,
 * so a scan that is killed or crashes doesn't make the next run start from zero.
 */
const CHECKPOINT_EVERY_ENTRIES = 100;
const CHECKPOINT_EVERY_MS = 15_000;

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

const CACHE_DIR = path.join(os.homedir(), '.copilot-token-tracker');
const CACHE_PATH = path.join(CACHE_DIR, 'cli-cache.json');

let cache: Map<string, CacheEntry> = new Map();
let cacheEnabled = true;
let dirty = false;
let checkpointsEnabled = false;
let entriesSinceSave = 0;
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

/** Save parsed sessions to disk periodically during a scan, not only when the command ends. */
export function enableCacheCheckpoints(): void {
	checkpointsEnabled = true;
	entriesSinceSave = 0;
	lastSaveAt = Date.now();
}

/** Load cache from disk. Safe to call multiple times — only loads once. */
export function loadCache(): void {
	if (!cacheEnabled) { return; }
	try {
		if (!fs.existsSync(CACHE_PATH)) { return; }
		const raw = fs.readFileSync(CACHE_PATH, 'utf-8');
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

/** Save cache to disk (only if entries were added/updated). */
export function saveCache(): void {
	if (!cacheEnabled || !dirty) { return; }
	try {
		cachePolicy.evict(cache);
		writeCacheFile(cache);
		dirty = false;
	} catch {
		// Best-effort — don't crash the CLI if cache write fails
	}
}

function writeCacheFile(entries: Map<string, CacheEntry>): void {
	fs.mkdirSync(CACHE_DIR, { recursive: true });
	const payload: CacheFile = {
		version: CACHE_VERSION,
		entries: Object.fromEntries(entries),
	};
	writeFileAtomic(CACHE_PATH, JSON.stringify(payload));
	entriesSinceSave = 0;
	lastSaveAt = Date.now();
}

/** Save progress mid-scan. Evicts on a copy so entries still in use by this run stay in memory. */
function checkpointCache(): void {
	try {
		const snapshot = new Map(cache);
		cachePolicy.evict(snapshot);
		writeCacheFile(snapshot);
	} catch {
		// Best-effort — the final saveCache() still runs at the end of the command
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
	entriesSinceSave++;
	if (checkpointsEnabled && (entriesSinceSave >= CHECKPOINT_EVERY_ENTRIES || Date.now() - lastSaveAt >= CHECKPOINT_EVERY_MS)) {
		checkpointCache();
	}
}

/** Return cache hit/miss stats for display. */
export function getCacheStats(): { entries: number; enabled: boolean } {
	return { entries: cache.size, enabled: cacheEnabled };
}
