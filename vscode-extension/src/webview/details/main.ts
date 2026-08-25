// Import shared utilities
import { getModelDisplayName } from '../../../../src/webview/shared/modelUtils';
import { getEditorIcon, getCharsPerToken, formatFixed, formatPercent, formatNumber, formatCost, formatCompact, setCompactNumbers } from '../shared/formatUtils';
import { el, createButton, iconHeading } from '../shared/domUtils';
import { getNavButtons } from '../shared/buttonConfig';
import { wireExtensionPointButtons } from '../shared/extensionPoints';
import { initializeWebviewLocalization, setCurrentLanguage } from '../shared/localization';
// CSS imported as text via esbuild
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../../../../src/webview/shared/dataLoader';
import { registerMessageHandler } from '../shared/messageHandler';
import type { ModelUsage } from '../shared/types';
import { getBillingGroup } from '../../../../src/chartDataBuilder';

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
/**
 * Estimated cost per billing group (e.g. "GitHub Copilot", "Anthropic", "Google")
 * for this period in USD. Used to show/filter cost across all providers, not just
 * GitHub Copilot's UBB billing.
 */
billingGroupCosts?: Record<string, number>;
/** Per-editor model usage breakdown, used to determine which billing group(s) an editor/model belongs to for provider filtering. */
editorModelUsage?: { [editor: string]: ModelUsage };
/** Number of sessions in this period that delegated work to sub-agents (1+ sub-agent tool calls). Absent when zero. */
subAgentSessions?: number;
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
editorOtherExpanded?: boolean;
/** Billing-group (provider) names that the user has unchecked in the cost provider filter. */
excludedProviders?: string[];
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
| { command: 'showEfficiency' }
| { command: 'saveSortSettings'; settings: {
editor: { key: TableSortKey; dir: SortDir };
model: { key: TableSortKey; dir: SortDir };
modelOtherExpanded: boolean;
editorOtherExpanded: boolean;
excludedProviders: string[];
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
const initialData = getWindowData<DetailedStats & { localization?: Record<string, string> }>('__INITIAL_DETAILS__');
console.log('[CopilotTokenTracker] details webview loaded');

// Initialize localization for webview
if (initialData?.localization) {
	initializeWebviewLocalization(initialData.localization);
	const language = initialData.localization['__language__'] || 'en';
	setCurrentLanguage(language);
	console.log('[CopilotTokenTracker] Webview localization initialized for language:', language);
}

const _initSort = initialData?.sortSettings;
let editorSortKey: TableSortKey = (_initSort?.editor?.key as TableSortKey) ?? 'name';
let editorSortDir: SortDir = (_initSort?.editor?.dir as SortDir) ?? 'asc';
let modelSortKey: TableSortKey = (_initSort?.model?.key as TableSortKey) ?? 'name';
let modelSortDir: SortDir = (_initSort?.model?.dir as SortDir) ?? 'asc';
let modelOtherExpanded: boolean = (_initSort?.modelOtherExpanded) ?? false;
let editorOtherExpanded: boolean = (_initSort?.editorOtherExpanded) ?? false;
/** Billing-group (provider) names deselected in the "Cost by Provider" filter. Empty = all providers included. */
let excludedProviders: Set<string> = new Set(_initSort?.excludedProviders ?? []);
/** Last rendered stats, kept so provider-filter toggles can trigger a full re-render. */
let lastStats: DetailedStats | null = null;

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
lastStats = stats;
const root = document.getElementById('root');
if (!root) { return; }

const allProviders = getAllProviders(stats);
const projectedTokens = Math.round(calculateProjection(stats.last30Days.tokens + stats.last30Days.thinkingTokens));
const projectedSessions = Math.round(calculateProjection(stats.last30Days.sessions));
const projectedCo2 = calculateProjection(stats.last30Days.co2);
const projectedWater = calculateProjection(stats.last30Days.waterUsage);
const projectedCost = calculateProjection(totalCostForPeriod(stats.last30Days, allProviders));
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

/** Re-renders using the last stats payload — used after the provider filter changes. */
function rerenderFromLastStats(): void {
if (lastStats) { render(lastStats); }
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
const headerLeft = el('div', 'header-left');
headerLeft.append(el('div', 'title', 'AI Engineering Fluency'));
const planBadge = buildPlanBadge(stats);
if (planBadge) {
headerLeft.append(planBadge);
}
const buttonRow = el('div', 'button-row');

buttonRow.append(...getNavButtons('btn-details', !!stats.backendConfigured).map(config => createButton(config)));

header.append(headerLeft, buttonRow);

const footer = el('div', 'footer', `Last updated: ${lastUpdated.toLocaleString()} · Updates every 5 minutes`);

const sections = el('div', 'sections');

const isEmptyState = (stats.today.tokens ?? 0) === 0 && (stats.last30Days.tokens ?? 0) === 0 && (stats.lastMonth.tokens ?? 0) === 0;
if (isEmptyState) {
sections.append(buildEmptyStateSection());
} else {
const providerPanel = buildProviderPanel(stats);
if (providerPanel) {
sections.append(providerPanel);
}
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
	if ((p.actualTokens ?? 0) > 0) {
		return formatCompact(p.tokens + p.thinkingTokens);
	}
	return formatCompact(modelTotal > 0 ? modelTotal : p.tokens);
}

function buildCachedTokenRow(stats: DetailedStats): MetricRow[] {
	if (!(stats.today.cachedTokens || stats.last30Days.cachedTokens || stats.month.cachedTokens || stats.lastMonth.cachedTokens)) {
		return [];
	}
	return [{ label: 'Cached tokens', labelTooltip: 'Cache-read tokens — already included in "Input tokens" above, shown separately because they are billed at a lower rate.', icon: '⚡', color: '#34d399', today: formatCompact(stats.today.cachedTokens || 0), last30Days: formatCompact(stats.last30Days.cachedTokens || 0), month: formatCompact(stats.month.cachedTokens || 0), lastMonth: formatCompact(stats.lastMonth.cachedTokens || 0), projected: '—' }];
}

/**
 * Renders the active Copilot plan as a small badge shown under the header
 * title (plan name + monthly credits) instead of a metrics-table row.
 */
function buildPlanBadge(stats: DetailedStats): HTMLElement | null {
	if (!stats.copilotPlan) { return null; }
	const plan = stats.copilotPlan;
	const credits = plan.monthlyAiCreditsUsd > 0 ? `$${plan.monthlyAiCreditsUsd} credits/month` : 'no credits';
	const badge = el('div', 'plan-badge', `🏷️ ${plan.planName} · ${credits}`);
	badge.title = `Your active GitHub Copilot subscription plan (ID: ${plan.planId}). Included AI credits cover usage-based billing (1 AI credit = $0.01).`;
	return badge;
}

type MetricGroup = { heading: string; rows: MetricRow[] };

function buildMetricsGroups(stats: DetailedStats, projections: Projections): MetricGroup[] {
	const allProviders = getAllProviders(stats);
	const tokenRows: MetricRow[] = [
		{ label: 'Total tokens', labelTooltip: 'All LLM API tokens counted across every call in this period — matches the status bar. When debug logs are available this is the definitive total; otherwise it falls back to per-model attribution or the text-based estimate.', icon: '🟣', color: '#c37bff', today: totalTokenCell(stats.today), last30Days: totalTokenCell(stats.last30Days), month: totalTokenCell(stats.month), lastMonth: totalTokenCell(stats.lastMonth), projected: formatCompact(projections.projectedTokens) },
		{ label: 'Input tokens', labelTooltip: 'Total prompt tokens sent to the model, including any cache-read tokens (shown separately below).', icon: '⬆️', color: '#c37bff', today: inputTokenCell(stats.today), last30Days: inputTokenCell(stats.last30Days), month: inputTokenCell(stats.month), lastMonth: inputTokenCell(stats.lastMonth), projected: '—' },
		{ label: 'Output tokens', icon: '⬇️', color: '#c37bff', today: outputTokenCell(stats.today), last30Days: outputTokenCell(stats.last30Days), month: outputTokenCell(stats.month), lastMonth: outputTokenCell(stats.lastMonth), projected: '—' },
		...buildCachedTokenRow(stats),
		{ label: 'Tokens (user estimated)', icon: '📝', color: '#b39ddb', today: formatCompact(stats.today.estimatedTokens), last30Days: formatCompact(stats.last30Days.estimatedTokens), month: formatCompact(stats.month.estimatedTokens), lastMonth: formatCompact(stats.lastMonth.estimatedTokens), projected: '—' },
		{ label: 'Service overhead %', icon: '☁️', color: '#90a4ae', today: serviceOverheadPct(stats.today), last30Days: serviceOverheadPct(stats.last30Days), month: serviceOverheadPct(stats.month), lastMonth: serviceOverheadPct(stats.lastMonth), projected: '—' },
		{ label: 'Thinking tokens', icon: '🧠', color: '#a78bfa', today: formatCompact(stats.today.thinkingTokens || 0), last30Days: formatCompact(stats.last30Days.thinkingTokens || 0), month: formatCompact(stats.month.thinkingTokens || 0), lastMonth: formatCompact(stats.lastMonth.thinkingTokens || 0), projected: '—' },
	];
	// With GitHub Copilot as the only provider the "selected providers" row is just a
	// duplicate of the Copilot UBB row below it, so drop it — same reasoning as the
	// "Cost by Provider" panel hiding itself when there is nothing to compare.
	const selectedProvidersCostRows: MetricRow[] = isCopilotOnlyProviders(allProviders) ? [] : [
		{ label: 'Estimated cost (selected providers)', labelTooltip: 'Sum of estimated cost across the providers selected in the Cost by Provider filter below — GitHub Copilot uses UBB AI Credit rates, other providers use their own API pricing.', icon: '💵', color: '#7ce38b', today: formatCost(totalCostForPeriod(stats.today, allProviders)), last30Days: formatCost(totalCostForPeriod(stats.last30Days, allProviders)), month: formatCost(totalCostForPeriod(stats.month, allProviders)), lastMonth: formatCost(totalCostForPeriod(stats.lastMonth, allProviders)), projected: formatCost(projections.projectedCost) },
	];
	const costRows: MetricRow[] = [
		...selectedProvidersCostRows,
		{ label: 'Estimated cost (GitHub Copilot UBB)', labelTooltip: 'Based on GitHub Copilot AI Credit rates (1 credit = $0.01) — this is what Copilot will bill you. UBB = Usage Based Billing.', icon: '🟢', color: '#7ce38b', today: formatCost(stats.today.estimatedCostCopilot ?? 0), last30Days: formatCost(stats.last30Days.estimatedCostCopilot ?? 0), month: formatCost(stats.month.estimatedCostCopilot ?? 0), lastMonth: formatCost(stats.lastMonth.estimatedCostCopilot ?? 0), projected: formatCost(projections.projectedCostCopilot ?? 0) },
	];
	const activityRows: MetricRow[] = [
		{ label: 'Sessions', icon: '📂', color: '#66aaff', today: formatNumber(stats.today.sessions), last30Days: formatNumber(stats.last30Days.sessions), month: formatNumber(stats.month.sessions), lastMonth: formatNumber(stats.lastMonth.sessions), projected: formatNumber(projections.projectedSessions) },
		{ label: 'Sessions with sub-agents', labelTooltip: 'Sessions that delegated work to sub-agents in this period (task/read_agent/write_agent/list_agents, runSubagent, delegate_* tool calls detected in the session logs).', icon: '🤖', color: '#66aaff', today: formatNumber(stats.today.subAgentSessions ?? 0), last30Days: formatNumber(stats.last30Days.subAgentSessions ?? 0), month: formatNumber(stats.month.subAgentSessions ?? 0), lastMonth: formatNumber(stats.lastMonth.subAgentSessions ?? 0), projected: '—' },
		{ label: 'Average interactions/session', icon: '💬', color: '#8ce0ff', today: formatNumber(stats.today.avgInteractionsPerSession), last30Days: formatNumber(stats.last30Days.avgInteractionsPerSession), month: formatNumber(stats.month.avgInteractionsPerSession), lastMonth: formatNumber(stats.lastMonth.avgInteractionsPerSession), projected: '—' },
		{ label: 'Average tokens/session', icon: '🔢', color: '#7ce38b', today: formatCompact(stats.today.avgTokensPerSession), last30Days: formatCompact(stats.last30Days.avgTokensPerSession), month: formatCompact(stats.month.avgTokensPerSession), lastMonth: formatCompact(stats.lastMonth.avgTokensPerSession), projected: '—' },
	];
	return [
		{ heading: '🔢 Tokens', rows: tokenRows },
		{ heading: '💰 Cost', rows: costRows },
		{ heading: '💬 Activity', rows: activityRows },
	];
}

/** Builds a non-sortable separator row that labels a group of metric rows. */
function buildGroupHeaderRow(label: string): HTMLTableRowElement {
	const tr = document.createElement('tr');
	tr.className = 'group-row';
	const td = document.createElement('td');
	td.colSpan = 6;
	td.textContent = label;
	tr.append(td);
	return tr;
}

/** Builds a single-row, full-width placeholder for tables emptied out by the provider filter. */
function buildNoDataRow(colSpan: number, message: string): HTMLTableRowElement {
	const tr = document.createElement('tr');
	tr.className = 'no-data-row';
	const td = document.createElement('td');
	td.colSpan = colSpan;
	td.textContent = message;
	tr.append(td);
	return tr;
}

function buildMetricsSection(
stats: DetailedStats,
projections: Projections
): HTMLElement {
const section = el('div', 'section');
section.append(iconHeading('h3', 'graph', 'Key Metrics'));
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
buildMetricsGroups(stats, projections).forEach(group => {
tbody.append(buildGroupHeaderRow(group.heading));
group.rows.forEach(row => {
const tr = document.createElement('tr');
tr.append(buildMetricLabelCell(row.icon, row.label, row.color, row.labelTooltip), buildValueCell(row.today), buildValueCell(row.last30Days), buildValueCell(row.month), buildValueCell(row.lastMonth), buildValueCell(row.projected));
tbody.append(tr);
});
});
table.append(tbody);
section.append(table);
return section;
}

// ---------------------------------------------------------------------------
// Cost by Provider section
// ---------------------------------------------------------------------------

/** Emoji shown next to each billing-group/provider name in the provider panel. */
const PROVIDER_ICONS: Record<string, string> = {
	'GitHub Copilot': '🐙',
	'Anthropic': '🅰️',
	'Google': '🔷',
	'OpenAI': '🟢',
	'Mistral AI': '🌬️',
	'xAI': '✖️',
	'Microsoft': '🪟',
	'Alibaba': '🐉',
	'Other': '❔',
};

function getProviderIcon(provider: string): string {
	return PROVIDER_ICONS[provider] ?? '💵';
}

/** Builds a single clickable provider card; clicking toggles it in/out of `excludedProviders`. */
function buildProviderCard(stats: DetailedStats, provider: string): HTMLElement {
	const isExcluded = excludedProviders.has(provider);
	const card = el('div', `provider-card${isExcluded ? ' provider-card-excluded' : ''}`);
	card.tabIndex = 0;
	card.setAttribute('role', 'button');
	card.setAttribute('aria-pressed', String(!isExcluded));
	card.title = isExcluded
		? `${provider} is hidden — click to show it again and include it in the totals below.`
		: `Click to hide ${provider} — filters it out of the totals and the Editor/Model usage lists below.`;

	card.append(
		el('div', 'provider-card-label', `${getProviderIcon(provider)} ${provider}`),
		el('div', 'provider-card-value', formatCost(stats.month.billingGroupCosts?.[provider] || 0)),
		el('div', 'provider-card-sub', 'Cost this month')
	);

	const toggle = (): void => {
		if (excludedProviders.has(provider)) { excludedProviders.delete(provider); } else { excludedProviders.add(provider); }
		saveSortSettings();
		rerenderFromLastStats();
	};
	card.addEventListener('click', toggle);
	card.addEventListener('keydown', (e) => {
		if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
	});
	return card;
}

/** Builds the non-interactive "Total (selected)" card summarizing the currently included providers. */
function buildProviderTotalCard(stats: DetailedStats, allProviders: string[]): HTMLElement {
	const included = includedProviders(allProviders);
	const card = el('div', 'provider-card provider-card-total');
	card.title = `Sum of ${included.length} of ${allProviders.length} selected provider(s).`;
	card.append(
		el('div', 'provider-card-label', '∑ Total (selected)'),
		el('div', 'provider-card-value', formatCost(sumBillingGroupCosts(stats.month.billingGroupCosts, included))),
		el('div', 'provider-card-sub', 'Cost this month')
	);
	return card;
}

/**
 * Builds the "Cost by Provider" panel shown at the top of the page (replacing the old
 * fixed hero cards). Each provider is a clickable card — clicking toggles it in/out of
 * `excludedProviders`, which also filters the "Usage by Editor" and "Model Usage" lists
 * further down the page to just the selected provider(s).
 */
function buildProviderPanel(stats: DetailedStats): HTMLElement | null {
	const allProviders = getAllProviders(stats);
	// With zero or one provider the panel adds no value (nothing to compare or
	// filter), so hide it entirely.
	if (allProviders.length <= 1) { return null; }

	const section = el('div', 'section');
	section.append(iconHeading('h3', 'credit-card', 'Cost by Provider'));
	section.append(el('div', 'provider-panel-hint', 'Click a provider to hide/show it — this also filters the Editor & Model usage lists below.'));

	const grid = el('div', 'provider-cards');
	grid.append(buildProviderTotalCard(stats, allProviders));
	allProviders.forEach(provider => grid.append(buildProviderCard(stats, provider)));
	section.append(grid);
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
modelOtherExpanded,
editorOtherExpanded,
excludedProviders: Array.from(excludedProviders)
}
});
}

