# Skill Suggestions — repeated-task detection across sessions

The **Skill Suggestions** section in the Usage Analysis view (Tools & Integrations tab) finds tasks
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
3. **Report**: the extension clusters across **all** scanned sessions (cross-repository on purpose —
   tasks like "create the PR" repeat across repos) and attaches clusters with at least
   `MIN_CLUSTER_SIZE = 2` sessions to `UsageAnalysisStats.repeatedTasks`, largest first.
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

## What is excluded

- **Slash commands** (`/fix ...`) — already a reusable invocation, nothing to suggest.
- **Short or content-free prompts** ("ok thanks", "continue") — no task signal.
- Prompts that reduce to only stopwords after normalization.

## Design notes and limitations

- Token-set similarity is deliberately cheap (no embeddings, no LLM calls) and runs in-memory over
  the already-cached prompts. It catches lexical repetition ("run the tests and fix the failures")
  but not paraphrases ("make the test suite green") — that is the intended trade-off for a local,
  zero-cost heuristic; a future version could tighten clusters with model assistance on demand.
- First prompts are stored only in the local extension cache and shown only in the local webview;
  nothing is sent anywhere.
- Tunables live at the top of `src/repeatedTasks.ts` (similarity threshold, cluster size, stopword
  list) and are expected to be adjusted as real usage data comes in.

## Tests

- `vscode-extension/test/unit/repeatedTasks.test.ts` — normalization, similarity, clustering,
  ordering, truncation, exclusions, example prompts, the skill location rule and the skill prompt.
- `vscode-extension/test/unit/webview-skillSuggestions.test.ts` — section rendering and escaping,
  suggestion paging and clamping, the sessions table and its open buttons, and click wiring.
- `vscode-extension/test/unit/insightsEngine.test.ts` — the `repeated-task-skill-candidate`
  insight thresholds.
