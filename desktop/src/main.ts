import { app, BrowserWindow, Tray, Menu, ipcMain, nativeTheme, protocol, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { autoUpdater } from 'electron-updater';
import {
    discoverSessionFiles,
    calculateDetailedStats,
    calculateDailyStats,
    calculateUsageAnalysisStats,
    buildChartPayload,
    getDiagnosticPaths,
    loadCache,
    saveCache,
} from '../../cli/src/helpers';
import type { DetailedStats, UsageAnalysisStats } from '../../vscode-extension/src/types';
import {
    calculateMaturityScores,
    getFluencyLevelData,
} from '../../vscode-extension/src/maturityScoring';
import { getToolFamilies } from '../../vscode-extension/src/toolFamilies';

// JSON config data embedded into every panel HTML (mirrors extension's getJsonConfigScript)
import tokenEstimatorsData from '../../vscode-extension/src/tokenEstimators.json';
import modelPricingData from '../../vscode-extension/src/modelPricing.json';
import toolNamesData from '../../vscode-extension/src/toolNames.json';
import automaticToolsData from '../../vscode-extension/src/automaticTools.json';

// In dev mode use a local userData directory so cache files never conflict
// between hot-reload restarts (the default %APPDATA%\Electron is shared with
// all Electron dev apps and gets locked by the dying old process).
if (!app.isPackaged) {
    app.setPath('userData', path.join(__dirname, '..', '.dev-profile'));
}

// Register the app:// scheme as privileged BEFORE app is ready
protocol.registerSchemesAsPrivileged([
    {
        scheme: 'app',
        privileges: { secure: true, standard: true, supportFetchAPI: true, corsEnabled: false },
    },
]);

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

type PanelId = 'details' | 'environmental' | 'chart' | 'usage' | 'diagnostics' | 'maturity' | 'fluency-level-viewer';

// Mirrors build.appId in package.json. Used as the Windows AppUserModelID so the
// OS associates the taskbar button (and its icon) with this app rather than the
// generic electron.exe identity it would otherwise inherit when run unpackaged.
const APP_ID = 'com.rajbos.ai-engineering-fluency';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let currentPanel: PanelId = 'details';
let cachedStats: DetailedStats | null = null;
let cachedSessionFiles: string[] | null = null;
let cachedUsageStats: UsageAnalysisStats | null = null;
let isRefreshing = false;

// ---------------------------------------------------------------------------
// Static asset path
// ---------------------------------------------------------------------------

/** Directory from which the IIFE webview bundles are served. */
function getWebviewDir(): string {
    return path.join(__dirname, 'webview');
}

/** Resolve the app icon, preferring the dist-bundled icon then falling back to source assets. */
function resolveAppIcon(): string {
    const candidates = [
        // Bundled into dist/ by esbuild — the only path that exists in a packaged build.
        path.join(__dirname, 'tray-icon.png'),
        // Dev fallbacks: the generated source asset, then the extension's robot icon.
        path.join(__dirname, '..', 'assets', 'tray-icon.png'),
        path.join(__dirname, '..', '..', 'vscode-extension', 'media', 'robot-icon.png'),
    ];
    return candidates.find(fs.existsSync) ?? candidates[candidates.length - 1];
}

// ---------------------------------------------------------------------------
// VS Code CSS variable seed
// Provides concrete values for --vscode-* custom properties so the existing
// webview IIFE bundles render correctly outside of VS Code.
// ---------------------------------------------------------------------------

const VSCODE_DARK_VARS = `
:root {
    --vscode-editor-background: #1e1e1e;
    --vscode-sideBar-background: #252526;
    --vscode-editorWidget-background: #252526;
    --vscode-editor-foreground: #d4d4d4;
    --vscode-descriptionForeground: #717171;
    --vscode-disabledForeground: #585858;
    --vscode-panel-border: #454545;
    --vscode-widget-border: #454545;
    --vscode-button-background: #0e639c;
    --vscode-button-foreground: #ffffff;
    --vscode-button-hoverBackground: #1177bb;
    --vscode-button-secondaryBackground: #3a3d41;
    --vscode-button-secondaryForeground: #cccccc;
    --vscode-button-secondaryHoverBackground: #45494e;
    --vscode-input-background: #3c3c3c;
    --vscode-input-foreground: #cccccc;
    --vscode-input-border: #3c3c3c;
    --vscode-list-hoverBackground: #2a2d2e;
    --vscode-list-activeSelectionBackground: #094771;
    --vscode-list-activeSelectionForeground: #ffffff;
    --vscode-list-inactiveSelectionBackground: #37373d;
    --vscode-badge-background: #4d4d4d;
    --vscode-badge-foreground: #cccccc;
    --vscode-focusBorder: #007fd4;
    --vscode-textLink-foreground: #3794ff;
    --vscode-textLink-activeForeground: #3794ff;
    --vscode-errorForeground: #f48771;
    --vscode-editorWarning-foreground: #cca700;
    --vscode-terminal-ansiGreen: #4ec94c;
    --vscode-contrastBorder: #6fc3df;
}
`;

const VSCODE_LIGHT_VARS = `
@media (prefers-color-scheme: light) {
    :root {
        --vscode-editor-background: #ffffff;
        --vscode-sideBar-background: #f3f3f3;
        --vscode-editorWidget-background: #f3f3f3;
        --vscode-editor-foreground: #000000;
        --vscode-descriptionForeground: #717171;
        --vscode-disabledForeground: #717171;
        --vscode-panel-border: #e7e7e7;
        --vscode-widget-border: #c8c8c8;
        --vscode-button-background: #007acc;
        --vscode-button-foreground: #ffffff;
        --vscode-button-hoverBackground: #0062a3;
        --vscode-button-secondaryBackground: #5f6a79;
        --vscode-button-secondaryForeground: #ffffff;
        --vscode-button-secondaryHoverBackground: #4c5561;
        --vscode-input-background: #ffffff;
        --vscode-input-foreground: #616161;
        --vscode-input-border: #cecece;
        --vscode-list-hoverBackground: #e8e8e8;
        --vscode-list-activeSelectionBackground: #0060c0;
        --vscode-list-activeSelectionForeground: #ffffff;
        --vscode-list-inactiveSelectionBackground: #e4e6f1;
        --vscode-badge-background: #c4c4c4;
        --vscode-badge-foreground: #333333;
        --vscode-focusBorder: #0090f1;
        --vscode-textLink-foreground: #006ab1;
        --vscode-textLink-activeForeground: #006ab1;
        --vscode-errorForeground: #a1260d;
        --vscode-editorWarning-foreground: #b89500;
        --vscode-terminal-ansiGreen: #00bc00;
        --vscode-contrastBorder: #6fc3df;
    }
}
`;

const BASE_BODY_STYLE = `
body {
    margin: 0;
    padding: 0;
    background-color: var(--vscode-editor-background);
    color: var(--vscode-editor-foreground);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 13px;
}
`;

// ---------------------------------------------------------------------------
// Stats loading
// ---------------------------------------------------------------------------

async function getSessionFiles(): Promise<string[]> {
    if (!cachedSessionFiles) {
        cachedSessionFiles = await discoverSessionFiles();
    }
    return cachedSessionFiles;
}

async function getStats(): Promise<DetailedStats> {
    if (!cachedStats) {
        const files = await getSessionFiles();
        cachedStats = await calculateDetailedStats(files);
    }
    return cachedStats;
}

async function getUsageStats(): Promise<UsageAnalysisStats> {
    if (!cachedUsageStats) {
        const files = await getSessionFiles();
        cachedUsageStats = await calculateUsageAnalysisStats(files);
    }
    return cachedUsageStats;
}

async function refreshStats(): Promise<void> {
    if (isRefreshing) { return; }
    isRefreshing = true;
    try {
        cachedSessionFiles = await discoverSessionFiles();
        cachedStats = await calculateDetailedStats(cachedSessionFiles);
        cachedUsageStats = null; // reset so it recomputes on next access
        await saveCache();
    } finally {
        isRefreshing = false;
    }
}

// ---------------------------------------------------------------------------
// HTML generation (mirrors VS Code extension's getDetailsHtml / getEnvironmentalHtml)
// ---------------------------------------------------------------------------

const JSON_CONFIG_SCRIPT = [
    `window.__TOKEN_ESTIMATORS__=${JSON.stringify(tokenEstimatorsData).replace(/</g, '\\u003c')};`,
    `window.__MODEL_PRICING__=${JSON.stringify(modelPricingData).replace(/</g, '\\u003c')};`,
    `window.__TOOL_NAMES__=${JSON.stringify(toolNamesData).replace(/</g, '\\u003c')};`,
    `window.__AUTOMATIC_TOOLS__=${JSON.stringify(automaticToolsData).replace(/</g, '\\u003c')};`,
    `window.__EXTENSION_POINT_BUTTONS__=[];`,
].join('');

async function buildPanelHtml(panel: PanelId): Promise<string> {
    const isDark = nativeTheme.shouldUseDarkColors;
    const themeKind = isDark ? 'vscode-dark' : 'vscode-light';

    let initialDataScript = '';
    let scriptFile = `${panel}.js`;
    let title = 'AI Engineering Fluency';

    if (panel === 'details' || panel === 'environmental') {
        const stats = await getStats();
        const windowKey = panel === 'details' ? '__INITIAL_DETAILS__' : '__INITIAL_ENVIRONMENTAL__';
        title = panel === 'details' ? 'AI Engineering Fluency' : 'Environmental Impact';
        const dataWithMeta = {
            ...stats,
            backendConfigured: false,
            compactNumbers: false,
            ...(panel === 'details' ? {
                sortSettings: {
                    editor: { key: 'name', dir: 'asc' },
                    model: { key: 'name', dir: 'asc' },
                    modelOtherExpanded: false,
                },
            } : {}),
        };
        initialDataScript = `window.${windowKey}=${JSON.stringify(dataWithMeta).replace(/</g, '\\u003c')};`;

    } else if (panel === 'chart') {
        title = 'Token Usage Chart';
        const files = await getSessionFiles();
        const { labels, days, allDaysMap } = await calculateDailyStats(files);
        const chartPayload = buildChartPayload(labels, days, allDaysMap);
        const chartData = {
            ...chartPayload,
            initialPeriod: 'day',
            initialView: 'total',
            initialMetric: 'tokens',
            initialSplit: 'total',
            monthlyBudget: 0,
        };
        initialDataScript = `window.__INITIAL_CHART__=${JSON.stringify(chartData).replace(/</g, '\\u003c')};`;

    } else if (panel === 'usage') {
        title = 'Usage Analysis';
        const usageStats = await getUsageStats();
        const locale = Intl.DateTimeFormat().resolvedOptions().locale;
        const usageData = {
            today: usageStats.today,
            last30Days: usageStats.last30Days,
            month: usageStats.month,
            lastMonth: usageStats.lastMonth,
            locale,
            customizationMatrix: null,
            missedPotential: [],
            lastUpdated: usageStats.lastUpdated.toISOString(),
            backendConfigured: false,
            currentWorkspacePaths: [],
            suppressedUnknownTools: [],
            todaySessions: usageStats.todaySessions || [],
            use24HourTime: false,
            insights: [],
            curationAnalysis: null,
        };
        initialDataScript = `window.__INITIAL_USAGE__=${JSON.stringify(usageData).replace(/</g, '\\u003c')};`;

    } else if (panel === 'diagnostics') {
        title = 'Diagnostics';
        const files = await getSessionFiles();
        const diagnosticPaths = getDiagnosticPaths();
        const sessionFiles = await Promise.all(files.map(async (f) => {
            try {
                const s = await fs.promises.stat(f);
                return { file: f, size: s.size, modified: s.mtime.toISOString() };
            } catch {
                return { file: f, size: 0, modified: new Date().toISOString() };
            }
        }));
        const toolFamilies = getToolFamilies();
        const diagData = {
            report: `AI Engineering Fluency — Desktop Diagnostic Report\n${'='.repeat(50)}\n\nSession files found: ${files.length}\nTimestamp: ${new Date().toISOString()}`,
            sessionFiles,
            detailedSessionFiles: sessionFiles.map(f => ({ ...f, interactions: 0, tokens: undefined })),
            sessionFolders: [],
            cacheInfo: { size: 0, sizeInMB: 0, lastUpdated: null, location: 'Desktop (in-memory)', storagePath: null },
            backendStorageInfo: null,
            backendConfigured: false,
            isDebugMode: false,
            globalStateCounters: { openCount: 0, unknownMcpOpenCount: 0, fluencyBannerDismissed: false, unknownMcpDismissedVersion: '' },
            displaySettings: { showTokens: true, showCost: true, monthlyBudget: 0 },
            quotaEntitlements: null,
            toolCallStats: null,
            toolFamilies,
            diagnosticPaths,
        };
        initialDataScript = `window.__INITIAL_DIAGNOSTICS__=${JSON.stringify(diagData).replace(/</g, '\\u003c')};`;

    } else if (panel === 'maturity') {
        title = 'AI Engineering Fluency Score';
        const maturityData = await calculateMaturityScores(
            undefined,
            () => getUsageStats()
        );
        const maturityWithMeta = { ...maturityData, backendConfigured: false, dismissedTips: [], isDebugMode: false };
        initialDataScript = `window.__INITIAL_MATURITY__=${JSON.stringify(maturityWithMeta).replace(/</g, '\\u003c')};`;

    } else if (panel === 'fluency-level-viewer') {
        title = 'Scoring Guide';
        scriptFile = 'fluency-level-viewer.js';
        const fluencyData = { ...getFluencyLevelData(false), backendConfigured: false };
        initialDataScript = `window.__INITIAL_FLUENCY_LEVEL_DATA__=${JSON.stringify(fluencyData).replace(/</g, '\\u003c')};`;
    }

    // Set data-vscode-theme-kind on the body so the existing CSS selectors in theme.css work
    const themeScript = `document.body.setAttribute('data-vscode-theme-kind','${themeKind}');`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline' app://static; img-src data: app://static blob:; font-src app://static data:;" />
    <title>${title}</title>
    <style>${VSCODE_DARK_VARS}${VSCODE_LIGHT_VARS}${BASE_BODY_STYLE}</style>
</head>
<body>
    <div id="root"></div>
    <script>${themeScript}${initialDataScript}${JSON_CONFIG_SCRIPT}</script>
    <script src="app://static/${scriptFile}"></script>
</body>
</html>`;
}

function buildLoadingHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
    <title>AI Engineering Fluency</title>
    <style>
        ${VSCODE_DARK_VARS}${VSCODE_LIGHT_VARS}
        body { margin: 0; background: var(--vscode-editor-background); color: var(--vscode-editor-foreground);
               font-family: -apple-system, 'Segoe UI', sans-serif; display: flex; align-items: center;
               justify-content: center; height: 100vh; }
        .spinner { text-align: center; opacity: 0.7; }
        .spinner h2 { font-weight: 400; font-size: 16px; margin: 0 0 8px; }
        .spinner p  { font-size: 12px; margin: 0; }
    </style>
</head>
<body>
    <div class="spinner">
        <h2>AI Engineering Fluency</h2>
        <p>Loading session data…</p>
    </div>
</body>
</html>`;
}

function buildErrorHtml(panel: string, err: unknown): string {
    const message = err instanceof Error ? (err.stack || err.message) : String(err);
    const escaped = message.replace(/&/g, '&amp;').replace(/</g, '&lt;');
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline';" />
    <title>Error</title>
    <style>
        ${VSCODE_DARK_VARS}${VSCODE_LIGHT_VARS}
        body { margin: 0; padding: 24px; background: var(--vscode-editor-background);
               color: var(--vscode-editor-foreground); font-family: -apple-system, 'Segoe UI', sans-serif; }
        h2 { font-weight: 400; color: var(--vscode-errorForeground); }
        pre { white-space: pre-wrap; font-size: 12px; opacity: 0.8; }
    </style>
</head>
<body>
    <h2>Couldn't load the “${panel}” view</h2>
    <pre>${escaped}</pre>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Protocol handler
// ---------------------------------------------------------------------------

function registerProtocol(): void {
    protocol.handle('app', async (request) => {
        const url = new URL(request.url);

        if (url.host === 'panel') {
            const panel = url.pathname.slice(1) as PanelId;
            try {
                const html = await buildPanelHtml(panel);
                return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
            } catch (err) {
                // Surface failures instead of leaving a blank window.
                console.error(`[panel:${panel}] failed to build:`, err);
                return new Response(buildErrorHtml(panel, err), {
                    status: 500,
                    headers: { 'Content-Type': 'text/html; charset=utf-8' },
                });
            }
        }

        if (url.host === 'static') {
            const filename = url.pathname.slice(1);
            const filePath = path.join(getWebviewDir(), filename);
            try {
                const content = await fs.promises.readFile(filePath);
                const mimeType = filename.endsWith('.js') ? 'text/javascript' : 'application/octet-stream';
                return new Response(content, { headers: { 'Content-Type': mimeType } });
            } catch {
                return new Response('Not Found', { status: 404 });
            }
        }

        return new Response('Not Found', { status: 404 });
    });
}

// ---------------------------------------------------------------------------
// Window management
// ---------------------------------------------------------------------------

function createWindow(): BrowserWindow {
    const win = new BrowserWindow({
        width: 960,
        height: 700,
        minWidth: 600,
        minHeight: 400,
        show: false,
        title: 'AI Engineering Fluency',
        icon: resolveAppIcon(),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false,
        },
    });

    // Show loading state immediately so the window appears quickly
    win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(buildLoadingHtml()));

    win.once('ready-to-show', () => win.show());

    // Prevent navigating away from the app (e.g. if a link is clicked)
    win.webContents.setWindowOpenHandler(({ url }) => {
        shell.openExternal(url);
        return { action: 'deny' };
    });
    win.webContents.on('will-navigate', (event, navUrl) => {
        if (!navUrl.startsWith('app://')) {
            event.preventDefault();
            shell.openExternal(navUrl);
        }
    });

    // Hide to tray on close instead of quitting
    win.on('close', (event) => {
        if (!isQuitting) {
            event.preventDefault();
            win.hide();
        }
    });

    return win;
}

