# AI Engineering Fluency

Shows your AI Engineering Fluency score, 30- or 90-day token history and QR codes for the extension and LinkedIn.

![Score screen](../../docs/features/badge-mockups/1-score.png)

## Usage

| Control | Action |
| --- | --- |
| LEFT / RIGHT | Flip between score, 30/90-day history, QR to the repo and QR to LinkedIn |
| SELECT (tap) | Switch the look: Motion, 3D radar, 3D skyline |
| Tilt (3D radar look, score screen) | Left/right spins the radar, forward/back changes the viewing angle |
| Tilt forward/back (3D skyline look, history screen) | Changes the camera angle |
| Tilt (history screen) | Scrub through the days; tilt further to move faster |
| SELECT held + LEFT / RIGHT (history screen) | Step one day at a time |
| UP / DOWN (score screen) | Flip between the bars (or 3D radar) and an animated spider chart of the categories |
| UP / DOWN (history screen) | Switch between tokens and sessions |
| MENU | Open sync status |
| UP / DOWN (sync status) | Switch the look |
| SELECT (sync status, no data yet) | Show clearly labelled demo data |
| BACK | Close sync status, or exit to the launcher |

## Looks

| Look | Score screen | History screen |
| --- | --- | --- |
| Motion (default) | Bars grow in; screens slide | Bars grow in, the cursor glides with a pulsing halo |
| 3D radar | A turning radar prism with every category's name and stage | Flat bars |
| 3D skyline | Flat bars | A 3D contribution graph: a tower per day, laid out by weekday and week |

The app remembers the look in `/state/fluency_look.json`. In every look,
UP / DOWN on the score screen flips to a flat spider chart: the rings grow
out of the centre, a radar arm sweeps round once and each category pops out
to its stage as the arm passes it. After one more faint turn of the arm the
chart replays that intro in the next colour, like the score bars.

## Data

The app reads `/state/fluency.json`, written by the AI Engineering Fluency
extension. It checks the file every few seconds and redraws when it changes.
Until the extension's sync command ships, copy a file over USB:

```sh
mpremote fs cp fluency.json :/state/fluency.json
```

The format is described in
[`docs/features/BADGE-SETUP-PLAN.md`](../../docs/features/BADGE-SETUP-PLAN.md).
`assets/sample.json` is a complete example.

The file holds counts, stages and colours only: no prompts, file paths or
repository names.

## Requirements

No Wi-Fi or `secrets.py` settings are needed. These optional ones are read
from `secrets.py` (the stock Settings app edits them):

| Setting | Shows |
|---|---|
| `GITHUB_USERNAME` | Your handle on the score screen. |
| `CONTACT_LINKEDIN` | The LinkedIn screen, with a QR code to your profile made on the badge. Either your username (`bosrob`) or the full link (`https://linkedin.com/in/bosrob`). Without it the screen is left out. |
| `CONTACT_NAME` | Your name on the LinkedIn screen (your GitHub handle when unset). |

To show your employer's logo under your name on the LinkedIn screen, copy a
small PNG (at most about 110 pixels wide) to `/state/company_logo.png`:

```sh
mpremote fs cp company_logo.png :/state/company_logo.png
```

## Install

Put the badge in USB disk mode (double-tap RESET, or open the Mass Storage
app), copy this `fluency` folder into `apps/` on the `BADGER` drive, and eject.
The app appears in the launcher.

The stock MonaOS 4.0 launcher only draws its own built-in icons, so the app
shows a generic dot grid until the menu is patched to load `icon.png`. The
patch is [Gadgetoid's menu change](https://gist.github.com/Gadgetoid/f72b85e6efe603bd02b2b730bbc40356),
which [`badger/home`](https://github.com/badger/home) already ships. Apply it
to `apps/menu/app.py` on the `BADGER` drive while it is in USB disk mode; the
serial connection cannot write there. Keep a copy of the original file to undo it.
