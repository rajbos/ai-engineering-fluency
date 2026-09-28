#!/usr/bin/env node
'use strict';

/**
 * Unit tests for the pure logic in scripts/repo-health-scan.js.
 *
 * Run with:  node --test scripts/repo-health-scan.test.js
 *
 * The load-bearing contracts are the fingerprint (it is what stops the daily
 * agent opening the same issue twice) and the picker (it must skip tracked
 * findings and rotate through topics). The filesystem/ESLint scan itself is
 * exercised by the workflow, not here.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
	CATEGORIES,
	classifyStem,
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
	makeFinding,
	parsePreviousMetrics,
	renderDashboard,
	renderIssue,
	LAYER_RULES,
} = require('./repo-health-scan.js');

// ── fingerprints ────────────────────────────────────────────────────────────

test('fingerprint ignores the line number so moved code keeps its issue', () => {
	const a = makeFinding({ category: 'complexity', file: 'src/a.ts', line: 10, key: 'foo', title: 't' });
	const b = makeFinding({ category: 'complexity', file: 'src/a.ts', line: 250, key: 'foo', title: 'other' });
	assert.equal(a.id, b.id);
	assert.match(a.id, /^rh-[0-9a-f]{12}$/);
});

test('fingerprint differs by category, file and key', () => {
	const base = { category: 'naming', file: 'src/a.ts', key: 'x', title: 't' };
	const ids = new Set([
		makeFinding(base).id,
		makeFinding({ ...base, category: 'dead-code' }).id,
		makeFinding({ ...base, file: 'src/b.ts' }).id,
		makeFinding({ ...base, key: 'y' }).id,
	]);
	assert.equal(ids.size, 4);
});

test('extension.ts findings are reported but never pickable', () => {
	const f = makeFinding({ category: 'large-file', file: 'vscode-extension/src/extension.ts', key: 'size', title: 't' });
	assert.equal(f.pickable, false);
});

// ── tracked ids and picking ─────────────────────────────────────────────────

test('extractTrackedIds reads markers out of arbitrary issue JSON', () => {
	const text = JSON.stringify([
		{ body: 'blah\n---\nrepo-health-id: `rh-0123456789ab`' },
		{ body: 'repo-health-id:rh-abcdefabcdef' },
		{ body: 'no marker here' },
	]);
	assert.deepEqual([...extractTrackedIds(text)].sort(), ['rh-0123456789ab', 'rh-abcdefabcdef']);
});

function f(category, key, extra = {}) {
	return makeFinding({ category, file: `src/${key}.ts`, key, title: key, ...extra });
}

test('pickFinding skips tracked findings', () => {
	const a = f('style', 'a');
	const b = f('style', 'b');
	// 1970-01-01 is day 0 -> rotation starts at CATEGORIES[0] ('style').
	assert.equal(pickFinding([a, b], new Set([a.id]), '1970-01-01').id, b.id);
	assert.equal(pickFinding([a, b], new Set([a.id, b.id]), '1970-01-01'), null);
});

test('pickFinding rotates the starting topic by day and falls through empty topics', () => {
	const style = f('style', 's');
	const naming = f('naming', 'n');
	assert.equal(pickFinding([style, naming], new Set(), '1970-01-01').category, 'style');
	assert.equal(pickFinding([style, naming], new Set(), '1970-01-02').category, 'naming');
	// Day 2 starts at 'complexity'; nothing there or after until wrap-around -> 'style'.
	assert.equal(pickFinding([style, naming], new Set(), '1970-01-03').category, 'style');
	assert.equal(CATEGORIES.length, 8);
});

test('pickFinding prefers severity, then smaller effort, then weight', () => {
	const info = f('duplication', 'info', { severity: 'info', effort: 'S' });
	const bigWarn = f('duplication', 'big', { severity: 'warning', effort: 'L' });
	const smallWarn = f('duplication', 'small', { severity: 'warning', effort: 'M', weight: 1 });
	const heavyWarn = f('duplication', 'heavy', { severity: 'warning', effort: 'M', weight: 9 });
	const date = '1970-01-06'; // day 5 -> 'duplication'
	assert.equal(pickFinding([info, bigWarn, smallWarn, heavyWarn], new Set(), date).key, 'heavy');
});

test('pickFinding never returns a non-pickable finding', () => {
	const ext = makeFinding({ category: 'style', file: 'vscode-extension/src/extension.ts', key: 'eslint-style', title: 't' });
	assert.equal(pickFinding([ext], new Set(), '1970-01-01'), null);
});

// ── naming ──────────────────────────────────────────────────────────────────

test('classifyStem recognises the common conventions', () => {
	assert.equal(classifyStem('main'), 'lower');
	assert.equal(classifyStem('sessionParser'), 'camelCase');
	assert.equal(classifyStem('SessionParser'), 'PascalCase');
	assert.equal(classifyStem('usage-analysis'), 'kebab-case');
	assert.equal(classifyStem('usage_analysis'), 'snake_case');
	assert.equal(classifyStem('Weird-Name'), 'mixed');
});

test('namingFindings flags outliers against the dominant style of a tree', () => {
	const files = ['cli/src/fooBar.ts', 'cli/src/bazQux.ts', 'cli/src/main.ts', 'cli/src/commands/usage-analysis.ts'];
	const out = namingFindings(files);
	assert.deepEqual(out.map(x => x.file), ['cli/src/commands/usage-analysis.ts']);
});

test('namingFindings stays silent when no style is dominant', () => {
	const files = ['cli/src/fooBar.ts', 'cli/src/baz-qux.ts'];
	assert.deepEqual(namingFindings(files), []);
});

// ── ESLint mapping ──────────────────────────────────────────────────────────

test('eslintFindings groups complexity rules per function and style per file', () => {
	const results = [{
		filePath: 'src/a.ts',
		messages: [
			{ ruleId: 'complexity', line: 5, severity: 1, message: "Function 'doWork' has a complexity of 20." },
			{ ruleId: 'max-lines-per-function', line: 5, severity: 1, message: "Function 'doWork' has too many lines (120)." },
			{ ruleId: 'sonarjs/cognitive-complexity', line: 40, severity: 1, message: 'Refactor this function to reduce its Cognitive Complexity.' },
			{ ruleId: 'curly', line: 7, severity: 1, message: 'Expected { after if.' },
			{ ruleId: 'curly', line: 9, severity: 1, message: 'Expected { after if.' },
			{ ruleId: 'max-lines', line: 1, severity: 1, message: 'File has too many lines.' },
			{ ruleId: '@typescript-eslint/no-unused-vars', line: 2, severity: 1, message: "'os' is defined but never used." },
			{ ruleId: '@typescript-eslint/naming-convention', line: 3, severity: 1, message: 'Import name `FOO_BAR` must match one of the following formats: camelCase' },
		],
	}];
	const text = Array(39).fill('').concat(['export function tangled(x: number) {']).join('\n');
	const out = eslintFindings(results, () => text);
	const byCat = c => out.filter(x => x.category === c);
	assert.equal(byCat('complexity').length, 2);
	assert.equal(byCat('complexity').find(x => x.key === 'doWork').detail.split('\n').length, 2);
	assert.ok(byCat('complexity').some(x => x.key === 'tangled'), 'falls back to the source line for the name');
	assert.equal(byCat('style').length, 1);
	assert.match(byCat('style')[0].detail, /curly: 2/);
	assert.equal(byCat('dead-code')[0].key, '@typescript-eslint/no-unused-vars:os');
	assert.equal(byCat('naming')[0].key, 'eslint:FOO_BAR');
	assert.equal(out.filter(x => /max-lines:/.test(x.detail)).length, 0, 'max-lines is left to the large-file topic');
});

test('functionNameAt handles declarations, arrows and methods', () => {
	assert.equal(functionNameAt('export async function loadAll() {', 1), 'loadAll');
	assert.equal(functionNameAt('const build = async (a: number) => {', 1), 'build');
	assert.equal(functionNameAt('  private async _refresh(force: boolean): Promise<void> {', 1), '_refresh');
	assert.equal(functionNameAt('  if (x) {', 1), null);
});

// ── exports, imports, layering, cycles ──────────────────────────────────────

test('parseExports finds named declarations with their line', () => {
	const src = 'import x from "y";\nexport function a() {}\nexport const b = 1;\nexport interface C {}\nexport default class D {}\n';
	assert.deepEqual(parseExports(src), [
		{ name: 'a', line: 2 }, { name: 'b', line: 3 }, { name: 'C', line: 4 }, { name: 'D', line: 5 },
	]);
});

test('parseImports records type-only imports and requires', () => {
	const src = "import type { T } from './types';\nimport { a } from '../a';\nconst fs = require('fs');\nexport * from './re';";
	assert.deepEqual(parseImports(src), [
		{ spec: './types', typeOnly: true },
		{ spec: '../a', typeOnly: false },
		{ spec: 'fs', typeOnly: false },
		{ spec: './re', typeOnly: false },
	]);
});

test('resolveImport maps relative specifiers onto tracked files', () => {
	const files = new Set(['src/a.ts', 'src/utils/index.ts', 'vscode-extension/package.json']);
	assert.equal(resolveImport('src/b.ts', './a', files), 'src/a.ts');
	assert.equal(resolveImport('src/b.ts', './a.js', files), 'src/a.ts');
	assert.equal(resolveImport('src/b.ts', './utils', files), 'src/utils/index.ts');
	assert.equal(resolveImport('src/b.ts', '../vscode-extension/package.json', files), 'vscode-extension/package.json');
	assert.equal(resolveImport('src/b.ts', 'vscode', files), null);
});

test('layerViolations flags shared src/ importing a consumer, not the reverse', () => {
	const bad = layerViolations('src/x.ts', [{ resolved: 'cli/src/y.ts' }]);
	assert.equal(bad.length, 1);
	assert.equal(bad[0].rule, LAYER_RULES[0]);
	assert.deepEqual(layerViolations('cli/src/y.ts', [{ resolved: 'src/x.ts' }]), []);
	assert.equal(layerViolations('cli/src/y.ts', [{ resolved: 'vscode-extension/src/z.ts' }]).length, 1);
});

test('findCycles returns each cycle once and ignores acyclic chains', () => {
	const graph = new Map([
		['a', ['b']], ['b', ['c']], ['c', ['a']],
		['d', ['e']], ['e', []],
		['f', ['f2']], ['f2', ['f']],
	]);
	assert.deepEqual(findCycles(graph).sort(), [['a', 'b', 'c'], ['f', 'f2']]);
});

// ── rendering ───────────────────────────────────────────────────────────────

function report(metricsOverride = {}) {
	const metrics = { markers: 0, tsSuppressions: 1, eslintDisables: 2, explicitAny: 3 };
	for (const c of CATEGORIES) { metrics[c.id] = 0; }
	return { generatedAt: '2026-09-28T06:00:00.000Z', commit: 'abcdef1234567890', filesScanned: 1, notes: [], metrics: { ...metrics, ...metricsOverride }, findings: [] };
}

test('dashboard round-trips its metrics and shows the change since last run', () => {
	const first = renderDashboard(report({ complexity: 10 }), '');
	const prev = parsePreviousMetrics(first);
	assert.equal(prev.date, '2026-09-28');
	assert.equal(prev.metrics.complexity, 10);
	const second = renderDashboard(report({ complexity: 7 }), first);
	assert.match(second, /\| Cyclomatic complexity \| 7 \| \(▼ -3\) \|/);
	assert.ok(!second.includes('<!--'), 'no hidden HTML comments');
});

test('parsePreviousMetrics tolerates missing or corrupt markers', () => {
	assert.equal(parsePreviousMetrics(''), null);
	assert.equal(parsePreviousMetrics('```json repo-health-metrics\n{not json}\n```'), null);
});

test('renderIssue embeds the fingerprint marker the tracker reads back', () => {
	const finding = f('dead-code', 'unusedThing', { title: 'Export `unusedThing` is never referenced' });
	const { title, body } = renderIssue(finding);
	assert.match(title, /^\[repo-health\] Dead code: /);
	assert.ok(!title.includes('`'));
	assert.deepEqual([...extractTrackedIds(body)], [finding.id]);
	assert.ok(!body.includes('<!--'), 'no hidden HTML comments (validate-input.sh flags them)');
});
