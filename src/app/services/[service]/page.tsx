"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FaShieldHalved, FaCheck, FaArrowLeft, FaPhone } from "react-icons/fa6";

const SERVICES_DATA: Record<
  string,
  { title: string; subtitle: string; description: string; highlights: string[]; ctaText: string }
> = {
  branding: {
    title: "Ice Hockey Club & Team Branding",
    subtitle: "Custom visual identity, crest design, mascot creation, and tournament styleguides.",
    description:
      "We help grassroots clubs, national franchises, and youth academies develop world-class hockey visual identities. From Olympic-grade team crests to digital broadcast packages, we craft bold athletic aesthetics.",
    highlights: [
      "Custom vector club crests & secondary shoulder patches",
      "Full pantone & hex sports color palette development",
      "Merchandise, jersey, and fan apparel mockups",
      "Official tournament broadcast lower-third graphics",
    ],
    ctaText: "Inquire About Club Branding",
  },
  design: {
    title: "Pro Match Jersey & Equipment Design",
    subtitle: "Sublimated pro-cut jerseys, sock patterns, goalie mask wraps, and custom equipment.",
    description:
      "Engineered for airflow, stretch durability, and striking visual dominance on the ice. Our design studio collaborates with professional equipment manufacturers to deliver bespoke jerseys and custom gear.",
    highlights: [
      "Moisture-wicking breathable game jersey templates",
      "Reinforced double-elbow and tie-down strap designs",
      "Custom custom goaltender mask wrap illustrations",
      "Sponsor logo placement & regulatory league compliance",
    ],
    ctaText: "Request Jersey Design Quote",
  },
  marketing: {
    title: "Tournament & League Sports Marketing",
    subtitle: "Fan engagement campaigns, ticket drop strategies, and digital social media virality.",
    description:
      "Pack your arena stands with high-impact sports marketing. We manage digital ad campaigns, social reels creation, influencer player sponsorships, and season ticket drive promotions.",
    highlights: [
      "High-conversion ticket launch funnels",
      "On-ice dynamic highlight reels for TikTok & Instagram",
      "Local community grassroots outreach & school clinics",
      "Corporate sponsor tier packaging & presentation decks",
    ],
    ctaText: "Schedule Marketing Strategy Call",
  },
  advertisement: {
    title: "Arena Rink Dasher Board & Digital Advertising",
    subtitle: "High-visibility brand placement on Olympic ice rinks, dasher boards, and scoreboard video walls.",
    description:
      "Showcase your brand directly to thousands of passionate stadium spectators and live stream viewers. Prime placements available on dasher boards, ice logos, and jumbotron replays.",
    highlights: [
      "Center-ice and neutral zone full-color in-ice vinyl logos",
      "Premium illuminated dasher board perimeter placements",
      "Jumbotron 4K video commercial slots during intermissions",
      "Official match program and digital ticket branding",
    ],
    ctaText: "Explore Advertising Packages",
  },
  coaching: {
    title: "Coach Certification & Masterclass Clinics",
    subtitle: "Train with Olympic head coaches to master modern tactical systems and biomechanics.",
    description:
      "Our coaching clinics provide certified development modules for coaches at all competitive levels. Learn high-tempo practice design, video analysis breakdowns, and positive sports psychology.",
    highlights: [
      "Level 1-4 Youth & Pro Coach Certification pathways",
      "Tactical powerplay, PK & breakout playbook systems",
      "Injury prevention & concussion recognition protocols",
      "Access to Apex private coach resource library",
    ],
    ctaText: "Register for Coaching Clinic",
  },
  training: {
    title: "Olympic Ice Facility & Rink Rentals",
    subtitle: "Private ice sheet booking, shooting labs, and high-performance gym rentals.",
    description:
      "Rent our Olympic-dimension indoor ice sheets for team practices, private tournaments, corporate events, or professional film shoots with complete arena lighting and sound systems.",
    highlights: [
      "200ft x 85ft NHL-spec freshly resurfaced ice sheets",
      "Locker room access with private showers & dry saunas",
      "Off-ice synthetic turf & shooting bay access included",
      "Full digital scoreboard & referee staffing available",
    ],
    ctaText: "Reserve Ice Facility Time",
  },
  "mobile-app": {
    title: "Apex Hockey Mobile Companion App",
    subtitle: "Real-time match scores, training drills tracker, mobile barcode entry passes, and team chat.",
    description:
      "Available on iOS and Android. Download the official Apex Hockey app to manage your tickets, watch live match streams, and track your development camp progress on the go.",
    highlights: [
      "Instant turnstile contactless mobile barcode entry",
      "Personalized daily skills drills & workout logs",
      "Live tournament scoreboards & player stats",
      "Push notifications for ice schedule updates",
    ],
    ctaText: "Download on App Store & Google Play",
  },
  "desktop-app": {
    title: "Apex Hockey Video & Tactical Suite for Mac / Windows",
    subtitle: "Professional 240fps multi-angle video analysis and tactical playbook simulation for PC & Mac.",
    description:
      "Analyze your games like an NHL coaching staff. Draw tactical routes, calculate shot release velocity, and export breakdown clips with our desktop analysis software.",
    highlights: [
      "Native Apple Silicon & Windows 11 hardware acceleration",
      "Frame-by-frame skating stride angle measurement",
      "Team playbook 3D rink animated chalkboard",
      "Direct cloud sync with your Apex athlete profile",
    ],
    ctaText: "Download Desktop Suite",
  },
};

export default function ServiceDetailPage() {
  const params = useParams();
  const rawSlug = (params?.service as string) || "branding";
  const service = SERVICES_DATA[rawSlug] || SERVICES_DATA.branding;

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 max-w-4xl space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[#FF4240] transition-colors"
        >
          <FaArrowLeft /> Back to Home
        </Link>

        <div className="space-y-4">
          <span className="badge bg-red-100 text-[#FF4240] font-extrabold text-xs px-3 py-2 uppercase tracking-wider">
            Official Club Service
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight leading-tight">
            {service.title}
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">{service.subtitle}</p>
        </div>

        <div className="bg-slate-50 border border-gray-200 rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="prose max-w-none text-gray-700 leading-relaxed">
            <p className="text-base leading-relaxed">{service.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-3">
            <h3 className="font-extrabold text-lg text-gray-900">Service Deliverables & Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {service.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                  <FaCheck className="text-[#FF4240] mt-1 flex-shrink-0" />
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-wrap gap-4 items-center justify-between border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-400 font-bold uppercase">Ready to get started?</p>
              <p className="text-sm font-extrabold text-gray-900">Speak with an Apex Director</p>
            </div>

            <Link
              href={`/contact?subject=${encodeURIComponent(service.title)}`}
              className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl px-6 font-bold shadow-md shadow-red-500/20"
            >
              {service.ctaText}
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
