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
