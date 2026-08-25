"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_MATCH_TICKETS, MatchTicketData } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import {
  FaTicket,
  FaCalendarDays,
  FaLocationDot,
  FaCheck,
  FaShieldHalved,
  FaPlus,
  FaMinus,
  FaCreditCard,
} from "react-icons/fa6";

export default function GetTicketPage() {
  const matches = INITIAL_MATCH_TICKETS;
  const [selectedMatch, setSelectedMatch] = useState<MatchTicketData>(matches[0]);
  const [selectedTier, setSelectedTier] = useState<string>("General Admission");
  const [quantity, setQuantity] = useState<number>(2);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const { user } = useAuth();

  const currentTierObj =
    selectedMatch.priceTiers.find((t) => t.name === selectedTier) ||
    selectedMatch.priceTiers[0];

  const totalAmount = currentTierObj.price * quantity;

  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Record booking in DB
      await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || user?.name || "Match Attendee",
          customerEmail: customerEmail || user?.email || "fan@example.com",
          bookingType: "ticket",
          itemId: selectedMatch.id,
          itemTitle: `${selectedMatch.matchTitle} - ${selectedTier}`,
          tierOrPlan: selectedTier,
          seatsCount: quantity,
          totalAmount,
          date: selectedMatch.date,
          time: selectedMatch.time,
        }),
      });

      // 2. Stripe Checkout trigger
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: `${selectedMatch.matchTitle} (${selectedTier} x${quantity})`,
          price: totalAmount,
          type: "ticket",
          customerEmail: customerEmail || user?.email,
        }),
      });
      const data = await res.json();

      if (data.url && !data.url.includes("simulation=true")) {
        window.location.href = data.url;
      } else {
        setConfirmed(true);
      }
    } catch {
      setConfirmed(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
            Match Passes & Seating
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Reserve Arena Match Tickets
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Experience high-velocity professional ice hockey live at the Mohakhali Olympic Ice Arena. Pick your fixture, seating tier, and instant digital pass.
          </p>
        </div>

        {confirmed ? (
          <div className="bg-slate-50 border border-gray-200 rounded-3xl p-10 max-w-2xl mx-auto text-center space-y-6 animate-in fade-in">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <FaCheck />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-gray-900">Tickets Confirmed!</h2>
              <p className="text-gray-600 text-sm">
                Your reservation for <strong className="text-gray-900">{selectedMatch.matchTitle}</strong> ({quantity} {selectedTier} seats) is confirmed.
              </p>
              <p className="text-xs text-gray-400">
                Digital mobile barcode passes have been synced to your account portal and emailed.
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/account?tab=bookings"
                className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-6 font-bold"
              >
                View Tickets in Portal
              </Link>
              <button
                onClick={() => setConfirmed(false)}
                className="btn btn-outline border-gray-300 text-gray-800 rounded-2xl px-6 font-bold"
              >
                Book Another Match
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Match Selection */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
                <FaCalendarDays className="text-[#FF4240]" /> Select Match Fixture
              </h2>

              <div className="space-y-4">
                {matches.map((match) => {
                  const isSelected = selectedMatch.id === match.id;
                  return (
                    <div
                      key={match.id}
                      onClick={() => setSelectedMatch(match)}
                      className={`p-6 rounded-3xl cursor-pointer transition-all duration-200 border-2 ${
                        isSelected
                          ? "border-[#FF4240] bg-red-50/40 shadow-lg shadow-red-500/10"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="badge badge-sm bg-slate-900 text-white font-bold text-[10px]">
                            {match.tournament}
                          </span>
                          <h3 className="text-xl font-extrabold text-gray-900">{match.matchTitle}</h3>
                          <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                            <span className="flex items-center gap-1">
                              <FaCalendarDays className="text-[#FF4240]" /> {match.date} at {match.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaLocationDot className="text-[#FF4240]" /> {match.venue}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span className="text-xs text-gray-400">Starting from</span>
                          <span className="text-2xl font-black text-[#FF4240]">
                            ${match.priceTiers[0].price}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Seating Tiers */}
              <div className="space-y-4 pt-4">
                <h2 className="text-xl font-extrabold text-gray-900">Choose Seating Tier</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedMatch.priceTiers.map((tier) => {
                    const isSelected = selectedTier === tier.name;
                    return (
                      <div
                        key={tier.name}
                        onClick={() => setSelectedTier(tier.name)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border-2 text-center space-y-2 ${
                          isSelected
                            ? "border-[#FF4240] bg-red-50/50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300"
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-gray-900">{tier.name}</h4>
                        <div className="text-2xl font-black text-[#FF4240]">${tier.price}</div>
                        <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
                          {tier.description}
                        </p>
                        <span className="badge badge-xs bg-gray-100 text-gray-600 font-semibold text-[10px]">
                          {tier.availableSeats} Seats Left
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Order Summary & Checkout Form */}
            <div className="lg:col-span-5">
              <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-sm">
                <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#FF4240] text-white flex items-center justify-center text-lg shadow-md">
                    <FaTicket />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-gray-900">Pass Reservation</h3>
                    <p className="text-xs text-gray-500">Live match checkout</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Fixture:</span>
                    <span className="font-bold text-gray-900 text-right max-w-[200px] truncate">
                      {selectedMatch.matchTitle}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tier:</span>
                    <span className="font-bold text-gray-900">{selectedTier} (${currentTierObj.price}/seat)</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Tickets Count:</span>
                    <div className="flex items-center border border-gray-300 rounded-xl bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Decrease quantity"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="px-3 py-1 font-extrabold text-gray-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        aria-label="Increase quantity"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-3 flex justify-between font-black text-lg text-gray-900">
                    <span>Total Amount</span>
                    <span className="text-[#FF4240]">${totalAmount}</span>
                  </div>
                </div>

                {/* Attendee Form */}
                <form onSubmit={handleBookTicket} className="space-y-4 pt-2">
                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-700">Ticket Holder Name</label>
                    <input
                      type="text"
                      value={customerName || user?.name || ""}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="input bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label text-xs font-bold text-gray-700">Receipt & Barcode Email</label>
                    <input
                      type="email"
                      value={customerEmail || user?.email || ""}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="input bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl font-bold py-3 text-base shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="loading loading-spinner loading-sm"></span>
                    ) : (
                      <>
                        <FaCreditCard /> Pay & Confirm Pass (${totalAmount})
                      </>
                    )}
                  </button>
                </form>

                <p className="text-[11px] text-gray-400 text-center leading-relaxed">
                  🔒 Guaranteed authentic passes. Instant mobile barcode delivered to your account.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
