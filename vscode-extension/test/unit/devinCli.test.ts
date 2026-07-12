import test from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { DevinCliDataAccess } from '../../../src/devinCli';

const SESSION_ID = 'sess-abc123';

function createHarness() {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'devincli-'));
	const dbPath = path.join(tmpDir, 'sessions.db');
	const virtualPath = `${dbPath}#${SESSION_ID}`;
	fs.writeFileSync(dbPath, 'stub');

	type Row = { columns: string[]; values: unknown[][] };
	const sessionRow: Row = {
		columns: ['id', 'working_directory', 'backend_type', 'model', 'agent_mode', 'created_at',
			'last_activity_at', 'title', 'main_chain_id', 'cogs_json', 'hidden'],
		values: [[SESSION_ID, '/home/alice/project', 'chisel', 'claude-sonnet-4', 'agent', 1700000000,
			1700003600, 'Fix the bug', 3, null, 0]],
	};
	const messageNodeRows: Row = {
		columns: ['row_id', 'session_id', 'node_id', 'parent_node_id', 'chat_message', 'created_at', 'metadata'],
		values: [
			[1, SESSION_ID, 1, null, JSON.stringify({ role: 'user', content: [{ type: 'text', text: 'Hello' }] }), 1700000000, null],
			[2, SESSION_ID, 2, 1, JSON.stringify({ role: 'assistant', content: [{ type: 'text', text: 'Hi there' }] }), 1700000010, null],
			[3, SESSION_ID, 3, 2, JSON.stringify({ sessionUpdate: 'user_message', content: [{ type: 'text', text: 'Fix it' }] }), 1700000020, null],
		],
	};

	class FakeDatabase {
		exec(query: string, _params?: unknown[]): Row[] {
			if (query.includes('FROM sessions WHERE id')) { return [sessionRow]; }
			if (query.includes('FROM message_nodes')) { return [messageNodeRows]; }
			if (query.includes('SELECT id FROM sessions')) { return [{ columns: ['id'], values: [[SESSION_ID]] }]; }
			if (query.includes('FROM tool_call_state')) { return [{ columns: ['session_id', 'tool_call_id', 'tool_call_json', 'tool_call_update_json'], values: [] }]; }
			if (query.includes('FROM prompt_history')) { return [{ columns: ['c'], values: [[0]] }]; }
			return [];
		}
		close(): void { /* noop */ }
	}

	const access = new DevinCliDataAccess();
	(access as any).initSqlJs = async () => ({ Database: FakeDatabase });
	// Ensure discoverSessionIds()/getDbPath() use this harness's temp DB instead of the
	// real OS-default location (which may or may not exist depending on the machine).
	access.setDbPathOverrideForTests(dbPath);

	return {
		access, dbPath, virtualPath,
		cleanup: () => { access.dispose(); fs.rmSync(tmpDir, { recursive: true, force: true }); },
	};
}

test('getConfigDir returns a devin/cli path', () => {
	const access = new DevinCliDataAccess();
	const dir = access.getConfigDir().replace(/\\/g, '/').toLowerCase();
	assert.ok(dir.includes('devin/cli'), `expected devin/cli in ${dir}`);
});

