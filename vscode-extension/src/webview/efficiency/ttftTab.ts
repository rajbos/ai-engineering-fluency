// The Efficiency view's TTFT tab: average time to first token per model over time, read from
// VS Code Copilot Chat's debug log. The host scans on request (`analyzeTtft` → `ttftResult`), so
// the tab stays lazy. The last result is kept here because the view rebuilds its whole DOM on
// every tab switch.
import { getModelColor } from '../../../../src/chartDataBuilder';
import { getModelDisplayName } from '../../../../src/webview/shared/modelUtils';
import { renderDataTable, setDataTableState } from '../shared/dataTable';
import { setHtml } from '../shared/domUtils';
import { escapeHtml } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';

export type TtftGranularity = 'day' | 'week' | 'month';
export type TtftScanRange = '14d' | '30d' | '90d' | '180d' | '365d' | 'all';
export interface TtftSelection { granularity: TtftGranularity; scanRange: TtftScanRange }

type TtftBucketView = { key: string; label: string; avgSeconds: number; count: number };
type TtftModelSeriesView = { model: string; data: (number | null)[] };
type TtftResult = { buckets: TtftBucketView[]; series: TtftModelSeriesView[]; sampleCount: number; fileCount: number };

export type TtftResultMessage = Partial<TtftSelection> & {
	buckets?: TtftBucketView[];
	series?: TtftModelSeriesView[];
	sampleCount?: number;
	fileCount?: number;
};

const TTFT_GRANULARITY_LABELS: Record<TtftGranularity, string> = {
	day: 'efficiency.ttft.granularity.day',
	week: 'efficiency.ttft.granularity.week',
	month: 'efficiency.ttft.granularity.month',
};
const TTFT_SCAN_RANGE_LABELS: Record<TtftScanRange, string> = {
	'14d': 'efficiency.ttft.range.14d',
	'30d': 'efficiency.ttft.range.30d',
	'90d': 'efficiency.ttft.range.90d',
	'180d': 'efficiency.ttft.range.180d',
	'365d': 'efficiency.ttft.range.365d',
	'all': 'efficiency.ttft.range.all',
};

const TTFT_CHART_WIDTH = 760;
const TTFT_CHART_HEIGHT = 220;
const TTFT_CHART_PAD_LEFT = 48;
const TTFT_CHART_PAD_RIGHT = 32;
const TTFT_CHART_PAD_TOP = 12;
const TTFT_CHART_PAD_BOTTOM = 28;

const TTFT_BUCKET_TABLE_ID = 'efficiency-ttft-buckets';

let selection: TtftSelection = { granularity: 'day', scanRange: '14d' };
let result: TtftResult | null = null;
/** The selection `result` was computed for; a result for any other selection is not shown. */
let resultFor: TtftSelection | null = null;
/** The selection already asked of the host, so a tab re-render does not scan twice. */
let requested: TtftSelection | null = null;
const hiddenModels = new Set<string>();

function sameSelection(a: TtftSelection | null, b: TtftSelection): boolean {
	return !!a && a.granularity === b.granularity && a.scanRange === b.scanRange;
}

function isGranularity(value: unknown): value is TtftGranularity {
	return typeof value === 'string' && Object.hasOwn(TTFT_GRANULARITY_LABELS, value);
}

function isScanRange(value: unknown): value is TtftScanRange {
	return typeof value === 'string' && Object.hasOwn(TTFT_SCAN_RANGE_LABELS, value);
}

/** Applies a persisted selection, ignoring values this version does not know. */
export function restoreTtftSelection(saved: Partial<TtftSelection> | undefined): void {
	if (isGranularity(saved?.granularity)) { selection = { ...selection, granularity: saved.granularity }; }
	if (isScanRange(saved?.scanRange)) { selection = { ...selection, scanRange: saved.scanRange }; }
}

export function currentTtftSelection(): TtftSelection {
	return selection;
}

