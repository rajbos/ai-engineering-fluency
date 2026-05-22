---
title: Antigravity Session Format
created: 2026-05-22
updated: 2026-05-22
status: research
type: format-analysis
tags: [antigravity, google, jsonl, session-logs, schema]
---

# Antigravity Session Format (Observed on Windows)

## TL;DR

Antigravity is Google's closed-source successor to Gemini CLI (released May 2026). It is an
Electron-based desktop IDE that uses Google Gemini models via `cloudcode-pa.googleapis.com`.

The session format is rich enough for the tracker to support:

- session discovery and session list views
- chat turn reconstruction
- tool call timelines (SEARCH_WEB, etc.)
- model reasoning / thinking content display

The transcripts contain **no token counts** and **no model name**. Token tracking requires
estimation from text length. Model attribution is unavailable without reverse-engineering
the API calls.

## Why this document exists

Antigravity replaced the open-source Gemini CLI in June 2026. Its transcript format is
structurally different from Gemini CLI's JSONL format and requires a separate parser.

Key differences:
- No per-turn `tokens` object (Gemini CLI had `tokens.input`, `tokens.output`, etc.)
- No `model` field in any entry
- User messages are XML-wrapped in `<USER_REQUEST>` tags with additional metadata
- Session ID is the folder name, not embedded in the transcript
- Tool calls are represented as `PLANNER_RESPONSE` entries with a `tool_calls` array

## Session storage layout

```
%USERPROFILE%\.gemini\antigravity\
  brain\
    {session-uuid}\
      .system_generated\
        logs\
          transcript.jsonl         ← primary data source
  annotations\
    {session-uuid}.pbtxt           ← has last_user_view_time (text proto)
  conversations\
    {session-uuid}.pb              ← protobuf (binary, skip)
  agyhub_summaries_proto.pb        ← protobuf summary index (skip)
```

The tracker discovers sessions by scanning:
```
%USERPROFILE%\.gemini\antigravity\brain\*\.system_generated\logs\transcript.jsonl
```

## High-level transcript structure

The transcript is newline-delimited JSON (JSONL). Every line is an `AntigravityEntry` object
with the following common fields:

| Field         | Type    | Description                                         |
|---------------|---------|-----------------------------------------------------|
| `step_index`  | number  | Sequential index within the session (may have gaps) |
| `source`      | string  | Who generated this entry (see values below)         |
| `type`        | string  | Entry type (see types below)                        |
| `status`      | string  | Always `"DONE"` in observed data                    |
| `created_at`  | string  | ISO 8601 UTC timestamp, e.g. `"2026-05-22T21:48:22Z"` |
| `content`     | string? | Message body or tool output (optional)             |
| `thinking`    | string? | Model chain-of-thought reasoning (optional)        |
| `tool_calls`  | array?  | Tool call objects (optional)                       |

### Source values

| Source          | Meaning                        |
|-----------------|--------------------------------|
| `USER_EXPLICIT` | User-authored input            |
| `MODEL`         | Gemini model response          |
| `SYSTEM`        | System-generated entry (skip)  |

### Entry types

#### USER_INPUT (`source: "USER_EXPLICIT"`)

```json
{
  "step_index": 0,
  "source": "USER_EXPLICIT",
  "type": "USER_INPUT",
  "status": "DONE",
  "created_at": "2026-05-22T21:48:22Z",
  "content": "<USER_REQUEST>\ntell me more about the antigravity rug pull...\n</USER_REQUEST>\n<ADDITIONAL_METADATA>\nThe current local time is: 2026-05-22T23:48:22+02:00.\n</ADDITIONAL_METADATA>\n<USER_SETTINGS_CHANGE>\n...\n</USER_SETTINGS_CHANGE>"
}
```

The `content` field is XML-structured. The clean user message is inside `<USER_REQUEST>…</USER_REQUEST>`.
Everything outside that tag (ADDITIONAL_METADATA, USER_SETTINGS_CHANGE, etc.) is system metadata
and should be stripped when displaying the message.

#### CONVERSATION_HISTORY (`source: "SYSTEM"`)

```json
{
  "step_index": 1,
  "source": "SYSTEM",
  "type": "CONVERSATION_HISTORY",
  "status": "DONE",
  "created_at": "2026-05-22T21:48:22Z"
}
```

No useful content. Skip entirely.

#### PLANNER_RESPONSE — planning step with tool calls (`source: "MODEL"`)

```json
{
  "step_index": 2,
  "source": "MODEL",
  "type": "PLANNER_RESPONSE",
  "status": "DONE",
  "created_at": "2026-05-22T21:48:22Z",
  "tool_calls": [
    {
      "name": "search_web",
      "args": {
        "query": "\"google antigravity rug pull gemini cli\"",
        "toolAction": "\"Searching the web\"",
        "toolSummary": "\"Web search for Google Antigravity Gemini CLI rug pull\""
      }
    }
  ]
}
```

