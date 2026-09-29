import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { unwatchFile, watchFile } from "node:fs";
import { link, readFile, rename, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runFluencyCli, DEFAULT_TIMEOUT_MS } from "./cli.mjs";
import { artifactsDir, buildSnapshot, ensurePrivateDir, PRIVATE_FILE_MODE, readSnapshot, snapshotPath, writeSnapshot } from "./store.mjs";

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

/** Same lock file contents (locks written by older versions have no token, so fall back to pid + start time). */
function sameLock(a, b) {
    if (!a || !b) return a === b;
    return a.token === b.token && a.pid === b.pid && a.startedAt === b.startedAt;
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
        this.lockToken = null;
        this.snapshot = null;
        this.loading = null;
        this.status = { state: "idle", startedAt: null, finishedAt: null, error: null, byOtherSession: false };
        this.inflight = null;
        this.child = null;
        this.users = 0;
        this.timer = null;
        this.watching = false;
    }

    /** Reads the snapshot from disk once; concurrent callers share the same read. */
    load() {
        this.loading ??= (async () => {
            await ensurePrivateDir(this.dir).catch(() => {});
            const snapshot = await readSnapshot(this.dir);
            // A refresh or file-watcher update may have landed while reading; never replace it with the older file.
            if (!this.snapshot) this.snapshot = snapshot;
        })();
        return this.loading.then(() => this.snapshot);
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

    async readLock(path = this.lockPath) {
        try {
            return JSON.parse(await readFile(path, "utf8"));
        } catch {
            return null; // no lock or unreadable lock
        }
    }

    /** A lock held by another live session whose run has not exceeded the CLI timeout. */
    isOtherSessionLock(lock) {
        if (!lock || lock.pid === process.pid) return false;
        const fresh = this.now() - Date.parse(lock.startedAt) < this.timeoutMs + 60_000;
        return fresh && pidAlive(lock.pid);
    }

    async otherSessionLock() {
        const lock = await this.readLock();
        return this.isOtherSessionLock(lock) ? lock : null;
    }

    /**
     * Publishes a complete lock file atomically: `link` never overwrites, so exactly one session can create it, and
     * nobody can read it half-written. Falls back to an exclusive create on file systems without hard links.
     */
    async createLock(body, token) {
        const temp = `${this.lockPath}.${token}.tmp`;
        await writeFile(temp, body, { flag: "wx", mode: PRIVATE_FILE_MODE });
        try {
            await link(temp, this.lockPath);
            return true;
        } catch (error) {
            if (error.code === "EEXIST") return false;
            try {
                await writeFile(this.lockPath, body, { flag: "wx", mode: PRIVATE_FILE_MODE });
                return true;
            } catch (fallbackError) {
                if (fallbackError.code === "EEXIST") return false;
                throw fallbackError;
            }
        } finally {
            await unlink(temp).catch(() => {});
        }
    }

    /**
     * Removes the lock judged stale — and only that one. Several sessions can see the same stale lock; renaming it
     * aside is atomic, so only one of them moves any given file. If the file moved turns out to be a fresh lock that
     * another session wrote after our check, it is put back (`link` again never overwrites) and we back off.
     */
    async removeStaleLock(stale, token) {
        const aside = `${this.lockPath}.${token}.stale`;
        try {
            await rename(this.lockPath, aside);
        } catch (error) {
            return error.code === "ENOENT"; // already removed by someone else: try to create ours
        }
        const moved = await this.readLock(aside);
        if (sameLock(moved, stale)) {
            await unlink(aside).catch(() => {});
            return true;
        }
        await link(aside, this.lockPath).catch(() => {});
        await unlink(aside).catch(() => {});
        return false;
    }

    async acquireLock() {
        await ensurePrivateDir(this.dir);
        const token = randomUUID();
        const body = JSON.stringify({ pid: process.pid, token, startedAt: new Date(this.now()).toISOString() });
        let acquired = await this.createLock(body, token);
        if (!acquired) {
            const current = await this.readLock();
            if (this.isOtherSessionLock(current)) return false;
            acquired = (await this.removeStaleLock(current, token)) && (await this.createLock(body, token));
        }
        if (acquired) this.lockToken = token;
        return acquired;
    }

    async releaseLock() {
        const token = this.lockToken;
        this.lockToken = null;
        if (!token) return;
        const lock = await this.readLock();
        if (lock?.token === token) await unlink(this.lockPath).catch(() => {});
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
