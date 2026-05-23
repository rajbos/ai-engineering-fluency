// Log Viewer webview - displays session file details and chat turns
import { ContextReferenceUsage, getTotalContextRefs, getImplicitContextRefs, getExplicitContextRefs, getContextRefsSummary } from '../shared/contextRefUtils';
import { escapeHtml, formatCompact, formatFileSize, setCompactNumbers } from '../shared/formatUtils';
import { getModelDisplayName } from '../shared/modelUtils';
import type { McpToolUsage, ModeUsage, ToolCallUsage } from '../shared/types';
// CSS imported as text via esbuild
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../shared/dataLoader';

// ── Type definitions ──────────────────────────────────────────────────────────

type PromptTokenDetail = {
category: string;
label: string;
percentageOfPrompt: number;
};

type ActualUsage = {
completionTokens: number;
promptTokens: number;
promptTokenDetails?: PromptTokenDetail[];
details?: string;
};

/** A single tool call entry recorded in a chat turn. */
type ToolCall = {
toolName: string;
arguments?: string;
result?: string;
isSubAgent?: boolean;
subAgentModel?: string;
subAgentTokens?: { input: number; output: number };
};

type ChatTurn = {
turnNumber: number;
timestamp: string | null;
mode: 'ask' | 'edit' | 'agent' | 'plan' | 'customAgent';
userMessage: string;
assistantResponse: string;
model: string | null;
toolCalls: ToolCall[];
contextReferences: ContextReferenceUsage;
mcpTools: { server: string; tool: string }[];
inputTokensEstimate: number;
outputTokensEstimate: number;
thinkingTokensEstimate: number;
actualUsage?: ActualUsage;
thinkingEffort?: string;
};

type ThinkingEffortUsage = { byEffort: { [effort: string]: number }; switchCount: number; defaultEffort: string | null };
type SessionUsageAnalysis = {
toolCalls: ToolCallUsage;
modeUsage: ModeUsage;
contextReferences: ContextReferenceUsage;
mcpTools: McpToolUsage;
thinkingEffort?: ThinkingEffortUsage;
};

type SessionLogData = {
file: string;
title: string | null;
editorSource: string;
editorName: string;
size: number;
modified: string;
interactions: number;
contextReferences: ContextReferenceUsage;
firstInteraction: string | null;
lastInteraction: string | null;
turns: ChatTurn[];
usageAnalysis?: SessionUsageAnalysis;
/** Session-level actual token count from LLM API (e.g. CLI session.shutdown). 0 when unavailable. */
actualTokens?: number;
/** Cache-read token count from session.shutdown modelMetrics (CLI sessions only). Absent when unavailable. */
cachedTokens?: number;
/** Number of subagent sessions started (CLI format only). */
subAgentsStarted?: number;
/** Input token total from debug log (sum of all llm_request events). Present for VS Code Copilot Chat agent-mode sessions. */
debugLogInputTokens?: number;
/** Output token total from debug log (sum of all llm_request events). Present for VS Code Copilot Chat agent-mode sessions. */
debugLogOutputTokens?: number;
/** Number of LLM API calls made during the session (from debug log). >1 means agent-mode multi-call session. */
modelTurns?: number;
compactNumbers?: boolean;
};

/** Aggregated prompt-breakdown entry accumulated across all turns in a session. */
type BreakdownEntry = {
category: string;
label: string;
totalTokens: number;
totalPct: number;
count: number;
};

/**
 * A single row for `renderUsageComparisonTable`.
 * When `delta` is `undefined` the Delta column is omitted.
 */
type ComparisonRow = {
label: string;
estimated: number;
actual: number;
delta?: number;
isTotal?: boolean;
};

/** Pre-computed statistics passed to `renderSummaryCards`. */
type SummaryStats = {
totalTokens: number;
totalThinkingTokens: number;
totalSubAgentCalls: number;
turnsWithThinking: number;
hasAnyActualUsage: boolean;
hasSessionActualOnly: boolean;
actualTotal: number;
actualPromptTotal: number;
actualCompletionTotal: number;
sessionActualTokens: number;
usageToolTotal: number;
usageTopTools: { key: string; value: number }[];
usageMcpTotal: number;
usageTopMcpTools: { key: string; value: number }[];
usageContextTotal: number;
usageContextImplicit: number;
usageContextExplicit: number;
sessionEffort: ThinkingEffortUsage | undefined;
effortDefaultLabel: string;
effortSummary: string;
modeEntries: [keyof ModeUsage, number][];
totalModeTurns: number;
primaryModeLabel: string;
modeSubLabel: string;
};

// ── VS Code API bootstrap ────────────────────────────────────────────────────

declare function acquireVsCodeApi<TState = unknown>(): {
postMessage: (message: unknown) => void;
setState: (newState: TState) => void;
getState: () => TState | undefined;
};

declare global {
interface Window { __INITIAL_LOGDATA__?: SessionLogData; }
}

const vscode = acquireVsCodeApi();
const initialData = getWindowData<SessionLogData>('__INITIAL_LOGDATA__');

import toolNames from '../../toolNames.json';
import { resolveGuidMcpToolName } from '../../utils/toolUtils';

let TOOL_NAME_MAP: { [key: string]: string } | null = toolNames || null;

// ── Module-level constants ────────────────────────────────────────────────────

const EFFORT_DISPLAY_NAMES: Record<string, string> = {
xhigh: 'Extra High',
};

/** Human-readable labels for each editor mode. */
const MODE_LABELS: Record<string, string> = {
ask: 'Ask', edit: 'Edit', agent: 'Agent', plan: 'Plan', customAgent: 'Custom Agent', cli: 'CLI'
};

// ── Utility helpers ──────────────────────────────────────────────────────────

function lookupToolName(id: string): string {
if (!TOOL_NAME_MAP) {
return id;
}
return TOOL_NAME_MAP[id] ?? TOOL_NAME_MAP[id.toLowerCase()] ?? resolveGuidMcpToolName(id) ?? id;
}

function getEffortDisplayName(level: string): string {
return EFFORT_DISPLAY_NAMES[level] ?? level;
}

function formatDate(isoString: string | null): string {
if (!isoString) { return 'N/A'; }
try {
return new Date(isoString).toLocaleString();
} catch {
return isoString;
}
}

type ContextRefBadgeEntry = { key: keyof ContextReferenceUsage; label: string; implicit?: boolean };

const CONTEXT_REF_BADGE_ENTRIES: ContextRefBadgeEntry[] = [
	{ key: 'selection', label: '#selection' },
	{ key: 'file', label: '#file' },
	{ key: 'symbol', label: '#symbol' },
	{ key: 'codebase', label: '#codebase' },
	{ key: 'workspace', label: '@workspace' },
	{ key: 'terminal', label: '@terminal' },
	{ key: 'vscode', label: '@vscode' },
	{ key: 'terminalLastCommand', label: '#terminalLastCommand' },
	{ key: 'terminalSelection', label: '#terminalSelection' },
	{ key: 'clipboard', label: '#clipboard' },
	{ key: 'changes', label: '#changes' },
	{ key: 'outputPanel', label: '#outputPanel' },
	{ key: 'problemsPanel', label: '#problemsPanel' },
	{ key: 'pullRequest', label: '#pr' },
	{ key: 'implicitSelection', label: 'implicit', implicit: true },
];

