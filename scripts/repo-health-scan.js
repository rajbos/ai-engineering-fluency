#!/usr/bin/env node
'use strict';
/**
 * Repo health scan — one deterministic pass over eight code-health topics.
 *
 * Topics: style & validation, naming consistency, cyclomatic complexity, large
 * files, dead code, duplicate code, code modularization, technical debt.
 *
 * This is the zero-AI-cost half of the daily repo-health routine. It only
 * *finds* things; the `repo-health-scan` agent (.github/agents/ and
 * .claude/agents/) picks one finding per run, opens an issue for it and fixes it
 * in a PR. Every finding carries a stable fingerprint (`id`) that is embedded in
 * the issue body as a visible `repo-health-id: rh-…` footer, so a finding that is
 * already tracked — or was closed as "not planned" — is never picked again.
 *
 * Where the repo already has a detector, this script runs it rather than
 * re-implementing it: ESLint (vscode-extension/eslint.config.mjs, which lints
 * vscode-extension/src and the shared src/) supplies style, naming, complexity
 * and unused-variable findings, and scripts/check-code-duplication.js supplies
 * clone groups. Everything else (file naming, file size, unused exports, layer
 * boundaries, import cycles, debt markers) is computed here from `git ls-files`.
 *
 * Usage:
 *   node scripts/repo-health-scan.js                        # Markdown report
 *   node scripts/repo-health-scan.js --json                 # full report as JSON
 *   node scripts/repo-health-scan.js --dashboard --previous prev-body.md
 *                                                           # tracking-issue body with trend
 *   node scripts/repo-health-scan.js --pick --tracked tracked.txt [--date 2026-09-28]
 *                                                           # one untracked finding + issue text
 *   --skip-eslint   skip the ESLint-backed topics (fast; for local iteration)
 *   --from FILE     render from a saved `--json` report instead of scanning again
 *   --out FILE      write to FILE instead of stdout
 *
 * `--tracked` takes any text (e.g. `gh issue list --json body`) and extracts the
 * `repo-health-id` markers from it. ESLint findings need `npm ci` in
 * vscode-extension/; without it the scan still runs and says what it skipped.
 *
 * Exit codes: 0 = ok | 2 = could not run.
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');

const CATEGORIES = [
	{ id: 'style', title: 'Style & validation' },
	{ id: 'naming', title: 'Naming consistency' },
	{ id: 'complexity', title: 'Cyclomatic complexity' },
	{ id: 'large-file', title: 'Large files' },
	{ id: 'dead-code', title: 'Dead code' },
	{ id: 'duplication', title: 'Duplicate code' },
	{ id: 'modularization', title: 'Modularization' },
	{ id: 'tech-debt', title: 'Technical debt' },
];

const SEVERITY_RANK = { error: 3, warning: 2, info: 1 };
const EFFORT_RANK = { S: 1, M: 2, L: 3 };

// Matches the ESLint `max-lines` ceiling; the warn level flags files well before it.
const LARGE_FILE_WARN = 1500;
const LARGE_FILE_ERROR = 6000;
const DUPLICATION_MIN_LINES = 14; // same window the CI step summary uses

const SOURCE_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs', '.cs', '.kt', '.kts', '.py', '.ps1']);
const JS_LIKE_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.cjs']);
// Files whose text can reference an exported TS symbol (webview HTML, JSON config).
const REFERENCE_EXTS = new Set([...JS_LIKE_EXTS, '.html', '.json']);
const MAX_REFERENCE_FILE_BYTES = 2 * 1024 * 1024;

const EXCLUDED_SEGMENTS = new Set([
	'node_modules', 'dist', 'out', 'bin', 'obj', 'build', 'coverage', '.gradle',
	'graphify-out', '.graphify-agent', 'visual-output', 'test-fixtures', 'fixtures',
]);
const EXCLUDED_PREFIXES = [
	'visualstudio-extension/src/AIEngineeringFluency/webview/', // generated bundles
];

// TypeScript trees analysed for exports, imports and layering.
const TS_TREES = ['src', 'vscode-extension/src', 'cli/src', 'desktop/src'];

// Filename convention is inferred per tree from its dominant style.
const NAMING_TREES = [
	{ dir: 'src', exts: JS_LIKE_EXTS },
	{ dir: 'vscode-extension/src', exts: JS_LIKE_EXTS },
	{ dir: 'cli/src', exts: JS_LIKE_EXTS },
	{ dir: 'desktop/src', exts: JS_LIKE_EXTS },
	{ dir: 'sharing-server/src', exts: JS_LIKE_EXTS },
	{ dir: 'visualstudio-extension', exts: new Set(['.cs']) },
	{ dir: 'jetbrains-plugin/src', exts: new Set(['.kt']) },
];
const NAMING_DOMINANCE = 0.6;

// Exports consumed by a host rather than by repo code.
const EXPORT_ALLOWLIST = new Set(['activate', 'deactivate', 'default']);

// Reported, but never auto-picked: extension.ts is being decomposed on its own
// plan (docs/adr/EXTENSION-TS-DECOMPOSITION.md), not one daily PR at a time.
const PICK_EXCLUDED_FILES = new Set(['vscode-extension/src/extension.ts']);

// Layering rules for modularization. `from` is the importing tree; an import
// resolving under any `forbidden` prefix is a violation.
const LAYER_RULES = [
	{
		from: 'src/',
		forbidden: ['vscode-extension/', 'cli/', 'desktop/', 'sharing-server/'],
		why: 'the shared src/ layer is consumed by the extension, CLI and desktop app and must not depend on any of them',
	},
	{
		from: 'cli/src/',
		forbidden: ['vscode-extension/src/', 'desktop/'],
		why: 'the CLI consumes shared logic from src/ only (AGENTS.md: "CLI Must Reuse Shared Functions")',
	},
	{
		from: 'vscode-extension/src/webview/',
		forbidden: ['vscode-extension/src/extension.ts'],
		why: 'webview bundles run in the browser sandbox and talk to the extension host only via postMessage',
	},
];

const COMPLEXITY_RULES = new Set(['complexity', 'sonarjs/cognitive-complexity', 'max-depth', 'max-lines-per-function']);
const NAMING_RULES = new Set(['@typescript-eslint/naming-convention']);
const DEAD_CODE_RULES = new Set(['@typescript-eslint/no-unused-vars', 'no-unused-vars', 'no-unreachable']);
const IGNORED_ESLINT_RULES = new Set(['max-lines']); // covered by the large-file topic
// Extra rules switched on for the scan only (the build config does not enable them).
const SCAN_ONLY_RULES = {
	'@typescript-eslint/no-unused-vars': ['warn', { args: 'none', ignoreRestSiblings: true, caughtErrors: 'none' }],
	'no-unreachable': 'warn',
};

// ── helpers ─────────────────────────────────────────────────────────────────

function toPosix(p) { return p.split(path.sep).join('/'); }

function shortHash(text) {
	return crypto.createHash('sha1').update(text).digest('hex').slice(0, 12);
}

function isExcluded(rel) {
	if (EXCLUDED_PREFIXES.some(p => rel.startsWith(p))) { return true; }
	return rel.split('/').some(seg => EXCLUDED_SEGMENTS.has(seg));
}

function isTestFile(rel) {
	return /\.(test|spec)\.[cm]?[jt]sx?$/i.test(rel) || /(^|\/)tests?\//i.test(rel);
}

function countNonBlankLines(text) {
	let n = 0;
	for (const line of text.split('\n')) { if (line.trim() !== '') { n++; } }
	return n;
}

/**
 * Build a finding. `key` must be stable across unrelated edits (a symbol name,
 * a file, a hash of content — never a line number), because the fingerprint
 * derived from it is what de-duplicates issues across daily runs.
 */
