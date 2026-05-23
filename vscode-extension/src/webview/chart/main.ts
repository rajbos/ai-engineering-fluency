// @ts-nocheck // Chart.js ESM bundle is loaded dynamically; skip CJS resolution noise
import { el, createButton } from '../shared/domUtils';
import { BUTTONS } from '../shared/buttonConfig';
import { formatCompact, setCompactNumbers } from '../shared/formatUtils';
import { wireExtensionPointButtons } from '../shared/extensionPoints';
import { getCurrentPeriodFraction, computeProjectionExtra } from './projectionUtils';
import { createViewStateManager } from '../shared/viewState';
// CSS imported as text via esbuild
import themeStyles from '../shared/theme.css';
import styles from './styles.css';
import { getWindowData } from '../shared/dataLoader';
import { registerMessageHandler } from '../shared/messageHandler';

type ChartModule = typeof import('chart.js/auto');
type ChartConstructor = ChartModule['default'];
type ChartInstance = InstanceType<ChartConstructor>;
type ChartConfig = import('chart.js').ChartConfiguration<'bar' | 'line', number[], string>;

type ModelDataset = { label: string; data: number[]; backgroundColor: string; borderColor: string; borderWidth: number };
type EditorDataset = ModelDataset;
type RepositoryDataset = ModelDataset & { fullRepo?: string };

type ChartPeriodData = {
	labels: string[];
	tokensData: number[];
	sessionsData: number[];
	modelDatasets: ModelDataset[];
	editorDatasets: EditorDataset[];
	repositoryDatasets: RepositoryDataset[];
	periodCount: number;
	totalTokens: number;
	totalSessions: number;
	avgPerPeriod: number;
	costData: number[];
	totalCost: number;
	avgCostPerPeriod: number;
	locData?: number[];
	linesAddedData?: number[];
	linesRemovedData?: number[];
	languageDatasets?: ModelDataset[];
	locEditorDatasets?: ModelDataset[];
	locRepositoryDatasets?: RepositoryDataset[];
	totalLinesAdded?: number;
	totalLinesRemoved?: number;
	avgLocPerPeriod?: number;
};

type ChartPeriod = import('./projectionUtils').ChartPeriod;

type InitialChartData = {
	labels: string[];
	tokensData: number[];
	sessionsData: number[];
	modelDatasets: ModelDataset[];
	editorDatasets: EditorDataset[];
	repositoryDatasets: RepositoryDataset[];
	editorTotalsMap: Record<string, number>;
	repositoryTotalsMap: Record<string, number>;
	dailyCount: number;
	totalTokens: number;
	avgTokensPerDay: number;
	totalSessions: number;
	lastUpdated: string;
	backendConfigured?: boolean;
	compactNumbers?: boolean;
	periodsReady?: boolean;
	hasLocData?: boolean;
	initialPeriod?: ChartPeriod;
	initialView?: 'total' | 'model' | 'editor' | 'repository' | 'cost';
	initialMetric?: 'tokens' | 'output' | 'cost';
	initialSplit?: 'total' | 'model' | 'editor' | 'repository' | 'language';
	periods?: {
		day: ChartPeriodData;
		week: ChartPeriodData;
		month: ChartPeriodData;
	};
};

// VS Code injects this in the webview environment
declare function acquireVsCodeApi<TState = unknown>(): {
	postMessage: (message: any) => void;
	setState: (newState: TState) => void;
	getState: () => TState | undefined;
};

type VSCodeApi = ReturnType<typeof acquireVsCodeApi>;

const vscode: VSCodeApi = acquireVsCodeApi();
const initialData = getWindowData<InitialChartData>('__INITIAL_CHART__');

let chart: ChartInstance | undefined;
let Chart: ChartConstructor | undefined;

async function loadChartModule(): Promise<void> {
	if (Chart) {
		return;
	}
	const mod = await import('chart.js/auto');
	Chart = mod.default;
}
let currentMetric: 'tokens' | 'output' | 'cost' = 'tokens';
let currentSplit: 'total' | 'model' | 'editor' | 'repository' | 'language' = 'total';
let currentPeriod: ChartPeriod = 'day';
// Stores state to restore after a background data update re-initializes the chart
let pendingMetric: typeof currentMetric | null = null;
let pendingSplit: typeof currentSplit | null = null;
let pendingPeriod: ChartPeriod | null = null;

type DisplayMode = 'actual' | 'rolling';
let currentDisplayMode: DisplayMode = 'actual';

type ChartWebviewState = {
	period: ChartPeriod;
	metric: 'tokens' | 'output' | 'cost';
	split: 'total' | 'model' | 'editor' | 'repository' | 'language';
	displayMode: DisplayMode;
	/** @deprecated Use metric + split instead. Kept for migration of old saved state. */
	view?: 'total' | 'model' | 'editor' | 'repository' | 'cost';
};

const chartState = createViewStateManager<ChartWebviewState>(vscode, {
	period: 'day',
	metric: 'tokens',
	split: 'total',
	displayMode: 'actual',
});

function saveWebviewState(): void {
	chartState.save({ period: currentPeriod, metric: currentMetric, split: currentSplit, displayMode: currentDisplayMode });
}
const ROLLING_WINDOW: Record<ChartPeriod, number> = { day: 7, week: 4, month: 3 };

