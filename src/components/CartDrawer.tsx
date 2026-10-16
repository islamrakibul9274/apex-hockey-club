"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FaTrash, FaPlus, FaMinus, FaXmark, FaBagShopping } from "react-icons/fa6";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalCount } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  /**
   * Checkout from the drawer.
   *
   * This previously sent `type: "store_checkout"` and the whole product
   * objects. /api/checkout accepts `type: "cart"` with items shaped
   * `{ id, quantity }`, so the request was rejected and the failure was
   * swallowed — the spinner just stopped with nothing on screen.
   */
  const handleCheckout = async () => {
    if (items.length === 0) return;

    setCheckingOut(true);
    setCheckoutError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "cart",
          items: items.map((item) => ({ id: item.id, quantity: item.quantity })),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        setCheckoutError(data?.error ?? "We could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setCheckoutError("We could not reach the payment service. Please try again.");
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface-0 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-line-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaBagShopping className="text-brand-600 text-xl" />
              <h2 className="text-xl font-extrabold text-ink-900">Your Equipment Bag</h2>
              <span className="apex-badge apex-badge-sm bg-brand-500 text-white font-bold ml-1">
                {totalCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="apex-btn apex-btn-sm apex-btn-icon apex-btn-ghost text-ink-500 hover:text-ink-700"
              aria-label="Close cart"
            >
              <FaXmark className="text-lg" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-surface-50 px-6 py-3 border-b border-line-200 text-xs font-semibold text-ink-600 flex items-center justify-between">
            <span>🎉 Free standard delivery on all official gear!</span>
            <span className="text-brand-600 font-bold">100% Free</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-brand-50 flex items-center justify-center text-brand-600 text-3xl">
                  <FaBagShopping />
                </div>
                <h3 className="text-lg font-bold text-ink-800">Your bag is empty</h3>
                <p className="text-ink-600 text-sm max-w-xs">
                  Explore our pro-grade hockey sticks, skates, protective pads and accessories.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="apex-btn bg-brand-500 hover:bg-brand-600 text-white border-none mt-2"
                >
                  Explore Store
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl border border-line-200 hover:border-line-200 transition-colors bg-surface-0"
                >
                  <div className="w-20 h-20 bg-surface-50 rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.title}
                      width={64}
                      height={64}
                      className="object-contain max-h-16"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-sm text-ink-900 line-clamp-1">{item.title}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-ink-500 hover:text-danger-600 ml-2"
                          aria-label="Remove item"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                      <p className="text-xs text-ink-500 font-medium">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-extrabold text-brand-600 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center border border-line-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-ink-600 hover:bg-surface-100"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-[10px]" />
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-ink-600 hover:bg-surface-100"
                          aria-label="Increase quantity"
                        >
                          <FaPlus className="text-[10px]" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-6 border-t border-line-200 bg-surface-50 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-ink-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-ink-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-ink-900">$0.00</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-success-700">Free</span>
                </div>
                <div className="border-t border-line-200 pt-2 flex justify-between font-extrabold text-base text-ink-900">
                  <span>Total Amount</span>
                  <span className="text-brand-600">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="apex-btn apex-btn-primary apex-btn-block"
                >
                  {checkingOut ? (
                    <span className="apex-spinner apex-spinner-sm"></span>
                  ) : (
                    `Proceed to Stripe Checkout ($${totalPrice.toFixed(2)})`
                  )}
                </button>
                {checkoutError && (
                  <div role="alert" className="apex-alert apex-alert-error">
                    {checkoutError}
                  </div>
                )}
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="apex-btn apex-btn-block apex-btn-ghost apex-btn-sm text-ink-600 hover:bg-gray-200"
                >
                  View Full Cart Details
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
