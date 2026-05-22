/**
 * `all` command - Output all view data in a single JSON response.
 * Used by the Visual Studio extension to load every view in one CLI call
 * instead of spawning four separate processes.
 */
import { Command } from 'commander';
import {
	discoverSessionFiles,
	calculateDetailedStats,
	calculateDailyStats,
	buildChartPayload,
	calculateUsageAnalysisStats,
	buildCustomizationMatrix,
} from '../helpers';
import { calculateMaturityScores } from '../../../vscode-extension/src/maturityScoring';
import { shouldOutputJson } from '../commandUtils';
import {
	createEmptyDetailsPayload,
	createEmptyChartPayload,
	createEmptyUsageAnalysisPayload,
	createEmptyFluencyPayload,
	createDetailsPayload,
	createUsageAnalysisPayload,
	createFluencyPayload,
} from './payloads';

export const allCommand = new Command('all')
	.description('Output all view data in a single JSON response (for Visual Studio extension)')
	.option('--json', 'Output raw JSON (required)')
	.action(async (options) => {
		if (!shouldOutputJson(options)) {
			process.stderr.write('Use --json flag for all data output\n');
			return;
		}

		const now = new Date();
		const files = await discoverSessionFiles();

		if (files.length === 0) {
			const empty = {
				details: createEmptyDetailsPayload(now),
				chart:   createEmptyChartPayload(now),
				usage:   createEmptyUsageAnalysisPayload(now),
				fluency: createEmptyFluencyPayload(),
			};
			process.stdout.write(JSON.stringify(empty));
			return;
		}

		// Run the three independent stat computations in parallel.
		// The in-memory CLI session cache means each file is only parsed once even
		// though all three functions iterate the same session file list.
		const [detailedStats, { labels, days, allDaysMap }, usageStats] = await Promise.all([
			calculateDetailedStats(files),
			calculateDailyStats(files),
			calculateUsageAnalysisStats(files),
		]);

		// Build chart payload from daily stats
		const chartPayload = buildChartPayload(labels, days, allDaysMap);

		// Build details payload (mirrors the `usage --json` output)
		const detailsPayload = createDetailsPayload(detailedStats);

		// Build usage-analysis payload (mirrors the `usage-analysis --json` output)
		const usagePayload = createUsageAnalysisPayload(usageStats, now);

		// Build fluency/maturity payload (mirrors the `fluency --json` output)
		const customizationMatrix = await buildCustomizationMatrix(files);
		const scores = await calculateMaturityScores(
			customizationMatrix,
			async () => usageStats,
			false
		);
		const fluencyPayload = createFluencyPayload(scores);

		const payload = {
			details: detailsPayload,
			chart:   chartPayload,
			usage:   usagePayload,
			fluency: fluencyPayload,
		};

		process.stdout.write(JSON.stringify(payload));
	});
