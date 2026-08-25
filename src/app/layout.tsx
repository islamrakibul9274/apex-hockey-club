import type { Metadata } from "next";
import { Manrope, Poppins } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import AiCoachWidget from "@/components/AiCoachWidget";

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

export const metadata: Metadata = {
  title: "Hockey's | Elite Club, Camps & Professional Equipment",
  description:
    "International ice hockey development camps, Olympic-grade coaching, pro tournament match passes, and composite performance equipment.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body
        className={`${manrope.className} ${manrope.variable} ${poppins.variable} antialiased bg-white text-gray-900 selection:bg-red-100 selection:text-[#FF4240]`}
      >
        <AuthProvider>
          <CartProvider>
            {children}
            <CartDrawer />
            <AiCoachWidget />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
