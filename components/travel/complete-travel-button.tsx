"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { completeTravelAction } from "@/app/actions/travel-admin-actions";

export function CompleteTravelButton({
  travelId,
  canComplete,
}: {
  travelId: number;
  canComplete: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(completeTravelAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <div className="flex flex-col items-start gap-1 lg:items-end">
      <form action={formAction}>
        <input type="hidden" name="travelId" value={travelId} />
        <button
          type="submit"
          disabled={!canComplete || pending}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-primary px-md text-caption font-semibold text-on-primary transition-colors hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50"
          title={canComplete ? "Tandai perjalanan selesai" : "Aktif setelah tanggal akhir perjalanan lewat"}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }} aria-hidden>
            task_alt
          </span>
          {pending ? "Menyelesaikan..." : "Tandai Selesai"}
        </button>
      </form>
      {state && !state.ok ? (
        <p className="max-w-56 text-right text-caption text-error" role="alert">
          {state.message}
        </p>
      ) : null}
      {state?.ok ? <p className="text-caption text-success">{state.message}</p> : null}
    </div>
  );
}
