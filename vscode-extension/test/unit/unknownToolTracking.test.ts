import test from 'node:test';
import * as assert from 'node:assert/strict';
import {
	UNKNOWN_TOOL_RESHOW_THRESHOLD,
	evaluateUnknownToolNotification,
	excludeTrackedTools,
	mergeToolLists,
} from '../../src/unknownToolTracking';

test('mergeToolLists de-duplicates equivalent tool ids canonically', () => {
	const merged = mergeToolLists(['list_agents', 'alpha_tool'], ['ListAgents', ' alpha_tool ', 'beta.tool']);

	assert.deepEqual(merged, ['alpha_tool', 'beta.tool', 'list_agents']);
});

test('excludeTrackedTools skips previously reported canonical variants', () => {
	const actionable = excludeTrackedTools(['ListAgents', 'fresh_tool'], ['list_agents']);

	assert.deepEqual(actionable, ['fresh_tool']);
});

test('evaluateUnknownToolNotification suppresses re-show until enough new tools appear', () => {
	const hidden = evaluateUnknownToolNotification(
		['known_old_tool', 'new_one', 'new_two'],
		['known_old_tool'],
		[],
		UNKNOWN_TOOL_RESHOW_THRESHOLD,
	);
	assert.equal(hidden.shouldShow, false);
	assert.deepEqual(hidden.newTools, ['new_one', 'new_two']);

	const shown = evaluateUnknownToolNotification(
		['known_old_tool', 'new_one', 'new_two', 'new_three'],
		['known_old_tool'],
		[],
		UNKNOWN_TOOL_RESHOW_THRESHOLD,
	);
	assert.equal(shown.shouldShow, true);
	assert.deepEqual(shown.newTools, ['new_one', 'new_three', 'new_two']);
});

test('evaluateUnknownToolNotification ignores tools already reported in issues', () => {
	const decision = evaluateUnknownToolNotification(
		['already_reported', 'needs_report'],
		[],
		['already_reported'],
	);

	assert.deepEqual(decision.actionableTools, ['needs_report']);
	assert.equal(decision.shouldShow, true);
});
