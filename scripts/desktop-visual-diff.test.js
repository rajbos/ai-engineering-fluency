'use strict';

// Pure helpers of the desktop screenshot diff (scripts/desktop-visual-diff.js) and
// the render check that takes the screenshots (scripts/validate-desktop-render.js).
// The end-to-end run needs builds and a browser; CI's ui-checks job runs it.

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { parseArgs } = require('./desktop-visual-diff.js');
const { screenshotName } = require('./validate-desktop-render.js');
const { mergeReportSection } = require(path.join(__dirname, '..', '.github', 'skills', 'visual-view-diff', 'lib', 'report.js'));

// The file-name shape diff-screenshots.js parses: <view>[--<state>].<theme>.png
const SHOT_NAME = /^(.+?)(?:--(.+))?\.(dark|light|hc-light|hc)\.png$/;

test('screenshotName prefixes desktop- and names the empty scenario as a state', () => {
	assert.equal(screenshotName('chart', 'populated', 'dark'), 'desktop-chart.dark.png');
	assert.equal(screenshotName('fluency-level-viewer', 'empty', 'light'), 'desktop-fluency-level-viewer--empty.light.png');
	const [, view, state, theme] = SHOT_NAME.exec(screenshotName('usage', 'empty', 'dark'));
	assert.deepEqual([view, state, theme], ['desktop-usage', 'empty', 'dark']);
	assert.equal(SHOT_NAME.exec(screenshotName('usage', 'populated', 'light'))[2], undefined);
});

test('parseArgs takes --base and --out and rejects anything else', () => {
	assert.deepEqual(parseArgs(['--base', 'origin/main', '--out', 'x']), { base: 'origin/main', out: 'x' });
	assert.deepEqual(parseArgs([]), {});
	assert.throws(() => parseArgs(['--base']), /needs a value/);
	assert.throws(() => parseArgs(['--base', '--out', 'x']), /needs a value/);
	assert.throws(() => parseArgs(['--theme', 'dark']), /Unknown option/);
	assert.throws(() => parseArgs(['base', 'x']), /Unknown option/);
});

test('mergeReportSection replaces only the prefixed entries and recounts the summary', () => {
	const existing = {
		threshold: 0.02,
		comparisons: [
			{ view: 'details', status: 'changed' },
			{ view: 'badge-home', status: 'unchanged' },
			{ view: 'desktop-chart', status: 'changed' },
		],
	};
	const desktop = {
		generatedAt: 'now',
		threshold: 0.5,
		comparisons: [{ view: 'desktop-chart', status: 'unchanged' }, { view: 'desktop-usage', status: 'added' }],
	};
	const merged = mergeReportSection(existing, desktop, 'desktop-');
	assert.deepEqual(merged.comparisons.map((c) => c.view), ['details', 'badge-home', 'desktop-chart', 'desktop-usage']);
	assert.deepEqual(merged.summary, { changed: 1, unchanged: 2, added: 1, removed: 0 });
	assert.equal(merged.threshold, 0.02);
	assert.equal(merged.generatedAt, 'now');
	assert.equal(mergeReportSection(null, desktop, 'desktop-').threshold, 0.5);
});
