import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User from "@/models/User";
import { updateProfileSchema, fieldErrors } from "@/lib/validation";
import {
  withErrorHandling,
  badRequest,
  unauthorized,
  serverError,
} from "@/lib/api";
import { getSession, toPublicUser } from "@/lib/session";

export async function PUT(req: NextRequest) {
  return withErrorHandling("auth/profile", async () => {
    const session = await getSession(req);
    if (!session) return unauthorized();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return badRequest("Request body must be valid JSON");
    }

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      const fields = fieldErrors(parsed.error);
      return badRequest(fields.form ?? "Check the highlighted fields", fields);
    }

    const { name, phone, avatar, address } = parsed.data;

    const conn = await connectToDatabase();
    if (!conn) {
      return serverError("We could not reach the account service. Please try again shortly.");
    }

    // Explicit allow-list. `role`, `membershipPlan` and `_id` can never be set
    // through this endpoint, so the request cannot escalate itself.
    const updated = await User.findByIdAndUpdate(
      session.id,
      { $set: { name, phone, ...(avatar !== undefined ? { avatar } : {}), ...(address ? { address } : {}) } },
      { new: true, runValidators: true }
    );

    // Previously .catch(() => null) made a failed write report success. Now a
    // missing row is an error, not a fake acknowledgement.
    if (!updated) {
      return unauthorized("Your account could not be found. Please sign in again.");
    }

    return NextResponse.json({ success: true, user: toPublicUser(updated) });
  });
}