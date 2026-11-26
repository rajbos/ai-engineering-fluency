# Mistral Vibe Desktop Session Schema

Mistral Vibe's **local desktop app** (Vibe Desktop — the same agent as the CLI, run as a local
app instead of in a terminal or inside VS Code) writes sessions to the **unified session
store**, one directory per session under:

```
<VIBE_HOME or ~/.vibe>/logs/session/unified/<session_uuid>/
```

Parsed by `src/mistralvibe.ts` (`MistralVibeDataAccess`) and
`src/adapters/mistralVibeAdapter.ts`; desktop sessions are labelled **"Mistral Vibe Desktop"**
in the UI, distinguished from CLI sessions by `meta.json`'s `runtime_path: "session_api"`.

The unified store is shared with newer Vibe CLI versions (see
[mistral-vibe-session-schema.md](mistral-vibe-session-schema.md) for the legacy
`session_<ts>_<id>/` layout); the on-disk store format is identical, only the writer differs.
All observations below come from Vibe Desktop 3.0.4 (`serverVersion` in `~/.vibe/ui_startup_config.json`)
on Windows, including the currently running session.

## Directory layout

```
unified/
├── .session-index.json          # catalog of all sessions (see below)
└── <session_uuid>/
    ├── meta.json                # session identity + config; NO stats block; the session file path
    ├── CURRENT                  # pointer to the active generation
    ├── journal/<sequence>.jsonl # append-only event journal (see below)
    ├── chunks/<sha256>.json     # checkpointed projection entries (arrays of entry objects)
    ├── generations/<n>/         # per-generation manifests/checkpoints
    │   ├── manifest.json        #   chunk list + sha256, created_at, execution_state
    │   ├── checkpoint.json      #   turn/notification state at checkpoint
    │   ├── projection-state.json
    │   └── runtime-state.json
    └── scheduled-loops.json     # {"format":"vibe.scheduled-loops/v1","loops":[]}
```

`CURRENT` is one JSON line:
`{"generation":"0000000000000001","manifest_sha256":"…","session_id":"…","snapshot_sequence":0,"store_format":"mistral.vibe.unified-session-store/v1","store_format_minor":10}`

## `meta.json` fields

Same identity fields as the legacy layout, plus desktop-app fields. **No `stats` block** —
token usage lives in the journal/index (below).

| Field | Type | Meaning | Read by the parser as |
|---|---|---|---|
| `session_id`, `parent_session_id` | string / null | Session identity; sub-agent sessions point at their parent | index lookup key |
| `start_time`, `end_time` | ISO 8601 string | Session start / last update | `firstInteraction`, `lastInteraction` |
| `environment.working_directory` | string | Project working directory | `workspacePath` |
| `origin_directory` | string / null | Repo origin directory | not read |
| `title`, `title_source` | string / null | Session title (auto-generated until set) | `title` |
| `config.active_model` | string | The single model for the session | model key for token attribution |
| `runtime_path` | string | **`"session_api"`** for sessions written by the desktop app's session API | editor label: "Mistral Vibe Desktop" |
| `project` | `{kind: "local", id: uuid}` | Local project registration (`~/.vibe/local_projects.toml`) | not read |
| `username`, `git_commit`, `git_branch`, `child_sessions`, `loops`, `experiments`, `bumped_at`, `pinned_at`, `archived_at`, `unseen_at`, `seen_at`, `import_provenance`, `created_worktree`, `artifacts`, `worktrees`, `owed_replies`, `skill_pins` | various | Bookkeeping | not read |

## Journal (`journal/<sequence>.jsonl`)

One JSON record per line, hash-chained (`previous_record_sha256` / `record_sha256`,
`recovery_journal_record_version: 1`, monotonically increasing `sequence`). Top-level
`type` values observed:

