import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { MistralVibeDataAccess } from '../mistralvibe';

/** Writes a synthetic meta.json (no real session data) and returns its path plus cleanup. */
function writeMeta(meta: unknown): { metaPath: string; cleanup: () => void } {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-meta-'));
	const metaPath = path.join(dir, 'meta.json');
	fs.writeFileSync(metaPath, JSON.stringify(meta));
	return { metaPath, cleanup: () => fs.rmSync(dir, { recursive: true, force: true }) };
}

const da = new MistralVibeDataAccess();

test('getSessionStats: reads every extra stat, converting last_turn_duration seconds to ms', async () => {
	const { metaPath, cleanup } = writeMeta({ stats: {
		tokens_per_second: 100.5, last_turn_duration: 2.5, session_cost: 0.0123, steps: 12,
		tool_calls_succeeded: 9, tool_calls_failed: 1, tool_calls_rejected: 2, tool_calls_agreed: 3, tool_calls_hook_denied: 4,
	} });
	try {
		assert.deepEqual(await da.getSessionStats(metaPath), {
			tokensPerSecond: 100.5, lastTurnDurationMs: 2500, sessionCostReported: 0.0123, steps: 12,
			toolCallsSucceeded: 9, toolCallsFailed: 1, toolCallsRejected: 2, toolCallsAgreed: 3, toolCallsHookDenied: 4,
		});
	} finally { cleanup(); }
});

test('getSessionStats: absent fields are undefined, never 0', async () => {
	const { metaPath, cleanup } = writeMeta({ stats: { session_prompt_tokens: 10 } });
	try {
		const s = await da.getSessionStats(metaPath);
		for (const value of Object.values(s)) { assert.equal(value, undefined); }
	} finally { cleanup(); }
});

test('getSessionStats: malformed values are ignored; a real 0 is kept', async () => {
	const { metaPath, cleanup } = writeMeta({ stats: {
		tokens_per_second: '50', last_turn_duration: -1, session_cost: null, steps: Number.MAX_VALUE * 2,
		tool_calls_succeeded: 0, tool_calls_failed: {}, tool_calls_rejected: [], tool_calls_agreed: true,
	} });
	try {
		const s = await da.getSessionStats(metaPath);
		assert.equal(s.tokensPerSecond, undefined);
		assert.equal(s.lastTurnDurationMs, undefined);
		assert.equal(s.sessionCostReported, undefined);
		assert.equal(s.steps, undefined);
		assert.equal(s.toolCallsSucceeded, 0);
		assert.equal(s.toolCallsFailed, undefined);
		assert.equal(s.toolCallsRejected, undefined);
		assert.equal(s.toolCallsAgreed, undefined);
	} finally { cleanup(); }
});

test('getSessionStats: missing file, missing stats and non-object stats yield an empty result', async () => {
	assert.deepEqual(await da.getSessionStats(path.join(os.tmpdir(), 'no-such-vibe', 'meta.json')), {});
	const a = writeMeta({ config: {} });
	const b = writeMeta({ stats: 'oops' });
	try {
		assert.deepEqual(await da.getSessionStats(a.metaPath), {});
		assert.deepEqual(await da.getSessionStats(b.metaPath), {});
	} finally { a.cleanup(); b.cleanup(); }
});

test('getModelUsage: cached-token clamp and session_cost do not change the token attribution', async () => {
	const { metaPath, cleanup } = writeMeta({
		config: { active_model: 'm' },
		stats: { session_prompt_tokens: 100, session_completion_tokens: 5, session_cached_tokens: 900, session_cost: 99 },
	});
	try {
		const usage = await da.getModelUsage(metaPath);
		assert.equal(usage['m'].cachedReadTokens, 100);
		assert.equal(usage['m'].inputTokens, 100);
		assert.equal(usage['m'].outputTokens, 5);
	} finally { cleanup(); }
});

/**
 * Builds a synthetic unified-store session under a temp VIBE_HOME:
 *   <root>/logs/session/unified/<id>/{meta.json, CURRENT, journal/0000000000000001.jsonl}
 * Returns the meta.json path and a cleanup function.
 */
