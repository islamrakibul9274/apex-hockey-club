import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Inquiry from "@/models/Inquiry";
import { z } from "zod";
import { optionalEnv } from "@/lib/env";
import { withErrorHandling, badRequest, serverError, tooManyRequests } from "@/lib/api";
import { enforceLimit } from "@/lib/rateLimit";
import { singleLine } from "@/lib/text";

/**
 * Reads request headers, cookies or body, so it can never be statically
 * rendered. Declared explicitly because withErrorHandling catches thrown
 * errors, and swallowing Next's DynamicServerError would otherwise let
 * the route be cached as a static shell.
 */
export const dynamic = "force-dynamic";

/** 5 submissions per 10 minutes per IP. */
const LIMIT = { max: 5, windowMs: 10 * 60 * 1000 };

const inquirySchema = z
  .object({
    name: z.string().trim().min(2, "Enter your name").max(80),
    email: z.string().trim().toLowerCase().email("Enter a valid email address").max(254),
    phone: z.string().trim().max(32).regex(/^[+()\d\s.-]*$/, "Enter a valid phone number").optional().default(""),
    subject: z.string().trim().max(120).optional().default("General Inquiry"),
    message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(4000),
    // Honeypot. Bots fill every field they find; humans never see this one.
    company: z.string().max(0).optional(),
  })
  .strict();

export async function POST(req: NextRequest) {
  return withErrorHandling("contact", async () => {
    const limit = enforceLimit(req.headers, "contact", LIMIT.max, LIMIT.windowMs);
    if (!limit.ok) {
      return tooManyRequests(`Too many messages. Try again in ${limit.retryAfter} seconds.`);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fields[key]) fields[key] = issue.message;
      }
      return badRequest("Check the highlighted fields", fields);
    }

    const { name, email, phone, subject, message } = parsed.data;

    // Honeypot tripped: respond exactly like a success so a bot learns nothing,
    // but store nothing and send nothing.
    if (parsed.data.company) {
      return NextResponse.json({
        success: true,
        message: "Thank you! Your message has been received.",
      });
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return serverError("We could not reach the message service. Please try again shortly.");
    }

    // A failed write is an error. The old `.catch(console.warn)` let the caller
    // believe their enquiry was delivered when it had not been stored.
    try {
      await Inquiry.create({ name, email, phone, subject, message, status: "unread" });
    } catch (err) {
      console.error(
        "[contact] failed to store inquiry:",
        err instanceof Error ? err.message : err
      );
      return serverError("We could not save your message. Please try again or email us directly.");
    }

    const resendKey = optionalEnv("RESEND_API_KEY");
    if (resendKey) {
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: "Apex Hockey <onboarding@resend.dev>",
          to: ["islamrakibul9274@gmail.com"],
          // The subject is user input; newlines are stripped so it cannot be
          // used to inject extra headers.
          subject: `[Apex Inquiry] ${singleLine(subject)} — ${singleLine(name)}`,
          text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || "N/A"}\n\n${message}`,
        });
      } catch (emailErr) {
        // The enquiry is already stored, so a mail failure must not fail the
        // request — but it should be visible.
        console.error("[contact] notification email failed:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you! Your message has been received and our team will get in touch shortly.",
    });
  });
}