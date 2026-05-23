/**
 * Usage analysis functions for session data processing.
 * Analysis and aggregation functions extracted from CopilotTokenTracker.
 */
import * as fs from 'fs';
import type {
	SessionUsageAnalysis,
	ToolCallUsage,
	ModeUsage,
	ContextReferenceUsage,
	McpToolUsage,
	EditScopeUsage,
	ApplyButtonUsage,
	SessionDurationData,
	ConversationPatterns,
	AgentTypeUsage,
	ModelSwitchingAnalysis,
	ModelUsage,
	UsageAnalysisPeriod,
	ModelPricing,
	TokenEstimator,
	LanguageUsage,
} from './types';
import {
	applyDelta,
	isJsonlContent,
	isUuidPointerFile,
	getModelFromRequest,
	getModelTier,
	estimateTokensFromText,
	extractPerRequestUsageFromRawLines,
	createEmptyContextRefs,
	extractSubAgentData,
	buildReasoningEffortTimeline,
	extractResponseItemText,
} from './tokenEstimation';
import {
	getModeType,
	isMcpTool,
	normalizeMcpToolName,
	extractMcpServerName,
	normalizePathForComparison,
} from './workspaceHelpers';
import { isJetBrainsSessionPath } from './adapters/adapterPredicates';
import { detectJetBrainsModeFromContent, type JetBrainsMode } from './jetbrains';
import type { IEcosystemAdapter } from './ecosystemAdapter';
import { isAnalyzable } from './ecosystemAdapter';


// ---------------------------------------------------------------------------
// Internal types for parsed session log JSON structures
// ---------------------------------------------------------------------------

/** Reference object inside a contentReferences item */
interface ContentRefObject {
fsPath?: string;
path?: string;
name?: string;
}

/** A single item from a session contentReferences array */
interface ContentRefItemRaw {
kind?: string;
reference?: ContentRefObject;
inlineReference?: ContentRefObject;
}

/** Variable container from a session request variableData field */
interface VariableDataRaw {
variables?: Array<{
kind?: string;
name?: string;
value?: { fsPath?: string; path?: string; external?: string };
}>;
}

/** A request entry in a session file */
interface SessionRequestRaw {
requestId?: string;
timestamp?: number;
timeSpentWaiting?: number;
agent?: { id?: string };
message?: {
text?: string;
parts?: Array<{ text?: string }>;
};
contentReferences?: unknown[];
variableData?: unknown;
response?: unknown[];
result?: {
timings?: { firstProgress?: number; totalElapsed?: number };
usage?: { promptTokens?: number; completionTokens?: number };
promptTokens?: number;
outputTokens?: number;
details?: string;
metadata?: {
promptTokens?: number;
outputTokens?: number;
modelId?: string;
};
};
modelId?: string;
}

/** A parsed regular JSON session content */
export interface ParsedSessionJson {
requests?: unknown[];
mode?: { id?: string };
creationDate?: number;
lastMessageDate?: number;
inputState?: {
mode?: string;
selectedModel?: { metadata?: { id?: string }; identifier?: string };
selections?: Array<{
startLineNumber?: number;
endLineNumber?: number;
startColumn?: number;
endColumn?: number;
}>;
};
selectedModel?: { metadata?: { id?: string }; identifier?: string };
}

/**
 * Runtime type guard that validates the shape of an unknown value against ParsedSessionJson.
 * Checks structural invariants for fields that could cause runtime errors if mistyped.
 */
export function isParsedSessionJson(obj: unknown): obj is ParsedSessionJson {
	if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
		return false;
	}
	const o = obj as Record<string, unknown>;
	if (o.requests != null && !Array.isArray(o.requests)) {
		return false;
	}
	if (o.mode != null) {
		if (typeof o.mode !== 'object' || Array.isArray(o.mode)) {
			return false;
		}
		const mode = o.mode as Record<string, unknown>;
		if (mode.id != null && typeof mode.id !== 'string') {
			return false;
		}
	}
	if (o.creationDate != null && typeof o.creationDate !== 'number') {
		return false;
	}
	if (o.lastMessageDate != null && typeof o.lastMessageDate !== 'number') {
		return false;
	}
	return true;
}

/** A JSONL event (delta-based or CLI format) */
interface JsonlEventRaw {
kind?: number;
k?: string[];
v?: unknown;
type?: string;
data?: {
selectedModel?: string;
newModel?: string;
reasoningEffort?: string;
content?: string;
outputTokens?: number;
result?: {
content?: unknown;
detailedContent?: unknown;
};
modelMetrics?: Record<string, {
usage?: {
inputTokens?: number;
outputTokens?: number;
cacheReadTokens?: number;
cacheWriteTokens?: number;
};
}>;
mcpServer?: string;
toolName?: string;
};
model?: string;
toolName?: string;
}

/** Reconstructed delta session state (from applyDelta over JSONL lines) */
interface DeltaSessionState {
	requests?: unknown[];
	creationDate?: number;
	lastMessageDate?: number;
	inputState?: {
		mode?: string;
		selectedModel?: { identifier?: string; metadata?: { id?: string } };
		selections?: Array<{
			startLineNumber?: number;
			endLineNumber?: number;
			startColumn?: number;
			endColumn?: number;
		}>;
	};
	selectedModel?: { identifier?: string; metadata?: { id?: string } };
	[key: string]: unknown;
}

/** A response item in a session request */
interface ResponseItemRaw {
	kind?: string;
	uri?: { path?: string };
	isEdit?: boolean;
	toolId?: string;
	toolName?: string;
	invocationMessage?: { toolName?: string };
	toolSpecificData?: { kind?: string };
	value?: string;
	didStartServerIds?: string[];
	inlineReference?: ContentRefObject;
}

export interface UsageAnalysisDeps {
	warn: (msg: string) => void;
	ecosystems: IEcosystemAdapter[];
	tokenEstimators: Record<string, TokenEstimator>;
	modelPricing: { [key: string]: ModelPricing };
	toolNameMap: { [key: string]: string };
}


/**
 * Increment the appropriate mode counter based on modeType string.
 */
function incrementModeUsage(modeType: string, modeUsage: ModeUsage): void {
	if (modeType === 'agent') {
		modeUsage.agent++;
	} else if (modeType === 'edit') {
		modeUsage.edit++;
	} else if (modeType === 'plan') {
		modeUsage.plan++;
	} else if (modeType === 'customAgent') {
		modeUsage.customAgent++;
	} else {
		modeUsage.ask++;
	}
}

/**
 * Record a tool invocation, routing to MCP counters or regular tool-call counters.
 */
function recordToolOrMcpInvocation(
	toolName: string,
	analysis: SessionUsageAnalysis,
	toolNameMap: { [key: string]: string }
): void {
	if (isMcpTool(toolName)) {
		// Count as MCP tool
		analysis.mcpTools.total++;
		const serverName = extractMcpServerName(toolName, toolNameMap);
		analysis.mcpTools.byServer[serverName] = (analysis.mcpTools.byServer[serverName] || 0) + 1;
		const normalizedTool = normalizeMcpToolName(toolName);
		analysis.mcpTools.byTool[normalizedTool] = (analysis.mcpTools.byTool[normalizedTool] || 0) + 1;
	} else {
		// Count as regular tool call
		analysis.toolCalls.total++;
		analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
	}
}

/** Timing metrics extracted from a single request */
interface TimingMetrics {
	timestamp: number | undefined;
	timings: { firstProgress?: number; totalElapsed?: number } | undefined;
	waitTime: number | undefined;
}

/** Agent type classification extracted from a single request */
interface AgentMetrics {
	agentType: 'editsAgent' | 'defaultAgent' | 'workspaceAgent' | 'other' | null;
}

/** Edit and codeblock metrics extracted from a single request */
interface EditMetrics {
	editedFilePaths: string[];
	codeBlocks: number;
	applies: number;
	linesAdded: number;
	linesRemoved: number;
	languageUsage: LanguageUsage;
}

function normalizeExtension(filePath: string): string {
	const name = filePath.split('/').pop()?.split('\\').pop() ?? '';
	const dotIdx = name.lastIndexOf('.');
	if (dotIdx <= 0) {
		return name.toLowerCase() || 'unknown';
	}
	return name.slice(dotIdx + 1).toLowerCase();
}

/**
 * Extract timing-related metrics (timestamp, timings, wait time) from a request.
 */
function extractTimingMetrics(req: SessionRequestRaw): TimingMetrics {
	return {
		timestamp: req.timestamp,
		timings: req.result?.timings,
		waitTime: req.timeSpentWaiting,
	};
}

/**
 * Extract agent type classification from a request.
 * Returns null agentType when no agent id is present.
 */
function extractAgentMetrics(req: SessionRequestRaw): AgentMetrics {
	if (!req.agent?.id) {
		return { agentType: null };
	}
	const agentId = req.agent.id;
	if (agentId.includes('edit')) {
		return { agentType: 'editsAgent' };
	} else if (agentId.includes('default')) {
		return { agentType: 'defaultAgent' };
	} else if (agentId.includes('workspace')) {
		return { agentType: 'workspaceAgent' };
	}
	return { agentType: 'other' };
}

/**
 * Extract edited file paths and codeblock/apply counts from a request's response items.
 */
type SingleEditObj = { text?: unknown; range?: { startLineNumber?: number; endLineNumber?: number } };

/** Count lines added/removed from a single edit object, accumulating into languageUsage. */
function _eemCountSingleEdit(editObj: SingleEditObj, ext: string, languageUsage: LanguageUsage): { linesAdded: number; linesRemoved: number } {
	let linesAdded = 0;
	let linesRemoved = 0;
	if (typeof editObj.text === 'string' && editObj.text) {
		const added = (editObj.text.match(/\n/g) ?? []).length + (editObj.text.endsWith('\n') ? 0 : 1);
		linesAdded += added;
		if (!languageUsage[ext]) { languageUsage[ext] = { linesAdded: 0, linesRemoved: 0 }; }
		languageUsage[ext].linesAdded += added;
	}
	if (editObj.range && typeof editObj.range.startLineNumber === 'number' && typeof editObj.range.endLineNumber === 'number') {
		const removed = Math.max(0, editObj.range.endLineNumber - editObj.range.startLineNumber);
		linesRemoved += removed;
		if (!languageUsage[ext]) { languageUsage[ext] = { linesAdded: 0, linesRemoved: 0 }; }
		languageUsage[ext].linesRemoved += removed;
	}
	return { linesAdded, linesRemoved };
}

/** Process all edit groups for a textEditGroup response item, returning line delta totals. */
function _eemProcessEdits(respRaw: unknown, ext: string, languageUsage: LanguageUsage): { linesAdded: number; linesRemoved: number } {
	const respRawAny = respRaw as { edits?: unknown };
	let linesAdded = 0;
	let linesRemoved = 0;
	if (!Array.isArray(respRawAny.edits)) { return { linesAdded, linesRemoved }; }
	for (const editGroup of respRawAny.edits as unknown[]) {
		if (!Array.isArray(editGroup)) { continue; }
		for (const edit of editGroup as unknown[]) {
			if (!edit || typeof edit !== 'object') { continue; }
			const delta = _eemCountSingleEdit(edit as SingleEditObj, ext, languageUsage);
			linesAdded += delta.linesAdded;
			linesRemoved += delta.linesRemoved;
		}
	}
	return { linesAdded, linesRemoved };
}

