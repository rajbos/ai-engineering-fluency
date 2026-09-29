import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { buildSnapshot, describeSession, readSnapshot, summarize, topSeries, writeSnapshot } from "../store.mjs";
import { samplePayload } from "./fixtures.mjs";

const noDescribe = () => ({ label: null, project: null });

test("buildSnapshot trims the payload to what the canvas renders", () => {
    const snapshot = buildSnapshot(samplePayload(), { fetchedAt: "2026-01-02T00:00:00.000Z", cli: { version: "9.9.9", source: "global" }, describe: noDescribe });
    assert.equal(snapshot.schemaVersion, 1);
    assert.equal(snapshot.cliVersion, "9.9.9");
    assert.deepEqual(Object.keys(snapshot.periods), ["today", "last30Days", "month", "lastMonth"]);
    assert.equal(snapshot.periods.today.models[0].name, "model-large", "models sorted by tokens desc");
    assert.equal(snapshot.periods.today.models[1].tokens, 120);
    assert.deepEqual(snapshot.periods.today.editors, [{ name: "Editor A", tokens: 1000, sessions: 1 }]);
    assert.deepEqual(snapshot.charts.day, {
        labels: ["2026-01-01", "2026-01-02"],
        tokens: [10, 20],
        sessions: [1, 2],
        cost: [0.1, 0.2346],
        splits: {
            tokens: { model: [{ label: "model-large", data: [8, 15] }, { label: "model-small", data: [2, 5] }] },
            cost: { editor: [{ label: "Editor A", data: [0.1, 0.2346] }] },
            sessions: {},
        },
    });
    assert.deepEqual(snapshot.charts.week, { labels: ["Dec 29–Jan 4"], tokens: [30], sessions: [3], cost: [0.3], splits: { tokens: {}, cost: {}, sessions: {} } });
    assert.equal(snapshot.charts.month, null);
    assert.equal(snapshot.sessions.length, 2, "sessions are de-duplicated by file path");
    assert.ok(snapshot.sessions.every((s) => !("filePath" in s)), "raw file paths are not stored");
    assert.equal(snapshot.fluency.categories[0].tips[0], "do more");
    assert.ok(!("period" in snapshot.fluency));
    assert.ok(!("curation" in snapshot));
});

test("buildSnapshot tolerates an empty CLI payload", () => {
    const snapshot = buildSnapshot({ details: { today: {}, month: {}, lastMonth: {}, last30Days: {} }, chart: { labels: [] }, usage: {}, fluency: {} }, { describe: noDescribe });
    assert.equal(snapshot.periods.today.tokens, 0);
    assert.deepEqual(snapshot.sessions, []);
    assert.equal(snapshot.fluency, null);
    assert.deepEqual(snapshot.charts, { day: null, week: null, month: null });
});

test("topSeries keeps the largest series and folds the rest into Other", () => {
    const named = Array.from({ length: 10 }, (_, i) => ({ label: `series-${i}`, data: [i + 1, 1] }));
    const kept = topSeries([...named, { label: "Other", data: [5, 0] }, { label: "silent", data: [0, 0] }], 2);
    assert.equal(kept.length, 9);
    assert.deepEqual(kept.slice(0, 2).map((s) => s.label), ["series-9", "series-8"], "largest first");
    assert.deepEqual(kept.at(-1), { label: "Other (3)", data: [1 + 2 + 5, 2], other: true }, "two smallest + the CLI's own Other");
    assert.deepEqual(topSeries([{ label: "a", data: [3] }, { label: "b", data: [1] }], 1, { limit: 1 }), [{ label: "a", data: [3] }, { label: "b", data: [1] }], "a single leftover keeps its name");
    assert.deepEqual(topSeries([{ label: "a", data: [0.123456, "x"] }], 2, { digits: 4 }), [{ label: "a", data: [0.1235, 0] }]);
    assert.deepEqual(topSeries(undefined, 3), []);
});

