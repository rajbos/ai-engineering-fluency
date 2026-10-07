# Per-tool execution stats: reliability, latency, MCP health, cost-vs-speed

## Context

Session logs already record, per tool call, whether it failed and when it started
and finished. Nothing in the analysis layer kept that: `ToolCallUsage` held call
counts and (for Copilot CLI only) output tokens, `McpToolUsage` held call counts
per server, and the Copilot CLI parser paired `tool.execution_start` with
`tool.execution_complete` by `toolCallId` only to count edit LOC.

Four panels become possible once that data is kept:

| Panel | Needs |
|---|---|
| Tool execution reliability | success vs. failure count per tool |
| Tool latency profile | p50 / p95 observed duration per tool |
| MCP server health | call count and failure share per server |
| Cost vs speed map | p50 latency × tokens per call × call count, coloured by tool kind |

A probe of the logs on a developer machine (aggregates only, no prompt or result
text) confirmed the raw material exists:

| Source | Paired calls | Latency | Failure flag |
|---|---|---|---|
| Copilot CLI (`~/.copilot/session-state/**/events.jsonl`) | ~68k, 99.9 % paired by `toolCallId` | ISO `timestamp` on both events | `data.success === false` (2.6 %), plus `data.error.{message,code}` |
| Claude Code (`~/.claude/projects/**/*.jsonl`) | ~20.6k `tool_use` / `tool_result` paired by `tool_use_id` | message timestamps (`toolUseResult.durationMs` is present on < 1 %) | `tool_result.is_error` (3.6 %) |
| VS Code Copilot Chat debug logs (`workspaceStorage/*/GitHub.copilot-chat/debug-logs/*/main.jsonl`) | ~1.8k `tool_call` events | `dur` | `status`, `attrs.error` |

Copilot CLI additionally reports `data.mcpServerName` / `data.mcpToolName` on the
start event of MCP calls, which is how per-server attribution is done without
guessing from the tool name.

## Decisions

**Store additive records, never averages or percentiles.** Period aggregation
(`mergeUsageAnalysis`), the session cache, and the backend rollups
(`mergeJsonMetrics` sums `toolCallsJson` generically) all merge by addition. A
stored average or percentile would silently become wrong after the first merge.

**Latency is a log-spaced histogram** (`src/latencyHistogram.ts`): bucket `i`
counts durations in `[2^i, 2^(i+1))` ms, 23 buckets (1 ms … ~70 min, last is
overflow), plus `count` and `sumMs`. p50/p95 are derived at read time by
log-interpolating inside the bucket that holds the target rank — accurate to a
factor of two, which is what a log-axis chart needs, at ~25 integers per tool.
Merging tolerates bucket arrays of differing length so a future bucket-count
change does not invalidate old entries.

**Latency means observed duration.** The start→complete delta includes
permission prompts, queueing and user wait time (`read_powershell` has a p50 of
~30 s locally for exactly this reason). UI labels must say "observed execution
duration", not "tool speed".

**Only an explicit flag is a failure.** `success === false` (Copilot CLI /
JetBrains) and `is_error === true` (Claude Code). A missing flag — older schema
versions — is not evidence either way. Starts with no matching complete event
(aborted sessions) record nothing; they are the raw material for an
"abandoned" outcome later, not failures.

**Fields are optional extensions of the existing types** (`ToolCallUsage.
failuresByTool` / `latencyByTool`, `McpToolUsage.failuresByServer` /
`latencyByServer`). Old cache entries, and editors whose format has no flag or
timestamps, simply lack them; readers must treat absence as "no data", not zero.

**One writer.** `recordToolOutcome()` in `src/usageAnalysis.ts` is the only
function that touches the four maps, so every session format that gains a flag
or timestamps funnels through the same bookkeeping and `__proto__`-style key
guard.

**Tool kind is classified in one place** (`src/toolKind.ts`,
`classifyToolKind()` → `builtin | mcp | subagent | skill`). The signals existed
but were scattered: MCP prefixes in `workspaceHelpers.isMcpTool`, delegation
names in `taskClassification.DELEGATION_TOOL_PATTERN`, the `Skill` / `skill` /
`__slash__` wrappers in the Claude Code and Copilot CLI parsers, and Copilot
CLI's `<server>-mcp-server-<tool>` naming that `isMcpTool` does not match.

