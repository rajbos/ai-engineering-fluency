/**
 * Session parent/child hierarchy enrichment for the Sessions list and Log viewer.
 *
 * Three ecosystems record a parent link per session, each in its own store:
 *   - Copilot CLI: `workspace_parent_links` in ~/.copilot/data.db (via CopilotAppDataAccess)
 *   - pi:          the `parentSession` header field / nested child paths in each session JSONL
 *   - Mistral Vibe: `parent_session_id` / `child_sessions` in each session's meta.json
 *                  (both the legacy session_* layout and the unified store; see mistralvibe.ts)
 *
 * The enrich functions below populate `parentInfo` / `childInfo` / `totalChildCount` on
 * SessionFileDetails — the webview renders those as the ↑ Parent / ↓ Children badges.
 * The multi-agent-parent COUNTING (UsageAnalysisPeriod.multiAgentParentSessions and the
 * daily Agentic trend) lives in shared src/multiAgentSources.ts, which hosts drive through
 * one MultiAgentSource list; this module adds the host-only Copilot data.db source to it.
 * All errors are suppressed — hierarchy is an optional enrichment.
 */
import * as path from 'path';

import type { SessionFileDetails, SessionRelationRef } from '../../../src/types';
import { normalizePath } from '../../../src/workspaceHelpers';
import { MistralVibeDataAccess } from '../../../src/mistralvibe';
import { PiDataAccess } from '../../../src/pi';
import type { MultiAgentSource } from '../../../src/multiAgentSources';
import type { CopilotAppDataAccess } from '../copilotAppData';

/**
 * The Copilot CLI multi-agent source (host-only: needs ~/.copilot/data.db via sql.js).
 * `getSessionHierarchy` only returns uuids that appear in a parent/child link, so a candidate
 * absent from the map simply has 0 children — the MultiAgentSource contract.
 */
export function createCopilotCliMultiAgentSource(
	copilotAppData: CopilotAppDataAccess,
	extractCliUuid: (sessionFile: string) => string | null,
): MultiAgentSource {
	return {
		id: 'copilot-cli',
		extractId: (f) => extractCliUuid(f),
		getChildCounts: async (ids) => {
			const hierarchy = await copilotAppData.getSessionHierarchy(ids);
			const counts = new Map<string, number>();
			for (const [uuid, node] of hierarchy) { counts.set(uuid, node.totalChildCount); }
			return counts;
		},
	};
}

/**
 * Enrich Copilot CLI sessions in `files` with parent/child hierarchy data
 * read from ~/.copilot/data.db. All other session types are left untouched.
 * Errors are suppressed — hierarchy is an optional enrichment.
 */
export async function enrichCopilotSessionHierarchy(
	copilotAppData: CopilotAppDataAccess,
	extractCliUuid: (sessionFile: string) => string | null,
	files: SessionFileDetails[],
): Promise<void> {
	// Build uuid → SessionFileDetails map for Copilot CLI sessions only.
	const uuidToDetails = new Map<string, SessionFileDetails>();
	for (const details of files) {
		const uuid = extractCliUuid(details.file);
		if (uuid) { uuidToDetails.set(uuid, details); }
	}
	if (uuidToDetails.size === 0) { return; }

	try {
		const hierarchy = await copilotAppData.getSessionHierarchy([...uuidToDetails.keys()]);
		for (const [uuid, node] of hierarchy) {
			const details = uuidToDetails.get(uuid);
			if (!details) { continue; }
			if (node.parentUuid) {
				const ref: SessionRelationRef = {
					uuid: node.parentUuid,
					name: node.parentName ?? node.parentUuid,
					sessionFile: uuidToDetails.get(node.parentUuid)?.file,
				};
				details.parentInfo = ref;
			}
			if (node.childUuids.length > 0) {
				details.childInfo = node.childUuids.map(cUuid => ({
					uuid: cUuid,
					name: node.childNames.get(cUuid) ?? cUuid,
					sessionFile: uuidToDetails.get(cUuid)?.file,
				} satisfies SessionRelationRef));
				details.totalChildCount = node.totalChildCount;
			}
		}
	} catch { /* hierarchy is optional — never surface errors */ }
}

