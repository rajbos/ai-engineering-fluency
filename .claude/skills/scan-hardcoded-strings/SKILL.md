---
name: scan-hardcoded-strings
description: Inventory hardcoded (non-localized) UI text across vscode-extension/src/webview/** and the webview-HTML-producing code in vscode-extension/src/extension.ts — string/template literals rendered as UI text that never go through localize()/t()/vscode.l10n.t(). Produces a human-triageable report; never fails the build. Use after a UI change, before a release, or periodically as a localization audit.
---

# Scan Hardcoded Strings Skill

Scans the VS Code extension's webview UI code for candidate hardcoded
(non-localized) UI strings and writes a triage report. This is an
**informational inventory tool**, not a CI gate — it never exits non-zero and
never modifies source files.

## When to Use This Skill

Use this skill when you need to:
- Audit UI text after adding or changing a webview panel or a section of
  `extension.ts`'s `get*Html` methods, to catch strings that were typed
  directly instead of routed through localization
- Build or refresh a localization backlog before a release
- Periodically re-run as a maintenance/audit pass to see whether the backlog
  of non-localized strings is growing or shrinking
- Investigate a specific UI surface (e.g. a webview panel) that appears not
  to translate correctly under a non-English locale

It complements two existing scripts that only check *consistency* of strings
already wired through localization (`scripts/validate-localization.js` /
`npm run lint:l10n`, and `vscode-extension/scripts/validate-l10n.mjs` /
`npm run validate:l10n`) — neither of those, nor anything else in the repo,
detects a plain string literal that never calls `localize(`/`t(`/
`vscode.l10n.t(` in the first place. A separate, stricter AST-based CI gate
for *new* instances of this may exist as an independent effort; this skill is
not that gate — it is a full-codebase inventory for manual triage.

## Running the Check

```bash
node .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js

# Machine-readable JSON output
node .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.js --json
```

The script will:
1. Recursively scan every `*.ts` file (excluding `*.test.ts`) under
   `vscode-extension/src/webview/`, plus only the `get*Html(...)` method
   bodies in `vscode-extension/src/extension.ts` (not the whole 13k-line
   file — this keeps out unrelated string literals like GitHub issue
   Markdown templates or VS Code panel titles)
2. Flag string/template literals in UI-rendering positions — assignments to
   `.textContent`/`.innerText`/`.innerHTML`/`.title`/`.placeholder`,
   `aria-label="..."`/`title="..."`/`placeholder="..."` HTML attributes, and
   text inside `<div>`, `<button>`, `<label>`, `<h1>`–`<h6>`, `<p>`, `<span>`,
   `<td>`, `<th>`, `<option>`, `<summary>`, `<caption>` tags in template
   literals (tolerating simple nested inline tags like `<a>`/`<strong>`)
3. Skip anything already wrapped in `localize(`, `localizeFormat(`, `t(`, or
   `vscode.l10n.t(`, and anything that doesn't look like prose (pure
   numbers/symbols, URLs, CSS values, a narrow denylist of single CSS-keyword
   tokens — not every single lowercase word) — but recover string literals
   hidden inside an interpolation's own expression, e.g. a ternary like
   `` `${flag ? 'Enable Overrides' : 'Disable Overrides'}` ``, rather than
   discarding them along with the interpolation
4. Print a console report grouped by file, with line numbers and snippets
5. Write the same findings to `hardcoded-strings-report.md` at the repo root
6. Set `process.exitCode = 0` rather than forcing `process.exit()` — this
   script informs, it does not gate, and letting the process exit naturally
   avoids truncating buffered output when piped (e.g. in CI or `--json | ...`)

## Interpreting Output

Each finding shows the file, line number, which detector matched (the
"kind"), and a truncated snippet of the offending code. There is no severity
ranking — triage each entry:

| Situation | Action |
|---|---|
| Genuine hardcoded UI prose | Add a localization key and reference it via `localize()` (webview) or `t()` (extension host) |
| False positive (e.g. unusual formatting the regex misjudged) | No action — this is a line-scan, not an AST parse; use judgement |
| Text intentionally not localized (e.g. a raw model/tool name) | No action, but consider a code comment if the reason isn't obvious |

## After Finding Hardcoded Strings

1. Add the missing key:
   - Extension-host text (via `t('key')`): add it to
     `vscode-extension/package.nls.json` (+ `package.nls.zh-cn.json` where
     translated).
   - Webview text (via `localize('key')`): add it to `DEFAULT_LOCALIZATION`
     in `vscode-extension/src/webview/shared/localization.ts` (the English
     fallback) **and** to `getWebviewLocalization()` in
     `vscode-extension/src/extension.ts` (via `l10n.t('key')`) plus
     `package.nls.json` / `package.nls.zh-cn.json`. Without the
     `getWebviewLocalization()` entry, the webview always falls back to the
     English `DEFAULT_LOCALIZATION` text regardless of locale.
2. Replace the literal with a `t('key')` / `localize('key')` call at the
   flagged site.
3. Add test coverage per the repo's "Localization changes require test
   coverage" rule (`vscode-extension/test/unit/l10n.test.ts`).
4. Re-run this script to confirm the finding disappeared, then run
   `npm run lint:l10n` and `npm run validate:l10n` to confirm the new key is
   consistent across locale files.

## Files in This Directory

- **SKILL.md** — This file; instructions for the skill
- **scan-hardcoded-strings.js** — Node.js script that performs the scan
- **scan-hardcoded-strings.test.js** — Unit tests
  (`node --test .github/skills/scan-hardcoded-strings/scan-hardcoded-strings.test.js`)
- **README.md** — Overview and detailed detection rules

## Related files

- `vscode-extension/src/webview/shared/localization.ts` — `localize()` /
  `DEFAULT_LOCALIZATION` (English fallback) for webview UI strings
- `vscode-extension/src/extension.ts` — `getWebviewLocalization()`, which
  must also list a webview key (via `l10n.t('key')`) for it to resolve to a
  real translation instead of the `DEFAULT_LOCALIZATION` fallback
- `vscode-extension/src/l10n.ts` — `t()` for extension-host runtime strings
- `vscode-extension/package.nls.json` (+ `package.nls.<locale>.json`) —
  extension-host translation tables
- `scripts/validate-localization.js`, `vscode-extension/scripts/validate-l10n.mjs`
  — consistency checks for strings already routed through localization
- `hardcoded-strings-report.md` (repo root) — the generated inventory report
