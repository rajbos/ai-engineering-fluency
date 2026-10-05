---
description: "Prep version bumps for a new release: detect which components changed since their last release tag, bump versions, create a release-prep branch, commit, push, and open a PR. Outputs which GitHub Actions workflows to run after merging."
name: "Prep Release"
tools: ["execute/runInTerminal", "execute/getTerminalOutput", "read/terminalLastCommand", "search/codebase"]
---

# Prep Release Agent

Automates the version-bump PR needed before publishing a new release.
Detects which of the four releasable components have changed, bumps their version numbers, writes their changelog sections, opens a release-prep branch and PR, and tells the user exactly which GitHub Actions workflows to trigger after merging.

## Releasable Components

| Component | Version file | Last release tag prefix | Workflow to run after merge |
|-----------|-------------|------------------------|----------------------------|
| **VS Code extension** | `vscode-extension/package.json` → `version` | `vscode/v` | `release.yml` (Actions → _Extensions - Release_ → Run workflow) |
| **CLI** | `cli/package.json` → `version` | `cli/v` | `cli-publish.yml` (Actions → _CLI - Publish to npm and GitHub_ → Run workflow) |
| **Visual Studio extension** | `visualstudio-extension/src/AIEngineeringFluency/source.extension.vsixmanifest` → `Identity.Version` | `vs/v` | `visualstudio-build.yml` (Actions → _Visual Studio Extension - Build & Package_ → Run workflow, set `publish_marketplace: true`) |
| **Desktop app** | `desktop/package.json` → `version` | `desktop/v` | `desktop-publish.yml` — triggered by pushing a `desktop/vX.Y.Z` tag (see Step 11); a manual run only builds an installer and releases nothing |

---

## Step-by-Step Instructions

### Step 1 — Determine the default bump type

If the user didn't specify a bump type, ask:
> "What kind of version bump should I apply? (patch / minor / major) — or specify per-component."

Default to **patch** if the user doesn't specify.

Individual overrides per component are also valid (e.g. "minor for vscode, patch for cli, skip vs").

### Step 2 — Find last release tags for each component

Run these four commands to find the most recent release tag for each component:

```bash
git tag --sort=-version:refname | grep '^vscode/v' | head -1
git tag --sort=-version:refname | grep '^cli/v' | head -1
git tag --sort=-version:refname | grep '^vs/v' | head -1
git tag --sort=-version:refname | grep '^desktop/v' | head -1
```

Record the result for each. If no tag exists for a component, treat it as "never released" and compare against `origin/main`.

### Step 3 — Detect which components have changed

For each component, diff from the last tag (or `origin/main` if no tag) to `HEAD`:

```bash
# VS Code extension
git diff --name-only <last-vscode-tag>...HEAD -- vscode-extension/

# CLI
git diff --name-only <last-cli-tag>...HEAD -- cli/

# Visual Studio extension
git diff --name-only <last-vs-tag>...HEAD -- visualstudio-extension/

# Desktop app (its own code plus everything it bundles)
git diff --name-only <last-desktop-tag>...HEAD -- desktop/ vscode-extension/src/webview/ cli/src/ src/
```

If **no tag** exists, use:
```bash
git merge-base origin/main HEAD   # get the merge base
git diff --name-only <merge-base> -- <path>/
```

A component **has changes** if the diff output is non-empty.

Also note: changes to shared `src/` files (e.g. `tokenEstimators.json`, `modelPricing.json`, `toolNames.json`) are relevant to the VS Code extension. The VS extension build also depends on changes to `cli/` and shared `src/*.ts` files — if those changed since the last VS tag, include the VS extension in the bump.

The desktop app ships the VS Code extension's webview bundles and imports the CLI's stats logic and the shared `src/` modules from source, so a change to any of those changes what the desktop app shows. That is why its diff above covers `vscode-extension/src/webview/`, `cli/src/` and `src/` as well as `desktop/`: whenever the VS Code extension is bumped for a webview change, the desktop app normally needs a bump too, or its users stay on the old views.

