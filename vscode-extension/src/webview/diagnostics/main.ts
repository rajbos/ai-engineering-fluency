// Diagnostics Report webview with tabbed interface
import { navButtonsHtml } from "../shared/buttonConfig";
import { setHtml } from "../shared/domUtils";
import { wireExtensionPointButtons } from "../shared/extensionPoints";
import { escapeHtml, formatFileSize, getTimeSince, getEditorIcon } from "../shared/formatUtils";
import { createPeriodSelector, PERIOD_LABELS, type Period } from "../shared/periodSelector";
import { createViewStateManager } from "../shared/viewState";
// CSS imported as text via esbuild
import themeStyles from "../shared/theme.css";
import styles from "./styles.css";
import { getWindowData } from "../../../../src/webview/shared/dataLoader";

// Constants
const LOADING_PLACEHOLDER = "Loading...";
const SESSION_FILES_SECTION_REGEX =
  /Session File Locations \(first 20\):[\s\S]*?(?=\n\s*\n|={70})/;
const LOADING_MESSAGE = `⏳ Loading diagnostic data...

This may take a few moments depending on the number of session files.
The view will automatically update when data is ready.`;

import {
  ContextReferenceUsage,
  getContextRefsSummary,
  getTotalContextRefs,
} from "../shared/contextRefUtils";

type SessionFileDetails = {
  file: string;
  size: number;
  modified: string;
  interactions: number;
  tokens?: number;
  contextReferences: ContextReferenceUsage;
  firstInteraction: string | null;
  lastInteraction: string | null;
  editorSource: string;
  editorRoot?: string;
  editorName?: string;
  title?: string;
  repository?: string;
  parentInfo?: { uuid: string; name: string; sessionFile?: string } | null;
  childInfo?: Array<{ uuid: string; name: string; sessionFile?: string }>;
  totalChildCount?: number;
  /** Per-model input/output token breakdown (when model attribution data is available). */
  modelUsage?: { [model: string]: { inputTokens: number; outputTokens: number } };
};

type ModelUsageRow = {
  model: string;
  sessionCount: number;
  inputTokens: number;
  outputTokens: number;
  cachedReadTokens: number;
  cacheCreationTokens: number;
  cacheCreation1hTokens: number;
  estimatedCost: number;
};

type CacheInfo = {
  size: number;
  sizeInMB: number;
  lastUpdated: string | null;
  location: string;
  storagePath?: string | null;
};

type AzureStorageInfo = {
  enabled: boolean;
  isConfigured: boolean;
  storageAccount: string;
  subscriptionId: string;
  resourceGroup: string;
  aggTable: string;
  eventsTable: string;
  authMode: string;
  sharingProfile: string;
  lastSyncTime: string | null;
  deviceCount: number;
  sessionCount: number;
  recordCount: number | null;
};

type TeamServerInfo = {
  enabled: boolean;
  isConfigured: boolean;
  endpointUrl: string;
  sharingProfile: string;
  lastSyncTime: string | null;
  sessionCount: number;
};

type BackendStorageInfo = {
  azure: AzureStorageInfo;
  teamServer: TeamServerInfo;
};

type GlobalStateCounters = {
  openCount: number;
  unknownMcpOpenCount: number;
  fluencyBannerDismissed: boolean;
  unknownMcpDismissedVersion: string;
};

type GitHubAuthStatus = {
  authenticated: boolean;
  username?: string;
};

type SessionFolder = {
  dir: string;
  count: number;
  editorName?: string;
};

type StatusBarShowOption = 'none' | 'today' | 'last30days' | 'currentMonth' | 'both' | 'todayAndCurrentMonth';

type DisplaySettings = {
  showTokens: StatusBarShowOption;
  showCost: StatusBarShowOption;
  monthlyBudget?: number;
};

type QuotaEntitlements = {
  premium_interactions?: number;
  completions?: number;
};

type CopilotCliOtelComparisonSession = {
  file: string;
  sessionId: string;
  baselineTokens: number;
  otelTokens: number;
  delta: number;
  models: string[];
  lastActivity: string | null;
};

type CopilotCliOtelComparison = {
  otelDirExists: boolean;
  otelFileCount: number;
  otelSessionsIndexed: number;
  sessionsChecked: number;
  sessionsMatched: number;
  totalBaselineTokens: number;
  totalOtelTokens: number;
  deltaTokens: number;
  sessions: CopilotCliOtelComparisonSession[];
};

type DiagnosticsData = {
  report: string;
  sessionFiles: { file: string; size: number; modified: string }[];
  detailedSessionFiles?: SessionFileDetails[];
  cacheInfo?: CacheInfo;
  backendStorageInfo?: BackendStorageInfo;
  backendConfigured?: boolean;
  isDebugMode?: boolean;
  globalStateCounters?: GlobalStateCounters;
  githubAuth?: GitHubAuthStatus;
  sessionFolders?: SessionFolder[];
  displaySettings?: DisplaySettings;
  quotaEntitlements?: QuotaEntitlements;
  toolCallStats?: { total: number; byTool: { [key: string]: number }; outputTokensByTool?: { [key: string]: number } } | null;
  skillCallStats?: { total: number; byName: { [key: string]: number } } | null;
  toolFamilies?: ToolFamilyConfig[];
  otelComparison?: CopilotCliOtelComparison | null;
};

type ToolFamilyConfig = {
  id: string;
  name: string;
  builtIn: string[];
  alternatives: string[];
  description?: string;
};

type OtelDeltaPeriod = "all" | "today" | "yesterday" | "week" | "month";

type DiagnosticsViewState = {
  activeTab?: string;
  activeSubtab?: string;
  otelDeltaPeriod?: OtelDeltaPeriod;
  shareCardPeriod?: Period;
};

type FolderFileResult = {
  file: string;
  size: number;
  modified: string;
  interactions: number;
  tokens: number;
  actualTokens: number;
};

declare function acquireVsCodeApi<TState = DiagnosticsViewState>(): {
  postMessage: (message: unknown) => void;
  setState: (newState: TState) => void;
  getState: () => TState | undefined;
};

const vscode = acquireVsCodeApi<DiagnosticsViewState>();
const initialData = getWindowData<DiagnosticsData>('__INITIAL_DIAGNOSTICS__');

const diagState = createViewStateManager<DiagnosticsViewState>(vscode, {
  activeTab: undefined,
  activeSubtab: undefined,
  otelDeltaPeriod: "all",
  shareCardPeriod: "last14",
});

let currentOtelComparison: CopilotCliOtelComparison | null | undefined;
let currentOtelDeltaPeriod: OtelDeltaPeriod = diagState.restore().otelDeltaPeriod ?? "all";

// Periods offered by the Share Card's period selector, in display order.
const SHARE_CARD_PERIOD_ORDER: Period[] = ["last7", "last14", "last30", "last90", "allTime"];
let currentShareCardPeriod: Period = diagState.restore().shareCardPeriod ?? "last14";

// Sorting and filtering state
let currentSortColumn: "lastInteraction" | "size" | "tokens" | "interactions" | "contextRefs" = "lastInteraction";
let currentSortDirection: "asc" | "desc" = "desc";
let currentEditorFilter: string | null = null; // null = show all
let currentContextRefFilter: keyof ContextReferenceUsage | null = null; // null = show all
let hideEmptySessions = true; // hide sessions with 0 interactions by default
let showOnlyUnattributed = false; // filter to only sessions with unattributed tokens

// Tool analysis table sort state
let toolSortColumn: "tool" | "calls" | "total" | "avg" = "avg";
let toolSortDir: "asc" | "desc" = "desc";
let storedToolFamilies: ToolFamilyConfig[] | undefined;

// Render state (promoted to module level so all setup functions can be top-level)
let storedDetailedFiles: SessionFileDetails[] = [];
let isLoading = true;
let currentBackendInfo: BackendStorageInfo | undefined;
let currentGithubAuth: GitHubAuthStatus | undefined;
let currentModelUsageTimeRange = "all";

function removeSessionFilesSection(reportText: string): string {
  return reportText.replace(SESSION_FILES_SECTION_REGEX, "");
}

function formatDate(isoString: string | null): string {
  if (!isoString) {
    return "N/A";
  }
  try {
    return escapeHtml(new Date(isoString).toLocaleString());
  } catch {
    return escapeHtml(isoString);
  }
}

function sanitizeNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) {
    return "0";
  }
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return "0";
  }
  return Math.floor(n).toString();
}

function formatTokenCount(value: number | undefined | null): string {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n) || n === 0) { return "0"; }
  if (n >= 1_000_000_000) { return `${(n / 1_000_000_000).toFixed(1)}B`; }
  if (n >= 1_000_000) { return `${(n / 1_000_000).toFixed(1)}M`; }
  if (n >= 1_000) { return `${(n / 1_000).toFixed(1)}K`; }
  return Math.floor(n).toString();
}

/**
 * Build a DOM element showing all candidate paths the extension considers,
 * with their existence status. Helps users understand why data may be missing.
 */
type CandidatePath = { path: string; exists: boolean; source: string };

function buildCandidatePathRow(cp: CandidatePath, tbody: HTMLElement): void {
  const row = document.createElement("tr");
  if (!cp.exists) { row.style.opacity = "0.5"; }
  const statusCell = document.createElement("td");
  statusCell.textContent = cp.exists ? "✅" : "❌";
  statusCell.style.textAlign = "center";
  const sourceCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = getEditorBadgeClass(cp.source);
  badge.textContent = `${getEditorIcon(cp.source)} ${cp.source}`;
  sourceCell.appendChild(badge);
  const pathCell = document.createElement("td");
  pathCell.setAttribute("title", cp.path);
  pathCell.style.fontFamily = "var(--vscode-editor-font-family, monospace)";
  pathCell.style.fontSize = "12px";
  pathCell.textContent = cp.path;
  row.append(statusCell, sourceCell, pathCell);
  tbody.appendChild(row);
}

function buildCrushGroupRow(crushEntries: CandidatePath[], tbody: HTMLElement): void {
  const anyExist = crushEntries.some((cp) => cp.exists);
  const row = document.createElement("tr");
  if (!anyExist) { row.style.opacity = "0.5"; }
  const statusCell = document.createElement("td");
  statusCell.textContent = anyExist ? "✅" : "❌";
  statusCell.style.textAlign = "center";
  const sourceCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = getEditorBadgeClass("Crush");
  badge.textContent = `${getEditorIcon("Crush")} Crush`;
  sourceCell.appendChild(badge);
  const pathCell = document.createElement("td");
  pathCell.style.fontFamily = "var(--vscode-editor-font-family, monospace)";
  pathCell.style.fontSize = "12px";
  pathCell.style.lineHeight = "1.6";
  for (const cp of crushEntries) {
    const line = document.createElement("div");
    line.style.opacity = cp.exists ? "1" : "0.5";
    line.title = cp.path;
    line.textContent = `${cp.exists ? "✅" : "❌"} ${cp.path}`;
    pathCell.appendChild(line);
  }
  row.append(statusCell, sourceCell, pathCell);
  tbody.appendChild(row);
}

