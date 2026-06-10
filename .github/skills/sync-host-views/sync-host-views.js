#!/usr/bin/env node
/*
 * sync-host-views.js
 * ------------------------------------------------------------------------
 * Keep the Visual Studio and JetBrains webview "views" (screens) in sync with
 * the VS Code views, WITHOUT silently changing which set of views each host
 * ships.
 *
 * The VS Code extension is the single source of truth for the set of webview
 * views: every entry in `vscode-extension/esbuild.js` -> `entryPoints` that maps
 * to `src/webview/<name>/main.ts` is one view, compiled to
 * `vscode-extension/dist/webview/<name>.js`.
 *
 * The Visual Studio and JetBrains hosts each load a *subset* of those compiled
 * bundles (currently 6 of 9). They deliberately do NOT ship every view. This
 * script:
 *
 *   1. Detects, per host, which views are TRACKED, which are NEW (present in
 *      VS Code but not yet wired into the host), and which are ORPHAN (listed by
 *      the host but no longer produced by VS Code).
 *   2. For Visual Studio, whose bundles are committed to the repo, flags any
 *      committed bundle that is STALE relative to the freshly built dist bundle.
 *   3. With `--refresh`, copies ONLY the already-tracked bundles from dist into
 *      the Visual Studio committed `webview/` folder. It never adds a new view —
 *      adding a view is a human decision (see SKILL.md).
 *
 * Dependency-free. Node >= 16.
 *
 * Exit codes:
 *   0  everything in sync (and, with --refresh, nothing left stale)
 *   1  drift that the agent can fix mechanically (stale VS bundles, orphan
 *      entries, or host include-list vs committed-file mismatch)
 *   2  environment / configuration error (a source file was not found)
 *   3  NEW views detected — a human must decide whether to add them. Takes
 *      precedence over exit 1.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ── Repo layout ──────────────────────────────────────────────────────────────
// This file lives at <repo>/.github/skills/sync-host-views/sync-host-views.js
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');

const PATHS = {
  esbuild: path.join(REPO_ROOT, 'vscode-extension', 'esbuild.js'),
  distWebview: path.join(REPO_ROOT, 'vscode-extension', 'dist', 'webview'),
  vsCsproj: path.join(
    REPO_ROOT, 'visualstudio-extension', 'src', 'CopilotTokenTracker',
    'CopilotTokenTracker.csproj',
  ),
  vsCommittedWebview: path.join(
    REPO_ROOT, 'visualstudio-extension', 'src', 'CopilotTokenTracker', 'webview',
  ),
  jbGradle: path.join(REPO_ROOT, 'jetbrains-plugin', 'build.gradle.kts'),
};

// ── Tiny ANSI helpers ────────────────────────────────────────────────────────
const useColour = process.stdout.isTTY && !process.argv.includes('--json');
const c = (code, s) => (useColour ? `\x1b[${code}m${s}\x1b[0m` : s);
const red = (s) => c('31', s);
const green = (s) => c('32', s);
const yellow = (s) => c('33', s);
const cyan = (s) => c('36', s);
const bold = (s) => c('1', s);

class ConfigError extends Error {}

function read(file) {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch (e) {
    throw new ConfigError(`Cannot read ${path.relative(REPO_ROOT, file)}: ${e.message}`);
  }
}

// ── Parsers ──────────────────────────────────────────────────────────────────

/**
 * Canonical view set: every entryPoint in esbuild.js that points at
 * `src/webview/<name>/main.ts`. The key (left of the colon) is the bundle name.
 */
