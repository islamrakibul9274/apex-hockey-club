import { NextRequest, NextResponse } from "next/server";
import { withErrorHandling } from "@/lib/api";
import { clearSessionCookie } from "@/lib/auth";

export async function POST() {
  return withErrorHandling("auth/logout", async () => {
    const response = NextResponse.json({ success: true });
    // Cleared server-side with a matching path and sameSite so the browser
    // actually removes it.
    clearSessionCookie(response);
    return response;
  });
}