/**
 * Promise utility helpers.
 */

export class TimeoutError extends Error {
  constructor(operation: string, timeoutMs: number) {
    super(`${operation} timed out after ${timeoutMs}ms`);
    this.name = 'TimeoutError';
  }
}

/**
 * Wraps a promise with a timeout to prevent indefinite hangs.
 * The timeout handle is cleared via `.finally()` to prevent memory leaks when
 * the promise settles before the timeout fires.
 *
 * @param promise - The promise to wrap
 * @param timeoutMs - Timeout in milliseconds
 * @param operation - Description of the operation (used in the rejection error message)
 * @returns A promise that rejects with a descriptive error if `timeoutMs` elapses before `promise` settles
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operation: string,
): Promise<T> {
  let timeoutHandle: NodeJS.Timeout | undefined;
  return Promise.race([
    promise.finally(() => {
      if (timeoutHandle) {
        clearTimeout(timeoutHandle);
      }
    }),
    new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(
        () => reject(new TimeoutError(operation, timeoutMs)),
        timeoutMs,
      );
    }),
  ]);
}

/** A one-shot, multi-waiter notification gate used to wake parked async workers. */
export interface WakeupGate {
  /** Resolves once the next `signal()` is called after this `wait()`. */
  wait(): Promise<void>;
  /** Wakes every currently parked waiter. No-op when nobody is waiting. */
  signal(): void;
}

/**
 * Creates an event-driven wakeup gate for producer/consumer pipelines.
 *
 * Consumers that find no work available call `await gate.wait()` to park until the
 * producer calls `gate.signal()`. This replaces timer-based polling (e.g.
 * `setTimeout(..., 20)` spin loops) so idle workers consume no CPU while waiting.
 *
 * The waiter is registered synchronously inside `wait()` (the Promise executor runs
 * before the returned promise is awaited), so a consumer can safely check its
 * condition and then `await gate.wait()` in the same synchronous tick without a
 * `signal()` slipping in unobserved between the two.
 */
export function createWakeupGate(): WakeupGate {
  let waiters: Array<() => void> = [];
  return {
    wait(): Promise<void> {
      return new Promise<void>((resolve) => { waiters.push(resolve); });
    },
    signal(): void {
      if (waiters.length === 0) { return; }
      const pending = waiters;
      waiters = [];
      for (const wake of pending) { wake(); }
    },
  };
}

/** A counting semaphore bounding how many holders may be admitted at once. */
export interface Semaphore {
  /**
   * Resolves `true` once a permit is acquired. If `timeoutMs` is given and elapses first,
   * resolves `false` instead and this waiter is removed from the queue — unlike racing a plain
   * `setTimeout` against a WakeupGate.wait(), the losing attempt does not linger.
   */
  acquire(timeoutMs?: number): Promise<boolean>;
  /** Releases a permit, handing it directly to the longest-waiting acquirer if any (FIFO), else returning it to the pool. */
  release(): void;
}

/**
 * Creates a counting semaphore with `permits` concurrent holders.
 *
 * Distinct from WakeupGate above: `signal()`/`wait()` there wakes *every* parked waiter on one
 * event, which is the right shape for "work is available, whoever's free can take it" but the
 * wrong one for "exactly N holders at a time" — every waiter can see the same just-freed slot and
 * proceed together, letting the count of concurrent holders drift past N. `release()` here wakes
 * at most one waiter per freed permit, so admissions are bounded by the number of releases, not
 * by however many happened to be parked.
 */
export function createSemaphore(permits: number): Semaphore {
  let available = permits;
  const waiters: Array<(acquired: boolean) => void> = [];
  return {
    acquire(timeoutMs?: number): Promise<boolean> {
      if (available > 0) {
        available--;
        return Promise.resolve(true);
      }
      return new Promise<boolean>((resolve) => {
        let timeoutHandle: NodeJS.Timeout | undefined;
        const settle = (acquired: boolean) => {
          if (timeoutHandle) { clearTimeout(timeoutHandle); }
          resolve(acquired);
        };
        waiters.push(settle);
        if (timeoutMs !== undefined) {
          timeoutHandle = setTimeout(() => {
            const idx = waiters.indexOf(settle);
            if (idx !== -1) { waiters.splice(idx, 1); }
            settle(false);
          }, timeoutMs);
        }
      });
    },
    release(): void {
      // Hand the permit directly to the next waiter rather than incrementing `available` and
      // letting it re-acquire — that would leave a window where a *different* concurrent
      // acquire() could grab the just-freed permit first, starving the longest-waiting caller.
      const next = waiters.shift();
      if (next) {
        next(true);
        return;
      }
      // Clamped rather than incremented unconditionally: a caller bug that releases more times
      // than it successfully acquired (a double-release on one code path, say) would otherwise
      // silently admit more concurrent holders than `permits` ever allows — exactly the unbounded
      // concurrency this primitive exists to prevent. This can only be reached with no waiters
      // parked, so clamping here never withholds a permit a genuine acquire() is waiting on.
      available = Math.min(permits, available + 1);
    },
  };
}
