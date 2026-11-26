/**
 * Scheduled agent tasks: Claude Code scheduled tasks (Claude desktop app) and
 * GitHub Copilot automations (Copilot app).
 *
 * Pure: no filesystem or database access, so the webview, the extension and
 * the CLI share it. The readers that build `ScheduledTaskDefinition`s live in
 * `scheduledTaskSources.ts` (Claude) and `copilotAutomationRuns.ts` (Copilot).
 *
 * - `assessScheduledTaskHealth()` decides whether a task is a risk: `stale`
 *   (enabled, no run for STALE_AFTER_DAYS) or `failing` (most of its recent
 *   runs failed).
 * - `mergeScheduledTasks()` joins the app inventory with the runs seen in the
 *   analysed sessions, so a task that stopped running still shows up.
 * - `scheduledTaskFindings()` turns the tasks that target one repository into
 *   AI Readiness findings.
 */
import type {
	DarkFactoryFinding,
	ScheduledTaskDefinition,
	ScheduledTaskHealth,
	ScheduledTaskRun,
	ScheduledTaskSummary,
} from './types';

/** An enabled task with no run for longer than this is stale. */
export const STALE_AFTER_DAYS = 30;
/** Recent runs kept per task, and the window the success rate is computed over. */
export const RECENT_RUN_LIMIT = 10;
/** A task needs at least this many recent runs before it can be judged failing. */
export const FAILING_MIN_RUNS = 3;
/** Below this share of successful recent runs a task is failing. */
export const FAILING_SUCCESS_RATE = 0.5;

const DAY_MS = 24 * 60 * 60 * 1000;

/** Health states that are risks rather than information. */
export const AT_RISK_HEALTH: readonly ScheduledTaskHealth[] = ['stale', 'failing'];

export function isAtRisk(task: Pick<ScheduledTaskSummary, 'health'>): boolean {
	return task.health !== undefined && AT_RISK_HEALTH.includes(task.health);
}

/** Stable identity of a task across refreshes: platform plus name. */
export function scheduledTaskKey(task: Pick<ScheduledTaskSummary, 'platform' | 'name'>): string {
	return `${task.platform}:${task.name}`;
}

/**
 * Which failing tasks are failing for the first time, given the keys the host
 * already told the user about. `nextNotifiedKeys` is what the host should store
 * next: the tasks failing now, so a task that recovers and later fails again is
 * reported again, plus every already-notified task missing from `tasks`. A task
 * is only forgotten once it is seen not failing: a refresh whose inventory is
 * empty or partial (a read error, a `data.db` returning nothing) says nothing
 * about it, and forgetting it there would announce it again on the next refresh.
 */
export function trackFailingTasks(
	tasks: readonly ScheduledTaskSummary[],
	notifiedKeys: readonly string[],
): { newlyFailing: ScheduledTaskSummary[]; nextNotifiedKeys: string[] } {
	const failing = tasks.filter(t => t.health === 'failing');
	const notified = new Set(notifiedKeys);
	const present = new Set(tasks.map(scheduledTaskKey));
	return {
		newlyFailing: failing.filter(t => !notified.has(scheduledTaskKey(t))),
		nextNotifiedKeys: [...failing.map(scheduledTaskKey), ...notifiedKeys.filter(k => !present.has(k))],
	};
}

/** Successful share of the recent runs, or null when there are none. */
export function recentSuccessRate(runs: readonly ScheduledTaskRun[] | undefined): number | null {
	if (!runs || runs.length === 0) { return null; }
	return runs.filter(r => r.ok).length / runs.length;
}

/** Whole days since an ISO timestamp, or null when it is missing or unparseable. */
export function daysSince(iso: string | null | undefined, now: Date): number | null {
	const t = iso ? Date.parse(iso) : NaN;
	return Number.isNaN(t) ? null : Math.floor((now.getTime() - t) / DAY_MS);
}

type HealthInput = Pick<ScheduledTaskDefinition, 'enabled' | 'oneOff' | 'manual' | 'lastRunAt' | 'createdAt' | 'recentRuns'>;

/**
 * Health of one task at `now`. Order matters: a disabled, one-off or manual
 * task is never a risk; an enabled scheduled task is stale before it is
 * failing (not running at all is the bigger problem).
 */
