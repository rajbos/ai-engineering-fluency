import type { ChartPeriodData, ChartTimeWindow } from '../../../../src/types';
import { getTimeWindowStartDayKey, getTimeWindowStartMonthKey } from '../../../../src/timeWindows';
import type { ChartPeriod } from './projectionUtils';

/**
 * Slice a per-bar numeric series, reading gaps as zero. The legacy payload path sends
 * `costData: []`, and an `undefined` entry would turn every total built from it into NaN.
 */
function sliceNumbersByIndices(arr: number[] | undefined, indices: number[]): number[] | undefined {
	if (!arr) { return undefined; }
	return indices.map(i => arr[i] ?? 0);
}

function sliceDatasetsByIndices(datasets: object[] | undefined, indices: number[]): object[] | undefined {
	if (!datasets) { return undefined; }
	return datasets.map(ds => {
		const d = ds as { data: number[] };
		return { ...d, data: indices.map(i => d.data[i]) };
	});
}

function getFilterStartKey(timeWindow: ChartTimeWindow, periodType: ChartPeriod, now: Date): string {
	return periodType === 'month'
		? getTimeWindowStartMonthKey(timeWindow, now)
		: getTimeWindowStartDayKey(timeWindow, now);
}

function buildCoreFilteredPeriod(period: ChartPeriodData, indices: number[]): ChartPeriodData {
	const totalTokens = indices.reduce((sum, i) => sum + period.tokensData[i], 0);
	const totalSessions = indices.reduce((sum, i) => sum + period.sessionsData[i], 0);
	const costData = sliceNumbersByIndices(period.costData, indices) ?? [];
	const totalCost = costData.reduce((a, b) => a + b, 0);
	return {
		labels: indices.map(i => period.labels[i]),
		periodKeys: indices.map(i => period.periodKeys[i]),
		tokensData: indices.map(i => period.tokensData[i]),
		sessionsData: indices.map(i => period.sessionsData[i]),
		modelDatasets: sliceDatasetsByIndices(period.modelDatasets, indices) as object[],
		editorDatasets: sliceDatasetsByIndices(period.editorDatasets, indices) as object[],
		repositoryDatasets: sliceDatasetsByIndices(period.repositoryDatasets, indices) as object[],
		periodCount: indices.length,
		totalTokens,
		totalSessions,
		avgPerPeriod: indices.length > 0 ? Math.round(totalTokens / indices.length) : 0,
		costData,
		totalCost,
		avgCostPerPeriod: indices.length > 0 ? totalCost / indices.length : 0,
	};
}

function copyFilteredLocFields(source: ChartPeriodData, target: ChartPeriodData, indices: number[]): void {
	const locData = sliceNumbersByIndices(source.locData, indices);
	const linesAddedData = sliceNumbersByIndices(source.linesAddedData, indices);
	const linesRemovedData = sliceNumbersByIndices(source.linesRemovedData, indices);

	if (locData) { target.locData = locData; }
	if (linesAddedData) { target.linesAddedData = linesAddedData; }
	if (linesRemovedData) { target.linesRemovedData = linesRemovedData; }
	if (source.totalLinesAdded !== undefined) { target.totalLinesAdded = (linesAddedData ?? []).reduce((a, b) => a + b, 0); }
	if (source.totalLinesRemoved !== undefined) { target.totalLinesRemoved = (linesRemovedData ?? []).reduce((a, b) => a + b, 0); }
	if (source.avgLocPerPeriod !== undefined) {
		target.avgLocPerPeriod = locData && locData.length > 0 ? locData.reduce((a, b) => a + b, 0) / locData.length : 0;
	}
}

/**
 * Every optional per-bar dataset array on a period. Each one is index-aligned with
 * `labels`, so any field missing here keeps its full-history length after filtering and
 * plots against the wrong dates.
 */
const OPTIONAL_DATASET_FIELDS = [
	'languageDatasets',
	'locEditorDatasets',
	'locRepositoryDatasets',
	'editorCostDatasets',
	'billingGroupCostDatasets',
	'modelCostDatasets',
	'modelSessionsDatasets',
	'editorSessionsDatasets',
	'providerSessionsDatasets',
	'providerTokensDatasets',
	'taskCategoryDatasets',
	'taskCategoryTokenDatasets',
	'taskCategorySessionDatasets',
	'taskCategoryCostDatasets',
] as const satisfies ReadonlyArray<keyof ChartPeriodData>;

function copyFilteredDatasetFields(source: ChartPeriodData, target: ChartPeriodData, indices: number[]): void {
	for (const key of OPTIONAL_DATASET_FIELDS) {
		const ds = source[key];
		if (ds) { target[key] = sliceDatasetsByIndices(ds, indices); }
	}
}

/**
 * Restrict a chart period to the bars that fall inside the selected time window.
 *
 * The host sends every period (including `day`) back to the earliest recorded session so
 * "All time" can show the full history, so every window — including the default
 * "Last 30 days" — has to be filtered here rather than assumed to match the payload.
 */
export function filterPeriodByTimeWindow(period: ChartPeriodData, timeWindow: ChartTimeWindow, periodType: ChartPeriod, now: Date = new Date()): ChartPeriodData {
	const startKey = getFilterStartKey(timeWindow, periodType, now);
	const indices: number[] = [];
	for (let i = 0; i < period.periodKeys.length; i++) {
		if (period.periodKeys[i] >= startKey) { indices.push(i); }
	}
	if (indices.length === 0) { return period; }

	const filtered = buildCoreFilteredPeriod(period, indices);
	copyFilteredLocFields(period, filtered, indices);
	copyFilteredDatasetFields(period, filtered, indices);
	return filtered;
}
