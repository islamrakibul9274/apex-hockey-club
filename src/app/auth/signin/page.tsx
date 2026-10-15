"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaShieldHalved } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { emailSchema, fieldErrors, loginSchema } from "@/lib/validation";
import { Alert, Button, Field, PasswordInput, Spinner } from "@/components/ui";

/** Only allow same-origin relative paths, so ?next= cannot be used as an open redirect. */
function safeNext(raw: string | null): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//")) return "/account";
  return raw;
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const next = safeNext(searchParams.get("next"));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    // Client-side check first so obvious mistakes never hit the network.
    const parsed = loginSchema.safeParse({ email, password, remember });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const result = await login(parsed.data.email, parsed.data.password, parsed.data.remember);
    setLoading(false);

    if (result.ok) {
      router.push(next);
      router.refresh();
      return;
    }

    if (result.fields) setErrors(result.fields);
    setFormError(result.message);
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface-0">
      <main id="main" className="flex-1 flex items-center justify-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ backgroundColor: "var(--brand-50)", color: "var(--brand-600)" }}
              aria-hidden="true"
            >
              <FaShieldHalved />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">Welcome back</h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--ink-500)" }}>
              Sign in to your Apex Hockey athlete account
            </p>
          </div>

          {formError && (
            <Alert tone="error" className="mb-5">
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="apex-card p-6 sm:p-8 space-y-5">
            <Field label="Email address" error={errors.email} required>
              {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
                <input
                  id={id}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  disabled={loading}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className="apex-input"
                />
              )}
            </Field>

            <PasswordInput
              value={password}
              onChange={setPassword}
              error={errors.password}
              disabled={loading}
            />

            <div className="flex items-center justify-between gap-4 flex-wrap">
              <label
                htmlFor="remember"
                className="flex items-center gap-2 text-sm cursor-pointer"
                style={{ color: "var(--ink-600)" }}
              >
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  disabled={loading}
                  className="h-4 w-4 rounded border-[var(--line-300)] accent-[var(--brand-500)]"
                />
                Keep me signed in
              </label>

              <Link
                href="/auth/forgot-password"
                className="text-sm font-semibold hover:underline"
                style={{ color: "var(--brand-600)" }}
              >
                Forgot password?
              </Link>
            </div>

            <Button type="submit" block size="lg" loading={loading} loadingText="Signing in…">
              Sign in
            </Button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--ink-500)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold hover:underline"
              style={{ color: "var(--brand-600)" }}
            >
              Create one free
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Spinner className="h-6 w-6" />
          <span className="sr-only">Loading sign in</span>
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}