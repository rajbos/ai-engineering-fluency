import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {
	MAX_SCANNED_REPOS,
	indexPrStats,
	scanDarkFactoryReadiness,
	selectRepoRoots,
} from '../../src/darkFactoryService';
import type { RepoPrInfo, RepoPrStatsResult } from '../../src/githubPrService';

// ---------------------------------------------------------------------------
// Fixture helpers
// ---------------------------------------------------------------------------

const TEMP_ROOTS: string[] = [];

/** Create a throwaway repository whose `origin` remote is `remoteUrl` (when given). */
function makeRepo(files: Record<string, string>, remoteUrl?: string): string {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'df-service-'));
	TEMP_ROOTS.push(root);
	const all: Record<string, string> = {
		'.git/config': remoteUrl ? `[remote "origin"]\n\turl = ${remoteUrl}\n` : '[core]\n',
		...files,
	};
	for (const [relative, content] of Object.entries(all)) {
		const target = path.join(root, relative);
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, content, 'utf8');
	}
	return root;
}

/** A plain directory that is not a git repository. */
function makePlainDir(): string {
	const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'df-plain-'));
	TEMP_ROOTS.push(dir);
	return dir;
}

test.after(() => {
	for (const root of TEMP_ROOTS) { fs.rmSync(root, { recursive: true, force: true }); }
});

function prStats(repos: Partial<RepoPrInfo>[], authenticated = true): RepoPrStatsResult {
	return {
		authenticated,
		since: '2026-08-01T00:00:00.000Z',
		repos: repos.map(repo => ({
			owner: 'rajbos', repo: 'demo', repoUrl: '', totalPrs: 0, aiAuthoredPrs: 0,
			aiReviewRequestedPrs: 0, aiDetails: [], ...repo,
		})),
	};
}

const FIXED_NOW = () => new Date('2026-09-01T12:00:00.000Z');

// ---------------------------------------------------------------------------
// selectRepoRoots
// ---------------------------------------------------------------------------

test('selectRepoRoots: keeps git repositories and drops everything else', () => {
	const repo = makeRepo({});
	const plain = makePlainDir();
	const { roots, skipped } = selectRepoRoots([plain, repo, path.join(os.tmpdir(), 'df-missing-xyz')]);
	assert.deepEqual(roots, [repo]);
	assert.equal(skipped, 0);
});

test('selectRepoRoots: deduplicates the same repository reached by different path spellings', () => {
	const repo = makeRepo({});
	const { roots } = selectRepoRoots([repo, path.join(repo, '.'), repo]);
	assert.deepEqual(roots, [repo]);
});

test('selectRepoRoots: ignores the unresolved workspace placeholders the matrix can contain', () => {
	const repo = makeRepo({});
	const { roots } = selectRepoRoots(['<unresolved:abc123>', '', repo]);
	assert.deepEqual(roots, [repo]);
});

test('selectRepoRoots: preserves caller ordering so the most relevant paths survive the cap', () => {
	const first = makeRepo({});
	const second = makeRepo({});
	assert.deepEqual(selectRepoRoots([second, first]).roots, [second, first]);
});

test('selectRepoRoots: caps the scan and reports how many repositories it skipped', () => {
	const repos = Array.from({ length: MAX_SCANNED_REPOS + 3 }, () => makeRepo({}));
	const { roots, skipped } = selectRepoRoots(repos);
	assert.equal(roots.length, MAX_SCANNED_REPOS);
	assert.equal(skipped, 3);
});

// ---------------------------------------------------------------------------
// indexPrStats
// ---------------------------------------------------------------------------

test('indexPrStats: an unauthenticated result contributes nothing', () => {
	assert.equal(indexPrStats(prStats([{ owner: 'rajbos', repo: 'demo' }], false)).size, 0);
	assert.equal(indexPrStats(undefined).size, 0);
});

test('indexPrStats: keys are lower-cased and carry the per-repo error through', () => {
	const index = indexPrStats(prStats([{ owner: 'RajBos', repo: 'Demo', totalPrs: 4, aiAuthoredPrs: 1, error: 'denied' }]));
	assert.deepEqual(index.get('rajbos/demo'), { totalPrs: 4, aiAuthoredPrs: 1, error: 'denied' });
});

