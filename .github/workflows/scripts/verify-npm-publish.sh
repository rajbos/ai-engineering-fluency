#!/usr/bin/env bash
# Verify that what npm serves for <package>@<version> is the tarball this run attested,
# and that the registry holds an npm provenance (SLSA v1) attestation for it.
#
# Usage: verify-npm-publish.sh <package-name> <version> <tarball>
#
# Exit codes:
#   0  npm serves the attested tarball, with SLSA v1 provenance
#   1  npm serves this version with a different integrity, or without SLSA v1
#      provenance. This is the security check: it is never retried away.
#   2  the version did not show up on the registry before the deadline (registry
#      propagation lag, not evidence of tampering). Callers may treat this as
#      "not verified yet" and verify again later.
#
# A new version can take minutes to show up: the packument (the all-versions document
# `npm view` reads) is served from a CDN with `Cache-Control: max-age=300`, and the
# "already published?" check earlier in the release warms that cache with the old
# version list. So this polls the per-version document, which is not CDN-cached, with
# a cache-busting query, and falls back to `npm view --prefer-online`. It backs off
# from 10 s to 60 s between attempts for up to ~15 minutes.
#
# Tunables (for tests; the workflows use the defaults):
#   VERIFY_NPM_TIMEOUT_SECONDS   total time to wait for the version (default 900)
#   VERIFY_NPM_INITIAL_DELAY     first delay between attempts in seconds (default 10)
#   VERIFY_NPM_MAX_DELAY         longest delay between attempts in seconds (default 60)
#   VERIFY_NPM_REGISTRY          registry base URL (default https://registry.npmjs.org)
set -euo pipefail

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <package-name> <version> <tarball>" >&2
  exit 1
fi

name="$1"
version="$2"
tarball="$3"

timeout_seconds="${VERIFY_NPM_TIMEOUT_SECONDS:-900}"
delay="${VERIFY_NPM_INITIAL_DELAY:-10}"
max_delay="${VERIFY_NPM_MAX_DELAY:-60}"
registry="${VERIFY_NPM_REGISTRY:-https://registry.npmjs.org}"
registry="${registry%/}"

expected="sha512-$(openssl dgst -sha512 -binary "$tarball" | base64 | tr -d '\n')"
echo "Local tarball:  $tarball"
echo "Local integrity: $expected"

# Print the version's `dist` object as JSON, or nothing if the registry does not have it yet.
fetch_dist() {
  # Scoped names are addressed as @scope%2fname.
  local encoded="${name/\//%2f}" doc dist
  if doc=$(curl -fsS --max-time 30 -H 'Cache-Control: no-cache' \
      "${registry}/${encoded}/${version}?cachebust=$(date +%s)-${RANDOM}" 2>/dev/null) \
    && dist=$(node -e '
        const d = JSON.parse(process.argv[1]);
        if (d && d.version === process.argv[2] && d.dist) process.stdout.write(JSON.stringify(d.dist));
      ' "$doc" "$version" 2>/dev/null) \
    && [ -n "$dist" ]; then
    printf '%s' "$dist"
    return 0
  fi
  if dist=$(npm view "${name}@${version}" dist --json --prefer-online --registry "${registry}/" 2>/dev/null) \
    && [ -n "$dist" ]; then
    printf '%s' "$dist"
    return 0
  fi
  return 1
}

dist=""
elapsed=0
attempt=0
while :; do
  attempt=$((attempt + 1))
  if dist=$(fetch_dist); then
    break
  fi
  dist=""
  if [ "$elapsed" -ge "$timeout_seconds" ]; then
    break
  fi
  echo "${name}@${version} is not on the registry yet (attempt ${attempt}, ${elapsed}s of ${timeout_seconds}s); retrying in ${delay}s..."
  sleep "$delay"
  elapsed=$((elapsed + delay))
  delay=$((delay * 3 / 2))
  if [ "$delay" -gt "$max_delay" ]; then delay="$max_delay"; fi
done

if [ -z "$dist" ]; then
  echo "::error::${name}@${version} did not appear on the npm registry within ${timeout_seconds}s (${attempt} attempts). The publish may still be propagating: this is not an integrity failure."
  exit 2
fi
echo "Found ${name}@${version} on the registry after ${attempt} attempt(s), ~${elapsed}s."

actual=$(node -e 'const d=JSON.parse(process.argv[1]); process.stdout.write(d.integrity || "")' "$dist")
predicate=$(node -e 'const d=JSON.parse(process.argv[1]); process.stdout.write((d.attestations && d.attestations.provenance && d.attestations.provenance.predicateType) || "")' "$dist")
echo "Registry integrity: $actual"
echo "Registry provenance predicate: ${predicate:-<none>}"

if [ "$actual" != "$expected" ]; then
  echo "::error::The registry tarball for ${name}@${version} is not the tarball this run attested"
  exit 1
fi
if [ "$predicate" != "https://slsa.dev/provenance/v1" ]; then
  echo "::error::${name}@${version} has no SLSA v1 provenance attestation on the npm registry"
  exit 1
fi
echo "✅ npm serves the attested tarball for ${name}@${version}, with SLSA v1 provenance"
