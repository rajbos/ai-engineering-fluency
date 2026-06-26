# AI Engineering Fluency — Windows Desktop App

A lightweight Electron tray app that surfaces the same dashboards as the VS Code
extension (Details, Environmental Impact, Token Usage Chart, Usage Analysis,
Fluency Score, Scoring Guide, Diagnostics) outside of VS Code.

## How it works

The desktop app does **not** reimplement the UI. It reuses the existing
artifacts from the other packages in this repo:

- **Webview bundles** — the IIFE panel bundles and `toolkit.js` are copied from
  `../vscode-extension/dist/webview/` at build time (see
  [`esbuild.js`](esbuild.js) → `copyStaticAssets`).
- **Stats logic** — `src/main.ts` imports session discovery and stat
  calculations directly from `../cli/src/helpers` and
  `../vscode-extension/src/`.

`src/preload.ts` exposes an `acquireVsCodeApi()` shim so the unmodified webview
bundles run without changes — `postMessage` is routed to the main process over
IPC. Panels are served from an in-process `app://` protocol handler rather than
from disk.

## Build

```sh
npm install
npm run build
```

The desktop build depends on the extension's webview bundles
(`../vscode-extension/dist/webview/*.js` and `dist/toolkit/toolkit.js`). If those
are missing, `esbuild.js` builds the extension automatically before continuing,
so a fresh checkout works with a single `npm run build`.

That auto-build requires the extension's dependencies to be installed. If it
cannot complete it fails with a clear error rather than silently producing an app
with blank panels — in that case build the extension manually first:

```sh
cd ../vscode-extension && npm install && npm run compile
```

## Scripts

| Script                  | Purpose                                                        |
| ----------------------- | -------------------------------------------------------------- |
| `npm run build`         | Development bundle (sourcemaps, no minify) → `dist/`.          |
| `npm run build:production` | Production bundle (minified).                               |
| `npm run dev`           | Watch mode: rebuild on change and relaunch Electron.           |
| `npm start`             | Build then launch Electron once.                               |
| `npm run pack`          | Production build + `electron-builder --dir` (unpacked app).    |
| `npm run dist`          | Production build + installers (NSIS + APPX) → `release/`.      |
| `npm run check-types`   | `tsc --noEmit`. See the caveat below.                          |

In development the app writes its Electron profile to `.dev-profile/` (kept out
of `%APPDATA%` so hot-reload restarts don't fight over a shared, locked cache).
`.dev-profile/`, the Electron logs, and `release/` are all git-ignored.

## Packaging

Installer config lives under `build` in [`package.json`](package.json).
Installers are written to `release/` (separate from the esbuild `dist/` output so
they are never re-packaged into the next build). Targets: NSIS and APPX (x64).

## Icons

`assets/icon.png` (512×512) is the installer/window icon — electron-builder
derives the multi-resolution `.ico` from it. `assets/tray-icon.png` (256×256) is
the system tray icon, copied into `dist/` at build time so it ships with the
packaged app. Both are cropped from the shared 645×645 brand logo
(`../visualstudio-extension/src/AIEngineeringFluency/assets/logo.png`) and can be
regenerated with:

```sh
npx electron scripts/generate-icon.js
```

## Known limitations

- **`check-types`** type-checks the desktop sources together with the imported
  `cli/` and `vscode-extension/` source trees, which carry their own
  `tsconfig`/`lib`/dependency setups (DOM globals, `chalk`, `sql.js` types). As a
  result `tsc --noEmit` reports errors that originate in those packages, not in
  the desktop app. The authoritative build gate is `npm run build` (esbuild,
  which follows only the real import graph). A fully green `check-types` would
  require splitting these into TypeScript project references.
