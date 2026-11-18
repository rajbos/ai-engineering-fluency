#!/usr/bin/env bash
# Verify that what npm serves for <package>@<version> is the tarball this run attested,
# and that the registry holds an npm provenance (SLSA v1) attestation for it.
#
# Usage: verify-npm-publish.sh <package-name> <version> <tarball>
#
# The registry can take a little while to show a new version, so this polls for up to
# ~3 minutes before giving up.
set -euo pipefail

name="$1"
version="$2"
tarball="$3"

expected="sha512-$(openssl dgst -sha512 -binary "$tarball" | base64 -w0)"
echo "Local tarball:  $tarball"
echo "Local integrity: $expected"

dist=""
for attempt in $(seq 1 18); do
  if dist=$(npm view "${name}@${version}" dist --json 2>/dev/null) && [ -n "$dist" ]; then
    break
  fi
  echo "Waiting for ${name}@${version} to appear on the registry (attempt ${attempt}/18)..."
  sleep 10
  dist=""
done
if [ -z "$dist" ]; then
  echo "::error::${name}@${version} did not appear on the npm registry"
  exit 1
fi

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
