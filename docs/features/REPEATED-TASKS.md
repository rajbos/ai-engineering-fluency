# Skill Suggestions — repeated-task detection across sessions

The **Skill Suggestions** section in the Usage Analysis view (Coaching → Insights tab) finds tasks
you keep prompting for manually — the same kind of request typed at the start of multiple sessions —
and surfaces them as candidates for a reusable **skill**, prompt file, or custom agent. A repeated
task is the strongest signal that a workflow has stabilized enough to be captured once and reused.

## How it works

1. **Capture**: the session analysis pipeline stores each session's **first user prompt**
   (truncated to 500 chars) as `SessionUsageAnalysis.firstUserPrompt`, inside the normal per-session
   cache (`CACHE_VERSION` 66). No extra parsing — the text is taken from the turn data the pipeline
   already builds.
2. **Cluster**: `src/repeatedTasks.ts` (`detectRepeatedTasks`) normalizes each prompt (lowercase,
   punctuation stripped, English stopwords and short tokens removed) and clusters greedily by
   Jaccard similarity on token sets (`PROMPT_SIMILARITY_THRESHOLD = 0.5`). Each cluster's centroid is
   the strict-majority token set of its members, which keeps clusters stable as they grow.
3. **Report**: `buildRepeatedTaskReport()` in `src/repeatedTasks.ts` maps the parsed sessions
   (first prompt, file, title, last interaction or file mtime, repository shortened by
   `repoDisplayName()`) to clustering input and clusters across **all** of them (cross-repository on
   purpose — tasks like "create the PR" repeat across repos). Clusters with at least
   `MIN_CLUSTER_SIZE = 2` sessions are returned largest first, with `minClusterSize` and
   `sessionsScanned` (sessions whose first prompt survives normalization, i.e. excluding the
   prompts listed under "What is excluded"), as `UsageAnalysisStats.repeatedTasks`; the report is undefined when nothing
   repeats. The VS Code extension and the CLI both call this one function.
4. **Surface**: the webview (`vscode-extension/src/webview/usage/skillSuggestions.ts`) renders one
   card per cluster, five per page, largest first — repetition count, representative (most recent)
   prompt, shared keywords, the skill location the draft would target, and an expandable sessions
   table (title, date, repository) whose **Open** button opens that session in the log viewer
   (paged above 10 sessions). The `repeated-task-skill-candidate` insight fires when a cluster
   reaches 3 sessions and links to the section.
5. **Create skill with Copilot**: each card drafts a Copilot Chat prompt (agent mode, pre-filled
   but not submitted) built by the pure `buildSkillCreationPrompt()` in `src/repeatedTasks.ts`, or
   copies it with **Copy prompt**. The prompt carries the representative prompt, up to three other
   distinct example prompts (`examplePrompts`, truncated the same way), the shared keywords and the
   session/repository counts, and asks the agent to check existing skills first and extend one
   instead of duplicating it. Location rule (`resolveSkillTarget()`): a cluster seen in exactly one
   repository targets a workspace skill under `.github/skills/<name>/`; several (or no) repositories
   target a user-level skill under `~/.copilot/skills/<name>/`. When the single repository is not
   open in VS Code, the card shows the prompt with instructions to open that repository first
   instead of drafting it into the wrong workspace. User prompt text is collapsed onto one quoted
   line so it cannot restructure the instructions; it is a draft precisely because it embeds
   arbitrary user text that the user should review before it runs.

## Recurring tasks: automate, not only a skill

A task that keeps coming back on a rhythm is a candidate for a schedule, not only a skill: a
skill saves re-explaining it, a scheduled run saves starting it at all.

- **Editor per session**: hosts pass each session's editor (`getEditorTypeFromPath()` in the
  extension, `getEditorSourceFromPath()` in the CLI) as `RepeatedTaskSessionSource.editor`;
  `Unknown` is dropped. Each cluster carries `editors`, most sessions first.
- **Recurrence** (`detectRecurrence()` in `src/repeatedTasks.ts`): the sessions' distinct UTC
  days must number at least `MIN_RECURRING_DAYS = 3`, and at least 75% of the gaps between them
  must fit the cadence of the median gap: `daily` (median ≤ 1.5 days, gaps of 1–3 days so
  weekends fit), `weekly` (median 5–9, gaps 4–10), otherwise `regular` (gaps within half to
  double the median). Several sessions on one day, or a burst plus a stray later session, are
  not a schedule. The result is `RepeatedTaskCluster.recurrence` (`cadence`, `activeDays`,
  `typicalGapDays`), absent when the task does not recur.
