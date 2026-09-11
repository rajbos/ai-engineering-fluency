/**
 * Webview localization support.
 * This module provides localized strings for webview components.
 * The localized strings are passed from the extension when the webview is created.
 */

// Type for localized strings that can be passed to webviews
export interface WebviewLocalization {
	// Navigation button labels
	'nav.btnRefresh': string;
	'nav.btnDetails': string;
	'nav.btnChart': string;
	'nav.btnUsage': string;
	'nav.btnDiagnostics': string;
	'nav.btnMaturity': string;
	'nav.btnDashboard': string;
	'nav.btnLevelViewer': string;
	'nav.btnEnvironmental': string;
	'nav.btnEfficiency': string;

	// Share/export card strings (rendered into the PNG image)
	'share.exportTitle': string;
	'share.exportReportLabel': string;

	// Usage view — context-pressure rows
	'usage.contextPressure.compactedLabel': string;
	'usage.contextPressure.ofCount': string;
	'usage.contextPressure.compactedShare': string;
	'usage.contextPressure.noneCompacted': string;
	'usage.contextPressure.compactedTooltip': string;
	'usage.contextPressure.nearLimitLabel': string;
	'usage.contextPressure.worstFill': string;
	'usage.contextPressure.nearLimitTooltip': string;

	// Add other webview-localizable strings here as needed
	[key: string]: string;
}

// Default English strings (fallback)
const DEFAULT_LOCALIZATION: WebviewLocalization = {
	'nav.btnRefresh': 'Refresh',
	'nav.btnDetails': 'Details',
	'nav.btnChart': 'Chart',
	'nav.btnUsage': 'Usage Analysis',
	'nav.btnDiagnostics': 'Diagnostics',
	'nav.btnMaturity': 'Fluency Score',
	'nav.btnDashboard': 'Team Dashboard',
	'nav.btnLevelViewer': 'Level Viewer',
	'nav.btnEnvironmental': 'Environmental Impact',
	'nav.btnEfficiency': 'Efficiency',
	'share.exportTitle': 'AI Engineering Fluency Score',
	'share.exportReportLabel': 'Report',
	'usage.contextPressure.compactedLabel': '🗜️ Sessions compacted',
	'usage.contextPressure.ofCount': '{0} of {1}',
	'usage.contextPressure.compactedShare': '{0}% of sessions with context data lost earlier turns to automatic compaction',
	'usage.contextPressure.noneCompacted': 'No session ran out of context window in this period',
	'usage.contextPressure.compactedTooltip': 'Sessions where the client automatically compacted or truncated the history at least once, counted per session rather than per compaction event',
	'usage.contextPressure.nearLimitLabel': '⚠️ Sessions near the limit',
	'usage.contextPressure.worstFill': 'Fullest session reached {0}% of its window',
	'usage.contextPressure.nearLimitTooltip': 'Copilot CLI sessions that filled at least {0}% of their context window without compacting — the early-warning band before context starts getting dropped'
};

// Current localization strings, initialized with defaults
let currentLocalization: WebviewLocalization = { ...DEFAULT_LOCALIZATION };

/**
 * Initialize webview localization with strings from the extension.
 * This should be called when the webview receives its initial state/data.
 * Entries whose value equals their key are raw localization keys passed
 * through unresolved (bundle load failure on the extension side) — ignore
 * them so the built-in defaults are used instead of showing raw keys.
 */
export function initializeWebviewLocalization(localization: Partial<WebviewLocalization>): void {
	const resolved: Record<string, string> = {};
	for (const [key, value] of Object.entries(localization)) {
		if (typeof value === 'string' && value !== key) {
			resolved[key] = value;
		}
	}
	currentLocalization = { ...DEFAULT_LOCALIZATION, ...resolved } as WebviewLocalization;
}

/**
 * Get a localized string for the webview.
 * Falls back to the default English string if not found.
 */
export function localize(key: string): string {
	return currentLocalization[key] || DEFAULT_LOCALIZATION[key] || key;
}

/**
 * Localize a string that carries `{0}`, `{1}`, … placeholders, mirroring the
 * formatting `vscode.l10n.t()` and the extension-side `l10n.t()` helper use.
 * Placeholders with no matching argument are left intact rather than replaced
 * with `undefined`, so a short-changed call degrades visibly instead of lying.
 */
export function localizeFormat(key: string, ...args: Array<string | number>): string {
	return localize(key).replace(/\{(\d+)\}/g, (match, index) => {
		const i = Number(index);
		return i < args.length ? String(args[i]) : match;
	});
}

/**
 * Get the current language identifier (e.g., 'en', 'zh-cn')
 * This is set when the webview receives its initial state.
 */
let currentLanguage: string = 'en';

export function setCurrentLanguage(language: string): void {
	currentLanguage = language;
}

export function getCurrentLanguage(): string {
	return currentLanguage;
}

/**
 * Check if the current language is right-to-left (RTL)
 */
export function isRTL(): boolean {
	const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'ps', 'dv', 'yi'];
	return rtlLanguages.some(lang => currentLanguage.startsWith(lang));
}