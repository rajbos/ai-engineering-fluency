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
import type { RepeatedTaskCluster, RepeatedTaskReport, RepeatedTaskSessionRef } from '../../../src/types';

/** A cluster in the JSON payload; prompt-derived text (prompt, keywords, titles) is absent unless opted in. */
export type SkillSuggestionCluster = Omit<RepeatedTaskCluster, 'representativePrompt' | 'sharedKeywords' | 'sessions'> & {
	representativePrompt?: string;
	sharedKeywords?: string[];
	sessions: RepeatedTaskSessionRef[];
};

export interface SkillSuggestionsPayload {
	/** Whether `representativePrompt`, `sharedKeywords` and session titles are included. */
	promptsIncluded: boolean;
	/** Null when no cluster reached the minimum size (or no sessions were found). */
	repeatedTasks: (Omit<RepeatedTaskReport, 'clusters'> & { clusters: SkillSuggestionCluster[] }) | null;
}

/** JSON payload for `skill-suggestions --json`, with prompts, keywords and titles removed unless `includePrompts`. */
export function createSkillSuggestionsPayload(report: RepeatedTaskReport | undefined, includePrompts: boolean): SkillSuggestionsPayload {
	if (!report) { return { promptsIncluded: includePrompts, repeatedTasks: null }; }
	if (includePrompts) { return { promptsIncluded: true, repeatedTasks: report }; }
	// Allowlist: only fields known not to carry prompt text are copied, so a
	// prompt-derived field added to the report later stays out by default.
	return {
		promptsIncluded: false,
		repeatedTasks: {
			minClusterSize: report.minClusterSize,
			sessionsScanned: report.sessionsScanned,
			clusters: report.clusters.map(cluster => ({
				sessionCount: cluster.sessionCount,
				repositories: cluster.repositories,
				sessions: cluster.sessions.map(session => ({
					file: session.file,
					lastInteraction: session.lastInteraction,
					repository: session.repository,
				})),
			})),
		},
	};
}

/** Human-readable report for the terminal. */
export function formatSkillSuggestionsReport(report: RepeatedTaskReport | undefined): string {
	const lines: string[] = ['', 'Skill Suggestions — repeated tasks', '='.repeat(50), ''];
	if (!report) {
		lines.push('No repeated tasks found: no first prompt recurred across enough sessions.', '');
		return lines.join('\n');
	}
	lines.push(
		`${report.clusters.length} repeated task(s) in ${report.sessionsScanned} session(s) with a first prompt`
		+ ` (a task needs at least ${report.minClusterSize} similar sessions).`,
		'',
	);
	report.clusters.forEach((cluster, i) => {
		lines.push(`${i + 1}. "${cluster.representativePrompt}"`);
		lines.push(`   Sessions:     ${cluster.sessionCount}`);
		if (cluster.sharedKeywords.length > 0) { lines.push(`   Keywords:     ${cluster.sharedKeywords.join(', ')}`); }
		if (cluster.repositories.length > 0) { lines.push(`   Repositories: ${cluster.repositories.join(', ')}`); }
		const last = cluster.sessions[0]?.lastInteraction;
		if (last) { lines.push(`   Last seen:    ${last.slice(0, 10)}`); }
		lines.push('');
	});
	lines.push('Consider turning these into a reusable skill, prompt file or custom agent.', '');
	return lines.join('\n');
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
