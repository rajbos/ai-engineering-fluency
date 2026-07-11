/**
 * CopilotAppDataAccess — reads session hierarchy from ~/.copilot/data.db.
 *
 * The Copilot app stores parent/child workspace relationships in `data.db`,
 * including both user-initiated child sessions and agent-spawned subagent
 * fleets (where an agent calls `create_session` to spawn N child sessions).
 *
 * The bridge to our session files:
 *   workspace_parent_links.child/parent_workspace_id
 *     → workspaces.id
 *     → workspaces.session_id   ← this equals the events.jsonl UUID directory
 *     → ~/.copilot/session-state/{UUID}/events.jsonl
 *
 * This module is an optional enrichment layer. All methods return gracefully
 * when data.db is absent or the schema differs from what we expect.
 */
/// <reference types="sql.js" />
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import initSqlJs from 'sql.js';

type SqlJsStatic = initSqlJs.SqlJsStatic;

/**
 * Hierarchy information for one session, keyed by its events.jsonl UUID.
 * Names come from the `workspaces.name` column (the session display name).
 */
export interface SessionHierarchyNode {
	uuid: string;
	parentUuid: string | null;
	/** Display name of the parent workspace (may be null when parent exists but name is not set). */
	parentName: string | null;
	/** UUIDs of all direct children (every workspace that lists this as parent). */
	childUuids: string[];
	/** Display names keyed by child UUID. */
	childNames: Map<string, string>;
	/**
	 * Total child count across ALL children in data.db, not just those in our
	 * current session window. Useful when showing "↓ N" badges for fleet parents.
	 */
	totalChildCount: number;
}

/**
 * Context-window state for one session from the data.db `sessions` table.
 * All fields are null when the column is unset for that session.
 */
export interface SessionContextWindow {
	uuid: string;
	/** Copilot CLI context tier (e.g. "default"); null when not recorded. */
	contextTier: string | null;
	/** Last known context fill in tokens (context_current_tokens). */
	contextReachedTokens: number | null;
	/** Selected input-token window limit (context_input_token_limit). */
	contextWindowLimit: number | null;
}

export class CopilotAppDataAccess {
	private _sqlJsModule: SqlJsStatic | null = null;

	/** Absolute path to ~/.copilot/data.db. */
	getDbPath(): string {
		return path.join(os.homedir(), '.copilot', 'data.db');
	}

	/** Lazily initialise and cache the sql.js WASM module. */
	private async initSqlJs(): Promise<SqlJsStatic> {
		if (this._sqlJsModule) { return this._sqlJsModule; }
		// Re-use the same WASM file that CopilotCliStoreAccess uses.
		const wasmPath = path.join(__dirname, 'sql-wasm.wasm');
		let wasmBinary: Uint8Array | undefined;
		if (fs.existsSync(wasmPath)) {
			wasmBinary = fs.readFileSync(wasmPath);
		}
		const sqlJs = await initSqlJs(wasmBinary ? { wasmBinary } : undefined);
		this._sqlJsModule = sqlJs;
		return sqlJs;
	}

	/**
	 * Build a hierarchy map for the given events.jsonl session UUIDs.
	 *
	 * For each UUID we return:
	 *   - its parent UUID + name (null when it is a root session)
	 *   - its direct child UUIDs + names (empty when it has no children)
	 *   - a `totalChildCount` drawn from data.db (may be > childUuids.length when
	 *     some children fall outside the caller's visible session set)
	 *
	 * Only UUIDs that appear in at least one side of a parent/child relationship
	 * are included in the returned map.  Sessions with no hierarchy are omitted.
	 *
	 * Returns an empty map when data.db does not exist, the schema is unexpected,
	 * or any error occurs — all errors are suppressed.
	 */
	async getSessionHierarchy(sessionUuids: string[]): Promise<Map<string, SessionHierarchyNode>> {
		const result = new Map<string, SessionHierarchyNode>();
		if (sessionUuids.length === 0) { return result; }

		const dbPath = this.getDbPath();
		if (!fs.existsSync(dbPath)) { return result; }

		try {
			const SQL = await this.initSqlJs();
			const buffer = fs.readFileSync(dbPath);
			const db = new SQL.Database(buffer);
			try {
				return this._buildHierarchyFromDb(db, sessionUuids);
			} finally {
				db.close();
			}
		} catch {
			return result;
		}
	}

	/**
	 * Read per-session context-window state (tier, current fill, selected limit)
	 * from the `sessions` table for the given events.jsonl session UUIDs.
	 *
	 * Returns an empty map when data.db does not exist, the schema lacks the
	 * context columns, or any error occurs — all errors are suppressed.
	 */
	async getSessionContextInfo(sessionUuids: string[]): Promise<Map<string, SessionContextWindow>> {
		const result = new Map<string, SessionContextWindow>();
		if (sessionUuids.length === 0) { return result; }

		const dbPath = this.getDbPath();
		if (!fs.existsSync(dbPath)) { return result; }

		try {
			const SQL = await this.initSqlJs();
			const buffer = fs.readFileSync(dbPath);
			const db = new SQL.Database(buffer);
			try {
				const ph = sessionUuids.map(() => '?').join(', ');
				const res = db.exec(
					`SELECT id, context_tier, context_current_tokens, context_input_token_limit
					 FROM sessions WHERE id IN (${ph})`,
					sessionUuids,
				);
				for (const row of res.length > 0 ? res[0].values : []) {
					const node = this._toContextWindowNode(row as (string | number | null)[]);
					if (node) { result.set(node.uuid, node); }
				}
			} finally {
				db.close();
			}
		} catch { /* optional enrichment — suppress */ }
		return result;
	}

