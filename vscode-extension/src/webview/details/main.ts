// Import shared utilities
import { getModelDisplayName } from '../shared/modelUtils';
import { getEditorIcon, getCharsPerToken, formatFixed, formatPercent, formatNumber, formatCost, formatCompact, setCompactNumbers } from '../shared/formatUtils';
import { el, createButton } from '../shared/domUtils';
import { BUTTONS } from '../shared/buttonConfig';
import { wireExtensionPointButtons } from '../shared/extensionPoints';
// Token estimators loaded from JSON
// @ts-ignore
import tokenEstimatorsJson from '../../tokenEstimators.json';
// CSS imported as text via esbuild
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../shared/dataLoader';
import { registerMessageHandler } from '../shared/messageHandler';
import type { ModelUsage } from '../shared/types';

type EditorUsage = Record<string, { tokens: number; sessions: number }>;
type TableSortKey = 'name' | 'today' | 'last30Days' | 'month' | 'lastMonth' | 'projected';
type SortDir = 'asc' | 'desc';

type PeriodStats = {
tokens: number;
thinkingTokens: number;
estimatedTokens: number;
actualTokens: number;
sessions: number;
avgInteractionsPerSession: number;
avgTokensPerSession: number;
modelUsage: ModelUsage;
editorUsage: EditorUsage;
co2: number;
treesEquivalent: number;
waterUsage: number;
estimatedCost: number;
estimatedCostCopilot?: number;
cachedTokens?: number;
};

type DetailedStats = {
today: PeriodStats;
month: PeriodStats;
lastMonth: PeriodStats;
last30Days: PeriodStats;
lastUpdated: string | Date;
backendConfigured?: boolean;
compactNumbers?: boolean;
copilotPlan?: {
planId: string;
planName: string;
monthlyAiCreditsUsd: number;
monthlyPremiumRequests: number | null;
};
sortSettings?: {
editor?: { key?: string; dir?: string };
model?: { key?: string; dir?: string };
modelOtherExpanded?: boolean;
};
};

/** Strongly-typed messages sent from the webview to the extension host. */
type WebviewMessage =
| { command: 'refresh' }
| { command: 'showChart' }
| { command: 'showUsageAnalysis' }
| { command: 'showDiagnostics' }
| { command: 'showMaturity' }
| { command: 'showDashboard' }
| { command: 'showEnvironmental' }
| { command: 'saveSortSettings'; settings: {
editor: { key: TableSortKey; dir: SortDir };
model: { key: TableSortKey; dir: SortDir };
modelOtherExpanded: boolean;
}};

/** Aggregated projection values calculated from last-30-days data. */
type Projections = {
projectedTokens: number;
projectedSessions: number;
projectedCo2: number;
projectedWater: number;
projectedCost: number;
projectedCostCopilot?: number;
projectedTrees: number;
};

// VS Code injects this in the webview environment
declare function acquireVsCodeApi<TState = unknown>(): {
postMessage: (message: WebviewMessage) => void;
setState: (newState: TState) => void;
getState: () => TState | undefined;
};

type VSCodeApi = ReturnType<typeof acquireVsCodeApi>;

declare global {
	interface Window {
		Chart?: unknown;
	}
}

const vscode: VSCodeApi = acquireVsCodeApi();
const initialData = getWindowData<DetailedStats>('__INITIAL_DETAILS__');
console.log('[CopilotTokenTracker] details webview loaded');
console.log('[CopilotTokenTracker] initialData:', initialData);
console.log('[CopilotTokenTracker] initialData:', initialData);

const _initSort = initialData?.sortSettings;
let editorSortKey: TableSortKey = (_initSort?.editor?.key as TableSortKey) ?? 'name';
let editorSortDir: SortDir = (_initSort?.editor?.dir as SortDir) ?? 'asc';
let modelSortKey: TableSortKey = (_initSort?.model?.key as TableSortKey) ?? 'name';
let modelSortDir: SortDir = (_initSort?.model?.dir as SortDir) ?? 'asc';
let modelOtherExpanded: boolean = (_initSort?.modelOtherExpanded) ?? false;

function calculateProjection(last30DaysValue: number): number {
// Project annual value based on last 30 days average
// This gives better predictions at the beginning of the month
const daysInYear = 365.25; // Average days per year (accounting for leap year cycle)
return (last30DaysValue / 30) * daysInYear;
}

// ---------------------------------------------------------------------------
// Small DOM helpers
// ---------------------------------------------------------------------------

/**
 * Creates a right-aligned value cell with an optional muted sub-text line.
 */
function buildValueCell(mainValue: string, subText?: string): HTMLTableCellElement {
const td = document.createElement('td');
td.className = 'value-right align-right';
td.textContent = mainValue;
if (subText !== undefined) {
td.append(el('div', 'muted', subText));
}
return td;
}

/**
 * Creates a label cell containing an icon span and a text span, with an
 * optional colour applied to the icon and an optional tooltip hint.
 */