// ---------------------------------------------------------------------------
// Cost-by-provider helpers
// ---------------------------------------------------------------------------

const ALL_PERIODS = ['today', 'last30Days', 'month', 'lastMonth'] as const;

/** Returns every billing-group (provider) name seen across all four periods, "GitHub Copilot" first. */
function getAllProviders(stats: DetailedStats): string[] {
const set = new Set<string>();
ALL_PERIODS.forEach(period => {
Object.keys(stats[period].billingGroupCosts ?? {}).forEach(p => set.add(p));
});
return Array.from(set).sort((a, b) => {
if (a === 'GitHub Copilot') { return -1; }
if (b === 'GitHub Copilot') { return 1; }
return a.localeCompare(b);
});
}

/**
 * Whether GitHub Copilot is the only provider in play — either it is the single billing
 * group seen, or there is no billing-group breakdown at all (older cached stats, which
 * fall back to the Copilot-only estimate).
 */
function isCopilotOnlyProviders(allProviders: string[]): boolean {
	return allProviders.every(p => p === 'GitHub Copilot');
}

/** Providers currently selected (not filtered out) from the given full provider list. */
function includedProviders(allProviders: string[]): string[] {
return allProviders.filter(p => !excludedProviders.has(p));
}

/** Sums the billing-group costs for the given providers only. */
function sumBillingGroupCosts(billingGroupCosts: Record<string, number> | undefined, providers: string[]): number {
if (!billingGroupCosts) { return 0; }
return providers.reduce((s, p) => s + (billingGroupCosts[p] || 0), 0);
}

