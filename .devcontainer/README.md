# Dev container

Two configurations live here:

- `devcontainer.json` is the **universal** one, used by GitHub Codespaces and any
  Linux/macOS host. It has no host-specific mounts or host-side scripts (a Windows-only
  `initializeCommand` or `%APPDATA%` mount fails Codespaces creation before any log
  is written) and installs only the Git feature to keep container creation fast.
- `local/devcontainer.json` is **optional, for Windows developers**. It adds the PowerShell
  feature, read-only mounts of the VS Code user-data folders (so the extension can read
  real session data) and node_modules volumes. `init-mounts.ps1` runs on the host first to
  make sure those folders exist. Pick "AI Engineering Fluency Extension (local Windows)"
  when reopening in a container.

Both install dependencies with pnpm (`--frozen-lockfile`) in `vscode-extension/` and `cli/`.

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
