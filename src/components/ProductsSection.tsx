"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { INITIAL_PRODUCTS, ProductData } from "@/lib/mockData";
import { useCart } from "@/context/CartContext";
import {
  FaStar,
  FaEye,
  FaHeart,
  FaCartPlus,
  FaCheck,
  FaXmark,
  FaArrowRight,
} from "react-icons/fa6";

const CATEGORIES = ["All", "Sticks & Pucks", "Helmets & Pads", "Skates", "Accessories"];

export default function ProductsSection() {
  const [products, setProducts] = useState<ProductData[]>(INITIAL_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedProduct, setSelectedProduct] = useState<ProductData | null>(null);
  const [likedIds, setLikedIds] = useState<Record<string, boolean>>({});
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const { addItem } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const url =
          activeCategory === "All"
            ? "/api/products"
            : `/api/products?category=${encodeURIComponent(activeCategory)}`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.products && data.products.length > 0) {
          setProducts(data.products);
        }
      } catch {
        // fallback
      }
    }
    fetchProducts();
  }, [activeCategory]);

  const handleLike = (id: string) => {
    setLikedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddToCart = (product: ProductData) => {
    addItem(product, 1);
    setAddedToast(product.title);
    setTimeout(() => setAddedToast(null), 3000);
  };

  return (
    <section id="products" className="px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Toast Feedback */}
      {addedToast && (
        <div className="toast toast-top toast-center z-50 animate-in slide-in-from-top-4">
          <div className="alert alert-success text-white font-bold rounded-2xl shadow-xl flex items-center gap-2">
            <FaCheck />
            <span>Added &quot;{addedToast}&quot; to Equipment Bag!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="text-center space-y-3 my-8 py-8 border-dashed border-2 border-l-0 border-r-0 border-gray-200">
        <span className="badge badge-sm bg-red-100 text-[#FF4240] font-extrabold uppercase tracking-widest px-3 py-2">
          Official Equipment
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Our New Products
        </h2>
        <p className="text-gray-500 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Dit amet consectetur. Condimentum dignissim adipiscing aliquam turpis placerat <br className="hidden sm:inline" /> dolor. Purus urna in sit nullam proin.
        </p>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 pt-4">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-[#FF4240] text-white shadow-md shadow-red-500/20 scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => {
          const isLiked = likedIds[product.id];
          return (
            <div
              key={product.id}
              className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative w-full h-52 bg-slate-50 rounded-2xl p-4 flex items-center justify-center overflow-hidden mb-4 cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <Image
                    src={product.image}
                    alt={product.title}
                    width={200}
                    height={200}
                    className="object-contain max-h-44 group-hover:scale-105 transition-transform duration-300"
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

                {/* Meta stats */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <FaStar />
                    <span>{product.rating.toFixed(1)}</span>
                    <span className="text-gray-400 font-normal">({product.reviewsCount || 42})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <FaEye /> {product.views || 320}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaHeart className={isLiked ? "text-red-500" : ""} />{" "}
                      {product.likes + (isLiked ? 1 : 0)}
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
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

              {/* Pricing & Add to Bag CTA */}
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
                    Quick View
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

      {/* Explore Full Store Link */}
      <div className="text-center pt-8">
        <Link
          href="/products"
          className="btn btn-outline border-gray-300 hover:bg-gray-900 hover:border-gray-900 hover:text-white rounded-2xl px-8 font-bold text-sm inline-flex items-center gap-2"
        >
          Explore All Store Gear & Accessories <FaArrowRight />
        </Link>
      </div>

      {/* Product Quick-View Modal */}
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
    </section>
  );
}
