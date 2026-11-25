// Pinned agent-skills-eval adapter. Target and judge calls are text-only:
// only the SDK's with_skill prompt supplies skill instructions.
// EVAL_PKG_DIR is required; EVAL_WORKSPACE defaults to ./agent-skills-workspace.
// COPILOT_CLI_VERSION, COPILOT_MODEL and SKILLS_ROOT may override the defaults.
// eval-actionable.json is the sanitized issue-reporter handoff. passRate is
// null if with-skill grading is unavailable; numeric zero means measured zero.
// Operational failures exit nonzero; ordinary assertion failures are actionable.
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync,
} from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const json = (file, value) => writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function judgeResponseValid(output) {
  try {
    const raw = JSON.parse(output.slice(output.indexOf("{"), output.lastIndexOf("}") + 1));
    return Array.isArray(raw.assertion_results) && raw.assertion_results.length > 0 &&
      raw.assertion_results.every((r) => typeof r.passed === "boolean" &&
        typeof r.evidence === "string" && r.evidence.trim().length > 0);
  } catch {
    return false;
  }
}

function failureReason(result, output) {
  if (result.error?.code === "ETIMEDOUT") return "timeout";
  if (result.error) return "spawn-error";
  if (result.signal) return "signal";
  if (result.status !== 0) {
    return /Invalid command format/i.test(`${result.stderr || ""}\n${output}`)
      ? "invalid-command-format" : "nonzero-exit";
  }
  return output ? undefined : "empty-output";
}

export function createEvaluationState() {
  return { runs: [], active: undefined, models: new Set() };
}

// Keep SDK events, prompts, CLI output and judge evidence out of console and
// actionable summaries. The full evidence belongs only in workspace artifacts.
export function recordEvent(state, event) {
  if (event.type === "eval-start") {
    state.active = {
      skill: event.skill, index: event.evalIndex, slug: event.evalSlug,
      mode: event.mode, failures: [], completed: false,
    };
    state.runs.push(state.active);
  }
  if (event.type === "eval-end") {
    const run = state.active;
    if (!run || run.skill !== event.skill || run.index !== event.evalIndex || run.mode !== event.mode) {
      throw new Error("Evaluator event order changed; refusing to attribute results.");
    }
    const assertions = event.grading?.assertion_results;
    if (!Array.isArray(assertions) || assertions.length === 0) {
      run.failures.push("missing-assertions");
    } else if (!run.failures.includes("target-cli") && (run.judgeValid === false || assertions.some((r) =>
      /^(judge returned unparseable response:|judge omitted this assertion result|judge did not provide concrete evidence)/.test(r.evidence)))) {
      run.failures.push("invalid-judge");
    }
    run.completed = true;
    run.grading = event.grading;
    run.durationMs = event.timing.duration_ms;
    state.active = undefined;
  }
}

