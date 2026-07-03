import * as https from 'https';
import * as childProcess from 'child_process';
import { GITHUB_API_HOSTNAME, GITHUB_API_USER_AGENT, GITHUB_API_ACCEPT_V3, GITHUB_API_VERSION } from './githubApiConfig';

export type RepoPrDetail = {
	number: number;
	title: string;
	url: string;
	aiType: 'copilot' | 'claude' | 'openai' | 'other-ai';
	role: 'author' | 'reviewer-requested';
};

export type RepoPrInfo = {
	owner: string;
	repo: string;
	repoUrl: string;
	totalPrs: number;
	aiAuthoredPrs: number;
	aiReviewRequestedPrs: number;
	aiDetails: RepoPrDetail[];
	error?: string;
};

export type RepoPrStatsResult = {
	repos: RepoPrInfo[];
	authenticated: boolean;
	since: string; // ISO date string
};

// ---------------------------------------------------------------------------
// Copilot plan info
// ---------------------------------------------------------------------------

export type QuotaSnapshot = {
	quota_id?: string;
	timestamp_utc?: string;
	entitlement?: string;
	quota_remaining?: number;
	remaining?: number;
	percent_remaining?: number;
	unlimited?: boolean;
	overage_permitted?: boolean;
	overage_count?: number;
	has_quota?: boolean;
	quota_reset_at?: string;
	token_based_billing?: boolean;
};

export type CopilotPlanInfo = {
	login?: string;
	copilot_plan?: string;             // e.g. "copilot_individual" | "copilot_business" | "copilot_enterprise" | "copilot_free"
	chat_enabled?: boolean;
	cli_enabled?: boolean;
	is_mcp_enabled?: boolean;
	editor_preview_features_enabled?: boolean;
	copilotignore_enabled?: boolean;
	restricted_telemetry?: boolean;
	access_type_sku?: string;
	assigned_date?: string;
	organization_list?: string[];
	quota_snapshots?: Record<string, QuotaSnapshot>;
	quota_reset_date_utc?: string;
	quota_reset_date?: string;
	token_based_billing?: boolean;
	analytics_tracking_id?: string;
	// Legacy fields (may still be present)
	public_code_suggestions?: string;  // "block" | "allow"
	ide_chat?: string;                 // "enabled" | "disabled"
	copilot_ide_agent?: string;        // "enabled" | "disabled"
	unlimited_pr_summaries?: boolean;
	assignee?: { login?: string; id?: number };
	[key: string]: unknown;
};

export type CopilotPlanResult = { planInfo?: CopilotPlanInfo; statusCode?: number; error?: string };

/** Internal low-level fetcher for the copilot_internal/user endpoint. */
function fetchCopilotPlanInfoPage(token: string): Promise<CopilotPlanResult> {
	return new Promise((resolve) => {
		const req = https.request(
			{
				hostname: GITHUB_API_HOSTNAME,
				path: '/copilot_internal/user',
				headers: {
					Authorization: `Bearer ${token}`,
					'User-Agent': GITHUB_API_USER_AGENT,
					Accept: 'application/json',
				},
			},
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
						const parsed = JSON.parse(data);
						if (typeof parsed !== 'object' || parsed === null) {
							resolve({ statusCode, error: 'Unexpected response format' });
							return;
						}
						resolve({ planInfo: parsed as CopilotPlanInfo, statusCode });
					} catch (e) {
						resolve({ statusCode, error: String(e) });
					}
				});
			},
		);
		req.on('error', (e) => resolve({ error: e.message }));
		req.setTimeout(15000, () => {
			req.destroy(new Error('Request timed out after 15 s'));
		});
		req.end();
	});
}

/**
 * Fetch GitHub Copilot plan information for the authenticated user.
 * Uses the VS Code-only internal endpoint `https://api.github.com/copilot_internal/user`.
 * Treat as best-effort — this endpoint may not be available for all accounts.
 * @param fetcher Injectable fetcher for testing; defaults to the real HTTPS implementation.
 */
