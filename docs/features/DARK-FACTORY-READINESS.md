# Dark Factory Readiness — a per-repository control scan

The **AI Readiness** tab in **Usage Analysis** (or the **Show AI Readiness** command) assesses each
repository in the workspace against the software-development "dark factory" maturity ladder. Each
repository expands to the whole ladder: every stage, every check in it and that check's state, so
work already done towards a later stage is visible even while an earlier stage is still open. The
stage to work on next starts expanded. It is separate from the personal Fluency Score
view; opening or refreshing that score no longer runs a repository scan.

A dark factory is *not* vibe coding at scale. It is a governed, observable production system in
which humans specify intent, constraints, risk and evidence of success, while agents implement and
validate. The ladder therefore measures **governance and evidence controls**, not AI adoption.

## Two rules that shape the whole design

1. **Measure controls, never claim autonomy.** The scan reports what a repository has. It never
   tells anyone they are ready to go dark — a green build from an unbounded agent is weak evidence.
2. **Per product line, never per person.** The unit of assessment is the repository. Nothing in this
   feature reads, derives or reports anything about an individual developer. That is deliberate:
   the research this comes from explicitly warns against individual performance scoring.

## The ladder

| Stage | Name | What it means |
|---|---|---|
| 0 | Manual / fragmented | Human coding, inconsistent repos and releases. The outcome sought is visibility, not autonomy. |
| 1 | Standardized software delivery | Automated builds, tests on every change, dependency updates, a protected main branch. Nothing above this is trustworthy without it. |
| 2 | AI-assisted engineers | Developers remain the authors; repository instructions steer assistants; AI policy is written down. |
| 3 | Agent-delegated, human-reviewed | Bounded work packages. An agent may branch, implement, test and open a PR — but cannot approve or merge its own work. |
| 4 | Spec-driven autonomous team | Versioned specifications, acceptance scenarios, independent evaluators, risk classification, progressive delivery. |
| 5 | Bounded dark factory | **Never awarded by this scan.** Hidden holdouts, digital twins, automated rollback and explicit legal accountability are not machine-detectable, and a completely human-free merge path is not the current native GitHub model. |

## The two detection tiers

| Tier | Needs auth? | Examples |
|---|---|---|
| **Filesystem** | No | `.github/workflows/*`, `.devcontainer/` or `copilot-setup-steps.yml`, `.github/agents/`, `.github/skills/`, Issue Forms, Dependabot or Renovate configuration, `.github/copilot-instructions.md`, `AGENTS.md`, IaC markers, AI review workflows, agentic workflow definitions |
| **GitHub API** | Yes | Rulesets and branch protection, required checks, merge queue, environment protection rules, CodeQL / dependency review / secret scanning enablement, artifact attestations |

The API tier is expected to be unavailable or partially denied — a token may be absent,
fine-grained, or refused on a private repository. That is the common case, not the edge case.

## Required, recommended and not applicable

Not every control makes sense for every repository, and not every good practice is a precondition
for delegating work to agents. Three mechanisms keep the ladder from demanding the wrong thing:

- **Recommended controls** (`"recommended": true` in the catalogue) are listed and can be picked
  for the Copilot prompt, but never block a stage and are not counted as missing evidence. Today
  those are **Reproducible environment** (a dev container or `copilot-setup-steps.yml`: useful, but
  a repository delivers reliably without one) and **Artifact attestations**. Attestations are the
  evidence that the artefact shipped is the one the governed pipeline built, which matters once
  nobody reads every line, but it is a supply-chain control first. So it sits at stage 4 as advice
  rather than at stage 1 as a gate.
- **Not applicable** is a fourth control state. *Infrastructure as code*, *Deployment environments*
  and *Environment protection rules* only apply when a workflow is seen deploying to cloud
  infrastructure (a cloud deploy action, or `terraform` / `kubectl` / `helm` / `az` / `aws` /
  `gcloud` deploy commands). A desktop app, an extension or a library that only builds, tests and
  publishes gets `not-applicable`, which neither blocks the stage nor counts as unchecked. Signing
  in to a cloud, or pushing a package or container image, is not treated as a deployment.
- **GitHub-only controls** (`"platform": "github"`) are not judged absent when the repository's
  `origin` remote is on another host. They report `unknown` with the reason, because this scan has
  no way to look for the equivalent there. A control that was positively found still counts, and a
  repository with no remote at all is still checked. A GitHub Enterprise Server remote reads as
  "another host" until the enterprise URI setting is configured.

Two controls the first version required were dropped: **CODEOWNERS** (review is already enforced
by the *Human review enforced on merge* control, and a CODEOWNERS file is neither necessary nor
sufficient for that) and **Reusable workflows** (how a team shares its CI definitions says nothing
about whether one repository is ready).

### The independent evaluator

The implementing agent must not be the only judge of its own change. Any of these satisfies the
*Independent evaluator* control: a review, test or security agent under `.github/agents/`; a
workflow that requests Copilot code review or runs an AI review action; an AI review tool's
configuration file; or, from the pull-request statistics the view already fetched, an AI reviewer
having actually been requested on pull requests. Copilot code review switched on through a ruleset
or an organization policy leaves no file, so *not found* resolves to `unknown`, never `absent`.
For the same reason there is no "no independent evaluator" anti-pattern any more.

