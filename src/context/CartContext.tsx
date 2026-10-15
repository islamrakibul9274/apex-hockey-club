"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ProductData } from "@/lib/mockData";

export interface CartItem extends ProductData {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isOpen: boolean;
  /** False until the persisted cart has been read, so UI can avoid a flash of "empty". */
  hydrated: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (product: ProductData, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalCount: number;
  totalPrice: number;
}

const STORAGE_KEY = "apex_hockey_cart";

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Read once on mount. Marked hydrated so the writer below knows not to
  // persist the still-empty initial state over the stored cart.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Drop anything that does not look like a cart item rather than
          // trusting whatever is in storage.
          const clean = parsed.filter(
            (item): item is CartItem =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as CartItem).id === "string" &&
              typeof (item as CartItem).price === "number" &&
              typeof (item as CartItem).quantity === "number"
          );
          setItems(clean);
        }
      }
    } catch {
      // Corrupt or unavailable storage starts an empty cart rather than
      // breaking the page.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    // Previously this ran on the same commit as the loader above and wrote the
    // initial [] over the saved cart, so a persisted cart never survived a
    // refresh. The hydrated guard fixes that.
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Quota or private-mode failures must not break the cart in memory.
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: ProductData, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + qty, 20) }
            : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(Math.max(qty, 1), 20) }];
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.id !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: Math.min(quantity, 20) } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isOpen,
        hydrated,
        openCart,
        closeCart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalCount,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}