export function assessScheduledTaskHealth(task: HealthInput, now: Date): ScheduledTaskHealth {
	if (!task.enabled && !task.oneOff) { return 'disabled'; }
	if (task.oneOff) { return 'one-off'; }
	if (task.manual) { return 'manual'; }
	const sinceRun = daysSince(task.lastRunAt, now);
	if (sinceRun === null) {
		const sinceCreated = daysSince(task.createdAt, now);
		return sinceCreated !== null && sinceCreated > STALE_AFTER_DAYS ? 'stale' : 'never-run';
	}
	if (sinceRun > STALE_AFTER_DAYS) { return 'stale'; }
	const rate = recentSuccessRate(task.recentRuns);
	if (rate !== null && task.recentRuns.length >= FAILING_MIN_RUNS && rate < FAILING_SUCCESS_RATE) { return 'failing'; }
	return 'healthy';
}

function laterIso(a: string | null | undefined, b: string | null | undefined): string | null {
	if (!a) { return b ?? null; }
	if (!b) { return a; }
	return Date.parse(a) >= Date.parse(b) ? a : b;
}

const taskKey = (t: { platform: string; name: string }) => `${t.platform}\u0000${t.name}`;

/**
 * The agent session id a session file belongs to, lowercased: the part after
 * `#` for a virtual DB path (`session-store.db#<uuid>`), the parent folder for
 * `session-state/<uuid>/events.jsonl`, else the file name without extension
 * (`~/.claude/projects/<project>/<uuid>.jsonl`).
 */
export function sessionIdFromFile(file: string): string {
	const hash = file.lastIndexOf('#');
	if (hash !== -1) { return file.slice(hash + 1).toLowerCase(); }
	const parts = file.split(/[/\\]/).filter(Boolean);
	const base = parts[parts.length - 1] ?? '';
	if (base.toLowerCase() === 'events.jsonl' && parts.length > 1) { return parts[parts.length - 2].toLowerCase(); }
	return base.replace(/\.[^.]+$/, '').toLowerCase();
}

/** What a run needs from its analysed session: where to open it and what it cost. */
export interface RunSessionInfo {
	file: string;
	tokens?: number | null;
	costUsd?: number | null;
}

/** Attach the analysed session (file, tokens, cost) to each run that names one. */
export function attachRunSessions(runs: readonly ScheduledTaskRun[], sessions: ReadonlyMap<string, RunSessionInfo>): ScheduledTaskRun[] {
	return runs.map(run => {
		const session = run.sessionId ? sessions.get(run.sessionId.toLowerCase()) : undefined;
		if (!session) { return run; }
		return {
			...run,
			sessionFile: session.file,
			...(typeof session.tokens === 'number' ? { tokens: session.tokens } : {}),
			...(typeof session.costUsd === 'number' ? { costUsd: session.costUsd } : {}),
		};
	});
}

/** Failed recent runs with a known session, and their summed tokens and cost. */
export function failedRunCost(task: Pick<ScheduledTaskSummary, 'recentRuns'>): { runs: ScheduledTaskRun[]; tokens: number; costUsd: number } {
	const runs = (task.recentRuns ?? []).filter(r => !r.ok && r.sessionFile);
	return {
		runs,
		tokens: runs.reduce((sum, r) => sum + (r.tokens ?? 0), 0),
		costUsd: runs.reduce((sum, r) => sum + (r.costUsd ?? 0), 0),
	};
}

/**
 * Join the tasks seen in the analysed sessions (`observed`, from the
 * repeated-task report) with the apps' own inventory (`definitions`). Every
 * defined task is kept even without a run in the window, which is how a task
 * that stopped running surfaces. Sorted: at-risk first, then by runs.
 */
