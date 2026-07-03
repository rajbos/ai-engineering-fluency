/**
 * Session file cache management.
 * Handles persistent caching of parsed session data to avoid re-reading files.
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import type { SessionFileCache } from './types';
import { type CachePolicy, VsCodeCachePolicy } from './cachePolicy';

export interface CacheManagerDeps {
	log: (msg: string) => void;
	warn: (msg: string) => void;
	error: (msg: string) => void;
}

export class CacheManager {
	private sessionFileCache: Map<string, SessionFileCache> = new Map();
	private readonly context: vscode.ExtensionContext;
	private readonly deps: CacheManagerDeps;
	private readonly cacheVersion: number;
	private readonly policy: CachePolicy<SessionFileCache>;

	constructor(
		context: vscode.ExtensionContext,
		deps: CacheManagerDeps,
		cacheVersion: number,
		policy?: CachePolicy<SessionFileCache>,
	) {
		this.context = context;
		this.deps = deps;
		this.cacheVersion = cacheVersion;
		this.policy = policy ?? new VsCodeCachePolicy(deps.log);
	}

	get cache(): Map<string, SessionFileCache> {
		return this.sessionFileCache;
	}

	// Cache management methods
	/**
	 * Checks if the cache is valid for a file by comparing mtime and size.
	 * If the cache entry is missing size (old format), treat as invalid so it will be upgraded.
	 */
	isCacheValid(filePath: string, currentMtime: number, currentSize: number): boolean {
		const cached = this.sessionFileCache.get(filePath);
		if (!cached) {
			return false;
		}
		return this.policy.isValid(cached, currentMtime, currentSize);
	}

	getCachedSessionData(filePath: string): SessionFileCache | undefined {
		return this.sessionFileCache.get(filePath);
	}

	/**
	 * Sets the cache entry for a session file, including file size.
	 */
	setCachedSessionData(filePath: string, data: SessionFileCache, fileSize?: number): void {
		if (typeof fileSize === 'number') {
			data.size = fileSize;
		}
		this.sessionFileCache.set(filePath, data);
		this.policy.evict(this.sessionFileCache);
	}

	async clearExpiredCache(): Promise<void> {
		// Remove cache entries for files that no longer exist (async to avoid blocking the event loop)
		const filesToCheck = Array.from(this.sessionFileCache.keys());
		const BATCH_SIZE = 50;
		for (let i = 0; i < filesToCheck.length; i += BATCH_SIZE) {
			await Promise.all(
				filesToCheck.slice(i, i + BATCH_SIZE).map(async (filePath) => {
					try {
						await fs.promises.access(filePath);
					} catch {
						this.sessionFileCache.delete(filePath);
					}
				})
			);
		}
	}

	/**
	 * Generate a cache identifier based on VS Code extension mode.
	 * VS Code editions (stable vs insiders) already have separate globalState storage,
	 * so we only need to distinguish between production and development (debug) mode.
	 * In development mode, each VS Code window gets a unique cache identifier using
	 * the session ID, preventing the Extension Development Host from sharing/fighting
	 * with the main dev window's cache.
	 */
	getCacheIdentifier(): string {
		if (this.context.extensionMode === vscode.ExtensionMode.Development) {
			// Use a short hash of the session ID to keep the key short but unique per window
			const sessionId = vscode.env.sessionId;
			const hash = sessionId.substring(0, 8);
			return `dev-${hash}`;
		}
		return 'prod';
	}

	/**
	 * Get the path for the cache lock file.
	 * Uses globalStorageUri which is already scoped per VS Code edition.
	 */
	getCacheLockPath(): string {
		const cacheId = this.getCacheIdentifier();
		return path.join(this.context.globalStorageUri.fsPath, `cache_${cacheId}.lock`);
	}

	/**
	 * Get the path for the refresh leader lock file.
	 * Held by the single window ("leader") that performs the heavy discover+parse
	 * pass, so that other windows ("followers") can skip parsing and reload the
	 * shared snapshot instead. Shared per VS Code edition via globalStorageUri.
	 */
	getRefreshLockPath(): string {
		const cacheId = this.getCacheIdentifier();
		return path.join(this.context.globalStorageUri.fsPath, `refresh_${cacheId}.lock`);
	}

	/**
	 * Acquire an exclusive file lock for cache writes.
	 * Uses atomic file creation (O_EXCL / CREATE_NEW) to prevent concurrent writes
	 * across multiple VS Code windows of the same edition.
	 * Returns true if lock acquired, false if another instance holds it.
	 */
	async acquireCacheLock(): Promise<boolean> {
		return this.acquireLock(this.getCacheLockPath());
	}

	/**
	 * Try to become the refresh leader. Returns true if this window acquired the
	 * leader lock (and must therefore perform the heavy parse + publish a snapshot),
	 * false if another window already holds it (this window should follow).
	 */
	async acquireRefreshLock(): Promise<boolean> {
		return this.acquireLock(this.getRefreshLockPath());
	}

	/**
	 * Renew (heartbeat) the refresh leader lock so a legitimately long-running parse
	 * is not mistaken for a stale lock by another window. Only renews a lock we own.
	 * Returns true if the lock is still owned by us after the renew attempt.
	 */
	async renewRefreshLock(): Promise<boolean> {
		const lockPath = this.getRefreshLockPath();
		try {
			const content = await fs.promises.readFile(lockPath, 'utf-8');
			const lock = JSON.parse(content);
			if (lock.sessionId !== vscode.env.sessionId) {
				return false;
			}
			await fs.promises.writeFile(
				lockPath,
				JSON.stringify({ sessionId: vscode.env.sessionId, pid: process.pid, timestamp: Date.now() }),
			);
			return true;
		} catch {
			return false;
		}
	}

	/** Release the refresh leader lock, but only if we own it. */
	async releaseRefreshLock(): Promise<void> {
		return this.releaseLock(this.getRefreshLockPath());
	}

	/**
	 * Generic atomic lock acquisition shared by the cache-save lock and the
	 * refresh leader lock.
	 */
	private async acquireLock(lockPath: string): Promise<boolean> {
		try {
			await fs.promises.mkdir(path.dirname(lockPath), { recursive: true });
			return await this.writeLockFile(lockPath);
		} catch (err: unknown) {
			const errCode = err instanceof Error ? (err as NodeJS.ErrnoException).code : undefined;
			if (errCode !== 'EEXIST') {
				const message = err instanceof Error ? err.message : String(err);
				this.deps.warn(`Unexpected error acquiring cache lock: ${message}`);
				return false;
			}
			return this.handleExistingLock(lockPath);
		}
	}

	private async writeLockFile(lockPath: string): Promise<boolean> {
		try {
			const fd = await fs.promises.open(lockPath, 'wx');
			await fd.writeFile(JSON.stringify({ sessionId: vscode.env.sessionId, pid: process.pid, timestamp: Date.now() }));
			await fd.close();
			return true;
		} catch (err: unknown) {
			if (err instanceof Error && (err as NodeJS.ErrnoException).code === 'EEXIST') { throw err; }
			return false;
		}
	}

	private checkOwnerAlive(pid: unknown): boolean {
		if (typeof pid !== 'number') { return true; }
		try {
			process.kill(pid, 0);
			return true;
		} catch (killErr: unknown) {
			if (killErr instanceof Error && (killErr as NodeJS.ErrnoException).code === 'ESRCH') {
				return false; // Process no longer exists
			}
			return true; // EPERM means process exists but is owned by another user
		}
	}

	private async handleExistingLock(lockPath: string): Promise<boolean> {
		try {
			const content = await fs.promises.readFile(lockPath, 'utf-8');
			const lock = JSON.parse(content);
			const staleThreshold = 5 * 60 * 1000;
			const ownerAlive = this.checkOwnerAlive(lock.pid);
			const isTimestampStale = Date.now() - lock.timestamp > staleThreshold;
			if (!ownerAlive || isTimestampStale) {
				this.deps.log(ownerAlive ? 'Breaking stale cache lock' : 'Breaking stale cache lock (owner process no longer running)');
				await fs.promises.unlink(lockPath);
				return this.writeLockFile(lockPath);
			}
		} catch {
			// Can't read lock file — might have been deleted by the owner already
		}
		return false;
	}

	/**
	 * Release the cache lock file, but only if we own it.
	 */
	async releaseCacheLock(): Promise<void> {
		return this.releaseLock(this.getCacheLockPath());
	}

	/** Generic lock release shared by the cache-save and refresh leader locks. */
	private async releaseLock(lockPath: string): Promise<void> {
		try {
			const content = await fs.promises.readFile(lockPath, 'utf-8');
			const lock = JSON.parse(content);
			if (lock.sessionId === vscode.env.sessionId) {
				await fs.promises.unlink(lockPath);
			}
		} catch {
			// Lock file already gone or unreadable — nothing to do
		}
	}

	// Persistent cache storage methods

	/**
	 * Load the session file cache from the shared on-disk snapshot.
	 * The cache is now stored exclusively on disk (globalStorageUri) to avoid
	 * hitting VS Code's globalState size limit (~2-3 MB warning threshold).
	 * Also removes any legacy cache data from globalState as a one-time migration.
	 */
	async loadCacheFromStorage(): Promise<void> {
		try {
			const cacheId = this.getCacheIdentifier();

			// One-time migration: remove all cache entries from globalState now that
			// the disk snapshot is the sole source of truth.
			this.migrateOldCacheKeys(cacheId);

			// Load from the shared on-disk snapshot (globalStorageUri).
			const snapshotPath = this.getSharedSnapshotPath();
			try {
				const content = await fs.promises.readFile(snapshotPath, 'utf-8');
				const envelope = JSON.parse(content);

				if (!envelope || typeof envelope !== 'object') {
					this.deps.log(`No valid snapshot found for ${cacheId}, starting with empty cache`);
					return;
				}

				// Cache version mismatch: reset stale-entity cleanup flag so the next
				// sync will re-verify and delete obsolete Azure entities.
				if (envelope.cacheVersion !== this.cacheVersion) {
					this.deps.log(`Cache version mismatch (stored: ${envelope.cacheVersion}, current: ${this.cacheVersion}) for ${cacheId}. Clearing cache.`);
					this.sessionFileCache = new Map();
					try { this.context.globalState.update('backend.lastCleanSyncVersion', undefined); } catch { /* best-effort */ }
					return;
				}

				if (
					envelope.schemaVersion !== CacheManager.SNAPSHOT_SCHEMA_VERSION ||
					typeof envelope.entries !== 'object'
				) {
					this.deps.log(`Snapshot schema mismatch or missing entries for ${cacheId}, starting with empty cache`);
					return;
				}

				this.sessionFileCache = new Map(
					Object.entries(envelope.entries as Record<string, SessionFileCache>),
				);
				this.deps.log(`Loaded ${this.sessionFileCache.size} cached session files from disk snapshot (${cacheId})`);

				// Record the snapshot mtime so loadSharedSnapshotIfChanged won't reload it redundantly.
				try {
					const stat = await fs.promises.stat(snapshotPath);
					this.lastLoadedSnapshotMtime = stat.mtimeMs;
				} catch { /* best-effort */ }

			} catch (readErr: unknown) {
				if ((readErr as NodeJS.ErrnoException).code === 'ENOENT') {
					this.deps.log(`No snapshot found for ${cacheId}, starting with empty cache`);
				} else {
					throw readErr;
				}
			}
		} catch (error) {
			this.deps.error(`Error loading cache from storage: ${error}`);
			this.sessionFileCache = new Map();
		}
	}

	/**
	 * Remove all session file cache entries from globalState.
	 * The cache now lives exclusively on disk (globalStorageUri snapshot).
	 * Clears both legacy keys from old extension versions AND the current scoped keys
	 * so that existing installations shed the large payload on their next startup.
	 * Idempotent: calling on an already-migrated store is a no-op.
	 */
	migrateOldCacheKeys(_currentCacheId: string): void {
		try {
			const allKeys = this.context.globalState.keys();
			let removedCount = 0;
			for (const key of allKeys) {
				if (this.isCacheGlobalStateKey(key)) {
					this.context.globalState.update(key, undefined);
					removedCount++;
				}
			}
			if (removedCount > 0) {
				this.deps.log(`Migrated: removed ${removedCount} cache keys from globalState (cache now on disk)`);
			}
		} catch (error) {
			this.deps.error(`Error migrating old cache keys: ${error}`);
		}
	}

	/** Returns true for any globalState key that holds session-file cache payload. */
	private isCacheGlobalStateKey(key: string): boolean {
		return (
			key === 'sessionFileCache' ||
			key === 'sessionFileCacheVersion' ||
			key.startsWith('sessionFileCache_') ||
			key.startsWith('sessionFileCacheVersion_') ||
			key.startsWith('sessionFileCacheTimestamp_')
		);
	}

	async saveCacheToStorage(): Promise<void> {
		const acquired = await this.acquireCacheLock();
		if (!acquired) {
			this.deps.log('Cache lock held by another VS Code window, skipping save');
			return;
		}
		try {
			const cacheId = this.getCacheIdentifier();

			// Persist to the shared on-disk snapshot only (no globalState write to
			// avoid VS Code's large-extension-state warning).
			this.deps.log(`Saving ${this.sessionFileCache.size} cached session files to disk snapshot (version ${this.cacheVersion}, ${cacheId})`);
			await this.writeSharedSnapshot();
		} catch (error) {
			this.deps.error(`Error saving cache to storage: ${error}`);
		} finally {
			await this.releaseCacheLock();
		}
	}

	// ---------------------------------------------------------------------------
	// Shared on-disk snapshot (cross-window cache sharing)
	//
	// VS Code globalState is loaded into memory once at activation and is NOT
	// propagated live between windows. To let a single "leader" window publish
	// parsed results that other "follower" windows can reload, we mirror the cache
	// to a JSON file in globalStorageUri (a path shared by all windows of the same
	// edition). Writes are atomic (temp file + rename) so readers never observe a
	// partially written file.
	// ---------------------------------------------------------------------------

	/** Schema version for the snapshot envelope; bump on incompatible shape changes. */
	private static readonly SNAPSHOT_SCHEMA_VERSION = 1;

	/** Upper bound on entries kept in the shared snapshot (newest by mtime). */
	private static readonly SNAPSHOT_MAX_ENTRIES = 5000;

	/** mtime (ms) of the snapshot file the last time this window loaded it. */
	private lastLoadedSnapshotMtime = 0;

	getSharedSnapshotPath(): string {
		const cacheId = this.getCacheIdentifier();
		return path.join(this.context.globalStorageUri.fsPath, `cache_${cacheId}.snapshot.json`);
	}

	/**
	 * Atomically write the in-memory cache to the shared snapshot file.
	 *
	 * The write MERGES with whatever is already on disk (keeping the newer entry by
	 * mtime) so that a window with a partial/stale cache can never regress a richer
	 * snapshot published by another window. Must be called while holding the cache
	 * lock to keep the read-modify-write atomic across windows.
	 */
	async writeSharedSnapshot(): Promise<void> {
		const snapshotPath = this.getSharedSnapshotPath();
		const tmpPath = `${snapshotPath}.${process.pid}.${Date.now()}.tmp`;
		try {
			const entries = await this.buildMergedSnapshotEntries();
			const envelope = {
				schemaVersion: CacheManager.SNAPSHOT_SCHEMA_VERSION,
				cacheVersion: this.cacheVersion,
				cacheId: this.getCacheIdentifier(),
				generatedAt: Date.now(),
				entryCount: Object.keys(entries).length,
				entries,
			};
			await fs.promises.mkdir(path.dirname(snapshotPath), { recursive: true });
			await fs.promises.writeFile(tmpPath, JSON.stringify(envelope));
			await fs.promises.rename(tmpPath, snapshotPath);
			// Record our own write so we don't redundantly reload it later.
			try {
				const stat = await fs.promises.stat(snapshotPath);
				this.lastLoadedSnapshotMtime = stat.mtimeMs;
			} catch { /* best-effort */ }
		} catch (error) {
			this.deps.warn(`Failed to write shared cache snapshot: ${error}`);
			try { await fs.promises.unlink(tmpPath); } catch { /* best-effort cleanup */ }
		}
	}

	/**
	 * Delete the shared on-disk snapshot and reset the loaded-mtime bookmark.
	 * Called by clearCache() so that restarting VS Code does not restore cleared data.
	 */
	async deleteSharedSnapshot(): Promise<void> {
		const snapshotPath = this.getSharedSnapshotPath();
		try {
			await fs.promises.unlink(snapshotPath);
			this.lastLoadedSnapshotMtime = 0;
			this.deps.log(`Deleted shared cache snapshot (${this.getCacheIdentifier()})`);
		} catch (err: unknown) {
			if ((err as NodeJS.ErrnoException).code !== 'ENOENT') {
				this.deps.warn(`Failed to delete shared cache snapshot: ${err}`);
			}
		}
	}

	/**
	 * newer entry by mtime, and cap the result to the newest SNAPSHOT_MAX_ENTRIES.
	 */
	private async buildMergedSnapshotEntries(): Promise<Record<string, SessionFileCache>> {
		const existing = await this.readSharedSnapshot();
		const merged: Record<string, SessionFileCache> = existing ? { ...existing } : {};
		for (const [filePath, entry] of this.sessionFileCache) {
			const prev = merged[filePath];
			if (!prev || (typeof entry.mtime === 'number' && entry.mtime >= prev.mtime)) {
				merged[filePath] = entry;
			}
		}
		const keys = Object.keys(merged);
		if (keys.length <= CacheManager.SNAPSHOT_MAX_ENTRIES) {
			return merged;
		}
		const capped: Record<string, SessionFileCache> = {};
		const newestFirst = keys.sort((a, b) => (merged[b].mtime ?? 0) - (merged[a].mtime ?? 0));
		for (const key of newestFirst.slice(0, CacheManager.SNAPSHOT_MAX_ENTRIES)) {
			capped[key] = merged[key];
		}
		return capped;
	}

	/**
	 * Read and validate the shared snapshot. Returns its entries, or undefined when
	 * the file is missing, unreadable, malformed, or written by an incompatible
	 * schema/cache version.
	 */
	async readSharedSnapshot(): Promise<Record<string, SessionFileCache> | undefined> {
		const snapshotPath = this.getSharedSnapshotPath();
		try {
			const content = await fs.promises.readFile(snapshotPath, 'utf-8');
			const envelope = JSON.parse(content);
			if (
				!envelope ||
				envelope.schemaVersion !== CacheManager.SNAPSHOT_SCHEMA_VERSION ||
				envelope.cacheVersion !== this.cacheVersion ||
				typeof envelope.entries !== 'object'
			) {
				return undefined;
			}
			return envelope.entries as Record<string, SessionFileCache>;
		} catch {
			// Missing or partial/corrupt snapshot — caller falls back to its own data.
			return undefined;
		}
	}

	/**
	 * Warm the in-memory cache from the shared snapshot if another window has
	 * published a newer one since we last loaded it. Only entries that are fresher
	 * than (or absent from) our current cache are merged, so locally parsed data is
	 * never overwritten with older snapshot data.
	 *
	 * Returns the number of entries merged.
	 */
	async loadSharedSnapshotIfChanged(): Promise<number> {
		const snapshotPath = this.getSharedSnapshotPath();
		let mtimeMs: number;
		try {
			const stat = await fs.promises.stat(snapshotPath);
			mtimeMs = stat.mtimeMs;
		} catch {
			return 0; // No snapshot yet.
		}
		if (mtimeMs <= this.lastLoadedSnapshotMtime) {
			return 0; // Already loaded this (or a newer) version.
		}
		const entries = await this.readSharedSnapshot();
		if (!entries) {
			// Remember the mtime so we don't repeatedly retry an incompatible snapshot.
			this.lastLoadedSnapshotMtime = mtimeMs;
			return 0;
		}
		const merged = this.mergeSnapshotEntries(entries);
		this.lastLoadedSnapshotMtime = mtimeMs;
		if (merged > 0) {
			this.deps.log(`Warmed cache from shared snapshot: merged ${merged} entr${merged === 1 ? 'y' : 'ies'}`);
		}
		return merged;
	}

	/**
	 * Merge snapshot entries into the in-memory cache, keeping whichever entry has
	 * the newer mtime. An entry missing locally is always taken from the snapshot.
	 */
	private mergeSnapshotEntries(entries: Record<string, SessionFileCache>): number {
		let merged = 0;
		for (const [filePath, entry] of Object.entries(entries)) {
			if (!entry || typeof entry.mtime !== 'number') { continue; }
			const existing = this.sessionFileCache.get(filePath);
			if (!existing || entry.mtime > existing.mtime) {
				this.sessionFileCache.set(filePath, entry);
				merged++;
			}
		}
		if (merged > 0) {
			this.policy.evict(this.sessionFileCache);
		}
		return merged;
	}
}
