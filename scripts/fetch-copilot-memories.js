#!/usr/bin/env node
'use strict';
/**
 * Fetch GitHub Copilot's *server-side* repository memories — "what has the coding
 * agent already learned about this repo?"
 *
 * This repo already reports Copilot's **local** memory files (the Markdown notes
 * `GitHub.copilot-chat`'s memory-tool writes under `workspaceStorage/<hash>/`, see
 * `src/copilotMemoryFiles.ts` and the `memory-files` CLI command). Those are
 * per-machine. GitHub additionally keeps a *server-side*, per-repository memory store
 * for the Copilot coding agent (SWE agent) — the same list that renders under
 * `Settings -> Copilot -> Memory` on a repository, currently in preview. Nothing in
 * this repo reads that store yet; this script is the discovery probe for it.
 *
 * ## API contract
 *
 * Reverse-engineered from the shipped Copilot CLI bundle
 * (`~/.copilot/pkg/universal/<version>/index.js`), which is the authoritative
 * consumer — there is no public documentation for these routes. Base URL is the
 * Copilot API host (`https://api.githubcopilot.com`), or the agent endpoint with a
 * trailing `/agent` stripped when one is configured:
 *
 *   GET  {base}/agents/swe/internal/memory/v0/{owner}/{repo}/enabled
 *        -> 200 `{ "enabled": boolean }`
 *   GET  {base}/agents/swe/internal/memory/v0/{owner}/{repo}/recent?limit=N
 *        -> 200 `MemoryResponse[]`, or 204 No Content when the repo has none.
 *        The CLI requests `limit=20` — that is its own constant, not a server cap.
 *   PUT  {base}/agents/swe/internal/memory/v0/{owner}/{repo}
 *        -> stores one memory. Deliberately NOT implemented here: this script is
 *           read-only, so running it can never pollute a repository's memory store.
 *
 * Required headers are `Authorization: Bearer <token>` and `Copilot-Integration-Id`.
 * Note the `Bearer` scheme specifically — `gh api` sends `Authorization: token <t>`,
 * which these routes reject with 401, so the request is made with `fetch` directly
 * rather than through `gh api`.
 *
 * `MemoryResponse`, as observed on a live repository:
 *   { id, subject, fact, citations: string[], reason, scope: "repository",
 *     source: { interactionId, agent, baseModel },
 *     billingOrganizationId, billingEnterpriseId }
 * Note there is no timestamp: the server returns "recent" in its own usefulness
 * ranking (matching the web UI's "Ranked by usefulness"), so memories cannot be
 * aged locally — only their citations can be checked for staleness. `source` also
 * carries no `integrationId`, despite the CLI's own write payload sending one.
 * Unknown fields are printed rather than dropped, so schema drift shows up here
 * instead of being silently projected away.
 *
 * ## Credentials
 *
 * The token is read from `gh auth token` and used only as a request header. It is
 * never printed, written to disk, or included in any output — including `--json`
 * and error output, where only the HTTP status and response body are surfaced.
 *
 * Usage:
 *   node scripts/fetch-copilot-memories.js [--repo owner/name] [--limit N] [--json]
 */

const { execFileSync } = require('child_process');

const COPILOT_API_BASE = 'https://api.githubcopilot.com';
const MEMORY_PATH_PREFIX = 'agents/swe/internal/memory/v0';
/** The Copilot CLI's own default; mirrored so our output matches what an agent would actually see. */
const DEFAULT_LIMIT = 20;
/**
 * The integration id must be one the memory service recognizes, otherwise every route
 * answers `403 memory is disabled for this client` — `vscode-chat`, for instance, is
 * rejected. This is the Copilot CLI's own id, so it is known-good for these routes.
 */
const INTEGRATION_ID = 'copilot-developer-cli';

