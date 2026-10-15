/**
 * Club services offered to grassroots clubs, academies and sponsors.
 *
 * Kept in a lib module (rather than inside the page) so the footer can link to
 * every service from one source of truth.
 */

export interface ClubService {
  title: string;
  subtitle: string;
  description: string;
  highlights: string[];
  ctaText: string;
}

export const SERVICES: Record<string, ClubService> = {
  branding: {
    title: "Ice Hockey Club & Team Branding",
    subtitle: "Custom visual identity, crest design, mascot creation and tournament styleguides.",
    description:
      "We help grassroots clubs, national franchises and youth academies develop a world-class hockey visual identity. From Olympic-grade team crests to digital broadcast packages, we craft bold athletic aesthetics.",
    highlights: [
      "Custom vector club crests and secondary shoulder patches",
      "Full Pantone and hex sports colour palette development",
      "Merchandise, jersey and fan apparel mockups",
      "Official tournament broadcast lower-third graphics",
    ],
    ctaText: "Inquire about club branding",
  },
  design: {
    title: "Pro Match Jersey & Equipment Design",
    subtitle: "Sublimated pro-cut jerseys, sock patterns and goalie mask wraps.",
    description:
      "Engineered for airflow, stretch durability and striking visual dominance on the ice. Our design studio collaborates with professional equipment manufacturers to deliver bespoke jerseys and custom gear.",
    highlights: [
      "Moisture-wicking breathable game jersey templates",
      "Reinforced double-elbow and tie-down strap designs",
      "Custom goaltender mask wrap illustrations",
      "Sponsor logo placement and regulatory league compliance",
    ],
    ctaText: "Request a jersey design quote",
  },
  marketing: {
    title: "Tournament & League Marketing",
    subtitle: "Fan engagement campaigns, ticket drop strategy and digital campaigns.",
    description:
      "Pack your arena stands with high-impact sports marketing. We manage ticket launch campaigns, highlight reel production, community outreach and season ticket drives.",
    highlights: [
      "Ticket launch funnels built for conversion",
      "On-ice highlight reels edited for short-form video",
      "Community outreach and school clinics",
      "Corporate sponsor tier packaging and decks",
    ],
    ctaText: "Schedule a marketing call",
  },
  advertisement: {
    title: "Dasher Board & Digital Advertising",
    subtitle: "High-visibility placement on the boards, the ice and the video wall.",
    description:
      "Showcase your brand to spectators in the building and to everyone watching the stream. Prime placements are available on dasher boards, in-ice logos and jumbotron replays.",
    highlights: [
      "Centre-ice and neutral-zone full-colour in-ice logos",
      "Premium illuminated dasher board perimeter placements",
      "4K video commercial slots during intermissions",
      "Match programme and digital ticket branding",
    ],
    ctaText: "Explore advertising packages",
  },
  coaching: {
    title: "Coach Certification & Masterclass Clinics",
    subtitle: "Train with Olympic-level coaches on tactics and biomechanics.",
    description:
      "Our clinics provide certified development modules for coaches at every competitive level: high-tempo practice design, video analysis breakdowns and positive sports psychology.",
    highlights: [
      "Level 1–4 youth and pro coach certification pathways",
      "Tactical powerplay, penalty kill and breakout systems",
      "Injury prevention and concussion recognition protocols",
      "Access to the Apex coach resource library",
    ],
    ctaText: "Register for a coaching clinic",
  },
  training: {
    title: "Ice Facility & Rink Rentals",
    subtitle: "Private ice bookings, shooting labs and off-ice gym hire.",
    description:
      "Book our indoor ice sheets for team practices, private tournaments or corporate events, with full arena lighting and sound.",
    highlights: [
      "NHL-specification resurfaced ice sheets",
      "Locker room access with private showers",
      "Off-ice synthetic turf and shooting bay access",
      "Digital scoreboard and optional referee staffing",
    ],
    ctaText: "Reserve ice facility time",
  },
};

/** Display order for navigation. */
export const SERVICE_SLUGS = Object.keys(SERVICES);