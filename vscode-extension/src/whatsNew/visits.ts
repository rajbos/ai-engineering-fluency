/**
 * Last-opened bookkeeping for views and their subviews.
 *
 * The point is not analytics — nothing here leaves the machine. It exists so
 * the what's-new announcer can stay quiet about a tab the user already found
 * on their own: telling someone about the Corrections tab they opened
 * yesterday is exactly the kind of noise that trains people to dismiss
 * notifications without reading them.
 *
 * Kept as pure functions over a plain map so it can be unit-tested without an
 * extension context. The map is persisted in `globalState` under
 * `whatsNew.viewVisits`.
 */

import type { FeatureSurface } from './catalog';

/** Surface key → ISO timestamp of the last time the user opened it. */
export type ViewVisitMap = Record<string, string>;

/**
 * A visit is recorded against a view (`usage`) and, when the user lands on a
 * specific tab, against that tab too (`usage#corrections`). Anchors are
 * deliberately *not* part of the key: a section is scrolled past, not opened,
 * so "did they see it" is only answerable at tab granularity.
 */
export function surfaceKey(surface: Pick<FeatureSurface, 'view' | 'tab'>): string {
	return surface.tab ? `${surface.view}#${surface.tab}` : surface.view;
}

/**
 * Number of keys we keep. The real ceiling is the number of view/tab
 * combinations the extension ships (well under 100), so this only ever trims
 * keys left behind by removed tabs — it stops a renamed tab from growing the
 * map forever across upgrades.
 */
const MAX_VISIT_ENTRIES = 200;

/**
 * Returns a copy of `visits` with this surface (and its parent view) stamped at
 * `nowIso`. Returns the input untouched when the surface is unusable, so a
 * caller never has to guard.
 */
export function recordVisit(
	visits: ViewVisitMap,
	surface: Pick<FeatureSurface, 'view' | 'tab'>,
	nowIso: string,
): ViewVisitMap {
	if (!surface || typeof surface.view !== 'string' || !surface.view) { return visits; }
	const next: ViewVisitMap = { ...visits, [surface.view]: nowIso };
	if (surface.tab) { next[surfaceKey(surface)] = nowIso; }
	return prune(next);
}

/** Drops the oldest entries once the map grows past {@link MAX_VISIT_ENTRIES}. */
function prune(visits: ViewVisitMap): ViewVisitMap {
	const keys = Object.keys(visits);
	if (keys.length <= MAX_VISIT_ENTRIES) { return visits; }
	const keep = keys
		.sort((a, b) => (visits[b] ?? '').localeCompare(visits[a] ?? ''))
		.slice(0, MAX_VISIT_ENTRIES);
	const pruned: ViewVisitMap = {};
	for (const key of keep) { pruned[key] = visits[key]; }
	return pruned;
}

/**
 * True when the user opened this exact surface at or after `sinceIso`.
 *
 * A feature on a tab needs a visit to *that tab* — opening the panel and
 * staying on its default tab is not seeing it. A feature that is a whole view
 * only needs a visit to the view.
 *
 * ISO-8601 UTC timestamps compare correctly as strings, which is why
 * {@link nowIso} always writes them that way.
 */
export function hasVisitedSince(
	visits: ViewVisitMap,
	surface: Pick<FeatureSurface, 'view' | 'tab'>,
	sinceIso: string | null,
): boolean {
	if (!sinceIso) { return false; }
	const stamp = visits[surfaceKey(surface)];
	return typeof stamp === 'string' && stamp >= sinceIso;
}

/** Normalizes whatever came back out of globalState into a usable map. */
export function sanitizeVisits(raw: unknown): ViewVisitMap {
	if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { return {}; }
	const out: ViewVisitMap = {};
	for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
		if (typeof key === 'string' && key && typeof value === 'string' && value) { out[key] = value; }
	}
	return prune(out);
}

/** UTC ISO-8601 timestamp, the only format written into the visit map. */
export function nowIso(now: Date): string {
	return now.toISOString();
}