export function fetchCopilotPlanInfo(
	token: string,
	fetcher: (token: string) => Promise<CopilotPlanResult> = fetchCopilotPlanInfoPage,
): Promise<CopilotPlanResult> {
	return fetcher(token);
}

// ---------------------------------------------------------------------------
// Copilot v2 token endpoint info
// ---------------------------------------------------------------------------

/** Endpoint URLs returned by the copilot_internal/v2/token endpoint. */
export type CopilotTokenEndpoints = {
	api?: string;
	'origin-tracker'?: string;
	telemetry?: string;
	proxy?: string;
	[key: string]: string | undefined;
};

/** Non-sensitive metadata from the copilot_internal/v2/token response (token string excluded). */
export type CopilotTokenEndpointInfo = {
	endpoints?: CopilotTokenEndpoints;
	/** Unix timestamp (seconds) when the token expires. */
	expires_at?: number;
	/** How many seconds until the token should be refreshed. */
	refresh_in?: number;
	/** Subscription SKU embedded in the token header (e.g. "copilot_individual"). */
	sku?: string;
	[key: string]: unknown;
};

export type CopilotTokenEndpointResult = { info?: CopilotTokenEndpointInfo; statusCode?: number; error?: string };

/** Internal low-level fetcher for the copilot_internal/v2/token endpoint. */
function fetchCopilotTokenEndpointInfoPage(token: string): Promise<CopilotTokenEndpointResult> {
	return new Promise((resolve) => {
		const req = https.request(
			{
				hostname: GITHUB_API_HOSTNAME,
				path: '/copilot_internal/v2/token',
				headers: {
					Authorization: `Bearer ${token}`,
					'User-Agent': GITHUB_API_USER_AGENT,
					Accept: 'application/json',
				},
			},
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
						const parsed = JSON.parse(data);
						if (typeof parsed !== 'object' || parsed === null) {
							resolve({ statusCode, error: 'Unexpected response format' });
							return;
						}
						// Exclude the short-lived token string — we only care about the metadata.
						const { token: _token, ...rest } = parsed as { token?: string } & CopilotTokenEndpointInfo;
						resolve({ info: rest as CopilotTokenEndpointInfo, statusCode });
					} catch (e) {
						resolve({ statusCode, error: String(e) });
					}
				});
			},
		);
		req.on('error', (e) => resolve({ error: e.message }));
		req.setTimeout(15000, () => {
			req.destroy(new Error('Request timed out after 15 s'));
		});
		req.end();
	});
}

/**
 * Fetch Copilot token endpoint metadata for the authenticated user.
 * Uses the VS Code-only internal endpoint `https://api.github.com/copilot_internal/v2/token`.
 * Returns metadata (endpoints, expiry) but never the token string itself.
 * Treat as best-effort — this endpoint may not be available for all accounts.
 * @param fetcher Injectable fetcher for testing; defaults to the real HTTPS implementation.
 */
export function fetchCopilotTokenEndpointInfo(
	token: string,
	fetcher: (token: string) => Promise<CopilotTokenEndpointResult> = fetchCopilotTokenEndpointInfoPage,
): Promise<CopilotTokenEndpointResult> {
	return fetcher(token);
}

// ---------------------------------------------------------------------------
// Enterprise membership discovery (GraphQL)
// ---------------------------------------------------------------------------

export type EnterpriseInfo = { slug: string; name: string };
export type UserEnterprisesResult = { enterprises?: EnterpriseInfo[]; error?: string };

/** Discover enterprises the authenticated user belongs to via the GitHub GraphQL API. */
export function fetchUserEnterprises(
	token: string,
	fetcher: (token: string) => Promise<UserEnterprisesResult> = fetchUserEnterprisesPage,
): Promise<UserEnterprisesResult> {
	return fetcher(token);
}

