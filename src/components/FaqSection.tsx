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
  {
    q: "What gear do I need for beginner and junior camps?",
    a: "All beginner skaters receive a full protective starter kit: a certified CSA/HECC helmet with a face cage, shoulder and elbow pads, hockey gloves, shin guards and skates. Bring warm athletic layers, a water bottle and a change of socks. If you already have your own equipment, our coaches will check it before your first session.",
  },
  {
    q: "How does private coaching and one-on-one ice time work?",
    a: "You book a 45-minute block on a rink reserved for you. We match you with a coach working on your specific goal — shooting mechanics, skating stride, defensive reads — and we send a short video breakdown afterwards so you can practise between sessions.",
  },
  {
    q: "Can I book match tickets and reserve seating online?",
    a: "Yes. Every fixture we host is bookable from the tickets page. Pick a match, choose a seating tier, and your passes are issued to your account as soon as payment clears. Seats are held for you for ten minutes while you check out.",
  },
  {
    q: "What is your refund and rescheduling policy?",
    a: "Cancel more than 48 hours before a session and you receive a full credit. Inside 48 hours we cannot refund, because the ice time and coach are already committed to you. Rescheduling is free at any point, subject to availability.",
  },
  {
    q: "Do you offer skate sharpening and composite repair?",
    a: "We do. Our pro shop sharpens edges to your preferred hollow, from a shallow 1/2 inch for beginners up to a deep 4 inch for maximum glide. We also repair broken composite shafts and replace blade holders, usually same-day.",
  },
  {
    q: "Are memberships available for teams and clubs?",
    a: "Yes. We offer group rates for teams of eight or more, with a dedicated booking window and a named coach. Send us a message with the age group and how often you train, and we will put a quote together.",
  },
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
            Questions athletes ask us
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            Sizing, schedules, kit and memberships — the practical things people want to know
            before a first session.
          </p>

          <div className="mt-8 rounded-2xl border border-line-200 bg-surface-50 p-6">
            <h3 className="text-base font-bold text-ink-900">Still not sure?</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600">
              Our coaching desk answers sizing and programme questions, usually the same day.
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