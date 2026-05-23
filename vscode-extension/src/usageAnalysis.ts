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
function extractEditMetrics(req: SessionRequestRaw): EditMetrics {
	const editedFilePaths: string[] = [];
	let codeBlocks = 0;
	let applies = 0;
	let linesAdded = 0;
	let linesRemoved = 0;
	const languageUsage: LanguageUsage = {};

	if (req.response && Array.isArray(req.response)) {
		for (const respRaw of req.response as ResponseItemRaw[]) {
			if (!respRaw) { continue; }
			if (respRaw.kind === 'textEditGroup' && respRaw.uri) {
				const filePath = respRaw.uri.path || JSON.stringify(respRaw.uri);
				editedFilePaths.push(filePath);

				const ext = normalizeExtension(filePath);
				const respRawAny = respRaw as unknown as { edits?: unknown };
				if (Array.isArray(respRawAny.edits)) {
					for (const editGroup of respRawAny.edits as unknown[]) {
						if (!Array.isArray(editGroup)) { continue; }
						for (const edit of editGroup as unknown[]) {
							if (!edit || typeof edit !== 'object') { continue; }
							const editObj = edit as { text?: unknown; range?: { startLineNumber?: number; endLineNumber?: number } };
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
						}
					}
				}
			}
			if (respRaw.kind === 'codeblockUri') {
				codeBlocks++;
				if (respRaw.isEdit === true) {
					applies++;
				}
			}
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

	// Extract session mode from reconstructed state
	const sessionModeType = sessionState.inputState?.mode 
		? getModeType(sessionState.inputState.mode)
		: 'ask';

	// Detect implicit selections
	if (sessionState.inputState?.selections && Array.isArray(sessionState.inputState.selections)) {
		for (const sel of sessionState.inputState.selections) {
			if (sel && (sel.startLineNumber !== sel.endLineNumber || sel.startColumn !== sel.endColumn)) {
				analysis.contextReferences.implicitSelection++;
				break;
			}
		}
	}

	// Process reconstructed requests array
	const requests = (sessionState.requests ?? []) as SessionRequestRaw[];
	for (const request of requests) {
		if (!request || !request.requestId) { continue; }

		// Count by mode type
		incrementModeUsage(sessionModeType, analysis.modeUsage);

		// Check for agent in request
		if (request.agent?.id) {
			const toolName = request.agent.id;
			analysis.toolCalls.total++;
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}

		// Analyze all context references from this request
		analyzeRequestContext(request, analysis.contextReferences);

		// Extract tool calls and MCP tools from request.response array
		if (request.response && Array.isArray(request.response)) {
			for (const responseItemRaw of request.response as ResponseItemRaw[]) {
				if (!responseItemRaw) { continue; }
				const responseItem = responseItemRaw;
				if (responseItem.kind === 'toolInvocationSerialized' || responseItem.kind === 'prepareToolInvocation') {
					const toolName = responseItem.toolId || responseItem.toolName || responseItem.invocationMessage?.toolName || responseItem.toolSpecificData?.kind || 'unknown';

					// Route to MCP or regular tool counters
					recordToolOrMcpInvocation(toolName, analysis, deps.toolNameMap);
				}
			}
		}
	}

	// Compute model switching inline from the already-reconstructed state
	// to avoid re-reading and re-parsing the file in calculateModelSwitching.
	{
		// Derive the session-level default model from reconstructed state,
		// mirroring the selectedModel extraction used in the line-by-line path.
		const sessionDefaultModel = (
			sessionState.selectedModel?.identifier ||
			sessionState.selectedModel?.metadata?.id ||
			sessionState.inputState?.selectedModel?.metadata?.id ||
			'gpt-4o'
		).replace(/^copilot\//, '');

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

	// Extract thinking effort (reasoning effort) from delta lines
	{
		const { effortByRequestId, defaultEffort, switchCount: effortSwitchCount } = buildReasoningEffortTimeline(lines);
		if (defaultEffort !== null || effortByRequestId.size > 0) {
			const byEffort: { [effort: string]: number } = {};
			for (const [, effort] of effortByRequestId) {
				byEffort[effort] = (byEffort[effort] || 0) + 1;
			}
			// If we have a defaultEffort but no per-request data, record it as the session default
			if (effortByRequestId.size === 0 && defaultEffort !== null) {
				byEffort[defaultEffort] = requests.length;
			}
			analysis.thinkingEffort = { byEffort, switchCount: effortSwitchCount, defaultEffort };
		}
	}


	// Derive conversation patterns from mode usage
	deriveConversationPatterns(analysis);
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
	// Detect session mode and count interactions per request
	if (sessionContent.requests && Array.isArray(sessionContent.requests)) {
		for (const requestRaw of sessionContent.requests) {
			const request = requestRaw as SessionRequestRaw;
			// Determine mode for each individual request
			let requestMode = 'ask'; // default

			// Check request-level agent ID first (more specific)
			if (request.agent?.id) {
				const agentId = request.agent.id.toLowerCase();
				if (agentId.includes('edit')) {
					requestMode = 'edit';
				} else if (agentId.includes('agent')) {
					requestMode = 'agent';
				}
			}
			// Fall back to session-level mode if no request-specific agent
			else if (sessionContent.mode?.id) {
				const modeId = sessionContent.mode.id.toLowerCase();
				if (modeId.includes('agent')) {
					requestMode = 'agent';
				} else if (modeId.includes('edit')) {
					requestMode = 'edit';
				}
			}

			// Count this request in the appropriate mode
			if (requestMode === 'agent') {
				analysis.modeUsage.agent++;
			} else if (requestMode === 'edit') {
				analysis.modeUsage.edit++;
			} else {
				analysis.modeUsage.ask++;
			}

			// Analyze all context references from this request
			analyzeRequestContext(request, analysis.contextReferences);

			// Analyze response for tool calls and MCP tools
			if (request.response && Array.isArray(request.response)) {
				for (const responseItemRaw of request.response as ResponseItemRaw[]) {
					if (!responseItemRaw) { continue; }
					const responseItem = responseItemRaw;
					// Detect tool invocations
					if (responseItem.kind === 'toolInvocationSerialized' ||
						responseItem.kind === 'prepareToolInvocation') {
						const toolName = responseItem.toolId ||
							responseItem.toolName ||
							responseItem.invocationMessage?.toolName ||
							'unknown';

						// Route to MCP or regular tool counters
						recordToolOrMcpInvocation(toolName, analysis, deps.toolNameMap);
					}

					// Detect MCP servers starting
					if (responseItem.kind === 'mcpServersStarting' && responseItem.didStartServerIds) {
						for (const serverId of responseItem.didStartServerIds) {
							analysis.mcpTools.total++;
							analysis.mcpTools.byServer[serverId] = (analysis.mcpTools.byServer[serverId] || 0) + 1;
						}
					}

					// Detect inline references in response items
					if (responseItem.kind === 'inlineReference' && responseItem.inlineReference) {
						// Treat response inlineReferences as contentReferences
						analyzeContentReferences([responseItem], analysis.contextReferences);
					}
				}
			}
		}
	}

}

/**
 * Merge usage analysis data into period stats
 */
export function mergeUsageAnalysis(period: UsageAnalysisPeriod, analysis: SessionUsageAnalysis): void {
	// Merge tool calls
	period.toolCalls.total += analysis.toolCalls.total;
	for (const [tool, count] of Object.entries(analysis.toolCalls.byTool)) {
		period.toolCalls.byTool[tool] = (period.toolCalls.byTool[tool] || 0) + count;
	}

	// Merge mode usage
	period.modeUsage.ask += analysis.modeUsage.ask;
	period.modeUsage.edit += analysis.modeUsage.edit;
	period.modeUsage.agent += analysis.modeUsage.agent;
	period.modeUsage.plan += analysis.modeUsage.plan;
	period.modeUsage.customAgent += analysis.modeUsage.customAgent;
	period.modeUsage.cli += analysis.modeUsage.cli;

	// Merge context references
	period.contextReferences.file += analysis.contextReferences.file;
	period.contextReferences.selection += analysis.contextReferences.selection;
	period.contextReferences.implicitSelection += analysis.contextReferences.implicitSelection || 0;
	period.contextReferences.symbol += analysis.contextReferences.symbol;
	period.contextReferences.codebase += analysis.contextReferences.codebase;
	period.contextReferences.workspace += analysis.contextReferences.workspace;
	period.contextReferences.terminal += analysis.contextReferences.terminal;
	period.contextReferences.vscode += analysis.contextReferences.vscode;
	period.contextReferences.terminalLastCommand += analysis.contextReferences.terminalLastCommand || 0;
	period.contextReferences.terminalSelection += analysis.contextReferences.terminalSelection || 0;
	period.contextReferences.clipboard += analysis.contextReferences.clipboard || 0;
	period.contextReferences.changes += analysis.contextReferences.changes || 0;
	period.contextReferences.outputPanel += analysis.contextReferences.outputPanel || 0;
	period.contextReferences.problemsPanel += analysis.contextReferences.problemsPanel || 0;
	period.contextReferences.pullRequest += analysis.contextReferences.pullRequest || 0;

	// Merge contentReferences counts
	period.contextReferences.copilotInstructions += analysis.contextReferences.copilotInstructions || 0;
	period.contextReferences.agentsMd += analysis.contextReferences.agentsMd || 0;

	// Merge byKind tracking
	for (const [kind, count] of Object.entries(analysis.contextReferences.byKind || {})) {
		period.contextReferences.byKind[kind] = (period.contextReferences.byKind[kind] || 0) + count;
	}

	// Merge byPath tracking
	for (const [path, count] of Object.entries(analysis.contextReferences.byPath || {})) {
		period.contextReferences.byPath[path] = (period.contextReferences.byPath[path] || 0) + count;
	}

	// Merge MCP tools
	period.mcpTools.total += analysis.mcpTools.total;
	for (const [server, count] of Object.entries(analysis.mcpTools.byServer)) {
		period.mcpTools.byServer[server] = (period.mcpTools.byServer[server] || 0) + count;
	}
	for (const [tool, count] of Object.entries(analysis.mcpTools.byTool)) {
		period.mcpTools.byTool[tool] = (period.mcpTools.byTool[tool] || 0) + count;
	}

	// Merge model switching data
	// Ensure modelSwitching exists (backward compatibility with old cache)
	if (!analysis.modelSwitching) {
		analysis.modelSwitching = {
			uniqueModels: [],
			modelCount: 0,
			switchCount: 0,
			tiers: { standard: [], premium: [], unknown: [] },
			hasMixedTiers: false,
			standardRequests: 0,
			premiumRequests: 0,
			unknownRequests: 0,
			totalRequests: 0
		};
	}

	// Only count sessions with at least 1 model detected for model switching stats
	// Sessions without detected models (modelCount === 0) should not affect the average
	if (analysis.modelSwitching.modelCount > 0) {
		period.modelSwitching.totalSessions++;
		period.modelSwitching.modelsPerSession.push(analysis.modelSwitching.modelCount);

		// Track unique models by tier
		for (const model of analysis.modelSwitching.tiers.standard) {
			if (!period.modelSwitching.standardModels.includes(model)) {
				period.modelSwitching.standardModels.push(model);
			}
		}
		for (const model of analysis.modelSwitching.tiers.premium) {
			if (!period.modelSwitching.premiumModels.includes(model)) {
				period.modelSwitching.premiumModels.push(model);
			}
		}
		for (const model of analysis.modelSwitching.tiers.unknown) {
			if (!period.modelSwitching.unknownModels.includes(model)) {
				period.modelSwitching.unknownModels.push(model);
			}
		}

		// Count sessions with mixed tiers
		if (analysis.modelSwitching.hasMixedTiers) {
			period.modelSwitching.mixedTierSessions++;
		}

		// Aggregate request counts per tier
		period.modelSwitching.standardRequests += analysis.modelSwitching.standardRequests || 0;
		period.modelSwitching.premiumRequests += analysis.modelSwitching.premiumRequests || 0;
		period.modelSwitching.unknownRequests += analysis.modelSwitching.unknownRequests || 0;
		period.modelSwitching.totalRequests += analysis.modelSwitching.totalRequests || 0;

		// Calculate aggregate statistics
		if (period.modelSwitching.modelsPerSession.length > 0) {
			const counts = period.modelSwitching.modelsPerSession;
			period.modelSwitching.averageModelsPerSession = counts.reduce((a, b) => a + b, 0) / counts.length;
			period.modelSwitching.maxModelsPerSession = Math.max(...counts);
			period.modelSwitching.minModelsPerSession = Math.min(...counts);
			period.modelSwitching.switchingFrequency = (counts.filter(c => c > 1).length / counts.length) * 100;
		}
	}
	
	// Merge new enhanced metrics
	if (analysis.editScope) {
		period.editScope.singleFileEdits += analysis.editScope.singleFileEdits;
		period.editScope.multiFileEdits += analysis.editScope.multiFileEdits;
		period.editScope.totalEditedFiles += analysis.editScope.totalEditedFiles;
		// Recalculate average
		const editSessions = period.editScope.singleFileEdits + period.editScope.multiFileEdits;
		period.editScope.avgFilesPerSession = editSessions > 0 
			? period.editScope.totalEditedFiles / editSessions 
			: 0;
	}
	
	if (analysis.applyUsage) {
		period.applyUsage.totalApplies += analysis.applyUsage.totalApplies;
		period.applyUsage.totalCodeBlocks += analysis.applyUsage.totalCodeBlocks;
		// Recalculate apply rate
		period.applyUsage.applyRate = period.applyUsage.totalCodeBlocks > 0
			? (period.applyUsage.totalApplies / period.applyUsage.totalCodeBlocks) * 100
			: 0;
	}
	
	if (analysis.sessionDuration) {
		period.sessionDuration.totalDurationMs += analysis.sessionDuration.totalDurationMs;
		// Calculate avgDurationMs as total / sessionCount
		const sessionCount = period.sessions;
		if (sessionCount > 0) {
			period.sessionDuration.avgDurationMs = period.sessionDuration.totalDurationMs / sessionCount;
			
			// For other timing metrics, use weighted averaging (approximation across per-session averages)
			const prevAvgFirstProgress = period.sessionDuration.avgFirstProgressMs * (sessionCount - 1);
			period.sessionDuration.avgFirstProgressMs = (prevAvgFirstProgress + analysis.sessionDuration.avgFirstProgressMs) / sessionCount;
			
			const prevAvgTotalElapsed = period.sessionDuration.avgTotalElapsedMs * (sessionCount - 1);
			period.sessionDuration.avgTotalElapsedMs = (prevAvgTotalElapsed + analysis.sessionDuration.avgTotalElapsedMs) / sessionCount;
			
			const prevAvgWaitTime = period.sessionDuration.avgWaitTimeMs * (sessionCount - 1);
			period.sessionDuration.avgWaitTimeMs = (prevAvgWaitTime + analysis.sessionDuration.avgWaitTimeMs) / sessionCount;
		}
	}
	
	if (analysis.conversationPatterns) {
		period.conversationPatterns.multiTurnSessions += analysis.conversationPatterns.multiTurnSessions;
		period.conversationPatterns.singleTurnSessions += analysis.conversationPatterns.singleTurnSessions;
		period.conversationPatterns.maxTurnsInSession = Math.max(
			period.conversationPatterns.maxTurnsInSession,
			analysis.conversationPatterns.maxTurnsInSession
		);
		// Calculate average turns by summing total turns across all sessions
		const totalSessions = period.conversationPatterns.multiTurnSessions + period.conversationPatterns.singleTurnSessions;
		if (totalSessions > 0) {
			// Reconstruct previous total turns from previous average
			const prevTotalTurns = period.conversationPatterns.avgTurnsPerSession * (totalSessions - 1);
			// Add current session's turn count (which is stored in avgTurnsPerSession for single session)
			const newTotalTurns = prevTotalTurns + analysis.conversationPatterns.avgTurnsPerSession;
			// Calculate true average
			period.conversationPatterns.avgTurnsPerSession = newTotalTurns / totalSessions;
		}
	}
	
	if (analysis.agentTypes) {
		period.agentTypes.editsAgent += analysis.agentTypes.editsAgent;
		period.agentTypes.defaultAgent += analysis.agentTypes.defaultAgent;
		period.agentTypes.workspaceAgent += analysis.agentTypes.workspaceAgent;
		period.agentTypes.other += analysis.agentTypes.other;
	}

	if (analysis.thinkingEffort) {
		if (!period.thinkingEffortUsage) {
			period.thinkingEffortUsage = { byEffort: {}, sessionCount: 0, switchCount: 0 };
		}
		period.thinkingEffortUsage.sessionCount++;
		period.thinkingEffortUsage.switchCount += analysis.thinkingEffort.switchCount;
		for (const [effort, count] of Object.entries(analysis.thinkingEffort.byEffort)) {
			period.thinkingEffortUsage.byEffort[effort] = (period.thinkingEffortUsage.byEffort[effort] || 0) + count;
		}
	}
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

/** Mutable mode state passed through JSONL event handlers. */
type AsuModeState = { sessionMode: string };
/** Mutable CLI tracking state passed through JSONL event handlers. */
type AsuCliState = {
	defaultModel: string;
	defaultEffort: string | null;
	requestCount: number;
	effortByRequest: { [effort: string]: number };
};

/** Check if the first JSONL line indicates a delta-based VS Code incremental format. */
function _asuIsDeltaBased(lines: string[]): boolean {
	if (lines.length === 0) { return false; }
	try {
		const first = JSON.parse(lines[0]);
		return first && typeof first.kind === 'number';
	} catch { return false; }
}

/** Reconstruct delta state from all lines and dispatch to processDeltaSessionAnalysis. */
function _asuReconstructAndProcessDeltaState(
	deps: UsageAnalysisDeps,
	lines: string[],
	analysis: SessionUsageAnalysis
): void {
	let sessionState: DeltaSessionState = {};
	for (const line of lines) {
		try {
			const delta = JSON.parse(line);
			sessionState = applyDelta(sessionState, delta) as DeltaSessionState;
		} catch { /* skip invalid lines */ }
	}
	processDeltaSessionAnalysis(deps, sessionState, lines, analysis);
}

/** Check if a selection range represents an actual selection (not just cursor position). */
function _asuCheckImplicitSelection(selections: unknown[], refs: ContextReferenceUsage): void {
	for (const sel of selections) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const s = sel as any;
		if (s && (s.startLineNumber !== s.endLineNumber || s.startColumn !== s.endColumn)) {
			refs.implicitSelection++;
			break;
		}
	}
}

/** Handle VS Code incremental format kind=0 (session header) events. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuHandleKind0Event(event: any, analysis: SessionUsageAnalysis, modeState: AsuModeState): void {
	if (event.kind !== 0 || !event.v?.inputState?.mode) { return; }
	modeState.sessionMode = getModeType(event.v.inputState.mode);
	if (!Array.isArray(event.v?.inputState?.selections)) { return; }
	_asuCheckImplicitSelection(event.v.inputState.selections, analysis.contextReferences);
}

/** Handle VS Code incremental format kind=1 (incremental update) events. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuHandleKind1Event(event: any, analysis: SessionUsageAnalysis, modeState: AsuModeState): void {
	if (event.kind !== 1) { return; }
	if (event.k?.includes('mode') && event.v) { modeState.sessionMode = getModeType(event.v); }
	if (event.k?.includes('selections') && Array.isArray(event.v)) {
		_asuCheckImplicitSelection(event.v, analysis.contextReferences);
	}
	if (event.k?.includes('contentReferences') && Array.isArray(event.v)) {
		analyzeContentReferences(event.v, analysis.contextReferences);
	}
	if (event.k?.includes('variableData') && event.v) {
		analyzeVariableData(event.v, analysis.contextReferences);
	}
}

/** Extract the tool name from a response item. */
function _asuExtractToolName(item: ResponseItemRaw): string {
	return item.toolId || item.toolName || item.invocationMessage?.toolName || item.toolSpecificData?.kind || 'unknown';
}

/** Record tool invocations from a full response array (kind=2 with requests). */
function _asuProcessResponseItems(items: ResponseItemRaw[], analysis: SessionUsageAnalysis): void {
	for (const item of items) {
		if (!item) { continue; }
		if (item.kind === 'toolInvocationSerialized' || item.kind === 'prepareToolInvocation') {
			analysis.toolCalls.total++;
			const toolName = _asuExtractToolName(item);
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}
	}
}

/** Record tool invocations from a response update array (kind=2 with response). */
function _asuProcessResponseUpdates(items: unknown[], analysis: SessionUsageAnalysis): void {
	for (const responseItem of items) {
		const item = responseItem as ResponseItemRaw;
		if (!item) { continue; }
		if (item.kind === 'toolInvocationSerialized') {
			analysis.toolCalls.total++;
			const toolName = _asuExtractToolName(item);
			analysis.toolCalls.byTool[toolName] = (analysis.toolCalls.byTool[toolName] || 0) + 1;
		}
	}
}

/** Process a single request from a kind=2 requests array. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuProcessRequest(request: any, analysis: SessionUsageAnalysis, sessionMode: string): void {
	if (request.requestId) { incrementModeUsage(sessionMode, analysis.modeUsage); }
	if (request.agent?.id) {
		analysis.toolCalls.total++;
		analysis.toolCalls.byTool[request.agent.id] = (analysis.toolCalls.byTool[request.agent.id] || 0) + 1;
	}
	analyzeRequestContext(request, analysis.contextReferences);
	if (request.response && Array.isArray(request.response)) {
		_asuProcessResponseItems(request.response, analysis);
	}
}

/** Handle VS Code incremental format kind=2 (batch add) events. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuHandleKind2Event(event: any, analysis: SessionUsageAnalysis, modeState: AsuModeState, toolNameMap: { [key: string]: string }): void {
	if (event.kind !== 2) { return; }
	if (event.k?.[0] === 'requests' && Array.isArray(event.v)) {
		for (const request of event.v) {
			_asuProcessRequest(request, analysis, modeState.sessionMode);
		}
	}
	if (event.k?.includes('response') && Array.isArray(event.v)) {
		_asuProcessResponseUpdates(event.v, analysis);
	}
}

/** Handle Copilot CLI events (session.start, session.model_change, user.message). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuProcessCliEvents(event: any, cliState: AsuCliState, analysis: SessionUsageAnalysis, jetBrainsMode: JetBrainsMode | null): void {
	if (event.type === 'session.start' && event.data) {
		if (typeof event.data.selectedModel === 'string') { cliState.defaultModel = event.data.selectedModel; }
		if (typeof event.data.reasoningEffort === 'string') { cliState.defaultEffort = event.data.reasoningEffort; }
	}
	if (event.type === 'session.model_change' && typeof event.data?.newModel === 'string') {
		cliState.defaultModel = event.data.newModel;
	}
	if (event.type === 'user.message') {
		cliState.requestCount++;
		const effort = typeof event.data?.reasoningEffort === 'string' ? event.data.reasoningEffort : cliState.defaultEffort;
		if (effort) { cliState.effortByRequest[effort] = (cliState.effortByRequest[effort] || 0) + 1; }
		if (jetBrainsMode === 'agent') { analysis.modeUsage.agent++; }
		else if (jetBrainsMode === 'ask') { analysis.modeUsage.ask++; }
		else { analysis.modeUsage.cli++; }
	}
}

/** Handle tool.call / tool.result / tool.execution_start events. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuHandleToolCallEvent(event: any, analysis: SessionUsageAnalysis, toolNameMap: { [key: string]: string }): void {
	if (event.type !== 'tool.call' && event.type !== 'tool.result' && event.type !== 'tool.execution_start') { return; }
	const toolName = event.data?.toolName || event.toolName || 'unknown';
	recordToolOrMcpInvocation(toolName, analysis, toolNameMap);
}

/** Handle mcp.tool.call events and events with data.mcpServer set. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuHandleMcpToolEvent(event: any, analysis: SessionUsageAnalysis): void {
	if (event.type !== 'mcp.tool.call' && !event.data?.mcpServer) { return; }
	analysis.mcpTools.total++;
	const serverName = event.data?.mcpServer || 'unknown';
	const mcpToolName = event.data?.toolName || event.toolName || 'unknown';
	analysis.mcpTools.byServer[serverName] = (analysis.mcpTools.byServer[serverName] || 0) + 1;
	const normalizedMcpTool = normalizeMcpToolName(mcpToolName);
	analysis.mcpTools.byTool[normalizedMcpTool] = (analysis.mcpTools.byTool[normalizedMcpTool] || 0) + 1;
}

/** Handle tool.call / tool.result / mcp.tool.call events. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuHandleToolAndMcpEvents(event: any, analysis: SessionUsageAnalysis, toolNameMap: { [key: string]: string }): void {
	_asuHandleToolCallEvent(event, analysis, toolNameMap);
	_asuHandleMcpToolEvent(event, analysis);
}

/** Dispatch a single JSONL event to the appropriate event handlers. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function _asuProcessJsonlEvent(event: any, analysis: SessionUsageAnalysis, modeState: AsuModeState, cliState: AsuCliState, jetBrainsMode: JetBrainsMode | null, toolNameMap: { [key: string]: string }): void {
	_asuHandleKind0Event(event, analysis, modeState);
	_asuHandleKind1Event(event, analysis, modeState);
	_asuHandleKind2Event(event, analysis, modeState, toolNameMap);
	_asuProcessCliEvents(event, cliState, analysis, jetBrainsMode);
	_asuHandleToolAndMcpEvents(event, analysis, toolNameMap);
}

/** Store CLI thinking effort data from the accumulated CLI state. */
function _asuApplyCliThinkingEffort(cliState: AsuCliState, analysis: SessionUsageAnalysis): void {
	if (cliState.defaultEffort === null && Object.keys(cliState.effortByRequest).length === 0) { return; }
	const byEffort = Object.keys(cliState.effortByRequest).length > 0
		? cliState.effortByRequest
		: (cliState.defaultEffort !== null ? { [cliState.defaultEffort]: cliState.requestCount } : {});
	analysis.thinkingEffort = { byEffort, switchCount: 0, defaultEffort: cliState.defaultEffort };
}

/** Process a non-delta JSONL session file (Copilot CLI or VS Code incremental). */
async function _asuProcessNonDeltaJsonl(
	deps: UsageAnalysisDeps,
	sessionFile: string,
	lines: string[],
	fileContent: string,
	analysis: SessionUsageAnalysis
): Promise<void> {
	const modeState: AsuModeState = { sessionMode: 'ask' };
	const cliState: AsuCliState = { defaultModel: 'unknown', defaultEffort: null, requestCount: 0, effortByRequest: {} };
	const isJetBrains = isJetBrainsSessionPath(sessionFile);
	const jetBrainsMode: JetBrainsMode | null = isJetBrains ? detectJetBrainsModeFromContent(fileContent) : null;

	for (const line of lines) {
		if (!line.trim()) { continue; }
		try {
			const event = JSON.parse(line);
			_asuProcessJsonlEvent(event, analysis, modeState, cliState, jetBrainsMode, deps.toolNameMap);
		} catch { /* skip malformed lines */ }
	}

	_asuApplyCliThinkingEffort(cliState, analysis);
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
			if (_asuIsDeltaBased(lines)) {
				_asuReconstructAndProcessDeltaState(deps, lines, analysis);
				return analysis;
			}
			await _asuProcessNonDeltaJsonl(deps, sessionFile, lines, fileContent, analysis);
		} else {
			const parsed: unknown = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
			if (!isParsedSessionJson(parsed)) {
				deps.warn(`Unexpected session format in ${sessionFile}`);
				return analysis;
			}
			processJsonSessionRequests(deps, parsed, analysis);
			await calculateModelSwitching(deps, sessionFile, analysis, fileContent, preloadedParsedJson);
			await trackEnhancedMetrics(deps, sessionFile, analysis, fileContent, preloadedParsedJson);
		}
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

export async function getModelUsageFromSession(deps: Pick<UsageAnalysisDeps, 'warn' | 'tokenEstimators' | 'modelPricing' | 'ecosystems'>, sessionFile: string, preloadedContent?: string, preloadedParsedJson?: unknown): Promise<ModelUsage> {
	const modelUsage: ModelUsage = {};

	// Dispatch to ecosystem adapter when available
	if (deps.ecosystems) {
		const eco = deps.ecosystems.find(e => e.handles(sessionFile));
		if (eco) { return eco.getModelUsage(sessionFile); }
	}

	const fileName = sessionFile.split(/[/\\]/).pop() || sessionFile;

	try {
		const fileContent = preloadedContent ?? await fs.promises.readFile(sessionFile, 'utf8');

		// Check if this is a UUID-only file (new Copilot CLI format)
		if (isUuidPointerFile(fileContent)) {
			return modelUsage; // Empty model usage for pointer files
		}

		// Detect JSONL content: either by extension or by content analysis
		const isJsonl = sessionFile.endsWith('.jsonl') || isJsonlContent(fileContent);

		// Handle .jsonl files OR .json files with JSONL content (Copilot CLI format and VS Code incremental format)
		if (isJsonl) {
			const lines = fileContent.trim().split('\n');
			// Default model for CLI sessions - 'unknown' when we can't determine the model
			let defaultModel = 'unknown';

			// For delta-based formats, reconstruct state to extract actual usage
			let sessionState: DeltaSessionState = {};
			let isDeltaBased = false;
			// For CLI (non-delta) sessions: capture exact per-model usage from session.shutdown
			let cliShutdownModelUsage: ModelUsage | null = null;
			// Real outputTokens from assistant.message events (used when session.shutdown is absent)
			let cliRealOutputByModel: { [model: string]: number } | null = null;
			let totalCliToolCalls = 0;

			for (const line of lines) {
				if (!line.trim()) { continue; }
				try {
					const event = JSON.parse(line);

					// Detect and reconstruct delta-based format
					if (typeof event.kind === 'number') {
						isDeltaBased = true;
						sessionState = applyDelta(sessionState, event) as DeltaSessionState;
					}

					// Copilot CLI session.start carries the selected model
					if (event.type === 'session.start' && typeof event.data?.selectedModel === 'string') {
						defaultModel = event.data.selectedModel;
					}

					// Copilot CLI: session.model_change carries the currently active model
					if (event.type === 'session.model_change' && typeof event.data?.newModel === 'string') {
						defaultModel = event.data.newModel;
					}

					// Handle VS Code incremental format - extract model from session header (kind: 0)
					// The schema has v.selectedModel.identifier or v.selectedModel.metadata.id
					if (event.kind === 0) {
						const modelId = event.v?.selectedModel?.identifier ||
							event.v?.selectedModel?.metadata?.id ||
							// Legacy fallback: older Copilot Chat session logs stored selectedModel under v.inputState.
							// This is kept for backward compatibility so we can still read existing logs from those versions.
							event.v?.inputState?.selectedModel?.metadata?.id;
						if (modelId) {
							defaultModel = modelId.replace(/^copilot\//, '');
						}
					}

					// Handle model changes (kind: 2 with selectedModel update, NOT kind: 1 which is delete)
					if (event.kind === 2 && event.k?.[0] === 'selectedModel') {
						const modelId = event.v?.identifier || event.v?.metadata?.id;
						if (modelId) {
							defaultModel = modelId.replace(/^copilot\//, '');
						}
					}

					// Resolve per-event model: assistant.message carries model in data.model
					const model = event.data?.model || event.model || defaultModel;

					if (!modelUsage[model]) {
						modelUsage[model] = { inputTokens: 0, outputTokens: 0 };
					}

					// For non-delta formats, estimate from event text (CLI format)
					if (!isDeltaBased) {
						// Copilot CLI: session.shutdown has exact per-model token totals.
						// A single events.jsonl can contain multiple session segments (e.g. resumed
						// sessions), each ending with its own shutdown event. Accumulate across all
						// shutdown events so no segment's tokens are lost.
						if (event.type === 'session.shutdown' && event.data?.modelMetrics) {
							if (!cliShutdownModelUsage) { cliShutdownModelUsage = {}; }
							for (const [modelName, metrics] of Object.entries(event.data.modelMetrics as Record<string, { usage?: { inputTokens?: number; outputTokens?: number; cacheReadTokens?: number; cacheWriteTokens?: number } }>)) {
								const usage = metrics?.usage;
								if (usage) {
									if (!cliShutdownModelUsage[modelName]) {
										cliShutdownModelUsage[modelName] = { inputTokens: 0, outputTokens: 0 };
									}
									cliShutdownModelUsage[modelName].inputTokens += typeof usage.inputTokens === 'number' ? usage.inputTokens : 0;
									cliShutdownModelUsage[modelName].outputTokens += typeof usage.outputTokens === 'number' ? usage.outputTokens : 0;
									// Cache breakdown — inputTokens is the total (uncached + reads + writes).
									// Populate these so calculateEstimatedCost can apply the correct discount rates.
									const cacheRead = typeof usage.cacheReadTokens === 'number' ? usage.cacheReadTokens : 0;
									const cacheWrite = typeof usage.cacheWriteTokens === 'number' ? usage.cacheWriteTokens : 0;
									if (cacheRead > 0) {
										cliShutdownModelUsage[modelName].cachedReadTokens = (cliShutdownModelUsage[modelName].cachedReadTokens ?? 0) + cacheRead;
									}
									if (cacheWrite > 0) {
										cliShutdownModelUsage[modelName].cacheCreationTokens = (cliShutdownModelUsage[modelName].cacheCreationTokens ?? 0) + cacheWrite;
									}
								}
							}
						} else if (event.type === 'user.message' && event.data?.content) {
							modelUsage[model].inputTokens += estimateTokensFromText(event.data.content, model, deps.tokenEstimators);
						} else if (event.type === 'assistant.message') {
							const realOutput = typeof event.data?.outputTokens === 'number' ? event.data.outputTokens : 0;
							if (realOutput > 0) {
								if (!cliRealOutputByModel) { cliRealOutputByModel = {}; }
								cliRealOutputByModel[model] = (cliRealOutputByModel[model] ?? 0) + realOutput;
							} else if (event.data?.content) {
								modelUsage[model].outputTokens += estimateTokensFromText(event.data.content, model, deps.tokenEstimators);
							}
						} else if (event.type === 'tool.execution_start') {
							totalCliToolCalls++;
						} else if (event.type === 'tool.execution_complete' && (event.data?.result?.content || event.data?.result?.detailedContent)) {
							// Tool outputs are fed back as input context in the next turn
							const toolContent = event.data.result.content || event.data.result.detailedContent;
							modelUsage[model].inputTokens += estimateTokensFromText(String(toolContent), model, deps.tokenEstimators);
						}
					}
				} catch (e) {
					// Skip malformed lines
				}
			}

			// If CLI session.shutdown provided exact per-model data, use it instead of estimates
			if (!isDeltaBased && cliShutdownModelUsage) {
				return cliShutdownModelUsage;
			}

			// No session.shutdown: estimate input from the content already accumulated (user
			// messages + tool outputs), scaled by a context-growth factor that accounts for
			// the full conversation history being re-sent on every API call.
			// Each call sends ≈ all previous content, so average input per call grows as
			// (numTurns+1)/2 × per-turn content. Tool-call count ÷ 2 approximates turn count
			// for typical agentic sessions (~2 tool calls per turn on average).
			// This avoids the massive overcount of the old output-ratio approach (up to 130×)
			// while still reflecting that context accumulates across turns.
			if (!isDeltaBased && cliRealOutputByModel) {
				const numTurns = Math.max(1, Math.round(totalCliToolCalls / 2));
				const contextFactor = Math.max(1, (numTurns + 1) / 2);
				const estimatedUsage: ModelUsage = {};
				for (const [m, realOutput] of Object.entries(cliRealOutputByModel)) {
					const accumulatedInput = modelUsage[m]?.inputTokens ?? 0;
					estimatedUsage[m] = {
						inputTokens: Math.round(accumulatedInput * contextFactor),
						outputTokens: realOutput,
						// cachedReadTokens intentionally omitted: cannot estimate reliably without shutdown data
					};
				}
				return estimatedUsage;
			}

			// For delta-based formats, extract actual usage from reconstructed state
			if (isDeltaBased && sessionState.requests && Array.isArray(sessionState.requests)) {
				for (const requestRaw of sessionState.requests) {
					if (!requestRaw) { continue; }
					const request = requestRaw as SessionRequestRaw;
					if (!request.requestId) { continue; }

					// Extract request-level modelId
					let requestModel = defaultModel;
					if (request.modelId) {
						requestModel = request.modelId.replace(/^copilot\//, '');
					} else if (request.result?.metadata?.modelId) {
						requestModel = request.result.metadata.modelId.replace(/^copilot\//, '');
					} else if (request.result?.details) {
						requestModel = getModelFromRequest(request, deps.modelPricing);
					}

					if (!modelUsage[requestModel]) {
						modelUsage[requestModel] = { inputTokens: 0, outputTokens: 0 };
					}

					// Use actual usage if available, otherwise estimate from text
					if (!tryExtractExactTokenUsage(request, requestModel, modelUsage)) {
						// Fallback: estimate from message text and response content
						if (request.message?.text) {
							modelUsage[requestModel].inputTokens += estimateTokensFromText(request.message.text, requestModel, deps.tokenEstimators);
						}
						if (request.response && Array.isArray(request.response)) {
							for (const responseItem of request.response as ResponseItemRaw[]) {
								// Thinking counts as output for model usage; ignore isThinking flag
								const { text } = extractResponseItemText(responseItem);
								if (text) {
									modelUsage[requestModel].outputTokens += estimateTokensFromText(text, requestModel, deps.tokenEstimators);
								}
							}
						}
					}

					// Sub-agent invocations are additive: not included in parent actual token counts
					if (request.response && Array.isArray(request.response)) {
						accumulateSubAgentTokenUsage(request.response as ResponseItemRaw[], requestModel, modelUsage, deps.tokenEstimators);
					}
				}
			}

			// FALLBACK: If reconstruction missed result data, use regex extraction from raw lines
			const rawModelUsage = extractPerRequestUsageFromRawLines(lines);
			for (const [reqIdx, extracted] of rawModelUsage) {
				const request = sessionState.requests?.[reqIdx] as SessionRequestRaw | undefined;
				if (!request) { continue; }
				// Only use regex fallback if reconstruction didn't already provide usage
				if (request.result?.usage || (typeof request.result?.promptTokens === 'number') || (request.result?.metadata && typeof request.result.metadata.promptTokens === 'number')) { continue; }
				let requestModel = defaultModel;
				if (request.modelId) { requestModel = request.modelId.replace(/^copilot\//, ''); }
				if (!modelUsage[requestModel]) { modelUsage[requestModel] = { inputTokens: 0, outputTokens: 0 }; }
				modelUsage[requestModel].inputTokens += extracted.promptTokens;
				modelUsage[requestModel].outputTokens += extracted.outputTokens;
			}

			return modelUsage;
		}

		// Handle regular .json files
		const parsed: unknown = preloadedParsedJson !== undefined ? preloadedParsedJson : JSON.parse(fileContent);
		if (!isParsedSessionJson(parsed)) {
			deps.warn(`Unexpected session format in ${sessionFile}`);
			return modelUsage;
		}
		const sessionContent = parsed;

		if (sessionContent.requests && Array.isArray(sessionContent.requests)) {
			for (const requestRaw of sessionContent.requests) {
				const request = requestRaw as SessionRequestRaw;
				// Get model for this request
				const model = getModelFromRequest(request, deps.modelPricing);

				// Initialize model if not exists
				if (!modelUsage[model]) {
					modelUsage[model] = { inputTokens: 0, outputTokens: 0 };
				}

				// Use actual usage if available, otherwise estimate from text
				if (!tryExtractExactTokenUsage(request, model, modelUsage)) {
					// Fallback: estimate from message parts and response content
					if (request.message && request.message.parts) {
						for (const part of request.message.parts) {
							if (part.text) {
								modelUsage[model].inputTokens += estimateTokensFromText(part.text, model, deps.tokenEstimators);
							}
						}
					}
					if (request.response && Array.isArray(request.response)) {
						for (const responseItem of request.response as ResponseItemRaw[]) {
							// Thinking counts as output for model usage; ignore isThinking flag
							const { text } = extractResponseItemText(responseItem);
							if (text) {
								modelUsage[model].outputTokens += estimateTokensFromText(text, model, deps.tokenEstimators);
							}
						}
					}
				}

				// Sub-agent invocations are additive: not included in parent actual token counts
				if (request.response && Array.isArray(request.response)) {
					accumulateSubAgentTokenUsage(request.response as ResponseItemRaw[], model, modelUsage, deps.tokenEstimators);
				}
			}
		}
	} catch (error) {
		deps.warn(`Error getting model usage from ${sessionFile}: ${error}`);
	}

	return modelUsage;
}



