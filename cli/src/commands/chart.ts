/**
 * `chart` command - Output pre-computed chart data (daily token usage for the last 30 days).
 */
import { Command } from 'commander';
import { discoverSessionFiles, calculateDailyStats, buildChartPayload } from '../helpers';
import { shouldOutputJson } from '../commandUtils';
import { createEmptyChartPayload } from './payloads';

export const chartCommand = new Command('chart')
	.description('Output daily token usage data for the chart webview')
	.option('--json', 'Output raw JSON (for machine consumption)')
	.action(async (options) => {
		if (!shouldOutputJson(options)) {
			// Human-readable not implemented yet; just emit JSON
			process.stderr.write('Use --json flag for chart data output\n');
			return;
		}

		const files = await discoverSessionFiles();
		if (files.length === 0) {
			process.stdout.write(JSON.stringify(createEmptyChartPayload()));
			return;
		}

		const { labels, days, allDaysMap } = await calculateDailyStats(files);
		const payload = buildChartPayload(labels, days, allDaysMap);
		process.stdout.write(JSON.stringify(payload));
	});
