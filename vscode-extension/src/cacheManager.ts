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
	 * Acquire an exclusive file lock for cache writes.
	 * Uses atomic file creation (O_EXCL / CREATE_NEW) to prevent concurrent writes
	 * across multiple VS Code windows of the same edition.
	 * Returns true if lock acquired, false if another instance holds it.
	 */
	async acquireCacheLock(): Promise<boolean> {
		const lockPath = this.getCacheLockPath();
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
		const lockPath = this.getCacheLockPath();
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
		} catch (error) {
			this.deps.error(`Error saving cache to storage: ${error}`);
		} finally {
			await this.releaseCacheLock();
		}
	}
}
