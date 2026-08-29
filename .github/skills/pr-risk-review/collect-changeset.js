#!/usr/bin/env node
/**
 * Collect the changeset context the `pr-risk-review` skill reasons over.
 *
 * Dependency-free. Runs the same way for every agent that uses the skill —
 * Claude Code on a local branch, the Copilot CLI inside the PR Risk Review
 * workflow, or a human debugging the heuristics — so the mechanical half of a
 * risk review (what changed, how big, which sensitive areas it touches) is
 * identical no matter who runs it. Only the judgement half is left to the model.
 *
 * Usage:
 *   node .github/skills/pr-risk-review/collect-changeset.js [options]
 *
 * Options:
 *   --base <ref>        Base commit/ref. Default: merge-base with the default
 *                       branch, falling back to HEAD^.
 *   --head <ref>        Head commit/ref. Default: HEAD.
 *   --out-dir <dir>     Where to write the outputs. Default: pr-risk
 *   --max-diff-bytes N  Truncate changeset.diff at N bytes. Default: 200000
 *   --json              Also print changeset.json to stdout.
 *
 * Writes into <out-dir>:
 *   changeset.json  Structured facts: files, stats, matched signals, baseline.
 *   changeset.md    The same facts as markdown, for pasting into a prompt.
 *   changeset.diff  The unified diff (truncated at --max-diff-bytes).
 *
 * Exit codes: 0 on success (an empty changeset is a success), 2 on a usage or
 * git error.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const LEVELS = ['low', 'medium', 'high'];
const CONFIG_PATH = path.join(__dirname, 'risk-signals.json');

// ── helpers ────────────────────────────────────────────────────────────────

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(2);
}

function git(args, { allowFailure = false } = {}) {
  try {
    return execFileSync('git', args, {
      encoding: 'utf8',
      maxBuffer: 256 * 1024 * 1024,
    });
  } catch (err) {
    if (allowFailure) return null;
    fail(`git ${args.join(' ')} failed: ${err.message}`);
  }
  return null;
}

function levelFromWeight(weight) {
  return LEVELS[Math.min(Math.max(weight, 1), LEVELS.length) - 1];
}

function maxLevel(a, b) {
  return LEVELS.indexOf(a) >= LEVELS.indexOf(b) ? a : b;
}

/**
 * Translate a glob into a regex anchored at both ends.
 * `**\/` matches zero or more leading segments, `**` crosses segments,
 * `*` stays inside one segment, `?` is a single non-separator character.
 */
function globToRegExp(glob) {
  let out = '';
  for (let i = 0; i < glob.length; i += 1) {
    const rest = glob.slice(i);
    if (rest.startsWith('**/')) {
      out += '(?:[^/]+/)*';
      i += 2;
    } else if (rest.startsWith('**')) {
      out += '.*';
      i += 1;
    } else {
      const ch = glob[i];
      if (ch === '*') out += '[^/]*';
      else if (ch === '?') out += '[^/]';
      else out += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
    }
  }
  return new RegExp(`^${out}$`);
}

function compilePatterns(patterns) {
  return patterns.map((p) => globToRegExp(p));
}

function matchesAny(compiled, filePath) {
  return compiled.some((re) => re.test(filePath));
}

// ── argument parsing ───────────────────────────────────────────────────────

function parseArgs(argv) {
  const opts = {
    base: null,
    head: 'HEAD',
    outDir: 'pr-risk',
    maxDiffBytes: 200000,
    json: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = () => {
      const value = argv[i + 1];
      if (value === undefined) fail(`${arg} requires a value`);
      i += 1;
      return value;
    };
    if (arg === '--base') opts.base = next();
    else if (arg === '--head') opts.head = next();
    else if (arg === '--out-dir') opts.outDir = next();
    else if (arg === '--max-diff-bytes') opts.maxDiffBytes = Number(next());
    else if (arg === '--json') opts.json = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(fs.readFileSync(__filename, 'utf8').split('*/')[0]);
      process.exit(0);
    } else fail(`unknown option: ${arg}`);
  }
  if (!Number.isFinite(opts.maxDiffBytes) || opts.maxDiffBytes <= 0) {
    fail('--max-diff-bytes must be a positive number');
  }
  return opts;
}

