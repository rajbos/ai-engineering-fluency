import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';

import { buildDarkFactoryChatPrompt, buildDarkFactorySectionHtml } from '../../src/webview/usage/darkFactorySection';
import { buildDarkFactoryReport, scoreDarkFactoryReadiness, type DarkFactoryObservation } from '../../../src/darkFactoryReadiness';
import type { DarkFactoryReport } from '../../../src/types';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

function repoReport(overrides: {
	name?: string;
	nameWithOwner?: string;
	hosting?: 'github' | 'other' | 'unknown';
	observations?: Record<string, DarkFactoryObservation>;
	facts?: { writeAllWorkflows?: string[] };
} = {}) {
	return scoreDarkFactoryReadiness({
		name: overrides.name ?? 'demo',
		repoRoot: '/tmp/demo',
		nameWithOwner: overrides.nameWithOwner,
		hosting: overrides.hosting,
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
		assert.match(html, /A checklist, not a green light/);
		assert.match(html, /Stage 5 is not\./);
	});

	test('renders each repository as a collapsed row whose summary carries the overview', () => {
		const html = buildDarkFactorySectionHtml(report([
			repoReport({ name: 'alpha', observations: { 'dependabot': { state: 'absent', detail: 'none' } } }),
			repoReport({ name: 'beta', facts: { writeAllWorkflows: ['release.yml'] } }),
		]));
		const cards = html.match(/<details class="df-repo-card" data-df-repo="\d+">/g) ?? [];
		assert.equal(cards.length, 2);
		assert.equal(/<details class="df-repo-card" open/.test(html), false);
		const summary = html.slice(html.indexOf('<summary class="df-repo-summary">'), html.indexOf('</summary>', html.indexOf('df-repo-summary')));
		assert.match(summary, /alpha/);
		assert.match(summary, /Stage 0 confirmed/);
		assert.match(summary, /missing for Stage 1/);
		assert.match(summary, /unchecked/);
		assert.equal(summary.includes('df-ladder'), false, 'the ladder lives in the expandable body');
		assert.match(html, /1 anti-pattern</);
	});

	test('tallies every scanned repository in a one-line overview', () => {
		const html = buildDarkFactorySectionHtml(report([
			repoReport({ name: 'a' }),
			repoReport({ name: 'b', facts: { writeAllWorkflows: ['release.yml'] } }),
		]));
		assert.match(html, /<strong>2<\/strong> repositories scanned/);
		assert.match(html, /<strong>2<\/strong> at Stage 0/);
		assert.match(html, /<strong>1<\/strong> with anti-patterns/);
	});

	test('keeps the full explanation behind a collapsed "What this measures" toggle', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()]));
		assert.match(html, /<details class="df-about">\s*<summary>📋 What this measures<\/summary>/);
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
			observations: { 'dependabot': { state: 'absent', detail: 'none' } },
		})]));
		assert.match(html, /<li class="df-control df-state-absent">[\s\S]*?Automated dependency updates[\s\S]*?Add \.github\/dependabot\.yml/);
		assert.match(html, /1 missing/);
	});

	test('lists unchecked controls with the reason they could not be checked', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()]));
		assert.match(html, /<li class="df-control df-state-unknown">[\s\S]*?Needs a GitHub token/);
	});

	test('shows every stage and every control, so progress beyond the confirmed stage is visible', () => {
		const repo = repoReport({
			observations: {
				'ci-workflows': { state: 'absent', detail: 'none' },
				'copilot-instructions': { state: 'present', detail: '.github/copilot-instructions.md' },
				'agent-instructions': { state: 'present', detail: 'AGENTS.md' },
				'scoped-instructions': { state: 'absent', detail: 'none' },
			},
		});
		assert.equal(repo.confirmedStage, 0);
		const html = buildDarkFactorySectionHtml(report([repo]));
		for (const control of repo.controls) {
			assert.ok(html.includes(`>${control.label.replace(/&/g, '&amp;')}</span>`), `${control.id} should be listed`);
		}
		for (const name of ['Standardized software delivery', 'AI-assisted engineers', 'Agent-delegated, human-reviewed', 'Spec-driven autonomous team', 'Bounded dark factory']) {
			assert.ok(html.includes(name), `stage "${name}" should be listed`);
		}
		// Stage 2 is not the next stage, yet its two satisfied controls are counted.
		const ladder = html.slice(html.indexOf('class="df-ladder"'));
		const stage2 = ladder.slice(ladder.indexOf('AI-assisted engineers'), ladder.indexOf('Agent-delegated, human-reviewed'));
		assert.match(stage2, /2 of 4 in place/);
		assert.match(stage2, /1 missing/);
		assert.match(stage2, /df-state-present[\s\S]*?AGENTS\.md/);
		assert.match(html, /Not assessed by this scan/);
	});

	test('opens only the stage to work on next', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()]));
		assert.equal((html.match(/<details class="df-stage" open>/g) ?? []).length, 1);
		assert.equal((html.match(/<details class="df-stage"/g) ?? []).length, 4);
		assert.match(html, /<details class="df-stage" open>[\s\S]*?Standardized software delivery[\s\S]*?Next stage/);
	});

	test('marks recommended controls and leaves them out of the stage progress', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: { 'devcontainer': { state: 'absent', detail: 'none' } },
		})]));
		const row = html.slice(html.indexOf('Reproducible environment'));
		assert.match(row.slice(0, row.indexOf('</li>')), /class="df-tag"[^>]*>Recommended</);
		assert.match(html, /<li class="df-control df-state-advisory">\s*<span class="df-state-icon codicon codicon-warning"/, 'advice, not a blocker');
		const ladder = html.slice(html.indexOf('class="df-ladder"'));
		const stage1 = ladder.slice(ladder.indexOf('Standardized software delivery'), ladder.indexOf('AI-assisted engineers'));
		assert.match(stage1, /0 of 6 in place/);
		assert.equal(/\d+ missing/.test(stage1), false, 'a missing recommended control is not a stage blocker');
	});

	test('shows a control that does not apply as such, outside the progress count', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: { 'infrastructure-as-code': { state: 'not-applicable', detail: 'No workflow deploys.' } },
		})]));
		assert.match(html, /<li class="df-control df-state-na">[\s\S]*?title="Not applicable"[\s\S]*?Infrastructure as code[\s\S]*?No workflow deploys\./);
		assert.match(html, /0 of 5 in place/);
	});

	test('says when GitHub-specific checks were skipped because the remote is elsewhere', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({ hosting: 'other' })]));
		assert.match(html, /remote is not on GitHub/);
		assert.equal(/no GitHub remote resolved/.test(html), false);
	});

	test('marks heuristic controls so a pattern match is not read as a verdict', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: { 'ci-test-execution': { state: 'absent', detail: 'none' } },
		})]));
		assert.match(html, /df-heuristic/);
	});

	test('renders detected anti-patterns with their severity', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			facts: { writeAllWorkflows: ['release.yml'] },
		})]));
		assert.match(html, /Anti-patterns detected/);
		assert.match(html, /Workflows run with unbounded permissions/);
	});

	test('reports the repositories it did not scan rather than truncating silently', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()], { skippedRepoCount: 7 }));
		assert.match(html, /7 further repositories were found but not scanned/);
	});

	test('uses the singular when exactly one repository was skipped', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()], { skippedRepoCount: 1 }));
		assert.match(html, /1 further repository was found but not scanned/);
	});

	test('says nothing about skipped repositories when none were skipped', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()], { skippedRepoCount: 0 }));
		assert.equal(/further repositor/.test(html), false);
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
			observations: { 'dependabot': { state: 'unknown', detail: '<script>alert(3)</script>' } },
		})]));
		assert.equal(html.includes('<script>alert(3)</script>'), false);
	});
});