If no `desktop/v` tag exists yet, the desktop app has never been released: release the version already in `desktop/package.json` as-is (do not bump it), and list it in the plan as a first release.

**Tag staleness warning**: a release tag can lag behind reality — a version can already be bumped and published to npm/Marketplace without its matching tag ever being created (e.g. `cli/v0.2.10` was still the latest tag while `cli/package.json` and the npm registry were already at `0.2.11`). Don't trust `git diff <last-tag>...HEAD` blindly. Cross-check the actual current version against the live source of truth first — `npm view <package-name> version` for the CLI, the VS Code/VS Marketplace listing for the extensions — and find the real last version-bump commit with `git log -- <version-file>` if the tag looks stale. Diffing from a stale tag will pull in already-released changes and produce a misleading "what's new" picture.

### Step 4 — Read current versions

```bash
node -p "require('./vscode-extension/package.json').version"
node -p "require('./cli/package.json').version"
node -p "require('./desktop/package.json').version"
```

For the VS extension, read the `Version` attribute from the `<Identity>` element in `visualstudio-extension/src/AIEngineeringFluency/source.extension.vsixmanifest`.

### Step 5 — Confirm the plan with the user

Before making any changes, summarize the plan:

```
## Release Prep Plan

| Component | Last tag | Current version | New version | Change? |
|-----------|----------|-----------------|-------------|---------|
| VS Code extension | vscode/v0.0.27 | 0.0.27 | 0.0.28 (patch) | ✅ yes |
| CLI | cli/v0.0.7 | 0.0.7 | 0.0.8 (patch) | ✅ yes |
| Visual Studio extension | vs/v1.0.4 | 1.0.4 | — | ❌ no changes |
| Desktop app | desktop/v0.1.0 | 0.1.0 | 0.1.1 (patch) | ✅ yes (webview changes) |

Branch: release/prep-2026-04-09
```

Ask the user to confirm before proceeding.

### Step 6 — Bump version numbers

For VS Code extension (if changed):
```bash
cd vscode-extension
npm version <bump-type> --no-git-tag-version
cd ..
```

For CLI (if changed):
```bash
cd cli
npm version <bump-type> --no-git-tag-version
cd ..
```

For Desktop app (if changed):
```bash
cd desktop
npm version <bump-type> --no-git-tag-version
cd ..
```

For Visual Studio extension (if changed), update the `Version` attribute in the `<Identity>` element of `visualstudio-extension/src/AIEngineeringFluency/source.extension.vsixmanifest`. Use the `edit` tool to make a targeted string replacement. The current value will be something like `Version="1.0.4"` — replace only the version number, not the whole line.

### Step 6b — Write the changelog section

The changelog *is* the release notes. Each release workflow copies the `## [<version>]` section of its component's `CHANGELOG.md` into the GitHub release: `release.yml` (VS Code) **refuses to release** (before tagging) when that section is missing, and `cli-publish.yml` / `visualstudio-publish.yml` fall back to GitHub's generated PR list with a warning. So it must be written in this PR, where it reaches `main` together with the version bump. Nothing else writes it.

The desktop app is the exception: it has no `CHANGELOG.md`, and `desktop-publish.yml` uses GitHub's generated notes. Skip this step for it.

For each other bumped component — `<component>` is `vscode-extension`, `cli` or `visualstudio-extension`, and `<new-version>` is *that component's* new version:

1. Check that `[Unreleased]` covers what is shipping. Compare it with `git log --oneline <last-tag>..origin/main -- <component>/ src/` and add a short, user-facing line for each notable feature or fix that is missing, with its PR number in parentheses. Skip dependency bumps, friendly-name imports and pure refactors. Use the existing `### Changed` / `### Features` / `### Bug Fixes` / `### Chores` headings.
2. Promote it:
   ```bash
   node scripts/release-changelog.js promote <component>/CHANGELOG.md <new-version>
   ```
   This moves the entries into `## [<new-version>] - <today>` and leaves an empty `## [Unreleased]` above it. It fails when `[Unreleased]` is empty: write the entries (step 1) rather than skipping the section.
