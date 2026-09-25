---
title: Agentic Engineering System signals
created: 2026-09-25
updated: 2026-09-25
status: active
type: feature
tags: [agentic, readiness, corrections, insights, fluency]
---

# Agentic Engineering System signals

GitHub's [Agentic Engineering System](https://github.com/resources/insights/agentic-engineering-system)
argues that faster code generation only helps when three "stocks" keep up with agent adoption:
**governance**, **shared knowledge** and **customer value**. Its central rule:

> As agent use expands, escaped defect rates should stay flat or fall, and the quality of shared
> knowledge should improve alongside delivery speed.

This feature puts that rule to work on the user's own data. The plan behind it, and why each piece
is shaped the way it is, is in [ADR: Agentic Engineering System plan](../adr/AGENTIC-ENGINEERING-SYSTEM-PLAN.md).

## Where it shows up

| Surface | What it shows | Blog concept |
|---|---|---|
| Usage Analysis → **AI Readiness** → *Adoption × foundations* | Each scanned repository in one of four states: healthy and agent-native, healthy but underused, underdeveloped, **stretched** | Stock-adoption matrix |
| Usage Analysis → **Corrections** → *Rework per repository* | Corrections per session, corrected-session share, one-shot edits and tool calls per edit, per repository, next to its instruction files; a with/without instruction files comparison | Shared knowledge: "fast, confident mistakes" |
| **Fluency Score** → *Quality alongside adoption* | Agent sessions per day against corrections per session and one-shot edits, this month vs last | "Measuring speed without measuring error" |
| Usage Analysis → **Repository PRs** → *Cloud agent PRs reverted* | Reverted / merged cloud-agent PRs, with everyone else's revert rate as the baseline | Escaped defects |
| Usage Analysis → **Insights** → *How you work with agents* | Director / performer / assessor split of classified turns | Three modes |
| Insights | `agentic-system-stretched`, `speed-without-quality`, `delegation-without-objective`, `unreviewed-agent-merges`, `review-burden-rising`; `missing-instructions` cites the user's own cohort numbers | Anti-patterns |

## Rules that shape it

1. **Local only.** Everything here is computed from the local session cache, the local readiness
   scan and the repository PR snapshot, and rendered locally. None of it is added to backend
   rollups, Azure uploads or the sharing server. The matrix combines a repository's controls with
   the user's *own* usage; published, that would become per-person scoring, which the readiness
   scan ("per product line, never per person") and the
   [sharing-server contract](../../sharing-server/AGENTS.md) rule out. The Fluency Score strip is
   built outside `calculateMaturityScores` — whose result is uploaded — and is a separate element
   from the stage banner and radar, so the PNG, PDF and share exports never carry it.
2. **Honest denominators.** Rework rates only use sessions whose format records per-turn tool calls
   (`modelEfficiency` present). A session without that detail has *unknown* rework, not zero, and
   the table shows both counts (`10 / 12`).
3. **Unknown is not absent.** A repository whose checkout was not scanned shows *not scanned*
   instead of "no instruction files". A readiness control the scan could not observe is left out of
   the foundation score rather than counted as missing.
4. **Heuristics are labelled.** Every classification is shown with its definition and its counts.
   Cohort comparisons say they are correlations. Small samples are marked or hidden.
5. **The Fluency Score stage never changes.** The quality strip sits next to it.

## How each signal is computed

### Per-repository activity (`src/repoAgentActivity.ts`)

Sessions from the last 30 days (by last interaction; empty sessions skipped, as everywhere else)
are grouped by a lowercase `owner/repo` key derived from the workspace's git remote
(`src/repoKey.ts`). Sessions with no resolvable remote go to an *unattributed* bucket whose size is
shown. A second pass groups this month to date and all of last month for the trend.

- **Agentic session:** any agent, custom-agent or CLI-agent interaction.
- **Delegation session:** task category `Delegation`, or at least one sub-agent call.

### Adoption × foundations (`src/agenticFoundations.ts`)

- **Foundations** are scored over the readiness controls of stages 1–3 as
  present ÷ (present + absent). Unknown controls are excluded from both sides and reported.
  Strong ≥ 70 %; weak ≤ 40 %, or no tests running in CI, or neither `AGENTS.md`-style nor
  `copilot-instructions.md` instructions. Anything in between is *partial* and leans to the nearer
  side (shown dashed; the stretched insight ignores leaning placements). Fewer than 6 observed
  controls is *unassessed*.
