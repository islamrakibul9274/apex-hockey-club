import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RegisterButton from "@/components/RegisterButton";
import { INITIAL_PROGRAMS, type ProgramData } from "@/lib/mockData";
import { connectToDatabase } from "@/lib/mongodb";
import Program from "@/models/Program";
import { withIdAll } from "@/lib/serialise";
import { SIZES, freshImage } from "@/lib/images";

/**
 * Rendered on the server.
 *
 * Previously `"use client": the list was fetched in an effect, the age-group
 * filter was component state, and the whole registration modal lived in the
 * page. The filter is now a URL parameter, so it works without JavaScript and
 * can be linked to, and the modal lives in RegisterButton.
 */

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Academy Programs",
  description:
    "Junior, teen and professional ice hockey development programmes built around real ice time.",
  alternates: { canonical: "/programs" },
};

/** Every category present in the data, so no programme is unreachable. */
const FILTER_TABS: string[] = ["All"];
for (const p of INITIAL_PROGRAMS) {
  if (FILTER_TABS.indexOf(p.category) === -1) FILTER_TABS.push(p.category);
}

async function getPrograms(): Promise<ProgramData[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const programs = await Program.find()
        .sort({ createdAt: 1 })
        .lean()
        .catch(() => null);
      if (programs && programs.length > 0)
        return withIdAll(programs) as unknown as ProgramData[];
    }
  } catch {
    // Fall through to the catalogue.
  }
  return INITIAL_PROGRAMS;
}

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const programs = await getPrograms();
  const active = (await searchParams)?.group ?? "All";
  const filtered =
    active === "All"
      ? programs
      : programs.filter(
          (p) => p.category.toLowerCase() === active.toLowerCase(),
        );

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Navbar />

      <main id="main" className="apex-container flex-1 space-y-12 py-12">
        <header className="apex-page-intro">
          <span className="apex-badge apex-badge-brand uppercase tracking-widest">
            Academy pathways
          </span>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
            Development programmes &amp; masterclasses
          </h1>
          <p className="mt-4 leading-relaxed text-ink-600">
            Explore training for juniors, teens, and adults. Compare schedules,
            see what each program covers, and find your next step on the ice.
          </p>

          {/* Filter as links, so it works without JavaScript and is shareable. */}
          <nav
            aria-label="Filter by age group"
            className="mt-8 flex flex-wrap justify-center gap-2"
          >
            {FILTER_TABS.map((tab) => {
              const isActive = tab === active;
              return (
                <Link
                  key={tab}
                  href={
                    tab === "All"
                      ? "/programs"
                      : `/programs?group=${encodeURIComponent(tab)}`
                  }
                  aria-current={isActive ? "true" : undefined}
                  className={[
                    "apex-btn apex-btn-sm",
                    isActive ? "apex-btn-primary" : "apex-btn-secondary",
                  ].join(" ")}
                >
                  {tab} programmes
                </Link>
              );
            })}
          </nav>
        </header>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="text-xl font-bold text-ink-900">
              No programmes in this age group
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink-600">
              We are not running a {active.toLowerCase()} programme this season.
              Try another age group, or talk to us about private coaching.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link href="/programs" className="apex-btn apex-btn-primary">
                View all programmes
              </Link>
              <Link
                href="/contact?subject=Private%20Coaching%20Enquiry"
                className="apex-btn apex-btn-secondary"
              >
                Ask about private sessions
              </Link>
            </div>
          </div>
        ) : (
          <ul className="space-y-6">
            {filtered.map((program) => (
              <li
                key={program.id}
                id={program.id}
                className="apex-card grid scroll-mt-28 gap-6 overflow-hidden lg:grid-cols-5"
              >
                <div
                  id={
                    program.id.startsWith("prog-")
                      ? undefined
                      : INITIAL_PROGRAMS.find(
                          (p) => p.category === program.category,
                        )?.id
                  }
                  className="relative scroll-mt-28 aspect-[4/3] lg:col-span-2 lg:aspect-auto lg:h-full lg:min-h-[260px] bg-surface-100"
                >
                  <Image
                    src={freshImage(program.image)}
                    alt={`${program.title} training session`}
                    fill
                    sizes={SIZES.banner}
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-col gap-3 p-6 lg:col-span-3 lg:justify-center">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="apex-badge apex-badge-sm">
                      {program.category}
                    </span>
                    <span className="apex-badge apex-badge-sm">
                      {program.ageGroup}
                    </span>
                  </div>

                  <h2 className="text-xl font-extrabold text-ink-900 sm:text-2xl">
                    {program.title}
                  </h2>

                  <p className="leading-relaxed text-ink-600">
                    {program.description}
                  </p>

                  <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                    <div>
                      <dt className="text-ink-500">Duration</dt>
                      <dd className="font-semibold text-ink-900">
                        {program.duration}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Schedule</dt>
                      <dd className="font-semibold text-ink-900">
                        {program.schedule}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Pathway</dt>
                      <dd className="font-semibold text-ink-900">
                        {program.coach}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-ink-500">Places left</dt>
                      <dd className="font-semibold text-ink-900">
                        {program.spotsLeft}
                      </dd>
                    </div>
                  </dl>

                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {program.features.slice(0, 4).map((feature) => (
                      <li key={feature} className="text-sm text-ink-600">
                        · {feature}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-2 flex flex-wrap items-center gap-4">
                    <span className="text-2xl font-extrabold text-ink-900">
                      {formatMoney(program.price)}
                    </span>
                    <RegisterButton
                      program={{
                        id: program.id,
                        title: program.title,
                        ageGroup: program.ageGroup,
                        price: program.price,
                        duration: program.duration,
                      }}
                    />
                    <Link
                      href={`/contact?subject=${encodeURIComponent(`Question about ${program.title}`)}`}
                      className="text-sm font-semibold text-brand-600 hover:underline"
                    >
                      Ask a question
                    </Link>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}
