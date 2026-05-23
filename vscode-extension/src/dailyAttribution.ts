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
		const requestTsMap: Record<number, unknown> = {};
		const lines = content.trim().split('\n');
		for (const line of lines) {
			if (!line.trim()) { continue; }
			try {
				const event = JSON.parse(line);
				if (event.type === 'user.message') {
					recordTimestamp(event.timestamp ?? event.ts ?? event.data?.timestamp, dayCounts);
					continue;
				}
				this.processVsCodeDeltaEvent(event, requestTsMap, dayCounts);
			} catch { /* skip malformed lines */ }
		}
		return dayCounts;
	}

	private processVsCodeDeltaEvent(event: any, requestTsMap: Record<number, unknown>, dayCounts: Record<string, number>): void {
		const kind = event.kind;
		const k: unknown[] = event.k;
		const v = event.v;
		if (kind === 0 && v?.requests && Array.isArray(v.requests)) {
			this.processKind0Event(v, dayCounts);
		} else if (kind === 2 && Array.isArray(k) && k[0] === 'requests') {
			this.processKind2Event(k, v, requestTsMap, dayCounts);
		} else if (this.isKind1TimestampUpdate(kind, k)) {
			this.processKind1Event(k, v, requestTsMap, dayCounts);
		}
	}

	private isKind1TimestampUpdate(kind: unknown, k: unknown[]): boolean {
		return kind === 1 && Array.isArray(k) && k.length === 3 && k[0] === 'requests' &&
			(k[2] === 'timestamp' || k[2] === 'ts') && typeof k[1] === 'number';
	}

	private processKind0Event(v: any, dayCounts: Record<string, number>): void {
		for (const req of v.requests) {
			recordTimestamp(req.timestamp ?? req.ts, dayCounts);
		}
	}

	private processKind2Event(k: unknown[], v: unknown, requestTsMap: Record<number, unknown>, dayCounts: Record<string, number>): void {
		if (Array.isArray(v)) {
			for (const req of v) {
				recordTimestamp((req as Record<string, unknown>).timestamp ?? (req as Record<string, unknown>).ts, dayCounts);
			}
		} else if (v && typeof v === 'object') {
			const ts = (v as Record<string, unknown>).timestamp ?? (v as Record<string, unknown>).ts;
			if (ts !== undefined) { recordTimestamp(ts, dayCounts); }
			if (typeof k[1] === 'number') { requestTsMap[k[1]] = ts; }
		}
	}

	private processKind1Event(k: unknown[], v: unknown, requestTsMap: Record<number, unknown>, dayCounts: Record<string, number>): void {
		const idx = k[1] as number;
		if (requestTsMap[idx] === undefined) { recordTimestamp(v, dayCounts); }
		requestTsMap[idx] = v;
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

/** Parse and validate a raw timestamp value. Returns a Date or null if invalid/absent. */
function parseAndValidateTimestamp(raw: unknown): Date | null {
	if (raw === undefined || raw === null) { return null; }
	const date = new Date(raw as string | number);
	return isNaN(date.getTime()) ? null : date;
}

/** Record a timestamp into a day-count map, ignoring null/undefined/invalid values. */
function recordTimestamp(ts: unknown, dayCounts: Record<string, number>): void {
	const date = parseAndValidateTimestamp(ts);
	if (date !== null) {
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
