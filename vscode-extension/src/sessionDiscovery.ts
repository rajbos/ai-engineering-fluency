/**
 * Session file discovery — generic adapter-loop scanner that delegates all
 * editor-specific path knowledge to ecosystem adapters implementing
 * IDiscoverableEcosystem (see src/ecosystemAdapter.ts and src/adapters/).
 *
 * This file used to hardcode VS Code / Copilot Chat and Copilot CLI paths
 * directly. Those have moved to dedicated adapters:
 *   - src/adapters/copilotChatAdapter.ts
 *   - src/adapters/copilotCliAdapter.ts
 *
 * What remains here:
 *   - The sample-data override for screenshot/demo mode.
 *   - The adapter loop that calls each adapter's discover() and merges
 *     candidate paths for the diagnostics panel.
 *   - A short-term TTL cache so rapid successive scans don't re-walk the FS.
 *   - Path-based deduplication so adapters that overlap (or future bug-fix
 *     additions) cannot double-count the same physical session file.
 *   - checkCopilotExtension() which uses the VS Code extension API and
 *     therefore stays attached to this discovery class.
 */
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import type { IEcosystemAdapter } from './ecosystemAdapter';
import { isDiscoverable } from './ecosystemAdapter';
import { normalizePathForDedup } from './workspaceHelpers';
import type { WindsurfDataAccess } from './windsurf';

export interface SessionDiscoveryDeps {
	log: (message: string) => void;
	warn: (message: string) => void;
	error: (message: string, error?: any) => void;
	ecosystems: IEcosystemAdapter[];
	windsurf?: WindsurfDataAccess;
	sampleDataDirectoryOverride?: () => string | undefined;
}

export class SessionDiscovery {
	private deps: SessionDiscoveryDeps;
	private _sessionFilesCache: string[] | null = null;
	private _sessionFilesCacheTime: number = 0;
	private static readonly SESSION_FILES_CACHE_TTL = 60000;

	/** Whether any adapter threw during the last discovery run. */
	private _lastDiscoveryHadError = false;
	/** Number of files returned by the last discovery run (reflects actual result, not just cache). */
	private _lastDiscoveryFilesCount = 0;

	constructor(deps: SessionDiscoveryDeps) {
		this.deps = deps;
	}

	/** Whether any adapter threw an error during the most recent discovery scan. */
	get lastDiscoveryHadError(): boolean { return this._lastDiscoveryHadError; }

	/** Number of session files found in the most recent discovery scan. */
	get lastDiscoveryFilesCount(): number { return this._lastDiscoveryFilesCount; }

	clearCache(): void {
		this._sessionFilesCache = null;
		this._sessionFilesCacheTime = 0;
	}

	/** Async replacement for fs.existsSync — does not block the event loop. */
	private async pathExists(p: string): Promise<boolean> {
		try {
			await fs.promises.access(p);
			return true;
		} catch {
			return false;
		}
	}

	/** Checks whether a path exists and logs a debug message when it does not. */
	private pathExistsWithLogging(p: string, context: string): boolean {
		try {
			const exists = fs.existsSync(p);
			if (!exists) {
				this.deps.log(`🔍 Path not found [${context}]: ${p}`);
			}
			return exists;
		} catch {
			return false;
		}
	}

	/**
	 * Returns the candidate filesystem paths the extension considers when
	 * scanning for session files, along with whether each path exists on
	 * disk. All editor-specific paths come from adapters implementing
	 * IDiscoverableEcosystem (see CopilotChatAdapter, CopilotCliAdapter,
	 * OpenCodeAdapter, etc.).
	 */
	getDiagnosticCandidatePaths(): { path: string; exists: boolean; source: string }[] {
		const candidates: { path: string; exists: boolean; source: string }[] = [];

		for (const eco of this.deps.ecosystems) {
			if (!isDiscoverable(eco)) { continue; }
			try {
				const ecoPaths = eco.getCandidatePaths();
				for (const cp of ecoPaths) {
					const exists = this.pathExistsWithLogging(cp.path, cp.source);
					candidates.push({ path: cp.path, exists, source: cp.source });
				}
			} catch { /* ignore individual adapter errors */ }
		}

		if (this.deps.windsurf) {
			const cascadeDir = this.deps.windsurf.getCascadeDir();
			candidates.push({
				path: cascadeDir,
				exists: this.pathExistsWithLogging(cascadeDir, 'Windsurf Cascade'),
				source: 'Windsurf Cascade',
			});
		}

		return candidates;
	}

	checkCopilotExtension(): void {
		const copilotExtension = vscode.extensions.getExtension('GitHub.copilot');
		const copilotChatExtension = vscode.extensions.getExtension('GitHub.copilot-chat');

		if (!copilotExtension && !copilotChatExtension) {
			this.deps.log('⚠️ GitHub Copilot extensions not found');
		} else {
			const copilotStatus = copilotExtension ? (copilotExtension.isActive ? '✅ Active' : '⏳ Loading') : '❌ Not found';
			const chatStatus = copilotChatExtension ? (copilotChatExtension.isActive ? '✅ Active' : '⏳ Loading') : '❌ Not found';
			this.deps.log(`GitHub Copilot: ${copilotStatus}, Chat: ${chatStatus}`);
		}

		const isCodespaces = process.env.CODESPACES === 'true';
		if (isCodespaces && (!copilotExtension?.isActive || !copilotChatExtension?.isActive)) {
			this.deps.warn('⚠️ Running in Codespaces with inactive Copilot extensions');
		}
	}

