import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { parseRunMetadata, readClaudeScheduledTasks, STALLED_RUN_AFTER_MS, toClaudeTaskDefinition } from '../scheduledTaskSources';

/** A Claude desktop config dir with one account/machine folder holding scheduled tasks and session metadata. */
function createClaudeConfigFixture(t: { after: (fn: () => void) => void }) {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-desktop-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const machine = path.join(root, 'claude-code-sessions', 'account-1', 'machine-1');
	const repo = path.join(root, 'repo');
	fs.mkdirSync(machine, { recursive: true });
	fs.mkdirSync(path.join(repo, '.git'), { recursive: true });
	fs.writeFileSync(path.join(repo, '.git', 'config'), '[remote "origin"]\n\turl = https://github.com/octo/app.git\n');
	fs.writeFileSync(path.join(machine, 'scheduled-tasks.json'), JSON.stringify({
		scheduledTasks: [
			{ id: 'nightly-review', cronExpression: '0 8 * * *', enabled: true, cwd: repo, createdAt: Date.parse('2026-09-01T00:00:00Z'), lastRunAt: '2026-11-23T08:00:00.000Z' },
			{ id: 'one-time-check', fireAt: Date.parse('2026-11-30T09:00:00Z'), enabled: false, cwd: path.join(root, 'not-a-repo') },
			{ cronExpression: 'missing id' },
		],
	}));
	const session = (name: string, meta: object) => fs.writeFileSync(path.join(machine, `local_${name}.json`), JSON.stringify(meta));
	session('a', { scheduledTaskId: 'nightly-review', cliSessionId: 'cli-a', createdAt: Date.parse('2026-11-23T08:00:00Z'), completedTurns: 1 });
	session('b', { scheduledTaskId: 'nightly-review', createdAt: Date.parse('2026-11-22T08:00:00Z'), error: 'Claude Code process exited with code 1.' });
	session('c', { scheduledTaskId: 'nightly-review', createdAt: Date.parse('2026-11-21T08:00:00Z'), completedTurns: 2 });
	// Stalled on a permission prompt: no turn ever finished, idle for hours.
	session('e', { scheduledTaskId: 'nightly-review', createdAt: Date.parse('2026-11-20T08:00:00Z'), lastActivityAt: Date.parse('2026-11-20T08:01:00Z') });
	session('d', { title: 'a hand-started session', createdAt: Date.parse('2026-11-21T09:00:00Z') });
	fs.writeFileSync(path.join(machine, 'local_broken.json'), '{"scheduledTaskId": ');
	return { root, repo };
}

test('readClaudeScheduledTasks: reads schedule, folder, repository and run outcomes', async (t) => {
	const { root, repo } = createClaudeConfigFixture(t);
	const tasks = await readClaudeScheduledTasks([root], Date.parse('2026-11-25T00:00:00Z'));
	assert.deepEqual(tasks.map(x => x.name).sort(), ['nightly-review', 'one-time-check']);
	const nightly = tasks.find(x => x.name === 'nightly-review')!;
	assert.equal(nightly.platform, 'claude');
	assert.equal(nightly.schedule, '0 8 * * *');
	assert.equal(nightly.enabled, true);
	assert.equal(nightly.folder, repo);
	assert.equal(nightly.repository, 'octo/app');
	assert.equal(nightly.createdAt, '2026-09-01T00:00:00.000Z');
	assert.equal(nightly.lastRunAt, '2026-11-23T08:00:00.000Z');
	assert.equal(nightly.totalRuns, 4);
	assert.equal(nightly.failedRuns, 2, 'the errored run and the stalled run');
	assert.deepEqual(nightly.recentRuns.map(r => r.ok), [true, false, true, false], 'newest first');
	assert.equal(nightly.recentRuns[0].sessionId, 'cli-a', 'the transcript id, to link the run to its session');
	assert.equal(nightly.recentRuns[1].sessionId, undefined);

	const once = tasks.find(x => x.name === 'one-time-check')!;
	assert.equal(once.oneOff, true);
	assert.equal(once.schedule, 'once');
	assert.equal(once.enabled, false);
	assert.equal(once.repository, null);
	assert.equal(once.nextRunAt, '2026-11-30T09:00:00.000Z');
	assert.equal(once.totalRuns, 0);
});

