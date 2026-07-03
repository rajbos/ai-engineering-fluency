#!/usr/bin/env node
/**
 * validate-session-schemas.js
 *
 * Loops over RECENT local AI-coding session log files for every supported,
 * file-based platform and validates that they still match the documented
 * schema. Two outputs per platform:
 *
 *   1. Drift detection  — checks the small set of fields our parsers actually
 *      depend on ("contracts" in schema-baselines.json). A missing required
 *      field on an observed record type => DRIFT (fails CI).
 *   2. New information   — fields observed on disk that are NOT in the known
 *      baseline ("knownFields"). These are candidates for new features /
 *      better token attribution. New fields WARN by default (do not fail).
 *
 * Source of truth for supported platforms: vscode-extension/src/adapters/
 * adapterRegistry.ts. This skill covers the file-based JSON/JSONL ecosystems
 * that have schema docs under docs/logFilesSchema/. DB / binary ecosystems
 * (Crush sqlite, Visual Studio MessagePack, Continue, Mistral Vibe, Claude
 * Desktop) are intentionally NOT validated here — they need the adapters'
 * binary parsers. They are listed as "not validated" in the report.
 *
 * Privacy: raw field example values are NOT emitted by default because they
 * can contain user prompts / file paths / secrets. Pass --include-examples to
 * capture truncated samples.
 *
 * Exit codes:  0 = all observed contracts pass   1 = drift / parse failure
 *              2 = configuration / environment error
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const opts = {
    json: false,
    days: 30,
    max: 5,
    platform: null,
    updateBaseline: false,
    includeExamples: false,
    failOnNewFields: false,
    help: false,
  };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    switch (a) {
      case '--json': opts.json = true; break;
      case '--update-baseline': opts.updateBaseline = true; break;
      case '--include-examples': opts.includeExamples = true; break;
      case '--fail-on-new-fields': opts.failOnNewFields = true; break;
      case '-h': case '--help': opts.help = true; break;
      case '--days': opts.days = parseInt(argv[++i], 10); break;
      case '--max': opts.max = parseInt(argv[++i], 10); break;
      case '--platform': opts.platform = argv[++i]; break;
      default:
        if (a.startsWith('--days=')) { opts.days = parseInt(a.split('=')[1], 10); }
        else if (a.startsWith('--max=')) { opts.max = parseInt(a.split('=')[1], 10); }
        else if (a.startsWith('--platform=')) { opts.platform = a.split('=')[1]; }
        else { throw new Error(`Unknown argument: ${a}`); }
    }
  }
  if (Number.isNaN(opts.days) || opts.days < 0) { throw new Error('--days must be a non-negative integer (0 = no recency limit)'); }
  if (Number.isNaN(opts.max) || opts.max < 1) { throw new Error('--max must be a positive integer'); }
  return opts;
}

function printHelp() {
  console.log(`validate-session-schemas — validate recent session logs against documented schema

Usage:
  node validate-session-schemas.js [options]

Options:
  --days N             Only consider files modified within the last N days (default 30; 0 = no limit)
  --max N              Analyze at most N most-recent files per platform (default 5)
  --platform <id>      Only validate one platform (copilot-chat, copilot-cli, jetbrains,
                       claude-code, gemini-cli, antigravity, opencode)
  --update-baseline    Rewrite knownFields in schema-baselines.json from what was observed
                       (does NOT touch parser contracts)
  --include-examples   Capture truncated example values (may contain user content)
  --fail-on-new-fields Exit non-zero when previously-unseen fields are discovered
  --json               Emit machine-readable JSON only
  -h, --help           Show this help

Exit codes: 0 ok | 1 drift / parse failure | 2 config error`);
}

// ---------------------------------------------------------------------------
// Status constants
// ---------------------------------------------------------------------------

const STATUS = {
  PASS: 'PASS',
  DRIFT: 'DRIFT',
  NO_FILES: 'NO_FILES',
  NO_RECENT_FILES: 'NO_RECENT_FILES',
  INCONCLUSIVE: 'INCONCLUSIVE',
};

// ---------------------------------------------------------------------------
// Filesystem helpers
// ---------------------------------------------------------------------------

function existsDir(p) { try { return fs.statSync(p).isDirectory(); } catch { return false; } }

function safeReaddir(p) {
  try { return fs.readdirSync(p, { withFileTypes: true }); } catch { return []; }
}

/** Recursively collect files matching predicate(name) up to a depth limit. */
function walkFiles(dir, predicate, out, depth) {
  if (depth < 0 || !existsDir(dir)) { return; }
  for (const entry of safeReaddir(dir)) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walkFiles(full, predicate, out, depth - 1); }
    else if (predicate(entry.name)) { out.push(full); }
  }
}

