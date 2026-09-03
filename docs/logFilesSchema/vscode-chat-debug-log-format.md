---
title: VS Code Copilot Chat Debug Log Format
created: 2026-09-03
updated: 2026-09-03
status: active
type: reference
tags: [copilot-chat, vscode, debug-log, aiu, billing, schema]
---

# VS Code Copilot Chat Debug Log Format

The file this project reads to get **exact token counts and exact GitHub billing**
for VS Code Copilot Chat sessions. It is undocumented by Microsoft, load-bearing for
every "exact cost" number the extension shows on that surface, and — until this page —
described nowhere in this repo.

## Location

```
<vscode-user>/workspaceStorage/<hash>/GitHub.copilot-chat/debug-logs/<sessionId>/main.jsonl
```

`readTokensFromDebugLog()` in [extension.ts](../../vscode-extension/src/extension.ts) derives
the path from the session file's own path and tries four extension-folder spellings in order:
`GitHub.copilot-chat`, `github.copilot-chat`, `GitHub.copilot`, `github.copilot`. `<sessionId>`
is the UUID-named session file's basename; non-UUID session files are skipped.

`<vscode-user>` covers every variant the extension supports (Code, Insiders, Exploration,
VSCodium, Cursor, and the `.vscode-server*` remote roots) — see
[VSCODE-VARIANTS.md](VSCODE-VARIANTS.md).

## Format

JSON-lines. Each line is one event object with a `type` and an `attrs` payload.

**This project currently reads exactly one event type: `llm_request`.** Other types are known
to exist (`request_start` and `request_end` appear in our own test fixtures) but are parsed by
nothing — see [What we do not read](#what-we-do-not-read).

### `llm_request`

One event per LLM API call. Agent-mode turns make several, and the chat session file records
only the last one's tokens — which is why summing this log is the only way to get a session
total. `extractAllTokensFromDebugLog()` in [tokenEstimation.ts](../../src/tokenEstimation.ts)
sums these `attrs`:

| Attribute | Type | Meaning |
|---|---|---|
| `inputTokens` | number | Exact input tokens for the call |
| `outputTokens` | number | Exact output tokens for the call |
| `cachedTokens` | number | Prompt-cache tokens (single figure — no read/creation split) |
| `model` | string | Model id, used for the per-model breakdown |
| `copilotUsageNanoAiu` | number | **Copilot AI Units in nano-units** — GitHub's own billing figure |

Events without a `model` still contribute to the totals; they are just excluded from the
per-model breakdown.

## The AI Unit billing path

`copilotUsageNanoAiu` is the exact amount GitHub bills for the call, and it is the reason
VS Code Chat cost numbers are not merely estimates:

```
llm_request.attrs.copilotUsageNanoAiu
  → EatdlAcc.copilotNanoAiu                       (tokenEstimation.ts)
  → × NANO_AIU_TO_DOLLARS  (1 / 1e11 — 1 AIU = $0.01)
  → copilotExactCostDollars                       (extension.ts)
  → exact-vs-estimated split                      (statsHelpers.ts)
```

`NANO_AIU_TO_DOLLARS` encodes **1 AI Credit = $0.01**, matching the
`monthlyAiCreditsUsd` values in
[copilotPlans.json](../../vscode-extension/src/copilotPlans.json). Sessions that carry the
attribute are billed exactly; [statsHelpers.ts](../../src/statsHelpers.ts) falls back to
model-pricing estimates only for Copilot-surface sessions that lack it.

> Beware of third-party dashboards that price an AI Unit at `$0.04`. That is the
> *premium-request overage* rate, a different billing concept from AI Credits. Our
> $0.01 figure is the correct one for this project — do not "reconcile" the two.

The same value reaches the Copilot **CLI** path under two other names —
`session.shutdown.totalNanoAiu`, and `github.copilot.nano_aiu` in the CLI's OpenTelemetry
export (see [COPILOT-CLI-OTEL-EXPORT.md](../COPILOT-CLI-OTEL-EXPORT.md)). Three spellings,
one quantity:

| Surface | Spelling |
|---|---|
| VS Code Chat debug log | `copilotUsageNanoAiu` |
| Copilot CLI session shutdown | `totalNanoAiu` |
| Copilot CLI OTel export | `github.copilot.nano_aiu` |

Searching for only one spelling will convince you the other surfaces have no billing data.
They do.

## Why this file exists at all

VS Code Copilot Chat instruments itself with OpenTelemetry. The debug log is that
instrumentation's always-on serialization: per
[upstream's monitoring docs](https://github.com/microsoft/vscode-copilot-chat/blob/main/docs/monitoring/agent_monitoring.md),
the SDK's internal tracing *"is always active for the debug panel"* even when OTel export is
disabled. The optional OTLP/file export is the same data on a different transport.

That is why this log carries AI Units at all, and why it needs no setup from the user — which
is the property that makes it the right source for this project.

## What we do not read

Our parser matches `type === 'llm_request'` and discards every other line. Known-present
types we ignore include `request_start` and `request_end`. If those carry timings, per-call
latency would be derivable with no user configuration — **unverified**; nobody has looked at a
real log to find out.

Run the [`discover-debug-log-schema`](../../.github/skills/discover-debug-log-schema/SKILL.md)
skill on a machine with real sessions to enumerate every event type and field this format
actually contains, and update this page from what it reports.

## Drift risk

This is an **undocumented internal format** that we depend on for exact billing, and nothing
watches it:

- [`validate-session-schemas`](../../.github/skills/validate-session-schemas/SKILL.md) covers
  Copilot Chat *session* files, Copilot CLI, JetBrains, Claude Code, Gemini CLI, Antigravity
  and OpenCode — **not** these debug logs.
- [`validate-model-pricing`](../../.github/skills/validate-model-pricing/SKILL.md) does read
  them, but only for `attrs.model`, to find models missing a pricing entry. It asserts nothing
  about the token or billing attributes.
- If Microsoft renames `copilotUsageNanoAiu`, `readTokensFromDebugLog()` keeps returning a
  result, `copilotNanoAiu` silently becomes `0`, and every affected session quietly falls back
  to estimated pricing. No test fails and no error surfaces.

The `discover-debug-log-schema` skill exists to close that gap: run it after a Copilot Chat
update to confirm the five attributes above are still present.

## References

- [`discover-debug-log-schema` skill](../../.github/skills/discover-debug-log-schema/SKILL.md) — enumerate this format from real logs
- [COPILOT-CLI-OTEL-EXPORT.md](../COPILOT-CLI-OTEL-EXPORT.md) — the CLI's OTel export and its `nano_aiu`
- [VSCODE-VARIANTS.md](VSCODE-VARIANTS.md) — which VS Code roots are searched
- [vscode-copilot-chat agent monitoring docs](https://github.com/microsoft/vscode-copilot-chat/blob/main/docs/monitoring/agent_monitoring.md)

---

*Provenance: this page was written after reviewing
[petender/GitHubCopilotDashboard](https://github.com/petender/GitHubCopilotDashboard), a
self-hosted Grafana stack for Copilot telemetry. Its own approach (a five-container
Docker stack fed by an opt-in OTLP export) is not a fit for this project, but reading it
prompted the check that turned up this undocumented path.*
