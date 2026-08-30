import * as https from 'https';
import { getGitHubApiEndpoints, buildGitHubApiHeaders } from './githubApiConfig';
import type {
	AgentRepoDiscovery,
	AgentRepoSummary,
	AgentSessionSource,
	AgentSessionsResult,
} from '../../src/types';

/**
 * The shape of these results is shared with the webviews via `src/types.ts`; they are re-exported
 * here so callers of this service keep importing them from one place.
 */
export type { AgentSessionSource, AgentRepoDiscovery, AgentRepoSummary, AgentSessionsResult };

/** Maximum number of task detail fetches per repo to avoid API rate-limit spikes. */
const MAX_TASKS_DETAIL_PER_REPO = 50;

/**
 * Maximum number of task-detail calls for one account-wide collection pass. Each task costs one
 * request, so this caps a refresh at a few hundred calls even for very active accounts. Because
 * the snapshot is only refreshed hourly by a single window, this stays far below GitHub's
 * 5,000 req/hour primary rate limit.
 */
export const MAX_TASK_DETAILS_PER_REFRESH = 200;

/**
 * Detect whether an agent session came from the GitHub Copilot cloud agent or a CLI/remote session.
 *
 * Heuristic from the agents API:
 *   cloud-agent: model field is non-empty (e.g. "sweagent-capi:claude-sonnet-4") OR usage field present
 *   cli-remote:  model field present but empty string
 *   unknown:     model field absent entirely
 */
export function detectSessionSource(session: { model?: string; usage?: unknown }): AgentSessionSource {
	if (session.model !== undefined && session.model !== '') { return 'cloud-agent'; }
	if (Object.prototype.hasOwnProperty.call(session, 'usage') && session.usage !== null && session.usage !== undefined) { return 'cloud-agent'; }
	if (session.model !== undefined) { return 'cli-remote'; }
	return 'unknown';
}

// ---------------------------------------------------------------------------
// Low-level HTTP helpers (injectable for testing)
// ---------------------------------------------------------------------------

export interface TaskPageResult {
	tasks: any[];
	statusCode?: number;
	error?: string;
}

export interface TaskDetailResult {
	sessions?: any[];
	statusCode?: number;
	error?: string;
}

export interface FetchTaskPageOptions {
	owner: string;
	repo: string;
	token: string;
	page: number;
	archived: boolean;
	since?: string;
}

export interface FetchAccountTaskPageOptions {
	token: string;
	page: number;
	archived: boolean;
	since?: string;
}

export type FetchTaskPageFn = (options: FetchTaskPageOptions) => Promise<TaskPageResult>;

export type FetchAccountTaskPageFn = (options: FetchAccountTaskPageOptions) => Promise<TaskPageResult>;

export type FetchTaskDetailFn = (
	owner: string, repo: string, taskId: string, token: string,
) => Promise<TaskDetailResult>;

export type FetchAccountTaskDetailFn = (taskId: string, token: string) => Promise<TaskDetailResult>;

/** GET a GitHub REST path and parse the JSON body, mapping transport/HTTP errors into the result. */
function requestGitHubJson(path: string, token: string): Promise<{ body?: any; statusCode?: number; error?: string }> {
	return new Promise((resolve) => {
		const { hostname, restPathPrefix } = getGitHubApiEndpoints();
		const req = https.request(
			{ hostname, path: `${restPathPrefix}${path}`, headers: buildGitHubApiHeaders(token) },
			(res) => {
				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => {
					const statusCode = res.statusCode ?? 0;
					if (statusCode < 200 || statusCode >= 300) {
						resolve({ statusCode, error: `HTTP ${statusCode}` });
						return;
					}
					try {
						resolve({ body: JSON.parse(data), statusCode });
					} catch (e) {
						resolve({ statusCode, error: String(e) });
					}
				});
			},
		);
		req.on('error', (e) => resolve({ error: e.message }));
		req.setTimeout(15000, () => { req.destroy(new Error('Request timed out')); });
		req.end();
	});
}

