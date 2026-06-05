// Usage Analysis webview
import { el } from '../shared/domUtils';
import { buttonHtml } from '../shared/buttonConfig';
import { ContextReferenceUsage, getTotalContextRefs } from '../shared/contextRefUtils';
import { escapeHtml, formatFixed, formatNumber, formatPercent, setFormatLocale } from '../shared/formatUtils';
import { wireExtensionPointButtons } from '../shared/extensionPoints';
import type { McpToolUsage, ModeUsage, ModelSwitchingAnalysis as BaseModelSwitchingAnalysis, ToolCallUsage } from '../shared/types';
// CSS imported as text via esbuild
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../shared/dataLoader';
import { registerMessageHandler } from '../shared/messageHandler';
import { getModelDisplayName } from '../shared/modelUtils';
import { sanitizeCustomizationMatrix } from './customizationSanitizer';

type ModelSwitchingAnalysis = BaseModelSwitchingAnalysis & {
	minModelsPerSession: number;
	standardRequests: number;
	premiumRequests: number;
	unknownRequests: number;
	totalRequests: number;
};

type UsageAnalysisPeriod = {
	sessions: number;
	toolCalls: ToolCallUsage;
	modeUsage: ModeUsage;
	contextReferences: ContextReferenceUsage;
	mcpTools: McpToolUsage;
	modelSwitching: ModelSwitchingAnalysis;
	thinkingEffortUsage?: {
		byEffort: { [effort: string]: number };
		sessionCount: number;
		switchCount: number;
	};
};

type TodaySessionSummary = {
	title: string | null;
	filePath: string;
	interactions: number;
	toolCalls: number;
	inputTokens: number;
	outputTokens: number;
	thinkingTokens: number;
	cachedTokens: number;
	totalTokens: number;
	estimatedCost: number;
	editor: string;
	models: string[];
	lastActivity: string;
};

type InsightSeverity = 'tip' | 'opportunity' | 'celebration';
type InsightStatus = 'new' | 'seen' | 'dismissed' | 'snoozed' | 'done';

type EvaluatedInsight = {
	id: string;
	category: string;
	severity: InsightSeverity;
	title: string;
	body: string;
	actionLabel?: string;
	actionCommand?: string;
	status: InsightStatus;
	allowToast?: boolean;
};

type UsageAnalysisStats = {
	today: UsageAnalysisPeriod;
	last30Days: UsageAnalysisPeriod;
	month: UsageAnalysisPeriod;
	locale?: string;
	lastUpdated: string;
	customizationMatrix?: WorkspaceCustomizationMatrix | null;
	missedPotential?: MissedPotentialWorkspace[];
	backendConfigured?: boolean;
	currentWorkspacePaths?: string[];
	suppressedUnknownTools?: string[];
	todaySessions?: TodaySessionSummary[];
	use24HourTime?: boolean;
	insights?: EvaluatedInsight[];
};

declare function acquireVsCodeApi<TState = unknown>(): {
	postMessage: (message: unknown) => void;
	setState: (newState: TState) => void;
	getState: () => TState | undefined;
};

interface CustomizationFileEntry {
	path: string;
	relativePath: string;
	type: string;
	icon?: string;
	label?: string;
	name?: string;
	lastModified?: string;
	isStale?: boolean;
	category?: 'copilot' | 'non-copilot';
}

type CustomizationTypeStatus = '✅' | '⚠️' | '❌';

/**
 * Returns a modern styled HTML badge for a status value, replacing plain emoji icons.
 * Pass/fresh → green ✓, warning/stale → amber !, fail/missing → red ✕
 */
function statusBadgeHtml(status: CustomizationTypeStatus | string, label?: string): string {
	const titleAttr = label ? ` title="${escapeHtml(label)}"` : '';
	const base = 'display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:4px;font-weight:700;flex-shrink:0;';
	if (status === '✅') {
		return `<span style="${base}background:rgba(34,197,94,0.2);border:1px solid rgba(34,197,94,0.5);color:#4ade80;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? 'Present and fresh')}">✓</span>`;
	} else if (status === '⚠️') {
		return `<span style="${base}background:rgba(251,191,36,0.2);border:1px solid rgba(251,191,36,0.5);color:#fbbf24;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? 'Present but stale')}">!</span>`;
	} else {
		return `<span style="${base}background:rgba(239,68,68,0.2);border:1px solid rgba(239,68,68,0.5);color:#f87171;font-size:12px;"${titleAttr} aria-label="${escapeHtml(label ?? 'Missing')}">✕</span>`;
	}
}

interface WorkspaceCustomizationRow {
	workspacePath: string;
	workspaceName: string;
	sessionCount: number;
	interactionCount: number;
	typeStatuses: { [typeId: string]: CustomizationTypeStatus };
}

interface WorkspaceCustomizationMatrix {
	customizationTypes: Array<{ id: string; icon: string; label: string }>;
	workspaces: WorkspaceCustomizationRow[];
	totalWorkspaces: number;
	workspacesWithIssues: number;
}

interface MissedPotentialWorkspace {
	workspacePath: string;
	workspaceName: string;
	sessionCount: number;
	interactionCount: number;
	nonCopilotFiles: CustomizationFileEntry[];
}

/** Shape of hygiene check items returned by the extension host. */
interface RepoHygieneCheck {
	readonly id?: string;
	readonly label?: string;
	readonly detail?: string;
	readonly hint?: string;
	readonly weight?: number;
	readonly status?: string;
	readonly category?: string;
}

/** Shape of recommendation items returned by the extension host. */
interface RepoHygieneRecommendation {
	readonly action?: string;
	readonly impact?: string;
	readonly weight?: number;
	readonly priority?: string;
}

/** Shape of a full repo-hygiene analysis result. */
interface RepoAnalysisData {
	summary?: {
		percentage?: number;
		passedChecks?: number;
		warningChecks?: number;
		failedChecks?: number;
		totalScore?: number;
		maxScore?: number;
		categories?: Record<string, { percentage?: number }>;
	};
	checks?: RepoHygieneCheck[];
	recommendations?: RepoHygieneRecommendation[];
}
interface RepoAnalysisRecord {
	data?: RepoAnalysisData;
	error?: string;
}

const vscode = acquireVsCodeApi();
type InitialUsageData = UsageAnalysisStats & { customizationMatrix?: WorkspaceCustomizationMatrix | null; missedPotential?: MissedPotentialWorkspace[] };
const initialData = getWindowData<InitialUsageData>('__INITIAL_USAGE__');
let hygieneMatrixState: WorkspaceCustomizationMatrix | null = null;
const repoAnalysisState = new Map<string, RepoAnalysisRecord>();
let selectedRepoPath: string | null = null;
let isSwitchingRepository = false;
let isBatchAnalysisInProgress = false;
let currentWorkspacePaths: string[] = [];
let activeTab = 'activity';
let loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;
let currentInsights: EvaluatedInsight[] = [];

function clearLoadingTimeout(): void {
	if (loadingTimeoutId !== null) {
		clearTimeout(loadingTimeoutId);
		loadingTimeoutId = null;
	}
}

/** Creates a styled Refresh button that posts `refresh` to the extension host. */
function createRefreshButton(): HTMLButtonElement {
	const btn = document.createElement('button');
	btn.textContent = '🔄 Refresh';
	btn.style.cssText = 'padding: 6px 16px; cursor: pointer; border: 1px solid var(--vscode-button-border, transparent); background: var(--vscode-button-background, #0e639c); color: var(--vscode-button-foreground, #fff); border-radius: 2px; font-size: 13px;';
	btn.addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));
	return btn;
}

function showLoadError(message: string): void {
	const root = document.getElementById('root');
	if (!root) { return; }
	const container = document.createElement('div');
	container.style.cssText = 'padding: 32px; text-align: center; font-size: 14px;';
	const icon = document.createElement('div');
	icon.style.cssText = 'font-size: 24px; margin-bottom: 12px;';
	icon.innerHTML = statusBadgeHtml('❌', 'Error');
	const msg = document.createElement('div');
	msg.style.cssText = 'color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;';
	msg.textContent = message;
	container.append(icon, msg, createRefreshButton());
	root.textContent = '';
	root.append(container);
}

// State for the Repository PRs tab
let repoPrStatsLoaded = false;
let repoPrStatsData: RepoPrStatsResult | null = null;

// State for the Cloud Agent tab
let agentSessionsLoaded = false;
let agentSessionsData: AgentSessionsResult | null = null;

type RepoPrDetail = {
  number: number;
  title: string;
  url: string;
  aiType: 'copilot' | 'claude' | 'openai' | 'other-ai';
  role: 'author' | 'reviewer-requested';
};

type RepoPrInfo = {
  owner: string;
  repo: string;
  repoUrl: string;
  totalPrs: number;
  aiAuthoredPrs: number;
  aiReviewRequestedPrs: number;
  aiDetails: RepoPrDetail[];
  error?: string;
};

type RepoPrStatsResult = {
  repos: RepoPrInfo[];
  authenticated: boolean;
  since: string;
};

type AgentRepoSummary = {
  owner: string;
  repo: string;
  /** Pre-validated safe https URL for this repo. */
  repoUrl: string;
  totalTasks: number;
  totalSessions: number;
  totalCredits: number;
  tasksScanned: number;
  tasksTotal: number;
  partial: boolean;
  error?: string;
};

type AgentSessionsResult = {
  repos: AgentRepoSummary[];
  totalTasks: number;
  totalSessions: number;
  totalCredits: number;
  authenticated: boolean;
  since: string;
  fetchedAt: string;
};

const EFFORT_DISPLAY_NAMES: Record<string, string> = {
	xhigh: 'Extra High',
};

function getEffortDisplayName(level: string): string {
	return EFFORT_DISPLAY_NAMES[level] ?? level;
}

import toolNames from '../../toolNames.json';
import automaticToolIds from '../../automaticTools.json';
import { resolveGuidMcpToolName, isGuidMcpTool } from '../../utils/toolUtils';

let TOOL_NAME_MAP: { [key: string]: string } | null = toolNames || null;
const AUTOMATIC_TOOL_SET_WV = new Set<string>((automaticToolIds as string[]).map(id => id.toLowerCase()));

function lookupToolName(id: string): string {
	if (!TOOL_NAME_MAP) {
		return id;
	}
	return TOOL_NAME_MAP[id] ?? TOOL_NAME_MAP[id.toLowerCase()] ?? resolveGuidMcpToolName(id) ?? id;
}

function lookupMcpToolName(id: string): string {
	const full = lookupToolName(id);
	// Strip the server prefix (e.g. "GitHub MCP (Local): Issue Read" → "Issue Read")
	const colonIdx = full.indexOf(':');
	if (colonIdx !== -1) {
		return full.substring(colonIdx + 1).trim();
	}
	return full;
}

function getUnknownMcpTools(stats: UsageAnalysisStats): string[] {
	const allTools = new Set<string>();
	
	// Collect all MCP tools from all periods
	Object.entries(stats.today.mcpTools.byTool).forEach(([tool]) => allTools.add(tool));
	Object.entries(stats.last30Days.mcpTools.byTool).forEach(([tool]) => allTools.add(tool));
	Object.entries(stats.month.mcpTools.byTool).forEach(([tool]) => allTools.add(tool));
	// Also collect all general tool calls so non-MCP tools without friendly names are caught
	Object.entries(stats.today.toolCalls.byTool).forEach(([tool]) => allTools.add(tool));
	Object.entries(stats.last30Days.toolCalls.byTool).forEach(([tool]) => allTools.add(tool));
	Object.entries(stats.month.toolCalls.byTool).forEach(([tool]) => allTools.add(tool));

	const suppressed = new Set<string>(stats.suppressedUnknownTools ?? []);
	
	// Filter to only unknown tools (not a key in the map, case-insensitively) and not suppressed
	return Array.from(allTools).filter(tool => !TOOL_NAME_MAP?.[tool] && !TOOL_NAME_MAP?.[tool.toLowerCase()] && !isGuidMcpTool(tool) && !suppressed.has(tool)).sort();
}

function createMcpToolIssueUrl(unknownTools: string[]): string {
	const repoUrl = 'https://github.com/rajbos/ai-engineering-fluency';
	const title = encodeURIComponent('Add missing friendly names for tools');
	const toolList = unknownTools.map(tool => `- \`${tool}\``).join('\n');
	const body = encodeURIComponent(
		`## Unknown Tools Found\n\n` +
		`The following tools were detected but don't have friendly display names:\n\n` +
		`${toolList}\n\n` +
		`Please add friendly names for these tools to improve the user experience.`
	);
	const labels = encodeURIComponent('MCP Toolnames');
	
	return `${repoUrl}/issues/new?title=${title}&body=${body}&labels=${labels}`;
}

// ─── Mode bar chart helpers ────────────────────────────────────────────────────

type ModeBarConfig = {
readonly label: string;
readonly key: keyof ModeUsage;
readonly gradient: string;
};

const MODE_BAR_CONFIGS: readonly ModeBarConfig[] = [
{ label: '\u{1F4AC} Ask Mode',    key: 'ask',         gradient: 'linear-gradient(90deg, #3b82f6, #60a5fa)' },
{ label: '\u270F\uFE0F Edit Mode',   key: 'edit',        gradient: 'linear-gradient(90deg, #10b981, #34d399)' },
{ label: '\u{1F916} Agent Mode',  key: 'agent',       gradient: 'linear-gradient(90deg, #7c3aed, #a855f7)' },
{ label: '\u{1F4CB} Plan Mode',   key: 'plan',        gradient: 'linear-gradient(90deg, #f59e0b, #fbbf24)' },
{ label: '\u26A1 Custom Agent',   key: 'customAgent', gradient: 'linear-gradient(90deg, #ec4899, #f472b6)' },
{ label: '\u{1F5A5}\uFE0F CLI',   key: 'cli',         gradient: 'linear-gradient(90deg, #06b6d4, #22d3ee)' },
];

/** Renders a single horizontal bar item for the mode usage chart. */
function renderModeBarItem(label: string, count: number, total: number, gradient: string): string {
const pct = total > 0 ? (count / total) * 100 : 0;
return `
<div class="bar-item">
<div class="bar-label"><span>${label}</span><span><strong>${formatNumber(count)}</strong> (${formatPercent(pct, 0)})</span></div>
<div class="bar-track"><div class="bar-fill" style="width: ${pct.toFixed(1)}%; background: ${gradient};"></div></div>
</div>`;
}

/** Renders the full bar-chart column for a single time period's mode usage. */
function renderModeBarChart(modeUsage: ModeUsage, title: string): string {
const total = modeUsage.ask + modeUsage.edit + modeUsage.agent + modeUsage.plan + modeUsage.customAgent + modeUsage.cli;
const bars = MODE_BAR_CONFIGS
.map(({ label, key, gradient }) => renderModeBarItem(label, modeUsage[key], total, gradient))
.join('');
return `
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${title}</h4>
<div class="bar-chart">${bars}
</div>
</div>`;
}

