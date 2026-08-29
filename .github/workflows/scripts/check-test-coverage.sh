#!/usr/bin/env bash
# Deterministic "test coverage companion" check.
#
# Catches the class of review finding "new source logic added without any test
# changes" without needing an LLM: if a PR touches production source files but
# no test files, the change ships without CI-visible test coverage updates and
# this job fails.
#
# Inputs (env):
#   BASE_SHA  — PR base sha (falls back to HEAD^ like compute-diff.sh)
#   HEAD_SHA  — PR head sha (falls back to HEAD)
#   PR_BODY   — PR body text; if it contains the marker [skip-test-check] the
#               check passes with a warning (documented escape hatch for
#               changes that genuinely cannot be unit-tested, e.g. pure
#               HTML/layout tweaks in webview code).
#
# Classification rules:
#   SOURCE: *.ts/*.tsx/*.js/*.cjs/*.mjs under vscode-extension/src/, cli/src/,
#           or the shared src/ folder.
#   TEST:   any path containing /test/, /tests/ or /__tests__/, or a filename
#           containing .test. or .spec. — in any directory of the repo.
set -euo pipefail

BASE_SHA="${BASE_SHA:-}"
HEAD_SHA="${HEAD_SHA:-}"
PR_BODY="${PR_BODY:-}"

if [ -z "$HEAD_SHA" ]; then
  HEAD_SHA="$(git rev-parse HEAD)"
fi

if [ -z "$BASE_SHA" ]; then
  BASE_SHA="$(git rev-parse "${HEAD_SHA}^" 2>/dev/null || true)"
fi

if [ -z "$BASE_SHA" ]; then
  echo "No base commit available; nothing to check. PASS."
  exit 0
fi

CHANGED_FILES="$(git diff --name-only "${BASE_SHA}...${HEAD_SHA}" \
  || git diff --name-only "${BASE_SHA}" "${HEAD_SHA}")"

if [ -z "$CHANGED_FILES" ]; then
  echo "Empty changeset; nothing to check. PASS."
  exit 0
fi

is_test_file() {
  case "$1" in
    */test/*|*/tests/*|*/__tests__/*|test/*|tests/*) return 0 ;;
  esac
  case "$(basename "$1")" in
    *.test.*|*.spec.*) return 0 ;;
  esac
  return 1
}

is_source_file() {
  case "$1" in
    vscode-extension/src/*|cli/src/*|src/*) ;;
    *) return 1 ;;
  esac
  case "$1" in
    *.ts|*.tsx|*.js|*.cjs|*.mjs) return 0 ;;
  esac
  return 1
}

SOURCE_FILES=""
TEST_FILES=""
while IFS= read -r file; do
  [ -z "$file" ] && continue
  if is_test_file "$file"; then
    TEST_FILES="${TEST_FILES}${file}"$'\n'
  elif is_source_file "$file"; then
    SOURCE_FILES="${SOURCE_FILES}${file}"$'\n'
  fi
done <<< "$CHANGED_FILES"

if [ -z "$SOURCE_FILES" ]; then
  echo "No production source files changed. PASS."
  exit 0
fi

if [ -n "$TEST_FILES" ]; then
  echo "Source files changed together with test files. PASS."
  echo "Test files touched:"
  printf '%s' "$TEST_FILES" | sed 's/^/  - /'
  exit 0
fi

if [[ "$PR_BODY" == *"[skip-test-check]"* ]]; then
  echo "::warning::Source files changed without test changes, but the PR body contains [skip-test-check]; passing."
  exit 0
fi

cat <<EOF
::error::Source files changed but no test files were added or modified.

Source files without a test-file companion change:
$(printf '%s' "$SOURCE_FILES" | sed 's/^/  - /')

Add or update tests covering this change, or — if the change genuinely cannot
be unit-tested — add the marker [skip-test-check] to the PR body explaining why.
EOF
exit 1
