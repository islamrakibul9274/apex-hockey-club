"use client";
/* eslint-disable react-hooks/set-state-in-effect --
 * Keeping the search field in step with the URL the Navbar navigated to is
 * state derived from a prop, not a user edit.
 */
import React, { useState, useEffect, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { INITIAL_PRODUCTS, ProductData } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import { useSearchParams } from "next/navigation";
import { Spinner } from "@/components/ui";
import {
  FaStar,
  FaEye,
  FaHeart,
  FaCartPlus,
  FaMagnifyingGlass,
  FaSliders,
  FaCheck,
  FaXmark,
} from "react-icons/fa6";

const CATEGORIES = ["All", "Sticks & Pucks", "Helmets & Pads", "Skates", "Accessories"];

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner className="h-6 w-6" />
      <span className="sr-only">Loading products</span>
    </div>
  );
}

function ProductsContent() {
  const searchParams = useSearchParams();

  // The Navbar search navigates to /products?search=… . This page never read
  // the parameter, so the global search and every "Popular Searches" chip were
  // dead — the term was discarded on arrival.
  const initialSearch = searchParams.get("search") ?? "";

  const [products, setProducts] = useState<ProductData[]>(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addItem } = useCart();

  // Debounced so typing does not fire a request per keystroke.
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Keep the visible field in step when the Navbar navigates here.
  useEffect(() => {
    setSearchQuery(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setLoadError("");

      try {
        const params = new URLSearchParams();
        if (activeCategory !== "All") params.set("category", activeCategory);
        if (debouncedSearch) params.set("search", debouncedSearch);

        const res = await fetch(`/api/products?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          setLoadError("We could not load the store. Please try again.");
          return;
        }

        const data = await res.json();

        // A filter matching nothing must produce an empty result, not silently
        // keep whatever was on screen.
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;
        setLoadError("We could not reach the store. Check your connection.");
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
    return () => controller.abort();
  }, [activeCategory, debouncedSearch]);

  // Client-side sorting
  const sortedProducts = [...products].sort((a, b) => {
    if (sortBy === "price-low") return a.price - b.price;
    if (sortBy === "price-high") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "popular") return b.views - a.views;
    return 0;
  });

  const handleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (product: ProductData) => {
    addItem(product, 1);
    setToastMessage(product.title);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />

      {toastMessage && (
        <div className="z-50">
          <div className="apex-alert apex-alert-success text-white font-bold rounded-2xl shadow-xl flex items-center gap-2">
            <FaCheck />
            <span>Added &quot;{toastMessage}&quot; to Equipment Bag!</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="apex-badge apex-badge-sm bg-brand-100 text-brand-600 font-extrabold uppercase tracking-widest px-3 py-2">
            Pro Shop & Gear
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-ink-900 tracking-tight">
            Official Hockey Gear & Equipment
          </h1>
          <p className="text-ink-600 text-base sm:text-lg leading-relaxed">
            Tournament-approved sticks, protective helmets, pro skates, and accessories engineered for explosive on-ice speed and superior puck control.
          </p>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-surface-50 border border-line-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by keyword..."
                className="apex-input apex-input-sm w-full pl-10 bg-surface-0 border border-line-200 rounded-2xl text-xs focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Sort Selection */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <FaSliders className="text-ink-600 text-xs" />
              <span className="text-xs font-bold text-ink-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-sm bg-surface-0 border border-line-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-brand-500"
              >
                <option value="recommended">Featured & Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular (Views)</option>
              </select>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-line-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/20"
                    : "bg-surface-0 text-ink-700 hover:bg-gray-200 border border-line-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loadError ? (
          <div role="alert" className="apex-alert apex-alert-error">
            {loadError}
          </div>
        ) : loading && sortedProducts.length === 0 ? (
          <div className="py-16 flex justify-center">
            <Spinner className="h-6 w-6" />
            <span className="sr-only">Loading products</span>
          </div>
        ) : sortedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <h3 className="text-xl font-bold text-ink-800">No equipment found matching criteria</h3>
            <p className="text-ink-600 text-sm">Try clearing your search query or selecting another category.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="apex-btn apex-btn-sm bg-brand-500 hover:bg-brand-600 text-white border-none rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProducts.map((product) => {
              const isLiked = likedIds[product.id];
              return (
                <div
                  key={product.id}
                  className="bg-surface-0 border border-line-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className="relative w-full h-56 bg-surface-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-4 cursor-pointer"
                      onClick={() => setSelectedProduct(product)}
                    >
                      <Image
                        src={product.image}
                        alt={product.title}
                        width={220}
                        height={220}
                        className="object-contain max-h-48 group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="apex-badge apex-badge-sm bg-surface-0 text-ink-700 font-bold border-none shadow-sm text-[10px]">
                          {product.category}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(product.id);
                        }}
                        className={`apex-btn apex-btn-icon apex-btn-sm absolute top-3 right-3 shadow-md border-none ${
                          isLiked ? "bg-brand-500 text-white" : "bg-surface-0 text-ink-500 hover:text-danger-600"
                        }`}
                        aria-label="Like product"
                      >
                        <FaHeart className="text-xs" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <FaStar />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-ink-500 font-normal">({product.reviewsCount || 42})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FaEye /> {product.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart className={isLiked ? "text-danger-600" : ""} />{" "}
                          {product.likes + (isLiked ? 1 : 0)}
                        </span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-extrabold text-lg text-ink-900 group-hover:text-brand-600 transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.title}
                    </h3>
                    <p className="text-ink-600 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-line-200 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xs text-ink-500 font-medium">Price</span>
                      <div className="text-xl font-black text-brand-600">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="apex-btn apex-btn-sm apex-btn-ghost text-ink-600 hover:text-ink-900 rounded-xl text-xs"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        aria-label={`Add ${product.title} to cart`}
                        className="apex-btn apex-btn-sm bg-brand-500 hover:bg-brand-600 text-white border-none rounded-xl font-bold shadow-md shadow-brand-500/20 flex items-center gap-1.5"
                      >
                        <FaCartPlus aria-hidden="true" /> Add
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Product Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-surface-0 w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-scale-in max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="apex-btn apex-btn-icon apex-btn-ghost apex-btn-sm absolute top-4 right-4 text-ink-500 hover:text-ink-700"
              >
                <FaXmark className="text-lg" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="bg-surface-50 rounded-2xl p-6 flex items-center justify-center">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    width={240}
                    height={240}
                    className="object-contain max-h-56"
                  />
                </div>

                <div className="space-y-3">
                  <span className="apex-badge bg-brand-100 text-brand-600 font-bold text-xs">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-2xl font-extrabold text-ink-900 leading-tight">
                    {selectedProduct.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-amber-500 font-bold">
                    <FaStar /> {selectedProduct.rating.toFixed(1)} / 5.0 (
                    {selectedProduct.reviewsCount || 48} Customer Reviews)
                  </div>
                  <div className="text-2xl font-black text-brand-600">
                    ${selectedProduct.price.toFixed(2)}
                  </div>
                  <p className="text-ink-600 text-xs sm:text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {selectedProduct.features && (
                    <div className="space-y-1 pt-1">
                      <p className="text-xs font-bold text-ink-800">Key Features:</p>
                      {selectedProduct.features.map((f, i) => (
                        <p key={i} className="text-xs text-ink-600 flex items-center gap-1.5">
                          <FaCheck className="text-emerald-500" /> {f}
                        </p>
                      ))}
                    </div>
                  )}

                  <div className="pt-3 flex gap-3">
                    <button
                      onClick={() => {
                        handleAddToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      aria-label={`Add ${selectedProduct.title} to cart`}
                      className="apex-btn flex-1 bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl font-bold shadow-lg"
                    >
                      <FaCartPlus /> Add to Equipment Bag
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

/**
 * useSearchParams requires a Suspense boundary for static rendering, so the
 * page is exported through one.
 */
export default function ProductsPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <ProductsContent />
    </Suspense>
  );
}
