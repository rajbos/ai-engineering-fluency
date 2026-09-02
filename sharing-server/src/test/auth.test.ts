/**
 * Unit tests for the security-relevant logic in src/auth.ts:
 *  - validateGitHubToken: positive/negative caching, malformed GitHub
 *    responses, org membership gating
 *  - checkIpRateLimit / checkUploadRateLimit: cap enforcement, window reset
 *  - Bounded-cache behavior: sweepExpiredAuthEntries and the per-map entry
 *    cap with oldest-first eviction
 *  - requireBearerAuth middleware: Authorization header handling and
 *    x-forwarded-for normalization
 *
 * The GitHub API is never called: globalThis.fetch is replaced with a mock.
 * The database layer is real (node:sqlite) but pointed at a temp directory
 * via LOCAL_DATA_DIR, so upsertUser exercises the actual schema.
 *
 * NOTE: auth.ts keeps its caches and rate-limit maps in module-level state
 * that persists across tests, so every test uses unique tokens / IPs / user
 * ids to avoid crosstalk. Tests within this file run sequentially.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { Hono } from 'hono';
import {
	validateGitHubToken,
	checkIpRateLimit,
	checkUploadRateLimit,
	sweepExpiredAuthEntries,
	requireBearerAuth,
	type AuthVariables,
} from '../auth';
import { closeDb } from '../db';
import {
	TOKEN_CACHE_TTL_MS,
	NEGATIVE_CACHE_TTL_MS,
	IP_RATE_MAX,
	IP_RATE_WINDOW_MS,
	UPLOAD_RATE_MAX,
	UPLOAD_RATE_WINDOW_MS,
	AUTH_MAP_MAX_ENTRIES,
} from '../config';

// ── fetch mock ────────────────────────────────────────────────────────────────

interface RecordedFetch {
	url: string;
	headers: Record<string, string>;
}

/** Minimal stand-in for the parts of Response that auth.ts consumes. */
interface MockResponse {
	ok: boolean;
	status: number;
	json: () => Promise<unknown>;
}

const fetchCalls: RecordedFetch[] = [];
let fetchImpl: (url: string) => MockResponse | Promise<MockResponse> = () => {
	throw new Error('Unexpected fetch — no mock handler installed for this test');
};

const realFetch = globalThis.fetch;

function installFetchMock(): void {
	globalThis.fetch = (async (input: unknown, init?: { headers?: Record<string, string> }) => {
		const url = String(input);
		fetchCalls.push({ url, headers: init?.headers ?? {} });
		return fetchImpl(url) as unknown as globalThis.Response;
	}) as typeof fetch;
}

/** Number of fetch calls made so far (for cache-hit assertions). */
function fetchCount(): number {
	return fetchCalls.length;
}

function ghUser(overrides: Record<string, unknown> = {}): MockResponse {
	return {
		ok: true,
		status: 200,
		json: async () => ({
			id: nextGithubId,
			login: `user-${nextGithubId}`,
			name: 'Test User',
			avatar_url: 'https://example.com/avatar.png',
			...overrides,
		}),
	};
}

function httpError(status: number): MockResponse {
	return { ok: false, status, json: async () => ({ message: 'error' }) };
}

// Unique-value generators so tests never share cache / rate-limit keys.
let nextGithubId = 1000;
let tokenSeq = 0;
function uniqueToken(label: string): string {
	nextGithubId++;
	return `tok-${label}-${tokenSeq++}`;
}

// ── suite setup ───────────────────────────────────────────────────────────────

let dataDir: string;

before(() => {
	// Point the real SQLite layer at a temp directory (db init is lazy, so
	// setting this before the first upsertUser call is sufficient).
	dataDir = mkdtempSync(join(tmpdir(), 'sharing-server-auth-test-'));
	process.env.LOCAL_DATA_DIR = dataDir;
	delete process.env.ALLOWED_GITHUB_ORG;
	delete process.env.GITHUB_ORG_CHECK_TOKEN;
	installFetchMock();
});

after(() => {
	globalThis.fetch = realFetch;
	closeDb();
	try {
		rmSync(dataDir, { recursive: true, force: true });
	} catch {
		// Windows may keep WAL file handles open briefly — leftover temp files are harmless.
	}
});

// ── validateGitHubToken ───────────────────────────────────────────────────────

