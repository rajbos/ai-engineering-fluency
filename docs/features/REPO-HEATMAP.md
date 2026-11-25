# Repository Heatmap

**Command:** `AI Engineering Fluency: Show Repository Heatmap` (`aiEngineeringFluency.showRepoHeatmap`)

A treemap of every file an agent touched in a repository. Each rectangle is one file, nested
inside the folders it lives in; its area is proportional to how often it was touched, its colour
says what happened to it and its intensity how busy it was. Click a folder label (or a breadcrumb)
to zoom into that folder and back out. The standard period selector (Today, Last 7 / 30 / 90 days,
Current month, All time) filters it.

| Kind | Source in the session logs |
|---|---|
| Read | `Read` (Claude Code), `view` (Copilot CLI), `copilot_readFile` (VS Code Copilot Chat) |
| Edited | `Edit` / `MultiEdit` / `NotebookEdit` and `Write` over an existing file, `edit`, `copilot_replaceString` and friends |
| Created | `Write` of a new file, `create`, `copilot_createFile` |
| Deleted | **Inferred** from shell commands: `rm`, `git rm`, `del`, `Remove-Item` |

## Hotspots

Above the treemap, a table lists the files in the selected period that you can do something
about. Only two patterns are flagged; a file that is simply edited a lot is normal work.

| Pattern | Rule | What to do |
|---|---|---|
| Re-read | At least 10 reads and 4 or more reads per edit | Agents navigate the file by reading it. Give them a code-graph or symbol-lookup tool to query instead, or split the file. |
| Generated file | A dependency folder, build output, lockfile or minified file read at least 3 times | Tell agents to skip it in your agent instructions. |

- **Est. tokens** is the text the reads returned to the model, at 4 characters per token. Reads
  whose size the log does not record are assumed to be as large as the file's sized reads on
  average (the tooltip says how many reads the estimate rests on); a dash means no read of the
  file has a recorded size. Sizes are recorded for Claude Code reads (not images), most Copilot
  CLI reads and newer VS Code Copilot Chat logs.
- **vs. previous** compares the reads with the period of the same length just before, so you can
  see a fix working. All time has no previous period.
- **Copy prompt** puts a prompt for your agent on the clipboard: set up (or use) a lookup tool and
  add one line to the agent instructions, or add a "do not read" rule for a generated file. It
  deliberately does not ask for a summary of the file, which would go stale.
- The tip above the table names the code-graph tool found on this machine (a skill folder under
  `~/.claude/skills`, `~/.copilot/skills` or `~/.agents/skills`, a server entry in `~/.mcp.json`
  or `~/.cursor/mcp.json`) or in an open workspace folder (a workspace skill, an MCP server entry
  or the tool's output folder). When none is found it links to the tools in
  `src/codeNavTools.json`. Detection says a tool is set up, not that agents use it.

Clicking a file in the table zooms the treemap to it.

## Data and privacy

File paths are local-only. They are derived on this machine from your session logs, cached in the
extension's global storage (`repo-heatmap-cache.json`, keyed by session file with its mtime and
size so an unchanged session is not re-read) and are never uploaded: the sharing server receives
numeric rollups, not paths.

## How it is built

- `src/fileActivity.ts` — pure extractor: one session log in, a list of `{path, kind, ts}` out
  (plus `chars` for a read whose result size the log records).
  Failed tool calls are dropped; a re-logged streaming fragment counts once.
- `src/repoHeatmapCollector.ts` — Node-side gathering shared by every host: reads session files,
  resolves the repository (remote URL) and the workspace root, caches per file.
- `src/repoHeatmapViewBuilder.ts` — pure: anchors paths to the repository, folds sessions into
  per-repository / per-file / per-day counters (`buildRepoHeatmapViewData`) and filters by period
  and kind, grouped by folder (`summarizeRepoHeatmap`). `findRepoHeatmapHotspots` picks the
  hotspots; the thresholds are constants at the bottom of the file.
- `src/codeNavTools.ts` and `src/codeNavTools.json` — the catalog of code-graph tools and the
  detection of the ones set up for the user or in a workspace folder.
- `src/treemapLayout.ts` — pure: builds the folder tree (single-child folder chains collapse to
  `a/b`) and lays it out with the squarified treemap algorithm.
- `vscode-extension/src/repoHeatmapPanel.ts` and `src/webview/repoHeatmap/` — the VS Code panel and
  its webview.

### Which repository a file belongs to

1. The session's repository remote, when one resolves.
2. Otherwise the repository name in an agent worktree path (`.claude/worktrees/<repo>/<name>`,
   `.copilot/copilot-worktrees/<repo>/<name>`, `<repo>.worktrees/<name>`), merged into the one
   remote-keyed repository with that name when it is unambiguous.
3. Otherwise the workspace folder.

A file inside a different agent worktree than the session's own folder is attributed to that
worktree's repository. Files outside every workspace (home-directory notes, other tools' files)
are counted but not shown.

## Known limits

- **Deletes are best effort.** No agent logs a structured "delete file" call, so only plain
  `rm`/`del`/`Remove-Item` of named files are found. Recursive deletes (directories), globs and
  variables are skipped, and a deleted file is flagged as inferred in its tooltip.
- **Which editors:** Claude Code (CLI, Desktop and the VS Code extension), Copilot CLI and VS Code
  Copilot Chat. Sessions stored in a database (for example OpenCode) and other editors are not
  scanned yet.
- Periods count back from the time of the last scan; use Refresh to move "Today" forward.
- Per repository the 3000 most-touched files are kept.
- The first scan reads every session log and can take a minute on a large history; later opens only
  re-read changed sessions.
