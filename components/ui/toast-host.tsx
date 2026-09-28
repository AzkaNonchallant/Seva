"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Listens for `app:toast` window events.
 *
 * Booking creation closes its modal and revalidates the list behind it, so the
 * confirmation has nowhere else to live. Components dispatch the event; this
 * host is the single place that renders it.
 */
export function ToastHost() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(
    null,
  );

  useEffect(() => {
    function onToast(event: Event) {
      const message = (event as CustomEvent<{ message?: string }>).detail
        ?.message;
      if (!message) return;
      setToast({ id: Date.now(), message });
    }

    window.addEventListener("app:toast", onToast);
    return () => window.removeEventListener("app:toast", onToast);
  }, []);

  // Auto-dismiss, restarted whenever a new toast arrives.
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center px-margin-mobile pb-lg"
    >
      <div
        key={toast.id}
        className={cn(
          "pointer-events-auto flex max-w-md items-center gap-2.5 rounded-xl bg-inverse-surface px-4 py-3 shadow-float",
          "animate-[toast-in_200ms_ease-out]",
        )}
      >
        <span
          className="material-symbols-outlined shrink-0 text-inverse-on-surface"
          style={{ fontSize: 18 }}
          aria-hidden
        >
          check_circle
        </span>
        <p className="text-caption font-medium text-inverse-on-surface">
          {toast.message}
        </p>
        <button
          type="button"
          onClick={() => setToast(null)}
          aria-label="Tutup notifikasi"
          className="ml-1 shrink-0 rounded p-0.5 text-inverse-on-surface/70 transition-colors hover:text-inverse-on-surface"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 16 }} aria-hidden>
            close
          </span>
        </button>
      </div>
    </div>
  );
}