function computeRollingAverage(data: number[], window: number): number[] {
	return data.map((_, i) => {
		const start = Math.max(0, i - window + 1);
		const slice = data.slice(start, i + 1);
		return Math.round(slice.reduce((a, b) => a + b, 0) / slice.length);
	});
}

function getRollingLabel(): string {
	const w = ROLLING_WINDOW[currentPeriod];
	const unit = currentPeriod === 'day' ? 'day' : currentPeriod === 'week' ? 'week' : 'month';
	return `${w}-${unit} rolling avg`;
}

function getChartTitle(): string {
	const periodMeta = PERIOD_LABELS[currentPeriod];
	if (currentMetric === 'cost') {
		let titleText = periodMeta.costTitle;
		if (currentDisplayMode === 'rolling' && currentSplit === 'total') {
			titleText += ` (${getRollingLabel()})`;
		}
		return titleText;
	}
	if (currentMetric === 'output') {
		return periodMeta.outputTitle;
	}
	let titleText = periodMeta.title;
	if (currentDisplayMode === 'rolling' && currentSplit === 'total') {
		titleText += ` (${getRollingLabel()})`;
	}
	return titleText;
}

/** Returns period data for the current period, falling back to legacy flat fields. */
function getActivePeriodData(data: InitialChartData): ChartPeriodData {
	if (data.periods) {
		return data.periods[currentPeriod];
	}
	// Fallback for backward compat (no periods field)
	return {
		labels: data.labels,
		tokensData: data.tokensData,
		sessionsData: data.sessionsData,
		modelDatasets: data.modelDatasets,
		editorDatasets: data.editorDatasets,
		repositoryDatasets: data.repositoryDatasets,
		periodCount: data.dailyCount,
		totalTokens: data.totalTokens,
		totalSessions: data.totalSessions,
		avgPerPeriod: data.avgTokensPerDay,
		costData: [],
		totalCost: 0,
		avgCostPerPeriod: 0,
	};
}

const PERIOD_LABELS: Record<ChartPeriod, { title: string; footer: string; countLabel: string; avgLabel: string; costTitle: string; avgCostLabel: string; outputTitle: string; avgLocLabel: string }> = {
	day:   { title: 'Token Usage – Last 30 Days',  footer: 'Day-by-day token usage for the last 30 days',   countLabel: 'Total Days',   avgLabel: 'Avg Tokens / Day',   costTitle: 'Est. Cost – Last 30 Days',  avgCostLabel: 'Avg Cost / Day',   outputTitle: 'Lines of Code – Last 30 Days',  avgLocLabel: 'Avg Lines / Day'   },
	week:  { title: 'Token Usage – Last 6 Weeks',  footer: 'Week-by-week token usage for the last 6 weeks', countLabel: 'Total Weeks',  avgLabel: 'Avg Tokens / Week',  costTitle: 'Est. Cost – Last 6 Weeks',  avgCostLabel: 'Avg Cost / Week',  outputTitle: 'Lines of Code – Last 6 Weeks',  avgLocLabel: 'Avg Lines / Week'  },
	month: { title: 'Token Usage – Last 12 Months', footer: 'Monthly token usage for the last 12 months',   countLabel: 'Total Months', avgLabel: 'Avg Tokens / Month', costTitle: 'Est. Cost – Last 12 Months', avgCostLabel: 'Avg Cost / Month', outputTitle: 'Lines of Code – Last 12 Months', avgLocLabel: 'Avg Lines / Month' },
};

function isComboSupported(metric: string, split: string): boolean {
	if (metric === 'cost') { return split === 'total'; }
	if (metric === 'output') { return split !== 'model'; }
	return split !== 'language';
}

function buildChartHeader(data: InitialChartData): HTMLElement {
	const header = el('div', 'header');
	const headerLeft = el('div', 'header-left');
	const title = el('span', 'header-title', getChartTitle());
	title.id = 'chart-title';
	headerLeft.append(el('span', 'header-icon', '📈'), title);
	const buttons = el('div', 'button-row');
	buttons.append(
		createButton(BUTTONS['btn-refresh']), createButton(BUTTONS['btn-details']),
		createButton(BUTTONS['btn-usage']), createButton(BUTTONS['btn-environmental']),
		createButton(BUTTONS['btn-diagnostics']), createButton(BUTTONS['btn-maturity']),
	);
	if (data.backendConfigured) { buttons.append(createButton(BUTTONS['btn-dashboard'])); }
	header.append(headerLeft, buttons);
	return header;
}

function buildSummaryCards(periodData: ChartPeriodData, periodMeta: typeof PERIOD_LABELS[ChartPeriod]): HTMLElement {
	const totalLabel = currentMetric === 'cost' ? 'Total Cost (est.)' : currentMetric === 'output' ? 'Total Lines (AI)' : 'Total Tokens';
	const totalValue = currentMetric === 'cost' ? `$${periodData.totalCost.toFixed(2)}`
		: currentMetric === 'output' ? ((periodData.totalLinesAdded ?? 0) + (periodData.totalLinesRemoved ?? 0)).toLocaleString()
		: formatCompact(periodData.totalTokens);
	const avgLabel = currentMetric === 'cost' ? periodMeta.avgCostLabel : currentMetric === 'output' ? periodMeta.avgLocLabel : periodMeta.avgLabel;
	const avgValue = currentMetric === 'cost' ? `$${periodData.avgCostPerPeriod.toFixed(2)}`
		: currentMetric === 'output' ? Math.round(periodData.avgLocPerPeriod ?? 0).toLocaleString()
		: formatCompact(periodData.avgPerPeriod);
	const cards = el('div', 'cards');
	cards.id = 'summary-cards';
	cards.append(
		buildCard('card-period-count', periodMeta.countLabel, periodData.periodCount.toLocaleString()),
		buildCard('card-total-tokens', totalLabel, totalValue),
		buildCard('card-avg-tokens', avgLabel, avgValue),
		buildCard('card-total-sessions', 'Total Sessions', periodData.totalSessions.toLocaleString()),
	);
	return cards;
}

