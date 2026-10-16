
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import {
} from "react-icons/fa6";

const COACHES = [
  {
    name: "Dave Miller",
    role: "Head Coach & Skills Director",
    bio: "Former Olympic team captain with over 15 years coaching professional European and North American youth league champions.",
    image: "/images/player-gear-thumb.webp",
    specialty: "Power Skating & Breakout Tactics",
  },
  {
    name: "Sarah Jenkins",
    role: "Director of Youth & Teen Development",
    bio: "National MVP and certified biomechanics specialist focused on edge agility, explosive speed, and tactical decision making.",
    image: "/images/goalie-watch-thumb.webp",
    specialty: "Agility & Shooting Precision",
  },
  {
    name: "Alexander Petrov",
    role: "Pro Masterclass & Goaltender Coach",
    bio: "NHL veteran goaltender bringing elite mental conditioning, butterfly save mechanics, and power play defensive strategy.",
    image: "/images/goalie-kneel-thumb.webp",
    specialty: "Goaltending & Defensive Schemes",
  },
];

const FACILITIES = [
  {
    title: "Olympic Ice Arena Rink 1",
    desc: "200ft x 85ft NHL-spec ice sheet equipped with high-efficiency rapid chilling and acoustic arena sound.",
    image: "/images/arena-empty-card.webp",
  },
  {
    title: "Off-Ice Athletic Performance Lab",
    desc: "Specialized synthetic ice shooting bays, plyometric turf, and heavy resistance training rigs.",
    image: "/images/hero-puck-card.webp",
  },
  {
    title: "Biomechanics & Video Analysis Suite",
    desc: "High-speed 240fps multi-angle cameras tracking skating stride efficiency and puck release speed.",
    image: "/images/team-action-card.webp",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
            The Apex Story
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-ink-900 tracking-tight">
            Building Champions on & off the Ice
          </h1>
          <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
            Founded with a passion for speed, precision, and athletic excellence, Apex Hockey Club stands as one of the premier ice hockey academies in the world.
          </p>
        </div>

        {/* Story & Philosophy Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-ink-900">
              A Legacy of High Performance & Integrity
            </h2>
            <p className="text-ink-600 leading-relaxed text-sm sm:text-base">
              At Apex Hockey, we believe elite hockey development requires more than just ice time. It demands structured biomechanical coaching, mental stamina training, and a deep culture of camaraderie and sportsmanship.
            </p>
            <p className="text-ink-600 leading-relaxed text-sm sm:text-base">
              From grassroots 6-year-old beginners stepping onto the rink for their very first glide to competitive junior athletes being drafted into professional leagues, our academy provides the roadmap for greatness.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-surface-50 rounded-2xl border border-line-200 space-y-1">
                <div className="text-2xl font-black text-brand-600">14+</div>
                <div className="text-xs font-bold text-ink-700">Tournament Cups</div>
              </div>
              <div className="p-4 bg-surface-50 rounded-2xl border border-line-200 space-y-1">
                <div className="text-2xl font-black text-brand-600">98.4%</div>
                <div className="text-xs font-bold text-ink-700">Player Advancement</div>
              </div>
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[380px] bg-surface-100">
            <Image
              src="/images/hero-action-wide.webp"
              alt="Apex Hockey Arena and Athletes"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent flex items-end p-8 text-white">
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Arena Headquarters</p>
                <h3 className="text-xl font-extrabold">Mohakhali Olympic Ice Center</h3>
                <p className="text-xs text-gray-300">Home of the Apex Predators Hockey Team</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coaching Roster */}
        <section id="coaches" className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
              Elite Leadership
            </span>
            <h2 className="text-3xl font-extrabold text-ink-900">Meet Our Certified Coaching Staff</h2>
            <p className="text-ink-600 text-sm max-w-xl mx-auto">
              Our coaching roster brings decades of Olympic, NHL, and international coaching credentials directly to your development.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {COACHES.map((c, i) => (
              <div
                key={i}
                className="bg-surface-0 border border-line-200 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 space-y-4 group"
              >
                <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-surface-100">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="apex-badge bg-brand-500 text-white border-none font-bold text-[10px]">
                      {c.specialty}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-extrabold text-ink-900 group-hover:text-brand-600 transition-colors">
                    {c.name}
                  </h3>
                  <p className="text-xs font-bold text-brand-600">{c.role}</p>
                  <p className="text-ink-600 text-xs leading-relaxed pt-2">{c.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Facilities Section */}
        <section className="space-y-8 pt-6">
          <div className="text-center space-y-2">
            <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
              State of the Art
            </span>
            <h2 className="text-3xl font-extrabold text-ink-900">World-Class Athletic Facilities</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FACILITIES.map((f, i) => (
              <div key={i} className="bg-surface-50 rounded-3xl p-6 space-y-4 border border-line-200">
                <div className="relative h-44 w-full rounded-2xl overflow-hidden bg-slate-200">
                  <Image src={f.image} alt={f.title} fill className="object-cover" />
                </div>
                <h3 className="text-lg font-extrabold text-ink-900">{f.title}</h3>
                <p className="text-xs text-ink-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Careers & Press Section */}
        <div id="careers" className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
          <div className="rounded-2xl border border-line-200 bg-surface-50 p-8 space-y-4">
            <h3 className="text-2xl font-extrabold">Join the Apex Coaching & Ops Team</h3>
            <p className="text-ink-500 text-sm leading-relaxed">
              We are actively hiring certified youth skills trainers, arena ice technicians, and sports physiotherapists for our upcoming season.
            </p>
            <Link
              href="/contact?subject=Careers"
              className="apex-btn bg-brand-500 hover:bg-brand-600 text-white border-none rounded-xl font-bold"
            >
              Submit Application
            </Link>
          </div>

          <div id="press" className="bg-surface-50 border border-line-200 rounded-3xl p-8 space-y-4">
            <h3 className="text-2xl font-extrabold text-ink-900">Press & Media Accreditation</h3>
            <p className="text-ink-600 text-sm leading-relaxed">
              Covering the National Championship? Download high-res team photography, brand guidelines, broadcast schedules, and apply for press passes.
            </p>
            <Link
              href="/contact?subject=Press%20Inquiry"
              className="apex-btn apex-btn-secondary border-line-300 text-ink-800 rounded-xl font-bold"
            >
              Request Press Access
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
