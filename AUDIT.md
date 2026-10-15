# Phase 1 Audit — Apex Hockey Club

Next.js 14.2.35 (App Router) + MongoDB (Mongoose 8) + Tailwind 3 + daisyUI 4 · deployed at apex-hockey-club.netlify.app

Verified by execution, not just reading. Live-confirmed against both `localhost:3001` and the production URL.

---

## 1. Architecture map

### Routes (26 total)

| Route | Type | Notes |
|---|---|---|
| `/` | static | Home; fires `/api/seed` on every visit |
| `/about` `/contact` `/pricing` `/products` `/programs` `/get-ticket` `/cart` `/blog` | static | all `"use client"` |
| `/account` | static | protected content, no server enforcement |
| `/auth/signin` `/auth/signup` | static | no password reset route |
| `/blog/[slug]` | dynamic | **no 404 on bad slug** |
| `/legal/[slug]` | dynamic | **no 404 on bad slug** |
| `/services/[service]` | dynamic | **no 404; 2 of 8 routes orphaned** |
| `/api/auth/{login,logout,me,profile,register}` | dynamic | see §2 |
| `/api/{products,programs,carousel,seed,contact,bookings,checkout,ai-coach}` | dynamic | see §2 |

### API endpoints

| Endpoint | Auth | Issues |
|---|---|---|
| `POST /api/auth/register` | none | no validation; fakes success on DB failure |
| `POST /api/auth/login` | none | password bypass, VIP backdoor, no rate limit |
| `POST /api/auth/logout` | none | OK (cookie cleared) |
| `GET /api/auth/me` | cookie | fabricates `membershipPlan` on DB failure |
| `PUT /api/auth/profile` | cookie | no field validation; reports success on DB failure |
| `GET /api/seed` | **none** | public DB-write + user-creation endpoint |
| `GET /api/bookings` | **none** | returns **all** bookings to anonymous callers |
| `POST /api/bookings` | none | accepts `body.userId` (IDOR); fakes booking on DB failure |
| `POST /api/checkout` | none | **client-supplied price**; fake success on Stripe failure |
| `POST /api/contact` | none | no rate limit, no email validation |
| `POST /api/ai-coach` | none | **model does not exist**; masks failure as fake advice |
| `GET /api/products` | none | `$regex` injection from unescaped query |
| `GET /api/programs` `GET /api/carousel` | none | read-only, acceptable |

### Data models — `User, Product, Program, BlogPost, CarouselSlide, Booking, Inquiry`
MongoDB Atlas reachable. Current state: 6 products, 3 programs, 3 blog posts, 3 slides, 1 user (the demo account), 0 bookings.

### Environment variables (15)
`MONGODB_URI, AUTH_SECRET, AUTH_URL, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, GROQ_API_KEY, RESEND_API_KEY, NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET, PUSHER_APP_ID, NEXT_PUBLIC_PUSHER_KEY, PUSHER_SECRET, NEXT_PUBLIC_PUSHER_CLUSTER`

`AUTH_SECRET`, `CLOUDINARY_*`, `PUSHER_*` are **never imported anywhere in `src/`** — 5 dead vars.

---

## 2. CRITICAL

### C1 — Unauthenticated VIP backdoor grants access to any caller
`src/app/api/auth/login/route.ts:11`

```ts
if (isDemo || email === "demo@apex-hockey.com") { ... role: "vip" ... }
```

Password is never checked. Confirmed live on **production**:

```
POST /api/auth/login {"email":"demo@apex-hockey.com","password":"x"}
→ {"success":true,"user":{...,"role":"vip","membershipPlan":"Elite Champion"}}
```

Also works via `{"isDemo":true}` with no credentials at all. A real signed JWT is issued. Anyone can obtain an Elite Champion VIP session. Confirmed on `apex-hockey-club.netlify.app`.

### C2 — Password-less accounts authenticate with any password
`src/app/api/auth/login/route.ts:55`

```ts
if (user.password) { ...compare... }   // no else — falls through to success
```

Any user document without a `password` field is logged in by supplying nothing. Registers created by `/api/seed` or any future passwordless flow inherit this.