describe('validateGitHubToken', () => {
	test('resolves a valid token to a user and sends the token as a Bearer header', async () => {
		const token = uniqueToken('valid');
		fetchImpl = () => ghUser({ id: 42001, login: 'octocat', name: 'Octo Cat' });

		const user = await validateGitHubToken(token);

		assert.ok(user, 'expected a user row');
		assert.equal(user.github_id, 42001);
		assert.equal(user.github_login, 'octocat');
		const call = fetchCalls[fetchCalls.length - 1];
		assert.equal(call.url, 'https://api.github.com/user');
		assert.equal(call.headers['Authorization'], `Bearer ${token}`);
	});

	test('caches a successful validation (second call does not hit GitHub)', async () => {
		const token = uniqueToken('poscache');
		fetchImpl = () => ghUser();

		const first = await validateGitHubToken(token);
		const callsAfterFirst = fetchCount();
		const second = await validateGitHubToken(token);

		assert.ok(first && second);
		assert.equal(second.id, first.id);
		assert.equal(fetchCount(), callsAfterFirst, 'second call must be served from cache');
	});

	test('positive cache expires after TOKEN_CACHE_TTL_MS', async (t) => {
		t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
		const token = uniqueToken('posexpiry');
		fetchImpl = () => ghUser();

		await validateGitHubToken(token);
		const callsAfterFirst = fetchCount();

		t.mock.timers.setTime(Date.now() + TOKEN_CACHE_TTL_MS + 1);
		const user = await validateGitHubToken(token);

		assert.ok(user);
		assert.equal(fetchCount(), callsAfterFirst + 1, 'expired cache entry must trigger revalidation');
	});

	test('negative-caches a rejected token (second call does not hit GitHub)', async () => {
		const token = uniqueToken('negcache');
		fetchImpl = () => httpError(401);

		assert.equal(await validateGitHubToken(token), null);
		const callsAfterFirst = fetchCount();
		assert.equal(await validateGitHubToken(token), null);
		assert.equal(fetchCount(), callsAfterFirst, 'rejected token must be served from negative cache');
	});

	test('negative cache expires after NEGATIVE_CACHE_TTL_MS', async (t) => {
		t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
		const token = uniqueToken('negexpiry');
		fetchImpl = () => httpError(401);

		assert.equal(await validateGitHubToken(token), null);
		const callsAfterFirst = fetchCount();

		t.mock.timers.setTime(Date.now() + NEGATIVE_CACHE_TTL_MS + 1);
		fetchImpl = () => ghUser();
		const user = await validateGitHubToken(token);

		assert.ok(user, 'token must be revalidated after the negative TTL');
		assert.equal(fetchCount(), callsAfterFirst + 1);
	});

	test('network error returns null without caching (caller can retry)', async () => {
		const token = uniqueToken('neterr');
		fetchImpl = () => {
			throw new TypeError('fetch failed');
		};

		assert.equal(await validateGitHubToken(token), null);

		fetchImpl = () => ghUser();
		assert.ok(await validateGitHubToken(token), 'retry after a network error must reach GitHub');
	});

	test('malformed JSON body returns null without caching', async () => {
		const token = uniqueToken('badjson');
		fetchImpl = () => ({
			ok: true,
			status: 200,
			json: async () => {
				throw new SyntaxError('Unexpected token < in JSON');
			},
		});

		assert.equal(await validateGitHubToken(token), null);

		fetchImpl = () => ghUser();
		assert.ok(await validateGitHubToken(token), 'transient parse failure must not be negative-cached');
	});

	test('rejects GitHub responses that fail schema validation, without caching', async () => {
		const invalidBodies: Record<string, unknown> = {
			'string id': { id: '42', login: 'x', name: null, avatar_url: 'https://a/b.png' },
			'non-integer id': { id: 1.5, login: 'x', name: null, avatar_url: 'https://a/b.png' },
			'zero id': { id: 0, login: 'x', name: null, avatar_url: 'https://a/b.png' },
			'empty login': { id: 7, login: '', name: null, avatar_url: 'https://a/b.png' },
			'missing login': { id: 7, name: null, avatar_url: 'https://a/b.png' },
			'numeric name': { id: 7, login: 'x', name: 42, avatar_url: 'https://a/b.png' },
			'empty avatar_url': { id: 7, login: 'x', name: null, avatar_url: '' },
			'null body': null,
			'array body': [],
			'string body': 'nope',
		};

		for (const [label, body] of Object.entries(invalidBodies)) {
			const token = uniqueToken('schema');
			fetchImpl = () => ({ ok: true, status: 200, json: async () => body });
			assert.equal(await validateGitHubToken(token), null, `payload with ${label} must be rejected`);

			// A schema failure is treated as transient, so a corrected response
			// for the same token must succeed (proves it was not negative-cached).
			fetchImpl = () => ghUser();
			assert.ok(await validateGitHubToken(token), `schema failure (${label}) must not be negative-cached`);
		}
	});
});

