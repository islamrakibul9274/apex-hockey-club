"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaCheck } from "react-icons/fa6";
import Modal from "@/components/Modal";
import { Button, Field } from "@/components/ui";

export interface ProgramSummary {
  id: string;
  title: string;
  ageGroup: string;
  price: number;
  duration: string;
}

/**
 * Programme registration modal.
 *
 * Extracted so /programs can be a Server Component: only this piece needs
 * client state, and the page itself is content.
 *
 * The previous version ignored the API response and rendered a success screen
 * on failure, including on a dropped connection.
 */
export default function RegistrationModal({
  program,
  onClose,
}: {
  program: ProgramSummary | null;
  onClose?: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );

  // Reset when a different programme is opened.
  useEffect(() => {
    setName("");
    setEmail("");
    setAge("");
    setErrorMsg("");
    setFieldErrors({});
    setSuccess(false);
  }, [program?.id]);

  if (!program) return null;
  const activeProgram = program;

  function validate() {
    const errors: Record<string, string> = {};
    if (name.trim().length < 2) errors.name = "Please enter the athlete's name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = "Enter a valid email address";
    }
    const parsedAge = Number(age);
    if (!age) errors.age = "Enter the athlete's age";
    else if (!Number.isFinite(parsedAge) || parsedAge < 4 || parsedAge > 60) {
      errors.age = "Age must be between 4 and 60";
    }
    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMsg("");

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          bookingType: "program",
          itemId: activeProgram.id,
          itemTitle: `${activeProgram.title} (${age ? `Age ${age}` : activeProgram.ageGroup})`,
          seatsCount: 1,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSuccess(false);
        setErrorMsg(data?.error ?? "We could not complete the registration. Please try again.");
        return;
      }

      setSuccess(true);
      timer.current = setTimeout(() => setSuccess(false), 5000);
    } catch {
      // A dropped connection is not a completed registration.
      setSuccess(false);
      setErrorMsg("We could not reach the server. Your registration was not submitted.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal open={Boolean(program)} onClose={onClose ?? (() => {})} title={program.title}>
      {success ? (
        <div role="status" className="py-4 text-center">
          <span
            aria-hidden="true"
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-2xl text-success-700"
          >
            <FaCheck />
          </span>
          <h3 className="mt-4 text-lg font-bold text-ink-900">Registration received</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
            We&apos;ve held a place for {name}. The coaching desk will confirm by email shortly.
          </p>
          <Link href="/account?tab=bookings" className="apex-btn apex-btn-secondary apex-btn-sm mt-6">
            View my bookings
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          {errorMsg && (
            <div role="alert" className="apex-alert apex-alert-error">
              {errorMsg}
            </div>
          )}

          <Field label="Athlete name" error={fieldErrors.name} required>
            {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
              <input
                id={id}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jordan Matthews"
                autoComplete="name"
                disabled={submitting}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className="apex-input"
              />
            )}
          </Field>

          <Field label="Email address" error={fieldErrors.email} required>
            {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
              <input
                id={id}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                autoComplete="email"
                disabled={submitting}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className="apex-input"
              />
            )}
          </Field>

          <Field
            label="Athlete age"
            error={fieldErrors.age}
            hint="Used to place the athlete in the right group"
            required
          >
            {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
              <input
                id={id}
                type="number"
                inputMode="numeric"
                min={4}
                max={60}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="11"
                disabled={submitting}
                aria-invalid={invalid}
                aria-describedby={describedBy}
                className="apex-input"
              />
            )}
          </Field>

          <Button type="submit" block loading={submitting} loadingText="Registering…">
            Register interest
          </Button>

          <p className="text-center text-xs text-ink-500">
            No payment is taken now. The coaching desk confirms availability first.
          </p>
        </form>
      )}
    </Modal>
  );
}