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
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Returns a fully checked-out buffer for `dbPath` with any pending WAL frames
 * merged in, or `null` when there is no WAL to merge (no `-wal` file, an
 * empty one, or `node:sqlite` is unavailable / the merge attempt failed).
 * Callers should fall back to `fs.readFileSync(dbPath)` when this returns null.
 */
export async function tryReadDbWithWal(dbPath: string): Promise<Buffer | null> {
	const walPath = dbPath + '-wal';
	let walSize: number;
	try {
		walSize = fs.statSync(walPath).size;
	} catch {
		return null; // No WAL file — no merge needed
	}
	if (walSize === 0) { return null; }

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
	} catch {
		return null; // node:sqlite unavailable or copy failed — fall back to direct read
	} finally {
		// Always clean up, even when a step above threw — otherwise a failed merge attempt
		// leaks a temp DB (and, on Windows, a still-open handle) on every such call.
		if (nativeDb) { try { nativeDb.close(); } catch { /* ignore */ } }
		for (const f of [tmpDb, tmpWal, tmpShm]) {
			if (!f) { continue; }
			try { fs.unlinkSync(f); } catch { /* ignore — may not have been created */ }
		}
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

/**
 * Reads `dbPath` as a buffer, merging in any pending WAL frames first when
 * possible. Always prefer this over a bare `fs.readFileSync(dbPath)` for
 * SQLite databases that another process may hold open in WAL mode.
 */
export async function readDbBufferWithWal(dbPath: string): Promise<Buffer> {
	const walBuffer = await tryReadDbWithWal(dbPath);
	return walBuffer ?? fs.readFileSync(dbPath);
}
