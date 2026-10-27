#!/usr/bin/env node
'use strict';

/**
 * Renders the badge app in the emulator at the merge base and at the working
 * tree, compares the screenshots and adds the result to the visual-view-diff
 * report, so badge screens show up in the same CI screenshot comment as the
 * webviews.
 *
 * Usage (from the repo root):
 *   node badge-app/tools/emulator/badge-diff.js [--base origin/main] [--out visual-output]
 *
 * Writes into <out>/baseline, <out>/current and <out>/diff next to whatever the
 * webview diff put there, and merges its comparisons into <out>/diff/report.json
 * and report.md (replacing earlier badge entries, keeping the webview ones).
 * Run it after visual-diff.js, which clears <out> when it starts.
 *
 * Exits non-zero when the app crashes or stops drawing in the working tree. A
 * crash at the merge base only drops the baseline (every screen then shows as
 * added), because it is not this change's fault. Visual changes never fail it.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const { renderApp, withEmulator, parseArgs } = require('./emulator');

const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const SKILL_DIR = path.join(REPO_ROOT, '.github', 'skills', 'visual-view-diff');
const { renderMarkdownReport } = require(path.join(SKILL_DIR, 'lib', 'report.js'));
const APP_PATH = 'badge-app/fluency';
const VIEW_PREFIX = 'badge-';

function git(args, options = {}) {
	return execFileSync('git', args, { cwd: REPO_ROOT, encoding: options.encoding ?? 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 64 * 1024 * 1024 });
}

function resolveBase(ref) {
	if (typeof ref !== 'string' || ref === '' || ref.startsWith('-')) { throw new Error('--base must be a git ref'); }
	return git(['merge-base', 'HEAD', ref]).trim();
}

/**
 * Copies one folder out of a commit, file by file through `git cat-file`, so
 * nothing at the base is checked out and no archive tool is needed. Returns
 * false when the folder does not exist at that commit (a new app).
 */
function exportTree(commit, repoPath, dest) {
	const listing = git(['ls-tree', '-r', '-z', '--full-tree', commit, '--', repoPath]);
	const entries = listing.split('\0').filter(Boolean);
	if (entries.length === 0) { return false; }
	for (const entry of entries) {
		const [meta, file] = entry.split('\t');
		const [mode, type, sha] = meta.split(' ');
		// Regular files only: a symlink or submodule at the base is not copied.
		if (type !== 'blob' || !/^100(644|755)$/.test(mode)) { continue; }
		const rel = path.posix.relative(repoPath, file);
		if (!rel || rel.startsWith('..') || path.posix.isAbsolute(rel)) { continue; }
		const target = path.join(dest, ...rel.split('/'));
		fs.mkdirSync(path.dirname(target), { recursive: true });
		fs.writeFileSync(target, git(['cat-file', 'blob', sha], { encoding: 'buffer' }));
	}
	return true;
}

/** Refuses to write through a symlinked output folder (a branch can commit one). */
function ensureDir(dir) {
	const stat = fs.lstatSync(dir, { throwIfNoEntry: false });
	if (stat && !stat.isDirectory()) { throw new Error(`${dir} exists and is not a plain directory; refusing to write into it.`); }
	fs.mkdirSync(dir, { recursive: true });
}

function copyPngs(fromDir, toDir) {
	if (!fs.existsSync(fromDir)) { return; }
	ensureDir(toDir);
	for (const name of fs.readdirSync(fromDir)) {
		if (name.startsWith(VIEW_PREFIX) && name.endsWith('.png')) {
			fs.copyFileSync(path.join(fromDir, name), path.join(toDir, name));
		}
	}
}

/** The webview report with its badge entries replaced by these comparisons. */
function mergeReports(existing, badge) {
	const keep = (existing?.comparisons || []).filter((c) => !String(c.view).startsWith(VIEW_PREFIX));
	const comparisons = [...keep, ...badge.comparisons];
	const count = (status) => comparisons.filter((c) => c.status === status).length;
	return {
		...(existing || {}),
		generatedAt: badge.generatedAt,
		threshold: existing?.threshold ?? badge.threshold,
		summary: { changed: count('changed'), unchanged: count('unchanged'), added: count('added'), removed: count('removed') },
		comparisons,
	};
}

/** Parses a JSON file, or returns null when it does not exist; read directly rather than checked first. */
function readJsonIfPresent(file) {
	try {
		return JSON.parse(fs.readFileSync(file, 'utf8'));
	} catch (error) {
		if (error.code === 'ENOENT') { return null; }
		throw error;
	}
}

async function main() {
	const args = parseArgs(process.argv.slice(2));
	const base = resolveBase(args.base || 'origin/main');
	const outRoot = path.resolve(args.out || path.join(REPO_ROOT, 'visual-output'));
	const work = fs.mkdtempSync(path.join(os.tmpdir(), 'badge-diff-'));
	const dirs = { baseline: path.join(work, 'baseline'), current: path.join(work, 'current'), diff: path.join(work, 'diff') };
	try {
		const baseApp = path.join(work, 'base-app', 'fluency');
		const hasBase = exportTree(base, APP_PATH, baseApp);
		console.log(`▶ Badge emulator: ${APP_PATH} at ${base.slice(0, 10)} vs working tree`);

		await withEmulator(async (env) => {
			if (hasBase) {
				try {
					await renderApp({ ...env, appDir: baseApp, appName: 'fluency', outDir: dirs.baseline });
				} catch (error) {
					console.warn(`::warning::The badge app does not run at the merge base, so there is no baseline: ${error.message.split('\n')[0]}`);
					fs.rmSync(dirs.baseline, { recursive: true, force: true });
				}
			}
			await renderApp({ ...env, appDir: path.join(REPO_ROOT, ...APP_PATH.split('/')), appName: 'fluency', outDir: dirs.current });
		});
		fs.mkdirSync(dirs.baseline, { recursive: true });

		execFileSync(process.execPath, [
			path.join(SKILL_DIR, 'diff-screenshots.js'),
			'--baseline', dirs.baseline, '--current', dirs.current, '--out', dirs.diff,
		], { cwd: REPO_ROOT, stdio: 'inherit' });

		ensureDir(outRoot);
		for (const name of ['baseline', 'current', 'diff']) { copyPngs(dirs[name], path.join(outRoot, name)); }
		const reportPath = path.join(outRoot, 'diff', 'report.json');
		const existing = readJsonIfPresent(reportPath);
		const badge = JSON.parse(fs.readFileSync(path.join(dirs.diff, 'report.json'), 'utf8'));
		const merged = mergeReports(existing, badge);
		fs.writeFileSync(reportPath, JSON.stringify(merged, null, 2) + '\n');
		fs.writeFileSync(path.join(outRoot, 'diff', 'report.md'), renderMarkdownReport(merged));
		console.log(`Report → ${path.relative(REPO_ROOT, path.join(outRoot, 'diff', 'report.md'))}`);
	} finally {
		fs.rmSync(work, { recursive: true, force: true });
	}
}

if (require.main === module) {
	main().catch((error) => {
		console.error(error.message || error);
		process.exit(1);
	});
}

module.exports = { exportTree, mergeReports };
