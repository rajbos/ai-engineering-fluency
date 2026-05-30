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

	clearExpiredCache(): void {
		// Remove cache entries for files that no longer exist
		const filesToCheck = Array.from(this.sessionFileCache.keys());
		for (const filePath of filesToCheck) {
			try {
				if (!fs.existsSync(filePath)) {
					this.sessionFileCache.delete(filePath);
				}
			} catch (error) {
				// File access error, remove from cache
				this.sessionFileCache.delete(filePath);
			}
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
	loadCacheFromStorage(): void {
		try {
			const cacheId = this.getCacheIdentifier();
			const versionKey = `sessionFileCacheVersion_${cacheId}`;
			const cacheKey = `sessionFileCache_${cacheId}`;
			
			// One-time migration: clean up old per-session cache keys from previous versions
			this.migrateOldCacheKeys(cacheId);
			
			// Check cache version first
			const storedVersion = this.context.globalState.get<number>(versionKey);
			if (storedVersion !== this.cacheVersion) {
				this.deps.log(`Cache version mismatch (stored: ${storedVersion}, current: ${this.cacheVersion}) for ${cacheId}. Clearing cache.`);
				this.sessionFileCache = new Map();
				// Reset the clean-sync flag so the next sync deletes stale Azure entities
				try { this.context.globalState.update('backend.lastCleanSyncVersion', undefined); } catch { /* best-effort */ }
				return;
			}

			const cacheData = this.context.globalState.get<Record<string, SessionFileCache>>(cacheKey);
			if (cacheData) {
				this.sessionFileCache = new Map(Object.entries(cacheData));
				this.deps.log(`Loaded ${this.sessionFileCache.size} cached session files from storage (${cacheId})`);
			} else {
				this.deps.log(`No cached session files found in storage for ${cacheId}`);
			}
		} catch (error) {
			this.deps.error(`Error loading cache from storage: ${error}`);
			// Start with empty cache on error
			this.sessionFileCache = new Map();
		}
	}

	/**
	 * One-time migration: remove old per-session cache keys that were created by
	 * earlier versions of the extension (keys containing sessionId or timestamp).
	 * Also removes the legacy unscoped keys ('sessionFileCache', 'sessionFileCacheVersion').
	 */
	migrateOldCacheKeys(currentCacheId: string): void {
		try {
			const allKeys = this.context.globalState.keys();
			const currentCacheKey = `sessionFileCache_${currentCacheId}`;
			const currentVersionKey = `sessionFileCacheVersion_${currentCacheId}`;
			let removedCount = 0;
			for (const key of allKeys) {
				if (this.removeObsoleteCacheKey(key, currentCacheKey, currentVersionKey)) {
					removedCount++;
				}
			}
			if (removedCount > 0) {
				this.deps.log(`Migrated: removed ${removedCount} old cache keys from globalState`);
			}
		} catch (error) {
			this.deps.error(`Error migrating old cache keys: ${error}`);
		}
	}

	private removeObsoleteCacheKey(key: string, currentCacheKey: string, currentVersionKey: string): boolean {
		if (key.startsWith('sessionFileCacheTimestamp_')) {
			this.context.globalState.update(key, undefined);
			return true;
		}
		if (key.startsWith('sessionFileCache_') && key !== currentCacheKey) {
			const suffix = key.replace('sessionFileCache_', '');
			if (suffix !== 'dev' && suffix !== 'prod') {
				this.context.globalState.update(key, undefined);
				return true;
			}
		}
		if (key.startsWith('sessionFileCacheVersion_') && key !== currentVersionKey) {
			const suffix = key.replace('sessionFileCacheVersion_', '');
			if (suffix !== 'dev' && suffix !== 'prod') {
				this.context.globalState.update(key, undefined);
				return true;
			}
		}
		if (key === 'sessionFileCache' || key === 'sessionFileCacheVersion') {
			this.context.globalState.update(key, undefined);
			return true;
		}
		return false;
	}

	async saveCacheToStorage(): Promise<void> {
		const acquired = await this.acquireCacheLock();
		if (!acquired) {
			this.deps.log('Cache lock held by another VS Code window, skipping save');
			return;
		}
		try {
			const cacheId = this.getCacheIdentifier();
			const versionKey = `sessionFileCacheVersion_${cacheId}`;
			const cacheKey = `sessionFileCache_${cacheId}`;
			
			// Convert Map to plain object for storage
			const cacheData = Object.fromEntries(this.sessionFileCache);
			await this.context.globalState.update(cacheKey, cacheData);
			await this.context.globalState.update(versionKey, this.cacheVersion);
			this.deps.log(`Saved ${this.sessionFileCache.size} cached session files to storage (version ${this.cacheVersion}, ${cacheId})`);
			// Publish a shared on-disk snapshot so other VS Code windows can reload the
			// parsed data instead of re-reading every session file themselves.
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
	 * Union the existing on-disk snapshot with the in-memory cache, keeping the
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
