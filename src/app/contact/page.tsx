"use client";

import React, { useState, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import {
  FaClock,
  FaPaperPlane,
  FaCheck,
} from "react-icons/fa6";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui";

function ContactContent() {
  const searchParams = useSearchParams();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  // Four call sites link here with ?subject=… (about → careers/press,
  // programmes, every service CTA). The parameter was never read, so the
  // subject was silently discarded and visitors landed on a blank form.
  const [subject, setSubject] = useState(() => searchParams.get("subject") ?? "");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setSubject("");
        setPhone("");
        setMessage("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setErrorMsg(data.error || "Failed to send message.");
      }
    } catch {
      // A dropped connection is not a delivered message.
      setSuccess(false);
      setErrorMsg("We could not reach the server. Your message was not sent — please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
            24/7 Athlete Concierge
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-ink-900 tracking-tight">
            Connect With Apex Hockey Club
          </h1>
          <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
            Have questions regarding junior camp placements, arena ticket reservations, gear fittings, or sponsorship opportunities? Our directors are here to assist.
          </p>
        </div>

        {/* Contact Info & Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Contact Direct Cards */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-accent-lime/60 border border-accent-lime rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/hero-puck-thumb.webp"
                  alt="Phone icon"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <p className="text-xs font-bold text-ink-600 uppercase">Direct Phone</p>
                  <h3 className="text-xl font-extrabold text-ink-900">(+62) 123-321-543</h3>
                </div>
              </div>
              <p className="text-xs text-ink-600">Available Mon - Sat (8:00 AM - 10:00 PM EST)</p>
            </div>

            <div className="bg-accent-sand/60 border border-accent-sand rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/hero-puck-thumb.webp"
                  alt="Email icon"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <p className="text-xs font-bold text-ink-600 uppercase">General Inquiries</p>
                  <h3 className="text-xl font-extrabold text-ink-900">hockeys@support.com</h3>
                </div>
              </div>
              <p className="text-xs text-ink-600">Average response time: &lt; 2 business hours</p>
            </div>

            <div className="bg-accent-sky/60 border border-accent-sky rounded-3xl p-6 space-y-3 shadow-sm">
              <div className="flex items-center gap-3">
                <Image
                  src="/images/hero-puck-thumb.webp"
                  alt="Location icon"
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <p className="text-xs font-bold text-ink-600 uppercase">Arena Headquarters</p>
                  <h3 className="text-xl font-extrabold text-ink-900">152/1 Mohakhali Wireless Gate</h3>
                </div>
              </div>
              <p className="text-xs text-ink-600">Olympic Center Arena 1 & Pro Shop</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-line-200 bg-surface-50 p-6">
              <div className="flex items-center gap-2 text-sm font-bold text-ink-900">
                <FaClock className="text-brand-600" aria-hidden="true" />
                Arena public ice hours
              </div>
              <div className="space-y-1 text-xs text-ink-600">
                <p>• Monday – Friday: 06:00 AM – 11:00 PM</p>
                <p>• Saturday & Sunday: 07:00 AM – Midnight</p>
                <p>• Stick & Puck Drop-in: Daily at 12:00 PM & 04:00 PM</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7 bg-surface-0 border border-line-200 rounded-3xl p-8 shadow-sm">
            {success ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-success-50 text-success-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
                  <FaCheck />
                </div>
                <h3 className="text-3xl font-extrabold text-ink-900">Inquiry Sent Successfully!</h3>
                <p className="text-ink-600 text-sm max-w-md mx-auto">
                  Thank you for contacting us. A training director or team concierge representative will follow up via email shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-2xl font-extrabold text-ink-900">Send an Official Message</h2>
                {errorMsg && (
                  <div className="apex-alert apex-alert-error text-xs text-white rounded-xl">
                    {errorMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="apex-input bg-surface-50 border border-line-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="apex-input bg-surface-50 border border-line-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Subject</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Program inquiry, ticket reservation, etc."
                      className="apex-input bg-surface-50 border border-line-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Phone Number (Optional)</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(+1) 555-0123"
                      className="apex-input bg-surface-50 border border-line-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="apex-field">
                  <label className="label text-xs font-bold text-ink-700">Detailed Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="textarea bg-surface-50 border border-line-200 h-36 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                    placeholder="How can our coaching staff or arena team assist you today?"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="apex-btn apex-btn-block bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl font-bold py-3 text-base shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  {loading ? "Sending..." : <><FaPaperPlane /> Dispatch Message</>}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner className="h-6 w-6" />
          <span className="sr-only">Loading contact form</span>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}
