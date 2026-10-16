import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end configuration.
 *
 * Starts its own server so the suite does not depend on a dev server already
 * running. Rate limiting is disabled here for the same reason as the
 * integration suite: an e2e run signs up several users and would otherwise
 * exhaust the real budget. The limiter is covered by scripts/verify-auth.sh.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],

  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },

  // The e2e suite creates real users, bookings and inquiries. Tear them down
  // afterwards so a test run does not accumulate rows in the database.
  globalTeardown: "./tests/e2e/global-teardown.ts",

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: {
    // `next dev` and `next start` share the .next directory, so running the dev
    // server leaves no production build behind. `npm run test:e2e` builds first
    // to guarantee one exists before this starts.
    command: "npm run start -- --port 3100",
    url: "http://localhost:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: {
      RATE_LIMIT_DISABLED: "true",
      NODE_ENV: "production",
    },
  },
});