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

	// Usage view — Recent Sessions context-fill column and its filter pill
	'usage.sessions.contextFill.columnLabel': string;
	'usage.sessions.contextFill.nearLimitFilter': string;
	'usage.sessions.contextFill.nearLimitFilterTooltip': string;
	'usage.sessions.contextFill.used': string;
	'usage.sessions.contextFill.usedNearLimit': string;
	'usage.sessions.contextFill.noData': string;

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

	// Efficiency view — Cost Attribution bars and summary cards
	'efficiency.attribution.costEffect': string;
	'efficiency.attribution.costEffectLine': string;
	'efficiency.attribution.change': string;
	'efficiency.attribution.periodSub': string;
	'efficiency.attribution.blendedRate': string;
	'efficiency.attribution.tooltip.volume': string;
	'efficiency.attribution.tooltip.size': string;
	'efficiency.attribution.tooltip.mix': string;

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

	// Efficiency view — Models tab empty states
	'efficiency.models.noPairInWindow': string;
	'efficiency.models.noModelsInWindow': string;
	'efficiency.models.noSharedModel': string;
	'efficiency.models.noSecondModel': string;
	'efficiency.models.controls.mode': string;
	'efficiency.models.controls.modelA': string;
	'efficiency.models.controls.modelB': string;
	'efficiency.models.controls.model': string;
	'efficiency.models.controls.baseline': string;
	'efficiency.models.controls.comparedWith': string;
	'efficiency.models.controls.window': string;
	'efficiency.models.mode.models': string;
	'efficiency.models.mode.periods': string;

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
	'usage.sessions.contextFill.columnLabel': 'Context',
	'usage.sessions.contextFill.nearLimitFilter': '🧠 Near context limit',
	'usage.sessions.contextFill.nearLimitFilterTooltip': 'Show only sessions that reached at least {0}% of their context window without compacting',
	'usage.sessions.contextFill.used': '{0} of {1} context tokens used',
	'usage.sessions.contextFill.usedNearLimit': '{0} of {1} context tokens used — at or past {2}% of the window',
	'usage.sessions.contextFill.noData': 'No context-window fill recorded for this session (only GitHub Copilot CLI sessions report one)',
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
	'efficiency.attribution.costEffect': 'Estimated cost effect',
	'efficiency.attribution.costEffectLine': 'Estimated cost effect: {0}',
	'efficiency.attribution.change': 'Change',
	'efficiency.attribution.periodSub': '{0} · {1} sessions · {2} tokens',
	'efficiency.attribution.blendedRate': 'blended rate {0} → {1} per M tokens',
	'efficiency.attribution.tooltip.volume': 'Session count: {0} → {1} sessions',
	'efficiency.attribution.tooltip.size': 'Tokens per session: {0} → {1} tokens/session',
	'efficiency.attribution.tooltip.mix': 'Blended price: {0} → {1} per M tokens',
	'logviewer.hydrafusion.cost': 'Cost',
	'logviewer.hydrafusion.costForTurn': 'Cost for this turn',
	'logviewer.hydrafusion.jumpToStepTitle': 'Jump to step #{0} in the Session Steps Overview below',
	'logviewer.hydrafusion.jumpToStepLabel': 'step #{0}',
	'logviewer.hydrafusion.turnDetailIntro': 'Expand a turn to see each leg, what it decided, and what it cost. ● marks the leg whose output you actually received; ✗ marks a leg a judge rejected. The same legs also appear under their step in the Session Steps Overview below.',
	'logviewer.hydrafusion.toggleLegsAriaLabel': 'Toggle HydraFusion legs for step #{0}',
	'logviewer.hydrafusion.showLegsTitle': 'Show the HydraFusion legs behind this step',
	'logviewer.hydrafusion.legsCaptionTotal': '⚡ HydraFusion legs for step #{0} — total',
	'logviewer.hydrafusion.modelChangedTitle': 'Model changed from the previous step',
	'logviewer.hydrafusion.expandStepNote': '⚡ expand a step to see the HydraFusion legs behind it',
	'efficiency.models.noPairInWindow': 'Only one model was used in {0} ({1}), so there is no pair to compare. Pick a wider window, or switch to “One model, two periods”.',
	'efficiency.models.noModelsInWindow': 'No model was used in {0} ({1}). Pick a wider window.',
	'efficiency.models.noSharedModel': 'No model was used in both {0} ({1}) and {2} ({3}), so there is no model to follow across those periods. Pick different periods, or switch to “Compare two models”.',
	'efficiency.models.noSecondModel': '— no second model in this window —',
	'efficiency.models.controls.mode': 'Mode',
	'efficiency.models.controls.modelA': 'Model A',
	'efficiency.models.controls.modelB': 'Model B',
	'efficiency.models.controls.model': 'Model',
	'efficiency.models.controls.baseline': 'Baseline',
	'efficiency.models.controls.comparedWith': 'Compared with',
	'efficiency.models.controls.window': 'Window',
	'efficiency.models.mode.models': 'Compare two models',
	'efficiency.models.mode.periods': 'One model, two periods'
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