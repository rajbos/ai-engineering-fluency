/**
 * Decides whether to tell the user about a new view, tab, or section — and
 * which one.
 *
 * The design constraint is noise. A notification on every window open trains
 * people to dismiss without reading, at which point the mechanism is worse than
 * having none. So the rules are deliberately strict, and all of them are
 * enforced here rather than at the call site:
 *
 *   - **Never on a fresh install.** New users get the onboarding flow; a
 *     backlog of "new in 0.17.0" on day one is meaningless to them.
 *   - **Only what is new *to this user*.** Features are queued when the
 *     extension notices its version changed, not when a panel opens, so
 *     announcements track upgrades rather than usage.
 *   - **At most 3 per release** ({@link WHATS_NEW_MAX_ANNOUNCEMENTS_PER_RELEASE}),
 *     picked in catalog order — so the catalog's ordering is the editorial
 *     decision about what mattered most.
 *   - **At most one per calendar day**, and one at a time.
 *   - **Nothing they already found.** A queued feature is dropped silently the
 *     moment the user opens its surface themselves.
 *   - **Nothing stale.** Features from releases older than
 *     {@link WHATS_NEW_MAX_ANNOUNCEMENT_AGE_DAYS} are dropped unannounced.
 *
 * Everything in this module is pure: it takes the persisted state and returns
 * the next state plus at most one announcement. The caller persists the state
 * and shows the toast. State is written *before* the toast is shown, matching
 * the existing news-banner methods in `extension.ts` — a notification the user
 * ignores is still a notification they have seen, and re-showing it on the next
 * window open is the failure mode this whole module exists to avoid.
 */

import {
	WHATS_NEW_MAX_ANNOUNCEMENTS_PER_RELEASE,
	WHATS_NEW_MAX_ANNOUNCEMENT_AGE_DAYS,
	type WhatsNewFeature,
	type WhatsNewRelease,
} from './catalog';
import { hasVisitedSince, type ViewVisitMap } from './visits';

/** Persisted in `globalState` under `whatsNew.state`. */
export interface WhatsNewState {
	/** Extension version at the last activation we saw. `null` before the first. */
	lastKnownVersion: string | null;
	/** When {@link lastKnownVersion} first ran here (UTC ISO). Anchors "did they find it themselves". */
	versionSeenAt: string | null;
	/** Feature ids queued to announce, newest release first, already capped per release. */
	pending: string[];
	/** Feature ids already announced — kept so a re-queue can never repeat one. */
	announced: string[];
	/** `YYYY-MM-DD` (local) of the last announcement. Enforces one per day. */
	lastAnnouncedDate: string | null;
}

export const EMPTY_WHATS_NEW_STATE: WhatsNewState = {
	lastKnownVersion: null,
	versionSeenAt: null,
	pending: [],
	announced: [],
	lastAnnouncedDate: null,
};

/** Normalizes whatever came back out of globalState into a usable state object. */
export function sanitizeState(raw: unknown): WhatsNewState {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { return { ...EMPTY_WHATS_NEW_STATE }; }
	const bag = raw as Record<string, unknown>;
	const strings = (value: unknown): string[] =>
		Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && !!v) : [];
	const str = (value: unknown): string | null => (typeof value === 'string' && value ? value : null);
	return {
		lastKnownVersion: str(bag.lastKnownVersion),
		versionSeenAt: str(bag.versionSeenAt),
		pending: strings(bag.pending),
		announced: strings(bag.announced),
		lastAnnouncedDate: str(bag.lastAnnouncedDate),
	};
}

/**
 * Compares `a.b.c` version strings numerically, ignoring any `-prerelease`
 * suffix. Returns <0, 0 or >0 like a comparator. Missing or non-numeric
 * segments count as 0, so a malformed version sorts low rather than throwing.
 */
export function compareVersions(a: string, b: string): number {
	const parts = (version: string): number[] =>
		String(version).split('-')[0].split('.').map((segment) => {
			const parsed = Number.parseInt(segment, 10);
			return Number.isFinite(parsed) ? parsed : 0;
		});
	const left = parts(a);
	const right = parts(b);
	const length = Math.max(left.length, right.length);
	for (let i = 0; i < length; i++) {
		const diff = (left[i] ?? 0) - (right[i] ?? 0);
		if (diff !== 0) { return diff; }
	}
	return 0;
}

