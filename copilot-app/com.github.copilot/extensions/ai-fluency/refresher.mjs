import { randomUUID } from "node:crypto";
import { EventEmitter } from "node:events";
import { unwatchFile, watchFile } from "node:fs";
import { link, readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { runFluencyCli, DEFAULT_TIMEOUT_MS, KILL_GRACE_MS, killTree } from "./cli.mjs";
import { artifactsDir, buildSnapshot, ensurePrivateDir, PRIVATE_FILE_MODE, readSnapshot, snapshotPath, writeSnapshot } from "./store.mjs";

export const AUTO_REFRESH_MS = 30 * 60 * 1000;
export const OPEN_REFRESH_MIN_AGE_MS = 5 * 60 * 1000;
const TICK_MS = 60 * 1000;
/** A live session's lock goes stale this long after the CLI timeout (covers CLI resolution and the kill grace). */
const LOCK_STALE_GRACE_MS = 2 * 60 * 1000;
/** The owner only removes its lock while it is at least this far from going stale (see releaseLock). */
const RELEASE_MARGIN_MS = 30 * 1000;
/** A lock file that cannot be parsed yet may still be being written (no-hard-link fallback); treat it as held this long. */
const PARTIAL_LOCK_GRACE_MS = 10 * 1000;
/** Takeover claims live for milliseconds; one older than this was left behind by a session that crashed. */
const CLAIM_TTL_MS = 30 * 1000;
const MAX_CLAIMS = 5;
const DISPOSE_WAIT_MS = KILL_GRACE_MS * 2 + 1000;

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
    return a.token === b.token && a.pid === b.pid && a.startedAt === b.startedAt && a.unreadable === b.unreadable;
}

/** File-name-safe identity of one lock file's contents. */
function lockId(lock) {
    const raw = lock.token ?? `${lock.unreadable ? "unreadable" : lock.pid}-${Date.parse(lock.startedAt)}`;
    return String(raw).replace(/[^\w-]/g, "").slice(0, 64) || "lock";
}

