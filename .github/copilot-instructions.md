# GitHub Copilot Token Tracker — Repository Instructions

This document provides top-level guidance for AI agents contributing to this repository. Detailed, folder-specific instructions live in `.github/instructions/` and are applied automatically by Copilot when you work inside those folders.

## Repository Structure

```
/
├── build.ps1                    ← Root build orchestrator (all projects)
├── src/                         ← Shared TypeScript sources + JSON data files
│                                   (session parsing, token estimation, adapters —
│                                    consumed by vscode-extension/ and cli/)
├── vscode-extension/            ← VS Code extension (TypeScript / Node.js)
├── cli/                         ← Command-line tool  (TypeScript / Node.js)
├── visualstudio-extension/      ← Visual Studio extension (C# / .NET)
├── jetbrains-plugin/            ← JetBrains IDE plugin (Kotlin / Gradle / IntelliJ Platform)
├── docs/                        ← Shared documentation
└── .github/
    ├── copilot-instructions.md  ← This file
    └── instructions/
        ├── vscode-extension.instructions.md   ← VS Code extension guide
        ├── cli.instructions.md                ← CLI guide
        ├── visualstudio-extension.instructions.md ← Visual Studio extension guide
        ├── jetbrains-plugin.instructions.md   ← JetBrains plugin guide
        └── workflows.instructions.md           ← CI/CD workflow security guide
```

## Sub-project Instructions

| Folder | Instructions file |
|---|---|
| `vscode-extension/` | `.github/instructions/vscode-extension.instructions.md` |
| `cli/` | `.github/instructions/cli.instructions.md` |
| `visualstudio-extension/` | `.github/instructions/visualstudio-extension.instructions.md` |
| `jetbrains-plugin/` | `.github/instructions/jetbrains-plugin.instructions.md` |
| `.github/workflows/` | `.github/instructions/workflows.instructions.md` |

## Building Everything

Use the root orchestrator from the repo root:

```powershell
./build.ps1                          # build all projects
./build.ps1 -Project vscode          # build VS Code extension only
./build.ps1 -Project cli             # build CLI only
./build.ps1 -Project vscode -Target test   # run tests
```

Individual project builds:
```bash
cd vscode-extension && npm run compile   # VS Code extension
cd cli && npm run build                   # CLI
```

## Documentation

The `docs/` folder contains all project documentation. Start with the index:

📖 **[docs/README.md](docs/README.md)** — Full categorized index of all documentation

Key categories:
- **Core Reference** — fluency scoring rules, data schemas, trackable metrics
- **Component Docs** — per-component guides (`cli/`, `vscode-extension/`, `visual-studio/`, `sharing-server/`, `specs/`)
- **Log File Schemas** — session log formats for all supported editors (`docs/logFilesSchema/`)
- **Feature Docs** — per-feature documentation (`docs/features/`)
- **ADRs** — implementation notes and architectural decisions (`docs/adr/`)

## Development Guidelines

- **Minimal Changes**: Only modify files directly needed for the task. Avoid touching unrelated files.
- **Focused Modifications**: Make surgical, precise changes without affecting other functionality.
- **Preserve Existing Structure**: Don't refactor or reorganize unless essential for the task.

## Never Launch a Real Editor/IDE Instance

AI agents (Claude Code, GitHub Copilot, etc.) must never launch a real, visible instance of an IDE as part of testing or verifying a change — e.g. `code .` / `code <file>`, pressing `F5` to start the VS Code Extension Development Host, `./gradlew runIde` (JetBrains sandbox IDE), or opening Visual Studio/`devenv`. These pop open real windows on the developer's machine, which is disruptive and unexpected when it happens mid-session, especially in unattended or scheduled agent runs.

These steps are documented in places like `.github/instructions/vscode-extension.instructions.md` and `.github/instructions/jetbrains-plugin.instructions.md` **for human developers only**, who can watch the window, click through the UI, and close it when done. An agent has no way to "close" a window it opens and no way to observe it, so these steps are meaningless for automated verification and only cause disruptive side effects.

Instead, verify changes using non-interactive tooling: compile/build scripts (`npm run compile`, `./gradlew build`, `dotnet build`), automated unit test suites (`npm run test:node`, `./gradlew test`, `dotnet test`), and linters/type-checkers. If you are writing or editing a skill, prompt, or instructions file, do not add steps that tell an agent to launch a GUI editor/IDE — mark such steps explicitly as manual/human-only, or omit them entirely from agent-facing docs.

This also governs `.github/github-app.yml`. Its `code .` script has **no `triggers` entry**, on purpose — that makes it an on-demand action a human clicks in the GitHub App's session UI, not something that fires automatically. **Never attach `triggers: [session.create]` (or any other trigger) to a script that launches an editor/IDE.** `automation.auto_issue_session: true` means sessions can be created unattended (e.g. an issue auto-assigned to Copilot) with nobody there to click anything — a triggered `code .` would pop open a real VS Code window during those unattended sessions too, which is the exact bug this section exists to prevent. Non-GUI setup steps (installing dependencies, compiling) are fine to keep on `session.create` since they have no visible side effect.

## CLI Must Reuse Shared Functions

