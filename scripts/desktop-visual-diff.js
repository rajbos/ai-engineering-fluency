#!/usr/bin/env node
'use strict';

/**
 * Desktop app visual diff: screenshots every desktop panel at the merge base and
 * at the working tree, compares them and adds the result to the visual-view-diff
 * report, so desktop changes show up in the same CI screenshot comment as the
 * webviews and the badge screens.
 *
 * Usage (from the repo root):
 *   node scripts/desktop-visual-diff.js [--base origin/main] [--out visual-output]
 *
 * Both sides are rendered by scripts/validate-desktop-render.js (the headless
 * render check) with --screenshots, over the same fixture sessions, with the same
 * pinned clock and the same work folder, so only the code differs between them.
 * The baseline is built in a detached `git worktree` with this checkout's
 * node_modules linked in (dependencies rarely differ within one PR); the working
 * tree is never touched.
 *
 * Writes `desktop-*` PNGs into <out>/baseline, <out>/current and <out>/diff next to
 * whatever the webview diff put there, and merges its comparisons into
 * <out>/diff/report.json and report.md (replacing earlier desktop entries, keeping
 * the others). Run it after visual-diff.js, which clears <out> when it starts.
 *
 * Needs the dependencies of vscode-extension/, cli/ and desktop/ installed, and
 * Playwright (see .github/skills/visual-view-diff/lib/browser.js). Builds both
 * sides itself. Opens no editor or Electron window.
 *
 * Exits non-zero when the working tree's panels fail to build or render. A failure
 * at the merge base only drops the baseline (every panel then shows as added),
 * because it is not this change's fault. Visual changes never fail it.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync, spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKILL_DIR = path.join(REPO_ROOT, '.github', 'skills', 'visual-view-diff');
const { renderMarkdownReport, mergeReportSection } = require(path.join(SKILL_DIR, 'lib', 'report.js'));
const { buildEnv } = require(path.join(SKILL_DIR, 'visual-diff.js'));
const RENDER_SCRIPT = path.join(__dirname, 'validate-desktop-render.js');

const VIEW_PREFIX = 'desktop-';
/** Packages whose node_modules the desktop build and the page builder resolve from. */
const PACKAGES = ['vscode-extension', 'cli', 'desktop'];

function git(args) {
  return execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const name = argv[i].replace(/^--/, '');
    if (!['base', 'out'].includes(name) || argv[i] === name) { throw new Error(`Unknown option: ${argv[i]}`); }
    const value = argv[++i];
    if (value === undefined || value.startsWith('--')) { throw new Error(`--${name} needs a value`); }
    args[name] = value;
  }
  return args;
}

function resolveBase(ref) {
  if (ref.startsWith('-')) { throw new Error('--base must be a git ref'); }
  return git(['merge-base', 'HEAD', ref]);
}

/** Refuses to write through a symlinked output folder (a branch can commit one). */
function ensureDir(dir) {
  const stat = fs.lstatSync(dir, { throwIfNoEntry: false });
  if (stat && !stat.isDirectory()) { throw new Error(`${dir} exists and is not a plain directory; refusing to write into it.`); }
  fs.mkdirSync(dir, { recursive: true });
}

/** Builds one checkout's extension webview bundles and then the desktop app (which copies them). */
function buildDesktop(root, label) {
  console.log(`\n▶ Building the desktop app (${label})…`);
  for (const dir of ['vscode-extension', 'desktop']) {
    // esbuild.js directly: older revisions' `compile` scripts also type-check and lint.
    execFileSync(process.execPath, ['esbuild.js'], { cwd: path.join(root, dir), stdio: 'inherit', env: buildEnv() });
  }
}

/** Screenshots one checkout's panels into `outDir`. Returns whether the render check passed. */
function renderSide(root, outDir, { now, workDir, label }) {
  console.log(`\n▶ Rendering the desktop panels (${label})…`);
  // The same work folder for both sides, so file paths shown in a panel match.
  fs.rmSync(workDir, { recursive: true, force: true });
  const run = spawnSync(process.execPath, [
    RENDER_SCRIPT, '--repo-root', root, '--screenshots', outDir, '--now', String(now), '--work', workDir,
  ], { cwd: REPO_ROOT, stdio: 'inherit' });
  fs.rmSync(workDir, { recursive: true, force: true });
  return run.status === 0;
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

/** Parses a JSON file, or returns null when it does not exist. */
function readJsonIfPresent(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    if (error.code === 'ENOENT') { return null; }
    throw error;
  }
}

