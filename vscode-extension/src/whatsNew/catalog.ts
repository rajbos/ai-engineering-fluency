/**
 * Declarative catalog of what shipped in each release, in plain English.
 *
 * This file is the single source of truth for two things:
 *
 *   1. The **What's New** view — it renders the most recent
 *      {@link WHATS_NEW_MAX_RELEASES} entries below as readable prose. It is
 *      deliberately *not* the CHANGELOG: the changelog is written for people
 *      reading a diff ("Fix `Other` row sorting into the top-N list"), this is
 *      written for someone who just wants to know what they can now do.
 *   2. The one-at-a-time "new here" notifications — every entry in `features`
 *      names the exact surface it added, so the announcer can skip anything
 *      the user already found on their own, and the notification's button can
 *      open it.
 *
 * ## Adding a release
 *
 * Prepend a new {@link WhatsNewRelease} (newest first) when you bump the
 * extension version. Only list things a *user* can point at — a new view, a
 * new tab, a new section on an existing tab. Bug fixes and refactors belong in
 * the changelog, not here.
 *
 * Keep `features` short. The announcer only ever announces
 * {@link WHATS_NEW_MAX_ANNOUNCEMENTS_PER_RELEASE} of them per release, so a
 * list of ten is nine items of noise and one item of signal; put the ones that
 * matter first.
 *
 * Feature `id`s are persisted in globalState to remember what a user has
 * already been told. **Never reuse or renumber an id** — a recycled id silently
 * suppresses the announcement for everyone who saw the old feature.
 *
 * Run `node .github/skills/whats-new-catalog/whats-new-catalog.js` after editing:
 * it catches a missing entry for the current version, a surface pointing at a
 * view or tab that no longer exists, and features sitting below the
 * announcement cap. See `.github/skills/whats-new-catalog/SKILL.md`.
 */

/** The webview panels a feature can live in. Matches the esbuild entry point names. */
export type FeatureViewId =
	| 'details'
	| 'chart'
	| 'usage'
	| 'maturity'
	| 'efficiency'
	| 'environmental'
	| 'diagnostics'
	| 'logviewer'
	| 'fluency-level-viewer'
	| 'dashboard'
	| 'whatsnew';

/**
 * Where a feature lives, precise enough both to open it and to tell whether the
 * user has already been there.
 */
export interface FeatureSurface {
	/** The panel the feature lives in. */
	readonly view: FeatureViewId;
	/** Tab within that panel, when the panel has tabs (`data-tab` value). */
	readonly tab?: string;
	/** DOM id to scroll to once the tab is open, for section-level features. */
	readonly anchor?: string;
}

/**
 * What kind of thing was added. Only drives the wording of the notification
 * ("New view" / "New tab" / "New section"), so the toast reads naturally
 * without every catalog entry having to repeat itself.
 */
export type FeatureKind = 'view' | 'tab' | 'section';

export interface WhatsNewFeature {
	/** Stable id, persisted in globalState. Never reuse one. */
	readonly id: string;
	/** Short noun phrase, as it reads in the UI ("Corrections tab"). */
	readonly title: string;
	/** One or two sentences of plain English: what it shows and why you'd look. */
	readonly description: string;
	readonly kind: FeatureKind;
	readonly surface: FeatureSurface;
}

export interface WhatsNewRelease {
	/** Extension version, e.g. `0.17.3`. */
	readonly version: string;
	/** Release date as `YYYY-MM-DD`, or `null` while the version is unreleased. */
	readonly date: string | null;
	/** One sentence summing the release up for someone who skipped the details. */
	readonly headline: string;
	readonly features: readonly WhatsNewFeature[];
}

/** How many releases the What's New view lists. */
export const WHATS_NEW_MAX_RELEASES = 5;

/** How many features from a single release may ever be announced as a toast. */
export const WHATS_NEW_MAX_ANNOUNCEMENTS_PER_RELEASE = 3;

/**
 * Stop announcing features from a release once it is this old, so someone
 * upgrading after a long break gets the What's New view rather than a fortnight
 * of daily toasts about things that are no longer news.
 */
export const WHATS_NEW_MAX_ANNOUNCEMENT_AGE_DAYS = 60;

/**
 * Releases, newest first. See the file header before editing.
 */