function buildPeriodToggles(periodsReady: boolean): HTMLElement {
	const periodToggles = el('div', 'period-controls');
	const dayBtn = el('button', `toggle${currentPeriod === 'day' ? ' active' : ''}`, '📅 Day');
	dayBtn.id = 'period-day';
	const weekBtn = el('button', `toggle${currentPeriod === 'week' ? ' active' : ''}`, periodsReady ? '🗓️ Week' : '🗓️ Week ⌛');
	weekBtn.id = 'period-week';
	const monthBtn = el('button', `toggle${currentPeriod === 'month' ? ' active' : ''}`, periodsReady ? '📆 Month' : '📆 Month ⌛');
	monthBtn.id = 'period-month';
	if (!periodsReady) {
		(weekBtn as HTMLButtonElement).disabled = true; weekBtn.title = 'Loading historical data…';
		(monthBtn as HTMLButtonElement).disabled = true; monthBtn.title = 'Loading historical data…';
	}
	periodToggles.append(dayBtn, weekBtn, monthBtn);
	return periodToggles;
}

function buildChartControls(data: InitialChartData): HTMLElement {
	const toggles = el('div', 'chart-controls');
	const metricGroup = el('div', 'control-group');
	const tokensBtn = el('button', `toggle${currentMetric === 'tokens' ? ' active' : ''}`, 'Tokens');
	tokensBtn.id = 'metric-tokens';
	const outputBtn = el('button', `toggle${currentMetric === 'output' ? ' active' : ''}${!data.hasLocData ? ' dim' : ''}`, '✏️ Output');
	outputBtn.id = 'metric-output';
	if (!data.hasLocData) { outputBtn.title = 'No edit data available yet (VS Code edit/agent sessions only)'; }
	const costBtn = el('button', `toggle${currentMetric === 'cost' ? ' active' : ''}`, '💰 Cost');
	costBtn.id = 'metric-cost';
	metricGroup.append(tokensBtn, outputBtn, costBtn);
	const splitGroup = el('div', 'control-group');
	const mkSplit = (id: string, split: string, label: string) => {
		const supported = isComboSupported(currentMetric, split);
		const btn = el('button', `toggle${currentSplit === split ? ' active' : ''}${!supported ? ' disabled' : ''}`, label);
		btn.id = id;
		if (!supported) { (btn as HTMLButtonElement).disabled = true; btn.title = `Not available for ${currentMetric} metric`; }
		return btn;
	};
	splitGroup.append(mkSplit('split-total', 'total', 'Total'), mkSplit('split-model', 'model', 'By Model'),
		mkSplit('split-editor', 'editor', 'By Editor'), mkSplit('split-repository', 'repository', 'By Repository'),
		mkSplit('split-language', 'language', 'By Language'));
	const rollingApplicable = currentSplit === 'total' && currentMetric !== 'output';
	const rollingBtn = el('button', `toggle${currentDisplayMode === 'rolling' ? ' active' : ''}${rollingApplicable ? '' : ' hidden'}`, '📈 Rolling Avg');
	rollingBtn.id = 'view-rolling';
	const rollingGroup = el('div', 'control-group');
	rollingGroup.append(rollingBtn);
	toggles.append(metricGroup, el('div', 'control-group-separator'), splitGroup, el('div', 'control-group-separator'), rollingGroup);
	return toggles;
}

function renderLayout(data: InitialChartData): void {
	setCompactNumbers(data.compactNumbers !== false);
	const root = document.getElementById('root');
	if (!root) { return; }
	root.replaceChildren();
	const themeStyle = document.createElement('style'); themeStyle.textContent = themeStyles;
	const style = document.createElement('style'); style.textContent = styles;
	const periodData = getActivePeriodData(data);
	const periodMeta = PERIOD_LABELS[currentPeriod];
	const summarySection = el('div', 'section');
	summarySection.append(el('h3', '', '📊 Summary'), buildSummaryCards(periodData, periodMeta));
	const editorCards = buildEditorCards(data.editorTotalsMap);
	if (editorCards) { summarySection.append(editorCards); }
	const chartSectionHeader = el('div', 'chart-section-header');
	chartSectionHeader.append(el('h3', '', '📊 Charts'), buildPeriodToggles(data.periodsReady !== false));
	const canvasWrap = el('div', 'canvas-wrap');
	const canvas = document.createElement('canvas'); canvas.id = 'token-chart'; canvasWrap.append(canvas);
	const chartShell = el('div', 'chart-shell');
	chartShell.append(buildChartControls(data), canvasWrap);
	const chartSection = el('div', 'section');
	chartSection.append(chartSectionHeader, chartShell);
	const footer = el('div', 'footer',
		`${periodMeta.footer}\nLast updated: ${new Date(data.lastUpdated).toLocaleString()}\nUpdates automatically every 5 minutes.`);
	footer.id = 'chart-footer';
	const container = el('div', 'container');
	container.append(buildChartHeader(data), summarySection, chartSection, footer);
	root.append(themeStyle, style, container);
	wireInteractions(data);
	void setupChart(canvas, data);
}

