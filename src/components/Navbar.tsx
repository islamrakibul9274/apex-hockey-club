"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  FaBagShopping,
  FaUser,
  FaMagnifyingGlass,
  FaBars,
  FaXmark,
  FaRightToBracket,
  FaRightFromBracket,
  FaTicket,
  FaShieldHalved,
} from "react-icons/fa6";

export default function Navbar() {
  const pathname = usePathname();
  const { user, login, logout } = useAuth();
  const { totalCount, openCart } = useCart();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [loading, setLoading] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Programs", href: "/programs" },
    { name: "Store", href: "/products" },
    { name: "Pricing", href: "/pricing" },
    { name: "Blog", href: "/blog" },
    { name: "Contact", href: "/contact" },
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError("");
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      setAuthModalOpen(false);
      setEmail("");
      setPassword("");
    } else {
      setAuthError("Invalid credentials. Try the 1-Click Demo!");
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    const success = await login("demo@apex-hockey.com", "hockey2026", true);
    setLoading(false);
    if (success) {
      setAuthModalOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Mobile menu trigger + Brand Logo */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="btn btn-ghost btn-circle lg:hidden text-gray-700"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <FaXmark className="text-xl" /> : <FaBars className="text-xl" />}
              </button>

              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF4240] to-rose-400 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <FaShieldHalved className="text-xl" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-2xl tracking-tight text-gray-900 leading-none">
                    Hockey<span className="text-[#FF4240]">&apos;</span>s
                  </span>
                  <span className="text-[10px] tracking-widest uppercase font-bold text-gray-400">
                    Elite Club & Academy
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "text-[#FF4240] bg-red-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & CTA */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Modal Trigger */}
              <button
                onClick={() => setSearchOpen(true)}
                className="btn btn-ghost btn-circle text-gray-600 hover:text-[#FF4240] hover:bg-red-50"
                aria-label="Search"
              >
                <FaMagnifyingGlass className="text-base" />
              </button>

              {/* Shopping Bag / Cart */}
              <button
                onClick={openCart}
                className="btn btn-ghost btn-circle text-gray-600 hover:text-[#FF4240] hover:bg-red-50 relative"
                aria-label="Cart"
              >
                <FaBagShopping className="text-lg" />
                {totalCount > 0 && (
                  <span className="badge badge-xs bg-[#FF4240] border-none text-white absolute top-1 right-1 font-bold p-1 min-w-[1.2rem] h-[1.2rem] flex items-center justify-center text-[10px]">
                    {totalCount}
                  </span>
                )}
              </button>

              {/* User Account / Profile */}
              {user ? (
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar border-2 border-[#FF4240]/40">
                    <div className="w-9 rounded-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
                        alt={user.name}
                      />
                    </div>
                  </div>
                  <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-white rounded-2xl z-50 mt-3 w-56 p-3 shadow-2xl border border-gray-100 space-y-1 text-gray-700"
                  >
                    <li className="menu-title px-2 py-1 text-xs border-b border-gray-100 mb-1">
                      <div className="font-extrabold text-gray-900 text-sm">{user.name}</div>
                      <div className="text-[11px] text-gray-400 truncate">{user.email}</div>
                      <div className="badge badge-xs bg-red-100 text-[#FF4240] font-bold mt-1">
                        {user.membershipPlan || "VIP Athlete"}
                      </div>
                    </li>
                    <li>
                      <Link href="/account" className="py-2 hover:text-[#FF4240]">
                        <FaUser className="mr-2" /> My Profile & Portal
                      </Link>
                    </li>
                    <li>
                      <Link href="/account?tab=bookings" className="py-2 hover:text-[#FF4240]">
                        <FaTicket className="mr-2" /> Match Tickets & Camp
                      </Link>
                    </li>
                    <li>
                      <Link href="/account?tab=settings" className="py-2 hover:text-[#FF4240]">
                        Account Settings
                      </Link>
                    </li>
                    <li className="border-t border-gray-100 pt-1">
                      <button onClick={logout} className="text-red-500 hover:bg-red-50">
                        <FaRightFromBracket className="mr-2" /> Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              ) : (
                <button
                  onClick={() => setAuthModalOpen(true)}
                  className="btn btn-ghost btn-sm text-gray-700 hover:text-[#FF4240] font-bold rounded-xl hidden sm:flex items-center gap-1.5"
                >
                  <FaRightToBracket /> Sign In
                </button>
              )}

              {/* Get Ticket Primary Button */}
              <Link
                href="/get-ticket"
                className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none px-5 rounded-xl font-bold shadow-md shadow-red-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <FaTicket className="text-sm" />
                <span className="hidden sm:inline">Get Ticket</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-6 space-y-3 animate-in slide-in-from-top-2">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`px-4 py-3 rounded-xl text-base font-semibold ${
                    pathname === link.href
                      ? "text-[#FF4240] bg-red-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
              {!user ? (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="btn btn-outline border-gray-200 text-gray-800 btn-block rounded-xl font-bold"
                >
                  <FaRightToBracket /> Sign In / Demo Login
                </button>
              ) : (
                <Link
                  href="/account"
                  onClick={() => setMobileOpen(false)}
                  className="btn btn-outline border-gray-200 text-gray-800 btn-block rounded-xl font-bold"
                >
                  <FaUser /> Member Portal ({user.name})
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Global Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-xl rounded-3xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-extrabold text-lg text-gray-900 flex items-center gap-2">
                <FaMagnifyingGlass className="text-[#FF4240]" /> Search Apex Hockey
              </h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="btn btn-circle btn-ghost btn-xs text-gray-400"
              >
                <FaXmark className="text-base" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (searchQuery.trim()) {
                  window.location.href = `/products?search=${encodeURIComponent(searchQuery)}`;
                  setSearchOpen(false);
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search sticks, skates, protective gear, programs..."
                className="input w-full bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-[#FF4240]"
                autoFocus
              />
              <button
                type="submit"
                className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-6 font-bold"
              >
                Search
              </button>
            </form>

            <div className="space-y-2 pt-2">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {["CarbonFlex Stick", "Vapor Ice Skates", "Junior Program", "Match Tickets", "Goalie Gloves"].map(
                  (term) => (
                    <button
                      key={term}
                      onClick={() => {
                        window.location.href = `/products?search=${encodeURIComponent(term)}`;
                        setSearchOpen(false);
                      }}
                      className="badge badge-lg bg-gray-100 hover:bg-red-50 hover:text-[#FF4240] border-none text-gray-600 text-xs py-3 px-3 cursor-pointer transition-colors"
                    >
                      {term}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal (Sign In / 1-Click Demo) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl space-y-6 animate-in zoom-in-95 relative">
            <button
              onClick={() => setAuthModalOpen(false)}
              className="btn btn-circle btn-ghost btn-sm absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            >
              <FaXmark className="text-lg" />
            </button>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF4240] flex items-center justify-center text-2xl mx-auto shadow-inner">
                <FaShieldHalved />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900">Member Sign In</h3>
              <p className="text-gray-500 text-sm">Access your match tickets, camps, and exclusive gear perks</p>
            </div>

            {/* 1-Click Demo Button */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center space-y-2">
              <p className="text-xs font-bold text-amber-800">⚡ Instant Quick Test</p>
              <button
                onClick={handleDemoLogin}
                disabled={loading}
                className="btn btn-sm btn-block bg-amber-500 hover:bg-amber-600 text-white border-none rounded-xl font-bold"
              >
                {loading ? "Signing in..." : "1-Click Demo Login (VIP Athlete)"}
              </button>
            </div>

            <div className="divider text-xs text-gray-400">OR SIGN IN WITH EMAIL</div>

            {authError && (
              <div className="alert alert-error text-xs py-2 rounded-xl text-white font-medium">
                {authError}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label text-xs font-bold text-gray-700">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="input bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#FF4240]"
                  required
                />
              </div>

              <div className="form-control">
                <label className="label text-xs font-bold text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input bg-gray-100 border-none rounded-xl focus:ring-2 focus:ring-[#FF4240]"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-xl font-bold py-3"
              >
                {loading ? "Authenticating..." : "Sign In to Account"}
              </button>
            </form>

            <div className="text-center text-xs text-gray-500">
              Need an account?{" "}
              <Link
                href="/auth/signup"
                onClick={() => setAuthModalOpen(false)}
                className="text-[#FF4240] font-bold hover:underline"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
