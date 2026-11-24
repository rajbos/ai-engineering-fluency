/**
 * Copilot automation runs (GitHub Copilot app "Automations").
 *
 * The Copilot app keeps its automations in `~/.copilot/data.db`: the `workflows`
 * table holds each automation (name, prompt, interval) and `workflow_runs` one
 * row per run, linked to the Copilot CLI session that ran it (`session_id`, the
 * same UUID as `session-state/<uuid>/` or `session-store.db#<uuid>`).
 *
 * The repeated-task report uses this to tell a run of an automation apart from
 * a prompt the user typed by hand: a scheduled run is already automated, so it
 * is reported as a scheduled task rather than suggested as one.
 */
/// <reference types="sql.js" />
import * as os from 'os';
import * as path from 'path';
import { SqlJsFileDbCacheBase, type SqlDatabase } from './utils/sqlJsDbCache';
import { extractCopilotCliSessionId } from './copilotCliOtel';

/** Absolute path to the Copilot app's ~/.copilot/data.db. */
export function getCopilotAppDataDbPath(): string {
	return path.join(os.homedir(), '.copilot', 'data.db');
}

const AUTOMATION_RUNS_SQL = `
	SELECT r.session_id, w.name
	FROM workflow_runs r
	JOIN workflows w ON w.id = r.task_id
	WHERE r.session_id IS NOT NULL`;

/**
 * Map of session UUID → automation name for every automation run that has a
 * session. Empty when the tables are missing (older app versions) or the query
 * fails: this is optional enrichment, never an error.
 */
export function queryCopilotAutomationRuns(db: SqlDatabase): Map<string, string> {
	const runs = new Map<string, string>();
	try {
		const result = db.exec(AUTOMATION_RUNS_SQL);
		for (const [sessionId, name] of result.length > 0 ? result[0].values : []) {
			if (typeof sessionId === 'string' && sessionId && typeof name === 'string') {
				runs.set(sessionId, name.trim() || 'Copilot automation');
			}
		}
	} catch { /* schema without automations — no runs */ }
	return runs;
}

/**
 * The automation a session file is a run of, or null. Only Copilot CLI session
 * paths (`session-state/<uuid>/events.jsonl`, `session-store.db#<uuid>`) can be runs.
 */
export function automationRunName(sessionFile: string, runs: ReadonlyMap<string, string>): string | null {
	if (runs.size === 0) { return null; }
	const sessionId = extractCopilotCliSessionId(sessionFile);
	return sessionId ? runs.get(sessionId) ?? null : null;
}

/** Reads automation runs from data.db for hosts without their own data.db access (the CLI). */
export class CopilotAutomationRunsAccess extends SqlJsFileDbCacheBase {
	constructor(private readonly dbPath: string = getCopilotAppDataDbPath()) {
		super();
	}

	async getAutomationRuns(): Promise<Map<string, string>> {
		try {
			const db = await this.getDb(this.dbPath);
			return db ? queryCopilotAutomationRuns(db) : new Map();
		} catch {
			return new Map();
		}
	}
}
