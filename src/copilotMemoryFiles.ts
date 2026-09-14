/**
 * Copilot Memory Files discovery & analysis.
 *
 * GitHub Copilot's agent writes its own Markdown "memory" notes to disk, in three scopes
 * (see docs/features/COPILOT-MEMORY-FILES-INSIGHT.md for the full writeup):
 *
 *   - User (global):  <User>/globalStorage/{GitHub,github}.copilot-chat/memory-tool/memories/*.md
 *   - Repo (per-workspace):    <User>/workspaceStorage/<hash>/{GitHub,github}.copilot-chat/memory-tool/memories/repo/*.md
 *   - Session (per-workspace): .../memory-tool/memories/<base64(sessionId)>/*.md
 *
 * The session-scope folder name is the base64-encoded chat-session UUID, NOT a literal
 * "session" folder — this must be decoded explicitly (see `decodeSessionFolderName`).
 *
 * This module discovers those files and produces a metadata-only hygiene analysis (counts,
 * staleness, size). It never reads a memory file's *content* beyond deriving a display title
 * from its filename. Pure Node (fs/path), no VS Code API, so the extension and the CLI share it.
 */
import * as fs from 'fs';
import * as path from 'path';

import type { MemoryFileEntry, MemoryFilesAnalysis, MemoryFilesWorkspaceSummary } from './types';
import { parseWorkspaceStorageJsonFile } from './workspaceHelpers';
import { getVSCodeUserPaths } from './adapters/copilotChatAdapter';

/** Extension-folder spellings Copilot Chat's memory-tool directory has shipped under. */
const COPILOT_EXTENSION_FOLDERS = ['GitHub.copilot-chat', 'github.copilot-chat', 'GitHub.copilot', 'github.copilot'];

/** Path segments from the extension folder down to the memory files themselves. */
const MEMORY_TOOL_SEGMENTS = ['memory-tool', 'memories'];

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Default look-back threshold (days) beyond which a memory file is flagged as stale. */
const DEFAULT_STALE_DAYS = 90;
/** Default size threshold (bytes) beyond which a memory file is flagged as unusually large. */
const DEFAULT_LARGE_FILE_BYTES = 10 * 1024;

/**
 * Attempt to decode a memory-store session-scope folder name back to the chat session UUID
 * it was derived from. Session-scope folders are named `base64(sessionId)` rather than a
 * literal "session" folder. Returns undefined for anything that doesn't decode to a UUID
 * (e.g. the literal "repo" folder, or an unrecognized layout).
 */
export function decodeSessionFolderName(folderName: string): string | undefined {
	if (!folderName || folderName === 'repo') { return undefined; }
	try {
		const decoded = Buffer.from(folderName, 'base64').toString('utf8');
		return UUID_RE.test(decoded) ? decoded : undefined;
	} catch {
		return undefined;
	}
}

function listMdFiles(dir: string): string[] {
	try {
		return fs.readdirSync(dir, { withFileTypes: true })
			.filter(d => d.isFile() && d.name.toLowerCase().endsWith('.md'))
			.map(d => path.join(dir, d.name));
	} catch {
		return [];
	}
}

function listSubDirNames(dir: string): string[] {
	try {
		return fs.readdirSync(dir, { withFileTypes: true })
			.filter(d => d.isDirectory())
			.map(d => d.name);
	} catch {
		return [];
	}
}

function toEntry(filePath: string, scope: MemoryFileEntry['scope'], extra: Partial<MemoryFileEntry> = {}): MemoryFileEntry | undefined {
	try {
		const stat = fs.statSync(filePath);
		return {
			path: filePath,
			scope,
			sizeBytes: stat.size,
			mtimeMs: stat.mtimeMs,
			title: path.basename(filePath, path.extname(filePath)),
			...extra,
		};
	} catch {
		return undefined;
	}
}

