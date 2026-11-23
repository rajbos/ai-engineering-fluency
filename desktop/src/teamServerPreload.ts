import { contextBridge, ipcRenderer } from 'electron';

// Preload for the Team Server settings window only. It exposes a narrow, typed bridge rather
// than raw ipcRenderer, and is separate from preload.ts so the reused panel bundles never get it.
contextBridge.exposeInMainWorld('teamServer', {
    load: () => ipcRenderer.invoke('team-server:load'),
    save: (settings: unknown) => ipcRenderer.invoke('team-server:save', settings),
    signIn: () => ipcRenderer.invoke('team-server:sign-in'),
    signOut: () => ipcRenderer.invoke('team-server:sign-out'),
    syncNow: () => ipcRenderer.invoke('team-server:sync-now'),
    onStatus: (callback: (status: unknown) => void) => {
        ipcRenderer.on('team-server:status', (_event, status: unknown) => callback(status));
    },
});
