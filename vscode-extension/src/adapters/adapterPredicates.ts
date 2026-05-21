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
// Copilot Chat
// ---------------------------------------------------------------------------

/** Filenames we explicitly skip when recursively scanning Copilot Chat globalStorage. */
const COPILOT_CHAT_NON_SESSION_PATTERNS = [
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

/** Returns true for filenames that are not Copilot Chat session files. */
export function isCopilotChatNonSessionFile(filename: string): boolean {
	const lower = filename.toLowerCase();
	return COPILOT_CHAT_NON_SESSION_PATTERNS.some(p => lower.includes(p));
}

/**
 * Path predicate that recognises Copilot Chat session storage shapes. Kept
 * narrow so it never accidentally claims unrelated VS Code files.
 */
export function isCopilotChatSessionPath(filePath: string): boolean {
	const norm = normalizePath(filePath);
	if (!/\.jsonl?$/.test(norm)) { return false; }

	// workspaceStorage/<hash>/chatSessions/<file>  (legacy)
	if (/\/workspaceStorage\/[^/]+\/chatSessions\/[^/]+$/.test(norm)) {
		return true;
	}
	// workspaceStorage/<hash>/{extension}/chatSessions/<file>
	if (/\/workspaceStorage\/[^/]+\/(?:GitHub\.copilot-chat|github\.copilot-chat|GitHub\.copilot|github\.copilot)\/chatSessions\/[^/]+$/.test(norm)) {
		return true;
	}
	// workspaceStorage/<hash>/{extension}/debug-logs/<file>
	if (/\/workspaceStorage\/[^/]+\/(?:GitHub\.copilot-chat|github\.copilot-chat|GitHub\.copilot|github\.copilot)\/debug-logs\/[^/]+$/.test(norm)) {
		return true;
	}
	// globalStorage/emptyWindowChatSessions/<file>
	if (/\/globalStorage\/emptyWindowChatSessions\/[^/]+$/.test(norm)) { return true; }
	// globalStorage/{GitHub,github}.copilot-chat/** and {GitHub,github}.copilot/**
	if (/\/globalStorage\/(?:GitHub|github)\.copilot(?:-chat)?\/.+$/.test(norm)) {
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
	return norm.includes('/.copilot/jb/') && /\/partition-\d+\.jsonl$/.test(norm);
}