function makeFinding({ category, file, line = 1, key, title, detail = '', severity = 'warning', effort = 'M', weight = 0, pickable = true }) {
	const excluded = PICK_EXCLUDED_FILES.has(file);
	return {
		id: `rh-${shortHash(`${category}|${file}|${key}`)}`,
		category, file, line, key, title, detail, severity, effort, weight,
		pickable: pickable && !excluded,
	};
}

// ── file inventory ──────────────────────────────────────────────────────────

function listTrackedFiles(root) {
	const res = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
	if (res.status !== 0) { throw new Error(`git ls-files failed: ${res.stderr || res.error}`); }
	return res.stdout.split('\0').filter(Boolean).map(toPosix).filter(rel => !isExcluded(rel));
}

function makeReader(root) {
	const cache = new Map();
	return rel => {
		if (!cache.has(rel)) {
			let text = null;
			try {
				const abs = path.join(root, rel);
				if (fs.statSync(abs).size <= MAX_REFERENCE_FILE_BYTES) { text = fs.readFileSync(abs, 'utf8'); }
			} catch { text = null; }
			cache.set(rel, text);
		}
		return cache.get(rel);
	};
}

// ── ESLint-backed topics: style, naming, complexity, dead code ─────────────

function runEslint(root) {
	const cwd = path.join(root, 'vscode-extension');
	const bin = path.join(cwd, 'node_modules', 'eslint', 'bin', 'eslint.js');
	if (!fs.existsSync(bin)) {
		return { results: [], note: 'ESLint topics skipped: run `npm ci` in vscode-extension/ first.' };
	}
	const args = [bin, 'src', '../src', '--format', 'json', '--rule', JSON.stringify(SCAN_ONLY_RULES)];
	const res = spawnSync(process.execPath, args, { cwd, encoding: 'utf8', maxBuffer: 512 * 1024 * 1024 });
	try {
		const results = JSON.parse(res.stdout).map(r => ({ ...r, filePath: toPosix(path.relative(root, r.filePath)) }));
		return { results, note: null };
	} catch {
		return { results: [], note: `ESLint topics skipped: ESLint produced no JSON (exit ${res.status}). ${(res.stderr || '').slice(0, 300)}` };
	}
}

