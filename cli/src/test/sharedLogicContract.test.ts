/**
 * Contract test for the shared-logic split between token counting and model/cost
 * attribution — see ".github/copilot-instructions.md" § "CLI Must Reuse Shared
 * Extension Functions".
 *
 * The canonical split (mirrors getSessionFileDataCached in the VS Code extension):
 *   - Token counts       → estimateTokensFromJsonlSession()  (vscode-extension/src/tokenEstimation.ts)
 *   - Model attribution  → getModelUsageFromSession()        (vscode-extension/src/usageAnalysis.ts)
 *
 * WHY the contract exists: estimateTokensFromJsonlSession().modelUsage returns {}
 * for delta-format sessions (VS Code Chat JSONL, the `kind: 0/1/2` format). If the
 * CLI ever sourced model attribution from it, every VS Code Chat session would
 * silently report $0 cost. These tests pin both halves of that behaviour and then
 * verify the CLI's own analysis path (processSessionFile) produces non-empty model
 * attribution for a delta-format fixture — proving it goes through
 * getModelUsageFromSession() rather than the estimator's modelUsage.
 */

import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as path from 'path';

import { estimateTokensFromJsonlSession } from '../../../vscode-extension/src/tokenEstimation';
import { getModelUsageFromSession } from '../../../vscode-extension/src/usageAnalysis';
import tokenEstimatorsData from '../../../vscode-extension/src/tokenEstimators.json';
import modelPricingData from '../../../vscode-extension/src/modelPricing.json';

import { processSessionFile } from '../helpers';
import { disableCache } from '../cliCache';

const tokenEstimators: { [key: string]: number } = tokenEstimatorsData.estimators;
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- matches the cast used in cli/src/helpers.ts
const modelPricing = modelPricingData.pricing as { [key: string]: any };

// Compiled test bundles live in cli/out/test/, the fixture stays in cli/src/test/fixtures/.
const FIXTURE_PATH = path.resolve(__dirname, '..', '..', 'src', 'test', 'fixtures', 'vscode-delta-session.jsonl');

function readFixture(): string {
	return fs.readFileSync(FIXTURE_PATH, 'utf-8');
}

test('fixture is a delta-format VS Code Chat JSONL session', () => {
	const content = readFixture();
	const firstLine = JSON.parse(content.trim().split('\n')[0]);
	// Delta-format sessions always start with a kind:0 initial-state event.
	assert.equal(firstLine.kind, 0, 'fixture must start with a kind:0 event to exercise the delta-format code path');
});

test('estimateTokensFromJsonlSession returns empty modelUsage for delta-format sessions', () => {
	const content = readFixture();
	const result = estimateTokensFromJsonlSession(content);

	// This is the reason the contract exists: the token estimator intentionally does
	// NOT produce model attribution for delta-format (VS Code Chat) sessions.
	assert.deepEqual(result.modelUsage, {}, 'estimateTokensFromJsonlSession().modelUsage must be empty for delta-format sessions — it must never be used as the attribution source');

	// It still produces token counts — that is its job in the split.
	const effectiveTokens = result.actualTokens > 0 ? result.actualTokens : result.tokens;
	assert.ok(effectiveTokens > 0, 'estimateTokensFromJsonlSession should still report token counts for the same session');
});

test('getModelUsageFromSession returns model attribution for the same delta-format session', async () => {
	const content = readFixture();
	const usage = await getModelUsageFromSession(
		{ warn: () => { /* quiet */ }, tokenEstimators, modelPricing, ecosystems: [] },
		FIXTURE_PATH,
		content
	);

	assert.ok(Object.keys(usage).length > 0, 'getModelUsageFromSession must return non-empty attribution for delta-format sessions');
	// modelId "copilot/<model>" is normalized by stripping the "copilot/" prefix.
	assert.ok(usage['gpt-4o'], 'expected gpt-4o attribution from request_fixture-0001');
	assert.equal(usage['gpt-4o'].inputTokens, 120);
	assert.equal(usage['gpt-4o'].outputTokens, 30);
	assert.ok(usage['claude-sonnet-4.5'], 'expected claude-sonnet-4.5 attribution from request_fixture-0002');
	assert.equal(usage['claude-sonnet-4.5'].inputTokens, 80);
	assert.equal(usage['claude-sonnet-4.5'].outputTokens, 25);
});

test('CLI processSessionFile reports model attribution for delta-format sessions', async () => {
	// Bypass the on-disk CLI cache so we exercise the real parsing path.
	disableCache();

	const data = await processSessionFile(FIXTURE_PATH);
	assert.ok(data, 'processSessionFile should parse the fixture');

	// The load-bearing assertion: non-empty model attribution proves the CLI routes
	// attribution through getModelUsageFromSession(). If someone "simplifies" the CLI
	// to use estimateTokensFromJsonlSession().modelUsage instead, this comes back {}
	// and the test fails.
	assert.ok(
		Object.keys(data!.modelUsage).length > 0,
		'CLI produced empty modelUsage for a delta-format session — it must derive attribution from getModelUsageFromSession(), not estimateTokensFromJsonlSession().modelUsage'
	);
	assert.equal(data!.modelUsage['gpt-4o']?.inputTokens, 120);
	assert.equal(data!.modelUsage['gpt-4o']?.outputTokens, 30);
	assert.equal(data!.modelUsage['claude-sonnet-4.5']?.inputTokens, 80);
	assert.equal(data!.modelUsage['claude-sonnet-4.5']?.outputTokens, 25);
	assert.ok(data!.tokens > 0, 'token counts should come from estimateTokensFromJsonlSession');
});
