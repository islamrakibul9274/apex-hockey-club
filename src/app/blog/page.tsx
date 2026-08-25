"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_BLOG_POSTS } from "@/lib/mockData";
import { FaClock, FaArrowRight, FaTag } from "react-icons/fa6";

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState("All");

  const allTags = ["All", "Shooting", "Drills", "Skates", "Maintenance", "Nutrition", "Recovery"];

  const filtered =
    selectedTag === "All"
      ? INITIAL_BLOG_POSTS
      : INITIAL_BLOG_POSTS.filter((b) => b.tags.includes(selectedTag));

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
            Insights & Guides
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Apex Hockey Training & Gear Blog
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Professional skills drills, skate sharpening science, game-day sports nutrition, and gear breakdowns written by Olympic coaches.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-1.5 rounded-2xl text-xs font-bold transition-all ${
                  selectedTag === tag
                    ? "bg-[#FF4240] text-white shadow-md"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((post) => (
            <article
              key={post.id}
              className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <Link href={`/blog/${post.slug}`} className="block relative h-52 bg-slate-900 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="badge bg-[#FF4240] text-white border-none font-bold text-xs">
                      {post.category}
                    </span>
                  </div>
                </Link>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <FaClock /> {post.readTime}
                    </span>
                    <span>•</span>
                    <span>{post.publishedAt}</span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-extrabold text-gray-900 group-hover:text-[#FF4240] transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-gray-100 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-xs text-gray-900">{post.author.name}</p>
                    <p className="text-[10px] text-gray-400">{post.author.role}</p>
                  </div>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="btn btn-circle btn-sm bg-gray-100 group-hover:bg-[#FF4240] group-hover:text-white border-none transition-all"
                  aria-label="Read article"
                >
                  <FaArrowRight className="text-xs" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
