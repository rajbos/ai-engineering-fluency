// node --test .github/workflows/scripts/skills-eval.test.mjs
// Integration tests use only the pinned SDK and a synthetic CLI executor.
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import {
  assessResults, copilotCliProvider, createEvaluationState, recordEvent, runEvaluation,
} from "./skills-eval.mjs";
import * as sdk from "../dependencies/agent-skills-eval/node_modules/agent-skills-eval/dist/index.js";

function fixture(t) {
  const dir = mkdtempSync(path.resolve(".skills-eval-test-"));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  return dir;
}

function grading(passed = true) {
  return {
    assertion_results: [{ text: "Synthetic rubric", passed, evidence: "Synthetic evidence" }],
    summary: { passed: passed ? 1 : 0, failed: passed ? 0 : 1, total: 1, pass_rate: passed ? 1 : 0 },
  };
}

test("baseline leading-dash prompts are safe argv data, and CLI runs are isolated", async (t) => {
  const scratch = fixture(t);
  const state = createEvaluationState();
  recordEvent(state, { type: "eval-start", skill: "synthetic", evalIndex: 0, mode: "without_skill" });
  const prompt = "---USER REQUEST---\n--help\nquotes ' \" $(do-not-run)";
  const result = await copilotCliProvider({
    role: "target", state, scratch,
    env: { GH_TOKEN: "synthetic-auth", COPILOT_MODEL: "synthetic-model", COPILOT_ALLOW_ALL: "true" },
    execute(command, args, options) {
      assert.equal(command, "npx");
      assert.equal(args[args.indexOf("-p") + 1], `Evaluation request follows.\n\n${prompt}`);
      assert.ok(!args[args.indexOf("-p") + 1].startsWith("-"));
      for (const flag of ["--no-auto-update", "--no-custom-instructions", "--disable-builtin-mcps", "--available-tools"]) {
        assert.ok(args.includes(flag));
      }
      assert.equal(args[args.indexOf("--available-tools") + 1], "--deny-tool");
      assert.equal(options.cwd, path.join(scratch, "repository"));
      assert.ok(options.env.COPILOT_HOME.startsWith(scratch));
      assert.equal(options.env.HOME, options.env.COPILOT_HOME);
      assert.equal(options.env.COPILOT_CUSTOM_INSTRUCTIONS_DIRS, "");
      assert.equal(options.env.COPILOT_ALLOW_ALL, "false");
      assert.equal(options.env.GH_TOKEN, "synthetic-auth");
      assert.equal(options.shell, undefined);
      return { status: 0, stdout: "Synthetic answer" };
    },
  }).complete(prompt);
  assert.equal(result.output, "Synthetic answer");
  for (const key of ["inputTokens", "outputTokens", "costUsd"]) assert.ok(!(key in result));
  assert.deepEqual(readdirSync(scratch), []);
});

for (const [label, response] of [
  ["nonzero exit", { status: 1, stdout: "", stderr: "SECRET raw CLI error" }],
  ["timeout", { status: null, error: Object.assign(new Error("SECRET timeout"), { code: "ETIMEDOUT" }) }],
  ["signal", { status: null, signal: "SIGTERM", stdout: "partial" }],
  ["empty output", { status: 0, stdout: " \n" }],
]) {
  test(`operational ${label} is not sent to the judge or mistaken for measured usage`, async (t) => {
    const scratch = fixture(t);
    const state = createEvaluationState();
    recordEvent(state, { type: "eval-start", skill: "synthetic", evalIndex: 0, mode: "without_skill" });
    const target = copilotCliProvider({ role: "target", state, scratch, execute: () => response });
    const result = await target.complete("Synthetic prompt");
    assert.match(result.error, /execution failed/);
    assert.doesNotMatch(JSON.stringify(result), /SECRET/);
    assert.equal(result.output, "");
    const judge = copilotCliProvider({
      role: "judge", state, scratch, execute: () => assert.fail("Must not call a model to judge a target error"),
    });
    assert.match((await judge.complete("Synthetic judge prompt")).error, /grading skipped/);
    assert.deepEqual(state.active.failures, ["target-cli"]);
    assert.deepEqual(readdirSync(scratch), []);
  });
}

function syntheticRun(mode, passed, failures = []) {
  return {
    skill: "synthetic", index: 0, mode, completed: true, failures,
    grading: grading(passed), durationMs: 42, slug: "eval-synthetic",
  };
}

function assessment(runs, evals = 1) {
  return assessResults({
    skills: [{ skill: "synthetic", slug: "synthetic", evals, benchmarkPath: "unused" }],
  }, { runs });
}

