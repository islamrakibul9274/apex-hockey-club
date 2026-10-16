import fs from "node:fs";

/**
 * Shared fixture cleanup for the integration suite and the Playwright
 * teardown.
 *
 * Both suites create real users, bookings and inquiries in the configured
 * database. The previous inline cleanup removed two exact addresses and
 * nothing else, so repeated runs left behind 67 of the 68 users in the
 * database — every one of them a test fixture.
 *
 * Cleanup is matched by prefix rather than by a captured list, so it also
 * removes fixtures left by an interrupted or failed earlier run.
 */

/**
 * Every address the suites generate. The leading group is anchored so a real
 * customer such as `jordan@example.com` is never matched.
 */
export const FIXTURE_EMAIL_PATTERN =
  /^(reg|dup|weak|esc|itest|verify|p3|e2e|anon)[.@]/;

const FIXTURE_CUSTOMER_PATTERN = /^(reg|dup|weak|esc|itest|verify|p3|e2e|anon)[.@]/;

/**
 * Deletes test fixtures from the database named in MONGODB_URI.
 *
 * Never throws: a cleanup failure must not fail the suite that called it.
 * Returns counts so callers can assert or log them.
 */
export async function cleanupFixtures(): Promise<{
  users: number;
  bookings: number;
  inquiries: number;
} | null> {
  try {
    // Load first, then check: the Playwright teardown runs in a process where
    // MONGODB_URI is not exported, and the previous order returned early there
    // and silently cleaned up nothing.
    if (fs.existsSync(".env.local") && !process.env.MONGODB_URI) {
      process.loadEnvFile(".env.local");
    }

    const uri = process.env.MONGODB_URI;
    if (!uri) return null;

    const { MongoClient } = await import("mongodb");
    const client = new MongoClient(uri);
    await client.connect();
    try {
      // No explicit name: the database is the one in the URI, which is what
      // the application itself uses.
      const db = client.db();
      const collections = await db.listCollections().toArray();
      const names = collections.map((c) => c.name);

      const users = names.includes("users")
        ? (await db
            .collection("users")
            .deleteMany({ email: { $regex: FIXTURE_EMAIL_PATTERN.source } }))
            .deletedCount
        : 0;

      const bookings =
        names.includes("bookings")
          ? (
              await db
                .collection("bookings")
                .deleteMany({
                  $or: [
                    { userEmail: { $regex: FIXTURE_CUSTOMER_PATTERN.source } },
                    { customerEmail: { $regex: FIXTURE_CUSTOMER_PATTERN.source } },
                  ],
                })
            ).deletedCount
          : 0;

      const inquiries = names.includes("inquiries")
        ? (
            await db
              .collection("inquiries")
              .deleteMany({ email: { $regex: FIXTURE_CUSTOMER_PATTERN.source } })
          ).deletedCount
        : 0;

      return { users, bookings, inquiries };
    } finally {
      await client.close();
    }
  } catch {
    return null;
  }
}