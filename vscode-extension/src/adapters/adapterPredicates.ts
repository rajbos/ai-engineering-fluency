/**
 * adapterPredicates.ts — path predicates for all ecosystem adapters.
 *
 * Each predicate recognises the file paths belonging to a specific editor's
 * session storage. Centralised here so that callers outside the adapter layer
 * (e.g. extension.ts, usageAnalysis.ts) do not need to import from individual
 * adapter implementation files.
 */
import * as path from 'path';
import { normalizePath } from '../utils/pathUtils';

// ---------------------------------------------------------------------------
// Named regex constants — one per distinct path shape, exported for testability
// ---------------------------------------------------------------------------

/** Matches .json or .jsonl file extensions. */
export const JSONL_FILE_EXTENSION_PATTERN = /\.jsonl?$/;

/** Matches legacy workspaceStorage/<hash>/chatSessions/<file> layout. */
export const LEGACY_WORKSPACE_CHAT_SESSIONS_PATTERN = /\/workspaceStorage\/[^/]+\/chatSessions\/[^/]+$/;

/** Matches workspaceStorage/<hash>/{copilot-extension}/chatSessions/<file>. */
export const WORKSPACE_EXTENSION_CHAT_SESSIONS_PATTERN = /\/workspaceStorage\/[^/]+\/(?:GitHub\.copilot-chat|github\.copilot-chat|GitHub\.copilot|github\.copilot)\/chatSessions\/[^/]+$/;

/** Matches workspaceStorage/<hash>/{copilot-extension}/debug-logs/<file>. */
export const WORKSPACE_EXTENSION_DEBUG_LOGS_PATTERN = /\/workspaceStorage\/[^/]+\/(?:GitHub\.copilot-chat|github\.copilot-chat|GitHub\.copilot|github\.copilot)\/debug-logs\/[^/]+$/;

/** Matches globalStorage/emptyWindowChatSessions/<file>. */
export const GLOBAL_EMPTY_WINDOW_CHAT_SESSIONS_PATTERN = /\/globalStorage\/emptyWindowChatSessions\/[^/]+$/;

/** Matches any file under globalStorage/{GitHub,github}.copilot or .copilot-chat. */
export const GLOBAL_STORAGE_COPILOT_PATTERN = /\/globalStorage\/(?:GitHub|github)\.copilot(?:-chat)?\/.+$/;

/** Matches JetBrains partition files: /.copilot/jb/…/partition-{n}.jsonl. */
export const JETBRAINS_PARTITION_FILE_PATTERN = /\/partition-\d+\.jsonl$/;

// ---------------------------------------------------------------------------
// Copilot Chat
// ---------------------------------------------------------------------------

/**
 * Filename substrings that identify non-session files inside the Copilot Chat
 * globalStorage directory. When scanning that directory recursively we must
 * ignore these to avoid treating auxiliary storage as chat-session data.
 *
 * Rationale for each entry:
 * - `'embeddings'`        — vector-embedding stores used for semantic search; not conversation sessions.
 * - `'index'`             — storage index / search-index files; structural metadata, not session content.
 * - `'cache'`             — transient cached responses or asset caches; not persistent session records.
 * - `'preferences'`       — per-user preference blobs written by the extension; not session logs.
 * - `'settings'`          — extension or workspace settings snapshots; not session logs.
 * - `'config'`            — general configuration files (e.g. feature flags); not session logs.
 * - `'workspacesessions'` — workspace-scoped session *containers* (directory names); individual session
 *                           files inside are matched by more specific path predicates, so the container
 *                           name itself must be excluded to avoid double-counting.
 * - `'globalsessions'`    — global session *containers* equivalent; same reasoning as workspacesessions.
 * - `'api.json'`          — API metadata / endpoint configuration emitted by the extension host; not a
 *                           chat-session file.
 */
export const COPILOT_CHAT_NON_SESSION_PATTERNS = [
	'embeddings',
	'index',
	'cache',
	'preferences',
	'settings',
	'config',
	'workspacesessions',
	'globalsessions',
	'api.json',
];

/**
 * Returns `true` when the given filename matches one of the
 * {@link COPILOT_CHAT_NON_SESSION_PATTERNS}, indicating that the file should
 * be skipped during session discovery.
 *
 * The check is case-insensitive and uses substring matching so it catches both
 * exact filenames (e.g. `api.json`) and directory/file names that contain the
 * pattern as a fragment (e.g. `embeddings-v2`).
 */
export function isCopilotChatNonSessionFile(filename: string): boolean {
	const lower = filename.toLowerCase();
	return COPILOT_CHAT_NON_SESSION_PATTERNS.some(p => lower.includes(p));
}

/**
 * Path predicate that recognises Copilot Chat session storage shapes. Kept
 * narrow so it never accidentally claims unrelated VS Code files.
 *
 * Recognised layouts (all must end in `.json` or `.jsonl`):
 * - `workspaceStorage/<hash>/chatSessions/<file>` — legacy per-workspace sessions.
 * - `workspaceStorage/<hash>/{extension}/chatSessions/<file>` — extension-namespaced workspace sessions.
 * - `workspaceStorage/<hash>/{extension}/debug-logs/<file>` — debug-log session files.
 * - `globalStorage/emptyWindowChatSessions/<file>` — sessions from editor windows with no open workspace.
 * - `globalStorage/{GitHub,github}.copilot[-chat]/**` — all global Copilot / Copilot-Chat storage,
 *   minus files matched by {@link isCopilotChatNonSessionFile}.
 */
export function isCopilotChatSessionPath(filePath: string): boolean {
	const norm = normalizePath(filePath);
	if (!JSONL_FILE_EXTENSION_PATTERN.test(norm)) { return false; }

	// workspaceStorage/<hash>/chatSessions/<file>  (legacy)
	if (LEGACY_WORKSPACE_CHAT_SESSIONS_PATTERN.test(norm)) { return true; }
	// workspaceStorage/<hash>/{extension}/chatSessions/<file>
	if (WORKSPACE_EXTENSION_CHAT_SESSIONS_PATTERN.test(norm)) { return true; }
	// workspaceStorage/<hash>/{extension}/debug-logs/<file>
	if (WORKSPACE_EXTENSION_DEBUG_LOGS_PATTERN.test(norm)) { return true; }
	// globalStorage/emptyWindowChatSessions/<file>
	if (GLOBAL_EMPTY_WINDOW_CHAT_SESSIONS_PATTERN.test(norm)) { return true; }
	// globalStorage/{GitHub,github}.copilot-chat/** and {GitHub,github}.copilot/**
	if (GLOBAL_STORAGE_COPILOT_PATTERN.test(norm)) {
		return !isCopilotChatNonSessionFile(path.basename(norm));
	}
	return false;
}

// ---------------------------------------------------------------------------
// Copilot CLI
// ---------------------------------------------------------------------------

/** Path predicate matching any file under ~/.copilot/session-state/ (any depth). */
export function isCopilotCliSessionPath(filePath: string): boolean {
	const norm = normalizePath(filePath);
	return norm.includes('/.copilot/session-state/');
}

// ---------------------------------------------------------------------------
// JetBrains
// ---------------------------------------------------------------------------

/**
 * Path predicate matching JetBrains partition files under ~/.copilot/jb/.
 * Matches paths containing /.copilot/jb/ that end with /partition-{n}.jsonl.
 */
export function isJetBrainsSessionPath(filePath: string): boolean {
	const norm = normalizePath(filePath);
	return norm.includes('/.copilot/jb/') && JETBRAINS_PARTITION_FILE_PATTERN.test(norm);
}
