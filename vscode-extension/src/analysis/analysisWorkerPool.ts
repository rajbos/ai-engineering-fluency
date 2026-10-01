/**
 * Host-side client for the session-analysis worker threads.
 *
 * The extension host's single event loop is also what delivers webview clicks, so parsing
 * must happen elsewhere. This pool owns that "elsewhere": it lazily spawns up to `size`
 * worker threads, spreads requests across them by load, and treats the workers as
 * disposable — a crash, hang or out-of-memory kill costs a respawn, never the host.
 *
 * Requests wait in a pool-side queue and only a small window of them is in flight per worker.
 * That matters for the hang watchdog: a worker parses on one thread, so a request that merely
 * waits behind twenty others must not be mistaken for a hung one. The timeout clock starts
 * when a request is handed to a worker, where its wait is bounded by that small window.
 *
 * Failure model, which the caller (`getSessionFileDataCached`) relies on:
 *  - `unavailable`: the worker could not be used (never started, restart budget exhausted,
 *    pool disposed). Nothing was learned about the *file*, so the caller may safely analyze it
 *    in-process instead.
 *  - `timeout` / `failed`: the worker ran the analysis and it hung, threw, or died under it
 *    twice. Retrying in-process would just move the same hang or crash onto the host, so
 *    these surface as ordinary rejections, exactly like the in-process analyzer throwing would.
 */
import { Worker } from 'worker_threads';

import type { CustomizationFileEntry, SessionFileCache, SessionFileDetails } from '../../../src/types';
import type { SessionDetailsResult } from './sessionDetailsAnalyzer';
import type { CopilotCliOtelSessionUsage } from '../../../src/copilotCliOtel';
import type { AnalysisHostMessage, AnalysisRequest, AnalysisWorkerData, AnalysisWorkerMessage } from './analysisProtocol';

export type AnalysisFailureKind = 'unavailable' | 'timeout' | 'failed';

export class AnalysisWorkerError extends Error {
	constructor(message: string, readonly kind: AnalysisFailureKind, readonly code?: string) {
		super(message);
		this.name = 'AnalysisWorkerError';
	}
}

/** The subset of `worker_threads.Worker` the pool uses — a seam for deterministic tests. */
export interface WorkerLike {
	on(event: 'message', listener: (message: AnalysisWorkerMessage) => void): unknown;
	on(event: 'error', listener: (error: Error) => void): unknown;
	on(event: 'exit', listener: (code: number) => void): unknown;
	postMessage(message: AnalysisHostMessage): void;
	terminate(): Promise<number>;
	unref?(): void;
}

export interface AnalysisWorkerPoolOptions {
	/** Absolute path of the bundled `analysisWorker.js`. */
	workerPath: string;
	extensionPath: string;
	/** Maximum number of worker threads; spawned lazily as load requires. */
	size: number;
	/** A request that has been with a worker longer than this is treated as hung and its worker is killed. */
	requestTimeoutMs?: number;
	/** Worker deaths tolerated inside `restartWindowMs` before the pool gives up for the session. */
	maxRestarts?: number;
	restartWindowMs?: number;
	log: (message: string) => void;
	warn: (message: string) => void;
	/**
	 * Answers a worker's "what is this Copilot CLI session's exact usage?" using the host's single OTel index and
	 * session-store copy, so N workers do not each scan a multi-GB export. Without it a worker looks it up itself.
	 */
	resolveExactUsage?: (sessionFile: string) => Promise<CopilotCliOtelSessionUsage | null>;
	/** Test seam. Defaults to a real `worker_threads.Worker`. */
	createWorker?: (workerPath: string, data: AnalysisWorkerData) => WorkerLike;
}

type AnalysisResult = SessionFileCache | SessionDetailsResult | CustomizationFileEntry[] | null;

interface Pending {
	request: AnalysisRequest;
	resolve: (value: AnalysisResult) => void;
	reject: (error: Error) => void;
	/** Armed while the request is with a worker; undefined while it waits in the queue. */
	timer: NodeJS.Timeout | undefined;
	/** Times this request has already been re-sent after its worker died under it. */
	retries: number;
	timedOut: boolean;
}

interface Slot {
	worker: WorkerLike;
	pending: Map<number, Pending>;
	/** Set when the worker posts `ready`, i.e. its bundle loaded and initialised. */
	ready: boolean;
}

