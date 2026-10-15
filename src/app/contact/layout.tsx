import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

/**
 * Route metadata lives in a layout because contact/page.tsx is a Client
 * Component, and Next.js does not allow exporting `metadata` from one.
 */
export const metadata: Metadata = pageMetadata(
  "Contact",
  "Ask about Apex Hockey programmes, private ice time, team bookings or equipment.",
  "/contact",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
