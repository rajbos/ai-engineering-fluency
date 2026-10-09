import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

import {
	groupWorkspaces,
	detectArtefactWorkspaceNames,
	classifyArtefactName,
	matchWorktreeConvention,
	repositoryIdentity,
	workspaceBasename,
	mergeGroupCustomizationFiles,
	type WorkspaceUsageEntry,
	type WorkspaceGroupingProbes,
	type WorkspaceGitInfo,
	type WorkspaceGroup,
} from '../../../src/workspaceGrouping';
import { readWorkspaceGitInfo, createNodeWorkspaceGroupingProbes } from '../../../src/workspaceGroupingProbes';

// ── Helpers ──────────────────────────────────────────────────────────────────

function entry(p: string, sessionCount = 1, interactionCount = 1, repository?: string): WorkspaceUsageEntry {
	return { path: p, sessionCount, interactionCount, ...(repository ? { repository } : {}) };
}

/** Offline probes: `existing` paths exist; `git` maps a folder to its git facts. */
function probes(platform: string, existing: string[] = [], git: Record<string, WorkspaceGitInfo> = {}): WorkspaceGroupingProbes {
	const exists = new Set(existing);
	return {
		platform,
		pathExists: p => exists.has(p),
		readGitInfo: p => git[p],
	};
}

/** A compact, order-independent view of the groups for deepEqual. */
function summarize(groups: WorkspaceGroup[]): Array<{ name: string; canonical: string; members: string[]; sessions: number; interactions: number }> {
	return groups
		.map(g => ({ name: g.displayName, canonical: g.canonicalPath, members: g.memberPaths, sessions: g.sessionCount, interactions: g.interactionCount }))
		.sort((a, b) => a.canonical.localeCompare(b.canonical));
}

// ── Corpus: one row per known naming pattern ─────────────────────────────────
//
// To teach the grouping a new pattern: add a row here with anonymised paths, watch it fail
// (usually the hygiene invariant below names the leftover), then fix src/workspaceGrouping.ts.

interface CorpusRow {
	name: string;
	platform: string;
	entries: WorkspaceUsageEntry[];
	existing?: string[];
	git?: Record<string, WorkspaceGitInfo>;
	/** Expected groups: display name → canonical path and member paths. */
	expected: Array<{ name: string; canonical: string; members: string[] }>;
}