describe('validateGitHubToken org membership gating', () => {
	test('allows members of ALLOWED_GITHUB_ORG and checks the right endpoint', async (t) => {
		process.env.ALLOWED_GITHUB_ORG = 'test-org';
		t.after(() => delete process.env.ALLOWED_GITHUB_ORG);

		const token = uniqueToken('orgmember');
		fetchImpl = (url) =>
			url.includes('/orgs/') ? { ok: true, status: 204, json: async () => ({}) } : ghUser({ login: 'member-user' });

		const user = await validateGitHubToken(token);

		assert.ok(user, 'org member must be allowed');
		const orgCall = fetchCalls[fetchCalls.length - 1];
		assert.equal(orgCall.url, 'https://api.github.com/orgs/test-org/members/member-user');
		assert.equal(orgCall.headers['Authorization'], `Bearer ${token}`, 'falls back to the user token when no server PAT is set');
	});

	test('rejects non-members and negative-caches the result', async (t) => {
		process.env.ALLOWED_GITHUB_ORG = 'test-org';
		t.after(() => delete process.env.ALLOWED_GITHUB_ORG);

		const token = uniqueToken('orgnonmember');
		fetchImpl = (url) => (url.includes('/orgs/') ? httpError(404) : ghUser());

		assert.equal(await validateGitHubToken(token), null);
		const callsAfterFirst = fetchCount();
		assert.equal(await validateGitHubToken(token), null);
		assert.equal(fetchCount(), callsAfterFirst, 'non-member rejection must be negative-cached');
	});

	test('uses GITHUB_ORG_CHECK_TOKEN for the membership check when configured', async (t) => {
		process.env.ALLOWED_GITHUB_ORG = 'test-org';
		process.env.GITHUB_ORG_CHECK_TOKEN = 'server-pat-123';
		t.after(() => {
			delete process.env.ALLOWED_GITHUB_ORG;
			delete process.env.GITHUB_ORG_CHECK_TOKEN;
		});

		const token = uniqueToken('orgpat');
		fetchImpl = (url) =>
			url.includes('/orgs/') ? { ok: true, status: 204, json: async () => ({}) } : ghUser();

		assert.ok(await validateGitHubToken(token));
		const orgCall = fetchCalls[fetchCalls.length - 1];
		assert.equal(orgCall.headers['Authorization'], 'Bearer server-pat-123');
	});
});

// ── Rate limiters ─────────────────────────────────────────────────────────────

describe('checkIpRateLimit', () => {
	test('allows exactly IP_RATE_MAX requests per window, then blocks', () => {
		const ip = 'ip-cap-test';
		for (let i = 0; i < IP_RATE_MAX; i++) {
			assert.equal(checkIpRateLimit(ip), true, `request ${i + 1} of ${IP_RATE_MAX} must be allowed`);
		}
		assert.equal(checkIpRateLimit(ip), false, 'request over the cap must be blocked');
		assert.equal(checkIpRateLimit(ip), false, 'stays blocked while the window is open');
	});

	test('resets the counter after IP_RATE_WINDOW_MS', (t) => {
		t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
		const ip = 'ip-window-test';
		for (let i = 0; i < IP_RATE_MAX; i++) checkIpRateLimit(ip);
		assert.equal(checkIpRateLimit(ip), false);

		t.mock.timers.setTime(Date.now() + IP_RATE_WINDOW_MS + 1);
		assert.equal(checkIpRateLimit(ip), true, 'new window must start after the reset time');
		assert.equal(checkIpRateLimit(ip), true, 'counter must have restarted from 1');
	});
});

