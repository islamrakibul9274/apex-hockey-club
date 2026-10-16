"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCircleCheck, FaKey, FaTriangleExclamation } from "react-icons/fa6";
import { useAuth } from "@/context/AuthContext";
import { passwordSchema, fieldErrors } from "@/lib/validation";
import { Alert, Button, PasswordInput, Spinner } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();

  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password: parsed.data }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setFormError(data?.error ?? "We could not reset your password. Please try again.");
        return;
      }

      // The API signs the user in on success; sync the client session.
      await refresh();
      setDone(true);
    } catch {
      setFormError("We could not reach the server. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="w-full max-w-md text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ backgroundColor: "rgb(var(--brand-50))", color: "rgb(var(--brand-600))" }}
          aria-hidden="true"
        >
          <FaTriangleExclamation />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">This link is not valid</h1>
        <p className="text-sm mb-6" style={{ color: "rgb(var(--ink-500))" }}>
          The password reset link is missing its token. Request a new one.
        </p>
        <Link href="/auth/forgot-password">
          <Button size="lg">Request a new link</Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ backgroundColor: "rgb(var(--success-50))", color: "rgb(var(--success-700))" }}
          aria-hidden="true"
        >
          <FaCircleCheck />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Password updated</h1>
        <p className="text-sm mb-6" style={{ color: "rgb(var(--ink-500))" }}>
          You are signed in and your new password is active.
        </p>
        <Button size="lg" onClick={() => router.push("/account")}>
          Go to your account
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ backgroundColor: "rgb(var(--brand-50))", color: "rgb(var(--brand-600))" }}
          aria-hidden="true"
        >
          <FaKey />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold">Choose a new password</h1>
        <p className="text-sm mt-1.5" style={{ color: "rgb(var(--ink-500))" }}>
          Pick something you don&apos;t use anywhere else.
        </p>
      </div>

      {formError && (
        <Alert tone="error" className="mb-5">
          {formError}
        </Alert>
      )}

      <form onSubmit={handleSubmit} noValidate className="apex-card p-6 sm:p-8 space-y-5">
        <PasswordInput
          value={password}
          onChange={setPassword}
          label="New password"
          autoComplete="new-password"
          error={errors.password}
          disabled={loading}
          showMeter
        />

        <PasswordInput
          value={confirmPassword}
          onChange={setConfirmPassword}
          label="Confirm new password"
          autoComplete="new-password"
          error={errors.confirmPassword}
          disabled={loading}
        />

        <Button type="submit" block size="lg" loading={loading} loadingText="Updating…">
          Update password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <main id="main">
        <Suspense
          fallback={
            <div className="flex items-center justify-center">
              <Spinner className="h-6 w-6" />
              <span className="sr-only">Loading</span>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}