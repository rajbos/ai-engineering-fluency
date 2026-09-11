#!/usr/bin/env node
'use strict';
/**
 * Code duplication (copy-paste) detection \u2014 "is the same block of code in two places?"
 *
 * The repo already has a complexity analysis (ESLint complexity rules \u2192 step summary)
 * and an LLM Code Quality Reviewer that *mentions* duplication, but nothing
 * deterministic flags a copied block. This fills that gap with a dependency-free
 * duplicate-block detector: it normalizes source lines, hashes sliding windows of
 * a minimum length, groups identical windows, extends each group to its maximal
 * shared block, and reports the clone groups as Markdown (for $GITHUB_STEP_SUMMARY)
 * or JSON (for tooling).
 *
 * Like the complexity analysis this is **report-only by default** \u2014 it surfaces
 * duplication on every PR without failing the build on pre-existing clones. Pass
 * `--fail-threshold N` to make it a gate (exit 1 when total duplicated lines > N).
 *
 * A "duplicate group" is a normalized sequence of >= `--min-lines` lines that
 * occurs in two or more places (cross-file, or non-overlapping within one file).
 * Lines are normalized (whitespace collapsed, comments and blank lines dropped)
 * so re-indented or re-commented copies are still caught. A group is extended to
 * its maximal block by requiring *every* occurrence to agree on the preceding and
 * following lines, which keeps each group's content consistent and unambiguous.
 *
 * Usage:
 *   node scripts/check-code-duplication.js                  # report to stdout
 *   node scripts/check-code-duplication.js --json           # machine-readable
 *   node scripts/check-code-duplication.js --min-lines 8     # larger blocks only
 *   node scripts/check-code-duplication.js --include 'cli/src/<glob>'
 *   node scripts/check-code-duplication.js --fail-threshold 200
 *
 * Exit codes: 0 = ok (or report-only pass) | 1 = threshold exceeded | 2 = could not run.
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');

const DEFAULT_INCLUDES = [
	'vscode-extension/src/**/*.ts',
	'src/**/*.ts',
	'cli/src/**/*.ts',
];

const MIN_LINES_DEFAULT = 6;

function parseArgs(argv) {
	const args = {
		minLines: MIN_LINES_DEFAULT,
		includes: [],
		json: false,
		failThreshold: null,
		root: REPO_ROOT,
	};
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		if (a === '--min-lines') {
			args.minLines = Math.max(1, parseInt(argv[++i], 10) || MIN_LINES_DEFAULT);
		} else if (a === '--include') {
			args.includes.push(argv[++i]);
		} else if (a === '--json') {
			args.json = true;
		} else if (a === '--fail-threshold') {
			args.failThreshold = parseInt(argv[++i], 10);
			if (Number.isNaN(args.failThreshold)) { args.failThreshold = null; }
		} else if (a === '--root') {
			args.root = path.resolve(argv[++i]);
		} else if (a === '--help' || a === '-h') {
			process.stdout.write(USAGE);
			process.exit(0);
		}
	}
	if (args.includes.length === 0) { args.includes = DEFAULT_INCLUDES.slice(); }
	return args;
}

const USAGE = `Usage: check-code-duplication.js [options]
  --min-lines N        Minimum lines per duplicate block (default ${MIN_LINES_DEFAULT})
  --include GLOB       Add a source glob (repeatable; default: the three source dirs)
  --json               Emit JSON instead of Markdown
  --fail-threshold N   Exit 1 when total duplicated lines > N (default: report only)
  --root DIR           Repo root to resolve globs against (default: repo root)
  -h, --help           Show this help
`;

/** Strip a line to its normalized, whitespace-collapsed form. */
function normalizeLine(raw) {
	let line = raw.replace(/\s+/g, ' ').trim();
	return line;
}

/**
 * Returns true for a line that carries no code signal: blank, or a line that is
 * only a comment. Comment-only lines are dropped so a copied block that gained or
 * lost comments is still detected; inline trailing comments are kept (they rarely
 * span whole lines and the whitespace normalization handles trailing spaces).
 */
function isNoise(line) {
	if (line === '') { return true; }
	const t = line.trim();
	if (t === '') { return true; }
	if (t.startsWith('//')) { return true; }
	if (t.startsWith('/*') || t.startsWith('*')) { return true; }
	if (t.startsWith('*/')) { return true; }
	return false;
}