- **Why not the readiness stage band:** `confirmedStage` can never pass 1, because stage 2 requires
  `ai-policy`, a governance control that is always `unknown`. And the ceiling is blocked by any one
  absent stage-1 control, such as a library with no infrastructure-as-code.
- **High adoption:** at least 5 agentic sessions in the window, making up at least 30 % of the
  repository's sessions.
- Repositories without a GitHub remote cannot be matched to sessions and are listed as not placed.
  Repositories with agent sessions that are not open in the workspace are listed as *adoption only*.

### Rework and instruction files (`src/knowledgeSignals.ts`)

Instruction files are read from the customization scan the extension already runs per workspace:
the `instructions` and `non-copilot-instructions` types, plus `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`
and `CODEX.md` wherever they are. The cohort comparison uses repositories with a scanned checkout
and at least 5 turn-detail sessions; it appears once each cohort has 3 such repositories and 20
sessions, and compares median corrections per session.

### Quality alongside adoption (`src/speedVsError.ts`)

Adoption is agentic sessions **per day** (the windows differ in length); rework is corrections per
session and the one-shot edit rate. *Faster* means a ≥ 15 % rise in agentic sessions per day with at
least 5 this month; *weaker* means corrections per session up ≥ 20 % and ≥ 0.1, or one-shot edits
down ≥ 5 points. It needs at least 7 days into the month and 10 turn-detail sessions in each month.

### Reverted PRs (`src/prOutcomes.ts`)

Found in the `GET /pulls?state=all` list the repository PR collector already fetches — no extra API
calls. A merged PR titled `Revert "…"` reverts the PR named in a `Reverts owner/repo#N` body (from
GitHub's revert button), or else the most recent earlier merged PR with the quoted title. Revert PRs
themselves are left out of the merged counts. It is a lower bound: reverts pushed straight to the
branch, fix-forwards and rewritten revert titles are invisible. The snapshot schema version was
bumped to 2 for the new fields.

### Participation modes (`src/participationModes.ts`, mapping in `participationModes.json`)

Each turn's task category maps to a mode: Planning, Brainstorming, Delegation → director; Coding,
Feature Dev, Refactoring, Debugging, Build/Deploy, Git Ops → performer; Testing → assessor.
Exploration is director before a session's first performer turn and assessor after it. Conversation
is not counted. The card needs 20 classified turns, and calls out delegation in ≥ 25 % of sessions
with assessor turns under 10 %.

### Prompt scoping (`src/promptScoping.ts`)

An agentic session is *under-scoped* when its first prompt is under 80 characters, is not a slash
command, and no Planning turn comes before the first execution turn. `delegation-without-objective`
fires when at least 5 sessions fall on each side, at least 2 under-scoped sessions needed 2+ user
corrections, and their rate is at least 1.5× and 10 points above the scoped sessions'.

## Insights

| Id | Fires when |
|---|---|
| `agentic-system-stretched` | A workspace repository is firmly (not leaning) stretched and has missing controls |
| `speed-without-quality` | This month is *faster but weaker* |
| `delegation-without-objective` | See prompt scoping above |
| `unreviewed-agent-merges` | Agents open PRs in a workspace repository whose `human-review-enforced` control is not present. Today that control is API-only and not yet collected, so the wording says the scan *cannot confirm* review |
| `review-burden-rising` | A repository's cloud-agent PRs in the recent half of the PR window are ≥ 5 and ≥ 1.5× the earlier half, together with reverts there or rising rework |

The readiness scan behind the scan-based insights is cached and re-run at most once an hour.

## Tests

`repoKey`, `repoAgentActivity`, `participationModes`, `promptScoping`, `knowledgeSignals`,
`agenticFoundations`, `speedVsError`, `prOutcomes`, `insightsEngine-agentic`,
`webview-agenticSignals`, `webview-agenticMatrixSection`, `webview-qualityStrip` and
`webview-darkFactoryTab` in `vscode-extension/test/unit/`, plus the localization checks in
`l10n.test.ts`.