const CORPUS: CorpusRow[] = [
	{
		name: 'Claude desktop worktrees (~/.claude/worktrees/<repo>/<name>) fold into the main checkout',
		platform: 'win32',
		entries: [
			entry('C:\\Users\\dev\\code\\acme-app', 3, 30),
			entry('C:\\Users\\dev\\.claude\\worktrees\\acme-app\\goofy-wozniak-42f712', 2, 20),
			entry('C:\\Users\\dev\\.claude\\worktrees\\acme-app\\friendly-ritchie-c20e1c', 1, 10),
		],
		expected: [{
			name: 'acme-app', canonical: 'C:\\Users\\dev\\code\\acme-app', members: [
				'C:\\Users\\dev\\.claude\\worktrees\\acme-app\\friendly-ritchie-c20e1c',
				'C:\\Users\\dev\\.claude\\worktrees\\acme-app\\goofy-wozniak-42f712',
				'C:\\Users\\dev\\code\\acme-app',
			],
		}],
	},
	{
		name: 'Claude desktop worktrees without the main checkout still group under the repo name',
		platform: 'win32',
		entries: [
			entry('C:\\Users\\dev\\.claude\\worktrees\\acme-app\\goofy-wozniak-42f712', 1, 5),
			entry('C:\\Users\\dev\\.claude\\worktrees\\acme-app\\brave-curie-0a1b2c', 1, 9),
		],
		expected: [{
			name: 'acme-app', canonical: 'C:\\Users\\dev\\.claude\\worktrees\\acme-app\\brave-curie-0a1b2c', members: [
				'C:\\Users\\dev\\.claude\\worktrees\\acme-app\\brave-curie-0a1b2c',
				'C:\\Users\\dev\\.claude\\worktrees\\acme-app\\goofy-wozniak-42f712',
			],
		}],
	},
	{
		name: 'Claude Code CLI worktree inside the repo (<repo>/.claude/worktrees/<name>)',
		platform: 'linux',
		entries: [
			entry('/home/dev/src/widget', 2, 4),
			entry('/home/dev/src/widget/.claude/worktrees/agent-a1b2c3', 1, 3),
		],
		expected: [{ name: 'widget', canonical: '/home/dev/src/widget', members: ['/home/dev/src/widget', '/home/dev/src/widget/.claude/worktrees/agent-a1b2c3'] }],
	},
	{
		name: 'Copilot app worktrees (copilot-worktrees/<repo>/<name>) fold into ~/.copilot/repos/<repo>',
		platform: 'win32',
		entries: [entry('C:\\Users\\dev\\.copilot\\copilot-worktrees\\acme-api\\copilot-fix-123', 2, 8)],
		existing: ['C:\\Users\\dev\\.copilot\\repos\\acme-api'],
		expected: [{ name: 'acme-api', canonical: 'C:\\Users\\dev\\.copilot\\repos\\acme-api', members: ['C:\\Users\\dev\\.copilot\\copilot-worktrees\\acme-api\\copilot-fix-123'] }],
	},
	{
		name: 'Copilot app worktree whose repos checkout is gone stays named after the repo',
		platform: 'darwin',
		entries: [entry('/Users/dev/.copilot/copilot-worktrees/acme-api/copilot-fix-123', 2, 8)],
		expected: [{ name: 'acme-api', canonical: '/Users/dev/.copilot/copilot-worktrees/acme-api/copilot-fix-123', members: ['/Users/dev/.copilot/copilot-worktrees/acme-api/copilot-fix-123'] }],
	},
	{
		name: 'sibling worktree folder <repo>-refactor-wt',
		platform: 'win32',
		entries: [entry('C:\\code\\acme-app', 5, 50), entry('C:\\code\\acme-app-refactor-wt', 1, 2)],
		expected: [{ name: 'acme-app', canonical: 'C:\\code\\acme-app', members: ['C:\\code\\acme-app', 'C:\\code\\acme-app-refactor-wt'] }],
	},
	{
		name: 'sibling worktree folder <repo>-wt',
		platform: 'linux',
		entries: [entry('/srv/acme-app-wt', 4, 40), entry('/srv/acme-app', 1, 1)],
		expected: [{ name: 'acme-app', canonical: '/srv/acme-app', members: ['/srv/acme-app', '/srv/acme-app-wt'] }],
	},
	{
		name: 'scratch clone with a hash suffix (<repo>-85ed99)',
		platform: 'win32',
		entries: [entry('C:\\code\\acme-app', 2, 2), entry('C:\\tmp\\acme-app-85ed99', 9, 90)],
		expected: [{ name: 'acme-app', canonical: 'C:\\code\\acme-app', members: ['C:\\code\\acme-app', 'C:\\tmp\\acme-app-85ed99'] }],
	},
	{
		name: 'same repository cloned twice',
		platform: 'win32',
		entries: [entry('C:\\code\\acme-app', 1, 1), entry('D:\\work\\acme-app', 2, 7)],
		expected: [{ name: 'acme-app', canonical: 'D:\\work\\acme-app', members: ['C:\\code\\acme-app', 'D:\\work\\acme-app'] }],
	},
	{
		name: 'case-only difference on Windows',
		platform: 'win32',
		entries: [entry('C:\\Code\\Acme-App', 1, 1), entry('c:\\code\\acme-app', 3, 3)],
		expected: [{ name: 'acme-app', canonical: 'c:\\code\\acme-app', members: ['C:\\Code\\Acme-App', 'c:\\code\\acme-app'] }],
	},
	{
		name: 'WSL / remote path with the same folder name as a local checkout',
		platform: 'win32',
		entries: [entry('/home/dev/acme-app', 10, 100), entry('C:\\code\\acme-app', 1, 1)],
		expected: [{ name: 'acme-app', canonical: 'C:\\code\\acme-app', members: ['/home/dev/acme-app', 'C:\\code\\acme-app'] }],
	},
	{
		name: 'WSL path inside a Claude desktop worktree layout joins the local checkout',
		platform: 'win32',
		entries: [
			entry('C:\\code\\acme-app', 2, 2),
			entry('/home/dev/.claude/worktrees/acme-app/goofy-wozniak-42f712', 3, 3),
		],
		expected: [{ name: 'acme-app', canonical: 'C:\\code\\acme-app', members: ['/home/dev/.claude/worktrees/acme-app/goofy-wozniak-42f712', 'C:\\code\\acme-app'] }],
	},
	{
		name: 'branch-named worktree joined by its session git remote (Copilot Chat / CLI repository field)',
		platform: 'win32',
		entries: [
			entry('C:\\code\\checkout-a', 1, 1, 'https://github.com/acme/widget.git'),
			entry('C:\\scratch\\groups-dashboard-layout-85ed99', 2, 2, 'git@github.com:acme/widget.git'),
		],
		expected: [{ name: 'widget', canonical: 'C:\\code\\checkout-a', members: ['C:\\code\\checkout-a', 'C:\\scratch\\groups-dashboard-layout-85ed99'] }],
	},
	{
		name: 'existing worktree resolved through its .git pointer to a main checkout not in the list',
		platform: 'win32',
		entries: [entry('C:\\wt\\copilot-server-memories-027fbb', 2, 6)],
		existing: ['C:\\wt\\copilot-server-memories-027fbb', 'C:\\code\\gadget'],
		git: { 'C:\\wt\\copilot-server-memories-027fbb': { mainWorktreePath: 'C:\\code\\gadget' } },
		expected: [{ name: 'gadget', canonical: 'C:\\code\\gadget', members: ['C:\\wt\\copilot-server-memories-027fbb'] }],
	},
	{
		name: 'JetBrains / Copilot CLI cwd under a worktree sub-folder still groups by the Claude layout',
		platform: 'linux',
		entries: [
			entry('/home/dev/acme-app', 1, 1),
			entry('/home/dev/.claude/worktrees/acme-app/eager-hopper-9f8e7d/server', 1, 1),
		],
		expected: [{ name: 'acme-app', canonical: '/home/dev/acme-app', members: ['/home/dev/.claude/worktrees/acme-app/eager-hopper-9f8e7d/server', '/home/dev/acme-app'] }],
	},
];

