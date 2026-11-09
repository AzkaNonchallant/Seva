"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { verifyReimbursementAction } from "@/app/actions/reimbursement-actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { toNumber } from "@/lib/api/types";

export function FinanceVerificationForm({
  reimbursementId,
  totalAmount,
}: {
  reimbursementId: number;
  totalAmount: number | string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(verifyReimbursementAction, null);
  const total = toNumber(totalAmount);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-md">
      <input type="hidden" name="reimbursementId" value={reimbursementId} />
      <Field label="Nominal disetujui Finance" htmlFor="approved-amount" required>
        <Input
          id="approved-amount"
          name="approvedAmount"
          type="number"
          min="0"
          max={total}
          step="1"
          defaultValue={total}
          required
        />
      </Field>
      <p className="-mt-2 text-caption text-tertiary">
        Maksimal sebesar total pengajuan ({new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(total)}). Selisih uang muka dihitung otomatis.
      </p>
      {state && !state.ok ? (
        <p className="text-caption text-error" role="alert">{state.message}</p>
      ) : null}
      {state?.ok ? (
        <p className="text-caption text-success" role="status">{state.message}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" name="status" value="APPROVED" icon="check_circle" disabled={pending}>
          {pending ? "Memproses..." : "Setujui"}
        </Button>
        <Button type="submit" name="status" value="REJECTED" variant="outline" icon="block" disabled={pending}>
          Tolak
        </Button>
      </div>
    </form>
  );
}
