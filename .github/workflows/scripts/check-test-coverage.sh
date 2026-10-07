#!/usr/bin/env bash
# Deterministic "test coverage companion" check.
#
# Catches the class of review finding "new source logic added without any test
# changes" without needing an LLM: if a PR touches production source files but
# no test files, the change ships without CI-visible test coverage updates and
# this job fails.
#
# Inputs (env):
#   BASE_SHA  — PR base sha (falls back to HEAD^)
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
#
# Changes that add no new logic need no test companion (the existing suite —
# type-check, lint, tests — still has to pass). Decisions key on added-line
# counts and content, never on a rename alone, so a rename cannot hide an edit:
#   - Deletion-only: a source file with 0 added lines (removed dead code or an
#     unused import, or a file deleted outright).
#   - Pure rename: a rename (git -M, >=50% similar) whose added lines are all
#     import/require/export-from statements (0 added lines = 100% similar).
#     A rename that adds any other line still needs a test change.
#   - Import-path update: a modified (non-renamed) source file whose added
#     lines are all import/require lines that point at a file renamed in this
#     same PR (matched by new file basename). Anything else needs a test.
#     Limit: only single-line import statements are recognised; a multi-line
#     import block that is reformatted counts as real logic. Use
#     [skip-test-check] for such cases.
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

if git merge-base "$BASE_SHA" "$HEAD_SHA" >/dev/null 2>&1; then
  RANGE=("${BASE_SHA}...${HEAD_SHA}")
else
  RANGE=("${BASE_SHA}" "${HEAD_SHA}")
fi

# NUL-delimited numstat with rename detection. Records are
# "<added>\t<deleted>\t<path>\0" or, for renames,
# "<added>\t<deleted>\t\0<old>\0<new>\0".
REC_ADDED=(); REC_OLD=(); REC_PATH=()
while IFS= read -r -d '' rec <&3; do
  IFS=$'\t' read -r added _deleted file <<< "$rec"
  old=""
  if [ -z "$file" ]; then
    IFS= read -r -d '' old <&3
    IFS= read -r -d '' file <&3
  fi
  REC_ADDED+=("$added"); REC_OLD+=("$old"); REC_PATH+=("$file")
done 3< <(git diff -M --numstat -z "${RANGE[@]}")

if [ "${#REC_PATH[@]}" -eq 0 ]; then
  echo "Empty changeset; nothing to check. PASS."
  exit 0
fi

is_test_file() {
  case "$1" in
    */test/*|*/tests/*|*/__tests__/*|test/*|tests/*|__tests__/*) return 0 ;;
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

# One added diff line that is purely a static single-line import,
# `export ... from` re-export or `const x = require(...)`. A plain
# `export const x = "..."` is deliberately NOT matched: it adds data/logic.
Q="['\"]"
IMPORT_LINE_RE="^\+[[:space:]]*(import[[:space:]]+(type[[:space:]]+)?([^;='\"]+[[:space:]]+from[[:space:]]*)?${Q}[^'\"]+${Q}|export[[:space:]]+(type[[:space:]]+)?(\*([[:space:]]+as[[:space:]]+[A-Za-z_\$][A-Za-z0-9_\$]*)?|\{[^}]*\})[[:space:]]*from[[:space:]]*${Q}[^'\"]+${Q}|\}[[:space:]]*from[[:space:]]*${Q}[^'\"]+${Q}|(const|let|var)[[:space:]]+[A-Za-z_\$][A-Za-z0-9_\$]*[[:space:]]*=[[:space:]]*require\([[:space:]]*${Q}[^'\"]+${Q}[[:space:]]*\))[[:space:]]*;?[[:space:]]*(//.*)?$"

# added_lines <old-or-empty> <path>: the added lines of one file's diff.
added_lines() {
  git diff -M -U0 --no-ext-diff "${RANGE[@]}" -- ${1:+"$1"} "$2" | grep '^+' | grep -v '^+++' || true
}

# Basenames (no extension) of files renamed within this PR.
RENAMED_BASENAMES=""
for i in "${!REC_PATH[@]}"; do
  if [ -n "${REC_OLD[$i]}" ]; then
    b="$(basename "${REC_PATH[$i]}")"
    RENAMED_BASENAMES="${RENAMED_BASENAMES}${b%.*}"$'\n'
  fi
done

# only_imports <lines> [renamed]: every line is an import statement; with
# "renamed", each must also point at a file renamed in this PR.
only_imports() {
  local line target base
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    [[ "$line" =~ $IMPORT_LINE_RE ]] || return 1
    if [ "${2:-}" = "renamed" ]; then
      target="$(printf '%s' "$line" | grep -oE "${Q}[^'\"]+${Q}" | tail -1 | tr -d "'\"")"
      base="$(basename "$target")"; base="${base%.*}"
      printf '%s' "$RENAMED_BASENAMES" | grep -qxF "$base" || return 1
    fi
  done <<< "$1"
  return 0
}

SOURCE_FILES=""
DELETION_ONLY_FILES=""
RENAME_ONLY_FILES=""
IMPORT_ONLY_FILES=""
TEST_FILES=""
for i in "${!REC_PATH[@]}"; do
  file="${REC_PATH[$i]}"; old="${REC_OLD[$i]}"; added="${REC_ADDED[$i]}"
  if is_test_file "$file"; then
    TEST_FILES="${TEST_FILES}${file}"$'\n'
  elif is_source_file "$file"; then
    if [ "$added" = "0" ] && [ -z "$old" ]; then
      DELETION_ONLY_FILES="${DELETION_ONLY_FILES}${file}"$'\n'
    elif [ -n "$old" ] && { [ "$added" = "0" ] || only_imports "$(added_lines "$old" "$file")"; }; then
      RENAME_ONLY_FILES="${RENAME_ONLY_FILES}${old} -> ${file}"$'\n'
    elif [ -z "$old" ] && [ "$added" != "-" ] && only_imports "$(added_lines "" "$file")" renamed; then
      IMPORT_ONLY_FILES="${IMPORT_ONLY_FILES}${file}"$'\n'
    else
      SOURCE_FILES="${SOURCE_FILES}${file}"$'\n'
    fi
  fi
done

if [ -z "$SOURCE_FILES" ]; then
  if [ -n "${DELETION_ONLY_FILES}${RENAME_ONLY_FILES}${IMPORT_ONLY_FILES}" ]; then
    echo "Source changes add no new logic (deletions, pure renames, import-path updates); no test companion needed. PASS."
    if [ -n "$DELETION_ONLY_FILES" ]; then
      echo "Deletion-only source files:"; printf '%s' "$DELETION_ONLY_FILES" | sed 's/^/  - /'
    fi
    if [ -n "$RENAME_ONLY_FILES" ]; then
      echo "Pure renames:"; printf '%s' "$RENAME_ONLY_FILES" | sed 's/^/  - /'
    fi
    if [ -n "$IMPORT_ONLY_FILES" ]; then
      echo "Import-path updates for renamed files:"; printf '%s' "$IMPORT_ONLY_FILES" | sed 's/^/  - /'
    fi
  else
    echo "No production source files changed. PASS."
  fi
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

Deletion-only changes, pure renames (import-path edits only) and import-path
updates for files renamed in the same PR are exempt automatically; the files
above add other lines.

Add or update tests covering this change, or — if the change genuinely cannot
be unit-tested — add the marker [skip-test-check] to the PR body explaining why.
EOF
exit 1
