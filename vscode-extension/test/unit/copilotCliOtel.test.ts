import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
	extractCopilotCliSessionId,
	getCopilotCliOtelUsage,
	loadCopilotCliOtelIndex,
	clearCopilotCliOtelCache,
	expireCopilotCliOtelCacheForTests,
} from '../../../src/copilotCliOtel';

const SESSION_ID = 'a19abe35-b44e-4713-bf70-27f015393772';
const SESSION_ID_2 = 'b28cf946-c55b-5824-cf81-38f126404883';
const OTEL_FILE = 'copilot-otel.jsonl';

/** Writes spans as a fresh newline-terminated .jsonl file (real exports terminate every record with \n). */
function writeOtelSpans(otelDir: string, spans: string[], filename = OTEL_FILE): void {
	fs.mkdirSync(otelDir, { recursive: true });
	fs.writeFileSync(path.join(otelDir, filename), spans.map((s) => s + '\n').join(''));
}

/** Appends more newline-terminated spans to an existing export file. */
function appendOtelSpans(otelDir: string, spans: string[], filename = OTEL_FILE): void {
	fs.appendFileSync(path.join(otelDir, filename), spans.map((s) => s + '\n').join(''));
}

function eventsJsonlPath(homeDir: string, sessionId: string): string {
	return path.join(homeDir, '.copilot', 'session-state', sessionId, 'events.jsonl');
}

function dbVirtualPath(homeDir: string, sessionId: string): string {
	return path.join(homeDir, '.copilot', 'session-store.db') + `#${sessionId}`;
}

function chatSpan(sessionId: string, overrides: Record<string, unknown> = {}): string {
	return JSON.stringify({
		type: 'span',
		name: 'chat claude-sonnet-5',
		attributes: {
			'gen_ai.conversation.id': sessionId,
			'gen_ai.response.model': 'claude-sonnet-5',
			'gen_ai.usage.input_tokens': 100,
			'gen_ai.usage.output_tokens': 10,
			'gen_ai.usage.cache_creation.input_tokens': 90,
			'github.copilot.nano_aiu': 12345,
			...overrides,
		},
	});
}

/**
 * Runs fn with ~/.copilot redirected to a fresh temp dir, by overriding HOME/USERPROFILE
 * (os.homedir() consults these env vars on each call — same approach as
 * copilotCliAdapter.test.ts). Resets the module-level OTel cache before/after so tests
 * don't leak state into each other.
 */
async function withHomedir<T>(t: import('node:test').TestContext, fn: (homeDir: string) => Promise<T>): Promise<T | undefined> {
	const homeDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ctt-otel-test-'));
	const originalHome = process.env.HOME;
	const originalUserProfile = process.env.USERPROFILE;
	process.env.HOME = homeDir;
	process.env.USERPROFILE = homeDir;
	clearCopilotCliOtelCache();

	t.after(() => {
		if (originalHome === undefined) { delete process.env.HOME; } else { process.env.HOME = originalHome; }
		if (originalUserProfile === undefined) { delete process.env.USERPROFILE; } else { process.env.USERPROFILE = originalUserProfile; }
		fs.rmSync(homeDir, { recursive: true, force: true });
		clearCopilotCliOtelCache();
	});

	if (os.homedir() !== homeDir) {
		t.skip(`os.homedir() doesn't honour env override on this platform (got ${os.homedir()})`);
		return undefined;
	}
	return fn(homeDir);
}

// extractCopilotCliSessionId's events.jsonl branch uses path.dirname/path.basename, which are
// separator-sensitive — paths here must be built with path.join (not hardcoded Windows-style
// backslash literals) so these tests are meaningful on POSIX CI runners too.
test('extractCopilotCliSessionId: matches events.jsonl paths', () => {
	const file = eventsJsonlPath('C:\\Users\\x', SESSION_ID);
	assert.equal(extractCopilotCliSessionId(file), SESSION_ID);
});

test('extractCopilotCliSessionId: matches session-store.db virtual paths', () => {
	const file = dbVirtualPath('C:\\Users\\x', SESSION_ID);
	assert.equal(extractCopilotCliSessionId(file), SESSION_ID);
});

test('extractCopilotCliSessionId: returns null for non-Copilot-CLI paths', () => {
	assert.equal(extractCopilotCliSessionId(path.join('C:\\Users\\x', '.claude', 'projects', 'foo', 'session.jsonl')), null);
	assert.equal(extractCopilotCliSessionId(eventsJsonlPath('C:\\Users\\x', 'not-a-uuid')), null);
});

test('getCopilotCliOtelUsage: aggregates multiple chat spans for the same session', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		writeOtelSpans(otelDir, [
			chatSpan(SESSION_ID),
			chatSpan(SESSION_ID, { 'gen_ai.usage.input_tokens': 50, 'gen_ai.usage.output_tokens': 5 }),
		]);

		const usage = await getCopilotCliOtelUsage(eventsJsonlPath(homeDir, SESSION_ID));
		assert.ok(usage);
		assert.equal(usage!.actualTokens, 100 + 10 + 50 + 5);
		assert.equal(usage!.modelUsage['claude-sonnet-5'].inputTokens, 150);
		assert.equal(usage!.modelUsage['claude-sonnet-5'].outputTokens, 15);
		assert.equal(usage!.nanoAiu, 12345 * 2);
	});
});

