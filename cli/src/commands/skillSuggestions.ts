/**
 * `skill-suggestions` command — repeated-task (Skill Suggestions) report for the CLI.
 *
 * Clusters the first user prompt of every recently analysed session into tasks
 * you keep prompting for by hand: candidates for a reusable skill, prompt file
 * or custom agent. The report is built by the shared `buildRepeatedTaskReport()`
 * in src/repeatedTasks.ts, the same function the VS Code extension uses.
 * See docs/features/REPEATED-TASKS.md for background.
 *
 * The report carries prompt text and session titles. The text report prints
 * them to the terminal; `--json` leaves them, and the prompt-derived shared
 * keywords, out unless `--include-prompts` is
 * passed, since JSON output tends to end up in files, logs and CI output.
 */
import { Command } from 'commander';
import { discoverSessionFiles, calculateUsageAnalysisStats } from '../helpers';
import { shouldOutputJson } from '../commandUtils';
import { sanitizeForDisplay } from '../../../src/copilotServerMemories';
import { describeCadence, resolveAutomationPlatforms, type AutomationPlatform } from '../../../src/repeatedTasks';
import type { RepeatedTaskRecurrence, RepeatedTaskReport, RepeatedTaskSessionRef, ScheduledTaskSummary } from '../../../src/types';

/** How to schedule a recurring task, per automation platform (see resolveAutomationPlatforms). */
const AUTOMATION_CLI_HINTS: Record<AutomationPlatform, string> = {
	claude: 'Claude Code scheduled task (Scheduled in the desktop app, or /schedule for a cloud routine)',
	copilot: 'GitHub Copilot automation on a schedule',
	other: "scheduled job (cron, Task Scheduler or CI) running the agent's CLI non-interactively",
};

/** A session in the redacted payload: no title. */
export type RedactedSessionRef = Pick<RepeatedTaskSessionRef, 'file' | 'lastInteraction' | 'repository' | 'editor'>;

/** A cluster in the redacted payload: no prompt, keywords or session titles. */
export interface RedactedCluster {
	sessionCount: number;
	repositories: string[];
	sessions: RedactedSessionRef[];
	editors?: string[];
	recurrence?: RepeatedTaskRecurrence;
}

/** The repeated-task report as emitted without `--include-prompts`. */
export interface RedactedRepeatedTaskReport {
	minClusterSize: number;
	sessionsScanned: number;
	clusters: RedactedCluster[];
	/** Scheduled tasks without their user-chosen names. */
	scheduledTasks?: Omit<ScheduledTaskSummary, 'name'>[];
}

/** `skill-suggestions --json` output; the flag decides which report shape is present. */
export type SkillSuggestionsPayload =
	| { promptsIncluded: true; repeatedTasks: RepeatedTaskReport | null }
	| { promptsIncluded: false; repeatedTasks: RedactedRepeatedTaskReport | null };

/** JSON payload for `skill-suggestions --json`, with prompts, keywords and titles removed unless `includePrompts`. */
export function createSkillSuggestionsPayload(report: RepeatedTaskReport | undefined, includePrompts: boolean): SkillSuggestionsPayload {
	if (includePrompts) { return { promptsIncluded: true, repeatedTasks: report ?? null }; }
	if (!report) { return { promptsIncluded: false, repeatedTasks: null }; }
	// Allowlist: only fields known not to carry prompt text are copied, so a
	// prompt-derived field added to the report later stays out by default.
	return {
		promptsIncluded: false,
		repeatedTasks: {
			minClusterSize: report.minClusterSize,
			sessionsScanned: report.sessionsScanned,
			clusters: report.clusters.map((cluster): RedactedCluster => ({
				sessionCount: cluster.sessionCount,
				repositories: cluster.repositories,
				sessions: cluster.sessions.map((session): RedactedSessionRef => ({
					file: session.file,
					lastInteraction: session.lastInteraction,
					repository: session.repository,
					...(session.editor ? { editor: session.editor } : {}),
				})),
				...(cluster.editors ? { editors: cluster.editors } : {}),
				...(cluster.recurrence ? { recurrence: { ...cluster.recurrence } } : {}),
			})),
			...(report.scheduledTasks ? {
				scheduledTasks: report.scheduledTasks.map(t => ({ platform: t.platform, runCount: t.runCount, activeDays: t.activeDays, lastRun: t.lastRun })),
			} : {}),
		},
	};
}