3. Confirm the workflow will accept it:
   ```bash
   node scripts/release-changelog.js extract <component>/CHANGELOG.md <new-version>
   ```

### Step 7 — Create a release-prep branch

```bash
git checkout -b release/prep-YYYY-MM-DD
```

Use today's date. If the branch already exists, append a short suffix (e.g. `-2`).

### Step 8 — Commit the version bump files

Stage only the version and changelog files:
```bash
git add vscode-extension/package.json vscode-extension/package-lock.json   # if VS Code changed
git add cli/package.json cli/package-lock.json                              # if CLI changed
git add visualstudio-extension/src/AIEngineeringFluency/source.extension.vsixmanifest  # if VS changed
git add desktop/package.json desktop/package-lock.json                      # if Desktop changed
git add <component>/CHANGELOG.md   # for each component promoted in Step 6b
```

Commit with a descriptive message:
```bash
git commit -m "chore: bump versions for release (<list bumped components>)

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"
```

### Step 9 — Push and create a PR

```bash
git push origin release/prep-YYYY-MM-DD
```

Create the PR:
```bash
gh pr create \
  --title "chore: bump versions for release (<list components>)" \
  --body "$(cat <<'EOF'
## Release prep — version bumps

This PR bumps version numbers for components that have changed since their last release tags, and moves their `[Unreleased]` changelog entries into the new version's section.

| Component | Old version | New version |
|-----------|-------------|-------------|
| VS Code extension | v0.0.27 | v0.0.28 |
...

### After merging, run these workflows:

- **Extensions - Release** (`release.yml`) — publishes VS Code extension v0.0.28
...
EOF
)" \
  --base main \
  --head release/prep-YYYY-MM-DD
```

### Step 10 — Output the next steps

After the PR is created, output a clear summary:

```markdown
## ✅ Release prep PR created

**PR:** <url>

---

### After the PR is merged, run these workflows:

#### 1. VS Code Extension (if bumped)
- Go to **Actions → Extensions - Release → Run workflow** (on `main`)
- This publishes VS Code extension **vX.X.X** to the VS Code Marketplace
- Optionally set `publish_marketplace: true` (default: true for workflow_dispatch)

#### 2. CLI (if bumped)
- Go to **Actions → CLI - Publish to npm and GitHub → Run workflow** (on `main`)
- This publishes **@rajbos/ai-engineering-fluency@X.X.X** to npm

#### 3. Visual Studio Extension (if bumped)
- Go to **Actions → Visual Studio Extension - Build & Package → Run workflow** (on `main`)
- Set `publish_marketplace: true` to publish to the Visual Studio Marketplace

#### 4. Desktop app (if bumped)
- Push a `desktop/vX.X.X` tag on `main` (see Step 11) — do not use Run workflow, which only builds
- This publishes the **Desktop App vX.X.X** installer and moves the auto-update feed, so installed apps update themselves
```

See Step 11 below for the exact, safe way to trigger these — the naive "Run workflow with defaults" can bump the CLI version a second time or rebuild the untouched Visual Studio extension.

### Step 11 — Trigger the release pipelines after the PR merges

Once the release-prep PR is merged, trigger the actual publish workflows. Do not just click "Run workflow" with all defaults — for both workflows the defaults can do more (or different) than intended.

#### CLI — push a tag, don't use `workflow_dispatch`

`cli-publish.yml`'s `workflow_dispatch` path (`version_bump` input) **re-bumps `cli/package.json` itself** via `npm version <bump-type>` before publishing. Since the release-prep PR already bumped and merged the version, running `workflow_dispatch` (e.g. with `patch`) bumps it *again* (0.2.12 → 0.2.13) and publishes a version nobody reviewed — the merged 0.2.12 never gets published.