export const WHATS_NEW_RELEASES: readonly WhatsNewRelease[] = [
	{
		version: '0.17.3',
		date: null,
		headline:
			'This release is about noticing patterns you would otherwise have to spot yourself: what a model router did off screen, where the agent had to backtrack, which prompts you keep retyping, and how quickly models actually start answering.',
		features: [
			{
				id: 'logviewer.hydrafusion-routing',
				title: 'HydraFusion Routing',
				description:
					'When a Copilot CLI session runs on HydraFusion, several models draft, judge and repair one answer behind the scenes and you are shown one result and one credit number. This section opens that up: which models ran, who rejected whom, which leg you actually read, and what share of the credits went on review rather than on the answer.',
				kind: 'section',
				surface: { view: 'logviewer', anchor: 'section-hydrafusion-routing' },
			},
			{
				id: 'usage.corrections-tab',
				title: 'Corrections tab',
				description:
					'Shows the moments where things went sideways — a tool call that failed, an edit the agent immediately redid, a "sorry, let me try that again" — grouped per repository. A good place to look when a session felt like hard work but you cannot say why.',
				kind: 'tab',
				surface: { view: 'usage', tab: 'corrections' },
			},
			{
				id: 'usage.skill-suggestions',
				title: 'Skill Suggestions',
				description:
					'Clusters the opening prompt of your recent sessions to find the task you keep asking for by hand. Each cluster is a candidate for a reusable skill, prompt file, or custom agent.',
				kind: 'section',
				surface: { view: 'usage', tab: 'tools', anchor: 'section-skill-suggestions' },
			},
			{
				id: 'diagnostics.ttft-tab',
				title: 'Research → TTFT',
				description:
					'How long each model takes to start answering you, averaged by day, week, and month with a trendline. Read straight from Copilot Chat\'s own debug log, so there is nothing to switch on.',
				kind: 'tab',
				surface: { view: 'diagnostics', tab: 'ttft' },
			},
			{
				// Listed last on purpose: the per-release cap means this is never
				// announced, and it does not need to be — the notification's second
				// button is a link to this very page.
				id: 'whatsnew.view',
				title: "What's New view",
				description:
					'The last few releases in plain English, with a way in to each new view, tab, and section from here. Also where the extension sends you when it points something out.',
				kind: 'view',
				surface: { view: 'whatsnew' },
			},
		],
	},
	{
		version: '0.17.2',
		date: '2026-08-17',
		headline:
			'A maintenance release: cold-boot token counts, worktree detection, and the Recent Sessions list all stopped getting things wrong. No new screens.',
		features: [],
	},
	{
		version: '0.17.1',
		date: '2026-07-31',
		headline:
			'Two fixes for stats that under-reported: the Efficiency view no longer gets stuck after you close and reopen it, and sessions spanning midnight now count toward today.',
		features: [],
	},
	{
		version: '0.17.0',
		date: '2026-07-30',
		headline:
			'The release that made the data comparative: efficiency over time, and per-model numbers you can rank against each other rather than read one at a time.',
		features: [
			{
				id: 'efficiency.view',
				title: 'Efficiency view',
				description:
					'Answers one question over the long run: are you getting more done per token than you were a month ago? Trends rather than totals.',
				kind: 'view',
				surface: { view: 'efficiency' },
			},
			{
				id: 'usage.model-efficiency',
				title: 'Model Efficiency',
				description:
					'Per-model one-shot edit rate, retry rate, cost per turn and cache hit rate in one sortable table — so "which model should I use for this" stops being a guess.',
				kind: 'section',
				surface: { view: 'usage', tab: 'activity', anchor: 'section-model-efficiency' },
			},
			{
				id: 'chart.cost-by-model-split',
				title: 'Cost by Model and Tokens by Provider',
				description:
					'The usage chart can now be split by model or by provider, and the By Editor breakdown collapses out of the way when you are not reading it.',
				kind: 'section',
				surface: { view: 'chart' },
			},
		],
	},
	{
		version: '0.13.0',
		date: '2026-07-11',
		headline:
			'Long-context pricing became visible: the extension now knows when a request crossed into long-context rates and what that cost you.',
		features: [
			{
				id: 'usage.context-window',
				title: 'Context Window & Long-Context Pricing',
				description:
					'How full your context windows run, and which requests tipped into long-context pricing. Large contexts are billed differently, and this is where that shows up.',
				kind: 'section',
				surface: { view: 'usage', tab: 'activity' },
			},
		],
	},
];

/** Looks up a catalog feature by id. Returns `null` for an unknown id. */
export function findFeature(featureId: string): { feature: WhatsNewFeature; release: WhatsNewRelease } | null {
	for (const release of WHATS_NEW_RELEASES) {
		const feature = release.features.find((f) => f.id === featureId);
		if (feature) { return { feature, release }; }
	}
	return null;
}
