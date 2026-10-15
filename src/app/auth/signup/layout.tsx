import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

export const metadata: Metadata = pageMetadata(
  "Create an Account",
  "Create your Apex Hockey athlete profile for camps, tickets and member gear pricing.",
  "/auth/signup",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
