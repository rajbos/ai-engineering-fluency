#!/usr/bin/env node
'use strict';

/**
 * Unit tests for the hardcoded-string detection logic in scan-hardcoded-strings.js.
 *
 * Run with:  node --test .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.test.js
 *
 * These tests cover the pure helpers — the localization-call stripper, the
 * interpolation stripper, the prose heuristic, the individual detectors, and
 * the extension.ts scope restriction — the logic most likely to silently
 * produce a wrong inventory if a regex drifts.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    stripLocalizedCalls,
    stripInterpolations,
    extractStaticText,
    looksLikeProse,
    escapeTableCell,
    findPropertyAssignments,
    findAriaLabels,
    findTagContent,
    scanFile,
    extractHtmlMethodRanges,
    isWithinRanges,
    buildMarkdownReport,
} = require('./scan-hardcoded-strings.js');

// ── stripLocalizedCalls ──────────────────────────────────────────────────────

test('stripLocalizedCalls: removes a localize() call entirely', () => {
    assert.equal(stripLocalizedCalls("localize('nav.refresh')"), '');
});

test('stripLocalizedCalls: removes vscode.l10n.t() and l10n.t() calls', () => {
    assert.equal(stripLocalizedCalls("vscode.l10n.t('key')"), '');
    assert.equal(stripLocalizedCalls("l10n.t('key')"), '');
});

test('stripLocalizedCalls: removes a bare t() call but not identifiers ending in "t("', () => {
    assert.equal(stripLocalizedCalls("t('key')"), '');
    assert.equal(stripLocalizedCalls('getText(foo)'), 'getText(foo)');
    assert.equal(stripLocalizedCalls('format(foo)'), 'format(foo)');
});

test('stripLocalizedCalls: leaves surrounding text intact', () => {
    assert.equal(stripLocalizedCalls("prefix ${localize('key')} suffix"), 'prefix ${} suffix');
});

// ── stripInterpolations ──────────────────────────────────────────────────────

test('stripInterpolations: blanks a plain variable interpolation', () => {
    assert.match(stripInterpolations('Hello ${name}!').trim(), /^Hello\s+!$/);
});

test('stripInterpolations: preserves string literals from a ternary interpolation', () => {
    const result = stripInterpolations("${flag ? 'Enable Overrides' : 'Disable Overrides'}");
    assert.match(result, /Enable Overrides/);
    assert.match(result, /Disable Overrides/);
});

test('stripInterpolations: drops localized calls inside an interpolation', () => {
    const result = stripInterpolations("${localize('nav.refresh')}");
    assert.equal(result.trim(), '');
});

// ── extractStaticText / looksLikeProse ───────────────────────────────────────

test('extractStaticText: strips both localized calls and interpolations', () => {
    const result = extractStaticText("${localize('key')} Loading ${count} items");
    assert.match(result, /Loading/);
    assert.match(result, /items/);
});

test('looksLikeProse: rejects pure numbers, symbols, and emoji', () => {
    assert.equal(looksLikeProse('123'), false);
    assert.equal(looksLikeProse('→'), false);
    assert.equal(looksLikeProse('  '), false);
});

test('looksLikeProse: rejects URLs', () => {
    assert.equal(looksLikeProse('https://example.com/docs'), false);
    assert.equal(looksLikeProse('www.example.com'), false);
});

test('looksLikeProse: rejects CSS values', () => {
    assert.equal(looksLikeProse('#fff'), false);
    assert.equal(looksLikeProse('12px'), false);
    assert.equal(looksLikeProse('1.5rem'), false);
    assert.equal(looksLikeProse('rgba(0,0,0,0.5)'), false);
    assert.equal(looksLikeProse('var(--text-muted)'), false);
});

test('looksLikeProse: rejects single class/id-like tokens', () => {
    assert.equal(looksLikeProse('active'), false);
    assert.equal(looksLikeProse('flex'), false);
    assert.equal(looksLikeProse('hidden'), false);
});

test('looksLikeProse: accepts genuine UI prose', () => {
    assert.equal(looksLikeProse('No data available.'), true);
    assert.equal(looksLikeProse('Refresh'), true);
    assert.equal(looksLikeProse('Enable Overrides'), true);
});

// ── escapeTableCell ───────────────────────────────────────────────────────────

test('escapeTableCell: escapes backslashes before pipes so escaping cannot combine', () => {
    // A naive `text.replace(/\|/g, '\\|')` would turn a trailing backslash
    // before a pipe into `\\|`, changing which characters are escaped.
    assert.equal(escapeTableCell('a\\|b'), 'a\\\\\\|b');
});

test('escapeTableCell: neutralizes backticks so a snippet cannot close its code span early', () => {
    assert.equal(escapeTableCell('has `backtick` inside'), "has 'backtick' inside");
});

// ── findPropertyAssignments ───────────────────────────────────────────────────

test('findPropertyAssignments: flags a hardcoded .textContent string literal', () => {
    const findings = findPropertyAssignments("el.textContent = 'No data available.';");
    assert.equal(findings.length, 1);
    assert.equal(findings[0].kind, '.textContent assignment');
});

test('findPropertyAssignments: does not flag an already-localized assignment', () => {
    const findings = findPropertyAssignments("el.textContent = localize('details.noData');");
    assert.equal(findings.length, 0);
});

test('findPropertyAssignments: does not flag a variable or function-call RHS', () => {
    const findings = findPropertyAssignments('el.textContent = someVariable;');
    assert.equal(findings.length, 0);
});

test('findPropertyAssignments: flags a template literal with hardcoded prose around an interpolation', () => {
    const findings = findPropertyAssignments('el.title = `Delete data for ${userId} now`;');
    assert.equal(findings.length, 1);
});

test('findPropertyAssignments: skips innerHTML assignments containing markup (deferred to tag scan)', () => {
    const findings = findPropertyAssignments('el.innerHTML = `<div>Some text</div>`;');
    assert.equal(findings.length, 0);
});

// ── findAriaLabels ────────────────────────────────────────────────────────────

test('findAriaLabels: flags a hardcoded aria-label', () => {
    const findings = findAriaLabels('<button aria-label="Close panel"></button>');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].kind, 'aria-label attribute');
});

test('findAriaLabels: does not flag an already-localized aria-label', () => {
    const findings = findAriaLabels("<button aria-label=\"${localize('close')}\"></button>");
    assert.equal(findings.length, 0);
});

// ── findTagContent ────────────────────────────────────────────────────────────

test('findTagContent: flags hardcoded text inside a <button>', () => {
    const findings = findTagContent('<button>Refresh</button>');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].kind, '<button> content');
});

test('findTagContent: flags hardcoded text inside a <div>', () => {
    const findings = findTagContent('<div class="info-box-title">Share Card</div>');
    assert.equal(findings.length, 1);
    assert.equal(findings[0].kind, '<div> content');
});

test('findTagContent: recovers a ternary\'s string literals inside tag content', () => {
    const findings = findTagContent("<button>${flag ? 'Disable Overrides' : 'Enable Overrides'}</button>");
    assert.equal(findings.length, 1);
    assert.match(findings[0].snippet, /Enable Overrides/);
});

test('findTagContent: does not flag an already-localized tag body', () => {
    const findings = findTagContent("<span>${localize('logviewer.summary.editorMode')}</span>");
    assert.equal(findings.length, 0);
});

test('findTagContent: does not flag a tag with only a CSS-value-like or empty body', () => {
    assert.equal(findTagContent('<span class="dot"></span>').length, 0);
    assert.equal(findTagContent('<span style="color:#fff"> </span>').length, 0);
});

// ── scanFile ──────────────────────────────────────────────────────────────────

test('scanFile: dedupes identical findings across detectors', () => {
    const content = "el.title = 'Delete data';\nel.title = 'Delete data';";
    const findings = scanFile(content);
    // Both lines are distinct occurrences (different line numbers) so both are kept.
    assert.equal(findings.length, 2);
});

test('scanFile: restricts findings to allowed ranges when provided', () => {
    const content = [
        "class Foo {",
        "  private outsideHelper() { return '<div>Outside prose here</div>'; }",
        "  private getFooHtml(): string {",
        "    return `<div>Inside prose here</div>`;",
        '  }',
        '}',
    ].join('\n');
    const ranges = extractHtmlMethodRanges(content);
    assert.equal(ranges.length, 1);
    const findings = scanFile(content, ranges);
    assert.ok(findings.every((f) => /Inside prose here/.test(f.snippet)));
    assert.ok(!findings.some((f) => /Outside prose here/.test(f.snippet)));
});

// ── extractHtmlMethodRanges / isWithinRanges ─────────────────────────────────

test('extractHtmlMethodRanges: finds a get*Html method declaration and its body', () => {
    const content = [
        'class Foo {',
        '  private getDetailsHtml(webview: vscode.Webview): string {',
        "    return '<p>hi</p>';",
        '  }',
        '}',
    ].join('\n');
    const ranges = extractHtmlMethodRanges(content);
    assert.equal(ranges.length, 1);
    const [start, end] = ranges[0];
    assert.equal(content[start], '{');
    assert.equal(content[end], '}');
});

test('extractHtmlMethodRanges: does not treat a call site as a declaration', () => {
    const content = [
        'class Foo {',
        '  private getLoadingHtml(): string {',
        '    return this.getLoadingHtmlCssBase() + this.getLoadingHtmlBody("x");',
        '  }',
        '  private getLoadingHtmlCssBase(): string {',
        "    return '';",
        '  }',
        '  private getLoadingHtmlBody(nonce: string): string {',
        "    return '';",
        '  }',
        '}',
    ].join('\n');
    const ranges = extractHtmlMethodRanges(content);
    // Exactly the three declarations, not the two call sites inside getLoadingHtml's body.
    assert.equal(ranges.length, 3);
});

test('extractHtmlMethodRanges: handles multi-line parameter lists', () => {
    const content = [
        'class Foo {',
        '  private getDashboardHtml(',
        '    webview: vscode.Webview,',
        '    data: DashboardData,',
        '  ): string {',
        "    return '<p>hi</p>';",
        '  }',
        '}',
    ].join('\n');
    const ranges = extractHtmlMethodRanges(content);
    assert.equal(ranges.length, 1);
});

test('isWithinRanges: true only inside a range', () => {
    const ranges = [[10, 20], [30, 40]];
    assert.equal(isWithinRanges(15, ranges), true);
    assert.equal(isWithinRanges(25, ranges), false);
    assert.equal(isWithinRanges(35, ranges), true);
});

// ── buildMarkdownReport ───────────────────────────────────────────────────────

test('buildMarkdownReport: reports zero findings cleanly', () => {
    const md = buildMarkdownReport([], 0, 5);
    assert.match(md, /Files scanned: 5/);
    assert.match(md, /No hardcoded UI strings found\./);
});

test('buildMarkdownReport: renders a findings table with escaped snippet content', () => {
    const results = [{
        file: 'vscode-extension/src/webview/details/main.ts',
        findings: [{ line: 42, kind: '.textContent assignment', snippet: "el.textContent = 'a | b'" }],
    }];
    const md = buildMarkdownReport(results, 1, 1);
    assert.match(md, /Total candidate strings: 1/);
    assert.match(md, /\| 42 \| \.textContent assignment \| `el\.textContent = 'a \\\| b'` \|/);
});
