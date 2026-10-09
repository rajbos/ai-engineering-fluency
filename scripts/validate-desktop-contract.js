#!/usr/bin/env node

/**
 * Desktop App Webview Message Contract Validation
 *
 * The desktop app (desktop/) reuses the VS Code extension's webview bundles
 * verbatim, but answers their messages with its own hand-written switch in
 * `registerIpcHandlers` (desktop/src/main.ts). A button added to a shared view
 * therefore lands in the desktop app as a control that does nothing when
 * clicked — nothing fails to compile and `npm run check:contract` (which only
 * looks at the extension host) stays green.
 *
 * This script closes that gap. For every view the desktop bundles
 * (`WEBVIEW_BUNDLES` in desktop/esbuild.js), it walks the view's import graph
 * from `vscode-extension/src/webview/<view>/main.ts`, collects every `command`
 * the view can post, and requires each one to be either:
 *
 *   - handled in desktop/src/main.ts, or
 *   - listed in desktop/src/unsupportedWebviewCommands.json with a reason and a
 *     status: 'hidden' (with the CSS selectors that hide its controls), 'gap'
 *     (the control is still visible and dead — recorded, not decided) or
 *     'no-op' (a background notice with no control, safe to ignore).
 *
 * The same JSON drives the hidden-controls CSS in main.ts, so the list of
 * hidden controls and the list of unhandled commands cannot drift apart. The
 * check also fails on stale entries — a command that is now handled, or no
 * longer posted by any desktop view, or a selector whose id/class no longer
 * appears in the views' sources — so the list shrinks as gaps are closed.
 *
 * Usage:
 *   node scripts/validate-desktop-contract.js [--json]
 *
 * Exits 1 on any finding, 2 on a configuration error.
 */

const fs = require('fs');
const path = require('path');
const { collectPostedCommands, collectHandledCommandsFromAst } = require('./validate-webview-contract.js');

const REPO_ROOT = path.resolve(__dirname, '..');
const DESKTOP_DIR = path.join(REPO_ROOT, 'desktop');
const EXT_WEBVIEW_DIR = path.join(REPO_ROOT, 'vscode-extension', 'src', 'webview');
const DESKTOP_MAIN = path.join(DESKTOP_DIR, 'src', 'main.ts');
const UNSUPPORTED_FILE = path.join(DESKTOP_DIR, 'src', 'unsupportedWebviewCommands.json');

const STATUSES = ['hidden', 'gap', 'no-op'];

class ConfigError extends Error {}

/** View names the desktop app bundles, from `WEBVIEW_BUNDLES` in desktop/esbuild.js. */
function readDesktopViews() {
  const src = fs.readFileSync(path.join(DESKTOP_DIR, 'esbuild.js'), 'utf8');
  const block = src.match(/const\s+WEBVIEW_BUNDLES\s*=\s*\[([\s\S]*?)\]/);
  if (!block) {
    throw new ConfigError('Could not find WEBVIEW_BUNDLES in desktop/esbuild.js — has it moved?');
  }
  const views = [...block[1].matchAll(/['"]([\w-]+)\.js['"]/g)].map((m) => m[1]);
  if (views.length === 0) {
    throw new ConfigError('WEBVIEW_BUNDLES in desktop/esbuild.js lists no bundles.');
  }
  return views;
}

/** Resolves a relative import specifier to a .ts file, or undefined for non-TS targets. */
function resolveImport(fromFile, specifier) {
  const base = path.resolve(path.dirname(fromFile), specifier);
  for (const candidate of [base, `${base}.ts`, path.join(base, 'index.ts')]) {
    if (candidate.endsWith('.ts') && fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return candidate;
    }
  }
  return undefined;
}

/**
 * Every .ts file reachable from `entry` through relative imports — the
 * sources esbuild compiles into that view's bundle. Shared webview helpers
 * only count for the views that actually import them.
 */
function collectViewFiles(entry) {
  const seen = new Set();
  const stack = [entry];
  const importPattern = /(?:import|export)\s[^'"]*?from\s*['"](\.[^'"]+)['"]|import\s*\(\s*['"](\.[^'"]+)['"]\s*\)|import\s+['"](\.[^'"]+)['"]/g;
  while (stack.length > 0) {
    const file = stack.pop();
    if (seen.has(file)) {
      continue;
    }
    seen.add(file);
    const text = fs.readFileSync(file, 'utf8');
    for (const match of text.matchAll(importPattern)) {
      const resolved = resolveImport(file, match[1] || match[2] || match[3]);
      if (resolved && !seen.has(resolved)) {
        stack.push(resolved);
      }
    }
  }
  return [...seen];
}

function readUnsupported() {
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(UNSUPPORTED_FILE, 'utf8'));
  } catch (e) {
    throw new ConfigError(`Cannot read ${path.relative(REPO_ROOT, UNSUPPORTED_FILE)}: ${e.message}`);
  }
  const commands = parsed.commands || {};
  for (const [command, entry] of Object.entries(commands)) {
    const where = `unsupportedWebviewCommands.json: '${command}'`;
    if (!entry || typeof entry.reason !== 'string' || !entry.reason.trim()) {
      throw new ConfigError(`${where} needs a non-empty "reason".`);
    }
    if (!STATUSES.includes(entry.status)) {
      throw new ConfigError(`${where} has status '${entry.status}'; expected one of ${STATUSES.join(', ')}.`);
    }
    const hidden = Array.isArray(entry.hiddenBy) && entry.hiddenBy.length > 0;
    if ((entry.status === 'hidden') !== hidden) {
      throw new ConfigError(`${where}: "hiddenBy" selectors are required for status 'hidden' and not allowed otherwise.`);
    }
    entry.hiddenBy = entry.hiddenBy || [];
  }
  return commands;
}