for (const row of CORPUS) {
	test(`corpus: ${row.name}`, () => {
		const groups = groupWorkspaces(row.entries, probes(row.platform, row.existing, row.git));
		assert.deepEqual(
			groups.map(g => ({ name: g.displayName, canonical: g.canonicalPath, members: g.memberPaths })).sort((a, b) => a.canonical.localeCompare(b.canonical)),
			[...row.expected].sort((a, b) => a.canonical.localeCompare(b.canonical)),
		);
		const totalSessions = row.entries.reduce((s, e) => s + e.sessionCount, 0);
		const totalInteractions = row.entries.reduce((s, e) => s + e.interactionCount, 0);
		assert.equal(groups.reduce((s, g) => s + g.sessionCount, 0), totalSessions, 'sessions are conserved');
		assert.equal(groups.reduce((s, g) => s + g.interactionCount, 0), totalInteractions, 'interactions are conserved');
	});
}

test('corpus invariant: after grouping no display name looks like a worktree or clone artefact', () => {
	for (const row of CORPUS) {
		const groups = groupWorkspaces(row.entries, probes(row.platform, row.existing, row.git));
		assert.deepEqual(detectArtefactWorkspaceNames(groups), [], row.name);
	}
});

test('corpus invariant: every row gives the same groups in every input order', () => {
	for (const row of CORPUS) {
		const p = probes(row.platform, row.existing, row.git);
		const expected = summarize(groupWorkspaces(row.entries, p));
		for (const order of permutations(row.entries)) {
			assert.deepEqual(summarize(groupWorkspaces(order, p)), expected, row.name);
		}
	}
});