/**
 * Total estimated cost for a period across the currently selected providers.
 * Falls back to the legacy Copilot-only estimate when no billing-group breakdown
 * is available (e.g. stale cached data from an older extension version).
 */
function totalCostForPeriod(period: PeriodStats, allProviders: string[]): number {
if (allProviders.length === 0) {
return period.estimatedCostCopilot ?? period.estimatedCost ?? 0;
}
return sumBillingGroupCosts(period.billingGroupCosts, includedProviders(allProviders));
}

/** Billing group(s) an editor's usage falls into, derived from its per-model breakdown across all periods. */
function editorBillingGroups(stats: DetailedStats, editor: string): Set<string> {
	const groups = new Set<string>();
	ALL_PERIODS.forEach(period => {
		const modelUsage = stats[period].editorModelUsage?.[editor];
		if (modelUsage) { Object.keys(modelUsage).forEach(model => groups.add(getBillingGroup(editor, model))); }
	});
	return groups;
}

/** Billing group(s) a model belongs to, derived from every editor that used it across all periods. */
function modelBillingGroups(stats: DetailedStats, model: string): Set<string> {
	const groups = new Set<string>();
	ALL_PERIODS.forEach(period => {
		const editorModelUsage = stats[period].editorModelUsage;
		if (!editorModelUsage) { return; }
		Object.keys(editorModelUsage).forEach(editor => {
			if (editorModelUsage[editor][model]) { groups.add(getBillingGroup(editor, model)); }
		});
	});
	return groups;
}

