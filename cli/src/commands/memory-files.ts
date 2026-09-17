/**
 * `memory-files` command — Copilot memory-files hygiene report for the CLI.
 *
 * Scans this machine's VS Code "User" directories (Code, Code - Insiders,
 * Code - Exploration, VSCodium, Cursor) for GitHub Copilot agent memory files
 * (`memory-tool/memories/`) and reports counts, staleness and unusually large
 * files. See docs/features/COPILOT-MEMORY-FILES-INSIGHT.md for background.
 *
 * Metadata only — file *content* is never read or printed beyond the
 * filename-derived title.
 */
import { Command } from 'commander';
import { shouldOutputJson } from '../commandUtils';
import { discoverAllMemoryFiles, analyzeMemoryFiles, DEFAULT_STALE_DAYS, DEFAULT_LARGE_FILE_BYTES } from '../../../src/copilotMemoryFiles';
import type { MemoryFilesAnalysis } from '../../../src/types';

const DEFAULT_LARGE_KB = DEFAULT_LARGE_FILE_BYTES / 1024;

/**
 * Parse a CLI numeric option strictly: the whole trimmed string must be an integer
 * (optionally signed), so trailing garbage like `30days` or `5kb` is rejected instead
 * of being silently truncated by `parseInt`. Returns `NaN` for anything that isn't a
 * clean integer, which the caller falls back to the default for.
 */
function parseStrictInt(value: string): number {
	const trimmed = value.trim();
	return /^-?\d+$/.test(trimmed) ? parseInt(trimmed, 10) : NaN;
}

/**
 * Resolve `--stale-days`/`--large-kb` CLI option strings to their clamped numeric values.
 *
 * An explicit `0` is a valid (if degenerate) threshold and must be clamped to the `1` floor,
 * not silently replaced by the default — `parseInt(...) || DEFAULT` would do exactly that
 * since `0` is falsy. Only a genuinely non-numeric value (missing/garbage input, or a value
 * with trailing non-digit characters such as `30days`) falls back to the default.
 */
export function resolveMemoryFilesThresholds(options: { staleDays?: string; largeKb?: string }): { staleDays: number; largeFileBytes: number } {
	const parsedStaleDays = parseStrictInt(options.staleDays ?? String(DEFAULT_STALE_DAYS));
	const staleDays = Math.max(1, Number.isNaN(parsedStaleDays) ? DEFAULT_STALE_DAYS : parsedStaleDays);
	const parsedLargeKb = parseStrictInt(options.largeKb ?? String(DEFAULT_LARGE_KB));
	const largeFileBytes = Math.max(1, Number.isNaN(parsedLargeKb) ? DEFAULT_LARGE_KB : parsedLargeKb) * 1024;
	return { staleDays, largeFileBytes };
}

export const memoryFilesCommand = new Command('memory-files')
	.description('Report on GitHub Copilot agent memory files on this machine (counts, staleness, size)')
	.option('--json', 'Output raw JSON (for machine consumption)')
	.option('--stale-days <days>', `Days since last edit before a memory file is flagged stale (default: ${DEFAULT_STALE_DAYS})`, String(DEFAULT_STALE_DAYS))
	.option('--large-kb <kb>', `Size in KB above which a memory file is flagged large (default: ${DEFAULT_LARGE_KB})`, String(DEFAULT_LARGE_KB))
	.action((options) => {
		const { staleDays, largeFileBytes } = resolveMemoryFilesThresholds(options);

		const files = discoverAllMemoryFiles();
		const analysis = analyzeMemoryFiles(files, { staleDays, largeFileBytes });

		if (shouldOutputJson(options)) {
			process.stdout.write(JSON.stringify(analysis));
		} else {
			printMemoryFilesReport(analysis);
		}
	});

function printMemoryFilesReport(analysis: MemoryFilesAnalysis): void {
	process.stdout.write(`\nCopilot Memory Files Report\n`);
	process.stdout.write('='.repeat(50) + '\n\n');

	if (analysis.totalFiles === 0) {
		process.stdout.write('No Copilot memory files found on this machine.\n');
		return;
	}

	process.stdout.write(`Total memory files: ${analysis.totalFiles}\n`);
	process.stdout.write(`Total size:          ${(analysis.totalBytes / 1024).toFixed(1)} KB\n`);
	process.stdout.write(`Stale (>${analysis.staleDays}d):        ${analysis.staleFileCount}\n`);
	process.stdout.write(`Large (>${Math.round(analysis.largeFileBytes / 1024)}KB):      ${analysis.largeFileCount}\n\n`);

	process.stdout.write('By workspace:\n');
	for (const ws of analysis.byWorkspace) {
		const label = ws.workspaceName ?? ws.workspaceHash ?? 'unknown';
		process.stdout.write(`  • ${label}\n`);
		process.stdout.write(`      repo-scope: ${ws.repoCount}, session-scope: ${ws.sessionCount}, global-scope: ${ws.userCount}, size: ${(ws.totalBytes / 1024).toFixed(1)} KB\n`);
		if (ws.staleFiles.length > 0) {
			process.stdout.write(`      stale: ${ws.staleFiles.map(f => f.title).join(', ')}\n`);
		}
	}
	process.stdout.write('\n');
}
