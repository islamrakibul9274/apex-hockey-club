"use client";

import React from "react";
import { FaTwitter, FaFacebookF, FaInstagram, FaGithub, FaUsers, FaMedal, FaRss } from "react-icons/fa6";

export default function SocialSection() {
  return (
    <section className="px-4 sm:px-6 lg:px-8 my-10">
      <div className="bg-gradient-to-br from-gray-900 to-slate-900 text-white p-8 sm:p-12 rounded-3xl shadow-xl space-y-8">
        <div className="text-center space-y-2">
          <span className="badge bg-[#FF4240] text-white border-none font-bold text-xs uppercase tracking-widest px-3 py-2">
            Global Community
          </span>
          <h3 className="font-extrabold text-3xl text-white">
            Connect With Hockey&apos;s Worldwide
          </h3>
          <p className="text-slate-400 text-sm max-w-xl mx-auto">
            Join over 45,000 active athletes, alumni, coaches, and passionate hockey fans sharing training reels, match clips, and gear reviews.
          </p>
        </div>

        {/* Social Badges Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white/10 hover:bg-[#FF4240] backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 group"
          >
            <FaTwitter className="text-2xl text-slate-300 group-hover:text-white" />
            <span className="font-bold text-xs">@ApexHockey</span>
            <span className="text-[10px] text-slate-400 group-hover:text-white">18.4K Followers</span>
          </a>

          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white/10 hover:bg-[#FF4240] backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 group"
          >
            <FaFacebookF className="text-2xl text-slate-300 group-hover:text-white" />
            <span className="font-bold text-xs">Apex Hockey Club</span>
            <span className="text-[10px] text-slate-400 group-hover:text-white">24.2K Likes</span>
          </a>

          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white/10 hover:bg-[#FF4240] backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 group"
          >
            <FaInstagram className="text-2xl text-slate-300 group-hover:text-white" />
            <span className="font-bold text-xs">@apex.hockey</span>
            <span className="text-[10px] text-slate-400 group-hover:text-white">52.8K Followers</span>
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="p-4 bg-white/10 hover:bg-[#FF4240] backdrop-blur-md rounded-2xl flex flex-col items-center justify-center space-y-2 transition-all hover:scale-105 group"
          >
            <FaGithub className="text-2xl text-slate-300 group-hover:text-white" />
            <span className="font-bold text-xs">Apex Dev Open</span>
            <span className="text-[10px] text-slate-400 group-hover:text-white">Open Source Hub</span>
          </a>
        </div>

        {/* Proof metrics */}
        <div className="flex flex-wrap justify-center gap-8 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <FaUsers className="text-[#FF4240]" /> 45,000+ Club Athletes
          </div>
          <div className="flex items-center gap-2">
            <FaMedal className="text-amber-400" /> 14 Championship Trophies
          </div>
          <div className="flex items-center gap-2">
            <FaRss className="text-emerald-400" /> Live Match Stream Coverage
          </div>
        </div>
      </div>
    </section>
  );
}
