import type { TtftSample } from '../../src/tokenEstimation';

export interface CachedTtftScanResult {
	samples: TtftSample[];
	fileCount: number;
}

/**
 * In-memory cache for TTFT scans, keyed by the scan-range selector.
 *
 * Granularity-only changes can reuse the same sample set immediately; widening the range
 * loads a new entry the first time and then stays hot for the rest of the diagnostics session.
 */
export class TtftScanResultCache {
	private readonly results = new Map<string, Promise<CachedTtftScanResult>>();

	public clear(): void {
		this.results.clear();
	}

	public getOrLoad(rangeKey: string, loader: () => Promise<CachedTtftScanResult>): Promise<CachedTtftScanResult> {
		const cached = this.results.get(rangeKey);
		if (cached) { return cached; }
		const pending = loader().catch((error) => {
			this.results.delete(rangeKey);
			throw error;
		});
		this.results.set(rangeKey, pending);
		return pending;
	}
}
