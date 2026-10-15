import Link from "next/link";
import { FaArrowLeft, FaMagnifyingGlass } from "react-icons/fa6";
import { POPULAR_SEARCHES } from "@/lib/navigation";

/**
 * 404. Rendered on the server so unknown URLs return a real 404 status rather
 * than a soft fallback that serves unrelated content with HTTP 200.
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-surface-0">
      <main id="main" className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-lg text-center">
          <p className="font-display text-6xl font-extrabold tracking-tight text-brand-600">
            404
          </p>
          <h1 className="mt-3 text-2xl font-extrabold text-ink-900 sm:text-3xl">
            We couldn&apos;t find that page
          </h1>
          <p className="mt-3 leading-relaxed text-ink-600">
            The link may be out of date, or the page may have moved. Here are some ways back.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/" className="apex-btn apex-btn-primary">
              <FaArrowLeft aria-hidden="true" />
              Back to home
            </Link>
            <Link href="/products" className="apex-btn apex-btn-secondary">
              <FaMagnifyingGlass aria-hidden="true" />
              Browse the store
            </Link>
          </div>

          <nav aria-label="Popular searches" className="mt-10">
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-500">
              Popular searches
            </h2>
            <ul className="mt-3 flex flex-wrap justify-center gap-2">
              {POPULAR_SEARCHES.map((term) => (
                <li key={term}>
                  <Link
                    href={`/products?search=${encodeURIComponent(term)}`}
                    className="apex-badge transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-600"
                  >
                    {term}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </main>
    </div>
  );
}