# AI Engineering Fluency — Repository Instructions

(Previously known as the "GitHub Copilot Token Tracker")

Top-level guidance for AI agents in this repository. Folder-specific rules live in the
scoped files listed under [Sub-project Instructions](#sub-project-instructions); Copilot
applies them automatically, other agents should read the one for the folder they touch.

## Repository Structure

Run `ls -a` for the live top level.

```
/
├── AGENTS.md / CLAUDE.md        ← This file / Claude Code entry point (imports this file
│                                   and sharing-server/AGENTS.md)
├── build.ps1 / dev.ps1          ← Root build orchestrator / local dev helper
├── src/                         ← Shared, editor-neutral TypeScript + JSON data
│                                   (session parsing, token estimation, adapters)
├── vscode-extension/            ← VS Code extension (TypeScript)
├── cli/                         ← Command-line tool (TypeScript)
├── copilot-app/                 ← Copilot app canvas, shipped as the `ai-fluency-canvas`
│                                   Copilot plugin (plain Node .mjs; runs the CLI)
├── visualstudio-extension/      ← Visual Studio extension (C# / .NET)
├── jetbrains-plugin/            ← JetBrains IDE plugin (Kotlin / Gradle)
├── desktop/                     ← Electron tray app reusing the extension's webview bundles
├── badge-app/                   ← MicroPython app for the GitHub Universe 2026 badge
├── sharing-server/              ← Self-hosted team sharing API + dashboard (TypeScript, SQLite)
├── release-video/               ← Local narrated release-video generator (FFmpeg, local TTS)
├── scripts/                     ← Build/release/CI helper scripts
├── omp-segment/                 ← Oh My Posh prompt segment showing token usage
├── assets/ , docs/              ← Brand assets / shared documentation (docs/README.md is the index)
├── screenshots/                 ← Sample-data settings for scripts/capture-screenshots.ps1
│                                   (manual, Windows-only; agents must not run it)
├── .vscode/                     ← Settings, tasks, launch configs for human developers
├── .devcontainer/               ← Dev container (see .devcontainer/README.md)
├── .claude/                     ← Claude Code agents and skills, mirrored from .github/
└── .github/                     ← agents/, skills/, instructions/, workflows/,
                                    plugin/marketplace.json, copilot-instructions.md
```

## Sub-project Instructions

| Folder | Instructions file |
|---|---|
| `src/` | `.github/instructions/src.instructions.md` |
| `vscode-extension/` | `.github/instructions/vscode-extension.instructions.md` |
| `cli/` | `.github/instructions/cli.instructions.md` |
| `desktop/` | `.github/instructions/desktop.instructions.md` |
| `visualstudio-extension/` | `.github/instructions/visualstudio-extension.instructions.md` |
| `jetbrains-plugin/` | `.github/instructions/jetbrains-plugin.instructions.md` |
| `sharing-server/` | [sharing-server/AGENTS.md](sharing-server/AGENTS.md) (the server data separation contract), `.github/instructions/sharing-server.instructions.md` |
| `.github/workflows/` | `.github/instructions/workflows.instructions.md` |
| `.github/skills/` | [.github/skills/README.md](.github/skills/README.md) |
| `.devcontainer/` | [.devcontainer/README.md](.devcontainer/README.md) |

Moved out of this file, by original section name:

- **Webview changes must be validated by clicking**, **Localization changes require test
  coverage**, **File-size ceiling (`max-lines`)** and **Where the `extension.ts`
  decomposition stands** → `vscode-extension.instructions.md`.
- **The canonical split** table behind "CLI Must Reuse Shared Functions" → `cli.instructions.md`.
- **Skill security classification** → `.github/skills/README.md`.
- **Coding Agent Data Sources** and the **graphify** code graph → `.github/skills/session-log-data/SKILL.md`.
- **DevContainer Terminal Behavior** → `.devcontainer/README.md`.

## Building Everything

```powershell
./build.ps1                                 # build all projects
./build.ps1 -Project vscode                 # VS Code extension only
./build.ps1 -Project cli                    # CLI only
./build.ps1 -Project vscode -Target test    # run tests
```

Or per project: `cd vscode-extension && pnpm run compile`, `cd cli && pnpm run build`.

## Testing

From `vscode-extension/`:

- `pnpm run preflight` runs every check (type-check, lint, tests, UI checks, local-data
  validation) and reports one verdict; `pnpm run preflight:quick` skips the slow UI stage.
- `pnpm run validate` (type-check + lint + build), `pnpm run test:node`, and
  `pnpm run test:src` (shared `src/test` only).
- A single test file:
  ```bash
  node --require ./out/vscode-extension/test/unit/vscode-shim-register.js --test out/vscode-extension/test/unit/l10n.test.js
  node --test out/src/test/sessionParser.test.js     # shared src/ tests need no shim
  ```

What each check catches is in [docs/VALIDATION.md](docs/VALIDATION.md).

## Development Guidelines

Make minimal, focused changes: only touch files the task needs, and don't refactor or
reorganize unless essential.

## Never Launch a Real Editor/IDE Instance

Agents must never launch a visible IDE to test or verify a change: no `code .`, no `F5`
Extension Development Host, no `./gradlew runIde`, no Visual Studio/`devenv`. These open
real windows on the developer's machine that an agent can neither observe nor close,
which is especially disruptive in unattended runs. Instructions that mention them are
for human developers only; in agent-facing docs, mark such steps human-only or omit them.

Verify with non-interactive tooling instead: builds (`pnpm run compile`, `./gradlew build`,
`dotnet build`), unit tests (`pnpm run test:node`, `./gradlew test`, `dotnet test`),
linters and type-checkers.

The `code .` script in `.github/github-app.yml` has **no `triggers` entry** on purpose,
so it runs only when a human clicks it. **Never attach `triggers: [session.create]` (or
any trigger) to a script that launches an editor/IDE**: `automation.auto_issue_session:
true` creates sessions unattended. Non-GUI setup steps may stay on `session.create`.

## Shared `src/` Is Editor-Neutral

`src/` is consumed by the extension, the CLI and the desktop app: **no `vscode` imports
and no imports from `vscode-extension/`, `cli/` or `desktop/`** (an ESLint error).
Host services are injected through `deps` objects. See
`.github/instructions/src.instructions.md` and [src/README.md](src/README.md).

## CLI Must Reuse Shared Functions

The CLI, the extension and the desktop app call the same `src/` functions for session
parsing, token estimation, cost attribution and webview payloads. **Never reimplement
that logic in a host**, and never use `estimateTokensFromJsonlSession().modelUsage` for
model attribution (it is empty for delta-format sessions); call
`getModelUsageFromSession()`. The function table and the correct pattern are in
`.github/instructions/cli.instructions.md`.

## Agent Changes to CI and Agent Configuration Need a Human

`.github/workflows/guard-agent-config.yml` fails a PR that touches `.github/**`,
`.claude/**`, `.devcontainer/**`, `AGENTS.md` or `CLAUDE.md` and looks agent-authored
(agent branch prefix such as `claude/`, `copilot/`, `agent-review/`; a bot author other
than dependabot or github-actions; or any AI `Co-authored-by:` trailer, including GPT,
Codex, Gemini, Mistral, Vibe, Devin, Cursor and Aider). That is the check working: say
what you changed and why, and ask the maintainer to review and add the
`agent-config-approved` label. Never route around it.

## Keep Claude Code's Mirrored Agents & Skills in Sync

- `.github/agents/*.agent.md` ↔ `.claude/agents/*.md`: same name and body; frontmatter
  `tools:` uses Claude's tool names. Bodies may diverge only as a deliberate platform
  adaptation (CI vs. local execution, model names, `task` vs. `Agent`).
- `.github/skills/*/SKILL.md` ↔ `.claude/skills/*/SKILL.md`: byte-identical. Scripts and
  other supporting files live **only** under `.github/skills/<name>/`.

**Change both sides in the same PR.** Claude Code does not read `.github/agents/` or
`.github/skills/`, so an unmirrored edit silently goes stale.
`.github/workflows/scripts/check_agent_mirror.py` reports drift.

## Keep This File's Structure Diagram and Title in Sync

Adding or removing a top-level directory, or renaming the product, updates this file's
structure diagram and H1 title in the same PR.

## Pre-PR Self-Review Checklist

- **Close the whole class, not just the cited instance.** When review flags one case
  (one race, one edge case, one unguarded call site), enumerate every case of that kind
  and fix them all in the same pass.
- **Batch a full round into one push.** Address every open review comment, then push
  once, not one commit per comment.
