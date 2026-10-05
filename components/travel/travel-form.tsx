"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  createTravelAction,
  updateTravelAction,
} from "@/app/actions/travel-actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { formatIDR, formatDateRange } from "@/lib/utils";

import type { TravelPolicy, TravelRequest } from "@/lib/api/types";

/**
 * Create or edit a travel request — POST /api/travel and PATCH /api/travel/:id.
 *
 * Field names are the spec's own. The form is used for both create and edit
 * because the contract sends the identical body to both; only the endpoint and
 * the DRAFT restriction differ, and that restriction is enforced server-side.
 */
export function TravelForm({
  travel,
  policies,
}: {
  /** Present when editing an existing DRAFT; absent when creating. */
  travel?: TravelRequest;
  policies: TravelPolicy[];
}) {
  const router = useRouter();
  const action = travel ? updateTravelAction : createTravelAction;
  const [state, formAction, pending] = useActionState(action, null);

  // Cost is typed in rupiah with thousand separators, so the raw field holds
  // digits only and the formatted value is derived for display.
  const [cost, setCost] = useState(
    travel ? String(travel.estimatedCost) : "",
  );
  const [policyId, setPolicyId] = useState(
    travel?.policyId ? String(travel.policyId) : "",
  );
  const [startDate, setStartDate] = useState(travel?.startDate ?? "");
  const [endDate, setEndDate] = useState(travel?.endDate ?? "");

  const selected = policies.find((policy) => String(policy.id) === policyId);
  const dateOrderWrong = !!startDate && !!endDate && endDate < startDate;

  useEffect(() => {
    if (state?.ok) router.push(`/employee/travel/${state.data.id}`);
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-md">
      {travel ? <input type="hidden" name="travelId" value={travel.id} /> : null}
      <input type="hidden" name="policyId" value={policyId} />

      <Field
        label="Tujuan"
        htmlFor="destination"
        required
        error={state && !state.ok ? state.fields?.destination : undefined}
      >
        <Input
          id="destination"
          name="destination"
          defaultValue={travel?.destination ?? ""}
          placeholder="Kota atau lokasi tujuan"
          invalid={!!state && !state.ok}
          required
        />
      </Field>

      <Field
        label="Tujuan dana"
        htmlFor="purpose"
        required
        hint="Ringkasan singkat kegiatan dinas, akan tampil pada approval."
        error={state && !state.ok ? state.fields?.purpose : undefined}
      >
        <Textarea
          id="purpose"
          name="purpose"
          rows={3}
          defaultValue={travel?.purpose ?? ""}
          placeholder="Contoh: Kunjungan klien & training tim sales"
          invalid={!!state && !state.ok}
          required
        />
      </Field>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field
          label="Tanggal mulai"
          htmlFor="startDate"
          required
          error={state && !state.ok ? state.fields?.startDate : undefined}
        >
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
            invalid={!!state && !state.ok}
            required
          />
        </Field>

        <Field
          label="Tanggal selesai"
          htmlFor="endDate"
          required
          error={
            state && !state.ok
              ? state.fields?.endDate
              : dateOrderWrong
                ? "Tanggal selesai tidak boleh sebelum tanggal mulai."
                : undefined
          }
          hint={
            startDate && endDate && !dateOrderWrong
              ? formatDateRange(startDate, endDate)
              : undefined
          }
        >
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
            invalid={!!state && !state.ok || dateOrderWrong}
            required
          />
        </Field>
      </div>

      <Field
        label="Perkiraan biaya"
        htmlFor="estimatedCost"
        required
        hint="Masukkan angka saja, pemisah ribuan ditambahkan otomatis."
        error={state && !state.ok ? state.fields?.estimatedCost : undefined}
      >
        <Input
          id="estimatedCost"
          name="estimatedCost"
          inputMode="numeric"
          value={cost}
          onChange={(event) => setCost(event.target.value.replace(/\D/g, ""))}
          placeholder="4500000"
          invalid={!!state && !state.ok}
          required
        />
      </Field>

      <Field
        label="Travel policy"
        htmlFor="policyId"
        hint="Daftar di bawah berasal dari GET /api/travel/policies/applicable, yang sudah disaring sesuai jabatan Anda."
      >
        <Select
          id="policyId"
          name="policySelect"
          value={policyId}
          onChange={(event) => setPolicyId(event.target.value)}
        >
          <option value="">Tanpa policy</option>
          {policies.map((policy) => (
            <option key={policy.id} value={policy.id}>
              {policy.name}
            </option>
          ))}
        </Select>
      </Field>

      {selected ? (
        <div className="rounded-lg bg-surface-container-low p-3">
          <p className="text-caption font-semibold text-on-surface">
            Batas pada kebijakan ini
          </p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-caption text-on-surface-variant">
            <span>
              Hotel{" "}
              <strong className="font-semibold text-on-surface">
                {formatIDR(selected.hotelLimit)}
              </strong>
            </span>
            <span>
              Transportasi{" "}
              <strong className="font-semibold text-on-surface">
                {formatIDR(selected.transportLimit)}
              </strong>
            </span>
            <span>
              Uang saku{" "}
              <strong className="font-semibold text-on-surface">
                {formatIDR(selected.allowanceLimit)}
              </strong>
            </span>
          </p>
          <p className="mt-1.5 text-caption text-tertiary">
            Batas berlaku per komponen, bukan pada total estimasi. Backend yang
            memvalidasinya.
          </p>
        </div>
      ) : null}

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

      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push("/employee/travel")}
        >
          Batal
        </Button>
        <Button
          type="submit"
          disabled={pending || dateOrderWrong}
        >
          {pending
            ? "Menyimpan..."
            : travel
              ? "Simpan Perubahan"
              : "Simpan sebagai Draft"}
        </Button>
      </div>

      <p className="text-caption text-tertiary">
        Pengajuan baru disimpan sebagai DRAFT dan belum masuk antrean approval
        sampai Anda menekan tombol kirim pada halaman detail.
      </p>
    </form>
  );
}
