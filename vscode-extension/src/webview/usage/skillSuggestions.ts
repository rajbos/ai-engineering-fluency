/**
 * Skill Suggestions section (Usage Analysis → Coaching → Insights tab).
 *
 * Renders the repeated-task clusters as a paged list of cards. Each card has a
 * "Create skill with Copilot" action that drafts (never submits) a Copilot Chat
 * prompt, a "Copy prompt" action, and a paged sessions table whose rows open
 * the session viewer. The card list and the sessions tables are shared data
 * tables (`../shared/dataTable`), which own paging, sorting, focus and
 * announcements; this module only wires the card buttons. The prompt itself
 * is built by the shared, pure
 * `buildSkillCreationPrompt()` in `src/repeatedTasks.ts`.
 */
import { setHtml } from '../shared/domUtils';
import { escapeHtml, formatAbsoluteDate } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import { buildSkillCreationPrompt, resolveAutomationPlatforms, resolveSkillTarget, type AutomationPlatform } from '../../../../src/repeatedTasks';
import type { RepeatedTaskCluster, RepeatedTaskRecurrence, RepeatedTaskReport, RepeatedTaskSessionRef } from '../../../../src/types';
import { sanitizeScheduledTasks, wireScheduledAutomations } from './scheduledAutomations';

// The Scheduled automations section is built from the same report; re-exported so the
// usage view gets both sections through one import.
export { buildScheduledAutomationsSectionHtml } from './scheduledAutomations';
import {
	getDataTablePage,
	getDataTableState,
	renderDataTable,
	setDataTableState,
	type DataTableColumn,
	type DataTablePage,
} from '../shared/dataTable';

export type { RepeatedTaskCluster, RepeatedTaskReport, RepeatedTaskSessionRef };

/** Cards are tall (badge, quote, keywords, sessions), so a page holds only a few. */
export const SKILL_SUGGESTIONS_PAGE_SIZE = 5;
export const SKILL_SUGGESTIONS_LIST_ID = 'skill-suggestions';
export const SKILL_SUGGESTIONS_SECTION_ID = 'section-skill-suggestions';
const SESSIONS_TABLE_PREFIX = 'skill-sessions-';

export function sessionsTableId(clusterIndex: number): string {
	return `${SESSIONS_TABLE_PREFIX}${clusterIndex}`;
}

// ── Sanitizing the host payload ────────────────────────────────────────────

function sanitizeStringArray(raw: unknown): string[] {
	return Array.isArray(raw) ? raw.filter((v: unknown): v is string => typeof v === 'string') : [];
}

export function sanitizeRepeatedTaskCluster(raw: any): RepeatedTaskCluster | null {
	if (!raw || typeof raw !== 'object') { return null; }
	if (typeof raw.representativePrompt !== 'string' || typeof raw.sessionCount !== 'number' || !Array.isArray(raw.sessions)) { return null; }
	const sessions: RepeatedTaskSessionRef[] = raw.sessions
		.filter((s: any) => s && typeof s === 'object' && typeof s.file === 'string')
		.map((s: any): RepeatedTaskSessionRef => ({
			file: s.file,
			title: typeof s.title === 'string' ? s.title : null,
			lastInteraction: typeof s.lastInteraction === 'string' ? s.lastInteraction : null,
			repository: typeof s.repository === 'string' ? s.repository : undefined,
			...(typeof s.editor === 'string' && s.editor ? { editor: s.editor } : {}),
		}));
	if (sessions.length === 0) { return null; }
	return {
		representativePrompt: raw.representativePrompt,
		// Derive from the sanitized session list so the UI count can never
		// disagree with it (and NaN/float counts are impossible).
		sessionCount: sessions.length,
		repositories: sanitizeStringArray(raw.repositories),
		sessions,
		sharedKeywords: sanitizeStringArray(raw.sharedKeywords),
		// Optional: payloads cached by an older build have no examples.
		examplePrompts: sanitizeStringArray(raw.examplePrompts),
		// Optional: payloads cached by an older build have neither.
		editors: sanitizeStringArray(raw.editors),
		...sanitizeRecurrence(raw.recurrence),
	};
}

const RECURRENCE_CADENCES: readonly RepeatedTaskRecurrence['cadence'][] = ['daily', 'weekly', 'regular'];

function isPositiveNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function sanitizeRecurrence(value: unknown): { recurrence?: RepeatedTaskRecurrence } {
	if (!value || typeof value !== 'object') { return {}; }
	const raw = value as Partial<Record<keyof RepeatedTaskRecurrence, unknown>>;
	const cadence = RECURRENCE_CADENCES.find(c => c === raw.cadence);
	if (!cadence || !isPositiveNumber(raw.activeDays) || !isPositiveNumber(raw.typicalGapDays)) { return {}; }
	return { recurrence: { cadence, activeDays: Math.floor(raw.activeDays), typicalGapDays: raw.typicalGapDays } };
}

export function sanitizeRepeatedTaskReport(raw: any): RepeatedTaskReport | null {
	if (!raw || typeof raw !== 'object' || !Array.isArray(raw.clusters)) { return null; }
	const clusters = raw.clusters.map(sanitizeRepeatedTaskCluster).filter((c: RepeatedTaskCluster | null): c is RepeatedTaskCluster => c !== null);
	const scheduledTasks = sanitizeScheduledTasks(raw.scheduledTasks);
	// A report can carry only scheduled tasks (nothing repeated by hand).
	if (clusters.length === 0 && scheduledTasks.length === 0) { return null; }
	return {
		minClusterSize: typeof raw.minClusterSize === 'number' ? raw.minClusterSize : 2,
		sessionsScanned: typeof raw.sessionsScanned === 'number' ? raw.sessionsScanned : 0,
		clusters,
		...(scheduledTasks.length > 0 ? { scheduledTasks } : {}),
	};
}

// ── Rendering ──────────────────────────────────────────────────────────────

const SESSIONS_INITIAL_SORT = { columnId: 'date', direction: 'desc' } as const;

// setDataTableState() applies before or after the first render (and keeps a
// table's initialSort), so these work without depending on a prior render.

/** Move the suggestion list to a page (clamped on the next render). */
export function setSkillSuggestionsPage(page: number): void {
	setDataTableState(SKILL_SUGGESTIONS_LIST_ID, { page: Math.max(1, Math.floor(page)) });
}

/** Move one suggestion's sessions table to a page (clamped on the next render). */
export function setSkillSessionsPage(clusterIndex: number, page: number): void {
	setDataTableState(sessionsTableId(clusterIndex), { page: Math.max(1, Math.floor(page)) });
}

/** The page of suggestions the list would show for the current state. */
export function getSkillSuggestionsPage(clusters: readonly RepeatedTaskCluster[]): DataTablePage<RepeatedTaskCluster> {
	const state = getDataTableState(SKILL_SUGGESTIONS_LIST_ID);
	return getDataTablePage(clusters, [], state, { pageSize: SKILL_SUGGESTIONS_PAGE_SIZE });
}

function sessionTitle(session: RepeatedTaskSessionRef): string {
	return session.title || session.file.split(/[\\/]/).pop() || session.file;
}

function sessionTimestamp(session: RepeatedTaskSessionRef): number | null {
	const time = session.lastInteraction ? Date.parse(session.lastInteraction) : NaN;
	return Number.isNaN(time) ? null : time;
}

function sessionDateLabel(session: RepeatedTaskSessionRef): string {
	const time = sessionTimestamp(session);
	return time === null ? '' : formatAbsoluteDate(time);
}

// Built per render: the localized labels are only available after the host's dictionary loads.
function sessionColumns(): DataTableColumn<RepeatedTaskSessionRef>[] {
	return [
		{ id: 'session', label: localize('usage.skillSuggestions.column.session'), className: 'data-table-wrap-anywhere', sortValue: sessionTitle, render: sessionTitle },
		{ id: 'date', label: localize('usage.skillSuggestions.column.date'), sortValue: sessionTimestamp, firstSortDirection: 'desc', render: sessionDateLabel },
		{ id: 'repository', label: localize('usage.skillSuggestions.column.repository'), sortValue: s => s.repository ?? null, render: s => s.repository ?? '' },
		{ id: 'editor', label: localize('usage.skillSuggestions.column.editor'), sortValue: s => s.editor ?? null, render: s => s.editor ?? '' },
		{
			id: 'actions',
			label: localize('usage.skillSuggestions.column.actions'),
			render: s => ({
				html: `<button type="button" class="skill-suggestion-open-session" data-file="${escapeHtml(s.file)}" title="${escapeHtml(localize('usage.skillSuggestions.openSessionTooltip'))}" style="font-size:11px; padding:2px 8px; border-radius:4px; border:1px solid var(--border-color); background:var(--button-secondary-bg); color:var(--button-secondary-fg); cursor:pointer;">${escapeHtml(localize('usage.skillSuggestions.openSession'))}</button>`,
			}),
		},
	];
}

