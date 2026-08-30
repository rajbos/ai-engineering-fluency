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
4. **Surface**: the webview renders one card per cluster — repetition count, representative (most
   recent) prompt, shared keywords, and an expandable session list. The
   `repeated-task-skill-candidate` insight fires when a cluster reaches 3 sessions and links to the
   section.

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
  ordering, truncation, exclusions.
- `vscode-extension/test/unit/insightsEngine.test.ts` — the `repeated-task-skill-candidate`
  insight thresholds.
