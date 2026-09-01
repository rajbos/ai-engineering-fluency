import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	getTimeWindowStartDate,
	getTimeWindowStartDayKey,
	getTimeWindowStartMonthKey,
} from '../../../src/timeWindows';
import { ALL_PERIODS, CANONICAL_PERIODS, PERIOD_LABELS } from '../../src/webview/shared/periodSelector';

const NOW = new Date(2025, 4, 15, 12);

test('canonical period selectors include the 90-day window', () => {
	assert.deepEqual(CANONICAL_PERIODS, ['today', 'last7', 'last30', 'last90', 'currentMonth', 'allTime']);
	assert.ok(ALL_PERIODS.includes('last90'));
	assert.equal(PERIOD_LABELS.last90, 'Last 90 days');
});

test('last90 starts 89 local calendar days before today', () => {
	assert.equal(getTimeWindowStartDayKey('last90', NOW), '2025-02-15');
	assert.equal(getTimeWindowStartMonthKey('last90', NOW), '2025-02');
});

test('rolling windows include today in their day count', () => {
	assert.equal(getTimeWindowStartDayKey('today', NOW), '2025-05-15');
	assert.equal(getTimeWindowStartDayKey('last7', NOW), '2025-05-09');
	assert.equal(getTimeWindowStartDayKey('last30', NOW), '2025-04-16');
});

test('calendar and all-time windows retain their existing boundaries', () => {
	assert.equal(getTimeWindowStartDayKey('currentMonth', NOW), '2025-05-01');
	assert.equal(getTimeWindowStartMonthKey('currentMonth', NOW), '2025-05');
	assert.equal(getTimeWindowStartDate('allTime', NOW), null);
	assert.equal(getTimeWindowStartDayKey('allTime', NOW), '0000-00-00');
	assert.equal(getTimeWindowStartMonthKey('allTime', NOW), '0000-00');
});