/** Paged, sortable sessions table (title, date, repository, open button) for one suggestion. */
export function renderSkillSessionsTable(cluster: RepeatedTaskCluster, clusterIndex: number): string {
	return renderDataTable({
		tableId: sessionsTableId(clusterIndex),
		ariaLabel: localize('usage.skillSuggestions.sessionsTableLabel'),
		rows: cluster.sessions,
		columns: sessionColumns(),
		initialSort: SESSIONS_INITIAL_SORT,
		className: 'data-table--compact',
	});
}

function buildTargetHint(cluster: RepeatedTaskCluster): string {
	const target = resolveSkillTarget(cluster);
	return target.kind === 'workspace'
		? localizeFormat('usage.skillSuggestions.target.workspace', target.repository)
		: localize('usage.skillSuggestions.target.user');
}

/** Badge text for a recurring task ("🔁 Recurs about weekly (4 days)"). */
export function buildRecurrenceLabel(recurrence: RepeatedTaskRecurrence): string {
	if (recurrence.cadence === 'regular') {
		return localizeFormat('usage.skillSuggestions.recurring.regular', Math.round(recurrence.typicalGapDays), recurrence.activeDays);
	}
	return localizeFormat(`usage.skillSuggestions.recurring.${recurrence.cadence}`, recurrence.activeDays);
}

const AUTOMATION_TIP_KEYS: Record<AutomationPlatform, string> = {
	claude: 'usage.skillSuggestions.automate.claude',
	copilot: 'usage.skillSuggestions.automate.copilot',
	other: 'usage.skillSuggestions.automate.other',
};

/**
 * "Automate it" tip for a recurring task: one line per scheduling feature that
 * fits the editors the task was run in (Claude Code scheduled tasks, GitHub
 * Copilot automations, or a generic scheduled job). Empty when not recurring.
 */
export function buildAutomationTipHtml(cluster: RepeatedTaskCluster): string {
	if (!cluster.recurrence) { return ''; }
	const items = resolveAutomationPlatforms(cluster)
		.map(p => `<li data-automation-platform="${p}">${escapeHtml(localize(AUTOMATION_TIP_KEYS[p]))}</li>`)
		.join('');
	return `<div class="skill-suggestion-automation" style="margin-top:8px; padding:8px 10px; border-radius:4px; background:rgba(96,165,250,0.08); border:1px solid rgba(96,165,250,0.4); font-size:11px; color:var(--text-primary);">
		<div>${escapeHtml(localize('usage.skillSuggestions.automate.intro'))}</div>
		<ul style="margin:4px 0 0; padding-left:18px;">${items}</ul>
	</div>`;
}

function buildRecurrenceBadgeHtml(cluster: RepeatedTaskCluster): string {
	if (!cluster.recurrence) { return ''; }
	return `<span class="skill-suggestion-recurring" style="flex-shrink:0; font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:rgba(96,165,250,0.15); border:1px solid rgba(96,165,250,0.5); color:var(--text-primary); white-space:nowrap;">${escapeHtml(buildRecurrenceLabel(cluster.recurrence))}</span>`;
}

