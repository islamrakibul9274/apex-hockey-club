import { test, expect } from "@playwright/test";

/**
 * End-to-end coverage of the flows a user actually completes:
 * sign up -> sign out -> sign in -> browse and add to cart -> account.
 *
 * Each run uses a unique email so the suite is repeatable.
 */

const runId = `${Date.now()}.${Math.floor(Math.random() * 1e6)}`;
const USER = {
  name: "E2E Athlete",
  email: `e2e.${runId}@example.com`,
  password: "StrongPass1",
};

test.describe("authentication journey", () => {
  test("signs up, reaches the account portal, signs out and signs back in", async ({ page }) => {
    // ---- Sign up ----
    await page.goto("/auth/signup");

    await page.getByLabel(/full name/i).fill(USER.name);
    await page.getByLabel(/email address/i).fill(USER.email);
    await page.locator('input[type="password"]').nth(0).fill(USER.password);
    await page.locator('input[type="password"]').nth(1).fill(USER.password);

    // The strength meter should reflect the password.
    await expect(page.getByText("Password strength")).toBeVisible();

    await page.getByRole("button", { name: /create account/i }).click();

    // Signed up users land on the portal.
    await page.waitForURL(/\/account/, { timeout: 30_000 });
    await expect(page.getByText(USER.name).first()).toBeVisible();

    // ---- Session persists across a reload ----
    await page.reload();
    await expect(page.getByText(USER.name).first()).toBeVisible();

    // ---- Sign out (from the portal's settings tab) ----
    await page.goto("/account?tab=settings");
    await page.getByRole("button", { name: /sign out/i }).first().click();

    // After sign-out the account page must not render protected content.
    await page.goto("/account");
    await page.waitForURL(/\/auth\/signin/, { timeout: 30_000 });

    // ---- Sign back in ----
    await page.getByLabel(/email address/i).fill(USER.email);
    await page.locator('input[type="password"]').nth(0).fill(USER.password);
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await page.waitForURL(/\/account/, { timeout: 30_000 });
    await expect(page.getByText(USER.name).first()).toBeVisible();
  });

  test("rejects a mismatched confirmation password before contacting the server", async ({
    page,
  }) => {
    await page.goto("/auth/signup");

    await page.getByLabel(/full name/i).fill("Mismatch Test");
    await page.getByLabel(/email address/i).fill(`mismatch.${runId}@example.com`);
    await page.locator('input[type="password"]').nth(0).fill(USER.password);
    await page.locator('input[type="password"]').nth(1).fill("Different1234");

    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText(/passwords do not match/i)).toBeVisible();
    // Still on the signup page.
    await expect(page).toHaveURL(/\/auth\/signup/);
  });

  test("shows a generic error for a wrong password", async ({ page }) => {
    await page.goto("/auth/signin");

    await page.getByLabel(/email address/i).fill(USER.email);
    await page.locator('input[type="password"]').nth(0).fill("DefinitelyNotIt1");
    await page.getByRole("button", { name: /^sign in$/i }).click();

    await expect(page.getByRole("alert").first()).toContainText(/incorrect email or password/i);
    await expect(page).toHaveURL(/\/auth\/signin/);
  });
});

test.describe("password reset", () => {
  test("validates the email field and confirms submission", async ({ page }) => {
    await page.goto("/auth/forgot-password");

    await page.getByLabel(/email address/i).fill("definitely-not-an-email");
    await page.getByRole("button", { name: /send reset link/i }).click();
    await expect(page.getByText(/valid email|email address/i).first()).toBeVisible();

    await page.getByLabel(/email address/i).fill(`reset.${runId}@example.com`);
    await page.getByRole("button", { name: /send reset link/i }).click();

    // Generic confirmation, regardless of whether the account exists.
    await expect(page.getByText(/if an account exists/i)).toBeVisible();
  });
});

