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
import { readGitOriginUrl } from './darkFactorySignals';
import { repoDisplayName } from './repeatedTasks';
import { RECENT_RUN_LIMIT } from './scheduledTasks';
import type { ScheduledTaskDefinition, ScheduledTaskRun } from './types';

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

// ---------------------------------------------------------------------------
// Automation inventory (for health: last run, success rate, staleness)
// ---------------------------------------------------------------------------

const AUTOMATIONS_SQL = `
	SELECT w.id, w.name, w.interval, w.cron_expression, w.schedule_hour, w.schedule_minute,
	       w.enabled, w.created_at, w.last_run_at, w.next_run_at,
	       p.main_repo_path, p.github_owner, p.github_repo
	FROM workflows w
	LEFT JOIN projects p ON p.id = w.project_id`;

/** Finished runs only: pending and running runs have no outcome yet. */
const FINISHED_RUNS_SQL = `
	SELECT task_id, started_at, status, session_id
	FROM workflow_runs
	WHERE status IN ('completed', 'failed')
	ORDER BY started_at DESC`;

type Row = Record<string, unknown>;

function rows(db: SqlDatabase, sql: string): Row[] {
	const result = db.exec(sql);
	if (result.length === 0) { return []; }
	const { columns, values } = result[0];
	return values.map(v => Object.fromEntries(columns.map((c, i) => [c, v[i]])));
}

const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null);
const pad = (n: unknown) => String(typeof n === 'number' ? n : 0).padStart(2, '0');

/** Readable schedule: the cron expression when set, else the app's interval. */
export function describeCopilotSchedule(row: Row): string | null {
	const cron = str(row.cron_expression);
	if (cron) { return cron; }
	const interval = str(row.interval);
	if (interval === 'daily' || interval === 'weekly') { return `${interval} at ${pad(row.schedule_hour)}:${pad(row.schedule_minute)}`; }
	return interval;
}

/**
 * Every Copilot automation with its project folder, `owner/repo`, schedule and
 * finished runs. `resolveRepository` maps a folder without GitHub metadata to
 * `owner/repo` (the host reads the git remote). Empty on any schema mismatch.
 */
export function queryCopilotAutomations(
	db: SqlDatabase,
	resolveRepository: (folder: string) => string | null = () => null,
): ScheduledTaskDefinition[] {
	try {
		const runsByTask = new Map<string, ScheduledTaskRun[]>();
		for (const r of rows(db, FINISHED_RUNS_SQL)) {
			const taskId = str(r.task_id);
			const at = str(r.started_at);
			if (!taskId || !at) { continue; }
			const list = runsByTask.get(taskId) ?? [];
			const sessionId = str(r.session_id);
			list.push({ at, ok: r.status === 'completed', ...(sessionId ? { sessionId } : {}) });
			runsByTask.set(taskId, list);
		}
		return rows(db, AUTOMATIONS_SQL).flatMap((r): ScheduledTaskDefinition[] => {
			const id = str(r.id);
			if (!id) { return []; }
			const runs = runsByTask.get(id) ?? [];
			const folder = str(r.main_repo_path);
			const owner = str(r.github_owner);
			const repo = str(r.github_repo);
			return [{
				name: str(r.name)?.trim() || 'Copilot automation',
				platform: 'copilot',
				schedule: describeCopilotSchedule(r),
				enabled: r.enabled === 1 || r.enabled === true,
				manual: r.interval === 'manual' && !str(r.cron_expression),
				folder,
				repository: owner && repo ? `${owner}/${repo}` : folder ? resolveRepository(folder) : null,
				createdAt: str(r.created_at),
				lastRunAt: str(r.last_run_at) ?? runs[0]?.at ?? null,
				nextRunAt: str(r.next_run_at),
				totalRuns: runs.length,
				failedRuns: runs.filter(run => !run.ok).length,
				recentRuns: runs.slice(0, RECENT_RUN_LIMIT),
			}];
		});
	} catch {
		return [];
	}
}

/** `owner/repo` from a folder's git origin remote, or null. */
export function repositoryFromFolder(folder: string): string | null {
	try {
		const origin = readGitOriginUrl(folder);
		return origin ? repoDisplayName(origin) : null;
	} catch {
		return null;
	}
}

/** Reads automations and their runs from data.db for hosts without their own data.db access (the CLI). */
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

	async getAutomations(): Promise<ScheduledTaskDefinition[]> {
		try {
			const db = await this.getDb(this.dbPath);
			return db ? queryCopilotAutomations(db, repositoryFromFolder) : [];
		} catch {
			return [];
		}
	}
}