/** Resolve the base commit when the caller did not pass one. */
function resolveBase(head) {
  for (const candidate of ['origin/main', 'main', 'origin/HEAD']) {
    const mergeBase = git(['merge-base', candidate, head], { allowFailure: true });
    if (mergeBase && mergeBase.trim()) return mergeBase.trim();
  }
  const parent = git(['rev-parse', `${head}^`], { allowFailure: true });
  return parent && parent.trim() ? parent.trim() : null;
}

// ── changeset collection ───────────────────────────────────────────────────

function collectFiles(base, head) {
  const range = base ? [`${base}...${head}`] : [head];
  const numstat = git(['diff', '--numstat', '-M', ...range]) || '';
  const nameStatus = git(['diff', '--name-status', '-M', ...range]) || '';

  const statusByPath = new Map();
  for (const line of nameStatus.split('\n')) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    const code = parts[0].trim();
    // Renames/copies are reported as `R100\told\tnew` — key on the new path.
    const filePath = parts[parts.length - 1];
    statusByPath.set(filePath, code[0]);
  }

  const files = [];
  for (const line of numstat.split('\n')) {
    if (!line.trim()) continue;
    const parts = line.split('\t');
    if (parts.length < 3) continue;
    const [rawIns, rawDel] = parts;
    const filePath = parts[parts.length - 1];
    // `-` in the numstat columns means a binary file.
    const binary = rawIns === '-' || rawDel === '-';
    files.push({
      path: filePath,
      status: statusByPath.get(filePath) || 'M',
      insertions: binary ? 0 : Number(rawIns) || 0,
      deletions: binary ? 0 : Number(rawDel) || 0,
      binary,
      categories: [],
      generated: false,
    });
  }
  return { files, range };
}

/**
 * Tag every file with the categories it matches and settle on one effective
 * weight per file. Matching a low-risk category (tests, docs) wins outright: a
 * file under `vscode-extension/src/test/` is a test first and a host
 * integration second, and scoring it as a host integration would make every
 * test-only PR look medium.
 */
function classify(files, config) {
  const lowRiskIds = new Set(config.lowRiskCategories.ids);
  const categories = config.categories.map((category) => ({
    ...category,
    compiled: compilePatterns(category.paths),
    matched: [],
  }));
  const generated = compilePatterns(config.generatedPaths.paths);

  for (const file of files) {
    file.generated = matchesAny(generated, file.path);
    for (const category of categories) {
      if (matchesAny(category.compiled, file.path)) {
        file.categories.push(category.id);
        category.matched.push(file.path);
      }
    }
    // Kept as its own flag rather than inferred from effectiveWeight === 1:
    // build tooling and uncategorised files are also weight 1, and they are
    // ordinary reviewable code that must still count towards the size
    // thresholds. Only tests and docs drop out.
    file.lowRisk = file.categories.some((id) => lowRiskIds.has(id));
    file.effectiveWeight = file.lowRisk
      ? 1
      : file.categories.reduce((highest, id) => {
          const category = categories.find((c) => c.id === id);
          return Math.max(highest, category ? category.weight : 1);
        }, 1);
    file.effectiveLevel = levelFromWeight(file.effectiveWeight);
  }

  const byPath = new Map(files.map((file) => [file.path, file]));

  return categories
    .filter((category) => category.matched.length > 0)
    .map((category) => ({
      id: category.id,
      label: category.label,
      weight: category.weight,
      level: levelFromWeight(category.weight),
      why: category.why,
      files: category.matched,
      // Files where this category is what actually sets the level — a category
      // whose every match was downgraded to low is reported but never cited as
      // a reason for the baseline.
      drivingFiles: category.matched.filter(
        (filePath) => (byPath.get(filePath) || {}).effectiveWeight === category.weight
      ),
    }))
    .sort((a, b) => b.weight - a.weight || a.id.localeCompare(b.id));
}

