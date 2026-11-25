import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { readClaudeScheduledTasks, toClaudeTaskDefinition } from '../scheduledTaskSources';

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
	session('a', { scheduledTaskId: 'nightly-review', cliSessionId: 'cli-a', createdAt: Date.parse('2026-11-23T08:00:00Z') });
	session('b', { scheduledTaskId: 'nightly-review', createdAt: Date.parse('2026-11-22T08:00:00Z'), error: 'Claude Code process exited with code 1.' });
	session('c', { scheduledTaskId: 'nightly-review', createdAt: Date.parse('2026-11-21T08:00:00Z') });
	session('d', { title: 'a hand-started session', createdAt: Date.parse('2026-11-21T09:00:00Z') });
	fs.writeFileSync(path.join(machine, 'local_broken.json'), '{"scheduledTaskId": ');
	return { root, repo };
}

test('readClaudeScheduledTasks: reads schedule, folder, repository and run outcomes', async (t) => {
	const { root, repo } = createClaudeConfigFixture(t);
	const tasks = await readClaudeScheduledTasks([root]);
	assert.deepEqual(tasks.map(x => x.name).sort(), ['nightly-review', 'one-time-check']);
	const nightly = tasks.find(x => x.name === 'nightly-review')!;
	assert.equal(nightly.platform, 'claude');
	assert.equal(nightly.schedule, '0 8 * * *');
	assert.equal(nightly.enabled, true);
	assert.equal(nightly.folder, repo);
	assert.equal(nightly.repository, 'octo/app');
	assert.equal(nightly.createdAt, '2026-09-01T00:00:00.000Z');
	assert.equal(nightly.lastRunAt, '2026-11-23T08:00:00.000Z');
	assert.equal(nightly.totalRuns, 3);
	assert.equal(nightly.failedRuns, 1);
	assert.deepEqual(nightly.recentRuns.map(r => r.ok), [true, false, true], 'newest first');
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
