import { escapeHtml } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';

export const DEFAULT_PAGED_TABLE_PAGE_SIZE = 10;

export type PagedTableSortDirection = 'asc' | 'desc';
export type PagedTableSortValue = string | number | null | undefined;

export interface PagedTableColumn<Row> {
	id: string;
	label: string;
	/** Accessible name for the header when `label` is an icon; defaults to `label`. */
	headerTitle?: string;
	align?: 'left' | 'center' | 'right';
	hidden?: boolean;
	sortable?: boolean;
	sortValue: (row: Row) => PagedTableSortValue;
	render: (row: Row) => string | { html: string };
}

export interface PagedTableState {
	sortColumn: string;
	sortDirection: PagedTableSortDirection;
	page: number;
	filters: Record<string, boolean>;
}

export type PagedTableFocusTarget =
	| { kind: 'sort'; columnId: string }
	| { kind: 'page'; direction: 'previous' | 'next' }
	| { kind: 'filter'; filterId: string };

export interface PagedTablePage<Row> {
	rows: Row[];
	filteredCount: number;
	page: number;
	pageCount: number;
	firstRow: number;
	lastRow: number;
}

export interface RenderPagedTableOptions<Row> {
	tableId: string;
	ariaLabel: string;
	rows: readonly Row[];
	columns: readonly PagedTableColumn<Row>[];
	initialSortColumn: string;
	initialSortDirection: PagedTableSortDirection;
	defaultFilters?: Record<string, boolean>;
	filterRows?: (row: Row, filters: Readonly<Record<string, boolean>>) => boolean;
	emptyMessage: string;
	pageSize?: number;
}

const tableStates = new Map<string, PagedTableState>();

export function getPagedTableState(
	tableId: string,
	initialSortColumn: string,
	initialSortDirection: PagedTableSortDirection,
	defaultFilters: Record<string, boolean> = {},
): PagedTableState {
	let state = tableStates.get(tableId);
	if (!state) {
		state = {
			sortColumn: initialSortColumn,
			sortDirection: initialSortDirection,
			page: 1,
			filters: { ...defaultFilters },
		};
		tableStates.set(tableId, state);
	}
	return state;
}

export function setPagedTableSort(tableId: string, columnId: string): void {
	const state = tableStates.get(tableId);
	if (!state) { return; }
	const sameColumn = state.sortColumn === columnId;
	tableStates.set(tableId, {
		...state,
		sortColumn: columnId,
		sortDirection: sameColumn && state.sortDirection === 'asc' ? 'desc' : 'asc',
		page: 1,
	});
}

export function setPagedTablePage(tableId: string, page: number): void {
	const state = tableStates.get(tableId);
	if (!state) { return; }
	tableStates.set(tableId, { ...state, page: Math.max(1, Math.floor(page)) });
}

export function setPagedTableFilter(tableId: string, filterId: string, value: boolean): void {
	const state = tableStates.get(tableId);
	if (!state) { return; }
	tableStates.set(tableId, {
		...state,
		filters: { ...state.filters, [filterId]: value },
		page: 1,
	});
}

export function getPagedTableFocusTarget(root: HTMLElement, activeElement: Element | null): PagedTableFocusTarget | undefined {
	if (!activeElement || !root.contains(activeElement)) { return undefined; }
	const sortButton = activeElement.closest<HTMLButtonElement>('[data-paged-sort]');
	if (sortButton) {
		const columnId = sortButton.getAttribute('data-paged-sort');
		if (columnId) { return { kind: 'sort', columnId }; }
	}
	const pageButton = activeElement.closest<HTMLButtonElement>('[data-paged-direction]');
	if (pageButton) {
		const direction = pageButton.getAttribute('data-paged-direction');
		if (direction === 'previous' || direction === 'next') { return { kind: 'page', direction }; }
	}
	const filterInput = activeElement.closest<HTMLInputElement>('[data-paged-table-filter]');
	if (filterInput) {
		const filterId = filterInput.getAttribute('data-paged-table-filter');
		if (filterId) { return { kind: 'filter', filterId }; }
	}
	return undefined;
}

