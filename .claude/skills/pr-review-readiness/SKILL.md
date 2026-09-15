---
name: pr-review-readiness
description: Determine whether GitHub's native automatic Copilot PR review (copilot-pull-request-reviewer[bot]) has finished for a PR's current head commit, before acting on "no review comments" or replying to/resolving review threads. Use before treating a PR's review state as final while driving it to green or handling a PR-activity webhook event.
---

# PR Review Readiness Skill

Answers one question: **is it safe to read this PR's review state right now, or
is GitHub's automatic Copilot review still in flight for the current head
commit?** Acting too early is the failure mode this skill prevents — an agent
that checks a PR seconds after a push can see stale or incomplete review state
and conclude "no findings" when the review simply hasn't posted yet, or act on
comments left against an older commit.

This is a lookup skill, not a workflow: run the check, get one of three
answers, act accordingly.

## When to Use This Skill

- Before treating "no new review comments" as a real signal while driving a PR to green
- Before replying to or resolving a review thread, to confirm the review content is current
- On any PR-activity webhook event that might race a fresh push against GitHub's review
- Any time you're about to read a PR's review state right after a push

## Two unrelated review-ish signals — don't confuse them

This repository's PRs carry two independent families of check runs that both
look like "review" but answer different questions:

1. **GitHub's native automatic Copilot PR review** — the actual line-level
   review comments this skill gates on. It posts as the
   `copilot-pull-request-reviewer[bot]` GitHub App and is backed by a real
   **check run literally named `copilot-pull-request-reviewer`**, with the
   standard lifecycle `queued` → `in_progress` → `completed`. In the PR
   timeline UI, "Review requested due to automatic review settings" is this
   check being queued, and "Copilot started reviewing... [View session]" is it
   running — that link is this same check run's own Actions job URL.
2. **This repository's own CI-driven review agents** — separate check runs
   from this repo's own GitHub Actions workflows: `Architecture agent`,
   `Code Quality agent`, `Test Expert agent`, `Performance agent`, and
   `Review risk` (the `pr-risk-review` skill). These are unrelated to #1 and
   never answer "is the automatic review done" — `pr-risk-review` in
   particular is explicitly advisory-only and never blocks merge.

Only check run #1 (`copilot-pull-request-reviewer`) answers the question this
skill is about.

## The algorithm

1. **Get the PR's current head commit SHA.**
   `mcp__github__pull_request_read` with `method: "get"` (the `head.sha` field).
2. **Fetch check runs for that head SHA** and find the one named exactly
   `copilot-pull-request-reviewer`.
   `mcp__github__pull_request_read` with `method: "get_check_runs"`.
   (Raw REST equivalent, for non-MCP tooling:
   `GET /repos/{owner}/{repo}/commits/{sha}/check-runs`, or
   `gh api repos/{owner}/{repo}/commits/{sha}/check-runs`.)
3. **Decide from its state:**

   | State | Meaning | What to do |
   |---|---|---|
   | Check run absent entirely | No automatic review has been queued yet for this push (there is typically a delay of a few minutes after a push before GitHub queues it) | Treat as **not yet started** — do not conclude "no findings"; reschedule a later check |
   | `status: "queued"` or `"in_progress"` | A review is actively running against the current head | **Stand down** — do not act on the PR's review comments this cycle (they may be for a stale prior commit); reschedule a check-in |
   | `status: "completed"` | The check finished — cross-check before trusting it (step 4) | See step 4 |

4. **Cross-check a `completed` run against the current head** before trusting
   it, since a completed check can still be stale (completed for an older
   push) or lag the review API by a few seconds:
   - Fetch the PR's submitted reviews:
     `mcp__github__pull_request_read` with `method: "get_reviews"`.
   - Find the most recent review authored by `copilot-pull-request-reviewer[bot]`
     and compare its `commit_id` to the PR's current head SHA (step 1).
   - **Match** → the review is current. Safe to read `get_review_comments` /
     the review body and act on findings.
   - **No match** (check run completed for an older head, or brief API
     propagation lag) → treat as **not yet ready**; one short retry is
     reasonable.
   - **No `copilot-pull-request-reviewer[bot]` review at all**, with the check
     run `completed` → valid terminal state meaning the review found nothing
     to say. This is "done, no comments", not "still running".

## How this changes agent behavior

When driving a PR to green or handling a PR-activity webhook event, run this
gate **before**:
- treating "no new review comments" as a real, actionable signal, and
- replying to or resolving review threads based on review content that might
  be for a stale commit.

If the gate says **not yet started** or **still running**: do not act on
review state this cycle. Reschedule a later check-in instead of polling
tightly in a loop — the check run typically takes several minutes, so a tight
poll wastes cycles without changing the answer any sooner.

If the gate says **current and complete** (a matching review, or a completed
check run with no review at all): the review state is safe to read and act on.

## Verified against

This algorithm and state machine were verified directly against a live PR
(#2097) across roughly 14 pushes and 15 review rounds in this repository: every
`copilot-pull-request-reviewer[bot]` entry from `get_reviews` carried a
`commit_id`, and cross-referencing those against each push's head SHA
repeatedly matched the states described above.
