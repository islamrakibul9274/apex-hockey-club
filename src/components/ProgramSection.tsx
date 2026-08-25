"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { INITIAL_PROGRAMS, ProgramData } from "@/lib/mockData";
import { FaUserPlus, FaCalendarDays, FaCheck, FaXmark } from "react-icons/fa6";

export default function ProgramSection() {
  const [programs, setPrograms] = useState<ProgramData[]>(INITIAL_PROGRAMS);
  const [selectedProgram, setSelectedProgram] = useState<ProgramData | null>(null);
  const [registering, setRegistering] = useState(false);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);

  const [athleteName, setAthleteName] = useState("");
  const [athleteEmail, setAthleteEmail] = useState("");
  const [athleteAge, setAthleteAge] = useState("");

  useEffect(() => {
    async function loadPrograms() {
      try {
        const res = await fetch("/api/programs");
        const data = await res.json();
        if (data.programs && data.programs.length > 0) {
          setPrograms(data.programs);
        }
      } catch {
        // fallback to initial
      }
    }
    loadPrograms();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram) return;
    setRegistering(true);

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
      setRegisteredSuccess(true);
      setTimeout(() => {
        setRegisteredSuccess(false);
        setSelectedProgram(null);
        setAthleteName("");
        setAthleteEmail("");
      }, 3000);
    } catch {
      setRegisteredSuccess(true);
    } finally {
      setRegistering(false);
    }
  };

  return (
    <section id="programs" className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center space-y-3 my-8 py-8 border-dashed border-2 border-l-0 border-r-0 border-gray-200">
        <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
          Development Paths
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Program Sections
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Dit amet consectetur. Condimentum dignissim adipiscing aliquam turpis placerat <br className="hidden sm:inline" /> dolor. Purus urna in sit nullam proin.
        </p>
      </div>

      {/* Program Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {programs.map((program, idx) => {
          const isFullSpan = idx === 2;
          return (
            <div
              key={program.id}
              className={`hero rounded-3xl min-h-[380px] overflow-hidden bg-cover bg-center relative shadow-lg hover:shadow-2xl transition-all duration-300 ${
                isFullSpan ? "lg:col-span-2" : ""
              }`}
              style={{ backgroundImage: `url(${program.image || "/images/2.png"})` }}
            >
              <div className="hero-overlay bg-gradient-to-t from-black via-black/75 to-black/30"></div>
              <div
                className={`hero-content text-neutral-content p-6 sm:p-10 w-full flex ${
                  isFullSpan ? "justify-start" : "justify-start"
                }`}
              >
                <div className="max-w-xl space-y-4 text-left">
                  <div className="flex flex-wrap gap-2">
                    <span className="badge bg-[#FF4240] text-white border-none font-bold text-xs">
                      {program.ageGroup}
                    </span>
                    <span className="badge bg-white/20 text-white border-none font-semibold text-xs backdrop-blur-md">
                      {program.duration}
                    </span>
                    <span className="badge bg-amber-400 text-gray-900 border-none font-bold text-xs">
                      {program.spotsLeft} Spots Left
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                    {program.title}
                  </h3>

                  <p className="text-gray-200 text-xs sm:text-sm leading-relaxed">
                    {program.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-gray-300">
                    <span className="flex items-center gap-1.5">
                      <FaCalendarDays className="text-[#FF4240]" /> {program.schedule}
                    </span>
                    <span className="font-extrabold text-white text-base">
                      ${program.price}
                    </span>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-3">
                    <button
                      onClick={() => setSelectedProgram(program)}
                      className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-6 font-bold shadow-lg shadow-red-500/30 flex items-center gap-2"
                    >
                      <FaUserPlus /> Register Now!
                    </button>
                    <Link
                      href={`/programs#${program.id}`}
                      className="btn bg-white/20 hover:bg-white text-white hover:text-gray-900 border-none rounded-2xl px-5 font-semibold backdrop-blur-md text-xs"
                    >
                      View Syllabus
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Registration Modal */}
      {selectedProgram && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95">
            <button
              onClick={() => setSelectedProgram(null)}
              className="btn btn-circle btn-ghost btn-sm absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <FaXmark className="text-lg" />
            </button>

            {registeredSuccess ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto">
                  <FaCheck />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900">Registration Confirmed!</h3>
                <p className="text-gray-500 text-sm">
                  Welcome to {selectedProgram.title}. We&apos;ve sent program details and schedule to your email.
                </p>
                <Link
                  href="/account?tab=bookings"
                  className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-6 font-bold"
                >
                  View in My Portal
                </Link>
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <span className="badge bg-red-100 text-[#FF4240] font-bold text-xs">
                    {selectedProgram.category} Program
                  </span>
                  <h3 className="text-2xl font-extrabold text-gray-900">{selectedProgram.title}</h3>
                  <p className="text-gray-500 text-xs">
                    Coach: <span className="font-bold text-gray-700">{selectedProgram.coach}</span> | Fee:{" "}
                    <span className="font-extrabold text-[#FF4240] text-sm">${selectedProgram.price}</span>
                  </p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-700">Athlete Name</label>
                    <input
                      type="text"
                      value={athleteName}
                      onChange={(e) => setAthleteName(e.target.value)}
                      placeholder="Full Name"
                      className="input bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#FF4240]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="form-control">
                      <label className="label text-xs font-bold text-gray-700">Contact Email</label>
                      <input
                        type="email"
                        value={athleteEmail}
                        onChange={(e) => setAthleteEmail(e.target.value)}
                        placeholder="athlete@example.com"
                        className="input bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#FF4240]"
                        required
                      />
                    </div>
                    <div className="form-control">
                      <label className="label text-xs font-bold text-gray-700">Athlete Age</label>
                      <input
                        type="number"
                        value={athleteAge}
                        onChange={(e) => setAthleteAge(e.target.value)}
                        placeholder="e.g. 14"
                        className="input bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#FF4240]"
                        required
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl text-xs text-gray-600 space-y-1">
                    <p className="font-bold text-gray-800">Included in registration:</p>
                    {selectedProgram.features.slice(0, 3).map((f, i) => (
                      <p key={i} className="flex items-center gap-1.5">
                        <FaCheck className="text-[#FF4240] text-[10px]" /> {f}
                      </p>
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={registering}
                    className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl font-bold py-3"
                  >
                    {registering ? "Confirming..." : `Confirm Registration ($${selectedProgram.price})`}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
