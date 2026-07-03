/**
 * `chart` command - Output pre-computed chart data (daily token usage for the last 30 days).
 */
import { Command } from 'commander';
import chalk from 'chalk';
import { discoverSessionFiles, calculateDailyStats, buildChartPayload, fmt, formatTokens } from '../helpers';
import { shouldOutputJson } from '../commandUtils';
import { createEmptyChartPayload } from './payloads';

export const chartCommand = new Command('chart')
	.description('Output daily token usage data for the chart webview')
	.option('--json', 'Output raw JSON (for machine consumption)')
	.option('-v, --verbose', 'Show debug log discovery details')
	.action(async (options) => {
		const files = await discoverSessionFiles();
		if (files.length === 0) {
			if (shouldOutputJson(options)) {
				process.stdout.write(JSON.stringify(createEmptyChartPayload()));
			} else {
				console.log(chalk.yellow('⚠️  No session files found.'));
			}
			return;
		}

		const verbose = options.verbose === true;
		const { labels, days, allDaysMap } = await calculateDailyStats(files, verbose);
		const payload = buildChartPayload(labels, days, allDaysMap) as any;

		if (shouldOutputJson(options)) {
			process.stdout.write(JSON.stringify(payload));
			return;
		}

		// Human-readable output
		console.log(chalk.bold.cyan('\n📊 Token Usage Summary\n'));

		const periods = payload.periods || {};
		const periodNames = [
			{ key: 'day', label: 'Daily (last 30 days)' },
			{ key: 'week', label: 'Weekly (last 6 weeks)' },
			{ key: 'month', label: 'Monthly (last 12 months)' },
		];

		for (const { key, label } of periodNames) {
			const period = periods[key];
			if (!period) continue;

			console.log(chalk.bold(label));
			console.log(chalk.dim('─'.repeat(60)));

			const rows = (period.labels || []).map((periodLabel: string, idx: number) => {
				const tokens = period.tokensData?.[idx] ?? 0;
				const cost = period.costData?.[idx] ?? 0;
				return {
					Period: periodLabel,
					Tokens: fmt(tokens),
					Cost: `$${cost.toFixed(2)}`,
				};
			});

			// Print table
			if (rows.length > 0) {
				console.table(rows);
			}

			// Print totals
			const totalTokens = period.totalTokens ?? 0;
			const totalCost = period.totalCost ?? 0;
			const periodCount = period.periodCount ?? 0;
			const avgTokens = periodCount > 0 ? Math.round(totalTokens / periodCount) : 0;
			const avgCost = periodCount > 0 ? totalCost / periodCount : 0;

			console.log(chalk.bold('Totals:'));
			console.log(`  Total Tokens: ${fmt(totalTokens)}`);
			console.log(`  Total Cost:   $${totalCost.toFixed(2)}`);
			console.log(`  Avg per Period: ${fmt(avgTokens)} tokens, $${avgCost.toFixed(2)} cost`);
			console.log();
		}
	});