function buildMetricLabelCell(icon: string, label: string, color?: string, tooltip?: string): HTMLTableCellElement {
const td = document.createElement('td');
const labelWrapper = document.createElement('span');
labelWrapper.className = 'metric-label';

const iconSpan = document.createElement('span');
iconSpan.textContent = icon;
if (color) { iconSpan.style.color = color; }

const textSpan = document.createElement('span');
textSpan.textContent = label;

if (tooltip) {
labelWrapper.title = tooltip;
labelWrapper.style.cursor = 'help';
const hintSpan = document.createElement('span');
hintSpan.textContent = ' ℹ️';
hintSpan.style.cssText = 'font-size:0.75em; opacity:0.6;';
textSpan.append(hintSpan);
}

labelWrapper.append(iconSpan, textSpan);
td.append(labelWrapper);
return td;
}

/** Column definition used by buildSortableTableHeader. */
type ColHeader = { icon: string; text: string; key: TableSortKey };

/**
 * Builds a `<thead>` with sortable column headers and returns both the element
 * and an `updateHeaders()` function that refreshes the sort indicators.
 *
 * @param columns      Column definitions (icon, display text, sort key).
 * @param getSortKey   Returns the currently active sort key.
 * @param getSortDir   Returns the currently active sort direction.
 * @param onSort       Called with the clicked column key; should update module
 *                     state, rebuild the tbody, and persist settings.
 */
function buildSortableTableHeader(
columns: ColHeader[],
getSortKey: () => TableSortKey,
getSortDir: () => SortDir,
onSort: (key: TableSortKey) => void
): { thead: HTMLTableSectionElement; updateHeaders: () => void } {
const thead = document.createElement('thead');
const headerRow = document.createElement('tr');
const wraps: HTMLElement[] = [];

function updateHeaders(): void {
wraps.forEach((w, i) => {
w.textContent = `${columns[i].icon} ${columns[i].text}${getSortIndicator(columns[i].key, getSortKey(), getSortDir())}`;
});
}

columns.forEach((h, idx) => {
const th = document.createElement('th');
th.className = idx === 0 ? '' : 'align-right';
th.style.cursor = 'pointer';
th.style.userSelect = 'none';
th.title = `Sort by ${h.text}`;
const wrap = el('div', 'period-header');
wrap.textContent = `${h.icon} ${h.text}${getSortIndicator(h.key, getSortKey(), getSortDir())}`;
th.append(wrap);
wraps.push(wrap);
th.addEventListener('click', () => {
onSort(h.key);
updateHeaders();
});
headerRow.append(th);
});

thead.append(headerRow);
return { thead, updateHeaders };
}

// ---------------------------------------------------------------------------
// Core rendering
// ---------------------------------------------------------------------------

function render(stats: DetailedStats): void {
setCompactNumbers(stats.compactNumbers !== false);
const root = document.getElementById('root');
if (!root) { return; }

const projectedTokens = Math.round(calculateProjection(stats.last30Days.tokens));
const projectedSessions = Math.round(calculateProjection(stats.last30Days.sessions));
const projectedCo2 = calculateProjection(stats.last30Days.co2);
const projectedWater = calculateProjection(stats.last30Days.waterUsage);
const projectedCost = calculateProjection(stats.last30Days.estimatedCost);
const projectedCostCopilot = calculateProjection(stats.last30Days.estimatedCostCopilot ?? 0);
const projectedTrees = calculateProjection(stats.last30Days.treesEquivalent);

renderShell(root, stats, {
projectedTokens,
projectedSessions,
projectedCo2,
projectedWater,
projectedCost,
projectedCostCopilot,
projectedTrees
});

wireButtons();
}

function renderShell(
root: HTMLElement,
stats: DetailedStats,
projections: Projections
): void {
const lastUpdated = new Date(stats.lastUpdated);

root.replaceChildren();

// Inject theme styles first, then component styles
const themeStyle = document.createElement('style');
themeStyle.textContent = themeStyles;

const style = document.createElement('style');
style.textContent = styles;

const container = el('div', 'container');
const header = el('div', 'header');
const title = el('div', 'title', 'AI Engineering Fluency');
const buttonRow = el('div', 'button-row');

buttonRow.append(
createButton(BUTTONS['btn-refresh']),
createButton(BUTTONS['btn-chart']),
createButton(BUTTONS['btn-usage']),
createButton(BUTTONS['btn-environmental']),
createButton(BUTTONS['btn-diagnostics']),
createButton(BUTTONS['btn-maturity']),
);
if (stats.backendConfigured) {
buttonRow.append(createButton(BUTTONS['btn-dashboard']));
}

header.append(title, buttonRow);

const footer = el('div', 'footer', `Last updated: ${lastUpdated.toLocaleString()} · Updates every 5 minutes`);

const sections = el('div', 'sections');

const isEmptyState = (stats.today.tokens ?? 0) === 0 && (stats.last30Days.tokens ?? 0) === 0 && (stats.lastMonth.tokens ?? 0) === 0;
if (isEmptyState) {
sections.append(buildEmptyStateSection());
}

sections.append(buildMetricsSection(stats, projections));

const editorSection = buildEditorUsageSection(stats);
if (editorSection) {
sections.append(editorSection);
}

const modelSection = buildModelUsageSection(stats);
if (modelSection) {
sections.append(modelSection);
}

container.append(header, sections, footer);
root.append(themeStyle, style, container);
}

type MetricRow = { label: string; labelTooltip?: string; icon: string; color?: string; today: string; last30Days: string; month: string; lastMonth: string; projected: string };

