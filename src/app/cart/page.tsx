"use client";

import React, { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  FaTrash,
  FaPlus,
  FaMinus,
  FaBagShopping,
  FaCreditCard,
  FaArrowLeft,
  FaShieldHalved,
  FaTruckFast,
} from "react-icons/fa6";

export default function CartPage() {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { user } = useAuth();

  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (coupon.trim().toUpperCase() === "APEX2026" || coupon.trim().toUpperCase() === "HOCKEY15") {
      setDiscount(15);
      setCouponApplied(true);
      setCouponError("");
    } else {
      setCouponError("Invalid discount code. Try 'APEX2026'!");
    }
  };

  const finalTotal = Math.max(0, totalPrice - discount);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          price: finalTotal,
          type: "equipment_order",
          customerEmail: user?.email,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface-0 text-ink-900">
      <Navbar />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-ink-900 tracking-tight">
              Equipment Shopping Bag
            </h1>
            <p className="text-ink-600 text-sm mt-1">Review selected gear before dispatch</p>
          </div>
          <Link
            href="/products"
            className="apex-btn apex-btn-ghost apex-btn-sm text-ink-600 hover:text-brand-600 rounded-xl flex items-center gap-2"
          >
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="bg-surface-50 border border-line-200 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center text-3xl mx-auto">
              <FaBagShopping />
            </div>
            <h3 className="text-2xl font-extrabold text-ink-800">Your bag is currently empty</h3>
            <p className="text-ink-600 text-sm max-w-sm mx-auto">
              Check out our match pucks, composite sticks, skates, and goalie pads in the official store.
            </p>
            <Link
              href="/products"
              className="apex-btn bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl px-8 font-bold"
            >
              Browse Equipment Store
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Items Table */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-surface-0 border border-line-200 rounded-3xl overflow-hidden shadow-sm divide-y divide-line-200">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="p-6 flex flex-col sm:flex-row items-center gap-6 justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 bg-surface-50 rounded-2xl p-2 flex items-center justify-center flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="object-contain max-h-20"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="apex-badge apex-badge-sm bg-surface-100 text-ink-700 font-semibold text-[10px]">
                          {item.category}
                        </span>
                        <h3 className="font-extrabold text-base text-ink-900">{item.title}</h3>
                        <p className="text-xs text-ink-500 font-medium">
                          ${item.price.toFixed(2)} each
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      {/* Quantity Modifier */}
                      <div className="flex items-center border border-line-200 rounded-xl overflow-hidden bg-surface-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-3 py-1.5 text-ink-600 hover:bg-gray-200"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-xs" />
                        </button>
                        <span className="px-3 py-1 text-sm font-extrabold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-3 py-1.5 text-ink-600 hover:bg-gray-200"
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="text-xs" />
                        </button>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <div className="text-lg font-black text-brand-600">
                          ${(item.price * item.quantity).toFixed(2)}
                        </div>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
                        className="apex-btn apex-btn-ghost apex-btn-icon apex-btn-sm text-ink-500 hover:text-danger-600"
                        aria-label="Remove item"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center px-2">
                <button
                  onClick={clearCart}
                  className="text-xs font-bold text-ink-600 hover:text-danger-600"
                >
                  Clear Entire Bag
                </button>
                <div className="flex items-center gap-2 text-xs font-semibold text-ink-600">
                  <FaTruckFast className="text-emerald-500" /> Fast Insured Shipping
                </div>
              </div>
            </div>

            {/* Order Summary & Stripe Checkout */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-surface-50 border border-line-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
                <h3 className="font-extrabold text-xl text-ink-900 border-b border-line-200 pb-4">
                  Order Summary
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-ink-600">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-ink-900">${totalPrice.toFixed(2)}</span>
                  </div>

                  {couponApplied && (
                    <div className="flex justify-between text-success-700 font-semibold">
                      <span>Promo Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-ink-600">
                    <span>Standard Courier Delivery</span>
                    <span className="font-bold text-success-700">FREE</span>
                  </div>

                  <div className="border-t border-line-200 pt-3 flex justify-between font-black text-xl text-ink-900">
                    <span>Total</span>
                    <span className="text-brand-600">${finalTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Promo Code Form */}
                <form onSubmit={handleApplyCoupon} className="space-y-2 pt-2 border-t border-line-200">
                  <label className="text-xs font-bold text-ink-700">Promo Code</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="e.g. APEX2026"
                      className="apex-input apex-input-sm bg-surface-0 border border-line-200 rounded-xl flex-1 text-xs uppercase"
                    />
                    <button
                      type="submit"
                      className="apex-btn apex-btn-sm bg-gray-900 text-white rounded-xl hover:bg-gray-800 text-xs"
                    >
                      Apply
                    </button>
                  </div>
                  {couponApplied && (
                    <p className="text-xs text-success-700 font-bold">✓ Promo code active (-$15)</p>
                  )}
                  {couponError && <p className="text-xs text-danger-600 font-medium">{couponError}</p>}
                </form>

                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="apex-btn apex-btn-block bg-brand-500 hover:bg-brand-600 text-white border-none rounded-2xl font-bold py-3 text-base shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    <span className="apex-spinner apex-spinner-sm"></span>
                  ) : (
                    <>
                      <FaCreditCard /> Complete Stripe Checkout
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-2 text-xs text-ink-500">
                  <FaShieldHalved /> 256-Bit SSL Encrypted & Protected
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
