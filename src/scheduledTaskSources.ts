/**
 * Reads the Claude desktop app's scheduled tasks ("Scheduled" in the Code tab).
 *
 * The app keeps, per account and machine, a `scheduled-tasks.json` next to its
 * session metadata:
 *
 *   <config>/claude-code-sessions/<account>/<machine>/scheduled-tasks.json
 *     { scheduledTasks: [{ id, cronExpression?, fireAt?, enabled, filePath, cwd,
 *                          createdAt, lastRunAt, ... }] }
 *   <config>/claude-code-sessions/<account>/<machine>/local_<id>.json
 *     one per session; a scheduled run carries `scheduledTaskId`, and `error`
 *     when the run failed.
 *
 * <config> is, on Windows, `%LOCALAPPDATA%\Claude-Data\claude_<package>` for
 * current installs and the packaged `...\LocalCache\Roaming\Claude` (or
 * `%APPDATA%\Claude`) for older ones; on macOS `~/Library/Application Support/Claude`.
 *
 * Read-only, best effort: anything missing or unparseable is skipped.
 */
import * as fs from 'fs';
import * as path from 'path';
import { CLAUDE_DESKTOP_SESSION_DIR_NAMES, claudeDesktopConfigDirs } from './claudedesktop';
import { readGitOriginUrl } from './darkFactorySignals';
import { repoDisplayName } from './repeatedTasks';
import { RECENT_RUN_LIMIT } from './scheduledTasks';
import type { ScheduledTaskDefinition, ScheduledTaskRun } from './types';

const SESSION_DIR_NAMES = CLAUDE_DESKTOP_SESSION_DIR_NAMES;

/** Re-exported: the Cowork session reader and this module share one list of config dirs. */
export { claudeDesktopConfigDirs };

async function subdirs(dir: string): Promise<string[]> {
	try {
		return (await fs.promises.readdir(dir, { withFileTypes: true })).filter(e => e.isDirectory()).map(e => path.join(dir, e.name));
	} catch {
		return [];
	}
}

/** Every `<account>/<machine>` folder that holds a scheduled-tasks.json. */
async function scheduledTaskFolders(configDirs: readonly string[]): Promise<string[]> {
	const folders: string[] = [];
	for (const configDir of configDirs) {
		for (const name of SESSION_DIR_NAMES) {
			for (const account of await subdirs(path.join(configDir, name))) {
				for (const machine of await subdirs(account)) {
					if (fs.existsSync(path.join(machine, 'scheduled-tasks.json'))) { folders.push(machine); }
				}
			}
		}
	}
	return folders;
}

interface RawClaudeTask {
	id?: unknown; cronExpression?: unknown; fireAt?: unknown; enabled?: unknown;
	cwd?: unknown; createdAt?: unknown; lastRunAt?: unknown;
}

function isoFrom(value: unknown): string | null {
	if (typeof value === 'number' && Number.isFinite(value)) { return new Date(value).toISOString(); }
	if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) { return new Date(value).toISOString(); }
	return null;
}

/** Runs per task id, from the session metadata files in one folder (newest first). */
/** The task id and run one session-metadata file describes, or null when it is not a scheduled run. */
export function parseRunMetadata(text: string): { taskId: string; run: ScheduledTaskRun } | null {
	// Cheap pre-check: most sessions are not scheduled runs.
	if (!text.includes('"scheduledTaskId"')) { return null; }
	let meta: { scheduledTaskId?: unknown; createdAt?: unknown; error?: unknown; cliSessionId?: unknown };
	try { meta = JSON.parse(text); } catch { return null; }
	const at = isoFrom(meta.createdAt);
	if (typeof meta.scheduledTaskId !== 'string' || !at) { return null; }
	const run: ScheduledTaskRun = { at, ok: !meta.error };
	// cliSessionId names the transcript (~/.claude/projects/<project>/<cliSessionId>.jsonl).
	if (typeof meta.cliSessionId === 'string' && meta.cliSessionId) { run.sessionId = meta.cliSessionId; }
	return { taskId: meta.scheduledTaskId, run };
}

