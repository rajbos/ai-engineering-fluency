/**
 * Unit tests for the library composition surface added so downstream servers can
 * build on this package instead of forking it:
 *  - createApp: health payload, healthExtra merging, extend-before-builtins
 *    precedence, and the mountApi / mountDashboard toggles
 *  - registerShutdownHandlers: idempotency, so repeated calls (or several
 *    servers in one process) do not stack duplicate signal listeners
 *
 * No database or network access is required: only routes that avoid the DB are
 * exercised, so these tests stay fast and hermetic.
 */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { createApp } from '../app.js';
import { registerShutdownHandlers } from '../lifecycle.js';

describe('createApp', () => {
	test('serves /health without auth', async () => {
		const res = await createApp().request('/health');
		assert.equal(res.status, 200);
		const body = await res.json() as Record<string, unknown>;
		assert.equal(body.status, 'ok');
		assert.ok(body.version, 'expected a version stamp');
	});

	test('merges healthExtra into the health payload', async () => {
		const app = createApp({ healthExtra: () => ({ edition: 'downstream' }) });
		const body = await (await app.request('/health')).json() as Record<string, unknown>;
		assert.equal(body.edition, 'downstream');
		// Core fields must survive the merge.
		assert.equal(body.status, 'ok');
	});

	test('mounts extend routes and can add new paths', async () => {
		const app = createApp({
			extend: (a) => { a.get('/api/vendor/ping', (c) => c.text('pong')); },
		});
		const res = await app.request('/api/vendor/ping');
		assert.equal(res.status, 200);
		assert.equal(await res.text(), 'pong');
	});

	test('extend runs before built-in routes so downstream can override them', async () => {
		// This ordering is the contract that lets a downstream server replace a
		// built-in page without forking; Hono resolves in registration order.
		const app = createApp({
			extend: (a) => { a.get('/health', (c) => c.text('overridden')); },
		});
		assert.equal(await (await app.request('/health')).text(), 'overridden');
	});

	test('honours mountApi: false and mountDashboard: false', async () => {
		const app = createApp({ mountApi: false, mountDashboard: false });
		// With both unmounted, previously-served paths fall through to the 404 handler.
		const res = await app.request('/dashboard');
		assert.equal(res.status, 404);
		assert.deepEqual(await res.json(), { error: 'Not found' });
	});

	test('returns a Hono instance', () => {
		assert.ok(createApp() instanceof Hono);
	});
});

describe('registerShutdownHandlers', () => {
	test('is idempotent across repeated calls', () => {
		// startServer() calls this too, so a downstream app that also calls it (or a
		// test run that starts several servers) must not stack duplicate handlers
		// that would double-run the backup and emit MaxListenersExceededWarning.
		const before = {
			SIGTERM: process.listenerCount('SIGTERM'),
			SIGINT:  process.listenerCount('SIGINT'),
		};

		registerShutdownHandlers();
		const afterFirst = {
			SIGTERM: process.listenerCount('SIGTERM'),
			SIGINT:  process.listenerCount('SIGINT'),
		};

		for (let i = 0; i < 5; i++) {
			registerShutdownHandlers();
		}
		const afterMany = {
			SIGTERM: process.listenerCount('SIGTERM'),
			SIGINT:  process.listenerCount('SIGINT'),
		};

		assert.equal(afterFirst.SIGTERM, before.SIGTERM + 1);
		assert.equal(afterFirst.SIGINT,  before.SIGINT + 1);
		assert.deepEqual(afterMany, afterFirst, 'repeated calls must not add listeners');
	});
});
