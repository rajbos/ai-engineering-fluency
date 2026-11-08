/**
 * Dashboard cookies are `Secure` unless NODE_ENV explicitly says development or test,
 * failing closed like the SESSION_SECRET check: an unset or unexpected NODE_ENV is treated
 * as production. Exercises the real OAuth routes with GitHub stubbed (fetch is replaced)
 * and an isolated temporary SQLite database.
 */
import { after, before, beforeEach, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Hono } from 'hono';
import { closeDb } from '../db.js';
import { COOKIE_NAME, OAUTH_STATE_COOKIE, shouldUseSecureCookies } from '../session.js';

const KEYS = ['NODE_ENV', 'SESSION_SECRET', 'LOCAL_DATA_DIR', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET', 'ALLOWED_GITHUB_ORG'] as const;
const saved: Record<string, string | undefined> = {};
const realFetch = globalThis.fetch;
let dataDir: string;
let app: Hono;

/** NODE_ENV values to try, and whether each must produce Secure cookies. */
const CASES: Array<[string | undefined, boolean]> = [
	[undefined, true],
	['production', true],
	['staging', true],
	['', true],
	['development', false],
	['test', false],
];

function setNodeEnv(value: string | undefined): void {
	if (value === undefined) delete process.env.NODE_ENV;
	else process.env.NODE_ENV = value;
}

/** The Set-Cookie header for `name`, or undefined. */
function setCookieFor(res: Response, name: string): string | undefined {
	return res.headers.getSetCookie().find(h => h.startsWith(`${name}=`));
}

before(async () => {
	for (const k of KEYS) saved[k] = process.env[k];
	dataDir = mkdtempSync(join(tmpdir(), 'sharing-cookie-security-'));
	process.env.LOCAL_DATA_DIR = dataDir;
	process.env.SESSION_SECRET = 'cookie-security-test-secret-0123456789abcdef';
	// Read when the dashboard module loads, so set before importing the app.
	process.env.GITHUB_CLIENT_ID = 'test-client-id';
	process.env.GITHUB_CLIENT_SECRET = 'test-client-secret';
	delete process.env.ALLOWED_GITHUB_ORG;
	const { createApp } = await import('../app.js');
	app = createApp();
	globalThis.fetch = (async (input: string | URL | Request) => {
		const url = String(input instanceof Request ? input.url : input);
		if (url === 'https://github.com/login/oauth/access_token') {
			return new Response(JSON.stringify({ access_token: 'gho_stubbed' }), { headers: { 'Content-Type': 'application/json' } });
		}
		if (url === 'https://api.github.com/user') {
			return new Response(JSON.stringify({ id: 940001, login: 'cookie-user', name: 'Cookie User', avatar_url: null }), { headers: { 'Content-Type': 'application/json' } });
		}
		throw new Error(`Unexpected fetch: ${url}`);
	}) as typeof fetch;
});

after(() => {
	globalThis.fetch = realFetch;
	closeDb();
	for (const k of KEYS) {
		if (saved[k] === undefined) delete process.env[k];
		else process.env[k] = saved[k];
	}
	rmSync(dataDir, { recursive: true, force: true });
});

describe('shouldUseSecureCookies', () => {
	for (const [nodeEnv, secure] of CASES) {
		test(`NODE_ENV=${JSON.stringify(nodeEnv)} -> ${secure}`, () => {
			assert.equal(shouldUseSecureCookies({ NODE_ENV: nodeEnv }), secure);
		});
	}
});

describe('dashboard cookies', () => {
	beforeEach(() => setNodeEnv(saved.NODE_ENV));

	for (const [nodeEnv, secure] of CASES) {
		test(`OAuth state, session and logout cookies with NODE_ENV=${JSON.stringify(nodeEnv)} are ${secure ? '' : 'not '}Secure`, async () => {
			setNodeEnv(nodeEnv);

			const start = await app.request('/auth/github');
			assert.equal(start.status, 302);
			const stateCookie = setCookieFor(start, OAUTH_STATE_COOKIE);
			assert.ok(stateCookie, 'expected an OAuth state cookie');
			assert.equal(/;\s*Secure/i.test(stateCookie), secure, stateCookie);
			assert.match(stateCookie, /;\s*HttpOnly/i);

			const state = new URL(start.headers.get('location')!).searchParams.get('state')!;
			const callback = await app.request(`/auth/github/callback?code=stub&state=${encodeURIComponent(state)}`, {
				headers: { Cookie: `${OAUTH_STATE_COOKIE}=${state}` },
			});
			assert.equal(callback.status, 302);
			assert.equal(callback.headers.get('location'), '/dashboard');
			const session = setCookieFor(callback, COOKIE_NAME);
			assert.ok(session, 'expected a session cookie');
			assert.equal(/;\s*Secure/i.test(session), secure, session);
			assert.match(session, /;\s*HttpOnly/i);
			assert.match(session, /;\s*SameSite=Lax/i);

			const logout = setCookieFor(await app.request('/auth/logout'), COOKIE_NAME);
			assert.ok(logout, 'expected the session cookie to be cleared');
			assert.equal(/;\s*Secure/i.test(logout), secure, logout);
		});
	}
});
