#!/usr/bin/env node
'use strict';

/**
 * Counts lines of code and discovered test scenarios per repository component,
 * and writes a monthly Markdown report to LOC_STATS.md.
 *
 * Components mirror the repository layout in AGENTS.md:
 *   src/, vscode-extension/, cli/, visualstudio-extension/,
 *   jetbrains-plugin/, sharing-server/, desktop/
 *
 * For every component the script reports:
 *   - File count and total non-blank lines for hand-written source files.
 *   - Test file count, total test file lines, and the number of discovered
 *     test scenarios (test cases / describe blocks / [TestMethod] etc.).
 *
 * Generated/bundled output, dependency directories, lockfiles and docs are
 * excluded so the numbers reflect hand-written code.
 *
 * Usage:  node scripts/loc-stats.js [--out <path>] [--root <path>]
 * Output: Markdown written to LOC_STATS.md (or --out) at the repo root.
 */

const fs = require('fs');
const path = require('path');

// ── CLI args ────────────────────────────────────────────────────────────────
function parseArgs(argv) {
  const args = { out: 'LOC_STATS.md', root: '' };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.out = argv[++i];
    else if (a === '--root') args.root = argv[++i];
    else if (a === '-h' || a === '--help') {
      process.stdout.write(
        'Usage: node scripts/loc-stats.js [--out <path>] [--root <path>]\n'
      );
      process.exit(0);
    }
  }
  return args;
}

const args = parseArgs(process.argv);
const repoRoot = path.resolve(
  args.root || path.join(__dirname, '..')
);

// ── Components (matches AGENTS.md repository structure) ────────────────────
const COMPONENTS = [
  { name: 'Shared Source (src/)', dir: 'src', languages: ['typescript', 'javascript', 'json'] },
  { name: 'VSCode Extension', dir: 'vscode-extension', languages: ['typescript', 'javascript', 'json'] },
  { name: 'CLI Tool', dir: 'cli', languages: ['typescript', 'javascript'] },
  { name: 'Visual Studio Extension', dir: 'visualstudio-extension', languages: ['csharp'] },
  { name: 'JetBrains Plugin', dir: 'jetbrains-plugin', languages: ['kotlin'] },
  { name: 'Sharing Server', dir: 'sharing-server', languages: ['typescript', 'javascript'] },
  { name: 'Desktop App', dir: 'desktop', languages: ['typescript', 'javascript'] },
];

// ── Exclusions ──────────────────────────────────────────────────────────────
const EXCLUDE_DIRS = new Set([
  'node_modules', 'dist', 'out', 'bin', 'obj', '.git', '.vs',
  '.vscode-test', 'coverage', '.nyc_output', 'packages', '.next',
  '.turbo', 'TestResults', 'build', 'target', '.gradle', '.idea',
]);

// Relative path fragments (relative to the repo root) to exclude — generated/bundled
// output and committed test artefacts that are not hand-written source.
const EXCLUDE_PATH_FRAGMENTS = [
  // Generated webview bundles committed under the Visual Studio extension.
  'visualstudio-extension/src/AIEngineeringFluency/webview',
  // Committed test artefacts / scratch fixtures under the VS Code extension.
  'vscode-extension/contract-fixture-',
  'vscode-extension/ctt-cache-',
  'vscode-extension/ctt-dev-cleanup-',
  'vscode-extension/cliapp-split-',
];

const EXCLUDE_FILE_NAMES = new Set([
  'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
]);

// ── Extension maps ──────────────────────────────────────────────────────────
const EXT_BY_LANG = {
  typescript: new Set(['.ts', '.tsx']),
  javascript: new Set(['.js', '.jsx', '.mjs', '.cjs']),
  json: new Set(['.json']),
  csharp: new Set(['.cs']),
  kotlin: new Set(['.kt', '.kts']),
};

const CODE_EXTENSIONS = new Set();
for (const exts of Object.values(EXT_BY_LANG)) {
  for (const e of exts) CODE_EXTENSIONS.add(e);
}

// Test file detection: matches the conventions used across the repo.
function isTestFile(relPath, ext) {
  const base = path.basename(relPath);
  const lower = base.toLowerCase();
  if (ext === '.cs') return /test.*\.cs$/i.test(base);
  if (ext === '.kt' || ext === '.kts') {
    return /(^|[\\/])tests?([\\/])/i.test(relPath) ||
      /tests?\.(?:kt|kts)$/i.test(base);
  }
  // TS/JS: *.test.ts / *.test.tsx / *.test.js / *.spec.ts
}

