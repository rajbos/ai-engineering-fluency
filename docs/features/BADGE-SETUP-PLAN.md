# Universe Badge — Implementation Plan

**Status:** plan, not implemented yet. Last updated 2026-10-25.

Build a badge app for the GitHub Universe 2026 badge that shows live data from the AI Engineering Fluency extension, plus two QR codes. Everything below is decided unless it sits under [Open items](#open-items-risks-and-order-of-work).

## Goal and decisions

**The badge shows these screens** (mockups are on the design canvas, linked under Setup):

1. Fluency score: overall stage (1 to 4) and its label, plus all six categories with their names and stage values as segment bars.
2. 30-day history: one bar per day for tokens, with a day cursor you scrub; a toggle switches to sessions.
3. QR code to `https://github.com/rajbos/ai-engineering-fluency` with the repo logo mark in the centre on a dark tile.
4. QR code to `https://linkedin.com/in/bosrob` with the official LinkedIn logo in the centre.
5. Sync status, shown on demand with MENU (and automatically when there is no data yet).
6. Wearer view, shown when the badge is lifted to read (see Part 1b).
7. Tip, shown after a shake (see Part 1b).

**Decisions made:**

- No radar chart. It was dropped because it showed no values or category names.
- Sync is USB for the first load, then a Wi-Fi push option on top. The sharing server is not used.
- No pairing code. The extension writes a random token to the badge over USB; every later Wi-Fi push sends it as a bearer token.
- Highlight colours come from the active VS Code theme, read from the webview's CSS variables, with a fixed dark ground on the badge.
- QR codes use the full URLs as they are now. Shortening them is a later experiment after testing on the device.
- The extension gets a new "Badge setup" screen with a navigation button. It links to the GitHub Universe badge page and the `badger/home` repo for documentation.
- The badge app lives in this repo under `badge-app/fluency/` (confirm, see Open items).

**Dropped or deferred:** `vscode://` deep links from a QR, mDNS discovery, automatic same-network detection, and any marketplace (the badge has none; apps are copied as files).

## Setup

**Repos and references**

| What | Where | Use |
| --- | --- | --- |
| Fluency repo | [rajbos/ai-engineering-fluency](https://github.com/rajbos/ai-engineering-fluency) | extension, CLI, new `badge-app/` |
| Badge repo | [badger/home](https://github.com/badger/home) | reference apps: `badge/apps/badge` (stats), `contacts` (QR), `Copilot` (HTTP server) |
| Badgeware docs | [pimoroni/badgeware-docs](https://github.com/pimoroni/badgeware-docs) | `api/shape.md`, `api/image.md`, `guides/networking.md` |
| Design canvas | [Fluency Badge Screens](https://claude.ai/artifact/BEVQTDRFFaWYPePAHbk7qU) (private to the owner) | the badge screens and the VS Code panel, shown at 2x the 320x240 LCD |

**Tools to have**

- Node 22 and pnpm (the repo's `build.ps1` and the `pnpm run ...` scripts).
- Python 3 with `mpremote` (`pip install mpremote`) and `qrcode[pil]` for pre-rendering QR images if the firmware's QR API turns out too limited.
- A Universe 2026 badge on USB. Only one program can own the serial port, so close other serial tools while syncing.

**Assets to collect before building**

- Repo mark: `assets/AI Engineering Fluency - Transparent.png`. Crop to the robot head and bars, no wordmark, and export 28x28 on the dark tile.
- LinkedIn logo: the official "in" bug PNG from LinkedIn's brand site, saved as 28x28.

**Repo rules that affect this work** (from `AGENTS.md`)

- Never launch a real VS Code or other IDE window to test. Use `pnpm run compile`, the unit tests and the headless checks.
- After any webview change run `pnpm run check:contract` and `pnpm run check:interaction` from `vscode-extension/`. If the screen's look changed, also run `pnpm run visual:diff`.
- `extension.ts` is size-pinned by `max-lines`. Put new logic in a new module and call it from there.
- New localization keys need tests in `vscode-extension/test/unit/l10n.test.ts`.
- Edits under `.github/`, `.claude/`, `AGENTS.md` or `CLAUDE.md` on an agent-authored PR trip the guard workflow and need the `agent-config-approved` label. This plan touches one such path: the visual-diff registry `views.config.json` and its fixture, which the new-panel rule requires (see Part 3).

## Part 1: the badge app

A MicroPython app in `badge-app/fluency/`, copied to `/system/apps/fluency/` on the badge. Layout follows `badger/home`: `__init__.py`, a 24x24 `icon.png`, and `assets/` for the logo PNGs.

**Runtime facts to build on** (verified in `badger/home` and `badgeware-docs`)

- Globals are provided: `badge`, `screen`, `image`, `font`, `color`, `shape`, `mat3`, `rect`, `run`, and button constants. The app ends with `run(update)`.
- Call `badge.mode(HIRES | VSYNC)` for the full 320x240 surface; the default is 160x120.
- Input is orientation-aware: `badge.pressed(BUTTON_LEFT)`, `held`, `released`. Use `BUTTON_MENU` and `BUTTON_BACK` for the sync screen.
- Resolve the app folder like the `commits` app does, trying `/remote/apps/fluency` first, then `/system/apps/fluency`. That makes `mpremote mount` testing work without copying files.
- No simulator models the 2026 badge. Pimoroni's desktop and web Badgeware simulators help with layout, but test on hardware.

**Controls**

| Screen | LEFT / RIGHT | Motion | Other |
| --- | --- | --- | --- |
| Score, QR repo, QR LinkedIn | tap flips to previous / next screen | shake shows a tip | MENU opens sync status |
| 30-day history | tap flips screen | tilt scrubs the day cursor | UP / DOWN toggles tokens and sessions |
| Wearer view | tap flips screen | appears when lifted, leaves when hanging | shake shows a tip |
| Sync status | tap flips screen | none | BACK returns |

**Data file** `/state/fluency.json`, written by the extension (sample values; real ones come from `fluency --json` and `chart --json`, `periods.day`, last 30 entries):

```json
{
  "v": 1,
  "updated": "2026-10-23T19:14:00Z",
  "stage": 3,
  "label": "AI Collaborator",
  "categories": [["Prompt", 3], ["Context", 3], ["Agentic", 4], ["Tools", 3], ["Custom", 2], ["Workflow", 3]],
  "days": [["2026-09-24", 41000, 5], ["2026-09-25", 58000, 7]],
  "tokens30": 1840000,
  "sessions30": 211,
  "today": [52000, 6],
  "tips": {"Custom": ["<tip text>", "<tip text>"], "Context": ["<tip text>"]},
  "theme": {"accent": "#0078d4", "link": "#4daafc", "good": "#2ea043", "warn": "#f0883e"}
}
```

Keep it under about 4 KB (the badge's data partition is roughly 980 KiB in total). Category labels are shortened to one word so they fit; the extension's full names are Prompt Engineering, Context Engineering, Agentic, Tool Usage, Customization and Workflow Integration. Days are `[date, tokens, sessions]`. There is no per-day fluency score in the extension, so the graph is tokens and sessions only.

**QR codes**

- `contacts` uses `image.qr(url, image.QR_LOW, 2)`. Only `QR_LOW` appears in that repo, so check on the device which error-correction constants exist. A centre logo needs the high level.
- Module counts at high error correction: repo URL 41x41 (4 px per module on screen), LinkedIn 33x33 (5 px). Both fit beside text.
- Fallback if the firmware cannot do high error correction: pre-render both codes on the PC with Python `qrcode` (high level, logo pasted in the centre) and ship them as PNGs in `assets/`.
- Blit order: white quiet area, QR, white ring around the centre, then the logo. The repo mark sits on a dark rounded tile; the LinkedIn logo is the official blue "in" bug.
- LinkedIn URL: read `CONTACT_LINKEDIN` from `/secrets.py` if set (the stock Settings app edits it), otherwise use `linkedin.com/in/bosrob`.

**Wi-Fi receiver** (second milestone; copy the pattern from `badge/apps/Copilot/copilot_monitor.py` in `badger/home`)

- Non-blocking HTTP server on the badge's Wi-Fi address, stepped once per frame from `update()`. Bounded header parsing, one request per connection, 5 s timeout.
- Raise the Copilot app's 512-byte body cap to about 4 KB, since the payload is a few KB.
- Endpoints: `POST /fluency` (body is the JSON above, written atomically to `/state/fluency.json` via a temp file and rename) and `GET /status`. Both require `Authorization: Bearer <token>` read from `/state/fluency_pairing.json`.
- Join Wi-Fi with the stock `wifi` module and `/secrets.py` (`WIFI_SSID`, `WIFI_PASSWORD`). Connect only while the app is open, since Wi-Fi uses a fair bit of battery.
- The protocol is unencrypted HTTP with a bearer token. Fine for a trusted LAN, not for the Internet. Say so in the README.

## Part 1b: motion features

Three accelerometer features are in scope. Steps walked is a stretch goal that depends on a firmware check on the device. All of them run on the badge; the simulators do not model the accelerometer, so they need hardware to test.

1. **Tilt to scrub history.** On the 30-day screen, tilting left or right moves the day cursor, and more tilt moves it faster. Reuse the `Tilt` class from `badge/apps/badge/__init__.py` (it smooths over about 120 ms and recentres over about 2.8 s; 16384 is about 1 g). Add a dead zone of about 0.15 g so walking does not move the cursor. A LEFT or RIGHT tap always flips screens.
2. **Wearer view vs audience view.** Hanging on the lanyard, the badge shows the audience screens: score, history and the QR codes. Lifted to read, it switches to a wearer screen with today's tokens and sessions, the weakest category and its stage, and the last push time. Use `badge.upside_down()` and `badge.direction()` for the orientation, with about 1 s of debounce so a swing does not flip it.
3. **Shake for a tip.** A shake (acceleration above about 2 g for a few frames, then a 1.5 s cooldown) shows one improvement tip for the lowest-scoring category. Shake again for the next tip. The tips come from the per-category `tips` in `calculateMaturityScores` (the same as `fluency --tips`), cut to at most 90 characters and 2 per category. The tips contain markdown links and video links, so the payload builder strips them to plain text.

**Steps walked (stretch goal).** The LSM6DS3TR-C has a hardware step counter, but nothing in `badger/home` shows the Universe firmware exposing it.

- Check on the device first: run `dir(badge)` in the REPL and look for a step or pedometer call, and check whether the IMU is reachable over I2C from MicroPython (`hardware/README.md` in `badger/home` lists the onboard peripheral connections).
- If it is reachable, the badge counts steps itself, keeps a per-day count in `/state/fluency_steps.json`, and the wearer screen shows a line like "8,412 steps · 52k tokens today". The extension is not involved.
- If it is not, software step detection from the raw readings is the fallback. It only counts while the app is open and costs battery, so label it as approximate or drop the feature.

## Part 2: extension side, sync and theme colours

The extension builds the data file, writes it to the badge over USB, and later pushes it over Wi-Fi. A payload is built once in the shared `src/` and every host calls it, and new feature logic stays out of `extension.ts`:

| Piece | Where | Does |
| --- | --- | --- |
| Payload builder | new `src/badgePayload.ts` | Pure function: takes the maturity scores, the chart data and the theme colours, returns the JSON above. No `vscode` imports. |
| Payload tests | `src/test/badgePayload.test.ts` | Stage and label mapping, exactly 30 days (missing days padded with zeros), size under 4 KB, hex normalisation, tip stripping. |
| Sync service | new `vscode-extension/src/badge/badgeSyncService.ts` | USB write, Wi-Fi push, token handling. Takes its command runner and HTTP client as parameters so tests never touch a device. |
| Panel | new `webview/badge-setup/` (Part 3) | Status, buttons, theme colour probe. |
| Wiring | `extension.ts` | One call from the existing 5-minute refresh (`computeAndUploadFluencyScore` is the neighbour) and the command registration. Nothing more. |

**Data sources.** Score: `calculateMaturityScores` in `src/maturityScoring.ts` gives `overallStage`, `overallLabel` and six categories (same data as `fluency --json`). Days: `buildChartData()` in `src/chartDataBuilder.ts`, take the last 30 of `periods.day` (`periodKeys`, `tokensData`, `sessionsData`). Totals for the 30-day line come from the same arrays.

**USB sync (first milestone)**

1. Shell out to `mpremote` (off the shelf, no serial library to maintain). If it is missing, the panel says `pip install mpremote`.
2. Find the badge with `mpremote devs`; if several ports match, ask once and remember.
3. Create `/state` if absent (`fs mkdir`, ignore the error), then copy `/state/fluency.json` and, on the first run, `/state/fluency_pairing.json` containing the new token: `mpremote connect <port> fs cp <tempfile> :/state/fluency.json`.
4. Generate the token with `crypto.randomBytes(16)`, store it in VS Code `SecretStorage` (not `globalState`), write the temp file with owner-only permissions and delete it right after the copy.
5. Expect the running badge app to restart: `mpremote` soft-resets the badge when it enters raw REPL. Say so in the panel.

**Installing the app itself needs a different path.** `/system` is read-only in the normal REPL, so `mpremote` cannot copy the app there. Installation is USB disk mode: double-tap RESET (or open the Mass Storage app), copy the `fluency` folder to `apps/` on the `BADGER` drive, eject. First version of the "Install app on badge" button: bundle `badge-app/fluency` with the extension, reveal it in the file manager and show those three steps. Optional second version: detect a mounted `BADGER` volume (`/Volumes/BADGER`, `/media/<user>/BADGER`, a Windows drive with that label) and copy the folder for the user.

**Wi-Fi push (second milestone)**

- `POST http://<badge address>/fluency` with `Authorization: Bearer <token>` using the global `fetch`, a 3 second timeout, JSON body.
- The address is a text field in the panel, prefilled with the last good one. The badge's sync screen shows its IP, so nothing needs discovery yet.
- Settings: `aiEngineeringFluency.badge.address` and `aiEngineeringFluency.badge.autoPush`. Push on the existing 5-minute tick, and only when the payload hash changed.
- On failure show "badge not reachable, plug in USB" and keep the last success time. No retry loop.

**Theme colours**

- The Badge setup webview reads the CSS variables VS Code injects: `--vscode-focusBorder` (accent), `--vscode-textLink-foreground`, `--vscode-button-background`, `--vscode-charts-green`, `--vscode-charts-orange`, `--vscode-charts-red`, `--vscode-descriptionForeground`, `--vscode-editor-background`. It posts them to the host with a new message, for example `badgeTheme`.
- The host normalises to `#rrggbb`, caches them in `globalState`, and refreshes on `onDidChangeActiveColorTheme` when the panel is open. If it is closed, the cached values go out.
- The extension API does not expose resolved theme colours, which is why a webview is the probe.
- Badge side: keep the dark ground; take only accent colours; fall back to the default GitHub-dark palette if the key is missing; enforce a minimum contrast against the ground and a saturation floor so a grey accent does not make the screens look dead.

**Privacy.** The payload holds counts, a stage, short tips and colours only. No prompts, paths, repository names or session titles. Data goes only to the badge the user paired.

## Part 3: the Badge setup screen

A new webview screen in the extension with a navigation button. Content:

- Status: paired or not, last push time and size, Wi-Fi address.
- Three actions: Push now, Sync over USB, Install app on badge.
- The theme colour strip (what the badge will use).
- A links block: the `badger/home` repo for the badge's documentation, the GitHub Universe badge reference, and the feature doc `docs/features/BADGE-SETUP.md` (to be written when the feature ships).

**Two ways to get the button in. Pick one before starting.**

| | A: full navigation button | B: extension-point button |
| --- | --- | --- |
| How | Same as Fluency Score, Usage and the rest: an icon in `buttonConfig.ts` `NAV_ORDER`, wired by hand in each screen | Register through the existing `registerButton` (the same mechanism companion extensions use), which adds a text button to the `.button-row` of every panel |
| Files touched | About 20, including a click handler in each of the 11 screens' `main.ts` | The new module, the panel and a few lines in `extension.ts` |
| Look | Icon plus label like its neighbours | Text-only, appended at the end of the row |
| Risk | Large PR, `extension.ts` size pin | Low; can be promoted to A later |

Recommendation: B first, A once the badge app works on hardware.

**The size pin is the main snag for both.** `vscode-extension/eslint.config.mjs` pins `extension.ts` at its current counted size (blank lines and comments excluded) with no slack. Any wiring line added there fails lint. Plan a small extraction first, such as moving one self-contained method out to a module, to buy headroom, then add the wiring. `docs/adr/EXTENSION-TS-DECOMPOSITION.md` says one cluster per PR. Keep the badge panel class itself in `vscode-extension/src/badge/` so only registration lines land in `extension.ts`.

**Checklist for the new panel** (mirror `fluency-level-viewer`, the smallest screen)

1. `vscode-extension/esbuild.js`: add the entry `'badge-setup': 'src/webview/badge-setup/main.ts'` next to the `fluency-level-viewer` entry.
2. New `src/webview/badge-setup/main.ts` and `styles.css`, copied from `fluency-level-viewer`. The initial data global follows the `__INITIAL_*__` convention, for example `__INITIAL_BADGE_SETUP_DATA__`. The CSP, nonce and script URI helpers are `getNonce` and `buildCspMeta` from `utils/webviewUtils.ts`.
3. Host side in a new `src/badge/badgeSetupPanel.ts`: create the panel with `enableScripts: true` and `localResourceRoots` set to `dist/webview`, build the HTML with those helpers, handle the messages for push, USB sync, install help and `badgeTheme`.
4. Option A only: `shared/buttonConfig.ts` (`ButtonId`, `BUTTON_DEFS`, `NAV_ORDER`), a click handler for `btn-badge-setup` in every screen (find them with `grep -rl btn-maturity vscode-extension/src/webview`), the `dispatchSharedCommand` map, the `openers` map, `getPanelForView`, the local view-regression list, and `FeatureViewId` in `whatsNew/catalog.ts`.
5. Command: add `aiEngineeringFluency.showBadgeSetup` to `package.json` (commands only; there is no `menus` section) and its title to `package.nls.json` and `package.nls.zh-cn.json`.
6. Localization: new keys also go in `webview/shared/webviewKeys.json`, and `l10n.test.ts` needs assertions for them.
7. Visual registry: add the screen to `.github/skills/visual-view-diff/views.config.json` with a fixture (`id`, `title`, `bundle`, `global`, `fixture`, modelled on the `fluency-level-viewer` entry). This path is under `.github/`, so an agent-authored PR trips the guard workflow and needs the `agent-config-approved` label.
8. Docs: `docs/features/BADGE-SETUP.md`, a row in `docs/README.md`, a link from `docs/vscode-extension/README.md`, and a row in `docs/vscode-extension/VIEW-HIERARCHY.md` for option A.
9. Optional: a What's New entry via the `whats-new-catalog` skill, and a CHANGELOG bullet.

**Validate** from `vscode-extension/`: `pnpm run compile`, `pnpm run lint`, the unit tests one file at a time, then `pnpm run check:contract` and `pnpm run check:interaction`, and `pnpm run visual:diff` for the new screen. Never open a real editor window.

**Links block contents.** Use `https://github.com/badger/home` for the badge documentation. For the GitHub Universe badge reference there is no URL yet (see Open items). Other links confirmed in the `badger/home` README: the [Tufty 2350 product page](https://shop.pimoroni.com/products/tufty-2350), [badgewa.re](https://badgewa.re/), and [Badgeware docs](https://github.com/pimoroni/badgeware-docs).

## Open items, risks and order of work

**Open items**

- [ ] Where the badge app lives: `badge-app/fluency/` in this repo (assumed here) or a fork of `badger/home` under `badge/apps/fluency/`.
- [ ] Button route for the Badge setup screen: option A (full navigation button) or B (extension-point button), see Part 3.
- [ ] The URL to show for the GitHub Universe badge reference. No official badge page was found yet; until one is picked, the links block uses `badger/home`, the Tufty 2350 page and badgewa.re.
- [ ] The official LinkedIn "in" logo PNG, saved as `badge-app/fluency/assets/linkedin.png`.
- [ ] The sync mockup still says "UP: announce on LAN" and the VS Code panel mockup still mentions a pairing step. Discovery is deferred and there is no pairing code, so both lines should be reworded when the screens are built.

**Risks to verify on the hardware**

- Which QR error-correction constants the firmware exposes. Without a high level the centre logo breaks scanning; use the pre-rendered PNG fallback.
- Whether the chosen fonts, stroke widths and the 4 px QR modules stay legible at 320x240 on the real LCD and scan from arm's length. Shortening the URLs is the lever if not.
- Whether `mpremote` writes to `/state` cleanly while the app is running, and how long the soft reset takes.
- Whether the firmware exposes the IMU's step counter, which decides if steps walked ships. Also whether tilt-scrubbing stays steady while walking.
- Wi-Fi behaviour on venue networks with client isolation: the push will fail there by design, and USB is the fallback.

**Suggested order**

1. Badge app screens fed by a hand-written `fluency.json` copied with `mpremote`. Proves layout, fonts, QR codes and logos on the device.
2. `src/badgePayload.ts` with tests, and a sync command that writes the file over USB, including the token.
3. Badge setup panel and its button, with the theme colour probe, plus the docs page.
4. Wi-Fi receiver on the badge and the push client in the extension.
5. Motion features (tilt, wearer view, shake for a tip), then steps walked if the firmware allows it.
6. Optional: a `badge` CLI command that prints the same payload, and automatic copy to a mounted `BADGER` drive.
