// Markup for the Usage Analysis two-level tab strip.
//
// Split out of main.ts rather than left inline for two reasons: that file sits against the 6000
// counted-line ceiling `eslint.config.mjs` enforces, and a strip built from plain inputs can be
// asserted on in a Node test without standing up the whole webview.
//
// Everything the strip needs arrives in `UsageTabStripInput` — no module state is read here, so
// the group/leaf layout is a pure function of the active tab and the few badge counts.
import { escapeHtml } from '../shared/formatUtils';
import { localize } from '../shared/localization';
import { USAGE_TAB_GROUPS, groupOfUsageTab } from './tabGroups';

/** What the strip needs to render: the selected tab, the badge counts, and the readiness button. */
export interface UsageTabStripInput {
	activeTab: string;
	/** Insights whose status is still `new`; drives the Insights badge. */
	newInsightCount: number;
	/** Sessions carrying correction moments; drives the Corrections badge. */
	correctionSessionCount: number;
	/**
	 * The AI Readiness button, rendered by `DarkFactoryTab` in main.ts. Passed in because that
	 * tab owns its own markup and lifecycle, and importing it here would drag the whole tab in.
	 */
	readinessButtonHtml: string;
}

/** A count badge, or nothing at all when the count is zero. */
function tabBadgeHtml(count: number, rgba: string): string {
	if (count <= 0) { return ''; }
	return ` <span style="background:${rgba};border-radius:10px;padding:1px 6px;font-size:11px;">${count}</span>`;
}

/** The leaf tab buttons, keyed by tab id, so the strip builder can lay them out by group. */
export function usageLeafTabButtons(input: UsageTabStripInput): Record<string, string> {
	const btn = (tab: string, icon: string, label: string, extra = ''): string =>
		`<button class="tab-button ${input.activeTab === tab ? 'active' : ''}" data-tab="${tab}"><span class="codicon codicon-${icon}"></span> ${label}${extra}</button>`;
	return {
		activity: btn('activity', 'pulse', 'My Activity'),
		sessions: btn('sessions', 'history', 'Recent Sessions'),
		tools: btn('tools', 'tools', 'Tools &amp; Integrations'),
		health: btn('health', 'server-environment', 'Workspace Health'),
		repos: btn('repos', 'git-pull-request', 'Repository PRs'),
		agent: btn('agent', 'cloud', 'Cloud Agent'),
		readiness: input.readinessButtonHtml,
		worktrees: btn('worktrees', 'git-branch', 'Worktrees'),
		insights: btn('insights', 'lightbulb', 'Insights', tabBadgeHtml(input.newInsightCount, 'rgba(96,165,250,0.4)')),
		corrections: btn('corrections', 'debug-restart', 'Corrections', tabBadgeHtml(input.correctionSessionCount, 'rgba(251,191,36,0.4)')),
	};
}

/**
 * Two-level tab strip: a row of group tabs above the leaf tabs of whichever group is showing.
 *
 * Only the leaf bar for the active tab's group is rendered visible; the others are laid out but
 * hidden, so `activateUsageTab` can reveal one without a re-render. Leaf tab ids are untouched —
 * see the note in tabGroups.ts for why that matters.
 */
export function buildTabStripHtml(input: UsageTabStripInput): string {
	const buttons = usageLeafTabButtons(input);
	const activeGroup = groupOfUsageTab(input.activeTab);
	const groupBar = USAGE_TAB_GROUPS.map(group =>
		`<button class="group-tab ${group.id === activeGroup ? 'active' : ''}" data-group="${group.id}" aria-pressed="${group.id === activeGroup}"><span class="codicon codicon-${group.icon}" aria-hidden="true"></span> ${escapeHtml(localize(group.labelKey))}</button>`
	).join('\n\t\t\t\t');
	const leafBars = USAGE_TAB_GROUPS.map(group =>
		`<div class="tab-bar leaf-tabs" data-group="${group.id}"${group.id === activeGroup ? '' : ' style="display:none"'}>
				${group.tabs.map(tab => buttons[tab]).join('\n\t\t\t\t')}
			</div>`
	).join('\n\t\t\t');
	return `<div class="tab-bar group-tabs">
				${groupBar}
			</div>
			${leafBars}`;
}
