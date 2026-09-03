#!/usr/bin/env node
'use strict';

/**
 * Editor data coverage — "is the data actually there?"
 *
 * `validate-session-schemas.js` answers "do the logs I found still match the
 * schema?" and exits 0 when it found nothing at all, which is the right answer
 * for CI (a runner has no editor history) and the wrong one for a release
 * check. A green run on a machine with no data proves nothing, and that vacuous
 * pass is exactly what you do NOT want to see right before tagging.
 *
 * So this asks the complementary question: which editors on THIS machine are
 * actually producing session data the extension can read? It reports every
 * supported platform as covered / empty / stale, and fails when coverage drops
 * below what a release machine should have.
 *
 * A platform going from "covered" to "empty" between releases is the signal
 * worth catching: it usually means that editor changed where or how it writes
 * its logs, and the extension is now silently reporting zero for it.
 *
 * Usage:
 *   node scripts/check-editor-data-coverage.js
 *   node scripts/check-editor-data-coverage.js --min 3     # require 3 editors
 *   node scripts/check-editor-data-coverage.js --stale-days 14
 *   node scripts/check-editor-data-coverage.js --json
 *
 * Exit codes: 0 = coverage ok | 1 = below the floor / drift | 2 = could not run.
 */

const { spawnSync } = require('child_process');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const VALIDATOR = path.join(
  REPO_ROOT,
  '.github',
  'skills',
  'validate-session-schemas',
  'validate-session-schemas.js'
);

function parseArgs(argv) {
  const args = { min: 1, staleDays: 30, json: false };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--min') {
      args.min = parseInt(argv[++i], 10);
    } else if (argv[i] === '--stale-days') {
      args.staleDays = parseInt(argv[++i], 10);
    } else if (argv[i] === '--json') {
      args.json = true;
    }
  }
  return args;
}

function runValidator(staleDays) {
  const result = spawnSync(process.execPath, [VALIDATOR, '--json', '--days', String(staleDays)], {
    cwd: REPO_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.error) {
    console.error(`❌ Could not run the schema validator: ${result.error.message}`);
    process.exit(2);
  }
  try {
    return JSON.parse(result.stdout);
  } catch (error) {
    console.error('❌ The schema validator did not emit parseable JSON.');
    console.error((result.stderr || result.stdout || '').slice(0, 2000));
    process.exit(2);
  }
}

function daysSince(isoOrMs) {
  if (!isoOrMs) {
    return null;
  }
  const then = typeof isoOrMs === 'number' ? isoOrMs : Date.parse(isoOrMs);
  if (!Number.isFinite(then)) {
    return null;
  }
  return Math.floor((Date.now() - then) / 86400000);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = runValidator(args.staleDays);
  const platforms = report.platforms || {};

  const rows = Object.entries(platforms).map(([id, platform]) => {
    const age = daysSince(platform.newestMtime);
    let state;
    if (!platform.filesFound) {
      state = 'empty';
    } else if (!platform.filesRecent) {
      state = 'stale';
    } else {
      state = 'covered';
    }
    return {
      id,
      name: platform.displayName || id,
      state,
      filesFound: platform.filesFound || 0,
      filesRecent: platform.filesRecent || 0,
      ageDays: age,
      schemaStatus: platform.status,
    };
  });

  const covered = rows.filter((r) => r.state === 'covered');
  const stale = rows.filter((r) => r.state === 'stale');
  const empty = rows.filter((r) => r.state === 'empty');
  const ok = covered.length >= args.min;

  if (args.json) {
    console.log(JSON.stringify({ ok, min: args.min, rows, notValidated: report.notValidated || [] }, null, 2));
    process.exit(ok ? 0 : 1);
  }

  console.log('\n💾 Editor data coverage on this machine\n');

  const width = Math.max(...rows.map((r) => r.name.length), 20);
  const MARK = { covered: '✅', stale: '🕰️ ', empty: '➖' };
  for (const row of rows.sort((a, b) => a.state.localeCompare(b.state) || a.name.localeCompare(b.name))) {
    const detail =
      row.state === 'covered'
        ? `${row.filesRecent} recent file(s), newest ${row.ageDays ?? '?'}d old — schema ${row.schemaStatus}`
        : row.state === 'stale'
          ? `${row.filesFound} file(s) but none in the last ${args.staleDays}d (newest ${row.ageDays ?? '?'}d old)`
          : 'no session files found';
    console.log(`   ${MARK[row.state]} ${row.name.padEnd(width)}  ${detail}`);
  }

  if ((report.notValidated || []).length > 0) {
    console.log(`\n   ℹ️  Binary/DB formats this check cannot read: ${report.notValidated.join(', ')}`);
  }

  console.log(
    `\n   ${covered.length} covered, ${stale.length} stale, ${empty.length} empty (floor: ${args.min} covered)\n`
  );

  if (!ok) {
    console.error(`❌ Only ${covered.length} editor(s) have recent data — expected at least ${args.min}.`);
    console.error('   On a release machine this usually means an editor changed where it writes');
    console.error('   its logs, and the extension is now silently reporting zero for it.\n');
    process.exit(1);
  }

  console.log('✅ Editor data is present and readable.\n');
  process.exit(0);
}

if (require.main === module) {
  main();
}
