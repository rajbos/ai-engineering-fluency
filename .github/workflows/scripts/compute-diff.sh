#!/usr/bin/env bash
# Write the changeset under review to ./changeset.diff.
#
# On pull_request events, BASE_SHA/HEAD_SHA come from the event payload and we
# diff base...head (the changes the PR introduces). For manual runs with no PR
# context we fall back to the previous commit, and if even that is unavailable
# we emit an empty diff (the agents treat that as a clean PASS).
set -euo pipefail

mkdir -p findings

BASE_SHA="${BASE_SHA:-}"
HEAD_SHA="${HEAD_SHA:-}"

if [ -z "$HEAD_SHA" ]; then
  HEAD_SHA="$(git rev-parse HEAD)"
fi

if [ -z "$BASE_SHA" ]; then
  BASE_SHA="$(git rev-parse "${HEAD_SHA}^" 2>/dev/null || true)"
fi

if [ -z "$BASE_SHA" ]; then
  echo "No base commit available; writing empty diff."
  : > changeset.diff
else
  # Three-dot diff: changes on HEAD since it diverged from BASE.
  git diff "${BASE_SHA}...${HEAD_SHA}" > changeset.diff \
    || git diff "${BASE_SHA}" "${HEAD_SHA}" > changeset.diff
fi

echo "Changeset diff: $(wc -c < changeset.diff) bytes, $(grep -c '^diff --git' changeset.diff || echo 0) file(s)."
