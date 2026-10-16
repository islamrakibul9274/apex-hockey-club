import { freshImage } from "@/lib/images";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";

export default function ClubStory() {
  return (
    <section className="apex-story-band">
      <div className="apex-container apex-story">
        <div className="apex-story-photo">
          <Image
            src={freshImage("/images/arena-empty-card.webp")}
            alt="Overhead view of two hockey teams lining up for a face-off"
            fill
            sizes="(max-width:767px) 100vw, 50vw"
            className="object-cover"
          />
          <span>ONE GAME. ENDLESS POSSIBILITIES.</span>
        </div>
        <div className="apex-story-copy">
          <p className="apex-eyebrow">MORE THAN A GAME</p>
          <h2 className="apex-display">
            A SHARED LOVE
            <br />
            FOR THE <span>ICE.</span>
          </h2>
          <p>
            The early starts. The extra lap. The feeling when a play comes
            together. Hockey is better when you have people to share it with.
          </p>
          <p>
            Make Apex part of your game, whether you’re here to learn, compete,
            or cheer from the stands.
          </p>
          <ul>
            {[
              "Programs for juniors, teens, and adults",
              "Equipment, match tickets, and memberships",
              "One account for your club bookings",
            ].map((t) => (
              <li key={t}>
                <Check size={16} aria-hidden="true" />
                {t}
              </li>
            ))}
          </ul>
          <Link href="/about" className="apex-text-link">
            Get to know Apex <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
