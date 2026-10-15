import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, sessionMaxAge, setSessionCookie, signJwt } from "@/lib/auth";
import { registerSchema, fieldErrors } from "@/lib/validation";
import {
  withErrorHandling,
  badRequest,
  conflict,
  tooManyRequests,
  serverError,
} from "@/lib/api";
import { enforceLimit } from "@/lib/rateLimit";
import { toPublicUser } from "@/lib/session";

/** 5 sign-ups per hour per IP. */
const LIMIT = { max: 5, windowMs: 60 * 60 * 1000 };

export async function POST(req: NextRequest) {
  return withErrorHandling("auth/register", async () => {
    const limit = enforceLimit(req.headers, "auth:register", LIMIT.max, LIMIT.windowMs);
    if (!limit.ok) {
      const response = tooManyRequests(
        `Too many sign-up attempts. Try again in ${limit.retryAfter} seconds.`
      );
      response.headers.set("Retry-After", String(limit.retryAfter));
      return response;
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      return badRequest(fields.form ?? "Check the highlighted fields", fields);
    }

    const { name, email, password, phone } = parsed.data;

    const conn = await connectToDatabase();
    if (!conn) {
      return serverError("We could not reach the account service. Please try again shortly.");
    }

    const existing = await User.findOne({ email }).catch((err: unknown) => {
      console.error("[auth/register] lookup failed:", err instanceof Error ? err.message : err);
      throw err;
    });

    if (existing) {
      return conflict("An account with this email already exists. Try signing in instead.", {
        email: "An account with this email already exists",
      });
    }

    const hashedPassword = await hashPassword(password);

    // No .catch() fallback. Previously a failed write returned success:true with
    // a fabricated id, handing the user a session for an account that was
    // never created. A failed write is now an honest 500.
    let user;
    try {
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        phone,
        role: "user",
        membershipPlan: "Standard Member",
        passwordChangedAt: new Date(),
      });
    } catch (err) {
      // Unique-index violation: two requests raced past the check above.
      if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
        return conflict("An account with this email already exists. Try signing in instead.", {
          email: "An account with this email already exists",
        });
      }
      throw err;
    }

    const maxAge = sessionMaxAge(true);
    const token = signJwt(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      maxAge
    );

    const response = NextResponse.json({ success: true, user: toPublicUser(user) }, { status: 201 });
    setSessionCookie(response, token, maxAge);
    return response;
  });
}