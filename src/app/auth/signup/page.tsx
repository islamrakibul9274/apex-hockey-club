"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaShieldHalved } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { emailSchema, fieldErrors, registerSchema } from "@/lib/validation";
import { Alert, Button, Field, PasswordInput } from "@/components/ui";

export default function SignUpPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    // Mismatch is caught client-side for a fast response, and the server
    // independently enforces the full policy.
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const parsed = registerSchema.safeParse({ name, email, password, phone });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    const result = await register(parsed.data);
    setLoading(false);

    if (result.ok) {
      router.push("/account");
      router.refresh();
      return;
    }

    if (result.fields) setErrors(result.fields);
    setFormError(result.message);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
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
            <h1 className="text-2xl sm:text-3xl font-extrabold">Join Apex Hockey</h1>
            <p className="text-sm mt-1.5" style={{ color: "var(--ink-500)" }}>
              Create your athlete profile for camps, tickets and store discounts
            </p>
          </div>

          {formError && (
            <Alert tone="error" className="mb-5">
              {formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit} noValidate className="apex-card p-6 sm:p-8 space-y-5">
            <Field label="Full name" error={errors.name} required>
              {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
                <input
                  id={id}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jordan Matthews"
                  autoComplete="name"
                  autoFocus
                  disabled={loading}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className="apex-input"
                />
              )}
            </Field>

            <Field label="Email address" error={errors.email} required>
              {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
                <input
                  id={id}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={loading}
                  aria-invalid={invalid}
                  aria-describedby={describedBy}
                  className="apex-input"
                />
              )}
            </Field>

            <Field
              label="Phone number"
              error={errors.phone}
              hint="Optional — used only for match and camp updates"
            >
              {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
                <input
                  id={id}
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 555 0182"
                  autoComplete="tel"
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
              label="Password"
              autoComplete="new-password"
              error={errors.password}
              disabled={loading}
              showMeter
            />

            <PasswordInput
              value={confirmPassword}
              onChange={setConfirmPassword}
              label="Confirm password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              disabled={loading}
            />

            <Button type="submit" block size="lg" loading={loading} loadingText="Creating account…">
              Create account
            </Button>

            <p className="text-xs text-center" style={{ color: "var(--ink-500)" }}>
              By creating an account you agree to our{" "}
              <Link href="/legal/terms" className="underline hover:no-underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="underline hover:no-underline">
                Privacy Policy
              </Link>
              .
            </p>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--ink-500)" }}>
            Already registered?{" "}
            <Link
              href="/auth/signin"
              className="font-semibold hover:underline"
              style={{ color: "var(--brand-600)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}