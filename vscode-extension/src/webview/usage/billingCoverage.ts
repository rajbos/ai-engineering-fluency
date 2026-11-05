/**
 * Pure helpers for the "AI Billing Coverage" section in the usage panel.
 * Extracted from main.ts (no DOM / CSS dependencies) so they can be unit-tested in Node.js.
 *
 * billingOtherSessionsCostUsd() computes the Copilot spend the API reports but the extension
 * has no local session data for (github.com/copilot web chat, cloud agent, review agent, or a
 * different device/environment). The per-provider cost breakdown lives in Details › Cost by
 * Provider; billingDetailsLinkHtml() points there, so this GitHub tab holds only GitHub API data
 * and the Copilot figures needed to compare against it.
 */

import { escapeHtml } from '../shared/formatUtils';
import { localize } from '../shared/localization';
import type { CopilotApiBalance } from './billingStatsSanitizer';

/** Cost of Copilot usage the API reports but the extension has no local session data for
 *  (github.com/copilot web chat, cloud agent, review agent, or a different device/environment). */
export function billingOtherSessionsCostUsd(groupCosts: Record<string, number>, api: CopilotApiBalance | null | undefined): number {
	if (!api) { return 0; }
	const copilotCostUsd = groupCosts['GitHub Copilot'] ?? 0;
	return Math.max(0, (api.usedAiCredits * 0.01) - copilotCostUsd);
}

export const BILLING_DETAILS_BUTTON_ID = 'btn-billing-details';

/** Points at Details › Cost by Provider, which owns the per-provider cost breakdown. */
export function billingDetailsLinkHtml(): string {
	return `
		<div style="margin-top:12px; font-size:12px; color:var(--text-secondary);">
			${escapeHtml(localize('usage.billing.providerCostsHint'))}
			<button type="button" id="${BILLING_DETAILS_BUTTON_ID}" style="background:none; border:none; padding:0; font:inherit; color:var(--link-color); text-decoration:underline; cursor:pointer;">${escapeHtml(localize('usage.billing.openDetails'))}</button>
		</div>`;
}

/**
 * Body of the GitHub › Billing tab. `sectionHtml` is the data-gated AI Billing Coverage section;
 * it is empty when there is no API balance and no multi-account budgets, in which case the tab
 * shows the same sign-in hint as the Repository PRs and Cloud Agent tabs. Locally tracked provider
 * costs do not need GitHub, so the hint still links to them.
 */
export function billingTabBodyHtml(sectionHtml: string): string {
	if (sectionHtml) { return sectionHtml; }
	return `
		<div class="section" id="section-billing-coverage">
			<div class="section-title"><span>💳</span><span>${escapeHtml(localize('usage.billing.title'))}</span></div>
			<div style="margin-top:12px; padding:12px; background:var(--bg-tertiary); border:1px solid var(--border-color); border-radius:6px; font-size:12px; color:var(--text-secondary);">
				<strong>🔒 ${escapeHtml(localize('usage.billing.signInRequired'))}</strong><br/>
				${escapeHtml(localize('usage.billing.signInHint'))}
			</div>
			${billingDetailsLinkHtml()}
		</div>`;
}
