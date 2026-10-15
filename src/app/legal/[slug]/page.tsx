import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

/**
 * Static legal content, rendered on the server.
 *
 * This page was previously `"use client"` and read its slug with useParams,
 * which shipped the whole document set to the browser and painted nothing
 * until hydration finished. It is now prerendered with generateStaticParams,
 * so the HTML arrives complete and the route carries almost no JavaScript.
 */

interface LegalDoc {
  title: string;
  effectiveDate: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

const LEGAL_DOCS: Record<string, LegalDoc> = {
  terms: {
    title: "Terms of Service",
    effectiveDate: "August 2026",
    summary:
      "The agreement that governs your use of Apex Hockey Club services, bookings and store.",
    sections: [
      {
        heading: "1. Membership",
        body: `A membership is personal and non-transferable. Membership runs for the term shown at checkout and renews only if you ask us to renew it. We do not charge a card on file without an explicit opt-in.`,
      },
      {
        heading: "2. Bookings and cancellations",
        body: `Match passes and programme places are held in your name against the email on your account. You may cancel up to 48 hours before the session for a full credit. Inside 48 hours a booking is non-refundable, because ice time and coaching are already committed.`,
      },
      {
        heading: "3. On-ice safety",
        body: `By enrolling in Apex Hockey camps, clinic masterclasses or open ice sessions you acknowledge inherent risks and agree to wear full certified protective equipment (CSA/HECC approved helmet, pads and skates) at all times on the ice sheet.`,
      },
      {
        heading: "4. Store orders",
        body: `Orders are confirmed once payment clears. Equipment that has been sized or fitted cannot be returned unless it is faulty. Faulty equipment is replaced or refunded at our option within 30 days of delivery.`,
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    effectiveDate: "August 2026",
    summary: "What we collect, why we collect it, and the controls you have over it.",
    sections: [
      {
        heading: "What we collect",
        body: `Account details you give us (name, email, phone, billing address), booking and order history, and basic technical data such as your IP address when you sign in.`,
      },
      {
        heading: "Why we collect it",
        body: `To run your account, take payment, issue match passes and send the alerts you have opted into. We do not sell personal data and we do not share it with advertisers.`,
      },
      {
        heading: "Cookies",
        body: `We set a session cookie so you stay signed in, and a small cart cookie so your basket survives a refresh. We do not use advertising trackers.`,
      },
      {
        heading: "Your controls",
        body: `You can update your details and notification preferences from your account at any time. To delete your account entirely, contact us and we will remove your personal data within 30 days.`,
      },
    ],
  },
  cookies: {
    title: "Cookie Settings",
    effectiveDate: "August 2026",
    summary: "The small number of cookies this site sets, and why each one exists.",
    sections: [
      {
        heading: "Essential cookies",
        body: `auth_token keeps you signed in and is httpOnly, so scripts cannot read it. apex_hockey_cart stores your basket in your browser so it survives a refresh. Neither is used for tracking.`,
      },
      {
        heading: "Analytics",
        body: `We measure aggregate page performance with privacy-friendly, cookieless analytics. No cross-site profile is built from your visit.`,
      },
      {
        heading: "Managing cookies",
        body: `You can clear or block cookies in your browser settings. Blocking the session cookie means you will be signed out on every visit, and blocking the cart cookie means your basket will not persist.`,
      },
    ],
  },
  waiver: {
    title: "Athletic Waiver",
    effectiveDate: "August 2026",
    summary: "The acknowledgement every athlete signs before taking the ice with us.",
    sections: [
      {
        heading: "Assumption of risk",
        body: `Ice hockey is a contact sport played at speed. I understand that participation carries a risk of injury, and I accept that risk voluntarily.`,
      },
      {
        heading: "Fitness to participate",
        body: `I confirm I am medically fit to skate and play, and I will tell my coach about any injury or condition that could be aggravated by the session.`,
      },
      {
        heading: "Equipment",
        body: `I will arrive in certified protective equipment appropriate to my position, including a helmet with a full cage or visor, and I will wear it for the whole session.`,
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(LEGAL_DOCS).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const doc = LEGAL_DOCS[params.slug];
  if (!doc) return { title: "Not found" };
  return {
    title: `${doc.title} — Apex Hockey Club`,
    description: doc.summary,
    alternates: { canonical: `/legal/${params.slug}` },
  };
}

export default function LegalPage({ params }: { params: { slug: string } }) {
  const doc = LEGAL_DOCS[params.slug];

  // An unknown slug is a 404, not a silent render of the Terms page.
  if (!doc) notFound();

  const siblings = Object.entries(LEGAL_DOCS).filter(([slug]) => slug !== params.slug);

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Navbar />
      <main id="main" className="container mx-auto flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:underline"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Return home
          </Link>

          <article className="mt-6">
            <header className="border-b border-line-200 pb-6">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{doc.title}</h1>
              <p className="mt-2 text-sm text-ink-500">Effective {doc.effectiveDate}</p>
              <p className="mt-3 text-base text-ink-600">{doc.summary}</p>
            </header>

            <div className="mt-8 space-y-8">
              {doc.sections.map((section) => (
                <section key={section.heading}>
                  <h2 className="text-lg font-bold text-ink-900">{section.heading}</h2>
                  <p className="mt-2 leading-relaxed text-ink-600">{section.body}</p>
                </section>
              ))}
            </div>
          </article>

          <nav aria-label="Other policies" className="mt-12 border-t border-line-200 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Other policies
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {siblings.map(([slug, s]) => (
                <li key={slug}>
                  <Link href={`/legal/${slug}`} className="text-sm font-semibold text-brand-600 hover:underline">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
      <Footer />
    </div>
  );
}