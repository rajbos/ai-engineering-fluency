import test from 'node:test';
import * as assert from 'node:assert/strict';

import type { ChartDataset, ChartPeriodData } from '../../../src/types';
import {
	fallbackSplitForEditorFilter,
	filterPeriodByEditor,
	isSplitAvailableForEditorFilter,
	resolveEditorFilter,
} from '../../src/webview/chart/editorFilter';
import { filterPeriodByTimeWindow } from '../../src/webview/chart/timeWindowFilter';

const NOW = new Date(2026, 8, 24, 15, 0, 0);

function ds(label: string, data: number[]): ChartDataset {
	return { label, data, backgroundColor: '#000', borderColor: '#000', borderWidth: 1 };
}

function buildPeriod(): ChartPeriodData {
	const keys = ['2026-09-22', '2026-09-23', '2026-09-24'];
	return {
		labels: [...keys],
		periodKeys: keys,
		tokensData: [30, 60, 90],
		sessionsData: [3, 6, 9],
		modelDatasets: [ds('gpt', [30, 60, 90])],
		editorDatasets: [ds('VS Code', [10, 20, 30]), ds('Claude Code', [20, 40, 60])],
		repositoryDatasets: [ds('repo', [30, 60, 90])],
		periodCount: 3,
		totalTokens: 180,
		totalSessions: 18,
		avgPerPeriod: 60,
		costData: [3, 6, 9],
		totalCost: 18,
		avgCostPerPeriod: 6,
		linesAddedData: [4, 5, 6],
		linesRemovedData: [1, 1, 1],
		locData: [5, 6, 7],
		totalLinesAdded: 15,
		totalLinesRemoved: 3,
		avgLocPerPeriod: 6,
		editorSessionsDatasets: [ds('VS Code', [1, 2, 3]), ds('Claude Code', [2, 4, 6])],
		editorCostDatasets: [ds('VS Code', [1, 2, 3]), ds('Claude Code', [2, 4, 6])],
		locEditorDatasets: [ds('VS Code', [2, 2, 2]), ds('Claude Code', [3, 4, 5])],
		taskCategoryDatasets: [ds('Coding', [30, 60, 90])],
	};
}

test('filterPeriodByEditor: totals come from the selected editor only', () => {
	const filtered = filterPeriodByEditor(buildPeriod(), 'VS Code');
	assert.deepEqual(filtered.tokensData, [10, 20, 30]);
	assert.deepEqual(filtered.sessionsData, [1, 2, 3]);
	assert.deepEqual(filtered.costData, [1, 2, 3]);
	assert.equal(filtered.totalTokens, 60);
	assert.equal(filtered.totalSessions, 6);
	assert.equal(filtered.totalCost, 6);
	assert.equal(filtered.avgPerPeriod, 20);
	assert.equal(filtered.avgCostPerPeriod, 2);
});

test('filterPeriodByEditor: keeps only the selected editor in the editor datasets', () => {
	const filtered = filterPeriodByEditor(buildPeriod(), 'Claude Code');
	for (const key of ['editorDatasets', 'editorSessionsDatasets', 'editorCostDatasets', 'locEditorDatasets'] as const) {
		assert.deepEqual((filtered[key] ?? []).map(d => d.label), ['Claude Code'], key);
	}
});

test('filterPeriodByEditor: breakdowns without per-editor data are emptied, not left unfiltered', () => {
	const filtered = filterPeriodByEditor(buildPeriod(), 'VS Code');
	assert.deepEqual(filtered.modelDatasets, []);
	assert.deepEqual(filtered.repositoryDatasets, []);
	assert.deepEqual(filtered.taskCategoryDatasets, []);
});

test('filterPeriodByEditor: lines of code read as one per-editor lines series', () => {
	const filtered = filterPeriodByEditor(buildPeriod(), 'Claude Code');
	assert.equal((filtered.totalLinesAdded ?? 0) + (filtered.totalLinesRemoved ?? 0), 12);
	assert.deepEqual(filtered.linesRemovedData, [0, 0, 0]);
});

test('filterPeriodByEditor: an editor with no activity yields zeroed series, not the totals', () => {
	const filtered = filterPeriodByEditor(buildPeriod(), 'Cursor');
	assert.deepEqual(filtered.tokensData, [0, 0, 0]);
	assert.equal(filtered.totalTokens, 0);
	assert.equal(filtered.totalSessions, 0);
	assert.deepEqual(filtered.editorDatasets, []);
});

test('filterPeriodByEditor: does not mutate the source period', () => {
	const period = buildPeriod();
	filterPeriodByEditor(period, 'VS Code');
	assert.deepEqual(period.tokensData, [30, 60, 90]);
	assert.equal(period.editorDatasets.length, 2);
});

test('filterPeriodByEditor then time window: slices the per-editor series together', () => {
	const filtered = filterPeriodByEditor(buildPeriod(), 'VS Code');
	const windowed = filterPeriodByTimeWindow(filtered, 'today', 'day', NOW);
	assert.deepEqual(windowed.tokensData, [30]);
	assert.equal(windowed.totalTokens, 30);
	assert.deepEqual(windowed.editorSessionsDatasets?.[0].data, [3]);
});

test('isSplitAvailableForEditorFilter: only the total and editor views have per-editor data', () => {
	for (const metric of ['tokens', 'cost', 'sessions'] as const) {
		assert.equal(isSplitAvailableForEditorFilter(metric, 'total'), true);
		assert.equal(isSplitAvailableForEditorFilter(metric, 'editor'), true);
		assert.equal(isSplitAvailableForEditorFilter(metric, 'model'), false);
		assert.equal(isSplitAvailableForEditorFilter(metric, 'repository'), false);
	}
	assert.equal(isSplitAvailableForEditorFilter('output', 'total'), false);
	assert.equal(isSplitAvailableForEditorFilter('output', 'editor'), true);
	assert.equal(fallbackSplitForEditorFilter('output'), 'editor');
	assert.equal(fallbackSplitForEditorFilter('tokens'), 'total');
});

test('resolveEditorFilter: drops a saved editor that is no longer in the data', () => {
	assert.equal(resolveEditorFilter('VS Code', { 'VS Code': 1 }), 'VS Code');
	assert.equal(resolveEditorFilter('Cursor', { 'VS Code': 1 }), null);
	assert.equal(resolveEditorFilter(null, { 'VS Code': 1 }), null);
	assert.equal(resolveEditorFilter('__proto__', {}), null);
});