function fetchUserEnterprisesPage(token: string): Promise<UserEnterprisesResult> {
	const query = JSON.stringify({
		query: '{ viewer { enterprises(first: 10, membershipType: ALL) { nodes { slug name } } } }',
	});
	return new Promise((resolve) => {
		const req = https.request(
			{
				hostname: GITHUB_API_HOSTNAME,
				path: '/graphql',
				method: 'POST',
				headers: {
					Authorization: `Bearer ${token}`,
					'User-Agent': GITHUB_API_USER_AGENT,
					'Content-Type': 'application/json',
					'Content-Length': Buffer.byteLength(query),
				},
			},
			(res) => {
				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => {
					const statusCode = res.statusCode ?? 0;
					if (statusCode < 200 || statusCode >= 300) {
						resolve({ error: `HTTP ${statusCode}` });
						return;
					}
					try {
						const parsed = JSON.parse(data);
						const nodes = parsed?.data?.viewer?.enterprises?.nodes;
						if (!Array.isArray(nodes)) {
							const gqlError = parsed?.errors?.[0]?.message;
							resolve({ error: gqlError ?? 'Unexpected response format' });
							return;
						}
						resolve({ enterprises: nodes as EnterpriseInfo[] });
					} catch (e) {
						resolve({ error: String(e) });
					}
				});
			},
		);
		req.on('error', (e) => resolve({ error: e.message }));
		req.setTimeout(15000, () => {
			req.destroy(new Error('Request timed out after 15 s'));
		});
		req.write(query);
		req.end();
	});
}

// ---------------------------------------------------------------------------
// Enterprise premium request budget
// ---------------------------------------------------------------------------

export type EnterpriseBudgetEntry = {
	id?: string;
	budget_amount?: number;
	prevent_further_usage?: boolean;
	budget_scope?: string;
	budget_product_skus?: string[];
	[key: string]: unknown;
};
export type EnterpriseBudgetResult = { budgets?: EnterpriseBudgetEntry[]; statusCode?: number; error?: string };

/**
 * Fetch enterprise billing budgets filtered for premium requests for a specific user.
 * Requires the authenticated user to be an enterprise admin or billing manager.
 * Best-effort — returns an error on 403/404 for non-admin users.
 */
export function fetchEnterprisePremiumBudgets(
	enterpriseSlug: string,
	username: string,
	token: string,
	fetcher: (slug: string, username: string, token: string) => Promise<EnterpriseBudgetResult> = fetchEnterprisePremiumBudgetsPage,
): Promise<EnterpriseBudgetResult> {
	return fetcher(enterpriseSlug, username, token);
}

function fetchEnterprisePremiumBudgetsPage(enterpriseSlug: string, username: string, token: string): Promise<EnterpriseBudgetResult> {
	const params = new URLSearchParams({ user: username, budgetTarget: 'premium_req' });
	return new Promise((resolve) => {
		const req = https.request(
			{
				hostname: GITHUB_API_HOSTNAME,
				path: `/enterprises/${encodeURIComponent(enterpriseSlug)}/settings/billing/budgets?${params}`,
				headers: {
					Authorization: `Bearer ${token}`,
					'User-Agent': GITHUB_API_USER_AGENT,
					Accept: GITHUB_API_ACCEPT_V3,
					'X-GitHub-Api-Version': GITHUB_API_VERSION,
				},
			},
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
						const parsed = JSON.parse(data);
						const budgets = parsed?.budgets ?? (Array.isArray(parsed) ? parsed : undefined);
						if (budgets === undefined) {
							resolve({ statusCode, error: 'Unexpected response format' });
							return;
						}
						resolve({ budgets, statusCode });
					} catch (e) {
						resolve({ statusCode, error: String(e) });
					}
				});
			},
		);
		req.on('error', (e) => resolve({ error: e.message }));
		req.setTimeout(15000, () => {
			req.destroy(new Error('Request timed out after 15 s'));
		});
		req.end();
	});
}

/** Detect which AI system a GitHub login belongs to, or null if not an AI bot. */
export function detectAiType(login: string): RepoPrDetail['aiType'] | null {
	const l = login.toLowerCase();
	if (l.includes('copilot')) { return 'copilot'; }
	if (l.includes('claude') || l.includes('anthropic')) { return 'claude'; }
	if (l.includes('openai') || l.includes('codex')) { return 'openai'; }
	return null;
}

