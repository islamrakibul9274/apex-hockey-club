"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { INITIAL_MATCH_TICKETS, MatchTicketData } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";
import {
  FaTicket,
  FaCalendarDays,
  FaLocationDot,
  FaCheck,
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
  const [checkoutError, setCheckoutError] = useState("");
  const [pendingBookingWarning, setPendingBookingWarning] = useState("");

  const { user } = useAuth();

  const currentTierObj =
    selectedMatch.priceTiers.find((t) => t.name === selectedTier) ||
    selectedMatch.priceTiers[0];

  const totalAmount = currentTierObj.price * quantity;

  /**
   * Checkout order matters: open the Stripe session FIRST, and only record the
   * booking once Stripe has accepted it.
   *
   * The previous version wrote the booking, then called checkout, then showed
   * "Tickets Confirmed!" whenever no URL came back — including when Stripe had
   * rejected the payment outright. A failure now shows the actual error.
   */
  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError("");

    if (!user) {
      setCheckoutError("Sign in to book tickets so we can attach them to your account.");
      return;
    }

    if (selectedTier !== currentTierObj.name) {
      // The tier from the previous match can linger after switching matches.
      setCheckoutError("That seat tier is not available for this match.");
      return;
    }

    if (quantity > currentTierObj.availableSeats) {
      setCheckoutError(
        `Only ${currentTierObj.availableSeats} seats remain in ${currentTierObj.name}.`
      );
      return;
    }

    setLoading(true);

    try {
      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "ticket",
          matchId: selectedMatch.id,
          tier: currentTierObj.name,
          seats: quantity,
        }),
      });

      const checkoutData = await checkoutRes.json().catch(() => ({}));

      if (!checkoutRes.ok || !checkoutData?.url) {
        setCheckoutError(
          checkoutData?.error ?? "We could not start the payment. Your card has not been charged."
        );
        return;
      }

      // The booking is only recorded after payment is under way. It stays
      // "pending" until a Stripe webhook marks it paid.
      const bookingRes = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName || user.name,
          customerEmail: customerEmail || user.email,
          customerPhone: user.phone ?? "",
          bookingType: "ticket",
          itemId: selectedMatch.id,
          itemTitle: `${selectedMatch.matchTitle} - ${currentTierObj.name}`,
          tierOrPlan: currentTierObj.name,
          seatsCount: quantity,
          date: selectedMatch.date,
          time: selectedMatch.time,
        }),
      });

      if (!bookingRes.ok) {
        const bookingData = await bookingRes.json().catch(() => ({}));
        console.error("[get-ticket] booking not recorded:", bookingData);
        // Payment is already in flight, so the customer must still complete
        // it — but they are told the record is missing rather than being shown
        // a false confirmation.
        setPendingBookingWarning(
          "Your payment is ready but we could not attach this booking to your account yet. Contact us with your receipt and we will add it."
        );
      }

      window.location.href = checkoutData.url;
    } catch {
      setCheckoutError(
        "We could not reach the payment service. Check your connection and try again — you have not been charged."
      );
    } finally {
      setLoading(false);
    }
  };  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
            Match Passes & Seating
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-ink-900 tracking-tight">
            Reserve Arena Match Tickets
          </h1>
          <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
            Experience high-velocity professional ice hockey live at the Mohakhali Olympic Ice Arena. Pick your fixture, seating tier, and instant digital pass.
          </p>
        </div>

        {confirmed ? (
          <div className="bg-surface-50 border border-line-200 rounded-3xl p-10 max-w-2xl mx-auto text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-success-50 text-success-700 flex items-center justify-center text-3xl mx-auto shadow-inner">
              <FaCheck />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-extrabold text-ink-900">Tickets Confirmed!</h2>
              <p className="text-ink-600 text-sm">
                Your reservation for <strong className="text-ink-900">{selectedMatch.matchTitle}</strong> ({quantity} {selectedTier} seats) is confirmed.
              </p>
              <p className="text-xs text-ink-500">
                Digital mobile barcode passes have been synced to your account portal and emailed.
              </p>
            </div>

            <div className="flex justify-center gap-4 pt-4">
              <Link
                href="/account?tab=bookings"
                className="apex-btn bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl px-6 font-bold"
              >
                View Tickets in Portal
              </Link>
              <button
                onClick={() => setConfirmed(false)}
                className="apex-btn apex-btn-secondary border-line-300 text-ink-800 rounded-2xl px-6 font-bold"
              >
                Book Another Match
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Match Selection */}
            <div className="lg:col-span-7 space-y-6">
              <h2 className="text-xl font-extrabold text-ink-900 flex items-center gap-2">
                <FaCalendarDays className="text-brand-600" /> Select Match Fixture
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
                          ? "border-brand-500 bg-brand-50/40 shadow-lg shadow-red-500/10"
                          : "border-line-200 bg-surface-0 hover:border-line-300"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <span className="apex-badge apex-badge-sm bg-surface-100 font-bold text-[10px]">
                            {match.tournament}
                          </span>
                          <h3 className="text-xl font-extrabold text-ink-900">{match.matchTitle}</h3>
                          <div className="flex items-center gap-4 text-xs text-ink-600 pt-1">
                            <span className="flex items-center gap-1">
                              <FaCalendarDays className="text-brand-600" /> {match.date} at {match.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <FaLocationDot className="text-brand-600" /> {match.venue}
                            </span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                          <span className="text-xs text-ink-500">Starting from</span>
                          <span className="text-2xl font-black text-brand-600">
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
                <h2 className="text-xl font-extrabold text-ink-900">Choose Seating Tier</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {selectedMatch.priceTiers.map((tier) => {
                    const isSelected = selectedTier === tier.name;
                    return (
                      <div
                        key={tier.name}
                        onClick={() => setSelectedTier(tier.name)}
                        className={`p-5 rounded-2xl cursor-pointer transition-all border-2 text-center space-y-2 ${
                          isSelected
                            ? "border-brand-500 bg-brand-50/50 shadow-md"
                            : "border-line-200 bg-surface-0 hover:border-line-300"
                        }`}
                      >
                        <h4 className="font-extrabold text-sm text-ink-900">{tier.name}</h4>
                        <div className="text-2xl font-black text-brand-600">${tier.price}</div>
                        <p className="text-[11px] text-ink-600 line-clamp-2 leading-relaxed">
                          {tier.description}
                        </p>
                        <span className="apex-badge apex-badge-sm bg-surface-100 text-ink-600 font-semibold text-[10px]">
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
              <div className="bg-surface-50 border border-line-200 rounded-3xl p-6 sm:p-8 space-y-6 sticky top-28 shadow-sm">
                <div className="flex items-center gap-3 border-b border-line-200 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center text-lg shadow-md">
                    <FaTicket />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-lg text-ink-900">Pass Reservation</h3>
                    <p className="text-xs text-ink-600">Live match checkout</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between text-ink-600">
                    <span>Fixture:</span>
                    <span className="font-bold text-ink-900 text-right max-w-[200px] truncate">
                      {selectedMatch.matchTitle}
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Tier:</span>
                    <span className="font-bold text-ink-900">{selectedTier} (${currentTierObj.price}/seat)</span>
                  </div>
                  <div className="flex justify-between items-center text-ink-600">
                    <span>Tickets Count:</span>
                    <div className="flex items-center border border-line-300 rounded-xl bg-surface-0 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="px-3 py-1 text-ink-600 hover:bg-surface-100"
                        aria-label="Decrease quantity"
                      >
                        <FaMinus className="text-xs" />
                      </button>
                      <span className="px-3 py-1 font-extrabold text-ink-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="px-3 py-1 text-ink-600 hover:bg-surface-100"
                        aria-label="Increase quantity"
                      >
                        <FaPlus className="text-xs" />
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-line-200 pt-3 flex justify-between font-black text-lg text-ink-900">
                    <span>Total Amount</span>
                    <span className="text-brand-600">${totalAmount}</span>
                  </div>
                </div>

                {/* Attendee Form */}
                <form onSubmit={handleBookTicket} className="space-y-4 pt-2">
                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Ticket Holder Name</label>
                    <input
                      type="text"
                      value={customerName || user?.name || ""}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Alex Mercer"
                      className="apex-input bg-surface-0 border border-line-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  <div className="apex-field">
                    <label className="label text-xs font-bold text-ink-700">Receipt & Barcode Email</label>
                    <input
                      type="email"
                      value={customerEmail || user?.email || ""}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="alex@example.com"
                      className="apex-input bg-surface-0 border border-line-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-500"
                      required
                    />
                  </div>

                  {checkoutError && (
                    <div role="alert" className="apex-alert apex-alert-error">
                      {checkoutError}
                    </div>
                  )}

                  {pendingBookingWarning && (
                    <div role="alert" className="apex-alert apex-alert-info">
                      {pendingBookingWarning}
                    </div>
                  )}

                  {!user && (
                    <div role="status" className="apex-alert apex-alert-info">
                      <Link
                        href={`/auth/signin?next=${encodeURIComponent("/get-ticket")}`}
                        className="font-semibold underline"
                      >
                        Sign in
                      </Link>{" "}
                      to book tickets for this account.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading || !user}
                    className="apex-btn apex-btn-block bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl font-bold py-3 text-base shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="apex-spinner apex-spinner-sm"></span>
                    ) : (
                      <>
                        <FaCreditCard /> Pay &amp; Confirm Pass (${totalAmount})
                      </>
                    )}
                  </button>
                </form>

                <p className="text-[11px] text-ink-500 text-center leading-relaxed">
                  Payment is taken by Stripe. Passes are issued to your account once payment clears.
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
