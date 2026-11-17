/**
 * Machine-wide coordination of the heavy session-file parse across hosts.
 *
 * VS Code stable, VS Code Insiders and the desktop tray app all scan the same local AI-session
 * files. Each host already elects one leader among its own windows (VS Code's per-edition
 * `refresh_<cacheId>.lock` in `globalStorageUri`), but those locks live in per-host storage, so the
 * hosts never see each other and all parse everything at the same time.
 *
 * This module adds a lock every host can see, in `~/.copilot-token-tracker/locks/` (the directory
 * the CLI and desktop app already use for their cache), plus a small registry through which hosts
 * advertise their published snapshot:
 *
 * - `session-parse.lock` — held by whichever host is doing a heavy parse right now. Another host's
 *   leader waits (bounded) for it instead of parsing the same files concurrently. Hung holders are
 *   taken over through the progress/stall rules in `fileLock.ts`.
 * - `peer-<hostId>.json` — "my snapshot is at <path>, in <format>". After waiting, a host merges a
 *   compatible peer's snapshot into its own cache, so the files the peer just parsed become cache
 *   hits and only the files it has not seen get parsed.
 *
 * Snapshots stay per host on purpose: the VS Code snapshot (`SessionFileCache` entries with a
 * per-edition clear epoch and tombstones) and the CLI/desktop cache (`cli-cache.json`, CLI
 * `SessionData`) are different shapes with different version counters, and the VS Code one carries
 * cross-window clear/tombstone semantics a second writer would have to honour. So a peer snapshot
 * is only ever *read*, and only when its declared format string matches the reader's exactly (VS
 * Code stable and Insiders on the same extension build). Hosts with different formats still gain
 * the serialization (no two heavy parses competing for CPU and disk at once) but each fills its own
 * cache. See docs/adr/CROSS-HOST-PARSE-COORDINATION.md.
 */
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
	type FileLockOptions,
	type LockOwner,
	type LockRecord,
	readFileLock,
	releaseFileLock,
	renewFileLock,
	tryAcquireFileLock,
} from './fileLock';

export const MACHINE_PARSE_LOCK_FILE = 'session-parse.lock';
/** Progress deadline recorded by parse-lock holders: no parse progress for this long = hung. */
export const PARSE_LOCK_STALL_MS = 3 * 60 * 1000;
/** Hard cap recorded by parse-lock holders, a backstop behind the progress check. */
export const PARSE_LOCK_MAX_HOLD_MS = 45 * 60 * 1000;

/** `~/.copilot-token-tracker/locks`, shared by every host on this machine for this OS user. */
export function getMachineLockDir(homeDir: string = os.homedir()): string {
	return path.join(homeDir, '.copilot-token-tracker', 'locks');
}

export function getMachineParseLockPath(lockDir: string = getMachineLockDir()): string {
	return path.join(lockDir, MACHINE_PARSE_LOCK_FILE);
}

export interface WaitForLockOptions extends FileLockOptions {
	/** Give up waiting after this long. The caller then proceeds without the lock. */
	maxWaitMs: number;
	/** Poll interval while another holder has the lock. */
	pollMs: number;
	/** Called on every poll while waiting (e.g. to report progress on an outer lock). */
	onWait?: (holder: LockRecord | null | undefined, waitedMs: number) => void | Promise<void>;
	/** Sleep, injectable for tests. */
	sleep?: (ms: number) => Promise<void>;
}

export interface WaitForLockResult {
	acquired: boolean;
	waitedMs: number;
	/**
	 * True when the lock could not be taken at all (unwritable or invalid lock directory). The wait
	 * then ends at once, without polling: no holder exists to wait for, and every retry would only
	 * fail and warn again.
	 */
	unavailable?: boolean;
	/** The holder seen on the last failed attempt, when we had to wait. */
	lastHolder?: LockRecord | null;
}

const defaultSleep = (ms: number) => new Promise<void>(resolve => {
	const t = setTimeout(resolve, ms);
	if (typeof t.unref === 'function') { t.unref(); }
});

