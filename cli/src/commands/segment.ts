/**
 * `segment` command - Output a compact token usage string for oh-my-posh.
 *
 * Maintains its own short-lived file cache (~/.copilot-token-tracker/omp-segment-cache.json)
 * so that repeated prompt renders return immediately without re-parsing session files.
 * The session file cache (cli-cache.json) is loaded automatically via the preAction hook
 * in cli.ts, so a cache miss here still benefits from the parsed-session cache.
 */
import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { discoverSessionFiles, calculateDetailedStats, formatTokens } from '../helpers';

const SEGMENT_CACHE_DIR = path.join(os.homedir(), '.copilot-token-tracker');
const SEGMENT_CACHE_PATH = path.join(SEGMENT_CACHE_DIR, 'omp-segment-cache.json');
const DEFAULT_TTL_MINUTES = 5;

interface SegmentCacheFile {
	updatedAt: string;
	formatted: string;
	todayTokens: number;
	thisMonthTokens: number;
	last30DaysTokens: number;
}

/** Read the segment output cache. Returns null on miss, expiry, or corrupt data. */
function readSegmentCache(ttlMinutes: number): SegmentCacheFile | null {
	try {
		if (!fs.existsSync(SEGMENT_CACHE_PATH)) { return null; }
		const data: SegmentCacheFile = JSON.parse(fs.readFileSync(SEGMENT_CACHE_PATH, 'utf-8'));

		// Validate shape before trusting any values
		if (
			typeof data.formatted !== 'string' ||
			typeof data.updatedAt !== 'string' ||
			typeof data.todayTokens !== 'number' ||
			typeof data.thisMonthTokens !== 'number' ||
			typeof data.last30DaysTokens !== 'number'
		) {
			return null;
		}

		const updatedMs = Date.parse(data.updatedAt);
		if (!Number.isFinite(updatedMs)) { return null; }

		const ageMs = Date.now() - updatedMs;
		// Reject negative ages (clock skew) and expired entries
		if (ageMs < 0 || ageMs > ttlMinutes * 60_000) { return null; }

		return data;
	} catch {
		return null;
	}
}

/** Persist the segment output to the cache file. Best-effort — never throws. */
function writeSegmentCache(entry: SegmentCacheFile): void {
	try {
		fs.mkdirSync(SEGMENT_CACHE_DIR, { recursive: true });
		fs.writeFileSync(SEGMENT_CACHE_PATH, JSON.stringify(entry), 'utf-8');
	} catch {
		// Best-effort: cache write failures must not crash the prompt
	}
}

/** Structured JSON payload emitted by `--json`. Same fields whether served from cache or freshly computed. */
export function buildJsonPayload(entry: SegmentCacheFile, cached: boolean): string {
	return JSON.stringify({
		today: entry.todayTokens,
		month: entry.thisMonthTokens,
		last30Days: entry.last30DaysTokens,
		todayFormatted: formatTokens(entry.todayTokens),
		monthFormatted: formatTokens(entry.thisMonthTokens),
		last30DaysFormatted: formatTokens(entry.last30DaysTokens),
		formatted: entry.formatted,
		updatedAt: entry.updatedAt,
		cached,
	});
}

interface SegmentOptions {
	ttl?: string;
	refresh?: boolean;
	hideZero?: boolean;
	json?: boolean;
}

/** Write the final segment output (JSON or formatted string), unless --hide-zero suppresses it. */
function emitSegment(entry: SegmentCacheFile, options: SegmentOptions, cached: boolean): void {
	if (options.hideZero && entry.todayTokens === 0 && entry.last30DaysTokens === 0) {
		return;
	}
	process.stdout.write(options.json ? buildJsonPayload(entry, cached) : entry.formatted);
}

/** Discover session files and compute today/month/30d token totals (cache-miss path). */
async function computeSegmentEntry(): Promise<SegmentCacheFile> {
	const files = await discoverSessionFiles();
	let todayTokens = 0;
	let thisMonthTokens = 0;
	let last30DaysTokens = 0;

	if (files.length > 0) {
		const stats = await calculateDetailedStats(files);
		todayTokens = stats.today.tokens;
		thisMonthTokens = stats.month.tokens;
		last30DaysTokens = stats.last30Days.tokens;
	}

	return {
		updatedAt: new Date().toISOString(),
		formatted: `${formatTokens(todayTokens)} today · ${formatTokens(thisMonthTokens)} month · ${formatTokens(last30DaysTokens)} 30d`,
		todayTokens,
		thisMonthTokens,
		last30DaysTokens,
	};
}

export const segmentCommand = new Command('segment')
	.description('Output a compact token usage string for use in oh-my-posh prompt segments')
	.option('--ttl <minutes>', `Segment cache TTL in minutes (default: ${DEFAULT_TTL_MINUTES})`, `${DEFAULT_TTL_MINUTES}`)
	.option('--refresh', 'Force refresh — bypass the segment output cache')
	.option('--hide-zero', 'Output nothing when both today and 30-day token counts are zero')
	.option('--json', 'Output structured JSON (today/month/30d token counts) instead of the formatted string. Uses the same fast cache as the default output — recommended for custom prompt hooks (e.g. the PowerShell pre-prompt hook) instead of the uncached `usage --json` command.')
	.action(async (options: SegmentOptions) => {
		const parsedTtl = Number(options.ttl);
		const ttl = Number.isFinite(parsedTtl) && parsedTtl >= 0 ? parsedTtl : DEFAULT_TTL_MINUTES;

		// Fast path: serve from the segment output cache when still fresh
		if (!options.refresh) {
			const cached = readSegmentCache(ttl);
			if (cached) {
				emitSegment(cached, options, true);
				return;
			}
		}

		// Cache miss — discover files and compute stats
		// (The preAction hook in cli.ts has already loaded the session file cache)
		const entry = await computeSegmentEntry();
		writeSegmentCache(entry);
		emitSegment(entry, options, false);
	});
