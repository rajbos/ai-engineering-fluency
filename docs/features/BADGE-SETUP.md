# Badge setup

The **Badge setup** view sends your AI Engineering Fluency score and 30-day usage to the GitHub Universe 2026 badge. The badge app itself lives in [`badge-app/`](../../badge-app/README.md); the design decisions, data format and roadmap are in [BADGE-SETUP-PLAN.md](BADGE-SETUP-PLAN.md).

## Open it

- Click the **Universe Badge** button in the button row of any view, or
- run **AI Engineering Fluency: Show Badge Setup** from the Command Palette.

The button is registered through the extension-point API (`registerButton`), so it appears as a text button at the end of the row rather than as one of the icon buttons. Promoting it to a full navigation button is a follow-up.

## Hide it if you have no badge

The **Hide this view (I have no badge)** button at the bottom of the view removes the **Universe Badge** button from every view and closes the view. The choice is remembered. Run **AI Engineering Fluency: Show Badge Button** from the Command Palette to bring the button back. **Hide Badge Button** does the same as the view's button.

## What the view does

| Part | What it does |
| --- | --- |
| Sync status | Shows when the badge was last synced, the payload size and the serial port. |
| **Sync over USB** | Builds the payload and copies it to `/state/fluency.json` on the badge with `mpremote`. |
| **Install app on badge** | Copies the bundled `fluency` app to `apps/fluency` on the `BADGER` drive and replaces an older copy. Put the badge in USB disk mode first (double-tap RESET). The drive is found by its label and is only used when it holds an `apps` folder, so nothing is deleted on another volume that happens to be called BADGER. On Windows the label is read with `pwsh`, falling back to `powershell.exe` and then to `bash` (via `cmd.exe vol`); if none of them works the app folder is revealed for a manual copy. a Windows drive letter (via PowerShell `Get-Volume`), `/Volumes/BADGER` on macOS, or the usual `/media`, `/run/media` and `/mnt` mount points on Linux. If no drive is found, the app folder is revealed in your file manager for a manual copy. Eject the drive afterwards (the view cannot do that for you), then open Fluency from the badge menu. |
| Badge colours | The accent, link, positive and warning colours the badge takes from your current VS Code theme. |
| Links | `badger/home`, the Tufty 2350 product page, badgewa.re and the Badgeware docs. |

## Requirements

- Python's `mpremote` (`pip install mpremote`) on your `PATH`. The view says so when it is missing.
- The badge plugged in over USB, with no other program holding its serial port.
- Syncing soft-resets the badge, so a running badge app restarts while it loads the new data.

## What is sent

Counts and labels only, built by `buildBadgePayload()` in [`src/badgePayload.ts`](../../src/badgePayload.ts): the overall stage and label, the six category stages (one-word names), tokens and sessions for each of the last 30 days, and four theme colours. No prompts, file paths, repository names or session titles. The file stays under 4 KB and goes only to the badge you picked.

How it is sent: the payload is written to a temp file with owner-only permissions, `mpremote` copies it, and the file is removed again. `mpremote` is started with an argument array, never through a shell, and a port name that could be read as an option is refused.

## How the theme colours are read

The extension API does not expose resolved theme colours, so the view reads the CSS variables VS Code injects into the webview (`--vscode-focusBorder`, `--vscode-textLink-foreground`, `--vscode-charts-green`, `--vscode-charts-orange`), normalises them to `#rrggbb` and reports them to the extension, which caches them. A sync while the view is closed uses the cached colours. The badge keeps its dark background and only takes accents, with a contrast and saturation floor.

## Not built yet

- Wi-Fi push and the pairing token (milestone two in the plan).
- Per-category tips in the payload, which the shake-for-a-tip screen would use.

## Where the code is

| Piece | File |
| --- | --- |
| Payload builder (shared, editor-neutral) | `src/badgePayload.ts`, tests in `src/test/badgePayload.test.ts` |
| USB sync (`mpremote`, injected runner) | `vscode-extension/src/badge/badgeSyncService.ts`, tests in `vscode-extension/test/unit/badgeSyncService.test.ts` |
| Panel host | `vscode-extension/src/badge/badgeSetupPanel.ts` |
| App install (find the `BADGER` drive, copy the app) | `vscode-extension/src/badge/badgeInstallService.ts`, tests in `vscode-extension/test/unit/badgeInstallService.test.ts` |
| Command and button registration | `vscode-extension/src/badge/registerBadgeSetup.ts` |
| Webview | `vscode-extension/src/webview/badge-setup/` |
| Visual registry entry and fixture | `.github/skills/visual-view-diff/views.config.json`, `.github/skills/visual-view-diff/fixtures/badge-setup.json` |
