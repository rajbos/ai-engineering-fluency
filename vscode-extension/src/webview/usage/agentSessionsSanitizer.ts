import { escapeHtml } from '../shared/formatUtils';

/**
 * Sanitization helpers for data received across the webview<->extension-host trust boundary.
 *
 * The extension host derives this data from AI-agent session log files, which are untrusted
 * input: session titles, tool/model names, repo names, and file paths can all be shaped by a
 * malicious repo or a prompt-injected agent. Every string field is escaped here, at the trust
 * boundary, so downstream render functions can interpolate the sanitized result directly into
 * HTML (via `setHtml`) without re-escaping.
 *
 * Split out of `main.ts` (which isn't imported directly by tests since it has top-level
 * DOM-dependent code) so these pure functions can be unit tested in isolation — same pattern as
 * `customizationSanitizer.ts` and `billingStatsSanitizer.ts` in this folder.
 */

export type AgentRepoSummary = {
	owner: string;
	repo: string;
	/** Pre-validated safe https URL for this repo. */
	repoUrl: string;
	totalTasks: number;
	totalSessions: number;
	totalCredits: number;
	tasksScanned: number;
	tasksTotal: number;
	partial: boolean;
	error?: string;
};

export type AgentSessionsResult = {
	repos: AgentRepoSummary[];
	totalTasks: number;
	totalSessions: number;
	totalCredits: number;
	authenticated: boolean;
	since: string;
	fetchedAt: string;
};

/** Coerces a value to a non-negative finite number, defaulting to 0. */
export function toSafeNumber(value: unknown): number {
	const n = Number(value);
	return Number.isFinite(n) && n >= 0 ? n : 0;
}

/** Validates a value as an http(s) URL, falling back to a safe placeholder ('#') otherwise. */
export function toSafeHttpUrl(value: unknown): string {
	const raw = typeof value === 'string' ? value.trim() : '';
	try {
		const parsed = new URL(raw);
		if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
			return parsed.toString();
		}
	} catch {
		// Ignore invalid URL and fall back to placeholder.
	}
	return '#';
}

/** Sanitize agent sessions data received from the extension host — escapes all string fields at
 *  the trust boundary so render functions can interpolate them directly into innerHTML safely. */
export function sanitizeAgentSessionsData(input: unknown): AgentSessionsResult {
	const src = (input && typeof input === 'object') ? (input as Record<string, unknown>) : {};
	const repos = Array.isArray(src.repos) ? src.repos : [];
	return {
		authenticated: Boolean(src.authenticated),
		since: typeof src.since === 'string' ? escapeHtml(src.since) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
		fetchedAt: typeof src.fetchedAt === 'string' ? src.fetchedAt : '',
		totalTasks: toSafeNumber(src.totalTasks),
		totalSessions: toSafeNumber(src.totalSessions),
		totalCredits: toSafeNumber(src.totalCredits),
		repos: repos.map((repo) => {
			const r = (repo && typeof repo === 'object') ? (repo as Record<string, unknown>) : {};
			const owner = escapeHtml(typeof r.owner === 'string' ? r.owner : '');
			const repoName = escapeHtml(typeof r.repo === 'string' ? r.repo : '');
			return {
				owner,
				repo: repoName,
				repoUrl: toSafeHttpUrl(`https://github.com/${owner}/${repoName}`),
				totalTasks: toSafeNumber(r.totalTasks),
				totalSessions: toSafeNumber(r.totalSessions),
				totalCredits: toSafeNumber(r.totalCredits),
				tasksScanned: toSafeNumber(r.tasksScanned),
				tasksTotal: toSafeNumber(r.tasksTotal),
				partial: Boolean(r.partial),
				error: typeof r.error === 'string' ? escapeHtml(r.error) : undefined,
			};
		}),
	};
}
