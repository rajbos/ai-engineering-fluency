#!/usr/bin/env bash
# Decide whether a pull request should get an AI risk review.
#
# The review costs Copilot credits and runs a model over attacker-controllable
# diff content, so it only runs for pull requests this repository already
# trusts. "Known contributor" means, in order of cost:
#
#   1. The event payload already says so — author_association is OWNER, MEMBER,
#      or COLLABORATOR. No API call needed.
#   2. The repository grants them write access (admin / maintain / write).
#   3. They appear in the repository's contributor list, i.e. they have code
#      merged here before.
#
# Two hard gates come first and are not about trust:
#   - Bots are skipped (dependabot and friends open high-volume, low-signal PRs).
#   - Fork PRs are skipped, because `pull_request` hands a fork a read-only
#     GITHUB_TOKEN, so the labelling and commenting steps could not run anyway.
#     Do NOT "fix" this by switching the workflow to pull_request_target — that
#     would run a model with write credentials over an untrusted fork's diff.
#
# Environment variables:
#   GH_TOKEN            Token for the `gh` CLI (required for steps 2 and 3).
#   REPO                owner/repo (default: $GITHUB_REPOSITORY).
#   PR_AUTHOR           PR author's login (required).
#   AUTHOR_ASSOCIATION  github.event.pull_request.author_association.
#   HEAD_REPO           github.event.pull_request.head.repo.full_name.
#   ALLOW_BOTS          "true" to review bot PRs as well (default: false).
#
# Writes `should_review` and `reason` to $GITHUB_OUTPUT, and a one-line note to
# $GITHUB_STEP_SUMMARY. Always exits 0 — "not a known contributor" is a normal
# outcome, not a failure, and must never show up as a red check on a PR.

set -euo pipefail

REPO="${REPO:-${GITHUB_REPOSITORY:-}}"
PR_AUTHOR="${PR_AUTHOR:-}"
AUTHOR_ASSOCIATION="${AUTHOR_ASSOCIATION:-}"
HEAD_REPO="${HEAD_REPO:-}"
ALLOW_BOTS="${ALLOW_BOTS:-false}"

decide() {
  local verdict="$1" reason
  # Collapse newlines defensively: `reason` is echoed into GITHUB_OUTPUT, where a
  # newline would let it forge a second output key.
  reason="$(printf '%s' "$2" | tr '\n\r' '  ')"
  echo "should_review=${verdict}" >> "${GITHUB_OUTPUT:-/dev/null}"
  echo "reason=${reason}" >> "${GITHUB_OUTPUT:-/dev/null}"
  if [ "$verdict" = "true" ]; then
    echo "✅ Running the risk review: ${reason}"
    printf '### PR Risk Review\n\n✅ Running — %s\n' "${reason}" \
      >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  else
    echo "⏭️ Skipping the risk review: ${reason}"
    printf '### PR Risk Review\n\n⏭️ Skipped — %s\n' "${reason}" \
      >> "${GITHUB_STEP_SUMMARY:-/dev/null}"
  fi
  exit 0
}

if [ -z "$PR_AUTHOR" ]; then
  decide false "no PR author in the event payload"
fi

# ── Gate 1: bots ───────────────────────────────────────────────────────────
case "$PR_AUTHOR" in
  *"[bot]"|dependabot|github-actions)
    if [ "$ALLOW_BOTS" != "true" ]; then
      decide false "\`${PR_AUTHOR}\` is a bot (set ALLOW_BOTS=true to review bot PRs)"
    fi
    ;;
esac

# ── Gate 2: fork PRs ───────────────────────────────────────────────────────
if [ -n "$HEAD_REPO" ] && [ -n "$REPO" ] && [ "$HEAD_REPO" != "$REPO" ]; then
  decide false \
    "PR is from the fork \`${HEAD_REPO}\`; the token is read-only there, so no label or comment could be written"
fi

# ── Check 1: association straight from the payload ─────────────────────────
case "$AUTHOR_ASSOCIATION" in
  OWNER|MEMBER|COLLABORATOR)
    decide true "\`${PR_AUTHOR}\` has \`${AUTHOR_ASSOCIATION}\` association on this repository"
    ;;
esac

if [ -z "${GH_TOKEN:-}" ]; then
  decide false \
    "\`${PR_AUTHOR}\` has association \`${AUTHOR_ASSOCIATION:-NONE}\` and no token is available to check further"
fi

# ── Check 2: repository permission level ───────────────────────────────────
PERMISSION="$(gh api "repos/${REPO}/collaborators/${PR_AUTHOR}/permission" \
  --jq '.permission' 2>/dev/null || echo "")"

case "$PERMISSION" in
  admin|maintain|write)
    decide true "\`${PR_AUTHOR}\` has \`${PERMISSION}\` access to this repository"
    ;;
esac

# ── Check 3: has merged code here before ───────────────────────────────────
# `contributors` lists logins by commit count; a match means this person's work
# is already in the default branch. The list is captured first rather than piped
# into grep: under `set -o pipefail`, `grep -q` closing the pipe early on a match
# would SIGPIPE `gh` and turn a successful match into a non-zero pipeline.
CONTRIBUTORS="$(gh api "repos/${REPO}/contributors" --paginate --jq '.[].login' 2>/dev/null || true)"

if grep -Fxq -- "$PR_AUTHOR" <<< "$CONTRIBUTORS"; then
  decide true "\`${PR_AUTHOR}\` is an existing contributor to this repository"
fi

decide false \
  "\`${PR_AUTHOR}\` is not a known contributor (association \`${AUTHOR_ASSOCIATION:-NONE}\`, permission \`${PERMISSION:-none}\`)"