function statOrNull(p) { try { return fs.statSync(p); } catch { return null; } }

// ---------------------------------------------------------------------------
// VS Code user-data paths (mirrors getVSCodeUserPaths in the extension)
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

function xdgDataHome() {
  const home = os.homedir();
  if (os.platform() === 'win32') { return path.join(home, '.local', 'share'); }
  return process.env.XDG_DATA_HOME || path.join(home, '.local', 'share');
}

// ---------------------------------------------------------------------------
// Per-platform discovery. Each returns an array of absolute file paths.
// Paths mirror the adapters under vscode-extension/src/adapters/.
// ---------------------------------------------------------------------------

const HOME = os.homedir();

function discoverCopilotChat() {
  const files = [];
  const isSession = (n) => n.endsWith('.json') || n.endsWith('.jsonl');
  // Real VS Code Copilot Chat sessions are UUID-named (e.g.
  // bd774e5f-e027-....json). Used to filter the noisy github.copilot-chat
  // globalStorage walk so embeddings/cache/CLI-metadata files don't crowd out
  // genuine sessions in the recency window.
  const isUuidSession = (n) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(json|jsonl)$/i.test(n);
  for (const userPath of getVSCodeUserPaths()) {
    if (!existsDir(userPath)) { continue; }
    const wsStorage = path.join(userPath, 'workspaceStorage');
    for (const ws of safeReaddir(wsStorage)) {
      if (!ws.isDirectory()) { continue; }
      const chat = path.join(wsStorage, ws.name, 'chatSessions');
      for (const f of safeReaddir(chat)) {
        if (!f.isDirectory() && isSession(f.name)) { files.push(path.join(chat, f.name)); }
      }
    }
    const legacy = path.join(userPath, 'globalStorage', 'emptyWindowChatSessions');
    for (const f of safeReaddir(legacy)) {
      if (!f.isDirectory() && isSession(f.name)) { files.push(path.join(legacy, f.name)); }
    }
    // The github.copilot-chat globalStorage folder mixes real chat sessions
    // with non-session artifacts (commandEmbeddings.json, settingEmbeddings.json,
    // api.json, copilotCli/*.json). Those caches are rewritten constantly, so an
    // unfiltered walk lets them dominate the most-recent window and silently
    // crowd out the real requests[] sessions (which are UUID-named). Restrict
    // this broad walk to UUID-named session files only.
    const copilotChat = path.join(userPath, 'globalStorage', 'github.copilot-chat');
    walkFiles(copilotChat, isUuidSession, files, 4);
  }
  return files;
}

function discoverCopilotCli() {
  const root = path.join(HOME, '.copilot', 'session-state');
  const files = [];
  // Top-level *.json / *.jsonl plus per-session UUID dirs containing events.jsonl
  walkFiles(root, (n) => n.endsWith('.json') || n.endsWith('.jsonl'), files, 2);
  return files;
}

function discoverJetBrains() {
  const root = path.join(HOME, '.copilot', 'jb');
  const files = [];
  walkFiles(root, (n) => n.startsWith('partition-') && n.endsWith('.jsonl'), files, 2);
  return files;
}

function discoverClaudeCode() {
  const root = path.join(HOME, '.claude', 'projects');
  const files = [];
  walkFiles(root, (n) => n.endsWith('.jsonl'), files, 3);
  return files;
}

function discoverGeminiCli() {
  const root = path.join(HOME, '.gemini', 'tmp');
  const files = [];
  // ~/.gemini/tmp/<project>/chats/session-*.jsonl
  walkFiles(root, (n) => n.startsWith('session-') && n.endsWith('.jsonl'), files, 3);
  return files;
}