/**
 * Whether an item (editor or model) should remain visible given the current provider filter.
 * With nothing excluded, everything is visible. When we have no billing-group data for the
 * item (e.g. older cached stats), it is never hidden — we only filter what we can attribute.
 */
function isVisibleForProviderFilter(groups: Set<string>): boolean {
	if (excludedProviders.size === 0) { return true; }
	if (groups.size === 0) { return true; }
	return Array.from(groups).some(g => !excludedProviders.has(g));
}

type EditorItem = {
	editor: string;
	todayUsage: { tokens: number; sessions: number };
	last30DaysUsage: { tokens: number; sessions: number };
	monthUsage: { tokens: number; sessions: number };
	lastMonthUsage: { tokens: number; sessions: number };
	projectedTokens: number;
	projectedSessions: number;
	/** Present when this item represents the aggregated "Other" group rather than a single editor. */
	otherEditors?: string[];
};

function toEditorItem(stats: DetailedStats, editor: string): EditorItem {
	const todayUsage = stats.today.editorUsage[editor] || { tokens: 0, sessions: 0 };
	const last30DaysUsage = stats.last30Days.editorUsage[editor] || { tokens: 0, sessions: 0 };
	const monthUsage = stats.month.editorUsage[editor] || { tokens: 0, sessions: 0 };
	const lastMonthUsage = stats.lastMonth.editorUsage[editor] || { tokens: 0, sessions: 0 };
	return { editor, todayUsage, last30DaysUsage, monthUsage, lastMonthUsage, projectedTokens: Math.round(calculateProjection(last30DaysUsage.tokens)), projectedSessions: Math.round(calculateProjection(last30DaysUsage.sessions)) };
}

