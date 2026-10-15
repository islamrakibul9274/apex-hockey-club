import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import { requireEnv, isProduction } from "@/lib/env";

/**
 * Password hashing and session tokens.
 *
 * The signing secret is fetched through requireEnv(), which throws when absent.
 * There is deliberately NO fallback value: a hardcoded fallback would let anyone
 * mint a token for any userId with role "admin".
 */

const SESSION_COOKIE = "auth_token";

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

/** 8h persistent session vs a browser-lifetime session cookie. */
const PERSISTENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export const SESSION_COOKIE_NAME = SESSION_COOKIE;

/* ------------------------------------------------------------------ */
/* Passwords                                                          */
/* ------------------------------------------------------------------ */

const BCRYPT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    // A malformed hash must read as "no match", never as a thrown 500.
    return false;
  }
}

/**
 * Compares against a throwaway hash when the user does not exist, so the
 * response time for "unknown email" matches "wrong password". Without this,
 * response timing enumerates which emails are registered.
 */
const DUMMY_HASH = "$2a$12$C6UzMDM.H6dfI/f/IKcEe.4bJPHR0G4Wf2lY9bqNQcxJq6m1nMm7O";

export async function burnPasswordCompare(password: string): Promise<void> {
  await comparePassword(password, DUMMY_HASH);
}

/* ------------------------------------------------------------------ */
/* Session tokens                                                     */
/* ------------------------------------------------------------------ */

function secret(): string {
  return requireEnv("AUTH_SECRET");
}

export function signJwt(payload: TokenPayload, expiresInSeconds?: number): string {
  return jwt.sign(payload, secret(), {
    expiresIn: expiresInSeconds ?? PERSISTENT_MAX_AGE_SECONDS,
  });
}

export function verifyJwt(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, secret()) as TokenPayload;
  } catch (error) {
    // Expired vs malformed is not distinguished: the caller's response is the
    // same either way, and revealing the reason aids probing.
    if (error instanceof jwt.TokenExpiredError) {
      return null;
    }
    return null;
  }
}

export function sessionMaxAge(remember: boolean): number {
  return remember ? PERSISTENT_MAX_AGE_SECONDS : SESSION_MAX_AGE_SECONDS;
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export function setSessionCookie(response: NextResponseLike, token: string, maxAge: number): void {
  response.cookies.set(SESSION_COOKIE, token, cookieOptions(maxAge));
}

export function clearSessionCookie(response: NextResponseLike): void {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: isProduction(),
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
  });
}

interface NextResponseLike {
  cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => void };
}

/* ------------------------------------------------------------------ */
/* Password reset tokens                                              */
/* ------------------------------------------------------------------ */

/**
 * Reset tokens are stored hashed. A leaked database dump therefore cannot be
 * used to take over accounts.
 */
export function generateResetToken(): { token: string; hash: string } {
  const token = crypto.randomBytes(32).toString("hex");
  const hash = hashResetToken(token);
  return { token, hash };
}

export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}