function buildCandidatePathsElement(
  candidatePaths: CandidatePath[],
): HTMLElement {
  const container = document.createElement("div");
  container.className = "candidate-paths-table";
  const heading = document.createElement("h4");
  heading.textContent = "Scanned Paths (all candidate locations):";
  container.appendChild(heading);
  const description = document.createElement("p");
  description.style.cssText = "color: #999; font-size: 12px; margin: 4px 0 8px 0;";
  description.textContent = "These are all the paths the extension checks for session files. Paths marked with ✅ exist on this system.";
  container.appendChild(description);
  const tableContainer = document.createElement("div");
  tableContainer.className = "table-container";
  container.appendChild(tableContainer);
  const table = document.createElement("table");
  table.className = "session-table";
  tableContainer.appendChild(table);
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  for (const text of ["Status", "Source", "Path"]) {
    const th = document.createElement("th"); th.textContent = text; headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");
  table.appendChild(tbody);
  const sorted = [...candidatePaths].sort((a, b) => a.exists !== b.exists ? (a.exists ? -1 : 1) : a.source.localeCompare(b.source));
  const crushEntries = sorted.filter((cp) => cp.source.toLowerCase().includes("crush"));
  const otherEntries = sorted.filter((cp) => !cp.source.toLowerCase().includes("crush"));
  for (const cp of otherEntries) { buildCandidatePathRow(cp, tbody); }
  if (crushEntries.length > 0) { buildCrushGroupRow(crushEntries, tbody); }
  return container;
}

function getFileName(filePath: string): string {
  const parts = filePath.split(/[/\\]/);
  return parts[parts.length - 1];
}

/**
 * Extract a friendly display name from a repository URL.
 * Supports HTTPS, SSH, and git:// URLs.
 * @param repoUrl The full repository URL
 * @returns A shortened display name like "owner/repo"
 */
function getRepoDisplayName(repoUrl: string): string {
  if (!repoUrl) {
    return "";
  }

  // Remove .git suffix if present
  let url = repoUrl.replace(/\.git$/, "");

  // Handle SSH URLs like git@github.com:owner/repo
  if (url.includes("@") && url.includes(":")) {
    const colonIndex = url.lastIndexOf(":");
    const atIndex = url.lastIndexOf("@");
    if (colonIndex > atIndex) {
      return url.substring(colonIndex + 1);
    }
  }

  // Handle HTTPS/git URLs - extract path after the host
  try {
    // Handle URLs with explicit protocol
    if (url.includes("://")) {
      const urlObj = new URL(url);
      const pathParts = urlObj.pathname.split("/").filter((p) => p);
      if (pathParts.length >= 2) {
        return `${pathParts[pathParts.length - 2]}/${pathParts[pathParts.length - 1]}`;
      }
      return urlObj.pathname.replace(/^\//, "");
    }
  } catch {
    // URL parsing failed, return as-is
  }

  // Fallback: return the last part of the path
  const parts = url.split("/").filter((p) => p);
  if (parts.length >= 2) {
    return `${parts[parts.length - 2]}/${parts[parts.length - 1]}`;
  }
  return url;
}

function getEditorBadgeClass(editor: string): string {
  const lower = editor.toLowerCase();
  // MS Scout must be checked before generic 'copilot' to avoid misclassification.
  if (lower.includes("ms scout") || lower.includes("microsoft scout")) {
    return "editor-badge editor-badge-ms-scout";
  }
  if (lower.includes("visual studio")) {
    return "editor-badge editor-badge-vs";
  }
  if (lower.includes("jetbrains")) {
    return "editor-badge editor-badge-jetbrains";
  }
  if (lower.includes("mistral")) {
    return "editor-badge editor-badge-mistral-vibe";
  }
  // Antigravity must be checked before gemini (both contain 'gemini' in their path)
  if (lower.includes("antigravity")) {
    return "editor-badge editor-badge-antigravity";
  }
  if (lower.includes("gemini")) {
    return "editor-badge editor-badge-gemini-cli";
  }
  if (lower.includes("crush")) {
    return "editor-badge editor-badge-crush";
  }
  if (lower.includes("cursor")) {
    return "editor-badge editor-badge-cursor";
  }
  // Exact match required: 'copilot' contains the substring 'pi' and would false-positive.
  if (lower === 'pi') {
    return "editor-badge editor-badge-pi";
  }
  return "editor-badge";
}


function getSortValue(file: SessionFileDetails, column: typeof currentSortColumn): number {
  switch (column) {
    case 'size': return file.size || 0;
    case 'tokens': return file.tokens || 0;
    case 'interactions': return file.interactions || 0;
    case 'contextRefs': return getTotalContextRefs(file.contextReferences);
    default: return 0;
  }
}

function compareSessionFiles(a: SessionFileDetails, b: SessionFileDetails): number {
  if (currentSortColumn === "lastInteraction") {
    const aVal = a.lastInteraction;
    const bVal = b.lastInteraction;
    if (!aVal && !bVal) { return 0; }
    if (!aVal) { return 1; }
    if (!bVal) { return -1; }
    const aNum = new Date(aVal).getTime();
    const bNum = new Date(bVal).getTime();
    return currentSortDirection === "desc" ? bNum - aNum : aNum - bNum;
  }
  const aNum = getSortValue(a, currentSortColumn);
  const bNum = getSortValue(b, currentSortColumn);
  if (aNum === 0 && bNum === 0) { return 0; }
  return currentSortDirection === "desc" ? bNum - aNum : aNum - bNum;
}

function groupChildrenAfterParents(
  sorted: SessionFileDetails[],
  byFile: Map<string, SessionFileDetails>,
): SessionFileDetails[] {
  const placed = new Set<string>();
  const result: SessionFileDetails[] = [];
  for (const f of sorted) {
    if (placed.has(f.file)) { continue; }
    result.push(f);
    placed.add(f.file);
    for (const childRef of f.childInfo ?? []) {
      if (!childRef.sessionFile) { continue; }
      const childDetails = byFile.get(childRef.sessionFile);
      if (childDetails && !placed.has(childDetails.file)) {
        result.push(childDetails);
        placed.add(childDetails.file);
      }
    }
  }
  return result;
}

function sortSessionFiles(files: SessionFileDetails[]): SessionFileDetails[] {
  const sorted = [...files].sort(compareSessionFiles);
  const byFile = new Map<string, SessionFileDetails>();
  for (const f of sorted) { byFile.set(f.file, f); }
  return groupChildrenAfterParents(sorted, byFile);
}

function getSortIndicator(column: typeof currentSortColumn): string {
  if (currentSortColumn !== column) {
    return "";
  }
  return currentSortDirection === "desc" ? " ▼" : " ▲";
}

function getEditorStats(files: SessionFileDetails[]): {
  [key: string]: { count: number; interactions: number };
} {
  const stats: { [key: string]: { count: number; interactions: number } } = {};
  for (const sf of files) {
    const editor = sf.editorName || sf.editorSource || "Unknown";
    if (!stats[editor]) {
      stats[editor] = { count: 0, interactions: 0 };
    }
    stats[editor].count++;
    stats[editor].interactions += sf.interactions;
  }
  return stats;
}

function safeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  // Always convert to string and escape HTML to avoid XSS when inserting into innerHTML.
  return escapeHtml(String(value));
}

type ContextRefCounts = { file: number; symbol: number; selection: number; implicitSelection: number; codebase: number; workspace: number; terminal: number; vscode: number; copilotInstructions: number; agentsMd: number };
type FilteredSessionResult = { filteredFiles: SessionFileDetails[]; zeroInteractionCount: number };

/** Returns the number of tokens not attributed to any model (i.e. missing from modelUsage). */
function getUnattributedTokens(sf: SessionFileDetails): number {
  const tokens = sf.tokens || 0;
  if (tokens === 0 || !sf.modelUsage) { return 0; }
  const attributed = Object.values(sf.modelUsage).reduce((s, m) => s + m.inputTokens + m.outputTokens, 0);
  return attributed > 0 ? Math.max(0, tokens - attributed) : 0;
}

function applySessionFilters(detailedFiles: SessionFileDetails[]): FilteredSessionResult {
  let filteredFiles = currentEditorFilter ? detailedFiles.filter((sf) => (sf.editorName || sf.editorSource) === currentEditorFilter) : detailedFiles;
  if (currentContextRefFilter) {
    filteredFiles = filteredFiles.filter((sf) => { const value = sf.contextReferences[currentContextRefFilter!]; return typeof value === "number" && value > 0; });
  }
  if (showOnlyUnattributed) { filteredFiles = filteredFiles.filter(sf => getUnattributedTokens(sf) > 1000); }
  const zeroInteractionCount = filteredFiles.filter(sf => sf.interactions === 0).length;
  if (hideEmptySessions && zeroInteractionCount === filteredFiles.length && filteredFiles.length > 0) { hideEmptySessions = false; }
  if (hideEmptySessions) { filteredFiles = filteredFiles.filter(sf => sf.interactions > 0); }
  return { filteredFiles, zeroInteractionCount };
}

function aggregateContextRefs(filteredFiles: SessionFileDetails[]): ContextRefCounts {
  return filteredFiles.reduce((agg, sf) => {
    const r = sf.contextReferences;
    agg.file += r.file; agg.symbol += r.symbol; agg.selection += r.selection; agg.implicitSelection += r.implicitSelection;
    agg.codebase += r.codebase; agg.workspace += r.workspace; agg.terminal += r.terminal; agg.vscode += r.vscode;
    agg.copilotInstructions += r.copilotInstructions; agg.agentsMd += r.agentsMd;
    return agg;
  }, { file: 0, symbol: 0, selection: 0, implicitSelection: 0, codebase: 0, workspace: 0, terminal: 0, vscode: 0, copilotInstructions: 0, agentsMd: 0 });
}

function buildEditorPanelsHtml(detailedFiles: SessionFileDetails[], editorStats: Record<string, { count: number; interactions: number }>, editors: string[]): string {
  return `<div class="editor-filter-panels">
    <div class="editor-panel ${currentEditorFilter === null ? "active" : ""}" data-editor=""><div class="editor-panel-icon">🌐</div><div class="editor-panel-name">All Editors</div><div class="editor-panel-stats">${detailedFiles.length} sessions</div></div>
    ${editors.map((editor) => `<div class="editor-panel ${currentEditorFilter === editor ? "active" : ""}" data-editor="${escapeHtml(editor)}"><div class="editor-panel-icon">${getEditorIcon(editor)}</div><div class="editor-panel-name">${escapeHtml(editor)}</div><div class="editor-panel-stats">${editorStats[editor].count} sessions · ${editorStats[editor].interactions} interactions</div></div>`).join("")}
  </div>`;
}

function buildSessionSummaryCardsHtml(filteredFiles: SessionFileDetails[], allFiles: SessionFileDetails[], totalInteractions: number, totalTokens: number, totalContextRefs: number, agg: ContextRefCounts, zeroInteractionCount: number): string {
  const mkRef = (key: keyof ContextRefCounts, icon: string, label: string) => agg[key] > 0 ? `<div class="context-ref-filter ${currentContextRefFilter === key ? "active" : ""}" data-ref-type="${key}">${icon} ${label} ${agg[key]}</div>` : "";
  const unattributedCount = allFiles.filter(sf => getUnattributedTokens(sf) > 1000).length;
  const unattributedCheckbox = unattributedCount > 0
    ? `<label class="empty-sessions-toggle" title="Sessions where some debug-log tokens cannot be assigned to a specific model — may indicate incomplete model attribution in the debug log"><input type="checkbox" id="show-only-unattributed" ${showOnlyUnattributed ? 'checked' : ''}>⚠️ Show only sessions with unattributed tokens<span class="hidden-count">(${unattributedCount} session${unattributedCount === 1 ? '' : 's'})</span></label>`
    : '';
  return `<div class="summary-cards">
    <div class="summary-card"><div class="summary-label">📁 ${currentEditorFilter ? "Filtered" : "Total"} Sessions</div><div class="summary-value">${filteredFiles.length}</div></div>
    <div class="summary-card"><div class="summary-label">💬 Interactions</div><div class="summary-value">${totalInteractions}</div></div>
    <div class="summary-card"><div class="summary-label">🪙 Tokens</div><div class="summary-value" title="${totalTokens.toLocaleString()} tokens">${formatTokenCount(totalTokens)}</div></div>
    <div class="summary-card"><div class="summary-label">🔗 Context References</div><div class="summary-value">${safeText(totalContextRefs)}</div><div class="summary-sub">${totalContextRefs === 0 ? "None" : ""}${mkRef("file","","#file")}${mkRef("symbol","","#sym")}${mkRef("implicitSelection","","implicit")}${mkRef("copilotInstructions","📋","instructions")}${mkRef("agentsMd","🤖","agents")}${mkRef("workspace","","@workspace")}${mkRef("vscode","","@vscode")}</div></div>
    <div class="summary-card"><div class="summary-label">📅 Time Range</div><div class="summary-value">Last 14 days</div></div>
  </div>
  <div class="filter-options"><label class="empty-sessions-toggle"><input type="checkbox" id="hide-empty-sessions" ${hideEmptySessions ? 'checked' : ''}>Hide sessions with 0 interactions${zeroInteractionCount > 0 ? `<span class="hidden-count">(${zeroInteractionCount} hidden)</span>` : ''}</label>${unattributedCheckbox}</div>`;
}

function buildHierarchyBadgesHtml(sf: SessionFileDetails): string {
  let html = '';
  if (sf.parentInfo) {
    const parentTitle = escapeHtml(sf.parentInfo.name.length > 30 ? sf.parentInfo.name.substring(0, 30) + '…' : sf.parentInfo.name);
    const linkAttr = sf.parentInfo.sessionFile
      ? ` href="#" class="session-hierarchy-badge hierarchy-parent session-file-link" data-file="${encodeURIComponent(sf.parentInfo.sessionFile)}"`
      : ` class="session-hierarchy-badge hierarchy-parent"`;
    html += `<a${linkAttr} title="Parent session: ${escapeHtml(sf.parentInfo.name)}">↑ Parent: ${parentTitle}</a>`;
  }
  if (sf.totalChildCount && sf.totalChildCount > 0) {
    const count = sf.totalChildCount;
    const label = count === 1 ? '1 child session' : `${count} child sessions`;
    html += `<span class="session-hierarchy-badge hierarchy-children" title="${label}">↓ ${count} ${count === 1 ? 'Child' : 'Children'}</span>`;
  }
  return html ? `<div class="session-hierarchy-badges">${html}</div>` : '';
}

/** Returns a warning badge HTML string when the session has significant unattributed tokens. */
function buildUnattributedBadge(sf: SessionFileDetails): string {
  const unattributed = getUnattributedTokens(sf);
  if (unattributed <= 1000) { return ''; }
  const pct = Math.round(unattributed / (sf.tokens || 1) * 100);
  return ` <span title="⚠️ ${unattributed.toLocaleString()} tokens (~${pct}%) not attributed to any model — debug log events without a model field" style="color:#f59e0b; cursor:help; font-size:0.9em;">⚠️</span>`;
}

function buildSessionTableHtml(sortedFiles: SessionFileDetails[]): string {
  const rows = sortedFiles.map((sf, idx) => {
    const editorLabel = sf.editorName || sf.editorSource;
    const isChild = !!sf.parentInfo;
    const rawTitleHtml = sf.title ? `<a href="#" class="session-file-link" data-file="${encodeURIComponent(sf.file)}" title="${escapeHtml(sf.title)}">${escapeHtml(sf.title.length > 40 ? sf.title.substring(0, 40) + "..." : sf.title)}</a>` : `<a href="#" class="session-file-link empty-session-link" data-file="${encodeURIComponent(sf.file)}" title="Empty session">(Empty session)</a>`;
    const titleHtml = isChild ? `<span class="child-title-indent">${rawTitleHtml}</span>` : rawTitleHtml;
    const hierarchyBadges = buildHierarchyBadgesHtml(sf);
    const repoLabel = sf.repository ? escapeHtml(getRepoDisplayName(sf.repository)) : (sf.file.includes('session-store.db') ? '<span style="color: #888; font-style: italic;">No workspace</span>' : '<span style="color: #666;">—</span>');
    const repoTitle = sf.repository ? escapeHtml(sf.repository) : (sf.file.includes('session-store.db') ? 'Chat session — no workspace connected' : 'No repository detected');
    const isUnknownEditor = (sf.editorName || sf.editorSource || "Unknown") === "Unknown";
    const rowClass = isChild ? ' class="child-session-row"' : '';
    return `<tr${rowClass}><td>${idx + 1}</td><td><span class="${getEditorBadgeClass(editorLabel)}" title="${escapeHtml(sf.editorSource)}">${getEditorIcon(editorLabel)} ${escapeHtml(editorLabel)}</span></td><td class="session-title" title="${sf.title ? escapeHtml(sf.title) : "Empty session"}">${hierarchyBadges}${titleHtml}</td><td class="repository-cell" title="${repoTitle}">${repoLabel}</td><td>${formatFileSize(sf.size)}</td><td title="${Number(sf.tokens || 0).toLocaleString()} tokens">${formatTokenCount(sf.tokens)}${buildUnattributedBadge(sf)}</td><td>${sanitizeNumber(sf.interactions)}</td><td title="${escapeHtml(getContextRefsSummary(sf.contextReferences))}">${sanitizeNumber(getTotalContextRefs(sf.contextReferences))}</td><td>${formatDate(sf.lastInteraction)}</td><td><a href="#" class="view-formatted-link" data-file="${encodeURIComponent(sf.file)}" title="View formatted JSONL file">📄 View</a>${isUnknownEditor ? ` <a href="#" class="report-editor-link" data-path="${encodeURIComponent(sf.file)}" title="Report this unknown path so we can add editor support">📢 Report</a>` : ""}</td></tr>`;
  }).join("");
  return `<div class="table-container"><table class="session-table"><thead><tr><th>#</th><th>Editor</th><th>Title</th><th>Repository</th><th class="sortable" data-sort="size">Size${getSortIndicator("size")}</th><th class="sortable" data-sort="tokens">Tokens${getSortIndicator("tokens")}</th><th class="sortable" data-sort="interactions">Interactions${getSortIndicator("interactions")}</th><th class="sortable" data-sort="contextRefs">Context Refs${getSortIndicator("contextRefs")}</th><th class="sortable" data-sort="lastInteraction">Last Interaction${getSortIndicator("lastInteraction")}</th><th>Actions</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderSessionTable(
  detailedFiles: SessionFileDetails[],
  isLoading: boolean = false,
): string {
  if (isLoading) { return `<div class="loading-state"><div class="loading-spinner">⏳</div><div class="loading-text">Loading session files...</div><div class="loading-subtext" id="session-loading-subtext">Analyzing up to 500 files from the last 14 days</div></div>`; }
  if (detailedFiles.length === 0) { return '<p style="color: #999;">No session files with activity in the last 14 days.</p>'; }
  const editorStats = getEditorStats(detailedFiles);
  const editors = Object.keys(editorStats).sort();
  const { filteredFiles, zeroInteractionCount } = applySessionFilters(detailedFiles);
  const totalInteractions = filteredFiles.reduce((sum, sf) => sum + Number(sf.interactions || 0), 0);
  const totalTokens = filteredFiles.reduce((sum, sf) => sum + Number(sf.tokens || 0), 0);
  const totalContextRefs = filteredFiles.reduce((sum, sf) => sum + getTotalContextRefs(sf.contextReferences), 0);
  const agg = aggregateContextRefs(filteredFiles);
  const sortedFiles = sortSessionFiles(filteredFiles);
  return `${buildEditorPanelsHtml(detailedFiles, editorStats, editors)}${buildSessionSummaryCardsHtml(filteredFiles, detailedFiles, totalInteractions, totalTokens, totalContextRefs, agg, zeroInteractionCount)}${buildSessionTableHtml(sortedFiles)}`;
}

function counterRow(key: string, label: string, value: number): string {
  return `
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${escapeHtml(label)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="number" class="debug-counter-input" data-key="${escapeHtml(key)}" value="${value}" min="0" step="1"
          style="width:70px; background: var(--vscode-input-background); color: var(--vscode-input-foreground); border: 1px solid var(--vscode-input-border); padding: 2px 6px; font-family: var(--vscode-editor-font-family, monospace);" />
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-counter-set" data-key="${escapeHtml(key)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`;
}

function stringRow(key: string, label: string, value: string): string {
  const display = value ? `✅ ${escapeHtml(value)}` : '❌ (not set)';
  return `
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${escapeHtml(label)}</td>
      <td style="padding: 6px 8px 6px 0;" colspan="2">
        <span style="font-family: var(--vscode-editor-font-family, monospace);">${display}</span>
      </td>
    </tr>`;
}

function flagRow(key: string, label: string, value: boolean): string {
  return `
    <tr>
      <td style="padding: 6px 12px 6px 0; color: var(--vscode-descriptionForeground); white-space: nowrap;">${escapeHtml(label)}</td>
      <td style="padding: 6px 8px 6px 0;">
        <input type="checkbox" class="debug-flag-input" data-key="${escapeHtml(key)}" ${value ? 'checked' : ''} />
        <span style="margin-left:6px; font-family: var(--vscode-editor-font-family, monospace);">${value ? '✅ true' : '❌ false'}</span>
      </td>
      <td style="padding: 6px 0;">
        <button class="button secondary debug-flag-set" data-key="${escapeHtml(key)}" style="padding: 2px 10px; font-size: 12px;">Set</button>
      </td>
    </tr>`;
}

/** Rolling lookback (in days) for each period the Share Card period selector offers. Periods absent from
 * this map (e.g. "allTime") are treated as "no filtering". */
const SHARE_CARD_PERIOD_DAYS: Partial<Record<Period, number>> = { last7: 7, last14: 14, last30: 30, last90: 90 };

/** Returns the sessions from `detailedFiles` whose last interaction falls within `period` (allTime = no filtering). */
function filterFilesByShareCardPeriod(detailedFiles: SessionFileDetails[], period: Period, now: Date = new Date()): SessionFileDetails[] {
  const days = SHARE_CARD_PERIOD_DAYS[period];
  if (days === undefined) { return detailedFiles; } // allTime (or any unmapped period): no filtering
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - days);
  return detailedFiles.filter((sf) => {
    if (!sf.lastInteraction) { return false; }
    const activity = new Date(sf.lastInteraction);
    return !Number.isNaN(activity.getTime()) && activity >= cutoff && activity <= now;
  });
}

/** Lowercase, human-readable phrase describing a Share Card period, for use mid-sentence. */
function shareCardPeriodPhrase(period: Period): string {
  return period === "allTime" ? "of all time" : `in the ${PERIOD_LABELS[period].toLowerCase()}`;
}

/** Builds the plain-text version of the share summary, used by the "Copy Summary Text" button. */
function buildShareSummaryText(
  editors: string[],
  editorStats: Record<string, { count: number; interactions: number }>,
  totalSessions: number,
  totalInteractions: number,
  totalTokens: number,
  period: Period,
): string {
  const editorList = editors
    .map((editor) => `${getEditorIcon(editor)} ${editor} (${editorStats[editor].count})`)
    .join(", ");
  return `My AI Coding Toolbox — ${editors.length} editor${editors.length === 1 ? "" : "s"} detected: ${editorList}. ` +
    `${totalSessions} sessions, ${totalInteractions} interactions, ${formatTokenCount(totalTokens)} tokens ${shareCardPeriodPhrase(period)}. #AIEngineeringFluency`;
}

/** Renders a screenshot-friendly "Share Card" tab summarizing the detected editors — meant to be
 * shared in social media posts, mirroring the visual style of the startup loading screen. */
function renderShareCardTab(detailedFiles: SessionFileDetails[], isLoadingSessions: boolean = false): string {
  if (isLoadingSessions) {
    return `<div id="tab-share" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">📸 Share Card</div>
        <div>A snapshot of your AI coding toolbox — screenshot this card to share your editor mix on social media.</div>
      </div>
      <div class="loading-state"><div class="loading-spinner">⏳</div><div class="loading-text">Loading session files...</div><div class="loading-subtext" id="share-loading-subtext">Analyzing up to 500 files from the last 14 days</div></div>
    </div>`;
  }
  if (detailedFiles.length === 0) {
    return `<div id="tab-share" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">📸 Share Card</div>
        <div>No session activity found yet. Once you have some AI coding sessions, a shareable summary card will appear here.</div>
      </div>
    </div>`;
  }
  const period = currentShareCardPeriod;
  const filteredFiles = filterFilesByShareCardPeriod(detailedFiles, period);
  const editorStats = getEditorStats(filteredFiles);
  const editors = Object.keys(editorStats).sort((a, b) => editorStats[b].count - editorStats[a].count);
  const totalSessions = filteredFiles.length;
  const totalInteractions = filteredFiles.reduce((sum, sf) => sum + Number(sf.interactions || 0), 0);
  const totalTokens = filteredFiles.reduce((sum, sf) => sum + Number(sf.tokens || 0), 0);
  const pills = editors
    .map((editor) => `<div class="share-pill"><span>${getEditorIcon(editor)}</span><span>${escapeHtml(editor)}</span><span class="share-pill-count">${editorStats[editor].count}</span></div>`)
    .join("");
  const emptyPeriodNotice = totalSessions === 0
    ? `<div style="margin-top: 8px; font-size: 12px; color: var(--text-muted);">No session activity in this period. Try a wider range.</div>`
    : "";
  return `<div id="tab-share" class="tab-content">
    <div class="info-box">
      <div class="info-box-title">📸 Share Card</div>
      <div>A snapshot of your AI coding toolbox — screenshot this card to share your editor mix on social media.</div>
    </div>
    <div class="share-card-controls" style="margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 12px; color: var(--text-muted);">Period:</span>
      <span id="share-card-period-selector"></span>
    </div>
    <div class="share-card">
      <div class="share-badge">🤖 AI Engineering Fluency</div>
      <div class="share-title">My AI Coding Toolbox</div>
      <div class="share-subtitle">${escapeHtml(PERIOD_LABELS[period])} · ${editors.length} editor${editors.length === 1 ? "" : "s"} detected</div>
      <div class="share-pills">${pills}</div>
      <div class="share-stats">
        <div class="share-stat"><div class="share-stat-value">${totalSessions}</div><div class="share-stat-label">Sessions</div></div>
        <div class="share-stat"><div class="share-stat-value">${totalInteractions}</div><div class="share-stat-label">Interactions</div></div>
        <div class="share-stat"><div class="share-stat-value" title="${totalTokens.toLocaleString()} tokens">${formatTokenCount(totalTokens)}</div><div class="share-stat-label">Tokens</div></div>
        <div class="share-stat"><div class="share-stat-value">${editors.length}</div><div class="share-stat-label">Editors</div></div>
      </div>
    </div>
    ${emptyPeriodNotice}
    <div class="button-group" style="margin-top: 12px;">
      <button class="button secondary" id="btn-copy-share-summary"><span>📋</span><span>Copy Summary Text</span></button>
    </div>
    <div class="share-buttons" style="margin-top: 12px;">
      <button id="btn-share-card-linkedin" class="share-btn share-btn-linkedin"><span class="share-btn-icon">💼</span><span>Share on LinkedIn</span></button>
      <button id="btn-share-card-bluesky" class="share-btn share-btn-bluesky"><span class="share-btn-icon">🦋</span><span>Share on Bluesky</span></button>
      <button id="btn-share-card-mastodon" class="share-btn share-btn-mastodon"><span class="share-btn-icon">🐘</span><span>Share on Mastodon</span></button>
    </div>
  </div>`;
}

function renderDebugTab(counters: GlobalStateCounters | undefined): string {
  const c = counters ?? { openCount: 0, unknownMcpOpenCount: 0, fluencyBannerDismissed: false, unknownMcpDismissedVersion: '' };
  return `
    <div id="tab-debug" class="tab-content">
      <div class="info-box">
        <div class="info-box-title">🐛 Debug — Global State Counters</div>
        <div>Visible only when a debugger is attached. Edit counters and dismissed flags stored in VS Code global state, then click Set to apply. Changes take effect immediately.</div>
      </div>
      <div class="cache-details">
        <h4>Notification Counters</h4>
        <table><tbody>
          ${counterRow('extension.openCount', 'extension.openCount (fluency banner threshold: 5)', c.openCount)}
          ${counterRow('extension.unknownMcpOpenCount', 'extension.unknownMcpOpenCount (unknown MCP threshold: 8)', c.unknownMcpOpenCount)}
        </tbody></table>
        <h4 style="margin-top:16px;">Dismissed Flags</h4>
        <table><tbody>
          ${flagRow('news.fluencyScoreBanner.v1.dismissed', 'news.fluencyScoreBanner.v1.dismissed', c.fluencyBannerDismissed)}
          ${stringRow('news.unknownMcpTools.dismissedVersion', 'news.unknownMcpTools.dismissedVersion', c.unknownMcpDismissedVersion)}
        </tbody></table>
        <div style="margin-top: 16px;">
          <button class="button secondary" id="btn-reset-debug-counters"><span>🔄</span><span>Reset All Counters &amp; Dismissed Flags</span></button>
        </div>
      </div>
    </div>`;
}

function renderGitHubAuthPanel(githubAuth: GitHubAuthStatus | undefined): string {
  const authenticated = githubAuth?.authenticated || false;
  const username = githubAuth?.username || '';

  const statusColor = authenticated ? '#2d6a4f' : '#666';
  const statusIcon = authenticated ? '✅' : '⚪';
  const statusText = authenticated ? 'Authenticated' : 'Not Authenticated';

  return `
<div class="info-box">
  <div class="info-box-title">🔑 GitHub Authentication</div>
  <div>
    Authenticate with GitHub to unlock additional features in future releases.
  </div>
</div>

<div class="summary-cards">
  <div class="summary-card" style="border-left: 4px solid ${statusColor};">
    <div class="summary-label">${statusIcon} Status</div>
    <div class="summary-value" style="font-size: 16px; color: ${statusColor};">${statusText}</div>
  </div>
  ${authenticated ? `
  <div class="summary-card">
    <div class="summary-label">👤 Logged in as</div>
    <div class="summary-value" style="font-size: 16px;">${escapeHtml(username)}</div>
  </div>
  ` : ''}
</div>

${authenticated ? `
  <div style="margin-top: 24px;">
    <p style="color: #999; font-size: 12px; margin-bottom: 16px;">
      You are currently authenticated with GitHub. This enables future features such as:
    </p>
    <ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;">
      <li>Repository-specific usage tracking</li>
      <li>Team collaboration features</li>
      <li>Advanced analytics and insights</li>
    </ul>
  </div>
` : `
  <div style="margin-top: 24px;">
    <p style="color: #999; font-size: 12px; margin-bottom: 16px;">
      Sign in with your GitHub account to unlock future features. This uses VS Code's built-in authentication.
    </p>
  </div>
`}

<div class="button-group">
  ${authenticated ? `
    <button class="button secondary" id="btn-sign-out-github">
      <span>🔌</span>
      <span>Disconnect GitHub</span>
    </button>
  ` : `
    <button class="button" id="btn-authenticate-github">
      <span>🔑</span>
      <span>Authenticate with GitHub</span>
    </button>
  `}
</div>
  `;
}

function getBackendStatus(isConfigured: boolean, enabled: boolean): { color: string; icon: string; text: string } {
  return isConfigured
    ? { color: "#2d6a4f", icon: "✅", text: "Configured & Enabled" }
    : enabled
      ? { color: "#d97706", icon: "⚠️", text: "Enabled but Not Configured" }
      : { color: "#666", icon: "⚪", text: "Disabled" };
}

function renderAzureDetailsSection(azureInfo: AzureStorageInfo): string {
  if (!azureInfo.isConfigured) {
    return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">🚀 Get Started with Azure Storage</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">To enable cloud synchronization, configure an Azure Storage account via the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Azure subscription with Storage Account access</li><li>Appropriate permissions (Storage Table Data Contributor or Storage Account Key)</li><li>VS Code signed in with your Azure account (for Entra ID auth)</li></ul></div>`;
  }
  return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">📊 Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Storage Account</td><td>${escapeHtml(azureInfo.storageAccount)}</td></tr><tr><td style="font-weight: 600;">Subscription ID</td><td>${escapeHtml(azureInfo.subscriptionId)}</td></tr><tr><td style="font-weight: 600;">Resource Group</td><td>${escapeHtml(azureInfo.resourceGroup)}</td></tr><tr><td style="font-weight: 600;">Aggregation Table</td><td>${escapeHtml(azureInfo.aggTable)}</td></tr><tr><td style="font-weight: 600;">Events Table</td><td>${escapeHtml(azureInfo.eventsTable)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">📈 Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">💻 Unique Devices</div><div class="summary-value">${escapeHtml(String(azureInfo.deviceCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Based on workspace IDs</div></div><div class="summary-card"><div class="summary-label">📁 Total Sessions</div><div class="summary-value">${escapeHtml(String(azureInfo.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">☁️ Cloud Records</div><div class="summary-value">${azureInfo.recordCount !== null ? escapeHtml(String(azureInfo.recordCount)) : "—"}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Azure Storage records</div></div><div class="summary-card"><div class="summary-label">🔄 Sync Status</div><div class="summary-value" style="font-size: 14px;">${azureInfo.lastSyncTime ? formatDate(azureInfo.lastSyncTime) : "Never"}</div></div></div></div>`;
}

function renderAzureStoragePanel(azureInfo: AzureStorageInfo): string {
  const { color, icon, text } = getBackendStatus(azureInfo.isConfigured, azureInfo.enabled);
  return `<div class="info-box"><div class="info-box-title">☁️ Azure Storage Backend</div><div>Sync your token usage data to Azure Storage Tables for team-wide reporting and multi-device access.</div></div>
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${color};"><div class="summary-label">${icon} Status</div><div class="summary-value" style="font-size: 16px; color: ${color};">${text}</div></div><div class="summary-card"><div class="summary-label">🔐 Auth Mode</div><div class="summary-value" style="font-size: 16px;">${azureInfo.authMode === "entraId" ? "Entra ID" : "Shared Key"}</div></div><div class="summary-card"><div class="summary-label">👥 Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${escapeHtml(azureInfo.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">🕒 Last Sync</div><div class="summary-value" style="font-size: 14px;">${azureInfo.lastSyncTime ? getTimeSince(azureInfo.lastSyncTime) : "Never"}</div></div></div>
    ${renderAzureDetailsSection(azureInfo)}
    <div class="button-group"><button class="button" id="btn-configure-backend"><span>${azureInfo.isConfigured ? "⚙️" : "🔧"}</span><span>${azureInfo.isConfigured ? "Manage Backend" : "Configure Backend"}</span></button></div>`;
}

function renderTeamServerGithubAuthCard(githubAuth: GitHubAuthStatus | undefined, githubNotAuthenticated: boolean): string {
  const authColor = githubNotAuthenticated ? '#d97706' : githubAuth?.authenticated ? '#2d6a4f' : '#666';
  const authIcon = githubNotAuthenticated ? '⚠️' : githubAuth?.authenticated ? '✅' : '⚪';
  const authValue = githubNotAuthenticated ? 'Not Authenticated' : githubAuth?.authenticated ? escapeHtml(githubAuth.username || 'Authenticated') : 'Not Authenticated';
  return `<div class="summary-card" style="border-left: 4px solid ${authColor};"><div class="summary-label">${authIcon} GitHub Auth</div><div class="summary-value" style="font-size: 14px; color: ${authColor};">${authValue}</div></div>`;
}

function renderTeamServerDetailsSection(teamInfo: TeamServerInfo): string {
  if (!teamInfo.isConfigured) {
    return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">🚀 Get Started with Team Server</h4><p style="color: #999; font-size: 12px; margin-bottom: 16px;">Deploy the sharing server and configure its URL in the Backend configuration panel.</p><ul style="margin: 8px 0 16px 20px; color: #999; font-size: 12px;"><li>Deploy the sharing server (see the <code>sharing-server/</code> folder in the repository)</li><li>Enter the server's base URL in the Backend configuration panel</li><li>Data syncs automatically every 5 minutes once configured</li></ul></div>`;
  }
  return `<div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">📊 Configuration Details</h4><table class="session-table"><tbody><tr><td style="font-weight: 600; width: 200px;">Server URL</td><td>${escapeHtml(teamInfo.endpointUrl)}</td></tr></tbody></table></div><div style="margin-top: 24px;"><h4 style="color: #fff; font-size: 14px; margin-bottom: 12px;">📈 Local Session Statistics</h4><div class="summary-cards"><div class="summary-card"><div class="summary-label">📁 Total Sessions</div><div class="summary-value">${escapeHtml(String(teamInfo.sessionCount))}</div><div style="font-size: 11px; color: #999; margin-top: 4px;">Local session files</div></div><div class="summary-card"><div class="summary-label">🔄 Last Sync</div><div class="summary-value" style="font-size: 14px;">${teamInfo.lastSyncTime ? formatDate(teamInfo.lastSyncTime) : "Never"}</div></div></div></div>`;
}

function renderTeamServerPanel(teamInfo: TeamServerInfo, githubAuth?: GitHubAuthStatus): string {
  const { color, icon, text } = getBackendStatus(teamInfo.isConfigured, teamInfo.enabled);
  const githubNotAuthenticated = teamInfo.isConfigured && !githubAuth?.authenticated;
  const authWarning = githubNotAuthenticated ? `<button id="btn-team-server-auth-warning" style="width: 100%; margin-bottom: 16px; padding: 12px 16px; background: rgba(217, 119, 6, 0.15); border: 1px solid #d97706; border-radius: 6px; display: flex; gap: 10px; align-items: center; cursor: pointer; text-align: left;" title="Click to sign in to GitHub"><span style="font-size: 18px; flex-shrink: 0;">⚠️</span><div style="flex: 1;"><div style="color: #fbbf24; font-weight: 600; font-size: 13px; margin-bottom: 4px;">GitHub Authentication Required</div><div style="color: #d4a017; font-size: 12px;">Team server sync will not run until you sign in to GitHub. <strong style="color: #fbbf24;">Click here to sign in.</strong></div></div><span style="color: #fbbf24; font-size: 18px; flex-shrink: 0;">→</span></button>` : '';
  return `<div class="info-box"><div class="info-box-title">🖥️ Team Server Backend</div><div>Sync your token usage data to a self-hosted team server for team-wide reporting.</div></div>
    ${authWarning}
    <div class="summary-cards"><div class="summary-card" style="border-left: 4px solid ${color};"><div class="summary-label">${icon} Status</div><div class="summary-value" style="font-size: 16px; color: ${color};">${text}</div></div>${renderTeamServerGithubAuthCard(githubAuth, githubNotAuthenticated)}<div class="summary-card"><div class="summary-label">👥 Sharing Profile</div><div class="summary-value" style="font-size: 14px;">${escapeHtml(teamInfo.sharingProfile)}</div></div><div class="summary-card"><div class="summary-label">🕒 Last Sync</div><div class="summary-value" style="font-size: 14px;">${teamInfo.lastSyncTime ? getTimeSince(teamInfo.lastSyncTime) : "Never"}</div></div></div>
    ${renderTeamServerDetailsSection(teamInfo)}
    <div class="button-group"><button class="button" id="btn-configure-backend-team"><span>${teamInfo.isConfigured ? "⚙️" : "🔧"}</span><span>${teamInfo.isConfigured ? "Manage Backend" : "Configure Backend"}</span></button></div>`;
}

function renderBackendStoragePanel(
  backendInfo: BackendStorageInfo | undefined,
  githubAuth?: GitHubAuthStatus,
): string {
  if (!backendInfo) {
    return `
      <div class="info-box">
        <div class="info-box-title">☁️ Backend Storage</div>
        <div>⏳ Loading backend storage status...</div>
      </div>
    `;
  }

  return `
    <div class="subtab-bar">
      <button class="subtab active" data-subtab="backend-azure">☁️ Azure Storage</button>
      <button class="subtab" data-subtab="backend-teamserver">🖥️ Team Server</button>
    </div>
    <div id="subtab-backend-azure" class="subtab-content active">
      ${renderAzureStoragePanel(backendInfo.azure)}
    </div>
    <div id="subtab-backend-teamserver" class="subtab-content">
      ${renderTeamServerPanel(backendInfo.teamServer, githubAuth)}
    </div>
  `;
}

function renderFolderAnalyzerTab(): string {
  return `
    <div class="info-box">
      <div class="info-box-title">🔬 Path Analyzer</div>
      <div>
        Analyze any folder to find session files and inspect their content.
        This helps troubleshoot why the extension isn't finding your AI tool's session files,
        or verify that files from another OS would be recognized.
      </div>
    </div>
    <div class="section">
      <div class="section-title"><span class="codicon codicon-folder-opened"></span><span>Folder Selection</span></div>
      <div class="folder-input-row">
        <input
          type="text"
          id="folder-path-input"
          class="folder-input"
          placeholder="Paste a folder path here, e.g. /Users/you/.claude/projects/abc123"
        />
        <button class="button secondary" id="btn-browse-folder">📂 Browse…</button>
      </div>
      <div style="margin-top: 14px;">
        <label style="font-size: 12px; color: var(--text-secondary); display: block; margin-bottom: 6px;">
          Tool type (determines which file types to scan):
        </label>
        <select id="tool-type-select" class="tool-type-select">
          <option value="auto">🔍 Auto-detect (all JSON / JSONL files)</option>
          <option value="antigravity">🚀 Antigravity (.jsonl only)</option>
          <option value="claude-code">🟣 Claude Code (.jsonl only)</option>
          <option value="claude-desktop">🖥️ Claude Desktop</option>
          <option value="continue">⚡ Continue</option>
          <option value="copilot-chat">💙 GitHub Copilot Chat (VS Code)</option>
          <option value="copilot-cli">🤖 GitHub Copilot CLI</option>
          <option value="gemini-cli">💎 Gemini CLI (.jsonl only)</option>
          <option value="mistral-vibe">🔥 Mistral Vibe</option>
          <option value="opencode">🟢 OpenCode (JSON format only — DB not supported)</option>
        </select>
      </div>
      <div style="margin-top: 16px;">
        <button class="button" id="btn-analyze-folder">🔍 Analyze</button>
      </div>
    </div>
    <div id="folder-analysis-results"></div>
  `;
}

function buildFolderFileTableRow(f: FolderFileResult, idx: number, folderPath: string): string {
  const hasData = f.interactions > 0 || f.tokens > 0;
  const rel = f.file.startsWith(folderPath)
    ? f.file.slice(folderPath.length).replace(/^[/\\]/, "")
    : getFileName(f.file);
  const safeInteractions = Number(f.interactions);
  const interactionsCell = safeInteractions > 0
    ? `<strong>${escapeHtml(String(safeInteractions))}</strong>`
    : `<span style="color: var(--text-muted);">0</span>`;
  const safeTokens = Number(f.tokens);
  const tokensCell = safeTokens > 0
    ? `<strong title="${escapeHtml(String(safeTokens.toLocaleString()))} tokens">${escapeHtml(String(formatTokenCount(safeTokens)))}</strong>`
    : `<span style="color: var(--text-muted);">0</span>`;
  return `
    <tr style="${hasData ? "" : "opacity: 0.45;"}">
      <td>${idx + 1}</td>
      <td title="${escapeHtml(f.file)}" style="font-family: var(--vscode-editor-font-family, monospace); font-size: 11px; max-width: 420px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(rel)}</td>
      <td>${escapeHtml(String(formatFileSize(f.size)))}</td>
      <td>${interactionsCell}</td>
      <td>${tokensCell}</td>
      <td>${formatDate(f.modified)}</td>
    </tr>`;
}

function renderFolderAnalysisResults(
  files: FolderFileResult[],
  totalScanned: number,
  parseErrors: number,
  truncated: boolean,
  folderPath: string,
): string {
  const sessionFiles = files.filter(f => f.interactions > 0 || f.tokens > 0);
  const totalInteractions = files.reduce((sum, f) => sum + Number(f.interactions), 0);
  const totalTokens = files.reduce((sum, f) => sum + Number(f.tokens), 0);

  const sorted = [...files].sort((a, b) => {
    const aScore = a.interactions * 1000 + a.tokens;
    const bScore = b.interactions * 1000 + b.tokens;
    return bScore - aScore;
  });

  const truncatedWarning = truncated
    ? `<div class="info-box" style="margin-bottom: 12px; border-color: #d97706; background: rgba(217,119,6,0.08);">
        <div>⚠️ Scan limit reached (500 files). Results may be incomplete. Try a more specific subfolder.</div>
      </div>`
    : "";

  const emptyState = `
    <div style="padding: 32px; text-align: center; color: var(--text-muted);">
      <div style="font-size: 36px; margin-bottom: 12px;">📭</div>
      <div style="font-size: 14px;">No matching files found in this folder.</div>
      <div style="font-size: 12px; margin-top: 8px;">Try a different folder path or tool type.</div>
    </div>`;

  const tableRows = sorted.map((f, idx) => buildFolderFileTableRow(f, idx, folderPath)).join("");

  return `
    <div class="section" style="margin-top: 0;">
      <div class="section-title"><span class="codicon codicon-graph"></span><span>Analysis Results</span></div>
      ${truncatedWarning}
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">📄 Files Scanned</div>
          <div class="summary-value">${escapeHtml(String(totalScanned))}${truncated ? "+" : ""}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">✅ With Sessions</div>
          <div class="summary-value">${sessionFiles.length}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${files.length - sessionFiles.length} empty / unknown</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">💬 Interactions</div>
          <div class="summary-value">${escapeHtml(String(totalInteractions))}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">🪙 Tokens</div>
          <div class="summary-value" title="${escapeHtml(String(totalTokens.toLocaleString()))} tokens">${escapeHtml(String(formatTokenCount(totalTokens)))}</div>
        </div>
        ${parseErrors > 0 ? `
        <div class="summary-card" style="border-left: 3px solid #d97706;">
          <div class="summary-label">⚠️ Unreadable</div>
          <div class="summary-value" style="color: #d97706;">${escapeHtml(String(parseErrors))}</div>
        </div>` : ""}
      </div>
      ${files.length === 0 ? emptyState : `
        <div class="table-container" style="margin-top: 12px; max-height: 420px;">
          <table class="session-table">
            <thead>
              <tr>
                <th>#</th>
                <th>File</th>
                <th>Size</th>
                <th>Interactions</th>
                <th>Tokens</th>
                <th>Last Modified</th>
              </tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </div>`}
    </div>`;
}

const MODEL_USAGE_PERIOD_ORDER: Period[] = ["allTime", "lastMonth", "currentMonth", "thisWeek", "today"];
const MODEL_USAGE_PERIOD_TO_TIME_RANGE: Record<string, string> = {
  today: "today",
  thisWeek: "week",
  currentMonth: "month",
  lastMonth: "lastMonth",
  allTime: "all",
  yesterday: "yesterday",
};
const MODEL_USAGE_TIME_RANGE_TO_PERIOD: Record<string, string> = {
  today: "today",
  week: "thisWeek",
  month: "currentMonth",
  lastMonth: "lastMonth",
  all: "allTime",
  yesterday: "yesterday",
};

function renderModelUsageTab(detailedFiles: SessionFileDetails[], isLoadingSessions: boolean = false): string {
  const editorStats = getEditorStats(detailedFiles);
  const editorOptions = Object.keys(editorStats).sort()
    .map((editor) => `<option value="${escapeHtml(editor)}">${escapeHtml(getEditorIcon(editor))} ${escapeHtml(editor)} (${editorStats[editor].count})</option>`)
    .join("");
  const statusText = isLoadingSessions ? "⏳ Loading sessions…" : "";
  return `
    <div class="info-box">
      <div class="info-box-title">🧮 Model Usage Breakdown</div>
      <div>
        Aggregates the exact per-model token usage and estimated cost the dashboard uses,
        for a single editor or across all of them. Handy for spotting model/pricing
        mismatches behind an unexpected cost total (e.g. tokens attributed to the wrong model tier).
        Updates automatically when you change the editor or time range below.
      </div>
    </div>
    <div class="section">
      <div class="section-title">🎯 Select Editor &amp; Time Range</div>
      <div class="folder-input-row">
        <select id="model-usage-editor-select" class="tool-type-select" ${isLoadingSessions ? "disabled" : ""}>
          <option value="all">🌐 All Editors</option>
          ${editorOptions}
        </select>
        <span id="model-usage-time-selector"></span>
        <span id="model-usage-status" style="font-size: 12px; color: var(--text-muted);">${escapeHtml(statusText)}</span>
      </div>
    </div>
    <div id="model-usage-results"></div>
  `;
}

function renderModelUsageTimeSelector(disabled: boolean = false): void {
  const wrapper = document.getElementById("model-usage-time-selector");
  if (!wrapper) { return; }
  wrapper.replaceChildren();
  const selectedPeriod = MODEL_USAGE_TIME_RANGE_TO_PERIOD[currentModelUsageTimeRange] ?? "allTime";
  const { select } = createPeriodSelector({
    id: "model-usage-time-select",
    selected: selectedPeriod,
    periods: MODEL_USAGE_PERIOD_ORDER,
    extraOptions: [{ value: "yesterday", label: "Yesterday" }],
    label: "",
    onChange: (value) => {
      const timeRange = MODEL_USAGE_PERIOD_TO_TIME_RANGE[value];
      if (!timeRange) { return; }
      currentModelUsageTimeRange = timeRange;
      triggerModelUsageAnalysis();
    },
  });
  select.disabled = disabled;
  wrapper.append(select);
}

function buildModelUsageTableRow(row: ModelUsageRow, showCache1h: boolean): string {
  const sessionCountTitle = escapeHtml(`${row.sessionCount} session(s)`);
  const inputTokensTitle = escapeHtml(`${row.inputTokens.toLocaleString()} tokens`);
  const outputTokensTitle = escapeHtml(`${row.outputTokens.toLocaleString()} tokens`);
  const cacheCreationTokensTitle = escapeHtml(`${row.cacheCreationTokens.toLocaleString()} tokens`);
  const cacheCreation1hTokensTitle = escapeHtml(`${row.cacheCreation1hTokens.toLocaleString()} tokens`);
  const cachedReadTokensTitle = escapeHtml(`${row.cachedReadTokens.toLocaleString()} tokens`);

  return `
    <tr>
      <td>${escapeHtml(row.model)}</td>
      <td title="${sessionCountTitle}">${row.sessionCount.toLocaleString()}</td>
      <td title="${inputTokensTitle}">${formatTokenCount(row.inputTokens)}</td>
      <td title="${outputTokensTitle}">${formatTokenCount(row.outputTokens)}</td>
      <td title="${cacheCreationTokensTitle}">${formatTokenCount(row.cacheCreationTokens)}</td>
      ${showCache1h ? `<td title="${cacheCreation1hTokensTitle}">${formatTokenCount(row.cacheCreation1hTokens)}</td>` : ""}
      <td title="${cachedReadTokensTitle}">${formatTokenCount(row.cachedReadTokens)}</td>
      <td>$${row.estimatedCost.toFixed(2)}</td>
    </tr>`;
}

function buildModelUsageExplanation(fileCount: number, filesWithUsage: number): string {
  const missing = fileCount - filesWithUsage;
  if (missing <= 0) { return ""; }
  return `
    <div class="info-box" style="margin-top: 12px;">
      <div class="info-box-title">ℹ️ ${missing} session(s) have no per-model data</div>
      <div>
        This is often expected, not a bug. Common causes: chat-only sessions stored in a
        database with no model/token columns (e.g. Copilot CLI's session-store.db), older
        or truncated session logs written before an editor started recording per-model
        attribution, or sessions that never made a model-backed request (e.g. empty/aborted
        chats).
      </div>
    </div>`;
}

const TIME_RANGE_LABELS: Record<string, string> = {
  all: "All Time",
  lastMonth: "Last Month",
  month: "Current Month",
  week: "This Week",
  today: "Today",
  yesterday: "Yesterday",
};

function renderModelUsageResults(
  editor: string,
  fileCount: number,
  filesWithUsage: number,
  rows: ModelUsageRow[],
  totalCost: number,
  supportsCache1h: boolean = true,
  timeRange: string = "all",
): string {
  const editorLabel = editor === "all" ? "All Editors" : editor;
  const timeLabel = TIME_RANGE_LABELS[timeRange] || "All Time";
  const scopeLabel = timeRange === "all" ? editorLabel : `${editorLabel} — ${timeLabel}`;
  if (rows.length === 0) {
    return `
      <div class="section" style="margin-top: 0;">
        <div style="padding: 32px; text-align: center; color: var(--text-muted);">
          <div style="font-size: 36px; margin-bottom: 12px;">📭</div>
          <div style="font-size: 14px;">No per-model usage data found for ${escapeHtml(scopeLabel)}.</div>
          <div style="font-size: 12px; margin-top: 8px;">${fileCount} session file(s) matched, ${filesWithUsage} had model attribution data.</div>
        </div>
      </div>
      ${buildModelUsageExplanation(fileCount, filesWithUsage)}`;
  }
  const tableRows = rows.map((r) => buildModelUsageTableRow(r, supportsCache1h)).join("");
  return `
    <div class="section" style="margin-top: 0;">
      <div class="section-title">📊 Results — ${escapeHtml(scopeLabel)}</div>
      <div class="summary-cards">
        <div class="summary-card">
          <div class="summary-label">📄 Session Files</div>
          <div class="summary-value">${fileCount}</div>
          <div style="font-size: 11px; color: var(--text-muted);">${filesWithUsage} with model data</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">🧩 Models</div>
          <div class="summary-value">${rows.length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">💰 Est. Total Cost</div>
          <div class="summary-value">$${totalCost.toFixed(2)}</div>
        </div>
      </div>
      <div class="table-container" style="margin-top: 12px; max-height: 420px;">
        <table class="session-table">
          <thead>
            <tr>
              <th>Model</th>
              <th>Sessions</th>
              <th>Input</th>
              <th>Output</th>
              <th>Cache Create</th>
              ${supportsCache1h ? "<th>Cache Create (1h)</th>" : ""}
              <th>Cache Read</th>
              <th>Est. Cost</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      ${buildModelUsageExplanation(fileCount, filesWithUsage)}
    </div>`;
}

function groupSessionFolders(
  raw: Array<{ dir: string; count: number; editorName?: string }>,
): Array<{ dir: string; count: number; editorName?: string }> {
  // Each JetBrains conversation lives in its own UUID subfolder under
  // `~/.copilot/jb/`, so without grouping the table grows unbounded with one
  // row per chat. Collapse them into a single row keyed on the parent dir.
  const result: Array<{ dir: string; count: number; editorName?: string }> = [];
  const jbBuckets = new Map<string, { dir: string; count: number; editorName?: string }>();
  for (const sf of raw || []) {
    const norm = String(sf.dir || "").replace(/\\/g, "/");
    const m = norm.match(/^(.*\/\.copilot\/jb)\/[^/]+\/?$/);
    if (m) {
      const parent = m[1];
      const existing = jbBuckets.get(parent);
      if (existing) {
        existing.count += sf.count;
      } else {
        // Preserve the original separator style of the input path.
        const tail = norm.length - parent.length;
        const parentNative = sf.dir.slice(0, sf.dir.length - tail);
        jbBuckets.set(parent, { dir: parentNative, count: sf.count, editorName: sf.editorName || "JetBrains" });
      }
    } else {
      result.push(sf);
    }
  }
  for (const bucket of jbBuckets.values()) { result.push(bucket); }
  return result;
}

function getHomeDirectory(): string {
  type WindowWithProcess = Window & { process?: { env?: { HOME?: string; USERPROFILE?: string } } };
  const win = window as WindowWithProcess;
  return win.process?.env?.HOME || win.process?.env?.USERPROFILE || "";
}

function buildSessionFolderRow(sf: SessionFolder, home: string | null): HTMLElement {
  let display = sf.dir;
  if (home && display.startsWith(home)) {
    display = display.replace(home, "~");
  }
  const editorName = sf.editorName || "Unknown";

  const row = document.createElement("tr");

  const folderCell = document.createElement("td");
  folderCell.setAttribute("title", sf.dir);
  folderCell.textContent = display;
  row.appendChild(folderCell);

  const editorCell = document.createElement("td");
  const editorBadge = document.createElement("span");
  editorBadge.className = getEditorBadgeClass(editorName);
  editorBadge.textContent = `${getEditorIcon(editorName)} ${editorName}`;
  editorCell.appendChild(editorBadge);
  row.appendChild(editorCell);

  const countCell = document.createElement("td");
  countCell.textContent = String(sf.count);
  row.appendChild(countCell);

  const openCell = document.createElement("td");
  const openLink = document.createElement("a");
  openLink.href = "#";
  openLink.className = "reveal-link";
  openLink.setAttribute("data-path", encodeURIComponent(sf.dir));
  openLink.textContent = "Open directory";
  openCell.appendChild(openLink);
  if (editorName === "Unknown") {
    const reportLink = document.createElement("a");
    reportLink.href = "#";
    reportLink.className = "report-editor-link";
    reportLink.setAttribute("data-path", encodeURIComponent(sf.dir));
    reportLink.setAttribute("title", "Report this unknown path so we can add editor support");
    reportLink.textContent = "📢 Report";
    openCell.appendChild(document.createTextNode(" "));
    openCell.appendChild(reportLink);
  }
  row.appendChild(openCell);
  return row;
}

function buildSessionFoldersElement(folders: SessionFolder[]): HTMLElement {
  const sorted = [...folders].sort((a, b) => b.count - a.count);
  const totalSessions = sorted.reduce((sum, sf) => sum + sf.count, 0);
  const home = getHomeDirectory();

  const container = document.createElement("div");
  container.className = "session-folders-table";

  const heading = document.createElement("h4");
  heading.textContent = "Main Session Folders (by editor root):";
  container.appendChild(heading);

  const tableContainer = document.createElement("div");
  tableContainer.className = "table-container";
  container.appendChild(tableContainer);

  const table = document.createElement("table");
  table.className = "session-table";
  tableContainer.appendChild(table);

  const thead = document.createElement("thead");
  table.appendChild(thead);
  const headerRow = document.createElement("tr");
  thead.appendChild(headerRow);
  for (const text of ["Folder", "Editor", "# of Sessions", "Open"]) {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  }

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  for (const sf of sorted) {
    tbody.appendChild(buildSessionFolderRow(sf, home));
  }

  const totalRow = document.createElement("tr");
  totalRow.style.borderTop = "2px solid #5a5a5a";
  totalRow.style.fontWeight = "600";
  totalRow.style.background = "rgba(255, 255, 255, 0.05)";

  const totalLabelCell = document.createElement("td");
  totalLabelCell.setAttribute("colspan", "2");
  totalLabelCell.style.textAlign = "right";
  totalLabelCell.style.paddingRight = "16px";
  totalLabelCell.textContent = "Total:";
  totalRow.appendChild(totalLabelCell);

  const totalCountCell = document.createElement("td");
  totalCountCell.textContent = String(totalSessions);
  totalRow.appendChild(totalCountCell);

  totalRow.appendChild(document.createElement("td"));
  tbody.appendChild(totalRow);

  return container;
}

function setupStorageLinkHandlers(): void {
  document.querySelectorAll(".open-storage-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const path = decodeURIComponent(
        (link as HTMLElement).getAttribute("data-path") || "",
      );
      if (path) {
        vscode.postMessage({ command: "revealPath", path });
      }
    });
  });
}