function showPanel(panel: PanelId): void {
    currentPanel = panel;
    if (!mainWindow) { return; }
    mainWindow.loadURL(`app://panel/${panel}`);
    mainWindow.show();
    mainWindow.focus();
}

// ---------------------------------------------------------------------------
// System tray
// ---------------------------------------------------------------------------

function createTray(): Tray {
    const t = new Tray(resolveAppIcon());
    t.setToolTip('AI Engineering Fluency');
    updateTrayMenu(t);

    t.on('double-click', () => showPanel(currentPanel));
    return t;
}

function updateTrayMenu(t: Tray): void {
    const menu = Menu.buildFromTemplate([
        { label: 'Details', click: () => showPanel('details') },
        { label: 'Environmental Impact', click: () => showPanel('environmental') },
        { label: 'Token Usage Chart', click: () => showPanel('chart') },
        { label: 'Usage Analysis', click: () => showPanel('usage') },
        { label: 'Fluency Score', click: () => showPanel('maturity') },
        { label: 'Scoring Guide', click: () => showPanel('fluency-level-viewer') },
        // Diagnostics is hidden for now — its panel renders without the in-app
        // navigation, leaving no way back out.
        { type: 'separator' },
        {
            label: 'Refresh',
            click: async () => {
                await refreshStats();
                if (mainWindow?.isVisible()) {
                    mainWindow.loadURL(`app://panel/${currentPanel}`);
                }
            },
        },
        { type: 'separator' },
        {
            label: 'Launch at startup',
            type: 'checkbox',
            checked: app.getLoginItemSettings().openAtLogin,
            click: (item) => {
                app.setLoginItemSettings({ openAtLogin: item.checked });
                updateTrayMenu(t);
            },
        },
        { type: 'separator' },
        {
            label: 'Quit',
            click: () => {
                isQuitting = true;
                app.quit();
            },
        },
    ]);
    t.setContextMenu(menu);
}

