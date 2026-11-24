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

## Scheduled runs: already automated

Runs of a scheduled task are not hand-typed prompts, so they are never suggested. They are
summarized in `RepeatedTaskReport.scheduledTasks` (name, platform, run count, active days, last
run) and left out of `clusters` and `sessionsScanned`.

- **Claude Code scheduled tasks**: the run's first prompt starts with
  `<scheduled-task name="..." file="...">`; `claudeScheduledTaskName()` reads the name.
- **GitHub Copilot automations**: the Copilot app stores automations in `~/.copilot/data.db`
  (`workflows`) and each run in `workflow_runs`, whose `session_id` is the Copilot CLI session
  UUID. `src/copilotAutomationRuns.ts` reads that map (`queryCopilotAutomationRuns()`; the
  extension through `CopilotAppDataAccess.getAutomationRuns()`, the CLI through
  `CopilotAutomationRunsAccess`) and hosts pass the automation name as
  `RepeatedTaskSessionSource.copilotAutomation`.
- **Surfaces**: the `scheduled-tasks-running` insight (a celebration) names the top three
  tasks with their run counts; the Skill Suggestions section notes which scheduled tasks were
  left out; the CLI prints an "Already on a schedule" block. `skill-suggestions --json` without
  `--include-prompts` keeps the counts but drops the user-chosen task names.

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

- `src/test/copilotAutomationRuns.test.ts` — reading automation runs from a `data.db` fixture.
- `src/test/repeatedTasks.test.ts` — normalization, injected-context stripping, scheduled runs, similarity, clustering,
  ordering, truncation, exclusions, example prompts, the skill location rule, the skill prompt, and
  the shared report builder (`buildRepeatedTaskReport`, `toRepeatedTaskInput`, `repoDisplayName`).
- `vscode-extension/test/unit/webview-skillSuggestions.test.ts` — section rendering and escaping,
  suggestion paging and clamping, the sessions table and its open buttons, and click wiring.
- `cli/src/test/skillSuggestions.test.ts` — the CLI builds the report from real session files only
  when asked, and `skill-suggestions --json` redacts prompts unless opted in.
- `vscode-extension/test/unit/insightsEngine.test.ts` — the `repeated-task-skill-candidate`
  insight thresholds and the `repeated-task-automation-candidate` insight.
