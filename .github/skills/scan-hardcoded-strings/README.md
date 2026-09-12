---
title: Scan Hardcoded Strings Skill
description: Inventory hardcoded (non-localized) UI text across the webview sources and extension.ts
lastUpdated: 2026-09-12
---

# Scan Hardcoded Strings Skill

A dependency-free Node script that scans the VS Code extension's webview UI
code for string/template literals that render as UI text but are **not**
wrapped in `localize()`, `t()`, or `vscode.l10n.t()`. It produces a
human-triageable inventory — it is **informational only** and never fails a
build.

This complements (does not replace) the existing localization checks:

- `scripts/validate-localization.js` (`npm run lint:l10n`, wired into CI) and
  `vscode-extension/scripts/validate-l10n.mjs` (`npm run validate:l10n`) check
  *consistency* of strings that already go through the localization system
  (e.g. every key used in source has a translation, translations stay in
  sync). They do not detect a plain string literal baked directly into UI
  code that never calls `localize(`/`t(`/`vscode.l10n.t(` at all.
- This skill fills that gap: it finds candidate strings that were never
  routed through localization in the first place.

## Files in This Directory

- **SKILL.md** — Main skill file with YAML frontmatter and instructions for the agent
- **scan-hardcoded-strings.js** — Node.js script that performs the scan
- **scan-hardcoded-strings.test.js** — Unit tests for the detection helpers
- **README.md** — This file

## Running the Tests

```bash
node --test .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.test.js
```

Covers the localization-call stripper, the interpolation stripper (including
ternary-literal recovery), the prose heuristic's exclusion rules, each
detector, the `extension.ts` method-range restriction, and markdown report
generation.

## Quick Usage

```bash
node .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js

# Machine-readable JSON
node .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js --json
```

The script scans:
- `vscode-extension/src/webview/**/*.ts` (excluding `*.test.ts`)
- `vscode-extension/src/extension.ts` (the `get*Html` methods that build webview HTML)

and writes a report to `hardcoded-strings-report.md` at the repo root, in
addition to printing a console summary grouped by file.

## What counts as a "UI-rendering position"

- Assignment to `.textContent`, `.innerText`, `.innerHTML`, `.title`, or
  `.placeholder` where the right-hand side is a direct string/template
  literal
- `aria-label="..."` attributes
- Text content inside common UI-bearing HTML tags embedded in template
  literals: `<div>`, `<button>`, `<label>`, `<h1>`–`<h6>`, `<p>`, `<span>`,
  `<td>`, `<th>`, `<option>`, `<summary>`, `<caption>`

`extension.ts` is scanned only within its `get*Html(...)` method bodies
(`getDetailsHtml`, `getLoadingHtmlCssBase`, etc.) — not the whole 13k-line
file — so unrelated string literals elsewhere (GitHub issue Markdown
templates, VS Code panel titles, log messages) are not misreported as
webview UI text.

A candidate string must also contain a run of 2+ letters and pass a "looks
like prose" filter that excludes:
- Pure numbers/symbols/emoji with no letters
- URLs (`http(s)://`, `www.`)
- CSS values: hex colors (`#fff`), units (`12px`, `1.5rem`), and CSS
  functions (`rgba(...)`, `calc(...)`, `var(...)`, etc.)
- Single lowercase/hyphenated tokens with no spaces (e.g. `active`, `flex`,
  `hidden`) — these read as class names, CSS keywords, or other identifiers
  rather than prose

Anything already wrapped in a `localize(...)`, `t(...)`, or `vscode.l10n.t(...)`
call — including inside a template-literal interpolation like
`` `${localize('key')}` `` — is stripped out before the prose check runs, so
already-localized text is not flagged. Conversely, a string literal hidden
inside an interpolation's own expression — e.g. a ternary like
`` `${flag ? 'Enable Overrides' : 'Disable Overrides'}` `` — is preserved and
checked, since that is often where the actual hardcoded UI text lives.

This is a **line/regex-based scan**, not an AST parse — by design, since this
is a triage report rather than a hard CI gate (a stricter, ratcheted AST-based
gate for *new* violations may exist as a separate effort). Expect the
occasional false positive or missed case with unusual formatting; use
judgement when triaging.

## Interpreting Output

Each finding shows:
- **File** — grouped heading in both console and markdown output
- **Line** — 1-based line number where the match starts
- **Kind** — which detector matched (`.textContent assignment`, `aria-label
  attribute`, `<button> content`, etc.)
- **Snippet** — a whitespace-collapsed, truncated excerpt of the offending
  code

The script always exits `0`. Nothing is auto-fixed.

## After Reviewing Findings

1. For a genuine hardcoded string:
   - Extension-host code (via `t()`): add the key to
     `vscode-extension/package.nls.json` (+ `package.nls.zh-cn.json` where
     translated).
   - Webview code (via `localize()`): add the key **and its English text** to
     `DEFAULT_LOCALIZATION` in
     `vscode-extension/src/webview/shared/localization.ts` — this is only the
     fallback used when no override arrives — **and** also add the key to
     `getWebviewLocalization()` in `vscode-extension/src/extension.ts` (via
     `l10n.t('key')`) plus `package.nls.json` / `package.nls.zh-cn.json`.
     Skipping the `getWebviewLocalization()` step means the webview always
     falls back to the English `DEFAULT_LOCALIZATION` text, even for
     non-English users.
   Then reference the key from the flagged call site.
2. Follow "Localization changes require test coverage" in the repo's
   `AGENTS.md` — add coverage in `vscode-extension/test/unit/l10n.test.ts` for
   any new key.
3. Re-run this script to confirm the finding is gone, then re-run
   `npm run lint:l10n` / `npm run validate:l10n` to confirm consistency.
4. For a false positive, no action is needed — this script has no baseline or
   suppression mechanism; just use judgement on each report.
