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
