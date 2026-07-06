/**
 * Shared utilities for CLI command option handling.
 * Helpers are extracted here when used across 3+ command files.
 */

/**
 * Returns true when the --json flag is present, suppressing human-readable output
 * in favour of machine-consumable JSON written to stdout.
 *
 * Commander option bags carry all flags of a command, so extra keys are allowed.
 */
export function shouldOutputJson(options: { json?: boolean; [key: string]: unknown }): boolean {
	return options.json === true;
}
