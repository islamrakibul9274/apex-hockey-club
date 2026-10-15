import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

export const metadata: Metadata = pageMetadata(
  "Reset Your Password",
  "Request a password reset link for your Apex Hockey account.",
  "/auth/forgot-password",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
