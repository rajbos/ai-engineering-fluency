#!/usr/bin/env node

/**
 * Hardcoded UI String Inventory Scan
 *
 * Walks vscode-extension/src/webview/**\/*.ts and vscode-extension/src/extension.ts
 * (the webview-HTML-producing code) looking for string/template literals that
 * are rendered directly as UI text but are NOT wrapped in localize(), t(), or
 * vscode.l10n.t(). This is a triage/inventory report, not a CI gate: it never
 * exits non-zero and does not modify any source file.
 *
 * UI-rendering positions checked:
 *   - Assignment to .textContent / .innerText / .innerHTML / .title / .placeholder
 *   - aria-label="..." attributes
 *   - Text content inside common HTML tags embedded in template literals
 *     (<button>, <label>, <h1>-<h6>, <p>, <span>, <td>, <th>, <option>,
 *     <summary>, <caption>)
 *
 * Usage:
 *   node .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js
 *   node .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js --json
 *
 * Output:
 *   - Console report grouped by file, with line numbers and snippets
 *   - Markdown report written to <repoRoot>/hardcoded-strings-report.md
 *
 * Exit codes:
 *   0 — always (informational script; never fails the build)
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ── Configuration ──────────────────────────────────────────────────────────

const REPO_ROOT = path.join(__dirname, '../../..');
const WEBVIEW_DIR = path.join(REPO_ROOT, 'vscode-extension/src/webview');
const EXTENSION_FILE = path.join(REPO_ROOT, 'vscode-extension/src/extension.ts');
const REPORT_PATH = path.join(REPO_ROOT, 'hardcoded-strings-report.md');

const JSON_MODE = process.argv.includes('--json');

const TAG_NAMES = ['button', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'td', 'th', 'option', 'summary', 'caption'];
const TEXT_PROPS = ['textContent', 'innerText', 'innerHTML', 'title', 'placeholder'];

// ── File collection ────────────────────────────────────────────────────────

/** Recursively collect *.ts files under a directory, excluding *.test.ts. */
function collectTsFiles(dir) {
    const results = [];
    if (!fs.existsSync(dir)) { return results; }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...collectTsFiles(full));
        } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts')) {
            results.push(full);
        }
    }
    return results;
}

// ── Localization-call stripping ────────────────────────────────────────────

