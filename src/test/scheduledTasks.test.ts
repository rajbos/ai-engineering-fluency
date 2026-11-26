import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
	assessScheduledTaskHealth,
	attachRunSessions,
	failedRunCost,
	sessionIdFromFile,
	isAtRisk,
	mergeScheduledTasks,
	recentSuccessRate,
	scheduledTaskFindings,
	scheduledTasksForRepo,
	scheduledTaskKey,
	trackFailingTasks,
	FAILING_MIN_RUNS,
	RECENT_RUN_LIMIT,
	STALE_AFTER_DAYS,
} from '../scheduledTasks';
import type { ScheduledTaskDefinition, ScheduledTaskRun, ScheduledTaskSummary } from '../types';

const NOW = new Date('2026-11-24T12:00:00.000Z');
const daysAgo = (days: number) => new Date(NOW.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
const runs = (pattern: string): ScheduledTaskRun[] => [...pattern].map((c, i) => ({ at: daysAgo(i + 1), ok: c === '✓' }));

function def(overrides: Partial<ScheduledTaskDefinition> = {}): ScheduledTaskDefinition {
	return {
		name: 'repo-health-scan-daily',
		platform: 'claude',
		schedule: '0 8 * * *',
		enabled: true,
		folder: 'C:\\code\\app',
		repository: 'octo/app',
		createdAt: daysAgo(90),
		lastRunAt: daysAgo(1),
		totalRuns: 3,
		failedRuns: 0,
		recentRuns: runs('✓✓✓'),
		...overrides,
	};
}

test('assessScheduledTaskHealth: healthy, disabled, one-off and manual', () => {
	assert.equal(assessScheduledTaskHealth(def(), NOW), 'healthy');
	assert.equal(assessScheduledTaskHealth(def({ enabled: false, lastRunAt: daysAgo(200) }), NOW), 'disabled', 'disabled is never a risk');
	assert.equal(assessScheduledTaskHealth(def({ enabled: false, oneOff: true, lastRunAt: daysAgo(200) }), NOW), 'one-off');
	assert.equal(assessScheduledTaskHealth(def({ manual: true, lastRunAt: daysAgo(200) }), NOW), 'manual');
});

test('assessScheduledTaskHealth: stale past STALE_AFTER_DAYS, or never run long after creation', () => {
	assert.equal(STALE_AFTER_DAYS, 30);
	assert.equal(assessScheduledTaskHealth(def({ lastRunAt: daysAgo(30) }), NOW), 'healthy', 'exactly 30 days is not yet stale');
	assert.equal(assessScheduledTaskHealth(def({ lastRunAt: daysAgo(31) }), NOW), 'stale');
	assert.equal(assessScheduledTaskHealth(def({ lastRunAt: null, recentRuns: [], createdAt: daysAgo(5) }), NOW), 'never-run');
	assert.equal(assessScheduledTaskHealth(def({ lastRunAt: null, recentRuns: [], createdAt: daysAgo(45) }), NOW), 'stale');
	assert.equal(assessScheduledTaskHealth(def({ lastRunAt: null, recentRuns: [], createdAt: null }), NOW), 'never-run');
	// Stale wins over failing: not running at all is the bigger problem.
	assert.equal(assessScheduledTaskHealth(def({ lastRunAt: daysAgo(40), recentRuns: runs('✗✗✗') }), NOW), 'stale');
});

test('assessScheduledTaskHealth: failing below half success, once there are enough runs', () => {
	assert.equal(FAILING_MIN_RUNS, 3);
	assert.equal(assessScheduledTaskHealth(def({ recentRuns: runs('✗✗') }), NOW), 'healthy', 'two failures are too few to judge');
	assert.equal(assessScheduledTaskHealth(def({ recentRuns: runs('✗✗✓') }), NOW), 'failing');
	assert.equal(assessScheduledTaskHealth(def({ recentRuns: runs('✗✓✗✓') }), NOW), 'healthy', 'exactly half is not failing');
	assert.equal(recentSuccessRate([]), null);
	assert.equal(recentSuccessRate(runs('✓✗✓✓')), 0.75);
});

test('mergeScheduledTasks: keeps defined tasks without runs, joins observed counts, and takes the later last run', () => {
	const observed: ScheduledTaskSummary[] = [
		{ name: 'repo-health-scan-daily', platform: 'claude', runCount: 4, activeDays: 4, lastRun: daysAgo(0.5) },
		{ name: 'only-seen', platform: 'claude', runCount: 2, activeDays: 2, lastRun: daysAgo(3) },
	];
	const merged = mergeScheduledTasks(observed, [
		def(),
		def({ name: 'nightly', platform: 'copilot', lastRunAt: daysAgo(60), recentRuns: runs('✓'.repeat(12)) }),
		def({ name: 'old', enabled: false, lastRunAt: daysAgo(90) }),
	], NOW);
	assert.deepEqual(merged.map(t => `${t.name}:${t.health ?? '-'}`), ['nightly:stale', 'repo-health-scan-daily:healthy', 'only-seen:-', 'old:disabled']);
	const health = merged.find(t => t.name === 'repo-health-scan-daily')!;
	assert.equal(health.runCount, 4);
	assert.equal(health.lastRun, daysAgo(0.5), 'a run seen in the sessions is newer than the app record');
	assert.equal(health.repository, 'octo/app');
	const nightly = merged.find(t => t.name === 'nightly')!;
	assert.equal(nightly.runCount, 0);
	assert.equal(nightly.recentRuns!.length, RECENT_RUN_LIMIT);
	assert.ok(isAtRisk(nightly));
	assert.equal(isAtRisk(health), false);
});

test('mergeScheduledTasks: the same name on different platforms is two tasks', () => {
	const merged = mergeScheduledTasks([], [def({ name: 'review' }), def({ name: 'review', platform: 'copilot' })], NOW);
	assert.equal(merged.length, 2);
});

function summary(overrides: Partial<ScheduledTaskSummary> = {}): ScheduledTaskSummary {
	return { name: 'nightly', platform: 'claude', runCount: 0, activeDays: 0, lastRun: daysAgo(1), enabled: true, health: 'healthy', recentRuns: runs('✓✓✓'), ...overrides };
}

test('scheduledTaskFindings: stale and failing are medium risks; healthy, disabled and one-off tasks add nothing', () => {
	const findings = scheduledTaskFindings([
		summary({ name: 'stopped', lastRun: daysAgo(45), health: 'stale' }),
		summary({ name: 'never', lastRun: null, health: 'stale', platform: 'copilot' }),
		summary({ name: 'broken', health: 'failing', recentRuns: runs('✗✗✓✗') }),
		summary({ name: 'fine' }),
		summary({ name: 'off', enabled: false, health: 'disabled' }),
		summary({ name: 'once', health: 'one-off' }),
	], NOW);
	assert.deepEqual(findings.map(f => `${f.id}:${f.severity}`), [
		'stale-scheduled-automation:medium', 'failing-scheduled-automation:medium',
	]);
	assert.match(findings[0].detail, /"stopped" \(Claude Code scheduled task\) last ran 45 days ago/);
	assert.match(findings[0].detail, /"never" \(GitHub Copilot automation\) has never run/);
	assert.match(findings[1].detail, /"broken" \(Claude Code scheduled task\) failed 3 of its last 4 runs/);
	assert.doesNotMatch(findings.map(f => f.detail).join(' '), /"fine"|"off"|"once"/);
});

test('scheduledTaskFindings: nothing for healthy or disabled tasks — running from a desktop app is a deliberate choice', () => {
	assert.deepEqual(scheduledTaskFindings([summary(), summary({ enabled: false, health: 'disabled' })], NOW), []);
});

test('scheduledTasksForRepo: matches the folder (case- and separator-insensitive) or owner/repo', () => {
	const tasks = [
		summary({ name: 'by-folder', folder: 'C:\\Code\\App\\', repository: null }),
		summary({ name: 'by-repo', folder: 'C:\\elsewhere\\clone', repository: 'Octo/App' }),
		summary({ name: 'other', folder: 'C:\\code\\other', repository: 'octo/other' }),
		summary({ name: 'nowhere', folder: null, repository: null }),
	];
	assert.deepEqual(scheduledTasksForRepo(tasks, { repoRoot: 'c:/code/app', nameWithOwner: 'octo/app' }).map(t => t.name), ['by-folder', 'by-repo']);
	assert.deepEqual(scheduledTasksForRepo(tasks, { repoRoot: 'c:/code/app' }).map(t => t.name), ['by-folder']);
});

test('sessionIdFromFile: Claude transcripts, Copilot CLI session-state and session-store paths', () => {
	assert.equal(sessionIdFromFile('C:\\Users\\u\\.claude\\projects\\p\\4096C507-cbd1.jsonl'), '4096c507-cbd1');
	assert.equal(sessionIdFromFile('/home/u/.copilot/session-state/ABC-123/events.jsonl'), 'abc-123');
	assert.equal(sessionIdFromFile('C:/Users/u/.copilot/session-store.db#Run-1'), 'run-1');
});

test('attachRunSessions and failedRunCost: failed runs carry their session, tokens and cost', () => {
	const sessions = new Map([['s1', { file: 'a/s1.jsonl', tokens: 1000, costUsd: 0.25 }], ['s2', { file: 'a/s2.jsonl', tokens: null, costUsd: null }]]);
	const runs = attachRunSessions([
		{ at: daysAgo(1), ok: false, sessionId: 'S1' },
		{ at: daysAgo(2), ok: false, sessionId: 's2' },
		{ at: daysAgo(3), ok: false, sessionId: 'not-analysed' },
		{ at: daysAgo(4), ok: true, sessionId: 's1' },
		{ at: daysAgo(5), ok: false },
	], sessions);
	assert.deepEqual(runs[0], { at: daysAgo(1), ok: false, sessionId: 'S1', sessionFile: 'a/s1.jsonl', tokens: 1000, costUsd: 0.25 });
	assert.deepEqual(runs[1], { at: daysAgo(2), ok: false, sessionId: 's2', sessionFile: 'a/s2.jsonl' }, 'unknown tokens and cost stay absent');
	assert.equal(runs[2].sessionFile, undefined);
	const cost = failedRunCost({ recentRuns: runs });
	assert.equal(cost.runs.length, 2, 'only failed runs with an analysed session');
	assert.equal(cost.tokens, 1000);
	assert.equal(cost.costUsd, 0.25);
});

test('mergeScheduledTasks: links recent runs to analysed sessions; failing findings name what the failures cost', () => {
	const merged = mergeScheduledTasks([], [def({ recentRuns: [
		{ at: daysAgo(1), ok: false, sessionId: 'r1' }, { at: daysAgo(2), ok: false, sessionId: 'r2' }, { at: daysAgo(3), ok: true, sessionId: 'r3' },
	] })], NOW, new Map([['r1', { file: 'f1', tokens: 1200000, costUsd: 3.5 }], ['r2', { file: 'f2', tokens: 300000, costUsd: 0.75 }]]));
	assert.equal(merged[0].health, 'failing');
	assert.deepEqual(merged[0].recentRuns!.map(r => r.sessionFile ?? null), ['f1', 'f2', null]);
	const [finding] = scheduledTaskFindings(merged, NOW);
	assert.equal(finding.id, 'failing-scheduled-automation');
	assert.match(finding.detail, /failed 2 of its last 3 runs \(the 2 failed run\(s\) with a known session used 1,500,000 tokens, about \$4\.25\)/);
});

test('trackFailingTasks: reports only failing tasks not yet notified, and forgets ones that recovered', () => {
	const task = (name: string, health: 'failing' | 'healthy' | 'stale') => ({ name, platform: 'copilot' as const, runCount: 0, activeDays: 0, lastRun: null, health });
	const first = trackFailingTasks([task('a', 'failing'), task('b', 'healthy'), task('c', 'stale')], []);
	assert.deepEqual(first.newlyFailing.map(t => t.name), ['a']);
	assert.deepEqual(first.nextNotifiedKeys, ['copilot:a']);
	assert.deepEqual(trackFailingTasks([task('a', 'failing')], first.nextNotifiedKeys).newlyFailing, []);
	// "a" recovered, so it is dropped from the stored keys and announced again when it fails later.
	const recovered = trackFailingTasks([task('a', 'healthy')], first.nextNotifiedKeys);
	assert.deepEqual(recovered.nextNotifiedKeys, []);
	assert.deepEqual(trackFailingTasks([task('a', 'failing')], recovered.nextNotifiedKeys).newlyFailing.map(t => t.name), ['a']);
	assert.equal(scheduledTaskKey({ platform: 'claude', name: 'x' }), 'claude:x');
});

test('trackFailingTasks: an empty or partial inventory keeps the notified keys, so the next refresh does not notify again', () => {
	const task = (name: string, health: 'failing' | 'healthy') => ({ name, platform: 'copilot' as const, runCount: 0, activeDays: 0, lastRun: null, health });
	const first = trackFailingTasks([task('a', 'failing'), task('b', 'failing')], []);
	assert.deepEqual(first.nextNotifiedKeys, ['copilot:a', 'copilot:b']);
	// The inventory was unavailable (caught error, data.db read returned []): nothing to judge, nothing forgotten.
	const unavailable = trackFailingTasks([], first.nextNotifiedKeys);
	assert.deepEqual(unavailable.newlyFailing, []);
	assert.deepEqual(unavailable.nextNotifiedKeys, ['copilot:a', 'copilot:b']);
	const back = trackFailingTasks([task('a', 'failing'), task('b', 'failing')], unavailable.nextNotifiedKeys);
	assert.deepEqual(back.newlyFailing, []);
	// Partial inventory: "b" is missing (kept), "a" is seen healthy (forgotten).
	const partial = trackFailingTasks([task('a', 'healthy')], back.nextNotifiedKeys);
	assert.deepEqual(partial.nextNotifiedKeys, ['copilot:b']);
	assert.deepEqual(trackFailingTasks([task('a', 'failing'), task('b', 'failing')], partial.nextNotifiedKeys).newlyFailing.map(t => t.name), ['a']);
});
