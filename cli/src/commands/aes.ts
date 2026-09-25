/**
 * `aes` command — render an AES workflow assessment report.
 *
 * Proves the {@link AesWorkflowAssessment} data model and its pure report
 * generator end-to-end. There is no assessment-authoring UI yet (that is a
 * guided VS Code view, tracked separately — see
 * `docs/features/AES-WORKFLOW-ASSESSMENT.md`), so this command currently
 * renders the fictional FableCart fixture. `--file` accepts a JSON file
 * matching {@link AesWorkflowAssessment} once a team has one to render
 * instead.
 */
import * as fs from 'fs';
import * as path from 'path';
import { Command } from 'commander';
import chalk from 'chalk';
import { buildAesWorkflowReport } from '../../../src/aesWorkflowAssessment';
import { renderAesReportHtml, renderAesReportText } from '../../../src/aesWorkflowReportRenderer';
import { FABLECART_AES_ASSESSMENT } from '../../../src/aesFableCartFixture';
import type { AesWorkflowAssessment } from '../../../src/types';
import { shouldOutputJson } from '../commandUtils';

/** Load an assessment from `--file`, or fall back to the FableCart fixture. */
export function loadAesAssessment(filePath: string | undefined): { assessment: AesWorkflowAssessment; isFixture: boolean } {
	if (!filePath) {
		return { assessment: FABLECART_AES_ASSESSMENT, isFixture: true };
	}
	const raw = fs.readFileSync(path.resolve(filePath), 'utf8');
	return { assessment: JSON.parse(raw) as AesWorkflowAssessment, isFixture: false };
}

export const aesCommand = new Command('aes')
	.description('Render an AES (Agentic Engineering System) workflow assessment report')
	.option('--file <path>', 'Path to a JSON file matching the AesWorkflowAssessment shape (defaults to the FableCart fixture)')
	.option('--json', 'Output raw JSON (for machine consumption)')
	.option('--html <path>', 'Also write a self-contained HTML report to this path')
	.action((options: { file?: string; json?: boolean; html?: string }) => {
		let loaded: { assessment: AesWorkflowAssessment; isFixture: boolean };
		try {
			loaded = loadAesAssessment(options.file);
		} catch (error) {
			console.error(chalk.red(`Could not read assessment file: ${error instanceof Error ? error.message : String(error)}`));
			process.exitCode = 1;
			return;
		}

		const report = buildAesWorkflowReport(loaded.assessment);

		if (options.html) {
			const outPath = path.resolve(options.html);
			fs.writeFileSync(outPath, renderAesReportHtml(report), 'utf8');
			if (!shouldOutputJson(options)) {
				console.log(chalk.dim(`HTML report written to ${outPath}`));
			}
		}

		if (shouldOutputJson(options)) {
			process.stdout.write(JSON.stringify(report));
			return;
		}

		if (loaded.isFixture) {
			console.log(chalk.yellow('⚠️  No --file supplied — rendering the fictional FableCart fixture.\n'));
		}
		console.log(renderAesReportText(report));
	});