/** Find the first existing `memory-tool/memories` directory under a "User" root's `globalStorage`. */
function findGlobalMemoriesDir(userPath: string): string | undefined {
	for (const extFolder of COPILOT_EXTENSION_FOLDERS) {
		const candidate = path.join(userPath, 'globalStorage', extFolder, ...MEMORY_TOOL_SEGMENTS);
		if (fs.existsSync(candidate)) { return candidate; }
	}
	return undefined;
}

/** Find the first existing `memory-tool/memories` directory under a specific `workspaceStorage/<hash>`. */
function findWorkspaceMemoriesDir(userPath: string, hash: string): string | undefined {
	for (const extFolder of COPILOT_EXTENSION_FOLDERS) {
		const candidate = path.join(userPath, 'workspaceStorage', hash, extFolder, ...MEMORY_TOOL_SEGMENTS);
		if (fs.existsSync(candidate)) { return candidate; }
	}
	return undefined;
}

/**
 * Resolve a `workspaceStorage/<hash>` folder back to its real workspace folder path, by reading
 * `workspace.json` / `meta.json` — reuses the same JSON parsing helper the session-attribution
 * code uses, so this stays in sync with that logic instead of re-implementing it.
 */
function resolveWorkspaceName(userPath: string, hash: string): string | undefined {
	const hashDir = path.join(userPath, 'workspaceStorage', hash);
	const workspaceJsonPath = path.join(hashDir, 'workspace.json');
	const metaJsonPath = path.join(hashDir, 'meta.json');
	if (fs.existsSync(workspaceJsonPath)) {
		const resolved = parseWorkspaceStorageJsonFile(workspaceJsonPath, ['folder', 'workspace', 'configuration', 'uri', 'path']);
		if (resolved) { return resolved; }
	}
	if (fs.existsSync(metaJsonPath)) {
		return parseWorkspaceStorageJsonFile(metaJsonPath, ['folder', 'uri', 'workspace', 'path']);
	}
	return undefined;
}

/** Discover memory files for one `workspaceStorage/<hash>` folder (repo + session scope subdirs). */
function discoverWorkspaceHashMemoryFiles(userPath: string, hash: string): MemoryFileEntry[] {
	const memoriesDir = findWorkspaceMemoriesDir(userPath, hash);
	if (!memoriesDir) { return []; }
	const workspaceName = resolveWorkspaceName(userPath, hash);

	const entries: MemoryFileEntry[] = [];
	for (const subDir of listSubDirNames(memoriesDir)) {
		const isRepoScope = subDir === 'repo';
		const sessionId = isRepoScope ? undefined : decodeSessionFolderName(subDir);
		// Anything under memories/ that isn't "repo" and doesn't decode to a session UUID is an
		// unrecognized layout (future memory-tool version?) — skip it rather than misclassify it.
		if (!isRepoScope && !sessionId) { continue; }
		const scope: MemoryFileEntry['scope'] = isRepoScope ? 'repo' : 'session';

		for (const file of listMdFiles(path.join(memoriesDir, subDir))) {
			const entry = toEntry(file, scope, { workspaceHash: hash, workspaceName, sessionId });
			if (entry) { entries.push(entry); }
		}
	}
	return entries;
}

/**
 * Discover all Copilot memory files (user, repo and session scope) under a single VS Code
 * "User" root directory (e.g. one editor variant's `%APPDATA%/Code/User`).
 */
export function discoverMemoryFilesInUserPath(userPath: string): MemoryFileEntry[] {
	const entries: MemoryFileEntry[] = [];

	const globalDir = findGlobalMemoriesDir(userPath);
	if (globalDir) {
		for (const file of listMdFiles(globalDir)) {
			const entry = toEntry(file, 'user');
			if (entry) { entries.push(entry); }
		}
	}

	const workspaceStorageRoot = path.join(userPath, 'workspaceStorage');
	for (const hash of listSubDirNames(workspaceStorageRoot)) {
		entries.push(...discoverWorkspaceHashMemoryFiles(userPath, hash));
	}

	return entries;
}

