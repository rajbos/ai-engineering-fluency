# Security model: visual-view-diff

Lightweight model derived from reading `visual-diff.js`, `render-views.js`,
`diff-screenshots.js` and `lib/*.js`. Update it in the same PR as any change that adds or
alters a trigger surface (see "Skill security classification" in the repository
`AGENTS.md`).

## What the scripts do and talk to

- `visual-diff.js` checks out the merge base into a detached `git worktree`, builds the
  webview bundles there and in the working tree, renders both with `render-views.js`, and
  compares them with `diff-screenshots.js`.
- `render-views.js` builds one HTML page per view (`lib/harness.js`) around a committed
  fixture and the real bundle, loads it from a `file://` URL in headless Chromium through
  Playwright, optionally replays declared click/select/type/post steps (`lib/steps.js`),
  and takes screenshots.
- `diff-screenshots.js` loads two PNGs into a Chromium page and compares pixels.
- The scripts make no network requests themselves. The rendered bundle runs inside Chromium
  with every non-local request and WebSocket refused (`blockNetwork` in `lib/browser.js`).

## Credentials used and where they come from

None are read or sent by the scripts. The bundle build (`node esbuild.js` in both
checkouts) runs with a minimal environment allowlist (`BUILD_ENV_ALLOWLIST` in
visual-diff.js: path, system, home/temp, locale, `CI` and `ESBUILD_BINARY_PATH`), so
tokens in the operator's shell are not visible to the build scripts under review.
`render-views.js` and `diff-screenshots.js` are the skill's own code and inherit the
caller's environment; the bundles they load run in Chromium, which has no access to it.

## Untrusted inputs parsed

- The code under review: `vscode-extension/esbuild.js` and the webview sources from the
  base commit and from the working tree are executed to build the bundles
  (`buildWebviews` in visual-diff.js), and the resulting bundles are
  executed in Chromium: each page is generated with the bundle as its script
  (`renderView` in render-views.js; the `<script src>` tag is in `buildPageHtml` in
  `lib/harness.js`) and loaded with `page.goto` (`renderView`).
- The base commit's `views.config.json` and fixtures, merged into a baseline registry
  (`writeBaselineRegistry` in visual-diff.js). Registry fields drive file paths (`bundle`, `fixture`, `$fromRepoJson`)
  and the UI steps replayed in the page.
- The Playwright module, resolved by `require()` from the repo, the pinned workflow
  install and the global npm root (`lib/browser.js`).
- `--base`, `--out`, `--view`, `--config` and the other CLI arguments. `--base` values
  that are empty or start with `-` are refused, and `--base`, `--out`, `--theme` or
  `--view` given without a value is an error rather than a silent default.

## What it writes and where

- `visual-output/` by default, or `--out`: `baseline/`, `current/`, `diff/` (PNGs,
  `render-report.json`, `report.json`, `report.md`), `timings.md` (phase names
  and durations only) and the temporary `.baseline-registry.json`. Existing
  `baseline/`, `current/`, `diff/`, `timings.md`, `.baseline-registry.json` and
  `.baseline-worktree` under that directory are deleted first, but only when the
  directory is the default `visual-output/` or carries the `.visual-view-diff-output`
  marker a previous run wrote; otherwise the run refuses to start
  (`prepareOutRoot` in visual-diff.js). Nothing there is followed through a symlink:
  a symlinked output root, or a marker that is not a regular file, is refused; the
  marker is created with `O_EXCL`; and a symlinked entry is removed as a link, never
  through it.
- A temporary git worktree at `<out>/.baseline-worktree` containing the baseline build
  output; its `vscode-extension/node_modules` is a symlink to the working tree's
  (`buildWebviews` in visual-diff.js). The worktree is removed in a `finally` block.
- `vscode-extension/dist/` of the working tree (esbuild output).
- A `mkdtemp` directory under the OS temp dir for the generated HTML pages, removed when
  rendering ends (`main` in render-views.js).

## External programs run

- `git`: `rev-parse`, `merge-base`, `rev-list`, `worktree add --detach`, `worktree remove`,
  `worktree prune`.
- `node esbuild.js` in both checkouts, `node render-views.js`, `node diff-screenshots.js`.
- `node npm-cli.js root -g` to locate global Playwright (`lib/browser.js` line 31).
- Chromium via Playwright, launched with default options (no flags that disable the
  sandbox).
All use `execFileSync` or `spawn` with argument arrays and no shell. The two
render processes run concurrently; each is awaited before the worktree is removed.

## Mitigations in the code

- The baseline is built in a detached worktree, so the working tree is never checked out
  over or stashed.
- View and state ids must match a strict allowlist, so ids cannot carry path separators
  into screenshot or temp file names (`lib/config.js` `ID_PATTERN`). The fixture file name
  is reduced with `path.basename` (render-views.js `renderView`).
- `$fromRepoJson` and `view.bundle` are resolved with `resolveInside` (`lib/harness.js`):
  absolute paths, `../` segments and symlinks that resolve outside the repo root or the
  dist directory are refused.
- Chromium pages (render and interaction smoke) route every request through
  `blockNetwork`: only `file:`, `data:` and `blob:` URLs load; http(s) is aborted and
  WebSockets are closed, at the context level so popups are covered too. A Playwright
  too old to route WebSockets fails the render instead of skipping that block.
- The bundle build gets an allowlisted environment, not the caller's.
- Embedded JSON has every `<` escaped as `<`, so a payload cannot close the
  script tag (`toScriptJson` and `readJsonConfigGlobals` in `lib/harness.js`).
- The page gets a stub `acquireVsCodeApi` that only records messages in memory; nothing is
  posted anywhere. The harness never launches VS Code and the skill does not upload images.
- Time is frozen and rendering fails loudly on empty roots and page errors, which limits
  silent wrong results (not a security control, but it keeps a blank page from passing).

## Known gaps

Recorded, not fixed here.

- Building still runs the reviewed project's `esbuild.js` and dependency tree as the
  operator's user, with filesystem access to whatever that user can read. Stripping the
  environment removes tokens, not the ability to read files such as `~/.npmrc` or a git
  credential store. The skill is safe only for code the operator already trusts to run
  locally; it must not be pointed at an unreviewed fork without isolation.
- The network block covers what Playwright routes (HTTP(S) and WebSockets). Channels it
  does not intercept, such as WebRTC, are not blocked. The build step has no network
  restriction at all.
