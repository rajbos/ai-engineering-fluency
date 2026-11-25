/**
 * Shared multi-agent (parent/child session) sources.
 *
 * Every vendor that can spawn subsessions persists the parent link in its own store:
 *   - Copilot CLI:  `workspace_parent_links` in ~/.copilot/data.db (host-only, sql.js/WASM — see the extension)
 *   - Hermes:       `parent_session_id` column in state.db
 *   - Mistral Vibe: `parent_session_id` in each session's meta.json (legacy + unified store)
 *   - pi:           `parentSession` header field / nested child paths in the session JSONL
 *
 * The OUTPUT side is already unified: `SessionRelationRef` / `parentInfo` / `childInfo` /
 * `totalChildCount` on SessionFileDetails/SessionLogData, and `multiAgentParentSessions` /
 * `delegationSessions` on UsageAnalysisPeriod. This module unifies the INPUT side: instead of
 * per-vendor if-chains in every host, a host builds one list of `MultiAgentSource`s (the
 * src-resident ones via `createMultiAgentSources`, plus any host-only ones it has) and calls
 * the shared collect/count/bucket helpers below. Adding a new vendor = one entry in one list.
 *
 * A session counts as a "multi-agent parent" when it has `minChildren` (default
 * STAGE_THRESHOLDS.agentic.multiAgentMinChildren) or more direct children. All errors are
 * suppressed — this is optional enrichment, never a failure.
 */
import { STAGE_THRESHOLDS } from './maturityScoring';
import type { HermesDataAccess } from './hermes';
import type { MistralVibeDataAccess } from './mistralvibe';

/** One vendor's parent/child link store. */
export interface MultiAgentSource {
	readonly id: string;
	/** This source's session id for a session file, or null when the file is not from this source. */
	extractId(sessionFile: string): string | null | Promise<string | null>;
	/** Direct-child counts per parent id, restricted to the candidate ids (absent parent = 0 children). */
	getChildCounts(candidateIds: string[]): Promise<Map<string, number>>;
}

/** Data-access instances behind the src-resident sources. */
export interface MultiAgentSourceDeps {
	hermes: HermesDataAccess;
	mistralVibe: MistralVibeDataAccess;
}

/**
 * The multi-agent sources whose stores live in shared src/ (Hermes state.db, Vibe meta.json).
 * Hosts with additional host-only stores (e.g. the extension's Copilot data.db) append their
 * own MultiAgentSource entries to this list.
 */
export function createMultiAgentSources(deps: MultiAgentSourceDeps): MultiAgentSource[] {
	return [
		{
			id: 'hermes',
			extractId: (f) => (deps.hermes.isHermesSessionFile(f) ? deps.hermes.getSessionId(f) : null),
			getChildCounts: (ids) => deps.hermes.getChildCounts(ids),
		},
		{
			id: 'mistralvibe',
			extractId: async (f) => {
				if (!deps.mistralVibe.isVibeSessionFile(f)) { return null; }
				try {
					return (await deps.mistralVibe.getSessionIdentity(f)).sessionId ?? null;
				} catch { return null; }
			},
			getChildCounts: (ids) => deps.mistralVibe.getChildCounts(ids),
		},
	];
}

/** One usage row considered for multi-agent candidacy: a session file plus its activity day key. */
export interface MultiAgentCandidateRow {
	sessionFile: string;
	dayKey: string;
}

/** A candidate: a source, the session id it extracted, and the row's day key. */
export interface MultiAgentCandidate {
	source: MultiAgentSource;
	id: string;
	dayKey: string;
}

/**
 * Collects candidate ids across all sources: each row is offered to every source until one
 * claims it (first match wins, matching adapter-registry ordering). Rows are pre-filtered by
 * the caller (e.g. to the last-30-days window) and carry the day key used for trend bucketing.
 */
export async function collectMultiAgentCandidates(
	sources: MultiAgentSource[],
	rows: MultiAgentCandidateRow[],
): Promise<MultiAgentCandidate[]> {
	const out: MultiAgentCandidate[] = [];
	for (const row of rows) {
		for (const source of sources) {
			let id: string | null;
			try {
				id = await source.extractId(row.sessionFile);
			} catch { continue; }
			if (id) { out.push({ source, id, dayKey: row.dayKey }); break; }
		}
	}
	return out;
}

/** Groups candidates by source, preserving day keys, with duplicate ids removed per source. */
function groupBySource(candidates: MultiAgentCandidate[]): Map<MultiAgentSource, { ids: Set<string>; entries: MultiAgentCandidate[] }> {
	const bySource = new Map<MultiAgentSource, { ids: Set<string>; entries: MultiAgentCandidate[] }>();
	for (const c of candidates) {
		let group = bySource.get(c.source);
		if (!group) { group = { ids: new Set(), entries: [] }; bySource.set(c.source, group); }
		group.ids.add(c.id);
		group.entries.push(c);
	}
	return bySource;
}

/**
 * Counts distinct candidate sessions that are multi-agent parents (>= `minChildren` direct
 * children per their source's store). Feeds UsageAnalysisPeriod.multiAgentParentSessions.
 */
export async function countMultiAgentParents(
	candidates: MultiAgentCandidate[],
	minChildren: number = STAGE_THRESHOLDS.agentic.multiAgentMinChildren,
): Promise<number> {
	let count = 0;
	await Promise.all([...groupBySource(candidates)].map(async ([source, group]) => {
		try {
			const counts = await source.getChildCounts([...group.ids]);
			for (const id of group.ids) {
				if ((counts.get(id) ?? 0) >= minChildren) { count++; }
			}
		} catch { /* optional enrichment — suppress */ }
	}));
	return count;
}

/** One day's multi-agent counters in the daily Agentic trend. */
export interface AgenticDayBucket {
	multiAgentParentSessions: number;
	delegationSessions: number;
}

/** Buckets multi-agent-parent counts per candidate day key into `byDay` (shared by the daily Agentic trend). */
export async function bucketMultiAgentParentsByDay(
	candidates: MultiAgentCandidate[],
	byDay: Map<string, AgenticDayBucket>,
	minChildren: number = STAGE_THRESHOLDS.agentic.multiAgentMinChildren,
): Promise<void> {
	await Promise.all([...groupBySource(candidates)].map(async ([source, group]) => {
		try {
			const counts = await source.getChildCounts([...group.ids]);
			for (const entry of group.entries) {
				if ((counts.get(entry.id) ?? 0) >= minChildren) {
					const bucket = byDay.get(entry.dayKey) ?? { multiAgentParentSessions: 0, delegationSessions: 0 };
					bucket.multiAgentParentSessions++;
					byDay.set(entry.dayKey, bucket);
				}
			}
		} catch { /* optional enrichment — suppress */ }
	}));
}