export function restorePagedTableFocus(root: HTMLElement, target: PagedTableFocusTarget | undefined): boolean {
	if (!target) { return false; }
	let control: HTMLElement | undefined;
	if (target.kind === 'sort') {
		control = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-paged-sort]'))
			.find(button => button.getAttribute('data-paged-sort') === target.columnId);
	} else if (target.kind === 'page') {
		const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-paged-direction]'));
		control = buttons.find(button => button.getAttribute('data-paged-direction') === target.direction && !button.disabled)
			?? buttons.find(button => !button.disabled);
	} else {
		control = Array.from(root.querySelectorAll<HTMLInputElement>('[data-paged-table-filter]'))
			.find(input => input.getAttribute('data-paged-table-filter') === target.filterId);
	}
	if (!control) { return false; }
	control.focus();
	return true;
}

export function getPagedTableAnnouncement(root: HTMLElement, sorted: boolean): string {
	if (sorted) {
		const header = root.querySelector<HTMLTableCellElement>('th[aria-sort="ascending"], th[aria-sort="descending"]');
		const button = header?.querySelector<HTMLButtonElement>('.paged-table-sort');
		if (button) {
			const label = (button.textContent ?? '').replace(/\s*[↑↓]\s*$/, '').trim();
			return localizeFormat('usage.pagedTable.announcement.sort', label, button.title);
		}
	}
	const status = root.querySelector<HTMLElement>('.paged-table-pager span, .paged-table-summary');
	return status?.textContent?.trim() ?? '';
}

function compareSortValues(a: PagedTableSortValue, b: PagedTableSortValue): number {
	if (a === null || a === undefined) { return b === null || b === undefined ? 0 : 1; }
	if (b === null || b === undefined) { return -1; }
	if (typeof a === 'number' && typeof b === 'number') {
		return a - b;
	}
	return String(a).localeCompare(String(b), undefined, { sensitivity: 'base', numeric: true });
}

/** Applies filtering, a stable sort, and page slicing in that order. */
export function getPagedTablePage<Row>(
	rows: readonly Row[],
	columns: readonly PagedTableColumn<Row>[],
	state: PagedTableState,
	filterRows?: (row: Row, filters: Readonly<Record<string, boolean>>) => boolean,
	pageSize = DEFAULT_PAGED_TABLE_PAGE_SIZE,
): PagedTablePage<Row> {
	const column = columns.find(candidate => candidate.id === state.sortColumn);
	const filtered = rows.filter(row => !filterRows || filterRows(row, state.filters));
	const sorted = column?.sortValue
		? filtered.map((row, index) => ({ row, index, value: column.sortValue(row) }))
			.sort((a, b) => {
				const result = compareSortValues(a.value, b.value);
				if (result === 0) { return a.index - b.index; }
				if (a.value === null || a.value === undefined || b.value === null || b.value === undefined) { return result; }
				return state.sortDirection === 'asc' ? result : -result;
			})
			.map(item => item.row)
		: filtered.slice();
	const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize));
	const page = Math.min(Math.max(1, state.page), pageCount);
	const firstRow = sorted.length === 0 ? 0 : (page - 1) * pageSize + 1;
	const lastRow = Math.min(page * pageSize, sorted.length);
	return {
		rows: sorted.slice((page - 1) * pageSize, page * pageSize),
		filteredCount: sorted.length,
		page,
		pageCount,
		firstRow,
		lastRow,
	};
}

function cellHtml(value: string | { html: string }): string {
	return typeof value === 'string' ? escapeHtml(value) : value.html;
}

function headerTitleAttr(headerTitle: string | undefined, attribute: 'title' | 'aria-label'): string {
	return headerTitle ? ` ${attribute}="${escapeHtml(headerTitle)}"` : '';
}