function setupGitHubAuthHandlers(): void {
  document.getElementById('btn-authenticate-github')?.addEventListener('click', () => {
    vscode.postMessage({ command: 'authenticateGitHub' });
  });

  document.getElementById('btn-sign-out-github')?.addEventListener('click', () => {
    vscode.postMessage({ command: 'signOutGitHub' });
  });
}

function activateSubtab(subtabId: string): boolean {
  const subtabEl = document.querySelector(`.subtab[data-subtab="${subtabId}"]`);
  const contentEl = document.getElementById(`subtab-${subtabId}`);
  if (subtabEl && contentEl) {
    const subtabBar = subtabEl.closest(".subtab-bar");
    if (subtabBar) {
      subtabBar.querySelectorAll(".subtab").forEach((s) => s.classList.remove("active"));
    }
    document.querySelectorAll(".subtab-content").forEach((c) => c.classList.remove("active"));
    subtabEl.classList.add("active");
    contentEl.classList.add("active");
    return true;
  }
  return false;
}

function activateTab(tabId: string): boolean {
  const tabButton = document.querySelector(`.tab[data-tab="${tabId}"]`);
  const tabContent = document.getElementById(`tab-${tabId}`);

  if (tabButton && tabContent) {
    document
      .querySelectorAll(".tab")
      .forEach((t) => t.classList.remove("active"));
    document
      .querySelectorAll(".tab-content")
      .forEach((c) => c.classList.remove("active"));

    tabButton.classList.add("active");
    tabContent.classList.add("active");
    return true;
  }
  return false;
}

