"use client";

import React, { useState } from "react";
import {
  FaPaperPlane,
  FaEnvelope,
  FaClock,
  FaUsers,
  FaCircleCheck,
} from "react-icons/fa6";

/**
 * Contact section.
 *
 * Written fresh rather than adapted.
 *
 * The contact details this replaces were placeholders — (+62) 123-321-543,
 * hockeys@support.com and "152/1 Mohakhali Wireless Gate" — none of which
 * resolve to anyone. The address below is the inbox the form actually delivers
 * to, and we say plainly that we have not published a phone number rather than
 * printing an invented one.
 */

const CLUB_EMAIL = "islamrakibul9274@gmail.com";

const RESPONSE_TIMES = [
  {
    icon: FaClock,
    title: "Email response",
    body: "We reply to most messages within one working day, and always within two.",
  },
  {
    icon: FaUsers,
    title: "Group & team enquiries",
    body: "Teams of eight or more — include the age group and training frequency for a faster quote.",
  },
];

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "error"; message: string };

export default function ContactSection() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function update(field: keyof typeof form, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate() {
    const errors: Record<string, string> = {};
    if (form.name.trim().length < 2) errors.name = "Please tell us your name";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      errors.email = "Enter a valid email address";
    if (form.message.trim().length < 10)
      errors.message = "Add a little more detail (at least 10 characters)";
    return errors;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus({ kind: "error", message: "Check the highlighted fields." });
      return;
    }

    setStatus({ kind: "sending" });

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          subject: form.subject.trim() || "General enquiry",
          message: form.message.trim(),
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // A failure is never shown as a success.
        setStatus({
          kind: "error",
          message: data?.error ?? "We could not send that. Please try again.",
        });
        return;
      }

      setStatus({ kind: "sent" });
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus({
        kind: "error",
        message: "We could not reach the server. Your message was not sent — please try again.",
      });
    }
  }

  const sending = status.kind === "sending";

  return (
    <section aria-labelledby="contact-heading" className="border-t border-line-200 bg-surface-50 apex-section">
      <div className="apex-container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="apex-badge apex-badge-brand uppercase tracking-widest">
            Concierge &amp; support
          </span>
          <h2 id="contact-heading" className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
            Get in touch
          </h2>
          <p className="mt-4 leading-relaxed text-ink-600">
            Questions about programmes, private sessions or team bookings — tell us what you need
            and we will come back with options.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-5 lg:gap-8">
          {/* Details column */}
          <div className="lg:col-span-2">
            <div className="apex-card h-full p-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-ink-500">
                Reach the club
              </h3>

              <dl className="mt-4 space-y-4">
                <div className="flex gap-3">
                  <dt className="shrink-0">
                    <span
                      aria-hidden="true"
                      className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
                    >
                      <FaEnvelope />
                    </span>
                    <span className="sr-only">Email</span>
                  </dt>
                  <dd className="min-w-0">
                    <p className="text-sm font-semibold text-ink-900">Email</p>
                    <a
                      href={`mailto:${CLUB_EMAIL}`}
                      className="mt-0.5 block break-all text-sm text-ink-600 transition-colors hover:text-brand-600"
                    >
                      {CLUB_EMAIL}
                    </a>
                  </dd>
                </div>

                {RESPONSE_TIMES.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex gap-3">
                      <dt className="shrink-0">
                        <span
                          aria-hidden="true"
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"
                        >
                          <Icon />
                        </span>
                        <span className="sr-only">{item.title}</span>
                      </dt>
                      <dd className="min-w-0">
                        <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-ink-600">{item.body}</p>
                      </dd>
                    </div>
                  );
                })}
              </dl>

              <p className="mt-5 rounded-xl bg-surface-100 p-3 text-xs leading-relaxed text-ink-600">
                We have not published a phone number. Email reaches the coaching desk directly and
                is the fastest way to get an answer on sizing and availability.
              </p>
            </div>
          </div>

          {/* Form column */}
          <div className="lg:col-span-3">
            <div className="apex-card p-6 sm:p-8">
              {status.kind === "sent" ? (
                <div role="status" className="py-6 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success-50 text-2xl text-success-700"
                  >
                    <FaCircleCheck />
                  </span>
                  <h3 className="mt-4 text-xl font-bold text-ink-900">Message sent</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-600">
                    Thanks — your message reached the coaching desk. We usually reply within one
                    working day.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus({ kind: "idle" })}
                    className="apex-btn apex-btn-secondary apex-btn-sm mt-6"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <h3 className="text-lg font-bold text-ink-900">Send a message</h3>

                  {status.kind === "error" && (
                    <div role="alert" className="apex-alert apex-alert-error">
                      {status.message}
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="c-name" className="apex-label">
                        Your name <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="c-name"
                        type="text"
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        placeholder="Jordan Matthews"
                        autoComplete="name"
                        disabled={sending}
                        aria-invalid={fieldErrors.name ? true : undefined}
                        aria-describedby={fieldErrors.name ? "c-name-err" : undefined}
                        className="apex-input"
                      />
                      {fieldErrors.name && (
                        <p id="c-name-err" className="apex-field-error">
                          {fieldErrors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="c-email" className="apex-label">
                        Your email <span aria-hidden="true">*</span>
                      </label>
                      <input
                        id="c-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => update("email", e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        disabled={sending}
                        aria-invalid={fieldErrors.email ? true : undefined}
                        aria-describedby={fieldErrors.email ? "c-email-err" : undefined}
                        className="apex-input"
                      />
                      {fieldErrors.email && (
                        <p id="c-email-err" className="apex-field-error">
                          {fieldErrors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label htmlFor="c-subject" className="apex-label">
                      Subject
                    </label>
                    <input
                      id="c-subject"
                      type="text"
                      value={form.subject}
                      onChange={(e) => update("subject", e.target.value)}
                      placeholder="Training camp inquiry, arena pass, team booking…"
                      disabled={sending}
                      className="apex-input"
                    />
                  </div>

                  <div>
                    <label htmlFor="c-message" className="apex-label">
                      Message <span aria-hidden="true">*</span>
                    </label>
                    <textarea
                      id="c-message"
                      rows={5}
                      value={form.message}
                      onChange={(e) => update("message", e.target.value)}
                      placeholder="Tell us the age group, the programme you're interested in, and any dates that work for you."
                      disabled={sending}
                      aria-invalid={fieldErrors.message ? true : undefined}
                      aria-describedby={fieldErrors.message ? "c-message-err" : undefined}
                      className="apex-input resize-y"
                    />
                    {fieldErrors.message && (
                      <p id="c-message-err" className="apex-field-error">
                        {fieldErrors.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={sending}
                    className="apex-btn apex-btn-primary apex-btn-lg apex-btn-block"
                  >
                    {sending ? (
                      <>
                        <span className="apex-spinner apex-spinner-sm" aria-hidden="true" />
                        Sending…
                      </>
                    ) : (
                      <>
                        <FaPaperPlane aria-hidden="true" />
                        Send message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}