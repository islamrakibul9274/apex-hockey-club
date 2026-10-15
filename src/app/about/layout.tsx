import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

/**
 * Route metadata lives in a layout because about/page.tsx is a Client
 * Component, and Next.js does not allow exporting `metadata` from one.
 */
export const metadata: Metadata = pageMetadata(
  "About the Club",
  "Coaching staff, facilities and the standards behind Apex Hockey Club.",
  "/about",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