test('isDevinCliSessionFile recognises the virtual path scheme', () => {
	const access = new DevinCliDataAccess();
	const virtual = `${access.getDbPath()}#${SESSION_ID}`;
	assert.ok(access.isDevinCliSessionFile(virtual));
	assert.ok(access.isDevinCliSessionFile(virtual.replace(/\//g, '\\')));
	assert.ok(!access.isDevinCliSessionFile('/home/alice/.crush/crush.db#abc'));
	assert.ok(!access.isDevinCliSessionFile('/home/alice/.devin/cascade/file.pb'));
});

test('getDbPathFromVirtual and getSessionId parse the virtual path', () => {
	const access = new DevinCliDataAccess();
	const dbPath = access.getDbPath();
	const virtual = `${dbPath}#${SESSION_ID}`;
	assert.equal(access.getDbPathFromVirtual(virtual), dbPath);
	assert.equal(access.getSessionId(virtual), SESSION_ID);
});

test('virtualPath builds the expected scheme', () => {
	const access = new DevinCliDataAccess();
	const vp = access.virtualPath(SESSION_ID);
	assert.equal(vp, `${access.getDbPath()}#${SESSION_ID}`);
});

test('parseChatMessage extracts role/text from a direct {role, content} shape', () => {
	const access = new DevinCliDataAccess();
	const parsed = access.parseChatMessage(JSON.stringify({ role: 'user', content: [{ type: 'text', text: 'Hello world' }] }));
	assert.equal(parsed.role, 'user');
	assert.equal(parsed.text, 'Hello world');
});

test('parseChatMessage extracts role from an ACP-style sessionUpdate discriminator', () => {
	const access = new DevinCliDataAccess();
	const userMsg = access.parseChatMessage(JSON.stringify({ sessionUpdate: 'user_message', content: [{ type: 'text', text: 'Do X' }] }));
	assert.equal(userMsg.role, 'user');
	const agentMsg = access.parseChatMessage(JSON.stringify({ sessionUpdate: 'agent_message_chunk', content: [{ type: 'text', text: 'Doing X' }] }));
	assert.equal(agentMsg.role, 'assistant');
});

test('parseChatMessage returns unknown role and empty text for malformed JSON', () => {
	const access = new DevinCliDataAccess();
	const parsed = access.parseChatMessage('not json');
	assert.equal(parsed.role, 'unknown');
});

test('parseChatMessage handles null input', () => {
	const access = new DevinCliDataAccess();
	const parsed = access.parseChatMessage(null);
	assert.equal(parsed.role, 'unknown');
	assert.equal(parsed.text, '');
});

test('buildMainChain walks parent_node_id from main_chain_id back to the root', () => {
	const access = new DevinCliDataAccess();
	const nodes = [
		{ row_id: 1, session_id: SESSION_ID, node_id: 1, parent_node_id: null, chat_message: null, created_at: 1, metadata: null },
		{ row_id: 2, session_id: SESSION_ID, node_id: 2, parent_node_id: 1, chat_message: null, created_at: 2, metadata: null },
		{ row_id: 3, session_id: SESSION_ID, node_id: 3, parent_node_id: 2, chat_message: null, created_at: 3, metadata: null },
		// Abandoned branch — regenerated from node 1, should not appear when main_chain_id = 3.
		{ row_id: 4, session_id: SESSION_ID, node_id: 4, parent_node_id: 1, chat_message: null, created_at: 4, metadata: null },
	];
	const chain = access.buildMainChain(nodes, 3);
	assert.deepEqual(chain.map(n => n.node_id), [1, 2, 3]);
});

test('buildMainChain falls back to created_at order when main_chain_id is null', () => {
	const access = new DevinCliDataAccess();
	const nodes = [
		{ row_id: 2, session_id: SESSION_ID, node_id: 2, parent_node_id: 1, chat_message: null, created_at: 20, metadata: null },
		{ row_id: 1, session_id: SESSION_ID, node_id: 1, parent_node_id: null, chat_message: null, created_at: 10, metadata: null },
	];
	const chain = access.buildMainChain(nodes, null);
	assert.deepEqual(chain.map(n => n.node_id), [1, 2]);
});

test('readSession reads session metadata from the DB', async () => {
	const harness = createHarness();
	try {
		const session = await harness.access.readSession(harness.virtualPath);
		assert.equal(session?.id, SESSION_ID);
		assert.equal(session?.model, 'claude-sonnet-4');
		assert.equal(session?.title, 'Fix the bug');
		assert.equal(session?.main_chain_id, 3);
	} finally {
		harness.cleanup();
	}
});

test('getMessageNodes returns all nodes for the session ordered by created_at', async () => {
	const harness = createHarness();
	try {
		const nodes = await harness.access.getMessageNodes(harness.virtualPath);
		assert.equal(nodes.length, 3);
		assert.equal(nodes[0].node_id, 1);
	} finally {
		harness.cleanup();
	}
});

test('countInteractions counts user-role message nodes', async () => {
	const harness = createHarness();
	try {
		const count = await harness.access.countInteractions(harness.virtualPath);
		// node 1 (role: user) + node 3 (sessionUpdate: user_message) = 2 user turns.
		assert.equal(count, 2);
	} finally {
		harness.cleanup();
	}
});

test('getTokens estimates tokens from message text when cogs_json is absent', async () => {
	const harness = createHarness();
	try {
		const result = await harness.access.getTokens(harness.virtualPath);
		assert.ok(result.tokens > 0);
		assert.equal(result.thinkingTokens, 0);
	} finally {
		harness.cleanup();
	}
});

test('getModelUsage attributes estimated tokens to the session model', async () => {
	const harness = createHarness();
	try {
		const usage = await harness.access.getModelUsage(harness.virtualPath);
		assert.ok(usage['claude-sonnet-4']);
		assert.ok(usage['claude-sonnet-4'].inputTokens > 0);
		assert.ok(usage['claude-sonnet-4'].outputTokens > 0);
	} finally {
		harness.cleanup();
	}
});

test('discoverSessionIds returns session ids from the DB', async () => {
	const harness = createHarness();
	try {
		const ids = await harness.access.discoverSessionIds();
		assert.deepEqual(ids, [SESSION_ID]);
	} finally {
		harness.cleanup();
	}
});

test('getDailyFractions attributes turns to their local calendar day', async () => {
	const harness = createHarness();
	try {
		const fractions = await harness.access.getDailyFractions(harness.virtualPath);
		const total = Object.values(fractions).reduce((sum, f) => sum + f, 0);
		assert.ok(Math.abs(total - 1) < 1e-9);
	} finally {
		harness.cleanup();
	}
});