export function copilotCliProvider({
  role, state, scratch, execute = spawnSync, env = process.env,
}) {
  return {
    name: "copilot-cli",
    model: env.COPILOT_MODEL || "copilot-cli-default",
    async complete(prompt) {
      const active = state.active;
      if (!active) throw new Error("Provider invoked outside an evaluation.");
      // Do not pay a judge to grade an infrastructure error as model output.
      if (role === "judge" && active.failures.includes("target-cli")) {
        return { output: "", error: "Target execution failed; grading skipped." };
      }
      const callDir = mkdtempSync(path.join(scratch, "call-"));
      const home = path.join(callDir, "home");
      const logs = path.join(callDir, "logs");
      mkdirSync(home);
      mkdirSync(logs);
      // The pinned CLI rejects a -p value beginning with '-' (the SDK's
      // baseline begins "---USER REQUEST---"). A neutral prefix fixes both
      // modes without depending on unsupported --prompt=<value> syntax.
      const args = [
        "--yes", `@github/copilot@${env.COPILOT_CLI_VERSION || "1.0.94"}`,
        "--no-auto-update",
        "-p", `Evaluation request follows.\n\n${prompt}`,
        "--silent", "--no-color", "--no-ask-user", "--no-custom-instructions",
        "--disable-builtin-mcps", "--available-tools",
        "--deny-tool", "shell", "--deny-tool", "write", "--deny-tool", "url",
        "--secret-env-vars=GH_TOKEN,COPILOT_GITHUB_TOKEN,GITHUB_TOKEN",
        "--log-level", "debug", "--log-dir", logs,
      ];
      if (env.COPILOT_MODEL) args.push("--model", env.COPILOT_MODEL);
      const started = Date.now();
      try {
        const result = execute("npx", args, {
          encoding: "utf8", maxBuffer: 64 * 1024 * 1024, timeout: 10 * 60 * 1000,
          cwd: path.join(scratch, "repository"),
          env: {
            ...env, COPILOT_HOME: home, HOME: home, USERPROFILE: home,
            XDG_CONFIG_HOME: home, COPILOT_CUSTOM_INSTRUCTIONS_DIRS: "",
            COPILOT_ALLOW_ALL: "false", COPILOT_ASSISTED_APPROVAL: "false",
            COPILOT_AUTO_UPDATE: "false",
            npm_config_cache: path.join(scratch, "npm-cache"),
          },
        });
        const output = (result.stdout || "").trim();
        const reason = failureReason(result, output);
        const failed = reason !== undefined;
        let model = env.COPILOT_MODEL || "copilot-cli-default";
        try {
          for (const file of readdirSync(logs)) {
            try {
              model = readFileSync(path.join(logs, file), "utf8").match(/"model":\s*"([^"]+)"/)?.[1] || model;
            } catch { /* Another log may contain the resolved model. */ }
          }
        } catch { /* Model resolution is cosmetic, never a validity signal. */ }
        state.models.add(model);
        if (failed) {
          active.failures.push(`${role}-cli`);
          (active.diagnostics ??= []).push({
            role, reason, exitCode: Number.isInteger(result.status) ? result.status : null,
          });
        }
        if (role === "judge" && !failed) active.judgeValid = judgeResponseValid(output);
        // Usage is unavailable, not measured zero. Do not invent token/cost
        // fields; our artifacts and report explicitly mark them unavailable.
        return {
          provider: "copilot-cli", model, output: failed ? "" : output,
          latencyMs: Date.now() - started,
          ...(failed ? { error: `${role} CLI execution failed; comparison unavailable.` } : {}),
        };
      } finally {
        rmSync(callDir, { recursive: true, force: true });
      }
    },
  };
}

function valid(run) {
  return Boolean(run?.completed && run.failures.length === 0);
}

function passRate(runs) {
  const total = runs.reduce((n, r) => n + r.grading.summary.total, 0);
  return total ? runs.reduce((n, r) => n + r.grading.summary.passed, 0) / total : null;
}

// Only fixed explanations and validated skill identifiers enter this public
// handoff. Never include a prompt, output, error string, path or judge evidence.
export function assessResults(result, state) {
  const actionable = [];
  let operationalFailure = false;
  const skills = result.skills.map((skill) => {
    const name = /^[a-z0-9][a-z0-9-]{0,99}$/.test(skill.skill) ? skill.skill :
      `skill-${createHash("sha256").update(skill.skill).digest("hex").slice(0, 12)}`;
    const runs = state.runs.filter((r) => r.skill === skill.skill);
    const withRuns = runs.filter((r) => r.mode === "with_skill");
    const withoutRuns = runs.filter((r) => r.mode === "without_skill");
    const add = (key, summary) => actionable.push({ key: `${name}:${key}`, summary });
    const diagnostic = (items) => {
      const reasons = [...new Set(items.flatMap((r) => (r.diagnostics ?? []).map((d) => d.reason)))];
      return reasons.length ? ` CLI failure categories: ${reasons.join(", ")}.` : "";
    };
    const completeMode = (items) => skill.evals > 0 && items.length === skill.evals &&
      new Set(items.map((r) => r.index)).size === skill.evals &&
      new Set(items.map((r) => r.slug)).size === skill.evals &&
      items.every((r) => Number.isInteger(r.index) && r.index >= 0 && r.index < skill.evals && valid(r));
    const withValid = completeMode(withRuns);
    const baselineValid = completeMode(withoutRuns) && withRuns.every((r) =>
      withoutRuns.some((baseline) => baseline.index === r.index && baseline.slug === r.slug));
    const comparable = withValid && baselineValid;
    if (!withValid) {
      operationalFailure = true;
      add("with-skill-invalid", "With-skill execution or grading is incomplete or invalid; pass rate is unavailable." + diagnostic(withRuns));
    }
    if (!baselineValid) {
      operationalFailure = true;
      add("baseline-invalid", "Baseline execution or grading is incomplete or invalid; no skill improvement can be inferred." + diagnostic(withoutRuns));
    }
    const withRate = withValid ? passRate(withRuns) : null;
    const withoutRate = baselineValid ? passRate(withoutRuns) : null;
    if (withRate !== null && withRate < 1) {
      add("assertions-failed", "With-skill assertions failed; review the workspace evaluation artifacts and improve the skill or rubric.");
    }
    if (comparable && withRate < withoutRate) {
      add("regression", "With-skill performance regressed against the successfully executed baseline.");
    }
    if (comparable && withRate === 1 && withoutRate === 1) {
      add("non-discriminating", "Both modes passed every assertion; strengthen the evaluation to measure skill-specific benefit.");
    }
    return {
      ...skill, name, runs, withValid, baselineValid, comparable,
      withRate, withoutRate, delta: comparable ? withRate - withoutRate : null,
    };
  });
  if (!skills.length) {
    operationalFailure = true;
    actionable.push({ key: "no-evaluations", summary: "No skills with evaluations were executed; no comparison is available." });
  }
  return {
    skills, operationalFailure,
    summary: {
      version: 1, actionable,
      skills: skills.map((s) => ({ name: s.name, evals: s.evals, passRate: s.withRate })),
    },
  };
}

