# OpenAI Codex CLI session format

Codex CLI (https://github.com/openai/codex, Rust `codex-rs`) stores its data under
`$CODEX_HOME` (default `~/.codex` on every platform, including Windows).

Adapter: `src/adapters/codexCliAdapter.ts` (id `codexcli`, display name **Codex CLI**),
data access: `src/codexcli.ts`.

## Storage layout

| Path | Contents |
|---|---|
| `~/.codex/sessions/YYYY/MM/DD/rollout-<ISO-ts>-<uuid>.jsonl` | Rollout session files (primary source) |
| `~/.codex/archived_sessions/...` | Same layout, after the user archives a thread |
| `~/.codex/state_<N>.sqlite` | SQLite state DB (`sqlx` migrations; N is the schema generation — `state_5.sqlite` as of CLI ~0.115). Contains the `threads` registry |
| `~/.codex/logs_<N>.sqlite` | Diagnostic tracing only (`logs` table: ts, level, target, feedback_log_body, thread_id). **No usage data** — not read by the adapter |
| `~/.codex/models_cache.json` | Model catalog (`models[].slug` / `display_name`, reasoning levels). Slugs match the model ids used in rollouts/threads, so no mapping is needed |

## `threads` table (state_&lt;N&gt;.sqlite)

Confirmed against a live `state_5.sqlite` (22 sqlx migrations):

```
id TEXT PK, rollout_path TEXT, created_at INTEGER, updated_at INTEGER, source TEXT,
model_provider TEXT, cwd TEXT, title TEXT, sandbox_policy TEXT, approval_mode TEXT,
tokens_used INTEGER, has_user_event INTEGER, archived INTEGER, archived_at INTEGER,
git_sha TEXT, git_branch TEXT, git_origin_url TEXT, cli_version TEXT,
first_user_message TEXT, agent_nickname TEXT, agent_role TEXT, memory_mode TEXT,
model TEXT, reasoning_effort TEXT, agent_path TEXT
```

`rollout_path` points at the thread's rollout file. When that file is missing, the row
alone still provides `tokens_used` (real total), `model`, `title`, `cwd` and timestamps;
the adapter exposes such rows via a virtual path `<state_db>#<thread_id>`
(e.g. `C:\Users\alice\.codex\state_5.sqlite#019d0233-...`), mirroring the
OpenCode/Crush/Devin CLI `db#id` convention.

`created_at`/`updated_at` unit (seconds vs milliseconds) could not be confirmed against
live rows (the observed DB's threads table was empty — Codex had been used through the
`codex app-server` and rollout files had been cleaned up); the adapter treats values
as **seconds** unless > 1e12.

Other tables (`thread_dynamic_tools`, `stage1_outputs`, `jobs`, `agent_jobs`,
`agent_job_items`, `thread_spawn_edges`, `backfill_state`) are not needed for usage
tracking.

## Rollout JSONL format

One JSON object per line: `{ "timestamp": "<ISO 8601>", "type": "<kind>", "payload": {...} }`.

| `type` | Payload |
|---|---|
| `session_meta` | `{ id, timestamp, cwd, originator ("codex_cli_rs"), cli_version, instructions, git }` (first line) |
| `turn_context` | `{ cwd, approval_policy, sandbox_policy, model, effort, summary }` — tracks the active model |
| `response_item` | `{ type: message \| reasoning \| function_call \| function_call_output \| local_shell_call \| custom_tool_call \| web_search_call, ... }`. Messages: `{ role, content: [{type: input_text\|output_text, text}] }` |
| `event_msg` | `{ type: token_count \| user_message \| agent_message \| ... }` |
| `compacted` | history compaction marker |

`token_count` events carry **cumulative** usage in `payload.info.total_token_usage`:
`{ input_tokens, cached_input_tokens, output_tokens, reasoning_output_tokens, total_tokens }`
(plus `last_token_usage` and `model_context_window`). Older builds inline the same fields
directly on the payload. A legacy pre-wrapper format (each line is the raw response item;
bare session-meta first line) also exists; both are handled.

## How the adapter computes stats

- **Discovery**: glob `sessions/` + `archived_sessions/` for `rollout-*.jsonl`, then add
  `threads` rows — resolved to `rollout_path` when the file exists, else virtual DB paths.
  Duplicates are removed by the thread/session uuid embedded in the rollout filename.
- **Tokens**: per-model deltas between successive cumulative `token_count` snapshots
  (clamped at 0 so compaction resets can't go negative); `reasoning_output_tokens` →
  thinking tokens. Fallback: ~4 chars/token estimate over message text. DB-only threads:
  `tokens_used` (attributed to `model` as input tokens — only a single total is stored).
- **Interactions**: `response_item` user messages, excluding system-injected payloads that
  start with tags like `<user_instructions>` / `<environment_context>`. Falls back to
  `event_msg`/`user_message` events for legacy files; DB-only threads report 1 when
  `has_user_event`/`first_user_message` is set.
- **Turns / usage analysis**: user message + following assistant/tool activity per turn;
  tool names from `function_call.name`, `local_shell_call` → `shell`,
  `web_search_call` → `web_search`; model switching from `turn_context`.

## Known limitations

- sql.js reads only the main DB file, so thread rows still in an un-checkpointed `-wal`
  are invisible until Codex checkpoints (same as all sql.js-based adapters).
- On machines where rollout files were removed and the `threads` table is empty (observed
  on one live install), no historical sessions can be recovered — `logs_<N>.sqlite`
  contains thread ids but no usage data.
