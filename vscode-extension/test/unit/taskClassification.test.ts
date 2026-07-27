import test from 'node:test';
import * as assert from 'node:assert/strict';

import taskClassificationDefault, {
	classifySessionTask,
	buildClassificationInputFromUsageAnalysis,
	buildClassificationInputFromChatTurns,
	countDelegationToolCalls,
} from '../../../src/taskClassification';
import type { ChatTurn, ContextReferenceUsage, SessionUsageAnalysis } from '../../../src/types';

function emptyContextRefs(): ContextReferenceUsage {
	return {
		file: 0, selection: 0, implicitSelection: 0, symbol: 0, codebase: 0, workspace: 0,
		terminal: 0, vscode: 0, terminalLastCommand: 0, terminalSelection: 0, clipboard: 0,
		changes: 0, outputPanel: 0, problemsPanel: 0, pullRequest: 0,
		byKind: {}, copilotInstructions: 0, agentsMd: 0, byPath: {},
	};
}

function makeTurn(overrides: Partial<ChatTurn>): ChatTurn {
	return {
		turnNumber: 1,
		timestamp: null,
		mode: 'agent',
		userMessage: '',
		assistantResponse: '',
		model: null,
		toolCalls: [],
		contextReferences: emptyContextRefs(),
		mcpTools: [],
		inputTokensEstimate: 0,
		outputTokensEstimate: 0,
		thinkingTokensEstimate: 0,
		...overrides,
	};
}

// ── classifySessionTask: one example per TaskCategory ─────────────────────────

test('classifySessionTask: Git Ops — terminal git command wins over everything else', () => {
	assert.equal(classifySessionTask({ toolNames: ['run_in_terminal'], terminalCommands: ['git push origin main'] }), 'Git Ops');
});

test('classifySessionTask: Build/Deploy — docker build terminal command', () => {
	assert.equal(classifySessionTask({ toolNames: ['run_in_terminal'], terminalCommands: ['docker build -t app .'] }), 'Build/Deploy');
});

test('classifySessionTask: Testing — test-runner terminal command', () => {
	assert.equal(classifySessionTask({ toolNames: ['run_in_terminal'], terminalCommands: ['npm test'] }), 'Testing');
});

test('classifySessionTask: Testing — dedicated test tool call', () => {
	assert.equal(classifySessionTask({ toolNames: ['run_tests'] }), 'Testing');
});

test('classifySessionTask: Delegation — sub-agent tool call', () => {
	assert.equal(classifySessionTask({ toolNames: ['delegate_task'] }), 'Delegation');
});

test('classifySessionTask: Planning — dedicated planning/todo tool call', () => {
	assert.equal(classifySessionTask({ toolNames: ['todo_write'] }), 'Planning');
});

test('classifySessionTask: Debugging — edit tool + bug/fix keywords', () => {
	assert.equal(classifySessionTask({ toolNames: ['edit_file'], userText: 'fix the bug in the parser' }), 'Debugging');
});

test('classifySessionTask: Refactoring — edit tool + refactor keywords', () => {
	assert.equal(classifySessionTask({ toolNames: ['edit_file'], userText: 'refactor the module to simplify duplicate logic' }), 'Refactoring');
});

test('classifySessionTask: Feature Dev — edit tool + add/implement keywords', () => {
	assert.equal(classifySessionTask({ toolNames: ['create_file'], userText: 'add a new feature to export CSV data' }), 'Feature Dev');
});

test('classifySessionTask: Planning — planning keywords without edit tools', () => {
	assert.equal(classifySessionTask({ toolNames: ['read_file'], userText: 'help me outline a roadmap for next quarter' }), 'Planning');
});

test('classifySessionTask: Exploration — only read/search tool calls', () => {
	assert.equal(classifySessionTask({ toolNames: ['read_file', 'grep_search'] }), 'Exploration');
});

