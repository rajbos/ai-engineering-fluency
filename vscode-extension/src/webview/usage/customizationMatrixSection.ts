import type { WorkspaceCustomizationMatrix, WorkspaceCustomizationRow } from '../../../../src/types';
import { setHtml } from '../shared/domUtils';
import { escapeHtml } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import {
	getPagedTableAnnouncement,
	getPagedTableFocusTarget,
	getPagedTableState,
	renderPagedTable,
	restorePagedTableFocus,
	setPagedTableFilter,
	setPagedTablePage,
	setPagedTableSort,
	type PagedTableColumn,
} from './pagedTable';
import { statusBadgeHtml } from './statusBadge';

export const CUSTOMIZATION_TABLE_ID = 'customization';
export const CUSTOMIZATION_PAGE_SIZE = 20;
export const CUSTOMIZATION_FILTER_NONE_ONLY = 'noCustomizationOnly';

const SECTION_ID = 'customization-matrix-section';

/** The matrix last rendered, so sort/page/filter clicks can re-render without a new payload. */
let currentMatrix: WorkspaceCustomizationMatrix | null = null;

/** Same test that decides the ⚠️ badge: every customization type is missing. */
export function hasNoCustomization(row: WorkspaceCustomizationRow): boolean {
	return Object.values(row.typeStatuses ?? {}).every(status => status === '❌');
}

/** Sort rank for a status cell: ✅ > ⚠️ > ❌; unknown sorts last in both directions. */
export function customizationStatusRank(status: string | undefined): number | null {
	if (status === '✅') { return 2; }
	if (status === '⚠️') { return 1; }
	if (status === '❌') { return 0; }
	return null;
}

function statusLabel(status: string): string {
	if (status === '✅') { return localize('usage.customization.status.fresh'); }
	if (status === '⚠️') { return localize('usage.customization.status.stale'); }
	if (status === '❌') { return localize('usage.customization.status.missing'); }
	return localize('usage.customization.status.unknown');
}

export function buildCustomizationColumns(matrix: WorkspaceCustomizationMatrix): PagedTableColumn<WorkspaceCustomizationRow>[] {
	const typeColumns: PagedTableColumn<WorkspaceCustomizationRow>[] = (matrix.customizationTypes ?? []).map(type => ({
		id: `type:${type.id}`,
		label: type.icon,
		headerTitle: type.label,
		align: 'center',
		sortValue: row => customizationStatusRank(row.typeStatuses?.[type.id]),
		render: row => {
			const status = row.typeStatuses?.[type.id] || '❓';
			return { html: statusBadgeHtml(status, statusLabel(status)) };
		},
	}));
	return [
		{
			id: 'workspace',
			label: localize('usage.customization.column.workspace'),
			sortValue: row => row.workspaceName,
			render: row => {
				const badge = hasNoCustomization(row)
					? ` <span style="font-family: sans-serif; vertical-align: middle;">${statusBadgeHtml('⚠️', localize('usage.customization.badge.noCustomization'))}</span>`
					: '';
				const title = row.workspacePath || row.workspaceName;
				return { html: `<span class="customization-workspace-name" title="${escapeHtml(title)}">${escapeHtml(row.workspaceName)}</span>${badge}` };
			},
		},
		{
			id: 'sessions',
			label: localize('usage.customization.column.sessions'),
			align: 'right',
			sortValue: row => row.sessionCount,
			render: row => String(row.sessionCount),
		},
		{
			id: 'interactions',
			label: localize('usage.customization.column.interactions'),
			align: 'right',
			sortValue: row => row.interactionCount,
			render: row => String(row.interactionCount),
		},
		...typeColumns,
	];
}

/** Renders only the paged table root, so sort/page/filter can swap it in place. */
export function renderCustomizationTable(matrix: WorkspaceCustomizationMatrix): string {
	return renderPagedTable({
		tableId: CUSTOMIZATION_TABLE_ID,
		ariaLabel: localize('usage.customization.aria.table'),
		rows: matrix.workspaces,
		columns: buildCustomizationColumns(matrix),
		initialSortColumn: 'interactions',
		initialSortDirection: 'desc',
		defaultFilters: { [CUSTOMIZATION_FILTER_NONE_ONLY]: false },
		filterRows: (row, filters) => !filters[CUSTOMIZATION_FILTER_NONE_ONLY] || hasNoCustomization(row),
		emptyMessage: localize('usage.pagedTable.noRows'),
		pageSize: CUSTOMIZATION_PAGE_SIZE,
	});
}

function buildLegendHtml(matrix: WorkspaceCustomizationMatrix): string {
	return `
			<div style="margin-top: 12px; font-size: 10px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 8px;">
				<div style="display: flex; gap: 16px; flex-wrap: wrap;">
					${(matrix.customizationTypes ?? []).map(type => `
						<span>${escapeHtml(type.icon)} ${escapeHtml(type.label)}</span>
					`).join('')}
				</div>
				<div style="margin-top: 8px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('✅', localize('usage.customization.status.fresh'))} ${escapeHtml(localize('usage.customization.legend.fresh'))}</span>
					<span style="color: var(--text-muted);">•</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('⚠️', localize('usage.customization.status.stale'))} ${escapeHtml(localize('usage.customization.legend.stale'))}</span>
					<span style="color: var(--text-muted);">•</span>
					<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('❌', localize('usage.customization.status.missing'))} ${escapeHtml(localize('usage.customization.legend.missing'))}</span>
				</div>
			</div>`;
}

