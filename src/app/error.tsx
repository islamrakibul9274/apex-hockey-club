"use client";

import React from "react";
import Link from "next/link";
import { FaTriangleExclamation, FaRotateRight } from "react-icons/fa6";

/**
 * Route-level error boundary.
 *
 * Without one, any render error in a client component replaces the page with
 * Next's blank production error screen, losing the navigation entirely.
 *
 * Level: per route segment. Each page gets its own instance so one failing
 * route does not blank the whole site.
 */
export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Server-side detail is logged by Next; this captures the client stack.
    console.error("[route error]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-0 px-4">
      <main id="main" className="w-full max-w-md text-center">
        <span
          aria-hidden="true"
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-2xl text-danger-600"
        >
          <FaTriangleExclamation />
        </span>

        <h1 className="mt-5 text-2xl font-extrabold text-ink-900">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          This section failed to load. The rest of the site still works — you can retry, or head
          back to the homepage.
        </p>

        {error.digest && (
          <p className="mt-3 font-mono text-xs text-ink-500">Reference: {error.digest}</p>
        )}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={reset} className="apex-btn apex-btn-primary">
            <FaRotateRight aria-hidden="true" />
            Try again
          </button>
          <Link href="/" className="apex-btn apex-btn-secondary">
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}