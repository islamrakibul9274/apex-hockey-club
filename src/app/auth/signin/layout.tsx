import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

export const metadata: Metadata = pageMetadata(
  "Sign In",
  "Sign in to your Apex Hockey athlete account to view match passes and camp enrolments.",
  "/auth/signin",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