// ─── Multi-model period helper ──────────────────────────────────────────────────

/** Renders one column of the Multi-Model Usage section for a single time period. */
function renderMultiModelPeriod(
title: string,
switching: ModelSwitchingAnalysis,
allStandardModels: readonly string[],
allPremiumModels: readonly string[],
allUnknownModels: readonly string[],
): string {
return `
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${title}</h4>
<div class="stats-grid" style="grid-template-columns: 1fr;">
<div class="stat-card">
<div class="stat-label">\u{1F4CA} Avg Models per Conversation</div>
<div class="stat-value">${formatFixed(switching.averageModelsPerSession, 1)}</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F504} Switching Frequency</div>
<div class="stat-value">${formatPercent(switching.switchingFrequency, 0)}</div>
<div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Sessions with &gt;1 model</div>
</div>
<div class="stat-card">
<div class="stat-label">\u{1F4C8} Max Models in Session</div>
<div class="stat-value">${formatNumber(switching.maxModelsPerSession || 0)}</div>
</div>
</div>
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Tier:</div>
<div style="min-height: 90px;">
${allStandardModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--link-color);">\u{1F535} Standard:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allStandardModels.map(escapeHtml).join(', ')}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allPremiumModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--warning-fg);">\u2B50 Premium:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allPremiumModels.map(escapeHtml).join(', ')}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allUnknownModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--text-muted);">\u2753 Unknown:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allUnknownModels.map(escapeHtml).join(', ')}</span>
</div>
` : ''}
</div>
${switching.totalRequests > 0 ? `
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 65px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${switching.standardRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">\u{1F535} Standard: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.standardRequests)} (${formatPercent((switching.standardRequests / switching.totalRequests) * 100)})</span>
</div>
` : ''}
${switching.premiumRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">\u2B50 Premium: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.premiumRequests)} (${formatPercent((switching.premiumRequests / switching.totalRequests) * 100)})</span>
</div>
` : ''}
${switching.unknownRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">\u2753 Unknown: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.unknownRequests)} (${formatPercent((switching.unknownRequests / switching.totalRequests) * 100)})</span>
</div>
` : ''}
</div>
` : ''}
${switching.mixedTierSessions > 0 ? `
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">\u{1F500} Mixed tier sessions: ${formatNumber(switching.mixedTierSessions)}</span>
</div>
` : ''}
</div>
</div>`;
}

// ─── Progress panel helper ──────────────────────────────────────────────────────

/**
 * Updates (or creates) a progress indicator inside a container element.
 * Strips existing non-title/subtitle children on first call; updates text on subsequent calls.
 */
function updateProgressPanel(
selector: string,
progressClass: string,
messagePrefix: string,
done: number,
total: number,
): void {
const container = document.querySelector(selector);
if (!container) { return; }
const pct = total > 0 ? Math.round((done / total) * 100) : 0;
const message = `${messagePrefix} ${done}/${total} repos (${pct}%)`;
const existing = container.querySelector(`.${progressClass}`);
if (existing) {
existing.textContent = message;
} else {
// First progress update — remove static placeholder content (keep title/subtitle divs)
Array.from(container.children).forEach(child => {
const htmlEl = child as HTMLElement;
if (!htmlEl.classList.contains('section-title') && !htmlEl.classList.contains('section-subtitle')) {
htmlEl.remove();
}
});
const div = document.createElement('div');
div.className = progressClass;
div.style.cssText = 'margin-top:8px; font-size:12px; color:var(--text-secondary);';
div.textContent = message;
container.appendChild(div);
}
}

function renderMissedPotential(stats: UsageAnalysisStats): string {
	const missed = stats.missedPotential || initialData?.missedPotential || [];
	if (missed.length === 0) {
		return `
			<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--success-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
					${statusBadgeHtml('✅')} No other AI tool configs missing a Copilot counterpart
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 8px;">
					All active workspaces that contain instruction files for other AI tools (e.g. .cursorrules, CLAUDE.md, AGENTS.md) also have Copilot customization files configured.
				</div>
				<div style="font-size: 11px; color: var(--text-secondary);">
					A workspace appears here when it has instruction files for other AI tools but no Copilot customization files — indicating Copilot may be under-configured compared to other tools. <a href="https://code.visualstudio.com/docs/copilot/customization/custom-instructions" style="color: var(--link-color);" target="_blank">Learn how to add Copilot instructions</a>.
				</div>
			</div>
		`;
	}

	return `
        <div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: rgba(251, 191, 36, 0.1); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 6px;">
            <div style="font-size: 13px; font-weight: 600; color: var(--warning-fg); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
                ${statusBadgeHtml('⚠️')} Missed Potential: Non-Copilot Instruction Files
            </div>
            <div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
                These active workspaces use other AI tools but lack Copilot customizations. <a href="https://code.visualstudio.com/docs/copilot/customization/custom-instructions" style="color: var(--link-color);" target="_blank">Learn how to add Copilot instructions</a>.
            </div>
            <div class="customization-matrix-container">
                <table class="customization-matrix">
                    <thead>
                        <tr>
                            <th style="text-align: left; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">📂 Workspace</th>
                            <th style="text-align: center; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">Sessions</th>
                            <th style="text-align: center; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">Interactions</th>
                            <th style="text-align: left; padding: 8px; border-bottom: 2px solid rgba(251, 191, 36, 0.2);">Non-Copilot Files Found</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${missed.map(ws => `
                            <tr style="background: rgba(251, 191, 36, 0.05);">
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); font-family: 'Courier New', monospace; font-size: 12px;">
                                    ${escapeHtml(ws.workspaceName)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${formatNumber(ws.sessionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2); text-align: center; color: var(--text-primary);">
                                    ${formatNumber(ws.interactionCount)}
                                </td>
                                <td style="padding: 6px 8px; border-bottom: 1px solid rgba(251, 191, 36, 0.2);">
                                    <div style="display: flex; flex-direction: column; gap: 4px;">
                                        ${ws.nonCopilotFiles.map(f => `
                                            <div style="font-size: 11px; display: flex; align-items: center; gap: 6px;">
                                                <span>${escapeHtml(f.icon || '📄')}</span>
                                                <span style="font-weight: 500;">${escapeHtml(f.label || '')}:</span>
                                                <span style="font-family: monospace; color: var(--text-muted);">${escapeHtml(f.relativePath)}</span>
                                            </div>
                                        `).join('')}
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderToolsTable(byTool: { [key: string]: number }, limit = 10, nameResolver: (id: string) => string = lookupToolName): string {
	const sortedTools = Object.entries(byTool)
		.sort(([, a], [, b]) => b - a)
		.slice(0, limit);

	if (sortedTools.length === 0) {
		return '<div style="color: var(--text-muted);">No tools used yet</div>';
	}

	    const rows = sortedTools.map(([tool, count], idx) => {
		const friendly = escapeHtml(nameResolver(tool));
		const idEscaped = escapeHtml(tool);
		const autoBadge = AUTOMATIC_TOOL_SET_WV.has(tool.toLowerCase())
			? `<span class="auto-badge" title="Automatic tool — Copilot uses this internally and it does not count toward fluency scoring">auto</span>`
			: '';
		return `
		    <tr>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); width:40px; max-width:40px; text-align:center;">${idx + 1}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); word-break:break-word; overflow-wrap:break-word; max-width:0;"> <strong title="${idEscaped}">${friendly}</strong>${autoBadge}</td>
			    <td style="padding:8px 12px; border-bottom:1px solid var(--border-subtle); text-align:right; width:90px; white-space:nowrap;">${formatNumber(count)}</td>
		    </tr>`;
	    }).join('');

	return `
		<table style="width:100%; border-collapse:collapse; table-layout:fixed;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:12px; text-align:left;">
					<th style="padding:8px 12px; opacity:0.9; width:40px;">#</th>
					<th style="padding:8px 12px; opacity:0.9;">Tool</th>
					<th style="padding:8px 12px; opacity:0.9; text-align:right; width:90px;">Calls</th>
				</tr>
			</thead>
			<tbody>
				${rows}
			</tbody>
		</table>`;
}

// --- Today's Sessions table with sortable columns ---
type SessionSortColumn = 'title' | 'interactions' | 'toolCalls' | 'inputTokens' | 'outputTokens' | 'thinkingTokens' | 'cachedTokens' | 'totalTokens' | 'estimatedCost' | 'editor' | 'lastActivity';
let sessionSortColumn: SessionSortColumn = 'interactions';
let sessionSortDirection: 'asc' | 'desc' = 'desc';
let cachedTodaySessions: TodaySessionSummary[] = [];
let use24HourTime = true;

function getSessionSortIndicator(column: SessionSortColumn): string {
	if (sessionSortColumn !== column) { return ''; }
	return sessionSortDirection === 'desc' ? ' ▼' : ' ▲';
}

function sortTodaySessions(sessions: TodaySessionSummary[]): TodaySessionSummary[] {
	return [...sessions].sort((a, b) => {
		let cmp = 0;
		switch (sessionSortColumn) {
			case 'title':
				cmp = (a.title || '').localeCompare(b.title || '');
				break;
			case 'editor':
				cmp = (a.editor || '').localeCompare(b.editor || '');
				break;
			case 'lastActivity':
				cmp = (a.lastActivity || '').localeCompare(b.lastActivity || '');
				break;
			default:
				cmp = (a[sessionSortColumn] as number) - (b[sessionSortColumn] as number);
				break;
		}
		return sessionSortDirection === 'desc' ? -cmp : cmp;
	});
}

function renderTodaySessionsTable(sessions: TodaySessionSummary[]): string {
	cachedTodaySessions = sessions;
	if (!sessions || sessions.length === 0) {
		return '<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">No sessions recorded today yet.</div>';
	}
	return `<div id="sessions-table-container">${buildSessionsTableHtml(sessions)}</div>`;
}

function buildSessionsTableHtml(sessions: TodaySessionSummary[]): string {
	const sorted = sortTodaySessions(sessions);
	const rows = sorted.map((s, idx) => {
		const title = escapeHtml(s.title || 'Untitled session');
		const filePath = escapeHtml(s.filePath || '');
		const models = s.models.map(m => escapeHtml(getModelDisplayName(m))).join(', ') || '—';
		const editor = escapeHtml(s.editor || 'unknown');
		const cost = s.estimatedCost > 0 ? `$${s.estimatedCost.toFixed(4)}` : '—';
		const time = s.lastActivity ? new Date(s.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !use24HourTime }) : '—';
		return `<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${idx + 1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${title}&quot;"><a href="#" class="session-title-link" data-file="${filePath}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${title}</a></td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s.interactions)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s.toolCalls)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s.inputTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s.outputTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s.thinkingTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s.cachedTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${formatNumber(s.totalTokens)}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); text-align:right; font-size:12px;">${cost}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px;">${editor}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${models}">${models}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; white-space:nowrap; text-align:right;">${time}</td>
		</tr>`;
	}).join('');

	return `
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:900px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${getSessionSortIndicator('title')}</th>
					<th class="sortable" data-sort="interactions" style="padding:6px 8px; text-align:right;">Turns${getSessionSortIndicator('interactions')}</th>
					<th class="sortable" data-sort="toolCalls" style="padding:6px 8px; text-align:right;">Tools${getSessionSortIndicator('toolCalls')}</th>
					<th class="sortable" data-sort="inputTokens" style="padding:6px 8px; text-align:right;">Input${getSessionSortIndicator('inputTokens')}</th>
					<th class="sortable" data-sort="outputTokens" style="padding:6px 8px; text-align:right;">Output${getSessionSortIndicator('outputTokens')}</th>
					<th class="sortable" data-sort="thinkingTokens" style="padding:6px 8px; text-align:right;">Thinking${getSessionSortIndicator('thinkingTokens')}</th>
					<th class="sortable" data-sort="cachedTokens" style="padding:6px 8px; text-align:right;">Cached${getSessionSortIndicator('cachedTokens')}</th>
					<th class="sortable" data-sort="totalTokens" style="padding:6px 8px; text-align:right;">Total${getSessionSortIndicator('totalTokens')}</th>
					<th class="sortable" data-sort="estimatedCost" style="padding:6px 8px; text-align:right;">Cost${getSessionSortIndicator('estimatedCost')}</th>
					<th class="sortable" data-sort="editor" style="padding:6px 8px;">Editor${getSessionSortIndicator('editor')}</th>
					<th style="padding:6px 8px;">Models</th>
					<th class="sortable" data-sort="lastActivity" style="padding:6px 8px; text-align:right;">Last Active${getSessionSortIndicator('lastActivity')}</th>
				</tr>
			</thead>
			<tbody>
				${rows}
			</tbody>
		</table>
		</div>`;
}

function setupSessionsTableSort(): void {
	const container = document.getElementById('sessions-table-container');
	if (!container) { return; }
	container.addEventListener('click', (e) => {
		// Handle session title link clicks → open in log viewer
		const link = (e.target as HTMLElement).closest<HTMLAnchorElement>('a.session-title-link');
		if (link) {
			e.preventDefault();
			const file = link.getAttribute('data-file');
			if (file) {
				vscode.postMessage({ command: 'openSessionFile', file });
			}
			return;
		}
		// Handle sortable column header clicks
		const th = (e.target as HTMLElement).closest<HTMLElement>('th.sortable');
		if (!th) { return; }
		const col = th.getAttribute('data-sort') as SessionSortColumn;
		if (!col) { return; }
		if (sessionSortColumn === col) {
			sessionSortDirection = sessionSortDirection === 'desc' ? 'asc' : 'desc';
		} else {
			sessionSortColumn = col;
			sessionSortDirection = 'desc';
		}
		container.innerHTML = buildSessionsTableHtml(cachedTodaySessions);
	});
}

function unionFill(map: { [key: string]: number }, keys: string[]): { [key: string]: number } {
	const result: { [key: string]: number } = { ...map };
	for (const k of keys) {
		if (!(k in result)) { result[k] = 0; }
	}
	return result;
}

function coerceNumber(value: any): number {
	const n = Number(value);
	return Number.isFinite(n) ? n : 0;
}

function sanitizeModeUsage(mode: any): ModeUsage {
	const m = (mode && typeof mode === 'object') ? mode : {};
	return {
		ask: coerceNumber(m.ask),
		edit: coerceNumber(m.edit),
		agent: coerceNumber(m.agent),
		plan: coerceNumber(m.plan),
		customAgent: coerceNumber(m.customAgent),
		cli: coerceNumber(m.cli),
	};
}

function sanitizeContextRefs(refs: any): ContextReferenceUsage {
	const r = (refs && typeof refs === 'object') ? refs : {};
	return {
		file: coerceNumber(r.file),
		selection: coerceNumber(r.selection),
		implicitSelection: coerceNumber(r.implicitSelection),
		symbol: coerceNumber(r.symbol),
		codebase: coerceNumber(r.codebase),
		workspace: coerceNumber(r.workspace),
		terminal: coerceNumber(r.terminal),
		vscode: coerceNumber(r.vscode),
		terminalLastCommand: coerceNumber(r.terminalLastCommand),
		terminalSelection: coerceNumber(r.terminalSelection),
		clipboard: coerceNumber(r.clipboard),
		changes: coerceNumber(r.changes),
		outputPanel: coerceNumber(r.outputPanel),
		problemsPanel: coerceNumber(r.problemsPanel),
		pullRequest: coerceNumber(r.pullRequest),
		byKind: r.byKind ?? {},
		copilotInstructions: coerceNumber(r.copilotInstructions),
		agentsMd: coerceNumber(r.agentsMd),
		byPath: r.byPath ?? {},
	};
}

function sanitizePeriod(period: any): UsageAnalysisPeriod {
	const p = (period && typeof period === 'object') ? period : {};
	const toolCalls = (p.toolCalls && typeof p.toolCalls === 'object') ? p.toolCalls : {};
	const mcpTools = (p.mcpTools && typeof p.mcpTools === 'object') ? p.mcpTools : {};
	return {
		sessions: coerceNumber(p.sessions),
		modeUsage: sanitizeModeUsage(p.modeUsage),
		contextReferences: sanitizeContextRefs(p.contextReferences),
		toolCalls: {
			total: coerceNumber(toolCalls.total),
			byTool: toolCalls.byTool ?? {},
		},
		mcpTools: {
			total: coerceNumber(mcpTools.total),
			byServer: mcpTools.byServer ?? {},
			byTool: mcpTools.byTool ?? {},
		},
		modelSwitching: p.modelSwitching ?? {
			modelsPerSession: [],
			totalSessions: 0,
			averageModelsPerSession: 0,
			maxModelsPerSession: 0,
			minModelsPerSession: 0,
			switchingFrequency: 0,
			standardModels: [],
			premiumModels: [],
			unknownModels: [],
			mixedTierSessions: 0,
			standardRequests: 0,
			premiumRequests: 0,
			unknownRequests: 0,
			totalRequests: 0,
		},
		thinkingEffortUsage: p.thinkingEffortUsage,
	};
}

function sanitizeInsights(rawInsights: any[]): EvaluatedInsight[] {
	return rawInsights
		.filter((i: any) => i && typeof i === 'object' && typeof i.id === 'string')
		.map((i: any): EvaluatedInsight => ({
			id: String(i.id),
			category: typeof i.category === 'string' ? i.category : 'general',
			severity: (['tip', 'opportunity', 'celebration'].includes(i.severity) ? i.severity : 'tip') as InsightSeverity,
			title: typeof i.title === 'string' ? i.title : '',
			body: typeof i.body === 'string' ? i.body : '',
			actionLabel: typeof i.actionLabel === 'string' ? i.actionLabel : undefined,
			actionCommand: typeof i.actionCommand === 'string' ? i.actionCommand : undefined,
			status: (['new', 'seen', 'dismissed', 'snoozed', 'done'].includes(i.status) ? i.status : 'new') as InsightStatus,
			allowToast: !!i.allowToast,
		}));
}

function sanitizeStats(raw: any): UsageAnalysisStats | null {
	if (!raw || typeof raw !== 'object') {
		return null;
	}

	try {
		const sanitized: UsageAnalysisStats = {
			today: sanitizePeriod(raw.today),
			last30Days: sanitizePeriod(raw.last30Days),
			month: sanitizePeriod(raw.month),
			lastUpdated: typeof raw.lastUpdated === 'string' ? raw.lastUpdated : '',
			backendConfigured: !!raw.backendConfigured,
			locale: typeof raw.locale === 'string' ? raw.locale : undefined,
			currentWorkspacePaths: Array.isArray(raw.currentWorkspacePaths)
				? raw.currentWorkspacePaths.filter((p: unknown) => typeof p === 'string') as string[]
				: undefined,
			suppressedUnknownTools: Array.isArray(raw.suppressedUnknownTools)
				? raw.suppressedUnknownTools.filter((t: unknown) => typeof t === 'string') as string[]
				: undefined,
		};

		// Sanitize customizationMatrix (avoid pass-through of untrusted nested fields)
		const safeMatrix = sanitizeCustomizationMatrix(raw.customizationMatrix);
		if (safeMatrix) {
			// sanitizeCustomizationMatrix returns WorkspaceCustomizationMatrix from types.ts;
			// the local WorkspaceCustomizationMatrix interface is structurally identical.
			sanitized.customizationMatrix = safeMatrix as WorkspaceCustomizationMatrix;
		}

		// Validated pass-through for missedPotential (array of objects)
		if (Array.isArray(raw.missedPotential)) {
			sanitized.missedPotential = raw.missedPotential.filter(
				(w: any) => w && typeof w === 'object' && typeof w.workspacePath === 'string'
			) as MissedPotentialWorkspace[];
		}

		// Pass-through todaySessions (array of session summary objects)
		if (Array.isArray(raw.todaySessions)) {
			sanitized.todaySessions = raw.todaySessions.filter(
				(s: any) => s && typeof s === 'object' && typeof s.interactions === 'number'
			) as TodaySessionSummary[];
		}

		// Sanitize insights
		if (Array.isArray(raw.insights)) {
			sanitized.insights = sanitizeInsights(raw.insights);
		}

		return sanitized;
	} catch {
		return null;
	}
}

function setupTabs(): void {
	const tabButtons = document.querySelectorAll<HTMLElement>('.tab-button');
	tabButtons.forEach(button => {
		button.addEventListener('click', () => {
			const tab = button.getAttribute('data-tab');
			if (!tab) { return; }
			activeTab = tab;
			tabButtons.forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tab));
			document.querySelectorAll<HTMLElement>('.tab-panel').forEach(panel => {
				panel.style.display = 'none';
			});
			const activePanel = document.getElementById(`tab-panel-${tab}`);
			if (activePanel) { activePanel.style.display = 'block'; }
			// Lazy-load repo PR stats on first visit to the tab
			if (tab === 'repos' && !repoPrStatsLoaded) {
				repoPrStatsLoaded = true;
				vscode.postMessage({ command: 'loadRepoPrStats' });
			}
			// Lazy-load cloud agent sessions on first visit to the tab
			if (tab === 'agent' && !agentSessionsLoaded) {
				agentSessionsLoaded = true;
				vscode.postMessage({ command: 'loadAgentSessions' });
			}
			// Mark new insights as seen when visiting the Insights tab
			if (tab === 'insights') {
				currentInsights
					.filter(i => i.status === 'new')
					.forEach(i => vscode.postMessage({ command: 'insightAction', id: i.id, action: 'seen' }));
			}
		});
	});
}

