"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { addItemAction, submitReimbursementAction } from "@/app/actions/reimbursement-actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

import type { Reimbursement, ReimbursementItem } from "@/lib/api/types";

/** §5 fixes the category vocabulary on POST /:id/items. */
const CATEGORIES: Array<{ value: ReimbursementItem["category"]; label: string }> = [
  { value: "HOTEL", label: "Hotel" },
  { value: "TRANSPORT", label: "Transportasi" },
  { value: "MEAL", label: "Konsumsi" },
  { value: "TICKET", label: "Tiket" },
  { value: "OTHER", label: "Lainnya" },
];

/**
 * Adds one expense line to a DRAFT reimbursement — POST /:id/items — and, once
 * there is at least one item, offers the DRAFT → SUBMITTED transition from the
 * same screen. The server rejects a submit with no items, so the button is only
 * enabled when the list is non-empty.
 */
export function ReimbursementForm({
  reimbursement,
}: {
  reimbursement: Reimbursement;
}) {
  const router = useRouter();
  const isDraft = reimbursement.status === "DRAFT";

  const [addState, addAction, adding] = useActionState(addItemAction, null);
  const [submitState, submitAction, submitting] = useActionState(
    submitReimbursementAction,
    null,
  );

  const [category, setCategory] = useState<ReimbursementItem["category"]>("HOTEL");

  // Each successful add remounts the amount input, which is how the field is
  // cleared without a setState inside an effect. Stays 0 while the user types,
  // so the input is never remounted mid-entry.
  const addedKey = addState?.ok ? addState.data.id : 0;

  useEffect(() => {
    if (addState?.ok || submitState?.ok) router.refresh();
  }, [addState, submitState, router]);

  if (!isDraft) {
    return (
      <p className="text-caption text-tertiary">
        Reimbursement berstatus {reimbursement.status} tidak dapat diubah lagi.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-md">
      <form action={addAction} className="flex flex-col gap-3">
        <input type="hidden" name="reimbursementId" value={reimbursement.id} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field
            label="Kategori"
            htmlFor="item-category"
            required
            error={addState && !addState.ok ? addState.fields?.category : undefined}
          >
            <Select
              id="item-category"
              name="category"
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ReimbursementItem["category"])
              }
            >
              {CATEGORIES.map((entry) => (
                <option key={entry.value} value={entry.value}>
                  {entry.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Tanggal transaksi"
            htmlFor="item-date"
            required
            error={
              addState && !addState.ok ? addState.fields?.transactionDate : undefined
            }
          >
            <Input
              id="item-date"
              name="transactionDate"
              type="date"
              required
            />
          </Field>
        </div>

        <Field
          label="Deskripsi"
          htmlFor="item-description"
          required
          error={addState && !addState.ok ? addState.fields?.description : undefined}
        >
          <Input
            id="item-description"
            name="description"
            placeholder="Contoh: Hotel Aston Surabaya 2 malam"
            invalid={!!addState && !addState.ok}
            required
          />
        </Field>

        {/*
          The amount is uncontrolled and reset by `key`: remounting the input
          after a successful add clears it without a setState-in-effect, which
          also avoids the controlled/uncontrolled switch on first render.
        */}
        <Field
          label="Nominal"
          htmlFor="item-amount"
          required
          error={addState && !addState.ok ? addState.fields?.amount : undefined}
        >
          <div className="flex gap-2">
            <Input
              key={addedKey}
              id="item-amount"
              name="amount"
              inputMode="numeric"
              placeholder="1200000"
              invalid={!!addState && !addState.ok}
              required
            />
            <Button type="submit" icon="add" disabled={adding} className="shrink-0">
              {adding ? "Menambah..." : "Tambah"}
            </Button>
          </div>
        </Field>

        {addState && !addState.ok ? (
          <p
            className="flex items-center gap-1.5 text-caption text-error"
            role="alert"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              error
            </span>
            {addState.message}
          </p>
        ) : null}
        {addState?.ok ? (
          <p className="text-caption text-success">{addState.message}</p>
        ) : null}
      </form>

      <div className="flex flex-col gap-2 border-t border-outline-variant/20 pt-md sm:flex-row sm:items-center sm:justify-between">
        <p className="text-caption text-tertiary">
          Pengajuan hanya dapat dikirim setelah minimal satu item tercatat.
        </p>
        <form action={submitAction}>
          <input type="hidden" name="reimbursementId" value={reimbursement.id} />
          <Button
            type="submit"
            icon="send"
            disabled={submitting || !(reimbursement.items?.length ?? 0)}
          >
            {submitting ? "Mengirim..." : "Ajukan ke Finance"}
          </Button>
        </form>
      </div>

      {submitState && !submitState.ok ? (
        <p
          className="flex items-center gap-1.5 text-caption text-error"
          role="alert"
        >
          <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
            error
          </span>
          {submitState.message}
        </p>
      ) : null}
      {submitState?.ok ? (
        <p className="text-caption text-success">{submitState.message}</p>
      ) : null}
    </div>
  );
}