// ---------------------------------------------------------------------------
// IPC — messages from webview panels
// ---------------------------------------------------------------------------

function registerIpcHandlers(): void {
    ipcMain.on('webview-message', async (_event, message: { command: string; [key: string]: unknown }) => {
        switch (message.command) {
            case 'refresh':
                await refreshStats();
                mainWindow?.loadURL(`app://panel/${currentPanel}`);
                break;

            case 'showDetails':
                showPanel('details');
                break;

            case 'showEnvironmental':
                showPanel('environmental');
                break;

            case 'showChart':
                showPanel('chart');
                break;

            case 'showUsageAnalysis':
                showPanel('usage');
                break;

            case 'showDiagnostics':
                // Hidden for now: the Diagnostics panel has no in-app navigation
                // back out, so ignore requests to open it from panel buttons.
                break;

            case 'showMaturity':
            case 'showDashboard':
                showPanel('maturity');
                break;

            case 'showFluencyLevelViewer':
                showPanel('fluency-level-viewer');
                break;

            case 'saveSortSettings':
                // Persist sort preferences — stored in memory for now
                break;

            case 'openFile':
                if (typeof message.path === 'string' && message.path) {
                    shell.openPath(message.path);
                }
                break;

            default:
                break;
        }
    });
}

// ---------------------------------------------------------------------------
// Auto-updater
// ---------------------------------------------------------------------------

