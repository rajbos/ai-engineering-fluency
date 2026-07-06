/**
 * Cache invalidation policy (Strategy pattern).
 *
 * Separates the *when* and *how* of cache validation and eviction from the
 * cache storage mechanics in CacheManager and cliCache.
 */

/** Minimum metadata required by any cache entry for policy decisions. */
export interface CacheEntryMeta {
	mtime: number;
	size?: number;
}

/**
 * Strategy interface for cache validation and eviction.
 * Implementations encapsulate the policy; callers decide when to invoke it.
 */
export interface CachePolicy<T extends CacheEntryMeta> {
	/** Returns true when the cached entry is still consistent with the current file stats. */
	isValid(entry: T, currentMtime: number, currentSize: number): boolean;
	/** Evicts entries from the cache map in-place according to this policy. */
	evict(cache: Map<string, T>): void;
}

/**
 * VS Code extension cache policy.
 *
 * - Validates using mtime + size equality; treats a missing `size` field as
 *   invalid so old-format entries are upgraded automatically.
 * - Triggers eviction when the map grows past `triggerThreshold` and removes
 *   the `evictCount` oldest entries (Maps preserve insertion order).
 */
export class VsCodeCachePolicy<T extends CacheEntryMeta> implements CachePolicy<T> {
	private readonly triggerThreshold: number;
	private readonly evictCount: number;
	private readonly log: (msg: string) => void;

	constructor(
		log: (msg: string) => void,
		triggerThreshold = 3100,
		evictCount = 100,
	) {
		this.log = log;
		this.triggerThreshold = triggerThreshold;
		this.evictCount = evictCount;
	}

	isValid(entry: T, currentMtime: number, currentSize: number): boolean {
		if (typeof entry.size !== 'number') {
			return false; // Missing size means old cache format — upgrade it
		}
		return entry.mtime === currentMtime && entry.size === currentSize;
	}

	evict(cache: Map<string, T>): void {
		if (cache.size <= this.triggerThreshold) {
			return;
		}
		const keysToDelete: string[] = [];
		let count = 0;
		for (const key of cache.keys()) {
			keysToDelete.push(key);
			if (++count >= this.evictCount) {
				break;
			}
		}
		for (const key of keysToDelete) {
			cache.delete(key);
		}
		this.log(`Cache size limit reached, removed ${keysToDelete.length} oldest entries. Current size: ${cache.size}`);
	}
}

/**
 * CLI cache policy.
 *
 * - Validates using mtime + size equality; both fields must be present and match.
 * - Evicts at save time by sorting by descending mtime and retaining the most
 *   recently used `maxEntries` entries.
 */
export class CliCachePolicy<T extends CacheEntryMeta> implements CachePolicy<T> {
	private readonly maxEntries: number;

	constructor(maxEntries = 2000) {
		this.maxEntries = maxEntries;
	}

	isValid(entry: T, currentMtime: number, currentSize: number): boolean {
		return entry.mtime === currentMtime && entry.size === currentSize;
	}

	evict(cache: Map<string, T>): void {
		if (cache.size <= this.maxEntries) {
			return;
		}
		const sorted = [...cache.entries()].sort((a, b) => b[1].mtime - a[1].mtime);
		cache.clear();
		for (const [key, value] of sorted.slice(0, this.maxEntries)) {
			cache.set(key, value);
		}
	}
}
