// Types shared by the Badge setup panel (host) and its webview bundle. No `vscode` imports.
import type { BadgeTheme } from '../../../src/badgePayload';

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
	/** Colours cached from the last time the panel was open; the webview re-probes them live. */
	theme: BadgeTheme;
	/** Link ids only; the URLs live in the host so the webview can only ask for known pages. */
	links: BadgeLinkId[];
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
	| { command: 'badgeInstallResult'; result: BadgeInstallResult };