function toSafeNumber(value: unknown): number {
	const n = Number(value);
	return Number.isFinite(n) && n >= 0 ? n : 0;
}

function toSafeHttpUrl(value: unknown): string {
	const raw = typeof value === 'string' ? value.trim() : '';
	try {
		const parsed = new URL(raw);
		if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
			return parsed.toString();
		}
	} catch {
		// Ignore invalid URL and fall back to placeholder.
	}
	return '#';
}

function sanitizeRepoPrStatsData(input: unknown): RepoPrStatsResult {
	const src = (input && typeof input === 'object') ? (input as Record<string, unknown>) : {};
	const repos = Array.isArray(src.repos) ? src.repos : [];
	return {
		authenticated: Boolean(src.authenticated),
		since: typeof src.since === 'string' || typeof src.since === 'number' ? src.since : Date.now(),
		repos: repos.map((repo) => {
			const r = (repo && typeof repo === 'object') ? (repo as Record<string, unknown>) : {};
			const aiDetails = Array.isArray(r.aiDetails) ? r.aiDetails : [];
			return {
				repoUrl: toSafeHttpUrl(r.repoUrl),
				owner: escapeHtml(typeof r.owner === 'string' ? r.owner : ''),
				repo: escapeHtml(typeof r.repo === 'string' ? r.repo : ''),
				error: typeof r.error === 'string' ? escapeHtml(r.error) : '',
				totalPrs: toSafeNumber(r.totalPrs),
				aiAuthoredPrs: toSafeNumber(r.aiAuthoredPrs),
				aiReviewRequestedPrs: toSafeNumber(r.aiReviewRequestedPrs),
				aiDetails: aiDetails.map((d) => {
					const detail = (d && typeof d === 'object') ? (d as Record<string, unknown>) : {};
					const validAiTypes = ['copilot', 'claude', 'openai', 'other-ai'] as const;
					const validRoles = ['author', 'reviewer-requested'] as const;
					const aiType = validAiTypes.includes(detail.aiType as typeof validAiTypes[number])
						? detail.aiType as typeof validAiTypes[number]
						: 'other-ai';
					const role = validRoles.includes(detail.role as typeof validRoles[number])
						? detail.role as typeof validRoles[number]
						: 'author';
					return {
						number: toSafeNumber(detail.number),
						title: escapeHtml(typeof detail.title === 'string' ? detail.title : ''),
						url: toSafeHttpUrl(detail.url),
						aiType,
						role,
					};
				}),
			};
		}),
	} as RepoPrStatsResult;
}

function renderReposPrContent(data: RepoPrStatsResult): string {
	const sinceDate = escapeHtml(new Date(data.since).toLocaleDateString());
	if (!data.authenticated) {
		return `
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>🔒 GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see AI PR activity across your repositories.
			</div>`;
	}
	if (data.repos.length === 0) {
		return `
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;
	}

	const aiLabel: Record<string, string> = {
		copilot: '🤖 Copilot',
		claude: '🧠 Claude',
		openai: '✨ Codex',
		'other-ai': '🤖 AI',
	};

	// Cell style shared across data rows — matches the customization matrix look
	const cell = 'padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);';
	const cellCenter = `${cell} text-align: center;`;

	const rows = data.repos.map((r) => {
		const repoLink = `<a href="${escapeHtml(r.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${escapeHtml(r.owner)}/${escapeHtml(r.repo)}</a>`;
		if (r.error) {
			return `<tr>
				<td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}</td>
				<td colspan="3" style="${cell} color:var(--text-secondary); font-style:italic; font-size:12px;">${escapeHtml(r.error)}</td>
			</tr>`;
		}
		// Collapsible detail list
		let detailsHtml = '';
		if (r.aiDetails.length > 0) {
			const items = r.aiDetails.map(d =>
				`<li><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${d.number} ${escapeHtml(d.title)}</a> — ${aiLabel[d.aiType] ?? escapeHtml(String(d.aiType))} (${d.role === 'author' ? 'authored' : 'review requested'})</li>`
			).join('');
			detailsHtml = `
				<details style="margin-top:4px; font-size:11px;">
					<summary style="cursor:pointer; color:var(--text-secondary);">Show ${r.aiDetails.length} detail(s)</summary>
					<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${items}</ul>
				</details>`;
		}
		return `<tr>
			<td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}${detailsHtml}</td>
			<td style="${cellCenter} font-weight:600;">${r.totalPrs}</td>
			<td style="${cellCenter}">${r.aiAuthoredPrs > 0 ? `<span style="font-weight:600;">${r.aiAuthoredPrs}</span>` : '0'}</td>
			<td style="${cellCenter}">${r.aiReviewRequestedPrs > 0 ? `<span style="font-weight:600;">${r.aiReviewRequestedPrs}</span>` : '0'}</td>
		</tr>`;
	}).join('');

	return `
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing PRs created since ${sinceDate}.
			Reviewer requests are only visible for <strong>open</strong> PRs — the GitHub API clears this field after a PR is merged or closed.
		</div>
		<div class="customization-matrix-container">
			<table class="customization-matrix" style="width:100%; border-collapse:collapse;">
				<thead>
					<tr>
						<th style="text-align:left; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">📂 Repository</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">PRs</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="PRs where the PR author's GitHub login matches a known AI agent (e.g. copilot-swe-agent, claude-code-action, openai-code-agent)">🤖 Cloud Agent Authored</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Open PRs where an AI agent was listed as a requested reviewer">👁 Copilot Review Agent requested†</th>
					</tr>
				</thead>
				<tbody>
					${rows}
				</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			† Copilot Review Agent requested counts are for open PRs only. GitHub removes reviewer data after a PR is merged or closed.<br/>
			🤖 Cloud Agent Authored = PR author's GitHub login matches a known cloud agent (e.g. <code>copilot-swe-agent</code>, <code>claude-code-action</code>, <code>openai-code-agent</code>).
		</div>`;
}

/** Sanitize agent sessions data received from the extension host — escapes all string fields at
 *  the trust boundary so render functions can interpolate them directly into innerHTML safely. */
