"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { FaShieldHalved } from "react-icons/fa6";

export default function SignInPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await login(email, password);
    setLoading(false);
    if (success) {
      router.push("/account");
    } else {
      setError("Invalid email or password. You can also use the 1-Click Demo Login.");
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    const success = await login("demo@apex-hockey.com", "hockey2026", true);
    setLoading(false);
    if (success) {
      router.push("/account");
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
          <h1 className="text-3xl font-black text-gray-900">Welcome Back</h1>
          <p className="text-gray-500 text-sm">Sign in to your Apex Hockey athlete account</p>
        </div>

        {/* Demo Login Button */}
        <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-center space-y-2 shadow-sm">
          <p className="text-xs font-bold text-amber-900">⚡ Instant Quick Test</p>
          <button
            onClick={handleDemo}
            disabled={loading}
            className="btn btn-sm btn-block bg-amber-500 hover:bg-amber-600 text-white border-none rounded-xl font-bold"
          >
            {loading ? "Signing in..." : "1-Click Demo Login (VIP Athlete)"}
          </button>
        </div>

        <div className="divider text-xs text-gray-400">OR SIGN IN WITH CREDENTIALS</div>

        {error && (
          <div className="alert alert-error text-xs text-white rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-gray-200 p-8 rounded-3xl shadow-sm">
          <div className="form-control">
            <label className="label text-xs font-bold text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
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
              className="input bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#FF4240]"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl font-bold py-3 text-base shadow-lg shadow-red-500/20"
          >
            {loading ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-500">
          Don&apos;t have an account yet?{" "}
          <Link href="/auth/signup" className="text-[#FF4240] font-bold hover:underline">
            Register for Free
          </Link>
        </p>
      </main>

      <Footer />
    </div>
  );
}
