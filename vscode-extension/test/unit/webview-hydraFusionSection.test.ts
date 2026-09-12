import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';

import { analyzeHydraFusionSession } from '../../../src/hydrafusion';
import { setFormatLocale } from '../../src/webview/shared/formatUtils';
import {
	barWidthPercent,
	formatAiu,
	formatFusionDuration,
	renderHydraFusionSection,
} from '../../src/webview/logviewer/hydraFusionSection';

// Pin the locale so decimal separators and grouping are deterministic regardless of
// the machine running the suite (the webview itself sets this from the host's locale).
setFormatLocale('en-US');

const AIU = 1_000_000_000;

function line(type: string, data: Record<string, unknown>): string {
	return JSON.stringify({ type, data, id: 'evt', timestamp: '2026-09-11T09:00:00.000Z' });
}

/** A cascade turn whose judge rejected the draft and escalated to a stronger model. */
function cascadeSession(overrides: { draftModel?: string } = {}): string {
	const fusionId = 'fusion-1';
	return [
		line('session.fusion_resolved', {
			fusionId, syntheticModel: 'hydrafusion', policy: 'max', routeSource: 'capi_plan', pattern: 'cascade',
			phasePlan: [{ kind: 'primary' }, { kind: 'judge' }, { kind: 'repair' }],
			primaryModel: 'mai-code-1.1-flash', routingLatencyMs: 220,
		}),
		line('assistant.fusion_phase_completed', {
			fusionId, phaseId: `${fusionId}:phase:0`, phaseKind: 'primary', role: 'solver', conversationScope: 'root',
			model: overrides.draftModel ?? 'mai-code-1.1-flash', status: 'succeeded', verdict: null, durationMs: 22_000,
			usage: { requestCount: 1, inputTokens: 1000, outputTokens: 100, cachedTokens: 700, cacheWriteTokens: 0, totalNanoAiu: 0.58 * AIU },
		}),
		line('assistant.fusion_phase_completed', {
			fusionId, phaseId: `${fusionId}:judge`, phaseKind: 'judge', role: 'judge', conversationScope: 'review',
			model: 'gpt-5.6-sol', status: 'succeeded', verdict: 'reject', durationMs: 4_500,
			usage: { requestCount: 1, inputTokens: 12_500, outputTokens: 7, cachedTokens: 7_680, cacheWriteTokens: 0, totalNanoAiu: 2.45 * AIU },
		}),
		line('assistant.fusion_phase_completed', {
			fusionId, phaseId: `${fusionId}:repair`, phaseKind: 'repair', role: 'solver', conversationScope: 'root',
			model: 'gpt-5.6-sol', status: 'succeeded', verdict: null, durationMs: 42_000,
			usage: { requestCount: 5, inputTokens: 40_000, outputTokens: 900, cachedTokens: 30_000, cacheWriteTokens: 0, totalNanoAiu: 11.69 * AIU },
		}),
		line('session.fusion_completed', {
			fusionId, syntheticModel: 'hydrafusion', pattern: 'cascade', outcome: 'completed',
			finalSourcePhaseId: `${fusionId}:repair`, finalSourceModel: 'gpt-5.6-sol', degradedReason: null,
			phaseCount: 3, requestCount: 7, inputTokens: 53_500, outputTokens: 1007, cachedTokens: 38_380,
			cacheWriteTokens: 0, totalNanoAiu: 14.72 * AIU, durationMs: 77_000,
		}),
	].join('\n');
}

function renderCascade(overrides: { draftModel?: string } = {}): string {
	return renderHydraFusionSection(analyzeHydraFusionSession(cascadeSession(overrides)));
}

describe('formatAiu', () => {
	test('keeps two decimals for the sub-credit turns that routing produces', () => {
		assert.equal(formatAiu(0.58), '0.58');
		assert.equal(formatAiu(14.72), '14.72');
	});

	test('drops to one decimal once the number is large enough that two stop informing', () => {
		assert.equal(formatAiu(2811.93338), '2,811.9');
	});
});

describe('formatFusionDuration', () => {
	test('uses milliseconds for the sub-second legs a judge often takes', () => {
		assert.equal(formatFusionDuration(229), '229 ms');
	});

	test('uses seconds for a typical leg', () => {
		assert.equal(formatFusionDuration(42_000), '42.0 s');
	});

	test('uses minutes and seconds for a long drafting leg', () => {
		assert.equal(formatFusionDuration(106_000), '1m 46s');
		assert.equal(formatFusionDuration(120_000), '2m');
	});

	test('renders a dash rather than a misleading zero when there is no duration', () => {
		assert.equal(formatFusionDuration(0), '—');
		assert.equal(formatFusionDuration(Number.NaN), '—');
	});
});

