"use client";

import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "next/navigation";
import {
  FaUser,
  FaTicket,
  FaGear,
  FaShieldHalved,
  FaRightFromBracket,
  FaCheck,
  FaBarcode,
  FaCalendarDays,
  FaBell,
} from "react-icons/fa6";

interface BookingItem {
  _id: string;
  itemTitle: string;
  bookingType: string;
  tierOrPlan: string;
  seatsCount: number;
  totalAmount: number;
  date: string;
  status: string;
  paymentStatus: string;
}

function AccountContent() {
  const { user, logout, updateProfile, login } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "overview";
  const paymentSuccess = searchParams.get("payment") === "success";

  const [activeTab, setActiveTab] = useState(initialTab);
  const [bookings, setBookings] = useState<BookingItem[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Profile Edit State
  const [name, setName] = useState(user?.name || "Alex Mercer");
  const [phone, setPhone] = useState(user?.phone || "(+1) 555-0199");
  const [street, setStreet] = useState(user?.address?.street || "152/1 Wireless Gate");
  const [city, setCity] = useState(user?.address?.city || "Mohakhali");
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || "");
      if (user.address) {
        setStreet(user.address.street || "");
        setCity(user.address.city || "");
      }
    }
  }, [user]);

  useEffect(() => {
    async function loadBookings() {
      setLoadingBookings(true);
      try {
        const res = await fetch("/api/bookings");
        const data = await res.json();
        if (data.bookings) {
          setBookings(data.bookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingBookings(false);
      }
    }
    loadBookings();
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const success = await updateProfile({
      name,
      phone,
      address: { street, city },
    });
    setSaving(false);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    }
  };

  const handleDemoSignIn = async () => {
    await login("demo@apex-hockey.com", "hockey2026", true);
  };

  if (!user) {
    return (
      <main className="container mx-auto px-4 py-16 flex-1 max-w-lg text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-red-50 text-[#FF4240] flex items-center justify-center text-3xl mx-auto shadow-inner">
          <FaShieldHalved />
        </div>
        <h1 className="text-3xl font-black text-gray-900">Member Portal Sign In Required</h1>
        <p className="text-gray-600 text-sm">
          Please sign in to view your profile, manage active match passes, check camp enrollments, and customize settings.
        </p>
        <div className="space-y-3">
          <button
            onClick={handleDemoSignIn}
            className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl font-bold py-3 text-base shadow-lg shadow-red-500/20"
          >
            ⚡ 1-Click Demo Login (Alex Mercer - VIP)
          </button>
          <Link
            href="/auth/signin"
            className="btn btn-block btn-outline border-gray-300 text-gray-800 rounded-2xl font-bold"
          >
            Sign In with Existing Credentials
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">
      {/* Payment Confirmation Banner */}
      {paymentSuccess && (
        <div className="alert alert-success text-white font-bold rounded-2xl shadow-xl flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <FaCheck className="text-xl" />
            <div>
              <p className="font-black text-base">Payment & Reservation Processed Successfully!</p>
              <p className="text-xs font-medium text-emerald-100">
                Your ticket/membership pass has been activated and synched to your account.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Member Profile Hero Bar */}
      <div className="bg-gradient-to-r from-slate-900 to-gray-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
            alt={user.name}
            className="w-20 h-20 rounded-full object-cover border-4 border-[#FF4240] shadow-md"
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white">{user.name}</h1>
              <span className="badge bg-[#FF4240] text-white border-none font-bold text-xs uppercase px-2 py-1">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-slate-400">{user.email}</p>
            <div className="flex items-center gap-2 pt-1 text-xs text-amber-400 font-bold">
              <FaShieldHalved /> Plan: {user.membershipPlan || "Elite Champion"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={logout}
            className="btn btn-sm btn-outline border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl"
          >
            <FaRightFromBracket /> Sign Out
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 gap-4 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`pb-4 px-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "overview"
              ? "border-[#FF4240] text-[#FF4240]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FaUser /> Profile & Portal
        </button>
        <button
          onClick={() => setActiveTab("bookings")}
          className={`pb-4 px-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "bookings"
              ? "border-[#FF4240] text-[#FF4240]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FaTicket /> Match Tickets & Camps ({bookings.length})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`pb-4 px-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === "settings"
              ? "border-[#FF4240] text-[#FF4240]"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <FaGear /> Account Settings
        </button>
      </div>

      {/* Tab 1: Overview & Profile */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 space-y-4">
              <h3 className="font-extrabold text-base text-gray-900">Active Membership Benefits</h3>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#FF4240]" /> 24/7 Unlimited Ice Rink Access
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#FF4240]" /> Free Weekly Skate Sharpening
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#FF4240]" /> 30% Off Official Store Equipment
                </div>
                <div className="flex items-center gap-2">
                  <FaCheck className="text-[#FF4240]" /> VIP Tournament Match Seating
                </div>
              </div>
              <Link
                href="/pricing"
                className="btn btn-sm btn-block bg-white border border-gray-200 text-gray-800 rounded-xl hover:bg-gray-100 font-bold"
              >
                Manage Membership Plan
              </Link>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl p-6 space-y-3">
              <h3 className="font-extrabold text-base text-gray-900">Need On-Ice Assistance?</h3>
              <p className="text-xs text-gray-500">
                Contact the Head Coach desk for private ice time scheduling or equipment fitting.
              </p>
              <Link
                href="/contact"
                className="btn btn-sm btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-xl font-bold"
              >
                Contact Concierge
              </Link>
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-2xl font-extrabold text-gray-900">Personal Athlete Profile</h2>
            {savedSuccess && (
              <div className="alert alert-success text-xs text-white rounded-xl">
                ✓ Profile settings saved successfully!
              </div>
            )}

            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-700">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-700">Email (Read Only)</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="input bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                  />
                </div>

                <div className="form-control">
                  <label className="label text-xs font-bold text-gray-700">City / District</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                  />
                </div>
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold text-gray-700">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-8 font-bold"
              >
                {saving ? "Saving Changes..." : "Save Profile Details"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Bookings & Tickets */}
      {activeTab === "bookings" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-900">Your Tickets & Camp Passes</h2>
              <p className="text-gray-500 text-xs">Present digital barcode at arena turnstile for entry</p>
            </div>
            <Link
              href="/get-ticket"
              className="btn btn-sm bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-xl font-bold"
            >
              + Book Match Pass
            </Link>
          </div>

          {loadingBookings ? (
            <div className="py-12 text-center text-gray-400">Loading your tickets...</div>
          ) : bookings.length === 0 ? (
            <div className="bg-slate-50 border border-gray-200 rounded-3xl p-12 text-center space-y-4">
              <FaTicket className="text-4xl text-gray-300 mx-auto" />
              <h3 className="text-xl font-bold text-gray-800">No active bookings found</h3>
              <p className="text-gray-500 text-xs max-w-xs mx-auto">
                You haven&apos;t reserved any arena match passes or camp enrollments yet.
              </p>
              <Link
                href="/get-ticket"
                className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-6 font-bold"
              >
                Explore Match Passes
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((b) => (
                <div
                  key={b._id}
                  className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="badge bg-red-100 text-[#FF4240] font-bold text-xs">
                        {b.bookingType.toUpperCase()} PASS
                      </span>
                      <span className="badge bg-emerald-100 text-emerald-700 font-bold text-xs">
                        {b.status.toUpperCase()}
                      </span>
                    </div>

                    <h3 className="text-xl font-black text-gray-900 leading-tight">
                      {b.itemTitle}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-gray-500 pt-1">
                      <span className="flex items-center gap-1">
                        <FaCalendarDays className="text-[#FF4240]" /> {b.date || "Upcoming Season"}
                      </span>
                      <span>Tier: {b.tierOrPlan}</span>
                      <span>Seats: x{b.seatsCount}</span>
                    </div>
                  </div>

                  <div className="border-t border-dashed border-gray-300 pt-4 flex items-center justify-between bg-slate-50 p-4 rounded-2xl">
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Pass Code</p>
                      <p className="font-mono text-xs font-bold text-gray-800">
                        APX-{b._id.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 text-2xl text-gray-700">
                      <FaBarcode />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Account Settings */}
      {activeTab === "settings" && (
        <div className="max-w-2xl bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-extrabold text-gray-900">Account Preferences</h2>

          <div className="space-y-4 divide-y divide-gray-100">
            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                  <FaBell className="text-[#FF4240]" /> Match & Ticket Alerts
                </h4>
                <p className="text-xs text-gray-500">Receive notifications when tournament tickets go live</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle toggle-error" />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-gray-900">Training & Clinic Reminders</h4>
                <p className="text-xs text-gray-500">SMS / Email reminder 2 hours before scheduled ice time</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle toggle-error" />
            </div>

            <div className="flex items-center justify-between pt-4">
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-gray-900">Pro Shop Gear Drops</h4>
                <p className="text-xs text-gray-500">Get 15% VIP member discount codes on newly released equipment</p>
              </div>
              <input type="checkbox" defaultChecked className="toggle toggle-error" />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={logout}
              className="btn bg-red-50 text-[#FF4240] hover:bg-red-100 border-none rounded-2xl font-bold"
            >
              <FaRightFromBracket /> Sign Out of All Devices
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function AccountPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />
      <Suspense
        fallback={
          <div className="container mx-auto py-24 text-center text-gray-400 font-bold">
            <span className="loading loading-spinner loading-lg text-[#FF4240]"></span>
            <p className="mt-4 text-sm">Loading Member Portal...</p>
          </div>
        }
      >
        <AccountContent />
      </Suspense>
      <Footer />
    </div>
  );
}
