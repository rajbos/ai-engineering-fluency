import * as fs from 'fs';
import * as os from 'os';
import * as vscode from 'vscode';
import { buildBadgePayload, normalizeBadgeTheme, serializeBadgePayload, type BadgeDayInput, type BadgeMaturityInput, type BadgeTheme } from '../../../src/badgePayload';
import { resolvedLocale, t } from '../l10n';
import { buildWebviewLocalization } from '../webviewLocalization';
import { buildCspMeta, getCodiconStylesheetTag, getNonce } from '../utils/webviewUtils';
import type { FeatureViewId } from '../whatsNew/catalog';
import { runCommand, syncBadge, type CommandRunner } from './badgeSyncService';
import { installBadgeApp } from './badgeInstallService';
import type { BadgeHostMessage, BadgeLastSync, BadgeLinkId, BadgeSetupData } from './badgeSetupTypes';

const PANEL_VIEW_TYPE = 'aiFluencyBadgeSetup';
const THEME_STATE_KEY = 'badge.theme';
const LAST_SYNC_STATE_KEY = 'badge.lastSync';
const BADGE_IMAGE_FILE = 'badge-universe.jpg';

/** The pages the panel may open. The webview only ever sends an id, never a URL. */
const BADGE_LINKS: Record<BadgeLinkId, string> = {
	badgerHome: 'https://github.com/badger/home',
	tufty: 'https://shop.pimoroni.com/products/tufty-2350',
	badgeware: 'https://badgewa.re/',
	badgewareDocs: 'https://github.com/pimoroni/badgeware-docs',
};

/** Navigation commands the shared button row posts, and the view each one opens. */
const NAV_VIEWS: Record<string, FeatureViewId> = {
	showDetails: 'details',
	showChart: 'chart',
	showUsageAnalysis: 'usage',
	showMaturity: 'maturity',
	showEfficiency: 'efficiency',
	showEnvironmental: 'environmental',
	showDiagnostics: 'diagnostics',
	showDashboard: 'dashboard',
};

export interface BadgeSnapshot {
	maturity: BadgeMaturityInput;
	dailyStats: BadgeDayInput[];
}

export interface BadgeSetupDeps {
	context: vscode.ExtensionContext;
	getSnapshot: () => Promise<BadgeSnapshot>;
	openView: (view: FeatureViewId) => Promise<void>;
	log: (message: string) => void;
	/** Hides the Badge button (and so the view) for people who have no badge. */
	hideButton: () => Promise<void>;
	run?: CommandRunner;
}

function isLastSync(value: unknown): value is BadgeLastSync {
	const entry = value as Partial<BadgeLastSync> | undefined;
	return !!entry && typeof entry.at === 'string' && typeof entry.bytes === 'number' && typeof entry.port === 'string';
}

export class BadgeSetupPanel {
	private panel: vscode.WebviewPanel | undefined;
	private syncInFlight = false;

	constructor(private readonly deps: BadgeSetupDeps) {}

