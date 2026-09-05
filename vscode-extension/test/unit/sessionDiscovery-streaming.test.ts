import './vscode-shim-register';
import test from 'node:test';
import * as assert from 'node:assert/strict';

import { SessionDiscovery } from '../../../src/sessionDiscovery';
import type { IEcosystemAdapter, DiscoveryResult } from '../../../src/ecosystemAdapter';

/**
 * Regression test for the "slow Cursor discovery blocks everyone else" bug:
 * SessionDiscovery.getCopilotSessionFilesStreaming() must invoke `onBatch` for
 * each adapter's files as soon as *that adapter* resolves, not only after
 * every adapter (including a slow one) has settled. Previously discovery
 * collected all Promise.allSettled results before calling onBatch even once,
 * so a slow adapter (e.g. Cursor's first-run sql.js/WASM init) delayed the
 * streaming worker pool in _preloadSessionFiles from starting on any file,
 * even ones already found by fast adapters.
 */
function makeFakeAdapter(id: string, files: string[], delayMs: number): IEcosystemAdapter {
	return {
		id,
		displayName: id,
		handles: () => false,
		getBackingPath: (f: string) => f,
		stat: async () => ({} as any),
		getTokens: async () => ({ tokens: 0, thinkingTokens: 0, actualTokens: 0 }),
		countInteractions: async () => 0,
		getModelUsage: async () => ({}),
		getMeta: async () => ({ title: undefined, firstInteraction: null, lastInteraction: null }),
		getEditorRoot: (f: string) => f,
		discover: async (): Promise<DiscoveryResult> => {
			await new Promise(resolve => setTimeout(resolve, delayMs));
			return { sessionFiles: files, candidatePaths: [] };
		},
		getCandidatePaths: () => [],
	} as unknown as IEcosystemAdapter;
}

test('SessionDiscovery streams fast adapter batches before a slow adapter resolves', async () => {
	const batchTimestamps: { source: string; atMs: number }[] = [];
	const start = Date.now();

	const fastAdapter = makeFakeAdapter('fast', ['/fake/fast/session1.json'], 5);
	const slowAdapter = makeFakeAdapter('slow-cursor', ['/fake/cursor/session2.json'], 150);

	const discovery = new SessionDiscovery({
		log: () => {},
		warn: () => {},
		error: () => {},
		ecosystems: [fastAdapter, slowAdapter],
	});

	let sawFastBatchBeforeSlowResolved = false;
	const files = await discovery.getCopilotSessionFilesStreaming((batch) => {
		const atMs = Date.now() - start;
		batchTimestamps.push({ source: batch[0], atMs });
		if (batch[0].includes('fast') && atMs < 100) {
			sawFastBatchBeforeSlowResolved = true;
		}
	});

	assert.equal(files.length, 2);
	assert.ok(sawFastBatchBeforeSlowResolved,
		'fast adapter batch should stream in well before the slow adapter\'s 150ms delay elapses');
	// The fast batch must be observed strictly before the slow one.
	const fastEntry = batchTimestamps.find(b => b.source.includes('fast'));
	const slowEntry = batchTimestamps.find(b => b.source.includes('cursor'));
	assert.ok(fastEntry && slowEntry && fastEntry.atMs < slowEntry.atMs,
		'fast adapter batch must arrive before slow adapter batch');
});

test('SessionDiscovery still reports adapter errors without blocking other batches', async () => {
	const fastAdapter = makeFakeAdapter('fast', ['/fake/fast/session1.json'], 5);
	const failingAdapter: IEcosystemAdapter = {
		...makeFakeAdapter('broken', [], 0),
		discover: async () => { throw new Error('boom'); },
	} as IEcosystemAdapter;

	const warnings: string[] = [];
	const discovery = new SessionDiscovery({
		log: () => {},
		warn: (msg: string) => warnings.push(msg),
		error: () => {},
		ecosystems: [fastAdapter, failingAdapter],
	});

	const files = await discovery.getCopilotSessionFilesStreaming();
	assert.deepEqual(files, ['/fake/fast/session1.json']);
	assert.ok(warnings.some(w => w.includes('broken')));
	assert.equal(discovery.lastDiscoveryHadError, true);
});