const DEFAULT_REQUEST_TIMEOUT_MS = 3 * 60 * 1000;
const DEFAULT_MAX_RESTARTS = 5;
const DEFAULT_RESTART_WINDOW_MS = 60 * 1000;
/** A request is re-sent at most once after its worker dies; a second death means it is likely the cause. */
const MAX_RETRIES_AFTER_WORKER_DEATH = 1;
/**
 * Requests handed to one worker at a time. The worker runs them strictly in order, so the second is
 * simply queued there: it is ready the moment the first finishes (no round trip to the host), while
 * the backlog beyond that stays in the pool, where it cannot be mistaken for a hang.
 */
const MAX_IN_FLIGHT_PER_WORKER = 2;
/** Generous: a multi-hundred-MB session file parses to a large object graph, but a runaway must not take the host with it. */
const WORKER_MAX_OLD_GENERATION_MB = 4096;

export class AnalysisWorkerPool {
	private readonly slots: Slot[] = [];
	private readonly queue: Pending[] = [];
	private nextRequestId = 1;
	private readonly deathTimestamps: number[] = [];
	private broken = false;
	private disposed = false;

	constructor(private readonly options: AnalysisWorkerPoolOptions) {}

	/** False once disposed or after the restart budget is exhausted; callers should then go in-process. */
	isAvailable(): boolean {
		return !this.disposed && !this.broken;
	}

	analyze(path: string, mtime: number, size: number, existingRepository?: string): Promise<SessionFileCache> {
		return this.submit((id) => ({ id, op: 'analyze', path, mtime, size, ...(existingRepository !== undefined ? { existingRepository } : {}) }))
			.then((result) => {
				if (!result) { throw new AnalysisWorkerError(`Worker returned no entry for ${path}`, 'failed'); }
				return result as SessionFileCache;
			});
	}

	/** Resolves `null` when the session has no usable debug log (mirrors the in-process analyzer). */
	supplement(cached: SessionFileCache, path: string): Promise<SessionFileCache | null> {
		return this.submit((id) => ({ id, op: 'supplement', path, cached })) as Promise<SessionFileCache | null>;
	}

	/** Fills in the host-prepared `details` skeleton from the session file (see sessionDetailsAnalyzer.ts). */
	computeDetails(path: string, mtimeMs: number, size: number, details: SessionFileDetails): Promise<SessionDetailsResult> {
		return this.submit((id) => ({ id, op: 'details', path, mtimeMs, size, details }))
			.then((result) => {
				if (!result) { throw new AnalysisWorkerError(`Worker returned no details for ${path}`, 'failed'); }
				return result as SessionDetailsResult;
			});
	}

	/** Customization files for one workspace (see workspaceCustomizationScan.ts). */
	scanCustomizationFiles(workspace: string): Promise<CustomizationFileEntry[]> {
		return this.submit((id) => ({ id, op: 'customization', workspace }))
			.then((result) => {
				if (!result) { throw new AnalysisWorkerError(`Worker returned no scan for ${workspace}`, 'failed'); }
				return result as CustomizationFileEntry[];
			});
	}

	async dispose(): Promise<void> {
		if (this.disposed) { return; }
		this.disposed = true;
		const stopped = new AnalysisWorkerError('Analysis worker pool disposed', 'unavailable');
		this.rejectQueued(stopped);
		const slots = this.slots.splice(0);
		await Promise.all(slots.map((slot) => this.retire(slot, stopped)));
	}

	// ── Submission ──────────────────────────────────────────────────────────

	private submit(build: (id: number) => AnalysisRequest): Promise<AnalysisResult> {
		if (!this.isAvailable()) {
			return Promise.reject(new AnalysisWorkerError('Analysis worker pool is not available', 'unavailable'));
		}
		const id = this.nextRequestId++;
		return new Promise<AnalysisResult>((resolve, reject) => {
			this.queue.push({ request: build(id), resolve, reject, timer: undefined, retries: 0, timedOut: false });
			this.pump();
		});
	}

	/** Hands queued requests to workers with spare capacity, growing the pool (up to `size`) when needed. */
	private pump(): void {
		while (this.queue.length > 0) {
			if (!this.isAvailable()) {
				this.rejectQueued(new AnalysisWorkerError('Analysis worker pool is not available', 'unavailable'));
				return;
			}
			let slot: Slot | undefined;
			try {
				slot = this.acquireSlot();
			} catch (error) {
				this.noteDeath();
				this.rejectQueued(new AnalysisWorkerError(`Could not start analysis worker: ${error instanceof Error ? error.message : String(error)}`, 'unavailable'));
				return;
			}
			if (!slot) { return; } // every worker is at capacity; a completion will pump again
			this.post(slot, this.queue.shift()!);
		}
	}

