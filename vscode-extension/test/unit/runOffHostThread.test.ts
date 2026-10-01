import test from 'node:test';
import * as assert from 'node:assert/strict';

import { runOffHostThread } from '../../src/analysis/runOffHostThread';
import { AnalysisWorkerError, type AnalysisWorkerPool } from '../../src/analysis/analysisWorkerPool';

/** Just the one method the helper calls on the pool. */
function fakePool(available = true): AnalysisWorkerPool {
	return { isAvailable: () => available } as unknown as AnalysisWorkerPool;
}

function makeContext(pool: AnalysisWorkerPool | undefined, disposed = false) {
	const warnings: string[] = [];
	return { context: { pool, isDisposed: () => disposed, warn: (m: string) => warnings.push(m) }, warnings };
}

const neverInProcess = (): Promise<string> => { throw new Error('must not run in-process'); };

test('uses the worker result when the worker succeeds, without touching the in-process path', async () => {
	const { context } = makeContext(fakePool());
	assert.equal(await runOffHostThread(context, async () => 'from worker', neverInProcess), 'from worker');
});

test('runs in-process when there is no pool at all (worker disabled or bundle missing)', async () => {
	const { context } = makeContext(undefined);
	assert.equal(await runOffHostThread(context, async () => { throw new Error('no pool'); }, async () => 'in-process'), 'in-process');
});

test('runs in-process when the pool reports itself unavailable', async () => {
	const { context } = makeContext(fakePool(false));
	assert.equal(await runOffHostThread(context, async () => { throw new Error('no pool'); }, async () => 'in-process'), 'in-process');
});

test('falls back in-process, and says so, when the worker was unavailable for this request', async () => {
	const { context, warnings } = makeContext(fakePool());
	const result = await runOffHostThread(
		context,
		async () => { throw new AnalysisWorkerError('could not start', 'unavailable'); },
		async () => 'in-process',
	);
	assert.equal(result, 'in-process');
	assert.ok(warnings.some((w) => /could not start/.test(w)), 'the fallback is logged');
});

test('a timeout is rethrown, never retried on the host thread', async () => {
	const { context } = makeContext(fakePool());
	await assert.rejects(
		runOffHostThread(context, async () => { throw new AnalysisWorkerError('hung', 'timeout'); }, neverInProcess),
		(e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'timeout',
	);
});

test('an analysis error is rethrown with its Node error code intact', async () => {
	const { context } = makeContext(fakePool());
	await assert.rejects(
		runOffHostThread(context, async () => { throw new AnalysisWorkerError('Error: ENOENT', 'failed', 'ENOENT'); }, neverInProcess),
		(e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT',
	);
});

test('a non-worker error is rethrown untouched', async () => {
	const { context } = makeContext(fakePool());
	const boom = new TypeError('unrelated');
	await assert.rejects(runOffHostThread(context, async () => { throw boom; }, neverInProcess), (e: unknown) => e === boom);
});

test('does not start an in-process parse once the extension is disposed', async () => {
	const { context } = makeContext(fakePool(), true);
	await assert.rejects(
		runOffHostThread(context, async () => { throw new AnalysisWorkerError('pool disposed', 'unavailable'); }, neverInProcess),
		(e: unknown) => e instanceof AnalysisWorkerError && e.kind === 'unavailable',
	);
});