test('getCopilotCliOtelUsage: matches session-store.db virtual paths against the same session id', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		writeOtelSpans(otelDir, [chatSpan(SESSION_ID)]);

		const usage = await getCopilotCliOtelUsage(dbVirtualPath(homeDir, SESSION_ID));
		assert.ok(usage);
		assert.equal(usage!.actualTokens, 110);
	});
});

test('getCopilotCliOtelUsage: returns null when no OTel export directory exists', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const usage = await getCopilotCliOtelUsage(eventsJsonlPath(homeDir, SESSION_ID));
		assert.equal(usage, null);
	});
});

test('getCopilotCliOtelUsage: returns null for a non-Copilot-CLI path without touching disk', async (t) => {
	await withHomedir(t, async () => {
		const usage = await getCopilotCliOtelUsage(path.join('C:\\Users\\x', '.claude', 'projects', 'foo', 'session.jsonl'));
		assert.equal(usage, null);
	});
});

test('loadCopilotCliOtelIndex: concurrent callers on a cold cache share one load, not N', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		writeOtelSpans(otelDir, [chatSpan(SESSION_ID)]);

		// Fire 10 concurrent loads before any of them can populate the cache. The load runs off
		// the main thread now, so we can't count read calls here — instead assert the dedup
		// guarantee directly: every concurrent caller resolves to the *same* index instance. A
		// non-deduplicating implementation would build (and return) a distinct Map per caller.
		const results = await Promise.all(Array.from({ length: 10 }, () => loadCopilotCliOtelIndex()));
		assert.ok(results.every((r) => r === results[0]), 'concurrent cold-cache loads should share one index instance, not one per caller');
		assert.equal(results[0].get(SESSION_ID)?.actualTokens, 110, 'the shared index should hold the parsed span usage');
	});
});

test('loadCopilotCliOtelIndex: parses a large export via the worker path', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		// Exceed the in-process byte threshold (1 MB) so the load routes through the worker thread.
		// Each span is a few hundred bytes, so a few thousand of them is comfortably over 1 MB.
		const spanCount = 4000;
		writeOtelSpans(otelDir, Array.from({ length: spanCount }, () => chatSpan(SESSION_ID)));
		assert.ok(fs.statSync(path.join(otelDir, OTEL_FILE)).size > 1_000_000, 'test fixture should exceed the worker threshold');

		const usage = await getCopilotCliOtelUsage(eventsJsonlPath(homeDir, SESSION_ID));
		assert.ok(usage);
		assert.equal(usage!.actualTokens, spanCount * 110, 'every span across the large file should be aggregated exactly once');
		assert.equal(usage!.modelUsage['claude-sonnet-5'].inputTokens, spanCount * 100);
	});
});

test('loadCopilotCliOtelIndex: an incremental refresh reads only appended spans, without re-counting old ones', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		writeOtelSpans(otelDir, [chatSpan(SESSION_ID)]);

		const first = await getCopilotCliOtelUsage(eventsJsonlPath(homeDir, SESSION_ID));
		assert.equal(first!.actualTokens, 110);

		// Append a second span, then expire the TTL (keeping offsets) to force a refresh. If the
		// refresh re-read the whole file instead of just the tail, the first span would be counted
		// twice (110 + 110 + 55 = 275) rather than once (110 + 55 = 165).
		appendOtelSpans(otelDir, [chatSpan(SESSION_ID, { 'gen_ai.usage.input_tokens': 50, 'gen_ai.usage.output_tokens': 5 })]);
		expireCopilotCliOtelCacheForTests();

		const second = await getCopilotCliOtelUsage(eventsJsonlPath(homeDir, SESSION_ID));
		assert.equal(second!.actualTokens, 110 + 55, 'the appended span should be added once, and the original not re-counted');
		assert.equal(second!.modelUsage['claude-sonnet-5'].inputTokens, 150);
	});
});

test('loadCopilotCliOtelIndex: a shrunken (rotated/truncated) export triggers a full rebuild', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		// Start with two spans for SESSION_ID so the file (and tracked offset) is comparatively large.
		writeOtelSpans(otelDir, [chatSpan(SESSION_ID), chatSpan(SESSION_ID)]);
		const before = await loadCopilotCliOtelIndex();
		assert.equal(before.get(SESSION_ID)?.actualTokens, 220);

		// Overwrite with a single, smaller span for a different session: size now < tracked offset,
		// which must be detected as rotation and rebuilt from scratch (dropping the stale session).
		writeOtelSpans(otelDir, [chatSpan(SESSION_ID_2)]);
		expireCopilotCliOtelCacheForTests();

		const after = await loadCopilotCliOtelIndex();
		assert.equal(after.get(SESSION_ID), undefined, 'the pre-rotation session should be gone after a rebuild');
		assert.equal(after.get(SESSION_ID_2)?.actualTokens, 110, 'the post-rotation session should be parsed fresh');
	});
});
