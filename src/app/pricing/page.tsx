"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { FaCheck, FaCrown, FaShieldHalved, FaBolt } from "react-icons/fa6";

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const { user } = useAuth();

  const handleSubscribe = async (planName: string, price: number) => {
    setLoadingPlan(planName);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planName: `${planName} (${annual ? "Annual" : "Monthly"})`,
          price,
          type: "membership",
          customerEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  };

  const PLANS = [
    {
      name: "Junior Starter",
      tagline: "For youth skaters & grassroots beginners",
      monthlyPrice: 29,
      annualPrice: 280,
      badge: "Beginner",
      icon: FaShieldHalved,
      features: [
        "2x Weekly Public & Open Ice Access",
        "Free Skate Sharpening (1x / month)",
        "10% Discount on Official Store Equipment",
        "Access to Junior Camp Pre-Registrations",
        "Monthly Progress & Skill Report",
      ],
    },
    {
      name: "Pro Athlete",
      tagline: "For competitive league players & teen athletes",
      monthlyPrice: 69,
      annualPrice: 660,
      badge: "Most Popular",
      isPopular: true,
      icon: FaBolt,
      features: [
        "Unlimited Open Ice & Stick & Puck Sessions",
        "Free Bi-Weekly Precision Blade Profiling",
        "20% Discount on Official Store Equipment",
        "2 Free Regular-Season Match Tickets / Month",
        "Access to Video Biomechanics Analysis Lab",
        "Priority Coach Booking & Clinic Access",
      ],
    },
    {
      name: "Elite Champion",
      tagline: "For national tournament & professional players",
      monthlyPrice: 129,
      annualPrice: 1240,
      badge: "VIP Full Access",
      icon: FaCrown,
      features: [
        "24/7 Unlimited Arena & High-Performance Gym Access",
        "Unlimited Free Skate Sharpening & Composite Repairs",
        "30% VIP Discount on All Equipment & Gear",
        "VIP Glass Row Match Passes to All Home Games",
        "Dedicated 1-on-1 Monthly Session with Lead Coach",
        "Personalized Off-Ice Athletic Nutrition Protocol",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
            Membership Plans
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Transparent Pricing for Every Hockey Goal
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Gain unlimited arena ice access, pro coach masterclasses, VIP match tickets, and gear discounts with an Apex Hockey membership.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <span className={`text-sm font-bold ${!annual ? "text-gray-900" : "text-gray-400"}`}>
              Monthly Billing
            </span>
            <input
              type="checkbox"
              className="toggle toggle-error bg-gray-200"
              checked={annual}
              onChange={() => setAnnual(!annual)}
            />
            <span className={`text-sm font-bold flex items-center gap-1.5 ${annual ? "text-gray-900" : "text-gray-400"}`}>
              Annual Billing
              <span className="badge badge-sm bg-emerald-500 text-white font-extrabold text-[10px]">
                SAVE 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            const period = annual ? "/ year" : "/ month";

            return (
              <div
                key={plan.name}
                className={`bg-white rounded-3xl p-8 transition-all duration-300 flex flex-col justify-between relative ${
                  plan.isPopular
                    ? "border-2 border-[#FF4240] shadow-2xl shadow-red-500/10 scale-105"
                    : "border border-gray-200 shadow-sm hover:shadow-xl"
                }`}
              >
                {plan.isPopular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="badge bg-[#FF4240] text-white border-none font-bold text-xs px-4 py-3 uppercase tracking-wider shadow-md">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#FF4240] flex items-center justify-center text-2xl">
                      <Icon />
                    </div>
                    {!plan.isPopular && (
                      <span className="badge badge-ghost text-gray-600 font-bold text-xs">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-extrabold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-500 text-xs mt-1">{plan.tagline}</p>
                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">${price}</span>
                    <span className="text-gray-500 text-sm font-semibold">{period}</span>
                  </div>

                  <div className="border-t border-gray-100 pt-6 space-y-3">
                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">What&apos;s Included:</p>
                    {plan.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-gray-600">
                        <FaCheck className="text-[#FF4240] text-xs mt-1 flex-shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8">
                  <button
                    onClick={() => handleSubscribe(plan.name, price)}
                    disabled={loadingPlan === plan.name}
                    className={`btn btn-block rounded-2xl font-bold py-3 transition-all ${
                      plan.isPopular
                        ? "bg-[#FF4240] hover:bg-[#e03735] text-white border-none shadow-lg shadow-red-500/20"
                        : "btn-outline border-gray-300 text-gray-800 hover:bg-gray-900 hover:border-gray-900 hover:text-white"
                    }`}
                  >
                    {loadingPlan === plan.name ? "Redirecting to Stripe..." : `Get Started with ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Guarantee Banner */}
        <div className="bg-slate-50 border border-gray-200 rounded-3xl p-8 max-w-3xl mx-auto text-center space-y-3">
          <h4 className="font-extrabold text-lg text-gray-900">14-Day On-Ice Satisfaction Guarantee</h4>
          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
            If you don&apos;t experience measurable improvements in skating agility and shooting power within your first 2 weeks, we will provide a 100% refund with zero questions asked.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
