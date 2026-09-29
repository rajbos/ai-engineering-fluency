# AI fluency canvas

GitHub Copilot app canvas that shows the output of the
[`@rajbos/ai-engineering-fluency`](https://github.com/rajbos/ai-engineering-fluency) CLI. The look and feel mirrors
the extension's VS Code webviews (section cards, stats tables, chart colours, stage colours, radar chart), mapped onto
the Copilot app's theme tokens so it follows the app's light/dark theme.

It ships as the `ai-fluency-canvas` Copilot plugin (this folder is the plugin's
`com.github.copilot/extensions/ai-fluency/`), and can also be installed by hand as a user-level extension in
`$COPILOT_HOME/extensions/ai-fluency/`. Install instructions:
[docs/copilot-app/README.md](../../../../docs/copilot-app/README.md).

- **Details** — the extension's stats table (tokens, cost, activity, environment) for today / last 30 days /
  current month / previous month / projected year, and usage by editor and model. On narrow panels a period
  picker shows one column at a time.
- **Chart** — the extension's Chart view: summary cards (with a collapsible per-editor breakdown) and a bar/line
  chart aggregated by day / week / month, with a rolling average, the metric (tokens / cost / sessions) and the
  split (total / by model / by editor / by provider / by repository). The current period gets a projected bar, the
  legend hides series on click, and the tooltip works with pointer or arrow keys. It is drawn as plain SVG (no
  Chart.js or other dependency) using the extension's colours; splits keep the 8 largest series and fold the rest
  into "Other". Options the CLI has no data for (for example cost by model) are disabled.
- **Sessions** — every session from the last 30 days across all tracked tools, filterable by
  today / 7 days / 30 days, searchable, sortable by recency, tokens or cost.
- **Fluency Score** — overall stage banner, spider (radar) chart of the six categories with the stage reference,
  and per-category cards with a stage badge, progress bar, evidence and next-step tips.

## How it works

- `cli.mjs` runs `ai-engineering-fluency all --json` (global install preferred, falls back to
  `npx -y @rajbos/ai-engineering-fluency@latest`). A full run parses every local session log and takes
  several minutes, so it always runs in the background.
- `store.mjs` trims the ~700 KB payload into `$COPILOT_HOME/extensions/ai-fluency/artifacts/snapshot.json`
  (~250 KB; `COPILOT_HOME` defaults to `~/.copilot`). That path is the same for plugin and manual installs, so the
  cached snapshot survives plugin updates and reinstalls. The snapshot includes the day / week / month
  chart datasets (top 8 series per split plus "Other"). Session titles are
  derived from small metadata files next to each session (Copilot CLI `workspace.yaml`, VS Code
  `workspace.json`, Claude worktree folder names) — transcripts are never read by the canvas.
- `refresher.mjs` shows the last snapshot instantly, refreshes on open when it is older than 5 minutes,
  and auto-refreshes every 30 minutes while a panel is open. A `refresh.lock` file ensures only one CLI run
  at a time across all Copilot sessions; other sessions pick up the new snapshot via a file watcher.
- `server.mjs` serves the UI on `127.0.0.1` with a same-origin-only CSP (inline *styles* are allowed because the
  Copilot app injects its theme as inline `<style>` elements; scripts stay `'self'`), Host-header check, Origin
  check on `POST /api/refresh`, and pushes state over server-sent events (`/events`).
- Dark mode: `app.js` reads the app's `data-theme-tone` / `data-color-mode` attributes (falling back to the
  luminance of `--background-color-default`, then `prefers-color-scheme`) and sets `data-fluency-theme` on the
  root. A `MutationObserver` keeps it in sync when the app theme changes; dark fallback colours cover any token
  the app does not provide.

## Agent actions

| Action        | What it does                                                                 |
|---------------|------------------------------------------------------------------------------|
| `get_summary` | Returns cached stats (periods, top models, editors, fluency tips, top sessions of the last 7 days). Never runs the CLI. |
| `refresh`     | Starts a background refresh. Pass `{ "wait": true }` to block until it finishes. |

Example: `open_canvas({ canvasId: "ai-fluency", instanceId: "fluency" })`, then
`invoke_canvas_action({ instanceId: "fluency", actionName: "get_summary" })`.

## Development

```powershell
# from the repository root: canvas + plugin manifest tests (synthetic fixtures only)
node --test "copilot-app/**/*.test.mjs"
```

`copilot-extension.json` is only used by the Copilot app's "Install extension" flow (gist or repo folder); the
plugin install ignores it. After editing a manually installed copy, reload extensions in the Copilot app and re-open
the canvas. See [copilot-app/README.md](../../../README.md) for the plugin layout and versioning.