function extractEditMetrics(req: SessionRequestRaw): EditMetrics {
	const editedFilePaths: string[] = [];
	let codeBlocks = 0;
	let applies = 0;
	let linesAdded = 0;
	let linesRemoved = 0;
	const languageUsage: LanguageUsage = {};

	if (!req.response || !Array.isArray(req.response)) {
		return { editedFilePaths, codeBlocks, applies, linesAdded, linesRemoved, languageUsage };
	}
	for (const respRaw of req.response as ResponseItemRaw[]) {
		if (!respRaw) { continue; }
		if (respRaw.kind === 'textEditGroup' && respRaw.uri) {
			const filePath = respRaw.uri.path || JSON.stringify(respRaw.uri);
			editedFilePaths.push(filePath);
			const ext = normalizeExtension(filePath);
			const delta = _eemProcessEdits(respRaw, ext, languageUsage);
			linesAdded += delta.linesAdded;
			linesRemoved += delta.linesRemoved;
		}
		if (respRaw.kind === 'codeblockUri') {
			codeBlocks++;
			if (respRaw.isEdit === true) { applies++; }
		}
	}
	return { editedFilePaths, codeBlocks, applies, linesAdded, linesRemoved, languageUsage };
}

/**
 * Process a list of session requests, accumulating enhanced metrics in-place.
 * Mutates editedFiles, timestamps, timingsData, waitTimes and agentCounts.
 * Returns the total applies and total code blocks counted.
 */
function processRequestsForEnhancedMetrics(
	requests: SessionRequestRaw[],
	agentCounts: AgentTypeUsage,
	editedFiles: Set<string>,
	timestamps: number[],
	timingsData: { firstProgress?: number; totalElapsed?: number }[],
	waitTimes: number[]
): { totalApplies: number; totalCodeBlocks: number; totalLinesAdded: number; totalLinesRemoved: number; languageUsage: LanguageUsage } {
	let totalApplies = 0;
	let totalCodeBlocks = 0;
	let totalLinesAdded = 0;
	let totalLinesRemoved = 0;
	const languageUsage: LanguageUsage = {};
	for (const requestRaw of requests) {
		if (!requestRaw) { continue; }

		const timing = extractTimingMetrics(requestRaw);
		if (timing.timestamp !== undefined) { timestamps.push(timing.timestamp); }
		if (timing.timings) { timingsData.push(timing.timings); }
		if (timing.waitTime !== undefined) { waitTimes.push(timing.waitTime); }

		const agent = extractAgentMetrics(requestRaw);
		if (agent.agentType !== null) {
			agentCounts[agent.agentType]++;
		}

		const edits = extractEditMetrics(requestRaw);
		for (const filePath of edits.editedFilePaths) { editedFiles.add(filePath); }
		totalCodeBlocks += edits.codeBlocks;
		totalApplies += edits.applies;
		totalLinesAdded += edits.linesAdded;
		totalLinesRemoved += edits.linesRemoved;
		for (const [ext, usage] of Object.entries(edits.languageUsage)) {
			if (!languageUsage[ext]) { languageUsage[ext] = { linesAdded: 0, linesRemoved: 0 }; }
			languageUsage[ext].linesAdded += usage.linesAdded;
			languageUsage[ext].linesRemoved += usage.linesRemoved;
		}
	}
	return { totalApplies, totalCodeBlocks, totalLinesAdded, totalLinesRemoved, languageUsage };
}

/** Detect implicit selection from reconstructed delta state and increment counter if found. */
function _pdsaDetectImplicitSelection(sessionState: DeltaSessionState, analysis: SessionUsageAnalysis): void {
	if (!sessionState.inputState?.selections || !Array.isArray(sessionState.inputState.selections)) { return; }
	for (const sel of sessionState.inputState.selections) {
		if (sel && (sel.startLineNumber !== sel.endLineNumber || sel.startColumn !== sel.endColumn)) {
			analysis.contextReferences.implicitSelection++;
			break;
		}
	}
}

/** Process tool/MCP invocations from a single request's response array. */
function _pdsaProcessRequestResponse(
	deps: Pick<UsageAnalysisDeps, 'toolNameMap'>,
	response: ResponseItemRaw[],
	analysis: SessionUsageAnalysis
): void {
	for (const responseItemRaw of response) {
		if (!responseItemRaw) { continue; }
		if (responseItemRaw.kind === 'toolInvocationSerialized' || responseItemRaw.kind === 'prepareToolInvocation') {
			const toolName = responseItemRaw.toolId || responseItemRaw.toolName || responseItemRaw.invocationMessage?.toolName || responseItemRaw.toolSpecificData?.kind || 'unknown';
			recordToolOrMcpInvocation(toolName, analysis, deps.toolNameMap);
		}
	}
}

/** Process the reconstructed requests array for mode, tool, and context metrics. */
function _pdsaProcessRequests(
	deps: Pick<UsageAnalysisDeps, 'toolNameMap'>,
	sessionModeType: string,
	requests: SessionRequestRaw[],
	analysis: SessionUsageAnalysis
): void {
	for (const request of requests) {
		if (!request || !request.requestId) { continue; }
		incrementModeUsage(sessionModeType, analysis.modeUsage);
		if (request.agent?.id) {
			const toolName = request.agent.id;
			analysis.toolCalls.total++;
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}
		analyzeRequestContext(request, analysis.contextReferences);
		if (request.response && Array.isArray(request.response)) {
			_pdsaProcessRequestResponse(deps, request.response as ResponseItemRaw[], analysis);
		}
	}
}

