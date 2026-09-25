/**
 * One join key for a repository, so session activity, the AI Readiness scan
 * and pull-request statistics can be matched up.
 *
 * Sessions record the workspace's git remote URL, the readiness scan records
 * `owner/repo` (when the origin resolved) and the PR collector records the
 * owner and name separately. All three reduce to a lowercase `owner/repo`.
 *
 * Pure — no VS Code API, no filesystem — so the CLI can reuse it.
 */

/**
 * Display name (`owner/repo`) for a git remote URL, or undefined when the URL
 * carries nothing usable. Handles HTTPS, `ssh://`, scp-style
 * (`git@host:owner/repo.git`) and `git://` remotes on any host.
 *
 * Query strings and fragments are dropped first so a credential smuggled into
 * a remote (`…/repo.git?token=…`) never becomes part of a label. User info in
 * an HTTPS remote (`https://user:token@host/…`) is never part of the result
 * because only the last two path segments are kept.
 */
export function repoDisplayFromRemote(remoteUrl: string | undefined | null): string | undefined {
	if (!remoteUrl) { return undefined; }
	const cleaned = remoteUrl.trim()
		.replace(/[?#].*$/, '')
		.replace(/\/+$/, '')
		.replace(/\.git$/i, '');
	// The last two segments, separated from the host by `/` (URLs) or `:` (scp-style).
	const match = /[:/]([^/:@\s]+)\/([^/:@\s]+)$/.exec(cleaned);
	if (!match) { return undefined; }
	const [, owner, repo] = match;
	return isNameSegment(owner) && isNameSegment(repo) ? `${owner}/${repo}` : undefined;
}

/** Lowercase `owner/repo` join key for a git remote URL. */
export function repoKeyFromRemote(remoteUrl: string | undefined | null): string | undefined {
	return repoDisplayFromRemote(remoteUrl)?.toLowerCase();
}

/** Lowercase join key for an `owner/repo` slug (readiness `nameWithOwner`, PR stats). */
export function repoKeyFromSlug(slug: string | undefined | null): string | undefined {
	const parts = slug?.trim().split('/');
	return parts && parts.length === 2 && parts.every(isNameSegment)
		? `${parts[0]}/${parts[1]}`.toLowerCase()
		: undefined;
}

function isNameSegment(segment: string): boolean {
	return /^[A-Za-z0-9._-]+$/.test(segment) && segment !== '.' && segment !== '..';
}
