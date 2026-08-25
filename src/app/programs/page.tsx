"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_PROGRAMS, ProgramData } from "@/lib/mockData";
import { FaCalendarDays, FaCheck, FaUserCheck, FaXmark, FaClock, FaLocationDot } from "react-icons/fa6";

const FILTER_TABS = ["All", "Junior", "Teen", "Professional"];

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ProgramData[]>(INITIAL_PROGRAMS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(null);

  const [athleteName, setAthleteName] = useState("");
  const [athleteEmail, setAthleteEmail] = useState("");
  const [athleteAge, setAthleteAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: athleteName,
          customerEmail: athleteEmail,
          bookingType: "program",
          itemId: selectedProgram.id,
          itemTitle: `${selectedProgram.title} (${athleteAge ? `Age ${athleteAge}` : selectedProgram.ageGroup})`,
          totalAmount: selectedProgram.price,
          seatsCount: 1,
        }),
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedProgram(null);
        setAthleteName("");
        setAthleteEmail("");
      }, 3000);
    } catch {
      setSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
            Academy Pathways
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Hockey Development Programs & Masterclasses
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
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
                    ? "bg-[#FF4240] text-white shadow-lg shadow-red-500/20 scale-105"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tab} Programs
              </button>
            ))}
          </div>
        </div>

        {/* Programs Catalog */}
        <div className="space-y-8">
          {filtered.map((prog) => (
            <div
              key={prog.id}
              id={prog.id}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8"
            >
              {/* Visual Preview */}
              <div className="lg:col-span-5 relative min-h-[260px] rounded-2xl overflow-hidden bg-slate-900">
                <Image src={prog.image} alt={prog.title} fill className="object-cover" />
                <div className="absolute top-4 left-4">
                  <span className="badge bg-[#FF4240] text-white border-none font-bold text-xs py-3 px-3">
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
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                      {prog.title}
                    </h2>
                    <div className="text-3xl font-black text-[#FF4240]">
                      ${prog.price}
                      <span className="text-xs font-semibold text-gray-400"> / term</span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm leading-relaxed">{prog.description}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 pt-2">
                    <div className="flex items-center gap-2">
                      <FaCalendarDays className="text-[#FF4240]" />
                      <span>{prog.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaClock className="text-[#FF4240]" />
                      <span>Duration: {prog.duration}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaUserCheck className="text-[#FF4240]" />
                      <span>Lead Coach: {prog.coach}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FaLocationDot className="text-[#FF4240]" />
                      <span>Olympic Arena Rink 1</span>
                    </div>
                  </div>

                  {prog.features && (
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-1.5 pt-3">
                      <p className="text-xs font-bold text-gray-800 uppercase tracking-wider">Curriculum Highlights:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {prog.features.map((f, i) => (
                          <div key={i} className="text-xs text-gray-700 flex items-center gap-2">
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
                    className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-8 font-bold shadow-md shadow-red-500/20"
                  >
                    Enroll in Program
                  </button>
                  <Link
                    href={`/contact?subject=Question%20about%20${encodeURIComponent(prog.title)}`}
                    className="btn btn-outline border-gray-300 text-gray-800 hover:bg-gray-100 rounded-2xl px-6 font-bold"
                  >
                    Ask Coach a Question
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {selectedProgram && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95">
              <button
                onClick={() => setSelectedProgram(null)}
                className="btn btn-circle btn-ghost btn-sm absolute top-4 right-4 text-gray-400"
              >
                <FaXmark className="text-lg" />
              </button>

              {success ? (
                <div className="text-center py-8 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
                    <FaCheck />
                  </div>
                  <h3 className="text-2xl font-extrabold text-gray-900">Registration Complete!</h3>
                  <p className="text-gray-500 text-sm">
                    Athlete enrolled in {selectedProgram.title}. We look forward to seeing you on the ice.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="space-y-4">
                  <div className="space-y-1">
                    <span className="badge bg-red-100 text-[#FF4240] font-bold text-xs">
                      {selectedProgram.category} Enrollment
                    </span>
                    <h3 className="text-2xl font-extrabold text-gray-900">{selectedProgram.title}</h3>
                    <p className="text-xs text-gray-500">Term Tuition: ${selectedProgram.price}</p>
                  </div>

                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-700">Athlete Full Name</label>
                    <input
                      type="text"
                      value={athleteName}
                      onChange={(e) => setAthleteName(e.target.value)}
                      placeholder="e.g. Liam Johnson"
                      className="input bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-700">Guardian / Athlete Email</label>
                    <input
                      type="email"
                      value={athleteEmail}
                      onChange={(e) => setAthleteEmail(e.target.value)}
                      placeholder="parent@example.com"
                      className="input bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-700">Athlete Age</label>
                    <input
                      type="number"
                      value={athleteAge}
                      onChange={(e) => setAthleteAge(e.target.value)}
                      placeholder="e.g. 11"
                      className="input bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl font-bold py-3"
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
