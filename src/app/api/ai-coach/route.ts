import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import { z } from "zod";
import { optionalEnv } from "@/lib/env";
import { withErrorHandling, badRequest, serverError, tooManyRequests } from "@/lib/api";
import { enforceLimit } from "@/lib/rateLimit";

/**
 * Reads request headers, cookies or body, so it can never be statically
 * rendered. Declared explicitly because withErrorHandling catches thrown
 * errors, and swallowing Next's DynamicServerError would otherwise let
 * the route be cached as a static shell.
 */
export const dynamic = "force-dynamic";

/** 20 messages per 10 minutes per IP. Without this the endpoint is a free LLM proxy. */
const LIMIT = { max: 20, windowMs: 10 * 60 * 1000 };

const MAX_MESSAGES = 12;
const MAX_MESSAGE_CHARS = 1000;

/**
 * Model id corrected.
 *
 * The route requested `qwen/qwen3.6-27b`, which does not exist on Groq — every
 * call returned 404 model_not_found. Verified against the Groq model list,
 * `qwen/qwen3.8-27b` is the available id. Override with GROQ_MODEL if the
 * account is provisioned differently.
 */
const GROQ_MODEL = optionalEnv("GROQ_MODEL") ?? "qwen/qwen3.8-27b";

const groq = optionalEnv("GROQ_API_KEY")
  ? new Groq({ apiKey: optionalEnv("GROQ_API_KEY") as string })
  : null;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(MAX_MESSAGE_CHARS),
});

const bodySchema = z
  .object({
    messages: z.array(messageSchema).max(MAX_MESSAGES),
  })
  .strict();

const SYSTEM_PROMPT = `You are Coach Wayne, Head Coach at Apex Hockey Club.
You give encouraging, technically accurate, practical hockey advice to athletes, parents and fans.
Keep answers concise: two short paragraphs, or a short list where it helps.
Recommend Apex Hockey programmes when relevant: Junior Development (ages 6-12), Teen Academy (13-17), or the Professional League Masterclass.
Reply with the advice only. Never include reasoning, scratch notes, or markup tags.`;

const NOT_CONFIGURED =
  "The AI coach is not configured on this environment. You can still browse our " +
  "programmes, camps and store, or send us a message through the contact form.";

/**
 * POST /api/ai-coach
 *
 * Previously, when Groq errored, this returned a canned "coach tip" as though
 * it were a real answer, so a total outage looked like a working assistant.
 * Failures now return an explicit error and the UI says so.
 */
export async function POST(req: NextRequest) {
  return withErrorHandling("ai-coach", async () => {
    const limit = enforceLimit(req.headers, "ai-coach", LIMIT.max, LIMIT.windowMs);
    if (!limit.ok) {
      return tooManyRequests(
        `You've asked a lot of questions. Try again in ${limit.retryAfter} seconds.`
      );
    }

    if (!groq) {
      return serverError(NOT_CONFIGURED);
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("That message could not be sent");
    }

    // Only user/assistant turns are accepted, so a caller cannot smuggle in a
    // second system message to override the coach's instructions.
    const history = parsed.data.messages.map((m) => ({ role: m.role, content: m.content }));

    try {
      const completion = await groq.chat.completions.create({
        model: GROQ_MODEL,
        messages: [{ role: "system" as const, content: SYSTEM_PROMPT }, ...history],
        max_tokens: 400,
        temperature: 0.7,
      });

      const raw = completion.choices[0]?.message?.content ?? "";
      const reply = raw
        .replace(/<think>[\s\S]*?<\/think>/gi, "")
        .replace(/<\/?think>/gi, "")
        .trim();

      if (!reply) {
        // An empty completion is not an answer.
        return serverError("Coach Wayne could not answer that. Please try rephrasing.");
      }

      return NextResponse.json({ success: true, reply });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      // Provider detail is logged, not returned.
      console.error(`[ai-coach] Groq request failed (model ${GROQ_MODEL}):`, detail);
      return serverError("Coach Wayne is unavailable right now. Please try again shortly.");
    }
  });
}