/** Aggregated pseudo-item for the "Other" editors group, so it can be sorted alongside individual editors instead of always trailing the top-N list. */
function toOtherEditorItem(stats: DetailedStats, otherEditors: string[]): EditorItem {
	const sumUsage = (period: 'today' | 'last30Days' | 'month' | 'lastMonth') =>
		otherEditors.reduce((acc, e) => {
			const u = stats[period].editorUsage[e] || { tokens: 0, sessions: 0 };
			return { tokens: acc.tokens + u.tokens, sessions: acc.sessions + u.sessions };
		}, { tokens: 0, sessions: 0 });
	const todayUsage = sumUsage('today');
	const last30DaysUsage = sumUsage('last30Days');
	const monthUsage = sumUsage('month');
	const lastMonthUsage = sumUsage('lastMonth');
	return {
		editor: `Other (${otherEditors.length} editor${otherEditors.length !== 1 ? 's' : ''})`,
		todayUsage, last30DaysUsage, monthUsage, lastMonthUsage,
		projectedTokens: Math.round(calculateProjection(last30DaysUsage.tokens)),
		projectedSessions: Math.round(calculateProjection(last30DaysUsage.sessions)),
		otherEditors,
	};
}

function sortEditorItems(items: EditorItem[]): void {
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
}

/** Sort editors by the currently selected column for the purpose of deciding which ones are "top N".
 *  Unlike the table sort, this is always descending for numeric columns (so the largest values are
 *  shown individually) and ascending for the name column, regardless of the user's sort direction. */
function sortEditorsBySignificance(stats: DetailedStats, editors: string[]): string[] {
	return [...editors].sort((a, b) => {
		if (editorSortKey === 'name') {
			return a.localeCompare(b);
		}
		const aItem = toEditorItem(stats, a);
		const bItem = toEditorItem(stats, b);
		let cmp: number;
		switch (editorSortKey) {
			case 'today': cmp = aItem.todayUsage.tokens - bItem.todayUsage.tokens; break;
			case 'last30Days': cmp = aItem.last30DaysUsage.tokens - bItem.last30DaysUsage.tokens; break;
			case 'month': cmp = aItem.monthUsage.tokens - bItem.monthUsage.tokens; break;
			case 'lastMonth': cmp = aItem.lastMonthUsage.tokens - bItem.lastMonthUsage.tokens; break;
			case 'projected': cmp = aItem.projectedTokens - bItem.projectedTokens; break;
			default: cmp = 0;
		}
		return -cmp || a.localeCompare(b);
	});
}

