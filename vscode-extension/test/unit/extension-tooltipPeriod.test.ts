import test from 'node:test';
import * as assert from 'node:assert/strict';

import { tooltipSecondaryPeriod, type StatusBarDisplaySetting } from '../../src/extension';

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
