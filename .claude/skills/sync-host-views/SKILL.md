---
name: sync-host-views
description: Keep the Visual Studio and JetBrains webview views (screens) in sync with the VS Code views, while preserving the exact set of views each host ships. Detects views added to the VS Code extension (vscode-extension/esbuild.js entryPoints) that the Visual Studio host (CopilotTokenTracker.csproj + committed webview/*.js) or JetBrains host (jetbrains-plugin/build.gradle.kts) do not yet ship, and surfaces them for a human decision instead of auto-adding. Also refreshes the committed Visual Studio bundles from a fresh dist build so existing views stay current. Use after building/updating the VS Code webviews, before a Visual Studio or JetBrains release, or whenever a host shows stale screens.
---

# Sync Host Views Skill

The VS Code extension owns **all** webview "views" (a.k.a. screens). The Visual
Studio extension and the JetBrains plugin are thin hosts that load a **subset**
of the same compiled webview bundles inside a WebView2 / JCEF browser.

This skill keeps those hosts current **without changing which views they ship**:

- ✅ Refresh the content of views a host already ships (so a screen never goes stale).
- 🛑 **Never** silently add a new VS Code view to a host. New views are detected
  and **handed to the user to decide**.
- 🔎 Flag views a host references that VS Code no longer builds (orphans).

## One view == one screen

Each entry in the VS Code esbuild `entryPoints` map is exactly one webview bundle
and one user-facing screen. "Add a screen" therefore means "add a bundle to the
host include list **and** wire up navigation to it" — that is the human decision
this skill protects.

## The three sources of truth

| Role | File | Symbol |
|------|------|--------|
| **Canonical view set** (VS Code) | `vscode-extension/esbuild.js` | `entryPoints` keys mapping to `src/webview/<name>/main.ts` |
| **Built artifacts** | `vscode-extension/dist/webview/<name>.js` | one `.js` per view (produced by `npm run package`) |
| **Visual Studio host list** | `visualstudio-extension/src/CopilotTokenTracker/CopilotTokenTracker.csproj` | `_WebviewBundle Include="…\dist\webview\<name>.js"` items |
| **Visual Studio committed bundles** | `visualstudio-extension/src/CopilotTokenTracker/webview/<name>.js` | refreshed copies packaged into the VSIX |
| **JetBrains host list** | `jetbrains-plugin/build.gradle.kts` | `prepareBundledAssets` → `from(".../dist/webview") { include("<name>.js", …) }` |

At the time of writing VS Code builds **9** views and both hosts ship the same
**6**: `chart, details, diagnostics, environmental, maturity, usage`. The three
VS Code-only views are `dashboard`, `fluency-level-viewer`, and `logviewer` —
intentionally not shipped by the hosts.

### Why the two hosts differ in practice

- **Visual Studio** commits the bundle files into the repo (`webview/*.js`), so
  they can drift out of date independently of the VS Code build. This skill
  refreshes them.
- **JetBrains** copies the bundles at Gradle build time straight from
  `vscode-extension/dist/webview`, so its tracked views are always content-fresh;
  only its **include list** can drift from the canonical set. This skill compares
  that list.

## What the script reports

`sync-host-views.js` classifies, per host, every canonical view as:

1. **tracked** — the host ships this view. For Visual Studio it additionally
   checks the committed bundle against the freshly built dist bundle (sha256) and
   reports any that are **stale**.
2. **NEW** — VS Code builds it but the host does not list it. Requires a human
   decision; the script exits `3`.
3. **ORPHAN** — the host lists a view VS Code no longer builds. Mechanical drift;
   the script exits `1`.

It also flags Visual Studio list/file inconsistencies: a name in the csproj with
no committed file, or a committed file not referenced by the csproj.

## Usage

```bash
# Detect drift and new screens (read-only). Run from the repo root.
node .github/skills/sync-host-views/sync-host-views.js

# Machine-readable output (CI / further processing).
node .github/skills/sync-host-views/sync-host-views.js --json

# Refresh the committed Visual Studio bundles from dist (tracked views only —
# never adds a view). Requires vscode-extension/dist/webview to be built first.
node .github/skills/sync-host-views/sync-host-views.js --refresh

# Help.
node .github/skills/sync-host-views/sync-host-views.js --help
```

Build the bundles first if `dist/webview` is empty:

```bash
cd vscode-extension && npm run package
```

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Hosts are in sync; nothing stale |
| `1` | Mechanical drift the agent can fix (stale VS bundles, orphan entries, csproj/file mismatch) |
| `2` | Configuration error (a source file was not found / a block moved) |
| `3` | **NEW views detected — stop and ask the user** (takes precedence over `1`) |

## Workflow for the agent

1. **Run the detector.**
   `node .github/skills/sync-host-views/sync-host-views.js`
2. **If Visual Studio bundles are stale (exit 1):** run `--refresh`, then rebuild
   the VS extension and run its tests (see the Visual Studio instructions). Commit
   the refreshed `webview/*.js`. This keeps existing screens up to date.
3. **If exit 3 (NEW views):** do **NOT** add them automatically. Ask the user, one
   view at a time, whether each new VS Code screen should be added to Visual Studio
   and/or JetBrains. Example question: *"VS Code added a `logviewer` screen that
   neither host ships. Add it to Visual Studio, JetBrains, both, or skip?"*
   Only after the user opts in:
   - **Visual Studio:** add `<_WebviewBundle Include="..\..\..\vscode-extension\dist\webview\<name>.js" />`
     to the `CopyWebviewBundles` target in `CopilotTokenTracker.csproj`, copy the
     bundle into `webview/<name>.js`, and wire navigation in
     `ToolWindow/TokenTrackerControl.xaml.cs` (`NavigateToViewAsync` switch) plus
     any toolbar/menu entry. Check `WebBridge/ThemedHtmlBuilder.cs` for view-specific
     hide rules.
   - **JetBrains:** add `"<name>.js"` to the `include(...)` list in the
     `prepareBundledAssets` task in `build.gradle.kts`, and wire navigation in the
     plugin's tool-window/host code.
4. **If exit 1 due to an ORPHAN:** a host lists a view VS Code removed. Confirm the
   removal was intended, then drop the entry from the host list (and the committed
   VS bundle) — again, surface this to the user since it removes a screen.
5. **Re-run the detector** until it is clean (or only the intentional NEW views
   the user chose to skip remain).

## Sub-screens / tabs (out of automatic scope)

Some bundles contain multiple sub-screens or tabs (e.g. the chart view's
*by model* / *by editor* / *by repository* toggles, or the tables on the details
page). Those live **inside** a single bundle and are refreshed automatically when
the bundle is refreshed — there is no separate include entry to add. If a host
needs to hide a specific sub-screen it is done with a CSS rule in
`ThemedHtmlBuilder.cs` (Visual Studio) or the equivalent JetBrains host HTML. When
refreshing bundles, skim the VS Code diff for new sub-screens that a host may need
to hide or reveal, and raise anything notable with the user.

## Related files

- `vscode-extension/esbuild.js` — canonical `entryPoints` view list
- `visualstudio-extension/src/CopilotTokenTracker/CopilotTokenTracker.csproj` —
  `CopyWebviewBundles` target (`_WebviewBundle` includes) and committed-bundle packaging
- `visualstudio-extension/src/CopilotTokenTracker/webview/*.js` — committed VS bundles
- `visualstudio-extension/src/CopilotTokenTracker/ToolWindow/TokenTrackerControl.xaml.cs` —
  `NavigateToViewAsync` view switch (where a new screen is wired up)
- `visualstudio-extension/src/CopilotTokenTracker/WebBridge/ThemedHtmlBuilder.cs` —
  per-view / per-sub-screen hide CSS
- `jetbrains-plugin/build.gradle.kts` — `prepareBundledAssets` webview `include(...)`
- `.github/skills/validate-editor-names/` — complementary skill for editor-name parity