/** The identifier a simple `#id` / `.class` selector targets, as it would appear in source. */
function selectorToken(selector) {
  const match = selector.trim().match(/^[#.]([\w-]+)$/);
  return match ? match[1] : undefined;
}

function analyse() {
  const views = readDesktopViews();
  const unsupported = readUnsupported();
  const handled = collectHandledCommandsFromAst([DESKTOP_MAIN]);

  /** command -> { views: Set, locations: [] } */
  const posted = new Map();
  const allViewFiles = new Set();
  for (const view of views) {
    const entry = path.join(EXT_WEBVIEW_DIR, view, 'main.ts');
    if (!fs.existsSync(entry)) {
      throw new ConfigError(`Desktop bundles '${view}.js' but ${path.relative(REPO_ROOT, entry)} does not exist.`);
    }
    const files = collectViewFiles(entry);
    files.forEach((f) => allViewFiles.add(f));
    for (const [command, locations] of collectPostedCommands(files)) {
      if (!posted.has(command)) {
        posted.set(command, { views: new Set(), locations: [] });
      }
      const record = posted.get(command);
      record.views.add(view);
      for (const loc of locations) {
        if (!record.locations.some((l) => l.file === loc.file && l.line === loc.line)) {
          record.locations.push(loc);
        }
      }
    }
  }

  const findings = [];

  for (const [command, { views: postedBy, locations }] of [...posted].sort(([a], [b]) => a.localeCompare(b))) {
    if (handled.has(command) || Object.prototype.hasOwnProperty.call(unsupported, command)) {
      continue;
    }
    findings.push({
      kind: 'unhandled',
      command,
      locations,
      detail:
        `posted by the ${[...postedBy].sort().join(', ')} view(s), but desktop/src/main.ts has no handler — ` +
        'the control does nothing in the desktop app. Handle it in registerIpcHandlers, or list it in ' +
        'desktop/src/unsupportedWebviewCommands.json with a status and reason.',
    });
  }

  const sourceText = [...allViewFiles].map((f) => fs.readFileSync(f, 'utf8')).join('\n');
  for (const [command, entry] of Object.entries(unsupported).sort(([a], [b]) => a.localeCompare(b))) {
    if (handled.has(command)) {
      findings.push({
        kind: 'stale',
        command,
        detail: 'is handled in desktop/src/main.ts now — remove it (and its hidden selectors) from unsupportedWebviewCommands.json',
      });
    } else if (!posted.has(command)) {
      findings.push({
        kind: 'stale',
        command,
        detail: 'is no longer posted by any view the desktop bundles — remove it from unsupportedWebviewCommands.json',
      });
    }
    for (const selector of entry.hiddenBy) {
      const token = selectorToken(selector);
      if (!token) {
        findings.push({
          kind: 'selector',
          command,
          detail: `hides '${selector}', which is not a simple #id or .class selector the check can verify`,
        });
      } else if (!new RegExp(`(^|[^\\w-])${token}([^\\w-]|$)`).test(sourceText)) {
        findings.push({
          kind: 'selector',
          command,
          detail: `hides '${selector}', but '${token}' no longer appears in the desktop views' sources — the selector hides nothing`,
        });
      }
    }
  }

  return {
    views,
    postedCount: posted.size,
    handled: [...posted.keys()].filter((c) => handled.has(c)).sort(),
    knownGaps: Object.entries(unsupported)
      .filter(([, e]) => e.status === 'gap')
      .map(([c]) => c)
      .sort(),
    findings,
  };
}

function annotate(finding) {
  if (process.env.GITHUB_ACTIONS !== 'true') {
    return;
  }
  const where = finding.locations?.[0];
  const file = where ? where.file : path.relative(REPO_ROOT, UNSUPPORTED_FILE);
  const line = where ? where.line : 1;
  console.log(`::error file=${file},line=${line}::${`desktop: '${finding.command}' ${finding.detail}`.replace(/\n/g, '%0A')}`);
}

function main() {
  let result;
  try {
    result = analyse();
  } catch (e) {
    if (e instanceof ConfigError) {
      console.error(`❌ ${e.message}`);
      process.exit(2);
    }
    throw e;
  }

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify({ ok: result.findings.length === 0, ...result }, null, 2));
    process.exit(result.findings.length === 0 ? 0 : 1);
  }

  console.log('🔌 Desktop app webview message contract\n');
  console.log(`   Views bundled: ${result.views.join(', ')}`);
  console.log(`   Commands posted: ${result.postedCount}, handled by the desktop: ${result.handled.length}`);
  if (result.knownGaps.length > 0) {
    console.log(`   ⚠️  Known gaps (visible, unhandled): ${result.knownGaps.join(', ')}`);
  }
  console.log('');

  if (result.findings.length > 0) {
    for (const finding of result.findings) {
      console.error(`❌ '${finding.command}' ${finding.detail}`);
      for (const location of finding.locations || []) {
        console.error(`     posted at ${location.file}:${location.line}`);
      }
      annotate(finding);
    }
    console.error('\n❌ Desktop webview message contract validation failed!\n');
    process.exit(1);
  }

  console.log('✅ Every message a desktop view can post is handled or explicitly listed as unsupported.\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}

module.exports = { readDesktopViews, collectViewFiles, analyse };
