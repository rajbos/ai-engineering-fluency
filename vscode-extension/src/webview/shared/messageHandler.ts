/**
 * Registers a typed handler for messages posted to the webview from the extension.
 *
 * Usage:
 *   registerMessageHandler<MyMessageType>(message => {
 *     switch (message.type) { ... }
 *   });
 *
 * Trust model: `event.source` cannot be used as the trust signal. VS Code relays extension-host
 * messages from an internal window object that is neither `null`, nor this window, nor
 * `parent`/`top` (the webview document is the top frame, so those are this window anyway).
 * Comparing identities therefore rejects *every* extension → webview message: `postMessage`
 * still resolves true, the extension logs a successful delivery, and the panel sits on
 * "Loading…" forever with nothing in the Output channel.
 *
 * `event.origin` is the actual boundary, and VS Code stamps relayed messages with the
 * webview's own `vscode-webview://<id>` origin. The implemented rule is, in order:
 *
 *   1. Trust a source that is one of this document's own self-references — `null` or
 *      `undefined` (no source attached), `window`, `parent`, or `top`. In a top-level webview
 *      the last three are all `window`, so this is really "the message did not come from
 *      somewhere else".
 *   2. Otherwise the source is some other object we cannot identify, so fall back to the
 *      origin: trust it only when `origin` is present *and* matches one of this document's
 *      own origins. An unidentified source with no origin is rejected.
 *
 * A same-origin child frame would also satisfy rule 2, but these webviews serve a CSP of
 * `default-src 'none'` with no `frame-src`, so they cannot embed a frame at all.
 */
type MessageHandler<T> = (message: T) => void;

/**
 * The origins this document may legitimately receive messages from. `location.origin` is
 * unreliable on its own: an engine that does not treat `vscode-webview:` as a standard scheme
 * reports the opaque `"null"` for it, which would never match the concrete origin VS Code
 * stamps on the event. Derive the scheme+host from `href` as well so both cases match.
 */
function collectOwnOrigins(currentWindow: Window): string[] {
    const origins: string[] = [];
    const origin = currentWindow.location?.origin;
    if (origin && origin !== 'null') {
        origins.push(origin);
    }
    const href = currentWindow.location?.href;
    const derived = href ? /^[a-z][a-z0-9+.-]*:\/\/[^/?#]*/i.exec(href) : null;
    if (derived && !origins.includes(derived[0])) {
        origins.push(derived[0]);
    }
    return origins;
}

export function isTrustedWebviewMessageSource(
    source: MessageEventSource | null,
    currentWindow: Window,
    origin?: string,
): boolean {
    // Rule 1: a self-reference — no source attached, or this very window.
    if (source === null || source === undefined || source === currentWindow) {
        return true;
    }
    // Still rule 1: in a top-level webview these are `currentWindow`; the comparison only
    // widens trust if this document ever ends up nested.
    if (source === currentWindow.parent || source === currentWindow.top) {
        return true;
    }
    // Rule 2: an unidentified source is trusted only on a matching origin. This is the branch
    // VS Code's own relayed messages take.
    return Boolean(origin) && collectOwnOrigins(currentWindow).includes(origin as string);
}

export function registerMessageHandler<T>(
    handler: MessageHandler<T>,
    onUntrustedMessage?: (event: MessageEvent<T>) => void,
): void {
    window.addEventListener("message", (event: MessageEvent<T>) => {
        if (!isTrustedWebviewMessageSource(event.source, window, event.origin)) {
            // A dropped message is indistinguishable from one that was never sent: the panel
            // just sits on its placeholder forever while the extension logs a successful
            // delivery. Give callers a way to surface the drop instead of failing silently.
            onUntrustedMessage?.(event);
            return;
        }
        handler(event.data);
    });
}
