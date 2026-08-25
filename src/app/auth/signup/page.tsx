"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaShieldHalved } from "react-icons/fa6";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        window.location.href = "/account";
      } else {
        setError(data.error || "Registration failed. Please try again.");
      }
    } catch {
      setError("Registration encountered an issue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 py-16 flex-1 max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-3xl bg-red-50 text-[#FF4240] flex items-center justify-center text-3xl mx-auto shadow-inner">
            <FaShieldHalved />
          </div>
          <h1 className="text-3xl font-black text-gray-900">Join Apex Hockey</h1>
          <p className="text-gray-500 text-sm">Create your athlete profile for camps, tickets, and store discounts</p>
        </div>

        {error && (
          <div className="alert alert-error text-xs text-white rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jordan Matthews"
              className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
              required
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jordan@example.com"
              className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
              required
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-gray-700">Phone Number (Optional)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="(+1) 555-0182"
              className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
            />
          </div>

          <div className="form-control">
            <label className="label text-xs font-bold text-gray-700">Create Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl font-bold py-3 text-base shadow-lg shadow-red-500/20"
          >
            {loading ? "Creating Account..." : "Complete Registration"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Already registered?{" "}
          <Link href="/auth/signin" className="text-[#FF4240] font-bold hover:underline">
            Sign In Here
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