function buildClusterCardHtml(cluster: RepeatedTaskCluster, clusterIndex: number): string {
	const keywords = cluster.sharedKeywords.length > 0
		? `<div style="margin-top:6px; display:flex; flex-wrap:wrap; gap:4px;">${cluster.sharedKeywords.map(k => `<span style="font-size:10px; padding:1px 7px; border-radius:8px; background:var(--bg-tertiary); color:var(--text-secondary);">${escapeHtml(k)}</span>`).join('')}</div>`
		: '';
	return `
		<div class="skill-suggestion-card" data-cluster-index="${clusterIndex}" style="padding:4px 2px;">
			<div style="display:flex; align-items:flex-start; gap:10px; flex-wrap:wrap;">
				<span style="flex-shrink:0; font-size:11px; font-weight:700; padding:2px 8px; border-radius:10px; background:rgba(74,222,128,0.15); border:1px solid rgba(74,222,128,0.5); color:var(--text-primary); white-space:nowrap;">${escapeHtml(localizeFormat('usage.skillSuggestions.repeated', cluster.sessionCount))}</span>
				${buildRecurrenceBadgeHtml(cluster)}
				<div style="flex:1; min-width:200px; font-size:12px; color:var(--text-primary); font-style:italic; overflow-wrap:anywhere;"><q>${escapeHtml(cluster.representativePrompt)}</q></div>
				<div style="display:flex; gap:6px; flex-shrink:0;">
					<button type="button" class="skill-suggestion-create" data-cluster-index="${clusterIndex}" title="${escapeHtml(localize('usage.skillSuggestions.createSkillTooltip'))}"
						style="font-size:11px; padding:3px 10px; border-radius:5px; border:1px solid var(--vscode-focusBorder); background:var(--vscode-button-secondaryBackground); color:var(--text-primary); cursor:pointer;">${escapeHtml(localize('usage.skillSuggestions.createSkill'))}</button>
					<button type="button" class="skill-suggestion-copy" data-cluster-index="${clusterIndex}" title="${escapeHtml(localize('usage.skillSuggestions.copyPromptTooltip'))}"
						style="font-size:11px; padding:3px 10px; border-radius:5px; border:1px solid transparent; background:var(--bg-tertiary); color:var(--text-primary); cursor:pointer;">${escapeHtml(localize('usage.skillSuggestions.copyPrompt'))}</button>
				</div>
			</div>
			${keywords}
			<div style="margin-top:6px; font-size:11px; color:var(--text-secondary);">${escapeHtml(buildTargetHint(cluster))}</div>
			${buildAutomationTipHtml(cluster)}
			<div class="skill-suggestion-notice" data-cluster-index="${clusterIndex}" role="status" aria-live="polite" aria-atomic="true"></div>
			<details style="margin-top:8px;">
				<summary style="font-size:11px; color:var(--text-secondary); cursor:pointer;">${escapeHtml(localizeFormat('usage.skillSuggestions.sessions', cluster.sessions.length))}</summary>
				<div style="margin-top:4px;">${renderSkillSessionsTable(cluster, clusterIndex)}</div>
			</details>
		</div>`;
}

/**
 * The suggestion list: a one-column, headerless data table of cards, five per
 * page; the pager is left out entirely when everything fits on one page. Rows
 * keep the report's order (largest first), so a row's index is its cluster index.
 */
function renderSuggestionList(report: RepeatedTaskReport): string {
	return renderDataTable({
		tableId: SKILL_SUGGESTIONS_LIST_ID,
		ariaLabel: localize('usage.skillSuggestions.pagerLabel'),
		rows: report.clusters,
		columns: [{ id: 'suggestion', label: localize('usage.skillSuggestions.pagerLabel'), render: (cluster, index) => ({ html: buildClusterCardHtml(cluster, index) }) }],
		showHeader: false,
		pageSize: report.clusters.length > SKILL_SUGGESTIONS_PAGE_SIZE ? SKILL_SUGGESTIONS_PAGE_SIZE : false,
		rootClassName: 'skill-suggestions-list',
	});
}

/**
 * Note naming the tasks that already run on a schedule: their runs are not
 * suggestions, and saying so explains why a familiar daily task is missing.
 */
export function buildScheduledExcludedHtml(report: RepeatedTaskReport): string {
	// Only tasks that ran in the window replaced a session here; the full list is the Scheduled automations table.
	const tasks = (report.scheduledTasks ?? []).filter(t => t.runCount > 0);
	if (tasks.length === 0) { return ''; }
	const list = tasks.map(t => localizeFormat('usage.skillSuggestions.scheduledTask', t.name, t.runCount)).join(', ');
	return `<div class="skill-suggestions-scheduled" style="margin:4px 0 8px; font-size:11px; color:var(--text-secondary);">${escapeHtml(localizeFormat('usage.skillSuggestions.scheduledExcluded', list))}</div>`;
}

