import test from 'node:test';
import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { createRequire } from 'node:module';

// The detector is plain CommonJS developer tooling that runs from the repo root,
// outside the extension's TypeScript program, so it is loaded by path (mirrors
// webviewContract.test.ts).
const requireFromHere = createRequire(__filename);

function findRepoRoot(): string {
	let dir = __dirname;
	for (let i = 0; i < 10; i++) {
		if (fs.existsSync(path.join(dir, 'scripts', 'check-code-duplication.js'))) {
			return dir;
		}
		dir = path.dirname(dir);
	}
	throw new Error(`Could not locate the repo root from ${__dirname}`);
}

const REPO_ROOT = findRepoRoot();
const dup = requireFromHere(
	path.join(REPO_ROOT, 'scripts', 'check-code-duplication.js')
) as {
	normalizeLine: (raw: string) => string;
	isNoise: (line: string) => boolean;
	globToRegExp: (glob: string) => RegExp;
	findDuplicates: (
		fileTokens: { relPath: string; tokens: { text: string; line: number }[] }[],
		minLines: number
	) => { lines: number; occurrences: { file: string; startLine: number; endLine: number }[]; preview: string }[];
	totalDuplicatedLines: (groups: { lines: number; occurrences: unknown[] }[]) => number;
	renderMarkdown: (groups: unknown[], scanned: number, threshold: number | null) => string;
	renderJson: (groups: unknown[], scanned: number, threshold: number | null) => string;
	parseArgs: (argv: string[]) => { minLines: number; includes: string[]; json: boolean; failThreshold: number | null };
	MIN_LINES_DEFAULT: number;
};

function makeFileTokens(relPath: string, source: string) {
	const tokens: { text: string; line: number }[] = [];
	const lines = source.split(/\r?\n/);
	for (let i = 0; i < lines.length; i++) {
		const norm = dup.normalizeLine(lines[i]);
		if (dup.isNoise(norm)) { continue; }
		tokens.push({ text: norm, line: i + 1 });
	}
	return { relPath, tokens };
}

test('normalizeLine: collapses internal whitespace and trims ends', () => {
	assert.equal(dup.normalizeLine('\t  foo   bar  '), 'foo bar');
	assert.equal(dup.normalizeLine('a\tb\n'), 'a b');
});

test('isNoise: treats blank and comment-only lines as noise, code as signal', () => {
	assert.ok(dup.isNoise(''));
	assert.ok(dup.isNoise('   '));
	assert.ok(dup.isNoise('// a comment'));
	assert.ok(dup.isNoise('/* block open'));
	assert.ok(dup.isNoise('* mid block'));
	assert.ok(dup.isNoise('*/ block close'));
	assert.ok(!dup.isNoise('const x = 1;'));
	assert.ok(!dup.isNoise('return x; // trailing'));
});

test('globToRegExp: matches double-star recursively and single-star within a segment', () => {
	const re = dup.globToRegExp('src/**/*.ts');
	assert.ok(re.test('src/a.ts'));
	assert.ok(re.test('src/adapters/claude.ts'));
	assert.ok(!re.test('vscode-extension/src/a.ts'));
	const re2 = dup.globToRegExp('*.ts');
	assert.ok(re2.test('a.ts'));
	assert.ok(!re2.test('a.js'));
});

test('findDuplicates: detects an identical block copied between two files', () => {
	const block = [
		'function sharedHelper(a: number, b: number): number {',
		'const sum = a + b;',
		'const product = a * b;',
		'if (sum > product) { return sum; }',
		'return product;',
		'}',
		'',
		'export { sharedHelper };',
	].join('\n');
	const fileA = makeFileTokens('a.ts', `// header\n${block}\nconst extra = 1;\n`);
	const fileB = makeFileTokens('b.ts', `/* file b */\n${block}\nconst other = 2;\n`);
	const groups = dup.findDuplicates([fileA, fileB], 6);
	assert.ok(groups.length >= 1, 'expected at least one duplicate group');
	const top = groups[0];
	assert.ok(top.lines >= 6, 'group should span at least the min lines');
	const files = top.occurrences.map((o) => o.file).sort();
	assert.deepEqual(files, ['a.ts', 'b.ts']);
});

test('findDuplicates: does not flag a block that appears only once', () => {
	const fileA = makeFileTokens('a.ts', 'function unique() { return 1; }\nconst x = 2;\nconst y = 3;\nconst z = 4;\nconst w = 5;\nconst v = 6;\n');
	const fileB = makeFileTokens('b.ts', 'function different() { return 9; }\nconst p = 8;\nconst q = 7;\nconst r = 6;\nconst s = 5;\nconst t = 4;\n');
	const groups = dup.findDuplicates([fileA, fileB], 6);
	assert.equal(groups.length, 0);
});

