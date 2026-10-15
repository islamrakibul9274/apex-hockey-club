import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import { z } from "zod";

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
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api";
import { getSession } from "@/lib/session";
import { enforceLimit } from "@/lib/rateLimit";
import {
  MEMBERSHIP_PLANS,
  normalisePlan,
  resolveCatalogueItem,
  resolveTicketPrice,
} from "@/lib/pricing";

/** 20 writes per 10 minutes per IP. */
const WRITE_LIMIT = { max: 20, windowMs: 10 * 60 * 1000 };

const bookingSchema = z
  .object({
    bookingType: z.enum(["ticket", "program", "membership"]),
    itemId: z.string().trim().min(1, "An item is required").max(120),
    itemTitle: z.string().trim().min(1, "An item title is required").max(200),
    tierOrPlan: z.string().trim().max(80).optional().default("Standard"),
    seatsCount: z.coerce.number().int().min(1).max(20),
    date: z.string().trim().max(40).optional(),
    time: z.string().trim().max(40).optional(),
    customerName: z.string().trim().min(2).max(80).optional(),
    customerEmail: z.string().trim().toLowerCase().email("Enter a valid email").max(254).optional(),
    customerPhone: z.string().trim().max(32).optional(),
  })
  // A client-supplied totalAmount, paymentStatus, status or userId is
  // rejected outright rather than ignored, so a caller cannot smuggle in a
  // field and have it silently dropped.
  .strict();

/**
 * POST /api/bookings
 *
 * Two behaviours changed here:
 *
 * 1. `userId` is no longer accepted from the request body. Previously it fell
 *    back to `body.userId`, which let any caller file a booking against any
 *    account. The owner is now always the authenticated session.
 *
 * 2. A failed database write is an error. The old `.catch()` returned a
 *    fabricated booking object and reported success, so a ticket could appear
 *    confirmed and paid while nothing was stored.
 */
export async function POST(req: NextRequest) {
  return withErrorHandling("bookings/create", async () => {
    const limit = enforceLimit(req.headers, "bookings:create", WRITE_LIMIT.max, WRITE_LIMIT.windowMs);
    if (!limit.ok) {
      return badRequest(`Too many booking attempts. Try again in ${limit.retryAfter} seconds.`);
    }

    const session = await getSession(req);
    if (!session) {
      // A booking is a purchase record, so it needs an account to attach to.
      return unauthorized("Sign in to complete this booking");
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const parsed = bookingSchema.safeParse(body);
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path.join(".") || "form";
        if (!fields[key]) fields[key] = issue.message;
      }
      return badRequest("Check the booking details", fields);
    }

    const input = parsed.data;

    // Seats cannot exceed what the programme actually has.
    if (input.seatsCount > 20) {
      return badRequest("You can book at most 20 seats in one order");
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return serverError("We could not reach the booking service. Please try again shortly.");
    }

    // totalAmount is derived from the catalogue, never accepted from the client.
    const amount = await resolveAmount(input);
    if (amount === null) {
      return notFound("That item is no longer available");
    }

    const saved = await Booking.create({
      userId: session.id,
      customerName: input.customerName || session.name,
      customerEmail: input.customerEmail || session.email,
      customerPhone: input.customerPhone || session.phone || "",
      bookingType: input.bookingType,
      itemId: input.itemId,
      itemTitle: input.itemTitle,
      tierOrPlan: input.tierOrPlan,
      seatsCount: input.seatsCount,
      totalAmount: amount,
      date: input.date || new Date().toISOString().slice(0, 10),
      time: input.time || "",
      // Payment is not assumed. It is marked paid only once a verified
      // Stripe webhook confirms it; otherwise it stays pending.
      status: "pending",
      paymentStatus: "pending",
    });

    return NextResponse.json({ success: true, booking: saved }, { status: 201 });
  });
}

type BookingInput = z.infer<typeof bookingSchema>;

/**
 * Totals are computed from server-side pricing, so a client can never state
 * what it is paying. Returns null when an item cannot be priced.
 */
async function resolveAmount(input: BookingInput): Promise<number | null> {
  const seats = input.seatsCount;

  if (input.bookingType === "ticket") {
    const ticket = resolveTicketPrice(input.itemId, input.tierOrPlan);
    if (!ticket) return null;
    if (seats > ticket.availableSeats) return null;
    return ticket.price * seats;
  }

  if (input.bookingType === "membership") {
    const plan = MEMBERSHIP_PLANS[normalisePlan(input.tierOrPlan)];
    return plan ? plan.amount / 100 : null;
  }

  const item = await resolveCatalogueItem(input.itemId);
  return item ? item.price * seats : null;
}

/**
 * GET /api/bookings
 *
 * Requires a session and returns ONLY that session's bookings.
 *
 * Previously the filter was left empty when no token was present, so
 * `Booking.find({})` returned every booking in the database to any anonymous
 * caller, including customer names, email addresses, phone numbers and
 * amounts.
 */
export async function GET(req: NextRequest) {
  return withErrorHandling("bookings/list", async () => {
    const session = await getSession(req);
    if (!session) {
      return unauthorized("Sign in to view your bookings");
    }

    const conn = await connectToDatabase();
    if (!conn) {
      return serverError("We could not reach the booking service. Please try again shortly.");
    }

    const bookings = await Booking.find({
      $or: [{ userId: session.id }, { customerEmail: session.email }],
    })
      .sort({ createdAt: -1 })
      .catch(() => null);

    if (bookings === null) {
      // Swallowing this as an empty list would tell the user they have no
      // bookings when the real answer is "we could not check".
      return serverError("We could not load your bookings. Please try again.");
    }

    return NextResponse.json({ success: true, bookings });
  });
}

/** DELETE /api/bookings?id=… — cancels a booking the caller owns. */
export async function DELETE(req: NextRequest) {
  return withErrorHandling("bookings/cancel", async () => {
    const session = await getSession(req);
    if (!session) return unauthorized();

    const id = req.nextUrl.searchParams.get("id");
    if (!id) return badRequest("A booking id is required");

    const conn = await connectToDatabase();
    if (!conn) return serverError();

    const booking = await Booking.findOne({
      _id: id,
      $or: [{ userId: session.id }, { customerEmail: session.email }],
    }).catch(() => null);

    if (!booking) {
      // Also covers someone else's booking, which must look the same as a
      // missing one so ids cannot be probed.
      return notFound("That booking could not be found");
    }

    booking.status = "cancelled";
    await booking.save();

    return NextResponse.json({ success: true, booking });
  });
}