/** Which group tab (Diagnostics / Research / Settings) each leaf tab lives under. */
const TAB_GROUPS: Record<string, string[]> = {
  diagnostics: ["report", "sessions", "cache", "path-analyzer"],
  research: ["model-usage", "tool-analysis", "skill-usage", "otel-delta"],
  settings: ["display", "backend", "github", "debug"],
};

function groupOfTab(tabId: string): string {
  for (const [group, tabs] of Object.entries(TAB_GROUPS)) {
    if (tabs.includes(tabId)) { return group; }
  }
  return "diagnostics";
}

/** The first leaf tab in a group that actually has a rendered button (handles the conditional Debug tab). */
function firstAvailableTabInGroup(groupId: string): string | undefined {
  return TAB_GROUPS[groupId]?.find((id) => document.querySelector(`.tab[data-tab="${id}"]`));
}

/** Shows the leaf tab bar for the given group and hides the others; does not change which leaf tab is active. */
function activateGroup(groupId: string): boolean {
  const groupButton = document.querySelector(`.group-tab[data-group="${groupId}"]`);
  const leafBar = document.querySelector(`.leaf-tabs[data-group="${groupId}"]`);
  if (!groupButton || !leafBar) { return false; }

  document.querySelectorAll(".group-tab").forEach((b) => b.classList.remove("active"));
  document.querySelectorAll<HTMLElement>(".leaf-tabs").forEach((b) => { b.style.display = "none"; });

  groupButton.classList.add("active");
  (leafBar as HTMLElement).style.display = "flex";
  return true;
}