function writeUnifiedSession(opts: {
	id: string;
	meta?: unknown;
	journalLines?: unknown[];
	chunkFiles?: Record<string, unknown>;
	indexContextUsage?: unknown;
	indexModel?: string;
}): { metaPath: string; cleanup: () => void } {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-unified-'));
	const sessionDir = path.join(root, 'logs', 'session', 'unified', opts.id);
	fs.mkdirSync(path.join(sessionDir, 'journal'), { recursive: true });
	fs.writeFileSync(path.join(sessionDir, 'meta.json'), JSON.stringify(opts.meta ?? {
		session_id: opts.id,
		start_time: '2026-11-04T16:46:59.862000+00:00',
		end_time: '2026-11-04T16:46:59.862000+00:00',
		config: { active_model: 'mistral-large-4-0-3' },
	}));
	fs.writeFileSync(path.join(sessionDir, 'CURRENT'), '{"generation":"0000000000000001"}');
	if (opts.chunkFiles) {
		const chunksDir = path.join(sessionDir, 'chunks');
		fs.mkdirSync(chunksDir, { recursive: true });
		for (const [name, content] of Object.entries(opts.chunkFiles)) {
			fs.writeFileSync(path.join(chunksDir, name), JSON.stringify(content));
		}
	}
	if (opts.journalLines) {
		fs.writeFileSync(
			path.join(sessionDir, 'journal', '0000000000000001.jsonl'),
			opts.journalLines.map(l => JSON.stringify(l)).join('\n') + '\n',
		);
	}
	if (opts.indexContextUsage !== undefined || opts.indexModel !== undefined) {
		fs.writeFileSync(
			path.join(root, 'logs', 'session', 'unified', '.session-index.json'),
			JSON.stringify({ catalog_version: 1, entries: [{
				identity: { session_id: opts.id },
				metadata: { active_model: opts.indexModel },
				session: { contextUsage: opts.indexContextUsage },
			}] }),
		);
	}
	// Point VIBE_HOME at the temp root so index-fallback lookups stay inside the fixture.
	const prevVibeHome = process.env.VIBE_HOME;
	process.env.VIBE_HOME = root;
	return { metaPath: path.join(sessionDir, 'meta.json'), cleanup: () => {
		if (prevVibeHome === undefined) { delete process.env.VIBE_HOME; } else { process.env.VIBE_HOME = prevVibeHome; }
		fs.rmSync(root, { recursive: true, force: true });
	} };
}

/** A projection_delta record whose set_envelope op carries a cumulative contextUsage. */
function envelopeDelta(contextUsage: unknown): unknown {
	return { type: 'projection_delta', payload: { delta: [
		{ op: 'set_envelope', state: { session: { id: 's', contextUsage } } },
	], watermark: 1 } };
}

test('discoverSessions: finds legacy session_* dirs and unified/<uuid> dirs under VIBE_HOME', async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'vibe-home-'));
	const prev = process.env.VIBE_HOME;
	process.env.VIBE_HOME = root;
	try {
		const legacyDir = path.join(root, 'logs', 'session', 'session_20260922_091515_5327080d');
		fs.mkdirSync(legacyDir, { recursive: true });
		fs.writeFileSync(path.join(legacyDir, 'meta.json'), '{}');
		const unifiedDir = path.join(root, 'logs', 'session', 'unified', '1502172e-554f-f02b-d539-d2473c83eca2');
		fs.mkdirSync(unifiedDir, { recursive: true });
		fs.writeFileSync(path.join(unifiedDir, 'meta.json'), '{}');
		const found = await da.discoverSessions();
		assert.ok(found.some(f => f === path.join(legacyDir, 'meta.json')), 'legacy session discovered');
		assert.ok(found.some(f => f === path.join(unifiedDir, 'meta.json')), 'unified session discovered');
		assert.equal(found.length, 2);
	} finally {
		if (prev === undefined) { delete process.env.VIBE_HOME; } else { process.env.VIBE_HOME = prev; }
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('unified session: tokens and model usage come from the journal set_envelope contextUsage', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'aaaa1111-0000-0000-0000-000000000000',
		journalLines: [
			envelopeDelta(null),
			envelopeDelta({ cachedInputTokens: 768, inputTokens: 15142, outputTokens: 226, totalTokens: 15368 }),
		],
	});
	try {
		assert.deepEqual(await da.getTokensFromSession(metaPath), { tokens: 15368, thinkingTokens: 0 });
		const usage = await da.getModelUsage(metaPath);
		assert.deepEqual(usage['mistral-large-4-0-3'], {
			inputTokens: 15142, outputTokens: 226, cachedReadTokens: 768, sessions: 0,
		});
	} finally { cleanup(); }
});

