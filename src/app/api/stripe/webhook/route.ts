import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { optionalEnv } from "@/lib/env";
import { withErrorHandling, badRequest, serverError } from "@/lib/api";

/**
 * POST /api/stripe/webhook
 *
 * Marks bookings as paid once Stripe confirms the payment.
 *
 * This endpoint was missing. Bookings were created with paymentStatus
 * "pending" (the previous code marked them "paid" at creation time, before
 * any money had moved), and nothing ever advanced them — so payments never
 * reconciled.
 *
 * Raw body: the signature is verified against the exact bytes Stripe sent, so
 * this route must NOT parse the body before calling constructEvent.
 */

export const dynamic = "force-dynamic";

const stripeKey = optionalEnv("STRIPE_SECRET_KEY");
const webhookSecret = optionalEnv("STRIPE_WEBHOOK_SECRET");
const stripe = stripeKey ? new Stripe(stripeKey) : null;

export async function POST(req: NextRequest) {
  return withErrorHandling("stripe/webhook", async () => {
    if (!stripe || !webhookSecret) {
      // Not a configuration the caller can fix; do not retry blindly.
      return serverError("Stripe webhooks are not configured on this environment");
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return badRequest("Missing Stripe signature");
    }

    // Must be the raw text, not req.json().
    const raw = await req.text();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(raw, signature, webhookSecret);
    } catch {
      // A bad signature is a client error and must not be retried by Stripe.
      return badRequest("Invalid Stripe signature");
    }

    const conn = await connectToDatabase();
    if (!conn) {
      // 500 so Stripe retries: payment happened but we could not record it.
      return serverError("Database unreachable; Stripe should retry");
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await settle(session);
        break;
      }

      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object as Stripe.Checkout.Session;
        await settle(session);
        break;
      }

      case "checkout.session.expired":
      case "checkout.session.async_payment_failed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await Booking.updateMany(
          { stripeSessionId: session.id },
          { $set: { status: "cancelled", paymentStatus: "failed" } }
        );
        break;
      }

      default:
        // Unhandled event types are acknowledged so Stripe stops retrying.
        break;
    }

    return NextResponse.json({ received: true });
  });
}

/**
 * Marks a booking paid.
 *
 * The checkout session carries the booking id in client_reference_id, which is
 * the only reliable link — the client never controls payment status, but it
 * does identify which booking the session belongs to.
 */
async function settle(session: Stripe.Checkout.Session): Promise<void> {
  if (session.payment_status !== "paid") return;

  const bookingId = session.client_reference_id;

  if (bookingId) {
    const updated = await Booking.findByIdAndUpdate(
      bookingId,
      {
        $set: {
          status: "confirmed",
          paymentStatus: "paid",
          stripeSessionId: session.id,
        },
      },
      { new: true }
    );
    if (updated) return;
  }

  // Fall back to the session id, in case the booking recorded it already.
  await Booking.updateMany(
    { stripeSessionId: session.id },
    { $set: { status: "confirmed", paymentStatus: "paid" } }
  );
}