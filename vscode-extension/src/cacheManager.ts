/**
 * Session file cache management.
 * Handles persistent caching of parsed session data to avoid re-reading files.
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFileSync } from 'child_process';
import type { SessionFileCache } from '../../src/types';
import { type CachePolicy, VsCodeCachePolicy } from '../../src/cachePolicy';

export interface CacheManagerDeps {
	log: (msg: string) => void;
	warn: (msg: string) => void;
	error: (msg: string) => void;
}

export class CacheManager {
	private static readonly SNAPSHOT_SCHEMA_VERSION = 1;
	private static readonly SNAPSHOT_MAX_ENTRIES = 20_000;

	// Checkpoint constants: save every N new entries or every M milliseconds, whichever comes first
	private static readonly CHECKPOINT_NEW_ENTRIES_THRESHOLD = 100;
	private static readonly CHECKPOINT_INTERVAL_MS = 20_000;

	private sessionFileCache: Map<string, SessionFileCache> = new Map();
	// Paths explicitly removed via deleteCachedSessionData(), for the lifetime of this
	// CacheManager instance, mapped to the mtime of the entry that was removed (0 if none was
	// cached). writeSharedSnapshot()'s merge starts from whatever is already on disk (so a window
	// with a partial in-memory cache can never regress a richer published snapshot — see its own
	// doc comment) — without tracking deletions separately, that same merge would silently
	// resurrect a path removed from `sessionFileCache` the moment it's no longer present in memory
	// to overwrite the stale on-disk copy. Tombstones let the merge tell "never seen this session"
	// (leave the disk copy alone) apart from "seen and removed" (must not survive the merge).
	//
	// The recorded mtime is this tombstone's generation baseline, not just a boolean flag: another
	// window can legitimately republish the same path (rediscover it, or simply save after this
	// one decided to delete it) with a newer entry than what this window last saw. Blindly
	// stripping every tombstoned path from the freshly-read on-disk snapshot — regardless of how
	// new that disk entry is — would destroy that other window's valid, newer publish. Comparing
	// against the baseline lets a same-or-older disk entry (what this window actually intended to
	// delete) be stripped while a strictly newer one survives.
	private deletedFilePaths: Map<string, number> = new Map();
	private readonly context: vscode.ExtensionContext;
	private readonly deps: CacheManagerDeps;
	private readonly cacheVersion: number;
	private readonly policy: CachePolicy<SessionFileCache>;
	private lastLoadedSnapshotMtime = 0;
	// Size of the snapshot file at lastLoadedSnapshotMtime, paired with the mtime so a same-tick
	// republish with different content (different size) is still detected. See
	// loadSharedSnapshotIfChanged()'s guard comment.
	private lastLoadedSnapshotSize = -1;
	// Publish generation of the loaded snapshot. Writers bump a monotonically increasing counter
	// kept in a tiny sidecar file (getSnapshotSeqPath()), so every publish has a distinct, cheap
	// identity that survives delete/recreate and is readable in a few bytes — letting
	// loadSharedSnapshotIfChanged() skip an unchanged snapshot without re-reading or parsing the
	// whole snapshot on every idle poll, even on coarse-mtime filesystems where the stat ties.
	private lastLoadedSnapshotPublishSeq = 0;
	// Checkpoint tracking
	private lastCheckpointTime = 0;
	private entriesSinceLastCheckpoint = 0;
	private checkpointInProgress = false;
	// Bumped by resetCheckpointCounters(). Lets a still-in-flight checkpoint (see
	// checkpointCacheInternal()) tell whether a new refresh cycle reset the counters out from
	// under it while its own save was awaiting, so it doesn't subtract its now-stale captured
	// count against a counter that has since started fresh.
	private checkpointCounterGeneration = 0;
	// The currently in-flight checkpoint's own settle promise (set by maybeCheckpointCache()/
	// forceCheckpointCache(), resolved once checkpointCacheInternal() and its `.finally()` have
	// both run). Lets a caller that must not race a checkpoint's write — clearCache() deleting
	// the snapshot, or a new refresh cycle about to reset the counters that write depends on —
	// await its completion instead of merely polling checkpointInProgress.
	private checkpointSettlePromise: Promise<void> | undefined;
	// Bumped by clearAllCachedData(). writeSharedSnapshot() captures this before it reads the
	// (possibly about-to-be-cleared) on-disk snapshot and re-checks it right before the atomic
	// rename — if a clear landed in between, that write is built from stale, pre-clear data and
	// would resurrect exactly what the clear just removed, so it aborts instead of persisting.
	private cacheClearGeneration = 0;

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

	/**
	 * Clears every in-memory cache entry and tombstone, and bumps cacheClearGeneration so a
	 * checkpoint already mid-flight (built from pre-clear data) discards its write instead of
	 * resurrecting it — see writeSharedSnapshot()'s doc comment. Callers that must not race that
	 * in-flight checkpoint's own write to the shared snapshot file (e.g. clearCache() deleting it
	 * right after) should also await awaitInFlightCheckpoint() before doing so.
	 *
	 * Also clears deletedFilePaths: a pre-clear tombstone left behind would otherwise still be
	 * applied by buildMergedSnapshotEntries() on a later save, stripping an entry that a window
	 * legitimately republishes at or below that stale baseline mtime — a "Clear Cache" is meant to
	 * reset all cache state, deletion decisions included, not just the live entries.
	 *
	 * Also resets the checkpoint dirty-count accounting (same fields resetCheckpointCounters()
	 * touches). Without this, dirty work left over from before the clear stayed counted as dirty
	 * against a now-empty cache: the next leader refresh's flushPendingCheckpointBeforeReset()
	 * would see that stale count and perform a full checkpoint save of the just-cleared (empty)
	 * cache before parsing anything of its own — harmless in effect, since there is genuinely
	 * nothing to lose, but a wasted disk round trip that defeats the "skip when nothing changed"
	 * optimization on the very next cycle after every clear.
	 */
	clearAllCachedData(): void {
		this.sessionFileCache.clear();
		this.deletedFilePaths.clear();
		this.cacheClearGeneration++;
		this.resetCheckpointCounters();
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
	 * Sets the cache entry for a session file, including file size. Every call is a real write —
	 * a fresh parse, or an existing entry enriched in place with the same mtime/size (e.g. the
	 * debug-log supplement path marking `debugLogChecked`/reconciling exact tokens) — so every
	 * call marks the cache dirty for checkpointing purposes. An earlier version gated this on an
	 * mtime/size-based "isNewEntry" flag the caller computed; that missed exactly the in-place
	 * enrichment case, so a checkpoint could skip persisting it and lose it to a crash before the
	 * next full save.
	 */
	setCachedSessionData(filePath: string, data: SessionFileCache, fileSize?: number): void {
		if (typeof fileSize === 'number') {
			data.size = fileSize;
		}
		this.sessionFileCache.set(filePath, data);
		// A path can be legitimately rediscovered after being deleted (see deleteCachedSessionData);
		// a stale tombstone must not keep blocking it from ever being persisted again.
		this.deletedFilePaths.delete(filePath);
		this.policy.evict(this.sessionFileCache);
		this.entriesSinceLastCheckpoint++;
	}

	/**
	 * Removes a cache entry and records a tombstone so it does not get silently resurrected by
	 * writeSharedSnapshot()'s merge (which starts from whatever is already on disk) the next time
	 * the cache is saved. Prefer this over `cache.delete(path)` directly for any deletion whose
	 * effect must actually survive a save — an in-memory-only delete is undone by the very next
	 * trySaveCacheToStorage()/checkpoint.
	 */
	deleteCachedSessionData(filePath: string): void {
		const existing = this.sessionFileCache.get(filePath);
		const previousTombstoneMtime = this.deletedFilePaths.get(filePath);
		this.sessionFileCache.delete(filePath);
		// A second, independent deletion of an already-tombstoned path (e.g. clearExpiredCache()'s
		// fire-and-forget sweep racing with reconcilePreloadedAgainstDiscovery()'s synchronous one)
		// finds no `existing` entry — the first deletion already removed it from sessionFileCache —
		// so `existing?.mtime ?? 0` alone would silently weaken an already-recorded, stronger
		// baseline down to 0, letting any stale disk entry with a positive mtime pass the
		// newer-than-tombstone check and be resurrected. Keep the strongest (highest) baseline seen.
		const newTombstoneMtime = Math.max(previousTombstoneMtime ?? 0, existing?.mtime ?? 0);
		this.deletedFilePaths.set(filePath, newTombstoneMtime);
		// A tombstone is dirty state too — it must reach the next snapshot save just like a new or
		// changed entry, or a deleted path can sit unpersisted until an unrelated write happens to
		// trigger a checkpoint. But only when something actually changed: an in-memory entry was
		// really removed, or the tombstone's baseline mtime actually advanced. The repeated,
		// independent-deletion race described above is expected and can fire often on the very
		// same already-gone path — counting every one of those no-op calls as dirty would keep
		// nudging the checkpoint threshold with nothing new to save, reproducing the wasted-write
		// problem this dirty-tracking rework exists to fix.
		if (existing !== undefined || newTombstoneMtime !== (previousTombstoneMtime ?? 0)) {
			this.entriesSinceLastCheckpoint++;
		}
	}

	async clearExpiredCache(): Promise<void> {
		// Remove cache entries for files that no longer exist (async to avoid blocking the event loop)
		const filesToCheck = Array.from(this.sessionFileCache.keys());
		const BATCH_SIZE = 50;
		for (let i = 0; i < filesToCheck.length; i += BATCH_SIZE) {
			await Promise.all(
				filesToCheck.slice(i, i + BATCH_SIZE).map(async (filePath) => {
					// Several ecosystems (Copilot CLI, Crush, Kilo, OpenCode, Cursor's state.vscdb#,
					// Codex's state_<n>.sqlite#) reference sessions through a virtual
					// "<db-file>#<session-id>" path, and Windsurf/Devin use a "windsurf://"/"devin://"
					// URI scheme — none of these are real filesystem paths
					// a raw fs.access() can validate; the actual session lives inside the DB (or is
					// resolved by that adapter), not at this literal path. Since deleteCachedSessionData()
					// now tombstones (excluding the path from every future snapshot merge, not just this
					// process's memory — see its own doc comment), wrongly treating one of these as
					// "missing" here would permanently discard a still-valid, expensive-to-rebuild
					// session instead of just transiently dropping it from memory. Leaving them
					// unvalidated here (neither expired nor confirmed) is the safe default; a real fix
					// needs adapter-aware stat resolution, which CacheManager doesn't have.
					if (CacheManager.isVirtualSessionPath(filePath)) { return; }
					try {
						await fs.promises.access(filePath);
					} catch (err) {
						// fs.access() also rejects for reasons that don't mean "this file is gone" —
						// EACCES/EPERM (a permissions hiccup), EBUSY, a transiently unmounted network
						// drive, etc. Given deleteCachedSessionData()'s tombstone now excludes the path
						// from every future snapshot save (not just this process's memory), treating any
						// of those as a confirmed deletion would permanently discard a still-valid,
						// expensive-to-rebuild session over what may be a passing I/O error. Only a
						// "this path definitely doesn't exist" error is trustworthy enough to tombstone.
						const code = (err as NodeJS.ErrnoException)?.code;
						if (code === 'ENOENT' || code === 'ENOTDIR') {
							this.deleteCachedSessionData(filePath);
						}
					}
				})
			);
		}
	}

	private static isVirtualSessionPath(filePath: string): boolean {
		// Every "<db-file>#<session-id>" composite scheme observed across adapters — OpenCode/Crush/
		// Kilo/Copilot CLI's session-store.db, but also Cursor's state.vscdb# and Codex's
		// state_<n>.sqlite# — shares the same shape: a file-extension-like segment right before the
		// '#'. Matching that shape generically (rather than hardcoding '.db#' alone) avoids silently
		// missing the next adapter that reuses this pattern with a different backing-file extension.
		return filePath.includes('://') || /\.[a-zA-Z0-9]+#/.test(filePath);
	}

	/**
	 * Check if a checkpoint save should be triggered based on time or entry count thresholds.
	 * Returns true if checkpoint was triggered.
	 */
	maybeCheckpointCache(): boolean {
		// Nothing to save: a time-threshold-only trigger with zero dirty entries used to still
		// take the full read-merge-stringify-write round trip (see checkpointCacheInternal) for
		// no effect — a wasted, blocking write every CHECKPOINT_INTERVAL_MS while a run is 100%
		// cache hits. Bail out before that work even if the time threshold has elapsed.
		if (this.entriesSinceLastCheckpoint <= 0) {
			return false;
		}
		const now = Date.now();
		const timeElapsed = now - this.lastCheckpointTime;
		const entriesThresholdReached = this.entriesSinceLastCheckpoint >= CacheManager.CHECKPOINT_NEW_ENTRIES_THRESHOLD;
		const timeThresholdReached = timeElapsed >= CacheManager.CHECKPOINT_INTERVAL_MS;

		if ((entriesThresholdReached || timeThresholdReached) && !this.checkpointInProgress) {
			this.startCheckpoint();
			return true;
		}
		return false;
	}

	/** Marks a checkpoint in progress and kicks off checkpointCacheInternal(), tracking its
	 * settle promise so awaitInFlightCheckpoint() can observe completion. Shared by
	 * maybeCheckpointCache() (fire-and-forget) and forceCheckpointCache() (awaited). */
	private startCheckpoint(): void {
		this.checkpointInProgress = true;
		const settling = this.checkpointCacheInternal().finally(() => {
			this.checkpointInProgress = false;
			// Only clear the field if it's still pointing at *this* checkpoint's promise — a new
			// checkpoint could already have started and reassigned it by the time this settles.
			if (this.checkpointSettlePromise === settling) {
				this.checkpointSettlePromise = undefined;
			}
		});
		this.checkpointSettlePromise = settling;
	}

	/**
	 * Whether there is parsed/changed/deleted cache state that has not yet reached disk. Exposed
	 * for callers like _runRefreshCore() that need to know whether resetCheckpointCounters()
	 * would clobber real, unpersisted dirty state before calling it.
	 */
	hasUnflushedCheckpointWork(): boolean {
		return this.entriesSinceLastCheckpoint > 0;
	}

	/**
	 * Resolves once a checkpoint already mid-flight (started by maybeCheckpointCache() or this
	 * method) has fully settled. A no-op if none is in progress. Used wherever a caller's own
	 * write must not race a checkpoint's — see checkpointSettlePromise's doc comment.
	 */
	async awaitInFlightCheckpoint(): Promise<void> {
		if (this.checkpointSettlePromise) {
			await this.checkpointSettlePromise;
		}
	}

	/**
	 * Force an immediate checkpoint save, bypassing maybeCheckpointCache()'s time/entry
	 * thresholds, and await its completion. A no-op if one is already in progress (callers that
	 * care should await awaitInFlightCheckpoint() first) or if nothing is dirty. Used by
	 * _runRefreshCore() to flush a previous cycle's unpersisted work before resetting the
	 * counters that are its only record of being dirty.
	 */
	async forceCheckpointCache(): Promise<void> {
		if (this.entriesSinceLastCheckpoint <= 0 || this.checkpointInProgress) {
			return;
		}
		this.startCheckpoint();
		await this.checkpointSettlePromise;
	}

	/**
	 * Internal method to perform the checkpoint save.
	 *
	 * Only clears the dirty count on an actual persisted write, and only the portion of it this
	 * save actually captured. trySaveCacheToStorage() never throws — it resolves `false` on a
	 * skipped (lock held by another window) or failed save — so resetting unconditionally here
	 * would let a lock-contended tick (an expected, routine occurrence, not a rare error)
	 * silently drop its dirty count. Combined with maybeCheckpointCache()'s "skip when nothing is
	 * dirty" guard, that would leave the change unpersisted with no future tick ever retrying it.
	 *
	 * Subtracting rather than zeroing on success matters too: workers keep calling
	 * setCachedSessionData()/deleteCachedSessionData() while trySaveCacheToStorage() is in flight,
	 * and buildMergedSnapshotEntries() (inside writeSharedSnapshot()) reads the live cache Map at
	 * the start of that write — an entry added after that read is not necessarily reflected in
	 * what actually reached disk. Zeroing the whole counter here would wrongly mark that
	 * in-flight write as checkpointed too, the same "lost on a crash before the next save" risk
	 * this whole checkpoint-dirty-tracking rework exists to close.
	 *
	 * That subtraction is itself only valid against the counter it was captured from. If
	 * resetCheckpointCounters() runs while this save is still in flight — a new leader refresh
	 * cycle starting — it zeros the counter for that new cycle; subtracting this stale, unrelated
	 * count against it afterwards could wrongly erase dirty entries the new cycle has genuinely
	 * accumulated since. checkpointCounterGeneration detects that and skips the update entirely
	 * in that case, leaving the new cycle's own counter (and its own future checkpoint) untouched.
	 *
	 * trySaveCacheToStorage() is documented never to throw, but this awaits it inside a try/catch
	 * anyway: forceCheckpointCache()/awaitInFlightCheckpoint() now await this method's settle
	 * promise directly (unlike the original fire-and-forget-only caller, maybeCheckpointCache()),
	 * so a rejection here would no longer just be an unhandled-rejection warning — it would
	 * propagate into a caller like _runRefreshCore()'s flushPendingCheckpointBeforeReset() and can
	 * fail an otherwise-healthy refresh outright. Treating a thrown error the same as `saved =
	 * false` keeps that contract true in practice, not just by convention.
	 */
	private async checkpointCacheInternal(): Promise<void> {
		const entriesCountAtStart = this.entriesSinceLastCheckpoint;
		this.deps.log(`Checkpointing cache: ${entriesCountAtStart} dirty entries (new, changed, or deleted) since last checkpoint (${((Date.now() - this.lastCheckpointTime) / 1000).toFixed(1)}s elapsed)`);
		await this.saveAndAccount();
	}

	/**
	 * Shared save+accounting core for every full-snapshot persist — a periodic mid-parse
	 * checkpoint and the unconditional end-of-refresh save alike (see saveAndAccountForRefresh()).
	 * Captures the dirty count/generation before saving and only subtracts/updates
	 * lastCheckpointTime once the save actually succeeded and no reset landed mid-save (see
	 * checkpointCounterGeneration's doc comment). Never throws.
	 */
	private async saveAndAccount(): Promise<boolean> {
		const now = Date.now();
		const entriesCountAtStart = this.entriesSinceLastCheckpoint;
		const generationAtStart = this.checkpointCounterGeneration;

		let saved: boolean;
		try {
			saved = await this.trySaveCacheToStorage();
		} catch (error) {
			this.deps.error(`Cache save threw unexpectedly: ${error}`);
			saved = false;
		}
		if (saved && this.checkpointCounterGeneration === generationAtStart) {
			this.lastCheckpointTime = now;
			this.entriesSinceLastCheckpoint = Math.max(0, this.entriesSinceLastCheckpoint - entriesCountAtStart);
		} else if (!saved) {
			this.deps.log('Cache save was skipped or failed; leaving the dirty count intact so the next checkpoint retries it');
		}
		return saved;
	}

	/**
	 * Save the cache to disk and account for it exactly like a checkpoint, unconditionally
	 * (regardless of dirty-count/time thresholds, and regardless of whether a periodic checkpoint
	 * happens to be mid-flight — that concurrent attempt simply loses the cache-file lock race and
	 * reports `false`, the same outcome as any other lock-contended save, never a correctness
	 * problem). Used by persistRefreshResult() at the end of every leader refresh.
	 *
	 * persistRefreshResult()'s save used to call trySaveCacheToStorage() directly, bypassing
	 * checkpoint accounting entirely: entriesSinceLastCheckpoint stayed exactly as dirty as it was
	 * before that fully successful save. The *next* leader cycle's flushPendingCheckpointBeforeReset()
	 * then saw that stale dirty count and performed a redundant extra checkpoint read/merge/write
	 * before it had done anything of its own — for any refresh under the 100-entry threshold, on
	 * every single cycle — defeating the "skip when nothing changed" optimization this whole
	 * checkpoint rework exists for. Routing this save through the same accounting as a checkpoint
	 * closes that gap: a successful end-of-refresh save now leaves nothing dirty behind it.
	 */
	async saveAndAccountForRefresh(): Promise<boolean> {
		return this.saveAndAccount();
	}

	/**
	 * Reset checkpoint counters (call this at the start of a new refresh cycle).
	 *
	 * Deliberately does not touch checkpointInProgress. A checkpoint from the previous cycle can
	 * still be mid-flight (its own trySaveCacheToStorage() awaiting) when this runs — forcing the
	 * flag false here would let maybeCheckpointCache() start a second, overlapping checkpoint
	 * before the first one's own `.finally()` gets a chance to clear it, defeating the "at most
	 * one checkpoint at a time" invariant this flag exists for. checkpointCacheInternal()'s
	 * `.finally()` always clears it once that save actually settles, so there is nothing for this
	 * method to do here.
	 */
	resetCheckpointCounters(): void {
		this.lastCheckpointTime = Date.now();
		this.entriesSinceLastCheckpoint = 0;
		this.checkpointCounterGeneration++;
	}

	/**
	 * Generate a cache identifier based on VS Code extension mode.
	 * VS Code editions (stable vs insiders) already have separate globalState storage,
	 * so we only need to distinguish between production and development (debug) mode.
	 * The identifier is stable across Extension Development Host launches (it is not
	 * derived from vscode.env.sessionId, which changes every F5/debug run and every
	 * fresh worktree). This lets consecutive debug sessions reuse the same on-disk
	 * snapshot instead of re-parsing all session files from scratch every time, while
	 * still keeping debug-mode data isolated from the 'prod' snapshot used by real
	 * installs. Cache invalidation across debug runs is driven by content, not
	 * identity: a schemaVersion/cacheVersion mismatch (see loadCacheFromStorage) still
	 * clears the cache whenever the on-disk shape or parsing logic actually changes.
	 * Concurrent debug windows (e.g. multiple worktrees debugged at once) share this
	 * identifier safely via the same leader-election/lock coordination used for
	 * multiple production windows — see acquireRefreshLock().
	 */
	getCacheIdentifier(): string {
		if (this.context.extensionMode === vscode.ExtensionMode.Development) {
			return 'dev';
		}
		return 'prod';
	}

	/**
	 * Deletes legacy per-session dev-mode cache/lock files (e.g. `cache_dev-<hash>.snapshot.json`,
	 * `.lock`, `.seq`) left behind by older versions of the extension, which used to mint a new dev-<hash>
	 * identifier per Extension Development Host launch — orphaning every past debug session's
	 * snapshot once that window closed. getCacheIdentifier() now returns a stable 'dev'
	 * identifier, so no new files matching this legacy pattern are created; this cleanup only
	 * reclaims leftovers from before that change. Only touches files older than
	 * STALE_DEV_CACHE_AGE_MS, so the current and any still-running sessions' files are never at
	 * risk. Best-effort: failures (e.g. a file locked by another window) are swallowed, not surfaced.
	 */
	async cleanupStaleDevCacheFiles(): Promise<void> {
		if (this.context.extensionMode !== vscode.ExtensionMode.Development) { return; }
		const STALE_DEV_CACHE_AGE_MS = 24 * 60 * 60 * 1000;
		const dir = this.context.globalStorageUri.fsPath;
		try {
			const entries = await fs.promises.readdir(dir);
			const now = Date.now();
			let removedCount = 0;
			for (const name of entries) {
				if (!/^(cache|refresh|agenttasks|repoprs)_dev-[0-9a-f]+\.(snapshot\.json|lock|seq)$/.test(name)) { continue; }
				const filePath = path.join(dir, name);
				try {
					const stat = await fs.promises.stat(filePath);
					if (now - stat.mtimeMs > STALE_DEV_CACHE_AGE_MS) {
						await fs.promises.unlink(filePath);
						removedCount++;
					}
				} catch { /* file removed/locked concurrently — skip */ }
			}
			if (removedCount > 0) {
				this.deps.log(`Cleaned up ${removedCount} stale dev cache file(s) from previous debug sessions`);
			}
		} catch { /* globalStorage dir missing or unreadable — nothing to clean up */ }
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
	 * Get the path for the agent-tasks refresh lock file.
	 * Held by the single window that refreshes the hourly Copilot cloud-agent snapshot from the
	 * GitHub API, so the other windows never duplicate those API calls. Kept separate from the
	 * cache-refresh leader lock because the two run on different schedules.
	 */
	getAgentTasksLockPath(): string {
		const cacheId = this.getCacheIdentifier();
		return path.join(this.context.globalStorageUri.fsPath, `agenttasks_${cacheId}.lock`);
	}

	/**
	 * Get the path for the repository-PRs refresh lock file.
	 * Held by the single window that refreshes the hourly Repository PRs snapshot from the
	 * GitHub API, so the other windows never duplicate those API calls. Kept separate from the
	 * cache-refresh leader lock and the agent-tasks lock because all three run on independent
	 * schedules and cost independent sets of GitHub API calls.
	 */
	getRepoPrLockPath(): string {
		const cacheId = this.getCacheIdentifier();
		return path.join(this.context.globalStorageUri.fsPath, `repoprs_${cacheId}.lock`);
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
	 * Try to become the window that refreshes the agent-tasks snapshot. Returns false when another
	 * window is already refreshing it, in which case this window serves the shared snapshot.
	 */
	async acquireAgentTasksLock(): Promise<boolean> {
		return this.acquireLock(this.getAgentTasksLockPath());
	}

	/** Release the agent-tasks refresh lock, but only if we own it. */
	async releaseAgentTasksLock(): Promise<void> {
		return this.releaseLock(this.getAgentTasksLockPath());
	}

	/**
	 * Try to become the window that refreshes the repository-PRs snapshot. Returns false when
	 * another window is already refreshing it, in which case this window serves the shared snapshot.
	 */
	async acquireRepoPrLock(): Promise<boolean> {
		return this.acquireLock(this.getRepoPrLockPath());
	}

	/** Release the repository-PRs refresh lock, but only if we own it. */
	async releaseRepoPrLock(): Promise<void> {
		return this.releaseLock(this.getRepoPrLockPath());
	}

	/**
	 * Renew (heartbeat) the repository-PRs lock so a slow GitHub API pass is not mistaken for a
	 * stale lock by another window, which would let it duplicate the same API calls.
	 */
	async renewRepoPrLock(): Promise<boolean> {
		return this.renewLock(this.getRepoPrLockPath());
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
		return this.renewLock(this.getRefreshLockPath());
	}

	/**
	 * Renew (heartbeat) the agent-tasks lock so a slow GitHub API pass is not mistaken for a stale
	 * lock by another window, which would let it duplicate the same API calls.
	 */
	async renewAgentTasksLock(): Promise<boolean> {
		return this.renewLock(this.getAgentTasksLockPath());
	}

	/** Refresh a lock file's timestamp, but only while this window still owns it. */
	private async renewLock(lockPath: string): Promise<boolean> {
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
			await fs.promises.writeFile(
				lockPath,
				JSON.stringify({ sessionId: vscode.env.sessionId, pid: process.pid, timestamp: Date.now() }),
				{ flag: 'wx' },
			);
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
		} catch (killErr: unknown) {
			if (killErr instanceof Error && (killErr as NodeJS.ErrnoException).code === 'ESRCH') {
				return false; // Process no longer exists
			}
			return true; // EPERM means process exists but is owned by another user
		}
		// A PID being alive is not enough on its own: Windows reuses PIDs
		// aggressively, so after a reboot or crash a stale lock can appear "owned" by
		// an unrelated new process, forcing every window into follower mode. On
		// Windows, only treat the lock as live when the PID's image is an
		// Electron-family host OR the current process itself (tests / same-process
		// re-acquire). A live but clearly-foreign image (e.g. cmd.exe) means the
		// PID was recycled and the lock is stale.
		if (process.platform === 'win32') {
			return pid === process.pid || this.isWindowsHostProcess(pid);
		}
		return true;
	}

	/**
	 * Windows-only check that a PID belongs to a VS Code/Electron host process.
	 * Uses tasklist's CSV output; on any failure we assume the owner is alive so
	 * we never break a lock that is genuinely in use.
	 */
	private isWindowsHostProcess(pid: number): boolean {
		try {
			const out = execFileSync(
				'tasklist',
				['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH'],
				{ encoding: 'utf-8', timeout: 5000, windowsHide: true },
			);
			// No match → "INFO: No tasks are running which match the specified criteria."
			if (!out.startsWith('"')) { return false; }
			const image = (out.split('","')[0] ?? '').replace(/^"/, '').toLowerCase();
			return /code|codium|electron|windsurf|cursor|kiro|antigravity|vibe|tray/.test(image);
		} catch {
			return true; // Can't verify — err on the side of not breaking the lock
		}
	}

	private async handleExistingLock(lockPath: string): Promise<boolean> {
		try {
			const content = await fs.promises.readFile(lockPath, 'utf-8');
			const lock = this.parseLockContent(content);
			if (!lock) {
				// Corrupt/empty lock (e.g. owner killed between atomic create and
				// write). The staleness checks below can never run on unparseable
				// content, so without this branch the file would block every
				// acquire attempt forever, forcing all windows into follower mode.
				this.deps.log('Breaking corrupt cache lock (unparseable content)');
				await fs.promises.unlink(lockPath);
				return this.writeLockFile(lockPath);
			}
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

	private parseLockContent(content: string): { sessionId?: unknown; pid?: unknown; timestamp: number } | undefined {
		try {
			const lock = JSON.parse(content);
			if (!lock || typeof lock !== 'object' || typeof lock.timestamp !== 'number') { return undefined; }
			return lock;
		} catch {
			return undefined;
		}
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
		const loadStartedAt = Date.now();
		try {
			const cacheId = this.getCacheIdentifier();

			// One-time migration: remove all cache entries from globalState now that
			// the disk snapshot is the sole source of truth.
			this.migrateOldCacheKeys(cacheId);

			// Load from the shared on-disk snapshot (globalStorageUri).
			const snapshotPath = this.getSharedSnapshotPath();
			try {
				// Capture the file identity (mtime + size) BEFORE reading. Bookmarking this
				// observed version is race-safe: a republish between this stat and the read below
				// changes the post-read identity, so loadSharedSnapshotIfChanged() still detects
				// and loads it next refresh. Statting AFTER the read would bookmark the newer
				// file while sessionFileCache still holds the older bytes — permanently skipping
				// the update (a same-tick publish could share the mtime, differing only in size).
				let loadedMtime = 0;
				let loadedSize = -1;
				try {
					const preStat = await fs.promises.stat(snapshotPath);
					loadedMtime = preStat.mtimeMs;
					loadedSize = preStat.size;
				} catch { /* fall through — readFile will surface ENOENT below */ }
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
					!envelope.entries || // typeof null === 'object'; reject it so Object.entries below can't throw
					typeof envelope.entries !== 'object'
				) {
					this.deps.log(`Snapshot schema mismatch or missing entries for ${cacheId}, starting with empty cache`);
					return;
				}

				this.sessionFileCache = new Map(
					Object.entries(envelope.entries as Record<string, SessionFileCache>),
				);
				this.deps.log(`Loaded ${this.sessionFileCache.size} cached session files from disk snapshot (${cacheId}) in ${Date.now() - loadStartedAt}ms`);

				// Record the identity of the snapshot version ACTUALLY loaded. mtime+size are
				// captured pre-read (a post-read stat could race a mid-read republish). The
				// generation comes from the parsed envelope — the bytes actually loaded — NOT a
				// separate sidecar read: a republish bumping the sidecar inside the read window
				// would otherwise bookmark the newer generation against the older parsed bytes.
				this.lastLoadedSnapshotMtime = loadedMtime;
				this.lastLoadedSnapshotSize = loadedSize;
				this.lastLoadedSnapshotPublishSeq =
					(typeof envelope.publishSeq === 'number' && Number.isSafeInteger(envelope.publishSeq) && envelope.publishSeq >= 0)
						? envelope.publishSeq
						: 0;

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

	/**
	 * Returns whether the cache was actually written to disk — `false` on a skipped (lock held by
	 * another window) or failed save, distinct from "resolved without throwing" (this never
	 * throws either way). checkpointCacheInternal() needs this distinction: it must not reset
	 * entriesSinceLastCheckpoint on a save that didn't happen, or a dirty checkpoint that lost a
	 * lock race can be mistaken for a persisted one and never retried.
	 */
	async trySaveCacheToStorage(): Promise<boolean> {
		const acquired = await this.acquireCacheLock();
		if (!acquired) {
			this.deps.log('Cache lock held by another VS Code window, skipping save');
			return false;
		}
		try {
			const cacheId = this.getCacheIdentifier();

			// Persist to the shared on-disk snapshot only (no globalState write to
			// avoid VS Code's large-extension-state warning).
			this.deps.log(`Saving ${this.sessionFileCache.size} cached session files to disk snapshot (version ${this.cacheVersion}, ${cacheId})`);
			return await this.writeSharedSnapshot();
		} catch (error) {
			this.deps.error(`Error saving cache to storage: ${error}`);
			return false;
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

	getSharedSnapshotPath(): string {
		const cacheId = this.getCacheIdentifier();
		return path.join(this.context.globalStorageUri.fsPath, `cache_${cacheId}.snapshot.json`);
	}

	/**
	 * Path to the tiny sidecar file holding the monotonic publish generation for the shared
	 * snapshot. Kept separate from the (potentially large) snapshot so a reader can learn the
	 * current generation in a few bytes — without reading or parsing the whole snapshot — when
	 * the snapshot's stat ties on a coarse-mtime filesystem.
	 */
	private getSnapshotSeqPath(): string {
		const cacheId = this.getCacheIdentifier();
		return path.join(this.context.globalStorageUri.fsPath, `cache_${cacheId}.seq`);
	}

	/**
	 * Read the current publish generation from the sidecar file. Returns:
	 * - the parsed generation when the sidecar exists and is valid,
	 * - 0 when the sidecar is genuinely absent (ENOENT) — a fresh cache or a snapshot written
	 *   before generations existed,
	 * - `undefined` when the sidecar exists but cannot be read or parsed (transient EACCES/EPERM,
	 *   corrupt contents). Callers must treat `undefined` as "unknown, do not restart the
	 *   sequence" — publishing from 0 here would break monotonicity for peers that already
	 *   loaded a higher generation, and a same-mtime/same-size replacement would be skipped.
	 */
	private async readSnapshotPublishSeq(): Promise<number | undefined> {
		let raw: string;
		try {
			raw = await fs.promises.readFile(this.getSnapshotSeqPath(), 'utf-8');
		} catch (err: unknown) {
			// Genuinely absent (or the directory is gone): no generation yet.
			if ((err as NodeJS.ErrnoException).code === 'ENOENT' || (err as NodeJS.ErrnoException).code === 'ENOTDIR') {
				return 0;
			}
			return undefined; // Exists but unreadable — unknown, not zero.
		}
		// Validate the ENTIRE trimmed value as a non-negative safe integer. parseInt alone accepts
		// a numeric prefix (e.g. "4garbage" -> 4), which would bypass the recovery path and let a
		// writer publish a sequence no greater than a peer's bookmark, causing a same-mtime/
		// same-size update to be skipped. Treat any non-clean value as unknown (undefined).
		const trimmed = raw.trim();
		if (!/^\d+$/.test(trimmed)) {
			return undefined;
		}
		const seq = Number(trimmed);
		return Number.isSafeInteger(seq) && seq >= 0 ? seq : undefined;
	}

	/**
	 * Compute the next monotonic publish generation. Takes the MAX of the readable sidecar and
	 * the body's embedded publishSeq (captured during the merge read, so the snapshot is not
	 * re-read): a legacy/pre-sidecar writer can leave the body ahead of the sidecar, and
	 * continuing from the sidecar alone would publish a sequence a peer already bookmarked. Fails
	 * closed (throws) only when the sidecar is unreadable/corrupt AND no body can be recovered —
	 * never restart at 1 after peers have loaded a higher generation.
	 */
	private async nextPublishSeq(existingPublishSeq: number | undefined): Promise<number> {
		const sidecarSeq = await this.readSnapshotPublishSeq();
		const bodySeq = existingPublishSeq ?? 0;
		if (sidecarSeq === undefined) {
			// Sidecar exists but is unreadable/corrupt: recover from the body if possible.
			if (existingPublishSeq === undefined) {
				throw new Error('Cannot determine the next publish generation: sidecar unreadable and no readable snapshot to recover from');
			}
			return bodySeq + 1;
		}
		// Both readable (or sidecar absent=0): never go below the body's generation.
		return Math.max(sidecarSeq, bodySeq) + 1;
	}

	/**
	 * Atomically write the in-memory cache to the shared snapshot file.
	 *
	 * The write MERGES with whatever is already on disk (keeping the newer entry by
	 * mtime) so that a window with a partial/stale cache can never regress a richer
	 * snapshot published by another window. Must be called while holding the cache
	 * lock to keep the read-modify-write atomic across windows.
	 *
	 * Never throws — a write failure is logged and reported via the `false` return instead,
	 * so a caller like checkpointCacheInternal() can distinguish "actually persisted" from
	 * "swallowed an error" without needing its own try/catch around this.
	 *
	 * Also aborts (returns `false`, without touching disk) if clearAllCachedData() runs while this
	 * is building or about to persist its snapshot: `entries` above is built from a disk read and
	 * in-memory state captured before the clear, so persisting it would resurrect exactly what the
	 * clear just removed. Checked once after that read and again right before the rename, since a
	 * clear landing in either window makes the captured data equally stale.
	 */
	async writeSharedSnapshot(): Promise<boolean> {
		const snapshotPath = this.getSharedSnapshotPath();
		const seqPath = this.getSnapshotSeqPath();
		const tmpPath = `${snapshotPath}.${process.pid}.${Date.now()}.tmp`;
		const tmpSeqPath = `${seqPath}.${process.pid}.${Date.now()}.tmp`;
		const clearGenerationAtStart = this.cacheClearGeneration;
		try {
			const { entries, existingPublishSeq } = await this.buildMergedSnapshotEntries();
			if (this.cacheClearGeneration !== clearGenerationAtStart) {
				this.deps.log('Skipping shared-snapshot write: cache was cleared while this checkpoint was building it');
				return false;
			}
			const publishSeq = await this.nextPublishSeq(existingPublishSeq);
			const envelope = {
				schemaVersion: CacheManager.SNAPSHOT_SCHEMA_VERSION,
				cacheVersion: this.cacheVersion,
				cacheId: this.getCacheIdentifier(),
				generatedAt: Date.now(),
				publishSeq,
				entryCount: Object.keys(entries).length,
				entries,
			};
			const body = JSON.stringify(envelope);
			await fs.promises.mkdir(path.dirname(snapshotPath), { recursive: true });
			// Bump the sidecar generation BEFORE the snapshot body, and fail the whole write if it
			// can't be persisted. Ordering sidecar-first means a reader can at worst see a seq
			// ahead of the body it points at (a harmless extra reload), and never a visible new
			// body with a stale/old seq — which a same-mtime/same-size peer would skip
			// permanently. A swallowed sidecar failure would be exactly that missed-update case,
			// so this throws into the catch below rather than publishing a generation-less body.
			await fs.promises.writeFile(tmpSeqPath, String(publishSeq));
			await fs.promises.rename(tmpSeqPath, seqPath);
			await fs.promises.writeFile(tmpPath, body);
			if (this.cacheClearGeneration !== clearGenerationAtStart) {
				this.deps.log('Skipping shared-snapshot write: cache was cleared while this checkpoint was about to persist');
				try { await fs.promises.unlink(tmpPath); } catch { /* best-effort cleanup */ }
				// The sidecar was already bumped; roll it back so a later write reuses this
				// generation instead of leaving a gap that peers could mistake for a publish.
				try { await fs.promises.writeFile(tmpSeqPath, String(publishSeq - 1)); await fs.promises.rename(tmpSeqPath, seqPath); } catch { /* best-effort */ }
				return false;
			}
			await fs.promises.rename(tmpPath, snapshotPath);
			// Record our own write (mtime + size + publish generation) so we don't redundantly
			// reload it later. See loadSharedSnapshotIfChanged()'s guard for why these are paired.
			try {
				const stat = await fs.promises.stat(snapshotPath);
				this.lastLoadedSnapshotMtime = stat.mtimeMs;
				this.lastLoadedSnapshotSize = stat.size;
				this.lastLoadedSnapshotPublishSeq = publishSeq;
			} catch { /* best-effort */ }
			return true;
		} catch (error) {
			this.deps.warn(`Failed to write shared cache snapshot: ${error}`);
			try { await fs.promises.unlink(tmpPath); } catch { /* best-effort cleanup */ }
			try { await fs.promises.unlink(tmpSeqPath); } catch { /* best-effort cleanup */ }
			return false;
		}
	}

	/**
	 * Delete the shared on-disk snapshot and reset the loaded bookmark.
	 * Called by clearCache() so that restarting VS Code does not restore cleared data.
	 *
	 * The sidecar publishSeq is deliberately left in place: it is a durable generation counter,
	 * so a recreated snapshot continues the sequence instead of restarting at 1 (which a
	 * still-running window that already loaded a higher generation would otherwise skip).
	 *
	 * Acquires the same cache save lock writeSharedSnapshot() holds while it builds and renames a
	 * snapshot — retrying briefly rather than the usual single-shot acquire, since this specific
	 * caller must not proceed while any writer (this window's own periodic checkpoint or
	 * persistRefreshResult() save, or another window's) could still be mid-write. cacheClearGeneration
	 * (bumped by clearAllCachedData(), checked inside writeSharedSnapshot()) only lives in this
	 * process's memory, so it can abort a same-process write that hasn't reached its rename yet, but
	 * it cannot reach into another window's process at all, and can't undo a same-process write
	 * whose generation check already passed before the bump landed. Serializing on the shared lock
	 * file instead closes both gaps: any writer, in this window or a peer's, holds this exact lock
	 * for the small window between its own read and its rename, so acquiring it first guarantees no
	 * writer's rename can land after this delete. Proceeds anyway once the retry budget is spent
	 * (see acquireCacheLockWithRetry()) rather than blocking "Clear Cache" forever on a peer
	 * holding a stuck lock — that residual gap only matters against a writer that neither finishes
	 * nor gets its stale lock broken within that budget, an accepted trade-off documented there.
	 */
	async deleteSharedSnapshot(retryOptions?: { attempts: number; delayMs: number }): Promise<void> {
		const lockAcquired = await this.acquireCacheLockWithRetry(retryOptions);
		try {
			const snapshotPath = this.getSharedSnapshotPath();
			try {
				await fs.promises.unlink(snapshotPath);
				this.lastLoadedSnapshotMtime = 0;
				this.lastLoadedSnapshotSize = -1;
				this.lastLoadedSnapshotPublishSeq = 0;
				this.deps.log(`Deleted shared cache snapshot (${this.getCacheIdentifier()})`);
			} catch (err: unknown) {
				if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
					// Another window (or an earlier call here) already deleted it — same postcondition
					// this method promises (no snapshot left) even though this call didn't do the
					// deleting. loadSharedSnapshotIfChanged() only reloads once a snapshot's mtime
					// exceeds this bookmark, so leaving it at its pre-delete value here could make a
					// newly published snapshot with an equal-or-lower mtime (coarse filesystem
					// timestamp resolution, or clock rollback) look already-loaded, leaving this
					// instance on stale/empty in-memory state until some later mtime change finally
					// exceeds it.
					this.lastLoadedSnapshotMtime = 0;
					this.lastLoadedSnapshotSize = -1;
					this.lastLoadedSnapshotPublishSeq = 0;
				} else {
					// A genuine failure (e.g. permissions): the file is presumably still there,
					// unchanged, so the bookmark is left alone rather than forcing a needless reload
					// of a snapshot that was never actually removed.
					this.deps.warn(`Failed to delete shared cache snapshot: ${err}`);
				}
			}
		} finally {
			if (lockAcquired) { await this.releaseCacheLock(); }
		}
	}

	/**
	 * Retries acquireCacheLock() instead of giving up on the first miss.
	 *
	 * A legitimate writer holds this lock for its full read+merge+serialize+write+rename
	 * sequence — normally milliseconds, but a large snapshot (SNAPSHOT_MAX_ENTRIES caps it at
	 * 20,000 entries) on a slow disk can meaningfully exceed that. The retry budget here (10s) is
	 * sized for that realistic case, not just the fast common one, so deleteSharedSnapshot() does
	 * not race a legitimate large-cache write nearly as often as a short retry would.
	 *
	 * It remains a bounded retry, not an indefinite wait, for a genuinely stuck peer (e.g. a lock
	 * orphaned by a crashed window): acquireCacheLock() already breaks a lock whose owner process
	 * is dead, and handleExistingLock()'s own 5-minute staleness threshold breaks one whose owner
	 * is merely idle-but-alive, so this retry only ever waits out a lock actively being renewed by
	 * a live, legitimately-working writer or a fixed worst case. Proceeding once this budget is
	 * spent, rather than blocking "Clear Cache" indefinitely, is an accepted trade-off — the same
	 * shape as the unbounded-reserve-wait trade-off already accepted elsewhere in this PR for the
	 * deferred-parse semaphore.
	 */
	private async acquireCacheLockWithRetry(retryOptions?: { attempts: number; delayMs: number }): Promise<boolean> {
		// Overridable only for tests, to exercise the retry/give-up behavior without a real test
		// waiting out the full production budget above.
		const RETRY_ATTEMPTS = retryOptions?.attempts ?? 100;
		const RETRY_DELAY_MS = retryOptions?.delayMs ?? 100;
		for (let attempt = 0; attempt < RETRY_ATTEMPTS; attempt++) {
			if (await this.acquireCacheLock()) { return true; }
			await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
		}
		this.deps.warn('Could not acquire cache lock before deleting shared snapshot after retrying; proceeding without it');
		return false;
	}

	/**
	 * newer entry by mtime, and cap the result to the newest SNAPSHOT_MAX_ENTRIES.
	 */
	private async buildMergedSnapshotEntries(): Promise<{ entries: Record<string, SessionFileCache>; existingPublishSeq: number | undefined }> {
		// Read the body once, capturing its publishSeq for the writer's generation recovery, so
		// the write path doesn't re-read/re-parse the whole snapshot a second time.
		const existingBody = await this.readSnapshotWithSeq();
		const existing = existingBody?.entries;
		const merged: Record<string, SessionFileCache> = existing ? { ...existing } : {};
		// A path removed via deleteCachedSessionData() must not be resurrected from whatever
		// another (or this) window already published to disk — see deletedFilePaths' doc comment.
		// Only strip a disk entry that is no newer than this tombstone's baseline mtime: a strictly
		// newer disk entry means another window republished this path after this deletion decision
		// was made, and that newer publish must survive, not be silently destroyed.
		for (const [deletedPath, tombstoneMtime] of this.deletedFilePaths) {
			const diskEntry = merged[deletedPath];
			if (diskEntry && typeof diskEntry.mtime === 'number' && diskEntry.mtime > tombstoneMtime) {
				continue;
			}
			delete merged[deletedPath];
		}
		for (const [filePath, entry] of this.sessionFileCache) {
			const prev = merged[filePath];
			if (!prev || (typeof entry.mtime === 'number' && entry.mtime >= prev.mtime)) {
				merged[filePath] = entry;
			}
		}
		const keys = Object.keys(merged);
		if (keys.length <= CacheManager.SNAPSHOT_MAX_ENTRIES) {
			return { entries: merged, existingPublishSeq: existingBody?.publishSeq };
		}
		const capped: Record<string, SessionFileCache> = {};
		const newestFirst = keys.sort((a, b) => (merged[b].mtime ?? 0) - (merged[a].mtime ?? 0));
		for (const key of newestFirst.slice(0, CacheManager.SNAPSHOT_MAX_ENTRIES)) {
			capped[key] = merged[key];
		}
		return { entries: capped, existingPublishSeq: existingBody?.publishSeq };
	}

	/**
	 * Read and validate the shared snapshot. Returns its entries, or undefined when
	 * the file is missing, unreadable, malformed, or written by an incompatible
	 * schema/cache version.
	 */
	async readSharedSnapshot(): Promise<Record<string, SessionFileCache> | undefined> {
		return (await this.readSnapshotWithSeq())?.entries;
	}

	/**
	 * Read the shared snapshot body together with the publishSeq embedded in it. Used by the
	 * stat-tie path to confirm the body matches the sidecar generation before merging — the
	 * sidecar is written before the body, so on a tie a reader can otherwise see the new seq
	 * alongside the previous body and bookmark a generation it never actually loaded.
	 */
	private async readSnapshotWithSeq(): Promise<{ entries: Record<string, SessionFileCache>; publishSeq: number } | undefined> {
		const snapshotPath = this.getSharedSnapshotPath();
		try {
			const content = await fs.promises.readFile(snapshotPath, 'utf-8');
			const envelope = JSON.parse(content);
			if (
				!envelope ||
				envelope.schemaVersion !== CacheManager.SNAPSHOT_SCHEMA_VERSION ||
				envelope.cacheVersion !== this.cacheVersion ||
				// `typeof null === 'object'`, so reject null explicitly — otherwise a
				// `{ ..., entries: null }` envelope reaches mergeSnapshotEntries(), where
				// Object.entries(null) throws on every poll instead of being treated as malformed.
				!envelope.entries ||
				typeof envelope.entries !== 'object'
			) {
				return undefined;
			}
			return {
				entries: envelope.entries as Record<string, SessionFileCache>,
				// Bodies written before the marker existed carry no publishSeq; treat as 0.
				// A present value must be a non-negative safe integer — `typeof === 'number'`
				// alone accepts Infinity (1e999), fractions, and negatives, which would bookmark
				// a value no future finite sidecar generation can exceed and stall same-stat
				// publishes. Treat anything else as 0 (the legacy default).
				publishSeq: (typeof envelope.publishSeq === 'number' && Number.isSafeInteger(envelope.publishSeq) && envelope.publishSeq >= 0)
					? envelope.publishSeq
					: 0,
			};
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
		const loadStartedAt = Date.now();
		const snapshotPath = this.getSharedSnapshotPath();
		let mtimeMs: number;
		let size: number;
		try {
			const stat = await fs.promises.stat(snapshotPath);
			mtimeMs = stat.mtimeMs;
			size = stat.size;
		} catch {
			return 0; // No snapshot yet.
		}
		// Skip only a snapshot we provably already loaded. An exact-mtime bookmark alone is
		// unsafe on filesystems with coarse mtime granularity (NTFS can report identical mtimes
		// for writes milliseconds apart) — a window republishing within the same tick as our
		// last load/write would get an equal mtime and be wrongly skipped, silently discarding
		// its newer data. Size doesn't fully close that gap either: a same-tick republish can
		// change values without changing the JSON length (e.g. an entry mtime from 1000 to
		// 5000), leaving BOTH stat fields equal. Writers therefore bump a monotonically
		// increasing publishSeq kept in a tiny sidecar file (see writeSharedSnapshot), giving
		// every publish a distinct, cheap identity. On a full stat tie we read just the few-byte
		// sidecar — never the whole snapshot — so an unchanged snapshot is skipped with no
		// O(snapshot-size) re-read or parse on idle polls, while any republish (even same-tick,
		// same-size) is detected by its higher generation.
		if (mtimeMs < this.lastLoadedSnapshotMtime) {
			return 0; // Strictly older than what we loaded.
		}
		if (mtimeMs === this.lastLoadedSnapshotMtime && size === this.lastLoadedSnapshotSize) {
			return this.loadOnStatTie(mtimeMs, size, loadStartedAt);
		}
		// Newer mtime, or same tick with a different size: reload. The mtime advanced, so this is
		// not the same-tick case the sidecar ordering affects; bookmark the body's own generation.
		const loaded = await this.readSnapshotWithSeq();
		if (!loaded) {
			// Remember the identity so we don't repeatedly retry an incompatible snapshot.
			this.bookmarkLoadedSnapshot(mtimeMs, size, this.lastLoadedSnapshotPublishSeq);
			return 0;
		}
		return this.mergeAndBookmark(loaded.entries, mtimeMs, size, loaded.publishSeq, loadStartedAt);
	}

	/**
	 * Handle a full stat tie (same mtime AND size): decide via the publish generation whether
	 * the snapshot changed. An unchanged snapshot is skipped using only the cheap sidecar read;
	 * a republish (even same-tick, same-size) is detected by its higher generation. The body is
	 * read only when the sidecar indicates a change OR when a legacy pre-sidecar writer may have
	 * republished the body (with a higher embedded publishSeq) without touching the sidecar.
	 */
	private async loadOnStatTie(mtimeMs: number, size: number, loadStartedAt: number): Promise<number> {
		const seq = await this.readSnapshotPublishSeq();
		if (seq !== undefined && seq > this.lastLoadedSnapshotPublishSeq) {
			// Newer sidecar generation: reload, but validate the body actually carries it (the
			// sidecar is written before the body, so a mid-write publish shows a new seq with the
			// previous body — retry next poll rather than bookmark a generation we never loaded).
			const loaded = await this.readSnapshotWithSeq();
			if (!loaded) {
				return 0; // Unreadable/incompatible — leave the bookmark; a valid rewrite will advance the stat.
			}
			if (loaded.publishSeq < seq) {
				return 0; // Mid-write: sidecar ahead of the body. Retry next poll.
			}
			return this.mergeAndBookmark(loaded.entries, mtimeMs, size, loaded.publishSeq, loadStartedAt);
		}
		// Cheap fast path only when the sidecar is valid, positive, and EXACTLY at our bookmark
		// (the normal unchanged idle case): skip without re-reading the body. Any other relation —
		// sidecar absent (legacy deployment / pre-sidecar writer), unreadable/corrupt, or
		// REGRESSED below our bookmark (a legacy writer that advanced the body past a retained
		// sidecar, or a same-size recreate) — falls through to reconcile from the body, because
		// the sidecar then can't vouch that the body's embedded publishSeq hasn't moved ahead.
		if (seq !== undefined && seq > 0 && seq === this.lastLoadedSnapshotPublishSeq) {
			return 0; // Unchanged: the sidecar matches our loaded generation.
		}
		// Sidecar absent, unreadable, or regressed: reconcile from the body's embedded publishSeq.
		const loaded = await this.readSnapshotWithSeq();
		if (!loaded) {
			return 0; // Unreadable/incompatible — leave the bookmark.
		}
		if (loaded.publishSeq <= this.lastLoadedSnapshotPublishSeq) {
			return 0; // Genuinely unchanged (or no newer than what we loaded).
		}
		return this.mergeAndBookmark(loaded.entries, mtimeMs, size, loaded.publishSeq, loadStartedAt);
	}

	/**
	 * Record the identity (mtime + size + publish generation) of the snapshot version that was
	 * loaded, so the next loadSharedSnapshotIfChanged() can skip an unchanged snapshot.
	 */
	private bookmarkLoadedSnapshot(mtimeMs: number, size: number, publishSeq: number): void {
		this.lastLoadedSnapshotMtime = mtimeMs;
		this.lastLoadedSnapshotSize = size;
		this.lastLoadedSnapshotPublishSeq = publishSeq;
	}

	/**
	 * Merge already-parsed snapshot entries into the in-memory cache and bookmark the loaded
	 * identity. Returns the number of entries merged.
	 */
	private mergeAndBookmark(
		entries: Record<string, SessionFileCache>,
		mtimeMs: number,
		size: number,
		publishSeq: number,
		loadStartedAt: number,
	): number {
		const merged = this.mergeSnapshotEntries(entries);
		this.bookmarkLoadedSnapshot(mtimeMs, size, publishSeq);
		if (merged > 0) {
			this.deps.log(`Warmed cache from shared snapshot: merged ${merged} entr${merged === 1 ? 'y' : 'ies'} in ${Date.now() - loadStartedAt}ms`);
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
			// A tombstoned path has no `existing` in-memory entry to compare against (deleteCachedSessionData()
			// removed it from sessionFileCache), so `!existing` would otherwise always be true and accept ANY
			// snapshot entry unconditionally — including one no newer than what was actually deleted, e.g. a
			// stale snapshot a concurrent window is still rewriting. Guard with the same tombstone-baseline
			// comparison buildMergedSnapshotEntries() already applies on the write side: only a snapshot entry
			// strictly newer than the tombstone survives.
			const existing = this.sessionFileCache.get(filePath);
			const tombstoneMtime = this.deletedFilePaths.get(filePath);
			const isNewerThanTombstone = tombstoneMtime === undefined || entry.mtime > tombstoneMtime;
			if ((!existing || entry.mtime > existing.mtime) && isNewerThanTombstone) {
				this.sessionFileCache.set(filePath, entry);
				// Must clear any tombstone this window recorded for this path, same as
				// setCachedSessionData() does — buildMergedSnapshotEntries()'s mtime comparison
				// already protects a newer disk entry on its own, but clearing here keeps this
				// window's own next save from re-deciding "still gone" the moment it merges in
				// proof that it plainly isn't.
				this.deletedFilePaths.delete(filePath);
				merged++;
			}
		}
		if (merged > 0) {
			this.policy.evict(this.sessionFileCache);
		}
		return merged;
	}
}
