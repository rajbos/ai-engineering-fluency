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
