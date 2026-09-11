/**
 * Shared helper for reading a SQLite database file that may have an active
 * WAL (write-ahead log) sidecar.
 *
 * sql.js loads a database by reading raw bytes from the `.db` file only — it
 * has no concept of the `-wal`/`-shm` sidecar files SQLite uses in WAL mode.
 * When another process (e.g. the Copilot CLI) holds the database open in WAL
 * mode, its most recent writes live only in the `-wal` file until a
 * checkpoint merges them back into the main file. Reading just the `.db`
 * bytes in that window silently returns a stale snapshot — no error, just
 * missing recent rows/columns — until something else (e.g. the writer
 * closing its connection) triggers a checkpoint.
 *
 * `tryReadDbWithWal` works around this without a native SQLite dependency in
 * the extension's runtime: it copies the db + wal (+ shm) files to a temp
 * location, opens the copy with Node's built-in `node:sqlite` (Node.js 22+),
 * forces `PRAGMA wal_checkpoint(TRUNCATE)` to merge all WAL frames into the
 * temp file, and returns the resulting buffer for sql.js to load.
 *
 * This is a fallback path — callers with a native `node:sqlite` available
 * should prefer opening `dbPath` directly with `{ readOnly: true }`, which
 * sees pending WAL frames with zero copies (see src/cursor.ts). This module
 * still guards the copy-based approach for callers/environments that can't
 * do that: a size cap refuses to copy very large databases (see #2033, where
 * an unbounded copy of Cursor's 1-2 GB `state.vscdb` on every read filled
 * %temp%), and a per-path throttle with writer-activity backoff keeps a
 * continuously-written WAL from driving back-to-back merges.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Never copy a database above this size just to merge in WAL frames — the copy +
 * native-open + checkpoint + read-back is O(size) I/O and memory, and for a multi-GB db
 * (exactly the shape that triggered #2033) that is worse than reading a slightly stale
 * plain `.db` file. Above this threshold `tryReadDbWithWal` returns `null` so callers fall
 * back to `fs.readFileSync(dbPath)`.
 */
export const MAX_WAL_MERGE_DB_SIZE_BYTES = 256 * 1024 * 1024; // 256 MB

/** Minimum time between WAL-merge attempts for the same db path. */
const WAL_MERGE_MIN_INTERVAL_MS = 60_000;

/**
 * Minimum time between merge attempts while a writer looks live (see `isWalWriterActive`).
 * A running Cursor/Copilot CLI touches its WAL constantly, so without this a merge would be
 * re-attempted at the plain throttle rate forever; back off harder instead.
 */
const WAL_MERGE_WRITER_ACTIVE_INTERVAL_MS = 5 * 60_000;

/** A writer is considered "recently active" if its WAL was touched within this window. */
const WRITER_ACTIVE_WAL_RECENCY_MS = 30_000;

interface WalMergeCacheEntry {
	buffer: Buffer;
	attemptedAt: number;
}

/** Per-db-path cache of the last successful (or last-served) merge result and when it was produced. */
const walMergeCache = new Map<string, WalMergeCacheEntry>();

/**
 * Heuristic for "another process currently holds this db open in WAL mode", using only two
 * `fs.stat` checks — no process enumeration, no lock probing. `<db>-shm` exists only while some
 * process holds the db open in WAL mode; a recently-touched `<db>-wal` on top of that means it is
 * still being written to, not just left over from a process that has since exited.
 */
export function isWalWriterActive(dbPath: string, nowMs: number = Date.now()): boolean {
	if (!fs.existsSync(dbPath + '-shm')) { return false; }
	const walMtimeMs = getWalMtimeMs(dbPath);
	if (walMtimeMs === 0) { return false; }
	return nowMs - walMtimeMs <= WRITER_ACTIVE_WAL_RECENCY_MS;
}

