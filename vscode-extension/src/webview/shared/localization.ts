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

	// Usage view — GitHub activity (Repository PRs / Cloud Agent) freshness banner
	'usage.githubActivity.refreshNow': string;
	'usage.githubActivity.refreshNowTooltip': string;
	'usage.githubActivity.notFetchedTitle': string;
	'usage.githubActivity.notFetchedBody': string;
	'usage.githubActivity.revalidatingTitle': string;
	'usage.githubActivity.revalidatingBody': string;
	'usage.githubActivity.updated': string;
	'usage.githubActivity.unknownNextRefresh': string;
	'usage.githubActivity.cachePolicy': string;
	'usage.githubActivity.partialTitle': string;
	'usage.githubActivity.retryHint': string;
	'usage.githubActivity.partialRepoPrs': string;
	'usage.githubActivity.partialAgentTasks': string;
	'usage.githubActivity.tasksScannedTooltip': string;
	'usage.githubActivity.tasksScannedLabel': string;
	'usage.githubActivity.lowerBoundNote': string;
	'usage.githubActivity.accountTasksIncomplete': string;
	'usage.githubActivity.accountTasksUnavailable': string;
	'usage.githubActivity.accountTasksUnknownReason': string;

	// Details view — collapsible "Usage by Editor" section heading tooltips
	'details.editorSection.show': string;
	'details.editorSection.hide': string;

	// Log viewer summary card labels
	'logviewer.summary.interactions': string;
	'logviewer.summary.editorMode': string;
	'logviewer.summary.estimatedTokens': string;
	'logviewer.summary.actualTokens': string;
	'logviewer.summary.modelTurns': string;
	'logviewer.summary.inputTokens': string;
	'logviewer.summary.outputTokens': string;
	'logviewer.summary.cachedInput': string;
	'logviewer.summary.thinkingTokens': string;
	'logviewer.summary.thinkingEffort': string;
	'logviewer.summary.subAgents': string;
	'logviewer.summary.contextTruncated': string;
	'logviewer.summary.sessionHierarchy': string;
	'logviewer.summary.toolCalls': string;
	'logviewer.summary.mcpTools': string;
	'logviewer.summary.contextRefs': string;
	'logviewer.summary.fileName': string;
	'logviewer.summary.editor': string;
	'logviewer.summary.editorSource': string;
	'logviewer.summary.mcpAndContextRefs': string;
	'logviewer.summary.noModeData': string;
	'logviewer.summary.fileSize': string;
	'logviewer.summary.modified': string;
	'logviewer.summary.timeline': string;
	'logviewer.summary.started': string;
	'logviewer.summary.lastActivity': string;

	// HydraFusion Routing section + Session Steps Overview leg toggle
	'logviewer.hydrafusion.cost': string;
	'logviewer.hydrafusion.costForTurn': string;
	'logviewer.hydrafusion.jumpToStepTitle': string;
	'logviewer.hydrafusion.jumpToStepLabel': string;
	'logviewer.hydrafusion.turnDetailIntro': string;
	'logviewer.hydrafusion.toggleLegsAriaLabel': string;
	'logviewer.hydrafusion.showLegsTitle': string;
	'logviewer.hydrafusion.legsCaptionTotal': string;
	'logviewer.hydrafusion.modelChangedTitle': string;
	'logviewer.hydrafusion.expandStepNote': string;

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
	'usage.contextPressure.nearLimitTooltip': 'Copilot CLI sessions that filled at least {0}% of their context window without compacting — the early-warning band before context starts getting dropped',
	'usage.githubActivity.refreshNow': '🔄 Refresh now',
	'usage.githubActivity.refreshNowTooltip': 'Revalidate the cached GitHub data now instead of waiting for the next hourly refresh',
	'usage.githubActivity.notFetchedTitle': 'Not fetched yet.',
	'usage.githubActivity.notFetchedBody': 'The snapshot is refreshed hourly by whichever VS Code window takes it on — it will appear here once that first refresh completes.',
	'usage.githubActivity.revalidatingTitle': 'Revalidating.',
	'usage.githubActivity.revalidatingBody': 'Showing the cached snapshot from {0} while it is refreshed.',
	'usage.githubActivity.updated': '🕒 Updated {0} · next refresh after {1}.',
	'usage.githubActivity.unknownNextRefresh': 'unknown',
	'usage.githubActivity.cachePolicy': 'Automatically revalidated at most once an hour, by a single VS Code window, to keep GitHub API usage low — Refresh now asks for one straight away.',
	'usage.githubActivity.partialTitle': 'Partial data — the figures below are a lower bound.',
	'usage.githubActivity.retryHint': 'Use Refresh now above to retry — details are in the extension Output channel.',
	'usage.githubActivity.partialRepoPrs': 'At least one repository listing did not complete (an error, a timeout, or the page cap), so some pull requests in the window are not counted.',
	'usage.githubActivity.partialAgentTasks': 'Some tasks were not detailed this pass — the task-detail budget was exhausted, or a task listing did not complete.',
	'usage.githubActivity.tasksScannedTooltip': 'Showing {0} of {1} tasks — the rest could not be counted this pass, so these figures are a lower bound',
	'usage.githubActivity.tasksScannedLabel': '({0}/{1} tasks scanned)',
	'usage.githubActivity.lowerBoundNote': 'Note: some figures could not be counted this pass — a listing did not complete, a detail call failed, or the detail budget ran out — so these totals are lower bounds.',
	'usage.githubActivity.accountTasksIncomplete': 'The account-wide task listing stopped early ({0}) — tasks outside your workspace repositories may be missing.',
	'usage.githubActivity.accountTasksUnavailable': 'Account-wide tasks unavailable ({0}) — only workspace repositories are shown.',
	'usage.githubActivity.accountTasksUnknownReason': 'the /agents/tasks endpoint could not be read',
	'details.editorSection.show': 'Show Usage by Editor',
	'details.editorSection.hide': 'Hide Usage by Editor',
	'logviewer.summary.interactions': 'Interactions',
	'logviewer.summary.editorMode': 'Editor Mode',
	'logviewer.summary.estimatedTokens': 'Estimated Tokens',
	'logviewer.summary.actualTokens': 'Actual Tokens',
	'logviewer.summary.modelTurns': 'Model Turns',
	'logviewer.summary.inputTokens': 'Input Tokens',
	'logviewer.summary.outputTokens': 'Output Tokens',
	'logviewer.summary.cachedInput': 'Cached Input',
	'logviewer.summary.thinkingTokens': 'Thinking Tokens',
	'logviewer.summary.thinkingEffort': 'Thinking Effort',
	'logviewer.summary.subAgents': 'Sub-Agents',
	'logviewer.summary.contextTruncated': 'Context Truncated',
	'logviewer.summary.sessionHierarchy': 'Session Hierarchy',
	'logviewer.summary.toolCalls': 'Tool Calls',
	'logviewer.summary.mcpTools': 'MCP Tools',
	'logviewer.summary.contextRefs': 'Context Refs',
	'logviewer.summary.fileName': 'File Name',
	'logviewer.summary.editor': 'Editor',
	'logviewer.summary.editorSource': 'Source',
	'logviewer.summary.mcpAndContextRefs': 'MCP Tools & Context Refs',
	'logviewer.summary.noModeData': 'No mode data',
	'logviewer.summary.fileSize': 'File Size',
	'logviewer.summary.modified': 'Modified',
	'logviewer.summary.timeline': 'Timeline',
	'logviewer.summary.started': 'Started',
	'logviewer.summary.lastActivity': 'Last activity',
	'logviewer.hydrafusion.cost': 'Cost',
	'logviewer.hydrafusion.costForTurn': 'Cost for this turn',
	'logviewer.hydrafusion.jumpToStepTitle': 'Jump to step #{0} in the Session Steps Overview below',
	'logviewer.hydrafusion.jumpToStepLabel': 'step #{0}',
	'logviewer.hydrafusion.turnDetailIntro': 'Expand a turn to see each leg, what it decided, and what it cost. ● marks the leg whose output you actually received; ✗ marks a leg a judge rejected. The same legs also appear under their step in the Session Steps Overview below.',
	'logviewer.hydrafusion.toggleLegsAriaLabel': 'Toggle HydraFusion legs for step #{0}',
	'logviewer.hydrafusion.showLegsTitle': 'Show the HydraFusion legs behind this step',
	'logviewer.hydrafusion.legsCaptionTotal': '⚡ HydraFusion legs for step #{0} — total',
	'logviewer.hydrafusion.modelChangedTitle': 'Model changed from the previous step',
	'logviewer.hydrafusion.expandStepNote': '⚡ expand a step to see the HydraFusion legs behind it'
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