// Types shared by the Badge setup panel (host) and its webview bundle. No `vscode` imports.
import type { BadgePayload, BadgeRange, BadgeTheme, BadgeThemeSource } from '../../../src/badgePayload';

export type BadgeLinkId = 'badgerHome' | 'tufty' | 'badgeware' | 'badgewareDocs';

export interface BadgeLastSync {
	/** ISO timestamp of the last successful sync. */
	at: string;
	bytes: number;
	port: string;
}

/** Initial payload of the panel (`window.__INITIAL_BADGE_SETUP_DATA__`). */
export interface BadgeSetupData {
	lastSync?: BadgeLastSync;
	/** The app was installed from this view (or the user said it already is); enables Sync. */
	appInstalled?: boolean;
	/** Editor theme colours cached from the last time the panel was open; the webview re-probes them live. */
	theme: BadgeTheme;
	/** Which palette a sync sends. Absent means the default, the Universe palette. */
	themeSource?: BadgeThemeSource;
	/** Which history a sync pushes: 30 or 90 days. Absent means the default, 30. */
	range?: BadgeRange;
	/** Link ids only; the URLs live in the host so the webview can only ask for known pages. */
	links: BadgeLinkId[];
	/** Webview URI of the Universe badge photo; absent when the image was not bundled. */
	imageUri?: string;
	localization?: Record<string, string>;
	language?: string;
}

export type BadgeSyncResult =
	| { status: 'ok'; port: string; bytes: number; at: string }
	| { status: 'mpremoteMissing' | 'noBadge' | 'cancelled' }
	| { status: 'failed'; message: string };

export type BadgeInstallResult =
	| { status: 'copied'; target: string }
	| { status: 'noDrive' | 'unavailable' }
	| { status: 'failed'; message: string };

/** Messages the host posts into the webview. */
export type BadgeHostMessage =
	| { command: 'badgeSyncResult'; result: BadgeSyncResult }
	| { command: 'badgeInstallResult'; result: BadgeInstallResult }
	/** The payload the next sync would send, for the chart preview. */
	| { command: 'badgePreview'; payload: BadgePayload };