/**
 * Returns `{ walPath }` when `dbPath` has a non-empty WAL worth merging and is small enough to
 * copy, or `null` when a merge should be skipped outright (no `-wal` file, an empty one, or the
 * db is above `MAX_WAL_MERGE_DB_SIZE_BYTES`).
 */
function checkWalMergeEligible(dbPath: string): { walPath: string } | null {
	const walPath = dbPath + '-wal';
	let walSize: number;
	try {
		walSize = fs.statSync(walPath).size;
	} catch {
		return null; // No WAL file — no merge needed
	}
	if (walSize === 0) { return null; }

	let dbSize: number;
	try {
		dbSize = fs.statSync(dbPath).size;
	} catch {
		return null;
	}
	if (dbSize > MAX_WAL_MERGE_DB_SIZE_BYTES) { return null; } // never copy a huge db just to merge WAL frames

	return { walPath };
}

/**
 * Copies `dbPath` + `walPath` (+ `-shm`, if present) to a temp location, uses node:sqlite to
 * checkpoint the WAL, and returns the merged buffer. Always cleans up its temp files, even when
 * a step above throws — otherwise a failed merge attempt leaks a temp DB (and, on Windows, a
 * still-open handle) on every such call.
 */
function performWalMerge(dbPath: string, walPath: string): Buffer {
	let tmpDb: string | undefined;
	let tmpWal: string | undefined;
	let tmpShm: string | undefined;
	let nativeDb: import('node:sqlite').DatabaseSync | undefined;
	try {
		const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
		const tmpDir = path.join(os.homedir(), '.copilot', 'tmp');
		fs.mkdirSync(tmpDir, { recursive: true, mode: 0o700 });
		tmpDb = path.join(tmpDir, `sqlite-wal-${path.basename(dbPath)}-${process.pid}-${Date.now()}-${Math.random().toString(16).slice(2)}.db`);
		tmpWal = tmpDb + '-wal';
		tmpShm = tmpDb + '-shm';
		const shmPath = dbPath + '-shm';

		fs.copyFileSync(dbPath, tmpDb);
		fs.copyFileSync(walPath, tmpWal);
		if (fs.existsSync(shmPath)) { fs.copyFileSync(shmPath, tmpShm); }

		nativeDb = new DatabaseSync(tmpDb);
		nativeDb.exec('PRAGMA wal_checkpoint(TRUNCATE);');
		nativeDb.close();
		nativeDb = undefined;

		return fs.readFileSync(tmpDb);
	} finally {
		if (nativeDb) { try { nativeDb.close(); } catch { /* ignore */ } }
		for (const f of [tmpDb, tmpWal, tmpShm]) {
			if (!f) { continue; }
			try { fs.unlinkSync(f); } catch { /* ignore — may not have been created */ }
		}
	}
}

/**
 * Returns a fully checked-out buffer for `dbPath` with any pending WAL frames
 * merged in, or `null` when there is no WAL to merge (no `-wal` file, an
 * empty one, the db is above `MAX_WAL_MERGE_DB_SIZE_BYTES`, or `node:sqlite`
 * is unavailable / the merge attempt failed and nothing was cached yet).
 * Callers should fall back to `fs.readFileSync(dbPath)` when this returns null.
 *
 * Repeated calls for the same `dbPath` within the throttle window are served from an
 * in-memory cache of the last merge result instead of re-copying — see module docs.
 */
export async function tryReadDbWithWal(dbPath: string): Promise<Buffer | null> {
	const eligible = checkWalMergeEligible(dbPath);
	if (!eligible) { return null; }

	const now = Date.now();
	const cached = walMergeCache.get(dbPath);
	const minInterval = isWalWriterActive(dbPath, now) ? WAL_MERGE_WRITER_ACTIVE_INTERVAL_MS : WAL_MERGE_MIN_INTERVAL_MS;
	if (cached && now - cached.attemptedAt < minInterval) {
		return cached.buffer; // serve the previous merge result instead of re-merging
	}

	try {
		const buffer = performWalMerge(dbPath, eligible.walPath);
		walMergeCache.set(dbPath, { buffer, attemptedAt: now });
		return buffer;
	} catch {
		// node:sqlite unavailable or copy/merge failed. Record the attempt so a db that keeps
		// failing isn't retried on every call, and keep serving the last good result if we have one.
		if (cached) {
			cached.attemptedAt = now;
			return cached.buffer;
		}
		return null; // fall back to direct read — nothing usable was ever cached for this db
	}
}