function getContextRefBadges(refs: ContextReferenceUsage): string {
	return CONTEXT_REF_BADGE_ENTRIES
		.filter(e => ((refs[e.key] as number) || 0) > 0)
		.map(e => `<span class="context-ref-item${e.implicit ? ' context-ref-implicit' : ''}">${e.label}: <strong>${refs[e.key]}</strong></span>`)
		.join('');
}

function renderContextReferencesDetailed(refs: ContextReferenceUsage): string {
const rows: { category: string; name: string; count: number; type: 'implicit' | 'explicit' }[] = [];

// Implicit selections (implicit)
if (refs.implicitSelection > 0) {
rows.push({ category: '📝 Selection', name: 'editor selection', count: refs.implicitSelection, type: 'implicit' });
}

// File paths and symbols from byPath
if (refs.byPath && Object.keys(refs.byPath).length > 0) {
Object.entries(refs.byPath).forEach(([path, count]) => {
if (path.startsWith('#sym:')) {
// Symbols are explicit user references
rows.push({ category: '🔣 Symbol', name: path.substring(5), count, type: 'explicit' });
} else {
// Check if this is an instruction file (implicit) or regular file (explicit)
const normalizedPath = path.replace(/\\/g, '/').toLowerCase();
const isInstructionFile = normalizedPath.includes('copilot-instructions.md') || 
                          normalizedPath.endsWith('.instructions.md') ||
                          normalizedPath.endsWith('/agents.md');
if (isInstructionFile) {
rows.push({ category: '📋 Instructions', name: getFileName(path), count, type: 'implicit' });
} else {
// Regular file references are explicit
rows.push({ category: '📁 File', name: getFileName(path), count, type: 'explicit' });
}
}
});
}

// Instruction counters that aren't in byPath (fallback)
// Only show if we haven't already added instruction files from byPath
const hasInstructionFiles = rows.some(r => r.category === '📋 Instructions');
if (!hasInstructionFiles) {
if (refs.copilotInstructions > 0) {
rows.push({ category: '📋 Instructions', name: 'copilot-instructions', count: refs.copilotInstructions, type: 'implicit' });
}
if (refs.agentsMd > 0) {
rows.push({ category: '🤖 Agents', name: 'agents.md', count: refs.agentsMd, type: 'implicit' });
}
}

// Explicit @ references
if (refs.workspace > 0) {
rows.push({ category: '🌐 Workspace', name: '@workspace', count: refs.workspace, type: 'explicit' });
}
if (refs.terminal > 0) {
rows.push({ category: '💻 Terminal', name: '@terminal', count: refs.terminal, type: 'explicit' });
}
if (refs.vscode > 0) {
rows.push({ category: '⚙️ VS Code', name: '@vscode', count: refs.vscode, type: 'explicit' });
}
if (refs.codebase > 0) {
rows.push({ category: '📚 Codebase', name: '#codebase', count: refs.codebase, type: 'explicit' });
}
if (refs.selection > 0) {
rows.push({ category: '✂️ Selection', name: '#selection', count: refs.selection, type: 'explicit' });
}

if (rows.length === 0) {
return '<div class="context-section">No context references</div>';
}

// Build table
const tableRows = rows.map(row => {
const typeClass = row.type === 'implicit' ? 'context-type-implicit' : 'context-type-explicit';
const typeLabel = row.type === 'implicit' ? '🔒 implicit' : '👤 explicit';
return `<tr>
<td>${row.category}</td>
<td>${escapeHtml(row.name)}</td>
<td class="count-cell">${row.count}</td>
<td class="${typeClass}">${typeLabel}</td>
</tr>`;
}).join('');

return `
<table class="context-refs-table">
<thead>
<tr>
<th>Category</th>
<th>Reference</th>
<th>Count</th>
<th>Type</th>
</tr>
</thead>
<tbody>
${tableRows}
</tbody>
</table>
`;
}

function getTopEntries(map: { [key: string]: number } = {}, limit = 3): { key: string; value: number }[] {
return Object.entries(map)
.sort((a, b) => b[1] - a[1])
.slice(0, limit)
.map(([key, value]) => ({ key, value }));
}

function getModeIcon(mode: string): string {
switch (mode) {
case 'ask': return '💬';
case 'edit': return '✏️';
case 'agent': return '🤖';
case 'plan': return '📋';
case 'customAgent': return '⚡';
case 'cli': return '🖥️';
default: return '❓';
}
}

function getModeColor(mode: string): string {
switch (mode) {
case 'ask': return '#3b82f6';
case 'edit': return '#10b981';
case 'agent': return '#7c3aed';
case 'plan': return '#f59e0b';
case 'customAgent': return '#ec4899';
case 'cli': return '#06b6d4';
default: return '#888';
}
}

function getFileName(filePath: string): string {
const parts = filePath.split(/[/\\]/);
return parts[parts.length - 1];
}

function truncateText(text: string, maxLength: number): string {
if (text.length <= maxLength) { return text; }
return text.substring(0, maxLength) + '...';
}

/**
 * Render the per-turn model badge.
 *
 * JetBrains JSONL never persists the model selector, so the model field uses
 * sentinel suffixes/values to communicate uncertainty:
 *   • `"claude?"` / `"gpt?"` — first turn, family was inferred from the
 *     `tool.execution_start.toolCallId` prefix; specific version is unknown.
 *   • `"?"` — subsequent JetBrains turns where we have no per-turn signal at
 *     all (the user may have switched models partway through).
 *
 * Both variants render with an explanatory tooltip so users aren't misled.
 */
function renderTurnModelBadge(model: string): string {
if (model === '?') {
return `<span class="turn-model" title="Model not persisted in JetBrains session log; may differ from earlier turns if the user switched models.">🎯 ?</span>`;
}
if (model.endsWith('?')) {
const family = escapeHtml(model);
return `<span class="turn-model" title="JetBrains session logs only record the model family (inferred from the tool call ID prefix). Specific version isn't persisted.">🎯 ${family}</span>`;
}
return `<span class="turn-model">🎯 ${escapeHtml(getModelDisplayName(model))}</span>`;
}

// ── Delta comparison helpers ─────────────────────────────────────────────────

/** Returns '+' for positive numbers, '' for zero or negative. Used in delta comparisons. */
function deltaSign(n: number): string {
return n > 0 ? '+' : '';
}

/** Returns a CSS class name based on whether a delta is over, under, or zero. */
function deltaClass(n: number): string {
return n > 0 ? 'delta-over' : n < 0 ? 'delta-under' : 'delta-zero';
}

// ── Top-list formatters (used in summary cards) ──────────────────────────────

/**
 * Renders a top-N list as `<div>` rows.
 * @security All keys are passed through `escapeHtml`.
 */
function formatTopList(entries: { key: string; value: number }[], mapper?: (k: string) => string): string {
if (!entries.length) { return 'None'; }
return entries.map(e => `<div>${escapeHtml(mapper ? mapper(e.key) : e.key)}: ${e.value}</div>`).join('');
}

/**
 * Renders a top-N list with an "Other: N" row appended when the total exceeds the listed sum.
 * @security All keys are passed through `escapeHtml`.
 */
