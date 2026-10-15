import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaCheck, FaArrowLeft } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { SERVICES, SERVICE_SLUGS } from "@/lib/services";

/**
 * Rendered on the server.
 *
 * Previously `"use client"`, which shipped the whole service catalogue to the
 * browser and painted an empty shell until hydration. Now prerendered.
 *
 * Two entries were removed: `mobile-app` and `desktop-app` advertised an App
 * Store download and a desktop suite that do not exist. Marketing fictional
 * software as a real product is worse than not listing it.
 */

export function generateStaticParams() {
  return SERVICE_SLUGS.map((service) => ({ service }));
}

export function generateMetadata({ params }: { params: { service: string } }): Metadata {
  const service = SERVICES[params.service];
  if (!service) return { title: "Not found" };
  return {
    title: `${service.title} — Apex Hockey Club`,
    description: service.subtitle,
    alternates: { canonical: `/services/${params.service}` },
  };
}

export default function ServiceDetailPage({ params }: { params: { service: string } }) {
  const service = SERVICES[params.service];
  // Unknown slug is a 404 rather than a silent render of branding.
  if (!service) notFound();

  const others = SERVICE_SLUGS.filter((slug) => slug !== params.service);

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Navbar />

      <main id="main" className="container mx-auto flex-1 space-y-10 px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-4xl">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 transition-colors hover:text-brand-600"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Back to club contact
          </Link>

          <div className="mt-6 space-y-4">
            <span className="inline-block rounded-full bg-brand-100 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-brand-600">
              Club service
            </span>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl lg:text-5xl">
              {service.title}
            </h1>
            <p className="text-base leading-relaxed text-ink-600 sm:text-lg">{service.subtitle}</p>
          </div>

          <div className="mt-8 space-y-6 rounded-2xl border border-line-200 bg-surface-50 p-6 sm:p-10">
            <p className="text-base leading-relaxed text-ink-600">{service.description}</p>

            <div className="space-y-3 border-t border-line-200 pt-6">
              <h2 className="text-lg font-bold text-ink-900">What is included</h2>
              <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {service.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2.5 text-sm text-ink-700">
                    <FaCheck className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line-200 pt-6">
              <div>
                <p className="text-xs font-bold uppercase text-ink-500">Ready to get started?</p>
                <p className="text-sm font-bold text-ink-900">Speak with an Apex director</p>
              </div>
              <Link
                href={`/contact?subject=${encodeURIComponent(service.title)}`}
                className="apex-btn apex-btn-primary"
              >
                {service.ctaText}
              </Link>
            </div>
          </div>

          <nav aria-label="Other club services" className="mt-12 border-t border-line-200 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Other club services
            </h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {others.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/services/${slug}`}
                    className="text-sm font-semibold text-brand-600 hover:underline"
                  >
                    {SERVICES[slug].title}
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