---
name: release-video
description: Make the narrated release-notes video for the VS Code extension with the local generator in release-video/ (What's New catalog -> screenshots -> narration -> MP4). Covers which releases to include (ask the user for the last version an earlier video covered; never assume only the newest bump), switching to the maintainer's cloned voice via the Mistral engine, and the plan -> edit -> build loop. Use when asked to make, render, re-render or prepare a release video, product-update video, or "video for the release notes". Runs locally only; there is no CI workflow for it.
---

# Release Video Skill

The video is made by a local command-line tool in [`release-video/`](../../../release-video/README.md).
There is no GitHub workflow for it: it renders on the maintainer's machine
(NVENC, local screenshots, a voice engine) and the narration is meant to be
read and edited between runs. The README there is the full reference; this
file is the order to do things in.

All `npm run video` commands run from `release-video/`.

## 1. Ask which releases the video covers

**Ask the user before planning.** Videos are not made for every bump, so the
newest release alone usually leaves out everything shipped since the previous
video. Show them the catalogue:

```bash
npm run video -- releases
```

and ask: *"Which version did the last video cover?"* That answer is `--since`
(exclusive). Everything after it, up to the newest release (or `--version`),
goes into the video. If they want only the newest release, use `--since none`.

Run in a terminal without `--since`, `plan`/`build` ask this themselves; run
by an agent (no TTY) they do not ask and cover one release, so pass the flag.

## 2. Check the catalog has the features

Each scene is one feature from `vscode-extension/src/whatsNew/catalog.ts`.
A thin entry makes a near-empty video, so first run the `whats-new-catalog`
skill and compare its entries for the covered versions with
`vscode-extension/CHANGELOG.md`. Adding catalog entries is a separate change
(they also drive the in-product What's New view); raise missing features with
the user rather than silently rendering without them.

## 3. Build the inputs

```bash
cd ../vscode-extension && pnpm install --frozen-lockfile && pnpm run compile
cd ../release-video && npm install && npm run build
npm run video -- doctor
```

`vscode-extension/` is pnpm-only (its `package.json` uses `catalog:`
versions, which `npm install` rejects with `EUNSUPPORTEDPROTOCOL`).
`release-video/` is npm.

## 4. Pick the voice

Pass `--voice <engine>` on each command (it overrides `voice.engine` in
`release-video/config.json` for that run, so the committed config never
changes):

- `mistral` — **the maintainer's cloned voice.** The `voiceId` is already in
  the config; the key comes from the `MISTRAL_API_KEY` environment variable
  and never goes in a file. Hosted and billed per line, so confirm with the
  user before the first render; unchanged lines are cached and not re-sent.
- `command` (committed default) — Piper, local and free; needs the one-time
  `.venv-tts` setup in the README.
- `sapi` / `silence` — no install; for checking the pipeline and timing only.

Audition before rendering everything:

```bash
npm run video -- say --voice mistral --text-file content/voice-test.txt --output output/test.wav
```

Use the same `--voice` on `doctor`, `build` and `build --from voice`; a run
without it falls back to the committed engine.

## 5. Plan, review, render

```bash
npm run video -- plan --since <version>
npm run video -- timeline          # running order and length
npm run video -- script            # the narration, to read before paying for TTS
npm run video -- build --since <version> --voice mistral   # shots, voice, captions, render, QA
```

`content/manifest.json` is the editable script (git-ignored). After editing
narration, `npm run video -- build --from voice` regenerates only what
changed; `plan --keep-narration` re-plans without losing edited wording.
The MP4 lands in `release-video/output/`.

## 6. Hand it back

Report the output path, length and scene count, and that a human still has
to watch it: screenshot fit, pronunciation (`pronunciation.json`) and pacing
are not checked by `qa`.
