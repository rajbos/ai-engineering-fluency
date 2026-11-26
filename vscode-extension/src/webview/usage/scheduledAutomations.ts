/**
 * Scheduled automations section (Usage Analysis → Coaching → Insights tab).
 *
 * One sortable table of the scheduled agent tasks on this machine — Claude Code
 * scheduled tasks and GitHub Copilot automations — with where they run, their
 * schedule, last run, recent success rate and health. Stale and failing tasks
 * sort first; the health rules live in the shared `src/scheduledTasks.ts`.
 */
import { escapeHtml, formatAbsoluteDate, formatCompact, formatCost } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import { renderDataTable, type DataTableColumn } from '../shared/dataTable';
import { failedRunCost, isAtRisk, recentSuccessRate, STALE_AFTER_DAYS } from '../../../../src/scheduledTasks';
import type { RepeatedTaskReport, ScheduledTaskHealth, ScheduledTaskRun, ScheduledTaskSummary } from '../../../../src/types';

export const SCHEDULED_AUTOMATIONS_SECTION_ID = 'section-scheduled-automations';
export const SCHEDULED_AUTOMATIONS_TABLE_ID = 'scheduled-automations';
export const FAILED_RUNS_TABLE_ID = 'scheduled-automation-failed-runs';

// ── Sanitizing the host payload ────────────────────────────────────────────

const HEALTH_STATES: readonly ScheduledTaskHealth[] = ['healthy', 'stale', 'failing', 'disabled', 'one-off', 'manual', 'never-run'];

const optionalString = (v: unknown): string | null | undefined => (typeof v === 'string' ? v : v === null ? null : undefined);
const count = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) && v > 0 ? Math.floor(v) : 0);
const isNonNegative = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0;

/** One run, keeping its session link, tokens and cost when well-formed. */
function sanitizeRun(r: unknown): ScheduledTaskRun[] {
	if (!r || typeof r !== 'object') { return []; }
	const run = r as Record<string, unknown>;
	if (typeof run.at !== 'string' || typeof run.ok !== 'boolean') { return []; }
	const sanitized: ScheduledTaskRun = { at: run.at, ok: run.ok };
	if (typeof run.sessionId === 'string') { sanitized.sessionId = run.sessionId; }
	if (typeof run.sessionFile === 'string') { sanitized.sessionFile = run.sessionFile; }
	if (isNonNegative(run.tokens)) { sanitized.tokens = run.tokens; }
	if (isNonNegative(run.costUsd)) { sanitized.costUsd = run.costUsd; }
	return [sanitized];
}

function sanitizeRuns(raw: unknown): ScheduledTaskRun[] | undefined {
	return Array.isArray(raw) ? raw.flatMap(sanitizeRun) : undefined;
}

/** One scheduled task from the host payload, or null when it lacks a name or a known platform. */
export function sanitizeScheduledTask(value: unknown): ScheduledTaskSummary | null {
	if (!value || typeof value !== 'object') { return null; }
	const t = value as Record<string, unknown>;
	if (typeof t.name !== 'string' || (t.platform !== 'claude' && t.platform !== 'copilot')) { return null; }
	return {
		name: t.name,
		platform: t.platform,
		runCount: count(t.runCount),
		activeDays: count(t.activeDays),
		lastRun: optionalString(t.lastRun) ?? null,
		...sanitizeInventoryFields(t),
	};
}

const OPTIONAL_STRING_FIELDS = ['schedule', 'folder', 'repository', 'nextRunAt'] as const;
const OPTIONAL_COUNT_FIELDS = ['totalRuns', 'failedRuns'] as const;

/** The optional inventory fields, each kept only when present in the payload. */
function sanitizeInventoryFields(t: Record<string, unknown>): Partial<ScheduledTaskSummary> {
	const fields: Partial<ScheduledTaskSummary> = {};
	for (const key of OPTIONAL_STRING_FIELDS) {
		if (t[key] !== undefined) { fields[key] = optionalString(t[key]) ?? null; }
	}
	for (const key of OPTIONAL_COUNT_FIELDS) {
		if (t[key] !== undefined) { fields[key] = count(t[key]); }
	}
	if (typeof t.enabled === 'boolean') { fields.enabled = t.enabled; }
	const runs = sanitizeRuns(t.recentRuns);
	if (runs) { fields.recentRuns = runs; }
	const health = HEALTH_STATES.find(h => h === t.health);
	if (health) { fields.health = health; }
	return fields;
}

export function sanitizeScheduledTasks(raw: unknown): ScheduledTaskSummary[] {
	return Array.isArray(raw) ? raw.map(sanitizeScheduledTask).filter((t): t is ScheduledTaskSummary => t !== null) : [];
}

