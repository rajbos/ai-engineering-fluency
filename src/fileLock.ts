/**
 * Editor-neutral advisory file lock (a lease), shared by every host.
 *
 * The lock is a small JSON file created atomically with `wx` (O_EXCL / CREATE_NEW), so exactly one
 * contender wins the create. The holder is identified by an injected {@link LockOwner} (the VS Code
 * window's `vscode.env.sessionId`, the desktop app's per-process id, a test's fixed string), never
 * by a module-level global, so this file has no host dependency and several owners can coexist in
 * one process (which is how the tests race two "hosts").
 *
 * A lock that is held is broken (taken over) when any of these is true:
 *
 * - **Dead owner** — the recorded pid no longer exists, or, on Windows, it was recycled by a
 *   process that is clearly not one of our hosts (see {@link defaultIsOwnerAlive}).
 * - **Silent owner** — the heartbeat `timestamp` is older than `staleMs` (default 5 minutes): the
 *   process is frozen, suspended, or crashed in a way the pid check cannot see.
 * - **Stuck owner** — the holder declared a `stallMs` and its `progressAt` is older than that. The
 *   heartbeat alone only proves the process (its timer) is alive, not that the work the lock
 *   protects is progressing: a parse wedged on an await that never settles keeps renewing the
 *   timestamp forever. Holders that report progress via {@link renewFileLock}'s `progress` flag let
 *   peers tell "busy" from "hung".
 * - **Overlong hold** — the holder declared a `maxHoldMs` and `acquiredAt` is older than that: a
 *   hard backstop for work that cannot report fine-grained progress.
 * - **Corrupt** — the content cannot be parsed (e.g. the owner died between the atomic create and
 *   the write). Without breaking it every future acquire would fail forever.
 *
 * The `sessionId` / `pid` / `timestamp` field names are kept from the original VS Code-only lock so
 * a newer host and an older extension build still understand each other's lock files; the extra
 * fields are optional and ignored by older readers.
 *
 * Renew and release are owner-only: they read the file first and do nothing unless it still names
 * this owner, so a holder that was taken over can never delete or overwrite its successor's lock.
 * (The read-then-write in renew is not atomic; the window is a few microseconds and the worst case
 * is one heartbeat re-stamping a lock that was broken in that instant, which the next contender's
 * staleness check resolves.)
 */
import * as fs from 'fs';
import * as path from 'path';
import { execFileSync } from 'child_process';

/** Who holds (or wants) a lock. */
export interface LockOwner {
	/** Unique per holder (per window / per process). Stored as `sessionId` in the file. */
	id: string;
	/** OS process id of the holder, used for the dead-owner check. */
	pid: number;
	/** Human-readable host label (e.g. `vscode-insiders`, `desktop`); diagnostics only. */
	host?: string;
}

/** On-disk lock content. Every field except `timestamp` is optional for backward compatibility. */
export interface LockRecord {
	sessionId?: unknown;
	pid?: unknown;
	/** Last heartbeat (ms since epoch). */
	timestamp: number;
	/** When the current holder acquired the lock. */
	acquiredAt?: number;
	/** Last time the holder reported progress on the protected work. */
	progressAt?: number;
	/** Holder-declared progress deadline; see the module doc comment. */
	stallMs?: number;
	/** Holder-declared hard cap on how long it may hold the lock. */
	maxHoldMs?: number;
	host?: string;
	/** Free-form, holder-defined extras (e.g. what it is publishing). Never interpreted here. */
	meta?: Record<string, unknown>;
}

export interface FileLockOptions {
	/** Heartbeat silence after which a lock is stale. Default 5 minutes. */
	staleMs?: number;
	/** Progress deadline to record when acquiring. Omitted = no stall detection for this lock. */
	stallMs?: number;
	/** Hard hold cap to record when acquiring. Omitted = no cap. */
	maxHoldMs?: number;
	/** Extra metadata to record when acquiring. */
	meta?: Record<string, unknown>;
	/** Clock, injectable for tests. */
	now?: () => number;
	/** Owner liveness check, injectable for tests. Defaults to {@link defaultIsOwnerAlive}. */
	isOwnerAlive?: (pid: unknown) => boolean;
	/** Diagnostic log sink. */
	log?: (message: string) => void;
	/** Sink for unexpected I/O errors while acquiring. Defaults to `log`. */
	warn?: (message: string) => void;
}

export const DEFAULT_LOCK_STALE_MS = 5 * 60 * 1000;

/** Why a held lock may be taken over, or `undefined` when it is live. */
export type LockBreakReason = 'corrupt' | 'dead-owner' | 'heartbeat-stale' | 'stalled' | 'max-hold-exceeded';

