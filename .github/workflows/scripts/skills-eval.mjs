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
import { appendFileSync, existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
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
// Kept as separate names so the model count reported below is derived from the
// values actually handed to evaluateSkills, rather than assumed to be 1.
const targetModel = modelName;
const judgeModel = modelName;
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
  target: { model: targetModel, provider },
  judge: { model: judgeModel, provider },
  concurrency: 1,
  workspaceLayout: "iteration",
  report: true,
  reportTitle: "Agent Skills Eval — weekly Copilot CLI run",
  onEvent: consoleReporter(),
});

// The target and judge are both driven by this script's single model today, so
// this set has one entry. Deriving it from the two values actually passed to
// evaluateSkills (rather than hardcoding 1) keeps the count honest if they ever
// diverge into a real multi-model matrix.
const modelsUsed = Array.from(new Set([targetModel, judgeModel]));

// ── Per-skill "suggested next step" (report only) ───────────────────────────
// agent-skills-eval's own HTML report (report.js, vendored via npm — not ours
// to edit) shows pass/fail data but no actionable guidance. We post-process
// the generated index.html below to inject a data-driven suggestion box per
// skill, computed from the same grading.json/benchmark.json files the report
// itself reads.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Scans `<skillDir>/eval-<slug>/<mode>/grading.json` for failed assertions.
// NB: a line comment on purpose — a JSDoc block here cannot contain the glob
// `eval-*` followed by a slash, because that sequence closes the comment early.
function collectFailingAssertions(skillDir) {
  const failures = [];
  if (!existsSync(skillDir)) {
    return failures;
  }
  for (const entry of readdirSync(skillDir, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith("eval-")) {
      continue;
    }
    const evalDir = path.join(skillDir, entry.name);
    for (const mode of ["with_skill", "without_skill"]) {
      const gradingPath = path.join(evalDir, mode, "grading.json");
      if (!existsSync(gradingPath)) {
        continue;
      }
      let grading;
      try {
        grading = JSON.parse(readFileSync(gradingPath, "utf-8"));
      } catch {
        continue;
      }
      for (const r of grading.assertion_results ?? []) {
        if (!r.passed) {
          failures.push({ evalSlug: entry.name, mode, text: r.text, evidence: r.evidence });
        }
      }
    }
  }
  return failures;
}

/**
 * Builds a concrete, data-driven "what to do next" suggestion for one skill,
 * prioritizing the most actionable signal available:
 *   1. A concrete failing assertion (with judge evidence) in with_skill mode.
 *   2. Both modes at 100% with zero delta — the eval isn't discriminating.
 *   3. with_skill scoring worse than without_skill — the skill may be actively
 *      confusing the model.
 *   4. Otherwise, no action needed this run.
 */
function buildSuggestion(skillDir, benchmark) {
  const withSkillFailures = collectFailingAssertions(skillDir).filter((f) => f.mode === "with_skill");
  if (withSkillFailures.length > 0) {
    const f = withSkillFailures[0];
    return {
      cls: "bad",
      text:
        `Judge FAILED an assertion in with_skill / ${f.evalSlug}: "${f.text}" ` +
        `— evidence: "${f.evidence}". Add explicit guidance to SKILL.md covering this gap, then re-run.`,
    };
  }
  const rs = benchmark?.run_summary;
  if (rs?.without_skill && rs.delta) {
    if (rs.with_skill.pass_rate.mean === 1 && rs.without_skill.pass_rate.mean === 1 && rs.delta.pass_rate === 0) {
      return {
        cls: "warn",
        text:
          "Both with_skill and without_skill scored 100% (Δ 0.0pp) — this eval isn't discriminating; " +
          "the model already answers correctly without the skill. Write harder assertions that require " +
          "skill-specific facts (exact paths, line numbers, function names) not inferable from general repo knowledge.",
      };
    }
    if (rs.delta.pass_rate < 0) {
      return {
        cls: "bad",
        text:
          `with_skill scored lower than without_skill (Δ ${(rs.delta.pass_rate * 100).toFixed(1)}pp) — ` +
          "the skill's instructions may be actively confusing the model here. Review the failing assertions " +
          "above and correct the relevant SKILL.md section.",
      };
    }
  }
  return {
    cls: "ok",
    text: "No failing assertions this run, and the skill matches or outperforms the baseline — no action needed.",
  };
}

if (result.reportPath && existsSync(result.reportPath)) {
  let html = readFileSync(result.reportPath, "utf-8");

  // Model count + name stat, so it's obvious at a glance how many distinct
  // models this run actually evaluated with (today always 1: same model for
  // target and judge) and which one, without hunting for the separate
  // target/judge line in the header meta.
  html = html.replace(
    '<div class="totals">',
    `<div class="totals">\n      <div class="stat"><span class="label">models evaluated</span><span class="value">${modelsUsed.length}</span><span class="muted" style="display:block;margin-top:2px;">${escapeHtml(modelsUsed.join(", "))}</span></div>`
  );

  // Suggestion box styling — appended alongside the report's own <style>
  // block rather than editing it, since report.js is vendored via npm.
  html = html.replace(
    "</head>",
    `  <style>
  .suggestion { margin: 10px 0 0; padding: 10px 12px; border-radius: 6px; font-size: 13px; border-left: 4px solid var(--border); }
  .suggestion.ok { border-left-color: var(--ok); background: var(--ok-bg); }
  .suggestion.warn { border-left-color: var(--warn); background: var(--warn-bg); }
  .suggestion.bad { border-left-color: var(--bad); background: var(--bad-bg); }
  </style>
</head>`
  );

  for (const s of result.skills) {
    const skillDir = path.dirname(s.benchmarkPath);
    let benchmark;
    try {
      benchmark = JSON.parse(readFileSync(s.benchmarkPath, "utf-8"));
    } catch {
      benchmark = undefined;
    }
    const suggestion = buildSuggestion(skillDir, benchmark);
    const anchorIdx = html.indexOf(`id="skill-${s.slug}"`);
    if (anchorIdx === -1) {
      continue;
    }
    const evalsIdx = html.indexOf('<div class="evals">', anchorIdx);
    if (evalsIdx === -1) {
      continue;
    }
    const box = `<div class="suggestion ${suggestion.cls}"><strong>Suggested next step:</strong> ${escapeHtml(suggestion.text)}</div>\n      `;
    html = html.slice(0, evalsIdx) + box + html.slice(evalsIdx);
  }

  writeFileSync(result.reportPath, html, "utf-8");
}

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
  `- Model(s) evaluated: **${modelsUsed.length}** (\`${modelsUsed.join("`, `")}\`) — same model used for target and judge`,
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
