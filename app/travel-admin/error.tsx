"use client";

import Link from "next/link";
import { useEffect } from "react";

import { ErrorState } from "@/components/ui/error-state";

/**
 * Catches render-time failures inside the Travel Admin area. A failed fetch
 * must never leave the user staring at a blank shell, so this offers the error
 * and a retry rather than swallowing it.
 */
export default function TravelAdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaces the failure in the browser console during development.
    console.error("Travel Admin screen failed:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-md">
      <ErrorState error={error} onRetry={reset} />
      <Link
        href="/travel-admin/dashboard"
        className="absolute bottom-md text-caption font-semibold text-primary hover:underline"
      >
        Kembali ke dashboard
      </Link>
    </div>
  );
}
