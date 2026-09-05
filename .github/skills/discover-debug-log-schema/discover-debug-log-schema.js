#!/usr/bin/env node
/**
 * discover-debug-log-schema.js
 *
 * Enumerates the real schema of VS Code Copilot Chat's debug logs:
 *
 *   <vscode-user>/workspaceStorage/<hash>/GitHub.copilot-chat/debug-logs/<sessionId>/main.jsonl
 *
 * Why this exists: the extension reads `copilotUsageNanoAiu` out of this file to
 * bill VS Code Chat sessions exactly (see
 * docs/logFilesSchema/vscode-chat-debug-log-format.md). The format is undocumented
 * by Microsoft, we parse exactly one of its event types (`llm_request`), and
 * validate-session-schemas does not cover it. So this script answers two questions:
 *
 *   1. Is the billing contract intact? — are the five attrs our parser depends on
 *      still present on llm_request events? A missing one silently degrades every
 *      affected session to estimated pricing without failing anything.
 *   2. What are we leaving on the table? — every event type and field present in
 *      the log, flagged by whether anything in this repo reads it.
 *
 * Privacy: field VALUES are never printed by default; only paths, types and counts.
 * Pass --include-examples for truncated samples (may contain prompts / paths).
 *
 * Exit codes: 0 = contract intact (or no logs found)   1 = contract drift
 *             2 = configuration / environment error
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------------------------------------------------------------------------
// What the repo actually consumes today. Keep in sync with
// _eatdlProcessLlmRequest() in src/tokenEstimation.ts.
// ---------------------------------------------------------------------------

const CONSUMED = {
  llm_request: ['attrs.inputTokens', 'attrs.outputTokens', 'attrs.cachedTokens', 'attrs.model', 'attrs.copilotUsageNanoAiu'],
};

/** The one field whose disappearance would silently break exact billing. */
const BILLING_FIELD = 'attrs.copilotUsageNanoAiu';

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = { days: 30, max: 10, json: false, includeExamples: false, help: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') { opts.help = true; }
    else if (a === '--json') { opts.json = true; }
    else if (a === '--include-examples') { opts.includeExamples = true; }
    else if (a === '--days') { opts.days = Number(argv[++i]); }
    else if (a === '--max') { opts.max = Number(argv[++i]); }
    else { return { error: `Unknown argument: ${a}` }; }
  }
  if (!Number.isFinite(opts.days) || opts.days < 0) { return { error: '--days must be a non-negative number' }; }
  if (!Number.isFinite(opts.max) || opts.max < 1) { return { error: '--max must be >= 1' }; }
  return opts;
}

const USAGE = `
Usage: node .github/skills/discover-debug-log-schema/discover-debug-log-schema.js [options]

  --days N            Only files modified in the last N days (default 30; 0 = no limit)
  --max N             Analyze at most N most-recent log files (default 10)
  --include-examples  Include truncated example values (MAY CONTAIN PROMPTS/PATHS)
  --json              Emit JSON only
  --help              This message

Exit: 0 = billing contract intact (or no logs found), 1 = drift, 2 = bad usage
`.trim();

// ---------------------------------------------------------------------------
// Discovery — mirrors getVSCodeUserPaths() in validate-session-schemas.js and
// the folder order in readTokensFromDebugLog() in vscode-extension/src/extension.ts.
// ---------------------------------------------------------------------------

function getVSCodeUserPaths() {
  const platform = os.platform();
  const home = os.homedir();
  const variants = ['Code', 'Code - Insiders', 'Code - Exploration', 'VSCodium', 'Cursor'];
  const paths = [];
  if (platform === 'win32') {
    const appData = process.env.APPDATA || path.join(home, 'AppData', 'Roaming');
    for (const v of variants) { paths.push(path.join(appData, v, 'User')); }
  } else if (platform === 'darwin') {
    for (const v of variants) { paths.push(path.join(home, 'Library', 'Application Support', v, 'User')); }
  } else {
    const xdg = process.env.XDG_CONFIG_HOME || path.join(home, '.config');
    for (const v of variants) { paths.push(path.join(xdg, v, 'User')); }
  }
  paths.push(
    path.join(home, '.vscode-server', 'data', 'User'),
    path.join(home, '.vscode-server-insiders', 'data', 'User'),
    path.join(home, '.vscode-remote', 'data', 'User'),
  );
  return paths;
}

const EXTENSION_FOLDERS = ['GitHub.copilot-chat', 'github.copilot-chat', 'GitHub.copilot', 'github.copilot'];

function safeReaddir(dir) {
  try { return fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }
}