/**
 * Enrich Pi sessions in `files` with parent/child hierarchy data derived from
 * the `parentSession` field in each session's JSONL header.
 * All other session types are left untouched.
 * Errors are suppressed — hierarchy is an optional enrichment.
 */
export async function enrichPiSessionHierarchy(files: SessionFileDetails[]): Promise<void> {
	const pi = new PiDataAccess();
	const piFiles = files.filter(f => pi.isPiSessionFile(f.file));
	if (piFiles.length === 0) { return; }

	// Normalise a path for platform-independent comparison.
	const norm = (p: string) => normalizePath(p);

	// Build normalised-path → SessionFileDetails map.
	const pathToDetails = new Map<string, SessionFileDetails>();
	for (const details of piFiles) {
		pathToDetails.set(norm(details.file), details);
	}

	// Discover parent links.
	// Primary: path-based detection (pi nests child sessions under {parentId}/{hash}/run-N/session.jsonl).
	// Fallback: header-based parentSession field (future pi versions may use this).
	const parentByChild = new Map<string, string>();     // normChildPath → normParentPath
	const childrenByParent = new Map<string, string[]>(); // normParentPath → normChildPaths[]
	await Promise.all(piFiles.map(async (details) => {
		try {
			const rawParent =
				pi.getParentSessionPathFromFilePath(details.file) ??
				await pi.getParentSessionPath(details.file);
			if (!rawParent) { return; }
			const normChild = norm(details.file);
			const normParent = norm(rawParent);
			parentByChild.set(normChild, normParent);
			if (!childrenByParent.has(normParent)) { childrenByParent.set(normParent, []); }
			childrenByParent.get(normParent)!.push(normChild);
		} catch { /* skip unreadable sessions */ }
	}));

	// Apply parentInfo to child sessions.
	for (const [normChild, normParent] of parentByChild) {
		const childDetails = pathToDetails.get(normChild);
		if (!childDetails) { continue; }
		const parentDetails = pathToDetails.get(normParent);
		childDetails.parentInfo = {
			uuid: normParent,
			name: parentDetails?.title ?? path.basename(path.dirname(normParent)),
			sessionFile: parentDetails?.file,
		} satisfies SessionRelationRef;
	}

	// Apply childInfo to parent sessions.
	for (const [normParent, normChildren] of childrenByParent) {
		const parentDetails = pathToDetails.get(normParent);
		if (!parentDetails) { continue; }
		parentDetails.childInfo = normChildren.map(nc => {
			const childDetails = pathToDetails.get(nc);
			return {
				uuid: nc,
				name: childDetails?.title ?? path.basename(path.dirname(nc)),
				sessionFile: childDetails?.file,
			} satisfies SessionRelationRef;
		});
		parentDetails.totalChildCount = normChildren.length;
	}
}

/**
 * Enrich Mistral Vibe sessions in `files` with parent/child hierarchy data derived from
 * each session's meta.json `parent_session_id` (written on the subsession, in both the
 * legacy session_* layout and the unified store) and the parent's own `child_sessions`
 * list (unified store only). All other session types are left untouched.
 * Errors are suppressed — hierarchy is an optional enrichment.
 */
/** Links discovered among the loaded Vibe sessions, keyed by session id. */
interface VibeLoadedLinks {
	detailsBySessionId: Map<string, SessionFileDetails>;
	childSessionIdsBySessionId: Map<string, string[]>;
	parentIdByChildId: Map<string, string>;
	childIdsByParentId: Map<string, string[]>;
}