describe('barWidthPercent', () => {
	test('scales a value against the largest in its set', () => {
		assert.equal(barWidthPercent(5, 10), 50);
		assert.equal(barWidthPercent(10, 10), 100);
	});

	test('keeps a tiny but non-zero value visible instead of collapsing the bar', () => {
		assert.equal(barWidthPercent(0.001, 1000), 2);
	});

	test('renders nothing for zero spend or an empty set', () => {
		assert.equal(barWidthPercent(0, 10), 0);
		assert.equal(barWidthPercent(5, 0), 0);
	});
});

describe('renderHydraFusionSection', () => {
	test('renders nothing for a session that never routed through HydraFusion', () => {
		assert.equal(renderHydraFusionSection(undefined), '');
	});

	test('shows the headline counts of turns, legs and models', () => {
		const html = renderCascade();
		assert.match(html, /1 turn · 3 legs · 2 models/);
	});

	test('reports the compound rate so a single-model session is not mistaken for routing', () => {
		const html = renderCascade();
		assert.match(html, /Compound turns/);
		assert.match(html, /1 of 1 turns used more than one model/);
	});

	test('shows the judge verdict split', () => {
		const html = renderCascade();
		assert.match(html, /Judge rejections/);
		assert.match(html, /1 rejected · 0 accepted/);
	});

	test('separates review spend from the credits that bought the answer', () => {
		const html = renderCascade();
		assert.match(html, /Review share/);
		// draft 0.58 + judge 2.45 were superseded by the repair leg.
		assert.match(html, /3\.03 of 14\.72 AIU/);
	});

	test('distinguishes router legs from inference calls', () => {
		assert.match(renderCascade(), /3 legs · 7 inference calls/);
	});

	test('lists every model that served a leg, with the answers it supplied', () => {
		const html = renderCascade();
		assert.match(html, /Who did the work/);
		assert.match(html, /gpt-5\.6-sol/);
		assert.match(html, /mai-code-1\.1-flash/);
	});

	test('renders the phase ledger with a badge per phase kind', () => {
		const html = renderCascade();
		assert.match(html, /Where the credits went/);
		assert.match(html, /hydra-phase-badge hydra-phase-repair">🛠️ repair/);
		assert.match(html, /hydra-phase-badge hydra-phase-review">⚖️ judge/);
	});

	test('marks the leg whose output the user actually received', () => {
		const html = renderCascade();
		assert.match(html, /hydra-leg-final/);
		assert.match(html, /hydra-final-tag[^>]*>answer</);
	});

	test('renders the verdict on the judging leg', () => {
		assert.match(renderCascade(), /hydra-verdict hydra-verdict-reject">reject</);
	});

	test('renders the pattern badge with an explanation of what it means', () => {
		const html = renderCascade();
		assert.match(html, /hydra-pattern-badge hydra-pattern-cascade/);
		assert.match(html, /a judge accepted or rejected it/);
	});

	test('shows the planned route including legs that never ran', () => {
		const skipped = cascadeSession().split('\n').filter(l => !l.includes(':repair')).join('\n');
		const html = renderHydraFusionSection(analyzeHydraFusionSession(skipped));
		assert.match(html, /primary › judge › repair/);
		assert.match(html, /1 planned leg never ran/);
	});

	test('escapes model ids so a hostile session file cannot inject markup', () => {
		const html = renderCascade({ draftModel: '<img src=x onerror=alert(1)>' });
		assert.ok(!html.includes('<img src=x'), 'raw markup from the session file must not reach the DOM');
		assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
	});

	test('surfaces a degraded turn rather than hiding the fallback', () => {
		const degraded = cascadeSession().replace('"degradedReason":null', '"degradedReason":"judge_timeout"');
		const html = renderHydraFusionSection(analyzeHydraFusionSession(degraded));
		assert.match(html, /Degraded turns/);
		assert.match(html, /judge_timeout/);
	});

	test('omits the judge card entirely when no judge ran', () => {
		const single = [
			line('session.fusion_resolved', { fusionId: 'f', pattern: 'single', phasePlan: [{ kind: 'primary' }], syntheticModel: 'hydrafusion' }),
			line('assistant.fusion_phase_completed', {
				fusionId: 'f', phaseId: 'f:phase:0', phaseKind: 'primary', role: 'solver', model: 'gpt-5.6-sol',
				status: 'succeeded', durationMs: 5_000, usage: { requestCount: 1, inputTokens: 10, outputTokens: 5, totalNanoAiu: AIU },
			}),
			line('session.fusion_completed', {
				fusionId: 'f', pattern: 'single', outcome: 'completed', finalSourcePhaseId: 'f:phase:0',
				finalSourceModel: 'gpt-5.6-sol', phaseCount: 1, requestCount: 1, totalNanoAiu: AIU, durationMs: 5_000,
			}),
		].join('\n');
		const html = renderHydraFusionSection(analyzeHydraFusionSession(single));
		assert.ok(!html.includes('Judge rejections'));
		assert.match(html, /0\.0%/); // compound rate: no turn used more than one model
	});
});