function setupGroupHandlers(): void {
  document.querySelectorAll(".group-tab").forEach((button) => {
    button.addEventListener("click", () => {
      const groupId = (button as HTMLElement).getAttribute("data-group");
      if (!groupId || !activateGroup(groupId)) { return; }

      const activeTabInGroup = document.querySelector(`.leaf-tabs[data-group="${groupId}"] .tab.active`);
      if (!activeTabInGroup) {
        const nextTab = firstAvailableTabInGroup(groupId);
        if (nextTab && activateTab(nextTab)) {
          diagState.patch({ activeTab: nextTab });
        }
      }
    });
  });
}

function setupSortHandlers(): void {
  document.querySelectorAll(".sortable").forEach((header) => {
    header.addEventListener("click", () => {
      const sortColumn = (header as HTMLElement).getAttribute(
        "data-sort",
      ) as typeof currentSortColumn;
      if (sortColumn) {
        if (currentSortColumn === sortColumn) {
          currentSortDirection =
            currentSortDirection === "desc" ? "asc" : "desc";
        } else {
          currentSortColumn = sortColumn;
          currentSortDirection = "desc";
        }
        reRenderTable();
      }
    });
  });
}

function setupEditorFilterHandlers(): void {
  document.querySelectorAll(".editor-panel").forEach((panel) => {
    panel.addEventListener("click", () => {
      const editor = (panel as HTMLElement).getAttribute("data-editor");
      currentEditorFilter = editor === "" ? null : editor;
      reRenderTable();
    });
  });
}

function setupContextRefFilterHandlers(): void {
  document.querySelectorAll(".context-ref-filter").forEach((filter) => {
    filter.addEventListener("click", () => {
      const refType = (filter as HTMLElement).getAttribute(
        "data-ref-type",
      ) as keyof ContextReferenceUsage | null;

      if (currentContextRefFilter === refType) {
        currentContextRefFilter = null;
      } else {
        currentContextRefFilter = refType;
      }
      reRenderTable();
    });
  });
}

function setupUnattributedFilterHandler(): void {
  const checkbox = document.getElementById("show-only-unattributed") as HTMLInputElement | null;
  if (checkbox) {
    checkbox.addEventListener("change", () => {
      showOnlyUnattributed = checkbox.checked;
      reRenderTable();
    });
  }
}

function setupZeroInteractionFilterHandler(): void {
  const checkbox = document.getElementById("hide-empty-sessions") as HTMLInputElement | null;
  if (checkbox) {
    checkbox.addEventListener("change", () => {
      hideEmptySessions = checkbox.checked;
      reRenderTable();
    });
  }
}

function setupBackendButtonHandlers(): void {
  document
    .getElementById("btn-configure-backend")
    ?.addEventListener("click", () => {
      vscode.postMessage({ command: "configureBackend" });
    });

  document
    .getElementById("btn-configure-backend-team")
    ?.addEventListener("click", () => {
      diagState.patch({ activeTab: "backend", activeSubtab: "backend-teamserver" });
      vscode.postMessage({ command: "configureTeamServer" });
    });

  document
    .getElementById("btn-team-server-auth-warning")
    ?.addEventListener("click", () => {
      vscode.postMessage({ command: "authenticateGitHub" });
    });

  document
    .getElementById("btn-open-settings")
    ?.addEventListener("click", () => {
      vscode.postMessage({ command: "openSettings" });
    });

  document
    .getElementById("btn-open-display-settings")
    ?.addEventListener("click", () => {
      vscode.postMessage({ command: "openDisplaySettings" });
    });
}

function setupDisplaySettingHandlers(): void {
  document
    .getElementById("select-show-tokens")
    ?.addEventListener("change", (e) => {
      const value = (e.target as HTMLSelectElement).value;
      vscode.postMessage({ command: "updateDisplaySetting", key: "display.statusBar.showTokens", value });
    });

  document
    .getElementById("select-show-cost")
    ?.addEventListener("change", (e) => {
      const value = (e.target as HTMLSelectElement).value;
      vscode.postMessage({ command: "updateDisplaySetting", key: "display.statusBar.showCost", value });
    });

  document
    .getElementById("input-monthly-budget")
    ?.addEventListener("change", (e) => {
      const input = e.target as HTMLInputElement;
      const raw = parseFloat(input.value);
      const value = isNaN(raw) ? 0 : Math.min(99999, Math.max(0, Math.round(raw * 100) / 100));
      input.value = value.toString();
      vscode.postMessage({ command: "updateDisplaySetting", key: "display.statusBar.monthlyBudget", value });
    });
}

function setupSubtabHandlers(): void {
  document.querySelectorAll(".subtab").forEach((subtab) => {
    subtab.addEventListener("click", () => {
      const subtabId = (subtab as HTMLElement).getAttribute("data-subtab");
      if (!subtabId) {
        return;
      }
      const subtabBar = subtab.closest(".subtab-bar");
      if (subtabBar) {
        subtabBar.querySelectorAll(".subtab").forEach((s) => s.classList.remove("active"));
      }
      document.querySelectorAll(".subtab-content").forEach((c) => c.classList.remove("active"));
      subtab.classList.add("active");
      document.getElementById(`subtab-${subtabId}`)?.classList.add("active");
      diagState.patch({ activeSubtab: subtabId });
    });
  });
}

function reRenderTable(): void {
  const container = document.getElementById("session-table-container");
  if (container) {
    setHtml(container, renderSessionTable(storedDetailedFiles, isLoading));
    if (!isLoading) {
      setupSortHandlers();
      setupEditorFilterHandlers();
      setupContextRefFilterHandlers();
      setupZeroInteractionFilterHandler();
      setupUnattributedFilterHandler();
      setupFileLinks();
    }
  }
}

function reRenderToolAnalysisTable(): void {
  document.querySelectorAll<HTMLElement>(".tool-analysis-table").forEach(table => {
    const encoded = table.getAttribute("data-rows");
    if (!encoded) { return; }
    const rows: ToolAnalysisRow[] = JSON.parse(decodeURIComponent(encoded));
    const baselineRaw = table.getAttribute("data-baseline");
    const baseline = baselineRaw ? parseFloat(baselineRaw) : NaN;
    const tbody = table.querySelector("tbody");
    if (tbody) { setHtml(tbody, renderToolAnalysisRows(rows, baseline)); }
    const thead = table.querySelector("thead");
    if (thead) { setHtml(thead, toolAnalysisTheadHtml()); }
  });
  setupToolAnalysisSortHandlers();
}

function setupToolAnalysisSortHandlers(): void {
  document.querySelectorAll<HTMLElement>(".tool-sortable").forEach(header => {
    header.addEventListener("click", () => {
      const col = header.getAttribute("data-sort") as typeof toolSortColumn | null;
      if (!col) { return; }
      if (toolSortColumn === col) {
        toolSortDir = toolSortDir === "desc" ? "asc" : "desc";
      } else {
        toolSortColumn = col;
        toolSortDir = col === "tool" ? "asc" : "desc";
      }
      reRenderToolAnalysisTable();
    });
  });
  document.getElementById("btn-open-tool-families-settings")?.addEventListener("click", () => {
    vscode.postMessage({ command: "openToolFamiliesSettings" });
  });
}

function setupFileLinks(): void {
  document.querySelectorAll(".session-file-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const file = decodeURIComponent(
        (link as HTMLElement).getAttribute("data-file") || "",
      );
      vscode.postMessage({ command: "openSessionFile", file });
    });
  });

  document.querySelectorAll(".view-formatted-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const file = decodeURIComponent(
        (link as HTMLElement).getAttribute("data-file") || "",
      );
      vscode.postMessage({ command: "openFormattedJsonlFile", file });
    });
  });

  document.querySelectorAll(".reveal-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const path = decodeURIComponent(
        (link as HTMLElement).getAttribute("data-path") || "",
      );
      vscode.postMessage({ command: "revealPath", path });
    });
  });

  document.querySelectorAll(".report-editor-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const path = decodeURIComponent(
        (link as HTMLElement).getAttribute("data-path") || "",
      );
      vscode.postMessage({ command: "reportNewEditorPath", path });
    });
  });
}

function updateCacheNumbers(): void {
  const cacheTabContent = document.getElementById("tab-cache");
  if (cacheTabContent) {
    const summaryCards = cacheTabContent.querySelectorAll(".summary-card");
    if (summaryCards.length >= 4) {
      const entriesValue = summaryCards[0]?.querySelector(".summary-value");
      if (entriesValue) {
        entriesValue.textContent = "0";
      }

      const sizeValue = summaryCards[1]?.querySelector(".summary-value");
      if (sizeValue) {
        sizeValue.textContent = "0 MB";
      }

      const lastUpdatedValue =
        summaryCards[2]?.querySelector(".summary-value");
      if (lastUpdatedValue) {
        lastUpdatedValue.textContent = "Never";
      }

      const ageValue = summaryCards[3]?.querySelector(".summary-value");
      if (ageValue) {
        ageValue.textContent = "N/A";
      }
    }
  }
}

function setupFolderAnalyzerHandlers(): void {
  document.getElementById("btn-browse-folder")?.addEventListener("click", () => {
    vscode.postMessage({ command: "pickFolder" });
  });

  document.getElementById("btn-analyze-folder")?.addEventListener("click", () => {
    const input = document.getElementById("folder-path-input") as HTMLInputElement | null;
    const select = document.getElementById("tool-type-select") as HTMLSelectElement | null;
    const folderPath = input?.value.trim() ?? "";

    if (!folderPath) {
      if (input) {
        input.style.borderColor = "#d97706";
        input.focus();
      }
      return;
    }
    if (input) {
      input.style.borderColor = "";
    }

    const btn = document.getElementById("btn-analyze-folder") as HTMLButtonElement | null;
    if (btn) {
      btn.disabled = true;
      setHtml(btn, "<span>⏳</span><span>Analyzing…</span>");
    }

    const resultsDiv = document.getElementById("folder-analysis-results");
    if (resultsDiv) {
      setHtml(resultsDiv, `
          <div class="analyzer-loading">
            <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
            <span>Scanning files…</span>
          </div>`);
    }

    vscode.postMessage({
      command: "analyzeFolder",
      folderPath,
      toolType: select?.value ?? "auto",
    });
  });
}

function triggerModelUsageAnalysis(): void {
  const select = document.getElementById("model-usage-editor-select") as HTMLSelectElement | null;
  if (!select || select.disabled) { return; }
  const editor = select.value || "all";
  const timeRange = currentModelUsageTimeRange || "all";

  const resultsDiv = document.getElementById("model-usage-results");
  if (resultsDiv) {
    setHtml(resultsDiv, `
        <div class="analyzer-loading">
          <span class="spinner" style="width:18px;height:18px;border:2px solid var(--link-color);border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin 0.7s linear infinite;"></span>
          <span>Aggregating model usage…</span>
        </div>`);
  }

  vscode.postMessage({ command: "analyzeModelUsage", editor, timeRange });
}

function setupModelUsageHandlers(): void {
  document.getElementById("model-usage-editor-select")?.addEventListener("change", () => {
    triggerModelUsageAnalysis();
  });
}

function handleModelUsageResult(message: DiagMessage): void {
  const resultsDiv = document.getElementById("model-usage-results");
  if (!resultsDiv) { return; }
  if (typeof message.timeRange === "string" && message.timeRange) {
    currentModelUsageTimeRange = message.timeRange;
    renderModelUsageTimeSelector(false);
  }
  if (message.stillLoading) {
    setHtml(resultsDiv, `
      <div class="info-box" style="margin-top: 12px;">
        <div class="info-box-title">⏳ Still loading session files</div>
        <div>Session files are still being scanned in the background. Wait a moment (watch the "Session Files" tab count) and try again.</div>
      </div>`);
    return;
  }
  setHtml(resultsDiv, renderModelUsageResults(
    String(message.editor || "all"),
    Number(message.fileCount || 0),
    Number(message.filesWithUsage || 0),
    (message.rows || []) as ModelUsageRow[],
    Number(message.totalCost || 0),
    message.supportsCache1h !== false,
    String(message.timeRange || "all"),
  ));
}

function setupTabHandlers(): void {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = (tab as HTMLElement).getAttribute("data-tab");

      if (tabId && activateTab(tabId)) {
        diagState.patch({ activeTab: tabId });
        if (tabId === "model-usage") {
          const resultsDiv = document.getElementById("model-usage-results");
          if (resultsDiv && !resultsDiv.innerHTML.trim()) { triggerModelUsageAnalysis(); }
        }
      }
    });
  });
}

function handleClearCacheClick(target: HTMLElement): void {
  target.style.background = "#d97706";
  setHtml(target, "<span>⏳</span><span>Clearing...</span>");
  if (target instanceof HTMLButtonElement) {
    target.disabled = true;
  }
  updateCacheNumbers();
  vscode.postMessage({ command: "clearCache" });
}

function handleDebugCounterSetClick(target: HTMLElement): void {
  const key = target.getAttribute("data-key");
  const row = target.closest("tr");
  const input = row?.querySelector(".debug-counter-input") as HTMLInputElement | null;
  if (key && input) {
    const value = parseInt(input.value, 10);
    if (!isNaN(value)) {
      vscode.postMessage({ command: "setDebugCounter", key, value });
    }
  }
}

function handleDebugFlagSetClick(target: HTMLElement): void {
  const key = target.getAttribute("data-key");
  const row = target.closest("tr");
  const input = row?.querySelector(".debug-flag-input") as HTMLInputElement | null;
  if (key && input) {
    vscode.postMessage({ command: "setDebugFlag", key, value: input.checked });
  }
}

function handleGlobalClickEvent(event: MouseEvent): void {
  const target = event.target as HTMLElement;
  if (!target) { return; }
  if (target.id === "btn-clear-cache" || target.id === "btn-clear-cache-tab") {
    handleClearCacheClick(target);
  }
  if (target.id === "btn-reset-insights" || target.id === "btn-reset-insights-tab") {
    vscode.postMessage({ command: "resetInsightsState" });
  }
  if (target.id === "btn-reset-debug-counters") {
    vscode.postMessage({ command: "resetDebugCounters" });
  }
  if (target.id === "btn-reset-discovered-editors") {
    vscode.postMessage({ command: "resetDiscoveredEditors" });
  }
  if (target.classList.contains("debug-counter-set")) {
    handleDebugCounterSetClick(target);
  }
  if (target.classList.contains("debug-flag-set")) {
    handleDebugFlagSetClick(target);
  }
}

function wireNavButtons(): void {
  document
    .getElementById("btn-refresh")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "refresh" }),
    );
  document
    .getElementById("btn-chart")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "showChart" }),
    );
  document
    .getElementById("btn-usage")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "showUsageAnalysis" }),
    );
  document
    .getElementById("btn-details")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "showDetails" }),
    );
  document
    .getElementById("btn-diagnostics")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "showDiagnostics" }),
    );
  document
    .getElementById("btn-maturity")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "showMaturity" }),
    );
  document
    .getElementById("btn-dashboard")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "showDashboard" }),
    );
  document
    .getElementById("btn-environmental")
    ?.addEventListener("click", () =>
      vscode.postMessage({ command: "showEnvironmental" }),
    );
  wireExtensionPointButtons(vscode);
}

/** Renders the Share Card's period dropdown into its placeholder span, reusing the shared period-selector
 * component for visual/state consistency with the other period selectors in this webview (e.g. Model Usage). */
function renderShareCardPeriodSelector(): void {
  const wrapper = document.getElementById("share-card-period-selector");
  if (!wrapper) { return; }
  wrapper.replaceChildren();
  const { select } = createPeriodSelector({
    id: "share-card-period-select",
    selected: currentShareCardPeriod,
    periods: SHARE_CARD_PERIOD_ORDER,
    label: "",
    onChange: (value) => {
      currentShareCardPeriod = value as Period;
      diagState.patch({ shareCardPeriod: currentShareCardPeriod });
      reRenderShareCard();
    },
  });
  wrapper.append(select);
}

/** Builds the current Share Card's plain-text summary from live filtered session data, for both
 * the "Copy Summary Text" button and the social share buttons. */
function buildCurrentShareSummaryText(): string {
  const filteredFiles = filterFilesByShareCardPeriod(storedDetailedFiles, currentShareCardPeriod);
  const editorStats = getEditorStats(filteredFiles);
  const editors = Object.keys(editorStats).sort((a, b) => editorStats[b].count - editorStats[a].count);
  const totalSessions = filteredFiles.length;
  const totalInteractions = filteredFiles.reduce((sum, sf) => sum + Number(sf.interactions || 0), 0);
  const totalTokens = filteredFiles.reduce((sum, sf) => sum + Number(sf.tokens || 0), 0);
  return buildShareSummaryText(editors, editorStats, totalSessions, totalInteractions, totalTokens, currentShareCardPeriod);
}

