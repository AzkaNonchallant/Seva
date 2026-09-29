"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

/** URL-driven pager; the page number lives in `?page=`. */
export function Pagination({
  page,
  perPage,
  total,
}: {
  page: number;
  perPage: number;
  total: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  function go(next: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (next <= 1) params.delete("page");
    else params.set("page", String(next));
    const query = params.toString();
    startTransition(() => {
      router.replace(query ? `?${query}` : window.location.pathname, {
        scroll: false,
      });
    });
  }

  return (
    <div className="flex flex-col items-start justify-between gap-2 border-t border-outline-variant/20 p-4 sm:flex-row sm:items-center">
      <span className="text-caption text-on-surface-variant">
        Menampilkan {from}–{to} dari {total} data
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => go(page - 1)}
          disabled={page <= 1 || isPending}
          className="rounded border border-outline-variant/50 px-3 py-1 text-caption transition-colors hover:bg-surface-container disabled:opacity-40"
        >
          Sebelumnya
        </button>
        <span className="text-caption text-on-surface-variant">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => go(page + 1)}
          disabled={page >= totalPages || isPending}
          className="rounded border border-outline-variant/50 px-3 py-1 text-caption transition-colors hover:bg-surface-container disabled:opacity-40"
        >
          Berikutnya
        </button>
      </div>
    </div>
  );
}
