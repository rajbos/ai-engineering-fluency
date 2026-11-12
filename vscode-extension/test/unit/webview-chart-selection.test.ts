import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	getPreferredSplitForMetric,
	isSplitAllowedForMetric,
	migrateViewKey,
	normalizeSplit,
	resolveHostInitialSelection,
	resolveSavedSelection,
	type ChartMetric,
	type ChartSelection,
	type ChartSplit,
} from '../../src/webview/chart/chartSelection';
import {
	buildStackedCostViewConfig,
	formatCostTick,
	formatCostTooltipFooter,
	formatCostTooltipLabel,
} from '../../src/webview/chart/costStackConfig';

const METRICS: ChartMetric[] = ['tokens', 'output', 'cost', 'sessions'];
const SPLITS: ChartSplit[] = ['total', 'model', 'editor', 'repository', 'language', 'provider', 'task', 'taskCategory'];

/** Expected support per metric, as the chart view has always allowed it (raw split, not normalized). */
const ALLOWED: Record<ChartMetric, ChartSplit[]> = {
	tokens: ['total', 'model', 'editor', 'repository', 'task', 'taskCategory'],
	output: ['total', 'editor', 'repository', 'language'],
	cost: ['total', 'model', 'editor', 'provider', 'task'],
	sessions: ['total', 'model', 'editor', 'provider', 'task'],
};

test('isSplitAllowedForMetric matches the supported split table for every metric and split', () => {
	for (const metric of METRICS) {
		for (const split of SPLITS) {
			assert.equal(isSplitAllowedForMetric(metric, split), ALLOWED[metric].includes(split), `${metric}/${split}`);
		}
	}
});

test('isSplitAllowedForMetric compares the split as given: taskCategory is not task for cost and sessions', () => {
	assert.equal(isSplitAllowedForMetric('cost', 'taskCategory'), false);
	assert.equal(isSplitAllowedForMetric('sessions', 'taskCategory'), false);
	assert.equal(isSplitAllowedForMetric('cost', normalizeSplit('taskCategory')), true);
});

test('isSplitAllowedForMetric treats an unknown metric like tokens', () => {
	assert.equal(isSplitAllowedForMetric('other', 'model'), true);
	assert.equal(isSplitAllowedForMetric('other', 'language'), false);
	assert.equal(isSplitAllowedForMetric('other', 'provider'), false);
});

test('normalizeSplit maps only taskCategory onto task', () => {
	assert.equal(normalizeSplit('taskCategory'), 'task');
	for (const split of SPLITS.filter(s => s !== 'taskCategory')) {
		assert.equal(normalizeSplit(split), split);
	}
});

test('getPreferredSplitForMetric keeps a fitting split and falls back to total otherwise', () => {
	const expected: Record<ChartMetric, Partial<Record<ChartSplit, ChartSplit>>> = {
		cost: { total: 'total', model: 'total', editor: 'editor', repository: 'total', language: 'total', provider: 'provider', task: 'task', taskCategory: 'task' },
		output: { total: 'total', model: 'total', editor: 'editor', repository: 'repository', language: 'language', provider: 'total', task: 'total', taskCategory: 'total' },
		tokens: { total: 'total', model: 'model', editor: 'editor', repository: 'repository', language: 'total', provider: 'provider', task: 'task', taskCategory: 'task' },
		sessions: { total: 'total', model: 'model', editor: 'editor', repository: 'total', language: 'total', provider: 'provider', task: 'task', taskCategory: 'task' },
	};
	for (const metric of METRICS) {
		for (const split of SPLITS) {
			assert.equal(getPreferredSplitForMetric(metric, split), expected[metric][split], `${metric}/${split}`);
		}
	}
});

test('migrateViewKey maps legacy view keys and defaults unknown ones to tokens/total', () => {
	assert.deepEqual(migrateViewKey('cost'), { metric: 'cost', split: 'total' });
	assert.deepEqual(migrateViewKey('repository'), { metric: 'tokens', split: 'repository' });
	assert.deepEqual(migrateViewKey('taskCategory'), { metric: 'tokens', split: 'task' });
	assert.deepEqual(migrateViewKey('nope'), { metric: 'tokens', split: 'total' });
});

const CURRENT: ChartSelection = { period: 'day', timeWindow: 'last30', metric: 'tokens', split: 'total' };

test('resolveHostInitialSelection keeps the current selection when the host sets nothing', () => {
	assert.deepEqual(resolveHostInitialSelection({}, CURRENT), CURRENT);
});

