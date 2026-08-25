"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { INITIAL_BLOG_POSTS } from "@/lib/mockData";
import { FaClock, FaCalendarDays, FaArrowLeft, FaShareNodes, FaTag } from "react-icons/fa6";

export default function BlogPostDetail() {
  const params = useParams();
  const slug = params?.slug as string;

  const post =
    INITIAL_BLOG_POSTS.find((p) => p.slug === slug) || INITIAL_BLOG_POSTS[0];

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 max-w-4xl space-y-8">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#FF4240] transition-colors"
        >
          <FaArrowLeft /> Back to Blog Articles
        </Link>

        {/* Title & Metadata */}
        <div className="space-y-4">
          <span className="badge bg-red-100 text-[#FF4240] font-extrabold text-xs px-3 py-2">
            {post.category}
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center justify-between gap-4 py-4 border-y border-gray-100 text-xs text-gray-500">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="font-bold text-gray-900 text-sm">{post.author.name}</p>
                <p className="text-gray-400">{post.author.role}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <FaCalendarDays className="text-[#FF4240]" /> {post.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <FaClock className="text-[#FF4240]" /> {post.readTime}
              </span>
            </div>
          </div>
        </div>

        {/* Cover Photo */}
        <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-lg bg-slate-900">
          <Image src={post.image} alt={post.title} fill className="object-cover" priority />
        </div>

        {/* Content Body */}
        <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6 pt-4">
          <p className="text-lg font-medium text-gray-900 leading-relaxed border-l-4 border-[#FF4240] pl-4 italic">
            {post.excerpt}
          </p>

          <div className="whitespace-pre-line text-sm sm:text-base space-y-4">
            {post.content}
          </div>
        </div>

        {/* Tags & Share */}
        <div className="pt-8 border-t border-gray-200 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FaTag className="text-gray-400 text-xs" />
            {post.tags.map((tag) => (
              <span key={tag} className="badge badge-sm bg-gray-100 text-gray-700 font-semibold">
                #{tag}
              </span>
            ))}
          </div>

          <button
            onClick={() => {
              if (navigator.clipboard) {
                navigator.clipboard.writeText(window.location.href);
                alert("Article link copied to clipboard!");
              }
            }}
            className="btn btn-sm btn-ghost text-gray-600 hover:text-[#FF4240] rounded-xl flex items-center gap-2"
          >
            <FaShareNodes /> Share Article
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