/** Derive the session-level default model from reconstructed delta state. */
function _pdsaGetSessionDefaultModel(sessionState: DeltaSessionState): string {
	return (
		sessionState.selectedModel?.identifier ||
		sessionState.selectedModel?.metadata?.id ||
		sessionState.inputState?.selectedModel?.metadata?.id ||
		'gpt-4o'
	).replace(/^copilot\//, '');
}

/** Compute model switching statistics from reconstructed request list and populate analysis. */
function _pdsaComputeModelSwitching(
	deps: Pick<UsageAnalysisDeps, 'modelPricing'>,
	requests: SessionRequestRaw[],
	sessionState: DeltaSessionState,
	analysis: SessionUsageAnalysis
): void {
	const sessionDefaultModel = _pdsaGetSessionDefaultModel(sessionState);
	const models: string[] = [];
	for (const req of requests) {
		if (!req || !req.requestId) { continue; }
		let reqModel = sessionDefaultModel;
		if (req.modelId) {
			reqModel = req.modelId.replace(/^copilot\//, '');
		} else if (req.result?.metadata?.modelId) {
			reqModel = req.result.metadata.modelId.replace(/^copilot\//, '');
		} else if (req.result?.details) {
			reqModel = getModelFromRequest(req, deps.modelPricing);
		}
		models.push(reqModel);
	}
	const uniqueModels = [...new Set(models)];
	analysis.modelSwitching.uniqueModels = uniqueModels;
	analysis.modelSwitching.modelCount = uniqueModels.length;
	analysis.modelSwitching.totalRequests = models.length;
	let switchCount = 0;
	for (let mi = 1; mi < models.length; mi++) {
		if (models[mi] !== models[mi - 1]) { switchCount++; }
	}
	analysis.modelSwitching.switchCount = switchCount;
	applyModelTierClassification(deps.modelPricing, uniqueModels, models, analysis);
}

/** Extract thinking effort from delta lines and populate analysis. */
function _pdsaExtractThinkingEffort(lines: string[], requests: SessionRequestRaw[], analysis: SessionUsageAnalysis): void {
	const { effortByRequestId, defaultEffort, switchCount: effortSwitchCount } = buildReasoningEffortTimeline(lines);
	if (defaultEffort === null && effortByRequestId.size === 0) { return; }
	const byEffort: { [effort: string]: number } = {};
	for (const [, effort] of effortByRequestId) {
		byEffort[effort] = (byEffort[effort] || 0) + 1;
	}
	if (effortByRequestId.size === 0 && defaultEffort !== null) {
		byEffort[defaultEffort] = requests.length;
	}
	analysis.thinkingEffort = { byEffort, switchCount: effortSwitchCount, defaultEffort };
}

/**
 * Process a fully-reconstructed delta session state to populate usage analysis.
 * Handles mode detection, context references, tool invocations, model switching,
 * thinking effort extraction, and conversation pattern derivation.
 */
function processDeltaSessionAnalysis(
	deps: Pick<UsageAnalysisDeps, 'toolNameMap' | 'modelPricing'>,
	sessionState: DeltaSessionState,
	lines: string[],
	analysis: SessionUsageAnalysis
): void {
	const sessionModeType = sessionState.inputState?.mode
		? getModeType(sessionState.inputState.mode)
		: 'ask';
	const requests = (sessionState.requests ?? []) as SessionRequestRaw[];

	_pdsaDetectImplicitSelection(sessionState, analysis);
	_pdsaProcessRequests(deps, sessionModeType, requests, analysis);
	_pdsaComputeModelSwitching(deps, requests, sessionState, analysis);
	_pdsaExtractThinkingEffort(lines, requests, analysis);
	deriveConversationPatterns(analysis);
}

/** Determine the request mode string for a single JSON session request. */
function _pjsrGetRequestMode(request: SessionRequestRaw, sessionContent: ParsedSessionJson): string {
	if (request.agent?.id) {
		const agentId = request.agent.id.toLowerCase();
		if (agentId.includes('edit')) { return 'edit'; }
		if (agentId.includes('agent')) { return 'agent'; }
	} else if (sessionContent.mode?.id) {
		const modeId = sessionContent.mode.id.toLowerCase();
		if (modeId.includes('agent')) { return 'agent'; }
		if (modeId.includes('edit')) { return 'edit'; }
	}
	return 'ask';
}

/** Process a single response item for tool/MCP invocations in a JSON session. */
function _pjsrProcessResponseItem(
	responseItem: ResponseItemRaw,
	analysis: SessionUsageAnalysis,
	toolNameMap: { [key: string]: string }
): void {
	if (responseItem.kind === 'toolInvocationSerialized' || responseItem.kind === 'prepareToolInvocation') {
		const toolName = responseItem.toolId || responseItem.toolName || responseItem.invocationMessage?.toolName || 'unknown';
		recordToolOrMcpInvocation(toolName, analysis, toolNameMap);
	}
	if (responseItem.kind === 'mcpServersStarting' && responseItem.didStartServerIds) {
		for (const serverId of responseItem.didStartServerIds) {
			analysis.mcpTools.total++;
			analysis.mcpTools.byServer[serverId] = (analysis.mcpTools.byServer[serverId] || 0) + 1;
		}
	}
	if (responseItem.kind === 'inlineReference' && responseItem.inlineReference) {
		analyzeContentReferences([responseItem], analysis.contextReferences);
	}
}

/**
 * Process requests in a regular JSON session file.
 * Populates mode usage, context references, and tool/MCP invocations.
 */
function processJsonSessionRequests(
	deps: Pick<UsageAnalysisDeps, 'toolNameMap'>,
	sessionContent: ParsedSessionJson,
	analysis: SessionUsageAnalysis
): void {
	if (!sessionContent.requests || !Array.isArray(sessionContent.requests)) { return; }
	for (const requestRaw of sessionContent.requests) {
		const request = requestRaw as SessionRequestRaw;
		const requestMode = _pjsrGetRequestMode(request, sessionContent);
		if (requestMode === 'agent') { analysis.modeUsage.agent++; }
		else if (requestMode === 'edit') { analysis.modeUsage.edit++; }
		else { analysis.modeUsage.ask++; }
		analyzeRequestContext(request, analysis.contextReferences);
		if (request.response && Array.isArray(request.response)) {
			for (const responseItemRaw of request.response as ResponseItemRaw[]) {
				if (!responseItemRaw) { continue; }
				_pjsrProcessResponseItem(responseItemRaw, analysis, deps.toolNameMap);
			}
		}
	}
}

/** Merge context reference field counts from analysis into period. */
function _muaMergeContextRefFields(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	const p = period.contextReferences;
	const a = analysis.contextReferences;
	p.file += a.file;
	p.selection += a.selection;
	p.implicitSelection += a.implicitSelection || 0;
	p.symbol += a.symbol;
	p.codebase += a.codebase;
	p.workspace += a.workspace;
	p.terminal += a.terminal;
	p.vscode += a.vscode;
	p.terminalLastCommand += a.terminalLastCommand || 0;
	p.terminalSelection += a.terminalSelection || 0;
	p.clipboard += a.clipboard || 0;
	p.changes += a.changes || 0;
	p.outputPanel += a.outputPanel || 0;
	p.problemsPanel += a.problemsPanel || 0;
	p.pullRequest += a.pullRequest || 0;
	p.copilotInstructions += a.copilotInstructions || 0;
	p.agentsMd += a.agentsMd || 0;
}

/** Merge byKind and byPath maps from analysis context references into period. */
function _muaMergeContextRefMaps(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	for (const [kind, count] of Object.entries(analysis.contextReferences.byKind || {})) {
		period.contextReferences.byKind[kind] = (period.contextReferences.byKind[kind] || 0) + count;
	}
	for (const [path, count] of Object.entries(analysis.contextReferences.byPath || {})) {
		period.contextReferences.byPath[path] = (period.contextReferences.byPath[path] || 0) + count;
	}
}

type SessionModelSwitching = SessionUsageAnalysis['modelSwitching'];

/** Add unique model names from a tier list into the period's tracked list if not already present. */
function _muaMergeTierModels(period: UsageAnalysisPeriod, ms: SessionModelSwitching): void {
	for (const model of ms.tiers.standard) {
		if (!period.modelSwitching.standardModels.includes(model)) { period.modelSwitching.standardModels.push(model); }
	}
	for (const model of ms.tiers.premium) {
		if (!period.modelSwitching.premiumModels.includes(model)) { period.modelSwitching.premiumModels.push(model); }
	}
	for (const model of ms.tiers.unknown) {
		if (!period.modelSwitching.unknownModels.includes(model)) { period.modelSwitching.unknownModels.push(model); }
	}
}

/** Recalculate aggregate model-switching statistics from the accumulated modelsPerSession array. */
function _muaUpdateModelSwitchingStats(period: UsageAnalysisPeriod): void {
	const counts = period.modelSwitching.modelsPerSession;
	if (counts.length === 0) { return; }
	period.modelSwitching.averageModelsPerSession = counts.reduce((a, b) => a + b, 0) / counts.length;
	period.modelSwitching.maxModelsPerSession = Math.max(...counts);
	period.modelSwitching.minModelsPerSession = Math.min(...counts);
	period.modelSwitching.switchingFrequency = (counts.filter(c => c > 1).length / counts.length) * 100;
}

/** Merge model switching statistics from analysis into period. */
function _muaMergeModelSwitching(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	if (!analysis.modelSwitching) {
		(analysis as { modelSwitching?: SessionModelSwitching }).modelSwitching = {
			uniqueModels: [], modelCount: 0, switchCount: 0,
			tiers: { standard: [], premium: [], unknown: [] },
			hasMixedTiers: false, standardRequests: 0, premiumRequests: 0,
			unknownRequests: 0, totalRequests: 0
		};
	}
	if (analysis.modelSwitching.modelCount <= 0) { return; }
	const ms: SessionModelSwitching = analysis.modelSwitching;
	period.modelSwitching.totalSessions++;
	period.modelSwitching.modelsPerSession.push(ms.modelCount);
	_muaMergeTierModels(period, ms);
	if (ms.hasMixedTiers) { period.modelSwitching.mixedTierSessions++; }
	period.modelSwitching.standardRequests += ms.standardRequests || 0;
	period.modelSwitching.premiumRequests += ms.premiumRequests || 0;
	period.modelSwitching.unknownRequests += ms.unknownRequests || 0;
	period.modelSwitching.totalRequests += ms.totalRequests || 0;
	_muaUpdateModelSwitchingStats(period);
}

/** Merge edit scope metrics from analysis into period. */
function _muaMergeEditScope(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	if (!analysis.editScope) { return; }
	period.editScope.singleFileEdits += analysis.editScope.singleFileEdits;
	period.editScope.multiFileEdits += analysis.editScope.multiFileEdits;
	period.editScope.totalEditedFiles += analysis.editScope.totalEditedFiles;
	const editSessions = period.editScope.singleFileEdits + period.editScope.multiFileEdits;
	period.editScope.avgFilesPerSession = editSessions > 0 ? period.editScope.totalEditedFiles / editSessions : 0;
}

/** Merge apply usage (code block application) metrics from analysis into period. */
function _muaMergeApplyUsage(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	if (!analysis.applyUsage) { return; }
	period.applyUsage.totalApplies += analysis.applyUsage.totalApplies;
	period.applyUsage.totalCodeBlocks += analysis.applyUsage.totalCodeBlocks;
	period.applyUsage.applyRate = period.applyUsage.totalCodeBlocks > 0
		? (period.applyUsage.totalApplies / period.applyUsage.totalCodeBlocks) * 100
		: 0;
}

/** Merge session duration metrics from analysis into period using weighted averaging. */
function _muaMergeSessionDuration(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	if (!analysis.sessionDuration) { return; }
	period.sessionDuration.totalDurationMs += analysis.sessionDuration.totalDurationMs;
	const sessionCount = period.sessions;
	if (sessionCount <= 0) { return; }
	period.sessionDuration.avgDurationMs = period.sessionDuration.totalDurationMs / sessionCount;
	const prevFirst = period.sessionDuration.avgFirstProgressMs * (sessionCount - 1);
	period.sessionDuration.avgFirstProgressMs = (prevFirst + analysis.sessionDuration.avgFirstProgressMs) / sessionCount;
	const prevElapsed = period.sessionDuration.avgTotalElapsedMs * (sessionCount - 1);
	period.sessionDuration.avgTotalElapsedMs = (prevElapsed + analysis.sessionDuration.avgTotalElapsedMs) / sessionCount;
	const prevWait = period.sessionDuration.avgWaitTimeMs * (sessionCount - 1);
	period.sessionDuration.avgWaitTimeMs = (prevWait + analysis.sessionDuration.avgWaitTimeMs) / sessionCount;
}

/** Merge conversation pattern metrics from analysis into period. */
function _muaMergeConversationPatterns(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	if (!analysis.conversationPatterns) { return; }
	period.conversationPatterns.multiTurnSessions += analysis.conversationPatterns.multiTurnSessions;
	period.conversationPatterns.singleTurnSessions += analysis.conversationPatterns.singleTurnSessions;
	period.conversationPatterns.maxTurnsInSession = Math.max(
		period.conversationPatterns.maxTurnsInSession,
		analysis.conversationPatterns.maxTurnsInSession
	);
	const totalSessions = period.conversationPatterns.multiTurnSessions + period.conversationPatterns.singleTurnSessions;
	if (totalSessions <= 0) { return; }
	const prevTotalTurns = period.conversationPatterns.avgTurnsPerSession * (totalSessions - 1);
	period.conversationPatterns.avgTurnsPerSession = (prevTotalTurns + analysis.conversationPatterns.avgTurnsPerSession) / totalSessions;
}

/** Merge thinking effort data from analysis into period. */
function _muaMergeThinkingEffort(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	if (!analysis.thinkingEffort) { return; }
	if (!period.thinkingEffortUsage) {
		period.thinkingEffortUsage = { byEffort: {}, sessionCount: 0, switchCount: 0 };
	}
	period.thinkingEffortUsage.sessionCount++;
	period.thinkingEffortUsage.switchCount += analysis.thinkingEffort.switchCount;
	for (const [effort, count] of Object.entries(analysis.thinkingEffort.byEffort)) {
		period.thinkingEffortUsage.byEffort[effort] = (period.thinkingEffortUsage.byEffort[effort] || 0) + count;
	}
}

/**
 * Merge usage analysis data into period stats
 */
export function mergeUsageAnalysis(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	period.toolCalls.total += analysis.toolCalls.total;
	for (const [tool, count] of Object.entries(analysis.toolCalls.byTool)) {
		period.toolCalls.byTool[tool] = (period.toolCalls.byTool[tool] || 0) + count;
	}
	period.modeUsage.ask += analysis.modeUsage.ask;
	period.modeUsage.edit += analysis.modeUsage.edit;
	period.modeUsage.agent += analysis.modeUsage.agent;
	period.modeUsage.plan += analysis.modeUsage.plan;
	period.modeUsage.customAgent += analysis.modeUsage.customAgent;
	period.modeUsage.cli += analysis.modeUsage.cli;
	_muaMergeContextRefFields(period, analysis);
	_muaMergeContextRefMaps(period, analysis);
	period.mcpTools.total += analysis.mcpTools.total;
	for (const [server, count] of Object.entries(analysis.mcpTools.byServer)) {
		period.mcpTools.byServer[server] = (period.mcpTools.byServer[server] || 0) + count;
	}
	for (const [tool, count] of Object.entries(analysis.mcpTools.byTool)) {
		period.mcpTools.byTool[tool] = (period.mcpTools.byTool[tool] || 0) + count;
	}
	_muaMergeModelSwitching(period, analysis);
	_muaMergeEditScope(period, analysis);
	_muaMergeApplyUsage(period, analysis);
	_muaMergeSessionDuration(period, analysis);
	_muaMergeConversationPatterns(period, analysis);
	if (analysis.agentTypes) {
		period.agentTypes.editsAgent += analysis.agentTypes.editsAgent;
		period.agentTypes.defaultAgent += analysis.agentTypes.defaultAgent;
		period.agentTypes.workspaceAgent += analysis.agentTypes.workspaceAgent;
		period.agentTypes.other += analysis.agentTypes.other;
	}
	_muaMergeThinkingEffort(period, analysis);
}

/**
 * Analyze text for context references like #file, #selection, @workspace
 */
export function analyzeContextReferences(text: string, refs: ContextReferenceUsage): void {
	// Count #file references
	const fileMatches = text.match(/#file/gi);
	if (fileMatches) {
		refs.file += fileMatches.length;
	}

	// Count #selection references
	const selectionMatches = text.match(/#selection/gi);
	if (selectionMatches) {
		refs.selection += selectionMatches.length;
	}

	// Count #symbol and #sym references (both aliases)
	// Note: #sym:symbolName format is handled via variableData, not text matching
	const symbolMatches = text.match(/#symbol/gi);
	const symMatches = text.match(/#sym(?![:\w])/gi);  // Negative lookahead: don't match #symbol or #sym:
	if (symbolMatches) {
		refs.symbol += symbolMatches.length;
	}
	if (symMatches) {
		refs.symbol += symMatches.length;
	}

	// Count #codebase references
	const codebaseMatches = text.match(/#codebase/gi);
	if (codebaseMatches) {
		refs.codebase += codebaseMatches.length;
	}

	// Count #terminalLastCommand references
	const terminalLastCommandMatches = text.match(/#terminalLastCommand/gi);
	if (terminalLastCommandMatches) {
		refs.terminalLastCommand += terminalLastCommandMatches.length;
	}

	// Count #terminalSelection references
	const terminalSelectionMatches = text.match(/#terminalSelection/gi);
	if (terminalSelectionMatches) {
		refs.terminalSelection += terminalSelectionMatches.length;
	}

	// Count #clipboard references
	const clipboardMatches = text.match(/#clipboard/gi);
	if (clipboardMatches) {
		refs.clipboard += clipboardMatches.length;
	}

	// Count #changes references
	const changesMatches = text.match(/#changes/gi);
	if (changesMatches) {
		refs.changes += changesMatches.length;
	}

	// Count #outputPanel references
	const outputPanelMatches = text.match(/#outputPanel/gi);
	if (outputPanelMatches) {
		refs.outputPanel += outputPanelMatches.length;
	}

	// Count #problemsPanel references
	const problemsPanelMatches = text.match(/#problemsPanel\b/gi);
	if (problemsPanelMatches) {
		refs.problemsPanel += problemsPanelMatches.length;
	}

	// Count #pr and #pullRequest references (Copilot PR chat, April 2026)
	// Use word boundaries to avoid matching #problemsPanel or #pullRequestReview etc.
	const prMatches = text.match(/#pr\b/gi);
	if (prMatches) {
		refs.pullRequest += prMatches.length;
	}
	const pullRequestMatches = text.match(/#pullRequest\b/gi);
	if (pullRequestMatches) {
		refs.pullRequest += pullRequestMatches.length;
	}

	// Count @workspace references
	const workspaceMatches = text.match(/@workspace/gi);
	if (workspaceMatches) {
		refs.workspace += workspaceMatches.length;
	}

	// Count @terminal references
	const terminalMatches = text.match(/@terminal/gi);
	if (terminalMatches) {
		refs.terminal += terminalMatches.length;
	}

	// Count @vscode references
	const vscodeMatches = text.match(/@vscode/gi);
	if (vscodeMatches) {
		refs.vscode += vscodeMatches.length;
	}
}

/**
 * Analyze contentReferences from session log data to track specific file attachments.
 * Looks for kind: "reference" entries and tracks by kind, path patterns.
 * Also increments specific category counters like refs.file when appropriate.
 */
export function analyzeContentReferences(contentReferences: unknown[], refs: ContextReferenceUsage): void {
	if (!Array.isArray(contentReferences)) {
		return;
	}

	for (const item of contentReferences) {
		if (!item || typeof item !== 'object') {
			continue;
		}
		const contentRef = item as ContentRefItemRaw;

		// Track by kind
		const kind = contentRef.kind;
		if (typeof kind === 'string') {
			refs.byKind[kind] = (refs.byKind[kind] || 0) + 1;
		}

		// Extract reference object based on kind
		let reference = null;

		// Handle different reference structures
		if (kind === 'reference' && contentRef.reference) {
			reference = contentRef.reference;
		} else if (kind === 'inlineReference' && contentRef.inlineReference) {
			reference = contentRef.inlineReference;
		}

		// Pull request context references (Copilot PR chat, April 2026)
		// These appear as contentRef.kind === 'pullRequest' with PR metadata inside
		if (kind === 'pullRequest') {
			refs.pullRequest++;
			continue;
		}

		// Process the reference if found
		if (reference) {
			// Try to extract file path from various possible fields
			const fsPath = reference.fsPath || reference.path;
			if (typeof fsPath === 'string') {
				// Normalize path separators for pattern matching
				const normalizedPath = normalizePathForComparison(fsPath);

				// Track specific patterns - these are auto-attached, not user-explicit #file refs
				if (normalizedPath.endsWith('/.github/copilot-instructions.md') ||
					normalizedPath.includes('.github/copilot-instructions.md')) {
					refs.copilotInstructions++;
				} else if (normalizedPath.endsWith('/agents.md') ||
					normalizedPath.match(/\/agents\.md$/i)) {
					refs.agentsMd++;
				} else if (normalizedPath.endsWith('.instructions.md') ||
					normalizedPath.includes('.instructions.md')) {
					// Other instruction files (e.g., github-actions.instructions.md) are auto-attached
					// Track as copilotInstructions since they're part of the instructions system
					refs.copilotInstructions++;
				} else {
					// For other files, increment the general file counter
					// This makes actual file attachments show up in context ref counts
					refs.file++;
				}

				// Track by full path (limit to last 100 chars for display)
				const pathKey = fsPath.length > 100 ? '...' + fsPath.substring(fsPath.length - 97) : fsPath;
				refs.byPath[pathKey] = (refs.byPath[pathKey] || 0) + 1;
			}

			// Handle symbol references (e.g., #sym:functionName)
			// Symbol references have a 'name' field instead of fsPath
			const symbolName = reference.name;
			if (typeof symbolName === 'string' && kind === 'reference') {
				// This is a symbol reference, track it
				refs.symbol++;
				// Track symbol by name for display (use 'name' as path)
				const symbolKey = `#sym:${symbolName}`;
				refs.byPath[symbolKey] = (refs.byPath[symbolKey] || 0) + 1;
			}
		}
	}
}

/**
 * Analyze variableData to track prompt file attachments and other variable-based context.
 * This captures automatic attachments like copilot-instructions.md via variable system.
 */
export function analyzeVariableData(variableData: unknown, refs: ContextReferenceUsage): void {
	if (!variableData || typeof variableData !== 'object') {
		return;
	}
	const data = variableData as VariableDataRaw;
	if (!Array.isArray(data.variables)) {
		return;
	}

	for (const variable of data.variables) {
		if (!variable || typeof variable !== 'object') {
			continue;
		}

		// Track by kind from variableData
		const kind = variable.kind;
		if (typeof kind === 'string') {
			refs.byKind[kind] = (refs.byKind[kind] || 0) + 1;
		}

		// Handle symbol references (e.g., #sym:functionName)
		// These appear as kind="generic" with name starting with "sym:"
		if (kind === 'generic' && typeof variable.name === 'string' && variable.name.startsWith('sym:')) {
			refs.symbol++;
			// Track symbol by name for display
			const symbolKey = `#${variable.name}`;
			refs.byPath[symbolKey] = (refs.byPath[symbolKey] || 0) + 1;
		}

		// Process promptFile variables that contain file references
		if (kind === 'promptFile' && variable.value) {
			const value = variable.value;
			const fsPath = value.fsPath || value.path || value.external;

			if (typeof fsPath === 'string') {
				const normalizedPath = normalizePathForComparison(fsPath);

				// Track specific patterns (but don't double-count if already in contentReferences)
				if (normalizedPath.endsWith('/.github/copilot-instructions.md') ||
					normalizedPath.includes('.github/copilot-instructions.md')) {
					// copilotInstructions - tracked via contentReferences, skip here to avoid double counting
				} else if (normalizedPath.endsWith('/agents.md') ||
					normalizedPath.match(/\/agents\.md$/i)) {
					// agents.md - tracked via contentReferences, skip here  to avoid double counting
				}
				// Note: We don't add to byPath here as these are automatic attachments,
				// not explicit user file selections
			}
		}
	}
}

/**
 * Derive conversation patterns from already-computed mode usage.
 * Called before every return in analyzeSessionUsage to ensure all file formats get patterns.
 */
export function deriveConversationPatterns(analysis: SessionUsageAnalysis): void {
	const totalRequests = analysis.modeUsage.ask + analysis.modeUsage.edit + analysis.modeUsage.agent + analysis.modeUsage.cli;
	analysis.conversationPatterns = {
		multiTurnSessions: totalRequests > 1 ? 1 : 0,
		singleTurnSessions: totalRequests === 1 ? 1 : 0,
		avgTurnsPerSession: totalRequests,
		maxTurnsInSession: totalRequests
	};
}

/**
 * Analyze a request object for all context references.
 * This is the unified method that processes text, contentReferences, and variableData.
 */
export function analyzeRequestContext(request: unknown, refs: ContextReferenceUsage): void {
	if (!request || typeof request !== 'object') { return; }
	const req = request as Record<string, unknown>;

	// Analyze user message text for context references
	const message = req['message'];
	if (message && typeof message === 'object') {
		const msg = message as Record<string, unknown>;
		if (typeof msg['text'] === 'string') {
			analyzeContextReferences(msg['text'], refs);
		}
		const parts = msg['parts'];
		if (Array.isArray(parts)) {
			for (const part of parts) {
				if (part && typeof part === 'object') {
					const p = part as Record<string, unknown>;
					if (typeof p['text'] === 'string') {
						analyzeContextReferences(p['text'], refs);
					}
				}
			}
		}
	}

	// Analyze contentReferences if present
	const contentRefs = req['contentReferences'];
	if (Array.isArray(contentRefs)) {
		analyzeContentReferences(contentRefs, refs);
	}

	// Analyze variableData if present
	const variableData = req['variableData'];
	if (variableData !== undefined) {
		analyzeVariableData(variableData, refs);
	}
}

/**
 * Classifies unique models by tier and counts requests per tier.
 * Called before each early return in analyzeSessionUsage so that all session
 * formats (OpenCode, Visual Studio, Crush, Continue) populate the tier-breakdown
 * shown by the Multi-Model Usage section in the usage analysis view.
 */
/**
 * Read Claude Code session events from a JSONL file for usage analysis.
 * Lightweight: only used internally by analyzeSessionUsage.
 */
export function readClaudeCodeEventsForAnalysis(sessionFilePath: string): any[] {
	try {
		const content = fs.readFileSync(sessionFilePath, 'utf8');
		const lines = content.trim().split('\n');
		const events: unknown[] = [];
		for (const line of lines) {
			if (!line.trim()) { continue; }
			try { events.push(JSON.parse(line)); } catch { /* skip */ }
		}
		return events;
	} catch {
		return [];
	}
}

export function applyModelTierClassification(
	modelPricing: { [key: string]: ModelPricing },
	uniqueModels: string[],
	allModelRequests: string[],
	analysis: SessionUsageAnalysis
): void {
	const standard: string[] = [];
	const premium: string[] = [];
	const unknown: string[] = [];
	for (const model of uniqueModels) {
		const tier = getModelTier(model, modelPricing);
		if (tier === 'standard') { standard.push(model); }
		else if (tier === 'premium') { premium.push(model); }
		else { unknown.push(model); }
	}
	analysis.modelSwitching.tiers = { standard, premium, unknown };
	analysis.modelSwitching.hasMixedTiers = standard.length > 0 && premium.length > 0;
	let stdReq = 0, premReq = 0, unkReq = 0;
	for (const model of allModelRequests) {
		const tier = getModelTier(model, modelPricing);
		if (tier === 'standard') { stdReq++; }
		else if (tier === 'premium') { premReq++; }
		else { unkReq++; }
	}
	analysis.modelSwitching.standardRequests = stdReq;
	analysis.modelSwitching.premiumRequests = premReq;
	analysis.modelSwitching.unknownRequests = unkReq;
}

/**
 * Calculate model switching statistics for a session file.
 * This method updates the analysis.modelSwitching field in place.
 */
export async function calculateModelSwitching(deps: Pick<UsageAnalysisDeps, 'warn' | 'modelPricing' | 'tokenEstimators' | 'ecosystems'>, sessionFile: string, analysis: SessionUsageAnalysis, preloadedContent?: string, preloadedParsedJson?: unknown): Promise<void> {
	try {
		// Use non-cached method to avoid circular dependency
		// (getSessionFileDataCached -> analyzeSessionUsage -> getModelUsageFromSessionCached -> getSessionFileDataCached)
		const modelUsage = await getModelUsageFromSession(deps, sessionFile, preloadedContent, preloadedParsedJson);
		const modelCount = modelUsage ? Object.keys(modelUsage).length : 0;

		// Skip if modelUsage is undefined or empty (not a valid session file)
		if (!modelUsage || modelCount === 0) {
			return;
		}

		// Get unique models from this session
		const uniqueModels = Object.keys(modelUsage);
		analysis.modelSwitching.uniqueModels = uniqueModels;
		analysis.modelSwitching.modelCount = uniqueModels.length;

		// Classify models by tier
		const standardModels: string[] = [];
		const premiumModels: string[] = [];
		const unknownModels: string[] = [];

		for (const model of uniqueModels) {
			const tier = getModelTier(model, deps.modelPricing);
			if (tier === 'standard') {
				standardModels.push(model);
			} else if (tier === 'premium') {
				premiumModels.push(model);
			} else {
				unknownModels.push(model);
			}
		}

		analysis.modelSwitching.tiers = { standard: standardModels, premium: premiumModels, unknown: unknownModels };
		analysis.modelSwitching.hasMixedTiers = standardModels.length > 0 && premiumModels.length > 0;

		// Count requests per tier and model switches by examining request sequence
		const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFile, 'utf8');
		// Check if this is a UUID-only file (new Copilot CLI format)
		if (isUuidPointerFile(fileContent)) {
			return;
		}
		const isJsonl = sessionFile.endsWith('.jsonl') || isJsonlContent(fileContent);
		if (!isJsonl) {
			const parsed: unknown = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
			if (!isParsedSessionJson(parsed)) {
				deps.warn(`Unexpected session format in ${sessionFile}`);
				return;
			}
			const sessionContent = parsed;
			if (sessionContent.requests && Array.isArray(sessionContent.requests)) {
				let previousModel: string | null = null;
				let switchCount = 0;
				const tierCounts = { standard: 0, premium: 0, unknown: 0 };

				for (const requestRaw of sessionContent.requests) {
					const request = requestRaw as SessionRequestRaw;
					const currentModel = getModelFromRequest(request, deps.modelPricing);
					
					// Count model switches
					if (previousModel && currentModel !== previousModel) {
						switchCount++;
					}
					previousModel = currentModel;

					// Count requests per tier
					const tier = getModelTier(currentModel, deps.modelPricing);
					if (tier === 'standard') {
						tierCounts.standard++;
					} else if (tier === 'premium') {
						tierCounts.premium++;
					} else {
						tierCounts.unknown++;
					}
				}

				analysis.modelSwitching.switchCount = switchCount;
				analysis.modelSwitching.standardRequests = tierCounts.standard;
				analysis.modelSwitching.premiumRequests = tierCounts.premium;
				analysis.modelSwitching.unknownRequests = tierCounts.unknown;
				analysis.modelSwitching.totalRequests = tierCounts.standard + tierCounts.premium + tierCounts.unknown;
			}
		} else {
			// For JSONL files, we need to count requests differently
			// Count user messages as requests (type === 'user.message' or kind: 2 with requests)
			const lines = fileContent.trim().split('\n');
			const tierCounts = { standard: 0, premium: 0, unknown: 0 };
			let defaultModel = 'unknown';

			for (const line of lines) {
				if (!line.trim()) { continue; }
				try {
					const event = JSON.parse(line);

					// Track model changes
					if (event.kind === 0) {
						const modelId = event.v?.selectedModel?.identifier ||
							event.v?.selectedModel?.metadata?.id ||
							event.v?.inputState?.selectedModel?.metadata?.id;
						if (modelId) {
							defaultModel = modelId.replace(/^copilot\//, '');
						}
					}

					if (event.kind === 2 && event.k?.[0] === 'selectedModel') {
						const modelId = event.v?.identifier || event.v?.metadata?.id;
						if (modelId) {
							defaultModel = modelId.replace(/^copilot\//, '');
						}
					}

					// Copilot CLI: session.start carries the selected model
					if (event.type === 'session.start' && typeof event.data?.selectedModel === 'string') {
						defaultModel = event.data.selectedModel;
					}

					// Copilot CLI: session.model_change carries the currently active model
					if (event.type === 'session.model_change' && typeof event.data?.newModel === 'string') {
						defaultModel = event.data.newModel;
					}

					// Count user messages (requests)
					if (event.type === 'user.message') {
						const model = event.model || defaultModel;
						const tier = getModelTier(model, deps.modelPricing);
						if (tier === 'standard') {
							tierCounts.standard++;
						} else if (tier === 'premium') {
							tierCounts.premium++;
						} else {
							tierCounts.unknown++;
						}
					}

					// Count VS Code incremental format requests (kind: 2 with requests array)
					if (event.kind === 2 && event.k?.[0] === 'requests' && Array.isArray(event.v)) {
						for (const request of event.v) {
							let requestModel = defaultModel;
							if (request.modelId) {
								requestModel = request.modelId.replace(/^copilot\//, '');
							} else if (request.result?.metadata?.modelId) {
								requestModel = request.result.metadata.modelId.replace(/^copilot\//, '');
							} else if (request.result?.details) {
								requestModel = getModelFromRequest(request, deps.modelPricing);
							}

							const tier = getModelTier(requestModel, deps.modelPricing);
							if (tier === 'standard') {
								tierCounts.standard++;
							} else if (tier === 'premium') {
								tierCounts.premium++;
							} else {
								tierCounts.unknown++;
							}
						}
					}
				} catch (e) {
					// Skip malformed lines
				}
			}

			analysis.modelSwitching.standardRequests = tierCounts.standard;
			analysis.modelSwitching.premiumRequests = tierCounts.premium;
			analysis.modelSwitching.unknownRequests = tierCounts.unknown;
			analysis.modelSwitching.totalRequests = tierCounts.standard + tierCounts.premium + tierCounts.unknown;
		}
	} catch (error) {
		deps.warn(`Error calculating model switching for ${sessionFile}: ${error}`);
	}
}

/**
 * Track enhanced metrics from session files:
 * - Edit scope (single vs multi-file edits)
 * - Apply button usage (codeblockUri with isEdit flag)
 * - Session duration data
 * - Conversation patterns (multi-turn sessions)
 * - Agent type usage
 */
export async function trackEnhancedMetrics(deps: Pick<UsageAnalysisDeps, 'warn'>, sessionFile: string, analysis: SessionUsageAnalysis, preloadedContent?: string, preloadedParsedJson?: unknown): Promise<void> {
	try {
		const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFile, 'utf8');

		// Check if this is a UUID-only file (new Copilot CLI format)
		if (isUuidPointerFile(fileContent)) {
			return; // No metrics to track in pointer files
		}

		const isJsonl = sessionFile.endsWith('.jsonl') || isJsonlContent(fileContent);
		
		// Initialize tracking structures
		const editedFiles = new Set<string>();
		let totalApplies = 0;
		let totalCodeBlocks = 0;
		let totalLinesAdded = 0;
		let totalLinesRemoved = 0;
		const allLanguageUsage: LanguageUsage = {};
		const timestamps: number[] = [];
		const timingsData: { firstProgress?: number; totalElapsed?: number; }[] = [];
		const waitTimes: number[] = [];
		const agentCounts = {
			editsAgent: 0,
			defaultAgent: 0,
			workspaceAgent: 0,
			other: 0
		};
		
		if (isJsonl) {
			// Handle delta-based JSONL format
			const lines = fileContent.trim().split('\n').filter((l: string) => l.trim());
			let isDeltaBased = false;
			if (lines.length > 0) {
				try {
					const firstLine = JSON.parse(lines[0]);
					if (firstLine && typeof firstLine.kind === 'number') {
						isDeltaBased = true;
					}
				} catch {
					// Not delta format
				}
			}
			
			if (isDeltaBased) {
				// Reconstruct full state
				let sessionState: DeltaSessionState = {};
				for (const line of lines) {
					try {
						const delta = JSON.parse(line);
						sessionState = applyDelta(sessionState, delta) as DeltaSessionState;
					} catch {
						// Skip invalid lines
					}
				}
				if (sessionState.creationDate !== undefined) { timestamps.push(sessionState.creationDate); }
				if (sessionState.lastMessageDate !== undefined) { timestamps.push(sessionState.lastMessageDate); }
				
				// Process requests
				const requests = (sessionState.requests || []) as SessionRequestRaw[];
				let processedLoc: LanguageUsage;
				({ totalApplies, totalCodeBlocks, totalLinesAdded, totalLinesRemoved, languageUsage: processedLoc } = processRequestsForEnhancedMetrics(requests, agentCounts, editedFiles, timestamps, timingsData, waitTimes));
				for (const [ext, usage] of Object.entries(processedLoc)) {
					if (!allLanguageUsage[ext]) { allLanguageUsage[ext] = { linesAdded: 0, linesRemoved: 0 }; }
					allLanguageUsage[ext].linesAdded += usage.linesAdded;
					allLanguageUsage[ext].linesRemoved += usage.linesRemoved;
				}
			}
		} else {
			// Handle regular JSON files
			const parsed: unknown = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
			if (!isParsedSessionJson(parsed)) {
				deps.warn(`Unexpected session format in ${sessionFile}`);
				return;
			}
			const sessionContent = parsed;
			
			// Extract timestamps
			if (sessionContent.creationDate) { timestamps.push(sessionContent.creationDate); }
			if (sessionContent.lastMessageDate) { timestamps.push(sessionContent.lastMessageDate); }
			
			// Process requests
			const requests = (sessionContent.requests ?? []) as SessionRequestRaw[];
			let processedLoc2: LanguageUsage;
			({ totalApplies, totalCodeBlocks, totalLinesAdded, totalLinesRemoved, languageUsage: processedLoc2 } = processRequestsForEnhancedMetrics(requests, agentCounts, editedFiles, timestamps, timingsData, waitTimes));
			for (const [ext, usage] of Object.entries(processedLoc2)) {
				if (!allLanguageUsage[ext]) { allLanguageUsage[ext] = { linesAdded: 0, linesRemoved: 0 }; }
				allLanguageUsage[ext].linesAdded += usage.linesAdded;
				allLanguageUsage[ext].linesRemoved += usage.linesRemoved;
			}
		}
		
		// Store edit scope data
		const editSessionCount = editedFiles.size > 0 ? 1 : 0;
		analysis.editScope = {
			singleFileEdits: editedFiles.size === 1 ? 1 : 0,
			multiFileEdits: editedFiles.size > 1 ? 1 : 0,
			totalEditedFiles: editedFiles.size,
			avgFilesPerSession: editSessionCount > 0 ? editedFiles.size / editSessionCount : 0,
			linesAdded: totalLinesAdded,
			linesRemoved: totalLinesRemoved,
			...(Object.keys(allLanguageUsage).length > 0 ? { languageUsage: allLanguageUsage } : {}),
		};
		
		// Store apply button usage
		analysis.applyUsage = {
			totalApplies,
			totalCodeBlocks,
			applyRate: totalCodeBlocks > 0 ? (totalApplies / totalCodeBlocks) * 100 : 0
		};
		
		// Calculate session duration
		const totalDurationMs = timestamps.length >= 2 
			? Math.max(...timestamps) - Math.min(...timestamps)
			: 0;
		const avgFirstProgressMs = timingsData.length > 0
			? timingsData.reduce((sum, t) => sum + (t.firstProgress || 0), 0) / timingsData.length
			: 0;
		const avgTotalElapsedMs = timingsData.length > 0
			? timingsData.reduce((sum, t) => sum + (t.totalElapsed || 0), 0) / timingsData.length
			: 0;
		const avgWaitTimeMs = waitTimes.length > 0
			? waitTimes.reduce((sum, w) => sum + w, 0) / waitTimes.length
			: 0;
		
		analysis.sessionDuration = {
			totalDurationMs,
			avgDurationMs: totalDurationMs,
			avgFirstProgressMs,
			avgTotalElapsedMs,
			avgWaitTimeMs
		};
		
		// Store conversation patterns
		deriveConversationPatterns(analysis);
		
		// Store agent type usage
		analysis.agentTypes = agentCounts;
		
	} catch (error) {
		deps.warn(`Error tracking enhanced metrics from ${sessionFile}: ${error}`);
	}
}

/**
 * Create an empty SessionUsageAnalysis object, used as the baseline for adapter analyzeUsage() implementations.
 */
export function createEmptySessionUsageAnalysis(): SessionUsageAnalysis {
	return {
		toolCalls: { total: 0, byTool: {} },
		modeUsage: { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 },
		contextReferences: createEmptyContextRefs(),
		mcpTools: { total: 0, byServer: {}, byTool: {} },
		modelSwitching: {
			uniqueModels: [],
			modelCount: 0,
			switchCount: 0,
			tiers: { standard: [], premium: [], unknown: [] },
			hasMixedTiers: false,
			standardRequests: 0,
			premiumRequests: 0,
			unknownRequests: 0,
			totalRequests: 0,
		},
	};
}

type AsuCliState = {
	cliDefaultModel: string;
	cliDefaultEffort: string | null;
	cliRequestCount: number;
	cliEffortByRequest: { [effort: string]: number };
};

function _asuIsDeltaBased(lines: string[]): boolean {
	if (lines.length === 0) { return false; }
	try {
		const first = JSON.parse(lines[0]);
		return first !== null && typeof first === 'object' && typeof (first as Record<string, unknown>).kind === 'number';
	} catch { return false; }
}

function _asuReconstructDeltaState(lines: string[]): DeltaSessionState {
	let sessionState: DeltaSessionState = {};
	for (const line of lines) {
		try { sessionState = applyDelta(sessionState, JSON.parse(line)) as DeltaSessionState; } catch { /* skip */ }
	}
	return sessionState;
}

function _asuProcessSelectionsUpdate(selections: unknown[], analysis: SessionUsageAnalysis): void {
	for (const sel of selections) {
		const s = sel as { startLineNumber?: number; endLineNumber?: number; startColumn?: number; endColumn?: number } | null | undefined;
		if (s && (s.startLineNumber !== s.endLineNumber || s.startColumn !== s.endColumn)) {
			analysis.contextReferences.implicitSelection++;
			break;
		}
	}
}

function _asuProcessKind0Event(event: JsonlEventRaw, analysis: SessionUsageAnalysis, sessionMode: string): string {
	if (!event.v || typeof event.v !== 'object') { return sessionMode; }
	const v = event.v as { inputState?: { mode?: unknown; selections?: unknown[] } };
	if (!v.inputState?.mode) { return sessionMode; }
	sessionMode = getModeType(v.inputState.mode);
	if (Array.isArray(v.inputState.selections)) { _asuProcessSelectionsUpdate(v.inputState.selections, analysis); }
	return sessionMode;
}

function _asuProcessKind1Events(event: JsonlEventRaw, analysis: SessionUsageAnalysis, sessionMode: string): string {
	if (event.k?.includes('mode') && event.v) { sessionMode = getModeType(event.v); }
	if (event.k?.includes('selections') && Array.isArray(event.v)) { _asuProcessSelectionsUpdate(event.v as unknown[], analysis); }
	if (event.k?.includes('contentReferences') && Array.isArray(event.v)) { analyzeContentReferences(event.v as unknown[], analysis.contextReferences); }
	if (event.k?.includes('variableData') && event.v) { analyzeVariableData(event.v, analysis.contextReferences); }
	return sessionMode;
}

function _asuProcessResponseItems(response: ResponseItemRaw[], analysis: SessionUsageAnalysis): void {
	for (const item of response) {
		if (!item) { continue; }
		if (item.kind === 'toolInvocationSerialized' || item.kind === 'prepareToolInvocation') {
			analysis.toolCalls.total++;
			const toolName = item.toolId || item.toolName || item.invocationMessage?.toolName || item.toolSpecificData?.kind || 'unknown';
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}
	}
}

function _asuProcessKind2Requests(requests: unknown[], analysis: SessionUsageAnalysis, sessionMode: string): void {
	for (const request of requests) {
		const req = request as { requestId?: unknown; agent?: { id?: string }; response?: unknown[] };
		if (req.requestId) { incrementModeUsage(sessionMode, analysis.modeUsage); }
		if (req.agent?.id) {
			analysis.toolCalls.total++;
			analysis.toolCalls.byTool[req.agent.id] = (analysis.toolCalls.byTool[req.agent.id] || 0) + 1;
		}
		analyzeRequestContext(request, analysis.contextReferences);
		if (req.response && Array.isArray(req.response)) { _asuProcessResponseItems(req.response as ResponseItemRaw[], analysis); }
	}
}

function _asuProcessKind2Response(v: unknown[], analysis: SessionUsageAnalysis): void {
	for (const item of v) {
		if (!item) { continue; }
		const ri = item as ResponseItemRaw;
		if (ri.kind === 'toolInvocationSerialized') {
			analysis.toolCalls.total++;
			const toolName = ri.toolId || ri.toolName || ri.invocationMessage?.toolName || ri.toolSpecificData?.kind || 'unknown';
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}
	}
}

function _asuProcessKind2Event(event: JsonlEventRaw, analysis: SessionUsageAnalysis, sessionMode: string): void {
	if (event.k?.[0] === 'requests' && Array.isArray(event.v)) { _asuProcessKind2Requests(event.v as unknown[], analysis, sessionMode); }
	if (event.k?.includes('response') && Array.isArray(event.v)) { _asuProcessKind2Response(event.v as unknown[], analysis); }
}

function _asuProcessCliUserMessage(analysis: SessionUsageAnalysis, jetBrainsMode: JetBrainsMode | null): void {
	if (jetBrainsMode === 'agent') { analysis.modeUsage.agent++; }
	else if (jetBrainsMode === 'ask') { analysis.modeUsage.ask++; }
	else { analysis.modeUsage.cli++; }
}

function _asuProcessToolCall(event: JsonlEventRaw, analysis: SessionUsageAnalysis, toolNameMap: { [key: string]: string }): void {
	const toolName = event.data?.toolName || event.toolName || 'unknown';
	recordToolOrMcpInvocation(toolName, analysis, toolNameMap);
}

function _asuProcessMcpToolCall(event: JsonlEventRaw, analysis: SessionUsageAnalysis): void {
	analysis.mcpTools.total++;
	const serverName = event.data?.mcpServer || 'unknown';
	const mcpToolName = event.data?.toolName || event.toolName || 'unknown';
	analysis.mcpTools.byServer[serverName] = (analysis.mcpTools.byServer[serverName] || 0) + 1;
	const normalizedMcpTool = normalizeMcpToolName(mcpToolName);
	analysis.mcpTools.byTool[normalizedMcpTool] = (analysis.mcpTools.byTool[normalizedMcpTool] || 0) + 1;
}

function _asuCountUserMessage(event: JsonlEventRaw, cliState: AsuCliState): void {
	cliState.cliRequestCount++;
	const effort = typeof event.data?.reasoningEffort === 'string' ? event.data.reasoningEffort : cliState.cliDefaultEffort;
	if (effort) { cliState.cliEffortByRequest[effort] = (cliState.cliEffortByRequest[effort] || 0) + 1; }
}

function _asuProcessSessionStart(event: JsonlEventRaw, cliState: AsuCliState): void {
	if (typeof event.data?.selectedModel === 'string') { cliState.cliDefaultModel = event.data.selectedModel; }
	if (typeof event.data?.reasoningEffort === 'string') { cliState.cliDefaultEffort = event.data.reasoningEffort; }
}

function _asuStoreCliThinkingEffort(analysis: SessionUsageAnalysis, cliState: AsuCliState): void {
	if (cliState.cliDefaultEffort === null && Object.keys(cliState.cliEffortByRequest).length === 0) { return; }
	const byEffort = Object.keys(cliState.cliEffortByRequest).length > 0
		? cliState.cliEffortByRequest
		: (cliState.cliDefaultEffort !== null ? { [cliState.cliDefaultEffort]: cliState.cliRequestCount } : {});
	analysis.thinkingEffort = { byEffort, switchCount: 0, defaultEffort: cliState.cliDefaultEffort };
}

function _asuHandleUserMessage(event: JsonlEventRaw, analysis: SessionUsageAnalysis, cliState: AsuCliState, jetBrainsMode: JetBrainsMode | null): void {
	_asuCountUserMessage(event, cliState);
	_asuProcessCliUserMessage(analysis, jetBrainsMode);
}

function _asuHandleCliSession(event: JsonlEventRaw, cliState: AsuCliState): void {
	if (event.type === 'session.start' && event.data) { _asuProcessSessionStart(event, cliState); return; }
	if (typeof event.data?.newModel === 'string') { cliState.cliDefaultModel = event.data.newModel; }
}

function _asuProcessJsonlLine(event: JsonlEventRaw, analysis: SessionUsageAnalysis, cliState: AsuCliState, jetBrainsMode: JetBrainsMode | null, sessionMode: string, toolNameMap: { [key: string]: string }): string {
	const t = event.type;
	if (t === 'session.start' || t === 'session.model_change') { _asuHandleCliSession(event, cliState); }
	if (t === 'user.message') { _asuHandleUserMessage(event, analysis, cliState, jetBrainsMode); }
	if (event.kind === 0) { sessionMode = _asuProcessKind0Event(event, analysis, sessionMode); }
	if (event.kind === 1) { sessionMode = _asuProcessKind1Events(event, analysis, sessionMode); }
	if (event.kind === 2) { _asuProcessKind2Event(event, analysis, sessionMode); }
	if (t === 'tool.call' || t === 'tool.result' || t === 'tool.execution_start') { _asuProcessToolCall(event, analysis, toolNameMap); }
	if (t === 'mcp.tool.call' || event.data?.mcpServer) { _asuProcessMcpToolCall(event, analysis); }
	return sessionMode;
}

async function _asuProcessJsonlContent(deps: UsageAnalysisDeps, sessionFile: string, fileContent: string, lines: string[], analysis: SessionUsageAnalysis): Promise<void> {
	if (_asuIsDeltaBased(lines)) {
		processDeltaSessionAnalysis(deps, _asuReconstructDeltaState(lines), lines, analysis);
		return;
	}
	let sessionMode = 'ask';
	const cliState: AsuCliState = { cliDefaultModel: 'unknown', cliDefaultEffort: null, cliRequestCount: 0, cliEffortByRequest: {} };
	const jetBrainsMode = isJetBrainsSessionPath(sessionFile) ? detectJetBrainsModeFromContent(fileContent) : null;
	for (const line of lines) {
		if (!line.trim()) { continue; }
		try {
			const event = JSON.parse(line) as JsonlEventRaw;
			sessionMode = _asuProcessJsonlLine(event, analysis, cliState, jetBrainsMode, sessionMode, deps.toolNameMap);
		} catch { /* skip malformed lines */ }
	}
	_asuStoreCliThinkingEffort(analysis, cliState);
	await calculateModelSwitching(deps, sessionFile, analysis, fileContent);
	deriveConversationPatterns(analysis);
}

/**
 * Analyze a session file for usage patterns (tool calls, modes, context references, MCP tools)
 */
export async function analyzeSessionUsage(deps: UsageAnalysisDeps, sessionFile: string, preloadedContent?: string, preloadedParsedJson?: unknown): Promise<SessionUsageAnalysis> {
	const analysis: SessionUsageAnalysis = createEmptySessionUsageAnalysis();
	try {
		const eco = deps.ecosystems.find(e => e.handles(sessionFile));
		if (eco && isAnalyzable(eco)) {
			return eco.analyzeUsage(sessionFile, { modelPricing: deps.modelPricing, toolNameMap: deps.toolNameMap });
		}
		const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFile, 'utf8');
		const isJsonl = sessionFile.endsWith('.jsonl') || isJsonlContent(fileContent);

		if (isJsonl) {
			const lines = fileContent.trim().split('\n').filter((l: string) => l.trim());
			await _asuProcessJsonlContent(deps, sessionFile, fileContent, lines, analysis);
			return analysis;
		}
		const parsed: unknown = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
		if (!isParsedSessionJson(parsed)) { deps.warn(`Unexpected session format in ${sessionFile}`); return analysis; }
		processJsonSessionRequests(deps, parsed, analysis);
		await calculateModelSwitching(deps, sessionFile, analysis, fileContent, preloadedParsedJson);
		await trackEnhancedMetrics(deps, sessionFile, analysis, fileContent, preloadedParsedJson);
	} catch (error) {
		deps.warn(`Error analyzing session usage from ${sessionFile}: ${error}`);
	}
	return analysis;
}

/**
 * Try to extract exact token usage from a session request result,
 * checking all known storage formats (OLD, NEW, INSIDERS).
 * Returns true if tokens were extracted; false if text-based estimation is needed.
 */
function tryExtractExactTokenUsage(
	request: SessionRequestRaw,
	model: string,
	modelUsage: ModelUsage
): boolean {
	if (request.result?.usage) {
		// OLD FORMAT (pre-Feb 2026)
		const u = request.result.usage;
		modelUsage[model].inputTokens += typeof u.promptTokens === 'number' ? u.promptTokens : 0;
		modelUsage[model].outputTokens += typeof u.completionTokens === 'number' ? u.completionTokens : 0;
		return true;
	}
	if (typeof request.result?.promptTokens === 'number' && typeof request.result?.outputTokens === 'number') {
		// NEW FORMAT (Feb 2026+)
		modelUsage[model].inputTokens += request.result.promptTokens;
		modelUsage[model].outputTokens += request.result.outputTokens;
		return true;
	}
	if (request.result?.metadata && typeof request.result.metadata.promptTokens === 'number' && typeof request.result.metadata.outputTokens === 'number') {
		// INSIDERS FORMAT (Feb 2026+): Tokens nested under result.metadata
		modelUsage[model].inputTokens += request.result.metadata.promptTokens;
		modelUsage[model].outputTokens += request.result.metadata.outputTokens;
		return true;
	}
	return false;
}

/**
 * Accumulate sub-agent token usage from a response item array into modelUsage.
 * Sub-agent invocations are additive (not included in parent token counts).
 */
function accumulateSubAgentTokenUsage(
	responseItems: ResponseItemRaw[],
	baseModel: string,
	modelUsage: ModelUsage,
	tokenEstimators: Record<string, TokenEstimator>
): void {
	for (const responseItem of responseItems) {
		const subAgent = extractSubAgentData(responseItem);
		if (subAgent) {
			const saModel = subAgent.modelName || baseModel;
			if (!modelUsage[saModel]) { modelUsage[saModel] = { inputTokens: 0, outputTokens: 0 }; }
			if (subAgent.prompt) { modelUsage[saModel].inputTokens += estimateTokensFromText(subAgent.prompt, saModel, tokenEstimators); }
			if (subAgent.result) { modelUsage[saModel].outputTokens += estimateTokensFromText(subAgent.result, saModel, tokenEstimators); }
		}
	}
}

type GmusDeps = Pick<UsageAnalysisDeps, 'warn' | 'tokenEstimators' | 'modelPricing'>;

type GmusJsonlState = {
	defaultModel: string;
	isDeltaBased: boolean;
	sessionState: DeltaSessionState;
	cliShutdownModelUsage: ModelUsage | null;
	cliRealOutputByModel: { [model: string]: number } | null;
	totalCliToolCalls: number;
};

type CliShutdownMetricsEntry = { usage?: { inputTokens?: number; outputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number } };

/** Accumulate per-model token data from a session.shutdown modelMetrics block. */
function _gmusProcessCliShutdownMetrics(
	modelMetrics: Record<string, CliShutdownMetricsEntry>,
	cliShutdownModelUsage: ModelUsage
): void {
	for (const [modelName, metrics] of Object.entries(modelMetrics)) {
		const usage = metrics?.usage;
		if (!usage) { continue; }
		if (!cliShutdownModelUsage[modelName]) { cliShutdownModelUsage[modelName] = { inputTokens: 0, outputTokens: 0 }; }
		cliShutdownModelUsage[modelName].inputTokens += typeof usage.inputTokens === 'number' ? usage.inputTokens : 0;
		cliShutdownModelUsage[modelName].outputTokens += typeof usage.outputTokens === 'number' ? usage.outputTokens : 0;
		const cacheRead = typeof usage.cacheReadTokens === 'number' ? usage.cacheReadTokens : 0;
		const cacheWrite = typeof usage.cacheWriteTokens === 'number' ? usage.cacheWriteTokens : 0;
		if (cacheRead > 0) { cliShutdownModelUsage[modelName].cachedReadTokens = (cliShutdownModelUsage[modelName].cachedReadTokens ?? 0) + cacheRead; }
		if (cacheWrite > 0) { cliShutdownModelUsage[modelName].cacheCreationTokens = (cliShutdownModelUsage[modelName].cacheCreationTokens ?? 0) + cacheWrite; }
	}
}

/** Handle an assistant.message event, recording real or estimated output tokens. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _gmusHandleAssistantMessage(event: any, model: string, state: GmusJsonlState, modelUsage: ModelUsage, deps: GmusDeps): void {
	const realOutput = typeof event.data?.outputTokens === 'number' ? event.data.outputTokens : 0;
	if (realOutput > 0) {
		if (!state.cliRealOutputByModel) { state.cliRealOutputByModel = {}; }
		state.cliRealOutputByModel[model] = (state.cliRealOutputByModel[model] ?? 0) + realOutput;
	} else if (event.data?.content) {
		modelUsage[model].outputTokens += estimateTokensFromText(event.data.content, model, deps.tokenEstimators);
	}
}

/** Handle a session.shutdown event, accumulating CLI shutdown model metrics into state. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _gmusHandleShutdownEvent(event: any, state: GmusJsonlState): void {
	if (!event.data?.modelMetrics) { return; }
	if (!state.cliShutdownModelUsage) { state.cliShutdownModelUsage = {}; }
	_gmusProcessCliShutdownMetrics(event.data.modelMetrics as Record<string, CliShutdownMetricsEntry>, state.cliShutdownModelUsage);
}

/** Dispatch a CLI-format JSONL event to the appropriate token accumulation handler. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _gmusProcessCliEventLine(event: any, model: string, state: GmusJsonlState, modelUsage: ModelUsage, deps: GmusDeps): void {
	if (event.type === 'session.shutdown') {
		_gmusHandleShutdownEvent(event, state);
	} else if (event.type === 'user.message' && event.data?.content) {
		modelUsage[model].inputTokens += estimateTokensFromText(event.data.content, model, deps.tokenEstimators);
	} else if (event.type === 'assistant.message') {
		_gmusHandleAssistantMessage(event, model, state, modelUsage, deps);
	} else if (event.type === 'tool.execution_start') {
		state.totalCliToolCalls++;
	} else if (event.type === 'tool.execution_complete') {
		const toolContent = event.data?.result?.content || event.data?.result?.detailedContent;
		if (toolContent) { modelUsage[model].inputTokens += estimateTokensFromText(String(toolContent), model, deps.tokenEstimators); }
	}
}

/** Extract the model identifier from a kind-0 (session header) delta event, or null if absent. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _gmusExtractKind0Model(event: any): string | null {
	if (event.kind !== 0) { return null; }
	return event.v?.selectedModel?.identifier || event.v?.selectedModel?.metadata?.id || event.v?.inputState?.selectedModel?.metadata?.id || null;
}

/** Extract the model identifier from a kind-2 selectedModel update event, or null if absent. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _gmusExtractKind2Model(event: any): string | null {
	if (event.kind !== 2 || event.k?.[0] !== 'selectedModel') { return null; }
	return event.v?.identifier || event.v?.metadata?.id || null;
}

/** Update the default model tracked in state based on model-selection events. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _gmusUpdateDefaultModelFromEvent(event: any, state: GmusJsonlState): void {
	if (event.type === 'session.start' && typeof event.data?.selectedModel === 'string') {
		state.defaultModel = event.data.selectedModel;
		return;
	}
	if (event.type === 'session.model_change' && typeof event.data?.newModel === 'string') {
		state.defaultModel = event.data.newModel;
		return;
	}
	const kind0Model = _gmusExtractKind0Model(event);
	if (kind0Model) { state.defaultModel = kind0Model.replace(/^copilot\//, ''); }
	const kind2Model = _gmusExtractKind2Model(event);
	if (kind2Model) { state.defaultModel = kind2Model.replace(/^copilot\//, ''); }
}

/** Process a single parsed JSONL event, updating state and model usage. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _gmusProcessJsonlLine(event: any, state: GmusJsonlState, modelUsage: ModelUsage, deps: GmusDeps): void {
	if (typeof event.kind === 'number') {
		state.isDeltaBased = true;
		state.sessionState = applyDelta(state.sessionState, event) as DeltaSessionState;
	}
	_gmusUpdateDefaultModelFromEvent(event, state);
	const model = event.data?.model || event.model || state.defaultModel;
	if (!modelUsage[model]) { modelUsage[model] = { inputTokens: 0, outputTokens: 0 }; }
	if (!state.isDeltaBased) { _gmusProcessCliEventLine(event, model, state, modelUsage, deps); }
}

/** Parse all JSONL lines into accumulated state and model usage. Returns the session state. */
function _gmusParseJsonlLines(lines: string[], modelUsage: ModelUsage, deps: GmusDeps): GmusJsonlState {
	const state: GmusJsonlState = {
		defaultModel: 'unknown', isDeltaBased: false, sessionState: {},
		cliShutdownModelUsage: null, cliRealOutputByModel: null, totalCliToolCalls: 0
	};
	for (const line of lines) {
		if (!line.trim()) { continue; }
		try {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const event: any = JSON.parse(line);
			_gmusProcessJsonlLine(event, state, modelUsage, deps);
		} catch { /* skip malformed lines */ }
	}
	return state;
}

/** Estimate token counts for a delta request by parsing message text and response content. */
function _gmusEstimateDeltaRequestTokens(request: SessionRequestRaw, requestModel: string, modelUsage: ModelUsage, deps: GmusDeps): void {
	if (request.message?.text) {
		modelUsage[requestModel].inputTokens += estimateTokensFromText(request.message.text, requestModel, deps.tokenEstimators);
	}
	if (request.response && Array.isArray(request.response)) {
		for (const responseItem of request.response as ResponseItemRaw[]) {
			const { text } = extractResponseItemText(responseItem);
			if (text) { modelUsage[requestModel].outputTokens += estimateTokensFromText(text, requestModel, deps.tokenEstimators); }
		}
	}
}

/** Process a single delta-format request, extracting or estimating token usage. */
function _gmusProcessDeltaRequest(request: SessionRequestRaw, defaultModel: string, modelUsage: ModelUsage, deps: GmusDeps): void {
	if (!request.requestId) { return; }
	let requestModel = defaultModel;
	if (request.modelId) {
		requestModel = request.modelId.replace(/^copilot\//, '');
	} else if (request.result?.metadata?.modelId) {
		requestModel = request.result.metadata.modelId.replace(/^copilot\//, '');
	} else if (request.result?.details) {
		requestModel = getModelFromRequest(request, deps.modelPricing);
	}
	if (!modelUsage[requestModel]) { modelUsage[requestModel] = { inputTokens: 0, outputTokens: 0 }; }
	if (!tryExtractExactTokenUsage(request, requestModel, modelUsage)) {
		_gmusEstimateDeltaRequestTokens(request, requestModel, modelUsage, deps);
	}
	if (request.response && Array.isArray(request.response)) {
		accumulateSubAgentTokenUsage(request.response as ResponseItemRaw[], requestModel, modelUsage, deps.tokenEstimators);
	}
}

/** Iterate and process all delta-based requests from reconstructed session state. */
function _gmusProcessDeltaRequests(state: GmusJsonlState, modelUsage: ModelUsage, deps: GmusDeps): void {
	if (!state.isDeltaBased || !state.sessionState.requests || !Array.isArray(state.sessionState.requests)) { return; }
	for (const requestRaw of state.sessionState.requests) {
		if (!requestRaw) { continue; }
		_gmusProcessDeltaRequest(requestRaw as SessionRequestRaw, state.defaultModel, modelUsage, deps);
	}
}

/** Apply regex-based fallback extraction to fill in any requests that reconstruction missed. */
function _gmusDeltaFallbackExtraction(lines: string[], state: GmusJsonlState, modelUsage: ModelUsage): void {
	const rawModelUsage = extractPerRequestUsageFromRawLines(lines);
	for (const [reqIdx, extracted] of rawModelUsage) {
		const request = state.sessionState.requests?.[reqIdx] as SessionRequestRaw | undefined;
		if (!request) { continue; }
		if (request.result?.usage || (typeof request.result?.promptTokens === 'number') || (request.result?.metadata && typeof request.result.metadata.promptTokens === 'number')) { continue; }
		let requestModel = state.defaultModel;
		if (request.modelId) { requestModel = request.modelId.replace(/^copilot\//, ''); }
		if (!modelUsage[requestModel]) { modelUsage[requestModel] = { inputTokens: 0, outputTokens: 0 }; }
		modelUsage[requestModel].inputTokens += extracted.promptTokens;
		modelUsage[requestModel].outputTokens += extracted.outputTokens;
	}
}

/** Build estimated model usage for sessions using per-turn real output without a shutdown event. */
function _gmusBuildEstimatedCliUsage(state: GmusJsonlState, modelUsage: ModelUsage): ModelUsage {
	const numTurns = Math.max(1, Math.round(state.totalCliToolCalls / 2));
	const contextFactor = Math.max(1, (numTurns + 1) / 2);
	const estimatedUsage: ModelUsage = {};
	for (const [m, realOutput] of Object.entries(state.cliRealOutputByModel!)) {
		const accumulatedInput = modelUsage[m]?.inputTokens ?? 0;
		estimatedUsage[m] = { inputTokens: Math.round(accumulatedInput * contextFactor), outputTokens: realOutput };
	}
	return estimatedUsage;
}

/** Process all JSONL lines and return resolved model usage, or null to use accumulated modelUsage. */
function _gmusProcessJsonlContent(lines: string[], modelUsage: ModelUsage, deps: GmusDeps): ModelUsage | null {
	const state = _gmusParseJsonlLines(lines, modelUsage, deps);
	if (!state.isDeltaBased && state.cliShutdownModelUsage) { return state.cliShutdownModelUsage; }
	if (!state.isDeltaBased && state.cliRealOutputByModel) { return _gmusBuildEstimatedCliUsage(state, modelUsage); }
	_gmusProcessDeltaRequests(state, modelUsage, deps);
	_gmusDeltaFallbackExtraction(lines, state, modelUsage);
	return null;
}

/** Estimate input/output tokens for a JSON-format request from message text and response content. */
function _gmusProcessJsonRequestEstimate(request: SessionRequestRaw, model: string, modelUsage: ModelUsage, deps: GmusDeps): void {
	if (request.message?.parts) {
		for (const part of request.message.parts) {
			if (part.text) { modelUsage[model].inputTokens += estimateTokensFromText(part.text, model, deps.tokenEstimators); }
		}
	}
	if (request.response && Array.isArray(request.response)) {
		for (const responseItem of request.response as ResponseItemRaw[]) {
			const { text } = extractResponseItemText(responseItem);
			if (text) { modelUsage[model].outputTokens += estimateTokensFromText(text, model, deps.tokenEstimators); }
		}
	}
}

/** Process a single JSON-format session request, accumulating its token usage. */
function _gmusProcessJsonRequest(request: SessionRequestRaw, modelUsage: ModelUsage, deps: GmusDeps): void {
	const model = getModelFromRequest(request, deps.modelPricing);
	if (!modelUsage[model]) { modelUsage[model] = { inputTokens: 0, outputTokens: 0 }; }
	if (!tryExtractExactTokenUsage(request, model, modelUsage)) { _gmusProcessJsonRequestEstimate(request, model, modelUsage, deps); }
	if (request.response && Array.isArray(request.response)) {
		accumulateSubAgentTokenUsage(request.response as ResponseItemRaw[], model, modelUsage, deps.tokenEstimators);
	}
}

/** Iterate and process all requests from a parsed JSON session file. */
function _gmusProcessJsonRequests(sessionContent: ParsedSessionJson, modelUsage: ModelUsage, deps: GmusDeps): void {
	if (!sessionContent.requests || !Array.isArray(sessionContent.requests)) { return; }
	for (const requestRaw of sessionContent.requests) {
		_gmusProcessJsonRequest(requestRaw as SessionRequestRaw, modelUsage, deps);
	}
}

export async function getModelUsageFromSession(deps: Pick<UsageAnalysisDeps, 'warn' | 'tokenEstimators' | 'modelPricing' | 'ecosystems'>, sessionFile: string, preloadedContent?: string, preloadedParsedJson?: unknown): Promise<ModelUsage> {
	const modelUsage: ModelUsage = {};
	if (deps.ecosystems) {
		const eco = deps.ecosystems.find(e => e.handles(sessionFile));
		if (eco) { return eco.getModelUsage(sessionFile); }
	}
	try {
		const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFile, 'utf8');
		if (isUuidPointerFile(fileContent)) { return modelUsage; }
		const isJsonl = sessionFile.endsWith('.jsonl') || isJsonlContent(fileContent);
		if (isJsonl) {
			const lines = fileContent.trim().split('\n');
			const result = _gmusProcessJsonlContent(lines, modelUsage, deps);
			return result ?? modelUsage;
		}
		const parsed: unknown = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
		if (!isParsedSessionJson(parsed)) { deps.warn(`Unexpected session format in ${sessionFile}`); return modelUsage; }
		_gmusProcessJsonRequests(parsed, modelUsage, deps);
	} catch (error) {
		deps.warn(`Error getting model usage from ${sessionFile}: ${error}`);
	}
	return modelUsage;
}



