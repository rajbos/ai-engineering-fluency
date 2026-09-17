import test from 'node:test';
import * as assert from 'node:assert/strict';
import type * as http from 'node:http';
import { EventEmitter } from 'node:events';
import {
	collectMistralCloudSessions,
	listMistralConversations,
	requestMistralJson,
	type MistralRequestFn,
} from '../../src/mistralCloudSessionsService';

/**
 * Minimal stand-in for `http.ClientRequest`, exercising exactly the surface
 * `attachRequestFailureHandling` (see `src/githubApiConfig.ts`) touches.
 */
class FakeClientRequest extends EventEmitter {
	private timeoutCallback?: () => void;
	setTimeout(_ms: number, cb: () => void): this {
		this.timeoutCallback = cb;
		return this;
	}
	destroy(err?: Error): this {
		if (err) { this.emit('error', err); }
		return this;
	}
	end(): this { return this; }
	fireTimeout(): void { this.timeoutCallback?.(); }
}

function makeResponse(body: unknown, statusCode = 200): http.IncomingMessage {
	const res = new EventEmitter() as http.IncomingMessage;
	(res as any).statusCode = statusCode;
	(res as any).setEncoding = () => res;
	// Emit data/end on a later tick than the response callback so the 'data'/'end' listeners
	// registered by requestMistralJson are attached before the body arrives.
	process.nextTick(() => process.nextTick(() => {
		res.emit('data', JSON.stringify(body));
		res.emit('end');
	}));
	return res;
}

function makeRequestFn(res: http.IncomingMessage): MistralRequestFn {
	return (((_opts: unknown, callback: (res: http.IncomingMessage) => void) => {
		const req = new FakeClientRequest();
		process.nextTick(() => callback(res));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
}

/** A request fn that emits a connection error instead of a response. */
function makeErrorRequestFn(err: Error): MistralRequestFn {
	return ((() => {
		const req = new FakeClientRequest();
		process.nextTick(() => req.emit('error', err));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
}

test('listMistralConversations: normalizes a bare-array response', async () => {
	const body = [
		{ id: 'c1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-02T00:00:00Z', agent_id: 'a1', name: 'My convo', description: null, object: 'conversation' },
		{ id: 'c2', created_at: '2026-01-03T00:00:00Z', updated_at: '2026-01-04T00:00:00Z', agent_id: 'a2', name: null, description: 'desc', agent_version: 3 },
	];
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse(body)) });
	assert.equal(result.error, undefined);
	assert.equal(result.conversations?.length, 2);
	assert.equal(result.conversations![0].id, 'c1');
	assert.equal(result.conversations![0].name, 'My convo');
	assert.equal(result.conversations![1].name, null);
	assert.equal(result.conversations![1].agentVersion, '3');
});

test('listMistralConversations: tolerates an object envelope with data[]', async () => {
	const body = { data: [{ id: 'c9', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', agent_id: 'a', name: 'x', description: null, object: 'conversation' }], total: 42 };
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse(body)) });
	assert.equal(result.conversations?.length, 1);
	assert.equal(result.totalCount, 42);
});

test('listMistralConversations: an unsupported top-level shape is a parse error, not an empty listing', async () => {
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse({})) });
	assert.ok(result.error, 'expected an error for a body that is neither an array, {conversations}, nor {data}');
	assert.equal(result.conversations, undefined);
});

test('listMistralConversations: skips entries without a string id', async () => {
	const body = [
		{ id: 'good', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', agent_id: 'a', name: 'n', description: null, object: 'conversation' },
		{ created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', agent_id: 'a', name: 'n', description: null, object: 'conversation' },
	];
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse(body)) });
	assert.equal(result.conversations?.length, 1);
	assert.equal(result.conversations![0].id, 'good');
});

test('listMistralConversations: skips null/primitive entries instead of throwing on the whole listing', async () => {
	const body = [
		null,
		'not-an-object',
		42,
		{ id: 'good', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', agent_id: 'a', name: 'n', description: null, object: 'conversation' },
	];
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse(body)) });
	assert.equal(result.error, undefined);
	assert.equal(result.conversations?.length, 1);
	assert.equal(result.conversations![0].id, 'good');
});