// ---------------------------------------------------------------------------
// scanDarkFactoryReadiness
// ---------------------------------------------------------------------------

test('scan: an empty workspace produces an empty, honest report', () => {
	const report = scanDarkFactoryReadiness({ workspacePaths: [], now: FIXED_NOW });
	assert.deepEqual(report.repos, []);
	assert.equal(report.apiSignalsIncluded, false);
	assert.equal(report.scannedAt, '2026-09-01T12:00:00.000Z');
	assert.equal(report.maxAssessableStage, 4);
});

test('scan: resolves owner/repo from the git config without spawning git', () => {
	const repo = makeRepo({}, 'https://github.com/rajbos/ai-engineering-fluency.git');
	const report = scanDarkFactoryReadiness({ workspacePaths: [repo], now: FIXED_NOW });
	assert.equal(report.repos[0].nameWithOwner, 'rajbos/ai-engineering-fluency');
});

test('scan: leaves nameWithOwner unset for a repository with no GitHub remote', () => {
	const repo = makeRepo({}, 'https://gitlab.com/rajbos/elsewhere.git');
	const report = scanDarkFactoryReadiness({ workspacePaths: [repo], now: FIXED_NOW });
	assert.equal(report.repos[0].nameWithOwner, undefined);
});

test('scan: resolves an enterprise remote when the enterprise URI is configured', () => {
	const repo = makeRepo({}, 'https://customer.ghe.com/rajbos/private-repo.git');
	const report = scanDarkFactoryReadiness({ workspacePaths: [repo], now: FIXED_NOW, enterpriseUri: 'https://customer.ghe.com' });
	assert.equal(report.repos[0].nameWithOwner, 'rajbos/private-repo');
});

test('scan: without pull-request data the agent-PR control is unknown, not absent', () => {
	const repo = makeRepo({}, 'https://github.com/rajbos/demo.git');
	const report = scanDarkFactoryReadiness({ workspacePaths: [repo], now: FIXED_NOW });
	const control = report.repos[0].controls.find(c => c.id === 'agent-authored-pull-requests');
	assert.equal(control?.state, 'unknown');
	assert.equal(report.apiSignalsIncluded, false);
});

test('scan: joins already-fetched pull-request statistics by owner/repo', () => {
	const repo = makeRepo({}, 'https://github.com/rajbos/demo.git');
	const report = scanDarkFactoryReadiness({
		workspacePaths: [repo],
		prStats: prStats([{ owner: 'rajbos', repo: 'demo', totalPrs: 20, aiAuthoredPrs: 5 }]),
		now: FIXED_NOW,
	});
	const control = report.repos[0].controls.find(c => c.id === 'agent-authored-pull-requests');
	assert.equal(control?.state, 'present');
	assert.equal(report.apiSignalsIncluded, true);
});

test('scan: pull-request statistics for a different repository are not borrowed', () => {
	const repo = makeRepo({}, 'https://github.com/rajbos/demo.git');
	const report = scanDarkFactoryReadiness({
		workspacePaths: [repo],
		prStats: prStats([{ owner: 'someone', repo: 'else', totalPrs: 20, aiAuthoredPrs: 5 }]),
		now: FIXED_NOW,
	});
	assert.equal(report.repos[0].controls.find(c => c.id === 'agent-authored-pull-requests')?.state, 'unknown');
});

test('scan: a repository with AI customization but no CI raises the agents-before-delivery finding', () => {
	const repo = makeRepo({ '.github/copilot-instructions.md': '# rules' });
	const report = scanDarkFactoryReadiness({ workspacePaths: [repo], now: FIXED_NOW });
	const finding = report.repos[0].findings.find(f => f.id === 'agents-before-delivery');
	assert.equal(finding?.severity, 'high');
});

test('scan: names the repository by its folder and records the scanned path', () => {
	const repo = makeRepo({});
	const report = scanDarkFactoryReadiness({ workspacePaths: [repo], now: FIXED_NOW });
	assert.equal(report.repos[0].name, path.basename(repo));
	assert.equal(report.repos[0].repoRoot, path.resolve(repo));
});
