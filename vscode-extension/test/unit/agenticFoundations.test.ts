import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
	assessFoundations,
	buildAgenticMatrix,
	isHighAdoption,
	placeRepository,
	quadrantFor,
	stretchedPlacements,
	MIN_AGENTIC_SESSIONS,
} from '../../../src/agenticFoundations';
import { buildDarkFactoryReport, DARK_FACTORY_CONTROLS, scoreDarkFactoryReadiness } from '../../../src/darkFactoryReadiness';
import type { DarkFactoryControlState, DarkFactoryRepoReport } from '../../../src/types';
import { activityReport, repoRow } from './agenticFixtures';

/** A real scored report: every filesystem control of stage 1–3 set to `state`, with overrides. */
function scanned(nameWithOwner: string | undefined, state: DarkFactoryControlState, overrides: Record<string, DarkFactoryControlState> = {}): DarkFactoryRepoReport {
	const observations: Record<string, { state: DarkFactoryControlState }> = {};
	for (const control of DARK_FACTORY_CONTROLS) {
		if (control.tier === 'filesystem' && control.stage <= 3) { observations[control.id] = { state }; }
	}
	for (const [id, s] of Object.entries(overrides)) { observations[id] = { state: s }; }
	return scoreDarkFactoryReadiness({ name: nameWithOwner?.split('/')[1] ?? 'folder', repoRoot: '/r', nameWithOwner, observations });
}

test('assessFoundations: all observable controls present is strong, and unknowns are excluded from the score', () => {
	const result = assessFoundations(scanned('o/r', 'present'));
	assert.equal(result.level, 'strong');
	assert.equal(result.score, 1);
	assert.ok(result.unknown > 0, 'API and governance controls stay unknown');
	assert.deepEqual(result.missing, []);
});

test('assessFoundations: a confirmed stage of 0 can still be strong foundations', () => {
	const report = scanned('o/r', 'present');
	assert.ok(report.confirmedStage <= 1, 'ai-policy is always unknown, so the confirmed stage stays low');
	assert.equal(assessFoundations(report).level, 'strong');
});

test('assessFoundations: all absent is weak and lists missing controls lowest stage first', () => {
	const result = assessFoundations(scanned('o/r', 'absent'));
	assert.equal(result.level, 'weak');
	assert.equal(result.score, 0);
	assert.equal(result.missing[0].stage, 1);
	assert.ok(result.missing.every((c, i) => i === 0 || result.missing[i - 1].stage <= c.stage));
});

test('assessFoundations: no tests in CI makes foundations weak even with a high score', () => {
	assert.equal(assessFoundations(scanned('o/r', 'present', { 'ci-test-execution': 'absent' })).level, 'weak');
});

test('assessFoundations: no instruction file of either kind is weak; one of the two is enough', () => {
	assert.equal(assessFoundations(scanned('o/r', 'present', { 'agent-instructions': 'absent', 'copilot-instructions': 'absent' })).level, 'weak');
	assert.equal(assessFoundations(scanned('o/r', 'present', { 'agent-instructions': 'absent' })).level, 'strong');
});

test('assessFoundations: too few observed controls is unassessed, never weak', () => {
	const report = scoreDarkFactoryReadiness({ name: 'r', repoRoot: '/r', nameWithOwner: 'o/r', observations: { 'ci-workflows': { state: 'absent' } } });
	const result = assessFoundations(report);
	assert.equal(result.level, 'unassessed');
	assert.equal(result.observed, 1);
});

test('isHighAdoption: needs both the session floor and the share', () => {
	assert.equal(isHighAdoption({ agenticSessions: MIN_AGENTIC_SESSIONS, sessions: 10 }), true);
	assert.equal(isHighAdoption({ agenticSessions: MIN_AGENTIC_SESSIONS - 1, sessions: 5 }), false);
	assert.equal(isHighAdoption({ agenticSessions: 5, sessions: 100 }), false);
	assert.equal(isHighAdoption(undefined), false);
});