test('findDuplicates: extends to the maximal shared block, not just the window', () => {
	const shared = [
		'const a = 1;',
		'const b = 2;',
		'const c = 3;',
		'const d = 4;',
		'const e = 5;',
		'const f = 6;',
		'const g = 7;',
		'const h = 8;',
		'const i = 9;',
	].join('\n');
	const fileA = makeFileTokens('a.ts', `export const before = 0;\n${shared}\nexport const after = 10;\n`);
	const fileB = makeFileTokens('b.ts', `export const otherBefore = -1;\n${shared}\nexport const otherAfter = 11;\n`);
	const groups = dup.findDuplicates([fileA, fileB], 6);
	assert.ok(groups.length >= 1);
	// The maximal block is the 9 shared lines (the surrounding `export const`
	// lines differ, so they are not part of the clone).
	assert.equal(groups[0].lines, 9);
});

test('findDuplicates: catches a copy that differs only by indentation and comments', () => {
	const clean = [
		'function parse(line: string): number {',
		'const trimmed = line.trim();',
		'const value = parseInt(trimmed, 10);',
		'if (Number.isNaN(value)) { return 0; }',
		'return value;',
		'}',
	].join('\n');
	const recommented = [
		'function parse(line: string): number {',
		'    // trim before parsing',
		'    const trimmed = line.trim();',
		'    const value = parseInt(trimmed, 10);',
		'    // guard against NaN',
		'    if (Number.isNaN(value)) { return 0; }',
		'    return value;',
		'}',
	].join('\n');
	const fileA = makeFileTokens('a.ts', `${clean}\n`);
	const fileB = makeFileTokens('b.ts', `${recommented}\n`);
	const groups = dup.findDuplicates([fileA, fileB], 6);
	assert.ok(groups.length >= 1, 're-indented/re-commented copy should still be detected');
	assert.ok(groups[0].lines >= 6);
});

test('totalDuplicatedLines: sums lines * occurrences across groups', () => {
	const groups = [
		{ lines: 10, occurrences: [1, 2] },
		{ lines: 5, occurrences: [1, 2, 3] },
	];
	assert.equal(dup.totalDuplicatedLines(groups), 10 * 2 + 5 * 3);
});

test('renderMarkdown: reports a summary table and the no-findings state', () => {
	const empty = dup.renderMarkdown([], 5, null);
	assert.match(empty, /Code Duplication Analysis/);
	assert.match(empty, /No duplicate blocks found/);
	assert.match(empty, /\| 5 \| 0 \| 0 \|/);
	const withFindings = dup.renderMarkdown(
		[{ lines: 8, occurrences: [{ file: 'a.ts', startLine: 1, endLine: 8 }], preview: 'const x' }],
		5,
		null
	);
	assert.match(withFindings, /Top duplicate groups/);
	assert.match(withFindings, /All duplicate groups/);
});

test('renderJson: emits parseable JSON with the expected shape', () => {
	const json = dup.renderJson(
		[{ lines: 7, occurrences: [{ file: 'a.ts', startLine: 1, endLine: 7 }], preview: 'p' }],
		3,
		100
	);
	const parsed = JSON.parse(json);
	assert.equal(parsed.filesScanned, 3);
	assert.equal(parsed.threshold, 100);
	assert.equal(parsed.groups[0].lines, 7);
});

test('parseArgs: applies defaults and parses flags', () => {
	const a = dup.parseArgs([]);
	assert.equal(a.minLines, dup.MIN_LINES_DEFAULT);
	assert.ok(a.includes.length >= 3);
	assert.equal(a.json, false);
	assert.equal(a.failThreshold, null);
	const b = dup.parseArgs(['--min-lines', '8', '--json', '--fail-threshold', '200', '--include', 'src/**/*.ts']);
	assert.equal(b.minLines, 8);
	assert.equal(b.json, true);
	assert.equal(b.failThreshold, 200);
	assert.deepEqual(b.includes, ['src/**/*.ts']);
});

test('the detector runs against the repo and reports a non-empty step-summary', () => {
	// The real end-to-end check: the script scans the shared source dirs and the
	// repo has known shared adapters, so a green run must still find duplicates.
	const { spawnSync } = requireFromHere('node:child_process') as typeof import('node:child_process');
	const result = spawnSync(
		process.execPath,
		[path.join(REPO_ROOT, 'scripts', 'check-code-duplication.js'), '--min-lines', '14', '--json'],
		{ cwd: REPO_ROOT, encoding: 'utf8' }
	);
	assert.equal(result.status, 0, `detector should run report-only; stderr: ${result.stderr}`);
	const parsed = JSON.parse(result.stdout);
	assert.ok(parsed.filesScanned > 50, 'should scan the shared source dirs');
	assert.ok(Array.isArray(parsed.groups));
	assert.ok(parsed.groups.length >= 1, 'the repo has known shared clone groups');
});

test('the detector exits 1 when --fail-threshold is exceeded', () => {
	const { spawnSync } = requireFromHere('node:child_process') as typeof import('node:child_process');
	const result = spawnSync(
		process.execPath,
		[path.join(REPO_ROOT, 'scripts', 'check-code-duplication.js'), '--min-lines', '14', '--fail-threshold', '1', '--json'],
		{ cwd: REPO_ROOT, encoding: 'utf8' }
	);
	assert.equal(result.status, 1, 'threshold of 1 is exceeded by the repo known clones');
});
