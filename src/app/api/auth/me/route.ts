import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling, unauthorized } from "@/lib/api";
import { getSession } from "@/lib/session";
import { clearSessionCookie, SESSION_COOKIE_NAME } from "@/lib/auth";

/**
 * Reads request headers, cookies or body, so it can never be statically
 * rendered. Declared explicitly because withErrorHandling catches thrown
 * errors, and swallowing Next's DynamicServerError would otherwise let
 * the route be cached as a static shell.
 */
export const dynamic = "force-dynamic";

/**
 * GET /api/auth/me
 *
 * Returns 401 when there is no usable session, so callers can distinguish
 * "signed out" from "signed in". A malformed or expired cookie is cleared on
 * the way out so the browser stops sending it.
 *
 * It does NOT fall back to the JWT claims when the database lookup fails. The
 * previous version did, which meant a database outage fabricated a signed-in
 * user with an "Elite Champion" plan.
 */
export async function GET(req: NextRequest) {
  return withErrorHandling("auth/me", async () => {
    const user = await getSession(req);

    if (!user) {
      const response = unauthorized();
      if (req.cookies.get(SESSION_COOKIE_NAME)) {
        // Expired or revoked — stop resending it.
        clearSessionCookie(response);
      }
      return response;
    }

    return NextResponse.json({ success: true, user });
  });
}