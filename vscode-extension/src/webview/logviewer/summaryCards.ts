// Pure, testable renderers for the log-viewer's top summary-card panel.
// Extracted from main.ts (which has module-load side effects — DOM access,
// dynamic imports — and so cannot itself be imported by unit tests).
import { escapeHtml } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';

/**
 * Renders a top-N list with an "Other: N" row appended when the total exceeds the listed sum.
 * @security All keys are passed through `escapeHtml`.
 */
export function formatTopListWithOther(entries: { key: string; value: number }[], total: number, mapper?: (k: string) => string): string {
	if (!entries.length) { return localize('logviewer.summary.noneShort'); }
	const lines = entries.map(e => `<div>${escapeHtml(mapper ? mapper(e.key) : e.key)}: ${e.value}</div>`);
	const topSum = entries.reduce((sum, e) => sum + e.value, 0);
	const other = total - topSum;
	if (other > 0) {
		lines.push(`<div>${localizeFormat('logviewer.summary.otherCount', other)}</div>`);
	}
	return lines.join('');
}

export type McpAndContextRefsCardStats = {
	usageMcpTotal: number;
	usageTopMcpTools: { key: string; value: number }[];
	usageContextTotal: number;
	usageContextImplicit: number;
	usageContextExplicit: number;
};

/**
 * Combined "MCP tools & context references" card: merges the previous MCP Tools
 * and Context Refs cards into a single compact card, since both describe the
 * external context a session pulled in (tool servers vs. editor references).
 *
 * The sub-text only adds a breakdown line for a metric that has a nonzero
 * count — repeating "MCP Tools: None" under a row that already reads
 * "MCP Tools 0" restates the same zero without adding information, so it is
 * dropped rather than shown twice.
 */
export function buildMcpAndContextRefsCard(stats: McpAndContextRefsCardStats): string {
	const { usageMcpTotal, usageTopMcpTools, usageContextTotal, usageContextImplicit, usageContextExplicit } = stats;
	const subLines: string[] = [];
	if (usageMcpTotal > 0) {
		subLines.push(`<div class="combined-card-sub-line">🔌 ${formatTopListWithOther(usageTopMcpTools, usageMcpTotal)}</div>`);
	}
	if (usageContextTotal > 0) {
		subLines.push(`<div class="combined-card-sub-line">🔗 ${localizeFormat('logviewer.summary.contextRefsBreakdown', usageContextImplicit, usageContextExplicit)}</div>`);
	}
	const subContent = subLines.length > 0 ? subLines.join('') : `<div class="combined-card-sub-line">${localize('logviewer.summary.noneShort')}</div>`;
	return `<div class="summary-card summary-card--compact summary-card--combined">
<div class="summary-label">🔌 ${localize('logviewer.summary.mcpAndContextRefs')}</div>
<div class="summary-compact-rows">
<div class="summary-compact-row"><span class="summary-compact-key">🔌 ${localize('logviewer.summary.mcpTools')}</span><span class="summary-compact-val">${usageMcpTotal}</span></div>
<div class="summary-compact-row"><span class="summary-compact-key">🔗 ${localize('logviewer.summary.contextRefs')}</span><span class="summary-compact-val">${usageContextTotal}</span></div>
</div>
<div class="summary-sub combined-card-sub">${subContent}</div>
</div>`;
}
