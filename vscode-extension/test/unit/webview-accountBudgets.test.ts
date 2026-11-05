import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';
import { accountBudgetsHtml } from '../../src/webview/shared/accountBudgets';
import { setFormatLocale } from '../../src/webview/shared/formatUtils';
import type { AccountBudgetView } from '../../src/webview/usage/billingStatsSanitizer';

function okAccount(label: string, pctAvailable: number): AccountBudgetView {
	return {
		accountId: label,
		label,
		status: 'ok',
		planName: 'Copilot Pro',
		resetDate: '2026-12-01T00:00:00.000Z',
		balance: { budgetUsd: 39, budgetAiCredits: 3900, remainingAiCredits: 1500, usedAiCredits: 2400, pctAvailable },
	};
}

describe('accountBudgetsHtml', () => {
	setFormatLocale('en-US');

	test('renders nothing without accounts, or for a lone balance the surrounding card already shows', () => {
		assert.equal(accountBudgetsHtml(undefined, false), '');
		assert.equal(accountBudgetsHtml([], false), '');
		assert.equal(accountBudgetsHtml([okAccount('alice', 38.5)], true), '');
	});

	test('a lone balance is listed when nothing else shows it', () => {
		assert.ok(accountBudgetsHtml([okAccount('alice', 38.5)], false).includes('alice'));
	});

	test('an account with a balance shows used, budget, percentage left, reset date and a bar', () => {
		const html = accountBudgetsHtml([okAccount('alice', 38.5), okAccount('bob', 50)], true);
		assert.ok(html.includes('GitHub accounts in VS Code'));
		assert.ok(html.includes('(Copilot Pro)'));
		assert.ok(html.includes('$24.00 / $39.00 used · 38.5% left'));
		assert.ok(html.includes('resets 2026-12-01'));
		assert.ok(html.includes('width:61.50%'));
	});

	test('the bar width stays valid CSS in a locale with a decimal comma', () => {
		setFormatLocale('de-DE');
		try {
			const html = accountBudgetsHtml([okAccount('alice', 38.5)], false);
			assert.ok(html.includes('width:61.50%'));
			assert.ok(html.includes('38,5% left'), 'the visible figures still follow the locale');
		} finally {
			setFormatLocale('en-US');
		}
	});

	test('explains each account without a usable budget', () => {
		const cases: Array<[Partial<AccountBudgetView>, string]> = [
			[{ status: 'no-quota' }, 'No metered budget on this plan'],
			[{ status: 'unavailable', reason: 'no-session' }, 'Sign in with this account from the Accounts menu to see its budget'],
			[{ status: 'unavailable', reason: 'lookup-failed', detail: 'HTTP 500' }, 'Copilot plan lookup failed (HTTP 500)'],
			[{ status: 'unavailable', reason: 'error', detail: 'boom' }, 'boom'],
			[{ status: 'unavailable' }, 'Budget unavailable'],
			[{ status: 'ok' }, 'Budget unavailable'],
		];
		for (const [fields, expected] of cases) {
			const html = accountBudgetsHtml([{ accountId: 'a', label: 'alice', status: 'unavailable', ...fields }], false);
			assert.ok(html.includes(expected), expected);
		}
	});

	test('escapes account-derived text', () => {
		const html = accountBudgetsHtml([{ accountId: 'a', label: '<b>x</b>', planName: '<i>', status: 'unavailable', detail: '<script>' }], false);
		assert.ok(!html.includes('<b>x</b>') && !html.includes('<i>') && !html.includes('<script>'));
		assert.ok(html.includes('&lt;b&gt;x&lt;/b&gt;'));
	});
});
