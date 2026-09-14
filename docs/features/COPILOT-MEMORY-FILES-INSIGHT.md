# Copilot Memory Files Insight

Status: **Partially implemented** — shared analysis module, VS Code insight card,
and CLI command are done; wiring the analysis into `extension.ts`'s stats
pipeline (so the insight card and a dedicated tab actually populate in the
running extension) is the remaining follow-up.

## Background

GitHub Copilot's agent (`GitHub.copilot-chat`) writes its own Markdown "memory"
notes to disk as it works — project conventions, decisions, gotchas, scratch
plans. There is no built-in VS Code UI for these; the community extension
[jlieuw/memowl](https://github.com/jlieuw/memowl) fills that gap by browsing
them in a sidebar.

Investigating memowl's source (`README.md`, `src/memoryStore.ts`) confirmed the
on-disk layout and a local scan of this machine confirmed **real memory data
exists** for several projects. This doc proposes surfacing the same data as a
lightweight insight in this extension, since we already resolve the same
`workspaceStorage/<hash>` paths for session parsing.

## On-disk layout (verified)

```
<User>/globalStorage/GitHub.copilot-chat/memory-tool/memories/                <- User (global) scope
<User>/workspaceStorage/<hash>/GitHub.copilot-chat/memory-tool/memories/
    repo/<name>.md                                                             <- Repository scope (literal "repo" folder)
    <base64(sessionId)>/<name>.md                                              <- Session scope (folder name is the
                                                                                    base64-encoded chat session UUID,
                                                                                    NOT a literal "session" folder —
                                                                                    this diverges from memowl's README
                                                                                    wording and must be handled explicitly)
```

The session-scope folder name decodes (base64) to the same session UUID used
in `workspaceStorage/<hash>/chatSessions/<sessionId>.jsonl`, so a memory file
can be correlated back to the specific chat session that created it.

Confirmed present on this machine, across VS Code + Insiders, for 4 of 8
scanned `workspaceStorage` hashes (repo-scope and session-scope both observed);
no `globalStorage` (user-scope) memories were present.

## Reusable code in this repo

`src/workspaceHelpers.ts` (shared, not VS Code-specific) already exposes
`parseWorkspaceStorageJsonFile()`, which reads a `workspace.json`/`meta.json`
file and extracts the real workspace folder path from its candidate keys.
`copilotMemoryFiles.ts` reuses this directly to resolve a `workspaceStorage/<hash>`
back to a friendly folder name, instead of re-implementing the JSON parsing.

`src/adapters/copilotChatAdapter.ts` also already exposes `getVSCodeUserPaths()`,
which enumerates every VS Code variant's "User" root across Windows/macOS/Linux
(including WSL) — reused as the default scan scope for `discoverAllMemoryFiles()`.

## Proposed insight: "Memory Files"

A new read-only panel/tab (or a card in an existing insights view) showing,
per known workspace:

| Metric | Source |
|---|---|
| # repo-scope memory files | count of `.md` under `memories/repo/` |
| # session-scope memory files | count of `.md` under base64 session folders |
| Staleness | newest/oldest `mtime` per file |
| Size | file size, flagged if unusually large (e.g. the observed 20KB file) |
| Linked session | decode session-folder name → cross-reference existing chat-session parsing, if the session log is also ingested |

No content of the memory files themselves would be surfaced beyond title/first
line — this is metadata/insight only, not a memory browser (memowl already
does that well). Scope is intentionally narrow: help users notice **memory
files piling up, going stale, or growing unexpectedly large**, as a hygiene
signal, not to duplicate memowl's read/manage UI.

## Open questions before implementation

1. Which surface should host this — a new webview tab, or a card inside an
   existing view (e.g. alongside session/worktree insights)?
2. Should this only scan the *current* workspace's memory folder, or all
   `workspaceStorage` hashes on the machine (like memowl and like this repo's
   existing multi-workspace session scanning)?
3. Any privacy concern with reading memory file *names*/*first lines* (which
   may contain repo-specific info) versus counts/sizes only?

## Next step

The shared module (`src/copilotMemoryFiles.ts`), its unit tests, the
`stale-memory-files` insight card in `insightsEngine.ts`, and the CLI's
`memory-files` command are implemented (see below). What's left is plumbing
`discoverAllMemoryFiles()` + `analyzeMemoryFiles()` into `extension.ts`'s
stats-collection pipeline (mirroring `computeCurationAnalysis`) and adding a
UI surface — get sign-off on the open questions above before that lands, since
it touches the already-oversized `extension.ts` and the webview.

## What's implemented

| Piece | Location |
|---|---|
| Discovery + analysis (pure, shared) | `src/copilotMemoryFiles.ts` — `discoverAllMemoryFiles()`, `discoverMemoryFilesInUserPath()`, `analyzeMemoryFiles()`, `decodeSessionFolderName()` |
| Types | `src/types.ts` — `MemoryFileEntry`, `MemoryFilesWorkspaceSummary`, `MemoryFilesAnalysis` |
| Unit tests | `vscode-extension/test/unit/copilotMemoryFiles.test.ts` |
| Insight card | `vscode-extension/src/insightsEngine.ts` — id `stale-memory-files`, fires when `InsightContext.memoryFilesAnalysis` has stale or oversized files; tests in `insightsEngine.test.ts` |
| CLI command | `cli/src/commands/memory-files.ts` — `copilot-token-tracker memory-files [--json] [--stale-days] [--large-kb]`, registered in `cli/src/cli.ts` |

The CLI command scans this machine's real `workspaceStorage`/`globalStorage`
folders (no fixtures needed) and was manually verified against the memory
files already present on this machine.