// ── Precedence: remotes veto weaker signals ──────────────────────────────────

test('same basename but different remotes stays two groups', () => {
	const groups = groupWorkspaces([
		entry('C:\\a\\app', 1, 1, 'https://github.com/acme/app'),
		entry('C:\\b\\app', 1, 1, 'https://github.com/other/app'),
	], probes('win32'));
	assert.equal(groups.length, 2);
	assert.deepEqual(groups.map(g => g.repositoryId).sort(), ['acme/app', 'other/app']);
});

test('a -wt / hash name pattern never merges across different remotes', () => {
	const groups = groupWorkspaces([
		entry('C:\\code\\acme-app', 1, 1, 'https://github.com/acme/acme-app'),
		entry('C:\\code\\acme-app-wt', 1, 1, 'https://github.com/fork/something-else'),
		entry('C:\\code\\acme-app-85ed99', 1, 1, 'https://github.com/fork/third'),
	], probes('win32'));
	assert.equal(groups.length, 3);
});

/** Every ordering of `items`. */
function permutations<T>(items: T[]): T[][] {
	if (items.length <= 1) { return [items]; }
	return items.flatMap((item, i) => permutations([...items.slice(0, i), ...items.slice(i + 1)]).map(rest => [item, ...rest]));
}

test('remote identity beats basename: a remote-less folder between two repositories of the same name stays apart, in every order', () => {
	const entries = [
		entry('C:\\one\\tools', 1, 1, 'https://github.com/acme/tools'),
		entry('C:\\two\\tools', 1, 1),
		entry('C:\\three\\tools', 1, 1, 'https://github.com/other/tools'),
	];
	for (const order of permutations(entries)) {
		const groups = groupWorkspaces(order, probes('win32'));
		assert.deepEqual(groups.map(g => g.memberPaths).sort(), [['C:\\one\\tools'], ['C:\\three\\tools'], ['C:\\two\\tools']]);
	}
});

test('ambiguous name: several remote-less same-named folders still fold together, apart from both repositories', () => {
	const entries = [
		entry('C:\\one\\tools', 1, 1, 'https://github.com/acme/tools'),
		entry('C:\\two\\tools', 1, 1),
		entry('D:\\two\\tools', 1, 1),
		entry('C:\\three\\tools', 1, 1, 'https://github.com/other/tools'),
	];
	for (const order of permutations(entries)) {
		const groups = groupWorkspaces(order, probes('win32'));
		assert.deepEqual(groups.map(g => g.memberPaths).sort(), [['C:\\one\\tools'], ['C:\\three\\tools'], ['C:\\two\\tools', 'D:\\two\\tools']]);
	}
});

test('ambiguous stem: a sibling -wt folder with two same-named repositories to choose from joins neither, in every order', () => {
	const entries = [
		entry('C:\\a\\tools', 1, 1, 'https://github.com/acme/tools'),
		entry('C:\\b\\tools', 1, 1, 'https://github.com/other/tools'),
		entry('C:\\a\\tools-wt', 1, 1),
	];
	for (const order of permutations(entries)) {
		assert.equal(groupWorkspaces(order, probes('win32')).length, 3);
	}
});

test('ambiguous remote path: a WSL folder named like two different local repositories joins neither, in every order', () => {
	const entries = [
		entry('C:\\a\\tools', 1, 1, 'https://github.com/acme/tools'),
		entry('C:\\b\\tools', 1, 1, 'https://github.com/other/tools'),
		entry('/home/dev/tools', 1, 1),
	];
	for (const order of permutations(entries)) {
		const groups = groupWorkspaces(order, probes('win32'));
		assert.ok(groups.some(g => g.memberPaths.length === 1 && g.memberPaths[0] === '/home/dev/tools'));
		assert.equal(groups.length, 3);
	}
});

test('a remote path joins the single local repository it names even when that repository has a remote', () => {
	const groups = groupWorkspaces([entry('C:\\a\\tools', 1, 1, 'https://github.com/acme/tools'), entry('/home/dev/tools')], probes('win32'));
	assert.equal(groups.length, 1);
	assert.equal(groups[0].displayName, 'tools');
});

