import { EventEmitter } from "node:events";
import { unwatchFile, watchFile } from "node:fs";
import { mkdir, readFile, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runFluencyCli, DEFAULT_TIMEOUT_MS } from "./cli.mjs";
import { artifactsDir, buildSnapshot, readSnapshot, snapshotPath, writeSnapshot } from "./store.mjs";

export const AUTO_REFRESH_MS = 30 * 60 * 1000;
export const OPEN_REFRESH_MIN_AGE_MS = 5 * 60 * 1000;
const TICK_MS = 60 * 1000;

function pidAlive(pid) {
    try {
        process.kill(pid, 0);
        return true;
    } catch (error) {
        return error.code === "EPERM";
    }
}

/**
 * Owns the on-disk snapshot and makes sure only one CLI run happens at a time,
 * across every Copilot session on this machine (each session runs its own
 * extension process, so a lock file coordinates them).
 */
export class Refresher extends EventEmitter {
    constructor({ dir = artifactsDir(), runCli = runFluencyCli, now = () => Date.now(), timeoutMs = DEFAULT_TIMEOUT_MS, pollMs = 5000 } = {}) {
        super();
        this.dir = dir;
        this.runCli = runCli;
        this.now = now;
        this.timeoutMs = timeoutMs;
        this.pollMs = pollMs;
        this.lockPath = join(dir, "refresh.lock");
        this.snapshot = null;
        this.loaded = false;
        this.status = { state: "idle", startedAt: null, finishedAt: null, error: null, byOtherSession: false };
        this.inflight = null;
        this.child = null;
        this.users = 0;
        this.timer = null;
        this.watching = false;
    }

    async load() {
        if (!this.loaded) {
            this.snapshot = await readSnapshot(this.dir);
            this.loaded = true;
        }
        return this.snapshot;
    }

    state() {
        return { snapshot: this.snapshot, status: { ...this.status } };
    }

    snapshotAgeMs() {
        const fetched = Date.parse(this.snapshot?.fetchedAt ?? "");
        return Number.isFinite(fetched) ? this.now() - fetched : Infinity;
    }

    setStatus(patch) {
        this.status = { ...this.status, ...patch };
        this.emit("change", this.state());
    }

    async otherSessionLock() {
        try {
            const lock = JSON.parse(await readFile(this.lockPath, "utf8"));
            const fresh = this.now() - Date.parse(lock.startedAt) < this.timeoutMs + 60_000;
            if (lock.pid !== process.pid && fresh && pidAlive(lock.pid)) return lock;
        } catch {
            // no lock or unreadable lock
        }
        return null;
    }

    async acquireLock() {
        await mkdir(this.dir, { recursive: true });
        const body = JSON.stringify({ pid: process.pid, startedAt: new Date(this.now()).toISOString() });
        try {
            await writeFile(this.lockPath, body, { flag: "wx" });
            return true;
        } catch (error) {
            if (error.code !== "EEXIST") throw error;
            if (await this.otherSessionLock()) return false;
            await unlink(this.lockPath).catch(() => {});
            await writeFile(this.lockPath, body, { flag: "wx" }).catch(() => {});
            return !(await this.otherSessionLock());
        }
    }

    async releaseLock() {
        try {
            const lock = JSON.parse(await readFile(this.lockPath, "utf8"));
            if (lock.pid === process.pid) await unlink(this.lockPath);
        } catch {
            // already gone
        }
    }

    /** Start a refresh (or join the one already running). Resolves with the state when done. */
    refresh() {
        if (this.inflight) return this.inflight;
        this.inflight = this.doRefresh()
            .catch((error) => {
                this.setStatus({ state: "error", finishedAt: new Date(this.now()).toISOString(), error: error.message });
                return this.state();
            })
            .finally(() => {
                this.inflight = null;
            });
        return this.inflight;
    }

    async doRefresh() {
        await this.load();
        const other = await this.otherSessionLock();
        if (other) {
            this.setStatus({ state: "running", startedAt: other.startedAt, error: null, byOtherSession: true });
            return this.state();
        }
        if (!(await this.acquireLock())) {
            this.setStatus({ state: "running", startedAt: new Date(this.now()).toISOString(), error: null, byOtherSession: true });
            return this.state();
        }
        const startedAt = this.now();
        this.setStatus({ state: "running", startedAt: new Date(startedAt).toISOString(), error: null, byOtherSession: false });
        try {
            const { payload, cli } = await this.runCli({ timeoutMs: this.timeoutMs, onSpawn: (child) => (this.child = child) });
            const snapshot = buildSnapshot(payload, { fetchedAt: new Date(this.now()).toISOString(), durationMs: this.now() - startedAt, cli });
            await writeSnapshot(snapshot, this.dir);
            this.snapshot = snapshot;
            this.setStatus({ state: "idle", finishedAt: snapshot.fetchedAt, error: null });
        } catch (error) {
            this.setStatus({ state: "error", finishedAt: new Date(this.now()).toISOString(), error: error.message });
        } finally {
            this.child = null;
            await this.releaseLock();
        }
        return this.state();
    }

    /** Refresh only when the snapshot is older than `maxAgeMs` (or missing). */
    async maybeRefresh(maxAgeMs) {
        await this.load();
        if (this.inflight || this.status.state === "running" || this.snapshotAgeMs() < maxAgeMs) return this.state();
        const failedRecently = this.status.state === "error" && this.now() - Date.parse(this.status.finishedAt) < maxAgeMs;
        if (failedRecently) return this.state();
        return this.refresh();
    }

    /** Picks up snapshots written by another session's refresh. */
    async onSnapshotFileChanged() {
        const snapshot = await readSnapshot(this.dir);
        if (!snapshot || snapshot.fetchedAt === this.snapshot?.fetchedAt) return;
        this.snapshot = snapshot;
        if (this.status.byOtherSession) {
            this.setStatus({ state: "idle", finishedAt: snapshot.fetchedAt, error: null, byOtherSession: false });
        } else {
            this.emit("change", this.state());
        }
    }

    async checkOtherSession() {
        if (this.status.state === "running" && this.status.byOtherSession && !(await this.otherSessionLock())) {
            await this.onSnapshotFileChanged();
            if (this.status.byOtherSession) this.setStatus({ state: "idle", byOtherSession: false });
        }
    }

    /** Called when a canvas instance opens; starts watching + the 30-minute auto refresh. */
    acquire() {
        this.users++;
        if (this.users > 1) return;
        watchFile(snapshotPath(this.dir), { interval: this.pollMs }, () => void this.onSnapshotFileChanged());
        this.watching = true;
        this.timer = setInterval(() => {
            void this.checkOtherSession().then(() => this.maybeRefresh(AUTO_REFRESH_MS));
        }, TICK_MS);
        this.timer.unref?.();
    }

    release() {
        this.users = Math.max(0, this.users - 1);
        if (this.users > 0) return;
        clearInterval(this.timer);
        this.timer = null;
        if (this.watching) unwatchFile(snapshotPath(this.dir));
        this.watching = false;
    }

    /** Stop everything, including a running CLI process (extension shutdown). */
    async dispose(killTree) {
        this.users = 1;
        this.release();
        if (this.child) killTree?.(this.child);
        await this.releaseLock();
    }
}