/** Fetch a single page of PRs from GitHub REST API. */
export function fetchRepoPrsPage(
	owner: string,
	repo: string,
	token: string,
	page: number,
): Promise<{ prs: any[]; statusCode?: number; error?: string }> {
	return new Promise((resolve) => {
		const req = https.request(
			{
				hostname: GITHUB_API_HOSTNAME,
				path: `/repos/${owner}/${repo}/pulls?state=all&per_page=100&sort=created&direction=desc&page=${page}`,
				headers: {
					Authorization: `Bearer ${token}`,
					'User-Agent': GITHUB_API_USER_AGENT,
					Accept: GITHUB_API_ACCEPT_V3,
				},
			},
			(res) => {
				let data = '';
				res.on('data', (chunk) => (data += chunk));
				res.on('end', () => {
					try {
						const parsed = JSON.parse(data);
						if (!Array.isArray(parsed)) {
							resolve({ prs: [], statusCode: res.statusCode, error: parsed.message ?? 'Unexpected API response' });
						} else {
							resolve({ prs: parsed, statusCode: res.statusCode });
						}
					} catch (e) {
						resolve({ prs: [], statusCode: res.statusCode, error: String(e) });
					}
				});
			},
		);
		req.on('error', (e) => resolve({ prs: [], error: e.message }));
		req.setTimeout(15000, () => {
			req.destroy(new Error('Request timed out after 15 s'));
		});
		req.end();
	});
}

function buildFetchRepoPrsError(statusCode: number | undefined, error: string | undefined): string {
	if (statusCode === 404) { return 'Repo not found or not accessible with current token'; }
	if (statusCode === 403) { return error || 'Access denied (private repo requires additional permissions)'; }
	return error ?? 'Unknown error';
}

/** Fetch all PRs from the last 30 days for a repo, paginating as needed. */
export async function fetchRepoPrs(
	owner: string,
	repo: string,
	token: string,
	since: Date,
	fetchPage: (owner: string, repo: string, token: string, page: number) => Promise<{ prs: any[]; statusCode?: number; error?: string }> = fetchRepoPrsPage,
): Promise<{ prs: any[]; error?: string }> {
	const allPrs: any[] = [];
	const MAX_PAGES = 5; // Cap at 500 PRs per repo
	for (let page = 1; page <= MAX_PAGES; page++) {
		const { prs, statusCode, error } = await fetchPage(owner, repo, token, page);
		if (error) { return { prs: allPrs, error: buildFetchRepoPrsError(statusCode, error) }; }
		if (prs.length === 0) { break; }
		for (const pr of prs) {
			if (new Date(pr.created_at) >= since) { allPrs.push(pr); }
		}
		const oldest = prs[prs.length - 1];
		if (new Date(oldest.created_at) < since || prs.length < 100) { break; }
	}
	return { prs: allPrs };
}

/**
 * Discover GitHub repos from workspace paths using git remote.
 * Deduplicates by owner/repo so each GitHub repo is only fetched once.
 */
export function discoverGitHubRepos(workspacePaths: string[]): { owner: string; repo: string }[] {
	const seen = new Set<string>();
	const repos: { owner: string; repo: string }[] = [];
	for (const workspacePath of workspacePaths) {
		try {
			const remote = childProcess.execSync('git remote get-url origin', {
				cwd: workspacePath,
				encoding: 'utf8',
				timeout: 3000,
				stdio: ['pipe', 'pipe', 'pipe'],
			}).trim();
			// Only process github.com remotes
			const match = remote.match(/github\.com[:/]([^/]+)\/([^/\s]+?)(?:\.git)?$/i);
			if (!match) { continue; }
			const key = `${match[1]}/${match[2]}`.toLowerCase();
			if (seen.has(key)) { continue; }
			seen.add(key);
			repos.push({ owner: match[1], repo: match[2] });
		} catch {
			// Not a git repo or no remote — skip
		}
	}
	return repos;
}
