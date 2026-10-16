import Link from "next/link";
import LogoMark from "@/components/Logo";
import { ArrowUpRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="apex-footer">
      <div className="apex-container">
        <div className="apex-footer-main">
          <div className="apex-footer-brand">
            <Link
              href="/"
              aria-label="Apex Hockey Club home"
              className="flex items-center gap-3"
            >
              <LogoMark className="h-10 w-10" />
              <span className="font-display text-3xl font-bold uppercase tracking-tight">
                APEX HOCKEY
              </span>
            </Link>
            <p>
              For the first strides, the next shift, and every moment in
              between. Find your place on the ice.
            </p>
            <Link href="/programs" className="apex-text-link mt-5">
              Make your next move <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </div>
          <div>
            <h3>On the ice</h3>
            <ul>
              <li>
                <Link href="/programs">Academy programs</Link>
              </li>
              <li>
                <Link href="/get-ticket">Match tickets</Link>
              </li>
              <li>
                <Link href="/pricing">Memberships</Link>
              </li>
              <li>
                <Link href="/products">Equipment shop</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>The club</h3>
            <ul>
              <li>
                <Link href="/about">About Apex</Link>
              </li>
              <li>
                <Link href="/blog">The hockey journal</Link>
              </li>
              <li>
                <Link href="/contact">Contact</Link>
              </li>
              <li>
                <Link href="/account">Member portal</Link>
              </li>
            </ul>
          </div>
          <div>
            <h3>Let’s talk hockey</h3>
            <a
              className="apex-footer-email"
              href="mailto:islamrakibul9274@gmail.com"
            >
              islamrakibul9274@gmail.com
            </a>
            <p className="mt-3 text-xs leading-relaxed text-ink-600">
              Questions about a program or a team booking? Send a message to the
              club.
            </p>
            <Link href="/contact" className="apex-text-link mt-4">
              Get in touch <ArrowUpRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="apex-footer-bottom">
          <p>
            © {new Date().getFullYear()} Apex Hockey Club. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-5">
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/waiver">Athletic waiver</Link>
          </nav>
        </div>
        <div className="apex-footer-wordmark" aria-hidden="true">
          SEE YOU ON THE ICE.
        </div>
      </div>
    </footer>
  );
}
