/**
 * Tests for the programmatic entry point `@rajbos/ai-engineering-fluency/session`
 * (cli/src/lib/session.ts), run against the TypeScript source bundled by esbuild.tests.js.
 *
 * HOME/USERPROFILE point at a scratch dir before anything resolves the home directory, so the
 * fixtures live at real `~/.claude/projects/...` and `~/.copilot/session-state/...` paths
 * (which is how the adapters recognise them) and the user's own Copilot CLI billing store
 * and OTel export are never read. node --test runs each file in its own process.
 */
import test, { after } from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

import { analyzeSessionFile, analyzeSessionFiles } from '../lib/session';
import modelPricingData from '../../../src/modelPricing.json';

// Not under os.tmpdir(): the shared safe file reader refuses to read session files there.
// cli/out/ is git-ignored build output.
const fakeHome = fs.mkdtempSync(path.join(__dirname, '..', 'lib-home-'));
process.env.HOME = fakeHome;
process.env.USERPROFILE = fakeHome;
after(() => fs.rmSync(fakeHome, { recursive: true, force: true }));

// Compiled test bundles live in cli/out/test/, the fixtures stay in cli/src/test/fixtures/.
const FIXTURES = path.resolve(__dirname, '..', '..', 'src', 'test', 'fixtures');

function placeFixture(fixture: string, ...relative: string[]): string {
	const target = path.join(fakeHome, ...relative);
	fs.mkdirSync(path.dirname(target), { recursive: true });
	fs.copyFileSync(path.join(FIXTURES, fixture), target);
	return target;
}

let counter = 0;
const claudeSession = () => placeFixture('claude-code-session.jsonl',
	'.claude', 'projects', '-work-demo', `11111111-1111-4111-8111-${String(++counter).padStart(12, '0')}.jsonl`);
const copilotCliSession = () => placeFixture('copilot-cli-events.jsonl',
	'.copilot', 'session-state', `22222222-2222-4222-8222-${String(++counter).padStart(12, '0')}`, 'events.jsonl');

type Rates = { inputCostPerMillion: number; outputCostPerMillion: number; cachedInputCostPerMillion: number; cacheCreationCostPerMillion: number };
const pricing = modelPricingData.pricing as unknown as Record<string, Rates>;

/** Provider-rate cost for a model, from the published rates (5-minute cache writes only). */
function providerCost(model: string, t: { input: number; cachedRead: number; cacheCreation: number; output: number }): number {
	const r = pricing[model];
	const uncached = t.input - t.cachedRead - t.cacheCreation;
	return (uncached * r.inputCostPerMillion
		+ t.cachedRead * r.cachedInputCostPerMillion
		+ t.cacheCreation * r.cacheCreationCostPerMillion
		+ t.output * r.outputCostPerMillion) / 1_000_000;
}

test('Claude Code: per-model token totals from usage blocks (replayed message.id counted once)', async () => {
	const usage = await analyzeSessionFile(claudeSession());
	assert.ok(usage, 'expected a result for a Claude Code session');
	assert.match(usage.editorSource, /^Claude (Code|Desktop)/);
	assert.equal(usage.interactions, 2);
	assert.deepEqual(usage.models, ['claude-haiku-4.5', 'claude-sonnet-4.5']);

	const sonnet = usage.modelUsage['claude-sonnet-4.5'];
	// msg_1: 100 + 1000 creation + 5000 read; msg_3: 50 + 6000 read. msg_1's replay is ignored.
	assert.equal(sonnet.inputTokens, 12_150);
	assert.equal(sonnet.outputTokens, 500);
	assert.equal(sonnet.cachedReadTokens, 11_000);
	assert.equal(sonnet.cacheCreationTokens, 1_000);

	const haiku = usage.modelUsage['claude-haiku-4.5'];
	assert.equal(haiku.inputTokens, 400);
	assert.equal(haiku.outputTokens, 80);

	assert.equal(usage.totalTokens, 12_150 + 500 + 400 + 80);
	assert.equal(usage.copilotNanoAiu, 0);
	assert.equal(usage.copilotCredits, null);
	assert.ok(!Number.isNaN(Date.parse(usage.lastModified)));
});