function discoverAntigravity() {
  const root = path.join(HOME, '.gemini', 'antigravity', 'brain');
  const files = [];
  // brain/<uuid>/.system_generated/logs/transcript.jsonl
  walkFiles(root, (n) => n === 'transcript.jsonl', files, 4);
  return files;
}

function discoverOpenCode() {
  const dataDir = path.join(xdgDataHome(), 'opencode');
  const files = [];

  // Legacy JSON file sessions
  const sessionDir = path.join(dataDir, 'storage', 'session');
  walkFiles(sessionDir, (n) => n.startsWith('ses_') && n.endsWith('.json'), files, 4);

  // Current SQLite DB sessions (opencode.db): extract message data blobs into
  // temp JSONL files so the framework can analyse schema and detect recency.
  const dbPath = path.join(dataDir, 'opencode.db');
  const dbStat = statOrNull(dbPath);
  if (dbStat && dbStat.size > 0) {
    try {
      const { DatabaseSync } = require('node:sqlite');
      const db = new DatabaseSync(dbPath);
      const sessions = db.prepare('SELECT id, time_updated FROM session ORDER BY time_updated DESC').all();
      for (const session of sessions) {
        const messages = db.prepare(
          'SELECT data FROM message WHERE session_id = ? ORDER BY time_created ASC'
        ).all(session.id);
        if (messages.length === 0) { continue; }
        const tmpPath = path.join(os.tmpdir(), `oc-dbses-${session.id}.jsonl`);
        fs.writeFileSync(tmpPath, messages.map((m) => m.data).join('\n'), 'utf8');
        // Stamp the temp file's mtime with the session's last-updated time so
        // the recency filter (--days) works correctly.
        const mtime = new Date(session.time_updated);
        if (!isNaN(mtime.getTime())) { try { fs.utimesSync(tmpPath, mtime, mtime); } catch { /* ignore */ } }
        files.push(tmpPath);
      }
      db.close();
    } catch { /* node:sqlite unavailable or DB locked — fall back to JSON files only */ }
  }

  return files;
}

const PLATFORM_DISCOVERY = {
  'copilot-chat': discoverCopilotChat,
  'copilot-cli': discoverCopilotCli,
  'jetbrains': discoverJetBrains,
  'claude-code': discoverClaudeCode,
  'gemini-cli': discoverGeminiCli,
  'antigravity': discoverAntigravity,
  'opencode': discoverOpenCode,
};

// Ecosystems supported by the extension but NOT validated by this skill
// (DB / binary formats requiring the adapters' parsers).
const NOT_VALIDATED = ['crush', 'visual-studio', 'continue', 'mistral-vibe', 'claude-desktop'];

// ---------------------------------------------------------------------------
// Schema extraction
// ---------------------------------------------------------------------------

function typeName(v) {
  if (v === null) { return 'null'; }
  if (Array.isArray(v)) { return 'array'; }
  switch (typeof v) {
    case 'object': return 'object';
    case 'boolean': return 'boolean';
    case 'number': return 'number';
    case 'string': return 'string';
    default: return typeof v;
  }
}

function truncate(s, n) { return s.length > n ? s.slice(0, n) + '\u2026' : s; }

const ARRAY_SAMPLE = 5;

/**
 * Walk an object/array, recording every field path into `schemaMap`
 * (path -> { types:Set, count, examples }) and into the per-record `fieldSet`.
 */
function walkValue(value, prefix, schemaMap, fieldSet, includeExamples) {
  const t = typeName(value);
  if (t === 'object') {
    for (const key of Object.keys(value)) {
      const p = prefix ? `${prefix}.${key}` : key;
      recordField(schemaMap, fieldSet, p, value[key], includeExamples);
      walkValue(value[key], p, schemaMap, fieldSet, includeExamples);
    }
  } else if (t === 'array') {
    const p = `${prefix}[]`;
    const n = Math.min(value.length, ARRAY_SAMPLE);
    for (let i = 0; i < n; i++) {
      recordField(schemaMap, fieldSet, p, value[i], includeExamples);
      walkValue(value[i], p, schemaMap, fieldSet, includeExamples);
    }
  }
}

