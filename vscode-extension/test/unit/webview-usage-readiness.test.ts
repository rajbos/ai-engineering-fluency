import test from 'node:test';
import * as assert from 'node:assert/strict';
import { createUsageWebviewReadyNotifier, restoreGitHubActivityPanels, type UsageWebviewReadyMessage } from '../../src/webview/usage/readiness';

test('readiness is announced again once the GitHub activity containers exist', () => {
	// The first announcement necessarily happens before bootstrap() has rendered anything, so a
	// replay triggered by it lands in a DOM with no `#repos-pr-content`. The second announcement
	// (after renderLayout) is what makes the buffered state actually reach the panel.
	const messages: UsageWebviewReadyMessage[] = [];
	let containersExist = false;
	const notifyReady = createUsageWebviewReadyNotifier((message) => messages.push(message), () => containersExist);

	notifyReady('listener-registered');
	containersExist = true;
	notifyReady('layout-rendered');

	assert.deepEqual(messages, [
		{ command: 'usageWebviewReady', reason: 'listener-registered', hasGitHubActivityContainers: false },
		{ command: 'usageWebviewReady', reason: 'layout-rendered', hasGitHubActivityContainers: true },
	]);
});

test('every layout render re-announces readiness, so a rebuilt DOM is repopulated', () => {
	const reasons: string[] = [];
	const notifyReady = createUsageWebviewReadyNotifier((message) => reasons.push(message.reason), () => true);

	notifyReady('listener-registered');
	notifyReady('layout-rendered');
	notifyReady('layout-rendered');

	assert.deepEqual(reasons, ['listener-registered', 'layout-rendered', 'layout-rendered']);
});

test('GitHub activity received before a render is reapplied after the panels render', () => {
	const rendered: string[] = [];
	restoreGitHubActivityPanels(
		{ repos: 2 },
		{ sessions: 10 },
		(data) => rendered.push(`repos:${data.repos}`),
		(data) => rendered.push(`sessions:${data.sessions}`),
	);

	assert.deepEqual(rendered, ['repos:2', 'sessions:10']);
});

test('nothing is reapplied when no GitHub activity state has arrived yet', () => {
	const rendered: string[] = [];
	restoreGitHubActivityPanels(null, null, () => rendered.push('repos'), () => rendered.push('sessions'));

	assert.deepEqual(rendered, []);
});