function sanitizeAgentSessionsData(input: unknown): AgentSessionsResult {
	const src = (input && typeof input === 'object') ? (input as Record<string, unknown>) : {};
	const repos = Array.isArray(src.repos) ? src.repos : [];
	return {
		authenticated: Boolean(src.authenticated),
		since: typeof src.since === 'string' ? escapeHtml(src.since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		fetchedAt: typeof src.fetchedAt === 'string' ? src.fetchedAt : '',
		totalTasks: toSafeNumber(src.totalTasks),
		totalSessions: toSafeNumber(src.totalSessions),
		totalCredits: toSafeNumber(src.totalCredits),
		repos: repos.map((repo) => {
			const r = (repo && typeof repo === 'object') ? (repo as Record<string, unknown>) : {};
			const owner = escapeHtml(typeof r.owner === 'string' ? r.owner : '');
			const repoName = escapeHtml(typeof r.repo === 'string' ? r.repo : '');
			return {
				owner,
				repo: repoName,
				repoUrl: toSafeHttpUrl(`https://github.com/${owner}/${repoName}`),
				totalTasks: toSafeNumber(r.totalTasks),
				totalSessions: toSafeNumber(r.totalSessions),
				totalCredits: toSafeNumber(r.totalCredits),
				tasksScanned: toSafeNumber(r.tasksScanned),
				tasksTotal: toSafeNumber(r.tasksTotal),
				partial: Boolean(r.partial),
				error: typeof r.error === 'string' ? escapeHtml(r.error) : undefined,
			};
		}),
	};
}

function updateReposPrPanel(data: RepoPrStatsResult): void {
	const container = document.querySelector('#repos-pr-content');
	if (!container) { return; }
	container.innerHTML = `
		<div class="section-title"><span>🤖</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${renderReposPrContent(data)}
	`;
}

// ---------------------------------------------------------------------------
// Cloud Agent Sessions tab
// ---------------------------------------------------------------------------

function buildAgentSessionRows(data: AgentSessionsResult, cell: string, cellCenter: string): string {
  return data.repos.map((r) => {
    // r.owner, r.repo, r.repoUrl and r.error are pre-sanitized by sanitizeAgentSessionsData
    const repoLink = `<a href="${r.repoUrl}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${r.owner}/${r.repo}</a>`;
    if (r.error) {
      return `<tr>
        <td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}</td>
        <td colspan="3" style="${cell} color:var(--text-secondary); font-style:italic; font-size:12px;">${r.error}</td>
      </tr>`;
    }
    const partialNote = r.partial
      ? ` <span title="Showing ${r.tasksScanned} of ${r.tasksTotal} tasks — capped to limit API usage" style="color:var(--text-muted); font-size:10px;">(${r.tasksScanned}/${r.tasksTotal} tasks scanned)</span>`
      : '';
    return `<tr>
      <td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}${partialNote}</td>
      <td style="${cellCenter} font-weight:600;">${r.totalTasks}</td>
      <td style="${cellCenter} font-weight:600;">${r.totalSessions}</td>
      <td style="${cellCenter}">${r.totalCredits > 0 ? r.totalCredits.toFixed(1) : '—'}</td>
    </tr>`;
  }).join('');
}

function renderAgentSessionsContent(data: AgentSessionsResult): string {
	if (!data.authenticated) {
		return `
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>🔒 GitHub authentication required</strong><br/>
				Sign in with GitHub (via the Diagnostics tab) to see Copilot cloud agent session data.
			</div>`;
	}
	if (data.repos.length === 0) {
		return `
			<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
				No GitHub repositories detected in your workspace folders.
			</div>`;
	}

	const sinceDate = new Date(data.since).toLocaleDateString();
	const cell = 'padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);';
	const cellCenter = `${cell} text-align: center;`;

	const summaryTotals = data.repos.reduce((acc, r) => {
		if (!r.error) {
			acc.tasks += r.totalTasks;
			acc.sessions += r.totalSessions;
			acc.credits += r.totalCredits;
		}
		return acc;
	}, { tasks: 0, sessions: 0, credits: 0 });

	const hasPartial = data.repos.some(r => r.partial && !r.error);

	const rows = buildAgentSessionRows(data, cell, cellCenter);

	return `
		<div style="margin-bottom:12px; display:flex; gap:24px; flex-wrap:wrap;">
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${summaryTotals.tasks}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Tasks</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${summaryTotals.sessions}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Sessions</div>
			</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:12px 20px; text-align:center; min-width:80px;">
				<div style="font-size:22px; font-weight:700; color:var(--text-primary);">${summaryTotals.credits > 0 ? summaryTotals.credits.toFixed(1) : '—'}</div>
				<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">AI Credits</div>
			</div>
		</div>
		<div style="font-size:11px; color:var(--text-secondary); margin-bottom:12px;">
			Showing cloud-agent sessions from ${sinceDate} to now.
			${hasPartial ? '<strong>Note:</strong> Some repos were capped at 50 tasks — totals may be lower bounds. ' : ''}
		</div>
		<div class="customization-matrix-container">
			<table class="customization-matrix" style="width:100%; border-collapse:collapse;">
				<thead>
					<tr>
						<th style="text-align:left; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;">📂 Repository</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Number of Copilot cloud agent tasks (each task = one user prompt to the agent)">Tasks</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="Number of agent sessions (each session = one autonomous coding run)">Sessions</th>
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="AI credits consumed (1 credit = $0.01). Only available when the API reports usage data.">AI Credits</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
			</table>
		</div>
		<div style="margin-top:8px; font-size:10px; color:var(--text-muted); border-top:1px solid var(--border-subtle); padding-top:8px;">
			ℹ️ <strong>No double-counting:</strong> These are cloud agent sessions only. CLI/remote sessions and local IDE chat sessions (shown in "My Activity") are excluded.<br/>
			ℹ️ <strong>Action minutes</strong> (GitHub Actions compute used by the agent) are not shown here — they require additional per-branch API calls.
		</div>`;
}

function updateAgentSessionsPanel(data: AgentSessionsResult): void {
	const container = document.querySelector('#agent-sessions-content');
	if (!container) { return; }
	container.innerHTML = `
		<div class="section-title"><span>🤖</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> — they are separate from these cloud agent sessions.
		</div>
		${renderAgentSessionsContent(data)}
	`;
}

function buildCustomizationSectionHtml(matrix: WorkspaceCustomizationMatrix | null): string {
	if (!matrix || !matrix.workspaces || matrix.workspaces.length === 0) {
		return `
			<div class="section">
				<div class="section-title"><span>🛠️</span><span>Copilot Customization Files</span></div>
				<div class="section-subtitle">Showing workspace customization status for active workspaces</div>
				<div style="color: var(--text-muted); padding:12px;">No workspaces with customization files detected in the last 30 days.</div>
			</div>`;
	}
	const workspaceRows = matrix.workspaces.map(ws => {
		const statuses = ws.typeStatuses ?? {};
		const hasNoCustomization = Object.values(statuses).every(s => s === '❌');
		const typeCells = (matrix.customizationTypes ?? []).map(type => {
			const status = statuses[type.id] || '❓';
			const statusLabel =
				status === '✅' ? 'Present and fresh'
				: status === '⚠️' ? 'Present but stale'
				: status === '❌' ? 'Missing'
				: 'Status unknown';
			return `
				<td style="position: relative; padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center;">
					${statusBadgeHtml(status, statusLabel)}
				</td>`;
		}).join('');
		return `
			<tr>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); font-family: 'Courier New', monospace; font-size: 12px;">
					${escapeHtml(ws.workspaceName)}${hasNoCustomization ? ` <span style="font-family: sans-serif; vertical-align: middle;">${statusBadgeHtml('⚠️', 'No customization files')}</span>` : ''}
				</td>
				<td style="padding: 6px 8px; border-bottom: 1px solid var(--border-subtle); text-align: center; color: var(--link-color); font-weight: 600;">
					${ws.sessionCount}
				</td>
				${typeCells}
			</tr>`;
	}).join('');
	return `
		<div style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
				🛠️ Copilot Customization Files
			</div>
			<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
				Showing ${matrix.totalWorkspaces} workspace(s) with Copilot activity in the last 30 days.
				${matrix.workspacesWithIssues > 0
					? `<span class="stale-warning" style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('⚠️')} ${matrix.workspacesWithIssues} workspace(s) have no customization files.</span>`
					: `<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('✅')} All workspaces have up-to-date customizations.</span>`}
			</div>
			<div class="customization-matrix-container">
				<table class="customization-matrix">
					<thead>
						<tr>
							<th style="text-align: left; padding: 8px; border-bottom: 2px solid var(--border-color);">📂 Workspace</th>
							<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);">Sessions</th>
							${(matrix.customizationTypes ?? []).map(type => `
								<th style="text-align: center; padding: 8px; border-bottom: 2px solid var(--border-color);" title="${escapeHtml(type.label)}">
									${escapeHtml(type.icon)}
								</th>
							`).join('')}
						</tr>
					</thead>
					<tbody>
						${workspaceRows}
					</tbody>
				</table>
			</div>
			<div style="margin-top: 12px; font-size: 10px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
				<div style="display: flex; gap: 16px; flex-wrap: wrap;">
					${(matrix.customizationTypes ?? []).map(type => `
						<span>${escapeHtml(type.icon)} ${escapeHtml(type.label)}</span>
					`).join('')}
				</div>
				<div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('✅')} = Present &amp; Fresh</span>
					<span style="color: var(--text-muted);">•</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('⚠️')} = Present but Stale</span>
					<span style="color: var(--text-muted);">•</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('❌')} = Missing</span>
				</div>
			</div>
		</div>`;
}

function buildThinkingEffortSectionHtml(stats: UsageAnalysisStats): string {
	const effortData = stats.last30Days.thinkingEffortUsage || stats.today.thinkingEffortUsage || stats.month.thinkingEffortUsage;
	if (!effortData) { return ''; }
	return `
		<!-- Thinking Effort Section -->
		<div class="section">
			<div class="section-title"><span>💡</span><span>Thinking Effort (Reasoning)</span></div>
			<div class="section-subtitle">How often each reasoning effort level was used (requests per level)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Today</h4>
					${renderEffortPeriodHtml(stats.today.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📆 Last 30 Days</h4>
					${renderEffortPeriodHtml(stats.last30Days.thinkingEffortUsage)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Previous Month</h4>
					${renderEffortPeriodHtml(stats.month.thinkingEffortUsage)}
				</div>
			</div>
		</div>`;
}

function renderEffortPeriodHtml(teu: { byEffort: { [effort: string]: number }; sessionCount: number; switchCount: number } | undefined): string {
	const EFFORT_ORDER = ['minimal', 'low', 'medium', 'high', 'max', 'xhigh'];
	if (!teu || teu.sessionCount === 0) { return '<div style="color: var(--text-muted); font-size: 11px;">No data</div>'; }
	const total = Object.values(teu.byEffort).reduce((s, v) => s + v, 0);
	const sorted = EFFORT_ORDER
		.filter(k => teu.byEffort[k] > 0)
		.concat(Object.keys(teu.byEffort).filter(k => !EFFORT_ORDER.includes(k) && teu.byEffort[k] > 0));
	return `
		${sorted.map(level => {
			const count = teu.byEffort[level] || 0;
			const pct = total > 0 ? Math.round((count / total) * 100) : 0;
			return `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 56px; font-size: 12px; font-weight: 600; color: var(--text-primary); text-transform: capitalize;">${escapeHtml(getEffortDisplayName(level))}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${pct}%; background: var(--link-color); height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${count} <span style="color: var(--text-secondary); font-weight: 400;">(${pct}%)</span></span>
			</div>`;
		}).join('')}
		<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${teu.sessionCount} session${teu.sessionCount !== 1 ? 's' : ''} · ${teu.switchCount} effort switch${teu.switchCount !== 1 ? 'es' : ''}</div>
	`;
}

function buildUsageAllKeysSets(stats: UsageAnalysisStats): {
	allToolKeys: string[];
	allMcpToolKeys: string[];
	allMcpServerKeys: string[];
	allStandardModels: string[];
	allPremiumModels: string[];
	allUnknownModels: string[];
} {
	return {
		allToolKeys: [...new Set([...Object.keys(stats.today.toolCalls.byTool), ...Object.keys(stats.last30Days.toolCalls.byTool), ...Object.keys(stats.month.toolCalls.byTool)])],
		allMcpToolKeys: [...new Set([...Object.keys(stats.today.mcpTools.byTool), ...Object.keys(stats.last30Days.mcpTools.byTool), ...Object.keys(stats.month.mcpTools.byTool)])],
		allMcpServerKeys: [...new Set([...Object.keys(stats.today.mcpTools.byServer), ...Object.keys(stats.last30Days.mcpTools.byServer), ...Object.keys(stats.month.mcpTools.byServer)])],
		allStandardModels: [...new Set([...stats.today.modelSwitching.standardModels, ...stats.last30Days.modelSwitching.standardModels, ...stats.month.modelSwitching.standardModels])],
		allPremiumModels: [...new Set([...stats.today.modelSwitching.premiumModels, ...stats.last30Days.modelSwitching.premiumModels, ...stats.month.modelSwitching.premiumModels])],
		allUnknownModels: [...new Set([...stats.today.modelSwitching.unknownModels, ...stats.last30Days.modelSwitching.unknownModels, ...stats.month.modelSwitching.unknownModels])],
	};
}

function buildHealthTabPanelHtml(customizationHtml: string, stats: UsageAnalysisStats): string {
	return `
		<div id="tab-panel-health" class="tab-panel"${activeTab !== 'health' ? ' style="display:none"' : ''}>
			${customizationHtml}
			${renderMissedPotential(stats)}

			<!-- Repository Setup Section -->
			<div class="repo-hygiene-section" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
				<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
					🏗️ Repository Hygiene Analysis
				</div>
				<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px;">
					Analyze repository hygiene and structure to identify missing configuration files and best practices.
				</div>
				${hygieneMatrixState && hygieneMatrixState.workspaces && hygieneMatrixState.workspaces.length > 0 ? `
					<div style="margin-bottom: 12px;">
						<vscode-button id="btn-analyse-all" style="margin-bottom: 8px;">Analyze All Repositories (${hygieneMatrixState.workspaces.length})</vscode-button>
					</div>
					<div id="repo-list-pane-container" class="repo-hygiene-pane">
						<div class="repo-hygiene-pane-header">📁 Repository List</div>
						<div id="repo-list-pane" class="repo-hygiene-pane-body"></div>
					</div>
					<div id="repo-details-pane-container" class="repo-hygiene-pane repo-hygiene-pane-collapsed">
						<div class="repo-hygiene-pane-header">📊 Repository Details</div>
						<div id="repo-details-pane" class="repo-hygiene-pane-body"></div>
					</div>
				` : `
					<vscode-button id="btn-analyse-repo">Analyze Repo for Best Practices</vscode-button>
					<div id="repo-analysis-results" class="repo-hygiene-results" style="margin-top: 12px;"></div>
				`}
			</div>
		</div>`;
}

function buildMcpToolsSectionHtml(
	stats: UsageAnalysisStats,
	allMcpToolKeys: string[],
	allMcpServerKeys: string[],
): string {
	return `
		<!-- MCP Tools Section -->
		<div class="section">
			<div class="section-title"><span>🔌</span><span>MCP Tools</span></div>
			<div class="section-subtitle">Model Context Protocol (MCP) server and tool usage</div>
			${buildUnknownMcpToolsBannerHtml(stats)}
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${formatNumber(stats.today.mcpTools.total)}</div>
						${allMcpServerKeys.length > 0 ? `
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.today.mcpTools.byServer, allMcpServerKeys), 200)}</div></div>
						` : '<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📆 Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${formatNumber(stats.last30Days.mcpTools.total)}</div>
						${allMcpServerKeys.length > 0 ? `
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.last30Days.mcpTools.byServer, allMcpServerKeys), 200)}</div></div>
						` : '<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total MCP Calls: ${formatNumber(stats.month.mcpTools.total)}</div>
						${allMcpServerKeys.length > 0 ? `
							<div style="margin-top: 12px;"><strong>By Server:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.month.mcpTools.byServer, allMcpServerKeys), 200)}</div></div>
						` : '<div style="color: var(--text-muted); margin-top: 8px;">No MCP tools used yet</div>'}
					</div>
				</div>
			</div>
			<div class="three-column" style="margin-top: 12px;">
				<div>
					${allMcpToolKeys.length > 0 ? `
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.today.mcpTools.byTool, allMcpToolKeys), 10, lookupMcpToolName)}</div></div>
						</div>
					` : ''}
				</div>
				<div>
					${allMcpToolKeys.length > 0 ? `
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.last30Days.mcpTools.byTool, allMcpToolKeys), 10, lookupMcpToolName)}</div></div>
						</div>
					` : ''}
				</div>
				<div>
					${allMcpToolKeys.length > 0 ? `
						<div class="list">
							<div style="margin-top: 4px;"><strong>By Tool:</strong><div style="margin-top: 8px;">${renderToolsTable(unionFill(stats.month.mcpTools.byTool, allMcpToolKeys), 10, lookupMcpToolName)}</div></div>
						</div>
					` : ''}
				</div>
			</div>
		</div>`;
}