function writeCanonicalArtifacts(assessment) {
  for (const skill of assessment.skills) {
    const dir = path.dirname(skill.benchmarkPath);
    for (const run of skill.runs) {
      const runDir = path.join(dir, run.slug, run.mode);
      mkdirSync(runDir, { recursive: true });
      json(path.join(runDir, "execution.json"), {
        status: valid(run) ? "completed" : "invalid", failures: run.failures,
        diagnostics: run.diagnostics ?? [],
        token_measurement: "unavailable", cost_measurement: "unavailable",
      });
      json(path.join(runDir, "timing.json"), {
        duration_ms: run.durationMs ?? null, total_tokens: null, token_measurement: "unavailable",
      });
    }
    // Replace SDK zero-token statistics and deltas computed from failed
    // executions. Invalid measurements remain null, never a successful zero.
    const benchmark = JSON.parse(readFileSync(skill.benchmarkPath, "utf8"));
    const stats = (mode, rate) => ({
      ...benchmark.run_summary[mode],
      pass_rate: { mean: rate, stddev: rate === null ? null : benchmark.run_summary[mode]?.pass_rate?.stddev },
      tokens: { mean: null, stddev: null },
    });
    json(skill.benchmarkPath, {
      run_summary: {
        with_skill: stats("with_skill", skill.withRate),
        without_skill: stats("without_skill", skill.withoutRate),
        delta: skill.comparable ? { ...benchmark.run_summary.delta, pass_rate: skill.delta, tokens: null } : null,
      },
      comparison_status: skill.comparable ? "valid" : "invalid",
      token_measurement: "unavailable", cost_measurement: "unavailable",
    });
  }
}

const rateLabel = (rate) => rate === null ? "Unavailable" : `${(rate * 100).toFixed(1)}%`;

