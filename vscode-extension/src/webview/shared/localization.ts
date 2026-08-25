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
	'nav.btnEfficiency': 'Efficiency'
};

// Current localization strings, initialized with defaults
let currentLocalization: WebviewLocalization = { ...DEFAULT_LOCALIZATION };

/**
 * Initialize webview localization with strings from the extension.
 * This should be called when the webview receives its initial state/data.
 */
export function initializeWebviewLocalization(localization: Partial<WebviewLocalization>): void {
	currentLocalization = { ...DEFAULT_LOCALIZATION, ...localization } as WebviewLocalization;
}

/**
 * Get a localized string for the webview.
 * Falls back to the default English string if not found.
 */
export function localize(key: string): string {
	return currentLocalization[key] || DEFAULT_LOCALIZATION[key] || key;
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