function formatTopListWithOther(entries: { key: string; value: number }[], total: number, mapper?: (k: string) => string): string {
if (!entries.length) { return 'None'; }
const lines = entries.map(e => `<div>${escapeHtml(mapper ? mapper(e.key) : e.key)}: ${e.value}</div>`);
const topSum = entries.reduce((sum, e) => sum + e.value, 0);
const other = total - topSum;
if (other > 0) {
lines.push(`<div>Other: ${other}</div>`);
}
return lines.join('');
}

// ── Shared render helpers ────────────────────────────────────────────────────

/**
 * Renders a `<table class="usage-comparison-table">` from structured row data.
 * The Delta column is included only when `showDelta` is `true`.
 * All numeric values are formatted via `formatCompact`; ratio cells gracefully
 * fall back to `'N/A'` when the estimated value is zero.
 */
function renderUsageComparisonTable(rows: ComparisonRow[], showDelta: boolean): string {
const deltaHeaderHtml = showDelta ? '<th>Delta</th>' : '';

const tableRows = rows.map(row => {
const estimatedFmt = formatCompact(row.estimated);
const actualFmt    = formatCompact(row.actual);
const ratioFmt     = row.estimated > 0
? (row.actual / row.estimated).toFixed(1) + 'x'
: 'N/A';

const deltaCell = (showDelta && row.delta !== undefined)
? `<td class="count-cell ${deltaClass(row.delta)}">${row.isTotal ? '<strong>' : ''}${deltaSign(row.delta)}${formatCompact(row.delta)}${row.isTotal ? '</strong>' : ''}</td>`
: '';

if (row.isTotal) {
return `<tr class="usage-total-row">
<td><strong>${row.label}</strong></td>
<td class="count-cell"><strong>${estimatedFmt}</strong></td>
<td class="count-cell"><strong>${actualFmt}</strong></td>
${deltaCell}
<td class="count-cell"><strong>${ratioFmt}</strong></td>
</tr>`;
}
return `<tr>
<td>${row.label}</td>
<td class="count-cell">${estimatedFmt}</td>
<td class="count-cell">${actualFmt}</td>
${deltaCell}
<td class="count-cell">${ratioFmt}</td>
</tr>`;
}).join('');

return `<table class="usage-comparison-table">
<thead>
<tr>
<th>Metric</th>
<th>Estimated</th>
<th>Actual</th>
${deltaHeaderHtml}
<th>Ratio</th>
</tr>
</thead>
<tbody>
${tableRows}
</tbody>
</table>`;
}

/**
 * Renders file/symbol header badges for a turn card, sourced from
 * `contextReferences.byPath` and the instruction counters.
 * Returns an empty string when there are no badges to show.
 * @security All file paths and symbol names are passed through `escapeHtml`.
 */
function renderContextFileBadges(refs: ContextReferenceUsage): string {
const badges: string[] = [];
if (refs.copilotInstructions > 0) {
badges.push(`<span class="context-badge">📋 copilot-instructions.md</span>`);
}
if (refs.agentsMd > 0) {
badges.push(`<span class="context-badge">🤖 agents.md</span>`);
}
// Add other file references
if (refs.byPath && Object.keys(refs.byPath).length > 0) {
const otherPaths = Object.entries(refs.byPath)
.filter(([path]) => {
const normalized = path.toLowerCase().replace(/\\/g, '/');
return !(normalized.includes('copilot-instructions.md') || normalized.endsWith('/agents.md'));
});

otherPaths.forEach(([path]) => {
// Check if this is a symbol reference
if (path.startsWith('#sym:')) {
const symbolName = path.substring(5); // Remove '#sym:' prefix
badges.push(`<span class="context-badge" title="Symbol: ${escapeHtml(symbolName)}">🔤 ${escapeHtml(symbolName)}</span>`);
} else {
badges.push(`<span class="context-badge" title="${escapeHtml(path)}">📄 ${escapeHtml(getFileName(path))}</span>`);
}
});
}
return badges.join('');
}

/**
 * Renders the "📊 ACTUAL LLM USAGE" `<details>` block for a single turn.
 * Returns an empty string when the turn has no actual usage data.
 */
function renderActualUsageSummary(turn: ChatTurn): string {
if (!turn.actualUsage) { return ''; }

const au = turn.actualUsage;
const totalTokens    = turn.inputTokensEstimate + turn.outputTokensEstimate + turn.thinkingTokensEstimate;
const actualTotal    = au.promptTokens + au.completionTokens;
const estimatedTotal = totalTokens;
const dInput  = au.promptTokens      - turn.inputTokensEstimate;
const dOutput = au.completionTokens  - turn.outputTokensEstimate;
const dTotal  = actualTotal          - estimatedTotal;

// Build prompt breakdown rows
let promptBreakdownHtml = '';
if (au.promptTokenDetails && au.promptTokenDetails.length > 0) {
const breakdownRows = au.promptTokenDetails.map(detail => {
const deducedTokens = Math.round(au.promptTokens * detail.percentageOfPrompt / 100);
const barWidth = Math.min(detail.percentageOfPrompt, 100);
const categoryClass = detail.category === 'System' ? 'category-system' : 'category-user';
return `<tr>
<td><span class="${categoryClass}">${escapeHtml(detail.category)}</span></td>
<td>${escapeHtml(detail.label)}</td>
<td class="count-cell">${detail.percentageOfPrompt}%</td>
<td class="count-cell">${formatCompact(deducedTokens)}</td>
<td><div class="bar-cell"><div class="bar-fill ${categoryClass}-bar" style="width: ${barWidth}%"></div></div></td>
</tr>`;
}).join('');

// Calculate system vs user totals
const systemPct = au.promptTokenDetails.filter(d => d.category === 'System').reduce((s, d) => s + d.percentageOfPrompt, 0);
const userPct   = au.promptTokenDetails.filter(d => d.category !== 'System').reduce((s, d) => s + d.percentageOfPrompt, 0);
const systemTokens = Math.round(au.promptTokens * systemPct / 100);
const userTokens   = Math.round(au.promptTokens * userPct / 100);

promptBreakdownHtml = `
<div class="prompt-breakdown">
<div class="breakdown-summary">
<span class="category-system">System: ${systemPct}% (~${formatCompact(systemTokens)} tokens)</span>
<span class="category-user">User Context: ${userPct}% (~${formatCompact(userTokens)} tokens)</span>
</div>
<table class="prompt-breakdown-table">
<thead>
<tr>
<th>Category</th>
<th>Label</th>
<th>%</th>
<th>~Tokens</th>
<th>Distribution</th>
</tr>
</thead>
<tbody>
${breakdownRows}
</tbody>
</table>
</div>
`;
}

const comparisonRows: ComparisonRow[] = [
{ label: '↑ Prompt / Input',      estimated: turn.inputTokensEstimate,  actual: au.promptTokens,     delta: dInput  },
{ label: '↓ Completion / Output', estimated: turn.outputTokensEstimate, actual: au.completionTokens, delta: dOutput },
{ label: 'Σ Total',               estimated: estimatedTotal,             actual: actualTotal,          delta: dTotal, isTotal: true },
];

return `
<div class="turn-actual-usage">
<details class="actual-usage-details">
<summary class="actual-usage-summary">
<span class="collapse-arrow">▶</span>
<span class="actual-usage-header-inline">📊 ACTUAL LLM USAGE</span>
<span class="actual-usage-summary-text">
<span class="usage-badge">↑${formatCompact(au.promptTokens)}</span>
<span class="usage-badge">↓${formatCompact(au.completionTokens)}</span>
<span class="usage-badge usage-total">Σ${formatCompact(actualTotal)}</span>
<span class="usage-badge ${deltaClass(dTotal)}">delta: ${deltaSign(dTotal)}${formatCompact(dTotal)}</span>
${au.details ? `<span class="usage-badge usage-model-info">${escapeHtml(au.details)}</span>` : ''}
</span>
</summary>
<div class="actual-usage-content">
${renderUsageComparisonTable(comparisonRows, true)}
${promptBreakdownHtml}
</div>
</details>
</div>
`;
}

