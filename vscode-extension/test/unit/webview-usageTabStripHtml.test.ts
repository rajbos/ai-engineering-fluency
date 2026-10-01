import { describe, test } from 'node:test';
import * as assert from 'node:assert/strict';
import { buildTabStripHtml, usageLeafTabButtons, type UsageTabStripInput } from '../../src/webview/usage/tabStripHtml';
import { USAGE_TAB_GROUPS, allUsageTabs, groupOfUsageTab } from '../../src/webview/usage/tabGroups';

// ── Coverage for the Usage Analysis tab strip's markup ───────────────────────
//
// The strip is what makes the grouping real: a leaf bar whose group is not selected is laid out
// but hidden, and `activateUsageTab` reveals it without a re-render. Two things go wrong silently
// if that stops holding — a tab with no button at all, and more than one leaf bar visible at once
// — and neither shows up as a type error. Rendering from plain inputs is enough to assert both.

const input = (activeTab: string): UsageTabStripInput => ({
	activeTab,
	newInsightCount: 0,
	correctionSessionCount: 0,
	readinessButtonHtml: '<button class="tab-button" data-tab="readiness">AI Readiness</button>',
});

describe('usageLeafTabButtons', () => {
	test('renders a button for every tab the groups claim', () => {
		const buttons = usageLeafTabButtons(input('activity'));
		for (const tab of allUsageTabs()) {
			assert.ok(buttons[tab], `no button for "${tab}"`);
			assert.match(buttons[tab], new RegExp(`data-tab="${tab}"`));
		}
	});

	test('marks only the active tab active', () => {
		const buttons = usageLeafTabButtons(input('worktrees'));
		const active = allUsageTabs().filter(tab => buttons[tab].includes('class="tab-button active"'));
		assert.deepEqual(active, ['worktrees']);
	});

	test('shows the badge counts only when they are non-zero', () => {
		const none = usageLeafTabButtons(input('activity'));
		assert.ok(!none.insights.includes('<span style="background:rgba(96,165,250'), 'zero insights still drew a badge');
		assert.ok(!none.corrections.includes('<span style="background:rgba(251,191,36'), 'zero corrections still drew a badge');

		const some = usageLeafTabButtons({ ...input('activity'), newInsightCount: 3, correctionSessionCount: 7 });
		assert.match(some.insights, />3<\/span>/);
		assert.match(some.corrections, />7<\/span>/);
	});
});

describe('buildTabStripHtml', () => {
	test('shows exactly one leaf bar — the one owning the active tab', () => {
		for (const tab of allUsageTabs()) {
			const html = buildTabStripHtml(input(tab));
			const visible = USAGE_TAB_GROUPS
				.filter(group => !html.includes(`data-group="${group.id}" style="display:none"`))
				.map(group => group.id)
				.filter(id => html.includes(`class="tab-bar leaf-tabs" data-group="${id}"`));
			assert.deepEqual(visible, [groupOfUsageTab(tab)], `wrong leaf bar visible for "${tab}"`);
		}
	});

	test('lays out every group, so a hidden bar can be revealed without re-rendering', () => {
		const html = buildTabStripHtml(input('activity'));
		for (const group of USAGE_TAB_GROUPS) {
			assert.ok(html.includes(`class="tab-bar leaf-tabs" data-group="${group.id}"`), `${group.id} bar missing`);
		}
	});

	test('tells a screen reader which group tab is pressed', () => {
		const html = buildTabStripHtml(input('repos'));
		assert.match(html, /data-group="github" aria-pressed="true"/);
		assert.match(html, /data-group="usage" aria-pressed="false"/);
	});
});
