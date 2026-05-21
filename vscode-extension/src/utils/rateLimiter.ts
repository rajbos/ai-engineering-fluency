/**
 * A simple time-based rate limiter that enforces a minimum cooldown between executions.
 */
export class RateLimiter {
	private lastExecutedAt = 0;
	private readonly cooldownMs: number;

	constructor(cooldownMs: number) {
		this.cooldownMs = cooldownMs;
	}

	/** Returns true if enough time has passed since the last recorded execution. */
	canExecute(): boolean {
		return Date.now() - this.lastExecutedAt >= this.cooldownMs;
	}

	/** Records the current timestamp as the last execution time. */
	recordExecution(): void {
		this.lastExecutedAt = Date.now();
	}
}
