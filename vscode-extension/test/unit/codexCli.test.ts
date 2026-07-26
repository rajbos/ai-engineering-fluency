import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { CodexCliDataAccess } from '../../../src/codexcli';

const ROLLOUT_UUID = '019d0233-2d86-7c21-b13a-8fa9578d3a0d';
const DB_ONLY_UUID = '019d0236-27fa-71e0-9ade-ae3682565e7b';

/** Build a realistic new-format rollout JSONL fixture with two user turns and a model switch. */
function rolloutFixtureLines(): string[] {
	const line = (timestamp: string, type: string, payload: unknown) => JSON.stringify({ timestamp, type, payload });
	return [
		line('2026-03-19T12:00:00.000Z', 'session_meta', {
			id: ROLLOUT_UUID, timestamp: '2026-03-19T12:00:00.000Z', cwd: 'C:\\repo\\project',
			originator: 'codex_cli_rs', cli_version: '0.115.0', instructions: null,
		}),
		line('2026-03-19T12:00:01.000Z', 'turn_context', { cwd: 'C:\\repo\\project', model: 'gpt-5.4', effort: 'medium' }),
		// Synthetic instruction payloads arrive as user messages and must be filtered out.
		line('2026-03-19T12:00:02.000Z', 'response_item', {
			type: 'message', role: 'user',
			content: [{ type: 'input_text', text: '<user_instructions>Always be terse</user_instructions>' }],
		}),
		line('2026-03-19T12:00:02.500Z', 'response_item', {
			type: 'message', role: 'user',
			content: [{ type: 'input_text', text: '<environment_context>cwd: C:\\repo</environment_context>' }],
		}),
		line('2026-03-19T12:00:03.000Z', 'response_item', {
			type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Fix the login bug' }],
		}),
		line('2026-03-19T12:00:04.000Z', 'response_item', {
			type: 'reasoning', summary: [{ type: 'summary_text', text: 'Analysing the login flow first' }], content: null,
		}),
		line('2026-03-19T12:00:05.000Z', 'response_item', {
			type: 'function_call', name: 'shell', arguments: '{"command":["grep","login"]}', call_id: 'c1',
		}),
		line('2026-03-19T12:00:06.000Z', 'response_item', { type: 'function_call_output', call_id: 'c1', output: 'ok' }),
		line('2026-03-19T12:00:07.000Z', 'response_item', {
			type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Fixed the null check.' }],
		}),
		line('2026-03-19T12:00:08.000Z', 'event_msg', {
			type: 'token_count',
			info: {
				total_token_usage: { input_tokens: 1000, cached_input_tokens: 800, output_tokens: 200, reasoning_output_tokens: 50, total_tokens: 1200 },
				last_token_usage: { input_tokens: 1000, cached_input_tokens: 800, output_tokens: 200, reasoning_output_tokens: 50, total_tokens: 1200 },
				model_context_window: 272000,
			},
		}),
		// Second turn the next day on a different model.
		line('2026-03-20T09:00:00.000Z', 'turn_context', { cwd: 'C:\\repo\\project', model: 'gpt-5.4-codex', effort: 'high' }),
		line('2026-03-20T09:00:01.000Z', 'response_item', {
			type: 'message', role: 'user', content: [{ type: 'input_text', text: 'Now add tests' }],
		}),
		line('2026-03-20T09:00:02.000Z', 'response_item', {
			type: 'web_search_call', action: { type: 'search', query: 'jest login test' },
		}),
		line('2026-03-20T09:00:03.000Z', 'response_item', {
			type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'Added two tests.' }],
		}),
		line('2026-03-20T09:00:04.000Z', 'event_msg', {
			type: 'token_count',
			info: {
				total_token_usage: { input_tokens: 3000, cached_input_tokens: 2500, output_tokens: 500, reasoning_output_tokens: 80, total_tokens: 3500 },
				last_token_usage: { input_tokens: 2000, cached_input_tokens: 1700, output_tokens: 300, reasoning_output_tokens: 30, total_tokens: 2300 },
				model_context_window: 272000,
			},
		}),
	];
}