/**
 * Renders the "🔧 TOOL CALLS" `<details>` block for a single turn.
 * Returns an empty string when the turn has no tool calls.
 * @security All tool names and display strings are passed through `escapeHtml`.
 */
function renderToolCallsSection(turn: ChatTurn): string {
if (turn.toolCalls.length === 0) { return ''; }

const regularCalls       = turn.toolCalls.filter(tc => !tc.isSubAgent);
const subAgentCallsInTurn = turn.toolCalls.filter(tc => tc.isSubAgent);
const toolCounts: { [key: string]: number } = {};
regularCalls.forEach(tc => {
const toolName = lookupToolName(tc.toolName);
toolCounts[toolName] = (toolCounts[toolName] || 0) + 1;
});

const toolSummary = Object.entries(toolCounts)
.map(([name, count]) => `<span class="tool-summary-item" data-tool-filter="${escapeHtml(name)}" data-turn="${turn.turnNumber}" title="Click to filter by ${escapeHtml(name)}">${escapeHtml(name)}: <strong>${count}</strong></span>`)
.join('');
const subAgentSummary = subAgentCallsInTurn.length > 0
? `<span class="sub-agent-summary-item" data-tool-filter="__subagent__" data-turn="${turn.turnNumber}" title="Click to filter sub-agent calls">🤖 Sub-Agents: <strong>${subAgentCallsInTurn.length}</strong></span>`
: '';

const SUB_AGENT_DISPLAY: Record<string, string> = {
task:        '🤖 Sub-Agent',
read_agent:  '🤖 Sub-Agent (read)',
write_agent: '🤖 Sub-Agent (write)',
list_agents: '🤖 Sub-Agent (list)',
};

const toolRows = turn.toolCalls.map((tc, idx) => {
const displayName = tc.isSubAgent
? (SUB_AGENT_DISPLAY[tc.toolName] ?? `🤖 ${tc.toolName}`)
: lookupToolName(tc.toolName);
return `
<tr class="tool-row${tc.isSubAgent ? ' sub-agent-row' : ''}" data-tool-name="${tc.isSubAgent ? '__subagent__' : escapeHtml(lookupToolName(tc.toolName))}">
<td class="tool-name-cell">
<span class="tool-name tool-call-link" data-turn="${turn.turnNumber}" data-toolcall="${idx}" title="${escapeHtml(tc.toolName)}" style="cursor:pointer;">${escapeHtml(displayName)}</span>
${tc.isSubAgent && tc.subAgentModel ? `<span class="sub-agent-model-badge">${escapeHtml(getModelDisplayName(tc.subAgentModel))}</span>` : ''}
${tc.isSubAgent && tc.subAgentTokens ? `<span class="sub-agent-tokens">↑${tc.subAgentTokens.input.toLocaleString()} ↓${tc.subAgentTokens.output.toLocaleString()} tokens</span>` : ''}
${tc.arguments && !tc.isSubAgent ? `<details class="tool-details"><summary>Arguments</summary><pre>${escapeHtml(tc.arguments)}</pre></details>` : ''}
${tc.result && !tc.isSubAgent ? `<details class="tool-details"><summary>Result</summary><pre>${escapeHtml(truncateText(tc.result, 500))}</pre></details>` : ''}
</td>
<td class="tool-action-cell">
${!tc.isSubAgent ? `<span class="tool-call-pretty" data-turn="${turn.turnNumber}" data-toolcall="${idx}" title="View pretty JSON" style="cursor:pointer;color:#22c55e;">Investigate</span>` : ''}
</td>
</tr>
`;
}).join('');

return `
<div class="turn-tools">
<details class="tool-calls-details">
<summary class="tool-calls-summary">
<span class="collapse-arrow">▶</span>
<span class="tools-header-inline">🔧 TOOL CALLS (${turn.toolCalls.length})</span>
<span class="tool-summary-text">${toolSummary}${subAgentSummary}</span>
</summary>
<table class="tools-table">
<thead>
<tr>
<th scope="col">Tool Name</th>
<th scope="col">Action</th>
</tr>
</thead>
<tbody>
${toolRows}
</tbody>
</table>
</details>
</div>
`;
}

/**
 * Renders the "🔗 CONTEXT REFERENCES" `<details>` block for a single turn.
 * Returns an empty string when the turn has no context references.
 */
function renderContextRefsSection(turn: ChatTurn): string {
const totalRefs = getTotalContextRefs(turn.contextReferences);
if (totalRefs === 0) { return ''; }

const contextRefBadges = getContextRefBadges(turn.contextReferences);
return `
<div class="turn-context-refs">
<details class="context-refs-details">
<summary class="context-refs-summary">
<span class="collapse-arrow">▶</span>
<span class="context-refs-header-inline">🔗 CONTEXT REFERENCES (${totalRefs})</span>
<span class="context-ref-summary-text">${contextRefBadges}</span>
</summary>
<div class="context-refs-content">
${renderContextReferencesDetailed(turn.contextReferences)}
</div>
</details>
</div>
`;
}

// ── Layout section renderers ─────────────────────────────────────────────────

function buildEditorModeCard(data: SessionLogData, stats: SummaryStats): string {
	if (stats.totalModeTurns <= 0) { return ''; }
	const { modeEntries, primaryModeLabel, modeSubLabel } = stats;
	const title = modeEntries.map(([m, n]) => `${getModeIcon(m)} ${MODE_LABELS[m]} (${n})`).join(' · ');
	const extraModes = modeEntries.length > 1 ? ` · ${modeEntries.slice(1).map(([m, n]) => `${MODE_LABELS[m]} ${n}`).join(', ')}` : '';
	return `<div class="summary-card" title="${escapeHtml(title)}">
<div class="summary-label">🎛️ Editor Mode</div>
<div class="summary-value" style="font-size: 1.1em;">${primaryModeLabel}</div>
<div class="summary-sub">${escapeHtml(modeSubLabel)}${extraModes}</div>
</div>`;
}

function buildEstimatedTokensCard(data: SessionLogData, stats: SummaryStats): string {
	const isJetBrains = data.editorName === 'JetBrains';
	const isAntigravity = data.editorName === 'Antigravity';
	const titleAttr = isJetBrains
		? ` title="JetBrains: only user messages + assistant text are persisted in the session log, so this is an estimate of those alone. Actual API token counts and thinking tokens are not available."`
		: isAntigravity ? ` title="Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally."` : '';
	const suffix = (isJetBrains || isAntigravity) ? ' ⓘ' : '';
	const sub = isJetBrains ? 'User + assistant text only (no API counts, no thinking)'
		: isAntigravity ? 'Estimated from transcript content' : 'Input + Output estimated from text';
	return `<div class="summary-card"${titleAttr}>
<div class="summary-label">📊 Estimated Tokens${suffix}</div>
<div class="summary-value">${formatCompact(stats.totalTokens)}</div>
<div class="summary-sub">${sub}</div>
</div>`;
}