function sumInputTokens(p: PeriodStats): number {
	return Object.values(p.modelUsage).reduce((s, m) => s + m.inputTokens, 0);
}

function sumOutputTokens(p: PeriodStats): number {
	return Object.values(p.modelUsage).reduce((s, m) => s + m.outputTokens, 0);
}

function hasActualTokens(p: PeriodStats): boolean {
	return (p.actualTokens || 0) > 0;
}

function serviceOverheadPct(p: PeriodStats): string {
	return hasActualTokens(p) ? formatPercent(((p.actualTokens - p.estimatedTokens) / p.actualTokens) * 100) : '—';
}

function inputTokenCell(p: PeriodStats): string {
	return hasActualTokens(p) ? formatCompact(sumInputTokens(p)) : '—';
}

function outputTokenCell(p: PeriodStats): string {
	return hasActualTokens(p) ? formatCompact(sumOutputTokens(p)) : '—';
}

function totalTokenCell(p: PeriodStats): string {
	const modelTotal = sumInputTokens(p) + sumOutputTokens(p);
	return formatCompact(modelTotal > 0 ? modelTotal : p.tokens);
}

function buildCachedTokenRow(stats: DetailedStats): MetricRow[] {
	if (!(stats.today.cachedTokens || stats.last30Days.cachedTokens || stats.month.cachedTokens || stats.lastMonth.cachedTokens)) {
		return [];
	}
	return [{ label: 'Cached tokens', icon: '⚡', color: '#34d399', today: formatCompact(stats.today.cachedTokens || 0), last30Days: formatCompact(stats.last30Days.cachedTokens || 0), month: formatCompact(stats.month.cachedTokens || 0), lastMonth: formatCompact(stats.lastMonth.cachedTokens || 0), projected: '—' }];
}

function buildCopilotPlanRow(stats: DetailedStats): MetricRow[] {
	if (!stats.copilotPlan) { return []; }
	const plan = stats.copilotPlan;
	const credits = plan.monthlyAiCreditsUsd > 0 ? `$${plan.monthlyAiCreditsUsd} credits/month` : 'no credits';
	return [{ label: `${plan.planName} (${credits})`, labelTooltip: `Your active GitHub Copilot subscription plan (ID: ${plan.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`, icon: '🏷️', color: '#60a5fa', today: '—', last30Days: '—', month: '—', lastMonth: '—', projected: '—' }];
}

function buildMetricsRows(stats: DetailedStats, projections: Projections): MetricRow[] {
	const rows: MetricRow[] = [
		{ label: 'Tokens (input+output)', icon: '🟣', color: '#c37bff', today: totalTokenCell(stats.today), last30Days: totalTokenCell(stats.last30Days), month: totalTokenCell(stats.month), lastMonth: totalTokenCell(stats.lastMonth), projected: formatCompact(projections.projectedTokens) },
		{ label: 'Input tokens', icon: '⬆️', color: '#c37bff', today: inputTokenCell(stats.today), last30Days: inputTokenCell(stats.last30Days), month: inputTokenCell(stats.month), lastMonth: inputTokenCell(stats.lastMonth), projected: '—' },
		{ label: 'Output tokens', icon: '⬇️', color: '#c37bff', today: outputTokenCell(stats.today), last30Days: outputTokenCell(stats.last30Days), month: outputTokenCell(stats.month), lastMonth: outputTokenCell(stats.lastMonth), projected: '—' },
		...buildCachedTokenRow(stats),
		{ label: 'Tokens (user estimated)', icon: '📝', color: '#b39ddb', today: formatCompact(stats.today.estimatedTokens), last30Days: formatCompact(stats.last30Days.estimatedTokens), month: formatCompact(stats.month.estimatedTokens), lastMonth: formatCompact(stats.lastMonth.estimatedTokens), projected: '—' },
		{ label: 'Service overhead %', icon: '☁️', color: '#90a4ae', today: serviceOverheadPct(stats.today), last30Days: serviceOverheadPct(stats.last30Days), month: serviceOverheadPct(stats.month), lastMonth: serviceOverheadPct(stats.lastMonth), projected: '—' },
		{ label: 'Thinking tokens', icon: '🧠', color: '#a78bfa', today: formatCompact(stats.today.thinkingTokens || 0), last30Days: formatCompact(stats.last30Days.thinkingTokens || 0), month: formatCompact(stats.month.thinkingTokens || 0), lastMonth: formatCompact(stats.lastMonth.thinkingTokens || 0), projected: '—' },
		{ label: 'Estimated cost (UBB)', labelTooltip: 'Based on GitHub Copilot AI Credit rates (1 credit = $0.01) — this is what Copilot will bill you. UBB = Usage Based Billing.', icon: '🟢', color: '#7ce38b', today: formatCost(stats.today.estimatedCostCopilot ?? 0), last30Days: formatCost(stats.last30Days.estimatedCostCopilot ?? 0), month: formatCost(stats.month.estimatedCostCopilot ?? 0), lastMonth: formatCost(stats.lastMonth.estimatedCostCopilot ?? 0), projected: formatCost(projections.projectedCostCopilot ?? 0) },
		...buildCopilotPlanRow(stats),
		{ label: 'Sessions', icon: '📂', color: '#66aaff', today: formatNumber(stats.today.sessions), last30Days: formatNumber(stats.last30Days.sessions), month: formatNumber(stats.month.sessions), lastMonth: formatNumber(stats.lastMonth.sessions), projected: formatNumber(projections.projectedSessions) },
		{ label: 'Average interactions/session', icon: '💬', color: '#8ce0ff', today: formatNumber(stats.today.avgInteractionsPerSession), last30Days: formatNumber(stats.last30Days.avgInteractionsPerSession), month: formatNumber(stats.month.avgInteractionsPerSession), lastMonth: formatNumber(stats.lastMonth.avgInteractionsPerSession), projected: '—' },
		{ label: 'Average tokens/session', icon: '🔢', color: '#7ce38b', today: formatCompact(stats.today.avgTokensPerSession), last30Days: formatCompact(stats.last30Days.avgTokensPerSession), month: formatCompact(stats.month.avgTokensPerSession), lastMonth: formatCompact(stats.lastMonth.avgTokensPerSession), projected: '—' },
	];
	return rows;
}

