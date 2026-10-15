import React from "react";

/**
 * Loading placeholder.
 *
 * Several sections fetched data with no indicator at all, so the grid simply
 * appeared. These give a stable-height placeholder that matches the final
 * layout, which also avoids a layout shift when data arrives.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer rounded-lg bg-surface-100 ${className}`}
      style={{
        backgroundImage:
          "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)",
        backgroundSize: "400px 100%",
      }}
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-line-200 bg-surface-0 p-6">
      <Skeleton className="h-40 w-full" />
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <div className="flex gap-3 pt-2">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      role="status"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
      <span className="sr-only">Loading products…</span>
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4" role="status" aria-label="Loading content">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}