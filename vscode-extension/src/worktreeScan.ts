import { withTimeout } from './utils/promises';

/** Maximum time one root may block discovery before the scan moves on. */
export const WORKTREE_ROOT_SCAN_TIMEOUT_MS = 30_000;

export interface WorktreeRootScanOptions<T> {
	roots: string[];
	isActive: () => boolean;
	scanRoot: (root: string, isRootActive: () => boolean) => Promise<T[]>;
	onRootError: (root: string, error: Error) => void;
	timeoutMs?: number;
}

/**
 * Scans roots sequentially while bounding each root independently. A timed-out operation cannot
 * be cancelled by Node's filesystem API, so `isRootActive` lets the traversal stop safely if the
 * pending I/O eventually settles.
 */
export async function scanWorktreeRootsWithTimeout<T>(
	options: WorktreeRootScanOptions<T>,
): Promise<T[]> {
	const results: T[] = [];
	const timeoutMs = options.timeoutMs ?? WORKTREE_ROOT_SCAN_TIMEOUT_MS;

	for (const root of options.roots) {
		if (!options.isActive()) { break; }
		let rootActive = true;
		try {
			const rootResults = await withTimeout(
				options.scanRoot(root, () => rootActive && options.isActive()),
				timeoutMs,
				`Worktree scan for "${root}"`,
			);
			if (!options.isActive()) { break; }
			results.push(...rootResults);
		} catch (error) {
			rootActive = false;
			if (!options.isActive()) { break; }
			options.onRootError(root, error instanceof Error ? error : new Error(String(error)));
		}
	}

	return results;
}