function renderHeaderCell<Row>(column: PagedTableColumn<Row>, state: PagedTableState, tableId: string): string {
	const style = `padding:5px 8px; text-align:${column.align ?? 'left'}; color:var(--text-primary); font-weight:600; font-size:12px;`;
	if (column.sortable === false) {
		return `<th scope="col"${column.align === 'right' ? ' class="num"' : ''}${headerTitleAttr(column.headerTitle, 'title')} style="${style}">${escapeHtml(column.label)}</th>`;
	}
	const active = state.sortColumn === column.id;
	const direction = active ? state.sortDirection : 'none';
	const indicator = direction === 'asc' ? ' ↑' : direction === 'desc' ? ' ↓' : '';
	const title = active
		? localize(direction === 'asc' ? 'usage.pagedTable.sortedAscending' : 'usage.pagedTable.sortedDescending')
		: localizeFormat('usage.pagedTable.sortBy', column.headerTitle ?? column.label);
	return `<th scope="col" class="sortable${column.align === 'right' ? ' num' : ''}" aria-sort="${direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none'}" style="${style}">
		<button type="button" class="paged-table-sort" data-paged-table="${escapeHtml(tableId)}" data-paged-sort="${escapeHtml(column.id)}" title="${escapeHtml(title)}"${headerTitleAttr(column.headerTitle, 'aria-label')} style="background:none;border:0;padding:0;color:inherit;font:inherit;text-align:inherit;cursor:pointer;">${escapeHtml(column.label)}${indicator}</button>
	</th>`;
}

function renderBodyCell<Row>(column: PagedTableColumn<Row>, row: Row): string {
	const alignStyle = column.align && column.align !== 'left' ? ` text-align:${column.align};` : '';
	return `<td${column.align === 'right' ? ' class="num"' : ''} style="padding:5px 8px; color:var(--text-primary); font-size:12px;${alignStyle}">${cellHtml(column.render(row))}</td>`;
}

export function renderPagedTable<Row>(options: RenderPagedTableOptions<Row>): string {
	const state = getPagedTableState(
		options.tableId,
		options.initialSortColumn,
		options.initialSortDirection,
		options.defaultFilters,
	);
	const page = getPagedTablePage(options.rows, options.columns, state, options.filterRows, options.pageSize);
	if (page.page !== state.page) {
		setPagedTablePage(options.tableId, page.page);
	}
	const visibleColumns = options.columns.filter(column => !column.hidden);
	const headers = visibleColumns.map(column => renderHeaderCell(column, state, options.tableId)).join('');
	const body = page.rows.length > 0
		? page.rows.map(row => `<tr>${visibleColumns.map(column => renderBodyCell(column, row)).join('')}</tr>`).join('')
		: `<tr><td class="paged-table-empty" colspan="${visibleColumns.length}" style="padding:8px;color:var(--text-secondary);font-size:12px;">${escapeHtml(options.emptyMessage)}</td></tr>`;
	const summary = page.filteredCount <= (options.pageSize ?? DEFAULT_PAGED_TABLE_PAGE_SIZE)
		? `<span class="paged-table-summary" style="font-size:11px;color:var(--text-secondary);">${escapeHtml(localizeFormat('usage.pagedTable.showing', page.firstRow, page.lastRow, page.filteredCount))}</span>`
		: '';
	const pager = page.pageCount > 1
		? `<nav class="paged-table-pager" aria-label="${escapeHtml(options.ariaLabel)}" style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:8px;font-size:11px;color:var(--text-secondary);">
			<button type="button" data-paged-table="${escapeHtml(options.tableId)}" data-paged-direction="previous" data-paged-page="${page.page - 1}"${page.page <= 1 ? ' disabled' : ''} style="background:var(--button-secondary-bg);color:var(--button-secondary-fg);border:1px solid var(--border-color);border-radius:3px;padding:2px 8px;cursor:pointer;">${escapeHtml(localize('usage.pagedTable.previous'))}</button>
			<span>${escapeHtml(localizeFormat('usage.pagedTable.page', page.page, page.pageCount, page.firstRow, page.lastRow, page.filteredCount))}</span>
			<button type="button" data-paged-table="${escapeHtml(options.tableId)}" data-paged-direction="next" data-paged-page="${page.page + 1}"${page.page >= page.pageCount ? ' disabled' : ''} style="background:var(--button-secondary-bg);color:var(--button-secondary-fg);border:1px solid var(--border-color);border-radius:3px;padding:2px 8px;cursor:pointer;">${escapeHtml(localize('usage.pagedTable.next'))}</button>
		</nav>`
		: summary;
	return `<div id="paged-table-root-${escapeHtml(options.tableId)}" class="paged-table-root">
		<table class="paged-table" aria-label="${escapeHtml(options.ariaLabel)}">
			<thead><tr>${headers}</tr></thead>
			<tbody>${body}</tbody>
		</table>
		${pager}
	</div>`;
}