function parseArgs(argv) {
	const options = { repo: undefined, limit: DEFAULT_LIMIT, json: false };
	for (let i = 0; i < argv.length; i++) {
		const arg = argv[i];
		if (arg === '--json') {
			options.json = true;
		} else if (arg === '--repo') {
			options.repo = argv[++i];
		} else if (arg === '--limit') {
			const value = Number(argv[++i]);
			if (!Number.isInteger(value) || value < 1) {
				throw new Error('--limit must be a positive integer');
			}
			options.limit = value;
		} else {
			throw new Error(`Unknown argument: ${arg}`);
		}
	}
	return options;
}

/** Hosts whose remotes name a repository on GitHub.com. */
const GITHUB_HOSTS = new Set(['github.com', 'www.github.com', 'ssh.github.com']);

/**
 * Replace any `user:password@` userinfo in a remote URL with `***@`.
 *
 * A git remote can carry an embedded credential (`https://user:token@host/owner/repo`), and
 * this script promises above that it never prints one. An error message quoting the remote
 * verbatim would break that promise for the one remote shape most likely to be misconfigured,
 * so the URL is redacted before it is ever shown. Falls back to dropping the whole URL if it
 * cannot be parsed, since an unparseable string cannot be redacted with confidence.
 */
function redactRemoteUrl(remoteUrl) {
	const scpMatch = /^([^@/]+)@([^/:]+):(.+)$/.exec(remoteUrl);
	if (scpMatch) {
		// scp-style (`user@host:path`) carries a username but never a password.
		return `***@${scpMatch[2]}:${scpMatch[3]}`;
	}
	try {
		const url = new URL(remoteUrl);
		if (!url.username && !url.password) { return remoteUrl; }
		url.username = '***';
		url.password = '';
		return url.toString();
	} catch {
		return '<unparseable remote URL>';
	}
}

/**
 * Resolve `owner/name` from the `origin` remote, accepting the scp-style SSH
 * (`git@github.com:owner/name.git`), `ssh://` and HTTPS
 * (`https://github.com/owner/name`) spellings.
 *
 * The host is matched exactly rather than found as a substring: `https://notgithub.com/o/r`
 * contains "github.com/o/r", and accepting it would send this script's token to the Copilot
 * API asking about an unrelated repository. Mirrors `parseRepoFromRemoteUrl()` in
 * `src/copilotServerMemories.ts` — kept as its own copy because this probe is a dependency-free
 * CommonJS script that deliberately does not need the TypeScript build.
 */
function resolveRepoFromGit() {
	const url = execFileSync('git', ['remote', 'get-url', 'origin'], { encoding: 'utf8' }).trim();
	const scpMatch = /^(?:[^@/]+@)?([^/:]+):(?!\/)(.+)$/.exec(url);
	let host = '';
	let repoPath = '';
	if (scpMatch) {
		host = scpMatch[1];
		repoPath = scpMatch[2];
	} else {
		try {
			const parsed = new URL(url);
			host = parsed.hostname;
			repoPath = parsed.pathname;
		} catch {
			// Leave both empty; the shared failure below reports it with the URL redacted.
		}
	}

	const segments = repoPath.replace(/^\/+/, '').replace(/\/+$/, '').replace(/\.git$/i, '').split('/');
	if (!GITHUB_HOSTS.has(host.toLowerCase()) || segments.length !== 2 || !segments[0] || !segments[1]) {
		throw new Error(`Could not parse a GitHub owner/repo from the origin remote: ${redactRemoteUrl(url)}`);
	}
	return `${segments[0]}/${segments[1]}`;
}

/** Read the GitHub token from the `gh` CLI. The value is returned for header use only. */
function readToken() {
	const token = execFileSync('gh', ['auth', 'token'], { encoding: 'utf8' }).trim();
	if (!token) {
		throw new Error('`gh auth token` returned nothing — run `gh auth login` first.');
	}
	return token;
}

function memoryUrl(repo, suffix, limit) {
	const url = new URL(`${COPILOT_API_BASE}/${MEMORY_PATH_PREFIX}/${repo}/${suffix}`);
	if (limit !== undefined) {
		url.searchParams.set('limit', String(limit));
	}
	return url.toString();
}