/**
 * Acquire a lock, waiting while a live holder has it. Every poll re-runs the takeover rules, so a
 * holder that dies, goes silent or stops making progress is taken over well before `maxWaitMs`.
 * Returns `acquired: false` when a live, progressing holder still has it at the deadline, or at
 * once with `unavailable: true` when the lock cannot be created at all.
 */
export async function waitForFileLock(lockPath: string, owner: LockOwner, options: WaitForLockOptions): Promise<WaitForLockResult> {
	const now = options.now ?? Date.now;
	const sleep = options.sleep ?? defaultSleep;
	const start = now();
	let lastHolder: LockRecord | null | undefined;
	for (;;) {
		const attempt = await tryAcquireFileLock(lockPath, owner, options);
		if (attempt === 'acquired') {
			return { acquired: true, waitedMs: now() - start, ...(lastHolder !== undefined ? { lastHolder } : {}) };
		}
		if (attempt === 'unavailable') {
			return { acquired: false, unavailable: true, waitedMs: now() - start };
		}
		lastHolder = await readFileLock(lockPath);
		const waitedMs = now() - start;
		if (waitedMs >= options.maxWaitMs) {
			return { acquired: false, waitedMs, ...(lastHolder !== undefined ? { lastHolder } : {}) };
		}
		if (options.onWait) { await options.onWait(lastHolder, waitedMs); }
		await sleep(Math.min(options.pollMs, Math.max(1, options.maxWaitMs - waitedMs)));
	}
}

/** One host's turn at the heavy parse, from {@link beginMachineParse}. */
export interface MachineParseSession {
	/** False when the wait ran out or the lock dir is unusable; the caller parses anyway. */
	readonly acquired: boolean;
	/** True when the lock dir is unusable (the turn returned at once, without waiting). */
	readonly unavailable: boolean;
	readonly waitedMs: number;
	/** Report parse progress; the next heartbeat records it so peers don't judge this host hung. */
	noteProgress(): void;
	/** Stop the heartbeat and release the lock (owner-only). Safe to call more than once. */
	end(): Promise<void>;
}

export interface BeginMachineParseOptions {
	lockDir?: string;
	maxWaitMs?: number;
	pollMs?: number;
	heartbeatMs?: number;
	log?: (message: string) => void;
	/** Injectable for tests; defaults as in {@link FileLockOptions}. */
	isOwnerAlive?: (pid: unknown) => boolean;
	now?: () => number;
	sleep?: (ms: number) => Promise<void>;
}

/**
 * Wait for the machine-wide parse lock and hold it with a progress-aware heartbeat until `end()`.
 * For hosts with a single parse loop (the desktop app). The heartbeat writes `progressAt` only when
 * `noteProgress()` was called since the previous beat, so a parse that hangs stops looking alive to
 * peers after {@link PARSE_LOCK_STALL_MS}, even though this process (and its timer) is still running.
 */