function buildActualTokensCard(data: SessionLogData, stats: SummaryStats): string {
	const { hasAnyActualUsage, hasSessionActualOnly, actualTotal, actualPromptTotal, actualCompletionTotal, sessionActualTokens } = stats;
	if (hasAnyActualUsage && !data.debugLogInputTokens) {
		return `<div class="summary-card">
<div class="summary-label">✅ Actual Tokens</div>
<div class="summary-value">${formatCompact(actualTotal)}</div>
<div class="summary-sub">↑${formatCompact(actualPromptTotal)} prompt, ↓${formatCompact(actualCompletionTotal)} completion</div>
</div>`;
	}
	if (data.debugLogInputTokens !== undefined) {
		return `<div class="summary-card" title="Token counts from the Copilot Chat debug log, summed across every LLM API call in this session. Agent-mode sessions make multiple calls per user turn; the debug log captures all of them.">
<div class="summary-label">✅ Actual Tokens</div>
<div class="summary-value">${formatCompact((data.debugLogInputTokens ?? 0) + (data.debugLogOutputTokens ?? 0))}</div>
<div class="summary-sub">↑${formatCompact(data.debugLogInputTokens)} input, ↓${formatCompact(data.debugLogOutputTokens ?? 0)} output</div>
</div>`;
	}
	if (hasSessionActualOnly) {
		return `<div class="summary-card">
<div class="summary-label">✅ Actual Tokens</div>
<div class="summary-value">${formatCompact(sessionActualTokens)}</div>
<div class="summary-sub">${data.editorName === 'Mistral Vibe' ? 'From session data' : 'Total from session shutdown event'}</div>
</div>`;
	}
	return '';
}

function buildModelTurnsCard(data: SessionLogData): string {
	if ((data.modelTurns ?? 0) <= 0) { return ''; }
	const subText = (data.modelTurns ?? 0) > data.turns.length
		? `${data.modelTurns} API calls for ${data.turns.length} user turn${data.turns.length !== 1 ? 's' : ''}`
		: 'LLM API calls in this session';
	return `<div class="summary-card" title="Number of LLM API calls made during this session, as recorded in the Copilot Chat debug log. Agent-mode sessions make multiple calls per user turn (tool call → re-prompt → final answer).">
<div class="summary-label">🔄 Model Turns</div>
<div class="summary-value">${data.modelTurns}</div>
<div class="summary-sub">${subText}</div>
</div>`;
}

function buildDebugTokenCards(data: SessionLogData): string {
	if (data.debugLogInputTokens === undefined) { return ''; }
	return `<div class="summary-card" title="Total input tokens sent to the LLM across all API calls in this session, from the Copilot Chat debug log.">
<div class="summary-label">📥 Input Tokens</div>
<div class="summary-value">${formatCompact(data.debugLogInputTokens)}</div>
<div class="summary-sub">Prompt tokens across all model calls</div>
</div>
<div class="summary-card" title="Total output tokens generated by the LLM across all API calls in this session, from the Copilot Chat debug log.">
<div class="summary-label">📤 Output Tokens</div>
<div class="summary-value">${formatCompact(data.debugLogOutputTokens ?? 0)}</div>
<div class="summary-sub">Completion tokens across all model calls</div>
</div>`;
}

function buildCachedTokensCard(data: SessionLogData): string {
	if ((data.cachedTokens ?? 0) <= 0) { return ''; }
	return `<div class="summary-card" title="Tokens served from the provider's prompt cache. Cached tokens are billed at a lower rate and reduce latency. Source: session.shutdown modelMetrics.">
<div class="summary-label">💾 Cached Input</div>
<div class="summary-value">${formatCompact(data.cachedTokens!)}</div>
<div class="summary-sub">Prompt tokens served from cache</div>
</div>`;
}

function buildThinkingTokensCard(data: SessionLogData, stats: SummaryStats): string {
	if (stats.totalThinkingTokens <= 0) { return ''; }
	return `<div class="summary-card">
<div class="summary-label">🧠 Thinking Tokens</div>
<div class="summary-value">${formatCompact(stats.totalThinkingTokens)}</div>
<div class="summary-sub">${stats.turnsWithThinking} of ${data.turns.length} turns used thinking</div>
</div>`;
}

function buildEffortCard(stats: SummaryStats): string {
	if (!stats.sessionEffort) { return ''; }
	const { effortDefaultLabel, effortSummary, sessionEffort } = stats;
	const switchText = sessionEffort.switchCount > 0 ? ` · ${sessionEffort.switchCount} switch${sessionEffort.switchCount !== 1 ? 'es' : ''}` : '';
	return `<div class="summary-card">
<div class="summary-label">💡 Thinking Effort</div>
<div class="summary-value">${effortDefaultLabel}</div>
<div class="summary-sub">${effortSummary}${switchText}</div>
</div>`;
}

function buildSubAgentsCard(data: SessionLogData, stats: SummaryStats): string {
	if (stats.totalSubAgentCalls <= 0 && (data.subAgentsStarted ?? 0) <= 0) { return ''; }
	const count = data.subAgentsStarted ?? stats.totalSubAgentCalls;
	const sub = data.subAgentsStarted !== undefined
		? `${data.subAgentsStarted} started · ${stats.totalSubAgentCalls} tool calls`
		: 'Agent mode sub-agent invocations';
	return `<div class="summary-card">
<div class="summary-label">🤖 Sub-Agents</div>
<div class="summary-value">${count}</div>
<div class="summary-sub">${sub}</div>
</div>`;
}

function buildFileNameCard(data: SessionLogData): string {
	const isOpenCode = data.file.includes('opencode.db#ses_');
	const displayName = escapeHtml(truncateText(getFileName(data.file), 30));
	const title = escapeHtml(getFileName(data.file));
	const valueHtml = isOpenCode
		? `<span title="${title}">${displayName}</span>`
		: `<span class="filename-link" id="open-file-link" title="${title}">${displayName}</span>`;
	const sub = isOpenCode ? 'Stored in SQLite database' : 'Click to open in editor';
	return `<div class="summary-card">
<div class="summary-label">📁 File Name</div>
<div class="summary-value" style="font-size: 16px;">${valueHtml}</div>
<div class="summary-sub">${sub}</div>
</div>`;
}

/**
 * Renders the grid of summary cards at the top of the log-viewer layout.
 * @security All user-controlled strings (editorName, file path) are escaped via `escapeHtml`.
 */