/** Best-effort name of the function declared on `line` (1-based) of `text`. */
function functionNameAt(text, line) {
	if (!text) { return null; }
	const src = (text.split('\n')[line - 1] || '').trim();
	const patterns = [
		/function\*?\s+([A-Za-z_$][\w$]*)/,
		/([A-Za-z_$][\w$]*)\s*[:=]\s*(?:async\s*)?(?:function\b|\([^)]*\)\s*(?::[^=]+)?=>|[A-Za-z_$][\w$]*\s*=>)/,
		/^(?:(?:public|private|protected|static|async|override|readonly|get|set)\s+)*([A-Za-z_$][\w$]*)\s*(?:<[^>]*>)?\s*\(/,
	];
	for (const re of patterns) {
		const m = src.match(re);
		if (m && !['if', 'for', 'while', 'switch', 'catch', 'return'].includes(m[1])) { return m[1]; }
	}
	return null;
}

function quotedName(message) {
	const m = /'([^']+)'|`([^`]+)`/.exec(message);
	return m ? (m[1] || m[2]) : null;
}

function eslintFindings(results, read) {
	const findings = [];
	for (const r of results) {
		const file = r.filePath;
		const style = new Map();
		const complexity = new Map();
		for (const msg of r.messages || []) {
			const rule = msg.ruleId || 'parse-error';
			if (IGNORED_ESLINT_RULES.has(rule)) { continue; }
			if (COMPLEXITY_RULES.has(rule)) {
				const name = quotedName(msg.message) || functionNameAt(read(file), msg.line) || `line ${msg.line}`;
				if (!complexity.has(name)) { complexity.set(name, { line: msg.line, rules: [], metrics: [] }); }
				complexity.get(name).rules.push(rule.replace(/^sonarjs\//, ''));
				complexity.get(name).metrics.push(`${rule}: ${msg.message}`);
			} else if (NAMING_RULES.has(rule)) {
				const name = quotedName(msg.message) || `line ${msg.line}`;
				findings.push(makeFinding({
					category: 'naming', file, line: msg.line, key: `eslint:${name}`, effort: 'S',
					title: `\`${name}\` violates the naming convention`, detail: msg.message,
				}));
			} else if (DEAD_CODE_RULES.has(rule)) {
				const name = quotedName(msg.message) || `line ${msg.line}`;
				findings.push(makeFinding({
					category: 'dead-code', file, line: msg.line, key: `${rule}:${name}`, effort: 'S',
					title: rule === 'no-unreachable' ? `Unreachable code near \`${name}\`` : `\`${name}\` is declared but never used`,
					detail: msg.message,
				}));
			} else {
				const entry = style.get(rule) || { count: 0, line: msg.line, severity: msg.severity };
				entry.count++;
				style.set(rule, entry);
			}
		}
		for (const [name, info] of complexity) {
			findings.push(makeFinding({
				category: 'complexity', file, line: info.line, key: name, effort: 'M', weight: info.metrics.length,
				severity: info.metrics.length > 1 ? 'warning' : 'info',
				title: `\`${name}\` is over the limit for ${info.rules.join(', ')}`,
				detail: info.metrics.join('\n'),
			}));
		}
		if (style.size > 0) {
			const total = [...style.values()].reduce((a, e) => a + e.count, 0);
			const firstLine = Math.min(...[...style.values()].map(e => e.line));
			const hasError = [...style.values()].some(e => e.severity === 2);
			findings.push(makeFinding({
				category: 'style', file, line: firstLine, key: 'eslint-style', effort: 'S', weight: total,
				severity: hasError ? 'error' : 'warning',
				title: `${total} ESLint style/validation issue${total === 1 ? '' : 's'}`,
				detail: [...style.entries()].map(([rule, e]) => `${rule}: ${e.count}`).join('\n'),
			}));
		}
	}
	return findings;
}

// ── naming consistency (file names) ─────────────────────────────────────────

/** Classify a file stem (basename up to the first dot). `lower` is a single lowercase word, compatible with camel/kebab/snake. */
function classifyStem(stem) {
	if (/^[a-z][a-z0-9]*$/.test(stem)) { return 'lower'; }
	if (/^[a-z][a-zA-Z0-9]*$/.test(stem)) { return 'camelCase'; }
	if (/^[A-Z][a-zA-Z0-9]*$/.test(stem)) { return 'PascalCase'; }
	if (/^[a-z0-9]+(-[a-z0-9]+)+$/.test(stem)) { return 'kebab-case'; }
	if (/^[a-z0-9]+(_[a-z0-9]+)+$/.test(stem)) { return 'snake_case'; }
	return 'mixed';
}

function isCompatible(style, dominant) {
	if (style === dominant) { return true; }
	return style === 'lower' && dominant !== 'PascalCase';
}

function namingFindings(files) {
	const findings = [];
	for (const tree of NAMING_TREES) {
		const prefix = `${tree.dir}/`;
		const entries = files
			.filter(f => f.startsWith(prefix) && tree.exts.has(path.posix.extname(f)))
			.map(f => ({ file: f, style: classifyStem(path.posix.basename(f).split('.')[0]) }));
		const counts = {};
		for (const e of entries) { if (e.style !== 'lower') { counts[e.style] = (counts[e.style] || 0) + 1; } }
		const ranked = Object.entries(counts).sort((a, b) => b[1] - a[1]);
		if (ranked.length === 0) { continue; }
		const [dominant, domCount] = ranked[0];
		const decided = ranked.reduce((a, [, n]) => a + n, 0);
		if (domCount / decided < NAMING_DOMINANCE) { continue; }
		for (const e of entries) {
			if (isCompatible(e.style, dominant)) { continue; }
			findings.push(makeFinding({
				category: 'naming', file: e.file, key: 'filename', effort: 'S', severity: 'info',
				title: `File name is ${e.style}; \`${tree.dir}/\` uses ${dominant}`,
				detail: `${domCount} of ${decided} files in ${tree.dir}/ are ${dominant}. Rename the file and update every import of it.`,
			}));
		}
	}
	return findings;
}

// ── large files ─────────────────────────────────────────────────────────────

function largeFileFindings(files, read) {
	const findings = [];
	for (const file of files) {
		if (!SOURCE_EXTS.has(path.posix.extname(file))) { continue; }
		const text = read(file);
		if (text === null) { continue; }
		const lines = countNonBlankLines(text);
		const warnAt = isTestFile(file) ? LARGE_FILE_WARN * 2 : LARGE_FILE_WARN;
		if (lines < warnAt) { continue; }
		findings.push(makeFinding({
			category: 'large-file', file, key: 'size', effort: 'L', weight: lines,
			severity: lines >= LARGE_FILE_ERROR ? 'error' : 'warning',
			title: `${lines} non-blank lines (threshold ${warnAt})`,
			detail: 'Split a cohesive group of functions into its own module; do not split just to hit a number.',
		}));
	}
	return findings;
}

// ── TypeScript source model: exports and imports ───────────────────────────

const EXPORT_RE = /^export\s+(?:declare\s+)?(?:default\s+)?(?:abstract\s+)?(?:async\s+)?(?:function\*?|const|let|var|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm;
const IMPORT_RE = /(?:^|\n)\s*(import|export)\s+(type\s+)?(?:[^'"]*?\sfrom\s+)?['"]([^'"]+)['"]|require\(\s*['"]([^'"]+)['"]\s*\)|import\(\s*['"]([^'"]+)['"]\s*\)/g;

function tsSourceFiles(files) {
	return files.filter(f => TS_TREES.some(t => f.startsWith(`${t}/`)) && /\.tsx?$/.test(f) && !f.endsWith('.d.ts'));
}

function parseExports(text) {
	const names = [];
	EXPORT_RE.lastIndex = 0;
	let m;
	while ((m = EXPORT_RE.exec(text)) !== null) { names.push({ name: m[1], line: text.slice(0, m.index).split('\n').length }); }
	return names;
}

function parseImports(text) {
	const out = [];
	IMPORT_RE.lastIndex = 0;
	let m;
	while ((m = IMPORT_RE.exec(text)) !== null) {
		const spec = m[3] || m[4] || m[5];
		out.push({ spec, typeOnly: Boolean(m[2]) });
	}
	return out;
}

function resolveImport(fromFile, spec, fileSet) {
	if (!spec.startsWith('.')) { return null; }
	const base = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), spec));
	const stripped = base.replace(/\.(js|mjs|cjs)$/, '');
	const candidates = [base, `${stripped}.ts`, `${stripped}.tsx`, `${base}.ts`, `${base}.tsx`, `${base}.js`, `${base}.json`, `${base}/index.ts`, `${base}/index.js`];
