import { cleanupFixtures } from "../helpers/fixtures";

/**
 * Playwright global teardown.
 *
 * The e2e suite signs up a real account and submits real contact inquiries,
 * because those flows need a working database and a real session. Without
 * this, every run left a user and an inquiry behind.
 */
export default async function globalTeardown(): Promise<void> {
  const result = await cleanupFixtures();
  if (result) {
    console.log(
      `[teardown] removed ${result.users} fixture users, ` +
        `${result.bookings} bookings, ${result.inquiries} inquiries`
    );
  }
}