/** Parse lock content; `undefined` for anything that is not a usable record. */
export function parseLockRecord(content: string): LockRecord | undefined {
	try {
		const lock = JSON.parse(content);
		if (!lock || typeof lock !== 'object' || typeof lock.timestamp !== 'number') { return undefined; }
		return lock as LockRecord;
	} catch {
		return undefined;
	}
}

/** Read a lock file. `undefined` when missing; `null` when present but corrupt. */
export async function readFileLock(lockPath: string): Promise<LockRecord | null | undefined> {
	let content: string;
	try {
		content = await fs.promises.readFile(lockPath, 'utf-8');
	} catch {
		return undefined;
	}
	return parseLockRecord(content) ?? null;
}

/**
 * Decide whether a held lock can be broken. Pure apart from the liveness probe, so the takeover
 * rules can be tested directly.
 */
export function evaluateLock(record: LockRecord | null, options: FileLockOptions = {}): LockBreakReason | undefined {
	if (!record) { return 'corrupt'; }
	const now = (options.now ?? Date.now)();
	const isOwnerAlive = options.isOwnerAlive ?? defaultIsOwnerAlive;
	if (!isOwnerAlive(record.pid)) { return 'dead-owner'; }
	if (now - record.timestamp > (options.staleMs ?? DEFAULT_LOCK_STALE_MS)) { return 'heartbeat-stale'; }
	return evaluateHolderLimits(record, now);
}

/** The holder-declared progress deadline and hold cap; legacy records declare neither. */
function evaluateHolderLimits(record: LockRecord, now: number): LockBreakReason | undefined {
	const acquiredAt = typeof record.acquiredAt === 'number' ? record.acquiredAt : undefined;
	if (typeof record.stallMs === 'number') {
		const lastProgress = typeof record.progressAt === 'number' ? record.progressAt : (acquiredAt ?? record.timestamp);
		if (now - lastProgress > record.stallMs) { return 'stalled'; }
	}
	if (typeof record.maxHoldMs === 'number' && acquiredAt !== undefined && now - acquiredAt > record.maxHoldMs) {
		return 'max-hold-exceeded';
	}
	return undefined;
}

function buildRecord(owner: LockOwner, options: FileLockOptions): LockRecord {
	const now = (options.now ?? Date.now)();
	const record: LockRecord = { sessionId: owner.id, pid: owner.pid, timestamp: now, acquiredAt: now, progressAt: now };
	if (owner.host !== undefined) { record.host = owner.host; }
	if (options.stallMs !== undefined) { record.stallMs = options.stallMs; }
	if (options.maxHoldMs !== undefined) { record.maxHoldMs = options.maxHoldMs; }
	if (options.meta !== undefined) { record.meta = options.meta; }
	return record;
}

/** Atomic create. Resolves true on success, false on a non-EEXIST failure; rethrows EEXIST. */
async function createLockFile(lockPath: string, owner: LockOwner, options: FileLockOptions): Promise<boolean> {
	try {
		await fs.promises.writeFile(lockPath, JSON.stringify(buildRecord(owner, options)), { flag: 'wx' });
		return true;
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException)?.code === 'EEXIST') { throw err; }
		return false;
	}
}

const BREAK_MESSAGES: Record<LockBreakReason, string> = {
	'corrupt': 'unparseable content',
	'dead-owner': 'owner process no longer running',
	'heartbeat-stale': 'heartbeat stale',
	'stalled': 'holder alive but made no progress',
	'max-hold-exceeded': 'holder exceeded its maximum hold time',
};

/**
 * Try to take the lock. Returns true when this owner now holds it, false when a live holder has it
 * (or the file system refused). Breaks a dead, stale, stuck or corrupt lock and then competes for
 * the fresh create like any other contender, so two hosts breaking the same stale lock at once
 * still produce exactly one winner.
 */
export async function acquireFileLock(lockPath: string, owner: LockOwner, options: FileLockOptions = {}): Promise<boolean> {
	const log = options.log ?? (() => { /* silent */ });
	try {
		await fs.promises.mkdir(path.dirname(lockPath), { recursive: true });
		return await createLockFile(lockPath, owner, options);
	} catch (err: unknown) {
		if ((err as NodeJS.ErrnoException)?.code !== 'EEXIST') {
			const message = err instanceof Error ? err.message : String(err);
			(options.warn ?? log)(`Unexpected error acquiring lock ${path.basename(lockPath)}: ${message}`);
			return false;
		}
	}
	const record = await readFileLock(lockPath);
	if (record === undefined) {
		// Released between our create attempt and the read: one more try, no loop.
		try { return await createLockFile(lockPath, owner, options); } catch { return false; }
	}
	if (!evaluateLock(record, options)) { return false; }
	return breakAndAcquire(lockPath, owner, options, log);
}

