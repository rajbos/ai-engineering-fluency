import { contextBridge, ipcRenderer } from 'electron';

// Expose a VS Code-compatible API shim so the existing IIFE webview bundles
// (compiled with `external: ['vscode']`) can call acquireVsCodeApi() as a global.
// postMessage routes to the Electron main process via IPC.
contextBridge.exposeInMainWorld('acquireVsCodeApi', () => ({
    postMessage: (message: unknown) => {
        ipcRenderer.send('webview-message', message);
    },
    setState: (_state: unknown) => { /* no-op */ },
    getState: () => undefined,
}));

// Bridge main-process loading progress to the page as window messages, matching
// how VS Code webviews receive webview.postMessage — so the shared loading
// screen script (vscode-extension/src/loadingHtml.ts) runs unchanged here.
ipcRenderer.on('loading-message', (_event, message: unknown) => {
    window.postMessage(message, '*');
});