	private rejectQueued(error: Error): void {
		for (const pending of this.queue.splice(0)) { pending.reject(error); }
	}

	/** Least-loaded worker with spare capacity; a fresh one when all live workers are busy and there is room. */
	private acquireSlot(): Slot | undefined {
		let best: Slot | undefined;
		for (const slot of this.slots) {
			if (slot.pending.size < MAX_IN_FLIGHT_PER_WORKER && (!best || slot.pending.size < best.pending.size)) { best = slot; }
		}
		if (best && best.pending.size === 0) { return best; }
		if (this.slots.length < Math.max(1, this.options.size)) { return this.spawn(); }
		return best;
	}

	private post(slot: Slot, pending: Pending): void {
		const timeoutMs = this.options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
		pending.timer = setTimeout(() => this.onTimeout(slot, pending), timeoutMs);
		pending.timer.unref?.();
		slot.pending.set(pending.request.id, pending);
		try {
			slot.worker.postMessage(pending.request);
		} catch (error) {
			slot.pending.delete(pending.request.id);
			clearTimeout(pending.timer);
			pending.timer = undefined;
			pending.reject(new AnalysisWorkerError(`Could not message analysis worker: ${error instanceof Error ? error.message : String(error)}`, 'unavailable'));
		}
	}

	// ── Worker lifecycle ────────────────────────────────────────────────────

	private spawn(): Slot {
		const data: AnalysisWorkerData = { extensionPath: this.options.extensionPath };
		const worker = this.options.createWorker
			? this.options.createWorker(this.options.workerPath, data)
			: new Worker(this.options.workerPath, {
				workerData: data,
				// Workers inherit the parent's node flags by default; the extension host's (--inspect, --require hooks, ...) are meant for that process, not for this one.
				execArgv: [],
				resourceLimits: { maxOldGenerationSizeMb: WORKER_MAX_OLD_GENERATION_MB },
			}) as unknown as WorkerLike;
		// A worker alone must never keep the host process alive.
		worker.unref?.();
		const slot: Slot = { worker, pending: new Map(), ready: false };
		this.slots.push(slot);
		worker.on('message', (message) => this.onMessage(slot, message));
		worker.on('error', (error) => this.onWorkerGone(slot, `worker error: ${error.message}`));
		worker.on('exit', (code) => this.onWorkerGone(slot, `worker exited with code ${code}`));
		this.options.log(`Analysis worker started (${this.slots.length}/${Math.max(1, this.options.size)})`);
		return slot;
	}

	private onMessage(slot: Slot, message: AnalysisWorkerMessage): void {
		if (message.type === 'warn') { this.options.warn(message.message); return; }
		if (message.type === 'ready') { slot.ready = true; return; }
		if (message.type === 'exactUsage') { this.answerExactUsage(slot, message.rpcId, message.sessionFile); return; }
		if (message.type !== 'result') { return; }
		const pending = slot.pending.get(message.id);
		if (!pending) { return; }
		// Whether this was the request at the front of the worker's line decides below whether the next
		// one has just started running (see restartOldestClock).
		const wasOldest = slot.pending.values().next().value === pending;
		slot.pending.delete(message.id);
		if (pending.timer) { clearTimeout(pending.timer); }
		pending.timer = undefined;
		if (message.ok) { pending.resolve(message.result); }
		else { pending.reject(new AnalysisWorkerError(message.error, 'failed', message.code)); }
		// Requests run concurrently inside a worker (one's disk read overlaps another's parse), so a younger
		// one can finish first. That says nothing about the oldest, which must keep its running clock.
		if (wasOldest) { this.restartOldestClock(slot); }
		this.pump();
	}

	/**
	 * A worker parses serially, so the request now at the front of its line only starts being worked on
	 * when the one ahead of it finishes. Its hang clock starts then, not when it was posted.
	 */
	private restartOldestClock(slot: Slot): void {
		const oldest = slot.pending.values().next().value;
		if (!oldest) { return; }
		if (oldest.timer) { clearTimeout(oldest.timer); }
		oldest.timer = setTimeout(() => this.onTimeout(slot, oldest), this.options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS);
		oldest.timer.unref?.();
	}

	private answerExactUsage(slot: Slot, rpcId: number, sessionFile: string): void {
		const reply = (usage: CopilotCliOtelSessionUsage | null, error?: string): void => {
			// The worker may have died while the host was looking this up; there is no one to tell then.
			try { slot.worker.postMessage({ type: 'exactUsageReply', rpcId, usage, ...(error !== undefined ? { error } : {}) }); } catch { /* worker gone */ }
		};
		const resolve = this.options.resolveExactUsage;
		if (!resolve) { reply(null); return; }
		resolve(sessionFile).then((usage) => reply(usage), (error: unknown) => reply(null, error instanceof Error ? error.message : String(error)));
	}