function existsDir(p) {
  try { return fs.statSync(p).isDirectory(); } catch { return false; }
}

/** All main.jsonl debug logs across every VS Code variant and extension-folder spelling. */
function discoverDebugLogs() {
  const files = [];
  for (const userPath of getVSCodeUserPaths()) {
    const wsStorage = path.join(userPath, 'workspaceStorage');
    if (!existsDir(wsStorage)) { continue; }
    for (const ws of safeReaddir(wsStorage)) {
      if (!ws.isDirectory()) { continue; }
      for (const extFolder of EXTENSION_FOLDERS) {
        const debugLogs = path.join(wsStorage, ws.name, extFolder, 'debug-logs');
        for (const session of safeReaddir(debugLogs)) {
          if (!session.isDirectory()) { continue; }
          const main = path.join(debugLogs, session.name, 'main.jsonl');
          try {
            const st = fs.statSync(main);
            if (st.isFile()) { files.push({ file: main, mtime: st.mtimeMs, size: st.size }); }
          } catch { /* no main.jsonl in this session folder */ }
        }
      }
    }
  }
  return files;
}

function selectRecent(files, days, max) {
  const cutoff = days > 0 ? Date.now() - days * 86400000 : 0;
  return files
    .filter(f => f.mtime >= cutoff)
    .sort((a, b) => b.mtime - a.mtime)
    .slice(0, max);
}

// ---------------------------------------------------------------------------
// Field walking
// ---------------------------------------------------------------------------

function typeOf(v) {
  if (v === null) { return 'null'; }
  if (Array.isArray(v)) { return 'array'; }
  return typeof v;
}

function truncate(v) {
  const s = typeof v === 'string' ? v : JSON.stringify(v);
  if (typeof s !== 'string') { return String(v); }
  return s.length > 60 ? `${s.slice(0, 60)}…` : s;
}

/**
 * Records every field path in `obj` into `fields`. Arrays collapse to `name[]`
 * so a 500-element array does not produce 500 paths. Depth-capped: these logs
 * can embed whole message trees.
 */
function walk(obj, fields, prefix, depth, includeExamples) {
  if (depth > 4 || obj === null || typeof obj !== 'object') { return; }
  for (const [key, value] of Object.entries(obj)) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') { continue; }
    const isArr = Array.isArray(value);
    const p = prefix ? `${prefix}.${key}${isArr ? '[]' : ''}` : `${key}${isArr ? '[]' : ''}`;
    const entry = fields.get(p) || { types: new Set(), count: 0, example: undefined };
    entry.types.add(typeOf(value));
    entry.count++;
    if (includeExamples && entry.example === undefined && value !== null && typeof value !== 'object') {
      entry.example = truncate(value);
    }
    fields.set(p, entry);
    if (isArr) {
      if (value.length > 0 && typeof value[0] === 'object') { walk(value[0], fields, p, depth + 1, includeExamples); }
    } else if (typeof value === 'object') {
      walk(value, fields, p, depth + 1, includeExamples);
    }
  }
}

// ---------------------------------------------------------------------------
// Analysis
// ---------------------------------------------------------------------------

function analyze(selected, includeExamples) {
  /** type -> { records, fields: Map<path, {types,count,example}> } */
  const byType = new Map();
  let totalLines = 0;
  let badLines = 0;
  let untyped = 0;

  for (const { file } of selected) {
    let content;
    try { content = fs.readFileSync(file, 'utf8'); } catch { continue; }
    for (const raw of content.split('\n')) {
      const line = raw.trim();
      if (!line) { continue; }
      totalLines++;
      let ev;
      try { ev = JSON.parse(line); } catch { badLines++; continue; }
      if (ev === null || typeof ev !== 'object' || Array.isArray(ev)) { badLines++; continue; }
      const t = typeof ev.type === 'string' ? ev.type : '(no type field)';
      if (t === '(no type field)') { untyped++; }
      const bucket = byType.get(t) || { records: 0, fields: new Map() };
      bucket.records++;
      walk(ev, bucket.fields, '', 0, includeExamples);
      byType.set(t, bucket);
    }
  }
  return { byType, totalLines, badLines, untyped };
}

/** Contract check: are the fields our parser depends on still present? */
function checkContract(byType) {
  const results = [];
  for (const [type, expected] of Object.entries(CONSUMED)) {
    const bucket = byType.get(type);
    if (!bucket) {
      results.push({ type, status: 'NOT_OBSERVED', missing: [], note: 'no events of this type in the sampled files' });
      continue;
    }
    const missing = expected.filter(f => !bucket.fields.has(f));
    results.push({
      type,
      status: missing.length === 0 ? 'PASS' : 'DRIFT',
      missing,
      records: bucket.records,
      billingPresent: bucket.fields.has(BILLING_FIELD),
    });
  }
  return results;
}