function buildCard(id: string, label: string, value: string): HTMLElement {
	const card = el('div', 'card');
	card.id = id;
	card.append(el('div', 'card-label', label), el('div', 'card-value', value));
	return card;
}

function buildEditorCards(editorTotals: Record<string, number>): HTMLElement | null {
	const entries = Object.entries(editorTotals);
	if (!entries.length) {
		return null;
	}
	const wrap = el('div', 'cards');
	entries.forEach(([editor, tokens]) => {
		const card = buildCard(`editor-${editor}`, editor, formatCompact(tokens));
		// JetBrains only persists user messages + assistant text in its JSONL
		// — no API counts, no thinking tokens. Flag the caveat with an
		// info marker on the card so users don't compare apples-to-oranges.
		if (editor === 'JetBrains') {
			card.title = 'JetBrains: only user messages + assistant text are persisted, so token counts here are estimates of those alone. Actual API counts and thinking tokens are not available.';
			const labelEl = card.querySelector('.card-label');
			if (labelEl) { labelEl.textContent = `${editor} ⓘ`; }
		}
		if (editor === 'Antigravity') {
			card.title = 'Antigravity: token counts are estimated from transcript content. Actual API counts are not stored locally.';
			const labelEl = card.querySelector('.card-label');
			if (labelEl) { labelEl.textContent = `${editor} ⓘ`; }
		}
		wrap.append(card);
	});
	return wrap;
}

function updateSummaryCards(data: InitialChartData): void {
	const periodData = getActivePeriodData(data);
	const periodMeta = PERIOD_LABELS[currentPeriod];

	const updateCard = (id: string, label: string | null, value: string) => {
		const card = document.getElementById(id);
		if (!card) { return; }
		if (label !== null) {
			const labelEl = card.querySelector('.card-label');
			if (labelEl) { labelEl.textContent = label; }
		}
		const valueEl = card.querySelector('.card-value');
		if (valueEl) { valueEl.textContent = value; }
	};

	updateCard('card-period-count', periodMeta.countLabel, periodData.periodCount.toLocaleString());

	if (currentMetric === 'cost') {
		updateCard('card-total-tokens', 'Total Cost (est.)', `$${periodData.totalCost.toFixed(2)}`);
		updateCard('card-avg-tokens', periodMeta.avgCostLabel, `$${periodData.avgCostPerPeriod.toFixed(2)}`);
	} else if (currentMetric === 'output') {
		const totalLines = (periodData.totalLinesAdded ?? 0) + (periodData.totalLinesRemoved ?? 0);
		updateCard('card-total-tokens', 'Total Lines (AI)', totalLines.toLocaleString());
		updateCard('card-avg-tokens', periodMeta.avgLocLabel, Math.round(periodData.avgLocPerPeriod ?? 0).toLocaleString());
	} else {
		updateCard('card-total-tokens', 'Total Tokens', formatCompact(periodData.totalTokens));
		updateCard('card-avg-tokens', periodMeta.avgLabel, formatCompact(periodData.avgPerPeriod));
	}

	updateCard('card-total-sessions', null, periodData.totalSessions.toLocaleString());

	const title = document.getElementById('chart-title');
	if (title) { title.textContent = getChartTitle(); }

	const footer = document.getElementById('chart-footer');
	if (footer) {
		footer.textContent = `${periodMeta.footer}\nLast updated: ${new Date(data.lastUpdated).toLocaleString()}\nUpdates automatically every 5 minutes.`;
	}
}

function wireInteractions(data: InitialChartData): void {
	const refresh = document.getElementById('btn-refresh');
	refresh?.addEventListener('click', () => vscode.postMessage({ command: 'refresh' }));

	const details = document.getElementById('btn-details');
	details?.addEventListener('click', () => vscode.postMessage({ command: 'showDetails' }));

	const usage = document.getElementById('btn-usage');
	usage?.addEventListener('click', () => vscode.postMessage({ command: 'showUsageAnalysis' }));

	const diagnostics = document.getElementById('btn-diagnostics');
	diagnostics?.addEventListener('click', () => vscode.postMessage({ command: 'showDiagnostics' }));

	const maturity = document.getElementById('btn-maturity');
	maturity?.addEventListener('click', () => vscode.postMessage({ command: 'showMaturity' }));

	const dashboard = document.getElementById('btn-dashboard');
	dashboard?.addEventListener('click', () => vscode.postMessage({ command: 'showDashboard' }));

	const environmental = document.getElementById('btn-environmental');
	environmental?.addEventListener('click', () => vscode.postMessage({ command: 'showEnvironmental' }));

	wireExtensionPointButtons(vscode);

	// Period toggle buttons
	const periodButtons: Array<{ id: string; period: ChartPeriod }> = [
		{ id: 'period-day',   period: 'day'   },
		{ id: 'period-week',  period: 'week'  },
		{ id: 'period-month', period: 'month' },
	];
	periodButtons.forEach(({ id, period }) => {
		const btn = document.getElementById(id);
		btn?.addEventListener('click', () => { void switchPeriod(period, data); });
	});

	// Chart metric toggle buttons
	const metricButtons: Array<{ id: string; metric: typeof currentMetric }> = [
		{ id: 'metric-tokens', metric: 'tokens' },
		{ id: 'metric-output', metric: 'output' },
		{ id: 'metric-cost',   metric: 'cost'   },
	];
	metricButtons.forEach(({ id, metric }) => {
		const btn = document.getElementById(id);
		btn?.addEventListener('click', () => { void switchMetric(metric, data); });
	});

	// Chart split toggle buttons
	const splitButtons: Array<{ id: string; split: typeof currentSplit }> = [
		{ id: 'split-total',      split: 'total'      },
		{ id: 'split-model',      split: 'model'      },
		{ id: 'split-editor',     split: 'editor'     },
		{ id: 'split-repository', split: 'repository' },
		{ id: 'split-language',   split: 'language'   },
	];
	splitButtons.forEach(({ id, split }) => {
		const btn = document.getElementById(id);
		btn?.addEventListener('click', () => { void switchSplit(split, data); });
	});

	const rollingToggle = document.getElementById('view-rolling');
	rollingToggle?.addEventListener('click', () => { void switchDisplayMode(data); });
}

