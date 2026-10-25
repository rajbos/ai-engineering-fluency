# AI Engineering Fluency

Shows your AI Engineering Fluency score, 30-day token history and QR codes for the extension and LinkedIn.

![Score screen](../../docs/features/badge-mockups/1-score.png)

## Usage

| Control | Action |
| --- | --- |
| LEFT / RIGHT | Flip between score, 30-day history, QR to the repo and QR to LinkedIn |
| Tilt (history screen) | Scrub through the days; tilt further to move faster |
| SELECT held + LEFT / RIGHT (history screen) | Step one day at a time |
| UP / DOWN (history screen) | Switch between tokens and sessions |
| MENU | Open sync status |
| SELECT (sync status, no data yet) | Show clearly labelled demo data |
| BACK | Close sync status, or exit to the launcher |

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

No Wi-Fi or `secrets.py` settings are needed. If `GITHUB_USERNAME` or
`CONTACT_NAME` is set in `secrets.py` (the stock Settings app edits both),
the score screen shows your handle and the LinkedIn screen your name.

## Install

Put the badge in USB disk mode (double-tap RESET, or open the Mass Storage
app), copy this `fluency` folder into `apps/` on the `BADGER` drive, and eject.
The app appears in the launcher.
