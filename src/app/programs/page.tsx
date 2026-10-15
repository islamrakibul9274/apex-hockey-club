"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_PROGRAMS, ProgramData } from "@/lib/mockData";
import { FaCalendarDays, FaCheck, FaUserCheck, FaXmark, FaClock, FaLocationDot } from "react-icons/fa6";

// "Private" was a valid category in the data but had no tab, making
// those programmes unreachable through filtering.
const FILTER_TABS = ["All", "Junior", "Teen", "Professional", "Private"];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramData[]>(INITIAL_PROGRAMS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(null);

  const [athleteName, setAthleteName] = useState("");
  const [athleteEmail, setAthleteEmail] = useState("");
  const [athleteAge, setAthleteAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const successTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    },
    []
  );

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/programs");
        const data = await res.json();
        if (data.programs) setPrograms(data.programs);
      } catch {
        // fallback
      }
    }
    load();
  }, []);

  const filtered =
    activeFilter === "All"
      ? programs
      : programs.filter((p) => p.category.toLowerCase() === activeFilter.toLowerCase());

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setSubmitting(true);

    try {
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: athleteName,
          customerEmail: athleteEmail,
          bookingType: "program",
          itemId: selectedProgram.id,
          itemTitle: `${selectedProgram.title} (${athleteAge ? `Age ${athleteAge}` : selectedProgram.ageGroup})`,
          seatsCount: 1,
        }),
      });
      if (!bookingRes.ok) {
        const errData = await bookingRes.json().catch(() => ({}));
        setErrorMsg(
          errData?.error ?? "We could not complete your registration. Please try again."
        );
        return;
      }

      setSuccess(true);
      setErrorMsg("");
      const t = setTimeout(() => {
        setSuccess(false);
        setSelectedProgram(null);
        setAthleteName("");
        setAthleteEmail("");
      }, 3000);
      successTimer.current = t;
    } catch {
      // A dropped connection is not a completed registration.
      setSuccess(false);
      setErrorMsg("We could not reach the server. Your registration was not submitted.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
            Academy Pathways
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-ink-900 tracking-tight">
            Hockey Development Programs & Masterclasses
          </h1>
          <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
            Curated age-appropriate training programs designed by Olympic athletes and certified coaches to fast-track on-ice agility, shooting velocity, and team IQ.
          </p>

          {/* Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 pt-4">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-extrabold transition-all ${
                  activeFilter === tab
                    ? "bg-brand-500 text-white shadow-lg shadow-brand-500/20 scale-105"
                    : "bg-surface-100 text-ink-700 hover:bg-gray-200"
                }`}
              >
                {tab} Programs
              </button>
            ))}
          </div>
        </div>

        {/* Programs Catalog */}
        <div className="space-y-8">
          {/* Selecting a tab with no matches previously rendered a blank area
              with no explanation and no way back. */}
          {filtered.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <h3 className="text-xl font-bold text-ink-800">
                No programmes in this age group
              </h3>
              <p className="text-ink-600 text-sm max-w-md mx-auto">
                We are not running a {activeFilter.toLowerCase()} programme this season. Try another
                age group or talk to us about a private session.
              </p>
              <div className="flex flex-wrap gap-3 justify-center">
                <button
                  onClick={() => setActiveFilter("All")}
                  className="apex-btn apex-btn-primary"
                >
                  View all programmes
                </button>
                <Link
                  href="/contact?subject=Private%20Coaching%20Enquiry"
                  className="apex-btn apex-btn-secondary"
                >
                  Ask about private sessions
                </Link>
              </div>
            </div>
          ) : (
          filtered.map((prog) => (
            <div
              key={prog.id}
              id={prog.id}
              className="bg-surface-0 border border-line-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8"
            >
              {/* Visual Preview */}
              <div className="lg:col-span-5 relative min-h-[260px] rounded-2xl overflow-hidden bg-surface-100">
                <Image src={prog.image} alt={prog.title} fill className="object-cover" />
                <div className="absolute top-4 left-4">
                  <span className="apex-badge bg-brand-500 text-white border-none font-bold text-xs py-3 px-3">
                    {prog.category} Level
                  </span>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/75 backdrop-blur-md p-3 rounded-xl text-white text-xs flex justify-between items-center">
                  <span>Age: {prog.ageGroup}</span>
                  <span className="text-amber-400 font-bold">{prog.spotsLeft} Spots Available</span>
                </div>
              </div>

              {/* Details */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-900">
                      {prog.title}
                    </h2>
                    <div className="text-3xl font-black text-brand-600">
                      ${prog.price}
                      <span className="text-xs font-semibold text-ink-500"> / term</span>
                    </div>
                  </div>

                  <p className="text-ink-600 text-sm leading-relaxed">{prog.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink-600 pt-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarDays className="text-brand-600" />
                      <span>{prog.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-brand-600" />
                      <span>Duration: {prog.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUserCheck className="text-brand-600" />
                      <span>Lead Coach: {prog.coach}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaLocationDot className="text-brand-600" />
                      <span>Olympic Arena Rink 1</span>
                    </div>
                  </div>

                  {prog.features && (
                    <div className="bg-surface-50 p-4 rounded-2xl space-y-1.5 pt-3">
                      <p className="text-xs font-bold text-ink-800 uppercase tracking-wider">Curriculum Highlights:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {prog.features.map((f, i) => (
                          <div key={i} className="text-xs text-ink-700 flex items-center gap-2">
                            <FaCheck className="text-emerald-500 flex-shrink-0" />
                            <span>{f}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-4 pt-2">
                  <button
                    onClick={() => setSelectedProgram(prog)}
                    className="apex-btn bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl px-8 font-bold shadow-md shadow-brand-500/20"
                  >
                    Enroll in Program
                  </button>
                  <Link
                    href={`/contact?subject=Question%20about%20${encodeURIComponent(prog.title)}`}
                    className="apex-btn apex-btn-secondary border-line-300 text-ink-800 hover:bg-surface-100 rounded-2xl px-6 font-bold"
                  >
                    Ask Coach a Question
                  </Link>
                </div>
              </div>
            </div>
          ))
          )}
        </div>

        {/* Modal */}
        {selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-surface-0 w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95">
              <button
                onClick={() => setSelectedProgram(null)}
                className="apex-btn apex-btn-icon apex-btn-ghost apex-btn-sm absolute top-4 right-4 text-ink-500"
              >
                <FaXmark className="text-lg" />
              </button>

              {errorMsg && (
                <div role="alert" className="apex-alert apex-alert-error">
                  {errorMsg}
                </div>
              )}

              {success ? (
                <div role="status" className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-success-50 text-success-700 flex items-center justify-center text-2xl mx-auto">
                    <FaCheck />
                  </div>
                  <h3 className="text-2xl font-extrabold text-ink-900">Registration Complete!</h3>
                  <p className="text-ink-600 text-sm">
                    Athlete enrolled in {selectedProgram.title}. We look forward to seeing you on the ice.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-1">
                    <span className="apex-badge bg-brand-100 text-brand-600 font-bold text-xs">
                      {selectedProgram.category} Enrollment
                    </span>
                    <h3 className="text-2xl font-extrabold text-ink-900">{selectedProgram.title}</h3>
                    <p className="text-xs text-ink-600">Term Tuition: ${selectedProgram.price}</p>
                  </div>

                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Athlete Full Name</label>
                    <input
                      type="text"
                      value={athleteName}
                      onChange={(e) => setAthleteName(e.target.value)}
                      placeholder="e.g. Liam Johnson"
                      className="apex-input bg-surface-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Guardian / Athlete Email</label>
                    <input
                      type="email"
                      value={athleteEmail}
                      onChange={(e) => setAthleteEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="apex-input bg-surface-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Athlete Age</label>
                    <input
                      type="number"
                      value={athleteAge}
                      onChange={(e) => setAthleteAge(e.target.value)}
                      placeholder="e.g. 11"
                      className="apex-input bg-surface-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="apex-btn apex-btn-block bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl font-bold py-3"
                  >
                    {submitting ? "Processing..." : `Confirm Enrollment ($${selectedProgram.price})`}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
