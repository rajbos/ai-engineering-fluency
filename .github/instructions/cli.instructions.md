---
applyTo: "cli/**"
---

# CLI — Architecture & Integration Guide

The CLI (`cli/`) is a standalone command-line tool that **shares the session discovery and data access classes** from the repo-root `src/` folder but has its own aggregation pipeline. It is built with TypeScript and bundled via `cli/esbuild.js` into `cli/dist/cli.js`.

## Key Files

- **`cli/src/helpers.ts`**: Shared helper functions — session discovery, file processing, stats aggregation. Imports all data access classes from `src/`.
- **`cli/src/commands/`**: One file per sub-command (`stats`, `usage`, `environmental`, `fluency`, `diagnostics`).
- **`cli/esbuild.js`**: Build script (esbuild bundles for the CLI and the `session` library entry). The shared JSON data files are imported straight from `../src` and inlined by esbuild — nothing is copied, and the shared `src/` imports no `vscode`, so no `vscode` alias/stub is needed.
- **`cli/tsconfig.json`**: `paths` alias points to `../src/*`.

## Developer Workflow

```bash
cd cli
pnpm install
pnpm run build            # development build
pnpm run build:production # minified release build
```

Or from the repo root:
```powershell
./build.ps1 -Project cli
```

## Adding a New Editor / Data Source

When adding support for a new editor or data source, wire it into **both** the shared `src/` folder (see `.github/instructions/vscode-extension.instructions.md`) **and** this CLI.

> **Adapter architecture (issue #654)**: The CLI shares the adapter classes from `src/adapters/` via `buildAdapterRegistry` and `createDataAccessInstances` in `src/adapters/adapterRegistry.ts`. Currently 11 adapters are registered: OpenCode, Crush, Continue, ClaudeCode, ClaudeDesktop, VisualStudio, MistralVibe, GeminiCli, **CopilotChat**, **CopilotCli**, **JetBrains**. The Copilot and JetBrains adapters own discovery but their `handles()` returns `false`, so `processSessionFile()` falls through to the existing per-format helpers (JSONL/JSON parsing) for those files. Order matters — register Copilot/JetBrains adapters **last**.

### CLI Files to Update

| File | What to add |
|---|---|
| `src/adapters/adapterRegistry.ts` | Concrete import + instantiation in `createDataAccessInstances` + registry entry in `buildAdapterRegistry` |
| `cli/src/helpers.ts` | Detection, stat routing, `processSessionFile()` branch, `calculateUsageAnalysisStats()` deps only — **no longer needs per-adapter imports or instantiation** |
| `cli/src/commands/stats.ts` | Add entry to `getEditorDisplayName()` |
| `cli/src/commands/usage.ts` | No change needed — uses shared helpers |
| `cli/README.md` | Add the new editor to the "Data Sources" section |

### Integration Points in `cli/src/helpers.ts`

Data-access instantiation is centralised in `src/adapters/adapterRegistry.ts`
via `createDataAccessInstances`. To add a new editor, update only that file for instantiation.
Then in `cli/src/helpers.ts` add only the routing/processing hooks:

1. **`statSessionFile()`** — add guard routing virtual paths to the real DB file (before the generic `fs.promises.stat()` fallthrough)
2. **`getEditorSourceFromPath()`** — add a path pattern check *before* the generic `'/code/'` or `'vscode'` fallthrough, returning a stable lowercase identifier (e.g. `'neweditor'`)
3. **`processSessionFile()`** — add a guard block calling `getTokens()`, `countInteractions()`, `getModelUsage()` from the data access class and returning a `SessionData` object
4. **`calculateUsageAnalysisStats()` deps** — pass the new instance so `analyzeSessionUsage()` can route to it

### Checklist

- [ ] `src/adapters/adapterRegistry.ts` — concrete import, `createDataAccessInstances` entry, `buildAdapterRegistry` entry
- [ ] `cli/src/helpers.ts` — detection, stat routing, processSessionFile block, usageAnalysis deps
- [ ] `cli/src/commands/stats.ts` — `getEditorDisplayName()` entry
- [ ] `cli/README.md` — "Data Sources" section updated
- [ ] `docs/vscode-extension/README.md` — add the new editor to the "Supported editors shown in the chart" list in the **Chart View** section
- [ ] `pnpm run build` passes (from `cli/`)
- [ ] CLI `stats` command shows the new editor in the session list
- [ ] Token counts are non-zero and plausible

## CLI Must Reuse Shared Functions

The CLI (`cli/`) is a thin consumer of the shared TypeScript modules in the repo-root `src/` folder (the same modules the VS Code extension uses). **Never reimplement session parsing or cost attribution logic in the CLI — always call the shared functions from `src/`.**

### The canonical split (mirrors `getSessionFileDataCached` in `extension.ts`)

| What you need | Function to call | Source |
|---|---|---|
| Token counts (total, actual, thinking) | `estimateTokensFromJsonlSession()` | `tokenEstimation.ts` |
| Per-model cost attribution (model usage) | `getModelUsageFromSession()` | `usageAnalysis.ts` |
| Debug-log token override | `extractAllTokensFromDebugLog()` | `tokenEstimation.ts` |
| Per-day stats from a session (non-extension hosts) | `addSessionToDailyStats()` + `addSessionEfficiencyToDailyStats()` | `statsHelpers.ts`, `modelEfficiency.ts` |
| Chart webview payload | `buildChartData()` | `chartDataBuilder.ts` |
| Efficiency webview payload | `buildEfficiencyViewData()` | `efficiencyViewBuilder.ts` |
| Usage Analysis webview payload | `buildUsageAnalysisViewData()` (+ `buildWorkspaceCustomization()`, `buildCurationAnalysis()`, `evaluateUsageInsights()` for its inputs) | `usageAnalysisViewBuilder.ts`, `customizationMatrix.ts`, `toolCuration.ts`, `insightsEngine.ts` |
| Diagnostics webview payload | `buildDiagnosticsViewData()` and its `diagnosticDataLoaded` follow-up `buildDiagnosticDataLoadedMessage()` (+ `buildSessionFolderData()`, `buildCacheInfo()`) | `diagnosticsViewBuilder.ts` |

Webview payloads follow the same rule: one function in `src/` builds a payload and
every host (extension, CLI, desktop) calls it, differing only in how it gathers inputs
and in host settings. The Chart, Efficiency, Usage Analysis and Diagnostics payloads
(table above) do this today. A field a host cannot produce is passed as the builder's
documented "not available in this host" value, never omitted. Never add a host-side copy of a payload builder,
and move a payload's assembly to `src/` when you change it — otherwise a field a view
starts requiring reaches one host and not the others.

**Critical rule**: `estimateTokensFromJsonlSession().modelUsage` must **not** be used as the primary source for model attribution. It returns `{}` for delta-format sessions (VS Code Chat JSONL), causing $0 cost for those sessions. Always call `getModelUsageFromSession()` separately for model attribution — it handles all formats through a single code path.

```typescript
// Correct — matches VS Code's getSessionFileDataCached pattern:
const result = estimateTokensFromJsonlSession(content);         // token counts only
tokens = result.actualTokens > 0 ? result.actualTokens : result.tokens;
fileModelUsage = await getModelUsageFromSession(deps, filePath, content); // attribution

// Wrong — diverges from VS Code, breaks delta-format sessions:
fileModelUsage = result.modelUsage; // empty {} for VS Code Chat sessions
```

If you find yourself adding a fallback like "if modelUsage is empty, call X" in the CLI, that is a sign the primary attribution source is wrong — fix the source instead.