	/** Map one sessions-table row to a SessionContextWindow (null when the id is malformed). */
	private _toContextWindowNode(row: (string | number | null)[]): SessionContextWindow | null {
		const [uuid, tier, reached, limit] = row;
		if (typeof uuid !== 'string') { return null; }
		return {
			uuid,
			contextTier: typeof tier === 'string' && tier ? tier : null,
			contextReachedTokens: typeof reached === 'number' && reached > 0 ? reached : null,
			contextWindowLimit: typeof limit === 'number' && limit > 0 ? limit : null,
		};
	}

	private _buildHierarchyFromDb(
		db: initSqlJs.Database,
		sessionUuids: string[],
	): Map<string, SessionHierarchyNode> {
		const linkRows = this._queryLinkRows(db, sessionUuids);
		if (linkRows.length === 0) { return new Map(); }

		const parentUuids   = this._collectParentUuids(linkRows);
		const totalCounts   = this._queryTotalChildCounts(db, parentUuids);
		return this._buildResultMap(linkRows, totalCounts);
	}

	/** Query parent/child link rows for the given UUIDs (as child or parent). */
	private _queryLinkRows(
		db: initSqlJs.Database,
		sessionUuids: string[],
	): (string | null)[][] {
		const ph = sessionUuids.map(() => '?').join(', ');
		const sql = `
			SELECT cw.session_id, cw.name, pw.session_id, pw.name
			FROM workspace_parent_links l
			JOIN workspaces cw ON cw.id = l.child_workspace_id
			JOIN workspaces pw ON pw.id = l.parent_workspace_id
			WHERE cw.session_id IN (${ph}) OR pw.session_id IN (${ph})
		`;
		try {
			const res = db.exec(sql, [...sessionUuids, ...sessionUuids]);
			return res.length > 0 ? (res[0].values as (string | null)[][]) : [];
		} catch {
			return [];
		}
	}

	/** Collect the set of parent UUIDs from link rows. */
	private _collectParentUuids(rows: (string | null)[][]): Set<string> {
		const parents = new Set<string>();
		for (const row of rows) {
			const parentUuid = row[2] as string | null;
			if (parentUuid) { parents.add(parentUuid); }
		}
		return parents;
	}

	/** Query total child counts for each parent UUID (counts ALL DB children). */
	private _queryTotalChildCounts(
		db: initSqlJs.Database,
		parentUuids: Set<string>,
	): Map<string, number> {
		const counts = new Map<string, number>();
		if (parentUuids.size === 0) { return counts; }

		const ph  = Array.from(parentUuids).map(() => '?').join(', ');
		const sql = `
			SELECT pw.session_id, COUNT(*)
			FROM workspace_parent_links l
			JOIN workspaces pw ON pw.id = l.parent_workspace_id
			WHERE pw.session_id IN (${ph})
			GROUP BY pw.session_id
		`;
		try {
			const res = db.exec(sql, Array.from(parentUuids));
			if (res.length > 0) {
				for (const row of res[0].values) {
					counts.set(row[0] as string, row[1] as number);
				}
			}
		} catch { /* ignore — totalChildCount will default to childUuids.length */ }
		return counts;
	}

	/** Build the hierarchy map from link rows and precomputed total counts. */
	private _buildResultMap(
		rows: (string | null)[][],
		totalCounts: Map<string, number>,
	): Map<string, SessionHierarchyNode> {
		const result = new Map<string, SessionHierarchyNode>();

		const ensureNode = (uuid: string): SessionHierarchyNode => {
			if (!result.has(uuid)) {
				result.set(uuid, {
					uuid, parentUuid: null, parentName: null,
					childUuids: [], childNames: new Map(), totalChildCount: 0,
				});
			}
			return result.get(uuid)!;
		};

		for (const row of rows) {
			const [childUuid, childName, parentUuid, parentName] = row as (string | null)[];
			if (!childUuid || !parentUuid) { continue; }

			const childNode  = ensureNode(childUuid);
			const parentNode = ensureNode(parentUuid);

			childNode.parentUuid = parentUuid;
			childNode.parentName = parentName ?? null;

			if (!parentNode.childUuids.includes(childUuid)) {
				parentNode.childUuids.push(childUuid);
				parentNode.childNames.set(childUuid, childName ?? childUuid);
			}

			const total = totalCounts.get(parentUuid);
			if (total !== undefined && total > parentNode.totalChildCount) {
				parentNode.totalChildCount = total;
			}
		}

		// Ensure totalChildCount is at least as large as the observed list.
		for (const node of result.values()) {
			if (node.totalChildCount < node.childUuids.length) {
				node.totalChildCount = node.childUuids.length;
			}
		}
		return result;
	}
}
