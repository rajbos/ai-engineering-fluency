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
 * treated as a full entry (false). A token result does not make it full: the details path never
 * runs the full usage analysis, so the entry keeps a default usageAnalysis. It is therefore a
 * placeholder unless it inherits from an existing full entry; only a full analysis result
 * (getSessionFileDataCached()) removes the marker. Real token fields are still preserved.
 */
export function isDetailsOnlyPlaceholder(existing: SessionFileCache | undefined): boolean {
	return !existing || existing.detailsOnly === true;
}
