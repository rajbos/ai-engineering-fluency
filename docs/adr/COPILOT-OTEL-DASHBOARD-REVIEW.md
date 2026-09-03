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

**Verdict in one line:** ignore the infrastructure, take the data source. The project's
real contribution is that it consumes an OTel channel we do not know about —
**VS Code Copilot Chat's own OpenTelemetry export** — which yields exact token counts
for precisely the source our estimator is weakest on.

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

## The finding that matters: VS Code Chat has a file-based OTel export

We already consume Copilot **CLI** OTel ([COPILOT-CLI-OTEL-EXPORT.md](../COPILOT-CLI-OTEL-EXPORT.md),
[src/copilotCliOtel.ts](../../src/copilotCliOtel.ts), the diagnostics *OTel Delta* tab).
We have **no** equivalent for VS Code Copilot Chat — `grep` for `copilot.chat.otel` across
this repo returns nothing.

VS Code Copilot Chat ships the same capability, configured through settings rather than
environment variables. Per upstream
[`vscode-copilot-chat/docs/monitoring/agent_monitoring.md`](https://github.com/microsoft/vscode-copilot-chat/blob/main/docs/monitoring/agent_monitoring.md):

| Setting | Default | Values |
|---|---|---|
| `github.copilot.chat.otel.enabled` | `false` | Enable OTel emission |
| `github.copilot.chat.otel.exporterType` | `"otlp-http"` | `otlp-http`, `otlp-grpc`, `console`, `file` |
| `github.copilot.chat.otel.otlpEndpoint` | `http://localhost:4318` | Collector endpoint |
| `github.copilot.chat.otel.captureContent` | `false` | Capture prompts/responses/tool args |
| `github.copilot.chat.otel.outfile` | `""` | File path for JSON-lines output |

The dashboard project uses `otlp-http` because it *has* a collector. **We do not need one.**
The `file` exporter writes the same JSONL record shape we already parse:

```jsonc
{
  "github.copilot.chat.otel.enabled": true,
  "github.copilot.chat.otel.exporterType": "file",
  "github.copilot.chat.otel.outfile": "~/.copilot/otel/vscode-chat-otel.jsonl"
}
```

Emitted spans are `invoke_agent`, `chat`, `execute_tool` — the same names, and largely the
same `gen_ai.*` attributes, that [copilotCliOtel.ts](../../src/copilotCliOtel.ts) already
reads off Copilot CLI's export.

### Why this is high value for us

Per [AGENTS.md](../../AGENTS.md), VS Code Chat JSONL is the *delta format* — the one where
`estimateTokensFromJsonlSession().modelUsage` returns `{}` and cost attribution has to go
through `getModelUsageFromSession()`. It is the source where our numbers are most estimated.
The OTel export turns that source into exact per-call ground truth, opt-in, with a parser we
already own.

Two settings caveats, both from upstream's own docs and the dashboard's README:

- Use **User** settings, not workspace settings — the OTel SDK initializes early in VS Code
  startup and workspace settings can load too late.
- The setting only takes effect after a window reload; historical sessions cannot be backfilled.

### Unverified: cache tokens and AI Units on VS Code chat spans

The dashboard's collector config reads four attributes off VS Code chat spans that upstream's
`agent_monitoring.md` does **not** document for VS Code (it documents only
`gen_ai.usage.input_tokens` / `output_tokens` there):

- `gen_ai.usage.cache_read.input_tokens`
- `gen_ai.usage.cache_creation.input_tokens`
- `gen_ai.usage.reasoning.output_tokens`
- `copilot_chat.copilot_usage_nano_aiu` — Copilot AI Units, the unit GitHub actually bills

The Copilot **CLI** export does emit the equivalents (`github.copilot.nano_aiu`,
`gen_ai.usage.cache_*`), which we already parse. So either VS Code gained them and the docs
lag, or the dashboard is reading attributes that are never populated there. **This must be
checked empirically before any cost math depends on it** — see step 1 of the plan below. The
check is cheap: enable the file exporter, run one chat turn, grep the file.

If `copilot_chat.copilot_usage_nano_aiu` is real on VS Code spans, it is a bigger deal than
exact tokens: today we model GitHub spend from tokens × list prices, which is a proxy. AIU is
the billing unit itself, and it would let the extension show *actual* consumption against the
plan allowance already described in
[vscode-extension/src/copilotPlans.json](../../vscode-extension/src/copilotPlans.json).

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

Performance metrics we also do not track (`grep` for `time_to_first_token` returns nothing):

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

Ordered by value-to-effort. Nothing here is committed work; step 1 gates the rest.

1. **Verify what VS Code chat spans actually contain** (small, blocking). Enable
   `exporterType: "file"` on a real machine, run one agent turn, and record which of
   `gen_ai.usage.cache_*`, `gen_ai.usage.reasoning.output_tokens` and
   `copilot_chat.copilot_usage_nano_aiu` are populated. Fold the result into
   [docs/logFilesSchema/](../logFilesSchema/) and extend the `validate-session-schemas` skill
   to cover the file so drift is caught automatically.
2. **Document it** (small). A `docs/VSCODE-CHAT-OTEL-EXPORT.md` mirroring
   [COPILOT-CLI-OTEL-EXPORT.md](../COPILOT-CLI-OTEL-EXPORT.md) — enable, verify, disable, and
   the User-settings/reload caveats.
3. **Read the file** (medium). Generalize `copilotCliOtel.ts` from "Copilot CLI OTel" to
   "OTel file export", keyed on `gen_ai.conversation.id`, and join it to VS Code Chat sessions
   the way the CLI path already joins on session UUID. Keep the chat-span-only filter. This is
   the change that makes VS Code Chat numbers exact.
4. **Extend the OTel Delta diagnostics tab** (small, follows 3). It already compares estimated
   vs. exact for Copilot CLI; adding VS Code Chat rows quantifies our estimator's real error on
   the format we understand least — useful regardless of whether we ship the exact numbers.
5. **Exact AIU against the plan allowance** (medium, gated on 1). If AIU is present, show real
   consumption against `monthlyPremiumRequests` with the straight-line projection, and label
   plan cost separately from shadow API cost.
6. **Edit-survival and latency metrics** (larger). Requires parsing OTel metric records, not
   just spans. Sequence it behind the span work; `edit.survival.*` feeding Dark Factory
   readiness is the part with the highest ceiling.

## References

- [petender/GitHubCopilotDashboard](https://github.com/petender/GitHubCopilotDashboard)
- [vscode-copilot-chat — agent monitoring docs](https://github.com/microsoft/vscode-copilot-chat/blob/main/docs/monitoring/agent_monitoring.md)
- [Monitor agent usage with OpenTelemetry (VS Code docs)](https://code.visualstudio.com/docs/agents/guides/monitoring-agents)
- [Enterprise-managed OpenTelemetry export for VS Code and CLI](https://github.blog/changelog/2026-07-08-enterprise-managed-opentelemetry-export-for-vs-code-and-cli/)
- [OTel GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/)
- Internal: [COPILOT-CLI-OTEL-EXPORT.md](../COPILOT-CLI-OTEL-EXPORT.md), [TRACKABLE-DATA.md](../TRACKABLE-DATA.md), [src/copilotCliOtel.ts](../../src/copilotCliOtel.ts)