/**
 * Issue one authenticated GET. Returns the parsed body plus the status, so callers can
 * distinguish "no memories" (204) from "memories" (200) from an error, the way the CLI does.
 * On a non-OK status the body text is returned rather than thrown, so the caller can report
 * *why* — a 401 (token lacks Copilot access) and a 404 (memory not enabled for this repo)
 * are very different answers to "are there memories here?".
 */
async function getJson(url, token) {
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			'Copilot-Integration-Id': INTEGRATION_ID,
			Accept: 'application/json',
		},
	});
	if (response.status === 204) {
		return { status: 204, body: null };
	}
	const text = await response.text();
	if (!response.ok) {
		return { status: response.status, body: null, error: text };
	}
	try {
		return { status: response.status, body: JSON.parse(text) };
	} catch {
		return { status: response.status, body: null, error: `Non-JSON response: ${text.slice(0, 500)}` };
	}
}

function printReport(repo, enabled, memories) {
	process.stdout.write(`\nCopilot Server Memories — ${repo}\n`);
	process.stdout.write('='.repeat(50) + '\n\n');
	process.stdout.write(`Memory enabled for repo: ${enabled === undefined ? 'unknown' : enabled}\n`);
	process.stdout.write(`Memories returned:       ${memories.length}\n\n`);

	for (const memory of memories) {
		const citations = Array.isArray(memory.citations) && memory.citations.length > 0
			? memory.citations.join(', ')
			: '<none>';
		process.stdout.write(`• ${memory.subject ?? '<no subject>'}\n`);
		process.stdout.write(`    fact:      ${memory.fact ?? ''}\n`);
		process.stdout.write(`    citations: ${citations}\n`);
		if (memory.reason) {
			process.stdout.write(`    reason:    ${memory.reason}\n`);
		}
		if (memory.source) {
			process.stdout.write(`    source:    ${JSON.stringify(memory.source)}\n`);
		}
		// Surface anything the CLI's known shape does not cover — discovering these
		// extra fields (the web UI shows a model name and an integration label) is
		// the whole reason this probe exists.
		const known = new Set(['id', 'subject', 'fact', 'citations', 'reason', 'source']);
		const extra = Object.keys(memory).filter((key) => !known.has(key));
		if (extra.length > 0) {
			process.stdout.write(`    extra:     ${JSON.stringify(Object.fromEntries(extra.map((k) => [k, memory[k]])))}\n`);
		}
		process.stdout.write('\n');
	}
}

async function main() {
	const options = parseArgs(process.argv.slice(2));
	const repo = options.repo ?? resolveRepoFromGit();
	const token = readToken();

	const enabledResult = await getJson(memoryUrl(repo, 'enabled'), token);
	const recentResult = await getJson(memoryUrl(repo, 'recent', options.limit), token);

	const enabled = enabledResult.body && typeof enabledResult.body.enabled === 'boolean'
		? enabledResult.body.enabled
		: undefined;
	const memories = Array.isArray(recentResult.body) ? recentResult.body : [];

	if (options.json) {
		process.stdout.write(JSON.stringify({
			repo,
			enabled: { status: enabledResult.status, ...(enabledResult.error ? { error: enabledResult.error } : {}), value: enabled },
			recent: { status: recentResult.status, ...(recentResult.error ? { error: recentResult.error } : {}), memories },
		}, null, 2) + '\n');
		return;
	}

	if (enabledResult.error) {
		process.stdout.write(`\n[enabled] HTTP ${enabledResult.status}: ${enabledResult.error}\n`);
	}
	if (recentResult.error) {
		process.stdout.write(`[recent]  HTTP ${recentResult.status}: ${recentResult.error}\n`);
	}
	printReport(repo, enabled, memories);
	if (recentResult.status === 204) {
		process.stdout.write('Server returned 204 No Content — this repository has no stored memories.\n');
	}
}

// Only run when invoked directly. Without this guard, merely requiring the file — which a
// test doing so to reach the helpers below would — performs a live authenticated request.
if (require.main === module) {
	main().catch((error) => {
		process.stderr.write(`${error.message}\n`);
		process.exitCode = 1;
	});
}

module.exports = { redactRemoteUrl, resolveRepoFromGit, memoryUrl, parseArgs };
