import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { hashPassword, hashResetToken, sessionMaxAge, setSessionCookie, signJwt } from "@/lib/auth";
import { resetPasswordSchema, fieldErrors } from "@/lib/validation";

/**
 * Reads request headers, cookies or body, so it can never be statically
 * rendered. Declared explicitly because withErrorHandling catches thrown
 * errors, and swallowing Next's DynamicServerError would otherwise let
 * the route be cached as a static shell.
 */
export const dynamic = "force-dynamic";
import {
  withErrorHandling,
  badRequest,
  notFound,
  tooManyRequests,
  serverError,
} from "@/lib/api";
import { enforceLimit } from "@/lib/rateLimit";
import { toPublicUser } from "@/lib/session";

const LIMIT = { max: 10, windowMs: 15 * 60 * 1000 };

/**
 * POST /api/auth/reset-password
 *
 * Consumes the token, sets the new password, and signs the user in. The stored
 * token is compared by hash and cleared in the same update, so a link is
 * single-use even if it is replayed concurrently.
 */
export async function POST(req: NextRequest) {
  return withErrorHandling("auth/reset-password", async () => {
    const limit = enforceLimit(req.headers, "auth:reset", LIMIT.max, LIMIT.windowMs);
    if (!limit.ok) {
      const response = tooManyRequests(
        `Too many attempts. Try again in ${limit.retryAfter} seconds.`
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

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      return badRequest(fields.form ?? "This reset link is invalid or has expired", fields);
    }

    const { token, password } = parsed.data;
    const conn = await connectToDatabase();
    if (!conn) return serverError("We could not reach the account service. Please try again shortly.");

    const hash = hashResetToken(token);
    const user = await User.findOne({
      passwordResetHash: hash,
      passwordResetExpires: { $gt: new Date() },
    }).select("+passwordResetHash +passwordResetExpires");

    if (!user) {
      return notFound("This reset link is invalid or has expired. Request a new one.");
    }

    const hashedPassword = await hashPassword(password);

    // $unset, not $set: undefined — Mongoose strips undefined values from
    // $set, which left the token hash in place and let a reset link be
    // replayed to overwrite the password again.
    const updated = await User.findOneAndUpdate(
      { _id: user._id, passwordResetHash: hash },
      {
        $set: {
          password: hashedPassword,
          passwordChangedAt: new Date(),
        },
        $unset: {
          passwordResetHash: 1,
          passwordResetExpires: 1,
        },
      },
      { new: true }
    );

    if (!updated) {
      return notFound("This reset link has already been used. Request a new one.");
    }

    // Sign the user straight in so they are not asked to type the new password twice.
    const maxAge = sessionMaxAge(true);
    const jwt = signJwt(
      {
        userId: updated._id.toString(),
        email: updated.email,
        name: updated.name,
        role: updated.role,
      },
      maxAge
    );

    const response = NextResponse.json({
      success: true,
      message: "Your password has been updated.",
      user: toPublicUser(updated),
    });
    setSessionCookie(response, jwt, maxAge);
    return response;
  });
}