test('resolveHostInitialSelection applies each host preference and normalizes taskCategory', () => {
	assert.deepEqual(
		resolveHostInitialSelection({ initialPeriod: 'week', initialTimeWindow: 'last7', initialMetric: 'cost', initialSplit: 'taskCategory' }, CURRENT),
		{ period: 'week', timeWindow: 'last7', metric: 'cost', split: 'task' },
	);
});

test('resolveHostInitialSelection migrates initialView only when no initialSplit is set', () => {
	assert.deepEqual(resolveHostInitialSelection({ initialView: 'cost' }, CURRENT), { ...CURRENT, metric: 'cost', split: 'total' });
	assert.deepEqual(
		resolveHostInitialSelection({ initialView: 'cost', initialMetric: 'sessions', initialSplit: 'editor' }, CURRENT),
		{ ...CURRENT, metric: 'sessions', split: 'editor' },
	);
	// The legacy view wins over initialMetric when there is no initialSplit.
	assert.deepEqual(resolveHostInitialSelection({ initialView: 'model', initialMetric: 'cost' }, CURRENT), { ...CURRENT, metric: 'tokens', split: 'model' });
});

test('resolveHostInitialSelection does not mutate the current selection', () => {
	const current = { ...CURRENT };
	resolveHostInitialSelection({ initialPeriod: 'month' }, current);
	assert.deepEqual(current, CURRENT);
});

test('resolveSavedSelection fills defaults for an empty saved state', () => {
	assert.deepEqual(resolveSavedSelection({}), { period: 'day', timeWindow: 'last30', metric: 'tokens', split: 'total' });
});

test('resolveSavedSelection restores saved metric and split, normalizing taskCategory', () => {
	assert.deepEqual(
		resolveSavedSelection({ period: 'month', timeWindow: 'last7', metric: 'sessions', split: 'taskCategory' }),
		{ period: 'month', timeWindow: 'last7', metric: 'sessions', split: 'task' },
	);
});

test('resolveSavedSelection migrates the legacy view key only when no metric was saved', () => {
	assert.deepEqual(resolveSavedSelection({ view: 'editor' }), { period: 'day', timeWindow: 'last30', metric: 'tokens', split: 'editor' });
	assert.deepEqual(
		resolveSavedSelection({ view: 'editor', metric: 'cost', split: 'provider' }),
		{ period: 'day', timeWindow: 'last30', metric: 'cost', split: 'provider' },
	);
});

test('cost tooltip and tick formatters', () => {
	assert.equal(formatCostTooltipLabel({ dataset: { label: 'Claude Code' }, parsed: { y: 1.23456 } }), ' Claude Code: $1.2346');
	assert.equal(
		formatCostTooltipFooter([{ dataset: {}, parsed: { y: 1.5 } }, { dataset: {}, parsed: { y: 'x' } }, { dataset: {}, parsed: { y: 0.25 } }]),
		'Total: $1.7500',
	);
	assert.equal(formatCostTooltipFooter([]), 'Total: $0.0000');
	assert.equal(formatCostTick(3), '$3.00');
});

test('buildStackedCostViewConfig stacks the given datasets and keeps the base options', () => {
	const datasets = [{ label: 'gpt', data: [1, 2], backgroundColor: '#000', borderColor: '#000', borderWidth: 1 }];
	const baseOptions = { responsive: true, plugins: { tooltip: { mode: 'index' }, title: { display: false } } };
	const config = buildStackedCostViewConfig(datasets, ['a', 'b'], baseOptions, { textColor: '#fff', gridColor: '#111' });

	assert.equal(config.type, 'bar');
	assert.deepEqual(config.data, { labels: ['a', 'b'], datasets });
	assert.equal(config.options.responsive, true);
	assert.deepEqual(config.options.plugins.title, { display: false });
	assert.equal(config.options.plugins.tooltip.mode, 'index');
	assert.equal(config.options.plugins.tooltip.callbacks.label, formatCostTooltipLabel);
	assert.equal(config.options.plugins.tooltip.callbacks.footer, formatCostTooltipFooter);
	assert.deepEqual(config.options.plugins.legend, { position: 'top', labels: { color: '#fff', font: { size: 11 } } });
	assert.equal(config.options.scales.x.stacked, true);
	assert.equal(config.options.scales.y.stacked, true);
	assert.equal(config.options.scales.y.grid.color, '#111');
	assert.equal(config.options.scales.y.ticks.callback, formatCostTick);
	assert.equal(config.options.scales.y.title.text, 'Estimated Cost (USD)');
});
