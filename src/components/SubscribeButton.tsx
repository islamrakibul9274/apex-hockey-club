"use client";

import React, { useState } from "react";

/**
 * Subscribe button for the pricing page.
 *
 * The only reason the pricing page is split is this: redirecting to Stripe
 * needs a click handler. The rest of the page is a Server Component.
 *
 * It sends the plan slug only. The amount is resolved server-side in
 * /api/checkout — the previous version sent a client-side `price`, which the
 * API now rejects, so that flow was broken.
 */
export default function SubscribeButton({
  planSlug,
  label,
  variant = "primary",
}: {
  planSlug: string;
  label: string;
  variant?: "primary" | "secondary";
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleClick() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "membership", planName: planSlug }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data?.url) {
        setError(data?.error ?? "We could not start checkout. Please try again.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setError("We could not reach the payment service. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className={`apex-btn apex-btn-block ${
          variant === "primary" ? "apex-btn-primary" : "apex-btn-secondary"
        }`}
      >
        {loading ? "Starting checkout…" : label}
      </button>
      {error && (
        <p role="alert" className="apex-field-error mt-2">
          {error}
        </p>
      )}
    </div>
  );
}