function parseCanonicalViews() {
  const src = read(PATHS.esbuild);
  const re = /(['"]?)([\w-]+)\1\s*:\s*['"]src\/webview\/[^'"]+['"]/g;
  const views = new Set();
  let m;
  while ((m = re.exec(src)) !== null) {
    views.add(m[2]);
  }
  if (views.size === 0) {
    throw new ConfigError(
      'No webview entryPoints found in esbuild.js — has the entryPoints block moved?',
    );
  }
  return views;
}

/** Built artifacts actually present in dist/webview (name -> absolute path). */
function listDistBundles() {
  const out = new Map();
  let entries;
  try {
    entries = fs.readdirSync(PATHS.distWebview);
  } catch {
    return out; // dist not built yet
  }
  for (const f of entries) {
    if (f.endsWith('.js') && !f.endsWith('.js.map')) {
      out.set(f.slice(0, -3), path.join(PATHS.distWebview, f));
    }
  }
  return out;
}

/** Visual Studio host include list, from the csproj `_WebviewBundle` items. */
function parseVsCsprojViews() {
  const src = read(PATHS.vsCsproj);
  const re = /_WebviewBundle\s+Include="[^"]*[\\/]dist[\\/]webview[\\/]([\w-]+)\.js"/g;
  const views = new Set();
  let m;
  while ((m = re.exec(src)) !== null) {
    views.add(m[1]);
  }
  return views;
}

/** Visual Studio committed bundles actually checked into webview/ (name -> path). */
function listVsCommittedBundles() {
  const out = new Map();
  let entries;
  try {
    entries = fs.readdirSync(PATHS.vsCommittedWebview);
  } catch {
    return out;
  }
  for (const f of entries) {
    if (f.endsWith('.js') && !f.endsWith('.js.map')) {
      out.set(f.slice(0, -3), path.join(PATHS.vsCommittedWebview, f));
    }
  }
  return out;
}

/**
 * JetBrains host include list. Finds the `from("…/vscode-extension/dist/webview")`
 * block inside build.gradle.kts and extracts the `*.js` names from its
 * `include(...)` call.
 */
function parseJetBrainsViews() {
  const src = read(PATHS.jbGradle);
  // Locate the from-block that targets the VS Code dist/webview folder.
  const fromIdx = src.search(/from\([^)]*vscode-extension\/dist\/webview[^)]*\)\s*\{/);
  if (fromIdx === -1) {
    throw new ConfigError(
      'Could not find the vscode-extension/dist/webview copy block in build.gradle.kts.',
    );
  }
  // Grab the brace-delimited body following that from(...).
  const braceStart = src.indexOf('{', fromIdx);
  const body = src.slice(braceStart, src.indexOf('}', braceStart));
  const incMatch = body.match(/include\(([^)]*)\)/);
  if (!incMatch) {
    throw new ConfigError(
      'JetBrains webview copy block has no include(...) call.',
    );
  }
  const views = new Set();
  const re = /["']([\w-]+)\.js["']/g;
  let m;
  while ((m = re.exec(incMatch[1])) !== null) {
    views.add(m[1]);
  }
  return views;
}

