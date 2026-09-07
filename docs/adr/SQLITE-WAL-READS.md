# Reading SQLite databases another process may hold open (WAL mode)

## Context

The extension reads several local SQLite databases it does not own:

- `~/.copilot/data.db` — the Copilot app's own database (session hierarchy,
  context-window state). Read via `CopilotAppDataAccess`
  (`vscode-extension/src/copilotAppData.ts`).
- OpenCode's `opencode.db`. Read via `OpenCodeDataAccess` (`src/opencode.ts`).

Both are read with [`sql.js`](https://github.com/sql-js/sql.js), a WASM build
of SQLite that only understands a single in-memory buffer — it has no code
path for SQLite's write-ahead log. When the owning process (the Copilot app,
or the OpenCode CLI) keeps its database open in **WAL mode**, its most recent
writes are appended to a `<dbfile>-wal` sidecar file and are only merged back
into the main `.db` file when SQLite performs a **checkpoint** — typically
when every connection to the database closes, or the WAL grows past a size
threshold.

If we read just the `.db` file's bytes while a WAL exists, `sql.js` returns a
**silently stale snapshot**: no error, just missing the writer's most recent
rows/columns. This exact gap caused the "Context Window & Long-Context
Pricing" usage section to show "No data" for an actively-running Copilot CLI
session — its `context_current_tokens` update was sitting in `data.db-wal`
and only became visible after the session was restarted (closing the writer's
connection triggered a checkpoint).

You can confirm a database is in this state by checking for a non-empty
`<dbfile>-wal` next to it:

```powershell
Get-ChildItem "$env:USERPROFILE\.copilot\data.db*"
```

## Decision

Before loading any of these databases with `sql.js`, merge pending WAL frames
first using `src/utils/sqliteWal.ts`:

- `readDbBufferWithWal(dbPath)` — the one-call helper most callers should use.
  Copies `<dbfile>`, `<dbfile>-wal`, and `<dbfile>-shm` (if present) to a temp
  file, opens the copy with Node's built-in `node:sqlite` (Node.js 22+), runs
  `PRAGMA wal_checkpoint(TRUNCATE)` to fold the WAL into the temp file, and
  returns that buffer. Falls back to a bare `fs.readFileSync(dbPath)` when
  there is no WAL, the WAL is empty, or `node:sqlite` is unavailable.
- `getWalMtimeMs(dbPath)` — for cache-invalidation checks that need to notice
  "the WAL changed" even when the main `.db` file's mtime/size did not (used
  by `OpenCodeDataAccess`'s db cache).

This avoids adding a native SQLite dependency to the extension's runtime
while still getting a fully up-to-date, checkpoint-merged snapshot.

## Consequences

- Any new code that opens a local SQLite database another process may still
  be writing to (Copilot app, OpenCode, or a future integration) should read
  it through `readDbBufferWithWal()` rather than `fs.readFileSync()` directly.
- The merge does a real file copy + `node:sqlite` open per read, so it is not
  free — callers that poll frequently should keep doing so through a
  stat-based cache (mtime/size **and** WAL mtime, see `getWalMtimeMs`) rather
  than re-merging on every call.
- If `node:sqlite` is ever removed/unavailable in the extension's Node
  runtime, the helper degrades gracefully to a direct file read (the original,
  potentially-stale behavior) rather than throwing.