export function renderReport(assessment, models, html) {
  // Preserve the pinned SDK's rich report, including prompts, outputs,
  // assertion evidence, navigation, styling and expandable details. Only
  // runner-owned measurements and operational status are corrected here.
  const skills = new Map(assessment.skills.map((s) => [escapeHtml(s.slug), s]));
  const hasUnavailableSkillScores = !assessment.skills.length || assessment.skills.some((s) => !s.withValid);
  html = html.replace("</head>", `<style>
    .suggestion{margin:10px 0;padding:10px 12px;border-radius:6px;border-left:4px solid var(--warn);background:var(--warn-bg)}
    .suggestion.bad{border-left-color:var(--bad);background:var(--bad-bg)}
    .suggestion.ok{border-left-color:var(--ok);background:var(--ok-bg)}
    </style></head>`);
  html = html.replace('<div class="totals">', `<div class="totals">
    <div class="stat"><span class="label">models evaluated</span><span class="value">${models.length}</span>
    <span class="muted">${escapeHtml(models.join(", ") || "Unavailable")}</span></div>`);
  html = html.replace("</header>", `<p>Evaluation status: ${assessment.operationalFailure ? "INVALID — operational failures" : "Completed"}.
    Token usage and cost: unavailable (not measured). No token or cost comparisons are reported.</p></header>`);
  if (hasUnavailableSkillScores) {
    html = html.replace(/(<span class="label">(?:passed|failed|pass rate)<\/span><span class="value">)[^<]*(<\/span>)/g,
      "$1Unavailable$2");
  }
  html = html.replace(/<tr class="skill-row [^"]*">[\s\S]*?<\/tr>/g, (row) => {
    const skill = skills.get(row.match(/href="#skill-([^"]+)"/)?.[1]);
    if (!skill) throw new Error("SDK report summary layout changed.");
    let column = 0;
    row = row.replace(/<td class="num">[^<]*<\/td>/g, (cell) => {
      const current = column++;
      return current === 4 || (!skill.withValid && (current === 1 || current === 2))
        ? '<td class="num">Unavailable</td>' : cell;
    });
    return skill.withValid ? row : row.replace(/class="skill-row [^"]*"/, 'class="skill-row bad"')
      .replace(/<div class="bar [\s\S]*?<\/div><\/div>/, "Unavailable");
  });
  let patched = 0;
  html = html.replace(/<article class="skill" id="skill-([^"]+)">[\s\S]*?<\/article>/g, (article, slug) => {
    const skill = skills.get(slug);
    if (!skill) throw new Error("SDK report skill layout changed.");
    patched++;
    const suggestions = assessment.summary.actionable.filter((a) => a.key.startsWith(`${skill.name}:`));
    const delta = skill.comparable ? `Δ vs baseline: pass-rate ${(skill.delta * 100).toFixed(1)}pp` :
      "INVALID comparison — no improvement or regression can be inferred.";
    const deltaClass = !skill.comparable || skill.delta < 0 ? "bad" : skill.delta > 0 ? "ok" : "muted";
    article = article.replace(/<header>[\s\S]*?<\/header>/, (header) => {
      header = header.replace(/<div class="delta [^"]*">[\s\S]*?<\/div>/, "");
      header = header.replace(/\d+ tokens avg/, "token usage unavailable");
      if (!skill.withValid) {
        header = header.replace(/<span class="badge [^"]*">[^<]*<\/span>/, '<span class="badge bad">Unavailable</span>')
          .replace(/\d+\/\d+ assertions/, "Assertion totals unavailable");
      }
      return header.replace("</header>", `<div class="delta ${deltaClass}">${delta}</div></header>`);
    });
    const suggestionClass = !skill.comparable || skill.withRate < 1 ? "bad" : suggestions.length ? "warn" : "ok";
    article = article.replace('<div class="evals">', `<p class="suggestion ${suggestionClass}"><strong>Suggested next step:</strong>
      ${suggestions.length ? suggestions.map((a) => escapeHtml(a.summary)).join(" ") :
        "No actionable defects detected in the successfully executed comparisons."}</p><div class="evals">`);
    const assertionFailure = skill.runs.filter((r) => r.mode === "with_skill" && valid(r))
      .flatMap((r) => r.grading.assertion_results).find((r) => !r.passed);
    if (assertionFailure) {
      article = article.replace('<div class="evals">', `<p class="suggestion bad">
        Judge FAILED a with_skill assertion: &quot;${escapeHtml(assertionFailure.text)}&quot; —
        evidence: &quot;${escapeHtml(assertionFailure.evidence)}&quot;.
        Add explicit guidance to SKILL.md covering this gap, then re-run.</p><div class="evals">`);
    }
    // Restrict replacements to report headers, never prompt/output/evidence.
    article = article.replace(/<details class="eval [^"]*">[\s\S]*?<\/summary>/g, (header) => {
      const evalSlug = header.match(/<span class="eval-name">([^<]+)<\/span>/)?.[1];
      const runs = skill.runs.filter((r) => escapeHtml(r.slug) === evalSlug);
      if (runs.length !== 2 || runs.some((r) => !valid(r))) {
        return header.replace(/class="eval [^"]*"/, 'class="eval bad"')
          .replace(/<span class="eval-status">[^<]*<\/span>/, '<span class="eval-status">!</span>')
          .replace(/\d+\/\d+ assertions/, "Invalid execution / grading");
      }
      return header;
    });
    const runQueues = {
      with_skill: skill.runs.filter((r) => r.mode === "with_skill").sort((a, b) => a.slug.localeCompare(b.slug)),
      without_skill: skill.runs.filter((r) => r.mode === "without_skill").sort((a, b) => a.slug.localeCompare(b.slug)),
    };
    article = article.replace(/<header class="run-head">[\s\S]*?<\/header>/g, (header) => {
      const mode = header.match(/class="mode mode-([^"]+)"/)?.[1];
      const run = runQueues[mode]?.shift();
      header = header.replace(/(?:null|\d+) tokens/, "token usage unavailable");
      if (!valid(run)) {
        const reasons = run?.diagnostics?.map((d) => `${d.role}: ${d.reason}`).join(", ");
        header = header.replace(/<span class="status [^"]*">[^<]*<\/span>/,
          `<span class="status bad">INVALID (${escapeHtml(reasons || run?.failures.join(", ") || "missing execution")})</span>`)
          .replace(/\d+\/\d+/, "assertion score unavailable");
      }
      return header;
    });
    return article;
  });
  if (patched !== assessment.skills.length) throw new Error("SDK report sections changed.");
  return html;
}

