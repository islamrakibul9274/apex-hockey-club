import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { generateResetToken } from "@/lib/auth";
import { forgotPasswordSchema, fieldErrors } from "@/lib/validation";
import { withErrorHandling, badRequest, tooManyRequests, serverError } from "@/lib/api";
import { enforceLimit } from "@/lib/rateLimit";
import { optionalEnv, authUrl } from "@/lib/env";

const LIMIT = { max: 5, windowMs: 15 * 60 * 1000 };
const TOKEN_TTL_MS = 30 * 60 * 1000;

/**
 * POST /api/auth/forgot-password
 *
 * Always returns the same response whether or not the email exists, so the
 * endpoint cannot be used to enumerate accounts.
 */
export async function POST(req: NextRequest) {
  return withErrorHandling("auth/forgot-password", async () => {
    const limit = enforceLimit(req.headers, "auth:forgot", LIMIT.max, LIMIT.windowMs);
    if (!limit.ok) {
      const response = tooManyRequests(
        `Too many requests. Try again in ${limit.retryAfter} seconds.`
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

    const parsed = forgotPasswordSchema.safeParse(body);
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      return badRequest(fields.form ?? "Enter your email address", fields);
    }

    const generic = NextResponse.json({
      success: true,
      message: "If an account exists for that email, a reset link is on its way.",
    });

    const conn = await connectToDatabase();
    if (!conn) return serverError("We could not reach the account service. Please try again shortly.");

    const user = await User.findOne({ email: parsed.data.email });
    // No account, or an account that has never set a password (nothing to reset).
    if (!user || !user.password) return generic;

    const { token, hash } = generateResetToken();

    await User.updateOne(
      { _id: user._id },
      { $set: { passwordResetHash: hash, passwordResetExpires: new Date(Date.now() + TOKEN_TTL_MS) } }
    );

    const link = `${authUrl()}/auth/reset-password?token=${token}`;
    console.log(`[auth/forgot-password] reset link for ${user.email}: ${link}`);

    // Email is delivered when Resend is configured. The link is always logged so
    // local and staging environments remain usable without a mail provider.
    const resendKey = optionalEnv("RESEND_API_KEY");
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Apex Hockey <onboarding@resend.dev>",
          to: [user.email],
          subject: "Reset your Apex Hockey password",
          text: `Use the link below within 30 minutes to choose a new password.\n\n${link}\n\nIf you did not request this, you can ignore this email.`,
        });
      } catch (err) {
        console.error("[auth/forgot-password] email dispatch failed:", err);
      }
    }

    return generic;
  });
}