/**
 * Discover Copilot memory files across every known VS Code "User" root on this machine
 * (Code, Code - Insiders, Code - Exploration, VSCodium, Cursor). Pass `userPaths` to restrict
 * the scan, e.g. in tests, or to a single workspace's own storage.
 */
export function discoverAllMemoryFiles(userPaths: string[] = getVSCodeUserPaths()): MemoryFileEntry[] {
	return userPaths.flatMap(discoverMemoryFilesInUserPath);
}

/** Look up (creating if needed) the per-workspace summary bucket a file belongs to. */
function getOrCreateWorkspaceSummary(
	byWorkspaceKey: Map<string, MemoryFilesWorkspaceSummary>,
	file: MemoryFileEntry,
): MemoryFilesWorkspaceSummary {
	const key = file.scope === 'user' ? '__user__' : (file.workspaceHash ?? '__unknown__');
	let summary = byWorkspaceKey.get(key);
	if (!summary) {
		summary = {
			workspaceHash: file.scope === 'user' ? undefined : file.workspaceHash,
			workspaceName: file.scope === 'user' ? 'User (global)' : file.workspaceName,
			repoCount: 0,
			sessionCount: 0,
			totalBytes: 0,
			newestMtimeMs: null,
			oldestMtimeMs: null,
			staleFiles: [],
		};
		byWorkspaceKey.set(key, summary);
	}
	return summary;
}

/** Fold one file's metadata into its workspace summary (counts, sizes, min/max mtime, staleness). */
function foldFileIntoSummary(summary: MemoryFilesWorkspaceSummary, file: MemoryFileEntry, staleThresholdMs: number): void {
	if (file.scope === 'repo') { summary.repoCount++; }
	else if (file.scope === 'session') { summary.sessionCount++; }
	summary.totalBytes += file.sizeBytes;
	summary.newestMtimeMs = summary.newestMtimeMs === null ? file.mtimeMs : Math.max(summary.newestMtimeMs, file.mtimeMs);
	summary.oldestMtimeMs = summary.oldestMtimeMs === null ? file.mtimeMs : Math.min(summary.oldestMtimeMs, file.mtimeMs);
	if (!summary.largestFile || file.sizeBytes > summary.largestFile.sizeBytes) { summary.largestFile = file; }
	if (file.mtimeMs < staleThresholdMs) { summary.staleFiles.push(file); }
}

/**
 * Analyze discovered memory files into a metadata-only hygiene summary: per-workspace counts,
 * staleness (files older than `staleDays`), and unusually large files (over `largeFileBytes`).
 */
export function analyzeMemoryFiles(
	files: MemoryFileEntry[],
	options: { staleDays?: number; largeFileBytes?: number } = {},
): MemoryFilesAnalysis {
	const staleDays = options.staleDays ?? DEFAULT_STALE_DAYS;
	const largeFileBytes = options.largeFileBytes ?? DEFAULT_LARGE_FILE_BYTES;
	const staleThresholdMs = Date.now() - staleDays * 24 * 60 * 60 * 1000;

	const byWorkspaceKey = new Map<string, MemoryFilesWorkspaceSummary>();
	for (const file of files) {
		const summary = getOrCreateWorkspaceSummary(byWorkspaceKey, file);
		foldFileIntoSummary(summary, file, staleThresholdMs);
	}

	return {
		staleDays,
		largeFileBytes,
		files,
		byWorkspace: Array.from(byWorkspaceKey.values()),
		totalFiles: files.length,
		totalBytes: files.reduce((sum, f) => sum + f.sizeBytes, 0),
		staleFileCount: files.filter(f => f.mtimeMs < staleThresholdMs).length,
		largeFileCount: files.filter(f => f.sizeBytes > largeFileBytes).length,
	};
}
