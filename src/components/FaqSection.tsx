"use client";

import React, { useId, useState } from "react";
import Link from "next/link";
import { FaChevronDown, FaArrowRight } from "react-icons/fa6";

/**
 * Frequently asked questions.
 *
 * Written fresh rather than adapted. The previous block was a two-column split
 * whose right column was an image with a dark overlay card bolted on, and it
 * carried lorem ipsum as its intro copy.
 *
 * The accordion is keyboard-operable and correctly announces its state:
 * each trigger is a real button with aria-expanded and aria-controls, and the
 * panel is a labelled region.
 */

const FAQS = [
  { q: "Which program is right for me?", a: "The academy has three pathways: Junior for ages 6–12, Teen for ages 13–17, and Professional for adults 18+. Each program lists its focus, schedule, duration, and fee. If you’re unsure where to begin, send the club your age and experience level." },
  { q: "What should I bring to my first session?", a: "Bring your hockey equipment, warm athletic layers, and a water bottle. Ask the club about the specific protective equipment and skate requirements for your program before attending. Equipment availability and fitting arrangements should be confirmed in advance." },
  { q: "How do I book a program or match ticket?", a: "Choose a program to register your interest, or visit Tickets to select a fixture, seating tier, and quantity. Sign in so your booking can be attached to your account. Review the booking and any payment details before confirming." },
  { q: "Where can I find my bookings?", a: "Sign in and open the member portal. The bookings tab lists your program and match reservations, along with their payment status. A pending booking means payment has not yet been confirmed." },
  { q: "Can I ask about a team booking or a change of plans?", a: "Yes. Use the contact form and include your group size, age range, and preferred dates. For changes to an existing booking, include its reference. Contact the club to confirm availability and the applicable cancellation terms before making plans." },
];

function FaqItem({
  question,
  answer,
  isOpen,
  onToggle,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const id = useId();
  const panelId = `${id}-panel`;
  const buttonId = `${id}-button`;

  return (
    <div
      className={[
        "overflow-hidden rounded-2xl border transition-colors",
        isOpen
          ? "border-brand-200 bg-surface-0 shadow-sm"
          : "border-line-200 bg-surface-0 hover:border-line-300",
      ].join(" ")}
    >
      <h3>
        <button
          type="button"
          id={buttonId}
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={panelId}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
        >
          <span className="text-[15px] font-semibold leading-snug text-ink-900">
            {question}
          </span>
          <span
            aria-hidden="true"
            className={[
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-all",
              isOpen
                ? "rotate-180 bg-brand-500 text-white"
                : "bg-surface-100 text-ink-600",
            ].join(" ")}
          >
            <FaChevronDown className="text-xs" />
          </span>
        </button>
      </h3>

      <div
        id={panelId}
        role="region"
        aria-labelledby={buttonId}
        hidden={!isOpen}
        className="px-5 pb-5"
      >
        <p className="leading-relaxed text-ink-600">{answer}</p>
      </div>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section aria-labelledby="faq-heading" className="apex-container apex-section">
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Intro column */}
        <div className="lg:col-span-5">
          <span className="apex-badge apex-badge-brand uppercase tracking-widest">
            Before you book
          </span>
          <h2 id="faq-heading" className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            BEFORE YOU
            HIT THE ICE.
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            Sizing, schedules, kit and memberships — the practical things people want to know
            before a first session.
          </p>

          <div className="mt-8 rounded-2xl border border-line-200 bg-surface-50 p-6">
            <h3 className="text-base font-bold text-ink-900">Still not sure?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              Tell us about your experience and what you’d like to work on.
            </p>
            <Link href="/contact" className="apex-btn apex-btn-primary apex-btn-sm mt-4">
              Ask a question
              <FaArrowRight className="text-xs" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Accordion column */}
        <div className="lg:col-span-7">
          <ul className="space-y-3">
            {FAQS.map((faq, index) => (
              <li key={faq.q}>
                <FaqItem
                  question={faq.q}
                  answer={faq.a}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}