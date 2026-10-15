import { NextResponse } from "next/server";

/**
 * Consistent API error handling.
 *
 * Rules:
 *  - Client-facing messages are generic and human-readable.
 *  - Internal detail is logged server-side only, never serialised to the client.
 *  - Every failure has a correct HTTP status code.
 */

export interface ApiErrorBody {
  success: false;
  error: string;
  /** Per-field messages, keyed by field name. */
  fields?: Record<string, string>;
}

export function apiError(
  message: string,
  status: number,
  fields?: Record<string, string>
): NextResponse<ApiErrorBody> {
  const body: ApiErrorBody = { success: false, error: message };
  if (fields && Object.keys(fields).length > 0) {
    body.fields = fields;
  }
  return NextResponse.json(body, { status });
}

export const badRequest = (message = "Invalid request", fields?: Record<string, string>) =>
  apiError(message, 400, fields);

export const unauthorized = (message = "You need to sign in to continue") =>
  apiError(message, 401);

export const forbidden = (message = "You do not have access to this resource") =>
  apiError(message, 403);

export const notFound = (message = "Not found") => apiError(message, 404);

export const conflict = (message: string, fields?: Record<string, string>) =>
  apiError(message, 409, fields);

export const tooManyRequests = (message = "Too many attempts. Please wait and try again.") =>
  apiError(message, 429);

export const serverError = (message = "Something went wrong on our end. Please try again.") =>
  apiError(message, 500);

/**
 * True for errors Next.js throws to signal control flow rather than failure —
 * most importantly DynamicServerError, which tells the framework that a route
 * must be rendered per-request.
 *
 * Swallowing one of these would let a dynamic route be cached as a static
 * shell, so they are re-thrown rather than converted into a 500.
 */
function isFrameworkControlFlow(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const code = (error as { code?: unknown }).code;
  if (code === "DYNAMIC_SERVER_USAGE" || code === "NEXT_REDIRECT") return true;
  const message = (error as { message?: unknown }).message;
  return typeof message === "string" && message.includes("Dynamic server usage");
}

/**
 * Wraps a route handler so an unexpected throw becomes a clean 500 instead of a
 * stack trace or an unhandled rejection.
 *
 * Typed against the base `Response` so a handler may freely return either a
 * success payload or an ApiErrorBody without the union fighting inference.
 */
export async function withErrorHandling(
  context: string,
  handler: () => Promise<Response>
): Promise<Response> {
  try {
    return await handler();
  } catch (error) {
    if (isFrameworkControlFlow(error)) throw error;

    const detail = error instanceof Error ? error.message : String(error);
    // Server-side only. Never returned to the client.
    console.error(`[api] ${context} failed:`, detail);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    return serverError();
  }
}