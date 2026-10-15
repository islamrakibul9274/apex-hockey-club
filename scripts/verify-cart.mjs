/**
 * Browser-level check for the cart persistence bug (audit M6).
 *
 * The cart previously saved to localStorage in an effect that ran in the same
 * commit as the loader, overwriting a stored cart with `[]` on every page
 * load. This drives a real browser to prove the fix.
 *
 *   node scripts/verify-cart.mjs
 */
import { chromium } from "playwright";

const BASE = process.env.BASE_URL ?? "http://localhost:3001";
const KEY = "apex_hockey_cart";

let pass = 0;
let fail = 0;
const ok = (name, condition, detail = "") => {
  if (condition) {
    pass += 1;
    console.log(`  \x1b[32mPASS\x1b[0m ${name}`);
  } else {
    fail += 1;
    console.log(`  \x1b[31mFAIL\x1b[0m ${name} ${detail}`);
  }
};

const browser = await chromium.launch();
const context = await browser.newContext();
const page = await context.newPage();

const errors = [];
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.on("pageerror", (err) => errors.push(String(err)));

console.log("== Cart persistence ==");

await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });

// The product grid is fetched on the client, so wait for a real product card
// rather than for the page shell.
const addButton = page.getByRole("button", { name: /add .* to cart/i }).first();
await addButton.waitFor({ state: "visible", timeout: 60_000 });
await addButton.click();
// The drawer opens on add and covers the grid; dismiss it before reading.
await page.waitForTimeout(1000);

const afterAdd = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "[]"), KEY);
ok("item persisted to localStorage", afterAdd.length > 0, `got ${afterAdd.length} items`);
const storedTitle = afterAdd[0]?.title ?? "";
ok("stored item has a title", storedTitle.length > 0, storedTitle);

// Reload. Previously the cart was wiped on the very next render.
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const afterReload = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? "[]"), KEY);
ok(
  "cart SURVIVES a page reload",
  afterReload.length === afterAdd.length && afterReload[0]?.title === storedTitle,
  `before=${afterAdd.length} after=${afterReload.length}`
);

// The cart badge should reflect the persisted count.
const badge = await page.locator("header").first().innerText().catch(() => "");
ok("cart badge shows an item count", /1/.test(badge), badge.slice(0, 60));

console.log("== Cart survives navigating away and back ==");
await page.goto(`${BASE}/about`, { waitUntil: "networkidle" });
await page.waitForTimeout(600);
await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
await page.waitForTimeout(1500);

const onCartPage = await page.locator("main").first().innerText().catch(() => "");
ok(
  "cart page shows the persisted item",
  storedTitle.length > 0 && onCartPage.includes(storedTitle.slice(0, 18)),
  onCartPage.slice(0, 100)
);

console.log("== Console health ==");
// /api/auth/me answers 401 when signed out. That is the correct status, so the
// browser's network log line is expected and filtered out rather than ignored.
const expected = ["401 (Unauthorized)", "favicon", "Download the React DevTools"];
const realErrors = errors.filter((e) => !expected.some((x) => e.includes(x)));
ok("no console errors", realErrors.length === 0, realErrors.slice(0, 3).join(" | "));

await browser.close();

console.log(`\n  passed: ${pass}   failed: ${fail}`);
process.exit(fail === 0 ? 0 : 1);