test('WSL paths in a Claude worktree layout still group by the layout (no disk access needed)', () => {
	let probed = 0;
	const p: WorkspaceGroupingProbes = { platform: 'win32', pathExists: () => { probed++; return false; } };
	const groups = groupWorkspaces([
		entry('/home/dev/.claude/worktrees/acme-app/goofy-wozniak-42f712', 1, 2),
		entry('/home/dev/.claude/worktrees/acme-app/brave-curie-0a1b2c', 1, 3),
	], p);
	assert.equal(groups.length, 1);
	assert.equal(groups[0].displayName, 'acme-app');
	assert.deepEqual(detectArtefactWorkspaceNames(groups), []);
	// Only local paths are probed (the anchor here is remote too).
	assert.equal(probed, 0);
});

test('remote identity merges folders whose names share nothing', () => {
	const groups = groupWorkspaces([
		entry('/x/alpha', 1, 1, 'https://github.com/Acme/Widget'),
		entry('/y/beta', 1, 1, 'ssh://git@github.com/acme/widget.git'),
	], probes('linux'));
	assert.equal(groups.length, 1);
	assert.equal(groups[0].displayName, 'widget');
});

test('remote read through the probes counts as identity for existing folders', () => {
	const groups = groupWorkspaces([entry('/x/alpha'), entry('/y/beta')], probes('linux', ['/x/alpha', '/y/beta'], {
		'/x/alpha': { remote: 'https://github.com/acme/widget.git' },
		'/y/beta': { remote: 'git@github.com:acme/widget.git' },
	}));
	assert.equal(groups.length, 1);
});

test('probes are not consulted for folders that no longer exist', () => {
	let asked = 0;
	groupWorkspaces([entry('/gone/repo')], { platform: 'linux', pathExists: () => false, readGitInfo: () => { asked++; return undefined; } });
	assert.equal(asked, 0);
});

test('an artefact name with nothing to merge into is left alone, and flagged', () => {
	const groups = groupWorkspaces([entry('C:\\code\\acme-app'), entry('C:\\tmp\\groups-dashboard-layout-85ed99')], probes('win32'));
	assert.equal(groups.length, 2);
	assert.deepEqual(detectArtefactWorkspaceNames(groups).map(a => [a.displayName, a.reason]), [['groups-dashboard-layout-85ed99', 'hash-suffix']]);
});

// ── Platform rules ───────────────────────────────────────────────────────────

test('case-only differences are separate folders on Linux (but basenames still match)', () => {
	const groups = groupWorkspaces([entry('/a/Repo', 1, 1, 'https://github.com/a/one'), entry('/a/repo', 1, 1, 'https://github.com/a/two')], probes('linux'));
	assert.equal(groups.length, 2);
});

test('POSIX paths are not treated as remote on non-Windows hosts', () => {
	const groups = groupWorkspaces([entry('/home/dev/acme-app', 5, 5), entry('/srv/acme-app', 1, 1)], probes('linux'));
	assert.equal(groups.length, 1);
	assert.equal(groups[0].canonicalPath, '/home/dev/acme-app');
});

test('a remote path is never chosen as canonical over a local one', () => {
	const [g] = groupWorkspaces([entry('/home/dev/x', 100, 100), entry('C:\\x', 1, 1)], probes('win32'));
	assert.equal(g.canonicalPath, 'C:\\x');
});

test('two remote paths with the same name do not merge by basename alone', () => {
	const groups = groupWorkspaces([entry('/home/a/x'), entry('/home/b/x')], probes('win32'));
	assert.equal(groups.length, 2);
});

// ── Counts, ties, passthrough ────────────────────────────────────────────────

test('counts are summed and duplicate input paths are merged', () => {
	const groups = groupWorkspaces([entry('C:\\code\\r', 1, 2), entry('C:\\code\\r', 3, 4), entry('D:\\r', 5, 6)], probes('win32'));
	assert.equal(groups.length, 1);
	assert.equal(groups[0].sessionCount, 9);
	assert.equal(groups[0].interactionCount, 12);
	assert.deepEqual(groups[0].memberPaths, ['C:\\code\\r', 'D:\\r']);
});