export function mergeScheduledTasks(
	observed: readonly ScheduledTaskSummary[],
	definitions: readonly ScheduledTaskDefinition[],
	now: Date,
	sessions: ReadonlyMap<string, RunSessionInfo> = new Map(),
): ScheduledTaskSummary[] {
	const byKey = new Map<string, ScheduledTaskSummary>(observed.map(t => [taskKey(t), { ...t }]));
	for (const def of definitions) {
		const seen = byKey.get(taskKey(def));
		const lastRunAt = laterIso(def.lastRunAt, seen?.lastRun);
		byKey.set(taskKey(def), {
			name: def.name,
			platform: def.platform,
			runCount: seen?.runCount ?? 0,
			activeDays: seen?.activeDays ?? 0,
			lastRun: lastRunAt,
			schedule: def.schedule,
			enabled: def.enabled,
			folder: def.folder,
			repository: def.repository,
			nextRunAt: def.nextRunAt ?? null,
			totalRuns: def.totalRuns,
			failedRuns: def.failedRuns,
			recentRuns: attachRunSessions(def.recentRuns.slice(0, RECENT_RUN_LIMIT), sessions),
			health: assessScheduledTaskHealth({ ...def, lastRunAt }, now),
		});
	}
	const rank = (t: ScheduledTaskSummary) => (isAtRisk(t) ? 0 : t.health === 'disabled' ? 2 : 1);
	return [...byKey.values()].sort((a, b) =>
		rank(a) - rank(b) || b.runCount - a.runCount || (b.totalRuns ?? 0) - (a.totalRuns ?? 0) || a.name.localeCompare(b.name));
}

// ---------------------------------------------------------------------------
// AI Readiness findings
// ---------------------------------------------------------------------------

const PLATFORM_LABEL: Record<ScheduledTaskSummary['platform'], string> = {
	claude: 'Claude Code scheduled task',
	copilot: 'GitHub Copilot automation',
};

function describeTask(t: ScheduledTaskSummary): string {
	return `"${t.name}" (${PLATFORM_LABEL[t.platform]})`;
}

function describeStale(t: ScheduledTaskSummary, now: Date): string {
	const days = daysSince(t.lastRun, now);
	return days === null ? `${describeTask(t)} has never run` : `${describeTask(t)} last ran ${days} days ago`;
}

function describeFailing(t: ScheduledTaskSummary): string {
	const runs = t.recentRuns ?? [];
	const cost = failedRunCost(t);
	const spent = cost.runs.length > 0
		? ` (the ${cost.runs.length} failed run(s) with a known session used ${cost.tokens.toLocaleString('en-US')} tokens, about $${cost.costUsd.toFixed(2)})`
		: '';
	return `${describeTask(t)} failed ${runs.filter(r => !r.ok).length} of its last ${runs.length} runs${spent}`;
}

/**
 * Readiness findings for the scheduled tasks that target one repository:
 * stale and failing tasks (medium — unattended work that silently stopped is
 * worse than none). Running a schedule from a desktop app is a deliberate
 * choice, not a finding.
 */
export function scheduledTaskFindings(tasks: readonly ScheduledTaskSummary[], now: Date): DarkFactoryFinding[] {
	const findings: DarkFactoryFinding[] = [];
	const stale = tasks.filter(t => t.health === 'stale');
	if (stale.length > 0) {
		findings.push({
			id: 'stale-scheduled-automation',
			severity: 'medium',
			title: 'Scheduled agent automation has stopped running',
			detail: `${stale.map(t => describeStale(t, now)).join('; ')}, while still enabled. Work this repository relies on being done on a schedule is no longer happening — fix or retire the task.`,
		});
	}
	const failing = tasks.filter(t => t.health === 'failing');
	if (failing.length > 0) {
		findings.push({
			id: 'failing-scheduled-automation',
			severity: 'medium',
			title: 'Scheduled agent automation keeps failing',
			detail: `${failing.map(describeFailing).join('; ')}. Unattended runs that fail leave no one to notice — check the run logs, permissions and approvals.`,
		});
	}
	return findings;
}

/** Normalized folder path for matching a task's folder to a repository root. */
export function normalizeFolder(folder: string): string {
	return folder.replace(/\\/g, '/').replace(/\/+$/, '').toLowerCase();
}

/**
 * The tasks that target one repository: same folder (case-insensitive,
 * separator-agnostic) or the same `owner/repo`.
 */
export function scheduledTasksForRepo(
	tasks: readonly ScheduledTaskSummary[],
	repo: { repoRoot: string; nameWithOwner?: string },
): ScheduledTaskSummary[] {
	const root = normalizeFolder(repo.repoRoot);
	const owner = repo.nameWithOwner?.toLowerCase();
	return tasks.filter(t =>
		(t.folder && normalizeFolder(t.folder) === root) ||
		(owner && t.repository?.toLowerCase() === owner));
}
