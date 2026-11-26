/**
 * `segment` command - Output a compact token usage string for oh-my-posh.
 *
 * Maintains its own short-lived file cache (~/.copilot-token-tracker/omp-segment-cache.json)
 * so that repeated prompt renders return immediately without re-parsing session files.
 * The session file cache (cli-cache.json) is loaded automatically via the preAction hook
 * in cli.ts, so a cache miss here still benefits from the parsed-session cache.
 *
 * When the cached value has expired, the stale value is printed right away and a single
 * detached background process recomputes it. A lock file keeps prompts and statuslines that
 * refresh every few seconds from each starting their own full re-parse while one is running.
 */
import { Command, Option } from 'commander';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { discoverSessionFiles, calculateDetailedStats, formatTokens } from '../helpers';
import { writeFileAtomic } from '../cliCache';

const SEGMENT_CACHE_DIR = path.join(os.homedir(), '.copilot-token-tracker');
const SEGMENT_CACHE_PATH = path.join(SEGMENT_CACHE_DIR, 'omp-segment-cache.json');
const SEGMENT_LOCK_PATH = path.join(SEGMENT_CACHE_DIR, 'omp-segment-refresh.lock');
const DEFAULT_TTL_MINUTES = 5;
/**
 * A refresh lock is abandoned once its owner process has exited. This upper bound only guards
 * against a reused PID; a full first-time scan of a large session history can take many minutes.
 */
export const REFRESH_LOCK_MAX_AGE_MS = 60 * 60_000;

export interface SegmentCacheFile {
	updatedAt: string;
	formatted: string;
	todayTokens: number;
	thisMonthTokens: number;
	last30DaysTokens: number;
}

export interface SegmentCacheRead {
	entry: SegmentCacheFile;
	fresh: boolean;
}

/** Read the segment output cache. Returns null on miss or corrupt data; expired entries are returned with fresh=false. */
export function readSegmentCache(ttlMinutes: number, cachePath: string = SEGMENT_CACHE_PATH, now: number = Date.now()): SegmentCacheRead | null {
	try {
		if (!fs.existsSync(cachePath)) { return null; }
		const data: SegmentCacheFile = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));

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

		const ageMs = now - updatedMs;
		// Negative ages (clock skew) count as expired so the value gets recomputed
		const fresh = ageMs >= 0 && ageMs <= ttlMinutes * 60_000;

		return { entry: data, fresh };
	} catch {
		return null;
	}
}

/** Persist the segment output to the cache file. Best-effort — never throws. */
function writeSegmentCache(entry: SegmentCacheFile): void {
	try {
		fs.mkdirSync(SEGMENT_CACHE_DIR, { recursive: true });
		writeFileAtomic(SEGMENT_CACHE_PATH, JSON.stringify(entry));
	} catch {
		// Best-effort: cache write failures must not crash the prompt
	}
}

/** True when a process with this PID is running. EPERM means it exists but belongs to someone else. */
export function isProcessAlive(pid: number): boolean {
	if (!Number.isInteger(pid) || pid <= 0) { return false; }
	try {
		process.kill(pid, 0);
		return true;
	} catch (error) {
		return (error as NodeJS.ErrnoException).code === 'EPERM';
	}
}

interface LockSnapshot {
	content: string;
	mtimeMs: number;
}

function readLock(lockPath: string): LockSnapshot | null {
	let fd: number | undefined;
	try {
		fd = fs.openSync(lockPath, 'r');
		const { mtimeMs } = fs.fstatSync(fd);
		return { content: fs.readFileSync(fd, 'utf-8'), mtimeMs };
	} catch {
		return null;
	} finally {
		if (fd !== undefined) { fs.closeSync(fd); }
	}
}

/**
 * A lock is abandoned when the PID it names is no longer running, or when it is older than
 * maxAgeMs (guards against PID reuse). A lock without a readable PID (still being written)
 * only counts as abandoned once it is older than a few seconds.
 */
function isLockAbandoned(lock: LockSnapshot, maxAgeMs: number, now: number, isAlive: (pid: number) => boolean): boolean {
	const ageMs = now - lock.mtimeMs;
	if (ageMs > maxAgeMs) { return true; }
	const pid = Number.parseInt(lock.content, 10);
	if (!Number.isInteger(pid) || pid <= 0) { return ageMs > 5_000; }
	return !isAlive(pid);
}

/**
 * Remove an abandoned lock so that exactly one caller can take it over. The lock is first
 * renamed to a unique name (only one rename of the same file succeeds), and the renamed file
 * is checked to still be the lock judged abandoned; if a fresh lock was renamed by mistake it
 * is put back with linkSync, which fails rather than overwrite a lock created in the meantime.
 */
function removeAbandonedLock(lockPath: string, judged: LockSnapshot): boolean {
	const claimed = `${lockPath}.${process.pid}.${Date.now()}.stale`;
	try {
		fs.renameSync(lockPath, claimed);
	} catch {
		return false;
	}
	const renamed = readLock(claimed);
	if (!renamed || renamed.content !== judged.content || renamed.mtimeMs !== judged.mtimeMs) {
		try { fs.linkSync(claimed, lockPath); } catch { /* a newer lock exists; leave it */ }
		fs.rmSync(claimed, { force: true });
		return false;
	}
	fs.rmSync(claimed, { force: true });
	return true;
}

export interface LockOptions {
	maxAgeMs?: number;
	now?: number;
	isAlive?: (pid: number) => boolean;
	ownerPid?: number;
}

/**
 * Atomically create the refresh lock, recording ownerPid in it. Returns false when another
 * live refresh holds it. Abandoned locks (owner process gone, or older than maxAgeMs) are taken over.
 */
