import test from 'node:test';
import * as assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

import { initializeWebviewLocalization } from '../../src/webview/shared/localization';
import {
	DEFAULT_PAGED_TABLE_PAGE_SIZE,
	getPagedTableAnnouncement,
	getPagedTableFocusTarget,
	getPagedTablePage,
	getPagedTableState,
	renderPagedTable,
	restorePagedTableFocus,
	setPagedTableFilter,
	setPagedTablePage,
	setPagedTableSort,
	type PagedTableColumn,
} from '../../src/webview/usage/pagedTable';

type Row = { id: string; name: string; count: number; included: boolean };

const columns: PagedTableColumn<Row>[] = [
	{ id: 'name', label: 'Name', sortValue: row => row.name, render: row => row.name },
	{ id: 'count', label: 'Count', sortValue: row => row.count, render: row => String(row.count) },
];

function rows(count: number): Row[] {
	return Array.from({ length: count }, (_, index) => ({
		id: `row-${index}`,
		name: `Row ${String(count - index).padStart(2, '0')}`,
		count: count - index,
		included: index % 2 === 0,
	}));
}

test('pagedTable: sorts strings case-insensitively and numbers in both directions with stable ties', () => {
	const values: Row[] = [
		{ id: 'first-a', name: 'alpha', count: 2, included: true },
		{ id: 'first-b', name: 'ALPHA', count: 2, included: true },
		{ id: 'last', name: 'bravo', count: 1, included: true },
	];
	const stringState = getPagedTableState('test-sort-string', 'name', 'asc');
	assert.deepEqual(getPagedTablePage(values, columns, stringState).rows.map(row => row.id), ['first-a', 'first-b', 'last']);
	stringState.sortDirection = 'desc';
	assert.deepEqual(getPagedTablePage(values, columns, stringState).rows.map(row => row.id), ['last', 'first-a', 'first-b']);
	const numericState = getPagedTableState('test-sort-number', 'count', 'asc');
	assert.deepEqual(getPagedTablePage(values, columns, numericState).rows.map(row => row.count), [1, 2, 2]);
	numericState.sortDirection = 'desc';
	assert.deepEqual(getPagedTablePage(values, columns, numericState).rows.map(row => row.count), [2, 2, 1]);
});

test('pagedTable: slices empty, one-row, full, and multi-page tables at ten rows', () => {
	assert.equal(DEFAULT_PAGED_TABLE_PAGE_SIZE, 10);
	for (const [length, expectedPages] of [[0, 1], [1, 1], [10, 1], [11, 2], [25, 3]] as const) {
		const state = getPagedTableState(`test-slice-${length}`, 'count', 'desc');
		const page = getPagedTablePage(rows(length), columns, state);
		assert.equal(page.rows.length, Math.min(length, 10), `${length} rows`);
		assert.equal(page.filteredCount, length);
		assert.equal(page.pageCount, expectedPages);
		assert.equal(page.firstRow, length === 0 ? 0 : 1);
		assert.equal(page.lastRow, Math.min(length, 10));
		const html = renderPagedTable({
			tableId: `test-render-${length}`,
			ariaLabel: 'test rows',
			rows: rows(length),
			columns,
			initialSortColumn: 'count',
			initialSortDirection: 'desc',
			emptyMessage: 'Empty',
		});
		assert.equal(html.includes('paged-table-pager'), length > 10);
		if (length > 10) {
			assert.equal((html.match(/background:var\(--button-secondary-bg\);color:var\(--button-secondary-fg\)/g) ?? []).length, 2);
		}
	}
});

test('pagedTable: clamps the active page when rows shrink', () => {
	const tableId = 'test-clamp';
	getPagedTableState(tableId, 'count', 'desc');
	setPagedTablePage(tableId, 3);
	const before = getPagedTablePage(rows(25), columns, getPagedTableState(tableId, 'count', 'desc'));
	assert.equal(before.page, 3);
	renderPagedTable({
		tableId,
		ariaLabel: 'test rows',
		rows: rows(11),
		columns,
		initialSortColumn: 'count',
		initialSortDirection: 'desc',
		emptyMessage: 'Empty',
	});
	assert.equal(getPagedTableState(tableId, 'count', 'desc').page, 2);
	renderPagedTable({
		tableId,
		ariaLabel: 'test rows',
		rows: rows(1),
		columns,
		initialSortColumn: 'count',
		initialSortDirection: 'desc',
		emptyMessage: 'Empty',
	});
	assert.equal(getPagedTableState(tableId, 'count', 'desc').page, 1);
});

