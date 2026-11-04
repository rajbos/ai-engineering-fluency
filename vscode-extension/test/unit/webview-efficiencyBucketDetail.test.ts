import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { setFormatLocale } from '../../src/webview/shared/formatUtils';
import { initializeWebviewLocalization } from '../../src/webview/shared/localization';
import {
	BUCKET_DETAIL_ID, BUCKET_DRILL_BUTTON_ID, BUCKET_PICK_ID, bucketPickerHtml, contextButtonHtml, deltaContextButtonHtml, formatBucketChange,
	formatBucketValue, renderBucketDetail, renderBucketDetailPlaceholder, renderModelBucketDetail, renderSkillBucketDetail,
} from '../../src/webview/efficiency/bucketDetail';
import { computeVerdict } from '../../src/webview/efficiency/verdict';
import type { BucketDetail } from '../../../src/efficiencyBucketDetail';
import type { EfficiencyDelta } from '../../../src/efficiencyAnalysis';

setFormatLocale('en-US');

function base(overrides: Partial<BucketDetail> = {}): BucketDetail {
	return {
		key: '2026-07-13', label: 'Jul 13–19', startKey: '2026-07-13', endKey: '2026-07-15', resolution: 'weekly', partial: true,
		raw: { sessions: 3, tokens: 1500, turns: 12, loc: 200, cost: 1.5 },
		metrics: [
			{ id: 'cost-per-kloc', unit: 'currency', goodDirection: 'down', value: null, prior: 4, deltaPct: null, improved: null, unavailable: 'no-loc' },
			{ id: 'retry-rate', unit: 'percent', goodDirection: 'down', value: 12, prior: 20, deltaPct: -40, improved: true, unavailable: null },
		],
		notes: ['partial'],
		...overrides,
	};
}

test('picker: a native labelled select with an explicit selected state and escaped labels', () => {
	initializeWebviewLocalization({});
	const html = bucketPickerHtml([
		{ key: '2026-07-06', label: 'Jul 6–12', startKey: '2026-07-06', endKey: '2026-07-12', resolution: 'weekly' },
		{ key: '2026-07-13', label: '<b>Jul 13</b>', startKey: '2026-07-13', endKey: '2026-07-19', resolution: 'weekly' },
	], '2026-07-13');
	assert.match(html, /<label[^>]*>Selected period <select id="eff-bucket-pick" class="model-select">/);
	assert.match(html, /<option value="2026-07-13" selected>&lt;b&gt;Jul 13&lt;\/b&gt;<\/option>/);
	assert.doesNotMatch(html, /<b>/);
	assert.equal(BUCKET_PICK_ID, 'eff-bucket-pick');
	assert.equal(bucketPickerHtml([], ''), '');
});

test('placeholder: a live region is always present so the selection has somewhere to announce', () => {
	initializeWebviewLocalization({});
	const html = renderBucketDetailPlaceholder();
	assert.match(html, new RegExp(`id="${BUCKET_DETAIL_ID}"[^>]*role="region"[^>]*aria-live="polite"`));
});

test('detail: shows range, raw volumes, null as an em dash with a reason, and the partial note', () => {
	initializeWebviewLocalization({});
	const html = renderBucketDetail(base(), true);
	assert.match(html, /2026-07-13 to 2026-07-15/);
	assert.match(html, /\(in progress\)/);
	assert.match(html, /<dt>Sessions<\/dt><dd>3<\/dd>/);
	assert.match(html, /<dt>Turns<\/dt><dd>12<\/dd>/);
	assert.match(html, /<th scope="row">Cost per 1K lines changed<\/th><td>—\s*<span class="bucket-reason">No lines-of-code data recorded\./);
	assert.match(html, /still in progress/);
	assert.match(html, new RegExp(`id="${BUCKET_DRILL_BUTTON_ID}"`));
	assert.doesNotMatch(renderBucketDetail(base(), false), new RegExp(BUCKET_DRILL_BUTTON_ID));
});