export function tryAcquireRefreshLock(lockPath: string = SEGMENT_LOCK_PATH, options: LockOptions = {}): boolean {
	const maxAgeMs = options.maxAgeMs ?? REFRESH_LOCK_MAX_AGE_MS;
	const isAlive = options.isAlive ?? isProcessAlive;
	const ownerPid = options.ownerPid ?? process.pid;
	try {
		fs.mkdirSync(path.dirname(lockPath), { recursive: true });
	} catch {
		return false;
	}
	for (let attempt = 0; attempt < 3; attempt++) {
		try {
			fs.writeFileSync(lockPath, String(ownerPid), { flag: 'wx' });
			return true;
		} catch (error) {
			if ((error as NodeJS.ErrnoException).code !== 'EEXIST') { return false; }
		}
		const lock = readLock(lockPath);
		if (lock && !isLockAbandoned(lock, maxAgeMs, options.now ?? Date.now(), isAlive)) { return false; }
		if (lock && !removeAbandonedLock(lockPath, lock)) { return false; }
	}
	return false;
}

/** Hand a held lock over to another process (e.g. the detached refresh worker). */
function transferRefreshLock(newOwnerPid: number, lockPath: string = SEGMENT_LOCK_PATH): void {
	try {
		fs.writeFileSync(lockPath, String(newOwnerPid));
	} catch {
		// If this fails the lock still names our PID and is taken over once we exit
	}
}

/** Remove the refresh lock if it is still owned by ownerPid. Best-effort — never throws. */
export function releaseRefreshLock(lockPath: string = SEGMENT_LOCK_PATH, ownerPid: number = process.pid): void {
	try {
		if (fs.readFileSync(lockPath, 'utf-8').trim() !== String(ownerPid)) { return; }
		fs.rmSync(lockPath, { force: true });
	} catch {
		// Best-effort: a leftover lock is taken over once its owner process is gone
	}
}

/**
 * Start a detached `segment --background-refresh` process that recomputes the cache and then
 * releases the lock. The caller must already hold the lock; ownership moves to the child.
 * Returns false if spawning failed.
 */
function spawnBackgroundRefresh(globalArgs: string[]): boolean {
	try {
		const child = spawn(process.execPath, [process.argv[1], ...globalArgs, 'segment', '--background-refresh'], {
			detached: true,
			stdio: 'ignore',
			windowsHide: true,
		});
		if (child.pid === undefined) { return false; }
		transferRefreshLock(child.pid);
		child.unref();
		return true;
	} catch {
		return false;
	}
}

/** Lower this process's CPU priority so a background refresh yields to interactive work. */
function lowerOwnPriority(): void {
	try {
		os.setPriority(os.constants.priority.PRIORITY_LOW);
	} catch {
		// Not permitted on some systems; the refresh still runs at normal priority
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
	backgroundRefresh?: boolean;
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

/** Detached worker: recompute the cache at low priority, then release the lock it was handed. */
async function runBackgroundRefresh(): Promise<void> {
	lowerOwnPriority();
	try {
		writeSegmentCache(await computeSegmentEntry());
	} finally {
		releaseRefreshLock();
	}
}

/** Recompute in this process, emit, and update the cache. */
async function computeAndEmit(options: SegmentOptions): Promise<void> {
	const entry = await computeSegmentEntry();
	writeSegmentCache(entry);
	emitSegment(entry, options, false);
}

/** Normal prompt path: never more than one full scan at a time across all terminals. */
async function serveSegment(options: SegmentOptions, ttl: number, globalArgs: string[]): Promise<void> {
	const cached = readSegmentCache(ttl);
	if (cached) {
		// Serve the cached value right away, even when expired; an expired value is
		// recomputed by one detached process instead of blocking every prompt render
		emitSegment(cached.entry, options, true);
		if (!cached.fresh && tryAcquireRefreshLock() && !spawnBackgroundRefresh(globalArgs)) {
			releaseRefreshLock();
		}
		return;
	}

	// No cached value yet: compute it here unless another refresh is already doing so
	if (!tryAcquireRefreshLock()) { return; }
	try {
		await computeAndEmit(options);
	} finally {
		releaseRefreshLock();
	}
}

export const segmentCommand = new Command('segment')
	.description('Output a compact token usage string for use in oh-my-posh prompt segments')
	.option('--ttl <minutes>', `Segment cache TTL in minutes (default: ${DEFAULT_TTL_MINUTES})`, `${DEFAULT_TTL_MINUTES}`)
	.option('--refresh', 'Force refresh — bypass the segment output cache')
	.option('--hide-zero', 'Output nothing when both today and 30-day token counts are zero')
	.option('--json', 'Output structured JSON (today/month/30d token counts) instead of the formatted string. Uses the same fast cache as the default output — recommended for custom prompt hooks (e.g. the PowerShell pre-prompt hook) instead of the uncached `usage --json` command.')
	// Internal: run by the detached process that refreshes an expired cache
	.addOption(new Option('--background-refresh').hideHelp())
	.action(async (options: SegmentOptions, command: Command) => {
		if (options.backgroundRefresh) {
			await runBackgroundRefresh();
			return;
		}
		if (options.refresh) {
			// (The preAction hook in cli.ts has already loaded the session file cache)
			await computeAndEmit(options);
			return;
		}

		const parsedTtl = Number(options.ttl);
		const ttl = Number.isFinite(parsedTtl) && parsedTtl >= 0 ? parsedTtl : DEFAULT_TTL_MINUTES;
		const globalArgs = command.parent?.opts().cache === false ? ['--no-cache'] : [];
		await serveSegment(options, ttl, globalArgs);
	});
