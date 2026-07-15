/**
 * Reads GitHub Copilot CLI's OpenTelemetry file export (~/.copilot/otel/*.jsonl) to
 * provide exact per-session token counts, replacing the ratio-based estimates used
 * when a session lacks a session.shutdown event with modelMetrics.
 *
 * See docs/COPILOT-CLI-OTEL-EXPORT.md for how the export is enabled and its record shapes.
 * OTel export is off by default (opt-in via env vars set before the CLI process starts),
 * so most machines will have no ~/.copilot/otel/ directory — every function here degrades
 * to "no data" rather than throwing.
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { Worker } from 'worker_threads';
import type { ModelUsage } from './types';

/** Per-session usage aggregated from OTel `chat <model>` spans. */
export interface CopilotCliOtelSessionUsage {
	modelUsage: ModelUsage;
	actualTokens: number;
	cacheReadTokens: number;
	/** Sum of github.copilot.nano_aiu across the session's chat spans (0 when unavailable). */
	nanoAiu: number;
}

/** Attributes read off an OTel `chat <model>` span. All other span/attribute fields are ignored. */
interface OtelChatSpanAttributes {
	'gen_ai.conversation.id'?: string;
	'gen_ai.response.model'?: string;
	'gen_ai.request.model'?: string;
	'gen_ai.usage.input_tokens'?: number;
	'gen_ai.usage.output_tokens'?: number;
	'gen_ai.usage.cache_creation.input_tokens'?: number;
	'gen_ai.usage.cache_read.input_tokens'?: number;
	'github.copilot.nano_aiu'?: number;
}

