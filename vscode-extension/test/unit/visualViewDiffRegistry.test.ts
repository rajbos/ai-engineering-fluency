import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

// The view registry helpers are plain CommonJS developer tooling under the
// visual-view-diff skill, outside the extension's TypeScript program, so they
// are loaded by path. Ids from this registry become file names and temp paths,
// and the merged registry decides what the baseline side of a diff renders,
// which is why both are pinned down here.
const requireFromHere = createRequire(__filename);

function findRepoRoot(): string {
	let dir = __dirname;
	for (let i = 0; i < 10; i++) {
		if (fs.existsSync(path.join(dir, '.github', 'skills', 'visual-view-diff', 'lib', 'config.js'))) {
			return dir;
		}
		dir = path.dirname(dir);
	}
	throw new Error(`Could not locate the repo root from ${__dirname}`);
}

const REPO_ROOT = findRepoRoot();
const SKILL_DIR = path.join(REPO_ROOT, '.github', 'skills', 'visual-view-diff');

type State = { id: string; title?: string; steps?: unknown[]; expect?: string; baseOnly?: boolean };
type View = { id: string; title?: string; bundle?: string; global?: string; fixture?: string; states?: State[]; baseOnly?: boolean; fixtureDir?: string };
type Registry = { defaults?: Record<string, unknown>; views: View[] };

const config = requireFromHere(path.join(SKILL_DIR, 'lib', 'config.js')) as {
	readConfig: (skillDir: string, configPath?: string) => Registry;
	validateRegistry: (registry: Registry) => Registry;
	mergeRegistries: (current: Registry, base: Registry, baseFixtureDir: string) => Registry;
	ID_PATTERN: RegExp;
};

function registry(views: View[]): Registry {
	return { defaults: { viewport: { width: 1280, height: 900 }, fullPage: true, settleMs: 100 }, views };
}

test('the committed registry validates', () => {
	const committed = config.readConfig(SKILL_DIR);
	assert.ok(committed.views.length > 0);
	assert.ok(committed.views.some((v) => (v.states || []).length > 0), 'at least one view declares states');
});

test('validateRegistry refuses ids that could escape or collide as file names', () => {
	for (const bad of ['../etc', 'a/b', 'a.b', 'a--b', '', 'a b', 'a\\b']) {
		assert.throws(() => config.validateRegistry(registry([{ id: bad }])), new RegExp('view id'), `view id ${JSON.stringify(bad)}`);
		assert.throws(() => config.validateRegistry(registry([{ id: 'ok', states: [{ id: bad }] }])), new RegExp('state id'), `state id ${JSON.stringify(bad)}`);
	}
	assert.throws(() => config.validateRegistry(registry([{ id: 'dup' }, { id: 'dup' }])), /duplicate view id/);
	assert.throws(() => config.validateRegistry(registry([{ id: 'v', states: [{ id: 's' }, { id: 's' }] }])), /duplicate state id/);
	assert.doesNotThrow(() => config.validateRegistry(registry([{ id: 'fluency-level-viewer', states: [{ id: 'path-analyzer' }, { id: 'tab_2' }] }])));
});

test('mergeRegistries carries base-only views and states so the diff can report them as removed', () => {
	const current = registry([
		{ id: 'usage', fixture: 'usage.json', states: [{ id: 'tools' }] },
		{ id: 'details', fixture: 'details.json' },
	]);
	const base = registry([
		{ id: 'usage', fixture: 'usage.json', states: [{ id: 'tools' }, { id: 'legacy-tab' }] },
		{ id: 'details', fixture: 'details.json' },
		{ id: 'retired', fixture: 'retired.json' },
	]);
	const merged = config.mergeRegistries(current, base, '/base/fixtures');

	assert.deepEqual(merged.views.map((v) => v.id), ['usage', 'details', 'retired']);
	const retired = merged.views.find((v) => v.id === 'retired');
	assert.equal(retired?.baseOnly, true);
	assert.equal(retired?.fixtureDir, '/base/fixtures', 'a retired view keeps the base commit\'s fixture directory');
	const usageStates = merged.views.find((v) => v.id === 'usage')?.states || [];
	assert.deepEqual(usageStates.map((s) => s.id), ['tools', 'legacy-tab']);
	assert.equal(usageStates[1].baseOnly, true);
	assert.equal(usageStates[0].baseOnly, undefined, 'a state both sides declare is not marked base-only');

	// The inputs are not mutated: the current registry still renders only its own targets.
	assert.equal(current.views.length, 2);
	assert.deepEqual(current.views[0].states?.map((s) => s.id), ['tools']);
});

test('mergeRegistries ignores base entries with unsafe ids instead of importing them', () => {
	const current = registry([{ id: 'usage', fixture: 'usage.json' }]);
	const base = registry([{ id: '../escape', fixture: 'x.json' }, { id: 'usage', states: [{ id: 'a/b' }] }]);
	const merged = config.mergeRegistries(current, base, '/base/fixtures');
	assert.deepEqual(merged.views.map((v) => v.id), ['usage']);
	assert.deepEqual(merged.views[0].states || [], []);
});
