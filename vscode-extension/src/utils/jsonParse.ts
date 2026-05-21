/**
 * Parses a JSON string, returning undefined on failure.
 * Logs parsing errors with the provided context label.
 */
export function safeJsonParse<T>(content: string, context: string): T | undefined {
  try {
    return JSON.parse(content) as T;
  } catch (err) {
    console.error(`[${context}] JSON parse error:`, err);
    return undefined;
  }
}
