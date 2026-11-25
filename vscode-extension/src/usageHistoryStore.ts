/**
 * Durable usage history for session files that left the disk (issue #2728).
 *
 * The session cache mirrors the files that exist right now: when a session file is moved away
 * or deleted (Claude Code's own `cleanupPeriodDays` sweep deletes transcripts after 30 days by
 * default), its cache entry is evicted and tombstoned, and every total recomputed from the
 * cache loses that session's usage. This store keeps the already-counted numbers of such a
 * session, so the daily, monthly and 30-day totals keep it after the file is gone.
 *
 * Contract:
 * - Append-only: an entry is only added (or replaced by a newer version of the same path).
 *   Nothing drops it as a side effect of files moving. Only {@link UsageHistoryStore.clear}
 *   (the "Clear Usage History" command) removes history.
 * - Only fields the period/daily aggregation reads are kept; the per-session analysis detail
 *   (`usageAnalysis`) is not, so detail views still cover only files that exist.
 * - Shared by every window of one VS Code edition through one JSON file in globalStorage.
 *   Saves are read-merge-write under a file lock; merging is a union (newer entry per path
 *   wins), so a window can never drop what another window added. A clear writes `clearedAt`;
 *   every load and merge drops entries retained at or before it, so another window's
 *   in-memory copy cannot bring cleared history back.
 *
 * No `vscode` import: the store is plain Node so it can be unit-tested without the shim.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { SessionFileCache } from '../../src/types';
import type { SessionAggregateInput } from '../../src/statsHelpers';
import { acquireFileLock, releaseFileLock, type LockOwner } from '../../src/fileLock';

/** One session whose file is gone, with the numbers it last had. */
export interface RetainedSession {
	/** The cache entry as it was when the file disappeared, minus `usageAnalysis`. */
	data: SessionFileCache;
	/** Editor label resolved while the file still existed (a missing file can't be peeked). */
	editorType?: string;
	/** When this store retained it (ms since epoch); compared against `clearedAt`. */
	retainedAt: number;
}

interface UsageHistoryFile {
	schemaVersion: number;
	clearedAt: number;
	entries: Record<string, RetainedSession>;
}

export interface UsageHistoryStoreDeps {
	log: (msg: string) => void;
	warn: (msg: string) => void;
	lockOwner: () => LockOwner;
	now?: () => number;
}

const SCHEMA_VERSION = 1;
/** Matches the session-cache snapshot cap; the oldest sessions (by file mtime) go first. */
const MAX_ENTRIES = 20_000;
/** A UUID-like file name is unique to one session, wherever the file lives. */
const SESSION_ID_FILE_NAME_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Path key used to match a retained session against live cache entries. */
function pathKey(filePath: string): string {
	const normalized = path.normalize(filePath);
	return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}

/**
 * The session id in a file name, when the name carries one. Lets a retained entry be matched to
 * the same session living at a new path (Claude Code's `/cd` relocates a transcript into another
 * project folder), so it is not counted twice. Generic names (e.g. `main.jsonl`) return undefined
 * and only match by full path.
 */
function sessionIdOf(filePath: string): string | undefined {
	const match = SESSION_ID_FILE_NAME_RE.exec(path.basename(filePath));
	return match ? match[0].toLowerCase() : undefined;
}

/** Newer file version wins; for the same version, the later retention wins. */
function isNewer(candidate: RetainedSession, existing: RetainedSession | undefined): boolean {
	if (!existing) { return true; }
	if (candidate.data.mtime !== existing.data.mtime) { return candidate.data.mtime > existing.data.mtime; }
	return candidate.retainedAt > existing.retainedAt;
}

function isRetainedSession(value: unknown): value is RetainedSession {
	if (!value || typeof value !== 'object') { return false; }
	const v = value as Partial<RetainedSession>;
	return typeof v.retainedAt === 'number' && !!v.data && typeof v.data === 'object' && typeof v.data.mtime === 'number';
}

export class UsageHistoryStore {
	private entries = new Map<string, RetainedSession>();
	private clearedAt = 0;
	private dirty = false;
	private saving: Promise<void> | undefined;

	constructor(private readonly filePath: string, private readonly deps: UsageHistoryStoreDeps) {}

	private now(): number {
		return this.deps.now ? this.deps.now() : Date.now();
	}

	get size(): number {
		return this.entries.size;
	}

	/**
	 * Keep the usage of a session whose file is confirmed gone. Returns false (and keeps nothing)
	 * for an entry with no real usage: a details-only placeholder or a session without
	 * interactions contributes nothing to any total.
	 */
	retain(filePath: string, data: SessionFileCache, editorType?: string): boolean {
		if (data.detailsOnly || !(data.interactions > 0)) { return false; }
		const { usageAnalysis: _detail, ...totals } = data;
		const candidate: RetainedSession = { data: totals, editorType, retainedAt: this.now() };
		if (!isNewer(candidate, this.entries.get(filePath))) { return false; }
		this.entries.set(filePath, candidate);
		this.dirty = true;
		return true;
	}

