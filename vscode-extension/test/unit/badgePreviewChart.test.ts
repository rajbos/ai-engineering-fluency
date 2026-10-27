import test from 'node:test';
import * as assert from 'node:assert/strict';

import { badgeChartSvg } from '../../src/webview/badge-setup/previewChart';

const days = (count: number): Array<[string, number, number]> =>
	Array.from({ length: count }, (_, i): [string, number, number] => [`d${i}`, i % 3 === 0 ? 0 : 1000 * (i + 1), 1]);

test('badgeChartSvg: draws one bar per day for both the 30 and 90 day ranges', () => {
	for (const count of [30, 90]) {
		const svg = badgeChartSvg({ days: days(count), theme: {} }, 'Daily tokens');
		assert.equal((svg.match(/<rect /g) ?? []).length, count);
	}
});

test('badgeChartSvg: colours the last week with the accent, earlier days with good and empty days dim', () => {
	const svg = badgeChartSvg({ days: days(30), theme: { accent: '#112233', good: '#445566' } }, 'x');
	assert.equal((svg.match(/fill="#112233"/g) ?? []).length, 5); // last 7 days minus the empty ones
	assert.ok(svg.includes('fill="#445566"'));
	assert.ok(svg.includes('fill="#32264c"'));
});

test('badgeChartSvg: falls back to the Universe palette and escapes the label', () => {
	const svg = badgeChartSvg({ days: days(7), theme: {} }, '"<b>"');
	assert.ok(svg.includes('#5fed83'));
	assert.ok(svg.includes('aria-label="&quot;&lt;b&gt;&quot;"'));
});