// ── Scenario discovery ─────────────────────────────────────────────────────
// Returns the number of discovered test scenarios in a file's contents.
function countScenarios(content, ext) {
  let count = 0;
  if (ext === '.cs') {
    // C#: xUnit ([Fact]/[Theory]) and MSTest ([TestMethod]/[Test]).
    count += countMatches(content, /\[\s*(Fact|Theory|Test|TestMethod|TestCase|DataTestMethod)\s*\]/g);
    return count;
  }
  if (ext === '.kt' || ext === '.kts') {
    // Kotlin: @Test, @ParameterizedTest, @RepeatedTest.
    count += countMatches(content, /@(Test|ParameterizedTest|RepeatedTest|TestFactory)\b/g);
    return count;
  }
  // TS/JS: count `it(...)` / `test(...)` and `describe(...)` blocks.
  count += countMatches(content, /\bit\s*\(/g);
  count += countMatches(content, /\btest\s*\(/g);
  count += countMatches(content, /\bdescribe\s*\(/g);
  return count;
}

// Counts non-overlapping regex matches in a string without retaining matches.
function countMatches(str, re) {
  const globalRe = re.global ? re : new RegExp(re.source, re.flags + 'g');
  let n = 0;
  let m;
  while ((m = globalRe.exec(str)) !== null) {
    n++;
    if (m.index === globalRe.lastIndex) globalRe.lastIndex++;
  }
  return n;
}

// ── Directory walk ──────────────────────────────────────────────────────────
// Returns true if the repo-root-relative path falls under an excluded fragment.
// Excluded fragments are prefixes matched against the full repo-relative path,
// so a fragment like `vscode-extension/contract-fixture-` excludes every
// `contract-fixture-<id>/...` artefact committed under that component.
function isExcludedRepoPath(repoRel) {
  const normalized = repoRel.replace(/\\/g, '/');
  return EXCLUDE_PATH_FRAGMENTS.some(
    (f) => normalized === f || normalized.startsWith(f)
  );
}

function walk(dir, relBase, compDir, files) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const rel = relBase ? `${relBase}/${entry.name}` : entry.name;
    const repoRel = `${compDir}/${rel}`;
    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      if (isExcludedRepoPath(repoRel)) continue;
      walk(path.join(dir, entry.name), rel, compDir, files);
    } else if (entry.isFile()) {
      if (EXCLUDE_FILE_NAMES.has(entry.name)) continue;
      if (isExcludedRepoPath(repoRel)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!CODE_EXTENSIONS.has(ext)) continue;
      files.push({ rel, ext });
    }
  }
}

// ── Scan one component ─────────────────────────────────────────────────────
function scanComponent(comp) {
  const compDir = path.join(repoRoot, comp.dir);
  const result = {
    name: comp.name,
    dir: comp.dir,
    files: 0,
    lines: 0,
    testFiles: 0,
    testLines: 0,
    scenarios: 0,
    languages: {},
  };

  const files = [];
  walk(compDir, '', comp.dir, files);

  for (const { rel, ext } of files) {
    const full = path.join(compDir, rel);
    let content;
    try {
      content = fs.readFileSync(full, 'utf8');
    } catch {
      continue;
    }
    const lines = countNonBlankLines(content);
    result.files++;
    result.lines += lines;

    const lang = langForExt(ext);
    if (lang) result.languages[lang] = (result.languages[lang] || 0) + 1;

    if (isTestFile(rel, ext)) {
      result.testFiles++;
      result.testLines += lines;
      result.scenarios += countScenarios(content, ext);
    }
  }
  return result;
}

function langForExt(ext) {
  for (const [lang, exts] of Object.entries(EXT_BY_LANG)) {
    if (exts.has(ext)) return lang;
  }
  return null;
}

function countNonBlankLines(content) {
  let n = 0;
  for (const line of content.split(/\r?\n/)) {
    if (line.trim().length > 0) n++;
  }
  return n;
}

// ── Markdown report ─────────────────────────────────────────────────────────
function primaryLanguage(comp) {
  const entries = Object.entries(comp.languages).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return '—';
  return entries.map(([lang, n]) => `${lang} (${n})`).join(', ');
}

function formatNumber(n) {
  return n.toLocaleString('en-US');
}

