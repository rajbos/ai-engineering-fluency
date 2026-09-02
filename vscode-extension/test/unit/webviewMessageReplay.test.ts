import test from 'node:test';
import * as assert from 'node:assert/strict';
import { WebviewMessageReplay, type ReplayableWebviewMessage } from '../../src/webviewMessageReplay';

test('posts immediately even when the webview never announced readiness', async () => {
	// Regression: gating delivery on the readiness handshake turned a lost or late
	// `usageWebviewReady` into a permanent "Loading…" panel, because the payload was never
	// posted at all — not even to a webview that already had its listener attached.
	const delivered: ReplayableWebviewMessage[] = [];
	const replay = new WebviewMessageReplay((message) => {
		delivered.push(message);
		return true;
	});

	const result = await replay.publish('repoPrStats', { command: 'repoPrStatsLoaded', data: { repos: [] } });

	assert.equal(result.delivered, true);
	assert.equal(result.wasReady, false);
	assert.deepEqual(delivered, [{ command: 'repoPrStatsLoaded', data: { repos: [] } }]);
});

test('replays only the latest state per feature when the webview announces readiness', async () => {
	const delivered: string[] = [];
	const replay = new WebviewMessageReplay((message) => {
		delivered.push(message.command);
		return true;
	});

	await replay.publish('repoPrStats', { command: 'repoPrStatsProgress', done: 0, total: 2 });
	await replay.publish('repoPrStats', { command: 'repoPrStatsLoaded', data: { repos: [] } });
	delivered.length = 0;

	const replayed = await replay.markReady();

	assert.deepEqual(replayed, ['repoPrStats']);
	assert.deepEqual(delivered, ['repoPrStatsLoaded']);
});

test('replays results published while a replacement webview is loading', async () => {
	const delivered: string[] = [];
	const replay = new WebviewMessageReplay((message) => {
		delivered.push(message.command);
		return true;
	});

	await replay.markReady();
	await replay.publish('repoPrStats', { command: 'repoPrStatsProgress', done: 1, total: 2 });
	replay.markNotReady();
	await replay.publish('repoPrStats', { command: 'repoPrStatsLoaded', data: { repos: [] } });
	delivered.length = 0;

	await replay.markReady();

	assert.deepEqual(delivered, ['repoPrStatsLoaded']);
});

test('a repeated readiness announcement re-posts the latest state', async () => {
	// The webview announces readiness again once the layout — and therefore the target
	// containers — exists, so state posted into a container-less DOM gets re-applied.
	const delivered: string[] = [];
	const replay = new WebviewMessageReplay((message) => {
		delivered.push(message.command);
		return true;
	});

	await replay.markReady();
	await replay.publish('agentSessions', { command: 'agentSessionsLoaded', data: {} });
	delivered.length = 0;

	await replay.markReady();

	assert.deepEqual(delivered, ['agentSessionsLoaded']);
});

test('a hanging webview delivery is bounded and remains replayable', { timeout: 250 }, async () => {
	let shouldHang = true;
	const delivered: string[] = [];
	const errors: unknown[] = [];
	const replay = new WebviewMessageReplay(
		(message) => {
			if (shouldHang) { return new Promise<boolean>(() => { /* never settles */ }); }
			delivered.push(message.command);
			return true;
		},
		5,
		(error) => errors.push(error),
	);

	await replay.markReady();
	const result = await replay.publish('agentSessions', { command: 'agentSessionsLoaded', data: {} });
	assert.equal(result.delivered, false);
	assert.equal(errors.length, 1);

	shouldHang = false;
	await replay.markReady();
	assert.deepEqual(delivered, ['agentSessionsLoaded']);
});
