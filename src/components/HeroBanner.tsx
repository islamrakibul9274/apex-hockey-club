import { freshImage } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { ArrowDown, ArrowUpRight, MoveRight } from "lucide-react";

export default function HeroBanner() {
  return (
    <section
      className="apex-hero apex-container"
      aria-labelledby="hero-heading"
    >
      <div className="apex-hero-copy">
        <p className="apex-eyebrow">
          <span className="apex-status-dot" /> THE ICE IS CALLING
        </p>
        <h1 id="hero-heading">
          FIND YOUR
          <br />
          EDGE.
          <br />
          <span>OWN THE ICE.</span>
        </h1>
        <p className="apex-hero-description">
          First strides or next-level play. Find your program, build your
          confidence, and make your next move with Apex Hockey.
        </p>
        <div className="apex-hero-actions">
          <Link
            href="/programs"
            className="apex-btn apex-btn-primary apex-btn-lg"
          >
            Find your program <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/get-ticket" className="apex-text-link">
            Catch a game <MoveRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <div className="apex-hero-note">
          <span>ALL LEVELS. ONE SHARED PASSION.</span>
          <a href="#programs" aria-label="Explore the academy programs">
            <ArrowDown size={18} aria-hidden="true" />
          </a>
        </div>
      </div>
      <div className="apex-hero-visual">
        <Image
          src={freshImage("/images/hero-action-portrait.webp")}
          alt="A young hockey player in full protective gear skating across the ice"
          fill
          sizes="(max-width: 767px) 100vw, 55vw"
          className="object-cover"
          preload
        />
        <span className="apex-photo-label">THE GAME STARTS WITH YOU.</span>
        <div className="apex-hero-sticker" aria-hidden="true">
          MORE ICE.
          <br />
          MORE YOU.<span>↗</span>
        </div>
        <Link href="/programs" className="apex-hero-caption">
          <span>
            <small>YOUR NEXT CHAPTER</small>
            <strong>Starts on the ice.</strong>
          </span>
          <span className="apex-round-arrow">
            <ArrowUpRight size={23} aria-hidden="true" />
          </span>
        </Link>
      </div>
    </section>
  );
}
