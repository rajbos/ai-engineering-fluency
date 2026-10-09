# Security model: validate-session-schemas

Lightweight model derived from reading `validate-session-schemas.js` and
`schema-baselines.json`. Update it in the same PR as any change that adds or alters a
trigger surface (see "Skill security classification" in the repository `AGENTS.md`).

This skill is classified as modelled (not exempt) because it temporarily copies OpenCode
conversation data into the OS temp directory, outside stdout and outside any declared output
location (trigger 4), and because its opt-in example mode can print session content
(trigger 6).

## What the scripts do and talk to

- Finds recent session files for Copilot Chat (VS Code variants), Copilot CLI
  (`~/.copilot/session-state`), JetBrains (`~/.copilot/jb`), Claude Code
  (`~/.claude/projects`), Gemini CLI (`~/.gemini/tmp`), Antigravity
  (`~/.gemini/antigravity/brain`) and OpenCode (`~/.local/share/opencode`).
- Reads up to `--max` files per platform (default 5) modified within `--days` (default 30),
  at most 5000 JSONL lines per file, walks each JSON value recording field paths and types,
  and checks the small "contract" of fields our parsers need against `schema-baselines.json`.
- Prints a per-platform report (status, record types, contract results, up to 40 new
  field paths). `--json` prints the same as JSON.
- No network access.

## Credentials used and where they come from

None. Environment variables read: `APPDATA`, `XDG_CONFIG_HOME`, `XDG_DATA_HOME` (paths only).

## Untrusted inputs parsed

- The user's session logs and the OpenCode SQLite database (`opencode.db`, opened
  read-only through `node:sqlite`). They contain prompts, responses and paths and can contain text from any
  web page or repository a conversation touched. Content is `JSON.parse`d and walked; it is
  never executed.
- Object keys from those logs become the reported "field paths". Keys are therefore
  log-derived text too; identifier-shaped keys are collapsed to `{key}` (see Mitigations).
- OpenCode session ids from the database are joined into temp file names only after
  matching `^[A-Za-z0-9_-]{1,128}$`; other ids are skipped.

## What it writes and where

- `--update-baseline` rewrites `schema-baselines.json` in this skill directory: it merges
  the observed field paths into `knownFields` and sets `lastUpdated`. Contracts are not
  touched. Only field paths are persisted, no values.
- **OpenCode export to temp.** When `opencode.db` has sessions inside the `--days` window,
  `exportOpenCodeDbSessions` creates a `mkdtemp` directory `oc-dbses-*` under the OS temp
  dir and writes one JSONL file per selected session (at most `--max`) containing the raw
  `message.data` of its messages. Sessions outside the window are counted, not written.
  `run` removes the directory in a `finally` once analysis ends, including on errors. The
  report refers to these sessions as `<dbPath> [session <id>]`, not by temp path.
- Stdout: the report. Example values appear only with `--include-examples` (strings
  redacted, then cut to 40 characters; numbers and booleans verbatim; 2 per field).

## External programs run

None. SQLite is accessed in-process.

## Mitigations in the code

- Values are not emitted by default (header comment and `--include-examples` gate); only
  paths, types and counts.
- Bounded work: `--max` files per platform, `--days` recency window, 5000 lines per file,
  5 array elements per array (`ARRAY_SAMPLE`).
- The temp directory comes from `mkdtemp`, so another local user cannot pre-create or
  symlink a predictable path. Files inside it are written with `flag: 'wx'` (fail if they
  exist), named from validated session ids only, and the whole directory is removed in
  `run`'s `finally`. Only sessions inside `--days`/`--max` are exported.
- `opencode.db` is opened with `readOnly: true`; only `SELECT` statements are run.
- `normalizeKey` collapses object keys that do not look like field names (path
  separators, dots, colons, whitespace or other punctuation, UUID/hex/long-id shapes,
  runs of 4+ digits, more than 64 characters) to `{key}` before they become field paths,
  so dictionaries keyed by file path, URL or session id do not put those identifiers into
  the report or `schema-baselines.json`.
- `--include-examples` values pass through `redactExample`: GitHub/OpenAI/Slack/AWS
  token shapes, JWTs, `Bearer`/`Basic` credentials and long base64/hex runs become
  `[redacted]`, e-mail addresses `[email]`, and the home directory `~`.
- Tests in `validate-session-schemas.test.js` cover the window selection, id validation,
  read-only open, temp cleanup (end to end), key collapsing and redaction, using
  synthetic fixtures only.
- The baseline file path is fixed next to the script; `--update-baseline` never edits
  contracts.

## Known gaps

- Keys shaped like plain identifiers are kept, so dictionaries keyed by tool name or model
  id (for example `copilot_readFile`, `gpt-6-luna`) still appear in field paths. These are
  product identifiers, not user data, but they do reach the report and baseline.
- The temp export still exists on disk while the run is in progress, and a hard kill
  (`SIGKILL`, power loss) skips the `finally`.
- `--include-examples` redaction is pattern-based: prompt text, file paths outside the home
  directory and secrets in unrecognised formats still print (truncated to 40 characters).
  The flag remains opt-in and documented.
