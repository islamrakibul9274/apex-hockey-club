import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { FaClock, FaArrowRight } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { INITIAL_BLOG_POSTS } from "@/lib/mockData";
import { connectToDatabase } from "@/lib/mongodb";
import BlogPost from "@/models/BlogPost";
import { SIZES, freshImage } from "@/lib/images";

/**
 * Rendered on the server and prerendered.
 *
 * Previously `"use client"`: it fetched posts in an effect, so the page arrived
 * empty, the payload was 6.4 kB of client JS, and the loading and error
 * states it computed were never actually rendered.
 *
 * Tags are derived from the data so a tag on a post can always be filtered —
 * "Training" was previously missing and its badge led nowhere.
 */

export const revalidate = 300;

interface Post {
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

export const metadata: Metadata = {
  title: "Coaching Guides",
  description:
    "Drills, equipment maintenance and game-day nutrition written by our Apex Hockey coaches.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Coaching Guides — Apex Hockey Club",
    description:
      "Drills, equipment maintenance and game-day nutrition written by our Apex Hockey coaches.",
    url: "/blog",
  },
};

async function getPosts(): Promise<Post[]> {
  try {
    const conn = await connectToDatabase();
    if (conn) {
      const posts = await BlogPost.find().sort({ publishedAt: -1 })
        .lean()
        .catch(() => null);
      if (posts && posts.length > 0) {
        return posts as unknown as Post[];
      }
    }
  } catch {
    // Fall through to the catalogue.
  }
  return INITIAL_BLOG_POSTS as unknown as Post[];
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const posts = await getPosts();
  const activeTag = (await searchParams)?.tag ?? "All";
  const tags = ["All", ...Array.from(new Set(posts.flatMap((p) => p.tags)))];
  const filtered =
    activeTag === "All" ? posts : posts.filter((p) => p.tags.includes(activeTag));

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Navbar />

      <main id="main" className="apex-container flex-1 space-y-10 py-12">
        <header className="apex-page-intro">
          <span className="apex-badge apex-badge-brand uppercase tracking-widest">
            Insights &amp; guides
          </span>
          <h1 className="mt-3">
            Coaching from our bench
          </h1>
          <p className="mt-4 leading-relaxed text-ink-600">
            Practical guides on shooting, skating, skate care and game-day nutrition — written by
            the coaches who run our programmes.
          </p>
        </header>

        {/* Tag filter. Rendered as links so it works without JavaScript. */}
        <nav aria-label="Filter by topic" className="flex flex-wrap justify-center gap-2">
          {tags.map((tag) => {
            const active = tag === activeTag;
            return (
              <Link
                key={tag}
                href={tag === "All" ? "/blog" : `/blog?tag=${encodeURIComponent(tag)}`}
                aria-current={active ? "true" : undefined}
                className={[
                  "apex-badge transition-colors",
                  active
                    ? "bg-brand-500 text-white"
                    : "border border-line-200 bg-surface-0 text-ink-600 hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600",
                ].join(" ")}
              >
                {tag}
              </Link>
            );
          })}
        </nav>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="text-xl font-bold text-ink-900">No guides for that topic yet</h2>
            <p className="mt-2 text-sm text-ink-600">
              Try another topic, or browse everything we have written.
            </p>
            <Link href="/blog" className="apex-btn apex-btn-primary apex-btn-sm mt-5">
              Show all guides
            </Link>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((post) => (
              <li key={post.slug}>
                <article className="apex-card flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-100">
                      <Image
                        src={freshImage(post.image)}
                        alt={post.title}
                        fill
                        sizes={SIZES.card}
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-center gap-3 text-xs text-ink-500">
                      <span className="apex-badge apex-badge-sm">{post.category}</span>
                      <span className="inline-flex items-center gap-1.5">
                        <FaClock aria-hidden="true" className="text-xs" />
                        {post.readTime}
                      </span>
                    </div>

                    <h2 className="mt-3 text-lg font-bold leading-snug">
                      <Link href={`/blog/${post.slug}`} className="hover:text-brand-600">
                        {post.title}
                      </Link>
                    </h2>

                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-600">
                      {post.excerpt}
                    </p>

                    <div className="mt-4 flex items-center justify-between border-t border-line-200 pt-4">
                      <div>
                        <p className="text-sm font-semibold text-ink-900">{post.author.name}</p>
                        <p className="text-xs text-ink-500">{post.publishedAt}</p>
                      </div>
                      <Link
                        href={`/blog/${post.slug}`}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 hover:underline"
                      >
                        Read
                        <FaArrowRight aria-hidden="true" className="text-xs" />
                      </Link>
                    </div>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </div>
  );
}