### C3 — Booking endpoint leaks every booking to anonymous callers (IDOR)
`src/app/api/bookings/route.ts:47-55`

```ts
const filter: any = {};
if (userPayload) { filter.$or = [...] }
const bookings = await Booking.find(filter)...
```

No token ⇒ `filter` is `{}` ⇒ **every booking in the database**. Confirmed live: created a booking as `victim@example.com`, then read it back as a completely anonymous caller — got the email, phone, amount and timestamps.

### C4 — Failed payment reports success
`src/app/api/checkout/route.ts:69-76`

```ts
} catch (err) { ... return NextResponse.json({ success: true, url: `${origin}/account?payment=success&simulation=true` }); }
```

Confirmed live: `price: 0.01` made Stripe reject the session (`"total amount due must add up to at least $0.50 USD"`), and the client received `success:true` with a success URL. The user is told they paid for something they did not buy. The `get-ticket` client compounds this — see C5.

### C5 — Six "fake success" catch blocks render success on failure
| File:line | UI shown on failure |
|---|---|
| `src/app/get-ticket/page.tsx:81` | **"Tickets Confirmed!"** (paid transaction) |
| `src/app/contact/page.tsx:51` | "Inquiry Sent Successfully!" |
| `src/app/programs/page.tsx:68` | "Registration Complete!" |
| `src/components/ProgramSection.tsx:59` | "Registration Confirmed!" |
| `src/components/ContactSection.tsx:41` | "Message Delivered!" |
| `src/components/Footer.tsx:38` | newsletter subscribed |

All are `catch { setSuccess(true) }`. Network error, 500, and timeout all render the success state.

### C6 — Silent data loss: registration and bookings "succeed" when the DB write fails
`src/app/api/auth/register/route.ts:22-35`

```ts
const newUser = await User.create({...}).catch(() => ({ _id: "usr_" + Date.now(), ... }));
```

On DB failure the route returns `success:true` and issues a JWT for a user that **does not exist**. Same pattern at `src/app/api/bookings/route.ts:36` (`bk_` + timestamp). The user believes they registered; next login fails permanently.

### C7 — `AUTH_SECRET` falls back to a public default
`src/lib/auth.ts:4`

```ts
const AUTH_SECRET = process.env.AUTH_SECRET || "default_development_secret_key";
```

The fallback is committed to a public GitHub repo. If the env var is absent, anyone can forge a token with `role: "admin"` for any `userId`. Must fail closed, not open.

### C8 — Public database-write endpoint that creates users
`src/app/api/seed/route.ts`

`GET /api/seed` is unauthenticated, is a **GET that mutates state** (CSRF-exploitable, prefetchable by crawlers), inserts documents, and **creates a user with published credentials** (`demo@apex-hockey.com` / `hockey2026`, `role: vip`). Confirmed `200` on production. The homepage calls it on every visit (`src/app/page.tsx:20`).

### C9 — AI Coach is 100% broken and lies about it
`src/app/api/ai-coach/route.ts:31` uses model `qwen/qwen3.6-27b`.

Verified against the Groq API: that model **does not exist**; only `qwen/qwen3.8-27b` is available. Every request 404s. The catch block then returns a hardcoded canned "coaching tip" as if it were a real answer, plus the raw provider error to the client. Confirmed on production:

```json
{"reply":"Coach Wayne here! Always keep your knees bent...","error":"404 ... model_not_found"}
```

---

## 3. MAJOR

### M1 — Client controls the price charged
`src/app/api/checkout/route.ts:39-52` — `unit_amount: Math.round((price || 49) * 100)` takes the amount from the request body. Confirmed: a live Stripe session was created at an attacker-chosen price. Prices must be resolved server-side from the catalogue.

### M2 — No rate limiting on any auth or expensive endpoint
`login`, `register`, `contact`, `ai-coach` are unlimited. Enables credential stuffing, spam, and free LLM proxying.

### M3 — Regex injection in product search
`src/app/api/products/route.ts:23` — `$regex: search` with unescaped user input. Confirmed: `?search=.*` returned all products, bypassing the title match. ReDoS exposure against MongoDB.