test('unified session: falls back to .session-index.json when the journal carries no usage', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'bbbb2222-0000-0000-0000-000000000000',
		journalLines: [envelopeDelta(null)],
		indexContextUsage: { cachedInputTokens: 512, inputTokens: 19733, outputTokens: 280, totalTokens: 20013 },
		indexModel: 'mistral-large-4-0-3',
	});
	try {
		assert.deepEqual(await da.getTokensFromSession(metaPath), { tokens: 20013, thinkingTokens: 0 });
		const usage = await da.getModelUsage(metaPath);
		assert.equal(usage['mistral-large-4-0-3'].inputTokens, 19733);
		assert.equal(usage['mistral-large-4-0-3'].cachedReadTokens, 512);
	} finally { cleanup(); }
});

test('unified session: no usage anywhere yields zero tokens and empty model usage', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({ id: 'cccc3333-0000-0000-0000-000000000000' });
	try {
		assert.deepEqual(await da.getTokensFromSession(metaPath), { tokens: 0, thinkingTokens: 0 });
		assert.deepEqual(await da.getModelUsage(metaPath), {});
	} finally { cleanup(); }
});

test('unified session: messages and interactions are synthesized from journal projection entries', async () => {
	const entry = (e: unknown) => ({ op: 'append_entry', entry: e });
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'dddd4444-0000-0000-0000-000000000000',
		journalLines: [
			{ type: 'projection_delta', payload: { delta: [
				entry({ id: 'u1', type: 'message', role: 'user', source: 'turn_start', createdAt: 1,
					content: [{ type: 'text', text: 'hello' }] }),
				entry({ id: 'a1', type: 'message', role: 'assistant', createdAt: 2,
					content: [{ type: 'text', text: 'hi there' }] }),
				entry({ id: 't1', type: 'effect', createdAt: 3, detail: { kind: 'tool', toolName: 'bash',
					input: { command: 'ls' }, display: {} }, state: { outputText: 'file.txt' } }),
				entry({ id: 'u2', type: 'message', role: 'user', source: 'steer', createdAt: 4,
					content: [{ type: 'text', text: 'injected steer' }] }),
			], watermark: 4 } },
			envelopeDelta({ inputTokens: 100, outputTokens: 10, totalTokens: 110 }),
		],
	});
	try {
		assert.equal(await da.countInteractions(metaPath), 1);
		const messages = await da.readSessionMessages(metaPath);
		assert.deepEqual(messages.map(m => m.role), ['user', 'assistant', 'tool', 'user']);
		assert.equal(messages[0].content, 'hello');
		assert.equal(messages[1].content, 'hi there');
		assert.equal(messages[1].tool_calls.length, 1);
		assert.equal(messages[1].tool_calls[0].function.name, 'bash');
		assert.equal(JSON.parse(messages[1].tool_calls[0].function.arguments).command, 'ls');
		assert.equal(messages[2].content, 'file.txt');
		assert.equal(messages[3].injected, true);
	} finally { cleanup(); }
});

test('unified session: meta (timestamps, title, model) is read from meta.json as before', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'eeee5555-0000-0000-0000-000000000000',
		meta: {
			session_id: 'eeee5555-0000-0000-0000-000000000000',
			start_time: '2026-11-04T16:46:59.862000+00:00',
			end_time: '2026-11-04T22:00:00.000000+00:00',
			title: 'fix the thing',
			config: { active_model: 'mistral-large-4-0-3' },
		},
	});
	try {
		const meta = await da.getSessionMeta(metaPath);
		assert.equal(meta.title, 'fix the thing');
		assert.equal(meta.firstInteraction, '2026-11-04T16:46:59.862000+00:00');
		assert.equal(meta.lastInteraction, '2026-11-04T22:00:00.000000+00:00');
		assert.equal(meta.model, 'mistral-large-4-0-3');
		assert.deepEqual(await da.getSessionStats(metaPath), {});
	} finally { cleanup(); }
});