/**
 * Read a source file and return an array of { text: normalizedLine, line: originalLineNo }.
 * Noise lines are dropped (their original line numbers are not represented), so a
 * duplicate block's reported length counts meaningful lines only.
 */
function tokenizeFile(absPath) {
	let content;
	try {
		content = fs.readFileSync(absPath, 'utf8');
	} catch {
		return null;
	}
	const lines = content.split(/\r?\n/);
	const out = [];
	for (let i = 0; i < lines.length; i++) {
		const norm = normalizeLine(lines[i]);
		if (isNoise(norm)) { continue; }
		out.push({ text: norm, line: i + 1 });
	}
	return out;
}

/*
 * Characters that have special meaning in a RegExp. Everything that is not a
 * glob metacharacter (`*`, `?`) is escaped against this set so a `--include`
 * value can never inject an arbitrary regex — the emitted pattern only ever
 * contains `.*`, `[^/]*`, `[^/]`, and escaped literals.
 */
const REGEX_METACHARS = new Set('\\^$.*+?()[]{}|');

/** Minimal glob -> RegExp matcher supporting **, *, ? and braces-free patterns. */
function globToRegExp(glob) {
	let re = '';
	for (let i = 0; i < glob.length; i++) {
		const c = glob[i];
		if (c === '*') {
			if (glob[i + 1] === '*') {
				re += '.*';
				i++;
				if (glob[i + 1] === '/') { i++; }
			} else {
				re += '[^/]*';
			}
		} else if (c === '?') {
			re += '[^/]';
		} else if (REGEX_METACHARS.has(c)) {
			re += '\\' + c;
		} else {
			re += c;
		}
	}
	return new RegExp('^' + re + '$');
}

/** Walk a directory tree, returning absolute paths of files. */
function walk(dir, out) {
	let entries;
	try {
		entries = fs.readdirSync(dir, { withFileTypes: true });
	} catch {
		return;
	}
	for (const e of entries) {
		if (e.name === 'node_modules' || e.name === 'dist' || e.name === 'out' || e.name === '.git') { continue; }
		const full = path.join(dir, e.name);
		if (e.isDirectory()) { walk(full, out); }
		else if (e.isFile()) { out.push(full); }
	}
}

/** Collect the absolute file paths matching the include globs under root. */
function collectFiles(root, includes) {
	const patterns = includes.map((g) => {
		const re = globToRegExp(g);
		const base = g.startsWith('**') ? root : path.dirname(path.join(root, g)).replace(/\*.*$/, '');
		return { re, base };
	});
	const seen = new Set();
	const result = [];
	for (const { re, base } of patterns) {
		const baseDir = re.source.startsWith('\\*\\*') ? root : base;
		const files = [];
		walk(fs.existsSync(baseDir) ? baseDir : root, files);
		for (const abs of files) {
			if (seen.has(abs)) { continue; }
			const rel = path.relative(root, abs).replace(/\\/g, '/');
			if (re.test(rel)) {
				seen.add(abs);
				result.push(abs);
			}
		}
	}
	return result.sort();
}

/** FNV-1a 32-bit hash of a string. Fast, dependency-free, good distribution. */
function fnv1a(str) {
	let h = 0x811c9dc5;
	for (let i = 0; i < str.length; i++) {
		h ^= str.charCodeAt(i);
		h = Math.imul(h, 0x01000193);
	}
	return (h >>> 0).toString(36);
}

/** Find duplicate groups across the given tokenized files. Pure function. */
function findDuplicates(fileTokens, minLines) {
	const groups = new Map(); // contentHash -> { content: string[], occurrences: [{file, startLine, endLine}] }

	for (const ft of fileTokens) {
		const tokens = ft.tokens;
		for (let i = 0; i + minLines <= tokens.length; i++) {
			const window = tokens.slice(i, i + minLines).map((t) => t.text);
			const content = window.join('\n');
			const hash = fnv1a(content);
			let bucket = groups.get(hash);
			if (!bucket) {
				bucket = { contents: new Map() };
				groups.set(hash, bucket);
			}
			let entry = bucket.contents.get(content);
			if (!entry) {
				entry = { content: window, occurrences: [] };
				bucket.contents.set(content, entry);
			}
			entry.occurrences.push({ file: ft.relPath, startLine: tokens[i].line, endLine: tokens[i + minLines - 1].line });
		}
	}

	// Keep only groups that actually occur in >= 2 places; dedup the occurrence
	// list so a window landing on the exact same lines in the same file twice
	// (impossible for distinct i, but cheap to guard) is not double counted.
	const duplicateGroups = [];
	for (const bucket of groups.values()) {
		for (const entry of bucket.contents.values()) {
			const occ = entry.occurrences;
			const dedup = [];
			for (const o of occ) {
				if (!dedup.some((d) => d.file === o.file && d.startLine === o.startLine)) {
					dedup.push(o);
				}
			}
			if (dedup.length < 2) { continue; }
			duplicateGroups.push({ content: entry.content, occurrences: dedup });
		}
	}

	return extendGroups(duplicateGroups, fileTokens, minLines);
}

