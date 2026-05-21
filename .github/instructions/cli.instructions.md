---
applyTo: "cli/**"
---

# CLI — Architecture & Integration Guide

The CLI (`cli/`) is a standalone command-line tool that **shares the session discovery and data access classes** from `vscode-extension/src/` but has its own aggregation pipeline. It is built with TypeScript and bundled via `cli/esbuild.js` into `cli/dist/cli.js`.

## Key Files

- **`cli/src/helpers.ts`**: Shared helper functions — session discovery, file processing, stats aggregation. Imports all data access classes from `vscode-extension/src/`.
- **`cli/src/commands/`**: One file per sub-command (`stats`, `usage`, `environmental`, `fluency`, `diagnostics`).
- **`cli/esbuild.js`**: Build script. Copies JSON data files from `vscode-extension/src/` to a temp location before bundling, then removes them.
- **`cli/tsconfig.json`**: `paths` alias points to `../vscode-extension/src/*`.

## Developer Workflow

```bash
cd cli
npm install
npm run build            # development build
npm run build:production # minified release build
```

Or from the repo root:
```powershell
./build.ps1 -Project cli
```

## Adding a New Editor / Data Source

When adding support for a new editor or data source, wire it into **both** `vscode-extension/src/` (see `.github/instructions/vscode-extension.instructions.md`) **and** this CLI.

> **Adapter architecture (issue #654)**: The CLI shares the adapter classes from `vscode-extension/src/adapters/` via `buildAdapterRegistry` and `createDataAccessInstances` in `vscode-extension/src/adapters/adapterRegistry.ts`. Currently 11 adapters are registered: OpenCode, Crush, Continue, ClaudeCode, ClaudeDesktop, VisualStudio, MistralVibe, GeminiCli, **CopilotChat**, **CopilotCli**, **JetBrains**. The Copilot and JetBrains adapters own discovery but their `handles()` returns `false`, so `processSessionFile()` falls through to the existing per-format helpers (JSONL/JSON parsing) for those files. Order matters — register Copilot/JetBrains adapters **last**.

### CLI Files to Update

| File | What to add |
|---|---|
| `vscode-extension/src/adapters/adapterRegistry.ts` | Concrete import + instantiation in `createDataAccessInstances` + registry entry in `buildAdapterRegistry` |
| `cli/src/helpers.ts` | Detection, stat routing, `processSessionFile()` branch, `calculateUsageAnalysisStats()` deps only — **no longer needs per-adapter imports or instantiation** |
| `cli/src/commands/stats.ts` | Add entry to `getEditorDisplayName()` |
| `cli/src/commands/usage.ts` | No change needed — uses shared helpers |
| `cli/README.md` | Add the new editor to the "Data Sources" section |

### Integration Points in `cli/src/helpers.ts`

Data-access instantiation is centralised in `vscode-extension/src/adapters/adapterRegistry.ts`
via `createDataAccessInstances`. To add a new editor, update only that file for instantiation.
Then in `cli/src/helpers.ts` add only the routing/processing hooks:

1. **`statSessionFile()`** — add guard routing virtual paths to the real DB file (before the generic `fs.promises.stat()` fallthrough)
2. **`getEditorSourceFromPath()`** — add a path pattern check *before* the generic `'/code/'` or `'vscode'` fallthrough, returning a stable lowercase identifier (e.g. `'neweditor'`)
3. **`processSessionFile()`** — add a guard block calling `getTokens()`, `countInteractions()`, `getModelUsage()` from the data access class and returning a `SessionData` object
4. **`calculateUsageAnalysisStats()` deps** — pass the new instance so `analyzeSessionUsage()` can route to it

### Checklist

- [ ] `vscode-extension/src/adapters/adapterRegistry.ts` — concrete import, `createDataAccessInstances` entry, `buildAdapterRegistry` entry
- [ ] `cli/src/helpers.ts` — detection, stat routing, processSessionFile block, usageAnalysis deps
- [ ] `cli/src/commands/stats.ts` — `getEditorDisplayName()` entry
- [ ] `cli/README.md` — "Data Sources" section updated
- [ ] `docs/vscode-extension/README.md` — add the new editor to the "Supported editors shown in the chart" list in the **Chart View** section
- [ ] `npm run build` passes (from `cli/`)
- [ ] CLI `stats` command shows the new editor in the session list
- [ ] Token counts are non-zero and plausible
