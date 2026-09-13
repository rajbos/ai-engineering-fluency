// Renders the Efficiency view's "Model mix movement" table — the per-model token
// share behind the Cost Attribution tab's model-mix bar.
//
// A pure string builder with no CSS/DOM imports (same contract as
// logviewer/hydraFusionSection.ts) so the markup is unit-testable directly in
// Node, unlike main.ts.
//
// @security model identifiers come from session data and are therefore
// untrusted; every one of them goes through `escapeHtml` before rendering.

import { escapeHtml, formatFixed, formatPercent } from '../shared/formatUtils';
import { localize, localizeFormat } from '../shared/localization';
import { getModelDisplayName } from '../../../../src/webview/shared/modelUtils';
import type { EfficiencyViewData, ModelMixShift } from '../../../../src/efficiencyAnalysis';

/**
 * Builds the model-mix movement table.
 *
 * Model names are resolved here rather than in `buildModelShifts()`: the
 * analytics layer keeps canonical ids, and `getModelDisplayName()` only has a
 * pricing map to resolve them against inside the webview, where the host
 * injects `window.__MODEL_PRICING__`. Unknown ids fall through that helper
 * unchanged, so a custom or brand-new model stays unique and inspectable
 * instead of being relabelled with a guess.
 *
 * The table is capped at a readable desktop width and wrapped in a focusable
 * scroll region, so a narrow panel scrolls horizontally instead of squeezing
 * the numbers out. Only the model name truncates visually — its friendly and
 * canonical forms both stay available, through the cell's title and its
 * screen-reader text.
 *
 * Row order, the 0.5-point noise threshold and the six-row cap are all decided
 * by `buildModelShifts()`; this renderer never re-filters or re-sorts.
 */
export function renderModelMixTable(
	shifts: ModelMixShift[],
	windows: EfficiencyViewData['attributionWindows'],
): string {
	const rows = shifts.map(shift => renderShiftRow(shift)).join('');
	return `
		<h3 id="attr-shift-heading">${escapeHtml(localize('efficiency.modelMix.heading'))}</h3>
		<div class="attr-shift-scroll" role="region" tabindex="0" aria-labelledby="attr-shift-heading">
			<table class="attr-shift-table attr-model-mix">
				<caption class="attr-shift-sr">${escapeHtml(localizeFormat('efficiency.modelMix.caption', windows.prevRange, windows.curRange))}</caption>
				<thead>
					<tr>
						<th scope="col" class="attr-shift-model">${escapeHtml(localize('efficiency.modelMix.model'))}</th>
						<th scope="col" class="num">${escapeHtml(localize('efficiency.modelMix.previous'))}<span class="th-sub">${escapeHtml(windows.prevRange)}</span></th>
						<th scope="col" class="num">${escapeHtml(localize('efficiency.modelMix.current'))}<span class="th-sub">${escapeHtml(windows.curRange)}</span></th>
						<th scope="col" class="num">${escapeHtml(localize('efficiency.modelMix.shift'))}</th>
					</tr>
				</thead>
				<tbody>${rows}
				</tbody>
			</table>
		</div>`;
}

function renderShiftRow(shift: ModelMixShift): string {
	const displayName = getModelDisplayName(shift.model);
	// When the friendly name already *is* the canonical id there is nothing extra
	// to disclose — repeating it would only make the screen-reader row noisier.
	const sameAsId = displayName === shift.model;
	const title = sameAsId ? displayName : `${displayName} — ${shift.model}`;
	// The leading space matters: without it the accessible name computation runs the
	// two spans together and the row is announced as "GPT-4oModel ID: gpt-4o".
	const canonical = sameAsId
		? ''
		: `<span class="attr-shift-sr"> ${escapeHtml(localizeFormat('efficiency.modelMix.canonicalId', shift.model))}</span>`;
	const points = `${shift.deltaShare > 0 ? '+' : ''}${formatFixed(shift.deltaShare * 100, 1)}`;
	return `
					<tr>
						<th scope="row" class="attr-shift-model"><span class="attr-shift-name" title="${escapeHtml(title)}">${escapeHtml(displayName)}</span>${canonical}</th>
						<td class="num">${escapeHtml(formatPercent(shift.prevShare * 100))}</td>
						<td class="num">${escapeHtml(formatPercent(shift.curShare * 100))}</td>
						<td class="num ${shift.deltaShare > 0 ? 'share-up' : 'share-down'}">${escapeHtml(localizeFormat('efficiency.modelMix.shiftPoints', points))}</td>
					</tr>`;
}
