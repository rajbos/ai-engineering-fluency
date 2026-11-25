// Unit tests for skills-eval-issue.mjs. Every GitHub call goes to an
// in-memory fake or a stubbed fetch; nothing here touches the real API.
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BLOCK_END,
  BLOCK_START,
  IDENTITY_MARKER,
  LABEL,
  ReportError,
  createGitHubClient,
  decideReport,
  loadSummary,
  mergeBody,
  run,
  sanitizeText,
  validArtifactUrl,
} from "./skills-eval-issue.mjs";

const REPO = "octo/repo";
const SERVER = "https://github.com";

function fakeStore(issues = []) {
  const calls = [];
  const state = { issues: issues.map((i) => ({ ...i })), comments: [] };
  const client = {
    async ensureLabel() {
      calls.push(["ensureLabel"]);
    },
    async listAllIssues() {
      calls.push(["list"]);
      return state.issues.map((i) => ({ ...i }));
    },
    async addLabels(number, labels) {
      calls.push(["addLabels", number, labels]);
      const issue = state.issues.find((i) => i.number === number);
      issue.labels = [...(issue.labels ?? []), ...labels.map((name) => ({ name }))];
    },
    async createIssue(payload) {
      calls.push(["create", payload]);
      const issue = {
        number: 100 + state.issues.length,
        html_url: `${SERVER}/${REPO}/issues/${100 + state.issues.length}`,
        state: "open",
        user: { login: "github-actions[bot]" },
        labels: payload.labels.map((name) => ({ name })),
        title: payload.title,
        body: payload.body,
      };
      state.issues.push(issue);
      return issue;
    },
    async updateIssue(number, patch) {
      calls.push(["update", number, patch]);
      Object.assign(state.issues.find((i) => i.number === number), patch);
    },
    async createComment(number, body) {
      calls.push(["comment", number, body]);
      state.comments.push({ number, body });
    },
  };
  const writes = () => calls.filter(([kind]) => ["create", "update", "comment", "addLabels"].includes(kind));
  return { client, calls, state, writes };
}

function summaryFiles(map) {
  return {
    readFile: (file) => {
      if (!(file in map)) throw new Error("ENOENT");
      return map[file];
    },
    stat: (file) => {
      if (!(file in map)) throw new Error("ENOENT");
      return { size: Buffer.byteLength(map[file]) };
    },
  };
}

function summary(actionable, skills = [{ name: "check-urls", evals: 2, passRate: 0.5 }]) {
  return JSON.stringify({ version: 1, actionable, skills });
}

function env(overrides = {}) {
  return {
    GITHUB_REPOSITORY: REPO,
    GITHUB_SERVER_URL: SERVER,
    GITHUB_RUN_ID: "42",
    GITHUB_RUN_ATTEMPT: "1",
    SUMMARY_FILE: "s.json",
    EVAL_JOB_RESULT: "success",
    ...overrides,
  };
}

const quiet = () => {};
const FINDING = [{ key: "skill:check-urls:regression", summary: "with_skill scored lower than without_skill" }];

test("clean successful run makes no GitHub call at all", async () => {
  const store = fakeStore();
  const result = await run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary([]) }) });
  assert.equal(result.action, "none");
  assert.deepEqual(store.calls, []);
});

test("actionable findings create one labelled, marked issue linking the exact run and report", async () => {
  const store = fakeStore();
  const result = await run(
    env({ REPORT_ARTIFACT_URL: `${SERVER}/${REPO}/actions/runs/42/artifacts/7` }),
    { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) },
  );
  assert.equal(result.action, "created");
  const [, payload] = store.calls.find(([k]) => k === "create");
  assert.deepEqual(payload.labels, [LABEL]);
  assert.ok(payload.body.startsWith(IDENTITY_MARKER));
  assert.ok(payload.body.includes(BLOCK_START) && payload.body.includes(BLOCK_END));
  assert.ok(payload.body.includes(`${SERVER}/${REPO}/actions/runs/42/attempts/1`));
  assert.ok(payload.body.includes(`${SERVER}/${REPO}/actions/runs/42/artifacts/7`));
  assert.ok(payload.body.includes("`skill:check-urls:regression`"));
  assert.ok(payload.body.includes("| `check-urls` | 2 | 50% |"));
});

