"use client";

import React from "react";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ToastProvider } from "@/components/Toast";

/**
 * Client provider stack, isolated in its own module so the root layout stays a
 * Server Component. That keeps the layout and the metadata it exports out of
 * the client bundle.
 */
export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>{children}</ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}