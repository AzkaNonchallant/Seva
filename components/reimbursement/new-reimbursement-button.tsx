"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { createReimbursementAction } from "@/app/actions/reimbursement-actions";
import { Button } from "@/components/ui/button";


/**
 * Starts a reimbursement for one COMPLETED travel — POST /api/reimbursements.
 * On success the new DRAFT's id is the only thing worth showing, so the user is
 * sent straight to its detail page.
 */
export function NewReimbursementButton({ travelId }: { travelId: number }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createReimbursementAction,
    null,
  );

  useEffect(() => {
    if (state?.ok) router.push(`/employee/reimbursements/${state.data.id}`);
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1">
      <input type="hidden" name="travelId" value={travelId} />
      <Button type="submit" size="sm" icon="add" disabled={pending}>
        {pending ? "Membuat..." : "Buat Reimbursement"}
      </Button>
      {state && !state.ok ? (
        <p
          className="flex items-center gap-1 text-caption text-error"
          role="alert"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
