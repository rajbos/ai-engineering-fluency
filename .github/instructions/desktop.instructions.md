---
applyTo: "desktop/**"
---

# Desktop app — Electron tray app

Read [desktop/README.md](../../desktop/README.md) before changing anything here. It
explains how the app reuses the VS Code extension's built webview bundles and the
CLI/extension stats logic instead of reimplementing the UI, and how it is built,
packaged and updated.

- Do not reimplement session parsing, stats or webview payloads in `desktop/`: call the
  shared builders in the repo-root `src/` (see the repo-root `AGENTS.md`).
- When the VS Code extension gains a view, decide whether the desktop app ships it with
  the `sync-host-views` skill (`desktop/esbuild.js` `WEBVIEW_BUNDLES` and the
  `desktop/src/main.ts` `PANEL_MENU`).
- Validation steps are in [docs/VALIDATION.md](../../docs/VALIDATION.md#desktop-app).