test('listMistralConversations: maps an HTTP error status into the result', async () => {
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse({}, 401)) });
	assert.equal(result.conversations, undefined);
	assert.match(result.error ?? '', /HTTP 401/);
	assert.equal(result.statusCode, 401);
});

test('listMistralConversations: reports a transport error', async () => {
	const result = await listMistralConversations('key', { requestFn: makeErrorRequestFn(new Error('ECONNRESET')) });
	assert.match(result.error ?? '', /ECONNRESET/);
	assert.equal(result.conversations, undefined);
});

test('requestMistralJson: puts the response stream into utf8 mode', async () => {
	// Without this, Node delivers 'data' chunks as raw Buffers, and naive per-chunk string
	// concatenation can corrupt a multibyte character split across a chunk boundary.
	let encodingUsed: string | undefined;
	const res = new EventEmitter() as http.IncomingMessage;
	(res as any).statusCode = 200;
	(res as any).setEncoding = (encoding: string) => { encodingUsed = encoding; return res; };
	process.nextTick(() => process.nextTick(() => {
		res.emit('data', JSON.stringify([{ id: 'c1', created_at: '', updated_at: '', agent_id: 'a', name: 'café', description: null }]));
		res.emit('end');
	}));
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(res) });
	assert.equal(encodingUsed, 'utf8', 'expected the response stream to be put into utf8 mode');
	assert.equal(result.conversations?.[0]?.name, 'café');
});

test('requestMistralJson: a response-stream error settles the promise instead of leaving it pending', async () => {
	const res = new EventEmitter() as http.IncomingMessage;
	(res as any).statusCode = 200;
	(res as any).setEncoding = () => res;
	// A later tick than makeRequestFn's own process.nextTick(() => callback(res)), so the 'error'
	// listener requestMistralJson attaches is guaranteed to exist before this fires — otherwise
	// EventEmitter's default behavior (throwing an unhandled 'error' with no listener) fires first.
	process.nextTick(() => process.nextTick(() => res.emit('error', new Error('socket hang up'))));
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(res) });
	assert.match(result.error ?? '', /socket hang up/);
});

test('requestMistralJson: destroys the socket on timeout instead of leaving it hanging', async () => {
	let capturedReq: FakeClientRequest | undefined;
	const requestFn = ((() => {
		const req = new FakeClientRequest();
		capturedReq = req;
		return req as unknown as http.ClientRequest;
	}) as unknown) as MistralRequestFn;
	let destroyed = false;
	const originalDestroy = FakeClientRequest.prototype.destroy;
	FakeClientRequest.prototype.destroy = function (err?: Error) {
		destroyed = true;
		return originalDestroy.call(this, err);
	};
	try {
		const resultPromise = requestMistralJson('/v1/conversations', 'key', requestFn);
		capturedReq!.fireTimeout();
		const result = await resultPromise;
		assert.equal(destroyed, true);
		assert.match(result.error ?? '', /socket inactivity/i);
	} finally {
		FakeClientRequest.prototype.destroy = originalDestroy;
	}
});

test('requestMistralJson: destroys the socket when an abort signal fires', async () => {
	// collectMistralCloudSessions ties this signal to the same deadline as withTimeout's own
	// promise-level rejection, so the transport actually gets torn down instead of continuing to
	// receive (and buffer) bytes after the caller has already moved on.
	let capturedReq: FakeClientRequest | undefined;
	const requestFn = ((() => {
		const req = new FakeClientRequest();
		capturedReq = req;
		return req as unknown as http.ClientRequest;
	}) as unknown) as MistralRequestFn;
	let destroyed = false;
	const originalDestroy = FakeClientRequest.prototype.destroy;
	FakeClientRequest.prototype.destroy = function (err?: Error) {
		destroyed = true;
		return originalDestroy.call(this, err);
	};
	try {
		const controller = new AbortController();
		const resultPromise = requestMistralJson('/v1/conversations', 'key', requestFn, controller.signal);
		controller.abort();
		const result = await resultPromise;
		assert.equal(destroyed, true, 'expected the socket to be destroyed when the signal aborts');
		// A real timeout-worded message (matching withTimeout's own TimeoutError), not an opaque
		// "Aborted" — see the finding this fixes: whichever of the two same-deadline timers wins the
		// race, the user should see the same real timeout message either way.
		assert.match(result.error ?? '', /timed out after \d+ms/i);
		assert.ok(capturedReq, 'expected a request to have been created');
	} finally {
		FakeClientRequest.prototype.destroy = originalDestroy;
	}
});

