import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
	buildCorrectionsRepoSummaryHtml,
	buildParticipationModesCardHtml,
	buildRevertCellHtml,
	sanitizePrOutcomeCounts,
	isDelegationWithoutAssessment,
	sanitizeActivityTotals,
	sanitizeRepoActivity,
	MIN_MODE_TURNS,
} from '../../src/webview/usage/agenticSignals';
import { activityReport, repoRow, totals } from './agenticFixtures';

test('sanitizeRepoActivity: accepts a well-formed report and keeps valid knowledge', () => {
	const raw = JSON.parse(JSON.stringify(activityReport([
		repoRow('o/r', { sessions: 3, sessionsWithTurnDetail: 2, knowledge: { instructionFiles: 2, staleInstructionFiles: 1 } }),
	])));
	const report = sanitizeRepoActivity(raw);
	assert.ok(report);
	assert.equal(report.repos.length, 1);
	assert.deepEqual(report.repos[0].knowledge, { instructionFiles: 2, staleInstructionFiles: 1 });
});

test('sanitizeRepoActivity: drops malformed rows and incoherent knowledge, rejects malformed roots', () => {
	const good = repoRow('o/good', { sessions: 1 });
	const badKnowledge = { ...repoRow('o/k', { sessions: 1 }), knowledge: { instructionFiles: 1, staleInstructionFiles: 5 } };
	const raw = { ...activityReport([good]), repos: [good, { ...good, sessions: -1 }, { key: 1 }, badKnowledge] };
	const report = sanitizeRepoActivity(raw);
	assert.ok(report);
	assert.deepEqual(report.repos.map(r => r.key), ['o/good', 'o/k']);
	assert.equal(report.repos[1].knowledge, undefined);
	assert.equal(sanitizeRepoActivity(null), null);
	assert.equal(sanitizeRepoActivity({ repos: 'x' }), null);
	assert.equal(sanitizeRepoActivity({ ...activityReport([]), totals: { sessions: 'x' } }), null);
});

test('sanitizeActivityTotals: requires scoping and modes', () => {
	assert.ok(sanitizeActivityTotals(totals()));
	assert.equal(sanitizeActivityTotals({ ...totals(), modes: undefined }), null);
	assert.equal(sanitizeActivityTotals({ ...totals(), scoping: { underScoped: 1 } }), null);
});

test('buildCorrectionsRepoSummaryHtml: renders rates, unknown knowledge and the unattributed share', () => {
	const report = activityReport([
		repoRow('o/a', { sessions: 12, sessionsWithTurnDetail: 10, correctionMoments: 5, editTurns: 10, oneShotEditTurns: 7, toolCalls: 30, knowledge: { instructionFiles: 0, staleInstructionFiles: 0 } }),
		repoRow('o/b', { sessions: 2, sessionsWithTurnDetail: 2 }),
		repoRow('o/no-detail', { sessions: 4, sessionsWithTurnDetail: 0 }),
	], { unattributed: totals({ sessions: 3 }) });
	report.totals.sessions = 21;
	const html = buildCorrectionsRepoSummaryHtml(report);
	assert.match(html, /id="corrections-repo-summary"/);
	assert.match(html, /o\/a/);
	assert.match(html, /10 \/ 12/);
	assert.match(html, /0\.50/);
	assert.match(html, /70%/);
	assert.match(html, /not scanned/);
	assert.doesNotMatch(html, /o\/no-detail/, 'repositories with no turn detail have no rates to show');
	assert.match(html, /3 of 21 sessions/);
	assert.match(html, /comparison appears once/);
});

test('buildCorrectionsRepoSummaryHtml: escapes repository names and is empty without data', () => {
	const html = buildCorrectionsRepoSummaryHtml(activityReport([repoRow('o/<script>', { sessions: 1, sessionsWithTurnDetail: 1 })]));
	assert.ok(!html.includes('<script>'), 'raw tag must not reach the HTML');
	assert.ok(html.includes('o/&lt;script&gt;'), 'the name is escaped instead');
	assert.equal(buildCorrectionsRepoSummaryHtml(null), '');
	assert.equal(buildCorrectionsRepoSummaryHtml(activityReport([])), '');
});

test('buildParticipationModesCardHtml: hidden below the minimum turn count', () => {
	const report = activityReport([repoRow('o/a', { sessions: 5, modes: { director: 1, performer: MIN_MODE_TURNS - 3, assessor: 1 } })]);
	assert.equal(buildParticipationModesCardHtml(report), '');
	assert.equal(buildParticipationModesCardHtml(null), '');
});

test('buildParticipationModesCardHtml: shows shares and calls out delegation without assessment', () => {
	const report = activityReport([repoRow('o/a', { sessions: 10, delegationSessions: 5, modes: { director: 10, performer: 29, assessor: 1 } })]);
	const html = buildParticipationModesCardHtml(report);
	assert.match(html, /id="participation-modes-card"/);
	assert.match(html, /Director/);
	assert.match(html, /73%/);
	assert.match(html, /50% of your sessions hand work to agents, but only 3% of turns check the result/);
});

test('isDelegationWithoutAssessment: needs both high delegation and a thin assessor share', () => {
	const base = { sessions: 10, modes: { director: 10, performer: 20, assessor: 10 } };
	assert.equal(isDelegationWithoutAssessment(totals({ ...base, delegationSessions: 5 })), false);
	assert.equal(isDelegationWithoutAssessment(totals({ sessions: 10, delegationSessions: 1, modes: { director: 10, performer: 29, assessor: 1 } })), false);
	assert.equal(isDelegationWithoutAssessment(totals({ sessions: 10, delegationSessions: 5, modes: { director: 10, performer: 29, assessor: 1 } })), true);
});


test('sanitizePrOutcomeCounts: keeps coherent pairs only', () => {
	assert.deepEqual(sanitizePrOutcomeCounts({ aiMergedPrs: 4, aiRevertedPrs: 1, otherMergedPrs: 10, otherRevertedPrs: 11 }), { aiMergedPrs: 4, aiRevertedPrs: 1 });
	assert.deepEqual(sanitizePrOutcomeCounts({}), {});
});

test('buildRevertCellHtml: agent reverted / merged with the baseline rate, dash for old snapshots', () => {
	const html = buildRevertCellHtml({ aiMergedPrs: 4, aiRevertedPrs: 1, otherMergedPrs: 20, otherRevertedPrs: 1 });
	assert.match(html, /1 \/ 4/);
	assert.match(html, /warning-fg/);
	assert.match(html, /others: 5%/);
	assert.equal(buildRevertCellHtml({}), '—');
	assert.match(buildRevertCellHtml({ otherMergedPrs: 0, otherRevertedPrs: 0 }), /others: —/);
});