/** `YYYY-MM-DD` in the user's own timezone — "one a day" means their day. */
export function localDateKey(now: Date): string {
	const pad = (value: number): string => String(value).padStart(2, '0');
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** True when the release is recent enough to still be worth announcing. */
function isFreshEnough(release: WhatsNewRelease, now: Date): boolean {
	// An unreleased version (date `null`) is the build the user is running, so
	// it is by definition current.
	if (!release.date) { return true; }
	const released = Date.parse(`${release.date}T00:00:00Z`);
	if (!Number.isFinite(released)) { return true; }
	const ageDays = (now.getTime() - released) / 86_400_000;
	return ageDays <= WHATS_NEW_MAX_ANNOUNCEMENT_AGE_DAYS;
}

/**
 * Reconciles the persisted state against the running version, queueing anything
 * the user has not seen yet.
 *
 * Three entry cases, and the difference between them matters:
 *
 *   - **A genuinely fresh install** records the version and queues nothing. A
 *     user who installed the extension today does not want to be walked through
 *     the last five releases one toast at a time; they get onboarding instead.
 *   - **An existing user seeing this bookkeeping for the first time** — everyone
 *     already on an older version when this mechanism shipped — has no
 *     `lastKnownVersion` to compare against, so there is no way to know which
 *     releases they crossed. They get the *current* release's features only.
 *     Anything older is left to the What's New view, where it does not interrupt.
 *   - **A normal upgrade** queues every release between the two versions.
 *
 * A downgrade adopts the version and queues nothing: re-announcing on the way
 * back down would be nonsense.
 */
export function reconcileVersion(input: {
	releases: readonly WhatsNewRelease[];
	state: WhatsNewState;
	currentVersion: string;
	now: Date;
	/**
	 * True when this install has no history at all. Callers derive it from
	 * whatever they already track about first use (`hasSeenOnboarding` in the
	 * extension's case) — this module has no way to tell on its own.
	 */
	isFreshInstall?: boolean;
}): WhatsNewState {
	const { releases, state, currentVersion, now, isFreshInstall = true } = input;
	const previous = state.lastKnownVersion;

	if (previous === currentVersion) { return state; }

	// No prior record: either a fresh install (queue nothing) or an existing user
	// meeting this mechanism for the first time (queue the current release only).
	if (previous === null) {
		const current = isFreshInstall ? undefined : releases.find((release) => release.version === currentVersion);
		const queued = current && isFreshEnough(current, now)
			? takeAnnounceable(current, new Set(state.announced))
			: [];
		return { ...state, lastKnownVersion: currentVersion, versionSeenAt: now.toISOString(), pending: queued };
	}

	// A downgrade: adopt the version, queue nothing.
	if (compareVersions(currentVersion, previous) < 0) {
		return { ...state, lastKnownVersion: currentVersion, versionSeenAt: now.toISOString(), pending: [] };
	}

	const known = new Set([...state.announced, ...state.pending]);
	const queued = releases
		.filter((release) => crossedByUpgrade(release, previous, currentVersion, now))
		.flatMap((release) => takeAnnounceable(release, known));

	return {
		...state,
		lastKnownVersion: currentVersion,
		versionSeenAt: now.toISOString(),
		pending: [...state.pending, ...queued],
	};
}

/** True when this upgrade moved the user from before `release` to at-or-after it, recently enough to matter. */
function crossedByUpgrade(release: WhatsNewRelease, previous: string, currentVersion: string, now: Date): boolean {
	return compareVersions(release.version, previous) > 0
		&& compareVersions(release.version, currentVersion) <= 0
		&& isFreshEnough(release, now);
}

/**
 * The next feature ids to queue from a release, in catalog order.
 *
 * The cap is on the release as a whole, not on this call: anything from this
 * release already announced or already queued spends part of the budget. Two
 * upgrades in a week must not add up to six notifications about one release.
 * Mutates `known` so a feature listed under two releases is only queued once.
 */
function takeAnnounceable(release: WhatsNewRelease, known: Set<string>): string[] {
	const alreadySpent = release.features.filter((feature) => known.has(feature.id)).length;
	const budget = WHATS_NEW_MAX_ANNOUNCEMENTS_PER_RELEASE - alreadySpent;
	if (budget <= 0) { return []; }
	const taken: string[] = [];
	for (const feature of release.features) {
		if (taken.length >= budget) { break; }
		if (known.has(feature.id)) { continue; }
		known.add(feature.id);
		taken.push(feature.id);
	}
	return taken;
}

export interface Announcement {
	readonly feature: WhatsNewFeature;
	readonly release: WhatsNewRelease;
}

export interface AnnouncementPlan {
	/** State to persist, whether or not an announcement came back. */
	readonly state: WhatsNewState;
	/** The single feature to announce now, or `null` to stay quiet. */
	readonly announcement: Announcement | null;
}

/**
 * Picks at most one queued feature to announce, dropping any the user has
 * already found for themselves or that has gone stale.
 *
 * Note that the drops happen even when the daily gate stops us announcing:
 * a queue that quietly cleans itself is what keeps a user who explores the UI
 * on their own from being told about it a week later.
 */
export function planAnnouncement(input: {
	releases: readonly WhatsNewRelease[];
	state: WhatsNewState;
	visits: ViewVisitMap;
	now: Date;
}): AnnouncementPlan {
	const { releases, state, visits, now } = input;
	if (state.pending.length === 0) { return { state, announcement: null }; }

	const byId = new Map<string, Announcement>();
	for (const release of releases) {
		for (const feature of release.features) { byId.set(feature.id, { feature, release }); }
	}

	const alreadyAnnouncedToday = state.lastAnnouncedDate === localDateKey(now);
	const remaining: string[] = [];
	let chosen: Announcement | null = null;

	for (const featureId of state.pending) {
		const entry = byId.get(featureId);
		// Unknown id (catalog entry removed) or a stale release: drop it silently.
		if (!entry || !isFreshEnough(entry.release, now)) { continue; }
		// The user found it themselves after upgrading — nothing left to tell them.
		if (hasVisitedSince(visits, entry.feature.surface, state.versionSeenAt)) { continue; }
		if (!chosen && !alreadyAnnouncedToday) {
			chosen = entry;
			continue;
		}
		remaining.push(featureId);
	}

	if (!chosen) {
		return { state: { ...state, pending: remaining }, announcement: null };
	}

	return {
		state: {
			...state,
			pending: remaining,
			announced: [...state.announced, chosen.feature.id],
			lastAnnouncedDate: localDateKey(now),
		},
		announcement: chosen,
	};
}

/** How many queued features are still waiting — used to badge the What's New entry point. */
export function pendingCount(state: WhatsNewState): number {
	return state.pending.length;
}