/** A break mutex older than this belongs to a contender that died mid-break. */
const BREAK_MUTEX_STALE_MS = 30 * 1000;

/**
 * Break a lock judged breakable and take it, under a short-lived `<lock>.break` mutex. Without the
 * mutex two contenders that both read the same stale record could each delete and recreate the
 * lock, the second deleting the first's brand-new lock, and both would report success. Under the
 * mutex the lock is re-read and re-judged, so a contender that arrives after another already broke
 * it sees the fresh lock and backs off.
 */
async function breakAndAcquire(lockPath: string, owner: LockOwner, options: FileLockOptions, log: (m: string) => void): Promise<boolean> {
	const mutexPath = `${lockPath}.break`;
	try {
		await fs.promises.writeFile(mutexPath, JSON.stringify({ sessionId: owner.id, pid: owner.pid, timestamp: (options.now ?? Date.now)() }), { flag: 'wx' });
	} catch {
		// Another contender is breaking it right now (or died doing so: clear that for the next try).
		try {
			const stat = await fs.promises.stat(mutexPath);
			if (Date.now() - stat.mtimeMs > BREAK_MUTEX_STALE_MS) { await fs.promises.unlink(mutexPath); }
		} catch { /* gone already */ }
		return false;
	}
	try {
		const record = await readFileLock(lockPath);
		if (record !== undefined) {
			const reason = evaluateLock(record, options);
			if (!reason) { return false; }
			log(`Breaking lock ${path.basename(lockPath)} (${BREAK_MESSAGES[reason]}${record?.host ? `, held by ${record.host}` : ''})`);
			try { await fs.promises.unlink(lockPath); } catch { /* removed by its owner meanwhile */ }
		}
		try { return await createLockFile(lockPath, owner, options); } catch { return false; }
	} finally {
		try { await fs.promises.unlink(mutexPath); } catch { /* already gone */ }
	}
}

/**
 * Heartbeat: re-stamp `timestamp`, and `progressAt` when `progress` is true. Only touches a lock
 * this owner still holds. Returns whether this owner still holds the lock afterwards.
 */
export async function renewFileLock(
	lockPath: string,
	owner: LockOwner,
	renew: { progress?: boolean } = {},
	options: Pick<FileLockOptions, 'now'> = {},
): Promise<boolean> {
	const record = await readFileLock(lockPath);
	if (!record || record.sessionId !== owner.id) { return false; }
	const now = (options.now ?? Date.now)();
	const next: LockRecord = { ...record, pid: owner.pid, timestamp: now };
	if (renew.progress) { next.progressAt = now; }
	try {
		await fs.promises.writeFile(lockPath, JSON.stringify(next));
		return true;
	} catch {
		return false;
	}
}

/** Delete the lock, but only when this owner holds it. */
export async function releaseFileLock(lockPath: string, owner: LockOwner): Promise<void> {
	const record = await readFileLock(lockPath);
	if (!record || record.sessionId !== owner.id) { return; }
	try { await fs.promises.unlink(lockPath); } catch { /* already gone */ }
}

/** Image names of processes that can hold our locks: VS Code forks, Electron, the desktop app. */
const HOST_IMAGE_PATTERN = /code|codium|electron|windsurf|cursor|kiro|antigravity|vibe|tray|fluency/;

/**
 * Default owner liveness probe. A pid that is gone is dead. A live pid is not enough on its own on
 * Windows, which recycles pids aggressively: after a reboot or crash a stale lock can look "owned"
 * by an unrelated new process. There, a live pid only counts when it is this process or its image
 * is one of our host processes. Any probe failure assumes alive, so a lock in genuine use is never
 * broken by a flaky check (the heartbeat timeout still applies).
 */
export function defaultIsOwnerAlive(pid: unknown): boolean {
	if (typeof pid !== 'number') { return true; }
	try {
		process.kill(pid, 0);
	} catch (killErr: unknown) {
		if ((killErr as NodeJS.ErrnoException)?.code === 'ESRCH') { return false; }
		return true; // EPERM: exists, owned by another user
	}
	if (process.platform === 'win32') {
		return pid === process.pid || isWindowsHostProcess(pid);
	}
	return true;
}

function isWindowsHostProcess(pid: number): boolean {
	try {
		const out = execFileSync(
			'tasklist',
			['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'],
			{ encoding: 'utf-8', timeout: 5000, windowsHide: true },
		);
		// No match → "INFO: No tasks are running which match the specified criteria."
		if (!out.startsWith('"')) { return false; }
		const image = (out.split('","')[0] ?? '').replace(/^"/, '').toLowerCase();
		return HOST_IMAGE_PATTERN.test(image);
	} catch {
		return true;
	}
}
