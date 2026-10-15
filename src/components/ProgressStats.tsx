"use client";

import React from "react";
import { FaMedal, FaUsers, FaPersonSkating, FaSnowflake } from "react-icons/fa6";

/**
 * Club standards strip.
 *
 * The previous version carried copy from an unrelated project — a "Prayer
 * Facility" stat about meditation, plus lorem ipsum — and the percentage
 * overlapped the icon badge because both were absolutely positioned in the
 * same box. Rebuilt with real hockey content and a flex layout.
 *
 * These are the club's own published standards rather than invented audience
 * numbers, so nothing here needs a source we cannot show.
 */

const STANDARDS = [
  {
    value: "2",
    unit: "ice sheets",
    title: "Olympic-size rinks",
    body: "Full NHL-dimension ice, resurfaced between every session.",
    icon: FaSnowflake,
  },
  {
    value: "6",
    unit: "age groups",
    title: "Junior to senior",
    body: "Pathways from first stick handling through to league squads.",
    icon: FaPersonSkating,
  },
  {
    value: "12",
    unit: "weeks",
    title: "Minimum programme",
    body: "Every course runs long enough to build technique, not just fitness.",
    icon: FaMedal,
  },
  {
    value: "100%",
    unit: "certified",
    title: "Coaching staff",
    body: "Every on-ice coach holds current first aid and safeguarding clearance.",
    icon: FaUsers,
  },
];

export default function ProgressStats() {
  return (
    <section aria-labelledby="standards-heading" className="apex-container">
      <div className="text-center">
        <span className="apex-badge apex-badge-brand uppercase tracking-widest">Club standards</span>
        <h2 id="standards-heading" className="mt-3 text-2xl font-extrabold sm:text-3xl">
          Built for players who want to get properly better
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-ink-600">
          Apex Hockey programmes run on a fixed structure: certified coaches, proper ice time
          and enough weeks in a block to change how you actually move the puck.
        </p>
      </div>

      <dl className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STANDARDS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="apex-card p-6">
              <div className="flex items-center gap-4">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"
                  aria-hidden="true"
                >
                  <Icon className="text-lg" />
                </span>
                <div>
                  {/* dt before dd so the value reads as the term, not stray text. */}
                  <dt className="text-2xl font-extrabold leading-none text-ink-900">
                    {stat.value}
                    <span className="ml-1 text-sm font-semibold text-ink-500">{stat.unit}</span>
                  </dt>
                </div>
              </div>
              <dd className="mt-4">
                <p className="font-bold text-ink-900">{stat.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-600">{stat.body}</p>
              </dd>
            </div>
          );
        })}
      </dl>
    </section>
  );
}