"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { deleteItemAction } from "@/app/actions/reimbursement-actions";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatIDR } from "@/lib/utils";

import type { ReimbursementItem } from "@/lib/api/types";

const CATEGORY_LABEL: Record<ReimbursementItem["category"], string> = {
  HOTEL: "Hotel",
  TRANSPORT: "Transportasi",
  MEAL: "Konsumsi",
  ALLOWANCE: "Uang Saku",
  OTHER: "Lainnya",
};

/**
 * The item list of one reimbursement, with per-row delete while the header is
 * still DRAFT (DELETE /api/reimbursements/items/:itemId).
 */
export function ExpenseItemList({
  reimbursementId,
  items,
  canDelete,
}: {
  reimbursementId: number;
  items: ReimbursementItem[];
  canDelete: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(deleteItemAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  if (!items.length) {
    return (
      <EmptyState
        icon="receipt_long"
        title="Belum ada item"
        description="Tambahkan pengeluaran satu per satu, lengkap dengan tanggal transaksi."
      />
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <ul className="flex flex-col divide-y divide-outline-variant/15">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-md text-on-surface">
                {item.description}
              </p>
              <p className="text-caption text-tertiary">
                {CATEGORY_LABEL[item.category]} • {formatDate(item.transactionDate)}
                {item.receiptPath ? " • ada nota" : ""}
              </p>
            </div>
            <span className="shrink-0 text-label-md font-semibold text-on-surface">
              {formatIDR(item.amount)}
            </span>
            {canDelete ? (
              <form action={formAction}>
                <input type="hidden" name="reimbursementId" value={reimbursementId} />
                <input type="hidden" name="itemId" value={item.id} />
                <Button
                  type="submit"
                  size="sm"
                  variant="ghost"
                  icon="delete"
                  disabled={pending}
                >
                  {pending ? "..." : "Hapus"}
                </Button>
              </form>
            ) : null}
          </li>
        ))}
      </ul>

      {state && !state.ok ? (
        <p
          className="flex items-center gap-1.5 text-caption text-error"
          role="alert"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {state.message}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-caption text-success">{state.message}</p>
      ) : null}
    </div>
  );
}
