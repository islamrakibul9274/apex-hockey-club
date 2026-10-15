import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

/**
 * Route metadata lives in a layout because programs/page.tsx is a Client
 * Component, and Next.js does not allow exporting `metadata` from one.
 */
export const metadata: Metadata = pageMetadata(
  "Academy Programs",
  "Junior, teen and professional ice hockey development programmes built around real ice time.",
  "/programs",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