async function readTextOrNull(file: string): Promise<string | null> {
	try { return await fs.promises.readFile(file, 'utf8'); } catch { return null; }
}

async function readRuns(folder: string): Promise<Map<string, ScheduledTaskRun[]>> {
	const runs = new Map<string, ScheduledTaskRun[]>();
	let names: string[] = [];
	try { names = await fs.promises.readdir(folder); } catch { return runs; }
	for (const name of names.filter(n => n.startsWith('local_') && n.endsWith('.json'))) {
		const text = await readTextOrNull(path.join(folder, name));
		const parsed = text === null ? null : parseRunMetadata(text);
		if (!parsed) { continue; }
		runs.set(parsed.taskId, [...(runs.get(parsed.taskId) ?? []), parsed.run]);
	}
	for (const list of runs.values()) { list.sort((a, b) => b.at.localeCompare(a.at)); }
	return runs;
}

function repositoryOf(folder: string | null): string | null {
	if (!folder) { return null; }
	try {
		const origin = readGitOriginUrl(folder);
		return origin ? repoDisplayName(origin) : null;
	} catch {
		return null;
	}
}

/** Map one scheduled-tasks.json entry plus its runs to a definition (null when malformed). */
/** A cron schedule, or a one-off run at `fireAt`, or neither. */
function claudeSchedule(raw: RawClaudeTask): { schedule: string | null; oneOff: boolean; nextRunAt: string | null } {
	const cron = typeof raw.cronExpression === 'string' ? raw.cronExpression.trim() : '';
	if (cron) { return { schedule: cron, oneOff: false, nextRunAt: null }; }
	if (raw.fireAt === undefined || raw.fireAt === null) { return { schedule: null, oneOff: false, nextRunAt: null }; }
	return { schedule: 'once', oneOff: true, nextRunAt: isoFrom(raw.fireAt) };
}

export function toClaudeTaskDefinition(raw: RawClaudeTask, runs: readonly ScheduledTaskRun[], resolveRepository = repositoryOf): ScheduledTaskDefinition | null {
	if (typeof raw.id !== 'string' || !raw.id) { return null; }
	const folder = typeof raw.cwd === 'string' && raw.cwd ? raw.cwd : null;
	return {
		name: raw.id,
		platform: 'claude',
		...claudeSchedule(raw),
		enabled: raw.enabled !== false,
		folder,
		repository: resolveRepository(folder),
		createdAt: isoFrom(raw.createdAt),
		lastRunAt: isoFrom(raw.lastRunAt) ?? runs[0]?.at ?? null,
		totalRuns: runs.length,
		failedRuns: runs.filter(r => !r.ok).length,
		recentRuns: runs.slice(0, RECENT_RUN_LIMIT),
	};
}

/**
 * Every Claude desktop scheduled task on this machine, with its recorded runs.
 * Empty when the app is not installed or keeps no scheduled tasks.
 */
export async function readClaudeScheduledTasks(configDirs: readonly string[] = claudeDesktopConfigDirs()): Promise<ScheduledTaskDefinition[]> {
	const definitions = new Map<string, ScheduledTaskDefinition>();
	for (const folder of await scheduledTaskFolders(configDirs)) {
		let tasks: RawClaudeTask[];
		try {
			const parsed = JSON.parse(await fs.promises.readFile(path.join(folder, 'scheduled-tasks.json'), 'utf8')) as { scheduledTasks?: unknown };
			tasks = Array.isArray(parsed.scheduledTasks) ? parsed.scheduledTasks as RawClaudeTask[] : [];
		} catch {
			continue;
		}
		const runs = await readRuns(folder);
		for (const raw of tasks) {
			const def = toClaudeTaskDefinition(raw, typeof raw.id === 'string' ? runs.get(raw.id) ?? [] : []);
			// The same task id under two config dirs (an old install left behind): keep the most recently run.
			const existing = def && definitions.get(def.name);
			if (def && (!existing || (def.lastRunAt ?? '') > (existing.lastRunAt ?? ''))) { definitions.set(def.name, def); }
		}
	}
	return [...definitions.values()];
}