test("re-running with the same input is idempotent", async () => {
  const store = fakeStore();
  const opts = { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) };
  await run(env(), opts);
  const writesAfterFirst = store.writes().length;
  const second = await run(env({ GITHUB_RUN_ATTEMPT: "2" }), opts);
  // Attempt 2 only changes the attempt shown in the run link; no new issue, no comment.
  assert.equal(second.action, "updated");
  assert.equal(store.state.issues.length, 1);
  assert.equal(store.state.comments.length, 0);
  const third = await run(env({ GITHUB_RUN_ATTEMPT: "2" }), opts);
  assert.equal(third.action, "unchanged");
  assert.equal(store.writes().length, writesAfterFirst + 1);
});

test("existing open issue is updated in place, preserving human text, and comments only on changed findings", async () => {
  const store = fakeStore();
  const files = { "s.json": summary(FINDING) };
  await run(env(), { client: store.client, log: quiet, ...summaryFiles(files) });
  const issue = store.state.issues[0];
  issue.body = `Human note above.\n${issue.body}\nHuman note below.`;

  const sameKeys = await run(env({ GITHUB_RUN_ID: "43" }), { client: store.client, log: quiet, ...summaryFiles(files) });
  assert.equal(sameKeys.action, "updated");
  assert.equal(store.state.comments.length, 0, "same findings in a new run: body refresh only");

  files["s.json"] = summary([...FINDING, { key: "skill:loop:missing-evidence", summary: "judge found no evidence" }]);
  await run(env({ GITHUB_RUN_ID: "44" }), { client: store.client, log: quiet, ...summaryFiles(files) });
  assert.equal(store.state.issues.length, 1);
  assert.equal(store.state.comments.length, 1);
  assert.match(store.state.comments[0].body, /changed in \[run 44\]/);
  const body = store.state.issues[0].body;
  assert.ok(body.startsWith("Human note above.\n"));
  assert.ok(body.trimEnd().endsWith("Human note below."));
  assert.ok(body.includes("skill:loop:missing-evidence"));
  assert.equal(body.split(BLOCK_START).length, 2);
});

test("existing closed issue is reopened with a comment instead of creating a duplicate", async () => {
  const store = fakeStore([
    {
      number: 7,
      html_url: `${SERVER}/${REPO}/issues/7`,
      state: "closed",
      user: { login: "github-actions[bot]" },
      body: `${IDENTITY_MARKER}\nOld triage notes.`,
    },
  ]);
  const result = await run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) });
  assert.equal(result.action, "reopened");
  const update = store.calls.find(([k]) => k === "update");
  assert.equal(update[1], 7);
  assert.equal(update[2].state, "open");
  assert.ok(update[2].body.startsWith(`${IDENTITY_MARKER}\nOld triage notes.`));
  assert.equal(store.calls.filter(([k]) => k === "create").length, 0);
  assert.match(store.state.comments[0].body, /^Reopened:/);
});

test("an open issue wins over a closed one, and look-alikes from other authors are ignored", async () => {
  const marked = (number, state, login) => ({
    number,
    state,
    html_url: `${SERVER}/${REPO}/issues/${number}`,
    user: { login },
    body: IDENTITY_MARKER,
  });
  const store = fakeStore([
    marked(3, "closed", "github-actions[bot]"),
    marked(5, "open", "github-actions[bot]"),
    marked(9, "open", "mallory"),
    { ...marked(11, "open", "github-actions[bot]"), pull_request: {} },
  ]);
  const result = await run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) });
  assert.equal(result.number, 5);

  const spoofOnly = fakeStore([marked(9, "open", "mallory")]);
  const created = await run(env(), { client: spoofOnly.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) });
  assert.equal(created.action, "created");
});