/** True when `candidate` is a newer snapshot than `current`. */
function isNewer(candidate, current) {
    if (!candidate) return false;
    if (!current) return true;
    return !(Date.parse(current.fetchedAt) >= Date.parse(candidate.fetchedAt));
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Owns the on-disk snapshot and makes sure only one CLI run happens at a time,
 * across every Copilot session on this machine (each session runs its own
 * extension process, so a lock file coordinates them).
 */
export class Refresher extends EventEmitter {
    constructor({ dir = artifactsDir(), runCli = runFluencyCli, kill = killTree, now = () => Date.now(), timeoutMs = DEFAULT_TIMEOUT_MS, pollMs = 5000 } = {}) {
        super();
        this.dir = dir;
        this.runCli = runCli;
        this.kill = kill;
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
        this.disposed = false;
    }

    /**
     * Reads the snapshot from disk once per use of the canvas; concurrent callers share the read. A newer in-memory
     * snapshot (from a refresh that landed while reading) is never replaced by an older file.
     */
    load() {
        this.loading ??= (async () => {
            await ensurePrivateDir(this.dir).catch(() => {});
            const snapshot = await readSnapshot(this.dir);
            if (isNewer(snapshot, this.snapshot)) this.snapshot = snapshot;
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

    staleAfterMs() {
        return this.timeoutMs + LOCK_STALE_GRACE_MS;
    }

    /** The parsed lock, `null` when there is none, or `{ unreadable, startedAt: <mtime> }` when it cannot be parsed. */
    async readLock(path = this.lockPath) {
        let text;
        try {
            text = await readFile(path, "utf8");
        } catch (error) {
            if (error.code === "ENOENT") return null;
            text = "";
        }
        try {
            const lock = JSON.parse(text);
            if (lock && typeof lock === "object") return lock;
        } catch {
            // partially written or corrupt: fail closed below
        }
        const { mtimeMs } = await stat(path).catch(() => ({ mtimeMs: Date.now() }));
        return { unreadable: true, startedAt: new Date(mtimeMs).toISOString() };
    }

    /** A lock that must be respected: another live session's run within its time budget, or one still being written. */
    isOtherSessionLock(lock) {
        if (!lock) return false;
        const age = this.now() - Date.parse(lock.startedAt);
        if (lock.unreadable) return age < PARTIAL_LOCK_GRACE_MS;
        if (lock.pid === process.pid) return false;
        return age < this.staleAfterMs() && pidAlive(lock.pid);
    }

    async otherSessionLock() {
        const lock = await this.readLock();
        return this.isOtherSessionLock(lock) ? lock : null;
    }

    /**
     * Publishes a complete lock file atomically: `link` never overwrites, so exactly one session can create it, and
     * nobody can read it half-written. File systems without hard links fall back to an exclusive create; readers
     * treat the brief unparseable state as held (PARTIAL_LOCK_GRACE_MS) rather than stale.
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
     * Removes the lock judged stale — and only that one. Every session that wants to remove a given stale lock must
     * first create its claim file (`wx`, so exactly one succeeds), then re-reads the lock and unlinks it only if it is
     * still that stale lock. Nothing else can change it meanwhile: creators get EEXIST while it exists, rival takers
     * are held off by the claim, and the stale owner no longer removes its own lock (see releaseLock). A lock's
     * contents never reappear once removed, so a late taker's re-read always fails and the claim can then be dropped.
     */
    async takeOverStaleLock(stale) {
        const id = lockId(stale);
        for (let attempt = 0; attempt < MAX_CLAIMS; attempt++) {
            const claim = `${this.lockPath}.${id}.${attempt}.claim`;
            try {
                await writeFile(claim, "", { flag: "wx", mode: PRIVATE_FILE_MODE });
            } catch (error) {
                if (error.code !== "EEXIST") throw error;
                const { mtimeMs } = await stat(claim).catch(() => ({ mtimeMs: Date.now() }));
                if (Date.now() - mtimeMs > CLAIM_TTL_MS) continue; // abandoned by a crashed session: use the next one
                return false; // another session is taking over this lock right now
            }
            try {
                const current = await this.readLock();
                if (!current) return true;
                if (!sameLock(current, stale)) return false;
                await unlink(this.lockPath).catch((error) => {
                    if (error.code !== "ENOENT") throw error;
                });
                return true;
            } finally {
                await unlink(claim).catch(() => {});
            }
        }
        return false;
    }

    /** Deletes claim and temp files left behind by crashed sessions. Only safe while this session holds the lock. */
    async removeLeftovers() {
        const prefix = "refresh.lock.";
        const names = await readdir(this.dir).catch(() => []);
        for (const name of names) {
            if (!name.startsWith(prefix) || !/\.(claim|tmp)$/.test(name) || name.includes(this.lockToken)) continue;
            const path = join(this.dir, name);
            const { mtimeMs } = await stat(path).catch(() => ({ mtimeMs: Date.now() }));
            if (Date.now() - mtimeMs > CLAIM_TTL_MS) await unlink(path).catch(() => {});
        }
    }

    async acquireLock() {
        await ensurePrivateDir(this.dir);
        const token = randomUUID();
        const body = JSON.stringify({ pid: process.pid, token, startedAt: new Date(this.now()).toISOString() });
        let acquired = await this.createLock(body, token);
        if (!acquired) {
            const current = await this.readLock();
            if (this.isOtherSessionLock(current)) return false;
            acquired = (!current || (await this.takeOverStaleLock(current))) && (await this.createLock(body, token));
        }
        if (!acquired) return false;
        this.lockToken = token;
        await this.removeLeftovers();
        return true;
    }

    /**
     * Removes this session's lock. Other sessions only take over a live session's lock once it is staleAfterMs old, so
     * the read-then-unlink below cannot hit a replacement while the lock is well short of that age. Past that point
     * the lock is left alone and simply expires.
     */
    async releaseLock() {
        const token = this.lockToken;
        this.lockToken = null;
        if (!token) return;
        const lock = await this.readLock();
        if (lock?.token !== token) return;
        if (this.now() - Date.parse(lock.startedAt) > this.staleAfterMs() - RELEASE_MARGIN_MS) return;
        await unlink(this.lockPath).catch(() => {});
    }

    /** Start a refresh (or join the one already running). Resolves with the state when done. */
    refresh() {
        if (this.disposed) return Promise.resolve(this.state());
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
            const onSpawn = (child) => {
                this.child = child;
                if (this.disposed) this.kill(child);
            };
            const { payload, cli } = await this.runCli({ timeoutMs: this.timeoutMs, onSpawn });
            if (this.disposed) return this.state(); // shutting down: don't publish a snapshot after disposal began
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

    /**
     * Waits for another session's refresh to finish: a new snapshot appears, or its lock goes away or expires.
     * Returns the state as soon as that happens, or after `maxWaitMs` with the status still `running`.
     */
    async waitForOtherSession({ maxWaitMs = this.staleAfterMs() } = {}) {
        const deadline = Date.now() + maxWaitMs;
        while (!this.disposed && this.status.state === "running" && this.status.byOtherSession && Date.now() < deadline) {
            await sleep(this.pollMs);
            await this.onSnapshotFileChanged();
            await this.checkOtherSession();
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
        // Nothing watched the file while no panel was open, so read it again (load() keeps a newer in-memory copy).
        this.loading = null;
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

    /**
     * Stop everything (extension shutdown): no new refreshes, stop the running CLI process tree and wait for that run to
     * end before giving up the lock, so another session cannot start a second CLI while this one is still exiting.
     */
    async dispose(kill = this.kill) {
        this.disposed = true;
        this.users = 1;
        this.release();
        if (this.child) kill(this.child);
        if (this.inflight) {
            // Unref'd: a run that is already gone must not keep the exiting process alive for the full wait.
            const giveUp = new Promise((resolve) => setTimeout(resolve, DISPOSE_WAIT_MS).unref?.());
            await Promise.race([this.inflight, giveUp]);
        }
        await this.releaseLock();
    }
}
