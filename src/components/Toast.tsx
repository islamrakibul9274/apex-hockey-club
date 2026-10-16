"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { FaCircleCheck, FaCircleExclamation, FaCircleInfo, FaXmark } from "react-icons/fa6";

export type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TONE_STYLES: Record<ToastTone, string> = {
  success: "bg-success-50 text-success-700 border-success-700",
  error: "bg-danger-50 text-danger-600 border-danger-600",
  info: "bg-info-50 text-info-700 border-info-700",
};

const TONE_ICONS = {
  success: FaCircleCheck,
  error: FaCircleExclamation,
  info: FaCircleInfo,
};

/**
 * Toast notifications.
 *
 * Ad-hoc toasts in the product grid had no ARIA role, so screen readers never
 * announced them. These render in a polite live region.
 */
/** Nothing ever changes, so the subscription never fires. */
function subscribeToNothing(onChange: () => void): () => void {
  return () => {
    void onChange;
  };
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // The live region is rendered through a portal, so it needs the DOM to
  // exist. useSyncExternalStore reports false on the server and during
  // hydration and true afterwards, which is the same approach Modal uses —
  // an effect that flips a boolean would cause a second render pass on every
  // page that mounts a ToastProvider.
  const mounted = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false
  );

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (message: string, tone: ToastTone = "success") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
      // Auto-dismiss. The timer is owned by the toast list so it can be
      // cancelled cleanly rather than leaking a setTimeout on unmount.
      window.setTimeout(() => dismiss(id), 4500);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {mounted &&
        createPortal(
          <div
            // Announced without interrupting; errors use assert below.
            aria-live="polite"
            aria-atomic="false"
            className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-6"
          >
            {toasts.map((t) => {
              const Icon = TONE_ICONS[t.tone];
              return (
                <div
                  key={t.id}
                  role={t.tone === "error" ? "alert" : "status"}
                  className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 text-sm font-medium shadow-md ${TONE_STYLES[t.tone]}`}
                >
                  <Icon aria-hidden="true" className="mt-0.5 shrink-0" />
                  <span className="flex-1">{t.message}</span>
                  <button
                    type="button"
                    onClick={() => dismiss(t.id)}
                    aria-label="Dismiss notification"
                    className="shrink-0 rounded p-0.5 opacity-70 hover:opacity-100"
                  >
                    <FaXmark aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Falling back keeps the hook usable in tests and Storybook-style renders.
    return { toast: () => {} };
  }
  return ctx;
}