function recordField(schemaMap, fieldSet, p, value, includeExamples) {
  const t = typeName(value);
  let info = schemaMap.get(p);
  if (!info) { info = { types: new Set(), count: 0, examples: [] }; schemaMap.set(p, info); }
  info.types.add(t);
  info.count++;
  fieldSet.add(p);
  if (includeExamples && info.examples.length < 2 && (t === 'string' || t === 'number' || t === 'boolean')) {
    const ex = t === 'string' ? truncate(value, 40) : value;
    if (!info.examples.includes(ex)) { info.examples.push(ex); }
  }
}

/** Detect the discriminator for a JSONL record. */
function discriminatorOf(rec) {
  if (rec && typeof rec === 'object') {
    if (typeof rec.kind === 'number') { return { field: 'kind', value: rec.kind }; }
    if (typeof rec.type === 'string') { return { field: 'type', value: rec.type }; }
  }
  return { field: null, value: null };
}

const MAX_LINES = 5000;

/**
 * Analyze a single file. Mutates the shared platform aggregate.
 */
function analyzeFile(filePath, agg, includeExamples) {
  let raw;
  try { raw = fs.readFileSync(filePath, 'utf8'); }
  catch { agg.unreadableFiles++; return; }

  if (raw.trim().length === 0) { agg.emptyFiles++; return; }

  const isJsonl = filePath.endsWith('.jsonl');
  if (isJsonl) {
    analyzeJsonl(raw, agg, includeExamples);
  } else {
    // Heuristic: a .json file that is really newline-delimited (CLI sometimes
    // writes .json events) — if first non-ws char is '{' and there are many
    // lines that each parse, treat as jsonl; else parse whole.
    const trimmed = raw.trimStart();
    let parsedWhole = null;
    try { parsedWhole = JSON.parse(raw); } catch { parsedWhole = undefined; }
    if (parsedWhole !== undefined) {
      agg.formats.add('json');
      const set = new Set();
      walkValue(parsedWhole, '', agg.schemaMap, set, includeExamples);
      addUnion(agg.jsonUnion, set);
      agg.records++;
      agg.analyzedFiles++;
    } else if (trimmed.startsWith('{')) {
      analyzeJsonl(raw, agg, includeExamples);
    } else {
      agg.parseFailedFiles++;
    }
  }
}

function analyzeJsonl(raw, agg, includeExamples) {
  const lines = raw.split(/\r?\n/);
  let parsedAny = false;
  let lineCount = 0;
  for (const line of lines) {
    if (!line.trim()) { continue; }
    lineCount++;
    if (lineCount > MAX_LINES) { agg.truncatedFiles++; break; }
    let rec;
    try { rec = JSON.parse(line); } catch { agg.malformedLines++; continue; }
    parsedAny = true;
    agg.formats.add('jsonl');
    const set = new Set();
    walkValue(rec, '', agg.schemaMap, set, includeExamples);
    addUnion(agg.jsonlUnion, set);
    agg.records++;
    const d = discriminatorOf(rec);
    if (d.value !== null) {
      const key = String(d.value);
      let u = agg.byDiscriminator.get(key);
      if (!u) { u = new Set(); agg.byDiscriminator.set(key, u); }
      addUnion(u, set);
      agg.discriminatorCounts.set(key, (agg.discriminatorCounts.get(key) || 0) + 1);
    }
  }
  if (parsedAny) { agg.analyzedFiles++; }
  else if (lineCount === 0) { agg.emptyFiles++; }
  else { agg.parseFailedFiles++; }
}

function addUnion(target, src) { for (const v of src) { target.add(v); } }

// ---------------------------------------------------------------------------
// Contract evaluation
// ---------------------------------------------------------------------------

