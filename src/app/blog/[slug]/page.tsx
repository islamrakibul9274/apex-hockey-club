import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FaClock, FaArrowLeft } from "react-icons/fa6";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { INITIAL_BLOG_POSTS } from "@/lib/mockData";
import Image from "next/image";
import { SIZES } from "@/lib/images";

/**
 * Rendered on the server and prerendered per post.
 *
 * Previously `"use client"` with useParams, which meant no crawlable HTML for
 * the blog's primary SEO surface and a 122 kB first load for a text page.
 */
export function generateStaticParams() {
  return INITIAL_BLOG_POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = INITIAL_BLOG_POSTS.find((p) => p.slug === params.slug);
  if (!post) return { title: "Not found" };
  return {
    title: `${post.title} — Apex Hockey Club`,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [{ url: post.image, alt: post.title }],
    },
  };
}

/**
 * The stored bodies contain light Markdown. Previously they were dumped into a
 * `whitespace-pre-line` div, so visitors saw literal `###` and `**`.
 */
function renderBody(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => ({
      heading: block.startsWith("###"),
      text: block
        .replace(/^###\s*/, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/^[-*]\s*/, "")
        .trim(),
    }));
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = INITIAL_BLOG_POSTS.find((p) => p.slug === params.slug);
  // Unknown slug is a 404. It previously served the first article with a 200.
  if (!post) notFound();

  const blocks = renderBody(post.content);

  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <Navbar />

      <main id="main" className="container mx-auto flex-1 px-4 py-12 sm:px-6 lg:px-8">
        <article className="mx-auto w-full max-w-3xl">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink-600 transition-colors hover:text-brand-600"
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            All coaching guides
          </Link>

          <header className="mt-6">
            <span className="inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-600">
              {post.category}
            </span>
            <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-4xl">
              {post.title}
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-ink-600">{post.excerpt}</p>

            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 border-y border-line-200 py-4 text-sm text-ink-500">
              <span className="font-semibold text-ink-700">{post.author.name}</span>
              <span>{post.author.role}</span>
              <span className="inline-flex items-center gap-1.5">
                <FaClock aria-hidden="true" className="text-xs" />
                {post.readTime}
              </span>
            </div>
          </header>

          <Image
            src={post.image}
            alt={post.title}
            width={1000}
            height={750}
            sizes={SIZES.banner}
            className="mt-8 aspect-[4/3] w-full rounded-2xl border border-line-200 object-cover"
          />

          <div className="mt-8 space-y-5">
            {blocks.map((block, i) =>
              block.heading ? (
                <h2 key={i} className="pt-2 text-xl font-bold text-ink-900">
                  {block.text}
                </h2>
              ) : (
                <p key={i} className="leading-relaxed text-ink-600">
                  {block.text}
                </p>
              )
            )}
          </div>

          <footer className="mt-10 border-t border-line-200 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">Topics</h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <li key={tag}>
                  <Link
                    href={`/blog?tag=${encodeURIComponent(tag)}`}
                    className="inline-block rounded-full border border-line-200 bg-surface-50 px-3 py-1 text-xs font-semibold text-ink-600 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                  >
                    {tag}
                  </Link>
                </li>
              ))}
            </ul>
          </footer>
        </article>
      </main>

      <Footer />
    </div>
  );
}