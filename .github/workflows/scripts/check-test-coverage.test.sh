#!/usr/bin/env bash
# Scenario tests for check-test-coverage.sh using isolated temp git repos.
# Run by the test-coverage-check job in ci.yml. Locally: bash .github/workflows/scripts/check-test-coverage.test.sh
set -uo pipefail
SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/check-test-coverage.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAILS=0

LOGIC=$'export function a(x: number) {\n  return x + 1;\n}\nexport function b(x: number) {\n  return x * 2;\n}\nexport function c(x: number) {\n  return x - 3;\n}\nexport function d(x: number) {\n  return x / 4;\n}\n'

new_repo() {
  local d="$TMP/$1"; mkdir -p "$d/src" "$d/vscode-extension/test/unit"; cd "$d"
  git init -q . && git config user.email t@t && git config user.name t && git config commit.gpgsign false
  printf "import { z } from './oldName';\n%s" "$LOGIC" > src/a.ts
  printf "%s" "$LOGIC" > src/oldName.ts
  printf "import { a } from './oldName';\nexport const k = a(1);\n" > src/user.ts
  git add -A && git commit -qm base
}

# expect <name> <exit-code>
expect() {
  local out rc
  out="$(BASE_SHA="$(git rev-parse HEAD~1)" HEAD_SHA="$(git rev-parse HEAD)" PR_BODY="${PR_BODY:-}" bash "$SCRIPT" 2>&1)"; rc=$?
  if [ "$rc" = "$2" ]; then echo "ok   - $1"; else echo "FAIL - $1 (exit $rc, wanted $2)"; echo "$out" | sed 's/^/       /'; FAILS=$((FAILS+1)); fi
}
commit() { git add -A && git commit -qm change; }

new_repo del;       git rm -q src/oldName.ts; commit;                                   expect "deletion-only" 0
new_repo del2;      printf "%s" "$LOGIC" > src/a.ts; commit;                            expect "deleted import line only" 0
new_repo ren100;    git mv src/oldName.ts src/newName.ts; commit;                       expect "100% rename" 0
new_repo renlogic;  git mv src/oldName.ts src/newName.ts; echo 'export const sneaky = () => fetch("x");' >> src/newName.ts; commit; expect "rename + logic edit" 1
new_repo renexport; git mv src/oldName.ts src/newName.ts; echo 'export const mode = "new";' >> src/newName.ts; commit; expect "rename + exported string constant" 1
new_repo renimp;    mkdir -p src/sub; git mv src/a.ts src/sub/a.ts; sed -i "s#'./oldName'#'../oldName'#" src/sub/a.ts; commit; expect "rename moving dir + re-pointed import" 0
new_repo renreexp;  git mv src/oldName.ts src/newName.ts; echo "export { q } from './other';" >> src/newName.ts; commit; expect "rename + fresh re-export" 1
new_repo renfresh;  git mv src/oldName.ts src/newName.ts; echo "import './sideEffect';" >> src/newName.ts; commit; expect "rename + fresh side-effect import" 1
new_repo importfresh; git mv src/oldName.ts src/newName.ts; echo "import { n } from './newName';" >> src/user.ts; commit; expect "importer gains a fresh import" 1
new_repo moveIn;    mkdir -p examples; git mv src/oldName.ts examples/oldName.ts; commit; git mv examples/oldName.ts src/moved.ts; commit; expect "move from outside src/ into src/" 1
new_repo importer;  git mv src/oldName.ts src/newName.ts; sed -i "s#./oldName#./newName#" src/user.ts; commit; expect "rename + importer path update" 0
new_repo importbad; git mv src/oldName.ts src/newName.ts; sed -i "s#./oldName#./elsewhere#" src/user.ts; commit; expect "import swapped to non-renamed module" 1
new_repo plain;     echo 'export const x = 1;' >> src/a.ts; commit;                     expect "plain source change, no test" 1
new_repo withtest;  echo 'export const x = 1;' >> src/a.ts; echo t > vscode-extension/test/unit/a.test.ts; commit; expect "source change with test" 0
new_repo skip;      echo 'export const x = 1;' >> src/a.ts; commit; PR_BODY="[skip-test-check] layout" expect "[skip-test-check] marker" 0

[ "$FAILS" = 0 ] && echo "all passed" || { echo "$FAILS failed"; exit 1; }