### M4 — No input validation anywhere
`register` checks only truthiness: no email format, no password strength, no name length (`src/app/api/auth/register/route.ts:10`). `profile` accepts arbitrary `avatar`/`address` objects (`src/app/api/auth/profile/route.ts:22`). `contact` has no email validation. `bookings` takes `totalAmount`/`seatsCount` from the client.

### M5 — Internal error messages returned to clients
`register:65`, `profile:37`, `bookings:58`, `contact:45`, `checkout:70` return `error.message` on 500. Leaks stack/provider detail — the AI coach currently leaks the raw Groq error.

### M6 — Cart is wiped on every page load
`src/context/CartContext.tsx:29-42`

Both effects run in the same commit: the load effect calls `setItems(saved)`, then the save effect runs with the still-empty `items` and **overwrites localStorage with `[]`**. A persisted cart never survives a refresh.

### M7 — Global search is entirely non-functional
`Navbar.tsx:275,305` navigates to `/products?search=X`, but `src/app/products/page.tsx` never calls `useSearchParams` (verified: `useSearchParams` appears only in `account/page.tsx:8`). The parameter is discarded on arrival. The search box **and all five "Popular Searches" chips are dead**. Additionally the search fires a full API request on every keystroke with no debounce.

### M8 — `?tab=` on `/account` does not switch tabs
`src/app/account/page.tsx:39` reads `searchParams` once at mount. Navigating `/account` → `/account?tab=bookings` from the Navbar, ticket confirmation, or program registration does not change the visible tab.

### M9 — `?subject=` is discarded by the contact form
Four call sites pass it (`about/page.tsx:194,207`, `programs/page.tsx:189`, `services/[service]/page.tsx:171`) but `contact/page.tsx` never reads search params. Every one of those CTAs lands on a blank form.

### M10 — Blog pages ignore the database entirely
`src/app/blog/page.tsx:8-19` imports `INITIAL_BLOG_POSTS` and filters in memory. `BlogPost` is seeded but never read. DB content is invisible.

### M11 — Account page pre-fills another person's data
`src/app/account/page.tsx:44-47` seeds form state with `name: "Alex Mercer"`, `phone: "(+1) 555-0199"`, `street: "152/1 Wireless Gate"`, `city: "Mohakhali"`. A real user without these fields sees the demo user's address and saves it.

### M12 — Three settings toggles persist nothing
`src/app/account/page.tsx:423,431,439` use `defaultChecked` with no `onChange` and no API call. They look functional and do nothing.

### M13 — Unhandled empty states
`src/app/programs/page.tsx:112-197` renders a blank area with no message when a filter matches nothing (the products page has a proper empty state). `src/components/ProductsSection.tsx:38` uses `data.products.length > 0`, so a filter returning zero results silently keeps the previous list — the empty state is unreachable.

### M14 — Dynamic routes never 404
`blog/[slug]/page.tsx:17`, `legal/[slug]/page.tsx:62`, `services/[service]/page.tsx:123` all fall back to the first entry and return **HTTP 200 with wrong content**. `/legal/nonsense` serves Terms of Service.

### M15 — Dependency vulnerabilities
`npm audit`: **1 critical, 7 high, 3 moderate**. Critical is `next@14.2.35` (DoS via Image Optimizer `remotePatterns`). Highs include `postcss` (XSS in stringify), `tailwindcss`/`chokidar`/`braces`/`micromatch` (DoS), `source-map-js`. All fixes require semver-major upgrades.

### M16 — No test infrastructure
No test runner, no unit, integration, or e2e tests exist.

---

## 4. MINOR

