# Devin CLI Session Storage (SQLite)

## Summary

Devin CLI (Cognition Labs) is a **separate tool from the Devin desktop app** (which is a
fork/rebrand of Windsurf — see [devin-windsurf-session-format.md](./devin-windsurf-session-format.md)).
It is an [ACP](https://agentclientprotocol.com) (Agent Client Protocol) based CLI agent.
Its backend binary is internally named "chisel" (log messages reference `chisel_server`,
`chisel_agent`, `chisel_api` crates), confirming a Rust implementation. It authenticates
with a `windsurf-api-key` method id, reflecting the shared Cognition/Codeium lineage even
though the storage format itself is entirely separate from Windsurf's Cascade `.pb` files.

Unlike the Devin desktop app, Devin CLI is integrated as a regular `IEcosystemAdapter`
(`DevinCliAdapter` in `src/adapters/devinCliAdapter.ts`, backed by `DevinCliDataAccess` in
`src/devinCli.ts`) registered in the shared `src/adapters/adapterRegistry.ts` — it is
**not** a hand-rolled special case like Windsurf/Devin-desktop.

## Storage location

All sessions across all projects/working-directories are stored in a single **global**
SQLite database (no per-project registry, unlike Crush's `projects.json`):

| OS | Path |
|---|---|
| Windows | `%APPDATA%\devin\cli\sessions.db` (confirmed on a live install) |
| macOS | `~/Library/Application Support/devin/cli/sessions.db` (inferred — Rust `dirs` crate convention, not verified on a live install) |
| Linux | `$XDG_DATA_HOME/devin/cli/sessions.db`, falling back to `~/.local/share/devin/cli/sessions.db` (inferred, not verified) |

Windows also has a separate `%LOCALAPPDATA%\devin\cli\` directory holding cached
config/model data (`team_settings.bin`, `model_configs*.bin`) — this is **not** session
data and is not read by this integration.

## Virtual path scheme

`<absolute-path-to-sessions.db>#<session-id>`, mirroring the Crush (`crush.db#<uuid>`) and
OpenCode (`opencode.db#ses_<id>`) convention. Example (Windows):

```
C:\Users\alice\AppData\Roaming\devin\cli\sessions.db#3ee22c56-...
```

## Schema

Confirmed via `PRAGMA table_info` / `refinery_schema_history` (16 migrations) on a live
install. **Important caveat: at the time this integration was built, every data table below
was completely empty (0 rows) despite an actively-running Devin CLI ACP server process on
the test machine** — the column list is confirmed, but real example values for
`chat_message` and `cogs_json` could not be observed. See "Known limitations" below.

### `sessions`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT (PK) | Session id, used in the virtual path suffix |
| `working_directory` | TEXT | cwd the session was started in |
| `backend_type` | TEXT | e.g. backend/model provider identifier |
| `model` | TEXT | Model id for the session (no per-message model field exists — see below) |
| `agent_mode` | TEXT | Agent mode identifier |
| `created_at` | INTEGER | Epoch timestamp — **unit (seconds vs ms) unverified**, assumed seconds (see below) |
| `last_activity_at` | INTEGER | Epoch timestamp, same caveat |
| `title` | TEXT (nullable) | Session title |
| `main_chain_id` | INTEGER (nullable) | `node_id` of the head of the active message chain (see message forest below) |
| `shell_last_seen_index` | INTEGER | Shell prompt-history cursor |
| `cogs_json` | TEXT (nullable) | Likely cost/token accounting blob ("cogs" = cost-of-goods-sold), added via the `add_session_cogs` migration. Shape unconfirmed. |
| `workspace_dirs` | TEXT (nullable) | Additional workspace directories |
| `hidden` | INTEGER | 0/1 — archived/deleted sessions |
| `metadata` | TEXT (nullable) | Free-form JSON |

### `message_nodes`

Messages form a **tree**, not a flat list — `parent_node_id` links each node to its
predecessor, and `NULL` marks a root. This happens because editing/regenerating a message
creates a new branch without discarding the old one. `sessions.main_chain_id` identifies
the `node_id` of the head (leaf) of the currently active branch; the adapter walks
`parent_node_id` pointers backwards from that leaf to the root to reconstruct the ordered
"main" conversation, falling back to `created_at` ordering across all nodes when
`main_chain_id` is absent (see `DevinCliDataAccess.buildMainChain`).

| Column | Type | Notes |
|---|---|---|
| `row_id` | INTEGER (PK) | |
| `session_id` | TEXT (FK) | |
| `node_id` | INTEGER | Id within the session's message forest |
| `parent_node_id` | INTEGER (nullable) | `NULL` = root of the forest |
| `chat_message` | TEXT | JSON — shape **inferred from the ACP v2 protocol schema**, not confirmed against live data (see below) |
| `created_at` | INTEGER | Epoch timestamp |
| `metadata` | TEXT (nullable) | |

### `prompt_history`, `tool_call_state`

| Table | Columns | Purpose |
|---|---|---|
| `prompt_history` | `id`, `content`, `timestamp`, `session_id`, `is_shell` | Shell/prompt entries; used as a fallback interaction count when `message_nodes` is empty |
| `tool_call_state` | `session_id`, `tool_call_id`, `tool_call_json`, `tool_call_update_json` | Serialised `acp::ToolCall` / `acp::ToolCallUpdate` — tool name extracted defensively from `title`/`name`/`kind` fields |

`rendered_commits`, `app_state`, `sqlite_sequence`, `refinery_schema_history` are not used
by this integration.

## `chat_message` parsing (best-effort — unconfirmed shape)

No live populated row was available at implementation time. Parsing is inferred from the
[ACP v2 JSON schema](https://github.com/agentclientprotocol/agent-client-protocol) and is
intentionally defensive (`DevinCliDataAccess.parseChatMessage`), handling several plausible
shapes:

- `{ role: 'user' | 'assistant' | 'tool', content: string | ContentBlock[] }`
- `{ sessionUpdate: 'user_message' | 'agent_message' | ..., content: ContentBlock[] }`
  (ACP's own tagged-union `SessionUpdate` wire shape)
- A flat `{ text: string }` fallback

`ContentBlock`s of `type: 'text'` are concatenated to produce the message text. If neither
shape matches, the message contributes no text (but does not throw).

## Token/cost accounting (estimated, not actual API tokens)

The core ACP protocol does not define per-message token counts — its `UsageUpdate` type is
a **context-window snapshot** (`{ used, size }`, tokens currently in context vs. total
window size), not cumulative per-turn input/output billing. The adapter therefore:

1. First probes `sessions.cogs_json` for common field names (`input_tokens`/`prompt_tokens`,
   `output_tokens`/`completion_tokens`, `reasoning_tokens`/`thinking_tokens`, and a
   `used`/`total_tokens` fallback for an ACP-style snapshot) — this is speculative field-name
   guessing, not confirmed against real data.
2. Falls back to a **~4 characters/token estimate** from the concatenated text of all
   `message_nodes.chat_message` entries when no recognised `cogs_json` fields are found
   (the same estimation approach used by `ContinueAdapter`/JetBrains for editors that don't
   persist real API token counts).

Because ACP does not expose a per-message model field, all estimated tokens for a session
are attributed to the single `sessions.model` value — mid-session model switches (if they
occur) cannot be represented.

## Timestamp units

`created_at` / `last_activity_at` are epoch integers. Their unit (seconds vs. milliseconds)
could not be verified against live data (all tables were empty). This implementation
**assumes epoch seconds** (multiplying by 1000 before constructing JS `Date` objects),
consistent with Crush's convention for a similar Rust/SQLite CLI-agent tool. **This should
be re-verified once real session data exists on a machine with populated tables.**

## Known limitations

- **All data tables were empty (0 rows) on the machine this integration was built on**,
  despite an actively-running Devin CLI ACP server process. The `chat_message` and
  `cogs_json` shapes are inferred from the ACP protocol specification, not confirmed
  against real examples. Token counts, model attribution, and turn reconstruction should
  be spot-checked once genuine session data is available.
- Per-turn token attribution (when falling back to text-length estimation) is currently a
  simple length-based split between the user message and the immediately-following
  assistant text — it does not use `cogs_json` even when present, since no live example
  confirmed whether `cogs_json` holds per-turn or only session-level totals.
- Cross-platform paths for macOS/Linux are inferred from Rust `dirs`-crate conventions and
  have not been verified against a live non-Windows install.
