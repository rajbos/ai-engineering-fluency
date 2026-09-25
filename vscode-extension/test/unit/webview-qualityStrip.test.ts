import test from 'node:test';
import * as assert from 'node:assert/strict';
import { buildQualityStripHtml, sanitizeAgenticQuality } from '../../src/webview/maturity/qualityStrip';

const comparison = {
	classification: 'faster-but-weaker',
	agenticPerDay: { current: 1.2, previous: 0.5 },
	correctionsPerSession: { current: 0.8, previous: 0.4 },
	oneShotRate: { current: 0.7, previous: 0.8 },
};

test('buildQualityStripHtml: shows the pair of numbers and a warning verdict', () => {
	const html = buildQualityStripHtml(sanitizeAgenticQuality({ comparison, stretchedRepos: [] }), 3);
	assert.match(html, /id="quality-strip"/);
	assert.match(html, /1\.2/);
	assert.match(html, /last month: 0\.40/);
	assert.match(html, /70%/);
	assert.match(html, /quality-verdict-warn/);
	assert.match(html, /not part of any export/);
	assert.doesNotMatch(html, /btn-show-readiness/);
});

test('buildQualityStripHtml: stretched repositories get a stage-4 specific note and a link to AI Readiness', () => {
	const view = sanitizeAgenticQuality({ comparison, stretchedRepos: ['o/r'] });
	assert.match(buildQualityStripHtml(view, 4), /Your stage reflects how much you use AI\. In o\/r/);
	assert.match(buildQualityStripHtml(view, 2), /Agent use has outrun the controls in: o\/r/);
	assert.match(buildQualityStripHtml(view, 2), /id="btn-show-readiness"/);
});

test('buildQualityStripHtml: insufficient data explains why, and missing values render as a dash', () => {
	const view = sanitizeAgenticQuality({ comparison: { ...comparison, classification: 'insufficient-data', reason: 'too-early-in-month', oneShotRate: { current: null, previous: null } }, stretchedRepos: [] });
	const html = buildQualityStripHtml(view, 2);
	assert.match(html, /Too early in the month/);
	assert.match(html, /—/);
});

test('sanitizeAgenticQuality: rejects unknown classifications and non-string repositories', () => {
	assert.equal(sanitizeAgenticQuality({ comparison: { ...comparison, classification: 'great' } }), null);
	assert.equal(sanitizeAgenticQuality(undefined), null);
	assert.deepEqual(sanitizeAgenticQuality({ comparison, stretchedRepos: ['a/b', 3, '<x>'] })?.stretchedRepos, ['a/b', '<x>']);
	assert.equal(sanitizeAgenticQuality({ comparison: { ...comparison, agenticPerDay: { current: -1, previous: 'x' } } })?.comparison.agenticPerDay.current, null);
	assert.doesNotMatch(buildQualityStripHtml(sanitizeAgenticQuality({ comparison, stretchedRepos: ['<x>'] }), 2), /<x>/);
});