function setupAutoUpdater(): void {
    if (!app.isPackaged) { return; }
    autoUpdater.checkForUpdatesAndNotify().catch(() => {});
}

// ---------------------------------------------------------------------------
// Application menu
// ---------------------------------------------------------------------------

/**
 * Build a trimmed-down menu bar. We drop Electron's default Edit menu and the
 * Reload / Force Reload items (this is a read-only data viewer — they only cause
 * confusion), but keep the Zoom controls, which are genuinely useful. Developer
 * tools stay available in unpackaged (dev) builds only.
 */
function buildAppMenu(): Menu {
    const viewSubmenu: Electron.MenuItemConstructorOptions[] = [
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
    ];
    if (!app.isPackaged) {
        viewSubmenu.push({ type: 'separator' }, { role: 'toggleDevTools' });
    }

    return Menu.buildFromTemplate([
        {
            label: 'File',
            submenu: [
                // The window 'close' handler hides to tray, so an explicit Quit
                // must flag a real quit first (same as the tray's Quit item).
                { label: 'Quit', accelerator: 'CmdOrCtrl+Q', click: () => { isQuitting = true; app.quit(); } },
            ],
        },
        { label: 'View', submenu: viewSubmenu },
        { role: 'windowMenu' },
    ]);
}

// ---------------------------------------------------------------------------
// App lifecycle
// ---------------------------------------------------------------------------

