/**
 * "Output tokens by tool family" section for Usage Analysis › Tools & Integrations:
 * one table per family comparing alternatives with the family's built-in tools.
 * A pure string builder, like toolExecutionHtml.ts. The numbers come from
 * `buildToolFamilyGroups()`, whose divisor is shared with the cost-vs-speed map.
 */
import { renderDataTable, type DataTableColumn } from '../shared/dataTable';
import { escapeHtml, formatCompact, formatNumber } from '../shared/formatUtils';
import { localize } from '../shared/localization';
import type { ToolCallUsage } from '../shared/types';
import { buildToolFamilyGroups, type ToolFamily, type ToolFamilyRow } from '../../../../src/toolFamilies';
import { emptyHtml, isReportableTool, sectionHtml } from './toolExecutionHtml';

export interface ToolFamilySectionInput {
	toolCalls: ToolCallUsage;
	families: readonly ToolFamily[];
	/** Tool id → display name (the usage view's `lookupToolName`). */
	resolveToolName: (id: string) => string;
	/** Tool ids to leave out, e.g. automatic tool calls when the user hides them. */
	hiddenTools?: ReadonlySet<string>;
}

/** Keeps only well-formed families from the untrusted payload. */
export function sanitizeToolFamilies(raw: unknown): ToolFamily[] {
	if (!Array.isArray(raw)) { return []; }
	const names = (value: unknown): string[] => Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
	return raw
		.filter((f): f is Record<string, unknown> => !!f && typeof f === 'object' && typeof f.id === 'string' && typeof f.name === 'string')
		.map((f) => ({
			id: f.id as string,
			name: f.name as string,
			builtIn: names(f.builtIn),
			alternatives: names(f.alternatives),
			...(typeof f.description === 'string' ? { description: f.description } : {}),
		}));
}

function ratioClass(row: ToolFamilyRow): string | undefined {
	if (row.isBuiltIn) { return 'tool-builtin-label'; }
	if (row.vsBuiltIn === null) { return undefined; }
	if (row.vsBuiltIn < 0.85) { return 'ratio-better'; }
	return row.vsBuiltIn > 1.15 ? 'ratio-worse' : 'ratio-neutral';
}

function ratioCell(row: ToolFamilyRow): string {
	if (row.isBuiltIn) { return escapeHtml(localize('usage.toolExec.families.baseline')); }
	if (row.vsBuiltIn === null) { return '—'; }
	return `${Math.round(row.vsBuiltIn * 100)}%`;
}

function familyColumns(resolveToolName: (id: string) => string, showBadges: boolean): DataTableColumn<ToolFamilyRow>[] {
	const badge = (row: ToolFamilyRow): string => {
		if (!showBadges) { return ''; }
		return row.isBuiltIn
			? ` <span class="tool-type-badge built-in">${escapeHtml(localize('usage.toolExec.families.builtIn'))}</span>`
			: ` <span class="tool-type-badge alternative">${escapeHtml(localize('usage.toolExec.families.alternative'))}</span>`;
	};
	return [
		{
			id: 'tool',
			label: localize('usage.toolExec.col.tool'),
			sortValue: r => resolveToolName(r.tool),
			render: r => ({ html: `<span title="${escapeHtml(r.tool)}">${escapeHtml(resolveToolName(r.tool))}</span>${badge(r)}` }),
		},
		{ id: 'completed', label: localize('usage.toolExec.col.completed'), align: 'right', sortValue: r => r.completed, render: r => formatNumber(r.completed) },
		{ id: 'total', label: localize('usage.toolExec.families.col.total'), align: 'right', sortValue: r => r.outputTokens, render: r => formatCompact(r.outputTokens) },
		{ id: 'tokensPerCall', label: localize('usage.toolExec.col.tokensPerCall'), align: 'right', sortValue: r => r.tokensPerCall, render: r => formatNumber(Math.round(r.tokensPerCall)) },
		{
			id: 'vsBuiltIn',
			label: localize('usage.toolExec.families.col.vsBuiltIn'),
			align: 'right',
			sortValue: r => r.vsBuiltIn,
			cellClassName: ratioClass,
			render: r => ({ html: ratioCell(r) }),
		},
	];
}

export function buildToolFamilySectionHtml(input: ToolFamilySectionInput): string {
	const groups = buildToolFamilyGroups(input.toolCalls, input.families, id => isReportableTool(id, input.hiddenTools));
	const configure = `<div class="tool-family-configure"><button class="tool-family-link" id="btn-open-tool-families-settings">${escapeHtml(localize('usage.toolExec.families.configure'))}</button></div>`;
	const tables = groups.map((group) => {
		const name = group.name ?? localize('usage.toolExec.families.other');
		const description = group.description ? ` <span class="tool-family-description">${escapeHtml(group.description)}</span>` : '';
		const table = renderDataTable<ToolFamilyRow>({
			tableId: `tool-family-${group.id === null ? 'other' : `id-${encodeURIComponent(group.id)}`}`,
			ariaLabel: name,
			rows: group.rows,
			columns: familyColumns(input.resolveToolName, group.id !== null),
			initialSort: { columnId: 'tokensPerCall', direction: 'desc' },
			className: 'data-table--compact',
		});
		return `<div class="tool-family-group"><h4 class="tool-family-heading">${escapeHtml(name)}${description}</h4>${table}</div>`;
	}).join('');
	return sectionHtml('section-tool-families', '🧰', 'usage.toolExec.families.title', 'usage.toolExec.families.subtitle',
		configure + (tables || emptyHtml('usage.toolExec.empty.families')));
}