function createHarness() {
	const tmpHome = fs.mkdtempSync(path.join(os.tmpdir(), 'codexcli-'));
	const dayDir = path.join(tmpHome, 'sessions', '2026', '03', '19');
	fs.mkdirSync(dayDir, { recursive: true });
	const rolloutPath = path.join(dayDir, `rollout-2026-03-19T12-00-00-${ROLLOUT_UUID}.jsonl`);
	fs.writeFileSync(rolloutPath, rolloutFixtureLines().join('\n') + '\n');
	// Older-generation DB left behind + current one: getStateDbPath must pick the highest N.
	fs.writeFileSync(path.join(tmpHome, 'state_3.sqlite'), 'stub');
	const dbPath = path.join(tmpHome, 'state_5.sqlite');
	fs.writeFileSync(dbPath, 'stub');

	type Row = { columns: string[]; values: unknown[][] };
	const threadColumns = ['id', 'rollout_path', 'created_at', 'updated_at', 'cwd', 'title', 'tokens_used',
		'has_user_event', 'archived', 'first_user_message', 'model'];
	// Thread 1 duplicates the rollout file (must be deduped); thread 2 has a stale rollout_path (DB-only).
	const threadRows: Row = {
		columns: threadColumns,
		values: [
			[ROLLOUT_UUID, rolloutPath, 1774000000, 1774003600, 'C:\\repo\\project', 'Fix the login bug', 3500, 1, 0, 'Fix the login bug', 'gpt-5.4'],
			[DB_ONLY_UUID, path.join(tmpHome, 'sessions', 'gone.jsonl'), 1774100000, 1774103600, 'C:\\repo\\other', 'Refactor auth', 4200, 1, 0, 'Refactor the auth module', 'gpt-5.4-codex'],
		],
	};

	class FakeDatabase {
		exec(query: string, params?: unknown[]): Row[] {
			if (query.includes('FROM threads WHERE id')) {
				const id = params?.[0];
				const match = threadRows.values.filter(v => v[0] === id);
				return match.length > 0 ? [{ columns: threadRows.columns, values: match }] : [];
			}
			if (query.includes('FROM threads')) { return [threadRows]; }
			return [];
		}
		close(): void { /* noop */ }
	}

	const access = new CodexCliDataAccess();
	(access as any).initSqlJs = async () => ({ Database: FakeDatabase });
	access.setCodexHomeOverrideForTests(tmpHome);

	return {
		access, tmpHome, dbPath, rolloutPath,
		cleanup: () => { access.dispose(); fs.rmSync(tmpHome, { recursive: true, force: true }); },
	};
}

test('getCodexHome defaults to ~/.codex and honours the test override', () => {
	const access = new CodexCliDataAccess();
	if (!process.env['CODEX_HOME']) {
		assert.equal(normalize(access.getCodexHome()), normalize(path.join(os.homedir(), '.codex')));
	}
	access.setCodexHomeOverrideForTests('/tmp/custom-codex');
	assert.equal(access.getCodexHome(), '/tmp/custom-codex');
});

function normalize(p: string): string { return p.replace(/\\/g, '/').toLowerCase(); }

test('getStateDbPath picks the highest-numbered state_<N>.sqlite', () => {
	const harness = createHarness();
	try {
		assert.equal(harness.access.getStateDbPath(), harness.dbPath);
	} finally {
		harness.cleanup();
	}
});

