import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	tooltipSecondaryPeriod,
	formatTooltipStatsTable,
	type StatusBarDisplaySetting
} from '../../src/extension';
import type { DetailedStats, PeriodStats } from '../../../src/types';

function createPeriodStats(overrides: Partial<PeriodStats> = {}): PeriodStats {
	return {
		tokens: 0,
		thinkingTokens: 0,
		estimatedTokens: 0,
		actualTokens: 0,
		sessions: 0,
		avgInteractionsPerSession: 0,
		avgTokensPerSession: 0,
		modelUsage: {},
		editorUsage: {},
		co2: 0,
		treesEquivalent: 0,
		waterUsage: 0,
		estimatedCost: 0,
		...overrides,
	};
}

function createDetailedStats(overrides: {
	today?: Partial<PeriodStats>;
	month?: Partial<PeriodStats>;
	lastMonth?: Partial<PeriodStats>;
	last30Days?: Partial<PeriodStats>;
} = {}): DetailedStats {
	return {
		today: createPeriodStats(overrides.today),
		month: createPeriodStats(overrides.month),
		lastMonth: createPeriodStats(overrides.lastMonth),
		last30Days: createPeriodStats(overrides.last30Days),
		lastUpdated: new Date()
	};
}

function formatExpectedUsage(n: number, fractionDigits: number, unit: string): string {
	const rounded = Math.round(n * (10 ** fractionDigits)) / (10 ** fractionDigits);
	const format = Math.abs(rounded) >= 1000
		? { minimumFractionDigits: 0, maximumFractionDigits: 0 }
		: { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits };
	return `${n.toLocaleString(undefined, format)} ${unit}`;
}

test('formatTooltipStatsTable renders 3 columns: Today, Current Month, and Last 30 Days', () => {
	const stats = createDetailedStats({
		today: {
			tokens: 44042172,
			estimatedCostCopilot: 20.54,
			billingGroupCosts: { 'GitHub Copilot': 20.54, 'Anthropic': 19.85 },
			co2: 8808,
			waterUsage: 13213
		},
		month: {
			tokens: 656117347,
			estimatedCostCopilot: 221.94,
			billingGroupCosts: { 'GitHub Copilot': 221.94, 'Anthropic': 64.87 },
			co2: 131223,
			waterUsage: 196835
		},
		last30Days: {
			tokens: 712000000,
			estimatedCostCopilot: 245.50,
			billingGroupCosts: { 'GitHub Copilot': 245.50, 'Anthropic': 70.00 },
			co2: 142000,
			waterUsage: 213000
		}
	});

	const markdown = formatTooltipStatsTable(stats);

	// Check table header and 4-column alignment
	assert.ok(markdown.includes('|  | 📅 Today | 📊 Current Month | 📈 Last 30 Days |'));
	assert.ok(markdown.includes('|:---|:---|:---|:---|'));

	// Check Tokens row
	const tToday = (44042172).toLocaleString();
	const tMonth = (656117347).toLocaleString();
	const t30Days = (712000000).toLocaleString();
	assert.ok(markdown.includes(`| Tokens : | ${tToday}&nbsp;&nbsp;&nbsp;&nbsp; | ${tMonth}&nbsp;&nbsp;&nbsp;&nbsp; | ${t30Days} |`));

	// Check GitHub Copilot cost row
	assert.ok(markdown.includes('| GitHub Copilot cost : | $ 20.54&nbsp;&nbsp;&nbsp;&nbsp; | $ 221.94&nbsp;&nbsp;&nbsp;&nbsp; | $ 245.50 |'));

	// Check All providers cost row (summed)
	assert.ok(markdown.includes('| All providers cost : | $ 40.39&nbsp;&nbsp;&nbsp;&nbsp; | $ 286.81&nbsp;&nbsp;&nbsp;&nbsp; | $ 315.50 |'));

	// Check CO2 estimated row (>= 1000 hides decimals)
	const co2Today = formatExpectedUsage(8808, 2, 'grams');
	const co2Month = formatExpectedUsage(131223, 2, 'grams');
	const co230Days = formatExpectedUsage(142000, 2, 'grams');
	assert.ok(markdown.includes(`| CO₂ estimated : | ${co2Today}&nbsp;&nbsp;&nbsp;&nbsp; | ${co2Month}&nbsp;&nbsp;&nbsp;&nbsp; | ${co230Days} |`));

	// Check Water estimated row (>= 1000 hides decimals)
	const waterToday = formatExpectedUsage(13213, 3, 'liters');
	const waterMonth = formatExpectedUsage(196835, 3, 'liters');
	const water30Days = formatExpectedUsage(213000, 3, 'liters');
	assert.ok(markdown.includes(`| Water estimated : | ${waterToday}&nbsp;&nbsp;&nbsp;&nbsp; | ${waterMonth}&nbsp;&nbsp;&nbsp;&nbsp; | ${water30Days} |`));
});

