import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';

import { buildAesSectionHtml } from '../../src/webview/maturity/aesSection';
import { buildAesWorkflowReport } from '../../../src/aesWorkflowAssessment';
import { FABLECART_AES_ASSESSMENT } from '../../../src/aesFableCartFixture';
import type { AesWorkflowAssessment } from '../../../src/types';

const BASE_ASSESSMENT: AesWorkflowAssessment = FABLECART_AES_ASSESSMENT;

describe('buildAesSectionHtml', () => {
	test('renders nothing when no assessment is available — an absent report is not an empty one', () => {
		assert.equal(buildAesSectionHtml(undefined), '');
	});

	test('renders the workflow identity, repositories and outcome', () => {
		const html = buildAesSectionHtml(buildAesWorkflowReport(BASE_ASSESSMENT));
		assert.match(html, /Order status API/);
		assert.match(html, /fablecart\/order-service/);
		assert.match(html, /fablecart\/storefront-web/);
		assert.match(html, /Customers stop contacting support/);
	});

	test('renders the classified posture and its guidance, never a raw enum value', () => {
		const report = buildAesWorkflowReport(BASE_ASSESSMENT);
		const html = buildAesSectionHtml(report);
		assert.equal(report.posture, 'stretched-agent-native');
		assert.match(html, /Stretched agent-native/);
		assert.match(html, /aes-posture-stretched/);
		assert.match(html, new RegExp(report.postureGuidance.slice(0, 20)));
	});

	test('keeps supporting evidence states honest — present, absent and unknown are all shown distinctly', () => {
		const html = buildAesSectionHtml(buildAesWorkflowReport(BASE_ASSESSMENT));
		assert.match(html, /aes-evidence-present/);
		assert.match(html, /aes-evidence-absent/);
		assert.match(html, /aes-evidence-unknown/);
		assert.match(html, /CI runs a test suite/);
		assert.match(html, /Independent evaluator agent/);
		assert.match(html, /Code scanning \(CodeQL\)/);
	});

	test('renders every stock, activity and mode with its rating or delegation label', () => {
		const html = buildAesSectionHtml(buildAesWorkflowReport(BASE_ASSESSMENT));
		assert.match(html, /Governance/);
		assert.match(html, /Shared knowledge/);
		assert.match(html, /Customer value/);
		assert.match(html, /Developing/);
		assert.match(html, /Weak/);
		assert.match(html, /Define — decide what should happen/);
		assert.match(html, /Deliver — make the change/);
		assert.match(html, /Detect — observe what happened/);
		assert.match(html, /Director — sets direction/);
		assert.match(html, /Performer — carries out the work/);
		assert.match(html, /Assessor — evaluates the result/);
	});

	test('escapes team-authored free text so it cannot inject markup into the webview', () => {
		const assessment: AesWorkflowAssessment = {
			...BASE_ASSESSMENT,
			workflow: {
				...BASE_ASSESSMENT.workflow,
				name: '<img src=x onerror=alert(1)>',
				description: 'Safe & <b>sound</b>',
			},
		};
		const html = buildAesSectionHtml(buildAesWorkflowReport(assessment));
		assert.doesNotMatch(html, /<img src=x/);
		assert.match(html, /&lt;img src=x onerror=alert\(1\)&gt;/);
		assert.match(html, /Safe &amp; &lt;b&gt;sound&lt;\/b&gt;/);
	});

	test('renders notes only when present', () => {
		const withNotes = buildAesSectionHtml(buildAesWorkflowReport(BASE_ASSESSMENT));
		assert.match(withNotes, /This is a fictional fixture/);

		const { notes: _notes, ...withoutNotesFields } = BASE_ASSESSMENT;
		const withoutNotes = buildAesSectionHtml(buildAesWorkflowReport(withoutNotesFields as AesWorkflowAssessment));
		assert.doesNotMatch(withoutNotes, /This is a fictional fixture/);
	});
});