/** The WAL sidecar's mtime in milliseconds, or 0 when no `-wal` file exists. */
export function getWalMtimeMs(dbPath: string): number {
	try {
		return fs.statSync(dbPath + '-wal').mtimeMs;
	} catch {
		return 0;
	}
}

const WAL_TEMP_FILE_PREFIXES = ['cursor-wal-', 'sqlite-wal-'];

/** Removes `filePath` if it is a plain file older than `minAgeMs`. Returns whether it removed it. */
async function removeIfStaleWalTempFile(filePath: string, minAgeMs: number, nowMs: number): Promise<boolean> {
	try {
		const stat = await fs.promises.stat(filePath);
		if (!stat.isFile() || nowMs - stat.mtimeMs < minAgeMs) { return false; }
		await fs.promises.unlink(filePath);
		return true;
	} catch {
		return false; // removed/locked concurrently, or stat/unlink failed — leave it alone
	}
}

/** Sweeps one directory for stale WAL-merge temp files. Returns how many it removed. */
async function sweepDirForStaleWalTempFiles(dir: string, minAgeMs: number, nowMs: number): Promise<number> {
	let entries: string[];
	try {
		entries = await fs.promises.readdir(dir);
	} catch {
		return 0; // directory missing/unreadable — nothing to sweep
	}
	let removed = 0;
	for (const name of entries) {
		if (!WAL_TEMP_FILE_PREFIXES.some(prefix => name.startsWith(prefix))) { continue; }
		if (await removeIfStaleWalTempFile(path.join(dir, name), minAgeMs, nowMs)) { removed++; }
	}
	return removed;
}

/**
 * Best-effort sweep of stranded WAL-merge temp files. Earlier extension versions (<= 0.17.2)
 * copied Cursor's `state.vscdb` on every read without a `finally`-guarded cleanup, leaking
 * `cursor-wal-*` (+ `-wal`/`-shm` siblings) files into `os.tmpdir()` — see #2033. The current
 * helper writes `sqlite-wal-*` under `~/.copilot/tmp` instead, but nothing sweeps either
 * location today. Runs once at activation (see extension.ts) to reclaim both.
 *
 * Conservative by design: only removes files whose name starts with one of our own temp-file
 * prefixes AND are older than `minAgeMs`; anything else — including any error — is left alone.
 *
 * `dirsOverride` replaces the default [`os.tmpdir()`, `~/.copilot/tmp`] pair — for tests only;
 * production callers should omit it.
 */
export async function sweepStaleWalTempFiles(minAgeMs: number = 60 * 60 * 1000, dirsOverride?: string[]): Promise<number> {
	const dirs = dirsOverride ?? [os.tmpdir(), path.join(os.homedir(), '.copilot', 'tmp')];
	const now = Date.now();
	let removed = 0;
	for (const dir of dirs) {
		removed += await sweepDirForStaleWalTempFiles(dir, minAgeMs, now);
	}
	return removed;
}

/**
 * Reads `dbPath` as a buffer, merging in any pending WAL frames first when
 * possible. Always prefer this over a bare `fs.readFileSync(dbPath)` for
 * SQLite databases that another process may hold open in WAL mode.
 */
export async function readDbBufferWithWal(dbPath: string): Promise<Buffer> {
	const walBuffer = await tryReadDbWithWal(dbPath);
	return walBuffer ?? fs.readFileSync(dbPath);
}
