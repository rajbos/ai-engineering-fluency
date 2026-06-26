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

## Type checking

`npm run check-types` (`tsc --noEmit`) is a real, passing gate on the desktop
app's own TypeScript. `tsconfig.json` lists only `src/**/*.ts` as inputs and lets
`tsc` follow the actual import graph into `../cli` and `../vscode-extension`, so
those sibling sources are checked exactly as the desktop app consumes them — not
by globbing whole sibling trees (which previously dragged in unrelated CLI
command/test files with their own dependencies and pre-existing errors). `DOM` is
added to `lib` because some transitively-imported webview helpers (e.g.
`shared/dataLoader`) reference `window`.

Run it from `desktop/` after installing dependencies in the sibling packages so
their types (`chalk`, `sql.js`, `@types/node`) resolve:

```sh
(cd ../cli && npm install)
(cd ../vscode-extension && npm install)
npm install
npm run check-types
```

The authoritative build gate remains `npm run build` (esbuild, which follows only
the real import graph). `check-types` is the stricter companion that also reports
type errors in every file it touches.