/** Wires the "Copy Summary Text" button, social share buttons, and period selector on the Share
 * Card tab. Re-run after `reRenderShareCard()` replaces the tab's markup, since these elements are recreated. */
function setupShareSummaryButtonHandler(): void {
  renderShareCardPeriodSelector();
  document.getElementById("btn-copy-share-summary")?.addEventListener("click", () => {
    vscode.postMessage({ command: "copyText", text: buildCurrentShareSummaryText() });
  });
  const socialPlatforms: Array<{ id: string; platform: "linkedin" | "bluesky" | "mastodon" }> = [
    { id: "btn-share-card-linkedin", platform: "linkedin" },
    { id: "btn-share-card-bluesky", platform: "bluesky" },
    { id: "btn-share-card-mastodon", platform: "mastodon" },
  ];
  for (const { id, platform } of socialPlatforms) {
    document.getElementById(id)?.addEventListener("click", () => {
      vscode.postMessage({ command: "shareCardToSocial", platform, text: buildCurrentShareSummaryText() });
    });
  }
}

/** Re-renders the Share Card tab once session files have finished loading, since it is
 * initially rendered with an empty file list before the async load completes. */
function reRenderShareCard(): void {
  replaceTabContent("share", renderShareCardTab(storedDetailedFiles), setupShareSummaryButtonHandler);
}

function setupButtonHandlers(): void {
  document.getElementById("btn-copy")?.addEventListener("click", () => {
    vscode.postMessage({ command: "copyReport" });
  });

  setupShareSummaryButtonHandler();

  document.getElementById("btn-issue")?.addEventListener("click", () => {
    vscode.postMessage({ command: "openIssue" });
  });

  document.getElementById("btn-clear-cache")?.addEventListener("click", () => {
    const btn = document.getElementById(
      "btn-clear-cache",
    ) as HTMLButtonElement | null;
    if (btn) {
      btn.style.background = "#d97706";
      setHtml(btn, "<span>⏳</span><span>Clearing...</span>");
      btn.disabled = true;
    }
    updateCacheNumbers();
    vscode.postMessage({ command: "clearCache" });
  });

  document
    .getElementById("btn-clear-cache-tab")
    ?.addEventListener("click", () => {
      const btn = document.getElementById(
        "btn-clear-cache-tab",
      ) as HTMLButtonElement | null;
      if (btn) {
        btn.style.background = "#d97706";
        setHtml(btn, "<span>⏳</span><span>Clearing...</span>");
        btn.disabled = true;
      }
      updateCacheNumbers();
      vscode.postMessage({ command: "clearCache" });
    });

  document.addEventListener("click", handleGlobalClickEvent);

  wireNavButtons();
}

type DiagMessage = Record<string, any>;

function handleDiagnosticReport(message: DiagMessage): void {
  if (!message.report) { return; }
  const reportTabContent = document.getElementById("tab-report");
  if (!reportTabContent) { return; }
  const processedReport = removeSessionFilesSection(message.report);
  const reportPre = reportTabContent.querySelector(".report-content");
  if (reportPre) { reportPre.textContent = processedReport; }
}

function handleBackendStorageSection(message: DiagMessage): void {
  if (!message.backendStorageInfo) {
    console.warn("diagnosticDataLoaded received but backendStorageInfo is missing or undefined");
    return;
  }
  currentBackendInfo = message.backendStorageInfo;
  if (message.githubAuth !== undefined) { currentGithubAuth = message.githubAuth; }
  const backendTabContent = document.getElementById("tab-backend");
  if (!backendTabContent) { return; }
  const activeSubtabEl = backendTabContent.querySelector(".subtab.active") as HTMLElement | null;
  const previousSubtab = activeSubtabEl?.getAttribute("data-subtab") ?? diagState.restore().activeSubtab;
  setHtml(backendTabContent, renderBackendStoragePanel(currentBackendInfo, currentGithubAuth));
  setupBackendButtonHandlers();
  setupSubtabHandlers();
  if (previousSubtab) {
    activateSubtab(previousSubtab);
    diagState.patch({ activeSubtab: previousSubtab });
  }
}

function handleSessionFoldersSection(message: DiagMessage): void {
  if (!message.sessionFolders || message.sessionFolders.length === 0) { return; }
  const reportTabContent = document.getElementById("tab-report");
  if (!reportTabContent) { return; }
  const grouped = groupSessionFolders(message.sessionFolders as SessionFolder[]);
  const foldersEl = buildSessionFoldersElement(grouped);
  const existing = reportTabContent.querySelector(".session-folders-table");
  if (existing) {
    existing.replaceWith(foldersEl);
  } else {
    const reportContent = reportTabContent.querySelector(".report-content");
    if (reportContent) { reportContent.insertAdjacentElement("afterend", foldersEl); }
    else { reportTabContent.appendChild(foldersEl); }
  }
  setupStorageLinkHandlers();
}

function handleCandidatePathsSection(message: DiagMessage): void {
  if (!message.candidatePaths || message.candidatePaths.length === 0) { return; }
  const reportTabContent = document.getElementById("tab-report");
  if (!reportTabContent) { return; }
  reportTabContent.querySelector(".candidate-paths-table")?.remove();
  const candidateEl = buildCandidatePathsElement(message.candidatePaths);
  const foldersTable = reportTabContent.querySelector(".session-folders-table");
  if (foldersTable) {
    foldersTable.insertAdjacentElement("afterend", candidateEl);
  } else {
    const reportContent = reportTabContent.querySelector(".report-content");
    if (reportContent) { reportContent.insertAdjacentElement("afterend", candidateEl); }
    else { reportTabContent.appendChild(candidateEl); }
  }
}

/**
 * Replaces a tab's content element with freshly rendered HTML, preserving its active state.
 * Security contract: `newContent` is built entirely by this file's own render*() functions
 * from structured (non-HTML) data sent by the extension host over postMessage — every
 * interpolated string field is passed through escapeHtml(), and every numeric field through
 * an explicit Number() cast, before being placed into a template literal. Never pass raw
 * message field values into this function directly.
 */
function replaceTabContent(tabId: string, newContent: string, onReplaced?: () => void): void {
  const tabContent = document.getElementById(`tab-${tabId}`);
  if (!tabContent) { return; }
  const wasActive = tabContent.classList.contains("active");
  const temp = document.createElement('div');
  setHtml(temp, newContent);
  const newTab = temp.firstElementChild as HTMLElement | null;
  if (!newTab) { return; }
  if (wasActive) { newTab.classList.add("active"); }
  tabContent.replaceWith(newTab);
  onReplaced?.();
}

function handleGithubAuthSection(message: DiagMessage): void {
  if (message.githubAuth === undefined) { return; }
  const githubTabContent = document.getElementById("tab-github");
  if (githubTabContent) {
    setHtml(githubTabContent, renderGitHubAuthPanel(message.githubAuth));
    setupGitHubAuthHandlers();
  }
}

function handleToolAnalysisSection(message: DiagMessage): void {
  if (message.toolFamilies) { storedToolFamilies = message.toolFamilies as ToolFamilyConfig[]; }
  if (message.toolCallStats === undefined) { return; }
  const newContent = renderToolAnalysisTab(message.toolCallStats as DiagnosticsData['toolCallStats'], storedToolFamilies);
  replaceTabContent("tool-analysis", newContent, setupToolAnalysisSortHandlers);
}

function handleSkillUsageSection(message: DiagMessage): void {
  if (message.skillCallStats === undefined) { return; }
  const newContent = renderSkillUsageTab(message.skillCallStats as DiagnosticsData['skillCallStats']);
  replaceTabContent("skill-usage", newContent);
}

/** Re-renders the OTel Delta tab body from currentOtelComparison + currentOtelDeltaPeriod, preserving active/tab state. */
function rerenderOtelDeltaTab(): void {
  replaceTabContent("otel-delta", renderOtelDeltaTab(currentOtelComparison, currentOtelDeltaPeriod), setupOtelDeltaPeriodHandler);
}

function setupOtelDeltaPeriodHandler(): void {
  const select = document.getElementById("otel-delta-period") as HTMLSelectElement | null;
  if (!select) { return; }
  select.addEventListener("change", () => {
    currentOtelDeltaPeriod = select.value as OtelDeltaPeriod;
    diagState.patch({ otelDeltaPeriod: currentOtelDeltaPeriod });
    rerenderOtelDeltaTab();
  });
}

function handleOtelComparisonSection(message: DiagMessage): void {
  if (message.otelComparison === undefined) { return; }
  currentOtelComparison = message.otelComparison as DiagnosticsData['otelComparison'];
  rerenderOtelDeltaTab();
}

function handleDiagnosticDataLoaded(message: DiagMessage): void {
  handleDiagnosticReport(message);
  handleBackendStorageSection(message);
  handleSessionFoldersSection(message);
  handleCandidatePathsSection(message);
  handleGithubAuthSection(message);
  handleToolAnalysisSection(message);
  handleSkillUsageSection(message);
  handleOtelComparisonSection(message);
}

function handleGithubAuthUpdated(message: DiagMessage): void {
  currentGithubAuth = message.githubAuth;
  const githubTabContent = document.getElementById("tab-github");
  if (githubTabContent) {
    setHtml(githubTabContent, renderGitHubAuthPanel(currentGithubAuth));
    setupGitHubAuthHandlers();
  }
  const backendTabContent = document.getElementById("tab-backend");
  if (backendTabContent && currentBackendInfo) {
    const activeSubtabEl = backendTabContent.querySelector(".subtab.active") as HTMLElement | null;
    const previousSubtab = activeSubtabEl?.getAttribute("data-subtab");
    setHtml(backendTabContent, renderBackendStoragePanel(currentBackendInfo, currentGithubAuth));
    setupBackendButtonHandlers();
    setupSubtabHandlers();
    if (previousSubtab) {
      activateSubtab(previousSubtab);
    }
  }
}

function handleDiagnosticDataError(message: DiagMessage): void {
  console.error("Error loading diagnostic data:", message.error);
  const rootEl = document.getElementById("root");
  if (rootEl) {
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText =
      "color: #ff6b6b; padding: 20px; text-align: center;";
    setHtml(errorDiv, `
<h3><span class="codicon codicon-warning"></span> Error Loading Diagnostic Data</h3>
<p>${escapeHtml(message.error || "Unknown error")}</p>
`);
    rootEl.insertBefore(errorDiv, rootEl.firstChild);
  }
}

function sanitizeNumericRecord(input: unknown): Record<string, number> {
  if (!input || typeof input !== "object") {
    return {};
  }
  return Object.fromEntries(
    Object.entries(input as Record<string, unknown>).map(([key, value]) => [key, Number(value ?? 0) || 0]),
  );
}

function numField(v: unknown): number { return Number(v ?? 0) || 0; }
function optStr(v: unknown): string | undefined { return v === null || v === undefined ? undefined : String(v); }
function nullStr(v: unknown): string | null { return v === null || v === undefined ? null : String(v); }

function sanitizeContextReferences(contextRefs: Record<string, unknown>) {
  return {
    file: numField(contextRefs.file),
    symbol: numField(contextRefs.symbol),
    selection: numField(contextRefs.selection),
    implicitSelection: numField(contextRefs.implicitSelection),
    codebase: numField(contextRefs.codebase),
    workspace: numField(contextRefs.workspace),
    terminal: numField(contextRefs.terminal),
    vscode: numField(contextRefs.vscode),
    terminalLastCommand: numField(contextRefs.terminalLastCommand),
    terminalSelection: numField(contextRefs.terminalSelection),
    clipboard: numField(contextRefs.clipboard),
    changes: numField(contextRefs.changes),
    outputPanel: numField(contextRefs.outputPanel),
    problemsPanel: numField(contextRefs.problemsPanel),
    pullRequest: numField(contextRefs.pullRequest),
    byKind: sanitizeNumericRecord(contextRefs.byKind),
    copilotInstructions: numField(contextRefs.copilotInstructions),
    agentsMd: numField(contextRefs.agentsMd),
    byPath: sanitizeNumericRecord(contextRefs.byPath),
  };
}

function sanitizeChildInfo(sf: Record<string, unknown>) {
  if (!Array.isArray(sf.childInfo)) { return undefined; }
  return sf.childInfo
    .filter((child): child is Record<string, unknown> => !!child && typeof child === "object")
    .map((child) => ({
      uuid: String(child.uuid ?? ""),
      name: String(child.name ?? ""),
      sessionFile: optStr(child.sessionFile),
    }));
}

function sanitizeParentInfo(sf: Record<string, unknown>) {
  if (!sf.parentInfo || typeof sf.parentInfo !== "object") { return undefined; }
  const p = sf.parentInfo as Record<string, unknown>;
  return {
    uuid: String(p.uuid ?? ""),
    name: String(p.name ?? ""),
    sessionFile: optStr(p.sessionFile),
  };
}

function sanitizeSessionFileItem(item: unknown): SessionFileDetails {
  const sf = (item ?? {}) as Record<string, unknown>;
  const contextRefs = (sf.contextReferences ?? {}) as Record<string, unknown>;
  return {
    file: String(sf.file ?? sf.sessionFile ?? ""),
    editorSource: String(sf.editorSource ?? ""),
    editorRoot: optStr(sf.editorRoot),
    editorName: optStr(sf.editorName),
    title: optStr(sf.title),
    repository: optStr(sf.repository),
    size: numField(sf.size),
    modified: String(sf.modified ?? ""),
    tokens: numField(sf.tokens),
    interactions: numField(sf.interactions),
    firstInteraction: nullStr(sf.firstInteraction),
    lastInteraction: nullStr(sf.lastInteraction),
    contextReferences: sanitizeContextReferences(contextRefs),
    parentInfo: sanitizeParentInfo(sf),
    childInfo: sanitizeChildInfo(sf),
    totalChildCount: sf.totalChildCount === null || sf.totalChildCount === undefined ? undefined : Number(sf.totalChildCount),
  } as SessionFileDetails;
}

function sanitizeDetailedSessionFiles(input: unknown): SessionFileDetails[] {
  if (!Array.isArray(input)) {
    return [];
  }
  return input.map(sanitizeSessionFileItem);
}

function handleSessionFilesLoadProgress(message: DiagMessage): void {
  const processed = Number(message.processed || 0);
  const total = Number(message.total || 0);
  const progressText = total > 0 ? `Analyzing files… (${processed} / ${total})` : "Analyzing files…";

  const sessionSubtext = document.getElementById("session-loading-subtext");
  if (sessionSubtext) { sessionSubtext.textContent = progressText; }

  const shareSubtext = document.getElementById("share-loading-subtext");
  if (shareSubtext) { shareSubtext.textContent = progressText; }

  const modelUsageStatus = document.getElementById("model-usage-status");
  if (modelUsageStatus) {
    modelUsageStatus.textContent = total > 0 ? `⏳ Loading sessions… (${processed}/${total})` : "⏳ Loading sessions…";
  }
}

function handleSessionFilesLoaded(message: DiagMessage): void {
  storedDetailedFiles = sanitizeDetailedSessionFiles(message.detailedSessionFiles);
  isLoading = false;

  const sessionsTab = document.querySelector('.tab[data-tab="sessions"]');
  if (sessionsTab) {
    sessionsTab.textContent = `📁 Session Files (${storedDetailedFiles.length})`;
  }

  const modelUsageSelect = document.getElementById("model-usage-editor-select") as HTMLSelectElement | null;
  if (modelUsageSelect) {
    const editorStats = getEditorStats(storedDetailedFiles);
    const editorOptions = Object.keys(editorStats).sort()
      .map((editor) => `<option value="${escapeHtml(editor)}">${escapeHtml(getEditorIcon(editor))} ${escapeHtml(editor)} (${editorStats[editor].count})</option>`)
      .join("");
    setHtml(modelUsageSelect, `<option value="all">🌐 All Editors</option>${editorOptions}`);
    modelUsageSelect.disabled = false;
  }
  renderModelUsageTimeSelector(false);
  const modelUsageStatus = document.getElementById("model-usage-status");
  if (modelUsageStatus) { modelUsageStatus.textContent = ""; }

  triggerModelUsageAnalysis();

  reRenderTable();
  reRenderShareCard();
}

function handleCacheCleared(): void {
  const btnReport = document.getElementById(
    "btn-clear-cache",
  ) as HTMLButtonElement | null;
  const btnTab = document.getElementById(
    "btn-clear-cache-tab",
  ) as HTMLButtonElement | null;
  if (btnReport) {
    btnReport.style.background = "#2d6a4f";
    setHtml(btnReport, "<span>✅</span><span>Cache Cleared</span>");
    btnReport.disabled = false;
  }
  if (btnTab) {
    btnTab.style.background = "#2d6a4f";
    setHtml(btnTab, "<span>✅</span><span>Cache Cleared</span>");
    btnTab.disabled = false;
  }

  setTimeout(() => {
    if (btnReport) {
      btnReport.style.background = "";
      setHtml(btnReport, "<span>🗑️</span><span>Clear Cache</span>");
    }
    if (btnTab) {
      btnTab.style.background = "";
      setHtml(btnTab, "<span>🗑️</span><span>Clear Cache</span>");
    }
  }, 2000);
}

function updateCacheSummaryCards(cacheInfo: any, summaryCards: NodeListOf<Element>): void {
  if (summaryCards.length < 4) { return; }
  const entriesValue = summaryCards[0]?.querySelector(".summary-value");
  if (entriesValue) { entriesValue.textContent = String(cacheInfo.size); }
  const sizeValue = summaryCards[1]?.querySelector(".summary-value");
  if (sizeValue) { sizeValue.textContent = `${cacheInfo.sizeInMB.toFixed(2)} MB`; }
  const lastUpdatedValue = summaryCards[2]?.querySelector(".summary-value");
  if (lastUpdatedValue) { lastUpdatedValue.textContent = new Date(cacheInfo.lastUpdated).toLocaleString(); }
  const ageValue = summaryCards[3]?.querySelector(".summary-value");
  if (ageValue) { ageValue.textContent = "0 seconds ago"; }
}