/**
 * Extend each duplicate group to its maximal shared block by requiring every
 * occurrence to agree on the preceding and following normalized lines. Occurrences
 * that cannot extend to the full shared block are dropped from that group (they
 * keep only the original window-sized match); groups that collapse below 2
 * occurrences are removed. Lines are matched by their normalized text.
 */
function extendGroups(groups, fileTokens, minLines) {
	const byFile = new Map();
	for (const ft of fileTokens) { byFile.set(ft.relPath, ft.tokens); }

	const result = [];
	for (const g of groups) {
		const occ = g.occurrences.map((o) => ({ ...o, head: 0, tail: g.content.length - 1 }));
		const content = g.content.slice();

		// Extend forward: while every occurrence has a next line that matches the
		// common next line, append it and advance each occurrence's tail.
		let grew = true;
		while (grew) {
			grew = false;
			let commonNext = null;
			let ok = true;
			for (const o of occ) {
				const tokens = byFile.get(o.file);
				const nextIdx = lineIndexOf(tokens, o.endLine) + 1;
				if (nextIdx >= tokens.length) { ok = false; break; }
				const next = tokens[nextIdx].text;
				if (commonNext === null) { commonNext = next; }
				else if (commonNext !== next) { ok = false; break; }
			}
			if (ok && commonNext !== null) {
				content.push(commonNext);
				for (const o of occ) {
					const tokens = byFile.get(o.file);
					o.endLine = tokens[lineIndexOf(tokens, o.endLine) + 1].line;
					o.tail++;
				}
				grew = true;
			}
		}

		// Extend backward.
		grew = true;
		while (grew) {
			grew = false;
			let commonPrev = null;
			let ok = true;
			for (const o of occ) {
				const tokens = byFile.get(o.file);
				const prevIdx = lineIndexOf(tokens, o.startLine) - 1;
				if (prevIdx < 0) { ok = false; break; }
				const prev = tokens[prevIdx].text;
				if (commonPrev === null) { commonPrev = prev; }
				else if (commonPrev !== prev) { ok = false; break; }
			}
			if (ok && commonPrev !== null) {
				content.unshift(commonPrev);
				for (const o of occ) {
					const tokens = byFile.get(o.file);
					o.startLine = tokens[lineIndexOf(tokens, o.startLine) - 1].line;
					o.head++;
				}
				grew = true;
			}
		}

		// The maximal block is `content` (>= minLines by construction). Keep it.
		result.push({
			lines: content.length,
			occurrences: occ.map((o) => ({ file: o.file, startLine: o.startLine, endLine: o.endLine })),
			preview: content.slice(0, 3).join('\n'),
		});
	}

	// Merge overlapping maximal blocks that describe the same clone (a shorter
	// group fully contained in a longer one for the same file/line set is noise).
	result.sort((a, b) => b.lines - a.lines || b.occurrences.length - a.occurrences.length);
	const kept = [];
	const covered = new Set();
	for (const g of result) {
		const key = g.occurrences.map((o) => `${o.file}:${o.startLine}-${o.endLine}`).sort().join('|');
		let subsumed = false;
		for (const k of kept) {
			if (g.lines <= k.lines && occurrencesSubset(g.occurrences, k.occurrences)) {
				subsumed = true;
				break;
			}
		}
		if (subsumed) { continue; }
		if (covered.has(key)) { continue; }
		covered.add(key);
		kept.push(g);
	}
	return kept.sort((a, b) => b.lines - a.lines);
}

/** True when every occurrence in `a` is covered by an occurrence in `b`. */
function occurrencesSubset(a, b) {
	for (const oa of a) {
		let found = false;
		for (const ob of b) {
			if (ob.file === oa.file && oa.startLine >= ob.startLine && oa.endLine <= ob.endLine) {
				found = true;
				break;
			}
		}
		if (!found) { return false; }
	}
	return true;
}