// ── Rendering ──────────────────────────────────────────────────────────────

const HEALTH_RANK: Record<ScheduledTaskHealth, number> = { failing: 0, stale: 1, 'never-run': 2, healthy: 3, manual: 4, 'one-off': 5, disabled: 6 };

function lastPathSegment(folder: string): string {
	return folder.split(/[/\\]/).filter(Boolean).pop() ?? folder;
}

function whereLabel(t: ScheduledTaskSummary): string {
	return t.repository ?? (t.folder ? lastPathSegment(t.folder) : '');
}

function timeOf(iso: string | null | undefined): number | null {
	const t = iso ? Date.parse(iso) : NaN;
	return Number.isNaN(t) ? null : t;
}

function successLabel(t: ScheduledTaskSummary): string {
	const runs = t.recentRuns ?? [];
	if (runs.length === 0) { return '—'; }
	return localizeFormat('usage.scheduledAutomations.success', runs.filter(r => r.ok).length, runs.length);
}

function healthBadge(t: ScheduledTaskSummary): string {
	const health = t.health ?? 'healthy';
	const risk = isAtRisk(t);
	const style = risk
		? 'background:rgba(251,191,36,0.12); border:1px solid rgba(251,191,36,0.5);'
		: 'background:var(--bg-tertiary); border:1px solid transparent;';
	return `<span class="scheduled-automation-health" data-health="${health}" style="font-size:11px; padding:1px 8px; border-radius:8px; white-space:nowrap; ${style}">${escapeHtml(localize(`usage.scheduledAutomations.health.${health}`))}</span>`;
}

function columns(): DataTableColumn<ScheduledTaskSummary>[] {
	return [
		{ id: 'name', label: localize('usage.scheduledAutomations.column.name'), className: 'data-table-wrap-anywhere', sortValue: t => t.name, render: t => t.name },
		{ id: 'platform', label: localize('usage.scheduledAutomations.column.platform'), sortValue: t => t.platform, render: t => localize(`usage.scheduledAutomations.platform.${t.platform}`) },
		{ id: 'repository', label: localize('usage.scheduledAutomations.column.repository'), className: 'data-table-wrap-anywhere', sortValue: t => whereLabel(t) || null, render: whereLabel },
		{ id: 'schedule', label: localize('usage.scheduledAutomations.column.schedule'), sortValue: t => t.schedule ?? null, render: t => t.schedule ?? '' },
		{ id: 'lastRun', label: localize('usage.scheduledAutomations.column.lastRun'), sortValue: t => timeOf(t.lastRun), firstSortDirection: 'desc', render: t => { const time = timeOf(t.lastRun); return time === null ? '—' : formatAbsoluteDate(time); } },
		{ id: 'success', label: localize('usage.scheduledAutomations.column.success'), sortValue: t => recentSuccessRate(t.recentRuns), render: successLabel },
		{ id: 'health', label: localize('usage.scheduledAutomations.column.health'), sortValue: t => HEALTH_RANK[t.health ?? 'healthy'], render: t => ({ html: healthBadge(t) }) },
	];
}

/**
 * The section for the Insights tab: empty string when no scheduled task is
 * known. At-risk tasks are counted in the title so they are seen first.
 */
export function buildScheduledAutomationsSectionHtml(report: RepeatedTaskReport | null): string {
	const tasks = report?.scheduledTasks ?? [];
	if (tasks.length === 0) { return ''; }
	const atRisk = tasks.filter(isAtRisk).length;
	const title = atRisk > 0
		? localizeFormat('usage.scheduledAutomations.titleAtRisk', tasks.length, atRisk)
		: localizeFormat('usage.scheduledAutomations.title', tasks.length);
	return `<div class="section" id="${SCHEDULED_AUTOMATIONS_SECTION_ID}">
		<div class="section-title"><span>⏰</span><span>${escapeHtml(title)}</span></div>
		<div class="section-subtitle">${escapeHtml(localizeFormat('usage.scheduledAutomations.subtitle', STALE_AFTER_DAYS))}</div>
		${renderDataTable({
			tableId: SCHEDULED_AUTOMATIONS_TABLE_ID,
			ariaLabel: localize('usage.scheduledAutomations.tableLabel'),
			rows: tasks,
			columns: columns(),
			initialSort: { columnId: 'health', direction: 'asc' },
			className: 'data-table--compact',
		})}
		${buildFailedRunsHtml(tasks)}
	</div>`;
}

// ── Failed runs ────────────────────────────────────────────────────────────

