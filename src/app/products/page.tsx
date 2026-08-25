"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { INITIAL_PRODUCTS, ProductData } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
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

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductData[]>(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    async function loadProducts() {
      try {
        let url = "/api/products?";
        if (activeCategory !== "All") {
          url += `category=${encodeURIComponent(activeCategory)}&`;
        }
        if (searchQuery) {
          url += `search=${encodeURIComponent(searchQuery)}&`;
        }
        const res = await fetch(url);
        const data = await res.json();
        if (data.products) setProducts(data.products);
      } catch {
        // fallback
      }
    }
    loadProducts();
  }, [activeCategory, searchQuery]);

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
    <div className="min-h-screen flex flex-col bg-white text-gray-900">
      <Navbar />

      {toastMessage && (
        <div className="toast toast-top toast-center z-50 animate-in slide-in-from-top-4">
          <div className="alert alert-success text-white font-bold rounded-2xl shadow-xl flex items-center gap-2">
            <FaCheck />
            <span>Added &quot;{toastMessage}&quot; to Equipment Bag!</span>
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
            Pro Shop & Gear
          </span>
          <h1 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">
            Official Hockey Gear & Equipment
          </h1>
          <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
            Tournament-approved sticks, protective helmets, pro skates, and accessories engineered for explosive on-ice speed and superior puck control.
          </p>
        </div>

        {/* Search, Filter & Sort Controls */}
        <div className="bg-slate-50 border border-gray-200 rounded-3xl p-6 space-y-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by keyword..."
                className="input input-sm w-full pl-10 bg-white border border-gray-200 rounded-2xl text-xs focus:ring-2 focus:ring-[#FF4240]"
              />
            </div>

            {/* Sort Selection */}
            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <FaSliders className="text-gray-500 text-xs" />
              <span className="text-xs font-bold text-gray-600">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="select select-sm bg-white border border-gray-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-[#FF4240]"
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
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#FF4240] text-white shadow-md shadow-red-500/20"
                    : "bg-white text-gray-700 hover:bg-gray-200 border border-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {sortedProducts.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <h3 className="text-xl font-bold text-gray-800">No equipment found matching criteria</h3>
            <p className="text-gray-500 text-sm">Try clearing your search query or selecting another category.</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("All");
              }}
              className="btn btn-sm bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-xl"
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
                  className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    <div
                      className="relative w-full h-56 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-4 cursor-pointer"
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
                        <span className="badge badge-sm bg-white text-gray-700 font-bold border-none shadow-sm text-[10px]">
                          {product.category}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(product.id);
                        }}
                        className={`btn btn-circle btn-xs absolute top-3 right-3 shadow-md border-none ${
                          isLiked ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"
                        }`}
                        aria-label="Like product"
                      >
                        <FaHeart className="text-xs" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                      <div className="flex items-center gap-1 text-amber-500 font-bold">
                        <FaStar />
                        <span>{product.rating.toFixed(1)}</span>
                        <span className="text-gray-400 font-normal">({product.reviewsCount || 42})</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <FaEye /> {product.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaHeart className={isLiked ? "text-red-500" : ""} />{" "}
                          {product.likes + (isLiked ? 1 : 0)}
                        </span>
                      </div>
                    </div>

                    <h3
                      onClick={() => setSelectedProduct(product)}
                      className="font-extrabold text-lg text-gray-900 group-hover:text-[#FF4240] transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.title}
                    </h3>
                    <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-4">
                    <div>
                      <span className="text-xs text-gray-400 font-medium">Price</span>
                      <div className="text-xl font-black text-[#FF4240]">
                        ${product.price.toFixed(2)}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedProduct(product)}
                        className="btn btn-sm btn-ghost text-gray-600 hover:text-gray-900 rounded-xl text-xs"
                      >
                        Details
                      </button>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="btn btn-sm bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-xl font-bold shadow-md shadow-red-500/20 flex items-center gap-1.5"
                      >
                        <FaCartPlus /> Add
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <button
                onClick={() => setSelectedProduct(null)}
                className="btn btn-circle btn-ghost btn-sm absolute top-4 right-4 text-gray-400 hover:text-gray-700"
              >
                <FaXmark className="text-lg" />
              </button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                <div className="bg-slate-50 rounded-2xl p-6 flex items-center justify-center">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    width={240}
                    height={240}
                    className="object-contain max-h-56"
                  />
                </div>

                <div className="space-y-3">
                  <span className="badge bg-red-100 text-[#FF4240] font-bold text-xs">
                    {selectedProduct.category}
                  </span>
                  <h3 className="text-2xl font-extrabold text-gray-900 leading-tight">
                    {selectedProduct.title}
                  </h3>
                  <div className="flex items-center gap-2 text-sm text-amber-500 font-bold">
                    <FaStar /> {selectedProduct.rating.toFixed(1)} / 5.0 (
                    {selectedProduct.reviewsCount || 48} Customer Reviews)
                  </div>
                  <div className="text-2xl font-black text-[#FF4240]">
                    ${selectedProduct.price.toFixed(2)}
                  </div>
                  <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                    {selectedProduct.description}
                  </p>

                  {selectedProduct.features && (
                    <div className="space-y-1 pt-1">
                      <p className="text-xs font-bold text-gray-800">Key Features:</p>
                      {selectedProduct.features.map((f, i) => (
                        <p key={i} className="text-xs text-gray-600 flex items-center gap-1.5">
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
                      className="btn flex-1 bg-[#FF4240] hover:bg-[#e03735] text-white border-none rounded-2xl font-bold shadow-lg"
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