function renderSummaryCards(data: SessionLogData, stats: SummaryStats): string {
	const { usageToolTotal, usageTopTools, usageMcpTotal, usageTopMcpTools, usageContextTotal, usageContextImplicit, usageContextExplicit } = stats;
	return `
<div class="summary-cards">
<div class="summary-card">
<div class="summary-label">📝 Interactions</div>
<div class="summary-value">${data.interactions}</div>
<div class="summary-sub">Total chat turns in this session</div>
</div>
${buildEditorModeCard(data, stats)}
${buildEstimatedTokensCard(data, stats)}
${buildActualTokensCard(data, stats)}
${buildModelTurnsCard(data)}
${buildDebugTokenCards(data)}
${buildCachedTokensCard(data)}
${buildThinkingTokensCard(data, stats)}
${buildEffortCard(stats)}
${buildSubAgentsCard(data, stats)}
<div class="summary-card">
<div class="summary-label">🔧 Tool Calls</div>
<div class="summary-value">${usageToolTotal}</div>
<div class="summary-sub">${formatTopListWithOther(usageTopTools, usageToolTotal, lookupToolName)}</div>
</div>
<div class="summary-card">
<div class="summary-label">🔌 MCP Tools</div>
<div class="summary-value">${usageMcpTotal}</div>
<div class="summary-sub">${formatTopListWithOther(usageTopMcpTools, usageMcpTotal)}</div>
</div>
<div class="summary-card">
<div class="summary-label">🔗 Context Refs</div>
<div class="summary-value">${usageContextTotal}</div>
<div class="summary-sub">
${usageContextTotal === 0 ? 'None' : `implicit ${usageContextImplicit}, explicit ${usageContextExplicit}`}
</div>
</div>
${buildFileNameCard(data)}
<div class="summary-card">
<div class="summary-label">💻 Editor</div>
<div class="summary-value" style="font-size: 20px; word-break: keep-all;">${escapeHtml(data.editorName)}</div>
<div class="summary-sub">Source editor</div>
</div>
<div class="summary-card">
<div class="summary-label">📦 File Size</div>
<div class="summary-value">${formatFileSize(data.size)}</div>
<div class="summary-sub">Total size on disk</div>
</div>
<div class="summary-card">
<div class="summary-label">🕒 Modified</div>
<div class="summary-value" style="font-size: 14px; word-break: keep-all;">${formatDate(data.modified)}</div>
<div class="summary-sub">Last file modification</div>
</div>
<div class="summary-card">
<div class="summary-label">▶️ First Interaction</div>
<div class="summary-value" style="font-size: 14px; word-break: keep-all;">${formatDate(data.firstInteraction)}</div>
<div class="summary-sub">Session started</div>
</div>
<div class="summary-card">
<div class="summary-label">⏹️ Last Interaction</div>
<div class="summary-value" style="font-size: 14px; word-break: keep-all;">${formatDate(data.lastInteraction)}</div>
<div class="summary-sub">Most recent activity</div>
</div>
</div>`;
}

/**
 * Renders the session-level actual-usage block (comparison table + aggregated
 * prompt breakdown) that appears below the summary cards.
 * Returns an empty string when there are no turns with actual usage data.
 */
function renderSessionActualUsage(
data: SessionLogData,
totalTokens: number,
turnsWithActual: ChatTurn[],
actualPromptTotal: number,
actualCompletionTotal: number,
actualTotal: number,
aggregatedBreakdown: { [key: string]: BreakdownEntry },
): string {
if (turnsWithActual.length === 0) { return ''; }

const inputEstimateSum  = data.turns.reduce((s, t) => s + t.inputTokensEstimate, 0);
const outputEstimateSum = data.turns.reduce((s, t) => s + t.outputTokensEstimate, 0);

const breakdownEntries = Object.values(aggregatedBreakdown).sort((a, b) => b.totalTokens - a.totalTokens);
const avgPct = (entry: BreakdownEntry) => Math.round(entry.totalPct / entry.count);
const breakdownRows = breakdownEntries.map(entry => {
const pct = avgPct(entry);
const categoryClass = entry.category === 'System' ? 'category-system' : 'category-user';
return `<tr>
<td><span class="${categoryClass}">${escapeHtml(entry.category)}</span></td>
<td>${escapeHtml(entry.label)}</td>
<td class="count-cell">${pct}%</td>
<td class="count-cell">${formatCompact(entry.totalTokens)}</td>
<td><div class="bar-cell"><div class="bar-fill ${categoryClass}-bar" style="width: ${Math.min(pct, 100)}%"></div></div></td>
</tr>`;
}).join('');

const systemTokens = breakdownEntries.filter(e => e.category === 'System').reduce((s, e) => s + e.totalTokens, 0);
const userTokens   = breakdownEntries.filter(e => e.category !== 'System').reduce((s, e) => s + e.totalTokens, 0);

const hasComparison = actualTotal > 0 || totalTokens > 0;
const hasBreakdown  = breakdownEntries.length > 0;
const gridClass = (hasComparison && hasBreakdown)
? 'session-usage-grid'
: 'session-usage-grid session-usage-grid--single';

const comparisonRows: ComparisonRow[] = [
{ label: '↑ Prompt',     estimated: inputEstimateSum,  actual: actualPromptTotal    },
{ label: '↓ Completion', estimated: outputEstimateSum, actual: actualCompletionTotal },
{ label: 'Σ Total',      estimated: totalTokens,       actual: actualTotal, isTotal: true },
];

return `
<div class="session-actual-usage">
<div class="session-usage-header">📊 Session Actual LLM Usage (${turnsWithActual.length}/${data.turns.length} turns with data)</div>
<div class="${gridClass}">
${hasComparison ? `<div class="session-usage-comparison">
${renderUsageComparisonTable(comparisonRows, false)}
</div>` : ''}
${hasBreakdown ? `<div class="session-usage-breakdown">
<div class="breakdown-summary">
<span class="category-system">System: ~${formatCompact(systemTokens)} tokens</span>
<span class="category-user">User Context: ~${formatCompact(userTokens)} tokens</span>
</div>
<table class="prompt-breakdown-table">
<thead><tr><th>Category</th><th>Label</th><th>Avg %</th><th>Total ~Tokens</th><th>Distribution</th></tr></thead>
<tbody>${breakdownRows}</tbody>
</table>
</div>` : ''}
</div>
</div>
`;
}

/**
 * Wires up all DOM event handlers after the layout has been injected into
 * `#root`. Must be called once immediately after `root.innerHTML` is set.
 */
