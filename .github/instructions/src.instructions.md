---
applyTo: "src/**"
---

# Shared `src/` — editor-neutral core

Read [src/README.md](../../src/README.md) before changing anything here. It documents
the boundary rules and every shared JSON data file.

`src/` is consumed by the VS Code extension, the CLI and the desktop app, so it must not
depend on any of them:

- **No `vscode` imports**, and no imports from `vscode-extension/`, `cli/` or `desktop/`.
  The root `eslint.config.mjs` enforces both with `no-restricted-imports` (an error under
  `pnpm run lint` in `vscode-extension/`).
- Editor-host services (extension lookup, settings, app name, ...) are injected through
  `deps` objects such as `SessionDiscoveryDeps` and `WindsurfHost`; the VS Code
  implementations live in `vscode-extension/src/srcHostAdapters.ts`.
- Code the CLI or desktop app needs from the extension, with no VS Code dependency,
  belongs in `src/`. Webview payload builders live here too, one per payload, called by
  every host (see "CLI Must Reuse Shared Functions" in
  [cli.instructions.md](cli.instructions.md)).
- Unit tests for shared modules live in `src/test/` and run without the VS Code shim:
  `pnpm run test:src` from `vscode-extension/`. A test that needs the extension stays in
  `vscode-extension/test/unit/`.
