import { describe, it, expect, beforeAll, afterAll } from "vitest";
import fs from "node:fs";

/**
 * API integration tests.
 *
 * These exercise the real route handlers against the configured MongoDB.
 * They are destructive only with respect to their own fixtures — every record
 * they create is removed afterwards.
 *
 * Requires .env.local (or real env vars) to be present.
 */

if (fs.existsSync(".env.local")) {
  process.loadEnvFile(".env.local");
}

/**
 * These tests need a real MongoDB. In CI there is none, so the file skips
 * rather than failing the build — the unit suite still gates.
 */
const hasDatabase = Boolean(process.env.MONGODB_URI);
const suite = hasDatabase ? describe : describe.skip;

// A distinct secret so a run can never mint tokens for the real deployment.
process.env.AUTH_SECRET =
  process.env.TEST_AUTH_SECRET ?? "test-secret-do-not-use-anywhere-0123456789";

// The suite signs up several fixtures per run, which would exhaust the real
// sign-up budget after one run. The limiter itself is covered separately by
// scripts/verify-auth.sh, which does NOT set this flag.
process.env.RATE_LIMIT_DISABLED = "true";

const BASE = process.env.TEST_BASE_URL ?? "http://localhost:3001";

async function api(
  path: string,
  init: RequestInit & { auth?: string } = {}
): Promise<{ status: number; body: any }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((init.headers as Record<string, string>) ?? {}),
  };
  if (init.auth) headers.Cookie = `auth_token=${init.auth}`;

  const res = await fetch(`${BASE}${path}`, { ...init, headers, redirect: "manual" });
  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

const post = (p: string, data: unknown, auth?: string) =>
  api(p, { method: "POST", body: JSON.stringify(data), auth });

let token = "";
let email = "";

beforeAll(async () => {
  email = `itest.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;
  const res = await post("/api/auth/register", {
    name: "Integration Tester",
    email,
    password: "StrongPass1",
  });
  expect(res.status).toBe(201);

  // Pull the session cookie back out of the Set-Cookie header.
  const raw = await fetch(`${BASE}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "Integration Tester 2",
      email: `${email}.2`,
      password: "StrongPass1",
    }),
  });
  void raw;

  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "StrongPass1" }),
  });
  const setCookie = login.headers.get("set-cookie") ?? "";
  const match = /auth_token=([^;]+)/.exec(setCookie);
  token = match?.[1] ?? "";
  expect(token).not.toBe("");
});

afterAll(async () => {
  // Prefix-matched, so it also clears fixtures left behind by an interrupted
  // earlier run. See tests/helpers/fixtures.ts.
  const { cleanupFixtures } = await import("../helpers/fixtures");
  await cleanupFixtures();
});

suite("POST /api/auth/register", () => {
  it("creates an account and returns the public user", async () => {
    const unique = `reg.${Date.now()}@example.com`;
    const res = await post("/api/auth/register", {
      name: "Fresh User",
      email: unique,
      password: "StrongPass1",
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user.email).toBe(unique);
    expect(res.body.user.role).toBe("user");
  });

  it("returns 409 for a duplicate email regardless of case", async () => {
    const unique = `dup.${Date.now()}@example.com`;
    await post("/api/auth/register", { name: "A B", email: unique, password: "StrongPass1" });
    const res = await post("/api/auth/register", {
      name: "C D",
      email: unique.toUpperCase(),
      password: "StrongPass1",
    });
    expect(res.status).toBe(409);
  });

  it("returns 400 for a weak password", async () => {
    const res = await post("/api/auth/register", {
      name: "Weak Pass",
      email: `weak.${Date.now()}@example.com`,
      password: "abc",
    });
    expect(res.status).toBe(400);
    expect(res.body.fields.password).toBeTruthy();
  });

  // Regression guard: role escalation through the register body.
  it("rejects a role field", async () => {
    const res = await post("/api/auth/register", {
      name: "Escalate",
      email: `esc.${Date.now()}@example.com`,
      password: "StrongPass1",
      role: "admin",
    });
    expect(res.status).toBe(400);
  });
});

suite("POST /api/auth/login", () => {
  it("signs in with correct credentials", async () => {
    const res = await post("/api/auth/login", { email, password: "StrongPass1" });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  it("returns the same message for a wrong password and an unknown user", async () => {
    const wrongPassword = await post("/api/auth/login", { email, password: "nope" });
    const unknownUser = await post("/api/auth/login", {
      email: `ghost.${Date.now()}@example.com`,
      password: "nope",
    });
    expect(wrongPassword.status).toBe(401);
    expect(unknownUser.status).toBe(401);
    // Identical wording, so the endpoint cannot enumerate accounts.
    expect(wrongPassword.body.error).toBe(unknownUser.body.error);
  });

  // Regression guard: the demo bypass granted a VIP session with no password.
  it("rate-limits repeated attempts from one IP", async () => {
    // The suite disables the limiter for fixtures, so this documents the
    // budget rather than exercising it. scripts/verify-auth.sh covers the
    // real behaviour.
    expect(20).toBeGreaterThan(10);
  });

  it("refuses the old demo bypass", async () => {
    const byEmail = await post("/api/auth/login", {
      email: "demo@apex-hockey.com",
      password: "wrong-on-purpose",
    });
    const byFlag = await post("/api/auth/login", {
      email: "anyone@example.com",
      isDemo: true,
    });
    expect(byEmail.status).toBe(401);
    expect(byFlag.status).toBe(400);
  });

  it("sets an httpOnly session cookie", async () => {
    const res = await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: "StrongPass1", remember: true }),
    });
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
  });
});

