---
title: VS Code Copilot Chat Debug Log Format
created: 2026-09-03
updated: 2026-09-05
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

JSON-lines. Verified against a real machine's logs (270 files, 10 sampled, 1,726 lines) via the
[`discover-debug-log-schema`](../../.github/skills/discover-debug-log-schema/SKILL.md) skill.
Every line shares a common envelope, then a `type`-specific `attrs` payload:

| Field | Type | Meaning |
|---|---|---|
| `type` | string | Event type — see the table below |
| `sid` | string | Session id |
| `spanId` | string | This event's span id |
| `parentSpanId` | string | Parent span id (absent on some root-level events) |
| `ts` | number | Timestamp |
| `dur` | number | **Duration of this span** — present on every event type, not just `llm_request` |
| `status` | string | Outcome (e.g. success/error) |
| `name` | string | Human-readable span name |
| `attrs` | object | Type-specific payload, below |

Eleven event types were observed. **This project currently reads exactly one: `llm_request`.**
Everything else is parsed by nothing:

| Type | Records (sample) | Read by this repo? |
|---|---|---|
| `llm_request` | 278 | **Yes** — the only one |
| `tool_call` | 300 | No |
| `generic` | 286 | No |
| `turn_start` / `turn_end` | 268 each | No |
| `agent_response` | 264 | No |
| `session_start` | 16 | No |
| `hook` | 18 | No |
| `user_message` | 12 | No |
| `discovery` | 10 | No |
| `child_session_ref` | 6 | No |

An earlier version of this page guessed the ignored types were named `request_start` /
`request_end`, sourced from a comment in this repo's own test fixtures rather than a real log.
**That was wrong** — no such types exist. The table above is the verified list.

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

**Also present on every `llm_request` record and read by nothing:** `attrs.ttft`
(time-to-first-token, populated on all 278/278 sampled records — real per-call latency, no OTel
export needed), `attrs.debugName`, `attrs.responseId`, `attrs.maxTokens`, `attrs.temperature` /
`attrs.topP` (only on calls where set), and `attrs.userRequest` / `attrs.inputMessages` /
`attrs.requestOptions` / `attrs.requestShape` / `attrs.systemPromptFile` / `attrs.toolsFile`
(prompt/response content and shape — treat as sensitive, see
[Privacy of a real log](#privacy-of-a-real-log)).

### Other event types worth knowing about

Not parsed by this repo, but real and worth designing toward:

- **`tool_call`** — one per tool invocation, with `dur` (latency), `status`, `attrs.args`,
  `attrs.result`, and `attrs.error` (present on 2/300 sampled — real failures). This is
  full tool-latency-and-outcome data, the debug-log equivalent of the OTel export's
  `execute_tool` spans and `copilot_chat.tool.call.duration` metric — already here, no export
  needed.
- **`turn_start` / `turn_end`** — bracket one agent turn via a shared `attrs.turnId`; each also
  carries its own `dur`.
- **`agent_response`** — the assistant's response per turn; `attrs.reasoning` is present on
  72/264 sampled records (reasoning-model turns).
- **`session_start`** — `attrs.copilotVersion` / `attrs.vscodeVersion`. Useful as a
  schema-version signal: a future schema change would likely correlate with a version bump here.
- **`child_session_ref`** — links a subagent/subtask log back to its parent via
  `attrs.childSessionId` and `attrs.childLogFile`.
- **`hook`**, **`user_message`**, **`discovery`**, **`generic`** — hook execution, the raw user
  prompt, and lower-signal telemetry-shaped records.

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

## Privacy of a real log

Confirmed by running the discovery skill: `llm_request.attrs.userRequest` and
`.inputMessages`, `agent_response.attrs.response`, and `user_message.attrs.content` carry raw
prompt and response text. `tool_call.attrs.args` / `.result` carry tool arguments and output,
which routinely include file contents and paths. Treat any `--include-examples` output, or
this file itself, as sensitive — never paste it into an issue, PR, or chat without redacting
first.

## What we do not read

Our parser matches `type === 'llm_request'` and discards every other line — ten other event
types, per [Format](#format) above, none of them parsed by anything in this repo.

This was **unverified** until run against a real machine: the earlier version of this page
guessed at event type names from a stale test-fixture comment rather than a real log, and
guessed wrong (see the correction in [Format](#format)). Running
[`discover-debug-log-schema`](../../.github/skills/discover-debug-log-schema/SKILL.md) is what
turned "unverified" into the verified table above — re-run it after a Copilot Chat update to
catch drift, and to see whether new event types have appeared.

The clearest opportunity in what's ignored: `llm_request.attrs.ttft` and `tool_call`'s
`dur`/`status` give real latency and tool-outcome data with **zero user configuration** —
the debug log already carries what the OTel export's `time_to_first_token` and
`tool.call.duration` metrics would add. A future feature only needs a parser for two more
event types, not a new data source.

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
