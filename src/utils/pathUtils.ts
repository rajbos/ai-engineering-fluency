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
