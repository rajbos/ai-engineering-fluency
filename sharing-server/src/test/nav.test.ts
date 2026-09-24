/**
 * Unit tests for the downstream nav-link hook.
 *
 * The rendered links are interpolated straight into the dashboard header, so the
 * escaping and same-origin rules are a security boundary, not cosmetics: these
 * tests pin the behaviour that stops a bad link from injecting markup or
 * navigating off the server.
 */
import { test, describe, afterEach, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { renderNavExtra, setNavExtra, type NavLink } from '../nav.js';
import { createApp } from '../app.js';
import { closeDb, upsertUser, type UserRow } from '../db.js';
import { COOKIE_NAME, encodeSession, makeClaims } from '../session.js';

afterEach(() => setNavExtra(undefined));

describe('renderNavExtra', () => {
	test('renders nothing when no provider is registered', () => {
		assert.equal(renderNavExtra('/dashboard'), '');
	});

	test('renders a registered link as an anchor', () => {
		setNavExtra(() => [{ href: '/vendor', label: 'Vendor Insights' }]);
		assert.equal(renderNavExtra(), '<a href="/vendor">Vendor Insights</a>');
	});

	test('marks the active link with aria-current', () => {
		setNavExtra(() => [{ href: '/vendor', label: 'Vendor' }]);
		assert.match(renderNavExtra('/vendor'), /aria-current="page"/);
		assert.doesNotMatch(renderNavExtra('/dashboard'), /aria-current/);
	});

	test('includes an optional title attribute', () => {
		setNavExtra(() => [{ href: '/vendor', label: 'Vendor', title: 'Extra metrics' }]);
		assert.match(renderNavExtra(), /title="Extra metrics"/);
	});

	test('escapes the label and title rather than emitting raw markup', () => {
		setNavExtra(() => [{ href: '/vendor', label: '<script>x</script>', title: 'a"b' }]);
		const html = renderNavExtra();
		assert.doesNotMatch(html, /<script>/);
		assert.match(html, /&lt;script&gt;/);
		// An unescaped quote here would let the title break out into a new attribute.
		assert.match(html, /title="a&quot;b"/);
	});

	test('drops links that are not same-origin paths', () => {
		setNavExtra((): NavLink[] => [
			{ href: 'https://evil.example/x', label: 'Absolute' },
			{ href: '//evil.example/x', label: 'Protocol-relative' },
			{ href: 'javascript:alert(1)', label: 'Script' },
			{ href: 'vendor', label: 'Relative' },
			{ href: '/ok', label: 'Kept' },
		]);
		assert.equal(renderNavExtra(), '<a href="/ok">Kept</a>');
	});

	test('drops malformed entries without throwing', () => {
		setNavExtra(() => ([
			null,
			{ label: 'No href' },
			{ href: '/x' },
			{ href: '/ok', label: 'Kept' },
		] as unknown as NavLink[]));
		assert.equal(renderNavExtra(), '<a href="/ok">Kept</a>');
	});

	test('a throwing provider degrades to no links instead of breaking the page', () => {
		setNavExtra(() => { throw new Error('boom'); });
		assert.equal(renderNavExtra('/dashboard'), '');
	});

	test('is re-evaluated on every render so the list can change', () => {
		let label = 'First';
		setNavExtra(() => [{ href: '/vendor', label }]);
		assert.match(renderNavExtra(), /First/);
		label = 'Second';
		assert.match(renderNavExtra(), /Second/);
	});
});

describe('createApp navExtra wiring', () => {
	test('registers the provider passed to createApp', () => {
		createApp({ navExtra: () => [{ href: '/vendor', label: 'Vendor' }] });
		assert.equal(renderNavExtra(), '<a href="/vendor">Vendor</a>');
	});

	test('clears a previously registered provider when omitted', () => {
		createApp({ navExtra: () => [{ href: '/vendor', label: 'Vendor' }] });
		createApp();
		assert.equal(renderNavExtra(), '');
	});
});

/**
 * The hook is only useful if the links actually reach the page headers. These tests
 * render each built-in page end to end, so removing a `renderNavExtra()` call from a
 * header fails here rather than silently stranding a downstream page at URL-only.
 */
describe('downstream links reach the built-in page headers', () => {
	let dataDir: string;
	let user: UserRow;
	const previousDataDir = process.env.LOCAL_DATA_DIR;
	const previousAdmins = process.env.ADMIN_GITHUB_LOGINS;

	before(() => {
		dataDir = mkdtempSync(join(tmpdir(), 'sharing-nav-'));
		process.env.LOCAL_DATA_DIR = dataDir;
		process.env.ADMIN_GITHUB_LOGINS = 'nav-admin';
		user = upsertUser(920001, 'nav-admin', 'Nav Admin', null);
	});

	after(() => {
		closeDb();
		if (previousDataDir === undefined) delete process.env.LOCAL_DATA_DIR;
		else process.env.LOCAL_DATA_DIR = previousDataDir;
		if (previousAdmins === undefined) delete process.env.ADMIN_GITHUB_LOGINS;
		else process.env.ADMIN_GITHUB_LOGINS = previousAdmins;
		rmSync(dataDir, { recursive: true, force: true });
	});

	for (const path of ['/dashboard', '/team', '/admin']) {
		test(`${path} header links to the downstream page`, async () => {
			const app = createApp({ navExtra: () => [{ href: '/vendor', label: 'Vendor Insights' }] });
			const res = await app.request(path, {
				headers: { Cookie: `${COOKIE_NAME}=${encodeSession(makeClaims(user.id))}` },
			});
			assert.equal(res.status, 200, `expected ${path} to render`);
			const html = await res.text();
			assert.ok(
				html.includes('<a href="/vendor">Vendor Insights</a>'),
				`expected the downstream nav link in the ${path} header`,
			);
		});
	}
});
