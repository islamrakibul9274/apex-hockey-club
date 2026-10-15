"use client";

import React, { useId, useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { checkPassword, passwordScore, passwordStrengthLabel, PASSWORD_POLICY } from "@/lib/validation";

/* ------------------------------------------------------------------ */
/* Spinner                                                            */
/* ------------------------------------------------------------------ */

export function Spinner({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Button                                                             */
/* ------------------------------------------------------------------ */

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  block?: boolean;
  loading?: boolean;
  loadingText?: string;
}

export function Button({
  variant = "primary",
  size = "md",
  block = false,
  loading = false,
  loadingText,
  className = "",
  children,
  disabled,
  type = "button",
  ...rest
}: ButtonProps) {
  const classes = [
    "apex-btn",
    `apex-btn-${variant}`,
    size !== "md" ? `apex-btn-${size}` : "",
    block ? "apex-btn-block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} disabled={disabled || loading} {...rest}>
      {loading && <Spinner />}
      <span>{loading && loadingText ? loadingText : children}</span>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/* Field                                                              */
/* ------------------------------------------------------------------ */

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (props: {
    id: string;
    "aria-invalid": boolean | undefined;
    "aria-describedby": string | undefined;
  }) => React.ReactNode;
}

/**
 * Wraps a control with a programmatically associated label and wires up
 * aria-describedby for hints and errors. The codebase previously had zero
 * htmlFor attributes across 32 labels.
 */
export function Field({ label, error, hint, required, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div>
      <label htmlFor={id} className="apex-label">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-0.5" style={{ color: "var(--danger-600)" }}>
            *
          </span>
        )}
      </label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint && !error && (
        <p id={hintId} className="apex-field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="apex-field-error">
          {error}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Password input + strength meter                                    */
/* ------------------------------------------------------------------ */

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  autoComplete?: string;
  disabled?: boolean;
  showMeter?: boolean;
  placeholder?: string;
}

const METER_COLORS = [
  "var(--danger-600)",
  "var(--danger-600)",
  "var(--warning-700)",
  "var(--brand-500)",
  "var(--success-700)",
];

export function PasswordInput({
  value,
  onChange,
  label = "Password",
  error,
  hint,
  autoComplete = "current-password",
  disabled,
  showMeter = false,
  placeholder = "••••••••",
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const score = passwordScore(value);
  const label_text = passwordStrengthLabel(score);

  return (
    <Field label={label} error={error} hint={hint} required>
      {({ id, "aria-invalid": invalid, "aria-describedby": describedBy }) => (
        <>
          <div className="relative">
            <input
              id={id}
              type={visible ? "text" : "password"}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              autoComplete={autoComplete}
              disabled={disabled}
              aria-invalid={invalid}
              aria-describedby={describedBy}
              className="apex-input pr-11"
            />
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              disabled={disabled}
              aria-label={visible ? "Hide password" : "Show password"}
              className="absolute right-1 top-1/2 -translate-y-1/2 rounded p-2 text-[var(--ink-500)] hover:bg-[var(--surface-100)] hover:text-[var(--ink-700)]"
            >
              {visible ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
            </button>
          </div>

          {showMeter && value.length > 0 && (
            <div className="mt-2.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs font-medium text-[var(--ink-600)]">Password strength</span>
                <span className="text-xs font-semibold" style={{ color: METER_COLORS[score] }}>
                  {label_text}
                </span>
              </div>
              <div
                className="mt-1.5 flex gap-1"
                role="progressbar"
                aria-label="Password strength"
                aria-valuemin={0}
                aria-valuemax={PASSWORD_POLICY ? 4 : 4}
                aria-valuenow={score}
                aria-valuetext={label_text}
              >
                {[0, 1, 2, 3].map((i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="h-1.5 flex-1 rounded-full transition-colors"
                    style={{
                      backgroundColor: i < score ? METER_COLORS[score] : "var(--line-200)",
                    }}
                  />
                ))}
              </div>
              <ul className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                {checkPassword(value).map((check) => (
                  <li
                    key={check.id}
                    className="flex items-center gap-1.5 text-xs"
                    style={{
                      color: check.passed ? "var(--success-700)" : "var(--ink-500)",
                    }}
                  >
                    <span aria-hidden="true">{check.passed ? "✓" : "○"}</span>
                    {check.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/* Alert                                                              */
/* ------------------------------------------------------------------ */

export function Alert({
  tone = "error",
  children,
  className = "",
}: {
  tone?: "error" | "success" | "info";
  children: React.ReactNode;
  className?: string;
}) {
  return (
    // role=alert makes assistive tech announce the message as soon as it appears.
    <div role="alert" className={`apex-alert apex-alert-${tone} ${className}`}>
      {children}
    </div>
  );
}