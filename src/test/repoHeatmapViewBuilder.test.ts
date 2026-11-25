import test from 'node:test';
import * as assert from 'node:assert/strict';

import type { FileTouch } from '../fileActivity';
import {
	agentWorktreeInfo,
	buildRepoHeatmapViewData,
	classifyHotspot,
	estimateReadTokens,
	HOTSPOT_CHARS_PER_TOKEN,
	findRepoHeatmapHotspots,
	isGeneratedPath,
	previousPeriodEnd,
	summarizeRepoHeatmap,
	toRepoRelativePath,
	type RepoHeatmapSessionInput,
} from '../repoHeatmapViewBuilder';

const NOW = new Date(2026, 9, 22, 12, 0, 0); // 2026-10-22 local
const at = (day: string) => new Date(`${day}T12:00:00`).getTime();
const touch = (path: string, kind: FileTouch['kind'], day?: string): FileTouch => ({ path, kind, ...(day ? { ts: at(day) } : {}) });

const session = (overrides: Partial<RepoHeatmapSessionInput> & { touches: FileTouch[] }): RepoHeatmapSessionInput => ({
	repository: 'https://github.com/o/r.git',
	workspaceFolderPath: 'C:\\code\\r',
	fallbackDayKey: '2026-10-22',
	...overrides,
});

test('toRepoRelativePath: anchors under the workspace, case-insensitively, and rejects outside paths', () => {
	assert.equal(toRepoRelativePath('c:/CODE/r/src/a.ts', 'C:\\code\\r'), 'src/a.ts');
	assert.equal(toRepoRelativePath('./docs/x.md', 'C:\\code\\r'), 'docs/x.md');
	assert.equal(toRepoRelativePath('C:/Users/me/.claude/notes.md', 'C:\\code\\r'), undefined);
	assert.equal(toRepoRelativePath('C:/code/r2/a.ts', 'C:\\code\\r'), undefined, 'a sibling folder sharing a prefix is not inside');
	assert.equal(toRepoRelativePath('/abs/a.ts', undefined), undefined);
});

test('buildRepoHeatmapViewData: merges sessions of one repository across worktrees', () => {
	const data = buildRepoHeatmapViewData([
		session({ touches: [touch('C:/code/r/src/a.ts', 'read', '2026-10-22'), touch('C:/code/r/src/a.ts', 'edited', '2026-10-22')] }),
		session({ workspaceFolderPath: 'C:\\wt\\r-feature', touches: [touch('C:/wt/r-feature/src/a.ts', 'read', '2026-10-21')] }),
	], NOW);
	assert.equal(data.repos.length, 1);
	assert.equal(data.repos[0].label, 'o/r');
	assert.deepEqual(data.repos[0].files.map(f => f.path), ['src/a.ts']);
	assert.deepEqual(data.repos[0].files[0].days, { '2026-10-22': [1, 1, 0, 0], '2026-10-21': [1, 0, 0, 0] });
});

test('buildRepoHeatmapViewData: touches outside the workspace are counted, not shown; touches without ts use the session day', () => {
	const data = buildRepoHeatmapViewData([
		session({ fallbackDayKey: '2026-10-20', touches: [touch('C:/elsewhere/x.ts', 'read'), touch('C:/code/r/b.ts', 'created')] }),
	], NOW);
	assert.equal(data.outsideRepoTouches, 1);
	assert.deepEqual(data.repos[0].files[0].days, { '2026-10-20': [0, 0, 1, 0] });
});

test('buildRepoHeatmapViewData: no sessions means no data; local repos fall back to the folder name; busiest repo first', () => {
	assert.equal(buildRepoHeatmapViewData([], NOW).hasData, false);
	const data = buildRepoHeatmapViewData([
		session({ repository: undefined, workspaceFolderPath: 'C:\\code\\local-only', touches: [touch('C:/code/local-only/a.ts', 'read', '2026-10-22')] }),
		session({ touches: [touch('C:/code/r/a.ts', 'read', '2026-10-22'), touch('C:/code/r/b.ts', 'read', '2026-10-22')] }),
	], NOW);
	assert.deepEqual(data.repos.map(r => r.label), ['o/r', 'local-only']);
});

test('buildRepoHeatmapViewData: shell deletes keep the inferred flag only when every delete was inferred', () => {
	const data = buildRepoHeatmapViewData([
		session({ touches: [{ path: 'old.txt', kind: 'deleted', inferred: true, ts: at('2026-10-22') }, { path: 'C:/code/r/kept.txt', kind: 'deleted', ts: at('2026-10-22') }] }),
	], NOW);
	const byPath = Object.fromEntries(data.repos[0].files.map(f => [f.path, f]));
	assert.equal(byPath['old.txt'].inferredDeletes, true);
	assert.equal(byPath['kept.txt'].inferredDeletes, undefined);
});

