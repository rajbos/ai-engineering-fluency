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

Extension-point buttons contributed by companion extensions use the inline path too
(`window.__EXTENSION_POINT_BUTTONS__`), so they were never affected by messaging bugs. See
[External integrations](#external-integrations).

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
`vscode-webview://<id>` origin. `isTrustedWebviewMessageSource(source, window, origin)`:

1. accepts a source it can positively identify as this window (`null`/`undefined`/`window`/
   `parent`/`top`), then
2. falls back to requiring `origin` to match one of this document's own origins.

Own origins are collected from **both** `location.origin` and the scheme+host parsed out of
`location.href`. `location.origin` alone is not enough: an engine that does not register
`vscode-webview:` as a standard scheme reports the opaque string `"null"` for it, which never
matches the concrete origin on the event. (jsdom does exactly this, so the tests would pass
against a check that is broken in production — and vice versa.)

A same-origin child frame would also pass this check. That is acceptable because every panel
serves `default-src 'none'` with **no `frame-src`**, so it cannot embed a frame at all. When no
origin is supplied, an unidentifiable source is still rejected outright.

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

## Diagnostics that ship

Kept deliberately quiet — these should produce **no output** on a healthy run:

| Trace | Meaning |
|---|---|
| `message-rejected-untrusted` | The trust check dropped a message. The trust model is broken again. |
| `repoPrStatsLoaded.notRendered` / `agentSessionsLoaded.notRendered` | Payload arrived, no container to render into. |
| `handleExtensionMessage.threw` | The handler threw. Otherwise only visible in webview devtools, which nobody has open. |
| `window.error` / `unhandledRejection` | Uncaught webview errors, forwarded to the Output channel. |

All are bounded by a shared trace budget so a chatty session cannot flood the log. The host
also logs unhandled webview commands (`no handler for webview command '…'`), because a webview
posting a command nobody registered looks exactly like a webview posting nothing.

## Tests

`test/unit/usageWebviewMessageFlow.test.ts` bundles the **real** `src/webview/usage/main.ts`
with esbuild and drives it in jsdom exactly as the host does. This is the only layer that
catches the class of bug described above — the trust check and the readiness handshake are
correct in isolation and only fail in combination with a real host.

The regression case that matters is `postFromHostFrame`, which dispatches a message with an
unidentifiable `event.source` and the document's own origin — VS Code's actual delivery shape.
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

That contribution does **not** use host → webview messaging:

- Button *data* is injected inline at HTML-generation time via
  `window.__EXTENSION_POINT_BUTTONS__` (`extensionPointButtonsScript`).
- Button *clicks* travel webview → host (`extensionPointAction`), the opposite direction, which
  was never broken.

So companion buttons kept working throughout, and the messaging fix does not change their
behaviour. The one real constraint is a consequence of the inline path:

> **A button only appears in panels whose HTML was generated after `registerButton` was
> called.** `registerExtensionPointButton` mutates the map but does not refresh open panels.

In practice a companion extension must register during `activate()`, before the user opens a
panel. Registering later — or disposing a button — leaves already-open panels stale until they
are regenerated. Now that host → webview messaging actually works, pushing button updates to
open panels has become possible; it is not implemented.
