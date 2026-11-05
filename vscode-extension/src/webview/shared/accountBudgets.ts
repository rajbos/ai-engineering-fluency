/**
 * The per-account Copilot budget list. Usage Analysis › GitHub › Billing and Diagnostics › Settings ›
 * Display both show it from this one renderer, so the two cannot drift apart.
 * No DOM dependencies, so it can be unit-tested in Node.js.
 */

import { shouldListAccountBudgets } from '../../githubAccountBudgets';
import type { AccountBudgetView } from '../usage/billingStatsSanitizer';
import { escapeHtml, formatFixed } from './formatUtils';
import { localize, localizeFormat } from './localization';

/** Localized explanation for an account that has no usable budget figure. */
function accountBudgetNote(b: AccountBudgetView): string {
	if (b.status === 'no-quota') { return localize('accountBudgets.noQuota'); }
	if (b.reason === 'no-session') { return localize('accountBudgets.noSession'); }
	if (b.reason === 'lookup-failed') { return localizeFormat('accountBudgets.lookupFailed', b.detail ?? ''); }
	return b.detail ?? localize('accountBudgets.unavailable');
}

/** One account's row in the per-account budget list. */
function accountBudgetRowHtml(b: AccountBudgetView): string {
	const plan = b.planName ? ` <span style="color:var(--text-muted);">(${escapeHtml(b.planName)})</span>` : '';
	const name = `<span style="font-weight:600;">${escapeHtml(b.label)}</span>${plan}`;
	if (b.status !== 'ok' || !b.balance) {
		const note = escapeHtml(accountBudgetNote(b));
		return `<div style="display:flex; justify-content:space-between; gap:12px; font-size:12px;"><span>${name}</span><span style="color:var(--text-muted);">${note}</span></div>`;
	}
	const usedPct = Math.min(100, Math.max(0, 100 - b.balance.pctAvailable));
	const color = usedPct > 90 ? 'var(--error-color, #f14c4c)' : usedPct > 75 ? 'var(--warning-color, #cca700)' : 'var(--accent-color, #4d9cf8)';
	const reset = b.resetDate ? ` · ${escapeHtml(localizeFormat('accountBudgets.resets', b.resetDate.slice(0, 10)))}` : '';
	// The bar width is CSS, so it stays locale-independent; formatFixed would write "12,50%" in some locales.
	return `
		<div style="font-size:12px;">
			<div style="display:flex; justify-content:space-between; gap:12px; margin-bottom:4px;">
				<span>${name}</span>
				<span>${escapeHtml(localizeFormat('accountBudgets.usedLeft', '$' + formatFixed(b.balance.usedAiCredits / 100, 2), '$' + formatFixed(b.balance.budgetUsd, 2), formatFixed(b.balance.pctAvailable, 1)))}${reset}</span>
			</div>
			<div style="height:6px; border-radius:3px; background:var(--border-subtle); overflow:hidden;"><div style="height:100%; width:${usedPct.toFixed(2)}%; background:${color};"></div></div>
		</div>`;
}

/**
 * Budget per GitHub account. Omitted only for a lone account with a balance when `balanceShownElsewhere`
 * says the surrounding card already shows that figure.
 */
export function accountBudgetsHtml(accounts: readonly AccountBudgetView[] | undefined, balanceShownElsewhere: boolean): string {
	const list = accounts ?? [];
	if (!shouldListAccountBudgets(list, balanceShownElsewhere)) { return ''; }
	return `
		<div style="margin-bottom:12px;">
			<div style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-bottom:6px;">${escapeHtml(localize('accountBudgets.title'))}</div>
			<div style="background:var(--bg-tertiary); border:1px solid var(--border-subtle); border-radius:6px; padding:12px 14px; display:flex; flex-direction:column; gap:10px; color:var(--text-primary);">
				${list.map(accountBudgetRowHtml).join('')}
			</div>
		</div>`;
}
