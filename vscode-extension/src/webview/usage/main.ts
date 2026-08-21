// Usage Analysis webview
import { el, setHtml } from '../shared/domUtils';
import { createPeriodSelector, PERIOD_LABELS, type Period } from '../shared/periodSelector';
import { navButtonsHtml } from '../shared/buttonConfig';
import { ContextReferenceUsage, getTotalContextRefs } from '../shared/contextRefUtils';
import { escapeHtml, formatCompact, formatCost, formatDurationShort, formatFileSize, formatFixed, formatNumber, formatPercent, safeSectionHtml, setFormatLocale } from '../shared/formatUtils';
import { wireExtensionPointButtons } from '../shared/extensionPoints';
import { initializeWebviewLocalization, setCurrentLanguage } from '../shared/localization';
import type { McpToolUsage, ModeUsage, ModelSwitchingAnalysis as BaseModelSwitchingAnalysis, ToolCallUsage } from '../shared/types';
// CSS imported as text via esbuild
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../../../../src/webview/shared/dataLoader';
import { registerMessageHandler } from '../shared/messageHandler';
import { getModelDisplayName } from '../../../../src/webview/shared/modelUtils';
import { getLongContextInfo } from '../../../../src/tokenEstimation';
import { deriveModelEfficiencyRates, computeEfficiencyLowUsageThreshold } from '../../../../src/modelEfficiency';
import type { ModelPricing, ModelEfficiencyUsage, ModelEfficiencyCounters } from '../../../../src/types';
import { sanitizeCustomizationMatrix } from './customizationSanitizer';
import { applyBillingFields, type CopilotApiBalance } from './billingStatsSanitizer';
import { sanitizeAgentSessionsData, toSafeNumber, toSafeHttpUrl, type AgentSessionsResult } from './agentSessionsSanitizer';

type ModelSwitchingAnalysis = BaseModelSwitchingAnalysis & {
	minModelsPerSession: number;
	standardRequests: number;
	premiumRequests: number;
	highCostRequests: number;
	lowCostRequests: number;
	mediumCostRequests: number;
	unknownRequests: number;
	totalRequests: number;
};

type ContextWindowStats = {
	maxRequestInputTokens: number;
	maxRequestModels: string[];
	tierCounts: { [tier: string]: number };
	maxReachedTokens?: number;
	maxReachedWindowLimit?: number;
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
	contextWindow?: ContextWindowStats;
	modelEfficiency?: ModelEfficiencyUsage;
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
	maxRequestInputTokens?: number;
	contextTier?: string;
	contextWindowLimit?: number;
	contextReachedTokens?: number;
	durationMs?: number;
	activeDurationMs?: number;
	workspace?: string;
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
	lastMonth: UsageAnalysisPeriod;
	locale?: string;
	lastUpdated: string;
	customizationMatrix?: WorkspaceCustomizationMatrix | null;
	missedPotential?: MissedPotentialWorkspace[];
	backendConfigured?: boolean;
	currentWorkspacePaths?: string[];
	suppressedUnknownTools?: string[];
	todaySessions?: TodaySessionSummary[];
	use24HourTime?: boolean;
	/** When true (default), rows tagged "auto" are hidden from the Tool Usage tables so only intentional tool calls are shown. */
	hideAutomaticToolCalls?: boolean;
	insights?: EvaluatedInsight[];
	curationAnalysis?: ToolCurationAnalysis | null;
	/** Persisted "Recent Sessions" column visibility (optional column ids). Absent/invalid entries mean "show all". */
	sessionColumnSettings?: { enabledColumns?: string[] };
	/** Copilot API quota balance snapshot (available when the extension has fetched quota data). */
	copilotApiBalance?: CopilotApiBalance | null;
	/** Current-month billing group costs in USD from the extension's local session tracking. */
	monthBillingGroupCosts?: Record<string, number> | null;
};

// ── Tool Curation types ──────────────────────────────────────────────────────
// These mirror the interfaces in vscode-extension/src/types.ts.
// They must be kept in sync manually because the webview bundle cannot import
// extension-side TypeScript modules directly.

type AvailableToolSource = 'builtin' | 'mcp' | 'extension' | 'skill';

interface AvailableToolEntry {
	name: string;
	description: string;
	source: AvailableToolSource;
	server?: string;
	extensionId?: string;
	skillPath?: string;
	pluginName?: string;
	configFiles?: string[];
	enabled?: boolean;
	extensionActive?: boolean;
}

interface ToolCurationRecommendation {
	type: 'disable-mcp-server' | 'disable-extension' | 'refine-skill' | 'remove-skill';
	target: string;
	reason: string;
	estimatedTokenSavings?: number;
}

interface ToolCurationAnalysis {
	windowDays: number;
	availableTools: AvailableToolEntry[];
	usedTools: { name: string; count: number }[];
	unusedTools: AvailableToolEntry[];
	underusedMcpServers: { server: string; availableToolCount: number; usedToolCount: number; configFiles?: string[]; extensionId?: string; enabled?: boolean; extensionActive?: boolean }[];
	underusedAgentPlugins: { pluginName: string; availableSkillCount: number; usedSkillCount: number }[];
	estimatedPromptBloat: { totalTokens: number; byServer: Record<string, number> };
	recommendations: ToolCurationRecommendation[];
}

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

/** Webview state persisted by VS Code across tab switches (survives the panel being hidden). */
interface UsageWebviewState {
	aboutCollapsed?: boolean;
}

const vscode = acquireVsCodeApi<UsageWebviewState>();
const curationTraceOnceKeys = new Set<string>();

/** Collapsed state of the "About This Dashboard" info box, restored from webview state. */
let aboutCollapsed = vscode.getState()?.aboutCollapsed ?? false;

function traceCuration(stage: string, details?: Record<string, unknown>): void {
	try {
		vscode.postMessage({ command: 'traceUsageCuration', stage, details: details ?? {} });
	} catch {
		// ignore tracing failures
	}
}

function traceCurationOnce(key: string, stage: string, details?: Record<string, unknown>): void {
	if (curationTraceOnceKeys.has(key)) { return; }
	curationTraceOnceKeys.add(key);
	traceCuration(stage, details);
}

type InitialUsageData = UsageAnalysisStats & { customizationMatrix?: WorkspaceCustomizationMatrix | null; missedPotential?: MissedPotentialWorkspace[]; worktreeScanRoots?: string[]; localization?: Record<string, string> };
const initialData = getWindowData<InitialUsageData>('__INITIAL_USAGE__');

// Initialize localization for webview
if (initialData?.localization) {
	initializeWebviewLocalization(initialData.localization);
	const language = initialData.localization['__language__'] || 'en';
	setCurrentLanguage(language);
}
let hygieneMatrixState: WorkspaceCustomizationMatrix | null = null;
const repoAnalysisState = new Map<string, RepoAnalysisRecord>();
let selectedRepoPath: string | null = null;
let isSwitchingRepository = false;
let isBatchAnalysisInProgress = false;
let currentWorkspacePaths: string[] = [];
let activeTab = 'activity';
let loadingTimeoutId: ReturnType<typeof setTimeout> | null = null;
let currentInsights: EvaluatedInsight[] = [];
// Persisted across stats refreshes so the curation section doesn't disappear
// when a periodic updateStats message omits curationAnalysis.
let currentCurationAnalysis: ToolCurationAnalysis | null = null;

type WorktreeResult = {
	path: string;
	repoLabel: string;
	branch: string;
	lastCommit: string;
	lastCommitDate: string | null;
	pushed: "yes" | "no" | "?";
	files: number;
	folders: number;
	bytes: number;
};

type WorktreeScanStatus = {
	root: string;
	checked: number;
	total: number;
	foundCount: number;
	elapsedMs: number;
	/**
	 * "walking" while discovering .git markers under the root; "checking" while resolving them;
	 * "enriching" during the background size + push-status pass.
	 */
	phase?: "walking" | "checking" | "enriching";
	/** Folders explored during the "walking" phase (live activity indicator). */
	dirsScanned?: number;
	/** Worktrees whose size + push status have been computed during the "enriching" phase. */
	enriched?: number;
	/** Total worktrees to enrich during the "enriching" phase. */
	enrichTotal?: number;
};

// Worktree discovery tab state
let worktreeRoots: string[] = initialData?.worktreeScanRoots ? [...initialData.worktreeScanRoots] : [];
let worktreeResults: WorktreeResult[] = [];
let worktreeScanInProgress = false;
let worktreeScanStatus: WorktreeScanStatus = { root: "", checked: 0, total: 0, foundCount: 0, elapsedMs: 0 };
let worktreeScanError: string | null = null;
let worktreeRenderPending = false;
// Repo labels whose per-worktree details table is expanded in the results view.
const worktreeExpandedRepos = new Set<string>();
// Whether the root-folders list is expanded. Collapsed by default when there are more than 2.
let worktreeRootsExpanded = false;
// Sort state for the top-level repository table.
type WorktreeSortColumn = "repo" | "count" | "size";
let worktreeSortColumn: WorktreeSortColumn = "count";
let worktreeSortDir: "asc" | "desc" = "desc";

// Bulk "clean up pushed worktrees" state.
let worktreeCleanupInProgress = false;
// True from the moment the cleanup button is clicked until the extension's native confirm
// modal is answered, so a second click can't fire a duplicate confirmation while it's open.
let worktreeCleanupConfirmPending = false;
let worktreeCleanupStatus: { processed: number; total: number } = { processed: 0, total: 0 };
type WorktreeCleanupOutcome = "deleted" | "skipped" | "error";
type WorktreeCleanupLogEntry = { path: string; branch: string; repoLabel: string; status: WorktreeCleanupOutcome; reason?: string };
let worktreeCleanupLog: WorktreeCleanupLogEntry[] = [];

function numField(v: unknown): number { return Number(v ?? 0) || 0; }

const USAGE_LOADING_CSS = `
<style id="usage-loading-css">
:root {
  --ul-bg: var(--vscode-sideBar-background, #181825);
  --ul-card: var(--vscode-editorWidget-background, #24273a);
  --ul-fg: var(--vscode-editor-foreground, #cdd6f4);
  --ul-muted: var(--vscode-descriptionForeground, #9399b2);
  --ul-accent: var(--vscode-textLink-foreground, #89b4fa);
  --ul-success: var(--vscode-terminal-ansiGreen, #a6e3a1);
  --ul-border: var(--vscode-panel-border, #313244);
  --ul-badge-bg: var(--vscode-badge-background, #313244);
}
#usage-loading-wrap {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  display: flex; align-items: flex-start; justify-content: center; padding: 28px 20px;
}
#usage-loading-card {
  width: 100%; max-width: 680px;
  background: var(--ul-card); border: 1px solid var(--ul-border);
  border-radius: 16px; padding: 24px 28px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.3); color: var(--ul-fg);
}
#ul-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px; gap: 16px; }
#ul-badge { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--ul-accent); margin-bottom: 4px; }
#ul-title { font-size: 22px; font-weight: 700; color: var(--ul-fg); margin-bottom: 4px; }
#ul-subtitle { font-size: 12px; color: var(--ul-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 360px; }
#ul-right { display: flex; flex-direction: column; align-items: flex-end; gap: 6px; flex-shrink: 0; }
#ul-pct { font-size: 32px; font-weight: 800; color: var(--ul-fg); line-height: 1; min-width: 60px; text-align: right; font-variant-numeric: tabular-nums; }
.ul-meta-badge { font-size: 11px; padding: 3px 10px; border: 1px solid var(--ul-border); border-radius: 20px; color: var(--ul-muted); background: var(--vscode-editor-background, #1e1e2e); white-space: nowrap; }
#ul-track { height: 6px; background: var(--ul-border); border-radius: 3px; overflow: hidden; margin: 16px 0; }
#ul-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--ul-accent), var(--ul-success)); transition: width 0.4s ease; width: 3%; }
#ul-fill.ul-indeterminate { width: 25%; animation: ul-shimmer 1.8s ease-in-out infinite; background: linear-gradient(90deg, transparent, var(--ul-accent), var(--ul-success), transparent); }
@keyframes ul-shimmer { 0% { margin-left: -30%; } 100% { margin-left: 110%; } }
#ul-steps { background: var(--ul-bg); border: 1px solid var(--ul-border); border-radius: 10px; padding: 14px 16px; }
.ul-step { display: flex; align-items: center; gap: 10px; padding: 5px 0; color: var(--ul-muted); font-size: 13px; transition: color 0.25s; }
.ul-step.ul-done   { color: var(--ul-success); }
.ul-step.ul-active { color: var(--ul-accent); font-weight: 600; }
.ul-ico { width: 18px; text-align: center; flex-shrink: 0; }
.ul-spin { display: inline-block; animation: ul-spin 0.75s linear infinite; }
@keyframes ul-spin { to { transform: rotate(360deg); } }
.ul-lbl { flex: 1; }
.ul-cnt { font-size: 11px; opacity: 0.75; font-variant-numeric: tabular-nums; }
@keyframes ul-pop { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.3); } 100% { transform: scale(1); opacity: 1; } }
.ul-pop { animation: ul-pop 0.3s ease both; }
</style>`;

const USAGE_LOADING_STEPS = [
	{ id: 'ul-s-start',  label: 'Starting usage analysis' },
	{ id: 'ul-s-tools',  label: 'Collecting runtime tools' },
	{ id: 'ul-s-mcp',    label: 'Discovering MCP servers' },
	{ id: 'ul-s-skills', label: 'Scanning skill directories' },
	{ id: 'ul-s-crunch', label: 'Computing curation analysis' },
	{ id: 'ul-s-ready',  label: 'Ready!' },
] as const;

type UsageLoadingStepId = typeof USAGE_LOADING_STEPS[number]['id'];

const USAGE_STAGE_MAP: Record<string, { pct: number; stepId: UsageLoadingStepId; subtitle: string }> = {
	start:                     { pct:  5, stepId: 'ul-s-start',  subtitle: 'Starting usage analysis…' },
	'curation:start':          { pct: 20, stepId: 'ul-s-tools',  subtitle: 'Collecting tools and skills…' },
	'curation:runtimeTools':   { pct: 32, stepId: 'ul-s-tools',  subtitle: 'Collected runtime tools' },
	'curation:mcpJson':        { pct: 44, stepId: 'ul-s-mcp',    subtitle: 'Scanning MCP config files…' },
	'curation:mcpSources':     { pct: 55, stepId: 'ul-s-mcp',    subtitle: 'Collected MCP servers' },
	'curation:skillsScanStart':{ pct: 63, stepId: 'ul-s-skills', subtitle: 'Scanning skill directories…' },
	'curation:skillsScanDone': { pct: 75, stepId: 'ul-s-skills', subtitle: 'Skill discovery complete' },
	'curation:analyzing':      { pct: 85, stepId: 'ul-s-crunch', subtitle: 'Analyzing tool usage patterns…' },
	'curation:done':           { pct: 96, stepId: 'ul-s-crunch', subtitle: 'Curation analysis complete' },
	ready:                     { pct:100, stepId: 'ul-s-ready',  subtitle: 'Usage analysis ready' },
	error:                     { pct:100, stepId: 'ul-s-ready',  subtitle: 'Analysis completed with errors' },
	'curation:error':          { pct: 85, stepId: 'ul-s-crunch', subtitle: 'Curation analysis skipped' },
};

function renderUsageLoadingState(initialMessage = 'Loading usage analysis...'): void {
	const root = document.getElementById('root');
	if (!root) { return; }
	_ulLoadingActive = true;

	const stepsHtml = USAGE_LOADING_STEPS.map((s, i) => {
		const isFirst = i === 0;
		const cls = isFirst ? 'ul-step ul-active' : 'ul-step';
		const ico = isFirst ? '<span class="ul-spin">↻</span>' : '○';
		return `<div class="${cls}" id="${s.id}"><span class="ul-ico">${ico}</span><span class="ul-lbl">${escapeHtml(s.label)}</span><span class="ul-cnt" id="${s.id}-cnt"></span></div>`;
	}).join('');

	setHtml(root, `${USAGE_LOADING_CSS}
<div id="usage-loading-wrap">
  <div id="usage-loading-card">
    <div id="ul-header">
      <div>
        <div id="ul-badge">📊 Analyzing Usage Data</div>
        <div id="ul-title">${escapeHtml(initialMessage)}</div>
        <div id="ul-subtitle">Initializing…</div>
      </div>
      <div id="ul-right">
        <div id="ul-pct">–</div>
        <div style="display:flex;gap:6px;" id="ul-meta"></div>
      </div>
    </div>
    <div id="ul-track"><div id="ul-fill" class="ul-indeterminate"></div></div>
    <div id="ul-steps">${stepsHtml}</div>
  </div>
</div>`);
}

function _ulSetDone(id: string): void {
	const el = document.getElementById(id);
	if (!el) { return; }
	el.className = 'ul-step ul-done';
	const ico = el.querySelector('.ul-ico');
	if (ico) { setHtml(ico, '<span class="ul-pop">✓</span>'); }
}

function _ulSetActive(id: string): void {
	const el = document.getElementById(id);
	if (!el) { return; }
	el.className = 'ul-step ul-active';
	const ico = el.querySelector('.ul-ico');
	if (ico) { setHtml(ico, '<span class="ul-spin">↻</span>'); }
}

function _ulSetCnt(id: string, text: string): void {
	const el = document.getElementById(`${id}-cnt`);
	if (el) { el.textContent = text; }
}

let _ulLastStepIdx = 0;
// True while the loading card is the active view. Once real content is
// rendered (updateStats) this is cleared, so stray progress events from a
// background silent recompute never re-create the loading card over content.
let _ulLoadingActive = false;

function _ulAdvanceSteps(targetIdx: number, pct: number): void {
	for (let i = _ulLastStepIdx; i < targetIdx; i++) { _ulSetDone(USAGE_LOADING_STEPS[i].id); }
	if (targetIdx > _ulLastStepIdx) { _ulLastStepIdx = targetIdx; }
	if (pct < 100) { _ulSetActive(USAGE_LOADING_STEPS[targetIdx].id); }
	else { _ulSetDone(USAGE_LOADING_STEPS[targetIdx].id); }
}

function _ulDetailCnt(details: Record<string, unknown>): string {
	if (typeof details.count === 'number') { return `${details.count}`; }
	if (typeof details.skills === 'number') { return `${details.skills} skills`; }
	if (typeof details.availableTools === 'number') { return `${details.availableTools} tools`; }
	return '';
}

// Ensures the loading card exists before applying a progress event. Returns
// false when the event should be ignored because content has already replaced
// the card (stray events from a background silent recompute), preventing the
// loading card from flashing back over the rendered analysis.
function _ulEnsureCard(): boolean {
	const root = document.getElementById('root');
	if (!root) { return false; }
	if (root.querySelector('#usage-loading-card')) { return true; }
	if (!_ulLoadingActive) { return false; }
	renderUsageLoadingState('Building Usage Analysis');
	_ulLastStepIdx = 0;
	return true;
}

function updateUsageLoadingProgress(message: any): void {
	if (!_ulEnsureCard()) { return; }
	const stage = typeof message?.stage === 'string' ? message.stage : '';
	const mapped = USAGE_STAGE_MAP[stage];
	if (!mapped) { return; }

	const pct = mapped.pct;
	const fill = document.getElementById('ul-fill');
	if (fill) { fill.classList.remove('ul-indeterminate'); fill.style.width = `${Math.max(pct, 3)}%`; }
	const pctEl = document.getElementById('ul-pct');
	if (pctEl) { pctEl.textContent = pct === 100 ? '100%' : `${pct}%`; }
	const subtitleEl = document.getElementById('ul-subtitle');
	if (subtitleEl) { subtitleEl.textContent = mapped.subtitle; }

	const targetIdx = USAGE_LOADING_STEPS.findIndex(s => s.id === mapped.stepId);
	if (targetIdx >= 0) { _ulAdvanceSteps(targetIdx, pct); }

	const details = message?.details;
	if (details && typeof details === 'object') {
		const cnt = _ulDetailCnt(details as Record<string, unknown>);
		if (cnt) { _ulSetCnt(mapped.stepId, `(${cnt})`); }
	}
}

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
	setHtml(icon, statusBadgeHtml('❌', 'Error'));
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
  userAuthoredPrs?: number;
  userMergedPrs?: number;
  error?: string;
};

