"use client";

import React, { useState } from "react";
import RegistrationModal, { type ProgramSummary } from "@/components/RegistrationModal";

/**
 * Opens the programme registration modal.
 *
 * This is the only client-side piece of the programmes page. It holds the
 * "which programme is open" state so /programs itself can stay a Server
 * Component — the page ships almost no JavaScript and works without it,
 * apart from the modal itself.
 */
export default function RegisterButton({ program }: { program: ProgramSummary }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="apex-btn apex-btn-primary"
      >
        Register interest
      </button>

      <RegistrationModal program={open ? program : null} onClose={() => setOpen(false)} />
    </>
  );
}