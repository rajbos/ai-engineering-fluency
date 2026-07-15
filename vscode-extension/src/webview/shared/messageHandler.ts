/**
 * Registers a typed handler for messages posted to the webview from the extension.
 *
 * Usage:
 *   registerMessageHandler<MyMessageType>(message => {
 *     switch (message.type) { ... }
 *   });
 */
type MessageHandler<T> = (message: T) => void;

export function registerMessageHandler<T>(handler: MessageHandler<T>): void {
    window.addEventListener("message", (event: MessageEvent<T>) => {
        handler(event.data);
    });
}
