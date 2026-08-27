# Model Efficiency Comparison

The **Models** tab in the Efficiency view answers a question the other tabs could
only hint at: *is my current AI usage more efficient than before, and is the model
mix the reason?*

Typical questions it can now settle:

- "I've been using Kimi a lot more this month than last — did that actually help?"
- "Is Claude Opus worth its price per edit turn compared with a cheaper model?"
- "Is the model I rely on getting better or quietly getting worse over time?"

## Two modes

| Mode | What it compares | Use it for |
|---|---|---|
| **Compare two models** | Model A vs Model B over the *same* window | Head-to-head model choice |
| **One model, two periods** | The same model across two windows | Detecting drift in a model you already rely on |

Windows available: last 30 days, previous 30 days, last 90 days, this month, last month.

## What it measures

| Metric | Direction | Meaning |
|---|---|---|
| Cost per edit turn | lower is better | Price of one turn that actually changed code |
| Cost per session | lower is better | Price of an end-to-end piece of work |
| Cost per 1000 lines | lower is better | Price per unit of output (weak proxy — see caveats) |
| Dollars per million tokens | lower is better | Raw rate, mix-adjusted |
| Tokens per edit turn / per session | lower is better | Verbosity and context overhead |
| One-shot edit rate | higher is better | Share of edits that landed without a retry |
| Edit retry rate | lower is better | Retries per edit turn |
| Self-correction rate | lower is better | How often the model fixed its own output |
| Cache read share | higher is better | Prompt reuse, which lowers cost |
| Active minutes per session | lower is better | Wall-clock time to get the work done |
| Apply rate | higher is better | Suggested blocks you actually accepted |

## How the numbers are attributed

Per-turn counters — calls, edit turns, retries, one-shot edits, self-corrections,
tool calls — are recorded **per model** and are never split or estimated.

Session-level signals that no editor reports per model — active duration, lines
added/removed, applies, code blocks — are split across the session's models by
**token share**. A session that spent 70% of its tokens on model A and 30% on
model B contributes its duration and line counts in that ratio. The split is
lossless: the parts always sum back to the session total.

Because of that split there are two session counts:

- `sessions` — every session that touched the model (a two-model session counts
  for both).
- `sessionShare` — the token-weighted fractional equivalent. This is the honest
  denominator for per-session ratios, and it is what the tab uses.

## Cost basis

The Models tab prices tokens at **provider/API rates**, so it measures the models
themselves rather than a billing plan. This is deliberately different from the
**Cost Attribution** tab, which uses Copilot AI-Credit pricing to reflect what a
Copilot subscription actually consumes. Comparing dollar figures across the two
tabs is not meaningful.

## Guardrails against false conclusions

The tab is designed to refuse a verdict rather than invent one.

- **Sample floors.** A side needs at least 5 session-shares and 10 edit turns
  before its metrics are treated as comparable. Metrics below the floor render
  as `—` rather than a confident number.
- **Noise gate.** A difference under 10% is reported as a *tie*, not a win.
  Only decisive metrics feed the verdict.
- **Caveats banner.** Raised when a side is below a sample floor, when the two
  sides' task mixes diverge by 20 points or more, or when a model's usage is
  dominated by mixed-model sessions (so its duration and line figures are
  approximate).
- **Task mix bars.** Task categories are classified per session and distributed
  across that session's models by token share. They are shown as *context* —
  if one side did mostly refactoring and the other mostly greenfield work, part
  of any gap belongs to the work, not the model. Task mix never scores a model.

## Reading the radar

Each axis is normalized so the better side scores 100 and the other scores
proportionally. A larger overall shape means a better all-round profile; a spiky
shape means the side wins on some dimensions and loses on others — which is
usually the more interesting result. Axes where either side lacks data are
dropped, and the radar is hidden entirely below three usable axes.

## Where the data comes from

Per-model efficiency counters are accumulated onto `DailyTokenStats.modelEfficiency`,
which makes them sliceable by arbitrary date windows. Two accumulation paths run
at different cadences:

- **Tokens and cost** are accumulated once per session *per day*, from that day's
  `modelUsage`, so they line up with the other daily series.
- **Turn counters and duration** are accumulated once per session, on the day of
  last activity, matching the existing lines-of-code attribution convention —
  these describe a whole session and cannot be split across days.

The comparison engine itself lives in `src/efficiencyAnalysis.ts`
(`computeModelPeriodMetrics`, `listComparableModels`, `compareModels`,
`buildModelWeeklySeries`) and is shared, so the CLI and other hosts can consume
the same logic without reimplementing it.

## Limitations

- Requires session logs that carry per-turn tool-call detail. Editors that only
  report aggregate token counts will not appear as comparable models.
- Lines of code is a weak proxy for value; refactors and generated boilerplate
  distort cost-per-1000-lines in both directions.
- Active duration depends on the editor adapter reporting it; where it is absent
  the duration metrics are omitted rather than guessed.
- A model comparison is observational, not an experiment. Even with the caveats
  above, you did not randomly assign work to models.
