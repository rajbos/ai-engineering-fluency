#!/usr/bin/env node
'use strict';

/**
 * Unit tests for validate-session-schemas.js.
 *
 * Run with:  node --test .github/skills/validate-session-schemas/validate-session-schemas.test.js
 *
 * Covers the privacy-relevant behaviour: OpenCode DB sessions are exported
 * only inside the --days/--max window, with validated ids, from a read-only
 * connection, and the temp export is removed when the run ends; dictionary-
 * keyed objects do not put identifiers into field paths; and --include-examples
 * values are redacted. All fixtures are synthetic and live under a fresh temp
 * dir — no real session data is read.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const {
  parseArgs,
  normalizeKey,
  redactExample,
  walkValue,
  newDiscoveryContext,
  removeTempDirs,
  exportOpenCodeDbSessions,
  DICT_KEY,
} = require('./validate-session-schemas.js');

let sqlite = null;
try { sqlite = require('node:sqlite'); } catch { /* older Node — DB tests skipped */ }

const DAY = 24 * 60 * 60 * 1000;
const SCRIPT = path.join(__dirname, 'validate-session-schemas.js');

function makeTempDir(t, prefix) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  return dir;
}

/** Build a minimal opencode.db: sessions given as { id, ageDays, messages }. */
function makeOpenCodeDb(dbPath, sessions) {
  const db = new sqlite.DatabaseSync(dbPath);
  db.exec('CREATE TABLE session (id TEXT PRIMARY KEY, time_updated INTEGER)');
  db.exec('CREATE TABLE message (id INTEGER PRIMARY KEY, session_id TEXT, time_created INTEGER, data TEXT)');
  const now = Date.now();
  const insS = db.prepare('INSERT INTO session (id, time_updated) VALUES (?, ?)');
  const insM = db.prepare('INSERT INTO message (session_id, time_created, data) VALUES (?, ?, ?)');
  for (const s of sessions) {
    insS.run(s.id, now - s.ageDays * DAY);
    for (let i = 0; i < s.messages; i++) {
      insM.run(s.id, i, JSON.stringify({ role: 'user', time: { created: i } }));
    }
  }
  db.close();
}

// ---------------------------------------------------------------------------
// Field-path key normalization
// ---------------------------------------------------------------------------

test('normalizeKey keeps ordinary field names', () => {
  for (const k of ['requestId', 'cache_read_input_tokens', '$schema', '@type', 'content-type', 'v2', 'gpt-6-luna']) {
    assert.equal(normalizeKey(k), k, k);
  }
});

test('normalizeKey collapses identifier-shaped keys', () => {
  for (const k of [
    'C:\\Users\\someone\\repo\\file.ts',
    '/home/someone/repo/file.ts',
    'file:///tmp/x',
    'src.index',
    'has space',
    'bd774e5f-e027-4c4a-9d2b-0123456789ab',
    'ses_4f2a9c81b7d3e0aa11223344',
    'deadbeef0123abcd',
    '1712345678901',
    'k'.repeat(65),
    '',
  ]) {
    assert.equal(normalizeKey(k), DICT_KEY, k);
  }
});

test('walkValue does not put dictionary keys into field paths', () => {
  const schema = new Map();
  const fields = new Set();
  walkValue({
    requestId: 'r1',
    files: {
      '/home/someone/secret-project/a.ts': { size: 1 },
      'C:\\Users\\someone\\b.ts': { size: 2 },
    },
    sessions: { 'bd774e5f-e027-4c4a-9d2b-0123456789ab': { tokens: 3 } },
  }, '', schema, fields, false);
  const paths = [...schema.keys()].sort();
  assert.deepEqual(paths, [
    'files',
    'files.{key}',
    'files.{key}.size',
    'requestId',
    'sessions',
    'sessions.{key}',
    'sessions.{key}.tokens',
  ]);
  for (const p of paths) { assert.ok(!/someone|bd774e5f/.test(p), p); }
});

// ---------------------------------------------------------------------------
// --include-examples redaction
// ---------------------------------------------------------------------------

test('redactExample strips home dir, tokens and e-mail addresses', () => {
  const home = path.join(path.sep === '\\' ? 'C:\\' : '/', 'Users', 'someone');
  assert.equal(redactExample(`${home}${path.sep}repo`, home), `~${path.sep}repo`);
  assert.equal(redactExample(`${home.replace(/\\/g, '/')}/repo`, home), '~/repo');
  assert.equal(redactExample('token ghp_' + 'a'.repeat(36), home), 'token [redacted]');
  assert.equal(redactExample('key sk-' + 'b'.repeat(40), home), 'key [redacted]');
  assert.equal(redactExample('Authorization: Bearer abc.def-ghi_jkl', home), 'Authorization: [redacted]');
  assert.equal(redactExample('mail someone@example.com now', home), 'mail [email] now');
  assert.equal(redactExample('plain text', home), 'plain text');
});

