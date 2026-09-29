import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Refresher } from "../refresher.mjs";
import { buildSnapshot, readSnapshot, writeSnapshot } from "../store.mjs";
import { samplePayload } from "./fixtures.mjs";

async function tempDir(t) {
    const dir = await mkdtemp(join(tmpdir(), "ai-fluency-"));
    t.after(() => rm(dir, { recursive: true, force: true }));
    return dir;
}

test("refresh runs the CLI once, persists the snapshot and releases the lock", async (t) => {
    const dir = await tempDir(t);
    let runs = 0;
    let release;
    const gate = new Promise((resolve) => (release = resolve));
    const refresher = new Refresher({
        dir,
        runCli: async () => {
            runs++;
            await gate;
            return { payload: samplePayload(), cli: { version: "1.2.3", source: "global" } };
        },
    });
    const states = [];
    refresher.on("change", (s) => states.push(s.status.state));

    const first = refresher.refresh();
    const second = refresher.refresh();
    assert.equal(first, second, "concurrent refreshes share one run");
    await new Promise((r) => setTimeout(r, 20));
    const lock = JSON.parse(await readFile(join(dir, "refresh.lock"), "utf8"));
    assert.equal(lock.pid, process.pid);
    release();
    const { snapshot, status } = await first;

    assert.equal(runs, 1);
    assert.equal(status.state, "idle");
    assert.equal(snapshot.cliVersion, "1.2.3");
    assert.deepEqual(await readSnapshot(dir), snapshot);
    await assert.rejects(readFile(join(dir, "refresh.lock")), { code: "ENOENT" });
    assert.deepEqual(states, ["running", "idle"]);
});

test("a failed refresh surfaces the error and keeps the previous snapshot", async (t) => {
    const dir = await tempDir(t);
    const previous = buildSnapshot(samplePayload(), { fetchedAt: "2026-01-01T00:00:00.000Z", describe: () => ({ label: null, project: null }) });
    await writeSnapshot(previous, dir);
    const refresher = new Refresher({ dir, runCli: async () => { throw new Error("boom"); } });
    const { snapshot, status } = await refresher.refresh();
    assert.equal(status.state, "error");
    assert.equal(status.error, "boom");
    assert.equal(snapshot.fetchedAt, previous.fetchedAt);
});

test("maybeRefresh skips fresh snapshots and recent failures", async (t) => {
    const dir = await tempDir(t);
    let now = Date.parse("2026-01-01T01:00:00.000Z");
    await writeSnapshot(buildSnapshot(samplePayload(), { fetchedAt: "2026-01-01T00:50:00.000Z", describe: () => ({ label: null, project: null }) }), dir);
    let runs = 0;
    let fail = true;
    const refresher = new Refresher({
        dir,
        now: () => now,
        runCli: async () => {
            runs++;
            if (fail) throw new Error("nope");
            return { payload: samplePayload(), cli: null };
        },
    });
    await refresher.maybeRefresh(30 * 60 * 1000);
    assert.equal(runs, 0, "10-minute-old snapshot is fresh enough");
    await refresher.maybeRefresh(5 * 60 * 1000);
    assert.equal(runs, 1, "older than 5 minutes triggers a refresh");
    await refresher.maybeRefresh(5 * 60 * 1000);
    assert.equal(runs, 1, "a failure within the window is not retried");
    now += 6 * 60 * 1000;
    fail = false;
    await refresher.maybeRefresh(5 * 60 * 1000);
    assert.equal(runs, 2, "retried after the window");
});

