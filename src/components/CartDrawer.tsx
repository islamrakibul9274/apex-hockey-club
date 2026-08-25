"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { FaTrash, FaPlus, FaMinus, FaXmark, FaBagShopping } from "react-icons/fa6";

export default function CartDrawer() {
  const { items, isOpen, closeCart, updateQuantity, removeItem, totalPrice, totalCount } = useCart();
  const [checkingOut, setCheckingOut] = useState(false);

  const handleCheckout = async () => {
    if (items.length === 0) return;
    setCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          type: "store_checkout",
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error("Checkout error:", err);
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
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaBagShopping className="text-[#FF4240] text-xl" />
              <h2 className="text-xl font-extrabold text-gray-900">Your Equipment Bag</h2>
              <span className="badge badge-sm bg-[#FF4240] text-white font-bold ml-1">
                {totalCount}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="btn btn-sm btn-circle btn-ghost text-gray-400 hover:text-gray-700"
              aria-label="Close cart"
            >
              <FaXmark className="text-lg" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="bg-gray-50 px-6 py-3 border-b border-gray-100 text-xs font-semibold text-gray-600 flex items-center justify-between">
            <span>🎉 Free standard delivery on all official gear!</span>
            <span className="text-[#FF4240] font-bold">100% Free</span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-[#FF4240] text-3xl">
                  <FaBagShopping />
                </div>
                <h3 className="text-lg font-bold text-gray-800">Your bag is empty</h3>
                <p className="text-gray-500 text-sm max-w-xs">
                  Explore our pro-grade hockey sticks, skates, protective pads and accessories.
                </p>
                <Link
                  href="/products"
                  onClick={closeCart}
                  className="btn bg-[#FF4240] hover:bg-[#e03735] text-white border-none mt-2"
                >
                  Explore Store
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors bg-white"
                >
                  <div className="w-20 h-20 bg-gray-50 rounded-lg p-2 flex items-center justify-center flex-shrink-0">
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
                        <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.title}</h4>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-500 ml-2"
                          aria-label="Remove item"
                        >
                          <FaTrash className="text-xs" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 font-medium">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <span className="font-extrabold text-[#FF4240] text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>
                      <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100"
                          aria-label="Decrease quantity"
                        >
                          <FaMinus className="text-[10px]" />
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-gray-500 hover:bg-gray-100"
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
            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-gray-900">${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Estimated Tax</span>
                  <span className="font-semibold text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="font-semibold text-emerald-600">Free</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-extrabold text-base text-gray-900">
                  <span>Total Amount</span>
                  <span className="text-[#FF4240]">${totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="btn btn-block bg-[#FF4240] hover:bg-[#e03735] border-none text-white font-bold"
                >
                  {checkingOut ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    `Proceed to Stripe Checkout ($${totalPrice.toFixed(2)})`
                  )}
                </button>
                <Link
                  href="/cart"
                  onClick={closeCart}
                  className="btn btn-block btn-ghost btn-sm text-gray-600 hover:bg-gray-200"
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
