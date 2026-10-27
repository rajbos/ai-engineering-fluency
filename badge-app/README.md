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
| `tests/` | Unit tests for `fluency_data.py` and `fluency_motion.py`. |

## Status

The screens read `/state/fluency.json`. The VS Code extension's Badge setup view
writes that file over USB, installs the app and reads the theme colours. Tilt
scrubs the 30-day history. A tap on SELECT switches between three looks:
Motion (animated bars and sliding screens), 3D radar (score screen) and
3D skyline (history screen). Not done yet: Wi-Fi push, the wearer view and shake
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

## Rebuild the QR codes

```sh
pip install "qrcode[pil]"
python badge-app/tools/make_qr.py
python badge-app/tools/make_qr.py --linkedin-logo path/to/linkedin-in.png
```

Check the result still scans with a phone before committing.
