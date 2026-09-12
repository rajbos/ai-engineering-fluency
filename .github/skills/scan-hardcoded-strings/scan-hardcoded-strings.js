#!/usr/bin/env node

/**
 * Hardcoded UI String Inventory Scan
 *
 * Walks vscode-extension/src/webview/**\/*.ts and the get*Html()-named methods
 * in vscode-extension/src/extension.ts (the webview-HTML-producing code) looking
 * for string/template literals that are rendered directly as UI text but are NOT
 * wrapped in localize(), t(), localizeFormat(), or vscode.l10n.t(). This is a
 * triage/inventory report, not a CI gate: it never exits non-zero and does not
 * modify any source file.
 *
 * UI-rendering positions checked:
 *   - Assignment to .textContent / .innerText / .innerHTML / .title / .placeholder
 *   - aria-label="..." / title="..." / placeholder="..." HTML attributes
 *   - Text content inside common HTML tags embedded in template literals
 *     (<div>, <button>, <label>, <h1>-<h6>, <p>, <span>, <td>, <th>, <option>,
 *     <summary>, <caption>), tolerating simple nested inline tags
 *     (<a>, <strong>, <em>, <code>, <b>, <i>, <u>)
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

const TAG_NAMES = ['div', 'button', 'label', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'td', 'th', 'option', 'summary', 'caption'];
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

// ── extension.ts scope restriction ──────────────────────────────────────────

/**
 * Find the [start, end] character ranges of every `get*Html*(...) { ... }`
 * method body in `content` — the webview-HTML-producing methods (getDetailsHtml,
 * getLoadingHtmlCssBase, etc.), mirroring the canonical list in this repo's
 * AGENTS.md. Scanning is restricted to these ranges for extension.ts so that
 * unrelated string literals elsewhere in the 13k-line file (e.g. GitHub issue
 * Markdown templates) are not misreported as webview UI text.
 *
 * A declaration is recognized by requiring the method name to start the
 * statement (only whitespace and an optional access modifier before it) —
 * this excludes call sites like `this.getLoadingHtmlCssBase()` embedded
 * mid-line inside another method's template literal.
 */