function wireUpEventHandlers(): void {
document.getElementById('btn-raw')?.addEventListener('click', () => {
vscode.postMessage({ command: 'openRawFile' });
});
document.getElementById('btn-diagnostics')?.addEventListener('click', () => {
vscode.postMessage({ command: 'showDiagnostics' });
});
document.getElementById('btn-usage')?.addEventListener('click', () => {
vscode.postMessage({ command: 'showUsageAnalysis' });
});
document.getElementById('btn-details')?.addEventListener('click', () => {
vscode.postMessage({ command: 'showDetails' });
});
document.getElementById('file-link')?.addEventListener('click', (e) => {
e.preventDefault();
vscode.postMessage({ command: 'openRawFile' });
});
document.getElementById('open-file-link')?.addEventListener('click', () => {
vscode.postMessage({ command: 'openRawFile' });
});

// Wire tool call clicks after DOM render so listeners bind correctly
document.querySelectorAll('.tool-call-link').forEach(link => {
link.addEventListener('click', (e) => {
e.preventDefault();
const turnNumber  = parseInt(link.getAttribute('data-turn')     || '0', 10);
const toolCallIdx = parseInt(link.getAttribute('data-toolcall') || '0', 10);
vscode.postMessage({ command: 'revealToolCallSource', turnNumber, toolCallIdx });
});
});

// Pretty JSON view for a single tool call
document.querySelectorAll('.tool-call-pretty').forEach(link => {
link.addEventListener('click', (e) => {
e.preventDefault();
const turnNumber  = parseInt(link.getAttribute('data-turn')     || '0', 10);
const toolCallIdx = parseInt(link.getAttribute('data-toolcall') || '0', 10);
vscode.postMessage({ command: 'showToolCallPretty', turnNumber, toolCallIdx });
});
});

// Tool pill filter: clicking a pill filters the tool rows in that turn
document.querySelectorAll<HTMLElement>('.tool-summary-item[data-tool-filter], .sub-agent-summary-item[data-tool-filter]').forEach(pill => {
pill.addEventListener('click', (e) => {
const turnNumber = pill.getAttribute('data-turn');
const filter     = pill.getAttribute('data-tool-filter');
const isActive   = pill.classList.contains('active');

const turnCard = document.querySelector<HTMLElement>(`.turn-card[data-turn="${turnNumber}"]`);
if (!turnCard) { return; }

// Clear active state from all pills in this turn
turnCard.querySelectorAll<HTMLElement>('.tool-summary-item, .sub-agent-summary-item').forEach(p => p.classList.remove('active'));

const rows      = turnCard.querySelectorAll<HTMLElement>('tr.tool-row');
const detailsEl = turnCard.querySelector<HTMLDetailsElement>('details.tool-calls-details');

if (isActive) {
// Second click: clear filter, show all rows
rows.forEach(row => { row.style.display = ''; });
} else {
// Activate filter
pill.classList.add('active');
if (detailsEl) { detailsEl.open = true; }
rows.forEach(row => {
row.style.display = row.getAttribute('data-tool-name') === filter ? '' : 'none';
});
}
});
});

// Prevent <details> from toggling when a filter pill inside <summary> is clicked
document.querySelectorAll<HTMLElement>('summary.tool-calls-summary').forEach(summary => {
summary.addEventListener('click', (e) => {
if ((e.target as HTMLElement).closest('.tool-summary-item, .sub-agent-summary-item')) {
e.preventDefault();
}
});
});
}

// ── Entry-point renderers (signatures preserved) ─────────────────────────────

function renderTurnCard(turn: ChatTurn, isJetBrains = false, isAntigravity = false): string {
const totalTokens    = turn.inputTokensEstimate + turn.outputTokensEstimate + turn.thinkingTokensEstimate;
const hasThinking    = turn.thinkingTokensEstimate > 0;
const hasActualUsage = !!turn.actualUsage;
const hasMcpTools    = turn.mcpTools.length > 0;

const contextHeaderHtml = renderContextFileBadges(turn.contextReferences);
const toolCallsHtml     = renderToolCallsSection(turn);
const contextRefsHtml   = renderContextRefsSection(turn);
const actualUsageHtml   = renderActualUsageSummary(turn);

const mcpToolsHtml = hasMcpTools ? `
<div class="turn-mcp">
<div class="mcp-header">🔌 MCP Tools (${turn.mcpTools.length})</div>
<div class="mcp-list">
${turn.mcpTools.map(mcp => `
<span class="mcp-item"><span class="mcp-server">${escapeHtml(mcp.server)}</span>: ${escapeHtml(mcp.tool)}</span>
`).join('')}
</div>
</div>
` : '';

return `
<div class="turn-card" data-turn="${turn.turnNumber}">
<div class="turn-header">
<div class="turn-meta">
<span class="turn-number">#${turn.turnNumber}</span>
<span class="turn-mode" style="background: ${getModeColor(turn.mode)};">${getModeIcon(turn.mode)} ${turn.mode}</span>
${turn.model ? renderTurnModelBadge(turn.model) : ''}
${turn.thinkingEffort ? `<span class="turn-effort">💡 ${escapeHtml(getEffortDisplayName(turn.thinkingEffort))}</span>` : ''}
${totalTokens > 0 ? `<span class="turn-tokens"${isJetBrains ? ` title="JetBrains: estimated from user message + assistant text only. Actual API counts and thinking tokens are not available."` : isAntigravity ? ` title="Antigravity: estimated from transcript content. Actual API counts are not stored locally."` : ''}>📊 ${formatCompact(totalTokens)} tokens (↑${turn.inputTokensEstimate} ↓${turn.outputTokensEstimate})${(isJetBrains || isAntigravity) ? ' ⓘ' : ''}</span>` : ''}
${hasThinking ? `<span class="turn-tokens" style="color: #a78bfa;">🧠 ${formatCompact(turn.thinkingTokensEstimate)} thinking</span>` : ''}
${hasActualUsage ? `<span class="turn-tokens" style="color: #22c55e;">✓ ${formatCompact(turn.actualUsage!.promptTokens + turn.actualUsage!.completionTokens)} actual</span>` : ''}
${contextHeaderHtml}
</div>
<div class="turn-time">${formatDate(turn.timestamp)}</div>
</div>

${toolCallsHtml}
${mcpToolsHtml}
${contextRefsHtml}
${actualUsageHtml}

<div class="turn-content">
<div class="message user-message">
<div class="message-label">👤 User</div>
<div class="message-text">${escapeHtml(turn.userMessage) || '<em>No message</em>'}</div>
</div>

<div class="message assistant-message">
<div class="message-label">🤖 Assistant</div>
<div class="message-text">${escapeHtml(turn.assistantResponse) || '<em>No response</em>'}</div>
</div>
</div>
</div>
`;
}

type TokenStats = {
	totalTokens: number;
	totalThinkingTokens: number;
	totalSubAgentCalls: number;
	turnsWithThinking: number;
	usageToolTotal: number;
	usageTopTools: { key: string; value: number }[];
	usageMcpTotal: number;
	usageTopMcpTools: { key: string; value: number }[];
	usageContextTotal: number;
	usageContextImplicit: number;
	usageContextExplicit: number;
	sessionEffort: ThinkingEffortUsage | undefined;
	effortDefaultLabel: string;
	effortSummary: string;
};

function aggregateTokenStats(data: SessionLogData): TokenStats {
	const totalTokens = data.turns.reduce((sum, t) => sum + t.inputTokensEstimate + t.outputTokensEstimate + t.thinkingTokensEstimate, 0);
	const totalThinkingTokens = data.turns.reduce((sum, t) => sum + t.thinkingTokensEstimate, 0);
	const totalToolCalls = data.turns.reduce((sum, t) => sum + t.toolCalls.filter(tc => !tc.isSubAgent).length, 0);
	const totalSubAgentCalls = data.turns.reduce((sum, t) => sum + t.toolCalls.filter(tc => tc.isSubAgent).length, 0);
	const totalMcpTools = data.turns.reduce((sum, t) => sum + t.mcpTools.length, 0);
	const turnsWithThinking = data.turns.filter(t => t.thinkingTokensEstimate > 0).length;
	const usage = data.usageAnalysis;
	const sessionEffort = usage?.thinkingEffort;
	const usageToolTotal = usage?.toolCalls?.total ?? totalToolCalls;
	const usageTopTools = usage ? getTopEntries(usage.toolCalls.byTool, 3) : [];
	const usageMcpTotal = usage?.mcpTools?.total ?? totalMcpTools;
	const usageTopMcpTools = usage ? getTopEntries(usage.mcpTools.byTool, 3) : [];
	const usageContextRefs = usage?.contextReferences || data.contextReferences;
	const usageContextTotal = getTotalContextRefs(usageContextRefs);
	const usageContextImplicit = getImplicitContextRefs(usageContextRefs);
	const usageContextExplicit = getExplicitContextRefs(usageContextRefs);
	const effortDefault = sessionEffort?.defaultEffort ?? (sessionEffort ? Object.keys(sessionEffort.byEffort)[0] : undefined);
	const effortDefaultLabel = effortDefault ? getEffortDisplayName(effortDefault) : '—';
	const effortSummary = sessionEffort
		? Object.entries(sessionEffort.byEffort).map(([k, v]) => `${getEffortDisplayName(k)}: ${v}`).join(', ')
		: '';
	return {
		totalTokens, totalThinkingTokens, totalSubAgentCalls, turnsWithThinking,
		usageToolTotal, usageTopTools, usageMcpTotal, usageTopMcpTools,
		usageContextTotal, usageContextImplicit, usageContextExplicit,
		sessionEffort, effortDefaultLabel, effortSummary,
	};
}