test('summarizeRepoHeatmap: groups files by folder and filters on the standard periods', () => {
	const data = buildRepoHeatmapViewData([
		session({ touches: [
			touch('C:/code/r/src/a.ts', 'edited', '2026-10-22'),
			touch('C:/code/r/src/a.ts', 'read', '2026-10-22'),
			touch('C:/code/r/src/b.ts', 'read', '2026-10-10'),
			touch('C:/code/r/docs/c.md', 'read', '2026-08-01'),
			touch('C:/code/r/README.md', 'created', '2026-10-22'),
		] }),
	], NOW);
	const repo = data.repos[0];

	const today = summarizeRepoHeatmap(repo, 'today', NOW);
	assert.deepEqual(today.folders.map(f => [f.folder, f.files.map(x => x.name)]), [['src', ['a.ts']], ['.', ['README.md']]]);
	assert.deepEqual(today.counts, [1, 1, 1, 0]);

	const last30 = summarizeRepoHeatmap(repo, 'last30', NOW);
	assert.deepEqual(last30.folders.map(f => f.folder), ['src', '.']);
	assert.equal(last30.fileCount, 3);
	assert.deepEqual(last30.folders[0].files.map(f => f.name), ['a.ts', 'b.ts']);

	const month = summarizeRepoHeatmap(repo, 'currentMonth', NOW);
	assert.equal(month.fileCount, 3);

	const all = summarizeRepoHeatmap(repo, 'allTime', NOW);
	assert.equal(all.fileCount, 4);
	assert.equal(all.maxCellTotal, 2);
});

test('summarizeRepoHeatmap: the kind filter hides files with no selected activity', () => {
	const data = buildRepoHeatmapViewData([
		session({ touches: [touch('C:/code/r/a.ts', 'read', '2026-10-22'), touch('C:/code/r/b.ts', 'edited', '2026-10-22'), touch('C:/code/r/c.ts', 'deleted', '2026-10-22')] }),
	], NOW);
	const edits = summarizeRepoHeatmap(data.repos[0], 'allTime', NOW, new Set(['edited']));
	assert.deepEqual(edits.folders[0].files.map(f => f.name), ['b.ts']);
	const deletes = summarizeRepoHeatmap(data.repos[0], 'allTime', NOW, new Set(['deleted', 'created']));
	assert.deepEqual(deletes.folders[0].files.map(f => f.name), ['c.ts']);
});

test('summarizeRepoHeatmap: future-dated activity is excluded', () => {
	const data = buildRepoHeatmapViewData([session({ touches: [touch('C:/code/r/a.ts', 'read', '2026-11-30')] })], NOW);
	assert.equal(summarizeRepoHeatmap(data.repos[0], 'allTime', NOW).fileCount, 0);
});

test('agentWorktreeInfo: recognises the agent worktree layouts and ignores ordinary folders', () => {
	assert.deepEqual(agentWorktreeInfo(String.raw`C:\Users\me\.claude\worktrees\repo\feat-1\src\a.ts`), { root: 'C:/Users/me/.claude/worktrees/repo/feat-1', repoName: 'repo' });
	assert.deepEqual(agentWorktreeInfo('C:/Users/me/.copilot/copilot-worktrees/repo/local-x'), { root: 'C:/Users/me/.copilot/copilot-worktrees/repo/local-x', repoName: 'repo' });
	assert.deepEqual(agentWorktreeInfo('/code/repo.worktrees/topic/src/a.ts'), { root: '/code/repo.worktrees/topic', repoName: 'repo' });
	assert.equal(agentWorktreeInfo('C:/code/repo/src/a.ts'), undefined);
});

test('buildRepoHeatmapViewData: worktrees without a remote group by repository name and join the matching remote', () => {
	const wt = (name: string, file: string, repository?: string): RepoHeatmapSessionInput => session({
		repository,
		workspaceFolderPath: `C:/Users/me/.claude/worktrees/r/${name}`,
		touches: [touch(`C:/Users/me/.claude/worktrees/r/${name}/${file}`, 'edited', '2026-10-22')],
	});
	const data = buildRepoHeatmapViewData([
		wt('one', 'src/a.ts'),
		wt('two', 'src/a.ts'),
		wt('three', 'src/b.ts', 'https://github.com/o/r.git'),
	], NOW);
	assert.equal(data.repos.length, 1, 'the name-keyed worktrees merge into o/r');
	assert.equal(data.repos[0].label, 'o/r');
	const byPath = Object.fromEntries(data.repos[0].files.map(f => [f.path, f.days['2026-10-22']]));
	assert.deepEqual(byPath, { 'src/a.ts': [0, 2, 0, 0], 'src/b.ts': [0, 1, 0, 0] });

	const lone = buildRepoHeatmapViewData([wt('one', 'x.ts')], NOW);
	assert.equal(lone.repos[0].label, 'r', 'no matching remote: the worktree repository name');
});

