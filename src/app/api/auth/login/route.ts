import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import {
  burnPasswordCompare,
  comparePassword,
  sessionMaxAge,
  setSessionCookie,
  signJwt,
} from "@/lib/auth";
import { loginSchema, fieldErrors } from "@/lib/validation";
import { withErrorHandling, badRequest, unauthorized, tooManyRequests, serverError } from "@/lib/api";
import { enforceLimit } from "@/lib/rateLimit";
import { toPublicUser } from "@/lib/session";

/** 10 attempts per 15 minutes per IP. */
const LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

/**
 * POST /api/auth/login
 *
 * There is intentionally NO demo bypass and NO passwordless path. An earlier
 * version granted an Elite Champion VIP session to anyone who sent
 * {isDemo:true} or the demo email, ignoring the password entirely.
 */
export async function POST(req: NextRequest) {
  return withErrorHandling("auth/login", async () => {
    const limit = enforceLimit(req.headers, "auth:login", LIMIT.max, LIMIT.windowMs);
    if (!limit.ok) {
      const response = tooManyRequests(
        `Too many sign-in attempts. Try again in ${limit.retryAfter} seconds.`
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

    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      return badRequest(fields.form ?? "Check the highlighted fields", fields);
    }

    const { email, password, remember } = parsed.data;

    const conn = await connectToDatabase();
    if (!conn) {
      // Fail loudly rather than pretending the credentials were wrong.
      return serverError("We could not reach the account service. Please try again shortly.");
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Equalise timing so response time cannot be used to discover which
      // emails are registered.
      await burnPasswordCompare(password);
      return unauthorized("Incorrect email or password");
    }

    // A document with no password must NOT authenticate. Previously this branch
    // fell through and signed a session for anyone.
    if (!user.password) {
      await burnPasswordCompare(password);
      return unauthorized("Incorrect email or password");
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return unauthorized("Incorrect email or password");
    }

    const token = signJwt(
      {
        userId: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
      sessionMaxAge(remember)
    );

    const response = NextResponse.json({
      success: true,
      user: toPublicUser(user),
    });
    setSessionCookie(response, token, sessionMaxAge(remember));
    return response;
  });
}