function extractHtmlMethodRanges(content) {
    const ranges = [];
    const declRe = /^[ \t]*(?:private|public|protected)?\s*(?:async\s+)?(get[A-Za-z]*Html[A-Za-z]*)\s*\(/gm;
    let m;
    while ((m = declRe.exec(content)) !== null) {
        const parenStart = m.index + m[0].length - 1;
        let depth = 0;
        let parenEnd = -1;
        for (let i = parenStart; i < content.length; i++) {
            if (content[i] === '(') { depth++; }
            else if (content[i] === ')') {
                depth--;
                if (depth === 0) { parenEnd = i; break; }
            }
        }
        if (parenEnd === -1) { continue; }

        const braceStart = content.indexOf('{', parenEnd);
        if (braceStart === -1) { continue; }
        // A `;` between the parameter list and the brace means this is a type
        // signature (e.g. an interface member), not a method implementation.
        if (content.slice(parenEnd + 1, braceStart).includes(';')) { continue; }

        let bdepth = 0;
        let braceEnd = -1;
        for (let i = braceStart; i < content.length; i++) {
            if (content[i] === '{') { bdepth++; }
            else if (content[i] === '}') {
                bdepth--;
                if (bdepth === 0) { braceEnd = i; break; }
            }
        }
        if (braceEnd === -1) { continue; }

        ranges.push([braceStart, braceEnd]);
        declRe.lastIndex = braceEnd;
    }
    return ranges;
}

/** Does `index` fall inside any [start, end] range? */
function isWithinRanges(index, ranges) {
    return ranges.some(([start, end]) => index >= start && index <= end);
}

// ── Localization-call stripping ────────────────────────────────────────────

// Matches the opening of a localize(/localizeFormat(/t(/l10n.t(/vscode.l10n.t(
// call. `\b` before the bare `t(` alternative keeps it from matching inside
// identifiers like `getText(` or `format(` (no word boundary exists between
// "x" and "t" there). `localizeFormat` must come before `localize` in the
// alternation only for readability — regex alternation already requires the
// full alternative (including the trailing literal `(`) to match, so
// `localize(` alone can never partially match `localizeFormat(`.
const CALL_OPEN = /\b(?:vscode\.l10n\.t|l10n\.t|localizeFormat|localize|t)\(/;

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

/** Extract quoted string literal bodies (non-nested) from an interpolation expression. */
function extractInterpolationLiterals(expr) {
    const stripped = stripLocalizedCalls(expr);
    const literals = [];
    const re = /(["'])((?:(?!\1)[^\\]|\\.)*)\1/g;
    let m;
    while ((m = re.exec(stripped)) !== null) {
        literals.push(m[2]);
    }
    return literals;
}

/**
 * Strip ${...} interpolations (non-nested assumption), keeping any string
 * literals found inside them (e.g. the branches of a ternary like
 * `${flag ? 'Enable Overrides' : 'Disable Overrides'}`) so that hardcoded
 * prose hidden inside an interpolation is not silently discarded.
 *
 * Each recovered literal is prose-checked *individually* before being kept:
 * joining every literal from an interpolation first and running one prose
 * check over the combined string would let a non-prose branch (e.g. a URL)
 * poison the whole result — `${cond ? 'https://x' : 'Open link'}` must not
 * lose "Open link" just because "https://x" fails the URL check when the two
 * are concatenated together.
 */
function stripInterpolations(text) {
    let result = text;
    for (let iter = 0; iter < 10; iter++) {
        const next = result.replace(/\$\{([^{}]*)\}/g, (_, expr) => {
            const literals = extractInterpolationLiterals(expr).filter((lit) => looksLikeProse(lit));
            return literals.length > 0 ? ` ${literals.join(' ')} ` : ' ';
        });
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
const SINGLE_TOKEN_RE = /^[a-z][a-z0-9-]*$/;
// Single lowercase/hyphenated tokens that are near-certainly a CSS keyword or
// state flag rather than visible prose. Deliberately a narrow denylist, not a
// blanket "reject every single lowercase word" rule — this detector only ever
// sees rendered text/attribute values (class/id/style attributes are never
// scanned), so a genuine one-word label like "tie", "open", or "manage" must
// still be flagged as a candidate for localization.
const CSS_KEYWORD_TOKENS = new Set([
    'active', 'hidden', 'visible', 'collapsed', 'expanded', 'disabled', 'enabled', 'selected', 'checked',
    'flex', 'block', 'inline', 'inline-block', 'grid', 'table', 'none', 'contents',
    'absolute', 'relative', 'fixed', 'sticky', 'static',
    'left', 'right', 'center', 'top', 'bottom', 'auto', 'inherit', 'initial', 'unset',
    'bold', 'italic', 'underline', 'uppercase', 'lowercase', 'capitalize',
    'pointer', 'default', 'wrap', 'nowrap', 'row', 'column',
    'solid', 'dashed', 'dotted', 'transparent',
]);
const URL_RE = /^(https?:\/\/|www\.)/i;
// Unicode-aware: a run of 2+ letters in any script (not just ASCII), so
// hardcoded non-English UI text (Chinese, Japanese, Cyrillic, etc.) is not
// silently exempted just for being outside A-Z.
const LETTER_RUN_RE = /\p{L}{2,}/u;

/** Heuristic: does this static text look like UI prose that should be localized? */
function looksLikeProse(text) {
    const trimmed = text.trim();
    if (!trimmed) { return false; }
    if (!LETTER_RUN_RE.test(trimmed)) { return false; } // pure numbers/symbols/emoji
    if (URL_RE.test(trimmed)) { return false; }
    if (HEX_COLOR_RE.test(trimmed)) { return false; }
    if (CSS_UNIT_RE.test(trimmed)) { return false; }
    if (CSS_FUNC_RE.test(trimmed)) { return false; }
    if (SINGLE_TOKEN_RE.test(trimmed) && CSS_KEYWORD_TOKENS.has(trimmed.toLowerCase())) { return false; }
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

/**
 * Escape a value for safe embedding inside a markdown table cell wrapped in a
 * backtick code span. Backslashes are escaped first — escaping `|` alone
 * would let a snippet's own trailing backslash combine with the inserted
 * one and change its meaning. Backticks are neutralized too since a literal
 * one would otherwise close the surrounding code span early.
 */
function escapeTableCell(text) {
    return text
        .replace(/\\/g, '\\\\')
        .replace(/\|/g, '\\|')
        .replace(/`/g, "'");
}

// ── Detectors ───────────────────────────────────────────────────────────────
//
// Each detector returns findings with an `index` (character offset of the
// match) alongside `line`/`kind`/`snippet`, so callers can restrict results to
// a set of allowed ranges (see `extractHtmlMethodRanges`). `scanFile` strips
// `index` back out before returning.

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
                index: m.index,
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
                index: m.index,
                line: lineAt(content, m.index),
                kind: `.${prop} assignment`,
                snippet: toSnippet(full),
            });
        }
    }

    return findings;
}

const HTML_ATTR_NAMES = ['aria-label', 'title', 'placeholder'];

/**
 * Detect `aria-label="..."` / `title="..."` / `placeholder="..."` HTML
 * attributes with hardcoded prose. HTML attributes in this codebase are
 * always written tight (`title="..."`, no spaces around `=`), so requiring
 * no whitespace around `=` distinguishes them from a JS statement like
 * `let title = 'Sessions';` or `const placeholder = ...` (which do use
 * spaces and are plain local variables, not markup). The negative lookbehind
 * also excludes a preceding `.` (so `panel.title = '...'` — a JS property
 * assignment, already covered by `findPropertyAssignments`) and preceding
 * word/hyphen characters (so `data-title=`/`subtitle=` don't match `title=`).
 */
function findHtmlAttributes(content) {
    const findings = [];
    const attrAlt = HTML_ATTR_NAMES.join('|');
    const re = new RegExp('(?<![.\\w-])(' + attrAlt + ')=(["\'])((?:(?!\\2)[^\\\\\\n]|\\\\.)*)\\2', 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
        const [full, attr, , body] = m;
        const staticText = extractStaticText(body);
        if (looksLikeProse(staticText)) {
            findings.push({
                index: m.index,
                line: lineAt(content, m.index),
                kind: `${attr} attribute`,
                snippet: toSnippet(full),
            });
        }
    }
    return findings;
}

// Simple inline elements allowed to appear nested inside a scanned tag's
// content without stopping the match — e.g. `<div>Beta — please <a href="...">
// create an issue</a>.</div>` should still be read as one block of prose
// rather than being skipped because of the `<a>...</a>` in the middle.
const INLINE_PASSTHROUGH_TAGS = ['a', 'strong', 'em', 'code', 'b', 'i', 'u'];

/** Detect hardcoded text content inside common UI-bearing HTML tags. */
function findTagContent(content) {
    const findings = [];
    const tagAlt = TAG_NAMES.join('|');
    const inlineAlt = INLINE_PASSTHROUGH_TAGS.join('|');
    const bodyPattern = '(?:[^<]|<(?:' + inlineAlt + ')(?:\\s[^>]*)?>|</(?:' + inlineAlt + ')>)*';
    const re = new RegExp('<(' + tagAlt + ')(?:\\s[^>]*)?>(' + bodyPattern + ')</\\1>', 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
        const [full, tag, body] = m;
        const staticText = extractStaticText(body);
        if (looksLikeProse(staticText)) {
            findings.push({
                index: m.index,
                line: lineAt(content, m.index),
                kind: `<${tag}> content`,
                snippet: toSnippet(full),
            });
        }
    }
    return findings;
}

// Shared DOM helpers (vscode-extension/src/webview/shared/domUtils.ts) that
// take plain UI text as a positional argument and set it as textContent
// internally, rather than the caller ever writing `.textContent = ...`
// directly. Calls to these are otherwise invisible to this scanner even
// though they are one of the most common ways webview text is set (500+
// call sites). Value: 0-based index of the text argument in each call.
const HELPER_TEXT_ARG_INDEX = { el: 2, iconHeading: 2, createButton: 1 };

/** Split a raw (unparenthesized) argument-list string on top-level commas. */
function splitTopLevelArgs(argsStr) {
    const parts = [];
    let depth = 0;
    let current = '';
    let quote = null;
    for (let i = 0; i < argsStr.length; i++) {
        const c = argsStr[i];
        if (quote) {
            current += c;
            if (c === '\\') { current += argsStr[++i] ?? ''; continue; }
            if (c === quote) { quote = null; }
            continue;
        }
        if (c === '"' || c === "'" || c === '`') { quote = c; current += c; continue; }
        if (c === '(' || c === '[' || c === '{') { depth++; current += c; continue; }
        if (c === ')' || c === ']' || c === '}') { depth--; current += c; continue; }
        if (c === ',' && depth === 0) { parts.push(current); current = ''; continue; }
        current += c;
    }
    if (current.trim() !== '' || parts.length > 0) { parts.push(current); }
    return parts.map((p) => p.trim());
}

/**
 * Detect hardcoded text passed as a string/template literal to a known
 * shared UI-text helper (`el(tag, className, text)`, `iconHeading(tag, icon,
 * text, className)`, `createButton(id, label, appearance)`). Only bare calls
 * are matched (not `obj.el(...)`) to avoid colliding with an unrelated
 * same-named method on some other object.
 */
function findHelperCallText(content) {
    const findings = [];
    const nameAlt = Object.keys(HELPER_TEXT_ARG_INDEX).join('|');
    const re = new RegExp('\\b(' + nameAlt + ')\\(', 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
        const name = m[1];
        if (content[m.index - 1] === '.') { continue; } // e.g. `this.el(...)`
        const openIdx = m.index + m[0].length - 1;
        let depth = 0;
        let end = -1;
        for (let i = openIdx; i < content.length; i++) {
            if (content[i] === '(') { depth++; }
            else if (content[i] === ')') {
                depth--;
                if (depth === 0) { end = i; break; }
            }
        }
        if (end === -1) { continue; }

        const args = splitTopLevelArgs(content.slice(openIdx + 1, end));
        const arg = args[HELPER_TEXT_ARG_INDEX[name]];
        if (!arg) { continue; }
        const litMatch = /^(["'`])([\s\S]*)\1$/.exec(arg);
        if (!litMatch) { continue; } // not a direct literal (variable/call/etc.) — skip

        const staticText = extractStaticText(litMatch[2]);
        if (looksLikeProse(staticText)) {
            findings.push({
                index: m.index,
                line: lineAt(content, m.index),
                kind: `${name}() text argument`,
                snippet: toSnippet(content.slice(m.index, end + 1)),
            });
        }
    }
    return findings;
}

/**
 * Run all detectors against one file's content, deduped by line+snippet and
 * optionally restricted to a set of allowed character ranges.
 */
function scanFile(content, allowedRanges) {
    let all = [
        ...findPropertyAssignments(content),
        ...findHtmlAttributes(content),
        ...findTagContent(content),
        ...findHelperCallText(content),
    ];
    if (allowedRanges) {
        all = all.filter((f) => isWithinRanges(f.index, allowedRanges));
    }
    const seen = new Set();
    const deduped = [];
    for (const f of all) {
        const key = `${f.line}|${f.kind}|${f.snippet}`;
        if (seen.has(key)) { continue; }
        seen.add(key);
        deduped.push({ line: f.line, kind: f.kind, snippet: f.snippet });
    }
    deduped.sort((a, b) => a.line - b.line);
    return deduped;
}

// ── Report generation ───────────────────────────────────────────────────────

function buildMarkdownReport(results, total, scannedCount) {
    const lines = [];
    lines.push('# Hardcoded UI Strings Inventory');
    lines.push('');
    lines.push(`Generated by \`.github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js\` on ${new Date().toISOString().slice(0, 10)}.`);
    lines.push('');
    lines.push('This is an informational triage report, not a CI gate. It lists candidate UI');
    lines.push('strings under `vscode-extension/src/webview/**` and the `get*Html()` methods in');
    lines.push('`vscode-extension/src/extension.ts` that are rendered as UI text but are not');
    lines.push('wrapped in `localize()`, `localizeFormat()`, `t()`, or `vscode.l10n.t()`. Some entries may be false');
    lines.push('positives (see the skill README for the exclusion rules) — triage each one');
    lines.push('before localizing.');
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
                lines.push(`| ${f.line} | ${f.kind} | \`${escapeTableCell(f.snippet)}\` |`);
            }
            lines.push('');
        }
    }

    return lines.join('\n') + '\n';
}

// ── Main ───────────────────────────────────────────────────────────────────

function runScan() {
    const files = [...collectTsFiles(WEBVIEW_DIR)];
    if (fs.existsSync(EXTENSION_FILE)) { files.push(EXTENSION_FILE); }

    const results = []; // { file, findings }
    let total = 0;

    for (const file of files.sort()) {
        const content = fs.readFileSync(file, 'utf8');
        const allowedRanges = file === EXTENSION_FILE ? extractHtmlMethodRanges(content) : null;
        const findings = scanFile(content, allowedRanges);
        if (findings.length > 0) {
            const rel = path.relative(REPO_ROOT, file);
            results.push({ file: rel, findings });
            total += findings.length;
        }
    }

    return { results, total, scannedCount: files.length };
}

function main() {
    const jsonMode = process.argv.includes('--json');
    const { results, total, scannedCount } = runScan();

    if (jsonMode) {
        console.log(JSON.stringify({ total, files: results }, null, 2));
    } else {
        console.log(`Scanned ${scannedCount} file(s) under vscode-extension/src/webview/ and extension.ts's get*Html() methods\n`);
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

    fs.writeFileSync(REPORT_PATH, buildMarkdownReport(results, total, scannedCount), 'utf8');
    if (!jsonMode) {
        console.log(`\nMarkdown report written to ${path.relative(REPO_ROOT, REPORT_PATH)}`);
    }

    // Informational script — never fail the build. Setting exitCode (rather
    // than calling process.exit()) lets buffered stdout/stderr writes drain
    // before the process exits, instead of risking truncated output when
    // piped (e.g. in CI or `| head`).
    process.exitCode = 0;
}

/**
 * Run main() but honor the "always exits 0" contract even when something
 * operational goes wrong (an unreadable source file, an unwritable report
 * path, etc.) — those errors are reported to stderr, not left to crash the
 * process with a non-zero exit that would unexpectedly fail a maintenance
 * or CI invocation of this informational script.
 */
function runMain() {
    try {
        main();
    } catch (err) {
        console.error('scan-hardcoded-strings: error while scanning —', err instanceof Error ? err.message : err);
        process.exitCode = 0;
    }
}

module.exports = {
    collectTsFiles,
    extractHtmlMethodRanges,
    isWithinRanges,
    stripLocalizedCalls,
    extractInterpolationLiterals,
    stripInterpolations,
    extractStaticText,
    looksLikeProse,
    toSnippet,
    escapeTableCell,
    findPropertyAssignments,
    findHtmlAttributes,
    findTagContent,
    findHelperCallText,
    splitTopLevelArgs,
    scanFile,
    buildMarkdownReport,
    runScan,
};

if (require.main === module) {
    runMain();
}
