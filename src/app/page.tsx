"use client";

import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import HeroBanner from "@/components/HeroBanner";
import ProgressStats from "@/components/ProgressStats";
import ProgramSection from "@/components/ProgramSection";
import ProductsSection from "@/components/ProductsSection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import SocialSection from "@/components/SocialSection";
import Footer from "@/components/Footer";

export default function Home() {
  useEffect(() => {
    // Proactively initialize & seed DB if necessary
    fetch("/api/seed").catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />
      <main className="container mx-auto flex-1 space-y-4">
        <HeroBanner />
        <ProgressStats />
        <ProgramSection />
        <ProductsSection />
        <FaqSection />
        <ContactSection />
        <SocialSection />
      </main>
      <Footer />
    </div>
  );
}