test("defers to a refresh already running in another session", async (t) => {
    const dir = await tempDir(t);
    // The parent process is alive and is not us, so its lock counts as "another session".
    await writeFile(join(dir, "refresh.lock"), JSON.stringify({ pid: process.ppid, startedAt: new Date().toISOString() }));
    let runs = 0;
    const refresher = new Refresher({ dir, runCli: async () => (runs++, { payload: samplePayload(), cli: null }) });
    const { status } = await refresher.refresh();
    assert.equal(runs, 0);
    assert.equal(status.state, "running");
    assert.equal(status.byOtherSession, true);

    await writeSnapshot(buildSnapshot(samplePayload(), { fetchedAt: "2026-02-02T00:00:00.000Z", describe: () => ({ label: null, project: null }) }), dir);
    await refresher.onSnapshotFileChanged();
    assert.equal(refresher.state().status.state, "idle");
    assert.equal(refresher.snapshot.fetchedAt, "2026-02-02T00:00:00.000Z");
});

test("reclaims a stale lock left by a dead process", async (t) => {
    const dir = await tempDir(t);
    await writeFile(join(dir, "refresh.lock"), JSON.stringify({ pid: 2 ** 22 + 12345, startedAt: new Date().toISOString() }));
    let runs = 0;
    const refresher = new Refresher({ dir, runCli: async () => (runs++, { payload: samplePayload(), cli: null }) });
    const { status } = await refresher.refresh();
    assert.equal(runs, 1);
    assert.equal(status.state, "idle");
    assert.deepEqual(await readdir(dir), ["snapshot.json"], "no lock, temp or stale files left behind");
});

test("does not delete a fresh lock that replaced the stale one after it was checked", async (t) => {
    const dir = await tempDir(t);
    const lockPath = join(dir, "refresh.lock");
    const stale = { pid: 2 ** 22 + 12345, startedAt: new Date().toISOString() };
    const fresh = { pid: process.ppid, token: "other-session", startedAt: new Date().toISOString() };
    await writeFile(lockPath, JSON.stringify(stale));

    // Another session removes the stale lock and writes its own between our stale check and our cleanup.
    class RacingRefresher extends Refresher {
        lockReads = 0;
        async readLock(path = this.lockPath) {
            const lock = await super.readLock(path);
            if (path === this.lockPath && ++this.lockReads === 2) await writeFile(lockPath, JSON.stringify(fresh));
            return lock;
        }
    }
    let runs = 0;
    const refresher = new RacingRefresher({ dir, runCli: async () => (runs++, { payload: samplePayload(), cli: null }) });
    const { status } = await refresher.refresh();
    assert.equal(runs, 0, "backs off instead of running a second CLI");
    assert.equal(status.byOtherSession, true);
    assert.deepEqual(JSON.parse(await readFile(lockPath, "utf8")), fresh, "the other session's lock is intact");
    assert.deepEqual(await readdir(dir), ["refresh.lock"]);
});

test("only releases its own lock", async (t) => {
    const dir = await tempDir(t);
    const lockPath = join(dir, "refresh.lock");
    const other = { pid: process.ppid, token: "other-session", startedAt: new Date().toISOString() };
    const refresher = new Refresher({
        dir,
        runCli: async () => {
            assert.ok(JSON.parse(await readFile(lockPath, "utf8")).token, "our lock carries a token");
            await writeFile(lockPath, JSON.stringify(other)); // ours was reclaimed by another session
            return { payload: samplePayload(), cli: null };
        },
    });
    await refresher.refresh();
    assert.deepEqual(JSON.parse(await readFile(lockPath, "utf8")), other);
});

test("concurrent loads read the snapshot once and never overwrite a newer one", async (t) => {
    const dir = await tempDir(t);
    await writeSnapshot(buildSnapshot(samplePayload(), { fetchedAt: "2026-01-01T00:00:00.000Z", describe: () => ({ label: null, project: null }) }), dir);
    const refresher = new Refresher({ dir, runCli: async () => ({ payload: samplePayload(), cli: null }) });
    const first = refresher.load();
    const shared = refresher.loading;
    refresher.load();
    assert.equal(refresher.loading, shared, "concurrent callers share one read");
    refresher.snapshot = { fetchedAt: "2026-03-03T00:00:00.000Z" }; // a refresh landed while the file was being read
    assert.equal((await first).fetchedAt, "2026-03-03T00:00:00.000Z");
});
