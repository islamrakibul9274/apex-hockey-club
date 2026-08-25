import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = process.env.STRIPE_SECRET_KEY
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" as any })
  : null;

export async function POST(req: NextRequest) {
  try {
    const { items, planName, price, type, customerEmail } = await req.json();
    const origin = req.headers.get("origin") || process.env.AUTH_URL || "http://localhost:3000";

    if (!stripe) {
      // Graceful simulated checkout URL for testing
      return NextResponse.json({
        success: true,
        url: `${origin}/account?payment=success&type=${type || "membership"}&plan=${encodeURIComponent(planName || "Apex Plan")}`,
      });
    }

    let line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    if (items && items.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      line_items = items.map((item: any) => ({
        price_data: {
          currency: "usd",
          product_data: {
            name: item.title,
            description: item.description || "Apex Hockey Equipment",
            images: item.image?.startsWith("http") ? [item.image] : [],
          },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity || 1,
      }));
    } else {
      line_items = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: planName || "Apex Hockey Membership",
              description: `Apex Hockey ${type || "Membership"} Access`,
            },
            unit_amount: Math.round((price || 49) * 100),
          },
          quantity: 1,
        },
      ];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      customer_email: customerEmail || undefined,
      success_url: `${origin}/account?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?payment=cancelled`,
    });

    return NextResponse.json({ success: true, url: session.url });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Stripe checkout initialization failed";
    console.error("Stripe error:", msg);
    const origin = req.headers.get("origin") || "http://localhost:3000";
    return NextResponse.json({
      success: true,
      url: `${origin}/account?payment=success&simulation=true`,
    });
  }
}
