import { createHash } from 'crypto';
import type { Context, Next } from 'hono';
import { upsertUser, type UserRow } from './db.js';
import {
	TOKEN_CACHE_TTL_MS,
	NEGATIVE_CACHE_TTL_MS,
	UPLOAD_RATE_MAX,
	UPLOAD_RATE_WINDOW_MS,
	IP_RATE_MAX,
	IP_RATE_WINDOW_MS,
	AUTH_MAP_MAX_ENTRIES,
	AUTH_MAP_SWEEP_INTERVAL_MS,
} from './config.js';

interface GitHubUserResponse {
	id: number;
	login: string;
	name: string | null;
	avatar_url: string;
}

/** Type guard that validates the shape of the GitHub /user API response at runtime. */
function isValidGitHubUserResponse(data: unknown): data is GitHubUserResponse {
	if (!data || typeof data !== 'object') return false;
	const d = data as Record<string, unknown>;
	return (
		typeof d['id'] === 'number' &&
		Number.isInteger(d['id']) &&
		d['id'] > 0 &&
		typeof d['login'] === 'string' &&
		d['login'].length > 0 &&
		(d['name'] === null || typeof d['name'] === 'string') &&
		typeof d['avatar_url'] === 'string' &&
		d['avatar_url'].length > 0
	);
}

interface CachedAuth {
	user: UserRow;
	expiresAt: number;
}

interface NegativeCacheEntry {
	bannedUntil: number;
}

// Token validation cache: SHA-256(token) → { user, expiresAt }
const tokenCache = new Map<string, CachedAuth>();

// Negative cache: SHA-256(token) → bannedUntil timestamp (short TTL for bad tokens)
const negativeCache = new Map<string, NegativeCacheEntry>();

// Upload rate limiter: github_id → { count, resetAt }
const uploadRateMap = new Map<number, { count: number; resetAt: number }>();

// Pre-auth IP rate limiter: IP → { count, resetAt }
const ipRateMap = new Map<string, { count: number; resetAt: number }>();

/** Removes all expired entries from the auth/rate-limit maps to keep memory bounded. */
export function sweepExpiredAuthEntries(now: number = Date.now()): void {
	for (const [key, value] of tokenCache) if (value.expiresAt <= now) tokenCache.delete(key);
	for (const [key, value] of negativeCache) if (value.bannedUntil <= now) negativeCache.delete(key);
	for (const [key, value] of uploadRateMap) if (value.resetAt <= now) uploadRateMap.delete(key);
	for (const [key, value] of ipRateMap) if (value.resetAt <= now) ipRateMap.delete(key);
}

/**
 * Ensures `map` has room for one more entry. Expired entries are swept first;
 * if the map is still at capacity, the oldest entries (Map insertion order)
 * are evicted so an attacker rotating tokens or spoofed IPs cannot grow the
 * maps without bound.
 */
function ensureMapCapacity<K, V>(map: Map<K, V>): void {
	if (map.size < AUTH_MAP_MAX_ENTRIES) return;
	sweepExpiredAuthEntries();
	while (map.size >= AUTH_MAP_MAX_ENTRIES) {
		const oldest = map.keys().next();
		if (oldest.done) break;
		map.delete(oldest.value);
	}
}

// Periodic background sweep so expired entries are reclaimed even without new
// inserts. unref() keeps the timer from holding the process open.
setInterval(sweepExpiredAuthEntries, AUTH_MAP_SWEEP_INTERVAL_MS).unref();

/**
 * Validates a GitHub Bearer token supplied by the client (e.g. the VS Code extension).
 * Resolves the token to a local user row, or returns null if the token is invalid,
 * the GitHub API is unreachable, or the user is not a member of ALLOWED_GITHUB_ORG.
 *
 * Results are cached for 10 minutes (positive) or 1 minute (negative) to reduce
 * outbound GitHub API calls.
 */