test('isVibeSessionFile: matches unified-store meta.json paths', () => {
	const home = os.homedir();
	assert.ok(da.isVibeSessionFile(path.join(home, '.vibe', 'logs', 'session', 'unified', 'some-uuid', 'meta.json')));
	assert.ok(da.isVibeSessionFile(path.join(home, '.vibe', 'logs', 'session', 'session_20260922_091515_5327080d', 'meta.json')));
	assert.ok(!da.isVibeSessionFile(path.join(home, '.vibe', 'logs', 'session', 'unified', 'some-uuid', 'messages.jsonl')));
});

/** A core_input record carrying a user_message command, as the desktop app journals live turns. */
function coreInputUser(clientId: string, text: string, inputId: number, timeMs: number): unknown {
	return { type: 'core_input', payload: { input: {
		input_id: inputId,
		command: { type: 'user_message', mode: 'queue', turn_id: `turn-${inputId}`,
			content: [{ type: 'text', text, _meta: { vibe_client_message_id: clientId } }] },
		determinism: { time_unix_ms: timeMs },
	} } };
}

test('unified session: live user turns are synthesized from core_input user_message records', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'aaaa6666-0000-0000-0000-000000000000',
		journalLines: [
			{ type: 'command_reserved', payload: { client_command_id: 'c1', method: 'turn/start', params: { injected: false, message: [{ text: 'first' }] } } },
			coreInputUser('c1', 'first', 1, 1000),
			{ type: 'command_reserved', payload: { client_command_id: 'c2', method: 'turn/start', params: { injected: true, message: [{ text: 'steer' }] } } },
			coreInputUser('c2', 'steer', 2, 2000),
			coreInputUser('c3', 'second real turn', 3, 3000),
			{ type: 'projection_delta', payload: { delta: [
				{ op: 'append_entry', entry: { id: 'a1', type: 'message', role: 'assistant', createdAt: 1500, content: [{ type: 'text', text: 'answer' }] } },
			] } },
			envelopeDelta({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
		],
	});
	try {
		// c1 and c3 are genuine turn starts; c2 was injected via its command_reserved record.
		assert.equal(await da.countInteractions(metaPath), 2);
		const messages = await da.readSessionMessages(metaPath);
		const users = messages.filter(m => m.role === 'user');
		assert.deepEqual(users.map(m => m.content), ['first', 'steer', 'second real turn']);
		assert.equal(users[1].injected, true);
		assert.equal(users[0].injected, undefined);
	} finally { cleanup(); }
});

test('unified session: a checkpointed chunk user entry deduplicates its core_input record by client id', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'bbbb7777-0000-0000-0000-000000000000',
		journalLines: [coreInputUser('c1', 'hello once', 1, 1000)],
		chunkFiles: { 'abc123.json': [
			{ id: 'c1', type: 'message', role: 'user', source: 'turn_start', createdAt: 1000, content: [{ type: 'text', text: 'hello once' }] },
		] },
	});
	try {
		assert.equal(await da.countInteractions(metaPath), 1);
		const messages = await da.readSessionMessages(metaPath);
		assert.equal(messages.filter(m => m.role === 'user').length, 1);
	} finally { cleanup(); }
});

