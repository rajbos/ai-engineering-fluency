---
title: Copilot CLI OpenTelemetry File Export
created: 2026-07-12
updated: 2026-07-12
status: active
type: reference
tags: [copilot-cli, opentelemetry, otel, token-usage, setup]
---

# Copilot CLI OpenTelemetry File Export

GitHub Copilot CLI can export OpenTelemetry (OTel) traces and metrics to a local JSON-lines file. The exported spans follow the [OTel GenAI Semantic Conventions](https://opentelemetry.io/docs/specs/semconv/gen-ai/) and carry **exact token counts** (`gen_ai.usage.*` attributes) for every LLM call, plus the model name, session id, and Copilot premium-request/AI-credit cost.

Verified against Copilot CLI **1.0.70** on Windows (the authoritative reference is `copilot help monitoring`).

## Why this matters for this project

The Copilot CLI adapter ([copilotCliAdapter.ts](../src/adapters/copilotCliAdapter.ts)) currently reads `~/.copilot/session-state/events.jsonl` and `session-store.db` and has to work with whatever those formats expose. The OTel export gives, per LLM call:

| Attribute | Meaning |
|---|---|
| `gen_ai.usage.input_tokens` | Exact input tokens |
| `gen_ai.usage.output_tokens` | Exact output tokens |
| `gen_ai.usage.cache_creation.input_tokens` | Cache-creation tokens |
| `gen_ai.usage.cache_read.input_tokens` | Cache-read tokens |
| `gen_ai.request.model` / `gen_ai.response.model` | Model id (e.g. `claude-sonnet-5`) |
| `gen_ai.conversation.id` | Copilot CLI session id (matches `--resume` id) |
| `github.copilot.cost` | Premium-request cost of the call |
| `github.copilot.nano_aiu` | AI credits in nano-units (divide by 1e9; `8374400000` = 8.3744 credits, matching the "AI Credits 8.37" footer the CLI prints) |

This is the same data source the [ccusage](https://github.com/ccusage/ccusage) project uses for exact (rather than estimated) Copilot CLI token accounting. A future adapter in this project could read these files the same way.

**Limitation:** only sessions started (or resumed) with the environment variables below produce OTel data. Historical sessions cannot be backfilled.

## How to enable

Three environment variables control the file export. They must be set **before** the `copilot` process starts:

| Variable | Value | Notes |
|---|---|---|
| `COPILOT_OTEL_ENABLED` | `true` | Explicit enable (default `false`) |
| `COPILOT_OTEL_EXPORTER_TYPE` | `file` | Alternative is `otlp-http` (default) |
| `COPILOT_OTEL_FILE_EXPORTER_PATH` | path to a `.jsonl` file | Setting this alone already auto-enables OTel and auto-selects the `file` exporter, so strictly only this one is required — the other two just make intent explicit |

The conventional output directory is `~/.copilot/otel/` (create it first; the CLI creates the file but expects the directory to exist).

### File path: static vs per-session

- **Static path** (e.g. `~/.copilot/otel/copilot-otel.jsonl`): set once, persistently. All sessions append to one file. Records carry `gen_ai.conversation.id`, so sessions can still be told apart when parsing. Simplest option and the recommended default.
- **Per-session timestamped path** (e.g. `copilot-otel-20260712-154500.jsonl`): one file per shell/session, matching the layout ccusage expects by default. Requires generating the path in each shell (e.g. via the PowerShell profile), because a persistent env var cannot contain a fresh timestamp.

### Windows (PowerShell)

Persistent, static-path setup (run once; applies to all **new** terminals):

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.copilot\otel" | Out-Null
[Environment]::SetEnvironmentVariable('COPILOT_OTEL_ENABLED', 'true', 'User')
[Environment]::SetEnvironmentVariable('COPILOT_OTEL_EXPORTER_TYPE', 'file', 'User')
[Environment]::SetEnvironmentVariable('COPILOT_OTEL_FILE_EXPORTER_PATH', "$env:USERPROFILE\.copilot\otel\copilot-otel.jsonl", 'User')
```

Alternative: per-session timestamped files via the PowerShell profile. Skip the persistent `COPILOT_OTEL_FILE_EXPORTER_PATH` above and add this to `$PROFILE` instead:

```powershell
# Copilot CLI OTel export: one file per shell session
$env:COPILOT_OTEL_ENABLED = 'true'
$env:COPILOT_OTEL_EXPORTER_TYPE = 'file'
$env:COPILOT_OTEL_FILE_EXPORTER_PATH = "$env:USERPROFILE\.copilot\otel\copilot-otel-$(Get-Date -Format 'yyyyMMdd-HHmmss').jsonl"
```

One-off (current shell only, no persistence):

```powershell
$env:COPILOT_OTEL_FILE_EXPORTER_PATH = "$env:USERPROFILE\.copilot\otel\copilot-otel.jsonl"
copilot
```

### Unix shells (bash/zsh)

Add to `~/.bashrc` / `~/.zshrc`:

```bash
mkdir -p ~/.copilot/otel
export COPILOT_OTEL_ENABLED=true
export COPILOT_OTEL_EXPORTER_TYPE=file
export COPILOT_OTEL_FILE_EXPORTER_PATH=~/.copilot/otel/copilot-otel.jsonl
# or per-session: ~/.copilot/otel/copilot-otel-$(date +%Y%m%d-%H%M%S).jsonl
```

## What lands in the file

Each line is one JSON object with a `type` field:

- `type: "span"` — trace spans: `invoke_agent` (one per agent interaction) and `chat <model>` (one per LLM API call, carrying the `gen_ai.usage.*` attributes), plus `execute_tool <tool>` when tools run.
- `type: "metric"`-shaped records — histograms/counters: `gen_ai.client.token.usage`, `gen_ai.client.operation.duration`, `gen_ai.invoke_agent.duration`, `github.copilot.agent.turn.count`, and others.

Example captured `chat` span (Copilot CLI 1.0.70, trimmed — `gen_ai.tool.definitions`, `events`, and timing attributes omitted):

```json
{
  "type": "span",
  "traceId": "dda1f69cea34629f06b0bc58ea22ba98",
  "spanId": "bcdf9e95bfef42e8",
  "parentSpanId": "b2d97aa902825620",
  "name": "chat claude-sonnet-5",
  "kind": 2,
  "startTime": [1783864095, 237981400],
  "endTime": [1783864097, 548405700],
  "attributes": {
    "gen_ai.operation.name": "chat",
    "gen_ai.provider.name": "github",
    "gen_ai.request.model": "claude-sonnet-5",
    "gen_ai.conversation.id": "a19abe35-b44e-4713-bf70-27f015393772",
    "gen_ai.request.stream": true,
    "gen_ai.response.finish_reasons": ["stop"],
    "gen_ai.usage.input_tokens": 33482,
    "gen_ai.usage.output_tokens": 4,
    "gen_ai.usage.cache_creation.input_tokens": 33480,
    "gen_ai.response.model": "claude-sonnet-5",
    "gen_ai.response.id": "msg_011CcxGXGsjU23okBYuXUDi1",
    "github.copilot.cost": 1.0,
    "github.copilot.nano_aiu": 8374400000.0,
    "github.copilot.initiator": "user",
    "github.copilot.turn_id": "0"
  },
  "status": { "code": 0 },
  "resource": {
    "attributes": { "service.name": "github-copilot", "service.version": "1.0.70" },
    "schemaUrl": "https://opentelemetry.io/schemas/1.43.0"
  },
  "instrumentationScope": { "name": "github.copilot", "version": "1.0.70" }
}
```

Notes:

- Timestamps are `[unixSeconds, nanoseconds]` pairs.
- By default **no prompt/response content** is captured — only metadata. (`OTEL_INSTRUMENTATION_GENAI_CAPTURE_MESSAGE_CONTENT=true` would add full prompts, responses, and tool arguments; leave it off unless you specifically need it, since it writes code and prompt content to disk.)
- The file is append-only JSONL; the CLI flushes on session end, and reasoning-token attributes (`gen_ai.usage.*` variants) appear only for models/calls that report them.

## Verify it's working

1. Open a **new** terminal (persistent env vars don't reach already-open shells).
2. Confirm the vars are visible: `Get-ChildItem env:COPILOT_OTEL*` (PowerShell) or `env | grep COPILOT_OTEL`.
3. Run a short session: `copilot -p "Reply with only the word ok"`.
4. Check the output file exists and contains `chat` spans:

```powershell
Get-Content "$env:USERPROFILE\.copilot\otel\copilot-otel.jsonl" |
  ConvertFrom-Json |
  Where-Object { $_.type -eq 'span' -and $_.name -like 'chat*' } |
  ForEach-Object { $_.attributes } |
  Select-Object 'gen_ai.response.model', 'gen_ai.usage.input_tokens', 'gen_ai.usage.output_tokens', 'gen_ai.conversation.id'
```

```bash
grep -o '"gen_ai.usage[^,]*' ~/.copilot/otel/copilot-otel.jsonl
```

## How to turn it off

Remove the variables (or set `COPILOT_OTEL_ENABLED=false` — note that `COPILOT_OTEL_FILE_EXPORTER_PATH` alone auto-enables OTel, so the path var must be removed too):

```powershell
[Environment]::SetEnvironmentVariable('COPILOT_OTEL_ENABLED', $null, 'User')
[Environment]::SetEnvironmentVariable('COPILOT_OTEL_EXPORTER_TYPE', $null, 'User')
[Environment]::SetEnvironmentVariable('COPILOT_OTEL_FILE_EXPORTER_PATH', $null, 'User')
```

```bash
# remove the export lines from ~/.bashrc / ~/.zshrc, then in open shells:
unset COPILOT_OTEL_ENABLED COPILOT_OTEL_EXPORTER_TYPE COPILOT_OTEL_FILE_EXPORTER_PATH
```

Already-running sessions keep their startup configuration either way.
