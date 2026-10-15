import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

/**
 * Route metadata lives in a layout because products/page.tsx is a Client
 * Component, and Next.js does not allow exporting `metadata` from one.
 */
export const metadata: Metadata = pageMetadata(
  "Equipment Store",
  "Composite sticks, tuned skates and certified protective gear for every level of ice hockey.",
  "/products",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
