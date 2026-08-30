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

/** Where a repo row came from: workspace git remotes, the account-wide task list, or both. */
export type AgentRepoDiscovery = 'workspace' | 'account' | 'both';

export type AgentRepoSummary = {
	owner: string;
	repo: string;
	/** Pre-validated safe https URL for this repo ('#' for the "no repository" bucket). */
	repoUrl: string;
	totalTasks: number;
	totalSessions: number;
	totalCredits: number;
	totalPremiumRequests: number;
	tasksScanned: number;
	tasksTotal: number;
	partial: boolean;
	discovery: AgentRepoDiscovery;
	/** True for the bucket of account tasks the API reported without a repository. */
	unassigned: boolean;
	error?: string;
};

export type AgentSessionsResult = {
	repos: AgentRepoSummary[];
	totalTasks: number;
	totalSessions: number;
	totalCredits: number;
	totalPremiumRequests: number;
	authenticated: boolean;
	since: string;
	/** ISO timestamp of the shared snapshot; empty when it has never been fetched. */
	fetchedAt: string;
	accountTasksAvailable: boolean;
	accountTasksError?: string;
	partial: boolean;
	/** How often the extension refreshes the snapshot, used to show when the next refresh is due. */
	refreshIntervalMs: number;
};

/** Fallback refresh cadence when a snapshot predates the extension stamping its own interval. */
const DEFAULT_SNAPSHOT_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

/** Narrow an untrusted value to a known discovery source, defaulting to the workspace scan. */
function toDiscovery(value: unknown): AgentRepoDiscovery {
	return value === 'account' || value === 'both' ? value : 'workspace';
}

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
		totalPremiumRequests: toSafeNumber(src.totalPremiumRequests),
		accountTasksAvailable: Boolean(src.accountTasksAvailable),
		refreshIntervalMs: toSafeNumber(src.refreshIntervalMs) || DEFAULT_SNAPSHOT_REFRESH_INTERVAL_MS,
		accountTasksError: typeof src.accountTasksError === 'string' ? escapeHtml(src.accountTasksError) : undefined,
		partial: Boolean(src.partial),
		repos: repos.map((repo) => {
			const r = (repo && typeof repo === 'object') ? (repo as Record<string, unknown>) : {};
			const owner = escapeHtml(typeof r.owner === 'string' ? r.owner : '');
			const repoName = escapeHtml(typeof r.repo === 'string' ? r.repo : '');
			const unassigned = Boolean(r.unassigned) || !owner || !repoName;
			return {
				owner,
				repo: repoName,
				repoUrl: unassigned ? '#' : toSafeHttpUrl(`https://github.com/${owner}/${repoName}`),
				totalTasks: toSafeNumber(r.totalTasks),
				totalSessions: toSafeNumber(r.totalSessions),
				totalCredits: toSafeNumber(r.totalCredits),
				totalPremiumRequests: toSafeNumber(r.totalPremiumRequests),
				tasksScanned: toSafeNumber(r.tasksScanned),
				tasksTotal: toSafeNumber(r.tasksTotal),
				partial: Boolean(r.partial),
				discovery: toDiscovery(r.discovery),
				unassigned,
				error: typeof r.error === 'string' ? escapeHtml(r.error) : undefined,
			};
		}),
	};
}
