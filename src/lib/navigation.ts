/**
 * Shared navigation data.
 *
 * Kept out of the Navbar component so server components (the 404 page) can
 * reuse it without pulling the client bundle in.
 */

export interface NavChild {
  label: string;
  href: string;
  description: string;
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavChild[];
}

export const NAV: NavItem[] = [
  {
    label: "Programs",
    href: "/programs",
    children: [
      {
        label: "Junior Development",
        href: "/programs#prog-junior",
        description: "Ages 6–12. Fundamentals, confidence and fun on the ice.",
      },
      {
        label: "Teen Academy",
        href: "/programs#prog-teen",
        description: "Ages 13–17. Competitive structure and position play.",
      },
      {
        label: "Professional Masterclass",
        href: "/programs#prog-pro",
        description: "Senior squads. Tactics, video work and powerplay systems.",
      },
    ],
  },
  {
    label: "Shop",
    href: "/products",
    children: [
      {
        label: "All equipment",
        href: "/products",
        description: "Sticks, skates, helmets and protective gear.",
      },
      {
        label: "Memberships",
        href: "/pricing",
        description: "Season-long access to programmes and member pricing.",
      },
    ],
  },
  { label: "Tickets", href: "/get-ticket" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const POPULAR_SEARCHES = [
  "CarbonFlex",
  "Vapor Skates",
  "Helmet",
  "Goalie gloves",
  "Chest protector",
];

/** Canonical origin for metadata, from the configured AUTH_URL. */
export const SITE_URL =
  process.env.AUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE_NAME = "Apex Hockey Club";

export const SITE_DESCRIPTION =
  "Ice hockey development camps, Olympic-grade coaching, tournament match passes and composite performance equipment.";