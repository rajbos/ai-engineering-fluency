/**
 * Unit tests for the Eclipse Copilot conversation parser (src/eclipse.ts).
 *
 * Covers behavior added while reconciling the parser against real
 * `com.microsoft.copilot.eclipse.core` conversation files:
 *   - `thinkingBlock.content` reasoning text is estimated as thinking tokens.
 *   - Tool calls without a real `arguments` payload fall back to `progressMessage`.
 */
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

import { EclipseDataAccess } from '../../src/eclipse';

const eclipse = new EclipseDataAccess();

function createTempSession(session: unknown): string {
	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'eclipse-test-'));
	const conversationsDir = path.join(tmpDir, '.metadata', '.plugins', 'com.microsoft.copilot.eclipse.core', 'conversations', 'testuser');
	fs.mkdirSync(conversationsDir, { recursive: true });
	const filePath = path.join(conversationsDir, 'conv-1.json');
	fs.writeFileSync(filePath, JSON.stringify(session), 'utf8');
	return filePath;
}

function cleanup(filePath: string): void {
	try {
		const tmpRoot = filePath.split('.metadata')[0];
		fs.rmSync(tmpRoot, { recursive: true, force: true });
	} catch { /* ignore */ }
}

function makeSession(turns: any[]): any {
	return {
		conversationId: 'conv-1',
		title: 'Test conversation',
		requesterUsername: 'testuser',
		responderUsername: 'GitHub Copilot',
		turns,
		creationDate: '2026-07-01T00:00:00.000000000Z',
		lastMessageDate: '2026-07-01T00:01:00.000000000Z',
	};
}

// ── thinkingBlock content contributes to thinking tokens ────────────────────

test('getTokensFromEclipseSession: includes thinkingBlock content in thinkingTokens and total', async () => {
	const session = makeSession([
		{
			role: 'user', turnId: 't1', timestamp: '2026-07-01T00:00:00Z',
			message: { text: 'how do I fix this?' },
		},
		{
			role: 'copilot', turnId: 't1', timestamp: '2026-07-01T00:00:01Z',
			reply: {
				editAgentRounds: [
					{
						roundId: 1,
						reply: 'Here is the fix.',
						toolCalls: [],
						thinkingBlock: { state: 'COMPLETED', id: 'th1', content: 'The user wants a fix, let me think about the root cause carefully.', title: 'Reasoned about fix' },
					},
				],
				modelName: 'GPT-5.3-Codex',
			},
		},
	]);
	const filePath = createTempSession(session);
	try {
		const result = await eclipse.getTokensFromEclipseSession(filePath);
		assert.ok(result.thinkingTokens > 0, 'expected thinkingTokens to be estimated from thinkingBlock.content');
		assert.ok(result.tokens > result.thinkingTokens, 'expected total tokens to include input/output text too');
	} finally {
		cleanup(filePath);
	}
});

test('getTokensFromEclipseSession: thinkingTokens is 0 when no thinkingBlock is present', async () => {
	const session = makeSession([
		{ role: 'user', turnId: 't1', timestamp: '2026-07-01T00:00:00Z', message: { text: 'hello' } },
		{
			role: 'copilot', turnId: 't1', timestamp: '2026-07-01T00:00:01Z',
			reply: { editAgentRounds: [{ roundId: 1, reply: 'hi there', toolCalls: [] }], modelName: 'GPT-5.3-Codex' },
		},
	]);
	const filePath = createTempSession(session);
	try {
		const result = await eclipse.getTokensFromEclipseSession(filePath);
		assert.equal(result.thinkingTokens, 0);
	} finally {
		cleanup(filePath);
	}
});

// ── buildEclipseTurns: per-turn thinkingTokens ───────────────────────────────

test('buildEclipseTurns: exposes a positive thinkingTokens count per turn when thinkingBlock is present', async () => {
	const session = makeSession([
		{ role: 'user', turnId: 't1', timestamp: '2026-07-01T00:00:00Z', message: { text: 'why does this fail?' } },
		{
			role: 'copilot', turnId: 't1', timestamp: '2026-07-01T00:00:01Z',
			reply: {
				editAgentRounds: [
					{ roundId: 1, reply: 'Because of X.', toolCalls: [], thinkingBlock: { state: 'COMPLETED', id: 'th1', content: 'Long reasoning text about the root cause of the failure.' } },
				],
				modelName: 'Claude Haiku 4.5',
			},
		},
	]);
	const filePath = createTempSession(session);
	try {
		const turns = await eclipse.buildEclipseTurns(filePath);
		assert.equal(turns.length, 1);
		assert.ok(turns[0].thinkingTokens > 0);
	} finally {
		cleanup(filePath);
	}
});

// ── Tool call arguments fallback to progressMessage ──────────────────────────

test('buildEclipseTurns: tool call arguments fall back to progressMessage when no real arguments are present', async () => {
	const session = makeSession([
		{ role: 'user', turnId: 't1', timestamp: '2026-07-01T00:00:00Z', message: { text: 'build it' } },
		{
			role: 'copilot', turnId: 't1', timestamp: '2026-07-01T00:00:01Z',
			reply: {
				editAgentRounds: [
					{
						roundId: 1,
						reply: '',
						toolCalls: [
							{ id: 'call_1', name: 'read_file', progressMessage: 'Read file [Main.java](file:///c%3A/proj/Main.java)', status: 'completed', result: [] },
						],
					},
				],
				modelName: 'GPT-5.3-Codex',
			},
		},
	]);
	const filePath = createTempSession(session);
	try {
		const turns = await eclipse.buildEclipseTurns(filePath);
		assert.equal(turns.length, 1);
		assert.equal(turns[0].toolCalls.length, 1);
		assert.equal(turns[0].toolCalls[0].toolName, 'read_file');
		assert.equal(turns[0].toolCalls[0].arguments, 'Read file [Main.java](file:///c%3A/proj/Main.java)');
		assert.equal(turns[0].toolCalls[0].result, undefined, 'empty result array should not render as a result');
	} finally {
		cleanup(filePath);
	}
});

test('buildEclipseTurns: tool call arguments prefer a real arguments payload over progressMessage', async () => {
	const session = makeSession([
		{ role: 'user', turnId: 't1', timestamp: '2026-07-01T00:00:00Z', message: { text: 'run it' } },
		{
			role: 'copilot', turnId: 't1', timestamp: '2026-07-01T00:00:01Z',
			reply: {
				editAgentRounds: [
					{
						roundId: 1,
						reply: '',
						toolCalls: [
							{ id: 'call_1', name: 'run_in_terminal', arguments: { command: 'javac Main.java' }, progressMessage: 'Ran run_in_terminal tool', status: 'completed', result: [] },
						],
					},
				],
			},
		},
	]);
	const filePath = createTempSession(session);
	try {
		const turns = await eclipse.buildEclipseTurns(filePath);
		assert.equal(turns[0].toolCalls[0].arguments, JSON.stringify({ command: 'javac Main.java' }));
	} finally {
		cleanup(filePath);
	}
});
