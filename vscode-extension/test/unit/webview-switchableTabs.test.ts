import test from 'node:test';
import * as assert from 'node:assert/strict';
import { SWITCHABLE_TABS, nextActiveTab } from '../../src/webview/usage/switchableTabs';

// handleSwitchTab persists the requested tab in module state (not just the DOM) so a switchTab
// message arriving while the webview is still in its loading state — e.g. the worktree
// notification's "Show Me" action — survives until the eventual renderLayout. The guard keeps
// a bogus tab name from blanking the dashboard by leaving every panel hidden.

test('nextActiveTab: switches to a known tab', () => {
	assert.equal(nextActiveTab('worktrees', 'activity'), 'worktrees');
	assert.equal(nextActiveTab('sessions', 'activity'), 'sessions');
});

test('SWITCHABLE_TABS: covers every tab rendered in the tab bar', () => {
	for (const tab of ['activity', 'sessions', 'tools', 'health', 'repos', 'agent', 'worktrees', 'insights', 'corrections']) {
		assert.ok(SWITCHABLE_TABS.has(tab), `missing ${tab}`);
	}
});

test('nextActiveTab: keeps the current tab for an unknown tab name', () => {
	assert.equal(nextActiveTab('nonsense', 'sessions'), 'sessions');
});

test('nextActiveTab: coerces non-string input before guarding', () => {
	assert.equal(nextActiveTab(undefined, 'activity'), 'activity');
	assert.equal(nextActiveTab(null, 'activity'), 'activity');
	assert.equal(nextActiveTab(42, 'tools'), 'tools');
});
