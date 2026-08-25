"use client";

import React, { useState } from "react";
import Image from "next/image";

interface FaqItem {
  id: string;
  title: string;
  content: string;
}

const FAQS: FaqItem[] = [
  {
    id: "faq-1",
    title: "What gear is required for beginner & junior hockey camps?",
    content:
      "All beginner skaters receive a full protective starter kit including an approved CSA/HECC helmet with cage, shoulder & elbow pads, hockey gloves, shin guards, and hockey skates. You only need to bring warm athletic apparel and a water bottle.",
  },
  {
    id: "faq-2",
    title: "How does the private coaching and 1-on-1 ice time work?",
    content:
      "Private lessons are scheduled with our Olympic and NHL-certified coaches during dedicated private ice hours. Lessons include video biomechanics analysis, tailored stick-handling drills, and stride optimization.",
  },
  {
    id: "faq-3",
    title: "Can I book arena match tickets and reserve seating online?",
    content:
      "Yes! You can reserve single match passes, VIP glass seats, or full-season tournament passes directly through our 'Get Ticket' portal with instant seat confirmation and mobile QR pass generation.",
  },
  {
    id: "faq-4",
    title: "What is your refund and training rescheduling policy?",
    content:
      "We offer flexible 100% refunds on camp registrations up to 7 days before start date, and match tickets can be transferred or rescheduled to any alternative regular-season fixture with zero penalty fees.",
  },
  {
    id: "faq-5",
    title: "Do you offer equipment sharpening and composite repair?",
    content:
      "Our Pro Shop on-site provides precision radius of hollow skate sharpening (1/2\", 5/8\", 3/4\"), blade profiling, and professional composite stick repair services with 24-hour turnaround.",
  },
  {
    id: "faq-6",
    title: "Are memberships available for teams and clubs?",
    content:
      "Yes, we provide specialized Team & Club Academy tiers that include dedicated weekly ice slots, customized team jerseys, coach clinic certifications, and discounted bulk equipment orders.",
  },
];

export default function FaqSection() {
  const [openId, setOpenId] = useState<string>("faq-1");

  return (
    <section className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center space-y-3 my-8 py-8 border-dashed border-2 border-l-0 border-r-0 border-gray-200">
        <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
          Knowledge Base
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Clients Question
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Dit amet consectetur. Condimentum dignissim adipiscing aliquam turpis placerat <br className="hidden sm:inline" /> dolor. Purus urna in sit nullam proin.
        </p>
      </div>

      {/* Accordion + Image Container */}
      <div className="flex items-center flex-col lg:flex-row gap-10 p-6 sm:p-10 lg:border-2 border-gray-100 rounded-3xl bg-white shadow-sm">
        <div className="w-full lg:w-5/12 flex justify-center">
          <div className="relative w-full max-w-sm rounded-2xl overflow-hidden bg-slate-50 p-4 border border-gray-100 shadow-inner">
            <Image
              src="/images/11.png"
              alt="Hockey FAQ athlete illustration"
              width={460}
              height={460}
              className="w-full h-auto object-contain rounded-xl"
            />
            <div className="absolute bottom-6 left-6 right-6 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl text-xs space-y-1">
              <p className="font-extrabold text-amber-300">Need Immediate Help?</p>
              <p className="text-slate-300">Our concierge desk is open 7 days a week at the Main Arena.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-7/12 divide-y divide-gray-100 space-y-2">
          {FAQS.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className="pt-2 transition-colors rounded-2xl"
              >
                <button
                  onClick={() => setOpenId(isOpen ? "" : faq.id)}
                  className="w-full flex items-center justify-between py-4 text-left font-extrabold text-base sm:text-lg text-gray-900 hover:text-[#FF4240] transition-colors"
                >
                  <span>{faq.title}</span>
                  <span className={`text-xl transition-transform duration-200 ${isOpen ? "rotate-45 text-[#FF4240]" : "text-gray-400"}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed animate-in fade-in slide-in-from-top-1">
                    <p>{faq.content}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
