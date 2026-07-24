import * as path from 'path';

import { resolveFileUri } from '../workspacePathResolver';

/**
 * Normalize a filesystem path to forward slashes.
 * Use this before doing platform-agnostic path comparisons or splitting.
 */
export function normalizePath(p: string): string {
	return p.replace(/\\/g, '/');
}

/**
 * Backward-compatible alias for callers that only need separator normalization.
 */
export const normalizePathSeparators = normalizePath;

/**
 * Convert a normalized path back to the current platform's native separators.
 */
export function toPlatformPath(p: string): string {
	return path.sep === '/'
		? normalizePath(p)
		: normalizePath(p).replace(/\//g, path.sep);
}

/**
 * Split a path into non-empty segments after normalizing separators.
 */
export function splitNormalizedPath(p: string): string[] {
	return normalizePath(p).split('/').filter(segment => segment.length > 0);
}

/**
 * Normalize a filesystem path for case-insensitive substring/prefix matching.
 */
export function normalizePathForComparison(p: string): string {
	return normalizePath(p).toLowerCase();
}

/**
 * Normalize a filesystem path for deduplication across adapters.
 */
export function normalizePathForDedup(
	p: string,
	platform: NodeJS.Platform = process.platform as NodeJS.Platform
): string {
	const normalized = normalizePath(p);
	return platform === 'linux' ? normalized : normalized.toLowerCase();
}

/**
 * Normalize a session workspace path up to its parent repository root by stripping a trailing
 * agent-worktree segment created by Copilot CLI or Claude Code:
 *   "<repo>/copilot-worktrees/<name>[/...]"      -> "<repo>"
 *   "<repo>/.claude/worktrees/<name>[/...]"       -> "<repo>"
 * This lets the worktree scanner cover the whole repo (finding sibling worktrees) instead of a
 * single worktree subfolder. The original path is returned unchanged when neither pattern is
 * present, and the input's separator style is preserved.
 */
export function normalizeToRepoRoot(p: string): string {
	const copilot = p.match(/^(.+?)[\\/]copilot-worktrees[\\/][^\\/]+(?:[\\/].*)?$/i);
	if (copilot) { return copilot[1]; }
	const claude = p.match(/^(.+?)[\\/]\.claude[\\/]worktrees[\\/][^\\/]+(?:[\\/].*)?$/i);
	if (claude) { return claude[1]; }
	return p;
}

/**
 * Derive a repository display name from a session's workspace/cwd path.
 *
 * Two agent-worktree layouts exist and place the repo folder on opposite sides of
 * the "copilot-worktrees" marker:
 *   - Copilot CLI app store:  "<home>/.copilot/copilot-worktrees/<repo>/<worktree>[/...]" -> "<repo>"
 *     (the repo folder comes *after* the marker)
 *   - User-repo / Claude:     "<repo>/copilot-worktrees/<name>[/...]"                     -> "<repo>"
 *     "<repo>/.claude/worktrees/<name>[/...]"                                             -> "<repo>"
 *     (the repo folder comes *before* the marker; handled by normalizeToRepoRoot)
 *
 * Using a plain path.basename() on an app-store worktree path yields the worktree
 * name (e.g. "rajbos-supreme-carnival") instead of the repository — this helper
 * returns the repository folder name instead. Falls back to the last path segment.
 */
export function getRepoNameFromWorkspacePath(p: string): string {
	const segments = splitNormalizedPath(p);
	const lower = segments.map(s => s.toLowerCase());
	const wtIdx = lower.lastIndexOf('copilot-worktrees');
	// App-store layout: repo folder is the segment right after the marker, which is
	// itself nested directly under the ".copilot" store directory.
	if (wtIdx > 0 && lower[wtIdx - 1] === '.copilot' && wtIdx + 1 < segments.length) {
		return segments[wtIdx + 1];
	}
	const rootSegments = splitNormalizedPath(normalizeToRepoRoot(p));
	return rootSegments.length > 0 ? rootSegments[rootSegments.length - 1] : path.basename(p);
}

/**
 * Strip the synthetic leading slash from Windows drive-letter URI paths.
 * Example: "/C:/repo/file.ts" -> "C:/repo/file.ts".
 */
export function stripWindowsDriveUriPrefix(
	rawPath: string,
	platform: NodeJS.Platform = process.platform as NodeJS.Platform
): string {
	return platform === 'win32' && /^\/[a-zA-Z]:/.test(rawPath)
		? rawPath.substring(1)
		: rawPath;
}

/**
 * Returns true when the path segment looks like a Windows drive root ("C:").
 */
export function hasWindowsDriveSegment(
	segment: string | undefined,
	platform: NodeJS.Platform = process.platform as NodeJS.Platform
): boolean {
	return platform === 'win32' && /^[a-zA-Z]:$/.test(segment ?? '');
}

/**
 * Convert a file:// URI to a plain filesystem path.
 *
 * Non-file strings are returned unchanged.
 */
export function fileUriToPath(uri: string): string {
	if (!uri.startsWith('file://')) { return uri; }
	const normalized = uri.replace(/^file:\/\/localhost(\/|$)/, 'file:///');
	return resolveFileUri(normalized) ?? uri;
}