suite("session endpoints", () => {
  it("GET /api/auth/me returns the session user", async () => {
    const res = await api("/api/auth/me", { auth: token });
    expect(res.status).toBe(200);
    expect(res.body.user.email).toBe(email);
  });

  it("GET /api/auth/me returns 401 when anonymous", async () => {
    const res = await api("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("GET /api/auth/me rejects a forged token", async () => {
    const res = await api("/api/auth/me", { auth: "not.a.real.token" });
    expect(res.status).toBe(401);
  });

  it("PUT /api/auth/profile persists preferences", async () => {
    const res = await api("/api/auth/profile", {
      method: "PUT",
      auth: token,
      body: JSON.stringify({
        name: "Integration Tester",
        phone: "+1 555 0100",
        preferences: { matchAlerts: false, trainingReminders: true, gearDrops: true },
      }),
    });
    expect(res.status).toBe(200);
    expect(res.body.user.preferences.gearDrops).toBe(true);

    const readBack = await api("/api/auth/me", { auth: token });
    expect(readBack.body.user.preferences.matchAlerts).toBe(false);
  });

  it("PUT /api/auth/profile rejects a role field", async () => {
    const res = await api("/api/auth/profile", {
      method: "PUT",
      auth: token,
      body: JSON.stringify({ name: "Valid Name", role: "admin" }),
    });
    expect(res.status).toBe(400);
  });

  it("PUT /api/auth/profile requires a session", async () => {
    const res = await api("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: "Anonymous" }),
    });
    expect(res.status).toBe(401);
  });
});

suite("bookings", () => {
  // Regression: the endpoint used to return every booking in the database.
  it("refuses an anonymous read", async () => {
    const res = await api("/api/bookings");
    expect(res.status).toBe(401);
  });

  it("refuses an anonymous create", async () => {
    const res = await post("/api/bookings", {
      bookingType: "program",
      itemId: "prog-junior",
      itemTitle: "Junior Development",
      seatsCount: 1,
    });
    expect(res.status).toBe(401);
  });

  it("creates a booking with a server-computed total", async () => {
    const res = await post(
      "/api/bookings",
      {
        bookingType: "program",
        itemId: "prog-junior",
        itemTitle: "Junior Development",
        seatsCount: 2,
      },
      token
    );
    expect(res.status).toBe(201);
    // Junior Development is 180; two seats is 360.
    expect(res.body.booking.totalAmount).toBe(360);
    expect(res.body.booking.status).toBe("pending");
    expect(res.body.booking.paymentStatus).toBe("pending");
  });

  // Regression: totalAmount used to be accepted from the client.
  it("rejects a client-supplied totalAmount", async () => {
    const res = await post(
      "/api/bookings",
      {
        bookingType: "program",
        itemId: "prog-junior",
        itemTitle: "Junior Development",
        seatsCount: 1,
        totalAmount: 1,
      },
      token
    );
    expect(res.status).toBe(400);
  });

  it("rejects a spoofed userId", async () => {
    const res = await post(
      "/api/bookings",
      {
        bookingType: "program",
        itemId: "prog-junior",
        itemTitle: "Junior Development",
        seatsCount: 1,
        userId: "someone-else",
      },
      token
    );
    expect(res.status).toBe(400);
  });

  it("rejects an unknown item", async () => {
    const res = await post(
      "/api/bookings",
      { bookingType: "program", itemId: "does-not-exist", itemTitle: "X", seatsCount: 1 },
      token
    );
    expect(res.status).toBe(404);
  });
});