/** Build the shared query string for both the repo-scoped and account-wide task listings. */
function buildTaskListQuery(page: number, archived: boolean, since?: string): string {
	let query = `per_page=100&page=${page}`;
	if (archived) { query += '&is_archived=true'; }
	if (since) { query += `&since=${encodeURIComponent(since)}`; }
	return query;
}

/** Pull the `tasks` array out of a task-listing response, tolerating a bare array body. */
function toTaskPageResult(result: { body?: any; statusCode?: number; error?: string }): TaskPageResult {
	if (result.error) { return { tasks: [], statusCode: result.statusCode, error: result.error }; }
	const parsed = result.body;
	const tasks = Array.isArray(parsed?.tasks) ? parsed.tasks : (Array.isArray(parsed) ? parsed : []);
	return { tasks, statusCode: result.statusCode };
}

/** Pull the `sessions` array out of a task-detail response. */
function toTaskDetailResult(result: { body?: any; statusCode?: number; error?: string }): TaskDetailResult {
	if (result.error) { return { statusCode: result.statusCode, error: result.error }; }
	return { sessions: Array.isArray(result.body?.sessions) ? result.body.sessions : [], statusCode: result.statusCode };
}

/** Fetch one page of agent tasks for a single repository. */
export async function fetchAgentTasksPage(
	{ owner, repo, token, page, archived, since }: FetchTaskPageOptions,
): Promise<TaskPageResult> {
	const query = buildTaskListQuery(page, archived, since);
	return toTaskPageResult(await requestGitHubJson(`/agents/repos/${owner}/${repo}/tasks?${query}`, token));
}

/**
 * Fetch one page of agent tasks for the authenticated user across **all** repositories.
 *
 * This is the account-wide `/agents/tasks` endpoint: it surfaces tasks started from github.com
 * (the agents page and cloud chat) in repos that are not checked out locally, which the
 * repo-scoped listing can never see. Needs "Agent tasks" (read) on the token.
 */
export async function fetchAccountAgentTasksPage(
	{ token, page, archived, since }: FetchAccountTaskPageOptions,
): Promise<TaskPageResult> {
	const query = buildTaskListQuery(page, archived, since);
	return toTaskPageResult(await requestGitHubJson(`/agents/tasks?${query}`, token));
}

/** Fetch session details for a single agent task, scoped to its repository. */
export async function fetchAgentTaskDetail(
	owner: string,
	repo: string,
	taskId: string,
	token: string,
): Promise<TaskDetailResult> {
	const path = `/agents/repos/${owner}/${repo}/tasks/${encodeURIComponent(taskId)}`;
	return toTaskDetailResult(await requestGitHubJson(path, token));
}

/** Fetch session details for a task by ID alone — used for tasks with no resolvable repository. */
export async function fetchAccountAgentTaskDetail(taskId: string, token: string): Promise<TaskDetailResult> {
	return toTaskDetailResult(await requestGitHubJson(`/agents/tasks/${encodeURIComponent(taskId)}`, token));
}

// ---------------------------------------------------------------------------
// Session usage parsing
// ---------------------------------------------------------------------------

/**
 * The agents API reports AI credits in nano-credits (1 credit = 1_000_000_000 nano-credits),
 * e.g. a session costing 43.38 AI credits is reported as `43380350000`. Divide by this factor to
 * get the whole-credit value shown in the UI (where 1 credit = $0.01).
 */
const NANO_CREDITS_PER_CREDIT = 1_000_000_000;

/** Billing units consumed by a single agent session. */
export interface SessionUsage {
	/** Whole AI credits (nano-credits from the API, divided down). */
	credits: number;
	/** Premium requests, for sessions that ran before the June 2026 switch to AI credits. */
	premiumRequests: number;
}

/**
 * Read the billing units of one session.
 *
 * The documented shape is `usage: { type: 'ai_credits' | 'premium_requests', amount: number }`;
 * the live API has also been observed reporting the amount as `usage.credits`, so both spellings
 * are accepted. Premium-request amounts are whole/fractional requests — not nano units — so they
 * are kept in their own bucket rather than being scaled down as if they were credits.
 */
