import test from 'node:test';
import * as assert from 'node:assert/strict';
import { buildToolFamilyGroups, tokensPerCompletedCall, type ToolFamily } from '../toolFamilies';

const families: ToolFamily[] = [
	{ id: 'reading', name: 'File Reading', builtIn: ['read', 'view'], alternatives: ['lean-ctx'], description: 'Reads files.' },
	{ id: 'empty', name: 'No data', builtIn: ['nothing'], alternatives: [] },
	{ id: 'dupe', name: 'Lists read again', builtIn: ['read'], alternatives: ['other'] },
];

test('tokensPerCompletedCall divides by completed calls and is 0 with none', () => {
	assert.equal(tokensPerCompletedCall(1000, 4), 250);
	assert.equal(tokensPerCompletedCall(1000, 0), 0);
});

test('tokens per call use completedByTool, never byTool', () => {
	const usage = {
		total: 200,
		// byTool over-counts orphaned starts and re-logs; passing it must not change a figure.
		byTool: { read: 200 },
		outputTokensByTool: { read: 100_000 },
		completedByTool: { read: 100 },
	};
	const [group] = buildToolFamilyGroups(usage, families);
	assert.equal(group.rows[0].tokensPerCall, 1000, '100,000 tokens over 100 completed calls, not 200 starts');
	assert.equal(group.rows[0].completed, 100);
});

test('alternatives compare with the pooled average of the family built-ins', () => {
	const [group] = buildToolFamilyGroups({
		outputTokensByTool: { read: 300, view: 100, 'lean-ctx': 50 },
		completedByTool: { read: 1, view: 3, 'lean-ctx': 1 },
	}, families);
	assert.deepEqual(group.rows.map(r => [r.tool, r.isBuiltIn, r.tokensPerCall, r.vsBuiltIn]), [
		['read', true, 300, null],
		['view', true, 100 / 3, null],
		['lean-ctx', false, 50, 0.5],
	], 'the baseline is 400 tokens over 4 calls, not the mean of the two averages');
});

test('without a built-in baseline an alternative has no comparison', () => {
	const [group] = buildToolFamilyGroups({ outputTokensByTool: { 'lean-ctx': 50 }, completedByTool: { 'lean-ctx': 1 } }, families);
	assert.equal(group.rows[0].vsBuiltIn, null);
});

test('families without data are left out, the first family listing a tool wins, and the rest go in a catch-all', () => {
	const groups = buildToolFamilyGroups({
		outputTokensByTool: { read: 10, other: 20, unlisted: 30 },
		completedByTool: { read: 1, other: 1, unlisted: 1 },
	}, families);
	assert.deepEqual(groups.map(g => [g.id, g.rows.map(r => r.tool)]), [
		['reading', ['read']],
		['dupe', ['other']],
		[null, ['unlisted']],
	]);
	assert.equal(groups[2].rows[0].vsBuiltIn, null);
});

test('tools without a completed call or filtered out by the host do not appear', () => {
	const groups = buildToolFamilyGroups({
		outputTokensByTool: { read: 10, view: 20, hidden: 30 },
		completedByTool: { read: 1, hidden: 1 },
	}, families, tool => tool !== 'hidden');
	assert.deepEqual(groups.flatMap(g => g.rows.map(r => r.tool)), ['read']);
	assert.deepEqual(buildToolFamilyGroups({}, families), []);
});