function buildReposAndAgentTabPanelsHtml(): string {
	return `
		<div id="tab-panel-repos" class="tab-panel"${activeTab !== 'repos' ? ' style="display:none"' : ''}>
			<div class="section" id="repos-pr-content">
				<div class="section-title"><span>🤖</span><span>AI Activity in Repository PRs</span></div>
				<div class="section-subtitle">PRs from the last 30 days across your known repositories — authored or reviewed by AI agents.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading… (sign in with GitHub to see data)</div>
			</div>
		</div>
		<div id="tab-panel-agent" class="tab-panel"${activeTab !== 'agent' ? ' style="display:none"' : ''}>
			<div class="section" id="agent-sessions-content">
				<div class="section-title"><span>🤖</span><span>Copilot Cloud Agent Sessions</span></div>
				<div class="section-subtitle">Cloud agent tasks and sessions from the last 30 days, fetched from the GitHub API.</div>
				<div style="margin-top:12px; color: var(--text-secondary); font-size:12px;">Loading… (sign in with GitHub to see data)</div>
			</div>
		</div>`;
}

function buildInsightCardHtml(insight: EvaluatedInsight): string {
	const severityColors: Record<InsightSeverity, string> = {
		tip: 'rgba(96,165,250,0.12)',
		opportunity: 'rgba(251,191,36,0.12)',
		celebration: 'rgba(74,222,128,0.12)',
	};
	const severityBorder: Record<InsightSeverity, string> = {
		tip: 'rgba(96,165,250,0.5)',
		opportunity: 'rgba(251,191,36,0.5)',
		celebration: 'rgba(74,222,128,0.5)',
	};
	// Accent colour used for the primary action button per severity
	const severityAccent: Record<InsightSeverity, string> = {
		tip: 'rgba(96,165,250,0.85)',
		opportunity: 'rgba(251,191,36,0.85)',
		celebration: 'rgba(74,222,128,0.85)',
	};
	const bg = severityColors[insight.severity] ?? severityColors.tip;
	const border = severityBorder[insight.severity] ?? severityBorder.tip;
	const accent = severityAccent[insight.severity] ?? severityAccent.tip;
	const isNew = insight.status === 'new';
	const isDone = insight.status === 'done';

	const actionBtn = insight.actionLabel
		? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="execute" data-command="${escapeHtml(insight.actionCommand ?? '')}"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${border}; border-radius:5px;
				background:${bg}; color:var(--text-primary);">${escapeHtml(insight.actionLabel)}</button>`
		: '';

	const doneBtn = !isDone
		? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="done"
				title="Mark as done"
				style="padding:5px 14px; font-size:12px; font-weight:600; cursor:pointer;
				border:1px solid ${border}; border-radius:5px;
				background:${accent}; color:#0d1117;">✓ Done</button>`
		: `<span style="font-size:12px; color:var(--text-secondary); opacity:0.5; padding:5px 6px;">✓ Done</span>`;

	const snoozeBtn = !isDone
		? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="snooze"
				title="Snooze for 7 days"
				style="padding:5px 14px; font-size:12px; font-weight:500; cursor:pointer;
				border:1px solid ${border}; border-radius:5px;
				background:transparent; color:var(--text-primary);">⏸ Snooze</button>`
		: '';

	const dismissBtn = !isDone
		? `<button class="insight-action-btn" data-insight-id="${escapeHtml(insight.id)}" data-action="dismiss"
				title="Dismiss permanently"
				style="padding:4px 8px; font-size:14px; line-height:1; cursor:pointer; border:none; border-radius:4px;
				background:transparent; color:var(--text-primary); opacity:0.5;">✕</button>`
		: '';

	return `
		<div class="insight-card" data-insight-id="${escapeHtml(insight.id)}"
			style="margin-bottom:12px; padding:16px 18px; border-radius:8px;
			background:${bg}; border:1px solid ${border};
			${isNew ? 'box-shadow:0 2px 8px ' + bg + ';' : ''}
			${isDone ? 'opacity:0.45;' : ''}">
			<div style="display:flex; align-items:flex-start; gap:10px;">
				<div style="flex:1;">
					<div style="font-size:13px; font-weight:700; color:var(--text-primary); margin-bottom:8px; display:flex; align-items:center; gap:8px;">
						${isNew ? `<span style="font-size:10px; padding:2px 7px; border-radius:10px; background:${accent}; color:#0d1117; font-weight:700; letter-spacing:0.04em;">NEW</span>` : ''}
						${escapeHtml(insight.title)}
					</div>
					<div style="font-size:12px; color:var(--text-primary); line-height:1.5; opacity:0.85; white-space:pre-wrap;">${escapeHtml(insight.body)}</div>
					${actionBtn ? `<div style="margin-top:12px;">${actionBtn}</div>` : ''}
				</div>
				<div style="flex-shrink:0; margin-top:-4px;">
					${dismissBtn}
				</div>
			</div>
			<div style="display:flex; gap:8px; margin-top:14px; justify-content:flex-end; border-top:1px solid ${border}; padding-top:10px;">
				${doneBtn}
				${snoozeBtn}
			</div>
		</div>`;
}

function buildInsightsTabPanelHtml(insights: EvaluatedInsight[]): string {
	const applicable = insights.filter(i => i.status !== 'dismissed');
	const newInsights = applicable.filter(i => i.status === 'new');
	const otherInsights = applicable.filter(i => i.status !== 'new' && i.status !== 'done');

	const forYouSection = newInsights.length > 0
		? `<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">✨ For You</div>
			${newInsights.map(buildInsightCardHtml).join('')}
		</div>`
		: `<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			🎉 No new insights right now — keep using Copilot and check back later!
		</div>`;

	const allSection = otherInsights.length > 0
		? `<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${otherInsights.map(buildInsightCardHtml).join('')}
		</div>`
		: '';

	return `
		<div id="tab-panel-insights" class="tab-panel"${activeTab !== 'insights' ? ' style="display:none"' : ''}>
			<div class="section">
				<div class="section-title"><span>💡</span><span>Insights</span></div>
				<div class="section-subtitle">
					Personalized tips based on your usage patterns. Tips are data-driven — they only appear when relevant to how you code with AI.
				</div>
				<div id="insights-container" style="margin-top:16px;">
					${forYouSection}
					${allSection}
				</div>
			</div>
		</div>`;
}

function refreshInsightsPanel(insights: EvaluatedInsight[]): void {
	const container = document.getElementById('insights-container');
	if (!container) { return; }
	currentInsights = insights;
	const forYou = insights.filter(i => i.status === 'new');
	const other = insights.filter(i => i.status !== 'new' && i.status !== 'dismissed' && i.status !== 'done');

	const forYouSection = forYou.length > 0
		? `<div style="margin-bottom:20px;">
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">✨ For You</div>
			${forYou.map(buildInsightCardHtml).join('')}
		</div>`
		: `<div style="margin-bottom:20px; padding:16px; background:var(--bg-tertiary); border-radius:8px; font-size:12px; color:var(--text-secondary); text-align:center;">
			🎉 No new insights right now — keep using Copilot and check back later!
		</div>`;

	const allSection = other.length > 0
		? `<div>
			<div style="font-size:12px; font-weight:600; text-transform:uppercase; color:var(--text-secondary); letter-spacing:0.05em; margin-bottom:10px;">All Tips</div>
			${other.map(buildInsightCardHtml).join('')}
		</div>`
		: '';

	container.innerHTML = forYouSection + allSection;
	wireInsightCardButtons();
}

function wireInsightCardButtons(): void {
	const container = document.getElementById('insights-container');
	if (!container) { return; }
	container.querySelectorAll<HTMLButtonElement>('.insight-action-btn').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = btn.getAttribute('data-insight-id');
			const action = btn.getAttribute('data-action');
			if (!id || !action) { return; }
			if (action === 'execute') {
				const command = btn.getAttribute('data-command');
				if (command) { vscode.postMessage({ command }); }
			} else {
				vscode.postMessage({ command: 'insightAction', id, action });
			}
		});
	});
}


function buildUsageRootHtml(
	stats: UsageAnalysisStats,
	customizationHtml: string,
	multiModelHtml: string,
	thinkingEffortHtml: string,
	sessionsSummaryHtml: string,
	todayTotalRefs: number,
	last30DaysTotalRefs: number,
	allToolKeys: string[],
	allMcpToolKeys: string[],
	allMcpServerKeys: string[],
	allStandardModels: string[],
	allPremiumModels: string[],
	allUnknownModels: string[],
): string {
	return `
		<style>${themeStyles}</style>
		<style>${styles}</style>
		<div class="container">
			<div class="header">
				<div class="header-left">
					<span class="header-icon">📊</span>
					<span class="header-title">Usage Analysis</span>
				</div>
				<div class="button-row">
				${buttonHtml('btn-refresh')}
				${buttonHtml('btn-details')}
				${buttonHtml('btn-chart')}
				${buttonHtml('btn-environmental')}
				${buttonHtml('btn-diagnostics')}
				${buttonHtml('btn-maturity')}
				${stats.backendConfigured ? buttonHtml('btn-dashboard') : ''}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title">📋 About This Dashboard</div>
				<div>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${activeTab === 'activity' ? 'active' : ''}" data-tab="activity">📊 My Activity</button>
				<button class="tab-button ${activeTab === 'sessions' ? 'active' : ''}" data-tab="sessions">📋 Today's Sessions</button>
				<button class="tab-button ${activeTab === 'tools' ? 'active' : ''}" data-tab="tools">🔧 Tools &amp; Integrations</button>
				<button class="tab-button ${activeTab === 'health' ? 'active' : ''}" data-tab="health">🏗️ Workspace Health</button>
				<button class="tab-button ${activeTab === 'repos' ? 'active' : ''}" data-tab="repos">🤖 Repository PRs</button>
				<button class="tab-button ${activeTab === 'agent' ? 'active' : ''}" data-tab="agent">🤖 Cloud Agent</button>
				<button class="tab-button ${activeTab === 'insights' ? 'active' : ''}" data-tab="insights">💡 Insights${(stats.insights ?? []).filter(i => i.status === 'new').length > 0 ? ` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(stats.insights ?? []).filter(i => i.status === 'new').length}</span>` : ''}</button>
			</div>

			${buildSessionsTabPanelHtml(stats)}
			${buildActivityTabPanelHtml(stats, multiModelHtml, thinkingEffortHtml, sessionsSummaryHtml, todayTotalRefs, last30DaysTotalRefs)}
			${buildToolsTabPanelHtml(stats, allToolKeys, allMcpToolKeys, allMcpServerKeys, allStandardModels, allPremiumModels, allUnknownModels)}
			${buildHealthTabPanelHtml(customizationHtml, stats)}
			${buildReposAndAgentTabPanelsHtml()}
			${buildInsightsTabPanelHtml(stats.insights ?? [])}
			<div class="footer">
				Last updated: ${escapeHtml(new Date(stats.lastUpdated).toLocaleString())} · Updates every 5 minutes
			</div>
		</div>
`;
}

function buildSessionsTabPanelHtml(stats: UsageAnalysisStats): string {
	return `
		<div id="tab-panel-sessions" class="tab-panel"${activeTab !== 'sessions' ? ' style="display:none"' : ''}>
			<div class="section">
				<div class="section-title"><span>📋</span><span>Today's Sessions</span></div>
				<div class="section-subtitle">Individual session breakdown for today — sorted by number of interactions (most active first).</div>
				<div style="margin-top: 12px;">
					${renderTodaySessionsTable(stats.todaySessions || [])}
				</div>
			</div>
		</div>`;
}

function buildActivityTabPanelHtml(
	stats: UsageAnalysisStats,
	multiModelHtml: string,
	thinkingEffortHtml: string,
	sessionsSummaryHtml: string,
	todayTotalRefs: number,
	last30DaysTotalRefs: number,
): string {
	return `
		<div id="tab-panel-activity" class="tab-panel"${activeTab !== 'activity' ? ' style="display:none"' : ''}>
			${sessionsSummaryHtml}
			<!-- Mode Usage Section -->
			<div class="section">
				<div class="section-title"><span>🎯</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), or Agent (autonomous tasks)</div>
				<div class="two-column">
					${renderModeBarChart(stats.today.modeUsage, '📅 Today')}
					${renderModeBarChart(stats.last30Days.modeUsage, '📊 Last 30 Days')}
				</div>
			</div>
			${buildContextRefsHtml(stats, todayTotalRefs, last30DaysTotalRefs)}
			${multiModelHtml}
			${thinkingEffortHtml}
		</div>`;
}

