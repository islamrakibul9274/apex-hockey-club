import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ subject?: string }>;
}) {
  const { subject = "" } = await searchParams;
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="flex-1">
        <header className="apex-container py-10">
          <div className="apex-page-intro space-y-4">
            <p className="apex-eyebrow">CONTACT THE CLUB</p>
            <h1>
              A QUESTION?
              <br />
              <span className="text-brand-600">LET’S TALK.</span>
            </h1>
            <p className="text-ink-600">
              Programs, equipment, or a place in the stands. Tell us what you
              have in mind and we’ll help you take the next step.
            </p>
          </div>
        </header>
        <ContactSection key={subject} initialSubject={subject} />
      </main>
      <Footer />
    </div>
  );
}
