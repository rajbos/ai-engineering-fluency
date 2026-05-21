/**
 * Shared utilities for CLI command option handling.
 * Helpers are extracted here when used across 3+ command files.
 */

/**
 * Returns true when the --json flag is present, suppressing human-readable output
 * in favour of machine-consumable JSON written to stdout.
 */
export function shouldOutputJson(options: { json?: boolean }): boolean {
	return options.json === true;
}