describe('checkUploadRateLimit', () => {
	test('allows exactly UPLOAD_RATE_MAX uploads per window, then blocks', () => {
		const userId = 910001;
		for (let i = 0; i < UPLOAD_RATE_MAX; i++) {
			assert.equal(checkUploadRateLimit(userId), true, `upload ${i + 1} of ${UPLOAD_RATE_MAX} must be allowed`);
		}
		assert.equal(checkUploadRateLimit(userId), false, 'upload over the cap must be blocked');
	});

	test('resets the counter after UPLOAD_RATE_WINDOW_MS', (t) => {
		t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
		const userId = 910002;
		for (let i = 0; i < UPLOAD_RATE_MAX; i++) checkUploadRateLimit(userId);
		assert.equal(checkUploadRateLimit(userId), false);

		t.mock.timers.setTime(Date.now() + UPLOAD_RATE_WINDOW_MS + 1);
		assert.equal(checkUploadRateLimit(userId), true, 'new window must start after the reset time');
	});
});

// ── Bounded-cache behavior ────────────────────────────────────────────────────

describe('sweepExpiredAuthEntries', () => {
	// These tests pass an explicit `now` to the sweep while the subsequent
	// rate-limit / cache check runs at real time. That distinguishes "entry was
	// deleted by the sweep" from "entry expired naturally": a surviving entry
	// would still be inside its window at real time.

	test('keeps unexpired rate-limit entries', () => {
		const userId = 920001;
		for (let i = 0; i < UPLOAD_RATE_MAX; i++) checkUploadRateLimit(userId);
		assert.equal(checkUploadRateLimit(userId), false);

		sweepExpiredAuthEntries(Date.now());
		assert.equal(checkUploadRateLimit(userId), false, 'a live entry must survive the sweep');
	});

	test('removes expired upload rate-limit entries', () => {
		const userId = 920002;
		for (let i = 0; i < UPLOAD_RATE_MAX; i++) checkUploadRateLimit(userId);
		assert.equal(checkUploadRateLimit(userId), false);

		sweepExpiredAuthEntries(Date.now() + UPLOAD_RATE_WINDOW_MS + 1);
		assert.equal(checkUploadRateLimit(userId), true, 'the swept entry must be gone, so a fresh window starts');
	});

	test('removes expired IP rate-limit entries', () => {
		const ip = 'ip-sweep-test';
		for (let i = 0; i < IP_RATE_MAX; i++) checkIpRateLimit(ip);
		assert.equal(checkIpRateLimit(ip), false);

		sweepExpiredAuthEntries(Date.now() + IP_RATE_WINDOW_MS + 1);
		assert.equal(checkIpRateLimit(ip), true);
	});

	test('removes expired positive token-cache entries', async () => {
		const token = uniqueToken('sweeppos');
		fetchImpl = () => ghUser();
		await validateGitHubToken(token);
		const callsAfterFirst = fetchCount();

		// Entry is still live at real time — a sweep at real time must keep it.
		sweepExpiredAuthEntries(Date.now());
		await validateGitHubToken(token);
		assert.equal(fetchCount(), callsAfterFirst, 'live cache entry must survive the sweep');

		sweepExpiredAuthEntries(Date.now() + TOKEN_CACHE_TTL_MS + 1);
		await validateGitHubToken(token);
		assert.equal(fetchCount(), callsAfterFirst + 1, 'swept cache entry must force revalidation');
	});

	test('removes expired negative-cache entries', async () => {
		const token = uniqueToken('sweepneg');
		fetchImpl = () => httpError(401);
		assert.equal(await validateGitHubToken(token), null);
		const callsAfterFirst = fetchCount();

		assert.equal(await validateGitHubToken(token), null);
		assert.equal(fetchCount(), callsAfterFirst, 'sanity: negative cache is active');

		sweepExpiredAuthEntries(Date.now() + NEGATIVE_CACHE_TTL_MS + 1);
		fetchImpl = () => ghUser();
		assert.ok(await validateGitHubToken(token), 'swept negative entry must allow revalidation');
		assert.equal(fetchCount(), callsAfterFirst + 1);
	});
});

// ── requireBearerAuth middleware ──────────────────────────────────────────────

