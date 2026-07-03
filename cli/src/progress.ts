/**
 * ProgressTracker - Reusable inline progress output for CLI commands.
 *
 * Wraps the shared formatting helpers with a stateful silent-mode flag so
 * callers don't need to sprinkle `if (!json)` guards around every call.
 * Construct with `silent = true` to suppress all output (e.g. when --json is active).
 */
import { clearLine, writeProgress } from './formatting';

const CLEAR_LINE_WIDTH = 80;

export class ProgressTracker {
	private readonly silent: boolean;

	constructor(silent = false) {
		this.silent = silent;
	}

	/** Write a progress message inline (no newline). */
	show(msg: string): void {
		if (!this.silent) {
			writeProgress(msg);
		}
	}

	/** Overwrite the current line with an updated progress message. */
	update(msg: string): void {
		if (!this.silent) {
			process.stdout.write('\r');
			writeProgress(msg);
		}
	}

	/** Clear the current progress line. */
	done(): void {
		if (!this.silent) {
			clearLine(CLEAR_LINE_WIDTH);
		}
	}
}
