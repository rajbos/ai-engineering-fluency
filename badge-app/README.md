# Badge app

A MicroPython app for the GitHub Universe 2026 badge that shows your AI
Engineering Fluency data: your fluency stage and categories, a 30-day usage
history, and QR codes to the repo and LinkedIn. The easy way to install it and
send it data is the VS Code extension's **Universe Badge** view (see
[`docs/features/BADGE-SETUP.md`](../docs/features/BADGE-SETUP.md)). The data
format, controls and roadmap are in
[`docs/features/BADGE-SETUP-PLAN.md`](../docs/features/BADGE-SETUP-PLAN.md).

| Path | What it is |
| --- | --- |
| `fluency/` | The app. This folder is what gets copied to the badge. |
| `fluency/fluency_data.py` | Loading, validating and formatting `fluency.json`. No badge APIs, so it runs on a laptop. |
| `fluency/fluency_motion.py` | The three looks, easing and the 3D camera used by the animated views. No badge APIs either. |
| `fluency/assets/` | Pre-rendered QR codes, the repo mark and `sample.json` (demo data). |
| `tools/make_qr.py` | Rebuilds the QR code and logo PNGs. |
| `tools/preview.py` | Runs the app on a laptop and saves each screen as a PNG. |
| `tools/emulator/` | Runs the app in the badger.github.io WebAssembly simulator, headlessly, and saves each screen as a PNG. CI uses it. |
| `tests/` | Unit tests for `fluency_data.py` and `fluency_motion.py`. |

## Status

The screens read `/state/fluency.json`. The VS Code extension's Badge setup view
writes that file over USB, installs the app and reads the theme colours. Tilt
scrubs the history (30 or 90 days, whichever the Badge setup view pushed; its
chart preview shows what the next sync sends). On Motion, the score bars reload
every 5 seconds in a new colour. A tap on SELECT switches between three looks:
Motion (animated bars and sliding screens), 3D radar (score screen) and
3D skyline (history screen). UP/DOWN on the score screen flips to a spider
chart that a radar arm sweeps into view (with sonar pings rippling out from the centre), replaying in a new colour
after each turn of the arm, and back. Not done yet: Wi-Fi push, the wearer view and shake
for a tip (see the roadmap in
[`docs/features/BADGE-SETUP-PLAN.md`](../docs/features/BADGE-SETUP-PLAN.md)).

## Try it without a badge

```sh
pip install pillow
python badge-app/tools/preview.py            # sample data
python badge-app/tools/preview.py --data path/to/fluency.json
python badge-app/tools/preview.py --no-data  # what a fresh badge shows
```

Frames go to `badge-app/preview/` (git-ignored), including each look and a
mid-slide frame. The preview stubs the badge
runtime with Pillow, so fonts and colours are approximate; it shows layout
and catches crashes, not the real LCD.

Run the tests:

```sh
python -m unittest discover -s badge-app/tests
```

To check the code compiles for MicroPython: `pip install mpy-cross`, then
`python -m mpy_cross badge-app/fluency/__init__.py`.

## Try it in the emulator

`tools/emulator/` runs the app in the same MicroPython WebAssembly runtime as
[badger.github.io](https://badger.github.io/editor) and the Badge Simulator
canvas in [`badger/home`](https://github.com/badger/home), so it uses the real
badge fonts and graphics library rather than Pillow stubs. It needs Node and
the Playwright Chromium the visual-view-diff skill uses:

```sh
node badge-app/tools/emulator/emulator.js        # screens -> badge-app/preview/emulator/
node badge-app/tools/emulator/badge-diff.js --base origin/main   # vs the merge base -> visual-output/
node --test badge-app/tools/emulator/test/*.test.js
```

The runtime is pinned to one badger.github.io commit in
`tools/emulator/runtime.json`. It is downloaded from raw.githubusercontent.com
on first use and cached in `~/.cache/ai-fluency-badge-emulator/` (set
`BADGE_EMULATOR_CACHE` to move it). The screens it walks through, and the
button presses between them, are in `tools/emulator/lib/scenarios.js`; add a
`shot` there when you add a screen. A run fails if the app prints a traceback
or stops drawing.

In CI, a pull request that touches `badge-app/` runs it in the `ui-checks`
job: it renders the app at the merge base and at the PR head, and the changed
screens appear in the same screenshot comment as the webviews.

The emulator has no accelerometer (tilt is replaced by SELECT + LEFT/RIGHT),
no sockets and different timing, so finish on a real badge.

## Try it on a badge

Without copying anything (the app runs from your laptop until the badge resets;
this route is not yet tried on hardware):

```sh
pip install mpremote
mpremote mount badge-app run badge-app/tools/run_on_badge.py
```

To install it, use **Install app on badge** in the extension's Universe Badge
view, or do it by hand: put the badge in USB disk mode (double-tap RESET), copy
`badge-app/fluency` to `apps/` on the `BADGER` drive and eject.

Give it data (the extension's **Sync over USB** button does the same with your real numbers):

```sh
mpremote fs cp badge-app/fluency/assets/sample.json :/state/fluency.json
```

### If it crashes or freezes

The app writes `/state/fluency_debug.txt` each run. Every 10 seconds it logs
free memory, frames per second, the slowest frame, the longest gc pause and
the screen and look on show. If the app dies, the traceback goes last. `/state` is not on the `BADGER` drive, so read the log
over USB with the badge at the menu (not in disk mode, and without opening
Fluency again, since each launch rewrites the file):

```sh
mpremote fs cat :/state/fluency_debug.txt
```

Free memory that keeps falling means a leak. A log that just stops, with no
traceback, means the badge froze or reset below Python; the last line shows
the screen it was on. (`machine.reset_cause()` cannot tell you more: on the
RP2 every software reset reads as `WDT_RESET`.)

## Rebuild the QR codes

```sh
pip install "qrcode[pil]"
python badge-app/tools/make_qr.py
```

This rebuilds the repo QR code and the logos. The LinkedIn QR code is not a
file: the app makes it on the badge from `CONTACT_LINKEDIN` in `secrets.py`.

Check the result still scans with a phone before committing.
