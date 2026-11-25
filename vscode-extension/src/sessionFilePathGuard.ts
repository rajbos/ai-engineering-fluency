/**
 * Checks a session-file path that arrived in a webview message before the extension opens it.
 *
 * Webviews post `{ command: 'openSessionFile', file }` (and `openFormattedJsonlFile`) with a path
 * taken from their own DOM. The extension must only open a file it discovered itself as a session
 * file, never an arbitrary path a (compromised or buggy) webview names. No `vscode` import, so the
 * check is unit-testable; the host injects how it knows its session files.
 */
import * as fs from 'fs';
import * as path from 'path';
import { normalizePathForDedup } from '../../src/utils/pathUtils';

export interface SessionFilePathGuardDeps {
	/** True when the per-file session cache already holds this exact path (cheap, synchronous). */
	isCachedSessionFile: (filePath: string) => boolean;
	/** The session files discovery found (the discovery layer caches and de-duplicates this). */
	listSessionFiles: () => Promise<string[]>;
	/** Rejections are logged here; nothing is shown to the user. */
	log: (message: string) => void;
	/** Defaults to `fs.promises.stat`; injectable for tests. */
	stat?: (filePath: string) => Promise<{ isFile(): boolean }>;
	platform?: NodeJS.Platform;
}

/** Why a candidate path was refused, or `undefined` when it is a known session file. */
export async function findSessionFilePathProblem(candidate: unknown, deps: SessionFilePathGuardDeps): Promise<string | undefined> {
	if (typeof candidate !== 'string' || candidate.length === 0) { return 'not a non-empty string'; }
	if (candidate.includes('\0')) { return 'contains a NUL character'; }
	if (!path.isAbsolute(candidate)) { return 'not an absolute path'; }
	if (candidate.split(/[\\/]/).includes('..')) { return 'contains a ".." segment'; }
	if (!(await isKnownSessionFile(candidate, deps))) { return 'not a discovered session file'; }
	return (await isRegularFile(candidate, deps)) ? undefined : 'not an existing regular file';
}

/**
 * Returns `candidate` when it is a known session file that exists, otherwise logs why it was
 * refused (tagged with `source`, e.g. `openSessionFile:analysis`) and returns `undefined`.
 */
export async function checkWebviewSessionFilePath(candidate: unknown, source: string, deps: SessionFilePathGuardDeps): Promise<string | undefined> {
	let problem: string | undefined;
	try { problem = await findSessionFilePathProblem(candidate, deps); }
	catch (err) { problem = `check failed: ${err instanceof Error ? err.message : String(err)}`; }
	if (problem === undefined) { return candidate as string; }
	const shown = typeof candidate === 'string' ? JSON.stringify(candidate.slice(0, 300)) : typeof candidate;
	deps.log(`⛔ [${source}] Refused to open webview-supplied session file ${shown}: ${problem}`);
	return undefined;
}

/** A positive safe integer turn number from a webview message, otherwise `undefined`. */
export function parseWebviewTurnNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isSafeInteger(value) && value > 0 ? value : undefined;
}

async function isKnownSessionFile(candidate: string, deps: SessionFilePathGuardDeps): Promise<boolean> {
	if (deps.isCachedSessionFile(candidate)) { return true; }
	const key = normalizePathForDedup(candidate, deps.platform);
	return (await deps.listSessionFiles()).some(f => normalizePathForDedup(f, deps.platform) === key);
}

/**
 * Database-backed sessions (Codex, OpenCode, ...) use a virtual `<db file>#<id>` path; for those
 * the backing database file must exist instead.
 */
async function isRegularFile(candidate: string, deps: SessionFilePathGuardDeps): Promise<boolean> {
	const stat = deps.stat ?? ((p: string) => fs.promises.stat(p));
	const hash = candidate.lastIndexOf('#');
	const targets = hash > 0 ? [candidate, candidate.slice(0, hash)] : [candidate];
	for (const target of targets) {
		try { if ((await stat(target)).isFile()) { return true; } }
		catch { /* try the next spelling */ }
	}
	return false;
}