test('change text spells out direction and better/worse instead of relying on colour or arrows', () => {
	initializeWebviewLocalization({});
	assert.equal(formatBucketChange(-40, true), 'down 40% (better)');
	assert.equal(formatBucketChange(12, false), 'up 12% (worse)');
	assert.equal(formatBucketChange(5, null), 'up 5%');
	assert.equal(formatBucketChange(null, null), '—');
	assert.equal(formatBucketValue(null, 'currency'), '—');
	assert.equal(formatBucketValue(12.4, 'percent'), '12%');
});

test('skills detail: raw volume block plus the tracked-session denominator', () => {
	initializeWebviewLocalization({});
	const html = renderSkillBucketDetail({
		key: 'k', label: 'Jul 13–19', totalCalls: 5, skillSessions: 2, trackedSessions: 4, skillShare: 0.5,
		priorSkillShare: 0.25, shareChangePoints: 25, top: [{ name: 'graphify', calls: 5 }],
	}, base(), false);
	assert.match(html, /<dt>Tracked sessions<\/dt><dd>4<\/dd>/);
	assert.match(html, /<dt>Skill share of sessions<\/dt><dd>50%<\/dd>/);
	assert.match(html, /\+25 points/);
	assert.match(html, /graphify \(5\)/);
	assert.match(html, /<dt>Sessions<\/dt><dd>3<\/dd>/);
});

test('models detail: keeps sample-floor, mixed-model and observational caveats; unused model is stated', () => {
	initializeWebviewLocalization({});
	const detail = {
		model: 'm', displayName: 'Model <X>', sessions: 2, sessionShare: 2, editTurns: 12, tokens: 900, cost: 2, loc: 50,
		value: null, prior: 10, deltaPct: null, improved: null, sampleSufficient: false, editSampleSufficient: false,
		taskMix: [{ category: 'debugging', share: 0.6 }],
	};
	const html = renderModelBucketDetail(base(), [{ name: 'Model <X>', detail }, { name: 'Other', detail: null }], 'Retry', 'percent', 5, false);
	assert.match(html, /Model &lt;X&gt;/);
	assert.match(html, /<dt>Edit turns<\/dt><dd>12<\/dd>/);
	assert.match(html, /sample floor of 5 session equivalents/);
	assert.match(html, /debugging 60%/);
	assert.match(html, /Other was not used in this period/);
	assert.match(html, /split across a session’s models by token share/);
	assert.match(html, /observational/);
});

test('context button: an ordinary button carrying its action, with a subject-specific accessible name', () => {
	initializeWebviewLocalization({});
	const html = contextButtonHtml('trend', 'retry-rate', 'efficiency.context.viewTrend', 'efficiency.context.viewTrendAria', 'Edit retry rate');
	assert.match(html, /^<button type="button" class="eff-context-btn" data-ctx="trend" data-target="retry-rate" aria-label="Open the trend chart for Edit retry rate">View trend<\/button>$/);
});

test('delta targets: every metric with a Trends card opens that card, by the card\'s own id', () => {
	initializeWebviewLocalization({});
	const expected: Record<string, string> = {
		'tokens-per-session': 'tokens-per-session',
		'turns-per-session': 'turns-per-session',
		'active-minutes-per-session': 'active-minutes',
		'retry-rate': 'retry-rate',
		'apply-rate': 'apply-rate',
	};
	for (const [deltaId, cardId] of Object.entries(expected)) {
		assert.match(deltaContextButtonHtml(deltaId, 'Label', false), new RegExp(`data-ctx="trend" data-target="${cardId}"`), deltaId);
	}
});

