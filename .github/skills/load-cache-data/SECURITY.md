# Security model: load-cache-data

Lightweight model derived from reading `load-cache-data.js` and the cache entry type
`SessionFileCache` in `src/types.ts`. Update it in the same PR as any change that adds or
alters a trigger surface (see "Skill security classification" in the repository `AGENTS.md`).

This skill is classified as modelled (not exempt) because its purpose is to print cache
entries derived from the user's AI sessions into a chat transcript (trigger 6). The default
output is limited to counts and metadata; session-derived free text and local paths are only
printed behind the explicit `--include-sensitive` opt-in.

## What the scripts do and talk to

- `load-cache-data.js` looks for the extension's session cache export on disk, parses it
  and prints the most recent `--last N` entries (default 10, at most 100) as one JSON
  document to stdout. If no file is found it prints `{ cacheFound: false, error }` (no
  searched paths) and exits 1. An invalid `--last` value exits 2.
- No network access.

## Credentials used and where they come from

None. It reads `APPDATA` and `XDG_CONFIG_HOME` only to build candidate paths.

## Untrusted inputs parsed

- The first regular file found at `<VS Code user data>/User/globalStorage/<extension id>/session-cache.json`,
  for the variants Code, Code - Insiders, Code - Exploration, VSCodium and Cursor, and the
  extension ids `robbos.ai-engineering-fluency` and `robbos.copilot-token-tracker`
  (`getCacheFilePaths`, line 140). These are in the user's own profile directory.
- The OS temp directory and the current working directory are no longer candidates, so a
  file planted there is not read.
- The content is `JSON.parse`d (line 261) and filtered before printing; nothing in it is
  executed.

## What it writes and where

Nothing on disk. Stdout is one JSON line.

- **Default:** `requestedCount`, `totalCacheEntries` and `entries`, keyed `session-1`,
  `session-2`, ... instead of session file paths. Each entry keeps only allowlisted fields
  (`SAFE_CACHE_ENTRY_FIELDS`, line 186): token and interaction counts, per-model usage,
  timestamps, task categories, daily rollups and `usageAnalysis`. Inside `usageAnalysis`,
  `firstUserPrompt`, `contextReferences.byPath` and each correction moment's `snippet` and
  `file` are removed (`sanitizeCacheEntry`, line 196). `title`, `repository`,
  `workspaceFolderPath`, any unrecognized top-level field and the cache file path are
  omitted.
- **`--include-sensitive`:** the cache file path (`cacheFile`), session file paths as entry
  keys, and full entries including `title`, `workspaceFolderPath` and `repository`. URL
  userinfo (`user:token@`) is stripped from `repository` even in this mode
  (`stripUrlUserinfo`, line 236).

## External programs run

None.

## Mitigations in the code

- Read-only and offline; no code path writes a file or opens a socket.
- Session-identifying fields are omitted by default via a top-level allowlist; opting in
  requires `--include-sensitive`.
- `--last` must be all digits and at least 1, otherwise the script exits 2; it is capped at
  100 entries (`parseLastCount`, line 34).
- Only the user's VS Code globalStorage directories are searched. `fs.lstatSync(...).isFile()`
  (line 259) means a symlink at a candidate path is not followed.
- A file that fails to parse is skipped and the search moves on.

## Known gaps

- The filter inside `usageAnalysis` is a denylist of known text/path fields, not an
  allowlist. A free-text or path field added to `SessionUsageAnalysis` later would be printed
  by default until it is added here. Map keys such as MCP server, tool and skill names are
  printed as-is.
- With `--include-sensitive`, session titles (which can echo a prompt), first user prompts,
  correction snippets and local paths are printed unfiltered by design.
- `load-cache-data.test.js` is not run by any CI workflow; it runs only when invoked
  manually with `node --test`.