function buildMetricsSection(
stats: DetailedStats,
projections: Projections
): HTMLElement {
const section = el('div', 'section');
section.append(el('h3', '', 'AI Engineering Fluency'));
const table = document.createElement('table');
table.className = 'stats-table';
const thead = document.createElement('thead');
const headerRow = document.createElement('tr');
const HEADERS = [{ icon: '📊', text: 'Metric' }, { icon: '📅', text: 'Today' }, { icon: '📈', text: 'Last 30 Days' }, { icon: '🗓️', text: 'Current Month' }, { icon: '📆', text: 'Previous Month' }, { icon: '🌍', text: 'Projected Year' }];
HEADERS.forEach((h, idx) => {
const th = document.createElement('th');
th.className = idx === 0 ? '' : 'align-right';
const wrap = el('div', 'period-header');
wrap.textContent = `${h.icon} ${h.text}`;
th.append(wrap);
headerRow.append(th);
});
thead.append(headerRow);
table.append(thead);
const tbody = document.createElement('tbody');
buildMetricsRows(stats, projections).forEach(row => {
const tr = document.createElement('tr');
tr.append(buildMetricLabelCell(row.icon, row.label, row.color, row.labelTooltip), buildValueCell(row.today), buildValueCell(row.last30Days), buildValueCell(row.month), buildValueCell(row.lastMonth), buildValueCell(row.projected));
tbody.append(tr);
});
table.append(tbody);
section.append(table);
return section;
}

function getSortIndicator(colKey: TableSortKey, activeKey: TableSortKey, dir: SortDir): string {
if (colKey !== activeKey) { return ' ↕'; }
return dir === 'asc' ? ' ↑' : ' ↓';
}

function saveSortSettings(): void {
vscode.postMessage({
command: 'saveSortSettings',
settings: {
editor: { key: editorSortKey, dir: editorSortDir },
model: { key: modelSortKey, dir: modelSortDir },
modelOtherExpanded
}
});
}

type EditorItem = {
	editor: string;
	todayUsage: { tokens: number; sessions: number };
	last30DaysUsage: { tokens: number; sessions: number };
	monthUsage: { tokens: number; sessions: number };
	lastMonthUsage: { tokens: number; sessions: number };
	projectedTokens: number;
	projectedSessions: number;
};

function buildEditorRow(item: EditorItem, totals: { today: number; last30Days: number; month: number; lastMonth: number }): HTMLTableRowElement {
	const { editor, todayUsage, last30DaysUsage, monthUsage, lastMonthUsage, projectedTokens, projectedSessions } = item;
	const todayPct = totals.today > 0 ? (todayUsage.tokens / totals.today) * 100 : 0;
	const last30Pct = totals.last30Days > 0 ? (last30DaysUsage.tokens / totals.last30Days) * 100 : 0;
	const monthPct = totals.month > 0 ? (monthUsage.tokens / totals.month) * 100 : 0;
	const lastMonthPct = totals.lastMonth > 0 ? (lastMonthUsage.tokens / totals.lastMonth) * 100 : 0;
	const tr = document.createElement('tr');
	if (editor === 'JetBrains') { tr.title = 'JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available.'; }
	if (editor === 'Antigravity') { tr.title = 'Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally.'; }
	if (editor === 'Cursor') { tr.title = 'Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.'; }
	const labelTd = document.createElement('td');
	const labelWrapper = document.createElement('span');
	labelWrapper.className = 'metric-label';
	labelWrapper.textContent = `${getEditorIcon(editor)} ${editor}`;
	if (editor === 'JetBrains' || editor === 'Antigravity' || editor === 'Cursor') { labelWrapper.textContent = `${labelWrapper.textContent} ⓘ`; }
	labelTd.append(labelWrapper);
	tr.append(labelTd,
		buildValueCell(formatCompact(todayUsage.tokens), `${formatPercent(todayPct)} · ${todayUsage.sessions} sessions`),
		buildValueCell(formatCompact(last30DaysUsage.tokens), `${formatPercent(last30Pct)} · ${last30DaysUsage.sessions} sessions`),
		buildValueCell(formatCompact(monthUsage.tokens), `${formatPercent(monthPct)} · ${monthUsage.sessions} sessions`),
		buildValueCell(formatCompact(lastMonthUsage.tokens), `${formatPercent(lastMonthPct)} · ${lastMonthUsage.sessions} sessions`),
		buildValueCell(formatCompact(projectedTokens), `${projectedSessions} sessions`));
	return tr;
}

