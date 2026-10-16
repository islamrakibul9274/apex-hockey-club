import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SubscribeButton from "@/components/SubscribeButton";
import { MEMBERSHIP_PLANS, normalisePlan } from "@/lib/pricing";
import { FaCheck, FaArrowLeft } from "react-icons/fa6";

/**
 * Rendered on the server.
 *
 * Two fixes beyond the conversion:
 *
 *  - The subscribe button used to send a client-side `price`, which /api/checkout
 *    now rejects, so the flow was broken. It sends a plan slug and the server
 *    resolves the amount.
 *  - "SAVE 20%" was hard-coded but the actual saving is 19.5% / 20.3% / 19.9%.
 *    It is computed from the prices now, per tier.
 */

export const metadata: Metadata = {
  title: "Membership Pricing",
  description:
    "Season memberships for ice hockey coaching, camps and match access at Apex Hockey Club.",
  alternates: { canonical: "/pricing" },
};

/** Marketing copy only. The amount charged always comes from MEMBERSHIP_PLANS. */
const PLANS = [
  {
    slug: "junior",
    name: "Junior Development",
    audience: "Ages 6–12",
    monthly: 29,
    tagline: "Fundamentals and confidence on the ice.",
    features: [
      "Weekly skills sessions, 60 minutes",
      "Skate-fitting and kit loan included",
      "Skills progress reviewed each block",
      "Family spectator passes",
    ],
  },
  {
    slug: "teen-academy",
    name: "Teen Academy",
    audience: "Ages 13–17",
    monthly: 69,
    tagline: "Competitive structure with position play.",
    features: [
      "Twice-weekly training, 90 minutes",
      "Position-specific skill blocks",
      "Video review after fixtures",
      "Priority entry to camps",
    ],
    popular: true,
  },
  {
    slug: "professional-league-masterclass",
    name: "Professional Masterclass",
    audience: "Senior squads",
    monthly: 129,
    tagline: "Tactics, powerplay systems and conditioning.",
    features: [
      "Four sessions a week",
      "Full tactical playbook access",
      "Strength and conditioning programme",
      "Match-day squad support",
    ],
  },
];

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  // Driven by the URL rather than component state, so the billing period is
  // shareable, bookmarkable and survives a refresh without client JavaScript.
  const annual = (await searchParams)?.cycle === "annual";

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Navbar />

      <main id="main" className="apex-container flex-1 py-12">
        <header className="apex-page-intro">
          <span className="apex-badge apex-badge-brand uppercase tracking-widest">
            Membership
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Transparent pricing for every hockey goal
          </h1>
          <p className="mt-4 leading-relaxed text-ink-600">
            Arena ice access, coaching masterclasses, match tickets and member
            gear pricing — billed monthly or for the season.
          </p>

          {/* Billing period switch. Links, not a checkbox, so it works without JS. */}
          <nav
            aria-label="Billing period"
            className="mt-8 inline-flex items-center gap-1 rounded-full border border-line-200 bg-surface-50 p-1"
          >
            {(["monthly", "annual"] as const).map((cycle) => {
              const active = (cycle === "annual") === annual;
              return (
                <Link
                  key={cycle}
                  href={
                    cycle === "annual" ? "/pricing?cycle=annual" : "/pricing"
                  }
                  aria-current={active ? "true" : undefined}
                  className={[
                    "rounded-full px-5 py-2 text-sm font-semibold capitalize transition-colors",
                    active
                      ? "bg-brand-500 text-white"
                      : "text-ink-600 hover:text-ink-900",
                  ].join(" ")}
                >
                  {cycle}
                  {cycle === "annual" && (
                    <span className="ml-1.5 opacity-80">· save ~20%</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </header>

        <ul className="mt-12 grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const serverPlan = MEMBERSHIP_PLANS[normalisePlan(plan.slug)];
            const annualPrice = serverPlan.amount / 100;
            const saving = annual
              ? Math.round((1 - annualPrice / (plan.monthly * 12)) * 100)
              : 0;

            return (
              <li
                key={plan.slug}
                className={[
                  "apex-card relative flex h-full flex-col p-6 sm:p-8",
                  plan.popular ? "border-brand-300 shadow-md" : "",
                ].join(" ")}
              >
                {plan.popular && (
                  <span className="apex-badge apex-badge-brand absolute -top-3 left-6">
                    Most popular
                  </span>
                )}

                <h2 className="text-lg font-extrabold text-ink-900">
                  {plan.name}
                </h2>
                <p className="mt-0.5 text-sm text-ink-500">{plan.audience}</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-600">
                  {plan.tagline}
                </p>

                <div className="mt-6 flex items-baseline gap-1.5">
                  <span className="text-3xl font-extrabold tracking-tight text-ink-900">
                    {formatMoney(annual ? annualPrice : plan.monthly)}
                  </span>
                  <span className="text-sm text-ink-500">
                    {annual ? "per season" : "per month"}
                  </span>
                </div>

                {annual && saving > 0 && (
                  <p className="mt-1 text-sm font-semibold text-success-700">
                    Save {saving}% versus monthly
                  </p>
                )}

                <ul className="mt-6 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm text-ink-700"
                    >
                      <FaCheck
                        aria-hidden="true"
                        className="mt-0.5 shrink-0 text-brand-600"
                      />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <SubscribeButton
                    planSlug={plan.slug}
                    label={annual ? "Join for the season" : "Join monthly"}
                    variant={plan.popular ? "primary" : "secondary"}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        <p className="mt-10 text-center text-sm text-ink-500">
          Not sure which fits?{" "}
          <Link
            href="/contact?subject=Membership%20advice"
            className="font-semibold text-brand-600 hover:underline"
          >
            Ask us and we will point you at the right one
          </Link>
          .
        </p>

        <Link
          href="/programs"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink-600 hover:text-brand-600"
        >
          <FaArrowLeft aria-hidden="true" className="text-xs" />
          Back to programmes
        </Link>
      </main>

      <Footer />
    </div>
  );
}
