"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FaShieldHalved,
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaGithub,
  FaPaperPlane,
  FaPhone,
  FaEnvelope,
  FaLocationDot,
} from "react-icons/fa6";

export default function Footer() {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Newsletter Subscriber",
          email: newsletterEmail,
          subject: "Newsletter Subscription",
          message: "User subscribed to Apex Hockey weekly news & gear drops.",
        }),
      });
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    } catch {
      setSubscribed(true);
    }
  };

  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Top Banner & Newsletter */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12 border-b border-slate-800">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#FF4240] flex items-center justify-center text-white shadow-lg">
                <FaShieldHalved className="text-lg" />
              </div>
              <span className="font-extrabold text-2xl text-white">
                Hockey<span className="text-[#FF4240]">&apos;</span>s
              </span>
            </div>
            <p className="text-slate-400 text-sm max-w-md leading-relaxed">
              The international home of competitive ice hockey, Olympic-grade training camps, pro tournament match passes, and premier composite equipment.
            </p>
          </div>

          <div className="lg:col-span-6">
            <div className="bg-slate-800/80 p-6 rounded-3xl border border-slate-700 space-y-3">
              <h4 className="font-bold text-white text-base">Subscribe to League & Gear Updates</h4>
              <p className="text-xs text-slate-400">Receive priority match ticket drops, training camp dates, and 15% off official gear.</p>
              {subscribed ? (
                <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-xl text-xs font-semibold">
                  ✓ You&apos;re subscribed! Welcome to the Apex Hockey roster.
                </div>
              ) : (
                <form onSubmit={handleNewsletter} className="flex gap-2">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="input input-sm flex-1 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs focus:ring-2 focus:ring-[#FF4240]"
                    required
                  />
                  <button
                    type="submit"
                    className="btn btn-sm bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-xl px-4 font-bold"
                  >
                    <FaPaperPlane className="text-xs mr-1" /> Join
                  </button>
                </form>
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
            <h5 className="font-extrabold text-white text-xs tracking-wider uppercase">Services</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/services/branding" className="hover:text-[#FF4240] transition-colors">Club Branding</Link></li>
              <li><Link href="/services/design" className="hover:text-[#FF4240] transition-colors">Jersey Design</Link></li>
              <li><Link href="/services/marketing" className="hover:text-[#FF4240] transition-colors">Tournament Marketing</Link></li>
              <li><Link href="/services/advertisement" className="hover:text-[#FF4240] transition-colors">Arena Advertising</Link></li>
              <li><Link href="/services/coaching" className="hover:text-[#FF4240] transition-colors">Coach Masterclasses</Link></li>
              <li><Link href="/services/training" className="hover:text-[#FF4240] transition-colors">Facility Rentals</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs tracking-wider uppercase">Company</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/about" className="hover:text-[#FF4240] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#FF4240] transition-colors">Contact Support</Link></li>
              <li><Link href="/about#careers" className="hover:text-[#FF4240] transition-colors">Careers & Scouting</Link></li>
              <li><Link href="/about#press" className="hover:text-[#FF4240] transition-colors">Press & Media Kit</Link></li>
              <li><Link href="/about#coaches" className="hover:text-[#FF4240] transition-colors">Coaching Roster</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs tracking-wider uppercase">Legal</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/legal/terms" className="hover:text-[#FF4240] transition-colors">Terms of Service</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-[#FF4240] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-[#FF4240] transition-colors">Cookie Settings</Link></li>
              <li><Link href="/legal/waiver" className="hover:text-[#FF4240] transition-colors">Athletic Waiver</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs tracking-wider uppercase">Social</h5>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4240] flex items-center gap-2">
                  <FaTwitter className="text-slate-400" /> Twitter / X
                </a>
              </li>
              <li>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4240] flex items-center gap-2">
                  <FaInstagram className="text-slate-400" /> Instagram
                </a>
              </li>
              <li>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4240] flex items-center gap-2">
                  <FaFacebookF className="text-slate-400" /> Facebook
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-[#FF4240] flex items-center gap-2">
                  <FaGithub className="text-slate-400" /> GitHub
                </a>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs tracking-wider uppercase">Explore</h5>
            <ul className="space-y-2 text-xs">
              <li><Link href="/programs" className="hover:text-[#FF4240] transition-colors">Academy Programs</Link></li>
              <li><Link href="/products" className="hover:text-[#FF4240] transition-colors">Equipment Store</Link></li>
              <li><Link href="/pricing" className="hover:text-[#FF4240] transition-colors">Membership Pricing</Link></li>
              <li><Link href="/get-ticket" className="hover:text-[#FF4240] transition-colors">Match Tickets</Link></li>
              <li><Link href="/blog" className="hover:text-[#FF4240] transition-colors">Training Blog</Link></li>
            </ul>
          </div>

          {/* Apps & Contact */}
          <div className="space-y-3">
            <h5 className="font-extrabold text-white text-xs tracking-wider uppercase">Club Direct</h5>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <FaPhone className="text-[#FF4240]" /> (+62) 123-321-543
              </li>
              <li className="flex items-center gap-2">
                <FaEnvelope className="text-[#FF4240]" /> hockeys@support.com
              </li>
              <li className="flex items-start gap-2">
                <FaLocationDot className="text-[#FF4240] mt-0.5" /> 152/1 Mohakhali Wireless Gate, Arena 1
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright & Bottom Bar */}
      <div className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Hockey&apos;s Club International. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/legal/privacy" className="hover:text-slate-300">Privacy</Link>
            <Link href="/legal/terms" className="hover:text-slate-300">Terms</Link>
            <Link href="/legal/cookies" className="hover:text-slate-300">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
