/**
 * Worker-thread entry point (bundled to `dist/analysisWorker.js`).
 *
 * Owns every CPU-heavy step of a refresh — reading, `JSON.parse`, token estimation, usage
 * analysis, rollups — so the extension host's event loop stays free to deliver webview
 * clicks. It builds its own adapter registry (the adapters are `vscode`-free and keep their
 * own caches), answers requests from `analysisProtocol.ts`, and holds no state the host
 * depends on: killing and respawning it is always safe.
 */
import { parentPort, workerData } from 'worker_threads';

import tokenEstimatorsData from '../../../src/tokenEstimators.json';
import modelPricingData from '../../../src/modelPricing.json';
import toolNamesData from '../../../src/toolNames.json';
import type { ModelPricing, TokenEstimator } from '../../../src/types';
import { buildAdapterRegistry, createDataAccessInstances } from '../../../src/adapters';
import { estimateTokensFromText } from '../../../src/tokenEstimation';
import { setCopilotCliExactUsageResolver, type CopilotCliOtelSessionUsage } from '../../../src/copilotCliOtel';
import { isMcpTool, extractMcpServerName } from '../../../src/workspaceHelpers';
import { analyzeSessionFile, supplementCacheWithDebugLog, type SessionAnalyzerDeps } from './sessionFileAnalyzer';
import { computeSessionFileDetails } from './sessionDetailsAnalyzer';
import { scanCustomizationFilesForWorkspace } from './workspaceCustomizationScan';
import type { AnalysisHostMessage, AnalysisRequest, AnalysisResponse, AnalysisWorkerData, AnalysisWorkerMessage, ExactUsageReply } from './analysisProtocol';

if (!parentPort) {
	throw new Error('analysisWorker must be started as a worker thread');
}
const port = parentPort;
const data = workerData as AnalysisWorkerData;

const post = (message: AnalysisWorkerMessage): void => port.postMessage(message);

// Exact-usage lookups for Copilot CLI sessions are answered by the host (see setCopilotCliExactUsageResolver).
const exactUsageWaiters = new Map<number, { resolve: (usage: CopilotCliOtelSessionUsage | null) => void; reject: (error: Error) => void }>();
let nextRpcId = 1;
setCopilotCliExactUsageResolver((sessionFile) => new Promise((resolve, reject) => {
	const rpcId = nextRpcId++;
	exactUsageWaiters.set(rpcId, { resolve, reject });
	post({ type: 'exactUsage', rpcId, sessionFile });
}));

function onExactUsageReply(reply: ExactUsageReply): void {
	const waiter = exactUsageWaiters.get(reply.rpcId);
	if (!waiter) { return; }
	exactUsageWaiters.delete(reply.rpcId);
	if (reply.error !== undefined) { waiter.reject(new Error(reply.error)); }
	else { waiter.resolve(reply.usage); }
}

const tokenEstimators = tokenEstimatorsData.estimators as Record<string, TokenEstimator>;
const modelPricing = modelPricingData.pricing as { [key: string]: ModelPricing };
const toolNameMap = toolNamesData as { [key: string]: string };

const extensionUri = { fsPath: data.extensionPath, path: data.extensionPath, scheme: 'file' };
const ecosystems = buildAdapterRegistry({
	...createDataAccessInstances(extensionUri),
	estimateTokens: (text, model) => estimateTokensFromText(text, model ?? 'gpt-4', tokenEstimators),
	isMcpTool: (tool) => isMcpTool(tool),
	extractMcpServerName: (tool) => extractMcpServerName(tool, toolNameMap),
});

const deps: SessionAnalyzerDeps = {
	warn: (message) => post({ type: 'warn', message }),
	ecosystems,
	tokenEstimators,
	modelPricing,
	toolNameMap,
	// No `windsurf`: its sessions are virtual (gRPC-backed) and the host keeps them in-process.
};

async function handle(request: AnalysisRequest): Promise<AnalysisResponse> {
	try {
		if (request.op === 'analyze') {
			const existing = request.existingRepository !== undefined ? { repository: request.existingRepository } : undefined;
			return { type: 'result', id: request.id, ok: true, result: await analyzeSessionFile(deps, request.path, request.mtime, request.size, existing) };
		}
		if (request.op === 'customization') {
			return { type: 'result', id: request.id, ok: true, result: scanCustomizationFilesForWorkspace(request.workspace) };
		}
		if (request.op === 'details') {
			const stat = { size: request.size, mtime: new Date(request.mtimeMs) };
			return { type: 'result', id: request.id, ok: true, result: await computeSessionFileDetails(deps, request.path, stat, request.details) };
		}
		return { type: 'result', id: request.id, ok: true, result: await supplementCacheWithDebugLog(request.cached, request.path) };
	} catch (error) {
		const code = (error as NodeJS.ErrnoException | undefined)?.code;
		return { type: 'result', id: request.id, ok: false, error: error instanceof Error ? (error.stack ?? error.message) : String(error), ...(typeof code === 'string' ? { code } : {}) };
	}
}

/** Posts a response; if it cannot be cloned (DataCloneError), reports that instead of dying and being retried forever. */
function respond(response: AnalysisResponse): void {
	try {
		post(response);
	} catch (error) {
		post({ type: 'result', id: response.id, ok: false, error: `Could not return the analysis result: ${error instanceof Error ? error.message : String(error)}` });
	}
}

/**
 * Requests are handled strictly one after another, in arrival order. The pool's hang watchdog attributes a
 * stall to the *oldest* request in a worker, which is only right if that is the one actually running; handlers
 * that interleaved at their awaits could let a younger request hang while an older, innocent one is blamed.
 * The pool keeps two requests queued here so the next one is already waiting when the current one finishes.
 */
let inOrder: Promise<void> = Promise.resolve();
port.on('message', (message: AnalysisHostMessage) => {
	// Replies to our own questions are handled immediately, outside the request order: the request being
	// worked on is waiting for exactly this.
	if ('type' in message && message.type === 'exactUsageReply') { onExactUsageReply(message); return; }
	const request = message as AnalysisRequest;
	inOrder = inOrder.then(() => handle(request)).then(respond);
});

post({ type: 'ready' });
