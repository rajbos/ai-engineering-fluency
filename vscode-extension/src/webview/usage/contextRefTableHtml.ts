// The Context References table: its cells, its head, and the collapsed long tail beneath it.
//
// Split out of main.ts because that file sits against the 6000 counted-line ceiling
// `eslint.config.mjs` enforces, and because the table is pure markup over `ContextRefRow[]` —
// nothing here reads module state, so the disclosure's open/closed flag arrives as an argument
// from the panel that owns it.
import { escapeHtml } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import { partitionContextRefRows, type ContextRefRow } from './contextRefRows';

function numCell(value: number, extraClass = ''): string {
	const zeroClass = value > 0 ? '' : ' ctx-ref-zero';
	const cls = `ctx-ref-num${extraClass ? ' ' + extraClass : ''}${zeroClass}`;
	return `<td class="${cls}">${value}</td>`;
}

function sparklineCell(lastMonth: number, month: number, today: number): string {
	const W = 60, H = 20, PAD = 2;
	const values = [lastMonth, month, today];
	const max = Math.max(...values);
	// Flat line at the bottom when all zeros
	const points = values.map((v, i) => {
		const x = PAD + i * ((W - PAD * 2) / (values.length - 1));
		const y = max === 0 ? H - PAD : PAD + (1 - v / max) * (H - PAD * 2);
		return `${x.toFixed(1)},${y.toFixed(1)}`;
	}).join(' ');
	const isFlat = max === 0;
	const color = isFlat ? 'var(--text-muted)' : today >= month && month >= lastMonth ? 'var(--link-color)' : today <= month && month <= lastMonth ? '#f87171' : 'var(--text-secondary)';
	return `<td class="ctx-ref-spark"><svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" aria-hidden="true"><polyline points="${points}" fill="none" stroke="${color}" stroke-width="1.5" stroke-linejoin="round" stroke-linecap="round"/>${values.map((v, i) => {
		const x = PAD + i * ((W - PAD * 2) / (values.length - 1));
		const y = max === 0 ? H - PAD : PAD + (1 - v / max) * (H - PAD * 2);
		return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2" fill="${color}"/>`;
	}).join('')}</svg></td>`;
}

function contextRefRowHtml(row: ContextRefRow): string {
	const titleAttr = row.title ? ` title="${escapeHtml(row.title)}"` : '';
	return `<tr${titleAttr}><td class="ctx-ref-name">${row.label}</td>${numCell(row.today, row.today > 0 ? 'ctx-ref-today-active' : '')}${numCell(row.month)}${numCell(row.lastMonth)}${numCell(row.last30)}${sparklineCell(row.lastMonth, row.month, row.today)}</tr>`;
}

/**
 * The table head, resolved per render rather than once at module load.
 *
 * It was a `const` while it was English prose inline in main.ts; now that the headers come from
 * the localization dictionary it has to be a function, because that dictionary is only populated
 * once the host's payload arrives — a module-level constant would freeze the English fallback
 * into every render that follows.
 */
function ctxRefTableHead(): string {
	const th = (cls: string, key: string, title = ''): string =>
		`<th class="${cls}"${title ? ` title="${escapeHtml(localize(title))}"` : ''}>${escapeHtml(localize(key))}</th>`;
	return `
				<thead>
					<tr>
						${th('ctx-ref-name', 'usage.contextRefs.colReference')}
						${th('ctx-ref-num', 'usage.contextRefs.colToday')}
						${th('ctx-ref-num', 'usage.contextRefs.colThisMonth')}
						${th('ctx-ref-num', 'usage.contextRefs.colLastMonth')}
						${th('ctx-ref-num', 'usage.contextRefs.colLast30')}
						${th('ctx-ref-spark', 'usage.contextRefs.colTrend', 'usage.contextRefs.colTrendTooltip')}
					</tr>
				</thead>`;
}

/**
 * The unused-reference long tail, collapsed behind a disclosure.
 *
 * These rows are still rendered — a reference kind you have never used is worth discovering —
 * but they are not worth 14 rows of dead zeroes above the fold.
 */
function renderContextRefOtherHtml(otherRows: ContextRefRow[], otherOpen: boolean): string {
	if (otherRows.length === 0) { return ''; }
	const body = otherRows.map(contextRefRowHtml).join('');
	return `<details class="ctx-ref-other" id="ctx-ref-other"${otherOpen ? ' open' : ''}>
			<summary>${escapeHtml(localizeFormat('usage.contextRefs.otherSummary', otherRows.length))}</summary>
			<div class="ctx-ref-table-wrap">
				<table class="ctx-ref-table">${ctxRefTableHead()}
					<tbody>${body}</tbody>
				</table>
			</div>
		</details>`;
}

export function renderContextRefTable(
	rows: ContextRefRow[],
	totals: { last30: number; month: number; lastMonth: number; today: number },
	otherOpen: boolean,
): string {
	const sorted = rows.slice().sort((a, b) => b.last30 - a.last30);
	// Reference kinds with nothing today and nothing in the last 30 days drop into a collapsed
	// "Other" group rather than padding the table with zeroes. The footer is computed from the
	// stats, not from the rows above it, so collapsing the tail never changes what it sums.
	//
	// It is not the column sum of this table, and was not before this split either:
	// getTotalContextRefs() counts the 17 reference-kind fields, while four of the rows here are
	// derived metrics read from elsewhere on the same stats (Images, Prompt Files and Custom
	// Prompts from `byKind`, Code Lines from `codeContextLines`). A period whose only activity is
	// one of those four therefore shows a non-zero row over a zero total. The footer's tooltip
	// says so rather than quietly presenting it as the table's sum.
	const { active, other } = partitionContextRefRows(sorted);
	const bodyRows = active.map(contextRefRowHtml).join('');
	const emptyRow = active.length === 0
		? `<tr><td class="ctx-ref-name" colspan="6" style="color: var(--text-muted);">${escapeHtml(localize('usage.contextRefs.noneRecent'))}</td></tr>`
		: '';
	return `
		<div class="ctx-ref-table-wrap">
			<table class="ctx-ref-table">${ctxRefTableHead()}
				<tbody>
					${bodyRows}${emptyRow}
				</tbody>
				<tfoot>
					<tr class="ctx-ref-total" title="${escapeHtml(localize('usage.contextRefs.totalTooltip'))}">
						<td class="ctx-ref-name">${escapeHtml(localize('usage.contextRefs.totalRow'))}</td>
						<td class="ctx-ref-num">${totals.today}</td>
						<td class="ctx-ref-num">${totals.month}</td>
						<td class="ctx-ref-num">${totals.lastMonth}</td>
						<td class="ctx-ref-num">${totals.last30}</td>
						<td class="ctx-ref-spark">${sparklineCell(totals.lastMonth, totals.month, totals.today).replace(/^<td[^>]*>/, '').replace(/<\/td>$/, '')}</td>
					</tr>
				</tfoot>
			</table>
		</div>
		${renderContextRefOtherHtml(other, otherOpen)}`;
}
