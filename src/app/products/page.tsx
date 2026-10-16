"use client";
/* eslint-disable react-hooks/set-state-in-effect -- The visible search field follows navigation from the global search. */
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, RotateCcw } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ProductCard, ProductDetails } from "@/components/ProductCard";
import { INITIAL_PRODUCTS, type ProductData } from "@/lib/mockData";
import { Spinner } from "@/components/ui";

const CATEGORIES = [
  "All",
  "Sticks & Pucks",
  "Helmets & Pads",
  "Skates",
  "Accessories",
  "Apparel",
];

function ProductsContent() {
  const params = useSearchParams();
  const initialSearch = params.get("search") ?? "";
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState("featured");
  const [products, setProducts] = useState<ProductData[]>(INITIAL_PRODUCTS);
  const [selected, setSelected] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => setSearch(initialSearch), [initialSearch]);
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch("/api/products", { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok)
          throw new Error("We couldn’t load the equipment. Please try again.");
        const data = await r.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      })
      .catch((e) => {
        if (e.name !== "AbortError")
          setError("We couldn’t load the equipment. Please try again.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [attempt]);
  const visible = products
    .filter(
      (p) =>
        (category === "All" || p.category === category) &&
        `${p.title} ${p.description} ${p.category}`
          .toLowerCase()
          .includes(search.trim().toLowerCase()),
    )
    .sort((a, b) =>
      sort === "low"
        ? a.price - b.price
        : sort === "high"
          ? b.price - a.price
          : 0,
    );
  function reset() {
    setSearch("");
    setCategory("All");
    setSort("featured");
  }
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="main" className="apex-container flex-1 py-10">
        <header className="apex-page-intro space-y-4">
          <p className="apex-eyebrow">THE APEX EQUIPMENT ROOM</p>
          <h1>
            GEAR UP.
            <br />
            <span className="text-brand-600">GET OUT THERE.</span>
          </h1>
          <p className="text-ink-600">
            Find the sticks, skates, and protective gear for your next session.
            Explore the details, compare prices, and build your equipment bag.
          </p>
        </header>
        <div className="apex-store-toolbar">
          <div className="relative w-full sm:w-80">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500"
              aria-hidden="true"
            />
            <label className="sr-only" htmlFor="store-search">
              Search equipment
            </label>
            <input
              id="store-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sticks, skates, and more…"
              className="apex-input"
            />
          </div>
          <div className="flex items-center gap-3">
            <label htmlFor="store-sort" className="text-xs text-ink-600">
              Sort by
            </label>
            <select
              id="store-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="featured">Featured equipment</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>
        </div>
        <div className="apex-filter-tabs" aria-label="Filter equipment">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              className="apex-filter-tab"
              aria-pressed={category === c}
              onClick={() => setCategory(c)}
            >
              {c === "All" ? "All equipment" : c}
            </button>
          ))}
        </div>
        <div
          role="status"
          aria-live="polite"
          className="mb-6 flex items-center justify-between gap-3 text-xs text-ink-500"
        >
          <span>
            {loading
              ? "Loading equipment…"
              : `${visible.length} ${visible.length === 1 ? "item" : "items"}${search ? ` matching “${search}”` : " in the equipment room"}`}
          </span>
          {(search || category !== "All") && (
            <button
              className="flex items-center gap-1 text-brand-600"
              type="button"
              onClick={reset}
            >
              <RotateCcw size={13} aria-hidden="true" />
              Clear filters
            </button>
          )}
        </div>
        {error ? (
          <div
            role="alert"
            className="apex-alert apex-alert-error items-center justify-between"
          >
            <p>{error}</p>
            <button
              type="button"
              className="apex-btn apex-btn-secondary"
              onClick={() => setAttempt((a) => a + 1)}
            >
              Try again
            </button>
          </div>
        ) : visible.length === 0 && !loading ? (
          <div className="py-20 text-center">
            <h2 className="text-xl font-bold">No equipment found</h2>
            <p className="mt-3 text-sm text-ink-600">
              Try a different word or browse all equipment.
            </p>
            <button
              type="button"
              className="apex-btn apex-btn-primary mt-6"
              onClick={reset}
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="apex-product-grid pb-16" aria-busy={loading}>
            {visible.map((p) => (
              <ProductCard
                product={p}
                key={p.id}
                onDetails={() => setSelected(p)}
              />
            ))}
          </div>
        )}
        <ProductDetails product={selected} onClose={() => setSelected(null)} />
      </main>
      <Footer />
    </div>
  );
}
export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="grid min-h-screen place-items-center">
          <Spinner />
          <span className="sr-only">Loading store</span>
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