function buildEditorTbody(stats: DetailedStats, allEditors: string[]): HTMLTableSectionElement {
const totals = {
	today: Object.values(stats.today.editorUsage).reduce((s, e) => s + e.tokens, 0),
	last30Days: Object.values(stats.last30Days.editorUsage).reduce((s, e) => s + e.tokens, 0),
	month: Object.values(stats.month.editorUsage).reduce((s, e) => s + e.tokens, 0),
	lastMonth: Object.values(stats.lastMonth.editorUsage).reduce((s, e) => s + e.tokens, 0),
};
const items: EditorItem[] = allEditors.map(editor => {
	const todayUsage = stats.today.editorUsage[editor] || { tokens: 0, sessions: 0 };
	const last30DaysUsage = stats.last30Days.editorUsage[editor] || { tokens: 0, sessions: 0 };
	const monthUsage = stats.month.editorUsage[editor] || { tokens: 0, sessions: 0 };
	const lastMonthUsage = stats.lastMonth.editorUsage[editor] || { tokens: 0, sessions: 0 };
	return { editor, todayUsage, last30DaysUsage, monthUsage, lastMonthUsage, projectedTokens: Math.round(calculateProjection(last30DaysUsage.tokens)), projectedSessions: Math.round(calculateProjection(last30DaysUsage.sessions)) };
});
items.sort((a, b) => {
	let cmp: number;
	switch (editorSortKey) {
		case 'name': cmp = a.editor.localeCompare(b.editor); break;
		case 'today': cmp = a.todayUsage.tokens - b.todayUsage.tokens; break;
		case 'last30Days': cmp = a.last30DaysUsage.tokens - b.last30DaysUsage.tokens; break;
		case 'month': cmp = a.monthUsage.tokens - b.monthUsage.tokens; break;
		case 'lastMonth': cmp = a.lastMonthUsage.tokens - b.lastMonthUsage.tokens; break;
		case 'projected': cmp = a.projectedTokens - b.projectedTokens; break;
		default: cmp = 0;
	}
	return editorSortDir === 'asc' ? cmp : -cmp;
});
const tbody = document.createElement('tbody');
items.forEach(item => tbody.append(buildEditorRow(item, totals)));
return tbody;
}

function buildEditorUsageSection(stats: DetailedStats): HTMLElement | null {
const allEditors = new Set([
...Object.keys(stats.today.editorUsage),
...Object.keys(stats.last30Days.editorUsage),
...Object.keys(stats.month.editorUsage),
...Object.keys(stats.lastMonth.editorUsage)
]);

if (allEditors.size === 0) {
return null;
}

const section = el('div', 'section');
const heading = el('h3');
heading.textContent = '💻 Usage by Editor';
section.append(heading);

const table = document.createElement('table');
table.className = 'stats-table';

const editorColHeaders: ColHeader[] = [
{ icon: '📝', text: 'Editor', key: 'name' },
{ icon: '📅', text: 'Today', key: 'today' },
{ icon: '📈', text: 'Last 30 Days', key: 'last30Days' },
{ icon: '🗓️', text: 'Current Month', key: 'month' },
{ icon: '📆', text: 'Previous Month', key: 'lastMonth' },
{ icon: '🌍', text: 'Projected Year', key: 'projected' }
];

const { thead } = buildSortableTableHeader(
editorColHeaders,
() => editorSortKey,
() => editorSortDir,
(key) => {
if (editorSortKey === key) {
editorSortDir = editorSortDir === 'asc' ? 'desc' : 'asc';
} else {
editorSortKey = key;
editorSortDir = key === 'name' ? 'asc' : 'desc';
}
const newTbody = buildEditorTbody(stats, Array.from(allEditors));
const oldTbody = table.querySelector('tbody');
if (oldTbody) { table.replaceChild(newTbody, oldTbody); } else { table.append(newTbody); }
saveSortSettings();
}
);

table.append(thead);
table.append(buildEditorTbody(stats, Array.from(allEditors)));
section.append(table);
return section;
}

const TOP_N_MODELS = 5;

type ModelItem = {
	model: string;
	todayTotal: number; todayInputPct: number; todayOutputPct: number;
	last30DaysTotal: number; last30DaysInputPct: number; last30DaysOutputPct: number;
	monthTotal: number; monthInputPct: number; monthOutputPct: number;
	lastMonthTotal: number; lastMonthInputPct: number; lastMonthOutputPct: number;
	projected: number; charsPerToken: number;
};