return candidates.find(c => fileSet.has(c)) || null;
}

// ── dead code: exports nothing references ───────────────────────────────────

function unusedExportFindings(files, read) {
	const candidates = new Map(); // name -> [{file, line}]
	for (const file of tsSourceFiles(files)) {
		if (isTestFile(file)) { continue; }
		for (const exp of parseExports(read(file) || '')) {
			if (EXPORT_ALLOWLIST.has(exp.name)) { continue; }
			if (!candidates.has(exp.name)) { candidates.set(exp.name, []); }
			candidates.get(exp.name).push({ file, line: exp.line });
		}
	}
	// Count word occurrences of candidate names per file, across everything that can reference them.
	const occurrences = new Map(); // name -> Map(file -> count)
	for (const file of files) {
		if (!REFERENCE_EXTS.has(path.posix.extname(file))) { continue; }
		const text = read(file);
		if (!text) { continue; }
		for (const word of text.match(/[A-Za-z_$][\w$]*/g) || []) {
			if (!candidates.has(word)) { continue; }
			if (!occurrences.has(word)) { occurrences.set(word, new Map()); }
			const perFile = occurrences.get(word);
			perFile.set(file, (perFile.get(file) || 0) + 1);
		}
	}
	const findings = [];
	for (const [name, decls] of candidates) {
		const perFile = occurrences.get(name) || new Map();
		for (const decl of decls) {
			const inOwnFile = perFile.get(decl.file) || 0;
			const elsewhere = [...perFile.keys()].some(f => f !== decl.file);
			if (inOwnFile > 1 || elsewhere) { continue; }
			findings.push(makeFinding({
				category: 'dead-code', file: decl.file, line: decl.line, key: `export:${name}`, effort: 'S',
				title: `Export \`${name}\` is never referenced`,
				detail: 'No other tracked TS/JS/HTML/JSON file mentions this name, and its own file does not use it.',
			}));
		}
	}
	return findings;
}