export async function beginMachineParse(owner: LockOwner, options: BeginMachineParseOptions = {}): Promise<MachineParseSession> {
	const lockPath = getMachineParseLockPath(options.lockDir ?? getMachineLockDir());
	const log = options.log ?? (() => { /* silent */ });
	let announced = false;
	const result = await waitForFileLock(lockPath, owner, {
		maxWaitMs: options.maxWaitMs ?? 60 * 1000,
		pollMs: options.pollMs ?? 2000,
		stallMs: PARSE_LOCK_STALL_MS,
		maxHoldMs: PARSE_LOCK_MAX_HOLD_MS,
		log,
		...(options.isOwnerAlive ? { isOwnerAlive: options.isOwnerAlive } : {}),
		...(options.now ? { now: options.now } : {}),
		...(options.sleep ? { sleep: options.sleep } : {}),
		onWait: (holder) => {
			if (announced) { return; }
			announced = true;
			log(`Waiting for ${holder && typeof holder.host === 'string' ? holder.host : 'another host'} to finish its session parse`);
		},
	});
	if (result.unavailable) {
		log('Machine-wide parse lock unavailable; parsing without cross-host coordination');
	} else if (!result.acquired) {
		log(`Machine-wide parse lock still held after ${Math.round(result.waitedMs / 1000)}s; parsing without it`);
	}
	let progressPending = false;
	let timer: NodeJS.Timeout | undefined;
	if (result.acquired) {
		timer = setInterval(() => {
			const progress = progressPending;
			progressPending = false;
			void renewFileLock(lockPath, owner, { progress }, options.now ? { now: options.now } : {}).catch(() => false);
		}, options.heartbeatMs ?? 30 * 1000);
		if (typeof timer.unref === 'function') { timer.unref(); }
	}
	let ended = false;
	return {
		acquired: result.acquired,
		unavailable: result.unavailable === true,
		waitedMs: result.waitedMs,
		noteProgress: () => { progressPending = true; },
		end: async () => {
			if (ended) { return; }
			ended = true;
			if (timer) { clearInterval(timer); }
			if (result.acquired) { await releaseFileLock(lockPath, owner); }
		},
	};
}

/** A host's advertisement of where it publishes its parse results. */
export interface PeerSnapshotInfo {
	hostId: string;
	/** Absolute path of the host's snapshot file. */
	snapshotPath: string;
	/** Exact format/version string; peers only read snapshots whose format equals their own. */
	format: string;
	updatedAt: number;
}

function sanitizeHostId(hostId: string): string {
	return hostId.toLowerCase().replace(/[^a-z0-9._-]+/g, '-').slice(0, 80) || 'host';
}

export function getPeerSnapshotRegistryPath(lockDir: string, hostId: string): string {
	return path.join(lockDir, `peer-${sanitizeHostId(hostId)}.json`);
}

/** Advertise (or refresh) this host's snapshot location. Best-effort; atomic via rename. */
export async function publishPeerSnapshot(lockDir: string, info: PeerSnapshotInfo): Promise<void> {
	const target = getPeerSnapshotRegistryPath(lockDir, info.hostId);
	const tmp = `${target}.${process.pid}.${Math.random().toString(36).slice(2)}.tmp`;
	try {
		await fs.promises.mkdir(lockDir, { recursive: true });
		await fs.promises.writeFile(tmp, JSON.stringify(info));
		await fs.promises.rename(tmp, target);
	} catch {
		try { await fs.promises.unlink(tmp); } catch { /* never created */ }
	}
}

/**
 * Peers advertising a snapshot in exactly `format`, excluding `selfHostId`. Malformed entries and
 * entries whose snapshot file no longer exists are skipped.
 */
export async function listPeerSnapshots(lockDir: string, format: string, selfHostId: string): Promise<PeerSnapshotInfo[]> {
	let names: string[];
	try {
		names = await fs.promises.readdir(lockDir);
	} catch {
		return [];
	}
	const self = path.basename(getPeerSnapshotRegistryPath(lockDir, selfHostId));
	const peers: PeerSnapshotInfo[] = [];
	for (const name of names) {
		if (!/^peer-.+\.json$/.test(name) || name === self) { continue; }
		try {
			const info = JSON.parse(await fs.promises.readFile(path.join(lockDir, name), 'utf-8')) as Partial<PeerSnapshotInfo>;
			if (!info || info.format !== format || typeof info.snapshotPath !== 'string' || typeof info.hostId !== 'string') { continue; }
			if (sanitizeHostId(info.hostId) === sanitizeHostId(selfHostId)) { continue; }
			await fs.promises.access(info.snapshotPath);
			peers.push({ hostId: info.hostId, snapshotPath: info.snapshotPath, format: info.format, updatedAt: Number(info.updatedAt) || 0 });
		} catch {
			// unreadable registry entry or vanished snapshot — skip
		}
	}
	return peers;
}
