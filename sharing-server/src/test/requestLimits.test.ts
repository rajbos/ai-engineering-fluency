/**
 * Request body size limits on the JSON upload endpoints.
 *
 * An oversized body must be refused with 413 before it is authenticated, buffered or
 * parsed: no GitHub token check (fetch is stubbed to fail the test if called) and, for a
 * chunked body, no reading past the limit. No database is touched — every request here
 * stops at the size check or at the missing Authorization header.
 */
import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { api } from '../routes/api';
import { MAX_UPLOAD_BODY_BYTES, MAX_FLUENCY_SCORE_BODY_BYTES } from '../config';

const realFetch = globalThis.fetch;

before(() => {
	globalThis.fetch = (() => {
		throw new Error('Unexpected network call: oversized bodies must be refused before auth');
	}) as typeof fetch;
});

after(() => {
	globalThis.fetch = realFetch;
});

/** A chunked body (no Content-Length) that records how many bytes the server pulled. */
function trackedStream(totalBytes: number, chunkBytes = 64 * 1024): { body: ReadableStream<Uint8Array>; pulled: () => number } {
	let sent = 0;
	const chunk = new Uint8Array(chunkBytes).fill(0x20); // spaces: valid JSON whitespace
	const body = new ReadableStream<Uint8Array>({
		pull(controller) {
			if (sent >= totalBytes) { controller.close(); return; }
			controller.enqueue(chunk);
			sent += chunk.length;
		},
	});
	return { body, pulled: () => sent };
}

const endpoints = [
	{ path: '/upload', max: MAX_UPLOAD_BODY_BYTES },
	{ path: '/fluency-score', max: MAX_FLUENCY_SCORE_BODY_BYTES },
];

describe('request body limits', () => {
	for (const { path, max } of endpoints) {
		test(`POST ${path} rejects a Content-Length over ${max} bytes with 413 before auth`, async () => {
			const body = `[${' '.repeat(max)}]`;
			const res = await api.request(path, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Authorization: 'Bearer gho_never_checked' },
				body,
			});
			assert.equal(res.status, 413);
			assert.deepEqual(await res.json(), { error: `Request body too large (max ${max} bytes).` });
		});

		test(`POST ${path} stops reading a chunked body once it crosses the limit`, async () => {
			const total = max * 4;
			const { body, pulled } = trackedStream(total);
			const res = await api.request(path, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', 'Transfer-Encoding': 'chunked', Authorization: 'Bearer gho_never_checked' },
				body,
				duplex: 'half',
			} as RequestInit);
			assert.equal(res.status, 413);
			assert.ok(pulled() < total, `expected the server to stop early, but it read ${pulled()} of ${total} bytes`);
		});

		test(`POST ${path} lets a body within the limit through to auth`, async () => {
			const res = await api.request(path, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: '[]',
			});
			assert.equal(res.status, 401, 'a small unauthenticated body should reach the auth check');
		});
	}
});