test('formatTooltipStatsTable formats small CO2 and water values with decimals', () => {
	const stats = createDetailedStats({
		today: { co2: 12.345, waterUsage: 0.123 },
		month: { co2: 99.5, waterUsage: 5.678 },
		last30Days: { co2: 150.25, waterUsage: 12.345 }
	});

	const markdown = formatTooltipStatsTable(stats);

	const co2Today = formatExpectedUsage(12.345, 2, 'grams');
	const co2Month = formatExpectedUsage(99.5, 2, 'grams');
	const co230Days = formatExpectedUsage(150.25, 2, 'grams');
	assert.ok(markdown.includes(`| CO₂ estimated : | ${co2Today}&nbsp;&nbsp;&nbsp;&nbsp; | ${co2Month}&nbsp;&nbsp;&nbsp;&nbsp; | ${co230Days} |`));

	const waterToday = formatExpectedUsage(0.123, 3, 'liters');
	const waterMonth = formatExpectedUsage(5.678, 3, 'liters');
	const water30Days = formatExpectedUsage(12.345, 3, 'liters');
	assert.ok(markdown.includes(`| Water estimated : | ${waterToday}&nbsp;&nbsp;&nbsp;&nbsp; | ${waterMonth}&nbsp;&nbsp;&nbsp;&nbsp; | ${water30Days} |`));
});

test('formatTooltipStatsTable hides decimals when value rounds to 1000+', () => {
	const stats = createDetailedStats({
		today: { co2: 999.996, waterUsage: 999.9996 },
		month: { co2: 1000, waterUsage: 1000 },
		last30Days: { co2: 1001, waterUsage: 1001 }
	});

	const markdown = formatTooltipStatsTable(stats);

	const co2Today = formatExpectedUsage(999.996, 2, 'grams');
	const co2Month = formatExpectedUsage(1000, 2, 'grams');
	const co230Days = formatExpectedUsage(1001, 2, 'grams');
	assert.ok(markdown.includes(`| CO₂ estimated : | ${co2Today}&nbsp;&nbsp;&nbsp;&nbsp; | ${co2Month}&nbsp;&nbsp;&nbsp;&nbsp; | ${co230Days} |`));

	const waterToday = formatExpectedUsage(999.9996, 3, 'liters');
	const waterMonth = formatExpectedUsage(1000, 3, 'liters');
	const water30Days = formatExpectedUsage(1001, 3, 'liters');
	assert.ok(markdown.includes(`| Water estimated : | ${waterToday}&nbsp;&nbsp;&nbsp;&nbsp; | ${waterMonth}&nbsp;&nbsp;&nbsp;&nbsp; | ${water30Days} |`));
});

test('tooltipSecondaryPeriod: default both/none shows last30days', () => {
	assert.equal(tooltipSecondaryPeriod('both', 'none'), 'last30days');
});

test('tooltipSecondaryPeriod: last30days tokens shows last30days', () => {
	assert.equal(tooltipSecondaryPeriod('last30days', 'none'), 'last30days');
});

test('tooltipSecondaryPeriod: both cost setting shows last30days', () => {
	assert.equal(tooltipSecondaryPeriod('none', 'both'), 'last30days');
});

test('tooltipSecondaryPeriod: last30days cost setting shows last30days', () => {
	assert.equal(tooltipSecondaryPeriod('today', 'last30days'), 'last30days');
});

test('tooltipSecondaryPeriod: currentMonth tokens shows currentMonth', () => {
	assert.equal(tooltipSecondaryPeriod('currentMonth', 'none'), 'currentMonth');
});

test('tooltipSecondaryPeriod: todayAndCurrentMonth tokens shows currentMonth', () => {
	assert.equal(tooltipSecondaryPeriod('todayAndCurrentMonth', 'none'), 'currentMonth');
});

test('tooltipSecondaryPeriod: today tokens shows currentMonth', () => {
	assert.equal(tooltipSecondaryPeriod('today', 'none'), 'currentMonth');
});

test('tooltipSecondaryPeriod: none/none shows currentMonth', () => {
	assert.equal(tooltipSecondaryPeriod('none', 'none'), 'currentMonth');
});

test('tooltipSecondaryPeriod: both settings are today shows currentMonth', () => {
	assert.equal(tooltipSecondaryPeriod('today', 'today'), 'currentMonth');
});

test('tooltipSecondaryPeriod: currentMonth tokens and currentMonth cost shows currentMonth', () => {
	assert.equal(tooltipSecondaryPeriod('currentMonth', 'currentMonth'), 'currentMonth');
});

test('tooltipSecondaryPeriod: todayAndCurrentMonth both settings shows currentMonth', () => {
	assert.equal(tooltipSecondaryPeriod('todayAndCurrentMonth', 'todayAndCurrentMonth'), 'currentMonth');
});

// Verify the type export is usable
test('StatusBarDisplaySetting type is exported', () => {
	const val: StatusBarDisplaySetting = 'both';
	assert.equal(val, 'both');
});
