# Apex Hockey Club — Setup Guide

Next.js 14 (App Router) · MongoDB Atlas · Tailwind CSS 3 · Netlify

---

## Requirements

- **Node.js 20+** (developed on 26.x)
- **npm 10+**
- A MongoDB Atlas cluster (or any MongoDB instance)
- Optional: Netlify CLI, for deploys and env management

---

## Install

```bash
git clone https://github.com/islamrakibul9274/apex-hockey-club.git
cd apex-hockey-club
npm install
```

---

## Environment

```bash
cp .env.example .env.local
```

Then fill in the two **required** values. Everything else is optional and the
matching feature degrades gracefully when unset.

### Required

| Variable | Notes |
|---|---|
| `AUTH_SECRET` | Signs session JWTs. **There is no fallback** — the app refuses to authenticate without it, because a hardcoded default in a public repo would let anyone mint an admin token. Generate one: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
| `MONGODB_URI` | MongoDB connection string |

### Optional

| Variable | Feature | Behaviour when unset |
|---|---|---|
| `AUTH_URL` | Canonical origin, reset links, Stripe redirects | Falls back to `http://localhost:3000` |
| `STRIPE_SECRET_KEY` | Checkout | Returns "payments are not configured" |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe.js | — |
| `STRIPE_WEBHOOK_SECRET` | Payment confirmation | Bookings stay `pending` |
| `GROQ_API_KEY` | AI coach | Returns "coach is not configured" |
| `RESEND_API_KEY` | Contact + reset email | Reset links are written to the server log |
| `CLOUDINARY_*` | Uploads | Not wired up |
| `PUSHER_*` | Realtime updates | Not wired up |
| `SEED_SECRET` | Protects `POST /api/seed` | **Endpoint refuses all requests** |

> `.env.local` is gitignored. Never commit it.

---

## Database

```bash
npm run seed          # catalogue + demo user (idempotent)
npm run migrate       # 001 — password reset fields + indexes
npm run migrate:002   # 002 — notification preferences
npm run migrate:003   # 003 — repoint stored records at the new images
```

All four are additive and safe to re-run. Run the migrations in order; none of
them delete data.

To create the demo athlete (`demo@apex-hockey.com` / `hockey2026`):

```bash
npm run seed
```

This is a real account with a bcrypt-hashed password. It is **not** a bypass —
signing in as it requires the correct password.

---

## Run locally

```bash
npm run dev
```

Open <http://localhost:3000>. If port 3000 is taken, Next.js uses 3001.

> **Do not run `next dev` and `npm start` at the same time.** They share the
> `.next` directory and will corrupt each other's build. Stop the dev server
> before running the e2e suite or a production build.

---

## Tests

```bash
npm test              # 65 unit + 36 integration tests
npm run test:coverage # with coverage
npm run test:e2e      # 12 Playwright end-to-end tests
npm run test:all      # unit + integration + e2e
npm run verify        # shell suites: auth + repaired features
```

### What each layer covers

| Suite | Count | Covers |
|---|---|---|
| `tests/unit` | 65 | Validation schemas, password policy, regex escaping, server-side pricing, id normalisation, rate limiter |
| `tests/integration` | 36 | Real route handlers against MongoDB: auth, sessions, bookings, checkout, catalogue, seeding, contact |
| `tests/e2e` | 12 | Sign up → sign out → sign in, cart persistence, global search, navigation, 404s, mobile menu, contact form, a11y checks |
| `scripts/verify-auth.sh` | 34 | Auth over HTTP, including brute-force protection |
| `scripts/verify-features.sh` | 38 | The repaired features from the audit |

The integration and e2e suites set `RATE_LIMIT_DISABLED=true` so they can
create fixtures on repeat runs. **The rate limiter's own behaviour is asserted
end to end by `scripts/verify-auth.sh`, which does not set that flag** — and
there is a unit test for the flag itself.

The e2e suite starts its own production server on port 3100 and needs a fresh
build:

```bash
npm run build && npm run test:e2e
```

---

## Imagery

Photography lives in `public/images` as WebP, stored in-repo rather than
hotlinked. Each photo is emitted at three consistent crops (`wide` 16:9,
`card` 4:3, `thumb` 1:1) so cards and banners share an aspect ratio.

```bash
bash scripts/fetch-images.sh   # re-download and re-crop
```

Sources are Unsplash under the Unsplash License — see
`public/images/ATTRIBUTION.md`. `src/lib/images.ts` is the single manifest for
paths, dimensions, alt text and responsive `sizes`.

---

## Deploy

### Netlify

`netlify.toml` already configures the build and the Next.js runtime plugin.

```bash
npx netlify login
npx netlify link
npx netlify deploy --build          # deploy
npx netlify deploy --build --prod   # production
```

Set the environment variables in the Netlify UI (or with `npx netlify env:set`)
and add `SEED_SECRET` if you want `POST /api/seed` to work at all.

> The CLI removed `netlify env:pull` in v27. To copy production env into
> `.env.local`, fetch each value individually:
>
> ```bash
> npx netlify env:get AUTH_SECRET
> ```

### Before any deploy

1. `npm run build && npm run test:all`
2. `AUDIT.md` C1 — the demo VIP bypass — is fixed in code but **the deployed
   site may still be running the old build** until you redeploy.
3. Rotate `AUTH_SECRET` if it has ever been exposed.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `Missing required environment variable AUTH_SECRET` | `.env.local` absent | `cp .env.example .env.local` and fill it in |
| Hero image is a black box | Stored records point at deleted PNGs | `npm run migrate:003` |
| `The requested resource isn't a valid image` | An image file is missing | Run `bash scripts/fetch-images.sh` |
| Playwright: `Process from config.webServer was not able to start` | A dev server is overwriting `.next` | `pkill -f "next dev"`, `npm run build`, retry |
| Integration tests fail with 429 | Rate limiter, and the flag wasn't set | Run with `RATE_LIMIT_DISABLED=true` |
| `/api/seed` returns 403 | `SEED_SECRET` unset or wrong | Send it as the `x-seed-secret` header |