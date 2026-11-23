import test from 'node:test';
import assert from 'node:assert/strict';
import { buildOpenCodeFamilyTurns } from '../adapters/openCodeFamilyTurns';
import { KiloAdapter } from '../adapters/kiloAdapter';
import { OpenCodeAdapter } from '../adapters/openCodeAdapter';
import { KiloDataAccess } from '../kilo';
import { OpenCodeDataAccess } from '../opencode';

// One session: two user prompts; the first has two assistant replies (text + tool),
// the second one reply. tokens.total is cumulative across the session.
const messages = [
	{ id: 'u1', role: 'user', time: { created: Date.UTC(2026, 0, 1) } },
	{ id: 'a1', role: 'assistant', parentID: 'u1', modelID: 'model-a', tokens: { total: 100, output: 20, reasoning: 5 } },
	{ id: 'a2', role: 'assistant', parentID: 'u1', model: { modelID: 'model-b' }, tokens: { total: 160, output: 10, reasoning: 0 } },
	{ id: 'u2', role: 'user' },
	{ id: 'a3', role: 'assistant', parentID: 'u2', modelID: 'model-b', tokens: { total: 250, output: 30, reasoning: 10 } },
];
const parts: Record<string, any[]> = {
	u1: [{ type: 'text', text: 'hello' }, { type: 'text', text: 'world' }, { type: 'file' }],
	a1: [{ type: 'text', text: 'Hi. ' }, { type: 'tool', tool: 'read', state: { input: { path: 'a.ts' }, output: 'contents' } }],
	a2: [{ type: 'text', text: 'Done.' }, { type: 'tool', tool: 'bash', state: {} }],
	u2: [{ type: 'text', text: 'again' }],
	a3: [{ type: 'reasoning', text: 'hidden' }, { type: 'text', text: 'Sure.' }],
};
const getParts = async (id: string) => parts[id] ?? [];

function assertExpectedTurns(turns: Awaited<ReturnType<typeof buildOpenCodeFamilyTurns>>): void {
	assert.equal(turns.length, 2);
	const [t1, t2] = turns;
	assert.equal(t1.turnNumber, 1);
	assert.equal(t1.timestamp, '2026-01-01T00:00:00.000Z');
	assert.equal(t1.mode, 'cli');
	assert.equal(t1.userMessage, 'hello\nworld');
	assert.equal(t1.assistantResponse, 'Hi. Done.');
	assert.equal(t1.model, 'model-a');
	assert.deepEqual(t1.toolCalls, [
		{ toolName: 'read', arguments: '{"path":"a.ts"}', result: 'contents' },
		{ toolName: 'bash', arguments: undefined, result: undefined },
	]);
	// Turn 1: cumulative 0 -> 160, output+reasoning 35 -> input 125, output 30, thinking 5.
	assert.equal(t1.inputTokensEstimate, 125);
	assert.equal(t1.outputTokensEstimate, 30);
	assert.equal(t1.thinkingTokensEstimate, 5);
	assert.equal(t2.turnNumber, 2);
	assert.equal(t2.timestamp, null);
	assert.equal(t2.assistantResponse, 'Sure.');
	assert.equal(t2.model, 'model-b');
	// Turn 2: cumulative 160 -> 250, output+reasoning 40 -> input 50, output 30, thinking 10.
	assert.equal(t2.inputTokensEstimate, 50);
	assert.equal(t2.outputTokensEstimate, 30);
	assert.equal(t2.thinkingTokensEstimate, 10);
}

test('buildOpenCodeFamilyTurns: builds turns with text, tools and per-turn token deltas', async () => {
	assertExpectedTurns(await buildOpenCodeFamilyTurns(messages, getParts));
});

test('buildOpenCodeFamilyTurns: falls back to model.modelID and never lets input go negative', async () => {
	const turns = await buildOpenCodeFamilyTurns([
		{ id: 'u', role: 'user' },
		{ id: 'a', role: 'assistant', parentID: 'u', model: { modelID: 'nested' }, tokens: { output: 50 } },
	], async () => []);
	assert.equal(turns[0].model, 'nested');
	assert.equal(turns[0].inputTokensEstimate, 0);
	assert.equal(turns[0].outputTokensEstimate, 50);
});

test('buildOpenCodeFamilyTurns: no user messages gives no turns', async () => {
	assert.deepEqual(await buildOpenCodeFamilyTurns([{ id: 'a', role: 'assistant' }], getParts), []);
});

function kiloStub(): KiloDataAccess {
	const kilo = new KiloDataAccess(null as any);
	kilo.getKiloMessagesForSession = async () => messages;
	kilo.getKiloPartsForMessage = getParts;
	return kilo;
}

function openCodeStub(): OpenCodeDataAccess {
	const openCode = new OpenCodeDataAccess(null as any);
	openCode.getOpenCodeMessagesForSession = async () => messages;
	openCode.getOpenCodePartsForMessage = getParts;
	return openCode;
}

test('KiloAdapter.buildTurns: builds turns through the shared helper', async () => {
	assertExpectedTurns((await new KiloAdapter(kiloStub()).buildTurns('kilo.db#ses_1')).turns);
});

test('OpenCodeAdapter.buildTurns: builds turns through the shared helper', async () => {
	assertExpectedTurns((await new OpenCodeAdapter(openCodeStub()).buildTurns('opencode.db#ses_1')).turns);
});

const ctx = { modelPricing: {}, toolNameMap: {} };

test('KiloAdapter.analyzeUsage: fills model switching from assistant messages', async () => {
	const analysis = await new KiloAdapter(kiloStub()).analyzeUsage('kilo.db#ses_1', ctx);
	// a2 has no top-level modelID, so it is counted as "unknown".
	assert.deepEqual(analysis.modelSwitching.uniqueModels, ['model-a', 'unknown', 'model-b']);
	assert.equal(analysis.modelSwitching.totalRequests, 3);
	assert.equal(analysis.modelSwitching.switchCount, 2);
	assert.equal(analysis.modeUsage.cli, 2);
	assert.deepEqual(analysis.toolCalls.byTool, { read: 1, bash: 1 });
});

test('OpenCodeAdapter.analyzeUsage: fills model switching from assistant messages', async () => {
	const analysis = await new OpenCodeAdapter(openCodeStub()).analyzeUsage('opencode.db#ses_1', ctx);
	assert.deepEqual(analysis.modelSwitching.uniqueModels, ['model-a', 'unknown', 'model-b']);
	assert.equal(analysis.modelSwitching.totalRequests, 3);
	assert.equal(analysis.modelSwitching.switchCount, 2);
});

test('OpenCodeAdapter.analyzeUsage: leaves model switching empty when there are no assistant messages', async () => {
	const openCode = openCodeStub();
	openCode.getOpenCodeMessagesForSession = async () => [{ id: 'u', role: 'user' }];
	const analysis = await new OpenCodeAdapter(openCode).analyzeUsage('opencode.db#ses_1', ctx);
	assert.equal(analysis.modelSwitching.totalRequests, 0);
	assert.equal(analysis.modelSwitching.modelCount, 0);
});
