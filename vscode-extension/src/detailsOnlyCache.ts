import type { SessionFileCache } from '../../src/types';

/**
 * True when a cache entry may be served by getSessionFileDataCached(): its mtime and size
 * match the file AND it came from a full analysis. A `detailsOnly` entry (created by the
 * Details/Diagnostics path for a session never fully analyzed) carries tokens 0 and an empty
 * usage analysis, so serving it as a hit would freeze the session at zero until the file changes.
 */
export function isFullCacheHit(cached: SessionFileCache | undefined, mtime: number, size: number): cached is SessionFileCache {
	return !!cached && !cached.detailsOnly && cached.mtime === mtime && cached.size === size;
}

/**
 * Whether a cache entry written by the details-only parse is a placeholder (true) or may be
 * treated as a full entry (false). It is a placeholder only when it is built from nothing:
 * no real token result was supplied and there was no existing full entry to inherit from.
 * An existing detailsOnly entry stays a placeholder until a full analysis replaces it.
 */
export function isDetailsOnlyPlaceholder(
	existing: SessionFileCache | undefined,
	tokenResultSupplied: boolean
): boolean {
	if (tokenResultSupplied) { return false; }
	return !existing || existing.detailsOnly === true;
}
