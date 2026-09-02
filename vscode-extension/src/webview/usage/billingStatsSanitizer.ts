/**
 * Pure data-sanitization helpers for the Copilot billing / quota fields received via postMessage.
 * Extracted into its own module (no DOM / CSS dependencies) so it can be unit-tested in Node.js.
 *
 * These fields (copilotApiBalance, monthBillingGroupCosts) feed the "Copilot Billing Coverage"
 * section of the usage panel. They live here — rather than inline in sanitizeStats — so a
 * regression test can guarantee they survive the periodic `updateStats` refresh. They used to be
 * dropped on the first timer refresh because sanitizeStats rebuilds the stats object field-by-field
 * and never copied them, so the whole billing-coverage section silently disappeared.
 */

/** Copilot API quota balance snapshot shown in the usage panel's billing coverage section. */
export type CopilotApiBalance = {
	/** Monthly budget in USD (entitlement / 100). */
	budgetUsd: number;
	/** Monthly budget in AI Credits (budgetUsd * 100). */
	budgetAiCredits: number;
	/** Remaining AI Credits from the API quota snapshot. */
	remainingAiCredits: number;
	/** AI Credits consumed across all channels (IDE, web, cloud agent, review agent). */
	usedAiCredits: number;
	/** Percentage of budget still available. */
	pctAvailable: number;
};

/** The subset of stats fields this module owns (a structural subset of UsageAnalysisStats). */
export interface BillingStatsFields {
	copilotApiBalance?: CopilotApiBalance | null;
	monthBillingGroupCosts?: Record<string, number> | null;
}

function finiteNumber(value: unknown): number {
	return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

/** Sanitizes a raw (untrusted) Copilot API balance snapshot. Returns null for non-objects. */
export function sanitizeCopilotApiBalance(raw: unknown): CopilotApiBalance | null {
	if (!raw || typeof raw !== 'object') { return null; }
	const r = raw as Record<string, unknown>;
	return {
		budgetUsd: finiteNumber(r.budgetUsd),
		budgetAiCredits: finiteNumber(r.budgetAiCredits),
		remainingAiCredits: finiteNumber(r.remainingAiCredits),
		usedAiCredits: finiteNumber(r.usedAiCredits),
		pctAvailable: finiteNumber(r.pctAvailable),
	};
}

/** Sanitizes a raw (untrusted) provider→cost map, keeping only finite numeric entries. */
export function sanitizeBillingGroupCosts(raw: unknown): Record<string, number> | null {
	if (!raw || typeof raw !== 'object') { return null; }
	const result: Record<string, number> = {};
	for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
		if (typeof value === 'number' && Number.isFinite(value)) {
			result[key] = value;
		}
	}
	return result;
}

/**
 * Copies the sanitized billing fields from a raw stats payload onto a target stats object.
 *
 * sanitizeStats() rebuilds the stats object field-by-field on every `updateStats` (timer) refresh.
 * Calling this keeps the billing-coverage data alive across refreshes; without it the whole
 * "Copilot Billing Coverage" section disappeared after the first refresh.
 */
export function applyBillingFields(target: BillingStatsFields, raw: unknown): void {
	if (!raw || typeof raw !== 'object') { return; }
	const r = raw as Record<string, unknown>;
	const apiBalance = sanitizeCopilotApiBalance(r.copilotApiBalance);
	if (apiBalance) { target.copilotApiBalance = apiBalance; }
	const billingCosts = sanitizeBillingGroupCosts(r.monthBillingGroupCosts);
	if (billingCosts) { target.monthBillingGroupCosts = billingCosts; }
}