function buildContextRefCardsHtml(stats: UsageAnalysisStats, todayTotalRefs: number, last30DaysTotalRefs: number): string {
	const r = stats.last30Days.contextReferences;
	const t = stats.today.contextReferences;
	const c = (v: number | undefined): number => v || 0;
	return `
		<div class="stats-grid">
			<div class="stat-card"><div class="stat-label">📄 #file</div><div class="stat-value">${r.file}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.file}</div></div>
			<div class="stat-card"><div class="stat-label">✂️ #selection</div><div class="stat-value">${r.selection}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.selection}</div></div>
			<div class="stat-card" title="Text selected in your editor providing passive context to Copilot"><div class="stat-label">✨ Implicit Selection</div><div class="stat-value">${r.implicitSelection}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.implicitSelection}</div></div>
			<div class="stat-card"><div class="stat-label">🔤 #symbol</div><div class="stat-value">${r.symbol}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.symbol}</div></div>
			<div class="stat-card"><div class="stat-label">🗂️ #codebase</div><div class="stat-value">${r.codebase}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.codebase}</div></div>
			<div class="stat-card"><div class="stat-label">📁 @workspace</div><div class="stat-value">${r.workspace}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.workspace}</div></div>
			<div class="stat-card"><div class="stat-label">💻 @terminal</div><div class="stat-value">${r.terminal}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.terminal}</div></div>
			<div class="stat-card"><div class="stat-label">🔧 @vscode</div><div class="stat-value">${r.vscode}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.vscode}</div></div>
			<div class="stat-card" title="Last command run in the terminal"><div class="stat-label">⌨️ #terminalLastCommand</div><div class="stat-value">${c(r.terminalLastCommand)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.terminalLastCommand)}</div></div>
			<div class="stat-card" title="Selected terminal output"><div class="stat-label">🖱️ #terminalSelection</div><div class="stat-value">${c(r.terminalSelection)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.terminalSelection)}</div></div>
			<div class="stat-card" title="Clipboard contents"><div class="stat-label">📋 #clipboard</div><div class="stat-value">${c(r.clipboard)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.clipboard)}</div></div>
			<div class="stat-card" title="Uncommitted git changes"><div class="stat-label">📝 #changes</div><div class="stat-value">${c(r.changes)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.changes)}</div></div>
			<div class="stat-card" title="Output panel contents"><div class="stat-label">📤 #outputPanel</div><div class="stat-value">${c(r.outputPanel)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.outputPanel)}</div></div>
			<div class="stat-card" title="Problems panel contents"><div class="stat-label">⚠️ #problemsPanel</div><div class="stat-value">${c(r.problemsPanel)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.problemsPanel)}</div></div>
			<div class="stat-card" title="Pull request context references (#pr / #pullRequest) — Copilot PR chat understanding, review, and summary"><div class="stat-label">🔀 #pr</div><div class="stat-value">${c(r.pullRequest)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.pullRequest)}</div></div>
			<div class="stat-card" title="Pasted images and vision context detected in session logs"><div class="stat-label">📷 Images</div><div class="stat-value">${c(r.byKind['copilot.image'])}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.byKind['copilot.image'])}</div></div>
			<div class="stat-card" title=".github/prompts/ prompt file uses detected in session logs"><div class="stat-label">📋 Prompt Files</div><div class="stat-value">${c(r.byKind['promptFile'])}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.byKind['promptFile'])}</div></div>
			<div class="stat-card" title="Total lines of code referenced via #file: range selections"><div class="stat-label">📐 Code Lines</div><div class="stat-value">${c(r.codeContextLines)}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.codeContextLines)}</div></div>
			<div class="stat-card" title="Custom /command prompt uses detected in session logs"><div class="stat-label">🎯 Custom Prompts</div><div class="stat-value">${c(r.byKind['prompt'])}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${c(t.byKind['prompt'])}</div></div>
			<div class="stat-card" title="copilot-instructions.md file references detected in session logs"><div class="stat-label">📋 Copilot Instructions</div><div class="stat-value">${r.copilotInstructions}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.copilotInstructions}</div></div>
			<div class="stat-card" title="agents.md file references detected in session logs"><div class="stat-label">🤖 Agents.md</div><div class="stat-value">${r.agentsMd}</div><div style="font-size: 10px; color: var(--text-muted); margin-top: 4px;">Today: ${t.agentsMd}</div></div>
			<div class="stat-card" style="background: var(--list-active-bg); border: 2px solid var(--border-color); color: var(--list-active-fg);"><div class="stat-label" style="color: var(--list-active-fg); opacity: 0.85;">📊 Total References</div><div class="stat-value" style="color: var(--list-active-fg);">${last30DaysTotalRefs}</div><div style="font-size: 10px; color: var(--list-active-fg); opacity: 0.75; margin-top: 4px;">Today: ${todayTotalRefs}</div></div>
		</div>`;
}

function buildContextRefsHtml(stats: UsageAnalysisStats, todayTotalRefs: number, last30DaysTotalRefs: number): string {
	const byKindHtml = Object.keys(stats.last30Days.contextReferences.byKind).length > 0 ? `
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">📎 Attached Files by Type (Last 30 Days)</div>
			<div style="font-size: 12px; color: var(--text-primary);">
				${Object.entries(stats.last30Days.contextReferences.byKind)
					.sort(([, a], [, b]) => (b as number) - (a as number))
					.slice(0, 5)
					.map(([kind, count]) => `<div style="margin-bottom: 4px;"><span style="color: var(--link-color);">${escapeHtml(kind)}:</span> ${count}</div>`)
					.join('')}
			</div>
		</div>
	` : '';
	const byPathHtml = Object.keys(stats.last30Days.contextReferences.byPath).length > 0 ? `
		<div style="margin-top: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">📁 Most Referenced Files (Last 30 Days)</div>
			<div style="font-size: 11px; color: var(--text-primary);">
				${Object.entries(stats.last30Days.contextReferences.byPath)
					.sort(([, a], [, b]) => (b as number) - (a as number))
					.slice(0, 10)
					.map(([path, count]) => `<div style="margin-bottom: 4px; font-family: 'Courier New', monospace;"><span style="color: var(--link-color);">${count}×</span> ${escapeHtml(path)}</div>`)
					.join('')}
			</div>
		</div>
	` : '';
	return `
		<!-- Context References Section -->
		<div class="section">
			<div class="section-title"><span>🔗</span><span>Context References</span></div>
			<div class="section-subtitle">How often you reference files, selections, symbols, and workspace context</div>
			${buildContextRefCardsHtml(stats, todayTotalRefs, last30DaysTotalRefs)}
			${byKindHtml}
			${byPathHtml}
		</div>`;
}

function buildUnknownMcpToolsBannerHtml(stats: UsageAnalysisStats): string {
	const unknownTools = getUnknownMcpTools(stats);
	if (unknownTools.length === 0) { return ''; }
	const issueUrl = createMcpToolIssueUrl(unknownTools);
	const toolListHtml = unknownTools.map(tool => {
		const todayCount = (stats.today.toolCalls.byTool[tool] || 0) + (stats.today.mcpTools.byTool[tool] || 0);
		const last30Count = (stats.last30Days.toolCalls.byTool[tool] || 0) + (stats.last30Days.mcpTools.byTool[tool] || 0);
		const monthCount = (stats.month.toolCalls.byTool[tool] || 0) + (stats.month.mcpTools.byTool[tool] || 0);
		const countParts: string[] = [];
		if (todayCount > 0) { countParts.push(`${todayCount} today`); }
		if (last30Count > todayCount) { countParts.push(`${last30Count} in the last 30d`); }
		if (monthCount > last30Count) { countParts.push(`${monthCount} this month`); }
		const countHtml = countParts.length > 0 ? `<span style="color:var(--text-muted);"> (${countParts.join(' | ')})</span>` : '';
		const suppressBtn = `<button data-suppress-tool="${escapeHtml(tool)}" title="Suppress this tool from the unknown list" style="background:none; border:none; cursor:pointer; padding:0 2px; color:var(--text-muted); font-size:11px; line-height:1;" aria-label="Suppress ${escapeHtml(tool)}">🔇</button>`;
		return `<span style="display:inline-flex; align-items:center; gap:4px; padding:2px 6px; background:var(--bg-primary); border:1px solid var(--border-color); border-radius:3px; font-family:monospace; font-size:11px;">${escapeHtml(tool)}${countHtml}${suppressBtn}</span>`;
	}).join(' ');
	return `
		<div id="unknown-mcp-tools-section" style="margin-bottom: 12px; padding: 10px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display:flex; flex-wrap:wrap; gap:4px; margin-bottom:10px;">
				${toolListHtml}
			</div>
			<a href="${escapeHtml(issueUrl)}" target="_blank" rel="noopener noreferrer" style="display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: var(--button-bg); color: var(--button-fg); border-radius: 4px; text-decoration: none; font-size: 12px; font-weight: 500;">
				<span>📝</span>
				<span>Report Unknown Tools</span>
			</a>
		</div>
	`;
}

function buildToolsTabPanelHtml(
	stats: UsageAnalysisStats,
	allToolKeys: string[],
	allMcpToolKeys: string[],
	allMcpServerKeys: string[],
	allStandardModels: string[],
	allPremiumModels: string[],
	allUnknownModels: string[],
): string {
	return `
		<div id="tab-panel-tools" class="tab-panel"${activeTab !== 'tools' ? ' style="display:none"' : ''}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>🔧</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.today.toolCalls.total)}</div>
						${renderToolsTable(unionFill(stats.today.toolCalls.byTool, allToolKeys), 10)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📆 Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.last30Days.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.last30Days.toolCalls.byTool, allToolKeys), 10)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.month.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.month.toolCalls.byTool, allToolKeys), 10)}
						</div>
					</div>
				</div>
			</div>

			${buildMcpToolsSectionHtml(stats, allMcpToolKeys, allMcpServerKeys)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>🔀</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${renderMultiModelPeriod('📅 Today', stats.today.modelSwitching, allStandardModels, allPremiumModels, allUnknownModels)}
					${renderMultiModelPeriod('📆 Last 30 Days', stats.last30Days.modelSwitching, allStandardModels, allPremiumModels, allUnknownModels)}
					${renderMultiModelPeriod('📅 Previous Month', stats.month.modelSwitching, allStandardModels, allPremiumModels, allUnknownModels)}
				</div>
			</div>
		</div>`;
}

function renderLayout(stats: UsageAnalysisStats): void {
	const root = document.getElementById('root');
	if (!root) {
		return;
	}

	// customizationMatrix is passed as an extra field on the stats object alongside the typed fields
	type StatsWithMatrix = UsageAnalysisStats & { customizationMatrix?: WorkspaceCustomizationMatrix | null };
	const matrix =
		(stats as StatsWithMatrix).customizationMatrix ??
		(initialData as StatsWithMatrix | undefined)?.customizationMatrix ?? null;
	hygieneMatrixState = matrix ?? null;
	if (!hygieneMatrixState || hygieneMatrixState.workspaces.length === 0) {
		selectedRepoPath = null;
	}
	if (Array.isArray(stats.currentWorkspacePaths)) {
		currentWorkspacePaths = stats.currentWorkspacePaths;
	}

	const customizationHtml = buildCustomizationSectionHtml(matrix);
	const allKeys = buildUsageAllKeysSets(stats);
	const todayTotalRefs = getTotalContextRefs(stats.today.contextReferences);
	const last30DaysTotalRefs = getTotalContextRefs(stats.last30Days.contextReferences);
	const thinkingEffortHtml = buildThinkingEffortSectionHtml(stats);
	const sessionsSummaryHtml = `
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>📈</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">📅 Today Sessions</div><div class="stat-value">${formatNumber(stats.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">📆 Last 30 Days Sessions</div><div class="stat-value">${formatNumber(stats.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">📅 Previous Month Sessions</div><div class="stat-value">${formatNumber(stats.month.sessions)}</div></div>
			</div>
		</div>`;

	root.innerHTML = buildUsageRootHtml(
		stats,
		customizationHtml,
		'',
		thinkingEffortHtml,
		sessionsSummaryHtml,
		todayTotalRefs,
		last30DaysTotalRefs,
		allKeys.allToolKeys,
		allKeys.allMcpToolKeys,
		allKeys.allMcpServerKeys,
		allKeys.allStandardModels,
		allKeys.allPremiumModels,
		allKeys.allUnknownModels,
	);

	wireNavigationButtons();
	wireRepositoryButtons();
	renderRepositoryHygienePanels();
	setupTabs();
	wireCopyButtons();
	// Initialize currentInsights from the stats and wire card buttons
	currentInsights = stats.insights ?? [];
	wireInsightCardButtons();
}

/** Wires up top-level navigation toolbar buttons (refresh, details, chart, etc.). */
function wireNavigationButtons(): void {
	document.getElementById('btn-refresh')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'refresh' });
	});
	document.getElementById('btn-details')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'showDetails' });
	});
	document.getElementById('btn-chart')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'showChart' });
	});
	document.getElementById('btn-diagnostics')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'showDiagnostics' });
	});
	document.getElementById('btn-maturity')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'showMaturity' });
	});
	document.getElementById('btn-dashboard')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'showDashboard' });
	});
	document.getElementById('btn-environmental')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'showEnvironmental' });
	});
	wireExtensionPointButtons(vscode);
}

/** Wires up repository hygiene analysis buttons and pane click handlers. */
function wireRepositoryButtons(): void {
	document.getElementById('btn-analyse-repo')?.addEventListener('click', () => {
		const btn = document.getElementById('btn-analyse-repo') as HTMLElement & { disabled: boolean };
		if (btn) {
			btn.disabled = true;
			btn.textContent = 'Analyzing...';
		}
		vscode.postMessage({ command: 'analyseRepository' });
	});

	document.getElementById('btn-analyse-all')?.addEventListener('click', () => {
		const btn = document.getElementById('btn-analyse-all') as HTMLElement & { disabled: boolean };
		if (btn) {
			btn.disabled = true;
			btn.textContent = 'Analyzing All...';
		}
		isBatchAnalysisInProgress = true;
		isSwitchingRepository = true;
		selectedRepoPath = null;
		renderRepositoryHygienePanels();
		vscode.postMessage({ command: 'analyseAllRepositories' });
	});

	document.getElementById('repo-list-pane')?.addEventListener('click', (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		const actionButton = target.closest<HTMLElement>('.btn-repo-action');
		if (!actionButton) { return; }
		const workspacePath = actionButton.getAttribute('data-workspace-path');
		const action = actionButton.getAttribute('data-action');
		if (!workspacePath || !action) { return; }
		if (action === 'details') {
			selectedRepoPath = workspacePath;
			isSwitchingRepository = false;
			renderRepositoryHygienePanels();
			return;
		}
		if (action === 'analyze') {
			(actionButton as HTMLElement & { disabled: boolean }).disabled = true;
			actionButton.textContent = 'Analyzing...';
			isBatchAnalysisInProgress = false;
			vscode.postMessage({ command: 'analyseRepository', workspacePath });
		}
	});

	document.getElementById('repo-details-pane')?.addEventListener('click', (e: MouseEvent) => {
		const target = e.target as HTMLElement;
		if (target.closest('#btn-switch-repository')) {
			isSwitchingRepository = true;
			renderRepositoryHygienePanels();
		}
	});
}

/** Wires up copy-to-clipboard buttons (class `cf-copy`). */
function wireCopyButtons(): void {
	Array.from(document.getElementsByClassName('cf-copy')).forEach((el) => {
		(el as HTMLElement).addEventListener('click', (ev) => {
			const target = ev.currentTarget as HTMLElement;
			const path = target.getAttribute('data-path') || '';
			if (navigator.clipboard && path) {
				navigator.clipboard.writeText(path).then(() => {
					target.textContent = 'Copied';
					setTimeout(() => { target.textContent = 'Copy'; }, 1200);
				}).catch(() => {
					vscode.postMessage({ command: 'copyFailed', path });
				});
			}
		});
	});
}