// ── duplicate code ──────────────────────────────────────────────────────────

function duplicationFindings(root) {
	const script = path.join(__dirname, 'check-code-duplication.js');
	const res = spawnSync(process.execPath, [script, '--json', '--min-lines', String(DUPLICATION_MIN_LINES), '--root', root], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
	let report;
	try { report = JSON.parse(res.stdout); } catch { return { findings: [], note: 'Duplicate-code topic skipped: check-code-duplication.js produced no JSON.' }; }
	const findings = (report.groups || []).map(g => {
		const occ = g.occurrences || [];
		const files = [...new Set(occ.map(o => o.file))].sort();
		const where = occ.map(o => `${o.file}:${o.startLine}-${o.endLine}`).join('\n');
		return makeFinding({
			category: 'duplication', file: occ[0].file, line: occ[0].startLine,
			key: shortHash(`${files.join('|')}|${g.preview || ''}`), effort: g.lines > 60 ? 'L' : 'M', weight: g.lines * occ.length,
			severity: g.lines >= 40 ? 'warning' : 'info',
			title: `${g.lines} duplicated lines × ${occ.length} (${files.map(f => path.posix.basename(f)).join(', ')})`,
			detail: `${where}\n\nExtract one shared helper (see the deduplicate-code skill).`,
		});
	});
	return { findings, note: null };
}

// ── modularization: layering, CLI re-implementation, import cycles ─────────

function layerViolations(file, imports) {
	const out = [];
	for (const rule of LAYER_RULES) {
		if (!file.startsWith(rule.from)) { continue; }
		for (const imp of imports) {
			if (!imp.resolved) { continue; }
			const hit = rule.forbidden.find(p => imp.resolved.startsWith(p) || imp.resolved === p);
			if (hit) { out.push({ rule, target: imp.resolved }); }
		}
	}
	return out;
}

/** Strongly connected components (Tarjan) of size > 1 — each one is an import cycle. */
function findCycles(graph) {
	let index = 0;
	const stack = [];
	const onStack = new Set();
	const idx = new Map();
	const low = new Map();
	const cycles = [];
	function strongConnect(v) {
		idx.set(v, index); low.set(v, index); index++;
		stack.push(v); onStack.add(v);
		for (const w of graph.get(v) || []) {
			if (!idx.has(w)) { strongConnect(w); low.set(v, Math.min(low.get(v), low.get(w))); }
			else if (onStack.has(w)) { low.set(v, Math.min(low.get(v), idx.get(w))); }
		}
		if (low.get(v) === idx.get(v)) {
			const comp = [];
			let w;
			do { w = stack.pop(); onStack.delete(w); comp.push(w); } while (w !== v);
			if (comp.length > 1) { cycles.push(comp.sort()); }
		}
	}
	for (const v of graph.keys()) { if (!idx.has(v)) { strongConnect(v); } }
	return cycles;
}

function modularizationFindings(files, read) {
	const fileSet = new Set(files);
	const tsFiles = tsSourceFiles(files).filter(f => !isTestFile(f));
	const findings = [];
	const graph = new Map();
	for (const file of tsFiles) {
		const imports = parseImports(read(file) || '').map(i => ({ ...i, resolved: resolveImport(file, i.spec, fileSet) }));
		for (const v of layerViolations(file, imports)) {
			findings.push(makeFinding({
				category: 'modularization', file, key: `layer:${v.target}`, effort: 'M', severity: 'error',
				title: `Imports \`${v.target}\` across a layer boundary`,
				detail: `\`${v.rule.from}\` must not import from ${v.rule.forbidden.map(p => `\`${p}\``).join(', ')}: ${v.rule.why}.`,
			}));
		}
		graph.set(file, imports.filter(i => !i.typeOnly && i.resolved && tsFiles.includes(i.resolved)).map(i => i.resolved));
	}
	for (const cycle of findCycles(graph)) {
		findings.push(makeFinding({
			category: 'modularization', file: cycle[0], key: `cycle:${shortHash(cycle.join('|'))}`,
			effort: cycle.length > 3 ? 'L' : 'M', weight: cycle.length, severity: 'warning',
			title: `Import cycle through ${cycle.length} modules`,
			detail: `${cycle.join('\n')}\n\nBreak it by moving the shared piece both sides need into a lower-level module (or use \`import type\` where only types flow).`,
		}));
	}
	// The CLI must call shared functions, not re-declare them (AGENTS.md).
	const shared = new Set();
	for (const f of tsFiles.filter(f => f.startsWith('src/'))) {
		for (const e of parseExports(read(f) || '')) { shared.add(e.name); }
	}
	const declRe = /^\s*(?:export\s+)?(?:async\s+)?function\s+([A-Za-z_$][\w$]*)/gm;
	for (const file of tsFiles.filter(f => f.startsWith('cli/src/'))) {
		const text = read(file) || '';
		declRe.lastIndex = 0;
		let m;
		while ((m = declRe.exec(text)) !== null) {
			if (!shared.has(m[1])) { continue; }
			findings.push(makeFinding({
				category: 'modularization', file, line: text.slice(0, m.index).split('\n').length, key: `cli-redeclare:${m[1]}`,
				effort: 'M', severity: 'warning',
				title: `CLI re-declares shared function \`${m[1]}\``,
				detail: `src/ already exports \`${m[1]}\`. AGENTS.md requires the CLI to call the shared implementation rather than re-implement it.`,
			}));
		}
	}
	return findings;
}

// ── technical debt ──────────────────────────────────────────────────────────

const DEBT_MARKER_RE = /(?:\/\/|\/\*|^\s*\*|#)\s*.*?\b(TODO|FIXME|HACK|XXX)\b[:( ]?(.*)$/;

function techDebtScan(files, read) {
	const findings = [];
	const metrics = { markers: 0, tsSuppressions: 0, eslintDisables: 0, explicitAny: 0 };
	for (const file of files) {
		if (!SOURCE_EXTS.has(path.posix.extname(file))) { continue; }
		const text = read(file);
		if (!text) { continue; }
		const lines = text.split('\n');
		const suppressions = [];
		lines.forEach((raw, i) => {
			const marker = DEBT_MARKER_RE.exec(raw);
			if (marker) {
				metrics.markers++;
				findings.push(makeFinding({
					category: 'tech-debt', file, line: i + 1, key: `marker:${shortHash(raw.trim())}`, effort: 'M', severity: 'info',
					title: `${marker[1]}: ${marker[2].trim().slice(0, 80) || '(no description)'}`,
					detail: 'Resolve it, or replace the comment with a tracked issue link if it is genuinely out of scope.',
				}));
			}
			if (/@ts-(ignore|nocheck)\b/.test(raw)) { metrics.tsSuppressions++; suppressions.push(i + 1); }
			if (/eslint-disable/.test(raw)) { metrics.eslintDisables++; }
			if (JS_LIKE_EXTS.has(path.posix.extname(file))) { metrics.explicitAny += (raw.match(/(?::\s*any\b|\bas\s+any\b|<any>)/g) || []).length; }
		});
		if (suppressions.length > 0) {
			findings.push(makeFinding({
				category: 'tech-debt', file, line: suppressions[0], key: 'ts-suppression', effort: 'S', weight: suppressions.length,
				title: `${suppressions.length} \`@ts-ignore\`/\`@ts-nocheck\` suppression${suppressions.length === 1 ? '' : 's'}`,
				detail: `Lines ${suppressions.join(', ')}. Fix the underlying type error, or narrow to \`@ts-expect-error\` with a reason.`,
			}));
		}
	}
	return { findings, metrics };
}

// ── orchestration ───────────────────────────────────────────────────────────

function gitHead(root) {
	const res = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
	return res.status === 0 ? res.stdout.trim() : null;
}

function scan({ root = REPO_ROOT, skipEslint = false } = {}) {
	const files = listTrackedFiles(root);
	const read = makeReader(root);
	const notes = [];
	let findings = [];

	if (skipEslint) {
		notes.push('ESLint topics skipped (--skip-eslint).');
	} else {
		const eslint = runEslint(root);
		if (eslint.note) { notes.push(eslint.note); }
		findings = findings.concat(eslintFindings(eslint.results, read));
	}
	findings = findings.concat(namingFindings(files), largeFileFindings(files, read), unusedExportFindings(files, read));
	const dup = duplicationFindings(root);
	if (dup.note) { notes.push(dup.note); }
	findings = findings.concat(dup.findings, modularizationFindings(files, read));
	const debt = techDebtScan(files, read);
	findings = findings.concat(debt.findings);

	// A finding can surface twice (e.g. two identical TODO lines); keep the first.
	const seen = new Set();
	findings = findings.filter(f => (seen.has(f.id) ? false : (seen.add(f.id), true)));

	const metrics = { ...debt.metrics };
	for (const c of CATEGORIES) { metrics[c.id] = findings.filter(f => f.category === c.id).length; }
	return { generatedAt: new Date().toISOString(), commit: gitHead(root), filesScanned: files.length, notes, metrics, findings };
}

function compareFindings(a, b) {
	return (SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity])
		|| (EFFORT_RANK[a.effort] - EFFORT_RANK[b.effort])
		|| (b.weight - a.weight)
		|| a.id.localeCompare(b.id);
}

function extractTrackedIds(text) {
	return new Set((String(text).match(/repo-health-id:\s*`?rh-[0-9a-f]{12}/g) || []).map(s => s.replace(/^.*(rh-[0-9a-f]{12})$/, '$1')));
}

/** Days since the Unix epoch for a YYYY-MM-DD date, used to rotate the starting topic. */
function dayNumber(isoDate) {
	return Math.floor(Date.parse(`${isoDate}T00:00:00Z`) / 86400000);
}

/**
 * Choose one finding to work on today. The starting topic rotates daily so all
 * eight get attention instead of the cheapest one winning forever; within a
 * topic, the most severe and smallest-effort untracked finding wins.
 */
function pickFinding(findings, tracked, isoDate) {
	const start = ((dayNumber(isoDate) % CATEGORIES.length) + CATEGORIES.length) % CATEGORIES.length;
	for (let i = 0; i < CATEGORIES.length; i++) {
		const cat = CATEGORIES[(start + i) % CATEGORIES.length].id;
		const pool = findings.filter(f => f.category === cat && f.pickable && !tracked.has(f.id)).sort(compareFindings);
		if (pool.length > 0) { return pool[0]; }
	}
	return null;
}

// ── rendering ───────────────────────────────────────────────────────────────

function cell(text) {
	return String(text).replace(/\\/g, '\\\\').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function categoryTitle(id) {
	return (CATEGORIES.find(c => c.id === id) || { title: id }).title;
}

function renderMarkdown(report, { limit = 15 } = {}) {
	const out = ['## Repo health scan', ''];
	out.push(`Commit \`${(report.commit || 'unknown').slice(0, 12)}\` · ${report.filesScanned} tracked files · ${report.findings.length} findings`, '');
	for (const n of report.notes) { out.push(`> ${n}`); }
	if (report.notes.length) { out.push(''); }
	out.push('| Topic | Findings | Top finding |', '|---|---:|---|');
	for (const c of CATEGORIES) {
		const top = report.findings.filter(f => f.category === c.id).sort(compareFindings)[0];
		out.push(`| ${c.title} | ${report.metrics[c.id]} | ${top ? cell(`${top.file}: ${top.title}`) : '—'} |`);
	}
	out.push('', `Debt counters: ${report.metrics.markers} TODO/FIXME markers · ${report.metrics.tsSuppressions} \`@ts-ignore\` · ${report.metrics.eslintDisables} \`eslint-disable\` · ${report.metrics.explicitAny} explicit \`any\``, '');
	for (const c of CATEGORIES) {
		const items = report.findings.filter(f => f.category === c.id).sort(compareFindings);
		if (items.length === 0) { continue; }
		out.push(`<details><summary><strong>${c.title}</strong> (${items.length})</summary>`, '', '| Severity | Location | Finding |', '|---|---|---|');
		for (const f of items.slice(0, limit)) { out.push(`| ${f.severity} | \`${cell(f.file)}:${f.line}\` | ${cell(f.title)} |`); }
		if (items.length > limit) { out.push(`| | | …and ${items.length - limit} more (run with \`--json\`) |`); }
		out.push('', '</details>', '');
	}
	return out.join('\n');
}

// Visible (collapsed) rather than an HTML comment: hidden comments in issue
// bodies are what .github/workflows/validate-input.sh treats as injection.
const METRICS_MARKER_RE = /```json repo-health-metrics\r?\n(\{[^]*?\})\r?\n```/;

function parsePreviousMetrics(text) {
	const m = METRICS_MARKER_RE.exec(String(text || ''));
	if (!m) { return null; }
	try { return JSON.parse(m[1]); } catch { return null; }
}

function formatDelta(now, before) {
	if (before === undefined || before === null) { return ''; }
	const d = now - before;
	if (d === 0) { return ' (±0)'; }
	return d > 0 ? ` (▲ +${d})` : ` (▼ ${d})`;
}

/** Body of the long-lived tracking issue: current counts, change since the previous run, full report. */
function renderDashboard(report, previousText) {
	const prev = parsePreviousMetrics(previousText);
	const prevMetrics = prev ? prev.metrics : {};
	const out = [
		'# Repo health dashboard',
		'',
		'Updated daily by `.github/workflows/repo-health-scan.yml` from `scripts/repo-health-scan.js`.',
		'Individual findings are fixed one per run by the `repo-health-scan` agent; its issues carry the `repo-health` label.',
		'',
		`Last scan: ${report.generatedAt.slice(0, 10)} at \`${(report.commit || 'unknown').slice(0, 12)}\`${prev ? ` · previous: ${prev.date}` : ''}`,
		'',
		'| Topic | Findings | Change |',
		'|---|---:|---|',
	];
	for (const c of CATEGORIES) { out.push(`| ${c.title} | ${report.metrics[c.id]} | ${formatDelta(report.metrics[c.id], prevMetrics[c.id]).trim() || '—'} |`); }
	for (const [key, label] of [['markers', 'TODO/FIXME markers'], ['tsSuppressions', '`@ts-ignore` / `@ts-nocheck`'], ['eslintDisables', '`eslint-disable` comments'], ['explicitAny', 'Explicit `any`']]) {
		out.push(`| ${label} | ${report.metrics[key]} | ${formatDelta(report.metrics[key], prevMetrics[key]).trim() || '—'} |`);
	}
	out.push('', renderMarkdown(report, { limit: 10 }).replace(/^## Repo health scan\n/, '## Details\n'));
	out.push('', '<details><summary>Raw metrics (read back by the next run)</summary>', '', '```json repo-health-metrics',
		JSON.stringify({ date: report.generatedAt.slice(0, 10), metrics: report.metrics }), '```', '', '</details>');
	return out.join('\n');
}

const FIX_GUIDANCE = {
	'style': 'Fix every listed ESLint rule violation in this file. Do not disable rules or add `eslint-disable` comments.',
	'naming': 'Rename to match the convention used by the surrounding code and update every reference (imports, tests, docs, esbuild entry points).',
	'complexity': 'Decompose the function into smaller, single-responsibility helpers without changing its exported signature (see `.github/agents/refactor-large-function.agent.md`).',
	'large-file': 'Move one cohesive group of functions into a new module and re-export or re-import it. Keep the public API unchanged. One cohesive extraction is enough for this issue.',
	'dead-code': 'Confirm nothing uses it (including host-facing APIs, webview HTML, package.json contributions and the sharing-server package API), then delete it.',
	'duplication': 'Extract a single shared helper used by every occurrence (see `.github/skills/deduplicate-code/SKILL.md`). Respect the CLI/extension shared-code rules in AGENTS.md.',
	'modularization': 'Restore the boundary: move the shared piece into the lower layer or invert the dependency. Do not work around it with dynamic requires.',
	'tech-debt': 'Resolve the underlying issue. If it is genuinely out of scope, replace the marker/suppression with a link to a tracked issue explaining why.',
};

function renderIssue(finding) {
	const title = `[repo-health] ${categoryTitle(finding.category)}: ${finding.title.replace(/`/g, '')} in ${path.posix.basename(finding.file)}`;
	const body = [
		`**Topic:** ${categoryTitle(finding.category)} · **Severity:** ${finding.severity} · **Effort:** ${finding.effort}`,
		'',
		`**Location:** \`${finding.file}:${finding.line}\``,
		'',
		'### Finding',
		'',
		finding.title,
		'',
		finding.detail ? `\`\`\`\n${finding.detail}\n\`\`\`` : '',
		'',
		'### How to fix',
		'',
		FIX_GUIDANCE[finding.category] || '',
		'',
		'### Done when',
		'',
		`- \`node scripts/repo-health-scan.js --json\` no longer reports \`${finding.id}\`.`,
		'- Type-check, unit tests, lint and the production build of every touched project pass.',
		'- The PR changes only what this finding needs.',
		'',
		'Found by `scripts/repo-health-scan.js`; worked by the `repo-health-scan` agent.',
		'',
		'---',
		`repo-health-id: \`${finding.id}\``,
	].join('\n');
	return { title: title.slice(0, 200), body };
}

// ── CLI ─────────────────────────────────────────────────────────────────────

function parseArgs(argv) {
	const args = { json: false, dashboard: false, pick: false, skipEslint: false, previous: null, tracked: null, date: null, out: null, from: null, root: REPO_ROOT };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--json') { args.json = true; }
		else if (a === '--dashboard') { args.dashboard = true; }
		else if (a === '--pick') { args.pick = true; }
		else if (a === '--skip-eslint') { args.skipEslint = true; }
		else if (a === '--previous') { args.previous = argv[++i]; }
		else if (a === '--tracked') { args.tracked = argv[++i]; }
		else if (a === '--date') { args.date = argv[++i]; }
		else if (a === '--out') { args.out = argv[++i]; }
		else if (a === '--from') { args.from = argv[++i]; }
		else if (a === '--root') { args.root = path.resolve(argv[++i]); }
		else if (a === '-h' || a === '--help') { args.help = true; }
	}
	return args;
}

function readOptional(file) {
	if (!file) { return ''; }
	try { return fs.readFileSync(file, 'utf8'); } catch { return ''; }
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	if (args.help) {
		process.stdout.write(fs.readFileSync(__filename, 'utf8').split('*/')[0].replace(/^[^]*?\/\*\*/, '').replace(/^ \* ?/gm, ''));
		return;
	}
	let output;
	try {
		const report = args.from
			? JSON.parse(fs.readFileSync(args.from, 'utf8'))
			: scan({ root: args.root, skipEslint: args.skipEslint });
		if (args.pick) {
			const date = args.date || new Date().toISOString().slice(0, 10);
			const finding = pickFinding(report.findings, extractTrackedIds(readOptional(args.tracked)), date);
			output = JSON.stringify(finding ? { finding, issue: renderIssue(finding) } : { finding: null, notes: report.notes }, null, 2);
		} else if (args.dashboard) {
			output = renderDashboard(report, readOptional(args.previous));
		} else if (args.json) {
			output = JSON.stringify(report, null, 2);
		} else {
			output = renderMarkdown(report);
		}
	} catch (err) {
		process.stderr.write(`repo-health-scan: ${err.message}\n`);
		process.exitCode = 2;
		return;
	}
	if (args.out) { fs.writeFileSync(args.out, `${output}\n`); } else { process.stdout.write(`${output}\n`); }
}

module.exports = {
	CATEGORIES,
	classifyStem,
	isCompatible,
	namingFindings,
	functionNameAt,
	eslintFindings,
	parseExports,
	parseImports,
	resolveImport,
	layerViolations,
	findCycles,
	extractTrackedIds,
	pickFinding,
	compareFindings,
	makeFinding,
	parsePreviousMetrics,
	renderDashboard,
	renderMarkdown,
	renderIssue,
	parseArgs,
	LAYER_RULES,
};

if (require.main === module) {
	main();
}