test('isCodexCliSessionFile recognises rollouts and virtual thread paths, rejects other files', () => {
	const access = new CodexCliDataAccess();
	const home = path.join(os.homedir(), '.codex');
	const rollout = path.join(home, 'sessions', '2026', '03', '19', `rollout-2026-03-19T12-00-00-${ROLLOUT_UUID}.jsonl`);
	assert.ok(access.isCodexCliSessionFile(rollout));
	assert.ok(access.isCodexCliSessionFile(rollout.replace(/\\/g, '/')));
	assert.ok(access.isCodexCliSessionFile(path.join(home, `state_5.sqlite#${ROLLOUT_UUID}`)));
	assert.ok(!access.isCodexCliSessionFile(path.join(home, 'logs_1.sqlite')));
	assert.ok(!access.isCodexCliSessionFile(path.join(home, 'models_cache.json')));
	assert.ok(!access.isCodexCliSessionFile(path.join(os.homedir(), '.crush', 'crush.db#abc')));
});

test('virtual path helpers round-trip db path and thread id', () => {
	const harness = createHarness();
	try {
		const vp = harness.access.virtualPath(DB_ONLY_UUID);
		assert.equal(vp, `${harness.dbPath}#${DB_ONLY_UUID}`);
		assert.ok(harness.access.isVirtualThreadPath(vp));
		assert.equal(harness.access.getDbPathFromVirtual(vp), harness.dbPath);
		assert.equal(harness.access.getThreadId(vp), DB_ONLY_UUID);
		assert.equal(harness.access.getBackingPath(vp), harness.dbPath);
	} finally {
		harness.cleanup();
	}
});

test('discoverSessions finds rollout files and adds DB-only threads as virtual paths (deduped)', async () => {
	const harness = createHarness();
	try {
		const { files, rolloutCount, dbOnlyCount } = await harness.access.discoverSessions();
		assert.equal(rolloutCount, 1);
		assert.equal(dbOnlyCount, 1);
		assert.equal(files.length, 2);
		assert.ok(files.includes(harness.rolloutPath));
		assert.ok(files.includes(`${harness.dbPath}#${DB_ONLY_UUID}`));
	} finally {
		harness.cleanup();
	}
});

test('getTokens sums per-model deltas from cumulative token_count snapshots', async () => {
	const harness = createHarness();
	try {
		const result = await harness.access.getTokens(harness.rolloutPath);
		assert.equal(result.tokens, 3500); // final cumulative input 3000 + output 500
		assert.equal(result.thinkingTokens, 80);
	} finally {
		harness.cleanup();
	}
});

test('countInteractions counts genuine user messages, filtering synthetic instruction payloads', async () => {
	const harness = createHarness();
	try {
		assert.equal(await harness.access.countInteractions(harness.rolloutPath), 2);
	} finally {
		harness.cleanup();
	}
});

test('getModelUsage attributes snapshot deltas to the model active at each snapshot', async () => {
	const harness = createHarness();
	try {
		const usage = await harness.access.getModelUsage(harness.rolloutPath);
		assert.deepEqual(usage['gpt-5.4'], { inputTokens: 1000, outputTokens: 200, sessions: 0 });
		assert.deepEqual(usage['gpt-5.4-codex'], { inputTokens: 2000, outputTokens: 300, sessions: 0 });
	} finally {
		harness.cleanup();
	}
});

test('getMeta extracts title, timestamps and cwd from the rollout', async () => {
	const harness = createHarness();
	try {
		const meta = await harness.access.getMeta(harness.rolloutPath);
		assert.equal(meta.title, 'Fix the login bug');
		assert.equal(meta.firstInteraction, '2026-03-19T12:00:00.000Z');
		assert.equal(meta.lastInteraction, '2026-03-20T09:00:04.000Z');
		assert.equal(meta.workspacePath, 'C:\\repo\\project');
	} finally {
		harness.cleanup();
	}
});

test('getDailyFractions splits across the two local days of the session', async () => {
	const harness = createHarness();
	try {
		const fractions = await harness.access.getDailyFractions(harness.rolloutPath);
		const total = Object.values(fractions).reduce((s, f) => s + f, 0);
		assert.ok(Math.abs(total - 1) < 1e-9);
		assert.equal(Object.keys(fractions).length, 2);
	} finally {
		harness.cleanup();
	}
});

