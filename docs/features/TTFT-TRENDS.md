# Time to First Token (TTFT) Trends

The **Research > TTFT** tab in the Diagnostic Report answers: *how long does a model take
to start streaming a response, and is that changing over time or by model?*

## Where the data comes from

VS Code Copilot Chat's debug log — the same undocumented log this extension already reads for
exact per-session billing (see
[vscode-chat-debug-log-format.md](../logFilesSchema/vscode-chat-debug-log-format.md)) — carries
`attrs.ttft` on every `llm_request` event. No OTel export and no setting *this project* asks
you to configure: this is whatever VS Code has already written locally, for however long it
happens to have kept it.

**But that `llm_request` line only exists at all when VS Code Copilot Chat's own experimental
"GitHub › Copilot › Chat › Agent Debug Log › File Logging: Enabled" setting was on (and the
window had been reloaded since) during that session** — see
[Gated by an experimental setting](../logFilesSchema/vscode-chat-debug-log-format.md#gated-by-an-experimental-setting).
That setting is off by default and belongs to Copilot Chat, not this extension, so there is
nothing in *this project's* settings to toggle — but if you see zero samples even with "All
time" selected, check that VS Code setting and reload the window before assuming there's
nothing to find.

This also means there is nothing that will ever show data for editors other than VS Code
Copilot Chat — the debug log doesn't exist for Copilot CLI, JetBrains, Claude Code, or any
other surface this project tracks.

## Two unit assumptions, both magnitude-based

Neither `attrs.ttft`'s unit nor the event's `ts` unit is documented by Microsoft. Rather than
assert one convention and risk being wrong the way an earlier version of the debug-log doc was
about event type names, both are auto-detected by magnitude — see
`normalizeDebugLogTimestampMs()` and `normalizeTtftSeconds()` in
[tokenEstimation.ts](../../src/tokenEstimation.ts):

- **Timestamp**: a real Unix timestamp in seconds stays under `1e10` until the year 2286; in
  milliseconds it is already past `1e12` today. Anything under `1e12` is treated as seconds and
  multiplied up.
- **TTFT**: a real time-to-first-token is realistically 0.05–60 seconds; the same call stored
  in milliseconds would read 50–60,000. Anything under 100 is treated as seconds and left
  alone; anything at or above is treated as milliseconds and divided down.

If a future real log shows either heuristic guessing wrong (e.g. genuinely multi-hundred-second
TTFTs became normal), tighten the threshold rather than removing the check — the alternative is
asserting a unit with no source, which is the exact mistake this heuristic exists to avoid.

## What it shows

- **Granularity selector** — Day / Week / Month, persisted across reopens.
- **Scan-range picker** — "Scan session files from": Last 14 days (default) / 30 days / 90
  days / 6 months / year / All time, also persisted across reopens. This controls which
  session files' debug logs get read for TTFT — see "Scan range vs. Diagnostics discovery"
  below for why this exists as its own control.
- **Summary cards** — overall average TTFT, distinct models shown, total samples, session
  files checked (within the selected scan range).
- **Trendline chart** — one line per model (top 6 by sample count; the long tail is dropped,
  not folded into a misleading "Other" average), with gaps left where a model had no samples
  in a bucket rather than interpolating across them.
- **Bucket table** — exact average and sample count per bucket, most recent first.

## Scan range vs. Diagnostics discovery

The rest of the Diagnostics screen (Session Files list, Model Usage dropdown, etc.) discovers
session files through a 14-day/500-file round-robin cap per editor — see
`selectSessionFilesRoundRobin()` in `extension.ts`. That cap exists to keep the general session
cache small, but it silently hid `attrs.ttft` samples that genuinely exist on disk whenever the
only sessions carrying them were older than 14 days — which is likely for this data specifically,
since (per the gating setting above) fully-populated debug logs may only exist for whatever
stretch of time the experimental File Logging setting happened to be on.

The TTFT tab does not use that capped list. It scans `diagnosticsAllSessionFiles` — the full,
unfiltered discovery result — filtered first by path shape (cheap, no I/O:
`resolveDebugLogCandidatePaths()` rejects anything that isn't a VS Code Chat session file) and
then, unless "All time" is selected, by the chosen lookback window via each candidate's mtime.
Widening the picker can only ever reveal more real data that was already on disk; it never
changes what `attrs.ttft` contains.

## Where the code lives

| Concern | Location |
|---|---|
| Raw sample extraction | `extractTtftSamplesFromDebugLog()` in [tokenEstimation.ts](../../src/tokenEstimation.ts) |
| Bucketing + per-model series | [ttftAnalysis.ts](../../src/ttftAnalysis.ts) (`buildTtftBuckets`, `buildTtftModelSeries`) |
| Debug-log path resolution | `resolveDebugLogCandidatePaths()` in [workspaceHelpers.ts](../../src/workspaceHelpers.ts) — shared with the exact-billing path in `readTokensFromDebugLog()` |
| Extension-host scan + message handler | `collectTtftSamples()` / `diagHandleAnalyzeTtft()` in `extension.ts` — scans `diagnosticsAllSessionFiles`, not the capped `diagnosticsCachedFiles` |
| Tab UI + inline SVG chart | `renderTtftTab()` / `renderTtftChartSvg()` in `vscode-extension/src/webview/diagnostics/main.ts` |

## Design choices worth knowing

- **Lazy, not eager.** Unlike the OTel Delta tab (computed once at diagnostics load),
  TTFT is scanned on demand — first tab open, or a granularity change — mirroring the
  Model Usage tab's pattern. Scanning every session's debug log on every diagnostics open
  would be needless I/O for a Research-tab curiosity nobody asked to see yet.
- **Not cached in the session cache.** Token counts and billing are cached per session
  because the dashboard's cost numbers depend on them. TTFT samples are re-read fresh on
  each request instead — they don't feed any other number in the extension, so persisting
  them would be schema complexity with no payoff.
- **No fixed trailing window.** Token charts show a fixed last-30-days/6-weeks/12-months
  window. TTFT buckets span only from the earliest sample to the latest, because how far
  back TTFT history exists depends entirely on VS Code's own debug-log retention, which
  this extension does not control.
