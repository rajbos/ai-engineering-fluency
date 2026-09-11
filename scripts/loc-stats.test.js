#!/usr/bin/env node
'use strict';

/**
 * Unit tests for the LOC stats counting logic in scripts/loc-stats.js.
 *
 * Run with:  node --test scripts/loc-stats.test.js
 *
 * These tests cover the pure helpers that classify files, count test scenarios,
 * and build the Markdown report — the logic most likely to silently produce
 * wrong numbers if a regex drifts. They do not touch the filesystem scan.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isTestFile,
  countScenarios,
  countMatches,
  countNonBlankLines,
  langForExt,
  primaryLanguage,
  buildMarkdown,
  CODE_EXTENSIONS,
  EXT_BY_LANG,
} = require('./loc-stats.js');

// ── isTestFile ──────────────────────────────────────────────────────────────

test('isTestFile: TS test files', () => {
  assert.equal(isTestFile('vscode-extension/test/unit/cachePolicy.test.ts', '.ts'), true);
  assert.equal(isTestFile('src/foo.spec.tsx', '.tsx'), true);
  assert.equal(isTestFile('cli/src/test/formatting.test.js', '.js'), true);
  assert.equal(isTestFile('a/b/c.spec.mjs', '.mjs'), true);
});

test('isTestFile: TS non-test files are not counted', () => {
  assert.equal(isTestFile('vscode-extension/src/extension.ts', '.ts'), false);
  assert.equal(isTestFile('src/cachePolicy.ts', '.ts'), false);
  assert.equal(isTestFile('shared/types.json', '.json'), false);
});

test('isTestFile: C# test files (xUnit/MSTest naming)', () => {
  assert.equal(isTestFile('FormatTokenCountTests.cs', '.cs'), true);
  assert.equal(isTestFile('CliBridgeTests.cs', '.cs'), true);
  assert.equal(isTestFile('StatsBuilderTest.cs', '.cs'), true);
});

test('isTestFile: C# non-test files are not counted', () => {
  assert.equal(isTestFile('Models.cs', '.cs'), false);
  assert.equal(isTestFile('Program.cs', '.cs'), false);
});

test('isTestFile: Kotlin test files', () => {
  assert.equal(isTestFile('src/test/kotlin/FooTest.kt', '.kt'), true);
  assert.equal(isTestFile('src/test/FooTests.kt', '.kt'), true);
  assert.equal(isTestFile('src/main/Foo.kt', '.kt'), false);
});

// ── countScenarios (TS/JS) ───────────────────────────────────────────────────

test('countScenarios: TS it/test/describe blocks', () => {
  const src = [
    "describe('suite', () => {",
    "  it('case a', () => {});",
    "  test('case b', () => {});",
    "});",
  ].join('\n');
  // 1 describe + 1 it + 1 test = 3
  assert.equal(countScenarios(src, '.ts'), 3);
});

test('countScenarios: TS modifier forms (skip/only/serial) are counted', () => {
  const src = [
    "test.skip('disabled', () => {});",
    "it.only('focused', () => {});",
    "describe.serial('ordered', () => {",
    "  it.todo('pending');",
    "});",
  ].join('\n');
  // 1 test.skip + 1 it.only + 1 describe.serial + 1 it.todo = 4
  assert.equal(countScenarios(src, '.ts'), 4);
});

test('countScenarios: lifecycle hooks are not counted', () => {
  const src = [
    "test.beforeEach(() => {});",
    "test.afterEach(() => {});",
    "test.before(() => {});",
    "test.after(() => {});",
  ].join('\n');
  assert.equal(countScenarios(src, '.ts'), 0);
});

test('countScenarios: false-positive identifiers are not counted', () => {
  // submit(/ split(/ limit(/ fooit(/ should not match it|test|describe.
  const src = [
    "const x = submit(form);",
    "const y = split(',');",
    "const z = limit(10);",
    "fooit(1);",
    "// ecosystemAdapters.test.ts (discover returns shape)",
  ].join('\n');
  assert.equal(countScenarios(src, '.ts'), 0);
});

test('countScenarios: JS files use the same rules', () => {
  const src = "test('works', () => {}); it('also', () => {});";
  assert.equal(countScenarios(src, '.js'), 2);
});

// ── countScenarios (C#) ──────────────────────────────────────────────────────

test('countScenarios: C# bare attributes', () => {
  const src = [
    '[Fact]',
    'public void A() {}',
    '[Theory]',
    'public void B() {}',
    '[TestMethod]',
    'public void C() {}',
  ].join('\n');
  assert.equal(countScenarios(src, '.cs'), 3);
});

test('countScenarios: C# parameterized attributes with arguments', () => {
  const src = [
    '[Theory()]',
    '[Fact(DisplayName = "x")]',
    '[TestCase(1, 2)]',
    '[InlineData(1)]',
  ].join('\n');
  // [Theory()], [Fact(...)], [TestCase(...)] are test attributes; [InlineData]
  // is a data source, not a test attribute, so it must not be counted.
  assert.equal(countScenarios(src, '.cs'), 3);
});

test('countScenarios: C# non-test attributes are not counted', () => {
  const src = '[SetUp]\n[InlineData(1)]\n[TearDown]';
  assert.equal(countScenarios(src, '.cs'), 0);
});

// ── countScenarios (Kotlin) ──────────────────────────────────────────────────

test('countScenarios: Kotlin @Test annotations', () => {
  const src = [
    '@Test',
    'fun a() {}',
    '@ParameterizedTest',
    'fun b() {}',
    '@RepeatedTest(3)',
    'fun c() {}',
  ].join('\n');
  assert.equal(countScenarios(src, '.kt'), 3);
});

test('countScenarios: Kotlin @TestFactory is counted', () => {
  const src = '@TestFactory\nfun d() = listOf()';
  assert.equal(countScenarios(src, '.kt'), 1);
});

// ── countMatches ─────────────────────────────────────────────────────────────

test('countMatches: counts non-overlapping matches', () => {
  assert.equal(countMatches('aaa', /a/g), 3);
  assert.equal(countMatches('aaa', /aa/g), 1);
  assert.equal(countMatches('abc', /d/g), 0);
});

test('countMatches: handles zero-length matches without looping', () => {
  // /(?:)/g matches once between each character and after the last, i.e. n+1.
  assert.equal(countMatches('abc', /(?:)/g), 4);
});

// ── countNonBlankLines ─────────────────────────────────────────────────────────

test('countNonBlankLines: ignores blank and whitespace-only lines', () => {
  assert.equal(countNonBlankLines('a\n\n  \n\t\nb\n'), 2);
  assert.equal(countNonBlankLines('\n\n'), 0);
  assert.equal(countNonBlankLines('only line'), 1);
  assert.equal(countNonBlankLines('a\r\nb\r\n\r\n'), 2);
});

// ── langForExt ────────────────────────────────────────────────────────────────

test('langForExt: maps known extensions to languages', () => {
  assert.equal(langForExt('.ts'), 'typescript');
  assert.equal(langForExt('.tsx'), 'typescript');
  assert.equal(langForExt('.js'), 'javascript');
  assert.equal(langForExt('.mjs'), 'javascript');
  assert.equal(langForExt('.cs'), 'csharp');
  assert.equal(langForExt('.kt'), 'kotlin');
  assert.equal(langForExt('.kts'), 'kotlin');
  assert.equal(langForExt('.json'), 'json');
});

test('langForExt: unknown extension returns null', () => {
  assert.equal(langForExt('.md'), null);
  assert.equal(langForExt('.txt'), null);
});

// ── primaryLanguage ───────────────────────────────────────────────────────────

test('primaryLanguage: lists languages sorted by file count', () => {
  const comp = { languages: { json: 2, typescript: 5, javascript: 1 } };
  assert.equal(primaryLanguage(comp), 'typescript (5), json (2), javascript (1)');
});

test('primaryLanguage: empty languages returns dash', () => {
  assert.equal(primaryLanguage({ languages: {} }), '—');
});

// ── buildMarkdown ────────────────────────────────────────────────────────────

test('buildMarkdown: produces the summary table and totals row', () => {
  const results = [
    {
      name: 'Demo', dir: 'demo', files: 2, lines: 100, testFiles: 1,
      testLines: 40, scenarios: 5, languages: { typescript: 2 },
    },
    {
      name: 'Other', dir: 'other', files: 1, lines: 50, testFiles: 0,
      testLines: 0, scenarios: 0, languages: { csharp: 1 },
    },
  ];
  const md = buildMarkdown(results, '2026-09-11T00:00:00.000Z');
  assert.match(md, /# Lines of Code & Test Scenarios/);
  assert.match(md, /\*\*TOTAL\*\* \| \*\*3\*\* \| \*\*150\*\* \| \*\*1\*\* \| \*\*40\*\* \| \*\*5\*\*/);
  assert.match(md, /Demo \| 2 \| 100 \| 1 \| 40 \| 5/);
  assert.match(md, /Other \| 1 \| 50 \| 0 \| 0 \| 0/);
  assert.match(md, /Historical Trend/);
  assert.match(md, /2026-09-11 \| 150 \| 40 \| 5/);
});

// ── extension maps ────────────────────────────────────────────────────────────

test('CODE_EXTENSIONS contains all supported source extensions', () => {
  for (const ext of ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs', '.json', '.cs', '.kt', '.kts']) {
    assert.ok(CODE_EXTENSIONS.has(ext), `missing ${ext}`);
  }
  assert.ok(!CODE_EXTENSIONS.has('.md'));
});

test('EXT_BY_LANG maps languages to their extension sets', () => {
  assert.ok(EXT_BY_LANG.typescript.has('.ts'));
  assert.ok(EXT_BY_LANG.typescript.has('.tsx'));
  assert.ok(EXT_BY_LANG.csharp.has('.cs'));
  assert.ok(EXT_BY_LANG.kotlin.has('.kts'));
});
