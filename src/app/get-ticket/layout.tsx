import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

/**
 * Route metadata lives in a layout because get-ticket/page.tsx is a Client
 * Component, and Next.js does not allow exporting `metadata` from one.
 */
export const metadata: Metadata = pageMetadata(
  "Match Tickets",
  "Reserve seats for championship derbies and winter cup fixtures at Apex Hockey Arena.",
  "/get-ticket",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
