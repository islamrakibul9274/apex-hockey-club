"use client";

import React, { useState } from "react";
import Link from "next/link";
import { FaArrowLeft, FaEnvelope } from "react-icons/fa6";
import { emailSchema, fieldErrors } from "@/lib/validation";
import { Alert, Button, Field } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFormError(data?.error ?? "We could not send the reset link. Please try again.");
        return;
      }
      setSent(true);
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <main id="main" className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
            style={{ backgroundColor: "rgb(var(--brand-50))", color: "rgb(var(--brand-600))" }}
            aria-hidden="true"
          >
            <FaEnvelope />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">Reset your password</h1>
          <p className="text-sm mt-1.5" style={{ color: "rgb(var(--ink-500))" }}>
            Enter your email and we&apos;ll send you a link to choose a new one.
          </p>
        </div>

        {sent ? (
          <Alert tone="success">
            If an account exists for {email}, a reset link is on its way. The link expires in 30
            minutes.
          </Alert>
        ) : (
          <>
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

              <Button type="submit" block size="lg" loading={loading} loadingText="Sending link…">
                Send reset link
              </Button>
            </form>
          </>
        )}

        <p className="text-center text-sm mt-6">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-1.5 font-semibold hover:underline"
            style={{ color: "rgb(var(--brand-600))" }}
          >
            <FaArrowLeft aria-hidden="true" className="text-xs" />
            Back to sign in
          </Link>
        </p>
      </main>
    </div>
  );
}