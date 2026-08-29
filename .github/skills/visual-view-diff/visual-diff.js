#!/usr/bin/env node
'use strict';

/**
 * End-to-end visual comparison: builds the webviews at a baseline commit and at
 * the working tree, renders both, and reports which views changed.
 *
 * Usage:
 *   node visual-diff.js [--base <ref>] [--out <dir>] [--theme dark|light|both] [--view <id>]
 *
 * The baseline is built in a detached `git worktree`, so the working tree is
 * never touched — no stashing, no checking out another branch under the user's
 * feet. `node_modules` is symlinked into that worktree rather than installed
 * again, which turns a multi-minute npm install into a few seconds.
 *
 * This produces images and a Markdown report. It does not post them anywhere;
 * see SKILL.md for why that boundary exists.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const { REPO_ROOT } = require('./lib/harness');
const { parseArgs } = require('./lib/config');

const SKILL_DIR = __dirname;

function git(args, options = {}) {
	return execFileSync('git', args, {
		cwd: REPO_ROOT,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
		...options,
	}).trim();
}

function run(command, args, cwd) {
	execFileSync(command, args, { cwd, stdio: 'inherit' });
}

/**
 * Picks the commit to compare against.
 *
 * A branch's merge base — not the tip of main — is the right baseline: it is
 * the state the branch actually started from, so unrelated changes that landed
 * on main since then do not show up as "visual changes in this PR".
 */
function resolveBaseRef(requested) {
	const candidates = requested ? [requested] : ['origin/main', 'main'];
	for (const candidate of candidates) {
		try {
			git(['rev-parse', '--verify', `${candidate}^{commit}`]);
		} catch {
			continue;
		}
		try {
			return { ref: candidate, sha: git(['merge-base', 'HEAD', candidate]) };
		} catch {
			return { ref: candidate, sha: git(['rev-parse', `${candidate}^{commit}`]) };
		}
	}
	throw new Error(
		`Could not resolve a baseline commit from ${candidates.join(', ')}. Pass one explicitly with --base <ref>.`,
	);
}

function buildWebviews(checkoutRoot, label) {
	const extensionDir = path.join(checkoutRoot, 'vscode-extension');
	const nodeModules = path.join(extensionDir, 'node_modules');

	if (!fs.existsSync(nodeModules)) {
		// Reuse the working tree's install: esbuild is the only thing the bundle
		// build needs, and dependencies rarely differ across a single PR.
		const source = path.join(REPO_ROOT, 'vscode-extension', 'node_modules');
		if (!fs.existsSync(source)) {
			throw new Error(`vscode-extension/node_modules is missing — run \`npm install\` in vscode-extension/ first.`);
		}
		fs.symlinkSync(source, nodeModules, 'dir');
	}

	console.log(`\n▶ Building webview bundles (${label})…`);
	// esbuild only — `npm run compile` would also run tsc and eslint, which are
	// irrelevant to how a view looks and would fail the baseline build for
	// reasons that have nothing to do with this comparison.
	run(process.execPath, ['esbuild.js'], extensionDir);
}

function renderInto(outDir, { distDir, repoRoot, theme, view }) {
	const args = [path.join(SKILL_DIR, 'render-views.js'), '--out', outDir, '--dist', distDir, '--repo-root', repoRoot];
	if (theme) { args.push('--theme', theme); }
	if (view) { args.push('--view', view); }
	run(process.execPath, args, REPO_ROOT);
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	const outRoot = path.resolve(args.out || path.join(REPO_ROOT, 'visual-output'));
	const theme = args.theme || 'dark';
	const view = typeof args.view === 'string' ? args.view : undefined;

	const base = resolveBaseRef(typeof args.base === 'string' ? args.base : undefined);
	console.log(`Baseline: ${base.sha.slice(0, 12)} (merge base with ${base.ref})`);

	const baselineDir = path.join(outRoot, 'baseline');
	const currentDir = path.join(outRoot, 'current');
	const diffDir = path.join(outRoot, 'diff');
	for (const dir of [baselineDir, currentDir, diffDir]) {
		fs.rmSync(dir, { recursive: true, force: true });
		fs.mkdirSync(dir, { recursive: true });
	}

	const worktreeDir = path.join(outRoot, '.baseline-worktree');
	fs.rmSync(worktreeDir, { recursive: true, force: true });

	try {
		console.log(`\n▶ Checking out the baseline into a temporary worktree…`);
		git(['worktree', 'add', '--detach', worktreeDir, base.sha]);

		buildWebviews(worktreeDir, 'baseline');
		console.log(`\n▶ Rendering baseline views…`);
		renderInto(baselineDir, {
			distDir: path.join(worktreeDir, 'vscode-extension', 'dist', 'webview'),
			repoRoot: worktreeDir,
			theme,
			view,
		});

		buildWebviews(REPO_ROOT, 'working tree');
		console.log(`\n▶ Rendering current views…`);
		renderInto(currentDir, {
			distDir: path.join(REPO_ROOT, 'vscode-extension', 'dist', 'webview'),
			repoRoot: REPO_ROOT,
			theme,
			view,
		});

		console.log(`\n▶ Comparing…`);
		run(process.execPath, [
			path.join(SKILL_DIR, 'diff-screenshots.js'),
			'--baseline', baselineDir,
			'--current', currentDir,
			'--out', diffDir,
		], REPO_ROOT);
	} finally {
		// Always remove the worktree, or the next run trips over a stale one.
		try {
			git(['worktree', 'remove', '--force', worktreeDir]);
		} catch {
			fs.rmSync(worktreeDir, { recursive: true, force: true });
			try { git(['worktree', 'prune']); } catch { /* best effort */ }
		}
	}

	console.log(`\nScreenshots and report are under ${path.relative(process.cwd(), outRoot) || outRoot}/`);
}

if (require.main === module) {
	try {
		main();
	} catch (error) {
		console.error(`\n${error && error.message || error}`);
		process.exit(1);
	}
}