type RepoPrStatsResult = {
  repos: RepoPrInfo[];
  authenticated: boolean;
  since: string;
};

const EFFORT_DISPLAY_NAMES: Record<string, string> = {
	xhigh: 'Extra High',
};

function getEffortDisplayName(level: string): string {
	return EFFORT_DISPLAY_NAMES[level] ?? level;
}

import { resolveGuidMcpToolName, isGuidMcpTool, resolveMcpFamilyToolName, isMcpFamilyResolvedTool } from '../../../../src/utils/toolUtils';

// Tool name maps are injected by the extension host as window.__TOOL_NAMES__ and window.__AUTOMATIC_TOOLS__
const TOOL_NAME_MAP: { [key: string]: string } | null = getWindowData<Record<string, string>>('__TOOL_NAMES__') ?? null;
const _automaticToolIds = getWindowData<string[]>('__AUTOMATIC_TOOLS__') ?? [];
const AUTOMATIC_TOOL_SET_WV = new Set<string>(_automaticToolIds.map(id => id.toLowerCase()));

function lookupToolName(id: string): string {
	if (!TOOL_NAME_MAP) {
		return id;
	}
	return TOOL_NAME_MAP[id] ?? TOOL_NAME_MAP[id.toLowerCase()] ?? resolveGuidMcpToolName(id) ?? resolveMcpFamilyToolName(id) ?? id;
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
	
	// Filter to only unknown tools (not a key in the map, case-insensitively, and not
	// resolvable via a known GUID/family pattern) and not suppressed. Tools resolved via
	// isMcpFamilyResolvedTool are a recognized MCP tool under a new server-registration
	// spelling (see issue #1760) — they shouldn't generate another "add missing name" report.
	return Array.from(allTools).filter(tool => !TOOL_NAME_MAP?.[tool] && !TOOL_NAME_MAP?.[tool.toLowerCase()] && !isGuidMcpTool(tool) && !isMcpFamilyResolvedTool(tool) && !suppressed.has(tool)).sort();
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

/** Renders the top stats-grid section (avg models, switching frequency, max models). */
function _renderMultiModelStatCards(switching: ModelSwitchingAnalysis): string {
return `
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
</div>`;
}

/** Renders the "Models by Cost Level" breakdown listing model names per cost tier. */
function _renderMultiModelCostLevelBreakdown(
allLowCostModels: readonly string[],
allMediumCostModels: readonly string[],
allHighCostModels: readonly string[],
allUnknownModels: readonly string[],
): string {
return `
<div style="min-height: 110px;">
${allLowCostModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: #4ade80;">💚 Low cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allLowCostModels.map(escapeHtml).join(', ')}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allMediumCostModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--link-color);">🟡 Medium cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allMediumCostModels.map(escapeHtml).join(', ')}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allHighCostModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--warning-fg);">💸 High cost:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allHighCostModels.map(escapeHtml).join(', ')}</span>
</div>
` : '<div style="margin-bottom: 6px; height: 21px;"></div>'}
${allUnknownModels.length > 0 ? `
<div style="margin-bottom: 6px;">
<span style="color: var(--text-muted);">❓ Unknown:</span>
<span style="font-size: 11px; color: var(--text-primary);">${allUnknownModels.map(escapeHtml).join(', ')}</span>
</div>
` : ''}
</div>`;
}

/** Renders the "Request Count" breakdown by cost tier, or an empty string if there were no requests. */
function _renderMultiModelRequestCountBreakdown(switching: ModelSwitchingAnalysis): string {
if (switching.totalRequests <= 0) {
return '';
}
return `
<div style="padding-top: 8px; border-top: 1px solid var(--border-subtle); min-height: 85px;">
<div style="font-size: 11px; font-weight: 600; color: var(--text-primary); margin-bottom: 4px;">Request Count:</div>
${switching.lowCostRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: #4ade80;">💚 Low cost: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.lowCostRequests)} (${formatPercent((switching.lowCostRequests / switching.totalRequests) * 100)})</span>
</div>
` : ''}
${switching.mediumCostRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--link-color);">🟡 Medium cost: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.mediumCostRequests)} (${formatPercent((switching.mediumCostRequests / switching.totalRequests) * 100)})</span>
</div>
` : ''}
${switching.highCostRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--warning-fg);">💸 High cost: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.highCostRequests)} (${formatPercent((switching.highCostRequests / switching.totalRequests) * 100)})</span>
</div>
` : ''}
${switching.unknownRequests > 0 ? `
<div style="margin-bottom: 4px; font-size: 11px;">
<span style="color: var(--text-muted);">❓ Unknown: </span>
<span style="color: var(--text-primary);">${formatNumber(switching.unknownRequests)} (${formatPercent((switching.unknownRequests / switching.totalRequests) * 100)})</span>
</div>
` : ''}
</div>`;
}

/** Renders the mixed-cost-sessions callout line, or an empty string if there were none. */
function _renderMultiModelMixedCostSessions(switching: ModelSwitchingAnalysis): string {
if (switching.mixedCostSessions <= 0) {
return '';
}
return `
<div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid var(--border-subtle);">
<span style="font-size: 11px; color: var(--link-color);">🔀 Mixed cost sessions: ${formatNumber(switching.mixedCostSessions)}</span>
</div>`;
}

/** Renders one column of the Multi-Model Usage section for a single time period. */
function renderMultiModelPeriod(
title: string,
switching: ModelSwitchingAnalysis,
allLowCostModels: readonly string[],
allMediumCostModels: readonly string[],
allHighCostModels: readonly string[],
allUnknownModels: readonly string[],
): string {
return `
<div>
<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">${title}</h4>
${_renderMultiModelStatCards(switching)}
<div style="margin-top: 12px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-subtle); border-radius: 6px;">
<div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Models by Cost Level:</div>
${_renderMultiModelCostLevelBreakdown(allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
${_renderMultiModelRequestCountBreakdown(switching)}
${_renderMultiModelMixedCostSessions(switching)}
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

function renderToolsTable(byTool: { [key: string]: number }, limit = 10, nameResolver: (id: string) => string = lookupToolName, applyAutoFilter = false): string {
	const entries = applyAutoFilter && hideAutomaticToolCalls
		? Object.entries(byTool).filter(([tool]) => !AUTOMATIC_TOOL_SET_WV.has(tool.toLowerCase()))
		: Object.entries(byTool);
	const sortedTools = entries
		.sort(([, a], [, b]) => b - a)
		.slice(0, limit);

	if (sortedTools.length === 0) {
		return applyAutoFilter && hideAutomaticToolCalls
			? '<div style="color: var(--text-muted);">No purposeful tools used yet (automatic tool calls are hidden)</div>'
			: '<div style="color: var(--text-muted);">No tools used yet</div>';
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

// --- Recent Sessions table with sortable, toggleable columns ---
type SessionSortColumn = 'title' | 'interactions' | 'toolCalls' | 'inputTokens' | 'outputTokens' | 'thinkingTokens' | 'cachedTokens' | 'totalTokens' | 'estimatedCost' | 'editor' | 'workspace' | 'durationMs' | 'lastActivity';
type SessionsLookback = Period;

/** Optional (toggleable) session table columns. Title is always shown and is not part of this set. */
type SessionColumnId = 'interactions' | 'toolCalls' | 'inputTokens' | 'outputTokens' | 'thinkingTokens' | 'cachedTokens' | 'totalTokens' | 'estimatedCost' | 'editor' | 'workspace' | 'models' | 'durationMs' | 'lastActivity';

type SessionColumnDef = {
	id: SessionColumnId;
	label: string;
	/** Absent for columns that cannot be sorted (Models). */
	sortKey?: SessionSortColumn;
	align: 'left' | 'right';
	/** Extra inline style appended after the base cell style (later declarations win). */
	cellStyle?: string;
	render: (s: TodaySessionSummary) => { html: string; title?: string };
};

const SESSION_COLUMN_DEFS: SessionColumnDef[] = [
	{ id: 'interactions', label: 'Turns', sortKey: 'interactions', align: 'right', render: s => ({ html: formatNumber(s.interactions) }) },
	{ id: 'toolCalls', label: 'Tools', sortKey: 'toolCalls', align: 'right', render: s => ({ html: formatNumber(s.toolCalls) }) },
	{ id: 'inputTokens', label: 'Input', sortKey: 'inputTokens', align: 'right', render: s => ({ html: formatNumber(s.inputTokens) }) },
	{ id: 'outputTokens', label: 'Output', sortKey: 'outputTokens', align: 'right', render: s => ({ html: formatNumber(s.outputTokens) }) },
	{ id: 'thinkingTokens', label: 'Thinking', sortKey: 'thinkingTokens', align: 'right', render: s => ({ html: formatNumber(s.thinkingTokens) }) },
	{ id: 'cachedTokens', label: 'Cached', sortKey: 'cachedTokens', align: 'right', render: s => ({ html: formatNumber(s.cachedTokens) }) },
	{ id: 'totalTokens', label: 'Total', sortKey: 'totalTokens', align: 'right', render: s => ({ html: formatNumber(s.totalTokens) }) },
	{ id: 'estimatedCost', label: 'Cost', sortKey: 'estimatedCost', align: 'right', render: s => ({ html: s.estimatedCost > 0 ? `$${s.estimatedCost.toFixed(4)}` : '—' }) },
	{ id: 'editor', label: 'Editor', sortKey: 'editor', align: 'left', render: s => ({ html: escapeHtml(s.editor || 'unknown') }) },
	{ id: 'workspace', label: 'Workspace', sortKey: 'workspace', align: 'left', cellStyle: 'max-width:140px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;', render: s => { const workspace = escapeHtml(s.workspace || '—'); return { html: workspace, title: workspace }; } },
	{ id: 'models', label: 'Models', align: 'left', cellStyle: 'font-size:11px; max-width:180px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;', render: s => { const models = s.models.map(m => escapeHtml(getModelDisplayName(m))).join(', ') || '—'; return { html: models, title: models }; } },
	{ id: 'durationMs', label: 'Duration', sortKey: 'durationMs', align: 'right', cellStyle: 'white-space:nowrap;', render: s => {
		const net = s.activeDurationMs ?? s.durationMs;
		const wallLabel = s.durationMs !== undefined ? `Wall time: ${formatDurationShort(s.durationMs)}` : undefined;
		return { html: formatDurationShort(net), ...(wallLabel ? { title: wallLabel } : {}) };
	} },
	{
		id: 'lastActivity', label: 'Last Active', sortKey: 'lastActivity', align: 'right', cellStyle: 'white-space:nowrap;',
		render: s => ({
			html: s.lastActivity
				? (sessionsLookback === 'today'
					? new Date(s.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: !use24HourTime })
					: new Date(s.lastActivity).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: !use24HourTime }))
				: '—'
		}),
	},
];

const ALL_SESSION_COLUMN_IDS: SessionColumnId[] = SESSION_COLUMN_DEFS.map(c => c.id);

let sessionSortColumn: SessionSortColumn = 'interactions';
let sessionSortDirection: 'asc' | 'desc' = 'desc';
let cachedTodaySessions: TodaySessionSummary[] = [];
let use24HourTime = true;
/** When true (default), the Tool Usage tables hide rows tagged "auto" so purposeful tool calls stand out. */
let hideAutomaticToolCalls = true;
// Lookback selector state: "today" renders the summaries bundled with updateStats;
// longer windows are lazily requested from the extension host and cached here.
let sessionsLookback: SessionsLookback = 'today';
let latestTodaySessions: TodaySessionSummary[] = [];
const recentSessionsCache: { [period: string]: TodaySessionSummary[] } = {};
/** Which optional columns are currently visible. Title (and the row number) are always shown. */
let enabledSessionColumns: Set<SessionColumnId> = new Set(ALL_SESSION_COLUMN_IDS);

function saveSessionColumnSettings(): void {
	vscode.postMessage({ command: 'saveSessionColumnSettings', settings: { enabledColumns: Array.from(enabledSessionColumns) } });
}

function getSessionSortIndicator(column: SessionSortColumn): string {
	if (sessionSortColumn !== column) { return ''; }
	return sessionSortDirection === 'desc' ? ' ▼' : ' ▲';
}

const _todaySessionColumnComparators: Partial<Record<SessionSortColumn, (a: TodaySessionSummary, b: TodaySessionSummary) => number>> = {
	title: (a, b) => (a.title || '').localeCompare(b.title || ''),
	editor: (a, b) => (a.editor || '').localeCompare(b.editor || ''),
	workspace: (a, b) => (a.workspace || '').localeCompare(b.workspace || ''),
	durationMs: (a, b) => (a.activeDurationMs ?? a.durationMs ?? -1) - (b.activeDurationMs ?? b.durationMs ?? -1),
	lastActivity: (a, b) => (a.lastActivity || '').localeCompare(b.lastActivity || ''),
};

function _compareTodaySessionsByColumn(a: TodaySessionSummary, b: TodaySessionSummary): number {
	const comparator = _todaySessionColumnComparators[sessionSortColumn];
	if (comparator) { return comparator(a, b); }
	return (a[sessionSortColumn] as number) - (b[sessionSortColumn] as number);
}

function sortTodaySessions(sessions: TodaySessionSummary[]): TodaySessionSummary[] {
	return [...sessions].sort((a, b) => {
		const cmp = _compareTodaySessionsByColumn(a, b);
		return sessionSortDirection === 'desc' ? -cmp : cmp;
	});
}

function renderTodaySessionsTable(sessions: TodaySessionSummary[]): string {
	cachedTodaySessions = sessions;
	if (!sessions || sessions.length === 0) {
		const emptyMessage = sessionsLookback === 'today' ? 'No sessions recorded today yet.' : 'No sessions recorded in this period.';
		return `<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">${emptyMessage}</div>`;
	}
	return `<div id="sessions-table-container">${buildSessionsTableHtml(sessions)}</div>`;
}

function buildSessionsTableHtml(sessions: TodaySessionSummary[]): string {
	const sorted = sortTodaySessions(sessions);
	const visibleColumns = SESSION_COLUMN_DEFS.filter(c => enabledSessionColumns.has(c.id));

	const rows = sorted.map((s, idx) => {
		const title = escapeHtml(s.title || 'Untitled session');
		const filePath = escapeHtml(s.filePath || '');
		const optionalCells = visibleColumns.map(col => {
			const { html, title: cellTitle } = col.render(s);
			const alignStyle = col.align === 'right' ? 'text-align:right;' : '';
			const titleAttr = cellTitle !== undefined ? ` title="${cellTitle}"` : '';
			return `<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${alignStyle}${col.cellStyle || ''}"${titleAttr}>${html}</td>`;
		}).join('');
		return `<tr>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; color:var(--text-secondary);">${idx + 1}</td>
			<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; max-width:200px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="Open viewer for session &quot;${title}&quot;"><a href="#" class="session-title-link" data-file="${filePath}" style="color:var(--link-color, #4fc1ff); text-decoration:none; cursor:pointer;">${title}</a></td>
			${optionalCells}
		</tr>`;
	}).join('');

	const headerCells = visibleColumns.map(col => {
		const alignStyle = col.align === 'right' ? ' text-align:right;' : '';
		if (!col.sortKey) { return `<th style="padding:6px 8px;${alignStyle}">${col.label}</th>`; }
		return `<th class="sortable" data-sort="${col.sortKey}" style="padding:6px 8px;${alignStyle}">${col.label}${getSessionSortIndicator(col.sortKey)}</th>`;
	}).join('');

	return `
		<div style="overflow-x:auto;">
		<table class="sessions-table" style="width:100%; border-collapse:collapse; min-width:1050px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">
					<th style="padding:6px 8px;">#</th>
					<th class="sortable" data-sort="title" style="padding:6px 8px;">Title${getSessionSortIndicator('title')}</th>
					${headerCells}
				</tr>
			</thead>
			<tbody>
				${rows}
			</tbody>
		</table>
		</div>`;
}

/** Builds the "Columns" toggle button and its checkbox dropdown for showing/hiding optional columns. */
function buildSessionColumnsMenuHtml(): string {
	const items = SESSION_COLUMN_DEFS.map(col => `
		<label style="display:flex; align-items:center; gap:6px; padding:4px 8px; font-size:12px; white-space:nowrap; cursor:pointer;">
			<input type="checkbox" data-column="${col.id}"${enabledSessionColumns.has(col.id) ? ' checked' : ''} />
			<span>${col.label}</span>
		</label>`).join('');
	return `
		<div class="columns-menu-wrap" style="position:relative;">
			<button id="sessions-columns-toggle" type="button" style="font-size:12px; padding:2px 8px; background:var(--vscode-dropdown-background, var(--bg-secondary)); color:var(--vscode-dropdown-foreground, var(--text-primary)); border:1px solid var(--border-subtle); border-radius:4px; cursor:pointer;">⚙ Columns</button>
			<div id="sessions-columns-menu" style="display:none; position:absolute; right:0; top:100%; margin-top:4px; z-index:20; background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:6px; box-shadow:0 4px 10px var(--shadow-color); padding:4px 0; min-width:160px;">
				${items}
			</div>
		</div>`;
}

function setupSessionsTableSort(): void {
	// Delegate from the stable panel body so listeners survive lookback re-renders,
	// which replace the inner #sessions-table-container element.
	const body = document.getElementById('sessions-panel-body');
	if (!body) { return; }
	body.addEventListener('click', (e) => {
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
		const container = document.getElementById('sessions-table-container');
		if (container) { setHtml(container, buildSessionsTableHtml(cachedTodaySessions)); }
	});
	renderSessionsLookbackSelector();
	setupSessionColumnsMenu();
}

let _documentClickClosesColumnsMenu = false;

function setupSessionColumnsMenu(): void {
	const toggle = document.getElementById('sessions-columns-toggle');
	const menu = document.getElementById('sessions-columns-menu');
	if (!toggle || !menu) { return; }
	toggle.addEventListener('click', (e) => {
		e.stopPropagation();
		menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
	});
	menu.addEventListener('click', (e) => e.stopPropagation());
	menu.addEventListener('change', (e) => {
		const checkbox = e.target as HTMLInputElement;
		const columnId = checkbox.getAttribute('data-column') as SessionColumnId | null;
		if (!columnId) { return; }
		if (checkbox.checked) { enabledSessionColumns.add(columnId); } else { enabledSessionColumns.delete(columnId); }
		const container = document.getElementById('sessions-table-container');
		if (container) { setHtml(container, buildSessionsTableHtml(cachedTodaySessions)); }
		saveSessionColumnSettings();
	});
	// Attached once ever (not per re-render) and re-queries the live menu element on
	// each click, so it keeps working across full DOM rebuilds without leaking listeners.
	if (!_documentClickClosesColumnsMenu) {
		_documentClickClosesColumnsMenu = true;
		document.addEventListener('click', () => {
			const liveMenu = document.getElementById('sessions-columns-menu');
			if (liveMenu) { liveMenu.style.display = 'none'; }
		});
	}
}

function renderSessionsLookbackSelector(): void {
	const wrapper = document.getElementById('sessions-lookback-wrapper');
	if (!wrapper) { return; }
	wrapper.replaceChildren();
	const { wrapper: selectorWrapper } = createPeriodSelector({
		id: 'sessions-lookback',
		selected: sessionsLookback,
		disabled: ['allTime'],
		disabledTitle: 'All-time sessions are not loaded yet',
		label: '',
		onChange: (value) => {
			sessionsLookback = value as Period;
			refreshSessionsPanelBody();
		},
	});
	wrapper.append(selectorWrapper);
	// A full re-render may have restored a non-today lookback whose data was
	// rendered from cache already; if the cache is empty, request it now.
	if (sessionsLookback !== 'today' && !recentSessionsCache[sessionsLookback]) {
		refreshSessionsPanelBody();
	}
}

