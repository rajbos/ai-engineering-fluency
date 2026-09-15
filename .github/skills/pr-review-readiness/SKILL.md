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

Every step below reasons about one specific head SHA. Because a push can land
between any two calls, treat the SHA as pinned for the duration of one gate
run and re-confirm it rather than assuming it's still current — see the race
notes inline and the final step.

1. **Get the PR's current head commit SHA** (call it `sha`).
   `mcp__github__pull_request_read` with `method: "get"` (the `head.sha`
   field). Non-MCP equivalent: `GET /repos/{owner}/{repo}/pulls/{pull_number}`
   (or `gh api repos/{owner}/{repo}/pulls/{pull_number}`), read `.head.sha`.
2. **Fetch check runs for `sha`** and find the one named exactly
   `copilot-pull-request-reviewer`. This response is paginated too — a PR
   with enough checks can fill one page without including it, which would
   wrongly land on the "absent entirely" row below. Page through with
   `page`/`perPage` (max `perPage`, capped at a sane number of pages, same
   bound as step 4) before deciding it's really absent — and pagination must
   actually **finish** to draw that conclusion: it finishes when a page comes
   back with fewer results than requested (a genuine last page), not merely
   when the page cap is reached. Hitting the cap without a short final page
   means the search was inconclusive, not that the check run is absent —
   treat that the same as **not yet started** (reschedule; don't conclude
   "no findings").
   The two ways to do this differ in scoping — know which one you're calling:
   - `mcp__github__pull_request_read` with `method: "get_check_runs"` is
     **PR-scoped, not SHA-scoped**: it has no SHA parameter and always reads
     check runs for whatever the PR's head is *at call time*. If a push can
     have landed between steps 1 and 2, re-fetch `head.sha` right after this
     call and restart from step 1 if it changed, so the rest of this
     algorithm reasons about one consistent `sha`.
   - The raw REST equivalent, for non-MCP tooling, **is SHA-scoped** and
     avoids this race entirely by construction:
     `GET /repos/{owner}/{repo}/commits/{sha}/check-runs`
     (or `gh api --paginate repos/{owner}/{repo}/commits/{sha}/check-runs`),
     called with the exact `sha` from step 1. Prefer this form when you can
     choose, since it makes the re-check above unnecessary. It's still
     paginated (`per_page`/`page`), so apply the same page cap.
3. **Decide from its state:**

   | State | Meaning | What to do |
   |---|---|---|
   | Check run absent entirely | No automatic review has been queued yet for this push (there is typically a delay of a few minutes after a push before GitHub queues it) | Treat as **not yet started** — do not conclude "no findings"; reschedule a later check |
   | `status: "queued"` or `"in_progress"` | A review is actively running against the current head | **Stand down** — do not act on the PR's review comments this cycle (they may be for a stale prior commit); reschedule a check-in |
   | `status: "completed"` | The check finished — cross-check before trusting it (step 4) | See step 4 |

4. **Cross-check a `completed` run against `sha`** before trusting it, since a
   completed check can still be stale (completed for an older push), lag the
   review API by a few seconds, or have failed instead of finishing normally:
   - Fetch **all pages** of the PR's submitted reviews:
     `mcp__github__pull_request_read` with `method: "get_reviews"`, paging with
     `page`/`perPage` (use the maximum `perPage` the tool allows, e.g. `100`)
     until a page comes back with fewer results than requested — that's the
     last page, and pagination has genuinely **finished**. `get_reviews` is
     paginated — reading only the first page can miss the review you need,
     especially on a PR with many review rounds. Cap it at a sane bound (e.g.
     20 pages) so a bug elsewhere can't turn this into an unbounded loop —
     but hitting that cap *without* reaching a short final page is not the
     same as having searched everything: it means the search is
     **inconclusive**, not that there's no matching review, and must not
     feed the "no comments" terminal state below. Non-MCP equivalent:
     `GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews` (or
     `gh api --paginate repos/{owner}/{repo}/pulls/{pull_number}/reviews`),
     reading each entry's `user.login`, `id`, and `commit_id`.
   - Across every page, look for a review authored by
     `copilot-pull-request-reviewer[bot]` whose `commit_id` equals `sha`
     (not merely "the most recent bot review" — on a PR with prior rounds,
     the most recent bot review can belong to an older commit even when the
     current-head review genuinely produced no comments, which would
     otherwise read as permanently stale).
   - **A review with `commit_id == sha` exists, and the check run's
     `conclusion` is exactly `success` or `neutral`** → the review is current
     *and* complete. Safe to act on findings — but scope which findings:
     `get_review_comments` (or the REST review-comments list) returns every
     thread on the PR, including older, already-superseded ones, so don't
     treat its whole response as "this review's findings". Filtering by
     author and a `submitted_at` cutoff is **not** review-specific enough — a
     later review by the same bot against an older, since-superseded commit
     can post comments after that timestamp too, misattributing stale
     findings to the current review. Instead require an exact match on the
     matched review's own id: either call the comments-for-this-review form
     (`GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/comments`,
     using the matched review's own id) or filter the general response to
     comments whose `pull_request_review_id` equals that matched review's
     `id`.
   - **A review with `commit_id == sha` exists, but the check run's
     `conclusion` is anything else** → `commit_id == sha` only proves the
     review is *current*, not that it's *complete* (a review can be
     submitted and then the run still fail or get cancelled). Fall through
     to the next two cases as if no matching review existed.
   - **No matching-and-complete review, and the check run's `conclusion` is
     anything other than exactly `success` or `neutral`** — treat every
     other value as not clean, not just the common examples (`failure`,
     `cancelled`, `timed_out`, `action_required`, `skipped`, or a
     missing/`null` conclusion all count). The review did not finish
     cleanly. Treat as **not yet ready** — do not conclude "no findings";
     investigate or reschedule rather than trusting an aborted run.
   - **No matching-and-complete review, and the check run's `conclusion` is
     `success` or `neutral`** → could be brief API propagation lag, *but only
     if pagination genuinely finished* (reached a short final page, per
     above — not merely hit the page cap). If it finished: retry once, short
     delay. Still no matching review after that retry → valid terminal state
     meaning the review found nothing to say for `sha`: "done, no comments",
     not "still running". If pagination did **not** finish (hit the cap on
     full pages): the search was inconclusive, not clean — treat as **not
     yet ready**, the same as the check-run pagination cap case in step 2,
     rather than declaring "no comments" over a PR too large to have been
     fully searched.

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

If the gate says **current and complete** (a matching review for `sha`, or a
successfully completed check run with no review at all): the review state is
safe to read and act on — but re-check the PR's head SHA immediately before
taking that action (replying to or resolving a thread, or recording "no
findings"). A push can land after the gate passes and before you act on it;
if the head moved, the gate's answer is for a commit that is no longer
current, so rerun the gate against the new head instead.

## Verified against

This algorithm and state machine were verified directly against a live PR
(#2097) across roughly 14 pushes and 15 review rounds in this repository: every
`copilot-pull-request-reviewer[bot]` entry from `get_reviews` carried a
`commit_id`, and cross-referencing those against each push's head SHA
repeatedly matched the states described above.
