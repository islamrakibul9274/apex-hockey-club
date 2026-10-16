import { freshImage } from "@/lib/images";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ClubStory from "@/components/ClubStory";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const VALUES = [
  {
    title: "Start where you are.",
    body: "New to hockey? Start with the fundamentals. Our junior pathway introduces skating, stick handling, and teamwork.",
    image: "/images/team-action-card.webp",
    href: "/programs#prog-junior",
  },
  {
    title: "Keep moving forward.",
    body: "Build on what you know. Explore the teen and adult pathways for more structured, focused training.",
    image: "/images/team-duel-card.webp",
    href: "/programs#prog-teen",
  },
  {
    title: "Share the game.",
    body: "Hockey brings people together. Find a match, bring your people, and experience the action from the stands.",
    image: "/images/arena-empty-card.webp",
    href: "/get-ticket",
  },
];
export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        <header className="apex-container py-10">
          <div className="apex-page-intro space-y-4">
            <p className="apex-eyebrow">THIS IS APEX HOCKEY</p>
            <h1>
              FOR THE LOVE
              <br />
              <span className="text-brand-600">OF THE GAME.</span>
            </h1>
            <p className="text-ink-600">
              A place for people who love hockey. Explore the academy, find your
              equipment, and make room for more time on the ice.
            </p>
          </div>
        </header>
        <ClubStory />
        <section id="coaches" className="apex-container apex-section">
          <div className="apex-section-heading">
            <div>
              <p className="apex-eyebrow">THE WAY WE PLAY</p>
              <h2 className="apex-display mt-4">
                PROGRESS STARTS
                <br />
                WITH <span>SHOWING UP.</span>
              </h2>
            </div>
            <Link href="/programs" className="apex-text-link">
              Find your pathway <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </div>
          <div className="apex-journal">
            {VALUES.map((v) => (
              <article key={v.title}>
                <div className="apex-journal-photo">
                  <Image
                    src={freshImage(v.image)}
                    alt="Ice hockey players at an indoor rink"
                    fill
                    sizes="(max-width:767px) 100vw,33vw"
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-5">{v.title}</h3>
                <p>{v.body}</p>
                <Link href={v.href} className="apex-text-link">
                  Explore <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="apex-container grid gap-5 pb-16 md:grid-cols-2">
          <div id="careers" className="apex-card p-8 scroll-mt-24">
            <p className="apex-eyebrow">WORK WITH THE CLUB</p>
            <h2 className="mt-3 text-xl font-extrabold">
              Bring your experience to the ice.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              Interested in coaching or supporting the club? Get in touch to ask
              about opportunities and tell us about your experience.
            </p>
            <Link
              className="apex-text-link mt-5"
              href="/contact?subject=Careers"
            >
              Start a conversation <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div id="press" className="apex-card p-8 scroll-mt-24">
            <p className="apex-eyebrow">PRESS & PARTNERSHIPS</p>
            <h2 className="mt-3 text-xl font-extrabold">
              Let’s make something happen.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-600">
              For media enquiries, club collaborations, and team bookings, send
              us a message with the details of your project.
            </p>
            <Link
              className="apex-text-link mt-5"
              href="/contact?subject=Press%20Inquiry"
            >
              Contact Apex <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