function evaluateContracts(contracts, agg) {
  const results = [];
  for (const rule of contracts) {
    let observedSet = null;
    let applies = false;
    if (rule.discriminator) {
      observedSet = agg.byDiscriminator.get(String(rule.discriminator.value)) || null;
      applies = observedSet !== null;
    } else if (rule.format === 'json') {
      applies = agg.formats.has('json');
      observedSet = agg.jsonUnion;
    } else if (rule.format === 'jsonl') {
      applies = agg.formats.has('jsonl');
      observedSet = agg.jsonlUnion;
    } else {
      applies = agg.records > 0;
      observedSet = new Set([...agg.jsonUnion, ...agg.jsonlUnion]);
    }
    if (!applies) {
      results.push({ desc: rule.desc, applied: false, missing: [], require: rule.require });
      continue;
    }
    const missing = rule.require.filter((p) => !observedSet.has(p));
    results.push({ desc: rule.desc, applied: true, missing, require: rule.require });
  }
  return results;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function newAggregate() {
  return {
    formats: new Set(),
    schemaMap: new Map(),
    jsonUnion: new Set(),
    jsonlUnion: new Set(),
    byDiscriminator: new Map(),
    discriminatorCounts: new Map(),
    records: 0,
    analyzedFiles: 0,
    emptyFiles: 0,
    parseFailedFiles: 0,
    unreadableFiles: 0,
    truncatedFiles: 0,
    malformedLines: 0,
  };
}

function run(opts) {
  const baselinePath = path.join(__dirname, 'schema-baselines.json');
  let baseline;
  try { baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8')); }
  catch (e) { console.error(`Could not read baseline file ${baselinePath}: ${e.message}`); process.exitCode = 2; return; }

  const now = Date.now();
  const cutoff = opts.days > 0 ? now - opts.days * 24 * 60 * 60 * 1000 : 0;

  const platformIds = opts.platform ? [opts.platform] : Object.keys(PLATFORM_DISCOVERY);
  for (const id of platformIds) {
    if (!PLATFORM_DISCOVERY[id]) { console.error(`Unknown platform: ${id}`); process.exitCode = 2; return; }
  }

  const report = { generatedAt: new Date().toISOString(), options: opts, platforms: {}, notValidated: NOT_VALIDATED };
  let anyDrift = false;
  let anyNewFields = false;
  let anyParseFailure = false;

  for (const id of platformIds) {
    const cfg = baseline.platforms[id] || { displayName: id, contracts: [], knownFields: [] };
    const allFiles = PLATFORM_DISCOVERY[id]();
    const withStat = allFiles
      .map((f) => ({ f, st: statOrNull(f) }))
      .filter((x) => x.st && x.st.size > 0);
    const recent = withStat
      .filter((x) => x.st.mtimeMs >= cutoff)
      .sort((a, b) => b.st.mtimeMs - a.st.mtimeMs)
      .slice(0, opts.max);

    const entry = {
      displayName: cfg.displayName,
      filesFound: allFiles.length,
      filesRecent: withStat.filter((x) => x.st.mtimeMs >= cutoff).length,
      filesAnalyzed: 0,
      analyzedPaths: recent.map((x) => x.f),
      newestMtime: withStat.length ? new Date(Math.max(...withStat.map((x) => x.st.mtimeMs))).toISOString() : null,
      status: STATUS.NO_FILES,
      contracts: [],
      newFields: [],
      observedDiscriminators: [],
      notes: [],
    };

    if (allFiles.length === 0) {
      entry.status = STATUS.NO_FILES;
      report.platforms[id] = entry;
      continue;
    }
    if (recent.length === 0) {
      entry.status = STATUS.NO_RECENT_FILES;
      entry.notes.push(`${withStat.length} file(s) exist but none modified within ${opts.days} day(s).`);
      report.platforms[id] = entry;
      continue;
    }

    const agg = newAggregate();
    for (const x of recent) { analyzeFile(x.f, agg, opts.includeExamples); }
    entry.filesAnalyzed = agg.analyzedFiles;
    entry.observedDiscriminators = [...agg.discriminatorCounts.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    if (agg.malformedLines > 0) { entry.notes.push(`${agg.malformedLines} malformed JSONL line(s) skipped.`); }
    if (agg.truncatedFiles > 0) { entry.notes.push(`${agg.truncatedFiles} file(s) truncated at ${MAX_LINES} lines.`); }
    if (agg.parseFailedFiles > 0) { entry.notes.push(`${agg.parseFailedFiles} file(s) could not be parsed.`); anyParseFailure = true; }

    // New-field detection.
    const known = new Set(cfg.knownFields || []);
    const observed = [...agg.schemaMap.keys()].sort();
    entry.newFields = observed.filter((p) => !known.has(p));
    if (entry.newFields.length > 0) { anyNewFields = true; }

    if (opts.includeExamples) {
      entry.fieldDetails = {};
      for (const [p, info] of agg.schemaMap) {
        entry.fieldDetails[p] = { types: [...info.types], count: info.count, examples: info.examples };
      }
    }

    // Update baseline knownFields if requested (never touches contracts).
    if (opts.updateBaseline && baseline.platforms[id]) {
      const merged = new Set([...(cfg.knownFields || []), ...observed]);
      baseline.platforms[id].knownFields = [...merged].sort();
    }

    // Contract evaluation.
    const contractResults = evaluateContracts(cfg.contracts || [], agg);
    entry.contracts = contractResults;
    const drift = contractResults.some((r) => r.applied && r.missing.length > 0);

    if (agg.analyzedFiles === 0) {
      entry.status = STATUS.INCONCLUSIVE;
      entry.notes.push('No parseable records found in recent files.');
    } else if (drift) {
      entry.status = STATUS.DRIFT;
      anyDrift = true;
    } else {
      entry.status = STATUS.PASS;
    }
    report.platforms[id] = entry;
  }

  if (opts.updateBaseline) {
    baseline.lastUpdated = new Date().toISOString().slice(0, 10);
    fs.writeFileSync(baselinePath, JSON.stringify(baseline, null, 2) + '\n', 'utf8');
  }

  if (opts.json) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    printHuman(report, opts);
  }

  if (anyDrift || anyParseFailure) { process.exitCode = 1; }
  else if (opts.failOnNewFields && anyNewFields) { process.exitCode = 1; }
  else { process.exitCode = 0; }
}

function statusIcon(status) {
  switch (status) {
    case STATUS.PASS: return '\u2705';
    case STATUS.DRIFT: return '\u274c';
    case STATUS.INCONCLUSIVE: return '\u26a0\ufe0f';
    case STATUS.NO_RECENT_FILES: return '\u23f3';
    case STATUS.NO_FILES: return '\u2796';
    default: return '\u2022';
  }
}

function printHuman(report, opts) {
  const line = '='.repeat(72);
  console.log(line);
  console.log('Session schema validation');
  console.log(`  generated ${report.generatedAt}`);
  console.log(`  window: last ${opts.days === 0 ? '\u221e' : opts.days} day(s), up to ${opts.max} file(s)/platform`);
  console.log(line);

  for (const [id, p] of Object.entries(report.platforms)) {
    console.log('');
    console.log(`${statusIcon(p.status)} ${p.displayName} [${id}] — ${p.status}`);
    console.log(`   files: ${p.filesFound} found, ${p.filesRecent} recent, ${p.filesAnalyzed} analyzed` +
      (p.newestMtime ? `  (newest ${p.newestMtime})` : ''));
    if (p.observedDiscriminators && p.observedDiscriminators.length > 0) {
      const top = p.observedDiscriminators.slice(0, 8).map((d) => `${d.value}(${d.count})`).join(', ');
      console.log(`   record types: ${top}`);
    }
    for (const c of p.contracts) {
      if (!c.applied) { console.log(`   \u2022 (not observed) ${c.desc}`); }
      else if (c.missing.length === 0) { console.log(`   \u2713 ${c.desc}`); }
      else { console.log(`   \u2717 DRIFT: ${c.desc} — missing: ${c.missing.join(', ')}`); }
    }
    if (p.newFields.length > 0) {
      console.log(`   \u2728 ${p.newFields.length} new field(s) not in baseline:`);
      for (const f of p.newFields.slice(0, 40)) { console.log(`        + ${f}`); }
      if (p.newFields.length > 40) { console.log(`        \u2026 and ${p.newFields.length - 40} more`); }
    }
    for (const n of p.notes) { console.log(`   note: ${n}`); }
  }

  console.log('');
  console.log(line);
  console.log(`Not validated by this skill (DB/binary formats): ${report.notValidated.join(', ')}`);
  console.log(line);
}

// ---------------------------------------------------------------------------

function main() {
  let opts;
  try { opts = parseArgs(process.argv); }
  catch (e) { console.error(e.message); console.error('Run with --help for usage.'); process.exitCode = 2; return; }
  if (opts.help) { printHelp(); return; }
  run(opts);
}

main();