/** Values arrive already normalized to seconds (see extractTtftSamplesFromDebugLog); this only picks the more readable unit for display. */
function formatTtftSeconds(seconds: number): string {
	return seconds >= 10 ? `${seconds.toFixed(1)}s` : `${Math.round(seconds * 1000)}ms`;
}

function renderSelector<T extends string>(id: string, labelKey: string, labelKeys: Record<T, string>, selected: T): string {
	const options = (Object.keys(labelKeys) as T[])
		.map(value => `<option value="${value}"${value === selected ? ' selected' : ''}>${escapeHtml(localize(labelKeys[value]))}</option>`)
		.join('');
	return `<div class="ttft-selector-row">
		<label for="${id}">${escapeHtml(localize(labelKey))}</label>
		<select id="${id}" class="ttft-select">${options}</select>
	</div>`;
}

/** Renders one SVG line chart with one path per model series, breaking the line across buckets where a model has no samples (null) rather than interpolating over the gap. */
function renderTtftChartSvg(buckets: TtftBucketView[], series: TtftModelSeriesView[]): string {
	if (buckets.length === 0 || series.length === 0) { return ''; }
	const innerW = TTFT_CHART_WIDTH - TTFT_CHART_PAD_LEFT - TTFT_CHART_PAD_RIGHT;
	const innerH = TTFT_CHART_HEIGHT - TTFT_CHART_PAD_TOP - TTFT_CHART_PAD_BOTTOM;
	const allValues = series.flatMap(s => s.data.filter((v): v is number => v !== null));
	const maxValue = allValues.length > 0 ? Math.max(...allValues) : 1;
	const yMax = (maxValue || 1) * 1.15;
	const xStep = buckets.length > 1 ? innerW / (buckets.length - 1) : 0;
	const xAt = (i: number) => TTFT_CHART_PAD_LEFT + i * xStep;
	const yAt = (v: number) => TTFT_CHART_PAD_TOP + innerH - (v / yMax) * innerH;

	const yTicks = [0, 0.25, 0.5, 0.75, 1].map(f => {
		const value = yMax * f;
		const y = yAt(value);
		return `<line x1="${TTFT_CHART_PAD_LEFT}" y1="${y.toFixed(1)}" x2="${TTFT_CHART_WIDTH - TTFT_CHART_PAD_RIGHT}" y2="${y.toFixed(1)}" class="ttft-gridline" />
<text x="${TTFT_CHART_PAD_LEFT - 6}" y="${(y + 3).toFixed(1)}" class="ttft-axis-label" text-anchor="end">${escapeHtml(formatTtftSeconds(value))}</text>`;
	}).join('');

	// Thin out x-axis labels so they don't overlap when there are many buckets. The first/last
	// labels are anchored inward (start/end instead of middle) so they render within the
	// viewBox instead of overflowing past its edges and getting clipped.
	const labelEvery = Math.max(1, Math.ceil(buckets.length / 8));
	const xLabels = buckets.map((b, i) => {
		if (i % labelEvery !== 0 && i !== buckets.length - 1) { return ''; }
		const anchor = i === buckets.length - 1 ? 'end' : i === 0 ? 'start' : 'middle';
		return `<text x="${xAt(i).toFixed(1)}" y="${TTFT_CHART_HEIGHT - 8}" class="ttft-axis-label" text-anchor="${anchor}">${escapeHtml(b.label)}</text>`;
	}).join('');

	const paths = series.map((s, idx) => {
		const color = getModelColor(idx);
		let d = '';
		let drawing = false;
		s.data.forEach((v, i) => {
			if (v === null) { drawing = false; return; }
			const x = xAt(i).toFixed(1);
			const y = yAt(v).toFixed(1);
			d += drawing ? ` L ${x} ${y}` : `${d ? ' ' : ''}M ${x} ${y}`;
			drawing = true;
		});
		const dots = s.data.map((v, i) => v === null ? '' : `<circle cx="${xAt(i).toFixed(1)}" cy="${yAt(v).toFixed(1)}" r="2.5" fill="${color.border}" />`).join('');
		const hidden = hiddenModels.has(s.model) ? ' ttft-hidden' : '';
		return `<g class="ttft-series${hidden}" data-model="${escapeHtml(s.model)}"><path d="${d}" fill="none" stroke="${color.border}" stroke-width="2" />${dots}</g>`;
	}).join('');

	const legend = series.map((s, idx) => {
		const color = getModelColor(idx);
		const name = escapeHtml(getModelDisplayName(s.model));
		const isHidden = hiddenModels.has(s.model);
		return `<span class="ttft-legend-item${isHidden ? ' ttft-hidden' : ''}" data-model="${escapeHtml(s.model)}" role="button" tabindex="0" aria-pressed="${isHidden}" title="${escapeHtml(localizeFormat('efficiency.ttft.legend.toggle', getModelDisplayName(s.model)))}"><span class="ttft-legend-swatch" style="background:${color.border}"></span>${name}</span>`;
	}).join('');

	return `<div class="ttft-chart-wrap">
<svg viewBox="0 0 ${TTFT_CHART_WIDTH} ${TTFT_CHART_HEIGHT}" class="ttft-chart" role="img" aria-label="${escapeHtml(localize('efficiency.ttft.chart.label'))}">
${yTicks}
${xLabels}
${paths}
</svg>
<div class="ttft-legend">${legend}</div>
</div>`;
}