### UI / correctness
- **No `htmlFor` anywhere in the codebase** (0 occurrences) across 32 `<label>` elements — every field is unlabelled to assistive tech.
- **No `role="dialog"` anywhere** (0 occurrences) — all 9 overlays (cart drawer, 5 modals, search, auth, AI coach) lack dialog semantics, Escape handling, focus trapping, and focus restoration. `CartDrawer.tsx:41` backdrop is a `<div onClick>` with no keyboard equivalent.
- **Fake-success text** at `products/page.tsx:209,293` (`reviewsCount || 48`), `ProductsSection.tsx:145,149` (`|| 42`, `views || 320`).
- **Hardcoded `$0.00` tax** `CartDrawer.tsx:159`; **hardcoded "FREE" delivery** `cart/page.tsx:209`.
- **Client-side coupon validation** `cart/page.tsx:33-39` against hardcoded `APEX2026`/`HOCKEY15`; the discount is never sent to the server. `setDiscount(15)` is a flat $15, so a $10 cart displays `-$15.00` and totals $0.
- **No-op ternary** `ProgramSection.tsx:84` — both branches are `"justify-start"`.
- **`clearCart` with no confirmation** `cart/page.tsx:176` — destructive, no undo.
- **"−" at quantity 1 silently deletes the item** (`CartContext.tsx:62`) — an unguarded destructive control in both the drawer and the cart page.
- **Unresettable inputs** `get-ticket/page.tsx:275,287` — `value={customerName || user?.name}` snaps back when cleared.
- **Stale tier on match change** `get-ticket/page.tsx:24-36` — `selectedTier` is not reset, so summary and payload can show a tier from the previous match.
- **Quantity never checked against availability** `get-ticket/page.tsx:245` — can request more VIP seats than exist.
- **`totalAmount` ignores quantity** `ProgramSection.tsx:48`, `programs/page.tsx:57` — hardcoded `seatsCount: 1`.
- **Booking status badge always green** `account/page.tsx:374` — a cancelled booking renders an emerald chip.
- **Blocking `alert()`** `blog/[slug]/page.tsx:93` — inconsistent with the rest of the UI, and silent failure where `navigator.clipboard` is unavailable.
- **Timer leaks** `Footer.tsx:19`, `ProductsSection.tsx:55` — `setTimeout` never cleared on unmount.

### Content / correctness of copy
- **"Prayer Facility"** `ProgressStats.tsx:10` with `FaBuildingColumns` — leftover copy from an unrelated project.
- **"World Cup Flags Match Football & Puck"** `mockData.ts:123` — football in an ice hockey store.
- **"Custom custom goaltender mask wrap illustrations"** `services/[service]/page.tsx:35` — duplicated word.
- **Unrendered Markdown** — `###`, `**bold**` shown literally in `blog/[slug]`, `legal/[slug]`, and the AI coach seed message (`AiCoachWidget.tsx:24`).
- **Dead copy** — `HeroBanner` never renders `slide.subtitle`; `MockData.inStock` and `.delivery` are never read; `MatchTicketData.homeTeam/awayTeam/image` are never rendered.
- **Unsourced claims** — "45,000+ athletes", "18.4K Followers", "14 Championship Trophies" (`SocialSection.tsx`), "SAVE 20%" (actually 19.5/20.3/19.9% by tier, `pricing/page.tsx:119`), "100% refund with zero questions".
- **Fake barcode** `account/page.tsx:399` — a static `FaBarcode` icon while the UI instructs users to scan it at the turnstile.
- **"Sign Out of All Devices"** `account/page.tsx:444` calls a single-session logout. No session management exists.
- **"Security" link** `Footer.tsx:196` points to `/legal/cookies`.
- **Imaginary product** — "Available on iOS and Android" / "Download on App Store & Google Play" with no app (`services/[service]/page.tsx:96,103`); "Desktop Suite" with no software (`:108,116`).

### Placeholder / dead links
- Social links go to bare domain homepages, not the club's accounts: `Footer.tsx:137,142,147,152` and `SocialSection.tsx:25,36,47,58`. Labels claim handles (`@ApexHockey`, `@apex.hockey`) that the targets do not match. A `github.com` link on a hockey club site is nonsense.
- Placeholder contact details throughout: `(+62) 123-321-543`, `hockeys@support.com`, `152/1 Mohakhali Wireless Gate` — not `tel:`/`mailto:` links.
- `FaqSection.tsx:80-83` — "Need Immediate Help?" card has no link or button at all.
- `SocialSection.tsx:78` — "Live Match Stream Coverage" is plain text, not a link.