test('walkValue applies redaction to captured examples', () => {
  const schema = new Map();
  walkValue({ auth: 'ghp_' + 'z'.repeat(36) }, '', schema, new Set(), true);
  assert.deepEqual(schema.get('auth').examples, ['[redacted]']);
});

// ---------------------------------------------------------------------------
// OpenCode DB export
// ---------------------------------------------------------------------------

test('parseArgs still validates --days / --max', () => {
  assert.throws(() => parseArgs(['node', 's', '--max', '0']), /--max/);
  assert.throws(() => parseArgs(['node', 's', '--days', '-1']), /--days/);
});

test('exportOpenCodeDbSessions exports only recent, valid, non-empty sessions up to max', { skip: !sqlite }, (t) => {
  const dir = makeTempDir(t, 'vss-test-db-');
  const dbPath = path.join(dir, 'opencode.db');
  makeOpenCodeDb(dbPath, [
    { id: 'ses_new1', ageDays: 1, messages: 2 },
    { id: 'ses_new2', ageDays: 2, messages: 1 },
    { id: '../../escape', ageDays: 0.5, messages: 1 },
    { id: 'ses_new3', ageDays: 3, messages: 1 },
    { id: 'ses_empty', ageDays: 1, messages: 0 },
    { id: 'ses_old', ageDays: 90, messages: 3 },
  ]);
  const dbBefore = fs.readFileSync(dbPath);

  const ctx = newDiscoveryContext(Date.now() - 30 * DAY, 2);
  t.after(() => removeTempDirs(ctx));
  const files = [];
  exportOpenCodeDbSessions(dbPath, ctx, files);

  assert.equal(ctx.tempDirs.length, 1);
  const tmpDir = ctx.tempDirs[0];
  assert.deepEqual(fs.readdirSync(tmpDir).sort(), ['ses_new1.jsonl', 'ses_new2.jsonl']);
  assert.deepEqual(files.map((f) => path.basename(f)), ['ses_new1.jsonl', 'ses_new2.jsonl']);
  for (const f of files) { assert.equal(path.dirname(f), tmpDir); }
  assert.match(ctx.displayPaths.get(files[0]), /opencode\.db \[session ses_new1\]$/);

  // Non-empty sessions: 5 found (incl. invalid id and old), 4 recent; 2 exported.
  assert.equal(ctx.unexported.opencode.found, 3);
  assert.equal(ctx.unexported.opencode.recent, 2);
  assert.ok(ctx.unexported.opencode.newestMs > Date.now() - DAY);

  // Read-only: the database file is byte-for-byte unchanged.
  assert.ok(fs.readFileSync(dbPath).equals(dbBefore));

  removeTempDirs(ctx);
  assert.equal(fs.existsSync(tmpDir), false);
  assert.equal(ctx.tempDirs.length, 0);
});

test('exportOpenCodeDbSessions writes nothing when no session is in the window', { skip: !sqlite }, (t) => {
  const dir = makeTempDir(t, 'vss-test-db-');
  const dbPath = path.join(dir, 'opencode.db');
  makeOpenCodeDb(dbPath, [{ id: 'ses_old', ageDays: 90, messages: 3 }]);
  const ctx = newDiscoveryContext(Date.now() - 7 * DAY, 5);
  t.after(() => removeTempDirs(ctx));
  const files = [];
  exportOpenCodeDbSessions(dbPath, ctx, files);
  assert.deepEqual(files, []);
  assert.deepEqual(ctx.tempDirs, []);
  assert.deepEqual({ found: ctx.unexported.opencode.found, recent: ctx.unexported.opencode.recent }, { found: 1, recent: 0 });
});

