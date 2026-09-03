# Validating a change before it ships

This is the map of what checks exist, what each one can and cannot catch, and
which command to run when.

## Why this document exists

The type checker and the unit suite cover the logic. They do not cover the two
seams where this codebase actually breaks after a burst of merged PRs:

1. **The webview ↔ extension host seam.** A panel talks to the host over
   `postMessage`, which is untyped by construction. A button can post
   `{ command: 'copyFailed' }` forever while the host has no branch for it —
   nothing fails to compile, no test goes red, and the click silently does
   nothing.
2. **The markup ↔ listener seam.** A `<button>` nobody called
   `addEventListener` on looks exactly like a working one, in the source, in a
   screenshot, and in a code review.

Both classes are invisible to every check that does not either read both sides
of the wire or actually click the thing. That is what the checks below add.

## One command before a release

```bash
cd vscode-extension && npm run preflight
```

Runs everything, in stages, on your machine, against your real editor data. It
does **not** stop at the first failure — a release decision needs the whole
picture, so it runs every check and prints one verdict at the end.

```bash
npm run preflight -- --list          # what it would run, and why each one exists
npm run preflight -- --quick         # skip the slow browser stage (~2 min faster)
npm run preflight -- --stage local   # only the checks that need real editor data
npm run preflight -- --skip visual   # everything except one check
npm run preflight -- --json          # machine-readable
```

Exit codes: `0` release-ready, `1` a required check failed, `2` preflight could
not run.

### Why it must run on your machine

CI has no Copilot history, no `~/.copilot/data.db` and no JetBrains logs, so the
`local` stage can only ever run where you are. That stage is the reason to run
preflight at all rather than trusting a green PR: it is the only place that
validates the extension against session data from the editors you actually use.

A check that reports **“not available on this machine”** is listed separately
rather than counted as a pass. On a release machine those lines are the ones
worth reading — a green run that checked nothing is exactly the failure mode
this is meant to prevent.

## The stages

### `static` — compiles, lints, and the wiring the compiler cannot see

| Check | Command | Catches |
|---|---|---|
| `types` | `npm run check-types` | type errors |
| `lint` | `npm run lint` | lint errors |
| `json` | `npm run lint:json` | malformed data files |
| `l10n` | `npm run lint:l10n` | localization keys out of sync |
| `compile` | `npm run compile` | build failures |
| `contract` | `npm run check:contract` | **a message with no handler on the other side** |

### `test` — the unit suite

| Check | Command |
|---|---|
| `unit` | `npm run test:node` |

### `ui` — what the panels actually do when you click them

| Check | Command | Catches |
|---|---|---|
| `interaction` | `npm run check:interaction` | **a control that does nothing when clicked** |
| `visual` | `npm run visual:diff` | what the change looks like, next to the merge base |

### `local` — your real editor data on this machine

| Check | Command | Catches |
|---|---|---|
| `editor-data` | `npm run check:editor-data` | an editor that stopped producing readable sessions |
| `session-schemas` | `node .github/skills/validate-session-schemas/validate-session-schemas.js` | a log format that drifted |
| `debug-log-schema` | `node .github/skills/discover-debug-log-schema/discover-debug-log-schema.js` | VS Code Chat debug-log drift silently turning exact billing into estimates |
| `editor-names` | `node .github/skills/validate-editor-names/validate-editor-names.js` | CLI and extension disagreeing on an editor's name |
| `app-db` | `node .github/skills/validate-app-db-schema/validate-schema.js` | `data.db` schema drift |
| `model-pricing` | `node .github/skills/validate-model-pricing/validate-model-pricing.js` | a model with no pricing entry (advisory) |

## The two new checks, in detail

### `check:contract` — webview message contract

```bash
npm run check:contract
```

Reads both sides of the `postMessage` wire and reports any message with no
counterpart, in either direction:

- **webview → extension**: a command a bundle can post that no host branch
  handles. The button click goes nowhere.
- **extension → webview**: a command the host posts that no webview branch
  handles. The UI never updates.

Commands are collected with the TypeScript AST, so all three dispatch shapes
this codebase uses count: a `switch (message.command)`, an `=== 'literal'`
comparison, and the keys of a `Record<string, Handler>` map (whether that map is
a typed variable or returned from a method like `_getAnalysisMessageHandlers`).