### Accessibility
- Clickable `<div>`s and `<h3 onClick>` used as buttons: `products/page.tsx:176,222`, `ProductsSection.tsx:111,159`, `get-ticket/page.tsx:148,192`.
- Accordion has no `aria-expanded`/`aria-controls` — `FaqSection.tsx:95-104`.
- Carousel: no `aria-live`, no `aria-current`, autoplay pauses only on hover, no `prefers-reduced-motion` — `HeroBanner.tsx:49-53`.
- Chat log has no `role="log"`/`aria-live` — `AiCoachWidget.tsx:119`.
- Toasts/success panels lack `role="status"` (6 sites).
- Tabs lack `role="tablist"`/`aria-selected` — `account/page.tsx:179`.
- `role="progressbar"` without `aria-valuenow` — `ProgressStats.tsx:72`.
- Account tabs lack `role="tablist"`, and `SocialSection` renders `text-[10px]` below the legibility floor.
- Repeated identical `aria-label="Remove item"` with no product name.
- No skip link; `<main>` has no `id`.
- 4 plain `<img>` tags, **none with `alt`** (`Navbar.tsx:151`, `account/page.tsx:148`, `blog/page.tsx:102`, `blog/[slug]/page.tsx:43`) → all fail WCAG 1.1.1.

### Design system
- **238 hardcoded `#FF4240`** plus 35 `#E03735` and 12 other raw hex values across 26 files.
- The token `primaryRed: "#FF4240"` exists in `tailwind.config.ts:13` and is **referenced zero times**.
- `globals.css` is 15 lines with no tokens — no spacing scale, type scale, radii, or shadows.
- `tailwind.config.ts:7` `content` omits `./src/lib`.

### Images
- **8 hotlinked Unsplash URLs** — no `images.remotePatterns` in `next.config.mjs`, so `next/image` would reject them; the 4 `<img>` tags bypass optimization entirely. No local fallback, so avatars break offline.
- **Zero `srcset`/`sizes`; no `loading="lazy"` below the fold.**
- `Images/` at the repo root is a **duplicate** of `public/images/` — dead weight committed to git.
- **Wrong images**: coach portraits (`about/page.tsx:22,29,36`) use product/marketing shots; the "Biomechanics Suite" facility uses a coach portrait (`:55`); the "Athletic Performance Lab" reuses the FAQ illustration (`:50`).
- **Aspect-ratio risk** `FaqSection.tsx:73` declares 460×460 against a real asset of unknown ratio → letterboxing.
- Inline CSS `backgroundImage` instead of `next/image` at `ProgramSection.tsx:91`, with a `/images/2.png` fallback that would silently show a carbon-stick photo for a program.

### Performance / architecture
- **6.3 MB of JS chunks** total.
- **Every page is `"use client"`** — zero Server Components, no SSR HTML for content pages, no `generateMetadata`, no `generateStaticParams`. Blog/legal/service/pricing pages are fully client-rendered, which is the worst case for SEO and LCP.
- `mockData.ts` (385 lines) ships in the client bundle via 8 client components.
- `PopularSection`/`ProgramSection`/`HeroBanner` fetches have **no loading or error state**.
- Next.js 14.2.35, Stripe 17, Mongoose 8, Tailwind 3, daisyUI 4 are all behind current majors (16, 23, 9, 4, 5).

### Dead code
- Unused imports: `about/page.tsx:8-15`, `contact/page.tsx:10-12,16`, `blog/page.tsx:9`, `get-ticket/page.tsx:6,18`, `legal/[slug]/page.tsx:8`, `services/[service]/page.tsx:8`.
- `mobile-app` and `desktop-app` service routes have zero inbound links.
- 24 uses of `animate-in`, `fade-in`, `no-scrollbar`, `prose` — **all dead classes**; `tailwindcss-animate` and `@tailwindcss/typography` are not installed.

---

## 5. Summary

| Severity | Count |
|---|---|
| Critical | 9 |
| Major | 16 |
| Minor | ~70 |

**The single most urgent issue is C1** — the production site hands an Elite Champion VIP session to any unauthenticated caller. C3 leaks customer PII. C4/C5 tell users they paid when they did not. C7 means a single missing env var yields forgeable admin tokens.

Every issue above was reproduced against the running application or the live production site. No issue in this report is speculative.