test('end-to-end run removes the OpenCode temp export and reports counts', { skip: !sqlite }, (t) => {
  const root = makeTempDir(t, 'vss-test-e2e-');
  const home = path.join(root, 'home');
  const tmp = path.join(root, 'tmp');
  const dataDir = path.join(home, '.local', 'share');
  fs.mkdirSync(path.join(dataDir, 'opencode'), { recursive: true });
  fs.mkdirSync(tmp, { recursive: true });
  makeOpenCodeDb(path.join(dataDir, 'opencode', 'opencode.db'), [
    { id: 'ses_a', ageDays: 1, messages: 2 },
    { id: 'ses_b', ageDays: 2, messages: 2 },
    { id: 'ses_c', ageDays: 60, messages: 2 },
  ]);

  const env = {
    ...process.env,
    HOME: home, USERPROFILE: home, XDG_DATA_HOME: dataDir,
    TMPDIR: tmp, TEMP: tmp, TMP: tmp,
  };
  const res = spawnSync(process.execPath, [SCRIPT, '--platform', 'opencode', '--json', '--days', '30', '--max', '1'], {
    env, encoding: 'utf8',
  });
  assert.equal(res.status, 0, res.stderr);
  const report = JSON.parse(res.stdout);
  const oc = report.platforms.opencode;
  assert.equal(oc.status, 'PASS');
  assert.equal(oc.filesFound, 3);
  assert.equal(oc.filesRecent, 2);
  assert.equal(oc.filesAnalyzed, 1);
  assert.equal(oc.analyzedPaths.length, 1);
  assert.match(oc.analyzedPaths[0], /opencode\.db \[session ses_a\]$/);

  // No raw conversation copy is left behind.
  assert.deepEqual(fs.readdirSync(tmp).filter((n) => n.startsWith('oc-dbses-')), []);
});

test('exportOpenCodeDbSessions ranks DB sessions together with legacy JSON files', { skip: !sqlite }, (t) => {
  const dir = makeTempDir(t, 'vss-test-db-');
  const dbPath = path.join(dir, 'opencode.db');
  makeOpenCodeDb(dbPath, [
    { id: 'ses_db_recent', ageDays: 5, messages: 1 },
    { id: 'ses_dup', ageDays: 3, messages: 1 },
  ]);
  const legacy = [];
  for (const [name, ageDays] of [['ses_json1', 1], ['ses_json2', 2], ['ses_dup', 0.5]]) {
    const f = path.join(dir, `${name}.json`);
    fs.writeFileSync(f, '{"id":"x"}');
    const when = new Date(Date.now() - ageDays * DAY);
    fs.utimesSync(f, when, when);
    legacy.push(f);
  }

  // max 2: the two newer legacy files fill the window -> no DB copy written.
  // ses_dup exists in both stores: the DB copy wins, the legacy file is dropped.
  const ctx = newDiscoveryContext(Date.now() - 30 * DAY, 2);
  t.after(() => removeTempDirs(ctx));
  const files = [...legacy];
  exportOpenCodeDbSessions(dbPath, ctx, files);
  assert.deepEqual(files.map((f) => path.basename(f)).sort(), ['ses_json1.json', 'ses_json2.json']);
  assert.deepEqual(ctx.tempDirs, []);
  assert.equal(ctx.unexported.opencode.found, 2);
  assert.equal(ctx.unexported.opencode.recent, 2);

  // max 3: the deduplicated DB session (3 days old) now ranks in; the 5-day-old one does not.
  const ctx3 = newDiscoveryContext(Date.now() - 30 * DAY, 3);
  t.after(() => removeTempDirs(ctx3));
  const files3 = [...legacy];
  exportOpenCodeDbSessions(dbPath, ctx3, files3);
  assert.deepEqual(files3.map((f) => path.basename(f)).sort(), ['ses_dup.jsonl', 'ses_json1.json', 'ses_json2.json']);
  assert.equal(ctx3.unexported.opencode.found, 1);
});

test('recent sessions with only unsafe ids are INCONCLUSIVE, not NO_RECENT_FILES', { skip: !sqlite }, (t) => {
  const root = makeTempDir(t, 'vss-test-e2e-');
  const home = path.join(root, 'home');
  const tmp = path.join(root, 'tmp');
  const dataDir = path.join(home, '.local', 'share');
  fs.mkdirSync(path.join(dataDir, 'opencode'), { recursive: true });
  fs.mkdirSync(tmp, { recursive: true });
  makeOpenCodeDb(path.join(dataDir, 'opencode', 'opencode.db'), [
    { id: '../../escape', ageDays: 1, messages: 1 },
  ]);
  const env = { ...process.env, HOME: home, USERPROFILE: home, XDG_DATA_HOME: dataDir, TMPDIR: tmp, TEMP: tmp, TMP: tmp };
  const res = spawnSync(process.execPath, [SCRIPT, '--platform', 'opencode', '--json'], { env, encoding: 'utf8' });
  assert.equal(res.status, 0, res.stderr);
  const oc = JSON.parse(res.stdout).platforms.opencode;
  assert.equal(oc.status, 'INCONCLUSIVE');
  assert.equal(oc.filesRecent, 1);
  assert.equal(oc.filesAnalyzed, 0);
  assert.ok(oc.notes.some((n) => /failed validation/.test(n)), oc.notes.join('; '));
  assert.deepEqual(fs.readdirSync(tmp), []);
});
