import assert from "node:assert/strict";
import { mkdtemp, readdir, readFile, rm, unlink, utimes, writeFile } from "node:fs/promises";
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

const noDescribe = () => ({ label: null, project: null });
const sampleAt = (fetchedAt) => buildSnapshot(samplePayload(), { fetchedAt, describe: noDescribe });

test("reopening after every panel closed reads the snapshot again, keeping a newer one in memory", async (t) => {
    const dir = await tempDir(t);
    await writeSnapshot(sampleAt("2026-01-01T00:00:00.000Z"), dir);
    const refresher = new Refresher({ dir, pollMs: 60_000, runCli: async () => ({ payload: samplePayload(), cli: null }) });
    t.after(() => refresher.release());
    refresher.acquire();
    assert.equal((await refresher.load()).fetchedAt, "2026-01-01T00:00:00.000Z");
    refresher.release();

    await writeSnapshot(sampleAt("2026-02-02T00:00:00.000Z"), dir); // another session refreshed while no panel was open
    refresher.acquire();
    assert.equal((await refresher.load()).fetchedAt, "2026-02-02T00:00:00.000Z");
    refresher.release();

    refresher.snapshot = sampleAt("2026-03-03T00:00:00.000Z");
    refresher.acquire();
    assert.equal((await refresher.load()).fetchedAt, "2026-03-03T00:00:00.000Z", "an older file never replaces a newer snapshot");
});

test("a lock that cannot be parsed yet is respected until it is clearly abandoned", async (t) => {
    const dir = await tempDir(t);
    const lockPath = join(dir, "refresh.lock");
    await writeFile(lockPath, '{"pid":'); // another session is mid-write (no-hard-link fallback)
    let runs = 0;
    const refresher = new Refresher({ dir, runCli: async () => (runs++, { payload: samplePayload(), cli: null }) });
    const { status } = await refresher.refresh();
    assert.equal(runs, 0);
    assert.equal(status.byOtherSession, true);
    assert.equal(await readFile(lockPath, "utf8"), '{"pid":');

    const old = new Date(Date.now() - 60_000);
    await utimes(lockPath, old, old);
    await refresher.refresh();
    assert.equal(runs, 1, "a corrupt lock is reclaimed once it is old");
});

/** Separate sessions in one test process: each treats locks with another token as live. */
class Session extends Refresher {
    isOtherSessionLock(lock) {
        if (lock?.token && lock.token !== this.lockToken) return true;
        return super.isOtherSessionLock(lock);
    }
}

test("sessions racing to take over the same stale lock end up with exactly one owner", async (t) => {
    for (let round = 0; round < 25; round++) {
        const dir = await tempDir(t);
        const lockPath = join(dir, "refresh.lock");
        await writeFile(lockPath, JSON.stringify({ pid: 2 ** 22 + 12345, startedAt: new Date().toISOString() }));
        const sessions = [0, 1, 2].map(() => new Session({ dir }));
        const won = await Promise.all(sessions.map((s) => s.acquireLock()));
        assert.equal(won.filter(Boolean).length, 1, `round ${round}: ${won}`);
        const owner = sessions[won.indexOf(true)];
        assert.equal(JSON.parse(await readFile(lockPath, "utf8")).token, owner.lockToken);
        assert.deepEqual(await readdir(dir), ["refresh.lock"], "no claims or temp files left");
    }
});

test("a live claim holds other takers off; an abandoned one does not block forever", async (t) => {
    const dir = await tempDir(t);
    const lockPath = join(dir, "refresh.lock");
    const stale = { pid: 2 ** 22 + 12345, startedAt: new Date().toISOString() };
    await writeFile(lockPath, JSON.stringify(stale));
    const claim = join(dir, `refresh.lock.${2 ** 22 + 12345}-${Date.parse(stale.startedAt)}.0.claim`);
    await writeFile(claim, "");

    const refresher = new Refresher({ dir });
    assert.equal(await refresher.takeOverStaleLock(stale), false, "another session is mid-takeover");
    assert.deepEqual(JSON.parse(await readFile(lockPath, "utf8")), stale);

    const old = new Date(Date.now() - 60_000);
    await utimes(claim, old, old); // that session crashed
    assert.equal(await refresher.acquireLock(), true);
    assert.deepEqual(await readdir(dir), ["refresh.lock"], "the abandoned claim is cleaned up by the new owner");
});

test("the owner leaves its lock alone once it is close to expiring", async (t) => {
    const dir = await tempDir(t);
    let now = Date.now();
    const refresher = new Refresher({ dir, now: () => now, timeoutMs: 60_000 });
    assert.equal(await refresher.acquireLock(), true);
    now += refresher.staleAfterMs() - 10_000; // another session may be about to take it over
    await refresher.releaseLock();
    assert.ok(JSON.parse(await readFile(join(dir, "refresh.lock"), "utf8")).token, "not removed: it expires instead");
});

test("dispose stops the run, waits for it and publishes nothing afterwards", async (t) => {
    const dir = await tempDir(t);
    const child = { pid: 4242 };
    const killed = [];
    let finish;
    let runs = 0;
    const refresher = new Refresher({
        dir,
        kill: (target) => {
            killed.push(target);
            finish();
        },
        runCli: async ({ onSpawn }) => {
            runs++;
            onSpawn(child);
            await new Promise((resolve) => (finish = resolve));
            return { payload: samplePayload(), cli: null };
        },
    });
    const running = refresher.refresh();
    await new Promise((r) => setTimeout(r, 20));
    await refresher.dispose();
    assert.deepEqual(killed, [child]);
    await running;
    await assert.rejects(readFile(join(dir, "refresh.lock")), { code: "ENOENT" }, "lock released after the run ended");
    await assert.rejects(readFile(join(dir, "snapshot.json")), { code: "ENOENT" }, "no snapshot written during shutdown");
    await refresher.refresh();
    assert.equal(runs, 1, "no new runs after dispose");
});

test("waiting for another session's refresh returns when its snapshot lands", async (t) => {
    const dir = await tempDir(t);
    const lockPath = join(dir, "refresh.lock");
    await writeFile(lockPath, JSON.stringify({ pid: process.ppid, token: "other", startedAt: new Date().toISOString() }));
    const refresher = new Refresher({ dir, pollMs: 10, runCli: async () => assert.fail("must not run") });
    assert.equal((await refresher.refresh()).status.byOtherSession, true);
    setTimeout(async () => {
        await writeSnapshot(sampleAt("2026-04-04T00:00:00.000Z"), dir);
        await unlink(lockPath);
    }, 30);
    const { status, snapshot } = await refresher.waitForOtherSession();
    assert.equal(status.state, "idle");
    assert.equal(snapshot.fetchedAt, "2026-04-04T00:00:00.000Z");

    await writeFile(lockPath, JSON.stringify({ pid: process.ppid, token: "other", startedAt: new Date().toISOString() }));
    await refresher.refresh();
    const timedOut = await refresher.waitForOtherSession({ maxWaitMs: 30 });
    assert.equal(timedOut.status.state, "running", "gives up after maxWaitMs");
});
