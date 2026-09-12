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

/** Minimal stand-in for `http.ClientRequest`, exercising exactly the surface `requestMistralJson` touches. */
class FakeClientRequest extends EventEmitter {
	end(): this { return this; }
}

function makeResponse(body: unknown, statusCode = 200): http.IncomingMessage {
	const res = new EventEmitter() as http.IncomingMessage;
	(res as any).statusCode = statusCode;
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

test('listMistralConversations: skips entries without a string id', async () => {
	const body = [
		{ id: 'good', created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', agent_id: 'a', name: 'n', description: null, object: 'conversation' },
		{ created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z', agent_id: 'a', name: 'n', description: null, object: 'conversation' },
	];
	const result = await listMistralConversations('key', { requestFn: makeRequestFn(makeResponse(body)) });
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
