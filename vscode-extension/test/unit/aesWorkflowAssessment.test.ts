import test from 'node:test';
import * as assert from 'node:assert/strict';

import {
	ACTIVITIES,
	AES_ASSESSMENT_SCHEMA_VERSION,
	buildAesWorkflowReport,
	classifyAesPosture,
	deepestDelegation,
	foundationsAreSolid,
	MODES,
	STOCKS,
} from '../../../src/aesWorkflowAssessment';
import { renderAesReportHtml, renderAesReportText } from '../../../src/aesWorkflowReportRenderer';
import { FABLECART_AES_ASSESSMENT } from '../../../src/aesFableCartFixture';
import type { AesDelegationLevel, AesMaturityRating, AesWorkflowAssessment } from '../../../src/types';

// ---------------------------------------------------------------------------
// Fixture builder
// ---------------------------------------------------------------------------

function makeAssessment(overrides: {
	stockRatings?: Partial<Record<(typeof STOCKS)[number], AesMaturityRating>>;
	activityDelegation?: AesDelegationLevel;
	modeDelegation?: AesDelegationLevel;
} = {}): AesWorkflowAssessment {
	const stockRating = (stock: (typeof STOCKS)[number]): AesMaturityRating =>
		overrides.stockRatings?.[stock] ?? 'strong';
	const activityDelegation = overrides.activityDelegation ?? 'human-only';
	const modeDelegation = overrides.modeDelegation ?? activityDelegation;

	return {
		schemaVersion: AES_ASSESSMENT_SCHEMA_VERSION,
		workflow: { name: 'Test workflow', description: 'A workflow used for tests.', repositories: ['org/repo'] },
		assessedAt: '2026-01-01T00:00:00.000Z',
		outcome: { customerValue: 'value', customers: 'customers' },
		activities: Object.fromEntries(ACTIVITIES.map(activity => [
			activity,
			{ description: 'd', delegation: activityDelegation, signal: 's' },
		])) as AesWorkflowAssessment['activities'],
		modes: Object.fromEntries(MODES.map(mode => [
			mode,
			{ delegation: modeDelegation },
		])) as AesWorkflowAssessment['modes'],
		stocks: Object.fromEntries(STOCKS.map(stock => [
			stock,
			{ rating: stockRating(stock), evidence: 'because' },
		])) as AesWorkflowAssessment['stocks'],
	};
}

// ---------------------------------------------------------------------------
// Posture classification
// ---------------------------------------------------------------------------

test('classifyAesPosture: strong stocks + autonomous delegation is healthy-agent-native', () => {
	const assessment = makeAssessment({ activityDelegation: 'agent-performed-autonomous' });
	assert.equal(classifyAesPosture(assessment), 'healthy-agent-native');
});

test('classifyAesPosture: strong stocks + human-only delegation is healthy-but-underused', () => {
	const assessment = makeAssessment({ activityDelegation: 'human-only' });
	assert.equal(classifyAesPosture(assessment), 'healthy-but-underused');
});

test('classifyAesPosture: a weak stock + human-only delegation is underdeveloped-foundations', () => {
	const assessment = makeAssessment({
		stockRatings: { governance: 'weak' },
		activityDelegation: 'human-only',
	});
	assert.equal(classifyAesPosture(assessment), 'underdeveloped-foundations');
});

test('classifyAesPosture: a weak stock + agent-performed delegation is stretched-agent-native', () => {
	const assessment = makeAssessment({
		stockRatings: { sharedKnowledge: 'weak' },
		activityDelegation: 'agent-performed-reviewed',
	});
	assert.equal(classifyAesPosture(assessment), 'stretched-agent-native');
});

test('classifyAesPosture: any unknown stock is unclear, even with otherwise-solid ratings', () => {
	const assessment = makeAssessment({
		stockRatings: { customerValue: 'unknown' },
		activityDelegation: 'agent-performed-autonomous',
	});
	assert.equal(classifyAesPosture(assessment), 'unclear');
});

