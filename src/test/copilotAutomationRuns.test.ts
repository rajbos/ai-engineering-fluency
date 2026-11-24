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
