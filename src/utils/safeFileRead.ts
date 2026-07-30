/**
 * Bounded reads for untrusted, on-disk session-log files written by other tools
 * (Copilot Chat, Copilot CLI, Claude Code, JetBrains, Gemini CLI, Antigravity,
 * OpenCode, ...). These files are attacker-influenceable — a corrupted, crafted,
 * or runaway log file should never be able to force the extension to load an
 * unbounded amount of data into memory.
 *
 * Real-world JSONL/JSON session files are KBs to tens of MBs. 100 MB is a
 * generous cap that comfortably covers legitimate long-running sessions while
 * still bounding worst-case memory use for a single file.
 */
import * as fs from 'fs';

/** Maximum number of bytes read from a single untrusted session-log file. */
export const MAX_SESSION_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

/**
 * Reads a UTF-8 text file, refusing to load files larger than `maxBytes`.
 * Returns `undefined` (after a debug-level log) when the file is over the cap
 * or can't be read/stat'd — callers should treat this the same as "file missing
 * or unparsable" and fall back to their existing empty/default result.
 */
export async function readTextFileWithSizeGuard(
	filePath: string,
	context: string,
	maxBytes: number = MAX_SESSION_FILE_BYTES
): Promise<string | undefined> {
	// Open once and stat/read the same file handle (not the path) so the file
	// can't be swapped out for something larger between the size check and the
	// read (TOCTOU race).
	let handle: fs.promises.FileHandle;
	try {
		handle = await fs.promises.open(filePath, 'r');
	} catch (err) {
		console.error(`[${context}] Failed to open ${filePath}:`, err);
		return undefined;
	}
	try {
		const stat = await handle.stat();
		if (stat.size > maxBytes) {
			console.debug(`[${context}] Skipping oversized file (${stat.size} bytes > ${maxBytes} byte cap): ${filePath}`);
			return undefined;
		}
		return await handle.readFile({ encoding: 'utf8' });
	} catch (err) {
		console.error(`[${context}] Failed to read ${filePath}:`, err);
		return undefined;
	} finally {
		await handle.close();
	}
}

/** Synchronous counterpart of {@link readTextFileWithSizeGuard}, for call sites that can't go async. */
export function readTextFileWithSizeGuardSync(
	filePath: string,
	context: string,
	maxBytes: number = MAX_SESSION_FILE_BYTES
): string | undefined {
	// Open once and fstat/read the same file descriptor (not the path) so the
	// file can't be swapped out for something larger between the size check
	// and the read (TOCTOU race).
	let fd: number;
	try {
		fd = fs.openSync(filePath, 'r');
	} catch (err) {
		console.error(`[${context}] Failed to open ${filePath}:`, err);
		return undefined;
	}
	try {
		const stat = fs.fstatSync(fd);
		if (stat.size > maxBytes) {
			console.debug(`[${context}] Skipping oversized file (${stat.size} bytes > ${maxBytes} byte cap): ${filePath}`);
			return undefined;
		}
		return fs.readFileSync(fd, 'utf8');
	} catch (err) {
		console.error(`[${context}] Failed to read ${filePath}:`, err);
		return undefined;
	} finally {
		fs.closeSync(fd);
	}
}