describe('requireBearerAuth', () => {
	const app = new Hono<{ Variables: AuthVariables }>();
	app.use('*', requireBearerAuth);
	app.get('/me', (c) => c.json({ login: c.get('user').github_login }));

	/** Issues a request with a per-test client IP so tests don't share rate-limit buckets. */
	function request(headers: Record<string, string>): Promise<globalThis.Response> {
		return Promise.resolve(app.request('/me', { headers }));
	}

	test('rejects a request without an Authorization header', async () => {
		const res = await request({ 'x-real-ip': 'mw-noheader' });
		assert.equal(res.status, 401);
		assert.deepEqual(await res.json(), { error: 'Unauthorized' });
	});

	test('rejects a non-Bearer Authorization header', async () => {
		const res = await request({ 'x-real-ip': 'mw-basic', Authorization: 'Basic dXNlcjpwYXNz' });
		assert.equal(res.status, 401);
	});

	test('rejects an empty Bearer token without calling GitHub', async () => {
		const callsBefore = fetchCount();
		const res = await request({ 'x-real-ip': 'mw-empty', Authorization: 'Bearer ' });
		assert.equal(res.status, 401);
		assert.equal(fetchCount(), callsBefore, 'an empty token must be rejected before any GitHub call');
	});

	test('rejects an invalid token with 401', async () => {
		fetchImpl = () => httpError(401);
		const res = await request({ 'x-real-ip': 'mw-badtoken', Authorization: `Bearer ${uniqueToken('mwbad')}` });
		assert.equal(res.status, 401);
	});

	test('accepts a valid token and exposes the user to downstream handlers', async () => {
		fetchImpl = () => ghUser({ id: 43001, login: 'middleware-user' });
		const res = await request({ 'x-real-ip': 'mw-valid', Authorization: `Bearer ${uniqueToken('mwok')}` });
		assert.equal(res.status, 200);
		assert.deepEqual(await res.json(), { login: 'middleware-user' });
	});

	test('rate-limits by the first IP of a comma-separated x-forwarded-for chain', async () => {
		// Exhaust the per-IP budget using varying proxy chains behind the same client IP.
		for (let i = 0; i < IP_RATE_MAX; i++) {
			const res = await request({ 'x-forwarded-for': `xff-client , 10.0.0.${i % 250}` });
			assert.equal(res.status, 401, 'pre-limit requests fail auth, not rate limiting');
		}

		// Same client IP with a different proxy tail — only first-IP normalization
		// maps this onto the exhausted bucket.
		const blocked = await request({ 'x-forwarded-for': 'xff-client, 172.16.0.1, 192.168.0.1' });
		assert.equal(blocked.status, 429);
		assert.deepEqual(await blocked.json(), { error: 'Too many requests' });

		// A different client IP behind the same proxy is not affected.
		const other = await request({ 'x-forwarded-for': 'xff-other-client, 10.0.0.1' });
		assert.equal(other.status, 401, 'a different client IP must not share the exhausted bucket');
	});

	test('falls back to x-real-ip when x-forwarded-for is absent', async () => {
		for (let i = 0; i < IP_RATE_MAX; i++) {
			await request({ 'x-real-ip': 'mw-realip-bucket' });
		}
		const blocked = await request({ 'x-real-ip': 'mw-realip-bucket' });
		assert.equal(blocked.status, 429);
	});
});

// ── Per-map entry cap with oldest-first eviction ──────────────────────────────
// Runs last: it deliberately fills the shared IP rate-limit map past its cap.

describe('bounded map eviction', () => {
	test('evicts the oldest entries once AUTH_MAP_MAX_ENTRIES is reached', () => {
		// victimOld is inserted first and exhausted so it is verifiably blocked.
		const victimOld = 'evict-victim-old';
		for (let i = 0; i <= IP_RATE_MAX; i++) checkIpRateLimit(victimOld);
		assert.equal(checkIpRateLimit(victimOld), false, 'sanity: victimOld starts out blocked');

		// Age victimOld below half the map, then add victimNew near the top.
		for (let i = 0; i < 5000; i++) checkIpRateLimit(`evict-filler-a-${i}`);
		const victimNew = 'evict-victim-new';
		for (let i = 0; i <= IP_RATE_MAX; i++) checkIpRateLimit(victimNew);
		assert.equal(checkIpRateLimit(victimNew), false, 'sanity: victimNew starts out blocked');

		// Push the map past its cap. Oldest-first eviction must reclaim
		// victimOld while keeping victimNew (which has ~8k newer neighbours,
		// well under the 10k cap).
		for (let i = 0; i < AUTH_MAP_MAX_ENTRIES - 2000; i++) checkIpRateLimit(`evict-filler-b-${i}`);

		assert.equal(
			checkIpRateLimit(victimOld),
			true,
			'victimOld must have been evicted (fresh window despite being mid-rate-limit)',
		);
		assert.equal(checkIpRateLimit(victimNew), false, 'victimNew must have survived the eviction');
	});
});
