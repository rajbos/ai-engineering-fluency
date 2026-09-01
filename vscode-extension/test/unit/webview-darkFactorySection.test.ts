import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';

import { buildDarkFactorySectionHtml } from '../../src/webview/maturity/darkFactorySection';
import { buildDarkFactoryReport, scoreDarkFactoryReadiness, type DarkFactoryObservation } from '../../../src/darkFactoryReadiness';
import type { DarkFactoryReport } from '../../../src/types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function repoReport(overrides: {
	name?: string;
	nameWithOwner?: string;
	observations?: Record<string, DarkFactoryObservation>;
	facts?: { agentFileNames?: string[]; writeAllWorkflows?: string[] };
} = {}) {
	return scoreDarkFactoryReadiness({
		name: overrides.name ?? 'demo',
		repoRoot: '/tmp/demo',
		nameWithOwner: overrides.nameWithOwner,
		observations: overrides.observations ?? {},
		facts: overrides.facts,
	});
}

function report(repos: ReturnType<typeof repoReport>[], options: Partial<DarkFactoryReport> = {}): DarkFactoryReport {
	return {
		...buildDarkFactoryReport(repos, {
			scannedAt: '2026-09-01T12:00:00.000Z',
			apiSignalsIncluded: false,
			skippedRepoCount: 0,
		}),
		...options,
	};
}

describe('buildDarkFactorySectionHtml', () => {
	test('renders nothing when no scan ran — an absent scan is not an empty repository', () => {
		assert.equal(buildDarkFactorySectionHtml(undefined), '');
	});

	test('renders an explicit empty state when the workspace has no repositories', () => {
		const html = buildDarkFactorySectionHtml(report([]));
		assert.match(html, /No git repositories were found/);
		assert.match(html, /never people/);
	});

	test('states that readiness is per repository and that stage 5 is never awarded', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()]));
		assert.match(html, /per repository and never per person/);
		assert.match(html, /never tells you that you are ready to go dark/);
		assert.match(html, /Stage 5 is not\./);
	});

	test('shows the confirmed/ceiling band when evidence is incomplete', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()]));
		assert.match(html, /Stage 0 confirmed/);
		assert.match(html, /control\(s\) not checked/);
	});

	test('explains that missing API evidence means unchecked, not missing', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()], { apiSignalsIncluded: false }));
		assert.match(html, /reported as unchecked rather than missing/);
	});

	test('says when pull-request evidence was included', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()], { apiSignalsIncluded: true }));
		assert.match(html, /Pull-request evidence/);
	});

	test('lists the specific controls blocking the next stage together with their remediation', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: { 'codeowners': { state: 'absent', detail: 'none' } },
		})]));
		assert.match(html, /Missing for Stage 1/);
		assert.match(html, /CODEOWNERS/);
		assert.match(html, /Add a CODEOWNERS file/);
	});

	test('lists unchecked controls with the reason they could not be checked', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()]));
		assert.match(html, /Could not check for Stage 1/);
		assert.match(html, /Needs a GitHub token/);
	});

	test('marks heuristic controls so a pattern match is not read as a verdict', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: { 'ci-test-execution': { state: 'absent', detail: 'none' } },
		})]));
		assert.match(html, /df-heuristic/);
	});

	test('renders detected anti-patterns with their severity', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			facts: { agentFileNames: ['refactor.agent.md'] },
		})]));
		assert.match(html, /Anti-patterns detected/);
		assert.match(html, /No independent evaluator agent/);
	});

	test('reports the repositories it did not scan rather than truncating silently', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()], { skippedRepoCount: 7 }));
		assert.match(html, /7 further repository/);
	});

	test('marks a repository whose GitHub remote could not be resolved', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({ nameWithOwner: undefined })]));
		assert.match(html, /no GitHub remote resolved/);
	});

	test('shows owner/repo when it is known', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({ nameWithOwner: 'rajbos/demo' })]));
		assert.match(html, /rajbos\/demo/);
	});

	test('escapes repository names so a hostile folder name cannot inject markup', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			name: '<img src=x onerror="alert(1)">',
			nameWithOwner: '"><script>alert(2)</script>',
		})]));
		assert.equal(html.includes('<img'), false);
		assert.equal(html.includes('<script>'), false);
		assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
		assert.match(html, /&lt;script&gt;alert\(2\)/);
	});

	test('escapes control detail text coming from the filesystem', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: { 'codeowners': { state: 'unknown', detail: '<script>alert(3)</script>' } },
		})]));
		assert.equal(html.includes('<script>alert(3)</script>'), false);
	});
});
