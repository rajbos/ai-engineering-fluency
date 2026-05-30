/**
 * Unit tests for Windsurf (Cascade) token / user-turn extraction
 * (src/windsurf.ts).
 *
 * Token usage lives on CORTEX_STEP_TYPE_PLANNER_RESPONSE steps as string-encoded
 * integers (cumulativeTokensAtStep / inputTokens / cacheReadTokens). User turns are
 * the count of CORTEX_STEP_TYPE_USER_INPUT steps. These tests pin that behaviour.
 */
import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as vscode from 'vscode';

import { WindsurfDataAccess } from '../../src/windsurf';

const windsurf = new WindsurfDataAccess(vscode.Uri.file('/mock/ext') as any);

const plannerStep = (meta: Record<string, string>) => ({
	type: 'CORTEX_STEP_TYPE_PLANNER_RESPONSE',
	metadata: meta,
});
const userStep = () => ({ type: 'CORTEX_STEP_TYPE_USER_INPUT', metadata: {} });
const otherStep = (type: string) => ({ type, metadata: {} });

// ----- extractTokenUsage -----

test('extractTokenUsage: totalTokens is the max cumulativeTokensAtStep across planner steps', () => {
	const steps = [
		userStep(),
		plannerStep({ cumulativeTokensAtStep: '4200', inputTokens: '4000', cacheReadTokens: '100' }),
		otherStep('CORTEX_STEP_TYPE_TOOL_CALL'),
		plannerStep({ cumulativeTokensAtStep: '10417', inputTokens: '8717', cacheReadTokens: '1152' }),
	] as any;

	const usage = windsurf.extractTokenUsage(steps);
	assert.equal(usage.totalTokens, 10417);
	assert.equal(usage.inputTokens, 4000 + 8717);
	assert.equal(usage.cachedTokens, 100 + 1152);
});

test('extractTokenUsage: ignores non-planner steps entirely', () => {
	const steps = [
		userStep(),
		otherStep('CORTEX_STEP_TYPE_RETRIEVE_MEMORY'),
		otherStep('CORTEX_STEP_TYPE_USER_INPUT'),
	] as any;

	const usage = windsurf.extractTokenUsage(steps);
	assert.deepEqual(usage, { totalTokens: 0, inputTokens: 0, cachedTokens: 0 });
});

test('extractTokenUsage: tolerates planner steps missing some token fields', () => {
	const steps = [
		plannerStep({ cumulativeTokensAtStep: '11027' }), // no inputTokens / cacheReadTokens
		plannerStep({ inputTokens: '500' }), // no cumulativeTokensAtStep
	] as any;

	const usage = windsurf.extractTokenUsage(steps);
	assert.equal(usage.totalTokens, 11027);
	assert.equal(usage.inputTokens, 500);
	assert.equal(usage.cachedTokens, 0);
});

test('extractTokenUsage: rejects malformed / non-integer strings instead of partial-parsing', () => {
	const steps = [
		plannerStep({ cumulativeTokensAtStep: '123abc', inputTokens: '1.2e4', cacheReadTokens: '-50' }),
		plannerStep({ cumulativeTokensAtStep: '9000' }),
	] as any;

	const usage = windsurf.extractTokenUsage(steps);
	// '123abc', '1.2e4' and '-50' are all rejected (no silent parseInt truncation / negatives)
	assert.equal(usage.totalTokens, 9000);
	assert.equal(usage.inputTokens, 0);
	assert.equal(usage.cachedTokens, 0);
});

test('extractTokenUsage: handles missing metadata and empty input', () => {
	assert.deepEqual(windsurf.extractTokenUsage([]), { totalTokens: 0, inputTokens: 0, cachedTokens: 0 });
	const steps = [{ type: 'CORTEX_STEP_TYPE_PLANNER_RESPONSE' }] as any;
	assert.deepEqual(windsurf.extractTokenUsage(steps), { totalTokens: 0, inputTokens: 0, cachedTokens: 0 });
});

// ----- countUserTurns -----

test('countUserTurns: counts only CORTEX_STEP_TYPE_USER_INPUT steps', () => {
	const steps = [
		userStep(),
		plannerStep({ cumulativeTokensAtStep: '100' }),
		otherStep('CORTEX_STEP_TYPE_TOOL_CALL'),
		userStep(),
		userStep(),
	] as any;

	assert.equal(windsurf.countUserTurns(steps), 3);
});

test('countUserTurns: returns 0 when there are no user-input steps', () => {
	const steps = [plannerStep({ cumulativeTokensAtStep: '100' }), otherStep('CORTEX_STEP_TYPE_TOOL_CALL')] as any;
	assert.equal(windsurf.countUserTurns(steps), 0);
	assert.equal(windsurf.countUserTurns([]), 0);
});

// ----- getAllTrajectorySteps (step_offset pagination) -----

/**
 * Test double that serves canned step pages keyed by offset, recording the offsets
 * requested. Lets us exercise the pagination loop without a live Windsurf API.
 */
class PagingWindsurf extends WindsurfDataAccess {
	requestedOffsets: number[] = [];
	constructor(private pages: Array<Array<{ type: string }>>, private ignoreOffset = false) {
		super(vscode.Uri.file('/mock/ext') as any);
	}
	async getCascadeTrajectorySteps(_cascadeId: string, stepOffset = 0): Promise<any> {
		this.requestedOffsets.push(stepOffset);
		if (this.ignoreOffset) {
			// Simulate a server that ignores step_offset and always returns page 0.
			return { steps: this.pages[0] };
		}
		// Find the page whose starting index matches the requested offset.
		let acc = 0;
		for (const page of this.pages) {
			if (acc === stepOffset) { return { steps: page }; }
			acc += page.length;
		}
		return { steps: [] };
	}
}

test('getAllTrajectorySteps: accumulates all pages via increasing step_offset', async () => {
	const pages = [
		[{ type: 'A' }, { type: 'B' }, { type: 'C' }],
		[{ type: 'D' }, { type: 'E' }],
		[{ type: 'F' }],
	];
	const wd = new PagingWindsurf(pages);
	const all = await wd.getAllTrajectorySteps('cid', 6);
	assert.equal(all.length, 6);
	assert.deepEqual(all.map((s) => (s as any).type), ['A', 'B', 'C', 'D', 'E', 'F']);
	assert.deepEqual(wd.requestedOffsets, [0, 3, 5]);
});

test('getAllTrajectorySteps: stops once expectedCount is reached', async () => {
	const pages = [
		[{ type: 'A' }, { type: 'B' }],
		[{ type: 'C' }, { type: 'D' }],
	];
	const wd = new PagingWindsurf(pages);
	const all = await wd.getAllTrajectorySteps('cid', 2);
	assert.equal(all.length, 2); // does not fetch the second page
	assert.deepEqual(wd.requestedOffsets, [0]);
});

test('getAllTrajectorySteps: guards against a server that ignores step_offset (no duplicate accumulation)', async () => {
	const pages = [[{ type: 'A' }, { type: 'B' }]];
	const wd = new PagingWindsurf(pages, /* ignoreOffset */ true);
	const all = await wd.getAllTrajectorySteps('cid', 10);
	// Without the guard this would loop to maxPages accumulating duplicates; the
	// repeated-first-step guard stops after the second identical page.
	assert.equal(all.length, 2);
	assert.deepEqual(all.map((s) => (s as any).type), ['A', 'B']);
});

test('getAllTrajectorySteps: returns empty when the first page is empty', async () => {
	const wd = new PagingWindsurf([[]]);
	const all = await wd.getAllTrajectorySteps('cid', 0);
	assert.equal(all.length, 0);
});

