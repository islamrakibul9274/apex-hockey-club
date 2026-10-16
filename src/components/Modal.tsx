"use client";

import React, { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FaXmark } from "react-icons/fa6";
import { useEscapeKey, useFocusTrap } from "@/lib/useDialog";

/** Nothing ever changes, so the subscription never fires. */
function subscribeToNothing(onChange: () => void): () => void {
  return () => {
    void onChange;
  };
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Hide the visible title but keep it as the accessible name. */
  hideTitle?: boolean;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Side panels slide in; centred dialogs fade and scale. */
  variant?: "center" | "right" | "bottom";
  className?: string;
}

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-lg",
  lg: "max-w-2xl",
};

/**
 * The single overlay primitive.
 *
 * Centralising this is what makes Escape-to-close, focus trapping, focus
 * restoration, scroll locking and backdrop dismissal consistent, instead of
 * nine overlays each reimplementing a different subset.
 */
export function Modal({
  open,
  onClose,
  title,
  hideTitle = false,
  children,
  size = "md",
  variant = "center",
  className = "",
}: ModalProps) {
  const ref = useFocusTrap<HTMLDivElement>(open);
  const titleId = React.useId();
  // Portals cannot render on the server. useSyncExternalStore reports false
  // during SSR and hydration and true afterwards, so the portal only appears
  // once the DOM exists.
  //
  // The previous version used a ref flipped in an effect and then read during
  // render, which is not safe: renders can be discarded, and reading a ref
  // during render is not allowed.
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  useEscapeKey(open, onClose);

  if (!open || !mounted) return null;

  const panelMotion =
    variant === "right"
      ? "animate-slide-in-right"
      : variant === "bottom"
        ? "animate-scale-in"
        : "animate-scale-in";

  const placement =
    variant === "right"
      ? "fixed inset-y-0 right-0 flex w-full max-w-md"
      : variant === "bottom"
        ? "fixed inset-x-0 bottom-0 flex justify-center"
        : "fixed inset-0 flex items-center justify-center p-4";

  return createPortal(
    <div className={`${placement} z-50`}>
      {/* Backdrop. Clicking it closes, matching the Escape key. */}
      <button
        type="button"
        aria-label={`Close ${title}`}
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-ink-900/50 backdrop-blur-sm"
      />

      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={[
          "relative z-10 bg-surface-0 shadow-lg outline-none",
          variant === "right"
            ? "h-full w-full max-w-md overflow-y-auto"
            : variant === "bottom"
              ? "w-full max-w-lg rounded-t-2xl p-6"
              : `w-full ${SIZES[size]} rounded-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto`,
          panelMotion,
          className,
        ].join(" ")}
      >
        <div className={hideTitle ? "sr-only" : "mb-5 pr-8"}>
          <h2 id={titleId} className="text-xl font-extrabold text-ink-900">
            {title}
          </h2>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="absolute right-3 top-3 rounded-md p-2 text-ink-500 transition-colors hover:bg-surface-100 hover:text-ink-800"
        >
          <FaXmark aria-hidden="true" className="text-lg" />
        </button>

        {children}
      </div>
    </div>,
    document.body
  );
}

export default Modal;