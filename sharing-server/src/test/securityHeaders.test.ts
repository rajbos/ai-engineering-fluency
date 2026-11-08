/**
 * Security headers on the built-in HTML routes.
 *
 * Every page served by the dashboard router must send a nonce-based CSP plus framing,
 * sniffing and HSTS headers, and every inline <script>/<style> in the full rendered HTML
 * must carry that request's nonce, or the browser would refuse to run it. Uses an isolated
 * temporary SQLite database; no network access.
 */
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../app.js';
import { closeDb, getDb, upsertUpload, upsertUser, type UserRow } from '../db.js';
import { COOKIE_NAME, encodeSession, makeClaims } from '../session.js';

const app = createApp({
	extend: (a) => { a.get('/vendor/page', (c) => c.html('<script>window.vendor = 1</script>')); },
});
let dataDir: string;
let viewer: UserRow;
let admin: UserRow;
const previousDataDir = process.env.LOCAL_DATA_DIR;

function as(user: UserRow | null): RequestInit {
	return user ? { headers: { Cookie: `${COOKIE_NAME}=${encodeSession(makeClaims(user.id))}` } } : {};
}

/** The nonce from the CSP header, after checking the policy's shape. */
function assertSecurityHeaders(res: Response, label: string): string {
	const csp = res.headers.get('content-security-policy');
	assert.ok(csp, `${label}: missing Content-Security-Policy`);
	const nonce = /script-src 'nonce-([A-Za-z0-9+/=]+)'/.exec(csp)?.[1];
	assert.ok(nonce, `${label}: script-src must be nonce-only, got ${csp}`);
	assert.ok(!/script-src[^;]*'unsafe-inline'/.test(csp), `${label}: script-src must not allow unsafe-inline`);
	assert.match(csp, new RegExp(`style-src 'self' 'nonce-${nonce.replace(/[+/=]/g, '\\$&')}'`), `${label}: style-src`);
	assert.match(csp, /frame-ancestors 'none'/, `${label}: frame-ancestors`);
	assert.match(csp, /object-src 'none'/, `${label}: object-src`);
	assert.match(csp, /base-uri 'none'/, `${label}: base-uri`);
	assert.equal(res.headers.get('x-frame-options'), 'DENY', `${label}: X-Frame-Options`);
	assert.equal(res.headers.get('x-content-type-options'), 'nosniff', `${label}: X-Content-Type-Options`);
	assert.match(res.headers.get('strict-transport-security') ?? '', /max-age=\d+/, `${label}: Strict-Transport-Security`);
	assert.ok(res.headers.get('referrer-policy'), `${label}: Referrer-Policy`);
	return nonce;
}

/** Every <script> and <style> opening tag in the full HTML must carry exactly this nonce. */
function assertTagsCarryNonce(html: string, nonce: string, label: string): number {
	const tags = html.match(/<(script|style)\b[^>]*>/gi) ?? [];
	for (const tag of tags) {
		assert.ok(tag.includes(`nonce="${nonce}"`), `${label}: ${tag} lacks the request nonce`);
	}
	return tags.length;
}

before(() => {
	dataDir = mkdtempSync(join(tmpdir(), 'sharing-security-headers-'));
	process.env.LOCAL_DATA_DIR = dataDir;
	viewer = upsertUser(930001, 'viewer', 'Viewer Name', null);
	admin = upsertUser(930002, 'admin', 'Admin Name', null);
	getDb().prepare('UPDATE users SET is_admin = 1 WHERE id = ?').run(admin.id);
	upsertUpload(viewer.id, {
		day: new Date().toISOString().slice(0, 10), model: 'm', workspaceId: 'w', machineId: 'x',
		inputTokens: 100, outputTokens: 50, interactions: 3,
	});
});

after(() => {
	closeDb();
	if (previousDataDir === undefined) delete process.env.LOCAL_DATA_DIR;
	else process.env.LOCAL_DATA_DIR = previousDataDir;
	rmSync(dataDir, { recursive: true, force: true });
});

describe('HTML security headers', () => {
	test('/ redirects with the security headers set', async () => {
		const res = await app.request('/', as(viewer));
		assert.equal(res.status, 302);
		assertSecurityHeaders(res, '/');
	});

	const pages: Array<[string, () => UserRow | null, number]> = [
		['/dashboard', () => null, 1],      // sign-in page: layout <style> only
		['/dashboard', () => viewer, 6],
		['/team', () => viewer, 4],
		['/admin', () => admin, 4],
		['/auth/github', () => null, 1],    // OAuth not configured in tests: error page
	];
	for (const [path, user, minTags] of pages) {
		const label = `${path} (${user() ? 'signed in' : 'signed out'})`;
		test(`${label} sends a nonce CSP and tags every inline script and style with it`, async () => {
			const res = await app.request(path, as(user()));
			assert.match(res.headers.get('content-type') ?? '', /text\/html/);
			const nonce = assertSecurityHeaders(res, label);
			const count = assertTagsCarryNonce(await res.text(), nonce, label);
			assert.ok(count >= minTags, `${label}: expected at least ${minTags} inline tags, found ${count}`);
		});
	}

	test('each request gets a fresh nonce', async () => {
		const first = assertSecurityHeaders(await app.request('/team', as(viewer)), 'first');
		const second = assertSecurityHeaders(await app.request('/team', as(viewer)), 'second');
		assert.notEqual(first, second);
	});

	test('routes added through extend keep their own headers', async () => {
		const res = await app.request('/vendor/page');
		assert.equal(res.status, 200);
		assert.equal(res.headers.get('content-security-policy'), null);
	});
});
