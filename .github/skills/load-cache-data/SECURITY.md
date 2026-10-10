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
  searched paths) and exits 1. An invalid `--last` value exits 2. If the first cache file it
  finds is malformed it prints `{ cacheFound: true, malformed: true, error }` (naming only the
  file's basename) and exits 3.
- No network access.

## Credentials used and where they come from

None. It reads `APPDATA` and `XDG_CONFIG_HOME` only to build candidate paths.

## Untrusted inputs parsed

- The first regular file found at `<VS Code user data>/User/globalStorage/<extension id>/` named
  `cache_prod.snapshot.json`, `cache_dev.snapshot.json` (the extension's shared cache snapshot,
  whose `entries` are unwrapped from its envelope by `unwrapCacheEntries`) or a legacy
  `session-cache.json` export, for the variants Code, Code - Insiders, Code - Exploration, VSCodium and Cursor, and the
  extension ids `robbos.ai-engineering-fluency` and `robbos.copilot-token-tracker`
  (`getCacheFilePaths`, line 139). These are in the user's own profile directory.
- The OS temp directory and the current working directory are no longer candidates, so a
  file planted there is not read.
- The content is `JSON.parse`d (`parseCacheEntries`, line 277) and filtered before printing;
  nothing in it is executed. A snapshot must be an envelope with a numeric `schemaVersion` and
  an `entries` object, and a legacy export must be an object.

## What it writes and where

Nothing on disk. Stdout is one JSON line.

- **Default:** `requestedCount`, `totalCacheEntries` and `entries`, keyed `session-1`,
  `session-2`, ... instead of session file paths. Each entry keeps only allowlisted fields
  (`SAFE_CACHE_ENTRY_FIELDS`, line 186): token and interaction counts, per-model usage,
  timestamps, task categories, daily rollups and `usageAnalysis`. Inside `usageAnalysis`,
  `firstUserPrompt`, `contextReferences.byPath`, `editScope.languageUsage` and each correction
  moment's `snippet` and `file` are removed (`sanitizeCacheEntry`, line 198). `title`, `repository`,
  `workspaceFolderPath`, top-level `languageUsage` (keyed by file extension, or by the whole
  basename for extensionless files), any unrecognized top-level field and the cache file path
  are omitted.
- **`--include-sensitive`:** the cache file path (`cacheFile`), session file paths as entry
  keys, and full entries including `title`, `workspaceFolderPath` and `repository`. URL
  userinfo (`user:token@`) is stripped from `repository` even in this mode
  (`stripUrlUserinfo`, line 245).

## External programs run

None.

## Mitigations in the code

- Read-only and offline; no code path writes a file or opens a socket.
- Session-identifying fields are omitted by default via a top-level allowlist; opting in
  requires `--include-sensitive`.
- `--last` must be all digits and at least 1, otherwise the script exits 2; it is capped at
  100 entries (`parseLastCount`, line 34).
- Only the user's VS Code globalStorage directories are searched. Each candidate is opened
  once and checked with `fstatSync(fd).isFile()` and read through that same descriptor
  (`readCacheFile`), so it cannot be swapped between check and read. On POSIX the open uses
  `O_NOFOLLOW`, so a symlink at a candidate path is refused.
- The first candidate file that exists decides the result. If it is malformed (invalid JSON,
  or a snapshot without a usable envelope) the script stops with exit 3. It does not fall back
  to an older legacy export, and it does not print an envelope's metadata fields as cache
  entries.
- `load-cache-data.test.js` pins these rules and runs in CI (`validate-skills.yml`, which
  also triggers on `src/types.ts` changes). It parses `SessionFileCache` and
  `SessionUsageAnalysis` from `src/types.ts` and fails when a field has not been classified
  as printed, filtered or omitted. It also checks that a fully populated entry prints exactly
  the printed fields and none of the omitted sentinels. Separate tests cover the cache-source
  rules: which files are read and in what order, envelope unwrapping, temp/cwd files ignored,
  and symlinks refused (POSIX only).

## Known gaps

- The classification test reads field names, not their contents. A field that is already
  classified as printed and later starts carrying free text or paths (for example a new
  sub-field inside `toolCalls`) is not caught. Map keys such as MCP server, tool and skill
  names are printed as-is.
- With `--include-sensitive`, session titles (which can echo a prompt), first user prompts,
  correction snippets and local paths are printed unfiltered by design.
- On Windows `O_NOFOLLOW` does not exist, so a symlink at a candidate path is followed to its
  target (creating one there needs write access to the user's profile directory).