function handleCacheRefreshed(message: DiagMessage): void {
  if (!message.cacheInfo) { return; }
  const cacheTabContent = document.getElementById("tab-cache");
  if (!cacheTabContent) { return; }
  updateCacheSummaryCards(message.cacheInfo, cacheTabContent.querySelectorAll(".summary-card"));
}

function handleFolderPicked(message: DiagMessage): void {
  const input = document.getElementById("folder-path-input") as HTMLInputElement | null;
  if (input && message.folderPath) {
    input.value = message.folderPath;
    input.style.borderColor = "";
  }
}

function handleFolderAnalysisResult(message: DiagMessage): void {
  const btn = document.getElementById("btn-analyze-folder") as HTMLButtonElement | null;
  if (btn) {
    btn.disabled = false;
    setHtml(btn, "<span>🔍</span><span>Analyze</span>");
  }
  const resultsDiv = document.getElementById("folder-analysis-results");
  if (resultsDiv) {
    if (message.error) {
      setHtml(resultsDiv, `
        <div class="info-box" style="border-color: #d97706; background: rgba(217,119,6,0.08); margin-top: 12px;">
          <div class="info-box-title">⚠️ Analysis Error</div>
          <div>${escapeHtml(message.error)}</div>
        </div>`);
    } else {
      setHtml(resultsDiv, renderFolderAnalysisResults(
        message.files || [],
        message.totalScanned || 0,
        message.parseErrors || 0,
        message.truncated || false,
        escapeHtml(String(message.folderPath || "")),
      ));
    }
  }
}

function setupMessageHandlers(): void {
  window.addEventListener("message", (event) => {
    const message = event.data as DiagMessage;
    if (message.command === "diagnosticDataLoaded") {
      handleDiagnosticDataLoaded(message);
    } else if (message.command === "backendStorageInfoLoaded") {
      handleBackendStorageSection(message);
    } else if (message.command === "githubAuthUpdated") {
      handleGithubAuthUpdated(message);
    } else if (message.command === "diagnosticDataError") {
      handleDiagnosticDataError(message);
    } else if (message.command === "sessionFilesLoaded" && message.detailedSessionFiles) {
      handleSessionFilesLoaded(message);
    } else if (message.command === "sessionFilesLoadProgress") {
      handleSessionFilesLoadProgress(message);
    } else if (message.command === "cacheCleared") {
      handleCacheCleared();
    } else if (message.command === "cacheRefreshed") {
      handleCacheRefreshed(message);
    } else if (message.command === "folderPicked") {
      handleFolderPicked(message);
    } else if (message.command === "folderAnalysisResult") {
      handleFolderAnalysisResult(message);
    } else if (message.command === "modelUsageResult") {
      handleModelUsageResult(message);
    }
  });
}

function renderDiagCacheTabHtml(data: DiagnosticsData): string {
  return `
<div id="tab-cache" class="tab-content">
<div class="info-box">
<div class="info-box-title">💾 Cache Information</div>
<div>
The extension caches session file data to improve performance and reduce file system operations.
Cache is stored in VS Code's global state and persists across sessions.
</div>
</div>
<div class="cache-details">
<div class="summary-cards">
<div class="summary-card">
<div class="summary-label">📦 Cache Entries</div>
<div class="summary-value">${data.cacheInfo?.size || 0}</div>
</div>
<div class="summary-card">
<div class="summary-label">💾 Cache Size</div>
<div class="summary-value">${data.cacheInfo?.sizeInMB ? data.cacheInfo.sizeInMB.toFixed(2) + " MB" : "N/A"}</div>
</div>
<div class="summary-card">
<div class="summary-label">🕒 Last Updated</div>
<div class="summary-value" style="font-size: 14px;">${data.cacheInfo?.lastUpdated ? formatDate(data.cacheInfo.lastUpdated) : "Never"}</div>
</div>
<div class="summary-card">
<div class="summary-label">⏱️ Cache Age</div>
<div class="summary-value" style="font-size: 14px;">${data.cacheInfo?.lastUpdated ? getTimeSince(data.cacheInfo.lastUpdated) : "N/A"}</div>
</div>
</div>
<div class="cache-location">
<h4>Storage Location</h4>
<div class="location-box">
<code>${escapeHtml(data.cacheInfo?.location || "VS Code Global State")}</code>
${data.cacheInfo?.storagePath ? ` <a href="#" class="open-storage-link" data-path="${encodeURIComponent(data.cacheInfo.storagePath)}">Open storage location</a>` : ""}
</div>
<p style="color: #999; font-size: 12px; margin-top: 8px;">
Cache is stored in VS Code's global state (extension storage) and includes:
<ul style="margin: 8px 0 0 20px;">
<li>Token counts per session file</li>
<li>Interaction counts</li>
<li>Model usage statistics</li>
<li>File modification timestamps for validation</li>
<li>Usage analysis data (tool calls, modes, context references)</li>
</ul>
</p>
</div>
<div class="cache-actions">
<h4>Cache Management</h4>
<p style="color: #999; font-size: 12px; margin-bottom: 12px;">
Clearing the cache will force the extension to re-read and re-analyze all session files on the next update.
This can help resolve issues with stale or incorrect data.
</p>
<div class="button-group" style="margin-top: 8px;">
<button class="button secondary" id="btn-clear-cache-tab"><span>🗑️</span><span>Clear Cache</span></button>
<button class="button secondary" id="btn-reset-insights-tab"><span>💡</span><span>Reset Insights Dismissals</span></button>
</div>
</div>
</div>
</div>`;
}

function sel(current: string, value: string): string {
  return current === value ? 'selected' : '';
}

function renderQuotaCardHtml(data: DiagnosticsData): string {
  const quotaContent = data.quotaEntitlements
    ? `<p>
${
      data.quotaEntitlements.premium_interactions
        ? `<strong>Premium Interactions:</strong> $${data.quotaEntitlements.premium_interactions.toFixed(2)}/month<br/>`
        : ''
}${
      data.quotaEntitlements.completions
        ? `<strong>Completions:</strong> $${data.quotaEntitlements.completions.toFixed(2)}/month<br/>`
        : ''
}
    </p>`
    : `<p class="hint">No quota information available from the API yet. Sign out and back in to refresh.</p>`;
  return `<div class="backend-card">
<h4>📊 API Quota Information</h4>
${quotaContent}
</div>`;
}

function renderEditorDiscoveryCardHtml(): string {
  return `<div class="backend-card">
<h4>🆕 Editor Discovery Notifications</h4>
<p>
The extension remembers which editors it has already seen so each editor triggers a discovery notification only once.
Use this reset to clear that memory and start tracking from scratch.
</p>
<div class="button-group">
<button class="button secondary" id="btn-reset-discovered-editors">
<span>♻️</span>
<span>Reset Discovered Editors</span>
</button>
</div>
</div>`;
}

function renderDiagDisplayTabHtml(data: DiagnosticsData): string {
  const showTokens = data.displaySettings?.showTokens ?? 'both';
  const showCost = data.displaySettings?.showCost ?? 'none';
  const monthlyBudget = Math.round((data.displaySettings?.monthlyBudget ?? 0) * 100) / 100;
  return `
<div id="tab-display" class="tab-content">
<div class="info-box">
<div class="info-box-title">⚙️ Display Settings</div>
<div>Configure what is shown in the status bar at the bottom of VS Code. Changes take effect immediately — no data refresh needed.</div>
</div>
<div class="backend-card">
<h4>📊 Status Bar Display</h4>
<p>
Choose what to show in the VS Code status bar toolbar. You can show token counts, estimated costs, both, or neither for each period.
</p>
<div style="display: grid; gap: 16px;">
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">🔢 Token counts:</label>
  <select id="select-show-tokens" class="settings-select" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px;">
    <option value="none" ${sel(showTokens, 'none')}>None</option>
    <option value="today" ${sel(showTokens, 'today')}>Today only</option>
    <option value="last30days" ${sel(showTokens, 'last30days')}>Last 30 days only</option>
    <option value="currentMonth" ${sel(showTokens, 'currentMonth')}>Current calendar month only</option>
    <option value="both" ${sel(showTokens, 'both')}>Today + last 30 days (default)</option>
    <option value="todayAndCurrentMonth" ${sel(showTokens, 'todayAndCurrentMonth')}>Today + current calendar month</option>
  </select>
</div>
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">💰 Estimated cost (USD):</label>
  <select id="select-show-cost" class="settings-select" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px;">
    <option value="none" ${sel(showCost, 'none')}>None (hidden)</option>
    <option value="today" ${sel(showCost, 'today')}>Today only</option>
    <option value="last30days" ${sel(showCost, 'last30days')}>Last 30 days only</option>
    <option value="currentMonth" ${sel(showCost, 'currentMonth')}>Current calendar month only</option>
    <option value="both" ${sel(showCost, 'both')}>Today + last 30 days</option>
    <option value="todayAndCurrentMonth" ${sel(showCost, 'todayAndCurrentMonth')}>Today + current calendar month</option>
  </select>
</div>
</div>
<p class="hint">Cost is estimated using GitHub Copilot AI-Credit rates (Usage Based Billing). Changes apply to the status bar immediately.</p>
</div>
<div class="backend-card">
<h4>💰 Monthly Budget</h4>
<p>
Set a monthly AI spend budget in USD to get visual alerts on the status bar. The bar turns yellow at 75%, orange at 90%, and red at 100% of your budget. Set to 0 to disable.
</p>
<div style="display: flex; align-items: center; gap: 12px;">
  <label style="min-width: 175px; font-size: 13px;">💵 Monthly budget (USD):</label>
  <input id="input-monthly-budget" type="number" min="0" max="99999" step="0.01" value="${monthlyBudget}" style="background: #2d2d2d; color: #ccc; border: 1px solid #555; border-radius: 4px; padding: 4px 8px; font-size: 13px; width: 100px;" />
</div>
<p class="hint">Budget coloring uses the current calendar month's estimated cost. Set to 0 to disable.</p>
${
  data.quotaEntitlements && data.quotaEntitlements.premium_interactions
    ? `<p class="hint" style="color: #90ee90;"><strong>ℹ️ API-driven budget:</strong> Your premium_interactions quota entitlement is <strong>$${data.quotaEntitlements.premium_interactions.toFixed(2)}</strong>/month. If the budget above is 0 or empty, this API value will be used as your effective budget.</p>`
    : ''
}
</div>
${renderQuotaCardHtml(data)}
${renderEditorDiscoveryCardHtml()}
<div class="backend-card">
<h4>🔢 Number Formatting</h4>
<p>
Token counts can be shown in compact format using K/M suffixes (e.g. <strong>1.5K</strong>, <strong>1.2M</strong>)
for quick scanning, or as full numbers (e.g. <strong>1,500</strong>, <strong>1,200,000</strong>) for precision.
</p>
<div class="button-group">
<button class="button" id="btn-open-display-settings">
<span>⚙️</span>
<span>Open Display Settings</span>
</button>
</div>
</div>
</div>`;
}

type ToolAnalysisRow = { tool: string; totalTokens: number; calls: number; isBuiltIn: boolean };

function getToolSortIndicator(col: typeof toolSortColumn): string {
  if (toolSortColumn !== col) { return ' <span class="sort-hint">↕</span>'; }
  return toolSortDir === "desc" ? " ▼" : " ▲";
}

/** Compute pooled avg tokens/call across a set of rows (built-in baseline). Returns NaN if no data. */
function pooledAvg(rows: ToolAnalysisRow[]): number {
  const totalCalls = rows.reduce((s, r) => s + r.calls, 0);
  const totalTokens = rows.reduce((s, r) => s + r.totalTokens, 0);
  return totalCalls > 0 ? totalTokens / totalCalls : NaN;
}

/** Sort rows by the current toolSortColumn/toolSortDir. */
function sortToolRows(rows: ToolAnalysisRow[]): ToolAnalysisRow[] {
  return [...rows].sort((a, b) => {
    let aVal: number | string, bVal: number | string;
    switch (toolSortColumn) {
      case "tool": aVal = a.tool.toLowerCase(); bVal = b.tool.toLowerCase(); break;
      case "calls": aVal = a.calls; bVal = b.calls; break;
      case "total": aVal = a.totalTokens; bVal = b.totalTokens; break;
      case "avg": default: aVal = a.calls > 0 ? a.totalTokens / a.calls : 0; bVal = b.calls > 0 ? b.totalTokens / b.calls : 0; break;
    }
    if (aVal < bVal) { return toolSortDir === "desc" ? 1 : -1; }
    if (aVal > bVal) { return toolSortDir === "desc" ? -1 : 1; }
    return 0;
  });
}

function renderToolRow(r: ToolAnalysisRow, builtInBaseline: number): string {
  const avg = r.calls > 0 ? Math.round(r.totalTokens / r.calls) : 0;
  let ratioHtml = '<td class="tool-ratio">—</td>';
  if (!r.isBuiltIn && !isNaN(builtInBaseline) && builtInBaseline > 0 && r.calls > 0) {
    const ratio = (r.totalTokens / r.calls) / builtInBaseline;
    const pct = Number(Math.round(ratio * 100)) || 0;
    const cls = ratio < 0.85 ? 'ratio-better' : ratio > 1.15 ? 'ratio-worse' : 'ratio-neutral';
    ratioHtml = `<td class="tool-ratio ${cls}" title="${pct}% of built-in average">${pct}%</td>`;
  } else if (r.isBuiltIn) {
    ratioHtml = '<td class="tool-ratio tool-builtin-label">baseline</td>';
  }
  const badge = r.isBuiltIn ? ' <span class="tool-type-badge built-in">built-in</span>' : ' <span class="tool-type-badge alternative">alt</span>';
  return `<tr><td>${escapeHtml(r.tool)}${badge}</td><td>${escapeHtml(String(r.calls))}</td><td>${formatTokenCount(r.totalTokens)}</td><td>${formatTokenCount(avg)}</td>${ratioHtml}</tr>`;
}

function renderToolAnalysisRows(rows: ToolAnalysisRow[], builtInBaseline: number = NaN): string {
  return sortToolRows(rows).map(r => renderToolRow(r, builtInBaseline)).join('');
}

/** Thead HTML shared across initial render and re-render. */
function toolAnalysisTheadHtml(): string {
  return `<tr>
<th class="tool-sortable" data-sort="tool">Tool${getToolSortIndicator("tool")}</th>
<th class="tool-sortable" data-sort="calls">Calls${getToolSortIndicator("calls")}</th>
<th class="tool-sortable" data-sort="total">Total Output Tokens${getToolSortIndicator("total")}</th>
<th class="tool-sortable" data-sort="avg">Avg Tokens / Call${getToolSortIndicator("avg")}</th>
<th>vs Built-in</th>
</tr>`;
}

/** Render one family section. Returns empty string if the family has no data. */
function renderToolFamilySection(
  family: ToolFamilyConfig,
  outputTokensByTool: { [key: string]: number },
  byTool: { [key: string]: number },
  assignedTools: Set<string>
): { html: string; rows: ToolAnalysisRow[] } {
  const buildRows = (names: string[], isBuiltIn: boolean): ToolAnalysisRow[] =>
    names
      .filter(t => outputTokensByTool[t] !== undefined && (byTool[t] || 0) > 0 && !assignedTools.has(t))
      .map(t => { assignedTools.add(t); return { tool: t, totalTokens: outputTokensByTool[t], calls: byTool[t] || 0, isBuiltIn }; });

  const builtInRows = buildRows(family.builtIn, true);
  const altRows = buildRows(family.alternatives, false);
  const allRows = [...builtInRows, ...altRows];
  if (allRows.length === 0) { return { html: '', rows: [] }; }

  const baseline = pooledAvg(builtInRows);
  const encodedRows = encodeURIComponent(JSON.stringify(allRows));
  const desc = family.description ? ` <span class="hint">${escapeHtml(family.description)}</span>` : '';
  const html = `
<div class="tool-family-section">
<h4 class="tool-family-heading">${escapeHtml(family.name)}${desc}</h4>
<table class="session-table tool-analysis-table" data-rows="${encodedRows}" data-baseline="${isNaN(baseline) ? '' : String(baseline)}">
<thead>${toolAnalysisTheadHtml()}</thead>
<tbody>${renderToolAnalysisRows(allRows, baseline)}</tbody>
</table>
</div>`;
  return { html, rows: allRows };
}

function renderToolAnalysisTab(toolCallStats: DiagnosticsData['toolCallStats'], families?: ToolFamilyConfig[]): string {
  if (!toolCallStats || !toolCallStats.outputTokensByTool || Object.keys(toolCallStats.outputTokensByTool).length === 0) {
    return `<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">🔧 Tool Output Token Analysis</div>
<div>Track how many tokens each tool produces as output over the last 30 days. Data is collected as you use the extension — no output token data has been recorded yet.</div>
</div>
</div>`;
  }
  const outputTokensByTool = toolCallStats.outputTokensByTool;
  const byTool = toolCallStats.byTool;
  const assignedTools = new Set<string>();
  let sectionsHtml = '';

  if (families && families.length > 0) {
    for (const family of families) {
      const { html } = renderToolFamilySection(family, outputTokensByTool, byTool, assignedTools);
      sectionsHtml += html;
    }
  }

  // Remaining tools not in any family
  const otherRows: ToolAnalysisRow[] = Object.entries(outputTokensByTool)
    .filter(([t]) => !assignedTools.has(t) && (byTool[t] || 0) > 0)
    .map(([t, tokens]) => ({ tool: t, totalTokens: tokens, calls: byTool[t] || 0, isBuiltIn: false }));
  if (otherRows.length > 0) {
    const encodedOther = encodeURIComponent(JSON.stringify(otherRows));
    sectionsHtml += `
<div class="tool-family-section">
<h4 class="tool-family-heading">Other Tools</h4>
<table class="session-table tool-analysis-table" data-rows="${encodedOther}" data-baseline="">
<thead>${toolAnalysisTheadHtml()}</thead>
<tbody>${renderToolAnalysisRows(otherRows, NaN)}</tbody>
</table>
</div>`;
  }

  return `<div id="tab-tool-analysis" class="tab-content">
<div class="info-box">
<div class="info-box-title">🔧 Tool Output Token Analysis</div>
<div>Tokens produced by each tool's output over the last 30 days. Tools are grouped by family. <strong>vs Built-in</strong> shows how an alternative compares to the pooled baseline — green is more token-efficient. Click column headers to sort within each group. <button class="inline-link" id="btn-open-tool-families-settings">Configure tool families ↗</button></div>
</div>
${sectionsHtml}
</div>`;
}