test('Claude Code: provider-rate USD estimate matches the published model rates', async () => {
	const usage = await analyzeSessionFile(claudeSession());
	assert.ok(usage);
	const expected = providerCost('claude-sonnet-4.5', { input: 12_150, cachedRead: 11_000, cacheCreation: 1_000, output: 500 })
		+ providerCost('claude-haiku-4.5', { input: 400, cachedRead: 0, cacheCreation: 0, output: 80 });
	assert.ok(expected > 0);
	assert.ok(Math.abs(usage.estimatedCostUsd.provider - expected) < 1e-12,
		`provider cost ${usage.estimatedCostUsd.provider} != ${expected}`);
	assert.equal(typeof usage.estimatedCostUsd.copilot, 'number');
});

test('Copilot CLI: copilotNanoAiu is the latest usage_checkpoint and credits = nanoAiu / 1e9', async () => {
	const usage = await analyzeSessionFile(copilotCliSession());
	assert.ok(usage, 'expected a result for a Copilot CLI events.jsonl');
	assert.equal(usage.editorSource, 'Copilot CLI');
	assert.equal(usage.interactions, 2);
	assert.equal(usage.copilotNanoAiu, 3_750_000_000);
	assert.equal(usage.copilotCredits, 3.75);
});

test('cache: an unchanged file is not re-parsed; appending to it is', async () => {
	const file = copilotCliSession();
	const first = await analyzeSessionFile(file);
	const second = await analyzeSessionFile(file);
	assert.ok(first);
	// Every parse builds a new object, so identity proves the second call was a cache hit.
	assert.equal(second, first);
	assert.ok(Object.isFrozen(first), 'cached results are frozen so callers cannot corrupt them');

	fs.appendFileSync(file, [
		JSON.stringify({ type: 'user.message', timestamp: '2026-10-01T09:02:00.000Z', data: { content: 'And push' } }),
		JSON.stringify({ type: 'session.usage_checkpoint', timestamp: '2026-10-01T09:02:30.000Z', data: { totalNanoAiu: 5_000_000_000 } }),
	].join('\n') + '\n');

	const third = await analyzeSessionFile(file);
	assert.ok(third);
	assert.notEqual(third, first);
	assert.equal(third.interactions, 3);
	assert.equal(third.copilotNanoAiu, 5_000_000_000);
	assert.equal(await analyzeSessionFile(file), third);
});

test('cache: { cache: false } always re-parses', async () => {
	const file = claudeSession();
	const a = await analyzeSessionFile(file, { cache: false });
	const b = await analyzeSessionFile(file, { cache: false });
	assert.ok(a && b);
	assert.notEqual(a, b);
	assert.deepEqual(a, b);
});

test('concurrent calls on the same file share one parse', async () => {
	const file = claudeSession();
	const [a, b] = await Promise.all([analyzeSessionFile(file), analyzeSessionFile(file)]);
	assert.ok(a);
	assert.equal(a, b);
});

test('bad input resolves to null instead of throwing', async () => {
	assert.equal(await analyzeSessionFile(path.join(fakeHome, 'missing', 'nope.jsonl')), null);
	assert.equal(await analyzeSessionFile(fakeHome), null);
	const empty = path.join(fakeHome, '.copilot', 'session-state', '33333333-3333-4333-8333-333333333333', 'events.jsonl');
	fs.mkdirSync(path.dirname(empty), { recursive: true });
	fs.writeFileSync(empty, '');
	assert.equal(await analyzeSessionFile(empty), null);
});

test('analyzeSessionFiles: maps each parsed path and leaves out the ones that failed', async () => {
	const claude = claudeSession();
	const cli = copilotCliSession();
	const missing = path.join(fakeHome, 'missing.jsonl');
	const results = await analyzeSessionFiles([claude, cli, missing, claude]);
	assert.deepEqual([...results.keys()].sort(), [claude, cli].sort());
	assert.equal(results.get(cli)?.copilotNanoAiu, 3_750_000_000);
	assert.equal(results.get(claude)?.filePath, claude);
});
