# Copilot Evals pilot

This is a deliberately small, independent Vally / GitHub Evals Action track.
It runs alongside—not instead of—the weekly `Agent Skills Eval` workflow.
The first target is the existing `session-log-data` skill. The two cases use
fabricated files only and exercise both normal analysis and missing-data
behavior, including whether the skill was actually invoked.

## Running and prerequisites

`.github/workflows/copilot-evals.yml` runs model-free Vally lint on both
scheduled and manually dispatched runs. The scheduled job runs the eval suite
weekly. A manual dispatch runs the model-backed suite only when
`confirm_model_run` is checked; this is an explicit warning that Copilot
workflow-token usage may be billable. A manual dispatch without that
confirmation reports a failing “not run” job rather than a green workflow that
could be mistaken for an evaluation pass. Manual model runs are limited to the
repository's default branch; dispatches from other refs are marked not run.
The evaluation job also fails if the Action reports `not-run` or does not
provide evidence of at least one executed, passing trial.
Use the local lint command below if you only want model-free validation.

The workflow uses the GitHub-generated token, not a stored PAT, and grants
`copilot-requests: write` only to the evaluation job. It checks out with
credential persistence disabled, runs only on GitHub-hosted Linux, disables
Vally usage telemetry, and does not upload transcripts. The Action publishes
structured evidence with 90-day retention; its documented structured report
omits prompts, model output and raw exception text. Local Vally output under
`.copilot/evals/` is git-ignored because local trajectories may contain
conversation content.

Before enabling scheduled model runs, repository administrators must confirm
Copilot workflow-token billing/entitlement for this repository. An Actions
policy allowing the workflow Action does not establish that entitlement.
The pilot does not install the interactive Evals plugin or inspect live
session/usage data; scheduled and confirmed manual evaluations do make model
calls. Never add real logs, hydrated
`session-logs/` or `usage-data/`, repository secrets, or private prompts to
these fixtures. Keep transcript upload disabled.

For local, model-free validation from the repository root:

```powershell
npm exec --yes --ignore-scripts --package=@microsoft/vally-cli@0.21.0 -- vally lint .github/skills/session-log-data --eval-spec evals/session-log-data --strict
```

The targeted command avoids unrelated repository skills. Running Vally's root
skill lint across the whole checkout currently fails on pre-existing issues in
other skills; those are outside this pilot's scope.

The Action and Vally CLI are pinned independently: the workflow uses a full
commit SHA for `github/evals-action` and Vally `0.21.0`. Update either only
after reviewing its release and compatibility, then ask the maintainer to
regenerate `.github/workflows/actions.lock`.

The pilot pins `claude-sonnet-5.5`, a model recorded in a recent existing
skills-eval run, to aid comparison. Its availability to the workflow token
still needs to be verified.

## Comparing the two tracks

Keep the results separate and compare them as complementary evidence, not as
apples-to-apples scores:

| | Existing Agent Skills Eval | Copilot Evals / Vally pilot |
|---|---|---|
| Current question | Does supplying the skill improve judged responses versus its baseline? | Was the skill invoked, and did a constrained task produce the expected synthetic result? |
| Execution and grading | Copilot CLI is used for target and judge; natural-language assertions and its own reporting. | Copilot SDK executor with explicit `skill-invocation` and exact-output graders. |
| Baseline semantics | With-skill versus without-skill. | No treatment/control baseline; capability checks for the current spec and skill. |
| Useful longitudinal evidence | Existing case results and reports, interpreted with that workflow's warning semantics. | Pass/fail by eval case, Vally/Action and model version, run date, and any token/turn/duration fields actually emitted. |
| Cost evidence | The existing runner reports token usage and cost as unavailable when not measured. | No currency cost is measured by this pilot. GitHub billing/entitlement records are authoritative; absent token metrics are unknown, not zero. |

The two systems differ in model host, baseline, graders, and sampled behavior.
Do not compare aggregate pass rates as if they were statistically equivalent,
or infer model quality, skill improvement, or cost savings from one passing
run. The Vally suite currently has two stimuli and one trial each: useful as a
smoke signal, not a reliable estimate of a general pass rate. Compare case
outcomes only when the spec/fixture revision, model, executor, Vally version
and trial count are the same; annotate any changes. Missing or skipped cases
are not passes.

For each run, retain the workflow URL and note its date/trigger, suite and case
counts, result, model, Action SHA, Vally version, trial count, and any reported
token/turn/duration metrics. Use no metric when the evidence does not provide
it. The structured GitHub artifact is intended to support trend review without
retaining full trajectories. Revisit retention and access if the Action's
artifact contract changes.

This pilot complements, but does not replace, parser unit tests or the
privacy/authorization tests for real data paths. A future expansion should add
the `copilot-log-analysis` cases only after checking each expectation against
current shared parsers and documentation; a skill and a grader repeating the
same stale statement do not independently validate it.

## References

- [GitHub Evals Action README and permissions](https://github.com/github/evals-action)
- [Vally eval spec reference](https://microsoft.github.io/vally/reference/eval-spec/)
- [Vally writing eval specs](https://microsoft.github.io/vally/guides/writing-eval-specs/)
- [Existing Agent Skills Eval workflow](../.github/workflows/skills-eval.yml)
