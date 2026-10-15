import type { Metadata } from "next";
import { pageMetadata } from "@/app/layout-metadata";

export const metadata: Metadata = pageMetadata(
  "Choose a New Password",
  "Set a new password for your Apex Hockey account.",
  "/auth/reset-password",
);

export default function RouteLayout(props: { children: React.ReactNode }) {
  return <>{props.children}</>;
}