export function buildCustomizationSectionHtml(matrix: WorkspaceCustomizationMatrix | null): string {
	currentMatrix = matrix && Array.isArray(matrix.workspaces) && matrix.workspaces.length > 0 ? matrix : null;
	if (!currentMatrix) {
		return `
			<div class="section">
				<div class="section-title"><span>🛠️</span><span>${escapeHtml(localize('usage.customization.title'))}</span></div>
				<div class="section-subtitle">${escapeHtml(localize('usage.customization.emptySubtitle'))}</div>
				<div style="color: var(--text-muted); padding:12px;">${escapeHtml(localize('usage.customization.empty'))}</div>
			</div>`;
	}
	const state = getPagedTableState(CUSTOMIZATION_TABLE_ID, 'interactions', 'desc', { [CUSTOMIZATION_FILTER_NONE_ONLY]: false });
	const noneOnly = state.filters[CUSTOMIZATION_FILTER_NONE_ONLY] === true;
	const filterToggle = currentMatrix.workspacesWithIssues > 0
		? `<label style="display:inline-flex;align-items:center;gap:6px;font-size:11px;color:var(--text-secondary);cursor:pointer;margin-bottom:8px;">
				<input type="checkbox" data-paged-table="${CUSTOMIZATION_TABLE_ID}" data-paged-table-filter="${CUSTOMIZATION_FILTER_NONE_ONLY}"${noneOnly ? ' checked' : ''} style="margin:0;cursor:pointer;">
				${escapeHtml(localize('usage.customization.filter.noCustomizationOnly'))}
			</label>`
		: '';
	return `
		<div id="${SECTION_ID}" style="margin-top: 16px; margin-bottom: 16px; padding: 12px; background: var(--bg-tertiary); border: 1px solid var(--border-color); border-radius: 6px;">
			<div style="font-size: 13px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">
				🛠️ ${escapeHtml(localize('usage.customization.title'))}
			</div>
			<div style="font-size: 11px; color: var(--text-secondary); margin-bottom: 12px; display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
				${escapeHtml(localizeFormat('usage.customization.summary', currentMatrix.totalWorkspaces))}
				${currentMatrix.workspacesWithIssues > 0
					? `<span class="stale-warning" style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('⚠️')} ${escapeHtml(localizeFormat('usage.customization.summary.issues', currentMatrix.workspacesWithIssues))}</span>`
					: `<span style="display:inline-flex;align-items:center;gap:4px;">${statusBadgeHtml('✅')} ${escapeHtml(localize('usage.customization.summary.allGood'))}</span>`}
			</div>
			${filterToggle}
			<span id="customization-table-status" class="paged-table-status" role="status" aria-live="polite" aria-atomic="true"></span>
			<div class="customization-matrix-container customization-paged">
				${renderCustomizationTable(currentMatrix)}
			</div>
			${buildLegendHtml(currentMatrix)}
		</div>`;
}

function rerenderCustomizationTable(section: HTMLElement, sorted: boolean): void {
	if (!currentMatrix) { return; }
	const root = section.querySelector<HTMLElement>(`#paged-table-root-${CUSTOMIZATION_TABLE_ID}`);
	if (!root) { return; }
	const focusTarget = getPagedTableFocusTarget(section, document.activeElement);
	const staging = document.createElement('div');
	setHtml(staging, renderCustomizationTable(currentMatrix));
	const replacement = staging.firstElementChild;
	if (!(replacement instanceof HTMLElement)) { return; }
	const announcement = getPagedTableAnnouncement(replacement, sorted);
	root.replaceWith(replacement);
	restorePagedTableFocus(section, focusTarget);
	const status = section.querySelector<HTMLElement>('#customization-table-status');
	if (status) { status.textContent = announcement; }
}

/** Applies a click on a sort header, pager button or filter toggle; undefined when it was none of those. */
export function applyCustomizationTableAction(target: Element): 'sort' | 'page' | 'filter' | undefined {
	const sortButton = target.closest<HTMLButtonElement>('[data-paged-sort]');
	if (sortButton?.getAttribute('data-paged-table') === CUSTOMIZATION_TABLE_ID) {
		const columnId = sortButton.getAttribute('data-paged-sort');
		if (columnId) { setPagedTableSort(CUSTOMIZATION_TABLE_ID, columnId); return 'sort'; }
	}
	const pageButton = target.closest<HTMLButtonElement>('[data-paged-page]');
	if (pageButton?.getAttribute('data-paged-table') === CUSTOMIZATION_TABLE_ID) {
		const page = Number(pageButton.getAttribute('data-paged-page'));
		if (Number.isFinite(page)) { setPagedTablePage(CUSTOMIZATION_TABLE_ID, page); return 'page'; }
	}
	const filterInput = target.closest<HTMLInputElement>('[data-paged-table-filter]');
	if (filterInput?.getAttribute('data-paged-table') === CUSTOMIZATION_TABLE_ID) {
		const filterId = filterInput.getAttribute('data-paged-table-filter');
		if (filterId) { setPagedTableFilter(CUSTOMIZATION_TABLE_ID, filterId, filterInput.checked); return 'filter'; }
	}
	return undefined;
}

/** One delegated listener on the section, so re-rendering a page cannot orphan handlers. */
export function wireCustomizationMatrixSection(): void {
	const section = document.getElementById(SECTION_ID);
	if (!section || section.dataset.customizationWired === 'true') { return; }
	section.dataset.customizationWired = 'true';
	section.addEventListener('click', event => {
		const target = event.target;
		if (!(target instanceof Element)) { return; }
		const action = applyCustomizationTableAction(target);
		if (action) { rerenderCustomizationTable(section, action === 'sort'); }
	});
}