test('canonical choice is deterministic on ties: interactions, then sessions, then smallest path', () => {
	const a = entry('C:\\b\\repo', 1, 1);
	const b = entry('C:\\a\\repo', 1, 1);
	assert.equal(groupWorkspaces([a, b], probes('win32'))[0].canonicalPath, 'C:\\a\\repo');
	assert.equal(groupWorkspaces([b, a], probes('win32'))[0].canonicalPath, 'C:\\a\\repo');
	assert.equal(groupWorkspaces([entry('C:\\b\\repo', 2, 1), b], probes('win32'))[0].canonicalPath, 'C:\\b\\repo');
	assert.equal(groupWorkspaces([entry('C:\\b\\repo', 1, 2), entry('C:\\a\\repo', 9, 1)], probes('win32'))[0].canonicalPath, 'C:\\b\\repo');
});

test('a clean folder name is preferred as canonical over a busier artefact folder', () => {
	const [g] = groupWorkspaces([entry('C:\\code\\repo', 1, 1), entry('C:\\code\\repo-wt', 50, 500)], probes('win32'));
	assert.equal(g.canonicalPath, 'C:\\code\\repo');
});

test('<unresolved:…> entries pass through untouched', () => {
	const groups = groupWorkspaces([entry('<unresolved:abc123>', 0, 7), entry('<unresolved:abc123-85ed99>', 0, 1), entry('C:\\x\\abc123')], probes('win32'));
	assert.equal(groups.length, 3);
	const u = groups.find(g => g.canonicalPath === '<unresolved:abc123>')!;
	assert.deepEqual(u.memberPaths, ['<unresolved:abc123>']);
	assert.equal(u.interactionCount, 7);
	assert.deepEqual(detectArtefactWorkspaceNames(groups), []);
});

test('output is sorted by interactions, then sessions', () => {
	const groups = groupWorkspaces([entry('/a/one', 9, 1), entry('/a/two', 1, 5), entry('/a/three', 2, 1)], probes('linux'));
	assert.deepEqual(groups.map(g => g.displayName), ['two', 'one', 'three']);
});

test('empty input gives no groups', () => {
	assert.deepEqual(groupWorkspaces([], probes('linux')), []);
});

test('missing probes default to "nothing exists"', () => {
	const groups = groupWorkspaces([entry('C:\\Users\\dev\\.copilot\\copilot-worktrees\\r\\w')], { platform: 'win32' });
	assert.equal(groups[0].canonicalPath, 'C:\\Users\\dev\\.copilot\\copilot-worktrees\\r\\w');
	assert.equal(groups[0].displayName, 'r');
});

test('an existing main checkout found through a worktree pointer becomes canonical even when a clean member exists', () => {
	const [g] = groupWorkspaces(
		[entry('C:\\elsewhere\\gadget', 9, 9), entry('C:\\wt\\feature', 1, 1)],
		probes('win32', ['C:\\wt\\feature', 'C:\\code\\gadget'], { 'C:\\wt\\feature': { mainWorktreePath: 'C:\\code\\gadget' } }),
	);
	assert.equal(g.canonicalPath, 'C:\\code\\gadget');
	assert.deepEqual(g.memberPaths, ['C:\\elsewhere\\gadget', 'C:\\wt\\feature']);
});

// ── Building blocks ──────────────────────────────────────────────────────────

test('repositoryIdentity normalises remote URL forms', () => {
	assert.equal(repositoryIdentity('https://github.com/Acme/Widget.git'), 'acme/widget');
	assert.equal(repositoryIdentity('git@github.com:acme/widget.git'), 'acme/widget');
	assert.equal(repositoryIdentity('ssh://git@github.com:22/acme/widget'), 'acme/widget');
	assert.equal(repositoryIdentity('https://user@dev.azure.com/org/Project/_git/Repo'), 'project/repo');
	assert.equal(repositoryIdentity('acme/widget'), 'acme/widget');
	assert.equal(repositoryIdentity('https://github.com/acme/widget/'), 'acme/widget');
	assert.equal(repositoryIdentity(''), undefined);
	assert.equal(repositoryIdentity(undefined), undefined);
	assert.equal(repositoryIdentity('(unknown)'), undefined);
});