test('buildRepoHeatmapViewData: a touch inside another worktree than the session folder belongs to that worktree repository', () => {
	const data = buildRepoHeatmapViewData([
		session({
			repository: undefined,
			workspaceFolderPath: 'C:/Users/me/group',
			touches: [touch('C:/Users/me/.claude/worktrees/other/wt-1/src/a.ts', 'read', '2026-10-22'), touch('C:/Users/me/group/notes.md', 'read', '2026-10-22')],
		}),
	], NOW);
	assert.deepEqual(data.repos.map(r => [r.label, r.files.map(f => f.path)]).sort(), [['group', ['notes.md']], ['other', ['src/a.ts']]]);
});

test('buildRepoHeatmapViewData: two remotes ending in the same name stay separate rather than guess', () => {
	const remote = (url: string): RepoHeatmapSessionInput => session({ repository: url, workspaceFolderPath: 'C:/code/x', touches: [touch('C:/code/x/a.ts', 'read', '2026-10-22')] });
	const data = buildRepoHeatmapViewData([
		remote('https://github.com/a/r.git'),
		remote('https://github.com/b/r.git'),
		session({ repository: undefined, workspaceFolderPath: 'C:/Users/me/.claude/worktrees/r/w', touches: [touch('C:/Users/me/.claude/worktrees/r/w/z.ts', 'read', '2026-10-22')] }),
	], NOW);
	assert.equal(data.repos.length, 3);
});

test('isGeneratedPath: dependency folders, build output, lockfiles and minified files only', () => {
	for (const p of ['node_modules/x/index.js', 'pkg/dist/a.js', 'out/test.js', 'pnpm-lock.yaml', 'web/package-lock.json', 'assets/app.min.js', 'src/obj/Debug/a.cs']) {
		assert.equal(isGeneratedPath(p), true, p);
	}
	for (const p of ['src/extension.ts', 'distribution/readme.md', 'scripts/bin-pack.js', 'bin/cli.js', 'docs/output.md']) {
		assert.equal(isGeneratedPath(p), false, p);
	}
});

test('classifyHotspot: only re-read and generated files are flagged', () => {
	assert.equal(classifyHotspot('src/a.ts', [10, 2, 0, 0]), 'reread', 'reads at 5x edits');
	assert.equal(classifyHotspot('src/a.ts', [10, 0, 0, 0]), 'reread', 'never edited counts as one edit for the ratio');
	assert.equal(classifyHotspot('src/a.ts', [9, 0, 0, 0]), undefined, 'below the minimum reads');
	assert.equal(classifyHotspot('src/a.ts', [11, 3, 0, 0]), undefined, 'under 4 reads per edit');
	assert.equal(classifyHotspot('src/a.ts', [12, 3, 0, 0]), 'reread', 'exactly 4 reads per edit');
	assert.equal(classifyHotspot('src/a.ts', [10, 30, 0, 0]), undefined, 'heavy editing is normal work');
	assert.equal(classifyHotspot('tmp.txt', [2, 0, 1, 1]), undefined, 'a throwaway file is not flagged');
	assert.equal(classifyHotspot('dist/a.js', [3, 0, 0, 0]), 'generated');
	assert.equal(classifyHotspot('dist/a.js', [2, 0, 5, 0]), undefined, 'writing build output is expected; only reading it is flagged');
	assert.equal(classifyHotspot('node_modules/x/big.js', [40, 0, 0, 0]), 'generated', 'generated outranks reread');
});

test('previousPeriodEnd: the day before the period starts; none for all time', () => {
	assert.equal(previousPeriodEnd('last7', NOW)?.toDateString(), new Date(2026, 9, 15).toDateString());
	assert.equal(previousPeriodEnd('today', NOW)?.toDateString(), new Date(2026, 9, 21).toDateString());
	assert.equal(previousPeriodEnd('currentMonth', NOW)?.toDateString(), new Date(2026, 8, 30).toDateString());
	assert.equal(previousPeriodEnd('allTime', NOW), undefined);
});

