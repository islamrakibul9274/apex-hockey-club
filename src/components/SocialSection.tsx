import { freshImage } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { INITIAL_BLOG_POSTS } from "@/lib/mockData";

export default function SocialSection() {
  return (
    <section
      className="apex-container apex-section border-t border-line-200"
      aria-labelledby="journal-heading"
    >
      <div className="apex-section-heading">
        <div>
          <p className="apex-eyebrow">THE HOCKEY JOURNAL</p>
          <h2 id="journal-heading" className="apex-display">
            STAY AHEAD
            <br />
            OF <span>THE GAME.</span>
          </h2>
        </div>
        <Link className="apex-text-link" href="/blog">
          All stories & guides <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </div>
      <div className="apex-journal">
        {INITIAL_BLOG_POSTS.slice(0, 3).map((p) => (
          <article key={p.id}>
            <Link
              href={`/blog/${p.slug}`}
              className="apex-journal-photo"
              aria-label={`Read ${p.title}`}
            >
              <Image
                src={freshImage(p.image)}
                alt="Hockey training and equipment on the ice"
                fill
                sizes="(max-width:767px) 100vw, 33vw"
                className="object-cover"
              />
            </Link>
            <small>
              {p.category} · {p.readTime}
            </small>
            <h3>
              <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            </h3>
            <p className="line-clamp-2">{p.excerpt}</p>
            <Link className="apex-text-link" href={`/blog/${p.slug}`}>
              Read the story <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