async function setupChart(canvas: HTMLCanvasElement, data: InitialChartData): Promise<void> {
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return;
	}
	await loadChartModule();
	if (!Chart) {
		return;
	}
	chart = new Chart(ctx, createConfig(data));
	// Restore the previously active period and view if a background update triggered a re-render
	if (pendingPeriod !== null && pendingPeriod !== 'day') {
		const periodToRestore = pendingPeriod;
		currentPeriod = 'day';
		await switchPeriod(periodToRestore, data);
	} else if (pendingMetric !== null || pendingSplit !== null) {
		const metricToRestore = pendingMetric ?? currentMetric;
		const splitToRestore = pendingSplit ?? currentSplit;
		currentMetric = 'tokens';
		currentSplit = 'total';
		await switchMetric(metricToRestore, data);
		if (splitToRestore !== 'total') {
			await switchSplit(splitToRestore, data);
		}
	}
	pendingMetric = null;
	pendingSplit = null;
	pendingPeriod = null;
}

async function switchPeriod(period: ChartPeriod, data: InitialChartData): Promise<void> {
	if (currentPeriod === period) {
		return;
	}
	currentPeriod = period;
	vscode.postMessage({ command: 'setPeriodPreference', period });
	saveWebviewState();
	setActivePeriod(period);
	updateSummaryCards(data);
	if (!chart) {
		return;
	}
	const canvas = chart.canvas as HTMLCanvasElement | null;
	chart.destroy();
	if (!canvas) {
		return;
	}
	const ctx = canvas.getContext('2d');
	if (!ctx) {
		return;
	}
	await loadChartModule();
	if (!Chart) {
		return;
	}
	chart = new Chart(ctx, createConfig(data));
}

async function switchMetric(metric: typeof currentMetric, data: InitialChartData): Promise<void> {
	if (currentMetric === metric) { return; }
	// When switching to cost, force split to total (only supported combo)
	if (metric === 'cost') { currentSplit = 'total'; }
	// When switching to output, disable unsupported splits
	if (metric === 'output' && currentSplit === 'model') { currentSplit = 'total'; }
	// When switching to tokens, disable language split
	if (metric === 'tokens' && currentSplit === 'language') { currentSplit = 'total'; }
	currentMetric = metric;
	const rollingApplicable = currentSplit === 'total' && metric !== 'output';
	if (!rollingApplicable) { currentDisplayMode = 'actual'; }
	vscode.postMessage({ command: 'setViewPreference', metric: currentMetric, split: currentSplit });
	saveWebviewState();
	setActiveMetric(metric);
	setActiveSplit(currentSplit);
	updateSplitButtonStates();
	const rollingBtnEl = document.getElementById('view-rolling');
	if (rollingBtnEl) {
		rollingBtnEl.classList.toggle('hidden', !rollingApplicable);
		rollingBtnEl.classList.toggle('active', rollingApplicable && currentDisplayMode === 'rolling');
	}
	updateSummaryCards(data);
	if (!chart) { return; }
	const canvas = chart.canvas as HTMLCanvasElement | null;
	chart.destroy();
	if (!canvas) { return; }
	const ctx = canvas.getContext('2d');
	if (!ctx) { return; }
	await loadChartModule();
	if (!Chart) { return; }
	chart = new Chart(ctx, createConfig(data));
}

function isSplitSupported(metric: typeof currentMetric, split: typeof currentSplit): boolean {
	return (metric === 'cost' && split === 'total') ||
		(metric === 'output' && split !== 'model') ||
		(metric === 'tokens' && split !== 'language');
}

async function reinitChart(data: InitialChartData): Promise<void> {
	if (!chart) { return; }
	const canvas = chart.canvas as HTMLCanvasElement | null;
	chart.destroy();
	if (!canvas) { return; }
	const ctx = canvas.getContext('2d');
	if (!ctx) { return; }
	await loadChartModule();
	if (!Chart) { return; }
	chart = new Chart(ctx, createConfig(data));
}

