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
import {
	MAX_UPLOAD_BODY_BYTES, MAX_FLUENCY_SCORE_BODY_BYTES, MAX_ENTRIES_PER_UPLOAD, MAX_STRING_LENGTHS,
	MAX_ACTIVITY_JSON_BYTES, MAX_ACTIVITY_NAMED_KEYS,
} from '../config';
import { validateEntry, MAX_FLUENCY_METRICS_JSON_BYTES } from '../validation/uploadSchema';

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

/** JSON byte size of a value. */
const jsonBytes = (value: unknown): number => Buffer.byteLength(JSON.stringify(value), 'utf8');

/** An object of name → count whose JSON is as close to `maxBytes` as the validator allows. */
function fillMap(maxBytes: number, keyLength: number, char: string): Record<string, number> {
	const map: Record<string, number> = {};
	for (let i = 0; i < MAX_ACTIVITY_NAMED_KEYS; i++) {
		const name = String(i).padStart(3, '0') + char.repeat(keyLength - 3);
		map[name] = 10_000_000;
		if (jsonBytes(map) > maxBytes) { delete map[name]; break; }
	}
	return map;
}

describe('upload body limit headroom', () => {
	test('a full batch of the largest valid entries fits under MAX_UPLOAD_BODY_BYTES', () => {
		// Control characters JSON-escape to six bytes each: the costliest valid string content.
		const worst = (n: number): string => '\u0001'.repeat(n);
		const toolsByName = fillMap(MAX_ACTIVITY_JSON_BYTES - 200, MAX_STRING_LENGTHS.activityKey, '\u0001');
		const activity = {
			sessions: 10_000_000, toolCalls: 10_000_000, mcpCalls: 10_000_000,
			modes: { ask: 10_000_000, edit: 10_000_000, agent: 10_000_000, plan: 10_000_000, customAgent: 10_000_000, cli: 10_000_000 },
			toolsByName,
			mcpByServer: fillMap(MAX_ACTIVITY_JSON_BYTES - 200 - jsonBytes(toolsByName), MAX_STRING_LENGTHS.activityKey, '\u0001'),
		};
		const fluencyMetrics = { pad: '' };
		fluencyMetrics.pad = 'x'.repeat(MAX_FLUENCY_METRICS_JSON_BYTES - jsonBytes(fluencyMetrics));
		const entry = {
			day: '2026-01-01',
			model: worst(MAX_STRING_LENGTHS.model),
			workspaceId: worst(MAX_STRING_LENGTHS.workspaceId),
			workspaceName: worst(MAX_STRING_LENGTHS.workspaceName),
			machineId: worst(MAX_STRING_LENGTHS.machineId),
			machineName: worst(MAX_STRING_LENGTHS.machineName),
			datasetId: worst(MAX_STRING_LENGTHS.datasetId),
			editor: worst(MAX_STRING_LENGTHS.editor),
			clientVersion: worst(MAX_STRING_LENGTHS.clientVersion),
			inputTokens: 2_000_000_000, outputTokens: 2_000_000_000, interactions: 100_000,
			estimatedCostUsd: 999_999.123456789,
			fluencyMetrics,
			activity,
		};
		assert.equal(validateEntry(entry), null, 'the fixture must be a valid entry');
		assert.ok(jsonBytes(activity) > MAX_ACTIVITY_JSON_BYTES * 0.95, `activity should be near its cap, got ${jsonBytes(activity)}`);
		const body = JSON.stringify(Array.from({ length: MAX_ENTRIES_PER_UPLOAD }, () => entry));
		const size = Buffer.byteLength(body, 'utf8');
		assert.ok(size <= MAX_UPLOAD_BODY_BYTES, `a valid full batch is ${size} bytes, over the ${MAX_UPLOAD_BODY_BYTES}-byte limit`);
	});
});