test("failed or missing baselines invalidate comparisons, never fabricate +100pp", () => {
  for (const baseline of [[], [syntheticRun("without_skill", false, ["target-cli"])]]) {
    const value = assessment([syntheticRun("with_skill", true), ...baseline]);
    assert.equal(value.operationalFailure, true);
    assert.equal(value.skills[0].withRate, 1);
    assert.equal(value.skills[0].delta, null);
    assert.equal(value.skills[0].withoutRate, null);
    assert.deepEqual(value.summary.actionable.map((a) => a.key), ["synthetic:baseline-invalid"]);
  }
});

test("failed targets cannot pass merely because the judge returned PASS", () => {
  const value = assessment([
    syntheticRun("with_skill", true, ["target-cli"]), syntheticRun("without_skill", false),
  ]);
  assert.equal(value.skills[0].withRate, null);
  assert.equal(value.summary.skills[0].passRate, null);
  assert.equal(value.skills[0].delta, null);
  assert.match(value.summary.actionable[0].summary, /pass rate is unavailable/);
});

test("JSON handoff distinguishes unavailable null from a successfully measured zero", () => {
  for (const [runs, expected] of [
    [[], null],
    [[syntheticRun("with_skill", true, ["target-cli"]), syntheticRun("without_skill", false)], null],
    [[syntheticRun("with_skill", false), syntheticRun("without_skill", true)], 0],
    [[syntheticRun("with_skill", true)], 1],
  ]) {
    const summary = JSON.parse(JSON.stringify(assessment(runs).summary));
    assert.ok(Object.hasOwn(summary.skills[0], "passRate"), "Unavailable is explicit null, not an omitted field");
    assert.equal(summary.skills[0].passRate, expected);
    if (expected === null) {
      assert.ok(summary.actionable.some((a) => a.key === "synthetic:with-skill-invalid"));
    }
  }
});

test("regressions, assertion failures and non-discriminating suites are actionable", () => {
  const regressed = assessment([syntheticRun("with_skill", false), syntheticRun("without_skill", true)]);
  assert.equal(regressed.operationalFailure, false);
  assert.deepEqual(regressed.summary.actionable.map((a) => a.key), [
    "synthetic:assertions-failed", "synthetic:regression",
  ]);
  const tied = assessment([syntheticRun("with_skill", true), syntheticRun("without_skill", true)]);
  assert.equal(tied.summary.actionable[0].key, "synthetic:non-discriminating");
  const improved = assessment([syntheticRun("with_skill", true), syntheticRun("without_skill", false)]);
  assert.deepEqual(improved.summary.actionable, []);
  assert.equal(improved.skills[0].delta, 1);
});

test("empty, duplicate and unpaired evaluations never count as a valid comparison", () => {
  assert.equal(assessResults({ skills: [] }, { runs: [] }).summary.actionable[0].key, "no-evaluations");
  assert.equal(assessment([], 0).operationalFailure, true);
  assert.equal(assessment([
    syntheticRun("with_skill", true), syntheticRun("with_skill", true),
    syntheticRun("without_skill", false), syntheticRun("without_skill", false),
  ], 2).skills[0].comparable, false);
  assert.equal(assessment([
    syntheticRun("with_skill", true),
    { ...syntheticRun("without_skill", false), slug: "eval-different-task" },
  ]).skills[0].comparable, false);
});

async function integration(t, behavior = {}) {
  const root = fixture(t);
  const skills = path.join(root, "skills");
  const skill = path.join(skills, "synthetic");
  mkdirSync(path.join(skill, "evals"), { recursive: true });
  writeFileSync(path.join(skill, "SKILL.md"), "---\nname: synthetic\ndescription: Synthetic test only\n---\nSynthetic instructions.");
  writeFileSync(path.join(skill, "evals", "evals.json"), JSON.stringify({
    skill_name: "synthetic",
    evals: (behavior.evalNames || ["synthetic"]).map((name, i) => ({
      id: i + 1, name, prompt: "Synthetic task: PRIVATE_PROMPT_SENTINEL", assertions: ["Synthetic rubric"],
    })),
  }));
  const workspace = path.join(root, "workspace");
  const state = { mode: undefined, judgeCalls: 0, cliCalls: 0 };
  const env = {
    EVAL_WORKSPACE: workspace, SKILLS_ROOT: skills, COPILOT_MODEL: "synthetic-model",
    GITHUB_STEP_SUMMARY: path.join(root, "step-summary.md"), GITHUB_OUTPUT: path.join(root, "outputs"),
  };
  const execute = (command, args, options) => {
    if (command === "git") return spawnSync(command, args, options);
    state.cliCalls++;
    const prompt = args[args.indexOf("-p") + 1];
    if (prompt.includes("You are grading an agentskills.io")) {
      state.judgeCalls++;
      if (behavior.judgeError) return { status: 1, stderr: "PRIVATE_ERROR_SENTINEL" };
      if (behavior.judgeMalformed) return { status: 0, stdout: '{"assertion_results":[]}' };
      return { status: 0, stdout: JSON.stringify(grading(state.mode === "with_skill")) };
    }
    state.mode = prompt.includes("<skill name=");
    state.mode = state.mode ? "with_skill" : "without_skill";
    assert.ok(existsSync(path.join(options.cwd, ".git")));
    assert.ok(!existsSync(path.join(options.env.COPILOT_HOME, "skills")));
    if (behavior.baselineError && state.mode === "without_skill") {
      return { status: 1, stderr: "PRIVATE_ERROR_SENTINEL Invalid command format" };
    }
    return { status: 0, stdout: "PRIVATE_OUTPUT_SENTINEL synthetic model answer" };
  };
  const result = await runEvaluation({ env, execute, sdk });
  return { ...result, workspace, root, state };
}