export function readSessionUsage(session: any): SessionUsage {
	const usage = session?.usage;
	if (!usage || typeof usage !== 'object') { return { credits: 0, premiumRequests: 0 }; }
	const raw = typeof usage.amount === 'number' ? usage.amount
		: typeof usage.credits === 'number' ? usage.credits
		: 0;
	if (!Number.isFinite(raw) || raw <= 0) { return { credits: 0, premiumRequests: 0 }; }
	if (usage.type === 'premium_requests') { return { credits: 0, premiumRequests: raw }; }
	return { credits: raw / NANO_CREDITS_PER_CREDIT, premiumRequests: 0 };
}

// ---------------------------------------------------------------------------
// Task → repository resolution
// ---------------------------------------------------------------------------

/** Extract `owner/repo` from a github.com-style URL, if it looks like a repository URL. */
function repoFromUrl(url: unknown): { owner: string; repo: string } | undefined {
	if (typeof url !== 'string') { return undefined; }
	const match = /^https?:\/\/[^/]+\/([^/\s]+)\/([^/\s?#]+)/.exec(url);
	if (!match) { return undefined; }
	const [, owner, repo] = match;
	// Task URLs on the agents page (github.com/copilot/agents/...) are not repository URLs.
	if (owner === 'copilot') { return undefined; }
	return { owner, repo: repo.replace(/\.git$/, '') };
}

/** Split an `owner/repo` full name, ignoring anything that is not exactly two non-empty parts. */
function splitFullName(fullName: unknown): { owner: string; repo: string } | undefined {
	if (typeof fullName !== 'string') { return undefined; }
	const [owner, repo, ...rest] = fullName.split('/');
	return owner && repo && rest.length === 0 ? { owner, repo } : undefined;
}

/** Pick the repo out of the repository object itself, across the spellings the API has used. */
function repoFromRepositoryObject(repository: any, task: any): { owner: string; repo: string } | undefined {
	const fromFullName = splitFullName(repository.full_name) ?? splitFullName(repository.nwo);
	if (fromFullName) { return fromFullName; }

	const ownerLogin = repository.owner?.login ?? task?.owner?.login;
	if (typeof ownerLogin === 'string' && ownerLogin && typeof repository.name === 'string' && repository.name) {
		return { owner: ownerLogin, repo: repository.name };
	}
	return repoFromUrl(repository.html_url);
}

/**
 * Resolve the repository a task belongs to.
 *
 * The published schema only guarantees `repository.id`, while the live API returns richer repo
 * objects, so every known spelling is tried before falling back to parsing the task's URLs.
 * Returns undefined for tasks with no repository — e.g. ad-hoc sessions started from cloud chat
 * before a repo is picked — which are grouped into their own bucket.
 */
export function resolveTaskRepo(task: any): { owner: string; repo: string } | undefined {
	const repository = task?.repository;
	if (repository && typeof repository === 'object') {
		const resolved = repoFromRepositoryObject(repository, task);
		if (resolved) { return resolved; }
	}
	return repoFromUrl(task?.html_url);
}

/** Stable map key for a repository summary; account tasks with no repo share the empty key. */
export function repoKey(owner: string, repo: string): string {
	return owner && repo ? `${owner.toLowerCase()}/${repo.toLowerCase()}` : '';
}

// ---------------------------------------------------------------------------
// High-level aggregation
// ---------------------------------------------------------------------------

/**
 * Fetch and aggregate cloud-agent session stats for a single GitHub repository.
 *
 * Only cloud-agent sessions (model != '' or usage present) are counted.
 * CLI-remote sessions that appear in the same tasks are excluded so they are
 * not double-counted with the chat-session data already tracked by this extension.
 *
 * Fetches are capped at MAX_TASKS_DETAIL_PER_REPO task-detail calls to limit
 * API usage. When the cap is hit, `partial` is set to true and totals are
 * conservative lower bounds.
 */
export async function fetchAgentSessionsForRepo(
	owner: string,
	repo: string,
	token: string,
	since: Date,
	fetchTaskPage: FetchTaskPageFn = fetchAgentTasksPage,
	fetchTaskDetail: FetchTaskDetailFn = fetchAgentTaskDetail,
): Promise<AgentRepoSummary> {
	const sinceStr = since.toISOString();
	const { allTasks, error } = await fetchAllTasksForRepo(owner, repo, token, sinceStr, fetchTaskPage);
	if (error) { return error; }

	const tasksTotal = allTasks.length;
	const tasksToDetail = allTasks.slice(0, MAX_TASKS_DETAIL_PER_REPO);
	const partial = tasksTotal > MAX_TASKS_DETAIL_PER_REPO;
	const totals = await aggregateTaskDetails(tasksToDetail, owner, repo, token, fetchTaskDetail);

	return {
		owner, repo,
		totalTasks: totals.totalTasks,
		totalSessions: totals.totalSessions,
		totalCredits: totals.totalCredits,
		totalPremiumRequests: totals.totalPremiumRequests,
		tasksScanned: tasksToDetail.length,
		tasksTotal,
		partial,
		discovery: 'workspace',
	};
}

/** An empty summary row for a repository, before any task totals are folded in. */
export function emptyRepoSummary(owner: string, repo: string, discovery: AgentRepoDiscovery): AgentRepoSummary {
	return {
		owner, repo,
		totalTasks: 0, totalSessions: 0, totalCredits: 0, totalPremiumRequests: 0,
		tasksScanned: 0, tasksTotal: 0, partial: false,
		discovery,
	};
}

function buildTaskFetchError(owner: string, repo: string, statusCode: number | undefined): AgentRepoSummary {
	return { ...emptyRepoSummary(owner, repo, 'workspace'), error: describeTaskFetchError(statusCode) };
}

/** Human-readable reason for a failed task listing, based on the HTTP status. */
export function describeTaskFetchError(statusCode: number | undefined): string {
	if (statusCode === 404) { return 'Copilot cloud agent not enabled or not accessible for this repo'; }
	if (statusCode === 403) { return 'Access denied — check that your GitHub token has repo scope'; }
	if (statusCode === 401) { return 'GitHub sign-in expired — sign in again to refresh agent data'; }
	return `API error (HTTP ${statusCode ?? 'unknown'})`;
}

async function fetchTasksForArchivedBatch(
	owner: string, repo: string, token: string, sinceStr: string, archived: boolean,
	fetchTaskPage: FetchTaskPageFn, seen: Set<string>, allTasks: any[],
): Promise<AgentRepoSummary | undefined> {
	for (let page = 1; page <= 5; page++) {
		const { tasks, statusCode, error } = await fetchTaskPage({ owner, repo, token, page, archived, since: sinceStr });
		if (error && page === 1 && !archived) { return buildTaskFetchError(owner, repo, statusCode); }
		if (tasks.length === 0 || error) { break; }
		for (const t of tasks) { if (!seen.has(t.id)) { seen.add(t.id); allTasks.push(t); } }
		if (tasks.length < 100) { break; }
	}
	return undefined;
}

async function fetchAllTasksForRepo(
	owner: string,
	repo: string,
	token: string,
	sinceStr: string,
	fetchTaskPage: FetchTaskPageFn,
): Promise<{ allTasks: any[]; error?: AgentRepoSummary }> {
	const allTasks: any[] = [];
	const seen = new Set<string>();
	for (const archived of [false, true]) {
		const err = await fetchTasksForArchivedBatch(owner, repo, token, sinceStr, archived, fetchTaskPage, seen, allTasks);
		if (err) { return { allTasks: [], error: err }; }
	}
	return { allTasks };
}

/** Totals for the cloud-agent sessions of a single task. */
function sumCloudSessionUsage(sessions: any[]): { tasks: number; sessions: number; credits: number; premiumRequests: number } {
	const cloudSessions = sessions.filter(s => detectSessionSource(s) === 'cloud-agent');
	if (cloudSessions.length === 0) { return { tasks: 0, sessions: 0, credits: 0, premiumRequests: 0 }; }
	let credits = 0;
	let premiumRequests = 0;
	for (const session of cloudSessions) {
		const usage = readSessionUsage(session);
		credits += usage.credits;
		premiumRequests += usage.premiumRequests;
	}
	return { tasks: 1, sessions: cloudSessions.length, credits, premiumRequests };
}

async function aggregateTaskDetails(
	tasksToDetail: any[],
	owner: string,
	repo: string,
	token: string,
	fetchTaskDetail: FetchTaskDetailFn,
): Promise<{ totalTasks: number; totalSessions: number; totalCredits: number; totalPremiumRequests: number }> {
	let totalTasks = 0;
	let totalSessions = 0;
	let totalCredits = 0;
	let totalPremiumRequests = 0;
	const CONCURRENCY = 5;
	for (let i = 0; i < tasksToDetail.length; i += CONCURRENCY) {
		const batch = tasksToDetail.slice(i, i + CONCURRENCY);
		const results = await Promise.all(batch.map(task => fetchTaskDetail(owner, repo, task.id, token)));
		for (const { sessions } of results) {
			if (!sessions || sessions.length === 0) { continue; }
			const totals = sumCloudSessionUsage(sessions);
			totalTasks += totals.tasks;
			totalSessions += totals.sessions;
			totalCredits += totals.credits;
			totalPremiumRequests += totals.premiumRequests;
		}
	}
	return { totalTasks, totalSessions, totalCredits, totalPremiumRequests };
}

// ---------------------------------------------------------------------------
// Account-wide collection (workspace repos + /agents/tasks)
// ---------------------------------------------------------------------------

/** One task considered for a detail fetch, with the repository it was attributed to. */
interface AgentTaskCandidate {
	id: string;
	key: string;
	owner?: string;
	repo?: string;
	/** Sort key (most recent first) so the detail budget is spent on the newest tasks. */
	sortAt: number;
}

export interface CollectAgentSessionsOptions {
	token: string;
	since: Date;
	/** Repos discovered from workspace git remotes. Listed even when they report no tasks. */
	workspaceRepos: { owner: string; repo: string }[];
	fetchTaskPage?: FetchTaskPageFn;
	fetchAccountTaskPage?: FetchAccountTaskPageFn;
	fetchTaskDetail?: FetchTaskDetailFn;
	fetchAccountTaskDetail?: FetchAccountTaskDetailFn;
	/** Cap on task-detail calls for this pass (default MAX_TASK_DETAILS_PER_REFRESH). */
	maxTaskDetails?: number;
	/** Reports coarse progress (list calls + detail calls) so the panel can show a bar. */
	onProgress?: (done: number, total: number) => void;
}

/** Timestamp used to spend the detail budget on the most recently active tasks first. */
function taskSortAt(task: any): number {
	const stamp = Date.parse(task?.updated_at ?? task?.created_at ?? '');
	return Number.isFinite(stamp) ? stamp : 0;
}

/** Collect one archived/active slice of a task listing into `tasks`, deduplicating by task ID. */
async function listTaskSlice(
	fetchPage: (page: number, archived: boolean) => Promise<TaskPageResult>,
	archived: boolean,
	tasks: any[],
	seen: Set<string>,
): Promise<{ statusCode?: number; error?: string } | undefined> {
	for (let page = 1; page <= 5; page++) {
		const result = await fetchPage(page, archived);
		if (result.error) { return { statusCode: result.statusCode, error: result.error }; }
		for (const task of result.tasks) {
			if (task?.id && !seen.has(task.id)) { seen.add(task.id); tasks.push(task); }
		}
		if (result.tasks.length < 100) { return undefined; }
	}
	return undefined;
}

/**
 * Page through a task listing, active tasks first and then archived ones. Only a failure on the
 * very first call is reported: once some tasks are in hand, a later page or the archived pass
 * failing just means the snapshot is slightly short, which the per-repo `partial` flag covers.
 */
async function listAllTasks(
	fetchPage: (page: number, archived: boolean) => Promise<TaskPageResult>,
): Promise<{ tasks: any[]; statusCode?: number; error?: string }> {
	const tasks: any[] = [];
	const seen = new Set<string>();
	const activeError = await listTaskSlice(fetchPage, false, tasks, seen);
	if (activeError && tasks.length === 0) { return { tasks: [], ...activeError }; }
	await listTaskSlice(fetchPage, true, tasks, seen);
	return { tasks };
}

/** Ensure a row exists for this repo key, widening its discovery when seen from both sources. */
function upsertRow(
	rows: Map<string, AgentRepoSummary>, key: string, owner: string, repo: string, discovery: AgentRepoDiscovery,
): AgentRepoSummary {
	const existing = rows.get(key);
	if (existing) {
		if (existing.discovery !== discovery) { existing.discovery = 'both'; }
		return existing;
	}
	const row: AgentRepoSummary = { ...emptyRepoSummary(owner, repo, discovery) };
	if (!key) { row.unassigned = true; }
	rows.set(key, row);
	return row;
}

/** List tasks for every workspace repo, recording per-repo errors on their rows. */
async function collectWorkspaceTasks(
	options: CollectAgentSessionsOptions,
	rows: Map<string, AgentRepoSummary>,
	candidates: Map<string, AgentTaskCandidate>,
	reportProgress: () => void,
): Promise<void> {
	const fetchTaskPage = options.fetchTaskPage ?? fetchAgentTasksPage;
	const sinceStr = options.since.toISOString();
	for (const { owner, repo } of options.workspaceRepos) {
		const key = repoKey(owner, repo);
		const row = upsertRow(rows, key, owner, repo, 'workspace');
		const { tasks, statusCode, error } = await listAllTasks(
			(page, archived) => fetchTaskPage({ owner, repo, token: options.token, page, archived, since: sinceStr }),
		);
		if (error) { row.error = describeTaskFetchError(statusCode); }
		for (const task of tasks) {
			if (!candidates.has(task.id)) { candidates.set(task.id, { id: task.id, key, owner, repo, sortAt: taskSortAt(task) }); }
		}
		reportProgress();
	}
}

/** List the authenticated user's tasks across all repositories, adding any repos not seen yet. */
async function collectAccountTasks(
	options: CollectAgentSessionsOptions,
	rows: Map<string, AgentRepoSummary>,
	candidates: Map<string, AgentTaskCandidate>,
): Promise<{ available: boolean; error?: string }> {
	const fetchAccountPage = options.fetchAccountTaskPage ?? fetchAccountAgentTasksPage;
	const sinceStr = options.since.toISOString();
	const { tasks, statusCode, error } = await listAllTasks(
		(page, archived) => fetchAccountPage({ token: options.token, page, archived, since: sinceStr }),
	);
	if (error) { return { available: false, error: describeTaskFetchError(statusCode) }; }

	for (const task of tasks) {
		const resolved = resolveTaskRepo(task);
		const key = repoKey(resolved?.owner ?? '', resolved?.repo ?? '');
		upsertRow(rows, key, resolved?.owner ?? '', resolved?.repo ?? '', 'account');
		const existing = candidates.get(task.id);
		if (existing) { continue; }
		candidates.set(task.id, { id: task.id, key, owner: resolved?.owner, repo: resolved?.repo, sortAt: taskSortAt(task) });
	}
	return { available: true };
}

/** Fetch details for the selected tasks and fold their session totals into the repo rows. */
async function foldTaskDetails(
	selected: AgentTaskCandidate[],
	options: CollectAgentSessionsOptions,
	rows: Map<string, AgentRepoSummary>,
	reportProgress: () => void,
): Promise<void> {
	const fetchTaskDetail = options.fetchTaskDetail ?? fetchAgentTaskDetail;
	const fetchAccountTaskDetail = options.fetchAccountTaskDetail ?? fetchAccountAgentTaskDetail;
	const CONCURRENCY = 5;
	for (let i = 0; i < selected.length; i += CONCURRENCY) {
		const batch = selected.slice(i, i + CONCURRENCY);
		const details = await Promise.all(batch.map(candidate => (
			candidate.owner && candidate.repo
				? fetchTaskDetail(candidate.owner, candidate.repo, candidate.id, options.token)
				: fetchAccountTaskDetail(candidate.id, options.token)
		)));
		batch.forEach((candidate, index) => {
			reportProgress();
			const row = rows.get(candidate.key);
			const sessions = details[index]?.sessions;
			if (!row || !sessions || sessions.length === 0) { return; }
			const totals = sumCloudSessionUsage(sessions);
			row.totalTasks += totals.tasks;
			row.totalSessions += totals.sessions;
			row.totalCredits += totals.credits;
			row.totalPremiumRequests += totals.premiumRequests;
		});
	}
}

/** Order rows by cost, then activity, then name — with the "no repository" bucket last. */
function sortRepoRows(rows: AgentRepoSummary[]): AgentRepoSummary[] {
	return rows.sort((a, b) => {
		if (Boolean(a.unassigned) !== Boolean(b.unassigned)) { return a.unassigned ? 1 : -1; }
		if (b.totalCredits !== a.totalCredits) { return b.totalCredits - a.totalCredits; }
		if (b.tasksTotal !== a.tasksTotal) { return b.tasksTotal - a.tasksTotal; }
		return `${a.owner}/${a.repo}`.localeCompare(`${b.owner}/${b.repo}`);
	});
}

/**
 * Collect cloud-agent session stats for the authenticated user across both sources:
 * the workspace's git remotes (which also surface tasks other people started in those repos) and
 * the account-wide `/agents/tasks` listing (which surfaces tasks started from github.com in repos
 * that aren't checked out locally, plus ad-hoc cloud chat tasks with no repository at all).
 *
 * Tasks are deduplicated by ID across both listings, so a task visible in both is counted once.
 * The number of task-detail calls is capped: the newest tasks are detailed first and any repo with
 * tasks left over is flagged `partial`, making its totals a lower bound.
 */
export async function collectAgentSessions(options: CollectAgentSessionsOptions): Promise<AgentSessionsResult> {
	const rows = new Map<string, AgentRepoSummary>();
	const candidates = new Map<string, AgentTaskCandidate>();
	const maxDetails = options.maxTaskDetails ?? MAX_TASK_DETAILS_PER_REFRESH;

	// Progress is reported over: one unit per workspace repo listing, one for the account listing,
	// and one per task-detail call. The detail count is only known after listing, so the total is
	// re-estimated as it grows rather than pretending to be exact up front.
	let done = 0;
	let total = options.workspaceRepos.length + 1;
	const reportProgress = () => { done++; options.onProgress?.(done, Math.max(total, done)); };

	await collectWorkspaceTasks(options, rows, candidates, reportProgress);
	const account = await collectAccountTasks(options, rows, candidates);
	reportProgress();

	for (const candidate of candidates.values()) {
		const row = rows.get(candidate.key);
		if (row) { row.tasksTotal++; }
	}

	const ordered = Array.from(candidates.values()).sort((a, b) => b.sortAt - a.sortAt);
	const selected = ordered.slice(0, maxDetails);
	total += selected.length;
	for (const candidate of selected) {
		const row = rows.get(candidate.key);
		if (row) { row.tasksScanned++; }
	}
	for (const row of rows.values()) { row.partial = row.tasksTotal > row.tasksScanned; }

	await foldTaskDetails(selected, options, rows, reportProgress);

	const repos = sortRepoRows(Array.from(rows.values()));
	return {
		repos,
		totalTasks: repos.reduce((sum, r) => sum + r.totalTasks, 0),
		totalSessions: repos.reduce((sum, r) => sum + r.totalSessions, 0),
		totalCredits: repos.reduce((sum, r) => sum + r.totalCredits, 0),
		totalPremiumRequests: repos.reduce((sum, r) => sum + r.totalPremiumRequests, 0),
		authenticated: true,
		since: options.since.toISOString(),
		fetchedAt: new Date().toISOString(),
		accountTasksAvailable: account.available,
		accountTasksError: account.error,
		partial: candidates.size > selected.length,
	};
}