test('delta targets: cost per session opens the Models metric, and says so instead of promising a trend', () => {
	initializeWebviewLocalization({});
	const html = deltaContextButtonHtml('cost-per-session', 'Cost per session', true);
	assert.match(html, /data-ctx="model-metric" data-target="cost-per-session"/);
	assert.match(html, /aria-label="Open Cost per session in the Models tab">View in Models<\/button>$/);
});

test('delta targets: no dead end when Models has no data, and no button where no chart exists', () => {
	initializeWebviewLocalization({});
	assert.equal(deltaContextButtonHtml('cost-per-session', 'Cost per session', false), '');
	assert.equal(deltaContextButtonHtml('low-cost-share', 'Low-cost model share', true), '');
});

function delta(improved: boolean | null): EfficiencyDelta {
	return { id: 'x', label: 'X', description: '', cur: 1, prev: 2, deltaPct: -50, unit: 'ratio', goodDirection: 'down', improved };
}

test('verdict: counts scored deltas against the previous month and escapes its label', () => {
	assert.equal(computeVerdict([delta(null)], 'June').cls, 'unknown');
	const improving = computeVerdict([delta(true), delta(true), delta(false), delta(null)], '<b>June</b>');
	assert.equal(improving.cls, 'improving');
	assert.match(improving.text, /2 of 3 efficiency metrics improved vs\. &lt;b&gt;June&lt;\/b&gt;/);
	assert.equal(computeVerdict([delta(true), delta(false)], 'June').cls, 'mixed');
});

test('verdict: points at Month vs Month, whose calendar months it judges, not rolling-window Cost Attribution', () => {
	for (const deltas of [[delta(true), delta(false)], [delta(false), delta(false)]]) {
		const { text } = computeVerdict(deltas, 'June');
		assert.match(text, /Month vs Month tab/);
		assert.doesNotMatch(text, /Cost Attribution/);
	}
});

const MAIN_SOURCE = fs.readFileSync(path.join(__dirname, '../../../../src/webview/efficiency/main.ts'), 'utf8');

/** The body of one top-level function in main.ts: up to the next top-level closing brace. */
function mainFunctionBody(name: string): string {
	const start = MAIN_SOURCE.indexOf(`function ${name}(`);
	assert.ok(start >= 0, `${name} not found in main.ts`);
	const end = MAIN_SOURCE.slice(start).search(/\r?\n}\r?\n/);
	return MAIN_SOURCE.slice(start, start + end);
}

test('layout: the selected-period section sits directly above the chart it selects from, on every tab', () => {
	const tabs: [string, string][] = [
		['renderTrendsTab', 'class="trend-grid"'],
		['renderSkillsTab', 'id="skills-chart"'],
		['renderCombinedTab', 'id="combined-chart"'],
		['renderModelsTab', 'id="model-trend"'],
	];
	for (const [fn, chart] of tabs) {
		const body = mainFunctionBody(fn);
		const section = body.indexOf('renderBucketSection(');
		assert.ok(section >= 0, `${fn} has no selected-period section`);
		assert.ok(section < body.indexOf(chart), `${fn}: the section must come before ${chart}`);
	}
});

test('layout: one period picker, so the toolbar no longer offers a second list of the same periods', () => {
	assert.doesNotMatch(MAIN_SOURCE, /eff-drill-pick/);
});

test('layout: on Models the time controls stay with the drift chart, and the filters above both sections', () => {
	const models = mainFunctionBody('renderModelsTab');
	assert.doesNotMatch(models, /renderScopeToolbar\(/);
	assert.ok(models.indexOf('${filters}') < models.indexOf('${controls}'));
	assert.ok(models.indexOf('${controls}') < models.indexOf('renderDriftScopeBar('));
	assert.ok(models.indexOf('renderDriftScopeBar(') < models.indexOf('id="model-trend"'));
	assert.doesNotMatch(mainFunctionBody('renderModelsFilterBar'), /scopeTimeControlsHtml/);
	assert.match(mainFunctionBody('renderDriftScopeBar'), /scopeTimeControlsHtml/);
});