function toModelItem(stats: DetailedStats, model: string): ModelItem {
	const todayUsage = stats.today.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
	const last30DaysUsage = stats.last30Days.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
	const monthUsage = stats.month.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
	const lastMonthUsage = stats.lastMonth.modelUsage[model] || { inputTokens: 0, outputTokens: 0 };
	const todayTotal = todayUsage.inputTokens + todayUsage.outputTokens;
	const last30DaysTotal = last30DaysUsage.inputTokens + last30DaysUsage.outputTokens;
	const monthTotal = monthUsage.inputTokens + monthUsage.outputTokens;
	const lastMonthTotal = lastMonthUsage.inputTokens + lastMonthUsage.outputTokens;
	return {
		model, todayTotal,
		todayInputPct: todayTotal > 0 ? (todayUsage.inputTokens / todayTotal) * 100 : 0,
		todayOutputPct: todayTotal > 0 ? (todayUsage.outputTokens / todayTotal) * 100 : 0,
		last30DaysTotal,
		last30DaysInputPct: last30DaysTotal > 0 ? (last30DaysUsage.inputTokens / last30DaysTotal) * 100 : 0,
		last30DaysOutputPct: last30DaysTotal > 0 ? (last30DaysUsage.outputTokens / last30DaysTotal) * 100 : 0,
		monthTotal,
		monthInputPct: monthTotal > 0 ? (monthUsage.inputTokens / monthTotal) * 100 : 0,
		monthOutputPct: monthTotal > 0 ? (monthUsage.outputTokens / monthTotal) * 100 : 0,
		lastMonthTotal,
		lastMonthInputPct: lastMonthTotal > 0 ? (lastMonthUsage.inputTokens / lastMonthTotal) * 100 : 0,
		lastMonthOutputPct: lastMonthTotal > 0 ? (lastMonthUsage.outputTokens / lastMonthTotal) * 100 : 0,
		projected: Math.round(calculateProjection(last30DaysTotal)), charsPerToken: getCharsPerToken(model),
	};
}

function sortModelItems(items: ModelItem[]): void {
	items.sort((a, b) => {
		let cmp: number;
		switch (modelSortKey) {
			case 'name': cmp = a.model.localeCompare(b.model); break;
			case 'today': cmp = a.todayTotal - b.todayTotal; break;
			case 'last30Days': cmp = a.last30DaysTotal - b.last30DaysTotal; break;
			case 'month': cmp = a.monthTotal - b.monthTotal; break;
			case 'lastMonth': cmp = a.lastMonthTotal - b.lastMonthTotal; break;
			case 'projected': cmp = a.projected - b.projected; break;
			default: cmp = 0;
		}
		return modelSortDir === 'asc' ? cmp : -cmp;
	});
}

function buildModelRowEl(item: ModelItem, isOtherChild: boolean): HTMLTableRowElement {
	const tr = document.createElement('tr');
	if (isOtherChild) { tr.style.opacity = '0.85'; }
	const labelTd = document.createElement('td');
	const labelWrapper = document.createElement('span');
	labelWrapper.className = 'metric-label';
	if (isOtherChild) {
		const indentSpan = document.createElement('span');
		indentSpan.style.cssText = 'display:inline-block;width:12px';
		labelWrapper.append(indentSpan);
	}
	const charsSpan = document.createElement('span');
	charsSpan.style.cssText = 'color:#9aa0a6;font-size:11px;font-weight:500;';
	charsSpan.textContent = `(~${item.charsPerToken.toFixed(1)} chars/tk)`;
	labelWrapper.append(document.createTextNode(`${getModelDisplayName(item.model)} `), charsSpan);
	labelTd.append(labelWrapper);
	tr.append(labelTd,
		buildValueCell(formatCompact(item.todayTotal), `↑${formatPercent(item.todayInputPct)} ↓${formatPercent(item.todayOutputPct)}`),
		buildValueCell(formatCompact(item.last30DaysTotal), `↑${formatPercent(item.last30DaysInputPct)} ↓${formatPercent(item.last30DaysOutputPct)}`),
		buildValueCell(formatCompact(item.monthTotal), `↑${formatPercent(item.monthInputPct)} ↓${formatPercent(item.monthOutputPct)}`),
		buildValueCell(formatCompact(item.lastMonthTotal), `↑${formatPercent(item.lastMonthInputPct)} ↓${formatPercent(item.lastMonthOutputPct)}`),
		buildValueCell(formatCompact(item.projected)));
	return tr;
}

