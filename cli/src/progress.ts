/**
 * ProgressTracker - Reusable inline progress output for CLI commands.
 *
 * Writes dimmed progress messages to stdout using carriage-return overwriting.
 * Construct with `silent = true` to suppress all output (e.g. when --json is active).
 */
import chalk from 'chalk';

const CLEAR_LINE_WIDTH = 80;

export class ProgressTracker {
	private readonly silent: boolean;

	constructor(silent = false) {
		this.silent = silent;
	}

	/** Write a progress message inline (no newline). */
	show(msg: string): void {
		if (!this.silent) {
			process.stdout.write(chalk.dim(msg));
		}
	}

	/** Overwrite the current line with an updated progress message. */
	update(msg: string): void {
		if (!this.silent) {
			process.stdout.write(`\r${chalk.dim(msg)}`);
		}
	}

	/** Clear the current progress line. */
	done(): void {
		if (!this.silent) {
			process.stdout.write('\r' + ' '.repeat(CLEAR_LINE_WIDTH) + '\r');
		}
	}
}
