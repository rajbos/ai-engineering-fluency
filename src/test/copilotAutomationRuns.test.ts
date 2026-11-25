import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { automationRunName, CopilotAutomationRunsAccess } from '../copilotAutomationRuns';

const RUN_SESSION = '11111111-2222-3333-4444-555555555555';
const MANUAL_SESSION = '66666666-7777-8888-9999-000000000000';

/** A data.db-shaped fixture with the Copilot app's workflows/workflow_runs tables, written by node:sqlite. */
function createDataDbFixture(withTables = true) {
	const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-data-db-'));
	const dbPath = path.join(tmpDir, 'data.db');
	const db = new DatabaseSync(dbPath);
	if (withTables) {
		db.exec(`CREATE TABLE workflows (id TEXT PRIMARY KEY, name TEXT NOT NULL, prompt TEXT NOT NULL, interval TEXT NOT NULL);
			CREATE TABLE workflow_runs (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, status TEXT NOT NULL, trigger TEXT NOT NULL, session_id TEXT);
			INSERT INTO workflows VALUES ('w1', 'Daily dependabot review', 'review the PRs', 'daily');
			INSERT INTO workflows VALUES ('w2', '   ', 'x', 'manual');
			INSERT INTO workflow_runs VALUES ('r1', 'w1', 'completed', 'schedule', '${RUN_SESSION}');
			INSERT INTO workflow_runs VALUES ('r2', 'w1', 'failed', 'schedule', NULL);
			INSERT INTO workflow_runs VALUES ('r3', 'w2', 'completed', 'manual', '${MANUAL_SESSION}');`);
	} else {
		db.exec('CREATE TABLE sessions (id TEXT PRIMARY KEY);');
	}
	db.close();
	return { dbPath, cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }) };
}

test('CopilotAutomationRunsAccess: maps each run session to its automation name, skipping runs without a session', async (t) => {
	const fixture = createDataDbFixture();
	const access = new CopilotAutomationRunsAccess(fixture.dbPath);
	t.after(() => { access.dispose(); fixture.cleanup(); });
	const runs = await access.getAutomationRuns();
	assert.deepEqual([...runs.entries()].sort(), [
		[RUN_SESSION, 'Daily dependabot review'],
		[MANUAL_SESSION, 'Copilot automation'], // blank name falls back to a generic label
	].sort());
});

test('CopilotAutomationRunsAccess: no data.db or no automation tables means no runs', async (t) => {
	const fixture = createDataDbFixture(false);
	const access = new CopilotAutomationRunsAccess(fixture.dbPath);
	const missing = new CopilotAutomationRunsAccess(path.join(os.tmpdir(), 'does-not-exist', 'data.db'));
	t.after(() => { access.dispose(); missing.dispose(); fixture.cleanup(); });
	assert.equal((await access.getAutomationRuns()).size, 0);
	assert.equal((await missing.getAutomationRuns()).size, 0);
});

test('automationRunName: matches Copilot CLI session paths by UUID, nothing else', () => {
	const runs = new Map([[RUN_SESSION, 'Daily dependabot review']]);
	assert.equal(automationRunName(`/home/u/.copilot/session-store.db#${RUN_SESSION}`, runs), 'Daily dependabot review');
	assert.equal(automationRunName(path.join('/home/u/.copilot/session-state', RUN_SESSION, 'events.jsonl'), runs), 'Daily dependabot review');
	assert.equal(automationRunName(`/home/u/.copilot/session-store.db#${MANUAL_SESSION}`, runs), null);
	assert.equal(automationRunName(`/home/u/.claude/projects/p/${RUN_SESSION}.jsonl`, runs), null);
	assert.equal(automationRunName(`/home/u/.copilot/session-store.db#${RUN_SESSION}`, new Map()), null);
});