test('unified session: replace_entry settles an effect and state.output becomes the tool result', async () => {
	const running = { id: 't1', type: 'effect', createdAt: 1, detail: { kind: 'tool', toolName: 'bash', input: { command: 'ls' } },
		state: { status: 'running', outputText: '' } };
	const settled = { id: 't1', type: 'effect', createdAt: 1, detail: { kind: 'tool', toolName: 'bash', input: { command: 'ls' } },
		state: { status: 'completed', outputText: '', output: { type: 'tool_result', content: [], structured_content: { command: 'ls', returncode: 0, stdout: 'a.txt\nb.txt', stderr: '' } } } };
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'cccc8888-0000-0000-0000-000000000000',
		journalLines: [
			coreInputUser('c1', 'run ls', 1, 1000),
			{ type: 'projection_delta', payload: { delta: [
				{ op: 'append_entry', entry: running },
				{ op: 'append_entry', entry: { id: 'a1', type: 'message', role: 'assistant', createdAt: 1200, content: [{ type: 'text', text: 'done' }] } },
			] } },
			{ type: 'projection_delta', payload: { delta: [ { op: 'replace_entry', entry: settled } ] } },
			envelopeDelta({ inputTokens: 10, outputTokens: 5, totalTokens: 15 }),
		],
	});
	try {
		const messages = await da.readSessionMessages(metaPath);
		const tool = messages.find(m => m.role === 'tool');
		assert.equal(tool?.content, 'a.txt\nb.txt');
		const assistant = messages.find(m => m.role === 'assistant');
		assert.equal(assistant?.tool_calls?.[0]?.function?.name, 'bash');
	} finally { cleanup(); }
});

test('unified session: effect with text content parts prefers them over structured_content', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'dddd9999-0000-0000-0000-000000000000',
		journalLines: [
			coreInputUser('c1', 'go', 1, 1000),
			{ type: 'projection_delta', payload: { delta: [
				{ op: 'append_entry', entry: { id: 't1', type: 'effect', createdAt: 2, detail: { kind: 'tool', toolName: 'read', input: {} },
					state: { output: { content: [{ type: 'text', text: 'file contents here' }], structured_content: { stdout: 'ignored' } } } } },
			] } },
			envelopeDelta({ inputTokens: 1, outputTokens: 1, totalTokens: 2 }),
		],
	});
	try {
		const messages = await da.readSessionMessages(metaPath);
		assert.equal(messages.find(m => m.role === 'tool')?.content, 'file contents here');
	} finally { cleanup(); }
});

test('desktop session: runtime_path session_api and environment.working_directory are read from meta.json', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'eeeeaaaa-0000-0000-0000-000000000000',
		meta: {
			session_id: 'eeeeaaaa-0000-0000-0000-000000000000',
			start_time: '2026-11-22T23:15:46.585000+00:00',
			end_time: '2026-11-23T01:00:00.000000+00:00',
			config: { active_model: 'mistral-large-4-0' },
			runtime_path: 'session_api',
			project: { kind: 'local', id: '33ed8100-bde9-44de-a21a-75f0d0f8d3bd' },
			environment: { working_directory: 'C:\\\\Users\\\\RobBos\\\\repo' },
		},
	});
	try {
		assert.equal(await da.getRuntimePath(metaPath), 'session_api');
		assert.equal(await da.isDesktopSession(metaPath), true);
		const meta = await da.getSessionMeta(metaPath);
		assert.equal(meta.model, 'mistral-large-4-0');
		assert.equal(meta.workspacePath, 'C:\\\\Users\\\\RobBos\\\\repo');
	} finally { cleanup(); }
});

test('CLI session: no runtime_path means not a desktop session; workspacePath still read', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'ffffbbbb-0000-0000-0000-000000000000',
		meta: {
			session_id: 'ffffbbbb-0000-0000-0000-000000000000',
			start_time: '2026-11-04T16:46:59.862000+00:00',
			end_time: '2026-11-04T16:46:59.862000+00:00',
			config: { active_model: 'mistral-large-4-0-3' },
			environment: { working_directory: '/home/rob/repo' },
		},
	});
	try {
		assert.equal(await da.getRuntimePath(metaPath), undefined);
		assert.equal(await da.isDesktopSession(metaPath), false);
		assert.equal((await da.getSessionMeta(metaPath)).workspacePath, '/home/rob/repo');
	} finally { cleanup(); }
});

test('runtime_path: unsafe object keys are treated as absent', async () => {
	const { metaPath, cleanup } = writeUnifiedSession({
		id: 'cccccccc-0000-0000-0000-000000000000',
		meta: { session_id: 'cccccccc-0000-0000-0000-000000000000', runtime_path: '__proto__' },
	});
	try {
		assert.equal(await da.getRuntimePath(metaPath), undefined);
		assert.equal(await da.isDesktopSession(metaPath), false);
	} finally { cleanup(); }
});
