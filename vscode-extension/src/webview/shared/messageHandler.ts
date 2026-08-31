/**
 * Registers a typed handler for messages posted to the webview from the extension.
 *
 * Usage:
 *   registerMessageHandler<MyMessageType>(message => {
 *     switch (message.type) { ... }
 *   });
 *
 * VS Code delivers extension-host messages with a null `event.source`. Browser
 * messages sent by the webview itself use `window`; messages from child frames
 * have a different, non-null source and are rejected.
 */
type MessageHandler<T> = (message: T) => void;

export function isTrustedWebviewMessageSource(
    source: MessageEventSource | null,
    currentWindow: Window,
): boolean {
    return source === null || source === currentWindow;
}

export function registerMessageHandler<T>(handler: MessageHandler<T>): void {
    window.addEventListener("message", (event: MessageEvent<T>) => {
        if (!isTrustedWebviewMessageSource(event.source, window)) {
            return;
        }
        handler(event.data);
    });
}