// Matches the opening of a localize(/t(/l10n.t(/vscode.l10n.t( call. `\b` before
// the bare `t(` alternative keeps it from matching inside identifiers like
// `getText(` or `format(` (no word boundary exists between "x" and "t" there).
const CALL_OPEN = /\b(?:vscode\.l10n\.t|l10n\.t|localize|t)\(/;

/** Remove already-localized call expressions (with balanced parens) from text. */
function stripLocalizedCalls(text) {
    let result = text;
    for (let iter = 0; iter < 50; iter++) {
        const m = CALL_OPEN.exec(result);
        if (!m) { break; }
        const openIdx = m.index + m[0].length - 1;
        let depth = 0;
        let end = -1;
        for (let i = openIdx; i < result.length; i++) {
            if (result[i] === '(') { depth++; }
            else if (result[i] === ')') {
                depth--;
                if (depth === 0) { end = i; break; }
            }
        }
        if (end === -1) { break; }
        result = result.slice(0, m.index) + result.slice(end + 1);
    }
    return result;
}

/** Strip ${...} interpolations (non-nested assumption) so only static literal text remains. */
function stripInterpolations(text) {
    let result = text;
    for (let iter = 0; iter < 10; iter++) {
        const next = result.replace(/\$\{[^{}]*\}/g, ' ');
        if (next === result) { break; }
        result = next;
    }
    return result;
}

/** Reduce a raw literal body to its static (non-localized, non-interpolated) text. */
function extractStaticText(rawBody) {
    return stripInterpolations(stripLocalizedCalls(rawBody));
}

// ── Prose heuristic ─────────────────────────────────────────────────────────

const CSS_UNIT_RE = /^-?[\d.]+(px|em|rem|%|vh|vw|ms|s|deg|fr|ch|q)$/;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{3,8}$/;
const CSS_FUNC_RE = /^(rgba?|hsla?|url|var|calc|linear-gradient|repeating-linear-gradient|translate[XYZ]?|rotate|scale)\(/;
const SINGLE_TOKEN_RE = /^[a-z][a-z0-9-]*$/; // e.g. "active", "flex", "hidden" — likely a class/id/CSS keyword
const URL_RE = /^(https?:\/\/|www\.)/i;
const LETTER_RUN_RE = /[A-Za-z]{2,}/;

/** Heuristic: does this static text look like UI prose that should be localized? */
function looksLikeProse(text) {
    const trimmed = text.trim();
    if (!trimmed) { return false; }
    if (!LETTER_RUN_RE.test(trimmed)) { return false; } // pure numbers/symbols/emoji
    if (URL_RE.test(trimmed)) { return false; }
    if (HEX_COLOR_RE.test(trimmed)) { return false; }
    if (CSS_UNIT_RE.test(trimmed)) { return false; }
    if (CSS_FUNC_RE.test(trimmed)) { return false; }
    if (SINGLE_TOKEN_RE.test(trimmed)) { return false; } // class-or-id-only token
    return true;
}

/** 1-based line number of `index` within `content`. */
function lineAt(content, index) {
    return content.slice(0, index).split('\n').length;
}

/** Trim a snippet for display, collapsing whitespace/newlines. */
function toSnippet(text, max = 160) {
    const collapsed = text.replace(/\s+/g, ' ').trim();
    return collapsed.length > max ? collapsed.slice(0, max) + '…' : collapsed;
}

// ── Detectors ───────────────────────────────────────────────────────────────

/**
 * Detect assignments like `el.textContent = "..."` / `el.title = \`...\`` where
 * the right-hand side is a direct string/template literal (not a variable,
 * function call, or already-localized call).
 */
function findPropertyAssignments(content) {
    const findings = [];
    const propAlt = TEXT_PROPS.join('|');

    // Template-literal RHS (can span multiple lines).
    const templateRe = new RegExp('\\.(' + propAlt + ')\\s*=\\s*`([^`]*)`', 'g');
    let m;
    while ((m = templateRe.exec(content)) !== null) {
        const [full, prop, body] = m;
        if (prop === 'innerHTML' && body.includes('<')) { continue; } // deferred to tag-content scan
        const staticText = extractStaticText(body);
        if (looksLikeProse(staticText)) {
            findings.push({
                line: lineAt(content, m.index),
                kind: `.${prop} assignment`,
                snippet: toSnippet(full),
            });
        }
    }

    // Quoted-string RHS (single line only).
    const quotedRe = new RegExp('\\.(' + propAlt + ')\\s*=\\s*(["\'])((?:(?!\\2)[^\\\\\\n]|\\\\.)*)\\2', 'g');
    while ((m = quotedRe.exec(content)) !== null) {
        const [full, prop, , body] = m;
        if (prop === 'innerHTML' && body.includes('<')) { continue; }
        const staticText = extractStaticText(body);
        if (looksLikeProse(staticText)) {
            findings.push({
                line: lineAt(content, m.index),
                kind: `.${prop} assignment`,
                snippet: toSnippet(full),
            });
        }
    }

    return findings;
}

/** Detect aria-label="..." attributes with hardcoded prose. */
function findAriaLabels(content) {
    const findings = [];
    const re = /aria-label\s*=\s*(["'])((?:(?!\1)[^\\\n]|\\.)*)\1/g;
    let m;
    while ((m = re.exec(content)) !== null) {
        const [full, , body] = m;
        const staticText = extractStaticText(body);
        if (looksLikeProse(staticText)) {
            findings.push({
                line: lineAt(content, m.index),
                kind: 'aria-label attribute',
                snippet: toSnippet(full),
            });
        }
    }
    return findings;
}

/** Detect hardcoded text content inside common UI-bearing HTML tags. */
function findTagContent(content) {
    const findings = [];
    const tagAlt = TAG_NAMES.join('|');
    const re = new RegExp('<(' + tagAlt + ')(?:\\s[^>]*)?>([^<]*)</\\1>', 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
        const [full, tag, body] = m;
        const staticText = extractStaticText(body);
        if (looksLikeProse(staticText)) {
            findings.push({
                line: lineAt(content, m.index),
                kind: `<${tag}> content`,
                snippet: toSnippet(full),
            });
        }
    }
    return findings;
}

/** Run all detectors against one file's content, deduped by line+snippet. */
function scanFile(content) {
    const all = [
        ...findPropertyAssignments(content),
        ...findAriaLabels(content),
        ...findTagContent(content),
    ];
    const seen = new Set();
    const deduped = [];
    for (const f of all) {
        const key = `${f.line}|${f.kind}|${f.snippet}`;
        if (seen.has(key)) { continue; }
        seen.add(key);
        deduped.push(f);
    }
    deduped.sort((a, b) => a.line - b.line);
    return deduped;
}

// ── Main ───────────────────────────────────────────────────────────────────

function main() {
    const files = [...collectTsFiles(WEBVIEW_DIR)];
    if (fs.existsSync(EXTENSION_FILE)) { files.push(EXTENSION_FILE); }

    const results = []; // { file, findings }
    let total = 0;

    for (const file of files.sort()) {
        const content = fs.readFileSync(file, 'utf8');
        const findings = scanFile(content);
        if (findings.length > 0) {
            const rel = path.relative(REPO_ROOT, file);
            results.push({ file: rel, findings });
            total += findings.length;
        }
    }

    if (JSON_MODE) {
        console.log(JSON.stringify({ total, files: results }, null, 2));
    } else {
        console.log(`Scanned ${files.length} file(s) under vscode-extension/src/webview/ and extension.ts\n`);
        if (total === 0) {
            console.log('No hardcoded UI strings found.');
        } else {
            for (const { file, findings } of results) {
                console.log(`${file} (${findings.length})`);
                for (const f of findings) {
                    console.log(`  L${f.line} [${f.kind}] ${f.snippet}`);
                }
                console.log('');
            }
            console.log('─────────────────────────────────────────');
            console.log(`Found ${total} candidate hardcoded string(s) across ${results.length} file(s).`);
            console.log('This is an informational inventory, not a hard failure — see the skill README for triage guidance.');
        }
    }

    writeMarkdownReport(results, total, files.length);
    if (!JSON_MODE) {
        console.log(`\nMarkdown report written to ${path.relative(REPO_ROOT, REPORT_PATH)}`);
    }

    // Informational script — never fail the build.
    process.exit(0);
}

function writeMarkdownReport(results, total, scannedCount) {
    const lines = [];
    lines.push('# Hardcoded UI Strings Inventory');
    lines.push('');
    lines.push(`Generated by \`.github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js\` on ${new Date().toISOString().slice(0, 10)}.`);
    lines.push('');
    lines.push('This is an informational triage report, not a CI gate. It lists candidate UI');
    lines.push('strings under `vscode-extension/src/webview/**` and `vscode-extension/src/extension.ts`');
    lines.push('that are rendered as UI text but are not wrapped in `localize()`, `t()`, or');
    lines.push('`vscode.l10n.t()`. Some entries may be false positives (see the skill README');
    lines.push('for the exclusion rules) — triage each one before localizing.');
    lines.push('');
    lines.push(`- Files scanned: ${scannedCount}`);
    lines.push(`- Files with findings: ${results.length}`);
    lines.push(`- Total candidate strings: ${total}`);
    lines.push('');

    if (total === 0) {
        lines.push('No hardcoded UI strings found.');
    } else {
        lines.push('## Findings by file');
        lines.push('');
        for (const { file, findings } of results) {
            lines.push(`### \`${file}\` (${findings.length})`);
            lines.push('');
            lines.push('| Line | Kind | Snippet |');
            lines.push('|---|---|---|');
            for (const f of findings) {
                const escaped = f.snippet.replace(/\|/g, '\\|');
                lines.push(`| ${f.line} | ${f.kind} | \`${escaped}\` |`);
            }
            lines.push('');
        }
    }

    fs.writeFileSync(REPORT_PATH, lines.join('\n') + '\n', 'utf8');
}

main();