/**
 * Human-readable report for the terminal. Every session-derived value (prompt,
 * keywords, repositories, timestamps) goes through sanitizeForDisplay(): it is
 * free text, and a newline or ESC/OSC/CSI sequence printed verbatim could forge
 * report lines or reprogram the reader's terminal.
 */
export function formatSkillSuggestionsReport(report: RepeatedTaskReport | undefined): string {
	const lines: string[] = ['', 'Skill Suggestions — repeated tasks', '='.repeat(50), ''];
	if (!report) {
		lines.push('No repeated tasks found: no first prompt recurred across enough sessions.', '');
		return lines.join('\n');
	}
	const scheduled = formatScheduledTasks(report);
	if (report.clusters.length === 0) {
		lines.push('No repeated tasks found: no hand-typed first prompt recurred across enough sessions.', '', ...scheduled);
		return lines.join('\n');
	}
	lines.push(
		`${report.clusters.length} repeated task(s) in ${report.sessionsScanned} session(s) with a usable first prompt`
		+ ` (a task needs at least ${report.minClusterSize} similar sessions).`,
		'',
	);
	report.clusters.forEach((cluster, i) => {
		lines.push(`${i + 1}. "${sanitizeForDisplay(cluster.representativePrompt)}"`);
		lines.push(`   Sessions:     ${cluster.sessionCount}`);
		if (cluster.sharedKeywords.length > 0) { lines.push(`   Keywords:     ${cluster.sharedKeywords.map(sanitizeForDisplay).join(', ')}`); }
		if (cluster.repositories.length > 0) { lines.push(`   Repositories: ${cluster.repositories.map(sanitizeForDisplay).join(', ')}`); }
		const editors = cluster.editors ?? [];
		if (editors.length > 0) { lines.push(`   Editors:      ${editors.map(sanitizeForDisplay).join(', ')}`); }
		const last = cluster.sessions[0]?.lastInteraction;
		if (last) { lines.push(`   Last seen:    ${sanitizeForDisplay(last).slice(0, 10)}`); }
		if (cluster.recurrence) {
			lines.push(`   Recurs:       ${describeCadence(cluster.recurrence)} (${cluster.recurrence.activeDays} days)`);
			for (const platform of resolveAutomationPlatforms(cluster)) {
				lines.push(`   Automate:     ${AUTOMATION_CLI_HINTS[platform]}`);
			}
		}
		lines.push('');
	});
	lines.push('Consider turning these into a reusable skill, prompt file or custom agent.');
	if (report.clusters.some(c => c.recurrence)) {
		lines.push('Tasks that recur on a rhythm can also be scheduled, so they run without you starting them.');
	}
	lines.push('', ...scheduled);
	return lines.join('\n');
}

const SCHEDULED_PLATFORM_LABELS: Record<ScheduledTaskSummary['platform'], string> = {
	claude: 'Claude Code scheduled task',
	copilot: 'GitHub Copilot automation',
};

/** "Already on a schedule" block: tasks whose runs were left out of the suggestions. */
function formatScheduledTasks(report: RepeatedTaskReport): string[] {
	const tasks = report.scheduledTasks ?? [];
	if (tasks.length === 0) { return []; }
	const lines = ['Already on a schedule (runs left out of the suggestions):'];
	for (const t of tasks) {
		const last = t.lastRun ? `, last ${sanitizeForDisplay(t.lastRun).slice(0, 10)}` : '';
		lines.push(`  - "${sanitizeForDisplay(t.name)}" (${SCHEDULED_PLATFORM_LABELS[t.platform]}): ${t.runCount} run(s) on ${t.activeDays} day(s)${last}`);
	}
	lines.push('');
	return lines;
}

export const skillSuggestionsCommand = new Command('skill-suggestions')
	.description('Find tasks you keep prompting for by hand: candidates for a reusable skill or prompt file')
	.option('--json', 'Output raw JSON (for machine consumption); prompts, keywords and titles are left out')
	.option('--include-prompts', 'Include prompt text, shared keywords and session titles in the --json output')
	.action(async (options) => {
		const files = await discoverSessionFiles();
		const report = files.length > 0
			? (await calculateUsageAnalysisStats(files, { includeRepeatedTasks: true })).repeatedTasks
			: undefined;

		if (shouldOutputJson(options)) {
			process.stdout.write(JSON.stringify(createSkillSuggestionsPayload(report, Boolean(options.includePrompts))));
		} else {
			process.stdout.write(formatSkillSuggestionsReport(report));
		}
	});
