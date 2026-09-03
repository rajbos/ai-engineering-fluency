# Webview messaging

How data gets from the extension host into a webview panel, which parts are load-bearing, and
the failure modes that look identical from the outside. Read this before changing anything in
`src/webview/shared/messageHandler.ts`, `src/webviewMessageReplay.ts`, or
`src/webview/usage/readiness.ts`.

## The two delivery channels

A panel's content arrives by **two independent paths**, and confusing them has cost real
debugging time:

| Path | Mechanism | Used for |
|---|---|---|
| **Inline bootstrap** | `<script nonce>window.__INITIAL_USAGE__ = {…}</script>` written into the panel HTML by `getUsageAnalysisHtml` | The first paint: stats that are already in memory when the panel opens |
| **Messages** | `panel.webview.postMessage(…)` → `window` `message` event → `registerMessageHandler` | Everything asynchronous: PR stats, cloud agent sessions, progress, `updateStats`, `updateInsights` |

**A rendered dashboard is not proof that messaging works.** The inline bootstrap paints a
complete-looking panel with zero messages delivered. Every asynchronous tab (Repository PRs,
Cloud Agent) then hangs on its "Loading…" placeholder. If you are debugging a stuck panel,
verify the message path explicitly — do not infer it from the fact that the page has content.

Extension-point buttons contributed by companion extensions use the inline path for first paint
(`window.__EXTENSION_POINT_BUTTONS__`), so the trust-check bug never hid a button's *initial*
appearance. Live updates to already-open panels (register/dispose after the panel's HTML was
generated) now travel over the message path too — see [External integrations](#external-integrations).

## Trust model: origin, not source identity

`registerMessageHandler` filters incoming `message` events before handing them to the panel.
The filter **must not** be based on `event.source` identity.

VS Code relays extension-host messages from an internal window object that is:

- not `null`,
- not `window`,
- not `window.parent` or `window.top` — the webview document is the **top** frame, so both of
  those are `window` itself.

A check of the form `source === null || source === window` therefore rejects **every**
extension → webview message. Observed in VS Code Insiders (`1.10x`), on a document whose
`location.href` is `vscode-webview://<id>/index.html?id=…`:

```
{"command":"repoPrStatsLoaded","origin":"vscode-webview://16mh…",
 "sourceNull":false,"sourceIsWindow":false,"sourceIsParent":false,"trusted":false}
```

The real boundary is **`event.origin`**, which VS Code stamps with the webview's own
`vscode-webview://<id>` origin. `isTrustedWebviewMessageSource(source, window, origin)` applies
two rules, in order:

1. Trust a source that is one of this document's own self-references: `null` or `undefined`
   (no source attached), `window`, `parent`, or `top`. In a top-level webview the last three
   are all `window`, so this rule really means "the message did not come from somewhere else".
2. Otherwise the source is an object we cannot identify, so fall back to the origin: trust it
   only when `origin` is present **and** matches one of this document's own origins. An
   unidentified source with no origin is rejected.

Rule 2 is the branch VS Code's own relayed messages take.

Own origins are collected from **both** `location.origin` and the scheme+host parsed out of
`location.href`. `location.origin` alone is not enough: an engine that does not register
`vscode-webview:` as a standard scheme reports the opaque string `"null"` for it, which never
matches the concrete origin on the event. (jsdom does exactly this, so the tests would pass
against a check that is broken in production — and vice versa.)

A same-origin child frame would also satisfy rule 2. That is acceptable because every panel
serves `default-src 'none'` with **no `frame-src`**, so it cannot embed a frame at all.

### Why this holds across hosts

The check never hardcodes `vscode-webview:` or any other scheme — it compares the event's origin
against whatever origin *this document* was served from. So it adapts to whatever the host uses,
and the two rules between them cover both webview topologies:

- **Desktop (and Insiders)**, where the webview document is the *top* frame: `parent`/`top` are
  `window`, VS Code relays from an internal object that matches none of the self-references, and
  the message carries the document's own origin — so rule 2 accepts it. This is the case that
  was broken.
- **A nested host** (VS Code Web / `vscode.dev`, where the webview is an iframe inside a host
  frame on a different origin): the relaying context *is* `parent`, so rule 1 accepts it before
  the origin is ever consulted.

Whichever shape a future host build uses, it has to either come from a frame we can identify as
ourselves or carry our own origin. If a host ever manages neither, the failure is no longer
silent — the `message-rejected-untrusted` tripwire below fires with the observed origin.

## Why the failure was invisible

Four separate things all reported success while the panel was dead:

- `webview.postMessage()` resolves `true` — it only means VS Code handed the message to a live
  webview. It says nothing about the page accepting or handling it.
- The host logged `delivered=true, webviewReady=true, panel=#1 visible=true active=true`.
- The panel had content (the inline bootstrap).
- The webview's own `message` listener was registered and working — it just discarded
  everything.

The only thing that would have caught it is an observation taken **inside** the listener, past
the trust check. That is now permanent: a rejected message posts a
`message-rejected-untrusted` trace back to the host, so the drop lands in the Output channel
instead of vanishing. `registerMessageHandler` takes an optional `onUntrustedMessage` callback
for this.

## Readiness and replay

Two mechanisms keep an asynchronous payload from being lost in a race. They solve *different*
problems — neither replaces the other.

### `WebviewMessageReplay` (host side)

Retains the last payload per key and replays it when the webview announces readiness.

> **Delivery is never gated on readiness.** `publish()` always posts, and *additionally*
> retains for replay. An earlier version returned early when the handshake had not arrived,
> which turned a transient race into a permanent hang: one lost `usageWebviewReady` meant the
> payload was never posted at all. If you find yourself adding `if (!ready) return;` to a
> publish path, that is the bug.

### Two-phase readiness (webview side)

The webview announces readiness **twice**, and both are required:

| Reason | When | Why |
|---|---|---|
| `listener-registered` | module evaluation | The listener exists; messages posted from now on will be received |
| `layout-rendered` | end of every `renderLayout()` | The *containers* (`#repos-pr-content`, `#agent-sessions-content`) now exist |

At module-eval time the containers do not exist yet, so a replay triggered by the first
announcement renders into nothing. And because any stats refresh rebuilds the whole root — 
recreating the empty "Loading…" placeholders — `renderLayout()` also calls
`restoreGitHubActivityPanels(...)` to re-apply already-received state. Without that, data
already in hand is visually lost on the next refresh.

A payload that arrives with no container to render into posts a `…​.notRendered` trace, since
"arrived but rendered nothing" is otherwise indistinguishable from "never arrived".

### A registered-but-late listener is still a lost message

The usage panel registers its listener synchronously at module evaluation, before any `await`.
The diagnostics panel (`src/webview/diagnostics/main.ts`) did not: `setupMessageHandlers()` used
to run from *inside* `renderLayout()`, which only runs after `bootstrap()`'s
`await import('@vscode-elements/...')` resolves. The host deliberately posts
`backendStorageInfoLoaded` as early as possible (`sendBackendStorageInfoEarly()`, ahead of the
slower `diagnosticDataLoaded`) specifically to beat this kind of gap — so a real dynamic-import
delay could drop it entirely. The fix is the same rule as the two-phase readiness handshake
above: **register the listener before any async work, not after it.**

A second, compounding bug meant fixing the listener alone was not enough: `renderLayout()`
unconditionally overwrote the module's `currentBackendInfo`/`currentGithubAuth` state from its
own (possibly stale placeholder, e.g. `backendStorageInfo: null` on first open) `data`
parameter — silently clobbering a value already captured by an earlier message. The general
lesson: a later render pass must *merge with*, not *overwrite*, state that an earlier message
already populated — the same class of bug `restoreGitHubActivityPanels(...)` exists to prevent
for the usage panel. See `resolveEarlyBackendState()` and its call site in `renderLayout()`, and
`test/unit/diagnosticsWebviewMessageFlow.test.ts` for a harness that deterministically reproduces
the race (dispatching a message synchronously right after `window.eval(bundle)`, before the
pending dynamic-import microtask resolves).

This particular race was bounded, not a permanent hang: `diagnosticDataLoaded` (sent later, after
the full async chain) resends the same fields and re-applies them once `tab-backend` exists. It
still cost a real "send early" optimization silently, which is why it was worth fixing and
testing even though nothing visibly hung.

## Diagnostics that ship

Kept deliberately quiet — these should produce **no output** on a healthy run:

| Trace | Meaning |
|---|---|
| `message-rejected-untrusted` | The trust check dropped a message. The trust model is broken again. |
| `repoPrStatsLoaded.notRendered` / `agentSessionsLoaded.notRendered` | Payload arrived, no container to render into. |
| `handleExtensionMessage.threw` | The handler threw. Otherwise only visible in webview devtools, which nobody has open. |
| `window.error` / `unhandledRejection` | Uncaught webview errors, forwarded to the Output channel. |

All are bounded by a shared trace budget (20) so a chatty session cannot flood the log. Note
that every trace above fires only on a *failure* — `message-rejected-untrusted` is wired to
`registerMessageHandler`'s `onUntrustedMessage` callback, not to message receipt — so normal
high-frequency updates never consume the budget. If you see the budget exhausted, something is
genuinely wrong. The host also logs unhandled webview commands (`no handler for webview command
'…'`), because a webview posting a command nobody registered looks exactly like a webview
posting nothing.

## Tests

`test/unit/usageWebviewMessageFlow.test.ts` bundles the **real** `src/webview/usage/main.ts`
with esbuild and drives it in jsdom exactly as the host does. This is the only layer that
catches the class of bug described above — the trust check and the readiness handshake are
correct in isolation and only fail in combination with a real host.

The regression case that matters is `postFromHostFrame`, which dispatches a message with an
unidentified `event.source` and the document's own origin — VS Code's actual delivery shape.
Verify any change to the trust model by neutering the fix and confirming these tests fail.

jsdom gotchas when extending the harness:

- `runScripts: 'outside-only'` does not execute inline scripts — assign
  `window.__INITIAL_USAGE__` directly.
- `<vscode-button>` needs an `HTMLElement.prototype.attachInternals` shim (jsdom's lacks
  `setFormValue`).
- `initialData` passed to `renderLayout` is **not** sanitized, so fixtures need fully-populated
  `toolCalls.byTool`, `mcpTools.byServer`/`byTool`, `contextReferences.*` and `modelSwitching`.
- Compiled tests live at `out/vscode-extension/test/unit/`, so `../../../..` from `__dirname`
  is the **vscode-extension** root, not the repo root.

## External integrations

Companion extensions acquire the public API via
`vscode.extensions.getExtension('<id>').exports` (`AiFluencyExtensionApi` in
`src/extensionPoints.ts`) and call `registerButton(...)` to add a navigation button to every
panel's toolbar.

Button *data* reaches an already-open panel through **two** paths now:

- **Inline bootstrap**, for the first paint: `window.__EXTENSION_POINT_BUTTONS__`
  (`extensionPointButtonsScript`), a snapshot taken at HTML-generation time.
- **Messages**, for anything that happens after that: `registerExtensionPointButton` calls
  `broadcastExtensionPointButtons()` on every register/dispose, posting
  `{ command: 'extensionPointButtonsUpdated', buttons }` to every currently open panel.

Button *clicks* still travel webview → host (`extensionPointAction`), the opposite direction,
which was never broken.

`wireExtensionPointButtons` (`src/webview/shared/extensionPoints.ts`) reconciles `.button-row`
against whichever list it was given — id-diffing rather than unconditionally appending — so a
button already on screen from the inline bootstrap is left alone when the same button also
arrives via `extensionPointButtonsUpdated`, and disposing a button removes its element from a
panel that is already open. Without that reconciliation, a companion extension registering (or
disposing) a button after a panel's HTML had already been generated left that panel stale until
it was closed and reopened — this used to be a permanent limitation of the inline-only delivery
path; it is fixed now that host → webview messaging works.

Some panels call `wireExtensionPointButtons` after every render, not just once at bootstrap (the
chart panel does this on every `updateChartData`). `registerMessageHandler` has no
dispose/dedupe of its own, so a naive re-run would add another `window` `message` listener on
every refresh — leaking handlers and processing each future `extensionPointButtonsUpdated`
update once per accumulated listener. `wireExtensionPointButtons` tracks a
`window.__extensionPointButtonsListenerRegistered__` flag on the ambient `window` itself (not a
module-level variable, so a test harness that swaps in a fresh `window` per case still gets a
fresh registration) and only attaches the listener the first time it runs for a given window.