function buildEditorRow(item: EditorItem, totals: { today: number; last30Days: number; month: number; lastMonth: number }, isOtherChild: boolean): HTMLTableRowElement {
	const { editor, todayUsage, last30DaysUsage, monthUsage, lastMonthUsage, projectedTokens, projectedSessions } = item;
	const todayPct = totals.today > 0 ? (todayUsage.tokens / totals.today) * 100 : 0;
	const last30Pct = totals.last30Days > 0 ? (last30DaysUsage.tokens / totals.last30Days) * 100 : 0;
	const monthPct = totals.month > 0 ? (monthUsage.tokens / totals.month) * 100 : 0;
	const lastMonthPct = totals.lastMonth > 0 ? (lastMonthUsage.tokens / totals.lastMonth) * 100 : 0;
	const tr = document.createElement('tr');
	if (isOtherChild) { tr.style.opacity = '0.85'; }
	if (editor === 'JetBrains') { tr.title = 'JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available.'; }
	if (editor === 'Antigravity') { tr.title = 'Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally.'; }
	if (editor === 'Cursor') { tr.title = 'Cursor: token counts reflect the context window size at the last request (contextTokensUsed). Output tokens are not stored locally.'; }
	const labelTd = document.createElement('td');
	const labelWrapper = document.createElement('span');
	labelWrapper.className = 'metric-label';
	if (isOtherChild) {
		const indentSpan = document.createElement('span');
		indentSpan.style.cssText = 'display:inline-block;width:12px';
		labelWrapper.append(indentSpan);
	}
	labelWrapper.append(document.createTextNode(`${getEditorIcon(editor)} ${editor}`));
	if (editor === 'JetBrains' || editor === 'Antigravity' || editor === 'Cursor') { labelWrapper.append(document.createTextNode(' ⓘ')); }
	labelTd.append(labelWrapper);
	tr.append(labelTd,
		buildValueCell(formatCompact(todayUsage.tokens), `${formatPercent(todayPct)} · ${todayUsage.sessions} sessions`),
		buildValueCell(formatCompact(last30DaysUsage.tokens), `${formatPercent(last30Pct)} · ${last30DaysUsage.sessions} sessions`),
		buildValueCell(formatCompact(monthUsage.tokens), `${formatPercent(monthPct)} · ${monthUsage.sessions} sessions`),
		buildValueCell(formatCompact(lastMonthUsage.tokens), `${formatPercent(lastMonthPct)} · ${lastMonthUsage.sessions} sessions`),
		buildValueCell(formatCompact(projectedTokens), `${projectedSessions} sessions`));
	return tr;
}

function appendOtherEditors(item: EditorItem, totals: { today: number; last30Days: number; month: number; lastMonth: number }, onToggleOther: () => void, tbody: HTMLTableSectionElement, stats: DetailedStats): void {
	const otherEditors = item.otherEditors ?? [];
	const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);
	const otherTr = document.createElement('tr');
	otherTr.style.cursor = 'pointer'; otherTr.style.background = 'var(--list-hover-bg)';
	otherTr.title = editorOtherExpanded ? 'Collapse other editors' : 'Expand other editors';
	const otherLabelWrapper = document.createElement('span'); otherLabelWrapper.className = 'metric-label';
	const otherNameSpan = document.createElement('span');
	otherNameSpan.style.cssText = 'color:var(--text-secondary);font-weight:600;';
	otherNameSpan.textContent = `📦 ${item.editor}`;
	const otherToggleSpan = document.createElement('span');
	otherToggleSpan.style.cssText = 'font-size:10px;color:var(--text-muted)';
	otherToggleSpan.textContent = ` ${editorOtherExpanded ? '▲' : '▼'}`;
	otherLabelWrapper.append(otherNameSpan, otherToggleSpan);
	const otherLabelTd = document.createElement('td'); otherLabelTd.append(otherLabelWrapper);
	const mkOtherTd = (usage: { tokens: number; sessions: number }, total: number) => {
		const td = buildValueCell(formatCompact(usage.tokens));
		td.append(el('div', 'muted', `${formatPercent(pct(usage.tokens, total))} · ${usage.sessions} sessions`));
		return td;
	};
	otherTr.append(otherLabelTd,
		mkOtherTd(item.todayUsage, totals.today), mkOtherTd(item.last30DaysUsage, totals.last30Days),
		mkOtherTd(item.monthUsage, totals.month), mkOtherTd(item.lastMonthUsage, totals.lastMonth),
		buildValueCell(formatCompact(item.projectedTokens), `${item.projectedSessions} sessions`));
	otherTr.addEventListener('click', () => { editorOtherExpanded = !editorOtherExpanded; saveSortSettings(); onToggleOther(); });
	tbody.append(otherTr);
	if (editorOtherExpanded) {
		const otherItems = otherEditors.map(e => toEditorItem(stats, e));
		sortEditorItems(otherItems);
		otherItems.forEach(childItem => tbody.append(buildEditorRow(childItem, totals, true)));
	}
}

function buildEditorTbody(stats: DetailedStats, visibleEditors: string[], onToggleOther: () => void): HTMLTableSectionElement {
const editors = visibleEditors;
const totals = {
	today: editors.reduce((s, e) => s + (stats.today.editorUsage[e]?.tokens || 0), 0),
	last30Days: editors.reduce((s, e) => s + (stats.last30Days.editorUsage[e]?.tokens || 0), 0),
	month: editors.reduce((s, e) => s + (stats.month.editorUsage[e]?.tokens || 0), 0),
	lastMonth: editors.reduce((s, e) => s + (stats.lastMonth.editorUsage[e]?.tokens || 0), 0),
};
const tbody = document.createElement('tbody');
if (editors.length === 0) {
	tbody.append(buildNoDataRow(6, 'No editor usage matches the selected provider filter.'));
	return tbody;
}
// Split into the top N editors for the currently selected column and an aggregated "Other" group.
// Only the top-N rows are sorted by the user's chosen column; the "Other" row always stays last
// so it doesn't get interleaved among the individual editors it summarizes.
const sortedBySignificance = sortEditorsBySignificance(stats, editors);
const topEditors = sortedBySignificance.slice(0, TOP_N_EDITORS);
const otherEditors = sortedBySignificance.slice(TOP_N_EDITORS);
const items: EditorItem[] = topEditors.map(editor => toEditorItem(stats, editor));
sortEditorItems(items);
if (otherEditors.length > 0) { items.push(toOtherEditorItem(stats, otherEditors)); }
items.forEach(item => {
	if (item.otherEditors) {
		appendOtherEditors(item, totals, onToggleOther, tbody, stats);
	} else {
		tbody.append(buildEditorRow(item, totals, false));
	}
});
return tbody;
}

