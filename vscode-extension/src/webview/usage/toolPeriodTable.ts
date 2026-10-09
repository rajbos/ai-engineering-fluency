/**
 * Tools & Integrations: one tool × period table (rows = tools, columns = Today /
 * Last 30 Days / Previous Month) with a pinned total row, replacing the three
 * side-by-side ranked cards. Pure string building so the row selection, sort and
 * escaping are unit-testable without a DOM.
 */
import { escapeHtml, formatNumber } from '../shared/formatUtils';
import { localize, type WebviewKey } from '../shared/localization';

export const TOOL_PERIODS = ['today', 'last30Days', 'lastMonth'] as const;
export type ToolPeriodKey = typeof TOOL_PERIODS[number];

const PERIOD_COLUMN_KEYS: Record<ToolPeriodKey, WebviewKey> = {
	today: 'usage.toolPeriod.colToday',
	last30Days: 'usage.toolPeriod.colLast30',
	lastMonth: 'usage.toolPeriod.colPreviousMonth',
};

/** Per-period call counts keyed by raw tool (or server) id. */
export type ToolPeriodCounts = Record<ToolPeriodKey, { readonly [id: string]: number }>;
export type ToolPeriodTotals = Record<ToolPeriodKey, number>;

export interface ToolPeriodRow {
	id: string;
	name: string;
	counts: ToolPeriodTotals;
}

export interface ToolPeriodTableOptions {
	/** Each period contributes its top N ids; the table shows the union. */
	limitPerPeriod: number;
	nameResolver: (id: string) => string;
	/** Lower-cased ids excluded from the rows (the "Hide Automatic Tool Calls" filter). */
	hiddenIds?: ReadonlySet<string>;
	/** Lower-cased ids that get the `auto` badge. */
	autoIds?: ReadonlySet<string>;
	firstColumnKey: WebviewKey;
	totalLabelKey: WebviewKey;
	emptyKey: WebviewKey;
	/** Empty-state text used instead of `emptyKey` when ids were hidden by `hiddenIds`. */
	emptyHiddenKey?: WebviewKey;
}

