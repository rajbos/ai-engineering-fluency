/**
 * AI Engineering Fluency CLI
 *
 * Command-line interface for analyzing AI coding tool token usage
 * from local session files. Can be run via `npx @rajbos/ai-engineering-fluency`.
 */
import { createProgram } from './program';

// Node writes console.debug and console.info to stdout, where a line from the shared src/
// modules (e.g. skipping an oversized session file) would break JSON.parse of `--json` output.
// Set here, not in src/: the extension and library consumers keep their own console behavior.
console.debug = console.error;
console.info = console.error;

// parseAsync, not parse: `memory-files --server/--promote` has an async action handler, and
// Commander does not await async handlers through parse(). Without this the command can
// finish outside the CLI lifecycle and a rejected promise would surface as an unhandled
// rejection rather than a non-zero exit with a readable message.
createProgram().parseAsync().catch((error: unknown) => {
	process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
	process.exitCode = 1;
});
