---
name: visual-view-diff
description: Render the VS Code extension's webview panels headlessly and detect which ones changed visually, producing before/after/diff screenshots for review. Use when a change touches webview UI (src/webview/**, view HTML in extension.ts, shared CSS) and you want to see and show what it looks like, or to check that a refactor changed nothing visually.
---

# Visual View Diff Skill

Renders the extension's webview panels **headlessly**, screenshots them, and
reports which views changed compared to a baseline commit.

The screenshots are the deliverable. **Posting them anywhere — a PR comment, a
job summary, an artifact upload — is deliberately not part of this skill.** It
answers exactly one question: *what changed visually, and what does it look
like?* Whoever wants to publish that answer reads `report.md` and the PNGs.

## When to use it

- A change touches `vscode-extension/src/webview/**`, the shared webview CSS, or
  a `get*Html` method in `extension.ts`.
- A refactor is supposed to be visually neutral and you want proof.
- You want before/after images of a UI change for a human to look at.

## Why this exists (and why it does not open VS Code)

The repo forbids agents from launching a real editor window — see
"Never Launch a Real Editor/IDE Instance" in `.github/copilot-instructions.md`.
That rules out the Extension Development Host, and with it the existing
`aiEngineeringFluency.runLocalViewRegression` command, which only a human can
run and which checks DOM *metrics* (node counts, text length) rather than
appearance.

This skill covers the gap: it renders the **real webview bundles** outside VS
Code. Every panel's HTML shell in `extension.ts` is the same four ingredients —
a `<div id="root">`, a `window.__INITIAL_<VIEW>__` payload, the shared JSON
config globals, and `<script src="dist/webview/<view>.js">`. The harness
reproduces that shell around a committed fixture and supplies the `--vscode-*`
theme tokens VS Code would normally inject, then lets the real bundle render.

Nothing about the views is re-implemented, which is what makes the screenshots
trustworthy: if rendering code changes, the screenshot changes with it.

## Usage

Everything runs from the repo root. Bundles must be built first
(`cd vscode-extension && npm install && node esbuild.js`).

### Compare against the baseline commit (the usual case)

```bash
node .github/skills/visual-view-diff/visual-diff.js
# or, from vscode-extension/:  npm run visual:diff
```

This builds the webviews at the merge base with `origin/main` in a temporary
`git worktree`, builds the working tree, renders both, and compares. Your
checkout is never touched — no stashing, no branch switching.

```bash
# Compare against something else, or render both themes
node .github/skills/visual-view-diff/visual-diff.js --base origin/main --theme both
node .github/skills/visual-view-diff/visual-diff.js --view details,chart
```

Output lands in `visual-output/` (git-ignored):

```
visual-output/
├── baseline/   <view>.<theme>.png     — before
├── current/    <view>.<theme>.png     — after
└── diff/       <view>.<theme>.diff.png, report.md, report.json
```

### Just screenshot the current state

```bash
node .github/skills/visual-view-diff/render-views.js --out visual-output/current --theme both
# or, from vscode-extension/:  npm run visual:render -- --theme both
```

### Compare two directories you already have

```bash
node .github/skills/visual-view-diff/diff-screenshots.js \
  --baseline visual-output/baseline --current visual-output/current --out visual-output/diff
```

## Reading the result

`diff/report.md` is a Markdown summary — a table of every view with its status
(changed / unchanged / added / removed), how many pixels moved, and the image
size. `report.json` is the same data for scripting.

Diff images paint changed pixels magenta over a dimmed copy of the new
screenshot, so a change is easy to locate in context.

**A changed view is not automatically a problem.** Read the diff image and
decide: intended restyle, or accidental regression? The tool reports; you judge.

## Requirements

- **Playwright with Chromium.** Intentionally *not* a dependency of the
  extension — this is developer/CI tooling, not shipped code. `lib/browser.js`
  finds a local or global install; if none exists:
  `npm install -g playwright && npx playwright install chromium`.
- **Built webview bundles** in `vscode-extension/dist/webview/`.
- **`vscode-extension/node_modules`** — the baseline worktree symlinks it rather
  than running a second `npm install`.

## Fixtures

Each view renders from a committed JSON fixture in `fixtures/`, holding exactly
the payload `extension.ts` passes to that view. Fixtures use fixed timestamps
and synthetic numbers so two runs of the same code produce byte-identical
screenshots — a `Date.now()` anywhere would make every view diff against itself.

A fixture can reference a repo data file instead of copying it:

```json
{ "categories": { "$fromRepoJson": "src/fluencyLevelData.json" } }
```

That keeps the fixture small and means editing the source file shows up as the
visual change it really is.

### Adding a view

1. Find the view's HTML shell in `extension.ts` (`get<Name>Html`) and note the
   `window.__INITIAL_*__` global it assigns.
2. Add an entry to `views.config.json` — `id`, `bundle` (its esbuild entry point
   name in `esbuild.js`), `global`, and `fixture`.
3. Write `fixtures/<id>.json` with that payload.
4. Check it renders: `node render-views.js --view <id> --out /tmp/check`.

A view whose `#root` comes out empty is reported as an **error**, not silently
screenshotted blank — a fixture missing a required field would otherwise pass as
"no visual change" forever.

`dashboard` is registered but disabled: it needs a configured team backend to
show anything, the same reason the in-editor regression runner skips it.

## Determinism

Two runs of unchanged code produce identical screenshots. That is load-bearing —
without it every run reports spurious changes. It is achieved by pinning the
locale to `en-US` and the timezone to UTC, disabling CSS animations and
transitions, hiding carets, waiting for fonts to settle, and keeping all
time-dependent values out of the fixtures.

The two views that draw to a `<canvas>` (`chart`, `maturity`) can still differ
by a handful of anti-aliased pixels, so they carry a small `noiseFloorPixels`
tolerance in `views.config.json`. Every other view is compared **exactly** — a
global tolerance would hide small real changes, such as a restyled badge that
moves fewer than 200 pixels.

## Limits

- **Not a substitute for looking at the real extension.** The harness supplies
  VS Code's theme tokens from `lib/theme-dark.css` / `lib/theme-light.css`,
  which track Dark Modern and Light Modern. A user's custom theme, high-contrast
  mode, or a token these files do not define will look different in practice.
  When a webview starts using a new `--vscode-*` token, add it to both files.
- **Fixtures are hand-authored**, so they can drift from the real payload shape.
  Drift shows up as a render error or a visibly wrong view, not as a silent pass.
- **Interaction is not covered** — each view is screenshotted in its initial
  state. Hover, click and tab states are out of scope.
