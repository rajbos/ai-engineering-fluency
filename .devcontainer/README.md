# Dev container

`devcontainer.json` defines the development container for this repository
(Node/TypeScript image with Git and PowerShell). Before the container starts,
`init-mounts.ps1` runs on the host to make sure the VS Code user-data folders it
bind-mounts read-only exist, so the extension can read real session data inside
the container.

## DevContainer Terminal Behavior

Inside the devcontainer (`.devcontainer/devcontainer.json`), terminal output capture can be unreliable — commands run but their output comes back empty or truncated (a remote filesystem limitation). Don't retry-loop, poll, redirect to temp files, or delegate to a subagent hoping for cleaner output; none of that converges. Instead:

1. **Use the package scripts (pnpm)** (from `vscode-extension/`): `pnpm run compile`, `pnpm run validate` (type-check + lint + build), `pnpm run compile-tests`, `pnpm run test:node`, `pnpm run test:coverage`, and `pnpm run test:src` (only the shared `src/test` suite; needs no VS Code shim).
2. **Check compile errors with the project's type-check/validate script** or your tool's diagnostics, rather than running `tsc` by hand. (Copilot users: the `get_errors` tool.)
3. **Run tests one file at a time**, e.g.
   ```bash
   cd vscode-extension
   node --require ./out/vscode-extension/test/unit/vscode-shim-register.js --test out/vscode-extension/test/unit/l10n.test.js
   ```
   Tests for shared `src/` modules live in `src/test/` and run without the shim:
   ```bash
   node --test out/src/test/sessionParser.test.js
   ```
4. **Accept a single run.** If a command returns no output, don't re-run it.
5. If you must capture output to a file, write it inside the workspace, not `/tmp/`, so your file-read tool can reach it. (Copilot users: `run_in_terminal` / `read_file`.)