test.describe("store and cart", () => {
  test("adds two different products as two separate cart lines and survives a reload", async ({
    page,
  }) => {
    await page.goto("/products");

    const addButtons = page.getByRole("button", { name: /add .* to cart/i });
    await expect(addButtons.first()).toBeVisible({ timeout: 30_000 });

    await addButtons.nth(0).click();
    await page.waitForTimeout(700);
    // The drawer opens on add and covers the grid; dismiss it.
    await page.mouse.click(40, 500);
    await page.waitForTimeout(500);

    await addButtons.nth(1).click();
    await page.waitForTimeout(900);

    const cart = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("apex_hockey_cart") ?? "[]")
    );

    // Regression guard: products had no `id`, so they merged into one line.
    expect(cart.length).toBe(2);
    expect(new Set(cart.map((i: { id: string }) => i.id)).size).toBe(2);

    // Regression guard: the cart used to be wiped on the next render.
    await page.reload();
    await page.waitForTimeout(1200);

    const afterReload = await page.evaluate(() =>
      JSON.parse(window.localStorage.getItem("apex_hockey_cart") ?? "[]")
    );
    expect(afterReload.length).toBe(2);
  });

  test("global search reaches the products page with the term applied", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("button", { name: /search the store/i }).click();
    await page.getByLabel(/search products/i).fill("skate");
    await page.getByRole("button", { name: /^search$/i }).click();

    await page.waitForURL(/\/products\?search=skate/, { timeout: 20_000 });

    // The input must be populated from the query string, not discarded.
    await expect(page.locator('input[type="search"], input').first()).toHaveValue(/skate/i);
  });
});

test.describe("navigation and routing", () => {
  test("every primary navigation link resolves", async ({ page }) => {
    await page.goto("/");

    for (const [label, expected] of [
      ["About", /\/about/],
      ["Programs", /\/programs/],
      ["Shop", /\/products/],
      ["Tickets", /\/get-ticket/],
      ["Pricing", /\/pricing/],
      ["Blog", /\/blog/],
      ["Contact", /\/contact/],
    ] as const) {
      await page.goto("/");
      await page.getByRole("link", { name: label, exact: true }).first().click();
      await page.waitForURL(expected, { timeout: 20_000 });
      await expect(page.getByRole("heading").first()).toBeVisible();
    }
  });

  test("unknown dynamic slugs return 404 rather than the wrong page", async ({ page }) => {
    for (const path of ["/blog/does-not-exist", "/legal/nonsense", "/services/not-real"]) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} should 404`).toBe(404);
    }
  });

  test("mobile menu opens, navigates and closes", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 780 });
    await page.goto("/");

    const menuButton = page.getByRole("button", { name: /open menu/i });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const nav = page.locator("#mobile-nav");
    await expect(nav).toBeVisible();

    await nav.getByRole("link", { name: "Programs", exact: true }).click();
    await page.waitForURL(/\/programs/, { timeout: 20_000 });

    // The drawer must close on navigation rather than lingering.
    await expect(page.locator("#mobile-nav")).toHaveCount(0);
  });
});

test.describe("contact form", () => {
  test("reports inline validation errors and then succeeds", async ({ page }) => {
    await page.goto("/");
    const contact = page.locator('section[aria-labelledby="contact-heading"]');
    await contact.scrollIntoViewIfNeeded();

    await contact.getByRole("button", { name: /send message/i }).click();
    await expect(contact.getByText(/please tell us your name/i)).toBeVisible();
    await expect(contact.getByText(/valid email address/i)).toBeVisible();

    await contact.locator("#c-name").fill("E2E Athlete");
    await contact.locator("#c-email").fill(USER.email);
    await contact
      .locator("#c-message")
      .fill("This is an automated end-to-end test enquiry that should be ignored.");
    await contact.getByRole("button", { name: /send message/i }).click();

    await expect(contact.getByText(/message sent/i)).toBeVisible({ timeout: 20_000 });
  });
});

test.describe("accessibility basics", () => {
  test("the home page exposes a skip link, one main landmark and labelled controls", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.getByRole("link", { name: /skip to main content/i })).toBeAttached();
    await expect(page.locator("main#main")).toHaveCount(1);

    // The menu trigger is lg:hidden by design, so it only exists in the
    // accessibility tree below the lg breakpoint.
    await expect(page.getByRole("button", { name: /open menu/i })).toHaveCount(0);
    await page.setViewportSize({ width: 375, height: 780 });
    await expect(page.getByRole("button", { name: /open menu/i })).toBeVisible();
  });

  test("no images are missing alt text", async ({ page }) => {
    await page.goto("/");
    const missing = await page.evaluate(() =>
      Array.from(document.images)
        .filter((img) => !img.hasAttribute("alt"))
        .map((img) => img.currentSrc || img.src)
    );
    expect(missing).toEqual([]);
  });
});