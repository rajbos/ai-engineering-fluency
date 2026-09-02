// Runs agent-skills-eval (https://github.com/darkrishabh/agent-skills-eval)
// over the repository's Agent Skills in .github/skills, using the GitHub
// Copilot CLI (npx @github/copilot) as both the target and the judge model.
//
// agent-skills-eval only speaks the OpenAI chat API out of the box, so this
// script wires up a custom Provider whose complete() shells out to the
// Copilot CLI in non-interactive programmatic mode instead. Skills without an
// evals/evals.json are skipped automatically by the SDK.
//
// Invoked by .github/workflows/skills-eval.yml. Requires:
//   - EVAL_PKG_DIR   directory where agent-skills-eval was npm-installed
//   - GH_TOKEN / COPILOT_GITHUB_TOKEN  auth for the Copilot CLI
// Optional:
//   - COPILOT_MODEL       model passed to `copilot --model` (CLI default when unset)
//   - SKILLS_ROOT         skills folder (default .github/skills)
//   - EVAL_WORKSPACE      artifact output dir (default ./agent-skills-workspace)

import { spawnSync } from "node:child_process";
import { appendFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const pkgDir = process.env.EVAL_PKG_DIR;
if (!pkgDir) {
  console.error("EVAL_PKG_DIR is not set — install agent-skills-eval first.");
  process.exit(1);
}

const { evaluateSkills, consoleReporter } = await import(
  pathToFileURL(path.join(pkgDir, "node_modules", "agent-skills-eval", "dist", "index.js")).href
);

const modelName = process.env.COPILOT_MODEL || "copilot-cli-default";
const skillsRoot = process.env.SKILLS_ROOT || ".github/skills";
const workspace = process.env.EVAL_WORKSPACE || "./agent-skills-workspace";

/**
 * Provider that completes prompts by running the Copilot CLI once per call.
 * Locked down for untrusted-ish prompt content: no tool approvals are granted
 * (shell/write/url are explicitly denied), built-in MCP servers are disabled,
 * and tokens are marked secret so they are redacted from the transcript.
 */
function copilotCliProvider() {
  return {
    name: "copilot-cli",
    model: modelName,
    async complete(prompt) {
      const started = Date.now();
      const args = [
        "--yes",
        "@github/copilot",
        "-p",
        prompt,
        "--silent",
        "--no-color",
        "--no-ask-user",
        "--disable-builtin-mcps",
        "--deny-tool",
        "shell",
        "--deny-tool",
        "write",
        "--deny-tool",
        "url",
        "--secret-env-vars=GH_TOKEN,COPILOT_GITHUB_TOKEN,GITHUB_TOKEN",
      ];
      if (process.env.COPILOT_MODEL) {
        args.push("--model", process.env.COPILOT_MODEL);
      }
      const run = spawnSync("npx", args, {
        encoding: "utf8",
        maxBuffer: 64 * 1024 * 1024,
        timeout: 10 * 60 * 1000,
      });
      const latencyMs = Date.now() - started;
      const output = (run.stdout || "").trim();
      const failed = run.error || run.status !== 0 || output.length === 0;
      if (failed) {
        const detail = run.error
          ? run.error.message
          : `exit code ${run.status}: ${(run.stderr || "").trim().slice(0, 2000)}`;
        console.error(`copilot CLI call failed after ${latencyMs}ms — ${detail}`);
      }
      // On failure, return a ProviderResult with `error` set rather than
      // throwing: the framework's run-eval replaces the output with
      // "ERROR: <error>" so the judge fails the case closed, whereas a throw
      // would abort the entire evaluation run.
      return {
        provider: "copilot-cli",
        model: modelName,
        output,
        latencyMs,
        inputTokens: 0,
        outputTokens: 0,
        costUsd: 0,
        ...(failed ? { error: `copilot CLI call failed (exit ${run.status ?? "spawn error"})` } : {}),
      };
    },
  };
}

const provider = copilotCliProvider();

const result = await evaluateSkills({
  root: skillsRoot,
  workspace,
  baseline: true,
  target: { model: modelName, provider },
  judge: { model: modelName, provider },
  concurrency: 1,
  workspaceLayout: "iteration",
  report: true,
  reportTitle: "Agent Skills Eval — weekly Copilot CLI run",
  onEvent: consoleReporter(),
});

// ── GitHub Actions step summary ──────────────────────────────────────────────
// Report runner-relative paths: the absolute /home/runner/... paths are
// meaningless once the job is gone, so point at the artifact contents instead.
const rel = (p) => (p ? path.relative(process.cwd(), p).split(path.sep).join("/") : undefined);
// `agent-skills-eval-workspace` is uploaded from the EVAL_WORKSPACE directory,
// so its contents are stored relative to that. Note this is NOT
// `result.workspaceRoot`, which under the "iteration" layout points one level
// deeper at the current iteration-N directory.
const uploadRoot = path.resolve(workspace);
const workspaceRel = rel(uploadRoot);
// Path of the report inside that artifact, e.g. `iteration-1/report/index.html`.
const reportInWorkspaceArtifact = result.reportPath
  ? path.relative(uploadRoot, result.reportPath).split(path.sep).join("/")
  : undefined;

// Hand the report directory to the workflow so it can be uploaded as a flat,
// report-only artifact. upload-artifact roots an artifact at the non-glob
// prefix of its `path`, so passing the concrete report directory (rather than a
// glob spanning the workspace) is what puts index.html at the artifact root.
if (process.env.GITHUB_OUTPUT && result.reportPath) {
  appendFileSync(process.env.GITHUB_OUTPUT, `report-dir=${path.dirname(result.reportPath)}\n`);
}

const lines = [
  "## Agent Skills Eval (weekly, Copilot CLI)",
  "",
  `- Skills with evals: **${result.skills.length}**`,
  `- Runs passed: **${result.passed}** · failed: **${result.failed}**`,
  `- Artifact \`agent-skills-eval-workspace\` → \`${workspaceRel}\` (raw prompts, outputs, gradings)`,
  ...(reportInWorkspaceArtifact
    ? [
        "- Artifact `agent-skills-eval-report` → the HTML report on its own; download it and open `index.html` at the artifact root",
        `- The same report is also inside \`agent-skills-eval-workspace\` at \`${reportInWorkspaceArtifact}\``,
      ]
    : ["- No HTML report was generated for this run."]),
  "",
  "| Skill | Evals | Pass rate |",
  "|---|---|---|",
  ...result.skills.map(
    (s) => `| ${s.skill} | ${s.evals} | ${(s.passRate * 100).toFixed(0)}% |`
  ),
  "",
];
console.log(lines.join("\n"));
if (process.env.GITHUB_STEP_SUMMARY) {
  appendFileSync(process.env.GITHUB_STEP_SUMMARY, lines.join("\n") + "\n");
}

if (result.skills.length === 0) {
  console.log("::warning::No skills with evals/evals.json were found — nothing was evaluated.");
}
for (const s of result.skills) {
  if (s.passRate < 1) {
    console.log(
      `::warning::Skill "${s.skill}" pass rate is ${(s.passRate * 100).toFixed(0)}% — open the report artifact for judge evidence.`
    );
  }
}
