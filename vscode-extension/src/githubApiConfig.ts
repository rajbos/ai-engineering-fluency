/**
 * Shared configuration constants for GitHub REST API requests.
 * Used by agentSessionsService.ts and githubPrService.ts.
 */

/** GitHub REST API hostname. */
export const GITHUB_API_HOSTNAME = 'api.github.com';

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