function appendOtherModels(stats: DetailedStats, otherModels: string[], onToggleOther: () => void, tbody: HTMLTableSectionElement): void {
	const sumUsage = (period: 'today' | 'last30Days' | 'month' | 'lastMonth') =>
		otherModels.reduce((acc, m) => {
			const u = stats[period].modelUsage[m] || { inputTokens: 0, outputTokens: 0 };
			return { inputTokens: acc.inputTokens + u.inputTokens, outputTokens: acc.outputTokens + u.outputTokens };
		}, { inputTokens: 0, outputTokens: 0 });
	const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);
	const otherToday = sumUsage('today'); const otherLast30 = sumUsage('last30Days');
	const otherMonth = sumUsage('month'); const otherLastMonth = sumUsage('lastMonth');
	const tTotal = otherToday.inputTokens + otherToday.outputTokens;
	const l30Total = otherLast30.inputTokens + otherLast30.outputTokens;
	const mTotal = otherMonth.inputTokens + otherMonth.outputTokens;
	const lmTotal = otherLastMonth.inputTokens + otherLastMonth.outputTokens;
	const otherTr = document.createElement('tr');
	otherTr.style.cursor = 'pointer'; otherTr.style.background = 'var(--list-hover-bg)';
	otherTr.title = modelOtherExpanded ? 'Collapse other models' : 'Expand other models';
	const otherLabelWrapper = document.createElement('span'); otherLabelWrapper.className = 'metric-label';
	const otherNameSpan = document.createElement('span');
	otherNameSpan.style.cssText = 'color:var(--text-secondary);font-weight:600;';
	otherNameSpan.textContent = `📦 Other (${otherModels.length} model${otherModels.length !== 1 ? 's' : ''})`;
	const otherToggleSpan = document.createElement('span');
	otherToggleSpan.style.cssText = 'font-size:10px;color:var(--text-muted)';
	otherToggleSpan.textContent = ` ${modelOtherExpanded ? '▲' : '▼'}`;
	otherLabelWrapper.append(otherNameSpan, otherToggleSpan);
	const otherLabelTd = document.createElement('td'); otherLabelTd.append(otherLabelWrapper);
	const mkOtherTd = (io: { inputTokens: number; outputTokens: number }, total: number) => {
		const td = buildValueCell(formatCompact(total));
		if (total > 0) { td.append(el('div', 'muted', `↑${formatPercent(pct(io.inputTokens, total))} ↓${formatPercent(pct(io.outputTokens, total))}`)); }
		return td;
	};
	otherTr.append(otherLabelTd, mkOtherTd(otherToday, tTotal), mkOtherTd(otherLast30, l30Total), mkOtherTd(otherMonth, mTotal), mkOtherTd(otherLastMonth, lmTotal), buildValueCell(formatCompact(Math.round(calculateProjection(l30Total)))));
	otherTr.addEventListener('click', () => { modelOtherExpanded = !modelOtherExpanded; saveSortSettings(); onToggleOther(); });
	tbody.append(otherTr);
	if (modelOtherExpanded) {
		const otherItems = otherModels.map(m => toModelItem(stats, m));
		sortModelItems(otherItems);
		otherItems.forEach(item => tbody.append(buildModelRowEl(item, true)));
	}
}

function buildModelTbody(stats: DetailedStats, topModels: string[], otherModels: string[], onToggleOther: () => void): HTMLTableSectionElement {
	const topItems = topModels.map(m => toModelItem(stats, m));
	sortModelItems(topItems);
	const tbody = document.createElement('tbody');
	topItems.forEach(item => tbody.append(buildModelRowEl(item, false)));
	if (otherModels.length > 0) { appendOtherModels(stats, otherModels, onToggleOther, tbody); }
	return tbody;
}

function buildModelUsageSection(stats: DetailedStats): HTMLElement | null {
const allModels = new Set([
...Object.keys(stats.today.modelUsage),
...Object.keys(stats.last30Days.modelUsage),
...Object.keys(stats.month.modelUsage),
...Object.keys(stats.lastMonth.modelUsage)
]);

if (allModels.size === 0) {
return null;
}

// Determine top N models by last30Days usage; the rest go into the "Other" group
const sortedByLast30Days = Array.from(allModels).sort((a, b) => {
const aUsage = stats.last30Days.modelUsage[a] || { inputTokens: 0, outputTokens: 0 };
const bUsage = stats.last30Days.modelUsage[b] || { inputTokens: 0, outputTokens: 0 };
return (bUsage.inputTokens + bUsage.outputTokens) - (aUsage.inputTokens + aUsage.outputTokens);
});
const topModels = sortedByLast30Days.slice(0, TOP_N_MODELS);
const otherModels = sortedByLast30Days.slice(TOP_N_MODELS);

const section = el('div', 'section');
const heading = el('h3');
heading.textContent = '🎯 Model Usage (Tokens)';
section.append(heading);

const table = document.createElement('table');
table.className = 'stats-table';

const modelColHeaders: ColHeader[] = [
{ icon: '🧠', text: 'Model', key: 'name' },
{ icon: '📅', text: 'Today', key: 'today' },
{ icon: '📈', text: 'Last 30 Days', key: 'last30Days' },
{ icon: '🗓️', text: 'Current Month', key: 'month' },
{ icon: '📆', text: 'Previous Month', key: 'lastMonth' },
{ icon: '🌍', text: 'Projected Year', key: 'projected' }
];

function rebuildTbody(): void {
const newTbody = buildModelTbody(stats, topModels, otherModels, rebuildTbody);
const oldTbody = table.querySelector('tbody');
if (oldTbody) { table.replaceChild(newTbody, oldTbody); } else { table.append(newTbody); }
}

const { thead } = buildSortableTableHeader(
modelColHeaders,
() => modelSortKey,
() => modelSortDir,
(key) => {
if (modelSortKey === key) {
modelSortDir = modelSortDir === 'asc' ? 'desc' : 'asc';
} else {
modelSortKey = key;
modelSortDir = key === 'name' ? 'asc' : 'desc';
}
rebuildTbody();
saveSortSettings();
}
);

table.append(thead);
rebuildTbody();
section.append(table);
return section;
}