function handleUpdateStats(message: any): void {
	clearLoadingTimeout();
	if (message.data?.locale) {
		setFormatLocale(message.data.locale);
	}
	if (typeof message.data?.use24HourTime === 'boolean') {
		use24HourTime = message.data.use24HourTime;
	}
	const sanitized = sanitizeStats(message.data);
	if (sanitized) {
		renderLayout(sanitized);
		setupSessionsTableSort();
		renderRepositoryHygienePanels();
		if (repoPrStatsData) { updateReposPrPanel(repoPrStatsData); }
		if (agentSessionsData) { updateAgentSessionsPanel(agentSessionsData); }
	} else {
		showLoadError('Received invalid data from the extension. Try refreshing.');
	}
}

function handleToolSuppressed(toolName: string): void {
	if (!toolName) { return; }
	const section = document.getElementById('unknown-mcp-tools-section');
	if (!section) { return; }
	section.querySelectorAll<HTMLButtonElement>('button[data-suppress-tool]').forEach(btn => {
		if (btn.getAttribute('data-suppress-tool') === toolName) {
			btn.closest('span')?.remove();
		}
	});
	if (section.querySelectorAll('button[data-suppress-tool]').length === 0) {
		section.remove();
	}
}

function handleHighlightUnknownTools(): void {
	activeTab = 'tools';
	document.querySelectorAll<HTMLElement>('.tab-button').forEach(btn => {
		btn.classList.toggle('active', btn.getAttribute('data-tab') === 'tools');
	});
	document.querySelectorAll<HTMLElement>('.tab-panel').forEach(panel => {
		panel.style.display = 'none';
	});
	const toolsPanel = document.getElementById('tab-panel-tools');
	if (toolsPanel) { toolsPanel.style.display = 'block'; }
	const el = document.getElementById('unknown-mcp-tools-section');
	if (el) {
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
		el.style.transition = 'box-shadow 0.3s ease';
		el.style.boxShadow = '0 0 0 3px var(--vscode-focusBorder)';
		setTimeout(() => { el.style.boxShadow = ''; }, 2000);
	}
}

function handleRepoPrStatsLoaded(data: any): void {
	repoPrStatsData = sanitizeRepoPrStatsData(data);
	if (!repoPrStatsData.authenticated) { repoPrStatsLoaded = false; }
	updateReposPrPanel(repoPrStatsData);
}

function handleAgentSessionsLoaded(data: any): void {
	if (!data || typeof data !== 'object') { return; }
	agentSessionsData = sanitizeAgentSessionsData(data);
	if (!agentSessionsData.authenticated) { agentSessionsLoaded = false; }
	updateAgentSessionsPanel(agentSessionsData);
}

function handleUpdateInsights(rawInsights: unknown): void {
	if (!Array.isArray(rawInsights)) { return; }
	const sanitized = sanitizeInsights(rawInsights);
	refreshInsightsPanel(sanitized);
}

// Listen for messages from the extension
registerMessageHandler<any>((message) => {
	switch (message.command) {
		case 'repoAnalysisResults':
			displayRepoAnalysisResults(message.data, message.workspacePath); break;
		case 'repoAnalysisError':
			displayRepoAnalysisError(message.error, message.workspacePath); break;
		case 'repoAnalysisBatchComplete':
			handleBatchAnalysisComplete(); break;
		case 'updateStats':
			handleUpdateStats(message); break;
		case 'updateStatsError':
			clearLoadingTimeout();
			showLoadError('Failed to calculate usage analysis. Check the Output panel for details.');
			break;
		case 'toolSuppressed':
			handleToolSuppressed(message.toolName as string); break;
		case 'highlightUnknownTools':
			handleHighlightUnknownTools(); break;
		case 'repoPrStatsLoaded':
			handleRepoPrStatsLoaded(message.data); break;
		case 'repoPrStatsProgress':
			updateProgressPanel('#repos-pr-content', 'repos-pr-progress', 'Fetching PRs…', message.done as number, message.total as number);
			break;
		case 'agentSessionsLoaded':
			handleAgentSessionsLoaded(message.data); break;
		case 'agentSessionsProgress':
			updateProgressPanel('#agent-sessions-content', 'agent-sessions-progress', 'Fetching agent sessions…', message.done as number, message.total as number);
			break;
		case 'updateInsights':
			handleUpdateInsights(message.insights); break;
		case 'switchTab': {
			const btn = document.querySelector<HTMLButtonElement>(`.tab-button[data-tab="${String(message.tab)}"]`);
			btn?.click();
			break;
		}
	}
});

function getWorkspaceName(workspacePath: string): string {
	const workspace = hygieneMatrixState?.workspaces.find((ws) => ws.workspacePath === workspacePath);
	return workspace?.workspaceName || workspacePath;
}

function getScoreLabel(workspacePath: string): string {
	const record = repoAnalysisState.get(workspacePath);
	if (record?.data?.summary) {
		const percentage = toFiniteNumber(record.data.summary.percentage);
		return `${Math.round(percentage)}%`;
	}
	if (record?.error) {
		return 'Error';
	}
	return '—';
}

function toFiniteNumber(value: unknown): number {
	const numeric = typeof value === 'number' ? value : Number(value);
	return Number.isFinite(numeric) ? numeric : 0;
}

const REPO_DOCS_LINKS: { [key: string]: string } = {
	'git-repo': 'https://docs.github.com/en/get-started/using-git/about-git',
	'gitignore': 'https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files',
	'env-example': 'https://docs.github.com/en/actions/security-for-github-actions/security-guides/using-secrets-in-github-actions',
	'editorconfig': 'https://editorconfig.org/',
	'linter': 'https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning',
	'formatter': 'https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide',
	'type-safety': 'https://docs.github.com/en/code-security/code-scanning/reference/code-ql-built-in-queries/javascript-typescript-built-in-queries',
	'commit-messages': 'https://docs.github.com/en/pull-requests/committing-changes-to-your-project/creating-and-editing-commits/about-commits',
	'conventional-commits': 'https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets',
	'ci-config': 'https://docs.github.com/en/actions/about-github-actions/understanding-github-actions',
	'scripts': 'https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs',
	'task-runner': 'https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/add-scripts',
	'devcontainer': 'https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration',
	'dockerfile': 'https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry',
	'version-pinning': 'https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/setting-up-your-nodejs-project-for-codespaces',
	'license': 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository'
};

const REPO_CATEGORY_LABELS: { [key: string]: string } = {
	versionControl: '🔄 Version Control',
	codeQuality: '✨ Code Quality',
	cicd: '🚀 CI/CD',
	environment: '🔧 Environment',
	documentation: '📚 Documentation'
};

function buildScoreHeaderElement(summary: any): HTMLElement {
	const header = el('div');
	header.setAttribute('style', 'display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;');
	const title = el('div');
	title.setAttribute('style', 'font-size: 14px; font-weight: 600; color: var(--text-primary);');
	title.textContent = '📊 Repository Hygiene Score';
	const score = el('div');
	score.setAttribute('style', 'font-size: 24px; font-weight: 700; color: var(--link-color);');
	score.textContent = `${Math.round(toFiniteNumber(summary.percentage))}%`;
	header.append(title, score);
	return header;
}

function buildStatsGridElement(summary: any): HTMLElement {
	const statsGrid = el('div');
	statsGrid.setAttribute('style', 'display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 12px;');
	const statCards = [
		{ count: summary.passedChecks, label: 'Passed', cardStyle: 'text-align: center; padding: 8px; background: rgba(34, 197, 94, 0.1); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px;', countStyle: 'font-size: 18px; font-weight: 600; color: var(--success-fg);' },
		{ count: summary.warningChecks, label: 'Warnings', cardStyle: 'text-align: center; padding: 8px; background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 4px;', countStyle: 'font-size: 18px; font-weight: 600; color: var(--warning-fg);' },
		{ count: summary.failedChecks, label: 'Failed', cardStyle: 'text-align: center; padding: 8px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 4px;', countStyle: 'font-size: 18px; font-weight: 600; color: #ef4444;' }
	];
	for (const statCard of statCards) {
		const card = el('div');
		card.setAttribute('style', statCard.cardStyle);
		const count = el('div');
		count.setAttribute('style', statCard.countStyle);
		count.textContent = String(toFiniteNumber(statCard.count));
		const label = el('div');
		label.setAttribute('style', 'font-size: 10px; color: var(--text-secondary);');
		label.textContent = statCard.label;
		card.append(count, label);
		statsGrid.appendChild(card);
	}
	return statsGrid;
}

function resolveCheckStatus(check: RepoHygieneCheck): { status: string; emoji: CustomizationTypeStatus; color: string } {
	const status = check?.status === 'pass' || check?.status === 'warning' ? check.status : 'fail';
	const emoji: CustomizationTypeStatus = status === 'pass' ? '✅' : status === 'warning' ? '⚠️' : '❌';
	const color = status === 'pass' ? '#22c55e' : status === 'warning' ? '#f59e0b' : '#ef4444';
	return { status, emoji, color };
}

function buildCheckContentElement(check: RepoHygieneCheck, statusColor: string): HTMLElement {
	const content = el('div');
	content.setAttribute('style', 'flex: 1;');
	const checkLabel = el('div');
	checkLabel.setAttribute('style', `font-size: 12px; font-weight: 600; color: ${statusColor};`);
	checkLabel.textContent = typeof check?.label === 'string' ? check.label : '';
	const checkDetail = el('div');
	checkDetail.setAttribute('style', 'font-size: 11px; color: var(--text-secondary); margin-top: 2px;');
	checkDetail.textContent = typeof check?.detail === 'string' ? check.detail : '';
	content.append(checkLabel, checkDetail);
	if (typeof check?.hint === 'string' && check.hint.length > 0) {
		const hint = el('div');
		hint.setAttribute('style', 'font-size: 10px; color: var(--link-color); margin-top: 4px; font-style: italic;');
		hint.textContent = `💡 ${check.hint}`;
		content.appendChild(hint);
	}
	const docUrl = REPO_DOCS_LINKS[typeof check?.id === 'string' ? check.id : ''];
	if (docUrl) {
		const docLink = el('a');
		docLink.setAttribute('href', docUrl);
		docLink.setAttribute('style', 'font-size: 10px; color: var(--link-color); margin-top: 4px; display: inline-block;');
		docLink.setAttribute('title', 'View official documentation');
		docLink.textContent = '📖 View documentation';
		content.appendChild(docLink);
	}
	return content;
}

function buildCheckRowElement(check: RepoHygieneCheck): HTMLElement {
	const { emoji, color } = resolveCheckStatus(check);
	const checkRow = el('div');
	checkRow.setAttribute('style', 'padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; align-items: flex-start; gap: 8px;');
	const icon = el('span');
	icon.setAttribute('style', 'flex-shrink: 0; padding-top: 1px;');
	icon.innerHTML = statusBadgeHtml(emoji);
	const weight = el('span');
	weight.setAttribute('style', 'font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;');
	weight.textContent = `+${toFiniteNumber(check?.weight)}`;
	checkRow.append(icon, buildCheckContentElement(check, color), weight);
	return checkRow;
}

function buildCategorySectionElement(categoryId: string, categoryChecks: RepoHygieneCheck[], summary: any): HTMLElement {
	const section = el('div');
	section.setAttribute('style', 'margin-bottom: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;');
	const sectionHeader = el('div');
	sectionHeader.setAttribute('style', 'padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;');
	const categoryName = el('span');
	categoryName.setAttribute('style', 'font-size: 12px; font-weight: 600; color: var(--text-primary);');
	categoryName.textContent = REPO_CATEGORY_LABELS[categoryId] || categoryId;
	const categorySummary = summary?.categories?.[categoryId];
	const categoryPct = el('span');
	categoryPct.setAttribute('style', 'font-size: 11px; color: var(--link-color); font-weight: 600;');
	categoryPct.textContent = `${Math.round(toFiniteNumber(categorySummary?.percentage))}%`;
	sectionHeader.append(categoryName, categoryPct);
	section.appendChild(sectionHeader);
	for (const check of categoryChecks) {
		section.appendChild(buildCheckRowElement(check));
	}
	return section;
}

function buildRecommendationsSectionElement(recommendations: RepoHygieneRecommendation[]): HTMLElement {
	const section = el('div');
	section.setAttribute('style', 'margin-top: 16px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; overflow: hidden;');
	const hdr = el('div');
	hdr.setAttribute('style', 'padding: 8px 12px; background: var(--list-hover-bg); border-bottom: 1px solid var(--border-color);');
	const hdrTitle = el('span');
	hdrTitle.setAttribute('style', 'font-size: 12px; font-weight: 600; color: var(--text-primary);');
	hdrTitle.textContent = '💡 Top Recommendations';
	hdr.appendChild(hdrTitle);
	section.appendChild(hdr);
	for (const rec of recommendations.slice(0, 5)) {
		const priority = rec?.priority === 'high' || rec?.priority === 'medium' ? rec.priority : 'low';
		const priorityColor = priority === 'high' ? '#ef4444' : priority === 'medium' ? '#f59e0b' : '#60a5fa';
		const row = el('div');
		row.setAttribute('style', 'padding: 8px; border-bottom: 1px solid var(--border-subtle); display: flex; gap: 8px;');
		const priorityLabel = el('span');
		priorityLabel.setAttribute('style', `font-size: 10px; font-weight: 600; color: ${priorityColor}; min-width: 50px;`);
		priorityLabel.textContent = String(priority).toUpperCase();
		const content = el('div');
		content.setAttribute('style', 'flex: 1;');
		const action = el('div');
		action.setAttribute('style', 'font-size: 11px; color: var(--text-primary);');
		action.textContent = typeof rec?.action === 'string' ? rec.action : '';
		const impact = el('div');
		impact.setAttribute('style', 'font-size: 10px; color: var(--text-muted); margin-top: 2px;');
		impact.textContent = typeof rec?.impact === 'string' ? rec.impact : '';
		content.append(action, impact);
		const weight = el('span');
		weight.setAttribute('style', 'font-size: 10px; color: var(--text-muted); min-width: 30px; text-align: right;');
		weight.textContent = `+${toFiniteNumber(rec?.weight)}`;
		row.append(priorityLabel, content, weight);
		section.appendChild(row);
	}
	return section;
}

