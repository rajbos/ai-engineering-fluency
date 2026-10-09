# Security model: azure-storage-loader

Lightweight model derived from reading `load-table-data.js` and `example-usage.js`.
Update it in the same PR as any change that adds or alters a trigger surface (see
"Skill security classification" in the repository `AGENTS.md`).

## What the scripts do and talk to

- `load-table-data.js` queries one Azure Table Storage table (default `usageAggDaily`),
  one partition per day, over HTTPS at `https://<storageAccount>.table.core.windows.net`
  (`createTableClient`, line 203). `@azure/identity` additionally talks to Entra ID token
  endpoints when the default credential chain is used.
- It writes the normalized entities (JSON or CSV) to the `--output` file when given,
  otherwise to stdout. Progress, counts and totals go to stderr.
- `example-usage.js` is a demo wrapper that runs the loader and summarizes the result.

## Credentials used and where they come from

- Default: `DefaultAzureCredential` (Entra ID: whatever the `@azure/identity` chain finds,
  such as environment variables, `az login` or a managed identity).
- Optional: an account key read from the `AZURE_STORAGE_KEY` environment variable
  (`main`, line 443) and passed to `AzureNamedKeyCredential`. The old `--sharedKey`
  argument is rejected with an error that does not echo the value (line 70). The CI step
  in `.github/workflows/copilot-setup-steps.yml` maps `secrets.COPILOT_STORAGE_KEY` to that
  environment variable and no longer puts it on the command line.
- The script itself never prints the key; stderr only says which auth mode is used (the
  error handler does print `error.message` and the stack, lines 512-516).

## Untrusted inputs parsed

- Table entities returned by the storage account. Rows are written by every team member's
  client, so string fields (`model`, `workspaceName`, `machineName`, `userId`, ...) are
  attacker-influenceable text by anyone allowed to upload. They pass through
  `normalizeEntity` / `sanitizeEntityString` (lines 223-262) before output.
- Command-line arguments (`--storageAccount`, `--tableName`, `--datasetId`, `--model`,
  `--workspaceId`, `--userId`, `--output`), which end up in the endpoint host, an OData
  filter and the output file path.

## What it writes and where

- With `--output <path>`: that file only (parent directories created, new files created
  with mode `0600`; `writeOutputFile`, lines 376-381). Nothing per-row goes to stdout.
- Without `--output`: the result goes to stdout, for interactive use.
- In both cases the result is also kept in `module.exports.tresult`.
- The payload contains `userId`, `machineName`, `workspaceName` and `workspaceId` per row.
  In CI it lands in `./usage-data/usage-agg-daily.json` (git-ignored), not the Actions log.
- `example-usage.js` creates a `mkdtemp` directory under the OS temp dir and removes it.

## External programs run

- `load-table-data.js`: none.
- `example-usage.js`: `node load-table-data.js ...` through `execFileSync` with an argument
  array and no shell (line 65).

## Mitigations in the code

- `--storageAccount` must match `^[a-z0-9]{3,24}$` (line 26), checked in `main` and again
  in `createTableClient` before the endpoint host is built, so the credential cannot be
  sent to another host.
- The shared key comes only from the environment; `--sharedKey` fails closed.
- The CI step passes `--output`, so the dataset is written to a file instead of the
  Actions log, and the file the agent expects now actually exists.
- Entity strings have control, bidi, zero-width, Unicode tag and variation-selector
  characters removed, whitespace collapsed and length capped at 256 characters
  (`sanitizeEntityString`). `SKILL.md` tells agents to treat row values as data.
- CSV cells that are strings starting with `=`, `+`, `-`, `@`, tab or CR are prefixed with
  `'`; cells with commas, quotes or line breaks are quoted (`formatCsvCell`, lines 329-341).
- OData filter values are rejected if they contain `and`/`or`/`not` or newlines and have
  single quotes doubled; partition keys go through `sanitizeTableKey`.
- Dates must match `YYYY-MM-DD`; `--format` is restricted to `json`/`csv`.
- `example-usage.js` applies the same account-name pattern and ISO dates before they reach
  a subprocess (lines 40-49), and uses `mkdtemp`.
- `copilot-setup-steps.yml` installs the dependencies with `npm ci --ignore-scripts --production`.
- `load-table-data.test.js` covers the validation and output hardening above and runs in
  `validate-skills.yml`.

## Known gaps

- Sanitizing removes hidden characters but keeps visible text, so an uploader can still
  put instruction-like wording in `workspaceName` or `machineName`. Consumers have to treat
  the values as data.
- Without `--output`, the dataset still goes to stdout, so an interactive run inside an
  agent session puts it in that transcript.
- `--output` is not restricted to a directory; it overwrites any file the user can write,
  and the `0600` mode applies only when the file is newly created.
- An environment variable is less exposed than argv but still readable by the same user
  (for example `/proc/<pid>/environ`) and inherited by child processes.
- Per-partition query errors print the SDK's `error.message`, and fatal errors print the
  stack, to stderr.