/** data.db fixture with the automation inventory columns the Copilot app writes. */
function createInventoryFixture() {
	const { DatabaseSync } = require('node:sqlite') as typeof import('node:sqlite');
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'copilot-data-db-inv-'));
	const dbPath = path.join(tmpDir, 'data.db');
	const db = new DatabaseSync(dbPath);
	db.exec(`CREATE TABLE projects (id TEXT PRIMARY KEY, main_repo_path TEXT, github_owner TEXT, github_repo TEXT);
		CREATE TABLE workflows (id TEXT PRIMARY KEY, name TEXT NOT NULL, prompt TEXT NOT NULL, project_id TEXT, interval TEXT NOT NULL,
			cron_expression TEXT, schedule_hour INTEGER, schedule_minute INTEGER, enabled INTEGER, created_at TEXT, last_run_at TEXT, next_run_at TEXT);
		CREATE TABLE workflow_runs (id TEXT PRIMARY KEY, task_id TEXT NOT NULL, status TEXT NOT NULL, trigger TEXT NOT NULL, session_id TEXT, started_at TEXT);
		INSERT INTO projects VALUES ('p1', 'C:/code/app', 'octo', 'app');
		INSERT INTO projects VALUES ('p2', 'C:/code/local-only', NULL, NULL);
		INSERT INTO workflows VALUES ('w1', 'Daily review', 'x', 'p1', 'daily', NULL, 9, 5, 1, '2026-09-01T00:00:00Z', '2026-11-23T09:05:00Z', '2026-11-24T09:05:00Z');
		INSERT INTO workflows VALUES ('w2', 'Cron job', 'x', 'p2', 'daily', '0 6 * * 1', 9, 0, 0, '2026-09-01T00:00:00Z', NULL, NULL);
		INSERT INTO workflows VALUES ('w3', 'By hand', 'x', NULL, 'manual', NULL, 9, 0, 1, '2026-09-01T00:00:00Z', NULL, NULL);
		INSERT INTO workflow_runs VALUES ('r1', 'w1', 'completed', 'schedule', 's1', '2026-11-23T09:05:00Z');
		INSERT INTO workflow_runs VALUES ('r2', 'w1', 'failed', 'schedule', 's2', '2026-11-22T09:05:00Z');
		INSERT INTO workflow_runs VALUES ('r3', 'w1', 'running', 'schedule', 's3', '2026-11-24T09:05:00Z');
		INSERT INTO workflow_runs VALUES ('r4', 'w2', 'failed', 'manual', 's4', '2026-11-01T06:00:00Z');`);
	db.close();
	return { dbPath, cleanup: () => fs.rmSync(tmpDir, { recursive: true, force: true }) };
}

test('CopilotAutomationRunsAccess.getAutomations: schedule, enabled, repository and finished runs per automation', async (t) => {
	const fixture = createInventoryFixture();
	const access = new CopilotAutomationRunsAccess(fixture.dbPath);
	t.after(() => { access.dispose(); fixture.cleanup(); });
	const automations = await access.getAutomations();
	const byName = new Map(automations.map(a => [a.name, a]));

	const daily = byName.get('Daily review')!;
	assert.equal(daily.platform, 'copilot');
	assert.equal(daily.schedule, 'daily at 09:05');
	assert.equal(daily.enabled, true);
	assert.equal(daily.manual, false);
	assert.equal(daily.folder, 'C:/code/app');
	assert.equal(daily.repository, 'octo/app');
	assert.equal(daily.lastRunAt, '2026-11-23T09:05:00Z');
	assert.equal(daily.nextRunAt, '2026-11-24T09:05:00Z');
	assert.equal(daily.totalRuns, 2, 'a running run has no outcome yet');
	assert.equal(daily.failedRuns, 1);
	assert.deepEqual(daily.recentRuns.map(r => r.ok), [true, false]);
	assert.deepEqual(daily.recentRuns.map(r => r.sessionId), ['s1', 's2']);

	const cron = byName.get('Cron job')!;
	assert.equal(cron.schedule, '0 6 * * 1', 'a cron expression wins over the interval');
	assert.equal(cron.enabled, false);
	assert.equal(cron.repository, null, 'no GitHub metadata and no git remote in the folder');
	assert.equal(cron.lastRunAt, '2026-11-01T06:00:00Z', 'falls back to the newest run');

	const manual = byName.get('By hand')!;
	assert.equal(manual.manual, true);
	assert.equal(manual.schedule, 'manual');
	assert.equal(manual.folder, null);
});

test('CopilotAutomationRunsAccess.getAutomations: an older schema without the inventory columns yields nothing', async (t) => {
	const fixture = createDataDbFixture();
	const access = new CopilotAutomationRunsAccess(fixture.dbPath);
	t.after(() => { access.dispose(); fixture.cleanup(); });
	assert.deepEqual(await access.getAutomations(), []);
});