/** Newest bucket first. */
function renderTtftBucketTable(buckets: TtftBucketView[]): string {
	return renderDataTable({
		tableId: TTFT_BUCKET_TABLE_ID,
		ariaLabel: localize('efficiency.ttft.table.label'),
		rows: buckets.slice().reverse(),
		columns: [
			{ id: 'bucket', label: localize(TTFT_GRANULARITY_LABELS[selection.granularity]), sortValue: (b) => b.key, render: (b) => b.label },
			{ id: 'avg', label: localize('efficiency.ttft.col.avg'), align: 'right', sortValue: (b) => b.avgSeconds, render: (b) => formatTtftSeconds(b.avgSeconds) },
			{ id: 'samples', label: localize('efficiency.ttft.col.samples'), align: 'right', sortValue: (b) => b.count, render: (b) => b.count.toLocaleString() },
		],
	});
}

function renderTtftStat(labelKey: string, value: string): string {
	return `<div class="attr-stat"><div class="stat-label">${escapeHtml(localize(labelKey))}</div><div class="stat-value">${escapeHtml(value)}</div></div>`;
}

function renderTtftResults(r: TtftResult): string {
	if (r.sampleCount === 0) {
		return `<div class="ttft-notice">
			<h3>${escapeHtml(localize('efficiency.ttft.empty.title'))}</h3>
			<p>${escapeHtml(localizeFormat('efficiency.ttft.empty.body', r.fileCount.toLocaleString()))}</p>
		</div>`;
	}
	const overallAvg = r.buckets.reduce((sum, b) => sum + b.avgSeconds * b.count, 0) / Math.max(1, r.sampleCount);
	return `<div class="attr-summary">
		${renderTtftStat('efficiency.ttft.stat.avg', formatTtftSeconds(overallAvg))}
		${renderTtftStat('efficiency.ttft.stat.models', String(r.series.length))}
		${renderTtftStat('efficiency.ttft.stat.samples', r.sampleCount.toLocaleString())}
		${renderTtftStat('efficiency.ttft.stat.files', r.fileCount.toLocaleString())}
	</div>
	${renderTtftChartSvg(r.buckets, r.series)}
	<div class="ttft-table-wrap">${renderTtftBucketTable(r.buckets)}</div>`;
}

