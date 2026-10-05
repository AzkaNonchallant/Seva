"use client";

import { useActionState, useState } from "react";

import { submitBookingAction } from "@/app/actions/booking-actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

import type { ActionResult } from "@/app/actions/action-result";
import type { Booking, BookingType, CreateBookingInput } from "@/lib/api/types";
import { toNumber } from "@/lib/api/types";
import { formatIDR } from "@/lib/utils";

const TYPE_LABEL: Record<BookingType, string> = {
  FLIGHT: "Penerbangan",
  HOTEL: "Hotel",
  TRAIN: "Kereta Api",
  TRANSPORT: "Transportasi Darat",
};

const EMPTY: ActionResult<Booking> | null = null;

/**
 * Create-booking form for one APPROVED travel request.
 *
 * Field set follows `CreateBookingInput`. Only the fields that matter per type
 * are shown — a hotel has no departure airport, a flight has no check-in date.
 */
export function BookingForm({
  travelId,
  travelLabel,
  destination,
  travelWindow,
  estimatedCost,
  onSuccess,
  onCancel,
}: {
  travelId: number;
  travelLabel: string;
  destination: string;
  travelWindow: string;
  estimatedCost: number;
  onSuccess?: (message: string) => void;
  onCancel?: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    async (_prev: ActionResult<Booking> | null, formData: FormData) => {
      // The backend's booking model is a provider, a confirmation code, one
      // date and a free-text description — not the origin/destination and
      // per-night date range the older spec described.
      const payload: CreateBookingInput = {
        type: formData.get("type") as BookingType,
        provider: String(formData.get("provider") ?? "").trim() || undefined,
        bookingCode:
          String(formData.get("bookingCode") ?? "").trim() || undefined,
        description:
          String(formData.get("description") ?? "").trim() || undefined,
        bookingDate:
          String(formData.get("bookingDate") ?? "").trim() || undefined,
        amount: Number(formData.get("amount") ?? 0),
        notes: String(formData.get("notes") ?? "").trim() || undefined,
      };
      return submitBookingAction(travelId, payload);
    },
    EMPTY,
  );

  const [type, setType] = useState<BookingType>("FLIGHT");
  const [amount, setAmount] = useState(estimatedCost);

  const fields = state && !state.ok ? state.fields : undefined;

  // A successful action is terminal: the modal is closed from here, so the
  // form never needs to return to its editable state.
  if (state?.ok) {
    // `amount` crosses the wire as a decimal string, so it is compared as a
    // number rather than the string it is.
    const overBudget =
      toNumber(state.data.amount) > estimatedCost * 1.1 && estimatedCost > 0;
    return (
      <div className="flex flex-col items-center px-md py-lg text-center">
        <span className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-success-container text-success">
          <span className="material-symbols-outlined" style={{ fontSize: 28 }}>
            check_circle
          </span>
        </span>
        <p className="text-label-md font-semibold text-on-surface">
          Booking berhasil dibuat
        </p>
        <p className="mt-1 max-w-sm text-caption text-on-surface-variant">
          {state.data.bookingCode ?? state.data.provider ?? "Booking"} untuk{" "}
          {travelLabel} sudah masuk daftar dan menunggu konfirmasi.
        </p>
        {overBudget ? (
          <p className="mt-3 flex items-start gap-1.5 rounded-lg bg-warning-container px-3 py-2 text-left text-caption text-warning">
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>
              warning
            </span>
            Nilai booking melebihi estimasi pengajuan lebih dari 10%. Sertakan
            justifikasi saat reimbursement.
          </p>
        ) : null}
        <Button
          className="mt-md"
          icon="check"
          onClick={() => {
            // The travel leaves the queue once it gains its first booking, so
            // the list behind the modal is stale until it is revalidated.
            onSuccess?.(
              `${state.data.bookingCode ?? state.data.provider ?? "Booking"} untuk ${travelLabel} berhasil dibuat.`,
            );
            onCancel?.();
          }}
        >
          Selesai
        </Button>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-md p-md">
      <div className="rounded-lg bg-surface-container-low p-3">
        <p className="text-label-md font-semibold text-on-surface">
          {travelLabel}
        </p>
        <p className="mt-0.5 text-caption text-on-surface-variant">
          {destination} • {travelWindow} • estimasi{" "}
          <span className="font-medium text-on-surface">
            {formatIDR(estimatedCost)}
          </span>
        </p>
      </div>

      {state && !state.ok ? (
        <p
          role="alert"
          className="rounded-lg bg-error-container px-3 py-2 text-caption font-medium text-on-error-container"
        >
          {state.message}
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field label="Jenis Booking" htmlFor="type" required error={fields?.type}>
          <Select
            id="type"
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as BookingType)}
          >
            {Object.entries(TYPE_LABEL).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={type === "HOTEL" ? "Nama Hotel" : "Mitra / Maskapai"}
          htmlFor="provider"
        >
          <Input
            id="provider"
            name="provider"
            placeholder={
              type === "HOTEL" ? "Aston Surabaya" : "Garuda Indonesia"
            }
          />
        </Field>
      </div>

      <Field
        label="Kode Pemesanan"
        htmlFor="bookingCode"
        hint="Boleh diisi setelah supplier mengonfirmasi."
      >
        <Input id="bookingCode" name="bookingCode" placeholder="ABC123" />
      </Field>

      <Field label="Keterangan" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={2}
          placeholder={
            type === "HOTEL"
              ? "Kamar superior 3 malam"
              : "Tiket pesawat ekonomi"
          }
        />
      </Field>

      <Field
        label="Tanggal Pemesanan"
        htmlFor="bookingDate"
        hint="Tanggal pemesanan atau check-in, sesuai jenis booking."
      >
        <Input id="bookingDate" name="bookingDate" type="date" />
      </Field>

      <Field
        label="Nilai Booking (Rp)"
        htmlFor="amount"
        required
        error={fields?.amount}
        hint={`Estimasi pengajuan: ${formatIDR(estimatedCost)}`}
      >
        <Input
          id="amount"
          name="amount"
          type="number"
          min={0}
          step={1000}
          value={amount}
          onChange={(event) => setAmount(Number(event.target.value))}
          required
        />
      </Field>

      <Field label="Catatan" htmlFor="notes">
        <Textarea id="notes" name="notes" rows={2} placeholder="Opsional" />
      </Field>

      <div className="flex flex-col-reverse gap-1.5 border-t border-outline-variant/20 pt-md sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="ghost"
          onClick={() => onCancel?.()}
          disabled={pending}
        >
          Batal
        </Button>
        <Button type="submit" variant="secondary" icon="add" disabled={pending}>
          {pending ? "Menyimpan..." : "Simpan Booking"}
        </Button>
      </div>
    </form>
  );
}
