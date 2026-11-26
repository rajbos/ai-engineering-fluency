#!/usr/bin/env bash
# Scenario tests for verify-npm-publish.sh against stubbed `curl`, `npm` and `sleep`
# (no network, no waiting). Locally: bash .github/workflows/scripts/verify-npm-publish.test.sh
set -euo pipefail
SCRIPT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/verify-npm-publish.sh"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
FAILS=0

TARBALL="$TMP/pkg.tgz"
printf 'attested tarball bytes' > "$TARBALL"
GOOD="sha512-$(openssl dgst -sha512 -binary "$TARBALL" | base64 | tr -d '\n')"
BAD="sha512-$(printf 'other bytes' | openssl dgst -sha512 -binary | base64 | tr -d '\n')"
SLSA='"attestations":{"provenance":{"predicateType":"https://slsa.dev/provenance/v1"}}'

# Stubs read their behaviour from files in $STATE:
#   curl_from / npm_from : first attempt number at which the stub answers (0 = never)
#   curl_body / npm_body : what it answers with
# and log calls to curl.log / npm.log / sleep.log.
mkdir -p "$TMP/bin"
cat > "$TMP/bin/curl" <<'EOF'
#!/usr/bin/env bash
n=$(( $(wc -l < "$STATE/curl.log" 2>/dev/null || echo 0) + 1 ))
echo "$*" >> "$STATE/curl.log"
from=$(cat "$STATE/curl_from")
if [ "$from" -ne 0 ] && [ "$n" -ge "$from" ]; then cat "$STATE/curl_body"; exit 0; fi
echo "curl: (22) The requested URL returned error: 404" >&2; exit 22
EOF
cat > "$TMP/bin/npm" <<'EOF'
#!/usr/bin/env bash
n=$(( $(wc -l < "$STATE/npm.log" 2>/dev/null || echo 0) + 1 ))
echo "$*" >> "$STATE/npm.log"
from=$(cat "$STATE/npm_from")
if [ "$from" -ne 0 ] && [ "$n" -ge "$from" ]; then cat "$STATE/npm_body"; exit 0; fi
echo "npm error code E404" >&2; exit 1
EOF
cat > "$TMP/bin/sleep" <<'EOF'
#!/usr/bin/env bash
echo "$1" >> "$STATE/sleep.log"
EOF
chmod +x "$TMP/bin/"*

# scenario <name> <curl_from> <curl_body> <npm_from> <npm_body>
scenario() {
  STATE="$TMP/state-$1"; mkdir -p "$STATE"; export STATE
  echo "$2" > "$STATE/curl_from"; printf '%s' "$3" > "$STATE/curl_body"
  echo "$4" > "$STATE/npm_from";  printf '%s' "$5" > "$STATE/npm_body"
  : > "$STATE/sleep.log"
}

# expect <name> <exit-code> [extra env...]
expect() {
  local name="$1" want="$2" out rc; shift 2
  if out="$(env PATH="$TMP/bin:$PATH" VERIFY_NPM_REGISTRY="https://registry.example.test/" "$@" \
      bash "$SCRIPT" "@scope/pkg" "1.2.3" "$TARBALL" 2>&1)"; then rc=0; else rc=$?; fi
  LAST_OUT="$out"
  if [ "$rc" = "$want" ]; then echo "ok   - $name"; else
    echo "FAIL - $name (exit $rc, wanted $want)"; echo "$out" | sed 's/^/       /'; FAILS=$((FAILS+1)); fi
}
check() { if eval "$2"; then echo "ok   - $1"; else echo "FAIL - $1"; FAILS=$((FAILS+1)); fi; }

doc() { printf '{"name":"@scope/pkg","version":"%s","dist":{"integrity":"%s"%s}}' "$1" "$2" "${3:+,$3}"; }

scenario immediate 1 "$(doc 1.2.3 "$GOOD" "$SLSA")" 0 ""
expect "matching tarball on first attempt" 0
check "  no sleeping when found at once" '[ ! -s "$STATE/sleep.log" ]'
check "  per-version URL, scope encoded, cache-busted" 'grep -q "https://registry.example.test/@scope%2fpkg/1.2.3?cachebust=" "$STATE/curl.log"'

scenario lag 4 "$(doc 1.2.3 "$GOOD" "$SLSA")" 0 ""
expect "appears after registry lag" 0
check "  backs off 10 -> 15 -> 22" '[ "$(tr "\n" " " < "$STATE/sleep.log")" = "10 15 22 " ]'

scenario mismatch 1 "$(doc 1.2.3 "$BAD" "$SLSA")" 0 ""
expect "different integrity fails hard" 1
check "  mismatch is not retried" '[ ! -s "$STATE/sleep.log" ]'
check "  mismatch error is reported" 'grep -q "is not the tarball this run attested" <<<"$LAST_OUT"'

scenario lagmismatch 3 "$(doc 1.2.3 "$BAD" "$SLSA")" 0 ""
expect "different integrity after lag still fails hard" 1

scenario noprov 1 "$(doc 1.2.3 "$GOOD" "")" 0 ""
expect "missing provenance fails hard" 1

scenario wrongprov 1 "$(doc 1.2.3 "$GOOD" '"attestations":{"provenance":{"predicateType":"https://slsa.dev/provenance/v0.2"}}')" 0 ""
expect "non-v1 provenance fails hard" 1

scenario never 0 "" 0 ""
expect "never appears -> timeout exit 2" 2 VERIFY_NPM_TIMEOUT_SECONDS=120
check "  delays capped at 60s" '[ "$(tr "\n" " " < "$STATE/sleep.log")" = "10 15 22 33 49 " ]'
check "  timeout message says it is not an integrity failure" 'grep -q "not an integrity failure" <<<"$LAST_OUT"'

scenario defaulttimeout 0 "" 0 ""
expect "default deadline is ~15 minutes" 2
check "  sleeps add up to >= 900s" '[ "$(awk "{ s += \$1 } END { print s }" "$STATE/sleep.log")" -ge 900 ]'
check "  no delay above 60s" 'awk "\$1 > 60 { bad = 1 } END { exit bad }" "$STATE/sleep.log"'

scenario fallback 0 "" 2 "{\"integrity\":\"$GOOD\",$SLSA}"
expect "falls back to npm view when the version URL fails" 0
check "  npm view bypasses its cache" 'grep -q -- "--prefer-online" "$STATE/npm.log"'

scenario wrongversion 1 "$(doc 1.2.2 "$GOOD" "$SLSA")" 0 ""
expect "a document for another version is not accepted" 2 VERIFY_NPM_TIMEOUT_SECONDS=20

if [ "$FAILS" -ne 0 ]; then echo "$FAILS scenario(s) failed"; exit 1; fi
echo "All verify-npm-publish.sh scenarios passed"