/** Inner HTML of the section: title, subtitle and the paged card list. */
export function buildSkillSuggestionsBodyHtml(report: RepeatedTaskReport): string {
	return `
		<div class="section-title"><span>🧩</span><span>${escapeHtml(localizeFormat('usage.skillSuggestions.title', report.clusters.length))}</span></div>
		<div class="section-subtitle">${escapeHtml(localizeFormat('usage.skillSuggestions.subtitle', report.sessionsScanned))}</div>
		${buildScheduledExcludedHtml(report)}
		${renderSuggestionList(report)}`;
}

/** "Skill suggestions" section for the Insights tab (empty string when no candidates). */
export function buildSkillSuggestionsSectionHtml(report: RepeatedTaskReport | null): string {
	if (!report || report.clusters.length === 0) { return ''; }
	// Announces copy feedback; paging and sorting are announced by each data table's own region.
	return `<div class="section" id="${SKILL_SUGGESTIONS_SECTION_ID}">
		<span class="data-table-status skill-suggestions-status" role="status" aria-live="polite" aria-atomic="true"></span>
		${buildSkillSuggestionsBodyHtml(report)}
	</div>`;
}

// ── Interaction ────────────────────────────────────────────────────────────

/**
 * Last path segment of a repository or folder value. Repository values are
 * usually `owner/repo`, but `repoDisplayName()` leaves local paths (including
 * Windows ones like `C:\code\project`) as they are, so split on both separators.
 */
export function lastPathSegment(value: string): string | undefined {
	return value.split(/[/\\]/).filter(Boolean).pop();
}

/**
 * Whether a repository (an `owner/repo` display name or a local path) is one
 * of the open workspace folders, matched by folder name. No open folders
 * means not open.
 */
export function isRepositoryOpen(repository: string, workspacePaths: readonly string[]): boolean {
	const repoName = lastPathSegment(repository)?.toLowerCase();
	if (!repoName) { return false; }
	return workspacePaths.some(p => lastPathSegment(p)?.toLowerCase() === repoName);
}

export type SkillSuggestionsMessage =
	| { command: 'draftCopilotChatWithPrompt'; prompt: string }
	| { command: 'openSessionFile'; file: string };

export type SkillCreateAction =
	| { kind: 'draft'; prompt: string }
	| { kind: 'openRepoFirst'; repository: string; prompt: string };

/**
 * Decide what "Create skill with Copilot" does: draft the prompt, or — for a
 * single-repository suggestion whose repository is not open — explain that it
 * has to be opened first, so the skill is not written into the wrong place.
 */
export function resolveSkillCreateAction(cluster: RepeatedTaskCluster, workspacePaths: readonly string[]): SkillCreateAction {
	const prompt = buildSkillCreationPrompt(cluster);
	const target = resolveSkillTarget(cluster);
	if (target.kind === 'workspace' && !isRepositoryOpen(target.repository, workspacePaths)) {
		return { kind: 'openRepoFirst', repository: target.repository, prompt };
	}
	return { kind: 'draft', prompt };
}

export interface SkillSuggestionsWiring {
	getReport: () => RepeatedTaskReport | null;
	getWorkspacePaths: () => readonly string[];
	postMessage: (message: SkillSuggestionsMessage) => void;
}

function clusterAt(wiring: SkillSuggestionsWiring, button: Element): RepeatedTaskCluster | undefined {
	const index = Number(button.getAttribute('data-cluster-index'));
	return Number.isSafeInteger(index) && index >= 0 ? wiring.getReport()?.clusters[index] : undefined;
}

/** Announce a change that does not move focus (copy feedback, page changes) to screen readers. */
function announce(section: HTMLElement, text: string): void {
	const status = section.querySelector<HTMLElement>('.skill-suggestions-status');
	if (status) { status.textContent = text; }
}

export const COPY_FEEDBACK_MS = 2000;
const copyResetTimers = new WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>();