/** Links this checkout's node_modules into the baseline worktree. */
function linkDependencies(worktree) {
  for (const pkg of PACKAGES) {
    const source = path.join(REPO_ROOT, pkg, 'node_modules');
    if (!fs.existsSync(source)) { throw new Error(`${pkg}/node_modules is missing — run \`pnpm install\` in ${pkg}/ first.`); }
    const target = path.join(worktree, pkg, 'node_modules');
    // A base commit without that package has nothing to link into.
    if (fs.existsSync(path.dirname(target)) && !fs.existsSync(target)) {
      // 'junction' needs no privilege on Windows and is ignored elsewhere.
      fs.symlinkSync(source, target, 'junction');
    }
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const base = resolveBase(args.base || 'origin/main');
  const outRoot = path.resolve(args.out || path.join(REPO_ROOT, 'visual-output'));
  ensureDir(outRoot);
  // Inside the output root (git-ignored), never the OS temp directory: the session
  // readers refuse files there, so the fixture HOME would read as empty.
  const work = path.join(outRoot, '.desktop-diff');
  fs.rmSync(work, { recursive: true, force: true });
  const dirs = { baseline: path.join(work, 'baseline'), current: path.join(work, 'current'), diff: path.join(work, 'diff') };
  const worktree = path.join(work, 'base-checkout');
  const renderWork = path.join(work, 'render');
  // One clock for both sides, so "today" and "last updated" are the same pixels.
  const now = Date.now();
  let currentOk = false;
  console.log(`▶ Desktop app: ${base.slice(0, 10)} (merge base) vs working tree`);
  try {
    fs.mkdirSync(work, { recursive: true });
    git(['worktree', 'add', '--detach', worktree, base]);
    try {
      linkDependencies(worktree);
      buildDesktop(worktree, 'baseline');
      if (!renderSide(worktree, dirs.baseline, { now, workDir: renderWork, label: 'baseline' })) {
        console.warn('::warning::The desktop panels did not render cleanly at the merge base; its screenshots are still compared.');
      }
    } catch (error) {
      console.warn(`::warning::The desktop app does not build or render at the merge base, so there is no baseline: ${String(error.message).split('\n')[0]}`);
      fs.rmSync(dirs.baseline, { recursive: true, force: true });
    }
    fs.mkdirSync(dirs.baseline, { recursive: true });

    buildDesktop(REPO_ROOT, 'working tree');
    currentOk = renderSide(REPO_ROOT, dirs.current, { now, workDir: renderWork, label: 'working tree' });

    execFileSync(process.execPath, [
      path.join(SKILL_DIR, 'diff-screenshots.js'),
      '--baseline', dirs.baseline, '--current', dirs.current, '--out', dirs.diff,
    ], { cwd: REPO_ROOT, stdio: 'inherit' });

    for (const name of ['baseline', 'current', 'diff']) { copyPngs(dirs[name], path.join(outRoot, name)); }
    ensureDir(path.join(outRoot, 'diff'));
    const reportPath = path.join(outRoot, 'diff', 'report.json');
    const desktop = JSON.parse(fs.readFileSync(path.join(dirs.diff, 'report.json'), 'utf8'));
    const merged = mergeReportSection(readJsonIfPresent(reportPath), desktop, VIEW_PREFIX);
    fs.writeFileSync(reportPath, JSON.stringify(merged, null, 2) + '\n');
    fs.writeFileSync(path.join(outRoot, 'diff', 'report.md'), renderMarkdownReport(merged));
    console.log(`Report → ${path.relative(REPO_ROOT, path.join(outRoot, 'diff', 'report.md'))}`);
  } finally {
    // Drop the links first, so removing the worktree can never reach into this
    // checkout's own node_modules (a non-recursive rm removes the link itself).
    for (const pkg of PACKAGES) {
      const link = path.join(worktree, pkg, 'node_modules');
      if (fs.lstatSync(link, { throwIfNoEntry: false })?.isSymbolicLink()) { fs.rmSync(link); }
    }
    try {
      git(['worktree', 'remove', '--force', worktree]);
    } catch {
      fs.rmSync(worktree, { recursive: true, force: true });
      try { git(['worktree', 'prune']); } catch { /* best effort */ }
    }
    fs.rmSync(work, { recursive: true, force: true });
  }
  if (!currentOk) {
    throw new Error('The desktop panels did not render cleanly in the working tree (see the render check output above).');
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(error.message || error);
    process.exit(1);
  });
}

module.exports = { parseArgs };
