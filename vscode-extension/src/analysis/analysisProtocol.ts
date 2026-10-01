/**
 * Message contract between the extension host and the session-analysis worker thread.
 *
 * Kept free of imports from the heavy modules so both sides can depend on it cheaply.
 * Payloads are plain structured-cloneable data: file paths and stat numbers go in, a
 * `SessionFileCache` entry comes out. The worker never touches the cache, the VS Code API
 * or any webview — that separation is what makes it safe to run off the host's thread.
 */
import type { CopilotCliOtelSessionUsage } from '../../../src/copilotCliOtel';
import type { CustomizationFileEntry, SessionFileCache, SessionFileDetails } from '../../../src/types';
import type { SessionDetailsResult } from './sessionDetailsAnalyzer';
import type { QuickSessionAnalysis } from './sessionFileAnalyzer';

export type AnalysisRequest =
	| { id: number; op: 'analyze'; path: string; mtime: number; size: number; existingRepository?: string }
	| { id: number; op: 'supplement'; path: string; cached: SessionFileCache }
	/** `details` is the host-prepared skeleton (path-derived fields filled); the worker fills in the rest. */
	| { id: number; op: 'details'; path: string; mtimeMs: number; size: number; details: SessionFileDetails }
	/** Recursive customization-file discovery for one workspace; a slow synchronous directory walk. */
	| { id: number; op: 'customization'; workspace: string }
	/** Interaction count + token estimate for content the host already read (the Diagnostics folder scan). */
	| { id: number; op: 'quick'; path: string; content: string };

export type AnalysisResponse =
	| { type: 'result'; id: number; ok: true; result: SessionFileCache | SessionDetailsResult | CustomizationFileEntry[] | QuickSessionAnalysis | null }
	| { type: 'result'; id: number; ok: false; error: string; /** Node error code (e.g. ENOENT) so callers can keep branching on it. */ code?: string };

/**
 * Out-of-band messages the worker sends that are not answers to a request. `exactUsage` asks the host for a
 * Copilot CLI session's exact usage, so the host's single OTel index / session-store copy serves every worker.
 */
export type AnalysisWorkerEvent =
	| { type: 'ready' }
	| { type: 'warn'; message: string }
	| { type: 'exactUsage'; rpcId: number; sessionFile: string };

export type AnalysisWorkerMessage = AnalysisResponse | AnalysisWorkerEvent;

/** The host's answer to an `exactUsage` ask. */
export interface ExactUsageReply {
	type: 'exactUsageReply';
	rpcId: number;
	usage: CopilotCliOtelSessionUsage | null;
	/** Set when the host-side lookup threw; the worker rethrows it where it asked. */
	error?: string;
}

/** Everything the host can post to a worker. */
export type AnalysisHostMessage = AnalysisRequest | ExactUsageReply;

/** What the host passes via `workerData` so the worker can build its own adapter registry. */
export interface AnalysisWorkerData {
	/** Absolute path of the extension root, used as the adapters' `extensionUri.fsPath`. */
	extensionPath: string;
}