function copyWithFeedback(section: HTMLElement, button: HTMLButtonElement, text: string): void {
	// Guarded and wrapped: a missing clipboard API, or a writeText that throws
	// synchronously, would otherwise escape the promise .catch() below.
	let write: Promise<void>;
	try {
		if (typeof navigator === 'undefined' || typeof navigator.clipboard?.writeText !== 'function') { return; }
		write = navigator.clipboard.writeText(text);
	} catch {
		return;
	}
	write.then(() => {
		button.textContent = localize('usage.skillSuggestions.copied');
		announce(section, localize('usage.skillSuggestions.copied'));
		// Restore the real label, never whatever is showing now (a second click
		// while "Copied!" is up would otherwise capture and restore that), and
		// keep one pending restore per button so an older timer cannot fire late.
		clearTimeout(copyResetTimers.get(button));
		copyResetTimers.set(button, setTimeout(() => {
			copyResetTimers.delete(button);
			button.textContent = localize('usage.skillSuggestions.copyPrompt');
		}, COPY_FEEDBACK_MS));
	}).catch(() => { /* clipboard unavailable: leave the label unchanged */ });
}

function showOpenRepoNotice(section: HTMLElement, button: Element, action: Extract<SkillCreateAction, { kind: 'openRepoFirst' }>): void {
	const index = button.getAttribute('data-cluster-index');
	const notice = Array.from(section.querySelectorAll<HTMLElement>('.skill-suggestion-notice'))
		.find(n => n.getAttribute('data-cluster-index') === index);
	if (!notice) { return; }
	const repoFolderName = lastPathSegment(action.repository) ?? action.repository;
	setHtml(notice, `
		<div style="margin-top:8px; padding:10px; background:rgba(251,191,36,0.07); border:1px solid rgba(251,191,36,0.4); border-radius:4px; display:flex; flex-direction:column; gap:8px;">
			<div style="font-size:11px; color:var(--warning-fg, var(--text-primary));">${escapeHtml(localizeFormat('usage.skillSuggestions.openRepoFirst', repoFolderName))}</div>
			<pre style="font-size:10px; color:var(--text-secondary); background:var(--bg-secondary); border:1px solid var(--border-color); border-radius:4px; padding:8px; white-space:pre-wrap; word-break:break-word; max-height:160px; overflow-y:auto; font-family:monospace; margin:0;">${escapeHtml(action.prompt)}</pre>
		</div>`);
}

function handleSectionClick(section: HTMLElement, wiring: SkillSuggestionsWiring, target: Element): void {
	const openButton = target.closest<HTMLButtonElement>('button.skill-suggestion-open-session');
	if (openButton) {
		const file = openButton.getAttribute('data-file');
		if (file) { wiring.postMessage({ command: 'openSessionFile', file }); }
		return;
	}
	const createButton = target.closest<HTMLButtonElement>('button.skill-suggestion-create');
	if (createButton) {
		const cluster = clusterAt(wiring, createButton);
		if (!cluster) { return; }
		const action = resolveSkillCreateAction(cluster, wiring.getWorkspacePaths());
		if (action.kind === 'draft') {
			wiring.postMessage({ command: 'draftCopilotChatWithPrompt', prompt: action.prompt });
		} else {
			showOpenRepoNotice(section, createButton, action);
		}
		return;
	}
	const copyButton = target.closest<HTMLButtonElement>('button.skill-suggestion-copy');
	if (copyButton) {
		const cluster = clusterAt(wiring, copyButton);
		if (cluster) { copyWithFeedback(section, copyButton, buildSkillCreationPrompt(cluster)); }
	}
}

/**
 * Attach one delegated click listener to the section, so buttons keep working
 * across page changes and table re-renders. Safe to call after every render.
 */
export function wireSkillSuggestions(wiring: SkillSuggestionsWiring): void {
	// The Scheduled automations section renders from the same report; its Open buttons post the same message.
	wireScheduledAutomations(wiring.postMessage);
	const section = document.getElementById(SKILL_SUGGESTIONS_SECTION_ID);
	if (!section || section.dataset.skillSuggestionsWired === 'true') { return; }
	section.dataset.skillSuggestionsWired = 'true';
	section.addEventListener('click', event => {
		if (event.target instanceof Element) { handleSectionClick(section, wiring, event.target); }
	});
}