function buildMarkdown(results, generatedAt) {
  const date = new Date(generatedAt);
  const ts = date.toISOString().replace('T', ' ').replace(/\..+/, '') + ' UTC';

  const totals = results.reduce(
    (t, r) => ({
      files: t.files + r.files,
      lines: t.lines + r.lines,
      testFiles: t.testFiles + r.testFiles,
      testLines: t.testLines + r.testLines,
      scenarios: t.scenarios + r.scenarios,
    }),
    { files: 0, lines: 0, testFiles: 0, testLines: 0, scenarios: 0 }
  );

  let md = '';
  md += '# Lines of Code & Test Scenarios — Monthly Report\n\n';
  md += `> Auto-generated by \`scripts/loc-stats.js\` on ${ts}.\n`;
  md += '> Regenerated monthly by the `loc-stats.yml` workflow; this file is\n';
  md += '> committed so the trend is preserved in history.\n\n';
  md += '## Methodology\n\n';
  md += '- **Source LOC**: non-blank lines in hand-written source files (TypeScript,\n';
  md += '  JavaScript, JSON, C#, Kotlin).\n';
  md += '- **Excluded**: `node_modules`, `dist`, `out`, `bin`, `obj`, build/\n';
  md += '  bundler output, lockfiles, generated webview bundles, and the VCS dir.\n';
  md += '- **Test files**: `*.test.*`, `*.spec.*` (TS/JS), `*Test*.cs` (C#).\n';
  md += '- **Test scenarios**: discovered by scanning for `it(`/`test(`/`describe(`\n';
  md += '  (TS/JS), `@Test`/`@ParameterizedTest` (Kotlin), and\n';
  md += '  `[Fact]`/`[Theory]`/`[TestMethod]` (C#).\n\n';

  md += '## Summary\n\n';
  md += '| Component | Files | Source LOC | Test Files | Test LOC | Test Scenarios | Primary Languages |\n';
  md += '|---|---:|---:|---:|---:|---:|---|\n';
  for (const r of results) {
    md += `| ${r.name} | ${formatNumber(r.files)} | ${formatNumber(r.lines)} | ${formatNumber(r.testFiles)} | ${formatNumber(r.testLines)} | ${formatNumber(r.scenarios)} | ${primaryLanguage(r)} |\n`;
  }
  md += `| **TOTAL** | **${formatNumber(totals.files)}** | **${formatNumber(totals.lines)}** | **${formatNumber(totals.testFiles)}** | **${formatNumber(totals.testLines)}** | **${formatNumber(totals.scenarios)}** | |\n\n`;

  md += '## Per-Component Breakdown\n\n';
  for (const r of results) {
    md += `### ${r.name} (\`${r.dir}/\`)\n\n`;
    md += `- Source files: ${formatNumber(r.files)}\n`;
    md += `- Source LOC: ${formatNumber(r.lines)}\n`;
    md += `- Test files: ${formatNumber(r.testFiles)}\n`;
    md += `- Test LOC: ${formatNumber(r.testLines)}\n`;
    md += `- Test scenarios: ${formatNumber(r.scenarios)}\n`;
    md += `- Primary languages: ${primaryLanguage(r)}\n\n`;
  }

  md += '## Historical Trend\n\n';
  md += '| Date | Source LOC | Test LOC | Test Scenarios |\n';
  md += '|---|---:|---:|---:|\n';
  md += `| ${date.toISOString().slice(0, 10)} | ${formatNumber(totals.lines)} | ${formatNumber(totals.testLines)} | ${formatNumber(totals.scenarios)} |\n\n`;
  md += '<!-- Append a new row to the table above each month to track the trend. -->\n';

  return md;
}

// ── Main ───────────────────────────────────────────────────────────────────
function main() {
  const results = [];
  for (const comp of COMPONENTS) {
    if (!fs.existsSync(path.join(repoRoot, comp.dir))) continue;
    results.push(scanComponent(comp));
  }

  const generatedAt = new Date().toISOString();
  const md = buildMarkdown(results, generatedAt);
  const outPath = path.resolve(repoRoot, args.out);
  fs.writeFileSync(outPath, md, 'utf8');

  // Print a short summary to stdout for workflow logs.
  const totals = results.reduce(
    (t, r) => ({
      files: t.files + r.files,
      lines: t.lines + r.lines,
      scenarios: t.scenarios + r.scenarios,
    }),
    { files: 0, lines: 0, scenarios: 0 }
  );
  process.stdout.write(`LOC stats written to ${outPath}\n`);
  process.stdout.write(
    `Files: ${totals.files} | Source LOC: ${formatNumber(totals.lines)} | Test scenarios: ${formatNumber(totals.scenarios)}\n`
  );
}

main();
