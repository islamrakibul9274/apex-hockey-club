"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_BLOG_POSTS } from "@/lib/mockData";

interface BlogPost {
  _id?: string;
  id?: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: { name: string; role: string; avatar: string };
  image: string;
  readTime: string;
  publishedAt: string;
  tags: string[];
}
import { FaClock, FaArrowRight, FaTag } from "react-icons/fa6";

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState("All");

  // The page previously filtered INITIAL_BLOG_POSTS in memory and never read
  // the database, so any post added through the CMS was invisible. It now
  // fetches, falling back to the seed catalogue only when the request fails.
  const [posts, setPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPosts() {
      try {
        const res = await fetch("/api/blog");
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        if (!cancelled && Array.isArray(data.posts)) {
          setPosts(data.posts as BlogPost[]);
        }
      } catch {
        if (!cancelled) {
          setLoadError("We could not load the latest posts. Showing our saved articles instead.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadPosts();
    return () => {
      cancelled = true;
    };
  }, []);

  // Derived from the data rather than hard-coded, so a tag that exists on a
  // post can always be filtered. "Training" was previously missing and so its
  // badge on a post led nowhere.
  const allTags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags)))];

  const filtered =
    selectedTag === "All" ? posts : posts.filter((b) => b.tags.includes(selectedTag));

  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
            Insights & Guides
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-ink-900 tracking-tight">
            Apex Hockey Training & Gear Blog
          </h1>
          <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
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
                    ? "bg-brand-500 text-white shadow-md"
                    : "bg-surface-100 text-ink-700 hover:bg-gray-200"
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
              className="bg-surface-0 border border-line-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <Link href={`/blog/${post.slug}`} className="block relative h-52 bg-surface-100 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="apex-badge bg-brand-500 text-white border-none font-bold text-xs">
                      {post.category}
                    </span>
                  </div>
                </Link>

                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-xs text-ink-500">
                    <span className="flex items-center gap-1">
                      <FaClock /> {post.readTime}
                    </span>
                    <span>•</span>
                    <span>{post.publishedAt}</span>
                  </div>

                  <Link href={`/blog/${post.slug}`}>
                    <h2 className="text-xl font-extrabold text-ink-900 group-hover:text-brand-600 transition-colors line-clamp-2 leading-snug">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-ink-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 border-t border-line-200 mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.author.avatar}
                    alt={post.author.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-bold text-xs text-ink-900">{post.author.name}</p>
                    <p className="text-[10px] text-ink-500">{post.author.role}</p>
                  </div>
                </div>

                <Link
                  href={`/blog/${post.slug}`}
                  className="apex-btn apex-btn-icon apex-btn-sm bg-surface-100 group-hover:bg-brand-500 group-hover:text-white border-none transition-all"
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