	public show(): void {
		if (this.panel) {
			this.panel.reveal(undefined, false);
			return;
		}
		this.deps.log('🎫 Opening Badge setup');
		const extensionUri = this.deps.context.extensionUri;
		const panel = vscode.window.createWebviewPanel(
			PANEL_VIEW_TYPE,
			t('badge.title'),
			{ viewColumn: vscode.ViewColumn.One, preserveFocus: true },
			{
				enableScripts: true,
				retainContextWhenHidden: false,
				localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'dist', 'webview')],
			},
		);
		this.panel = panel;
		panel.webview.html = this.getHtml(panel.webview);
		panel.webview.onDidReceiveMessage((message) => {
			this.handleMessage(message).catch((error) => this.deps.log(`Badge setup message failed: ${error instanceof Error ? error.message : String(error)}`));
		});
		panel.onDidDispose(() => {
			this.panel = undefined;
		});
	}

	public dispose(): void {
		this.panel?.dispose();
	}

	private getCachedTheme(): BadgeTheme {
		return normalizeBadgeTheme(this.deps.context.globalState.get<Record<string, unknown>>(THEME_STATE_KEY));
	}

	private getLastSync(): BadgeLastSync | undefined {
		const stored = this.deps.context.globalState.get<unknown>(LAST_SYNC_STATE_KEY);
		return isLastSync(stored) ? stored : undefined;
	}

	private async handleMessage(message: { command?: unknown; [key: string]: unknown } | undefined): Promise<void> {
		const command = typeof message?.command === 'string' ? message.command : '';
		const handlers: Record<string, () => unknown> = {
			badgeSyncUsb: () => this.syncUsb(),
			badgeInstallApp: () => this.installApp(),
			badgeTheme: () => this.deps.context.globalState.update(THEME_STATE_KEY, normalizeBadgeTheme(message?.theme as Record<string, unknown> | undefined)),
			badgeHideButton: () => this.deps.hideButton(),
			badgeOpenLink: () => this.openLink(message?.id),
			refresh: () => this.rerender(),
		};
		if (Object.prototype.hasOwnProperty.call(handlers, command)) {
			await handlers[command]();
			return;
		}
		const view = Object.prototype.hasOwnProperty.call(NAV_VIEWS, command) ? NAV_VIEWS[command] : undefined;
		if (view) { await this.deps.openView(view); }
	}

	private async openLink(id: unknown): Promise<void> {
		if (typeof id !== 'string' || !Object.prototype.hasOwnProperty.call(BADGE_LINKS, id)) { return; }
		await vscode.env.openExternal(vscode.Uri.parse(BADGE_LINKS[id as BadgeLinkId]));
	}

	private rerender(): void {
		if (this.panel) { this.panel.webview.html = this.getHtml(this.panel.webview); }
	}

	private post(message: BadgeHostMessage): void {
		void this.panel?.webview.postMessage(message);
	}

	private async syncUsb(): Promise<void> {
		if (this.syncInFlight) { return; }
		this.syncInFlight = true;
		try {
			const result = await syncBadge({
				run: this.deps.run ?? runCommand,
				buildPayload: async () => {
					const snapshot = await this.deps.getSnapshot();
					return serializeBadgePayload(buildBadgePayload({ ...snapshot, theme: this.getCachedTheme(), now: new Date() }));
				},
				pickPort: (ports) => Promise.resolve(vscode.window.showQuickPick(ports, { placeHolder: t('badge.sync.pickPort') })),
			});
			if (result.status === 'ok') {
				await this.deps.context.globalState.update(LAST_SYNC_STATE_KEY, { at: result.at, bytes: result.bytes, port: result.port } satisfies BadgeLastSync);
			} else if (result.status === 'failed') {
				this.deps.log(`Badge sync failed: ${result.message}`);
			}
			this.post({ command: 'badgeSyncResult', result });
		} finally {
			this.syncInFlight = false;
		}
	}

	private async installApp(): Promise<void> {
		const folder = vscode.Uri.joinPath(this.deps.context.extensionUri, 'dist', 'badge-app', 'fluency');
		const outcome = await installBadgeApp({
			sourceDir: folder.fsPath,
			platform: process.platform,
			run: this.deps.run ?? runCommand,
			userName: os.userInfo().username,
			exists: fs.existsSync,
		});
		if (outcome.status === 'copied') {
			this.post({ command: 'badgeInstallResult', result: { status: 'copied', target: outcome.target } });
		} else if (outcome.status === 'noDrive') {
			// Without the drive the user still needs the folder, so show it for a manual copy.
			await vscode.commands.executeCommand('revealFileInOS', folder);
			this.post({ command: 'badgeInstallResult', result: { status: 'noDrive' } });
		} else if (outcome.status === 'sourceMissing') {
			this.post({ command: 'badgeInstallResult', result: { status: 'unavailable' } });
		} else {
			this.deps.log(`Badge app install failed: ${outcome.message}`);
			this.post({ command: 'badgeInstallResult', result: { status: 'failed', message: outcome.message } });
		}
	}

	/** The Universe badge photo, shipped in `dist/webview` when the build found it in `media/`. */
	private getImageUri(webview: vscode.Webview): string | undefined {
		const file = vscode.Uri.joinPath(this.deps.context.extensionUri, 'dist', 'webview', BADGE_IMAGE_FILE);
		return fs.existsSync(file.fsPath) ? webview.asWebviewUri(file).toString() : undefined;
	}

	private getHtml(webview: vscode.Webview): string {
		const extensionUri = this.deps.context.extensionUri;
		const nonce = getNonce();
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'dist', 'webview', 'badge-setup.js'));
		const language = resolvedLocale(vscode.env.language);
		const data: BadgeSetupData = {
			lastSync: this.getLastSync(),
			theme: this.getCachedTheme(),
			links: Object.keys(BADGE_LINKS) as BadgeLinkId[],
			imageUri: this.getImageUri(webview),
			localization: { ...buildWebviewLocalization(t), '__language__': language },
			language,
		};
		const initialData = JSON.stringify(data).replace(/</g, '\\u003c');
		return `<!DOCTYPE html>
	<html lang="${language}">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		${buildCspMeta(webview, nonce)}
		${getCodiconStylesheetTag(webview, extensionUri)}
		<title>${t('badge.title')}</title>
	</head>
	<body>
		<div id="root"></div>
		<script nonce="${nonce}">window.__INITIAL_BADGE_SETUP_DATA__ = ${initialData};</script>
		<script nonce="${nonce}" src="${scriptUri}"></script>
	</body>
	</html>`;
	}
}