function buildEmptyStateSection(): HTMLElement {
const section = el('div', 'section');
const inner = el('div', 'empty-state');

const title = el('div', 'empty-state-title', '👋 Welcome to AI Engineering Fluency');

const desc = el('p', 'empty-state-description',
'This extension tracks AI token usage by reading session log files stored locally by supported tools. No token data has been found yet.'
);

const toolsLabel = document.createElement('p');
toolsLabel.className = 'empty-state-description';
const toolsLabelStrong = document.createElement('strong');
toolsLabelStrong.textContent = 'Supported tools & editors:';
toolsLabel.append(toolsLabelStrong);

const toolsList = document.createElement('ul');
toolsList.className = 'empty-state-steps';
const toolsTexts = [
'�� VS Code / VS Code Insiders / VSCodium — GitHub Copilot Chat extension',
'🖱️ Cursor, 🌊 Windsurf — built-in AI chat',
'🖥️ Visual Studio 2022+ — GitHub Copilot Chat extension',
'🟢 OpenCode, 🦀 Crush — terminal-based coding agents',
'🤖 Claude Code — Anthropic\'s CLI coding agent',
'💎 Gemini CLI — Google\'s open-source CLI coding agent',
'🚀 Antigravity — Google\'s Gemini-powered desktop IDE',
'π Pi — Mistral-powered terminal coding agent',
'💻 Copilot CLI — GitHub Copilot in the terminal',
];
toolsTexts.forEach(text => {
const li = document.createElement('li');
li.textContent = text;
toolsList.append(li);
});

const stepsLabel = document.createElement('p');
stepsLabel.className = 'empty-state-description';
const stepsLabelStrong = document.createElement('strong');
stepsLabelStrong.textContent = 'To get started:';
stepsLabel.append(stepsLabelStrong);

const steps = document.createElement('ol');
steps.className = 'empty-state-steps';
const stepTexts = [
'Use any of the supported tools or editors listed above to interact with an AI model.',
'For GitHub Copilot in VS Code: open the Copilot Chat panel (Ctrl+Alt+I / Cmd+Alt+I) and start a conversation.',
'For terminal agents (Claude Code, Gemini CLI, Antigravity, Pi, OpenCode, Copilot CLI): run a coding session in your terminal.',
'Click the 🔄 Refresh button above to reload the stats after your first session.',
];
stepTexts.forEach(text => {
const li = document.createElement('li');
li.textContent = text;
steps.append(li);
});

const note = el('div', 'empty-state-note',
'💡 If you have been using one of the supported tools but still see no data, open the Diagnostics panel (🔍 Diagnostics button above) to verify that session files are being discovered correctly.'
);

inner.append(title, desc, toolsLabel, toolsList, stepsLabel, steps, note);
section.append(inner);
return section;
}

function buildEstimatesSection(): HTMLElement {
const section = el('div', 'section');
const heading = el('h3');
heading.textContent = '💡 Calculation & Estimates';
section.append(heading);

const notes = document.createElement('ul');
notes.className = 'notes';

const items = [
'Cost (UBB) uses GitHub Copilot AI Credit rates (1 credit = $0.01) — this is what you are billed under Usage Based Billing.',
'Estimated CO₂ is based on ~0.2 g CO₂e per 1,000 tokens.',
'Estimated water usage is based on ~0.3 L per 1,000 tokens.',
'Tree equivalent represents the fraction of a single mature tree\'s annual CO₂ absorption (~21 kg/year).'
];

items.forEach(text => {
const li = document.createElement('li');
li.textContent = text;
notes.append(li);
});

section.append(notes);
return section;
}

function wireButtons(): void {
const refresh = document.getElementById('btn-refresh');
const chart = document.getElementById('btn-chart');
const usage = document.getElementById('btn-usage');
const diagnostics = document.getElementById('btn-diagnostics');

refresh?.addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));
chart?.addEventListener('click', () => vscode.postMessage({ command: 'showChart' }));
usage?.addEventListener('click', () => vscode.postMessage({ command: 'showUsageAnalysis' }));
diagnostics?.addEventListener('click', () => vscode.postMessage({ command: 'showDiagnostics' }));

const maturity = document.getElementById('btn-maturity');
maturity?.addEventListener('click', () => vscode.postMessage({ command: 'showMaturity' }));

const dashboard = document.getElementById('btn-dashboard');
dashboard?.addEventListener('click', () => vscode.postMessage({ command: 'showDashboard' }));

const environmental = document.getElementById('btn-environmental');
environmental?.addEventListener('click', () => vscode.postMessage({ command: 'showEnvironmental' }));

// Cast to the looser signature required by the shared wireExtensionPointButtons utility,
// which posts extension-point-specific messages not modelled in WebviewMessage.
wireExtensionPointButtons(vscode as { postMessage: (message: unknown) => void });
}

async function bootstrap(): Promise<void> {
console.log('[CopilotTokenTracker] bootstrap called');
const { provideVSCodeDesignSystem, vsCodeButton, vsCodeBadge } = await import('@vscode/webview-ui-toolkit');
provideVSCodeDesignSystem().register(vsCodeButton(), vsCodeBadge());

if (initialData) {
console.log('[CopilotTokenTracker] Rendering details with initialData:', initialData);
render(initialData);
} else {
console.warn('[CopilotTokenTracker] No initialData found, rendering fallback.');
const root = document.getElementById('root');
if (root) {
root.textContent = '';
const fallback = document.createElement('div');
fallback.style.padding = '16px';
fallback.style.color = '#e7e7e7';
fallback.textContent = 'No data available.';
root.append(fallback);
}
}
}

// Listen for background stat updates from the extension
registerMessageHandler<{ command: string; data?: DetailedStats }>((message) => {
	if (message.command === 'updateStats') {
		render(message.data as DetailedStats);
	}
});

void bootstrap();
