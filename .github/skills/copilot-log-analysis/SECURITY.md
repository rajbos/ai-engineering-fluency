# Security model: copilot-log-analysis

Lightweight model derived from reading `session-file-discovery.js`, `get-session-files.js`,
`diagnose-session-files.js` and `analyze-session-schema.ps1`. Update it in the same PR as
any change that adds or alters a trigger surface (see "Skill security classification" in
the repository `AGENTS.md`).

This skill is classified as modelled (not exempt) because of `analyze-session-schema.ps1`:
by default it copies values out of the user's private AI session logs into a file inside
the repository's tracked `docs/` tree (trigger 6).

## What the scripts do and talk to

- `session-file-discovery.js` (library), `get-session-files.js` and
  `diagnose-session-files.js` locate session files of VS Code variants, Copilot CLI
  and OpenCode under the user's home/AppData and print counts,
  paths, sizes and modification times. They only call `readdirSync`/`statSync`; they never
  open a session file's content.
- `analyze-session-schema.ps1` opens up to `-MaxFiles` (default 10) session files per
  location, parses them as JSON/JSONL, and builds a field-path schema with types, counts
  and example values.
- No script makes network requests.

## Credentials used and where they come from

None. Environment variables read: `APPDATA`, `USERPROFILE`, `XDG_*`, `CODESPACES`,
`VSCODE_*` (to find paths and report the environment).

## Untrusted inputs parsed

- The user's own session logs (`ConvertFrom-Json` on whole files and lines in the
  `.ps1`). They hold prompts, responses and file paths and can contain arbitrary
  attacker-supplied text if a conversation pulled in web or repository content. The
  `.ps1` only walks the object tree and records field names, types and example values;
  it does not execute or interpret content.
- `docs\logFilesSchema\session-file-schema.json` (compared against, repo content).

## What it writes and where

- `analyze-session-schema.ps1` writes `$OutputFile`, default
  `docs\logFilesSchema\session-file-schema-analysis.json` (relative to the current
  directory), creating parent directories. This is a tracked repository file.
- For every field path it stores up to 3 distinct example values: strings truncated to
  100 characters, other scalars verbatim (lines 98-114). Free-text fields such as chat
  input and titles are therefore copied into the output.
- The other scripts write nothing.
- Stdout of the Node scripts contains the home directory path and session file paths
  (workspace hashes, session ids); with `--json` the same plus sizes and timestamps.

## External programs run

None.

## Mitigations in the code

- The Node scripts never read session content, so their output is limited to paths and
  file metadata.
- `analyze-session-schema.ps1` limits the sample (`-MaxFiles`, 3 examples per field, 100
  characters per string, first 3 array items).
- A file or line that fails to parse is skipped (the per-file warning prints the PowerShell
  error text, which is not guaranteed to omit file content).

## Known gaps

Recorded, not fixed here.

- **Private text can be committed.** The default output path is a tracked file, and the
  script has no redaction or opt-in for example values. The checked-in
  `docs/logFilesSchema/session-file-schema-analysis.json` already contains example values
  for free-text fields (for instance `inputText` and `customTitle`). A contributor
  (or agent) who runs the script and commits the result publishes parts of their own
  prompts. Run it with `-OutputFile` pointing outside the repository, or strip the
  `examples` arrays before committing.
- No warning is printed that example values are being persisted.
- `diagnose-session-files.js` prints absolute paths including the user name and workspace
  identifiers; pasting that output into a public issue discloses them. `get-session-files.js`
  is written to do the same, but its output function is declared and never invoked (the
  file ends with `});`), so today it prints nothing.
- `$existingSchemaJson -notlike "*$field*"` builds a wildcard pattern from log-derived
  field names (a logic weakness, not a code-execution path).
