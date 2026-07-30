/**
 * Registers a typed handler for messages posted to the webview from the extension.
 *
 * Usage:
 *   registerMessageHandler<MyMessageType>(message => {
 *     switch (message.type) { ... }
 *   });
 *
 * VS Code webviews load content from a `vscode-webview://` origin and only the
 * extension host (via `webview.postMessage`) can post to `window` from that
 * context, but we still verify `event.source === window` so a handler never
 * acts on a message that was somehow posted by embedded/child content (e.g. an
 * iframe) rather than the top-level webview window itself.
 */
type MessageHandler<T> = (message: T) => void;

export function registerMessageHandler<T>(handler: MessageHandler<T>): void {
    window.addEventListener("message", (event: MessageEvent<T>) => {
        if (event.source !== window) {
            return;
        }
        handler(event.data);
    });
}