interface OtelSpanRecord {
	type?: string;
	name?: string;
	attributes?: OtelChatSpanAttributes;
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns the conventional Copilot CLI OTel export directory (~/.copilot/otel). */
export function getCopilotCliOtelDir(): string {
	return path.join(os.homedir(), '.copilot', 'otel');
}

/**
 * Extracts the Copilot CLI session UUID (matches OTel's gen_ai.conversation.id) from a
 * session file path. Handles both known Copilot CLI path shapes:
 *   - ~/.copilot/session-state/{uuid}/events.jsonl
 *   - <...>/session-store.db#{uuid}  (virtual DB path)
 * Returns null for any other path.
 */
export function extractCopilotCliSessionId(sessionFile: string): string | null {
	const hashIdx = sessionFile.lastIndexOf('#');
	if (hashIdx !== -1 && sessionFile.slice(0, hashIdx).endsWith('.db')) {
		const uuid = sessionFile.slice(hashIdx + 1);
		return UUID_RE.test(uuid) ? uuid : null;
	}
	if (sessionFile.includes('session-state')) {
		const uuid = path.basename(path.dirname(sessionFile));
		return UUID_RE.test(uuid) ? uuid : null;
	}
	return null;
}

/** Numeric usage fields read off one `chat <model>` span, defaulted to 0 when absent. */
interface OtelChatSpanUsage {
	model: string;
	input: number;
	output: number;
	cacheCreation: number;
	cacheRead: number;
	nanoAiu: number;
}

/** Extracts the numeric usage fields from a chat span's attributes, defaulting missing values to 0. */
function readOtelChatSpanUsage(attrs: OtelChatSpanAttributes | undefined): OtelChatSpanUsage {
	const num = (v: number | undefined): number => (typeof v === 'number' ? v : 0);
	return {
		model: attrs?.['gen_ai.response.model'] || attrs?.['gen_ai.request.model'] || 'unknown',
		input: num(attrs?.['gen_ai.usage.input_tokens']),
		output: num(attrs?.['gen_ai.usage.output_tokens']),
		cacheCreation: num(attrs?.['gen_ai.usage.cache_creation.input_tokens']),
		cacheRead: num(attrs?.['gen_ai.usage.cache_read.input_tokens']),
		nanoAiu: num(attrs?.['github.copilot.nano_aiu']),
	};
}

/** Merges one chat span's usage into a session's aggregate entry (creating the entry/model bucket as needed). */
function accumulateOtelChatSpanUsage(index: Map<string, CopilotCliOtelSessionUsage>, sessionId: string, usage: OtelChatSpanUsage): void {
	if (!index.has(sessionId)) {
		index.set(sessionId, { modelUsage: {}, actualTokens: 0, cacheReadTokens: 0, nanoAiu: 0 });
	}
	const entry = index.get(sessionId)!;
	if (!entry.modelUsage[usage.model]) { entry.modelUsage[usage.model] = { inputTokens: 0, outputTokens: 0 }; }
	const modelEntry = entry.modelUsage[usage.model];

	// gen_ai.usage.input_tokens is already the total (uncached + cache creation + cache read),
	// matching ModelUsage.inputTokens's documented meaning.
	modelEntry.inputTokens += usage.input;
	modelEntry.outputTokens += usage.output;
	if (usage.cacheCreation > 0) { modelEntry.cacheCreationTokens = (modelEntry.cacheCreationTokens ?? 0) + usage.cacheCreation; }
	if (usage.cacheRead > 0) { modelEntry.cachedReadTokens = (modelEntry.cachedReadTokens ?? 0) + usage.cacheRead; }

	entry.actualTokens += usage.input + usage.output;
	entry.cacheReadTokens += usage.cacheRead;
	entry.nanoAiu += usage.nanoAiu;
}

/**
 * Substring that every Copilot CLI `chat <model>` span line contains. The export interleaves
 * these few spans with tens of thousands of metric/log/other-span lines we never use, so this
 * cheap string test lets us skip JSON.parse on the ~99.8% of lines that can't be a chat span
 * (measured: 165 of 108,112 lines on a real 134 MB export). It's only a pre-filter —
 * consolidateOtelRecord still fully validates each candidate — so a stray substring match at
 * worst costs one wasted parse.
 */
const OTEL_CHAT_LINE_HINT = '"name":"chat ';

/** ASCII newline byte, used for byte-level line scanning of the export files. */
const NEWLINE_BYTE = 0x0a;

/** Merges one already-parsed OTel record into `index` when it's a `chat <model>` span; ignores anything else. */
function consolidateOtelRecord(record: OtelSpanRecord, index: Map<string, CopilotCliOtelSessionUsage>): void {
	if (record.type !== 'span' || !record.name?.startsWith('chat ')) { return; }
	const sessionId = record.attributes?.['gen_ai.conversation.id'];
	if (!sessionId) { return; }
	accumulateOtelChatSpanUsage(index, sessionId, readOtelChatSpanUsage(record.attributes));
}

/** Parses one export line into a `chat <model>` candidate record, or null when it can't be one. */
function parseChatCandidateLine(line: string): OtelSpanRecord | null {
	if (!line.includes(OTEL_CHAT_LINE_HINT)) { return null; }
	try { return JSON.parse(line) as OtelSpanRecord; } catch { return null; }
}

/** One export file to read, over the half-open byte range [start, end). */
interface OtelReadPlanItem { name: string; start: number; end: number; }

/**
 * Result of reading a plan: the parsed `chat <model>` candidate records, plus, per file, the
 * byte offset just past the last complete (newline-terminated) line we consumed. A trailing
 * partial line (still being appended) is left unconsumed so it's re-read once it completes.
 */
interface OtelReadResult { records: OtelSpanRecord[]; consumed: Record<string, number>; }

/** Coerces an untrusted worker payload into a well-formed OtelReadResult. */
function normalizeReadResult(result: unknown): OtelReadResult {
	const r = result as Partial<OtelReadResult> | undefined;
	return {
		records: Array.isArray(r?.records) ? r!.records : [],
		consumed: r?.consumed && typeof r.consumed === 'object' ? r.consumed : {},
	};
}

/**
 * Source for the OTel-parsing worker, run via `new Worker(src, { eval: true })`. Kept as a
 * self-contained string that touches only Node built-ins so it needs no separate entry point
 * or runtime path resolution — it bundles identically across every build layout (tsc → out/,
 * esbuild → extension dist/, esbuild → cli dist/). It does the expensive part off the caller's
 * main thread: for each planned byte range it streams the file in chunks (never holding the
 * whole 100+ MB file in memory), scans for line boundaries at the byte level, cheaply
 * pre-filters, and JSON.parses only the handful of `chat <model>` candidate lines. It posts
 * back the small candidate array plus how far it consumed each file, so the main thread can
 * consolidate and remember offsets for the next (incremental) refresh.
 */
const OTEL_WORKER_SOURCE = `
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const HINT = Buffer.from(${JSON.stringify(OTEL_CHAT_LINE_HINT)});
const NL = 0x0a;
function readRange(full, start, end) {
	return new Promise((resolve) => {
		const records = [];
		if (end <= start) { resolve({ records, consumed: start }); return; }
		const stream = fs.createReadStream(full, { start, end: end - 1 });
		let carry = null;
		let consumed = start;
		stream.on('data', (chunk) => {
			const buf = carry ? Buffer.concat([carry, chunk]) : chunk;
			let from = 0, nl;
			while ((nl = buf.indexOf(NL, from)) !== -1) {
				const line = buf.subarray(from, nl);
				if (line.indexOf(HINT) !== -1) {
					try { records.push(JSON.parse(line.toString('utf8'))); } catch { /* malformed line — skip */ }
				}
				consumed += (nl - from) + 1;
				from = nl + 1;
			}
			carry = from < buf.length ? buf.subarray(from) : null;
		});
		stream.on('end', () => resolve({ records, consumed }));
		stream.on('error', () => resolve({ records, consumed }));
	});
}
async function run() {
	const records = [];
	const consumed = {};
	for (const item of workerData.plan) {
		try {
			const r = await readRange(path.join(workerData.dir, item.name), item.start, item.end);
			for (const rec of r.records) { records.push(rec); }
			consumed[item.name] = r.consumed;
		} catch { /* unreadable file — leave its offset untouched */ }
	}
	parentPort.postMessage({ records, consumed });
}
run().catch(() => { try { parentPort.postMessage({ records: [], consumed: {} }); } catch { /* worker tearing down */ } });
`;

/**
 * Runs a read plan in a worker thread, resolving the parsed candidate records and per-file
 * consumed offsets. Rejects if the worker can't be created or dies before posting, so the
 * caller can fall back to an in-process read of the same plan.
 */
function loadOtelRecordsViaWorker(dir: string, plan: OtelReadPlanItem[]): Promise<OtelReadResult> {
	return new Promise<OtelReadResult>((resolve, reject) => {
		let worker: Worker;
		try {
			worker = new Worker(OTEL_WORKER_SOURCE, { eval: true, workerData: { dir, plan } });
		} catch (err) {
			reject(err);
			return;
		}
		let settled = false;
		const finish = (done: () => void): void => {
			if (settled) { return; }
			settled = true;
			void worker.terminate();
			done();
		};
		worker.once('message', (result: unknown) => finish(() => resolve(normalizeReadResult(result))));
		worker.once('error', (err) => finish(() => reject(err)));
		worker.once('exit', (code) => finish(() => reject(new Error(`OTel worker exited before posting results (code ${code})`))));
	});
}

/** Reads bytes [start, end) of a file into a Buffer (used for small incremental tails read in-process). */
async function readByteRange(file: string, start: number, end: number): Promise<Buffer> {
	if (end <= start) { return Buffer.alloc(0); }
	const fh = await fs.promises.open(file, 'r');
	try {
		const length = end - start;
		const buf = Buffer.allocUnsafe(length);
		const { bytesRead } = await fh.read(buf, 0, length, start);
		return bytesRead === length ? buf : buf.subarray(0, bytesRead);
	} finally {
		await fh.close();
	}
}

/**
 * In-process reader for a plan, used for small tails (where a worker's spawn cost would dwarf
 * the work) and as the fallback when a worker can't be spawned. Mirrors the worker's contract:
 * parse `chat <model>` candidate lines and report how far each file was consumed.
 */
async function loadOtelRecordsInProcess(dir: string, plan: OtelReadPlanItem[]): Promise<OtelReadResult> {
	const records: OtelSpanRecord[] = [];
	const consumed: Record<string, number> = {};
	for (const item of plan) {
		try {
			const buf = await readByteRange(path.join(dir, item.name), item.start, item.end);
			const lastNl = buf.lastIndexOf(NEWLINE_BYTE);
			if (lastNl === -1) { consumed[item.name] = item.start; continue; } // no complete line yet
			for (const line of buf.subarray(0, lastNl + 1).toString('utf8').split('\n')) {
				const record = parseChatCandidateLine(line);
				if (record) { records.push(record); }
			}
			consumed[item.name] = item.start + lastNl + 1;
		} catch { /* unreadable file — leave its offset untouched */ }
	}
	return { records, consumed };
}

let cachedIndex: Map<string, CopilotCliOtelSessionUsage> | null = null;
let cachedAt = 0;
/**
 * Bytes we've already consumed from each export file, keyed by filename. Lets a refresh read
 * only the newly-appended tail instead of re-reading the whole (ever-growing) file, since the
 * Copilot CLI export is strictly append-only. Reset on a full rebuild.
 */
let fileOffsets = new Map<string, number>();
/** Re-scan the OTel directory at most this often; the export file grows across a live CLI session. */
const CACHE_TTL_MS = 30_000;
/** Reads larger than this go to a worker thread; smaller tails are parsed in-process (sub-ms, no spawn cost). */
const OTEL_WORKER_MIN_BYTES = 1_000_000;
/**
 * In-flight load, cached (not just the resolved value) so concurrent callers on a cold
 * cache all await the same read+parse instead of each independently reading the OTel
 * export file — which is unbounded in size and can reach tens of MB, so N concurrent
 * callers means N redundant full reads/parses of it at once.
 */
let inFlightLoad: Promise<Map<string, CopilotCliOtelSessionUsage>> | null = null;

/** Current byte size of each named export file in `dir` (skipping any that vanished mid-scan). */
async function statOtelFiles(dir: string, names: string[]): Promise<Map<string, number>> {
	const sizes = new Map<string, number>();
	for (const name of names) {
		try { sizes.set(name, (await fs.promises.stat(path.join(dir, name))).size); }
		catch { /* vanished between readdir and stat — skip */ }
	}
	return sizes;
}

/**
 * Whether to rebuild the index from scratch rather than append incrementally: true on a cold
 * cache, or when a tracked file shrank or vanished (log rotation / truncation), since the
 * cached totals then include bytes that no longer exist.
 */
function otelNeedsRebuild(sizes: Map<string, number>): boolean {
	if (cachedIndex === null) { return true; }
	for (const [name, off] of fileOffsets) {
		const size = sizes.get(name);
		if (size === undefined || size < off) { return true; }
	}
	return false;
}

/** Plans the byte range to read for each file that grew past its consumed offset (the whole file on a rebuild). */
function buildOtelReadPlan(sizes: Map<string, number>, baseOffsets: Map<string, number>): { plan: OtelReadPlanItem[]; totalBytes: number } {
	const plan: OtelReadPlanItem[] = [];
	let totalBytes = 0;
	for (const [name, size] of sizes) {
		const start = baseOffsets.get(name) ?? 0;
		if (size > start) { plan.push({ name, start, end: size }); totalBytes += size - start; }
	}
	return { plan, totalBytes };
}

/** Reads a plan off the main thread for large tails, in-process for small ones, falling back to in-process if the worker fails. */
async function runOtelReadPlan(dir: string, plan: OtelReadPlanItem[], totalBytes: number): Promise<OtelReadResult> {
	try {
		return totalBytes > OTEL_WORKER_MIN_BYTES
			? await loadOtelRecordsViaWorker(dir, plan)
			: await loadOtelRecordsInProcess(dir, plan);
	} catch {
		// Worker path failed (e.g. constrained runtime) — retry the same plan in-process.
		return loadOtelRecordsInProcess(dir, plan);
	}
}

async function readCopilotCliOtelIndex(): Promise<Map<string, CopilotCliOtelSessionUsage>> {
	const dir = getCopilotCliOtelDir();
	let names: string[];
	try {
		names = (await fs.promises.readdir(dir)).filter((n) => n.endsWith('.jsonl'));
	} catch {
		// ~/.copilot/otel doesn't exist — OTel export not enabled. Forget any prior offsets.
		fileOffsets = new Map();
		return new Map();
	}

	const sizes = await statOtelFiles(dir, names);
	const rebuild = otelNeedsRebuild(sizes);
	const index = rebuild ? new Map<string, CopilotCliOtelSessionUsage>() : cachedIndex!;
	const baseOffsets = rebuild ? new Map<string, number>() : fileOffsets;

	const { plan, totalBytes } = buildOtelReadPlan(sizes, baseOffsets);
	if (plan.length === 0) {
		// Nothing new to read; keep the current (possibly freshly-rebuilt-empty) index and offsets.
		fileOffsets = baseOffsets;
		return index;
	}

	const result = await runOtelReadPlan(dir, plan, totalBytes);
	for (const record of result.records) { consolidateOtelRecord(record, index); }

	const nextOffsets = new Map(baseOffsets);
	for (const [name, off] of Object.entries(result.consumed)) { nextOffsets.set(name, off); }
	fileOffsets = nextOffsets;
	return index;
}

/**
 * Loads (and caches) the OTel usage index. The first load reads every .jsonl file under
 * ~/.copilot/otel/ off the main thread; later refreshes (after the TTL) read only the bytes
 * appended since, since the export is append-only.
 */
export async function loadCopilotCliOtelIndex(): Promise<Map<string, CopilotCliOtelSessionUsage>> {
	const now = Date.now();
	if (cachedIndex && now - cachedAt < CACHE_TTL_MS) { return cachedIndex; }
	if (inFlightLoad) { return inFlightLoad; }

	inFlightLoad = readCopilotCliOtelIndex()
		.then((index) => {
			cachedIndex = index;
			cachedAt = Date.now();
			return index;
		})
		.finally(() => { inFlightLoad = null; });
	return inFlightLoad;
}

/** Clears the cached OTel index and per-file offsets. Exposed for tests. */
export function clearCopilotCliOtelCache(): void {
	cachedIndex = null;
	cachedAt = 0;
	inFlightLoad = null;
	fileOffsets = new Map();
}

/**
 * Expires the cache TTL while keeping the index and per-file offsets, so the next
 * loadCopilotCliOtelIndex() performs an incremental refresh. Exposed for tests.
 */
export function expireCopilotCliOtelCacheForTests(): void {
	cachedAt = 0;
	inFlightLoad = null;
}

/**
 * Looks up exact OTel-derived usage for a Copilot CLI session file, or null when the
 * path isn't a Copilot CLI session or no matching OTel export data was found.
 */
export async function getCopilotCliOtelUsage(sessionFile: string): Promise<CopilotCliOtelSessionUsage | null> {
	const sessionId = extractCopilotCliSessionId(sessionFile);
	if (!sessionId) { return null; }
	const index = await loadCopilotCliOtelIndex();
	return index.get(sessionId) ?? null;
}

/** Whether the OTel export directory exists, how many export files it holds, and how many distinct sessions they cover. */
export interface CopilotCliOtelStatus {
	dirExists: boolean;
	fileCount: number;
	sessionsIndexed: number;
}

/** Reports whether the OTel export is set up on this machine, for diagnostics display. */
export async function getCopilotCliOtelStatus(): Promise<CopilotCliOtelStatus> {
	const dir = getCopilotCliOtelDir();
	let dirExists = false;
	let fileCount = 0;
	try {
		const entries = await fs.promises.readdir(dir);
		dirExists = true;
		fileCount = entries.filter(name => name.endsWith('.jsonl')).length;
	} catch { /* ~/.copilot/otel doesn't exist — OTel export not enabled */ }

	const index = await loadCopilotCliOtelIndex();
	return { dirExists, fileCount, sessionsIndexed: index.size };
}