function renderTtftLoading(): string {
	return `<div class="ttft-loading"><span class="ttft-spinner" aria-hidden="true"></span><span>${escapeHtml(localize('efficiency.ttft.loading'))}</span></div>`;
}

function renderTtftResultsArea(): string {
	return result && sameSelection(resultFor, selection) ? renderTtftResults(result) : renderTtftLoading();
}

export function renderTtftTab(): string {
	return `
		<p class="eff-section-note">${escapeHtml(localize('efficiency.ttft.note'))}</p>
		${renderSelector('ttft-granularity', 'efficiency.ttft.bucketBy', TTFT_GRANULARITY_LABELS, selection.granularity)}
		${renderSelector('ttft-scan-range', 'efficiency.ttft.scanFrom', TTFT_SCAN_RANGE_LABELS, selection.scanRange)}
		<div id="ttft-results">${renderTtftResultsArea()}</div>`;
}

function requestIfNeeded(requestScan: (selection: TtftSelection) => void): void {
	if (sameSelection(resultFor, selection) || sameSelection(requested, selection)) { return; }
	requested = selection;
	requestScan(selection);
}

function toggleModel(item: HTMLElement): void {
	const model = item.dataset.model;
	if (!model) { return; }
	const hidden = item.classList.toggle('ttft-hidden');
	item.setAttribute('aria-pressed', String(hidden));
	if (hidden) { hiddenModels.add(model); } else { hiddenModels.delete(model); }
	document.querySelectorAll<HTMLElement>('.ttft-series').forEach((el) => {
		if (el.dataset.model === model) { el.classList.toggle('ttft-hidden', hidden); }
	});
}

/** Wires a freshly rendered tab and asks the host for the current selection if nothing has yet. */
export function wireTtftTab(requestScan: (selection: TtftSelection) => void, persist: () => void): void {
	const apply = (next: TtftSelection): void => {
		selection = next;
		persist();
		setDataTableState(TTFT_BUCKET_TABLE_ID, { page: 1 });
		setHtml(document.getElementById('ttft-results'), renderTtftResultsArea());
		requestIfNeeded(requestScan);
	};
	document.getElementById('ttft-granularity')?.addEventListener('change', (e) => {
		const value = (e.target as HTMLSelectElement).value;
		if (isGranularity(value)) { apply({ ...selection, granularity: value }); }
	});
	document.getElementById('ttft-scan-range')?.addEventListener('change', (e) => {
		const value = (e.target as HTMLSelectElement).value;
		if (isScanRange(value)) { apply({ ...selection, scanRange: value }); }
	});
	const resultsDiv = document.getElementById('ttft-results');
	resultsDiv?.addEventListener('click', (e) => {
		const item = (e.target as HTMLElement)?.closest<HTMLElement>('.ttft-legend-item');
		if (item) { toggleModel(item); }
	});
	resultsDiv?.addEventListener('keydown', (e) => {
		if (e.key !== 'Enter' && e.key !== ' ') { return; }
		const item = (e.target as HTMLElement)?.closest<HTMLElement>('.ttft-legend-item');
		if (item) { e.preventDefault(); toggleModel(item); }
	});
	requestIfNeeded(requestScan);
}

/** Takes the host's answer. One for a selection the user has since moved away from is dropped; its replacement is already on the way. */
export function handleTtftResult(message: TtftResultMessage): void {
	if (!isGranularity(message.granularity) || !isScanRange(message.scanRange)) { return; }
	const answered: TtftSelection = { granularity: message.granularity, scanRange: message.scanRange };
	if (!sameSelection(answered, selection)) { return; }
	result = {
		buckets: message.buckets ?? [],
		series: message.series ?? [],
		sampleCount: Number(message.sampleCount ?? 0),
		fileCount: Number(message.fileCount ?? 0),
	};
	resultFor = answered;
	requested = null;
	setHtml(document.getElementById('ttft-results'), renderTtftResultsArea());
}