test('collectMistralCloudSessions: success sets authenticated=true and no error', async () => {
	const body = [{ id: 'c1', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', agent_id: 'a', name: 'n', description: null, object: 'conversation' }];
	const result = await collectMistralCloudSessions('key', { requestFn: makeRequestFn(makeResponse(body)) });
	assert.equal(result.authenticated, true);
	assert.equal(result.error, '');
	assert.equal(result.conversations.length, 1);
	assert.ok(result.fetchedAt);
});

test('collectMistralCloudSessions: a 401 sets authenticated=false and surfaces the error', async () => {
	const result = await collectMistralCloudSessions('key', { requestFn: makeRequestFn(makeResponse({}, 401)) });
	assert.equal(result.authenticated, false);
	assert.match(result.error, /HTTP 401/);
	assert.equal(result.conversations.length, 0);
});

test('collectMistralCloudSessions: a malformed 2xx body surfaces as an error instead of an empty authenticated listing', async () => {
	// An API error envelope like `{}` on a 2xx response must not be silently reported as
	// "authenticated: true, conversations: []" — that would erase a previous result and hide the
	// schema drift from the caller.
	const result = await collectMistralCloudSessions('key', { requestFn: makeRequestFn(makeResponse({})) });
	assert.equal(result.authenticated, false);
	assert.ok(result.error, 'expected an error for an unrecognized 2xx body shape');
	assert.equal(result.conversations.length, 0);
});

test('collectMistralCloudSessions: does not duplicate the status code already embedded in an HTTP error', async () => {
	const result = await collectMistralCloudSessions('key', { requestFn: makeRequestFn(makeResponse({}, 401)) });
	// requestMistralJson's HTTP-status errors already read "HTTP 401" — the status code must not
	// be appended a second time (e.g. "HTTP 401 (401)").
	assert.equal(result.error, 'HTTP 401');
});

test('collectMistralCloudSessions: an external signal tears down the socket, not just its own timeout', async () => {
	// The caller (extension.ts) aborts this signal when the API key is cleared/changed mid-fetch;
	// this proves that abort reaches the underlying transport instead of only rejecting the
	// caller's own promise while the request keeps running in the background.
	let capturedReq: FakeClientRequest | undefined;
	const requestFn = ((() => {
		const req = new FakeClientRequest();
		capturedReq = req;
		return req as unknown as http.ClientRequest;
	}) as unknown) as MistralRequestFn;
	let destroyed = false;
	const originalDestroy = FakeClientRequest.prototype.destroy;
	FakeClientRequest.prototype.destroy = function (err?: Error) {
		destroyed = true;
		return originalDestroy.call(this, err);
	};
	try {
		const controller = new AbortController();
		const resultPromise = collectMistralCloudSessions('key', { requestFn, signal: controller.signal });
		controller.abort();
		const result = await resultPromise;
		assert.equal(destroyed, true, 'expected the socket to be destroyed when the external signal aborts');
		assert.equal(result.authenticated, false);
		assert.ok(capturedReq, 'expected a request to have been created');
	} finally {
		FakeClientRequest.prototype.destroy = originalDestroy;
	}
});

/** A conversation entry with a distinguishing id, minimal otherwise-required fields blank. */
function conv(id: string): Record<string, unknown> {
	return { id, created_at: '', updated_at: '', agent_id: 'a', name: null, description: null };
}

/** A request fn that serves a different page of bodies per the `page` query param (default 0). */
function makePagedRequestFn(pages: unknown[][]): MistralRequestFn {
	return (((opts: any, callback: (res: http.IncomingMessage) => void) => {
		const query = new URLSearchParams((opts.path as string).split('?')[1] ?? '');
		const page = Number(query.get('page') ?? '0');
		const req = new FakeClientRequest();
		process.nextTick(() => callback(makeResponse(pages[page] ?? [])));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
}

test('collectMistralCloudSessions: paginates a full first page and stops at a short second page', async () => {
	const page0 = Array.from({ length: 100 }, (_, i) => conv(`p0-${i}`));
	const page1 = [conv('p1-0'), conv('p1-1')];
	const result = await collectMistralCloudSessions('key', { requestFn: makePagedRequestFn([page0, page1]) });
	assert.equal(result.conversations.length, 102);
	assert.equal(result.conversations[100].id, 'p1-0');
	assert.equal(result.authenticated, true);
	// Neither page's body carries an API-reported total (bare arrays), so totalCount must be the
	// aggregate across both pages — not the last (short) page's own count clobbering the running
	// total.
	assert.equal(result.totalCount, 102, 'expected the aggregate count, not the short final page\'s own count');
});

test('collectMistralCloudSessions: a single short page fetches only one page', async () => {
	let calls = 0;
	const requestFn = (((opts: any, callback: (res: http.IncomingMessage) => void) => {
		calls++;
		const req = new FakeClientRequest();
		process.nextTick(() => callback(makeResponse([conv('only')])));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
	const result = await collectMistralCloudSessions('key', { requestFn });
	assert.equal(calls, 1, 'a page shorter than the page size must not trigger a second request');
	assert.equal(result.conversations.length, 1);
});

test('collectMistralCloudSessions: stops at a bounded page cap instead of paginating forever', async () => {
	// Always return a full page, so pagination would never naturally terminate on its own.
	const fullPage = Array.from({ length: 100 }, (_, i) => conv(`x-${i}`));
	let calls = 0;
	const requestFn = (((_opts: any, callback: (res: http.IncomingMessage) => void) => {
		calls++;
		const req = new FakeClientRequest();
		process.nextTick(() => callback(makeResponse(fullPage)));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
	const result = await collectMistralCloudSessions('key', { requestFn });
	assert.ok(calls <= 20, `expected a bounded number of page fetches, got ${calls}`);
	assert.ok(result.conversations.length <= 2000, `expected a bounded conversation count, got ${result.conversations.length}`);
	// The page cap cut a listing that still looked full short with no API-reported total to trust
	// instead, so `totalCount` is only a lower bound (equal to what was actually fetched) — not a
	// fabricated exact total — and `totalIsLowerBound` must say so, so the UI can render it as
	// "N+" rather than presenting it as a complete, exact count.
	assert.equal(result.totalCount, result.conversations.length, 'expected the total to equal the fetched count, not a fabricated bump');
	assert.equal(result.totalIsLowerBound, true, 'expected the truncation to be signaled via totalIsLowerBound');
});

test('collectMistralCloudSessions: stops at an exact-page authoritative total without probing an unnecessary next page', async () => {
	// The first (and only) page is exactly `pageSize` (100) long, and the API's own total (100)
	// says that's everything. Without the fix, the loop would still probe a second page (since the
	// raw count wasn't short of pageSize) purely to discover it's empty/erroring.
	const exactPage = { data: Array.from({ length: 100 }, (_, i) => conv(`x-${i}`)), total: 100 };
	let calls = 0;
	const requestFn = (((_opts: any, callback: (res: http.IncomingMessage) => void) => {
		calls++;
		const req = new FakeClientRequest();
		process.nextTick(() => callback(makeResponse(exactPage)));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
	const result = await collectMistralCloudSessions('key', { requestFn });
	assert.equal(calls, 1, 'an authoritative total already reached must not trigger a next-page probe');
	assert.equal(result.conversations.length, 100);
	assert.equal(result.totalCount, 100);
	assert.equal(result.totalIsLowerBound, false, 'an authoritative API total is an exact count, not a lower bound');
	assert.equal(result.error, '', 'a complete, authoritative listing must not read as a partial failure');
});

test('collectMistralCloudSessions: trusts an API-reported total that exactly equals the page-cap fetch count', async () => {
	// Every page reports the true total (2000) via `total`, and it happens to exactly equal what
	// the page cap fetches (20 pages * 100). The API's own total is authoritative here — a real
	// "that's everything" signal — and must not be second-guessed into a false "2000 of 2001".
	const fullPage = { data: Array.from({ length: 100 }, (_, i) => conv(`x-${i}`)), total: 2000 };
	const requestFn = (((_opts: any, callback: (res: http.IncomingMessage) => void) => {
		const req = new FakeClientRequest();
		process.nextTick(() => callback(makeResponse(fullPage)));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
	const result = await collectMistralCloudSessions('key', { requestFn });
	assert.equal(result.conversations.length, 2000);
	assert.equal(result.totalCount, 2000, 'expected the authoritative API total, not a synthesized truncation bump');
	assert.equal(result.totalIsLowerBound, false, 'an authoritative API total is an exact count, not a lower bound');
});

test('collectMistralCloudSessions: a later-page failure keeps the pages already fetched but reports it as incomplete', async () => {
	const page0 = Array.from({ length: 100 }, (_, i) => conv(`p0-${i}`));
	const requestFn = (((opts: any, callback: (res: http.IncomingMessage) => void) => {
		const query = new URLSearchParams((opts.path as string).split('?')[1] ?? '');
		const page = Number(query.get('page') ?? '0');
		const req = new FakeClientRequest();
		if (page === 0) {
			process.nextTick(() => callback(makeResponse(page0)));
		} else {
			process.nextTick(() => callback(makeResponse({}, 500)));
		}
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
	const result = await collectMistralCloudSessions('key', { requestFn });
	assert.equal(result.authenticated, true, 'a later-page failure should not discard the already-fetched first page');
	assert.equal(result.conversations.length, 100);
	// The listing didn't finish — the UI must not present this partial result as complete.
	assert.notEqual(result.error, '', 'expected a non-empty error signaling the listing is incomplete');
	assert.match(result.error, /HTTP 500/);
});

test('listMistralConversations: accepts the documented { conversations: [...] } envelope', async () => {
	const body = { conversations: [conv('c1')], total: 1 };
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse(body)) });
	assert.equal(result.conversations?.length, 1);
	assert.equal(result.conversations![0].id, 'c1');
	assert.equal(result.totalCount, 1);
});

test('collectMistralCloudSessions: a malformed entry on a full page does not truncate pagination early', async () => {
	// The raw page has exactly `pageSize` entries, but one is id-less and gets filtered out by
	// normalizeConversation — so the *normalized* count (99) is less than pageSize (100) even
	// though the API page itself was full and a next page exists.
	const page0 = [...Array.from({ length: 99 }, (_, i) => conv(`p0-${i}`)), { created_at: '', updated_at: '', agent_id: 'a' }];
	const page1 = [conv('p1-0')];
	const result = await collectMistralCloudSessions('key', { requestFn: makePagedRequestFn([page0, page1]) });
	assert.equal(result.conversations.length, 100, 'expected page1 to still be fetched despite the malformed entry on page0');
	assert.ok(result.conversations.some((c) => c.id === 'p1-0'), 'expected the second page\'s conversation to be present');
});

test('requestMistralJson: builds a Bearer-auth GET request to api.mistral.ai', async () => {
	let capturedOpts: any;
	const fakeRequestFn = (((opts: any, callback: (res: http.IncomingMessage) => void) => {
		capturedOpts = opts;
		const req = new FakeClientRequest();
		process.nextTick(() => callback(makeResponse([])));
		return req as unknown as http.ClientRequest;
	}) as unknown) as typeof http.request;
	await requestMistralJson('/v1/conversations?page_size=100', 'test-key', fakeRequestFn);
	assert.equal(capturedOpts.hostname, 'api.mistral.ai');
	assert.equal(capturedOpts.method, 'GET');
	assert.equal(capturedOpts.path, '/v1/conversations?page_size=100');
	assert.equal(capturedOpts.headers.Authorization, 'Bearer test-key');
});
