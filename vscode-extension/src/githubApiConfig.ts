/**
 * Shared configuration constants for GitHub REST API requests.
 * Used by agentSessionsService.ts and githubPrService.ts.
 */

import * as vscode from 'vscode';

/** GitHub REST API hostname for github.com (the default, used when no enterprise URI is configured). */
export const GITHUB_API_HOSTNAME = 'api.github.com';

/** Where to reach a configured GitHub host: hostname for REST calls, REST path prefix, and GraphQL path. */
export interface GitHubApiEndpoints {
	/** REST API hostname, e.g. `api.github.com` or `api.tenant.ghe.com`. */
	hostname: string;
	/** Path prefix prepended to REST paths — empty for github.com/GHE.com, `/api/v3` for on-prem GitHub Enterprise Server. */
	restPathPrefix: string;
	/** GraphQL endpoint path — `/graphql` for github.com/GHE.com, `/api/graphql` for on-prem GitHub Enterprise Server. */
	graphQlPath: string;
}

const GITHUB_DOT_COM_ENDPOINTS: GitHubApiEndpoints = {
	hostname: GITHUB_API_HOSTNAME,
	restPathPrefix: '',
	graphQlPath: '/graphql',
};

/**
 * Derive the GitHub API endpoints for an optional GitHub Enterprise base URI, mirroring the same
 * derivation VS Code's own built-in GitHub Authentication provider (and the `github-enterprise.uri`
 * setting) uses to decide which host to authenticate against:
 *
 * - unset / empty / unparseable / a github.com URI → github.com defaults.
 * - GitHub Enterprise Cloud with data residency (authority ends in `.ghe.com`, e.g. `octocat.ghe.com`)
 *   → REST API on an `api.` subdomain (`https://api.octocat.ghe.com`), same paths as github.com.
 * - GitHub Enterprise Server (on-prem, any other host) → REST under `/api/v3`, GraphQL under `/api/graphql`.
 *
 * Pure function (no VS Code dependency) so it can be unit tested directly.
 */
export function deriveGitHubApiEndpoints(enterpriseUri: string | undefined): GitHubApiEndpoints {
	if (!enterpriseUri) { return GITHUB_DOT_COM_ENDPOINTS; }

	let url: URL;
	try {
		url = new URL(enterpriseUri);
	} catch {
		return GITHUB_DOT_COM_ENDPOINTS;
	}

	const authority = url.host;
	if (!authority || authority === 'github.com' || authority === 'www.github.com' || authority === 'api.github.com') {
		return GITHUB_DOT_COM_ENDPOINTS;
	}

	const isGheCloud = /\.ghe\.com$/i.test(authority);
	return isGheCloud
		? { hostname: `api.${authority}`, restPathPrefix: '', graphQlPath: '/graphql' }
		: { hostname: authority, restPathPrefix: '/api/v3', graphQlPath: '/api/graphql' };
}

/**
 * Read the user's configured GitHub Enterprise URI, if any (the same `github-enterprise.uri` setting
 * VS Code's built-in GitHub Authentication provider uses). Set this to authenticate against and query
 * a GHE.com or GitHub Enterprise Server instance instead of github.com.
 */
export function getConfiguredGitHubEnterpriseUri(): string | undefined {
	return vscode.workspace.getConfiguration().get<string>('github-enterprise.uri') || undefined;
}

/** The GitHub API endpoints to use for the current configuration (github.com, GHE.com, or GHES). */
export function getGitHubApiEndpoints(): GitHubApiEndpoints {
	return deriveGitHubApiEndpoints(getConfiguredGitHubEnterpriseUri());
}

/** User-Agent header value sent with all GitHub API requests. */
export const GITHUB_API_USER_AGENT = 'copilot-token-tracker';

/** Accept header for standard GitHub REST API v3 JSON responses. */
export const GITHUB_API_ACCEPT_V3 = 'application/vnd.github.v3+json';

/** GitHub API version header value (required by the agent/copilot endpoints). */
export const GITHUB_API_VERSION = '2022-11-28';

/**
 * Build standard headers for a GitHub REST API request that requires the
 * versioned agent endpoints (includes X-GitHub-Api-Version).
 */
export function buildGitHubApiHeaders(token: string): Record<string, string> {
	return {
		Authorization: `Bearer ${token}`,
		'User-Agent': GITHUB_API_USER_AGENT,
		Accept: GITHUB_API_ACCEPT_V3,
		'X-GitHub-Api-Version': GITHUB_API_VERSION,
	};
}
