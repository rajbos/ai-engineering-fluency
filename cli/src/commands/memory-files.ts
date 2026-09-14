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
import { discoverAllMemoryFiles, analyzeMemoryFiles } from '../../../src/copilotMemoryFiles';
import type { MemoryFilesAnalysis } from '../../../src/types';

const DEFAULT_STALE_DAYS = 90;
const DEFAULT_LARGE_KB = 10;

export const memoryFilesCommand = new Command('memory-files')
	.description('Report on GitHub Copilot agent memory files on this machine (counts, staleness, size)')
	.option('--json', 'Output raw JSON (for machine consumption)')
	.option('--stale-days <days>', `Days since last edit before a memory file is flagged stale (default: ${DEFAULT_STALE_DAYS})`, String(DEFAULT_STALE_DAYS))
	.option('--large-kb <kb>', `Size in KB above which a memory file is flagged large (default: ${DEFAULT_LARGE_KB})`, String(DEFAULT_LARGE_KB))
	.action((options) => {
		const staleDays = Math.max(1, parseInt(options.staleDays ?? String(DEFAULT_STALE_DAYS), 10) || DEFAULT_STALE_DAYS);
		const largeFileBytes = Math.max(1, parseInt(options.largeKb ?? String(DEFAULT_LARGE_KB), 10) || DEFAULT_LARGE_KB) * 1024;

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
		process.stdout.write(`      repo-scope: ${ws.repoCount}, session-scope: ${ws.sessionCount}, size: ${(ws.totalBytes / 1024).toFixed(1)} KB\n`);
		if (ws.staleFiles.length > 0) {
			process.stdout.write(`      stale: ${ws.staleFiles.map(f => f.title).join(', ')}\n`);
		}
	}
	process.stdout.write('\n');
}