**Cache version bump.** `CopilotTokenTracker.CACHE_VERSION` 75 → 76. A
mtime/size hit skips re-analysis, so without the bump existing entries would
never gain the new fields.

## Phases

### Phase 1 — model, histogram, Copilot CLI / JetBrains (done)

- `src/latencyHistogram.ts`, `src/toolKind.ts` (new).
- `src/types.ts`: `LatencyHistogram`, the four optional fields; mirrored in
  `vscode-extension/src/webview/shared/types.ts`.
- `src/usageAnalysis.ts`: `recordToolOutcome()`; the Copilot CLI pending-call
  map now keeps `startedAt` and `mcpServer` from the start event;
  `_asuHandleToolComplete` records outcome before the existing LOC / output-token
  logic; `mergeUsageAnalysis` sums the new maps via `_muaMergeToolOutcomes`.
- `vscode-extension/src/extension.ts`: cache version 76.
- Tests: `latencyHistogram.test.ts`, `toolKind.test.ts`, two new cases in
  `usageAnalysis.test.ts` (synthetic JSONL covering success, explicit failure,
  zero-delta, MCP server attribution, missing flag, missing timestamp, orphaned
  start; and merge additivity with an old-shape entry).
- `docs/logFilesSchema/session-file-schema.json`: `tool.execution_start` /
  `tool.execution_complete` `usedBy` updated.

Verified against local logs via the CLI: 88 tools with latency samples, 43 with
failures, two MCP servers with per-server counts.

### Phase 2 — Claude Code / Claude Desktop adapters

In `claudeCodeAdapter.ts` (and `claudeDesktopAdapter.ts`), keep a
`Map<tool_use.id, {name, startedAt}>` while iterating messages; on a
`tool_result` block call `recordToolOutcome(…, !is_error, msgTimestamp −
startedAt)`, deriving the server from the `mcp__server__tool` prefix. Extend
`outputTokensByTool` here too so the cost-vs-speed map is not Copilot-only.

### Phase 3 — UI

Usage Analysis › Tools & Integrations (`vscode-extension/src/webview/usage/main.ts`,
`#tab-panel-tools`). Four sections, top-N tools by calls, rendered with the
lazily imported Chart.js already used by the Efficiency view (log-scale bar +
bubble are built in), with a plain table fallback when the maps are absent.
Register a `state` per section in `.github/skills/visual-view-diff/views.config.json`,
add l10n keys + `l10n.test.ts` assertions, run `check:contract`,
`check:interaction` and `visual:diff`, and add a What's New catalog entry.

### Phase 4 — VS Code Copilot Chat debug logs, other adapters

The debug-log `tool_call` event (`dur`, `status`, `attrs.error`) is the only
source for VS Code Chat tool latency; nothing reads it today
(`tokenEstimation.ts` parses only `llm_request`). It is per workspace, not per
session file, so decide between folding by `sid` or a workspace-level bucket
before wiring it in `vscode-extension/src/analysis/sessionFileAnalyzer.ts`.
OpenCode/Kilo (`time.start` on tool parts) and Hermes (`tool_call_id` pairing
in `buildTurns`) can adopt `recordToolOutcome` one adapter at a time.

### Phase 5 — workflow-pathway Sankey (deferred)

Session → mode → tool kind → outcome needs a per-session joint record and a
definition of "abandoned" (candidate: session ends on an unpaired tool start).
Write that definition down before building.

## Consequences

- Sync payloads grow by ~25 integers per distinct tool per session
  (`syncService.ts` serialises `toolCalls` wholesale into `toolCallsJson`);
  check row size against the storage limit once Phase 2 widens coverage.
- All new fields are counts and durations keyed by tool / server name. No prompt
  or result text is stored, so the sharing-server data contract is unaffected
  and no skill `SECURITY.md` changes.
- The CLI's `usage-analysis --json` output gains the four optional keys; the
  Visual Studio and JetBrains hosts ignore unknown keys.
- Known pre-existing gap, out of scope here: `_asuHandleMcpToolEvent` keys on
  `data.mcpServer`, but Copilot CLI writes `data.mcpServerName`, so Copilot CLI
  MCP calls are counted under `toolCalls.byTool` rather than `mcpTools.byServer`.
  The new `failuresByServer` / `latencyByServer` read `mcpServerName` directly
  and are correct regardless.