for (const [name, files] of [
  ["missing", {}],
  ["unparseable", { "s.json": "{not json" }],
  ["wrong version", { "s.json": JSON.stringify({ version: 2, actionable: [], skills: [] }) }],
  ["malformed key", { "s.json": summary([{ key: "bad key with spaces", summary: "x" }]) }],
  ["out-of-range passRate", { "s.json": summary([], [{ name: "s", evals: 1, passRate: 80 }]) }],
]) {
  for (const jobResult of ["success", "failure", "cancelled"]) {
    test(`${name} summary is actionable when the eval job ended with ${jobResult}`, async () => {
      const store = fakeStore();
      const result = await run(env({ EVAL_JOB_RESULT: jobResult }), { client: store.client, log: quiet, ...summaryFiles(files) });
      assert.equal(result.action, "created");
      const [, payload] = store.calls.find(([k]) => k === "create");
      assert.match(payload.body, /`operational:summary-(missing|invalid)`/);
      assert.ok(!payload.body.includes("not json"), "file content is never echoed");
    });
  }
}

test("failed job with an empty actionable list is still reported", async () => {
  const decision = decideReport({ summaryResult: { ok: true, summary: { actionable: [], skills: [] } }, jobResult: "failure" });
  assert.deepEqual(decision.items.map((i) => i.key), ["operational:job-failed"]);
});

test("skipped eval job is not reported; unknown results fail loudly", async () => {
  const store = fakeStore();
  const result = await run(env({ EVAL_JOB_RESULT: "skipped" }), { client: store.client, log: quiet, ...summaryFiles({}) });
  assert.equal(result.action, "skipped");
  assert.deepEqual(store.calls, []);
  await assert.rejects(run(env({ EVAL_JOB_RESULT: "" }), { client: store.client, log: quiet, ...summaryFiles({}) }), ReportError);
});

test("API failures propagate instead of being swallowed", async () => {
  const store = fakeStore();
  store.client.createIssue = async () => {
    throw new ReportError("GitHub API POST /issues failed: HTTP 403");
  };
  await assert.rejects(
    run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) }),
    /HTTP 403/,
  );
});

test("malformed managed-section markers abort without editing", async () => {
  assert.throws(() => mergeBody(`${BLOCK_START}\nno end`, "new"), ReportError);
  assert.throws(() => mergeBody(`${BLOCK_END}\n${BLOCK_START}`, "new"), ReportError);
  const store = fakeStore([
    { number: 4, state: "open", html_url: "u", user: { login: "github-actions[bot]" }, body: `${IDENTITY_MARKER}\n${BLOCK_START}` },
  ]);
  await assert.rejects(run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) }), /malformed/);
  assert.equal(store.writes().length, 0);
});

test("sanitizeText strips hidden content and neutralizes markup", () => {
  const out = sanitizeText("a\u202Eb\u200Bc<!-- hide -->`@team`|x\nnext\u{E0041}");
  assert.equal(out, "abc'@team'/x next");
  assert.equal([...sanitizeText("x".repeat(500))].length, 300);
});

test("artifact links must belong to this run", () => {
  const ctx = { server: SERVER, repo: REPO, runId: "42" };
  assert.equal(validArtifactUrl(`${SERVER}/${REPO}/actions/runs/42/artifacts/9`, ctx), `${SERVER}/${REPO}/actions/runs/42/artifacts/9`);
  assert.equal(validArtifactUrl(`${SERVER}/${REPO}/actions/runs/41/artifacts/9`, ctx), null);
  assert.equal(validArtifactUrl("https://evil.example/x", ctx), null);
});

test("REST client tolerates an existing label but surfaces other HTTP errors without the token", async () => {
  const requests = [];
  const responses = [
    { ok: false, status: 422, json: async () => ({ message: "already_exists" }) },
    { ok: false, status: 500, json: async () => ({ message: "boom" }) },
  ];
  const client = createGitHubClient({
    token: "secret-token",
    repo: REPO,
    fetchImpl: async (url, init) => {
      requests.push({ url, init });
      return responses.shift();
    },
  });
  await client.ensureLabel();
  await assert.rejects(client.createIssue({ title: "t", body: "b" }), (err) => {
    assert.ok(err instanceof ReportError);
    assert.match(err.message, /HTTP 500 \(boom\)/);
    assert.ok(!err.message.includes("secret-token"));
    return true;
  });
  assert.equal(requests[0].url, `https://api.github.com/repos/${REPO}/labels`);
  assert.equal(requests[0].init.headers.Authorization, "Bearer secret-token");
});

