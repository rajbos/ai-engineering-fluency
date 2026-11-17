# Cross-host parse coordination (VS Code stable, Insiders, desktop app)

> **Status:** Implemented · **Decided/added:** 2026-11-17 · **Code:** `src/fileLock.ts`, `src/machineParseLock.ts`, `vscode-extension/src/cacheManager.ts`, `desktop/src/main.ts`

## Context

One machine can run VS Code stable, VS Code Insiders and the desktop tray app at the same time.
All three scan and parse the same local AI-session files.

The extension already elects one **refresh leader** per VS Code edition
(`refresh_<cacheId>.lock`) and shares that leader's parse with its other windows through a
snapshot (`cache_<cacheId>.snapshot.json`). Both files live in `globalStorageUri`, which is per
edition. The desktop app uses the CLI cache (`~/.copilot-token-tracker/cli-cache.json`). So the
hosts never see each other: on a cold start three full parses ran concurrently.

The lock had a second gap. Its 30-second heartbeat proved the leader's *process* was alive, not
that its parse was moving. A parse wedged on an await that never settles kept renewing the lock,
and the other windows stayed followers indefinitely.

Uploads are not affected: upload locks are per endpoint and uploads are idempotent per
(user, dataset, day). This work is only about duplicate parsing and hung leaders.

## Decision

### 1. One editor-neutral lock primitive (`src/fileLock.ts`)

The lock logic that lived privately in `CacheManager` is now shared, with the owner identity
injected (`{ id, pid, host }`) instead of read from `vscode.env.sessionId`:

- atomic `wx` create; owner-only renew and release;
- dead-owner check (`process.kill(pid, 0)`), plus the Windows PID-reuse check (a live pid only
  counts when its image is one of our hosts — now including the packaged desktop app,
  `AI Engineering Fluency.exe`, which the old pattern missed);
- 5-minute heartbeat timeout; corrupt-lock recovery;
- **new:** a holder may declare `stallMs` (progress deadline, checked against `progressAt`) and
  `maxHoldMs` (hard cap, checked against `acquiredAt`). The heartbeat only advances `progressAt`
  when the work reported progress since the previous beat;
- **new:** breaking a stale lock happens under a short-lived `<lock>.break` mutex with a re-check,
  so two contenders breaking the same stale lock can no longer both "win" (the second used to
  delete the first one's brand-new lock).

The file keeps the original `sessionId` / `pid` / `timestamp` field names, so mixed extension
versions still understand each other's locks; the new fields are optional.

### 2. A machine-wide parse lock (`src/machineParseLock.ts`)

`~/.copilot-token-tracker/locks/session-parse.lock` is visible to every host. The per-edition
refresh lock still picks one leader per edition; that leader then takes the machine-wide lock
before its heavy parse:

- VS Code: `CacheManager.coordinateCrossHostParse()` (called from the extension's
  `beginRefreshTurn()`) waits up to **2 minutes**, polling every 2 s. The views keep showing the
  cached snapshot meanwhile. `releaseRefreshLock()` ends the turn.
- Desktop: every full-stats parse runs in `inMachineParseTurn()` and waits up to **60 seconds**.

A wait that runs out never blocks the parse — the host parses anyway. Coordination is an
optimization, never a correctness requirement. Parse-lock holders declare
`stallMs` = 3 minutes and `maxHoldMs` = 45 minutes, so a hung holder is taken over in minutes
instead of holding everyone up for the full wait.

The VS Code refresh-leader lock declares `stallMs` = 5 minutes and `maxHoldMs` = 60 minutes. The
parse's per-file progress callback (`buildProgressCallback()` → `noteRefreshProgress()`) feeds
`progressAt`, so a leader that is alive but stuck is taken over by another window.

### 3. Snapshots stay per host; peers *read* compatible ones

After its wait, a VS Code leader merges compatible peer snapshots, read-only. Each VS Code leader
advertises its snapshot in `~/.copilot-token-tracker/locks/peer-<hostId>.json`. A peer's snapshot
is merged only when its format string matches exactly: snapshot schema, parse-cache version and
cache identity (`prod` never reads `dev`). The merge uses the same newest-mtime and tombstone
rules as the edition's own snapshot. A peer snapshot no newer than this edition's last Clear
Cache is skipped, so a clear is not undone by pre-clear data.

The result for stable + Insiders on the same build: whichever parses second finds the first's
entries as cache hits and parses only what changed since.

## Trade-off: why not one shared cache

A single shared cache file for all hosts was considered and rejected for now:

- **Different shapes.** The VS Code snapshot holds `SessionFileCache` entries with per-window
  tombstones and a durable clear epoch. The desktop/CLI cache holds CLI `SessionData` under its
  own `CACHE_VERSION`. Converting one into the other is a parser-output mapping that would have
  to stay in lockstep with both.
- **Different writers.** The VS Code snapshot's merge-on-write, tombstone and clear-epoch
  semantics assume every writer is a `CacheManager`. A second kind of writer would have to
  honour all of them or risk resurrecting deleted entries or undoing a Clear Cache.
- **Version skew.** Stable and Insiders often run different extension builds. Per-host files
  degrade cleanly: a mismatched peer is simply ignored, not overwritten with an incompatible
  shape.

Consequences:

- **The desktop app gains the serialization, not the reuse.** Its parse no longer competes for
  CPU and disk with a VS Code parse, but it still fills its own `cli-cache.json`, and VS Code
  cannot use that cache either.
- **VS Code stable and Insiders gain both,** as long as their parse-cache versions match.

A shared, host-neutral cache (for example `SessionData` keyed by path, mtime and size, written
under this same machine lock) is the follow-up if the desktop's duplicate parse still matters.

## Testing

- `src/test/fileLock.test.ts` covers the primitive and the machine lock with temp dirs: stale
  lock, dead pid, corrupt lock, hung leader takeover, max hold, owner-only renew/release, two
  hosts racing on a free lock and on a stale one, bounded waits, the desktop parse turn, and the
  peer registry.
- `vscode-extension/test/unit/cacheManager-crossHost.test.ts` covers two editions sharing one
  lock dir: peer reuse, version mismatch, Clear Cache, waiting, and progress-aware renewal.

`CacheManager` coordinates across hosts only when `deps.machineLockDir` is set. The extension
sets it; tests do not, so they never touch the real `~/.copilot-token-tracker`.
