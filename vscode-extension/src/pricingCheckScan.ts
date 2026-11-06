import type { Stats } from 'fs';
import type { SessionFileDetails } from '../../src/types';

/** Minimum gap between progress reports, so a large scan doesn't flood the webview with messages. */
const PROGRESS_INTERVAL_MS = 200;

export interface PricingCheckScanDeps {
	listSessionFiles(): Promise<string[]>;
	statSessionFile(file: string): Promise<Stats>;
	getSessionFileDetails(file: string, stat: Stats): Promise<SessionFileDetails>;
	/** Checked before every file. A true answer stops the scan and it resolves to null. */
	isCancelled(): boolean;
	onProgress?(processed: number, total: number): void;
}

export interface PricingCheckScanResult {
	/** Every session file whose timestamp falls in the range, for all editors. */
	files: SessionFileDetails[];
	/** Files that could not be read. Their usage is missing from the total, so the view says so. */
	unreadableCount: number;
}

/**
 * Computes [startMs, endMs) bounds for a Pricing Check time-range filter, using the
 * user's local calendar (not UTC) so "today"/"this week"/etc. match their wall clock.
 * Returns null for 'all' (no filtering). Weeks start on Monday (ISO-8601 convention).
 */
export function getPricingCheckTimeRangeBounds(range: string, now: Date = new Date()): { startMs: number; endMs: number } | null {
	const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
	const todayStart = startOfDay(now);
	switch (range) {
		case 'today':
			return { startMs: todayStart, endMs: now.getTime() };
		case 'yesterday': {
			const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).getTime();
			return { startMs: yesterdayStart, endMs: todayStart };
		}
		case 'week': {
			// ISO week: Monday = start. getDay() is 0=Sun..6=Sat; convert to days-since-Monday.
			const dayOfWeek = (now.getDay() + 6) % 7;
			const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - dayOfWeek).getTime();
			return { startMs: weekStart, endMs: now.getTime() };
		}
		case 'month':
			return { startMs: new Date(now.getFullYear(), now.getMonth(), 1).getTime(), endMs: now.getTime() };
		case 'lastMonth':
			return {
				startMs: new Date(now.getFullYear(), now.getMonth() - 1, 1).getTime(),
				endMs: new Date(now.getFullYear(), now.getMonth(), 1).getTime(),
			};
		default:
			return null;
	}
}

/** Resolves the best available timestamp (ms) for a session file, for time-range filtering. */
export function getSessionFileTimestampMs(f: SessionFileDetails): number | null {
	const raw = f.lastInteraction || f.firstInteraction || f.modified;
	if (!raw) { return null; }
	const parsed = Date.parse(raw);
	return Number.isNaN(parsed) ? null : parsed;
}

function isInRange(details: SessionFileDetails, bounds: { startMs: number; endMs: number } | null): boolean {
	if (!bounds) { return true; }
	const ts = getSessionFileTimestampMs(details);
	return ts !== null && ts >= bounds.startMs && ts < bounds.endMs;
}

/**
 * Finds the session files behind a Pricing Check range by scanning the full discovery list.
 * The list the rest of the Diagnostics screen uses is capped to 14 days and 500 files, which
 * silently undercounted every range that reached past the cap, so a cost total checked here
 * could never match the tokens behind it.
 *
 * A file last written before the range starts cannot have activity in it, so its details are
 * never loaded. Only the start can be checked this way: a write can land after a session's
 * last interaction, so the end of the range is decided from the session's own timestamp.
 *
 * Resolves to null if cancelled.
 */
export async function scanPricingCheckFiles(deps: PricingCheckScanDeps, timeRange: string, now: Date = new Date()): Promise<PricingCheckScanResult | null> {
	const bounds = getPricingCheckTimeRangeBounds(timeRange, now);
	const sessionFiles = await deps.listSessionFiles();
	const files: SessionFileDetails[] = [];
	let unreadableCount = 0;
	let lastProgressAt = 0;
	for (let i = 0; i < sessionFiles.length; i++) {
		if (deps.isCancelled()) { return null; }
		try {
			const stat = await deps.statSessionFile(sessionFiles[i]);
			if (!bounds || stat.mtime.getTime() >= bounds.startMs) {
				const details = await deps.getSessionFileDetails(sessionFiles[i], stat);
				if (isInRange(details, bounds)) { files.push(details); }
			}
		} catch {
			unreadableCount++;
		}
		const processed = i + 1;
		if (Date.now() - lastProgressAt >= PROGRESS_INTERVAL_MS || processed === sessionFiles.length) {
			lastProgressAt = Date.now();
			deps.onProgress?.(processed, sessionFiles.length);
		}
	}
	return deps.isCancelled() ? null : { files, unreadableCount };
}

/** Session files per editor, for the editor picker's counts. */
export function countFilesByEditor(files: SessionFileDetails[]): Record<string, number> {
	const counts: Record<string, number> = {};
	for (const f of files) {
		const editor = f.editorSource || 'Unknown';
		counts[editor] = (counts[editor] || 0) + 1;
	}
	return counts;
}
