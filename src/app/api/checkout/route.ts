import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { z } from "zod";
import { optionalEnv } from "@/lib/env";
import { withErrorHandling, badRequest, serverError, tooManyRequests } from "@/lib/api";
import { getSession } from "@/lib/session";
import { enforceLimit } from "@/lib/rateLimit";

/**
 * Reads request headers, cookies or body, so it can never be statically
 * rendered. Declared explicitly because withErrorHandling catches thrown
 * errors, and swallowing Next's DynamicServerError would otherwise let
 * the route be cached as a static shell.
 */
export const dynamic = "force-dynamic";
import {
  MEMBERSHIP_PLANS,
  normalisePlan,
  resolveCatalogueItem,
  resolveTicketPrice,
} from "@/lib/pricing";

const LIMIT = { max: 15, windowMs: 15 * 60 * 1000 };

const stripeKey = optionalEnv("STRIPE_SECRET_KEY");
const stripe = stripeKey ? new Stripe(stripeKey) : null;

const checkoutSchema = z
  .object({
    type: z.enum(["membership", "cart", "ticket"]),
    items: z
      .array(
        z.object({
          id: z.string().trim().min(1).max(120),
          quantity: z.coerce.number().int().min(1).max(20),
        })
      )
      .max(50)
      .optional(),
    planName: z.string().trim().min(1).max(80).optional(),
    matchId: z.string().trim().max(60).optional(),
    tier: z.string().trim().max(60).optional(),
    seats: z.coerce.number().int().min(1).max(20).optional(),
  })
  .strict();

/**
 * POST /api/checkout
 *
 * Two critical fixes:
 *
 * 1. Amounts are resolved server-side. The old handler read `price` off the
 *    request body, so a caller could open a real Stripe session for any
 *    amount they liked.
 *
 * 2. A Stripe failure returns an error. The old catch returned
 *    `success: true` with a `/account?payment=success` URL, so a rejected
 *    payment was reported to the customer as a completed purchase.
 */
export async function POST(req: NextRequest) {
  return withErrorHandling("checkout", async () => {
    const limit = enforceLimit(req.headers, "checkout", LIMIT.max, LIMIT.windowMs);
    if (!limit.ok) {
      return tooManyRequests(
        `Too many checkout attempts. Try again in ${limit.retryAfter} seconds.`
      );
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest("That checkout request is not valid");
    }

    const { type, items, planName, matchId, tier, seats } = parsed.data;
    const session = await getSession(req);

    // Redirects always stay on this site's configured origin. The previous
    // version trusted the request Origin header, which let any site point a
    // completed payment at itself.
    const origin = optionalEnv("AUTH_URL") ?? new URL(req.url).origin;

    if (!stripe) {
      return serverError(
        "Payments are not configured on this environment. Please contact us to complete your order."
      );
    }

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (type === "membership") {
      const plan = MEMBERSHIP_PLANS[normalisePlan(planName ?? "")];
      if (!plan) {
        return badRequest("That membership plan is not available");
      }
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: plan.blurb },
          unit_amount: plan.amount,
        },
        quantity: 1,
      });
    } else if (type === "ticket") {
      const ticket = matchId && tier ? resolveTicketPrice(matchId, tier) : null;
      if (!ticket) {
        return badRequest("That ticket tier is not available");
      }
      const quantity = seats ?? 1;
      if (quantity > ticket.availableSeats) {
        return badRequest(`Only ${ticket.availableSeats} seats remain in ${ticket.tierName}`);
      }
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `${ticket.matchTitle} — ${ticket.tierName}`,
            description: `${ticket.venue}, ${ticket.date} at ${ticket.time}`,
          },
          unit_amount: Math.round(ticket.price * 100),
        },
        quantity,
      });
    } else {
      if (!items || items.length === 0) {
        return badRequest("Your cart is empty");
      }

      for (const item of items) {
        const resolved = await resolveCatalogueItem(item.id);
        if (!resolved) {
          return badRequest("One of the items in your cart is no longer available");
        }
        lineItems.push({
          price_data: {
            currency: "usd",
            product_data: {
              name: resolved.title,
              description: resolved.kind === "program" ? "Apex Hockey programme" : "Apex Hockey equipment",
              images: resolved.image.startsWith("http") ? [resolved.image] : [],
            },
            unit_amount: Math.round(resolved.price * 100),
          },
          quantity: item.quantity,
        });
      }
    }

    // Stripe rejects sessions below $0.50. Checked here so the customer gets a
    // clear reason rather than a generic failure.
    const total = lineItems.reduce(
      (sum, item) => sum + (item.price_data?.unit_amount ?? 0) * (item.quantity ?? 1),
      0
    );
    if (total < 50) {
      return badRequest("Order total must be at least $0.50");
    }

    try {
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        customer_email: session?.email,
        success_url: `${origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/pricing?payment=cancelled`,
      });

      if (!stripeSession.url) {
        return serverError("We could not start the payment. Please try again.");
      }

      return NextResponse.json({ success: true, url: stripeSession.url });
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      // Provider detail stays in the log; the client gets a plain sentence.
      console.error("[checkout] Stripe session failed:", detail);
      return serverError(
        "We could not start the payment. Your card has not been charged — please try again."
      );
    }
  });
}