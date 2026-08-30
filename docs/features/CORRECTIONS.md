# Corrections — detection of correction moments in sessions

The **Corrections** tab in the Usage Analysis view surfaces moments where a conversation had to be
corrected: either the **agent corrected itself after an error**, or the **user had to correct the
agent**. It is the first step towards correction-driven insights about where agents go wrong.

## What is detected

| Type | Source | Definition |
|---|---|---|
| `user-correction` | User message text | Heuristic patterns: "no, ...", "that's wrong", "not what I asked", "undo/revert", "why did you", "that didn't work", ... |
| `edit-retry` | Tool-call sequence | Repeat edit to a file whose immediately preceding tool call was an edit to the same file (same definition as model efficiency "retry") |
| `edit-self-correction` | Tool-call sequence | Repeat edit to a file already edited in the same turn, with other tool calls in between (same definition as model efficiency "self-correction") |
| `tool-error` | Tool result | A failed tool call (`success: false`); marked **retried** when the same tool is called again later in the session |
| `agent-self-correction` | Assistant response text | Heuristic patterns: "my mistake", "let me fix", "you're right", "that failed", apologies, ... |

The pattern-based detectors are **heuristics** — they produce candidates, not verdicts. The edit-based
detectors intentionally share their definitions with `src/modelEfficiency.ts` so counts stay comparable
with the model-efficiency counters.

## Data flow

1. `src/correctionDetection.ts` (`detectCorrectionMoments`) — pure module, scans a session's turns
   (`CorrectionTurn[]`, satisfied by both `ChatTurn` and the extended `EfficiencyTurn`) and returns
   capped (`MAX_MOMENTS_PER_SESSION = 50`), snippet-truncated `CorrectionMoment[]`.
2. Detection rides the **existing per-session analysis passes** in `src/usageAnalysis.ts` — no extra
   parsing:
   - ecosystem adapters: moments are computed from the same `buildTurns()` output used for
     `modelEfficiency`;
   - Copilot Chat JSON / delta JSONL: `_applyJsonRequestsEfficiency` now carries user/assistant text
     into the efficiency turns;
   - Copilot CLI JSONL: `user.message` / `assistant.message` text is accumulated onto the efficiency
     turns, and `tool.execution_complete` with `success: false` marks the turn's tool call as failed.
3. Moments are cached per session in `SessionUsageAnalysis.correctionMoments` (inside the normal
   `SessionFileCache`; `CACHE_VERSION` 65). `mergeUsageAnalysis` folds per-session moments into
   period-level `UsageAnalysisPeriod.corrections` counters.
4. `CopilotTokenTracker.buildCorrectionReport()` regroups the already-parsed sessions **per
   repository** (`SessionFileCache.repository`), keeping each repo's **25 most recent sessions** with
   moments, and attaches the report to `UsageAnalysisStats.correctionReport`.
5. The Usage Analysis webview renders the report in the Corrections tab; the insights engine reads
   `last30Days.corrections` for two insights:
   - `corrections-user-pushback` (≥ 3 user corrections in 30 days) — suggests capturing conventions in
     `copilot-instructions.md` / `AGENTS.md`;
   - `corrections-tool-errors` (≥ 5 tool errors or ≥ 10 edit retries/self-corrections in 30 days) —
     points at recurring self-correction loops.

## Coverage and limitations

- `tool-error` moments require a format that records tool success/failure — currently the Copilot CLI
  JSONL path. Ecosystem adapters contribute the other four types.
- Sessions without per-turn detail (e.g. binary formats without a turn builder) produce no moments.
- Pattern-based matches can be false positives (e.g. "actually," starting a new request). Patterns
  live in `USER_CORRECTION_PATTERNS` / `AGENT_SELF_CORRECTION_PATTERNS` in `src/correctionDetection.ts` and
  are expected to be tuned as real reports are triaged.

## Privacy

Snippets are short excerpts (≤ ~240 chars) from the user's own local session logs, displayed only
locally in the webview and stored only in the local extension cache. Nothing is sent anywhere.

## Tests

- `vscode-extension/test/unit/correctionDetection.test.ts` — detection rules, counts, caps.
- `vscode-extension/test/unit/insightsEngine.test.ts` — the two correction insights (thresholds).
