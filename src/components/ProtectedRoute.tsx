"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Spinner } from "@/components/ui";

/**
 * Client-side guard for pages that require a session.
 *
 * This complements — it does not replace — the server-side checks in the API
 * routes. Client guards exist only so an unauthenticated visitor gets a
 * redirect instead of a half-rendered page; the API remains the authority.
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      // Preserve where they were headed so sign-in can return them there.
      const next = `${pathname}${searchParams.toString() ? `?${searchParams}` : ""}`;
      router.replace(`/auth/signin?next=${encodeURIComponent(next)}`);
    }
  }, [user, loading, router, pathname, searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-6 w-6" />
        <span className="sr-only">Checking your session</span>
      </div>
    );
  }

  if (!user) {
    // Render nothing rather than protected content for the moment before the
    // redirect lands.
    return null;
  }

  return <>{children}</>;
}