Intermediate planning steps that dispatch tool calls. The `content` field is absent or empty.

#### PLANNER_RESPONSE — final answer (`source: "MODEL"`)

```json
{
  "step_index": 11,
  "source": "MODEL",
  "type": "PLANNER_RESPONSE",
  "status": "DONE",
  "created_at": "2026-05-22T21:48:44Z",
  "content": "The term **\"Antigravity rug pull\"** refers to...",
  "thinking": "**Formulating Direct Explanation**\n\nOkay, I've got a firm grasp..."
}
```

The final model response for a turn. Has `content` (the visible answer) and optionally `thinking`
(chain-of-thought reasoning). No `tool_calls` on this variant.

#### SEARCH_WEB (`source: "MODEL"`)

```json
{
  "step_index": 3,
  "source": "MODEL",
  "type": "SEARCH_WEB",
  "status": "DONE",
  "created_at": "2026-05-22T21:48:23Z",
  "content": "Created At: 2026-05-22T21:48:23Z\nCompleted At: 2026-05-22T21:48:27Z\nThe search for \"google antigravity rug pull gemini cli\" returned the following summary:\n..."
}
```

Tool execution result. The `content` string contains timing metadata and the search summary.
This is the result of the preceding `PLANNER_RESPONSE` tool call with `name: "search_web"`.

## Observed session summary

The following numbers were extracted from a real Antigravity session file:

| Metric                | Observed value                           |
|-----------------------|------------------------------------------|
| Session ID            | `13e60289-9ba1-42c0-afa9-7c560b7cc201`  |
| Total JSONL lines     | 11                                       |
| USER_INPUT entries    | 1                                        |
| MODEL entries         | 9 (4 PLANNER_RESPONSE + 4 SEARCH_WEB)   |
| SYSTEM entries        | 1 (CONVERSATION_HISTORY)                |
| Tool calls (total)    | 4 (all `search_web`)                    |
| First timestamp       | `2026-05-22T21:48:22Z`                  |
| Last timestamp        | `2026-05-22T21:48:44Z`                  |
| Input tokens          | **Not available**                        |
| Output tokens         | **Not available**                        |

## Key limitations

### No token counts

Unlike Gemini CLI (which embeds `tokens.input`, `tokens.output`, etc. per assistant turn),
Antigravity stores **no token data** in `transcript.jsonl`. The tracker cannot report
actual token usage for Antigravity sessions. All token fields will show `0`.

### No model name

The model name (e.g. `gemini-3.5-flash`) is **not present** in the transcript. Model
attribution and per-model cost rollups are unavailable. Sessions appear under `unknown`
in model usage reports.

### Session title derivation

There is no explicit `title` field. The session title is derived from the first `USER_INPUT`
entry's `content` with the `<USER_REQUEST>` wrapper stripped.

## Can we show sessions and chat turns?

Yes, with limited fidelity.

### Session list

- File path gives the session ID (UUID folder name)
- First/last `created_at` timestamps give session time range
- First `USER_INPUT` content gives session title
- Turn count from number of `USER_INPUT` entries

### Turn reconstruction

1. Iterate JSONL lines in `step_index` order
2. Each `USER_INPUT` starts a new turn
3. Collect subsequent `MODEL` entries until the next `USER_INPUT`
4. `PLANNER_RESPONSE` with `content` → assistant response text
5. `PLANNER_RESPONSE` with `tool_calls` → tool call list for the turn
6. `SEARCH_WEB` → tool call result (attach to preceding tool call)
7. `PLANNER_RESPONSE.thinking` → chain-of-thought (display separately)

### Content coverage

| Feature                   | Available? |
|---------------------------|-----------|
| User message text         | ✅ (strip XML wrapper) |
| Assistant response text   | ✅ (last PLANNER_RESPONSE.content) |
| Tool call names           | ✅ (PLANNER_RESPONSE.tool_calls[].name) |
| Tool call arguments       | ✅ (PLANNER_RESPONSE.tool_calls[].args) |
| Tool call results         | ✅ (SEARCH_WEB.content) |
| Chain-of-thought thinking | ✅ (PLANNER_RESPONSE.thinking) |
| Token counts              | ❌ Not available |
| Model name                | ❌ Not available |
| Cost estimate             | ❌ Not available (no tokens, no model) |

## Parsing guidance for the tracker

1. Discover session files at `~/.gemini/antigravity/brain/*/..system_generated/logs/transcript.jsonl`
2. Parse as JSONL, one JSON object per line
3. Session ID = UUID folder name directly under `brain/`
4. Session title = first `USER_INPUT` content with `<USER_REQUEST>` tag stripped
5. Start time = `created_at` of first entry
6. End time = `created_at` of last entry
7. Turn count = number of `USER_INPUT` entries
8. Tool call count = sum of `tool_calls[]` arrays across all `PLANNER_RESPONSE` entries
9. Skip `CONVERSATION_HISTORY` entries entirely
10. All token fields are `0` — no estimation fallback available without model info
