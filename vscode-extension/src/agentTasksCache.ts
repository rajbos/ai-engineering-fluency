/**
 * Cross-window cache for the Copilot cloud-agent task snapshot.
 *
 * Collecting agent sessions costs a task-list call per repo plus one detail call per task, so it
 * is deliberately expensive to refresh: the snapshot is written to a JSON file in the extension's
 * global storage (shared by every VS Code window of this edition) and refreshed at most once an
 * hour, by whichever window currently holds the agent-tasks lock. Every other window — and every
 * panel open in between — reads this file instead of calling GitHub.
 *
 * The file I/O lives here; the freshness decisions are pure functions so they can be unit tested
 * without touching disk, following the same split as `worktreeBackgroundScan.ts`.
 */
import * as fs from 'fs';
import * as path from 'path';
import type { AgentSessionsResult } from './agentSessionsService';

/** How often the agent-task snapshot may be refreshed from the GitHub API: once an hour. */
export const AGENT_TASKS_REFRESH_INTERVAL_MS = 60 * 60 * 1000;

/**
 * Bumped whenever the shape of `AgentSessionsResult` changes in a way that would make an older
 * snapshot render incorrectly. Snapshots from a different version are ignored (and refetched).
 */
export const AGENT_TASKS_CACHE_SCHEMA_VERSION = 2;

/** On-disk envelope: the snapshot plus what it takes to decide whether it is still usable. */
export interface AgentTasksCacheEnvelope {
	schemaVersion: number;
	/** When the snapshot was fetched from GitHub (ISO 8601). */
	fetchedAt: string;
	/** Start of the window the snapshot covers (ISO 8601), so a widened window invalidates it. */
	since: string;
	data: AgentSessionsResult;
}

/** Path of the shared snapshot file for this cache identifier (dev and prod are kept separate). */
export function getAgentTasksCachePath(globalStoragePath: string, cacheIdentifier: string): string {
	return path.join(globalStoragePath, `agenttasks_${cacheIdentifier}.snapshot.json`);
}

/**
 * Whether a snapshot is still fresh enough to serve without calling GitHub. A missing or
 * unparseable timestamp counts as stale, and so does one in the future by more than the interval
 * (a clock change) so a bad timestamp can never pin the cache open forever.
 */
export function isAgentTasksSnapshotFresh(
	fetchedAt: string | undefined,
	now: number,
	intervalMs: number = AGENT_TASKS_REFRESH_INTERVAL_MS,
): boolean {
	if (!fetchedAt) { return false; }
	const fetchedMs = Date.parse(fetchedAt);
	if (!Number.isFinite(fetchedMs)) { return false; }
	const age = now - fetchedMs;
	if (age < -intervalMs) { return false; }
	return age < intervalMs;
}

/** Whether this envelope can be served as-is: right schema, same window, still fresh. */
export function canServeAgentTasksSnapshot(
	envelope: AgentTasksCacheEnvelope | undefined,
	since: Date,
	now: number,
	intervalMs: number = AGENT_TASKS_REFRESH_INTERVAL_MS,
): boolean {
	if (!isAgentTasksEnvelopeUsable(envelope, since)) { return false; }
	return isAgentTasksSnapshotFresh(envelope?.fetchedAt, now, intervalMs);
}

/**
 * Whether an envelope may be shown at all (even when stale): a stale snapshot is still the best
 * thing to render while the next hourly refresh is pending, but one from another schema version or
 * covering a shorter window than asked for is not.
 */
export function isAgentTasksEnvelopeUsable(
	envelope: AgentTasksCacheEnvelope | undefined,
	since: Date,
): boolean {
	if (!envelope || envelope.schemaVersion !== AGENT_TASKS_CACHE_SCHEMA_VERSION) { return false; }
	if (!envelope.data || !Array.isArray(envelope.data.repos)) { return false; }
	const snapshotSince = Date.parse(envelope.since);
	if (!Number.isFinite(snapshotSince)) { return false; }
	// Tolerate a minute of drift: `since` is recomputed as "30 days ago" on every call.
	return snapshotSince <= since.getTime() + 60_000;
}

/** When the next refresh becomes due, as an ISO timestamp (undefined when it is due now). */
export function nextAgentTasksRefreshAt(
	fetchedAt: string | undefined,
	intervalMs: number = AGENT_TASKS_REFRESH_INTERVAL_MS,
): string | undefined {
	if (!fetchedAt) { return undefined; }
	const fetchedMs = Date.parse(fetchedAt);
	if (!Number.isFinite(fetchedMs)) { return undefined; }
	return new Date(fetchedMs + intervalMs).toISOString();
}

/** Read the shared snapshot, returning undefined when it is missing or unreadable. */
export async function readAgentTasksSnapshot(filePath: string): Promise<AgentTasksCacheEnvelope | undefined> {
	try {
		const raw = await fs.promises.readFile(filePath, 'utf8');
		const parsed = JSON.parse(raw);
		if (!parsed || typeof parsed !== 'object') { return undefined; }
		return parsed as AgentTasksCacheEnvelope;
	} catch {
		return undefined;
	}
}

/**
 * Write the shared snapshot. Writes to a temporary file first and renames it into place so a
 * window reading concurrently never sees a half-written file.
 */
export async function writeAgentTasksSnapshot(filePath: string, envelope: AgentTasksCacheEnvelope): Promise<void> {
	await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
	const tempPath = `${filePath}.${process.pid}.tmp`;
	await fs.promises.writeFile(tempPath, JSON.stringify(envelope), 'utf8');
	try {
		await fs.promises.rename(tempPath, filePath);
	} catch (err) {
		await fs.promises.rm(tempPath, { force: true });
		throw err;
	}
}
