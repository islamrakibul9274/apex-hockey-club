import { NextRequest } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import User, { IUser } from "@/models/User";
import { SESSION_COOKIE_NAME, verifyJwt, TokenPayload } from "@/lib/auth";

/**
 * Server-side session resolution.
 *
 * Every protected route resolves the caller through this module so auth rules
 * cannot differ between endpoints. A verified JWT is necessary but NOT
 * sufficient: the user must still exist in the database. That way a deleted or
 * downgraded account loses access immediately rather than at token expiry.
 */

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  phone?: string;
  membershipPlan?: string;
  address?: IUser["address"];
}

export async function getSession(req: NextRequest): Promise<SessionUser | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const payload = verifyJwt(token);
  if (!payload) return null;

  return resolveUser(payload);
}

/**
 * Resolves a JWT payload to a live database user.
 *
 * Returns null when the account no longer exists. It deliberately does NOT
 * fall back to the JWT claims: doing so would let a valid token for a deleted
 * user keep working, and would let us display a membership plan we have not
 * actually verified.
 */
async function resolveUser(payload: TokenPayload): Promise<SessionUser | null> {
  const conn = await connectToDatabase();
  if (!conn) return null;

  const user = await User.findById(payload.userId).catch((err: unknown) => {
    console.error("[session] user lookup failed:", err instanceof Error ? err.message : err);
    return null;
  });

  if (!user) return null;
  return toSessionUser(user);
}

export function toSessionUser(user: IUser): SessionUser {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    membershipPlan: user.membershipPlan,
    address: user.address,
  };
}

/** Public shape returned to the client. Never includes password material. */
export function toPublicUser(user: IUser) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    phone: user.phone,
    membershipPlan: user.membershipPlan,
    address: user.address,
    notificationsEnabled: user.notificationsEnabled,
    createdAt: user.createdAt,
  };
}