test('quadrantFor: every quadrant, and partial foundations lean to the nearer side', () => {
	const strong = { level: 'strong' as const, score: 0.9, observed: 10, unknown: 0, missing: [] };
	const weak = { level: 'weak' as const, score: 0.2, observed: 10, unknown: 0, missing: [] };
	assert.deepEqual(quadrantFor(strong, true), { quadrant: 'healthy-agent-native', leaning: false });
	assert.deepEqual(quadrantFor(strong, false), { quadrant: 'healthy-underused', leaning: false });
	assert.deepEqual(quadrantFor(weak, true), { quadrant: 'stretched', leaning: false });
	assert.deepEqual(quadrantFor(weak, false), { quadrant: 'underdeveloped', leaning: false });
	assert.deepEqual(quadrantFor({ ...weak, level: 'partial', score: 0.6 }, true), { quadrant: 'healthy-agent-native', leaning: true });
	assert.deepEqual(quadrantFor({ ...weak, level: 'partial', score: 0.5 }, true), { quadrant: 'stretched', leaning: true });
	assert.deepEqual(quadrantFor({ ...weak, level: 'unassessed' }, true), { leaning: false });
});

test('placeRepository: a scan without an owner/repo is not placed, since adoption cannot be matched', () => {
	const placement = placeRepository(scanned(undefined, 'absent'), undefined);
	assert.equal(placement.quadrant, undefined);
	assert.equal(placement.unassessedReason, 'no-remote');
});

test('buildAgenticMatrix: joins scans to activity case-insensitively and lists adoption-only repositories', () => {
	const readiness = buildDarkFactoryReport([scanned('Owner/Weak', 'absent'), scanned('owner/strong', 'present')], { scannedAt: 'x', apiSignalsIncluded: false });
	const activity = activityReport([
		repoRow('owner/weak', { sessions: 10, agenticSessions: 8 }),
		repoRow('owner/strong', { sessions: 10, agenticSessions: 1 }),
		repoRow('elsewhere/repo', { sessions: 4, agenticSessions: 3 }),
		repoRow('elsewhere/chat', { sessions: 4, agenticSessions: 0 }),
	]);
	const matrix = buildAgenticMatrix(readiness, activity);
	const byName = Object.fromEntries(matrix.placements.map(p => [p.repository, p]));
	assert.equal(byName['Owner/Weak'].quadrant, 'stretched');
	assert.equal(byName['owner/strong'].quadrant, 'healthy-underused');
	assert.deepEqual(matrix.adoptionOnly.map(r => r.repository), ['elsewhere/repo']);
	assert.deepEqual(stretchedPlacements(matrix).map(p => p.repository), ['Owner/Weak']);
});

test('buildAgenticMatrix: a scanned repository with no sessions is low adoption, not missing', () => {
	const readiness = buildDarkFactoryReport([scanned('o/quiet', 'absent')], { scannedAt: 'x', apiSignalsIncluded: false });
	const matrix = buildAgenticMatrix(readiness, null);
	assert.equal(matrix.placements[0].quadrant, 'underdeveloped');
	assert.equal(matrix.placements[0].sessions, 0);
});

test('stretchedPlacements: leaning placements do not count', () => {
	const matrix = { windowDays: 30, adoptionOnly: [], placements: [
		{ ...placeRepository(scanned('o/a', 'absent'), repoRow('o/a', { sessions: 10, agenticSessions: 10 })) },
		{ ...placeRepository(scanned('o/b', 'absent'), repoRow('o/b', { sessions: 10, agenticSessions: 10 })), leaning: true },
	] };
	assert.deepEqual(stretchedPlacements(matrix).map(p => p.repository), ['o/a']);
});

test('assessFoundations: one missing stage-1 control does not rule out strong foundations', () => {
	const report = scanned('o/lib', 'present', { 'infrastructure-as-code': 'absent' });
	assert.ok(report.ceilingStage < 2, 'the readiness band is blocked at stage 1');
	assert.equal(assessFoundations(report).level, 'strong');
});
