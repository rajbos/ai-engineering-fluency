/**
 * Pure helpers for the "AI Billing Coverage" provider-cost table in the usage panel.
 * Extracted from main.ts (no DOM / CSS dependencies) so they can be unit-tested in Node.js.
 *
 * billingOtherSessionsCostUsd() computes the Copilot spend the API reports but the extension
 * has no local session data for (github.com/copilot web chat, cloud agent, review agent, or a
 * different device/environment). billingExtGroupCostsHtml() renders the extension-tracked
 * provider→cost table, injecting an "other sessions" row when that gap exceeds the display
 * threshold.
 */

import { escapeHtml, formatFixed } from '../shared/formatUtils';
import type { CopilotApiBalance } from './billingStatsSanitizer';

/** Cost of Copilot usage the API reports but the extension has no local session data for
 *  (github.com/copilot web chat, cloud agent, review agent, or a different device/environment). */
export function billingOtherSessionsCostUsd(groupCosts: Record<string, number>, api: CopilotApiBalance | null | undefined): number {
	if (!api) { return 0; }
	const copilotCostUsd = groupCosts['GitHub Copilot'] ?? 0;
	return Math.max(0, (api.usedAiCredits * 0.01) - copilotCostUsd);
}

export function billingExtGroupCostsHtml(groupCosts: Record<string, number>, api: CopilotApiBalance | null | undefined): string {
	const otherSessionsCostUsd = billingOtherSessionsCostUsd(groupCosts, api);
	const hasLocalCopilotRow = 'GitHub Copilot' in groupCosts;
	const totalCostUsd = Object.values(groupCosts).reduce((s, v) => s + v, 0) + otherSessionsCostUsd;
	const otherSessionsRowHtml = otherSessionsCostUsd > 0.001
		? `<tr>
			<td style="padding:4px 8px; font-size:12px; color:var(--text-secondary);">GitHub Copilot - other sessions (remote or different environment)</td>
			<td style="padding:4px 8px; font-size:12px; color:var(--text-secondary); text-align:right;">$${formatFixed(otherSessionsCostUsd, 2)}</td>
		</tr>`
		: '';
	const rows = Object.entries(groupCosts)
		.sort(([, a], [, b]) => b - a)
		.map(([group, cost]) => {
			const label = group === 'GitHub Copilot' ? 'GitHub Copilot - local sessions' : group;
			return `
				<tr>
					<td style="padding:4px 8px; font-size:12px; color:var(--text-primary);">${escapeHtml(label)}</td>
					<td style="padding:4px 8px; font-size:12px; color:var(--text-primary); text-align:right;">$${formatFixed(cost, 2)}</td>
				</tr>${group === 'GitHub Copilot' ? otherSessionsRowHtml : ''}`;
		}).join('') + (hasLocalCopilotRow ? '' : otherSessionsRowHtml);
	return `
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">Extension tracked (this calendar month, IDE sessions only)</div>
			<table style="width:100%; border-collapse:collapse; border:1px solid var(--border-subtle); border-radius:6px; overflow:hidden;">
				<thead>
					<tr style="background:var(--bg-tertiary);">
						<th style="padding:6px 8px; text-align:left; font-size:11px; color:var(--text-secondary); font-weight:600;">Provider</th>
						<th style="padding:6px 8px; text-align:right; font-size:11px; color:var(--text-secondary); font-weight:600;">Estimated cost</th>
					</tr>
				</thead>
				<tbody>${rows}</tbody>
				<tfoot>
					<tr style="border-top:1px solid var(--border-color);">
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary);">Total</td>
						<td style="padding:6px 8px; font-size:12px; font-weight:600; color:var(--text-primary); text-align:right;">$${formatFixed(totalCostUsd, 2)}</td>
					</tr>
				</tfoot>
			</table>
		</div>`;
}