| Record type | Payload | Used for |
|---|---|---|
| `command_reserved` | `params`: `turn/start` params — `message[]` parts, `injected` (bool), `idempotencyKey`/`client_command_id` | marks injected (steered/queued) user turns |
| `core_input` | `input.command`: a command object; `input.input_id`; `input.determinism.time_unix_ms` | **user turns**: `command.type === "user_message"` with `command.content[]` text parts (each part `_meta.vibe_client_message_id` links back to the `command_reserved`). Other command types: `completion_succeeded`, `tool_succeeded`, `tool_failed`, `hook_completed` |
| `projection_delta` | `payload.delta[]` ops (below) | conversation entries + cumulative token usage |
| `action_intent` / `action_result` | model completion requests/results (`finish_reason`, `parts[].content[].text`) | not read (assistant text is read from projection entries) |
| `callback_registered` / `callback_resolved` | approval/hook callbacks (`kind: "approval"`, …) | not read |
| `receipt_succeeded` | delivery receipts | not read |

### `projection_delta` ops

| Op | Meaning |
|---|---|
| `append_entry` | appends a projection `entry` (see below) |
| `replace_entry` | replaces the projection entry with the same `entry.id` (e.g. an `effect` going from `running` to its settled `state.outputText` / `outcome`) |
| `set_envelope` | sets `state.session.contextUsage` — **cumulative** token usage for the whole session: `{inputTokens, outputTokens, cachedInputTokens, totalTokens}`. The latest non-null value in the journal (scanned newest-first) is the session total, including for a running session |

### Projection entries

`{id, type, createdAt (epoch ms), updatedAt, sessionId, turnId, inputEntryId, relatedEntryId, generationStatus, outcome, …}`

| `type` | Extra fields | Meaning |
|---|---|---|
| `message` | `role: "user" \| "assistant"`, `source` (`turn_start`, `steer`, `harness`), `content: [{type:"text", text}]` | conversation messages. **User entries only appear at checkpoint time (chunks); in the live journal user turns live in `core_input` records** — the parser synthesizes them from there and dedupes by entry id (`_meta.vibe_client_message_id`) |
| `reasoning` | `text`, `summary[]` | model thinking (not rendered) |
| `effect` | `detail.kind` (`"tool"`, `"worktree"`), `detail.toolName`, `detail.input`, `detail.display.settledMessage`, `state.outputText`, `state.status`, `title`, `toolCallId` | tool calls and their results. Only `kind: "tool"` is read |

## `chunks/<sha256>.json`

Each chunk is a JSON **array of projection entries** (checkpointed `append_entry` history,
including user message entries), or a capability checkpoint object
(`{agent_types, hook_bindings, knowledge_folders, skills, tool_groups}`) which the parser
skips. Entries are deduplicated by `id` across chunks and journal.

## `.session-index.json` (unified catalog)

`{"catalog_version":1,"entries":[{…}]}` with one entry per session:

- `identity`: `{session_id, root_session_id, parent_session_id, kind, depth}`
- `key`: `{current_sha256, journal_path, journal_mtime_ns, journal_size}`
- `metadata`: `{active_model, agent_name, approval_policy, cwd, origin_cwd, reasoning_effort, hook_bindings, …}`
- `session`: `{id, contextUsage {cachedInputTokens, inputTokens, outputTokens, totalTokens}, createdAt, updatedAt, preview, status, title, titleSource, tokenUsage}`

Used as the **fallback** for token totals when the journal carries no `set_envelope` usage
(matched by `identity.session_id`).

## What the parser reads (summary)

- `meta.json` → timestamps, title, model, workspace directory, `runtime_path` (desktop label)
- journal `set_envelope` (newest first) → cumulative `contextUsage` → `inputTokens` /
  `outputTokens` / `cachedReadTokens` (cached is already included in input; clamped)
- journal + chunks projection entries → messages/turns/tool calls; `core_input`
  `user_message` records → live user turns and the interaction count (non-injected only)
- `.session-index.json` → token-usage fallback

## Drift detection

The `validate-session-schemas` skill covers this platform (`--platform mistral-vibe`); its
discovery walks both the legacy `session_*/meta.json` and the `unified/<uuid>/meta.json`
layouts. It reports field paths, never values.