let isQuitting = false;

app.whenReady().then(async () => {
    // Set the AppUserModelID early so Windows shows our taskbar icon/identity.
    if (process.platform === 'win32') {
        app.setAppUserModelId(APP_ID);
    }

    registerProtocol();
    registerIpcHandlers();
    Menu.setApplicationMenu(buildAppMenu());

    // Pre-load the cache so the first panel render is fast
    await loadCache();

    mainWindow = createWindow();
    tray = createTray();

    // Warm the caches in the background, showing the loading page meanwhile.
    // Detailed stats power Details/Chart/Environmental; usage stats power Usage
    // Analysis and Fluency Score. Both are expensive (tens of seconds over large
    // histories) and run synchronously, so pre-warm BOTH at startup — otherwise
    // the first open of Usage Analysis / Fluency Score freezes the UI mid-click
    // and looks like the panel never loads.
    getStats().then(() => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.loadURL(`app://panel/${currentPanel}`);
        }
        // Continue warming usage stats so those panels open instantly too.
        return getUsageStats();
    }).catch(() => { /* surfaced per-panel via the error page */ });

    setupAutoUpdater();

    // Listen for system theme changes and reload the current panel
    nativeTheme.on('updated', () => {
        if (mainWindow?.isVisible()) {
            mainWindow.loadURL(`app://panel/${currentPanel}`);
        }
    });
});

app.on('window-all-closed', () => {
    // On Windows, keep the app alive in the tray even when all windows are closed
    if (process.platform !== 'darwin') {
        // Don't quit — the tray keeps it running
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createWindow();
    } else {
        mainWindow.show();
    }
});

app.on('before-quit', async () => {
    await saveCache();
});