async function switchSplit(split: typeof currentSplit, data: InitialChartData): Promise<void> {
	if (currentSplit === split) { return; }
	if (!isSplitSupported(currentMetric, split)) { return; }
	currentSplit = split;
	const rollingApplicable = split === 'total' && currentMetric !== 'output';
	if (!rollingApplicable) { currentDisplayMode = 'actual'; }
	vscode.postMessage({ command: 'setViewPreference', metric: currentMetric, split: currentSplit });
	saveWebviewState();
	setActiveSplit(split);
	const rollingBtnEl = document.getElementById('view-rolling');
	if (rollingBtnEl) {
		rollingBtnEl.classList.toggle('hidden', !rollingApplicable);
		rollingBtnEl.classList.toggle('active', rollingApplicable && currentDisplayMode === 'rolling');
	}
	updateSummaryCards(data);
	await reinitChart(data);
}

function setActivePeriod(period: ChartPeriod): void {
	(['period-day', 'period-week', 'period-month'] as const).forEach(id => {
		const btn = document.getElementById(id);
		if (!btn) { return; }
		btn.classList.toggle('active', id === `period-${period}`);
	});
}

function setActiveMetric(metric: typeof currentMetric): void {
	(['metric-tokens', 'metric-output', 'metric-cost'] as const).forEach(id => {
		const btn = document.getElementById(id);
		if (!btn) { return; }
		btn.classList.toggle('active', id === `metric-${metric}`);
	});
}

function setActiveSplit(split: typeof currentSplit): void {
	(['split-total', 'split-model', 'split-editor', 'split-repository', 'split-language'] as const).forEach(id => {
		const btn = document.getElementById(id);
		if (!btn) { return; }
		btn.classList.toggle('active', id === `split-${split}`);
	});
}

function updateSplitButtonStates(): void {
	const splits: Array<{ id: string; split: string }> = [
		{ id: 'split-total',      split: 'total'      },
		{ id: 'split-model',      split: 'model'      },
		{ id: 'split-editor',     split: 'editor'     },
		{ id: 'split-repository', split: 'repository' },
		{ id: 'split-language',   split: 'language'   },
	];
	splits.forEach(({ id, split }) => {
		const btn = document.getElementById(id) as HTMLButtonElement | null;
		if (!btn) { return; }
		const supported = (currentMetric === 'cost' && split === 'total') ||
			(currentMetric === 'output' && split !== 'model') ||
			(currentMetric === 'tokens' && split !== 'language');
		btn.disabled = !supported;
		btn.classList.toggle('disabled', !supported);
		btn.title = supported ? '' : `Not available for ${currentMetric} metric`;
	});
}

function setActiveDisplayMode(mode: DisplayMode): void {
	const btn = document.getElementById('view-rolling');
	if (!btn) { return; }
	btn.classList.toggle('active', mode === 'rolling');
}

async function switchDisplayMode(data: InitialChartData): Promise<void> {
	currentDisplayMode = currentDisplayMode === 'actual' ? 'rolling' : 'actual';
	setActiveDisplayMode(currentDisplayMode);
	saveWebviewState();
	updateSummaryCards(data);
	if (!chart) { return; }
	const canvas = chart.canvas as HTMLCanvasElement | null;
	chart.destroy();
	if (!canvas) { return; }
	const ctx = canvas.getContext('2d');
	if (!ctx) { return; }
	await loadChartModule();
	if (!Chart) { return; }
	chart = new Chart(ctx, createConfig(data));
}

const PROJECTION_LABELS: Record<ChartPeriod, string> = {
	day: '📈 Projected (today)', week: '📈 Projected (this week)', month: '📈 Projected (this month)',
};

type ChartColors = { textColor: string; gridColor: string; borderColor: string; bgColor: string };

function getChartColors(): ChartColors {
	const s = getComputedStyle(document.body);
	return {
		textColor: s.getPropertyValue('--text-primary') || '#e0e0e0',
		gridColor: 'rgba(128, 128, 128, 0.15)',
		borderColor: s.getPropertyValue('--border-subtle') || '#3a3a40',
		bgColor: s.getPropertyValue('--bg-tertiary') || '#1e1e1e',
	};
}

function buildBaseOptions(c: ChartColors) {
	return {
		responsive: true, maintainAspectRatio: false,
		interaction: { mode: 'index' as const, intersect: false },
		plugins: {
			legend: { position: 'top' as const, labels: { color: c.textColor, font: { size: 12 } } },
			tooltip: { backgroundColor: c.bgColor, titleColor: c.textColor, bodyColor: c.textColor, borderColor: c.borderColor, borderWidth: 1, padding: 10, displayColors: true }
		},
		scales: { x: { grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 } } } } as const
	};
}