	/**
	 * Aggregation inputs for retained sessions that are not live any more. A retained session is
	 * skipped when its path, or a file carrying the same session id, is in `livePaths` (the file
	 * came back, or moved somewhere it is still discovered), so it is never counted twice.
	 * Entries entirely older than `cutoffMs` are skipped: no reported period reaches them.
	 */
	toAggregateInputs(livePaths: Iterable<string>, editorTypeOf: (filePath: string) => string, cutoffMs: number): SessionAggregateInput[] {
		if (this.entries.size === 0) { return []; }
		const liveKeys = new Set<string>();
		const liveIds = new Set<string>();
		for (const live of livePaths) {
			liveKeys.add(pathKey(live));
			const id = sessionIdOf(live);
			if (id) { liveIds.add(id); }
		}
		const inputs: SessionAggregateInput[] = [];
		for (const [filePath, retained] of this.entries) {
			if (liveKeys.has(pathKey(filePath))) { continue; }
			const id = sessionIdOf(filePath);
			if (id && liveIds.has(id)) { continue; }
			const { data } = retained;
			const lastMs = data.lastInteraction ? Date.parse(data.lastInteraction) : NaN;
			if (data.mtime < cutoffMs && !(lastMs >= cutoffMs)) { continue; }
			inputs.push({ editorType: retained.editorType ?? editorTypeOf(filePath), sessionData: data, mtime: data.mtime, lastInteraction: data.lastInteraction });
		}
		return inputs;
	}

	/** Load what every window has retained so far. A missing or unreadable file means empty. */
	async load(): Promise<void> {
		const disk = await this.readFile();
		if (!disk) { return; }
		this.mergeFrom(disk);
		this.deps.log(`🗄️ Usage history: ${this.entries.size} session(s) kept from files no longer on disk`);
	}

	/** Persist retained entries, if any changed. Concurrent calls share one save. */
	async save(): Promise<void> {
		if (!this.dirty) { return; }
		if (!this.saving) {
			this.saving = this.saveLocked().finally(() => { this.saving = undefined; });
		}
		return this.saving;
	}

	/** Drop all retained history, in this window and on disk (and so in every window). */
	async clear(): Promise<void> {
		this.clearedAt = this.now();
		this.entries.clear();
		this.dirty = true;
		await this.saving;
		await this.save();
	}

	private async saveLocked(): Promise<void> {
		const lockPath = `${this.filePath}.lock`;
		const owner = this.deps.lockOwner();
		if (!(await acquireFileLock(lockPath, owner, { log: this.deps.log, warn: this.deps.warn }))) {
			this.deps.log('🗄️ Usage history save deferred: another window holds its lock');
			return;
		}
		try {
			// Clear the flag before the write: a retain() landing mid-write marks it dirty again.
			this.dirty = false;
			const disk = await this.readFile();
			if (disk) { this.mergeFrom(disk); }
			this.capEntries();
			const body: UsageHistoryFile = { schemaVersion: SCHEMA_VERSION, clearedAt: this.clearedAt, entries: Object.fromEntries(this.entries) };
			await fs.promises.mkdir(path.dirname(this.filePath), { recursive: true });
			const tmpPath = `${this.filePath}.${process.pid}.${this.now()}.tmp`;
			await fs.promises.writeFile(tmpPath, JSON.stringify(body), 'utf8');
			await fs.promises.rename(tmpPath, this.filePath);
		} catch (err) {
			this.dirty = true;
			this.deps.warn(`Could not save usage history: ${err instanceof Error ? err.message : String(err)}`);
		} finally {
			await releaseFileLock(lockPath, owner);
		}
	}

	private mergeFrom(disk: UsageHistoryFile): void {
		this.clearedAt = Math.max(this.clearedAt, disk.clearedAt);
		for (const [filePath, retained] of Object.entries(disk.entries)) {
			if (isRetainedSession(retained) && isNewer(retained, this.entries.get(filePath))) {
				this.entries.set(filePath, retained);
			}
		}
		for (const [filePath, retained] of this.entries) {
			if (retained.retainedAt <= this.clearedAt) { this.entries.delete(filePath); }
		}
	}

	private capEntries(): void {
		if (this.entries.size <= MAX_ENTRIES) { return; }
		const newestFirst = [...this.entries].sort((a, b) => b[1].data.mtime - a[1].data.mtime);
		this.entries = new Map(newestFirst.slice(0, MAX_ENTRIES));
	}

	private async readFile(): Promise<UsageHistoryFile | undefined> {
		let raw: string;
		try {
			raw = await fs.promises.readFile(this.filePath, 'utf8');
		} catch {
			return undefined;
		}
		try {
			const parsed = JSON.parse(raw) as Partial<UsageHistoryFile>;
			if (parsed.schemaVersion !== SCHEMA_VERSION || !parsed.entries || typeof parsed.entries !== 'object') { return undefined; }
			return { schemaVersion: SCHEMA_VERSION, clearedAt: typeof parsed.clearedAt === 'number' ? parsed.clearedAt : 0, entries: parsed.entries };
		} catch (err) {
			this.deps.warn(`Ignoring unreadable usage history file: ${err instanceof Error ? err.message : String(err)}`);
			return undefined;
		}
	}
}
