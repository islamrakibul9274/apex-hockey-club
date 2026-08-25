"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaArrowLeft, FaShieldHalved } from "react-icons/fa6";

const LEGAL_DOCS: Record<string, { title: string; effectiveDate: string; content: string }> = {
  terms: {
    title: "Terms of Service",
    effectiveDate: "August 2026",
    content: `Welcome to Apex Hockey Club ("Apex Hockey", "we", "our"). By accessing our website, purchasing tournament match tickets, registering for training camps, or acquiring official equipment, you agree to comply with these terms.

### 1. Account Responsibilities
You are responsible for safeguarding your login credentials. Any activity under your account is your responsibility.

### 2. Match Tickets and Camp Registrations
All event tickets purchased through our platform are authentic and guarantee admission to the specified venue and seating tier. Cancellations and transfers must be requested at least 48 hours prior to game start.

### 3. Equipment Store Orders
We warrant all official composite sticks, helmets, and ice skates against manufacturer defects for a period of 60 days from delivery.`,
  },
  privacy: {
    title: "Privacy Policy",
    effectiveDate: "August 2026",
    content: `Apex Hockey respects your privacy and is committed to protecting your personal information.

### 1. Information Collected
We collect your name, contact email, phone number, and billing information strictly to process tickets, camp enrollments, and store equipment dispatch.

### 2. Data Protection
All payment information is processed via 256-bit SSL encryption through Stripe. We do not store full credit card numbers on our servers.

### 3. Third-Party Sharing
We never sell, rent, or trade your personal information to third-party marketers.`,
  },
  cookies: {
    title: "Cookie Policy",
    effectiveDate: "August 2026",
    content: `Our website utilizes essential cookies to maintain your shopping bag items, manage your authenticated member session, and optimize page load speeds.

### Essential Cookies
Required for navigation, equipment bag state, and secure Stripe checkout.

### Disabling Cookies
You can manage cookie settings in your browser at any time, though disabling cookies may affect checkout and session persistence.`,
  },
  waiver: {
    title: "Athletic Participation & Liability Waiver",
    effectiveDate: "August 2026",
    content: `Ice hockey is a physical sport involving speed, body contact, and hard pucks.

By enrolling in Apex Hockey camps, clinic masterclasses, or open ice sessions, participants and guardians acknowledge inherent risks and agree to wear full certified protective equipment (CSA/HECC approved helmet, pads, and skates) at all times on the ice sheet.`,
  },
};

export default function LegalPage() {
  const params = useParams();
  const rawSlug = (params?.slug as string) || "terms";
  const doc = LEGAL_DOCS[rawSlug] || LEGAL_DOCS.terms;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 max-w-3xl space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#FF4240] transition-colors"
        >
          <FaArrowLeft /> Return Home
        </Link>

        <div className="space-y-2 border-b border-gray-200 pb-6">
          <span className="badge bg-gray-100 text-gray-700 font-bold text-xs">Legal & Regulatory</span>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">{doc.title}</h1>
          <p className="text-xs text-gray-400">Effective Date: {doc.effectiveDate}</p>
        </div>

        <div className="prose max-w-none text-gray-700 leading-relaxed space-y-6 whitespace-pre-line text-sm sm:text-base">
          {doc.content}
        </div>
      </main>

      <Footer />
    </div>
  );
}