/** Index of the token whose original line number == lineNo (linear; tokens per file is small). */
function lineIndexOf(tokens, lineNo) {
	for (let i = 0; i < tokens.length; i++) {
		if (tokens[i].line === lineNo) { return i; }
	}
	return -1;
}

function totalDuplicatedLines(groups) {
	let total = 0;
	for (const g of groups) { total += g.lines * g.occurrences.length; }
	return total;
}

/** Escape a string for safe use inside a Markdown table cell: backslash first,
 * then the pipe that delimits columns, so source paths/previews cannot break
 * out of the cell or smuggle a column separator. */
function escapeMarkdownCell(s) {
	return s.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

function renderMarkdown(groups, scanned, threshold) {
	let md = '## \u2396\ufe0f\u200d Code Duplication Analysis\n\n';
	md += `| Files scanned | Duplicate groups | Total duplicated lines |\n`;
	md += `|:-------------:|:---------------:|:---------------------:|\n`;
	md += `| ${scanned} | ${groups.length} | ${totalDuplicatedLines(groups)} |\n\n`;

	if (groups.length === 0) {
		md += '\u2705 No duplicate blocks found at the configured minimum length.\n';
		return md;
	}

	const top = groups.slice(0, 10);
	md += '### \ud83d\udd1b Top duplicate groups\n\n';
	md += '| Lines | Occurrences | Files | Preview |\n';
	md += '|:-----:|:-----------:|:------|---------|\n';
	for (const g of top) {
		const files = [...new Set(g.occurrences.map((o) => o.file))].map((f) => `\`${f}\``).join('<br>');
		const preview = escapeMarkdownCell(g.preview).replace(/\n/g, ' … ');
		md += `| ${g.lines} | ${g.occurrences.length} | ${files} | \`${preview}\u2026\` |\n`;
	}
	md += '\n';

	const sorted = [...groups].sort((a, b) =>
		b.lines - a.lines || a.occurrences[0].file.localeCompare(b.occurrences[0].file));
	md += '<details>\n<summary>All duplicate groups</summary>\n\n';
	md += '| Lines | Occurrences | Locations |\n';
	md += '|:-----:|:-----------:|-----------|\n';
	for (const g of sorted) {
		const locs = g.occurrences.map((o) => `\`${o.file}:${o.startLine}-${o.endLine}\``).join('<br>');
		md += `| ${g.lines} | ${g.occurrences.length} | ${locs} |\n`;
	}
	md += '\n</details>\n';

	if (threshold !== null) {
		const total = totalDuplicatedLines(groups);
		md += `\n> Gate: total duplicated lines **${total}** vs threshold **${threshold}** \u2014 `;
		md += total > threshold ? '\u274c exceeds threshold' : '\u2705 within threshold';
		md += '\n';
	}
	return md;
}

function renderJson(groups, scanned, threshold) {
	return JSON.stringify({
		filesScanned: scanned,
		groups: groups.map((g) => ({
			lines: g.lines,
			occurrences: g.occurrences,
			preview: g.preview,
		})),
		totalDuplicatedLines: totalDuplicatedLines(groups),
		threshold,
	}, null, 2);
}

function main() {
	const args = parseArgs(process.argv.slice(2));
	const root = args.root;

	const files = collectFiles(root, args.includes);
	const fileTokens = [];
	for (const abs of files) {
		const tokens = tokenizeFile(abs);
		if (!tokens || tokens.length < args.minLines) { continue; }
		fileTokens.push({ relPath: path.relative(root, abs).replace(/\\/g, '/'), tokens });
	}

	const groups = findDuplicates(fileTokens, args.minLines);
	const total = totalDuplicatedLines(groups);

	if (args.json) {
		process.stdout.write(renderJson(groups, fileTokens.length, args.failThreshold) + '\n');
	} else {
		process.stdout.write(renderMarkdown(groups, fileTokens.length, args.failThreshold));
	}

	if (args.failThreshold !== null && total > args.failThreshold) {
		process.exit(1);
	}
	process.exit(0);
}

// Exported for the unit test (mirrors scripts/validate-webview-contract.js).
module.exports = {
	parseArgs,
	normalizeLine,
	isNoise,
	tokenizeFile,
	globToRegExp,
	collectFiles,
	findDuplicates,
	extendGroups,
	totalDuplicatedLines,
	escapeMarkdownCell,
	renderMarkdown,
	renderJson,
	MIN_LINES_DEFAULT,
	DEFAULT_INCLUDES,
};

if (require.main === module) {
	main();
}