export async function validateGitHubToken(token: string): Promise<UserRow | null> {
	const cacheKey = createHash('sha256').update(token).digest('hex');

	// Check negative cache first
	const negative = negativeCache.get(cacheKey);
	if (negative && negative.bannedUntil > Date.now()) {
		return null;
	}

	// Check positive cache
	const cached = tokenCache.get(cacheKey);
	if (cached && cached.expiresAt > Date.now()) {
		return cached.user;
	}

	let response: Response;
	try {
		response = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${token}`,
				'User-Agent': 'copilot-sharing-server/1.0',
				Accept: 'application/vnd.github+json',
			},
			signal: AbortSignal.timeout(10_000),
		});
	} catch {
		// Network error — don't cache, let the caller retry
		return null;
	}

	if (!response.ok) {
		ensureMapCapacity(negativeCache);
		negativeCache.set(cacheKey, { bannedUntil: Date.now() + NEGATIVE_CACHE_TTL_MS });
		return null;
	}

	let rawData: unknown;
	try {
		rawData = await response.json();
	} catch {
		// Malformed JSON from GitHub API — don't cache, treat as transient failure
		return null;
	}

	if (!isValidGitHubUserResponse(rawData)) {
		// GitHub API returned an unexpected data shape — could indicate API version change
		console.warn('[auth] GitHub /user response failed schema validation');
		return null;
	}

	const data = rawData;

	// Optional org membership check
	const allowedOrg = process.env.ALLOWED_GITHUB_ORG;
	if (allowedOrg) {
		const isMember = await checkOrgMembership(token, data.login, allowedOrg);
		if (!isMember) {
			ensureMapCapacity(negativeCache);
			negativeCache.set(cacheKey, { bannedUntil: Date.now() + NEGATIVE_CACHE_TTL_MS });
			return null;
		}
	}

	const user = upsertUser(data.id, data.login, data.name, data.avatar_url);

	ensureMapCapacity(tokenCache);
	tokenCache.set(cacheKey, { user, expiresAt: Date.now() + TOKEN_CACHE_TTL_MS });
	return user;
}

/**
 * Checks whether `username` is an active public member of `org`.
 *
 * Uses GITHUB_ORG_CHECK_TOKEN (a server-configured PAT) when set, so that the
 * check works even when the org enforces SAML SSO — the server operator's PAT
 * is pre-authorized for the org, meaning the end user's token never needs
 * read:org scope or SSO authorization.
 *
 * Falls back to the user's own token if no server PAT is configured (works for
 * orgs with public membership and no SAML enforcement).
 */
async function checkOrgMembership(userToken: string, username: string, org: string): Promise<boolean> {
	// Prefer a server-side PAT (already SSO-authorized) so the user's OAuth token
	// doesn't need read:org or SAML SSO authorization.
	const usingServerToken = Boolean(process.env.GITHUB_ORG_CHECK_TOKEN);
	const checkToken = process.env.GITHUB_ORG_CHECK_TOKEN || userToken;
	try {
		const res = await fetch(`https://api.github.com/orgs/${org}/members/${username}`, {
			headers: {
				Authorization: `Bearer ${checkToken}`,
				'User-Agent': 'copilot-sharing-server/1.0',
				Accept: 'application/vnd.github+json',
			},
			signal: AbortSignal.timeout(10_000),
		});
		if (res.status === 204) return true;
		logOrgMembershipFailure(username, org, res.status, usingServerToken);
		return false;
	} catch (err) {
		console.error(`[auth] Org membership check for '${username}' in '${org}' failed with a network/timeout error:`, err);
		return false;
	}
}

/**
 * Logs the reason an org membership check came back negative, distinguishing
 * "the user genuinely isn't a member" (404) from "the check itself is broken"
 * (401/403 — usually an expired/invalid GITHUB_ORG_CHECK_TOKEN, or a user
 * token missing read:org/SSO authorization when no server PAT is configured).
 * Without this, both cases produce the exact same "not a member" outcome,
 * which is impossible to diagnose from the outside.
 */
function logOrgMembershipFailure(username: string, org: string, status: number, usingServerToken: boolean): void {
	if (status === 404) {
		console.info(`[auth] Org membership check: '${username}' is not a member of '${org}' (404).`);
	} else if (status === 401 || status === 403) {
		console.error(
			`[auth] Org membership check for '${username}' in '${org}' returned ${status} — the ` +
			`${usingServerToken ? 'GITHUB_ORG_CHECK_TOKEN' : "user's own"} token appears invalid/expired or lacks permission. ` +
			(usingServerToken
				? 'Rotate GITHUB_ORG_CHECK_TOKEN.'
				: "The user's token may need read:org scope or SSO authorization for this org."),
		);
	} else {
		console.warn(`[auth] Org membership check for '${username}' in '${org}' returned unexpected status ${status}.`);
	}
}

/** Returns true if the IP address is within the pre-auth rate limit window, false if it should be blocked. */
export function checkIpRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = ipRateMap.get(ip);
	if (!entry || entry.resetAt <= now) {
		ensureMapCapacity(ipRateMap);
		ipRateMap.set(ip, { count: 1, resetAt: now + IP_RATE_WINDOW_MS });
		return true;
	}
	if (entry.count >= IP_RATE_MAX) return false;
	entry.count++;
	return true;
}

/** Returns true if the user is within the upload rate limit window, false if they should be blocked. */
export function checkUploadRateLimit(userId: number): boolean {
	const now = Date.now();
	const entry = uploadRateMap.get(userId);
	if (!entry || entry.resetAt <= now) {
		ensureMapCapacity(uploadRateMap);
		uploadRateMap.set(userId, { count: 1, resetAt: now + UPLOAD_RATE_WINDOW_MS });
		return true;
	}
	if (entry.count >= UPLOAD_RATE_MAX) return false;
	entry.count++;
	return true;
}

export type AuthVariables = { user: UserRow };

/**
 * Hono middleware that enforces Bearer token authentication on API routes.
 * Applies IP-level rate limiting before token validation, then resolves the
 * token to a user and stores it in the Hono context for downstream handlers.
 */
export async function requireBearerAuth(c: Context, next: Next): Promise<Response | void> {
	// x-forwarded-for may contain a comma-separated chain; use only the first (client) IP.
	const forwardedFor = c.req.header('x-forwarded-for')?.split(',')[0]?.trim();
	const ip = forwardedFor || c.req.header('x-real-ip') || 'unknown';

	if (!checkIpRateLimit(ip)) {
		return c.json({ error: 'Too many requests' }, 429);
	}

	const authHeader = c.req.header('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const token = authHeader.slice(7);
	if (!token) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	const user = await validateGitHubToken(token);
	if (!user) {
		return c.json({ error: 'Unauthorized' }, 401);
	}

	c.set('user', user);
	await next();
}
