/**
 * AI Engineering Fluency CLI
 *
 * Command-line interface for analyzing GitHub Copilot token usage
 * from local session files. Can be run via `npx @rajbos/ai-engineering-fluency`.
 */
import { Command } from 'commander';
import { statsCommand } from './commands/stats';
import { usageCommand } from './commands/usage';
import { environmentalCommand } from './commands/environmental';
import { fluencyCommand } from './commands/fluency';
import { diagnosticsCommand } from './commands/diagnostics';
import { chartCommand } from './commands/chart';
import { usageAnalysisCommand } from './commands/usage-analysis';
import { allCommand } from './commands/all';
import { segmentCommand } from './commands/segment';
import { curationCommand } from './commands/curation';
import { memoryFilesCommand } from './commands/memory-files';
import { aesCommand } from './commands/aes';
import { loadCache, saveCache, disableCache } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const packageJson = require('../package.json');

const program = new Command();

program
	.name('copilot-token-tracker')
	.description('Analyze GitHub Copilot token usage from local session files')
	.version(packageJson.version)
	.option('--no-cache', 'Bypass the session file cache and re-parse everything');

// Initialise / tear-down cache around every sub-command
program.hook('preAction', () => {
	if (program.opts().cache === false) {
		disableCache();
	} else {
		loadCache();
	}
});
program.hook('postAction', () => {
	saveCache();
});

program.addCommand(statsCommand);
program.addCommand(usageCommand);
program.addCommand(environmentalCommand);
program.addCommand(fluencyCommand);
program.addCommand(diagnosticsCommand);
program.addCommand(chartCommand);
program.addCommand(usageAnalysisCommand);
program.addCommand(allCommand);
program.addCommand(segmentCommand);
program.addCommand(curationCommand);
program.addCommand(memoryFilesCommand);
program.addCommand(aesCommand);

// parseAsync, not parse: `memory-files --server/--promote` has an async action handler, and
// Commander does not await async handlers through parse(). Without this the command can
// finish outside the CLI lifecycle and a rejected promise would surface as an unhandled
// rejection rather than a non-zero exit with a readable message.
program.parseAsync().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