function sha256(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

// ── Analysis ─────────────────────────────────────────────────────────────────

function analyse() {
  const canonical = parseCanonicalViews();
  const dist = listDistBundles();
  const vsList = parseVsCsprojViews();
  const vsCommitted = listVsCommittedBundles();
  const jbList = parseJetBrainsViews();

  const sortV = (set) => [...set].sort();

  // Per-host classification against the canonical VS Code view set.
  const classify = (hostSet) => ({
    tracked: sortV(new Set([...hostSet].filter((v) => canonical.has(v)))),
    // NEW = produced by VS Code but the host does not ship it yet.
    newViews: sortV(new Set([...canonical].filter((v) => !hostSet.has(v)))),
    // ORPHAN = host references a view VS Code no longer produces.
    orphan: sortV(new Set([...hostSet].filter((v) => !canonical.has(v)))),
  });

  const vs = classify(vsList);
  const jb = classify(jbList);

  // VS-specific: committed bundle vs dist freshness + list/file consistency.
  const vsStale = []; // tracked, committed exists, differs from dist
  const vsMissingCommitted = []; // in csproj list but no committed file
  const vsUntrackedCommitted = []; // committed file not in csproj list
  const vsNoDist = []; // tracked but dist not built (cannot verify/refresh)

  for (const v of vs.tracked) {
    const distPath = dist.get(v);
    const comPath = vsCommitted.get(v);
    if (!comPath) {
      vsMissingCommitted.push(v);
      continue;
    }
    if (!distPath) {
      vsNoDist.push(v);
      continue;
    }
    if (sha256(distPath) !== sha256(comPath)) {
      vsStale.push(v);
    }
  }
  for (const v of vsCommitted.keys()) {
    if (!vsList.has(v)) vsUntrackedCommitted.push(v);
  }
  vsUntrackedCommitted.sort();

  return {
    canonical: sortV(canonical),
    distAvailable: dist.size > 0,
    vs,
    jb,
    vsStale,
    vsMissingCommitted,
    vsUntrackedCommitted,
    vsNoDist,
    _dist: dist,
    _vsCommitted: vsCommitted,
  };
}

// ── Refresh (VS committed bundles only; never adds a view) ──────────────────

function refreshVs(result) {
  if (!result.distAvailable) {
    throw new ConfigError(
      'dist/webview is empty — build it first: (cd vscode-extension && npm run package).',
    );
  }
  const updated = [];
  for (const v of result.vs.tracked) {
    const distPath = result._dist.get(v);
    if (!distPath) continue; // already reported as vsNoDist
    const destPath = path.join(PATHS.vsCommittedWebview, `${v}.js`);
    const before = fs.existsSync(destPath) ? sha256(destPath) : null;
    fs.copyFileSync(distPath, destPath);
    if (before !== sha256(destPath)) updated.push(v);
  }
  return updated;
}

// ── Reporting ────────────────────────────────────────────────────────────────

function decideExit(result) {
  if (result.vs.newViews.length || result.jb.newViews.length) return 3;
  if (
    result.vsStale.length ||
    result.vsMissingCommitted.length ||
    result.vsUntrackedCommitted.length ||
    result.vs.orphan.length ||
    result.jb.orphan.length
  ) {
    return 1;
  }
  return 0;
}

function printReport(result, refreshed) {
  const rel = (set) => (set.length ? set.join(', ') : '(none)');

  console.log(bold('\nHost view sync report'));
  console.log('-'.repeat(60));
  console.log(`Canonical VS Code views (${result.canonical.length}): ${cyan(result.canonical.join(', '))}`);
  console.log(`dist/webview built: ${result.distAvailable ? green('yes') : red('NO — run npm run package')}`);

  for (const [name, h] of [['Visual Studio', result.vs], ['JetBrains', result.jb]]) {
    console.log(bold(`\n${name}`));
    console.log(`  tracked (${h.tracked.length}): ${h.tracked.join(', ') || '(none)'}`);
    if (h.newViews.length) {
      console.log(`  ${yellow('NEW — ask the user before adding')}: ${yellow(rel(h.newViews))}`);
    } else {
      console.log(`  new views: ${green('none')}`);
    }
    if (h.orphan.length) {
      console.log(`  ${red('ORPHAN — listed but VS Code no longer builds it')}: ${red(rel(h.orphan))}`);
    }
  }

  console.log(bold('\nVisual Studio committed-bundle health'));
  if (refreshed) {
    console.log(`  ${green('refreshed')}: ${refreshed.length ? refreshed.join(', ') : '(already up to date)'}`);
  } else {
    console.log(`  stale vs dist: ${result.vsStale.length ? yellow(result.vsStale.join(', ')) : green('none')}`);
  }
  if (result.vsNoDist.length) {
    console.log(`  ${yellow('cannot verify (dist bundle missing)')}: ${result.vsNoDist.join(', ')}`);
  }
  if (result.vsMissingCommitted.length) {
    console.log(`  ${red('in csproj but no committed file')}: ${result.vsMissingCommitted.join(', ')}`);
  }
  if (result.vsUntrackedCommitted.length) {
    console.log(`  ${red('committed file not in csproj list')}: ${result.vsUntrackedCommitted.join(', ')}`);
  }

  const code = refreshed ? decideExit({ ...result, vsStale: [] }) : decideExit(result);
  console.log('-'.repeat(60));
  if (code === 0) {
    console.log(green('[OK] Hosts are in sync with the VS Code views.'));
  } else if (code === 3) {
    console.log(yellow('[NEW] New VS Code views detected. Do NOT auto-add them — ask the user (see SKILL.md).'));
  } else {
    console.log(yellow('[DRIFT] Mechanical drift detected. Run with --refresh, or fix the host lists (see SKILL.md).'));
  }
  console.log('');
}

// ── CLI ──────────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`sync-host-views — keep VS / JetBrains views in sync with VS Code

Usage:
  node .github/skills/sync-host-views/sync-host-views.js [--refresh] [--json]

Options:
  --refresh   Copy already-tracked bundles from vscode-extension/dist/webview
              into the Visual Studio committed webview/ folder. Never adds a
              new view (that is a human decision).
  --json      Emit machine-readable JSON instead of a report.
  --help      Show this help.

Exit codes: 0 in sync · 1 mechanical drift · 2 config error · 3 NEW views (ask user)`);
    return 0;
  }

  let result;
  try {
    result = analyse();
  } catch (e) {
    if (e instanceof ConfigError) {
      console.error(red(`config error: ${e.message}`));
      return 2;
    }
    throw e;
  }

  let refreshed = null;
  if (args.includes('--refresh')) {
    try {
      refreshed = refreshVs(result);
    } catch (e) {
      if (e instanceof ConfigError) {
        console.error(red(`config error: ${e.message}`));
        return 2;
      }
      throw e;
    }
  }

  if (args.includes('--json')) {
    const code = refreshed ? decideExit({ ...result, vsStale: [] }) : decideExit(result);
    const { _dist, _vsCommitted, ...clean } = result;
    console.log(JSON.stringify({ ...clean, refreshed, exitCode: code }, null, 2));
    return code;
  }

  printReport(result, refreshed);
  return refreshed ? decideExit({ ...result, vsStale: [] }) : decideExit(result);
}

process.exit(main());