test('classifyAesPosture: developing stocks count as solid, same as strong', () => {
	const assessment = makeAssessment({
		stockRatings: { governance: 'developing', sharedKnowledge: 'developing', customerValue: 'developing' },
		activityDelegation: 'agent-performed-autonomous',
	});
	assert.equal(classifyAesPosture(assessment), 'healthy-agent-native');
});

// ---------------------------------------------------------------------------
// Delegation / foundations helpers
// ---------------------------------------------------------------------------

test('deepestDelegation returns the most agent-delegated level across activities and modes', () => {
	const assessment = makeAssessment({ activityDelegation: 'agent-assisted', modeDelegation: 'human-only' });
	assessment.modes.performer.delegation = 'agent-performed-autonomous';
	assert.equal(deepestDelegation(assessment), 'agent-performed-autonomous');
});

test('deepestDelegation defaults to human-only when nothing is delegated', () => {
	const assessment = makeAssessment({ activityDelegation: 'human-only' });
	assert.equal(deepestDelegation(assessment), 'human-only');
});

test('foundationsAreSolid is false when any stock is weak or unknown', () => {
	assert.equal(foundationsAreSolid(makeAssessment()), true);
	assert.equal(foundationsAreSolid(makeAssessment({ stockRatings: { governance: 'weak' } })), false);
	assert.equal(foundationsAreSolid(makeAssessment({ stockRatings: { governance: 'unknown' } })), false);
});

// ---------------------------------------------------------------------------
// Report assembly
// ---------------------------------------------------------------------------

test('buildAesWorkflowReport carries the assessment through unchanged and attaches guidance', () => {
	const assessment = makeAssessment();
	const report = buildAesWorkflowReport(assessment);
	assert.equal(report.assessment, assessment);
	assert.equal(report.posture, 'healthy-but-underused');
	assert.ok(report.postureGuidance.length > 0);
	assert.equal(report.foundationsSolid, true);
	assert.equal(report.deepestDelegation, 'human-only');
});

test('FableCart fixture is internally consistent and reads as stretched-agent-native', () => {
	// The fixture is written to demonstrate the "no independent evaluator" anti-pattern
	// alongside agent-performed-reviewed delivery and a weak customer-value stock —
	// exactly the misaligned posture the framework calls out.
	const report = buildAesWorkflowReport(FABLECART_AES_ASSESSMENT);
	assert.equal(report.posture, 'stretched-agent-native');
	assert.equal(report.foundationsSolid, false);
	assert.equal(report.deepestDelegation, 'agent-performed-reviewed');
});

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------

test('renderAesReportText includes the workflow name, disclaimer, posture and supporting evidence', () => {
	const report = buildAesWorkflowReport(FABLECART_AES_ASSESSMENT);
	const text = renderAesReportText(report);
	assert.ok(text.includes('Order status API'));
	assert.ok(text.includes('team-reported self-assessment'));
	assert.ok(text.includes('Stretched agent-native'));
	assert.ok(text.includes('fablecart/order-service'));
	// The unknown Dark Factory evidence must render as unknown, never silently as present/absent.
	assert.ok(text.includes('[?]'));
});

test('renderAesReportHtml escapes assessment content and never drops an unknown evidence state', () => {
	const assessment: AesWorkflowAssessment = {
		...makeAssessment(),
		workflow: { name: '<script>alert(1)</script>', description: 'd', repositories: [] },
		supportingEvidence: [
			{ repo: 'org/repo', controlId: 'x', controlLabel: 'X', state: 'unknown', informs: 'governance' },
		],
	};
	const html = renderAesReportHtml(buildAesWorkflowReport(assessment));
	assert.ok(!html.includes('<script>alert(1)</script>'));
	assert.ok(html.includes('&lt;script&gt;'));
	assert.ok(html.includes('aes-evidence-unknown'));
	assert.ok(html.includes('(none listed)'));
});