Instead, push a git tag matching the already-merged version to trigger the workflow's tag-push path. That path publishes the current `package.json` version as-is and verifies it matches the tag (fails loudly if not) — no re-bump:

```bash
git fetch origin main
git tag -a cli/vX.Y.Z origin/main -m "Release cli/vX.Y.Z"
git push origin cli/vX.Y.Z
```

This also creates the GitHub release automatically — no separate `gh release create` step needed.

#### VS Code extension — pass `vscode_only=true` if only the VS Code extension was bumped

`release.yml`'s `workflow_dispatch` defaults to building **both** the VS Code extension and the Visual Studio extension (`vscode_only` defaults to `false`, and the `build-visualstudio` job only skips when `vscode_only == true`). If the release-prep PR only bumped the VS Code extension, running with defaults also rebuilds/republishes the Visual Studio extension at its unchanged version.

```bash
gh workflow run "Extensions - Release" --ref main \
  -f create_tag=true \
  -f publish_marketplace=true \
  -f vscode_only=true \
  -f vs_only=false \
  -f publish_pre_release=false
```

Only set `vscode_only=false` when the Visual Studio extension was *also* bumped in this release and should be published too.

#### Desktop app — push a tag; `workflow_dispatch` publishes nothing

`desktop-publish.yml` only releases on a tag **push**. Running it manually (even against a tag) builds the installer as a workflow artifact and stops there — useful for trying an installer, useless for releasing. Push a tag matching the already-merged `desktop/package.json` version; the workflow fails loudly if the two differ:

```bash
git fetch origin main
git tag -a desktop/vX.Y.Z origin/main -m "Release desktop/vX.Y.Z"
git push origin desktop/vX.Y.Z
```

This creates the **Desktop App vX.Y.Z** GitHub release with the installer and then updates the `desktop-latest` update feed that installed apps read. Never delete or hand-edit the `desktop-latest` release or tag: installed apps stop finding updates without it.

---

## Important Rules

- **Never bump a component that has no changes** since its last release tag (unless the user explicitly asks).
- **Always confirm the plan with the user** before creating files/branches/PRs (Step 5).
- **Dry-run mode**: If the user says "preview", "dry run", or "check only", stop after Step 5 without making any changes.
- **Only stage version and changelog files** in the commit — do not stage other changes.
- **Never release without a changelog section.** `release.yml` fails when `vscode-extension/CHANGELOG.md` has no `## [<version>]` section, and the CLI and Visual Studio releases fall back to a bare PR list; write each bumped component's section in this PR (Step 6b), not after the release.
- **Use `--no-git-tag-version`** with `npm version` to prevent npm from creating a git tag automatically.
- The VS extension's `<Identity Version="...">` is on a different line than `<PackageManifest Version="2.0.0">` — make sure to update only the `<Identity>` element.
- After `npm version`, also stage the `package-lock.json` — npm updates both files.
- **Never trigger the CLI publish workflow via `workflow_dispatch` right after merging a release-prep PR** — it re-bumps the version itself and will publish a version one patch ahead of the one just merged. Push a `cli/vX.Y.Z` tag instead (see Step 11).
- **Release the desktop app by tag push only** (`desktop/vX.Y.Z`, see Step 11) — a manual run of `desktop-publish.yml` never publishes.
- **Bump the desktop app when what it bundles changed**, not only when `desktop/` did: webview, `cli/src/` and shared `src/` changes all reach its users only through a new desktop release.
- **Always pass `vscode_only=true`** to the `Extensions - Release` workflow when only the VS Code extension changed — otherwise it also rebuilds/republishes the unchanged Visual Studio extension.

## Error Handling

- If `git push` fails (e.g. branch exists on remote), try `git push origin release/prep-YYYY-MM-DD-2`.
- If `gh pr create` fails, output the full `git push` URL instead and tell the user to create the PR manually.
- If any command fails unexpectedly, explain the error and ask the user how to proceed.
