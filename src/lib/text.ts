/**
 * Text helpers shared by server routes and UI.
 */

/**
 * Escapes a user string for safe use inside a Mongo `$regex`.
 *
 * Without this, `?search=.*` matched every document, and a crafted pattern
 * could force expensive backtracking against the index.
 */
export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Trims and caps a query-string value so it cannot become an oversized pattern. */
export function normaliseTerm(raw: string | null, max = 80): string {
  if (!raw) return "";
  return raw.trim().slice(0, max);
}

/** Strips control characters used to inject extra mail headers. */
export function singleLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}