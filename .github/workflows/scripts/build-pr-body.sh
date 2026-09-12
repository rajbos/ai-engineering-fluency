#!/usr/bin/env bash
# Build the auto-fix PR body from combined.md and expose it as a multiline
# step output named `body` (peter-evans/create-pull-request takes a string).
set -euo pipefail

PR_NUMBER="${PR_NUMBER:-?}"
CHANGED_FILES="${CHANGED_FILES:-}"

{
  echo "This PR was generated automatically by the **Agent Review** workflow."
  echo
  echo "It applies small, high-confidence fixes for findings raised on #${PR_NUMBER}"
  echo "by the code-quality, test, and architecture review agents. The agents and the"
  echo "fixer run **locally on the runner via Ollama** — no external AI tokens are used."
  echo
  echo "**Files changed:** ${CHANGED_FILES:-_none_}"
  echo
  echo "> ⚠️ These edits are model-generated proposals. Review them carefully before merging;"
  echo "> the model only addresses what it is confident about and skips the rest."
  echo
  # The marker must stay a literal substring for check-test-coverage.sh, which
  # greps the raw body. Backticked and bolded rather than written line-initially
  # as `[skip-test-check]: ...`, which is CommonMark link-reference-definition
  # syntax and can render as nothing at all.
  echo "**\`[skip-test-check]\`** — these fixes touch production source without"
  echo "touching tests by construction: they are model-generated proposals for a"
  echo "human to review and test, not a shippable change in their own right. The"
  echo "reviewed PR (#${PR_NUMBER}) carries the test coverage for the underlying change."
  echo
  echo "<details><summary>Full review findings</summary>"
  echo
  cat combined.md
  echo
  echo "</details>"
} > pr-body.md

{
  echo "body<<AGENT_REVIEW_PR_BODY_EOF"
  cat pr-body.md
  echo "AGENT_REVIEW_PR_BODY_EOF"
} >> "$GITHUB_OUTPUT"

echo "PR body written ($(wc -c < pr-body.md) bytes)."