	/**
	 * Discover all session files across every registered ecosystem adapter,
	 * merging the results into a single deduplicated list.
	 *
	 * Special-cases sample-data mode: when the user has configured a
	 * sampleDataDirectory the adapters are skipped entirely and only the
	 * sample directory is read. This is used for screenshots and regression
	 * fixtures.
	 */
	async getCopilotSessionFiles(): Promise<string[]> {
		return this.getCopilotSessionFilesStreaming();
	}

	private async tryGetSampleDataFiles(now: number): Promise<string[] | undefined> {
		const sampleDir = this.deps.sampleDataDirectoryOverride?.()
			?? vscode.workspace.getConfiguration('aiEngineeringFluency').get<string>('sampleDataDirectory');
		if (!sampleDir || sampleDir.trim().length === 0) { return undefined; }
		const resolvedSampleDir = sampleDir.trim();
		try {
			if (!await this.pathExists(resolvedSampleDir)) {
				this.deps.warn(`Sample data directory not found: ${resolvedSampleDir}`);
				return undefined;
			}
			const sampleFiles = (await fs.promises.readdir(resolvedSampleDir))
				.filter(f => f.endsWith('.json') || f.endsWith('.jsonl'))
				.map(f => path.join(resolvedSampleDir, f));
			this.deps.log(`📸 Sample data mode: using ${sampleFiles.length} file(s) from ${resolvedSampleDir}`);
			this._sessionFilesCache = sampleFiles;
			this._sessionFilesCacheTime = now;
			this._lastDiscoveryFilesCount = sampleFiles.length;
			return sampleFiles;
		} catch (err) {
			this.deps.warn(`Error reading sample data directory: ${err}`);
			return undefined;
		}
	}

	private async discoverFromAdapters(onBatch?: (files: string[]) => void): Promise<string[]> {
		const seen = new Set<string>();
		const allDeduped: string[] = [];
		const discoveryStartMs = Date.now();
		const discoverableAdapters = this.deps.ecosystems.filter(isDiscoverable);
		this.deps.log(`🔍 Searching for session files via ${discoverableAdapters.length} discoverable ecosystem adapter(s) (parallel)`);
		const results = await Promise.allSettled(discoverableAdapters.map(eco => eco.discover(this.deps.log)));
		for (let i = 0; i < results.length; i++) {
			const result = results[i];
			if (result.status === 'rejected') {
				this.deps.warn(`Could not discover ${discoverableAdapters[i].displayName} sessions: ${result.reason}`);
				this._lastDiscoveryHadError = true;
				continue;
			}
			const batch: string[] = [];
			for (const f of result.value.sessionFiles) {
				const key = normalizePathForDedup(f);
				if (seen.has(key)) { continue; }
				seen.add(key); batch.push(f);
			}
			if (batch.length > 0) { allDeduped.push(...batch); if (onBatch) { onBatch(batch); } }
		}
		if (this.deps.windsurf) {
			try {
				const windsurfFiles = (await this.deps.windsurf.getWindsurfSessions()).map(session => session.file);
				const batch = windsurfFiles.filter(f => {
					const key = normalizePathForDedup(f);
					if (seen.has(key)) { return false; }
					seen.add(key);
					return true;
				});
				if (batch.length > 0) {
					allDeduped.push(...batch);
					if (onBatch) { onBatch(batch); }
				}
			} catch (error) {
				this.deps.warn(`Could not discover Windsurf sessions: ${error}`);
				this._lastDiscoveryHadError = true;
			}
		}
		const dupCount = results.reduce((n, r) => n + (r.status === 'fulfilled' ? r.value.sessionFiles.length : 0), 0) - allDeduped.length;
		if (dupCount > 0) { this.deps.log(`🧹 Deduplicated ${dupCount} duplicate session path(s)`); }
		this.deps.log(`✨ Total: ${allDeduped.length} session file(s) discovered in ${((Date.now() - discoveryStartMs) / 1000).toFixed(1)}s`);
		if (allDeduped.length === 0) { this.deps.warn('⚠️ No session files found - Have you used GitHub Copilot Chat yet?'); }
		return allDeduped;
	}

	/**
	 * Discover session files with optional streaming: calls `onBatch` with
	 * deduplicated file paths as each adapter completes. Adapters run in
	 * parallel for maximum throughput. Returns the full deduplicated list.
	 */
	async getCopilotSessionFilesStreaming(onBatch?: (files: string[]) => void): Promise<string[]> {
		const now = Date.now();
		if (this._sessionFilesCache && (now - this._sessionFilesCacheTime) < SessionDiscovery.SESSION_FILES_CACHE_TTL) {
			this.deps.log(`💨 Using cached session files list (${this._sessionFilesCache.length} files, cached ${Math.round((now - this._sessionFilesCacheTime) / 1000)}s ago)`);
			if (onBatch) { onBatch(this._sessionFilesCache); }
			return this._sessionFilesCache;
		}
		this._lastDiscoveryHadError = false;
		this._lastDiscoveryFilesCount = 0;
		const sampleFiles = await this.tryGetSampleDataFiles(now);
		if (sampleFiles) { if (onBatch) { onBatch(sampleFiles); } return sampleFiles; }
		const allDeduped: string[] = [];
		try {
			const files = await this.discoverFromAdapters(onBatch);
			allDeduped.push(...files);
			this._sessionFilesCache = allDeduped;
			this._sessionFilesCacheTime = Date.now();
			this._lastDiscoveryFilesCount = allDeduped.length;
			return allDeduped;
		} catch (error) {
			this.deps.error('Error getting session files:', error);
			this._lastDiscoveryHadError = true;
			this._lastDiscoveryFilesCount = allDeduped.length;
			return allDeduped;
		}
	}
}
