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
} from '../../../src/copilotCliOtel';

const SESSION_ID = 'a19abe35-b44e-4713-bf70-27f015393772';

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

test('extractCopilotCliSessionId: matches events.jsonl paths', () => {
	const file = 'C:\\Users\\x\\.copilot\\session-state\\a19abe35-b44e-4713-bf70-27f015393772\\events.jsonl';
	assert.equal(extractCopilotCliSessionId(file), 'a19abe35-b44e-4713-bf70-27f015393772');
});

test('extractCopilotCliSessionId: matches session-store.db virtual paths', () => {
	const file = 'C:\\Users\\x\\.copilot\\session-store.db#a19abe35-b44e-4713-bf70-27f015393772';
	assert.equal(extractCopilotCliSessionId(file), 'a19abe35-b44e-4713-bf70-27f015393772');
});

test('extractCopilotCliSessionId: returns null for non-Copilot-CLI paths', () => {
	assert.equal(extractCopilotCliSessionId('C:\\Users\\x\\.claude\\projects\\foo\\session.jsonl'), null);
	assert.equal(extractCopilotCliSessionId('C:\\Users\\x\\.copilot\\session-state\\not-a-uuid\\events.jsonl'), null);
});

test('getCopilotCliOtelUsage: aggregates multiple chat spans for the same session', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		fs.mkdirSync(otelDir, { recursive: true });
		fs.writeFileSync(
			path.join(otelDir, 'copilot-otel.jsonl'),
			[chatSpan(SESSION_ID), chatSpan(SESSION_ID, { 'gen_ai.usage.input_tokens': 50, 'gen_ai.usage.output_tokens': 5 })].join('\n')
		);

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
		fs.mkdirSync(otelDir, { recursive: true });
		fs.writeFileSync(path.join(otelDir, 'copilot-otel.jsonl'), chatSpan(SESSION_ID));

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
		const usage = await getCopilotCliOtelUsage('C:\\Users\\x\\.claude\\projects\\foo\\session.jsonl');
		assert.equal(usage, null);
	});
});

test('loadCopilotCliOtelIndex: concurrent callers on a cold cache share one read, not N', async (t) => {
	await withHomedir(t, async (homeDir) => {
		const otelDir = path.join(homeDir, '.copilot', 'otel');
		fs.mkdirSync(otelDir, { recursive: true });
		fs.writeFileSync(path.join(otelDir, 'copilot-otel.jsonl'), chatSpan(SESSION_ID));

		let readFileCalls = 0;
		const originalReadFile = fs.promises.readFile;
		(fs.promises as { readFile: typeof fs.promises.readFile }).readFile = (async (...args: Parameters<typeof fs.promises.readFile>) => {
			readFileCalls++;
			// Yield to let other concurrent callers reach loadCopilotCliOtelIndex before this resolves,
			// so a buggy (non-deduplicating) implementation would have already kicked off its own reads.
			await new Promise((r) => setImmediate(r));
			return originalReadFile(...args);
		}) as typeof fs.promises.readFile;

		try {
			// Fire 10 concurrent loads before any of them can populate the cache.
			await Promise.all(Array.from({ length: 10 }, () => loadCopilotCliOtelIndex()));
			assert.equal(readFileCalls, 1, 'the OTel export file should be read exactly once, not once per concurrent caller');
		} finally {
			(fs.promises as { readFile: typeof fs.promises.readFile }).readFile = originalReadFile;
		}
	});
});