function countOf(map: { readonly [id: string]: number }, id: string): number {
	const value = Object.prototype.hasOwnProperty.call(map, id) ? map[id] : 0;
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function topIds(map: { readonly [id: string]: number }, limit: number, hiddenIds?: ReadonlySet<string>): string[] {
	return Object.keys(map)
		.filter(id => countOf(map, id) > 0 && !hiddenIds?.has(id.toLowerCase()))
		.sort((a, b) => countOf(map, b) - countOf(map, a) || a.localeCompare(b))
		.slice(0, limit);
}

/**
 * Rows = union of each period's top `limitPerPeriod` ids (after `hiddenIds`), each
 * carrying its counts for every period. Sorted by Last 30 Days desc, then Today desc,
 * then display name and raw id.
 */
export function selectToolPeriodRows(
	counts: ToolPeriodCounts,
	limitPerPeriod: number,
	nameResolver: (id: string) => string,
	hiddenIds?: ReadonlySet<string>,
): ToolPeriodRow[] {
	const ids = new Set<string>();
	for (const period of TOOL_PERIODS) {
		for (const id of topIds(counts[period], limitPerPeriod, hiddenIds)) { ids.add(id); }
	}
	return [...ids]
		.map(id => ({
			id,
			name: nameResolver(id),
			counts: {
				today: countOf(counts.today, id),
				last30Days: countOf(counts.last30Days, id),
				lastMonth: countOf(counts.lastMonth, id),
			},
		}))
		.sort((a, b) =>
			b.counts.last30Days - a.counts.last30Days
			|| b.counts.today - a.counts.today
			|| a.name.localeCompare(b.name)
			|| a.id.localeCompare(b.id));
}

function countCell(value: number): string {
	return value > 0
		? `<td class="tool-period-num">${formatNumber(value)}</td>`
		: '<td class="tool-period-num tool-period-zero">–</td>';
}

function nameCell(row: ToolPeriodRow, duplicateNames: ReadonlySet<string>, autoIds?: ReadonlySet<string>): string {
	const idEscaped = escapeHtml(row.id);
	const autoBadge = autoIds?.has(row.id.toLowerCase())
		? `<span class="auto-badge" title="${escapeHtml(localize('usage.toolPeriod.autoBadgeTitle'))}">auto</span>`
		: '';
	// Different raw ids can resolve to the same friendly name; keep them as separate
	// rows and show the raw id so they stay distinguishable.
	const hint = duplicateNames.has(row.name) && row.name !== row.id
		? `<span class="tool-period-id">${idEscaped}</span>`
		: '';
	return `<td class="tool-period-name"><strong title="${idEscaped}">${escapeHtml(row.name)}</strong>${autoBadge}${hint}</td>`;
}

export function buildToolPeriodTableHtml(counts: ToolPeriodCounts, totals: ToolPeriodTotals, options: ToolPeriodTableOptions): string {
	const rows = selectToolPeriodRows(counts, options.limitPerPeriod, options.nameResolver, options.hiddenIds);
	const seen = new Set<string>();
	const duplicateNames = new Set<string>();
	for (const row of rows) {
		if (seen.has(row.name)) { duplicateNames.add(row.name); }
		seen.add(row.name);
	}

	const head = `<th class="tool-period-name">${escapeHtml(localize(options.firstColumnKey))}</th>`
		+ TOOL_PERIODS.map(p => `<th class="tool-period-num">${escapeHtml(localize(PERIOD_COLUMN_KEYS[p]))}</th>`).join('');
	const totalRow = `<tr class="tool-period-total"><td class="tool-period-name">${escapeHtml(localize(options.totalLabelKey))}</td>`
		+ TOOL_PERIODS.map(p => `<td class="tool-period-num">${formatNumber(totals[p])}</td>`).join('') + '</tr>';

	let body: string;
	if (rows.length > 0) {
		body = rows.map(row => `<tr>${nameCell(row, duplicateNames, options.autoIds)}${TOOL_PERIODS.map(p => countCell(row.counts[p])).join('')}</tr>`).join('');
	} else {
		const anyHidden = !!options.hiddenIds && TOOL_PERIODS.some(p => Object.keys(counts[p]).some(id => countOf(counts[p], id) > 0));
		const emptyKey = anyHidden && options.emptyHiddenKey ? options.emptyHiddenKey : options.emptyKey;
		body = `<tr class="tool-period-empty"><td colspan="${TOOL_PERIODS.length + 1}">${escapeHtml(localize(emptyKey))}</td></tr>`;
	}

	return `<table class="tool-period-table"><thead><tr>${head}</tr></thead><tbody>${totalRow}${body}</tbody></table>`;
}

export type McpPeriodView = 'server' | 'tool';

export function isMcpPeriodView(value: unknown): value is McpPeriodView {
	return value === 'server' || value === 'tool';
}

export interface McpPeriodTablesInput {
	byServer: ToolPeriodCounts;
	byTool: ToolPeriodCounts;
	totals: ToolPeriodTotals;
	/** Display names for By Tool rows. */
	nameResolver: (id: string) => string;
	/** Display names for By Server rows (server ids have their own friendly-name mappings). */
	serverNameResolver: (id: string) => string;
	view: McpPeriodView;
}

/** By Server / By Tool toggle plus both tables; the toggle only flips `hidden` client-side. */
export function buildMcpPeriodTablesHtml(input: McpPeriodTablesInput): string {
	const button = (view: McpPeriodView, key: WebviewKey): string => {
		const active = input.view === view;
		return `<button type="button" class="tool-period-toggle-btn${active ? ' active' : ''}" data-mcp-view="${view}" aria-pressed="${active}">${escapeHtml(localize(key))}</button>`;
	};
	const serverTable = buildToolPeriodTableHtml(input.byServer, input.totals, {
		limitPerPeriod: 200,
		nameResolver: input.serverNameResolver,
		firstColumnKey: 'usage.toolPeriod.colServer',
		totalLabelKey: 'usage.toolPeriod.totalMcpCalls',
		emptyKey: 'usage.toolPeriod.emptyMcp',
	});
	const toolTable = buildToolPeriodTableHtml(input.byTool, input.totals, {
		limitPerPeriod: 10,
		nameResolver: input.nameResolver,
		firstColumnKey: 'usage.toolPeriod.colTool',
		totalLabelKey: 'usage.toolPeriod.totalMcpCalls',
		emptyKey: 'usage.toolPeriod.emptyMcp',
	});
	return `
		<div class="tool-period-toggle" role="group" aria-label="${escapeHtml(localize('usage.toolPeriod.mcpViewAria'))}">${button('server', 'usage.toolPeriod.byServer')}${button('tool', 'usage.toolPeriod.byTool')}</div>
		<div id="mcp-period-server" class="tool-period-view"${input.view === 'server' ? '' : ' hidden'}>${serverTable}</div>
		<div id="mcp-period-tool" class="tool-period-view"${input.view === 'tool' ? '' : ' hidden'}>${toolTable}</div>`;
}