test('pagedTable: sorting and filters reset pagination, with filtering before page slicing', () => {
	const tableId = 'test-filter';
	getPagedTableState(tableId, 'name', 'asc', { included: true });
	setPagedTablePage(tableId, 2);
	setPagedTableSort(tableId, 'count');
	assert.equal(getPagedTableState(tableId, 'name', 'asc').page, 1);
	setPagedTablePage(tableId, 2);
	setPagedTableFilter(tableId, 'included', false);
	assert.equal(getPagedTableState(tableId, 'name', 'asc').page, 1);
	const filtered = getPagedTablePage(rows(25), columns, getPagedTableState(tableId, 'name', 'asc'), (row, filters) => row.included === filters.included);
	assert.equal(filtered.filteredCount, 12);
	assert.equal(filtered.pageCount, 2);
	assert.ok(filtered.rows.every(row => !row.included));
	setPagedTableFilter(tableId, 'included', true);
	const included = getPagedTablePage(rows(25), columns, getPagedTableState(tableId, 'name', 'asc'), (row, filters) => row.included === filters.included);
	assert.equal(included.filteredCount, 13);
	assert.equal(included.page, 1);
	assert.ok(included.rows.every(row => row.included));
});

test('pagedTable: escapes plain cell content and localized labels', () => {
	initializeWebviewLocalization({});
	const hostile = [{ id: 'hostile', name: '<img src=x onerror="alert(1)">', count: 1, included: true }];
	const html = renderPagedTable({
		tableId: 'test-escape',
		ariaLabel: '<table>',
		rows: hostile,
		columns,
		initialSortColumn: 'name',
		initialSortDirection: 'asc',
		emptyMessage: '<empty>',
	});
	assert.doesNotMatch(html, /<img/);
	assert.match(html, /&lt;img src=x onerror=&quot;alert\(1\)&quot;&gt;/);
	assert.match(html, /aria-label="&lt;table&gt;"/);
});

test('pagedTable: preserves control focus and announces sorted and paged updates', () => {
	initializeWebviewLocalization({});
	const tableId = 'test-focus-and-announcements';
	const dom = new JSDOM(`<div id="host">${renderPagedTable({
		tableId,
		ariaLabel: 'test rows',
		rows: rows(25),
		columns,
		initialSortColumn: 'count',
		initialSortDirection: 'desc',
		emptyMessage: 'Empty',
	})}</div>`, { pretendToBeVisual: true });
	const host = dom.window.document.getElementById('host');
	assert.ok(host);
	const replaceTable = (): HTMLElement => {
		const root = host.querySelector(`#paged-table-root-${tableId}`) as HTMLElement | null;
		assert.ok(root);
		const target = getPagedTableFocusTarget(root, dom.window.document.activeElement);
		const staging = dom.window.document.createElement('div');
		staging.innerHTML = renderPagedTable({
			tableId,
			ariaLabel: 'test rows',
			rows: rows(25),
			columns,
			initialSortColumn: 'count',
			initialSortDirection: 'desc',
			emptyMessage: 'Empty',
		});
		const replacement = staging.firstElementChild;
		assert.ok(replacement instanceof dom.window.HTMLElement);
		root.replaceWith(replacement);
		assert.equal(restorePagedTableFocus(replacement, target), true);
		return replacement;
	};

	const sortButton = host.querySelector('[data-paged-sort="name"]') as HTMLButtonElement | null;
	assert.ok(sortButton);
	sortButton.focus();
	setPagedTableSort(tableId, 'name');
	let replacement = replaceTable();
	assert.equal(dom.window.document.activeElement?.getAttribute('data-paged-sort'), 'name');
	assert.equal(getPagedTableAnnouncement(replacement, true), 'Name: Sorted ascending');

	const nextButton = host.querySelector('[data-paged-direction="next"]') as HTMLButtonElement | null;
	assert.ok(nextButton);
	nextButton.focus();
	setPagedTablePage(tableId, 2);
	replacement = replaceTable();
	assert.equal(dom.window.document.activeElement?.getAttribute('data-paged-direction'), 'next');
	assert.equal(getPagedTableAnnouncement(replacement, false), 'Page 2 of 3 · Showing 11–20 of 25');

	const previousButton = host.querySelector('[data-paged-direction="previous"]') as HTMLButtonElement | null;
	assert.ok(previousButton);
	previousButton.focus();
	setPagedTablePage(tableId, 1);
	replacement = replaceTable();
	assert.equal(dom.window.document.activeElement?.getAttribute('data-paged-direction'), 'next');
	assert.equal(replacement.querySelector('[data-paged-direction="previous"]')?.hasAttribute('disabled'), true);
	dom.window.close();
});