function buildReport(selected, analysis, contract, allFiles) {
  const consumedSet = new Set();
  for (const [type, fieldsList] of Object.entries(CONSUMED)) {
    for (const f of fieldsList) { consumedSet.add(`${type}::${f}`); }
  }
  const eventTypes = [...analysis.byType.entries()]
    .sort((a, b) => b[1].records - a[1].records)
    .map(([type, b]) => ({
      type,
      records: b.records,
      consumedByRepo: Object.prototype.hasOwnProperty.call(CONSUMED, type),
      fields: [...b.fields.entries()]
        .sort((a, c) => a[0].localeCompare(c[0]))
        .map(([p, info]) => ({
          path: p,
          types: [...info.types].sort(),
          count: info.count,
          consumed: consumedSet.has(`${type}::${p}`),
          ...(info.example !== undefined ? { example: info.example } : {}),
        })),
    }));
  return {
    generatedAt: new Date().toISOString(),
    filesFound: allFiles.length,
    filesAnalyzed: selected.length,
    linesParsed: analysis.totalLines,
    unparseableLines: analysis.badLines,
    recordsWithoutType: analysis.untyped,
    contract,
    eventTypes,
  };
}

// ---------------------------------------------------------------------------
// Text rendering
// ---------------------------------------------------------------------------

function renderText(report) {
  const out = [];
  out.push('VS Code Copilot Chat — debug log schema');
  out.push('='.repeat(52));
  out.push(`Files found: ${report.filesFound}   analyzed: ${report.filesAnalyzed}   lines: ${report.linesParsed}`);
  if (report.unparseableLines > 0) { out.push(`Unparseable lines: ${report.unparseableLines}`); }
  if (report.recordsWithoutType > 0) { out.push(`Records with no "type" field: ${report.recordsWithoutType}`); }
  out.push('');

  if (report.filesFound === 0) {
    out.push('No debug logs found. They only exist for VS Code Copilot Chat sessions on this');
    out.push('machine; widen the window with --days 0 if your sessions are older.');
    return out.join('\n');
  }

  out.push('Billing contract (fields src/tokenEstimation.ts depends on)');
  out.push('-'.repeat(52));
  for (const c of report.contract) {
    out.push(`  ${c.type}: ${c.status}${c.records !== undefined ? `  (${c.records} records)` : ''}`);
    if (c.note) { out.push(`      ${c.note}`); }
    for (const m of c.missing) { out.push(`      MISSING: ${m}`); }
    if (c.status === 'PASS') { out.push(`      exact AIU billing intact (${BILLING_FIELD} present)`); }
  }
  out.push('');

  out.push('Event types observed');
  out.push('-'.repeat(52));
  for (const et of report.eventTypes) {
    const tag = et.consumedByRepo ? 'PARSED' : 'IGNORED';
    out.push(`  [${tag}] ${et.type}  — ${et.records} records, ${et.fields.length} field paths`);
  }
  out.push('');

  out.push('Fields');
  out.push('-'.repeat(52));
  for (const et of report.eventTypes) {
    out.push(`  ${et.type}`);
    for (const f of et.fields) {
      const mark = f.consumed ? '*' : ' ';
      const ex = f.example !== undefined ? `  e.g. ${f.example}` : '';
      out.push(`   ${mark} ${f.path}: ${f.types.join('|')}  (${f.count})${ex}`);
    }
    out.push('');
  }
  out.push('  * = read by this repo today; everything else is available but unused.');
  out.push('');
  out.push('Next: fold anything useful into docs/logFilesSchema/vscode-chat-debug-log-format.md.');
  return out.join('\n');
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const opts = parseArgs(process.argv);
  if (opts.error) { console.error(opts.error); console.error(USAGE); process.exit(2); }
  if (opts.help) { console.log(USAGE); process.exit(0); }

  const allFiles = discoverDebugLogs();
  const selected = selectRecent(allFiles, opts.days, opts.max);
  const analysis = analyze(selected, opts.includeExamples);
  const contract = checkContract(analysis.byType);
  const report = buildReport(selected, analysis, contract, allFiles);

  console.log(opts.json ? JSON.stringify(report, null, 2) : renderText(report));

  process.exit(contract.some(c => c.status === 'DRIFT') ? 1 : 0);
}

main();