test('findRepoHeatmapHotspots: most-read first, period-bound, with the previous period for comparison', () => {
	const reads = (path: string, n: number, day = '2026-10-22') => Array.from({ length: n }, () => touch(`C:/code/r/${path}`, 'read', day));
	const edits = (path: string, n: number) => Array.from({ length: n }, () => touch(`C:/code/r/${path}`, 'edited', '2026-10-22'));
	const data = buildRepoHeatmapViewData([session({ touches: [
		...reads('src/big.ts', 30), ...edits('src/big.ts', 2), ...reads('src/big.ts', 45, '2026-10-12'),
		...reads('src/hot.ts', 5), ...edits('src/hot.ts', 12),
		...reads('docs/guide.md', 12),
		...reads('node_modules/x/index.js', 4),
		...reads('src/old.ts', 50, '2026-01-01'),
	] })], NOW);
	const hotspots = findRepoHeatmapHotspots(data.repos[0], 'last7', NOW);
	assert.deepEqual(hotspots.map(h => [h.path, h.kind, h.previousReads]), [
		['src/big.ts', 'reread', 45],
		['docs/guide.md', 'reread', 0],
		['node_modules/x/index.js', 'generated', 0],
	]);
	assert.deepEqual(hotspots[0].counts, [30, 2, 0, 0]);
	assert.equal(findRepoHeatmapHotspots(data.repos[0], 'last7', NOW, 1).length, 1);
	const allTime = findRepoHeatmapHotspots(data.repos[0], 'allTime', NOW);
	assert.equal(allTime[0].path, 'src/big.ts', 'all time adds the earlier reads');
	assert.equal(allTime[1].path, 'src/old.ts', 'and brings the old file back');
	assert.equal(allTime[0].previousReads, undefined, 'all time has no previous period');
});

// ── Read cost ────────────────────────────────────────────────────────────────

test('estimateReadTokens: sized reads scaled to all reads at four characters per token; nothing sized means no estimate', () => {
	assert.equal(estimateReadTokens(10, 4000, 10), 1000);
	assert.equal(estimateReadTokens(10, 4000, 5), 2000, 'unsized reads are assumed average');
	assert.equal(estimateReadTokens(3, 4000, 5), 1000, 'never scaled below the reads that were measured');
	assert.equal(estimateReadTokens(10, 0, 0), undefined);
	assert.equal(HOTSPOT_CHARS_PER_TOKEN, 4);
});

test('read sizes: kept per day, merged across sessions and worktrees, and bound to the period', () => {
	const read = (day: string, chars?: number): FileTouch => ({ ...touch('C:/code/r/src/big.ts', 'read', day), ...(chars ? { chars } : {}) });
	const data = buildRepoHeatmapViewData([
		session({ touches: [read('2026-10-22', 4000), read('2026-10-22'), read('2026-10-12', 8000), touch('C:/code/r/src/plain.ts', 'read', '2026-10-22')] }),
		session({ workspaceFolderPath: 'C:\\Users\\me\\.claude\\worktrees\\r\\fix', touches: [{ ...touch('C:/Users/me/.claude/worktrees/r/fix/src/big.ts', 'read', '2026-10-22'), chars: 2000 }] }),
	], NOW);
	const byPath = Object.fromEntries(data.repos[0].files.map(f => [f.path, f]));
	assert.deepEqual(byPath['src/big.ts'].readSizes, { '2026-10-22': [6000, 2], '2026-10-12': [8000, 1] });
	assert.equal(byPath['src/plain.ts'].readSizes, undefined, 'a file with no sized read carries no sizes');
	const cell = (period: 'last7' | 'allTime') => summarizeRepoHeatmap(data.repos[0], period, NOW).folders[0].files.find(f => f.name === 'big.ts');
	assert.deepEqual([cell('last7')?.readChars, cell('last7')?.sizedReads], [6000, 2]);
	assert.deepEqual([cell('allTime')?.readChars, cell('allTime')?.sizedReads], [14000, 3]);
});

test('findRepoHeatmapHotspots: estimates the tokens the reads cost, and leaves it out when no read was sized', () => {
	const reads = (path: string, n: number, chars?: number) =>
		Array.from({ length: n }, (): FileTouch => ({ ...touch(`C:/code/r/${path}`, 'read', '2026-10-22'), ...(chars ? { chars } : {}) }));
	const data = buildRepoHeatmapViewData([session({ touches: [
		...reads('src/big.ts', 10, 8000), ...reads('src/big.ts', 10),
		...reads('docs/guide.md', 12),
	] })], NOW);
	const [big, guide] = findRepoHeatmapHotspots(data.repos[0], 'last7', NOW);
	assert.deepEqual([big.path, big.readTokens, big.sizedReads], ['src/big.ts', 40000, 10]);
	assert.deepEqual([guide.path, guide.sizedReads, 'readTokens' in guide], ['docs/guide.md', 0, false]);
});