test('DB-only virtual threads expose tokens_used, metadata and a single interaction', async () => {
	const harness = createHarness();
	try {
		const vp = `${harness.dbPath}#${DB_ONLY_UUID}`;
		const tokens = await harness.access.getTokens(vp);
		assert.equal(tokens.tokens, 4200);
		assert.equal(await harness.access.countInteractions(vp), 1);
		const usage = await harness.access.getModelUsage(vp);
		assert.deepEqual(usage['gpt-5.4-codex'], { inputTokens: 4200, outputTokens: 0, sessions: 0 });
		const meta = await harness.access.getMeta(vp);
		assert.equal(meta.title, 'Refactor auth');
		assert.equal(meta.workspacePath, 'C:\\repo\\other');
		// created_at 1774100000 is epoch seconds → must be converted to ms (not year 1970 / 58043).
		assert.ok(meta.firstInteraction!.startsWith('2026-'));
	} finally {
		harness.cleanup();
	}
});

test('toMillis treats small epochs as seconds and large ones as milliseconds', () => {
	const access = new CodexCliDataAccess();
	assert.equal(access.toMillis(1774000000), 1774000000000);
	assert.equal(access.toMillis(1774000000000), 1774000000000);
	assert.equal(access.toMillis(null), null);
	assert.equal(access.toMillis(0), null);
});

test('normalizeRolloutLine handles legacy unwrapped response items and bare session meta', () => {
	const access = new CodexCliDataAccess();
	const legacyItem = access.normalizeRolloutLine({ type: 'message', role: 'user', content: [{ type: 'input_text', text: 'hi' }] });
	assert.equal(legacyItem?.kind, 'response_item');
	assert.equal((legacyItem?.payload as any).role, 'user');
	const legacyMeta = access.normalizeRolloutLine({ id: ROLLOUT_UUID, timestamp: '2025-01-01T00:00:00Z', instructions: null });
	assert.equal(legacyMeta?.kind, 'session_meta');
	assert.equal(access.normalizeRolloutLine({ foo: 'bar' }), null);
});

test('token_count events with inline usage fields (older builds) are still parsed', async () => {
	const harness = createHarness();
	try {
		const extra = path.join(harness.tmpHome, 'sessions', '2026', '03', '19', `rollout-2026-03-19T13-00-00-119d0233-2d86-7c21-b13a-8fa9578d3a0d.jsonl`);
		fs.writeFileSync(extra, [
			JSON.stringify({ timestamp: '2026-03-19T13:00:00.000Z', type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'hello' }] } }),
			JSON.stringify({ timestamp: '2026-03-19T13:00:01.000Z', type: 'event_msg', payload: { type: 'token_count', input_tokens: 500, cached_input_tokens: 0, output_tokens: 100, reasoning_output_tokens: 10, total_tokens: 600 } }),
		].join('\n'));
		const tokens = await harness.access.getTokens(extra);
		assert.equal(tokens.tokens, 600);
		assert.equal(tokens.thinkingTokens, 10);
	} finally {
		harness.cleanup();
	}
});

test('rollouts without token_count events fall back to a text-length estimate', async () => {
	const harness = createHarness();
	try {
		const extra = path.join(harness.tmpHome, 'sessions', '2026', '03', '19', `rollout-2026-03-19T14-00-00-229d0233-2d86-7c21-b13a-8fa9578d3a0d.jsonl`);
		fs.writeFileSync(extra, [
			JSON.stringify({ timestamp: '2026-03-19T14:00:00.000Z', type: 'response_item', payload: { type: 'message', role: 'user', content: [{ type: 'input_text', text: 'a'.repeat(400) }] } }),
			JSON.stringify({ timestamp: '2026-03-19T14:00:01.000Z', type: 'response_item', payload: { type: 'message', role: 'assistant', content: [{ type: 'output_text', text: 'b'.repeat(200) }] } }),
		].join('\n'));
		const tokens = await harness.access.getTokens(extra);
		assert.equal(tokens.tokens, 150); // (400 + 200) / 4
	} finally {
		harness.cleanup();
	}
});
