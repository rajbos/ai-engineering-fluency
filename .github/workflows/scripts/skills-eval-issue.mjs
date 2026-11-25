#!/usr/bin/env node
/**
 * Report the Agent Skills eval result into ONE tracking issue.
 *
 * Runs in the isolated `report-issue` job of .github/workflows/skills-eval.yml.
 * That job never sees the eval workspace, prompts, model outputs or the
 * Copilot PAT: its only input is the sanitized summary the eval runner writes
 * to `${EVAL_WORKSPACE}/eval-actionable.json`:
 *
 *   { "version": 1,
 *     "actionable": [{ "key": "stable-id", "summary": "short explanation" }],
 *     "skills": [{ "name": "skill", "evals": 3, "passRate": 0.67 }] }
 *
 * `passRate` is a measured fraction 0..1, or null when unavailable (rendered
 * "Unavailable", never 0%). A missing `passRate` key is invalid.
 *
 * plus the eval job's result (`success` / `failure` / `cancelled` / `skipped`).
 *
 * Behaviour:
 *   - A successful run with an empty `actionable` list is clean: no GitHub API
 *     call at all, so no issue is created, updated or reopened.
 *   - A missing, invalid or malformed summary is never treated as clean,
 *     whatever the job conclusion; it becomes an operational finding.
 *   - A failed job whose summary lists nothing gets an operational finding too.
 *   - A skipped eval job (never ran) is not reported. A cancelled one is judged
 *     by its summary like any other run.
 *   - The tracking issue is found by an HTML marker in an issue authored by the
 *     trusted bot, open or closed, scanning ALL repository issues: the
 *     `skills-eval-report` label is a convenience filter only, so removing or
 *     renaming it can never cause a duplicate (it is re-applied). A closed
 *     one is reopened for a recurrence; a new one is created only when none
 *     exists. Only the text between the start/end markers is rewritten, so
 *     human notes outside them are preserved.
 *   - Re-running with the same input is a no-op; a comment is posted only on
 *     reopen or when the set of actionable keys changed (subscribers are not
 *     notified of body edits).
 *   - Summary text is re-sanitized here (defence in depth) and rendered inside
 *     code spans, so it cannot mention users, autolink, or inject markup.
 *
 * Environment:
 *   SUMMARY_FILE            path to eval-actionable.json (may be absent)
 *   EVAL_JOB_RESULT         needs.skills-eval.result
 *   GH_TOKEN                token with issues:write (not needed for DRY_RUN)
 *   GITHUB_REPOSITORY, GITHUB_SERVER_URL, GITHUB_API_URL,
 *   GITHUB_RUN_ID, GITHUB_RUN_ATTEMPT  standard Actions variables
 *   REPORT_ARTIFACT_URL     optional URL of the HTML report artifact
 *   WORKSPACE_ARTIFACT_URL  optional URL of the raw workspace artifact
 *   DRY_RUN=1               print planned writes, never call the API
 *
 * Exit codes: 0 reported / clean / skipped, 1 on any error (surfaced as an
 * ::error:: annotation so a broken reporter fails the job visibly).
 */

