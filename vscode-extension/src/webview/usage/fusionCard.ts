// The Usage Analysis "Router" card: Copilot Fusion routing aggregated across the Copilot
// CLI sessions of a period, shown as one metric × period table. Numeric only — see
// `aggregateHydraFusionSummaries` in `src/hydrafusion.ts`, which builds the data every
// host receives.
import { renderDataTable, type DataTableCell, type DataTableColumn } from '../shared/dataTable';
import { escapeHtml, formatFixed, formatNumber } from '../shared/formatUtils';
import { localize, type WebviewKey } from '../shared/localization';
import type { HydraFusionAggregate } from '../../../../src/hydrafusion';

export const ROUTER_PERIODS = ['today', 'last30Days', 'month', 'lastMonth'] as const;
export type RouterPeriod = typeof ROUTER_PERIODS[number];
export type RouterPayload = Partial<Record<RouterPeriod, HydraFusionAggregate | null>>;

const num = (value: unknown): number => typeof value === 'number' && Number.isFinite(value) ? value : 0;
const optionalNum = (value: unknown): number | null => typeof value === 'number' && Number.isFinite(value) ? value : null;

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

function sanitizeAggregate(raw: unknown): HydraFusionAggregate | null {
	if (!isRecord(raw) || num(raw.totalTurns) <= 0) { return null; }
	return {
		sessions: num(raw.sessions), totalTurns: num(raw.totalTurns), compoundTurns: num(raw.compoundTurns),
		judgeAccepts: num(raw.judgeAccepts), judgeRejects: num(raw.judgeRejects), escalatedTurns: num(raw.escalatedTurns),
		totalAiu: num(raw.totalAiu), reviewAiu: num(raw.reviewAiu), degradedTurns: num(raw.degradedTurns),
		patternCounts: Array.isArray(raw.patternCounts)
			? raw.patternCounts
				.filter((p): p is RawRecord & { pattern: string } => isRecord(p) && typeof p.pattern === 'string')
				.map(p => ({ pattern: p.pattern, turns: num(p.turns), aiu: num(p.aiu) }))
			: [],
		compoundRatePercent: num(raw.compoundRatePercent),
		judgeRejectionRatePercent: optionalNum(raw.judgeRejectionRatePercent),
		aiuPerTurn: optionalNum(raw.aiuPerTurn),
		totalUsd: num(raw.totalUsd),
		usdPerTurn: optionalNum(raw.usdPerTurn),
		reviewSharePercent: num(raw.reviewSharePercent),
		escalationRatePercent: num(raw.escalationRatePercent),
	};
}

/** Validates the host payload; a period with no routed turns becomes null. Returns undefined when absent. */
export function sanitizeRouterPayload(raw: unknown): RouterPayload | undefined {
	if (!isRecord(raw)) { return undefined; }
	const result: RouterPayload = {};
	for (const period of ROUTER_PERIODS) { result[period] = sanitizeAggregate(raw[period]); }
	return result;
}

const pct = (value: number | null): string => value === null ? '—' : `${formatFixed(value, 1)}%`;

/** Cell shown for a period with no routed turns (whole column), matching the other period tables. */
const missingCell: DataTableCell = { html: '<span class="data-table-muted">–</span>' };

interface RouterMetric {
	id: string;
	labelKey: WebviewKey;
	render: (agg: HydraFusionAggregate) => DataTableCell;
	sortValue: (agg: HydraFusionAggregate) => number | null;
}

/** The table's rows, in display order. */
const ROUTER_METRICS: readonly RouterMetric[] = [
	{ id: 'sessions', labelKey: 'usage.router.stat.sessions', render: a => formatNumber(a.sessions), sortValue: a => a.sessions },
	{ id: 'turns', labelKey: 'usage.router.stat.turns', render: a => formatNumber(a.totalTurns), sortValue: a => a.totalTurns },
	{ id: 'compoundRate', labelKey: 'usage.router.stat.compoundRate', render: a => pct(a.compoundRatePercent), sortValue: a => a.compoundRatePercent },
	{ id: 'judgeRejection', labelKey: 'usage.router.stat.judgeRejection', render: a => pct(a.judgeRejectionRatePercent), sortValue: a => a.judgeRejectionRatePercent },
	{ id: 'escalation', labelKey: 'usage.router.stat.escalation', render: a => pct(a.escalationRatePercent), sortValue: a => a.escalationRatePercent },
	{ id: 'aiuPerTurn', labelKey: 'usage.router.stat.aiuPerTurn', render: a => a.aiuPerTurn === null ? '—' : formatFixed(a.aiuPerTurn, 2), sortValue: a => a.aiuPerTurn },
	{ id: 'reviewShare', labelKey: 'usage.router.stat.reviewShare', render: a => pct(a.reviewSharePercent), sortValue: a => a.reviewSharePercent },
	{ id: 'totalSpend', labelKey: 'usage.router.stat.totalSpend', render: a => `$${formatFixed(a.totalUsd, 2)}`, sortValue: a => a.totalUsd },
	{
		id: 'patternMix',
		labelKey: 'usage.router.patternMix',
		// Plain string (not html) so the table escapes the pattern names itself.
		render: a => a.patternCounts.map(p => `${p.pattern} ${formatNumber(p.turns)}`).join(' · ') || missingCell,
		sortValue: a => a.patternCounts.reduce((sum, p) => sum + p.turns, 0),
	},
];

function buildRouterColumns(router: RouterPayload | undefined): DataTableColumn<RouterMetric>[] {
	const metricColumn: DataTableColumn<RouterMetric> = {
		id: 'metric',
		label: localize('efficiency.detail.col.metric'),
		rowHeader: true,
		sortValue: row => localize(row.labelKey),
		render: row => localize(row.labelKey),
	};
	const periodColumns = ROUTER_PERIODS.map((period): DataTableColumn<RouterMetric> => {
		const agg = router?.[period] ?? null;
		return {
			id: period,
			label: localize(`usage.router.period.${period}`),
			align: 'right',
			width: '110px',
			className: `router-col-${period}`,
			sortValue: row => (agg ? row.sortValue(agg) : null),
			render: row => (agg ? row.render(agg) : missingCell),
		};
	});
	return [metricColumn, ...periodColumns];
}

/** The card, or an empty string when no period has a routed Copilot Fusion turn. */
export function buildRouterSectionHtml(router: RouterPayload | undefined): string {
	if (!ROUTER_PERIODS.some(period => router?.[period])) { return ''; }
	return `
		<div class="section" id="section-router">
			<div class="section-title"><span>⚡</span><span>${escapeHtml(localize('usage.router.title'))}</span></div>
			<div class="section-subtitle">${escapeHtml(localize('usage.router.subtitle'))}</div>
			${renderDataTable({
				tableId: 'router-periods',
				ariaLabel: localize('usage.router.aria.table'),
				rows: ROUTER_METRICS,
				columns: buildRouterColumns(router),
				pageSize: false,
				className: 'data-table--fixed router-table',
			})}
		</div>`;
}
