import { Manrope, Poppins } from "next/font/google";
import "./globals.css";
import CartDrawer from "@/components/CartDrawer";
import AiCoachWidget from "@/components/AiCoachWidget";
import AppProviders from "@/components/AppProviders";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export { metadata } from "./layout-metadata";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${manrope.className} ${manrope.variable} ${poppins.variable} antialiased bg-surface-0 text-ink-900`}
      >
        {/* Providers live inside an error boundary so a failure in the cart or
            auth context degrades to a recoverable message rather than a blank
            page. */}
        <AppProviders>
          {children}
          <CartDrawer />
          <AiCoachWidget />
        </AppProviders>
      </body>
    </html>
  );
}