test('classifyArtefactName recognises the known shapes and avoids hex-looking words', () => {
	assert.equal(classifyArtefactName('goofy-wozniak-42f712'), 'generated-name');
	assert.equal(classifyArtefactName('groups-dashboard-layout-85ed99'), 'hash-suffix');
	assert.equal(classifyArtefactName('copilot-server-memories-027fbb'), 'hash-suffix');
	assert.equal(classifyArtefactName('ai-engineering-fluency-refactor-wt'), 'worktree-suffix');
	assert.equal(classifyArtefactName('wt'), 'worktree-suffix');
	assert.equal(classifyArtefactName('ai-engineering-fluency'), undefined);
	assert.equal(classifyArtefactName('my-facade'), undefined, 'all-letter hex words are not hashes');
	assert.equal(classifyArtefactName('decade-cafe'), undefined);
	assert.equal(classifyArtefactName('release-2024'), undefined, 'short numbers are not hashes');
	assert.equal(classifyArtefactName('newt'), undefined);
});

test('detectArtefactWorkspaceNames flags a group still named after a worktree folder', () => {
	const flagged = detectArtefactWorkspaceNames([
		{ canonicalPath: '/x/worktrees/feature', displayName: 'feature', memberPaths: ['/x/worktrees/feature'], sessionCount: 1, interactionCount: 1 },
		{ canonicalPath: '/x/worktrees/feature', displayName: 'repo', memberPaths: ['/x/worktrees/feature'], sessionCount: 1, interactionCount: 1 },
		{ canonicalPath: 'C:\\x\\copilot-worktrees\\fix', displayName: 'fix', memberPaths: [], sessionCount: 1, interactionCount: 1 },
		{ canonicalPath: '/code/repo-wt', displayName: 'repo-wt', memberPaths: [], sessionCount: 1, interactionCount: 1 },
	]);
	assert.deepEqual(flagged.map(f => [f.displayName, f.reason]), [['feature', 'worktree-folder'], ['fix', 'worktree-folder'], ['repo-wt', 'worktree-suffix']]);
});

test('matchWorktreeConvention reads the three layouts', () => {
	assert.deepEqual(matchWorktreeConvention('/home/u/.claude/worktrees/repo/name'), { repoName: 'repo', anchorPath: '/home/u/.claude/worktrees/repo', anchorIsCheckout: false });
	assert.deepEqual(matchWorktreeConvention('/src/repo/.claude/worktrees/name'), { repoName: 'repo', anchorPath: '/src/repo', anchorIsCheckout: true });
	assert.deepEqual(
		matchWorktreeConvention('/src/repo/.claude/worktrees/name/sub', p => p === '/src/repo/.git'),
		{ repoName: 'repo', anchorPath: '/src/repo', anchorIsCheckout: true },
		'an existing .git next to .claude means the in-repo layout, even with a sub-folder',
	);
	assert.deepEqual(matchWorktreeConvention('C:\\u\\.copilot\\copilot-worktrees\\repo\\w'), { repoName: 'repo', anchorPath: 'C:\\u\\.copilot\\copilot-worktrees\\repo', anchorIsCheckout: false });
	assert.equal(matchWorktreeConvention('/home/u/.claude/worktrees'), undefined);
	assert.equal(matchWorktreeConvention('/home/u/.copilot/copilot-worktrees/repo'), undefined);
	assert.equal(matchWorktreeConvention('/home/u/code/repo'), undefined);
});

test('workspaceBasename ignores trailing separators and handles both separator styles', () => {
	assert.equal(workspaceBasename('C:\\code\\repo\\'), 'repo');
	assert.equal(workspaceBasename('/home/dev/repo/'), 'repo');
	assert.equal(workspaceBasename('repo'), 'repo');
});