type ActualUsageStats = {
	turnsWithActual: ChatTurn[];
	hasAnyActualUsage: boolean;
	actualPromptTotal: number;
	actualCompletionTotal: number;
	actualTotal: number;
	sessionActualTokens: number;
	hasSessionActualOnly: boolean;
	aggregatedBreakdown: { [key: string]: BreakdownEntry };
};

function aggregateActualUsageStats(data: SessionLogData): ActualUsageStats {
	const turnsWithActual = data.turns.filter(t => t.actualUsage);
	const hasAnyActualUsage = turnsWithActual.length > 0;
	const actualPromptTotal = turnsWithActual.reduce((s, t) => s + (t.actualUsage?.promptTokens || 0), 0);
	const actualCompletionTotal = turnsWithActual.reduce((s, t) => s + (t.actualUsage?.completionTokens || 0), 0);
	const actualTotal = actualPromptTotal + actualCompletionTotal;
	const sessionActualTokens = data.actualTokens || 0;
	const hasSessionActualOnly = !hasAnyActualUsage && sessionActualTokens > 0;
	const aggregatedBreakdown: { [key: string]: BreakdownEntry } = {};
	for (const turn of turnsWithActual) {
		if (turn.actualUsage?.promptTokenDetails) {
			for (const detail of turn.actualUsage.promptTokenDetails) {
				const key = `${detail.category}|${detail.label}`;
				if (!aggregatedBreakdown[key]) {
					aggregatedBreakdown[key] = { category: detail.category, label: detail.label, totalTokens: 0, totalPct: 0, count: 0 };
				}
				const deducedTokens = Math.round((turn.actualUsage?.promptTokens || 0) * detail.percentageOfPrompt / 100);
				aggregatedBreakdown[key].totalTokens += deducedTokens;
				aggregatedBreakdown[key].totalPct += detail.percentageOfPrompt;
				aggregatedBreakdown[key].count++;
			}
		}
	}
	return { turnsWithActual, hasAnyActualUsage, actualPromptTotal, actualCompletionTotal, actualTotal, sessionActualTokens, hasSessionActualOnly, aggregatedBreakdown };
}

type ModeStats = {
	modeEntries: [keyof ModeUsage, number][];
	totalModeTurns: number;
	primaryModeLabel: string;
	modeSubLabel: string;
};

function aggregateModeStats(data: SessionLogData): ModeStats {
	const modeUsage: ModeUsage = { ask: 0, edit: 0, agent: 0, plan: 0, customAgent: 0, cli: 0 };
	for (const turn of data.turns) {
		modeUsage[turn.mode]++;
	}
	const modeEntries = (Object.entries(modeUsage) as [keyof typeof modeUsage, number][])
		.filter(([, n]) => n > 0)
		.sort((a, b) => b[1] - a[1]);
	const totalModeTurns = modeEntries.reduce((s, [, n]) => s + n, 0);
	const primaryMode = modeEntries[0];
	const primaryModeLabel = primaryMode ? `${getModeIcon(primaryMode[0])} ${MODE_LABELS[primaryMode[0]]}` : '—';
	const modeSubLabel = modeEntries.length <= 1
		? (totalModeTurns === 1 ? '1 turn' : `${totalModeTurns} turns`)
		: `mixed across ${totalModeTurns} turns`;
	return { modeEntries, totalModeTurns, primaryModeLabel, modeSubLabel };
}

function renderLayout(data: SessionLogData): void {
	setCompactNumbers(data.compactNumbers !== false);
	const root = document.getElementById('root');
	if (!root) { return; }

	const tokenStats = aggregateTokenStats(data);
	const actualStats = aggregateActualUsageStats(data);
	const modeStats = aggregateModeStats(data);

	const summaryStats: SummaryStats = {
		totalTokens: tokenStats.totalTokens,
		totalThinkingTokens: tokenStats.totalThinkingTokens,
		totalSubAgentCalls: tokenStats.totalSubAgentCalls,
		turnsWithThinking: tokenStats.turnsWithThinking,
		usageToolTotal: tokenStats.usageToolTotal,
		usageTopTools: tokenStats.usageTopTools,
		usageMcpTotal: tokenStats.usageMcpTotal,
		usageTopMcpTools: tokenStats.usageTopMcpTools,
		usageContextTotal: tokenStats.usageContextTotal,
		usageContextImplicit: tokenStats.usageContextImplicit,
		usageContextExplicit: tokenStats.usageContextExplicit,
		sessionEffort: tokenStats.sessionEffort,
		effortDefaultLabel: tokenStats.effortDefaultLabel,
		effortSummary: tokenStats.effortSummary,
		hasAnyActualUsage: actualStats.hasAnyActualUsage,
		hasSessionActualOnly: actualStats.hasSessionActualOnly,
		actualTotal: actualStats.actualTotal,
		actualPromptTotal: actualStats.actualPromptTotal,
		actualCompletionTotal: actualStats.actualCompletionTotal,
		sessionActualTokens: actualStats.sessionActualTokens,
		modeEntries: modeStats.modeEntries,
		totalModeTurns: modeStats.totalModeTurns,
		primaryModeLabel: modeStats.primaryModeLabel,
		modeSubLabel: modeStats.modeSubLabel,
	};

	root.innerHTML = `
<style>${themeStyles}</style>
<style>${styles}</style>

<div class="container">
${renderSummaryCards(data, summaryStats)}

${renderSessionActualUsage(
	data, tokenStats.totalTokens, actualStats.turnsWithActual,
	actualStats.actualPromptTotal, actualStats.actualCompletionTotal, actualStats.actualTotal,
	actualStats.aggregatedBreakdown,
)}

<div class="turns-header">
<span>📝</span>
<span>Chat Turns (${data.turns.length})${data.title ? ` - ${escapeHtml(data.title)}` : ''}</span>
</div>

<div class="turns-list">
${data.turns.length > 0 
? data.turns.map(turn => renderTurnCard(turn, data.editorName === 'JetBrains', data.editorName === 'Antigravity')).join('')
: '<div class="empty-state">No chat turns found in this session.</div>'
}
</div>


</div>
`;

	wireUpEventHandlers();
}

async function bootstrap(): Promise<void> {
const { provideVSCodeDesignSystem, vsCodeButton } = await import('@vscode/webview-ui-toolkit');
provideVSCodeDesignSystem().register(vsCodeButton());

if (!initialData) {
const root = document.getElementById('root');
if (root) {
root.textContent = 'No data available.';
}
return;
}
renderLayout(initialData);
}

void bootstrap();