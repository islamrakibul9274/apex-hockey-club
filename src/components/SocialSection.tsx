"use client";

import React from "react";
import Link from "next/link";
import { FaArrowRight, FaCalendarDays, FaNewspaper, FaEnvelope, FaTicket } from "react-icons/fa6";

/**
 * Community section.
 *
 * The previous version linked to bare social homepages (twitter.com,
 * facebook.com, github.com) while displaying follower counts and club-size
 * figures that were invented, so every link was a dead end and every number
 * was false. A github.com link on a hockey club's site was also nonsense.
 *
 * These are real internal destinations with real content behind them.
 */
const COMMUNITY_LINKS = [
  {
    href: "/programs",
    icon: FaCalendarDays,
    title: "Training schedule",
    body: "Season dates, age groups and ice times for every programme we run.",
  },
  {
    href: "/get-ticket",
    icon: FaTicket,
    title: "Match passes",
    body: "Reserve seats for winter cup fixtures and championship derbies.",
  },
  {
    href: "/blog",
    icon: FaNewspaper,
    title: "Coaching guides",
    body: "Drills, equipment maintenance and nutrition written by our coaches.",
  },
  {
    href: "/contact",
    icon: FaEnvelope,
    title: "Talk to the club",
    body: "Ask about private sessions, team bookings or facility hire.",
  },
];

export default function SocialSection() {
  return (
    <section aria-labelledby="community-heading" className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-2xl">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-brand-600">
          Join the club
        </span>
        <h2 id="community-heading" className="mt-2 text-2xl font-extrabold sm:text-3xl">
          Training, fixtures and coaching from Apex Hockey
        </h2>
        <p className="mt-3 text-base text-ink-600">
          Everything the club publishes lives here — programme dates, ticket releases and the
          coaching guides our staff write each season.
        </p>
      </div>

      <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {COMMUNITY_LINKS.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-line-200 bg-surface-0 p-6 transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md"
              >
                <span
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
                  aria-hidden="true"
                >
                  <Icon />
                </span>
                <h3 className="font-bold text-ink-900">{link.title}</h3>
                <p className="flex-1 text-sm text-ink-600">{link.body}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                  Open
                  <FaArrowRight
                    aria-hidden="true"
                    className="text-xs transition-transform group-hover:translate-x-0.5"
                  />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}