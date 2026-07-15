/**
 * Promise utility helpers.
 */

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
        () => reject(new Error(`${operation} timed out after ${timeoutMs}ms`)),
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