/**
 * Size only counts lines a reviewer actually has to reason about: generated
 * files, binaries, and anything the low-risk categories claimed (tests, docs)
 * are excluded, so a 2,000-line markdown diff never reads as a 2,000-line
 * review.
 */
function sizeAssessment(files, thresholds) {
  const handWritten = files.filter(
    (file) => !file.generated && !file.binary && !file.lowRisk
  );
  const changedLines = handWritten.reduce(
    (total, file) => total + file.insertions + file.deletions,
    0
  );
  const reasons = [];
  let level = 'low';

  if (changedLines >= thresholds.highLines) {
    level = 'high';
    reasons.push(
      `${changedLines} reviewable lines changed (>= ${thresholds.highLines})`
    );
  } else if (changedLines >= thresholds.mediumLines) {
    level = 'medium';
    reasons.push(
      `${changedLines} reviewable lines changed (>= ${thresholds.mediumLines})`
    );
  }

  if (handWritten.length >= thresholds.highFiles) {
    level = maxLevel(level, 'high');
    reasons.push(
      `${handWritten.length} reviewable files touched (>= ${thresholds.highFiles})`
    );
  } else if (handWritten.length >= thresholds.mediumFiles) {
    level = maxLevel(level, 'medium');
    reasons.push(
      `${handWritten.length} reviewable files touched (>= ${thresholds.mediumFiles})`
    );
  }

  return { level, changedLines, reviewableFiles: handWritten.length, reasons };
}

/**
 * The mechanical floor: the worst of the size assessment and the per-file
 * levels. Only categories that actually drive a file's level are cited, so a
 * signal whose every match was downgraded to low (say, a README inside `cli/`)
 * shows up in the report without inflating the baseline.
 */
function computeBaseline(signals, size, files) {
  const reasons = [...size.reasons];
  let level = size.level;

  for (const file of files) {
    level = maxLevel(level, file.effectiveLevel);
  }

  for (const signal of signals) {
    if (signal.level !== 'low' && signal.drivingFiles.length > 0) {
      reasons.push(`${signal.label} touched (${signal.drivingFiles.length} file(s))`);
    }
  }

  if (reasons.length === 0) {
    reasons.push(
      files.length === 0
        ? 'empty changeset'
        : 'small changeset in low-risk areas'
    );
  }

  return { level, reasons };
}

// ── rendering ──────────────────────────────────────────────────────────────

function renderMarkdown(changeset) {
  const { stats, signals, size, baseline, files, diff } = changeset;
  const lines = [];

  lines.push('# Changeset facts');
  lines.push('');
  lines.push(`- Range: \`${changeset.range}\``);
  lines.push(
    `- Files changed: **${stats.files}** (${stats.reviewableFiles} reviewable, ` +
      `${stats.generatedFiles} generated, ${stats.binaryFiles} binary)`
  );
  lines.push(`- Lines: **+${stats.insertions} / -${stats.deletions}**`);
  lines.push(
    `- Reviewable lines changed: **${size.changedLines}** → size level \`${size.level}\`` +
      ' (tests, docs, generated files and binaries excluded)'
  );
  lines.push(`- Heuristic baseline: **${baseline.level.toUpperCase()}**`);
  for (const reason of baseline.reasons) lines.push(`  - ${reason}`);
  lines.push('');

  lines.push('## Sensitive areas touched');
  lines.push('');
  if (signals.length === 0) {
    lines.push('_None matched._');
  } else {
    lines.push('| Level | Area | Files | Why it matters |');
    lines.push('| --- | --- | --- | --- |');
    for (const signal of signals) {
      const sample = signal.files.slice(0, 4).join(', ');
      const more =
        signal.files.length > 4 ? `, +${signal.files.length - 4} more` : '';
      lines.push(
        `| ${signal.level} | ${signal.label} | \`${sample}\`${more} | ${signal.why} |`
      );
    }
  }
  lines.push('');

  lines.push('## Files');
  lines.push('');
  lines.push('| Status | File | +/- | Level | Areas |');
  lines.push('| --- | --- | --- | --- | --- |');
  for (const file of files) {
    const tags = file.categories.length ? file.categories.join(', ') : '—';
    const churn = file.binary ? 'binary' : `+${file.insertions}/-${file.deletions}`;
    lines.push(
      `| ${file.status} | \`${file.path}\` | ${churn} | ${file.effectiveLevel} | ${tags} |`
    );
  }
  lines.push('');

  if (diff.truncated) {
    lines.push(
      `> Note: \`changeset.diff\` was truncated at ${diff.bytesWritten} of ` +
        `${diff.bytesTotal} bytes. Read the files directly for anything the diff cut off.`
    );
    lines.push('');
  }

  return lines.join('\n');
}