function buildCopilotSectionElement(failedChecks: RepoHygieneCheck[], workspacePath?: string): HTMLElement {
	const copilotSection = el('div');
	copilotSection.setAttribute('style', 'margin-top: 16px; padding: 12px; background: rgba(96, 165, 250, 0.07); border: 1px solid rgba(96, 165, 250, 0.3); border-radius: 4px; display: flex; align-items: center; justify-content: space-between; gap: 12px;');
	const copilotText = el('div');
	copilotText.setAttribute('style', 'font-size: 11px; color: var(--text-secondary); flex: 1;');
	copilotText.textContent = 'Let Copilot help you fix the identified issues in this repository.';
	const copilotBtn = document.createElement('vscode-button');
	copilotBtn.setAttribute('style', 'min-width: 180px;');
	copilotBtn.textContent = '🤖 Ask Copilot to Improve';
	copilotBtn.addEventListener('click', () => {
		const failedLines = failedChecks.map((c: RepoHygieneCheck) => `- ${c.label}: ${c.detail || ''}${c.hint ? ` (${c.hint})` : ''}`).join('\n');
		const prompt = `Please help me improve this repository by addressing the following best practice issues:\n\n${failedLines}\n\nFor each issue, please provide specific steps or code changes to fix it.`;
		const isRepoOpen = !workspacePath || currentWorkspacePaths.some(p => p.toLowerCase() === workspacePath.toLowerCase());
		if (isRepoOpen) {
			vscode.postMessage({ command: 'openCopilotChatWithPrompt', prompt });
		} else {
			const repoFolderName = workspacePath.split(/[/\\]/).filter(Boolean).pop() ?? workspacePath;
			copilotSection.replaceChildren();
			copilotSection.setAttribute('style', 'margin-top: 16px; padding: 12px; background: rgba(251, 191, 36, 0.07); border: 1px solid rgba(251, 191, 36, 0.4); border-radius: 4px; display: flex; flex-direction: column; gap: 8px;');
			const instructions = el('div');
			instructions.setAttribute('style', 'font-size: 11px; color: var(--warning-fg);');
			instructions.textContent = `⚠️ Open "${repoFolderName}" in VS Code first, then paste this prompt into Copilot Chat:`;
			const promptBox = el('pre');
			promptBox.setAttribute('style', 'font-size: 10px; color: var(--text-secondary); background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 4px; padding: 8px; white-space: pre-wrap; word-break: break-word; max-height: 120px; overflow-y: auto; font-family: monospace; margin: 0;');
			promptBox.textContent = prompt;
			const copyBtn = document.createElement('vscode-button');
			copyBtn.setAttribute('appearance', 'secondary');
			copyBtn.textContent = '📋 Copy prompt';
			copyBtn.addEventListener('click', () => {
				navigator.clipboard.writeText(prompt).then(() => {
					copyBtn.textContent = '✅ Copied!';
					setTimeout(() => { copyBtn.textContent = '📋 Copy prompt'; }, 2000);
				});
			});
			copilotSection.append(instructions, promptBox, copyBtn);
		}
	});
	copilotSection.append(copilotText, copilotBtn);
	return copilotSection;
}

function buildRepoAnalysisBodyElement(data: RepoAnalysisData, workspacePath?: string): HTMLElement {
	const summary = data?.summary || {};
	const checks = Array.isArray(data?.checks) ? data.checks : [];
	const recommendations = Array.isArray(data?.recommendations) ? [...data.recommendations] : [];

	const container = el('div');
	container.appendChild(buildScoreHeaderElement(summary));
	container.appendChild(buildStatsGridElement(summary));

	const scoreSummary = el('div');
	scoreSummary.setAttribute('style', 'font-size: 11px; color: var(--text-muted); text-align: center; margin-bottom: 16px;');
	scoreSummary.textContent = `Score: ${toFiniteNumber(summary.totalScore)} / ${toFiniteNumber(summary.maxScore)} points`;
	container.appendChild(scoreSummary);

	const priorityOrder: { [key: string]: number } = { high: 1, medium: 2, low: 3 };
	recommendations.sort((a: RepoHygieneRecommendation, b: RepoHygieneRecommendation) => (priorityOrder[a?.priority as string] || 99) - (priorityOrder[b?.priority as string] || 99));

	const categories: Record<string, RepoHygieneCheck[]> = {};
	for (const check of checks) {
		const categoryId = typeof check?.category === 'string' && check.category.length > 0 ? check.category : 'other';
		if (!categories[categoryId]) { categories[categoryId] = []; }
		categories[categoryId].push(check);
	}
	for (const [categoryId, categoryChecks] of Object.entries(categories)) {
		container.appendChild(buildCategorySectionElement(categoryId, categoryChecks, summary));
	}

	if (recommendations.length > 0) {
		container.appendChild(buildRecommendationsSectionElement(recommendations));
	}

	const failedChecks = checks.filter((c: RepoHygieneCheck) => c?.status === 'fail' || c?.status === 'warning');
	if (failedChecks.length > 0) {
		container.appendChild(buildCopilotSectionElement(failedChecks, workspacePath));
	}

	return container;
}

function renderRepoListPane(listPane: HTMLElement, visibleWorkspaces: any[], hasSelectedRepository: boolean): void {
	const colStyles = {
		sessions: 'width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);',
		interactions: 'width: 80px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);',
		score: 'width: 60px; text-align: right; flex-shrink: 0; font-size: 11px; color: var(--text-primary);',
	};
	const headerHtml = `
		<div style="padding: 4px 12px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border-color); background: var(--bg-secondary);">
			<div style="flex: 1; min-width: 0; font-size: 10px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Repository</div>
			<div style="${colStyles.sessions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Sessions</div>
			<div style="${colStyles.interactions} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Interactions</div>
			<div style="${colStyles.score} font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.04em;">Score</div>
			<div style="width: 80px; flex-shrink: 0;"></div>
		</div>
	`;
	listPane.innerHTML = headerHtml + visibleWorkspaces.map((ws, idx) => {
		const record = repoAnalysisState.get(ws.workspacePath);
		const hasResult = !!record?.data?.summary;
		const scoreLabel = getScoreLabel(ws.workspacePath);
		const buttonLabel = hasResult ? 'Details' : 'Analyze';
		const buttonAction = hasResult ? 'details' : 'analyze';
		const isCurrentSelection = selectedRepoPath === ws.workspacePath && hasSelectedRepository;
		const sessions = Number(ws.sessionCount) || 0;
		const interactions = Number(ws.interactionCount) || 0;
		return `
			<div class="repo-item" style="padding: 6px 12px; border-bottom: ${idx < visibleWorkspaces.length - 1 ? '1px solid var(--border-subtle)' : 'none'}; display: flex; align-items: center; gap: 10px;">
				<div style="flex: 1; min-width: 0;">
					<div class="repo-name" style="font-size: 12px; font-weight: 600; color: var(--text-primary); font-family: 'Courier New', monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${escapeHtml(ws.workspacePath)}">
						${escapeHtml(ws.workspaceName)}
					</div>
				</div>
				<div style="${colStyles.sessions}">${sessions}</div>
				<div style="${colStyles.interactions}">${interactions}</div>
				<div style="${colStyles.score}">${escapeHtml(scoreLabel)}</div>
				<vscode-button class="btn-repo-action" data-action="${buttonAction}" data-workspace-path="${escapeHtml(ws.workspacePath)}" ${isCurrentSelection ? 'disabled="true"' : ''} style="min-width: 80px; flex-shrink: 0;">
					${buttonLabel}
				</vscode-button>
			</div>
		`;
	}).join('');
}

function renderRepoDetailSuccess(detailsPane: HTMLElement, record: any, workspaceName: string): void {
	detailsPane.replaceChildren();
	const card = el('div', 'repo-details-card');
	card.setAttribute('style', 'padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;');
	const header = el('div', 'repo-details-card-header');
	header.setAttribute('style', 'display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 10px;');
	const label = el('div');
	label.setAttribute('style', 'font-size: 12px; color: var(--text-secondary);');
	label.textContent = 'Repository: ';
	const repoName = el('span');
	repoName.setAttribute('style', "color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;");
	repoName.textContent = workspaceName;
	label.appendChild(repoName);
	const switchButton = document.createElement('vscode-button');
	switchButton.id = 'btn-switch-repository';
	switchButton.setAttribute('style', 'min-width: 120px;');
	switchButton.textContent = 'Switch Repository';
	header.append(label, switchButton);
	card.append(header, buildRepoAnalysisBodyElement(record.data, selectedRepoPath ?? undefined));
	detailsPane.appendChild(card);
}

function renderRepositoryHygienePanels(): void {
	const listPane = document.getElementById('repo-list-pane');
	const listContainer = document.getElementById('repo-list-pane-container');
	const detailsPane = document.getElementById('repo-details-pane');
	const detailsContainer = document.getElementById('repo-details-pane-container');
	if (!listPane || !listContainer || !detailsPane || !detailsContainer || !hygieneMatrixState) {
		return;
	}

	const hasSelectedRepository = !!selectedRepoPath && !isSwitchingRepository;
	const visibleWorkspaces = hasSelectedRepository
		? hygieneMatrixState.workspaces.filter((ws) => ws.workspacePath === selectedRepoPath)
		: hygieneMatrixState.workspaces;

	listContainer.classList.remove('repo-hygiene-pane-collapsed');
	detailsContainer.classList.toggle('repo-hygiene-pane-collapsed', !hasSelectedRepository);
	renderRepoListPane(listPane, visibleWorkspaces, hasSelectedRepository);

	if (!hasSelectedRepository || !selectedRepoPath) {
		detailsPane.replaceChildren();
		return;
	}

	const workspaceName = getWorkspaceName(selectedRepoPath);
	const record = repoAnalysisState.get(selectedRepoPath);
	if (record?.data) {
		renderRepoDetailSuccess(detailsPane, record, workspaceName);
		return;
	}

	if (record?.error) {
		detailsPane.innerHTML = `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${escapeHtml(workspaceName)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">❌ Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(record.error)}</div>
			</div>
		`;
		return;
	}

	detailsPane.innerHTML = `
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${escapeHtml(workspaceName)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`;
}

function displayRepoAnalysisResults(data: RepoAnalysisData, workspacePath?: string): void {
	if (workspacePath) {
		repoAnalysisState.set(workspacePath, { data, error: undefined });
		if (!isBatchAnalysisInProgress) {
			selectedRepoPath = workspacePath;
			isSwitchingRepository = false;
		}
		renderRepositoryHygienePanels();
		return;
	}

	const btn = document.getElementById('btn-analyse-repo') as (HTMLElement & { disabled: boolean }) | null;
	if (btn) {
		btn.disabled = false;
		btn.textContent = 'Analyze Repo for Best Practices';
	}

	const resultsHost = document.getElementById('repo-analysis-results');
	if (resultsHost) {
		resultsHost.replaceChildren();
		const card = el('div', 'repo-analysis-card');
		card.setAttribute('style', 'padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px; margin-bottom: 12px;');
		card.appendChild(buildRepoAnalysisBodyElement(data, workspacePath));
		resultsHost.appendChild(card);
	}
}

function displayRepoAnalysisError(error: string, workspacePath?: string): void {
	if (workspacePath) {
		repoAnalysisState.set(workspacePath, { data: undefined, error });
		if (!isBatchAnalysisInProgress) {
			selectedRepoPath = workspacePath;
			isSwitchingRepository = false;
		}
		renderRepositoryHygienePanels();
		return;
	}

	const btn = document.getElementById('btn-analyse-repo') as (HTMLElement & { disabled: boolean }) | null;
	if (btn) {
		btn.disabled = false;
		btn.textContent = 'Analyze Repo for Best Practices';
	}

	const resultsHost = document.getElementById('repo-analysis-results');
	if (resultsHost) {
		resultsHost.innerHTML = `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">❌ Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(error)}</div>
			</div>
		`;
	}
}

function handleBatchAnalysisComplete(): void {
	isBatchAnalysisInProgress = false;
	isSwitchingRepository = true;
	selectedRepoPath = null;
	renderRepositoryHygienePanels();

	// Re-enable the "Analyze All" button
	const btn = document.getElementById('btn-analyse-all') as (HTMLElement & { disabled: boolean }) | null;
	if (btn) {
		btn.disabled = false;
		const matrix = initialData?.customizationMatrix as WorkspaceCustomizationMatrix | undefined;
		const count = matrix?.workspaces?.length || 0;
		btn.textContent = `Analyze All Repositories (${count})`;
	}
}

async function bootstrap(): Promise<void> {
	const { provideVSCodeDesignSystem, vsCodeButton } = await import('@vscode/webview-ui-toolkit');
	provideVSCodeDesignSystem().register(vsCodeButton());

	// TOOL_NAME_MAP is imported at build-time from src/toolNames.json

	if (!initialData) {
		const root = document.getElementById('root');
		if (root) {
			root.innerHTML = '<div style="padding: 32px; text-align: center; color: var(--vscode-foreground); opacity: 0.7; font-size: 14px;">⏳ Loading usage analysis…</div>';
		}
		// If data doesn't arrive within 30s, show a helpful hint (non-fatal)
		loadingTimeoutId = setTimeout(() => {
			const r = document.getElementById('root');
			if (r && r.innerHTML.includes('Loading usage analysis')) {
				const hint = document.createElement('div');
				hint.style.cssText = 'padding: 32px; text-align: center; font-size: 14px;';
				const msg = document.createElement('div');
				msg.style.cssText = 'color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;';
				msg.textContent = '⏳ Taking longer than expected… Session files may be large or the scan is still in progress.';
				hint.append(msg, createRefreshButton());
				r.textContent = '';
				r.append(hint);
			}
		}, 30_000);
		// Stats will arrive via the updateStats message; the module-level listener will call renderLayout then.
		return;
	}
	console.log('[Usage Analysis] Browser default locale:', Intl.DateTimeFormat().resolvedOptions().locale);
	console.log('[Usage Analysis] Received locale from extension:', initialData.locale);
	console.log('[Usage Analysis] Test format 1234567.89 with received locale:', new Intl.NumberFormat(initialData.locale).format(1234567.89));
	setFormatLocale(initialData.locale);
	use24HourTime = initialData.use24HourTime !== false;
	renderLayout(initialData);
	setupSessionsTableSort();

	// Event delegation for suppress-tool buttons (rendered dynamically in the tools section)
	document.addEventListener('click', (event) => {
		const target = event.target as HTMLElement;
		const toolName = target.getAttribute('data-suppress-tool');
		if (toolName) {
			// Optimistic UI: remove the item immediately so the user sees instant feedback,
			// rather than waiting for the async config.update round-trip in the extension host.
			handleToolSuppressed(toolName);
			vscode.postMessage({ command: 'suppressUnknownTool', toolName });
		}
	});
}

void bootstrap().catch(err => {
	console.error('[Usage Analysis] Bootstrap failed:', err);
	const root = document.getElementById('root');
	if (root) {
		const container = document.createElement('div');
		container.style.cssText = 'padding: 32px; text-align: center; font-size: 14px;';
		const msg = document.createElement('div');
		msg.style.cssText = 'color: var(--vscode-errorForeground, #f48771); margin-bottom: 16px;';
		msg.textContent = 'Failed to initialize usage analysis. Please try refreshing.';
		container.append(msg, createRefreshButton());
		root.textContent = '';
		root.append(container);
	}
});
