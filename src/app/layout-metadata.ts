import type { Metadata } from "next";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/navigation";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Camps, Match Passes & Equipment`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "ice hockey",
    "hockey camps",
    "youth hockey",
    "hockey coaching",
    "hockey equipment",
    "ice rink booking",
    "hockey match tickets",
  ],
  authors: [{ name: SITE_NAME }],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Camps, Match Passes & Equipment`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/images/hero-action-wide.webp",
        width: 1600,
        height: 900,
        alt: "Ice hockey player in an orange jersey carrying the puck past the net",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Camps, Match Passes & Equipment`,
    description: SITE_DESCRIPTION,
    images: ["/images/hero-action-wide.webp"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: "/" },
};

/** Per-page metadata helper so every route states its own title and summary. */
export function pageMetadata(title: string, description: string, path: string): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: path,
      images: [
        {
          url: "/images/hero-action-wide.webp",
          width: 1600,
          height: 900,
          alt: title,
        },
      ],
    },
  };
}