// ── main ───────────────────────────────────────────────────────────────────

function main() {
  const opts = parseArgs(process.argv.slice(2));
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));

  const head = git(['rev-parse', opts.head]).trim();
  const base = opts.base ? git(['rev-parse', opts.base]).trim() : resolveBase(head);

  const { files, range } = collectFiles(base, head);
  const signals = classify(files, config);
  const size = sizeAssessment(files, config.sizeThresholds);
  const baseline = computeBaseline(signals, size, files);

  const stats = {
    files: files.length,
    reviewableFiles: size.reviewableFiles,
    generatedFiles: files.filter((f) => f.generated).length,
    binaryFiles: files.filter((f) => f.binary).length,
    insertions: files.reduce((total, f) => total + f.insertions, 0),
    deletions: files.reduce((total, f) => total + f.deletions, 0),
  };

  fs.mkdirSync(opts.outDir, { recursive: true });

  const rawDiff = base
    ? git(['diff', '-M', `${base}...${head}`]) || ''
    : git(['show', '--format=', head]) || '';
  const diffBuffer = Buffer.from(rawDiff, 'utf8');
  const truncated = diffBuffer.length > opts.maxDiffBytes;
  const diffOut = truncated
    ? `${diffBuffer.subarray(0, opts.maxDiffBytes).toString('utf8')}\n\n... diff truncated at ${opts.maxDiffBytes} bytes ...\n`
    : rawDiff;
  fs.writeFileSync(path.join(opts.outDir, 'changeset.diff'), diffOut, 'utf8');

  const changeset = {
    generatedBy: 'pr-risk-review/collect-changeset.js',
    configVersion: config.version,
    base,
    head,
    range: base ? `${base}...${head}` : head,
    stats,
    size,
    signals,
    baseline,
    files,
    diff: {
      path: path.join(opts.outDir, 'changeset.diff'),
      truncated,
      bytesTotal: diffBuffer.length,
      bytesWritten: Buffer.byteLength(diffOut, 'utf8'),
    },
  };

  fs.writeFileSync(
    path.join(opts.outDir, 'changeset.json'),
    `${JSON.stringify(changeset, null, 2)}\n`,
    'utf8'
  );
  fs.writeFileSync(
    path.join(opts.outDir, 'changeset.md'),
    `${renderMarkdown(changeset)}\n`,
    'utf8'
  );

  if (opts.json) {
    console.log(JSON.stringify(changeset, null, 2));
  } else {
    console.log(
      `Changeset: ${stats.files} file(s), +${stats.insertions}/-${stats.deletions}, ` +
        `baseline ${baseline.level.toUpperCase()} → ${opts.outDir}/`
    );
  }
  return 0;
}

if (require.main === module) process.exit(main());

module.exports = { globToRegExp, levelFromWeight, maxLevel };