The *handled* side is additionally widened by a plain-text scan, which reaches
handlers living inside inline `<script>` template literals (`loadingHtml.ts`,
`backend/configPanel.ts`) that the AST sees as one opaque string. Widening the
handled set can only ever hide a finding, never invent one. That asymmetry is
deliberate: a checker that cries wolf gets switched off, so precision on
findings is worth more than exhaustiveness.

Runs in CI on every PR, and as a unit test (`test/unit/webviewContract.test.ts`)
so a regression also fails the normal test suite.

**If it flags something you believe is fine**, add it to `ALLOWED_UNHANDLED` in
`scripts/validate-webview-contract.js` **with the reason**. Keep that list
short — it is the escape hatch, not the norm.

### `check:interaction` — interaction smoke

```bash
npm run check:interaction
npm run check:interaction -- --view chart,usage   # one or more views
npm run check:interaction -- --isolate            # reload between clicks (slow, exhaustive)
```

Renders the **real** webview bundles headlessly (reusing the `visual-view-diff`
harness — never the Extension Development Host, see *Never Launch a Real
Editor/IDE Instance* in `AGENTS.md`), then clicks every interactive control and
records what happened:

| Outcome | Meaning |
|---|---|
| `posted` | posted a message to the host — wired |
| `dom-only` | changed the DOM but posted nothing — wired, client-side only |
| `noop-selected` | already the selected option; doing nothing is correct |
| `skipped` | not clickable in this pass (something else was covering it) |
| `inconclusive` | the DOM never settled, so the result is not trustworthy |
| `dead` | **posted nothing and changed nothing — a finding** |
| `click-threw` | **threw an error — a finding** |

It also flags a control that posts a command with no host handler, which is the
half the static check cannot see: a command name computed at runtime
(`{ command: someVar }`) resolving to something nobody handles.

Two details matter for trusting the result:

- **Focus state is normalized away** before the DOM is fingerprinted. Clicking
  anything moves focus, and focus is visible in the markup (`vscode-button`
  carries a `focused` attribute). Hashing raw `innerHTML` reports a DOM change
  for *every* click, which scores dead buttons as wired — a false negative in
  the direction that matters most.
- **The DOM must go quiet** before each measurement, so a slow re-render from
  the previous click is not credited to the next control.

Controls are clicked in one pass over a single page, so a click that opens a
dialog can hide later controls; those are reported as `skipped`, never as
failures. Use `--isolate` to reload the page between clicks when a view's
results look polluted — it is exhaustive but takes ~10 minutes for all views,
which is why it is not the default.

**Adding a view to the crawl** means adding it to
`.github/skills/visual-view-diff/views.config.json` — the same registry the
visual diff uses, so a view added for one is picked up by both.

### A note on the visual diff's baseline

`visual:diff` compares against the merge base with `origin/main`. **On a shallow
clone that ref can be dozens of commits behind its real tip**, and the baseline
then lands on a much older tree — so half the views come back "changed" for
reasons unrelated to the change under review. The script warns when it detects
this; run `git fetch --unshallow` (or pass `--base <ref>`) for a comparison you
can trust. The CI job checks out with `fetch-depth: 0` for the same reason.

## What CI runs

| Job | Checks |
|---|---|
| `build` | types, lint, json, l10n, compile, **contract**, unit tests |
| `ui-checks` (PRs only) | **interaction smoke**, **visual view diff vs the merge base** |

`ui-checks` uploads before/after/diff screenshots as the `webview-screenshots`
artifact and writes the visual report into the job summary, so a reviewer can
see a UI change instead of inferring it from a CSS diff. The visual diff
reports rather than gates — a visual change is usually intended — while the
interaction smoke does gate, because a dead control never is.

## What is deliberately not covered

- **The Team Dashboard view** needs a configured backend to render meaningful
  data, so it is disabled in `views.config.json` and skipped by both the
  interaction smoke and the visual diff.
- **Binary/DB session formats** (Crush sqlite, Visual Studio MessagePack,
  Continue, Mistral Vibe, Claude Desktop) are not schema-validated; they need
  the adapters' own binary parsers. `check:editor-data` lists them so their
  absence is visible rather than silent.
- **A dead control that is already the selected option** is reported as
  `noop-selected`, not as a finding. That is the trade for not carrying three
  standing false positives on the chart view's segmented controls.
