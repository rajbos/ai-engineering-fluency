---
title: Review — petender/GitHubCopilotDashboard
created: 2026-09-03
updated: 2026-09-03
status: active
type: reference
tags: [opentelemetry, otel, vscode-chat, copilot-cli, cost, research]
---

# Review — petender/GitHubCopilotDashboard

Gap analysis of [petender/GitHubCopilotDashboard](https://github.com/petender/GitHubCopilotDashboard),
a self-hosted Grafana stack for GitHub Copilot usage and cost. This note records what
that project surfaces, what is genuinely new to us, and what is worth incorporating.

**Verdict in one line:** ignore the infrastructure; the data source is worth a look, but it
is a *better transport for telemetry we already read*, not a new capability. We already pull
exact tokens and exact AI Units for VS Code Copilot Chat out of the debug log that the same
instrumentation feeds — see [Prior art in this repo](#prior-art-in-this-repo--read-this-first)
before acting on anything here.

## What the project is

A `docker compose` stack: VS Code Copilot Chat exports OTLP → an OTel Collector fans the
three signals out to Tempo (traces), Prometheus (metrics) and Loki (events) → Grafana
renders three dashboards. Roughly 18 files, all config; no application code.

The three dashboards answer three deliberately separated questions:

| Dashboard | Question |
|---|---|
| Actual Cost (your plan) | What am I actually paying GitHub? (seat + AIU overage vs. allowance) |
| Usage Overview | How am I using Copilot? (operations, tokens, models, tools, latency, per-session) |
| Value & Model Comparison | What would this cost at raw model API list prices? (shadow cost, cache savings) |

## Prior art in this repo — read this first

**We already consume VS Code Copilot Chat's OTel instrumentation.** Not through the OTel
*export*, but through the debug log it also feeds, and the distinction matters for every
recommendation below.

`readTokensFromDebugLog()` in [extension.ts](../../vscode-extension/src/extension.ts) reads
`workspaceStorage/<hash>/GitHub.copilot-chat/debug-logs/<sessionId>/main.jsonl`, and
`extractAllTokensFromDebugLog()` in [tokenEstimation.ts](../../src/tokenEstimation.ts) sums
every `llm_request` event's `attrs`:

| Debug-log attribute | What it is |
|---|---|
| `inputTokens` / `outputTokens` / `cachedTokens` | Exact per-call token counts |
| `model` | Per-model breakdown |
| `copilotUsageNanoAiu` | **Copilot AI Units in nano-units** — the unit GitHub bills |

That last one is the same field the dashboard's collector reads off VS Code chat spans as
`copilot_chat.copilot_usage_nano_aiu`; the debug log spells it camelCase. We convert it with
`NANO_AIU_TO_DOLLARS` (`1 / 1e11`, i.e. 1 AIU = $0.01) into `copilotExactCostDollars`, and
[statsHelpers.ts](../../src/statsHelpers.ts) already splits sessions into "exact AIU billing"
and "estimated fallback" buckets.

Upstream explains why the two agree — the debug panel and the OTel export are one
instrumentation pipeline: *"This works even when OTel export is disabled, because the SDK's
internal tracing is always active for the debug panel."* The `captureContent` flag governs
both. The debug log is the always-on serialization; the OTLP/file export is the opt-in one.

**So the honest framing is: we already have exact tokens and exact AIU for VS Code Chat.**
The OTel export is a second, better-specified transport for data we largely already read —
not a new capability. That materially shrinks items 1, 3 and 5 of the plan below relative to
how they first looked.

## The finding that still matters: VS Code Chat has a file-based OTel export

What is genuinely new is the *export* — a documented, versioned, schema-stable channel, where
the debug log is an internal format that can change without notice (see
[COPILOT-CLI-FORMAT-CHANGES.md](../COPILOT-CLI-FORMAT-CHANGES.md) for how that has burned us
on the CLI side).

Per upstream
[`vscode-copilot-chat/docs/monitoring/agent_monitoring.md`](https://github.com/microsoft/vscode-copilot-chat/blob/main/docs/monitoring/agent_monitoring.md):

| Setting | Default | Values |
|---|---|---|
| `github.copilot.chat.otel.enabled` | `false` | Enable OTel emission |
| `github.copilot.chat.otel.exporterType` | `"otlp-http"` | `otlp-http`, `otlp-grpc`, `console`, `file` |
| `github.copilot.chat.otel.otlpEndpoint` | `http://localhost:4318` | Collector endpoint |
| `github.copilot.chat.otel.captureContent` | `false` | Capture prompts/responses/tool args |
| `github.copilot.chat.otel.outfile` | `""` | File path for JSON-lines output |

The dashboard project uses `otlp-http` because it *has* a collector. We would not need one —
the `file` exporter writes JSONL that [copilotCliOtel.ts](../../src/copilotCliOtel.ts) is
already shaped to parse (`invoke_agent` / `chat` / `execute_tool` spans):

```jsonc
{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "file",
  "github.copilot.chat.otel.outfile": "~/.copilot/otel/vscode-chat-otel.jsonl"
}
```

Two settings caveats, from upstream and the dashboard's README:

- Use **User** settings, not workspace settings — the OTel SDK initializes early in VS Code
  startup and workspace settings can load too late.
- It takes effect only after a window reload, and cannot backfill historical sessions.

### What the export adds over the debug log we already read

- **A stable, documented schema** instead of an undocumented internal one.
- **One code path for two producers.** Copilot CLI and VS Code Chat would both arrive as OTel
  spans, instead of the CLI going through `copilotCliOtel.ts` and VS Code through a bespoke
  debug-log parser.
- **Cache and reasoning tokens.** The dashboard's collector reads
  `gen_ai.usage.cache_read.input_tokens`, `cache_creation.input_tokens` and
  `reasoning.output_tokens` from VS Code chat spans. Our debug-log parser only gets a single
  `cachedTokens`, with no creation/read split and no reasoning figure. *Upstream's attribute
  table does not list these for VS Code, so treat them as observed-but-undocumented until
  checked* — the same status as AIU before we found our own code already reading it.
- **The metrics and events below**, which the debug log does not carry at all.

### A units trap worth flagging

Our `NANO_AIU_TO_DOLLARS` treats 1 AIU as **$0.01** (matching `copilotPlans.json`, where AI
credits are $0.01 each). The dashboard's `copilot_cost_aiu_usd` rule multiplies AIU by
**0.04** — the premium-request overage rate. Those are two different billing concepts, and
their config silently conflates them. Do not copy the `0.04` factor without deciding which
unit we mean.

## Metrics the export emits that we track nowhere

Beyond spans, the export emits metrics and events we have no equivalent for. The most
interesting cluster is edit quality:

| Metric | Why it matters here |
|---|---|
| `copilot_chat.edit.survival.four_gram` | Measured 4-gram survival of accepted edits over time |
| `copilot_chat.edit.survival.no_revert` | Measured no-revert survival ratio |
| `copilot_chat.edit.acceptance.count` | accept/reject by source (inline chat, chat editing, hunk, apply_patch) |
| `copilot_chat.chat_edit.outcome.count` | file-level accepted/rejected/saved |
| `copilot_chat.lines_of_code.count` | lines added/removed by accepted agent edits, by language |
| `copilot_chat.user.action.count` | copy / insert / apply / followup |
| `copilot_chat.user.feedback.count` | thumbs up/down |

**Edit survival is the standout.** [darkFactoryReadiness.ts](../../src/darkFactoryReadiness.ts)
and [darkFactorySignals.ts](../../src/darkFactorySignals.ts) currently *infer* acceptance-like
signals from session logs. These metrics are the editor's own measurement of the same thing —
a direct upgrade path for fluency and Dark Factory scoring, not just another chart.

Performance metrics we track nowhere (checked for both the OTel and camelCase spellings):

- `copilot_chat.time_to_first_token` (also on the `chat` span, as an attribute)
- `gen_ai.client.operation.duration` — LLM latency, by model
- `copilot_chat.tool.call.duration` / `copilot_chat.tool.call.count` (with a `success` attribute)
- `error.type` on `chat` and `invoke_agent` spans — an error rate we have no view of

Note that these arrive as OTel *metric* records (histograms/counters), not spans.
`copilotCliOtel.ts` reads spans only, so consuming them is new parsing work, not a free win.

## Ideas worth borrowing (framing, not code)

1. **Separate "your bill" from "shadow cost."** The project keeps plan-aware actual cost
   (seat + AIU overage) on one dashboard and raw-API-list-price cost on another, and labels
   the second *"shadow / not your bill."* We compute both kinds of number but present them
   together. The distinction is worth making explicit in our UI: tokens are usage, not spend;
   on paid plans the only variable cost is premium-request/AIU overage.
2. **Unlimited allowance as a first-class case.** They use a large sentinel (`1e12`) mapped to
   *"∞ Unlimited"*. Our `copilotPlans.json` already models this correctly as
   `monthlyPremiumRequests: null`; the lesson is display-side — an unlimited plan should read
   "Unlimited", not a blank or a huge number.
3. **Straight-line month-end projection:** `used × days_in_month ÷ day_of_month`. Simple,
   honest, and worth showing next to month-to-date rather than only the running total.
4. **The double-counting invariant.** Usage attributes appear on **both** the per-call `chat`
   span and the aggregate `invoke_agent` span; counting both doubles every number. Their
   collector filters to `gen_ai.operation.name == "chat"`.
   [copilotCliOtel.ts](../../src/copilotCliOtel.ts) already does the right thing — this should
   be written down as a shared invariant for any second OTel consumer we add.
5. **Cache savings are not monotonic.** Their README notes net cost must be derived as
   `increase(gross) − increase(savings)`, because a heavily-cached call grows savings faster
   than gross, so a rate over net would be wrong. The same trap applies to any windowed
   net-cost rate we compute.
6. **Session names from the first prompt, with a UUID fallback and a UI toggle.** They extract
   a ≤60-char label out of the first user request and always keep the conversation UUID
   available behind a *"Show sessions as"* switch. Readable session labels make a
   "which task cost the most" table usable.

## What we already do better — do not import

- **Plans.** [copilotPlans.json](../../vscode-extension/src/copilotPlans.json) carries real
  GitHub plan IDs, seat prices, premium-request allotments and AI-credit values, sourced and
  dated. Theirs is a hand-maintained PromQL table whose own comments admit `included_aiu`
  must be calibrated by eye against the billing page.
- **Model pricing.** [src/modelPricing.json](../../src/modelPricing.json) plus the
  `refresh-json-data` skill, versus four models hardcoded as PromQL `vector()` rules.
- **Breadth.** We support ~20 editors and agents; this project covers VS Code Copilot Chat only.
- **Cost attribution, cache accounting, per-session cost, model efficiency** — all already ours.
- **Exact AIU billing for VS Code Chat.** Theirs comes from OTel spans and is offset against a
  hand-calibrated allowance; ours comes from the debug log through `NANO_AIU_TO_DOLLARS` and is
  already wired into the extension's cost numbers with an estimated fallback for sessions that
  lack it.
- **The stack itself.** Five containers (Collector, Tempo, Prometheus, Loki, Grafana), Docker
  Desktop as a prerequisite, and 120-day Prometheus retention is the opposite of our zero-infra,
  read-local-files model. Adopting the *data source* costs a user two settings; adopting the
  *stack* costs them a Docker install.

## Also worth knowing: enterprise-managed OTel export

GitHub shipped
[enterprise-managed OpenTelemetry export for VS Code and CLI](https://github.blog/changelog/2026-07-08-enterprise-managed-opentelemetry-export-for-vs-code-and-cli/)
(July 2026): an org can mandate the collector endpoint centrally, and the managed value takes
precedence over environment variables and user settings (policy → env var → user setting →
default). Two implications for us:

- On managed machines, a user's `outfile` setting may be **overridden**, so a file-export
  feature must detect "OTel is on but not writing where we asked" and say so rather than
  silently reporting no data.
- It is a signal about where the team story is going — worth weighing against our
  `sharing-server` upload path.

## Suggested plan

Ordered by value-to-effort, and rescoped now that the debug-log path above is accounted for.
Nothing here is committed work; step 0 gates the rest.

0. **Document the debug-log AIU path we already have** (small, blocking, and independently
   worth doing). `copilotUsageNanoAiu` and `NANO_AIU_TO_DOLLARS` are load-bearing for every
   "exact cost" number the extension shows for VS Code Chat, and they appear in no document —
   which is how this review initially concluded we had no AIU at all. Add it to
   [TRACKABLE-DATA.md](../TRACKABLE-DATA.md) and give the debug log a schema page under
   [docs/logFilesSchema/](../logFilesSchema/).
1. **Diff the export against the debug log** (small). Enable `exporterType: "file"`, run one
   agent turn, and compare the span attributes against what the debug log gave for the same
   session. The questions worth answering: do the AIU numbers agree, and are
   `gen_ai.usage.cache_*` / `reasoning.output_tokens` populated (the split our debug-log
   parser cannot produce)? Extend `validate-session-schemas` to cover the file.
2. **Document the export** (small). A `docs/VSCODE-CHAT-OTEL-EXPORT.md` mirroring
   [COPILOT-CLI-OTEL-EXPORT.md](../COPILOT-CLI-OTEL-EXPORT.md) — enable, verify, disable, and
   the User-settings/reload caveats.
3. **Read the file as a second, preferred source** (medium, gated on 1). Generalize
   `copilotCliOtel.ts` from "Copilot CLI OTel" to "OTel file export", keyed on
   `gen_ai.conversation.id`, keeping the chat-span-only filter. Frame it as a *precedence*
   change — OTel when present, debug log otherwise — not a new source. Only worth the work if
   step 1 shows the export carries something the debug log does not.
4. **Extend the OTel Delta diagnostics tab** (small, follows 3). It already compares estimated
   vs. exact for Copilot CLI; VS Code Chat rows would compare debug-log exact vs. OTel exact —
   a direct check on whether the two transports agree.
5. **AIU against the plan allowance** (medium, and *not* gated on the export — the debug log
   already supplies the AIU). Show real consumption against `monthlyPremiumRequests` with the
   straight-line projection, and label plan cost separately from shadow API cost. Settle the
   $0.01-vs-$0.04 unit question above first.
6. **Edit-survival and latency metrics** (larger, and the only item where the export is the
   *sole* source). Requires parsing OTel metric records, not just spans. `edit.survival.*`
   feeding Dark Factory readiness is the part with the highest ceiling.

## References

- [petender/GitHubCopilotDashboard](https://github.com/petender/GitHubCopilotDashboard)
- [vscode-copilot-chat — agent monitoring docs](https://github.com/microsoft/vscode-copilot-chat/blob/main/docs/monitoring/agent_monitoring.md)
- [Monitor agent usage with OpenTelemetry (VS Code docs)](https://code.visualstudio.com/docs/agents/guides/monitoring-agents)
- [Enterprise-managed OpenTelemetry export for VS Code and CLI](https://github.blog/changelog/2026-07-08-enterprise-managed-opentelemetry-export-for-vs-code-and-cli/)
- [OTel GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- Internal: [COPILOT-CLI-OTEL-EXPORT.md](../COPILOT-CLI-OTEL-EXPORT.md), [TRACKABLE-DATA.md](../TRACKABLE-DATA.md), [src/copilotCliOtel.ts](../../src/copilotCliOtel.ts)