const TOP_N_EDITORS = 5;

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

const visibleEditors = Array.from(allEditors).filter(editor => isVisibleForProviderFilter(editorBillingGroups(stats, editor)));

const section = el('div', 'section');
const heading = iconHeading('h3', 'device-desktop', 'Usage by Editor');
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

function rebuildTbody(): void {
	const newTbody = buildEditorTbody(stats, visibleEditors, rebuildTbody);
	const oldTbody = table.querySelector('tbody');
	if (oldTbody) { table.replaceChild(newTbody, oldTbody); } else { table.append(newTbody); }
}

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
rebuildTbody();
saveSortSettings();
}
);

table.append(thead);
rebuildTbody();
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
	/** Present when this item represents the aggregated "Other" group rather than a single model. */
	otherModels?: string[];
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

/** Aggregated pseudo-item for the "Other" models group, so it can be sorted alongside individual models instead of always trailing the top-N list. */
function toOtherModelItem(stats: DetailedStats, otherModels: string[]): ModelItem {
	const sumUsage = (period: 'today' | 'last30Days' | 'month' | 'lastMonth') =>
		otherModels.reduce((acc, m) => {
			const u = stats[period].modelUsage[m] || { inputTokens: 0, outputTokens: 0 };
			return { inputTokens: acc.inputTokens + u.inputTokens, outputTokens: acc.outputTokens + u.outputTokens };
		}, { inputTokens: 0, outputTokens: 0 });
	const todayUsage = sumUsage('today'); const last30DaysUsage = sumUsage('last30Days');
	const monthUsage = sumUsage('month'); const lastMonthUsage = sumUsage('lastMonth');
	const todayTotal = todayUsage.inputTokens + todayUsage.outputTokens;
	const last30DaysTotal = last30DaysUsage.inputTokens + last30DaysUsage.outputTokens;
	const monthTotal = monthUsage.inputTokens + monthUsage.outputTokens;
	const lastMonthTotal = lastMonthUsage.inputTokens + lastMonthUsage.outputTokens;
	return {
		model: `Other (${otherModels.length} model${otherModels.length !== 1 ? 's' : ''})`,
		todayTotal,
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
		projected: Math.round(calculateProjection(last30DaysTotal)), charsPerToken: 0,
		otherModels,
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

/** Sort models by the currently selected column for the purpose of deciding which ones are "top N".
 *  Unlike the table sort, this is always descending for numeric columns (so the largest values are
 *  shown individually) and ascending for the name column, regardless of the user's sort direction. */
function sortModelsBySignificance(stats: DetailedStats, models: string[]): string[] {
	return [...models].sort((a, b) => {
		if (modelSortKey === 'name') {
			return a.localeCompare(b);
		}
		const aItem = toModelItem(stats, a);
		const bItem = toModelItem(stats, b);
		let cmp: number;
		switch (modelSortKey) {
			case 'today': cmp = aItem.todayTotal - bItem.todayTotal; break;
			case 'last30Days': cmp = aItem.last30DaysTotal - bItem.last30DaysTotal; break;
			case 'month': cmp = aItem.monthTotal - bItem.monthTotal; break;
			case 'lastMonth': cmp = aItem.lastMonthTotal - bItem.lastMonthTotal; break;
			case 'projected': cmp = aItem.projected - bItem.projected; break;
			default: cmp = 0;
		}
		return -cmp || a.localeCompare(b);
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

function appendOtherModels(item: ModelItem, onToggleOther: () => void, tbody: HTMLTableSectionElement, stats: DetailedStats): void {
	const otherModels = item.otherModels ?? [];
	const pct = (part: number, total: number) => (total > 0 ? (part / total) * 100 : 0);
	const otherTr = document.createElement('tr');
	otherTr.style.cursor = 'pointer'; otherTr.style.background = 'var(--list-hover-bg)';
	otherTr.title = modelOtherExpanded ? 'Collapse other models' : 'Expand other models';
	const otherLabelWrapper = document.createElement('span'); otherLabelWrapper.className = 'metric-label';
	const otherNameSpan = document.createElement('span');
	otherNameSpan.style.cssText = 'color:var(--text-secondary);font-weight:600;';
	otherNameSpan.textContent = `📦 ${item.model}`;
	const otherToggleSpan = document.createElement('span');
	otherToggleSpan.style.cssText = 'font-size:10px;color:var(--text-muted)';
	otherToggleSpan.textContent = ` ${modelOtherExpanded ? '▲' : '▼'}`;
	otherLabelWrapper.append(otherNameSpan, otherToggleSpan);
	const otherLabelTd = document.createElement('td'); otherLabelTd.append(otherLabelWrapper);
	const mkOtherTd = (total: number, inputPct: number, outputPct: number) => {
		const td = buildValueCell(formatCompact(total));
		if (total > 0) { td.append(el('div', 'muted', `↑${formatPercent(inputPct)} ↓${formatPercent(outputPct)}`)); }
		return td;
	};
	otherTr.append(otherLabelTd,
		mkOtherTd(item.todayTotal, item.todayInputPct, item.todayOutputPct),
		mkOtherTd(item.last30DaysTotal, item.last30DaysInputPct, item.last30DaysOutputPct),
		mkOtherTd(item.monthTotal, item.monthInputPct, item.monthOutputPct),
		mkOtherTd(item.lastMonthTotal, item.lastMonthInputPct, item.lastMonthOutputPct),
		buildValueCell(formatCompact(item.projected)));
	otherTr.addEventListener('click', () => { modelOtherExpanded = !modelOtherExpanded; saveSortSettings(); onToggleOther(); });
	tbody.append(otherTr);
	if (modelOtherExpanded) {
		const otherItems = otherModels.map(m => toModelItem(stats, m));
		sortModelItems(otherItems);
		otherItems.forEach(childItem => tbody.append(buildModelRowEl(childItem, true)));
	}
}

function buildModelTbody(stats: DetailedStats, visibleModels: string[], onToggleOther: () => void): HTMLTableSectionElement {
	// Split into the top N models for the currently selected column and an aggregated "Other" group.
	// Only the top-N rows are sorted by the user's chosen column; the "Other" row always stays last
	// so it doesn't get interleaved among the individual models it summarizes.
	const sortedBySignificance = sortModelsBySignificance(stats, visibleModels);
	const topModels = sortedBySignificance.slice(0, TOP_N_MODELS);
	const otherModels = sortedBySignificance.slice(TOP_N_MODELS);
	const items: ModelItem[] = topModels.map(m => toModelItem(stats, m));
	sortModelItems(items);
	if (otherModels.length > 0) { items.push(toOtherModelItem(stats, otherModels)); }
	const tbody = document.createElement('tbody');
	items.forEach(item => {
		if (item.otherModels) {
			appendOtherModels(item, onToggleOther, tbody, stats);
		} else {
			tbody.append(buildModelRowEl(item, false));
		}
	});
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

const visibleModels = new Set(Array.from(allModels).filter(model => isVisibleForProviderFilter(modelBillingGroups(stats, model))));

const section = el('div', 'section');
const heading = iconHeading('h3', 'symbol-numeric', 'Model Usage (Tokens)');
section.append(heading);

const table = document.createElement('table');
table.className = 'stats-table';

if (visibleModels.size === 0) {
const tbody = document.createElement('tbody');
tbody.append(buildNoDataRow(6, 'No model usage matches the selected provider filter.'));
table.append(tbody);
section.append(table);
return section;
}

const modelColHeaders: ColHeader[] = [
{ icon: '🧠', text: 'Model', key: 'name' },
{ icon: '📅', text: 'Today', key: 'today' },
{ icon: '📈', text: 'Last 30 Days', key: 'last30Days' },
{ icon: '🗓️', text: 'Current Month', key: 'month' },
{ icon: '📆', text: 'Previous Month', key: 'lastMonth' },
{ icon: '🌍', text: 'Projected Year', key: 'projected' }
];

function rebuildTbody(): void {
const newTbody = buildModelTbody(stats, Array.from(visibleModels), rebuildTbody);
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
'🚀 Antigravity — Google\'s Gemini-powered desktop IDE',
'🤖 Claude Code — Anthropic\'s CLI coding agent',
'💻 Copilot CLI — GitHub Copilot in the terminal',
'🖱️ Cursor, 🌊 Windsurf — built-in AI chat',
'💎 Gemini CLI — Google\'s open-source CLI coding agent',
'🟢 OpenCode, 🦀 Crush — terminal-based coding agents',
'π Pi — Mistral-powered terminal coding agent',
'🖥️ Visual Studio 2022+ — GitHub Copilot Chat extension',
'💙 VS Code / VS Code Insiders / VSCodium — GitHub Copilot Chat extension',
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
const heading = iconHeading('h3', 'lightbulb', 'Calculation & Estimates');
section.append(heading);

const notes = document.createElement('ul');
notes.className = 'notes';

const items = [
'Cost (UBB) uses GitHub Copilot AI Credit rates (1 credit = $0.01) — this is what you are billed under Usage Based Billing.',
'"Estimated cost (selected providers)" and the summary cost card sum estimated spend across all providers (GitHub Copilot, Anthropic, Google, OpenAI, …); use the "⚙ Providers" filter in the Cost by Provider section to include/exclude specific providers.',
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

const efficiency = document.getElementById('btn-efficiency');
efficiency?.addEventListener('click', () => vscode.postMessage({ command: 'showEfficiency' }));

// Cast to the looser signature required by the shared wireExtensionPointButtons utility,
// which posts extension-point-specific messages not modelled in WebviewMessage.
wireExtensionPointButtons(vscode as { postMessage: (message: unknown) => void });
}

async function bootstrap(): Promise<void> {
console.log('[CopilotTokenTracker] bootstrap called');
await import('@vscode-elements/elements/dist/vscode-button/index.js');
await import('@vscode-elements/elements/dist/vscode-badge/index.js');

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