## `present`, `absent`, and `unknown`

A control has three evidence states, and `unknown` is a first-class one. It is never collapsed into a pass or
a fail. The scan turns that into a **band** rather than a single number:

- **`confirmedStage`** — the highest stage whose required, applicable controls are *all* observed present. Unknowns never
  lift it, so it is a lower bound.
- **`ceilingStage`** — the highest stage nothing observed rules out. Unknowns are treated
  optimistically here, so it is an upper bound, not a claim.

A repository with good files but no GitHub token typically reads *"Stage 0 confirmed · up to Stage 3
unverified — 9 controls not checked"*. That is the honest answer, and the gap is exactly the
evidence the scan could not reach.

Three further honesty rules, all enforced in `resolveControl()`:

- A control with **no observation at all** is `unknown`, never `absent`.
- A control marked `unknownWhenAbsent` (presence is observable, absence is not) reports `unknown`
  rather than `absent`. CodeQL is the clearest case: its *default setup* leaves no file in the
  repository, so a missing `codeql.yml` says nothing about whether scanning is on.
- A **governance** control (`ai-policy`, `risk-classification`) is always `unknown`. A written policy
  cannot be observed by a scanner, so the scan says so instead of guessing. This also means no
  repository is ever reported as fully evidenced.

The collector applies the same rule one level down, in `darkFactorySignals.ts`: **`absent` is only
reported when every path the control needed was actually readable.** A directory that exists but
cannot be read (`EACCES`, `EIO`, …) and a workflow scan cut short by the file cap are both missing
evidence, so they downgrade the result to `unknown`. `ENOENT` and `ENOTDIR` are the exception — those
mean the path genuinely is not there, which is a real answer. Because unreadable evidence can only
ever produce a false *absence* and never a false presence, a positive match is always reported as
`present` even when the surrounding scan was incomplete.

Controls detected by pattern matching are labelled **heuristic** in the UI — they produce
candidates, not verdicts.

## Anti-patterns

Findings surface the anti-patterns from the research that are actually observable:

| Finding | Severity | Trigger |
|---|---|---|
| `agents-before-delivery` | High | AI/agent controls are configured while stage 1 delivery (CI, tests in CI) is absent. |
| `unbounded-workflow-permissions` | Medium | A workflow declares `permissions: write-all`. |
| `long-lived-cloud-credentials` | Medium | A workflow references static cloud credentials without requesting an OIDC token. |

## Where the code lives

| Concern | File |
|---|---|
| Control catalogue (stages, controls, remediation) | `src/darkFactoryControls.json` |
| Scoring — **pure**, no VS Code API and no filesystem access | `src/darkFactoryReadiness.ts` |
| Filesystem signal collection | `src/darkFactorySignals.ts` |
| Orchestration (paths → signals → PR join → report) | `vscode-extension/src/darkFactoryService.ts` |
| Rendering | `vscode-extension/src/webview/usage/main.ts` and the shared renderer `vscode-extension/src/webview/usage/darkFactorySection.ts` |
| Types | `src/types.ts` (`DarkFactory*`) |

## Cost

The scan issues **no network calls of its own**. Per repository it is a bounded set of `existsSync`
probes, one shallow `readdir` per interesting directory, and a capped read of at most
`MAX_WORKFLOW_FILES` (50) workflow files. Repository identity comes from reading the git config
directly rather than spawning `git remote get-url`, because a workspace can contribute hundreds of
paths. That read follows the `.git` *file* that linked worktrees and submodules use, via its
`gitdir:` pointer and (for worktrees) the `commondir` hop to the shared config. At most `MAX_SCANNED_REPOS` (25) repositories are scanned per run, and the report says how
many it skipped rather than truncating silently.

The one GitHub-derived signal — `agent-authored-pull-requests` — reuses the pull-request statistics
the Usage Analysis view has **already** fetched (which itself caps at 5 pages per repository). When
those statistics are absent, the control is `unknown`.

## Limitations

- **The API tier is not implemented yet.** Rulesets, required reviews, merge queue, environment
  protection rules and scanning enablement all report as `unknown` with "Needs a GitHub token". The
  data model and `resolveControl()` already handle real API answers, including a 403 arriving as an
  explicit `unknown`.
- Several stage-1 and stage-4 controls (`ci-test-execution`, `infrastructure-as-code`,
  `versioned-specifications`, `executable-acceptance`, `independent-evaluator-agent`) are heuristics
  over file and workflow patterns. They are labelled as such in the UI.
- Whether a repository deploys at all is itself a heuristic over workflow content. A repository
  that deploys from another system, or through a shared reusable workflow, reads as "deploys
  nothing", so its deployment controls show as not applicable.
- CI is only read from GitHub Actions. On another host the CI controls are `unknown`, not assessed.
- The scan reads the working tree as checked out. A repository whose delivery is defined entirely in
  a shared reusable workflow will under-report; that is why `artifact-attestations` and
  `deployment-environments` resolve absence to `unknown`.
- Stage 5 is described in the catalogue but is never awarded, by design.