- **Automation option per editor** (`automationPlatformForEditor()` /
  `resolveAutomationPlatforms()`): Claude editors (`Claude Code`, `Claude Desktop`, ...) map to
  **Claude Code scheduled tasks** (the Scheduled page of the Claude desktop app, or `/schedule`
  for a cloud routine); Copilot hosts (VS Code variants, Copilot CLI/App, Visual Studio,
  JetBrains, Eclipse, ...) map to **GitHub Copilot automations**; anything else gets a generic
  scheduled job (cron, Task Scheduler, scheduled CI) running the agent's CLI non-interactively.
  A cluster used in both Claude and Copilot shows both.
- **Surfaces**: the card shows a 🔁 cadence badge and an "automate it" tip with one line per
  platform, the sessions table has an Editor column, `buildSkillCreationPrompt()` adds a step
  asking the agent to explain how to schedule the skill (without setting it up), the
  `repeated-task-automation-candidate` insight fires for the largest recurring cluster, and
  `skill-suggestions` in the CLI prints `Editors`, `Recurs` and `Automate` lines.

## Scheduled automations

Runs of a scheduled task are not hand-typed prompts, so they are never suggested. They are left
out of `clusters` and `sessionsScanned` and reported in `RepeatedTaskReport.scheduledTasks`,
together with the apps' own inventory of scheduled tasks.

**Recognizing a run**

- **Claude Code scheduled tasks**: the run's first prompt starts with
  `<scheduled-task name="..." file="...">`; `claudeScheduledTaskName()` reads the name.
- **GitHub Copilot automations**: the Copilot app stores each run in `~/.copilot/data.db`
  `workflow_runs`, whose `session_id` is the Copilot CLI session UUID
  (`queryCopilotAutomationRuns()` in `src/copilotAutomationRuns.ts`). Hosts pass the
  automation name as `RepeatedTaskSessionSource.copilotAutomation`.

**The inventory** (`ScheduledTaskDefinition`)

- **Claude desktop** (`src/scheduledTaskSources.ts`): `scheduled-tasks.json` under
  `<config>/claude-code-sessions/<account>/<machine>/` gives each task's cron expression (or
  one-off `fireAt`), enabled flag, working folder, creation time and `lastRunAt`. The sibling
  `local_<id>.json` session metadata marks each run with `scheduledTaskId`, and with `error`
  when it failed. `<config>` is `%LOCALAPPDATA%\Claude-Data\claude_*` on current Windows
  installs (the packaged `LocalCache\Roaming\Claude` on older ones) and
  `~/Library/Application Support/Claude` on macOS.
- **Copilot app** (`queryCopilotAutomations()`): `workflows` gives the name, interval or cron
  expression, enabled flag and last/next run; `projects` the folder and `owner/repo`;
  `workflow_runs` the finished runs (`completed` / `failed`).
- Repositories without GitHub metadata are resolved from the folder's git `origin` remote.

**Health** (`assessScheduledTaskHealth()` in `src/scheduledTasks.ts`, pure and shared)

| Status | Rule | Risk |
|---|---|---|
| `stale` | Enabled, and no run for more than `STALE_AFTER_DAYS` (30) days — or never run and created more than 30 days ago | Yes |
| `failing` | Fewer than half of the last `RECENT_RUN_LIMIT` (10) runs succeeded, with at least 3 runs | Yes |
| `healthy` | Enabled and running | — |
| `disabled`, `one-off`, `manual`, `never-run` | Turned off, a single scheduled run, started by hand only, or new | — |

`mergeScheduledTasks()` joins the inventory with the runs seen in the analysed sessions, so a task
that stopped running still appears.

**Failed runs and what they cost**: each recorded run carries the session it started (`sessionId`:
the Claude CLI session id from the run's `cliSessionId`, or the Copilot CLI session UUID from
`workflow_runs.session_id`). `attachRunSessions()` matches it to an analysed session by
`sessionIdFromFile()` and adds that session's file, total tokens and cost (exact when the provider
reports it, else estimated from model pricing). Scheduled-run sessions are parsed for this even when
they are older than the 30-day stats window.

