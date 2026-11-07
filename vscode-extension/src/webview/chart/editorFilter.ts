import type { ChartDataset, ChartPeriodData } from '../../../../src/types';

/** Chart metrics the editor filter has to know about (mirrors `ChartMetric` in main.ts). */
type FilterMetric = 'tokens' | 'output' | 'cost' | 'sessions';

function findDataset(datasets: ChartDataset[] | undefined, editor: string): ChartDataset | undefined {
	return datasets?.find(ds => ds.label === editor);
}

function sum(values: number[]): number {
	return values.reduce((a, b) => a + b, 0);
}

/** Fields no per-editor series exists for; emptied so they can never show every editor's data. */
const UNATTRIBUTED_DATASETS = {
	modelDatasets: [],
	repositoryDatasets: [],
	languageDatasets: [],
	locRepositoryDatasets: [],
	billingGroupCostDatasets: [],
	modelCostDatasets: [],
	modelSessionsDatasets: [],
	providerSessionsDatasets: [],
	providerTokensDatasets: [],
	taskCategoryDatasets: [],
	taskCategoryTokenDatasets: [],
	taskCategorySessionDatasets: [],
	taskCategoryCostDatasets: [],
} satisfies Partial<ChartPeriodData>;

function only(ds: ChartDataset | undefined): ChartDataset[] {
	return ds ? [ds] : [];
}

/** The payload keeps one lines figure per editor (added + removed), so it all reads as "lines". */
function editorLocFields(period: ChartPeriodData, locData: number[], zeros: number[]): Partial<ChartPeriodData> {
	if (!period.linesAddedData && !period.linesRemovedData && !period.locData) { return {}; }
	const total = sum(locData);
	return {
		locData,
		linesAddedData: locData,
		linesRemovedData: zeros,
		totalLinesAdded: total,
		totalLinesRemoved: 0,
		avgLocPerPeriod: period.periodCount > 0 ? total / period.periodCount : 0,
	};
}

/**
 * Restrict a period to one editor, using the per-editor datasets the shared payload builder
 * already emits. Only series that exist per editor can be filtered: totals for tokens, sessions,
 * cost and lines of code. Breakdowns the payload does not attribute to an editor (model,
 * repository, provider, task, language) are emptied rather than left showing every editor's data;
 * `isSplitAvailableForEditorFilter` keeps those splits unreachable while a filter is active.
 *
 * Run this before `filterPeriodByTimeWindow`, which slices every field it is given.
 */
export function filterPeriodByEditor(period: ChartPeriodData, editor: string): ChartPeriodData {
	const tokenDs = findDataset(period.editorDatasets, editor);
	const sessionsDs = findDataset(period.editorSessionsDatasets, editor);
	const costDs = findDataset(period.editorCostDatasets, editor);
	const locDs = findDataset(period.locEditorDatasets, editor);
	const zeros = period.labels.map(() => 0);
	const tokensData = tokenDs?.data ?? zeros;
	const costData = costDs?.data ?? zeros;
	const sessionsData = sessionsDs?.data ?? zeros;
	const totalTokens = sum(tokensData);
	const totalCost = sum(costData);
	const count = period.periodCount;
	return {
		...period,
		...UNATTRIBUTED_DATASETS,
		tokensData,
		sessionsData,
		costData,
		totalTokens,
		totalSessions: sum(sessionsData),
		totalCost,
		avgPerPeriod: count > 0 ? Math.round(totalTokens / count) : 0,
		avgCostPerPeriod: count > 0 ? totalCost / count : 0,
		editorDatasets: only(tokenDs),
		editorSessionsDatasets: only(sessionsDs),
		editorCostDatasets: only(costDs),
		locEditorDatasets: only(locDs),
		...editorLocFields(period, locDs?.data ?? zeros, zeros),
	};
}

/**
 * Whether a metric/split combination still makes sense for a single editor. The total and
 * By Editor views map onto the per-editor datasets; the other splits have no per-editor data.
 * Lines of code only has a per-editor series, so its single-editor view is the editor split.
 */
export function isSplitAvailableForEditorFilter(metric: FilterMetric, split: string): boolean {
	if (metric === 'output') { return split === 'editor'; }
	return split === 'total' || split === 'editor';
}

/** The split to fall back to when the current one is unavailable under an editor filter. */
export function fallbackSplitForEditorFilter(metric: FilterMetric): 'total' | 'editor' {
	return metric === 'output' ? 'editor' : 'total';
}

/** Drops a saved filter that no longer matches an editor in the data. */
export function resolveEditorFilter(saved: string | null | undefined, editorTotals: Record<string, number>): string | null {
	return saved && Object.hasOwn(editorTotals, saved) ? saved : null;
}
