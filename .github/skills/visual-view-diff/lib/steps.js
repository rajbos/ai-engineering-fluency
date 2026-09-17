'use strict';

/**
 * Replays declared UI steps on a rendered view page.
 *
 * A step is `{ "click": "<selector>" }` or `{ "select": "<selector>", "value"?: "<option>" }`
 * — the same shape `views.config.json` uses for interaction-smoke `scenarios`,
 * so a view's `states` (the tabs and modes the visual diff screenshots) and its
 * scenarios read alike and share one vocabulary.
 *
 * This module only drives the page. What to conclude from a step — a smoke
 * finding, a screenshot, an error — is the caller's business.
 */

/**
 * Runs inside the page. Picks the value a `select` step should switch to: the
 * declared one, or the first enabled option that is not already selected.
 * `noop` means the select has nothing else to offer, which is a legitimate
 * no-op rather than a failure.
 */
const PICK_OPTION = ([selector, wanted]) => {
	const el = document.querySelector(selector);
	if (!el) {
		return { missing: true };
	}
	const options = Array.from(el.options).filter((o) => !o.disabled);
	if (wanted !== null && wanted !== undefined) {
		return options.some((o) => o.value === wanted) ? { value: wanted } : { unavailable: true };
	}
	const next = options.find((o) => o.value !== el.value);
	return next ? { value: next.value } : { noop: true };
};

/**
 * Runs inside the page. "Showing" means present *and* rendered — not
 * `display:none`, not `visibility:hidden`, not zero-sized — which is the same
 * test the interaction crawl applies to a control before clicking it.
 */
const IS_SHOWING = (selector) => {
	const el = document.querySelector(selector);
	if (!el) {
		return false;
	}
	const rect = el.getBoundingClientRect();
	if (rect.width === 0 || rect.height === 0) {
		return false;
	}
	const style = window.getComputedStyle(el);
	return style.visibility !== 'hidden' && style.display !== 'none';
};

function describeStep(step) {
	return step.click ? `click ${step.click}` : `select ${step.select}${step.value ? ` = ${step.value}` : ''}`;
}

/**
 * Applies one step. Resolves to `null` on success or a short reason string on
 * failure; never throws for an ordinary "control not there" case.
 */
async function applyStep(page, step) {
	if (step.click) {
		try {
			await page.locator(step.click).first().click({ timeout: 2000, noWaitAfter: true });
			return null;
		} catch (error) {
			return `could not click: ${String(error && error.message || error).split('\n')[0]}`;
		}
	}
	if (step.select) {
		const pick = await page.evaluate(PICK_OPTION, [step.select, step.value ?? null]);
		if (pick.missing) { return 'the select is not on screen'; }
		if (pick.unavailable) { return `option '${step.value}' is not offered`; }
		if (pick.noop) { return null; }
		try {
			await page.selectOption(step.select, pick.value, { timeout: 2000 });
			return null;
		} catch (error) {
			return `could not change: ${String(error && error.message || error).split('\n')[0]}`;
		}
	}
	return 'step has neither "click" nor "select"';
}

/**
 * Applies every step in order, stopping at the first failure.
 *
 * @returns {{ ok: true } | { ok: false, step: string, reason: string }}
 */
async function applySteps(page, steps, { pauseMs = 120 } = {}) {
	for (const step of steps || []) {
		const reason = await applyStep(page, step);
		if (reason) {
			return { ok: false, step: describeStep(step), reason };
		}
		await page.waitForTimeout(pauseMs);
	}
	return { ok: true };
}

/** True when `selector` is present and rendered on the page. */
function isShowing(page, selector) {
	return page.evaluate(IS_SHOWING, selector);
}

module.exports = { PICK_OPTION, IS_SHOWING, applyStep, applySteps, isShowing, describeStep };