// ── Customization files of a group ───────────────────────────────────────────

function file(type: string, relativePath: string, lastModified: string | null, isStale = false) {
	return { type, relativePath, lastModified, isStale, path: `/x/${relativePath}` };
}

test('mergeGroupCustomizationFiles keeps every type found in any member folder', () => {
	const main = [file('instructions', '.github/copilot-instructions.md', '2026-10-01T00:00:00Z')];
	const worktree = [file('skill', '.github/skills/a/SKILL.md', '2026-10-02T00:00:00Z'), file('agent', '.github/agents/x.agent.md', '2026-10-03T00:00:00Z')];
	const merged = mergeGroupCustomizationFiles([main, undefined, worktree]);
	assert.deepEqual(merged.map(f => f.type).sort(), ['agent', 'instructions', 'skill']);
});

test('mergeGroupCustomizationFiles keeps one copy of the same file: fresh over stale, then newest', () => {
	const stale = file('instructions', '.github\\copilot-instructions.md', '2026-10-09T00:00:00Z', true);
	const older = file('instructions', '.github/copilot-instructions.md', '2026-09-01T00:00:00Z');
	const newer = file('instructions', '.GITHUB/copilot-instructions.md', '2026-10-01T00:00:00Z');
	assert.deepEqual(mergeGroupCustomizationFiles([[stale], [older], [newer]]), [newer]);
	assert.deepEqual(mergeGroupCustomizationFiles([[newer], [stale], [older]]), [newer]);
	assert.deepEqual(mergeGroupCustomizationFiles([[stale]]), [stale], 'a stale copy is kept when it is the only one');
});

test('mergeGroupCustomizationFiles: same path under two types is two entries; nothing in, nothing out', () => {
	assert.equal(mergeGroupCustomizationFiles([[file('a', 'f.md', null)], [file('b', 'f.md', null)]]).length, 2);
	assert.deepEqual(mergeGroupCustomizationFiles([undefined, []]), []);
});

// ── Node probes (real temp folders, never user data) ──────────────────────────

test('readWorkspaceGitInfo reads a checkout remote and a worktree pointer', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-grouping-'));
	try {
		const main = path.join(root, 'main-repo');
		fs.mkdirSync(path.join(main, '.git', 'worktrees', 'feature'), { recursive: true });
		fs.writeFileSync(path.join(main, '.git', 'config'), '[remote "origin"]\n\turl = https://github.com/acme/widget.git\n');
		const wt = path.join(root, 'main-repo-85ed99');
		fs.mkdirSync(wt);
		fs.writeFileSync(path.join(wt, '.git'), `gitdir: ${path.join(main, '.git', 'worktrees', 'feature')}\n`);
		const plain = path.join(root, 'plain');
		fs.mkdirSync(plain);

		assert.deepEqual(readWorkspaceGitInfo(main), { remote: 'https://github.com/acme/widget.git' });
		assert.deepEqual(readWorkspaceGitInfo(wt), { remote: 'https://github.com/acme/widget.git', mainWorktreePath: main });
		assert.equal(readWorkspaceGitInfo(plain), undefined);
		assert.equal(readWorkspaceGitInfo(path.join(root, 'missing')), undefined);

		const groups = groupWorkspaces([entry(wt, 2, 2), entry(plain)], createNodeWorkspaceGroupingProbes());
		const widget = groups.find(g => g.displayName === 'widget')!;
		assert.equal(widget.canonicalPath, main);
		assert.deepEqual(widget.memberPaths, [wt]);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});

test('readWorkspaceGitInfo ignores a .git file that does not point into a worktrees folder', () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-grouping-'));
	try {
		fs.writeFileSync(path.join(root, '.git'), 'gitdir: ../somewhere/modules/sub\n');
		assert.equal(readWorkspaceGitInfo(root), undefined);
		fs.writeFileSync(path.join(root, '.git'), 'not a pointer');
		assert.equal(readWorkspaceGitInfo(root), undefined);
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
});