test('classifySessionTask: Coding — edit tool calls, no stronger signal', () => {
	assert.equal(classifySessionTask({ toolNames: ['edit_file'] }), 'Coding');
});

test('classifySessionTask: Brainstorming — no tool calls, brainstorming keywords', () => {
	assert.equal(classifySessionTask({ toolNames: [], userText: 'brainstorm some ideas for the new architecture' }), 'Brainstorming');
});

test('classifySessionTask: Conversation — no tool calls, no keyword match', () => {
	assert.equal(classifySessionTask({ toolNames: [], userText: 'thanks so much, that really helped me understand' }), 'Conversation');
});

// ── buildClassificationInputFromUsageAnalysis ─────────────────────────────────

test('buildClassificationInputFromUsageAnalysis: extracts tool names from byTool keys and passes through title', () => {
	const usageAnalysis = { toolCalls: { total: 2, byTool: { edit_file: 1, read_file: 1 } } } as unknown as Pick<SessionUsageAnalysis, 'toolCalls'>;
	const result = buildClassificationInputFromUsageAnalysis(usageAnalysis, 'Fix a bug in the parser');
	assert.deepEqual([...result.toolNames].sort(), ['edit_file', 'read_file']);
	assert.equal(result.userText, 'Fix a bug in the parser');
	assert.equal(result.terminalCommands, undefined);
});

test('buildClassificationInputFromUsageAnalysis: handles missing usageAnalysis/title gracefully', () => {
	const result = buildClassificationInputFromUsageAnalysis(undefined, undefined);
	assert.deepEqual(result.toolNames, []);
	assert.equal(result.userText, undefined);
});

// ── buildClassificationInputFromChatTurns ─────────────────────────────────────

test('buildClassificationInputFromChatTurns: collects tool names, terminal commands, and joined user text', () => {
	const turns: ChatTurn[] = [
		makeTurn({ userMessage: 'please fix this', toolCalls: [{ toolName: 'edit_file' }] }),
		makeTurn({ userMessage: 'and run the tests', toolCalls: [{ toolName: 'run_in_terminal', arguments: 'npm test' }] }),
	];
	const result = buildClassificationInputFromChatTurns(turns);
	assert.deepEqual(result.toolNames, ['edit_file', 'run_in_terminal']);
	assert.deepEqual(result.terminalCommands, ['npm test']);
	assert.equal(result.userText, 'please fix this and run the tests');
});

test('buildClassificationInputFromChatTurns: empty turns array yields empty input', () => {
	const result = buildClassificationInputFromChatTurns([]);
	assert.deepEqual(result.toolNames, []);
	assert.deepEqual(result.terminalCommands, []);
	assert.equal(result.userText, '');
});

test('default export bundles all three functions', () => {
	assert.equal(taskClassificationDefault.classifySessionTask, classifySessionTask);
	assert.equal(taskClassificationDefault.buildClassificationInputFromUsageAnalysis, buildClassificationInputFromUsageAnalysis);
	assert.equal(taskClassificationDefault.buildClassificationInputFromChatTurns, buildClassificationInputFromChatTurns);
});

// ── countDelegationToolCalls ───────────────────────────────────────────────

test('countDelegationToolCalls: sums counts for subagent/delegate-matching tool names', () => {
	const total = countDelegationToolCalls({ subagent: 3, delegate_task: 2, edit_file: 10 });
	assert.equal(total, 5);
});

test('countDelegationToolCalls: matches sub-agent, agent-spawn, and case-insensitively', () => {
	const total = countDelegationToolCalls({ 'Sub-Agent': 1, agent_spawn: 4, Delegate: 2, run_tests: 7 });
	assert.equal(total, 7);
});

test('countDelegationToolCalls: returns 0 when no tools match', () => {
	assert.equal(countDelegationToolCalls({ edit_file: 5, read_file: 3 }), 0);
});

test('countDelegationToolCalls: returns 0 for empty input', () => {
	assert.equal(countDelegationToolCalls({}), 0);
});
