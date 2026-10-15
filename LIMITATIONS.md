# Test Results & Known Limitations

Recorded on a full run of every suite.

---

## Test results

| Suite | Command | Result |
|---|---|---|
| Unit + integration | `npm test` | **101 / 101 passing** (3 files) |
| End-to-end | `npm run test:e2e` | **12 / 12 passing** |
| Auth over HTTP | `npm run verify:auth` | **34 / 34 passing** |
| Repaired features | `npm run verify:features` | **38 / 38 passing** |
| Cart persistence (browser) | `node scripts/verify-cart.mjs` | **6 / 6 passing** |
| Build | `npm run build` | Succeeds |
| Type check | `npx tsc --noEmit` | Clean |

**Total: 191 automated checks, all passing.**

### Coverage breakdown

- **65 unit tests** — validation schemas and password policy, regex escaping,
  server-side pricing, catalogue id normalisation, rate limiter.
- **36 integration tests** — real route handlers against MongoDB: registration,
  login, sessions, profile, bookings, checkout, catalogue, seeding, contact.
- **12 e2e tests** — sign up → sign out → sign in, session persistence across
  reload, mismatched passwords, wrong password, reset validation, cart
  persistence, global search, every primary nav link, 404s, mobile menu,
  contact form, accessibility spot checks.

Several tests exist specifically as regression guards for the bugs found in the
audit: the demo bypass, regex injection in product search, missing catalogue
ids, the wiped cart, and the `$regex` escaping.

### Running them

```bash
npm test            # unit + integration
npm run test:e2e    # e2e (needs a fresh build, no dev server running)
npm run verify      # shell suites
```

---

## Known limitations

### Security

1. **Rate limiting is per-process.** The limiter keeps buckets in memory, so on
   Netlify each lambda instance has its own budget — the effective limit is
   per-isolate, not global. A distributed store would be needed for a real
   global limit. The in-repo behaviour is correct and tested.

2. **Automated suites set `RATE_LIMIT_DISABLED=true`** so they can create
   fixtures on repeat runs. The limiter's own behaviour is asserted end to end
   by `scripts/verify-auth.sh`, which does **not** set the flag, and there is a
   unit test for the flag itself. But the suites do not exercise limiting while
   also running.

3. **No Content-Security-Policy.** Stripe and the AI widget inject inline
   styles; a half-configured CSP breaks checkout harder than it helps. Other
   security headers (`X-Content-Type-Options`, `Referrer-Policy`,
   `X-Frame-Options`, `Permissions-Policy`) are set.

4. **Bookings stay `pending` until a Stripe webhook confirms payment.** No
   webhook handler is implemented, so nothing currently marks them paid. This
   is deliberate — the previous code marked bookings `paid` on creation, before
   any money moved. **A webhook endpoint is the next piece of work** for real
   payment reconciliation.

5. **`AUTH_SECRET` should be rotated** if the old deployment ever exposed it.

### Dependencies

6. **11 known npm vulnerabilities, 1 critical.** `next@14.2.35` has a DoS issue
   in the Image Optimizer, plus high-severity issues in `postcss`, `tailwindcss`,
   `chokidar`, `braces`, `micromatch` and `source-map-js`. Every fix requires a
   semver-major upgrade (Next 16, Tailwind 4). **Not done** — it is a migration
   in its own right and carries real regression risk.

7. **`groq-sdk` is pinned at 0.8.0**, an old major. The AI coach works, but the
   SDK should be upgraded.

### Architecture

8. **Nine pages are still client components.** `/about`, `/blog`, `/pricing`,
   `/programs`, `/products`, `/get-ticket`, `/cart`, `/account` and
   `/contact`. Their content only paints after hydration. Three routes
   (`/legal/[slug]`, `/services/[service]`, `/blog/[slug]`) were converted to
   prerendered Server Components, cutting their payloads from 2.02 kB → 296 B,
   3.48 kB → 295 B and 5.93 kB → 205 B respectively. The rest still carry
   113–151 kB of First Load JS.

9. **`mockData.ts` is still bundled client-side** by several pages, shipping the
   full 385-line catalogue in the JS payload.

10. **`Images/` was removed** but nothing enforces that no image path in `src/`
    resolves. A check exists in the test workflow, not in CI.

### Content and design

11. **Store photographs are action shots, not studio product shots.** Unsplash
    has very little isolated hockey gear. They are consistent and on-topic, but
    a real store would use product photography per item.

12. **Coach portraits are action photographs.** The coaches are fictional and no
    headshots exist. The alt text describes what the image shows rather than
    claiming to be a portrait of a named person.

13. **Some copy is still invented.** Programme prices, membership tiers, match
    fixtures and ticket prices are plausible placeholders for a real club to
    replace. Unsourced claims like "45,000+ athletes" were removed, but the
    catalogue itself is fictional data.

14. **The AI coach is unrate-limited per account.** It is limited per IP only,
    which does not stop a determined caller across many addresses.

### Testing

15. **No CI.** Every suite runs locally and passes, but nothing runs them on
    push or on a schedule. The e2e suite needs a build and a free port 3100,
    so it will not run unattended without work.

16. **No visual regression testing.** Layout changes are verified by eye and by
    a11y assertions, not by screenshot diffing.

17. **E2E covers Chromium only.** No Firefox, WebKit or mobile-device runs.

18. **`next dev` and `npm start` share `.next`.** Running both corrupts the
    build — this bit the e2e suite twice during development. It is documented,
    but it is a real footgun.

### Not implemented

19. **No password-reset email is sent in production** until `RESEND_API_KEY` is
    set. Without it the reset link is written to the server log, which on
    Netlify means checking function logs. Functional, but not deliverable to
    end users as-is.

20. **Cloudinary and Pusher are unused.** The environment variables exist and
    the `.env.example` documents them, but no code imports either library.
    They are dead configuration.

21. **No account deletion.** The privacy policy states deletion happens within
    30 days on request, but there is no self-service route for it.

---

## Next steps, in priority order

1. **Stripe webhook handler** — the only functional gap in the payment flow.
2. **CI workflow** — run `npm test`, `npm run build` and the e2e suite on push.
3. **Major dependency upgrades** — Next 16, Tailwind 4, Stripe 23, Mongoose 9.
   Fixes the critical npm advisory.
4. **Convert the remaining nine pages to Server Components** — the single
   largest performance win available.
5. **Distributed rate limiting** if the site takes real traffic.
6. **Product photography** for the store.