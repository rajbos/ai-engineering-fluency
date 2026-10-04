# Security model: azure-storage-loader

Lightweight model derived from reading `load-table-data.js` and `example-usage.js`.
Update it in the same PR as any change that adds or alters a trigger surface (see
"Skill security classification" in the repository `AGENTS.md`).

## What the scripts do and talk to

- `load-table-data.js` queries one Azure Table Storage table (default `usageAggDaily`),
  one partition per day, over HTTPS at `https://<storageAccount>.table.core.windows.net`
  (`createTableClient`, line 248). `@azure/identity` additionally talks to Entra ID token
  endpoints when the default credential chain is used.
- It prints the normalized entities (JSON or CSV) to stdout and progress to stderr.
- `example-usage.js` is a demo wrapper that runs the loader and summarizes the result.

## Credentials used and where they come from

- Default: `DefaultAzureCredential` (Entra ID: whatever the `@azure/identity` chain finds,
  such as environment variables, `az login` or a managed identity).
- Optional: an account key passed on the command line as `--sharedKey <key>`
  (`AzureNamedKeyCredential`, lines 106-113 and 251-253). The script reads no environment
  variable for it. The CI step in `.github/workflows/copilot-setup-steps.yml` copies
  `secrets.COPILOT_STORAGE_KEY` into the argument list.
- The script itself never prints the key; stderr only says which auth mode is used (the
  error handler does print `error.message` and the stack, lines 515-519).

## Untrusted inputs parsed

- Table entities returned by the storage account. Rows are written by every team member's
  client, so string fields (`model`, `workspaceName`, `machineName`, `userId`, ...) are
  attacker-influenceable text by anyone allowed to upload. Numbers are type-checked
  (lines 322-324); strings are copied through unchanged (lines 307-326).
- Command-line arguments (`--storageAccount`, `--tableName`, `--datasetId`, `--model`,
  `--workspaceId`, `--userId`), which end up in the endpoint host and an OData filter.

## What it writes and where

- Nothing on disk. `--output` is parsed (lines 114-121) but not used; the result goes to
  stdout and to `module.exports.tresult` (lines 443-446, 499-512).
- `example-usage.js` creates a `mkdtemp` directory under the OS temp dir and removes it.
- The stdout payload contains `userId`, `machineName`, `workspaceName` and
  `workspaceId` per row. It is team usage data, so it lands wherever stdout goes
  (a chat transcript, a CI log).

## External programs run

- `load-table-data.js`: none.
- `example-usage.js`: `node load-table-data.js ...` through `execFileSync` with an argument
  array and no shell (line 65).

## Mitigations in the code

- OData filter values are rejected if they contain `and`/`or`/`not` or newlines and have
  single quotes doubled (lines 276-298); partition keys go through `sanitizeTableKey`
  (lines 224-244).
- Dates must match `YYYY-MM-DD`; `--format` is restricted to `json`/`csv`.
- `example-usage.js` restricts the storage account to `^[a-z0-9]{3,24}$` and dates to
  ISO format before they reach a subprocess (lines 40-49), and uses `mkdtemp`.
- `copilot-setup-steps.yml` installs the dependencies with `npm ci --ignore-scripts --production`.

## Known gaps

Recorded, not fixed here.

- `--storageAccount` is not validated in `load-table-data.js`; it is interpolated into the
  endpoint host (line 248). A value such as `evil.example/` changes the host, and the
  Entra token or shared-key signature is then sent there. Only `example-usage.js` applies
  the account-name pattern.
- `--sharedKey` travels on the command line, so it is visible in process listings, shell
  history and agent transcripts. The CI step builds the same argument list.
- stdout carries per-row identifiers (see "What it writes"), and the CI step
  (`copilot-setup-steps.yml`, the `node .../load-table-data.js "${ARGS[@]}"` line) does not
  redirect it, so the full dataset goes to the Actions log. Because `--output` is ignored,
  the `usage-data/usage-agg-daily.json` file that step expects is never created.
- Entity strings are emitted verbatim, so a hostile uploader can place instruction-like
  text in `workspaceName` or `machineName` that then reaches an agent's context.
- CSV output (lines 371-385) quotes commas and quotes but does not neutralize cells
  starting with `=`, `+`, `-` or `@`.