function buildTotalViewConfig(period: ChartPeriodData, baseOptions: ReturnType<typeof buildBaseOptions>, c: ChartColors): ChartConfig {
	const isRolling = currentDisplayMode === 'rolling';
	const tokenData = isRolling ? computeRollingAverage(period.tokensData, ROLLING_WINDOW[currentPeriod]) : period.tokensData;
	const lastIdx = period.tokensData.length - 1;
	const projExtra = !isRolling && lastIdx >= 0 ? computeProjectionExtra(period.tokensData[lastIdx], getCurrentPeriodFraction(currentPeriod)) : null;
	const projDs = projExtra !== null ? [{ label: PROJECTION_LABELS[currentPeriod], data: period.tokensData.map((_: number, i: number) => i === lastIdx ? Math.round(projExtra) : 0), backgroundColor: 'rgba(54, 162, 235, 0.2)', borderColor: 'rgba(54, 162, 235, 0.5)', borderWidth: 1, yAxisID: 'y' }] : [];
	const rollingLabel = getRollingLabel();
	return {
		type: 'bar' as const,
		data: { labels: period.labels, datasets: [
			{ label: isRolling ? rollingLabel : 'Tokens', data: tokenData, backgroundColor: isRolling ? 'rgba(54, 162, 235, 0.15)' : 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: isRolling ? 2 : 1, type: isRolling ? 'line' as const : undefined, tension: isRolling ? 0.4 : undefined, fill: isRolling ? false : undefined, yAxisID: 'y' },
			...projDs,
			{ label: 'Sessions', data: period.sessionsData, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1, type: 'line' as const, yAxisID: 'y1' }
		] },
		options: { ...baseOptions, scales: {
			x: { stacked: true, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 } } },
			y: { stacked: true, type: 'linear' as const, display: true, position: 'left' as const, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 }, callback: (value: any) => Number(value).toLocaleString() }, title: { display: true, text: 'Tokens', color: c.textColor, font: { size: 12, weight: 'bold' } } },
			y1: { type: 'linear' as const, display: true, position: 'right' as const, grid: { drawOnChartArea: false }, ticks: { color: c.textColor, font: { size: 11 } }, title: { display: true, text: 'Sessions', color: c.textColor, font: { size: 12, weight: 'bold' } } }
		} }
	};
}

function buildCostViewConfig(period: ChartPeriodData, baseOptions: ReturnType<typeof buildBaseOptions>, c: ChartColors): ChartConfig {
	const isRolling = currentDisplayMode === 'rolling';
	const costData = isRolling ? computeRollingAverage(period.costData, ROLLING_WINDOW[currentPeriod]) : period.costData;
	const lastIdx = period.costData.length - 1;
	const projExtra = !isRolling && lastIdx >= 0 ? computeProjectionExtra(period.costData[lastIdx], getCurrentPeriodFraction(currentPeriod)) : null;
	const projDs = projExtra !== null ? [{ label: PROJECTION_LABELS[currentPeriod], data: period.costData.map((_: number, i: number) => i === lastIdx ? projExtra : 0), backgroundColor: 'rgba(34, 197, 94, 0.2)', borderColor: 'rgba(34, 197, 94, 0.5)', borderWidth: 1, yAxisID: 'y' }] : [];
	const rollingLabel = getRollingLabel();
	return {
		type: 'bar' as const,
		data: { labels: period.labels, datasets: [
			{ label: isRolling ? `${rollingLabel} (UBB)` : 'Est. Cost (UBB)', data: costData, backgroundColor: isRolling ? 'rgba(34, 197, 94, 0.15)' : 'rgba(34, 197, 94, 0.6)', borderColor: 'rgba(34, 197, 94, 1)', borderWidth: isRolling ? 2 : 1, type: isRolling ? 'line' as const : undefined, tension: isRolling ? 0.4 : undefined, fill: isRolling ? false : undefined, yAxisID: 'y' },
			...projDs
		] },
		options: { ...baseOptions, plugins: { ...baseOptions.plugins, tooltip: { ...baseOptions.plugins.tooltip, callbacks: { label: (ctx: any) => ` $${Number(ctx.parsed.y).toFixed(4)}` } } },
			scales: { x: { stacked: true, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 } } }, y: { stacked: true, type: 'linear' as const, display: true, position: 'left' as const, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 }, callback: (value: any) => `$${Number(value).toFixed(2)}` }, title: { display: true, text: 'Estimated Cost (UBB)', color: c.textColor, font: { size: 12, weight: 'bold' as const } } } }
		}
	};
}

function buildOutputViewConfig(view: string, period: ChartPeriodData, baseOptions: ReturnType<typeof buildBaseOptions>, c: ChartColors): ChartConfig {
	const locDatasets = view === 'output-language' ? (period.languageDatasets ?? []) : view === 'output-editor' ? (period.locEditorDatasets ?? []) : view === 'output-repository' ? (period.locRepositoryDatasets ?? []) :
		[{ label: 'Lines Added', data: period.linesAddedData ?? [], backgroundColor: 'rgba(75, 192, 192, 0.6)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1 },
		 { label: 'Lines Removed', data: (period.linesRemovedData ?? []).map((v: number) => -v), backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 }];
	const stacked = view === 'output-total';
	return {
		type: 'bar' as const, data: { labels: period.labels, datasets: locDatasets as any },
		options: { ...baseOptions, plugins: { ...baseOptions.plugins, legend: { position: 'top' as const, labels: { color: c.textColor, font: { size: 11 } } }, tooltip: { ...baseOptions.plugins.tooltip, callbacks: { label: (ctx: any) => ` ${Math.abs(Number(ctx.parsed.y)).toLocaleString()} lines` } } },
			scales: { x: { stacked, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 } } }, y: { stacked, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 }, callback: (value: any) => Math.abs(Number(value)).toLocaleString() }, title: { display: true, text: 'Lines of Code', color: c.textColor, font: { size: 12, weight: 'bold' } } } }
		}
	};
}