test("describeSession derives labels from session metadata", async (t) => {
    const root = await mkdtemp(join(tmpdir(), "ai-fluency-"));
    t.after(() => rm(root, { recursive: true, force: true }));

    const cliDir = join(root, "session-state", "11111111-2222-3333-4444-555555555555");
    await mkdir(cliDir, { recursive: true });
    await writeFile(join(cliDir, "workspace.yaml"), "id: x\ncwd: C:\\work\\copilot-worktrees\\demo-repo\\branch-a\nname: Fix the widget\n");
    assert.deepEqual(describeSession(join(cliDir, "events.jsonl")), { label: "Fix the widget", project: "demo-repo" });
    await writeFile(join(cliDir, "workspace.yaml"), 'cwd: C:\\work\\plain-repo\nname: "**Review** the PRs.\\n\\nThen   report back"\n');
    assert.deepEqual(describeSession(join(cliDir, "events.jsonl")), { label: "Review the PRs. Then report back", project: "plain-repo" });
    await writeFile(join(cliDir, "workspace.yaml"), "cwd: /home/someone/code/posix-repo/\nname: Tidy up\n");
    assert.deepEqual(describeSession(join(cliDir, "events.jsonl")), { label: "Tidy up", project: "posix-repo" }, "POSIX cwd, trailing slash");
    await writeFile(join(cliDir, "workspace.yaml"), "cwd: /home/someone/copilot-worktrees/posix-demo/branch-b\n");
    assert.deepEqual(describeSession(join(cliDir, "events.jsonl")), { label: null, project: "posix-demo" }, "POSIX worktree cwd");

    const wsDir = join(root, "workspaceStorage", "abc123");
    await mkdir(join(wsDir, "chatSessions"), { recursive: true });
    await writeFile(join(wsDir, "workspace.json"), JSON.stringify({ folder: "file:///c%3A/code/sample-project" }));
    assert.deepEqual(describeSession(join(wsDir, "chatSessions", "s.jsonl")), { label: null, project: "sample-project" });
    await writeFile(join(wsDir, "workspace.json"), JSON.stringify({ workspace: "file:///home/someone/code/team.code-workspace" }));
    assert.deepEqual(describeSession(join(wsDir, "chatSessions", "s.jsonl")), { label: null, project: "team" }, "POSIX workspace file URI");
    await writeFile(join(wsDir, "workspace.json"), JSON.stringify({ folder: "C:\\code\\windows-project\\" }));
    assert.deepEqual(describeSession(join(wsDir, "chatSessions", "s.jsonl")), { label: null, project: "windows-project" }, "Windows folder path");

    assert.deepEqual(describeSession(join(root, "C--Users-someone-code-repos-org-app--claude-worktrees-feature-x", "s.jsonl")), {
        label: "feature-x",
        project: "org-app",
    });
    assert.deepEqual(describeSession(join(root, "C--Users-someone--claude-worktrees-demo-repo-quiet-otter-a1b2c3", "s.jsonl")), {
        label: "demo-repo-quiet-otter",
        project: null,
    });
    assert.deepEqual(describeSession("/nowhere/opencode.db#ses_abc"), { label: null, project: null });
});

test("snapshots round-trip through disk and ignore other schema versions", async (t) => {
    const dir = await mkdtemp(join(tmpdir(), "ai-fluency-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    assert.equal(await readSnapshot(dir), null);
    const snapshot = buildSnapshot(samplePayload(), { describe: noDescribe });
    await writeSnapshot(snapshot, dir);
    assert.deepEqual(await readSnapshot(dir), snapshot);
    await writeSnapshot({ ...snapshot, schemaVersion: 0 }, dir);
    assert.equal(await readSnapshot(dir), null);
});

test("summarize returns a compact agent-facing view", () => {
    assert.equal(summarize(null).available, false);
    const summary = summarize(buildSnapshot(samplePayload(), { describe: noDescribe }), { topSessions: 1 });
    assert.equal(summary.available, true);
    assert.equal(summary.periods.today.estimatedApiCostUsd, 1.25);
    assert.equal(summary.periods.today.topModels.length, 2);
    assert.equal(summary.fluency.overall, "Stage 3: AI Collaborator");
    assert.equal(summary.topSessionsLast7Days.length, 1);
    assert.equal(summary.topSessionsLast7Days[0].label, "Editor A a");
});
