import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';
import {
	billingOtherSessionsCostUsd,
	billingDetailsLinkHtml,
	BILLING_DETAILS_BUTTON_ID,
	billingTabBodyHtml,
} from '../../src/webview/usage/billingCoverage';
import type { CopilotApiBalance } from '../../src/webview/usage/billingStatsSanitizer';
import { setFormatLocale } from '../../src/webview/shared/formatUtils';

// Lock the locale so cost assertions ("$4.00") don't depend on the machine's default locale.
setFormatLocale('en-US');

// ── Coverage for the untracked Copilot gap (PR #1872) ──────────────────────────
//
// AI Billing Coverage compares what the extension tracks locally with what the Copilot API
// reports across all channels. These tests lock in the two behaviors of the gap between
// them that would otherwise regress silently:
//   - the Math.max(0, ...) clamp in billingOtherSessionsCostUsd (API reporting *less*
//     than the locally tracked cost must not produce a negative gap), and
//   - the api-null guard (no API quota snapshot yet → no gap, no crash).

function makeApi(usedAiCredits: number): CopilotApiBalance {
	return {
		budgetUsd: 39,
		budgetAiCredits: 3900,
		remainingAiCredits: 3900 - usedAiCredits,
		usedAiCredits,
		pctAvailable: ((3900 - usedAiCredits) / 3900) * 100,
	};
}

describe('billingOtherSessionsCostUsd', () => {
	test('returns 0 when api is null or undefined', () => {
		const groupCosts = { 'GitHub Copilot': 5 };
		assert.equal(billingOtherSessionsCostUsd(groupCosts, null), 0);
		assert.equal(billingOtherSessionsCostUsd(groupCosts, undefined), 0);
	});

	test('clamps to 0 when the API reports less than the local GitHub Copilot cost', () => {
		// API reports $4.00 used, but local sessions already account for $5.00.
		const groupCosts = { 'GitHub Copilot': 5 };
		assert.equal(billingOtherSessionsCostUsd(groupCosts, makeApi(400)), 0);
	});

	test('returns the positive difference when the API reports more than locally tracked', () => {
		// API reports $10.00 used, local sessions account for $6.00 → $4.00 elsewhere.
		const groupCosts = { 'GitHub Copilot': 6 };
		assert.equal(billingOtherSessionsCostUsd(groupCosts, makeApi(1000)), 4);
	});

	test('treats a missing GitHub Copilot key as 0 local cost', () => {
		// API reports $10.00 used, no local Copilot sessions at all → full $10.00 elsewhere.
		const groupCosts = { 'Claude Code': 3 };
		assert.equal(billingOtherSessionsCostUsd(groupCosts, makeApi(1000)), 10);
	});

	test('returns 0 when api reports zero usage', () => {
		assert.equal(billingOtherSessionsCostUsd({}, makeApi(0)), 0);
	});
});

describe('billingDetailsLinkHtml', () => {
	test('points at Cost by Provider through the button the panel wires to showDetails', () => {
		const html = billingDetailsLinkHtml();
		assert.ok(html.includes(`id="${BILLING_DETAILS_BUTTON_ID}"`));
		assert.ok(html.includes('Estimated costs per provider are in the Details view.'));
		assert.ok(html.includes('Open Cost by Provider'));
	});
});

describe('billingTabBodyHtml', () => {
	test('no billing data (signed out): renders the GitHub authentication hint', () => {
		const html = billingTabBodyHtml('');
		assert.match(html, /id="section-billing-coverage"/);
		assert.match(html, /GitHub authentication required/);
		assert.match(html, /Sign in with GitHub \(Diagnostics › Settings › GitHub Auth\)/);
		assert.ok(html.includes(`id="${BILLING_DETAILS_BUTTON_ID}"`), 'local provider costs need no GitHub sign-in, so the link stays');
	});

	test('billing data present: passes the gated section through unchanged', () => {
		const section = '<div class="section" id="section-billing-coverage">data</div>';
		assert.equal(billingTabBodyHtml(section), section);
	});
});
