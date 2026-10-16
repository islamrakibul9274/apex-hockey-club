"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { INITIAL_PRODUCTS, type ProductData } from "@/lib/mockData";
import { ProductCard, ProductDetails } from "@/components/ProductCard";

const CATEGORIES = [
  "All",
  "Sticks & Pucks",
  "Helmets & Pads",
  "Skates",
  "Accessories",
];

export default function ProductsSection() {
  const [products, setProducts] = useState<ProductData[]>(INITIAL_PRODUCTS);
  const [category, setCategory] = useState("All");
  const [selected, setSelected] = useState<ProductData | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/products", { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.products)) setProducts(data.products);
      })
      .catch(() => {});
    return () => controller.abort();
  }, []);
  const filtered = products.filter(
    (p) => category === "All" || p.category === category,
  );

  return (
    <section
      id="products"
      className="apex-container apex-section"
      aria-labelledby="gear-heading"
    >
      <div className="apex-section-heading">
        <div>
          <p className="apex-eyebrow">THE EQUIPMENT ROOM</p>
          <h2 id="gear-heading" className="apex-display">
            READY FOR
            <br />
            <span>YOUR NEXT SHIFT.</span>
          </h2>
        </div>
        <div className="apex-section-aside">
          <p>
            Sticks, skates, and the essentials in between. Explore the gear to
            take onto the ice.
          </p>
          <Link href="/products" className="apex-text-link">
            Shop all equipment <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
      <div className="apex-filter-tabs" aria-label="Filter equipment">
        {CATEGORIES.map((c) => (
          <button
            type="button"
            key={c}
            onClick={() => setCategory(c)}
            aria-pressed={category === c}
            className="apex-filter-tab"
          >
            {c === "All" ? "All equipment" : c}
          </button>
        ))}
      </div>
      <div className="apex-product-grid">
        {filtered.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onDetails={() => setSelected(p)}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <p role="status" className="py-10 text-sm text-ink-600">
          No equipment in this category. Try another filter.
        </p>
      )}
      <ProductDetails product={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