test("real pinned SDK integration: baseline failure is visible in all artifacts and fails the runner", async (t) => {
  const { assessment, exitCode, workspace, root, state } = await integration(t, { baselineError: true });
  assert.equal(exitCode, 1);
  assert.equal(state.judgeCalls, 1, "Failed baseline must never invoke the judge");
  const summaryText = readFileSync(path.join(workspace, "eval-actionable.json"), "utf8");
  const summary = JSON.parse(summaryText);
  assert.deepEqual(Object.keys(summary).sort(), ["actionable", "skills", "version"]);
  assert.equal(summary.version, 1);
  assert.deepEqual(summary.skills, [{ name: "synthetic", evals: 1, passRate: 1 }]);
  assert.deepEqual(summary.actionable.map((a) => a.key), ["synthetic:baseline-invalid"]);
  assert.deepEqual(Object.keys(summary.actionable[0]).sort(), ["key", "summary"]);
  assert.match(summary.actionable[0].summary, /invalid-command-format/);
  assert.doesNotMatch(summaryText, /PRIVATE_|evidence|prompt|C:\\|github\/skills/);
  const skill = assessment.skills[0];
  const benchmark = JSON.parse(readFileSync(skill.benchmarkPath, "utf8"));
  assert.equal(benchmark.run_summary.delta, null);
  assert.equal(benchmark.run_summary.without_skill.pass_rate.mean, null);
  assert.equal(benchmark.run_summary.with_skill.tokens.mean, null);
  const actualRunDir = path.join(path.dirname(skill.benchmarkPath), skill.runs[1].slug, "without_skill");
  assert.equal(JSON.parse(readFileSync(path.join(actualRunDir, "execution.json"))).status, "invalid");
  assert.equal(JSON.parse(readFileSync(path.join(actualRunDir, "timing.json"))).total_tokens, null);
  const step = readFileSync(path.join(root, "step-summary.md"), "utf8");
  assert.match(step, /INVALID/);
  assert.match(step, /Unavailable \(invalid comparison\)/);
  assert.doesNotMatch(step, /PRIVATE_|100\.0pp|0 tokens/);
  const report = readFileSync(path.join(path.dirname(skill.benchmarkPath), "report", "index.html"), "utf8");
  assert.match(report, /Token usage and cost: unavailable \(not measured\)/);
  assert.match(report, /INVALID comparison/);
  assert.match(report, /INVALID \(target: invalid-command-format\)/);
  assert.doesNotMatch(report, /100\.0pp|0 tokens|PRIVATE_ERROR/);
  assert.match(report, /PRIVATE_PROMPT_SENTINEL/);
  assert.match(report, /PRIVATE_OUTPUT_SENTINEL/);
  assert.match(report, /Synthetic evidence/);
  assert.match(report, /<details class="judge">/);
  assert.ok(readdirSync(workspace).every((p) => !p.startsWith(".cli-")));
});

test("real pinned SDK integration: valid improvement has empty actionable and unknown token counts", async (t) => {
  const { exitCode, assessment, workspace } = await integration(t);
  assert.equal(exitCode, 0);
  assert.equal(assessment.skills[0].delta, 1);
  assert.deepEqual(JSON.parse(readFileSync(path.join(workspace, "eval-actionable.json"))).actionable, []);
});

test("three failed baselines never produce an aggregate improvement, regardless of report slug sorting", async (t) => {
  const { assessment, exitCode } = await integration(t, {
    baselineError: true, evalNames: ["z-last", "a-first", "m-middle"],
  });
  assert.equal(exitCode, 1);
  assert.equal(assessment.skills[0].runs.filter((r) => r.failures.length).length, 3);
  assert.equal(assessment.skills[0].delta, null);
  const report = readFileSync(path.join(path.dirname(assessment.skills[0].benchmarkPath), "report", "index.html"), "utf8");
  assert.equal([...report.matchAll(/INVALID \(target: invalid-command-format\)/g)].length, 3);
  assert.equal([...report.matchAll(/Invalid execution \/ grading/g)].length, 3);
  assert.equal([...report.matchAll(/class="status ok">PASS/g)].length, 3);
  assert.doesNotMatch(report, /100\.0pp|0 tokens/);
});

