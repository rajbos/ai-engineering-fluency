---
name: discover-debug-log-schema
description: Enumerate the real schema of VS Code Copilot Chat's debug logs (workspaceStorage/*/GitHub.copilot-chat/debug-logs/*/main.jsonl) from files on the current machine — every event type and field, flagged by whether this repo reads it — and verify the exact-AIU billing contract the extension depends on is still intact. Use after a Copilot Chat update, when exact costs look wrong or have silently become estimates, or to find event types and fields we could start using.
---

# Discover Debug Log Schema Skill

Reads VS Code Copilot Chat's **debug logs** on this machine and reports what is
actually in them.

The extension reads `copilotUsageNanoAiu` out of these logs to bill VS Code Chat
sessions **exactly** rather than estimating — see
[docs/logFilesSchema/vscode-chat-debug-log-format.md](../../../docs/logFilesSchema/vscode-chat-debug-log-format.md).
That format is undocumented by Microsoft, we parse exactly one of its event types,
and `validate-session-schemas` does not cover it. This skill closes that gap.

## What it answers

1. **Is the billing contract intact?** Are the five `llm_request` attrs that
   `_eatdlProcessLlmRequest()` in `src/tokenEstimation.ts` depends on
   (`inputTokens`, `outputTokens`, `cachedTokens`, `model`, `copilotUsageNanoAiu`)
   still present? This matters because a rename fails **silently**: the parser
   still returns a result, `copilotNanoAiu` becomes `0`, and every affected session
   quietly falls back to estimated pricing. No test fails, no error surfaces.
2. **What are we leaving on the table?** Every event type and field path in the log,
   marked `PARSED`/`IGNORED` per type and `*` per field for what the repo reads
   today. We consume `llm_request` only; `request_start` and `request_end` are known
   to exist and are parsed by nothing. If those carry timings, per-call latency
   would be available with no user configuration — nobody has checked.

## Usage

Run from the repository root. Dependency-free Node, no build step:

```bash
# Default: last 30 days, 10 most-recent logs
node .github/skills/discover-debug-log-schema/discover-debug-log-schema.js

# Every log regardless of age, more files
node .github/skills/discover-debug-log-schema/discover-debug-log-schema.js --days 0 --max 50

# Machine-readable
node .github/skills/discover-debug-log-schema/discover-debug-log-schema.js --json
```

### Options

| Flag | Meaning |
|------|---------|
| `--days N` | Only files modified within the last N days (default 30; `0` = no limit) |
| `--max N` | Analyze at most N most-recent log files (default 10) |
| `--include-examples` | Include truncated example values — **may contain prompts and file paths** |
| `--json` | Emit JSON only |
| `--help` | Usage |

### Exit codes

- `0` — billing contract intact, **or** no debug logs found on this machine
- `1` — `DRIFT`: a field the parser depends on is missing from observed records
- `2` — bad arguments

`NOT_OBSERVED` (no `llm_request` events in the sampled files) is not drift — it
means the window caught no LLM calls. Widen it with `--days 0` before concluding
anything.

## Where it looks

```
<vscode-user>/workspaceStorage/<hash>/<ext-folder>/debug-logs/<sessionId>/main.jsonl
```

across every VS Code variant the extension supports (Code, Insiders, Exploration,
VSCodium, Cursor, and the `.vscode-server*` remote roots) and all four extension-folder
spellings (`GitHub.copilot-chat`, `github.copilot-chat`, `GitHub.copilot`,
`github.copilot`) — mirroring `readTokensFromDebugLog()` in
`vscode-extension/src/extension.ts`.

**No logs found** means Copilot Chat has not written any on this machine, not that
the format changed. The script exits `0` in that case so it is safe in CI, where a
runner has no local sessions.

## Privacy

Field **values are never printed by default** — only paths, JSON types and counts.
These logs contain prompts, responses and absolute file paths. Use
`--include-examples` only on your own machine, and never paste that output into an
issue or PR without reading it first.

## Acting on results

- **DRIFT** → exact billing is broken right now. Open a real log, find what the field
  was renamed to, and fix `_eatdlProcessLlmRequest()` in `src/tokenEstimation.ts`
  plus the `CONSUMED` map in this skill's script. Update the format doc.
- **New event types or fields** → check them against the format doc. Anything useful
  (timings, tool durations, edit outcomes) is a candidate for a real feature, and
  needs no user configuration because this log is always written.
- **Either way** → fold what you learn into
  `docs/logFilesSchema/vscode-chat-debug-log-format.md`. That page exists because
  this path was undocumented once already and caused a wrong conclusion.

## Keeping it honest

The `CONSUMED` map at the top of the script is the list of fields the repo actually
reads. If you change what `_eatdlProcessLlmRequest()` parses, change that map in the
same PR — otherwise this skill reports a contract that no longer matches the code.