/** Renders the sessions table for the current lookback, requesting host data when needed. */
function refreshSessionsPanelBody(): void {
	const body = document.getElementById('sessions-panel-body');
	if (!body) { return; }
	if (sessionsLookback === 'today') {
		setHtml(body, renderTodaySessionsTable(latestTodaySessions));
		return;
	}
	const cached = recentSessionsCache[sessionsLookback];
	if (cached) {
		setHtml(body, renderTodaySessionsTable(cached));
		return;
	}
	setHtml(body, `<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${PERIOD_LABELS[sessionsLookback]}…</div>`);
	vscode.postMessage({ command: 'loadRecentSessions', period: sessionsLookback });
}

function handleRecentSessionsLoaded(message: any): void {
	const period = message.period as Period;
	if (!period) { return; }
	const sessions = Array.isArray(message.sessions)
		? message.sessions.filter((s: any) => s && typeof s === 'object' && typeof s.interactions === 'number') as TodaySessionSummary[]
		: [];
	recentSessionsCache[period] = sessions;
	if (sessionsLookback === period) {
		refreshSessionsPanelBody();
	}
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
		modelSwitching: {
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
			lowCostModels: [],
			mediumCostModels: [],
			highCostModels: [],
			mixedCostSessions: 0,
			standardRequests: 0,
			premiumRequests: 0,
			lowCostRequests: 0,
			mediumCostRequests: 0,
			highCostRequests: 0,
			unknownRequests: 0,
			totalRequests: 0,
			...(p.modelSwitching ?? {}),
		},
		thinkingEffortUsage: p.thinkingEffortUsage,
		modelEfficiency: p.modelEfficiency,
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

function _sanitizeCurationAnalysis(rawCa: unknown): ToolCurationAnalysis | null {
	if (!rawCa || typeof rawCa !== 'object') { return null; }
	const ca = rawCa as Partial<ToolCurationAnalysis>;
	return {
		windowDays: typeof ca.windowDays === 'number' ? ca.windowDays : 30,
		availableTools: Array.isArray(ca.availableTools) ? ca.availableTools : [],
		usedTools: Array.isArray(ca.usedTools) ? ca.usedTools : [],
		unusedTools: Array.isArray(ca.unusedTools) ? ca.unusedTools : [],
		underusedMcpServers: Array.isArray(ca.underusedMcpServers) ? ca.underusedMcpServers : [],
		underusedAgentPlugins: Array.isArray(ca.underusedAgentPlugins) ? ca.underusedAgentPlugins : [],
		estimatedPromptBloat: ca.estimatedPromptBloat && typeof ca.estimatedPromptBloat === 'object'
			? ca.estimatedPromptBloat
			: { totalTokens: 0, byServer: {} },
		recommendations: Array.isArray(ca.recommendations) ? ca.recommendations : [],
	};
}

function sanitizeStats(raw: any): UsageAnalysisStats | null {
	if (!raw || typeof raw !== 'object') {
		traceCurationOnce('sanitize-invalid-root', 'sanitizeStats.invalidRoot');
		return null;
	}

	try {
		const sanitized: UsageAnalysisStats = {
			today: sanitizePeriod(raw.today),
			last30Days: sanitizePeriod(raw.last30Days),
			month: sanitizePeriod(raw.month),
			lastMonth: sanitizePeriod(raw.lastMonth),
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

		// Pass through curationAnalysis (already structured server-side).
		// Normalize required array/object fields so rendering paths don't throw on partial payloads.
		const curationAnalysis = _sanitizeCurationAnalysis(raw.curationAnalysis);
		if (curationAnalysis) {
			sanitized.curationAnalysis = curationAnalysis;
			traceCuration('sanitizeStats.curation.present', {
				availableTools: curationAnalysis.availableTools.length,
				unusedTools: curationAnalysis.unusedTools.length,
				unusedServers: curationAnalysis.underusedMcpServers.filter(s => s && s.usedToolCount === 0).length,
			});
		} else {
			traceCurationOnce('sanitize-no-curation', 'sanitizeStats.curation.missing');
		}

		// Pass through the Copilot API quota balance and current-month billing costs.
		// Without this, periodic updateStats refreshes rebuild the stats object without
		// these fields, so the "Copilot Billing Coverage" section disappears after the
		// first refresh even though the extension still has the data.
		applyBillingFields(sanitized, raw);

		return sanitized;
	} catch (error) {
		traceCurationOnce('sanitize-error', 'sanitizeStats.error', {
			error: error instanceof Error ? error.message : String(error),
		});
		return null;
	}
}

function updateWorktreeControls(): void {
	const controlsEl = document.getElementById("worktree-controls");
	if (controlsEl) { setHtml(controlsEl, renderWorktreeControls()); }
}

function updateWorktreeResults(): void {
	const resultsEl = document.getElementById("worktree-results");
	if (resultsEl) { setHtml(resultsEl, renderWorktreeResults()); }
}

function updateWorktreeProgressArea(): void {
	const el = document.getElementById("worktree-progress-area");
	if (el) { setHtml(el, renderWorktreeProgress()); }
}

function scheduleWorktreeResultsRender(): void {
	if (worktreeRenderPending) { return; }
	worktreeRenderPending = true;
	requestAnimationFrame(() => {
		worktreeRenderPending = false;
		updateWorktreeResults();
	});
}

function addWorktreeRootFromInput(): void {
	const input = document.getElementById("worktree-root-input") as HTMLInputElement | null;
	const value = input?.value.trim();
	if (!value) { return; }
	if (!worktreeRoots.some((r) => r.toLowerCase() === value.toLowerCase())) {
		worktreeRoots.push(value);
	}
	if (input) { input.value = ""; }
	updateWorktreeControls();
}

function startWorktreeScan(): void {
	if (worktreeRoots.length === 0 || worktreeScanInProgress || worktreeCleanupInProgress) { return; }
	worktreeScanInProgress = true;
	worktreeResults = [];
	worktreeScanError = null;
	worktreeScanStatus = { root: "", checked: 0, total: 0, foundCount: 0, elapsedMs: 0 };
	worktreeCleanupLog = [];
	updateWorktreeControls();
	updateWorktreeResults();
	vscode.postMessage({ command: "scanWorktrees", rootPaths: worktreeRoots });
}

/**
 * Kicks off the bulk "clean up pushed worktrees" flow. The actual confirmation is a native
 * VS Code modal shown by the extension (see diagHandleCleanupPushedWorktrees) — this only sends
 * the candidate list and waits for cleanupStarted/cleanupDeclined to know the outcome.
 */
function startWorktreeCleanup(): void {
	if (worktreeCleanupInProgress || worktreeCleanupConfirmPending || worktreeScanInProgress) { return; }
	const targets = getCleanupCandidates();
	if (targets.length === 0) { return; }
	worktreeCleanupConfirmPending = true;
	updateWorktreeResults();
	vscode.postMessage({
		command: "cleanupPushedWorktrees",
		worktrees: targets.map((w) => ({ path: w.path, branch: w.branch, repoLabel: w.repoLabel })),
	});
}

function _handleWorktreeActionButtonClick(target: HTMLElement): boolean {
	if (target.id === "btn-browse-worktree-root") {
		vscode.postMessage({ command: "pickWorktreeRoot" });
		return true;
	}
	if (target.id === "btn-add-worktree-root") {
		addWorktreeRootFromInput();
		return true;
	}
	if (target.id === "btn-scan-worktrees") {
		startWorktreeScan();
		return true;
	}
	if (target.id === "btn-cancel-worktree-scan") {
		vscode.postMessage({ command: "cancelWorktreeScan" });
		return true;
	}
	if (target.id === "btn-cleanup-pushed-worktrees") {
		startWorktreeCleanup();
		return true;
	}
	if (target.id === "btn-cancel-cleanup") {
		vscode.postMessage({ command: "cancelCleanupPushedWorktrees" });
		return true;
	}
	return false;
}

function _handleWorktreeRootsListClick(target: HTMLElement): boolean {
	if (target.closest("#btn-toggle-worktree-roots")) {
		worktreeRootsExpanded = !worktreeRootsExpanded;
		updateWorktreeControls();
		return true;
	}
	if (target.classList.contains("worktree-remove-root")) {
		const idx = Number(target.getAttribute("data-index"));
		if (!isNaN(idx)) {
			worktreeRoots.splice(idx, 1);
			updateWorktreeControls();
		}
		return true;
	}
	return false;
}

function _handleWorktreeRowLinkClick(event: MouseEvent, target: HTMLElement): boolean {
	const revealLink = target.closest(".worktree-reveal-link") as HTMLElement | null;
	if (revealLink) {
		event.preventDefault();
		const p = decodeURIComponent(revealLink.getAttribute("data-path") || "");
		if (p) { vscode.postMessage({ command: "revealPath", path: p }); }
		return true;
	}
	const deleteLink = target.closest(".worktree-delete-link") as HTMLElement | null;
	if (deleteLink) {
		event.preventDefault();
		const p = decodeURIComponent(deleteLink.getAttribute("data-path") || "");
		const branch = decodeURIComponent(deleteLink.getAttribute("data-branch") || "");
		const repoLabel = decodeURIComponent(deleteLink.getAttribute("data-repo") || "");
		const pushed = deleteLink.getAttribute("data-pushed") || "?";
		// The actual confirmation is a native VS Code modal shown by the extension — it owns the
		// "git worktree remove" call and any dirty-tree force-confirmation, not this webview.
		if (p) { vscode.postMessage({ command: "deleteWorktree", path: p, branch, repoLabel, pushed }); }
		return true;
	}
	return false;
}

function _handleWorktreeSortHeaderClick(target: HTMLElement): boolean {
	const sortHeader = target.closest("[data-wt-sort]") as HTMLElement | null;
	if (!sortHeader) { return false; }
	const col = sortHeader.getAttribute("data-wt-sort") as WorktreeSortColumn | null;
	if (!col) { return true; }
	if (worktreeSortColumn === col) {
		worktreeSortDir = worktreeSortDir === "desc" ? "asc" : "desc";
	} else {
		worktreeSortColumn = col;
		worktreeSortDir = col === "repo" ? "asc" : "desc";
	}
	updateWorktreeResults();
	return true;
}

function _handleWorktreeRepoRowClick(target: HTMLElement): boolean {
	const repoRow = target.closest(".worktree-repo-row") as HTMLElement | null;
	if (!repoRow) { return false; }
	const repo = repoRow.getAttribute("data-repo") ?? "";
	if (worktreeExpandedRepos.has(repo)) { worktreeExpandedRepos.delete(repo); }
	else { worktreeExpandedRepos.add(repo); }
	updateWorktreeResults();
	return true;
}

function _handleWorktreeTableInteractionClick(target: HTMLElement): boolean {
	if (_handleWorktreeSortHeaderClick(target)) { return true; }
	return _handleWorktreeRepoRowClick(target);
}

function handleWorktreeTabClick(event: MouseEvent): void {
	const target = event.target as HTMLElement | null;
	if (!target) { return; }
	if (_handleWorktreeActionButtonClick(target)) { return; }
	if (_handleWorktreeRootsListClick(target)) { return; }
	if (_handleWorktreeRowLinkClick(event, target)) { return; }
	_handleWorktreeTableInteractionClick(target);
}

function setupWorktreesHandlers(): void {
	const tabEl = document.getElementById("tab-panel-worktrees");
	if (!tabEl) { return; }
	tabEl.addEventListener("click", handleWorktreeTabClick);
	tabEl.addEventListener("keydown", (event) => {
		const target = event.target as HTMLElement | null;
		if (target?.id === "worktree-root-input" && (event as KeyboardEvent).key === "Enter") {
			event.preventDefault();
			addWorktreeRootFromInput();
		}
	});
}

function sanitizeWorktreeResult(item: unknown): WorktreeResult {
	const w = (item ?? {}) as Record<string, unknown>;
	const pushedRaw = String(w.pushed ?? "?");
	const pushed: WorktreeResult["pushed"] = pushedRaw === "yes" || pushedRaw === "no" ? pushedRaw : "?";
	return {
		path: String(w.path ?? ""),
		repoLabel: String(w.repoLabel ?? "Unknown"),
		branch: String(w.branch ?? "?"),
		lastCommit: String(w.lastCommit ?? "?"),
		lastCommitDate: w.lastCommitDate ? String(w.lastCommitDate) : null,
		pushed,
		files: numField(w.files),
		folders: numField(w.folders),
		bytes: numField(w.bytes),
	};
}

function handleWorktreeRootPicked(message: any): void {
	if (!message.folderPath) { return; }
	const folderPath = String(message.folderPath);
	if (!worktreeRoots.some((r) => r.toLowerCase() === folderPath.toLowerCase())) {
		worktreeRoots.push(folderPath);
	}
	updateWorktreeControls();
}

/**
 * Merge auto-discovered scan roots (from known session folders + session workspace paths,
 * computed by the extension after the background session load) into the editable roots list.
 * Case-insensitive dedup, existing order preserved. Skipped while a scan is running so the
 * list is not mutated mid-scan.
 */
function handleWorktreeRootsDiscovered(message: any): void {
	if (worktreeScanInProgress || !Array.isArray(message.roots)) { return; }
	let added = false;
	for (const raw of message.roots) {
		if (typeof raw !== "string") { continue; }
		const root = raw.trim();
		if (!root) { continue; }
		if (!worktreeRoots.some((r) => r.toLowerCase() === root.toLowerCase())) {
			worktreeRoots.push(root);
			added = true;
		}
	}
	if (added) { updateWorktreeControls(); }
}

function handleWorktreeScanStarted(): void {
	worktreeScanInProgress = true;
	worktreeResults = [];
	worktreeScanError = null;
	worktreeScanStatus = { root: "", checked: 0, total: 0, foundCount: 0, elapsedMs: 0 };
	updateWorktreeControls();
	updateWorktreeResults();
}

function handleWorktreeScanRootStarted(message: any): void {
	worktreeScanStatus = { ...worktreeScanStatus, root: String(message.root || ""), checked: 0, total: 0, phase: "walking", dirsScanned: 0 };
	updateWorktreeProgressArea();
}

function handleWorktreeScanWalkProgress(message: any): void {
	worktreeScanStatus = {
		...worktreeScanStatus,
		root: String(message.root ?? worktreeScanStatus.root),
		phase: "walking",
		dirsScanned: numField(message.dirsScanned),
		elapsedMs: numField(message.elapsedMs),
	};
	updateWorktreeProgressArea();
}

function handleWorktreeScanRootMarkersFound(message: any): void {
	worktreeScanStatus = { ...worktreeScanStatus, total: numField(message.count), phase: "checking" };
	updateWorktreeProgressArea();
}

function handleWorktreeScanRootSkipped(message: any): void {
	worktreeScanError = `Skipped "${message.root}": ${message.reason || "not accessible"}`;
	updateWorktreeControls();
}

function handleWorktreeScanProgress(message: any): void {
	worktreeScanStatus = {
		root: String(message.root ?? worktreeScanStatus.root),
		checked: numField(message.checked),
		total: message.total !== undefined ? numField(message.total) : worktreeScanStatus.total,
		foundCount: numField(message.foundCount),
		elapsedMs: numField(message.elapsedMs),
	};
	updateWorktreeProgressArea();
}

function handleWorktreeFound(message: any): void {
	if (!message.worktree) { return; }
	worktreeResults.push(sanitizeWorktreeResult(message.worktree));
	scheduleWorktreeResultsRender();
}

/** Remove a worktree row after the extension has confirmed and run "git worktree remove". */
function handleWorktreeDeleted(message: any): void {
	const targetPath = String(message.path ?? "");
	if (!targetPath) { return; }
	const idx = worktreeResults.findIndex((w) => w.path === targetPath);
	if (idx === -1) { return; }
	worktreeResults.splice(idx, 1);
	updateWorktreeResults();
}

/** The extension's confirm modal was dismissed/declined — re-enable the cleanup button. */
function handleCleanupDeclined(): void {
	worktreeCleanupConfirmPending = false;
	updateWorktreeResults();
}

function handleCleanupStarted(message: any): void {
	worktreeCleanupConfirmPending = false;
	worktreeCleanupInProgress = true;
	worktreeCleanupStatus = { processed: 0, total: numField(message.total) };
	worktreeCleanupLog = [];
	updateWorktreeResults();
}

function handleCleanupWorktreeResult(message: any): void {
	worktreeCleanupStatus = { processed: numField(message.processed), total: numField(message.total) };
	const rawStatus = message.status;
	const status: WorktreeCleanupOutcome = rawStatus === "deleted" || rawStatus === "skipped" ? rawStatus : "error";
	worktreeCleanupLog.push({
		path: String(message.path ?? ""),
		branch: String(message.branch ?? "?"),
		repoLabel: String(message.repoLabel ?? ""),
		status,
		reason: typeof message.reason === "string" ? message.reason : undefined,
	});
	updateWorktreeResults();
}

function handleCleanupComplete(): void {
	worktreeCleanupInProgress = false;
	updateWorktreeResults();
}

function handleCleanupCancelled(): void {
	worktreeCleanupInProgress = false;
	worktreeCleanupConfirmPending = false;
	updateWorktreeResults();
}

function handleWorktreeEnrichStarted(message: any): void {
	worktreeScanStatus = { ...worktreeScanStatus, phase: "enriching", enriched: 0, enrichTotal: numField(message.total), elapsedMs: numField(message.elapsedMs) };
	updateWorktreeProgressArea();
}

function handleWorktreeEnrichProgress(message: any): void {
	worktreeScanStatus = { ...worktreeScanStatus, phase: "enriching", enriched: numField(message.enriched), enrichTotal: numField(message.total), elapsedMs: numField(message.elapsedMs) };
	updateWorktreeProgressArea();
}

/** Patch a discovered worktree's size + push status once the background enrichment computes them. */
function handleWorktreeEnriched(message: any): void {
	const targetPath = String(message.path ?? "");
	if (!targetPath) { return; }
	const wt = worktreeResults.find((w) => w.path === targetPath);
	if (!wt) { return; }
	wt.files = numField(message.files);
	wt.folders = numField(message.folders);
	wt.bytes = numField(message.bytes);
	const pushedRaw = String(message.pushed ?? "?");
	wt.pushed = pushedRaw === "yes" || pushedRaw === "no" ? pushedRaw : "?";
	scheduleWorktreeResultsRender();
}

function handleWorktreeScanComplete(): void {
	worktreeScanInProgress = false;
	updateWorktreeControls();
	updateWorktreeResults();
}

function handleWorktreeScanCancelled(): void {
	worktreeScanInProgress = false;
	updateWorktreeControls();
}

/** Dispatches worktree-tab messages via static, literal command comparisons (no dynamic method lookup). */
const _worktreeMessageHandlers: Record<string, (message: any) => void> = {
	worktreeRootPicked: handleWorktreeRootPicked,
	worktreeRootsDiscovered: handleWorktreeRootsDiscovered,
	worktreeScanStarted: () => handleWorktreeScanStarted(),
	worktreeScanRootStarted: handleWorktreeScanRootStarted,
	worktreeScanWalkProgress: handleWorktreeScanWalkProgress,
	worktreeScanRootMarkersFound: handleWorktreeScanRootMarkersFound,
	worktreeScanRootSkipped: handleWorktreeScanRootSkipped,
	worktreeScanProgress: handleWorktreeScanProgress,
	worktreeFound: handleWorktreeFound,
	worktreeEnrichStarted: handleWorktreeEnrichStarted,
	worktreeEnrichProgress: handleWorktreeEnrichProgress,
	worktreeEnriched: handleWorktreeEnriched,
	worktreeDeleted: handleWorktreeDeleted,
	worktreeScanComplete: () => handleWorktreeScanComplete(),
	worktreeScanCancelled: () => handleWorktreeScanCancelled(),
	cleanupDeclined: () => handleCleanupDeclined(),
	cleanupStarted: handleCleanupStarted,
	cleanupWorktreeResult: handleCleanupWorktreeResult,
	cleanupComplete: () => handleCleanupComplete(),
	cleanupCancelled: () => handleCleanupCancelled(),
};

function handleWorktreeMessage(message: any): void {
	const handler = _worktreeMessageHandlers[message.command];
	if (handler) { handler(message); }
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
				userAuthoredPrs: toSafeNumber(r.userAuthoredPrs),
				userMergedPrs: toSafeNumber(r.userMergedPrs),
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

/** Display label per detected AI agent type, used in the PR detail list. */
const AI_PR_LABEL: Record<string, string> = {
	copilot: '🤖 Copilot',
	claude: '🧠 Claude',
	openai: '✨ Codex',
	'other-ai': '🤖 AI',
};

/** Renders one repository row of the Repository PRs table. */
function renderRepoPrRow(r: RepoPrInfo, cell: string, cellCenter: string): string {
	const repoLink = `<a href="${escapeHtml(r.repoUrl)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color); font-family:'Courier New',monospace; font-size:12px;">${escapeHtml(r.owner)}/${escapeHtml(r.repo)}</a>`;
	if (r.error) {
		return `<tr>
			<td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}</td>
			<td colspan="4" style="${cell} color:var(--text-secondary); font-style:italic; font-size:12px;">${escapeHtml(r.error)}</td>
		</tr>`;
	}
	// Collapsible detail list
	let detailsHtml = '';
	if (r.aiDetails.length > 0) {
		const items = r.aiDetails.map(d =>
			`<li><a href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer" style="color:var(--link-color);">#${d.number} ${escapeHtml(d.title)}</a> — ${AI_PR_LABEL[d.aiType] ?? escapeHtml(String(d.aiType))} (${d.role === 'author' ? 'authored' : 'review requested'})</li>`
		).join('');
		detailsHtml = `
			<details style="margin-top:4px; font-size:11px;">
				<summary style="cursor:pointer; color:var(--text-secondary);">Show ${r.aiDetails.length} detail(s)</summary>
				<ul style="margin:4px 0 0 16px; padding:0; list-style:disc;">${items}</ul>
			</details>`;
	}
	const yours = (r.userAuthoredPrs ?? 0) > 0
		? `<span style="font-weight:600;">${r.userMergedPrs ?? 0} / ${r.userAuthoredPrs}</span>`
		: '0';
	return `<tr>
		<td style="${cell} font-family:'Courier New',monospace; font-size:12px;">${repoLink}${detailsHtml}</td>
		<td style="${cellCenter} font-weight:600;">${r.totalPrs}</td>
		<td style="${cellCenter}">${yours}</td>
		<td style="${cellCenter}">${r.aiAuthoredPrs > 0 ? `<span style="font-weight:600;">${r.aiAuthoredPrs}</span>` : '0'}</td>
		<td style="${cellCenter}">${r.aiReviewRequestedPrs > 0 ? `<span style="font-weight:600;">${r.aiReviewRequestedPrs}</span>` : '0'}</td>
	</tr>`;
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

	// Cell style shared across data rows — matches the customization matrix look
	const cell = 'padding: 6px 8px; border-bottom: 1px solid var(--border-subtle);';
	const cellCenter = `${cell} text-align: center;`;

	const rows = data.repos.map((r) => renderRepoPrRow(r, cell, cellCenter)).join('');

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
						<th style="text-align:center; padding:8px; border-bottom:2px solid var(--border-color); font-size:12px; color:var(--text-secondary); opacity:0.9;" title="PRs you opened yourself, shown as merged / opened. Work driven by a local AI assistant lands here, not under Cloud Agent Authored.">🚢 Yours (merged / opened)</th>
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

function updateReposPrPanel(data: RepoPrStatsResult): void {
	const container = document.querySelector('#repos-pr-content');
	if (!container) { return; }
	setHtml(container, `
		<div class="section-title"><span>🤖</span><span>AI Activity in Repository PRs</span></div>
		<div class="section-subtitle">
			PRs from the last 30 days across your known repositories, showing how many were <strong>authored by cloud agents</strong>
			(i.e. opened by a bot account like <code>copilot-swe-agent</code>, <code>claude-code-action</code>, or <code>openai-code-agent</code>)
			or had an AI agent requested as a reviewer.
		</div>
		${renderReposPrContent(data)}
	`);
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
	setHtml(container, `
		<div class="section-title"><span>🤖</span><span>Copilot Cloud Agent Sessions</span></div>
		<div class="section-subtitle">
			Cloud agent tasks and sessions from the last 30 days. Each <strong>task</strong> is a user request to the agent;
			each <strong>session</strong> is an autonomous coding run within that task.
			<strong>CLI/remote sessions are excluded</strong> — they are separate from these cloud agent sessions.
		</div>
		${renderAgentSessionsContent(data)}
	`);
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

/** Renders a compact three-period model cost breakdown for the Activity tab. */
function buildModelCostSectionHtml(stats: UsageAnalysisStats): string {
	const p30 = stats.last30Days.modelSwitching;
	const today = stats.today.modelSwitching;
	// Only show if we have any request data
	if ((p30.totalRequests ?? 0) === 0 && (today.totalRequests ?? 0) === 0) { return ''; }

	function renderCostPeriod(ms: ModelSwitchingAnalysis): string {
		const total = ms.totalRequests ?? 0;
		if (total === 0) { return '<div style="color: var(--text-muted); font-size: 11px;">No data</div>'; }
		const buckets: { label: string; count: number; color: string }[] = [
			{ label: '💚 Low cost', count: ms.lowCostRequests ?? 0, color: '#4ade80' },
			{ label: '🔵 Medium cost', count: ms.mediumCostRequests ?? 0, color: 'var(--link-color)' },
			{ label: '💸 High cost', count: ms.highCostRequests ?? 0, color: 'var(--warning-fg)' },
			{ label: '❓ Unknown', count: ms.unknownRequests ?? 0, color: 'var(--text-muted)' },
		].filter(b => b.count > 0);
		const rows = buckets.map(b => {
			const pct = total > 0 ? Math.round((b.count / total) * 100) : 0;
			return `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
				<span style="width: 90px; font-size: 12px; font-weight: 600; color: ${b.color};">${b.label}</span>
				<div style="flex: 1; background: var(--bg-secondary); border-radius: 4px; height: 12px; overflow: hidden;">
					<div style="width: ${pct}%; background: ${b.color}; height: 100%; border-radius: 4px;"></div>
				</div>
				<span style="font-size: 12px; font-weight: 600; color: var(--text-primary); min-width: 70px; text-align: right;">${formatNumber(b.count)} <span style="color: var(--text-secondary); font-weight: 400;">(${pct}%)</span></span>
			</div>`;
		}).join('');
		const mixedNote = (ms.mixedCostSessions ?? 0) > 0
			? `<div style="font-size: 11px; color: var(--link-color); margin-top: 6px;">🔀 ${formatNumber(ms.mixedCostSessions)} mixed-cost session${ms.mixedCostSessions !== 1 ? 's' : ''}</div>`
			: '';
		return `${rows}<div style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">${formatNumber(total)} total requests</div>${mixedNote}`;
	}

	return `
		<!-- Model Cost Section -->
		<div class="section">
			<div class="section-title"><span>💰</span><span>Model Cost Usage</span></div>
			<div class="section-subtitle">Request distribution across cost levels — low (&lt;$2/M tokens), medium ($2–5/M), high (≥$5/M)</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Today</h4>
					${renderCostPeriod(today)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📆 Last 30 Days</h4>
					${renderCostPeriod(p30)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Previous Month</h4>
					${renderCostPeriod(stats.month.modelSwitching)}
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
	allHighCostModels: string[];
	allLowCostModels: string[];
	allMediumCostModels: string[];
	allUnknownModels: string[];
} {
	return {
		allToolKeys: [...new Set([...Object.keys(stats.today.toolCalls.byTool), ...Object.keys(stats.last30Days.toolCalls.byTool), ...Object.keys(stats.month.toolCalls.byTool)])].sort(),
		allMcpToolKeys: [...new Set([...Object.keys(stats.today.mcpTools.byTool), ...Object.keys(stats.last30Days.mcpTools.byTool), ...Object.keys(stats.month.mcpTools.byTool)])].sort(),
		allMcpServerKeys: [...new Set([...Object.keys(stats.today.mcpTools.byServer), ...Object.keys(stats.last30Days.mcpTools.byServer), ...Object.keys(stats.month.mcpTools.byServer)])].sort(),
		allStandardModels: [...new Set([...stats.today.modelSwitching.standardModels, ...stats.last30Days.modelSwitching.standardModels, ...stats.month.modelSwitching.standardModels])].sort(),
		allHighCostModels: [...new Set([...stats.today.modelSwitching.highCostModels, ...stats.last30Days.modelSwitching.highCostModels, ...stats.month.modelSwitching.highCostModels])].sort(),
		allLowCostModels: [...new Set([...stats.today.modelSwitching.lowCostModels, ...stats.last30Days.modelSwitching.lowCostModels, ...stats.month.modelSwitching.lowCostModels])].sort(),
		allMediumCostModels: [...new Set([...stats.today.modelSwitching.mediumCostModels, ...stats.last30Days.modelSwitching.mediumCostModels, ...stats.month.modelSwitching.mediumCostModels])].sort(),
		allUnknownModels: [...new Set([...stats.today.modelSwitching.unknownModels, ...stats.last30Days.modelSwitching.unknownModels, ...stats.month.modelSwitching.unknownModels])].sort(),
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

function buildCurationSummaryHtml(availableTools: AvailableToolEntry[], unusedTools: AvailableToolEntry[], bloat: ToolCurationAnalysis['estimatedPromptBloat']): string {
	const usedCount = availableTools.length - unusedTools.length;
	const severityColor = unusedTools.length > 0 ? 'rgba(251,191,36,0.12)' : 'rgba(74,222,128,0.12)';
	const severityBorder = unusedTools.length > 0 ? 'rgba(251,191,36,0.4)' : 'rgba(74,222,128,0.4)';
	const unusedColor = unusedTools.length > 0 ? '#fbbf24' : '#4ade80';
	const totalBloat = bloat.totalTokens;
	const skillBloat = bloat.byServer['skill'] ?? 0;
	const builtinBloat = bloat.byServer['builtin'] ?? 0;
	const mcpBloat = totalBloat - skillBloat - builtinBloat;
	const fmt = (n: number) => n >= 1000 ? `~${Math.round(n / 1000)}K` : `~${n}`;
	const actionableBloat = mcpBloat + skillBloat;
	const actionableParts: string[] = [];
	if (mcpBloat > 0) { actionableParts.push(`${fmt(mcpBloat)} MCP`); }
	if (skillBloat > 0) { actionableParts.push(`${fmt(skillBloat)} skills`); }
	return `<div style="display:flex; gap:16px; flex-wrap:wrap; margin:12px 0;">
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:var(--text-primary);">${formatNumber(availableTools.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Available</div>
		</div>
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:#4ade80;">${formatNumber(usedCount)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Used</div>
		</div>
		<div style="background:${severityColor}; border:1px solid ${severityBorder}; border-radius:6px; padding:10px 16px; min-width:120px; text-align:center;">
			<div style="font-size:20px; font-weight:700; color:${unusedColor};">${formatNumber(unusedTools.length)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Unused</div>
		</div>
		${actionableBloat > 0 ? `<div style="background:rgba(239,68,68,0.1); border:1px solid rgba(239,68,68,0.3); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center;" title="Overhead you can reduce by disabling unused MCP servers or removing unused skills">
			<div style="font-size:20px; font-weight:700; color:#f87171;">${fmt(actionableBloat)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Actionable overhead</div>
			${actionableParts.length > 0 ? `<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">${escapeHtml(actionableParts.join(' + '))}</div>` : ''}
		</div>` : ''}
		${builtinBloat > 0 ? `<div style="background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; padding:10px 16px; min-width:140px; text-align:center; opacity:0.7;" title="Overhead from VS Code built-in tools — cannot be disabled">
			<div style="font-size:20px; font-weight:700; color:var(--text-secondary);">${fmt(builtinBloat)}</div>
			<div style="font-size:11px; color:var(--text-primary); opacity:0.75;">Built-in overhead</div>
			<div style="font-size:10px; color:var(--text-secondary); margin-top:2px;">not actionable</div>
		</div>` : ''}
	</div>`;
}

type McpServerEntry = ToolCurationAnalysis['underusedMcpServers'][number];

function _mcpSourceLabel(s: McpServerEntry): string {
	if (s.extensionId) { return 'Extension'; }
	if (!s.configFiles || s.configFiles.length === 0) { return 'Settings'; }
	const labels = new Set<string>();
	for (const f of s.configFiles) {
		const p = f.replace(/\\/g, '/');
		if (p.includes('/.vscode/')) { labels.add('Workspace'); }
		else if (p.includes('/.vs/')) { labels.add('Workspace (VS)'); }
		else if (p.includes('/.cursor/')) { labels.add('Workspace (Cursor)'); }
		else if (p.endsWith('/.mcp.json')) { labels.add(p.split('/').slice(-2).join('/')); }
		else { labels.add('Config file'); }
	}
	return [...labels].join(', ');
}

function _buildMcpSourceOpenBtn(s: McpServerEntry, sourceTip: string): string {
	if (s.configFiles && s.configFiles.length === 1) {
		return ` <button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(s.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${escapeHtml(s.configFiles[0])}">open</button>`;
	}
	if (s.configFiles && s.configFiles.length > 1) {
		return ` <button class="curation-file-btn" data-command="openFileFromList" data-paths="${escapeHtml(JSON.stringify(s.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${escapeHtml(sourceTip)}">open</button>`;
	}
	if (s.extensionId) {
		return ` <button class="curation-file-btn" data-command="manageExtension" data-extension-id="${escapeHtml(s.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view for ${escapeHtml(s.extensionId)}">open</button>`;
	}
	return ` <button class="curation-file-btn" data-command="searchMcpExtensions" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Browse MCP extensions in the marketplace">open</button>`;
}

function _buildMcpActionCell(s: McpServerEntry): string {
	if (s.extensionId) {
		return `<button class="curation-file-btn" data-command="manageExtension" data-extension-id="${escapeHtml(s.extensionId)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open the Extensions view for ${escapeHtml(s.extensionId)} (disable or uninstall to reclaim prompt budget)">Manage Extension</button>`;
	}
	if (!s.configFiles || s.configFiles.length === 0) {
		return `<button class="curation-file-btn" data-command="openToolPicker" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open VS Code tool selection menu">Change Tools</button>`;
	}
	if (s.configFiles.length === 1) {
		return `<button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(s.configFiles[0])}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open ${escapeHtml(s.configFiles[0])}">Change Tools</button>`;
	}
	return `<button class="curation-file-btn" data-command="openFileFromList" data-paths="${escapeHtml(JSON.stringify(s.configFiles))}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Defined in ${s.configFiles.length} config files">Change Tools</button>`;
}

function _buildMcpServerRowHtml(s: McpServerEntry, bloat: ToolCurationAnalysis['estimatedPromptBloat']): string {
	const b = bloat.byServer[s.server] ?? 0;
	const sourceLabel = _mcpSourceLabel(s);
	const sourceTip = s.configFiles?.join('\n') ?? s.extensionId ?? '';
	const sourceOpenBtn = _buildMcpSourceOpenBtn(s, sourceTip);
	const actionCell = _buildMcpActionCell(s);
	const notConnected = s.availableToolCount === 0;
	return `<tr class="${s.usedToolCount > 0 ? 'mcp-has-usage' : ''}">
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(s.server)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;" title="${escapeHtml(sourceTip)}">${escapeHtml(sourceLabel)}${sourceOpenBtn}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${notConnected ? '<em style="color:var(--text-secondary)">not connected</em>' : s.availableToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${notConnected ? '—' : s.usedToolCount}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${b > 0 ? `~${b.toLocaleString()} tokens` : '—'}</td>
		<td style="padding:5px 8px; font-size:12px;">${actionCell}</td>
	</tr>`;
}

function _buildMcpJsonLink(allServers: McpServerEntry[]): string {
	const allConfigFiles = [...new Set(
		allServers.filter(s => !s.extensionId).flatMap(s => s.configFiles ?? [])
	)];
	const preferredFile = allConfigFiles.find(f => f.replace(/\\/g, '/').endsWith('.vscode/mcp.json')) ?? allConfigFiles[0];
	if (!preferredFile) { return `<code>.vscode/mcp.json</code>`; }
	const displayName = preferredFile.replace(/\\/g, '/').split('/').slice(-3).join('/');
	return `<button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(preferredFile)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="${escapeHtml(preferredFile)}">${escapeHtml(displayName)}</button>`;
}

function buildUnusedMcpHtml(underusedMcpServers: ToolCurationAnalysis['underusedMcpServers'], bloat: ToolCurationAnalysis['estimatedPromptBloat'], windowDays: number): string {
	// Show all servers, zero-usage first, then partially used, then fully used.
	const allServers = [...underusedMcpServers].sort((a, b) => {
		const aKey = a.usedToolCount === 0 ? 0 : a.usedToolCount < a.availableToolCount ? 1 : 2;
		const bKey = b.usedToolCount === 0 ? 0 : b.usedToolCount < b.availableToolCount ? 1 : 2;
		return aKey !== bKey ? aKey - bKey : a.usedToolCount - b.usedToolCount;
	});
	if (allServers.length === 0) { return ''; }
	const rows = allServers.map(s => _buildMcpServerRowHtml(s, bloat)).join('');
	const mcpJsonLink = _buildMcpJsonLink(allServers);
	const usedCount = allServers.filter(s => s.usedToolCount > 0).length;
	const unusedCount = allServers.length - usedCount;
	// Pure CSS checkbox trick: input and .mcp-table-wrap are siblings inside <details>;
	// the :checked ~ sibling combinator works without any JS (inline handlers are CSP-blocked).
	return `<details style="margin-top:12px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			🔌 MCP Servers in Last ${windowDays} Days (${allServers.length})
		</summary>
		<style>#mcp-hide-toggle:checked ~ .mcp-table-wrap .mcp-has-usage { display: none; }</style>
		<div style="display:flex; align-items:center; gap:6px; margin:6px 0;">
			<input type="checkbox" id="mcp-hide-toggle" checked style="margin:0; cursor:pointer; flex-shrink:0;">
			<label for="mcp-hide-toggle" style="font-size:12px; color:var(--text-primary); cursor:pointer; user-select:none;">Hide servers with usage</label>
			<span style="font-size:11px; color:var(--text-secondary);">${unusedCount} with no usage · ${usedCount} with usage</span>
		</div>
		<div class="mcp-table-wrap" style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Server</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Source</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Tools Available</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Tools Used</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Est. Overhead</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Action</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">💡 Open ${mcpJsonLink} to disable file-configured servers, or use <em>Manage Extension</em> to disable or uninstall an MCP-providing extension. (VS Code does not expose per-server picker state to extensions, so servers you disabled in the chat tool picker may still appear here.)</div>
		</div>
	</details>`;
}

function buildUnusedSkillsHtml(unusedSkills: AvailableToolEntry[]): string {
	if (unusedSkills.length === 0) { return ''; }
	const rows = unusedSkills.map(s => {
		const skillFile = s.configFiles?.[0];
		const viewLink = skillFile
			? `<button class="curation-file-btn" data-command="openFile" data-path="${escapeHtml(skillFile)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:12px;text-decoration:underline;" title="Open ${escapeHtml(skillFile)}">View skill</button>`
			: '—';
		// Derive a human-readable source label. Plugin skills show the plugin name.
		let sourceLabel = '—';
		let manageBtn = '';
		if (s.pluginName) {
			sourceLabel = `Plugin: ${s.pluginName}`;
			manageBtn = ` <button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${escapeHtml(s.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to agent plugins">manage</button>`;
		} else if (s.skillPath) {
			if (s.skillPath.startsWith('.github/skills')) { sourceLabel = 'Workspace (.github)'; }
			else if (s.skillPath.startsWith('.claude/skills')) { sourceLabel = 'Workspace (.claude)'; }
			else if (s.skillPath.startsWith('.agents/skills')) { sourceLabel = 'Workspace (.agents)'; }
			else { sourceLabel = 'User (~)'; }
		}
		const estTokens = Math.round((s.name.length + s.description.length + 10) / 4);
		return `<tr>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(s.name)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(sourceLabel)}${manageBtn}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:320px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(s.description)}">${escapeHtml(s.description)}</td>
		<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${estTokens.toLocaleString()} tokens</td>
		<td style="padding:5px 8px; font-size:12px; white-space:nowrap;">${viewLink}</td>
	</tr>`;
	}).join('');
	return `<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			📚 Unused Skills (${unusedSkills.length})
		</summary>
		<div style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skill</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Source</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Description</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Est. Overhead</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">View</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">💡 Est. overhead is per agent interaction. For plugin skills, click <em>manage</em> to open the agent plugins view where you can uninstall the plugin. For workspace skills, update the description or remove the SKILL.md.</div>
		</div>
	</details>`;
}

function buildUnderusedAgentPluginsHtml(underusedAgentPlugins: ToolCurationAnalysis['underusedAgentPlugins'], windowDays: number): string {
	if (underusedAgentPlugins.length === 0) { return ''; }
	const rows = underusedAgentPlugins.map(p => {
		const manageBtn = `<button class="curation-file-btn" data-command="openAgentPlugins" data-plugin-name="${escapeHtml(p.pluginName)}" style="background:none;border:none;padding:0;cursor:pointer;color:var(--link-color);font-size:11px;text-decoration:underline;" title="Open Extensions view filtered to @agentPlugins ${escapeHtml(p.pluginName)}">Manage Plugin</button>`;
		const usageClass = p.usedSkillCount === 0 ? '' : 'plugin-has-usage';
		return `<tr class="${usageClass}">
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(p.pluginName)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${p.availableSkillCount}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px;">${p.usedSkillCount}</td>
			<td style="padding:5px 8px; font-size:12px;">${manageBtn}</td>
		</tr>`;
	}).join('');
	const unusedCount = underusedAgentPlugins.filter(p => p.usedSkillCount === 0).length;
	const usedCount = underusedAgentPlugins.length - unusedCount;
	return `<details style="margin-top:8px;" open>
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			🧩 Agent Plugins in Last ${windowDays} Days (${underusedAgentPlugins.length})
		</summary>
		<style>#plugin-hide-toggle:checked ~ .plugin-table-wrap .plugin-has-usage { display: none; }</style>
		<div style="display:flex; align-items:center; gap:6px; margin:6px 0;">
			<input type="checkbox" id="plugin-hide-toggle" checked style="margin:0; cursor:pointer; flex-shrink:0;">
			<label for="plugin-hide-toggle" style="font-size:12px; color:var(--text-primary); cursor:pointer; user-select:none;">Hide plugins with usage</label>
			<span style="font-size:11px; color:var(--text-secondary);">${unusedCount} with no usage · ${usedCount} with usage</span>
		</div>
		<div class="plugin-table-wrap" style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Plugin</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skills Available</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Skills Used</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Action</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">💡 Click <em>Manage Plugin</em> to open the Extensions view filtered to <code>@agentPlugins</code> where you can uninstall unused plugins to reclaim prompt budget.</div>
		</div>
	</details>`;
}

function buildBuiltinToolsHtml(builtinTools: AvailableToolEntry[], bloat: ToolCurationAnalysis['estimatedPromptBloat']): string {
	if (builtinTools.length === 0) { return ''; }
	const builtinBloat = bloat.byServer['builtin'] ?? 0;
	const rows = builtinTools.map(t => {
		const overhead = Math.round((t.name.length + (t.description?.length ?? 0) + 10) / 4);
		return `<tr>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">${escapeHtml(t.name)}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; max-width:400px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${escapeHtml(t.description ?? '')}">${escapeHtml(t.description ?? '—')}</td>
			<td style="padding:5px 8px; color:var(--text-primary); font-size:12px; white-space:nowrap;">~${overhead} tokens</td>
		</tr>`;
	}).join('');
	const fmt = (n: number) => n >= 1000 ? `~${Math.round(n / 1000)}K` : `~${n}`;
	return `<details style="margin-top:12px;">
		<summary style="cursor:pointer; font-size:13px; font-weight:600; color:var(--text-primary); padding:6px 0;">
			🔧 Built-in VS Code Tools (${builtinTools.length}) — ${fmt(builtinBloat)} tokens overhead, not actionable
		</summary>
		<div style="margin-top:8px; overflow-x:auto;">
			<table style="width:100%; border-collapse:collapse; font-size:12px;">
				<thead><tr style="border-bottom:1px solid var(--border-color);">
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Tool</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Description</th>
					<th style="padding:5px 8px; text-align:left; color:var(--text-primary); font-weight:600; font-size:12px;">Est. Overhead</th>
				</tr></thead>
				<tbody>${rows}</tbody>
			</table>
			<div style="margin-top:8px; font-size:11px; color:var(--text-secondary);">💡 These tools are provided by VS Code itself and cannot be disabled. They are excluded from the actionable overhead total above.</div>
		</div>
	</details>`;
}

function buildCurationSectionHtml(curation: ToolCurationAnalysis | null | undefined): string {
	try {
		if (!curation || curation.availableTools.length === 0) {
			traceCurationOnce('render-hidden-empty', 'buildCurationSectionHtml.hidden', {
				hasCurationObject: !!curation,
				availableTools: curation?.availableTools?.length ?? 0,
			});
			return '';
		}

		const { availableTools, unusedTools, underusedMcpServers, underusedAgentPlugins, estimatedPromptBloat, windowDays } = curation;
		const unusedSkills = unusedTools.filter(t => t.source === 'skill');
		const builtinTools = availableTools.filter(t => t.source === 'builtin');

		traceCuration('buildCurationSectionHtml.render', {
			availableTools: availableTools.length,
			unusedTools: unusedTools.length,
			unusedSkills: unusedSkills.length,
			mcpServers: underusedMcpServers.length,
		});

		return `
			<!-- Tool Curation Section -->
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>✂️</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Compare available tools against actual usage to reduce prompt overhead (last ${windowDays} days)</div>
				${buildCurationSummaryHtml(availableTools, unusedTools, estimatedPromptBloat)}
				${buildUnusedMcpHtml(underusedMcpServers, estimatedPromptBloat, windowDays)}
				${buildUnderusedAgentPluginsHtml(underusedAgentPlugins, windowDays)}
				${buildBuiltinToolsHtml(builtinTools, estimatedPromptBloat)}
				${buildUnusedSkillsHtml(unusedSkills)}
			</div>`;
	} catch (error) {
		traceCuration('buildCurationSectionHtml.error', {
			error: error instanceof Error ? error.message : String(error),
		});
		return `
			<div id="section-tool-curation" class="section">
				<div class="section-title"><span>✂️</span><span>Tool Curation</span></div>
				<div class="section-subtitle" style="color:var(--text-primary); opacity:0.75;">Tool curation is temporarily unavailable due to a rendering error. Try Refresh.</div>
			</div>`;
	}
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

function updateTabButtonCount(insights: EvaluatedInsight[]): void {
	const tabButton = document.querySelector<HTMLButtonElement>('.tab-button[data-tab="insights"]');
	if (!tabButton) { return; }
	const newCount = insights.filter(i => i.status === 'new').length;
	const badgeHtml = newCount > 0
		? ` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${newCount}</span>`
		: '';
	const titleOnly = '<span class="codicon codicon-lightbulb"></span> Insights';
	setHtml(tabButton, titleOnly + badgeHtml);
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

	setHtml(container, forYouSection + allSection);
	wireInsightCardButtons();
	updateTabButtonCount(insights);
}

function _postOpenFileFromList(pathsJson: string | null): void {
	if (!pathsJson) { return; }
	try {
		const paths = JSON.parse(pathsJson) as string[];
		vscode.postMessage({ command: 'openFileFromList', paths });
	} catch (error) {
		traceCuration('wireCurationButtons.badPathsJson', { error: error instanceof Error ? error.message : String(error) });
	}
}

function _handleCurationBtnClick(btn: HTMLButtonElement): void {
	const command = btn.getAttribute('data-command');
	if (!command) { return; }
	if (command === 'openFile') {
		const filePath = btn.getAttribute('data-path');
		if (filePath) { vscode.postMessage({ command: 'openFile', path: filePath }); }
	} else if (command === 'openFileFromList') {
		_postOpenFileFromList(btn.getAttribute('data-paths'));
	} else if (command === 'manageExtension') {
		const extensionId = btn.getAttribute('data-extension-id');
		if (extensionId) { vscode.postMessage({ command: 'manageExtension', extensionId }); }
	} else if (command === 'openAgentPlugins') {
		const pluginName = btn.getAttribute('data-plugin-name') ?? '';
		vscode.postMessage({ command: 'openAgentPlugins', pluginName });
	} else {
		vscode.postMessage({ command });
	}
}

function wireCurationButtons(): void {
	try {
		const section = document.getElementById('section-tool-curation');
		if (!section) {
			traceCurationOnce('wire-no-section', 'wireCurationButtons.noSection');
			return;
		}
		const buttons = section.querySelectorAll<HTMLButtonElement>('.curation-file-btn');
		traceCuration('wireCurationButtons.bind', { buttons: buttons.length });
		buttons.forEach(btn => {
			btn.addEventListener('click', () => {
				try {
					_handleCurationBtnClick(btn);
				} catch (error) {
					traceCuration('wireCurationButtons.clickError', { error: error instanceof Error ? error.message : String(error) });
				}
			});
		});
	} catch (error) {
		traceCuration('wireCurationButtons.error', { error: error instanceof Error ? error.message : String(error) });
	}
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
	allHighCostModels: string[],
	allLowCostModels: string[],
	allMediumCostModels: string[],
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
				${navButtonsHtml('btn-usage', !!stats.backendConfigured)}
				</div>
			</div>

			<div class="info-box">
				<div class="info-box-title info-box-toggle" id="about-info-toggle" role="button" tabindex="0" aria-expanded="${!aboutCollapsed}" aria-controls="about-info-body">
					<span>📋 About This Dashboard</span>
					<span class="info-box-chevron" aria-hidden="true">${aboutCollapsed ? '▸' : '▾'}</span>
				</div>
				<div class="info-box-body" id="about-info-body"${aboutCollapsed ? ' style="display:none"' : ''}>
					This dashboard analyzes your GitHub Copilot usage patterns by examining session log files.
					It tracks modes (ask/edit/agent), tool usage, context references (#file, @workspace, etc.),
					and MCP (Model Context Protocol) tools to help you understand how you interact with Copilot.
				</div>
			</div>

			<div class="tab-bar">
				<button class="tab-button ${activeTab === 'activity' ? 'active' : ''}" data-tab="activity"><span class="codicon codicon-pulse"></span> My Activity</button>
				<button class="tab-button ${activeTab === 'sessions' ? 'active' : ''}" data-tab="sessions"><span class="codicon codicon-history"></span> Recent Sessions</button>
				<button class="tab-button ${activeTab === 'tools' ? 'active' : ''}" data-tab="tools"><span class="codicon codicon-tools"></span> Tools &amp; Integrations</button>
				<button class="tab-button ${activeTab === 'health' ? 'active' : ''}" data-tab="health"><span class="codicon codicon-server-environment"></span> Workspace Health</button>
				<button class="tab-button ${activeTab === 'repos' ? 'active' : ''}" data-tab="repos"><span class="codicon codicon-git-pull-request"></span> Repository PRs</button>
				<button class="tab-button ${activeTab === 'agent' ? 'active' : ''}" data-tab="agent"><span class="codicon codicon-cloud"></span> Cloud Agent</button>
				<button class="tab-button ${activeTab === 'worktrees' ? 'active' : ''}" data-tab="worktrees"><span class="codicon codicon-git-branch"></span> Worktrees</button>
				<button class="tab-button ${activeTab === 'insights' ? 'active' : ''}" data-tab="insights"><span class="codicon codicon-lightbulb"></span> Insights${(stats.insights ?? []).filter(i => i.status === 'new').length > 0 ? ` <span style="background:rgba(96,165,250,0.4);border-radius:10px;padding:1px 6px;font-size:11px;">${(stats.insights ?? []).filter(i => i.status === 'new').length}</span>` : ''}</button>
			</div>

			${safeSectionHtml('Recent Sessions', () => buildSessionsTabPanelHtml(stats))}
			${safeSectionHtml('My Activity', () => buildActivityTabPanelHtml(stats, multiModelHtml, thinkingEffortHtml, sessionsSummaryHtml, todayTotalRefs, last30DaysTotalRefs))}
			${safeSectionHtml('Tools & Integrations', () => buildToolsTabPanelHtml(stats, allToolKeys, allMcpToolKeys, allMcpServerKeys, allHighCostModels, allLowCostModels, allMediumCostModels, allUnknownModels))}
			${safeSectionHtml('Workspace Health', () => buildHealthTabPanelHtml(customizationHtml, stats))}
			${safeSectionHtml('Repository PRs & Cloud Agent', () => buildReposAndAgentTabPanelsHtml())}
			${safeSectionHtml('Worktrees', () => buildWorktreesTabPanelHtml())}
			${safeSectionHtml('Insights', () => buildInsightsTabPanelHtml(stats.insights ?? []))}
			<div class="footer">
				Last updated: ${escapeHtml(new Date(stats.lastUpdated).toLocaleString())} · Updates every 5 minutes
			</div>
		</div>
`;
}

function renderWorktreeRootsList(): string {
	if (worktreeRoots.length === 0) {
		return `<div style="color: var(--text-muted); font-size: 12px; margin: 8px 0;">No root folders added yet. Add a folder to scan for worktrees.</div>`;
	}
	// With more than 2 locations the list gets long, so collapse it by default and show a count.
	const collapsible = worktreeRoots.length > 2;
	const showList = !collapsible || worktreeRootsExpanded;
	const toggle = collapsible
		? `<button class="worktree-roots-toggle" id="btn-toggle-worktree-roots" aria-expanded="${worktreeRootsExpanded}"><span class="worktree-caret">${worktreeRootsExpanded ? "▼" : "▶"}</span>${worktreeRoots.length} root folders found</button>`
		: "";
	const list = showList
		? `<div class="worktree-roots-list">${worktreeRoots
			.map(
				(r, i) =>
					`<div class="worktree-root-item"><span title="${escapeHtml(r)}">${escapeHtml(r)}</span><button class="button secondary worktree-remove-root" data-index="${i}" ${worktreeScanInProgress ? "disabled" : ""}>✕</button></div>`,
			)
			.join("")}</div>`
		: "";
	return toggle + list;
}

function _renderWorktreeEnrichingProgress(s: WorktreeScanStatus, seconds: string): string {
	const done = s.enriched ?? 0;
	const total = s.enrichTotal ?? 0;
	const pct = total > 0 ? Math.round((done / total) * 100) : 0;
	return `
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">📦 Computing sizes &amp; push status…</div>
      <div>${done} / ${total} worktree${total === 1 ? "" : "s"} analyzed (${seconds}s)</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${pct}%;"></div></div>
    </div>`;
}

function _renderWorktreeScanningProgress(s: WorktreeScanStatus, seconds: string): string {
	const walking = s.phase === "walking";
	const title = walking ? "🔍 Scanning folder…" : "⏳ Checking markers…";
	const dirs = s.dirsScanned ?? 0;
	const detail = walking
		? `Exploring for git worktrees — ${dirs} folder${dirs === 1 ? "" : "s"} scanned (${seconds}s)`
		: `${s.checked} / ${s.total || "?"} .git markers checked — ${s.foundCount} worktree${s.foundCount === 1 ? "" : "s"} found so far (${seconds}s)`;
	const pct = walking ? 100 : (s.total > 0 ? Math.round((s.checked / s.total) * 100) : 0);
	const fillClass = walking ? "worktree-progress-fill indeterminate" : "worktree-progress-fill";
	return `
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">${title}</div>
      <div>Folder: <span style="font-family: var(--vscode-editor-font-family, monospace);">${escapeHtml(s.root || "…")}</span></div>
      <div>${detail}</div>
      <div class="worktree-progress-bar"><div class="${fillClass}" style="width: ${pct}%;"></div></div>
    </div>`;
}

function renderWorktreeProgress(): string {
	if (!worktreeScanInProgress) { return ""; }
	const s = worktreeScanStatus;
	const seconds = (s.elapsedMs / 1000).toFixed(1);
	if (s.phase === "enriching") { return _renderWorktreeEnrichingProgress(s, seconds); }
	return _renderWorktreeScanningProgress(s, seconds);
}

function renderWorktreeControls(): string {
	return `
    <div class="section">
      <div class="section-title"><span class="codicon codicon-folder-opened"></span><span>Root Folders</span></div>
      <div id="worktree-roots-list">${renderWorktreeRootsList()}</div>
      <div class="folder-input-row" style="margin-top: 8px;">
        <input
          type="text"
          id="worktree-root-input"
          class="folder-input"
          placeholder="Paste a root folder path here, e.g. C:\\code\\repos"
          ${worktreeScanInProgress ? "disabled" : ""}
        />
        <button class="button secondary" id="btn-browse-worktree-root" ${worktreeScanInProgress ? "disabled" : ""}>📂 Browse…</button>
        <button class="button secondary" id="btn-add-worktree-root" ${worktreeScanInProgress ? "disabled" : ""}>➕ Add</button>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-scan-worktrees" ${worktreeScanInProgress || worktreeCleanupInProgress || worktreeRoots.length === 0 ? "disabled" : ""}>🔍 Scan for Worktrees</button>
        ${worktreeScanInProgress ? '<button class="button secondary" id="btn-cancel-worktree-scan">✕ Cancel</button>' : ""}
      </div>
      ${worktreeScanError ? `<div class="info-box" style="margin-top: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);"><div>⚠️ ${escapeHtml(worktreeScanError)}</div></div>` : ""}
      <div id="worktree-progress-area">${renderWorktreeProgress()}</div>
    </div>`;
}

function groupWorktreesByRepo(results: WorktreeResult[]): Map<string, WorktreeResult[]> {
	const groups = new Map<string, WorktreeResult[]>();
	for (const wt of results) {
		const key = wt.repoLabel || "Unknown";
		if (!groups.has(key)) { groups.set(key, []); }
		groups.get(key)!.push(wt);
	}
	return groups;
}

/** A worktree whose size/push status has not been computed yet (bytes are the -1 sentinel). */
function isWorktreePending(w: WorktreeResult): boolean {
	return w.bytes < 0;
}

/** Bytes counted toward totals: pending (-1) worktrees contribute 0 until enriched. */
function knownBytes(w: WorktreeResult): number {
	return w.bytes > 0 ? w.bytes : 0;
}

function buildWorktreeRowHtml(w: WorktreeResult): string {
	const pending = isWorktreePending(w);
	// While a scan is running the values are still being computed; if it stopped (e.g. cancelled)
	// before this row was enriched, show a neutral dash instead of a misleading "computing…".
	const pendingLabel = (active: string) => `<span class="worktree-pending">${worktreeScanInProgress ? active : "—"}</span>`;
	const pushedIcon = w.pushed === "yes" ? "✅" : w.pushed === "no" ? "🔴" : "❓";
	const pushedCell = pending ? pendingLabel("checking…") : `${pushedIcon} ${escapeHtml(w.pushed)}`;
	const filesCell = pending ? pendingLabel("…") : escapeHtml(String(w.files));
	const sizeCell = pending
		? pendingLabel("computing…")
		: `<span title="${w.bytes.toLocaleString()} bytes">${formatFileSize(w.bytes)}</span>`;
	return `<tr>
    <td title="${escapeHtml(w.path)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 380px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(w.path)}</td>
    <td>${escapeHtml(w.branch)}</td>
    <td>${escapeHtml(w.lastCommit)}</td>
    <td>${pushedCell}</td>
    <td>${filesCell}</td>
    <td>${sizeCell}</td>
    <td>
      <a href="#" class="worktree-reveal-link" data-path="${encodeURIComponent(w.path)}">Open</a>
      <a href="#" class="worktree-delete-link" data-path="${encodeURIComponent(w.path)}" data-branch="${encodeURIComponent(w.branch)}" data-repo="${encodeURIComponent(w.repoLabel)}" data-pushed="${escapeHtml(w.pushed)}" title="Remove via git worktree remove (asks for confirmation)">🗑️ Delete</a>
    </td>
  </tr>`;
}

/** The per-worktree details table shown when a repository row is expanded. */
function buildWorktreeDetailsTableHtml(worktrees: WorktreeResult[]): string {
	const sorted = [...worktrees].sort((a, b) => knownBytes(b) - knownBytes(a));
	const rows = sorted.map(buildWorktreeRowHtml).join("");
	return `<div class="table-container">
    <table class="session-table">
      <thead><tr><th>Path</th><th>Branch</th><th>Last Commit</th><th>Pushed</th><th>Files</th><th>Size</th><th>Actions</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

/** Size cell text with a trailing "…" hint while any worktree in the set is still being sized. */
function worktreeSizeText(worktrees: WorktreeResult[]): string {
	const totalBytes = worktrees.reduce((s, w) => s + knownBytes(w), 0);
	const pending = worktrees.some(isWorktreePending);
	const size = `<span title="${totalBytes.toLocaleString()} bytes">${formatFileSize(totalBytes)}</span>`;
	return pending ? `${size} <span class="worktree-pending">…</span>` : size;
}

/**
 * A repository's summary row (Repository | Worktrees | Size) plus a details row that holds the
 * per-worktree table. The details row is hidden unless the repo is in worktreeExpandedRepos.
 */
function buildWorktreeRepoRowsHtml(repoLabel: string, worktrees: WorktreeResult[]): string {
	const expanded = worktreeExpandedRepos.has(repoLabel);
	const caret = expanded ? "▼" : "▶";
	const repoAttr = escapeHtml(repoLabel);
	const summaryRow = `<tr class="worktree-repo-row${expanded ? " expanded" : ""}" data-repo="${repoAttr}" aria-expanded="${expanded}">
    <td><span class="worktree-caret">${caret}</span> ${escapeHtml(repoLabel)}</td>
    <td>${worktrees.length}</td>
    <td>${worktreeSizeText(worktrees)}</td>
  </tr>`;
	const detailsRow = `<tr class="worktree-repo-details" data-repo="${repoAttr}"${expanded ? "" : ' style="display: none;"'}>
    <td colspan="3">${buildWorktreeDetailsTableHtml(worktrees)}</td>
  </tr>`;
	return summaryRow + detailsRow;
}

function getWorktreeSortIndicator(col: WorktreeSortColumn): string {
	if (worktreeSortColumn !== col) { return ""; }
	return worktreeSortDir === "desc" ? " ▼" : " ▲";
}

/** Sum of the known (enriched) bytes across a repository's worktrees. */
function groupKnownBytes(worktrees: WorktreeResult[]): number {
	return worktrees.reduce((s, w) => s + knownBytes(w), 0);
}

/** Compare two [repoLabel, worktrees] groups per the active sort column/direction. */
function compareWorktreeGroups(a: [string, WorktreeResult[]], b: [string, WorktreeResult[]]): number {
	const dir = worktreeSortDir === "desc" ? -1 : 1;
	if (worktreeSortColumn === "repo") {
		return dir * a[0].localeCompare(b[0]);
	}
	const value = (g: WorktreeResult[]) => (worktreeSortColumn === "count" ? g.length : groupKnownBytes(g));
	const diff = value(a[1]) - value(b[1]);
	// Tie-break by repo name (ascending) so equal groups keep a stable order.
	return diff !== 0 ? dir * diff : a[0].localeCompare(b[0]);
}

/** Worktrees eligible for the bulk cleanup: known to be pushed and already enriched. */
function getCleanupCandidates(): WorktreeResult[] {
	return worktreeResults.filter((w) => w.pushed === "yes" && !isWorktreePending(w));
}

/** The cleanup trigger, rendered as its own card inside the hero summary-cards row (to the right of Worktrees/Repositories/Total Size). */
function renderWorktreeCleanupCard(): string {
	const pushedCount = getCleanupCandidates().length;
	const disabled = worktreeCleanupInProgress || worktreeCleanupConfirmPending || worktreeScanInProgress || pushedCount === 0;
	const label = worktreeCleanupConfirmPending ? "⏳ Waiting…" : `🧹 Clean Up (${pushedCount})`;
	return `<div class="summary-card worktree-cleanup-card">
    <div class="summary-label">Pushed Worktrees</div>
    <div class="worktree-cleanup-card-actions">
      <button class="button secondary" id="btn-cleanup-pushed-worktrees" ${disabled ? "disabled" : ""}>${label}</button>
      ${worktreeCleanupInProgress ? '<button class="button secondary" id="btn-cancel-cleanup">✕</button>' : ""}
    </div>
  </div>`;
}

/** Non-deleted cleanup outcomes (skipped/error) — successful deletions just remove the row, no need to list them. */
function renderWorktreeCleanupLog(): string {
	const notable = worktreeCleanupLog.filter((e) => e.status !== "deleted");
	if (notable.length === 0) { return ""; }
	const rows = notable.map((e) => {
		const icon = e.status === "skipped" ? "⏭️" : "❌";
		return `<div class="worktree-cleanup-log-row">
      <span>${icon}</span>
      <span class="worktree-cleanup-log-branch">${escapeHtml(e.branch)}</span>
      <span class="worktree-cleanup-log-repo">${escapeHtml(e.repoLabel)}</span>
      <span class="worktree-cleanup-log-reason">${escapeHtml(e.reason || "")}</span>
    </div>`;
	}).join("");
	return `<div class="worktree-cleanup-log">${rows}</div>`;
}

function renderWorktreeCleanupStatus(): string {
	if (worktreeCleanupInProgress) {
		const { processed, total } = worktreeCleanupStatus;
		const pct = total > 0 ? Math.round((processed / total) * 100) : 0;
		return `<div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">🧹 Cleaning up pushed worktrees…</div>
      <div>${processed} / ${total} processed</div>
      <div class="worktree-progress-bar"><div class="worktree-progress-fill" style="width: ${pct}%;"></div></div>
    </div>${renderWorktreeCleanupLog()}`;
	}
	if (worktreeCleanupLog.length === 0) { return ""; }
	const deleted = worktreeCleanupLog.filter((e) => e.status === "deleted").length;
	const skipped = worktreeCleanupLog.filter((e) => e.status === "skipped").length;
	const errors = worktreeCleanupLog.filter((e) => e.status === "error").length;
	return `<div class="info-box" style="margin-top: 12px;">
    <div class="info-box-title">🧹 Cleanup finished</div>
    <div>✅ ${deleted} deleted · ⏭️ ${skipped} skipped (uncommitted/unpushed) · ${errors > 0 ? `❌ ${errors} error${errors === 1 ? "" : "s"}` : "0 errors"}</div>
  </div>${renderWorktreeCleanupLog()}`;
}

function renderWorktreeResults(): string {
	if (worktreeResults.length === 0) {
		if (worktreeScanInProgress) { return '<div style="padding: 16px; color: var(--text-muted);">Discovering worktrees…</div>'; }
		return '<div style="padding: 16px; color: var(--text-muted);">No worktrees found yet. Add root folders above and click Scan.</div>';
	}
	const groups = groupWorktreesByRepo(worktreeResults);
	const totalBytes = worktreeResults.reduce((s, w) => s + knownBytes(w), 0);
	const anyPending = worktreeResults.some(isWorktreePending);
	const totalSizeHtml = `${formatFileSize(totalBytes)}${anyPending ? ' <span class="worktree-pending">…</span>' : ''}`;
	const summary = `<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">🌳 Worktrees</div><div class="summary-value">${worktreeResults.length}</div></div>
    <div class="summary-card"><div class="summary-label">📦 Repositories</div><div class="summary-value">${groups.size}</div></div>
    <div class="summary-card"><div class="summary-label">💾 Total Size</div><div class="summary-value" title="${totalBytes.toLocaleString()} bytes">${totalSizeHtml}</div></div>
    ${renderWorktreeCleanupCard()}
  </div>`;
	const sortedGroups = [...groups.entries()].sort(compareWorktreeGroups);
	const repoRows = sortedGroups.map(([repo, wts]) => buildWorktreeRepoRowsHtml(repo, wts)).join("");
	const table = `<div class="table-container">
    <table class="session-table worktree-repo-table">
      <thead><tr>
        <th class="sortable" data-wt-sort="repo">Repository${getWorktreeSortIndicator("repo")}</th>
        <th class="sortable" data-wt-sort="count">Worktrees${getWorktreeSortIndicator("count")}</th>
        <th class="sortable" data-wt-sort="size">Size${getWorktreeSortIndicator("size")}</th>
      </tr></thead>
      <tbody>${repoRows}</tbody>
    </table>
  </div>`;
	return summary + renderWorktreeCleanupStatus() + table;
}

function buildWorktreesTabPanelHtml(): string {
	return `
    <div id="tab-panel-worktrees" class="tab-panel"${activeTab !== 'worktrees' ? ' style="display:none"' : ''}>
      <div class="info-box">
        <div class="info-box-title">🌳 Worktree Discovery</div>
        <div>
          Scans folders for uncleaned git worktrees and reports disk usage grouped by repository (based on each
          worktree's git remote). Add one or more root folders below, then click Scan. Results stream in as they're found.
        </div>
      </div>
      <div id="worktree-controls">${renderWorktreeControls()}</div>
      <div id="worktree-results">${renderWorktreeResults()}</div>
    </div>`;
}

function buildSessionsTabPanelHtml(stats: UsageAnalysisStats): string {
	// Guard against silent host updates that omit todaySessions (e.g. a stale payload
	// shape): keep showing the last known sessions instead of clearing the table.
	if (Array.isArray(stats.todaySessions)) {
		latestTodaySessions = stats.todaySessions;
	}
	const cachedForLookback = sessionsLookback === 'today' ? latestTodaySessions : recentSessionsCache[sessionsLookback];
	const bodyHtml = cachedForLookback
		? renderTodaySessionsTable(cachedForLookback)
		: `<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">Loading sessions for ${PERIOD_LABELS[sessionsLookback]}…</div>`;
	return `
		<div id="tab-panel-sessions" class="tab-panel"${activeTab !== 'sessions' ? ' style="display:none"' : ''}>
			<div class="section">
				<div class="section-title" style="display:flex; align-items:center; gap:8px;">
					<span>📋</span><span>Recent Sessions</span>
					<span id="sessions-lookback-wrapper" style="margin-left:auto;"></span>
					${buildSessionColumnsMenuHtml()}
				</div>
				<div class="section-subtitle">Individual session breakdown for the selected period — sorted by number of interactions (most active first).</div>
				<div id="sessions-panel-body" style="margin-top: 12px;">
					${bodyHtml}
				</div>
			</div>
		</div>`;
}

/** Renders the "GitHub Copilot API (all channels)" gauge as three segments: usage this
 *  extension can account for locally ("tracked here"), usage the API reports but this
 *  extension has no local session data for ("other devices/cloud" — e.g. a different PC,
 *  a VDI, WSL, web chat, cloud agent, or review agent), and whatever budget remains.
 *  `copilotCostUsd` is the extension's locally-tracked GitHub Copilot spend for the
 *  current month; it is clamped so a bar never renders more than 100% even if local
 *  tracking briefly overshoots the API snapshot (e.g. due to refresh timing). */
function _billingApiBalanceHtml(api: CopilotApiBalance, copilotCostUsd: number): string {
	const apiUsedUsd = api.usedAiCredits * 0.01;
	const trackedUsd = Math.max(0, Math.min(copilotCostUsd, apiUsedUsd));
	const gapUsd = Math.max(0, apiUsedUsd - trackedUsd);
	const budgetUsd = api.budgetUsd;
	const trackedPct = budgetUsd > 0 ? Math.min(100, (trackedUsd / budgetUsd) * 100) : 0;
	const gapPct = budgetUsd > 0 ? Math.min(100 - trackedPct, (gapUsd / budgetUsd) * 100) : 0;
	const totalUsedPct = trackedPct + gapPct;
	const usedPct = formatFixed(100 - api.pctAvailable, 1);
	const pct = formatFixed(api.pctAvailable, 1);
	const severityColor = totalUsedPct > 90 ? 'var(--error-color, #f14c4c)' : totalUsedPct > 75 ? 'var(--warning-color, #cca700)' : 'var(--accent-color, #4d9cf8)';
	const trackedSegment = trackedPct > 0
		? `<div style="height:100%; width:${formatFixed(trackedPct, 4)}%; background:${severityColor};"></div>`
		: '';
	// The "other usage" segment is hatched (striped) rather than solid — same severity
	// color, but visually flagged as usage this device can't confirm the source of.
	const gapSegment = gapPct > 0
		? `<div title="Usage the API reports but this device has no local session data for" style="height:100%; width:${formatFixed(gapPct, 4)}%; background:${severityColor}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 3px, transparent 3px, transparent 6px);"></div>`
		: '';
	const legend = gapPct > 0
		? `<div style="display:flex; gap:14px; flex-wrap:wrap; font-size:11px; color:var(--text-secondary); margin-top:6px;">
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${severityColor}; margin-right:4px; vertical-align:middle;"></span>Tracked here (${formatFixed(trackedPct, 1)}%)</span>
				<span><span style="display:inline-block; width:9px; height:9px; border-radius:2px; background:${severityColor}; background-image:repeating-linear-gradient(135deg, rgba(0,0,0,0.35) 0px, rgba(0,0,0,0.35) 2px, transparent 2px, transparent 4px); margin-right:4px; vertical-align:middle;"></span>Other devices/cloud (${formatFixed(gapPct, 1)}%)</span>
			</div>`
		: '';
	return `
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">GitHub Copilot API (all channels)</div>
			<div style="display:flex; gap:16px; flex-wrap:wrap; margin-bottom:8px;">
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${formatNumber(api.usedAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits used</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${formatNumber(api.remainingAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Credits remaining</div>
				</div>
				<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:10px 16px; text-align:center; min-width:80px;">
					<div style="font-size:18px; font-weight:700; color:var(--text-primary);">${formatNumber(api.budgetAiCredits)}</div>
					<div style="font-size:11px; color:var(--text-secondary); margin-top:2px;">Monthly budget</div>
				</div>
			</div>
			<div style="margin-bottom:4px; font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
				<span>${usedPct}% used</span><span>${pct}% available</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden; display:flex;">
				${trackedSegment}${gapSegment}
			</div>
			${legend}
			<div style="font-size:11px; color:var(--text-muted); margin-top:6px;">
				1 AI Credit = $0.01 · Budget = $${formatFixed(api.budgetUsd, 2)}/month
			</div>
		</div>`;
}

function _billingExtGroupCostsHtml(groupCosts: Record<string, number>): string {
	const totalCostUsd = Object.values(groupCosts).reduce((s, v) => s + v, 0);
	const rows = Object.entries(groupCosts)
		.sort(([, a], [, b]) => b - a)
		.map(([group, cost]) => `
			<tr>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary);">${escapeHtml(group)}</td>
				<td style="padding:4px 8px; font-size:12px; color:var(--text-primary); text-align:right;">$${formatFixed(cost, 2)}</td>
			</tr>`).join('');
	return `
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Extension tracked (this calendar month, IDE sessions only)</div>
			<table style="width:100%; border-collapse:collapse; border:1px solid var(--border-subtle); border-radius:6px; overflow:hidden;">
				<thead>
					<tr style="background:var(--bg-tertiary);">
						<th style="padding:6px 8px; text-align:left; font-size:11px; color:var(--text-secondary); font-weight:600;">Provider</th>
						<th style="padding:6px 8px; text-align:right; font-size:11px; color:var(--text-secondary); font-weight:600;">Estimated cost</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
				<tfoot>
					<tr style="border-top:1px solid var(--border-color);">
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary);">Total</td>
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary); text-align:right;">$${formatFixed(totalCostUsd, 2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>`;
}

function _billingCoverageAnalysisHtml(api: CopilotApiBalance | null | undefined, copilotCostUsd: number, nonCopilotCostUsd: number): string {
	if (!api) {
		return `
			<div style="font-size:11px; color:var(--text-muted); margin-bottom:8px; line-height:1.5;">
				ℹ️ No Copilot API quota data available yet. The API balance appears after the extension fetches your Copilot plan info.
				The extension only tracks local IDE sessions — it cannot see web chat, cloud agent, or review agent usage.
			</div>`;
	}
	if (copilotCostUsd <= 0) { return ''; }
	const apiUsedUsd = api.usedAiCredits * 0.01;
	const gapUsd = apiUsedUsd - copilotCostUsd;
	const gapCredits = Math.round(gapUsd * 100);
	const gapRow = gapCredits > 0
		? `<div style="display:flex; justify-content:space-between; padding-top:6px; border-top:1px solid var(--border-subtle); color:var(--text-secondary);"><span>Gap (untracked Copilot usage)</span><span>$${formatFixed(gapUsd, 2)} (${formatNumber(gapCredits)} credits)</span></div>`
		: '';
	const otherRow = nonCopilotCostUsd > 0.001
		? `<div style="display:flex; justify-content:space-between;"><span>Other providers (not in Copilot API)</span><span>$${formatFixed(nonCopilotCostUsd, 2)}</span></div>`
		: '';
	const note = gapCredits > 0
		? `<div style="margin-top:8px; font-size:11px; color:var(--text-muted); line-height:1.5;">ℹ️ The gap represents Copilot usage the extension cannot track: <strong>github.com/copilot</strong> web chat, <strong>cloud agent</strong> sessions, and <strong>Copilot review agent</strong> — all counted against your AI Credit budget.</div>`
		: `<div style="margin-top:8px; font-size:11px; color:var(--text-muted);">✅ Extension-tracked Copilot usage matches the API — no significant untracked usage from web chat, cloud agent, or review agent.</div>`;
	return `
		<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:12px 14px; margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:8px;">Coverage analysis</div>
			<div style="display:flex; flex-direction:column; gap:6px; font-size:12px; color:var(--text-primary);">
				<div style="display:flex; justify-content:space-between;"><span>API total Copilot usage</span><span style="font-weight:600;">$${formatFixed(apiUsedUsd, 2)} (${formatNumber(api.usedAiCredits)} credits)</span></div>
				<div style="display:flex; justify-content:space-between;"><span>Extension tracked (Copilot IDE sessions)</span><span style="font-weight:600;">$${formatFixed(copilotCostUsd, 2)} (${formatNumber(Math.round(copilotCostUsd * 100))} credits)</span></div>
				${gapRow}${otherRow}
			</div>
			${note}
		</div>`;
}

function buildBillingComparisonSectionHtml(stats: UsageAnalysisStats): string {
	const api = stats.copilotApiBalance;
	const groupCosts = stats.monthBillingGroupCosts;
	if (!api && (!groupCosts || Object.keys(groupCosts).length === 0)) { return ''; }

	const copilotCostUsd = groupCosts?.['GitHub Copilot'] ?? 0;
	const totalCostUsd = groupCosts ? Object.values(groupCosts).reduce((s, v) => s + v, 0) : 0;
	const nonCopilotCostUsd = totalCostUsd - copilotCostUsd;

	const apiHtml = api ? _billingApiBalanceHtml(api, copilotCostUsd) : '';
	const extHtml = groupCosts && Object.keys(groupCosts).length > 0 ? _billingExtGroupCostsHtml(groupCosts) : '';
	const deltaHtml = _billingCoverageAnalysisHtml(api, copilotCostUsd, nonCopilotCostUsd);

	return `
		<div class="section">
			<div class="section-title"><span>💳</span><span>Copilot Billing Coverage</span></div>
			<div class="section-subtitle">Compare what the GitHub Copilot API reports across all channels with what the extension can track from local IDE session logs.</div>
			${apiHtml}
			${extHtml}
			${deltaHtml}
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
	// Each section is built through safeSectionHtml so a bug in one section (e.g. a data
	// shape it doesn't expect) renders an inline error card for that section only, instead of
	// throwing out of this template literal and blanking the entire Activity tab.
	const modelCostHtml = safeSectionHtml('Model Cost', () => buildModelCostSectionHtml(stats));
	const billingComparisonHtml = safeSectionHtml('Copilot Billing Coverage', () => buildBillingComparisonSectionHtml(stats));
	const modeUsageHtml = safeSectionHtml('Interaction Modes', () => `
			<div class="section">
				<div class="section-title"><span>🎯</span><span>Interaction Modes</span></div>
				<div class="section-subtitle">How you're using Copilot: Ask (chat), Edit (code edits), or Agent (autonomous tasks)</div>
				<div class="two-column">
					${renderModeBarChart(stats.today.modeUsage, '📅 Today')}
					${renderModeBarChart(stats.last30Days.modeUsage, '📊 Last 30 Days')}
				</div>
			</div>`);
	const contextRefsHtml = safeSectionHtml('Context References', () => buildContextRefsHtml(stats, todayTotalRefs, last30DaysTotalRefs));
	const modelEfficiencyHtml = safeSectionHtml('Model Efficiency', () => buildModelEfficiencySectionHtml(stats));
	const contextWindowHtml = safeSectionHtml('Context Window', () => buildContextWindowSectionHtml(stats));
	return `
		<div id="tab-panel-activity" class="tab-panel"${activeTab !== 'activity' ? ' style="display:none"' : ''}>
			${sessionsSummaryHtml}
			${billingComparisonHtml}
			<!-- Mode Usage Section -->
			${modeUsageHtml}
			${contextRefsHtml}
			${multiModelHtml}
			${modelCostHtml}
			${modelEfficiencyHtml}
			${thinkingEffortHtml}
			${contextWindowHtml}
		</div>`;
}

// ─── Context window / long-context pricing section ─────────────────────────────

const _modelPricingData = getWindowData<{ pricing: Record<string, ModelPricing> }>('__MODEL_PRICING__');
const MODEL_PRICING_MAP: Record<string, ModelPricing> = _modelPricingData?.pricing ?? {};

/** Long-context tier info for a set of models — smallest threshold wins. */
function _tierInfoForModels(models: string[]): { thresholdTokens: number; defaultInputCostPerMillion: number; longContextInputCostPerMillion: number; model: string } | null {
	let best: { thresholdTokens: number; defaultInputCostPerMillion: number; longContextInputCostPerMillion: number; model: string } | null = null;
	for (const model of models) {
		const info = getLongContextInfo(model, MODEL_PRICING_MAP);
		if (info && (!best || info.thresholdTokens < best.thresholdTokens)) {
			best = { ...info, model };
		}
	}
	return best;
}

/** "how much repo fits" estimate: ~4 characters per token, ~40 characters per source line. */
function _defaultTierCapacityText(thresholdTokens: number): string {
	const mb = (thresholdTokens * 4) / (1024 * 1024);
	const lines = Math.round(thresholdTokens / 10 / 1000);
	return `≈${formatFixed(mb, 1)} MB of code (~${formatNumber(lines)}K lines)`;
}

function _renderContextWindowBar(maxTokens: number, tier: { thresholdTokens: number; defaultInputCostPerMillion: number; longContextInputCostPerMillion: number; model: string }): string {
	const pct = (maxTokens / tier.thresholdTokens) * 100;
	const fillPct = Math.min(pct, 100);
	const color = pct > 100 ? 'var(--error-color, #f14c4c)' : pct >= 70 ? 'var(--warning-color, #cca700)' : 'var(--success-color, #89d185)';
	const modelName = escapeHtml(getModelDisplayName(tier.model));
	const rateNote = `above it, input billing goes $${tier.defaultInputCostPerMillion.toFixed(2)} → $${tier.longContextInputCostPerMillion.toFixed(2)} per 1M tokens`;
	return `
		<div style="margin-top: 12px;">
			<div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary); margin-bottom:4px;">
				<span>${formatNumber(maxTokens)} tokens — ${formatFixed(pct, 0)}% of the ${formatNumber(tier.thresholdTokens)}-token default tier for ${modelName}</span>
				<span>${formatNumber(tier.thresholdTokens)}</span>
			</div>
			<div style="height:8px; border-radius:4px; background:var(--border-subtle); overflow:hidden;">
				<div style="height:100%; width:${formatFixed(fillPct, 0)}%; background:${color}; border-radius:4px;"></div>
			</div>
			<div style="font-size:11px; color:var(--text-muted); margin-top:4px;">Default tier fits ${_defaultTierCapacityText(tier.thresholdTokens)}; ${rateNote}.</div>
		</div>`;
}

/** One labelled value line inside a context-window period column. */
function _cwRow(label: string, value: string, subNote?: string, labelTitle?: string): string {
	const titleAttr = labelTitle ? ` title="${labelTitle}"` : '';
	return `
		<div style="margin-bottom: 10px;">
			<div style="font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 2px;"${titleAttr}>${label}</div>
			<div style="font-size: 13px; color: var(--text-primary);">${value}</div>
			${subNote ? `<div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px; line-height: 1.4;">${subNote}</div>` : ''}
		</div>`;
}

/** Largest-request row for one period column (empty string when the period has none). */
function _cwLargestRequestRow(cw: ContextWindowStats): string {
	if (cw.maxRequestInputTokens <= 0) { return ''; }
	const tier = _tierInfoForModels(cw.maxRequestModels);
	const modelsLabel = escapeHtml(cw.maxRequestModels.map(m => getModelDisplayName(m)).join(', ') || '—');
	const thresholdNote = tier
		? `${formatFixed((cw.maxRequestInputTokens / tier.thresholdTokens) * 100, 0)}% of the ${formatNumber(tier.thresholdTokens)}-token price line · ${modelsLabel}`
		: `${modelsLabel} — no long-context surcharge for ${cw.maxRequestModels.length > 1 ? 'these models' : 'this model'}`;
	return _cwRow('📏 Largest request', `${formatNumber(cw.maxRequestInputTokens)} input tokens`, thresholdNote,
		'The biggest single prompt (input incl. cached tokens) sent to a model in one request during this period');
}

/** Fullest-CLI-window row for one period column (empty string when unavailable). */
function _cwFullestWindowRow(cw: ContextWindowStats): string {
	if ((cw.maxReachedTokens ?? 0) <= 0) { return ''; }
	const limit = cw.maxReachedWindowLimit;
	const value = limit
		? `${formatNumber(cw.maxReachedTokens!)} of ${formatNumber(limit)} (${formatFixed((cw.maxReachedTokens! / limit) * 100, 0)}%)`
		: formatNumber(cw.maxReachedTokens!);
	return _cwRow('🪟 Fullest CLI window', value, undefined,
		'The highest context fill recorded for a Copilot CLI session in this period, versus its window limit');
}

/** Renders one period column of the context-window section. */
function renderContextWindowPeriodHtml(cw: ContextWindowStats | undefined): string {
	const hasData = !!cw && (cw.maxRequestInputTokens > 0 || (cw.maxReachedTokens ?? 0) > 0 || Object.keys(cw.tierCounts).length > 0);
	if (!hasData) { return '<div style="color: var(--text-muted); font-size: 11px;">No data</div>'; }
	const tierEntries = Object.entries(cw!.tierCounts);
	const tierSessionCount = tierEntries.reduce((sum, [, c]) => sum + c, 0);
	const tierRow = tierEntries.length > 0
		? _cwRow('🪜 Context tiers', tierEntries.map(([t, c]) => `${escapeHtml(t)} ×${c}`).join(', '),
			`${tierSessionCount} Copilot CLI session${tierSessionCount === 1 ? '' : 's'} grouped by chosen window size — "default" is the standard window at normal rates; larger tiers unlock more context at long-context prices`,
			'Copilot CLI lets you pick a context-window tier per session; the count shows how many sessions used each tier')
		: '';
	return _cwLargestRequestRow(cw!) + _cwFullestWindowRow(cw!) + tierRow;
}

/**
 * Bottom-of-tab section: largest request per period vs the long-context
 * pricing threshold, fullest CLI window, and context tiers used.
 */
function buildContextWindowSectionHtml(stats: UsageAnalysisStats): string {
	const cw30 = stats.last30Days.contextWindow;
	const tier30 = cw30 && cw30.maxRequestInputTokens > 0 ? _tierInfoForModels(cw30.maxRequestModels) : null;
	const bar = cw30 && tier30 ? _renderContextWindowBar(cw30.maxRequestInputTokens, tier30) : '';
	return `
		<div class="section">
			<div class="section-title"><span>🪟</span><span>Context Window &amp; Long-Context Pricing</span></div>
			<div class="section-subtitle">How close your largest requests come to the long-context price line. Models with tiered pricing bill higher input rates once a request exceeds their default-tier threshold.</div>
			<div class="three-column">
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Today</h4>
					${renderContextWindowPeriodHtml(stats.today.contextWindow)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📆 Last 30 Days</h4>
					${renderContextWindowPeriodHtml(cw30)}
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Previous Month</h4>
					${renderContextWindowPeriodHtml(stats.lastMonth.contextWindow)}
				</div>
			</div>
			${bar}
		</div>`;
}

interface ContextRefDescriptor {
	label: string;
	title?: string;
	get: (cr: ContextReferenceUsage) => number;
}

interface ContextRefRow {
	label: string;
	title?: string;
	last30: number;
	month: number;
	lastMonth: number;
	today: number;
}

function numCell(value: number, extraClass = ''): string {
	const zeroClass = value > 0 ? '' : ' ctx-ref-zero';
	const cls = `ctx-ref-num${extraClass ? ' ' + extraClass : ''}${zeroClass}`;
	return `<td class="${cls}">${value}</td>`;
}

function sparklineCell(lastMonth: number, month: number, today: number): string {
	const W = 60, H = 20, PAD = 2;
	const values = [lastMonth, month, today];
	const max = Math.max(...values);
	// Flat line at the bottom when all zeros
	const points = values.map((v, i) => {
		const x = PAD + i * ((W - PAD * 2) / (values.length - 1));
		const y = max === 0 ? H - PAD : PAD + (1 - v / max) * (H - PAD * 2);
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(' ');
	const isFlat = max === 0;
	const color = isFlat ? 'var(--text-muted)' : today >= month && month >= lastMonth ? 'var(--link-color)' : today <= month && month <= lastMonth ? '#f87171' : 'var(--text-secondary)';
	return `<td class="ctx-ref-spark"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${values.map((v, i) => {
		const x = PAD + i * ((W - PAD * 2) / (values.length - 1));
		const y = max === 0 ? H - PAD : PAD + (1 - v / max) * (H - PAD * 2);
		return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${color}"/>`;
	}).join('')}</svg></td>`;
}

function renderContextRefTable(
	rows: ContextRefRow[],
	totals: { last30: number; month: number; lastMonth: number; today: number },
): string {
	const bodyRows = rows
		.slice()
		.sort((a, b) => b.last30 - a.last30)
		.map((row) => {
			const titleAttr = row.title ? ` title="${escapeHtml(row.title)}"` : '';
			return `<tr${titleAttr}><td class="ctx-ref-name">${row.label}</td>${numCell(row.today, row.today > 0 ? 'ctx-ref-today-active' : '')}${numCell(row.month)}${numCell(row.lastMonth)}${numCell(row.last30)}${sparklineCell(row.lastMonth, row.month, row.today)}</tr>`;
		})
		.join('');
	return `
		<div class="ctx-ref-table-wrap">
			<table class="ctx-ref-table">
				<thead>
					<tr>
						<th class="ctx-ref-name">Reference</th>
						<th class="ctx-ref-num">Today</th>
						<th class="ctx-ref-num">This Month</th>
						<th class="ctx-ref-num">Last Month</th>
						<th class="ctx-ref-num">Last 30 Days</th>
						<th class="ctx-ref-spark" title="Trend: Last Month → This Month → Today">Trend</th>
					</tr>
				</thead>
				<tbody>
					${bodyRows}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total">
						<td class="ctx-ref-name">📊 Total References</td>
						<td class="ctx-ref-num">${totals.today}</td>
						<td class="ctx-ref-num">${totals.month}</td>
						<td class="ctx-ref-num">${totals.lastMonth}</td>
						<td class="ctx-ref-num">${totals.last30}</td>
						<td class="ctx-ref-spark">${sparklineCell(totals.lastMonth, totals.month, totals.today).replace(/^<td[^>]*>/, '').replace(/<\/td>$/, '')}</td>
					</tr>
				</tfoot>
			</table>
		</div>`;
}

function buildContextRefCardsHtml(stats: UsageAnalysisStats, todayTotalRefs: number, last30DaysTotalRefs: number): string {
	const c = (v: number | undefined): number => v || 0;
	const descriptors: ContextRefDescriptor[] = [
		{ label: '📄 #file', get: (cr) => cr.file },
		{ label: '✂️ #selection', get: (cr) => cr.selection },
		{ label: '✨ Implicit Selection', title: 'Text selected in your editor providing passive context to Copilot', get: (cr) => cr.implicitSelection },
		{ label: '🔤 #symbol', get: (cr) => cr.symbol },
		{ label: '🗂️ #codebase', get: (cr) => cr.codebase },
		{ label: '📁 @workspace', get: (cr) => cr.workspace },
		{ label: '💻 @terminal', get: (cr) => cr.terminal },
		{ label: '🔧 @vscode', get: (cr) => cr.vscode },
		{ label: '⌨️ #terminalLastCommand', title: 'Last command run in the terminal', get: (cr) => c(cr.terminalLastCommand) },
		{ label: '🖱️ #terminalSelection', title: 'Selected terminal output', get: (cr) => c(cr.terminalSelection) },
		{ label: '📋 #clipboard', title: 'Clipboard contents', get: (cr) => c(cr.clipboard) },
		{ label: '📝 #changes', title: 'Uncommitted git changes', get: (cr) => c(cr.changes) },
		{ label: '📤 #outputPanel', title: 'Output panel contents', get: (cr) => c(cr.outputPanel) },
		{ label: '⚠️ #problemsPanel', title: 'Problems panel contents', get: (cr) => c(cr.problemsPanel) },
		{ label: '🔀 #pr', title: 'Pull request context references (#pr / #pullRequest) — Copilot PR chat understanding, review, and summary', get: (cr) => c(cr.pullRequest) },
		{ label: '📷 Images', title: 'Pasted images and vision context detected in session logs', get: (cr) => c(cr.byKind['copilot.image']) },
		{ label: '📋 Prompt Files', title: '.github/prompts/ prompt file uses detected in session logs', get: (cr) => c(cr.byKind['promptFile']) },
		{ label: '📐 Code Lines', title: 'Total lines of code referenced via #file: range selections', get: (cr) => c(cr.codeContextLines) },
		{ label: '🎯 Custom Prompts', title: 'Custom /command prompt uses detected in session logs', get: (cr) => c(cr.byKind['prompt']) },
		{ label: '📋 Copilot Instructions', title: 'copilot-instructions.md file references detected in session logs', get: (cr) => cr.copilotInstructions },
		{ label: '🤖 Agents.md', title: 'agents.md file references detected in session logs', get: (cr) => cr.agentsMd },
	];
	const r = stats.last30Days.contextReferences;
	const m = stats.month.contextReferences;
	const lm = stats.lastMonth.contextReferences;
	const t = stats.today.contextReferences;
	const rows: ContextRefRow[] = descriptors.map((d) => ({
		label: d.label,
		title: d.title,
		last30: d.get(r),
		month: d.get(m),
		lastMonth: d.get(lm),
		today: d.get(t),
	}));
	return renderContextRefTable(rows, {
		last30: last30DaysTotalRefs,
		month: getTotalContextRefs(m),
		lastMonth: getTotalContextRefs(lm),
		today: todayTotalRefs,
	});
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

// --- Model Efficiency section (issue #1649) ---

type EfficiencyPeriodKey = 'today' | 'last30Days' | 'month';
type EfficiencyRow = { model: string; counters: ModelEfficiencyCounters; rates: ReturnType<typeof deriveModelEfficiencyRates> };
type EfficiencySortColumn = 'model' | 'calls' | 'editTurns' | 'oneShotRate' | 'retryRate' | 'selfCorrectionRate' | 'costPerCall' | 'costPerEdit' | 'outputTokensPerCall' | 'cacheHitRate';

const EFFICIENCY_PERIOD_TO_DATA_KEY: Partial<Record<Period, EfficiencyPeriodKey>> = {
	today: 'today',
	last30: 'last30Days',
	currentMonth: 'month',
};

let efficiencySelectedPeriod: Period = 'last30';
let efficiencyPeriod: EfficiencyPeriodKey = 'last30Days';
let efficiencySortColumn: EfficiencySortColumn = 'calls';
let efficiencySortDirection: 'asc' | 'desc' = 'desc';
let cachedModelEfficiency: Partial<Record<EfficiencyPeriodKey, ModelEfficiencyUsage | undefined>> = {};
let efficiencyFilterLowUsage = true;

type EfficiencyColumnDef = {
	sortKey: EfficiencySortColumn;
	label: string;
	title: string;
	align: 'left' | 'right';
	sortValue: (r: EfficiencyRow) => number | string | null;
	render: (r: EfficiencyRow) => string;
};

/** Format a per-unit USD cost with 2 decimal places. */
function formatUnitCost(value: number | null): string {
	if (value === null) { return '—'; }
	return value >= 0.01 ? formatCost(value) : `$${value.toFixed(2)}`;
}

function formatRatePercent(value: number | null): string {
	return value === null ? '—' : formatPercent(value * 100);
}

function formatPerEdit(value: number | null): string {
	return value === null ? '—' : formatFixed(value, 2);
}

const EFFICIENCY_COLUMN_DEFS: EfficiencyColumnDef[] = [
	{ sortKey: 'model', label: 'Model', title: 'Model identifier', align: 'left', sortValue: r => r.model, render: r => escapeHtml(getModelDisplayName(r.model)) },
	{ sortKey: 'calls', label: 'Turns', title: 'User-request turns attributed to this model', align: 'right', sortValue: r => r.counters.calls, render: r => r.counters.calls > 0 ? formatNumber(r.counters.calls) : '—' },
	{ sortKey: 'editTurns', label: 'Edit turns', title: 'Turns containing at least one file-edit tool call', align: 'right', sortValue: r => r.counters.editTurns, render: r => r.counters.calls > 0 ? formatNumber(r.counters.editTurns) : '—' },
	{ sortKey: 'oneShotRate', label: 'One-shot edit rate', title: 'Share of edit turns completed without retries or self-corrections', align: 'right', sortValue: r => r.rates.oneShotRate, render: r => formatRatePercent(r.rates.oneShotRate) },
	{ sortKey: 'retryRate', label: 'Retries/edit', title: 'Average immediate same-file retries per edit turn', align: 'right', sortValue: r => r.rates.retryRate, render: r => formatPerEdit(r.rates.retryRate) },
	{ sortKey: 'selfCorrectionRate', label: 'Self-corr/edit', title: 'Average self-corrections (re-edits after other tool calls) per edit turn', align: 'right', sortValue: r => r.rates.selfCorrectionRate, render: r => formatPerEdit(r.rates.selfCorrectionRate) },
	{ sortKey: 'costPerCall', label: 'Cost/turn', title: 'Average estimated cost per turn (provider rates)', align: 'right', sortValue: r => r.rates.costPerCall, render: r => formatUnitCost(r.rates.costPerCall) },
	{ sortKey: 'costPerEdit', label: 'Cost/edit', title: 'Average estimated cost per edit turn (provider rates)', align: 'right', sortValue: r => r.rates.costPerEdit, render: r => formatUnitCost(r.rates.costPerEdit) },
	{ sortKey: 'outputTokensPerCall', label: 'Out tok/turn', title: 'Average output tokens per turn', align: 'right', sortValue: r => r.rates.outputTokensPerCall, render: r => r.rates.outputTokensPerCall === null ? '—' : formatCompact(Math.round(r.rates.outputTokensPerCall)) },
	{ sortKey: 'cacheHitRate', label: 'Cache hit', title: 'Cache-read share of input tokens', align: 'right', sortValue: r => r.rates.cacheHitRate, render: r => formatRatePercent(r.rates.cacheHitRate) },
];

function getEfficiencySortIndicator(column: EfficiencySortColumn): string {
	if (efficiencySortColumn !== column) { return ''; }
	return efficiencySortDirection === 'desc' ? ' ▼' : ' ▲';
}

function buildEfficiencyRows(usage: ModelEfficiencyUsage): EfficiencyRow[] {
	const rows: EfficiencyRow[] = Object.entries(usage).map(([model, counters]) => ({ model, counters, rates: deriveModelEfficiencyRates(counters) }));
	const col = EFFICIENCY_COLUMN_DEFS.find(c => c.sortKey === efficiencySortColumn) ?? EFFICIENCY_COLUMN_DEFS[1];
	rows.sort((a, b) => {
		const av = col.sortValue(a);
		const bv = col.sortValue(b);
		// Nulls (no data) always sort to the bottom regardless of direction.
		if (av === null && bv === null) { return 0; }
		if (av === null) { return 1; }
		if (bv === null) { return -1; }
		const cmp = typeof av === 'string' || typeof bv === 'string'
			? String(av).localeCompare(String(bv))
			: av - bv;
		return efficiencySortDirection === 'desc' ? -cmp : cmp;
	});
	return rows;
}

function buildModelEfficiencyTableHtml(): string {
	const usage = cachedModelEfficiency[efficiencyPeriod];
	if (!usage || Object.keys(usage).length === 0) {
		return '<div style="color: var(--text-secondary); font-size: 13px; padding: 16px;">No per-model efficiency data recorded for this period yet.</div>';
	}
	let rows = buildEfficiencyRows(usage);
	let hiddenNote = '';
	if (efficiencyFilterLowUsage) {
		const threshold = computeEfficiencyLowUsageThreshold(usage);
		if (threshold !== null) {
			const before = rows.length;
			rows = rows.filter(r => r.counters.calls > threshold);
			const hiddenCount = before - rows.length;
			if (hiddenCount > 0) {
				hiddenNote = `<div style="color:var(--text-secondary); font-size:11px; padding:4px 8px 2px;">${hiddenCount} model${hiddenCount === 1 ? '' : 's'} hidden (≤${threshold} turn${threshold === 1 ? '' : 's'})</div>`;
			}
		}
	}
	const tableRows = rows.map(r => {
		const cells = EFFICIENCY_COLUMN_DEFS.map(col => {
			const alignStyle = col.align === 'right' ? 'text-align:right;' : '';
			return `<td style="padding:6px 8px; border-bottom:1px solid var(--border-subtle); font-size:12px; ${alignStyle}">${col.render(r)}</td>`;
		}).join('');
		return `<tr>${cells}</tr>`;
	}).join('');
	const headerCells = EFFICIENCY_COLUMN_DEFS.map(col => {
		const alignStyle = col.align === 'right' ? ' text-align:right;' : '';
		return `<th class="sortable" data-eff-sort="${col.sortKey}" title="${col.title}" style="padding:6px 8px; cursor:pointer;${alignStyle}">${col.label}${getEfficiencySortIndicator(col.sortKey)}</th>`;
	}).join('');
	return `
		<div style="overflow-x:auto;">
		<table style="width:100%; border-collapse:collapse; min-width:900px;">
			<thead>
				<tr style="color:var(--text-secondary); font-size:11px; text-align:left;">${headerCells}</tr>
			</thead>
			<tbody>${tableRows}</tbody>
		</table>
		</div>
		${hiddenNote}`;
}

function buildModelEfficiencySectionHtml(stats: UsageAnalysisStats): string {
	cachedModelEfficiency = {
		today: stats.today.modelEfficiency,
		last30Days: stats.last30Days.modelEfficiency,
		month: stats.month.modelEfficiency,
	};
	return `
		<div class="section" id="section-model-efficiency">
			<div class="section-title"><span>🎯</span><span>Model Efficiency</span></div>
			<div class="section-subtitle">Compare models on quality and efficiency, not just cost — one-shot edit rate, retries, self-corrections, per-turn cost, and cache hit rate. Retry/self-correction detection needs structured tool-call data, so some editors show token metrics only.</div>
			<div id="model-efficiency-controls" style="display:flex; gap:6px; flex-wrap:wrap; margin:8px 0;"><span id="model-efficiency-period-selector"></span></div>
			<div style="margin:2px 0 8px 0;">
				<label style="display:inline-flex; align-items:center; gap:6px; font-size:12px; color:var(--text-secondary); cursor:pointer;" title="Shows only models above the 25th-percentile turn count (Q1). Uncheck to see all models.">
					<input type="checkbox" id="eff-filter-low-usage"${efficiencyFilterLowUsage ? ' checked' : ''} style="cursor:pointer;">
					Hide low-usage models
				</label>
			</div>
			<div id="model-efficiency-table">${buildModelEfficiencyTableHtml()}</div>
		</div>`;
}

function renderModelEfficiencyPeriodSelector(): void {
	const wrapper = document.getElementById('model-efficiency-period-selector');
	if (!wrapper) { return; }
	wrapper.replaceChildren();
	const { wrapper: selectorWrapper } = createPeriodSelector({
		selected: efficiencySelectedPeriod,
		disabled: ['last7', 'allTime'],
		disabledTitle: 'Not available for model efficiency',
		label: '',
		onChange: (value) => {
			const dataKey = EFFICIENCY_PERIOD_TO_DATA_KEY[value as Period];
			if (!dataKey) { return; }
			efficiencySelectedPeriod = value as Period;
			efficiencyPeriod = dataKey;
			rerenderModelEfficiencyTable();
		},
	});
	wrapper.append(selectorWrapper);
}

function rerenderModelEfficiencyTable(): void {
	const table = document.getElementById('model-efficiency-table');
	if (table) { setHtml(table, buildModelEfficiencyTableHtml()); }
}

function handleEfficiencySortClick(th: HTMLElement): void {
	const col = th.getAttribute('data-eff-sort') as EfficiencySortColumn | null;
	if (!col) { return; }
	if (efficiencySortColumn === col) {
		efficiencySortDirection = efficiencySortDirection === 'desc' ? 'asc' : 'desc';
	} else {
		efficiencySortColumn = col;
		efficiencySortDirection = col === 'model' ? 'asc' : 'desc';
	}
	rerenderModelEfficiencyTable();
}

/** Wires sortable headers and the low-usage filter for the Model Efficiency section (delegated, survives table re-renders). */
function setupModelEfficiencySection(): void {
	const section = document.getElementById('section-model-efficiency');
	if (!section) { return; }
	section.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		const th = target.closest<HTMLElement>('th[data-eff-sort]');
		if (th) { handleEfficiencySortClick(th); }
	});
	section.addEventListener('change', (e) => {
		const target = e.target as HTMLInputElement;
		if (target.id === 'eff-filter-low-usage') {
			efficiencyFilterLowUsage = target.checked;
			rerenderModelEfficiencyTable();
		}
	});
}

function buildToolsTabPanelHtml(
	stats: UsageAnalysisStats,
	allToolKeys: string[],
	allMcpToolKeys: string[],
	allMcpServerKeys: string[],
	allHighCostModels: string[],
	allLowCostModels: string[],
	allMediumCostModels: string[],
	allUnknownModels: string[],
): string {
	return `
		<div id="tab-panel-tools" class="tab-panel"${activeTab !== 'tools' ? ' style="display:none"' : ''}>
			<!-- Tool Calls Section -->
			<div class="section">
				<div class="section-title"><span>🔧</span><span>Tool Usage</span></div>
				<div class="section-subtitle">Functions and tools invoked by Copilot during interactions${hideAutomaticToolCalls ? ' (automatic tool calls hidden — disable "Hide Automatic Tool Calls" in settings to show them)' : ''}</div>
				<div class="three-column">
					<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Today</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.today.toolCalls.total)}</div>
						${renderToolsTable(unionFill(stats.today.toolCalls.byTool, allToolKeys), 10, lookupToolName, true)}
					</div>
				</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📆 Last 30 Days</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.last30Days.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.last30Days.toolCalls.byTool, allToolKeys), 10, lookupToolName, true)}
						</div>
					</div>
				<div>
					<h4 style="color: var(--text-primary); font-size: 13px; margin-bottom: 8px;">📅 Previous Month</h4>
					<div class="list">
						<div style="font-size: 14px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Total Tool Calls: ${formatNumber(stats.month.toolCalls.total)}</div>
							${renderToolsTable(unionFill(stats.month.toolCalls.byTool, allToolKeys), 10, lookupToolName, true)}
						</div>
					</div>
				</div>
			</div>

			${buildMcpToolsSectionHtml(stats, allMcpToolKeys, allMcpServerKeys)}
			${buildCurationSectionHtml(currentCurationAnalysis ?? stats.curationAnalysis)}
			<!-- Multi-Model Usage Section -->
			<div class="section">
				<div class="section-title"><span>🔀</span><span>Multi-Model Usage</span></div>
				<div class="section-subtitle">Track model diversity and switching patterns in your conversations</div>
				<div class="three-column">
					${renderMultiModelPeriod('📅 Today', stats.today.modelSwitching, allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
					${renderMultiModelPeriod('📆 Last 30 Days', stats.last30Days.modelSwitching, allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
					${renderMultiModelPeriod('📅 Previous Month', stats.month.modelSwitching, allLowCostModels, allMediumCostModels, allHighCostModels, allUnknownModels)}
				</div>
			</div>
		</div>`;
}

/**
 * Assigns the full dashboard HTML to `root`, isolating any failure that escapes the
 * per-section/per-tab safeSectionHtml wrapping in buildUsageRootHtml. On failure, falls back
 * to a minimal error state with a reload button instead of leaving the page on stale/blank
 * content. Returns true on success, false if the fallback error state was shown instead.
 */
function assignUsageRootHtml(root: HTMLElement, build: () => string): boolean {
	try {
		setHtml(root, build());
		return true;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(`[usage-webview] renderLayout failed: ${message}`);
		setHtml(root, `<div style="padding: 32px; text-align: center; font-size: 14px;">
			<div style="color: var(--vscode-foreground); opacity: 0.7; margin-bottom: 12px;">⚠️ Something went wrong rendering the dashboard.</div>
			${createRefreshButton().outerHTML}
		</div>`);
		return false;
	}
}

/**
 * Syncs module-level UI state (hygiene matrix, workspace paths, curation analysis cache) from
 * a fresh stats payload, and resolves the customization matrix to use for this render.
 */
function syncRenderLayoutState(stats: UsageAnalysisStats): WorkspaceCustomizationMatrix | null {
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
	// Persist curation analysis across refreshes — periodic updateStats may omit it
	if (stats.curationAnalysis) {
		currentCurationAnalysis = stats.curationAnalysis;
		traceCuration('renderLayout.curation.cached', {
			availableTools: currentCurationAnalysis.availableTools.length,
			unusedTools: currentCurationAnalysis.unusedTools.length,
		});
	} else {
		traceCurationOnce('render-no-curation-update', 'renderLayout.curation.notProvidedInUpdate');
	}
	return matrix;
}

function renderLayout(stats: UsageAnalysisStats): void {
	const root = document.getElementById('root');
	if (!root) {
		return;
	}

	const matrix = syncRenderLayoutState(stats);
	const customizationHtml = safeSectionHtml('Workspace Customization', () => buildCustomizationSectionHtml(matrix));
	// buildUsageAllKeysSets and the context-ref totals are cheap, pure aggregations over
	// already-validated stats — not worth isolating individually. buildUsageRootHtml (and each
	// tab/section within it) is isolated via safeSectionHtml / assignUsageRootHtml below.
	const allKeys = buildUsageAllKeysSets(stats);
	const todayTotalRefs = getTotalContextRefs(stats.today.contextReferences);
	const last30DaysTotalRefs = getTotalContextRefs(stats.last30Days.contextReferences);
	const thinkingEffortHtml = safeSectionHtml('Thinking Effort', () => buildThinkingEffortSectionHtml(stats));
	const sessionsSummaryHtml = `
		<!-- Summary Section -->
		<div class="section">
			<div class="section-title"><span>📈</span><span>Sessions Summary</span></div>
			<div class="stats-grid">
				<div class="stat-card"><div class="stat-label">📅 Today Sessions</div><div class="stat-value">${formatNumber(stats.today.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">📆 Last 30 Days Sessions</div><div class="stat-value">${formatNumber(stats.last30Days.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">📅 This Month Sessions</div><div class="stat-value">${formatNumber(stats.month.sessions)}</div></div>
				<div class="stat-card"><div class="stat-label">📅 Last Month Sessions</div><div class="stat-value">${formatNumber(stats.lastMonth.sessions)}</div></div>
			</div>
		</div>`;

	const rendered = assignUsageRootHtml(root, () => buildUsageRootHtml(
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
		allKeys.allHighCostModels,
		allKeys.allLowCostModels,
		allKeys.allMediumCostModels,
		allKeys.allUnknownModels,
	));
	if (!rendered) { return; }

	wireNavigationButtons();
	wireAboutInfoToggle();
	wireRepositoryButtons();
	wireCurationButtons();
	renderRepositoryHygienePanels();
	setupTabs();
	setupModelEfficiencySection();
	renderModelEfficiencyPeriodSelector();
	renderSessionsLookbackSelector();
	setupWorktreesHandlers();
	wireCopyButtons();
	// Initialize currentInsights from the stats and wire card buttons
	currentInsights = stats.insights ?? [];
	wireInsightCardButtons();
}

/** Wires up the collapsible "About This Dashboard" info box; the collapsed state is persisted via webview state. */
function wireAboutInfoToggle(): void {
	const toggle = document.getElementById('about-info-toggle');
	const body = document.getElementById('about-info-body');
	if (!toggle || !body) { return; }
	const chevron = toggle.querySelector('.info-box-chevron');
	const applyToggle = (): void => {
		aboutCollapsed = !aboutCollapsed;
		body.style.display = aboutCollapsed ? 'none' : '';
		toggle.setAttribute('aria-expanded', String(!aboutCollapsed));
		if (chevron) { chevron.textContent = aboutCollapsed ? '▸' : '▾'; }
		vscode.setState({ ...(vscode.getState() ?? {}), aboutCollapsed });
	};
	toggle.addEventListener('click', applyToggle);
	toggle.addEventListener('keydown', (event: KeyboardEvent) => {
		if (event.key === 'Enter' || event.key === ' ') {
			event.preventDefault();
			applyToggle();
		}
	});
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
	document.getElementById('btn-efficiency')?.addEventListener('click', () => {
		vscode.postMessage({ command: 'showEfficiency' });
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
	if (typeof message.data?.hideAutomaticToolCalls === 'boolean') {
		hideAutomaticToolCalls = message.data.hideAutomaticToolCalls;
	}
	const sanitized = sanitizeStats(message.data);
	if (sanitized) {
		_ulLoadingActive = false;
		// New stats invalidate any lazily-loaded lookback data; it is re-requested on demand.
		for (const key of Object.keys(recentSessionsCache)) {
			delete recentSessionsCache[key];
		}
		renderLayout(sanitized);
		setupSessionsTableSort();
		renderRepositoryHygienePanels();
		if (repoPrStatsData) { updateReposPrPanel(repoPrStatsData); }
		if (agentSessionsData) { updateAgentSessionsPanel(agentSessionsData); }
	} else {
		traceCurationOnce('update-invalid-sanitized', 'handleUpdateStats.sanitizeReturnedNull');
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

function handleLoadingStateMessage(message: any): boolean {
	switch (message.command) {
		case 'usageLoadingProgress':
			updateUsageLoadingProgress(message); return true;
		case 'usageRefreshing':
			clearLoadingTimeout();
			_ulLastStepIdx = 0;
			renderUsageLoadingState('Refreshing Usage Analysis');
			return true;
		case 'updateStatsError':
			clearLoadingTimeout();
			showLoadError('Failed to calculate usage analysis. Check the Output panel for details.');
			return true;
	}
	return false;
}

function handleExtensionMessage(message: any): void {
	if (handleLoadingStateMessage(message)) { return; }
	switch (message.command) {
		case 'repoAnalysisResults':
			displayRepoAnalysisResults(message.data, message.workspacePath); break;
		case 'repoAnalysisError':
			displayRepoAnalysisError(message.error, message.workspacePath); break;
		case 'repoAnalysisBatchComplete':
			handleBatchAnalysisComplete(); break;
		case 'updateStats':
			handleUpdateStats(message); break;
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
		case 'recentSessionsLoaded':
			handleRecentSessionsLoaded(message); break;
		case 'agentSessionsProgress':
			updateProgressPanel('#agent-sessions-content', 'agent-sessions-progress', 'Fetching agent sessions…', message.done as number, message.total as number);
			break;
		case 'updateInsights':
			handleUpdateInsights(message.insights); break;
		case 'switchTab':
			handleSwitchTab(message); break;
		default:
			handleWorktreeMessage(message); break;
	}
}

function handleSwitchTab(message: any): void {
	const btn = document.querySelector<HTMLButtonElement>(`.tab-button[data-tab="${String(message.tab)}"]`);
	btn?.click();
	if (message.anchor) {
		const anchor = document.getElementById(String(message.anchor));
		if (anchor) {
			// Use setTimeout to let the tab panel become visible before scrolling
			setTimeout(() => anchor.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
		}
	}
}

// Listen for messages from the extension
registerMessageHandler<any>((message) => { handleExtensionMessage(message); });

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
	setHtml(icon, statusBadgeHtml(emoji));
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
	setHtml(listPane, headerHtml + visibleWorkspaces.map((ws, idx) => {
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
	}).join(''));
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
		setHtml(detailsPane, `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px;">
				<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
					<div style="font-size: 11px; color: #fca5a5;">Repository: ${escapeHtml(workspaceName)}</div>
					<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
				</div>
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">❌ Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(record.error)}</div>
			</div>
		`);
		return;
	}

	setHtml(detailsPane, `
		<div style="padding: 12px; background: var(--bg-secondary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="display: flex; justify-content: space-between; align-items: center; gap: 8px; margin-bottom: 8px;">
				<div style="font-size: 12px; color: var(--text-secondary);">Repository: <span style="color: var(--text-primary); font-weight: 600; font-family: 'Courier New', monospace;">${escapeHtml(workspaceName)}</span></div>
				<vscode-button id="btn-switch-repository" style="min-width: 120px;">Switch Repository</vscode-button>
			</div>
			<div style="font-size: 11px; color: var(--text-muted);">No analysis data yet. Click Analyze in the list.</div>
		</div>
	`);
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
		setHtml(resultsHost, `
			<div style="padding: 12px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 6px; margin-bottom: 12px;">
				<div style="font-size: 12px; font-weight: 600; color: #ef4444; margin-bottom: 4px;">❌ Analysis Failed</div>
				<div style="font-size: 11px; color: #fca5a5;">${escapeHtml(error)}</div>
			</div>
		`);
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
	await import('@vscode-elements/elements/dist/vscode-button/index.js');

	// TOOL_NAME_MAP is imported at build-time from src/toolNames.json

	if (!initialData) {
		renderUsageLoadingState('Loading usage analysis...');
		// If data doesn't arrive within 30s, show a helpful hint (non-fatal)
		loadingTimeoutId = setTimeout(() => {
			const r = document.getElementById('root');
			if (r && r.querySelector('#usage-loading-card')) {
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
	setFormatLocale(initialData.locale);
	use24HourTime = initialData.use24HourTime !== false;
	hideAutomaticToolCalls = initialData.hideAutomaticToolCalls !== false;
	const savedColumns = initialData.sessionColumnSettings?.enabledColumns;
	if (Array.isArray(savedColumns)) {
		const valid = savedColumns.filter((c): c is SessionColumnId => (ALL_SESSION_COLUMN_IDS as string[]).includes(c));
		enabledSessionColumns = new Set(valid);
	}
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