/** Read every loaded Vibe session's identity and build the parent/child link maps. */
async function collectVibeLinks(mistralVibe: MistralVibeDataAccess, vibeFiles: SessionFileDetails[]): Promise<VibeLoadedLinks> {
	const links: VibeLoadedLinks = {
		detailsBySessionId: new Map(),
		childSessionIdsBySessionId: new Map(),
		parentIdByChildId: new Map(),
		childIdsByParentId: new Map(),
	};
	await Promise.all(vibeFiles.map(async (details) => {
		try {
			const identity = await mistralVibe.getSessionIdentity(details.file);
			if (!identity.sessionId) { return; }
			links.detailsBySessionId.set(identity.sessionId, details);
			links.childSessionIdsBySessionId.set(identity.sessionId, identity.childSessionIds);
			if (identity.parentSessionId) {
				links.parentIdByChildId.set(identity.sessionId, identity.parentSessionId);
				const siblings = links.childIdsByParentId.get(identity.parentSessionId) ?? [];
				siblings.push(identity.sessionId);
				links.childIdsByParentId.set(identity.parentSessionId, siblings);
			}
		} catch { /* skip unreadable sessions */ }
	}));
	return links;
}

/** Meta path + title for a parent session that falls outside the loaded window. */
async function resolveExternalVibeParent(mistralVibe: MistralVibeDataAccess, parentId: string): Promise<{ metaPath: string; title?: string } | undefined> {
	try {
		const metaPath = await mistralVibe.findSessionMetaById(parentId);
		if (!metaPath) { return undefined; }
		const meta = await mistralVibe.getSessionMeta(metaPath);
		return { metaPath, title: meta.title };
	} catch { return undefined; /* unresolvable parent — badge falls back to the raw id */ }
}

export async function enrichVibeSessionHierarchy(mistralVibe: MistralVibeDataAccess, files: SessionFileDetails[]): Promise<void> {
	const vibeFiles = files.filter(f => mistralVibe.isVibeSessionFile(f.file));
	if (vibeFiles.length === 0) { return; }

	const links = await collectVibeLinks(mistralVibe, vibeFiles);
	if (links.detailsBySessionId.size === 0) { return; }

	// Resolve parents outside the loaded window, so a subsession's parent badge can
	// still name and link them.
	const externalParentById = new Map<string, { metaPath: string; title?: string }>();
	await Promise.all([...new Set(links.parentIdByChildId.values())].map(async (parentId) => {
		if (links.detailsBySessionId.has(parentId)) { return; }
		const external = await resolveExternalVibeParent(mistralVibe, parentId);
		if (external) { externalParentById.set(parentId, external); }
	}));

	applyVibeParentInfo(links, externalParentById);
	applyVibeChildInfo(links);
}

/** Set parentInfo on every loaded child (sub-)session. */
function applyVibeParentInfo(links: VibeLoadedLinks, externalParentById: Map<string, { metaPath: string; title?: string }>): void {
	for (const [childId, parentId] of links.parentIdByChildId) {
		const childDetails = links.detailsBySessionId.get(childId);
		if (!childDetails) { continue; }
		const parentDetails = links.detailsBySessionId.get(parentId);
		const external = externalParentById.get(parentId);
		childDetails.parentInfo = {
			uuid: parentId,
			name: parentDetails?.title ?? external?.title ?? parentId,
			sessionFile: parentDetails?.file ?? external?.metaPath,
		} satisfies SessionRelationRef;
	}
}

/** Set childInfo + totalChildCount on every loaded parent session. */
function applyVibeChildInfo(links: VibeLoadedLinks): void {
	for (const [parentId, childIds] of links.childIdsByParentId) {
		const parentDetails = links.detailsBySessionId.get(parentId);
		if (!parentDetails) { continue; }
		parentDetails.childInfo = childIds.map(cId => {
			const c = links.detailsBySessionId.get(cId);
			return {
				uuid: cId,
				name: c?.title ?? cId,
				sessionFile: c?.file,
			} satisfies SessionRelationRef;
		});
		// The parent's own `child_sessions` list may name children outside the loaded
		// window, so take the max of both counts.
		const listed = links.childSessionIdsBySessionId.get(parentId)?.length ?? 0;
		parentDetails.totalChildCount = Math.max(listed, childIds.length);
	}
}
