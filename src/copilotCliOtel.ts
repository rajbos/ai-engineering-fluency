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

/** Merges one already-parsed OTel record into `index` when it's a `chat <model>` span; ignores anything else. */
function consolidateOtelRecord(record: OtelSpanRecord, index: Map<string, CopilotCliOtelSessionUsage>): void {
	if (record.type !== 'span' || !record.name?.startsWith('chat ')) { return; }
	const sessionId = record.attributes?.['gen_ai.conversation.id'];
	if (!sessionId) { return; }
	accumulateOtelChatSpanUsage(index, sessionId, readOtelChatSpanUsage(record.attributes));
}

/** Parses one line of an OTel export file, merging its usage into `index` if it's a `chat <model>` span. */
function parseOtelLine(line: string, index: Map<string, CopilotCliOtelSessionUsage>): void {
	if (!line.includes(OTEL_CHAT_LINE_HINT)) { return; }
	let record: OtelSpanRecord;
	try {
		record = JSON.parse(line);
	} catch {
		return;
	}
	consolidateOtelRecord(record, index);
}

/** Parses one OTel export file's `chat <model>` spans, merging per-session totals into `index`. */
function parseOtelFileInto(content: string, index: Map<string, CopilotCliOtelSessionUsage>): void {
	for (const line of content.split('\n')) {
		parseOtelLine(line, index);
	}
}

/**
 * Source for the OTel-parsing worker, run via `new Worker(src, { eval: true })`. Kept as a
 * self-contained string that touches only Node built-ins so it needs no separate entry point
 * or runtime path resolution — it bundles identically across every build layout (tsc → out/,
 * esbuild → extension dist/, esbuild → cli dist/). It does the expensive part off the caller's
 * main thread: streaming each export file line-by-line (never holding the whole 100+ MB file
 * in memory), cheaply pre-filtering, and JSON.parsing only the handful of `chat <model>`
 * candidate lines. It posts that small candidate array back for the main thread to consolidate.
 */
const OTEL_WORKER_SOURCE = `
const { parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const HINT = ${JSON.stringify(OTEL_CHAT_LINE_HINT)};
async function run() {
	const records = [];
	let entries;
	try { entries = await fs.promises.readdir(workerData.dir); }
	catch { parentPort.postMessage(records); return; }
	for (const name of entries) {
		if (!name.endsWith('.jsonl')) { continue; }
		try {
			const rl = readline.createInterface({ input: fs.createReadStream(path.join(workerData.dir, name), { encoding: 'utf8' }), crlfDelay: Infinity });
			for await (const line of rl) {
				if (!line.includes(HINT)) { continue; }
				try { records.push(JSON.parse(line)); } catch { /* malformed line — skip */ }
			}
		} catch { /* unreadable file — skip */ }
	}
	parentPort.postMessage(records);
}
run().catch(() => { try { parentPort.postMessage([]); } catch { /* worker tearing down */ } });
`;

/**
 * Runs the OTel read+filter+parse in a worker thread, resolving the parsed `chat <model>`
 * candidate records. Rejects if the worker can't be created or dies before posting, so the
 * caller can fall back to an in-process read.
 */
function loadOtelRecordsViaWorker(dir: string): Promise<OtelSpanRecord[]> {
	return new Promise<OtelSpanRecord[]>((resolve, reject) => {
		let worker: Worker;
		try {
			worker = new Worker(OTEL_WORKER_SOURCE, { eval: true, workerData: { dir } });
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
		worker.once('message', (records: OtelSpanRecord[]) => finish(() => resolve(Array.isArray(records) ? records : [])));
		worker.once('error', (err) => finish(() => reject(err)));
		worker.once('exit', (code) => finish(() => reject(new Error(`OTel worker exited before posting results (code ${code})`))));
	});
}

let cachedIndex: Map<string, CopilotCliOtelSessionUsage> | null = null;
let cachedAt = 0;
/** Re-scan the OTel directory at most this often; the export file grows across a live CLI session. */
const CACHE_TTL_MS = 30_000;
/**
 * In-flight load, cached (not just the resolved value) so concurrent callers on a cold
 * cache all await the same read+parse instead of each independently reading the OTel
 * export file — which is unbounded in size and can reach tens of MB, so N concurrent
 * callers means N redundant full reads/parses of it at once.
 */
let inFlightLoad: Promise<Map<string, CopilotCliOtelSessionUsage>> | null = null;

async function readCopilotCliOtelIndex(): Promise<Map<string, CopilotCliOtelSessionUsage>> {
	const index = new Map<string, CopilotCliOtelSessionUsage>();
	const dir = getCopilotCliOtelDir();
	try {
		// Do the heavy streaming read+parse off the main thread; consolidate the small result here.
		const records = await loadOtelRecordsViaWorker(dir);
		for (const record of records) { consolidateOtelRecord(record, index); }
		return index;
	} catch {
		// Worker unavailable or failed (e.g. constrained runtime) — fall back to an in-process read
		// so callers still get data, just without the off-thread benefit.
		return readCopilotCliOtelIndexInProcess(dir);
	}
}

/** In-process read+parse of the OTel export, used only when the worker thread can't be used. */
async function readCopilotCliOtelIndexInProcess(dir: string): Promise<Map<string, CopilotCliOtelSessionUsage>> {
	const index = new Map<string, CopilotCliOtelSessionUsage>();
	try {
		const entries = await fs.promises.readdir(dir);
		for (const name of entries) {
			if (!name.endsWith('.jsonl')) { continue; }
			try {
				const content = await fs.promises.readFile(path.join(dir, name), 'utf8');
				parseOtelFileInto(content, index);
			} catch { /* unreadable file — skip */ }
		}
	} catch { /* ~/.copilot/otel doesn't exist — OTel export not enabled, no data available */ }
	return index;
}

/** Loads (and caches) the OTel usage index by scanning every .jsonl file under ~/.copilot/otel/. */
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

/** Clears the cached OTel index. Exposed for tests. */
export function clearCopilotCliOtelCache(): void {
	cachedIndex = null;
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
