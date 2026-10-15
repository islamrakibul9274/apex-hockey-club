"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaShieldHalved,
  FaPaperPlane,
  FaEnvelope,
  FaLocationDot,
  FaTicket,
  FaCalendarDays,
  FaNewspaper,
} from "react-icons/fa6";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const subscribedTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (subscribedTimer.current) clearTimeout(subscribedTimer.current);
    },
    []
  );
  const [subscribed, setSubscribed] = useState(false);
  const [newsletterError, setNewsletterError] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;

    setSubscribing(true);
    setNewsletterError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: newsletterEmail,
          subject: "Newsletter Subscription",
          message: "Requested weekly league and gear updates.",
        }),
      });

      const data = await res.json().catch(() => ({}));

      // res.ok was previously ignored, so a 429 or a 500 still produced the
      // "you're subscribed" confirmation.
      if (!res.ok) {
        setSubscribed(false);
        setNewsletterError(data?.error ?? "We could not subscribe you just now. Please try again.");
        return;
      }

      setSubscribed(true);
      setNewsletterEmail("");
      const t = setTimeout(() => setSubscribed(false), 5000);
      subscribedTimer.current = t;
    } catch {
      // A network failure is not a subscription.
      setSubscribed(false);
      setNewsletterError("We could not reach the server. Please try again.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="mt-20 border-t border-line-200 bg-surface-50 text-ink-600">
      {/* Top Banner & Newsletter */}
      <div className="apex-container pt-14 pb-10 border-b border-line-200">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white">
                <FaShieldHalved className="text-lg" aria-hidden="true" />
              </div>
              <span className="text-xl font-extrabold text-ink-900">
                Apex<span className="text-brand-600">Hockey</span>
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-ink-600">
              The international home of competitive ice hockey, Olympic-grade training camps, pro tournament match passes, and premier composite equipment.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="space-y-3 rounded-2xl border border-line-200 bg-surface-0 p-6">
              <h4 className="text-base font-bold text-ink-900">Subscribe to league &amp; gear updates</h4>
              <p className="text-xs text-ink-600">Get match ticket drops, training camp dates and member gear offers.</p>
              {subscribed ? (
                <div
                  role="status"
                  className="rounded-xl bg-success-50 p-3 text-xs font-semibold text-success-700"
                >
                  You&apos;re subscribed. Watch your inbox for ticket drops and gear sales.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="newsletter-email"
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    disabled={subscribing}
                    className="apex-input apex-input-sm flex-1"
                    required
                  />
                  <button
                    type="submit"
                    disabled={subscribing}
                    className="apex-btn apex-btn-primary apex-btn-sm"
                  >
                    <FaPaperPlane className="text-xs" aria-hidden="true" />
                    {subscribing ? "Sending…" : "Join"}
                  </button>
                </form>
              )}

              {newsletterError && (
                <div role="alert" className="p-3 bg-brand-500/20 text-red-300 rounded-xl text-xs">
                  {newsletterError}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Links */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 text-sm">
          {/* Services */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-900">Services</h5>
            <ul className="space-y-2 text-xs text-ink-600">
              <li><Link href="/services/branding" className="transition-colors hover:text-brand-600">Club Branding</Link></li>
              <li><Link href="/services/design" className="transition-colors hover:text-brand-600">Jersey Design</Link></li>
              <li><Link href="/services/marketing" className="transition-colors hover:text-brand-600">Tournament Marketing</Link></li>
              <li><Link href="/services/advertisement" className="transition-colors hover:text-brand-600">Arena Advertising</Link></li>
              <li><Link href="/services/coaching" className="transition-colors hover:text-brand-600">Coach Masterclasses</Link></li>
              <li><Link href="/services/training" className="transition-colors hover:text-brand-600">Facility Rentals</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-900">Company</h5>
            <ul className="space-y-2 text-xs text-ink-600">
              <li><Link href="/about" className="transition-colors hover:text-brand-600">About Us</Link></li>
              <li><Link href="/contact" className="transition-colors hover:text-brand-600">Contact Support</Link></li>
              <li><Link href="/about#careers" className="transition-colors hover:text-brand-600">Careers & Scouting</Link></li>
              <li><Link href="/about#press" className="transition-colors hover:text-brand-600">Press & Media Kit</Link></li>
              <li><Link href="/about#coaches" className="transition-colors hover:text-brand-600">Coaching Roster</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-900">Legal</h5>
            <ul className="space-y-2 text-xs text-ink-600">
              <li><Link href="/legal/terms" className="transition-colors hover:text-brand-600">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="transition-colors hover:text-brand-600">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies" className="transition-colors hover:text-brand-600">Cookie Settings</Link></li>
              <li><Link href="/legal/waiver" className="transition-colors hover:text-brand-600">Athletic Waiver</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-900">Community</h5>
            <ul className="space-y-2 text-xs text-ink-600">
              {/* These previously linked to bare twitter.com / facebook.com /
                  instagram.com / github.com homepages while showing follower
                  counts we could not substantiate. Every link was a dead end. */}
              <li>
                <Link href="/programs" className="flex items-center gap-2 transition-colors hover:text-brand-600">
                  <FaCalendarDays className="text-ink-500" aria-hidden="true" /> Training schedule
                </Link>
              </li>
              <li>
                <Link href="/get-ticket" className="flex items-center gap-2 transition-colors hover:text-brand-600">
                  <FaTicket className="text-ink-500" aria-hidden="true" /> Match passes
                </Link>
              </li>
              <li>
                <Link href="/blog" className="flex items-center gap-2 transition-colors hover:text-brand-600">
                  <FaNewspaper className="text-ink-500" aria-hidden="true" /> Coaching guides
                </Link>
              </li>
              <li>
                <Link href="/contact" className="flex items-center gap-2 transition-colors hover:text-brand-600">
                  <FaEnvelope className="text-ink-500" aria-hidden="true" /> Contact the club
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-900">Explore</h5>
            <ul className="space-y-2 text-xs text-ink-600">
              <li><Link href="/programs" className="transition-colors hover:text-brand-600">Academy Programs</Link></li>
              <li><Link href="/products" className="transition-colors hover:text-brand-600">Equipment Store</Link></li>
              <li><Link href="/pricing" className="transition-colors hover:text-brand-600">Membership Pricing</Link></li>
              <li><Link href="/get-ticket" className="transition-colors hover:text-brand-600">Match Tickets</Link></li>
              <li><Link href="/blog" className="transition-colors hover:text-brand-600">Training Blog</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-ink-900">Club Direct</h5>
            <ul className="space-y-2 text-xs text-ink-600">
              <li className="flex items-start gap-2">
                <FaEnvelope className="mt-0.5 text-brand-600" aria-hidden="true" />
                <a
                  href="mailto:islamrakibul9274@gmail.com"
                  className="hover:text-brand-600 break-all transition-colors"
                >
                  islamrakibul9274@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <FaLocationDot className="mt-0.5 text-brand-600" aria-hidden="true" />
                <span>
                  Booking desk — appointments by email, match-day box office opens 90 minutes
                  before each fixture.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Bottom Bar */}
      <div className="border-t border-line-200 bg-surface-0 py-6 text-center text-xs text-ink-500">
        <div className="apex-container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p>© {new Date().getFullYear()} Hockey&apos;s Club International. All rights reserved.</p>
          <nav aria-label="Legal" className="flex gap-6">
            <Link href="/legal/privacy" className="transition-colors hover:text-brand-600">Privacy</Link>
            <Link href="/legal/terms" className="transition-colors hover:text-brand-600">Terms</Link>
            <Link href="/legal/cookies" className="transition-colors hover:text-brand-600">Cookies</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
