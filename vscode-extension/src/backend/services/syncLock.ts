/**
 * Cross-instance file lock management for backend sync.
 * Prevents concurrent syncs across multiple VS Code windows.
 */

import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { BACKEND_SYNC_MIN_INTERVAL_MS } from '../constants';

/**
 * Manages an exclusive file-based lock so only one VS Code window
 * can run a backend sync at a time.
 */
export class SyncLock {
	/** Stale threshold for the sync lock file (matches the sync timer interval). */
	static readonly STALE_MS = BACKEND_SYNC_MIN_INTERVAL_MS;

	constructor(
		private readonly context: vscode.ExtensionContext | undefined,
		private readonly log: (msg: string) => void,
		private readonly warn: (msg: string) => void,
	) {}

	/**
	 * Try to acquire an exclusive file lock so only one VS Code window
	 * can run a backend sync at a time.
	 *
	 * If the existing lock was written by an instance configured against a
	 * *different* server URL, the lock does not apply — both instances are
	 * syncing to independent endpoints and should not block each other.
	 */
	async acquire(backend?: string, serverUrl?: string): Promise<boolean> {
		const ctx = this.context;
		if (!ctx) { return true; } // No context → allow (tests)
		// Use a backend-specific lock so Azure and sharingServer syncs don't block each other.
		const suffix = backend === 'sharingServer' ? '_sharingserver' : '';
		const lockPath = path.join(ctx.globalStorageUri.fsPath, `backend_sync${suffix}.lock`);
		const lockContent = JSON.stringify({
			sessionId: vscode.env.sessionId,
			timestamp: Date.now(),
			serverUrl,
		});
		try {
			await fs.promises.mkdir(path.dirname(lockPath), { recursive: true });
			await fs.promises.writeFile(lockPath, lockContent, { flag: 'wx' });
			return true;
		} catch (err: any) {
			if (err.code !== 'EEXIST') {
				this.warn(`Sync lock: unexpected error acquiring lock: ${err.message}`);
				return false;
			}
			// Lock file exists — check if it belongs to a different server or is stale
			try {
				const content = await fs.promises.readFile(lockPath, 'utf-8');
				const lock = this.parseLockContent(content);
				if (!lock) {
					// Corrupt/empty lock (owner killed between atomic create and
					// write): the staleness check can never run on unparseable
					// content, so it would block every sync attempt forever.
					this.log('Sync lock: breaking corrupt lock (unparseable content)');
					return this.breakAndRewrite(lockPath, lockContent);
				}
				// Different server URL → the lock does not apply to this instance.
				if (serverUrl && lock.serverUrl && lock.serverUrl !== serverUrl) {
					this.log(`Sync lock: lock is held for a different server (${lock.serverUrl}), proceeding for ${serverUrl}`);
					return true;
				}
				if (Date.now() - lock.timestamp > SyncLock.STALE_MS) {
					this.log('Sync lock: breaking stale lock from another window');
					return this.breakAndRewrite(lockPath, lockContent);
				}
			} catch {
				// Lock file may have been deleted by its owner
			}
			return false;
		}
	}

	private parseLockContent(content: string): { sessionId?: unknown; timestamp: number; serverUrl?: string } | undefined {
		try {
			const lock = JSON.parse(content);
			if (!lock || typeof lock !== 'object' || typeof lock.timestamp !== 'number') { return undefined; }
			return lock;
		} catch {
			return undefined;
		}
	}

	private async breakAndRewrite(lockPath: string, lockContent: string): Promise<boolean> {
		try {
			await fs.promises.unlink(lockPath);
			await fs.promises.writeFile(lockPath, lockContent, { flag: 'wx' });
			return true;
		} catch {
			return false;
		}
	}

	/**
	 * Release the sync lock, but only if we own it.
	 */
	async release(backend?: string): Promise<void> {
		const ctx = this.context;
		if (!ctx) { return; }
		const suffix = backend === 'sharingServer' ? '_sharingserver' : '';
		const lockPath = path.join(ctx.globalStorageUri.fsPath, `backend_sync${suffix}.lock`);
		try {
			const content = await fs.promises.readFile(lockPath, 'utf-8');
			const lock = JSON.parse(content);
			if (lock.sessionId === vscode.env.sessionId) {
				await fs.promises.unlink(lockPath);
			}
		} catch {
			// Lock file already gone or unreadable
		}
	}
}
