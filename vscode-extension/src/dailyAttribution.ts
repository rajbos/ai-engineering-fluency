/**
 * Shared per-UTC-day token attribution logic.
 *
 * Extracts a fraction map (`Record<"YYYY-MM-DD", 0..1>`) from any supported session
 * file format. The fractions sum to 1.0 and represent how many interactions fell on
 * each calendar day (UTC), so callers can proportionally attribute session tokens to
 * the correct day rather than lumping everything on the file's mtime date.
 *
 * Supported formats:
 *   - Copilot CLI JSONL   (`type === "user.message"` events with `timestamp`)
 *   - VS Code delta JSONL  (kind:0 initial state, kind:2 appends, kind:1 timestamp updates)
 *   - VS Code JSON         (`requests[].timestamp`)
 */

/** Strategy interface for extracting per-UTC-day interaction counts from session content. */
interface DailyFractionStrategy {
	extractCounts(content: string): Record<string, number>;
}

/** Handles JSONL session files: Copilot CLI events and VS Code delta events. */
class JsonlDailyFractionStrategy implements DailyFractionStrategy {
	extractCounts(content: string): Record<string, number> {
		const dayCounts: Record<string, number> = {};
		// Track per-index timestamps for kind:1 updates so we can record them
		// even when the corresponding kind:2 append had no timestamp yet.
		const requestTsMap: Record<number, unknown> = {};

		const lines = content.trim().split('\n');
		for (const line of lines) {
			if (!line.trim()) { continue; }
			try {
				const event = JSON.parse(line);

				// Copilot CLI JSONL: user.message events carry the interaction timestamp
				if (event.type === 'user.message') {
					const ts = event.timestamp ?? event.ts ?? event.data?.timestamp;
					recordTimestamp(ts, dayCounts);
					continue;
				}

				// VS Code delta JSONL
				const kind = event.kind;
				const k: unknown[] = event.k;
				const v = event.v;

				if (kind === 0 && v?.requests && Array.isArray(v.requests)) {
					// Initial state — extract timestamps from existing requests
					for (const req of v.requests) {
						const ts = req.timestamp ?? req.ts;
						recordTimestamp(ts, dayCounts);
					}
				} else if (kind === 2 && Array.isArray(k) && k[0] === 'requests') {
					if (Array.isArray(v)) {
						// Batch append
						for (const req of v) {
							const ts = req.timestamp ?? req.ts;
							recordTimestamp(ts, dayCounts);
						}
					} else if (v && typeof v === 'object') {
						// Single request append — may or may not have timestamp yet
						const ts = (v as Record<string, unknown>).timestamp ?? (v as Record<string, unknown>).ts;
						if (ts !== undefined) {
							recordTimestamp(ts, dayCounts);
						}
						// Track index for potential kind:1 timestamp update below
						if (typeof k[1] === 'number') {
							requestTsMap[k[1]] = ts;
						}
					}
				} else if (kind === 1 && Array.isArray(k) && k.length === 3 && k[0] === 'requests' &&
						(k[2] === 'timestamp' || k[2] === 'ts') && typeof k[1] === 'number') {
					// kind:1 updates the timestamp on an existing request
					const idx = k[1] as number;
					if (requestTsMap[idx] === undefined) {
						// First time seeing a timestamp for this request index
						recordTimestamp(v, dayCounts);
					}
					requestTsMap[idx] = v;
				}
			} catch { /* skip malformed lines */ }
		}
		return dayCounts;
	}
}

/** Handles plain VS Code JSON session files (`requests[].timestamp`). */
class JsonDailyFractionStrategy implements DailyFractionStrategy {
	extractCounts(content: string): Record<string, number> {
		const dayCounts: Record<string, number> = {};
		try {
			const data = JSON.parse(content);
			if (data.requests && Array.isArray(data.requests)) {
				for (const req of data.requests) {
					const ts = req.timestamp ?? req.ts ?? req.result?.timestamp;
					recordTimestamp(ts, dayCounts);
				}
			}
		} catch { /* skip */ }
		return dayCounts;
	}
}

/** Record a timestamp into a day-count map, ignoring null/undefined/invalid values. */
function recordTimestamp(ts: unknown, dayCounts: Record<string, number>): void {
	if (ts === undefined || ts === null) { return; }
	const date = new Date(ts as string | number);
	if (!isNaN(date.getTime())) {
		const key = date.toISOString().slice(0, 10);
		dayCounts[key] = (dayCounts[key] || 0) + 1;
	}
}

/**
 * Derive per-UTC-day fractions from session file content.
 *
 * @param content     Raw text content of the session file.
 * @param isJsonl     True when the file is a JSONL (line-delimited JSON) format.
 * @param fallbackDate Date to use when no interaction timestamps are found (typically file mtime).
 * @returns A `Record<"YYYY-MM-DD", number>` where values sum to 1.0.
 */
export function extractDailyFractions(content: string, isJsonl: boolean, fallbackDate: Date): Record<string, number> {
	const fallbackKey = fallbackDate.toISOString().slice(0, 10);
	const strategy: DailyFractionStrategy = isJsonl
		? new JsonlDailyFractionStrategy()
		: new JsonDailyFractionStrategy();
	const dayCounts = strategy.extractCounts(content);

	const total = Object.values(dayCounts).reduce((a, b) => a + b, 0);
	if (total === 0) {
		return { [fallbackKey]: 1.0 };
	}
	const fractions: Record<string, number> = {};
	for (const [key, count] of Object.entries(dayCounts)) {
		fractions[key] = count / total;
	}
	return fractions;
}
