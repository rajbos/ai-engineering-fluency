import test from 'node:test';
import * as assert from 'node:assert/strict';

import { classifyTurn, classifySessionTurns } from '../../../src/taskClassification';

test('classifyTurn: edit tool is Coding', () => {
	assert.equal(classifyTurn({ toolNames: ['edit'] }), 'Coding');
});

test('classifyTurn: debug keywords classify as Debugging', () => {
	assert.equal(classifyTurn({ messageText: 'Please debug this failing test and fix the error' }), 'Debugging');
});

test('classifyTurn: git command in shell classifies as Git Ops', () => {
	assert.equal(classifyTurn({ toolNames: ['bash'], shellCommands: ['git commit -m "x"'] }), 'Git Ops');
});

test('classifySessionTurns: returns weighted shares and primary category', () => {
	const result = classifySessionTurns([
		{ messageText: 'implement new endpoint', toolNames: ['edit'] },
		{ messageText: 'run tests', toolNames: ['bash'], shellCommands: ['npm test'] },
		{ messageText: 'run tests again', toolNames: ['bash'], shellCommands: ['npm test'] },
	]);
	assert.equal(result.primaryCategory, 'Testing');
	assert.equal(result.turnCount, 3);
	assert.equal(result.categoryShares['Testing'], 2 / 3);
	assert.equal(result.categoryShares['Coding'], 1 / 3);
});
