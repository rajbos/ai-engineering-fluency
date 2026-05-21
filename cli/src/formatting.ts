/**
 * Shared CLI output formatting helpers.
 * Centralises repeated progress-line patterns used across CLI command files.
 */
import chalk from 'chalk';

/** Width used to blank out a progress line. */
const DEFAULT_CLEAR_WIDTH = 50;

/**
 * Overwrite the current terminal line with spaces to erase a progress message.
 * Uses a carriage return so the cursor stays on the same line.
 */
export function clearLine(width = DEFAULT_CLEAR_WIDTH): void {
	process.stdout.write('\r' + ' '.repeat(width) + '\r');
}

/**
 * Write a dim progress message to stdout without a trailing newline.
 * Pair with {@link clearLine} to erase it when the operation completes.
 */
export function writeProgress(msg: string): void {
	process.stdout.write(chalk.dim(msg));
}

/**
 * Overwrite the current line with a "Processing: X/Y files" counter.
 * Designed to be called repeatedly inside a loop — the carriage return
 * keeps all updates on the same line.
 */
export function writeProgressCount(completed: number, total: number): void {
	process.stdout.write(`\r${chalk.dim(`Processing: ${completed}/${total} files`)}`);
}