**Surfaces**

- **Insights tab → Scheduled automations**: one table of every task — where it runs, repository,
  schedule, last run, recent success and status; at-risk tasks sort first and are counted in the
  title (`vscode-extension/src/webview/usage/scheduledAutomations.ts`). Below it, **Failed runs**
  lists each failed recent run with its date, tokens and cost, and an Open button for its session,
  with the total in the heading.
- **Insights**: `scheduled-automation-at-risk` (a tip naming stale and failing tasks) and
  `scheduled-tasks-running` (a celebration for tasks that ran in the window).
- **AI Readiness**: per repository, the `stale-scheduled-automation` and
  `failing-scheduled-automation` findings (see
  [DARK-FACTORY-READINESS.md](DARK-FACTORY-READINESS.md#anti-patterns)).
- **Skill Suggestions** notes which scheduled tasks replaced sessions in the window.
- **CLI**: `skill-suggestions` prints the inventory with status, repository, schedule, last run and
  recent success, and under each task its failed runs with tokens, cost and session file. `--json` without `--include-prompts` keeps everything except the task names.

**Limitations**: a Claude run that stalls (for example on an unanswered permission prompt) is
not marked failed in the session metadata, so it still counts as a success. The inventory is the
data of this machine only.

## What is excluded

- **Slash commands** (`/fix ...`) — already a reusable invocation, nothing to suggest.
- **Scheduled runs** — already automated; reported as scheduled tasks (see above).
- **Injected context** — Claude Code's `<system-reminder>` blocks (worktree notices, linked
  session status) are removed from the prompt first (`stripInjectedContext()`): they repeat
  verbatim across unrelated sessions and would otherwise cluster them together.
- **Short or content-free prompts** ("ok thanks", "continue") — no task signal.
- Prompts that reduce to only stopwords after normalization.

## Design notes and limitations

- Token-set similarity is deliberately cheap (no embeddings, no LLM calls) and runs in-memory over
  the already-cached prompts. It catches lexical repetition ("run the tests and fix the failures")
  but not paraphrases ("make the test suite green") — that is the intended trade-off for a local,
  zero-cost heuristic; a future version could tighten clusters with model assistance on demand.
- First prompts are stored only in the local extension cache and shown only in the local webview
  and the CLI; nothing is sent anywhere, and the report is never part of the sharing-server upload.
- **CLI**: `ai-engineering-fluency skill-suggestions` prints the report; its `--json` output omits
  prompt text, prompt-derived keywords and session titles unless `--include-prompts` is passed. `usage-analysis --json`
  includes `repeatedTasks` only with `--repeated-tasks`. Other hosts (desktop, Visual Studio,
  JetBrains) do not forward the report to their usage view yet. See
  [docs/cli/README.md](../cli/README.md#skill-suggestions--repeated-tasks).
- Tunables live at the top of `src/repeatedTasks.ts` (similarity threshold, cluster size, stopword
  list) and are expected to be adjusted as real usage data comes in.

## Tests

- `src/test/copilotAutomationRuns.test.ts` — reading automation runs and the automation inventory from `data.db` fixtures.
- `src/test/scheduledTasks.test.ts` — health rules, merging, readiness findings and repository matching.
- `src/test/scheduledTaskSources.test.ts` — reading Claude desktop scheduled tasks and their runs from a config-dir fixture.
- `vscode-extension/test/unit/webview-scheduledAutomations.test.ts` — the Scheduled automations table and its sanitizer.
- `src/test/repeatedTasks.test.ts` — normalization, injected-context stripping, scheduled runs, similarity, clustering,
  ordering, truncation, exclusions, example prompts, the skill location rule, the skill prompt, and
  the shared report builder (`buildRepeatedTaskReport`, `toRepeatedTaskInput`, `repoDisplayName`).
- `vscode-extension/test/unit/webview-skillSuggestions.test.ts` — section rendering and escaping,
  suggestion paging and clamping, the sessions table and its open buttons, and click wiring.
- `cli/src/test/skillSuggestions.test.ts` — the CLI builds the report from real session files only
  when asked, and `skill-suggestions --json` redacts prompts unless opted in.
- `vscode-extension/test/unit/insightsEngine.test.ts` — the `repeated-task-skill-candidate`
  insight thresholds and the `repeated-task-automation-candidate` insight.
