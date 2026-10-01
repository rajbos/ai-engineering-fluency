# Session analysis runs on worker threads, not the extension host

**Status:** implemented (VS Code extension). **Applies to:** `vscode-extension/src/analysis/`, `vscode-extension/src/utils/eventLoopMonitor.ts`.

## The problem

A click in a webview panel (navigating to another tab, opening a view) is a `postMessage` that
the extension host can only deliver **between event-loop ticks**. The host has exactly one thread,
and everything that refreshes data used to run on it. Any long synchronous stretch therefore showed
up as "navigation is blocked for tens of seconds".

Yielding with `setImmediate` between files (the earlier fixes, e.g. #2176) only helps when the
stretches are short. It cannot help when a single step is long, and it cannot be enforced: the next
synchronous `readdirSync` added anywhere reintroduces the freeze.

Measured on a real machine (6,876 session files, 687 in the last 30 days, a 9.8 GB Copilot CLI OTel
export), a cold full refresh blocked the host for:

| Cause | Longest single stall |
|---|---|
| Parsing large session files (`JSON.parse`, token estimation, usage analysis) on the host | 6–8 s per burst, tens of seconds in total |
| Recursive **synchronous** `readdir` over every workspace to find customization files | **~90 s** in one stretch (69 s of pure `readdir` self-time) |

After this change the same refresh blocks the host for **< 1 s** at worst, finishes faster, and the
host thread is idle ~90% of the time while it runs.

## The design

```
 extension host (one thread)            analysis worker threads (1–2)
 ───────────────────────────            ─────────────────────────────
 owns: VS Code API, webviews,     ──►   owns: reading files, JSON.parse,
 the cache (CacheManager), state        token estimation, usage analysis,
                                        daily rollups, directory walks
 sends: path + mtime/size               returns: a SessionFileCache entry,
        (+ a small skeleton)                    a details result, or a file list
```

* **`analysis/sessionFileAnalyzer.ts`, `sessionDetailsAnalyzer.ts`, `workspaceCustomizationScan.ts`** — the
  CPU-heavy work as plain, `vscode`-free functions over an explicit `SessionAnalyzerDeps`. The exact same code
  runs on a worker (normal) or in-process (fallback). They never touch the cache; they receive the previous
  entry as data and return the new one.
* **`analysis/analysisWorker.ts`** — the worker entry point, bundled to `dist/analysisWorker.js` by
  `esbuild.js`. It builds its own adapter registry. `vscode` is aliased to a stub that throws, so an accidental
  import of the VS Code API fails loudly instead of at load time.
* **`analysis/analysisWorkerPool.ts`** — the host-side client. Lazily spawns up to
  `min(2, cores − 1)` workers, keeps a pool-side queue, hands each worker at most two requests at a time, and
  treats workers as disposable.
* **`CopilotTokenTracker`** (`extension.ts`) calls the pool from `getSessionFileDataCached`,
  `getSessionFileDetails` and the customization-file resolver, and only does the cache write itself.

### Failure model

`AnalysisWorkerError.kind` decides what the caller may do:

| kind | meaning | host behaviour |
|---|---|---|
| `unavailable` | the worker could not be used (failed before `ready`, pool-wide restart budget spent, pool disposed) | fall back to the in-process analyzer (not once the extension is disposed) |
| `timeout` | the file hung a worker for 3 minutes (worker is killed and respawned) | reject — running it in-process would move the hang onto the host |
| `failed` | the analysis itself threw, or the request killed two workers | reject, **keeping `error.code`** (e.g. `ENOENT`) so existing handling still works |

A worker death re-sends its in-flight requests once on a fresh worker; a request that kills two workers is
rejected as `failed` (it is the likely cause — an out-of-memory kill or native crash — and must not be retried on the
host). The hang watchdog only ever fires for the *oldest* request in a worker: a younger one is waiting behind it, so it
gets a fresh window instead of taking the worker down. More than five deaths in a minute
disables the pool for the session (with a warning) and everything runs in-process, as it did before this change.

### Why a queue and a small in-flight window

A worker can only parse serially. If twenty requests were posted to it and the per-request timeout started
at posting, a perfectly healthy but busy worker would be killed for "hanging" because its twentieth request
waited behind nineteen others. Requests wait in the pool instead, and the timeout starts when a request is
handed to a worker, where it only waits behind one neighbour.

### Serialized usage-analysis runs

`calculateUsageAnalysisStats` resets per-run caches (`_customizationFilesCache`, `_workspaceIdToFolderCache`) at its
start. Scans are now asynchronous, so there are awaits between filling and reading those caches; an overlapping run's
reset in that gap would leave the first run reading an empty cache (every workspace shown as having no customization
files). Runs are therefore serialized through a promise chain.

### Adapter caches inside workers

Each worker builds its own adapter registry, so adapter-internal caches (for example the in-memory SQLite copies)
exist once per worker and are not reachable from the host's `clearCache()`. They are keyed on file stat like their
host counterparts, so a changed file is re-read; a worker restart also drops them.

### Worker `execArgv`

Both `Worker` constructors pass `execArgv: []`. A worker otherwise inherits the host's node flags
(`--inspect`, `--require` hooks, ...), which are meant for that process; in testing, an inherited
`--require` hook with a 30 s self-exit silently killed every worker.

## Keeping it fixed

* **`startEventLoopMonitor`** (`utils/eventLoopMonitor.ts`) samples event-loop delay with Node's built-in
  histogram and logs `Extension host event loop stalled: worst tick N ms ...` to the *AI Engineering Fluency*
  output channel whenever a 2 s window contains a tick over 250 ms. If users report a freeze, this line says
  how long, and when.
* **`test/unit/analysisWorkerEquivalence.test.ts`** builds the real worker bundle and checks that
  (1) its output is identical to the in-process analyzer on the session fixtures, for the analyze, details and
  customization-scan operations, and (2) the host event loop stays free while the worker parses a 15 MB+
  session that takes the host over half a second in-process. Moving parsing back onto the host thread
  fails (2).
* **`test/unit/analysisWorkerPool.test.ts`** covers the pool's crash/timeout/queue/dispose behaviour
  deterministically with a fake worker.

### Rules for new code

1. **Do not add synchronous filesystem walks (`readdirSync`, `statSync` in loops, `execSync`) or large
   `JSON.parse` calls to code that runs during a refresh on the host.** Put the work in `src/analysis/` behind a
   new pool operation, or make it asynchronous *and* yielding.
2. Code in `src/analysis/` must stay free of `vscode`. It may import the shared modules in `src/`; check that a
   module you add does not use the VS Code API on the code path the worker runs.
3. A new pool operation needs: a request/response type in `analysisProtocol.ts`, a branch in
   `analysisWorker.ts`, a method on the pool, and an equivalence test against the in-process function.

## Switching it off

Set `AI_FLUENCY_DISABLE_ANALYSIS_WORKER=1` in the environment of the extension host to run everything
in-process (the previous behaviour). The extension also does this automatically if `dist/analysisWorker.js` is
missing.

## Not changed (and why)

* **Cache snapshot (`CacheManager`) read/merge/write.** It serializes the whole cache on the host. On the
  measured machine (23 MB, 6.7k entries) that is ~0.1 s to parse and ~0.2 s to stringify per checkpoint — not a
  user-visible stall — and moving it would mean reworking its clear-epoch race fences. Revisit if the cache
  grows by an order of magnitude; the lag monitor will show it.
* **Per-worker memory.** Each worker keeps its own in-memory copies of the SQLite stores its adapters read
  (on the measured machine Copilot's `session-store.db` is 85 MB and `data.db` 127 MB), which is why the pool is
  capped at two workers rather than scaled to the core count.
* **Windsurf sessions** stay in-process: they come from a gRPC client that needs the VS Code API.
* **Small remaining host work** (path/editor-label classification per file, a few hundred ms of WAL merge for the
  Copilot CLI database) is each well under a second.