/**
 * Renders per-skill invocation counts (e.g. Claude Code's `/graphify`, custom SKILL.md
 * workflows) over the last 30 days. Adapter-agnostic by design — populated only for
 * editors whose session logs expose a distinguishable skill name (currently Claude Code
 * and Claude Desktop); other editors show the empty state until their format is mapped.
 */
function renderSkillUsageTab(skillCallStats: DiagnosticsData['skillCallStats']): string {
  const byName = skillCallStats?.byName ?? {};
  const rows = Object.entries(byName).sort((a, b) => b[1] - a[1]);
  if (rows.length === 0) {
    return `<div id="tab-skill-usage" class="tab-content">
<div class="info-box">
<div class="info-box-title">🧩 Skill Usage</div>
<div>Tracks how often each agent skill (e.g. a <code>/skill-name</code> invocation or another editor's <code>SKILL.md</code> workflow) was invoked over the last 30 days. No skill invocations have been recorded yet. Skill usage is currently detected for Claude Code, Claude Desktop, and Copilot CLI sessions — support for other editors depends on whether their session logs expose a distinguishable skill name.</div>
</div>
</div>`;
  }
  const total = rows.reduce((sum, [, count]) => sum + count, 0);
  const bodyRows = rows
    .map(([name, count]) => `<tr><td>${escapeHtml(name)}</td><td>${formatTokenCount(count)}</td></tr>`)
    .join('');
  return `<div id="tab-skill-usage" class="tab-content">
<div class="info-box">
<div class="info-box-title">🧩 Skill Usage</div>
<div>${formatTokenCount(total)} skill invocation(s) across ${rows.length} skill(s) in the last 30 days. Currently detected for Claude Code / Claude Desktop / Copilot CLI sessions.</div>
</div>
<table class="session-table skill-usage-table">
<thead><tr><th>Skill</th><th>Invocations</th></tr></thead>
<tbody>${bodyRows}</tbody>
</table>
</div>`;
}

function renderOtelDeltaSetupNotice(comparison: CopilotCliOtelComparison | null | undefined): string {
  if (comparison && comparison.otelSessionsIndexed > 0) { return ''; }
  const dirStatus = comparison?.otelDirExists
    ? `The export directory exists but no session data has been indexed from it yet (${Number(comparison.otelFileCount)} file(s) found).`
    : `No <code>~/.copilot/otel</code> directory was found — the export isn't enabled yet.`;
  return `<div class="info-box">
<div class="info-box-title">📡 Copilot CLI OpenTelemetry Export Not Detected</div>
<div>
${dirStatus} Enabling it lets this extension read <strong>exact</strong> token counts (input, output, cache) straight from Copilot CLI instead of estimating them from ratios.<br/><br/>
Set these three environment variables before starting a Copilot CLI session, then run a session and reopen this tab:
<pre style="margin-top:8px;">COPILOT_OTEL_ENABLED=true
COPILOT_OTEL_EXPORTER_TYPE=file
COPILOT_OTEL_FILE_EXPORTER_PATH=~/.copilot/otel/copilot-otel.jsonl</pre>
See <code>docs/COPILOT-CLI-OTEL-EXPORT.md</code> in the repo for full setup steps (Windows/PowerShell and Unix shells) and how to verify it's working.
</div>
</div>`;
}

/** Formats a signed token delta as e.g. "+12.3K" / "-4.0K" / "0", with a class for coloring. */
function formatTokenDelta(rawDelta: number): { text: string; cssClass: string } {
  const delta = Number(rawDelta) || 0;
  if (delta === 0) { return { text: '0', cssClass: '' }; }
  const sign = delta > 0 ? '+' : '-';
  const cssClass = delta > 0 ? 'otel-delta-positive' : 'otel-delta-negative';
  return { text: `${sign}${formatTokenCount(Math.abs(delta))}`, cssClass };
}

/** Local (not UTC) start-of-day, for comparing a session's lastActivity against "today"/"yesterday". */
function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function otelSessionMatchesPeriod(lastActivity: string | null, period: OtelDeltaPeriod, now: Date): boolean {
  if (period === "all") { return true; }
  if (!lastActivity) { return false; }
  const activity = new Date(lastActivity);
  if (Number.isNaN(activity.getTime())) { return false; }
  const today = startOfLocalDay(now);
  const activityDay = startOfLocalDay(activity);
  if (period === "today") { return activityDay.getTime() === today.getTime(); }
  if (period === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return activityDay.getTime() === yesterday.getTime();
  }
  if (period === "week") {
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - 6); // rolling 7 days including today
    return activity >= weekStart && activity <= now;
  }
  // month: current calendar month to date
  return activity.getFullYear() === now.getFullYear() && activity.getMonth() === now.getMonth() && activity <= now;
}

/** Filters an OTel comparison to sessions matching the given period, recomputing the aggregate totals from the subset. */
function filterOtelComparisonByPeriod(comparison: CopilotCliOtelComparison, period: OtelDeltaPeriod): CopilotCliOtelComparison {
  if (period === "all") { return comparison; }
  const now = new Date();
  const sessions = comparison.sessions.filter(s => otelSessionMatchesPeriod(s.lastActivity, period, now));
  const totalBaselineTokens = sessions.reduce((sum, s) => sum + s.baselineTokens, 0);
  const totalOtelTokens = sessions.reduce((sum, s) => sum + s.otelTokens, 0);
  return {
    ...comparison,
    sessions,
    sessionsMatched: sessions.length,
    totalBaselineTokens,
    totalOtelTokens,
    deltaTokens: totalOtelTokens - totalBaselineTokens,
  };
}

const OTEL_DELTA_PERIOD_LABELS: Record<OtelDeltaPeriod, string> = {
  all: "All Time", today: "Today", yesterday: "Yesterday", week: "This Week", month: "This Month",
};

function renderOtelDeltaPeriodSelector(period: OtelDeltaPeriod): string {
  const options = (Object.keys(OTEL_DELTA_PERIOD_LABELS) as OtelDeltaPeriod[])
    .map(p => `<option value="${p}"${p === period ? ' selected' : ''}>${OTEL_DELTA_PERIOD_LABELS[p]}</option>`)
    .join('');
  return `<div class="otel-delta-period-row">
<label for="otel-delta-period">Show:</label>
<select id="otel-delta-period" class="otel-delta-period-select">${options}</select>
</div>`;
}

function renderOtelDeltaSummaryCards(comparison: CopilotCliOtelComparison): string {
  const delta = formatTokenDelta(comparison.deltaTokens);
  const sessionsMatched = Number(comparison.sessionsMatched) || 0;
  const totalBaselineTokens = Number(comparison.totalBaselineTokens) || 0;
  const totalOtelTokens = Number(comparison.totalOtelTokens) || 0;
  const deltaTokens = Number(comparison.deltaTokens) || 0;
  return `<div class="summary-cards">
<div class="summary-card">
<div class="summary-label">📡 Sessions With OTel Data</div>
<div class="summary-value">${sessionsMatched.toLocaleString()}</div>
</div>
<div class="summary-card">
<div class="summary-label">📊 Previous Estimate (Total)</div>
<div class="summary-value" title="${totalBaselineTokens.toLocaleString()} tokens">${formatTokenCount(totalBaselineTokens)}</div>
</div>
<div class="summary-card">
<div class="summary-label">🎯 OTel Exact (Total)</div>
<div class="summary-value" title="${totalOtelTokens.toLocaleString()} tokens">${formatTokenCount(totalOtelTokens)}</div>
</div>
<div class="summary-card">
<div class="summary-label">Δ Delta</div>
<div class="summary-value ${delta.cssClass}" title="${deltaTokens.toLocaleString()} tokens">${delta.text}</div>
</div>
</div>`;
}

function renderOtelDeltaSessionRows(sessions: CopilotCliOtelComparisonSession[]): string {
  return sessions.map(s => {
    const delta = formatTokenDelta(s.delta);
    const shortId = escapeHtml(String(s.sessionId ?? '').slice(0, 8));
    const models = escapeHtml((Array.isArray(s.models) ? s.models : []).map(m => String(m)).join(', ') || '—');
    const baselineTokens = Number(s.baselineTokens) || 0;
    const otelTokens = Number(s.otelTokens) || 0;
    return `<tr>
<td title="${escapeHtml(String(s.sessionId ?? ''))}"><code>${shortId}</code></td>
<td>${models}</td>
<td title="${baselineTokens.toLocaleString()} tokens">${formatTokenCount(baselineTokens)}</td>
<td title="${otelTokens.toLocaleString()} tokens">${formatTokenCount(otelTokens)}</td>
<td class="${delta.cssClass}" title="${(Number(s.delta) || 0).toLocaleString()} tokens">${delta.text}</td>
</tr>`;
  }).join('');
}

function renderOtelDeltaTab(comparison: CopilotCliOtelComparison | null | undefined, period: OtelDeltaPeriod = currentOtelDeltaPeriod): string {
  const setupNotice = renderOtelDeltaSetupNotice(comparison);
  if (!comparison || comparison.sessionsMatched === 0) {
    return `<div id="tab-otel-delta" class="tab-content">
<div class="info-box">
<div class="info-box-title">📡 OTel vs. Estimated Token Counts</div>
<div>Compares the token counts this extension estimates for Copilot CLI sessions against exact counts read from Copilot CLI's OpenTelemetry export, when available.</div>
</div>
${setupNotice}
</div>`;
  }
  const filtered = filterOtelComparisonByPeriod(comparison, period);
  const tableOrEmpty = filtered.sessions.length > 0
    ? `<table class="session-table">
<thead><tr><th>Session</th><th>Model(s)</th><th>Previous Estimate</th><th>OTel Exact</th><th>Delta</th></tr></thead>
<tbody>${renderOtelDeltaSessionRows(filtered.sessions)}</tbody>
</table>`
    : `<div class="info-box">No Copilot CLI sessions with OTel data in this period. Try a wider range.</div>`;
  return `<div id="tab-otel-delta" class="tab-content">
<div class="info-box">
<div class="info-box-title">📡 OTel vs. Estimated Token Counts</div>
<div>
Compares the token counts this extension would normally estimate for each Copilot CLI session against the exact counts read from Copilot CLI's OpenTelemetry file export. A positive delta means OTel revealed usage the estimate missed entirely (e.g. chat-only sessions, which previously reported 0 tokens); near-zero deltas mean the estimate already had exact numbers from a session.shutdown event.<br/>
Checked ${(Number(comparison.sessionsChecked) || 0).toLocaleString()} Copilot CLI session(s) found locally; ${(Number(comparison.otelSessionsIndexed) || 0).toLocaleString()} session(s) are present in the OTel export.
</div>
</div>
${setupNotice}
${renderOtelDeltaPeriodSelector(period)}
${renderOtelDeltaSummaryCards(filtered)}
${tableOrEmpty}
</div>`;
}

function buildDiagReportTabHtml(escapedReport: string): string {
  return `<div id="tab-report" class="tab-content active">
<div class="info-box">
<div class="info-box-title">📋 About This Report</div>
<div>
This diagnostic report contains information about your AI Engineering Fluency extension
extension setup and usage statistics. </br> It does <strong>not</strong> include any of your
code or conversation content. You can safely share this report when reporting issues.
</div>
</div>
<div class="button-group" style="margin-bottom: 12px;">
<button class="button" id="btn-copy"><span>📋</span><span>Copy to Clipboard</span></button>
<button class="button secondary" id="btn-issue"><span>🐛</span><span>Open GitHub Issue</span></button>
<button class="button secondary" id="btn-clear-cache"><span>🗑️</span><span>Clear Cache</span></button>
<button class="button secondary" id="btn-reset-insights"><span>💡</span><span>Reset Insights Dismissals</span></button>
</div>
<div class="report-content">${escapedReport}</div>
</div>`;
}

function buildDiagRootHtml(
  data: DiagnosticsData,
  detailedFiles: SessionFileDetails[],
  escapedReport: string,
): string {
  return `
<style>${themeStyles}</style>
<style>${styles}</style>
<div class="container">
<div class="header">
<div class="header-left">
<span class="header-icon">🔍</span>
<span class="header-title">Diagnostic Report</span>
</div>
<div class="button-row">
${navButtonsHtml("btn-diagnostics", !!data?.backendConfigured)}
</div>
</div>

<div class="tabs group-tabs">
<button class="group-tab active" data-group="diagnostics">🩺 Diagnostics</button>
<button class="group-tab" data-group="research">🔬 Research</button>
<button class="group-tab" data-group="settings">⚙️ Settings</button>
</div>

<div class="tabs leaf-tabs" data-group="diagnostics" style="display: flex;">
<button class="tab active" data-tab="report">📋 Report</button>
<button class="tab" data-tab="sessions">📁 Session Files (${detailedFiles.length})</button>
<button class="tab" data-tab="cache">💾 Cache</button>
<button class="tab" data-tab="path-analyzer">🔬 Path Analyzer</button>
<button class="tab" data-tab="share">📸 Share Card</button>
</div>

<div class="tabs leaf-tabs" data-group="research" style="display: none;">
<button class="tab" data-tab="model-usage">🧮 Model Usage</button>
<button class="tab" data-tab="tool-analysis">🔧 Tool Analysis</button>
<button class="tab" data-tab="skill-usage">🧩 Skill Usage</button>
<button class="tab" data-tab="otel-delta">📡 OTel Delta</button>
</div>

<div class="tabs leaf-tabs" data-group="settings" style="display: none;">
<button class="tab" data-tab="display">⚙️ Display</button>
<button class="tab" data-tab="backend">☁️ Backend Storage</button>
<button class="tab" data-tab="github">🔑 GitHub Auth</button>
${data.isDebugMode ? '<button class="tab" data-tab="debug">🐛 Debug</button>' : ''}
</div>

${buildDiagReportTabHtml(escapedReport)}

<div id="tab-sessions" class="tab-content">
<div class="info-box"><div class="info-box-title">📁 Session File Analysis</div><div>
This tab shows session files with activity in the last 14 days from all detected editors. </br>
Click on an editor panel to filter, click column headers to sort, and click a file name to open it.
</div></div>
<div id="session-table-container">${renderSessionTable(detailedFiles, detailedFiles.length === 0)}</div>
</div>

${renderDiagCacheTabHtml(data)}
<div id="tab-backend" class="tab-content">
${renderBackendStoragePanel(data.backendStorageInfo, data.githubAuth)}
</div>

<div id="tab-github" class="tab-content">
${renderGitHubAuthPanel(data.githubAuth)}
</div>
${renderDiagDisplayTabHtml(data)}
${data.isDebugMode ? renderDebugTab(data.globalStateCounters) : ''}
<div id="tab-path-analyzer" class="tab-content">
${renderFolderAnalyzerTab()}
</div>
${renderShareCardTab(detailedFiles, isLoading)}
<div id="tab-model-usage" class="tab-content">
${renderModelUsageTab(detailedFiles, isLoading)}
</div>
${renderToolAnalysisTab(data.toolCallStats, data.toolFamilies)}
${renderSkillUsageTab(data.skillCallStats)}
${renderOtelDeltaTab(data.otelComparison)}
</div>
`;
}

function renderLayout(data: DiagnosticsData): void {
  const root = document.getElementById("root");
  if (!root) {
    return;
  }

  // Initialise module-level render state
  const detailedFiles = data.detailedSessionFiles || [];
  storedDetailedFiles = detailedFiles;
  isLoading = detailedFiles.length === 0;
  currentBackendInfo = data.backendStorageInfo;
  currentGithubAuth = data.githubAuth;
  currentOtelComparison = data.otelComparison;
  if (data.toolFamilies) { storedToolFamilies = data.toolFamilies; }

  const reportIsLoading = data.report === LOADING_PLACEHOLDER;
  const escapedReport = reportIsLoading
    ? LOADING_MESSAGE.trim()
    : removeSessionFilesSection(escapeHtml(data.report));

  setHtml(root, buildDiagRootHtml(data, detailedFiles, escapedReport));

  // Render session folders via DOM API (XSS-safe, no innerHTML)
  const sessionFolders = groupSessionFolders(data.sessionFolders || []);
  if (sessionFolders.length > 0) {
    const reportTab = document.getElementById("tab-report");
    const reportContent = reportTab?.querySelector(".report-content");
    if (reportContent) {
      reportContent.insertAdjacentElement("afterend", buildSessionFoldersElement(sessionFolders));
    }
  }

  setupMessageHandlers();
  setupTabHandlers();
  setupGroupHandlers();
  setupSortHandlers();
  setupEditorFilterHandlers();
  setupContextRefFilterHandlers();
  setupZeroInteractionFilterHandler();
  setupUnattributedFilterHandler();
  setupBackendButtonHandlers();
  setupSubtabHandlers();
  setupFileLinks();
  setupStorageLinkHandlers();
  setupGitHubAuthHandlers();
  setupFolderAnalyzerHandlers();
  setupModelUsageHandlers();
  renderModelUsageTimeSelector(isLoading);
  setupButtonHandlers();
  setupDisplaySettingHandlers();
  setupToolAnalysisSortHandlers();
  setupOtelDeltaPeriodHandler();

  const savedState = diagState.restore();
  let restoredTab = "report";
  if (savedState?.activeTab && activateTab(savedState.activeTab)) {
    restoredTab = savedState.activeTab;
  } else {
    activateTab("report");
  }
  activateGroup(groupOfTab(restoredTab));

  if (savedState?.activeSubtab) {
    activateSubtab(savedState.activeSubtab);
  }
}
async function bootstrap(): Promise<void> {
  await import('@vscode-elements/elements/dist/vscode-button/index.js');

  if (!initialData) {
    const root = document.getElementById("root");
    if (root) {
      root.textContent = "No data available.";
    }
    return;
  }
  renderLayout(initialData);
}

void bootstrap();