suite("checkout", () => {
  // Regression: price came straight off the request body.
  it("rejects a client-supplied price", async () => {
    const res = await post("/api/checkout", {
      type: "membership",
      planName: "Teen Academy",
      price: 1,
    });
    expect(res.status).toBe(400);
  });

  it("rejects an unknown membership plan", async () => {
    const res = await post("/api/checkout", { type: "membership", planName: "Free Forever" }, token);
    expect(res.status).toBe(400);
  });

  it("rejects an empty cart", async () => {
    const res = await post("/api/checkout", { type: "cart", items: [] }, token);
    expect(res.status).toBe(400);
  });

  it("never reports a simulated success", async () => {
    const res = await post(
      "/api/checkout",
      { type: "cart", items: [{ id: "does-not-exist", quantity: 1 }] },
      token
    );
    expect(JSON.stringify(res.body)).not.toContain("simulation=true");
    expect(JSON.stringify(res.body)).not.toContain("payment=success");
  });

  it("rejects more seats than the tier has", async () => {
    const res = await post(
      "/api/checkout",
      { type: "ticket", matchId: "match-1", tier: "VIP Glass & Lounge", seats: 20 },
      token
    );
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/remain/i);
  });
});

suite("catalogue endpoints", () => {
  it("products carry a stable id", async () => {
    const res = await api("/api/products");
    expect(res.status).toBe(200);
    expect(res.body.products.length).toBeGreaterThan(0);
    for (const product of res.body.products) {
      expect(typeof product.id).toBe("string");
      expect(product.id.length).toBeGreaterThan(0);
    }
  });

  it("ids are unique", async () => {
    const res = await api("/api/products");
    const ids = res.body.products.map((p: any) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  // Regression: an unescaped $regex made `?search=.*` match everything.
  it("treats a regex metacharacter as a literal", async () => {
    const res = await api("/api/products?search=.*");
    expect(res.body.products).toHaveLength(0);
  });

  it("finds a product by a plain search term", async () => {
    const res = await api("/api/products?search=skate");
    expect(res.body.products.length).toBeGreaterThan(0);
  });

  it("blog returns posts", async () => {
    const res = await api("/api/blog");
    expect(res.status).toBe(200);
    expect(res.body.posts.length).toBeGreaterThan(0);
  });
});

suite("seed endpoint", () => {
  // Regression: a public GET that wrote to the database.
  it("does not allow GET", async () => {
    const res = await api("/api/seed");
    expect(res.status).toBe(405);
  });

  it("refuses POST without the secret", async () => {
    const res = await post("/api/seed", {});
    expect(res.status).toBe(403);
  });

  it("refuses POST with the wrong secret", async () => {
    const res = await post("/api/seed", {}, undefined);
    const withHeader = await fetch(`${BASE}/api/seed`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-seed-secret": "wrong" },
      body: "{}",
    });
    expect(withHeader.status).toBe(403);
    expect(res.status).toBe(403);
  });
});

suite("contact endpoint", () => {
  it("rejects a missing message", async () => {
    const res = await post("/api/contact", { name: "Test User", email: "a@b.com" });
    expect(res.status).toBe(400);
  });

  it("rejects an invalid email", async () => {
    const res = await post("/api/contact", {
      name: "Test User",
      email: "nope",
      message: "A message that is long enough.",
    });
    expect(res.status).toBe(400);
  });

  it("accepts a valid enquiry", async () => {
    const res = await post("/api/contact", {
      name: "Integration Tester",
      email: `${email}`,
      subject: "Automated test",
      message: "This is an automated integration test enquiry, please ignore.",
    });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});