export async function runEvaluation({ env = process.env, execute = spawnSync, sdk } = {}) {
  const workspace = path.resolve(env.EVAL_WORKSPACE || "./agent-skills-workspace");
  mkdirSync(workspace, { recursive: true });
  const summaryPath = path.join(workspace, "eval-actionable.json");
  // A fatal run must not leave the previous run's successful handoff behind.
  rmSync(summaryPath, { force: true });
  if (!sdk) {
    if (!env.EVAL_PKG_DIR) throw new Error("EVAL_PKG_DIR is required.");
    sdk = await import(pathToFileURL(path.resolve(env.EVAL_PKG_DIR, "node_modules", "agent-skills-eval", "dist", "index.js")).href);
  }
  const scratch = mkdtempSync(path.join(workspace, ".cli-"));
  const state = createEvaluationState();
  let reportPath;
  try {
    const repository = path.join(scratch, "repository");
    mkdirSync(repository);
    // A real empty repository boundary stops ancestor skill/plugin discovery.
    const init = execute("git", ["init", "--quiet", repository], { encoding: "utf8" });
    if (init.error || init.status !== 0) throw new Error("Cannot isolate evaluation repository.");
    const provider = (role) => copilotCliProvider({ role, state, scratch, execute, env });
    const result = await sdk.evaluateSkills({
      root: env.SKILLS_ROOT || ".github/skills", workspace, baseline: true,
      target: { model: env.COPILOT_MODEL || "copilot-cli-default", provider: provider("target") },
      judge: { model: env.COPILOT_MODEL || "copilot-cli-default", provider: provider("judge") },
      concurrency: 1, workspaceLayout: "iteration", report: true,
      reportTitle: "Agent Skills Eval — weekly Copilot CLI run",
      onEvent: (event) => recordEvent(state, event),
    });
    reportPath = result.reportPath;
    const assessment = assessResults(result, state);
    const report = renderReport(assessment, [...state.models], readFileSync(result.reportPath, "utf8"));
    writeCanonicalArtifacts(assessment);
    writeFileSync(result.reportPath, report);
    json(summaryPath, assessment.summary);
    const reportDir = path.dirname(result.reportPath);
    if (env.GITHUB_OUTPUT) appendFileSync(env.GITHUB_OUTPUT, `report-dir=${reportDir}\n`);
    const lines = [
      "## Agent Skills Eval",
      "",
      `- Skills with evals: **${assessment.skills.length}**`,
      `- Model(s) evaluated: **${state.models.size}** (${[...state.models].map((m) => `\`${m.replace(/`/g, "'")}\``).join(", ") || "unavailable"})`,
      `- Evaluation status: **${assessment.operationalFailure ? "INVALID — operational failures" : "Completed"}**`,
      "- Token usage and cost: **unavailable (not measured)**.",
      "- Only successfully executed and graded paired runs are compared.",
      "- Download `agent-skills-eval-report` for the HTML report; full evidence is in `agent-skills-eval-workspace`.",
      "",
      "| Skill | Evals | With skill | Baseline | Delta |",
      "|---|---|---|---|---|",
      ...assessment.skills.map((s) => `| ${s.name} | ${s.evals} | ${rateLabel(s.withRate)} | ${rateLabel(s.withoutRate)} | ${s.comparable ? `${(s.delta * 100).toFixed(1)}pp` : "Unavailable (invalid comparison)"} |`),
      "",
      ...assessment.summary.actionable.map((a) => `- **${a.key}**: ${a.summary}`),
      "",
    ].join("\n");
    console.log(lines);
    if (env.GITHUB_STEP_SUMMARY) appendFileSync(env.GITHUB_STEP_SUMMARY, lines);
    return { assessment, exitCode: assessment.operationalFailure ? 1 : 0 };
  } catch (error) {
    // Never upload an uncorrected SDK report if validation/post-processing
    // fails: it can still contain the misleading improvement and zero usage.
    if (reportPath) rmSync(reportPath, { force: true });
    throw error;
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const result = await runEvaluation();
    process.exitCode = result.exitCode;
  } catch {
    // Never echo SDK/CLI exceptions: they may embed prompts or credentials.
    console.error("Skills evaluation failed operationally; no trustworthy comparison was produced.");
    process.exitCode = 1;
  }
}