describe('Copilot Chat action', () => {
	const dependabotAbsent = { 'dependabot': { state: 'absent' as const, detail: 'none' } };

	test('offers a checked selection box for each missing control and anti-pattern, not for unchecked controls', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: dependabotAbsent,
			facts: { writeAllWorkflows: ['release.yml'] },
		})]));
		assert.match(html, /class="df-pick" data-df-kind="control" data-df-id="dependabot" checked/);
		assert.match(html, /class="df-pick" data-df-kind="finding" data-df-id="[^"]+" checked/);
		assert.equal((html.match(/data-df-kind="control"/g) ?? []).length, 1, 'only the missing control is selectable');
		assert.match(html, /class="button df-chat-btn" data-df-repo="0"/);
	});

	test('offers missing controls of later stages and recommended ones unselected', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: {
				...dependabotAbsent,
				'devcontainer': { state: 'absent', detail: 'none' },
				'scoped-instructions': { state: 'absent', detail: 'none' },
			},
		})]));
		assert.match(html, /data-df-id="dependabot" checked/);
		assert.match(html, /data-df-id="devcontainer" aria-label/);
		assert.match(html, /data-df-id="scoped-instructions" aria-label/);
	});

	test('offers the action for a gap in a later stage even when the next stage has none', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport({
			observations: { 'scoped-instructions': { state: 'absent', detail: 'none' } },
		})]));
		assert.match(html, /df-chat-btn/);
	});

	test('omits the action when there is nothing to implement', () => {
		const html = buildDarkFactorySectionHtml(report([repoReport()]));
		assert.equal(html.includes('df-chat-btn'), false);
	});

	test('builds a prompt naming the repository and only the selected items', () => {
		const repo = repoReport({
			nameWithOwner: 'rajbos/demo',
			observations: { ...dependabotAbsent, 'ci-test-execution': { state: 'absent', detail: 'none' }, 'devcontainer': { state: 'absent', detail: 'none' } },
			facts: { writeAllWorkflows: ['release.yml'] },
		});
		const prompt = buildDarkFactoryChatPrompt(repo, ['dependabot', 'devcontainer'], [repo.findings[0].id]);
		assert.ok(prompt);
		assert.match(prompt, /rajbos\/demo \(\/tmp\/demo\)/);
		assert.match(prompt, /Automated dependency updates \(Stage 1\): Add \.github\/dependabot\.yml/);
		assert.match(prompt, /Reproducible environment \(Stage 1, recommended\)/);
		assert.match(prompt, /Workflows run with unbounded permissions/);
		assert.equal(prompt.includes('Tests executed in CI'), false);
		assert.match(prompt, /Do not claim the repository is ready/);
	});

	test('ignores ids that are unknown or not absent, and returns nothing for an empty selection', () => {
		const repo = repoReport({ observations: dependabotAbsent });
		assert.equal(buildDarkFactoryChatPrompt(repo, [], []), undefined);
		assert.equal(buildDarkFactoryChatPrompt(repo, ['not-a-control', 'required-reviews'], ['nope']), undefined);
	});
});
