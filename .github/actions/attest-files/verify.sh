#!/usr/bin/env bash
# Verify the build-provenance attestations the attest-files action just created.
#
# Env (set by action.yml):
#   SUBJECT_PATH  newline-separated paths/globs of the attested files
#   RELEASE_TAG   optional release tag whose same-named assets are verified too
#   GH_TOKEN      token for gh
# Standard runner env: GITHUB_REPOSITORY, GITHUB_WORKFLOW_REF, GITHUB_REF, RUNNER_TEMP.
#
# Verification is pinned to the exact signer the slide-deck check asks for: this
# repository, this workflow file, this ref, and GitHub-hosted runners only. A file
# signed by any other workflow (or a self-hosted runner) fails here.
set -euo pipefail

# "owner/repo/.github/workflows/file.yml@refs/..." -> "owner/repo/.github/workflows/file.yml"
SIGNER_WORKFLOW="${GITHUB_WORKFLOW_REF%@*}"

verify() {
  local file="$1"
  echo "sha256 $(sha256sum "$file" | cut -d' ' -f1)  $file"
  gh attestation verify "$file" \
    --repo "$GITHUB_REPOSITORY" \
    --signer-workflow "$SIGNER_WORKFLOW" \
    --source-ref "$GITHUB_REF" \
    --deny-self-hosted-runners \
    --predicate-type https://slsa.dev/provenance/v1
}

shopt -s nullglob
files=()
while IFS= read -r pattern; do
  pattern="${pattern#"${pattern%%[![:space:]]*}"}"
  pattern="${pattern%"${pattern##*[![:space:]]}"}"
  [ -z "$pattern" ] && continue
  # Unquoted on purpose: expand the glob.
  # shellcheck disable=SC2206
  matches=( $pattern )
  if [ ${#matches[@]} -eq 0 ]; then
    echo "::error::No file matches '$pattern'"
    exit 1
  fi
  files+=( "${matches[@]}" )
done <<< "$SUBJECT_PATH"

for file in "${files[@]}"; do
  verify "$file"
done
echo "✅ Verified ${#files[@]} attested file(s) against $SIGNER_WORKFLOW @ $GITHUB_REF"

if [ -z "${RELEASE_TAG:-}" ]; then
  exit 0
fi

# Prove the bytes users download from the release are the attested bytes.
assets=$(gh release view "$RELEASE_TAG" --repo "$GITHUB_REPOSITORY" --json assets --jq '.assets[].name')
download_dir="$RUNNER_TEMP/attest-files-release"
rm -rf "$download_dir"
mkdir -p "$download_dir"
checked=0
for file in "${files[@]}"; do
  name="$(basename "$file")"
  if ! grep -Fxq "$name" <<< "$assets"; then
    echo "::warning::$name is not an asset of release $RELEASE_TAG; nothing to verify there."
    continue
  fi
  gh release download "$RELEASE_TAG" --repo "$GITHUB_REPOSITORY" \
    --pattern "$name" --dir "$download_dir" --clobber
  verify "$download_dir/$name"
  checked=$((checked + 1))
done
echo "✅ Verified $checked release asset(s) of $RELEASE_TAG"
