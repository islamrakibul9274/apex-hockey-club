import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

/** Shared contact-route metadata. */
export const metadata: Metadata = pageMetadata(
  "Contact",
  "Ask about Apex Hockey programmes, private ice time, team bookings or equipment.",
  "/contact",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
