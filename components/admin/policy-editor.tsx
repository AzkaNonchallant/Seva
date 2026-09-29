"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { savePolicyAction } from "@/app/actions/master-data-actions";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";

import type { Position, TravelPolicy } from "@/lib/api/types";

/**
 * Create or edit one travel policy — POST /api/travel/policies and
 * PUT /api/travel/policies/:id.
 *
 * `positionId` and `maxEstimatedCost` use 0 as the "applies to all" / "uncapped"
 * sentinel, because the spec models both as nullable and an empty select value
 * cannot be distinguished from a missing one.
 */
export function PolicyEditor({
  policy,
  positions,
  onCancel,
}: {
  policy: TravelPolicy | null;
  positions: Position[];
  /** Shown only when editing, to leave the form without a page reload. */
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(savePolicyAction, null);

  useEffect(() => {
    if (state?.ok) router.refresh();
  }, [state, router]);

  return (
    <form action={formAction} className="flex flex-col gap-md">
      {policy ? <input type="hidden" name="id" value={policy.id} /> : null}

      <Field
        label="Nama kebijakan"
        htmlFor="policy-name"
        required
        error={state && !state.ok ? state.fields?.name : undefined}
      >
        <Input
          id="policy-name"
          name="name"
          defaultValue={policy?.name ?? ""}
          placeholder="Contoh: Perjalanan Domestik Manajer"
          invalid={!!state && !state.ok}
          required
        />
      </Field>

      <Field label="Deskripsi" htmlFor="policy-description">
        <Textarea
          id="policy-description"
          name="description"
          rows={2}
          defaultValue={policy?.description ?? ""}
          placeholder="Ringkasan aturan yang ditampilkan ke pemohon."
        />
      </Field>

      <div className="grid grid-cols-1 gap-md sm:grid-cols-2">
        <Field
          label="Berlaku untuk jabatan"
          htmlFor="policy-position"
          hint="Kosongkan bila berlaku untuk semua jabatan."
        >
          <Select
            id="policy-position"
            name="positionId"
            defaultValue={policy?.positionId ?? 0}
          >
            <option value={0}>Semua jabatan</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tingkat tujuan" htmlFor="policy-tier">
          <Select
            id="policy-tier"
            name="destinationTier"
            defaultValue={policy?.destinationTier ?? "ANY"}
          >
            <option value="ANY">Semua tingkat</option>
            <option value="DOMESTIC">Domestik</option>
            <option value="REGIONAL">Regional</option>
            <option value="INTERNATIONAL">Internasional</option>
          </Select>
        </Field>

        <Field
          label="Batas perkiraan biaya"
          htmlFor="policy-cap"
          hint="Isi 0 bila tidak ada batas. Diterjemahkan menjadi null di server."
        >
          <Input
            id="policy-cap"
            name="maxEstimatedCost"
            type="number"
            min={0}
            step={100_000}
            defaultValue={policy?.maxEstimatedCost ?? 0}
          />
        </Field>

        <Field
          label="Status"
          htmlFor="policy-active"
          hint="Policy nonaktif tidak muncul di form pengajuan."
        >
          <Select
            id="policy-active"
            name="isActive"
            defaultValue={policy?.isActive === false ? "false" : "true"}
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </Select>
        </Field>
      </div>

      <label className="flex items-center gap-2 text-caption text-on-surface-variant">
        <input
          type="checkbox"
          name="requiresDocuments"
          value="true"
          defaultChecked={policy?.requiresDocuments ?? false}
          className="h-4 w-4 accent-[var(--color-primary)]"
        />
        Wajibkan dokumen pendukung saat pengajuan
      </label>

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

      <div className="flex justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Batal
          </Button>
        ) : null}
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan..." : policy ? "Simpan Perubahan" : "Tambah Kebijakan"}
        </Button>
      </div>
    </form>
  );
}