import { appendFileSync, readFileSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

export const IDENTITY_MARKER = "<!-- skills-eval-report -->";
export const BLOCK_START = "<!-- skills-eval-report:start -->";
export const BLOCK_END = "<!-- skills-eval-report:end -->";
export const LABEL = "skills-eval-report";
export const ISSUE_TITLE = "Agent Skills eval: actionable findings";
export const TRUSTED_AUTHOR = "github-actions[bot]";

const MAX_SUMMARY_BYTES = 256 * 1024;
const MAX_ITEMS = 50;
const MAX_SKILLS = 100;
const MAX_TEXT = 300;
const MAX_NAME = 100;
// Full-repository scan bound (issues + PRs). Exceeding it fails rather than risk a duplicate.
const MAX_LIST_PAGES = 100;
const KEY_RE = /^[A-Za-z0-9][A-Za-z0-9._:/-]{0,119}$/;
const STATE_RE = /<!-- skills-eval-report:state run=(\d+) keys=([0-9a-f]{16}) -->/;

export class ReportError extends Error {}

// Characters that hide or reorder text: C0/C1 controls, bidi controls,
// zero-width/invisible characters, variation selectors and Unicode tags.
const HIDDEN_CHARS =
  /[\u0000-\u001F\u007F-\u009F\u061C\u180E\u200B-\u200F\u202A-\u202E\u2060-\u2064\u2066-\u2069\uFE00-\uFE0F\uFEFF]|[\u{E0000}-\u{E007F}\u{E0100}-\u{E01EF}]/gu;

/** Make arbitrary text safe to place inside a single-line Markdown code span. */
export function sanitizeText(value, max = MAX_TEXT) {
  let text = String(value)
    .replace(/\r\n?|\n|\t/g, " ")
    .replace(HIDDEN_CHARS, "")
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<!--|-->/g, "")
    .replace(/`/g, "'")
    .replace(/\|/g, "/")
    .replace(/\s+/g, " ")
    .trim();
  if ([...text].length > max) text = `${[...text].slice(0, max - 1).join("").trimEnd()}…`;
  return text;
}

function codeSpan(text) {
  return `\`${text}\``;
}

/** Validate the parsed summary. Returns { ok, summary } or { ok:false, reason }. */
export function validateSummary(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return { ok: false, reason: "not a JSON object" };
  if (data.version !== 1) return { ok: false, reason: "unsupported version" };
  if (!Array.isArray(data.actionable)) return { ok: false, reason: "`actionable` is not an array" };
  if (!Array.isArray(data.skills)) return { ok: false, reason: "`skills` is not an array" };

  const actionable = [];
  const seen = new Set();
  for (const item of data.actionable) {
    if (!item || typeof item.key !== "string" || !KEY_RE.test(item.key)) {
      return { ok: false, reason: "an actionable item has an invalid `key`" };
    }
    if (typeof item.summary !== "string") return { ok: false, reason: "an actionable item has no `summary`" };
    const summary = sanitizeText(item.summary);
    if (!summary) return { ok: false, reason: "an actionable item has an empty `summary`" };
    if (seen.has(item.key)) continue;
    seen.add(item.key);
    actionable.push({ key: item.key, summary });
  }

  const skills = [];
  for (const skill of data.skills) {
    const name = skill && typeof skill.name === "string" ? sanitizeText(skill.name, MAX_NAME) : "";
    if (!name) return { ok: false, reason: "a skill has an invalid `name`" };
    if (!Number.isInteger(skill.evals) || skill.evals < 0) return { ok: false, reason: "a skill has an invalid `evals`" };
    // null = not measured (e.g. invalid with-skill result); 0 is a real, measured 0%.
    const unavailable = skill.passRate === null;
    if (!unavailable && (typeof skill.passRate !== "number" || !Number.isFinite(skill.passRate) || skill.passRate < 0 || skill.passRate > 1)) {
      return { ok: false, reason: "a skill has an invalid `passRate` (expected 0..1 or null)" };
    }
    skills.push({ name, evals: skill.evals, passRate: skill.passRate });
  }
  return { ok: true, summary: { actionable, skills } };
}

/** Read and validate the summary file. Reasons are fixed strings, never file content. */
export function loadSummary(file, { readFile = readFileSync, stat = statSync } = {}) {
  if (!file) return { ok: false, reason: "missing" };
  let size;
  try {
    size = stat(file).size;
  } catch {
    return { ok: false, reason: "missing" };
  }
  if (size > MAX_SUMMARY_BYTES) return { ok: false, reason: "too large" };
  let data;
  try {
    data = JSON.parse(readFile(file, "utf8"));
  } catch {
    return { ok: false, reason: "not valid JSON" };
  }
  const result = validateSummary(data);
  return result.ok ? result : { ok: false, reason: `invalid (${result.reason})` };
}

/**
 * Decide what (if anything) to report.
 * Returns { skip:true, why } or { items, skills, total }; `items` empty = clean.
 */
export function decideReport({ summaryResult, jobResult }) {
  // `skipped` means the eval job never ran (e.g. its own `if:` guard), so there is nothing to judge.
  if (jobResult === "skipped") return { skip: true, why: "eval job skipped" };
  if (!["success", "failure", "cancelled"].includes(jobResult)) {
    throw new ReportError(`unexpected eval job result: ${sanitizeText(jobResult ?? "", 40) || "(empty)"}`);
  }
  // A missing/invalid summary is never a clean run, whatever the job conclusion.
  if (!summaryResult.ok) {
    const code = summaryResult.reason === "missing" ? "missing" : "invalid";
    const summary =
      jobResult === "success"
        ? `The eval job succeeded but its actionable summary is ${summaryResult.reason}; the runner/reporter contract is broken.`
        : `The eval job ended with ${jobResult} and its actionable summary is ${summaryResult.reason}. Check the run log.`;
    return { items: [{ key: `operational:summary-${code}`, summary: sanitizeText(summary) }], skills: [], total: 1 };
  }
  let items = summaryResult.summary.actionable;
  if (jobResult === "failure" && items.length === 0) {
    items = [{ key: "operational:job-failed", summary: "The eval job failed although its summary lists no actionable findings. Check the run log." }];
  }
  return { items, skills: summaryResult.summary.skills, total: items.length };
}

export function keysHash(items) {
  const keys = [...new Set(items.map((i) => i.key))].sort().join("\n");
  return createHash("sha256").update(keys).digest("hex").slice(0, 16);
}

export function formatPassRate(passRate) {
  return passRate === null ? "Unavailable" : `${(passRate * 100).toFixed(0)}%`;
}

export function renderBlock({ items, skills, total, run, jobResult, reportUrl, workspaceUrl }) {
  const lines = [
    BLOCK_START,
    `<!-- skills-eval-report:state run=${run.id} keys=${keysHash(items)} -->`,
    "## Latest automated report",
    "",
    `- **Run:** [${run.id} (attempt ${run.attempt})](${run.url})`,
    `- **Eval job result:** ${codeSpan(jobResult)}`,
    `- **HTML report:** ${reportUrl ? `[download artifact](${reportUrl})` : "not uploaded (see the run)"}`,
    `- **Raw workspace (prompts, outputs, gradings):** ${workspaceUrl ? `[download artifact](${workspaceUrl})` : "see the run artifacts"}`,
    "",
    `### Actionable findings (${total})`,
    "",
  ];
  for (const item of items.slice(0, MAX_ITEMS)) lines.push(`- ${codeSpan(item.key)}: ${codeSpan(item.summary)}`);
  if (items.length > MAX_ITEMS) lines.push(`- …and ${items.length - MAX_ITEMS} more; see the HTML report.`);
  if (skills.length > 0) {
    lines.push("", "### Skill pass rates", "", "| Skill | Evals | Pass rate |", "| --- | ---: | ---: |");
    for (const s of skills.slice(0, MAX_SKILLS)) {
      lines.push(`| ${codeSpan(s.name)} | ${s.evals} | ${formatPassRate(s.passRate)} |`);
    }
    if (skills.length > MAX_SKILLS) lines.push(`| …${skills.length - MAX_SKILLS} more | | |`);
  }
  lines.push(
    "",
    "_This section is rewritten by the Agent Skills Eval workflow on each run with actionable findings. " +
      "Text outside the automated section is preserved. Close the issue once resolved; a recurrence reopens it._",
    BLOCK_END,
  );
  return lines.join("\n");
}

export function newIssueBody(block, workflowUrl) {
  return [
    IDENTITY_MARKER,
    `Tracking issue maintained by the [Agent Skills Eval](${workflowUrl}) workflow. Add notes above or below the automated section.`,
    "",
    block,
    "",
  ].join("\n");
}

function countOf(haystack, needle) {
  return haystack.split(needle).length - 1;
}

/** Replace only the managed block, preserving everything else. */
export function mergeBody(existingBody, block) {
  const body = existingBody ?? "";
  const starts = countOf(body, BLOCK_START);
  const ends = countOf(body, BLOCK_END);
  if (starts === 0 && ends === 0) return `${body.trimEnd()}\n\n${block}\n`;
  const s = body.indexOf(BLOCK_START);
  const e = body.indexOf(BLOCK_END);
  if (starts !== 1 || ends !== 1 || e < s) {
    throw new ReportError("the tracking issue's automated-section markers are malformed; fix them by hand and re-run");
  }
  return body.slice(0, s) + block + body.slice(e + BLOCK_END.length);
}

export function parseState(body) {
  const m = STATE_RE.exec(body ?? "");
  return m ? { runId: m[1], keys: m[2] } : null;
}

/** Pick the tracking issue: trusted author + identity marker; open beats closed, then newest. */
export function findTrackingIssue(issues, trustedAuthor = TRUSTED_AUTHOR) {
  const candidates = issues.filter(
    (i) => !i.pull_request && i.user?.login === trustedAuthor && (i.body ?? "").includes(IDENTITY_MARKER),
  );
  candidates.sort((a, b) => (a.state === "open") - (b.state === "open") || a.number - b.number);
  return candidates.at(-1) ?? null;
}

function hasLabel(issue) {
  return (issue.labels ?? []).some((l) => (typeof l === "string" ? l : l?.name) === LABEL);
}

/** Create, update or reopen the tracking issue. Returns { action, number?, url? }. */
export async function reportToIssue({ client, decision, run, jobResult, reportUrl, workspaceUrl, workflowUrl, log = () => {} }) {
  if (decision.skip) return { action: "skipped" };
  if (decision.items.length === 0) return { action: "none" };

  const block = renderBlock({ ...decision, run, jobResult, reportUrl, workspaceUrl });
  const hash = keysHash(decision.items);
  await client.ensureLabel();
  // Authoritative lookup: marker + trusted author over every issue, independent of labels.
  const existing = findTrackingIssue(await client.listAllIssues());

  if (!existing) {
    const created = await client.createIssue({ title: ISSUE_TITLE, body: newIssueBody(block, workflowUrl), labels: [LABEL] });
    log(`Created tracking issue #${created.number}`);
    return { action: "created", number: created.number, url: created.html_url };
  }

  const previous = parseState(existing.body);
  const body = mergeBody(existing.body, block);
  const wasClosed = existing.state === "closed";
  const patch = {};
  if (body !== existing.body) patch.body = body;
  if (wasClosed) patch.state = "open";
  if (Object.keys(patch).length === 0) {
    if (!hasLabel(existing)) await client.addLabels(existing.number, [LABEL]);
    log(`Tracking issue #${existing.number} already reflects run ${run.id}`);
    return { action: "unchanged", number: existing.number, url: existing.html_url };
  }
  await client.updateIssue(existing.number, patch);
  if (!hasLabel(existing)) await client.addLabels(existing.number, [LABEL]);

  const findings = `${decision.total} actionable finding${decision.total === 1 ? "" : "s"}`;
  let comment = null;
  if (wasClosed) comment = `Reopened: [run ${run.id}](${run.url}) reported ${findings} again. See the updated automated section.`;
  else if (previous?.runId !== String(run.id) && previous?.keys !== hash) {
    comment = `The set of actionable findings changed in [run ${run.id}](${run.url}) (${findings}). See the updated automated section.`;
  }
  if (comment) await client.createComment(existing.number, comment);
  const action = wasClosed ? "reopened" : "updated";
  log(`${action[0].toUpperCase()}${action.slice(1)} tracking issue #${existing.number}`);
  return { action, number: existing.number, url: existing.html_url };
}

/** Minimal REST client (no dependencies). Errors carry status + API message, never the token. */
export function createGitHubClient({ token, repo, apiUrl = "https://api.github.com", fetchImpl = globalThis.fetch }) {
  if (!token) throw new ReportError("GH_TOKEN is not set");
  if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo ?? "")) throw new ReportError("GITHUB_REPOSITORY is invalid");
  const base = `${apiUrl.replace(/\/+$/, "")}/repos/${repo}`;

  async function request(method, path, body, okStatuses = []) {
    let res;
    try {
      res = await fetchImpl(`${base}${path}`, {
        method,
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${token}`,
          "X-GitHub-Api-Version": "2022-11-28",
          ...(body ? { "Content-Type": "application/json" } : {}),
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      throw new ReportError(`GitHub API ${method} ${path} failed: ${sanitizeText(err?.message ?? err, 200)}`);
    }
    if (res.ok) return res.status === 204 ? null : res.json();
    if (okStatuses.includes(res.status)) return null;
    let detail = "";
    try {
      detail = sanitizeText((await res.json())?.message ?? "", 200);
    } catch {
      /* non-JSON error body */
    }
    throw new ReportError(`GitHub API ${method} ${path} failed: HTTP ${res.status}${detail ? ` (${detail})` : ""}`);
  }

  return {
    // 422 = label already exists.
    ensureLabel: () =>
      request("POST", "/labels", { name: LABEL, color: "d93f0b", description: "Agent Skills eval tracking issue" }, [422]),
    // Every issue (and PR) in every state; no label filter, so relabelling cannot hide the tracker.
    async listAllIssues() {
      const all = [];
      for (let page = 1; page <= MAX_LIST_PAGES; page++) {
        const batch = await request("GET", `/issues?state=all&per_page=100&page=${page}`);
        if (!Array.isArray(batch)) throw new ReportError("GitHub API returned an unexpected issue list");
        all.push(...batch);
        if (batch.length < 100) return all;
      }
      throw new ReportError(`repository has more than ${MAX_LIST_PAGES * 100} issues; refusing to guess whether a tracking issue exists`);
    },
    addLabels: (number, labels) => request("POST", `/issues/${number}/labels`, { labels }),
    createIssue: (payload) => request("POST", "/issues", payload),
    updateIssue: (number, patch) => request("PATCH", `/issues/${number}`, patch),
    createComment: (number, body) => request("POST", `/issues/${number}/comments`, { body }),
  };
}

/** Client for DRY_RUN: no reads (nothing exists) and every write is only printed. */
export function createDryRunClient(log) {
  return {
    ensureLabel: async () => log(`[dry-run] ensure label ${LABEL}`),
    listAllIssues: async () => [],
    addLabels: async (number, labels) => log(`[dry-run] add labels ${labels.join(", ")} to #${number}`),
    createIssue: async (payload) => {
      log(`[dry-run] create issue "${payload.title}":\n${payload.body}`);
      return { number: 0, html_url: "(dry-run)" };
    },
    updateIssue: async (number, patch) => log(`[dry-run] update #${number}: ${JSON.stringify(Object.keys(patch))}`),
    createComment: async (number, body) => log(`[dry-run] comment on #${number}: ${body}`),
  };
}

/** Accept only artifact links of this very run, so a link cannot point elsewhere. */
export function validArtifactUrl(url, { server, repo, runId }) {
  if (!url) return null;
  const prefix = `${server}/${repo}/actions/runs/${runId}/artifacts/`;
  return url.startsWith(prefix) && /^\d+$/.test(url.slice(prefix.length)) ? url : null;
}

export async function run(env = process.env, { client, log = console.log, readFile, stat } = {}) {
  const server = env.GITHUB_SERVER_URL || "https://github.com";
  const repo = env.GITHUB_REPOSITORY ?? "";
  const runId = env.GITHUB_RUN_ID ?? "";
  if (!/^\d+$/.test(runId)) throw new ReportError("GITHUB_RUN_ID is missing or invalid");
  const attempt = /^\d+$/.test(env.GITHUB_RUN_ATTEMPT ?? "") ? env.GITHUB_RUN_ATTEMPT : "1";
  const runInfo = { id: runId, attempt, url: `${server}/${repo}/actions/runs/${runId}/attempts/${attempt}` };
  const ctx = { server, repo, runId };

  const summaryResult = loadSummary(env.SUMMARY_FILE, { readFile, stat });
  if (!summaryResult.ok) log(`Actionable summary ${summaryResult.reason}.`);
  const decision = decideReport({ summaryResult, jobResult: env.EVAL_JOB_RESULT });
  if (decision.skip) {
    log(`Not reporting: ${decision.why}.`);
    return { action: "skipped" };
  }
  if (decision.items.length === 0) {
    log("Clean run: nothing actionable, no issue created or updated.");
    return { action: "none" };
  }

  const activeClient =
    client ??
    (env.DRY_RUN === "1"
      ? createDryRunClient(log)
      : createGitHubClient({ token: env.GH_TOKEN, repo, apiUrl: env.GITHUB_API_URL || undefined }));
  return reportToIssue({
    client: activeClient,
    decision,
    run: runInfo,
    jobResult: env.EVAL_JOB_RESULT,
    reportUrl: validArtifactUrl(env.REPORT_ARTIFACT_URL, ctx),
    workspaceUrl: validArtifactUrl(env.WORKSPACE_ARTIFACT_URL, ctx),
    workflowUrl: `${server}/${repo}/actions/workflows/skills-eval.yml`,
    log,
  });
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    const result = await run();
    const line = result.url ? `Skills eval issue: ${result.action} (${result.url})` : `Skills eval issue: ${result.action}`;
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${line}\n`);
    if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `issue-action=${result.action}\n`);
  } catch (err) {
    const message = err instanceof ReportError ? err.message : `unexpected error: ${sanitizeText(err?.stack ?? err, 500)}`;
    console.log(`::error title=Skills eval issue report::${message}`);
    process.exitCode = 1;
  }
}