/** One failed run of a scheduled task, with the session it started. */
export interface FailedRunRow {
	task: ScheduledTaskSummary;
	at: string;
	sessionFile: string;
	tokens?: number;
	costUsd?: number;
}

/** Failed recent runs whose session was analysed, newest first. */
export function failedRunRows(tasks: readonly ScheduledTaskSummary[]): FailedRunRow[] {
	return tasks
		.flatMap(task => failedRunCost(task).runs.map(run => ({ task, at: run.at, sessionFile: run.sessionFile!, tokens: run.tokens, costUsd: run.costUsd })))
		.sort((a, b) => b.at.localeCompare(a.at));
}

const OPEN_BUTTON_STYLE = 'font-size:11px; padding:2px 8px; border-radius:4px; border:1px solid var(--border-color); background:var(--button-secondary-bg); color:var(--button-secondary-fg); cursor:pointer;';

function openSessionButton(file: string): string {
	return `<button type="button" class="scheduled-automation-open-session" data-file="${escapeHtml(file)}" title="${escapeHtml(localize('usage.skillSuggestions.openSessionTooltip'))}" style="${OPEN_BUTTON_STYLE}">${escapeHtml(localize('usage.skillSuggestions.openSession'))}</button>`;
}

function failedRunDate(r: FailedRunRow): string {
	const time = timeOf(r.at);
	return time === null ? r.at : formatAbsoluteDate(time);
}

function failedRunColumns(): DataTableColumn<FailedRunRow>[] {
	return [
		{ id: 'name', label: localize('usage.scheduledAutomations.column.name'), className: 'data-table-wrap-anywhere', sortValue: r => r.task.name, render: r => r.task.name },
		{ id: 'at', label: localize('usage.scheduledAutomations.failedRuns.column.run'), sortValue: r => timeOf(r.at), firstSortDirection: 'desc', render: failedRunDate },
		{ id: 'tokens', label: localize('usage.scheduledAutomations.failedRuns.column.tokens'), sortValue: r => r.tokens ?? null, firstSortDirection: 'desc', render: r => (r.tokens === undefined ? '—' : formatCompact(r.tokens)) },
		{ id: 'cost', label: localize('usage.scheduledAutomations.failedRuns.column.cost'), sortValue: r => r.costUsd ?? null, firstSortDirection: 'desc', render: r => (r.costUsd === undefined ? '—' : formatCost(r.costUsd)) },
		{ id: 'actions', label: localize('usage.skillSuggestions.column.actions'), render: r => ({ html: openSessionButton(r.sessionFile) }) },
	];
}

/** "Failed runs" block: each failed run's session with what it cost, so it can be opened and inspected. */
export function buildFailedRunsHtml(tasks: readonly ScheduledTaskSummary[]): string {
	const rows = failedRunRows(tasks);
	if (rows.length === 0) { return ''; }
	const tokens = rows.reduce((sum, r) => sum + (r.tokens ?? 0), 0);
	const cost = rows.reduce((sum, r) => sum + (r.costUsd ?? 0), 0);
	const title = localizeFormat('usage.scheduledAutomations.failedRuns.title', rows.length, formatCompact(tokens), formatCost(cost));
	return `<div class="scheduled-automation-failed-runs" style="margin-top:12px;">
		<div style="font-size:12px; font-weight:600; color:var(--text-primary);">${escapeHtml(title)}</div>
		<div style="font-size:11px; color:var(--text-secondary); margin:2px 0 6px;">${escapeHtml(localize('usage.scheduledAutomations.failedRuns.subtitle'))}</div>
		${renderDataTable({
			tableId: FAILED_RUNS_TABLE_ID,
			ariaLabel: localize('usage.scheduledAutomations.failedRuns.tableLabel'),
			rows,
			columns: failedRunColumns(),
			initialSort: { columnId: 'at', direction: 'desc' },
			className: 'data-table--compact',
		})}
	</div>`;
}

/**
 * Attach one delegated click listener to the section so the failed runs'
 * Open buttons open the session viewer. Safe to call after every render.
 */
export function wireScheduledAutomations(postMessage: (message: { command: 'openSessionFile'; file: string }) => void): void {
	const section = document.getElementById(SCHEDULED_AUTOMATIONS_SECTION_ID);
	if (!section || section.dataset.scheduledAutomationsWired === 'true') { return; }
	section.dataset.scheduledAutomationsWired = 'true';
	section.addEventListener('click', event => {
		const button = event.target instanceof Element ? event.target.closest('button.scheduled-automation-open-session') : null;
		const file = button?.getAttribute('data-file');
		if (file) { postMessage({ command: 'openSessionFile', file }); }
	});
}