test("removing the label from the tracking issue does not create a duplicate", async () => {
  const store = fakeStore();
  const opts = { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) };
  await run(env(), opts);
  store.state.issues[0].labels = [];

  const result = await run(env({ GITHUB_RUN_ID: "43" }), opts);
  assert.equal(result.action, "updated");
  assert.equal(store.state.issues.length, 1);
  assert.deepEqual(store.calls.filter(([k]) => k === "addLabels").map(([, n, l]) => [n, l]), [[100, [LABEL]]]);

  // Label back in place and body current: a further identical run writes nothing.
  const writes = store.writes().length;
  assert.equal((await run(env({ GITHUB_RUN_ID: "43" }), opts)).action, "unchanged");
  assert.equal(store.writes().length, writes);
});

test("a closed tracking issue whose label was renamed is reopened, not duplicated", async () => {
  const store = fakeStore([
    {
      number: 12,
      state: "closed",
      html_url: `${SERVER}/${REPO}/issues/12`,
      user: { login: "github-actions[bot]" },
      labels: [{ name: "eval-tracking-renamed" }],
      body: `${IDENTITY_MARKER}\nNotes.`,
    },
  ]);
  const result = await run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) });
  assert.equal(result.action, "reopened");
  assert.equal(result.number, 12);
  assert.equal(store.calls.filter(([k]) => k === "create").length, 0);
  assert.ok(store.calls.some(([k, n]) => k === "addLabels" && n === 12));
});

test("a spoofed labelled marker issue cannot shadow the real unlabelled one", async () => {
  const store = fakeStore([
    { number: 20, state: "open", html_url: "u20", user: { login: "mallory" }, labels: [{ name: LABEL }], body: IDENTITY_MARKER },
    { number: 8, state: "closed", html_url: "u8", user: { login: "github-actions[bot]" }, labels: [], body: IDENTITY_MARKER },
  ]);
  const result = await run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING) }) });
  assert.equal(result.number, 8);
  assert.ok(store.calls.every(([k, n]) => !["update", "comment", "addLabels"].includes(k) || n === 8));
});

test("REST lookup scans every issue without a label filter and refuses to guess past its bound", async () => {
  const urls = [];
  const full = Array.from({ length: 100 }, (_, i) => ({ number: i }));
  const client = createGitHubClient({
    token: "t",
    repo: REPO,
    fetchImpl: async (url) => {
      urls.push(url);
      return { ok: true, status: 200, json: async () => full };
    },
  });
  await assert.rejects(client.listAllIssues(), /refusing to guess/);
  assert.ok(urls.every((u) => u.includes("state=all") && !u.includes("labels=")));
  assert.equal(urls.length, 100);
});
test("passRate contract: null renders Unavailable, measured 0 stays 0%, missing/invalid values are rejected", async () => {
  const store = fakeStore();
  const skills = [
    { name: "unmeasured", evals: 2, passRate: null },
    { name: "measured-zero", evals: 2, passRate: 0 },
  ];
  await run(env(), { client: store.client, log: quiet, ...summaryFiles({ "s.json": summary(FINDING, skills) }) });
  const [, payload] = store.calls.find(([k]) => k === "create");
  assert.ok(payload.body.includes("| `unmeasured` | 2 | Unavailable |"));
  assert.ok(payload.body.includes("| `measured-zero` | 2 | 0% |"));
  assert.ok(!payload.body.includes("| `unmeasured` | 2 | 0% |"));

  for (const bad of [{ name: "s", evals: 1 }, { name: "s", evals: 1, passRate: "0.5" }, { name: "s", evals: 1, passRate: 1.5 }, { name: "s", evals: 1, passRate: -0.1 }]) {
    const result = decideReport({ summaryResult: loadSummaryFrom(JSON.stringify({ version: 1, actionable: [], skills: [bad] })), jobResult: "success" });
    assert.deepEqual(result.items.map((i) => i.key), ["operational:summary-invalid"]);
  }
});

function loadSummaryFrom(text) {
  return loadSummary("x.json", summaryFiles({ "x.json": text }));
}
