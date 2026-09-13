import test from 'node:test';
import * as assert from 'node:assert/strict';

import type { ModelMixShift } from '../../../src/efficiencyAnalysis';
import { setFormatLocale } from '../../src/webview/shared/formatUtils';
import { initializeWebviewLocalization } from '../../src/webview/shared/localization';
import { renderModelMixTable } from '../../src/webview/efficiency/modelMixTable';

// Pin the locale so decimal separators are deterministic regardless of the
// machine running the suite (the webview itself sets this from the host).
setFormatLocale('en-US');

const WINDOWS = {
	prev: 'previous 30 days',
	cur: 'last 30 days',
	prevRange: 'Jan 12, 2026–Feb 8, 2026',
	curRange: 'Feb 9, 2026–Mar 8, 2026',
};

function shift(model: string, prevShare: number, curShare: number): ModelMixShift {
	return {
		model,
		prevShare,
		curShare,
		deltaShare: curShare - prevShare,
		prevTokens: Math.round(prevShare * 1_000_000),
		curTokens: Math.round(curShare * 1_000_000),
	};
}

test('modelMixTable: renders the pricing display name for a known model id', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([shift('gpt-4o', 0.31, 0.2)], WINDOWS);
	assert.match(html, /GPT-4o/);
	// The canonical id is still disclosed, so the row stays traceable back to the data.
	assert.match(html, /title="GPT-4o — gpt-4o"/);
	assert.match(html, /Model ID: gpt-4o/);
});

test('modelMixTable: resolves dash-version and org-scoped ids through the shared helper', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([
		shift('claude-opus-4-8', 0.04, 0.12),
		shift('9f4a1c2e-7b31-4d55-9e6a-2c8b0f1d3a47/gpt-5-mini', 0, 0.05),
	], WINDOWS);
	assert.match(html, /Claude Opus 4\.8/);
	assert.match(html, /GPT-5 Mini/);
});

test('modelMixTable: keeps an unknown model id intact and inspectable', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([shift('internal-eval-model-2026-preview', 0.12, 0.07)], WINDOWS);
	// No guessed label: the raw id is both the visible name and the title, and it
	// is not duplicated into the screen-reader line when the two are identical.
	assert.match(html, />internal-eval-model-2026-preview</);
	assert.match(html, /title="internal-eval-model-2026-preview"/);
	assert.doesNotMatch(html, /Model ID: internal-eval-model-2026-preview/);
});

test('modelMixTable: shows every comparison value with signed point shifts', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([shift('gpt-4o', 0.31, 0.2), shift('claude-sonnet-4.5', 0.22, 0.4)], WINDOWS);
	assert.match(html, /31\.0%/);
	assert.match(html, /20\.0%/);
	assert.match(html, /22\.0%/);
	assert.match(html, /40\.0%/);
	assert.match(html, /-11\.0 pt/);
	assert.match(html, /\+18\.0 pt/);
	assert.match(html, /share-down/);
	assert.match(html, /share-up/);
});

test('modelMixTable: uses compact period headers with the range as a sub-label', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([shift('gpt-4o', 0.31, 0.2)], WINDOWS);
	assert.match(html, /<th scope="col" class="num">Previous<span class="th-sub">Jan 12, 2026–Feb 8, 2026<\/span><\/th>/);
	assert.match(html, /<th scope="col" class="num">Current<span class="th-sub">Feb 9, 2026–Mar 8, 2026<\/span><\/th>/);
});

test('modelMixTable: is a semantic, scrollable table for assistive technology', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([shift('gpt-4o', 0.31, 0.2)], WINDOWS);
	assert.match(html, /<div class="attr-shift-scroll" role="region" tabindex="0" aria-labelledby="attr-shift-heading">/);
	assert.match(html, /<h3 id="attr-shift-heading">/);
	assert.match(html, /<caption class="attr-shift-sr">Token share per model, Jan 12, 2026–Feb 8, 2026 compared with Feb 9, 2026–Mar 8, 2026<\/caption>/);
	assert.match(html, /<th scope="row" class="attr-shift-model">/);
	assert.equal((html.match(/scope="col"/g) ?? []).length, 4);
});

test('modelMixTable: renders translated labels when a zh-cn payload is supplied', () => {
	initializeWebviewLocalization({
		'efficiency.modelMix.heading': '模型组合变化',
		'efficiency.modelMix.model': '模型',
		'efficiency.modelMix.previous': '上一期',
		'efficiency.modelMix.current': '本期',
		'efficiency.modelMix.shift': '变化',
		'efficiency.modelMix.shiftPoints': '{0} 个百分点',
	});
	const html = renderModelMixTable([shift('gpt-4o', 0.31, 0.2)], WINDOWS);
	assert.match(html, /模型组合变化/);
	assert.match(html, /上一期/);
	assert.match(html, /本期/);
	assert.match(html, /-11\.0 个百分点/);
	initializeWebviewLocalization({});
});

test('modelMixTable: escapes a hostile model identifier', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([shift('<img src=x onerror="alert(1)">', 0.2, 0.3)], WINDOWS);
	assert.doesNotMatch(html, /<img/);
	assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
	initializeWebviewLocalization({});
});

test('modelMixTable: renders the rows in the order the analytics layer supplied', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([
		shift('claude-sonnet-4.5', 0.22, 0.4),
		shift('gpt-4o', 0.31, 0.2),
		shift('claude-opus-4-8', 0.04, 0.12),
	], WINDOWS);
	const order = ['Claude Sonnet 4.5', 'GPT-4o', 'Claude Opus 4.8'].map(name => html.indexOf(name));
	assert.deepEqual(order, [...order].sort((a, b) => a - b));
	assert.ok(order.every(i => i >= 0));
});

test('modelMixTable: separates the visible name from the screen-reader id', () => {
	initializeWebviewLocalization({});
	const html = renderModelMixTable([shift('gpt-4o', 0.31, 0.2)], WINDOWS);
	// Without the separator the row announces as "GPT-4oModel ID: gpt-4o".
	assert.match(html, /<\/span><span class="attr-shift-sr"> Model ID: gpt-4o<\/span>/);
});

test('modelMixTable: renders a model id that collides with an Object.prototype key', () => {
	// `getModelDisplayName` must not hand back an inherited function here — escapeHtml
	// would throw on it and abort the whole Efficiency render.
	initializeWebviewLocalization({});
	for (const id of ['constructor', 'toString', '__proto__']) {
		const html = renderModelMixTable([shift(id, 0.2, 0.3)], WINDOWS);
		assert.match(html, new RegExp(`title="${id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`));
	}
});