The CLI (`cli/`) is a thin consumer of the shared TypeScript modules in the repo-root `src/` folder (the same modules the VS Code extension uses). **Never reimplement session parsing or cost attribution logic in the CLI — always call the shared functions from `src/`.**

### The canonical split (mirrors `getSessionFileDataCached` in `extension.ts`)

| What you need | Function to call | Source |
|---|---|---|
| Token counts (total, actual, thinking) | `estimateTokensFromJsonlSession()` | `tokenEstimation.ts` |
| Per-model cost attribution (model usage) | `getModelUsageFromSession()` | `usageAnalysis.ts` |
| Debug-log token override | `extractAllTokensFromDebugLog()` | `tokenEstimation.ts` |

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

## Coding Agent Data Sources

When running as the GitHub Copilot Coding Agent (bootstrapped via `.github/workflows/copilot-setup-steps.yml`), additional data files may be available in the workspace root. These are downloaded from Azure Storage during the agent's setup phase and are **not** present in local development.

- **`./session-logs/`**: Raw Copilot Chat session log files (last 7 days) from Azure Blob Storage.
- **`./usage-data/usage-agg-daily.json`**: Aggregated daily token usage data (last 30 days) from Azure Table Storage.

These files are only available when the repository's `copilot` GitHub environment has `COPILOT_STORAGE_ACCOUNT` configured. See the `session-log-data` skill in `.github/skills/session-log-data/SKILL.md` for data schemas, analysis examples, and cost estimation.

To check if data is available:
```bash
[ -d ./session-logs ] && echo "Session logs available"
[ -f ./usage-data/usage-agg-daily.json ] && echo "Aggregated data available"
```

## Keep Claude Code's Mirrored Agents & Skills in Sync

This repo also ships Claude Code equivalents of the Copilot customizations below, kept as separate files because the two tools use different formats/locations:

- `.github/agents/*.agent.md` (Copilot custom agents) ↔ `.claude/agents/*.md` (Claude subagents) — same name, same body content, but frontmatter `tools:` uses Claude's tool names (`Read`, `Grep`, `Glob`, `Bash`, `Edit`, `Write`, `Agent`) instead of Copilot's internal tool IDs (`search/codebase`, `execute/runInTerminal`, etc.). Bodies **should** match, but **may** intentionally diverge where the two platforms' mechanics genuinely differ — e.g. CI-driven vs. local Bash invocation, cross-vendor model names vs. Claude Code's own (`opus`/`sonnet`/`haiku`), or the `task` tool vs. the `Agent` tool. Keep any such divergence minimal and deliberate: it should read as a platform adaptation of the same instruction, not a different instruction.
- `.github/skills/*/SKILL.md` (Copilot Agent Skills) ↔ `.claude/skills/*/SKILL.md` (Claude Skills) — **only** the `SKILL.md` is duplicated (same content, same format on both tools). The scripts, README, and other supporting files live **only** under `.github/skills/<name>/` — do not copy them. The `.claude/skills/<name>/SKILL.md` file's instructions reference those scripts by their real `.github/skills/<name>/...` path, so there is a single source of truth for the code and no duplication.

**If you add, remove, or edit a file under `.github/agents/`, make the matching change under `.claude/agents/` in the same PR** (and vice versa). **If you edit a skill's `SKILL.md` under `.github/skills/`, copy the same edit into `.claude/skills/<name>/SKILL.md`** — but if you only change a script/README/data file (not `SKILL.md` itself) under `.github/skills/`, no Claude-side change is needed, since Claude's copy just points at that same file. Claude Code does not read `.github/agents/` or `.github/skills/` on its own — without this manual mirroring the Claude-side copy silently goes stale.

## DevContainer Terminal Behavior

This repository uses a devcontainer (`.devcontainer/devcontainer.json`). When working inside the devcontainer, **terminal output capture is unreliable** — commands execute successfully but the `run_in_terminal` tool often returns empty or truncated output. This is a known limitation of the remote filesystem layer.

### What NOT to do

Do not enter retry loops trying to capture terminal output. These patterns waste turns and never converge:
- Running commands repeatedly hoping output will appear
- Redirecting output to `/tmp/` files and using `read_file` to read them (the remote FS often fails on newly-written temp files)
- Spawning background terminals with `sleep && tail` to poll for results
- Delegating to subagents to "run tests in a clean way"

### What to do instead

1. **Use `npm` scripts for standard operations** (from inside `vscode-extension/`):
   - `npm run compile` — lint + build
   - `npm run compile-tests` — compile test files to `out/`
   - `npm run test:node` — compile + run unit tests
   - `npm run test:coverage` — compile + run tests with coverage thresholds

2. **Use `get_errors` to validate compilation.** After edits, call `get_errors` on the changed files instead of running `tsc` in the terminal.

3. **Run tests in small batches.** Instead of running all test files in one command, run one file at a time:
   ```bash
   cd vscode-extension
   node --require ./out/vscode-extension/test/unit/vscode-shim-register.js --test out/vscode-extension/test/unit/sessionParser.test.js
   ```

4. **Accept a single run.** If a test command runs without returning output, do **not** re-run it.

5. **Write output to the workspace (not `/tmp/`).** If you must capture output to a file, write it inside the workspace where `read_file` can reliably access it.
