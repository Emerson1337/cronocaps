/**
 * Type-safe JSON parse that returns unknown, forcing callers
 * to validate the result before use.
 */
export function parseJSON(text: string): unknown {
  return JSON.parse(text);
}