function buildStackedViewConfig(view: string, period: ChartPeriodData, baseOptions: ReturnType<typeof buildBaseOptions>, c: ChartColors): ChartConfig {
	const datasets = view === 'model' ? period.modelDatasets : view === 'repository' ? period.repositoryDatasets : period.editorDatasets;
	const lastIdx = period.tokensData.length - 1;
	const projExtra = lastIdx >= 0 ? computeProjectionExtra(period.tokensData[lastIdx], getCurrentPeriodFraction(currentPeriod)) : null;
	const projDs = projExtra !== null ? [{ label: PROJECTION_LABELS[currentPeriod], data: period.tokensData.map((_: number, i: number) => i === lastIdx ? Math.round(projExtra) : 0), backgroundColor: 'rgba(200, 200, 200, 0.25)', borderColor: 'rgba(200, 200, 200, 0.5)', borderWidth: 1 }] : [];
	const sessionsDs = { label: 'Sessions', data: period.sessionsData, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 2, type: 'line' as const, yAxisID: 'y1', stack: undefined };
	return {
		type: 'bar' as const, data: { labels: period.labels, datasets: [...datasets, ...projDs, sessionsDs] },
		options: { ...baseOptions, plugins: { ...baseOptions.plugins, legend: { position: 'top' as const, labels: { color: c.textColor, font: { size: 11 } } },
			tooltip: { ...baseOptions.plugins.tooltip, callbacks: { footer: (items: any[]) => {
				if (currentSplit !== 'editor') { return ''; }
				if (items.some(i => i?.dataset?.label === 'JetBrains')) { return 'JetBrains: estimates from user messages + assistant text only.\nActual API counts and thinking tokens are not available.'; }
				if (items.some(i => i?.dataset?.label === 'Antigravity')) { return 'Antigravity: estimates from transcript content.\nActual API counts are not stored locally.'; }
				return '';
			} } } },
			scales: { ...baseOptions.scales, y: { stacked: true, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 }, callback: (value: any) => Number(value).toLocaleString() }, title: { display: true, text: 'Tokens', color: c.textColor, font: { size: 12, weight: 'bold' } } }, x: { stacked: true, grid: { color: c.gridColor }, ticks: { color: c.textColor, font: { size: 11 } } }, y1: { type: 'linear' as const, display: true, position: 'right' as const, grid: { drawOnChartArea: false }, ticks: { color: c.textColor, font: { size: 11 } }, title: { display: true, text: 'Sessions', color: c.textColor, font: { size: 12, weight: 'bold' } } } }
		}
	};
}

function createConfig(data: InitialChartData): ChartConfig {
	const period = getActivePeriodData(data);
	const view = currentMetric === 'tokens'
		? (currentSplit === 'model' ? 'model' : currentSplit === 'editor' ? 'editor' : currentSplit === 'repository' ? 'repository' : 'total')
		: currentMetric === 'cost' ? 'cost' : `output-${currentSplit}`;
	const c = getChartColors();
	const baseOptions = buildBaseOptions(c);
	if (view === 'total') { return buildTotalViewConfig(period, baseOptions, c); }
	if (view === 'cost') { return buildCostViewConfig(period, baseOptions, c); }
	if (view.startsWith('output-')) { return buildOutputViewConfig(view, period, baseOptions, c); }
	return buildStackedViewConfig(view, period, baseOptions, c);
}


type MetricSplit = { metric: typeof currentMetric; split: typeof currentSplit };

function migrateViewKey(view: string): MetricSplit {
	const map: Record<string, MetricSplit> = {
		total: { metric: 'tokens', split: 'total' }, model: { metric: 'tokens', split: 'model' },
		editor: { metric: 'tokens', split: 'editor' }, repository: { metric: 'tokens', split: 'repository' },
		cost: { metric: 'cost', split: 'total' },
	};
	return map[view] ?? { metric: 'tokens', split: 'total' };
}

function restoreChartState(initialData: InitialChartData): void {
	const saved = chartState.restore();
	if (!vscode.getState()) {
		if (initialData.initialPeriod) { currentPeriod = initialData.initialPeriod; }
		if (initialData.initialMetric) { currentMetric = initialData.initialMetric; }
		if (initialData.initialSplit) { currentSplit = initialData.initialSplit; }
		else if (initialData.initialView) {
			const m = migrateViewKey(initialData.initialView);
			currentMetric = m.metric; currentSplit = m.split;
		}
		return;
	}
	currentPeriod = saved.period;
	currentDisplayMode = saved.displayMode;
	if (saved.view && !saved.metric) {
		const m = migrateViewKey(saved.view);
		currentMetric = m.metric; currentSplit = m.split;
	} else {
		currentMetric = saved.metric ?? 'tokens';
		currentSplit = saved.split ?? 'total';
	}
}

async function bootstrap(): Promise<void> {
	const { provideVSCodeDesignSystem, vsCodeButton } = await import('@vscode/webview-ui-toolkit');
	provideVSCodeDesignSystem().register(vsCodeButton());

	if (!initialData) {
		const root = document.getElementById('root');
		if (root) { root.textContent = 'No data available.'; }
		return;
	}

	restoreChartState(initialData);
	renderLayout(initialData);
}

void bootstrap();

// Listen for background data updates from the extension
registerMessageHandler((message) => {
	if (message.command === 'updateChartData') {
		// Save current toggles for restoration after chart re-initializes
		pendingMetric = currentMetric;
		pendingSplit = currentSplit;
		pendingPeriod = currentPeriod;
		renderLayout(message.data as InitialChartData);
	}
});

