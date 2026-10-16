import HeroBanner from "@/components/HeroBanner";
import Navbar from "@/components/Navbar";
import ProgressStats from "@/components/ProgressStats";
import ProgramSection from "@/components/ProgramSection";
import ProductsSection from "@/components/ProductsSection";
import FaqSection from "@/components/FaqSection";
import ContactSection from "@/components/ContactSection";
import SocialSection from "@/components/SocialSection";
import Footer from "@/components/Footer";
import ClubStory from "@/components/ClubStory";

/**
 * The homepage no longer calls /api/seed on mount. That was an unauthenticated
 * GET that wrote to the database and could be triggered by a crawler or a
 * cross-site prefetch. The catalogue is seeded deliberately instead — see
 * scripts/seed.ts.
 */
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />
      <main id="main" className="flex-1">
        <HeroBanner />
        <ProgressStats />
        <ProgramSection />
        <ClubStory />
        <ProductsSection />
        <SocialSection />
        <FaqSection />
        <ContactSection />
      </main>
      <Footer />
    </div>
  );
}