test('readClaudeScheduledTasks: an app version that never writes completedTurns falls back to error only', async (t) => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'claude-desktop-legacy-'));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const machine = path.join(root, 'claude-code-sessions', 'account-1', 'machine-1');
	fs.mkdirSync(machine, { recursive: true });
	fs.writeFileSync(path.join(machine, 'scheduled-tasks.json'), JSON.stringify({ scheduledTasks: [{ id: 'weekly', cronExpression: '0 8 * * 1', enabled: true }] }));
	const session = (name: string, meta: object) => fs.writeFileSync(path.join(machine, `local_${name}.json`), JSON.stringify({ scheduledTaskId: 'weekly', ...meta }));
	session('a', { createdAt: Date.parse('2026-11-23T08:00:00Z'), lastActivityAt: Date.parse('2026-11-23T08:05:00Z') });
	session('b', { createdAt: Date.parse('2026-11-16T08:00:00Z'), lastActivityAt: Date.parse('2026-11-16T08:05:00Z'), error: 'boom' });
	const [weekly] = await readClaudeScheduledTasks([root], Date.parse('2026-11-25T00:00:00Z'));
	assert.deepEqual(weekly.recentRuns.map(r => r.ok), [true, false], 'no completedTurns anywhere: only the errored run failed');

	// Once any session in the folder records completedTurns, the same idle run counts as stalled.
	fs.writeFileSync(path.join(machine, 'local_manual.json'), JSON.stringify({ title: 'a hand-started session', completedTurns: 2 }));
	const [again] = await readClaudeScheduledTasks([root], Date.parse('2026-11-25T00:00:00Z'));
	assert.deepEqual(again.recentRuns.map(r => r.ok), [false, false]);
});

test('readClaudeScheduledTasks: missing or empty config dirs yield no tasks', async () => {
	assert.deepEqual(await readClaudeScheduledTasks([path.join(os.tmpdir(), 'no-such-claude-dir')]), []);
	assert.deepEqual(await readClaudeScheduledTasks([]), []);
});

test('toClaudeTaskDefinition: falls back to the newest recorded run when lastRunAt is missing', () => {
	const def = toClaudeTaskDefinition({ id: 'x', cronExpression: ' 0 6 * * 2 ' }, [{ at: '2026-11-20T06:00:00.000Z', ok: true }], () => null)!;
	assert.equal(def.schedule, '0 6 * * 2');
	assert.equal(def.enabled, true, 'enabled unless explicitly false');
	assert.equal(def.lastRunAt, '2026-11-20T06:00:00.000Z');
	assert.equal(toClaudeTaskDefinition({ cronExpression: '* * * * *' }, []), null);
});

test('parseRunMetadata: a run fails on an error, or when no turn finished and it is no longer running', () => {
	const now = Date.parse('2026-11-25T12:00:00Z');
	const created = Date.parse('2026-11-25T08:00:00Z');
	const ok = (meta: object) => parseRunMetadata(JSON.stringify({ scheduledTaskId: 't', createdAt: created, ...meta }), now)?.run.ok;

	assert.equal(ok({ completedTurns: 1, lastActivityAt: created + 60_000 }), true, 'finished');
	assert.equal(ok({ completedTurns: 3, lastTurnCutShort: true }), true, 'a later turn cut short after earlier turns finished');
	assert.equal(ok({ completedTurns: 1, error: 'Claude Code process exited with code 1.' }), false, 'errored');
	assert.equal(ok({ error: 'boom', lastActivityAt: now - 1000 }), false, 'errored while recent');
	assert.equal(ok({ lastActivityAt: created + 30_000 }), false, 'stalled: no finished turn, idle for hours');
	assert.equal(ok({}), false, 'stalled: no finished turn and no activity time, created hours ago');
	assert.equal(ok({ completedTurns: 0, lastActivityAt: created + 30_000 }), false, 'zero finished turns is not finished');
	assert.equal(ok({ lastActivityAt: now - 5 * 60_000 }), true, 'still running: recent activity');
	assert.equal(ok({ lastActivityAt: now - STALLED_RUN_AFTER_MS + 1000 }), true, 'still running: just inside the idle window');
	assert.equal(ok({ lastActivityAt: now - STALLED_RUN_AFTER_MS }), false, 'stalled: idle for the whole window');
	assert.equal(ok({ lastActivityAt: now - 1000, lastTurnCutShort: true }), false, 'cut short: ended even though recent');
	assert.equal(ok({ lastActivityAt: new Date(now - 1000).toISOString() }), true, 'ISO timestamps are read too');
	assert.equal(parseRunMetadata(JSON.stringify({ scheduledTaskId: 't', createdAt: created, lastActivityAt: created }), now, false)?.run.ok, true, 'app does not track turns: no error means success');
	assert.equal(parseRunMetadata(JSON.stringify({ title: 'not scheduled' }), now), null);
});