	private onTimeout(slot: Slot, pending: Pending): void {
		if (!slot.pending.has(pending.request.id)) { return; }
		// A worker parses serially, so a request that is not the oldest in flight is waiting behind it, not
		// hung. Give it a fresh window; if the oldest really is stuck, its own timer will kill the worker.
		if (slot.pending.values().next().value !== pending) {
			pending.timer = setTimeout(() => this.onTimeout(slot, pending), this.options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS);
			pending.timer.unref?.();
			return;
		}
		pending.timedOut = true;
		const target = 'path' in pending.request ? pending.request.path : 'workspace' in pending.request ? pending.request.workspace : 'a session';
		this.options.warn(`Analysis of ${target} exceeded ${(this.options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS) / 1000}s; restarting its worker`);
		// Killing the worker is the only way to stop a hung synchronous parse. The exit handler
		// rejects this request as a timeout and re-sends the innocent ones sharing the worker.
		void slot.worker.terminate().catch(() => undefined);
	}

	/** Shared by 'error' and 'exit': both mean this worker can no longer answer. */
	private onWorkerGone(slot: Slot, reason: string): void {
		const index = this.slots.indexOf(slot);
		if (index === -1) { return; } // already handled (error is normally followed by exit)
		this.slots.splice(index, 1);
		const displaced = [...slot.pending.values()];
		slot.pending.clear();
		this.options.warn(`Analysis ${reason}`);
		this.noteDeath();
		void slot.worker.terminate().catch(() => undefined);
		const retry: Pending[] = [];
		// A request that timed out is why this worker was killed. Its neighbours are innocent, however many
		// earlier deaths they have been through, so they are re-sent without spending their own retry.
		const culpritKnown = displaced.some((p) => p.timedOut);
		for (const pending of displaced) {
			if (pending.timer) { clearTimeout(pending.timer); }
			pending.timer = undefined;
			if (pending.timedOut) {
				pending.reject(new AnalysisWorkerError(`Analysis timed out (${reason})`, 'timeout'));
			} else if (this.disposed || !slot.ready) {
				// Disposed, or the worker never got as far as `ready` (its bundle failed to load): nothing was
				// learned about this file, so the caller may analyze it in-process.
				pending.reject(new AnalysisWorkerError(`Analysis worker stopped (${reason})`, 'unavailable'));
			} else if (culpritKnown) {
				if (this.isAvailable()) { retry.push(pending); }
				else { pending.reject(new AnalysisWorkerError(`Analysis workers keep dying (${reason})`, 'unavailable')); }
			} else if (pending.retries >= MAX_RETRIES_AFTER_WORKER_DEATH) {
				// Two workers died under this request: it is the likely cause (OOM, native crash). Falling back
				// to in-process analysis would repeat that failure on the host, so this is a file failure.
				pending.reject(new AnalysisWorkerError(`Analysis worker died repeatedly (${reason})`, 'failed'));
			} else if (!this.isAvailable()) {
				// Only the pool-wide restart budget ran out; this request is not shown to be the culprit.
				pending.reject(new AnalysisWorkerError(`Analysis workers keep dying (${reason})`, 'unavailable'));
			} else {
				pending.retries++;
				retry.push(pending);
			}
		}
		// Re-sent work goes to the front: it has already waited its turn once.
		this.queue.unshift(...retry);
		this.pump();
	}

	private noteDeath(): void {
		const now = Date.now();
		const windowMs = this.options.restartWindowMs ?? DEFAULT_RESTART_WINDOW_MS;
		this.deathTimestamps.push(now);
		while (this.deathTimestamps.length > 0 && now - this.deathTimestamps[0] > windowMs) { this.deathTimestamps.shift(); }
		if (this.deathTimestamps.length > (this.options.maxRestarts ?? DEFAULT_MAX_RESTARTS) && !this.broken) {
			this.broken = true;
			this.options.warn('Analysis workers keep dying; falling back to in-process analysis for the rest of this session.');
		}
	}

	/** Tears a worker down on purpose. The slot is already out of `slots`, so its exit event is ignored. */
	private async retire(slot: Slot, reason: Error): Promise<void> {
		for (const pending of slot.pending.values()) {
			if (pending.timer) { clearTimeout(pending.timer); }
			pending.reject(reason);
		}
		slot.pending.clear();
		try { await slot.worker.terminate(); } catch { /* already gone */ }
	}
}