for (const behavior of [{ judgeError: true }, { judgeMalformed: true }]) {
  test(`real pinned SDK integration: invalid judge (${Object.keys(behavior)[0]}) is operational, not a skill score`, async (t) => {
    const { exitCode, assessment, workspace } = await integration(t, behavior);
    assert.equal(exitCode, 1);
    assert.equal(assessment.skills[0].withRate, null);
    assert.equal(assessment.skills[0].delta, null);
    assert.ok(assessment.summary.actionable.some((a) => a.key.endsWith("with-skill-invalid")));
    const summary = JSON.parse(readFileSync(path.join(workspace, "eval-actionable.json"), "utf8"));
    assert.equal(summary.skills[0].passRate, null, "Persisted handoff must not report an invalid grade as 0%");
  });
}

test("fatal errors remove stale success summaries and clean isolated CLI state", async (t) => {
  const root = fixture(t);
  writeFileSync(path.join(root, "eval-actionable.json"), '{"version":1,"actionable":[],"skills":[]}');
  await assert.rejects(runEvaluation({
    env: { EVAL_WORKSPACE: root },
    sdk: { evaluateSkills: () => assert.fail("Must not reach SDK after isolation failure") },
    execute: () => ({ status: 1 }),
  }), /Cannot isolate/);
  assert.deepEqual(readdirSync(root), []);
});

test("fatal dependency import also removes stale summaries before doing any work", async (t) => {
  const root = fixture(t);
  writeFileSync(path.join(root, "eval-actionable.json"), '{"version":1,"actionable":[],"skills":[]}');
  await assert.rejects(runEvaluation({
    env: { EVAL_WORKSPACE: root, EVAL_PKG_DIR: path.join(root, "missing-dependency") },
  }), /Cannot find module/);
  assert.deepEqual(readdirSync(root), []);
});

test("no discovered evaluations is actionable and must not display an overall 100% success", async (t) => {
  const root = fixture(t);
  const skills = path.join(root, "skills");
  mkdirSync(skills);
  const workspace = path.join(root, "workspace");
  const { assessment, exitCode } = await runEvaluation({
    env: { EVAL_WORKSPACE: workspace, SKILLS_ROOT: skills }, sdk,
    execute: (command, args, options) => {
      assert.equal(command, "git", "No CLI calls are expected");
      return spawnSync(command, args, options);
    },
  });
  assert.equal(exitCode, 1);
  assert.equal(assessment.summary.actionable[0].key, "no-evaluations");
  const report = readFileSync(path.join(workspace, "iteration-1", "report", "index.html"), "utf8");
  assert.doesNotMatch(report, /100\.0%/);
  assert.match(report, /INVALID/);
});

test("unrecognized report layouts cannot leave an uncorrected SDK report behind", async (t) => {
  const root = fixture(t);
  const reportPath = path.join(root, "index.html");
  await assert.rejects(runEvaluation({
    env: { EVAL_WORKSPACE: root },
    sdk: {
      evaluateSkills: () => {
        writeFileSync(reportPath, "<p>SDK report layout changed: 100% success</p>");
        return { skills: [{ skill: "synthetic", evals: 1 }], reportPath };
      },
    },
    execute: () => ({ status: 0 }),
  }), /SDK report sections changed/);
  assert.ok(!existsSync(reportPath));
  assert.ok(!existsSync(path.join(root, "eval-actionable.json")));
  assert.deepEqual(readdirSync(root), []);
});

test("public summary identifiers conform to the reporter contract without leaking untrusted skill text", () => {
  for (const name of ["s".repeat(100), "PRIVATE_PROMPT_SENTINEL<script>unsafe</script>"]) {
    const runs = [
      { ...syntheticRun("with_skill", true, ["target-cli"]), skill: name },
      { ...syntheticRun("without_skill", false, ["target-cli"]), skill: name },
    ];
    const { summary } = assessResults({
      skills: [{ skill: name, slug: "synthetic", evals: 1 }],
    }, { runs });
    for (const action of summary.actionable) {
      assert.match(action.key, /^[a-zA-Z0-9][a-zA-Z0-9._:/-]*$/);
      assert.ok(action.key.length <= 120);
      assert.ok(action.summary.trim());
    }
    for (const skill of summary.skills) {
      assert.ok(skill.passRate === null ||
        (typeof skill.passRate === "number" && Number.isFinite(skill.passRate) &&
          skill.passRate >= 0 && skill.passRate <= 1));
    }
    assert.doesNotMatch(JSON.stringify(summary), /PRIVATE_|<script>|Synthetic evidence/);
  }
});
