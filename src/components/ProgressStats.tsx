"use client";

import React from "react";
import { FaPersonRunning, FaAward, FaCrown, FaBuildingColumns } from "react-icons/fa6";

const stats = [
  {
    value: 87,
    color: "#FF4240",
    title: "Prayer Facility",
    description: "Dedicated tranquil spaces for meditation and pre-game athletic focus.",
    icon: FaBuildingColumns,
  },
  {
    value: 95,
    color: "#49D293",
    title: "Experienced Coaches",
    description: "Certified Olympic and NHL veterans guiding player development.",
    icon: FaCrown,
  },
  {
    value: 90,
    color: "#FFB546",
    title: "Senior Players",
    description: "Active national champions & elite mentors on the ice every week.",
    icon: FaAward,
  },
  {
    value: 80,
    color: "#4C8DF1",
    title: "Training Grounds",
    description: "Dual Olympic-size indoor ice arenas with climate-controlled rinks.",
    icon: FaPersonRunning,
  },
];

export default function ProgressStats() {
  return (
    <section id="about" className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Section Header */}
      <div className="text-center space-y-3 my-8 py-8 border-dashed border-2 border-l-0 border-r-0 border-gray-200">
        <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
          Club Standards
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Professional Hockeys Club
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Dit amet consectetur. Condimentum dignissim adipiscing aliquam turpis placerat <br className="hidden sm:inline" /> dolor. Purus urna in sit nullam proin.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-2">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4 group"
            >
              <div className="relative">
                <div
                  className="radial-progress font-black text-xl transition-all duration-500"
                  style={{
                    // @ts-expect-error DaisyUI radial-progress CSS variable
                    "--value": stat.value,
                    "--size": "6.5rem",
                    "--thickness": "0.6rem",
                    color: stat.color,
                  }}
                  role="progressbar"
                >
                  <span className="text-gray-900 font-extrabold">{stat.value}%</span>
                </div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center text-xs shadow-md">
                  <Icon />
                </div>
              </div>

              <h3 className="text-xl font-extrabold text-gray-900 group-hover:text-[#FF4240] transition-colors">
                {stat.title}
              </h3>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
